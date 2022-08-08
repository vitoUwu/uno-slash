const { CommandInteraction, Colors, Locale } = require("discord.js");
const package = require("../../package.json");
const locale = require("../locales");

module.exports = {
  name: "about",
  description: locale(Locale.EnglishUS, "commands.about.description"),
  description_localizations: {
    "pt-BR": locale(Locale.PortugueseBR, "commands.about.description")
  },
  cooldown: 5,
  /**
   * 
   * @param {CommandInteraction} interaction 
   */
  async slashExecute(interaction) {
    return interaction.reply({
      embeds: [{
        color: Colors.Blurple,
        fields: [
          { name: locale(interaction.locale, "commands.about.versions"), value: `Discord.js: \`${package.dependencies["discord.js"]}\`\nNode.js: \`${process.version}\`\nBot: \`${package.version}\`` },
          { name: locale(interaction.locale, "commands.about.servers"), value: `${interaction.client.guilds.cache.size}` },
          { name: locale(interaction.locale, "commands.about.matchs"), value: `${interaction.client.games.size}` }
        ]
      }]
    })
  }
}