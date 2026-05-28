import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { handleCommandError } from '../error/error.js';
import { SET_USER_SCORE_COMMAND_DESCRIPTION, SET_USER_SCORE_COMMAND_NAME } from '../const.js';
import { prisma } from '../db/db.js';

export const name = SET_USER_SCORE_COMMAND_NAME;

export const data = new SlashCommandBuilder()
    .setName(SET_USER_SCORE_COMMAND_NAME)
    .setDescription(SET_USER_SCORE_COMMAND_DESCRIPTION)
    .addUserOption(option => option.setName("user").setDescription("The user to set the score of. You may paste a user ID instead.").setRequired(true))
    .addIntegerOption(option => option.setName("score").setDescription("The score to set for the user").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
    try {

        const user = interaction.options.getUser("user", true);
        const score = interaction.options.getInteger("score", true);

        const existingUser = await prisma.user.findUnique({
            where: {
                id: user.id
            }
        });

        if (!existingUser) {
            await interaction.reply({ content: `${user.username} is not in the food tracker!`, flags: ["Ephemeral"] });
            return;
        }

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                score: score
            }
        });

        await interaction.reply({ content: `${user.username}'s score has been set to ${score}.`, flags: ["Ephemeral"] });

    } catch (error) {

        return handleCommandError(interaction, error);

    }

}