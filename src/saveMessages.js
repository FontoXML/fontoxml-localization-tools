const { asPromise } = require('./promiseUtils');
const fs = require('fs');
const writeFile = asPromise(fs.writeFile);

/**
 * Write a messages JSON file to the filesystem
 * @param   {Object}   messagesJson
 * @param   {string}   path
 * @return  {Promise}  Promise resolving to undefined, or rejecting with an error
 */
module.exports = function saveMessages (messagesJson, path) {
	return writeFile(path, JSON.stringify(messagesJson, null, '\t'));
};
