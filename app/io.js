'use strict';

var fs = module('fs');
var crypto = module('./crypto');

function getUserHome() {
    return process.env['HOME'] || process.env['HOMEPATH'] || process.env['USERPROFILE'];
}

function getBaseDir() {
    return getUserHome() + '/.perf';
}

function getConfigFileLocation() {
    return getBaseDir() + '/config.json';
}

function getAccountsFileLocation() {
    return getBaseDir() + '/accounts.json';
}

function getDataDirLocation() {
    return getBaseDir() + '/data';
}

/*****************
* CONFIGURATION *
*****************/
// parse configuration JSON
var confLoc = getConfigFileLocation();
var dataLoc = getDataDirLocation();
var config, configLoaded;
try  {
    config = JSON.parse(fs.readFileSync(confLoc, { encoding: 'utf8' }));
    configLoaded = true;
} catch (e) {
    console.error('Error loading configuration: ' + e.message);
    configLoaded = false;
}

/* Returns true if configuration file has been successfully loaded. */
exports.isConfigLoaded = function isConfigLoaded() {
    return configLoaded;
};

/* Returns the specified property in the configuration file, if loaded, otherwise returns undefined. */
exports.getConfigProp = function getConfigProp(key) {
    if (configLoaded)
        return config[key];
    else
        return null;
};

/* Sets a property in the configuration file, if loaded, and returns true iff the operation was successful. */
exports.setConfigProp = function setConfigProp(key, value) {
    if (configLoaded) {
        config[key] = val;
        return true;
    } else
        return false;
}

/* Saves the current in-memory configuration to disk and returns true iff the operation was successful. */
exports.flushConfig = function flushConfig() {
    if (configLoaded) {
        try  {
            fs.writeFileSync(confLoc, JSON.stringify(config), { encoding: 'utf8' });
        } catch (e) {
            console.error('Error saving configuration: ' + e.message);
            return false;
        }
        return true;
    } else
        return false;
}

/********
* DATA *
********/
function cmp(x, y) { return x > y ? 1 : x < y ? -1 : 0; }
function parseInt10(n) { return parseInt(n, 10); }

// read data filenames and sort by year then month
var dataFilenames = fs.readdirSync(getDataDirLocation()
    .filter(function (x) { return /\d{4}-\d{2}\.json/.test(x); })
    .map(function (x) { return x.split('-').map(parseInt10); })
    .sort(x, function (y) { return cmp(x[0], y[0]) || cmp(x[1], y[1]); })
    .map(function (x) { return x[0].toString() + '-' + x[1].toString(); });

exports.getDataFilenames = function getDataFilenames() {
    return dataFilenames;
};

