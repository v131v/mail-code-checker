const fs = require('fs');
const path = require('path');
const proc = require('process');
const baseFile = 'base.txt';
const getMail = require('./lib/getMail.js');
const termArgs = require('./lib/terminalArgs.js');

const epicSenders = ['help@accts.epicgames.com', 'help@epicgames.com'];
const blizSenders = ['noreply@battle.net'];
const senders = blizSenders;

const options = termArgs(proc.argv, {
	log: false,
	url: true
});

const emails = fs.readFileSync(path.resolve(baseFile), 'utf8')
	.replace(/\r/g, '')
	.split('\n')
	.filter(email => email.length > 0)
	.map(email => email.split(':'));

emails.forEach(async (email) => {
	try {
		const ans = await getMail(email, senders, options);
		console.log(`${ans.email} (${ans.date}):`);
		console.log(obj.data);
	} catch (err) {
		console.error(err);
	}
});