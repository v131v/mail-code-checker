const Email = require('./Email.js');

module.exports = async function(email, senders, options) {
	
	const mail = new Email(email[0], email[1], {log:options.log});
	const results = await mail.deleteMailsFrom(senders);
	mail.end();

};
