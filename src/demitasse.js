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
 * @return {void|Promise<number>}
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

	let testResults = [];

	for (let idx in data) {
		if (! Array.isArray(data[idx])) throwErr(`Row ${idx} is non-array: ${data[idx]}`);
		let row = _.cloneDeep(data[idx]);

		testResults.push(doTest(testFunction, idx, row, opt));
	}

	Promise.all(testResults).then((results) => {

	});

	if (failures.length > 0) throwErr(failures.join('\n'));
}

/**
 * @param {function} testFunction 
 * @param {number} idx 
 * @param {any[]} row 
 * @param {Object.<string,any>} testOpt
 */
function doTest(testFunction, idx, row, testOpt) {
	let expectedResult = row.shift();
	let testRet = testFunction.apply(null, row);
	if (! opt['async']) testRet = Promise.resolve(testRet);

	testRet.then((actualResult) => {
		if (! _.isEqual(expectedResult, actualResult)) {
			let view = {
				'id':       idx,
				'params':   () => row.map(testParamStringValue).join(", "),
				'expected': () => expectedResult.toString(),
				'actual':   () => actualResult.toString()
			};

			let failure = mustache.render(testOpt['template'], view);
			return testOpt['persist'] ? Promise.resolve(failure) : Promise.reject(failure);
		} else {
			return Promise.resolve(null);
		}
	});

	return failure;
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

/**
 * 
 * @param {string} v 
 * @return {string}
 */
function testParamStringValue(v) {
	if (v === null) return '<null>';
	else if (v == undefined) return '<undefined>';
	else if (typeof v === 'object') {
		let sv = '<object>';
		try {
			sv = JSON.stringify(sv);
		} catch(e) {}
	} else {
		return v.toString();
	}
}

function throwErr(msg) { throw new Error(msg); }
function throwUsage() { throw new Error("usage: testAll(function, function)"); }

module.exports = Demitasse;