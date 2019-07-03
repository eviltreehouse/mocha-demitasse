'use strict';
const assert = require('simple-assert');

describe("Baseline", () => {
	it("Parse OK", () => {
		const dmt = require('../index');
		assert(typeof dmt === 'function');
	});

	context("Usage", () => {
		const testAll = require('../index');

		it("Blank", () => {
			var threw = null;
			try {
				testAll();
			} catch(e) {
				threw = e.message;
			}

			assert(threw && threw.match(/^usage\:/));
		});

		it("Bad data provider", () => {
			var threw = null;
			try {
				testAll([[1,2,1],[2,1,2]], function(){});
			} catch(e) {
				threw = e.message;
			}

			assert(threw && threw.match(/^usage\:/));
		});

		it("Bad tester", () => {
			var threw = null;
			try {
				testAll(function(){}, true);
			} catch(e) {
				threw = e.message;
			}

			assert(threw && threw.match(/^usage\:/));
		});
	});

	context("Bootstrap Logic", () => {
		const testAll = require('../index');

		it("Adding Machine = SUCCESS", () => {
			const data = () => {
				var tests = [];

				// Dynamically make some tests
				for (let i = 0; i < 1000; i++) {
					var a = Math.floor(Math.random() * 1000) + 1;
					var b = Math.floor(Math.random() * 1000) + 1;

					tests.push([ a+b, a, b ]);
				}

				return tests;
			}

			testAll(data, (v1, v2) => v1 + v2);
		});

		it("Bad result = FAIL", () => {
			const data = [
				[2, 1, 1],
				[3, 1, 1], //fail
				[5, 3, 3]  //fail
			];

			var threw = null;
			try {
				testAll(() => data, (v1, v2) => v1 + v2);
			} catch(e) {
				threw = e;
			}

			assert(threw !== null);
			assert(threw.message === '[Test #1] Expected: 3, Actual: 2', threw.message);
		});

		it("Bad result = FAIL (verbose)", () => {
			const data = [
				[2, 2, 1]
			];

			var threw = null;
			try {
				testAll(() => data, (v1, v2) => v1 + v2, { 'verbose': true });
			} catch(e) {
				threw = e;
			}

			assert(threw !== null);
			assert(threw.message === '[Test #0][2, 1] Expected: 2, Actual: 3', threw.message);
		});		

		it("Bad result = PERSIST", () => {
			const data = [
				[2, 1, 1],
				[3, 1, 1], //fail
				[5, 3, 3]  //fail
			];

			var threw = null;
			try {
				testAll(() => data, (v1, v2) => v1 + v2, { 'persist': true });
			} catch(e) {
				threw = e;
			}

			assert(threw !== null);
			assert(threw.message === 
				'\n[Test #1] Expected: 3, Actual: 2\n[Test #2] Expected: 5, Actual: 6', threw.message);
		});
	});
});