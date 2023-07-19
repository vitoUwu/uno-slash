import { ApplyOptions, RequiresClientPermissions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, Colors, Locale } from 'discord.js';
import { translate } from '../lib/locales/index.js';

@ApplyOptions<Command.Options>({
	preconditions: ['RequireParticipating', 'RequireStartedGame', 'GuildOnly']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: 'leave',
			description: translate(Locale.EnglishUS, 'commands.leave.description'),
			description_localizations: {
				'pt-BR': translate(Locale.PortugueseBR, 'commands.leave.description')
			}
		});
	}

	@RequiresClientPermissions(['SendMessages', 'EmbedLinks', 'ViewChannel'])
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		const game = this.container.games.get(interaction.channelId)!;

		await interaction.reply({
			embeds: [
				{
					description: translate(interaction.locale, 'commands.leave.user_left', interaction.user.toString()),
					color: Colors.Blurple
				}
			]
		});

		return await game.removePlayer(interaction.user.id);
	}
}
