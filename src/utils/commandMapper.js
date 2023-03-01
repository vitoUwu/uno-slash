import config from "../config.js";

/**
 *
 * @param {import("../types").Command} command
 * @returns
 */
export function commandMapper(command) {
  return {
    description: "no description",
    dm_permission: false,
    guild_id: command.devOnly ? config.servers.test : null,
    ...command,
  };
}
