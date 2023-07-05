import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, Option } from '@sapphire/framework';
import { Colors, type Awaitable, type ButtonInteraction } from 'discord.js';
import { translate } from '../../lib/locales/index.js';
import { playerCardsPayload } from '../../lib/utils.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ShowCardsButton extends InteractionHandler {
	public override parse(interaction: ButtonInteraction): Awaitable<Option<unknown>> {
		if (interaction.customId !== 'view_cards') {
			return this.none();
		}

		return this.some();
	}

	public async run(interaction: ButtonInteraction) {
		const game = this.container.games.get(interaction.channelId);
		if (!game) {
			return;
		}
		const player = game.players.get(interaction.user.id);
		if (!player) {
			return await interaction.reply({
				embeds: [
					{
						color: Colors.Red,
						description: translate(interaction.locale, 'errors.not_participating')
					}
				],
				ephemeral: true
			});
		}

		await interaction.reply(playerCardsPayload(interaction.locale, player.cards, game.lastCard));
		return;
	}
}
