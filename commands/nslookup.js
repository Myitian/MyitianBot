const { SlashCommandBuilder, CommandInteraction, CommandInteractionOptionResolver, escapeMarkdown } = require("discord.js");
const dns = require("node:dns");
const log = require("../log");
const { formatDateTime } = require("../utils");

/**
 * @param {string} host
 * @returns {Promise<dns.LookupAddress[]>}
 */
function dnsResolve46(host) {
    return new Promise((resolve, reject) => {
        dns.lookup(host, { all: true, order: "verbatim" }, (err, addresses) => {
            if (err) {
                resolve([]);
            } else {
                resolve(addresses);
            }
        });
    })
}
/**
 * @param {string} host
 * @param {"A"|"AAAA"|"CNAME"|"NS"|"PTR"} type 
 * @returns {Promise<string[]>}
 */
function dnsResolveSimple(host, type) {
    return new Promise((resolve, reject) => {
        /** @type {(hostname:string,callback:(err:NodeJS.ErrnoException|null,addresses:string[])=>void)=>void} */
        let dnsResolve = null;
        switch (type) {
            case "A":
                dnsResolve = dns.resolve4;
                break;
            case "AAAA":
                dnsResolve = dns.resolve6;
                break;
            case "CNAME":
                dnsResolve = dns.resolveCname;
                break;
            case "NS":
                dnsResolve = dns.resolveNs;
                break;
            case "PTR":
                dnsResolve = dns.resolvePtr;
                break;
        }
        dnsResolve(host, (err, addresses) => {
            if (err) {
                resolve([]);
            } else {
                resolve(addresses);
            }
        });
    })
}
/**
 * @param {string} host
 * @returns {Promise<dns.MxRecord[]>}
 */
function dnsResolveMx(host) {
    return new Promise((resolve, reject) => {
        dns.resolveMx(host, (err, addresses) => {
            if (err) {
                resolve([]);
            } else {
                resolve(addresses);
            }
        });
    })
}
/**
 * @param {string} host
 * @returns {Promise<string[][]>}
 */
function dnsResolveTxt(host) {
    return new Promise((resolve, reject) => {
        dns.resolveTxt(host, (err, addresses) => {
            if (err) {
                resolve([]);
            } else {
                resolve(addresses);
            }
        });
    })
}
/**
 * @param {string} host
 * @returns {Promise<dns.SrvRecord[]>}
 */
function dnsResolveSrv(host) {
    return new Promise((resolve, reject) => {
        dns.resolveSrv(host, (err, addresses) => {
            if (err) {
                resolve([]);
            } else {
                resolve(addresses);
            }
        });
    })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nslookup")
        .setDescription("DNS查询")
        .addStringOption(option =>
            option.setName("host")
                .setDescription("主机名")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("type")
                .setDescription("类型")
                .addChoices(
                    { name: "A", value: "A" },
                    { name: "AAAA", value: "AAAA" },
                    { name: "ANY", value: "ANY" },
                    { name: "CAA", value: "CAA" },
                    { name: "CNAME", value: "CNAME" },
                    { name: "NAPTR", value: "NAPTR" },
                    { name: "NS", value: "NS" },
                    { name: "MX", value: "MX" },
                    { name: "PTR", value: "PTR" },
                    { name: "SOA", value: "SOA" },
                    { name: "SRV", value: "SRV" },
                    { name: "TXT", value: "TXT" },
                )),
    /** @param {CommandInteraction} interaction */
    async execute(interaction) {
        /** @type {CommandInteractionOptionResolver} */
        // @ts-ignore
        const options = interaction.options;
        await interaction.reply("正在查询……");
        const host = options.getString("host");
        /** @type {"A"|"AAAA"|"ANY"|"CAA"|"CNAME"|"NAPTR"|"NS"|"MX"|"PTR"|"SOA"|"SRV"|"TXT"|null|string} */
        const type = options.getString("type");
        log.log("nslookup", type, host);
        let result = "无结果";
        switch (type) {
            case "A":
            case "AAAA":
            case "CNAME":
            case "NS":
            case "PTR": {
                const dnsResult = await dnsResolveSimple(host, type);
                if (dnsResult.length > 0) {
                    result = dnsResult.join("\n");
                }
                break;
            }
            case "MX": {
                const dnsResult = await dnsResolveMx(host);
                if (dnsResult.length > 0) {
                    result = "";
                    for (const mx of dnsResult) {
                        result += `priority=${mx.priority}, exchange=${mx.exchange}\n`;
                    }
                }
                break;
            }
            case "TXT": {
                const dnsResult = await dnsResolveTxt(host);
                if (dnsResult.length > 0) {
                    result = "";
                    for (const txt of dnsResult) {
                        result += txt.join("\n") + "\n";
                    }
                }
                break;
            }
            case "SRV": {
                const dnsResult = await dnsResolveSrv(host);
                if (dnsResult.length > 0) {
                    result = "";
                    for (const srv of dnsResult) {
                        result += `name=${srv.name}, port=${srv.port}, priority=${srv.priority}, weight=${srv.weight}\n`;
                    }
                }
                break;
            }
            case null: {
                const dnsResult = await dnsResolve46(host);
                if (dnsResult.length > 0) {
                    result = "";
                    for (const r of dnsResult) {
                        result += r.address + "\n";
                    }
                }
                break;
            }
            default:
                result = "尚未实现！";
                break;
        }
        await interaction.editReply(escapeMarkdown(result));
    },
};