import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ChatInputCommandErrorPayload, type UserError } from '@sapphire/framework';
import type { InteractionEditReplyOptions, InteractionReplyOptions, MessagePayload } from 'discord.js';
import { translate } from '../../../lib/locales/index.js';

@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandError })
export class UserEvent extends Listener<typeof Events.ChatInputCommandError> {
	public override async run({ context, identifier }: UserError, { interaction }: ChatInputCommandErrorPayload) {
		function respond(options: (string | MessagePayload | InteractionReplyOptions) & (string | MessagePayload | InteractionEditReplyOptions)) {
			if (interaction.deferred || interaction.replied) {
				return interaction.editReply(options);
			}

			return interaction.reply(options);
		}

		switch (identifier) {
			case 'requiresClientPermissionsMissingPermissions':
				const missingPermissions = Reflect.get(Object(context), 'missing') as string[];
				return respond({ content: translate(interaction.locale, 'errors.missing_permissions', missingPermissions.join(', ')) });
			default:
				return respond({ content: translate(interaction.locale, 'errors.generic', identifier), ephemeral: true });
		}
	}
}
