const { CommandInteraction, Colors, Locale } = require("discord.js");
const package = require("../../package.json");
const locale = require("../locales");
const { supportUrl, tosUrl, ppUrl } = require("../../config.json");

module.exports = {
	name: "about",
	description: locale(Locale.EnglishUS, "commands.about.description"),
	description_localizations: {
		"pt-BR": locale(Locale.PortugueseBR, "commands.about.description"),
	},
	cooldown: 5,
	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async slashExecute(interaction) {
		const owner = interaction.client.application.owner;

		return interaction.reply({
			embeds: [
				{
					color: Colors.Blurple,
					fields: [
						{
							name: locale(interaction.locale, "commands.about.versions"),
							value: `Discord.js: \`${package.dependencies["discord.js"]}\`\nNode.js: \`${process.version}\`\nBot: \`${package.version}\``,
							inline: true
						},
						{
							name: locale(interaction.locale, "commands.about.servers"),
							value: `${interaction.client.guilds.cache.size}`,
							inline: true
						},
						{
							name: locale(interaction.locale, "commands.about.matchs"),
							value: `${interaction.client.games.size}`,
							inline: true
						},
						{
							name: locale(interaction.locale, "commands.about.creator"), 
							value: `${owner.toString()} \`${owner.tag} (${owner.id})\``,
							inline: true
						},
						{
							name: locale(interaction.locale, "commands.about.links"),
							value: `[Uno Slash - Support](${supportUrl})\n[${locale(interaction.locale, "commands.about.tos")}](${tosUrl})\n[${locale(interaction.locale, "commands.about.pp")}](${ppUrl})`,
							inline: true
						}
					],
				},
			],
		});
	},
};
