const { SlashCommandBuilder, escapeMarkdown, CommandInteraction, CommandInteractionOptionResolver, REST, DiscordAPIError, Routes, EmbedBuilder, Attachment, AttachmentBuilder } = require("discord.js");
const log = require("../log");
const { token } = require("../config.json")
const { escapeCSharpString, getFile } = require("../utils");
const axios = require("axios");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("send")
        .setDescription("让机器人发送特殊内容")
        .addSubcommand(subcommand =>
            subcommand
                .setName("file")
                .setDescription("让机器人发送文件（小于10MiB）")
                .addAttachmentOption(option =>
                    option.setName("attachment")
                        .setDescription("附件"))
                .addStringOption(option =>
                    option.setName("attachment-link")
                        .setDescription("附件链接"))
                .addStringOption(option =>
                    option.setName("name")
                        .setDescription("名称"))
                .addStringOption(option =>
                    option.setName("description")
                        .setDescription("简介"))
                .addBooleanOption(option =>
                    option.setName("spoiler")
                        .setDescription("剧透"))
                .addStringOption(option =>
                    option.setName("text")
                        .setDescription("附加文本"))
                .addStringOption(option =>
                    option.setName("ext-header-0")
                        .setDescription("用于链接的额外请求头0"))
                .addStringOption(option =>
                    option.setName("ext-header-1")
                        .setDescription("用于链接的额外请求头1"))
                .addStringOption(option =>
                    option.setName("ext-header-2")
                        .setDescription("用于链接的额外请求头2"))
                .addStringOption(option =>
                    option.setName("ext-header-3")
                        .setDescription("用于链接的额外请求头3")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("voice")
                .setDescription("让机器人发送语音消息（要求：OGG/FLAC/WAV/MP3，小于10MiB）")
                .addAttachmentOption(option =>
                    option.setName("file")
                        .setDescription("文件"))
                .addStringOption(option =>
                    option.setName("file-link")
                        .setDescription("文件链接"))
                .addIntegerOption(option =>
                    option.setName("duration")
                        .setDescription("时长（秒）"))
                .addStringOption(option =>
                    option.setName("waveform")
                        .setDescription("波形预览（Base64编码字节数组）"))
                .addStringOption(option =>
                    option.setName("ext-header-0")
                        .setDescription("用于链接的额外请求头0"))
                .addStringOption(option =>
                    option.setName("ext-header-1")
                        .setDescription("用于链接的额外请求头1"))
                .addStringOption(option =>
                    option.setName("ext-header-2")
                        .setDescription("用于链接的额外请求头2"))
                .addStringOption(option =>
                    option.setName("ext-header-3")
                        .setDescription("用于链接的额外请求头3")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("embed")
                .setDescription("让机器人发送嵌入消息")
                .addStringOption(option =>
                    option.setName("color")
                        .setDescription("颜色"))
                .addStringOption(option =>
                    option.setName("author-name")
                        .setDescription("作者名称"))
                .addStringOption(option =>
                    option.setName("author-url")
                        .setDescription("作者链接"))
                .addStringOption(option =>
                    option.setName("author-icon")
                        .setDescription("作者图标链接"))
                .addStringOption(option =>
                    option.setName("title")
                        .setDescription("标题"))
                .addStringOption(option =>
                    option.setName("url")
                        .setDescription("链接"))
                .addStringOption(option =>
                    option.setName("description")
                        .setDescription("简介"))
                .addStringOption(option =>
                    option.setName("description-escaped")
                        .setDescription("简介（C#字符串转义模式）"))
                .addStringOption(option =>
                    option.setName("thumbnail")
                        .setDescription("缩略图"))
                .addStringOption(option =>
                    option.setName("image")
                        .setDescription("图像"))
                .addStringOption(option =>
                    option.setName("footer-text")
                        .setDescription("尾部文字"))
                .addStringOption(option =>
                    option.setName("footer-icon")
                        .setDescription("尾部图标链接"))
                .addIntegerOption(option =>
                    option.setName("timestamp")
                        .setDescription("时间戳"))
                .addStringOption(option =>
                    option.setName("field0-name")
                        .setDescription("字段0名称"))
                .addStringOption(option =>
                    option.setName("field0-value")
                        .setDescription("字段0值"))
                .addBooleanOption(option =>
                    option.setName("field0-inline")
                        .setDescription("字段0内联"))
                .addStringOption(option =>
                    option.setName("field1-name")
                        .setDescription("字段1名称"))
                .addStringOption(option =>
                    option.setName("field1-value")
                        .setDescription("字段1值"))
                .addBooleanOption(option =>
                    option.setName("field1-inline")
                        .setDescription("字段1内联"))
                .addStringOption(option =>
                    option.setName("field2-name")
                        .setDescription("字段2名称"))
                .addStringOption(option =>
                    option.setName("field2-value")
                        .setDescription("字段2值"))
                .addBooleanOption(option =>
                    option.setName("field2-inline")
                        .setDescription("字段2内联"))
                .addStringOption(option =>
                    option.setName("text")
                        .setDescription("附加文本"))),
    /** @param {CommandInteraction} interaction */
    async execute(interaction) {
        /** @ts-ignore @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        const subcommand = options.getSubcommand();
        log.log("send", subcommand);
        try {
            switch (subcommand) {
                case "file":
                    {
                        await interaction.deferReply();
                        const content = options.getString("text");
                        const files = [];
                        /** @type {Attachment|AttachmentBuilder} */
                        let attachment = options.getAttachment("attachment");
                        const link = options.getString("attachment-link");
                        const name = options.getString("name");
                        const description = options.getString("description");
                        const spoiler = options.getBoolean("spoiler");
                        if (attachment == null) {
                            if (link == null) {
                                await interaction.editReply({ content: "请至少提供一种文件来源！" });
                                break;
                            }
                            await interaction.editReply({ content: "正在下载文件……" });

                            const extHeaders = [
                                options.getString("ext-header-0"),
                                options.getString("ext-header-1"),
                                options.getString("ext-header-2"),
                                options.getString("ext-header-3")
                            ];
                            const fileResp = await getFile(link, "file", extHeaders);
                            attachment = new AttachmentBuilder(fileResp.data).setName(fileResp.name);
                            if (spoiler != null) {
                                attachment.setSpoiler(spoiler);
                            }
                        }
                        if (name != null) {
                            attachment.name = name;
                        }
                        if (description != null) {
                            attachment.description = description;
                        }
                        files.push(attachment);
                        await interaction.editReply({ content: content, files: files });
                    }
                    break;
                case "voice":
                    await interaction.reply({ content: "正在准备……", ephemeral: true });
                    const attachment = options.getAttachment("file");
                    let attachmentLink = options.getString("file-link");
                    const duration = options.getInteger("duration");
                    const waveform = options.getString("waveform");
                    const rest = new REST().setToken(token);
                    if (attachment == null && attachmentLink == null) {
                        await interaction.editReply({ content: "请至少提供一种文件来源！" });
                        break;
                    }
                    await interaction.editReply("正在下载文件……");
                    let filename = null;
                    let file_size = -1;
                    if (attachment != null) {
                        attachmentLink = attachment.proxyURL ?? attachment.url;
                        filename = attachment.name;
                        file_size = attachment.size;
                    }
                    const extHeaders = [
                        options.getString("ext-header-0"),
                        options.getString("ext-header-1"),
                        options.getString("ext-header-2"),
                        options.getString("ext-header-3")
                    ];
                    const fileResp = await getFile(attachmentLink, "voice.ogg", extHeaders);
                    await interaction.editReply("正在获取上传链接……");
                    /** @ts-ignore @type {{attachments:{id:number,upload_url:string,upload_filename:string}[]}} */
                    const resp = await rest.post(
                        `/channels/${interaction.channel.id}/attachments`,
                        {
                            body: {
                                files: [
                                    {
                                        id: 2,
                                        filename: fileResp.name,
                                        file_size: fileResp.data.byteLength
                                    }
                                ]
                            }
                        }
                    );
                    await interaction.editReply("正在上传文件……");
                    await axios.put(
                        resp.attachments[0].upload_url,
                        fileResp.data,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bot ${token}`
                            }
                        }
                    );
                    await interaction.editReply("正在发送……");
                    await rest.post(
                        Routes.channelMessages(interaction.channel.id),
                        {
                            body: {
                                flags: 8192,
                                attachments: [
                                    {
                                        id: "0",
                                        filename: attachment?.name ?? fileResp.name,
                                        uploaded_filename: resp.attachments[0].upload_filename,
                                        duration_secs: duration ?? 0,
                                        waveform: waveform ?? "AA=="
                                    }
                                ]
                            }
                        }
                    );
                    break;
                case "embed":
                    await interaction.deferReply();
                    const embed = new EmbedBuilder();
                    // @ts-ignore
                    embed.setColor(options.getString("color"));
                    const authorName = options.getString("author-name");
                    const authorIcon = options.getString("author-icon");
                    if (authorName || authorIcon)
                        embed.setAuthor({
                            name: authorName ?? "\u200B",
                            url: options.getString("author-url"),
                            iconURL: authorIcon
                        });
                    embed.setTitle(options.getString("title"));
                    embed.setURL(options.getString("url"));
                    const descEsc = options.getString("description-escaped");
                    const desc = options.getString("description");
                    embed.setDescription(descEsc ? escapeCSharpString(descEsc) : desc);
                    embed.setThumbnail(options.getString("thumbnail"));
                    embed.setImage(options.getString("image"));
                    const footerText = options.getString("footer-text");
                    const footerIcon = options.getString("footer-icon");
                    if (footerText || footerIcon)
                        embed.setFooter({
                            text: footerText ?? "\u200B",
                            iconURL: footerIcon
                        })
                    embed.setTimestamp(options.getInteger("timestamp"));
                    for (let i = 0; i < 3; i++) {
                        const fieldName = options.getString(`field${i}-name`);
                        const fieldValue = options.getString(`field${i}-value`);
                        if (fieldName == null && fieldValue == null)
                            continue;
                        const fieldInline = options.getBoolean(`field${i}-inline`);
                        embed.addFields({
                            name: fieldName ?? "\u200B",
                            value: fieldValue ?? "\u200B",
                            inline: fieldInline ?? false
                        });
                    }
                    await interaction.editReply({ content: options.getString("text"), embeds: [embed] });
                    break;
            }
        } catch (error) {
            if (error instanceof DiscordAPIError) {
                switch (error.code) {
                    case 40005:
                        await interaction.editReply("文件过大，无法发送。");
                        return;
                    case 50160:
                        await interaction.editReply("附件无效。语音消息必须有一个音频附件。");
                        return;
                }
            }
            throw error;
        }
    }
};