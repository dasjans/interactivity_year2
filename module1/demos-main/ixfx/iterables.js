import { __export } from "./chunk-51aI8Tpl.js";
import { integerTest, resultThrow } from "./src-BBD50Kth.js";
import { compareIterableValuesShallow, intervalToMs, isEqualValueIgnoreOrder, toStringDefault } from "./interval-type-DajslxUJ.js";
import { average, continuously, elapsedSince, max, min, promiseFromEvent, rank, sleep, some, sum, tally } from "./basic-D0XoOdBJ.js";
import { isEqual, numberArrayCompute } from "./src-BeVDUOoq.js";

//#region ../iterables/src/guard.ts
const isAsyncIterable = (v) => {
	if (typeof v !== `object`) return false;
	if (v === null) return false;
	return Symbol.asyncIterator in v;
};
const isIterable = (v) => {
	if (typeof v !== `object`) return false;
	if (v === null) return false;
	return Symbol.iterator in v;
};

//#endregion
//#region ../iterables/src/async.ts
var async_exports = {};
__export(async_exports, {
	asCallback: () => asCallback$3,
	chunks: () => chunks$2,
	concat: () => concat$2,
	dropWhile: () => dropWhile$2,
	equals: () => equals$2,
	every: () => every$2,
	fill: () => fill$2,
	filter: () => filter$3,
	find: () => find$2,
	flatten: () => flatten$2,
	forEach: () => forEach$2,
	fromArray: () => fromArray$2,
	fromIterable: () => fromIterable$2,
	last: () => last$2,
	map: () => map$2,
	max: () => max$4,
	min: () => min$4,
	nextWithTimeout: () => nextWithTimeout,
	reduce: () => reduce$3,
	repeat: () => repeat$1,
	slice: () => slice$2,
	some: () => some$3,
	toArray: () => toArray$1,
	unique: () => unique$2,
	uniqueByValue: () => uniqueByValue$2,
	until: () => until$2,
	withDelay: () => withDelay,
	zip: () => zip$2
});
/**
* Yield values from `array`, one at a time.
* Use `interval` to add time between each item.
* The first item is yielded without delay.
* 
* @param array Array of values
* @param interval Interval (defaults: 1ms)
*/
async function* fromArray$2(array$1, interval = 1) {
	for (const v of array$1) {
		yield v;
		await sleep(interval);
	}
}
/**
* Yield values from `iterable`, one at a time.
* Use `interval` to add time between each item.
* The first item is yielded without delay.
* @param iterable Iterable or AsyncIterable
* @param [interval=1] Interval to wait between yield
*/
async function* fromIterable$2(iterable$1, interval = 1) {
	for await (const v of iterable$1) {
		yield v;
		await sleep(interval);
	}
}
async function* chunks$2(it, size) {
	let buffer = [];
	for await (const v of it) {
		buffer.push(v);
		if (buffer.length === size) {
			yield buffer;
			buffer = [];
		}
	}
	if (buffer.length > 0) yield buffer;
}
async function* concat$2(...its) {
	for await (const it of its) yield* it;
}
async function* dropWhile$2(it, f) {
	for await (const v of it) if (!f(v)) yield v;
}
/**
* Loops over a generator until it finishes, calling `callback`.
* Useful if you don't care about the value generator produces, just the number of loops.
* 
* In this version, we do a `for await of` over `gen`, and also `await callback()`. 

* ```js
* await until(count(5), () => {
* // do something 5 times
* });
* ```
* 
* If you want the value from the generator, use a `for of` loop as usual.
* 
* If `callback` explicitly returns _false_, the generator is aborted.
* @param it Generator to run
* @param callback Code to call for each iteration
*/
const until$2 = async (it, callback) => {
	for await (const _ of it) {
		const value = await callback();
		if (typeof value === `boolean` && !value) break;
	}
};
/**
* This generator will repeat another generator up until some condition. This is the version
* that can handle async generators.
* 
* For example, {@link https://api.ixfx.fun/_ixfx/numbers/count/ @ixfx/numbers.count} will count from 0..number and then finish:
* ```js
* import { count } from '@ixfx/numbers'
* for (const v of count(5)) {
*  // v: 0, 1, 2, 3, 4
* }
* ```
* 
* But what if we want to repeat the count? We have to provide a function to create the generator,
* rather than using the generator directly, since it's "one time use"
* ```js
* for await (const v of repeat(() => count(5))) {
*  // v: 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, ...
*  // warning: never ends
* }
* ```
* 
* Limiting the number of repeats can be done by passing in extra parameters
* ```js
* repeat(generator, { count: 5} ); // Iterate over `generator` five times
* ```
* 
* ```js
* const ac = new AbortController();
* repeat(generator, { signal: ac.signal }); // Pass in signal
* ...
* ac.abort(); // Trigger signal at some point
* ```
* @param genCreator 
* @param repeatsOrSignal 
*/
const repeat$1 = async function* (genCreator, repeatsOrSignal) {
	const repeats = typeof repeatsOrSignal === `number` ? repeatsOrSignal : Number.POSITIVE_INFINITY;
	const signal = typeof repeatsOrSignal === `number` ? void 0 : repeatsOrSignal;
	let count = repeats;
	while (true) {
		for await (const v of genCreator()) {
			yield v;
			if (signal?.aborted) break;
		}
		if (Number.isFinite(repeats)) {
			count--;
			if (count === 0) break;
		}
		if (signal?.aborted) break;
	}
};
/**
* Returns true if items in two iterables are equal, as
* determined by the `equality` function.
* Order matters. It compares items at the same 'step' of each iterable.
* @param it1
* @param it2
* @param equality
* @returns
*/
async function equals$2(it1, it2, equality) {
	const iit1 = it1[Symbol.asyncIterator]();
	const iit2 = it2[Symbol.asyncIterator]();
	while (true) {
		const index1 = await iit1.next();
		const index2 = await iit2.next();
		if (equality !== void 0) {
			if (!equality(index1.value, index2.value)) return false;
		} else if (index1.value !== index2.value) return false;
		if (index1.done ?? index2.done) return index1.done && index2.done;
	}
}
async function every$2(it, f) {
	for await (const v of it) {
		const result = await f(v);
		if (!result) return false;
	}
	return true;
}
async function* fill$2(it, v) {
	for await (const _ of it) yield v;
}
/**
* Filters an iterable, only yielding items which match `f`.
*
* ```js
* filter([1, 2, 3, 4], e => e % 2 == 0);
* returns [2, 4]
* ```
* @param it
* @param f
*/
async function* filter$3(it, f) {
	for await (const v of it) {
		if (!await f(v)) continue;
		yield v;
	}
}
async function find$2(it, f) {
	for await (const v of it) if (await f(v)) return v;
}
async function* flatten$2(it) {
	for await (const v of it) if (typeof v === `object`) {
		if (Array.isArray(v)) for (const vv of v) yield vv;
		else if (isAsyncIterable(v)) for await (const vv of v) yield vv;
		else if (isIterable(v)) for (const vv of v) yield vv;
	} else yield v;
}
/**
* Iterates over an async iterable or array, calling `fn` for each value, with optional
* interval between each loop. If the async `fn` returns _false_, iterator cancels.
*
* ```
* import { forEach } from "@ixfx/flow.js"
* // Prints items from array every second
* await forEach([0,1,2,3], i => console.log(i), 1000);
* ```
*
* ```
* // Retry up to five times, with 5 seconds between each attempt
* await forEach(count(5), i=> {
*  try {
*    await doSomething();
*    return false; // Succeeded, exit early
*  } catch (ex) {
*    console.log(ex);
*    return true; // Keep trying
*  }
* }, 5000);
* ```
* @param iterator Iterable thing to loop over
* @param fn Function to invoke on each item. If it returns _false_ loop ends.
* @param options Options
* @typeParam V Type of iterable
*/
const forEach$2 = async function(iterator, fn, options = {}) {
	const interval = options.interval;
	if (Array.isArray(iterator)) for (const x of iterator) {
		const r = await fn(x);
		if (typeof r === `boolean` && !r) break;
		if (interval) await sleep(interval);
	}
	else for await (const x of iterator) {
		const r = await fn(x);
		if (typeof r === `boolean` && !r) break;
		if (interval) await sleep(interval);
	}
};
/**
* Returns last value from an iterable, or _undefined_
* if no values are generated
* @param it
*/
async function last$2(it, opts = {}) {
	const abort = opts.abort;
	let returnValue;
	for await (const value of it) {
		if (abort?.aborted) return void 0;
		returnValue = value;
	}
	return returnValue;
}
/**
* Maps an iterable through function `f`
* ```js
* // For every input value, multiply it by itself
* map([1, 2, 3], e => e*e)
* // Yields: 1, 4, 9
* ```
* 
* It can also be used to transform types:
* ```js
* map([1, 2, 3], e => { value: e });
* // Yields: { value: 1 }, { value: 2 }, { value: 3 }
* ```
* @param it
* @param f
*/
async function* map$2(it, f) {
	for await (const v of it) yield f(v);
}
async function* max$4(it, gt = ((a, b) => a > b)) {
	let max$5;
	for await (const v of it) {
		if (max$5 === void 0) {
			max$5 = v;
			yield max$5;
			continue;
		}
		if (gt(v, max$5)) {
			max$5 = v;
			yield v;
		}
	}
}
/**
* Returns the minimum seen of an iterable as it changes.
* Streaming result: works with endless iterables.
* 
* Note that `gt` function returns true if A is _greater_ than B, even
* though we're looking for the minimum.
* 
* ```js
* // Rank objects based on 'v' value
* const rank = (a,b) => a.v > b.v;
* min([
*  {i:0,v:1},
*  {i:1,v:9},
*  {i:2,v:-2}
* ], rank);
* // Yields: {i:2, v:1}, {i:2,v:-2}
* ```
* @param it Iterable
* @param gt Should return _true_ if `a` is greater than `b`.
* @returns
*/
async function* min$4(it, gt = (a, b) => a > b) {
	let min$5;
	for await (const v of it) {
		if (min$5 === void 0) {
			min$5 = v;
			yield min$5;
			continue;
		}
		if (gt(min$5, v)) {
			min$5 = v;
			yield v;
		}
	}
	return min$5;
}
async function reduce$3(it, f, start) {
	for await (const v of it) start = f(start, v);
	return start;
}
/**
* Calls `callback` whenever the async generator produces a value.
* 
* When using `asCallback`, call it with `await` to let generator 
* run its course before continuing:
* ```js
* await asCallback(tick({ interval:1000, loops:5 }), x => {
*  // Gets called 5 times, with 1000ms interval
* });
* console.log(`Hi`); // Prints after 5 seconds
* ```
* 
* Or if you skip the `await`, code continues and callback will still run:
* ```js
* asCallback(tick({ interval: 1000, loops: 5}), x => {
*  // Gets called 5 times, with 1000ms interval
* });
* console.log(`Hi`); // Prints immediately
* ```
* @param input 
* @param callback 
*/
async function asCallback$3(input, callback, onDone) {
	for await (const value of input) callback(value);
	if (onDone) onDone();
}
async function* slice$2(it, start = 0, end = Number.POSITIVE_INFINITY) {
	console.log(`Async slice start: ${start}`);
	const iit = it[Symbol.asyncIterator]();
	if (end < start) throw new Error(`Param 'end' should be more than 'start'`);
	for (; start > 0; start--, end--) await iit.next();
	for await (const v of it) if (end-- > 0) yield v;
	else break;
}
/**
* Enumerates over an input iterable, with a delay between items.
* @param it 
* @param delay 
*/
async function* withDelay(it, delay$1) {
	for (const v of it) {
		await sleep(delay$1);
		yield v;
	}
}
/***
* Returns the next IteratorResult,
* throwing an error if it does not happen
* within `interval` (default: 1s)
*/
async function nextWithTimeout(it, options) {
	const ms = intervalToMs(options, 1e3);
	const value = await Promise.race([(async () => {
		await sleep({
			millis: ms,
			signal: options.signal
		});
		return void 0;
	})(), (async () => {
		return await it.next();
	})()]);
	if (value === void 0) throw new Error(`Timeout`);
	return value;
}
async function some$3(it, f) {
	for await (const v of it) if (await f(v)) return true;
	return false;
}
/**
* Returns an array of values from an iterator.
*
* ```js
* const data = await toArray(adsrIterable(opts, 10));
* ```
*
* Note: If the iterator is infinite, be sure to provide limits via the options.
* ```js
* // Return maximum five items
* const data = await toArray(iterable, { limit: 5 });
* // Return results for a maximum of 5 seconds
* const data = await toArray(iterable, { elapsed: 5000 });
* ```
* Note that limits are ORed, `toArray` will finish if either of them is true.
* 
* @param it Asynchronous iterable
* @param options Options when converting to array
* @returns
*/
async function toArray$1(it, options = {}) {
	const result = [];
	const iterator = it[Symbol.asyncIterator]();
	const started = Date.now();
	const maxItems = options.limit ?? Number.POSITIVE_INFINITY;
	const whileFunction = options.while;
	const maxElapsed = intervalToMs(options.elapsed, Number.POSITIVE_INFINITY);
	while (result.length < maxItems && Date.now() - started < maxElapsed) {
		if (whileFunction) {
			if (!whileFunction(result.length)) break;
		}
		const r = await iterator.next();
		if (r.done) break;
		result.push(r.value);
	}
	return result;
}
async function* unique$2(iterable$1) {
	const buffer = [];
	const itera = Array.isArray(iterable$1) ? iterable$1 : [iterable$1];
	for await (const it of itera) for await (const v of it) {
		if (buffer.includes(v)) continue;
		buffer.push(v);
		yield v;
	}
}
async function* uniqueByValue$2(input, toString = toStringDefault, seen = /* @__PURE__ */ new Set()) {
	for await (const v of input) {
		const key = toString(v);
		if (seen.has(key)) continue;
		seen.add(key);
		yield v;
	}
}
/**
* Returns unique items from iterables, given a particular key function
* ```js
* unique([{i:0,v:2},{i:1,v:3},{i:2,v:2}], e => e.v);
* Yields:  [{i:0,v:2},{i:1,v:3}]
* @param it
* @param f
*/
/**
* Combine same-positioned items from several iterables
* ```js
* zip( [1, 2, 3], [4, 5, 6], [7, 8, 9] );
* Yields: [ [1, 4, 7], [2, 5, 8], [3, 6, 9] ]
* ```
* @param its
* @returns
*/
async function* zip$2(...its) {
	const iits = its.map((it) => it[Symbol.asyncIterator]());
	while (true) {
		const vs = await Promise.all(iits.map((it) => it.next()));
		if (vs.some((v) => v.done)) return;
		yield vs.map((v) => v.value);
	}
}

