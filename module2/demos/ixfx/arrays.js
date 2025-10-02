import { arrayIndexTest, arrayTest, integerTest, numberTest, resultThrow, throwIfFailed } from "./src-BBD50Kth.js";

//#region ../arrays/src/cycle.ts
/**
* Returns a function that cycles through the contents of an array. By default starts at index 0.
* 
* ```js
* const c = arrayCycle([`apples`, `oranges`, `pears`]);
* c.current; // `apples`
* c.next();  // `oranges`
* c.next();  // `pears`
* c.next();  // `apples`
* c.prev();  // `pears`
* ```
* 
* You can select an item by index or value:
* ```
* c.select(1); // `oranges`
* c.select(`pears`); // `pears`
* ```
* 
* Other features:
* ```js
* c.current;   // Current value
* c.toArray(); // Copy of array being cycled over
* ```
* 
* Additional info:
* * Selecting by value uses === semantics.
* * Works with a copy of input array
* @param options Array to cycle over 
* @returns 
*/
const cycle = (options) => {
	throwIfFailed(arrayTest(options, `options`));
	const opts = [...options];
	let index = 0;
	const next = () => {
		index++;
		if (index === opts.length) index = 0;
		return value();
	};
	const prev = () => {
		index--;
		if (index === -1) index = opts.length - 1;
		return value();
	};
	const value = () => {
		return opts.at(index);
	};
	const select = (indexOrValue) => {
		if (typeof indexOrValue === `number`) index = indexOrValue;
		else {
			const found = opts.indexOf(indexOrValue);
			if (found === -1) throw new Error(`Could not find value`);
			index = found;
		}
	};
	const toArray = () => [...opts];
	return {
		toArray,
		next,
		prev,
		get current() {
			return value();
		},
		select
	};
};

//#endregion
//#region ../arrays/src/at-wrap.ts
/**
* Similar to Javascript's in-built Array.at function, but allows offsets
* to wrap.
* 
* @remarks
* ```js
* const test = [1,2,3,4,5,6];
* atWrap(0);   // 1
* atWrap(-1);  // 6
* atWrap(-6);  // 1
* ```
* 
* These values would return _undefined_ using Array.at since its beyond
* the length of the array
* ```js
* atWrap(6);   // 1
* atWrap(-7);  // 6
* ```
* @param array Array
* @param index Index
* @returns 
*/
const atWrap = (array, index) => {
	resultThrow(numberTest(index, ``, `index`));
	if (!Array.isArray(array)) throw new Error(`Param 'array' is not an array`);
	index = index % array.length;
	return array.at(index);
};

//#endregion
//#region ../arrays/src/chunks.ts
function chunks(array, size) {
	throwIfFailed(integerTest(size, "aboveZero", `size`), arrayTest(array, `array`));
	const output = [];
	for (let index = 0; index < array.length; index += size) output.push(array.slice(index, index + size));
	return output;
}

//#endregion
//#region ../arrays/src/util/to-string.ts
/**
* A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
*/
const toStringDefault = (itemToMakeStringFor) => typeof itemToMakeStringFor === `string` ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor);

//#endregion
//#region ../arrays/src/util/is-equal.ts
/**
* If input is a string, it is returned.
* Otherwise, it returns the result of JSON.stringify() with fields ordered.
* 
* This allows for more consistent comparisons when object field orders are different but values the same.
* @param itemToMakeStringFor 
* @returns 
*/
/**
* Default comparer function is equiv to checking `a === b`.
* Use {@link isEqualValueDefault} to compare by value, via comparing JSON string representation.
*/
const isEqualDefault = (a, b) => a === b;
/**
* Comparer returns true if string representation of `a` and `b` are equal.
* Use {@link isEqualDefault} to compare using === semantics
* Uses `toStringDefault` to generate a string representation (via `JSON.stringify`).
* 
* Returns _false_ if the ordering of fields is different, even though values are identical:
* ```js
* isEqualValueDefault({ a: 10, b: 20}, { b: 20, a: 10 }); // false
* ```
* 
* Use {@link isEqualValueIgnoreOrder} to ignore order (with an overhead of additional processing).
* ```js
* isEqualValueIgnoreOrder({ a: 10, b: 20}, { b: 20, a: 10 }); // true
* ```
* 
* Use {@link isEqualValuePartial} to partially match `b` against `a`.
* @returns True if the contents of `a` and `b` are equal
*/
const isEqualValueDefault = (a, b) => {
	if (a === b) return true;
	return toStringDefault(a) === toStringDefault(b);
};

