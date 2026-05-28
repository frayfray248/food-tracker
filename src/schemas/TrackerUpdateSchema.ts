import z from "zod"
import { USER_STATUS } from "../const.js"

export const TrackerUpdateUserSchema = z.object({
    userId: z.string(), 
    status: z.enum([...Object.values(USER_STATUS)])
})

export type TrackerUpdateUser = z.infer<typeof TrackerUpdateUserSchema>