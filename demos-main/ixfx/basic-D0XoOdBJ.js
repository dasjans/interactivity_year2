import { __export } from "./chunk-51aI8Tpl.js";
import { integerTest, numberTest, resultThrow } from "./src-BBD50Kth.js";
import { defaultToString, intervalToMs, isEqualDefault, toStringDefault } from "./interval-type-DajslxUJ.js";

//#region ../core/dist/src/comparers.js
/**
* Sort numbers in ascending order.
*
* ```js
* [10, 4, 5, 0].sort(numericComparer);
* // Yields: [0, 4, 5, 10]
* [10, 4, 5, 0].sort(comparerInverse(numericComparer));
* // Yields: [ 10, 5, 4, 0]
* ```
*
* Returns:
* * 0: values are equal
* * negative: `a` should be before `b`
* * positive: `a` should come after `b`
* @param a
* @param b
* @returns
*/
const numericComparer = (a, b) => {
	if (a === b) return 0;
	if (a > b) return 1;
	return -1;
};
/**
* Default sort comparer, following same sematics as Array.sort.
* Consider using {@link defaultComparer} to get more logical sorting of numbers.
*
* Note: numbers are sorted in alphabetical order, eg:
* ```js
* [ 10, 20, 5, 100 ].sort(jsComparer); // same as .sort()
* // Yields: [10, 100, 20, 5]
* ```
*
* Returns -1 if x is less than y
* Returns 1 if x is greater than y
* Returns 0 if x is the same as y
* @param x
* @param y
* @returns
*/
const jsComparer = (x, y) => {
	if (x === void 0 && y === void 0) return 0;
	if (x === void 0) return 1;
	if (y === void 0) return -1;
	const xString = defaultToString(x);
	const yString = defaultToString(y);
	if (xString < yString) return -1;
	if (xString > yString) return 1;
	return 0;
};
/**
* Inverts the source comparer.
* @param comparer
* @returns
*/
const comparerInverse = (comparer) => {
	return (x, y) => {
		const v = comparer(x, y);
		return v * -1;
	};
};
/**
* Compares numbers by numeric value, otherwise uses the default
* logic of string comparison.
*
* Is an ascending sort:
* * b, a, c -> a, b, c
* * 10, 5, 100 -> 5, 10, 100
*
* Returns -1 if x is less than y
* Returns 1 if x is greater than y
* Returns 0 if x is the same as y
* @param x
* @param y
* @see {@link comparerInverse} Inverted order
* @returns
*/
const defaultComparer = (x, y) => {
	if (typeof x === `number` && typeof y === `number`) return numericComparer(x, y);
	return jsComparer(x, y);
};

