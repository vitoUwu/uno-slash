import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export default {
  name: "eval",
  description: "evaluate code",
  devOnly: true,
  /**
   *
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  execute: async (interaction) => {
    const modal = new ModalBuilder({
      title: "Eval",
      customId: "eval",
      components: [
        new ActionRowBuilder({
          components: [
            new TextInputBuilder({
              customId: "code",
              label: "Input Code",
              placeholder: "console.log('hello!')",
              required: true,
              style: TextInputStyle.Paragraph,
            }),
          ],
        }),
      ],
    });

    return await interaction.showModal(modal);
  },
};