//#endregion
//#region ../arrays/src/contains.ts
/**
* Returns _true_ if all value in `needles` is contained in `haystack`.
* 
* ```js
* const a = ['apples','oranges','pears','mandarins'];
* const b = ['pears', 'apples'];
* contains(a, b); // True
*
* const c = ['pears', 'bananas'];
* contains(a, b); // False ('bananas' does not exist in a)
* ```
* 
* If `needles` is empty, `contains` will return true.
* @param haystack Array to search
* @param needles Things to look for
* @param eq
*/
const contains = (haystack, needles, eq = isEqualDefault) => {
	if (!Array.isArray(haystack)) throw new TypeError(`Expects haystack parameter to be an array`);
	if (!Array.isArray(needles)) throw new TypeError(`Expects needles parameter to be an array. Got: ${typeof needles}`);
	for (const needle of needles) {
		let found = false;
		for (const element of haystack) if (eq(needle, element)) {
			found = true;
			break;
		}
		if (!found) return false;
	}
	return true;
};
/**
* Returns _true_ if array contains duplicate values.
*
* ```js
* containsDuplicateValues(['a','b','a']); // True
* containsDuplicateValues([
*  { name: 'Apple' },
*  { name: 'Apple' }
* ]); // True
* ```
* 
* Uses JSON.toString() by default to compare values.
* 
* See also:
* * {@link unique}: Get unique set of values in an array
* * {@link containsDuplicateInstances}: Compare based on reference, rather than value
* * {@link containsDuplicateValues}: Returns _true_ if every item in array is the same
* @param data Array to examine
* @param keyFunction Function to generate key string for object, uses JSON.stringify by default.
* @returns
*/
const containsDuplicateValues = (data, keyFunction = toStringDefault) => {
	if (typeof data !== `object`) throw new Error(`Param 'data' is expected to be an Iterable. Got type: ${typeof data}`);
	const set = /* @__PURE__ */ new Set();
	for (const v of data) {
		const string_ = keyFunction(v);
		if (set.has(string_)) return true;
		set.add(string_);
	}
	return false;
};
/**
* Returns _true_ if array contains duplicate instances based on `===` equality checking
* Use {@link containsDuplicateValues} if you'd rather compare by value.
* @param array 
* @returns 
*/
const containsDuplicateInstances = (array) => {
	if (!Array.isArray(array)) throw new Error(`Parameter needs to be an array`);
	for (let index = 0; index < array.length; index++) for (let x = 0; x < array.length; x++) {
		if (index === x) continue;
		if (array[index] === array[x]) return true;
	}
	return false;
};

//#endregion
//#region ../arrays/src/ensure-length.ts
/**
* Returns a copy of an array with specified length - padded or truncated as needed.
*
* If the input array is too short, it will be expanded based on the `expand` strategy:
*  - 'undefined': fill with _undefined_ (default)
*  - 'repeat': repeat array elements, starting from position 0
*  - 'first': repeat with first element from `data`
*  - 'last': repeat with last element from `data`
*
* Truncate:
* ```js
* ensureLength([1,2,3], 2); // [1,2]
* ```
* 
* Padded:
* ```js
* ensureLength([1,2,3], 5, `undefined`); // [1,2,3,undefined,undefined]
* ensureLength([1,2,3], 5, `repeat`);    // [1,2,3,1,2]
* ensureLength([1,2,3], 5, `first`);     // [1,2,3,1,1]
* ensureLength([1,2,3], 5, `last`);      // [1,2,3,3,3]
* ```
* @param data Input array to expand
* @param length Desired length
* @param expandStrategy Expand strategy
* @param truncateStrategy Truncation strategy. By default removes from end ('from-end')
* @typeParam V Type of array
*/
function ensureLength(data, length, expandStrategy = `undefined`, truncateStrategy = `from-end`) {
	if (data === void 0) throw new Error(`Data undefined`);
	if (!Array.isArray(data)) throw new Error(`data is not an array`);
	if (data.length === length) return [...data];
	if (data.length > length) if (truncateStrategy === `from-end`) return data.slice(0, length);
	else return data.slice(data.length - length);
	const d = [...data];
	const add = length - d.length;
	for (let index = 0; index < add; index++) switch (expandStrategy) {
		case `undefined`: {
			d.push(void 0);
			break;
		}
		case `repeat`: {
			d.push(data[index % data.length]);
			break;
		}
		case `first`: {
			d.push(data[0]);
			break;
		}
		case `last`: {
			d.push(data.at(-1));
			break;
		}
	}
	return d;
}

