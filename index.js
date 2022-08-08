require("dotenv/config");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const Logger = require("./src/structures/Logger");
const requireFiles = require("./src/utils/requireFiles");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
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
  .then(() => client.logger.log(`Logado como ${client.user.tag}`));

process.on("uncaughtException", (err) => client.logger.error(err));
process.on("unhandledRejection", (err) => client.logger.error(err));
