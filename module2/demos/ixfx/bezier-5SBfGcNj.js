import { __export } from "./chunk-51aI8Tpl.js";
import { arrayTest, integerTest, numberTest, resultThrow } from "./src-BBD50Kth.js";
import { getOrGenerate } from "./basic-D0XoOdBJ.js";
import { SimpleEventEmitter } from "./src-CkygQtXo.js";
import { keyValueSorter } from "./key-value-JSby0EXT.js";
import { maxFast, minFast, numberArrayCompute, totalFast } from "./src-2eX6lIN8.js";
import { timeout } from "./src-BnNr7xTX.js";

//#region ../random/dist/src/weighted-index.js
/**
* Returns a random number from 0..weightings.length, distributed by the weighting values.
*
* eg: produces 0 20% of the time, 1 50% of the time, 2 30% of the time
* ```js
* weightedIndex([0.2, 0.5, 0.3]);
* ```
* @param weightings
* @param rand
* @returns
*/
const weightedIndex = (weightings, rand = Math.random) => {
	const precompute = [];
	let total = 0;
	for (let index = 0; index < weightings.length; index++) {
		total += weightings[index];
		precompute[index] = total;
	}
	if (total !== 1) throw new Error(`Weightings should add up to 1. Got: ${total}`);
	return () => {
		const v = rand();
		for (let index = 0; index < precompute.length; index++) if (v <= precompute[index]) return index;
		throw new Error(`Bug: weightedIndex could not select index`);
	};
};

//#endregion
//#region ../random/dist/src/arrays.js
/**
* Returns a random array index.
*
* ```js
* const v = [`blue`, `red`, `orange`];
* randomIndex(v); // Yields 0, 1 or 2
* ```
*
* Use {@link randomElement} if you want a value from `array`, not index.
*
* @param array Array
* @param rand Random generator. `Math.random` by default.
* @returns
*/
const randomIndex = (array, rand = Math.random) => Math.floor(rand() * array.length);
/**
* Plucks a random value from an array, optionally mutating
* the original array.
*
* @example Get a random element without modifying array
* ```js
* const { value, remainder } = randomPluck(inputArray);
* ```
*
* @example Get a random element, removing it from original array
* ```js
* const value = randomPluck(inputArray, { mutate: true });
* ```
*
* If the input array is empty, _undefined_ is returned as the value.
* @typeParam V - Type of items in array
* @param array Array to pluck item from
* @param options Options. By default { mutate: false, source: Math.random }
* @param rand Random generator. `Math.random` by default.
*
*/
function randomPluck(array, options = {}) {
	if (typeof array === `undefined`) throw new Error(`Param 'array' is undefined`);
	if (!Array.isArray(array)) throw new Error(`Param 'array' is not an array`);
	const mutate = options.mutate ?? false;
	const rand = options.source ?? Math.random;
	if (array.length === 0) {
		if (mutate) return void 0;
		return {
			value: void 0,
			remainder: []
		};
	}
	const index = randomIndex(array, rand);
	if (mutate) {
		const v = array[index];
		array.splice(index, 1);
		return v;
	} else {
		const inputCopy = [...array];
		inputCopy.splice(index, 1);
		return {
			value: array[index],
			remainder: inputCopy
		};
	}
}
/**
* Returns random element.
*
* ```js
* const v = [`blue`, `red`, `orange`];
* randomElement(v); // Yields `blue`, `red` or `orange`
* ```
*
* Use {@link randomIndex} if you want a random index within `array`.
*
* @param array
* @param rand Random generator. `Math.random` by default.
* @returns
*/
const randomElement = (array, rand = Math.random) => {
	resultThrow(arrayTest(array, `array`));
	return array[Math.floor(rand() * array.length)];
};
/**
* Selects a random array index, biased by the provided `weightings`.
*
* In the below example, `a` will be picked 20% of the time, `b` 50% and so on.
* ```js
* const data =    [  `a`,  `b`,  `c`,  `d` ]
* const weights = [ 0.2,  0.5,  0.1,  0.2 ]
* ```
* @param array
* @param weightings
* @param randomSource
*/
const randomElementWeightedSource = (array, weightings, randomSource = Math.random) => {
	if (array.length !== weightings.length) throw new Error(`Lengths of 'array' and 'weightings' should be the same.`);
	const r = weightedIndex(weightings, randomSource);
	return () => {
		const index = r();
		return array[index];
	};
};
/**
* Returns a shuffled copy of the input array.
* @example
* ```js
* const d = [1, 2, 3, 4];
* const s = shuffle(d);
* // d: [1, 2, 3, 4], s: [3, 1, 2, 4]
* ```
* @param dataToShuffle
* @param rand Random generator. `Math.random` by default.
* @returns Copy with items moved around randomly
* @typeParam V - Type of array items
*/
const shuffle = (dataToShuffle, rand = Math.random) => {
	const array = [...dataToShuffle];
	for (let index = array.length - 1; index > 0; index--) {
		const index_ = Math.floor(rand() * (index + 1));
		[array[index], array[index_]] = [array[index_], array[index]];
	}
	return array;
};

//#endregion
//#region ../random/dist/src/chance.js
/**
* Chance of returning `a` or `b`, based on threshold `p`.
*
* `p` sets the threshold for picking `b`. The higher the value (up to 1),
* the more likely `b` will be picked.
*
* ```js
* // 50% of the time it will return 100, 50% 110
* chance(0.5, 100, 110);
* // 90% of the time it will yield 110, 10% it will yield 100
* chance(0.9, 100, 110);
* ```
*
* @param p Threshold to choose option B (value or function)
* @param a Value or function for option A
* @param b Value or function for option B
* @param randomSource Source of random numbers
* @returns
*/
const chance = (p, a, b, randomSource) => {
	const source = randomSource ?? Math.random;
	const resolve = (x) => {
		if (typeof x === `function`) return x();
		return x;
	};
	const pp = resolve(p);
	resultThrow(numberTest(pp, `percentage`, `p`));
	if (source() <= pp) return resolve(b);
	else return resolve(a);
};

//#endregion
//#region ../random/dist/src/float-source.js
/**
* Source for random bipolar values
* ```js
* const r = bipolarSource();
* r(); // Produce random value on -1...1 scale
* ```
*
* Options can be provided, for example
* ```js
* // -0.5 to 0.5 range
* bipolarSource({ max: 0.5 });
* ```
*
*
* @param maxOrOptions Maximum value (number) or options for random generation
* @returns
*/
const bipolarSource = (maxOrOptions) => {
	const source = floatSource(maxOrOptions);
	return () => source() * 2 - 1;
};
/**
* Returns a random bipolar value
* ```js
* const r = bipolar(); // -1...1 random
* ```
*
* Options can be provided, eg.
* ```js
* bipolar({ max: 0.5 }); // -0.5..0.5 random
* ```
*
* Use {@link bipolarSource} if you want to generate random
* values with same settings repeatedly.
* @param maxOrOptions
* @returns
*/
const bipolar = (maxOrOptions) => {
	const source = bipolarSource(maxOrOptions);
	return source();
};
/**
* Returns a function that produces random float values.
* Use {@link float} to produce a valued directly.
*
* Random float between `max` (exclusive) and 0 (inclusive). Max is 1 if unspecified.
*
*
* ```js
* // Random number between 0..1 (but not including 1)
* // (this would be identical to Math.random())
* const r = floatSource();
* r(); // Execute to produce random value
*
* // Random float between 0..100 (but not including 100)
* const v = floatSource(100)();
* ```
*
* Options can be used:
* ```js
* // Random float between 20..40 (possibly including 20, but always lower than 40)
* const r = floatSource({ min: 20, max: 40 });
* ```
* @param maxOrOptions Maximum value (exclusive) or options
* @returns Random number
*/
const floatSource = (maxOrOptions = 1) => {
	const options = typeof maxOrOptions === `number` ? { max: maxOrOptions } : maxOrOptions;
	let max$1 = options.max ?? 1;
	let min$1 = options.min ?? 0;
	const source = options.source ?? Math.random;
	resultThrow(numberTest(min$1, ``, `min`), numberTest(max$1, ``, `max`));
	if (!options.min && max$1 < 0) {
		min$1 = max$1;
		max$1 = 0;
	}
	if (min$1 > max$1) throw new Error(`Min is greater than max. Min: ${min$1.toString()} max: ${max$1.toString()}`);
	return () => source() * (max$1 - min$1) + min$1;
};
/**
* Returns a random float between `max` (exclusive) and 0 (inclusive).
*
* Max is 1 if unspecified.
* Use {@link floatSource} to get a function that produces values. This is used internally.
*
* ```js
* // Random number between 0..1 (but not including 1)
* // (this would be identical to Math.random())
* const v = float();
* // Random float between 0..100 (but not including 100)
* const v = float(100);
* ```
*
* Options can be used:
* ```js
* // Random float between 20..40 (possibly including 20, but always lower than 40)
* const v = float({ min: 20, max: 40 });
* ```
* @param maxOrOptions Maximum value (exclusive) or options
* @returns Random number
*/
const float = (maxOrOptions = 1) => floatSource(maxOrOptions)();

//#endregion
//#region ../random/dist/src/non-zero.js
/**
* Keeps generating a random number until
* it's not 0
* @param source Random number generator
* @returns Non-zero number
*/
const calculateNonZero = (source = Math.random) => {
	let v = 0;
	while (v === 0) v = source();
	return v;
};

//#endregion
//#region ../random/dist/src/gaussian.js
/**
* Returns a random number with gaussian (ie. bell-curved) distribution
*
* @example Random number between 0..1 with gaussian distribution
* ```js
* gaussian();
* ```
*
* @example Distribution can be skewed
* ```js
* gaussian(10);
* ```
*
* Use {@link gaussianSource} if you want a function with skew value baked-in.
* @param skew Skew factor. Defaults to 1, no skewing. Above 1 will skew to left, below 1 will skew to right
* @returns
*/
const gaussian = (skew = 1) => gaussianSource(skew)();
/**
* Returns a function that generates a gaussian-distributed random number
* @example
* Random number between 0..1 with gaussian distribution
* ```js
* // Create function
* const r = gaussianSource();
*
* // Generate random value
* r();
* ```
*
* @example
* Pass the random number generator elsewhere
* ```js
* const r = gaussianSource(10);
*
* // Randomise array with gaussian distribution
* Arrays.shuffle(r);
* ```
*
* If you want to fit a value to a gaussian curve, see Modulation.gaussian instead.
* @param skew
* @returns
*/
const gaussianSource = (skew = 1) => {
	const min$1 = 0;
	const max$1 = 1;
	const compute = () => {
		const u = calculateNonZero();
		const v = calculateNonZero();
		let result = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
		result = result / 10 + .5;
		if (result > 1 || result < 0) result = compute();
		else {
			result = Math.pow(result, skew);
			result *= max$1 - min$1;
			result += min$1;
		}
		return result;
	};
	return compute;
};

//#endregion
//#region ../random/dist/src/guid.js
/**
* Generates a six-digit roughly unique id
* ```js
* const id = shortGuid();
* ```
* @param options Options.
* @returns
*/
const shortGuid = (options = {}) => {
	const source = options.source ?? Math.random;
	const firstPart = Math.trunc(source() * 46656);
	const secondPart = Math.trunc(source() * 46656);
	const firstPartString = `000${firstPart.toString(36)}`.slice(-3);
	const secondPartString = `000${secondPart.toString(36)}`.slice(-3);
	return firstPartString + secondPartString;
};

//#endregion
//#region ../random/dist/src/util/count.js
/**
* Yields `amount` integers, counting by one from zero. If a negative amount is used,
* count decreases. If `offset` is provided, this is added to the return result.
* @example
* ```js
* const a = [...count(5)]; // Yields five numbers: [0,1,2,3,4]
* const b = [...count(-5)]; // Yields five numbers: [0,-1,-2,-3,-4]
* for (const v of count(5, 5)) {
*  // Yields: 5, 6, 7, 8, 9
* }
* const c = [...count(5,1)]; // Yields [1,2,3,4,5]
* ```
*
* @example Used with forEach
* ```js
* // Prints `Hi` 5x
* forEach(count(5), () => // do something);
* ```
*
* If you want to accumulate return values, consider using Flow.repeat.
*
* @example Run some code every 100ms, 10 times:
* ```js
* import { interval } from '@ixfx/flow.js'
* import { count } from '@ixfx/numbers.js'
* const counter = count(10);
* for await (const v of interval(counter, { fixedIntervalMs: 100 })) {
*  // Do something
* }
* ```
* @param amount Number of integers to yield
* @param offset Added to result
*/
function* count(amount, offset = 0) {
	resultThrow(integerTest(amount, ``, `amount`), integerTest(offset, ``, `offset`));
	if (amount === 0) return;
	let index = 0;
	do
		yield amount < 0 ? -index + offset : index + offset;
	while (index++ < Math.abs(amount) - 1);
}

