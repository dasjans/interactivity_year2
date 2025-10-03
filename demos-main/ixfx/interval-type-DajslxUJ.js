import { integerTest, numberTest, resultThrow } from "./src-BBD50Kth.js";

//#region ../core/dist/src/records/circular.js
const removeCircularReferences = (value, replaceWith = null, seen = /* @__PURE__ */ new WeakSet(), path = ``) => {
	if (value === null) return value;
	if (typeof value !== `object`) throw new TypeError(`Param 'value' must be an object. Got type: ${typeof value}`);
	seen.add(value);
	const entries = Object.entries(value);
	for (const entry of entries) {
		if (entry[1] === null) continue;
		if (typeof entry[1] !== `object`) continue;
		if (seen.has(entry[1])) {
			entry[1] = replaceWith;
			continue;
		}
		entry[1] = removeCircularReferences(entry[1], replaceWith, seen, `${entry[0]}.`);
	}
	return Object.fromEntries(entries);
};

//#endregion
//#region ../core/dist/src/to-string.js
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
/**
* Returns _true_ if `value` is a Map type
* @param value
* @returns
*/
const isMap = (value) => toTypeString(value) === `[object Map]`;
/**
* Returns _true_ if `value` is a Set type
* @param value
* @returns
*/
const isSet = (value) => toTypeString(value) === `[object Set]`;
/**
* A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
*/
const toStringDefault = (itemToMakeStringFor) => typeof itemToMakeStringFor === `string` ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor);
/**
* Converts a value to string form.
* For simple objects, .toString() is used, other JSON.stringify is used.
* It is meant for creating debugging output or 'hash' versions of objects, and does
* not necessarily maintain full fidelity of the input
* @param value
* @returns
*/
const defaultToString = (value) => {
	if (value === null) return `null`;
	if (typeof value === `boolean` || typeof value === `number`) return value.toString();
	if (typeof value === `string`) return value;
	if (typeof value === `symbol`) throw new TypeError(`Symbol cannot be converted to string`);
	try {
		const s = JSON.stringify(value);
		return s;
	} catch (error) {
		if (typeof value === `object`) return JSON.stringify(removeCircularReferences(value, `(circular)`));
		else throw error;
	}
};

//#endregion
//#region ../core/dist/src/is-equal.js
/**
* If input is a string, it is returned.
* Otherwise, it returns the result of JSON.stringify() with fields ordered.
*
* This allows for more consistent comparisons when object field orders are different but values the same.
* @param itemToMakeStringFor
* @returns
*/
const toStringOrdered = (itemToMakeStringFor) => {
	if (typeof itemToMakeStringFor === `string`) return itemToMakeStringFor;
	const allKeys = /* @__PURE__ */ new Set();
	JSON.stringify(itemToMakeStringFor, (key, value) => (allKeys.add(key), value));
	return JSON.stringify(itemToMakeStringFor, [...allKeys].sort());
};
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
/**
* Returns _true_ if `a` contains the values of `b`. `a` may contain other values, but we
* only check against what is in `b`. `a` and `b` must both be simple objects.
*
* ```js
* const obj = {
*  name: `Elle`,
*  size: 100,
*  colour: {
*    red: 0.5,
*    green: 0.1,
*    blue: 0.2
*  }
* }
*
* isEqualValuePartial(obj, { name: `Elle` }); // true
* isEqualValuePartial(obj, { name: { colour: red: { 0.5, green: 0.1  }} }); // true
*
* isEqualValuePartial(obj, { name: `Ellen` });     // false
* isEqualValuePartial(obj, { lastname: `Elle` });  // false
* ```
* @param a
* @param b
* @param fieldComparer
* @returns
*/
const isEqualValuePartial = (a, b, fieldComparer) => {
	if (typeof a !== `object`) throw new Error(`Param 'a' expected to be object`);
	if (typeof b !== `object`) throw new Error(`Param 'b' expected to be object`);
	if (Object.is(a, b)) return true;
	const comparer = fieldComparer ?? isEqualValuePartial;
	for (const entryB of Object.entries(b)) {
		const valueOnAKeyFromB = a[entryB[0]];
		const valueB = entryB[1];
		if (typeof valueOnAKeyFromB === `object` && typeof valueB === `object`) {
			if (!comparer(valueOnAKeyFromB, valueB)) return false;
		} else if (valueOnAKeyFromB !== valueB) return false;
	}
	return true;
};
/**
* Comparer returns true if string representation of `a` and `b` are equal, regardless of field ordering.
* Uses `toStringOrdered` to generate a string representation (via JSON.stringify`).
*
* ```js
* isEqualValueIgnoreOrder({ a: 10, b: 20}, { b: 20, a: 10 }); // true
* isEqualValue({ a: 10, b: 20}, { b: 20, a: 10 }); // false, fields are different order
* ```
*
* There is an overhead to ordering fields. Use {@link isEqualValueDefault} if it's not possible that field ordering will change.
* @returns True if the contents of `a` and `b` are equal
* @typeParam T - Type of objects being compared
*/
const isEqualValueIgnoreOrder = (a, b) => {
	if (a === b) return true;
	return toStringOrdered(a) === toStringOrdered(b);
};
/**
* Returns _true_ if Object.entries() is empty for `value`
* @param value
* @returns
*/
const isEmptyEntries = (value) => [...Object.entries(value)].length === 0;
/**
* Returns _true_ if `a` and `b` are equal based on their JSON representations.
* `path` is ignored.
* @param a
* @param b
* @param path
* @returns
*/
const isEqualContextString = (a, b, _path) => {
	return JSON.stringify(a) === JSON.stringify(b);
};

