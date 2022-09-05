const { ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, Locale } = require("discord.js");
const { error } = require("../utils/embeds");
const locales = require("../locales");

module.exports = {
	name: "play",
	description: locales(Locale.EnglishUS, "commands.play.description"),
	description_localizations: {
		"pt-BR": locales(Locale.PortugueseBR, "commands.play.description"),
	},
	cooldown: 5,
	options: [
		{
			name: "card",
			name_localizations: {
				"pt-BR": "carta",
			},
			description: locales(Locale.EnglishUS, "commands.play.options.cards.description"),
			description_localizations: {
				"pt-BR": locales(Locale.PortugueseBR, "commands.play.options.cards.description"),
			},
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
		},
	],
	/**
	 * @param { ChatInputCommandInteraction} interaction
	 */
	async slashExecute(interaction) {
		const { options, client } = interaction;

		const game = client.games.get(interaction.channelId);
		if (!game) return await interaction.reply({ embeds: [error(locales(interaction.locale, "commands.play.noMatchs"))], ephemeral: true });

		if (!game.started) return await interaction.reply({ embeds: [error(locales(interaction.locale, "commands.play.notStarted"))], ephemeral: true });

		if (game.whoPlaysNow?.member.id !== interaction.member.id)
			return await interaction.reply({ embeds: [error(locales(interaction.locale, "commands.play.notTurn"))], ephemeral: true });

		const player = game.getPlayer(interaction.member.id);
		if (!player) return await interaction.reply({ embeds: [error(locales(interaction.locale, "commands.play.notParticipating"))], ephemeral: true });

		await player.playCard(options.getString("card"), interaction);
	},

	/**
	 *
	 * @param {AutocompleteInteraction} interaction
	 */
	async autocompleteExecute(interaction) {
		const { client } = interaction;

		const game = client.games.get(interaction.channelId);
		if (!game)
			return await interaction.respond([
				{ name: locales(interaction.locale, "commands.play.noMatchs"), value: locales(interaction.locale, "commands.play.noMatchs") },
			]);

		if (!game.started)
			return await interaction.respond([
				{ name: locales(interaction.locale, "commands.play.notStarted"), value: locales(interaction.locale, "commands.play.notStarted") },
			]);

		const player = game.getPlayer(interaction.member.id);
		if (!player)
			return await interaction.respond([
				{ name: locales(interaction.locale, "commands.play.notParticipating"), value: locales(interaction.locale, "commands.play.notParticipating") },
			]);

		const value = interaction.options.getFocused(true).value.toLowerCase();

		let data = player.cards
			.filter((cardId) => cardId.includes(value) || game.parseCardId(cardId).toString().toLowerCase().includes(value))
			.map((card) => ({ name: game.parseCardId(card).toString(), value: card }))
			.slice(0, 24);
		
		data.push({ name: locales(interaction.locale, "commands.play.drawCardOption"), value: "draw" });

		if (!data.length)
			data = [
				{
					name: locales(interaction.locale, "commands.play.cardNotFound"),
					value: locales(interaction.locale, "commands.play.cardNotFound")
				},
				{
					name: locales(interaction.locale, "commands.play.drawCardOption"),
					value: "draw"
				}
			];

		await interaction.respond(data);
		return;
	},
};
