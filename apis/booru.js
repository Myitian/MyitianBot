const axios = require("axios");
const log = require("../log");
const { sample } = require("../utils");

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
 */
/**
 * @typedef {"danbooru"|"moebooru"|"e621ng"} BooruAPIType
 */

/**
 * @param {string} api
 * @param {string} tags
 * @param {BooruAPIType} type
 * @param {number} limit
 * @param {number} page
 * @returns {Promise<BooruAPIResponse>}
 */
async function get(api, tags, type, limit = 1, page = 1) {
    const url = `${api}?limit=${limit}&page=${page}&tags=${encodeURIComponent(tags)}`;
    log.log("Requesting", url);
    const resp = await axios({
        method: "get",
        url: url,
        responseType: "json"
    });
    return {
        type: type,
        data: resp.data
    };
}
/**
 * @param {string} api
 * @param {string} tags
 * @param {BooruAPIType} type
 * @returns {Promise<number>}
 */
async function getCountByBinarySearch(api, tags, type) {
    let maxPageCount = 1;
    let batchSize = 1;
    switch (type) {
        case "moebooru":
            maxPageCount = 16384;
            batchSize = 100;
            break;
        case "danbooru":
            maxPageCount = 1000;
            batchSize = 200;
            break;
        case "e621ng":
            maxPageCount = 750;
            batchSize = 320;
            break;
    }
    let lo = 1, hi = maxPageCount;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const resp = await get(api, tags, type, batchSize, mid);
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


module.exports = {
    /**
     * @param {string} api
     * @param {string} tags
     * @param {number} num
     * @param {BooruAPIType} type
     * @returns {Promise<BooruAPIResponse>}
     */
    async getRandom(api, tags, num, type) {
        const total = await getCountByBinarySearch(api, tags, type);
        log.log("Total:", total);
        let maxPageCount = 1;
        let maxBatchSize = 1;
        switch (type) {
            case "moebooru":
                maxPageCount = 1000000;
                maxBatchSize = 100;
                break;
            case "danbooru":
                maxPageCount = 1000;
                maxBatchSize = 200;
                break;
            case "e621ng":
                maxPageCount = 750;
                maxBatchSize = 320;
                break;
        }
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
                array[i] = (await get(api, tags, type, tempPageSize, pageIndex + 1)).data[inPageIndex];
            } catch (ex) {
                log.error(ex);
                if (typeof(ex) === "string") {
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
     * @param {string} tags
     * @param {number} num
     * @param {BooruAPIType} type
     * @returns {Promise<BooruAPIResponse>}
     */
    async getNewest(api, tags, num, type) {
        return await get(api, tags, type, num);
    }
}