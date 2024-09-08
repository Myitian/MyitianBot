const { SlashCommandBuilder } = require("discord.js");
const log = require("../log");

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
                        .setRequired(true))),
    async execute(interaction, client) {
        await interaction.deferReply();
        /** @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        const subcommand = options.getSubcommand();
        switch (subcommand) {
            case "status":
                {
                    const status = options.getString("value");
        			client.user.setStatus(status);
        			interaction.editReply(status);
                }
                break;
        }
    },
};