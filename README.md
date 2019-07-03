# mocha-demitasse: Data-Driven Testing Lite

## Abstract

`mocha-demitasse` is a super-lite testing-adjacent module for doing data-driven tests in `mocha`. Typically, this sort of structure would have to be manually created as a `for` loop or something similar within _each_ unit test to provide a similar interface, and then one would have to draft the specific behaviors as additional conditionals.

It has `async` testing support with nearly the same interface. There are also a small number of tunable options to easily change the behavior of a particular test cycle to meet specific needs.

```js
const testEvery = require('mocha-demitasse');

/** 
 * Function => any[][] provides the data for
 * each test iteration: the 1st value is the
 * "result" and the remaining elements are what
 * are passed to the test function.
 */
const dataProvider = () => [
	[3, 1, 2],
	[5, 2, 3],
	[10, 5, 5]
];

// Sum the two values and return
const testFunction = (v1, v2) => v1+v2
testEvery(dataProvider, testFunction); // 3

const badTestFunction = (v1, v2) => v1-v2
testEvery(dataProvider, badTestFunction); // throws Error: "[Test #0] Expected: 3, Actual: -1"
```

## Syntax

```
mochaDemitasse(
	function(): any[][], // dataProvider
	function(...),       // testFunction
	[options]: Object.<string,any> // options

mochaDemitasse.async(
	function(): any[][], // dataProvider
	function(...),       // testFunction
	[options]: Object.<string,any> // options	
);

```


## Options
- `verbose` (default `false`): Upon a failure, include the data elements that triggered the failure in the message.
- `persist` (default: `false`): Continue w/ the test cycle even if you encounter a failure and bundle all failures together into a single message (separated by `\n`'s).
- _[Advanced]_ `template` (default: ...): Customize the `mustache`-driven failure message template. (Spec docs TBA)
- _[Advanced]_ `async` (default: `false`): Force async mode (better to use the `.async()` method.)


## Authors

- Corey Sharrah <corey@eviltreehouse.com> [@invayn3](https://twitter.com/invayn3)