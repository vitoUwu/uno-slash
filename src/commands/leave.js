const { ChatInputCommandInteraction, Colors, Locale } = require("discord.js");
const { error } = require("../utils/embeds");
const locales = require("../locales");

module.exports = {
  name: "leave",
  description: locales(Locale.EnglishUS, "commands.leave.description"),
  description_localizations: {
    "pt-BR": locales(Locale.PortugueseBR, "commands.leave.description"),
  },
  cooldown: 5,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async slashExecute(interaction) {
    const { client } = interaction;
    const game = client.games.get(interaction.channelId);
    if (!game)
      return await interaction.reply({
        embeds: [error(locales(interaction.locale, "commands.leave.noMatchs"))],
      });

    const player = game.getPlayer(interaction.user.id);
    if (!player)
      return await interaction.reply({
        embeds: [
          error(locales(interaction.locale, "commands.leave.notParticipating")),
        ],
        ephemeral: true,
      });

    await interaction.reply({
      embeds: [
        {
          description: locales(
            interaction.locale,
            "commands.leave.userLeft",
            interaction.user
          ),
          color: Colors.Blurple,
        },
      ],
    });

    await game.removePlayer(interaction.user.id);
  },
};
