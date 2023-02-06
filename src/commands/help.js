import { ChatInputCommandInteraction, Locale } from "discord.js";
import config from "../config.js";
import { translate } from "../locales/index.js";

export default {
  name: "help",
  description: translate(Locale.EnglishUS, "commands.help.description"),
  description_localizations: {
    "pt-BR": translate(Locale.PortugueseBR, "commands.help.description"),
  },
  cooldown: 5,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  execute: async (interaction) => {
    return await interaction.reply({
      embeds: [
        {
          title: "Tutorial",
          thumbnail: {
            url: interaction.client.user.displayAvatarURL(),
          },
          color: config.color,
          fields: [
            {
              name: translate(interaction.locale, "commands.help.create.title"),
              value: translate(
                interaction.locale,
                "commands.help.create.description"
              ),
              inline: true,
            },
            {
              name: translate(interaction.locale, "commands.help.play.title"),
              value: translate(
                interaction.locale,
                "commands.help.play.description"
              ),
              inline: true,
            },
            {
              name: translate(interaction.locale, "commands.help.draw.title"),
              value: translate(
                interaction.locale,
                "commands.help.draw.description"
              ),
              inline: true,
            },
            {
              name: translate(interaction.locale, "commands.help.leave.title"),
              value: translate(
                interaction.locale,
                "commands.help.leave.description"
              ),
              inline: true,
            },
          ],
        },
      ],
    });
  },
};
