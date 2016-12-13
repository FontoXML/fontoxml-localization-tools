const fs = require('fs-extra');
const path = require('path');

const getMessagesFromOperation = require('./getMessagesFromOperation');
const promiseUtils = require('./promiseUtils');

const glob = promiseUtils.asPromise(require('glob'));
const readJson = promiseUtils.asPromise(fs.readJson);

function readOperationsFromJson (path) {
	return readJson(path)
		.then(byName => Object.keys(byName)
			.map(name => Object.assign({}, byName[name], { name }))
		);
}

/**
 * @param  {{name: string, path: string}}  pkg
 *
 * @return  {Promise.<Message[]>}
 */
module.exports = function getOperationMessages (pkg) {
	const pattern = pkg.name === 'config' ? 'operations*.json' : 'src/operations*.json';
	return glob(pattern, { cwd: pkg.path })
		.then(operationsFiles => promiseUtils.flatMap(operationsFiles, jsonFile => {
			return promiseUtils.flatMap(
				readOperationsFromJson(path.join(pkg.path, jsonFile)),
				op => getMessagesFromOperation(op, pkg.name, jsonFile)
			);
		}));
};
