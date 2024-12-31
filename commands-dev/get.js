const { SlashCommandBuilder, escapeMarkdown, CommandInteractionOptionResolver, CommandInteraction } = require("discord.js");
const axios = require("axios");
const log = require("../log");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("get")
        .setDescription("HTTP GET")
        .addStringOption(option =>
            option.setName("url")
                .setDescription("URL")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("user-agent")
                .setDescription("User Agent"))
        .addStringOption(option =>
            option.setName("authorization")
                .setDescription("Authorization")),
    /** @param {CommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply();
        /** @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        const url = options.getString("url");
        const ua = options.getString("user-agent");
        const auth = options.getString("authorization");
        log.log("Requesting", url);
        const headers = {};
        if (ua != null) {
            headers["User-Agent"] = ua;
        }
        if (auth != null) {
            headers["Authorization"] = auth;
        }
        const resp = await axios({
            method: "get",
            url: url,
            responseType: "text",
            headers: headers
        });
        /** @type {string} */
        let data = resp.data;
        if (data.length == 0) {
            await interaction.editReply("-# 无响应正文！");
            return;
        }
        let first = true;
        while (data.length > 0) {
            const part = data.substring(0, 1000);
            if (first) {
                first = false;
                await interaction.editReply(escapeMarkdown(part));
            } else {
                await interaction.followUp(escapeMarkdown(part));
            }
            data = data.substring(1000);
        }
    },
};