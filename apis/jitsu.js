const axios = require("axios").default;
const log = require("../log");

module.exports = {
    /**
     * @param {string|null|undefined} sort
     * @param {number|null|undefined} num
     * @returns {Promise<{
     *          code:number,
     *          alert:string,
     *          pics:string[]}>}
     */
    async getJson(sort = undefined, num = undefined) {
        const search = new URLSearchParams([
            ["type", "json"],
            ["proxy", "i.pixiv.re"],
            ["size", "original"]
        ]);

        if (sort !== null && sort !== undefined)
            search.set("sort", sort);
        if (num !== null && num !== undefined)
            search.set("num", num.toString());

        const url = "https://moe.jitsu.top/img?" + search.toString();
        log.log("Requesting", url);

        const resp = await axios({
            method: "get",
            url: url,
            responseType: "json"
        });
        return resp.data;
    },
    /**
     * @returns {Promise<{pic:string}>}
     */
    async getSpecialR18Json() {
        const url = "https://moe.jitsu.top/r18/?type=json";
        log.log("Requesting", url);

        const resp = await axios({
            method: "get",
            url: url,
            responseType: "json"
        });
        return resp.data;
    }
}