'use strict';
const assert = require('simple-assert');
const testAll = require('../index');

describe("Complex Data", () => {
	let testFunc = (o1, o2) => {
		return { a: o1.a*2, b: o2.b*2 };
	};

	it("Objects OK", () => {
		let testData = () => [[{a: 80, b: 10}, { a: 40 }, { b: 5 }]];
		testAll(testData, testFunc);
	});

	it("Objects FAIL [verbose]", () => {
		let testData = () => [[{ c: 1 }, { a: 40 }, { b: 5 }]];

		try {
			testAll(testData, testFunc, { 'verbose': true });
			throw new Error("<should have thrown>");
		} catch(e) {
			assert(e.message === '[Test #0][{"a":40}, {"b":5}] Expected: {"c":1}, Actual: {"a":80,"b":10}', e.message);
		}
	});
});
