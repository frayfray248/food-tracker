import {
    ActionRowBuilder,
    Client,
    Events,
    LabelBuilder,
    ModalBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import { deployCommands } from "./deploy-commands.js";
import { commands } from "./commands/index.js";
import { config } from "./config.js";

export const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

client.once(Events.ClientReady, () => {
    console.log("Discord bot is ready! 🤖");
    
});

client.on(Events.GuildCreate, async (guild) => {
    await deployCommands({ guildId: guild.id });
});



client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    const command = commands[commandName as keyof typeof commands];

    console.log(`Received command: ${commandName}`);

    if (command) await command.execute(interaction);

});


client.login(config.DISCORD_BOT_TOKEN);