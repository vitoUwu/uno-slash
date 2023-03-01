import { Collection, Colors, EmbedBuilder, SnowflakeUtil } from "discord.js";
import { translate } from "../locales/index.js";
import cardColors from "../utils/cardColors.js";
import {
  getCards,
  getRankingPositionEmoji,
  parseCardId,
} from "../utils/functions.js";
import { logger } from "../utils/logger.js";
import { createMessage, editMessage } from "../utils/rest.js";

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
      player.addCards(amount);
      player.inactiveRounds++;
      game.stackedCombo = 0;
      game.messages.push({
        key: "game.punished_by_inactivity",
        variables: [
          `<@${game.actualPlayer().id}>`,
          player.cards.length,
          amount,
        ],
      });

      if (game.actualPlayer().inactiveRounds >= 2) {
        createMessage(game.channelId, {
          embeds: [
            {
              description: translate(
                player.locale,
                "game.removed_by_inactivity",
                `<@${player.id}>`
              ),
              color: Colors.Blurple,
            },
          ],
        }).catch((err) => logger.error(err));
        game.removePlayer(player.id);

        if (game.players.size <= 1) {
          return;
        }
      }
      game.addIndex();
      createMessage(game.channelId, game.makePayload()).catch((err) =>
        logger.error(err)
      );
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
 * @param {string} queueMessageId
 * @returns {import('../types').GameObject}
 */
export function createGame(hostId, guildId, channelId) {
  const id = SnowflakeUtil.generate().toString();
  return games
    .set(id, {
      id,
      channelId,
      guildId,
      queueMessageId: "",
      players: new Collection(),
      index: 0,
      hostId,
      lastCardId: "",
      status: "onqueue",
      stackedCombo: 0,
      messages: [],
      timeout: null,
      winners: [],
      createdAt: new Date(),
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
          addCards(amount) {
            this.cards.push(...getCards(amount));
          },
        });
      },
      removePlayer(playerId) {
        if (this.status === "onqueue") {
          if (this.players.size <= 1) {
            editMessage(this.channelId, this.queueMessageId, {
              embeds: [
                {
                  color: Colors.Red,
                  description: translate(
                    this.actualPlayer().locale,
                    "errors.abandoned_match"
                  ),
                },
              ],
              components: [],
            });
            clearTimeout(this.timeout);
            games.delete(this.id);
            return;
          }
          this.players.delete(playerId);
          this.updateQueueMessage();
          if (this.hostId === playerId) {
            this.hostId = this.players.randomKey();
            createMessage(this.channelId, {
              content: translate(
                this.actualPlayer().locale,
                "game.new_match_host",
                `<@${this.hostId}>`
              ),
            }).catch((err) => logger.error(err));
          }
          return;
        }

        if (this.status === "started") {
          if (this.players.size === 2) {
            clearTimeout(this.timeout);
            this.players.delete(playerId);
            this.winners.push(this.players.first());
            this.players.clear();
            createMessage(this.channelId, {
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `${translate(
                      this.winners[0].locale,
                      "game.embeds.end.descriptions.no_more_players",
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
            }).catch((err) => logger.error(err));
            games.delete(this.id);
            return;
          }

          if (
            this.actualPlayer().id === playerId &&
            this.actualPlayer().cards.length !== 0
          ) {
            this.players.delete(playerId);
            createMessage(this.channelId, this.makePayload()).catch((err) =>
              logger.error(err)
            );
            return;
          }

          this.players.delete(playerId);
          return;
        }

        this.players.delete(playerId);
      },
      addIndex() {
        this.index = (this.index + 1) % this.players.size;
      },
      makePayload() {
        const parsedCard = parseCardId(
          this.lastCardId,
          this.actualPlayer().locale
        );
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
                mappedMessages ? `${mappedMessages}\n\n` : ""
              }${translate(
                this.actualPlayer().locale,
                "game.embeds.resume.description",
                `<@${this.actualPlayer().id}>`,
                parsedCard.toString()
              )}\n\n**${translate(
                this.actualPlayer().locale,
                "game.cards.cards"
              )}**\n\`\`\`\n${[
                ...this.players
                  .clone()
                  .sort((a, b) => a.cards.length - b.cards.length)
                  .values(),
              ]
                .map(
                  (player, index) =>
                    `#${index + 1} | ${player.username}: ${
                      player.cards.length
                    } ${translate(
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
      updateQueueMessage() {
        const playersUsernames = this.players
          .map((player) => player.username)
          .join("\n");
        editMessage(this.channelId, this.queueMessageId, {
          embeds: [
            {
              description: `${translate(
                this.actualPlayer().locale,
                "commands.create.queue_description"
              )}\n\n${translate(
                this.actualPlayer().locale,
                "commands.create.players"
              )}: \`\`\`${playersUsernames}\`\`\``,
              color: Colors.Blurple,
            },
          ],
        }).catch((err) => logger.error(err));
      },
      reversePlayers() {
        const actualPlayerKey = this.players.keyAt(this.index);
        this.players.reverse();
        this.index = [...this.players.keys()].indexOf(actualPlayerKey);
      },
    })
    .get(id);
}