//#endregion
//#region ../iterables/src/sync/slice.ts
function* slice$1(it, start = 0, end = Number.POSITIVE_INFINITY) {
	if (end < start) throw new Error(`Param 'end' should be more than 'start'`);
	if (start < 0) throw new Error(`Param 'start' should be at least 0`);
	let index = 0;
	for (const v of it) {
		if (index < start) {
			index++;
			continue;
		}
		if (index > end) break;
		yield v;
		index++;
	}
}

//#endregion
//#region ../iterables/src/sync/reduce.ts
function reduce$2(it, f, start) {
	for (const v of it) start = f(start, v);
	return start;
}

//#endregion
//#region ../iterables/src/sync.ts
var sync_exports = {};
__export(sync_exports, {
	asCallback: () => asCallback$2,
	chunks: () => chunks$1,
	chunksOverlapping: () => chunksOverlapping,
	concat: () => concat$1,
	dropWhile: () => dropWhile$1,
	equals: () => equals$1,
	every: () => every$1,
	fill: () => fill$1,
	filter: () => filter$2,
	find: () => find$1,
	first: () => first,
	flatten: () => flatten$1,
	forEach: () => forEach$1,
	fromArray: () => fromArray$1,
	fromIterable: () => fromIterable$1,
	last: () => last$1,
	map: () => map$1,
	max: () => max$3,
	min: () => min$3,
	next: () => next,
	reduce: () => reduce$2,
	repeat: () => repeat,
	slice: () => slice$1,
	some: () => some$2,
	toArray: () => toArray$2,
	unique: () => unique$1,
	uniqueByValue: () => uniqueByValue$1,
	until: () => until$1,
	yieldNumber: () => yieldNumber,
	zip: () => zip$1
});
function* uniqueByValue$1(input, toString = toStringDefault, seen = /* @__PURE__ */ new Set()) {
	for (const v of input) {
		const key = toString(v);
		if (seen.has(key)) continue;
		seen.add(key);
		yield v;
	}
}
/**
* Calls `callback` whenever the generator produces a value.
* 
* When using `asCallback`, call it with `await` to let generator 
* run its course before continuing:
* ```js
* await asCallback(tick({ interval:1000, loops:5 }), x => {
*  // Gets called 5 times, with 1000ms interval
* });
* console.log(`Hi`); // Prints after 5 seconds
* ```
* 
* Or if you skip the `await`, code continues and callback will still run:
* ```js
* asCallback(tick({ interval: 1000, loops: 5}), x => {
*  // Gets called 5 times, with 1000ms interval
* });
* console.log(`Hi`); // Prints immediately
* ```
* @param input 
* @param callback 
*/
function asCallback$2(input, callback, onDone) {
	for (const value of input) callback(value);
	if (onDone) onDone();
}
/**
* Returns a function that yields a value from a generator.
* ```js
* const spring = yieldNumber(Oscillators.spring());
*
* spring(); // latest value
* ```
*
* Instead of:
* ```js
* const spring = Oscillators.spring();
*
* spring.next().value
* ```
*
* A `defaultValue` can be provided if the source generator returns undefined:
* ```js
* const spring = yieldNumber(Oscillators.spring(), 0);
* spring(); // Returns 0 if the generator returns undefined
* ```
* @param generator
* @param defaultValue
* @returns
*/
function yieldNumber(generator, defaultValue) {
	return () => {
		const v = generator.next().value;
		if (v === void 0) return defaultValue;
		return v;
	};
}
/**
* Return first value from an iterable, or _undefined_ if
* no values are generated
* @param it
* @returns
*/
function first(it) {
	for (const value of it) return value;
}
/**
* Returns last value from an iterable, or _undefined_
* if no values are generated
* @param it
*/
function last$1(it) {
	let returnValue;
	for (const value of it) returnValue = value;
	return returnValue;
}
/**
* Yields chunks of the iterable `it` such that the end of a chunk is the
* start of the next chunk.
*
* Eg, with the input [1,2,3,4,5] and a size of 2, we would get back
* [1,2], [2,3], [3,4], [4,5].
*
*
* @param it
* @param size
* @returns
*/
function* chunksOverlapping(it, size) {
	if (size <= 1) throw new Error(`Size should be at least 2`);
	let buffer = [];
	for (const v of it) {
		buffer.push(v);
		if (buffer.length === size) {
			yield buffer;
			buffer = [buffer.at(-1)];
		}
	}
	if (buffer.length <= 1) return;
	if (buffer.length > 0) yield buffer;
}
function* chunks$1(it, size) {
	let buffer = [];
	for (const v of it) {
		buffer.push(v);
		if (buffer.length === size) {
			yield buffer;
			buffer = [];
		}
	}
	if (buffer.length > 0) yield buffer;
}
function* concat$1(...its) {
	for (const it of its) yield* it;
}
function* dropWhile$1(it, f) {
	for (const v of it) if (!f(v)) yield v;
}
/**
* Loops over a generator until it finishes, calling `callback`.
* Useful if you don't care about the value generator produces, just the number of loops.
* 
* ```js
* until(count(5), () => {
* // do something 5 times
* });
* ```
* 
* If you want the value from the generator, use a `for of` loop as usual.
* If `callback` explicitly returns _false_, the generator is aborted.
* @param it Generator to run
* @param callback Code to call for each iteration
*/
const until$1 = (it, callback) => {
	for (const _ of it) {
		const value = callback();
		if (typeof value === `boolean` && !value) break;
	}
};
const next = (it) => {
	return () => {
		const r = it.next();
		if (r.done) return;
		return r.value;
	};
};
/**
* Returns true if items in two iterables are equal, as
* determined by the `equality` function.
* @param it1
* @param it2
* @param equality
* @returns
*/
function equals$1(it1, it2, equality) {
	while (true) {
		const index1 = it1.next(), index2 = it2.next();
		if (equality !== void 0) {
			if (!equality(index1.value, index2.value)) return false;
		} else if (index1.value !== index2.value) return false;
		if (index1.done ?? index2.done) return index1.done && index2.done;
	}
}
function every$1(it, f) {
	for (const v of it) {
		const result = f(v);
		if (!result) return false;
	}
	return true;
}
function* fill$1(it, v) {
	for (const _ of it) yield v;
}
/**
* Iterates over `iterator` (iterable/array), calling `fn` for each value.
* If `fn` returns _false_, iterator cancels.
*
* Over the default JS `forEach` function, this one allows you to exit the
* iteration early.
*
* @example
* ```js
* import { Sync } from "@ixfx/iterables.js"
* Sync.forEach(count(5), () => console.log(`Hi`));  // Prints `Hi` 5x
* Sync.forEach(count(5), i => console.log(i));      // Prints 0 1 2 3 4
* Sync.forEach([0,1,2,3,4], i => console.log(i));   // Prints 0 1 2 3 4
* ```
*
* Use {@link forEach} if you want to use an async `iterator` and async `fn`.
* 
* Alternatives:
* * {@link https://api.ixfx.fun/_ixfx/flow/repeat/ @ixfx/flow.repeat}/{@link https://api.ixfx.fun/_ixfx/flow/repeatSync/ @ixfx/flow.repeatSync}: if you want to call something a given number of times and get the result
* @param iterator Iterable or array
* @typeParam T Type of iterable's values
* @param fn Function to call for each item. If function returns _false_, iteration cancels
*/
function forEach$1(iterator, fn) {
	for (const v of iterator) {
		const result = fn(v);
		if (typeof result === `boolean` && !result) break;
	}
}
/**
* ```js
* filter([1, 2, 3, 4], e => e % 2 == 0);
* returns [2, 4]
* ```
* @param it
* @param f
*/
function* filter$2(it, f) {
	for (const v of it) {
		if (!f(v)) continue;
		yield v;
	}
}
function find$1(it, f) {
	for (const v of it) if (f(v)) return v;
}
function* flatten$1(it) {
	for (const v of it) if (typeof v === `object`) {
		if (Array.isArray(v)) for (const vv of v) yield vv;
		else if (isIterable(v)) for (const vv of v) yield vv;
	} else yield v;
}
/**
* Maps an iterable of type `V` to type `X`.
* ```js
* map([1, 2, 3], e => e*e)
* returns [1, 4, 9]
* ```
* @param it
* @param f
*/
function* map$1(it, f) {
	for (const v of it) yield f(v);
}
function* max$3(it, gt = (a, b) => a > b) {
	let max$5;
	for (const v of it) {
		if (max$5 === void 0) {
			max$5 = v;
			yield max$5;
			continue;
		}
		if (gt(v, max$5)) {
			max$5 = v;
			yield max$5;
		}
	}
	return max$5;
}
function* min$3(it, gt = (a, b) => a > b) {
	let min$5;
	for (const v of it) {
		if (min$5 === void 0) {
			min$5 = v;
			yield min$5;
		}
		if (gt(min$5, v)) {
			min$5 = v;
			yield min$5;
		}
	}
}
function some$2(it, f) {
	for (const v of it) if (f(v)) return true;
	return false;
}
function* repeat(genCreator, repeatsOrSignal) {
	const repeats = typeof repeatsOrSignal === `number` ? repeatsOrSignal : Number.POSITIVE_INFINITY;
	const signal = typeof repeatsOrSignal === `number` ? void 0 : repeatsOrSignal;
	let count = repeats;
	while (true) {
		for (const v of genCreator()) {
			yield v;
			if (signal?.aborted) break;
		}
		if (Number.isFinite(repeats)) {
			count--;
			if (count === 0) break;
		}
		if (signal?.aborted) break;
	}
}
function* unique$1(iterable$1) {
	const buffer = [];
	let itera = [];
	itera = Array.isArray(iterable$1) ? iterable$1 : [iterable$1];
	for (const it of itera) for (const v of it) {
		if (buffer.includes(v)) continue;
		buffer.push(v);
		yield v;
	}
}
/**
* Combine same-positioned items from several iterables
* ```js
* zip( [1, 2, 3], [4, 5, 6], [7, 8, 9] );
* Yields: [ [1, 4, 7], [2, 5, 8], [3, 6, 9] ]
* ```
* @param its
* @returns
*/
function* zip$1(...its) {
	const iits = its.map((it) => it[Symbol.iterator]());
	while (true) {
		const vs = iits.map((it) => it.next());
		if (vs.some((v) => v.done)) return;
		yield vs.map((v) => v.value);
	}
}
function* fromIterable$1(iterable$1) {
	for (const v of iterable$1) yield v;
}
/**
* Returns an array of values from an iterator.
*
* ```js
* const data = await toArray(adsrIterable(opts, 10));
* ```
*
* Note: If the iterator is infinite, be sure to provide a limit via the options or the function
* will never return.
*
* @param it Asynchronous iterable
* @param options Options when converting to array.
* @returns
*/
function toArray$2(it, options = {}) {
	const result = [];
	const started = Date.now();
	const whileFunction = options.while;
	const maxItems = options.limit ?? Number.POSITIVE_INFINITY;
	const maxElapsed = intervalToMs(options.elapsed, Number.POSITIVE_INFINITY);
	for (const v of it) {
		if (whileFunction) {
			if (!whileFunction(result.length)) break;
		}
		if (result.length >= maxItems) break;
		if (Date.now() - started > maxElapsed) break;
		result.push(v);
	}
	return result;
}
/**
* Yield values from `array`, one at a time.
* Use `interval` to add time between each item.
* The first item is yielded without delay.
* @param array Array of values
*/
function* fromArray$1(array$1) {
	for (const v of array$1) yield v;
}

