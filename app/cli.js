'use strict';

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

// commands is a hash map mapping strings to Command objects, where the string key is the name
// of the command that the user types in to execute it.
exports.Dispatcher = function Dispatcher(commands) {
	this.commands = commands;

	// Returns undefined if no error has occurred, otherwise returns error message.
	this.dispatch = function dispatch(args) {
		// noop
		if (!args.length) return;

		// find command
		var command = this.commands[args[0]];
		if (typeof command === 'undefined' || command === null)
			return 'Unknown command: ' + args[0];

		// read arguments sequentially
		var arg, commandArgs = [], options = {}, isInOption = false, currOption, currOptionName, optionArgumentIndex;
		for (var i = 1; i < args.length; i++) {
			arg = args[i];

			// check if the user is asking for help
			if (arg === '-h' || arg === '--help') {
				return command.usage;
			}
			// check if the argument is an option
			else if (command.options[arg]) {
				// option arity mismatch
				if (isInOption && currOption.arity !== optionArgumentIndex + 1) {
					return 'Expected ' + currOption.arity + ' arguments for `' + currOptionName +
						'` but got ' +  (optionArgumentIndex + 1).toString() + ' instead.\n' + command.usage;
				}
				// treat the argument as an option and start parsing subsequent parameters
				else {
					isInOption = true;
					currOption = command.options[arg];
					currOptionName = arg;
					optionArgumentIndex = 0;
					options[currOption] = [];
				}
			}
			// otherwise, check if the argument should be a parameter to an option
			else if (isInOption && currOption.arity >= optionArgumentIndex) {
				options[currOption].push(arg);
				optionArgumentIndex++;
			}
			// otherwise, treat the argument as an argument to the command
			else {
				isInOption = false;
				commandArgs.push(arg);
			}
		}

		// call the command
		try {
			command.exec(commandArgs, options);
		} catch (e) {
			return e.message;
		}
	}
}