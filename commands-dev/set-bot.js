const { SlashCommandBuilder, CommandInteractionOptionResolver, CommandInteraction } = require("discord.js");
const log = require("../log");
const { sharedData, triggerDDNS } = require("../utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set-bot")
        .setDescription("set bot status")
        .addSubcommand(subcommand =>
            subcommand
                .setName("status")
                .setDescription("set bot status")
                .addStringOption(option =>
                    option.setName("value")
                        .setDescription("value")
                        .setRequired(true)
                        .addChoices([
                            { name: "offline", value: "offline" },
                            { name: "online", value: "online" },
                            { name: "idle", value: "idle" },
                            { name: "dnd", value: "dnd" }
                        ])))
        .addSubcommand(subcommand =>
            subcommand
                .setName("anti-delete")
                .setDescription("防撤回")
                .addBooleanOption(option =>
                    option.setName("value")
                        .setDescription("value")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("ddns")
                .setDescription("DDNS")),
    /** @param {CommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply();
        /** @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        const subcommand = options.getSubcommand();
        switch (subcommand) {
            case "status":
                {
                    const status = options.getString("value");
                    interaction.client.user.setStatus(status);
                    await interaction.editReply(status);
                }
                break;
            case "anti-delete":
                {
                    const status = options.getBoolean("value");
                    if (status != null)
                        sharedData.antiDelete = status;
                    await interaction.editReply(sharedData.antiDelete ? "是" : "否");
                }
                break;
            case "ddns":
                {
                    await triggerDDNS();
                    await interaction.editReply("已发送请求");
                }
                break;
        }
    },
};