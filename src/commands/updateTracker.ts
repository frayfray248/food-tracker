import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, DiscordjsError, DiscordjsErrorCodes, LabelBuilder, Message, MessageFlags, ModalBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, } from "discord.js";
import { BUTTON_TIMEOUT, UPDATE_TRACKER_COMMAND_DESCRIPTION, UPDATE_TRACKER_COMMAND_NAME, MODAL_TIMEOUT } from "../const.js";

const buildUserFoodStatusSelectMenu = (user: string) => {
    const select = new StringSelectMenuBuilder()
        .setCustomId(`updateTrackerSelect_${user}`)
        .setPlaceholder(`${user}...`)
        .setRequired(true)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("💲 Paid")
                .setDescription("This person bought food")
                .setValue(`paid`),
            new StringSelectMenuOptionBuilder()
                .setLabel("✅ Attended")
                .setDescription("This person attended")
                .setValue(`attended`),
            new StringSelectMenuOptionBuilder()
                .setLabel("❌ Did Not Attend")
                .setDescription("This person did NOT attend")
                .setValue(`notAttended`)
                .setDefault(true)
        )

    return new LabelBuilder()
        .setLabel(`${user}...`)
        .setStringSelectMenuComponent(select)
}

const buildUpdateFoodTrackerModal = (id: string, users: string[], title: string) => {

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

        const users = [
            "Fraser",
            "Hayden",
            "Jacob",
            "Daniel",
            "Stan",
            "Lucas",

        ]

        // divide users into groups of 5
        const userGroups = [];
        for (let i = 0; i < users.length; i += 5) {
            userGroups.push(users.slice(i, i + 5));
        }

        let currentInteraction: CommandInteraction | ButtonInteraction = interaction;
        let data: any = {};

        for (const group of userGroups) {

            // IDs
            const continueButtonId = `updateTrackerContinue_${group.join("_")}`;
            const modalId = `updateTrackerModal_${group.join("_")}`;

            const groupIndex = userGroups.indexOf(group);

            // build and show modal
            const modal = buildUpdateFoodTrackerModal(modalId, group, `Food Tracker - Update ${groupIndex + 1}/${userGroups.length}`);
            await currentInteraction.showModal(modal);

            // get modal submit
            const modalSubmitInteraction = await awaitFoodTrackerModalSubmit(currentInteraction, modalId);

            // collect data from modal submit
            for (const user of group) {

                const userSelectValue = modalSubmitInteraction.fields.getStringSelectValues(`updateTrackerSelect_${user}`)[0]
                data[user] = userSelectValue

            }

            if (groupIndex < userGroups.length - 1) {

                // reply with continue button
                const continueRow = buildContinueButton(continueButtonId);
                const continueButtonInteractionResponse = await modalSubmitInteraction.reply({
                    components: [continueRow],
                    flags: MessageFlags.Ephemeral,
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

                modalSubmitInteraction.reply({
                    content: `Food tracker updated: ${JSON.stringify(data)}`,
                    flags: MessageFlags.Ephemeral
                })
                return
            }
        }

    } catch (error) {

        let message = ""
        let replyContent = ""

        if (error instanceof DiscordjsError && error.code === DiscordjsErrorCodes.InteractionCollectorError) {
            replyContent = "Interaction timed out. Please try again.";
        }
        else {
            replyContent = "An error occurred while updating the food tracker. Please try again.";
        }


        if (error instanceof Error) {
            message = error.message
        } else {
            message = "An unknown error occurred";
        }

        console.log("Error in updateTracker command:", message);

        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({
                content: replyContent,
                flags: MessageFlags.Ephemeral
            })
        } else {
            return interaction.followUp({
                content: replyContent,
                flags: MessageFlags.Ephemeral
            })
        }

    }

}