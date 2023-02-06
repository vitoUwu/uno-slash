import { ChatInputCommandInteraction, Locale } from "discord.js";
import { findGameByMemberId } from "../handlers/games.js";
import { translate } from "../locales/index.js";
import embeds from "../utils/embeds.js";
import { getCards } from "../utils/functions.js";

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
          embeds.error(translate(interaction.locale, "commands.draw.noMatchs")),
        ],
      });
    }

    if (game.status !== "started") {
      return await interaction.reply({
        embeds: [
          embeds.error(
            translate(interaction.locale, "commands.draw.notStarted")
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
            translate(interaction.locale, "commands.draw.notParticipating")
          ),
        ],
        ephemeral: true,
      });
    }

    if (game.actualPlayer().id !== interaction.user.id) {
      return await interaction.reply({
        embeds: [
          embeds.error(translate(interaction.locale, "commands.draw.notTurn")),
        ],
        ephemeral: true,
      });
    }

    player.cards.push(...getCards(1));
    game.messages.push({
      key: "commands.draw.bhoughtCard",
      variables: [interaction.user],
    });
    game.addIndex();
    await interaction.reply(game.makePayload());
  },
};
