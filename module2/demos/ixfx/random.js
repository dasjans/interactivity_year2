import { arrayTest, integerTest, numberTest, resultThrow } from "./src-BBD50Kth.js";

//#region ../random/src/weighted-index.ts
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
//#region ../random/src/arrays.ts
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
//#region ../random/src/chance.ts
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
//#region ../random/src/float-source.ts
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
	let max = options.max ?? 1;
	let min = options.min ?? 0;
	const source = options.source ?? Math.random;
	resultThrow(numberTest(min, ``, `min`), numberTest(max, ``, `max`));
	if (!options.min && max < 0) {
		min = max;
		max = 0;
	}
	if (min > max) throw new Error(`Min is greater than max. Min: ${min.toString()} max: ${max.toString()}`);
	return () => source() * (max - min) + min;
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
//#region ../random/src/non-zero.ts
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
//#region ../random/src/gaussian.ts
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
	const min = 0;
	const max = 1;
	const compute = () => {
		const u = calculateNonZero();
		const v = calculateNonZero();
		let result = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
		result = result / 10 + .5;
		if (result > 1 || result < 0) result = compute();
		else {
			result = Math.pow(result, skew);
			result *= max - min;
			result += min;
		}
		return result;
	};
	return compute;
};

//#endregion
//#region ../random/src/guid.ts
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
//#region ../random/src/util/count.ts
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
//#region ../random/src/integer.ts
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
	let max = Math.floor(options.max ?? 100);
	let min = Math.floor(options.min ?? 0);
	if (!options.min && max < 0) {
		max = 1;
		min = options.max ?? 0;
	}
	const randomSource = options.source ?? Math.random;
	if (min > max) throw new Error(`Min value is greater than max (min: ${min.toString()} max: ${max.toString()})`);
	resultThrow(numberTest(min, ``, `min`), numberTest(max, ``, `max`));
	if (max === min) throw new Error(`Max and min values cannot be the same (${max.toString()})`);
	const amt = Math.abs(max - min);
	return () => Math.floor(randomSource() * amt) + min;
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
	const min = options.min ?? 0;
	const max = options.max ?? 100;
	const source = options.source ?? Math.random;
	const loop = options.loop ?? false;
	resultThrow(integerTest(min, ``, `min`), integerTest(max, ``, `max`));
	if (min > max) throw new Error(`Min value is greater than max. Min: ${min.toString()} Max: ${max.toString()}`);
	const origRange = [...count(max - min, min)];
	let numberRange = shuffle(origRange);
	let index = 0;
	while (true) {
		if (index === numberRange.length) if (loop) numberRange = shuffle(origRange, source);
		else return;
		yield numberRange[index++];
	}
}

//#endregion
//#region ../random/src/seeded.ts
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
//#region ../random/src/string.ts
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
//#region ../random/src/time.ts
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
	const min = (options.min ?? 0) * 60 * 1e3;
	const max = (options.max ?? 5) * 60 * 1e3;
	return integerSource({
		...options,
		max,
		min
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
	const min = (options.min ?? 0) * 1e3;
	const max = (options.max ?? 5) * 1e3;
	return () => integer({
		...options,
		max,
		min
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
//#region ../random/src/util/clamp.ts
function clamp(v, min = 0, max = 1) {
	if (v < min) return min;
	if (v > max) return max;
	return v;
}

//#endregion
//#region ../random/src/weighted-integer.ts
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
	const max = options.max ?? 1;
	const min = options.min ?? 0;
	if (max === min) throw new Error(`Param 'max' is the same as  'min'`);
	if (max < min) throw new Error(`Param 'max' should be greater than  'min'`);
	const compute = () => {
		const r = clamp(options.easingFunction(source()));
		return Math.floor(r * (max - min)) + min;
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
//#region ../random/src/weighted.ts
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
export { bipolar, bipolarSource, calculateNonZero, chance, float, floatSource, gaussian, gaussianSource, integer, integerSource, integerUniqueGen, mersenneTwister, minutesMs, minutesMsSource, randomElement, randomElementWeightedSource, randomIndex, randomPluck, secondsMs, secondsMsSource, shortGuid, shuffle, string, weighted, weightedIndex, weightedInteger, weightedIntegerSource, weightedSource };
//# sourceMappingURL=random.js.map