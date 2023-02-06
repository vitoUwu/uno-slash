import { Colors, CommandInteraction, Locale } from "discord.js";
import { createRequire } from "node:module";
import config from "../config.js";
import { games } from "../handlers/games.js";
import { translate } from "../locales/index.js";
const _require = createRequire(import.meta.url);
const packageJson = _require("../../package.json");

export default {
  name: "about",
  description: translate(Locale.EnglishUS, "commands.about.description"),
  description_localizations: {
    "pt-BR": translate(Locale.PortugueseBR, "commands.about.description"),
  },
  cooldown: 5,
  /**
   *
   * @param {CommandInteraction} interaction
   */
  execute: async (interaction) => {
    return await interaction.reply({
      embeds: [
        {
          color: Colors.Blurple,
          fields: [
            {
              name: translate(interaction.locale, "commands.about.versions"),
              value: `Discord.js: \`${packageJson.dependencies["discord.js"]}\`\nNode.js: \`${process.version}\`\nBot: \`${packageJson.version}\``,
              inline: true,
            },
            {
              name: translate(interaction.locale, "commands.about.servers"),
              value: `${interaction.client.guilds.cache.size}`,
              inline: true,
            },
            {
              name: translate(interaction.locale, "commands.about.matchs"),
              value: `${games.size}`,
              inline: true,
            },
            {
              name: translate(interaction.locale, "commands.about.creator"),
              value: `<@504717946124369937> \`vitoo#7341 (504717946124369937)\``,
              inline: true,
            },
            {
              name: translate(interaction.locale, "commands.about.links"),
              value: `[Uno Slash - Support](${config.supportUrl})\n[${translate(
                interaction.locale,
                "commands.about.tos"
              )}](${config.tosUrl})\n[${translate(
                interaction.locale,
                "commands.about.pp"
              )}](${config.ppUrl})`,
              inline: true,
            },
          ],
        },
      ],
    });
  },
};
