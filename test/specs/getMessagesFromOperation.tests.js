const chai = require('chai');

const getMessagesFromOperation = require('../../src/getMessagesFromOperation');

const roundtripThroughJson = require('./roundtripThroughJson');

describe('getMessagesFromOperation()', () => {
	it('returns messages for all strings with the t__ prefix', () => {
		chai.assert.deepEqual(
			roundtripThroughJson(getMessagesFromOperation({
				name: 'test-operation',
				label: 't__Test operation',
				description: 't__Testing things',
				steps: [
					{
						type: 'action/doStuff',
						data: {
							someData: 't__Translate me',
							array: [ 't__String one', 't__String two' ]
						}
					}
				]
			}, 'package-name', 'src/operations.json')),
			[
				{ in: 'Test operation', meta: [ { package: 'package-name', file: 'src/operations.json' } ] },
				{ in: 'Testing things', meta: [ { package: 'package-name', file: 'src/operations.json' } ] },
				{ in: 'Translate me', meta: [ { package: 'package-name', file: 'src/operations.json' } ] },
				{ in: 'String one', meta: [ { package: 'package-name', file: 'src/operations.json' } ] },
				{ in: 'String two', meta: [ { package: 'package-name', file: 'src/operations.json' } ] }
			]
		);
	});
});
