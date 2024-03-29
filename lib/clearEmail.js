const path = require('path');
const Email = require(path.resolve(__dirname, '.\\Email.js'));

module.exports = async function(email, senders, options) {

	options = Object.assign({
		log: true,
	}, options);
	
	const mail = new Email(email[0], email[1], {log:options.log});
	const results = await mail.deleteMailsFrom(senders);
	mail.end();

};
