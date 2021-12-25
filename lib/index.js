const path = require('path');

module.exports.getMail = require(path.resolve(__dirname, '.\\getMail.js'));
module.exports.clearEmail = require(path.resolve(__dirname, '.\\clearEmail.js'));
module.exports.Email = require(path.resolve(__dirname, '.\\Email.js'));
