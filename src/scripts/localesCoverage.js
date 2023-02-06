import { readdirSync, readFileSync } from "node:fs";

console.log("Loading files...");

const lines = [
  "./src/commands",
  "./src/events",
  "./src/handlers",
  "./src/utils",
].flatMap((dir) =>
  readdirSync(dir).flatMap((file) =>
    [
      ...readFileSync(`${dir}/${file}`, { encoding: "utf-8" })
        .replace(/\(\)/g, "")
        .matchAll(
          /(translate\([\w\.\s\n]+,\n?\s+(?:")(?<translatepath>[^"]+))|(game\.messages\.push\(\{\n?\s+?\w+?:?\s?"(?<gamepath>[^"]+))/gim
        ),
    ]
      .flatMap((entry) =>
        Object.values(entry.groups).flatMap((group) => `${file} => ${group}`)
      )
      .filter((string) => !string.includes("undefined"))
  )
);

const translations = {
  portuguese: JSON.parse(readFileSync("./src/locales/pt-BR.json")),
  english: JSON.parse(readFileSync("./src/locales/en-US.json")),
};

const keys = {
  portuguese: [],
  english: [],
};

for (const language in translations) {
  keys[language] = pathsFromObject(translations[language]);
}

/**
 *
 * @param {Object} object
 * @param {string} parentkey
 * @returns {string[]}
 */
function pathsFromObject(object, parentkey) {
  const arr = [];

  for (const [key, value] of Object.entries(object)) {
    const _key = parentkey ? `${parentkey}.${key}` : `${key}`;

    if (typeof value === "string") {
      arr.push(_key);
      continue;
    }

    arr.push(...pathsFromObject(value, _key));
  }

  return arr;
}

const englishUnused = keys.english
  .filter((key) => !lines.some((line) => line.includes(key)))
  .map((key) => ({ "Unused Translations (en-US)": key }));

const englishMissing = lines
  .filter((key) => !keys.english.includes(key.split("=> ")[1]))
  .map((key) => ({ "Missing Translations (en-US)": key }));

const portugueseUnused = keys.portuguese
  .filter((key) => !lines.some((line) => line.includes(key)))
  .map((key) => ({ "Unused Translations (pt-BR)": key }));

const portugueseMissing = lines
  .filter((key) => !keys.portuguese.includes(key.split("=> ")[1]))
  .map((key) => ({ "Missing Translations (pt-BR)": key }));

if (englishUnused.length) {
  console.table(englishUnused);
}
if (englishMissing.length) {
  console.table(englishMissing);
}
if (portugueseUnused.length) {
  console.table(portugueseUnused);
}
if (portugueseMissing.length) {
  console.table(portugueseMissing);
}
