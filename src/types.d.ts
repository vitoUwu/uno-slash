import type {
  APIApplicationCommand,
  Collection,
  GuildMember,
  Locale,
  MessageOptions,
} from "discord.js";
import portuguese from "./locales/portuguese.js";
import cards from "./utils/cards.js";

export type GameObject = {
  id: string;
  channelId: string;
  guildId: string;
  queueMessageId: string;
  players: Collection<string, Player>;
  index: number;
  hostId: string;
  lastCardId: string;
  status: "onqueue" | "started" | "ended";
  stackedCombo: number;
  messages: { key: DottedLanguageObjectStringPaths; variables: string[] }[];
  winners: Player[];
  createdAt: Date;
  timeout: NodeJS.Timeout;
  nextPlayer: () => Player;
  actualPlayer: () => Player;
  addPlayer: (member: GuildMember, locale: Locale) => void;
  removePlayer: (playerId: string) => void;
  addIndex: () => void;
  makePayload: () => MessageOptions;
  updateQueueMessage: () => void;
  reversePlayers: () => void;
};

export type Player = {
  id: string;
  cards: string[];
  inactiveRounds: number;
  locale: Locale;
  username: string;
  addCards: (amount: Number) => void;
};

export type Card = {
  id: (typeof cards)[number];
  type: "special" | "normal";
  number: string;
  color: "r" | "b" | "g" | "y";
  emoji: "🟥" | "🟦" | "🟩" | "🟨" | "🔲";
  toString: () => string;
};

export type Command = Omit<
  APIApplicationCommand,
  "application_id" | "guild_id" | "id" | "version"
> & {
  cooldown: number;
  devOnly: boolean;
};

type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}${D}${Join<Extract<R, string[]>, D>}`
    : never
  : string;

type DottedLanguageObjectStringPaths = Join<
  PathsToStringProps<typeof portuguese>,
  "."
>;