//#endregion
//#region ../random/dist/src/integer.js
/**
* Returns a function that produces a random integer between `max` (exclusive) and 0 (inclusive)
* Use {@link integer} if you want a random number directly.
*
* Invoke directly:
* ```js
* integerSource(10)();  // Random number 0-9
* ```
*
* Or keep a reference to re-compute:
* ```js
* const r = integerSource(10);
* r(); // Produce a random integer
* ```
*
* If a negative value is given, this is assumed to be the
* minimum (inclusive), with 0 as the max (inclusive)
* ```js
* integerSource(-5)();  // Random number from -5 to 0
* ```
*
* Specify options for a custom minimum or source of random:
* ```js
* integerSource({ max: 5,  min: 10 })();  // Random number 4-10
* integerSource({ max: -5, min: -10 })(); // Random number from -10 to -6
* integerSource({ max: 10, source: Math.random })(); // Random number between 0-9, with custom source of random
* ```
*
* Throws an error if max & min are equal
* @param maxOrOptions Max value (exclusive), or set of options
* @returns Random integer
*/
const integerSource = (maxOrOptions) => {
	if (typeof maxOrOptions === `undefined`) throw new TypeError(`maxOrOptions is undefined`);
	const options = typeof maxOrOptions === `number` ? { max: maxOrOptions } : maxOrOptions;
	let max$1 = Math.floor(options.max ?? 100);
	let min$1 = Math.floor(options.min ?? 0);
	if (!options.min && max$1 < 0) {
		max$1 = 1;
		min$1 = options.max ?? 0;
	}
	const randomSource = options.source ?? Math.random;
	if (min$1 > max$1) throw new Error(`Min value is greater than max (min: ${min$1.toString()} max: ${max$1.toString()})`);
	resultThrow(numberTest(min$1, ``, `min`), numberTest(max$1, ``, `max`));
	if (max$1 === min$1) throw new Error(`Max and min values cannot be the same (${max$1.toString()})`);
	const amt = Math.abs(max$1 - min$1);
	return () => Math.floor(randomSource() * amt) + min$1;
};
/**
* Returns a random integer between `max` (exclusive) and 0 (inclusive)
* Use {@link integerSource} to return a function instead.
*
* ```js
* integer(10);  // Random number 0,1..9
* ```
*
* If a negative value is given, this is assumed to be the
* minimum (inclusive), with 0 as the max (inclusive)
* ```js
* integer(-5);  // Random number -5,-4,...0
* ```
*
* Specify options for a custom minimum or source of random:
* ```js
* integer({ max: 5,  min: 10 });  // Random number 4-10
* integer({ max: -5, min: -10 }); // Random number from -10 to -6
* integer({ max: 10, source: Math.random }); // Random number between 0-9, with custom source of random
* ```
*
* Throws an error if max & min are equal
* @param maxOrOptions Max value (exclusive), or set of options
* @returns Random integer
*/
const integer = (maxOrOptions) => integerSource(maxOrOptions)();
/**
* Returns a generator over random unique integers, up to
* but not including the given max value.
*
* @example 0..9 range
* ```js
* const rand = [ ...integerUniqueGen(10) ];
* // eg: [2, 9, 6, 0, 8, 7, 3, 4, 5, 1]
* ```
*
* @example Options can be provided:
* ```js
* // 5..9 range
* const rand = [ ...integerUniqueGen({ min: 5, max: 10 })];
* ```
*
* Range can be looped. Once the initial random walk through the number
* range completes, it starts again in a new random way.
*
* ```js
* for (const r of integerUniqueGen({ max: 10, loop: true })) {
*  // Warning: loops forever
* }
* ```
*
* Behind the scenes, an array of numbers is created that captures the range, this is then
* shuffled on the first run, and again whenever the iterator loops, if that's allowed.
*
* As a consequence, large ranges will consume larger amounts of memory.
* @param maxOrOptions
* @returns
*/
function* integerUniqueGen(maxOrOptions) {
	const options = typeof maxOrOptions === `number` ? { max: maxOrOptions } : maxOrOptions;
	const min$1 = options.min ?? 0;
	const max$1 = options.max ?? 100;
	const source = options.source ?? Math.random;
	const loop = options.loop ?? false;
	resultThrow(integerTest(min$1, ``, `min`), integerTest(max$1, ``, `max`));
	if (min$1 > max$1) throw new Error(`Min value is greater than max. Min: ${min$1.toString()} Max: ${max$1.toString()}`);
	const origRange = [...count(max$1 - min$1, min$1)];
	let numberRange = shuffle(origRange);
	let index = 0;
	while (true) {
		if (index === numberRange.length) if (loop) numberRange = shuffle(origRange, source);
		else return;
		yield numberRange[index++];
	}
}

//#endregion
//#region ../random/dist/src/seeded.js
/**
* Reproducible random values using the Merseene Twister algorithm.
* With the same seed value, it produces the same series of random values.
*
* ```js
* // Seed with a value of 100
* const r = mersenneTwister(100);
* r.float();         // 0..1
* ```
*
* Integer values can also be produced. First parameter
* is the maximum value (exclusive), the optional second
* parameter is the minimum value (inclusive).
* ```js
* r.integer(10);     // 0..9
* r.integer(10, 5);  // 5..9
*
* // Eg random array index:
* r.integer(someArray.length);
* ```
*
* Adapted from George MacKerron's implementation. MIT License.
* https://github.com/jawj/mtwist/
* @param seed Seed value 0..4294967295. Default: random seed.
*/
function mersenneTwister(seed) {
	if (!seed) seed = Math.random() * 4294967295;
	let mt = new Array(624);
	mt[0] = seed >>> 0;
	const n1 = 1812433253;
	for (let mti$1 = 1; mti$1 < 624; mti$1++) {
		const n2 = mt[mti$1 - 1] ^ mt[mti$1 - 1] >>> 30;
		mt[mti$1] = ((n1 & 4294901760) * n2 >>> 0) + ((n1 & 65535) * n2 >>> 0) + mti$1 >>> 0;
	}
	let mti = 624;
	const randomUint32 = () => {
		let y;
		if (mti >= 624) {
			for (let i = 0; i < 227; i++) {
				y = (mt[i] & 2147483648 | mt[i + 1] & 2147483647) >>> 0;
				mt[i] = (mt[i + 397] ^ y >>> 1 ^ (y & 1 ? 2567483615 : 0)) >>> 0;
			}
			for (let i = 227; i < 623; i++) {
				y = (mt[i] & 2147483648 | mt[i + 1] & 2147483647) >>> 0;
				mt[i] = (mt[i - 227] ^ y >>> 1 ^ (y & 1 ? 2567483615 : 0)) >>> 0;
			}
			y = (mt[623] & 2147483648 | mt[0] & 2147483647) >>> 0;
			mt[623] = (mt[396] ^ y >>> 1 ^ (y & 1 ? 2567483615 : 0)) >>> 0;
			mti = 0;
		}
		y = mt[mti++];
		y = (y ^ y >>> 11) >>> 0;
		y = (y ^ y << 7 & 2636928640) >>> 0;
		y = (y ^ y << 15 & 4022730752) >>> 0;
		y = (y ^ y >>> 18) >>> 0;
		return y;
	};
	const float$1 = () => randomUint32() / 4294967296;
	const integer$1 = (maxExclusive, minInclusive = 0) => {
		if (maxExclusive < 1) throw new Error("Upper bound must be greater than or equal to 1");
		if (maxExclusive > 4294967296) throw new Error("Upper bound must not be greater than 4294967296");
		if (maxExclusive === 1) return 0;
		let range = maxExclusive - minInclusive;
		const bitsNeeded = Math.ceil(Math.log2(range)), bitMask = (1 << bitsNeeded) - 1;
		while (true) {
			const int = randomUint32() & bitMask;
			if (int < range) return minInclusive + int;
		}
	};
	return {
		integer: integer$1,
		float: float$1
	};
}

//#endregion
//#region ../random/dist/src/string.js
/**
* Returns a string of random letters and numbers of a given `length`.
*
* ```js
* string();  // Random string of length 5
* string(4); // eg. `4afd`
* ```
* @param lengthOrOptions Length of random string, or options.
* @returns Random string
*/
const string = (lengthOrOptions = 5) => {
	const options = typeof lengthOrOptions === `number` ? { length: lengthOrOptions } : lengthOrOptions;
	const calculate = options.source ?? Math.random;
	const length = options.length ?? 5;
	let returnValue = ``;
	while (returnValue.length < length) returnValue += calculate().toString(36).slice(2);
	return returnValue.substring(0, length);
};

//#endregion
//#region ../random/dist/src/time.js
/**
* Returns a random number of minutes, with a unit of milliseconds.
*
* Max value is exclusive, defaulting to 5.
* Use {@link minutesMs} to get a value directly, or {@link minutesMsSource} to return a function.
*
* @example Random value from 0 to one milli less than 5 * 60 * 1000
* ```js
* // Create function that returns value
* const f = minutesMsSource(5);
*
* f(); // Generate value
* ```
*
* @example Specified options:
* ```js
* // Random time between one minute and 5 minutes
* const f = minutesMsSource({ max: 5, min: 1 });
* f();
* ```
*
* @remarks
* It's a very minor function, but can make
* code a little more literate:
* ```js
* // Random timeout of up to 5 mins
* setTimeout(() => { ... }, minutesMsSource(5));
* ```
* @param maxMinutesOrOptions
* @see {@link minutesMs}
* @returns Function that produces a random value
*/
const minutesMsSource = (maxMinutesOrOptions) => {
	const options = typeof maxMinutesOrOptions === `number` ? { max: maxMinutesOrOptions } : maxMinutesOrOptions;
	const min$1 = (options.min ?? 0) * 60 * 1e3;
	const max$1 = (options.max ?? 5) * 60 * 1e3;
	return integerSource({
		...options,
		max: max$1,
		min: min$1
	});
};
/**
* Return a random time value in milliseconds, using minute values to set range.
*
* @example Random value from 0 to one milli less than 5 * 60 * 1000
* ```js
* // Random value from 0 to one milli less than 5*60*1000
* minuteMs(5);
* ```
*
* @example Specified options:
* ```js
* // Random time between one minute and 5 minutes
* minuteMs({ max: 5, min: 1 });
* ```
*
* @param maxMinutesOrOptions
* @see {@link minutesMsSource}
* @returns Milliseconds
*/
const minutesMs = (maxMinutesOrOptions) => minutesMsSource(maxMinutesOrOptions)();
/**
* Returns function which produces a random number of seconds, with a unit of milliseconds.
*
* Maximum value is exclusive, defaulting to 5
* Use {@link secondsMs} to return a random value directly, or {@link secondsMsSource} to return a function.
*
* @example Random milliseconds between 0..4999
* ```js
* // Create function
* const f = secondsMsSource(5000);
* // Produce a value
* const value = f();
* ```
*
* @example Options can be provided
* ```js
* // Random milliseconds between 1000-4999
* const value = secondsMsSource({ max:5, min:1 })();
* // Note the extra () at the end to execute the function
* ```
*
* @remarks
* It's a very minor function, but can make
* code a little more literate:
* ```js
* // Random timeout of up to 5 seconds
* setTimeout(() => { ...}, secondsMsSource(5));
* ```
* @param maxSecondsOrOptions Maximum seconds, or options.
* @returns Milliseconds
*/
const secondsMsSource = (maxSecondsOrOptions) => {
	const options = typeof maxSecondsOrOptions === `number` ? { max: maxSecondsOrOptions } : maxSecondsOrOptions;
	const min$1 = (options.min ?? 0) * 1e3;
	const max$1 = (options.max ?? 5) * 1e3;
	return () => integer({
		...options,
		max: max$1,
		min: min$1
	});
};
/**
* Generate random time in milliseconds, using seconds to set the bounds
*
* @example Random milliseconds between 0..4999
* ```js
* secondsMs(5000);
* ```
*
* @example Options can be provided
* ```js
* // Random milliseconds between 1000-4999
* secondsMs({ max:5, min:1 });
* ```
* @param maxSecondsOrOptions
* @returns
*/
const secondsMs = (maxSecondsOrOptions) => secondsMsSource(maxSecondsOrOptions)();

//#endregion
//#region ../random/dist/src/util/clamp.js
function clamp(v, min$1 = 0, max$1 = 1) {
	if (v < min$1) return min$1;
	if (v > max$1) return max$1;
	return v;
}

