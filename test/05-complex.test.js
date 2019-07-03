'use strict';
const assert = require('simple-assert');
const testAll = require('../index');

describe("Complex Data", () => {
	it("Objects OK", () => {
		let testData = () => [[45, { a: 40 }, { b: 5 }]];

		let testFunc = (o1, o2) => {
			return o1.a + o2.b;
		};

		testAll(testData, testFunc);
	});

	it("Objects FAIL [verbose]", () => {
		let testData = () => [[45, { a: 40 }, { b: 5 }]];

		let testFunc = (o1, o2) => {
			return o1.a * o2.b;
		};

		try {
			testAll(testData, testFunc, { 'verbose': true });
			throw new Error("<should have thrown>");
		} catch(e) {
			assert(e.message = '[Test #0][{"a":40}, {"b":5}] Expected: 45, Actual: 200');
		}
	});
});
