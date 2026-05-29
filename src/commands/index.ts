import * as updateTracker from "./updateTracker.js";
import * as addUser from "./addUser.js";
import * as removeUser from "./removeUser.js";
import * as report from "./report.js";
import * as pingBuyer from "./pingBuyer.js";
import * as setUserScore from "./setUserScore.js";
import * as setUserRole from "./setUserRole.js";

export const commands = {
    [updateTracker.name]: updateTracker,
    [addUser.name]: addUser,
    [removeUser.name]: removeUser,
    [report.name]: report,
    [pingBuyer.name]: pingBuyer,
    [setUserScore.name]: setUserScore,
    [setUserRole.name]: setUserRole
}