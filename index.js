require("dotenv/config");
const { servers } = require("./config.json");
const { default: axios } = require("axios");
const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const Logger = require("./src/structures/Logger");
const requireFiles = require("./src/utils/requireFiles");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();
client.games = new Collection();
client.logger = new Logger("./src/logs", "bot");
client.prefix = "uno.";

requireFiles("./src/commands")
  .forEach(command => client.commands.set(command.name, command));

requireFiles("./src/events")
  .forEach(event => client.on(event.name, event.execute));

client.login(process.env.TOKEN)
  .then(() => {
    client.logger.log(`Logado como ${client.user.tag}`);
    client.application.commands.set(client.commands.filter(cmd => cmd.ownerOnly && cmd.description), servers.test) // just ignore cmd.description
      .then(() => client.logger.log("Comandos registrados"))
      .catch((err) => client.logger.error(err));
    updateActivity();
    postStatus();
  });

const updateActivity = () => {
  client.user.setActivity({
    name: `on ${client.guilds.cache.size} servers`,
    type: ActivityType.Playing
  });

  setTimeout(() => updateActivity(), 60000 * 10);
}

const postStatus = async () => {
  const topggToken = process.env.TOPGG_TOKEN;
  const dbggToken = process.env.DBGG_TOKEN;
  const dblToken = process.env.DBL_TOKEN;
  const guilds = client.guilds.cache.size;

  try {
    if (topggToken) {
      await axios.post(`https://top.gg/api/bots/${client.user.id}/stats`, {
        server_count: guilds
      }, {
        headers: { "Authorization": topggToken }
      });
    }
    if (dbggToken) {
      await axios.post(`https://discord.bots.gg/api/v1/bots/${client.user.id}/stats`, {
        guildCount: guilds
      }, {
        headers: { "Authorization": dbggToken }
      });
    }
    if (dblToken) {
      await axios.post(`https://discordbotlist.com/api/v1/bots/${client.user.id}/stats`, {
        guilds
      }, {
        headers: { "Authorization": dblToken }
      });
    }
  } catch(err) {
    client.logger.error(err);
  }

  setTimeout(() => postStatus(), 60000 * 30);
}

process.on("uncaughtException", (err) => client.logger.error(err));
process.on("unhandledRejection", (err) => client.logger.error(err));
