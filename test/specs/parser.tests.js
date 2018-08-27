const chai = require('chai');
const parser = require('../../src/parser');

describe('Parser', () => {
	it('String Lookup', () => {
		const input = 'This is a message.';
		const output = 'This is a message.';
		chai.assert.deepEqual(parser.parse(input), output);
	});

	it('Convert dashes to underscores in select', () => {
		const input = '{TEST, select, contains-dashes{Now with dashes!} other{other}}';
		const output = '{TEST, select, contains_dashes{Now with dashes!} other{other}}';
		chai.assert.deepEqual(parser.parse(input), output);
	});

	it('Does not convert dashes to underscores in strings', () => {
		const input = 'This-is-a-message-with-dashes';
		const output = 'This-is-a-message-with-dashes';
		chai.assert.deepEqual(parser.parse(input), output);
	});

	it('Convert dashes to underscores in arguments', () => {
		const input = 'This is an {argu-ment}';
		const output = 'This is an {argu_ment}';
		chai.assert.deepEqual(parser.parse(input), output);
	});

	it('Does not convert dashes to underscores in plurals', () => {
		const input = 'There { COUNT, plural, =0 {are no-results} one {is-one result} other {are # results}}.';
		const output = 'There { COUNT, plural, =0 {are no-results} one {is-one result} other {are # results}}.';
		chai.assert.deepEqual(parser.parse(input), output);
	});

	it('Complex case', () => {
		const input = 'Unable to save for {HOURS, plural, =0{{MINUTES, plural, =0{} other{#m }}} other{#h {MINUTES}m }}{SECONDS}s';
		const output = 'Unable to save for {HOURS, plural, =0{{MINUTES, plural, =0{} other{#m }}} other{#h {MINUTES}m }}{SECONDS}s';
		chai.assert.deepEqual(parser.parse(input), output);
	});
});
