const { SlashCommandBuilder } = require("discord.js");
const log = require("../log");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Pong!"),
	async execute(interaction, client) {
		log.log("ping");
		await interaction.reply("Pong!");
	},
};