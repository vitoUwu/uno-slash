import axios from "axios";
import { Colors, Guild } from "discord.js";
import config from "../config.js";

export default {
  name: "guildCreate",
  /**
   * @param {Guild} guild
   */
  async execute(guild) {
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
                name: "Linguagem",
                value: `${guild.preferredLocale || "No preferred locale"}`,
                inline: true,
              },
              {
                name: "Recursos Ativos",
                value: `${guild.features?.join(" ") || "No features"}`,
              },
            ],
            color: Colors.Green,
          },
        ],
      })
      .catch((err) => {
        guild.client.logger.error(err);
      });
  },
};
