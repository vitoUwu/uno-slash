const { Message } = require("discord.js");
const { error } = require("../utils/embeds");
const { ownerId } = require("../../config.json");
const cooldowns = new Map();

module.exports = {
  name: "messageCreate",
  /**
   * 
   * @param {Message} message 
   */
  execute(message) {
    const { client } = message;
    if (!message.guild || message.author.bot || !message.content.startsWith(client.prefix)) return;

		const args = message.content.trim().slice(client.prefix.length).split(/ +/);
		
    const commandName = args.shift().toLowerCase();
		if (!commandName) return;

		const command = client.commands.find((cmd) => (cmd.name === commandName || cmd.aliases?.includes(commandName)) && !!cmd.messageExecute);
		if (!command || (command.ownerOnly && message.author.id !== ownerId)) return;

    const userCooldown = cooldowns.get(`${commandName}_${message.author.id}`);
    if (userCooldown) return message.reply({ embeds: [error(`Você está usando os comandos muito de pressa! Espere mais \` ${((Date.now() - userCooldown) / 1000).toFixed(1)} \` segundos`)] })
    cooldowns.set(`${commandName}_${message.author.id}`, Date.now() + command.cooldown * 1000);
    setTimeout(() => cooldowns.delete(`${commandName}_${message.author.id}`), command.cooldown * 1000);

		try {
			command.messageExecute(message, args);
		} catch (err) {
			message.reply({ embeds: [error(err.stack ?? "Erro desconhecido")] });
			client.logger.error(err);
		}
  }
}
