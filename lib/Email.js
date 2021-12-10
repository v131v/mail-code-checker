const imaps = require('imap-simple');
const fs = require('fs').promises;
const path = require('path');
const logDir = '../log/';

module.exports = class Email {

	constructor(email, pass, options={}) {

		const domains = {
			gmx: 'imap.gmx.net',
			bigpond: 'imap.telstra.com',
			roadrunner: 'imap.charter.net',
			eyespyrecords: 'imap.mailprotect.be',
			libero: 'imapmail.libero.it',
			blumfamily: 'secure.emailsrvr.com',
			remnold: 'imap.one.com',
			usa: 'imap.mail.com'
		};

		this.base = {
			user: email,
			password: pass
		};

		let host = this.base.user.match(/.+@(.+)/)[1];

		if (domains[host.split('.')[0]]) {
			this.base.host = domains[host.split('.')[0]];
		}

		this.configs = [
			{
				port: 993,
				tls: true,
				authTimeout: 5000
			},
			{
				port: 143,
				tls: false,
				authTimeout: 5000
			}
		];

		this.connection = null;
		this.options = options;
		this.inbox = 'INBOX';
		this.junk = 'JUNK';
		this.trash = 'TRASH'
		this.junkRegexp = /(junk)|(spam)/i;
		this.trashRegexp = /(trash)|(delet)/i;
		this.boxList = [];

	}

	createConfig(params={}) {
		return {
			imap: Object.assign({}, this.base, params)
		};
	}

	generateFromCriteria(senders) {
		if (senders.length > 1) {
			return ['OR'].concat(senders.map(sender => ['FROM', sender]));
		}
		return ['FROM', senders[0]];
	}

	fromBase64(str) {
		return Buffer.from(str, 'base64').toString('ascii');
	}

	normalizeBody(bodyPart) {
		if (bodyPart.body.match(/<!DOCTYPE/)) {
			let body = bodyPart.body.replace(/(3D)|(\r)/g, '')
				.replace(/=\n/g, '')
				.replace(/=2E/g, '.');

			let start = body.match(/<html/).index;
			let end = body.match(/<\/html>/).index+7;

			bodyPart.body = body.slice(start, end);
			bodyPart.type = 'html';

			return bodyPart;
		}
		bodyPart.type = 'text';
		return bodyPart;
	}

	async connect() {

		if (!this.base.host) {
			
			let host = this.base.user.match(/.+@(.+)/)[1];

			return (this.connectWith('imap.'+host)
				.catch(err => {
					return this.connectWith('mail.'+host);
				})
				.catch(err => {
					return this.connectWith('outlook.office365.com');
				})
				.catch(err => {
					return this.connectWith('imap.1und1.de');
				})
				.then(connection => {
					this.connection = connection;
				})
				.catch(err => {
					console.log(`Auth error (${this.base.user})`);
					throw err;
				}));

		}

		let cfg = this.createConfig(this.configs[0]);

		return (imaps.connect(cfg)
			.catch(err => {

				cfg = this.createConfig(this.configs[1]);
				return imaps.connect(cfg);

			})
			.catch(err => {

				this.base.host = null;
				return this.connect();

			})
			.then(connection => {
				this.connection = connection;
			}));

	}

	async connectWith(host) {

		this.base.host = host;
		let cfg = this.createConfig(this.configs[0]);

		return (imaps.connect(cfg)
			.catch(err => {

				cfg = this.createConfig(this.configs[1]); 
				return imaps.connect(cfg);

			}));

	}

	async getBoxes(parent=[], boxList) {

		if (this.boxList.length > 0 && parent.length === 0) return;

		if (boxList === null) {
			return;
		}

		if (parent.length === 0) {

			await this.connect();
			this.boxList = [];
			boxList = await this.connection.getBoxes();
			this.connection.end();

		}

		for (let boxName in boxList) {

			let box = boxList[boxName];
			let curPath = parent.concat([boxName]);

			if (boxName.match(this.junkRegexp) !== null) {
				this.junk = boxName;
			} else if (boxName.match(this.trashRegexp) !== null) {
				this.trash = boxName;
			} else if (boxName !== this.inbox) {
				this.boxList.push(curPath.join('.'));
			}

			await this.getBoxes(curPath, box.children);

		}

		return this.boxList;

	}

	async getLastMailFrom(senders, handler, lastDate=-1) {

		const noAccess = 'No access to: ';
		let res = {
			attributes: {
				date: lastDate
			}
		};

		await this.getBoxes();

		for (let box of this.boxList) {

			let boxRes = await this.getLastMailFromBox(senders, handler, box)
				.catch(err=>{
					this.print(noAccess+box);
					return null;
				});

			if (boxRes && res.attributes.date < boxRes.attributes.date) {
				res = boxRes;
			}

		}

		return res;

	}

	async getLastMailFromBox(senders, handler, box='INBOX') {

		const searchCriteria = [this.generateFromCriteria(senders)];
		const fetchOptions = {
			bodies: ['HEADER', 'TEXT'],
			markSeen: true
		};
		const noAccess = 'No access to: ';

		await this.connect();

		try {
			await this.connection.openBox(box);
		} catch (err) {
			this.print(noAccess+box);
			return null;
		}

		let results = await this.connection.search(searchCriteria, fetchOptions);
		await this.connection.closeBox(true);
		this.connection.end();

		results = results
			.sort((a, b) => b.attributes.uid - a.attributes.uid)
			.filter(mail => handler(this.normalizeBody(mail.parts[1])));

		if (results.length > 0) {

			await this.log(`${logDir}${this.base.user}.html`, results[0].parts[1].body);
			return results[0];

		}

		return null;

	}

	async deleteMailsFrom(senders) {

		let results = [];
		const noAccess = 'No access to: ';
		await this.getBoxes();

		let fullBoxList = this.boxList.concat([this.inbox, this.junk, this.trash]);

		for (let box of fullBoxList) {

			let res = await (this.deleteMailsFromBox(senders, box)
				.then(res => {
					this.print(`Deleted ${res[1]} mails from ${res[0]}...`);
					return res;
				})
				.catch(err=>{
					this.print(noAccess+box);
				}));

			results.push(res);

		}

		return results.filter(res => res);

	}

	async deleteMailsFromBox(senders, box='INBOX') {

		const searchCriteria = [this.generateFromCriteria(senders)];
		const fetchOptions = {
			bodies: ['HEADER']
		};

		await this.connect();
		await this.connection.openBox(box);

		let results = await this.connection.search(searchCriteria, fetchOptions);
		results = results.map(mail => mail.attributes.uid);

		if (results.length > 0) {
			await this.connection.deleteMessage(results);
		}

		await this.connection.closeBox(true);
		this.connection.end();

		return [box, results.length];

	}

	end() {
		if (this.connection) {
			this.connection.end();
		}
	}

	async log(logFile, data) {
		if (this.options.log){
			return fs.writeFile(path.resolve(__dirname, logFile), data);
		}
	}

	print(txt) {
		if (this.options.log) {
			console.log(txt);
		}
	}

};