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
	var rPass = crypto.randomBytes(KEY_SIZE);
	// convert to base64
	var rPass_base64 = rPass.toString("base64");

	console.log("passcode in base 64:");
	console.log(rPass_base64);

	return rPass_base64;
}

exports.Crypt = function Crypt(rkey) {
	this.key = rkey;

	// encrypt message using given key and return ciphertext data
	this.encrypt = function(ptext) {
		// run encryption
		var encrypted = CryptoJS.AES.encrypt(ptext, this.key, {format: JsonFormatter});
		// retrieve ciphertext
		var ciphertext = encrypted.toString();
		console.log("ciphertext:");
		console.log(ciphertext);
		return ciphertext;
	};

	// decrypt message using given key and return plaintext
	this.decrypt = function(ctext) {
		// run decryption
		var decrypted = CryptoJS.AES.decrypt(ctext, this.key, {format: JsonFormatter});
		// retrieve plaintext
		var plaintext = decrypted.toString();
		console.log("plaintext:");
		console.log(plaintext);
		return plaintext;
	}
}