//#endregion
//#region ../core/dist/src/iterable-compare-values-shallow.js
/**
* Compares the values of two iterables, returning a list
* of items they have in common and those unique in `a` or `b`.
* Ignores ordering of values, and is NOT recursive.
*
* ```js
* const a = ['apples', 'oranges', 'pears' ]
* const b = ['pears', 'kiwis', 'bananas' ];
*
* const r = compareValuesShallow(a, b);
* r.shared;  // [ 'pears' ]
* r.a;       // [ 'apples', 'oranges' ]
* r.b;       // [ 'kiwis', 'bananas' ]
* ```
*
* By default uses === semantics for comparison.
* @param a
* @param b
* @param eq
* @returns
*/
const compareIterableValuesShallow = (a, b, eq = isEqualDefault) => {
	const shared = [];
	const aUnique = [];
	const bUnique = [];
	for (const elementOfA of a) {
		let seenInB = false;
		for (const elementOfB of b) if (eq(elementOfA, elementOfB)) {
			seenInB = true;
			break;
		}
		if (seenInB) shared.push(elementOfA);
		else aUnique.push(elementOfA);
	}
	for (const elementOfB of b) {
		let seenInA = false;
		for (const elementOfA of a) if (eq(elementOfB, elementOfA)) seenInA = true;
		if (!seenInA) bUnique.push(elementOfB);
	}
	const isSame = aUnique.length === 0 && bUnique.length === 0;
	return {
		shared,
		isSame,
		a: aUnique,
		b: bUnique
	};
};

//#endregion
//#region ../core/dist/src/util/round.js
/**
* Rounds a number.
*
* If one parameter is given, it's the decimal places,
* and a rounding function is returned:
* ```js
* const r = round(2);
* r(10.12355); // 10.12
* ```
*
* If two parameters are given, the first is decimal places,
* the second the value to round.
* ```js
* round(2, 10.12355); // 10.12
* ```
* @param decimalPlaces
* @returns
*/
function round(a, b, roundUp) {
	resultThrow(integerTest(a, `positive`, `decimalPlaces`));
	const up = typeof b === `boolean` ? b : roundUp ?? false;
	let rounder;
	if (a === 0) rounder = Math.round;
	else {
		const p = Math.pow(10, a);
		if (up) rounder = (v) => Math.ceil(v * p) / p;
		else rounder = (v) => Math.floor(v * p) / p;
	}
	if (typeof b === `number`) return rounder(b);
	return rounder;
}

