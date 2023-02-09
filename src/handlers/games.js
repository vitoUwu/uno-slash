import {
  Collection,
  Colors,
  EmbedBuilder,
  Routes,
  SnowflakeUtil,
} from "discord.js";
import { translate } from "../locales/index.js";
import cardColors from "../utils/cardColors.js";
import {
  getCards,
  getRankingPositionEmoji,
  parseCardId,
} from "../utils/functions.js";
import { logger } from "../utils/logger.js";
import { rest } from "../utils/rest.js";

/**
 * @type {Collection<string, import('../types').GameObject}
 */
export const games = new Collection();

/**
 *
 * @param {string} memberId
 * @param {string} guildId
 */
export function findGameByMemberId(memberId, guildId) {
  return games.find(
    (game) =>
      game.players.some((player) => player.id === memberId) &&
      game.guildId === guildId
  );
}

/**
 *
 * @param {string} channelId
 */
export function findGameByChannelId(channelId) {
  return games.find((game) => game.channelId === channelId);
}

/**
 *
 * @param {string} gameId
 * @returns {NodeJS.Timeout}
 */
export function createTimeout(gameId) {
  return setInterval(
    (id) => {
      const game = games.get(id);
      if (!game) {
        return;
      }
      const amount = game.stackedCombo || 2;
      const player = game.actualPlayer();
      player.cards.push(...getCards(amount));
      player.inactiveRounds++;
      game.stackedCombo = 0;
      game.messages.push({
        key: "game.inactivity",
        variables: [
          `<@${game.actualPlayer().id}>`,
          player.cards.length,
          amount,
        ],
      });

      if (game.actualPlayer().inactiveRounds >= 2) {
        rest
          .post(Routes.channelMessages(game.channelId), {
            body: {
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    translate(
                      player.locale,
                      "game.removedByInactivity",
                      `<@${player.id}>`
                    )
                  )
                  .setColor(Colors.Blurple),
              ],
            },
          })
          .catch((err) => logger.error(err));
        game.removePlayer(player.id);

        if (game.players.size <= 1) {
          return;
        }
      }
      game.addIndex();
      rest
        .post(Routes.channelMessages(game.channelId), {
          body: game.makePayload(),
        })
        .catch((err) => logger.error(err));
    },
    60000,
    gameId
  );
}

/**
 *
 * @param {string} hostId
 * @param {string} guildId
 * @param {string} channelId
 * @returns {import('../types').GameObject}
 */
export function createGame(hostId, guildId, channelId) {
  const id = SnowflakeUtil.generate().toString();
  return games
    .set(id, {
      id,
      channelId,
      guildId,
      players: new Collection(),
      index: 0,
      hostId,
      lastCardId: "",
      status: "onqueue",
      stackedCombo: 0,
      messages: [],
      timeout: null,
      winners: [],
      nextPlayer() {
        return this.players.at((this.index + 1) % this.players.size);
      },
      actualPlayer() {
        return this.players.at(this.index);
      },
      addPlayer(member, locale) {
        this.players.set(member.id, {
          id: member.id,
          cards: getCards(7),
          inactiveRounds: 0,
          locale,
          username: member.user.username,
        });
      },
      removePlayer(playerId) {
        if (this.players.size === 1 && this.status !== "started") {
          clearTimeout(this.timeout);
          games.delete(this.id);
          return;
        }

        if (this.players.size === 2 && this.status === "started") {
          clearTimeout(this.timeout);
          this.players.delete(playerId);
          this.winners.push(this.players.first());
          rest
            .post(Routes.channelMessages(this.channelId), {
              body: {
                embeds: [
                  new EmbedBuilder()
                    .setDescription(
                      `${translate(
                        this.winners[0].locale,
                        "game.embeds.end.descriptions.noPlayers",
                        `<@${this.winners[0].id}>`
                      )}\n\n\`\`\`${this.winners
                        .map(
                          (winner, index) =>
                            `[${getRankingPositionEmoji(index)}] #${
                              index + 1
                            } | ${winner.username}`
                        )
                        .join("\n")}\`\`\``
                    )
                    .setColor(Colors.Blurple)
                    .setFooter({
                      text: translate(
                        this.winners[0].locale,
                        "game.embeds.end.footer"
                      ),
                    })
                    .toJSON(),
                ],
              },
            })
            .catch((err) => logger.error(err));
          games.delete(this.id);
          return;
        }

        if (this.actualPlayer().id === playerId) {
          this.addIndex();
          rest.post(Routes.channelMessages(this.channelId), {
            body: {
              ...this.makePayload(),
            },
          });
        }

        this.players.delete(playerId);

        if (this.hostId === playerId) {
          this.hostId = this.players.randomKey();
          rest
            .post(Routes.channelMessages(this.channelId), {
              body: {
                content: translate(
                  this.actualPlayer().locale,
                  "game.newAuthor",
                  this.hostId
                ),
              },
            })
            .catch((err) => logger.error(err));
        }
      },
      addIndex() {
        this.index = (this.index + 1) % this.players.size;
      },
      makePayload() {
        const parsedCard = parseCardId(
          this.lastCardId,
          this.actualPlayer().locale
        );
        const playersArray = [...this.players.values()];
        const mappedMessages = this.messages.length
          ? this.messages
              .map(({ key, variables }) =>
                translate(this.actualPlayer().locale, key, ...variables)
              )
              .join("\n")
          : null;
        this.messages = [];
        return {
          content: `<@${this.actualPlayer().id}>`,
          embeds: [
            {
              description: `${
                mappedMessages ? `${mappedMessages}\n` : ""
              }${translate(
                this.actualPlayer().locale,
                "game.embeds.resume.description",
                `<@${this.actualPlayer().id}>`,
                parsedCard.toString()
              )}\n\n**${translate(
                this.actualPlayer().locale,
                "game.cards.cards"
              )}**\n\`\`\`\n${this.players
                .clone()
                .sort((a, b) => a.cards.length - b.cards.length)
                .map(
                  (player) =>
                    `#${
                      playersArray.findIndex((p) => p.id === player.id) + 1
                    } | ${player.username}: ${player.cards.length} ${translate(
                      this.actualPlayer().locale,
                      "game.cards.cards"
                    )}`
                )
                .join("\n")}\`\`\``,
              color: cardColors[parsedCard.color],
              footer: {
                text: translate(
                  this.actualPlayer().locale,
                  "game.embeds.resume.footer"
                ),
              },
            },
          ],
        };
      },
    })
    .get(id);
}
