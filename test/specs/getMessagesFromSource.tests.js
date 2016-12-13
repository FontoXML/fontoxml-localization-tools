const chai = require('chai');

const getMessagesFromSource = require('../../src/getMessagesFromSource');

const roundtripThroughJson = require('./roundtripThroughJson');

function expectedMeta (line, column) {
	return [ {
		package: 'package-name',
		file: 'src/install.js',
		line,
		column
	} ];
}

function expectedMetaWithoutCoords () {
	return [ {
		package: 'package-name',
		file: 'src/install.js'
	} ];
}

describe('getMessagesFromSource()', () => {
	it('extracts messages from calls to fontoxml-localization/t() in AMD modules', () => {
		chai.assert.deepEqual(
			roundtripThroughJson(getMessagesFromSource(`
define([
	'fontoxml-abc/abc',
	'fontoxml-localization/t'
], function (
	abc,
	t
) {
	'use strict';

	return function meep () {
		return {
			test: t('This is a test'),
			meep: abc({
				t: function (t) {
					return t('This is not localizable');
				},
				s: [ t('One {THING}', { THING: 123 }), t('Two') ]
			})
		};
	};
});
			`, 'package-name', 'src/install.js', true)),
			[
				{ in: 'This is a test', meta: expectedMeta(13, 11) },
				{ in: 'One {THING}', meta: expectedMeta(18, 11) },
				{ in: 'Two', meta: expectedMeta(18, 45) }
			]
		);
	});

	it('extracts messages from calls to fontoxml-localization/t() in ES6 modules', () => {
		chai.assert.deepEqual(
			roundtripThroughJson(getMessagesFromSource(`
import abc from 'fontoxml-abc/abc';
import { xyz } from 'fontoxml-abc/xyz';
import t from 'fontoxml-localization/t';

export default function meep () {
	return {
		test: t('This is a test'),
		meep: abc({
			t: function (t) {
				return t('This is not localizable');
			},
			s: [ t('One {THING}', { THING: 123 }), t('Two') ]
		})
	};
};
			`, 'package-name', 'src/install.js', false)),
			[
				{ in: 'This is a test', meta: expectedMetaWithoutCoords() },
				{ in: 'One {THING}', meta: expectedMetaWithoutCoords() },
				{ in: 'Two', meta: expectedMetaWithoutCoords() }
			]
		);
	});
});
