const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const { deployCommands } = require("./deploy-commands");
const log = require("./log");

deployCommands();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        log.log(command.data.name);
        client.commands.set(command.data.name, command);
    } else {
        log.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const commandsDevPath = path.join(__dirname, "commands-dev");
const commandDevFiles = fs.readdirSync(commandsDevPath).filter(file => file.endsWith(".js"));

for (const file of commandDevFiles) {
    const filePath = path.join(commandsDevPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        log.log(command.data.name);
        client.commands.set(command.data.name, command);
    } else {
        log.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

log.log("Registered commands:")
for (const [name, cmd] of client.commands) {
    log.log(name)
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        log.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction, interaction.client);
    } catch (error) {
        log.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "执行命令时出现异常！", ephemeral: true });
        } else {
            await interaction.reply({ content: "执行命令时出现异常！", ephemeral: true });
        }
    }
});

client.once(Events.ClientReady, readyClient => {
    log.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);