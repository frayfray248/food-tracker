// commands
export const UPDATE_TRACKER_COMMAND_NAME = "food-tracker-update";
export const UPDATE_TRACKER_COMMAND_DESCRIPTION = "Updates the food tracker with the latest data.";
export const ADD_USER_COMMAND_NAME = "food-tracker-add-user";
export const ADD_USER_COMMAND_DESCRIPTION = "Adds a user to the food tracker.";
export const REMOVE_USER_COMMAND_NAME = "food-tracker-remove-user";
export const REMOVE_USER_COMMAND_DESCRIPTION = "Removes a user from the food tracker.";
export const REPORT_COMMAND_NAME = "food-tracker-report";
export const REPORT_COMMAND_DESCRIPTION = "Prints each tracked user's username, id, and score.";
export const PING_BUYER_COMMAND_NAME = "food-tracker-ping-buyer";
export const PING_BUYER_COMMAND_DESCRIPTION = "Prints the tracker report and pings the user who should buy next.";
export const SET_USER_SCORE_COMMAND_NAME = "food-tracker-set-user-score";
export const SET_USER_SCORE_COMMAND_DESCRIPTION = "Sets a user's score in the food tracker.";
export const SET_USER_ROLE_COMMAND_NAME = "food-tracker-set-user-role";
export const SET_USER_ROLE_COMMAND_DESCRIPTION = "Sets a user's role in the food tracker.";

// collectors
export const COLLECTOR_EVENTS = {
    COLLECT: "collect",
    DISPOSE: "dispose",
    END: "end",
    IGNORE: "ignore"
}

export enum USER_STATUS {
    PAID = "paid",
    ATTENDED = "attended",
    NOT_ATTENDED = "not_attended"
}

export enum REPORT_TYPE {
    UPDATE = "update",
    SCORE = "score"
}

export enum USER_ROLE {
    ADMIN = "admin",
    USER = "user"
}

export const REPORT_TITLES = {
    [REPORT_TYPE.UPDATE]: "Food Tracker Update",
    [REPORT_TYPE.SCORE]: "Food Tracker Scores",
}

// score modifiers
export const ATTENDEE_SCORE_INCREMENT = 1;
export const PAYER_SCORE_DECREMENT_PER_ATTENDEE = 1;


// timeouts
export const MODAL_TIMEOUT = 60_000
export const BUTTON_TIMEOUT = 60_000

