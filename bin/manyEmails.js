#!/usr/bin/env node

const HELP = [
	'npx mails [-flag] [--argument=value]',
	'run mail command with all emails from target file',
	'\nFLAGS:',
	'  -a - find mails in all boxes (default INBOX, JUNK/SPAM, TRASH/DELETED)',
	'  -l - enable console logs',
	'  -u - order to find links in mails by default template (default on)',
	'  -c - order to find codes in mails by default template (default off)',
	'  -g - find mails from [senders] (default on)',
	'  -d - delete mails from [senders] (default off)',
	'\nVARS:',
	'  --emails=./relative/path/to/emails.txt - set emails which will used to codes/links search',
	'  --senders=[sender1@email.com, sender2@email.org...] - set senders of mails which will checked on codes/links',
	'  --code=valueRegexp - change regexp of mail codes (format like new RegExp(" valueRegexp ") )',
	'  --url=valueRegexp - change regexp of mail links (format like new RegExp(" valueRegexp ") )',
	'\nif you set --url it turns on flag -u and turns off flag -c, same behavior with --code'
].join('\n');

const fs = require('fs/promises');
const path = require('path');
const proc = require('process');

const getMail = require('../lib/getMail.js');
const clearEmail = require('../lib/clearEmail.js');
const termArgs = require('./terminalArgs.js');

(async() => {

	const options = termArgs(proc.argv, {
		log: false,
		url: true,
		code: false,
		senders: termArgs.SENDERS.bliz,
		type: 'get'
	});

	if (options.type === 'help') {

		console.log(HELP);
		return;

	}

	const emailsFile = options.emails;
	const senders = options.senders;

	const emailsText = await fs.readFile(path.resolve(emailsFile), 'utf8');
	const emails = emailsText
		.replace(/\r/g, '')
		.split('\n')
		.filter(email => email.length > 0)
		.map(email => email.split(':'));

	console.log(`Found ${emails.length} emails in ${emailsFile}`);

	emails.forEach(async (email) => {

		try {

			if (options.type === 'get') {

				const ans = await getMail(email, senders, options);
				console.log(`${ans.email} (${ans.date}):`);
				console.log(ans.data);

			}

			if (options.type === 'del') {

				await clearEmail(email, senders, {});
				
			}



		} catch (err) {

			console.error(err);

		}

	});

})()
