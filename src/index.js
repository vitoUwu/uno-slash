import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import "dotenv/config";
import { deployCommands, loadCommands } from "./handlers/commands.js";
import { loadAndListenEvents } from "./handlers/event.js";
import { postStatus } from "./utils/functions.js";
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

  client.user.setActivity({
    name: `on ${client.guilds.cache.size} servers`,
    type: ActivityType.Playing,
  });
  await postStatus(client.guilds.cache.size, client.user.id);

  setTimeout(async () => {
    client.user.setActivity({
      name: `on ${client.guilds.cache.size} servers`,
      type: ActivityType.Playing,
    });
    await postStatus(client.guilds.cache.size, client.user.id);
  }, 60000 * 10);
})();

process.on("uncaughtException", (error, origin) => {
  logger.fatal({ error, origin });
  process.kill(0);
});

process.on("unhandledRejection", (error) => {
  logger.fatal(error);
  process.kill(0);
});
