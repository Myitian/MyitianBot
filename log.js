const { formatDateTime } = require("./utils");

module.exports = {
    log(...params) {
        console.log(`[${formatDateTime(new Date())}] [INFO]`, ...params)
    },
    warn(...params) {
        console.warn(`[${formatDateTime(new Date())}] [WARN]`, ...params)
    },
    error(...params) {
        console.error(`[${formatDateTime(new Date())}] [ERROR]`, ...params)
    }
}