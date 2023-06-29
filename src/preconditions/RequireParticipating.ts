import { Precondition } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { translate } from '../locales/index.js';

export class RequirePariticipatingPrecondition extends Precondition {
	public override chatInputRun(interaction: CommandInteraction) {
		const game = this.container.games.get(interaction.channelId);
		if (!game) {
			return this.error({ message: translate(interaction.locale, 'errors.no_matchs_found') });
		}

		return game.players.has(interaction.user.id) ? this.ok() : this.error({ message: translate(interaction.locale, 'errors.not_participating') });
	}
}
