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
        .addIntegerOption(option =>
            option.setName("max-length")
                .setDescription("Max Length")
                .setMinValue(1))
        .addStringOption(option =>
            option.setName("authorization")
                .setDescription("Authorization")),
    /** @param {CommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply();
        /** @ts-ignore @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        const url = options.getString("url") ?? "";
        const ua = options.getString("user-agent");
        const auth = options.getString("authorization");
        const maxLength = options.getInteger("max-length") ?? undefined;
        log.log("Requesting", url);
        const headers = {};
        if (ua != null) {
            headers["User-Agent"] = ua;
        }
        if (auth != null) {
            headers["Authorization"] = auth;
        }
        const resp = await axios.get(url, {
            responseType: "text",
            // @ts-ignore
            headers: headers
        });
        /** @type {string} */
        let data = resp.data;
        if (data.length == 0) {
            await interaction.editReply("-# 无响应正文！");
            return;
        }
        if (maxLength == null && data.length > 2000) {
            await interaction.editReply("-# 响应正文过长，请指定 max-length");
            return;
        }
        data = data.substring(0, maxLength);
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