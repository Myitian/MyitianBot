const dateTimeFormat = new Intl.DateTimeFormat('zh', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'Asia/Shanghai',
});
function formatDateTime(date) {
    return dateTimeFormat.format(date);
}

module.exports = {
    log(...params) {
        console.info(`[${formatDateTime(new Date())}] [INFO]`, ...params)
    },
    warn(...params) {
        console.warn(`[${formatDateTime(new Date())}] [WARN]`, ...params)
    },
    error(...params) {
        console.error(`[${formatDateTime(new Date())}] [ERROR]`, ...params)
    },
    chat(...params) {
        console.log(`[${formatDateTime(new Date())}] [CHAT]`, ...params)
    }
}