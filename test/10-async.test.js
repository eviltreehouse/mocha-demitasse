'use strict';

const assert = require('simple-assert');
const testAll = require('../index');

it("Handles async = SUCCESS", () => {
	const testData = [
		[4, 5, 20],
		[5, 5, 25],
		[6, 6, 36]
	];

	const testFunc = (v1, v2) => {
		// pretend it takes a while to run this product calc
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(v1*v2);
			}, 100);
		});
	}

	return testAll.async(() => testData, testFunc);
});