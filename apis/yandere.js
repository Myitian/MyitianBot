const { randomInt } = require("node:crypto");
const axios = require("axios").default;
const log = require("../log");
const { sample } = require("../utils");

/**
 * @param {string} tags
 * @param {number} limit
 * @param {number} page
 * @returns {Promise<{
 *          id:number,
 *          tags:string,
 *          updated_at:number,
 *          score:number,
 *          file_size:number,
 *          file_ext:string,
 *          file_url:string,
 *          sample_url:string,
 *          rating:string,
 *          width:number,
 *          height:number}[]>}
 */
async function get(tags, limit = 1, page = 1) {
    const url = `https://yande.re/post.json?tags=${tags}&limit=${limit}&page=${page}`;
    log.log("Requesting", url);
    const resp = await axios({
        method: "get",
        url: url,
        responseType: "json"
    });
    return resp.data;
}
/**
 * @param {string} tags
 * @returns {Promise<number>}
 */
async function getCountByBinarySearch(tags) {
    const batchSize = 100;
    let lo = 1, hi = 16384;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const resp = await get(tags, batchSize, mid);
        log.log(lo, mid, hi, resp.length);
        if (!resp.length) {
            hi = mid - 1;
        } else if (resp.length < batchSize) {
            return (mid - 1) * batchSize + resp.length;
        } else {
            lo = mid + 1;
        }
    }
    return hi * batchSize;
}


module.exports = {
    /**
     * @param {string} tags
     * @param {number} num
     * @returns {Promise<{
     *          id:number,
     *          tags:string,
     *          updated_at:number,
     *          score:number,
     *          file_size:number,
     *          file_ext:string,
     *          file_url:string,
     *          sample_url:string,
     *          rating:string,
     *          width:number,
     *          height:number}[]>}
     */
    async getRandom(tags, num) {
        let total = await getCountByBinarySearch(tags);
        log.log("Total:", total);
        if (total > 1000000) {
            total = 1000000;
        }
        const pages = sample(1, total + 1, num);
        const result = new Array(pages.length);
        for (let i = 0; i < pages.length; i++) {
            log.log("Pick index", pages[i]);
            result[i] = await get(tags, 1, pages[i]);
        }
        return result;
    },
    /**
     * @param {string} tags
     * @param {number} num
     * @returns {Promise<{
     *          id:number,
     *          tags:string,
     *          updated_at:number,
     *          score:number,
     *          file_size:number,
     *          file_ext:string,
     *          file_url:string,
     *          sample_url:string,
     *          rating:string,
     *          width:number,
     *          height:number}[]>}
     */
    async getNewest(tags, num) {
        return await get(tags, num);
    }
}