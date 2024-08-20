const axios = require("axios").default;
const log = require("../log");

module.exports = {
    /**
     * @param {number|null|undefined} r18
     * @param {string|null|undefined} keyword
     * @param {number|null|undefined} num
     * @param {number|null|undefined} db
     * @returns {Promise<{
     *          pid:number,
     *          page:number,
     *          uid:number,
     *          title:string,
     *          user:string,
     *          r18:boolean,
     *          width:number,
     *          height:number,
     *          tags:string[],
     *          url:string}[]}>}
     */
    async getJson(r18 = undefined, keyword = undefined, num = undefined, db = undefined) {
        const search = new URLSearchParams();

        if (r18 !== null && r18 !== undefined)
            search.set("r18", r18.toString());
        if (keyword !== null && keyword !== undefined)
            search.set("keyword", keyword);
        if (num !== null && num !== undefined)
            search.set("num", num.toString());
        if (db !== null && db !== undefined)
            search.set("db", db.toString());

        const url = "https://image.anosu.top/pixiv/json?" + search.toString();
        log.log("Requesting", url);

        const resp = await axios({
            method: "get",
            url: url,
            responseType: "json"
        });
        return resp.data;
    }
}