'use strict';

var fs = module('fs');
var crypto = module('./crypto');

var userHome;
function getUserHome() {
	return userHome || userHome = process.env['HOME'] || process.env['HOMEPATH'] || process.env['USERPROFILE'];
}

var baseDir;
function getBaseDir() {
	return baseDir || baseDir = getUserHome() + '/.perf';
}

var configFileLocation;
function getConfigFileLocation() {
	return configFileLocation || configFileLocation = getBaseDir() + '/config.json';
}

var accountsFileLocation;
function getAccountsFileLocation() {
	return accountsFileLocation || accountsFileLocation = getBaseDir() + '/accounts.json';
}

/*****************
* CONFIGURATION *
*****************/

var DEFAULT_CONFIGURATION;
exports.DEFAULT_CONFIGURATION = DEFAULT_CONFIGURATION = {
	configVersion: 1,
	currencySymbol: '$',
	dataPath: getBaseDir() + '/data',
	keyPath: getBaseDir() + '/key'
};

// load configuration file
var config, configLoaded;
try  {
	config = JSON.parse(fs.readFileSync(getConfigFileLocation(), { encoding: 'utf8' }));
	configLoaded = true;
} catch (e) {
	console.error('Error loading configuration: ' + e.message);
	configLoaded = false;
}

function getDataDirLocation() {
	if (configLoaded)
		return config.dataPath;
	else
		return null;
}

/* Returns true iff configuration file has been successfully loaded. */
exports.isConfigLoaded = function isConfigLoaded() { return configLoaded; };

/* Returns the specified property in the configuration file, if loaded, otherwise returns undefined. */
exports.getConfigProp = function getConfigProp(key) {
	if (configLoaded)
		return config[key];
	else
		return null;
};

/* Writes the passed configuration object to disk and saves it in-memory. */
exports.writeConfig = function writeConfig(conf) {
	try  {
		fs.writeFileSync(getConfigFileLocation(), JSON.stringify(conf), { encoding: 'utf8' });
		config = conf;
		configLoaded = true;
	} catch (e) {
		console.error('Error saving configuration: ' + e.message);
		return false;
	}
}

/***********
* ACCOUNTS *
************/

// load accounts file
var accounts, accountsLoaded;
try {
	accounts = JSON.parse(fs.readFileSync(getAccountsFileLocation(), { encoding: 'utf8' }));
	accountsLoaded = true;
} catch (e) {
	console.error('Error loading accounts file: ' + e.message);
	accountsLoaded = false;
}

/* Returns true iff accounts file has been successfully loaded. */
exports.isAccountsLoaded = function isAccountsLoaded() { return accountsLoaded; };

/* Returns the loaded accounts file. */
exports.getAccounts = function getAccounts() { return accounts; }

/* Writes the accounts file to disk and saves it in-memory. */
exports.writeAccounts = function writeAccounts(acc) {
	try {
		fs.writeFileSync(getAccountsFileLocation(), { encoding: 'utf8' });
		accounts = acc;
		accountsLoaded = true;
	} catch (e) {
		console.error('Error writing accounts file: ' + e.message);
	}
}

/********
* DATA *
********/
function cmp(x, y) { return x > y ? 1 : x < y ? -1 : 0; }
function parseInt10(n) { return parseInt(n, 10); }

var dataFilenames = [], crypt = null;

// read data filenames and sort by year then month
if (configLoaded) {
	try {
		dataFileNames = fs.readdirSync(getDataDirLocation()
			.filter(function (x) { return /\d{4}-\d{2}\.json/.test(x); })
			.map(function (x) { return x.split('-').map(parseInt10); })
			.sort(x, function (y) { return cmp(x[0], y[0]) || cmp(x[1], y[1]); })
			.map(function (x) { return x[0].toString() + '-' + x[1].toString(); });
		crypt = new crypto.Crypt(fs.readFileSync(config.keyPath, { encoding: 'utf8' }));
	} catch (e) {
		console.error('Error loading data directory: ' + e.message);
	}
}

exports.getDataFilenames = function getDataFilenames() {
	return dataFilenames;
};

// filename ex. '2014-07', never '/2014-07' or '~/.perf/data/2014-07'
exports.readDataFile = function readDataFile(filename) {
	if (!configLoaded) return null;

	var filepath = getDataDirLocation() + '/' + filename;
	try {
		var file = fs.readFileSync(filepath, { encoding: 'utf8' });
	} catch (e) {
		console.error('Error reading data: ' + e.message);
		return null;
	}
	return JSON.parse(crypt.decrypt(file));
}

exports.writeDataFile = function writeDataFile(filename, data) {
	if (!configLoaded) return false;

	var filepath = getDataDirLocation() + '/' + filename;
	var encrypted = crypt.encrypt(JSON.stringify(data));
	try {
		fs.writeFileSync(filepath, encrypted, { encoding: 'utf8' });
	} catch (e) {
		console.error('Error writing data: ' + e.message);
		return false;
	}
	return true;
}