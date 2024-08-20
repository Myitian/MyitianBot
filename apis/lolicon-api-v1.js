const axios = require("axios").default;
const log = require("../log");

module.exports = {
    /**
     * @param {number|null|undefined} r18
     * @param {string|null|undefined} keyword
     * @param {number|null|undefined} num
     * @returns {Promise<{
     *          code:number?,
     *          msg:string?,
     *          count:number?,
     *          error:string?,
     *          data:{
     *          pid:number,
     *          p:number,
     *          uid:number,
     *          title:string,
     *          author:string,
     *          r18:boolean,
     *          width:number,
     *          height:number,
     *          tags:string[],
     *          url:string}[]?}>}
     */
    async getJson(r18 = undefined, keyword = undefined, num = undefined) {
        const search = new URLSearchParams();

        if (r18 !== null && r18 !== undefined)
            search.set("r18", r18.toString());
        if (keyword !== null && keyword !== undefined)
            search.set("keyword", keyword);
        if (num !== null && num !== undefined)
            search.set("num", num.toString());

        const url = "https://api.lolicon.app/setu/v1?" + search.toString();
        log.log("Requesting", url);

        const resp = await axios({
            method: "get",
            url: url,
            responseType: "json"
        });
        return resp.data;
    }
}