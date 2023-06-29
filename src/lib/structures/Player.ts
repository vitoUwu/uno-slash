import type { Locale } from 'discord.js';
import { getCards } from '../utils.js';
import { Card } from './Card.js';

type CreatePlayerDTO = {
	memberId: string;
	username: string;
	locale: Locale;
};

export class Player {
	public id: string;
	public username: string;
	public locale: Locale;

	public inactiveRounds = 0;
	public cards: Card[] = [];

	constructor({ memberId, username, locale }: CreatePlayerDTO) {
		this.id = memberId;
		this.username = username;
		this.locale = locale;
		this.addCards(9);
	}

	public addCards(amount: number) {
		this.cards.push(...getCards(amount).map((id) => new Card(id)));
	}

	public removeCard(id: string) {
		return this.cards.splice(
			this.cards.findIndex((card) => card.id === id),
			1
		);
	}

	get isInactive() {
		return this.inactiveRounds >= 2;
	}

	public findCardById(id: string) {
		return this.cards.find((card) => card.id === id);
	}

	public findCardByName(name: string) {
		return this.cards.find((card) => card.toString(this.locale) === name);
	}
}
