const getOperationMessages = require('./getOperationMessages');
const getSourceMessages = require('./getSourceMessages');
const promiseUtils = require('./promiseUtils');

function getMessagesForPackage (pkg) {
	return promiseUtils.flatten([
		getSourceMessages(pkg),
		getOperationMessages(pkg)
	]);
}

/**
 * @param  {{name: string, path: string}[]}  packages
 *
 * @return  {Promise.<Message[]>}
 */
module.exports = function extractMessages (packages) {
	return promiseUtils.flatMap(packages, getMessagesForPackage);
};
