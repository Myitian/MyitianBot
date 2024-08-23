const { SlashCommandBuilder, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, escapeMarkdown } = require("discord.js");
const { randomInt } = require("node:crypto");
const axios = require("axios").default;
const log = require("../log");
const { getIllustInfo } = require("../apis/pixiv");
const { getMD, getVID, getMC, getEP } = require("../apis/bilibili");
const { formatDateTime, durationToString } = require("../utils");


/**
 * @param {string} value
 * @param {number} maxLength 
 */
function lengthLimiter(value, maxLength = 2000) {
    if (value.length > maxLength)
        return value.substring(0, maxLength - 1) + "…";
    return value;
}


async function processVID(returnType, aid = undefined, bvid = undefined) {
    const info = await getVID(aid, bvid);
    if (!info) {
        return null;
    } else if (info.code) {
        return info.code === -404 ? null : info.message;
    }
    const pubdate = new Date(info.pubdate * 1000);
    const timeStr = formatDateTime(pubdate);
    const builder = new EmbedBuilder()
        .setAuthor({ name: escapeMarkdown(info.authorName), url: `https://space.bilibili.com/${info.authorID}`, iconURL: info.authorAvater })
        .setTitle(escapeMarkdown(info.title))
        .setURL(`https://www.bilibili.com/video/${info.bvid}`)
        .setTimestamp(pubdate);
    switch (returnType) {
        case "lite":
            builder.setThumbnail(info.cover)
                .addFields(
                    { name: "BVID", value: info.bvid, inline: true },
                    { name: "分区", value: info.tname, inline: true },
                    { name: "时长", value: durationToString(info.duration * 1000), inline: true },
                );
            if (info.description)
                builder.setDescription(lengthLimiter(info.description, 60));
            break;
        case "details":
            builder.setThumbnail(info.cover)
                .addFields(
                    { name: "BVID", value: info.bvid, inline: true },
                    { name: "分区", value: info.tname, inline: true },
                    { name: "发布时间", value: timeStr, inline: true },
                    { name: "时长", value: durationToString(info.duration * 1000), inline: true },
                    { name: "观看", value: info.view.toString(), inline: true },
                    { name: "弹幕", value: info.danmaku.toString(), inline: true },
                    { name: "点赞", value: info.like.toString(), inline: true },
                    { name: "硬币", value: info.coin.toString(), inline: true },
                    { name: "收藏", value: info.favorite.toString(), inline: true }
                );
            if (info.description)
                builder.setDescription(lengthLimiter(info.description));
            break;
        default:
            builder.setImage(info.cover)
                .addFields(
                    { name: "BVID", value: info.bvid, inline: true },
                    { name: "分区", value: info.tname, inline: true },
                    { name: "时长", value: durationToString(info.duration * 1000), inline: true },
                );
            if (info.description)
                builder.setDescription(lengthLimiter(info.description, 80));
            break;
    }
    return builder;
}

async function processMC(returnType, mdid) {
    const mc = await getMC(mdid);
    if (!mc) {
        return null;
    } else if (mc.code) {
        return mc.message;
    }
    const builder = new EmbedBuilder()
        .setAuthor({ name: escapeMarkdown(mc.authors.join("，")) })
        .setTitle(escapeMarkdown(mc.title))
        .setURL(`https://manga.bilibili.com/detail/mc${mc.id}`);

    switch (returnType) {
        case "lite":
            builder.setThumbnail(mc.verticalCover)
                .setDescription(lengthLimiter(mc.description, 60))
                .addFields(
                    { name: "更新状态", value: mc.renewalTime, inline: true },
                    { name: "最新章节", value: mc.lastShortTitle, inline: true },
                );
            break;
        case "details":
            builder.setThumbnail(mc.verticalCover)
                .setDescription(lengthLimiter(mc.description))
                .addFields(
                    { name: "标签", value: mc.tags.join("，"), inline: true },
                    { name: "风格", value: mc.styles.join("，"), inline: true },
                    { name: "章节数", value: mc.total.toString(), inline: true },
                    { name: "更新状态", value: mc.renewalTime, inline: true },
                    { name: "最新章节", value: mc.lastShortTitle, inline: true },
                );
            break;
        default:
            builder.setImage(mc.horizontalCover)
                .setDescription(lengthLimiter(mc.description, 80))
                .addFields(
                    { name: "更新状态", value: mc.renewalTime, inline: true },
                    { name: "最新章节", value: mc.lastShortTitle, inline: true },
                )
            break;
    }
    return builder;
}

