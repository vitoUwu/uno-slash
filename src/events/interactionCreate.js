import {
  handleAutocomplete,
  handleChatInputCommand,
} from "../handlers/commands.js";
import { getInteractionType } from "../utils/functions.js";

export default {
  name: "interactionCreate",
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   */
  execute: async (interaction) => {
    const interactionType = getInteractionType(interaction);
    switch (interactionType) {
      case "autoComplete": {
        await handleAutocomplete(interaction);
        break;
      }
      case "chatInput": {
        await handleChatInputCommand(interaction);
        break;
      }
      case "button": {
        break;
      }
      default: {
        throw new Error("Unhandled interaction type: ", interactionType);
      }
    }
  },
};
