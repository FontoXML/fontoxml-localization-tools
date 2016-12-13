const getOperationMessages = require('./getOperationMessages');
const getSourceMessages = require('./getSourceMessages');
const promiseUtils = require('./promiseUtils');

const DEFAULT_OPTIONS = {
	includeLineAndColumn: true
};

function getMessagesForPackage (pkg, options) {
	return promiseUtils.flatten([
		getSourceMessages(pkg, options),
		getOperationMessages(pkg)
	]);
}

/**
 * @param  {{name: string, path: string}[]}  packages
 * @param  {Object}                          [options]
 * @param  {boolean}                         [options.includeLineAndColumn=true]
 *
 * @return  {Promise.<Message[]>}
 */
module.exports = function extractMessages (packages, options) {
	return promiseUtils.flatMap(packages, pkg => getMessagesForPackage(pkg, Object.assign({}, DEFAULT_OPTIONS, options)));
};
