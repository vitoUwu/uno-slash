import { Locale } from 'discord.js';

import english from './english.js';
import portuguese from './portuguese.js';
import russian from './russian.js';

const locales = {
	[Locale.PortugueseBR]: portuguese,
	[Locale.EnglishUS]: english,
	[Locale.Russian]: russian,
};

export function translate(locale: Locale = Locale.EnglishUS, path: TranslationPaths, ...variables: any[]) {
	let object: Object = locales[locale as keyof typeof locales] ?? locales[Locale.EnglishUS];
	let result = path;
	for (const _path of path.split('.')) {
		let temp = object?.[_path as keyof typeof object];

		if (typeof temp === 'string') {
			result = temp;
			break;
		}

		object = temp;
	}

	return result.replace(/{\d}/g, (i) => variables[Number(i.replace(/\D/g, ''))] ?? i) ?? path;
}
