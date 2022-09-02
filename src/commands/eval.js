const { EmbedBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction } = require("discord.js");

module.exports = {
	name: "eval",
	description: "eval command",
	options: [
		{
			name: "code",
			description: "code",
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	ownerOnly: true,
	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async slashExecute(interaction) {
		let code = interaction.options.getString("code");
		const codeInBlock = /```(?:js)?\s(.+[^\\])```$/is;
		if (codeInBlock.test(code)) code = code.match(codeInBlock)[1];
		code = code.includes("await") ? `async () => {${code}}` : `() => {${code}}`;
		const silent = code.match(/--silent/gim) ? !!(code = code.replace(/--silent/gim, "")) : false;
		const ephemeral = code.match(/--ephemeral/gim) ? !!(code = code.replace(/--ephemeral/gim, "")) : false;
		let output;
		let classe = "void";
		try {
			output = await eval(code)();
		} catch (err) {
			output = {
				method: err.method || null,
				path: err.path || null,
				code: err.code || null,
				httpStatus: err.httpStatus || null,
				name: err.name || null,
				message: err.message || null,
			};
		}
		if (output) classe = output.constructor.name;
		const type = typeof output;
		if (type !== "string") output = require("util").inspect(output);
		if (silent) return;
		output = `${output}`.length > 0 ? `${output}`.slice(0, 1800) : "void";
		const embed = new EmbedBuilder().setDescription(`**Output**\n\`\`\`js\n${output}\n\`\`\``).addFields([
			{ name: "Class", value: `\`\`\`yml\n${classe}\`\`\``, inline: true },
			{ name: "Type", value: `\`\`\`ts\n${type}\`\`\``, inline: true },
		]);
		interaction.reply({ embeds: [embed], ephemeral });
		return;
	},
};