//#endregion
//#region ../arrays/src/equality.ts
/**
* Returns _true_ if the two arrays have the same items at same indexes. 
* 
* Returns _false_ if arrays are of different length.
* By default uses === semantics for equality checking.
* 
* ```js
* isEqual([ 1, 2, 3], [ 1, 2, 3 ]); // true
* isEqual([ 1, 2, 3], [ 3, 2, 1 ]); // false
* ```
* 
* Compare by value
* ```js
* isEqual(a, b, isEqualValueDefault);
* ```
* 
* Custom compare, eg based on `name` field:
* ```js
* isEqual(a, b, (compareA, compareB) => compareA.name === compareB.name);
* ```
* @param arrayA 
* @param arrayB 
* @param equality Function to compare values
*/
const isEqual = (arrayA, arrayB, equality = isEqualDefault) => {
	resultThrow(arrayTest(arrayA, `arrayA`), arrayTest(arrayB, `arrayB`));
	if (arrayA.length !== arrayB.length) return false;
	for (let indexA = 0; indexA < arrayA.length; indexA++) if (!equality(arrayA[indexA], arrayB[indexA])) return false;
	return true;
};
/**
* Returns _true_ if all values in the array are the same. Uses value-based equality checking by default.
* 
* @example Using default equality function
* ```js
* const a1 = [ 10, 10, 10 ];
* containsIdenticalValues(a1); // True
*
* const a2 = [ { name:`Jane` }, { name:`John` } ];
* containsIdenticalValues(a2); // True, even though object references are different
* ```
*
* If we want to compare by value for objects that aren't readily
* converted to JSON, you need to provide a function:
*
* ```js
* containsIdenticalValues(someArray, (a, b) => {
*  return (a.eventType === b.eventType);
* });
* ```
*
* Returns _true_ if `array` is empty.
* @param array Array
* @param equality Equality checker. Uses string-conversion checking by default
* @returns
*/
const containsIdenticalValues = (array, equality) => {
	if (!Array.isArray(array)) throw new Error(`Param 'array' is not an array.`);
	if (array.length === 0) return true;
	const eq = equality ?? isEqualValueDefault;
	const a = array[0];
	const r = array.some((v) => !eq(a, v));
	if (r) return false;
	return true;
};

//#endregion
//#region ../arrays/src/filter.ts
/**
* Returns two separate arrays of everything that `filter` returns _true_,
* and everything it returns _false_ on. 
* 
* Same idea as the in-built Array.filter, but that only returns values for one case.
* 
* ```js
* const [ matching, nonMatching ] = filterAB(data, v => v.enabled);
* // `matching` is a list of items from `data` where .enabled is true
* // `nonMatching` is a list of items from `data` where .enabled is false
* ```
* @param data Array of data to filter
* @param filter Function which returns _true_ to add items to the A list, or _false_ for items to add to the B list
* @returns Array of two elements. The first is items that match `filter`, the second is items that do not.
*/
const filterAB = (data, filter) => {
	const a = [];
	const b = [];
	for (const datum of data) if (filter(datum)) a.push(datum);
	else b.push(datum);
	return [a, b];
};
/**
* Yields elements from `array` that match a given `predicate`, and moreover are between
* the given `startIndex` (inclusive) and `endIndex` (exclusive).
*
* While this can be done with in the in-built `array.filter` function, it will
* needlessly iterate through the whole array. It also avoids another alternative
* of slicing the array before using `filter`.
*
* ```js
* // Return 'registered' people between and including array indexes 5-10
* const filtered = [...filterBetween(people, person => person.registered, 5, 10)];
* ```
* @param array Array to filter
* @param predicate Filter function
* @param startIndex Start index (defaults to 0)
* @param endIndex End index (by default runs until end)
*/
function* filterBetween(array, predicate, startIndex, endIndex) {
	resultThrow(arrayTest(array, `array`));
	if (typeof startIndex === `undefined`) startIndex = 0;
	if (typeof endIndex === `undefined`) endIndex = array.length;
	resultThrow(arrayIndexTest(array, startIndex, `startIndex`));
	resultThrow(arrayIndexTest(array, endIndex - 1, `endIndex`));
	for (let index = startIndex; index < endIndex; index++) if (predicate(array[index], index, array)) yield array[index];
}