//#endregion
//#region ../core/dist/src/maps.js
var maps_exports = {};
__export(maps_exports, {
	addObjectEntriesMutate: () => addObjectEntriesMutate,
	addValue: () => addValue,
	addValueMutate: () => addValueMutate,
	addValueMutator: () => addValueMutator,
	deleteByValueCompareMutate: () => deleteByValueCompareMutate,
	filterValues: () => filterValues,
	findBySomeKey: () => findBySomeKey,
	findEntryByPredicate: () => findEntryByPredicate,
	findEntryByValue: () => findEntryByValue,
	findValue: () => findValue,
	fromIterable: () => fromIterable,
	fromObject: () => fromObject,
	getClosestIntegerKey: () => getClosestIntegerKey,
	getOrGenerate: () => getOrGenerate,
	getOrGenerateSync: () => getOrGenerateSync,
	hasAnyValue: () => hasAnyValue,
	hasKeyValue: () => hasKeyValue,
	mapToArray: () => mapToArray,
	mapToObjectTransform: () => mapToObjectTransform,
	mergeByKey: () => mergeByKey,
	some: () => some,
	sortByValue: () => sortByValue,
	sortByValueProperty: () => sortByValueProperty,
	toArray: () => toArray,
	toObject: () => toObject,
	transformMap: () => transformMap,
	zipKeyValue: () => zipKeyValue
});
/**
* Gets the closest integer key to `target` in `data`.
* * Requires map to have numbers as keys, not strings
* * Math.round is used for rounding `target`.
*
* Examples:
* ```js
* // Assuming numeric keys 1, 2, 3, 4 exist:
* getClosestIntegerKey(map, 3);    // 3
* getClosestIntegerKey(map, 3.1);  // 3
* getClosestIntegerKey(map, 3.5);  // 4
* getClosestIntegerKey(map, 3.6);  // 4
* getClosestIntegerKey(map, 100);  // 4
* getClosestIntegerKey(map, -100); // 1
* ```
* @param data Map
* @param target Target value
* @returns
*/
const getClosestIntegerKey = (data, target) => {
	target = Math.round(target);
	if (data.has(target)) return target;
	else {
		let offset = 1;
		while (offset < 1e3) {
			if (data.has(target - offset)) return target - offset;
			else if (data.has(target + offset)) return target + offset;
			offset++;
		}
		throw new Error(`Could not find target ${target.toString()}`);
	}
};
/**
* Returns the first value in `data` that matches a key from `keys`.
* ```js
* // Iterate, yielding: `a.b.c.d`, `b.c.d`, `c.d`, `d`
* const keys = Text.segmentsFromEnd(`a.b.c.d`);
* // Gets first value that matches a key (starting from most precise)
* const value = findBySomeKey(data, keys);
* ```
* @param data
* @param keys
* @returns
*/
const findBySomeKey = (data, keys) => {
	for (const key of keys) if (data.has(key)) return data.get(key);
};
/**
* Returns true if map contains `value` under `key`, using `comparer` function. Use {@link hasAnyValue} if you don't care
* what key value might be under.
*
* Having a comparer function is useful to check by value rather than object reference.
*
* @example Find key value based on string equality
* ```js
* hasKeyValue(map,`hello`, `samantha`, (a, b) => a === b);
* ```
* @param map Map to search
* @param key Key to search
* @param value Value to search
* @param comparer Function to determine match. By default uses === comparison.
* @returns True if key is found
*/
const hasKeyValue = (map, key, value, comparer = isEqualDefault) => {
	if (!map.has(key)) return false;
	const values = [...map.values()];
	return values.some((v) => comparer(v, value));
};
/**
* Deletes all key/values from map where value matches `value`,
* with optional comparer. Mutates map.
*
* ```js
* // Compare fruits based on their colour property
* const colourComparer = (a, b) => a.colour === b.colour;
*
* // Deletes all values where .colour = `red`
* deleteByValueCompareMutate(map, { colour: `red` }, colourComparer);
* ```
* @param map
* @param value
* @param comparer Uses === equality by default. Use isEqualValueDefault to compare by value
*/
const deleteByValueCompareMutate = (map, value, comparer = isEqualDefault) => {
	for (const entry of map.entries()) if (comparer(entry[1], value)) map.delete(entry[0]);
};
/**
* Finds first entry by iterable value. Expects a map with an iterable as values.
*
* ```js
* const map = new Map();
* map.set('hello', 'a');
* map.set('there', 'b');
*
* const entry = findEntryByPredicate(map, (value, key) => {
*  return (value === 'b');
* });
* // Entry is: ['there', 'b']
* ```
*
* An alternative is {@link findEntryByValue} to search by value.
* @param map Map to search
* @param predicate Filter function returns true when there is a match of value
* @returns Entry, or _undefined_ if `filter` function never returns _true_
*/
const findEntryByPredicate = (map, predicate) => {
	for (const entry of map.entries()) if (predicate(entry[1], entry[0])) return entry;
};
/**
* Finds first entry by value.
*
* ```js
* const map = new Map();
* map.set('hello', 'a');
* map.set('there', 'b');
*
* const entry = findEntryByValue(map, 'b');
* // Entry is: ['there', 'b']
* ```
*
* Uses JS's === comparison by default. Consider using `isEqualValueDefault` to match by value.
* An alternative is {@link findEntryByValue} to search by predicate function.
* @param map Map to search
* @param value Value to seek
* @param isEqual Filter function which checks equality. Uses JS comparer by default.
* @returns Entry, or _undefined_ if `value` not found.
*/
const findEntryByValue = (map, value, isEqual = isEqualDefault) => {
	for (const entry of map.entries()) if (isEqual(entry[1], value)) return entry;
};
/**
* Adds items to a map only if their key doesn't already exist
*
* Uses provided {@link ToString} function to create keys for items. Item is only added if it doesn't already exist.
* Thus the older item wins out, versus normal `Map.set` where the newest wins.
*
* Returns a copy of the input map.
* @example
* ```js
* const map = new Map();
* const peopleArray = [ _some people objects..._];
* addKeepingExisting(map, p => p.name, ...peopleArray);
* ```
* @param set
* @param hasher
* @param values
* @returns
*/
/**
* Mutates `map`, adding each value to it using a
* function to produce a key. Use {@link addValue} for an immutable version.
* ```
* const map = new Map();
* addValueMutate(map, v=>v.name, { name:`Jane`, size:10 }, { name:`Bob`, size: 9 });
* // Map consists of entries:
* // [ `Jane`, { name:`Jane`, size:10 } ],
* // [ `Bob` { name:`Bob`, size: 9 } ]
* ```
*
* Uses {@link addValueMutator} under the hood.
* @param map Map to modify. If _undefined_, a new map is created
* @param hasher Function to generate a string key for a given object value
* @param values Values to add
* @param collisionPolicy What to do if the key already exists
* @returns Map instance
*/
const addValueMutate = (map, hasher, collisionPolicy, ...values) => {
	const m = map ?? /* @__PURE__ */ new Map();
	const f = addValueMutator(m, hasher, collisionPolicy);
	f(...values);
	return m;
};
/**
* Adds values to a map, returning a new, modified copy and leaving the original
* intact.
*
* Use {@link addValueMutate} for a mutable
* @param map Map to start with, or _undefined_ to automatically create a map
* @param hasher Function to create keys for values
* @param collisionPolicy What to do if a key already exists
* @param values Values to add
* @returns A new map containing values
*/
const addValue = (map, hasher, collisionPolicy, ...values) => {
	const m = map === void 0 ? /* @__PURE__ */ new Map() : new Map(map);
	for (const v of values) {
		const hashResult = hasher(v);
		if (collisionPolicy !== `overwrite`) {
			if (m.has(hashResult)) {
				if (collisionPolicy === `throw`) throw new Error(`Key '${hashResult}' already in map`);
				if (collisionPolicy === `skip`) continue;
			}
		}
		m.set(hashResult, v);
	}
	return m;
};
/**
* Returns a function that adds values to a map, using a hashing function to produce a key.
* Use {@link addValueMutate} if you don't need a reusable function.
*
* ```js
* const map = new Map(); // Create map
* const mutate = addValueMutator(map, v=>v.name); // Create a mutator using default 'overwrite' policy
* mutate( { name:`Bob`, size:10 }, { name: `Alice`, size: 2 }); // Add values to map
* mutate( {name: `Bob`, size: 11 }); // Change the value stored under key `Bob`.
* map.get(`Bob`); // { name: `Bob`, size: 11 }
* ```
*
* The 'collision policy' determines what to do if the key already exists. The default behaviour
* is to overwrite the key, just as Map.set would.
* ```js
* const map = new Map();
* const mutate = addValueMutator(map, v=>v.name, `skip`);
* mutate( { name:`Bob`,size:10 }, { name: `Alice`, size: 2 }); // Add values to map
* mutate( { name:`Bob`, size: 20 }); // This value would be skipped because map already contains 'Bob'
* map.get(`Bob`); // { name: `Bob`, size: 10 }
* ```
*
* @param map Map to modify
* @param hasher Hashing function to make a key for a value
* @param collisionPolicy What to do if a value is already stored under a key
* @returns Function
*/
const addValueMutator = (map, hasher, collisionPolicy = `overwrite`) => {
	return (...values) => {
		for (const v of values) {
			const hashResult = hasher(v);
			if (collisionPolicy !== `overwrite`) {
				if (map.has(hashResult)) {
					if (collisionPolicy === `throw`) throw new Error(`Key '${hashResult}' already in map`);
					if (collisionPolicy === `skip`) continue;
				}
			}
			map.set(hashResult, v);
		}
		return map;
	};
};
/**
* Returns a array of entries from a map, sorted by value.
*
* ```js
* const m = new Map();
* m.set(`4491`, { name: `Bob` });
* m.set(`2319`, { name: `Alice` });
*
* // Compare by name
* const comparer = (a, b) => defaultComparer(a.name, b.name);
*
* // Get sorted values
* const sorted = Maps.sortByValue(m, comparer);
* ```
*
* `sortByValue` takes a comparison function that should return -1, 0 or 1 to indicate order of `a` to `b`.
* @param map
* @param comparer
* @returns
*/
const sortByValue = (map, comparer) => {
	const f = comparer ?? defaultComparer;
	return [...map.entries()].sort((a, b) => f(a[1], b[1]));
};
/**
* Returns an array of entries from a map, sorted by a property of the value
*
* ```js
* const m = new Map();
* m.set(`4491`, { name: `Bob` });
* m.set(`2319`, { name: `Alice` });
* const sorted = sortByValueProperty(m, `name`);
* ```
* @param map Map to sort
* @param property Property of value
* @param compareFunction Comparer. If unspecified, uses a default.
*/
const sortByValueProperty = (map, property, compareFunction) => {
	const cfn = typeof compareFunction === `undefined` ? defaultComparer : compareFunction;
	return [...map.entries()].sort((aE, bE) => {
		const a = aE[1];
		const b = bE[1];
		return cfn(a[property], b[property]);
	});
};
/**
* Returns _true_ if any key contains `value`, based on the provided `comparer` function. Use {@link hasKeyValue}
* if you only want to find a value under a certain key.
*
* Having a comparer function is useful to check by value rather than object reference.
* @example Finds value where name is 'samantha', regardless of other properties
* ```js
* hasAnyValue(map, {name:`samantha`}, (a, b) => a.name === b.name);
* ```
*
* Works by comparing `value` against all values contained in `map` for equality using the provided `comparer`.
*
* @param map Map to search
* @param value Value to find
* @param comparer Function that determines matching. Should return true if `a` and `b` are considered equal.
* @returns True if value is found
*/
const hasAnyValue = (map, value, comparer) => {
	const entries = [...map.entries()];
	return entries.some((kv) => comparer(kv[1], value));
};
/**
* Returns values where `predicate` returns true.
*
* If you just want the first match, use `find`
*
* @example All people over thirty
* ```js
* // for-of loop
* for (const v of filterValues(people, person => person.age > 30)) {
*
* }
* // If you want an array
* const overThirty = Array.from(filterValues(people, person => person.age > 30));
* ```
* @param map Map
* @param predicate Filtering predicate
* @returns Values that match predicate
*/
function* filterValues(map, predicate) {
	for (const v of map.values()) if (predicate(v)) yield v;
}
/**
* Copies data to an array
* @param map
* @returns
*/
const toArray = (map) => [...map.values()];
/**
* Returns a Map from an iterable. By default throws an exception
* if iterable contains duplicate values.
*
* ```js
* const data = [
*  { fruit: `granny-smith`, family: `apple`, colour: `green` },
*  { fruit: `mango`, family: `stone-fruit`, colour: `orange` }
* ];
* const map = fromIterable(data, v => v.fruit);
* map.get(`granny-smith`); // { fruit: `granny-smith`, family: `apple`, colour: `green` }
* ```
* @param data Input data
* @param keyFunction Function which returns a string id. By default uses the JSON value of the object.
* @param collisionPolicy By default, values with same key overwrite previous (`overwrite`)
* @returns
*/
const fromIterable = (data, keyFunction = toStringDefault, collisionPolicy = `overwrite`) => {
	const m = /* @__PURE__ */ new Map();
	for (const d of data) {
		const key = keyFunction(d);
		if (m.has(key)) {
			if (collisionPolicy === `throw`) throw new Error(`Key '${key}' is already used and new data will overwrite it. `);
			if (collisionPolicy === `skip`) continue;
		}
		m.set(key, d);
	}
	return m;
};
/**
* Returns a Map from an object, or array of objects.
* Assumes the top-level properties of the object is the key.
*
* ```js
* const data = {
*  Sally: { name: `Sally`, colour: `red` },
*  Bob: { name: `Bob`, colour: `pink` }
* };
* const map = fromObject(data);
* map.get(`Sally`); // { name: `Sally`, colour: `red` }
* ```
*
* To add an object to an existing map, use {@link addObjectEntriesMutate}.
* @param data
* @returns
*/
const fromObject = (data) => {
	const map = /* @__PURE__ */ new Map();
	if (Array.isArray(data)) for (const d of data) addObjectEntriesMutate(map, d);
	else addObjectEntriesMutate(map, data);
	return map;
};
/**
* Adds an object to an existing map, mutating it.
* It assumes a structure where each top-level property is a key:
*
* ```js
* const data = {
*  Sally: { colour: `red` },
*  Bob:   { colour: `pink` }
* };
* const map = new Map();
* addObjectEntriesMutate(map, data);
*
* map.get(`Sally`); // { name: `Sally`, colour: `red` }
* ```
*
* To create a new map from an object, use {@link fromObject} instead.
* @param map
* @param data
*/
const addObjectEntriesMutate = (map, data) => {
	const entries = Object.entries(data);
	for (const [key, value] of entries) map.set(key, value);
};
/**
* Returns the first found value that matches `predicate` or _undefined_.
* To get an entry see {@link findEntryByPredicate}
*
* Use {@link some} if you don't care about the value, just whether it appears.
* Use {@link filterValue} to get all value(s) that match `predicate`.
*
* @example First person over thirty
* ```js
* const overThirty = findValue(people, person => person.age > 30);
* ```
* @param map Map to search
* @param predicate Function that returns true for a matching value
* @returns Found value or _undefined_
*/
const findValue = (map, predicate) => [...map.values()].find((v) => predicate(v));
/**
* Returns _true_ if `predicate` yields _true_ for any value in `map`.
* Use {@link findValue} if you want the matched value.
* ```js
* const map = new Map();
* map.set(`fruit`, `apple`);
* map.set(`colour`, `red`);
* Maps.some(map, v => v === `red`);    // true
* Maps.some(map, v => v === `orange`); // false
* ```
* @param map
* @param predicate
* @returns
*/
const some = (map, predicate) => [...map.values()].some((v) => predicate(v));
/**
* Converts a map to a simple object, transforming from type `T` to `K` as it does so. If no transforms are needed, use {@link toObject}.
*
* ```js
* const map = new Map();
* map.set(`name`, `Alice`);
* map.set(`pet`, `dog`);
*
* const o = mapToObjectTransform(map, v => {
*  ...v,
*  registered: true
* });
*
* // Yields: { name: `Alice`, pet: `dog`, registered: true }
* ```
*
* If the goal is to create a new map with transformed values, use {@link transformMap}.
* @param m
* @param valueTransform
* @typeParam T Value type of input map
* @typeParam K Value type of destination map
* @returns
*/
const mapToObjectTransform = (m, valueTransform) => [...m].reduce((object, [key, value]) => {
	const t = valueTransform(value);
	object[key] = t;
	return object;
}, {});
/**
* Zips together an array of keys and values into an object. Requires that
* `keys` and `values` are the same length.
*
* @example
* ```js
* const o = zipKeyValue([`a`, `b`, `c`], [0, 1, 2])
* Yields: { a: 0, b: 1, c: 2}
*```
* @param keys String keys
* @param values Values
* @typeParam V Type of values
* @return Object with keys and values
*/
const zipKeyValue = (keys, values) => {
	if (keys.length !== values.length) throw new Error(`Keys and values arrays should be same length`);
	return Object.fromEntries(keys.map((k, index) => [k, values[index]]));
};
/**
* Like `Array.map`, but for a Map. Transforms from Map<K,V> to Map<K,R>, returning as a new Map.
*
* @example
* ```js
* const mapOfStrings = new Map();
* mapOfStrings.set(`a`, `10`);
* mapOfStrings.get(`a`); // Yields `10` (a string)
*
* // Convert a map of string->string to string->number
* const mapOfInts = transformMap(mapOfStrings, (value, key) => parseInt(value));
*
* mapOfInts.get(`a`); // Yields 10 (a proper number)
* ```
*
* If you want to combine values into a single object, consider instead  {@link mapToObjectTransform}.
* @param source
* @param transformer
* @typeParam K Type of keys (generally a string)
* @typeParam V Type of input map values
* @typeParam R Type of output map values
* @returns
*/
const transformMap = (source, transformer) => new Map(Array.from(source, (v) => [v[0], transformer(v[1], v[0])]));
/**
* Converts a `Map` to a plain object, useful for serializing to JSON.
* To convert back to a map use {@link fromObject}.
*
* @example
* ```js
* const map = new Map();
* map.set(`Sally`, { name: `Sally`, colour: `red` });
* map.set(`Bob`, { name: `Bob`, colour: `pink });
*
* const objects = Maps.toObject(map);
* // Yields: {
* //  Sally: { name: `Sally`, colour: `red` },
* //  Bob: { name: `Bob`, colour: `pink` }
* // }
* ```
* @param m
* @returns
*/
const toObject = (m) => [...m].reduce((object, [key, value]) => {
	object[key] = value;
	return object;
}, {});
/**
* Converts Map to Array with a provided `transformer` function. Useful for plucking out certain properties
* from contained values and for creating a new map based on transformed values from an input map.
*
* @example Get an array of ages from a map of Person objects
* ```js
* const person = { age: 29, name: `John`};
* map.set(person.name, person);
*
* const ages = mapToArray(map, (key, person) => person.age);
* // [29, ...]
* ```
*
* In the above example, the `transformer` function returns a number, but it could
* just as well return a transformed version of the input:
*
* ```js
* // Return with random heights and uppercased name
* mapToArray(map, (key, person) => ({
*  ...person,
*  height: Math.random(),
*  name: person.name.toUpperCase();
* }))
* // Yields:
* // [{height: 0.12, age: 29, name: "JOHN"}, ...]
* ```
* @param m
* @param transformer A function that takes a key and item, returning a new item.
* @returns
*/
const mapToArray = (m, transformer) => [...m.entries()].map((x) => transformer(x[0], x[1]));
/**
* Merges maps left to right, using the provided
* `reconcile` function to choose a winner when keys overlap.
*
* There's also @ixfx/arrays/mergeByKey if you don't already have a map.
*
* For example, if we have the map A:
* 1 => `A-1`, 2 => `A-2`, 3 => `A-3`
*
* And map B:
* 1 => `B-1`, 2 => `B-2`, 4 => `B-4`
*
* If they are merged with the reconile function:
* ```js
* const reconcile = (a, b) => b.replace(`-`, `!`);
* const output = mergeByKey(reconcile, mapA, mapB);
* ```
*
* The final result will be:
*
* 1 => `B!1`, 2 => `B!2`, 3 => `A-3`, 4 => `B-4`
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
* @param reconcile
* @param maps
*/
const mergeByKey = (reconcile, ...maps) => {
	const result = /* @__PURE__ */ new Map();
	for (const m of maps) for (const [mk, mv] of m) {
		let v = result.get(mk);
		v = v ? reconcile(v, mv) : mv;
		result.set(mk, v);
	}
	return result;
};
/**
* @inheritDoc getOrGenerate
* @param map
* @param fn
* @returns
*/
const getOrGenerateSync = (map, fn) => (key, args) => {
	let value = map.get(key);
	if (value !== void 0) return value;
	value = fn(key, args);
	map.set(key, value);
	return value;
};
/**
* Returns a function that fetches a value from a map, or generates and sets it if not present.
* Undefined is never returned, because if `fn` yields that, an error is thrown.
*
* See {@link getOrGenerateSync} for a synchronous version.
*
* ```
* const m = getOrGenerate(new Map(), (key) => {
*  return key.toUppercase();
* });
*
* // Not contained in map, so it will run the uppercase function,
* // setting the value to the key 'hello'.
* const v = await m(`hello`);  // Yields 'HELLO'
* const v1 = await m(`hello`); // Value exists, so it is returned ('HELLO')
* ```
*
*/
const getOrGenerate = (map, fn) => async (key, args) => {
	let value = map.get(key);
	if (value !== void 0) return value;
	value = await fn(key, args);
	if (value === void 0) throw new Error(`fn returned undefined`);
	map.set(key, value);
	return value;
};

