import { container } from '@sapphire/framework';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	EmbedBuilder,
	Locale,
	StringSelectMenuBuilder,
	type GuildBasedChannel,
	type PermissionsString
} from 'discord.js';
import cards from './cards.js';
import { translate } from './locales/index.js';
import type { Card } from './structures/Card.js';

/**
 * Picks a random item from an array
 * @param array The array to pick a random item from
 * @example
 * const randomEntry = pickRandom([1, 2, 3, 4]) // 1
 */
export function pickRandom<T>(array: readonly T[]): T {
	const { length } = array;
	return array[Math.floor(Math.random() * length)];
}

export async function fetchGuildsSize() {
	const guilds = (await container.client.shard?.fetchClientValues('guilds.cache.size')) as number[];
	return guilds?.reduce((acc, guildCount) => acc + guildCount, 0) ?? 0;
}

export async function fetchGamesSize() {
	const games = await container.client.shard?.broadcastEval((client) => {
		return client.stores.first()!.first()!.container.games.size;
	});

	return games?.reduce((acc, gamesCount) => acc + gamesCount, 0) ?? 0;
}

export function getCards(amount: number) {
	const c = [];
	for (let i = 0; i < amount; i++) {
		c.push(cards[Math.floor(Math.random() * cards.length)]);
	}
	return c;
}

export const defaultButtons = (locale: Locale) => [
	new ButtonBuilder().setCustomId('view_cards').setEmoji('🃏').setLabel(translate(locale, 'buttons.view_cards')).setStyle(ButtonStyle.Primary),
	new ButtonBuilder().setCustomId('draw').setEmoji('🛒').setLabel(translate(locale, 'buttons.draw')).setStyle(ButtonStyle.Secondary)
];

export const unoButtons = (locale: Locale) => [
	new ButtonBuilder().setCustomId('collector;uno').setEmoji({ id: '1002561065399373944' }).setLabel('Uno!').setStyle(ButtonStyle.Primary),
	new ButtonBuilder().setCustomId('collector;report').setEmoji('🚨').setLabel(translate(locale, 'game.report')).setStyle(ButtonStyle.Danger)
];

export const playerCardsPayload = (locale: Locale, cards: Card[], lastCard: Card) => {
	const compatibleCards = cards
		.filter((card) => card.isCompatibleTo(lastCard))
		.map((card, index) => ({ label: card.toString(locale), value: `${index}:${card.id}` }));

	return {
		ephemeral: true,
		embeds: [
			new EmbedBuilder()
				.setColor(Colors.Blurple)
				.setDescription(cards.map((card) => card.toString(locale)).join('\n'))
				.setFooter({ text: translate(locale, 'game.embeds.cards.footer', cards.length) })
		],
		components: [
			new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([
				new StringSelectMenuBuilder()
					.setCustomId('play')
					.setMaxValues(1)
					.setMinValues(1)
					.setOptions(
						compatibleCards.length
							? compatibleCards
							: [
									{
										label: translate(locale, 'select_menus.draw.label'),
										description: translate(locale, 'select_menus.draw.description'),
										value: '0:draw'
									}
							  ]
					)
					.setPlaceholder(translate(locale, 'select_menus.select_your_card'))
			])
		]
	};
};

export function shuffleArray(arr: any[]) {
	for (var i = arr.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
}

export function hasEveryPermission(channel: GuildBasedChannel, ...permissionsToCompare: PermissionsString[]) {
	const permissions = channel.permissionsFor(container.client.guilds.cache.get(channel.guildId)!.members.me!);
	return permissionsToCompare.every((permission) => permissions.has(permission));
}