//#endregion
//#region ../arrays/src/flatten.ts
/**
* Returns a 'flattened' copy of array, un-nesting arrays one level
* ```js
* flatten([1, [2, 3], [[4]] ]);
* // Yields: [ 1, 2, 3, [4]];
* ```
* @param array
* @returns
*/
const flatten = (array) => [...array].flat();

//#endregion
//#region ../arrays/src/for-each.ts
/**
* Returns the array.map() output, or a value if `array`
* is not an array or empty.
* 
* ```js
* mapWithEmptyFallback([1,2,3], v => v+2, 100); // Yields: [3,4,5]
* mapWithEmptyFallback([], v=>v+2, 100); // Yields: [100]
* mapWithEmptyFallback({}, v=>v+2, [100]); // Yields: [100]
* ```
* 
* If the fallback value is an array, it is returned as an
* array if needed. If it's a single value, it is wrapped as an array.
* @param array Array of values
* @param fn Function to use for mapping values
* @param fallback Fallback single value or array of values
* @returns 
*/
const mapWithEmptyFallback = (array, fn, fallback) => {
	if (typeof array !== `object` || !Array.isArray(array) || array.length === 0) {
		if (Array.isArray(fallback)) return fallback;
		return [fallback];
	}
	return array.map(fn);
};

//#endregion
//#region ../arrays/src/frequency.ts
/**
* Computes the frequency of values by a grouping function.
* 
* ```js
* const data = [1,2,3,4,5,6,7,8,9,10];
* // Returns 'odd' or 'even' for an input value
* 
* const groupBy = v => v % 2 === 0 ? `even`:`odd`;
* 
* const data = frequencyByGroup(groupBy, data);
* // Yields map with:
* //  key: 'even', value: 5
* //  key: 'odd', value: 5
* @param groupBy 
* @param data 
* @returns 
*/
const frequencyByGroup = (groupBy$1, data) => {
	if (!Array.isArray(data)) throw new TypeError(`Param 'array' is expected to be an array. Got type: '${typeof data}'`);
	const store = /* @__PURE__ */ new Map();
	for (const value of data) {
		const group = groupBy$1(value);
		if (typeof group !== `string` && typeof group !== `number`) throw new TypeError(`groupBy function is expected to return type string or number. Got type: '${typeof group}' for value: '${value}'`);
		let groupValue = store.get(group);
		groupValue ??= 0;
		groupValue++;
		store.set(group, groupValue);
	}
	return store;
};

//#endregion
//#region ../arrays/src/group-by.ts
/**
* Groups data by a function `grouper`, returning data as a map with string
* keys and array values. Multiple values can be assigned to the same group.
*
* `grouper` must yield a string designated group for a given item.
*
* @example
* ```js
* const data = [
*  { age: 39, city: `London` },
*  { age: 14, city: `Copenhagen` },
*  { age: 23, city: `Stockholm` },
*  { age: 56, city: `London` }
* ];
*
* // Whatever the function returns will be the designated group
* // for an item
* const map = Arrays.groupBy(data, item => item.city);
* ```
*
* This yields a Map with keys London, Stockholm and Copenhagen, and the corresponding values.
*
* ```
* London: [{ age: 39, city: `London` }, { age: 56, city: `London` }]
* Stockhom: [{ age: 23, city: `Stockholm` }]
* Copenhagen: [{ age: 14, city: `Copenhagen` }]
* ```
* @param array Array to group
* @param grouper Function that returns a key for a given item
* @typeParam K Type of key to group by. Typically string.
* @typeParam V Type of values
* @returns Map
*/
const groupBy = (array, grouper) => {
	const map = /* @__PURE__ */ new Map();
	for (const a of array) {
		const key = grouper(a);
		let existing = map.get(key);
		if (!existing) {
			existing = [];
			map.set(key, existing);
		}
		existing.push(a);
	}
	return map;
};