//#endregion
//#region ../iterables/src/chain/utility.ts
function isGenFactoryNoInput(c) {
	if (!(`_type` in c)) return false;
	if (c._type === `GenFactoryNoInput`) return true;
	return false;
}
/**
* Wrap the primitive value as generator
* @param value 
*/
function* primitiveToGenerator(value) {
	yield value;
}
/**
* Wrap the primitive value as an async generator
* @param value 
*/
async function* primitiveToAsyncGenerator(value) {
	yield value;
	await sleep(1);
}
/**
* Resolve the array, data or function to a Generator
* @param input 
* @returns 
*/
function resolveToGen(input) {
	if (Array.isArray(input)) {
		const a = input.values();
		a._name = `arrayInput`;
		return a;
	} else if (typeof input === `number` || typeof input === `boolean` || typeof input === `string`) return primitiveToGenerator(input);
	else if (typeof input === `function`) return input();
	return input;
}
/**
* Resolve the data, primitive or function to an AsyncGenerator
* @param input 
* @returns 
*/
function resolveToAsyncGen(input) {
	if (input === void 0) return;
	if (Array.isArray(input)) return fromArray$2(input);
	else if (typeof input === `number` || typeof input === `boolean` || typeof input === `string`) return primitiveToAsyncGenerator(input);
	else if (typeof input === `function`) return input();
	else if (isAsyncIterable(input)) return input;
	return fromIterable$2(input);
}

//#endregion
//#region ../iterables/src/util/dom.ts
function resolveEl(elOrQuery) {
	if (typeof elOrQuery === `string`) {
		const el = document.querySelector(elOrQuery);
		if (!el) throw new Error(`Element not found '${elOrQuery}'`);
		return el;
	}
	return elOrQuery;
}

//#endregion
//#region ../iterables/src/chain/dom.ts
var dom_exports = {};
__export(dom_exports, {
	perValue: () => perValue,
	query: () => query
});
const createMap = (key) => {
	const keyFunction = key ?? ((value) => value);
	const map$3 = /* @__PURE__ */ new Map();
	return {
		has(key$1) {
			return map$3.has(keyFunction(key$1));
		},
		get(key$1) {
			return map$3.get(keyFunction(key$1));
		},
		set(key$1, value) {
			map$3.set(keyFunction(key$1), value);
		},
		entries() {
			return map$3.entries();
		},
		delete(key$1) {
			map$3.delete(key$1);
		}
	};
};
/**
* Creates a HTML element per value. By default compares
* values by `JSON.stringify`. Set `byReference:true` to
* compare values based on reference. Or provide a toString
* function via `key`.
* 
* ```js
* // Generate a random number between 0...4 every second
* const looper = Generators.interval(() => Math.floor(Math.random()*5), 1000);
* 
* // Make a chain
* const ch = Chains.run(
*  looper,
*  Chains.Links.delay({before:1000}),
*  Chains.Dom.perValue()
* );
*
* setTimeout(async () => {
*    for await (const v of ch) {
*      const {el,value} = v;
*      el.textContent = `${value} - ${Date.now().toString()}`;
*    }
*    console.log(`ch iteration done`);
*  });
* ```
*/
function perValue(options = {}) {
	const byReference = options.byReference;
	const tagName = options.tagName ?? `div`;
	if (byReference && options.key) throw new Error(`byReference and key options are mutually exclusive`);
	const keyFunction = byReference ? void 0 : options.key ?? toStringDefault;
	const map$3 = createMap(keyFunction);
	const parentElementOrQuery = options.parentEl ?? document.body;
	const parentEl = resolveEl(parentElementOrQuery);
	const usedElements = /* @__PURE__ */ new Set();
	async function* perValue$1(input) {
		for await (const value of resolveToGen(input)) {
			let el = map$3.get(value);
			if (!el) {
				el = document.createElement(tagName);
				map$3.set(value, el);
				if (options.beforeInsert) options.beforeInsert(el);
				parentEl.append(el);
				if (options.afterInsert) options.afterInsert(el);
			}
			usedElements.add(el);
			yield {
				el,
				value
			};
		}
		for (const [id, el] of map$3.entries()) {
			if (usedElements.has(el)) continue;
			if (options.beforeRemove) options.beforeRemove(el);
			el.remove();
			map$3.delete(id);
		}
	}
	perValue$1._name = `dom.perValue`;
	return perValue$1;
}
/**
* From an input stream of strings, yields an output of HTMLElememnts
* @param options 
* @returns 
*/
function query(options = {}) {
	const baseElement = options.baseElement ?? document;
	async function* query$1(input) {
		const gen = resolveToGen(input);
		for await (const value of gen) for (const element of baseElement.querySelectorAll(value)) yield element;
	}
	query$1._name = `dom.query`;
	return query$1;
}

