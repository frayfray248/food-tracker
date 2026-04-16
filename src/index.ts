import { Client } from "discord.js";
import { deployCommands } from "./deploy-commands.js";
import { commands } from "./commands/index.js";
import { config } from "./config.js";

const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

client.once("clientReady", () => {
    console.log("Discord bot is ready! 🤖");
});

client.on("guildCreate", async (guild) => {
    await deployCommands({ guildId: guild.id });
});



client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const { commandName } = interaction;

    const command = commands[commandName as keyof typeof commands]

    if (command) {
        command.execute(interaction);
    }
});


client.login(config.DISCORD_BOT_TOKEN);