//#endregion
//#region ../arrays/src/unique.ts
/**
* Combines the values of one or more arrays, removing duplicates.
* ```js
* const v = Arrays.uniqueDeep([ [1, 2, 3, 4], [ 3, 4, 5, 6] ]);
* // [ 1, 2, 3, 4, 5, 6]
* ```
*
* A single array can be provided as well:
* ```js
* const v = Arrays.uniqueDeep([ 1, 2, 3, 1, 2, 3 ]);
* // [ 1, 2, 3 ]
* ```
* 
* By default uses Javascript's default equality checking
* 
* See also:
* * {@link intersection}: Overlap between two arrays
* * Iterables.additionalValues: Yield values from an iterable not present in the other
* * {@link containsDuplicateValues}: Returns true if array contains duplicates
* @param arrays
* @param comparer
* @returns
*/
const uniqueDeep = (arrays, comparer = isEqualDefault) => {
	const t = [];
	const contains$1 = (v) => {
		for (const tValue of t) if (comparer(tValue, v)) return true;
		return false;
	};
	const flattened = arrays.flat(10);
	for (const v of flattened) if (!contains$1(v)) t.push(v);
	return t;
};
/**
* Combines the values of one or more arrays, removing duplicates.
* Compares based on a string representation of object. Uses a Set
* to avoid unnecessary comparisons, perhaps faster than `uniqueDeep`.
* 
* ```js
* const v = Arrays.unique([ [1, 2, 3, 4], [ 3, 4, 5, 6] ]);
* // [ 1, 2, 3, 4, 5, 6]
* ```
*
* A single array can be provided as well:
* ```js
* const v = Arrays.unique([ 1, 2, 3, 1, 2, 3 ]);
* // [ 1, 2, 3 ]
* ```
* 
* By default uses JSON.toString() to compare values.
* 
* See also:
* * {@link intersection}: Overlap between two arrays
* * Iterables.additionalValues: Yield values from an iterable not present in the other
* * {@link containsDuplicateValues}: Returns true if array contains duplicates
* @param arrays Array (or array of arrays) to examine
* @param toString Function to convert values to a string for comparison purposes. By default uses JSON formatting.
* @returns
*/
const unique = (arrays, toString = toStringDefault) => {
	const matching = /* @__PURE__ */ new Set();
	const t = [];
	const flattened = arrays.flat(10);
	for (const a of flattened) {
		const stringRepresentation = toString(a);
		if (matching.has(stringRepresentation)) continue;
		matching.add(stringRepresentation);
		t.push(a);
	}
	return t;
};

//#endregion
//#region ../arrays/src/insert-at.ts
/**
* Inserts `values` at position `index`, shuffling remaining
* items further down and returning changed result.
* 
* Does not modify the input array.
* 
* ```js
* const data = [ 1, 2, 3 ]
* 
* // Inserts 20,30,40 at index 1
* Arrays.insertAt(data, 1, 20, 30, 40);
* 
* // Yields: 1, 20, 30, 40, 2, 3
* ```
* @param data 
* @param index 
* @param values 
* @returns 
*/
const insertAt = (data, index, ...values) => {
	throwIfFailed(arrayTest(data, `data`), arrayIndexTest(data, index, `index`));
	if (index === data.length - 1) return [...data, ...values];
	if (index === 0) return [...values, ...data];
	return [
		...data.slice(0, index),
		...values,
		...data.slice(index)
	];
};

//#endregion
//#region ../arrays/src/interleave.ts
/**
* Returns an interleaving of two or more arrays. All arrays must be the same length.
*
* ```js
* const a = [`a`, `b`, `c`];
* const b = [`1`, `2`, `3`];
* const c = Arrays.interleave(a, b);
* // Yields:
* // [`a`, `1`, `b`, `2`, `c`, `3`]
* ```
* @param arrays
* @returns
*/
const interleave = (...arrays) => {
	if (arrays.some((a) => !Array.isArray(a))) throw new Error(`All parameters must be an array`);
	const lengths = arrays.map((a) => a.length);
	if (!containsIdenticalValues(lengths)) throw new Error(`Arrays must be of same length`);
	const returnValue = [];
	const length = lengths[0];
	for (let index = 0; index < length; index++) for (const array of arrays) returnValue.push(array[index]);
	return returnValue;
};

//#endregion
//#region ../arrays/src/intersection.ts
/**
* Returns the _intersection_ of two arrays: the elements that are in common.
* 
* ```js
* intersection([1, 2, 3], [2, 4, 6]);
// returns [2]
* ```
* See also: 
* * {@link unique}: Unique set of items amongst one or more arrays
* @param arrayA 
* @param arrayB 
* @param equality 
* @returns 
*/
const intersection = (arrayA, arrayB, equality = isEqualDefault) => arrayA.filter((valueFromA) => arrayB.some((valueFromB) => equality(valueFromA, valueFromB)));

