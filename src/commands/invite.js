const { CommandInteraction, Locale, ComponentType, ButtonStyle } = require("discord.js");
const locale = require("../locales");

module.exports = {
	name: "invite",
	description: locale(Locale.EnglishUS, "commands.invite.description"),
	description_localizations: {
		"pt-BR": locale(Locale.PortugueseBR, "commands.invite.description"),
	},
	cooldown: 5,
	/**
	 *
	 * @param {CommandInteraction} interaction
	 */
	async slashExecute(interaction) {
		const { permissions, scopes } = interaction.client.application.installParams;

		const invite = interaction.client.generateInvite({
			permissions,
			scopes,
		});

		return interaction.reply({
			embeds: [
				{
					color: "#2f3136",
					description: locale(interaction.locale, "commands.invite.embed.description", invite),
				},
			],
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							style: ButtonStyle.Link,
							label: locale(interaction.locale, "commands.invite.button.label"),
							url: invite,
						},
					],
				},
			],
		});
	},
};