//#endregion
//#region ../iterables/src/chain/links.ts
var links_exports = {};
__export(links_exports, {
	average: () => average$1,
	chunk: () => chunk,
	debounce: () => debounce,
	delay: () => delay,
	drop: () => drop,
	duration: () => duration,
	filter: () => filter$1,
	max: () => max$2,
	min: () => min$2,
	rank: () => rank$1,
	rankArray: () => rankArray,
	reduce: () => reduce$1,
	sum: () => sum$1,
	take: () => take,
	tally: () => tally$1,
	transform: () => transform
});
/**
* Transform values from one type to another. Just like a map function.
* @param transformer 
* @returns 
*/
function transform(transformer) {
	async function* transform$1(input) {
		input = resolveToGen(input);
		for await (const value of input) yield transformer(value);
	}
	transform$1._name = `transform`;
	return transform$1;
}
/**
* Take `limit` number of results from the stream, before closing
* @param limit 
* @returns 
*/
function take(limit) {
	async function* take$1(input) {
		input = resolveToGen(input);
		let yielded = 0;
		for await (const value of input) {
			if (++yielded > limit) break;
			yield value;
		}
	}
	take$1._name = `take`;
	return take$1;
}
/**
* Takes an array of values, flattening to a single one
* using the provided `reducer` function.
* 
* ```js
* // Create a chain that flattens values
* const reduce = Chains.reduce(values => Math.max(...values));
* // Feed it a single input (an array), get a single output back:
* const result = await Chains.single(reduce, [ 1, 2, 3]); // 3
* ```
* @param reducer Function to reduce array of values to a single value
* @returns 
*/
function reduce$1(reducer) {
	async function* reduce$4(input) {
		input = resolveToGen(input);
		for await (const value of input) yield reducer(value);
	}
	reduce$4._name = `reduce`;
	return reduce$4;
}
/**
* Allow values through until a duration has elapsed. After
* that, the chain stops.
* @param elapsed 
* @returns 
*/
function duration(elapsed) {
	const durationMs = intervalToMs(elapsed, 0);
	async function* duration$1(input) {
		input = resolveToGen(input);
		const elapsed$1 = elapsedSince();
		for await (const value of input) {
			if (elapsed$1() > durationMs) break;
			yield value;
		}
	}
	duration$1._name = `duration`;
	return duration$1;
}
/**
* Add delay before/after values are emitted from the input stream.
* @param options 
* @returns 
*/
function delay(options) {
	const before = intervalToMs(options.before, 0);
	const after = intervalToMs(options.after, 0);
	async function* delay$1(input) {
		input = resolveToGen(input);
		for await (const value of input) {
			if (before > 0) await sleep(before);
			yield value;
			if (after > 0) await sleep(after);
		}
	}
	delay$1._name = `delay`;
	return delay$1;
}
/**
* Ensure a minimum length of time between values.
* Values being produced too quickly are dropped.
* 
* In the following example, only three values will be let through.
* ```js
* const chain = Chains.run(
*  // Produce values every 10ms for 350ms
*  Chains.From.timestamp({ interval: 10, elapsed: 350 }),
*  // Only let a value through every 100ms
*  Chains.Links.debounce(100)
* );
* ```
* @param rate 
* @returns 
*/
function debounce(rate) {
	const rateMs = intervalToMs(rate, 0);
	async function* debounce$1(input) {
		input = resolveToGen(input);
		let elapsed = elapsedSince();
		for await (const value of input) {
			if (elapsed() < rateMs) continue;
			yield value;
			elapsed = elapsedSince();
		}
	}
	debounce$1._name = `debounce`;
	return debounce$1;
}
/**
* Returns a running tally of how many items have been
* emitted from the input source.
* ```js
* const ch = Chains.run(
*  Chains.From.timestamp({ interval: 100 }),
*  Chains.Links.tally()
* );
* 
* for await (const v of ch) {
*   // Produces: 1, 2, 3 ... every 100ms
* }
* ```
* This is different than {@link sum} which adds up numeric values.
* By default it adds up individual array items
* @returns 
*/
function tally$1(countArrayItems = true) {
	async function* tally$2(input) {
		input = resolveToGen(input);
		const p = tally(countArrayItems);
		for await (const v of input) yield p(v);
	}
	tally$2._name = `tally`;
	return tally$2;
}
/**
* Returns the smallest value from the input.
* Can work with numbers or number[] as input.
* Non-numeric data is filtered out.
* @returns 
*/
function min$2() {
	async function* min$5(input) {
		input = resolveToGen(input);
		const p = min();
		for await (const value of input) {
			const x = p(value);
			if (x === void 0) continue;
			yield x;
		}
	}
	min$5._name = `min`;
	return min$5;
}
/**
* Returns the largest value from the input.
* - Non-numeric data is filtered out.
* - Looks inside of numeric arrays.
* @returns 
*/
function max$2() {
	async function* max$5(input) {
		input = resolveToGen(input);
		const p = max();
		for await (const value of input) {
			const x = p(value);
			if (x === void 0) continue;
			yield x;
		}
	}
	max$5._name = `max`;
	return max$5;
}
/**
* Emits the currently ranked 'highest' value from a stream. Only
* values exceeding the current highest are emitted.
* 
* eg, if we are ranking on numerical value, an input stream of:
* ```
* 4, 1, 6, 10, 2, 4
* ```
* 
* Results in the output stream of:
* ```
* 4, 6, 10
* ```
* 
* @example 
* ```js
* // Rank based on a field
* Chains.Links.rank((a,b) => {
*  if (a.size > b.size) return `a`; // Signals the first param is highest
*  if (a.size < b.size) return `b`; // Signals the second param is highest
*  return `eq`;
* });
* ```
* @param options 
* @returns 
*/
function rank$1(r, options = {}) {
	async function* rank$2(input) {
		input = resolveToGen(input);
		const p = rank(r, options);
		for await (const value of input) {
			const x = p(value);
			if (x === void 0) continue;
			yield x;
		}
	}
	rank$2._name = `rank`;
	return rank$2;
}
/**
* Emits the highest-ranked value from amongst an array of values.
* 
* By default, it tracks the highest-ranked _between_ arrays.
* 
* For example:
* ```js
* // Input
* [ [4,5,6], [1,2,3] ]
* // Outputs:
* [ 6 ]
* ```
* 
* This behaviour can be modified with an option to only compare _within_ arrays.
* ```
* // Input
* [ [4,5,6], [1,2,3] ]
* // Output:
* [ 6, 3 ]
* ```
* 
* Uses the `rank` option to determine which is more highly ranked.
* ```js
* Chains.Links.rankArray(
*  (a, b) => {
*    if (a > b) return `a`; // a is higher
*    else if (b > a) return `b`; // b is higher
*    return `eq`; // same
*  }
* )
* ```
* @param options 
* @returns 
*/
function rankArray(r, options = {}) {
	const includeType = options.includeType;
	const emitEqualRanked = options.emitEqualRanked ?? false;
	const emitRepeatHighest = options.emitRepeatHighest ?? false;
	const withinArrays = options.withinArrays ?? false;
	async function* rankArray$1(input) {
		input = resolveToGen(input);
		let best;
		for await (const value of input) {
			let emit = false;
			if (withinArrays) best = void 0;
			for (const subValue of value) {
				if (includeType && typeof subValue !== includeType) continue;
				if (best === void 0) {
					best = subValue;
					emit = true;
				} else {
					const result = r(subValue, best);
					if (result == `a`) {
						best = subValue;
						emit = true;
					} else if (result === `eq` && emitEqualRanked) emit = true;
					else if (emitRepeatHighest) emit = true;
				}
			}
			if (emit && best) yield best;
		}
	}
	rankArray$1._name = `rankArray`;
	return rankArray$1;
}
/**
* Returns the average from the input.
* Non-numeric values are filtered out.
* @returns 
*/
function average$1() {
	async function* average$2(input) {
		input = resolveToGen(input);
		const p = average();
		for await (const value of input) {
			const x = p(value);
			if (x === void 0) continue;
			yield x;
		}
	}
	average$2._name = `average`;
	return average$2;
}
/**
* Returns the total of the numeric values.
* Non-numeric values are filtered out.
* @returns 
*/
function sum$1() {
	async function* total(input) {
		input = resolveToGen(input);
		const p = sum();
		for await (const value of input) {
			const x = p(value);
			if (x === void 0) continue;
			yield x;
		}
	}
	total._name = `total`;
	return total;
}
/**
* Chunks an input stream into `size` chunks.
* 
* Eg, with a chunk size of 3, the input stream of:
*  1, 2, 3, 4, 5, 6
* Yields:
*  [ 1, 2, 3 ], [ 4, 5, 6 ]
* 
* If `returnRemainders` is _true_ (default), any left over values are returned even if
* it's less than `size`.
* @param size 
* @param returnRemainders If true (default) left over data that didn't make a full chunk is also returned
* @returns 
*/
function chunk(size, returnRemainders = true) {
	resultThrow(integerTest(size, `aboveZero`, `size`));
	async function* chunk$1(input) {
		input = resolveToGen(input);
		let buffer = [];
		for await (const value of input) {
			buffer.push(value);
			if (buffer.length >= size) {
				yield buffer;
				buffer = [];
			}
		}
		if (returnRemainders && buffer.length > 0) yield buffer;
	}
	chunk$1._name = `chunk`;
	return chunk$1;
}
/**
* Filters the input source, only allowing through
* data for which `predicate` returns _true_
* 
* {@link drop}, on the other hand excludes values for which predicate is _true_
* @param predicate 
* @returns 
*/
function filter$1(predicate) {
	async function* filter$4(input) {
		input = resolveToGen(input);
		for await (const value of input) if (predicate(value)) yield value;
	}
	filter$4._name = `filter`;
	return filter$4;
}
/**
* Drops all values from input stream for which `predicate` returns _true_
* 
* {@link filter}, on the other hand includes values where the predicate is _true_
* @param predicate 
* @returns 
*/
function drop(predicate) {
	async function* drop$1(input) {
		input = resolveToGen(input);
		for await (const value of input) if (!predicate(value)) yield value;
	}
	drop$1._name = `drop`;
	return drop$1;
}

//#endregion
//#region ../iterables/src/chain/from/array.ts
/**
* Creates a chain from an array, reading values at a given interval
* @param it 
* @param delay 
* @returns 
*/
function array(it, delay$1 = 5) {
	async function* fromArray$3() {
		for (const v of it) {
			await sleep(delay$1);
			yield v;
		}
	}
	fromArray$3._name = `fromArray`;
	fromArray$3._type = `GenFactoryNoInput`;
	return fromArray$3;
}

//#endregion
//#region ../iterables/src/chain/from/event.ts
/**
* Create an iterable from an event
* @param target Event source (eg HTML element)
* @param name Name of event (eg. 'pointermove')
* @returns 
*/
function event(target, name) {
	async function* event$1() {
		while (true) yield await promiseFromEvent(target, name);
	}
	event$1._name = `event`;
	event$1._type = `GenFactoryNoInput`;
	return event$1;
}

//#endregion
//#region ../iterables/src/chain/from/function.ts
/**
* Produce a value from a callback. When
* the callback returns _undefined_ it is considered done.
* 
* ```js
* const callback = () => Math.random();
* 
* const f = Chains.From.func(callback);
* for await (const v of f) {
*  // v is a new random number
* }
* ```
* 
* In the context of a chain:
* ```js
* let produced = 0;
* const chain = Chains.chain<number, string>(
*  // Produce incrementing numbers
*  Chains.From.func(() => produced++),
*  // Convert to `x:0`, `x:1` ...
*  Chains.transform(v => `x:${ v }`),
*  // Take first 5 results
*  Chains.cap(5)
* );
* const data = await Chains.asArray(chain);
* ```
* @param callback 
* @returns 
*/
function func(callback) {
	async function* fromFunction$1() {
		while (true) {
			const v = await callback();
			if (typeof v === `undefined`) break;
			yield v;
		}
	}
	fromFunction$1._name = `fromFunction`;
	fromFunction$1._type = `GenFactoryNoInput`;
	return fromFunction$1;
}

//#endregion
//#region ../iterables/src/chain/from/iterable.ts
/**
* Creates a chain from an interable
* @param it 
* @returns 
*/
function iterable(it) {
	async function* fromIterable$3() {
		for await (const v of it) yield v;
	}
	fromIterable$3._name = `fromIterable`;
	fromIterable$3._type = `GenFactoryNoInput`;
	return fromIterable$3;
}