//#endregion
//#region ../arrays/src/merge-by-key.ts
/**
* Merges arrays left to right, using the provided
* `reconcile` function to choose a winner when keys overlap.
*
* There's also Core.Maps.mergeByKey if the input data is in Map form.
*
* For example, if we have the array A:
* [`A-1`, `A-2`, `A-3`]
*
* And array B:
* [`B-1`, `B-2`, `B-4`]
*
* And with the key function:
* ```js
* // Make a key for value based on last char
* const keyFn = (v) => v.substr(-1, 1);
* ```
*
* If they are merged with the reconile function:
* ```js
* const reconcile = (a, b) => b.replace(`-`, `!`);
* const output = mergeByKey(keyFn, reconcile, arrayA, arrayB);
* ```
*
* The final result will be:
*
* [`B!1`, `B!2`, `A-3`, `B-4`]
*
* In this toy example, it's obvious how the reconciler transforms
* data where the keys overlap. For the keys that do not overlap -
* 3 and 4 in this example - they are copied unaltered.
*
* A practical use for `mergeByKey` has been in smoothing keypoints
* from a TensorFlow pose. In this case, we want to smooth new keypoints
* with older keypoints. But if a keypoint is not present, for it to be
* passed through.
*
* @param keyFunction Function to generate a unique key for data
* @param reconcile Returns value to decide 'winner' when keys conflict.
* @param arrays Arrays of data to merge
*/
const mergeByKey = (keyFunction, reconcile, ...arrays) => {
	const result = /* @__PURE__ */ new Map();
	for (const m of arrays) for (const mv of m) {
		if (mv === void 0) continue;
		const mk = keyFunction(mv);
		let v = result.get(mk);
		v = v ? reconcile(v, mv) : mv;
		result.set(mk, v);
	}
	return [...result.values()];
};

//#endregion
//#region ../arrays/src/pairwise.ts
/**
* Yields pairs made up of overlapping items from the input array.
* 
* Throws an error if there are less than two entries.
* 
* ```js
* pairwise([1, 2, 3, 4, 5]);
* Yields:
* [ [1,2], [2,3], [3,4], [4,5] ]
* ```
* @param values 
*/
function* pairwise(values) {
	resultThrow(arrayTest(values, `values`));
	if (values.length < 2) throw new Error(`Array needs to have at least two entries. Length: ${values.length}`);
	for (let index = 1; index < values.length; index++) yield [values[index - 1], values[index]];
}
/**
* Reduces in a pairwise fashion.
*
* Eg, if we have input array of [1, 2, 3, 4, 5], the
* `reducer` fn will run with 1,2 as parameters, then 2,3, then 3,4 etc.
* ```js
* const values = [1, 2, 3, 4, 5]
* reducePairwise(values, (acc, a, b) => {
*  return acc + (b - a);
* }, 0);
* ```
*
* If input array has less than two elements, the initial value is returned.
*
* ```js
* const reducer = (acc:string, a:string, b:string) => acc + `[${a}-${b}]`;
* const result = reducePairwise(`a b c d e f g`.split(` `), reducer, `!`);
* Yields: `![a-b][b-c][c-d][d-e][e-f][f-g]`
* ```
* @param array
* @param reducer
* @param initial
* @returns
*/
const pairwiseReduce = (array, reducer, initial) => {
	resultThrow(arrayTest(array, `arr`));
	if (array.length < 2) return initial;
	for (let index = 0; index < array.length - 1; index++) initial = reducer(initial, array[index], array[index + 1]);
	return initial;
};

//#endregion
//#region ../arrays/src/random.ts
/**
* Returns a shuffled copy of the input array.
* @example
* ```js
* const d = [1, 2, 3, 4];
* const s = shuffle(d);
* // d: [1, 2, 3, 4], s: [3, 1, 2, 4]
* ```
* 
* It can be useful to randomly access each item from an array exactly once:
* ```js
* for (const value of shuffle(inputArray)) {
*  // Do something with the value...
* }
* ```
* @param dataToShuffle Input array
* @param rand Random generator. `Math.random` by default.
* @returns Copy with items moved around randomly
* @typeParam V - Type of array items
*/
const shuffle = (dataToShuffle, rand = Math.random) => {
	resultThrow(arrayTest(dataToShuffle, `dataToShuffle`));
	const array = [...dataToShuffle];
	for (let index = array.length - 1; index > 0; index--) {
		const index_ = Math.floor(rand() * (index + 1));
		[array[index], array[index_]] = [array[index_], array[index]];
	}
	return array;
};
/**
* Returns a random element of an array
*
* ```js
* const v = [`blue`, `red`, `orange`];
* randomElement(v); // Yields `blue`, `red` or `orange`
* ```
*
* Note that repeated calls might yield the same value
* multiple times. If you want to random unique values, consider using {@link shuffle}.
* 
* See also:
* * {@link randomIndex} if you want a random index rather than value.
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

//#endregion
//#region ../arrays/src/remove.ts
/**
* Removes an element at `index` index from `data`, returning the resulting array without modifying the original.
*
* ```js
* const v = [ 100, 20, 50 ];
* const vv = Arrays.remove(2);
*
* Yields:
*  v: [ 100, 20, 50 ]
* vv: [ 100, 20 ]
* ```
*
* Consider {@link without} if you want to remove an item by value.
*
* Throws an exception if `index` is outside the range of `data` array.
* @param data Input array
* @param index Index to remove
* @typeParam V Type of array
* @returns
*/
const remove = (data, index) => {
	if (!Array.isArray(data)) throw new TypeError(`'data' parameter should be an array`);
	resultThrow(arrayIndexTest(data, index, `index`));
	return [...data.slice(0, index), ...data.slice(index + 1)];
};