//#endregion
//#region ../random/dist/src/weighted-integer.js
/**
* Random integer, weighted according to an easing function.
* Number will be inclusive of `min` and below `max`.
*
* @example 0..99
* ```js
* const r = Random.weightedIntegerFn(100);
* r(); // Produce value
* ```
*
* @example 20..29
* ```js
* const r = Random.weightedIntegerFn({ min: 20, max: 30 });
* r(); // Produce value
* ```
*
* @example  0..99 with 'quadIn' easing
* ```js
* const r = Random.weightedInteger({ max: 100, easing: `quadIn` });
* ```
*
* Note: result from easing function will be clamped to
* the min/max (by default 0-1);
*
* @param options Options. By default { max:1, min: 0 }
* @returns Function that produces a random weighted integer
*/
const weightedIntegerSource = (options) => {
	const source = options.source ?? Math.random;
	if (typeof options.easingFunction === `undefined`) throw new Error(`Param 'easingFunction' is undefined`);
	const max$1 = options.max ?? 1;
	const min$1 = options.min ?? 0;
	if (max$1 === min$1) throw new Error(`Param 'max' is the same as  'min'`);
	if (max$1 < min$1) throw new Error(`Param 'max' should be greater than  'min'`);
	const compute = () => {
		const r = clamp(options.easingFunction(source()));
		return Math.floor(r * (max$1 - min$1)) + min$1;
	};
	return compute;
};
/**
* Generate a weighted-random integer.
*
* @example 0..99
* ```js
* Random.weightedInteger(100);
* ```
*
* @example 20..29
* ```js
* Random.weightedInteger({ min: 20, max: 30 });
* ```
*
* @example  0..99 with 'quadIn' easing
* ```js
* Random.weightedInteger({ max: 100, easing: `quadIn` })
* ```
* @param options Options. Default: { max: 1, min: 0 }
* @returns Random weighted integer
*/
const weightedInteger = (options) => weightedIntegerSource(options)();

//#endregion
//#region ../random/dist/src/weighted.js
/***
* Returns a random number, 0..1, weighted by a given easing function.
* See @ixfx/modulation.weighted to use a named easing function.
* Use {@link weightedSource} to return a function instead.
*
* @see {@link weightedSource} Returns a function rather than value
* @returns Random number (0-1)
*/
const weighted = (options) => weightedSource(options)();
/***
* Returns a random number, 0..1, weighted by a given easing function.
* See @ixfx/modulation.weighted to use a named easing function.
* Use {@link weighted} to get a value directly.
*
* @see {@link weighted} Returns value instead of function
* @returns Function which returns a weighted random value
*/
const weightedSource = (options) => {
	const source = options.source ?? Math.random;
	if (typeof options.easing !== `undefined`) throw new Error(`Param 'easingName' unavailable. Use @ixfx/modulation.weighted instead.`);
	if (typeof options.easingFunction === `undefined`) throw new Error(`Param 'easingFunction' is undefined`);
	return () => options.easingFunction(source());
};

//#endregion
//#region ../random/dist/src/index.js
var src_exports$1 = {};
__export(src_exports$1, {
	bipolar: () => bipolar,
	bipolarSource: () => bipolarSource,
	calculateNonZero: () => calculateNonZero,
	chance: () => chance,
	float: () => float,
	floatSource: () => floatSource,
	gaussian: () => gaussian,
	gaussianSource: () => gaussianSource,
	integer: () => integer,
	integerSource: () => integerSource,
	integerUniqueGen: () => integerUniqueGen,
	mersenneTwister: () => mersenneTwister,
	minutesMs: () => minutesMs,
	minutesMsSource: () => minutesMsSource,
	randomElement: () => randomElement,
	randomElementWeightedSource: () => randomElementWeightedSource,
	randomIndex: () => randomIndex,
	randomPluck: () => randomPluck,
	secondsMs: () => secondsMs,
	secondsMsSource: () => secondsMsSource,
	shortGuid: () => shortGuid,
	shuffle: () => shuffle,
	string: () => string,
	weighted: () => weighted,
	weightedIndex: () => weightedIndex,
	weightedInteger: () => weightedInteger,
	weightedIntegerSource: () => weightedIntegerSource,
	weightedSource: () => weightedSource
});

//#endregion
//#region ../trackers/dist/src/changes.js
/**
* Run a function if a value changes
* ```js
* const r = handleChangeResult(trackNumberChange, (value) => {
*  // Called when value changes
* });
* r(10);
* ```
* @param monitor
* @param onChanged
* @param onNotChanged
* @returns
*/
function handleChangeResult(monitor, onChanged, onNotChanged) {
	return (v) => {
		const r = monitor(v);
		if (r.changed) onChanged(v, r.changes, r.total);
		else if (typeof onNotChanged !== `undefined`) onNotChanged(v, r.identicalRun, r.total);
	};
}
/**
* Returns a function to monitor value changes.
* ```js
* const f = trackNumberChange(true);
* f(10); // { changed: true, changesCount: 1 }
* f(10); // { changed: false, changesCount: 1 }
* ```
*
* Default options:
* * nanHandling: error
* * includeFirstValueInCount: false
*
* NaN handling:
* * allow: use NaN value as a legal value and report a change
* * skip: ignore NaN values, reporting back no change and use the same changes count
* * error: throw an error if a NaN value is received
*
*
* @returns
*/
function trackNumberChange(options = {}) {
	const nanHandling = options.nanHandling ?? `error`;
	const includeFirstValueInCount = options.includeFirstValueInCount ?? false;
	let lastValue = options.initial;
	let changes = 0;
	let total = 0;
	let identicalRun = 0;
	return (v) => {
		if (typeof v !== `number`) throw new TypeError(`Parameter should be number. Got type: ${typeof v}`);
		if (Number.isNaN(v)) switch (nanHandling) {
			case `error`: throw new Error(`Parameter is NaN`);
			case `skip`: return {
				changed: false,
				changes,
				total,
				identicalRun
			};
		}
		total++;
		let eq = lastValue === v;
		if (Number.isNaN(lastValue) && Number.isNaN(v)) eq = true;
		if (!eq) {
			identicalRun = 0;
			if (lastValue !== void 0 || includeFirstValueInCount) changes++;
			lastValue = v;
			return {
				changed: true,
				changes,
				total,
				identicalRun
			};
		} else identicalRun++;
		return {
			changed: false,
			changes,
			total,
			identicalRun
		};
	};
}
/**
* Returns a function to track changes in a boolean value
* ```js
* const t = trackBooleanChange();
* t(true); // { changed:false }
* t(true); // { changed:false }
* t(false); // { changed: true }
* ```
*
* Default options:
* * includeFirstValueInCount: false
* @param options
* @returns
*/
function trackBooleanChange(options = {}) {
	const includeFirstValueInCount = options.includeFirstValueInCount ?? false;
	let lastValue = options.initial;
	let changes = 0;
	let total = 0;
	let identicalRun = 0;
	return (v) => {
		if (typeof v !== `boolean`) throw new TypeError(`Parameter should be boolean. Got type: ${typeof v}`);
		total++;
		if (lastValue !== v) {
			identicalRun = 0;
			if (lastValue !== void 0 || includeFirstValueInCount) changes++;
			lastValue = v;
			return {
				changed: true,
				changes,
				total,
				identicalRun
			};
		} else identicalRun++;
		return {
			changed: false,
			changes,
			total,
			identicalRun
		};
	};
}

