import { container } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';
import { Collection, ShardingManager } from 'discord.js';
import './lib/setup.js';
import type { Game } from './structures/Game.js';

const manager = new ShardingManager('./dist/uno.js', {
	token: envParseString('DISCORD_TOKEN'),
	totalShards: 'auto'
});

manager.on('shardCreate', (shard) => {
	container.logger.info(`Launched shard ${shard.id}`);
	shard.on('error', (err) => container.logger.error(err));
});

manager.spawn();

container.games = new Collection();

declare module '@sapphire/pieces' {
	interface Container {
		games: Collection<string, Game>;
	}
}

process.on('uncaughtException', (error, origin) => {
	console.error({ error, origin });
	process.kill(0);
});

process.on('unhandledRejection', (error) => {
	console.error(error);
	process.kill(0);
});
