import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Colors,
  Locale,
} from "discord.js";
import config from "../config.js";
import { translate } from "../locales/index.js";

export default {
  name: "vote",
  description: translate(Locale.EnglishUS, "commands.vote.description"),
  description_localizations: {
    "pt-BR": translate(Locale.PortugueseBR, "commands.vote.description"),
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
          description: translate(
            interaction.locale,
            "commands.vote.embed.description"
          ),
          color: Colors.Blurple,
        },
      ],
      components: [
        new ActionRowBuilder().setComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Top.gg")
            .setURL("https://top.gg/bot/1002203084388315146"),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Discord Bot List")
            .setURL("https://discordbotlist.com/bots/unoslash"),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Discord Bots")
            .setURL("https://discord.bots.gg/bots/1002203084388315146"),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Support")
            .setURL(config.supportUrl)
        ),
      ],
    });
  },
};
