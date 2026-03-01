const { fetchJson } = require("../utils");

module.exports = {
    /**
     * @param {string|null|undefined} sort
     * @param {number|null|undefined} num
     * @returns {Promise<{pic:string[]}>}
     */
    async getJson(sort = undefined, num = undefined) {
        const search = new URLSearchParams([["type", "json"]]);
        if (sort !== null && sort !== undefined)
            search.set("sort", sort);
        if (num !== null && num !== undefined)
            search.set("num", num.toString());
        const url = `https://cnmiw.com/api.php?${search}`;
        return await fetchJson(url);
    }
}