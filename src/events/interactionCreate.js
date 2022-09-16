const { Interaction, InteractionType } = require("discord.js");
const { error } = require("../utils/embeds");
const { ownerId } = require("../../config.json");
const locales = require("../locales");
const cooldowns = new Map();

module.exports = {
	name: "interactionCreate",
	/**
	 *
	 * @param {Interaction} interaction
	 */
	async execute(interaction) {
		const { client } = interaction;
		if (!interaction.inGuild()) return interaction.reply({ embeds: [error(locales(interaction.locale, "noDm"))] });
		if (interaction.channel?.partial) await interaction.channel.fetch();

		if (interaction.isCommand()) {
			const commandName = interaction.commandName;
			const commandExecute = interaction.isChatInputCommand()
				? "slashExecute"
				: interaction.isUserContextMenuCommand()
				? "userContextExecute"
				: "messageContextExecute";

			const command = client.commands.find((cmd) => cmd.name === commandName && !!cmd[commandExecute]);
			if (!command || (command.ownerOnly && interaction.user.id !== ownerId)) return;

			const userCooldown = cooldowns.get(`${commandName}_${interaction.user.id}`);
			if (userCooldown)
				return interaction.reply({
					embeds: [error(locales(interaction.locale, "commandSpam", ((userCooldown - Date.now()) / 1000).toFixed(1)))],
					ephemeral: true,
				});
			cooldowns.set(`${commandName}_${interaction.user.id}`, Date.now() + command.cooldown * 1000);
			setTimeout(() => cooldowns.delete(`${commandName}_${interaction.user.id}`), command.cooldown * 1000);

			if (!interaction.channel.permissionsFor(interaction.guild.members.me).has("EmbedLinks"))
				return interaction.reply({ content: locales(interaction.locale, "missingPermission") });

			try {
				command[commandExecute](interaction);
			} catch (err) {
				interaction.reply({ embeds: [error(err.stack || err || "Unknown Error")] });
				client.logger.error(err);
			}
		} else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
			const commandName = interaction.commandName;

			const command = client.commands.find((cmd) => cmd.name === commandName && !!cmd.autocompleteExecute);
			if (!command) return;

			try {
				command.autocompleteExecute(interaction);
			} catch (err) {
				interaction.respond([{ name: "Unknown Error", value: "Unknown Error" }]);
				client.logger.error(err);
			}
		}
	},
};
