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
          embeds.error(
            translate(interaction.locale, "commands.leave.noMatchs")
          ),
        ],
      });
    }

    const player = game.players.get(interaction.user.id);
    if (!player) {
      return await interaction.reply({
        embeds: [
          embeds.error(
            translate(interaction.locale, "commands.leave.notParticipating")
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
            "commands.leave.userLeft",
            interaction.user
          ),
          color: Colors.Blurple,
        },
      ],
    });

    game.removePlayer(interaction.user.id);
  },
};
