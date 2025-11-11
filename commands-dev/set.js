const { SlashCommandBuilder, CommandInteractionOptionResolver, CommandInteraction } = require("discord.js");
const log = require("../log");
const { sharedData } = require("../utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set")
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
                        ]))),
    /** @param {CommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply();
        /** @ts-ignore @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        const subcommand = options.getSubcommand();
        switch (subcommand) {
            case "status":
                {
                    const status = options.getString("value");
                    // @ts-ignore
                    interaction.client.user.setStatus(status);
                    await interaction.editReply(status);
                }
                break;
        }
    },
};