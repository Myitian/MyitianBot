const { SlashCommandBuilder, CommandInteractionOptionResolver, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { randomInt } = require("node:crypto");
const axios = require("axios").default;
const lolicon_api_v1 = require("../apis/lolicon-api-v1")
const anosu = require("../apis/anosu");
const jitsu = require("../apis/jitsu");
const mirlkoi = require("../apis/mirlkoi");
const log = require("../log");
const yandere = require("../apis/yandere");
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
                        .setDescription("返回指定 UID 作者的作品，可用竖线分隔多个 UID"))
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
                .addBooleanOption(option =>
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
                .setName("yandere")
                .setDescription("yande.re")
                .addStringOption(option =>
                    option.setName("tags")
                        .setDescription("图像标签，用+连接"))
                .addIntegerOption(option =>
                    option.setName("num")
                        .setDescription("数量")
                        .setMinValue(1)
                        .setMaxValue(10))
                .addBooleanOption(option =>
                    option.setName("random")
                        .setDescription("是否随机抽取"))),

    async execute(interaction, client) {
        await interaction.deferReply();
        const commandID = `(${randomInt(0x100000000).toString(16).padStart(8, "0")})`;
        /** @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        const subcommand = options.getSubcommand();
        switch (subcommand) {
            case "lolicon-api-v1":
                {
                    const r18 = options.getInteger("r18");
                    const keyword = options.getString("keyword");
                    const num = options.getInteger("num");

                    let content = null;
                    const embeds = [];

                    let filteredNSFW = 0;

                    const response = await lolicon_api_v1.getJson(r18, keyword, num);

                    if (response.code === 0 && response.data) {
                        for (const setu of response.data) {
                            log.log(commandID, "Image", setu.url);
                            if (setu.r18 && !interaction.channel.nsfw) {
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
                                    { name: "标签", value: setu.tags.map(t => "#" + t).join(" ") },
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

                    if (filteredNSFW > 0 && !interaction.channel.nsfw)
                        content = `您正在尝试在无年龄限制的频道内访问NSFW内容（已过滤${filteredNSFW}张）。请移步至有年龄限制的频道。`;

                    if (!content && !embeds.length)
                        content = "无返回图片！";

                    log.log(commandID, "Return", JSON.stringify(content), embeds.length);
                    await interaction.editReply({ content: content, embeds: embeds });
                }
                break;
            case "lolicon-api-v2":
                {
                    let content = null;
                    const embeds = [];

                    content = "尚未实现！";

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
                            if (setu.r18 && !interaction.channel.nsfw) {
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

                    if (filteredNSFW > 0 && !interaction.channel.nsfw)
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

                    if ((sort === "r18" || sort === "!special") && !interaction.channel.nsfw) {
                        content = "您正在尝试在无年龄限制的频道内访问NSFW内容。请移步至有年龄限制的频道。";
                    } else {
                        if (sort === "!special") {
                            const response = await jitsu.getSpecialR18Json(sort, num);
                            if (response.pic) {
                                log.log(commandID, "Image", response.pic);
                                embeds.push(new EmbedBuilder()
                                    .setImage(response.pic));
                            }
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
            case "yandere":
                {
                    const tags = options.getString("tags") ?? "";
                    const num = options.getInteger("num") ?? 1;
                    const random = options.getBoolean("random") ?? true;

                    let content = null;
                    const embeds = [];

                    const response = random ?
                        await yandere.getRandom(tags, num) :
                        await yandere.getNewest(tags, num);

                    let filteredNSFW = 0;

                    for (const info of response) {
                        log.log(commandID, "Image", info.file_url);
                        let rating = null;
                        switch (info.rating) {
                            case "s":
                                rating = "安全";
                                break;
                            case "q":
                                rating = "可疑";
                                break;
                            case "e":
                                rating = "暴露";
                                break;
                        }
                        if (info.rating !== "s" && !interaction.channel.nsfw) {
                            log.log(commandID, "Filtered", info.rating);
                            filteredNSFW++;
                            continue;
                        }
                        embeds.push(new EmbedBuilder()
                            .setTitle(info.md5)
                            .setURL(`https://yande.re/post/show/${info.id}`)
                            .setImage(info.sample_url)
                            .setDescription(`原图：[${info.file_ext.toUpperCase()},${fileSizeToString(info.file_size)}](${info.file_url})`)
                            .addFields(
                                { name: "评级", value: rating, inline: true },
                                { name: "评分", value: info.score.toString(), inline: true },
                                { name: "原图分辨率", value: `${info.width}x${info.height}`, inline: true },
                                { name: "标签", value: info.tags }
                            )
                            .setTimestamp(new Date(info.updated_at * 1000)));
                    }

                    if (filteredNSFW > 0 && !interaction.channel.nsfw)
                        content = `您正在尝试在无年龄限制的频道内访问NSFW内容（已过滤${filteredNSFW}张）。请移步至有年龄限制的频道。`;

                    if (!content && !embeds.length)
                        content = "无返回图片！";

                    log.log(commandID, "Return", JSON.stringify(content), embeds.length);
                    await interaction.editReply({ content: content, embeds: embeds });
                }
                break;
        }
    },
};