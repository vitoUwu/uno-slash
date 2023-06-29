import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';
import { Collection, GatewayIntentBits, Partials } from 'discord.js';
import type { Game } from './lib/structures/Game.js';

const client = new SapphireClient({
	logger: {
		level: envParseString('NODE_ENV') === 'production' ? LogLevel.Error : LogLevel.Debug
	},
	intents: [GatewayIntentBits.Guilds],
	partials: [Partials.Channel, Partials.GuildMember]
});

const main = async () => {
	try {
		await client.login(envParseString('DISCORD_TOKEN'));
		client.logger.info(`Logged in as ${client.user!.username}`);
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

container.games = new Collection();

declare module '@sapphire/pieces' {
	interface Container {
		games: Collection<string, Game>;
	}
}

main();
