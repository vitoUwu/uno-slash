import { REST, Routes } from "discord.js";

export const rest = new REST().setToken(process.env.DISCORD_TOKEN);

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

/**
 *
 * @param {string} channelId
 * @param {string} messageId
 * @param {import("discord.js").MessageOptions} messageContent
 */
export async function editMessage(channelId, messageId, messageContent) {
  return await rest.patch(Routes.channelMessage(channelId, messageId), {
    body: messageContent,
  });
}

/**
 *
 * @param {string} channelId
 * @param {string} messageId
 * @returns
 */
export async function deleteMessage(channelId, messageId) {
  return await rest.delete(Routes.channelMessage(channelId, messageId));
}
