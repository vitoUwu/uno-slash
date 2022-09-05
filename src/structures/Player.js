const {
	CommandInteraction,
	GuildMember,
	Locale,
	ChatInputCommandInteraction,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
} = require("discord.js");
const Game = require("./Game");
const { error } = require("../utils/embeds");
const locales = require("../locales");

module.exports = class Player {
	/**
	 *
	 * @param {GuildMember} member
	 * @param {string} gameId
	 * @param {Locale} locale
	 */
	constructor(member, gameId, locale) {
		/**
		 * @type {string}
		 */
		this.id = member.id;
		/**
		 * @type {GuildMember}
		 */
		this.member = member;
		/**
		 * @type {string}
		 */
		this.gameId = gameId;
		/**
		 * @type {string}
		 */
		this.locale = locale;
		/**
		 * @type {string[]}
		 */
		this.cards = [];
		/**
		 * @type {number}
		 */
		this.skippedRounds = 0;
	}

	/**
	 *
	 * @param {import("./Game").Card} lastCard
	 * @param {import("./Game").Card} card
	 * @returns {boolean}
	 */
	compatibleColor(lastCard, card) {
		if (lastCard.type === "special" || card.type === "special") return true;
		if (lastCard.color === card.color) return true;
		return false;
	}

	/**
	 *
	 * @param {import("./Game").Card} lastCard
	 * @param {import("./Game").Card} card
	 * @returns {boolean}
	 */
	compatibleNumber(lastCard, card) {
		if (lastCard.type === "special" || card.type === "special") return true;
		if (lastCard.number === "any" && lastCard.color === card.color) return true;
		if (lastCard.number === card.number) return true;
		return false;
	}

	/**
	 *
	 * @param {string} id
	 * @param {CommandInteraction} interaction
	 * @returns
	 */
	async playCard(id, interaction) {
		const game = interaction.client.games.get(this.gameId);
		if (!game.started) return await interaction.reply({ embeds: [error(locales(interaction.locale, "player.notStarted"))] });

		interaction.client.logger.log(`${interaction.user.tag} played ${id}`);

		if (id === "draw") {
			game.giveCards(this, 1);
			game.message.push({
				key: "commands.draw.bhoughtCard",
				variables: [interaction.user],
			});
			await game.nextPlayer(interaction);
			return;
		}

		const index = this.cards.findIndex((c) => c === id || game.parseCardId(c).toString().toLowerCase() === id.toLowerCase());
		if (index < 0) return await interaction.reply({ embeds: [error(locales(interaction.locale, "player.cardNotFound"))], ephemeral: true });

		const deckCard = this.cards[index];

		const serializedCard = game.parseCardId(deckCard);
		const serializedLastCard = game.parseCardId(game.lastCardId);

		if (!this.compatibleColor(serializedLastCard, serializedCard) && !this.compatibleNumber(serializedLastCard, serializedCard)) {
			await interaction.reply({ embeds: [error(locales(interaction.locale, "player.invalidCard"))], ephemeral: true });
			return;
		}

		this.cards.splice(index, 1);
		if (!this.cards.length) {
			game.pushWinner(this.id);
			game.message.push({
				key: "player.messages.win",
				variables: [interaction.member],
			});
		}

		this.skippedRounds = 0;

		game.lastCardId = deckCard;
		game.lastPlayer = this;

		const cardId = serializedCard.id;
		const cardType = serializedCard.type;
		const cardNumber = serializedCard.number;

		if (cardType === "special") {
			if (!interaction.deferred && !interaction.replied) await interaction.deferReply();
			let color = await this.awaitColor(interaction).catch(() => {});
			if (!color) color = ["r", "b", "g", "y"][Math.floor(Math.random() * 4)];
			game.lastCardId = `${color}any`;
			if (cardNumber === "+4") {
				game.giveCards(game.whoPlaysNext, 4);
				game.message.push({
					key: "player.messages.4wild",
					variables: [interaction.member, game.whoPlaysNext.member, game.whoPlaysNext.cards.length],
				});
				game.pushPlayer();
			} else {
				game.message.push({
					key: "player.messages.wild",
					variables: [interaction.member],
				});
			}
		}

		if (cardNumber === "+2") {
			game.giveCards(game.whoPlaysNext, 2);
			game.lastCardId = cardId;
			game.message.push({
				key: "player.messages.+2",
				variables: [interaction.member, game.whoPlaysNext.member, game.whoPlaysNext.cards.length],
			});
			game.pushPlayer();
		}

		if (cardNumber === "r") {
			game.lastCardId = cardId;
			game.message.push({
				key: "player.messages.reverse",
				variables: [interaction.member],
			});
			game.reverse();
		}

		if (cardNumber === "b") {
			game.lastCardId = cardId;
			game.message.push({
				key: "player.messages.block",
				variables: [interaction.member, game.whoPlaysNext.member],
			});
			game.pushPlayer();
		}

		await game.nextPlayer(interaction, this.cards.length === 1);
		return;
	}

	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<string>}
	 */
	async awaitColor(interaction) {
		return new Promise(async (resolve, reject) => {
			const row = new ActionRowBuilder().setComponents(
				new ButtonBuilder()
					.setCustomId("g")
					.setEmoji({ name: "🟩" })
					.setLabel(locales(interaction.locale, "game.cards.green"))
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId("b")
					.setEmoji({ name: "🟦" })
					.setLabel(locales(interaction.locale, "game.cards.blue"))
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId("y")
					.setEmoji({ name: "🟨" })
					.setLabel(locales(interaction.locale, "game.cards.yellow"))
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId("r")
					.setEmoji({ name: "🟥" })
					.setLabel(locales(interaction.locale, "game.cards.red"))
					.setStyle(ButtonStyle.Primary)
			);
			const reply = await interaction.followUp({
				embeds: [
					{
						description: locales(interaction.locale, "game.chooseColor"),
						color: Colors.Blurple,
					},
				],
				components: [row],
			});
			const collector = reply.createMessageComponentCollector({
				filter: (i) => i.user.id === interaction.user.id,
				time: 10000,
			});

			collector.on("collect", async (i) => {
				collector.stop();
				await i.deferUpdate();
				resolve(i.customId);
			});

			collector.on("end", (_, reason) => {
				if (reason === "time") reject("inactivity");
			});
		});
	}
};
