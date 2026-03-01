const { SlashCommandBuilder, CommandInteractionOptionResolver, EmbedBuilder, CommandInteraction, escapeMarkdown, BaseGuildTextChannel } = require("discord.js");
const { randomInt } = require("node:crypto");
const axios = require("axios");
const lolicon_api_v1 = require("../apis/lolicon-api-v1")
const lolicon_api_v2 = require("../apis/lolicon-api-v2")
const anosu = require("../apis/anosu");
const jitsu = require("../apis/jitsu");
const mirlkoi = require("../apis/mirlkoi");
const log = require("../log");
const booru = require("../apis/booru");
const { fileSizeToString } = require("../utils");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("img")
        .setDescription("获取图片")
        .addSubcommand(subcommand =>
            subcommand
                .setName("lolicon-api-v1")
                .setDescription("Lolicon API V1")
                .addIntegerOption(option =>
                    option.setName("r18")
                        .setDescription("是否为 R18")
                        .addChoices(
                            { name: "False", value: 0 },
                            { name: "True", value: 1 },
                            { name: "Random", value: 2 },
                        ))
                .addStringOption(option =>
                    option.setName("keyword")
                        .setDescription("若指定关键字，将会返回从插画标题、作者、标签中模糊搜索的结果"))
                .addIntegerOption(option =>
                    option.setName("num")
                        .setDescription("一次返回的结果数量")
                        .setMinValue(1)
                        .setMaxValue(10)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("lolicon-api-v2")
                .setDescription("Lolicon API V2")
                .addIntegerOption(option =>
                    option.setName("r18")
                        .setDescription("是否为 R18")
                        .addChoices(
                            { name: "False", value: 0 },
                            { name: "True", value: 1 },
                            { name: "Random", value: 2 },
                        ))
                .addIntegerOption(option =>
                    option.setName("num")
                        .setDescription("一次返回的结果数量")
                        .setMinValue(1)
                        .setMaxValue(10))
                .addStringOption(option =>
                    option.setName("uid")
                        .setDescription("返回指定 UID 作者的作品，可用逗号分隔多个 UID"))
                .addStringOption(option =>
                    option.setName("keyword")
                        .setDescription("若指定关键字，将会返回从插画标题、作者、标签中模糊搜索的结果"))
                .addStringOption(option =>
                    option.setName("tag1")
                        .setDescription("返回标签、作者名、标题匹配指定标签的作品，可用竖线分隔多个标签（同一选项内为【或】），tag1 tag2 tag3 之间为【与】"))
                .addStringOption(option =>
                    option.setName("tag2")
                        .setDescription("返回标签、作者名、标题匹配指定标签的作品，可用竖线分隔多个标签（同一选项内为【或】），tag1 tag2 tag3 之间为【与】"))
                .addStringOption(option =>
                    option.setName("tag3")
                        .setDescription("返回标签、作者名、标题匹配指定标签的作品，可用竖线分隔多个标签（同一选项内为【或】），tag1 tag2 tag3 之间为【与】"))
                .addIntegerOption(option =>
                    option.setName("date-after")
                        .setDescription("返回在这个时间及以后上传的作品；时间戳，单位为毫秒")
                        .setMinValue(0))
                .addIntegerOption(option =>
                    option.setName("date-before")
                        .setDescription("返回在这个时间及以前上传的作品；时间戳，单位为毫秒")
                        .setMinValue(0))
                .addBooleanOption(option =>
                    option.setName("dsc")
                        .setDescription("禁用对某些缩写 keyword 和 tag 的自动转换"))
                .addBooleanOption(option =>
                    option.setName("exclude-ai")
                        .setDescription("排除 AI 作品"))
                .addStringOption(option =>
                    option.setName("aspect-ratio")
                        .setDescription("图片长宽比，详见文档（https://api.lolicon.app/#/setu?id=aspectratio）")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("anosu")
                .setDescription("Anosu")
                .addIntegerOption(option =>
                    option.setName("r18")
                        .setDescription("是否为 R18")
                        .addChoices(
                            { name: "False", value: 0 },
                            { name: "True", value: 1 },
                            { name: "Random", value: 2 },
                        ))
                .addStringOption(option =>
                    option.setName("keyword")
                        .setDescription("图片 tags 所包含的关键字"))
                .addIntegerOption(option =>
                    option.setName("num")
                        .setDescription("一次返回的结果数量")
                        .setMinValue(1)
                        .setMaxValue(10))
                .addIntegerOption(option =>
                    option.setName("db")
                        .setDescription("使用的图库（数据库）")
                        .addChoices(
                            { name: "新图库", value: 0 },
                            { name: "旧图库", value: 1 }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName("jitsu")
                .setDescription("Jitsu")
                .addStringOption(option =>
                    option.setName("sort")
                        .setDescription("图片的分类")
                        .addChoices(
                            { name: "全部图片", value: "all" },
                            { name: "手机壁纸", value: "mp" },
                            { name: "桌面壁纸", value: "pc" },
                            { name: "1920 x 1080", value: "1080p" },
                            { name: "银发", value: "silver" },
                            { name: "兽耳", value: "furry" },
                            { name: "星空", value: "starry" },
                            { name: "涩图（不漏）", value: "setu" },
                            { name: "Pixiv（不含18+）", value: "pixiv" },
                            { name: "Pixiv R18", value: "r18" },
                            { name: "Jitsu Pixiv收藏（不含18+）", value: "jitsu" },
                            { name: "R18（不支持数量）", value: "!special" },
                        ))
                .addIntegerOption(option =>
                    option.setName("num")
                        .setDescription("返回的数量")
                        .setMinValue(1)
                        .setMaxValue(10)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("mirlkoi")
                .setDescription("MirlKoi")
                .addStringOption(option =>
                    option.setName("sort")
                        .setDescription("图片的分类")
                        .addChoices(
                            { name: "随机图（全部图）", value: "all" },
                            { name: "随机图（无色图）", value: "iw233" },
                            { name: "精选图", value: "top" },
                            { name: "银发", value: "yin" },
                            { name: "兽耳", value: "cat" },
                            { name: "星空", value: "xing" },
                            { name: "竖屏图", value: "mp" },
                            { name: "横屏图", value: "pc" },
                        ))
                .addIntegerOption(option =>
                    option.setName("num")
                        .setDescription("返回的数量")
                        .setMinValue(1)
                        .setMaxValue(10)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("booru-like")
                .setDescription("booru类")
                .addStringOption(option =>
                    option.setName("tags")
                        .setDescription("图像标签，用空格连接"))
                .addIntegerOption(option =>
                    option.setName("num")
                        .setDescription("数量")
                        .setMinValue(1)
                        .setMaxValue(10))
                .addBooleanOption(option =>
                    option.setName("random")
                        .setDescription("是否随机抽取"))
                .addStringOption(option =>
                    option.setName("api")
                        .setDescription("API")
                        .addChoices(
                            { name: "safebooru", value: "safebooru" },
                            { name: "danbooru", value: "danbooru" },
                            // { name: "konachan.com", value: "konachan.com" },
                            // { name: "konachan.net", value: "konachan.net" },
                            { name: "yandere", value: "yandere" },
                            // { name: "e926", value: "e926" },
                            // { name: "e621", value: "e621" },
                        ))),

    /** @param {CommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply();
        const commandID = `(${randomInt(0x100000000).toString(16).padStart(8, "0")})`;
        /** @ts-ignore @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        /** @ts-ignore @type {BaseGuildTextChannel} */
        const channel = interaction.channel;
        const subcommand = options.getSubcommand();
        switch (subcommand) {
            case "lolicon-api-v1":
                {
                    /** @ts-ignore @type {0|1|2} */
                    const r18 = options.getInteger("r18");
                    const keyword = options.getString("keyword");
                    const num = options.getInteger("num");

                    let content = null;
                    const embeds = [];

                    let filteredNSFW = 0;

                    const response = await lolicon_api_v1.getJson({
                        r18: r18,
                        keyword: keyword ?? undefined,
                        num: num ?? undefined
                    });

                    if (response.code === 0 && response.data) {
                        for (const setu of response.data) {
                            log.log(commandID, "Image", setu.url);
                            if (setu.r18 && !channel.nsfw) {
                                log.log(commandID, "Filtered");
                                filteredNSFW++;
                                continue;
                            }
                            embeds.push(new EmbedBuilder()
                                .setTitle(setu.title)
                                .setURL(`https://www.pixiv.net/artworks/${setu.pid}`)
                                .setAuthor({ name: setu.author, url: `https://www.pixiv.net/users/${setu.uid}` })
                                .addFields(
                                    { name: "PID", value: setu.pid.toString(), inline: true },
                                    { name: "P", value: setu.p.toString(), inline: true },
                                    { name: "R18", value: setu.r18 ? "是" : "否", inline: true },
                                    { name: "标签", value: "#" + setu.tags.join(" #") },
                                    { name: "宽", value: setu.width.toString(), inline: true },
                                    { name: "高", value: setu.height.toString(), inline: true }
                                )
                                .setImage(setu.url));
                        }
                    }

                    if (response.error)
                        content = response.error;
                    else if (response.msg)
                        content = response.msg;

                    if (filteredNSFW > 0 && !channel.nsfw)
                        content = `您正在尝试在无年龄限制的频道内访问NSFW内容（已过滤${filteredNSFW}张）。请移步至有年龄限制的频道。`;

                    if (!content && !embeds.length)
                        content = "无返回图片！";

                    log.log(commandID, "Return", JSON.stringify(content), embeds.length);
                    await interaction.editReply({ content: content, embeds: embeds });
                }
                break;
            case "lolicon-api-v2":
                {
                    /** @ts-ignore @type {0|1|2|undefined} */
                    const r18 = options.getInteger("r18") ?? undefined;
                    const num = options.getInteger("num") ?? undefined;
                    const uid = options.getString("uid")?.split(",").map(it => parseInt(it)) ?? undefined;
                    const keyword = options.getString("keyword") ?? undefined;
                    /** @ts-ignore @type {string[]} */ 
                    const tag = [options.getString("tag1"), options.getString("tag2"), options.getString("tag3")].filter(it => !!it);
                    const dateAfter = options.getInteger("date-after") ?? undefined;
                    const dateBefore = options.getInteger("date-before") ?? undefined;
                    const dsc = options.getBoolean("dsc") ?? undefined;
                    const excludeAI = options.getBoolean("exclude-ai") ?? undefined;
                    const aspectRatio = options.getString("aspect-ratio") ?? undefined;

                    let content = null;
                    const embeds = [];
                    let filteredNSFW = 0;

                    const response = await lolicon_api_v2.getJson({
                        r18: r18,
                        uid: uid,
                        keyword: keyword,
                        num: num,
                        tag: tag,
                        size: ["original", "small"],
                        dateAfter: dateAfter,
                        dateBefore: dateBefore,
                        dsc: dsc,
                        excludeAI: excludeAI,
                        aspectRatio: aspectRatio
                    });

                    if (response.data) {
                        for (const setu of response.data) {
                            log.log(commandID, "Image", setu.urls.original);
                            if (setu.r18 && !channel.nsfw) {
                                log.log(commandID, "Filtered");
                                filteredNSFW++;
                                continue;
                            }
                            embeds.push(new EmbedBuilder()
                                .setTitle(setu.title)
                                .setURL(`https://www.pixiv.net/artworks/${setu.pid}`)
                                .setAuthor({ name: setu.author, url: `https://www.pixiv.net/users/${setu.uid}` })
                                .setDescription(`[原图（${setu.ext.toUpperCase()}）](${setu.urls.original})`)
                                .addFields(
                                    { name: "PID+P", value: `${setu.pid}_p${setu.p}`, inline: true },
                                    { name: "宽x高", value: `${setu.width}x${setu.height}`, inline: true },
                                    { name: "标签", value: "#" + setu.tags.join(" #") },
                                    { name: "R18", value: setu.r18 ? "是" : "否", inline: true },
                                    { name: "AI", value: setu.aiType !== 2 ? setu.aiType === 0 ? "未知" : "否" : "是", inline: true }
                                )
                                .setImage(setu.urls.small ?? null)
                                .setTimestamp(new Date(setu.uploadDate)));
                        }
                    }

                    if (response.error)
                        content = response.error;
                    else if (response.msg)
                        content = response.msg;

                    if (filteredNSFW > 0 && !channel.nsfw)
                        content = `您正在尝试在无年龄限制的频道内访问NSFW内容（已过滤${filteredNSFW}张）。请移步至有年龄限制的频道。`;

                    if (!content && !embeds.length)
                        content = "无返回图片！";

                    log.log(commandID, "Return", JSON.stringify(content), embeds.length);
                    await interaction.editReply({ content: content, embeds: embeds });
                }
                break;
            case "anosu":
                {
                    const r18 = options.getInteger("r18");
                    const keyword = options.getString("keyword");
                    const num = options.getInteger("num");
                    const db = options.getInteger("db");

                    let content = null;
                    const embeds = [];

                    let filteredNSFW = 0;

                    const response = await anosu.getJson(r18, keyword, num, db);

                    if (response.length) {
                        for (const setu of response) {
                            log.log(commandID, "Image", setu.url);
                            if (setu.r18 && !channel.nsfw) {
                                log.log(commandID, "Filtered");
                                filteredNSFW++;
                                continue;
                            }
                            embeds.push(new EmbedBuilder()
                                .setTitle(setu.title)
                                .setURL(`https://www.pixiv.net/artworks/${setu.pid}`)
                                .setAuthor({ name: setu.user, url: `https://www.pixiv.net/users/${setu.uid}` })
                                .addFields(
                                    { name: "PID", value: setu.pid.toString(), inline: true },
                                    { name: "P", value: setu.page.toString(), inline: true },
                                    { name: "R18", value: setu.r18 ? "是" : "否", inline: true },
                                    { name: "标签", value: setu.tags.map(t => "#" + t).join(" ") },
                                    { name: "宽", value: setu.width.toString(), inline: true },
                                    { name: "高", value: setu.height.toString(), inline: true }
                                )
                                .setImage(setu.url));
                        }
                    }

                    if (filteredNSFW > 0 && !channel.nsfw)
                        content = `您正在尝试在无年龄限制的频道内访问NSFW内容（已过滤${filteredNSFW}张）。请移步至有年龄限制的频道。`;

                    if (!content && !embeds.length)
                        content = "无返回图片！";

                    log.log(commandID, "Return", JSON.stringify(content), embeds.length);
                    await interaction.editReply({ content: content, embeds: embeds });
                }
                break;
            case "jitsu":
                {
                    const sort = options.getString("sort");
                    const num = options.getInteger("num");

                    let content = null;
                    const embeds = [];

                    if ((sort === "r18") && !channel.nsfw) {
                        content = "您正在尝试在无年龄限制的频道内访问NSFW内容。请移步至有年龄限制的频道。";
                    } else {
                        const response = await jitsu.getJson(sort, num);

                        if (response.pics) {
                            let i = 0;
                            for (const setu of response.pics) {
                                log.log(commandID, "Image", setu);
                                const regex = /\/(\d+)_p(\d+)\./;
                                const match = regex.exec(setu);
                                if (match) {
                                    embeds.push(new EmbedBuilder()
                                        .addFields(
                                            { name: "PID", value: match[1], inline: true },
                                            { name: "P", value: match[2], inline: true },
                                            { name: "R18", value: sort === "r18" ? "是" : "否", inline: true }
                                        )
                                        .setImage(setu));
                                } else {
                                    embeds.push(new EmbedBuilder()
                                        .setDescription(i.toString())
                                        .setImage(setu));
                                }
                                i++;
                            }
                        }
                    }

                    if (!content && !embeds.length)
                        content = "无返回图片！";

                    log.log(commandID, "Return", JSON.stringify(content), embeds.length);
                    await interaction.editReply({ content: content, embeds: embeds });
                }
                break;
            case "mirlkoi":
                {
                    const sort = options.getString("sort") ?? "random";
                    const num = options.getInteger("num");

                    let content = null;
                    const embeds = [];

                    const response = await mirlkoi.getJson(sort, num);

                    if (response.pic) {
                        let i = 0;
                        for (const setu of response.pic) {
                            log.log(commandID, "Image", setu);
                            const url = new URL(setu);
                            url.host = "setu.iw233.top";
                            embeds.push(new EmbedBuilder()
                                .setURL("https://iw233.cn")
                                .setImage(url.toString()));
                            i++;
                        }
                    }

                    if (embeds.length > 4)
                        content = `返回图像共${embeds.length}张，可能需要点开图片向后翻页才能查看。`;

                    if (!content && !embeds.length)
                        content = "无返回图片！";

                    log.log(commandID, "Return", JSON.stringify(content), embeds.length);
                    await interaction.editReply({ content: content, embeds: embeds });
                }
                break;
            case "booru-like":
                {
                    const tags = options.getString("tags") ?? "";
                    const num = options.getInteger("num") ?? 1;
                    const random = options.getBoolean("random") ?? true;
                    const endpoint = options.getString("api") ?? "safebooru";

                    log.log(commandID, "Booru-like", tags);

                    /** @type {booru.BooruAPIType} */
                    let type = "moebooru";
                    /** @type {string?} */
                    let api = null;
                    /** @type {string?} */
                    let show = null;
                    switch (endpoint) {
                        case "safebooru":
                            api = "https://safebooru.donmai.us/posts.json";
                            show = "https://safebooru.donmai.us/posts/";
                            type = "danbooru";
                            break;
                        case "danbooru":
                            api = "https://danbooru.donmai.us/posts.json";
                            show = "https://danbooru.donmai.us/posts/";
                            type = "danbooru";
                            break;
                        case "konachan.com":
                            api = "https://konachan.com/post.json";
                            show = "https://konachan.com/post/show/";
                            type = "moebooru";
                            break;
                        case "konachan.net":
                            api = "https://konachan.net/post.json";
                            show = "https://konachan.net/post/show/";
                            type = "moebooru";
                            break;
                        case "yandere":
                            api = "https://yande.re/post.json";
                            show = "https://yande.re/post/show/";
                            type = "moebooru";
                            break;
                        case "e926":
                            api = "https://e926.net/posts.json";
                            show = "https://e926.net/posts/show/";
                            type = "e621ng";
                            break;
                        case "e621":
                            api = "https://e621.net/posts.json";
                            show = "https://e621.net/posts/show/";
                            type = "e621ng";
                            break;
                    }
                    let content = null;
                    if (api === null) {
                        content = "未知错误";
                        log.log(commandID, "Return", JSON.stringify(content));
                        await interaction.editReply({ content: content });
                        return;
                    }

                    const embeds = [];

                    const response = random ?
                        await booru.getRandom(api, type, tags, num) :
                        await booru.getNewest(api, type, tags, num);

                    let error = 0;
                    let errorMessages = [];
                    let filteredNSFW = 0;
                    // log.log(response);
                    for (const info of response.data) {
                        if (info == undefined) {
                            error++;
                        } else if (typeof (info) === "string") {
                            error++;
                            errorMessages.push(info);
                        }
                        let rating = null;
                        switch (info.rating) {
                            case "g":
                                rating = "常规";
                                break;
                            case "s":
                                rating = "安全";
                                break;
                            case "q":
                                rating = "可疑";
                                break;
                            case "e":
                                rating = "暴露";
                                break;
                            default:
                                rating = info.rating;
                                break;
                        }
                        if (info.rating !== "g" && info.rating !== "s" && !channel.nsfw) {
                            log.log(commandID, "Filtered", info.rating);
                            filteredNSFW++;
                            continue;
                        }
                        /** @type {string?} */
                        let tagString = null;
                        /** @type {string?} */
                        let md5 = null;
                        /** @type {number?} */
                        let fileSize = null;
                        /** @type {number?} */
                        let fileWidth = null;
                        /** @type {number?} */
                        let fileHeight = null;
                        /** @type {string?} */
                        let fileExt = null;
                        /** @type {string?} */
                        let fileURL = null;
                        /** @type {string?} */
                        let sampleURL = null;
                        /** @type {Date?} */
                        let updatedAt = null;
                        /** @type {number?} */
                        let score = null;

                        switch (type) {
                            case "danbooru":
                                /** @ts-ignore @type {booru.DanBooruItem} */
                                const danbooru = info;
                                tagString = escapeMarkdown(danbooru.tag_string);
                                score = danbooru.score;
                                md5 = danbooru.md5;
                                fileSize = danbooru.file_size;
                                fileWidth = danbooru.image_width;
                                fileHeight = danbooru.image_height;
                                fileExt = danbooru.file_ext;
                                fileURL = danbooru.file_url;
                                sampleURL = danbooru.large_file_url;
                                updatedAt = new Date(danbooru.updated_at);
                                break;
                            case "moebooru":
                                /** @ts-ignore @type {booru.MoeBooruItem} */
                                const moebooru = info;
                                tagString = escapeMarkdown(moebooru.tags);
                                score = moebooru.score;
                                md5 = moebooru.md5;
                                fileSize = moebooru.file_size;
                                fileWidth = moebooru.width;
                                fileHeight = moebooru.height;
                                fileExt = moebooru.file_ext;
                                fileURL = moebooru.file_url;
                                sampleURL = moebooru.sample_url;
                                updatedAt = new Date(moebooru.updated_at * 1000);
                                break;
                            case "e621ng":
                                /** @ts-ignore @type {booru.E621NGItem} */
                                const e621ng = info;
                                tagString = escapeMarkdown(Object.values(e621ng.tags).flat().join(" "));
                                score = e621ng.score.total;
                                md5 = e621ng.file.md5;
                                fileSize = e621ng.file.size;
                                fileWidth = e621ng.file.width;
                                fileHeight = e621ng.file.height;
                                fileExt = e621ng.file.ext;
                                fileURL = e621ng.file.url;
                                sampleURL = e621ng.sample.url;
                                updatedAt = new Date(e621ng.updated_at);
                                break;
                        }
                        log.log(commandID, "Image", fileURL);
                        if (tagString.length > 400) {
                            tagString = tagString.substring(0, 400) + " …";
                        }
                        const builder = new EmbedBuilder()
                            .setURL(`${show}${info.id}`)
                            .setTitle(`${info.id} ${md5}`)
                            .setDescription(`原图：[${fileExt.toUpperCase()}, ${fileSizeToString(fileSize)}](${fileURL})`)
                            .addFields(
                                { name: "评级", value: rating, inline: true },
                                { name: "评分", value: score.toString(), inline: true },
                                { name: "原图分辨率", value: `${fileWidth}x${fileHeight}`, inline: true },
                                { name: "标签", value: tagString }
                            )
                            .setImage(sampleURL)
                            .setTimestamp(updatedAt);
                        embeds.push(builder);
                    }

                    if (filteredNSFW > 0 && !channel.nsfw) {
                        content = `您正在尝试在无年龄限制的频道内访问NSFW内容（已过滤${filteredNSFW}张）。请移步至有年龄限制的频道。`;
                    }

                    if (error > 0) {
                        if (content !== null) {
                            content += `\n出现${error}个错误`;
                        } else {
                            content = `出现${error}个错误`;
                        }
                        if (errorMessages.length === 0) {
                            content += "。";
                        } else {
                            content += "，包括：\n" + errorMessages.join("\n");
                        }
                    }

                    if (!content && !embeds.length) {
                        content = "无返回图片！";
                    }

                    log.log(commandID, "Return", JSON.stringify(content), embeds.length);
                    await interaction.editReply({ content: content, embeds: embeds });
                }
                break;
        }
    },
};