import { Colors, type Locale } from 'discord.js';
import cards from '../cards.js';
import { translate } from '../locales/index.js';

type CardId = (typeof cards)[number];

export class Card {
	public id: CardId;
	public type: 'special' | 'normal';
	public number: string;
	public color: 'r' | 'b' | 'g' | 'y';
	public emoji: '🟥' | '🟦' | '🟩' | '🟨' | '🔲' | '❓';

	constructor(id: CardId) {
		if (!id.includes('any') && !cards.includes(id)) {
			throw new Error('Invalid card id');
		}

		this.id = id;
		this.type = id.slice(0, 1) === 'w' ? 'special' : 'normal';
		this.number = id.slice(1);
		this.color = id.slice(0, 1) as typeof this.color;
		this.emoji = this.parseEmoji();
	}

	private parseEmoji() {
		return this.type === 'special'
			? '🔲'
			: this.color === 'b'
			? '🟦'
			: this.color === 'g'
			? '🟩'
			: this.color === 'r'
			? '🟥'
			: this.color === 'y'
			? '🟨'
			: '❓';
	}

	private numberTostring(locale: Locale) {
		return !isNaN(parseInt(this.number))
			? this.number
			: this.number === 'b'
			? translate(locale, 'game.cards.block')
			: this.number === 'r'
			? translate(locale, 'game.cards.reverse')
			: this.number === 'any'
			? translate(locale, 'game.cards.any')
			: this.number;
	}

	private colorToString(locale: Locale) {
		return translate(
			locale,
			this.color === 'b'
				? 'game.cards.blue'
				: this.color === 'g'
				? 'game.cards.green'
				: this.color === 'r'
				? 'game.cards.red'
				: this.color === 'y'
				? 'game.cards.yellow'
				: 'game.cards.any'
		);
	}

	public toDecimalColor() {
		return this.color === 'r'
			? Colors.Red
			: this.color === 'b'
			? Colors.Blue
			: this.color === 'g'
			? Colors.Green
			: this.color === 'y'
			? Colors.Yellow
			: Colors.DarkButNotBlack;
	}

	public toString(locale: Locale) {
		return `${this.emoji} ${this.colorToString(locale)} ${this.numberTostring(locale)}`;
	}

	public isCompatibleTo(card: Card) {
		return card.type === 'special' || this.number === card.number || this.color === card.color;
	}
}
