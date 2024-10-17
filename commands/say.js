const { SlashCommandBuilder, escapeMarkdown, CommandInteraction, CommandInteractionOptionResolver } = require("discord.js");
const log = require("../log");
const { escapeCSharpString } = require("../utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("让机器人代替你说话")
        .addSubcommand(subcommand =>
            subcommand
                .setName("raw")
                .setDescription("让机器人代替你说话（原始）")
                .addStringOption(option =>
                    option.setName("content")
                        .setDescription("内容")
                        .setRequired(true))
                .addAttachmentOption(option =>
                    option.setName("attachment")
                        .setDescription("附件"))
                .addStringOption(option =>
                    option.setName("reference")
                        .setDescription("引用")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("plain")
                .setDescription("让机器人代替你说话（纯文本模式）")
                .addStringOption(option =>
                    option.setName("content")
                        .setDescription("内容")
                        .setRequired(true))
                .addAttachmentOption(option =>
                    option.setName("attachment")
                        .setDescription("附件"))
                .addStringOption(option =>
                    option.setName("reference")
                        .setDescription("引用")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("base64")
                .setDescription("让机器人代替你说话（Base64模式）")
                .addStringOption(option =>
                    option.setName("content")
                        .setDescription("内容")
                        .setRequired(true))
                .addAttachmentOption(option =>
                    option.setName("attachment")
                        .setDescription("附件"))
                .addStringOption(option =>
                    option.setName("reference")
                        .setDescription("引用")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("hex")
                .setDescription("让机器人代替你说话（十六进制模式）")
                .addStringOption(option =>
                    option.setName("content")
                        .setDescription("内容")
                        .setRequired(true))
                .addAttachmentOption(option =>
                    option.setName("attachment")
                        .setDescription("附件"))
                .addStringOption(option =>
                    option.setName("reference")
                        .setDescription("引用")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("escaped")
                .setDescription("让机器人代替你说话（C#字符串转义模式）")
                .addStringOption(option =>
                    option.setName("content")
                        .setDescription("内容")
                        .setRequired(true))
                .addAttachmentOption(option =>
                    option.setName("attachment")
                        .setDescription("附件"))
                .addStringOption(option =>
                    option.setName("reference")
                        .setDescription("引用"))),
    /** @param {CommandInteraction} interaction */
    async execute(interaction) {
        /** @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        const subcommand = options.getSubcommand();
        let content = options.getString("content");
        const attachment = options.getAttachment("attachment");
        const reference = options.getString("reference");
        log.log("say", subcommand);
        const files = attachment == null ? null : [attachment];
        switch (subcommand) {
            case "raw":
                break;
            case "plain":
                content = escapeMarkdown(content);
                break;
            case "base64":
                content = new TextDecoder().decode(Buffer.from(content, "base64"));
                break;
            case "hex":
                content = new TextDecoder().decode(Buffer.from(content, "hex"));
                break;
            case "escaped":
                content = escapeCSharpString(content);
                break;
        }
        if (reference == null) {
            await interaction.reply({ content: content, files: files });
            return;
        } else {
            await interaction.reply({ content: "正在发送……", ephemeral: true });
            await interaction.channel.send({ content: content, files: files, reply: { messageReference: reference, failIfNotExists: false } });
        }
    },
};