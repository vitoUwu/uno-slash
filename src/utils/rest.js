import { REST, Routes } from "discord.js";

export const rest = new REST().setToken(process.env.TOKEN);

/**
 *
 * @param {string} channelId
 * @param {import("discord.js").MessageOptions} messageContent
 */
export async function createMessage(channelId, messageContent) {
  return await rest.post(Routes.channelMessages(channelId), {
    body: messageContent,
  });
}
