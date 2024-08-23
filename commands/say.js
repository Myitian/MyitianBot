const { SlashCommandBuilder } = require("discord.js");
const log = require("../log");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("say")
		.setDescription("让机器人代替你说话")
		.addStringOption(option =>
			option.setName("content")
				.setDescription("内容")
				.setRequired(true)),
	async execute(interaction) {
		log.log("say");
		await interaction.reply(interaction.options.getString("content"));
	},
};