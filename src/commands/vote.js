const { supportUrl } = require("../../config.json");
const { ChatInputCommandInteraction, Locale, ActionRowBuilder, Colors, ButtonStyle, ButtonBuilder } = require("discord.js");
const locales = require("../locales");

module.exports = {
	name: "vote",
	description: locales(Locale.EnglishUS, "commands.vote.description"),
	description_localizations: {
		"pt-BR": locales(Locale.PortugueseBR, "commands.vote.description"),
	},
	cooldown: 5,
	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async slashExecute(interaction) {
		const row = new ActionRowBuilder().setComponents(
			new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Top.gg").setURL("https://top.gg/bot/1002203084388315146"),
			new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Discord Bot List").setURL("https://discordbotlist.com/bots/unoslash"),
			new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Discord Bots").setURL("https://discord.bots.gg/bots/1002203084388315146"),
			new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Support").setURL(supportUrl)
		);

		return interaction.reply({
			embeds: [
				{
					description: locales(interaction.locale, "commands.vote.embed.description"),
					color: Colors.Blurple,
				},
			],
			components: [row],
		});
	},
};
