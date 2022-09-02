const { ApplicationCommandType } = require("discord.js");

/**
 *
 * @param {Array} array
 * @returns {Array}
 */
function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

/**
 *
 * @param {any} command
 * @param {ApplicationCommandType} type
 */
function transformCommand(command, type) {
	if (type === ApplicationCommandType.User || type === ApplicationCommandType.Message)
		return {
			name: command.name,
			name_localizations: command.name_localizations,
			default_member_permissions: command.default_member_permissions,
			type: type,
		};
	else
		return {
			name: command.name,
			name_localizations: command.name_localizations,
			description: command.description,
			description_localizations: command.description_localizations,
			options: command.options,
			default_member_permissions: command.default_member_permissions,
			dm_permission: command.dm_permission,
			type: type,
		};
}

module.exports = {
	shuffleArray,
	transformCommand,
};
