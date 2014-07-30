'use strict';

// size of key, in bits
var KEY_SIZE = 256;

// import node crypto module
var crypto = require('crypto');
// import cryptojs AES module
var node_cryptojs = require('node-cryptojs-aes');
// main encryption object
var CryptoJS = node_cryptojs.CryptoJS;
// custom json serialization format
var JsonFormatter = node_cryptojs.JsonFormatter;

// generate random key
exports.generateKey = function generateKey() {
	var rPass = crypto.randomBytes(KEY_SIZE).toString('base64');
}

exports.Crypt = function Crypt(rkey) {
	this.key = rkey;

	// encrypt message using given key and return ciphertext data
	this.encrypt = function(ptext) {
		return CryptoJS.AES.encrypt(ptext, this.key, {format: JsonFormatter}).toString();
	};

	// decrypt message using given key and return plaintext
	this.decrypt = function(ctext) {
		// run decryption
		return CryptoJS.AES.decrypt(ctext, this.key, {format: JsonFormatter}).toString();
	}
}