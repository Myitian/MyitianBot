const fs = require("node:fs");
const path = require("node:path");
const { REST, Routes } = require("discord.js");
const { clientID, guildID, token } = require("./config.json");
const log = require("./log");

module.exports = {
    async deployCommands() {

        const commands = [];
        const commandsPath = path.join(__dirname, "commands");
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
        log.log(commandFiles);
        
        for (const file of commandFiles) {
            log.log(file);
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ("data" in command && "execute" in command) {
                try {
                    commands.push(command.data.toJSON());
                } catch (e) {
                    log.log(e);
                }
            } else {
                log.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }

        const commandsDev = [];
        const commandsDevPath = path.join(__dirname, "commands-dev");
        const commandDevFiles = fs.readdirSync(commandsDevPath).filter(file => file.endsWith(".js"));
        log.log(commandDevFiles);

        for (const file of commandDevFiles) {
            const filePath = path.join(commandsDevPath, file);
            const command = require(filePath);
            command.data.name = "dev-" + command.data.name;
            if ("data" in command && "execute" in command) {
                try {
                    commandsDev.push(command.data.toJSON());
                } catch (e) {
                    log.log(e);
                }
            } else {
                log.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }

        const rest = new REST().setToken(token);

        try {
            log.log(`Started refreshing ${commands.length}(${commandsDev.length} dev) application (/) commands.`);

            const data = await rest.put(
                Routes.applicationCommands(clientID),
                { body: commands },
            );

            const dataDev = await rest.put(
                Routes.applicationGuildCommands(clientID, guildID),
                { body: commandsDev },
            );

            log.log(`Successfully reloaded ${data.length}(${dataDev.length} dev) application (/) commands.`);
        } catch (error) {
            log.error(error);
        }
    }
}