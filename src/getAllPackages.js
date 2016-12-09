const fs = require('fs');
const path = require('path');

const promiseUtils = require('./promiseUtils');

const readdir = promiseUtils.asPromise(fs.readdir);
const stat = promiseUtils.asPromise(fs.stat);

const PACKAGE_ROOTS = [
	'packages',
	'packages-shared',
	'platform-linked',
	'platform'
];

module.exports = function getAllPackages (rootPath) {
	const promises = PACKAGE_ROOTS.map(root => {
		const packageRootPath = path.join(rootPath, root);
		return readdir(packageRootPath)
			.catch(_e => [])
			.then(names => Promise.all(names
				.map(name => ({ name, path: path.join(packageRootPath, name) }))
				.map(entry => stat(entry.path).then(stats => stats.isDirectory() ? entry : null))
			))
			.then(entries => entries.filter(entry => !!entry));
	});

	const configPath = path.join(rootPath, 'config');
	promises.push(stat(configPath).then(
		stats => {
			if (stats.isDirectory()) {
				return [{
					name: 'config',
					path: configPath
				}];
			}

			return [];
		},
		_e => []
	));

	return promiseUtils.flatten(promises);
};
