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
		const create = interaction.createdAt;
		const resp = await interaction.reply("Pong!");
		const latency = resp.createdAt - create
		const time = formatDateTime(new Date());
		await interaction.editReply(`Pong! ${latency}ms\n${time} (UTC+8)`);
	},
};