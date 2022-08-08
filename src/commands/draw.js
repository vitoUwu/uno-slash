const { ChatInputCommandInteraction, Locale } = require("discord.js");
const { error } = require("../utils/embeds");
const locales = require("../locales");

module.exports = {
  name: "draw",
  description: locales(Locale.EnglishUS, "commands.draw.description"),
  description_localizations: {
    "pt-BR": locales(Locale.PortugueseBR, "commands.draw.description")
  },
  cooldown: 5,
  /**
   * 
   * @param {ChatInputCommandInteraction} interaction 
   */
  async slashExecute(interaction) {
    const { client } = interaction;
    const game = client.games.get(interaction.channelId);
		if (!game) return await interaction.reply({ embeds: [error(locales(interaction.locale, "commands.draw.noMatchs"))] });

		if (!game.started) return await interaction.reply({ embeds: [error(locales(interaction.locale, "commands.draw.notStarted"))], ephemeral: true });

		const player = game.getPlayer(interaction.user.id);
		if (!player) return await interaction.reply({ embeds: [error(locales(interaction.locale, "commands.draw.notParticipating"))], ephemeral: true });

		game.giveCards(player, 1);
		game.message.push({
      key: "commands.draw.bhoughtCard",
      variables: [interaction.user]
    });
		await game.nextPlayer(interaction);
  }
}
