import { RequiresClientPermissions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, Colors, Locale } from 'discord.js';
import { translate } from '../lib/locales/index.js';

export class UerCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: 'help',
			description: translate(Locale.EnglishUS, 'commands.help.description'),
			description_localizations: { 'pt-BR': translate(Locale.PortugueseBR, 'commands.help.description') }
		});
	}

	@RequiresClientPermissions(['EmbedLinks', 'SendMessages'])
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		return await interaction.reply({
			embeds: [
				{
					title: 'Tutorial',
					thumbnail: {
						url: interaction.client.user.displayAvatarURL()
					},
					color: Colors.Blurple,
					fields: [
						{
							name: translate(interaction.locale, 'commands.help.create.title'),
							value: translate(interaction.locale, 'commands.help.create.description'),
							inline: true
						},
						{
							name: translate(interaction.locale, 'commands.help.play.title'),
							value: translate(interaction.locale, 'commands.help.play.description'),
							inline: true
						},
						{
							name: translate(interaction.locale, 'commands.help.draw.title'),
							value: translate(interaction.locale, 'commands.help.draw.description'),
							inline: true
						},
						{
							name: translate(interaction.locale, 'commands.help.leave.title'),
							value: translate(interaction.locale, 'commands.help.leave.description'),
							inline: true
						}
					]
				}
			]
		});
	}
}
