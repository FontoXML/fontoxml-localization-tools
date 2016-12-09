const chai = require('chai');

const updateMessagesWithTemplate = require('../../src/updateMessagesWithTemplate');
const Message = require('../../src/Message');

const roundtripThroughJson = require('./roundtripThroughJson');

describe('updateMessagesWithTemplate', () => {
	it('applies update to matching messages and detects new and removed messages', () => {
		chai.assert.deepEqual(
			roundtripThroughJson(updateMessagesWithTemplate([
				{ in: 'test1', out: 'test1' },
				{ in: 'test2', out: 'test2', meta: [ { package: 'other-package' } ] },
				{ in: 'test3' }
			].map(Message.fromJSON), [
				{ in: 'test1', meta: [ { package: 'package-name' } ] },
				{ in: 'test2', meta: [ { package: 'third-package' } ] },
				{ in: 'test4', meta: [ { package: 'other-package' } ] }
			].map(Message.fromJSON))),
			{
				messages: [
					{ in: 'test1', out: 'test1', meta: [ { package: 'package-name' } ] },
					{ in: 'test2', out: 'test2', meta: [ { package: 'third-package' } ] },
					{ in: 'test4', meta: [ { package: 'other-package' } ] }
				],
				added: [
					{ in: 'test4', meta: [ { package: 'other-package' } ] }
				],
				removed: [
					{ in: 'test3' }
				]
			}
		);
	});
});
