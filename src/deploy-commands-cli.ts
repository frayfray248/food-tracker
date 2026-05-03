import { deployCommands } from "./deploy-commands.js";

const guildId = process.argv[2];

if (!guildId) {
  console.error("Usage: npm run deploy:commands -- <guildId>");
  process.exit(1);
}

await deployCommands({ guildId });
