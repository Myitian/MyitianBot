const { fetchJson } = require("../utils");

/**
 * @typedef {object} Request
 * @property {0|1|2} [r18=0] 0 为非 R18，1 为 R18，2 为混合
 * @property {number} [num=1] 一次返回的结果数量，范围为1到20；在指定关键字的情况下，结果数量可能会不足指定的数量
 * @property {string} [keyword] 若指定关键字，将会返回从插画标题、作者、标签中模糊搜索的结果
 * @property {string} [proxy="i.pixiv.re"] 设置返回的原图链接的域名，你也可以设置为disable来得到真正的原图链接
 * @property {boolean} [size1200=false] 是否使用 master_1200 缩略图，即长或宽最大为 1200px 的缩略图，以节省流量或提升加载速度（某些原图的大小可以达到十几MB）
 */
/**
 * @typedef {object} Response
 * @property {number} code 返回码，可能值详见后续部分
 * @property {string} msg 错误信息之类的
 * @property {number} count 结果数
 * @property {Setu[]} data 色图数组
 * @property {string} [error] 错误信息
 */
/**
 * @typedef {object} Setu
 * @property {number} pid 作品 pid
 * @property {number} p 作品所在页
 * @property {number} uid 作者 uid
 * @property {string} title 作品标题
 * @property {string} author 作者名（入库时，并过滤掉 @ 及其后内容）
 * @property {boolean} r18 是否 R18（在色图库中的分类，并非作者标识的 R18）
 * @property {number} width 原图宽度 px
 * @property {number} height 原图高度 px
 * @property {string[]} tags 作品标签，包含标签的中文翻译（有的话）
 * @property {string} url 图片链接（可能存在有些作品因修改或删除而导致 404 的情况）
 */

module.exports = {
    /**
     * @param {Request} [request]
     * @returns {Promise<Response>}
     */
    async getJson(request = {}) {
        const search = new URLSearchParams();

        if (request.r18 != null) {
            search.set("r18", request.r18.toString());
        }
        if (request.keyword != null) {
            search.set("keyword", request.keyword);
        }
        if (request.num != null) {
            search.set("num", request.num.toString());
        }

        const url = "https://api.lolicon.app/setu/v1?" + search.toString();
        return await fetchJson(url);
    }
}