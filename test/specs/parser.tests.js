const chai = require('chai');
const parser = require('../../src/parser');

describe('Parser', () => {
	it('Input parsed successfully "This is a message."', () => {
		const input = 'This is a message.';
		const output = 'Parsed Successfully';
		chai.assert.equal(parser.parse(input), output);
	});

	it('Input parsed successfully "This-is-a-message-with-dashes"', () => {
		const input = 'This-is-a-message-with-dashes';
		const output = 'Parsed Successfully';
		chai.assert.equal(parser.parse(input), output);
	});

	it('Input parsed successfully "This is an {argu-ment}"', () => {
		const input = 'This is an {argu-ment}';
		const output = 'Dashes are not allowed (-)';
		chai.assert.throw(() => parser.parse(input), output);
	});

	it('Throws Error "Dashes are not allowed (-)"', () => {
		const input = '{TEST, select, contains-dashes{Now with dashes!} other{other}}';
		const output = 'Dashes are not allowed (-)';
		chai.assert.throw(() => parser.parse(input), output);
	});
});
