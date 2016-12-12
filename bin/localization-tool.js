#!/usr/bin/env node
/* eslint-disable no-console */

const path = require('path');

const extractMessages = require('../src/extractMessages');
const deduplicateMessages = require('../src/deduplicateMessages');
const loadMessageBundle = require('../src/loadMessageBundle');
const promiseUtils = require('../src/promiseUtils');
const updateMessagesWithTemplate = require('../src/updateMessagesWithTemplate');

function printUsage (scriptName) {
	console.log(`
	Usage:

	${scriptName} help
		prints this message

	${scriptName} extract [path [path...]]
		extract message bundle template from package(s) at the given path(s)

	${scriptName} merge [path [path...]]
		merge message bundles

	${scriptName} update <bundlePath> <templatePath>
		update message bundle with new template
	`);

	return Promise.resolve();
}

function getPackageDescriptors (paths) {
	if (!paths.length) {
		paths = [ process.cwd() ];
	}

	return paths.map(p => ({
		name: path.basename(path.resolve(p)),
		path: p
	}));
}

function printMessages (messages) {
	console.log(JSON.stringify(messages, null, '\t'));
}

function printMessagesToStdErr (messages, category) {
	if (!messages.length) {
		return;
	}

	console.warn(`${messages.length} messages ${category}:`);
	console.warn(JSON.stringify(messages, null, '\t'));
}

function run () {
	const args = process.argv.slice(2);
	switch (args[0]) {
		case 'extract':
			return extractMessages(getPackageDescriptors(args.slice(1)))
				.then(deduplicateMessages)
				.then(printMessages);

		case 'merge':
			return promiseUtils.flatMap(args.slice(1), loadMessageBundle)
				.then(deduplicateMessages)
				.then(printMessages);

		case 'update':
			return Promise.all([
				loadMessageBundle(args[1]).then(deduplicateMessages),
				loadMessageBundle(args[2])
			])
				.then(([messages, templateMessages]) => updateMessagesWithTemplate(messages, templateMessages))
				.then(({ messages, added, removed }) => Promise.all([
					printMessages(messages),
					printMessagesToStdErr(added, 'need localization'),
					printMessagesToStdErr(removed, 'removed')
				]));

		case 'help':
		case '-h':
		case '--help':
		default:
			return printUsage(path.basename(process.argv[1]));
	}
}

run()
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
