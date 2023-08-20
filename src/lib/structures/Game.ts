import { container } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, Collection, Colors, EmbedBuilder, GuildMember, Locale, TextChannel } from 'discord.js';
import cards from '../cards.js';
import { translate } from '../locales/index.js';
import { defaultButtons, hasEveryPermission, pickRandom, shuffleArray, unoButtons } from '../utils.js';
import { Card } from './Card.js';
import { Player } from './Player.js';

type CreateGameDTO = {
	channelId: string;
	guildId: string;
	hostId: string;
};

export class Game {
	public id: string;
	public channelId: string;
	public guildId: string;
	public hostId: string;
	public timeout: NodeJS.Timeout | undefined;

	public discard: Card[] = [];
	public deck: Card[] = [];
	public messages: { key: TranslationPaths; variables: any[] }[] = [];
	public lastCard: Card;
	public players: Collection<string, Player> = new Collection();
	public createdAt = new Date();
	public winners: Player[] = [];
	public started: boolean = false;
	public stackedCombo = 0;

	private _index = 0;

	constructor({ channelId, guildId, hostId }: CreateGameDTO) {
		this.id = channelId;
		this.channelId = channelId;
		this.guildId = guildId;
		this.hostId = hostId;
		this.lastCard = new Card(pickRandom(cards));
	}

	public next() {
		if (!this.guild || !this.channel || !hasEveryPermission(this.channel, 'ViewChannel', 'SendMessages') || !this.actualPlayer) {
			this.clearAndDelete();
			return;
		}
		this.index += 1;
	}

	private clearAndDelete() {
		clearTimeout(this.timeout);
		container.games.delete(this.id);
	}

	get locale() {
		return this.actualPlayer?.locale ?? Locale.EnglishUS;
	}

	get host() {
		return this.players.get(this.hostId);
	}

	set index(number: number) {
		this._index = number < 0 ? 0 : number % this.players.size;
	}

	get index() {
		return this._index < 0 ? 0 : this._index % this.players.size;
	}

	get channel() {
		return container.client.channels.cache.get(this.channelId) as TextChannel | undefined;
	}

	get guild() {
		return container.client.guilds.cache.get(this.guildId);
	}

	get actualPlayer() {
		const player = this.players.at(this.index);
		if (!player) {
			return this.clearAndDelete();
		}
		return player;
	}

	get nextPlayer() {
		return this.players.at((this.index + 1) % this.players.size);
	}

	public checkDeck(min: number = cards.length / 2): void {
		if (this.deck.length < min) {
			if (this.discard.length) {
				this.deck.push(...this.discard);
				this.discard = [];
				return this.checkDeck(min);
			}

			this.deck.push(...cards.map((id) => new Card(id)));
			shuffleArray(this.deck);
		}

		return;
	}

	public start() {
		this.started = true;
		this.index = Math.floor(Math.random() * this.players.size);
		this.timeout = this.createTimeout();
		for (let i = 0; i < Math.ceil(this.players.size / 2); i++) {
			this.deck.push(...cards.map((id) => new Card(id)));
		}
		shuffleArray(this.deck);
	}

	private createTimeout() {
		return setInterval(() => {
			try {
				if (!this.actualPlayer) {
					return this.clearAndDelete();
				}
				const amount = this.stackedCombo || 2;
				this.actualPlayer.addCards(amount);
				this.actualPlayer.inactiveRounds++;
				this.stackedCombo = 0;
				this.messages.push({
					key: 'game.punished_by_inactivity',
					variables: [`<@${this.actualPlayer.id}>`, this.actualPlayer.cards.length, amount]
				});

				if (this.actualPlayer.isInactive) {
					if (this.channel) {
						this.channel
							.send({
								embeds: [
									{
										description: translate(this.locale, 'game.removed_by_inactivity', `<@${this.actualPlayer.id}>`),
										color: Colors.Blurple
									}
								]
							})
							.catch((err) => container.logger.error(err));
					}
					this.removePlayer(this.actualPlayer.id);

					if (this.players.size <= 1) {
						return;
					}
				}
				this.next();
				this.updateMessage(false).catch((err) => container.logger.error(err));
			} catch (err) {
				container.logger.error('Error: ', err, '\nGame: ', this);
			}
		}, 60000);
	}

	public addPlayer({ id, user }: GuildMember, locale: Locale) {
		this.players.set(id, new Player({ memberId: id, username: user.username, locale, channelId: this.channelId }));
	}

	public async removePlayer(id: string) {
		if (!this.channel || !this.actualPlayer) {
			this.clearAndDelete();
			return;
		}

		if (this.players.size === 2) {
			this.clearAndDelete();
			this.players.delete(id);
			this.winners.push(this.players.first()!);
			this.players.clear();
			this.channel
				.send({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								`${translate(
									this.winners[0].locale,
									'game.embeds.end.descriptions.no_more_players',
									`<@${this.winners[0].id}>`
								)}\n\n\`\`\`${this.winners
									.map(
										(winner, index) =>
											`[${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎖'}] #${index + 1} | ${
												winner.username
											}`
									)
									.join('\n')}\`\`\``
							)
							.setColor(Colors.Blurple)
							.setFooter({
								text: translate(this.winners[0].locale, 'game.embeds.end.footer')
							})
							.toJSON()
					]
				})
				.catch((err) => container.logger.error(err));
			return;
		}

		if (this.players.size > 2 && this.actualPlayer.id === id) {
			this.players.delete(id);
			await this.updateMessage(false).catch((err) => container.logger.error(err));
			return;
		}

		this.players.delete(id);
		return;
	}

	public reversePlayers() {
		const actualPlayerId = this.players.keyAt(this.index)!;
		this.players.reverse();
		this.index = [...this.players.keys()].indexOf(actualPlayerId);
	}

	public async updateMessage(uno: boolean = false) {
		const channel = this.channel;
		if (!channel) {
			this.clearAndDelete();
			return;
		}

		this.checkDeck();
		return await channel.send(this.makePayload(uno));
	}

	private makePayload(uno: boolean) {
		if (!this.actualPlayer) {
			this.clearAndDelete();
			throw new Error('No actualPlayer');
			// container.logger.error(this);
			// return {
			// 	content: 'Unknown error'
			// };
		}
		const locale = this.locale;
		const messages = this.messages.length ? this.messages.map(({ key, variables }) => translate(locale, key, ...variables)).join('\n') : null;
		this.messages = [];
		const components = [new ActionRowBuilder<ButtonBuilder>().setComponents(defaultButtons(this.locale))];
		if (uno) {
			components.push(new ActionRowBuilder<ButtonBuilder>().setComponents(unoButtons(this.locale)));
		}
		return {
			content: `<@${this.actualPlayer.id}>`,
			embeds: [
				{
					description: `${messages ? `${messages}\n\n` : ''}${translate(
						locale,
						'game.embeds.resume.description',
						`<@${this.actualPlayer.id}>`,
						this.lastCard.toString(locale)
					)}\n\n**${translate(locale, 'game.cards.cards')}**\n\`\`\`\n${[
						...this.players
							.clone()
							.sort((a, b) => a.cards.length - b.cards.length)
							.values()
					]
						.map((player, index) => `#${index + 1} | ${player.username}: ${player.cards.length} ${translate(locale, 'game.cards.cards')}`)
						.join('\n')}\`\`\``,
					color: this.lastCard.toDecimalColor(),
					footer: {
						text: translate(locale, 'game.embeds.resume.footer')
					}
				}
			],
			components
		};
	}
}
