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

function flatten (valuesOrPromises) {
	return Promise.all(valuesOrPromises)
		.then(values => values.reduce((vs, v) => vs.concat(v), []));
}

function flatMap (valuesOrPromises, cb) {
	return Promise.resolve(valuesOrPromises)
		.then(valuesOrPromises => flatten(valuesOrPromises.map(cb)));
}

module.exports = {
	asPromise,
	flatten,
	flatMap
};
