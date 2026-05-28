import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { REPORT_COMMAND_DESCRIPTION, REPORT_COMMAND_NAME, REPORT_TYPE } from "../const.js";
import { prisma } from "../db/db.js";
import { handleCommandError } from "../error/error.js";
import {  getUsers, makeReport } from "../utils/utils.js";

export const name = REPORT_COMMAND_NAME;

export const data = new SlashCommandBuilder()
    .setName(REPORT_COMMAND_NAME)
    .setDescription(REPORT_COMMAND_DESCRIPTION);

export const execute = async (interaction: ChatInputCommandInteraction) => {
    try {
        const users = await getUsers()

        if (users.length === 0) {
            await interaction.reply({
                content: "No users in the food tracker! Add some users first.",
                flags: [MessageFlags.Ephemeral]
            });
            return;
        }

        const report = makeReport(users, REPORT_TYPE.SCORE);

        await interaction.reply({
            content: report,
            flags: [MessageFlags.Ephemeral]
        });
    } catch (error) {
        return handleCommandError(interaction, error);
    }
};
