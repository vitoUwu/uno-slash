import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { fetchGuildsSize } from '../lib/utils.js';

@ApplyOptions<Listener.Options>({ event: 'allShardsReady', once: true })
export class UserEvent extends Listener {
	public async run() {
		await this.updateActivity().catch(this.container.logger.error);
		setTimeout(async () => await this.updateActivity().catch(this.container.logger.error), 10000);
	}

	private async updateActivity() {
		const guilds = await fetchGuildsSize();
		this.container.client.user?.setActivity({ name: `on ${guilds} Servers | Shard ${this.container.client.shard?.ids.join(' ') ?? 0}` });
	}
}
