const { randomInt } = require("node:crypto");
const log = require("./log");


const dateTimeFormat = new Intl.DateTimeFormat('zh', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'Asia/Shanghai',
});
function isHex(char) {
    return !Number.isNaN(parseInt(char, 16));
}

module.exports = {
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
        function get(i) {
            if (i in remap) {
                return remap[i];
            } else {
                return i;
            }
        }
        for (let i = 0; i < k; i++) {
            const r = randomInt(min, max);
            const v = get(r);
            remap[r] = get(--max);
            result[i] = v;
        }
        return result;
    },
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