import {
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  Locale,
  OAuth2Scopes,
  PermissionsBitField,
} from "discord.js";
import { translate } from "../locales/index.js";

export default {
  name: "invite",
  description: translate(Locale.EnglishUS, "commands.invite.description"),
  description_localizations: {
    "pt-BR": translate(Locale.PortugueseBR, "commands.invite.description"),
  },
  cooldown: 5,
  /**
   *
   * @param {CommandInteraction} interaction
   */
  execute: async (interaction) => {
    const invite = interaction.client.generateInvite({
      permissions: [
        PermissionsBitField.Flags.EmbedLinks,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.SendMessagesInThreads,
        PermissionsBitField.Flags.ViewChannel,
      ],
      scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
    });

    return await interaction.reply({
      embeds: [
        {
          color: 3092790,
          description: translate(
            interaction.locale,
            "commands.invite.embed.description",
            invite
          ),
        },
      ],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              style: ButtonStyle.Link,
              label: translate(
                interaction.locale,
                "commands.invite.button.label"
              ),
              url: invite,
            },
          ],
        },
      ],
    });
  },
};