async function processMD(returnType, mdid) {
    const md = await getMD(mdid);
    if (!md)
        return null;
    const desc = escapeMarkdown(`${md.releaseDate}　　${md.timeLength}\n\n${md.description}`);
    const builder = new EmbedBuilder()
        .setAuthor({ name: md.typeName })
        .setTitle(escapeMarkdown(md.title))
        .setURL(`https://www.bilibili.com/bangumi/media/md${md.mdid}`);

    switch (returnType) {
        case "lite":
            builder.setThumbnail(md.cover)
                .setDescription(lengthLimiter(desc, 60))
                .addFields(
                    { name: "总播放", value: md.views.toString(), inline: true },
                    { name: "评分", value: md.ratingScore?.toString() ?? "暂无评分", inline: true }
                );
            break;
        case "details":
            builder.setThumbnail(md.cover)
                .setDescription(lengthLimiter(desc))
                .addFields(
                    { name: "总播放", value: md.views.toString(), inline: true },
                    { name: "追番人数", value: md.seriesFollow.toString(), inline: true },
                    { name: "弹幕总数", value: md.danmakus.toString(), inline: true },
                    { name: "评分人数", value: md.ratingCount?.toString() ?? "评分人数过少", inline: true },
                    { name: "评分", value: md.ratingScore?.toString() ?? "暂无评分", inline: true }
                );
            break;
        default:
            builder.setImage(md.cover)
                .setDescription(lengthLimiter(desc, 80))
                .addFields(
                    { name: "总播放", value: md.views.toString(), inline: true },
                    { name: "评分", value: md.ratingScore?.toString() ?? "暂无评分", inline: true }
                )
            break;
    }
    return builder;
}

