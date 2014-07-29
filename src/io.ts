// <reference path='../def/node.d.ts'/>
'use strict';

var fs = module('fs');

function getUserHome(): string {
	return process.env['HOME'] || process.env['HOMEPATH'] || process.env['USERPROFILE'];
}

function getBaseDir(): string {
	return getUserHome() + '/.perf';
}

function getConfigFileLocation(): string {
	return getBaseDir() + '/config.json';
}

function getAccountsFileLocation(): string {
	return getBaseDir() + '/accounts.json';
}

function getDataDirLocation(): string {
	return getBaseDir() + '/data';
}

/*****************
 * CONFIGURATION *
 *****************/

// parse configuration JSON
var confLoc = getConfigFileLocation();
var dataLoc = getDataDirLocation();
var config, configLoaded;
try {
	config = JSON.parse(fs.readFileSync(confLoc, { encoding: 'utf8' }));
	configLoaded = true;
} catch (e) {
	console.error('Error loading configuration: ' + e.message);
	configLoaded = false;
}

/* Returns true if configuration file has been successfully loaded. */
export function isConfigLoaded(): boolean {
	return configLoaded;
}

/* Returns the specified property in the configuration file, if loaded, otherwise returns undefined. */
export function getConfigProp(key: string): any {
	if (configLoaded) return config[key];
	else return null;
}

/* Sets and saves a property in the configuration file, if loaded, and returns true iff the operation was successful. */
export function setConfigProp(key: string, value: any): boolean {
	if (configLoaded) {
		config[key] = val;
		try {
			fs.writeFileSync(confLoc, JSON.stringify(config), {encoding: 'utf8' });
		} catch (e) {
			console.error('Error saving configuration: ' + e.message);
			return false;
		}
		return true;
	} else return false;
}

/********
 * DATA *
 ********/

 function cmp(x, y) { return x > y ? 1 : x < y ? -1 : 0 }

// read data filenames
var dataFilenames = fs.readdirSync(getDataDirLocation())
	// filter to include only files in the format 'yyyy-mm'
	.filter(x => /\d{4}-\d{2}\.json/.test(x))
	// split 'yyyy-mm' into [yyyy, mm]
	.map(x => x.split('-').map(n => parseInt(n)))
	// sort by date
	.sort(x, y => cmp(x[0], y[0]) || cmp(x[1], y[1]))
	// re-parse into strings
	.map(x => x[0].toString() + '-' + x[1].toString());

export function getDataFilenames(): string[] {
	return dataFilenames;
}

// export function getDataFile(filename: string):