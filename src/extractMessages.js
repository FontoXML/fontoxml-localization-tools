const getOperationMessages = require('./getOperationMessages');
const getSourceMessages = require('./getSourceMessages');
const promiseUtils = require('./promiseUtils');

function getMessagesForPackage (pkg) {
	return promiseUtils.flatten([
		getSourceMessages(pkg),
		getOperationMessages(pkg)
	]);
}

module.exports = function extractMessages (packages) {
	return promiseUtils.flatMap(packages, getMessagesForPackage);
};
