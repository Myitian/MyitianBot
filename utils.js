const { randomInt } = require("node:crypto");
const log = require("./log");


const dateTimeFormat = new Intl.DateTimeFormat('zh', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'Asia/Shanghai',
});

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
    }
}