import { Precondition } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { translate } from '../locales/index.js';

export class RequireStartedGamePrecondition extends Precondition {
	public override chatInputRun(interaction: CommandInteraction) {
		return this.container.games.get(interaction.channelId)?.status === 'started'
			? this.ok()
			: this.error({ message: translate(interaction.locale, 'errors.match_not_started_yet') });
	}
}