//#endregion
//#region ../core/dist/src/continuously.js
/**
* Returns a {@link Continuously} that continually executes `callback` at `interval` rate.
*
* By default, first the sleep period happens and then the callback happens.
*
* Call `start` to begin/reset loop. The looping stops when `cancel` is called, or when `callback` returns _false_.
*
* @example
* Animation loop
* ```js
* const draw = () => {
*  // Draw on canvas
* }
*
* // Run draw() synchronised with monitor refresh rate via `window.requestAnimationFrame`
* continuously(draw).start();
* ```
*
* @example
* With delay
* ```js
* const fn = () => {
*  // Runs after one minute
* }
* const c = continuously(fn, { mins: 1 } );
* c.start(); // Runs `fn` every minute
* ```
*
* @example
* Control a 'continuously'
* ```js
* c.cancel();   // Stop the loop, cancelling any up-coming calls to `fn`
* c.elapsedMs;  // How many milliseconds have elapsed since start
* c.ticks;      // How many iterations of loop since start
* c.interval;   // Get/set speed of loop. Change kicks-in at next loop.
*               // Use .start() to reset to new interval immediately
* ```
*
* Asynchronous callback functions are supported too:
* ```js
* continuously(async () => { ..});
* ```
*
* The `callback` function can receive a few arguments:
*
* ```js
* continuously( (ticks, elapsedMs) => {
*  // ticks: how many times loop has run
*  // elapsedMs:  how long since last loop
* }).start();
* ```
*
* If the callback explicitly returns _false_, the loop will be cancelled.
*
* ```js
* continuously(ticks => {
*  // Stop after 100 iterations
*  if (ticks > 100) return false;
* }).start();
* ```
*
* You can intercept the logic for calls to `start()` with `onStartCalled`. It can determine
* whether the `start()` proceeds, if the loop is cancelled, or the whole thing disposed,
* so it can't run any longer.
*
* ```js
* continuously(callback, intervalMs, {
*  onStartCalled:(ticks, elapsedMs) => {
*    // Cancel the loop after 1000ms has elapsed
*    if (elapsedMs > 1000) return `cancel`;
*  }
* }).start();
* ```
*
* To run `callback` *before* the sleep happens, set `fireBeforeWait`:
* ```js
* continuously(callback, intervalMs, { fireBeforeWait: true });
* ```
* @param callback - Function to run. If it returns _false_, loop exits.
* @param options - {@link ContinuouslyOpts ContinuouslyOpts}
* @param interval - Speed of loop (default: 0)
* @returns Instance to control looping.
* @see Flow.timeout if you want to trigger something once.
*/
const continuously = (callback, interval = 0, options = {}) => {
	let intervalMs = intervalToMs(interval, 0);
	resultThrow(integerTest(intervalMs, `positive`, `interval`));
	const fireBeforeWait = options.fireBeforeWait ?? false;
	const onStartCalled = options.onStartCalled;
	const signal = options.signal;
	let disposed = false;
	let runState = `idle`;
	let startCount = 0;
	let startCountTotal = 0;
	let startedAt = performance.now();
	let intervalUsed = interval ?? 0;
	let cancelled = false;
	let currentTimer;
	const deschedule = () => {
		if (currentTimer === void 0) return;
		globalThis.clearTimeout(currentTimer);
		currentTimer = void 0;
		startCount = 0;
		startedAt = NaN;
	};
	const schedule = (scheduledCallback) => {
		if (intervalMs === 0) if (typeof requestAnimationFrame === `undefined`) currentTimer = globalThis.setTimeout(scheduledCallback, 0);
		else {
			currentTimer = void 0;
			requestAnimationFrame(scheduledCallback);
		}
		else currentTimer = globalThis.setTimeout(scheduledCallback, intervalMs);
	};
	const cancel = () => {
		if (cancelled) return;
		cancelled = true;
		if (runState === `idle`) return;
		runState = `idle`;
		deschedule();
	};
	const loop = async () => {
		if (signal?.aborted) runState = `idle`;
		if (runState === `idle`) return;
		runState = `running`;
		startCount++;
		startCountTotal++;
		const valueOrPromise = callback(startCount, performance.now() - startedAt);
		const value = typeof valueOrPromise === `object` ? await valueOrPromise : valueOrPromise;
		if (cancelled) return;
		runState = `scheduled`;
		if (value !== void 0 && !value) {
			cancel();
			return;
		}
		if (cancelled) return;
		schedule(loop);
	};
	const start = () => {
		if (disposed) throw new Error(`Disposed`);
		cancelled = false;
		if (onStartCalled !== void 0) {
			const doWhat = onStartCalled(startCount, performance.now() - startedAt);
			switch (doWhat) {
				case `cancel`: {
					cancel();
					return;
				}
				case `reset`: {
					reset();
					return;
				}
				case `dispose`: {
					disposed = true;
					cancel();
					return;
				}
			}
		}
		if (runState === `idle`) {
			startCount = 0;
			startedAt = performance.now();
			runState = `scheduled`;
			if (fireBeforeWait) loop();
			else schedule(loop);
		}
	};
	const reset = () => {
		if (disposed) throw new Error(`Disposed`);
		cancelled = false;
		startCount = 0;
		startedAt = NaN;
		if (runState !== `idle`) cancel();
		start();
	};
	return {
		start,
		reset,
		cancel,
		get interval() {
			return intervalUsed;
		},
		get runState() {
			return runState;
		},
		get startCountTotal() {
			return startCountTotal;
		},
		get startCount() {
			return startCount;
		},
		set interval(interval$1) {
			const ms = intervalToMs(interval$1, 0);
			resultThrow(integerTest(ms, `positive`, `interval`));
			intervalMs = ms;
			intervalUsed = interval$1;
		},
		get isDisposed() {
			return disposed;
		},
		get elapsedMs() {
			return performance.now() - startedAt;
		}
	};
};

