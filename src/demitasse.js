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
		let tres = doTest(testFunction, idx, row, opts);
		testResults.push(tres);
		if (tres !== null && !opts['persist'] && !opts['async']) break;
	}

	var failures = [];
	if (! opts['async']) {
		for (let fail of testResults) if (fail) failures.push(fail);
		if (failures.length > 0) throwErr(failureString(failures));

		return;
	}

	var waiting = testResults.length;

	return new Promise(async (resolve, reject) => {
		/** @todo handle "non-persist" mode */
		for (let p of testResults) {
			var rv = await p();
			// console.log('rv = ', rv);
			waiting--;
			if (rv !== null) failures.push(rv);
			if (waiting === 0 && !failures.length) resolve(testResults.length);
			else if (waiting === 0) reject(new Error(failureString(failures)));
			else if (failures.length > 0 && !opts['persist']) {
				reject(new Error(failureString(failures)));
				break;
			}
		}
	});
}

/**
 * @param {function} testFunction
 * @param {number} idx
 * @param {any[]} row
 * @param {Object.<string,any>} testOpt
 * @return {null|string|function}
 */
function doTest(testFunction, idx, row, testOpt) {
	let expectedResult = row.shift();
	let testRet = testFunction.apply(null, row);

	let l_idx = idx;
	if (! testOpt['async']) {
		return testEvaluate(expectedResult, testRet, l_idx, row, testOpt['template']);
	}

	return () => {
		return testRet.then((actualResult) => {
			var tev = testEvaluate(expectedResult, actualResult, l_idx, row, testOpt['template']);
			return Promise.resolve(tev);
		});
	};
}

/**
 *
 * @param {any} expectedResult
 * @param {any} actualResult
 * @param {number} idx
 * @param {any[]} row
 * @param {string} errTemplate
 * @return {null|string}
 */
function testEvaluate(expectedResult, actualResult, idx, row, errTemplate) {
	if (! _.isEqual(expectedResult, actualResult)) {
		let view = {
			'id':       idx,
			'params':   () => row.map(testParamStringValue).join(", "),
			'expected': () => testParamStringValue(expectedResult),
			'actual':   () => testParamStringValue(actualResult)
		};

		return mustache.render(errTemplate, view);
	} else return null;
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
			sv = JSON.stringify(v);
		} catch(e) {
			// couldn't stringify 
		}
		return sv;
	} else {
		return v.toString();
	}
}

function failureString(arr) {
	let fs = arr.join('\n');

	if (arr.length === 1) return fs;

	// add a leading newline when we have multiple failures so it looks better in mocha
	return `\n${fs}`;
};

function throwErr(msg) { throw new Error(msg); }
function throwUsage() { throw new Error("usage: testAll(function, function)"); }

module.exports = Demitasse;