//#endregion
//#region ../iterables/src/chain/from/ticks.ts
/**
* Generate timestamp values at `interval` rate. By default it runs forever. 
* Use `loops` or `elapsed` to set upper limit on how long it should run.
* 
* ```js
* const c = Chains.From.timestamp({ interval: 1000 });
* ```
* Options:
* - `asClockTime`: If _true_, yielded value will be clock time rather than elapsed milliseconds
* @param options 
* @returns 
*/
function timestamp(options) {
	const intervalMs = intervalToMs(options.interval, 0);
	const asClockTime = options.asClockTime ?? false;
	const loops = options.loops ?? Number.MAX_SAFE_INTEGER;
	let looped = 0;
	const durationTime = intervalToMs(options.elapsed, Number.MAX_SAFE_INTEGER);
	async function* ts() {
		const elapsed = elapsedSince();
		while (looped < loops && elapsed() < durationTime) {
			yield asClockTime ? Date.now() : elapsed();
			const expectedTimeDiff = looped * intervalMs - elapsed();
			await sleep(Math.max(0, intervalMs + expectedTimeDiff));
			looped++;
		}
	}
	ts._name = `timestamp`;
	ts._type = `GenFactoryNoInput`;
	return ts;
}

//#endregion
//#region ../iterables/src/chain/from/index.ts
var from_exports = {};
__export(from_exports, {
	array: () => array,
	event: () => event,
	func: () => func,
	iterable: () => iterable,
	timestamp: () => timestamp
});

//#endregion
//#region ../iterables/src/chain/add-to-array.ts
/**
* Adds values to the provided array as they are produced,
* mutating array.
* 
* ```js
* const data = [];
* addToArray(data, tick({ interval: 1000, loops: 5 }));
* // Execution continues immediately, with `data` mutated over time
* ```
* @param valueToWrap 
* @param array 
*/
async function addToArray(array$1, valueToWrap) {
	const outputType = typeof valueToWrap === `function` ? valueToWrap() : valueToWrap;
	for await (const value of outputType) array$1.push(value);
}

//#endregion
//#region ../iterables/src/chain/as-array.ts
/**
* Async function that returns the chain as an array of values
* ```js
* const values = await asArray(tick( { interval: 1000, loops: 5 }));
* // After 5 seconds, values will be a set of timestamps.
* ```
* 
* If the chain is infinite, be sure to specify limits:
* ```js
* // Stop after we have five items
* const values = await asArray(chain, { limit: 5 });
* // Stop after 5 seconds has elapsed
* const values = await asArray(chain, { elapsed: 5000 });
* ```
* @param valueToWrap 
* @returns 
*/
async function asArray(valueToWrap, options = {}) {
	const outputType = typeof valueToWrap === `function` ? valueToWrap() : valueToWrap;
	return toArray$1(outputType, options);
}

//#endregion
//#region ../iterables/src/chain/as-callback.ts
/**
* Calls `callback` whenever the chain/generator produces a value.
* 
* When using `asCallback`, call it with `await` to let generator 
* run its course before continuing:
* ```js
* await asCallback(tick({ interval:1000, loops:5 }), x => {
*  // Gets called 5 times, with 1000ms interval
* });
* console.log(`Hi`); // Prints after 5 seconds
* ```
* 
* Or if you skip the `await`, code continues and callback will still run:
* ```js
* asCallback(tick({ interval: 1000, loops: 5}), x => {
*  // Gets called 5 times, with 1000ms interval
* });
* console.log(`Hi`); // Prints immediately
* ```
* @param valueToWrap 
* @param callback 
*/
async function asCallback$1(valueToWrap, callback, onDone) {
	const outputType = typeof valueToWrap === `function` ? valueToWrap() : valueToWrap;
	for await (const value of outputType) callback(value);
	if (onDone) onDone();
}

//#endregion
//#region ../iterables/src/chain/as-promise.ts
/**
* Treats the chain/generator as a promise
* 
* ```js
* const ticker = asPromise(tick({ interval: 1000 }));
* const x = await ticker(); //  Waits for 1000ms before giving a value
* ```
* 
* This will only ever return one value. To return multiple values, it's necessary
* to call `asPromise` and `await` the result in a loop.
* @param valueToWrap 
* @returns 
*/
function asPromise(valueToWrap) {
	let lastValue;
	const outputType = typeof valueToWrap === `function` ? valueToWrap() : valueToWrap;
	async function asPromise$1() {
		const v = await outputType.next();
		if (v.done) return;
		lastValue = v.value;
		return lastValue;
	}
	return asPromise$1;
}

//#endregion
//#region ../iterables/src/chain/as-value.ts
/**
* Returns the most recent value from the chain/generator, or
* `initialValue` (defaulting to _undefined_) if no value
* has been emitted yet.
* 
* ```js
* const ticker = asValue(tick({ interval: 1000 }));
* x = ticker(); // Get the most recent value
* ```
* 
* Every time it's called, it fetches a new value from the generator, assuming
* it isn't already awaiting a result.
* 
* In the meantime, the last value (or `initialValue`) is returned.
* @param valueToWrap Value to wrap
* @param initialValue Initial value
* @returns 
*/
function asValue(valueToWrap, initialValue) {
	let lastValue = initialValue;
	let awaiting = false;
	const outputType = typeof valueToWrap === `function` ? valueToWrap() : valueToWrap;
	function asValue$1() {
		if (!awaiting) {
			awaiting = true;
			outputType.next().then((v) => {
				lastValue = v.value;
				awaiting = false;
			}).catch((error) => {
				awaiting = false;
				throw error;
			});
		}
		return lastValue;
	}
	return asValue$1;
}

//#endregion
//#region ../iterables/src/chain/combine-latest-to-array.ts
/**
* Monitors sources, storing as they happen to an array.
* Whenever a new value is emitted, the whole array is sent out, containing current
* values from each source, or _undefined_ if not yet emitted.
* 
* The tempo of this stream will be set by the fastest source stream.
* See {@link syncToArray} to have pace determined by slowest source, and only
* send when each source has produce a new value compared to last time.
* 
* Set `onSourceDone` to choose behaviour if a source stops. The default is
* 'break', meaning the whole combined stream stops.
* 
* If a source completes and onSourceDone = 'allow', the option
* 'finalValue' sets the logic for what values get returned for the source.
* By default the setting is 'undefined', thus _undefined_ results. 'last' will be the last (old) value
* from that source.
*/
async function* combineLatestToArray(sources, options = {}) {
	const onSourceDone = options.onSourceDone ?? `break`;
	const finalValue = options.finalValue ?? `undefined`;
	const afterEmit = options.afterEmit ?? `last`;
	const inputs = sources.map((source, index) => ({
		waiting: void 0,
		index,
		gen: resolveToGen(source),
		done: false,
		lastValue: void 0
	}));
	const isDone = () => !inputs.some((v) => !v.done);
	const isWaiting = () => inputs.some((v) => v.waiting !== void 0);
	const allEmpty = (d) => !d.some((v) => v !== void 0);
	let lastEmitted = [];
	while (true) {
		const promises = [];
		for (const input of inputs) {
			if (input.done) continue;
			if (input.waiting !== void 0) {
				promises.push(input.waiting);
				continue;
			}
			const p = Promise.resolve((async () => {
				if (input.done) return input;
				const v = await input.gen.next();
				input.waiting = void 0;
				if (v.done) {
					input.done = true;
					if (finalValue === `undefined`) input.lastValue = void 0;
				} else input.lastValue = v.value;
				return input;
			})());
			input.waiting = p;
			promises.push(p);
		}
		const won = await Promise.race(promises);
		if (`done` in won) {
			if (won.done && onSourceDone === `break`) break;
		} else throw new Error(`Missing 'done' property`);
		const d = inputs.map((v) => v.lastValue);
		if (d.length === 0) return;
		const dataEmpty = allEmpty(d);
		if (dataEmpty && !isWaiting()) return;
		if (!isEqual(lastEmitted, d) && !dataEmpty) {
			lastEmitted = d;
			yield d;
		}
		if (afterEmit === `undefined`) for (const input of inputs) {
			if (input.waiting !== void 0) continue;
			input.lastValue = void 0;
		}
		if (isDone()) break;
	}
}

//#endregion
//#region ../iterables/src/chain/combine-latest-to-object.ts
/**
* Monitors sources, storing as they happen to an object.
* Whenever a new value is emitted, the object is sent out, containing current
* values from each source, or _undefined_ if not yet emitted.
* 
* The tempo of this stream will be set by the fastest source stream.
* See {@link syncToObject} to have pace determined by slowest source, and only
* send when each source has produce a new value compared to last time.
* 
* Set `onSourceDone` to choose behaviour if a source stops. By default it
* is 'break', meaning the whole merged stream stops.
* 
* If a source completes and onSourceDone = 'allow', the option
* 'finalValue' sets the logic for what values get returned for the source.
* By default the setting is 'undefined', thus _undefined_ results. 'last' will be the last (old) value
* from that source.
*/
async function* combineLatestToObject(sources, options = {}) {
	const onSourceDone = options.onSourceDone ?? `break`;
	const finalValue = options.finalValue ?? `undefined`;
	const afterEmit = options.afterEmit ?? `last`;
	const states = /* @__PURE__ */ new Map();
	for (const [key, value] of Object.entries(sources)) states.set(key, {
		gen: resolveToGen(value),
		done: false,
		lastValue: void 0,
		waiting: void 0,
		key
	});
	const isDone = () => !some(states, (v) => !v.done);
	const isWaiting = () => some(states, (v) => v.waiting !== void 0);
	const allEmpty = (d) => {
		for (const v of Object.values(d)) if (v !== void 0) return false;
		return true;
	};
	const getData = () => {
		const r = {};
		for (const [key, state] of states) r[key] = state.lastValue;
		return r;
	};
	let lastEmitted;
	while (true) {
		const promises = [];
		for (const input of states.values()) {
			if (input.done) continue;
			if (input.waiting !== void 0) {
				promises.push(input.waiting);
				continue;
			}
			const p = Promise.resolve((async () => {
				if (input.done) return input;
				const v = await input.gen.next();
				input.waiting = void 0;
				if (v.done) {
					input.done = true;
					if (finalValue === `undefined`) input.lastValue = void 0;
				} else input.lastValue = v.value;
				return input;
			})());
			input.waiting = p;
			promises.push(p);
		}
		const won = await Promise.race(promises);
		if (`done` in won) {
			if (won.done && onSourceDone === `break`) break;
		} else throw new Error(`Result missing 'done' property`);
		const d = getData();
		const dataEmpty = allEmpty(d);
		if (dataEmpty && !isWaiting()) return;
		if (!isEqualValueIgnoreOrder(lastEmitted, d) && !dataEmpty) {
			lastEmitted = d;
			yield d;
		}
		if (afterEmit === `undefined`) for (const input of states.values()) {
			if (input.waiting !== void 0) continue;
			input.lastValue = void 0;
		}
		if (isDone()) break;
	}
}

