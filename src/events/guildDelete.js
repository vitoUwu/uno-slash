import axios from "axios";
import { Colors, Guild } from "discord.js";
import config from "../config.js";
import { deleteGame, games } from "../handlers/games.js";
import { logger } from "../utils/logger.js";

export default {
  name: "guildDelete",
  /**
   * @param {Guild} guild
   */
  async execute(guild) {
    games
      .filter((game) => game.guildId === guild.id)
      .forEach((game) => deleteGame(game.id));

    await axios
      .post(config.loggerUrl, {
        content: guild.vanityURLCode
          ? `discord.gg/${guild.vanityURLCode}`
          : "No vanity",
        embeds: [
          {
            fields: [
              {
                name: "Nome",
                value: `\` ${guild.name} (${guild.id}) \``,
                inline: true,
              },
              {
                name: "Dono",
                value: `<@${guild.ownerId}> (${guild.ownerId})`,
                inline: true,
              },
              {
                name: "Membros",
                value: `${guild.memberCount || 0}`,
                inline: true,
              },
              {
                name: "Língua",
                value: `${guild.preferredLocale || "No preferred locale"}`,
                inline: true,
              },
              {
                name: "Recursos Ativos",
                value: `${guild.features?.join(" ") || "No features"}`,
              },
            ],
            color: Colors.Red,
          },
        ],
      })
      .catch((err) => {
        logger.error(err);
      });
  },
};
