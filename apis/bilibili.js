const axios = require("axios").default;
const { JSDOM } = require("jsdom");
const log = require("../log");

module.exports = {
    /**
     * @param {string|number|undefined|null} aid
     * @param {string|undefined|null} bvid
     * @returns {Promise<{
     *          code:number,
     *          message:string,
     *          title:string,
     *          description:string,
     *          cover:string,
     *          bvid:string,
     *          pubdate:number,
     *          tname:string,
     *          duration:number,
     *          view:number,
     *          danmaku:number,
     *          like:number,
     *          coin:number,
     *          favorite:number,
     *          authorName:string,
     *          authorID:number,
     *          authorAvater:string,
     *          }?>}
     */
    async getVID(aid = undefined, bvid = undefined) {
        if (!(aid || bvid))
            return null;

        const search = new URLSearchParams();
        if (aid)
            search.set("aid", aid.toString());
        if (bvid)
            search.set("bvid", bvid);
        const url = `https://api.bilibili.com/x/web-interface/view?${search}`;
        log.log("Requesting", url);
        const json = (await axios({
            method: "get",
            url: url,
            responseType: "json"
        })).data;
        return {
            code: json.code,
            message: json.message,
            title: json.data?.title,
            description: json.data?.desc,
            cover: json.data?.pic,
            bvid: json.data?.bvid,
            pubdate: json.data?.pubdate,
            tname: json.data?.tname,
            duration: json.data?.duration,
            view: json.data?.stat?.view,
            danmaku: json.data?.stat?.danmaku,
            like: json.data?.stat?.like,
            coin: json.data?.stat?.coin,
            favorite: json.data?.stat?.favorite,
            authorName: json.data?.owner?.name,
            authorID: json.data?.owner?.mid,
            authorAvater: json.data?.owner?.face
        };
    },
    /**
     * @param {string|number} mcid
     * @returns {Promise<{
     *          code:number,
     *          message:string,
     *          title:string,
     *          description:string,
     *          authors:string[],
     *          styles:string[],
     *          horizontalCover:string,
     *          verticalCover:string,
     *          id:number,
     *          renewalTime:string,
     *          lastShortTitle:string,
     *          total:number,
     *          tags:string[],
     *          }?>}
     */
    async getMC(mcid) {
        const url = "https://manga.bilibili.com/twirp/comic.v1.Comic/ComicDetail?device=pc";
        log.log("Requesting", url);
        const json = (await axios({
            method: "post",
            url: url,
            responseType: "json",
            data: { comic_id: mcid },
            headers: { "Origin": "manga.bilibili.com" }
        })).data;
        const tags = [];
        for (const tag of json.data?.tags) {
            tags.push(tag.name);
        }
        return {
            code: json.code,
            message: json.msg,
            title: json.data?.title,
            description: json.data?.evaluate,
            authors: json.data?.author_name,
            styles: json.data?.styles,
            horizontalCover: json.data?.horizontal_cover,
            verticalCover: json.data?.vertical_cover,
            id: json.data?.id,
            renewalTime: json.data?.renewal_time,
            lastShortTitle: json.data?.last_short_title,
            total: json.data?.total,
            tags: tags
        };
    },
    /**
     * @param {string|number} mdid
     * @returns {Promise<{
     *          typeName:string,
     *          title:string,
     *          description:string,
     *          cover:string,
     *          mdid:number,
     *          releaseDate:string,
     *          timeLength:string,
     *          ratingCount:number,
     *          ratingScore:number,
     *          views:number,
     *          seriesFollow:number,
     *          danmakus:number
     *      }?>}
     */
    async getMD(mdid) {
        const url = `https://www.bilibili.com/bangumi/media/md${mdid}`;
        log.log("Requesting", url);
        const dom = await JSDOM.fromURL(url);
        for (const script of dom.window.document.body.getElementsByTagName("script")) {
            if (!script.innerHTML.includes("window.__INITIAL_STATE__="))
                continue;
            const content = script.innerHTML;
            const left = content.indexOf("{");
            const right = content.lastIndexOf("};");
            const json = content.substring(left, right + 1);
            const info = JSON.parse(json);
            return {
                typeName: info.mediaInfo.type_name,
                title: info.mediaInfo.title,
                description: info.mediaInfo.evaluate,
                cover: info.mediaInfo.cover,
                mdid: info.mediaInfo.media_id,
                releaseDate: info.mediaInfo.publish.release_date_show,
                timeLength: info.mediaInfo.publish.time_length_show,
                ratingCount: info.mediaInfo.rating?.count,
                ratingScore: info.mediaInfo.rating?.score,
                views: info.mediaInfo.stat.views,
                seriesFollow: info.mediaInfo.stat.series_follow,
                danmakus: info.mediaInfo.stat.danmakus
            }
        }
        return null;
    },
    /**
     * @param {string|number} mdid
     * @param {boolean|undefined} isCheese 
     * @returns {Promise<{
     *          isCheese:boolean,
     *          code:number,
     *          message:string,
     *          title:string,
     *          description:string,
     *          cover:string,
     *          id:number,
     *          bvid:string,
     *          pubtime:number,
     *          duration:number,
     *          view:number,
     *          danmaku:number,
     *          favorites:number,
     *          like:number,
     *          coin:number,
     *          favorite:number,
     *          typeName:string
     *      }?>}
     */
    async getEP(epid, isCheese = undefined) {
        while (!isCheese) {
            const jsonUrl = `https://api.bilibili.com/pgc/season/episode/web/info?ep_id=${epid}`;
            const jsonUrl2 = `https://api.bilibili.com/pgc/view/web/season?ep_id=${epid}`;
            const jsonUrl3 = `https://api.bilibili.com/pgc/view/web/ep/list?ep_id=${epid}`;
            log.log("Requesting", jsonUrl);
            const info = (await axios({
                method: "get",
                url: jsonUrl,
                responseType: "json"
            })).data;
            if (info.code) {
                if (isCheese === false)
                    return { code: info.code, message: info.message };
                break;
            }
            log.log("Requesting", jsonUrl2);
            const info2 = (await axios({
                method: "get",
                url: jsonUrl2,
                responseType: "json"
            })).data;
            const jsonUrlMD = `https://api.bilibili.com/pgc/review/user?media_id=${info2.result?.media_id}`;
            log.log("Requesting", jsonUrlMD);
            const infoMD = (await axios({
                method: "get",
                url: jsonUrlMD,
                responseType: "json"
            })).data;
            log.log("Requesting", jsonUrl3);
            const info3 = (await axios({
                method: "get",
                url: jsonUrl3,
                responseType: "json"
            })).data;
            function extractData(ep) {
                return {
                    isCheese: false,
                    code: info.code,
                    message: info.message,
                    title: ep.share_copy,
                    description: info2.result?.evaluate,
                    cover: ep.cover,
                    id: ep.id,
                    bvid: ep.bvid,
                    pubtime: ep.pub_time,
                    duration: ep.duration,
                    view: info.data?.stat?.view,
                    danmaku: info.data?.stat?.dm,
                    favorites: info2.result?.stat?.favorites,
                    like: info.data?.stat?.like,
                    coin: info.data?.stat?.coin,
                    favorite: info.data?.stat?.favorite,
                    typeName: infoMD.result?.media?.type_name
                }
            }
            for (const ep of info3.result.episodes) {
                if (ep.id != epid)
                    continue;
                return extractData(ep);
            }
            for (const section of info3.result.section) {
                for (const ep of section.episodes) {
                    if (ep.id != epid)
                        continue;
                    return extractData(ep);
                }
            }
            return null;
        }
        if (isCheese !== false) {

        }
        return null;
    }
}