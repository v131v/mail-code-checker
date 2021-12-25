const SENDERS = {
	epic: ['help@accts.epicgames.com', 'help@epicgames.com'],
	bliz: ['noreply@battle.net'],
};

const FLAGS = {
	'a': (options) => {
		options.checkAllBoxes = !options.checkAllBoxes;
		return options;
	},
	'l': (options) => {
		options.log = !options.log;
		return options;
	},
	'u': (options) => {
		options.url = !options.url;
		options.code = !options.code;
		return options;
	},
	'c': (options) => {
		options.url = !options.url;
		options.code = !options.code;
		return options;
	},
	'bliz': (options) => {
		options.senders = SENDERS.bliz;
		return options;
	},
	'epic': (options) => {
		options.senders = SENDERS.epic;
		return options;
	},
	'g': (options) => {
		options.type = 'get';
		return options;
	},
	'd': (options) => {
		options.type = 'del';
		return options;
	},
	'h': (options) => {
		options.type = 'help';
		return options;
	},
	'help': (options) => {
		options.type = 'help';
		return options;
	},
};

const VARS = {
	'code': (url) => new RegExp(url, 'g'),
	'url': (url) => new RegExp(url, 'g'),
	'auth': (email) => Array.from(email.match(/(.+@[^:]+):(.+)/)).slice(1),
	'senders': (emails) => emails.replace(/[\[\]\s]/g, '').split(','),
	'emails': (emailsFile) => emailsFile,
};

module.exports = function(argv, defaultOptions = {}) {
	
	let options = {
		log: true,
		code: true,
		url: false,
		checkAllBoxes: false,
		...defaultOptions,
	};
	
	const flagsRegexp = /-([a-z]+)/;
	let flags = argv.find(arg => arg.match(flagsRegexp) && arg.length === arg.match(flagsRegexp)[0].length);

	if (flags) {
		flags = flags.match(flagsRegexp)[1].split('');
		flags.forEach((option) => {

			options = FLAGS[option](options);

		});
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
