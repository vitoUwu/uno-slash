import { ShardingManager } from "discord.js";
import "dotenv/config";
import { logger } from "./utils/logger.js";

const manager = new ShardingManager("./src/uno.js", {
  token: process.env.DISCORD_TOKEN,
  totalShards: "auto",
});

manager.on("shardCreate", (shard) => logger.info(`Launched shard ${shard.id}`));

manager.spawn();

process.on("unhandledRejection", (error) => {
  logger.error(error);
});

process.on("uncaughtException", (error) => {
  logger.error(error);
  process.exit(1);
});