//#endregion
//#region ../iterables/src/chain/lazy.ts
const getLinkName = (c) => {
	return c._name ?? c.name;
};
function lazy() {
	const chained = [];
	let dataToUse;
	const asGenerator = (data) => {
		if (data === void 0) data = dataToUse;
		let d = resolveToAsyncGen(data);
		for (const c of chained) if (d === void 0) if (isGenFactoryNoInput(c)) d = c();
		else throw new Error(`Function '${getLinkName(c)}' requires input. Provide it to the function, or call 'input' earlier.`);
		else d = c(d);
		return d;
	};
	const w = {
		rankArray: (r, options) => {
			chained.push(rankArray(r, options));
			return w;
		},
		rank: (r, options) => {
			chained.push(rank$1(r, options));
			return w;
		},
		transform: (transformer) => {
			chained.push(transform(transformer));
			return w;
		},
		reduce: (reducer) => {
			chained.push(reduce$1(reducer));
			return w;
		},
		drop: (predicate) => {
			chained.push(drop(predicate));
			return w;
		},
		delay: (options) => {
			chained.push(delay(options));
			return w;
		},
		duration: (elapsed) => {
			chained.push(duration(elapsed));
			return w;
		},
		debounce: (rate) => {
			chained.push(debounce(rate));
			return w;
		},
		fromFunction: (callback) => {
			chained.push(func(callback));
			return w;
		},
		take: (limit) => {
			chained.push(take(limit));
			return w;
		},
		chunk: (size, returnRemainders = true) => {
			chained.push(chunk(size, returnRemainders));
			return w;
		},
		filter: (predicate) => {
			chained.push(filter$1((v) => predicate(v)));
			return w;
		},
		min: () => {
			chained.push(min$2());
			return w;
		},
		max: () => {
			chained.push(max$2());
			return w;
		},
		average: () => {
			chained.push(average$1());
			return w;
		},
		sum: () => {
			chained.push(sum$1());
			return w;
		},
		tally: (countArrayItems) => {
			chained.push(tally$1(countArrayItems));
			return w;
		},
		input(data) {
			dataToUse = data;
			return w;
		},
		asGenerator,
		asAsync(data) {
			let d = data ?? dataToUse;
			for (const c of chained) if (d === void 0 && isGenFactoryNoInput(c)) d = c();
			else if (d === void 0) throw new Error(`Function '${getLinkName(c)}' needs input. Pass in data calling 'asAsync', or call 'input' earlier`);
			else d = c(d);
			return w;
		},
		asArray: async (data) => {
			const g = asGenerator(data);
			return await toArray$1(g);
		},
		firstOutput: async (data) => {
			const g = asGenerator(data);
			const v = await g.next();
			return v.value;
		},
		lastOutput: async (data) => {
			const g = asGenerator(data);
			let lastValue;
			for await (const v of g) lastValue = v;
			return lastValue;
		}
	};
	return w;
}

//#endregion
//#region ../iterables/src/util/queueMutable.ts
var QueueMutable = class {
	#store = [];
	enqueue(data) {
		this.#store.push(data);
	}
	dequeue() {
		return this.#store.shift();
	}
};

//#endregion
//#region ../iterables/src/chain/merge-flat.ts
/**
* Merge values from several sources into one stream, interleaving values.
* When all streams are complete it finishes.
* 
* Alternatively:
* - {@link combineLatestToArray}/{@link combineLatestToObject} emits snapshots of all the generators, as quickly as the fastest one
* - {@link syncToArray}/{@link syncToObject} which releases a set of results when all inputs have emitted a value
* @param sources 
*/
async function* mergeFlat(...sources) {
	const sourcesInput = sources.map((source) => resolveToAsyncGen(source));
	const buffer = new QueueMutable();
	let completed = 0;
	const schedule = async (source) => {
		if (source === void 0) {
			completed++;
			return;
		}
		const x = await source.next();
		if (x.done) completed++;
		else {
			buffer.enqueue(x.value);
			setTimeout(() => schedule(source), 1);
		}
	};
	for (const source of sourcesInput) setTimeout(() => schedule(source), 1);
	const loopSpeed = 10;
	let loopFactor = 1;
	while (completed < sourcesInput.length) {
		const d = buffer.dequeue();
		if (d === void 0) loopFactor = Math.min(loopFactor + 1, 10);
		else {
			yield d;
			loopFactor = 1;
		}
		await sleep(loopSpeed * loopFactor);
	}
}

//#endregion
//#region ../iterables/src/chain/run.ts
/**
* Chain functions together. First argument is the source.
* `runN` takes any number of chain functions. Use {@link run} if
* possible, because it has improved type hinting.
* 
* @example Process an array of strings. Transforming into
* integers, and then filtering only even numbers.
* ```js
* const ch = Chains.runN(
*  [ `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10` ],
*  Chains.transform<string, number>(v => Number.parseInt(v)),
*  Chains.filter(v => v % 2 === 0)
*);
* const output = await Async.toArray(ch2);
* // [ 2, 4, 6, 8, 10 ]
* ```
* 
* @example Grab the x/y coordinate from pointermove
* ```js
* const c1 = Chains.run(
*  Chains.fromEvent(window, `pointermove`),
*  Chains.Links.transform(event => ({ x: event.x, y: event.y }))
* );
* 
* // Eg: print out data as it comes in
* Iterables.forEach(c1, coord => {
*   console.log(coord);
* });
* // Execution continues immediately
* ```
* @param functions 
* @returns 
*/
async function* runN(...functions) {
	let input;
	for (const fnOrData of functions) input = typeof fnOrData === `function` ? fnOrData(input ?? []) : resolveToGen(fnOrData);
	if (input === void 0) return;
	for await (const v of input) yield v;
}
/**
* Chain functions together. First argument is the source.
* Use {@link runN} if you want to chain more links than is possible here,
* at the cost of poorer type hinting.
* 
* @example Process an array of strings. Transforming into
* integers, and then filtering only even numbers.
* ```js
* const ch = Chains.run(
*  [ `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10` ],
*  Chains.transform(v => Number.parseInt(v)),
*  Chains.filter(v => v % 2 === 0)
*);
* const output = await Async.toArray(ch2);
* // [ 2, 4, 6, 8, 10 ]
* ```
* 
* @example Grab the x/y coordinate from pointermove
* ```js
* const c1 = Chains.run(
*  Chains.fromEvent(window, `pointermove`),
*  Chains.Links.transform(event => ({ x: event.x, y: event.y }))
* );
* 
* // Eg: print out data as it comes in
* Iterables.forEach(c1, coord => {
*   console.log(coord);
* });
* // Execution continues immediately
* ```
* @param gen 
* @param l0 
* @param l1 
* @param l2 
* @param l3 
* @returns 
*/
async function* run(gen, l0, l1, l2, l3, l4, l5) {
	let input;
	const functions = arguments;
	for (const fnOrData of functions) if (typeof fnOrData === `function`) input = fnOrData(input ?? []);
	else input = resolveToGen(fnOrData);
	if (input === void 0) return;
	for await (const v of input) yield v;
}

//#endregion
//#region ../iterables/src/chain/prepare.ts
/**
* Prepare a chain, allowing you to provide a source at execution time.
* ```js
* const chain = Chains.prepare(
*  Chains.transform<string,number>( v => Number.parseInt(v) ),
*  Chains.filter<number>(v => v % 2 === 0)
* );
*
* // Run it with provided source
* for await (const v of chain([`1`, `2`, `3`])) {
*
* }
* ```
* @param functions
* @returns
*/
function prepare(...functions) {
	const r = (source) => {
		return runN(source, ...functions);
	};
	return r;
}

//#endregion
//#region ../iterables/src/chain/single.ts
/**
* Input a single value to the chain, return a single result
* 
* 
* ```js
* // Create chain link
* const f = Chains.Links.flatten<string, string>(data => data.join(`-`));
* // Input a single value (an array)
* const r1 = await Chains.single(f, [ `a`, `b`, `c` ]);
* // r1 = `a-b-c`
* ```
* @param f 
* @param input 
* @returns 
*/
async function single(f, input) {
	const iterator = await f([input]).next();
	return iterator.value;
}

//#endregion
//#region ../iterables/src/chain/sync.ts
/**
* Waits for all sources to produce a value, sending the combined results as an array.
* After sending, it waits again for each source to send at least one value.
* 
* Use {@link syncToObject} to output objects based on labelled sources rather than an array of values.
* 
* Pace will be set by the slowest source. Alternatively, use {@link combineLatestToArray} where the rate is determined by fastest source.
* 
* Only complete results are sent. For example if source A & B finish and 
* source C is still producing values, synchronisation is not possible 
* because A & B stopped producing values. Thus the stream will terminate
* after `maximumWait` (2 seconds). Newer values from C are lost.
*/
async function* syncToArray(sources, options = {}) {
	const onSourceDone = options.onSourceDone ?? `break`;
	const maximumWaitMs = intervalToMs(options.maximumWait, 2e3);
	const finalValue = options.finalValue ?? `undefined`;
	const inputs = sources.map((source) => ({
		seq: 0,
		lastValue: void 0,
		gen: resolveToGen(source),
		done: false
	}));
	const nextWithTimeoutOpts = { millis: maximumWaitMs };
	let seq = 0;
	const isAllDone = () => !inputs.some((v) => !v.done);
	let go = true;
	while (go) {
		seq++;
		for (const input of inputs) {
			if (input.done) {
				input.seq = seq;
				continue;
			}
			const v = await nextWithTimeout(input.gen, nextWithTimeoutOpts);
			if (v.done) {
				input.done = true;
				input.seq = seq;
				if (finalValue === `undefined`) input.lastValue = void 0;
				if (onSourceDone === `break`) return;
			} else {
				input.lastValue = v.value;
				input.seq = seq;
			}
		}
		if (go) {
			const d = inputs.filter((v) => v.seq === seq).map((v) => v.lastValue);
			if (d.length === 0) return;
			if (!d.some((v) => typeof v !== `undefined`)) return;
			yield d;
		}
		if (isAllDone()) go = false;
	}
}

//#endregion
//#region ../iterables/src/chain/index.ts
var chain_exports = {};
__export(chain_exports, {
	Dom: () => dom_exports,
	From: () => from_exports,
	Links: () => links_exports,
	addToArray: () => addToArray,
	asArray: () => asArray,
	asCallback: () => asCallback$1,
	asPromise: () => asPromise,
	asValue: () => asValue,
	combineLatestToArray: () => combineLatestToArray,
	combineLatestToObject: () => combineLatestToObject,
	isGenFactoryNoInput: () => isGenFactoryNoInput,
	lazy: () => lazy,
	mergeFlat: () => mergeFlat,
	prepare: () => prepare,
	resolveToAsyncGen: () => resolveToAsyncGen,
	resolveToGen: () => resolveToGen,
	run: () => run,
	runN: () => runN,
	single: () => single,
	syncToArray: () => syncToArray
});

