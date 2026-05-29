import { DiscordjsError, DiscordjsErrorCodes, MessageFlags, type CommandInteraction } from "discord.js";
import { FoodTrackerError } from "./FoodTrackerError.js";

export const handleCommandError = async (interaction: CommandInteraction, error: unknown) => {

    let message = ""
    let replyContent = ""

    if (error instanceof DiscordjsError && error.code === DiscordjsErrorCodes.InteractionCollectorError) {
        replyContent = "Interaction timed out. Please try again.";
    }
    else if (error instanceof FoodTrackerError) {
        replyContent = error.replyContent;
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
        })
    } else {
        return interaction.followUp({
            content: replyContent,
        })
    }

}