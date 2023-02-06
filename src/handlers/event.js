import { readdirSync } from "fs";
import { logger } from "../utils/logger.js";

export async function loadAndListenEvents(client) {
  const dirs = readdirSync("./src/events");

  for (const dir of dirs) {
    const { default: event } = await import(`../events/${dir}`);
    client.on(
      event.name,
      async (...args) =>
        await event.execute(...args)?.catch((err) => logger.error(err))
    );
  }
}
