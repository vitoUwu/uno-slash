import { ChatInputCommandInteraction, Colors, Locale } from "discord.js";
import { translate } from "../locales/index.js";

export default {
  name: "ping",
  description: translate(Locale.EnglishUS, "commands.ping.description"),
  description_localizations: {
    "pt-BR": translate(Locale.PortugueseBR, "commands.ping.description"),
  },
  cooldown: 5,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  execute: async (interaction) => {
    const reply = await interaction.reply({
      embeds: [{ description: "Pinging..." }],
      fetchReply: true,
    });
    await interaction.editReply({
      embeds: [
        {
          description: `
[\`🏓\`] ${translate(interaction.locale, "commands.ping.latency")}: \`${
            reply.createdTimestamp - interaction.createdTimestamp
          }ms\`
[\`📡\`] Websocket: \`${interaction.client.ws.ping}ms\``,
          color: Colors.Blurple,
        },
      ],
    });
    return;
  },
};
