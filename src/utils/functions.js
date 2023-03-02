import axios from "axios";
import { ApplicationCommandType, Locale } from "discord.js";
import { translate } from "../locales/index.js";
import cards from "./cards.js";
import { logger } from "./logger.js";

export function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

export function transformCommand(command, type) {
  if (
    type === ApplicationCommandType.User ||
    type === ApplicationCommandType.Message
  )
    return {
      name: command.name,
      name_localizations: command.name_localizations,
      default_member_permissions: command.default_member_permissions,
      type: type,
    };
  else
    return {
      name: command.name,
      name_localizations: command.name_localizations,
      description: command.description,
      description_localizations: command.description_localizations,
      options: command.options,
      default_member_permissions: command.default_member_permissions,
      dm_permission: command.dm_permission,
      type: type,
    };
}

export async function postStatus(guildCount, clientId) {
  const topggToken = process.env.TOPGG_TOKEN;
  const dbggToken = process.env.DBGG_TOKEN;
  const dblToken = process.env.DBL_TOKEN;

  try {
    if (topggToken) {
      await axios.post(
        `https://top.gg/api/bots/${clientId}/stats`,
        {
          server_count: guildCount,
        },
        {
          headers: { Authorization: topggToken },
        }
      );
    }
    if (dbggToken) {
      await axios.post(
        `https://discord.bots.gg/api/v1/bots/${clientId}/stats`,
        {
          guildCount: guildCount,
        },
        {
          headers: { Authorization: dbggToken },
        }
      );
    }
    if (dblToken) {
      await axios.post(
        `https://discordbotlist.com/api/v1/bots/${clientId}/stats`,
        {
          guildCount,
        },
        {
          headers: { Authorization: dblToken },
        }
      );
    }
  } catch (err) {
    logger.error(err);
  }
}

/**
 *
 * @param {import("discord.js").Interaction} interaction
 */
export function getInteractionType(interaction) {
  return interaction.isAutocomplete()
    ? "autoComplete"
    : interaction.isButton()
    ? "button"
    : interaction.isChatInputCommand()
    ? "chatInput"
    : interaction.isMessageContextMenuCommand()
    ? "messageContext"
    : interaction.isModalSubmit()
    ? "modal"
    : interaction.isSelectMenu()
    ? "selectMenu"
    : interaction.isUserContextMenuCommand()
    ? "userContext"
    : "unknownInteractionType";
}

export function getCards(amount) {
  const c = [];
  for (let i = 0; i < amount; i++) {
    c.push(cards[Math.floor(Math.random() * cards.length)]);
  }
  return c;
}

/**
 *
 * @param {"r"|"g"|"b"|"y"} colorId
 * @returns {string}
 */
export function parseEmoji(colorId) {
  return colorId === "r"
    ? "🟥"
    : colorId === "g"
    ? "🟩"
    : colorId === "b"
    ? "🟦"
    : colorId === "y"
    ? "🟨"
    : "🔲";
}

/**
 *
 * @param {string} number
 * @param {Locale} locale
 * @returns {string}
 */
export function numberToString(number, locale) {
  return !isNaN(parseInt(number))
    ? number
    : number === "b"
    ? translate(locale, "game.cards.block")
    : number === "r"
    ? translate(locale, "game.cards.reverse")
    : number === "any"
    ? translate(locale, "game.cards.any")
    : number;
}

/**
 *
 * @param {CardColors} color
 * @param {Locale} locale
 * @returns {string}
 */
export function colorToString(color, locale) {
  return color === "r"
    ? translate(locale, "game.cards.red")
    : color === "b"
    ? translate(locale, "game.cards.blue")
    : color === "g"
    ? translate(locale, "game.cards.green")
    : color === "y"
    ? translate(locale, "game.cards.yellow")
    : color === "w"
    ? translate(locale, "game.cards.wild")
    : "";
}

/**
 *
 * @param {string} cardId
 * @param {Locale} locale
 * @returns {import("../types").Card}
 */
export function parseCardId(cardId, locale) {
  const id = cardId;
  const type = cardId.slice(0, 1) === "w" ? "special" : "normal";
  const number = cardId.slice(1);
  const color = cardId.slice(0, 1);
  const emoji = parseEmoji(color);
  return {
    id,
    type,
    number,
    color,
    emoji,
    toString: () =>
      `${emoji} ${colorToString(color, locale)} ${numberToString(
        number,
        locale
      )}`,
  };
}

/**
 *
 * @param {import("../types").Card} lastCard
 * @param {import("../types").Card} card
 * @returns {boolean}
 */
export function compatibleColor(lastCard, card) {
  if (lastCard.type === "special" || card.type === "special") return true;
  if (lastCard.color === card.color) return true;
  return false;
}

/**
 *
 * @param {import("../types").Card} lastCard
 * @param {import("../types").Card} card
 * @returns {boolean}
 */
export function compatibleNumber(lastCard, card) {
  if (lastCard.type === "special" || card.type === "special") return true;
  if (lastCard.number === "any" && lastCard.color === card.color) return true;
  if (lastCard.number === card.number) return true;
  return false;
}

/**
 *
 * @param {number} index
 * @returns {string}
 */
export function getRankingPositionEmoji(index) {
  switch (index) {
    case 0:
      return "🏅";
    case 1:
      return "🥈";
    case 2:
      return "🥉";
    default:
      return "🎖️";
  }
}
