const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const fs = require('fs');
const path = require('path');

const Message = require('./Message');
const promiseUtils = require('./promiseUtils');
const glob = promiseUtils.asPromise(require('glob'));
const readFile = promiseUtils.asPromise(fs.readFile);

function getDefineImportSourcePath (ancestry) {
	if (
		ancestry.length !== 5 ||
		// Should be an argument of a function...
		!ancestry[1].isFunctionExpression() ||
		ancestry[1].listKey !== 'arguments' ||
		// ...inside a call expression...
		!ancestry[2].isCallExpression() ||
		// ...to an unbound 'define' function
		!ancestry[2].get('callee').isIdentifier({ name: 'define' }) ||
		ancestry[2].scope.getBinding('define')
	) {
		return null;
	}

	const importSourcePath = ancestry[2].get('arguments')[0].get('elements')[ancestry[0].key];
	if (!importSourcePath || !importSourcePath.isStringLiteral()) {
		return null;
	}

	return importSourcePath.node.value;
}

function getES6ImportSourcePath (ancestry) {
	if (!ancestry[0].isImportDefaultSpecifier()) {
		return null;
	}

	const importSourcePath = ancestry[1].get('source');
	if (!importSourcePath.isStringLiteral()) {
		return null;
	}

	return importSourcePath.node.value;
}

function getImportSourcePath (binding) {
	if (!binding) {
		return null;
	}

	const ancestry = binding.path.getAncestry();
	return getDefineImportSourcePath(ancestry) ||
		getES6ImportSourcePath(ancestry);
}

function getMessagesFromSource (source) {
	const ast = babylon.parse(source, {
		sourceType: 'module',
		plugins: [ 'jsx', 'objectRestSpread' ]
	});

	const messages = [];

	traverse(ast, {
		CallExpression (path) {
			if (!path.get('callee').isIdentifier({ name: 't' })) {
				return;
			}

			const binding = path.scope.getBinding('t');
			const sourcePath = getImportSourcePath(binding);
			if (sourcePath !== 'fontoxml-localization/t' && sourcePath !== 'fontoxml-localization/src/t') {
				return;
			}

			const message = path.node.arguments[0];
			if (!message || message.type !== 'StringLiteral') {
				console.warn('Call to t() with non-literal argument at', message.loc);
			}

			messages.push({
				message: message.value,
				line: message.loc.start.line,
				column: message.loc.start.column
			});
		}
	});

	return messages;
}

module.exports = function getSourceMessages (pkg) {
	const pattern = pkg.name === 'config' ? '**/*.js' : 'src/**/*.js';

	return glob(pattern, { cwd: pkg.path })
		.then(sourceFiles => promiseUtils.flatMap(sourceFiles, sourceFile => {
			return readFile(path.join(pkg.path, sourceFile), 'utf8')
				.then(source => getMessagesFromSource(source).map(info => Message.fromSource(info.message, {
					package: pkg.name,
					file: sourceFile,
					line: info.line,
					column: info.column
				})));
		}));
};
