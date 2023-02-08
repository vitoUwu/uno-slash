import { Colors, EmbedBuilder } from "discord.js";
import { inspect } from "node:util";

/**
 *
 * @param {import("discord.js").ModalSubmitInteraction} interaction
 */
export async function handleModalSubmit(interaction) {
  if (interaction.customId.startsWith("collector")) {
    return;
  }

  switch (interaction.customId) {
    case "eval": {
      const startTime = Date.now();
      const code = `(async () => { try { ${interaction.fields.getTextInputValue(
        "code"
      )} } catch(err) { return err; } })();`;
      const result = inspect(await eval(code), {
        colors: true,
        numericSeparator: true,
      }).replace(new RegExp(process.env.TOKEN, "g"), "[token]");
      console.log("file: modals.js:20 ~ result ~ result", result);
      return await interaction.reply({
        embeds: [
          new EmbedBuilder({
            color: Colors.Blurple,
            description: `\`\`\`ansi\n${result.slice(0, 1800)}\`\`\``,
            footer: { text: `Evaluated in ${Date.now() - startTime}ms` },
          }),
        ],
      });
    }
  }
}
