// size of key, in bits
var KEY_SIZE = 256;

// import module
var crypto = require('crypto');

// generate random key
function generateKey() {
	var rPass = crypto.generate(KEY_SIZE);
	// convert to base64
	var rPass_base64 = rPass.toString("base64");

	console.log("passcode in base 64:");
	console.log(rPass_base64);
	console.log("\n");

	return rPass_base64;
}

function Crypt (key) {
	this.key = key;
	// import AES module
	this.node_cryptojs = require('node-cryptojs-aes');
	// main encryption object
	this.CryptoJS = node_cryptojs.CryptoJS;
	// custom json serialization format
	this.JsonFormatter = node_cryptojs.JsonFormatter;

	// encrypt message using given key and return ciphertext
	this.encrypt = function(ptext, key) {
		// run encryption
		var encrypted = CryptoJS.AES.encrypt(ptext, key, {format: JsonFormatter});
		// retrieve ciphertext
		var ciphertext = encrypted.ciphertext;
		console.log("ciphertext:");
		console.log(ciphertext);
		return ciphertext;
	};

	// decrypt message using given key and return plaintext
	this.decrypt = function(ctext, key) {
		// run decryption
		var decrypted = CryptoJS.AES.decrypt(ctext, key, {format: JsonFormatter});
		// retrieve plaintext
		var plaintext = decrypted.plaintext;
		console.log("plaintext:");
		console.log(plaintext);
		return plaintext;
	}
}