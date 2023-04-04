import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Colors,
  Locale,
} from "discord.js";
import { maintenance } from "../commands/maintenance.js";
import {
  createGame,
  createTimeout,
  findGameByChannelId,
  games,
} from "../handlers/games.js";
import { translate } from "../locales/index.js";
import embeds from "../utils/embeds.js";
import { getCards } from "../utils/functions.js";
import { logger } from "../utils/logger.js";

export default {
  name: "create",
  description: translate(Locale.EnglishUS, "commands.create.description"),
  description_localizations: {
    "pt-BR": translate(Locale.PortugueseBR, "commands.create.description"),
  },
  cooldown: 5,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  execute: async (interaction) => {
    if (maintenance) {
      return await interaction.reply({
        embeds: [
          embeds.error(
            translate(interaction.locale, "commands.create.maintenance")
          ),
        ],
        ephemeral: true,
      });
    }

    if (
      !interaction.channel ||
      !interaction.channel.isTextBased() ||
      !interaction.inGuild()
    ) {
      return await interaction.reply({
        embeds: [
          embeds.error(translate(interaction.locale, "errors.invalid_channel")),
        ],
        ephemeral: true,
      });
    }

    if (findGameByChannelId(interaction.channelId)) {
      return await interaction.reply({
        embeds: [
          embeds.error(translate(interaction.locale, "errors.existing_match")),
        ],
        ephemeral: true,
      });
    }

    const game = createGame(
      interaction.user.id,
      interaction.guildId,
      interaction.channelId
    );
    game.addPlayer(
      interaction.member,
      interaction.locale || interaction.guildLocale || Locale.EnglishUS
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("collector;join")
        .setLabel(translate(interaction.locale, "commands.create.join_match"))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("collector;start")
        .setLabel(translate(interaction.locale, "commands.create.start_match"))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("collector;cancel")
        .setLabel(translate(interaction.locale, "commands.create.cancel_match"))
        .setStyle(ButtonStyle.Danger)
    );

    const reply = await interaction.reply({
      embeds: [
        {
          description: `${translate(
            interaction.locale,
            "commands.create.queue_description"
          )}\n\n${translate(
            interaction.locale,
            "commands.create.players"
          )}:\`\`\`${game.players
            .map((player) => player.username)
            .join("\n")}\`\`\``,
          color: Colors.Blurple,
        },
      ],
      components: [row],
      fetchReply: true,
    });

    game.queueMessageId = reply.id;

    const collector = reply.createMessageComponentCollector({
      idle: 60000 * 5,
      time: 60000 * 30,
    });

    collector.on("collect", async (i) => {
      if (maintenance) {
        return await i.reply({
          embeds: [
            embeds.error(translate(i.locale, "commands.create.maintenance")),
          ],
          ephemeral: true,
        });
      }

      try {
        if (!games.get(game.id)) {
          await i.message.delete();
          collector.stop();
          return await i.reply({
            content: translate(i.locale, "errors.abandoned_match"),
            ephemeral: true,
          });
        }

        const [_, buttonId] = i.customId.split(";");
        switch (buttonId) {
          case "start": {
            if (i.user.id !== game.hostId) {
              return await i.reply({
                embeds: [
                  embeds.error(
                    translate(i.locale, "errors.missing_host_permissions")
                  ),
                ],
                ephemeral: true,
              });
            }

            if (game.players.size < 2) {
              return await i.reply({
                embeds: [
                  embeds.error(
                    translate(i.locale, "errors.insufficient_players")
                  ),
                ],
                ephemeral: true,
              });
            }

            await interaction.editReply({
              embeds: [
                {
                  title: translate(
                    interaction.locale,
                    "commands.create.messages.started"
                  ),
                  description: `${translate(
                    interaction.locale,
                    "commands.create.players"
                  )}: \`\`\`${game.players
                    .map(
                      (player) =>
                        interaction.guild.members.cache.get(player.id)?.user
                          ?.username || player.id
                    )
                    .join("\n")}\`\`\``,
                  color: Colors.Green,
                },
              ],
              components: [],
            });

            collector.stop();
            game.status = "started";
            game.index = Math.floor(Math.random() * game.players.size);
            game.lastCardId = getCards(1)[0];
            game.timeout = createTimeout(game.id);

            await i.reply(game.makePayload());
            break;
          }
          case "join": {
            if (game.players.some((player) => player.id === i.user.id)) {
              return await i.reply({
                embeds: [
                  embeds.error(
                    translate(i.locale, "errors.already_participating")
                  ),
                ],
                ephemeral: true,
              });
            }

            game.addPlayer(i.member, i.locale);

            await i.reply({
              embeds: [
                embeds.success(
                  translate(i.locale, "commands.create.messages.joined")
                ),
              ],
              ephemeral: true,
            });

            game.updateQueueMessage();
            break;
          }
          case "cancel": {
            if (i.user.id !== game.hostId) {
              return await i.reply({
                embeds: [
                  embeds.error(
                    translate(i.locale, "errors.missing_host_permissions")
                  ),
                ],
                ephemeral: true,
              });
            }

            collector.stop();
            games.delete(game.id);

            await interaction.editReply({
              embeds: [
                {
                  description: translate(
                    interaction.locale,
                    "commands.create.messages.cancelled_by_host"
                  ),
                  color: Colors.Red,
                },
              ],
              components: [],
            });
            break;
          }
        }
      } catch (err) {
        logger.error(err);
      }
    });

    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        await reply
          .edit({
            embeds: [
              embeds.error(
                translate(
                  interaction.locale,
                  "commands.create.messages.cancelled_by_inactivity"
                )
              ),
            ],
            components: [],
          })
          .catch(() => {});
        games.delete(game.id);
        return;
      }
    });
  },
};
