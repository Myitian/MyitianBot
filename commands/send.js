const { SlashCommandBuilder, escapeMarkdown, CommandInteraction, CommandInteractionOptionResolver, REST, DefaultRestOptions, Routes } = require("discord.js");
const log = require("../log");
const { token } = require("../config.json")
const { escapeCSharpString } = require("../utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("send")
        .setDescription("让机器人发送特殊内容")
        .addSubcommand(subcommand =>
            subcommand
                .setName("file")
                .setDescription("让机器人发送文件")
                .addStringOption(option =>
                    option.setName("text")
                        .setDescription("文本"))
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
                        .setDescription("附件")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("voice")
                .setDescription("让机器人发送语音消息（要求：OPUS OGG）")
                .addAttachmentOption(option =>
                    option.setName("file")
                        .setDescription("文件")
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName("duration")
                        .setDescription("时长"))
                .addStringOption(option =>
                    option.setName("waveform")
                        .setDescription("波形")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("embed")
                .setDescription("让机器人发送嵌入消息")
                .addStringOption(option =>
                    option.setName("text")
                        .setDescription("文本"))
                .addStringOption(option =>
                    option.setName("title")
                        .setDescription("标题"))
                .addAttachmentOption(option =>
                    option.setName("description")
                        .setDescription("简介"))),
    /** @param {CommandInteraction} interaction */
    async execute(interaction) {
        /** @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        const subcommand = options.getSubcommand();
        log.log("send", subcommand);
        const files = attachment == null ? null : [attachment];
        switch (subcommand) {
            case "file":
                const content = options.getString("text");
                const files = [];
                for (let i = 0; i < 10; i++) {
                    const attachment = options.getAttachment(`attachment${i}`);
                    if (attachment != null) {
                        files.push(attachment);
                    }
                }
                await interaction.reply({ content: content, files: files });
                break;
            case "voice":
                await interaction.reply({ content: "正在发送……", ephemeral: true });
                const attachment = options.getAttachment("file");
                const duration = options.getInteger("duration");
                const waveform = options.getString("waveform");
                const rest = new REST().setToken(token);
                await rest.post(
                    Routes.channelMessages(interaction.channel.id),
                    {
                        body: {
                            flags: 8192,
                            attachments: [
                                {
                                    id: "0",
                                    filename: "voice-message.ogg",
                                    url: attachment.url,
                                    proxy_url: attachment.proxyURL,
                                    duration_secs: duration,
                                    waveform: waveform ?? "AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTI"
                                }
                            ]
                        }
                    }
                );
                break;
            case "embed":
                await interaction.reply("NotSupported!");
                break;
        }
    },
};