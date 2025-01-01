const dateTimeFormat = new Intl.DateTimeFormat('zh', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'Asia/Shanghai',
});
/**
 * @param {number | Date} date
 */
function formatDateTime(date) {
    return dateTimeFormat.format(date);
}

module.exports = {
    /** @param {Array} params */
    log(...params) {
        console.info(`[${formatDateTime(new Date())}] [INFO]`, ...params)
    },
    /** @param {Array} params */
    warn(...params) {
        console.warn(`[${formatDateTime(new Date())}] [WARN]`, ...params)
    },
    /** @param {Array} params */
    error(...params) {
        console.error(`[${formatDateTime(new Date())}] [ERROR]`, ...params)
    },
    /** @param {Array} params */
    chat(...params) {
        console.log(`[${formatDateTime(new Date())}] [CHAT]`, ...params)
    }
}