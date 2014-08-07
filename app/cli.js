'use strict';

var fs = require('fs');

/*

interface Command {
	options: HashMay<string, Option>;
	usage: string;
	exec: (arguments: string[], options: Object) => void;
}
interface Option {
	match: string[];
	arity: number;
}

*/

function eachKey(obj, callback) {
	for (var k in obj)
		if (Object.prototype.hasOwnProperty.call(obj, k))
			callback.call(obj, obj[k]);
}

// commands is a hash map mapping strings to Command objects, where the string key is the name
// of the command that the user types in to execute it.
exports.Dispatcher = function Dispatcher(commands) {
	this.commands = commands;

	// parse all strings that would match an option
	var cmdOptMatches = {};
	eachKey(commands, function (command) {
		cmdOptMatches[command.id] = new Object();
		eachKey(command.options, function (option) {
			option.match.forEach(function(str) {
				cmdOptMatches[command.id][str] = option.id;
			});
		});
	});

	// Returns undefined if no error has occurred, otherwise returns error message.
	this.dispatch = function dispatch(args) {
		// noop
		if (!args.length) return;

		// find command
		var cmdName = args[0], command = this.commands[cmdName];
		if (cmdName === 'help' || cmdName === '--help')
			return fs.readFileSync(__dirname + '/../doc/help.txt', { encoding: 'utf8' });
		if (cmdName === '-v' || cmdName === '--version')
			return 'perf v0.0.0';
		if (typeof command === 'undefined' || command === null)
			return 'Unknown command: ' + args[0];

		// read arguments sequentially
		var arg, commandArgs = [], options = {}, isInOption = false, currOption, currOptionName, optionArgumentIndex,
			isDebug = false, isDryRun = false;
		function checkArityMismatch() {
			if (isInOption && currOption.arity !== optionArgumentIndex)
				throw new Error('Expected ' + currOption.arity + ' arguments for `' + currOptionName +
					'` but got ' +  optionArgumentIndex.toString() + ' instead.\n' + command.usage);
		}
		for (var i = 1; i < args.length; i++) {
			arg = args[i];

			// check if the user is asking for help and other builtin options
			if (arg === '-h' || arg === '--help') {
				return command.usage;
			}
			else if (arg === '--debug') {
				isDebug = true;
			}
			else if (arg === '--dry' || arg === '--dry-run' || arg === '--dryRun') {
				isDryRun = true;
			}
			// check if the argument is an option
			else if (cmdOptMatches[cmdName][arg]) {
				checkArityMismatch();
				// treat the argument as an option and start parsing subsequent parameters
				isInOption = true;
				currOption = command.options[cmdOptMatches[cmdName][arg]];
				currOptionName = arg;
				optionArgumentIndex = 0;
				if (!options[currOption.id])
					options[currOption.id] = [[]];
				else
					options[currOption.id].push([]);
			}
			// otherwise, check if the argument should be a parameter to an option
			else if (isInOption && currOption.arity > optionArgumentIndex) {
				options[currOption.id][options[currOption.id].length - 1].push(arg);
				optionArgumentIndex++;
			}
			// otherwise, treat the argument as an argument to the command
			else {
				isInOption = false;
				commandArgs.push(arg);
			}
		}

		checkArityMismatch();

		// print out arguments and options if debug is specified
		if (isDebug) {
			console.log('Command: ' + cmdName);
			console.log('Arguments:');
			console.dir(commandArgs);
			console.log('Options:');
			console.dir(options);
		}

		if (isDryRun) return;

		// call the command
		try {
			return command.exec.call(command, commandArgs, options);
		} catch (e) {
			return e.message;
		}
	}
}