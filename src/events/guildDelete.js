const { default: axios } = require("axios");
const { Guild, Colors } = require("discord.js");
const { loggerUrl } = require("../../config.json");

module.exports = {
  name: "guildDelete",
  /**
   * @param {Guild} guild
   */
  async execute(guild) {
    axios.post(loggerUrl, {
      content: `${guild.vanityURLCode || "No vanity"}`,
      embeds: [{
        fields: [
          { name: "Nome", value: `\` ${guild.name} (${guild.id}) \``, inline: true },
          { name: "Dono", value: `<@${guild.ownerId}> (${guild.ownerId})`, inline: true },
          { name: "Membros", value: `${guild.memberCount || 0}`, inline: true },
          { name: "Língua", value: `${guild.preferredLocale || "No preferred locale"}`, inline: true },
          { name: "Recursos Ativos", value: `${guild.features.join(" ") || "No features"}`}
        ],
        color: Colors.Red
      }]
    }).catch(err => {
      guild.client.logger.error(err);
    });
  }
}