'use strict';

const assert = require('simple-assert');
const testAll = require('../index');

describe("Async", () => { 
	it("Handles async = SUCCESS", async () => {
		const testData = [
			[20, 5, 4],
			[25, 5, 5],
			[36, 6, 6]
		];

		const testFunc = (v1, v2) => {
			// pretend it takes a while to run this product calc
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(v1*v2);
				}, 100);
			});
		}

		const numTests = await testAll.async(() => testData, testFunc);
		assert(numTests === 3, 'not all tests ran');
	});

	it("Handles async = FAIL", async () => {
		const testData = [
			[20, 5, 4],
			[26, 5, 5],
			[36, 6, 6]
		];

		const testFunc = (v1, v2) => {
			// pretend it takes a while to run this product calc
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(v1*v2);
				}, 100);
			});
		}

		try {
			const rv = await testAll.async(() => testData, testFunc);
			throw new Error("<Should have rejected!>");
		} catch(err) {
			assert(err.message === '[Test #1] Expected: 26, Actual: 25', err.message);
		}
	});
	
	xit("Handles async (non-persist) FAIL");
});