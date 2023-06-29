import { RequiresClientPermissions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, Colors, Locale } from 'discord.js';
import { translate } from '../locales/index.js';

export class USerCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: 'ping',
			description: translate(Locale.EnglishUS, 'commands.ping.description'),
			description_localizations: {
				'pt-BR': translate(Locale.PortugueseBR, 'commands.ping.description')
			}
		});
	}

	@RequiresClientPermissions(['SendMessages', 'EmbedLinks'])
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		const reply = await interaction.reply({
			embeds: [{ description: 'Pinging...' }],
			fetchReply: true
		});
		await interaction.editReply({
			embeds: [
				{
					title: `Shard ${interaction.guild.shardId}`,
					description: `
[\`🏓\`] ${translate(interaction.locale, 'commands.ping.latency')}: \`${reply.createdTimestamp - interaction.createdTimestamp}ms\`
[\`📡\`] Websocket: \`${interaction.client.ws.ping}ms\``,
					color: Colors.Blurple
				}
			]
		});
		return;
	}
}
