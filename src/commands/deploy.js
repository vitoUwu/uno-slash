const { Message } = require("discord.js");
const { success, error } = require("../utils/embeds");
const { servers } = require("../../config.json");

module.exports = {
  name: "deploy",
  ownerOnly: true,
  /**
   * 
   * @param {Message} message 
   */
  async messageExecute(message) {
    if (message.guild.id !== servers.test) return;
    message.guild.commands.create(message.client.commands.get("commands"))
      .then(() => message.reply({ embeds: [success("Comando instalado")] }))
      .catch((err) => {
        message.client.logger.error(err);
        message.reply({ embeds: [error(`Ocorreu um erro ao instalar comando: \`\`\`${err.stack}\`\`\``)] });
      });
  }
}