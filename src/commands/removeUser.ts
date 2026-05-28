import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { REMOVE_USER_COMMAND_DESCRIPTION, REMOVE_USER_COMMAND_NAME } from "../const.js";
import { handleCommandError } from "../error/error.js";
import { prisma } from "../db/db.js";


export const name = REMOVE_USER_COMMAND_NAME;

export const data = new SlashCommandBuilder()
    .setName(REMOVE_USER_COMMAND_NAME)
    .setDescription(REMOVE_USER_COMMAND_DESCRIPTION)
    .addUserOption(option => option.setName("user").setDescription("The user to remove").setRequired(true));


export const execute = async (interaction: ChatInputCommandInteraction) => {
    try {

        const user = interaction.options.getUser("user", true);

        const existingUser = await prisma.user.findUnique({
            where: {
                id: user.id
            }
        });

        if (!existingUser) {
            await interaction.reply({ content: `${user.username} is not in the food tracker!`, flags: ["Ephemeral"] });
            return;
        }

        await prisma.user.delete({
            where: {
                id: user.id
            }
        });

        await interaction.reply({ content: `Removed ${user.username} from the food tracker!`, flags: ["Ephemeral"] });

    } catch (error) {

        return handleCommandError(interaction, error);

    }
};
