const path = require('path');
const Email = require(path.resolve(__dirname, '.\\Email.js'));
const cheerio = require('cheerio');
const wait = '=== waiting ===';

module.exports = main;

async function main(email, senders, options) {

	options = Object.assign({
		delay: 10,
		log: true,
		lastDate: -1,
		depth: 3,
	}, options);
	const lastDate = options.lastDate;

	if (options.depth <= 0) {

		mail.end();
		throw new Error('getMail overtime');
		
	}

	const getDataFromMail = getDataFromMailGenerator(options);
	const mail = new Email(email[0], email[1], {log:options.log});

	let res = await mail.getLastMailFromBox(senders, getDataFromMail);

	if (res === null || lastDate >= res.attributes.date) {

		await mail.getBoxes();
		res = await mail.getLastMailFromBox(senders, getDataFromMail, mail.junk);

		if ((res === null || lastDate >= res.attributes.date) && options.checkAllBoxes) {
			res = await mail.getLastMailFrom(senders, getDataFromMail, lastDate);
		}
		
	}

	if (res && res.attributes.date > lastDate) {

		options.lastDate = res.attributes.date;

		const date = res.attributes.date;
		const data = getDataFromMail(res.parts[1]);

		mail.end();

		return {
			email: email[0],
			date: date,
			data: data
		};

	}

	options.depth--;

	await timer(options.delay*1000);
	return main(email, senders, options);

};

function getDataFromMailGenerator(options) {

	return function(mail) {

		if (options.code) {

			let body = mail.body;

			if (mail.type === 'html') {

				const $ = cheerio.load(body);
				body = $.text();

			}

			let code = /[\s\n\t:]([A-Z\d]{4,6})[\s\n\t\.]/;

			if (options.code instanceof RegExp) {
				code = options.code;
			}

			let codeMatch = body.match(new RegExp(code, 'g'));

			if (codeMatch === null) return false;
				
			codeMatch = codeMatch.map(match => match.match(code));

			if (codeMatch.length === 0) return false;
			
			return codeMatch;

		}

		if (options.url) {

			let links = [], body = mail.body;
			let url = /(https?:\/\/[^<\s]+)/;

			if (options.url instanceof RegExp) {
				url = options.url;
			}

			if (mail.type === 'html') {

				const $ = cheerio.load(body);
				links = Array.prototype.map
					.call($('a'), a => a.attribs.href.match(url))
					.filter(match => match);
				body = $.text();

			}
			
			let urlMatch = body.match(new RegExp(url, 'g'))||[];
			urlMatch = urlMatch.map(match => match.match(url));

			links = links.concat(urlMatch);

			if (links.length === 0) return false;

			return links;	

		}

	}

}

async function timer(time) {
	return new Promise((res) => {
		setTimeout(() => {
			res();
		}, time);
	})
}