import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, DiscordjsError, DiscordjsErrorCodes, LabelBuilder, Message, MessageFlags, ModalBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, } from "discord.js";
import { BUTTON_TIMEOUT, UPDATE_TRACKER_COMMAND_DESCRIPTION, UPDATE_TRACKER_COMMAND_NAME, MODAL_TIMEOUT, USER_STATUS, REPORT_TYPE } from "../const.js";
import { handleCommandError } from "../error/error.js";
import { prisma } from "../db/db.js";
import { TrackerUpdateUserSchema, type TrackerUpdateUser } from "../schemas/TrackerUpdateSchema.js";
import {  getUsers, makeReport, updateScores } from "../utils/utils.js";
import type { User } from "../../generated/prisma/client.js";

const buildUserFoodStatusSelectMenu = (user: User) => {
    const select = new StringSelectMenuBuilder()
        .setCustomId(`updateTrackerSelectUser_${user.id}`)
        .setPlaceholder(`${user.username}...`)
        .setRequired(true)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("💲 Paid")
                .setDescription("This person bought food")
                .setValue(USER_STATUS.PAID),
            new StringSelectMenuOptionBuilder()
                .setLabel("✅ Attended")
                .setDescription("This person attended")
                .setValue(USER_STATUS.ATTENDED),
            new StringSelectMenuOptionBuilder()
                .setLabel("❌ Did Not Attend")
                .setDescription("This person did NOT attend")
                .setValue(USER_STATUS.NOT_ATTENDED)
                .setDefault(true)
        )

    return new LabelBuilder()
        .setLabel(`${user.username}...`)
        .setStringSelectMenuComponent(select)
}

const buildUpdateFoodTrackerModal = (id: string, users: User[], title: string) => {

    const labels = users.map(user => buildUserFoodStatusSelectMenu(user));

    const modal = new ModalBuilder()
        .setCustomId(id)
        .setTitle(title)
        .addLabelComponents(labels)

    return modal;

}

const buildContinueButton = (id: string) => {

    const button = new ButtonBuilder()
        .setCustomId(id)
        .setLabel("Continue")
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(button);

    return row;
}

const awaitFoodTrackerModalSubmit = async (interaction: CommandInteraction | ButtonInteraction, modalId: string) => {

    const modalSubmitInteraction = await interaction.awaitModalSubmit({
        time: MODAL_TIMEOUT,
        filter: (i) => i.customId === modalId && i.user.id === interaction.user.id
    })

    return modalSubmitInteraction;

}

const awaitContinueButtonInteraction = async (message: Message<boolean>, userId: string, buttonId: string) => {

    const interaction = await message.awaitMessageComponent({
        time: BUTTON_TIMEOUT,
        filter: (i) => i.customId === buttonId && i.user.id === userId
    })

    if (!(interaction instanceof ButtonInteraction)) {
        throw new Error("Expected a ButtonInteraction");
    }

    return interaction;
}

export const name = UPDATE_TRACKER_COMMAND_NAME;

export const data = new SlashCommandBuilder()
    .setName(UPDATE_TRACKER_COMMAND_NAME)
    .setDescription(UPDATE_TRACKER_COMMAND_DESCRIPTION);

export async function execute(interaction: CommandInteraction) {
    try {

        const users = await prisma.user.findMany()

        if (users.length === 0) {
            await interaction.reply({ content: "No users in the food tracker! Add some users first." });
            return;
        }

        // divide users into groups of 5
        const userGroups = [];
        for (let i = 0; i < users.length; i += 5) {
            userGroups.push(users.slice(i, i + 5));
        }

        let currentInteraction: CommandInteraction | ButtonInteraction = interaction;
        let data: TrackerUpdateUser[] = [];

        for (const group of userGroups) {

            // IDs
            const continueButtonId = `updateTrackerContinue_${group.map(user => user.id).join("_")}`;
            const modalId = `updateTrackerModal_${group.map(user => user.id).join("_")}`;

            const groupIndex = userGroups.indexOf(group);

            // build and show modal
            const modal = buildUpdateFoodTrackerModal(modalId, group, `Food Tracker - Update ${groupIndex + 1}/${userGroups.length}`);
            await currentInteraction.showModal(modal);

            // get modal submit
            const modalSubmitInteraction = await awaitFoodTrackerModalSubmit(currentInteraction, modalId);

            // collect data from modal submit
            for (const user of group) {

                const userSelectValue = modalSubmitInteraction.fields.getStringSelectValues(`updateTrackerSelectUser_${user.id}`)[0]

                if (!userSelectValue) {
                    throw new Error(`No value selected for user ${user.username}`);
                }

                if (!Object.values(USER_STATUS).includes(userSelectValue as USER_STATUS)) {
                    throw new Error(`Invalid value selected for user ${user.username}: ${userSelectValue}`);
                }

                data.push({ userId: user.id, status: userSelectValue as USER_STATUS });

            }

            if (groupIndex < userGroups.length - 1) {

                // reply with continue button
                const continueRow = buildContinueButton(continueButtonId);
                const continueButtonInteractionResponse = await modalSubmitInteraction.reply({
                    components: [continueRow],
                    withResponse: true
                });


                const message = continueButtonInteractionResponse.resource?.message

                if (!message) {
                    throw new Error("Failed to get message from continue button interaction response");
                }

                const continueButtonInteraction = await awaitContinueButtonInteraction(message, interaction.user.id, continueButtonId);

                currentInteraction = continueButtonInteraction;

            }
            else {

                await modalSubmitInteraction.deferReply();

                const updates = TrackerUpdateUserSchema.array().parse(data);

                const payerCount = updates.filter(update => update.status === USER_STATUS.PAID).length
                const attendeeCount = updates.filter(update => update.status === USER_STATUS.ATTENDED).length

                console.log("Payer count:", payerCount);

                if (payerCount !== 1) {
                    modalSubmitInteraction.editReply({
                        content: `Error: There must be exactly one payer. Found ${payerCount} payers. Please try again.`
                    })
                    return
                }

                if (attendeeCount < 1) {
                    modalSubmitInteraction.editReply({
                        content: `Error: There must be at least one attendee. Found ${attendeeCount} attendees. Please try again.`
                    })
                    return
                }
                await updateScores(updates);
                
                const users = await getUsers();
                const report = makeReport(users, REPORT_TYPE.UPDATE);

                modalSubmitInteraction.editReply({
                    content: report
                })
                return
            }
        }

    } catch (error) {

        return handleCommandError(interaction, error);

    }

}