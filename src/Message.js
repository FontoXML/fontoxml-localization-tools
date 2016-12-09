function adaptMetadata (meta) {
	if (!meta) {
		return [];
	}

	if (!Array.isArray(meta)) {
		return [meta];
	}

	return meta;
}

function shallowEqual (obj1, obj2) {
	const keys1 = Object.keys(obj1);
	if (keys1.length !== Object.keys(obj2).length) {
		return false;
	}

	return keys1.every(key => obj1[key] === obj2[key]);
}

function mergeMetadata (meta1, meta2) {
	return meta1.concat(meta2.filter(m => !meta1.some(m1 => shallowEqual(m1, m))));
}

function mergeConflicts (conflicts1, conflicts2) {
	return conflicts1.concat(conflicts2.filter(c => !conflicts1.includes(c)));
}

module.exports = class Message {
	constructor (props) {
		this.original = props.original;

		this._localized = props.localized;
		this._conflicts = props.conflicts || [];
		this._metadata = adaptMetadata(props.metadata);
	}

	static fromSource (original, metadata) {
		return new Message({
			original,
			metadata
		});
	}

	static fromJSON (msg) {
		return new Message({
			original: msg.in,
			localized: msg.out,
			conflicts: msg.conflicts,
			metadata: msg.meta
		});
	}

	toJSON () {
		return {
			in: this.original,
			out: this._localized,
			conflicts: this._conflicts.length ? this._conflicts : undefined,
			meta: this._metadata.length ? this._metadata : undefined
		};
	}

	isLocalized () {
		return !!this._localized;
	}

	update (oldMessage) {
		if (oldMessage && this.original !== oldMessage.original) {
			throw new Error('Can only update a message if its original is unchanged.');
		}

		return new Message({
			original: this.original,
			// Preserve localization and conflicts
			localized: oldMessage && oldMessage._localized,
			conflicts: oldMessage && oldMessage._conflicts,
			// Overwrite metadata with data from template
			metadata: this._metadata
		});
	}

	merge (message) {
		if (this.original !== message.original) {
			throw new Error('Can only merge messages with the same original.');
		}

		const conflicts = mergeConflicts(this._conflicts, message._conflicts);
		if (this._localized !== undefined &&
			message._localized !== undefined &&
			this._localized !== message._localized &&
			!conflicts.includes(message._localized)
		) {
			conflicts.push(message._localized);
		}
		this._conflicts = conflicts;

		this._metadata = mergeMetadata(this._metadata, message._metadata);
	}
};
