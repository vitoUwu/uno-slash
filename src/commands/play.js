import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Colors,
  ComponentType,
  Locale,
} from "discord.js";
import { findGameByChannelId } from "../handlers/games.js";
import { translate } from "../locales/index.js";
import embeds from "../utils/embeds.js";
import {
  compatibleColor,
  compatibleNumber,
  parseCardId,
} from "../utils/functions.js";

export default {
  name: "play",
  description: translate(Locale.EnglishUS, "commands.play.description"),
  description_localizations: {
    "pt-BR": translate(Locale.PortugueseBR, "commands.play.description"),
  },
  // cooldown: 5,
  options: [
    {
      name: "card",
      name_localizations: {
        "pt-BR": "carta",
      },
      description: translate(
        Locale.EnglishUS,
        "commands.play.options.cards.description"
      ),
      description_localizations: {
        "pt-BR": translate(
          Locale.PortugueseBR,
          "commands.play.options.cards.description"
        ),
      },
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
    {
      name: "uno",
      description: translate(
        Locale.EnglishUS,
        "commands.play.options.uno.description"
      ),
      description_localizations: {
        "pt-BR": translate(
          Locale.PortugueseBR,
          "commands.play.options.uno.description"
        ),
      },
      type: ApplicationCommandOptionType.Boolean,
    },
  ],
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const game = findGameByChannelId(interaction.channelId);
    if (!game) {
      return await interaction.reply({
        embeds: [
          embeds.error(translate(interaction.locale, "errors.no_matchs_found")),
        ],
        ephemeral: true,
      });
    }

    const player = game.players.get(interaction.member.id);
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

    if (game.actualPlayer()?.id !== interaction.member.id) {
      return await interaction.reply({
        embeds: [
          embeds.error(translate(interaction.locale, "errors.not_your_turn")),
        ],
        ephemeral: true,
      });
    }

    const cardId = interaction.options.getString("card");
    game.timeout.refresh();

    if (cardId === "draw") {
      player.addCards(1);
      game.messages.push({
        key: "commands.draw.drew_card",
        variables: [interaction.user.toString()],
      });
      game.addIndex();
      await interaction.reply(game.makePayload());
      return;
    }

    const cardIndex = player.cards.findIndex(
      (cardIds) =>
        cardIds === cardId ||
        parseCardId(cardIds, interaction.locale).toString().toLowerCase() ===
          cardId.toLowerCase()
    );
    if (cardIndex < 0) {
      return await interaction.reply({
        embeds: [
          embeds.error(translate(interaction.locale, "errors.card_not_found")),
        ],
        ephemeral: true,
      });
    }

    const parsedCard = parseCardId(cardId);
    const parsedLastCard = parseCardId(game.lastCardId);

    if (game.stackedCombo && parsedCard.number !== "+2") {
      await interaction.reply({
        embeds: [
          embeds.error(translate(interaction.locale, "errors.only_+2_card")),
        ],
        ephemeral: true,
      });
      return;
    }

    if (
      !compatibleColor(parsedLastCard, parsedCard) &&
      !compatibleNumber(parsedLastCard, parsedCard)
    ) {
      await interaction.reply({
        embeds: [
          embeds.error(translate(interaction.locale, "errors.invalid_card")),
        ],
        ephemeral: true,
      });
      return;
    }

    player.cards.splice(cardIndex, 1);
    if (player.cards.length <= 0) {
      if (game.players.size > 2) {
        game.winners.push(player);
        game.removePlayer(player.id);
        game.messages.push({
          key: "commands.play.messages.played.last_card",
          variables: [interaction.user.toString()],
        });
      } else {
        await interaction.reply({
          embeds: [
            {
              color: Colors.Blurple,
              description: translate(
                interaction.locale,
                "player.messages.played_last_card",
                interaction.user.toString(),
                parsedCard.toString()
              ),
            },
          ],
        });
        game.winners.push(player);
        game.removePlayer(player.id);
        return;
      }
    }

    if (player.cards.length === 1) {
      game.messages.push({
        key: "commands.play.messages.uno",
        variables: [interaction.user.toString()],
      });
      if (!interaction.options.getBoolean("uno")) {
        game.messages.push({
          key: "commands.play.messages.report",
          variables: [],
        });
      }
    }

    player.inactiveRounds = 0;

    game.lastCardId = cardId;

    const cardType = parsedCard.type;
    const cardNumber = parsedCard.number;

    if (cardType === "special") {
      const reply = await interaction.reply({
        embeds: [
          {
            description: translate(interaction.locale, "game.choose_color"),
            color: Colors.Blurple,
          },
        ],
        components: [
          new ActionRowBuilder().setComponents(
            new ButtonBuilder()
              .setCustomId("g")
              .setEmoji({ name: "🟩" })
              .setLabel(translate(interaction.locale, "game.cards.green"))
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId("b")
              .setEmoji({ name: "🟦" })
              .setLabel(translate(interaction.locale, "game.cards.blue"))
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId("y")
              .setEmoji({ name: "🟨" })
              .setLabel(translate(interaction.locale, "game.cards.yellow"))
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId("r")
              .setEmoji({ name: "🟥" })
              .setLabel(translate(interaction.locale, "game.cards.red"))
              .setStyle(ButtonStyle.Primary)
          ),
        ],
        fetchReply: true,
      });
      const response = await reply
        .awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          time: 10000,
          componentType: ComponentType.Button,
        })
        .catch(() => null);

      await response?.deferUpdate();

      const color =
        response?.customId ||
        ["r", "b", "g", "y"][Math.floor(Math.random() * 4)];
      game.lastCardId = `${color}any`;
      if (cardNumber === "+4") {
        game.nextPlayer().addCards(4);
        game.messages.push({
          key: "commands.play.messages.played.4wild",
          variables: [
            interaction.user.toString(),
            `<@${game.nextPlayer().id}>`,
            game.nextPlayer().cards.length,
          ],
        });
        game.addIndex();
      } else {
        game.messages.push({
          key: "commands.play.messages.played.wild",
          variables: [interaction.user.toString()],
        });
      }
    }

    if (cardNumber === "+2") {
      if (game.nextPlayer().cards.some((cardId) => cardId.includes("+2"))) {
        game.stackedCombo += 2;
        game.messages.push({
          key: "commands.play.messages.stacked+2",
          variables: [interaction.user.toString(), game.stackedCombo],
        });
      } else if (game.stackedCombo > 0) {
        game.nextPlayer().addCards(game.stackedCombo + 2);
        game.messages.push({
          key: "commands.play.messages.finished_stacking",
          variables: [
            interaction.user.toString(),
            `<@${game.nextPlayer().id}>`,
            game.nextPlayer().cards.length,
            game.stackedCombo,
          ],
        });
        game.stackedCombo = 0;
        game.addIndex();
      } else {
        game.nextPlayer().addCards(2);
        game.messages.push({
          key: "commands.play.messages.played.+2",
          variables: [
            interaction.user.toString(),
            `<@${game.nextPlayer().id}>`,
            game.nextPlayer().cards.length,
          ],
        });
        game.addIndex();
      }
    }

    if (cardNumber === "r") {
      game.messages.push({
        key: "commands.play.messages.played.reverse",
        variables: [interaction.user.toString()],
      });
      game.reversePlayers();
      if (game.players.size === 2) {
        game.addIndex();
      }
    }

    if (cardNumber === "b") {
      game.messages.push({
        key: "commands.play.messages.played.block",
        variables: [interaction.user.toString(), `<@${game.nextPlayer().id}>`],
      });
      game.addIndex();
    }

    game.addIndex();
    const payload = game.makePayload();

    if (player.cards.length !== 1 || interaction.options.getBoolean("uno")) {
      return interaction[interaction.replied ? "followUp" : "reply"](payload);
    }

    const reply = await interaction[interaction.replied ? "followUp" : "reply"](
      {
        ...payload,
        components: [
          new ActionRowBuilder().setComponents(
            new ButtonBuilder()
              .setCustomId("collector;uno")
              .setEmoji({ id: "1002561065399373944" })
              .setLabel("Uno!")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId("collector;report")
              .setEmoji("🚨")
              .setLabel(translate(game.nextPlayer().locale, "game.report"))
              .setStyle(ButtonStyle.Danger)
          ),
        ],
        fetchReply: true,
      }
    );

    const response = await reply
      .awaitMessageComponent({
        filter: (i) => game.players.has(i.user.id),
        time: 5000,
      })
      .catch(() => null);

    if (!response || response.customId === "collector;report") {
      await reply.edit({ components: [] });
      player.addCards(2);
      return interaction.channel
        .send({
          embeds: [
            {
              description: translate(
                interaction.locale,
                "game.punished_by_report",
                interaction.user.toString()
              ),
              color: Colors.Blurple,
            },
          ],
        })
        .catch(() => null);
    }

    if (response.customId === "collector;uno") {
      return reply.edit({ components: [] });
    }
  },

  /**
   *
   * @param {AutocompleteInteraction} interaction
   */
  executeAutocomplete: async (interaction) => {
    const game = findGameByChannelId(interaction.channelId);
    if (!game) {
      return await interaction.respond([
        {
          name: translate(interaction.locale, "errors.no_matchs_found"),
          value: translate(interaction.locale, "errors.no_matchs_found"),
        },
      ]);
    }

    const player = game.players.get(interaction.user.id);
    if (!player) {
      return await interaction.respond([
        {
          name: translate(interaction.locale, "errors.not_participating"),
          value: translate(interaction.locale, "errors.not_participating"),
        },
      ]);
    }

    if (game.status !== "started") {
      return await interaction.respond([
        {
          name: translate(interaction.locale, "errors.match_not_started_yet"),
          value: translate(interaction.locale, "errors.match_not_started_yet"),
        },
      ]);
    }

    const value = interaction.options.getFocused().toLowerCase();

    const data = player.cards
      .filter(
        (cardId) =>
          cardId.includes(value) ||
          parseCardId(cardId, interaction.locale)
            .toString()
            .toLowerCase()
            .includes(value)
      )
      .map((cardId) => ({
        name: parseCardId(cardId, interaction.locale).toString(),
        value: cardId,
      }))
      .slice(0, 24)
      .concat({
        name: translate(interaction.locale, "commands.play.draw_card_option"),
        value: "draw",
      });

    if (data.length <= 1) {
      data.unshift({
        name: translate(interaction.locale, "errors.card_not_found"),
        value: translate(interaction.locale, "errors.card_not_found"),
      });
    }

    return await interaction.respond(data);
  },
};
