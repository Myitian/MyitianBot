const dns = require("node:dns");
const log = require("../log");

/**
 * @param {string} host
 * @returns {Promise<{name:string,port:number}>}
 */
function dnsResolveSRV(host) {
    return new Promise((resolve, reject) => {
        dns.resolveSrv(host, (err, addresses) => {
            if (err) {
                reject(err);
            } else if (!addresses.length) {
                reject("addresses.length is 0");
            } else {
                resolve({ name: addresses[0].name, port: addresses[0].port });
            }
        });
    })
}

module.exports = {
    /**
     * @param {string} host
     * @param {number|null|undefined} port
     * @returns {Promise<{host:string,port:number}>}
     */
    async resolve(host, port = 25565) {
        if (port === null || port === undefined || Number.isNaN(port))
            port = 25565
        if (port === 25565) {
            try {
                const newHostPort = await dnsResolveSRV("_minecraft._tcp." + host);
                host = newHostPort.name;
                port = newHostPort.port;
            } catch { }
        }
        return ({ host: host, port: port });
    }
}