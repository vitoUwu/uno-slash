// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import { setup } from '@skyra/env-utilities';
import { join } from 'path';
import { inspect } from 'util';
import { srcDir } from './constants.js';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
setup({ path: join(srcDir, '.env') });
inspect.defaultOptions.depth = 1;

declare module '@sapphire/framework' {
	interface Preconditions {
		RequireCreatedGame: never;
		RequireStartedGame: never;
		RequireParticipating: never;
		OwnerOnly: never;
	}
}

declare module '@skyra/env-utilities' {
	interface Env {
		DISCORD_TOKEN: string;
		WEBHOOK_URL: string;
	}
}