//#endregion
//#region ../core/dist/src/elapsed.js
/**
* Returns elapsed time since the initial call.
*
* ```js
* // Record start
* const elapsed = elapsedSince();
*
* // Get elapsed time in millis
* // since Elapsed.since()
* elapsed(); // Yields number
* ```
*
* If you want to initialise a stopwatch, but not yet start it, consider:
* ```js
* // Init
* let state = {
*  clicked: Stopwatch.infinity()
* };
*
* state.click(); // Returns a giant value
*
* // Later, when click happens:
* state = { click: elapsedSince() }
* ```
*
* See also:
* * {@link elapsedOnce} if you want to measure a single period, and stop it.
* * {@link elapsedInterval} time _between_ calls
* @returns
*/
const elapsedSince = () => {
	const start = performance.now();
	return () => {
		return performance.now() - start;
	};
};
/**
* Returns the interval between the start and each subsequent call.
*
* ```js
* const interval = elapsedInterval();
* interval(); // Time from elapsedInterval()
* interval(); // Time since last interval() call
* ```
*
* See also:
* * {@link elapsedSince}: time since first call
* * {@link elapsedOnce}: time between two events
* @returns
*/
const elapsedInterval = () => {
	let start = performance.now();
	return () => {
		const now = performance.now();
		const x = now - start;
		start = now;
		return x;
	};
};
/**
* Returns elapsed time since initial call, however
* unlike {@link elapsedSince}, timer stops when first invoked.
*
* ```js
* const elapsed = elapsedOnce();
* // ...do stuff
* elapsed(); // Yields time since elapsedOnce() was called
* // ...do more stuff
* elapsed(); // Is still the same number as above
* ```
*
* See also:
* * {@link elapsedSince}: elapsed time
* * {@link elapsedInterval}: time _between_ calls
* @returns
*/
const elapsedOnce = () => {
	const start = Date.now();
	let stoppedAt = 0;
	return () => {
		if (stoppedAt === 0) stoppedAt = Date.now() - start;
		return stoppedAt;
	};
};
/**
* Returns a function that reports an 'infinite' elapsed time.
* this can be useful as an initialiser for `elapsedSince` et al.
*
* ```js
* // Init clicked to be an infinite time
* let clicked = elapsedInfinity();
*
* document.addEventListener('click', () => {
*  // Now that click has happened, we can assign it properly
*  clicked = Stopwatch.since();
* });
* ```
* @returns
*/
const elapsedInfinity = () => {
	return () => {
		return Number.POSITIVE_INFINITY;
	};
};

