import { Precondition } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { translate } from '../lib/locales/index.js';

export class RequirePariticipatingPrecondition extends Precondition {
	public override chatInputRun(interaction: CommandInteraction) {
		const game = this.container.games.get(interaction.channelId);
		if (!game || !game.actualPlayer) {
			if (game) {
				clearTimeout(game.timeout);
				this.container.games.delete(game.id);
			}
			return this.error({ message: translate(interaction.locale, 'errors.no_matchs_found') });
		}

		return game.players.has(interaction.user.id) ? this.ok() : this.error({ message: translate(interaction.locale, 'errors.not_participating') });
	}
}
