'use strict';
const assert = require('simple-assert');

describe("Baseline", () => {
	it("Parse OK", () => {
		const dmt = require('../index');
		assert(typeof dmt === 'function');
	});

	context("Bootstrap Logic", () => {
		const dmt = require('../index');

		it("Adding Machine", () => {
			const data = () => {
				var tests = [];
				
				// Make some tests :)
				for (let i = 0; i < 1000; i++) {
					var a = Math.floor(Math.random() * 1000) + 1;
					var b = Math.floor(Math.random() * 1000) + 1;

					tests.push([ a+b, a, b ]);
				}

				return tests;
			}

			dmt(data, (v1, v2) => v1 + v2);
		});
	});
});