//#endregion
//#region ../core/dist/src/promise-from-event.js
const promiseFromEvent = (target, name) => {
	return new Promise((resolve) => {
		const handler = (...args) => {
			target.removeEventListener(name, handler);
			if (Array.isArray(args) && args.length === 1) resolve(args[0]);
			else resolve(args);
		};
		target.addEventListener(name, handler);
	});
};

//#endregion
//#region ../core/dist/src/sleep.js
if (typeof window === `undefined` || !(`requestAnimationFrame` in window)) {
	if (typeof window === `undefined`) globalThis.requestAnimationFrame = (callback) => {
		setTimeout(callback, 1);
	};
}
/**
* Returns after timeout period.
*
* @example In an async function
* ```js
* console.log(`Hello`);
* await sleep(1000);
* console.log(`There`); // Prints one second after
* ```
*
* @example As a promise
* ```js
* console.log(`Hello`);
* sleep({ millis: 1000 })
*  .then(() => console.log(`There`)); // Prints one second after
* ```
*
* If a timeout of 0 is given, `requestAnimationFrame` is used instead of `setTimeout`.
*
* `Flow.delay()` and {@link sleep} are similar. `Flow.delay()` takes a parameter of what code to execute after the timeout, while `sleep()` just resolves after the timeout.
*
* A value can be provided, which is returned on awaking:
* ```js
* const v = await sleep({ seconds: 1, value: `hello`);
* // v = `hello`
* ```
*
* Provide an AbortSignal to cancel the sleep and throwing an exception
* so code after the sleep doesn't happen.
*
* ```js
* const ac = new AbortController();
* setTimeout(() => { ac.abort(); }, 1000); // Abort after 1s
*
* // Sleep for 1min
* await sleep({ minutes: 1, signal: ac.signal });
* console.log(`Awake`); // This line doesn't get called because an exception is thrown when aborting
* ```
* @param optsOrMillis Milliseconds to sleep, or options
* @return
*/
const sleep = (optsOrMillis) => {
	const timeoutMs = intervalToMs(optsOrMillis, 1);
	const signal = optsOrMillis.signal;
	const value = optsOrMillis.value;
	resultThrow(numberTest(timeoutMs, `positive`, `timeoutMs`));
	if (timeoutMs === 0) return new Promise((resolve) => requestAnimationFrame((_) => {
		resolve(value);
	}));
	else return new Promise((resolve, reject) => {
		const onAbortSignal = () => {
			clearTimeout(t);
			if (signal) {
				signal.removeEventListener(`abort`, onAbortSignal);
				reject(new Error(signal.reason));
			} else reject(/* @__PURE__ */ new Error(`Cancelled`));
		};
		if (signal) signal.addEventListener(`abort`, onAbortSignal);
		const t = setTimeout(() => {
			signal?.removeEventListener(`abort`, onAbortSignal);
			if (signal?.aborted) {
				reject(new Error(signal.reason));
				return;
			}
			resolve(value);
		}, timeoutMs);
	});
};
/**
* Delays until `predicate` returns true.
* Can be useful for synchronising with other async activities.
* ```js
* // Delay until 'count' reaches 5
* await sleepWhile(() => count >= 5, 100);
* ```
* @param predicate
* @param checkInterval
*/
const sleepWhile = async (predicate, checkInterval = 100) => {
	while (predicate()) await sleep(checkInterval);
};

