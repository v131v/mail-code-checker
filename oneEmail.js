const proc = require('process');
const getMail = require('./lib/getMail.js');
const clearEmail = require('./lib/clearEmail.js');
const termArgs = require('./lib/terminalArgs.js');

const epicSenders = ['help@accts.epicgames.com', 'help@epicgames.com'];
const blizSenders = ['noreply@battle.net'];
const senders = blizSenders;

(async() => {

let start = proc.argv.indexOf('get');

if (start !== -1) {

	const auth = proc.argv[start+1].split(':');
	let options = {
		code: true
	};
	options = termArgs(proc.argv, options);

	const ans = await getMail(auth, senders, options);
	console.log(`${ans.email} (${ans.date}):`);
	console.log(ans.data);

}

start = proc.argv.indexOf('del');

if (start !== -1) {
	const auth = proc.argv[start+1].split(':');
	await clearEmail(auth, senders, {});
}

})()
