import { ApplicationCommandOptionType } from "discord.js";

export let maintenance = false;

export default {
  name: "maintenance",
  description: "set maintenance mode",
  options: [
    {
      name: "mode",
      description: "maintenance mode",
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
  ],
  devOnly: true,
  /**
   *
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  execute: async (interaction) => {
    const mode = interaction.options.getBoolean("mode");

    maintenance = mode;

    return await interaction.reply({
      content: `Maintenance mode set to ${mode}`,
    });
  },
};
