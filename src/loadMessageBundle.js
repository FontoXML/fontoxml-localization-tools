const fs = require('fs-extra');
const Message = require('./Message');
const promiseUtils = require('../src/promiseUtils');
const readJson = promiseUtils.asPromise(fs.readJson);

/**
 * @param  {string}  path
 *
 * @return  {Promise.<Message[]>}
 */
module.exports = function loadMessageBundle (path) {
	return readJson(path)
		.then(messages => messages.map(msg => Message.fromJSON(msg)));
};
