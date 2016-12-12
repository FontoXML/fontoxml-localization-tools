const Message = require('./Message');

const TRANSLATEABLE_STRING_PREFIX = 't__';

module.exports = function getMessagesFromOperation (operation, packageName, fileName) {
	const messages = [];

	(function walk (obj) {
		Object.keys(obj).forEach(function (key) {
			var value = obj[key];
			var valueType = typeof value;

			// Detect magic translateable string marker
			if (valueType === 'string' && value.startsWith(TRANSLATEABLE_STRING_PREFIX)) {
				messages.push(Message.fromSource(
					value.slice(TRANSLATEABLE_STRING_PREFIX.length),
					{
						package: packageName,
						file: fileName
					}
				));
			}

			if (valueType === 'object' && value !== null) {
				walk(value);
			}
		});
	})(operation);

	return messages;
};
