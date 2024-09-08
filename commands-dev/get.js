const { SlashCommandBuilder, escapeMarkdown } = require("discord.js");
const axios = require("axios").default;
const log = require("../log");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("get")
		.setDescription("HTTP GET")
		.addStringOption(option =>
			option.setName("url")
				.setDescription("URL")
				.setRequired(true)),
	async execute(interaction, client) {
        await interaction.deferReply();
		const url = interaction.options.getString("url");
		log.log("Requesting", url);
		const resp = await axios({
			method: "get",
			url: url,
			responseType: "text"
		});
		await interaction.editReply(escapeMarkdown(resp.data));
	},
};