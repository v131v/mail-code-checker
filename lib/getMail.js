const path = require('path');
const Email = require(path.resolve(__dirname, '.\\Email.js'));
const cheerio = require('cheerio');
const wait = '=== waiting ===';
let lastDate = -1;

module.exports = main;

async function main(email, senders, options) {

	options = Object.assign({
		delay: 10,
		log: true
	}, options);

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

		lastDate = res.attributes.date;

		const date = res.attributes.date;
		const data = getDataFromMail(res.parts[1]);

		return {
			email: email[0],
			date: date,
			data: data
		};

	}

	await timer(options.delay*1000);
	return main(email, senders, options);

};

function getDataFromMailGenerator(options) {

	return function(mail) {
		
		let ans = {};

		if (options.code) {

			let body = mail.body;

			if (mail.type === 'html') {

				const $ = cheerio.load(body);
				body = $.text();

			}

			let code = /[\s\n\t:]([A-Z\d]{4,6})[\s\n\t\.]/g;

			if (options.code instanceof RegExp) {
				code = options.code;
			}

			const codeMatch = body.match(code);

			if (!codeMatch) return null;
			ans.code = codeMatch;

		}

		if (options.url) {

			let links = [], body = mail.body;

			if (mail.type === 'html') {

				const $ = cheerio.load(body);
				links = Array.prototype.map.call($('a'), a => a.attribs.href);
				body = $.text();

			}

			let url = /https?:\/\/[^<\s]+/g;

			if (options.url instanceof RegExp) {
				url = options.url;
			}
			
			const urlMatch = body.match(url);

			if (urlMatch) {
				links = links.concat(urlMatch);
			}

			if (links.length === 0) return null;

			ans.url = links;	

		}

		return ans;

	}

}

async function timer(time) {
	return new Promise((res) => {
		setTimeout(() => {
			res();
		}, time);
	})
}