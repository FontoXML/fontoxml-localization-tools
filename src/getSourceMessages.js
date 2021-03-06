const fs = require('fs');
const path = require('path');

const getMessagesFromSource = require('./getMessagesFromSource');
const promiseUtils = require('./promiseUtils');
const glob = promiseUtils.asPromise(require('glob'));
const readFile = promiseUtils.asPromise(fs.readFile);

/**
 * @param  {{name: string, path: string}}     pkg
 * @param  {{includeLineAndColumn: boolean}}  options
 *
 * @return  {Promise.<Message[]>}
 */
module.exports = function getSourceMessages (pkg, options) {
	const pattern = pkg.name === 'config' ? '**/*+(.js|.jsx)' : 'src/**/*+(.js|.jsx)';

	return glob(pattern, { cwd: pkg.path })
		.then(sourceFiles => promiseUtils.flatMap(sourceFiles, sourceFile => {
			return readFile(path.join(pkg.path, sourceFile), 'utf8')
				.then(source => getMessagesFromSource(source, pkg.name, sourceFile, options.includeLineAndColumn));
		}));
};
