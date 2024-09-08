const axios = require("axios").default;
const { JSDOM } = require("jsdom");
const log = require("../log");
const { escapeMarkdown, bold, underline, italic, strikethrough } = require("discord.js");

module.exports = {
    /**
     * @param {string} pid
     * @returns {Promise<{
     *    p: number,
     *    pid: string,
     *    title: string,
     *    description: string,
     *    tags: string[],
     *    illustType: string,
     *    aiType: string,
     *    r18Type: string,
     *    pageCount: number,
     *    viewCount: number,
     *    likeCount: number,
     *    bookmarkCount: number,
     *    commentCount: number,
     *    time: Date,
     *    authorId: string,
     *    authorName: string,
     *    authorAvater: string}?>}
     */
    async getIllustInfo(pid) {
        const type0 = /\d+/;
        const type1 = /(\d+)_p(\d+)/i;
        const type2 = /(\d+)-(\d+)/;
        let p = 0;
        do {
            const type2match = type2.exec(pid);
            if (type2match) {
                pid = type2match[1];
                p = Number.parseInt(type2match[2]) - 1;
                break;
            }
            const type1match = type1.exec(pid);
            if (type1match) {
                pid = type1match[1];
                p = Number.parseInt(type1match[2]);
                break;
            }
            const type0match = type0.exec(pid);
            if (type0match)
                break;
            return null;
        } while (false);

        const url = `https://www.pixiv.net/artworks/${pid}`;
        log.log("Requesting", url);
        const dom = await JSDOM.fromURL(url);
        const metaElement = dom.window.document.getElementById("meta-preload-data");
        if (!metaElement){
            dom.window.close();
            return null;
        }
        const meta = JSON.parse(metaElement.content);
        dom.window.close();
        const illust = meta.illust[Object.keys(meta.illust)[0]];
        const user = meta.user[Object.keys(meta.user)[0]];

        let illustType = "";
        if (illust.illustType === 0)
            illustType = "插画";
        else if (illust.illustType === 1)
            illustType = "漫画";

        let aiType = "未知";
        if (illust.aiType === 1)
            aiType = "否";
        else if (illust.aiType === 2)
            aiType = "是";

        let r18Type = "全年龄";
        if (illust.xRestrict === 1)
            r18Type = "R-18";
        else if (illust.xRestrict === 2)
            r18Type = "R-18G";

        const description = [];
        const tags = [];
        try {

            const descriptionDOM = new JSDOM(illust.description);
            for (const node of descriptionDOM.window.document.body.childNodes) {
                const text = escapeMarkdown(node.textContent);
                if (node instanceof descriptionDOM.window.HTMLElement)
                    switch (node.tagName.toLowerCase()) {
                        case "br":
                            description.push("\n");
                            continue;
                        case "b":
                        case "strong":
                            description.push(bold(text));
                            continue;
                        case "i":
                        case "em":
                            description.push(italic(text));
                            continue;
                        case "u":
                            description.push(underline(text));
                            continue;
                        case "s":
                        case "strike":
                        case "del":
                            description.push(strikethrough(text));
                            continue;
                    }
                description.push(text);
            }
        } catch (e) {
            log.error(e);
        }

        try {
            for (const tag of illust.tags.tags) {
                tags.push("#" + tag.tag);
            }
        } catch (e) {
            log.error(e);
        }

        return {
            p: p,
            pid: illust.id,
            title: escapeMarkdown(illust.title),
            description: description.join(""),
            tags: tags,
            illustType: illustType,
            aiType: aiType,
            r18Type: r18Type,
            pageCount: illust.pageCount,
            viewCount: illust.viewCount,
            likeCount: illust.likeCount,
            bookmarkCount: illust.bookmarkCount,
            commentCount: illust.commentCount,
            time: new Date(illust.uploadDate),
            authorId: user.userId,
            authorName: user.name,
            authorAvater: user.image
        };
    }
}