const { SlashCommandBuilder, CommandInteraction } = require("discord.js");
const log = require("../log");
const { formatDateTime } = require("../utils");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Pong!"),
	/** @param {CommandInteraction} interaction */
	async execute(interaction) {
		log.log("ping");
		await interaction.reply("Pong!");
		const now = new Date();
		const latency = now.getTime() - interaction.createdAt.getTime();
		const time = formatDateTime(now);
		await interaction.editReply(`Pong! ${latency}ms\n${time} (UTC+8)`);
	},
};