import dotenv from "dotenv"

dotenv.config()

const { DISCORD_BOT_TOKEN, DISCORD_APP_ID } = process.env

if (!DISCORD_BOT_TOKEN) {
  throw new Error("DISCORD_BOT_TOKEN is not defined in the environment variables.")
}

if (!DISCORD_APP_ID) {
  throw new Error("DISCORD_APP_ID is not defined in the environment variables.")
}

export const config = {
    DISCORD_BOT_TOKEN,
    DISCORD_APP_ID,
}