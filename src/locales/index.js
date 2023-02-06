import { Locale } from "discord.js";
import { createRequire } from "node:module";

const _require = createRequire(import.meta.url);
const english = _require("./en-US.json"); // Since the ecmascript cannot import Json "natively"
const portuguese = _require("./pt-BR.json"); // we have to simulate the Commonjs require

const locales = {
  "pt-BR": portuguese,
  "en-US": english,
};

/**
 *
 * @param {Locale} locale
 * @param {string} path
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
