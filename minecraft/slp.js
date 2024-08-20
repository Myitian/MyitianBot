const axios = require("axios").default;
const log = require("../log");
const address_resolver = require("./address-resolver");
const { webSLP } = require("../config.json");

module.exports = {
    /**
     * @param {string} host
     * @param {number|null|undefined} port
     * @returns {Promise<{version:{name:string,protocol:number},favicon:string?,description:string?,players:{max:number,online:number}}>}
     */
    async serverListPing(host, port = 25565) {
        const address = await address_resolver.resolve(host, port);
        const url = `${webSLP}${address.host}:${address.port}`;
        log.log("Requesting", url);
        const resp = await axios({
            method: "get",
            url: url,
            responseType: "json"
        });
        return resp.data;
    }
}