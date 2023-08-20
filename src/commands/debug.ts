import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import type { ChatInputCommandInteraction } from 'discord.js';
import { inspect } from 'node:util';

@ApplyOptions<Command.Options>({
	name: 'debug',
	description: 'debug',
	preconditions: ['OwnerOnly']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			{
				name: this.name,
				description: this.description
			},
			{ guildIds: ['861402544211230720'] }
		);
	}

	public override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const game = this.container.games.get(interaction.channelId);
		if (!game) {
			return await interaction.reply('no game');
		}

		return await interaction.reply({
			files: [
				{
					attachment: Buffer.from(
						`\`\`\`\n${inspect(game, {
							depth: Infinity,
							maxArrayLength: 20,
							breakLength: 62,
							numericSeparator: true
						})}\`\`\``
					),
					name: 'debug.log'
				}
			]
		});
	}
}
