import { ChatInputCommandInteraction, CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { ADD_USER_COMMAND_DESCRIPTION, ADD_USER_COMMAND_NAME } from "../const.js";
import { handleCommandError } from "../error/error.js";
import { prisma } from "../db/db.js";


export const name = ADD_USER_COMMAND_NAME;

export const data = new SlashCommandBuilder()
    .setName(ADD_USER_COMMAND_NAME)
    .setDescription(ADD_USER_COMMAND_DESCRIPTION)
    .addUserOption(option => option.setName("user").setDescription("The user to add").setRequired(true));


export const execute = async (interaction: ChatInputCommandInteraction) => {
    try {

        const user = interaction.options.getUser("user", true);

        const existingUser = await prisma.user.findUnique({
            where: {
                id: user.id
            }
        })

        if (existingUser) {
            await interaction.reply({ content: `${user.username} is already in the food tracker!`, flags: ["Ephemeral"] });
            return;
        }

        await prisma.user.create({
            data: {
                id: user.id,
                username: user.username
            }
        })

        await interaction.reply({ content: `Added ${user.username} to the food tracker!`, flags: [MessageFlags.Ephemeral] });

    } catch (error) {

        return handleCommandError(interaction, error);

    }
}