//#endregion
//#region ../trackers/dist/src/frequency-mutable.js
/**
* Frequency keeps track of how many times a particular value is seen, but
* unlike a Map it does not store the data. By default compares
* items by value (via JSON.stringify).
*
* Fires `change` event when items are added or it is cleared.
*
* Overview
* ```
* const fh = new FrequencyTracker();
* fh.add(value); // adds a value
* fh.clear();    // clears all data
* fh.keys() / .values() // returns an iterator for keys and values
* fh.toArray();  //  returns an array of data in the shape [[key,freq],[key,freq]...]
* ```
*
* Usage
* ```
* const fh = new FrequencyTracker();
* fh.add(`apples`); // Count an occurence of `apples`
* fh.add(`oranges)`;
* fh.add(`apples`);
*
* const fhData = fh.toArray(); // Expect result [[`apples`, 2], [`oranges`, 1]]
* fhData.forEach((d) => {
*  const [key,freq] = d;
*  console.log(`Key '${key}' occurred ${freq} time(s).`);
* })
* ```
*
* Custom key string
* ```
* const fh = frequency( person => person.name);
* // All people with name `Samantha` will be counted in same group
* fh.add({name:`Samantha`, city:`Brisbane`});
* ```
* @typeParam V - Type of items
*/
var FrequencyTracker = class extends SimpleEventEmitter {
	#store;
	#keyString;
	/**
	* Constructor
	* @param keyString Function to key items. Uses JSON.stringify by default
	*/
	constructor(keyString) {
		super();
		this.#store = /* @__PURE__ */ new Map();
		if (typeof keyString === `undefined`) keyString = (a) => {
			if (a === void 0) throw new Error(`Cannot create key for undefined`);
			return typeof a === `string` ? a : JSON.stringify(a);
		};
		this.#keyString = keyString;
	}
	/**
	* Clear data. Fires `change` event
	*/
	clear() {
		this.#store.clear();
		this.fireEvent(`change`, { context: this });
	}
	/**
	* @returns Iterator over keys (ie. groups)
	*/
	keys() {
		return this.#store.keys();
	}
	/**
	* @returns Iterator over frequency counts
	*/
	values() {
		return this.#store.values();
	}
	/**
	* @returns Copy of entries as an array of `[key, count]`
	*/
	toArray() {
		return [...this.#store.entries()];
	}
	/**
	* Returns a string with keys and counts, useful for debugging.
	* @returns
	*/
	debugString() {
		let t$1 = ``;
		for (const [key, count$1] of this.#store.entries()) t$1 += `${key}: ${count$1.toString()}, `;
		if (t$1.endsWith(`, `)) return t$1.slice(0, Math.max(0, t$1.length - 2));
		return t$1;
	}
	/**
	*
	* @param value Value to count
	* @returns Frequency of value, or _undefined_ if it does not exist
	*/
	frequencyOf(value) {
		if (typeof value === `string`) return this.#store.get(value);
		const key = this.#keyString(value);
		return this.#store.get(key);
	}
	/**
	*
	* @param value Value to count
	* @returns Relative frequency of `value`, or _undefined_ if it does not exist
	*/
	relativeFrequencyOf(value) {
		let freq;
		if (typeof value === `string`) freq = this.#store.get(value);
		else {
			const key = this.#keyString(value);
			freq = this.#store.get(key);
		}
		if (freq === void 0) return;
		const mma = this.computeValues();
		return freq / mma.total;
	}
	/**
	* Returns copy of entries as an array
	* @returns Copy of entries as an array
	*/
	entries() {
		return [...this.#store.entries()];
	}
	/**
	* Calculate min,max,avg,total & count from values
	* @returns Returns `{min,max,avg,total}`
	*/
	computeValues() {
		const valuesAsNumbers = [...this.values()];
		return numberArrayCompute(valuesAsNumbers);
	}
	/**
	* Return entries sorted
	* @param sortStyle Sorting style (default: _value_, ie. count)
	* @returns Sorted array of [key,frequency]
	*/
	entriesSorted(sortStyle = `value`) {
		const s = keyValueSorter(sortStyle);
		return s(this.entries());
	}
	/**
	* Add one or more values, firing _change_ event.
	* @param values Values to add. Fires _change_ event after adding item(s)
	*/
	add(...values) {
		if (typeof values === `undefined`) throw new Error(`Param 'values' undefined`);
		const keys = values.map((v) => this.#keyString(v));
		for (const key of keys) {
			const score = this.#store.get(key) ?? 0;
			this.#store.set(key, score + 1);
		}
		this.fireEvent(`change`, { context: this });
	}
};
const frequency = (keyString) => new FrequencyTracker(keyString);

//#endregion
//#region ../trackers/dist/src/tracker-base.js
/**
* Base tracker class
*/
var TrackerBase = class {
	/**
	* @ignore
	*/
	seenCount;
	/**
	* @ignore
	*/
	storeIntermediate;
	/**
	* @ignore
	*/
	resetAfterSamples;
	/**
	* @ignore
	*/
	sampleLimit;
	id;
	debug;
	constructor(opts = {}) {
		this.id = opts.id ?? `tracker`;
		this.debug = opts.debug ?? false;
		this.sampleLimit = opts.sampleLimit ?? -1;
		this.resetAfterSamples = opts.resetAfterSamples ?? -1;
		this.storeIntermediate = opts.storeIntermediate ?? (this.sampleLimit > -1 || this.resetAfterSamples > -1);
		this.seenCount = 0;
		if (this.debug) console.log(`TrackerBase: sampleLimit: ${this.sampleLimit} resetAfter: ${this.resetAfterSamples} store: ${this.storeIntermediate}`);
	}
	/**
	* Reset tracker
	*/
	reset() {
		this.seenCount = 0;
		this.onReset();
	}
	/**
	* Adds a value, returning computed result.
	*
	* At this point, we check if the buffer is larger than `resetAfterSamples`. If so, `reset()` is called.
	* If not, we check `sampleLimit`. If the buffer is twice as large as sample limit, `trimStore()` is
	* called to take it down to sample limit, and `onTrimmed()` is called.
	* @param p
	* @returns
	*/
	seen(...p) {
		if (this.resetAfterSamples > 0 && this.seenCount > this.resetAfterSamples) this.reset();
		else if (this.sampleLimit > 0 && this.seenCount > this.sampleLimit * 2) {
			this.seenCount = this.trimStore(this.sampleLimit);
			this.onTrimmed(`resize`);
		}
		this.seenCount += p.length;
		const t$1 = this.filterData(p);
		return this.computeResults(t$1);
	}
};

//#endregion
//#region ../trackers/dist/src/primitive-tracker.js
var PrimitiveTracker = class extends TrackerBase {
	values;
	timestamps;
	constructor(opts) {
		super(opts);
		this.values = [];
		this.timestamps = [];
	}
	/**
	* Reduces size of value store to `limit`. Returns
	* number of remaining items
	* @param limit
	*/
	trimStore(limit) {
		if (limit >= this.values.length) return this.values.length;
		this.values = this.values.slice(-limit);
		this.timestamps = this.timestamps.slice(-limit);
		return this.values.length;
	}
	onTrimmed(reason) {}
	get last() {
		return this.values.at(-1);
	}
	get initial() {
		return this.values.at(0);
	}
	/**
	* Returns number of recorded values (this can include the initial value)
	*/
	get size() {
		return this.values.length;
	}
	/**
	* Returns the elapsed time, in milliseconds since the instance was created
	*/
	get elapsed() {
		if (this.values.length < 0) throw new Error(`No values seen yet`);
		return Date.now() - this.timestamps[0];
	}
	onReset() {
		this.values = [];
		this.timestamps = [];
	}
	/**
	* Tracks a value
	*/
	filterData(rawValues) {
		const lastValue = rawValues.at(-1);
		const last = {
			value: lastValue,
			at: performance.now()
		};
		const values = rawValues.map((value) => ({
			at: performance.now(),
			value
		}));
		if (this.storeIntermediate) {
			this.values.push(...rawValues);
			this.timestamps.push(...values.map((v) => v.at));
		} else switch (this.values.length) {
			case 0: {
				this.values.push(last.value);
				this.timestamps.push(last.at);
				break;
			}
			case 2: {
				this.values[1] = last.value;
				this.timestamps[1] = last.at;
				break;
			}
			case 1: {
				this.values.push(last.value);
				this.timestamps.push(last.at);
				break;
			}
		}
		return values;
	}
};

//#endregion
//#region ../trackers/dist/src/number-tracker.js
var NumberTracker = class extends PrimitiveTracker {
	total = 0;
	min = Number.MAX_SAFE_INTEGER;
	max = Number.MIN_SAFE_INTEGER;
	get avg() {
		return this.total / this.seenCount;
	}
	/**
	* Difference between last value and initial.
	* Eg. if last value was 10 and initial value was 5, 5 is returned (10 - 5)
	* If either of those is missing, undefined is returned
	*/
	difference() {
		if (this.last === void 0) return;
		if (this.initial === void 0) return;
		return this.last - this.initial;
	}
	/**
	* Relative difference between last value and initial.
	* Eg if last value was 10 and initial value was 5, 2 is returned (200%)
	*/
	relativeDifference() {
		if (this.last === void 0) return;
		if (this.initial === void 0) return;
		return this.last / this.initial;
	}
	onReset() {
		this.min = Number.MAX_SAFE_INTEGER;
		this.max = Number.MIN_SAFE_INTEGER;
		this.total = 0;
		super.onReset();
	}
	/**
	* When trimmed, recomputes to set total/min/max to be based on
	* current values.
	* @param reason
	*/
	onTrimmed(reason) {
		this.min = minFast(this.values);
		this.max = maxFast(this.values);
		this.total = totalFast(this.values);
	}
	computeResults(values) {
		if (values.some((v) => Number.isNaN(v))) throw new Error(`Cannot add NaN`);
		const numbers = values.map((value) => value.value);
		this.total = numbers.reduce((accumulator, v) => accumulator + v, this.total);
		this.min = Math.min(...numbers, this.min);
		this.max = Math.max(...numbers, this.max);
		const r = {
			max: this.max,
			min: this.min,
			total: this.total,
			avg: this.avg
		};
		return r;
	}
	getMinMaxAvg() {
		return {
			min: this.min,
			max: this.max,
			avg: this.avg
		};
	}
};
/**
* Keeps track of the total, min, max and avg in a stream of values. By default values
* are not stored.
*
* Usage:
*
* ```js
* import { number } from '@ixfx/trackers.js';
*
* const t = number();
* t.seen(10);
*
* t.avg / t.min/ t.max
* t.initial; // initial value
* t.size;    // number of seen values
* t.elapsed; // milliseconds since intialisation
* t.last;    // last value
* ```
*
* To get `{ avg, min, max, total }`
* ```
* t.getMinMax()
* ```
*
* Use `t.reset()` to clear everything.
*
* Trackers can automatically reset after a given number of samples
* ```
* // reset after 100 samples
* const t = number({ resetAfterSamples: 100 });
* ```
*
* To store values, use the `storeIntermediate` option:
*
* ```js
* const t = number({ storeIntermediate: true });
* ```
*
* Difference between last value and initial value:
* ```js
* t.relativeDifference();
* ```
*
* Get raw data (if it is being stored):
* ```js
* t.values; // array of numbers
* t.timestampes; // array of millisecond times, indexes correspond to t.values
* ```
*/
const number = (opts = {}) => new NumberTracker(opts);

//#endregion
//#region ../trackers/dist/src/interval-tracker.js
/**
* A `Tracker` that tracks interval between calls to `mark()`
*/
var IntervalTracker = class extends NumberTracker {
	lastMark = 0;
	mark() {
		if (this.lastMark > 0) this.seen(performance.now() - this.lastMark);
		this.lastMark = performance.now();
	}
};
/**
* Returns a new {@link IntervalTracker} instance. IntervalTracker
* records the interval between each call to `mark`.
*
* ```js
* import { interval } from '@ixfx/trackers.js';
*
* const t = interval();
*
* // Call `mark` to record an interval
* t.mark();
* ...
* t.mark();
*
* // Get average time in milliseconds between calls to `mark`
* t.avg;
*
* // Longest and shortest times are available too...
* t.min / t.max
* ```
*
* Interval tracker can automatically reset after a given number of samples:
*
* ```
* // Reset after 100 samples
* const t = interval({ resetAfterSamples: 100} );
* ```
* @param options Options for tracker
* @returns New interval tracker
*/
const interval = (options) => new IntervalTracker(options);

//#endregion
//#region ../trackers/dist/src/rate-tracker.js
/**
* Tracks the rate of events.
* It's also able to compute the min,max and average interval between events.
*
* @example
* ```js
* const clicks = Trackers.rate();
*
* // Mark when a click happens
* document.addEventListener(`click`, () => clicks.mark());
*
* // Get details
* clicks.perSecond; // How many clicks per second
* clicks.perMinute; // How many clicks per minute
* ```
*
* `timeoutInterval` is a useful option to make the tracker reset
* after some period without `mark()` being called.
*
* Another useful option is `sampleLimit`, which sets an upper bound
* for how many events to track. A smaller value means the results
* will more accurately track, but it might be less smooth.
*
* ```js
* // Eg reset tracker after 5 seconds of inactivity
* const clicks = Trackers.rate({
*  sampleLimit: 10,
*  timeoutInterval: { secs: 5 }
* });
* ```
*/
var RateTracker = class {
	#events = [];
	#fromTime;
	#resetAfterSamples;
	#sampleLimit;
	#resetTimer;
	constructor(opts = {}) {
		this.#resetAfterSamples = opts.resetAfterSamples ?? Number.MAX_SAFE_INTEGER;
		this.#sampleLimit = opts.sampleLimit ?? Number.MAX_SAFE_INTEGER;
		if (opts.timeoutInterval) this.#resetTimer = timeout(() => {
			this.reset();
		}, opts.timeoutInterval);
		this.#fromTime = performance.now();
	}
	/**
	* Mark that an event has happened
	*/
	mark() {
		if (this.#events.length >= this.#resetAfterSamples) this.reset();
		else if (this.#events.length >= this.#sampleLimit) {
			this.#events = this.#events.slice(1);
			this.#fromTime = this.#events[0];
		}
		this.#events.push(performance.now());
		if (this.#resetTimer) this.#resetTimer.start();
	}
	/**
	* Compute {min,max,avg} for the interval _between_ events.
	* @returns
	*/
	computeIntervals() {
		const intervals = [];
		let min$1 = Number.MAX_SAFE_INTEGER;
		let max$1 = Number.MIN_SAFE_INTEGER;
		let total = 0;
		let count$1 = 0;
		let start = 0;
		for (const event of this.#events) {
			if (count$1 > 0) {
				const index = event - start;
				min$1 = Math.min(index, min$1);
				max$1 = Math.max(index, max$1);
				total += index;
				intervals.push(index);
			}
			start = event;
			count$1++;
		}
		const avg = total / count$1;
		return {
			min: min$1,
			max: max$1,
			avg
		};
	}
	/**
	* Returns the time period (in milliseconds) that encompasses
	* the data set. Eg, a result of 1000 means there's data that
	* covers a one second period.
	*/
	get elapsed() {
		return performance.now() - this.#fromTime;
	}
	/**
	* Resets the tracker.
	*/
	reset() {
		this.#events = [];
		this.#fromTime = performance.now();
	}
	/**
	* Get the number of events per second
	*/
	get perSecond() {
		return this.#events.length / (this.elapsed / 1e3);
	}
	/**
	* Get the number of events per minute
	*/
	get perMinute() {
		return this.#events.length / (this.elapsed / 1e3 / 60);
	}
};
/**
* @inheritdoc RateTracker
* @param opts
* @returns
*/
const rate = (opts = {}) => new RateTracker(opts);

//#endregion
//#region ../trackers/dist/src/object-tracker.js
/**
* A tracked value of type `V`.
*/
var ObjectTracker = class extends TrackerBase {
	values;
	constructor(opts = {}) {
		super(opts);
		this.values = [];
	}
	onTrimmed(reason) {}
	/**
	* Reduces size of value store to `limit`.
	* Returns number of remaining items
	* @param limit
	*/
	trimStore(limit) {
		if (limit >= this.values.length) return this.values.length;
		this.values = this.values.slice(-limit);
		return this.values.length;
	}
	/**
	* Allows sub-classes to be notified when a reset happens
	* @ignore
	*/
	onReset() {
		this.values = [];
	}
	/**
	* Tracks a value
	* @ignore
	*/
	filterData(p) {
		const ts = p.map((v) => `at` in v ? v : {
			...v,
			at: Date.now()
		});
		const last = ts.at(-1);
		if (this.storeIntermediate) this.values.push(...ts);
		else switch (this.values.length) {
			case 0: {
				this.values.push(last);
				break;
			}
			case 1: {
				this.values.push(last);
				break;
			}
			case 2: {
				this.values[1] = last;
				break;
			}
		}
		return ts;
	}
	/**
	* Last seen value. If no values have been added, it will return the initial value
	*/
	get last() {
		if (this.values.length === 1) return this.values[0];
		return this.values.at(-1);
	}
	/**
	* Returns the oldest value in the buffer
	*/
	get initial() {
		return this.values.at(0);
	}
	/**
	* Returns number of recorded values (includes the initial value in the count)
	*/
	get size() {
		return this.values.length;
	}
	/**
	* Returns the elapsed time, in milliseconds since the initial value
	*/
	get elapsed() {
		return Date.now() - this.values[0].at;
	}
};

//#endregion
//#region ../trackers/dist/src/tracked-value.js
/**
* Keeps track of keyed values of type `V` (eg Point). It stores occurences in type `T`, which
* must extend from `TrackerBase<V>`, eg `PointTracker`.
*
* The `creator` function passed in to the constructor is responsible for instantiating
* the appropriate `TrackerBase` sub-class.
*
* @example Sub-class
* ```js
* export class PointsTracker extends TrackedValueMap<Points.Point> {
*  constructor(opts:TrackOpts = {}) {
*   super((key, start) => {
*    if (start === undefined) throw new Error(`Requires start point`);
*    const p = new PointTracker(key, opts);
*    p.seen(start);
*    return p;
*   });
*  }
* }
* ```
*
*/
var TrackedValueMap = class {
	store;
	gog;
	constructor(creator) {
		this.store = /* @__PURE__ */ new Map();
		this.gog = getOrGenerate(this.store, creator);
	}
	/**
	* Number of named values being tracked
	*/
	get size() {
		return this.store.size;
	}
	/**
	* Returns _true_ if `id` is stored
	* @param id
	* @returns
	*/
	has(id) {
		return this.store.has(id);
	}
	/**
	* For a given id, note that we have seen one or more values.
	* @param id Id
	* @param values Values(s)
	* @returns Information about start to last value
	*/
	async seen(id, ...values) {
		const trackedValue = await this.getTrackedValue(id, ...values);
		const result = trackedValue.seen(...values);
		return result;
	}
	/**
	* Creates or returns a TrackedValue instance for `id`.
	* @param id
	* @param values
	* @returns
	*/
	async getTrackedValue(id, ...values) {
		if (id === null) throw new Error(`id parameter cannot be null`);
		if (id === void 0) throw new Error(`id parameter cannot be undefined`);
		const trackedValue = await this.gog(id, values[0]);
		return trackedValue;
	}
	/**
	* Remove a tracked value by id.
	* Use {@link reset} to clear them all.
	* @param id
	*/
	delete(id) {
		this.store.delete(id);
	}
	/**
	* Remove all tracked values.
	* Use {@link delete} to remove a single value by id.
	*/
	reset() {
		this.store = /* @__PURE__ */ new Map();
	}
	/**
	* Enumerate ids
	*/
	*ids() {
		yield* this.store.keys();
	}
	/**
	* Enumerate tracked values
	*/
	*tracked() {
		yield* this.store.values();
	}
	/**
	* Iterates TrackedValues ordered with oldest first
	* @returns
	*/
	*trackedByAge() {
		const tp = [...this.store.values()];
		tp.sort((a, b) => {
			const aa = a.elapsed;
			const bb = b.elapsed;
			if (aa === bb) return 0;
			if (aa > bb) return -1;
			return 1;
		});
		for (const t$1 of tp) yield t$1;
	}
	/**
	* Iterates underlying values, ordered by age (oldest first)
	* First the named values are sorted by their `elapsed` value, and then
	* we return the last value for that group.
	*/
	*valuesByAge() {
		for (const tb of this.trackedByAge()) yield tb.last;
	}
	/**
	* Enumerate last received values
	*
	* @example Calculate centroid of latest-received values
	* ```js
	* const pointers = pointTracker();
	* const c = Points.centroid(...Array.from(pointers.lastPoints()));
	* ```
	*/
	*last() {
		for (const p of this.store.values()) yield p.last;
	}
	/**
	* Enumerate starting values
	*/
	*initialValues() {
		for (const p of this.store.values()) yield p.initial;
	}
	/**
	* Returns a tracked value by id, or undefined if not found
	* @param id
	* @returns
	*/
	get(id) {
		return this.store.get(id);
	}
};

//#endregion
//#region ../trackers/dist/src/index.js
var src_exports = {};
__export(src_exports, {
	FrequencyTracker: () => FrequencyTracker,
	IntervalTracker: () => IntervalTracker,
	NumberTracker: () => NumberTracker,
	ObjectTracker: () => ObjectTracker,
	PrimitiveTracker: () => PrimitiveTracker,
	RateTracker: () => RateTracker,
	TrackedValueMap: () => TrackedValueMap,
	TrackerBase: () => TrackerBase,
	frequency: () => frequency,
	handleChangeResult: () => handleChangeResult,
	interval: () => interval,
	number: () => number,
	rate: () => rate,
	trackBooleanChange: () => trackBooleanChange,
	trackNumberChange: () => trackNumberChange
});

//#endregion
//#region ../../node_modules/.pnpm/bezier-js@6.1.4/node_modules/bezier-js/src/utils.js
const { abs: abs$1, cos: cos$1, sin: sin$1, acos: acos$1, atan2, sqrt: sqrt$1, pow } = Math;
function crt(v) {
	return v < 0 ? -pow(-v, 1 / 3) : pow(v, 1 / 3);
}
const pi$1 = Math.PI, tau = 2 * pi$1, quart = pi$1 / 2, epsilon = 1e-6, nMax = Number.MAX_SAFE_INTEGER || 9007199254740991, nMin = Number.MIN_SAFE_INTEGER || -9007199254740991, ZERO = {
	x: 0,
	y: 0,
	z: 0
};
const utils = {
	Tvalues: [
		-.06405689286260563,
		.06405689286260563,
		-.1911188674736163,
		.1911188674736163,
		-.3150426796961634,
		.3150426796961634,
		-.4337935076260451,
		.4337935076260451,
		-.5454214713888396,
		.5454214713888396,
		-.6480936519369755,
		.6480936519369755,
		-.7401241915785544,
		.7401241915785544,
		-.820001985973903,
		.820001985973903,
		-.8864155270044011,
		.8864155270044011,
		-.9382745520027328,
		.9382745520027328,
		-.9747285559713095,
		.9747285559713095,
		-.9951872199970213,
		.9951872199970213
	],
	Cvalues: [
		.12793819534675216,
		.12793819534675216,
		.1258374563468283,
		.1258374563468283,
		.12167047292780339,
		.12167047292780339,
		.1155056680537256,
		.1155056680537256,
		.10744427011596563,
		.10744427011596563,
		.09761865210411388,
		.09761865210411388,
		.08619016153195327,
		.08619016153195327,
		.0733464814110803,
		.0733464814110803,
		.05929858491543678,
		.05929858491543678,
		.04427743881741981,
		.04427743881741981,
		.028531388628933663,
		.028531388628933663,
		.0123412297999872,
		.0123412297999872
	],
	arcfn: function(t$1, derivativeFn) {
		const d = derivativeFn(t$1);
		let l = d.x * d.x + d.y * d.y;
		if (typeof d.z !== "undefined") l += d.z * d.z;
		return sqrt$1(l);
	},
	compute: function(t$1, points, _3d) {
		if (t$1 === 0) {
			points[0].t = 0;
			return points[0];
		}
		const order = points.length - 1;
		if (t$1 === 1) {
			points[order].t = 1;
			return points[order];
		}
		const mt = 1 - t$1;
		let p = points;
		if (order === 0) {
			points[0].t = t$1;
			return points[0];
		}
		if (order === 1) {
			const ret = {
				x: mt * p[0].x + t$1 * p[1].x,
				y: mt * p[0].y + t$1 * p[1].y,
				t: t$1
			};
			if (_3d) ret.z = mt * p[0].z + t$1 * p[1].z;
			return ret;
		}
		if (order < 4) {
			let mt2 = mt * mt, t2 = t$1 * t$1, a, b, c, d = 0;
			if (order === 2) {
				p = [
					p[0],
					p[1],
					p[2],
					ZERO
				];
				a = mt2;
				b = mt * t$1 * 2;
				c = t2;
			} else if (order === 3) {
				a = mt2 * mt;
				b = mt2 * t$1 * 3;
				c = mt * t2 * 3;
				d = t$1 * t2;
			}
			const ret = {
				x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
				y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y,
				t: t$1
			};
			if (_3d) ret.z = a * p[0].z + b * p[1].z + c * p[2].z + d * p[3].z;
			return ret;
		}
		const dCpts = JSON.parse(JSON.stringify(points));
		while (dCpts.length > 1) {
			for (let i = 0; i < dCpts.length - 1; i++) {
				dCpts[i] = {
					x: dCpts[i].x + (dCpts[i + 1].x - dCpts[i].x) * t$1,
					y: dCpts[i].y + (dCpts[i + 1].y - dCpts[i].y) * t$1
				};
				if (typeof dCpts[i].z !== "undefined") dCpts[i].z = dCpts[i].z + (dCpts[i + 1].z - dCpts[i].z) * t$1;
			}
			dCpts.splice(dCpts.length - 1, 1);
		}
		dCpts[0].t = t$1;
		return dCpts[0];
	},
	computeWithRatios: function(t$1, points, ratios, _3d) {
		const mt = 1 - t$1, r = ratios, p = points;
		let f1 = r[0], f2 = r[1], f3 = r[2], f4 = r[3], d;
		f1 *= mt;
		f2 *= t$1;
		if (p.length === 2) {
			d = f1 + f2;
			return {
				x: (f1 * p[0].x + f2 * p[1].x) / d,
				y: (f1 * p[0].y + f2 * p[1].y) / d,
				z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z) / d,
				t: t$1
			};
		}
		f1 *= mt;
		f2 *= 2 * mt;
		f3 *= t$1 * t$1;
		if (p.length === 3) {
			d = f1 + f2 + f3;
			return {
				x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x) / d,
				y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y) / d,
				z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z) / d,
				t: t$1
			};
		}
		f1 *= mt;
		f2 *= 1.5 * mt;
		f3 *= 3 * mt;
		f4 *= t$1 * t$1 * t$1;
		if (p.length === 4) {
			d = f1 + f2 + f3 + f4;
			return {
				x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x + f4 * p[3].x) / d,
				y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y + f4 * p[3].y) / d,
				z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z + f4 * p[3].z) / d,
				t: t$1
			};
		}
	},
	derive: function(points, _3d) {
		const dpoints = [];
		for (let p = points, d = p.length, c = d - 1; d > 1; d--, c--) {
			const list = [];
			for (let j = 0, dpt; j < c; j++) {
				dpt = {
					x: c * (p[j + 1].x - p[j].x),
					y: c * (p[j + 1].y - p[j].y)
				};
				if (_3d) dpt.z = c * (p[j + 1].z - p[j].z);
				list.push(dpt);
			}
			dpoints.push(list);
			p = list;
		}
		return dpoints;
	},
	between: function(v, m, M) {
		return m <= v && v <= M || utils.approximately(v, m) || utils.approximately(v, M);
	},
	approximately: function(a, b, precision) {
		return abs$1(a - b) <= (precision || epsilon);
	},
	length: function(derivativeFn) {
		const z = .5, len = utils.Tvalues.length;
		let sum = 0;
		for (let i = 0, t$1; i < len; i++) {
			t$1 = z * utils.Tvalues[i] + z;
			sum += utils.Cvalues[i] * utils.arcfn(t$1, derivativeFn);
		}
		return z * sum;
	},
	map: function(v, ds, de, ts, te) {
		const d1 = de - ds, d2 = te - ts, v2 = v - ds, r = v2 / d1;
		return ts + d2 * r;
	},
	lerp: function(r, v1, v2) {
		const ret = {
			x: v1.x + r * (v2.x - v1.x),
			y: v1.y + r * (v2.y - v1.y)
		};
		if (v1.z !== void 0 && v2.z !== void 0) ret.z = v1.z + r * (v2.z - v1.z);
		return ret;
	},
	pointToString: function(p) {
		let s = p.x + "/" + p.y;
		if (typeof p.z !== "undefined") s += "/" + p.z;
		return s;
	},
	pointsToString: function(points) {
		return "[" + points.map(utils.pointToString).join(", ") + "]";
	},
	copy: function(obj) {
		return JSON.parse(JSON.stringify(obj));
	},
	angle: function(o, v1, v2) {
		const dx1 = v1.x - o.x, dy1 = v1.y - o.y, dx2 = v2.x - o.x, dy2 = v2.y - o.y, cross = dx1 * dy2 - dy1 * dx2, dot = dx1 * dx2 + dy1 * dy2;
		return atan2(cross, dot);
	},
	round: function(v, d) {
		const s = "" + v;
		const pos = s.indexOf(".");
		return parseFloat(s.substring(0, pos + 1 + d));
	},
	dist: function(p1, p2) {
		const dx = p1.x - p2.x, dy = p1.y - p2.y;
		return sqrt$1(dx * dx + dy * dy);
	},
	closest: function(LUT, point) {
		let mdist = pow(2, 63), mpos, d;
		LUT.forEach(function(p, idx) {
			d = utils.dist(point, p);
			if (d < mdist) {
				mdist = d;
				mpos = idx;
			}
		});
		return {
			mdist,
			mpos
		};
	},
	abcratio: function(t$1, n) {
		if (n !== 2 && n !== 3) return false;
		if (typeof t$1 === "undefined") t$1 = .5;
		else if (t$1 === 0 || t$1 === 1) return t$1;
		const bottom = pow(t$1, n) + pow(1 - t$1, n), top = bottom - 1;
		return abs$1(top / bottom);
	},
	projectionratio: function(t$1, n) {
		if (n !== 2 && n !== 3) return false;
		if (typeof t$1 === "undefined") t$1 = .5;
		else if (t$1 === 0 || t$1 === 1) return t$1;
		const top = pow(1 - t$1, n), bottom = pow(t$1, n) + top;
		return top / bottom;
	},
	lli8: function(x1, y1, x2, y2, x3, y3, x4, y4) {
		const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4), ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4), d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (d == 0) return false;
		return {
			x: nx / d,
			y: ny / d
		};
	},
	lli4: function(p1, p2, p3, p4) {
		const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;
		return utils.lli8(x1, y1, x2, y2, x3, y3, x4, y4);
	},
	lli: function(v1, v2) {
		return utils.lli4(v1, v1.c, v2, v2.c);
	},
	makeline: function(p1, p2) {
		return new Bezier(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2, p2.x, p2.y);
	},
	findbbox: function(sections) {
		let mx = nMax, my = nMax, MX = nMin, MY = nMin;
		sections.forEach(function(s) {
			const bbox = s.bbox();
			if (mx > bbox.x.min) mx = bbox.x.min;
			if (my > bbox.y.min) my = bbox.y.min;
			if (MX < bbox.x.max) MX = bbox.x.max;
			if (MY < bbox.y.max) MY = bbox.y.max;
		});
		return {
			x: {
				min: mx,
				mid: (mx + MX) / 2,
				max: MX,
				size: MX - mx
			},
			y: {
				min: my,
				mid: (my + MY) / 2,
				max: MY,
				size: MY - my
			}
		};
	},
	shapeintersections: function(s1, bbox1, s2, bbox2, curveIntersectionThreshold) {
		if (!utils.bboxoverlap(bbox1, bbox2)) return [];
		const intersections = [];
		const a1 = [
			s1.startcap,
			s1.forward,
			s1.back,
			s1.endcap
		];
		const a2 = [
			s2.startcap,
			s2.forward,
			s2.back,
			s2.endcap
		];
		a1.forEach(function(l1) {
			if (l1.virtual) return;
			a2.forEach(function(l2) {
				if (l2.virtual) return;
				const iss = l1.intersects(l2, curveIntersectionThreshold);
				if (iss.length > 0) {
					iss.c1 = l1;
					iss.c2 = l2;
					iss.s1 = s1;
					iss.s2 = s2;
					intersections.push(iss);
				}
			});
		});
		return intersections;
	},
	makeshape: function(forward, back, curveIntersectionThreshold) {
		const bpl = back.points.length;
		const fpl = forward.points.length;
		const start = utils.makeline(back.points[bpl - 1], forward.points[0]);
		const end = utils.makeline(forward.points[fpl - 1], back.points[0]);
		const shape = {
			startcap: start,
			forward,
			back,
			endcap: end,
			bbox: utils.findbbox([
				start,
				forward,
				back,
				end
			])
		};
		shape.intersections = function(s2) {
			return utils.shapeintersections(shape, shape.bbox, s2, s2.bbox, curveIntersectionThreshold);
		};
		return shape;
	},
	getminmax: function(curve, d, list) {
		if (!list) return {
			min: 0,
			max: 0
		};
		let min$1 = nMax, max$1 = nMin, t$1, c;
		if (list.indexOf(0) === -1) list = [0].concat(list);
		if (list.indexOf(1) === -1) list.push(1);
		for (let i = 0, len = list.length; i < len; i++) {
			t$1 = list[i];
			c = curve.get(t$1);
			if (c[d] < min$1) min$1 = c[d];
			if (c[d] > max$1) max$1 = c[d];
		}
		return {
			min: min$1,
			mid: (min$1 + max$1) / 2,
			max: max$1,
			size: max$1 - min$1
		};
	},
	align: function(points, line) {
		const tx = line.p1.x, ty = line.p1.y, a = -atan2(line.p2.y - ty, line.p2.x - tx), d = function(v) {
			return {
				x: (v.x - tx) * cos$1(a) - (v.y - ty) * sin$1(a),
				y: (v.x - tx) * sin$1(a) + (v.y - ty) * cos$1(a)
			};
		};
		return points.map(d);
	},
	roots: function(points, line) {
		line = line || {
			p1: {
				x: 0,
				y: 0
			},
			p2: {
				x: 1,
				y: 0
			}
		};
		const order = points.length - 1;
		const aligned = utils.align(points, line);
		const reduce = function(t$1) {
			return 0 <= t$1 && t$1 <= 1;
		};
		if (order === 2) {
			const a$1 = aligned[0].y, b$1 = aligned[1].y, c$1 = aligned[2].y, d$1 = a$1 - 2 * b$1 + c$1;
			if (d$1 !== 0) {
				const m1 = -sqrt$1(b$1 * b$1 - a$1 * c$1), m2 = -a$1 + b$1, v1$1 = -(m1 + m2) / d$1, v2 = -(-m1 + m2) / d$1;
				return [v1$1, v2].filter(reduce);
			} else if (b$1 !== c$1 && d$1 === 0) return [(2 * b$1 - c$1) / (2 * b$1 - 2 * c$1)].filter(reduce);
			return [];
		}
		const pa = aligned[0].y, pb = aligned[1].y, pc = aligned[2].y, pd = aligned[3].y;
		let d = -pa + 3 * pb - 3 * pc + pd, a = 3 * pa - 6 * pb + 3 * pc, b = -3 * pa + 3 * pb, c = pa;
		if (utils.approximately(d, 0)) {
			if (utils.approximately(a, 0)) {
				if (utils.approximately(b, 0)) return [];
				return [-c / b].filter(reduce);
			}
			const q$1 = sqrt$1(b * b - 4 * a * c), a2 = 2 * a;
			return [(q$1 - b) / a2, (-b - q$1) / a2].filter(reduce);
		}
		a /= d;
		b /= d;
		c /= d;
		const p = (3 * b - a * a) / 3, p3 = p / 3, q = (2 * a * a * a - 9 * a * b + 27 * c) / 27, q2 = q / 2, discriminant = q2 * q2 + p3 * p3 * p3;
		let u1, v1, x1, x2, x3;
		if (discriminant < 0) {
			const mp3 = -p / 3, mp33 = mp3 * mp3 * mp3, r = sqrt$1(mp33), t$1 = -q / (2 * r), cosphi = t$1 < -1 ? -1 : t$1 > 1 ? 1 : t$1, phi = acos$1(cosphi), crtr = crt(r), t1 = 2 * crtr;
			x1 = t1 * cos$1(phi / 3) - a / 3;
			x2 = t1 * cos$1((phi + tau) / 3) - a / 3;
			x3 = t1 * cos$1((phi + 2 * tau) / 3) - a / 3;
			return [
				x1,
				x2,
				x3
			].filter(reduce);
		} else if (discriminant === 0) {
			u1 = q2 < 0 ? crt(-q2) : -crt(q2);
			x1 = 2 * u1 - a / 3;
			x2 = -u1 - a / 3;
			return [x1, x2].filter(reduce);
		} else {
			const sd = sqrt$1(discriminant);
			u1 = crt(-q2 + sd);
			v1 = crt(q2 + sd);
			return [u1 - v1 - a / 3].filter(reduce);
		}
	},
	droots: function(p) {
		if (p.length === 3) {
			const a = p[0], b = p[1], c = p[2], d = a - 2 * b + c;
			if (d !== 0) {
				const m1 = -sqrt$1(b * b - a * c), m2 = -a + b, v1 = -(m1 + m2) / d, v2 = -(-m1 + m2) / d;
				return [v1, v2];
			} else if (b !== c && d === 0) return [(2 * b - c) / (2 * (b - c))];
			return [];
		}
		if (p.length === 2) {
			const a = p[0], b = p[1];
			if (a !== b) return [a / (a - b)];
			return [];
		}
		return [];
	},
	curvature: function(t$1, d1, d2, _3d, kOnly) {
		let num, dnm, adk, dk, k = 0, r = 0;
		const d = utils.compute(t$1, d1);
		const dd = utils.compute(t$1, d2);
		const qdsum = d.x * d.x + d.y * d.y;
		if (_3d) {
			num = sqrt$1(pow(d.y * dd.z - dd.y * d.z, 2) + pow(d.z * dd.x - dd.z * d.x, 2) + pow(d.x * dd.y - dd.x * d.y, 2));
			dnm = pow(qdsum + d.z * d.z, 3 / 2);
		} else {
			num = d.x * dd.y - d.y * dd.x;
			dnm = pow(qdsum, 3 / 2);
		}
		if (num === 0 || dnm === 0) return {
			k: 0,
			r: 0
		};
		k = num / dnm;
		r = dnm / num;
		if (!kOnly) {
			const pk = utils.curvature(t$1 - .001, d1, d2, _3d, true).k;
			const nk = utils.curvature(t$1 + .001, d1, d2, _3d, true).k;
			dk = (nk - k + (k - pk)) / 2;
			adk = (abs$1(nk - k) + abs$1(k - pk)) / 2;
		}
		return {
			k,
			r,
			dk,
			adk
		};
	},
	inflections: function(points) {
		if (points.length < 4) return [];
		const p = utils.align(points, {
			p1: points[0],
			p2: points.slice(-1)[0]
		}), a = p[2].x * p[1].y, b = p[3].x * p[1].y, c = p[1].x * p[2].y, d = p[3].x * p[2].y, v1 = 18 * (-3 * a + 2 * b + 3 * c - d), v2 = 18 * (3 * a - b - 3 * c), v3 = 18 * (c - a);
		if (utils.approximately(v1, 0)) {
			if (!utils.approximately(v2, 0)) {
				let t$1 = -v3 / v2;
				if (0 <= t$1 && t$1 <= 1) return [t$1];
			}
			return [];
		}
		const d2 = 2 * v1;
		if (utils.approximately(d2, 0)) return [];
		const trm = v2 * v2 - 4 * v1 * v3;
		if (trm < 0) return [];
		const sq = Math.sqrt(trm);
		return [(sq - v2) / d2, -(v2 + sq) / d2].filter(function(r) {
			return 0 <= r && r <= 1;
		});
	},
	bboxoverlap: function(b1, b2) {
		const dims = ["x", "y"], len = dims.length;
		for (let i = 0, dim, l, t$1, d; i < len; i++) {
			dim = dims[i];
			l = b1[dim].mid;
			t$1 = b2[dim].mid;
			d = (b1[dim].size + b2[dim].size) / 2;
			if (abs$1(l - t$1) >= d) return false;
		}
		return true;
	},
	expandbox: function(bbox, _bbox) {
		if (_bbox.x.min < bbox.x.min) bbox.x.min = _bbox.x.min;
		if (_bbox.y.min < bbox.y.min) bbox.y.min = _bbox.y.min;
		if (_bbox.z && _bbox.z.min < bbox.z.min) bbox.z.min = _bbox.z.min;
		if (_bbox.x.max > bbox.x.max) bbox.x.max = _bbox.x.max;
		if (_bbox.y.max > bbox.y.max) bbox.y.max = _bbox.y.max;
		if (_bbox.z && _bbox.z.max > bbox.z.max) bbox.z.max = _bbox.z.max;
		bbox.x.mid = (bbox.x.min + bbox.x.max) / 2;
		bbox.y.mid = (bbox.y.min + bbox.y.max) / 2;
		if (bbox.z) bbox.z.mid = (bbox.z.min + bbox.z.max) / 2;
		bbox.x.size = bbox.x.max - bbox.x.min;
		bbox.y.size = bbox.y.max - bbox.y.min;
		if (bbox.z) bbox.z.size = bbox.z.max - bbox.z.min;
	},
	pairiteration: function(c1, c2, curveIntersectionThreshold) {
		const c1b = c1.bbox(), c2b = c2.bbox(), r = 1e5, threshold = curveIntersectionThreshold || .5;
		if (c1b.x.size + c1b.y.size < threshold && c2b.x.size + c2b.y.size < threshold) return [(r * (c1._t1 + c1._t2) / 2 | 0) / r + "/" + (r * (c2._t1 + c2._t2) / 2 | 0) / r];
		let cc1 = c1.split(.5), cc2 = c2.split(.5), pairs = [
			{
				left: cc1.left,
				right: cc2.left
			},
			{
				left: cc1.left,
				right: cc2.right
			},
			{
				left: cc1.right,
				right: cc2.right
			},
			{
				left: cc1.right,
				right: cc2.left
			}
		];
		pairs = pairs.filter(function(pair) {
			return utils.bboxoverlap(pair.left.bbox(), pair.right.bbox());
		});
		let results = [];
		if (pairs.length === 0) return results;
		pairs.forEach(function(pair) {
			results = results.concat(utils.pairiteration(pair.left, pair.right, threshold));
		});
		results = results.filter(function(v, i) {
			return results.indexOf(v) === i;
		});
		return results;
	},
	getccenter: function(p1, p2, p3) {
		const dx1 = p2.x - p1.x, dy1 = p2.y - p1.y, dx2 = p3.x - p2.x, dy2 = p3.y - p2.y, dx1p = dx1 * cos$1(quart) - dy1 * sin$1(quart), dy1p = dx1 * sin$1(quart) + dy1 * cos$1(quart), dx2p = dx2 * cos$1(quart) - dy2 * sin$1(quart), dy2p = dx2 * sin$1(quart) + dy2 * cos$1(quart), mx1 = (p1.x + p2.x) / 2, my1 = (p1.y + p2.y) / 2, mx2 = (p2.x + p3.x) / 2, my2 = (p2.y + p3.y) / 2, mx1n = mx1 + dx1p, my1n = my1 + dy1p, mx2n = mx2 + dx2p, my2n = my2 + dy2p, arc = utils.lli8(mx1, my1, mx1n, my1n, mx2, my2, mx2n, my2n), r = utils.dist(arc, p1);
		let s = atan2(p1.y - arc.y, p1.x - arc.x), m = atan2(p2.y - arc.y, p2.x - arc.x), e = atan2(p3.y - arc.y, p3.x - arc.x), _;
		if (s < e) {
			if (s > m || m > e) s += tau;
			if (s > e) {
				_ = e;
				e = s;
				s = _;
			}
		} else if (e < m && m < s) {
			_ = e;
			e = s;
			s = _;
		} else e += tau;
		arc.s = s;
		arc.e = e;
		arc.r = r;
		return arc;
	},
	numberSort: function(a, b) {
		return a - b;
	}
};

