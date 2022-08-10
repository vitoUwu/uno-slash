const { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, AutocompleteInteraction } = require("discord.js");
const { error, success } = require("../utils/embeds");
const { transformCommand } = require("../utils/functions");

module.exports = {
  name: "commands",
  description: "command manager",
  cooldown: 0,
  ownerOnly: true,
  options: [
    {
      name: "remove",
      description: "remove a deployed command",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "single",
          description: "remove a deployed command",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "command",
              description: "command name",
              type: ApplicationCommandOptionType.String,
              required: true,
              autocomplete: true,
            },
            {
              name: "type",
              description: "command type",
              type: ApplicationCommandOptionType.Number,
              required: true,
              choices: [
                { name: "Slash", value: ApplicationCommandType.ChatInput },
                { name: "User", value: ApplicationCommandType.User },
                { name: "Message", value: ApplicationCommandType.Message }
              ]
            },
            {
              name: "guild",
              description: "guild id if command is guild only",
              type: ApplicationCommandOptionType.String,
              autocomplete: true,
            }
          ],
        },
        {
          name: "all",
          description: "remove all deployed commands",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "guild",
              description: "guild id if command is guild only",
              type: ApplicationCommandOptionType.String,
              autocomplete: true,
            },
          ],
        },
      ],
    },
    {
      name: "deploy",
      description: "deploy commands",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "single",
          description: "deploy one command",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "command",
              description: "command",
              type: ApplicationCommandOptionType.String,
              required: true,
              autocomplete: true,
            },
            {
              name: "type",
              description: "command type",
              type: ApplicationCommandOptionType.Number,
              required: true,
              choices: [
                { name: "Slash", value: ApplicationCommandType.ChatInput },
                { name: "User", value: ApplicationCommandType.User },
                { name: "Message", value: ApplicationCommandType.Message }
              ]
            },
            {
              name: "guild",
              description: "guild id if command is guild only",
              type: ApplicationCommandOptionType.String,
              required: false,
              autocomplete: true,
            },
          ],
        },
        {
          name: "all",
          description: "deploy all disponible commands",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "guild",
              description: "guild id if command is guild only",
              type: ApplicationCommandOptionType.String,
              required: false,
              autocomplete: true,
            },
          ],
        },
      ],
    },
  ],
  /**
   * 
   * @param {ChatInputCommandInteraction} interaction 
   */
  async slashExecute(interaction) {
    const { options, client } = interaction;

		const subCommandGroup = options.getSubcommandGroup();
		const subCommand = options.getSubcommand();

		if (subCommandGroup === "deploy") {
			if (subCommand === "single") {
				const commandName = options.getString("command");
				const command = client.commands.find((cmd) => cmd.name === commandName);
				if (!command) return interaction.reply({ embeds: [error("Comando não encontrado")] });

				const commandType = options.getNumber("type");

        const guildId = options.getString("guild");
        const guild = client.guilds.cache.get(guildId);
        if (guildId && !guild) return i.editReply({ embeds: [error("Servidor Inválido")] });

        await client.application.commands.create(transformCommand(command, commandType), guild?.id)
          .then(() => interaction.editReply({ embeds: [success("Comando Implementado")] }))
          .catch((err) => {
            interaction.editReply({ embeds: [error(`Ocorreu um erro ao implementar comando\n\`\`\`${err.stack}\`\`\``)] });
            client.logger.error(err);
          });
			} else if (subCommand === "all") {
				const commands = [];
				client.commands.filter(cmd => !cmd.ownerOnly).forEach((cmd) => {
          if (!!cmd.slashExecute) commands.push(transformCommand(cmd, ApplicationCommandType.ChatInput));
          if (!!cmd.userContextExecute) commands.push(transformCommand(cmd, ApplicationCommandType.User));
          if (!!cmd.messageContextExecute) commands.push(transformCommand(cmd, ApplicationCommandType.Message));
        });

				const guildId = options.getString("guild");
				const guild = client.guilds.cache.get(guildId);
				if (guildId && !guild) return interaction.reply({ embeds: [error("Servidor Inválido")] });

				await client.application.commands.set(commands, guild?.id)
					.then(() => interaction.reply({ embeds: [success("Comandos Implementados")] }))
					.catch((err) => {
						interaction.reply({ embeds: [error(`Ocorreu um erro ao implementar comando\n\`\`\`${err.stack}\`\`\``)] });
						client.logger.error(err);
					});
			}
		} else if (subCommandGroup === "remove") {
			if (subCommand === "all") {
				await client.application.commands.set([]);
				await client.application.commands.set([], interaction.guildId);
				interaction.reply({ embeds: [success("Comandos Removidos")] });
				return;
			}
		}
	},
  /**
   * 
   * @param {AutocompleteInteraction} interaction 
   */
	async autocompleteExecute(interaction) {
    const { client, options } = interaction;
		const focused = options.getFocused(true);

		let data = [{ name: "Loading", value: "Loading" }];

		if (focused.name === "command") {
			data = client.commands
				.filter((cmd) => cmd.name.startsWith(focused.value))
				.map((cmd) => ({ name: cmd.name, value: cmd.name }))
				.slice(0, 25);
		} else if (focused.name === "guild") {
			data = client.guilds.cache
				.filter((guild) => guild.name.startsWith(focused.value) || guild.id.startsWith(focused.value))
				.map((guild) => ({ name: guild.name, value: guild.id }))
				.slice(0, 25);
		} else {
			data = [{ name: "Unsupported Autocomplete", value: "Unsupported Autocomplete" }];
		}

		interaction.respond(data);
  }
}