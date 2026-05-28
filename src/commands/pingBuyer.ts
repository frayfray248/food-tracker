import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { PING_BUYER_COMMAND_DESCRIPTION, PING_BUYER_COMMAND_NAME, REPORT_TYPE } from "../const.js";
import { prisma } from "../db/db.js";
import { handleCommandError } from "../error/error.js";
import {  getUsers, makeReport } from "../utils/utils.js";

export const name = PING_BUYER_COMMAND_NAME;

export const data = new SlashCommandBuilder()
    .setName(PING_BUYER_COMMAND_NAME)
    .setDescription(PING_BUYER_COMMAND_DESCRIPTION);

export const execute = async (interaction: ChatInputCommandInteraction) => {
    try {
        const users = await getUsers();

        if (users.length === 0) {
            await interaction.reply({
                content: "No users in the food tracker! Add some users first."
            });
            return;
        }

        const topUser = users[0];

        if (!topUser) {
            throw new Error("Expected at least one tracked user.");
        }

        const highestScore = topUser.score;
        const highestScoringUsers = users.filter((user) => user.score === highestScore);
        const selectedBuyer = highestScoringUsers[Math.floor(Math.random() * highestScoringUsers.length)] ?? topUser;

        const report = makeReport(users, REPORT_TYPE.SCORE);

        const tieNotice = highestScoringUsers.length > 1
            ? `\nTie detected at score ${highestScore}. Randomly selected buyer from ${highestScoringUsers.length} users.`
            : "";

        await interaction.reply({
            content: `${report}\n\n<@${selectedBuyer.id}>${tieNotice} it is your turn to buy!`
        });
    } catch (error) {
        return handleCommandError(interaction, error);
    }
};