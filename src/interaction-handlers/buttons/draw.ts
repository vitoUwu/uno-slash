import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, Option } from '@sapphire/framework';
import { Colors, type Awaitable, type ButtonInteraction } from 'discord.js';
import { translate } from '../../lib/locales/index.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class DrawButton extends InteractionHandler {
	public override parse(interaction: ButtonInteraction): Awaitable<Option<unknown>> {
		if (interaction.customId !== 'draw') {
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

		if (game.actualPlayer.id !== player.id) {
			return await interaction.reply({
				embeds: [
					{
						color: Colors.Red,
						description: translate(interaction.locale, 'errors.not_your_turn')
					}
				],
				ephemeral: true
			});
		}

		game.timeout?.refresh();
		player.addCards(1);
		player.resetInactivity();
		game.messages.push({
			key: 'commands.draw.drew_card',
			variables: [interaction.user]
		});
		game.next();
		interaction.deferUpdate().catch(() => null);
		return await game.updateMessage();
	}
}
