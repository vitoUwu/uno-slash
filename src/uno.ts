import { LogLevel, SapphireClient } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';
import { GatewayIntentBits, Partials } from 'discord.js';

const client = new SapphireClient({
	logger: {
		level: LogLevel.Debug
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

main();
