import { ChatInputCommandInteraction, Locale } from "discord.js";
import { findGameByMemberId } from "../handlers/games.js";
import { translate } from "../locales/index.js";
import embeds from "../utils/embeds.js";

export default {
  name: "draw",
  description: translate(Locale.EnglishUS, "commands.draw.description"),
  description_localizations: {
    "pt-BR": translate(Locale.PortugueseBR, "commands.draw.description"),
  },
  cooldown: 5,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  execute: async (interaction) => {
    const game = findGameByMemberId(interaction.user.id, interaction.guildId);
    if (!game) {
      return await interaction.reply({
        embeds: [
          embeds.error(translate(interaction.locale, "errors.no_matchs_found")),
        ],
      });
    }

    if (game.status !== "started") {
      return await interaction.reply({
        embeds: [
          embeds.error(
            translate(interaction.locale, "errors.match_not_started_yet")
          ),
        ],
        ephemeral: true,
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

    if (game.actualPlayer().id !== interaction.user.id) {
      return await interaction.reply({
        embeds: [
          embeds.error(translate(interaction.locale, "errors.not_your_turn")),
        ],
        ephemeral: true,
      });
    }

    player.addCards(1);
    game.timeout.refresh();
    game.messages.push({
      key: "commands.draw.drew_card",
      variables: [interaction.user],
    });
    game.addIndex();
    await interaction.reply(game.makePayload());
  },
};
