import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, Option } from '@sapphire/framework';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	ComponentType,
	EmbedBuilder,
	StringSelectMenuInteraction,
	type Awaitable
} from 'discord.js';
import { translate } from '../../lib/locales/index.js';
import { Card } from '../../lib/structures/Card.js';
import { defaultButtons } from '../../lib/utils.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class ShowCardsButton extends InteractionHandler {
	public override parse(interaction: StringSelectMenuInteraction): Awaitable<Option<{ cardId: string }>> {
		if (interaction.customId !== 'play') {
			return this.none();
		}

		const cardId = interaction.values[0].split(':')[1];

		return this.some({ cardId });
	}

	public async run(interaction: StringSelectMenuInteraction, parsedData: InteractionHandler.ParseResult<this>) {
		const game = this.container.games.get(interaction.channelId);
		if (!game) {
			return;
		}
		const player = game.players.get(interaction.user.id);
		if (!player) {
			return await interaction.reply({
				embeds: [
					{
						color: Colors.Red,
						description: translate(interaction.locale, 'errors.not_participating')
					}
				],
				ephemeral: true
			});
		}

		if (game.actualPlayer.id !== player.id) {
			return await interaction.reply({
				embeds: [
					{
						color: Colors.Red,
						description: translate(interaction.locale, 'errors.not_your_turn')
					}
				],
				ephemeral: true
			});
		}

		if (parsedData.cardId === 'draw') {
			game.timeout!.refresh();
			player.addCards(1);
			player.resetInactivity();
			game.messages.push({
				key: 'commands.draw.drew_card',
				variables: [interaction.user]
			});
			game.next();
			interaction
				.update({
					embeds: [new EmbedBuilder().setColor(Colors.Blurple).setDescription(translate(interaction.locale, 'commands.draw.drew_card'))],
					components: []
				})
				.catch(() => null);
			return await game.updateMessage();
		}

		const card = player.findCardById(parsedData.cardId);
		if (!card) {
			return await interaction.reply({
				embeds: [
					{
						color: Colors.Red,
						description: translate(interaction.locale, 'errors.card_not_found')
					}
				],
				ephemeral: true
			});
		}

		game.timeout!.refresh();
		player.resetInactivity();

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
			game.messages.push(
				{
					key: 'commands.play.messages.uno',
					variables: [interaction.user.toString()]
				},
				{
					key: 'commands.play.messages.report',
					variables: []
				}
			);
		}

		player.resetInactivity();
		game.lastCard = card;

		if (card.type === 'special') {
			const reply = await interaction.update({
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

		interaction[interaction.replied ? 'editReply' : 'update']({
			embeds: [new EmbedBuilder().setColor(card.toDecimalColor()).setDescription(card.toString(interaction.locale))],
			components: []
		}).catch(() => null);
		const uno = player.cards.length === 1;
		const reply = await game.updateMessage(uno);
		if (!reply || !uno) {
			return;
		}

		const response = await reply!
			.awaitMessageComponent({
				filter: (i) => game.players.has(i.user.id),
				time: 5000
			})
			.catch(() => null);

		if (!response || response.customId === 'collector;report') {
			response?.deferUpdate().catch(() => null);
			await reply.edit({ components: [new ActionRowBuilder<ButtonBuilder>().setComponents(defaultButtons(interaction.locale))] });
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
			response.deferUpdate().catch(() => null);
			return reply.edit({ components: [new ActionRowBuilder<ButtonBuilder>().setComponents(defaultButtons(interaction.locale))] });
		}

		return;
	}
}
