#!/usr/bin/env node

const HELP = [
	'npx mail [-flag] [--argument=value]',
	'finds last mail with codes(like 3956, UOFHTJ, 6YH3H9, etc)/links and show it',
	'search don\'t work with codes and links at the same time - only links or only codes',
	'\nFLAGS:',
	'  -a - find mails in all boxes (default INBOX, JUNK/SPAM, TRASH/DELETED)',
	'  -l - disable console logs',
	'  -u - order to find links in mails by default template (default off)',
	'  -c - order to find codes in mails by default template (default on)',
	'  -g - find mails from [senders] (default on)',
	'  -d - delete mails from [senders] (default off)',
	'\nVARS:',
	'  --auth=email@domain:password - set email which will used to codes/links search',
	'  --senders=[sender1@email.com, sender2@email.org...] - set senders of mails which will checked on codes/links',
	'  --code=valueRegexp - change regexp of mail codes (format like new RegExp(" valueRegexp ") )',
	'  --url=valueRegexp - change regexp of mail links (format like new RegExp(" valueRegexp ") )',
	'\nif you set --url it turns on flag -u and turns off flag -c, same behavior with --code'
].join('\n');

const proc = require('process');
const getMail = require('../lib/getMail.js');
const clearEmail = require('../lib/clearEmail.js');
const termArgs = require('./terminalArgs.js');

(async() => {

	const options = termArgs(proc.argv, {
		code: true,
		url: false,
		senders: termArgs.SENDERS.bliz,
		type: 'get',
		log: true,
	});

	if (options.type === 'help') {

		console.log(HELP);
		return;

	}

	const auth = options.auth;
	const senders = options.senders;

	if (options.type === 'get') {

		const ans = await getMail(auth, senders, options);

		console.log(`${ans.email} (${ans.date}):`);
		console.log(ans.data);

	}

	if (options.type === 'del') {

		await clearEmail(auth, senders, {});
		
	}

})()
