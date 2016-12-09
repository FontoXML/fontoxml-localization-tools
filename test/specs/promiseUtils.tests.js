const chai = require('chai');

const promiseUtils = require('../../src/promiseUtils');

describe('promiseUtils', () => {
	describe('asPromise()', () => {
		it('adapts a node-style function to the promise interface');
	});

	describe('flatten()', () => {
		it('waits for each promise to resolve to an array, then returns the flattened result', () => {
			return promiseUtils.flatten([
				Promise.resolve([1, 2, 3]),
				Promise.resolve([4, 5, 6])
			]).then(arr => chai.assert.deepEqual(arr, [1, 2, 3, 4, 5, 6]));
		});
	});

	describe('flatMap()', () => {
		it('maps each value through the callback, then flattens the result once all promises resolve', () => {
			return promiseUtils.flatMap(
				[ Promise.resolve([1, 2, 3]), Promise.resolve([4, 5, 6]) ],
				p => p.then(arr => arr.map(v => v + 1))
			)
				.then(arr => chai.assert.deepEqual(arr, [2, 3, 4, 5, 6, 7]));
		});
	});
});
