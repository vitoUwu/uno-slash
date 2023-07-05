import { Locale } from 'discord.js';

import type { DottedLanguageObjectStringPaths } from '../types.js';
import english from './english.js';
import portuguese from './portuguese.js';

const locales = {
	[Locale.PortugueseBR]: portuguese,
	[Locale.EnglishUS]: english
};

export function translate(locale: Locale = Locale.EnglishUS, path: DottedLanguageObjectStringPaths, ...variables: any[]) {
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
