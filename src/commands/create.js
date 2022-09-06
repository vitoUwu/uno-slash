const { ButtonStyle, ChannelType, ChatInputCommandInteraction, Colors, ActionRowBuilder, ButtonBuilder, Locale } = require("discord.js");
const locales = require("../locales");
const Game = require("../structures/Game");
const { error, success } = require("../utils/embeds");

module.exports = {
	name: "create",
	description: locales(Locale.EnglishUS, "commands.create.description"),
	description_localizations: {
		"pt-BR": locales(Locale.PortugueseBR, "commands.create.description"),
	},
	cooldown: 5,
	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async slashExecute(interaction) {
		const { client } = interaction;
		if (
			!interaction.channel ||
			(interaction.channel.type !== ChannelType.GuildText &&
				interaction.channel.type !== ChannelType.GuildPublicThread &&
				interaction.channel.type !== ChannelType.GuildPrivateThread)
		)
			return await interaction.reply({
				embeds: [error(locales(interaction.locale, "commands.create.invalidChannel"))],
				ephemeral: true,
			});

		let game = client.games.get(interaction.channelId);
		if (game)
			return await interaction.reply({
				embeds: [error(locales(interaction.locale, "commands.create.alreadyStartedMatch"))],
				ephemeral: true,
			});

		game = new Game(interaction.user.id, interaction.channel.id, interaction.guild.id, interaction.client);
		client.games.set(interaction.channelId, game);
		game.addPlayer(interaction.member, interaction.locale);
		game.interaction = interaction;

		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId("join").setLabel(locales(interaction.locale, "commands.create.joinMatch")).setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId("start").setLabel(locales(interaction.locale, "commands.create.startMatch")).setStyle(ButtonStyle.Success),
			new ButtonBuilder().setCustomId("cancel").setLabel(locales(interaction.locale, "commands.create.cancelMatch")).setStyle(ButtonStyle.Danger)
		);

		const reply = await interaction.reply({
			embeds: [
				{
					description: `${locales(interaction.locale, "commands.create.matchQueueDescription")}\n\n${locales(
						interaction.locale,
						"commands.create.players"
					)}:\`\`\`${game.players.map((p) => p.member.user.username).join("\n")}\`\`\``,
					color: Colors.Blurple,
				},
			],
			components: [row],
			fetchReply: true,
		});

		const collector = reply.createMessageComponentCollector({
			time: 60000 * 5,
		});

		collector.on("collect", async (i) => {
			if (i.customId === "start") {
				if (i.user.id !== game.authorId)
					return await i.reply({
						embeds: [error(locales(i.locale, "commands.create.youCantStart"))],
						ephemeral: true,
					});

				if (game.players.length < 2)
					return await i.reply({
						embeds: [error(locales(i.locale, "commands.create.noPlayers"))],
						ephemeral: true,
					});

				await interaction.editReply({
					embeds: [
						{
							title: locales(interaction.locale, "commands.create.startedMatch"),
							description: `${locales(interaction.locale, "commands.create.players")}: ${game.players.length}\n\`\`\`${game.players
								.map((player) => player.member.user.username)
								.join("\n")}\`\`\``,
							color: Colors.Green,
						},
					],
					components: [],
				});
				game.start();
				collector.stop();
				game = null;
				return;
			}

			if (i.customId === "join") {
				if (game.players.some((player) => player.member.id === i.user.id))
					return await i.reply({
						embeds: [error(locales(i.locale, "commands.create.alreadyJoinedMatch"))],
						ephemeral: true,
					});

				game.addPlayer(i.member, i.locale);
				await i.reply({
					embeds: [success(locales(i.locale, "commands.create.joinedMatch"))],
					ephemeral: true,
				});
				await interaction.editReply({
					embeds: [
						{
							description: `${locales(i.locale, "commands.create.matchQueueDescription")}\n\n${locales(
								i.locale,
								"commands.create.players"
							)}: \`\`\`${game.players.map((p) => p.member.user.username).join("\n")}\`\`\``,
							color: Colors.Blurple,
						},
					],
				});
				return;
			}

			if (i.customId === "cancel") {
				if (i.user.id !== game.authorId)
					return await i.reply({
						embeds: [error(locales(i.locale, "commands.create.youCantCancel"))],
						ephemeral: true,
					});

				collector.stop();
				interaction.client.games.delete(interaction.channel.id);
				
				await interaction.editReply({
					embeds: [
						{
							description: locales(interaction.locale, "commands.create.cancelledMatch"),
							color: Colors.Red,
						},
					],
					components: [],
				});
			}
		});

		collector.on("end", async (_, reason) => {
			if (reason === "time") {
				await reply
					.edit({
						embeds: [error(locales(interaction.locale, "commands.create.cancelledByInactivity"))],
						components: [],
					})
					.catch(() => {});
				client.games.delete(interaction.channel.id);
				return;
			}
		});
	},
};