//#endregion
//#region ../arrays/src/sample.ts
/**
* Samples values from an array. 
* 
* If `amount` is less or equal to 1, it's treated as a percentage to sample.
* Otherwise it's treated as every _n_th value to sample.
*
* @example 
* By percentage - get half of the items
* ```
* const list = [1,2,3,4,5,6,7,8,9,10];
* const sub = Arrays.sample(list, 0.5);
* // Yields: [2, 4, 6, 8, 10]
* ```
*
* @example
* By steps - every third value
* ```
* const list = [1,2,3,4,5,6,7,8,9,10];
* const sub = Arrays.sample(list, 3);
* // Yields:
* // [3, 6, 9]
* ```
* @param array Array to sample
* @param amount Amount, given as a percentage (0..1) or the number of interval (ie 3 for every third item)
* @returns
*/
const sample = (array, amount) => {
	if (!Array.isArray(array)) throw new TypeError(`Param 'array' is not actually an array. Got type: ${typeof array}`);
	let subsampleSteps = 1;
	if (amount <= 1) {
		const numberOfItems = array.length * amount;
		subsampleSteps = Math.round(array.length / numberOfItems);
	} else subsampleSteps = amount;
	resultThrow(integerTest(subsampleSteps, `positive`, `amount`));
	if (subsampleSteps > array.length - 1) throw new Error(`Subsample steps exceeds array length`);
	const r = [];
	for (let index = subsampleSteps - 1; index < array.length; index += subsampleSteps) r.push(array[index]);
	return r;
};

//#endregion
//#region ../arrays/src/sort.ts
/**
* Sorts an array of objects in ascending order
* by the given property name, assuming it is a number.
*
* ```js
* const data = [
*  { size: 10, colour: `red` },
*  { size: 20, colour: `blue` },
*  { size: 5, colour: `pink` }
* ];
* const sorted = Arrays.sortByNumericProperty(data, `size`);
*
* Yields items ascending order:
* [ { size: 5, colour: `pink` }, { size: 10, colour: `red` }, { size: 20, colour: `blue` } ]
* ```
* @param data
* @param propertyName
*/
const sortByNumericProperty = (data, propertyName) => [...data].sort((a, b) => {
	resultThrow(arrayTest(data, `data`));
	const av = a[propertyName];
	const bv = b[propertyName];
	if (av < bv) return -1;
	if (av > bv) return 1;
	return 0;
});
/**
* Sorts an array of objects by some named property.
* 
* ```js
* const data = [
*  { size: 10, colour: `red` },
*  { size: 20, colour: `blue` },
*  { size: 5, colour: `pink` }
* ];
* sortByProperty(data, `colour`);
* 
* Yields [
*  { size: 20, colour: `blue` },
*  { size: 5, colour: `pink` }
*  { size: 10, colour: `red` },
* ]
* ```
* 
* You can also provide a custom comparer that is passed property values.
* This function should return 0 if values are equal, 1 if `a > b` and -1 if `a < b`.
* @param data 
* @param propertyName 
* @returns 
*/
const sortByProperty = (data, propertyName, comparer) => [...data].sort((a, b) => {
	resultThrow(arrayTest(data, `data`));
	const av = a[propertyName];
	const bv = b[propertyName];
	if (comparer === void 0) {
		if (av < bv) return -1;
		if (av > bv) return 1;
		return 0;
	} else return comparer(av, bv);
});

