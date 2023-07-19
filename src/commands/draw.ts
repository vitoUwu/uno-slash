import { ApplyOptions, RequiresClientPermissions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, Colors, EmbedBuilder, Locale } from 'discord.js';
import { translate } from '../lib/locales/index.js';

@ApplyOptions<Command.Options>({
	preconditions: ['RequireCreatedGame', 'RequireParticipating', 'GuildOnly']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: 'draw',
			description: translate(Locale.EnglishUS, 'commands.draw.description'),
			description_localizations: {
				'pt-BR': translate(Locale.PortugueseBR, 'commands.draw.description')
			}
		});
	}

	@RequiresClientPermissions(['EmbedLinks', 'SendMessages', 'ViewChannel'])
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		const game = this.container.games.get(interaction.channelId)!;
		const player = game.players.get(interaction.user.id)!;

		if (game.actualPlayer.id !== interaction.user.id) {
			return await interaction.reply({
				embeds: [
					{
						color: Colors.Red,
						description: translate(interaction.locale, 'errors.not_your_turn')
					}
				],
				ephemeral: true
			});
		}

		game.timeout?.refresh();
		player.addCards(1);
		player.resetInactivity();
		game.messages.push({
			key: 'commands.draw.drew_card',
			variables: [interaction.user]
		});
		game.next();
		interaction
			.reply({
				embeds: [new EmbedBuilder().setColor(Colors.Blurple).setDescription(translate(interaction.locale, 'commands.draw.drew_card'))],
				components: []
			})
			.catch(() => null);
		return await game.updateMessage();
	}
}
