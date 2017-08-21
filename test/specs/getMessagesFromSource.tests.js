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

	it('extracts messages from calls to fontoxml-localization/t() in ES6 modules with class properties', () => {
		chai.assert.deepEqual(
			roundtripThroughJson(getMessagesFromSource(`
import t from 'fontoxml-localization/t';

export default class Meep {
	constructor () { this._meep = 'moop'; }
	meep = t("Meep!")
};
			`, 'package-name', 'src/install.js', false)),
			[
				{ in: 'Meep!', meta: expectedMetaWithoutCoords() }
			]
		);
	});

	it('extracts messages from calls to fontoxml-localization/t() in ES6 modules with JSX code', () => {
		chai.assert.deepEqual(
			roundtripThroughJson(getMessagesFromSource(`
import t from 'fontoxml-localization/t';

export default (<Meep>{t('Meep!')}</Meep>);
			`, 'package-name', 'src/install.js', false)),
			[
				{ in: 'Meep!', meta: expectedMetaWithoutCoords() }
			]
		);
	});

	it('extracts messages from calls to fontoxml-localization/t() in ES6 modules with JSX spread code', () => {
		chai.assert.deepEqual(
			roundtripThroughJson(getMessagesFromSource(`
import t from 'fontoxml-localization/t';

export default (<Meep {...[t('Meep!')]}></Meep>);
			`, 'package-name', 'src/install.js', false)),
			[
				{ in: 'Meep!', meta: expectedMetaWithoutCoords() }
			]
		);
	});

	it('extracts messages from calls to fontoxml-localization/t() in ES6 modules with ES6 spread code', () => {
		chai.assert.deepEqual(
			roundtripThroughJson(getMessagesFromSource(`
import t from 'fontoxml-localization/t';

export default function (a, ...b) {
	t('Meep!');
};
			`, 'package-name', 'src/install.js', false)),
			[
				{ in: 'Meep!', meta: expectedMetaWithoutCoords() }
			]
		);
	});

	it('extracts messages from calls to fontoxml-localization/t() using the concat operator', () => {
		chai.assert.deepEqual(
			roundtripThroughJson(getMessagesFromSource(`
import t from 'fontoxml-localization/t';

t(
	"Meep! Let's see what the maximum column width is. Is it here? Here? maybe if we add even more text?" +
		"Meep! We've got it, this is a sane case for using the concat operator ('+')."
);
			`, 'package-name', 'src/install.js', false)),
			[
				{
					in: "Meep! Let's see what the maximum column width is. Is it here? Here? maybe if we add even more text?" +
						"Meep! We've got it, this is a sane case for using the concat operator ('+').",
					meta: expectedMetaWithoutCoords() }
			]
		);
	});

	it('extracts messages from calls to fontoxml-localization/t() using the concat operator with nesting', () => {
		chai.assert.deepEqual(
			roundtripThroughJson(getMessagesFromSource(`
import t from 'fontoxml-localization/t';

t(
	"Meep! Let's see what the maximum column width is. Is it here? Here? maybe if we add even more text? " +
		"Meep! We've got it, this is a sane case for using the concat operator ('+'). " +
		"Let's add some more, for good measure " +
		"More " +
		"More! " +
		"More!! " +
		"More!!! "
);
			`, 'package-name', 'src/install.js', false)),
			[
				{
						in: "Meep! Let's see what the maximum column width is. Is it here? Here? maybe if we add even more text? " +
						"Meep! We've got it, this is a sane case for using the concat operator ('+'). " +
						"Let's add some more, for good measure " +
						"More " +
						"More! " +
						"More!! " +
						"More!!! ",
					meta: expectedMetaWithoutCoords() }
			]
		);
	});

	it('throws when t() is called with something else then a string literal, of a concat of strings: function call', () => {
		chai.assert.throws(() =>
			roundtripThroughJson(getMessagesFromSource(`
import t from 'fontoxml-localization/t';

function x () { return "Meep!"'; }

t(x());
			`, 'package-name', 'src/install.js', false), 'Call to t() with non-literal argument in src/install.js')
		);
	});

	it('throws when t() is called with something else then a string literal, of a concat of strings: numerics', () => {
		chai.assert.throws(() =>
			roundtripThroughJson(getMessagesFromSource(`
import t from 'fontoxml-localization/t';

t(1);
			`, 'package-name', 'src/install.js', false), 'Call to t() with non-literal argument in src/install.js')
		);
	});

	it('throws when t() is called with something else then a string literal, of a concat of strings: var ref', () => {
		chai.assert.throws(() =>
			roundtripThroughJson(getMessagesFromSource(`
import t from 'fontoxml-localization/t';

const x = "Meep!";

t(x);
			`, 'package-name', 'src/install.js', false), 'Call to t() with non-literal argument in src/install.js')
		);
	});
	it('throws when t() is called with a wrong number of arguments: too little', () => {
		chai.assert.throws(() =>
			roundtripThroughJson(getMessagesFromSource(`
import t from 'fontoxml-localization/t';

t();
			`, 'package-name', 'src/install.js', false), 'Call to t() with non-literal argument in src/install.js')
		);
	});
	it('throws when t() is called with a wrong number of arguments: too few', () => {
		chai.assert.throws(() =>
			roundtripThroughJson(getMessagesFromSource(`
import t from 'fontoxml-localization/t';

t();
			`, 'package-name', 'src/install.js', false), 'Call to t() with wrong number of arguments in src/install.js')
		);
	});
	it('throws when t() is called with a wrong number of arguments: too many', () => {
		chai.assert.throws(() =>
			roundtripThroughJson(getMessagesFromSource(`
import t from 'fontoxml-localization/t';

t('~meep~', {}, 1);
			`, 'package-name', 'src/install.js', false), 'Call to t() with wrong number of arguments in src/install.js')
		);
	});
});
