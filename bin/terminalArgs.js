const HELP = [
	'npx mail-code-checker [-flag] [--argument=value]',
	'search last mail with codes(like 3956, UOFHTJ, 6YH3H9, etc)/links and show it',
	'search don\'t work with codes and links at the same time - only links or only codes',
	'\nFLAGS:',
	'\t-a - find mails in all boxes (default INBOX, JUNK/SPAM, TRASH/DELETED',
	'\t-l - disable console logs',
	'\t-u - order to find links in mails by default template (default off)',
	'\t-c - order to find codes in mails by default template (default on)',
	'-g - find mails from [senders] (default on)',
	'-d - delete mails from [senders] (default off)',
	'\nVARS:',
	'\t--auth=email@domain:password - set email which will used to codes/links search',
	'\t--senders=[sender1@email.com, sender2@email.org...] - set senders of mails which will checked on codes/links',
	'\t--code=valueRegexp - change regexp of mail codes (format like new RegExp(" valueRegexp ") )',
	'\t--url=valueRegexp - change regexp of mail links (format like new RegExp(" valueRegexp ") )',
];

const SENDERS = {
	epic: ['help@accts.epicgames.com', 'help@epicgames.com'],
	bliz: ['noreply@battle.net'],
};

const FLAGS = {
	'a': {checkAllBoxes:true},
	'l': {log:false},
	'u': {url:true,code:false},
	'c': {code:true,url:false},
	'bliz': {senders:SENDERS.bliz},
	'epic': {senders:SENDERS.epic},
	'g': {type:'get'},
	'd': {type:'del'},
	'h': {type:'help'},
	'help': {type:'help'},
};

const VARS = {
	'code': (url) => new RegExp(url, 'g'),
	'url': (url) => new RegExp(url, 'g'),
	'auth': (email) => Array.from(email.match(/(.+@[^:]+):(.+)/)).slice(1),
	'senders': (emails) => emails.replace(/[\[\]\s]/g, '').split(','),
};

module.exports = function(argv) {
	
	let options = {
		code: true,
		senders: termArgs.SENDERS.bliz,
		type: 'get',
	};
	
	const flagsRegexp = /-([a-z]+)/;
	let flags = argv.find(arg => arg.match(flagsRegexp) && arg.length === arg.match(flagsRegexp)[0].length);

	if (flags) {
		flags = flags.match(flagsRegexp)[1].split('');
		options = flags.reduce((sum, option) => Object.assign(sum, FLAGS[option]), options);
	}

	const vars = argv
		.map(arg => arg.match(/--([a-z]+)=(.+)/))
		.filter(arg => arg);

	vars.forEach(arg => {
		options[arg[1]] = VARS[arg[1]](arg[2]);
	});

	return options;

};

module.exports.SENDERS = SENDERS;
module.exports.FLAGS = FLAGS;
module.exports.VARS = VARS;
