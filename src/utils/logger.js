import { codeBlock, Colors, EmbedBuilder, Routes } from "discord.js";
import { inspect } from "node:util";
import pino from "pino";
import config from "../config.js";
import { rest } from "./rest.js";

export const logger = pino({
  hooks: {
    logMethod(args, method, level) {
      if (level >= 50) {
        const [msg, ..._args] = args;
        rest
          .post(Routes.webhook(config.loggerId, config.loggerToken), {
            body: {
              content: "<@504717946124369937>",
              embeds: [
                new EmbedBuilder()
                  .setTitle(`${msg}`.slice(0, 256) || "Error Occurred")
                  .setDescription(codeBlock(inspect(msg) || _args.join("\n")))
                  .setColor(Colors.Red)
                  .setTimestamp()
                  .toJSON(),
              ],
            },
          })
          .catch(() => null);
      }
      return method.apply(this, args);
    },
  },
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
      {
        target: "pino-pretty",
        options: {
          colorize: false,
          destination: "./logs.log",
        },
      },
    ],
  },
});
