const axios = require("axios");
const log = require("../log");

/**
 * @typedef {"original"|"regular"|"small"|"thumb"|"mini"} ImageSize
 */
/**
 * @typedef {object} Request
 * @property {0|1|2} [r18=0] 0 为非 R18，1 为 R18，2 为混合（在库中的分类，不等同于作品本身的 R18 标识）
 * @property {number} [num=1] 一次返回的结果数量，范围为1到20；在指定关键字或标签的情况下，结果数量可能会不足指定的数量
 * @property {number[]} [uid] 返回指定uid作者的作品，最多20个
 * @property {string} [keyword] 返回从标题、作者、标签中按指定关键字模糊匹配的结果，大小写不敏感，性能和准度较差且功能单一，建议使用tag代替
 * @property {string[]} [tag] 返回匹配指定标签的作品
 * @property {ImageSize|ImageSize[]} [size="original"] 返回指定图片规格的地址
 * @property {string} [proxy="i.pixiv.re"] 设置图片地址所使用的在线反代服务
 * @property {number} [dateAfter] 返回在这个时间及以后上传的作品；时间戳，单位为毫秒
 * @property {number} [dateBefore] 返回在这个时间及以前上传的作品；时间戳，单位为毫秒
 * @property {boolean} [dsc=false] 禁用对某些缩写keyword和tag的自动转换
 * @property {boolean} [excludeAI=false] 排除 AI 作品
 * @property {string} [aspectRatio] 图片长宽比
 */
/**
 * @typedef {object} Response
 * @property {string} error 错误信息
 * @property {Setu[]} data 色图数组
 * @property {string} [msg] 错误信息之类的
 */
/**
 * @typedef {object} Setu
 * @property {number} pid 作品 pid
 * @property {number} p 作品所在页
 * @property {number} uid 作者 uid
 * @property {string} title 作品标题
 * @property {string} author 作者名（入库时，并过滤掉 @ 及其后内容）
 * @property {boolean} r18 是否 R18（在库中的分类，不等同于作品本身的 R18 标识）
 * @property {number} width 原图宽度 px
 * @property {number} height 原图高度 px
 * @property {string[]} tags 作品标签，包含标签的中文翻译（有的话）
 * @property {string} ext 图片扩展名
 * @property {0|1|2} aiType 是否是 AI 作品，0 未知（旧画作或字段未更新），1 不是，2 是
 * @property {number} uploadDate 作品上传日期；时间戳，单位为毫秒
 * @property {URLs} urls 包含了所有指定size的图片地址
 */
/**
 * @typedef {object} URLs
 * @property {string} [original]
 * @property {string} [regular]
 * @property {string} [small]
 * @property {string} [thumb]
 * @property {string} [mini]
 */

module.exports = {
    /**
     * @param {Request} [request]
     * @returns {Promise<Response>}
     */
    async getJson(request = {}) {
        const search = new URLSearchParams();
        const url = "https://api.lolicon.app/setu/v2"
        log.log("Requesting", url);
        const resp = await axios.post(url, request, { responseType: "json" });
        return resp.data;
    }
}