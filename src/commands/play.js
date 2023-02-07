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
import { findGameByChannelId, findGameByMemberId } from "../handlers/games.js";
import { translate } from "../locales/index.js";
import embeds from "../utils/embeds.js";
import {
  compatibleColor,
  compatibleNumber,
  getCards,
  parseCardId,
} from "../utils/functions.js";

export default {
  name: "play",
  description: translate(Locale.EnglishUS, "commands.play.description"),
  description_localizations: {
    "pt-BR": translate(Locale.PortugueseBR, "commands.play.description"),
  },
  cooldown: 5,
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
          embeds.error(translate(interaction.locale, "commands.play.noMatchs")),
        ],
        ephemeral: true,
      });
    }

    if (game.status !== "started") {
      return await interaction.reply({
        embeds: [
          embeds.error(
            translate(interaction.locale, "commands.play.notStarted")
          ),
        ],
        ephemeral: true,
      });
    }

    if (game.actualPlayer().id !== interaction.member.id) {
      return await interaction.reply({
        embeds: [
          embeds.error(translate(interaction.locale, "commands.play.notTurn")),
        ],
        ephemeral: true,
      });
    }

    const player = game.players.get(interaction.member.id);
    if (!player) {
      return await interaction.reply({
        embeds: [
          embeds.error(
            translate(interaction.locale, "commands.play.notParticipating")
          ),
        ],
        ephemeral: true,
      });
    }

    const cardId = interaction.options.getString("card");
    game.timeout.refresh();

    if (cardId === "draw") {
      player.cards.push(...getCards(1));
      game.messages.push({
        key: "commands.draw.bhoughtCard",
        variables: [interaction.user.toString()],
      });
      game.addIndex();
      await interaction.reply(game.makePayload());
      return;
    }

    const cardIndex = player.cards.findIndex(
      (cardIds) =>
        cardIds === cardId ||
        parseCardId(cardIds).toString().toLowerCase() === cardId.toLowerCase()
    );
    if (cardIndex < 0) {
      return await interaction.reply({
        embeds: [
          embeds.error(
            translate(interaction.locale, "commands.play.cardNotFound")
          ),
        ],
        ephemeral: true,
      });
    }

    const parsedCard = parseCardId(cardId);
    const parsedLastCard = parseCardId(game.lastCardId);

    if (game.stackedCombo && parsedCard.number !== "+2") {
      await interaction.reply({
        embeds: [
          embeds.error(translate(interaction.locale, "commands.play.only+2")),
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
          embeds.error(
            translate(interaction.locale, "commands.play.invalidCard")
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    player.cards.splice(cardIndex, 1);
    if (player.cards.length <= 0) {
      game.winners.push(player);
      game.removePlayer(player.id);
      game.messages.push({
        key: "commands.play.messages.win",
        variables: [interaction.user.toString()],
      });
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
            description: translate(interaction.locale, "game.chooseColor"),
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
        game.nextPlayer().cards.push(...getCards(4));
        game.messages.push({
          key: "commands.play.messages.4wild",
          variables: [
            interaction.user.toString(),
            `<@${game.nextPlayer().id}>`,
            game.nextPlayer().cards.length,
          ],
        });
        game.addIndex();
      } else {
        game.messages.push({
          key: "commands.play.messages.wild",
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
        game.stackedCombo += 2;
        game.nextPlayer().cards.push(...getCards(game.stackedCombo));
        game.messages.push({
          key: "commands.play.messages.endCombo",
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
        game.nextPlayer().cards.push(...getCards(2));
        game.messages.push({
          key: "commands.play.messages.+2",
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
        key: "commands.play.messages.reverse",
        variables: [interaction.user.toString()],
      });
      game.players.reverse();
    }

    if (cardNumber === "b") {
      game.messages.push({
        key: "commands.play.messages.block",
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

    if (!response) {
      await reply.edit({ components: [] });
      player.cards.push(...getCards(2));
      return interaction.channel
        .send({
          embeds: [
            {
              description: translate(
                interaction.locale,
                "game.unoReport",
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

    await reply.edit({ components: [] }).catch(() => null);
    player.cards.push(...getCards(2));
    interaction.channel
      .send({
        embeds: [
          {
            description: translate(
              interaction.locale,
              "game.unoReport",
              interaction.user.toString()
            ),
            color: Colors.Blurple,
          },
        ],
      })
      .catch(() => null);
  },

  /**
   *
   * @param {AutocompleteInteraction} interaction
   */
  executeAutocomplete: async (interaction) => {
    const game = findGameByMemberId(interaction.user.id, interaction.guildId);
    if (!game) {
      return await interaction.respond([
        {
          name: translate(interaction.locale, "commands.play.noMatchs"),
          value: translate(interaction.locale, "commands.play.noMatchs"),
        },
      ]);
    }

    if (game.status !== "started") {
      return await interaction.respond([
        {
          name: translate(interaction.locale, "commands.play.notStarted"),
          value: translate(interaction.locale, "commands.play.notStarted"),
        },
      ]);
    }

    const player = game.players.get(interaction.user.id);
    if (!player) {
      return await interaction.respond([
        {
          name: translate(interaction.locale, "commands.play.notParticipating"),
          value: translate(
            interaction.locale,
            "commands.play.notParticipating"
          ),
        },
      ]);
    }

    const value = interaction.options.getFocused(true).value.toLowerCase();

    const data = player.cards
      .filter(
        (cardId) =>
          cardId.includes(value) ||
          parseCardId(cardId, interaction.locale)
            .toString()
            .toLowerCase()
            .includes(value)
      )
      .map((card) => ({
        name: parseCardId(card, interaction.locale).toString(),
        value: card,
      }))
      .slice(0, 24)
      .concat({
        name: translate(interaction.locale, "commands.play.drawCardOption"),
        value: "draw",
      });

    if (data.length <= 1) {
      data.unshift({
        name: translate(interaction.locale, "commands.play.cardNotFound"),
        value: translate(interaction.locale, "commands.play.cardNotFound"),
      });
    }

    return await interaction.respond(data);
  },
};
