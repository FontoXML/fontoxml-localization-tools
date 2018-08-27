const parser = require('./parser');

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
	/**
	 * @param  {Object}           props
	 * @param  {string}           props.original
	 * @param  {string}           [props.localized]
	 * @param  {string[]}         [props.conflicts]
	 * @param  {Object|Object[]}  [props.metadata]
	 */
	constructor (props) {
		if (props.original !== parser.parse(props.original)) {
			throw new Error('Cannot use dashes (-) in ' + props.original);
		}
		this.original = props.original;

		if (props.localized) {
			if (props.localized !== parser.parse(props.localized)) {
				throw new Error('Cannot use dashes (-) in ' + props.localized);
			}
			this._localized = props.localized;
		}
		this._conflicts = props.conflicts || [];
		this._metadata = adaptMetadata(props.metadata);
	}

	/**
	 * @param  {string}  original
	 * @param  {Object}  metadata
	 *
	 * @return  {Message}
	 */
	static fromSource (original, metadata) {
		return new Message({
			original,
			metadata
		});
	}

	/**
	 * @param  {Object}    msg
	 * @param  {string}    msg.in
	 * @param  {string}    [msg.out]
	 * @param  {string[]}  [msg.conflicts]
	 * @param  {Object[]}  [msg.meta]
	 *
	 * @return  {Message}
	 */
	static fromJSON (msg) {
		return new Message({
			original: msg.in,
			localized: msg.out,
			conflicts: msg.conflicts,
			metadata: msg.meta
		});
	}

	/**
	 * @return  {Object}  message in JSON format (see fromJson)
	 */
	toJSON () {
		return {
			in: this.original,
			out: this._localized,
			conflicts: this._conflicts.length ? this._conflicts : undefined,
			meta: this._metadata.length ? this._metadata : undefined
		};
	}

	/**
	 * @return  {boolean}
	 */
	isLocalized () {
		return !!this._localized;
	}

	/**
	 * @param  {Message}  oldMessage
	 *
	 * @return  {Message} new message with updated metadata from this template
	 */
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

	/**
	 * @param  {Message}  message
	 */
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
