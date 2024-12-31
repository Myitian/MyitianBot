const axios = require("axios");
const log = require("./../log");
const { cloudflare } = require("./../config.json");

const apiUrl = 'https://api.cloudflare.com/client/v4'
const headers = {
    'Authorization': `Bearer ${cloudflare.token}`,
    'Content-Type': 'application/json',
};
const idCache = {};

async function getID(endpoint) {
    try {
        // Check if the result is already in the cache
        if (idCache[endpoint]) {
            return idCache[endpoint];
        }
        // Make a request if not in cache
        const response = await axios.get(`${apiUrl}${endpoint}`, { headers });
        const dataId = response.data.result[0].id;
        log.log(`${endpoint} id was successfully get ${dataId}`);
        // Store the result in the cache
        idCache[endpoint] = dataId;

        return dataId;
    } catch (error) {
        throw new Error(`An error occurred on get id of ${endpoint}:`, error);
    }
}
async function getZoneID(domain) {
    const ZoneID = await getID(`/zones/?name=${domain}`)
    return ZoneID
}
async function getRecordID(domain, subdomain) {
    const zoneID = await getZoneID(domain);
    const recordID = await getID(`/zones/${zoneID}/dns_records?name=${subdomain}`);
    return recordID;
}

module.exports = {
    /**
     * @param {string} newIP 
     */
    async updateDns(newIP) {
        const domain = cloudflare.domain;
        const zoneID = await getZoneID(domain);

        for (const record of cloudflare.records) {
            const recordID = await getRecordID(domain, record);

            try {
                const url = `${apiUrl}/zones/${zoneID}/dns_records/${recordID}`;
                log.log("Requesting", url);
                await axios.patch(url, { content: newIP }, { headers });
            } catch (e) {
                const error = e instanceof Error ? e : new Error(e);
                log.error(error);
            }
        }
    }
}