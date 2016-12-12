const chai = require('chai');

const promiseUtils = require('../../src/promiseUtils');

describe('promiseUtils', () => {
	describe('asPromise()', () => {
		it('returns a promise that resolves if the node-style callback completes succesfully', () => {
			const wrapped = promiseUtils.asPromise(cb => {
				cb(null, 42);
			});

			return wrapped().then(res => chai.assert.equal(res, 42));
		});

		it('returns a promise that rejects if the node-style callback completes succesfully', () => {
			const wrapped = promiseUtils.asPromise(cb => {
				cb(new Error('expected'));
			});

			return wrapped().then(
				_ => chai.assert(false, 'should not resolve'),
				err => chai.assert.equal(err.message, 'expected')
			);
		});

		it('correctly passes all arguments and the return value', () => {
			const wrapped = promiseUtils.asPromise((a, b, c, cb) => {
				cb(null, [a + 1, b + 1, c + 1]);
			});

			return wrapped(1, 2, 3).then(arr => chai.assert.deepEqual(arr, [2, 3, 4]));
		});

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
