import { ApplyOptions, RequiresClientPermissions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	Locale
} from 'discord.js';
import { translate } from '../lib/locales/index.js';
import { Game } from '../lib/structures/Game.js';

@ApplyOptions<Command.Options>({
	preconditions: ['GuildOnly']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: 'create',
			description: translate(Locale.EnglishUS, 'commands.create.description'),
			description_localizations: {
				'pt-BR': translate(Locale.PortugueseBR, 'commands.create.description')
			}
		});
	}

	@RequiresClientPermissions(['EmbedLinks', 'SendMessages', 'UseExternalEmojis'])
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		if (!interaction.channel || !interaction.channel.isTextBased() || !interaction.inGuild()) {
			return await interaction.reply({
				embeds: [
					{
						color: Colors.Red,
						description: translate(interaction.locale, 'errors.invalid_channel')
					}
				],
				ephemeral: true
			});
		}

		const alreadyCreatedGame = this.container.games.get(interaction.channelId);

		if (alreadyCreatedGame) {
			if (Date.now() - alreadyCreatedGame.createdAt.getTime() <= 60000 * 5 || alreadyCreatedGame.status !== 'onqueue') {
				return await interaction.reply({
					embeds: [
						{
							color: Colors.Red,
							description: translate(interaction.locale, 'errors.existing_match')
						}
					],
					ephemeral: true
				});
			}

			clearTimeout(alreadyCreatedGame.timeout);
			this.container.games.delete(alreadyCreatedGame.id);
		}

		await interaction.deferReply();

		const game = new Game({ channelId: interaction.channelId, guildId: interaction.guildId, hostId: interaction.user.id });
		game.addPlayer(interaction.member, interaction.locale || interaction.guildLocale || Locale.EnglishUS);

		this.container.games.set(interaction.channelId, game);
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('collector;join')
				.setLabel(translate(interaction.locale, 'commands.create.join_match'))
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('collector;start')
				.setLabel(translate(interaction.locale, 'commands.create.start_match'))
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId('collector;cancel')
				.setLabel(translate(interaction.locale, 'commands.create.cancel_match'))
				.setStyle(ButtonStyle.Danger)
		);

		const queueMessageHeader =
			`${translate(interaction.locale, 'commands.create.queue_description')}\n\n` +
			`${translate(interaction.locale, 'commands.create.players')}:`;
		const queueEmbed = new EmbedBuilder()
			.setDescription(queueMessageHeader + `\`\`\`${game.players.map((player) => player.username).join('\n')}\`\`\``)
			.setColor(Colors.Blurple);
		const reply = await interaction.editReply({
			embeds: [queueEmbed],
			components: [row]
		});

		const collector = reply.createMessageComponentCollector({
			idle: 60000 * 5,
			time: 60000 * 30
		});

		collector.on('collect', async (i: ButtonInteraction<'cached'>) => {
			try {
				if (!this.container.games.get(game.id)) {
					collector.stop();
					await Promise.allSettled([
						i.message.delete(),
						i.reply({
							content: translate(i.locale, 'errors.abandoned_match'),
							ephemeral: true
						})
					]);
					return;
				}

				const [_, buttonId] = i.customId.split(';');
				switch (buttonId) {
					case 'start': {
						if (i.user.id !== game.hostId) {
							await i.reply({
								embeds: [
									{
										color: Colors.Red,
										description: translate(i.locale, 'errors.missing_host_permissions')
									}
								],
								ephemeral: true
							});
							return;
						}

						if (game.players.size < 2) {
							await i.reply({
								embeds: [
									{
										color: Colors.Red,
										description: translate(i.locale, 'errors.insufficient_players')
									}
								],
								ephemeral: true
							});
							return;
						}

						interaction.deleteReply().catch(() => null);
						i.deferUpdate();
						collector.stop();
						game.start();

						await game.updateMessage();
						break;
					}
					case 'join': {
						if (game.players.has(i.user.id)) {
							await i.reply({
								embeds: [
									{
										color: Colors.Red,
										description: translate(i.locale, 'errors.already_participating')
									}
								],
								ephemeral: true
							});
							return;
						}

						game.addPlayer(i.member, i.locale);

						await i.reply({
							embeds: [
								{
									color: Colors.Red,
									description: translate(i.locale, 'commands.create.messages.joined')
								}
							],
							ephemeral: true
						});

						reply.edit({
							embeds: [
								queueEmbed.setDescription(
									queueMessageHeader + `\`\`\`\n${game.players.map((player) => player.username).join('\n')}\`\`\``
								)
							]
						});
						break;
					}
					case 'cancel': {
						if (i.user.id !== game.hostId) {
							await i.reply({
								embeds: [
									{
										color: Colors.Red,
										description: translate(i.locale, 'errors.missing_host_permissions')
									}
								],
								ephemeral: true
							});
							return;
						}

						collector.stop();
						clearTimeout(game.timeout);
						this.container.games.delete(game.id);

						await i.update({
							embeds: [
								{
									description: translate(interaction.locale, 'commands.create.messages.cancelled_by_host'),
									color: Colors.Red
								}
							],
							components: []
						});
						break;
					}
				}
			} catch (err) {
				this.container.logger.error(err);
			}
		});

		collector.on('end', async (_, reason) => {
			if (reason === 'time' || reason === 'idle') {
				await reply
					.edit({
						embeds: [
							{ description: translate(interaction.locale, 'commands.create.messages.cancelled_by_inactivity'), color: Colors.Red }
						],
						components: []
					})
					.catch(() => {});
				this.container.games.delete(game.id);
				return;
			}
		});

		return;
	}
}
