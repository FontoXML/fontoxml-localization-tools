/**
 * @param  {Message[]}  messages
 *
 * @return  {Message[]}  messages with duplicates merged
 */
module.exports = function deduplicateMessages (messages) {
	const byOriginal = Object.create(null);
	return messages.reduce((deduped, msg) => {
		var other = byOriginal[msg.original];
		if (other) {
			other.merge(msg);
			return deduped;
		}

		byOriginal[msg.original] = msg;
		return deduped.concat([msg]);
	}, []);
};
