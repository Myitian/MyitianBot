const { GuildNSFWLevel } = require("discord.js");
const log = require("./log");


const dateTimeFormat = new Intl.DateTimeFormat('zh', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'Asia/Shanghai',
});

module.exports = {
    checkNSFWLevel(level) {
        log.log("NSFW Level:", level);
        return level === GuildNSFWLevel.Explicit || level === GuildNSFWLevel.AgeRestricted;
    },
    /** @param {number|Date} datetime  */
    formatDateTime(datetime) {
        return dateTimeFormat.format(datetime)
    },
    /** @param {number} duration */
    durationToString(duration) {
        const durationH = Math.trunc(duration / 3600000);
        const durationM = Math.trunc(duration / 60000) % 60;
        const durationS = Math.trunc(duration / 1000) % 60;
        return durationH ?
            `${durationH}:${durationM.toString().padStart(2, "0")}:${durationS.toString().padStart(2, "0")}` :
            `${durationM.toString().padStart(2, "0")}:${durationS.toString().padStart(2, "0")}`;
    }
}