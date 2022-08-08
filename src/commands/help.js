const { Locale, ChatInputCommandInteraction } = require("discord.js");
const { color } = require("../../config.json");
const locales = require("../locales");

module.exports = {
  name: "help",
  description: locales(Locale.EnglishUS, "commands.help.description"),
  description_localizations: {
    "pt-BR": locales(Locale.PortugueseBR, "commands.help.description")
  },
  cooldown: 5,
  /**
   * 
   * @param {ChatInputCommandInteraction} interaction 
   */
  async slashExecute(interaction) {
    return interaction.reply({
      embeds: [{
        title: "Tutorial",
        thumbnail: {
          url: interaction.client.user.displayAvatarURL()
        },
        color,
        fields: [
          { name: locales(interaction.locale, "commands.help.create.title"), value: locales(interaction.locale, "commands.help.create.description"), inline: true },
          { name: locales(interaction.locale, "commands.help.play.title"), value: locales(interaction.locale, "commands.help.play.description"), inline: true },
          { name: locales(interaction.locale, "commands.help.draw.title"), value: locales(interaction.locale, "commands.help.draw.description"), inline: true },
          { name: locales(interaction.locale, "commands.help.leave.title"), value: locales(interaction.locale, "commands.help.leave.description"), inline: true }
        ]
      }]
    });
  }
}