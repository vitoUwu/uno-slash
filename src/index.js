import { Client, GatewayIntentBits, Partials } from "discord.js";
import "dotenv/config";
import { deployCommands, loadCommands } from "./handlers/commands.js";
import { loadAndListenEvents } from "./handlers/event.js";
import { postStatus, updateActivity } from "./utils/functions.js";
import { logger } from "./utils/logger.js";

(async () => {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel, Partials.GuildMember],
  });

  await loadAndListenEvents(client);
  await loadCommands();
  await client.login(process.env.DISCORD_TOKEN);
  await client.application.fetch();
  logger.info(`Logado como ${client.user.tag}`);
  await deployCommands(client);

  updateActivity(client);
  await postStatus(client.guilds.cache.size, client.user.id);

  setTimeout(async () => {
    updateActivity(client);
    await postStatus(client.guilds.cache.size, client.user.id);
  }, 60000 * 10);
})();
