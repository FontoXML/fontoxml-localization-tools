const chai = require('chai');

const Message = require('../../src/Message');
const roundtripThroughJson = require('./roundtripThroughJson');

describe('Message', () => {
	describe('fromSource()', () => {
		it('can be constructed', () => chai.assert.deepEqual(
			roundtripThroughJson(Message.fromSource('original', { package: 'package-name' })),
			{
				in: 'original',
				meta: [
					{ package: 'package-name' }
				]
			}
		));
	});

	describe('fromJSON()', () => {
		it('can be constructed', () => {
			const jsonFormattedMessage = {
				in: 'original',
				out: 'origineel',
				conflicts: [
					'vernieuwend'
				],
				meta: [
					{ package: 'package-name' }
				]
			};
			chai.assert.deepEqual(
				roundtripThroughJson(Message.fromJSON(jsonFormattedMessage)),
				jsonFormattedMessage
			);
		});

		it('throws when passed unparsable strings containing dashes in original', () => {
			const jsonFormattedMessage = {
				in: '{TEST, select, contains-dashes{Now with dashes!} other{other}}',
				out: '{TEST, select, contains_dashes{Nu met streepjes!} other{anders}}',
				meta: [
					{ package: 'package-name' }
				]
			};
			chai.assert.throws(() => Message.fromJSON(jsonFormattedMessage), 'Cannot use dashes (-) in {TEST, select, contains-dashes{Now with dashes!} other{other}}');
		});

		it('throws when passed unparsable strings containing dashes in localized', () => {
			const jsonFormattedMessage = {
				in: '{TEST, select, contains_dashes{With multiple words!} other{other}}',
				out: '{TEST, select, contains-dashes{Met meerdere woorden!} other{anders}}',
				meta: [
					{ package: 'package-name' }
				]
			};
			chai.assert.throws(() => Message.fromJSON(jsonFormattedMessage), 'Cannot use dashes (-) in {TEST, select, contains-dashes{Met meerdere woorden!} other{anders}}');
		});
	});

	describe('isLocalized()', () => {
		it('returns whether the message has a localization set', () => {
			chai.assert(
				!Message.fromJSON({ in: 'test' }).isLocalized(),
				'returns false for a message without localization'
			);
			chai.assert(
				Message.fromJSON({ in: 'test', out: 'test' }).isLocalized(),
				'returns true for a message with localization'
			);
		});
	});

	describe('update()', () => {
		it('creates an updated message when invoked on a template', () => {
			const template = Message.fromSource('test', { package: 'package-name' });
			const oldMessage = Message.fromJSON({ in: 'test', out: 'meep', meta: [ { package: 'other-package' } ] });
			chai.assert.deepEqual(
				roundtripThroughJson(template.update(oldMessage)),
				{
					in: 'test',
					out: 'meep',
					meta: [
						{ package: 'package-name' }
					]
				}
			);
		});

		it('clones the template if no old message is passed', () => {
			const template = Message.fromSource('test', { package: 'package-name' });
			chai.assert.deepEqual(
				roundtripThroughJson(template.update(undefined)),
				{
					in: 'test',
					meta: [
						{ package: 'package-name' }
					]
				}
			);
		});

		it('throws if the messages do not share the same original', () => {
			const template = Message.fromSource('test1', {});
			const oldMessage = Message.fromJSON({ in: 'test2' });
			chai.assert.throws(() => template.update(oldMessage), 'Can only update a message if its original is unchanged.');
		});
	});

	describe('merge()', () => {
		it('detects conflicting localizations', () => {
			const message1 = Message.fromJSON({ in: 'test', out: 'test1' });
			const message2 = Message.fromJSON({ in: 'test', out: 'test2' });
			message1.merge(message2);
			chai.assert.deepEqual(
				roundtripThroughJson(message1),
				{
					in: 'test',
					out: 'test1',
					conflicts: [
						'test2'
					]
				}
			);
		});

		it('merges old conflicts, discarding duplicates', () => {
			const message1 = Message.fromJSON({ in: 'test', conflicts: ['test1', 'test2'] });
			const message2 = Message.fromJSON({ in: 'test', conflicts: ['test2', 'test3'] });
			message1.merge(message2);
			chai.assert.deepEqual(
				roundtripThroughJson(message1),
				{
					in: 'test',
					conflicts: [
						'test1',
						'test2',
						'test3'
					]
				}
			);
		});

		it('merges metadata, discarding duplicates', () => {
			const message1 = Message.fromJSON({ in: 'test', meta: [
				{ package: 'package-name' },
				{ package: 'other-package' }
			] });
			const message2 = Message.fromJSON({ in: 'test', meta: [
				{ package: 'other-package' },
				{ package: 'third-package' }
			] });
			message1.merge(message2);
			chai.assert.deepEqual(
				roundtripThroughJson(message1),
				{
					in: 'test',
					meta: [
						{ package: 'package-name' },
						{ package: 'other-package' },
						{ package: 'third-package' }
					]
				}
			);
		});

		it('throws if the messages do not share the same original', () => {
			const message1 = Message.fromJSON({ in: 'test1' });
			const message2 = Message.fromJSON({ in: 'test2' });
			chai.assert.throws(() => message1.merge(message2), 'Can only merge messages with the same original.');
		});
	});
});
