export class FoodTrackerError extends Error {

    replyContent: string;

    constructor(message: string, replyContent?: string) {
        super(message);
        this.name = "FoodTrackerError";
        this.replyContent = replyContent ?? "Unspecified Food Tracker error occurred.";
    }

}