import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type IInteractionHandlerPayload, type UserError } from '@sapphire/framework';
import { translate } from '../../../lib/locales/index.js';

@ApplyOptions<Listener.Options>({ event: Events.InteractionHandlerError })
export class UserEvent extends Listener<typeof Events.InteractionHandlerError> {
	public override async run({ cause }: UserError, { interaction, handler }: IInteractionHandlerPayload) {
		this.container.logger.error(interaction, handler.name, cause);

		if (interaction.isAutocomplete()) {
			return;
		}

		// this.container.logger.error(context);
		const options = { content: translate(interaction.locale, 'errors.generic', cause ?? 'unknown error'), ephemeral: true };

		if (interaction.deferred || interaction.replied) {
			return interaction.editReply(options);
		}

		return interaction.reply(options);
	}
}
