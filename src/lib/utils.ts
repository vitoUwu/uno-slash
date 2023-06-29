import { container } from '@sapphire/framework';
import cards from './cards.js';

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

export function getCards(amount: number) {
	const c = [];
	for (let i = 0; i < amount; i++) {
		c.push(cards[Math.floor(Math.random() * cards.length)]);
	}
	return c;
}