//#endregion
//#region ../../node_modules/.pnpm/bezier-js@6.1.4/node_modules/bezier-js/src/poly-bezier.js
/**
* Poly Bezier
* @param {[type]} curves [description]
*/
var PolyBezier = class PolyBezier {
	constructor(curves) {
		this.curves = [];
		this._3d = false;
		if (!!curves) {
			this.curves = curves;
			this._3d = this.curves[0]._3d;
		}
	}
	valueOf() {
		return this.toString();
	}
	toString() {
		return "[" + this.curves.map(function(curve) {
			return utils.pointsToString(curve.points);
		}).join(", ") + "]";
	}
	addCurve(curve) {
		this.curves.push(curve);
		this._3d = this._3d || curve._3d;
	}
	length() {
		return this.curves.map(function(v) {
			return v.length();
		}).reduce(function(a, b) {
			return a + b;
		});
	}
	curve(idx) {
		return this.curves[idx];
	}
	bbox() {
		const c = this.curves;
		var bbox = c[0].bbox();
		for (var i = 1; i < c.length; i++) utils.expandbox(bbox, c[i].bbox());
		return bbox;
	}
	offset(d) {
		const offset = [];
		this.curves.forEach(function(v) {
			offset.push(...v.offset(d));
		});
		return new PolyBezier(offset);
	}
};

