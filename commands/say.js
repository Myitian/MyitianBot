const { SlashCommandBuilder } = require("discord.js");
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
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("escaped")
                .setDescription("让机器人代替你说话（C#字符串转义模式）")
                .addStringOption(option =>
                    option.setName("content")
                        .setDescription("内容")
                        .setRequired(true))),
    async execute(interaction, client) {
        /** @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        const subcommand = options.getSubcommand();
        const content = options.getString("content");
        log.log("say", subcommand);
        switch (subcommand) {
            case "raw":
                await interaction.reply(content);
                return;
            case "escaped":
                await interaction.reply(escapeCSharpString(content));
                return;
        }
    },
};