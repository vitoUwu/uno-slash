import { envParseString } from '@skyra/env-utilities';
import { ShardingManager } from 'discord.js';
import './lib/setup.js';

const manager = new ShardingManager('./dist/uno.js', {
	token: envParseString('DISCORD_TOKEN'),
	totalShards: 2
});

let spawnedShards = 0;

manager.on('shardCreate', (shard) => {
	spawnedShards++;
	console.log(`[INFO] Launched shard ${spawnedShards}/${manager.totalShards}`);

	if (typeof manager.totalShards === 'number' && spawnedShards >= manager.totalShards) {
		shard.once('ready', () => manager.shards.forEach((shard) => shard.eval((client) => client.emit('allShardsReady'))));
	}

	shard.on('error', (err) => console.error(err));
});

manager.spawn();

process.on('uncaughtException', (error, origin) => {
	console.error({ error, origin });
	process.kill(0);
});

process.on('unhandledRejection', (error) => {
	console.error(error);
	process.kill(0);
});