//#endregion
//#region ../iterables/src/compare-values.ts
/**
* Returns the 'max' of some iterable using the provided scoring function.
* It only yields a value when iterator finishes.
* @param iterable
* @param scorer 
* @returns 
*/
const maxScore = (iterable$1, scorer) => {
	let highestValue;
	let highestScore = Number.MIN_SAFE_INTEGER;
	for (const value of iterable$1) {
		const score = scorer(value);
		if (score >= highestScore) {
			highestScore = score;
			highestValue = value;
		}
	}
	return highestValue;
};
/**
* Returns the 'min' of some iterable using the provided scoring function.
* It only yields a value when iterator finishes.
* @param iterable 
* @param scorer 
* @returns 
*/
const minScore = (iterable$1, scorer) => {
	let lowestValue;
	let lowestScore = Number.MAX_SAFE_INTEGER;
	for (const value of iterable$1) {
		const score = scorer(value);
		if (score <= lowestScore) {
			lowestScore = score;
			lowestValue = value;
		}
	}
	return lowestValue;
};
/**
* Returns _true_ if all values in iterables are equal, regardless
* of their position. Uses === equality semantics by default.
* 
* Is NOT recursive.
* 
* @example Default equality checking
* ```js
* const a = ['apples','oranges','pears'];
* const b = ['pears','oranges','apples'];
* hasEqualValuesShallow(a, b); // True
* ```
*
* @example Custom equality checking
* ```js
* const a = [ { name: 'John' }];
* const b = [ { name: 'John' }];
* // False, since object identies are different
* hasEqualValuesShallow(a, b); 
* // True, since now we're comparing by value
* hasEqualValuesShallow(a, b, (aa,bb) => aa.name === bb.name);
* ```
* @param iterableA First iterable to check
* @param iterableB Iterable to compare against
* @param eq Equality function, uses === by default
*/
const hasEqualValuesShallow = (iterableA, iterableB, eq) => {
	const returnValue = compareIterableValuesShallow(iterableA, iterableB, eq);
	return returnValue.a.length === 0 && returnValue.b.length === 0;
};

//#endregion
//#region ../iterables/src/controller.ts
/**
* Retrieve values from an iterator, passing them to a callback.
* Allows iterator to be started, paused, or restarted and an optional delay between reading items from iterator.
* @param options 
* @returns 
*/
const iteratorController = (options) => {
	const delayMs = intervalToMs(options.delay, 10);
	let gen;
	const onValue = options.onValue;
	let state = `stopped`;
	const loop = continuously(async () => {
		if (gen) {
			const r = await gen.next();
			if (r.done) {
				state = `stopped`;
				return false;
			}
			const r2 = onValue(r.value);
			if (typeof r2 === `boolean`) {
				if (!r2) state = `stopped`;
				return r2;
			}
			return true;
		} else {
			state = `stopped`;
			return false;
		}
	}, delayMs);
	const cancel = () => {
		if (state === `stopped`) return;
		gen = void 0;
		loop.cancel();
		state = `stopped`;
	};
	const pause = () => {
		if (state === `paused`) return;
		loop.cancel();
		state = `paused`;
	};
	const start = () => {
		if (state === `running`) return;
		if (!gen) remake();
		state = `running`;
		loop.start();
	};
	const remake = () => {
		if (options.iterator) gen = options.iterator();
		else throw new Error(`No source iterator`);
	};
	const restart = () => {
		remake();
		start();
	};
	return {
		start,
		cancel,
		restart,
		pause,
		get state() {
			return state;
		}
	};
};

//#endregion
//#region ../iterables/src/from-event.ts
const fromEvent = (eventSource, eventType) => {
	const pullQueue = [];
	const pushQueue = [];
	let done = false;
	const pushValue = (args) => {
		if (pullQueue.length > 0) {
			const resolver = pullQueue.shift();
			resolver(...args);
		} else pushQueue.push(args);
	};
	const pullValue = () => new Promise((resolve) => {
		if (pushQueue.length > 0) {
			const arguments_ = pushQueue.shift();
			resolve(...arguments_);
		} else pullQueue.push(resolve);
	});
	const handler = (...arguments_) => {
		pushValue(arguments_);
	};
	eventSource.addEventListener(eventType, handler);
	const r = {
		next: async () => {
			if (done) return {
				done: true,
				value: void 0
			};
			return {
				done: false,
				value: await pullValue()
			};
		},
		return: async () => {
			done = true;
			eventSource.removeEventListener(eventType, handler);
			return {
				done: true,
				value: void 0
			};
		},
		throw: async (error) => {
			done = true;
			return {
				done: true,
				value: Promise.reject(new Error(error))
			};
		}
	};
	return r;
};

//#endregion
//#region ../iterables/src/numbers-compute.ts
/**
* Returns the min, max, avg and total of the array or iterable.
* Any values that are invalid are silently skipped over.
*
* ```js
* const v = [ 10, 2, 4.2, 99 ];
* const mma = numbersCompute(v);
* // Yields: { min: 2, max: 99, total: 115.2, avg: 28.8 }
* ```
*
* Use {@link https://api.ixfx.fun/_ixfx/numbers/average/ @ixfx/numbers.average}, {@link https://api.ixfx.fun/_ixfx/numbers/max/ @ixfx/numbers.max}, {@link https://api.ixfx.fun/_ixfx/numbers/min/ @ixfx/numbers.min} or {@link https://api.ixfx.fun/_ixfx/numbers/total/ @ixfx/numers.total} if you only need one of these.
*
* A start and end range can be provided if the calculation should be restricted to a part
* of the input array. By default the whole array is used.
*
* It's also possible to use an iterable as input.
* ```js
* import { count } from '@ixfx/numbers';
* numbersCompute(count(5,1)); // Averages 1,2,3,4,5
* ```
* 
* Returns `NaN` if the input data is empty.
* @param data
* @param options Allows restriction of range that is examined
* @returns `{min, max, avg, total}`
*/
const numbersCompute = (data, options = {}) => {
	if (typeof data === `undefined`) throw new Error(`Param 'data' is undefined`);
	if (Array.isArray(data)) return numberArrayCompute(data, options);
	if (isIterable(data)) return numbersComputeIterable(data, options);
	throw new Error(`Param 'data' is neither an array nor iterable`);
};
function numbersComputeIterable(data, options = {}) {
	let total = 0;
	const nonNumbers = options.nonNumbers ?? `ignore`;
	let min$5 = Number.MAX_SAFE_INTEGER;
	let max$5 = Number.MIN_SAFE_INTEGER;
	let count = 0;
	for (let v of data) {
		if (typeof v !== `number` || Number.isNaN(v)) {
			if (nonNumbers === `throw`) throw new TypeError(`Data contains something not a number. Got type '${typeof v}'`);
			if (nonNumbers === `nan`) v = NaN;
			if (nonNumbers === `ignore`) continue;
		}
		total += v;
		count++;
		min$5 = Math.min(min$5, v);
		max$5 = Math.max(max$5, v);
	}
	return {
		avg: total / count,
		total,
		max: max$5,
		min: min$5,
		count
	};
}
function computeAverage(data, options = {}) {
	let count = 0;
	let total = 0;
	const nonNumbers = options.nonNumbers ?? `ignore`;
	for (let d of data) {
		if (typeof d !== `number` || Number.isNaN(d)) {
			if (nonNumbers === `throw`) throw new TypeError(`Data contains something not a number. Got type '${typeof d}'`);
			if (nonNumbers === `nan`) d = NaN;
			if (nonNumbers === `ignore`) continue;
		}
		total += d;
		count++;
	}
	return total / count;
}

