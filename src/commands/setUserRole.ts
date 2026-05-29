import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SET_USER_ROLE_COMMAND_DESCRIPTION, SET_USER_ROLE_COMMAND_NAME, USER_ROLE } from "../const.js";
import { prisma } from "../db/db.js";
import { handleCommandError } from "../error/error.js";
import { checkAuth } from "../utils/utils.js";

export const name = SET_USER_ROLE_COMMAND_NAME;

export const data = new SlashCommandBuilder()
    .setName(SET_USER_ROLE_COMMAND_NAME)
    .setDescription(SET_USER_ROLE_COMMAND_DESCRIPTION)
    .addUserOption(option => option.setName("user").setDescription("The user to set the role of. You may paste a user ID instead.").setRequired(true))
    .addStringOption(option =>
        option
            .setName("role")
            .setDescription("The role to set for the user")
            .setRequired(true)
            .addChoices(
                { name: "admin", value: USER_ROLE.ADMIN },
                { name: "user", value: USER_ROLE.USER }
            )
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await checkAuth(interaction);

        const user = interaction.options.getUser("user", true);
        const role = interaction.options.getString("role", true) as USER_ROLE;

        const existingUser = await prisma.user.findUnique({
            where: {
                id: user.id
            }
        });

        if (!existingUser) {
            await interaction.reply({ content: `${user.username} is not in the food tracker!` });
            return;
        }

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                role
            }
        });

        await interaction.reply({ content: `${user.username}'s role has been set to ${role}.` });
    } catch (error) {
        return handleCommandError(interaction, error);
    }
}
