module.exports = function updateMessagesWithTemplate (oldMessages, templateMessages) {
	const oldMessageByOriginal = Object.create(null);
	oldMessages.forEach(message => {
		oldMessageByOriginal[message.original] = message;
	});
	const isUsedByOriginal = Object.create(null);

	const added = [];
	const messages = templateMessages.map(templateMessage => {
		const oldMessage = oldMessageByOriginal[templateMessage.original];
		isUsedByOriginal[templateMessage.original] = true;
		if (!oldMessage || !oldMessage.isLocalized()) {
			added.push(templateMessage);
		}
		return templateMessage.update(oldMessage);
	});
	const removed = oldMessages.filter(message => !isUsedByOriginal[message.original]);

	return { messages, added, removed };
};
