import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	AutocompleteInteraction,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Colors,
	ComponentType,
	Locale
} from 'discord.js';
import { translate } from '../lib/locales/index.js';
import { Card } from '../lib/structures/Card.js';

@ApplyOptions<Command.Options>({
	preconditions: ['GuildOnly', 'RequireParticipating', 'RequireStartedGame']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: 'play',
			description: translate(Locale.EnglishUS, 'commands.play.description'),
			description_localizations: {
				'pt-BR': translate(Locale.PortugueseBR, 'commands.play.description')
			},
			options: [
				{
					name: 'card',
					description: translate(Locale.EnglishUS, 'commands.play.options.cards.description'),
					descriptionLocalizations: {
						'pt-BR': translate(Locale.PortugueseBR, 'commands.play.options.cards.description')
					},
					type: ApplicationCommandOptionType.String,
					required: true,
					autocomplete: true
				},
				{
					name: 'uno',
					description: translate(Locale.EnglishUS, 'commands.play.options.uno.description'),
					descriptionLocalizations: {
						'pt-BR': translate(Locale.PortugueseBR, 'commands.play.options.uno.description')
					},
					type: ApplicationCommandOptionType.Boolean
				}
			]
		});
	}

	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		const game = this.container.games.get(interaction.channelId)!;
		const player = game.players.get(interaction.user.id)!;

		if (game.actualPlayer.id !== interaction.member.id) {
			return await interaction.reply({
				embeds: [{ color: Colors.Red, description: translate(interaction.locale, 'errors.not_your_turn') }],
				ephemeral: true
			});
		}

		game.timeout!.refresh();
		player.resetInactivity();

		const cardOption = interaction.options.getString('card', true);

		if (cardOption === 'draw') {
			player.addCards(1);
			game.messages.push({
				key: 'commands.draw.drew_card',
				variables: [interaction.user.toString()]
			});
			game.next();
			await interaction.reply(game.makePayload());
			return;
		}

		const card = player.findCardById(cardOption) ?? player.findCardByName(cardOption);
		if (!card) {
			return await interaction.reply({
				embeds: [{ color: Colors.Red, description: translate(interaction.locale, 'errors.card_not_found') }],
				ephemeral: true
			});
		}

		if (game.stackedCombo && card.number !== '+2') {
			await interaction.reply({
				embeds: [{ color: Colors.Red, description: translate(interaction.locale, 'errors.only_+2_card') }],
				ephemeral: true
			});
			return;
		}

		if (!game.lastCard.isCompatibleTo(card)) {
			await interaction.reply({
				embeds: [{ color: Colors.Red, description: translate(interaction.locale, 'errors.invalid_card') }],
				ephemeral: true
			});
			return;
		}

		player.removeCard(card.id);

		if (player.cards.length <= 0) {
			if (game.players.size > 2) {
				game.winners.push(player);
				game.removePlayer(player.id);
				game.messages.push({
					key: 'commands.play.messages.played.last_card',
					variables: [interaction.user.toString()]
				});
			} else {
				await interaction.reply({
					embeds: [
						{
							color: Colors.Blurple,
							description: translate(
								interaction.locale,
								'player.messages.played_last_card',
								interaction.user.toString(),
								card.toString(interaction.locale)
							)
						}
					]
				});
				game.winners.push(player);
				game.removePlayer(player.id);
				return;
			}
		}

		if (player.cards.length === 1) {
			game.messages.push({
				key: 'commands.play.messages.uno',
				variables: [interaction.user.toString()]
			});
			if (!interaction.options.getBoolean('uno')) {
				game.messages.push({
					key: 'commands.play.messages.report',
					variables: []
				});
			}
		}

		player.inactiveRounds = 0;

		game.lastCard = card;

		if (card.type === 'special') {
			const reply = await interaction.reply({
				embeds: [
					{
						description: translate(interaction.locale, 'game.choose_color'),
						color: Colors.Blurple
					}
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().setComponents(
						new ButtonBuilder()
							.setCustomId('g')
							.setEmoji({ name: '🟩' })
							.setLabel(translate(interaction.locale, 'game.cards.green'))
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('b')
							.setEmoji({ name: '🟦' })
							.setLabel(translate(interaction.locale, 'game.cards.blue'))
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('y')
							.setEmoji({ name: '🟨' })
							.setLabel(translate(interaction.locale, 'game.cards.yellow'))
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('r')
							.setEmoji({ name: '🟥' })
							.setLabel(translate(interaction.locale, 'game.cards.red'))
							.setStyle(ButtonStyle.Primary)
					)
				],
				fetchReply: true
			});
			const response = await reply
				.awaitMessageComponent({
					filter: (i) => i.user.id === interaction.user.id,
					time: 10000,
					componentType: ComponentType.Button
				})
				.catch(() => null);

			await response?.deferUpdate();

			const color = response?.customId || ['r', 'b', 'g', 'y'][Math.floor(Math.random() * 4)];
			game.lastCard = new Card(`${color}any`);
			if (card.number === '+4') {
				game.nextPlayer.addCards(4);
				game.messages.push({
					key: 'commands.play.messages.played.4wild',
					variables: [interaction.user.toString(), `<@${game.nextPlayer.id}>`, game.nextPlayer.cards.length]
				});
				game.next();
			} else {
				game.messages.push({
					key: 'commands.play.messages.played.wild',
					variables: [interaction.user.toString()]
				});
			}
		}

		if (card.number === '+2') {
			if (game.nextPlayer.cards.some((card) => card.number === '+2')) {
				game.stackedCombo += 2;
				game.messages.push({
					key: 'commands.play.messages.stacked+2',
					variables: [interaction.user.toString(), game.stackedCombo]
				});
			} else if (game.stackedCombo > 0) {
				game.nextPlayer.addCards(game.stackedCombo + 2);
				game.messages.push({
					key: 'commands.play.messages.finished_stacking',
					variables: [interaction.user.toString(), `<@${game.nextPlayer.id}>`, game.nextPlayer.cards.length, game.stackedCombo]
				});
				game.stackedCombo = 0;
				game.next();
			} else {
				game.nextPlayer.addCards(2);
				game.messages.push({
					key: 'commands.play.messages.played.+2',
					variables: [interaction.user.toString(), `<@${game.nextPlayer.id}>`, game.nextPlayer.cards.length]
				});
				game.next();
			}
		}

		if (card.number === 'r') {
			game.messages.push({
				key: 'commands.play.messages.played.reverse',
				variables: [interaction.user.toString()]
			});
			game.reversePlayers();
			if (game.players.size === 2) {
				game.next();
			}
		}

		if (card.number === 'b') {
			game.messages.push({
				key: 'commands.play.messages.played.block',
				variables: [interaction.user.toString(), `<@${game.nextPlayer.id}>`]
			});
			game.next();
		}

		game.next();
		const payload = game.makePayload();

		if (player.cards.length !== 1 || interaction.options.getBoolean('uno')) {
			return interaction[interaction.replied ? 'followUp' : 'reply'](payload);
		}

		const reply = await interaction[interaction.replied ? 'followUp' : 'reply']({
			...payload,
			components: [
				new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setCustomId('collector;uno')
						.setEmoji({ id: '1002561065399373944' })
						.setLabel('Uno!')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('collector;report')
						.setEmoji('🚨')
						.setLabel(translate(game.nextPlayer.locale, 'game.report'))
						.setStyle(ButtonStyle.Danger)
				)
			],
			fetchReply: true
		});

		const response = await reply
			.awaitMessageComponent({
				filter: (i) => game.players.has(i.user.id),
				time: 5000
			})
			.catch(() => null);

		if (!response || response.customId === 'collector;report') {
			await reply.edit({ components: [] });
			player.addCards(2);
			return interaction
				.channel!.send({
					embeds: [
						{
							description: translate(interaction.locale, 'game.punished_by_report', interaction.user.toString()),
							color: Colors.Blurple
						}
					]
				})
				.catch(() => null);
		}

		if (response.customId === 'collector;uno') {
			return reply.edit({ components: [] });
		}

		return;
	}

	public override async autocompleteRun(interaction: AutocompleteInteraction<'cached'>) {
		const game = this.container.games.get(interaction.channelId);
		if (!game) {
			return await interaction.respond([
				{
					name: translate(interaction.locale, 'errors.no_matchs_found'),
					value: translate(interaction.locale, 'errors.no_matchs_found')
				}
			]);
		}

		const player = game.players.get(interaction.user.id);
		if (!player) {
			return await interaction.respond([
				{
					name: translate(interaction.locale, 'errors.not_participating'),
					value: translate(interaction.locale, 'errors.not_participating')
				}
			]);
		}

		if (game.status !== 'started') {
			return await interaction.respond([
				{
					name: translate(interaction.locale, 'errors.match_not_started_yet'),
					value: translate(interaction.locale, 'errors.match_not_started_yet')
				}
			]);
		}

		const value = interaction.options.getFocused().toLowerCase();

		const data = player.cards
			.filter((card) => card.id.includes(value) || card.toString(interaction.locale).toLowerCase().includes(value))
			.map((card) => ({
				name: card.toString(interaction.locale),
				value: card.id
			}))
			.slice(0, 24)
			.concat({
				name: `🛒 ${translate(interaction.locale, 'commands.play.draw_card_option')}`,
				value: 'draw'
			});

		if (data.length <= 1) {
			data.unshift({
				name: translate(interaction.locale, 'errors.card_not_found'),
				value: translate(interaction.locale, 'errors.card_not_found')
			});
		}

		return await interaction.respond(data);
	}
}
