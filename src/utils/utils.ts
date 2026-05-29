import type { BaseInteraction, Interaction } from "discord.js";
import type { User } from "../../generated/prisma/client.js";
import { ATTENDEE_SCORE_INCREMENT, PAYER_SCORE_DECREMENT_PER_ATTENDEE, REPORT_TITLES, REPORT_TYPE, USER_ROLE, USER_STATUS } from "../const.js";
import { prisma } from "../db/db.js";
import type { TrackerUpdateUser } from "../schemas/TrackerUpdateSchema.js";
import { client } from "../index.js";
import { FoodTrackerError } from "../error/FoodTrackerError.js";


export const updateScores = async (updates: TrackerUpdateUser[]) => {

    const attendeeCount = updates.filter(update => update.status === USER_STATUS.ATTENDED).length;

    const payer = updates.find(update => update.status === USER_STATUS.PAID);
    const attendees = updates.filter(update => update.status === USER_STATUS.ATTENDED);

    console.log(updates)

    if (!payer) {
        throw new Error("No payer found in updates");
    }



    await prisma.$transaction([
        prisma.user.update({
            where: {
                id: payer.userId
            },
            data: {
                score: {
                    decrement: attendeeCount * PAYER_SCORE_DECREMENT_PER_ATTENDEE
                }
            }
        }),
        ...attendees.map(attendee => prisma.user.update({
            where: {
                id: attendee.userId
            },
            data: {
                score: {
                    increment: ATTENDEE_SCORE_INCREMENT
                }
            }
        }))
    ])
}

export const getUsers = async () => {

    const users = await prisma.user.findMany({
        orderBy: {
            score: "desc"
        }
    });

    return users
}

export const makeScoreList = (users: User[]) => {
    return users.map(user => `- **${user.username}**: ${user.score}`).join("\n");
}

export const makeReport = (users: User[], type: REPORT_TYPE) => {
    return `
        # ${REPORT_TITLES[type]}
        ${makeScoreList(users)}
    `
}

export const isAdmin = async (userId: string) => {

    if (userId === process.env.SERVER_OWNER_ID) {
        return true
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        return false
    }

    return user.role === USER_ROLE.ADMIN

}

export const checkAuth = async (interaction: BaseInteraction) => {

    const admin = await isAdmin(interaction.user.id);

    if (!admin) {
        throw new FoodTrackerError("Command failed auth check", "You do not have permission to use this command.");
    }
}