//#endregion
//#region ../core/dist/src/interval-type.js
/**
* Return the millisecond value of an Interval.
*
* ```js
* intervalToMs(100); // 100
* intervalToMs({ millis: 100 }); // 100
* ```
*
* Use `defaultNumber` to return a default in the case of
* _undefined_ or invalid input.
*
* ```js
* intervalToMs(undefined);      // throws error
* intervalToMs(undefined, 100); // 100
* ```
*
* If no default is provided, an exception is thrown.
* @param interval Interval
* @param defaultNumber Default value if `interval` is _undefined_ or invalid
* @returns Milliseconds
*/
function intervalToMs(interval, defaultNumber) {
	if (isInterval(interval)) {
		if (typeof interval === `number`) return interval;
		let ms = interval.millis ?? 0;
		ms += (interval.hours ?? 0) * 60 * 60 * 1e3;
		ms += (interval.mins ?? 0) * 60 * 1e3;
		ms += (interval.secs ?? 0) * 1e3;
		return ms;
	} else {
		if (typeof defaultNumber !== `undefined`) return defaultNumber;
		throw new Error(`Not a valid interval: ${JSON.stringify(interval)}`);
	}
}
/**
* Returns _true_ if `interval` matches the {@link Interval} type.
* @param interval
* @returns _True_ if `interval` is an {@link Interval}.
*/
function isInterval(interval) {
	if (typeof interval === `undefined`) return false;
	if (interval === null) return false;
	if (typeof interval === `number`) {
		if (Number.isNaN(interval)) return false;
		if (!Number.isFinite(interval)) return false;
		return true;
	}
	if (typeof interval !== `object`) return false;
	const hasMillis = `millis` in interval;
	const hasSecs = `secs` in interval;
	const hasMins = `mins` in interval;
	const hasHours = `hours` in interval;
	if (hasMillis && !numberTest(interval.millis).success) return false;
	if (hasSecs && !numberTest(interval.secs).success) return false;
	if (hasMins && !numberTest(interval.mins).success) return false;
	if (hasHours && !numberTest(interval.hours).success) return false;
	if (hasMillis || hasSecs || hasHours || hasMins) return true;
	return false;
}
/**
* Returns a human-readable representation
* of some elapsed milliseconds
*
* @example
* ```js
* elapsedToHumanString(10);      // `10ms`
* elapsedToHumanString(2000);    // `2s`
* elapsedToHumanString(65*1000); // `1mins`
* ```
* @param millisOrFunction Milliseconds as a number, {@link Interval} or function that resolve to a number
* @param rounding Rounding (default: 2)
* @returns
*/
const elapsedToHumanString = (millisOrFunction, rounding = 2) => {
	let interval = 0;
	if (typeof millisOrFunction === `function`) {
		const intervalResult = millisOrFunction();
		return elapsedToHumanString(intervalResult);
	} else if (typeof millisOrFunction === `number`) interval = millisOrFunction;
	else if (typeof millisOrFunction === `object`) interval = intervalToMs(interval);
	let ms = intervalToMs(interval);
	if (typeof ms === `undefined`) return `(undefined)`;
	if (ms < 1e3) return `${round(rounding, ms)}ms`;
	ms /= 1e3;
	if (ms < 120) return `${ms.toFixed(1)}secs`;
	ms /= 60;
	if (ms < 60) return `${ms.toFixed(2)}mins`;
	ms /= 60;
	return `${ms.toFixed(2)}hrs`;
};

//#endregion
export { compareIterableValuesShallow, defaultToString, elapsedToHumanString, intervalToMs, isEmptyEntries, isEqualContextString, isEqualDefault, isEqualValueDefault, isEqualValueIgnoreOrder, isEqualValuePartial, isInterval, isMap, isSet, toStringDefault, toStringOrdered };
//# sourceMappingURL=interval-type-DajslxUJ.js.map