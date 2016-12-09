const chai = require('chai');

const deduplicateMessages = require('../../src/deduplicateMessages');
const Message = require('../../src/Message');

const roundtripThroughJson = require('./roundtripThroughJson');

describe('deduplicateMessages', () => {
	it('merges messages with the same original, preserving the first occurence', () => {
		chai.assert.deepEqual(
			roundtripThroughJson(deduplicateMessages([
				{ in: 'test1', out: 'test1' },
				{ in: 'test2', out: 'test2', meta: [ { package: 'package-name' } ] },
				{ in: 'test3' },
				{ in: 'test2', out: 'test3', meta: [ { package: 'other-package' } ] }
			].map(Message.fromJSON))),
			[
				{ in: 'test1', out: 'test1' },
				{ in: 'test2', out: 'test2', conflicts: [ 'test3' ], meta: [
					{ package: 'package-name' },
					{ package: 'other-package' }
				] },
				{ in: 'test3' }
			]
		);
	});
});
