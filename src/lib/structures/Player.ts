import { container } from '@sapphire/framework';
import type { Locale } from 'discord.js';
import { Card } from './Card.js';

type CreatePlayerDTO = {
	channelId: string;
	memberId: string;
	username: string;
	locale: Locale;
};

export class Player {
	public id: string;
	public username: string;
	public locale: Locale;
	public channelId: string;

	public inactiveRounds = 0;
	public cards: Card[] = [];

	constructor({ memberId, username, locale, channelId }: CreatePlayerDTO) {
		this.id = memberId;
		this.username = username;
		this.locale = locale;
		this.channelId = channelId;
		this.addCards(9);
	}

	get isInactive() {
		return this.inactiveRounds >= 2;
	}

	get game() {
		return container.games.get(this.channelId);
	}

	public resetInactivity() {
		this.inactiveRounds = 0;
	}

	public addCards(amount: number) {
		if (!this.game) {
			return;
		}

		this.game.checkDeck(amount);
		this.cards.push(...this.game.deck.splice(0, amount));
	}

	public removeCard(id: string) {
		return this.cards.splice(
			this.cards.findIndex((card) => card.id === id),
			1
		);
	}

	public findCardById(id: string) {
		return this.cards.find((card) => card.id === id);
	}

	public findCardByName(name: string) {
		return this.cards.find((card) => card.toString(this.locale) === name);
	}
}
