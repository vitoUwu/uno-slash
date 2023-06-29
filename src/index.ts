import { envParseString } from '@skyra/env-utilities';
import { ShardingManager } from 'discord.js';
import './lib/setup.js';

const manager = new ShardingManager('./dist/uno.js', {
	token: envParseString('DISCORD_TOKEN'),
	totalShards: 'auto'
});

manager.on('shardCreate', (shard) => {
	console.log(`[INFO] Launched shard ${shard.id}`);
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
