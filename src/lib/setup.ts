// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-subcommands/register';
import { setup } from '@skyra/env-utilities';
import * as colorette from 'colorette';
import { join } from 'path';
import { inspect } from 'util';
import { srcDir } from './constants.js';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
setup({ path: join(srcDir, '.env') });
inspect.defaultOptions.depth = 1;
colorette.createColors({ useColor: true });

declare module '@sapphire/framework' {
	interface Preconditions {
		RequireCreatedGame: never;
		RequireStartedGame: never;
		RequireParticipating: never;
	}
}

declare module '@skyra/env-utilities' {
	interface Env {
		DISCORD_TOKEN: string;
	}
}
