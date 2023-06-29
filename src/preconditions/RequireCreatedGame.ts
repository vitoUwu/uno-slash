import { Precondition } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { translate } from '../lib/locales/index.js';

export class RequireCreatedGamePrecondition extends Precondition {
	public override chatInputRun(interaction: CommandInteraction) {
		return this.container.games.has(interaction.channelId)
			? this.ok()
			: this.error({ message: translate(interaction.locale, 'errors.no_matchs_found') });
	}
}
