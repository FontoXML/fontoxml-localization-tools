const fs = require('fs-extra');
const path = require('path');

const Message = require('./Message');
const promiseUtils = require('./promiseUtils');

const glob = promiseUtils.asPromise(require('glob'));
const readJson = promiseUtils.asPromise(fs.readJson);

const TRANSLATEABLE_STRING_PREFIX = 't__';

function getMessagesFromOperation (operation) {
	const messages = [];

	(function walk (obj) {
		Object.keys(obj).forEach(function (key) {
			var value = obj[key];
			var valueType = typeof value;

			// Detect magic translateable string marker and translate in-place
			if (valueType === 'string' && value.startsWith(TRANSLATEABLE_STRING_PREFIX)) {
				messages.push(value.slice(TRANSLATEABLE_STRING_PREFIX.length));
			}

			if (valueType === 'object' && value !== null) {
				walk(value);
			}
		});
	})(operation);

	return messages;
}

function readOperationsFromJson (path) {
	return readJson(path)
		.then(byName => Object.keys(byName)
			.map(name => Object.assign({}, byName[name], { name }))
		);
}

module.exports = function getOperationMessages (pkg) {
	const pattern = pkg.name === 'config' ? 'operations*.json' : 'src/operations*.json';
	return glob(pattern, { cwd: pkg.path })
		.then(operationsFiles => promiseUtils.flatMap(operationsFiles, jsonFile => {
			return promiseUtils.flatMap(
				readOperationsFromJson(path.join(pkg.path, jsonFile)),
				op => getMessagesFromOperation(op).map(original => new Message({
					original,
					metadata: {
						package: pkg.name,
						file: jsonFile
					}
				}))
			);
		}));
};
