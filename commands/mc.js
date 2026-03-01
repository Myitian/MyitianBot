const { SlashCommandBuilder, CommandInteractionOptionResolver, EmbedBuilder, AttachmentBuilder, CommandInteraction } = require("discord.js");
const { randomInt } = require("node:crypto");
const axios = require("axios");
const log = require("../log");
const slp = require("../minecraft/slp")
const text_component = require("../minecraft/text-component")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mc")
        .setDescription("Minecraft 相关")
        .addSubcommand(subcommand =>
            subcommand
                .setName("ping")
                .setDescription("Minecraft Server List Ping")
                .addStringOption(option =>
                    option.setName("host")
                        .setDescription("主机名")
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName("port")
                        .setDescription("端口号")
                        .setMinValue(0)
                        .setMaxValue(65535)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("skin")
                .setDescription("Minecraft 玩家皮肤")
                .addStringOption(option =>
                    option.setName("name")
                        .setDescription("UUID 或玩家名")
                        .setRequired(true))),
    /** @param {CommandInteraction} interaction */
    async execute(interaction) {
        await interaction.deferReply();
        const commandID = `(${randomInt(0x100000000).toString(16).padStart(8, "0")})`;
        /** @ts-ignore @type {CommandInteractionOptionResolver} */
        const options = interaction.options;
        const subcommand = options.getSubcommand();
        switch (subcommand) {
            case "ping":
                {
                    log.log("mc ping");

                    const rawHost = options.getString("host")?.trim() ?? "";
                    const rawPort = options.getInteger("port");

                    const split = rawHost.split(":", 2);
                    const host = split[0];
                    let newPort = Number.parseInt(split[1]);
                    const port = Number.isNaN(newPort) ? rawPort : newPort;

                    let content = null;
                    const embeds = [];
                    const files = [];

                    try {
                        log.log(commandID, host, port);
                        const info = await slp.serverListPing(host, port);
                        const builder = new EmbedBuilder()
                            .setTitle(text_component.asString(info.version.name))
                            .setDescription(text_component.asString(info.description))
                            .addFields(
                                { name: "协议版本", value: info.version?.protocol.toString(), inline: true },
                                { name: "玩家", value: `${info.players?.online}/${info.players?.max}`, inline: true },
                                { name: "地址", value: (rawPort === null || rawPort === undefined || Number.isNaN(rawPort)) ? rawHost : `${rawHost}:${rawPort}`, inline: true }
                            );
                        if (info.favicon) {
                            try {
                                const favicon = Buffer.from(info.favicon.split(",")[1], "base64");
                                files.push(new AttachmentBuilder(favicon)
                                    .setName("favicon.png"));
                                builder.setThumbnail("attachment://favicon.png")
                            } catch { }
                        }
                        embeds.push(builder);
                    } catch (e) {
                        content = "无法解析或连接服务器";
                        if (e?.response?.data)
                            content += `\n${e.response.data}`;
                        else
                            log.error(commandID, e);
                    }

                    log.log(commandID, "Return", JSON.stringify(content), embeds.length);
                    await interaction.editReply({ content: content, embeds: embeds, files: files });
                }
                break;
            case "skin":
                {
                    log.log("mc skin");

                    const name = options.getString("name")?.trim() ?? "";

                    const url = name.length === 32 ?
                        `https://sessionserver.mojang.com/session/minecraft/profile/${name}` :
                        `https://api.mojang.com/users/profiles/minecraft/${name}`;
                    log.log("Requesting", url);

                    const resp = await axios({
                        method: "get",
                        url: url,
                        responseType: "json",
                        validateStatus: () => true
                    });
                    /** @type {{id:string?,name:string?,errorMessage:string?}} */
                    const data = resp.data;

                    let content = data.errorMessage ? data.errorMessage : null;
                    const embeds = [];

                    if (data.id) {
                        embeds.push(new EmbedBuilder()
                            .setTitle(data.name)
                            .setThumbnail(`https://vzge.me/face/512/${data.id}.png?no=ears&nonce=${commandID}`)
                            .addFields(
                                { name: "UUID", value: data.id },
                            )
                            .setImage(`https://vzge.me/full/800/${data.id}.png?no=ears&nonce=${commandID}`));
                        embeds.push(new EmbedBuilder()
                            .setImage(`https://vzge.me/skin/${data.id}.png?no=ears&nonce=${commandID}`));
                    }

                    log.log(commandID, "Return", JSON.stringify(content), embeds.length);
                    await interaction.editReply({ content: content, embeds: embeds });
                }
                break;
        }
    },
};