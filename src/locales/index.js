import { Locale } from "discord.js";

import english from "./english.js";
import portuguese from "./portuguese.js";

const locales = {
  "pt-BR": portuguese,
  "en-US": english,
};

/**
 *
 * @param {Locale} locale
 * @param {import("../types").DottedLanguageObjectStringPaths} path
 * @param  {...string} variables
 * @returns {string}
 */
export function translate(locale = "en-US", path, ...variables) {
  let result = locales[locale] || locales["en-US"];
  for (const _path of path.split(".")) {
    result = result?.[_path];
  }
  return (
    result?.replace(/{\d}/g, (i) => variables[i.replace(/\D/g, "")] || i) ||
    path
  );
}
