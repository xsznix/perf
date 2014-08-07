var cli = require('./cli'),
	crypto = require('./crypto'),
	fs = require('fs'),
	io = require('./io'),
	util = require('./util');

var unreadyMsg = 'Please run `perf init` before calling any further commands.';
var accountsUnloadedMsg = 'Could not find accounts.json. Please put it into ~/.perf/accounts.json or run `perf init` to start over;';

function verifyConfigLoaded() {
	if (!io.isConfigLoaded())
		throw new Error(unreadyMsg);
	else
		util.setCurrencySymbol(io.getConfig().currencySymbol);
}

function verifyAccountsLoaded() {
	if (!io.isAccountsLoaded())
		throw new Error(accountsUnloadedMsg);
}

var commands = {
	'add-account': {
		id: 'add-account',
		options: {},
		usage: 'add-account [id] [initial-balance = 0]\n' +
			'    Adds an account with identifier [id]',
		exec: function(args, opts) {
			verifyConfigLoaded();
			verifyAccountsLoaded();
			if (args.length < 1 || args.length > 2)
				return this.usage;

			var id = args[0];
			var initBalance = args[1] ? util.parseCurr(args[1]) : 0;

			var accounts = io.getAccounts();
			// TODO: read all data files and set currentBalance according to deltas
			// in case the account has transactions on it (maybe it was previously deleted?).
			accounts.accounts[id] = {
				id: id,
				initialBalance: initBalance,
				currentBalance: initBalance
			};
			io.writeAccounts(accounts);
		}
	},

	'rm-account': {
		id: 'rm-account',
		options: {
			del: {
				id: 'del',
				match: ['-D', '--delete'],
				arity: 0
			}
		},
		usage: 'rm-account [id] (-D or --delete)\n' +
			'    -D  irrevocably deletes all transactions under the account from\n' +
			'        disk. If not specified, it simply hides all transactions under\n' +
			'        the account. Adding an account with the same identifier at a\n' +
			'        later time will restore the hidden transactions into view.',
		exec: function(args, opts) {
			verifyConfigLoaded();
			verifyAccountsLoaded();
			if (args.length != 1)
				return this.usage;

			var id = args[0];
			var del = !!opts.del;

			var accounts = io.getAccounts();
			if (!accounts.accounts[id])
				return 'Could not find account \'' + id + '\'';
			delete accounts.accounts[id];
			io.writeAccounts(accounts);

			if (!del) return;

			// -D was specified; iterate through data files and delete any information about the account.
			var dataFilenames = io.getDataFilenames();
			dataFilenames.forEach(function (filename) {
				var data = io.readDataFile(filename), modified = false;

				for (var key in data.transactions) {
					var tx = data.transactions[key];
					// delete delta for account if present
					if (tx.delta[id]) {
						modified = true;
						delete tx.delta[id];
						// delete transaction if no more deltas
						if (!Object.keys(tx.delta).length)
							delete data.transactions[key];
					}
				}

				if (modified) io.writeDataFile(filename, data);
			})
		}
	},

	'mod-account': {
		id: 'mod-account',
		options: {
			name: {
				id: 'name',
				match: ['-n', '--name'],
				arity: 1
			},
			initBal: {
				id: 'initBal',
				match: ['-i', '--initial-balance', '--initialBalance'],
				arity: 1
			}
		},
		usage: 'mod-account [id] (-n or --name [new id]) (-i or --initial-balance [bal])\n' +
			'    Changes the properties of an existing account.',
		exec: function(args, opts) {
			verifyConfigLoaded();
			verifyAccountsLoaded();
			if (args.length != 1)
				return this.usage;

			var id = args[0];
			var modName = !!opts.name;
			var modInitBal = !!opts.initBal;

			if(!(modName || modInitBal)) return;

			var accounts = io.getAccounts();
			if (!accounts.accounts[id])
				return 'Could not find account \'' + id + '\'';
			if (modName) {
				accounts.accounts[id].id = opts.name[0][0];
				accounts.accounts[opts.name[0][0]] = accounts.accounts[id];
				delete accounts.accounts[id];
			} if (modInitBal) {
				var newInitBal = util.parseCurr(opts.initBal);
				var balChange = newInitBal - accounts.accounts[id].initialBalance;
				accounts.accounts[id].initialBalance = newInitBal;
				accounts.accounts[id].currentBalance += balChange;
			}
			io.writeAccounts(accounts);
		}
	},

	'init': {
		id: 'init',
		options: {
			dataPath: {
				id: 'dataPath',
				match: ['-d', '--data-directory', '--dataDirectory'],
				arity: 1
			},
			keyPath: {
				id: 'keyPath',
				match: ['-k', '--key-file', '--keyFile'],
				arity: 1
			},
			key: {
				id: 'key',
				match: ['-K', '--key'],
				arity: 1
			},
			currSym: {
				id: 'currSym',
				match: ['-c', '--currency-symbol', '--currencySymbol'],
				arity: 1
			}
		},
		usage: 'init (-d or --data-directory [data directory]) (-k or --key-file [key file])\n' +
		    '        (-c or --currency-symbol [currency symbol]) (-K or --key [key])\n' +
		    '    Displays a first-use guide for setting up perf.\n' +
		    '        -d  saves the data directory in [data directory] instead of the\n' +
		    '            default directory.\n' +
		    '        -k  saves the encryption/decryption key in [key file]\n' +
		    '        -c  sets the currency symbol (for example, the $ in $1234.00).\n' +
		    '            Default is \'$\'.\n' +
		    '        -K  sets the encryption/decryption key manually',
		exec: function(args, opts) {
			if (args.length)
				return this.usage;
			var config = io.getDefaultConfiguration();
			var accounts = io.getDefaultAccountsFile();
			var key;

			if (opts.dataPath)
				config.dataPath = opts.dataPath[0][0];

			if (opts.keyPath)
				config.keyPath = opts.keyPath[0][0];

			if (opts.key)
				key = opts.key[0][0];
			else
				key = crypto.generateKey();

			if (opts.currSym)
				config.currencySymbol = opts.currSym[0][0];

			try {
				fs.mkdirSync(io.getBaseDir());
			} catch (e) {
				if (e.message.indexOf('EEXIST') === -1) throw e;
			}
			try {
				fs.mkdirSync(config.dataPath);
			} catch (e) {
				if (e.message.indexOf('EEXIST') === -1) throw e;
			}

			io.writeConfig(config);
			io.writeAccounts(accounts);
			io.writeKey(key);
		}
	}
}

var dispatcher = new cli.Dispatcher(commands);

result = dispatcher.dispatch(process.argv.slice(2));
if (result) console.log(result);