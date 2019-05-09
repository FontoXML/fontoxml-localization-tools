const babylon = require('babylon');
const traverse = require('babel-traverse').default;

const Message = require('./Message');

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

function getMessageString (message, fileName) {
	switch (message.type) {
		case 'StringLiteral':
			return message.value;
		case 'BinaryExpression':
			if (message.operator !== '+') {
				break;
			}
			return getMessageString(message.left, fileName) + getMessageString(message.right, fileName);
	}
	throw new Error(`Call to t() with non-literal argument in ${fileName}, line ${message.loc.start.line}. Use a string literal or a concatenation of string literals. Any other construction is not supported.`);
}

/**
 * @param  {string}   source       full source code to extract messages from
 * @param  {string}   packageName
 * @param  {string}   fileName
 * @param  {boolean}  includeLineAndColumn
 *
 * @return  {Message[]}
 */
module.exports = function getMessagesFromSource (source, packageName, fileName, includeLineAndColumn) {
	let ast;
	try {
		ast = babylon.parse(source, {
			sourceType: 'module',
			plugins: ['classProperties', 'jsx', 'objectRestSpread' ]
		});
	}
	catch (error) {
		console.error(`Unable to parse ${fileName}.`);
		throw error;
	}

	const messages = [];

	traverse(ast, {
		CallExpression (path) {
			if (!path.get('callee').isIdentifier({ name: 't' })) {
				return;
			}

			const binding = path.scope.getBinding('t');
			const sourcePath = getImportSourcePath(binding);
			if (!sourcePath || !sourcePath.match(/^fontoxml-localization\/(src\/)?t(\.js)?$/g)) {
				return;
			}

			if (path.node.arguments.length < 1 || path.node.arguments.length > 2) {
				throw new Error(`Call to t() with wrong number of arguments in ${fileName}, line ${path.node.loc.start.line}. It must be called with at least one argument, and at most 2 arguments.`);
			}
			const message = path.node.arguments[0];

			const meta = {
				package: packageName,
				file: fileName
			};
			if (includeLineAndColumn) {
				meta.line = message.loc.start.line;
				meta.column = message.loc.start.column;
			}
			messages.push(Message.fromSource(getMessageString(message, fileName), meta));
		}
	});

	return messages;
};
