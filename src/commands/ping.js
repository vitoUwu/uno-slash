const { ChatInputCommandInteraction, Colors, Locale } = require("discord.js");
const locales = require("../locales");

module.exports = {
  name: "ping",
  description: locales(Locale.EnglishUS, "commands.ping.description"),
  description_localizations: {
    "pt-BR": locales(Locale.PortugueseBR, "commands.ping.description")
  },
  cooldown: 5,
  /**
   * 
   * @param {ChatInputCommandInteraction} interaction 
   */
  async slashExecute(interaction) {
    const { client } = interaction;
    const reply = await interaction.reply({ embeds: [{ description: "Pinging..." }], fetchReply: true });
		await interaction.editReply({
			embeds: [{
        description: `
[\`🏓\`] ${locales(interaction.locale, "commands.ping.latency")}: \`${reply.createdTimestamp - interaction.createdTimestamp}ms\`
[\`📡\`] Websocket: \`${client.ws.ping}ms\``,
        color: Colors.Blurple,
      }],
		});
		return;
  }
}