//#endregion
//#region ../process/dist/src/basic.js
/**
* Outputs the current largest-seen value
* @returns
*/
const max = () => {
	let max$1 = Number.MIN_SAFE_INTEGER;
	const compute = (value) => {
		const valueArray = Array.isArray(value) ? value : [value];
		for (const subValue of valueArray) {
			if (typeof subValue !== `number`) break;
			max$1 = Math.max(subValue, max$1);
		}
		return max$1;
	};
	return compute;
};
/**
* Outputs the current smallest-seen value
* @returns
*/
const min = () => {
	let min$1 = Number.MAX_SAFE_INTEGER;
	const compute = (value) => {
		const valueArray = Array.isArray(value) ? value : [value];
		for (const subValue of valueArray) {
			if (typeof subValue !== `number`) break;
			min$1 = Math.min(subValue, min$1);
		}
		return min$1;
	};
	return compute;
};
/**
* Returns a sum of values
* @returns
*/
const sum = () => {
	let t = 0;
	const compute = (value) => {
		const valueArray = Array.isArray(value) ? value : [value];
		for (const subValue of valueArray) {
			if (typeof subValue !== `number`) continue;
			t += subValue;
		}
		return t;
	};
	return compute;
};
/**
* Returns the current average of input values
* @returns
*/
const average = () => {
	let total = 0;
	let tally$1 = 0;
	const compute = (value) => {
		const valueArray = Array.isArray(value) ? value : [value];
		for (const subValue of valueArray) {
			if (typeof subValue !== `number`) continue;
			tally$1++;
			total += subValue;
		}
		return total / tally$1;
	};
	return compute;
};
/**
* Returns the tally (ie number of) values
* @param countArrayItems
* @returns
*/
const tally = (countArrayItems) => {
	let t = 0;
	const compute = (value) => {
		if (countArrayItems) if (Array.isArray(value)) t += value.length;
		else t++;
		else t++;
		return t;
	};
	return compute;
};
/**
* Returns the 'best' value seen so far as determined by a ranking function.
* This is similar to min/max but usable for objects.
* @param r
* @param options
* @returns
*/
function rank(r, options = {}) {
	const includeType = options.includeType;
	const emitEqualRanked = options.emitEqualRanked ?? false;
	const emitRepeatHighest = options.emitRepeatHighest ?? false;
	let best;
	return (value) => {
		if (includeType && typeof value !== includeType) return;
		if (best === void 0) {
			best = value;
			return best;
		} else {
			const result = r(value, best);
			if (result == `a`) {
				best = value;
				return best;
			} else if (result === `eq` && emitEqualRanked) return best;
			else if (emitRepeatHighest) return best;
		}
	};
}

//#endregion
export { addObjectEntriesMutate, addValue, addValueMutate, addValueMutator, average, comparerInverse, continuously, defaultComparer, deleteByValueCompareMutate, elapsedInfinity, elapsedInterval, elapsedOnce, elapsedSince, filterValues, findBySomeKey, findEntryByPredicate, findEntryByValue, findValue, fromIterable, fromObject, getClosestIntegerKey, getOrGenerate, getOrGenerateSync, hasAnyValue, hasKeyValue, jsComparer, mapToArray, mapToObjectTransform, maps_exports, max, mergeByKey, min, numericComparer, promiseFromEvent, rank, sleep, sleepWhile, some, sortByValue, sortByValueProperty, sum, tally, toArray, toObject, transformMap, zipKeyValue };
//# sourceMappingURL=basic-D0XoOdBJ.js.map