//#endregion
//#region ../arrays/src/until.ts
/**
* Yields all items in the input array for as long as `predicate` returns true.
*
* `predicate` yields arrays of `[stop:boolean, acc:A]`. The first value
* is _true_ when the iteration should stop, and the `acc` is the accumulated value.
* This allows `until` to be used to carry over some state from item to item.
*
* @example Stop when we hit an item with value of 3
* ```js
* const v = [...until([1,2,3,4,5], v => v === 3];
* // [ 1, 2 ]
* ```
*
* @example Stop when we reach a total, using 0 as initial value
* ```js
* // Stop when accumulated value reaches 6
* const v = Arrays.until[1,2,3,4,5], (v, acc) => [acc >= 7, v+acc], 0);
* // [1, 2, 3]
* ```
* @param data
* @param predicate
* @returns
*/
function* until(data, predicate, initial) {
	let total = initial;
	for (const datum of data) {
		const r = predicate(datum, total);
		if (typeof r === `boolean`) {
			if (r) break;
		} else {
			const [stop, accumulator] = r;
			if (stop) break;
			total = accumulator;
		}
		yield datum;
	}
}

//#endregion
//#region ../arrays/src/without.ts
/**
* Returns a copy of an input array with _undefined_ values removed.
* @param data 
* @returns 
*/
const withoutUndefined = (data) => {
	return data.filter((v) => v !== void 0);
};
/**
* Returns an array with value(s) omitted. 
* 
* If value is not found, result will be a copy of input.
* Value checking is completed via the provided `comparer` function.
* By default checking whether `a === b`. To compare based on value, use the `isEqualValueDefault` comparer.
*
* @example
* ```js
* const data = [100, 20, 40];
* const filtered = without(data, 20); // [100, 40]
* ```
*
* @example Using value-based comparison
* ```js
* const data = [{ name: `Alice` }, { name:`Sam` }];
*
* // This wouldn't work as expected, because the default comparer uses instance,
* // not value:
* without(data, { name: `Alice` });
*
* // So instead we can use a value comparer:
* without(data, { name:`Alice` }, isEqualValueDefault);
* ```
*
* @example Use a function
* ```js
* const data = [ { name: `Alice` }, { name:`Sam` }];
* without(data, { name:`ALICE` }, (a, b) => {
*  return (a.name.toLowerCase() === b.name.toLowerCase());
* });
* ```
*
* Consider {@link remove} to remove an item by index.
*
* @typeParam V - Type of array items
* @param sourceArray Source array
* @param toRemove Value(s) to remove
* @param comparer Comparison function. If not provided `isEqualDefault` is used, which compares using `===`
* @return Copy of array without value.
*/
const without = (sourceArray, toRemove, comparer = isEqualDefault) => {
	if (Array.isArray(toRemove)) {
		const returnArray = [];
		for (const source of sourceArray) if (!toRemove.some((v) => comparer(source, v))) returnArray.push(source);
		return returnArray;
	} else return sourceArray.filter((v) => !comparer(v, toRemove));
};

//#endregion
//#region ../arrays/src/zip.ts
/**
* Zip combines the elements of two or more arrays based on their index.
*
* ```js
* const a = [1,2,3];
* const b = [`red`, `blue`, `green`];
*
* const c = Arrays.zip(a, b);
* // Yields:
* // [
* //   [1, `red`],
* //   [2, `blue`],
* //   [3, `green`]
* // ]
* ```
*
* Typically the arrays you zip together are all about the same logical item. Eg, in the above example
* perhaps `a` is size and `b` is colour. So thing #1 (at array index 0) is a red thing of size 1. Before
* zipping we'd access it by `a[0]` and `b[0]`. After zipping, we'd have c[0], which is array of [1, `red`].
* @param arrays
* @returns Zipped together array
*/
const zip = (...arrays) => {
	if (arrays.some((a) => !Array.isArray(a))) throw new Error(`All parameters must be an array`);
	const lengths = arrays.map((a) => a.length);
	if (!containsIdenticalValues(lengths)) throw new Error(`Arrays must be of same length`);
	const returnValue = [];
	const length = lengths[0];
	for (let index = 0; index < length; index++) returnValue.push(arrays.map((a) => a[index]));
	return returnValue;
};

//#endregion
export { atWrap, chunks, contains, containsDuplicateInstances, containsDuplicateValues, containsIdenticalValues, cycle, ensureLength, filterAB, filterBetween, flatten, frequencyByGroup, groupBy, insertAt, interleave, intersection, isEqual, mapWithEmptyFallback, mergeByKey, pairwise, pairwiseReduce, randomElement, randomIndex, remove, sample, shuffle, sortByNumericProperty, sortByProperty, unique, uniqueDeep, until, without, withoutUndefined, zip };
//# sourceMappingURL=arrays.js.map