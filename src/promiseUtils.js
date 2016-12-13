/**
 * Adapts a node-style function taking a callback as the last argument to a function returning a promise.
 *
 * @param  {function(any..., function(err: Error, result: any))}  func
 *
 * @return  {function(any...): Promise<any>}
 */
function asPromise (func) {
	return function () {
		return new Promise((resolve, reject) => {
			func.apply(this, Array.from(arguments).concat([function (err, result) {
				if (err) {
					reject(err);
					return;
				}

				resolve(result);
			}]));
		});
	};
}

/**
 * Waits for all values to resolve to arrays, then returns the result of concatenating them.
 *
 * @param  {(any|Promise.<any[]>)[]}  valuesOrPromises
 *
 * @return  {Promise.<any[]>}
 */
function flatten (valuesOrPromises) {
	return Promise.all(valuesOrPromises)
		.then(values => values.reduce((vs, v) => vs.concat(v), []));
}

/**
 * Applies cb to all values, then waits for and flattens the result.
 *
 * @param  {(any|Promise.<any[]>)[]}         valuesOrPromises
 * @param  {function(any): Promise.<any[]>}  cb
 *
 * @return  {Promise.<any[]>}
 */
function flatMap (valuesOrPromises, cb) {
	return Promise.resolve(valuesOrPromises)
		.then(valuesOrPromises => flatten(valuesOrPromises.map(cb)));
}

module.exports = {
	asPromise,
	flatten,
	flatMap
};
