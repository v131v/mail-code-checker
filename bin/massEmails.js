#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const proc = require('process');
const baseFile = 'base.txt';
const getMail = require('./lib/getMail.js');
const termArgs = require('./terminalArgs.js');

const options = termArgs(proc.argv, {
	log: false,
	url: true,
	senders: termArgs.SENDERS.bliz,
});

const senders = options.senders;

const emails = fs.readFileSync(path.resolve(baseFile), 'utf8')
	.replace(/\r/g, '')
	.split('\n')
	.filter(email => email.length > 0)
	.map(email => email.split(':'));

emails.forEach(async (email) => {
	try {
		const ans = await getMail(email, senders, options);
		console.log(`${ans.email} (${ans.date}):`);
		console.log(ans.data);
	} catch (err) {
		console.error(err);
	}
});
