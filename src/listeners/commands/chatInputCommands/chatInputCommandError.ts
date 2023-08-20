import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ChatInputCommandErrorPayload, type UserError } from '@sapphire/framework';
import type { InteractionEditReplyOptions, InteractionReplyOptions, MessagePayload } from 'discord.js';
import { translate } from '../../../lib/locales/index.js';

@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandError })
export class UserEvent extends Listener<typeof Events.ChatInputCommandError> {
	public override async run({ context, identifier, cause, ...error }: UserError, { interaction }: ChatInputCommandErrorPayload) {
		if (identifier !== 'requiresClientPermissionsMissingPermissions') {
			this.container.logger.error(
				`${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} | ${this.location.relative}\n`,
				`Duration: ${((Date.now() - interaction.createdTimestamp) / 1000).toFixed(2)}s\n`,
				'Error: ',
				error,
				'\nInteraction: ',
				interaction,
				'\nCause:',
				cause
			);
		}

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
				return respond({ content: translate(interaction.locale, 'errors.generic', cause ?? 'unknown error'), ephemeral: true });
		}
	}
}
