import { ChatInputCommandInteraction, Colors, Locale } from "discord.js";
import { findGameByChannelId } from "../handlers/games.js";
import { translate } from "../locales/index.js";
import embeds from "../utils/embeds.js";

export default {
  name: "leave",
  description: translate(Locale.EnglishUS, "commands.leave.description"),
  description_localizations: {
    "pt-BR": translate(Locale.PortugueseBR, "commands.leave.description"),
  },
  cooldown: 5,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  execute: async (interaction) => {
    const game = findGameByChannelId(interaction.channelId);
    if (!game) {
      return await interaction.reply({
        embeds: [
          embeds.error(translate(interaction.locale, "errors.no_matchs_found")),
        ],
      });
    }

    const player = game.players.get(interaction.user.id);
    if (!player) {
      return await interaction.reply({
        embeds: [
          embeds.error(
            translate(interaction.locale, "errors.not_participating")
          ),
        ],
        ephemeral: true,
      });
    }

    await interaction.reply({
      embeds: [
        {
          description: translate(
            interaction.locale,
            "commands.leave.user_left",
            interaction.user
          ),
          color: Colors.Blurple,
        },
      ],
    });

    game.removePlayer(interaction.user.id);
  },
};
