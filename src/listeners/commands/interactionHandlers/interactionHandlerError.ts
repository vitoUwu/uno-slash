import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type IInteractionHandlerPayload, type UserError } from '@sapphire/framework';
import { translate } from '../../../lib/locales/index.js';

@ApplyOptions<Listener.Options>({ event: Events.InteractionHandlerError })
export class UserEvent extends Listener<typeof Events.InteractionHandlerError> {
	public override async run({ identifier }: UserError, { interaction }: IInteractionHandlerPayload) {
		if (interaction.isAutocomplete()) {
			return;
		}

		const options = { content: translate(interaction.locale, 'errors.generic', identifier), ephemeral: true };

		if (interaction.deferred || interaction.replied) {
			return interaction.editReply(options);
		}

		return interaction.reply(options);
	}
}
