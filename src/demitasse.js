'use strict';
const assert = require('simple-assert');
const _ = require('lodash');

/**
 * @param {function(): any[][]} dataProviderFunction
 * @param {function(...): any} testFunction
 * @return {Promise<boolean>}
 */
function Demitasse(dataProviderFunction, testFunction) {
	if (typeof dataProviderFunction !== 'function') throwUsage();
	if (typeof testFunction !== 'function') throwUsage();

	var data = dataProviderFunction();
	if (! Array.isArray(data)) throwErr(`Result of ${dataProviderFunction.name} is non-array`);

	for (let idx in data) {
		if (! Array.isArray(data[idx])) throwErr(`Row ${idx} is non-array: ${data[idx]}`);
		var row = _.cloneDeep(data[idx]);
		var expectedResult = row.shift();
		var actualResult = testFunction.apply(this, row);
		if (! _.isEqual(expectedResult, actualResult)) {
			throwErr(`[Row ${idx}] Expected: ${expectedResult.toString()}, Actual: ${actualResult.toString()}`);
		}
	}
}

function throwErr(msg) { throw new Error(msg); }
function throwUsage() { throw new Error("usage: itAlways(function, function)"); }

module.exports = Demitasse;