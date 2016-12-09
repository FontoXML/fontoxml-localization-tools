#!/usr/bin/env node
/* eslint-disable no-console */

const getAllPackages = require('../src/getAllPackages');
const extractMessages = require('../src/extractMessages');
const deduplicateMessages = require('../src/deduplicateMessages');

getAllPackages(process.cwd())
	.then(extractMessages)
	.then(deduplicateMessages)
	.then(messages => {
		console.log(JSON.stringify(messages, null, '\t'));
	});
