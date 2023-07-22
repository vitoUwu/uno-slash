import { LogLevel } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';
import { ShardingManager } from 'discord.js';
import { Logger } from './lib/logger/index.js';
import './lib/setup.js';

const logger = new Logger({ level: LogLevel.Info });

const manager = new ShardingManager('./dist/uno.js', {
	token: envParseString('DISCORD_TOKEN'),
	totalShards: 'auto'
});

let spawnedShards = 0;

manager.on('shardCreate', (shard) => {
	spawnedShards++;
	logger.info(`Launched shard ${spawnedShards}/${manager.totalShards}`);

	if (typeof manager.totalShards === 'number' && spawnedShards >= manager.totalShards) {
		shard.once('ready', () => manager.shards.forEach((shard) => shard.eval((client) => client.emit('allShardsReady'))));
	}

	shard.on('error', (err) => logger.error(err));
});

manager.spawn();

process.on('uncaughtException', (error, origin) => {
	logger.error({ error, origin });
	process.kill(0);
});

process.on('unhandledRejection', (error) => {
	logger.error(error);
	process.kill(0);
});
