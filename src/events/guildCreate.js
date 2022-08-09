const { default: axios } = require("axios");
const { Guild } = require("discord.js");
const { loggerUrl } = require("../../config.json");

module.exports = {
  name: "guildCreate",
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
          { name: "Membros", value: `${guild.memberCount}`, inline: true },
          { name: "Língua", value: `${guild.preferredLocale}`, inline: true },
          { name: "Recursos Ativos", value: `${guild.features.join(" ")}`}
        ]
      }]
    })
  }
}