const { LRUCache } = require("lru-cache");
const log = require("../log");
const { fetchJson, sample, default: utils } = require("../utils");

/**
 * @typedef {object} DanBooruResponse
 * @property {"danbooru"} type
 * @property {DanBooruItem[]} data
 * 
 * @typedef {object} DanBooruItem
 * @property {number} id
 * @property {string} rating
 * @property {string} updated_at
 * @property {number} score
 * @property {string} tag_string
 * 
 * @property {string} md5
 * @property {number} file_size
 * @property {string} file_ext
 * @property {string} file_url
 * @property {number} image_width
 * @property {number} image_height
 * 
 * @property {string} large_file_url
 */
/**
 * @typedef {object} MoeBooruResponse
 * @property {"moebooru"} type
 * @property {MoeBooruItem[]} data
 * 
 * @typedef {object} MoeBooruItem
 * @property {number} id
 * @property {string} rating
 * @property {number} updated_at
 * @property {number} score
 * @property {string} tags
 * 
 * @property {string} md5
 * @property {number} file_size
 * @property {string} file_ext
 * @property {string} file_url
 * @property {number} width
 * @property {number} height
 * 
 * @property {string} sample_url
 */
/**
 * @typedef {object} E621NGResponse
 * @property {"e621ng"} type
 * @property {E621NGItem[]} data
 * 
 * @typedef {object} E621NGItem
 * @property {number} id
 * @property {string} rating
 * @property {string} updated_at
 * @property {{
 *                up: number,
 *                down: number,
 *                total: number
 *           }} score
 * @property {Object.<string,string[]>} tags
 * 
 * @property {{
 *                width: number,
 *                height: number,
 *                ext: string,
 *                size: number,
 *                md5: string,
 *                url: string
 *           }} file
 * @property {{url: string}} sample
 */

/**
 * @typedef {DanBooruResponse|MoeBooruResponse|E621NGResponse} BooruAPIResponse
 *
 * @typedef {"danbooru"|"moebooru"|"e621ng"} BooruAPIType
 */

/**
 * @type {LRUCache<string, number, unknown>}
 */
const LRU_CACHE = new LRUCache({
    max: 256,
    ttl: 1000 * 60 * 10,
    allowStale: true,
    fetchMethod: (key, _staleValue, _options) => {
        const args = utils.splitWithTail(key, "\0", 3);
        // @ts-ignore
        return getCountByBinarySearch(args[0], args[1], args[2]);
    }
});
const SITE_CONFIG = {
    "moebooru": {
        binarySearchMaxPageCount: 16384,
        maxPageCount: 1000000,
        maxBatchSize: 100,
    },
    "danbooru": {
        binarySearchMaxPageCount: 5,
        maxPageCount: 1000,
        maxBatchSize: 200,
    },
    "e621ng": {
        binarySearchMaxPageCount: 3,
        maxPageCount: 750,
        maxBatchSize: 320,
    },
}

/**
 * @param {string} api
 * @param {BooruAPIType} type
 * @param {string} tags
 * @param {number} limit
 * @param {number} page
 * @returns {Promise<BooruAPIResponse>}
 */
async function get(api, type, tags, limit = 1, page = 1) {
    const url = `${api}?limit=${limit}&page=${page}&tags=${encodeURIComponent(tags)}`;
    return {
        type: type,
        data: await fetchJson(url)
    };
}
/**
 * @param {string} api
 * @param {BooruAPIType} type
 * @param {string} tags
 * @returns {Promise<number>}
 */
async function getCountByBinarySearch(api, type, tags) {
    const config = SITE_CONFIG[type];
    const batchSize = config.maxBatchSize;
    let lo = 1, hi = config.binarySearchMaxPageCount;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const resp = await get(api, type, tags, batchSize, mid);
        log.log(lo, mid, hi, resp.data.length);
        if (!resp.data.length) {
            hi = mid - 1;
        } else if (resp.data.length < batchSize) {
            return (mid - 1) * batchSize + resp.data.length;
        } else {
            lo = mid + 1;
        }
    }
    return hi * batchSize;
}
async function getCachedCountByBinarySearch(api, tags, type) {
    return await LRU_CACHE.fetch(`${api}\0${type}\0${tags}`);
}

module.exports = {
    /**
     * @param {string} api
     * @param {BooruAPIType} type
     * @param {string} tags
     * @param {number} num
     * @returns {Promise<BooruAPIResponse>}
     */
    async getRandom(api, type, tags, num) {
        const total = await getCachedCountByBinarySearch(api, type, tags);
        if (total == undefined) {
            throw new Error(`Cannot get CachedCountByBinarySearch for ${api}, ${type}, ${tags}`);
        }
        log.log("Total:", total);
        const config = SITE_CONFIG[type];
        const maxPageCount = config.maxPageCount;
        const maxBatchSize = config.maxBatchSize;
        const pages = sample(0, total, num);
        const array = new Array(pages.length);
        for (let i = 0; i < pages.length; i++) {
            const index = pages[i];
            const tempPageSize = Math.max(1, Math.ceil(index / maxPageCount));
            const pageIndex = Math.floor(index / tempPageSize);
            const inPageIndex = index % tempPageSize;
            log.log("Pick index", index, "with in-page index", inPageIndex);
            if (tempPageSize > maxBatchSize) {
                throw Error("tempPageSize > maxBatchSize");
            }
            try {
                array[i] = (await get(api, type, tags, tempPageSize, pageIndex + 1)).data[inPageIndex];
            } catch (ex) {
                log.error(ex);
                if (typeof (ex) === "string") {
                    array[i] = ex;
                } else if (ex instanceof Error) {
                    array[i] = `${ex.name}: ${ex.message}`;
                }
            }
        }
        return {
            type: type,
            data: array
        };
    },
    /**
     * @param {string} api
     * @param {BooruAPIType} type
     * @param {string} tags
     * @param {number} num
     * @returns {Promise<BooruAPIResponse>}
     */
    async getNewest(api, type, tags, num) {
        return await get(api, type, tags, num);
    }
}