async function processEP(returnType, epid, isCheese = undefined) {
    const info = await getEP(epid, isCheese);
    if (!info) {
        return null;
    } else if (info.code) {
        return info.code === -404 ? null : info.message;
    }
    if (!info.isCheese) {
        const pubtime = new Date(info.pubtime * 1000);
        const timeStr = formatDateTime(pubtime);
        const builder = new EmbedBuilder()
            .setAuthor({ name: info.typeName })
            .setTitle(escapeMarkdown(info.title))
            .setURL(`https://www.bilibili.com/bangumi/play/ep${info.id}`)
        switch (returnType) {
            case "lite":
                builder.setThumbnail(info.cover)
                    .addFields(
                        { name: "发布日期", value: timeStr, inline: true },
                        { name: "时长", value: durationToString(info.duration), inline: true },
                        { name: "播放量", value: info.view.toString(), inline: true },
                    )
                    .setTimestamp(pubtime);
                if (info.description)
                    builder.setDescription(lengthLimiter(info.description, 60));
                break;
            case "details":
                builder.setThumbnail(info.cover)
                    .addFields(
                        { name: "发布日期", value: timeStr, inline: true },
                        { name: "时长", value: durationToString(info.duration), inline: true },
                        { name: "BVID", value: info.bvid, inline: true },
                        { name: "追番", value: info.favorites.toString(), inline: true },
                        { name: "播放量", value: info.view.toString(), inline: true },
                        { name: "弹幕", value: info.danmaku.toString(), inline: true },
                        { name: "点赞", value: info.like.toString(), inline: true },
                        { name: "硬币", value: info.coin.toString(), inline: true },
                        { name: "收藏", value: info.favorite.toString(), inline: true }
                    )
                    .setTimestamp(pubtime);
                if (info.description)
                    builder.setDescription(lengthLimiter(info.description));
                break;
            default:
                builder.setImage(info.cover)
                    .addFields(
                        { name: "发布日期", value: timeStr, inline: true },
                        { name: "时长", value: durationToString(info.duration), inline: true },
                        { name: "播放量", value: info.view.toString(), inline: true },
                    )
                    .setTimestamp(pubtime);
                if (info.description)
                    builder.setDescription(lengthLimiter(info.description, 80));
                break;
        }
        return builder;
    } else {

    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("share")
        .setDescription("分享内容")
        .addStringOption(option =>
            option.setName("source")
                .setDescription("来源")
                .setRequired(true)
                .addChoices(
                    { name: "Bilibili", value: "bilibili" },
                    { name: "Pixiv", value: "pixiv" },
                ))
        .addStringOption(option =>
            option.setName("id")
                .setDescription("ID")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("return")
                .setDescription("返回结果")
                .addChoices(
                    { name: "轻量", value: "lite" },
                    { name: "详细", value: "details" },
                    { name: "大图", value: "big-img" }
                )),
    /** @param {CommandInteraction} interaction  */
    async execute(interaction) {
        await interaction.deferReply();
        const commandID = `(${randomInt(0x100000000).toString(16).padStart(8, "0")})`;
        /** @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        const returnType = options.getString("return");
        const subcommand = options.getString("source");
        switch (subcommand) {
            case "bilibili":
                {
                    const id = options.getString("id").trim();

                    const numIDRx = /([a-z]{2})(\d+)/i;
                    const BVIDRx = /[Bb][Vv][\dA-Za-z]{10}/;
                    const numIDM = numIDRx.exec(id);
                    const BVIDM = BVIDRx.exec(id);

                    let content = null;
                    const embeds = [];

                    let returnData = null;
                    if (BVIDM) { // 视频
                        log.log(commandID, "Type:", "BVID", BVIDM[0]);
                        returnData = await processVID(returnType, undefined, BVIDM[0]);
                    } else if (numIDM) {
                        const id2 = numIDM[1].toLowerCase();
                        log.log(commandID, "Type:", id2.toUpperCase() + "ID", numIDM[2]);
                        switch (id2) {
                            case "au": // 音乐
                                break;
                            case "av": // 视频
                                returnData = await processVID(returnType, numIDM[2]);
                                break;
                            case "cv": // 专栏
                                break;
                            case "rl": // 文集
                                break;
                            case "mc": // 漫画
                                returnData = await processMC(returnType, numIDM[2]);
                                break;
                            case "md": // 剧集
                                returnData = await processMD(returnType, numIDM[2]);
                                break;
                            case "ep": // 剧集
                                {
                                    let isCheese = undefined;
                                    const bangumiRx = /bangumi\/play\/ep\d+/i;
                                    const cheeseRx = /cheese\/play\/ep\d+/i;
                                    if (bangumiRx.test(id))
                                        isCheese = false;
                                    else if (cheeseRx.test(id))
                                        isCheese = true;
                                    returnData = await processEP(returnType, numIDM[2], isCheese);
                                }
                                break;
                            case "ss": // 剧集
                                {
                                    let isCheese = undefined;
                                    const bangumiRx = /bangumi\/play\/ep\d+/i;
                                    const cheeseRx = /cheese\/play\/ep\d+/i;
                                    if (bangumiRx.test(id))
                                        isCheese = false;
                                    else if (cheeseRx.test(id))
                                        isCheese = true;
                                    // returnData = await processSS(returnType, numIDM[2], isCheese);
                                }
                                break;
                        }
                    }

                    if (typeof returnData == "string")
                        content = returnData;
                    else if (returnData instanceof EmbedBuilder)
                        embeds.push(returnData);

                    if (!content && !embeds.length)
                        content = "未知的ID";

                    log.log(commandID, "Return", content, embeds.length);
                    await interaction.editReply({ content: content, embeds: embeds });
                }
                break;
            case "pixiv":
                {
                    const id = options.getString("id").trim();

                    let content = null;
                    const embeds = [];

                    const info = await getIllustInfo(id);
                    if (!info)
                        content = "无效的ID！正确格式：\n`\\d+`\n`\\d+_p\\d+`\n`\\d+-\\d+";
                    else if (info.r18Type !== 0 && !interaction.channel.nsfw) {
                        content = "您正在尝试在无年龄限制的频道内访问NSFW内容。请移步至有年龄限制的频道。";
                    } else {
                        if (info.p < 0)
                            info.p = 0;
                        else if (info.p >= info.pageCount)
                            info.p = info.pageCount - 1;

                        const imgURL = info.pageCount === 1 ?
                            `https://pixiv.re/${info.pid}.png` :
                            `https://pixiv.re/${info.pid}-${info.p + 1}.png`;
                        const authorAvaterURL = new URL(info.authorAvater);
                        authorAvaterURL.host = "i.pixiv.re";
                        const description = lengthLimiter(info.description.trim());
                        const tags = lengthLimiter(info.tags.join(" "));

                        log.log(commandID, "Pixiv", info.pid, info.p, imgURL);

                        let builder = new EmbedBuilder()
                            .setTitle(info.title)
                            .setURL(`https://www.pixiv.net/artworks/${info.pid}`)
                            .setAuthor({ name: info.authorName, iconURL: authorAvaterURL.toString(), url: `https://www.pixiv.net/users/${info.authorId}` })
                            .setTimestamp(info.time);
                        switch (returnType) {
                            case "lite":
                                builder.setThumbnail(imgURL)
                                    .addFields(
                                        { name: "PID + P", value: `${info.pid}_p${info.p}`, inline: true },
                                        { name: "是否AI", value: info.aiType, inline: true },
                                        { name: "分级", value: info.r18Type, inline: true },
                                        { name: "标签", value: tags }
                                    )
                                if (description)
                                    builder.setDescription(lengthLimiter(description, 60));
                                break;
                            case "details":
                                builder.setImage(imgURL)
                                    .addFields(
                                        { name: "类型", value: info.illustType, inline: true },
                                        { name: "是否AI", value: info.aiType, inline: true },
                                        { name: "分级", value: info.r18Type, inline: true },
                                        { name: "标签", value: tags },
                                        { name: "PID", value: info.pid, inline: true },
                                        { name: "P", value: info.p.toString(), inline: true },
                                        { name: "浏览量", value: info.viewCount.toString(), inline: true },
                                        { name: "点赞量", value: info.likeCount.toString(), inline: true },
                                        { name: "收藏量", value: info.bookmarkCount.toString(), inline: true },
                                        { name: "评论量", value: info.commentCount.toString(), inline: true }
                                    )
                                if (description)
                                    builder.setDescription(lengthLimiter(description));
                                break;
                            default:
                                builder.setImage(imgURL)
                                    .addFields(
                                        { name: "PID + P", value: `${info.pid}_p${info.p}`, inline: true },
                                        { name: "是否AI", value: info.aiType, inline: true },
                                        { name: "分级", value: info.r18Type, inline: true },
                                        { name: "标签", value: tags }
                                    )
                                if (description)
                                    builder.setDescription(lengthLimiter(description, 80));
                                break;
                        }
                        embeds.push(builder);
                    }
                    log.log(commandID, "Return", content, embeds.length);
                    await interaction.editReply({ content: content, embeds: embeds });
                }
                break;
        }
    },
};