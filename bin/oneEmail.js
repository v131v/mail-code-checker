#!/usr/bin/env node

const proc = require('process');
const getMail = require('../lib/getMail.js');
const clearEmail = require('../lib/clearEmail.js');
const termArgs = require('./terminalArgs.js');

(async() => {

	const options = termArgs(proc.argv);

	const auth = options.auth;

	if (options.type === 'get') {

		const senders = options.senders;

		const ans = await getMail(auth, senders, options);

		console.log(`${ans.email} (${ans.date}):`);
		console.log(ans.data);

	}

	if (options.type === 'del') {

		await clearEmail(auth, senders, {});
		
	}

	if (options.type === 'help') {

		console.log(termArgs.HELP);

	}

})()