//#endregion
//#region ../iterables/src/index.ts
/**
* Returns a stream of minimum values.
* 
* Streaming result: works with endless iterables.
* 
* ```js
* min([
*  {i:0,v:1},
*  {i:1,v:9},
*  {i:2,v:-2}
* ], (a, b) => a.v > b.v);
* // Yields: {i:2, v:1}, {i:2,v:-2}
* ```
* @param it Iterable
* @param gt Should return _true_ if `a` is greater than `b`.
* @returns Yields minimum values
*/
function min$1(it, gt = (a, b) => a > b) {
	return isAsyncIterable(it) ? min$4(it, gt) : min$3(it, gt);
}
/**
* Returns the maximum value of an iterable as it changes.
* Streaming result: works with endless iterables.
* 
* ```js
* // Rank values by their 'v' field
* const rank = (a,b) => a.v > b.v;
* 
* min([
*  {i:0,v:1},
*  {i:1,v:9},
*  {i:2,v:-2}
* ], rank);
* // Yields: {i:0,v:1}, {i:1,v:9}
* ```
* @param it Iterable
* @param gt Should return _true_ if `a` is greater than `b`.
* @returns Iterable of maximum values
*/
function max$1(it, gt = (a, b) => a > b) {
	return isAsyncIterable(it) ? max$4(it, gt) : max$3(it, gt);
}
/**
* Drops elements that do not meet the predicate `f`.
* Streaming result: works with endless iterables.
* 
* ```js
* dropWhile([1, 2, 3, 4], e => e < 3);
* returns [3, 4]
* ```
* @param it
* @param f
*/
function dropWhile(it, f) {
	return isAsyncIterable(it) ? dropWhile$2(it, f) : dropWhile$1(it, f);
}
/**
* Loops over a generator until it finishes, calling `callback`.
* Useful if you don't care about the value generator produces, just the number of loops.
* 
* ```js
* until(count(5), () => {
* // do something 5 times
* });
* ```
* 
* If you want the value from the generator, use a `for of` loop as usual.
* If `callback` explicitly returns _false_, the generator is aborted.
* 
* This does not work for infinite generators, `callback` will never be called.
* @param it Generator to run
* @param callback Code to call for each iteration
*/
function until(it, callback) {
	if (isAsyncIterable(it)) return until$2(it, callback);
	else until$1(it, callback);
}
/**
* Breaks an iterable into array chunks
* 
* Streaming: works with infinite iterables.
* 
* ```js
* chunks([1,2,3,4,5,6,7,8,9,10], 3);
* // Yields [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
* ```
* @param it
* @param size
*/
function chunks(it, size) {
	return isAsyncIterable(it) ? chunks$2(it, size) : chunks$1(it, size);
}
/**
* Filters an iterable, only yielding items which match `f`.
*
* ```js
* filter([1, 2, 3, 4], e => e % 2 == 0);
* returns [2, 4]
* ```
* 
* When using async iterables, `f` can be async as well.
* @param it
* @param f
*/
function filter(it, f) {
	return isAsyncIterable(it) ? filter$3(it, f) : filter$2(it, f);
}
/**
* Yields `v` for each item within `it`.
*
* ```js
* fill([1, 2, 3], 0);
* // Yields: [0, 0, 0]
* ```
* 
* This is like a `map` where we return a fixed value, ignoring the input.
* @param it
* @param v
*/
function fill(it, v) {
	return isAsyncIterable(it) ? fill$2(it, v) : fill$1(it, v);
}
/**
* Return concatenation of iterators.
* 
* Non-streaming: If one of the input iterables is endless, the other ones won't
* be processed.
* @param its
*/
function concat(...its) {
	return isAsyncIterable(its[0]) ? concat$2(...its) : concat$1(...its);
}
/**
* Returns first item from iterable `it` that matches predicate `f`
* ```js
* find([1, 2, 3, 4], e => e > 2);
* // Yields: 3
* ```
* 
* When using async iterables, `f` can be async as well.
* @param it
* @param f
* @returns
*/
function find(it, f) {
	return isAsyncIterable(it) ? find$2(it, f) : find$1(it, f);
}
/**
* Execute function `f` for each item in iterable.
* If `f` returns _false_, iteration stops.
* ```js
* forEach(iterable, v => {
*  // do something with value
* });
* ```
* 
* When using an async iterable, `fn` can also be async.
* @param it Iterable or array
* @param fn Function to execute
*/
function forEach(it, fn, options = {}) {
	if (isAsyncIterable(it)) return forEach$2(it, fn, options);
	else forEach$1(it, fn);
}
/**
* Maps an iterable through function `f`
* ```js
* // For every input value, multiply it by itself
* map([1, 2, 3], e => e*e)
* // Yields: 1, 4, 9
* ```
* 
* It can also be used to transform types:
* ```js
* map([1, 2, 3], e => { value: e });
* // Yields: { value: 1 }, { value: 2 }, { value: 3 }
* ```
* @param it
* @param f
*/
function map(it, f) {
	return isAsyncIterable(it) ? map$2(it, f) : map$1(it, f);
}
/**
* Yield values from `array`, one at a time.
* Use `interval` to add time between each item.
* The first item is yielded without delay.
* 
* @param array Array of values
* @param interval Interval (defaults: 1ms)
*/
function fromArray(array$1, interval) {
	return interval === void 0 ? fromArray$1(array$1) : fromArray$2(array$1, interval);
}
/**
* Returns a 'flattened' copy of array, un-nesting arrays one level.
* Streaming: works with unlimited iterables.
* ```js
* flatten([1, [2, 3], [[4]]]);
* // Yields: [1, 2, 3, [4]];
* ```
* @param it
*/
function flatten(it) {
	return isAsyncIterable(it) ? flatten$2(it) : flatten$1(it);
}
/**
* Returns true the first time `f` returns true. Useful for spotting any occurrence of
* data, and exiting quickly
* ```js
* some([1, 2, 3, 4], e => e % 3 === 0);
* // Yields: true
* ```
* @param it Iterable
* @param f Filter function
* @returns
*/
function some$1(it, f) {
	return isAsyncIterable(it) ? some$3(it, f) : some$2(it, f);
}
/**
* Returns the last item of an iterable, or _undefined_ if it yields no results.
* @param it 
* @returns 
*/
function last(it) {
	return isAsyncIterable(it) ? last$2(it) : last$1(it);
}
/**
* Reduce for iterables
* ```js
* reduce([1, 2, 3], (acc, cur) => acc + cur, 0);
* // Yields: 6
* ```
* @param it Iterable
* @param f Function
* @param start Start value
* @returns
*/
function reduce(it, f, start) {
	return isAsyncIterable(it) ? reduce$3(it, f, start) : reduce$2(it, f, start);
}
/**
* Returns a section from an iterable.
* 
* 'end' is the end index, not the number of items.
* 
* ```js
* // Return five items from step 10
* slice(it, 10, 15);
* ```
* @param it Iterable
* @param start Start step
* @param end Exclusive end step (or until completion)
*/
function slice(it, start = 0, end = Number.POSITIVE_INFINITY) {
	return isAsyncIterable(it) ? slice$2(it, start, end) : slice$1(it, start, end);
}
/**
* Returns unique items from an iterable or
* array of iterables.
*
* ```js
* const data = [ 'apples', 'oranges' ]
* const data2 = [ 'oranges', 'pears' ]
* const unique = [...unique([data,data2]];
* // Yields: [ 'apples', 'oranges', 'pears' ]
* ```
*
* Uses object reference to compare values.
* Use {@link uniqueByValue} if this doesn't suffice.
* @param iterable Iterable, or array of iterables
*/
function unique(iterable$1) {
	if (Array.isArray(iterable$1)) {
		if (iterable$1.length === 0) return fromArray$1([]);
		return isAsyncIterable(iterable$1[0]) ? unique$2(iterable$1) : unique$1(iterable$1);
	} else if (isAsyncIterable(iterable$1)) return unique$2(iterable$1);
	else return unique$1(iterable$1);
}
/**
* Filters the `input` iterable, only yielding unique values. Use {@link unique} to compare
* by object reference instead.
* 
* Streaming: Works with unbounded iterables.
* 
* ```js
* const d = ['a', 'b', 'c', 'b', 'd' ];
* for (const v of uniqueByValue(d)) {
*  // Yields: 'a', 'b', 'c', 'd'
* // (extra 'b' is skipped)
* }
* ```
* 
* By default, JSON.stringify is used to create a string representing value. These are added
* to a Set of strings, which is how we keep track of uniqueness. If the value is already a string it is used as-is.
* 
* This allows you to have custom logic for what determines uniqueness. Eg, using a single field
* of an object as an identifier:
* 
* ```js
* const people = [
*  { name: `Mary`, size: 20 }, { name: `Abdul`, size: 19 }, { name: `Mary`, size: 5 }
* ]
* for (const v of uniqueByValue(d, v=>v.name)) {
*  // Yields: { name: `Mary`, size: 20 }, { name: `Abdul`, size: 19 }
*  // Second 'Mary' is skipped because name is the same, even though size field is different.
* }
* ```
* 
* If you want to keep track of the set of keys, or prime it with some existing data, provide a Set instance:
* ```js
* const unique = new Set();
* unique.add(`b`);
* const d = [`a`, `b`, `c`];
* for (const v of uniqueByValue(d, toStringDefault, unique)) {
*  // Yields: `a`, `c`
*  // `b` is skipped because it was already in set
* }
* // After completion, `unique` contains `a`, `b` and `c`.
* ```
* 
* Creating your own Set is useful for tracking unique values across several calls to `uniqueByValue`.
* @param input 
* @param seen 
* @param toString 
*/
function* uniqueByValue(input, toString = toStringDefault, seen = /* @__PURE__ */ new Set()) {
	yield* isAsyncIterable(input) ? uniqueByValue$2(input, toString, seen) : uniqueByValue$1(input, toString, seen);
}
/**
* Returns an array of values from an iterator.
*
* ```js
* const data = await toArray(adsrIterable(opts, 10));
* ```
*
* Note: If the iterator is infinite, be sure to provide a `count` or the function
* will never return.
*
* @param it Asynchronous iterable
* @param count Number of items to return, by default all.
* @returns
*/
function toArray(it, options = {}) {
	return isAsyncIterable(it) ? toArray$1(it, options) : toArray$2(it, options);
}
/**
* Returns _true_ if `f` returns _true_ for
* every item in iterable.
* 
* Streaming: If an infinite iterable is used, function will never return value.
* @param it
* @param f
* @returns
*/
function every(it, f) {
	return isAsyncIterable(it) ? every$2(it, f) : every$1(it, f);
}
/**
* Returns _true_ if items in two iterables are equal, as
* determined by the `equality` function.
* Order matters. It compares items at the same 'step' of each iterable.
* @param it1
* @param it2
* @param equality
* @returns
*/
function equals(it1, it2, equality) {
	const as = isAsyncIterable(it1) && isAsyncIterable(it2);
	return as ? equals$2(it1, it2, equality) : equals$1(it1, it2, equality);
}
/**
* Combine same-positioned items from several iterables
* ```js
* zip( [1, 2, 3], [4, 5, 6], [7, 8, 9] );
* Yields: [ [1, 4, 7], [2, 5, 8], [3, 6, 9] ]
* ```
* @param its
* @returns
*/
function zip(...its) {
	if (its.length === 0) return fromArray$1([]);
	return isAsyncIterable(its[0]) ? zip$2(...its) : zip$1(...its);
}
/**
* Yield values from `iterable`, one at a time.
* Use `interval` to add time between each item.
* The first item is yielded without delay.
* @param iterable Iterable or AsyncIterable
* @param [interval=1] Interval to wait between yield 
*/
function fromIterable(iterable$1, interval) {
	if (isAsyncIterable(iterable$1) || interval !== void 0) return fromIterable$2(iterable$1, interval);
	return fromIterable$1(iterable$1);
}
/**
* Access `callback` as an iterable:
* ```js
* const fn = () => Math.random();
* for (const v of fromFunction(fn)) {
*  // Generate infinite random numbers
* }
* ```
* 
* Use {@link fromFunctionAwaited} to await `callback`.
* @param callback Function that generates a value
*/
function* fromFunction(callback) {
	while (true) {
		const v = callback();
		yield v;
	}
}
/**
* Access awaited `callback` as an iterable:
* ```js
* const fn = () => Math.random();
* for await (const v of fromFunctionAwaited(fn)) {
*  // Generate infinite random numbers
* }
* ```
* 
* `callback` can be async, result is awaited.
* This requires the use of `for await`.
* Use {@link fromFunction} otherwise;
* @param callback 
*/
async function* fromFunctionAwaited(callback) {
	while (true) {
		const v = await callback();
		yield v;
	}
}
/**
* Calls `callback` whenever the generator produces a value.
* 
* When using `asCallback`, call it with `await` to let generator 
* run its course before continuing:
* ```js
* await asCallback(tick({ interval:1000, loops:5 }), x => {
*  // Gets called 5 times, with 1000ms interval
* });
* console.log(`Hi`); // Prints after 5 seconds
* ```
* 
* Or if you skip the `await`, code continues and callback will still run:
* ```js
* asCallback(tick({ interval: 1000, loops: 5}), x => {
*  // Gets called 5 times, with 1000ms interval
* });
* console.log(`Hi`); // Prints immediately
* ```
* @param input 
* @param callback 
*/
function asCallback(input, callback, onDone) {
	if (isAsyncIterable(input)) return asCallback$3(input, callback);
	else {
		asCallback$2(input, callback);
		return;
	}
}

//#endregion
export { async_exports as Async, chain_exports as Chains, sync_exports as Sync, asCallback, chunks, combineLatestToArray, combineLatestToObject, computeAverage, concat, dropWhile, equals, every, fill, filter, find, flatten, forEach, fromArray, fromEvent, fromFunction, fromFunctionAwaited, fromIterable, hasEqualValuesShallow, isAsyncIterable, isIterable, iteratorController, last, map, max$1 as max, maxScore, min$1 as min, minScore, numbersCompute, reduce, slice, some$1 as some, toArray, unique, uniqueByValue, until, zip };
//# sourceMappingURL=iterables.js.map