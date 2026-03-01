const { JSDOM } = require("jsdom");
const crypto = require("crypto");
const qs = require("qs");
const log = require("../log");
const { fetchJson } = require("../utils");
const { pixiv } = require("../config.json");
const { escapeMarkdown, bold, underline, italic, strikethrough } = require("discord.js");

const AUTH_TOKEN_URL = "https://oauth.secure.pixiv.net/auth/token";
const pixivAuth = pixiv.refreshTokens.map((/** @type {string} */ token) => ({
    refreshToken: token,
    accessToken: "",
    expireTimestamp: 0,
    refreshing: false,
}));
let currentTokenIndex = 0;

const maskHeader = {
    "App-OS": "ios",
    "App-OS-Version": "10.3.1",
    "App-Version": "6.7.1",
    "User-Agent": "PixivIOSApp/6.7.1 (iOS 10.3.1; iPhone8,1)",
};

/**
 * @param {string} refreshToken
 */
async function refreshAccessToken(refreshToken) {
    const localTime = `${new Date().toISOString().replace(/\..+/, "")}+00:00`;
    const response = await fetch(AUTH_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Client-Time": localTime,
            "X-Client-Hash": crypto.createHash("md5").update(`${localTime}28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c`).digest("hex"),
            ...maskHeader,
        },
        body: qs.stringify({
            client_id: "MOBrBDS8blbauoSck0ZfDbtuzpyT",
            client_secret: "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj",
            get_secure_url: 1,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }),
    });
    if (!response.ok) {
        throw new Error(await response.text())
    }
    return await response.json();
};

function getAccessTokenIndex() {
    // Rotate index
    currentTokenIndex = (currentTokenIndex + 1) % pixivAuth.length;
    return currentTokenIndex;
};

async function getAccessToken() {
    const tokenIndex = getAccessTokenIndex();

    if (pixivAuth[tokenIndex].expireTimestamp < Date.now()) {
        if (!pixivAuth[tokenIndex].refreshing) {
            // Set the refreshing flag to indicate that a refresh is in progress
            pixivAuth[tokenIndex].refreshing = true;

            try {
                const refreshRes = await refreshAccessToken(pixivAuth[tokenIndex].refreshToken);
                pixivAuth[tokenIndex].accessToken = refreshRes.access_token;
                pixivAuth[tokenIndex].refreshToken = refreshRes.refresh_token;
                pixivAuth[tokenIndex].expireTimestamp = Date.now() + (refreshRes.expires_in * 0.9) * 1000;
                log.log(`Pixiv access token[${tokenIndex}] refreshed`);
            } catch (err) {
                log.warn("Pixiv refresh token failed.", err);
            } finally {
                // Reset the refreshing flag when the refresh is completed (whether successful or not)
                pixivAuth[tokenIndex].refreshing = false;
            }
        } else {
            // If another refresh is already in progress, wait for its completion
            await /** @type {Promise<void>} */(new Promise(resolve => {
                const interval = setInterval(() => {
                    if (!pixivAuth[tokenIndex].refreshing) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            }));
        }
    }

    return pixivAuth[tokenIndex].accessToken;
};

/**
 * @param {string} pid
 */
async function getPixivIllustIdData(pid) {
    log.log("Fetching Pixiv API data for illust ID:", pid);
    const response = await fetch(`https://app-api.pixiv.net/v1/illust/detail?illust_id=${pid}`, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${await getAccessToken()}`,
            ...maskHeader,
        }
    });
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        let json = null;
        try {
            json = await response.json();
        } catch { }
        if (json?.error?.message === "Rate Limit")
            throw new Error("Pixiv API rate limit exceeded.");
        throw new Error(`Pixiv API request failed: ${response.status}`);
    }
    return await response.json();
};

/** @typedef {{
 *  error:boolean,
 *  message:string,
 *  body:{
 *      userId: string,
 *      name: string,
 *      image: string,
 *      imageBig: string
 *  }}} UserInfo 
 */
/** @typedef {{
 *  urls:{
 *      thumb_mini:string,
 *      small:string,
 *      regular:string,
 *      original:string
 *  },
 *  width:number,
 *  height:number
 *  }} PageInfo 
 */
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
     *    authorId: string}?>}
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

        const iUrl = `https://www.pixiv.net/ajax/illust/${pid}`;
        const illust = await fetchJson(iUrl);

        let illustType = "";
        if (illust.body.illustType === 0)
            illustType = "插画";
        else if (illust.body.illustType === 1)
            illustType = "漫画";

        let aiType = "未知";
        if (illust.body.aiType === 1)
            aiType = "否";
        else if (illust.body.aiType === 2)
            aiType = "是";

        let r18Type = "全年龄";
        if (illust.body.xRestrict === 1)
            r18Type = "R-18";
        else if (illust.body.xRestrict === 2)
            r18Type = "R-18G";

        const description = [];
        try {

            const descriptionDOM = new JSDOM(illust.body.description);
            for (const node of descriptionDOM.window.document.body.childNodes) {
                const text = escapeMarkdown(node.textContent ?? "");
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
        const tags = [];
        try {
            for (const tag of illust.body.tags.tags) {
                tags.push(escapeMarkdown("#" + tag.tag));
            }
        } catch (e) {
            log.error(e);
        }

        return {
            p: p,
            pid: illust.body.id,
            title: illust.body.title,
            description: description.join(""),
            tags: tags,
            illustType: illustType,
            aiType: aiType,
            r18Type: r18Type,
            pageCount: illust.body.pageCount,
            viewCount: illust.body.viewCount,
            likeCount: illust.body.likeCount,
            bookmarkCount: illust.body.bookmarkCount,
            commentCount: illust.body.commentCount,
            time: new Date(illust.body.uploadDate),
            authorId: illust.body.userId
        };
    },
    /**
     * @param {string} uid 
     * @returns {Promise<UserInfo>}>}
     */
    async getUserInfo(uid) {
        const uUrl = `https://www.pixiv.net/ajax/user/${uid}`;
        return await fetchJson(uUrl);
    },
    /**
     * @param {string} pid 
     * @param {number} p
     * @param {*} proxy
     * @returns {Promise<string?>}>}
     */
    async getImageURL(pid, p, proxy) {
        if (proxy) {
            return p ? `${proxy}${pid}-${p + 1}.png` : `${proxy}${pid}.png`
        }
        try {
            const pixivApiResponse = await getPixivIllustIdData(pid);
            if (pixivApiResponse === null)
                return null;
            if (p == 0) {
                return pixivApiResponse.illust.meta_single_page?.original_image_url
                    ?? pixivApiResponse.illust.meta_pages[p].image_urls.original;
            }
            return pixivApiResponse.illust.meta_pages[p].image_urls.original;
        } catch (error) {
            log.error(error);
            return null;
        }
    }
}