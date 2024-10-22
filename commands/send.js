const { SlashCommandBuilder, escapeMarkdown, CommandInteraction, CommandInteractionOptionResolver, REST, DefaultRestOptions, Routes, EmbedBuilder } = require("discord.js");
const log = require("../log");
const { token } = require("../config.json")
const { escapeCSharpString } = require("../utils");
const axios = require("axios").default;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("send")
        .setDescription("让机器人发送特殊内容")
        .addSubcommand(subcommand =>
            subcommand
                .setName("file")
                .setDescription("让机器人发送文件")
                .addAttachmentOption(option =>
                    option.setName("attachment0")
                        .setDescription("附件")
                        .setRequired(true))
                .addAttachmentOption(option =>
                    option.setName("attachment1")
                        .setDescription("附件"))
                .addAttachmentOption(option =>
                    option.setName("attachment2")
                        .setDescription("附件"))
                .addAttachmentOption(option =>
                    option.setName("attachment3")
                        .setDescription("附件"))
                .addAttachmentOption(option =>
                    option.setName("attachment4")
                        .setDescription("附件"))
                .addAttachmentOption(option =>
                    option.setName("attachment5")
                        .setDescription("附件"))
                .addAttachmentOption(option =>
                    option.setName("attachment6")
                        .setDescription("附件"))
                .addAttachmentOption(option =>
                    option.setName("attachment7")
                        .setDescription("附件"))
                .addAttachmentOption(option =>
                    option.setName("attachment8")
                        .setDescription("附件"))
                .addAttachmentOption(option =>
                    option.setName("attachment9")
                        .setDescription("附件"))
                .addStringOption(option =>
                    option.setName("text")
                        .setDescription("文本")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("voice")
                .setDescription("让机器人发送语音消息（要求：OGG/FLAC/WAV/MP3）")
                .addAttachmentOption(option =>
                    option.setName("file")
                        .setDescription("文件")
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName("duration")
                        .setDescription("时长（秒）"))
                .addStringOption(option =>
                    option.setName("waveform")
                        .setDescription("波形（Base64编码字节数组）")))
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
        /** @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        const subcommand = options.getSubcommand();
        log.log("send", subcommand);
        switch (subcommand) {
            case "file":
                await interaction.deferReply();
                const content = options.getString("text");
                const files = [];
                for (let i = 0; i < 10; i++) {
                    const attachment = options.getAttachment(`attachment${i}`);
                    if (attachment != null) {
                        files.push(attachment);
                    }
                }
                await interaction.editReply({ content: content, files: files });
                break;
            case "voice":
                await interaction.reply({ content: "正在准备……", ephemeral: true });
                const attachment = options.getAttachment("file");
                const duration = options.getInteger("duration");
                const waveform = options.getString("waveform");
                const rest = new REST().setToken(token);

                await interaction.editReply("正在获取上传链接……");
                /** @type {{attachments:{id:number,upload_url:string,upload_filename:string}[]}} */
                const resp = await rest.post(
                    `/channels/${interaction.channel.id}/attachments`,
                    {
                        body: {
                            files: [
                                {
                                    id: 2,
                                    filename: attachment.name,
                                    file_size: attachment.size
                                }
                            ]
                        }
                    }
                );
                await interaction.editReply("正在下载文件……");
                const fileResp = await axios.get(
                    attachment.proxyURL ?? attachment.url,
                    {
                        responseType: "arraybuffer"
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
                                    filename: attachment.name,
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
                embed.addFields({ i })
                await interaction.editReply({ content: options.getString("text"), embeds: [embed] });
                break;
        }
    },
};