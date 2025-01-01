const { SlashCommandBuilder, escapeMarkdown, CommandInteractionOptionResolver, CommandInteraction, Message } = require("discord.js");
const axios = require("axios");
const log = require("../log");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete")
        .setDescription("删除消息")
        .addStringOption(option =>
            option.setName("id")
                .setDescription("消息ID")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("channel")
                .setDescription("频道ID")),
    /** @param {CommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply();
        /** @type {CommandInteractionOptionResolver} */
        // @ts-ignore
        const options = interaction.options;
        const id = options.getString("id");
        const channel = options.getString("channel");
        if (channel === null) {
            await interaction.editReply(`正在搜索频道……`);
            const gulids = await interaction.client.guilds.fetch();
            for (const iter of gulids) {
                const gulid = await iter[1].fetch();
                const channels = await gulid.channels.fetch();
                for (const it of channels) {
                    try {
                        /** @type {import("discord.js").TextBasedChannel} */
                        // @ts-ignore
                        const channel = await it[1].fetch();
                        log.log("Check Channel", channel.id);
                        /** @type {Message?} */
                        const messageObj = await channel.messages.fetch(id);
                        if (messageObj !== null) {
                            await interaction.editReply(`尝试删除 ${messageObj.id} ！`);
                            await messageObj.delete();
                            await interaction.editReply(`已删除 ${messageObj.id} ！`);
                            return;
                        }
                    } catch { }
                }
            }
            await interaction.editReply("未找到消息！");
        } else {
            log.log("Delete", id, "from", channel);
            /** @type {import("discord.js").TextBasedChannel} */
            // @ts-ignore
            const channelObj = await interaction.client.channels.fetch(channel);
            if (channelObj === null) {
                await interaction.editReply("未找到频道！");
                return;
            }
            /** @type {Message?} */
            const messageObj = await channelObj.messages.fetch(id);
            if (messageObj === null) {
                await interaction.editReply("未找到消息！");
                return;
            }
            await interaction.editReply(`尝试删除 ${messageObj.id} ！`);
            await messageObj.delete();
            await interaction.editReply(`已删除 ${messageObj.id} ！`);
        }
    },
};