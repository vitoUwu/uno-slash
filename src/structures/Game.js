const {
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	Colors,
	GuildMember,
	CommandInteraction,
	Client,
	Locale,
	MessagePayload,
} = require("discord.js");
const Player = require("./Player");
const { shuffleArray } = require("../utils/functions");
const cards = require("../utils/cards");
const locales = require("../locales");

/**
 * @typedef {"r"|"g"|"b"|"y"} CardColors
 */

/**
 * @typedef {"noPlayers"|"inactivity"} EndGameReasons
 */

/**
 * @typedef Card
 * @property {string} id
 * @property {"normal"|"special"} type
 * @property {string} number
 * @property {CardColors} color
 * @property {function} toString
 */

const CardColorsEnum = {
	Red: "r",
	Green: "g",
	Blue: "b",
	Yellow: "y",
};

module.exports = class Game {
	/**
	 *
	 * @param {string} userId
	 * @param {string} channelId
	 * @param {string} guildId
	 * @param {Client} client
	 */
	constructor(userId, channelId, guildId, client) {
		/**
		 * @type {string}
		 */
		this.authorId = userId;
		/**
		 * @type {string}
		 */
		this.channelId = channelId;
		/**
		 * @type {string}
		 */
		this.guildId = guildId;
		/**
		 * @type {Player[]}
		 */
		this.players = [];
		/**
		 * @type {string}
		 */
		this.lastCardId = undefined;
		/**
		 * @type {boolean}
		 */
		this.started = false;
		/**
		 * @type {number}
		 */
		this.index = 0;
		/**
		 * @type {-1|1}
		 */
		this.direction = 1;
		/**
		 * @type {Player}
		 */
		this.lastPlayer = null;
		/**
		 * @type {NodeJS.Timeout}
		 */
		this.timeout = undefined;
		/**
		 * @type {string[]}
		 */
		this.winners = [];
		/**
		 * @type {string[]}
		 */
		this.message = [];
		/**
		 * @type {CommandInteraction}
		 */
		this.interaction = null;
		/**
		 * @type {Client}
		 */
		this.client = client;
	}

	/**
	 *
	 * @param {string} colorId
	 * @returns {CardColors}
	 */
	parseColor(colorId) {
		return colorId === "red" || colorId === "r"
			? CardColorsEnum.Red
			: colorId === "blue" || colorId === "b"
			? CardColorsEnum.Blue
			: colorId === "green" || colorId === "g"
			? CardColorsEnum.Green
			: colorId === "yellow" || colorId === "y"
			? CardColorsEnum.Yellow
			: null;
	}

	/**
	 *
	 * @param {string} colorId
	 * @returns {string}
	 */
	parseEmoji(colorId) {
		colorId = this.parseColor(colorId);
		return colorId === CardColorsEnum.Red
			? "🟥"
			: colorId === CardColorsEnum.Green
			? "🟩"
			: colorId === CardColorsEnum.Blue
			? "🟦"
			: colorId === CardColorsEnum.Yellow
			? "🟨"
			: "🔲";
	}

	/**
	 *
	 * @param {string} number
	 * @returns {string}
	 */
	numberToString(number) {
		return !isNaN(parseInt(number))
			? number
			: number === "b"
			? locales(this.locale, "game.cards.block")
			: number === "r"
			? locales(this.locale, "game.cards.reverse")
			: number === "any"
			? locales(this.locale, "game.cards.any")
			: number;
	}

	/**
	 *
	 * @param {CardColors} color
	 * @returns {string}
	 */
	colorToString(color) {
		return color === "r"
			? locales(this.locale, "game.cards.red")
			: color === "b"
			? locales(this.locale, "game.cards.blue")
			: color === "g"
			? locales(this.locale, "game.cards.green")
			: locales(this.locale, "game.cards.yellow");
	}

	/**
	 *
	 * @param {string} cardId
	 * @returns {Card}
	 */
	parseCardId(cardId) {
		const id = cardId;
		const type = cardId.slice(0, 1) === "w" ? "special" : "normal";
		const number = cardId.slice(1);
		const color = this.parseColor(cardId.slice(0, 1));
		const emoji = this.parseEmoji(color);
		return {
			id,
			type,
			number,
			color,
			emoji,
			toString: () => `${emoji} ${!color ? locales(this.locale, "game.cards.wild") : this.colorToString(color)} ${this.numberToString(number)}`,
		};
	}

	/**
	 *
	 * @param {number} ranking
	 * @returns {string}
	 */
	getRankingPositionEmoji(ranking) {
		return ranking === 0 ? "🥇" : ranking === 1 ? "🥈" : ranking === 2 ? "🥉" : "🎖️";
	}

	/**
	 *
	 * @param {Player} player
	 * @param {number} amount
	 */
	giveCards(player, amount) {
		const c = [];
		for (let i = 0; i < amount; i++) c.push(cards[(cards.length * Math.random()) | 0]);
		player.cards.push(...c);
	}

	get color() {
		const cardColor = this.parseCardId(this.lastCardId).color;
		return cardColor === CardColorsEnum.Red
			? Colors.Red
			: cardColor === CardColorsEnum.Green
			? Colors.Green
			: cardColor === CardColorsEnum.Blue
			? Colors.Blue
			: cardColor === CardColorsEnum.Yellow
			? Colors.Yellow
			: Colors.Blurple;
	}

	get whoPlaysNow() {
		return this.players[this.index];
	}

	get nextIndex() {
		return this.index + this.direction >= this.players.length
			? 0
			: this.index + this.direction < 0
			? this.players.length - 1
			: (this.index + this.direction) % this.players.length;
	}

	get whoPlaysNext() {
		return this.players[this.nextIndex];
	}

	get guild() {
		return this.client.guilds.cache.get(this.guildId);
	}

	get channel() {
		return this.client.channels.cache.get(this.channelId);
	}

	get locale() {
		return this.whoPlaysNow?.locale || this.guild?.preferredLocale || "en-US";
	}

	/**
	 *
	 * @param {string|MessagePayload|import("discord.js").InteractionReplyOptions} data
	 * @returns
	 */
	async send(data) {
		return this.interaction
			? await this.interaction[this.interaction.deferred || this.interaction.replied ? "followUp" : "reply"](data).catch(() => {
					this.interaction = null;
					this.channel.send(data);
			  })
			: await this.channel.send(data);
	}

	async start() {
		if (this.started) return;
		this.started = true;

		shuffleArray(this.players);

		this.lastCardId = cards[(cards.length * Math.random()) | 0];

		this.players.forEach((player) => this.giveCards(player, 7));

		this.timeout = setTimeout(() => {
			this.giveCards(this.whoPlaysNow, 2);
			this.message.push({
				key: "game.inactivity",
				variables: [this.whoPlaysNow.member, this.whoPlaysNow.cards.length],
			});
			this.whoPlaysNow.skippedRounds++;
			if (this.whoPlaysNow.skippedRounds >= 2) this.removePlayer(this.whoPlaysNow.id);
			else this.nextPlayer();
		}, 60000);
		await this.nextPlayer();
	}

	/**
	 *
	 * @param {EndGameReasons} reason
	 */
	async end(reason) {
		if (reason === "inactivity") {
			await this.send({
				embeds: [
					{
						description: locales(this.locale, "game.embeds.end.descriptions.inactivity"),
						color: Colors.Blurple,
						footer: { text: locales(this.locale, "game.embeds.end.footer") },
					},
				],
			});
		}

		if (reason === "noPlayers") {
			await this.send({
				embeds: [
					{
						description: `${locales(this.locale, "game.embeds.end.descriptions.noPlayers", this.winners[0])}\n\n\`\`\`${this.winners
							.map((w, i) => `[${this.getRankingPositionEmoji(i)}] #${i + 1} | ${w}`)
							.join("\n")}\`\`\``,
						color: Colors.Blurple,
						footer: { text: locales(this.locale, "game.embeds.end.footer") },
					},
				],
			});
		}

		this.client.games.delete(this.channelId);
		clearTimeout(this.timeout);
	}

	/**
	 *
	 * @param {string} id
	 */
	pushWinner(id) {
		const index = this.players.findIndex((p) => p?.id === id);
		if (index < 0) return;
		this.winners.push(...this.players.splice(index, 1).map((p) => p.member.user.username));
	}

	pushPlayer() {
		this.index = this.nextIndex;
	}

	reverse() {
		this.direction = this.direction * -1;
	}

	/**
	 *
	 * @param {CommandInteraction?} interaction
	 * @param {boolean?} uno
	 * @returns
	 */
	async nextPlayer(interaction, uno) {
		if (interaction) this.interaction = interaction;

		if (this.players.length === 1) {
			this.pushWinner(this.players[0].id);
			this.end("noPlayers");
			return;
		}

		const row = new ActionRowBuilder().setComponents([
			new ButtonBuilder().setCustomId("uno").setEmoji({ id: "1002561065399373944" }).setLabel("Uno!").setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId("report_uno").setLabel(locales(this.locale, "game.report")).setStyle(ButtonStyle.Danger).setDisabled(true),
		]);

		this.pushPlayer();

		this.timeout.refresh();

		const reply = await this.send({
			content: this.whoPlaysNow?.member.toString(),
			embeds: [
				{
					description: `${this.message.length ? `${this.message.map((msg) => locales(this.locale, msg.key, ...msg.variables))}\n\n` : ""}${locales(
						this.locale,
						"game.embeds.resume.description",
						this.whoPlaysNow.member,
						this.parseCardId(this.lastCardId).toString()
					)}\n\n**${locales(this.locale, "game.cards.cards")}**\n\`\`\`\n${this.players
						.slice(0)
						.sort((a, b) => a.cards.length - b.cards.length)
						.map(
							(player, index) => `#${index + 1} | ${player.member.user.username}: ${player.cards.length} ${locales(this.locale, "game.cards.cards")}`
						)
						.join("\n")}\`\`\``,
					color: this.color,
					footer: { text: locales(this.locale, "game.embeds.resume.footer") },
				},
			],
			...(uno ? { components: [row] } : {}),
			fetchReply: uno,
		});

		if (uno) {
			setTimeout(() => {
				const _row = ActionRowBuilder.from(row);
				_row.components[1].data.disabled = false;
				reply.edit({ components: [_row] });
			}, 500);

			const collector = reply.createMessageComponentCollector({ time: 5000 });

			collector.on("collect", async (i) => {
				if (i.customId === "uno" && i.user.id === this.lastPlayer.id) {
					collector.stop();
					await reply.edit({ components: [] });
				}
				if (i.customId === "report_uno" && i.user.id !== this.lastPlayer.id) {
					collector.stop();
					await reply.edit({ components: [] });
					this.giveCards(this.lastPlayer, 2);
					this.channel.send({
						embeds: [
							{
								description: locales(this.locale, "game.unoReport", this.lastPlayer.member),
								color: Colors.Blurple,
							},
						],
					});
				}
			});

			collector.on("end", async (_, reason) => {
				if (reason === "time") {
					await reply.edit({ components: [] });
					this.giveCards(this.lastPlayer, 2);
					this.channel.send({
						embeds: [
							{
								description: locales(this.locale, "game.unoReport", this.lastPlayer.member),
								color: Colors.Blurple,
							},
						],
					});
				}
			});
		}
		this.message = [];
		return;
	}

	/**
	 *
	 * @param {GuildMember} member
	 * @param {Locale} locale
	 */
	addPlayer(member, locale = "en-US") {
		this.players.push(new Player(member, this.channelId, locale));
	}

	/**
	 *
	 * @param {string} id
	 * @returns {Player|undefined}
	 */
	getPlayer(id) {
		return this.players.find((p) => p.id === id);
	}

	/**
	 *
	 * @param {string} id
	 */
	async removePlayer(id) {
		const index = this.players.findIndex((p) => p?.id === id);
		if (index < 0) throw Error(`Unknown player id ${id}`);

		if (this.started) {
			if (this.players.length === 2) {
				this.players.splice(index, 1);
				this.pushWinner(this.players[0].id);
				this.end("noPlayers");
				return;
			}
			if (this.whoPlaysNow?.id === id) {
				this.players.splice(index, 1);
				await this.nextPlayer();
			}
			return;
		} else {
			if (this.players.length === 1) {
				this.client.games.delete(this.channelId);
				if (this.interaction) await this.interaction.deleteReply().catch(() => {});
				return;
			}

			this.players.splice(index, 1);
			if (this.players.length >= 1 && this.authorId === id) {
				this.authorId = this.players[Math.floor(Math.random() * this.players.length)]?.id;
				this.send({
					content: locales(this.locale, "game.newAuthor", this.authorId),
				});
			}
		}

		return;
	}
};
