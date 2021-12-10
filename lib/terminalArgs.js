module.exports.FLAGS = {
	'a': {checkAllBoxes:true},
	'l': {log:false},
	'u': {url:true,code:false},
	'c': {code:true,url:false}
};

module.exports.VARS = {
	'code': (url) => new RegExp(url),
	'url': (url) => new RegExp(url)
};

module.exports = function(argv, defaultOptions={}) {
	
	let options = defaultOptions;
	let flagsRegexp = /-([a-z]+)/;
	let flags = argv.find(arg => arg.match(flagsRegexp));

	if (flags) {
		flags = flags.match(flagsRegexp)[1].split('');
		options = flags.reduce((sum, option) => Object.assign(sum, module.exports.FLAGS[option]), options);
	}

	let vars = argv
		.map(arg => arg.match(/--([a-z]+)=(.+)/))
		.filter(arg => arg);

	vars.forEach(arg => {
		options[arg[1]] = module.exports.VARS[arg[1]](arg[2]);
	});

	return options;

};
