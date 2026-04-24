const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits, Partials, MessageType } = require("discord.js");
const { token } = require("./config.json");
const { deployCommands } = require("./deploy-commands");
const { printError } = require("./utils");
const log = require("./log");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction
    ]
})

const commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        commands.set(command.data.name, command);
    } else {
        log.warn(`位于 ${filePath} 缺失必要的 "data" 或 "execute" 属性。`);
    }
}

const commandsDevPath = path.join(__dirname, "commands-dev");
const commandDevFiles = fs.readdirSync(commandsDevPath).filter(file => file.endsWith(".js"));

for (const file of commandDevFiles) {
    const filePath = path.join(commandsDevPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        commands.set(command.data.name, command);
    } else {
        log.warn(`位于 ${filePath} 缺失必要的 "data" 或 "execute" 属性。`);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = commands.get(interaction.commandName);
        if (!command) {
            log.error(`未找到匹配 ${interaction.commandName} 的命令。`);
            return;
        }
        try {
            try {
                await command.execute(interaction);
            } catch (e) {
                const error = e instanceof Error ? e : new Error(e);
                log.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: `执行命令时出现异常！\n${printError(error).substring(0, 1000)}`, ephemeral: true });
                } else {
                    await interaction.reply({ content: `执行命令时出现异常！\n${printError(error).substring(0, 1000)}`, ephemeral: true });
                }
            }
        } catch (e) {
            const error = e instanceof Error ? e : new Error(e);
            log.error(error);
        }
    }
});

client.once(Events.ClientReady, readyClient => {
    log.log(`初始化完成！以 ${readyClient.user.tag} 身份登录！`);
    deployCommands(readyClient.user.id);
});

client.login(token);