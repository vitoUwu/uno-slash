import { RequiresClientPermissions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, Colors, Locale } from 'discord.js';
import { createRequire } from 'node:module';
import { ppUrl, supportUrl, tosUrl } from '../lib/constants.js';
import { translate } from '../lib/locales/index.js';
import { fetchGamesSize, fetchGuildsSize } from '../lib/utils.js';
const _require = createRequire(import.meta.url);
const packageJson = _require('../../package.json');

export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: 'info',
			description: translate(Locale.EnglishUS, 'commands.about.description'),
			description_localizations: {
				'pt-BR': translate(Locale.PortugueseBR, 'commands.about.description')
			}
		});
	}

	@RequiresClientPermissions(['EmbedLinks', 'SendMessages'])
	public override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const guilds = await fetchGuildsSize();
		const games = await fetchGamesSize();

		return await interaction.reply({
			embeds: [
				{
					color: Colors.Blurple,
					fields: [
						{
							name: translate(interaction.locale, 'commands.about.versions'),
							value: `Discord.js: \`${packageJson.dependencies['discord.js']}\`\nNode.js: \`${process.version}\`\nBot: \`${packageJson.version}\``,
							inline: true
						},
						{
							name: translate(interaction.locale, 'commands.about.servers'),
							value: `${guilds}`,
							inline: true
						},
						{
							name: translate(interaction.locale, 'commands.about.matchs'),
							value: `${games}`,
							inline: true
						},
						{
							name: translate(interaction.locale, 'commands.about.creator'),
							value: `<@504717946124369937> \`o.vitoo (504717946124369937)\``,
							inline: true
						},
						{
							name: 'Contributors',
							value: `RU Translator - <@1058732619648487524> \`drakesweb (1058732619648487524)\``,
							inline: true
						},
						{
							name: translate(interaction.locale, 'commands.about.links'),
							value: `[Uno Slash - Support](${supportUrl})\n[${translate(
								interaction.locale,
								'commands.about.tos'
							)}](${tosUrl})\n[${translate(interaction.locale, 'commands.about.pp')}](${ppUrl})`,
							inline: true
						}
					]
				}
			]
		});
	}
}