//#endregion
//#region ../../node_modules/.pnpm/bezier-js@6.1.4/node_modules/bezier-js/src/bezier.js
const { abs, min, max, cos, sin, acos, sqrt } = Math;
const pi = Math.PI;
/**
* Bezier curve constructor.
*
* ...docs pending...
*/
var Bezier = class Bezier {
	constructor(coords) {
		let args = coords && coords.forEach ? coords : Array.from(arguments).slice();
		let coordlen = false;
		if (typeof args[0] === "object") {
			coordlen = args.length;
			const newargs = [];
			args.forEach(function(point$1) {
				[
					"x",
					"y",
					"z"
				].forEach(function(d) {
					if (typeof point$1[d] !== "undefined") newargs.push(point$1[d]);
				});
			});
			args = newargs;
		}
		let higher = false;
		const len = args.length;
		if (coordlen) {
			if (coordlen > 4) {
				if (arguments.length !== 1) throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");
				higher = true;
			}
		} else if (len !== 6 && len !== 8 && len !== 9 && len !== 12) {
			if (arguments.length !== 1) throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");
		}
		const _3d = this._3d = !higher && (len === 9 || len === 12) || coords && coords[0] && typeof coords[0].z !== "undefined";
		const points = this.points = [];
		for (let idx = 0, step = _3d ? 3 : 2; idx < len; idx += step) {
			var point = {
				x: args[idx],
				y: args[idx + 1]
			};
			if (_3d) point.z = args[idx + 2];
			points.push(point);
		}
		const order = this.order = points.length - 1;
		const dims = this.dims = ["x", "y"];
		if (_3d) dims.push("z");
		this.dimlen = dims.length;
		const aligned = utils.align(points, {
			p1: points[0],
			p2: points[order]
		});
		const baselength = utils.dist(points[0], points[order]);
		this._linear = aligned.reduce((t$1, p) => t$1 + abs(p.y), 0) < baselength / 50;
		this._lut = [];
		this._t1 = 0;
		this._t2 = 1;
		this.update();
	}
	static quadraticFromPoints(p1, p2, p3, t$1) {
		if (typeof t$1 === "undefined") t$1 = .5;
		if (t$1 === 0) return new Bezier(p2, p2, p3);
		if (t$1 === 1) return new Bezier(p1, p2, p2);
		const abc = Bezier.getABC(2, p1, p2, p3, t$1);
		return new Bezier(p1, abc.A, p3);
	}
	static cubicFromPoints(S, B, E, t$1, d1) {
		if (typeof t$1 === "undefined") t$1 = .5;
		const abc = Bezier.getABC(3, S, B, E, t$1);
		if (typeof d1 === "undefined") d1 = utils.dist(B, abc.C);
		const d2 = d1 * (1 - t$1) / t$1;
		const selen = utils.dist(S, E), lx = (E.x - S.x) / selen, ly = (E.y - S.y) / selen, bx1 = d1 * lx, by1 = d1 * ly, bx2 = d2 * lx, by2 = d2 * ly;
		const e1 = {
			x: B.x - bx1,
			y: B.y - by1
		}, e2 = {
			x: B.x + bx2,
			y: B.y + by2
		}, A = abc.A, v1 = {
			x: A.x + (e1.x - A.x) / (1 - t$1),
			y: A.y + (e1.y - A.y) / (1 - t$1)
		}, v2 = {
			x: A.x + (e2.x - A.x) / t$1,
			y: A.y + (e2.y - A.y) / t$1
		}, nc1 = {
			x: S.x + (v1.x - S.x) / t$1,
			y: S.y + (v1.y - S.y) / t$1
		}, nc2 = {
			x: E.x + (v2.x - E.x) / (1 - t$1),
			y: E.y + (v2.y - E.y) / (1 - t$1)
		};
		return new Bezier(S, nc1, nc2, E);
	}
	static getUtils() {
		return utils;
	}
	getUtils() {
		return Bezier.getUtils();
	}
	static get PolyBezier() {
		return PolyBezier;
	}
	valueOf() {
		return this.toString();
	}
	toString() {
		return utils.pointsToString(this.points);
	}
	toSVG() {
		if (this._3d) return false;
		const p = this.points, x = p[0].x, y = p[0].y, s = [
			"M",
			x,
			y,
			this.order === 2 ? "Q" : "C"
		];
		for (let i = 1, last = p.length; i < last; i++) {
			s.push(p[i].x);
			s.push(p[i].y);
		}
		return s.join(" ");
	}
	setRatios(ratios) {
		if (ratios.length !== this.points.length) throw new Error("incorrect number of ratio values");
		this.ratios = ratios;
		this._lut = [];
	}
	verify() {
		const print = this.coordDigest();
		if (print !== this._print) {
			this._print = print;
			this.update();
		}
	}
	coordDigest() {
		return this.points.map(function(c, pos) {
			return "" + pos + c.x + c.y + (c.z ? c.z : 0);
		}).join("");
	}
	update() {
		this._lut = [];
		this.dpoints = utils.derive(this.points, this._3d);
		this.computedirection();
	}
	computedirection() {
		const points = this.points;
		const angle = utils.angle(points[0], points[this.order], points[1]);
		this.clockwise = angle > 0;
	}
	length() {
		return utils.length(this.derivative.bind(this));
	}
	static getABC(order = 2, S, B, E, t$1 = .5) {
		const u = utils.projectionratio(t$1, order), um = 1 - u, C = {
			x: u * S.x + um * E.x,
			y: u * S.y + um * E.y
		}, s = utils.abcratio(t$1, order), A = {
			x: B.x + (B.x - C.x) / s,
			y: B.y + (B.y - C.y) / s
		};
		return {
			A,
			B,
			C,
			S,
			E
		};
	}
	getABC(t$1, B) {
		B = B || this.get(t$1);
		let S = this.points[0];
		let E = this.points[this.order];
		return Bezier.getABC(this.order, S, B, E, t$1);
	}
	getLUT(steps) {
		this.verify();
		steps = steps || 100;
		if (this._lut.length === steps + 1) return this._lut;
		this._lut = [];
		steps++;
		this._lut = [];
		for (let i = 0, p, t$1; i < steps; i++) {
			t$1 = i / (steps - 1);
			p = this.compute(t$1);
			p.t = t$1;
			this._lut.push(p);
		}
		return this._lut;
	}
	on(point, error) {
		error = error || 5;
		const lut = this.getLUT(), hits = [];
		for (let i = 0, c, t$1 = 0; i < lut.length; i++) {
			c = lut[i];
			if (utils.dist(c, point) < error) {
				hits.push(c);
				t$1 += i / lut.length;
			}
		}
		if (!hits.length) return false;
		return t /= hits.length;
	}
	project(point) {
		const LUT = this.getLUT(), l = LUT.length - 1, closest = utils.closest(LUT, point), mpos = closest.mpos, t1 = (mpos - 1) / l, t2 = (mpos + 1) / l, step = .1 / l;
		let mdist = closest.mdist, t$1 = t1, ft = t$1, p;
		mdist += 1;
		for (let d; t$1 < t2 + step; t$1 += step) {
			p = this.compute(t$1);
			d = utils.dist(point, p);
			if (d < mdist) {
				mdist = d;
				ft = t$1;
			}
		}
		ft = ft < 0 ? 0 : ft > 1 ? 1 : ft;
		p = this.compute(ft);
		p.t = ft;
		p.d = mdist;
		return p;
	}
	get(t$1) {
		return this.compute(t$1);
	}
	point(idx) {
		return this.points[idx];
	}
	compute(t$1) {
		if (this.ratios) return utils.computeWithRatios(t$1, this.points, this.ratios, this._3d);
		return utils.compute(t$1, this.points, this._3d, this.ratios);
	}
	raise() {
		const p = this.points, np = [p[0]], k = p.length;
		for (let i = 1, pi$2, pim; i < k; i++) {
			pi$2 = p[i];
			pim = p[i - 1];
			np[i] = {
				x: (k - i) / k * pi$2.x + i / k * pim.x,
				y: (k - i) / k * pi$2.y + i / k * pim.y
			};
		}
		np[k] = p[k - 1];
		return new Bezier(np);
	}
	derivative(t$1) {
		return utils.compute(t$1, this.dpoints[0], this._3d);
	}
	dderivative(t$1) {
		return utils.compute(t$1, this.dpoints[1], this._3d);
	}
	align() {
		let p = this.points;
		return new Bezier(utils.align(p, {
			p1: p[0],
			p2: p[p.length - 1]
		}));
	}
	curvature(t$1) {
		return utils.curvature(t$1, this.dpoints[0], this.dpoints[1], this._3d);
	}
	inflections() {
		return utils.inflections(this.points);
	}
	normal(t$1) {
		return this._3d ? this.__normal3(t$1) : this.__normal2(t$1);
	}
	__normal2(t$1) {
		const d = this.derivative(t$1);
		const q = sqrt(d.x * d.x + d.y * d.y);
		return {
			t: t$1,
			x: -d.y / q,
			y: d.x / q
		};
	}
	__normal3(t$1) {
		const r1 = this.derivative(t$1), r2 = this.derivative(t$1 + .01), q1 = sqrt(r1.x * r1.x + r1.y * r1.y + r1.z * r1.z), q2 = sqrt(r2.x * r2.x + r2.y * r2.y + r2.z * r2.z);
		r1.x /= q1;
		r1.y /= q1;
		r1.z /= q1;
		r2.x /= q2;
		r2.y /= q2;
		r2.z /= q2;
		const c = {
			x: r2.y * r1.z - r2.z * r1.y,
			y: r2.z * r1.x - r2.x * r1.z,
			z: r2.x * r1.y - r2.y * r1.x
		};
		const m = sqrt(c.x * c.x + c.y * c.y + c.z * c.z);
		c.x /= m;
		c.y /= m;
		c.z /= m;
		const R = [
			c.x * c.x,
			c.x * c.y - c.z,
			c.x * c.z + c.y,
			c.x * c.y + c.z,
			c.y * c.y,
			c.y * c.z - c.x,
			c.x * c.z - c.y,
			c.y * c.z + c.x,
			c.z * c.z
		];
		const n = {
			t: t$1,
			x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
			y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
			z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
		};
		return n;
	}
	hull(t$1) {
		let p = this.points, _p = [], q = [], idx = 0;
		q[idx++] = p[0];
		q[idx++] = p[1];
		q[idx++] = p[2];
		if (this.order === 3) q[idx++] = p[3];
		while (p.length > 1) {
			_p = [];
			for (let i = 0, pt, l = p.length - 1; i < l; i++) {
				pt = utils.lerp(t$1, p[i], p[i + 1]);
				q[idx++] = pt;
				_p.push(pt);
			}
			p = _p;
		}
		return q;
	}
	split(t1, t2) {
		if (t1 === 0 && !!t2) return this.split(t2).left;
		if (t2 === 1) return this.split(t1).right;
		const q = this.hull(t1);
		const result = {
			left: this.order === 2 ? new Bezier([
				q[0],
				q[3],
				q[5]
			]) : new Bezier([
				q[0],
				q[4],
				q[7],
				q[9]
			]),
			right: this.order === 2 ? new Bezier([
				q[5],
				q[4],
				q[2]
			]) : new Bezier([
				q[9],
				q[8],
				q[6],
				q[3]
			]),
			span: q
		};
		result.left._t1 = utils.map(0, 0, 1, this._t1, this._t2);
		result.left._t2 = utils.map(t1, 0, 1, this._t1, this._t2);
		result.right._t1 = utils.map(t1, 0, 1, this._t1, this._t2);
		result.right._t2 = utils.map(1, 0, 1, this._t1, this._t2);
		if (!t2) return result;
		t2 = utils.map(t2, t1, 1, 0, 1);
		return result.right.split(t2).left;
	}
	extrema() {
		const result = {};
		let roots = [];
		this.dims.forEach(function(dim) {
			let mfn = function(v) {
				return v[dim];
			};
			let p = this.dpoints[0].map(mfn);
			result[dim] = utils.droots(p);
			if (this.order === 3) {
				p = this.dpoints[1].map(mfn);
				result[dim] = result[dim].concat(utils.droots(p));
			}
			result[dim] = result[dim].filter(function(t$1) {
				return t$1 >= 0 && t$1 <= 1;
			});
			roots = roots.concat(result[dim].sort(utils.numberSort));
		}.bind(this));
		result.values = roots.sort(utils.numberSort).filter(function(v, idx) {
			return roots.indexOf(v) === idx;
		});
		return result;
	}
	bbox() {
		const extrema = this.extrema(), result = {};
		this.dims.forEach(function(d) {
			result[d] = utils.getminmax(this, d, extrema[d]);
		}.bind(this));
		return result;
	}
	overlaps(curve) {
		const lbbox = this.bbox(), tbbox = curve.bbox();
		return utils.bboxoverlap(lbbox, tbbox);
	}
	offset(t$1, d) {
		if (typeof d !== "undefined") {
			const c = this.get(t$1), n = this.normal(t$1);
			const ret = {
				c,
				n,
				x: c.x + n.x * d,
				y: c.y + n.y * d
			};
			if (this._3d) ret.z = c.z + n.z * d;
			return ret;
		}
		if (this._linear) {
			const nv = this.normal(0), coords = this.points.map(function(p) {
				const ret = {
					x: p.x + t$1 * nv.x,
					y: p.y + t$1 * nv.y
				};
				if (p.z && nv.z) ret.z = p.z + t$1 * nv.z;
				return ret;
			});
			return [new Bezier(coords)];
		}
		return this.reduce().map(function(s) {
			if (s._linear) return s.offset(t$1)[0];
			return s.scale(t$1);
		});
	}
	simple() {
		if (this.order === 3) {
			const a1 = utils.angle(this.points[0], this.points[3], this.points[1]);
			const a2 = utils.angle(this.points[0], this.points[3], this.points[2]);
			if (a1 > 0 && a2 < 0 || a1 < 0 && a2 > 0) return false;
		}
		const n1 = this.normal(0);
		const n2 = this.normal(1);
		let s = n1.x * n2.x + n1.y * n2.y;
		if (this._3d) s += n1.z * n2.z;
		return abs(acos(s)) < pi / 3;
	}
	reduce() {
		let i, t1 = 0, t2 = 0, step = .01, segment, pass1 = [], pass2 = [];
		let extrema = this.extrema().values;
		if (extrema.indexOf(0) === -1) extrema = [0].concat(extrema);
		if (extrema.indexOf(1) === -1) extrema.push(1);
		for (t1 = extrema[0], i = 1; i < extrema.length; i++) {
			t2 = extrema[i];
			segment = this.split(t1, t2);
			segment._t1 = t1;
			segment._t2 = t2;
			pass1.push(segment);
			t1 = t2;
		}
		pass1.forEach(function(p1) {
			t1 = 0;
			t2 = 0;
			while (t2 <= 1) for (t2 = t1 + step; t2 <= 1 + step; t2 += step) {
				segment = p1.split(t1, t2);
				if (!segment.simple()) {
					t2 -= step;
					if (abs(t1 - t2) < step) return [];
					segment = p1.split(t1, t2);
					segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
					segment._t2 = utils.map(t2, 0, 1, p1._t1, p1._t2);
					pass2.push(segment);
					t1 = t2;
					break;
				}
			}
			if (t1 < 1) {
				segment = p1.split(t1, 1);
				segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
				segment._t2 = p1._t2;
				pass2.push(segment);
			}
		});
		return pass2;
	}
	translate(v, d1, d2) {
		d2 = typeof d2 === "number" ? d2 : d1;
		const o = this.order;
		let d = this.points.map((_, i) => (1 - i / o) * d1 + i / o * d2);
		return new Bezier(this.points.map((p, i) => ({
			x: p.x + v.x * d[i],
			y: p.y + v.y * d[i]
		})));
	}
	scale(d) {
		const order = this.order;
		let distanceFn = false;
		if (typeof d === "function") distanceFn = d;
		if (distanceFn && order === 2) return this.raise().scale(distanceFn);
		const clockwise = this.clockwise;
		const points = this.points;
		if (this._linear) return this.translate(this.normal(0), distanceFn ? distanceFn(0) : d, distanceFn ? distanceFn(1) : d);
		const r1 = distanceFn ? distanceFn(0) : d;
		const r2 = distanceFn ? distanceFn(1) : d;
		const v = [this.offset(0, 10), this.offset(1, 10)];
		const np = [];
		const o = utils.lli4(v[0], v[0].c, v[1], v[1].c);
		if (!o) throw new Error("cannot scale this curve. Try reducing it first.");
		[0, 1].forEach(function(t$1) {
			const p = np[t$1 * order] = utils.copy(points[t$1 * order]);
			p.x += (t$1 ? r2 : r1) * v[t$1].n.x;
			p.y += (t$1 ? r2 : r1) * v[t$1].n.y;
		});
		if (!distanceFn) {
			[0, 1].forEach((t$1) => {
				if (order === 2 && !!t$1) return;
				const p = np[t$1 * order];
				const d$1 = this.derivative(t$1);
				const p2 = {
					x: p.x + d$1.x,
					y: p.y + d$1.y
				};
				np[t$1 + 1] = utils.lli4(p, p2, o, points[t$1 + 1]);
			});
			return new Bezier(np);
		}
		[0, 1].forEach(function(t$1) {
			if (order === 2 && !!t$1) return;
			var p = points[t$1 + 1];
			var ov = {
				x: p.x - o.x,
				y: p.y - o.y
			};
			var rc = distanceFn ? distanceFn((t$1 + 1) / order) : d;
			if (distanceFn && !clockwise) rc = -rc;
			var m = sqrt(ov.x * ov.x + ov.y * ov.y);
			ov.x /= m;
			ov.y /= m;
			np[t$1 + 1] = {
				x: p.x + rc * ov.x,
				y: p.y + rc * ov.y
			};
		});
		return new Bezier(np);
	}
	outline(d1, d2, d3, d4) {
		d2 = d2 === void 0 ? d1 : d2;
		if (this._linear) {
			const n = this.normal(0);
			const start = this.points[0];
			const end = this.points[this.points.length - 1];
			let s, mid, e;
			if (d3 === void 0) {
				d3 = d1;
				d4 = d2;
			}
			s = {
				x: start.x + n.x * d1,
				y: start.y + n.y * d1
			};
			e = {
				x: end.x + n.x * d3,
				y: end.y + n.y * d3
			};
			mid = {
				x: (s.x + e.x) / 2,
				y: (s.y + e.y) / 2
			};
			const fline = [
				s,
				mid,
				e
			];
			s = {
				x: start.x - n.x * d2,
				y: start.y - n.y * d2
			};
			e = {
				x: end.x - n.x * d4,
				y: end.y - n.y * d4
			};
			mid = {
				x: (s.x + e.x) / 2,
				y: (s.y + e.y) / 2
			};
			const bline = [
				e,
				mid,
				s
			];
			const ls$1 = utils.makeline(bline[2], fline[0]);
			const le$1 = utils.makeline(fline[2], bline[0]);
			const segments$1 = [
				ls$1,
				new Bezier(fline),
				le$1,
				new Bezier(bline)
			];
			return new PolyBezier(segments$1);
		}
		const reduced = this.reduce(), len = reduced.length, fcurves = [];
		let bcurves = [], p, alen = 0, tlen = this.length();
		const graduated = typeof d3 !== "undefined" && typeof d4 !== "undefined";
		function linearDistanceFunction(s, e, tlen$1, alen$1, slen) {
			return function(v) {
				const f1 = alen$1 / tlen$1, f2 = (alen$1 + slen) / tlen$1, d = e - s;
				return utils.map(v, 0, 1, s + f1 * d, s + f2 * d);
			};
		}
		reduced.forEach(function(segment) {
			const slen = segment.length();
			if (graduated) {
				fcurves.push(segment.scale(linearDistanceFunction(d1, d3, tlen, alen, slen)));
				bcurves.push(segment.scale(linearDistanceFunction(-d2, -d4, tlen, alen, slen)));
			} else {
				fcurves.push(segment.scale(d1));
				bcurves.push(segment.scale(-d2));
			}
			alen += slen;
		});
		bcurves = bcurves.map(function(s) {
			p = s.points;
			if (p[3]) s.points = [
				p[3],
				p[2],
				p[1],
				p[0]
			];
			else s.points = [
				p[2],
				p[1],
				p[0]
			];
			return s;
		}).reverse();
		const fs = fcurves[0].points[0], fe = fcurves[len - 1].points[fcurves[len - 1].points.length - 1], bs = bcurves[len - 1].points[bcurves[len - 1].points.length - 1], be = bcurves[0].points[0], ls = utils.makeline(bs, fs), le = utils.makeline(fe, be), segments = [ls].concat(fcurves).concat([le]).concat(bcurves);
		return new PolyBezier(segments);
	}
	outlineshapes(d1, d2, curveIntersectionThreshold) {
		d2 = d2 || d1;
		const outline = this.outline(d1, d2).curves;
		const shapes = [];
		for (let i = 1, len = outline.length; i < len / 2; i++) {
			const shape = utils.makeshape(outline[i], outline[len - i], curveIntersectionThreshold);
			shape.startcap.virtual = i > 1;
			shape.endcap.virtual = i < len / 2 - 1;
			shapes.push(shape);
		}
		return shapes;
	}
	intersects(curve, curveIntersectionThreshold) {
		if (!curve) return this.selfintersects(curveIntersectionThreshold);
		if (curve.p1 && curve.p2) return this.lineIntersects(curve);
		if (curve instanceof Bezier) curve = curve.reduce();
		return this.curveintersects(this.reduce(), curve, curveIntersectionThreshold);
	}
	lineIntersects(line) {
		const mx = min(line.p1.x, line.p2.x), my = min(line.p1.y, line.p2.y), MX = max(line.p1.x, line.p2.x), MY = max(line.p1.y, line.p2.y);
		return utils.roots(this.points, line).filter((t$1) => {
			var p = this.get(t$1);
			return utils.between(p.x, mx, MX) && utils.between(p.y, my, MY);
		});
	}
	selfintersects(curveIntersectionThreshold) {
		const reduced = this.reduce(), len = reduced.length - 2, results = [];
		for (let i = 0, result, left, right; i < len; i++) {
			left = reduced.slice(i, i + 1);
			right = reduced.slice(i + 2);
			result = this.curveintersects(left, right, curveIntersectionThreshold);
			results.push(...result);
		}
		return results;
	}
	curveintersects(c1, c2, curveIntersectionThreshold) {
		const pairs = [];
		c1.forEach(function(l) {
			c2.forEach(function(r) {
				if (l.overlaps(r)) pairs.push({
					left: l,
					right: r
				});
			});
		});
		let intersections = [];
		pairs.forEach(function(pair) {
			const result = utils.pairiteration(pair.left, pair.right, curveIntersectionThreshold);
			if (result.length > 0) intersections = intersections.concat(result);
		});
		return intersections;
	}
	arcs(errorThreshold) {
		errorThreshold = errorThreshold || .5;
		return this._iterate(errorThreshold, []);
	}
	_error(pc, np1, s, e) {
		const q = (e - s) / 4, c1 = this.get(s + q), c2 = this.get(e - q), ref = utils.dist(pc, np1), d1 = utils.dist(pc, c1), d2 = utils.dist(pc, c2);
		return abs(d1 - ref) + abs(d2 - ref);
	}
	_iterate(errorThreshold, circles) {
		let t_s = 0, t_e = 1, safety;
		do {
			safety = 0;
			t_e = 1;
			let np1 = this.get(t_s), np2, np3, arc, prev_arc;
			let curr_good = false, prev_good = false, done;
			let t_m = t_e, prev_e = 1, step = 0;
			do {
				prev_good = curr_good;
				prev_arc = arc;
				t_m = (t_s + t_e) / 2;
				step++;
				np2 = this.get(t_m);
				np3 = this.get(t_e);
				arc = utils.getccenter(np1, np2, np3);
				arc.interval = {
					start: t_s,
					end: t_e
				};
				let error = this._error(arc, np1, t_s, t_e);
				curr_good = error <= errorThreshold;
				done = prev_good && !curr_good;
				if (!done) prev_e = t_e;
				if (curr_good) {
					if (t_e >= 1) {
						arc.interval.end = prev_e = 1;
						prev_arc = arc;
						if (t_e > 1) {
							let d = {
								x: arc.x + arc.r * cos(arc.e),
								y: arc.y + arc.r * sin(arc.e)
							};
							arc.e += utils.angle({
								x: arc.x,
								y: arc.y
							}, d, this.get(1));
						}
						break;
					}
					t_e = t_e + (t_e - t_s) / 2;
				} else t_e = t_m;
			} while (!done && safety++ < 100);
			if (safety >= 100) break;
			prev_arc = prev_arc ? prev_arc : arc;
			circles.push(prev_arc);
			t_s = prev_e;
		} while (t_e < 1);
		return circles;
	}
};

//#endregion
export { Bezier, ObjectTracker, TrackedValueMap, float, floatSource, number, randomElement, shortGuid, src_exports, src_exports$1, string };
//# sourceMappingURL=bezier-5SBfGcNj.js.map