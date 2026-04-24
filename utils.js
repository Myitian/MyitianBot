const { escapeMarkdown } = require("discord.js");
const { CombinedPropertyError, CombinedError } = require("@sapphire/shapeshift");
const path = require("node:path");
const { randomInt } = require("node:crypto");
const log = require("./log");
const axios = require("axios");
const contentDisposition = require("content-disposition");

const dateTimeFormat = new Intl.DateTimeFormat('zh', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'Asia/Shanghai',
});
/**
 * @param {string} char
 */
function isHex(char) {
    return !Number.isNaN(parseInt(char, 16));
}
/**
 * @param {readonly Error[]} errors
 * @param {string[]} formatted
 * @param {Set<Error>} listed 
 */
function printErrorInternal(errors, formatted, listed, indent = "") {
    for (const e of errors) {
        if (listed.has(e)) {
            continue;
        }
        listed.add(e);
        const line = `${indent}- ${escapeMarkdown(e.name)}: ${escapeMarkdown(e.message)}`;
        formatted.push(line);
        if (e instanceof CombinedError) {
            printErrorInternal(e.errors, formatted, listed, `${indent}  `)
        } else if (e instanceof CombinedPropertyError) {
            printErrorInternal(e.errors.map(it => it[1]), formatted, listed, `${indent}  `)
        }
    }
}

