# Mail code checker

---

Check email for codes(like `3956`, `UOFHTJ`, `6YH3H9`, etc)/links in mails. Work with imap, promise based

## How to use

### CLI

* With 1 email
```
npx mail --auth=email@domain:password --senders=[noreply@github.com]
```

* With many emails written in file like `email@domain:password` by lines
```
npx mails --emails=./emails.txt --senders=[noreply@github.com]
```

* For details run:
```
npx <command> -h
```
or
```
npx <command> -help
```

## Programmaticly

Installation like npm package
```
npm install https://github.com/v131v/mail-code-checker.git
```

Using in code
```
const MailChecker = require('mail-code-checker');

const auth = ['email@domain.com', 'password'];
const senders = ['noreply@github.com'];

MailChecker.getMail(auth, senders)
	.then((mail) => {

		console.log(`Email: ${mail.email}`);
		console.log(`Date: ${mail.date}`);
		console.log(`Codes:`);

		for (let code of mail.data) {
			console.log(code);
		}

	});
```

## API

---

### getMail(auth, senders, options)
Find last mail with codes/links

* `auth` - `Array<String>` fisrt element email address, second - password
* `senders` - `Array<String>` emails used in field `From` of mails
* `options` - `Object` search options:

- `code` - `Boolean`/`RegExp` if true use default code regexp `[\s\n\t:]([A-Z\d]{4,6})[\s\n\t\.]`. Enable codes search, turns off `url`
- `url` - `Boolean`/`RegExp` if true use default url regexp `https?:\/\/[^<\s]+/`. Enable links search, turns off `code`
- `log` - `Boolean` enable/disable console logs
- `checkAllBoxes` - `Boolean` if true enable search in all email boxes (default INBOX, JUNK/SPAM, TRASH/DELETED)
- `delay` - `Number` time of sleeping between email checking

Returns `Promise` that resolve `Object`:
- `email` - `String` checked email, same as `auth`
- `date` - `Date` date of mail
- `data` - `Array<Array>` array of matches with code/link regexp 

### clearEmail(auth, senders, options)
Delete all mails from every sender

* `auth` - `Array` fisrt element email address, second - password
* `senders` - `Array` emails used in field `From` of mails
* `options` - `Object` search options:

- `log` - `Boolean` enable/disable console logs
