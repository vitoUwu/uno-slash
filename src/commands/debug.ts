import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import type { ChatInputCommandInteraction } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'debug',
	description: 'debug'
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

	public override async chatInputRun(interaction: ChatInputCommandInteraction) {}
}
