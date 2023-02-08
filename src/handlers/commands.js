import {
  AutocompleteInteraction,
  ChannelType,
  ChatInputCommandInteraction,
  Collection,
  PermissionsBitField,
} from "discord.js";
import { readdirSync } from "fs";
import { translate } from "../locales/index.js";
import embeds from "../utils/embeds.js";
import { logger } from "../utils/logger.js";

const commands = new Collection();
const cooldowns = new Collection();

export async function loadCommands() {
  const dirs = readdirSync("./src/commands");

  for (const dir of dirs) {
    const { default: command } = await import(`../commands/${dir}`);
    commands.set(command.name, command);
  }
}

export async function deployCommands(client) {
  return await client.application.commands
    .set([...commands.values()])
    .catch((err) => logger.error(err));
}

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export async function handleChatInputCommand(interaction) {
  if (!interaction.inGuild()) {
    return await interaction.reply({
      embeds: [embeds.error(translate(interaction.locale, "noDm"))],
    });
  }

  if (!interaction.channel || interaction.channel.partial) {
    interaction.channel = await interaction.guild.channels
      .fetch(interaction.channelId)
      .catch(() => null);
    if (interaction.channel === null) {
      return;
    }
  }

  if (
    !interaction.channel.viewable ||
    (interaction.channel.type !== ChannelType.GuildText &&
      interaction.channel.type !== ChannelType.GuildVoice &&
      interaction.channel.type !== ChannelType.GuildPublicThread)
  ) {
    return await interaction.reply({
      embeds: [embeds.error(translate(interaction.locale, "cantInteract"))],
    });
  }

  const botPermissions = interaction.channel.permissionsFor(
    interaction.guild.members.me
  );

  if (
    !botPermissions.has(PermissionsBitField.Flags.ViewChannel) ||
    !botPermissions.has(PermissionsBitField.Flags.EmbedLinks) ||
    !botPermissions.has(PermissionsBitField.Flags.SendMessages)
  ) {
    return await interaction.reply({
      embeds: [
        embeds.error(translate(interaction.locale, "missingPermission")),
      ],
    });
  }

  if (!interaction.member || interaction.member.partial) {
    interaction.member = await interaction.guild.members
      .fetch(interaction.user.id)
      .catch(() => null);
    if (interaction.member === null) {
      return;
    }
  }

  const command = commands.get(interaction.commandName);

  if (!command) {
    return await interaction.reply({
      content: embeds.error(translate(interaction.locale, "unknownCommand")),
      ephemeral: true,
    });
  }

  if (cooldowns.has(`${interaction.commandName}-${interaction.user.id}`)) {
    return await interaction.reply({
      embeds: [
        embeds.error(
          translate(
            interaction.locale,
            "commandSpam",
            Math.floor(
              (cooldowns.get(
                `${interaction.commandName}-${interaction.user.id}`
              ) -
                Date.now()) /
                1000
            ).toFixed(1)
          )
        ),
      ],
    });
  }

  cooldowns.set(
    `${interaction.commandName}-${interaction.user.id}`,
    new Date(Date.now() + 5000).getTime()
  );
  setTimeout(
    () => cooldowns.delete(`${interaction.commandName}-${interaction.user.id}`),
    5000
  );

  try {
    await command.execute(interaction);
  } catch (err) {
    logger.error(err);
  }
}

/**
 *
 * @param {AutocompleteInteraction} interaction
 */
export async function handleAutocomplete(interaction) {
  const command = commands.get(interaction.commandName);

  if (!command || !command["executeAutocomplete"]) {
    return;
  }

  try {
    await command.executeAutocomplete(interaction);
  } catch (err) {
    logger.error(err);
  }
}
