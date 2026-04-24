const axios = require("axios");
const { JSDOM } = require("jsdom");
const log = require("../log");

const ZONE_MAP = {
    // 动画
    1: "动画",
    24: "MAD·AMV",
    25: "MMD·3D",
    47: "同人·手书",
    257: "配音",
    210: "手办·模玩",
    86: "特摄",
    253: "动漫杂谈",
    27: "综合",
    // 番剧
    13: "番剧",
    51: "资讯",
    152: "官方延伸",
    32: "完结动画",
    33: "连载动画",
    // 国创
    167: "国创",
    153: "国产动画",
    168: "国产原创相关",
    169: "布袋戏",
    170: "资讯",
    195: "动态漫·广播剧",
    // 音乐
    3: "音乐",
    28: "原创音乐",
    29: "音乐现场",
    31: "翻唱",
    59: "演奏",
    243: "乐评盘点",
    30: "VOCALOID·UTAU",
    193: "MV",
    266: "音乐粉丝饭拍",
    265: "AI音乐",
    267: "电台",
    244: "音乐教学",
    130: "音乐综合",
    194: "电音",
    // 舞蹈
    129: "舞蹈",
    20: "宅舞",
    198: "街舞",
    199: "明星舞蹈",
    200: "国风舞蹈",
    255: "颜值·网红舞",
    154: "舞蹈综合",
    156: "舞蹈教程",
    // 游戏
    4: "游戏",
    17: "单机游戏",
    171: "电子竞技",
    172: "手机游戏",
    65: "网络游戏",
    173: "桌游棋牌",
    121: "GMV",
    136: "音游",
    19: "Mugen",
    // 知识
    36: "知识",
    201: "科学科普",
    124: "社科·法律·心理",
    228: "人文历史",
    207: "财经商业",
    208: "校园学习",
    209: "职业职场",
    229: "设计·创意",
    122: "野生技术协会",
    39: "演讲·公开课",
    96: "星海",
    98: "机械",
    // 科技
    188: "科技",
    95: "数码",
    230: "软件应用",
    231: "计算机技术",
    232: "科工机械",
    233: "极客DIY",
    189: "电脑装机",
    190: "摄影摄像",
    191: "影音智能",
    // 运动
    234: "运动",
    235: "篮球",
    249: "足球",
    164: "健身",
    236: "竞技体育",
    237: "运动文化",
    238: "运动综合",
    // 汽车
    223: "汽车",
    258: "汽车知识科普",
    227: "购车攻略",
    247: "新能源车",
    245: "赛车",
    246: "改装玩车",
    240: "摩托车",
    248: "房车",
    176: "汽车生活",
    224: "汽车文化",
    225: "汽车极客",
    226: "智能出行",
    // 生活
    160: "生活",
    138: "搞笑",
    254: "亲子",
    250: "出行",
    251: "三农",
    239: "家居房产",
    161: "手工",
    162: "绘画",
    21: "日常",
    // 76: "美食圈",
    // 75: "动物圈",
    163: "运动",
    // 176: "汽车",
    174: "其他",
    // 美食
    211: "美食",
    76: "美食制作",
    212: "美食侦探",
    213: "美食测评",
    214: "田园美食",
    215: "美食记录",
    // 动物圈
    217: "动物圈",
    218: "喵星人",
    219: "汪星人",
    222: "小宠异宠",
    221: "野生动物",
    220: "动物二创",
    75: "动物综合",
    // 鬼畜
    119: "鬼畜",
    22: "鬼畜调教",
    26: "音MAD",
    126: "人力VOCALOID",
    216: "鬼畜剧场",
    127: "教程演示",
    // 时尚
    155: "时尚",
    157: "美妆护肤",
    252: "仿妆cos",
    158: "穿搭",
    159: "时尚潮流",
    // 164: "健身",
    192: "风尚标",
    // 资讯
    202: "资讯",
    203: "热点",
    204: "环球",
    205: "社会",
    206: "综合",
    // 广告
    165: "广告",
    166: "广告",
    // 娱乐
    5: "娱乐",
    241: "娱乐杂谈",
    262: "CP安利",
    263: "颜值安利",
    242: "娱乐粉丝创作",
    264: "娱乐资讯",
    137: "明星综合",
    71: "综艺",
    131: "Korea相关",
    // 影视
    181: "影视",
    182: "影视杂谈",
    183: "影视剪辑",
    260: "影视整活",
    259: "AI影像",
    184: "预告·资讯",
    85: "小剧场",
    256: "短片",
    261: "影视综合",
    // 纪录片
    177: "纪录片",
    37: "人文·历史",
    178: "科学·探索·自然",
    179: "军事",
    180: "社会·美食·旅行",
    // 电影
    23: "电影",
    147: "华语电影",
    145: "欧美电影",
    146: "日本电影",
    83: "其他国家",
    // 电视剧
    11: "电视剧",
    185: "国产剧",
    187: "海外剧",
};

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
            tname: ZONE_MAP[json.data?.tid] ?? "未知",
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
     * @param {string|number} epid
     * @param {boolean|undefined} isCheese
     * @returns {Promise<{
     *          failed:false,
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
     *      }|{
     *          failed:true,
     *          code:number,
     *          message:string
     *      }|null>}
     */
    async getEP(epid, isCheese = undefined) {
        if (!isCheese) {
            do {
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
                        return { failed: true, code: info.code, message: info.message };
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
                        failed: false,
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
            } while (false);
        }
        return null;
    }
}