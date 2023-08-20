import { Logger as BuiltinLogger, LogLevel, container, type LogMethods } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';
import chalk from 'chalk';
import { Console } from 'console';
import { WebhookClient } from 'discord.js';
import { inspect, type InspectOptions } from 'util';

export interface LoggerOptions {
	level?: LogLevel;
	prefix?: string;
}

export class Logger extends BuiltinLogger {
	public readonly console: Console = new Console(process.stdout, process.stderr);
	public readonly join: string = ' ';
	public readonly depth: number = Infinity;
	public readonly prefix: string;
	private webhook = new WebhookClient({
		url: envParseString('WEBHOOK_URL')
	});

	public constructor(options: LoggerOptions = {}) {
		super(options.level ?? LogLevel.Info);

		this.prefix = options.prefix ?? process.pid.toString();
	}

	public write(level: LogLevel, ...values: readonly unknown[]) {
		if (level < this.level) return;

		const method = this.methods.get(level) ?? 'log';
		const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
		const content = this.preprocess(values, true);

		this.console[method](`${chalk.bgRgb(44, 62, 80).white.bold(` ${timestamp} | ${this.prefix} | `)}${this.levelPrefix(level)} ${content}`);

		if (level >= LogLevel.Error) {
			this.webhook
				.send({
					content: `<@504717946124369937> Error | ${timestamp} | Shard: ${container.client.shard?.ids.join(', ') ?? 'Unknown'}`,
					files: [
						{
							name: 'error.log',
							attachment: Buffer.from(this.preprocess(values))
						}
					]
				})
				.finally(() => {
					if (level >= LogLevel.Fatal) {
						process.kill(0);
					}
				});
		}
	}

	get methods() {
		return Reflect.get(BuiltinLogger, 'levels') as Map<LogLevel, LogMethods>;
	}

	protected preprocess(values: readonly unknown[], colors = false) {
		const inspectOptions: InspectOptions = { colors, depth: this.depth, maxArrayLength: 20 };
		return values.map((value) => (typeof value === 'string' ? value : inspect(value, inspectOptions))).join(this.join);
	}

	protected levelPrefix(level: LogLevel) {
		switch (level) {
			case LogLevel.Debug:
				return chalk.bgRgb(155, 89, 182).white.bold(' DEBUG ');
			case LogLevel.Error:
			case LogLevel.Fatal:
				return chalk.bgRgb(192, 57, 43).white.bold(' ERROR ');
			case LogLevel.Info:
				return chalk.bgRgb(76, 175, 80).white.bold(' INFO ');
			case LogLevel.Warn:
				return chalk.bgRgb(243, 156, 18).white.bold(' WARN ');
			case LogLevel.Trace:
				return chalk.bgRgb(41, 128, 185).white.bold(' TRACE ');
			default:
				return chalk.bgRgb(41, 128, 185).white.bold(' LOG ');
		}
	}
}
