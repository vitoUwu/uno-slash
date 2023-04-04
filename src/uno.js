import { Client, GatewayIntentBits, Partials } from "discord.js";
import { deployCommands, loadCommands } from "./handlers/commands.js";
import { loadAndListenEvents } from "./handlers/event.js";
import { postStatus, updateActivity } from "./utils/functions.js";
import { logger } from "./utils/logger.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel, Partials.GuildMember],
});

(async () => {
  const start = Date.now();
  await loadAndListenEvents(client);
  await loadCommands();
  await client.login(process.env.DISCORD_TOKEN);
  await client.application.fetch();
  logger.info(`Logado como ${client.user.tag}`);
  await deployCommands(client);
  logger.info(`Inicialização realizada em ${Date.now() - start}ms`);

  await Promise.all([updateActivity(client), postStatus(client)]);

  setInterval(async () => {
    await Promise.all([updateActivity(client), postStatus(client)]);
  }, 60000 * 10);
})();
