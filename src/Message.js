module.exports = class Message {
	constructor (props) {
		this.original = props.original;

		this._metadata = props.metadata ? [props.metadata] : [];
	}

	merge (message) {
		this._metadata = this._metadata.concat(message._metadata);
	}

	toJSON () {
		return {
			original: this.original,
			metadata: this._metadata
		};
	}
};
