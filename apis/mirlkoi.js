const { randomInt } = require("node:crypto");
const axios = require("axios").default;
const log = require("../log");

module.exports = {
    /**
     * @param {string|null|undefined} sort
     * @param {number|null|undefined} num
     * @returns {Promise<{pic:string[]}>}
     */
    async getJson(sort = undefined, num = undefined) {
        const search = new URLSearchParams([
            ["type", "json"]
        ]);

        if (sort !== null && sort !== undefined)
            search.set("sort", sort);
        if (num !== null && num !== undefined)
            search.set("num", num.toString());

        const url = `https://${["", "api.", "dev."][randomInt(3)]}iw233.cn/api.php?${search}`;
        log.log("Requesting", url);

        const resp = await axios({
            method: "get",
            url: url,
            responseType: "json"
        });
        return resp.data;
    }
}