module.exports = {
    sharedData: {
    },
    /**
     * @param {string} url
     */
    async fetchJson(url, checkStatus = true) {
        log.log("Requesting", url);
        const resp = await fetch(url);
        if (!resp.ok) {
            if (checkStatus) {
                throw new Error(`Failed to get ${url} : status code ${resp.status}`);
            } else {
                log.warn(`Failed to get ${url} : status code ${resp.status}`);
            }
        }
        return await resp.json();
    },
    /**
     * @param {readonly Error[]} errors
     */
    printError(...errors) {
        /** @type {string[]} */
        const formatted = [];
        printErrorInternal(errors, formatted, new Set());
        return formatted.join("\n")
    },
    /**
     * @param {string} url
     * @param {*} payload
     */
    async postJson(url, payload, checkStatus = true) {
        log.log("Requesting", url);
        const resp = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        if (!resp.ok) {
            if (checkStatus) {
                throw new Error(`Failed to post ${url} : status code ${resp.status}\npayload:\n${payload}`);
            } else {
                log.warn(`Failed to post ${url} : status code ${resp.status}`);
            }
        }
        return await resp.json();
    },
    /**
     * @param {string} url
     * @param {string} fallbackName
     * @param {readonly (string|null|undefined)[]} headers
     * @returns {Promise<{name:string,data:Buffer}>}
     */
    async getFile(url, fallbackName, headers) {
        const usedHeaders = {};
        for (const header of headers) {
            if (header == null) {
                continue;
            }
            const colon = header.indexOf(":");
            if (colon == -1) {
                continue;
            }
            const key = header.substring(0, colon).trim();
            const value = header.substring(colon + 1).trim();
            usedHeaders[key] = value;
        }
        const fileResp = await axios.get(url, { responseType: "arraybuffer", headers: usedHeaders }
        );
        let name = null;
        const cdHeader = fileResp.headers["Content-Disposition"];
        if (cdHeader) {
            const cd = contentDisposition.parse(cdHeader);
            const cdName = cd.parameters.filename;
            if (cdName) {
                name = cdName;
            }
        }
        if (!name && fileResp.request.res?.responseUrl) {
            const baseName = path.basename(new URL(fileResp.request.res.responseUrl).pathname);
            if (baseName) {
                name = baseName;
            }
        }
        if (!name) {
            const baseName = path.basename(new URL(url).pathname);
            if (baseName) {
                name = baseName;
            }
        }
        return {
            name: name ?? fallbackName,
            data: fileResp.data
        };
    },
    /**
     * @param {string} str
     * @param {string} separator
     * @param {number} limit
     */
    splitWithTail(str, separator, limit) {
        const result = [];
        let currentIndex = 0;
        while (result.length < limit - 1) {
            const foundIndex = str.indexOf(separator, currentIndex);
            if (foundIndex === -1) {
                break;
            }
            result.push(str.slice(currentIndex, foundIndex));
            currentIndex = foundIndex + separator.length;
        }
        result.push(str.slice(currentIndex));
        return result;
    },
    /**
     * @param {number|Date} datetime
     */
    formatDateTime(datetime) {
        return dateTimeFormat.format(datetime)
    },
    /**
     * @param {number} duration
     */
    durationToString(duration) {
        const durationH = Math.trunc(duration / 3600000);
        const durationM = Math.trunc(duration / 60000) % 60;
        const durationS = Math.trunc(duration / 1000) % 60;
        return durationH ?
            `${durationH}:${durationM.toString().padStart(2, "0")}:${durationS.toString().padStart(2, "0")}` :
            `${durationM.toString().padStart(2, "0")}:${durationS.toString().padStart(2, "0")}`;
    },
    /**
     * @param {number} min Min value (inclusive)
     * @param {number} max Max value (exclusive)
     * @param {number} k
     * @returns {number[]}
     */
    sample(min, max, k) {
        const k2 = max - min;
        if (k2 <= 0 || k <= 0) {
            return [];
        } else if (k2 < k) {
            k = k2;
        }
        const result = new Array(k);
        const remap = {};
        /** @param {number} i */
        function get(i) {
            return i in remap ? remap[i] : i;
        }
        for (let i = 0; i < k; i++) {
            const r = randomInt(min, max);
            const v = get(r);
            remap[r] = get(--max);
            result[i] = v;
        }
        return result;
    },
    /**
     * @param {number} bytes
     */
    fileSizeToString(bytes) {
        if (bytes < 1024) {
            return `${bytes} B`;
        } else if (bytes < 1048576) {
            return `${(bytes / 1024).toFixed(2)} KiB`;
        } else if (bytes < 1073741824) {
            return `${(bytes / 1048576).toFixed(2)} MiB`;
        } else if (bytes < 1099511627776) {
            return `${(bytes / 1073741824).toFixed(2)} GiB`;
        } else {
            return `${(bytes / 1099511627776).toFixed(2)} TiB`;
        }
    },
    /**
     * @param {string} str
     * @returns {string}
     */
    escapeCSharpString(str) {
        const result = [];
        let escaping = "";
        let escapeBody = "";
        for (const char of str) {
            switch (escaping) {
                case "\\":
                    switch (char) {
                        case "'":
                            result.push("'");
                            escaping = "";
                            continue;
                        case "\"":
                            result.push("\"");
                            escaping = "";
                            continue;
                        case "\\":
                            result.push("\\");
                            escaping = "";
                            continue;
                        case "0":
                            result.push("\0");
                            escaping = "";
                            continue;
                        case "a":
                            result.push("\x07");
                            escaping = "";
                            continue;
                        case "b":
                            result.push("\b");
                            escaping = "";
                            continue;
                        case "e":
                            result.push("\x1B");
                            escaping = "";
                            continue;
                        case "f":
                            result.push("\f");
                            escaping = "";
                            continue;
                        case "n":
                            result.push("\n");
                            escaping = "";
                            continue;
                        case "r":
                            result.push("\r");
                            escaping = "";
                            continue;
                        case "t":
                            result.push("\t");
                            escaping = "";
                            continue;
                        case "v":
                            result.push("\v");
                            escaping = "";
                            continue;
                        case "u":
                            escapeBody = "";
                            escaping = "\\u";
                            continue;
                        case "U":
                            escapeBody = "";
                            escaping = "\\U";
                            continue;
                        case "x":
                            escapeBody = "";
                            escaping = "\\x";
                            continue;
                        default:
                            return "无法识别的转义序列：\\" + char;
                    }
                case "\\u":
                    if (!isHex(char)) {
                        return "无法识别的转义序列：\\u";
                    } else {
                        escapeBody += char;
                        escaping = "\\uH";
                        continue;
                    }
                case "\\uH":
                    if (!isHex(char)) {
                        return "无法识别的转义序列：\\u" + escapeBody;
                    } else {
                        escapeBody += char;
                        escaping = "\\uHH";
                        continue;
                    }
                case "\\uHH":
                    if (!isHex(char)) {
                        return "无法识别的转义序列：\\u" + escapeBody;
                    } else {
                        escapeBody += char;
                        escaping = "\\uHHH";
                        continue;
                    }
                case "\\uHHH":
                    if (!isHex(char)) {
                        return "无法识别的转义序列：\\u" + escapeBody;
                    } else {
                        escapeBody += char;
                        escaping = "\\uHHHH";
                        continue;
                    }
                case "\\uHHHH":
                    result.push(String.fromCharCode(parseInt(escapeBody, 16)));
                    escaping = "";
                    break;
                case "\\U":
                    if (char !== "0") {
                        return "无法识别的转义序列：\\U";
                    } else {
                        escaping = "\\U0";
                        continue;
                    }
                case "\\U0":
                    if (char !== "0") {
                        return "无法识别的转义序列：\\U0";
                    } else {
                        escaping = "\\U00";
                        continue;
                    }
                case "\\U00":
                    if (!isHex(char)) {
                        return "无法识别的转义序列：\\U00";
                    } else {
                        escapeBody += char;
                        escaping = "\\U00H";
                        continue;
                    }
                case "\\U00H":
                    if (!isHex(char)) {
                        return "无法识别的转义序列：\\U00" + escapeBody;
                    } else {
                        escapeBody += char;
                        escaping = "\\U00HH";
                        continue;
                    }
                case "\\U00HH":
                    if (!isHex(char)) {
                        return "无法识别的转义序列：\\U00" + escapeBody;
                    } else {
                        escapeBody += char;
                        escaping = "\\U00HHH";
                        continue;
                    }
                case "\\U00HHH":
                    if (!isHex(char)) {
                        return "无法识别的转义序列：\\U00" + escapeBody;
                    } else {
                        escapeBody += char;
                        escaping = "\\U00HHHH";
                        continue;
                    }
                case "\\U00HHHH":
                    if (!isHex(char)) {
                        return "无法识别的转义序列：\\U00" + escapeBody;
                    } else {
                        escapeBody += char;
                        escaping = "\\U00HHHHH";
                        continue;
                    }
                case "\\U00HHHHH":
                    if (!isHex(char)) {
                        return "无法识别的转义序列：\\U00" + escapeBody;
                    } else {
                        escapeBody += char;
                        escaping = "\\U00HHHHHH";
                        continue;
                    }
                case "\\U00HHHHHH":
                    const codePoint = parseInt(escapeBody, 16);
                    if (codePoint > 0x10FFFF) {
                        return "无法识别的转义序列：\\U00" + escapeBody;
                    }
                    result.push(String.fromCodePoint(codePoint));
                    escaping = "";
                    break;
                case "\\x":
                    if (!isHex(char)) {
                        return "无法识别的转义序列：\\x";
                    } else {
                        escapeBody += char;
                        escaping = "\\xH";
                        continue;
                    }
                case "\\xH":
                    if (!isHex(char)) {
                        result.push(String.fromCharCode(parseInt(char, 16)));
                        escaping = "";
                        break;
                    } else {
                        escapeBody += char;
                        escaping = "\\xHH";
                        continue;
                    }
                case "\\xHH":
                    if (!isHex(char)) {
                        result.push(String.fromCharCode(parseInt(escapeBody, 16)));
                        escaping = "";
                        break;
                    } else {
                        escapeBody += char;
                        escaping = "\\xHHH";
                        continue;
                    }
                case "\\xHHH":
                    if (!isHex(char)) {
                        result.push(String.fromCharCode(parseInt(escapeBody, 16)));
                        escaping = "";
                        break;
                    } else {
                        escapeBody += char;
                        escaping = "\\xHHHH";
                        continue;
                    }
                case "\\xHHHH":
                    result.push(String.fromCharCode(parseInt(escapeBody, 16)));
                    escaping = "";
                    break;
            }
            if (char === "\\") {
                escaping = "\\";
            } else {
                result.push(char);
            }
        }
        switch (escaping) {
            case "\\":
                return "无法识别的转义序列：\\";
            case "\\u":
                return "无法识别的转义序列：\\u";
            case "\\uH":
                return "无法识别的转义序列：\\u" + escapeBody;
            case "\\uHH":
                return "无法识别的转义序列：\\u" + escapeBody;
            case "\\uHHH":
                return "无法识别的转义序列：\\u" + escapeBody;
            case "\\uHHHH":
                result.push(String.fromCharCode(parseInt(escapeBody, 16)));
                break;
            case "\\U":
                return "无法识别的转义序列：\\U";
            case "\\U0":
                return "无法识别的转义序列：\\U0";
            case "\\U00":
                return "无法识别的转义序列：\\U00";
            case "\\U00H":
                return "无法识别的转义序列：\\U00" + escapeBody;
            case "\\U00HH":
                return "无法识别的转义序列：\\U00" + escapeBody;
            case "\\U00HHH":
                return "无法识别的转义序列：\\U00" + escapeBody;
            case "\\U00HHHH":
                return "无法识别的转义序列：\\U00" + escapeBody;
            case "\\U00HHHHH":
                return "无法识别的转义序列：\\U00" + escapeBody;
            case "\\U00HHHHHH":
                const codePoint = parseInt(escapeBody, 16);
                if (codePoint > 0x10FFFF) {
                    return "无法识别的转义序列：\\U00" + escapeBody;
                }
                result.push(String.fromCodePoint(codePoint));
                break;
            case "\\x":
                return "无法识别的转义序列：\\x";
            case "\\xH":
                result.push(String.fromCharCode(parseInt(escapeBody, 16)));
                break;
            case "\\xHH":
                result.push(String.fromCharCode(parseInt(escapeBody, 16)));
                break;
            case "\\xHHH":
                result.push(String.fromCharCode(parseInt(escapeBody, 16)));
                break;
            case "\\xHHHH":
                result.push(String.fromCharCode(parseInt(escapeBody, 16)));
                break;
        }
        return result.join("");
    }
}