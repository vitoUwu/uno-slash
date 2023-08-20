import { Precondition } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { translate } from '../lib/locales/index.js';

export class OwnerOnlyPrecondition extends Precondition {
	public override chatInputRun(interaction: CommandInteraction) {
		return interaction.user.id === '504717946124369937' ? this.ok() : this.error({ message: translate(interaction.locale, 'errors.owner_only') });
	}
}
