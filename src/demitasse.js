'use strict';
const assert = require('simple-assert');
const _ = require('lodash');
const mustache = require('mustache');

// HTML escaping off
mustache.escape = (v) => v;

const DEFAULT_ERR_TEMPLATE = 
	'[Test #{{ id }}] Expected: {{ expected }}, Actual: {{ actual }}';

const VERBOSE_ERR_TEMPLATE = 
	'[Test #{{ id }}][{{ params }}] Expected: {{ expected }}, Actual: {{ actual }}';

const DEFAULT_OPTS = {
	'async': false,
	'template': null,
	'persist': false,
	'verbose': false
};

/**
 * @param {function(): any[][]} dataProviderFunction
 * @param {function(...): any} testFunction
 * @param {Object.<string,any>} [opts]
 * @return {void}
 */
function Demitasse(dataProviderFunction, testFunction, opts) {
	if (! opts || typeof opts !== 'object') opts = {};
	else opts = _.cloneDeep(opts);

	opts = Object.assign({}, DEFAULT_OPTS, opts);

	if (! opts.template) {
		opts.template = opts.verbose ? VERBOSE_ERR_TEMPLATE : DEFAULT_ERR_TEMPLATE;
	}

	if (typeof dataProviderFunction !== 'function') throwUsage();
	if (typeof testFunction !== 'function') throwUsage();

	let data = dataProviderFunction();
	if (! Array.isArray(data)) throwErr(`Result of ${dataProviderFunction.name} is non-array`);

	let failures = [];
	for (let idx in data) {
		if (! Array.isArray(data[idx])) throwErr(`Row ${idx} is non-array: ${data[idx]}`);
		let row = _.cloneDeep(data[idx]);
		let expectedResult = row.shift();
		let actualResult = testFunction.apply(this, row);

		if (! _.isEqual(expectedResult, actualResult)) {
			let view = {
				'id':       idx,
				'params':   () => row.map(v => v.toString()).join(", "),
				'expected': () => expectedResult.toString(),
				'actual':   () => actualResult.toString()
			};
		
			// throwErr(`[Test #${idx}] Expected: ${expectedResult.toString()}, Actual: ${actualResult.toString()}`);
			failures.push(mustache.render(opts['template'], view));
			if (!opts['persist']) break;
		}
	}

	if (failures.length > 0) throwErr(failures.join('\n'));
}

/**
 * @param {function(): any[][]} dataProviderFunction
 * @param {function(...): any} testFunction
 * @param {Object.<string,any>} [opts]
 * @return {Promise<boolean>}
 * @todo
 */
Demitasse.async = function(dataProviderFunction, testFunction, opts) {
	if (! opts || typeof opts !== 'object') opts = {};
	else opts = _.cloneDeep(opts);
	opts['async'] = true;

	return Demitasse(dataProviderFunction, testFunction, opts);
};

function throwErr(msg) { throw new Error(msg); }
function throwUsage() { throw new Error("usage: testAll(function, function)"); }

module.exports = Demitasse;