const { Locale } = require("discord.js");

const locales = {
	"pt-BR": require("./pt-BR.json"),
	"en-US": require("./en-US.json"),
};

/**
 *
 * @param {Locale} locale
 * @param {string} key
 * @param  {...string} variables
 * @returns {string}
 */
module.exports = (locale = "en-US", key, ...variables) => {
	const keys = key.split(".");
	let result = locales[locale] || locales["en-US"];
	for (const _key of keys) {
		result = result?.[_key];
	}
	return result?.replace(/{\d}/g, (i) => variables[i.replace(/\D/g, "")] || i) || key;
};
