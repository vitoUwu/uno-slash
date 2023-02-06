import type {
  Collection,
  GuildMember,
  Locale,
  MessageOptions,
} from "discord.js";
import cards from "./utils/cards.js";

export type GameObject = {
  id: string;
  channelId: string;
  guildId: string;
  players: Collection<string, Player>;
  index: number;
  hostId: string;
  lastCardId: string;
  status: "onqueue" | "started" | "ended";
  stackedCombo: number;
  messages: { key: string; variables: any[] }[];
  winners: Player[];
  timeout: NodeJS.Timeout;
  nextPlayer: () => Player;
  actualPlayer: () => Player;
  addPlayer: (member: GuildMember, locale: Locale) => void;
  removePlayer: (playerId: string) => void;
  addIndex: () => void;
  makePayload: () => MessageOptions;
};

export type Player = {
  id: string;
  cards: string[];
  inactiveRounds: number;
  locale: Locale;
  username: string;
};

export type Card = {
  id: typeof cards[number];
  type: "special" | "normal";
  number: string;
  color: "r" | "b" | "g" | "y";
  emoji: "🟥" | "🟦" | "🟩" | "🟨" | "🔲";
  toString: () => string;
};
