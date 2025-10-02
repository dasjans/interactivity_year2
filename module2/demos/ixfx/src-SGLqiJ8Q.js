import { __export } from "./chunk-51aI8Tpl.js";
import { functionTest, integerTest, numberTest, resultThrow, stringTest, testPlainObjectOrPrimitive } from "./src-BBD50Kth.js";
import { compareObjectKeys, recordEntriesDepthFirst } from "./records-Cei7yF1D.js";
import { isPrimitive } from "./is-primitive-eBwrK4Yg.js";
import { intervalToMs, isEqualContextString } from "./interval-type-DajslxUJ.js";
import { average, max, min, rank, sum, tally } from "./basic-D0XoOdBJ.js";
import { SimpleEventEmitter } from "./src-CkygQtXo.js";
import { isInteger } from "./is-integer-BmMnD0ra.js";
import { resolveWithFallbackSync } from "./resolve-core-CZPH91No.js";
import { clamp$1 as clamp, interpolate, interpolateAngle, scale, wrap } from "./src-2eX6lIN8.js";
import { StateMachineWithEvents, elapsedMillisecondsAbsolute, elapsedTicksAbsolute, frequencyTimer, ofTotal, ofTotalTicks, relative, repeat, timerWithFunction } from "./src-BnNr7xTX.js";
import { Empty, Unit, abs, angleRadian, clampMagnitude, compare, cubic, distance, divide, getEdgeX, getEdgeY, interpolate as interpolate$1, interpolator, invert, multiply, multiplyScalar, normalise, pipeline, pipelineApply, quadraticSimple, subtract, sum as sum$1, toCartesian$1 as toCartesian, toPath } from "./src-CURfSkGx.js";
import { float, floatSource } from "./bezier-5SBfGcNj.js";

//#region ../core/dist/src/pathed.js
var pathed_exports = {};
__export(pathed_exports, {
	applyChanges: () => applyChanges,
	compareData: () => compareData,
	getField: () => getField,
	getPaths: () => getPaths,
	getPathsAndData: () => getPathsAndData,
	updateByPath: () => updateByPath
});
/**
* Get the entries for `target`.
*
* 'deep probe' uses alternative means to get entries of object, since `Object.entries`
* can fail for some objects.
* @param target Object to get entries from
* @param deepProbe If true
* @returns
*/
const getEntries = (target, deepProbe) => {
	if (target === void 0) throw new Error(`Param 'target' is undefined`);
	if (target === null) throw new Error(`Param 'target' is null`);
	if (typeof target !== `object`) throw new Error(`Param 'target' is not an object (got: ${typeof target})`);
	if (deepProbe) {
		const entries = [];
		for (const field in target) {
			const value = target[field];
			if (testPlainObjectOrPrimitive(value)) entries.push([field, value]);
		}
		return entries;
	} else return Object.entries(target);
};
/**
* Scans object, producing a list of changed fields where B's value (newer) differs from A (older).
*
* Options:
* - `deepEntries` (_false_): If _false_ Object.entries are used to scan the object. However this won't work for some objects, eg event args, thus _true_ is needed.
* - `eq` (JSON.stringify): By-value comparison function
* - `includeMissingFromA` (_false): If _true_ includes fields present on B but missing on A.
* - `asPartial` (_false): If _true_, treats B as a partial update to B. This means that things missing from B are not considered removals.
* @param a 'Old' value
* @param b 'New' value
* @param options Options for comparison
* @returns
*/
function* compareData(a, b, options = {}) {
	if (typeof a === `undefined`) {
		yield {
			path: options.pathPrefix ?? ``,
			value: b,
			state: `added`
		};
		return;
	}
	if (typeof b === `undefined`) {
		yield {
			path: options.pathPrefix ?? ``,
			previous: a,
			value: void 0,
			state: `removed`
		};
		return;
	}
	const asPartial = options.asPartial ?? false;
	const skipInstances = options.skipInstances ?? /* @__PURE__ */ new WeakSet();
	const undefinedValueMeansRemoved = options.undefinedValueMeansRemoved ?? false;
	const pathPrefix = options.pathPrefix ?? ``;
	const deepEntries = options.deepEntries ?? false;
	const eq = options.eq ?? isEqualContextString;
	const includeMissingFromA = options.includeMissingFromA ?? false;
	const includeParents = options.includeParents ?? false;
	if (isPrimitive(a) && isPrimitive(b)) {
		if (a !== b) yield {
			path: pathPrefix,
			value: b,
			previous: a,
			state: `change`
		};
		return;
	}
	if (isPrimitive(b)) {
		yield {
			path: pathPrefix,
			value: b,
			previous: a,
			state: `change`
		};
		return;
	}
	const entriesA = getEntries(a, deepEntries);
	const entriesAKeys = /* @__PURE__ */ new Set();
	for (const [key, valueA] of entriesA) {
		entriesAKeys.add(key);
		const keyOfAInB = key in b;
		const valueOfKeyInB = b[key];
		if (typeof valueA === `object` && valueA !== null) {
			if (skipInstances.has(valueA)) continue;
			skipInstances.add(valueA);
			if (keyOfAInB) if (valueOfKeyInB === void 0) throw new Error(`Pathed.compareData Value for key ${key} is undefined`);
			else {
				const sub = [...compareData(valueA, valueOfKeyInB, {
					...options,
					skipInstances,
					pathPrefix: pathPrefix + key + `.`
				})];
				if (sub.length > 0) {
					for (const s of sub) yield s;
					if (includeParents) yield {
						path: pathPrefix + key,
						value: b[key],
						previous: valueA,
						state: `change`
					};
				}
			}
			else {
				if (asPartial) continue;
				yield {
					path: pathPrefix + key,
					value: void 0,
					previous: valueA,
					state: `removed`
				};
			}
		} else {
			const subPath = pathPrefix + key;
			if (keyOfAInB) {
				if (valueOfKeyInB === void 0 && undefinedValueMeansRemoved) yield {
					path: subPath,
					previous: valueA,
					value: void 0,
					state: `removed`
				};
				else if (!eq(valueA, valueOfKeyInB, subPath)) yield {
					path: subPath,
					previous: valueA,
					value: valueOfKeyInB,
					state: `change`
				};
			} else {
				if (asPartial) continue;
				yield {
					path: subPath,
					previous: valueA,
					value: void 0,
					state: `removed`
				};
			}
		}
	}
	if (includeMissingFromA) {
		const entriesB = getEntries(b, deepEntries);
		for (const [key, valueB] of entriesB) {
			if (entriesAKeys.has(key)) continue;
			yield {
				path: pathPrefix + key,
				previous: void 0,
				value: valueB,
				state: `added`
			};
		}
	}
}
/**
* Returns a copy of `source` with `changes` applied.
* @param source
* @param changes
*/
const applyChanges = (source, changes) => {
	for (const change of changes) source = updateByPath(source, change.path, change.value);
	return source;
};
/**
* Returns a copy of `target` object with a specified path changed to `value`.
*
* ```js
* const a = {
*  message: `Hello`,
*  position: { x: 10, y: 20 }
* }
*
* const a1 = updateByPath(a, `message`, `new message`);
* // a1 = { message: `new message`, position: { x: 10, y: 20 }}
* const a2 = updateByPath(a, `position.x`, 20);
* // a2 = { message: `hello`, position: { x: 20, y: 20 }}
* ```
*
* Paths can also be array indexes:
* ```js
* updateByPath([`a`,`b`,`c`], 2, `d`);
* // Yields: [ `a`, `b`, `d` ]
* ```
*
* By default, only existing array indexes can be updated. Use the `allowShapeChange` parameter
* to allow setting arbitrary indexes.
* ```js
* // Throws because array index 3 is undefined
* updateByPath([ `a`, `b`, `c` ], `3`, `d`);
*
* // With allowShapeChange flag
* updateByPath([ `a`, `b`, `c` ], `3`, `d`, true);
* // Returns: [ `a`, `b`, `c`, `d` ]
* ```
*
* Throws an error if:
* * `path` cannot be resolved (eg. `position.z` in the above example)
* * `value` applied to `target` results in the object having a different shape (eg missing a field, field
* changing type, or array index out of bounds). Use `allowShapeChange` to suppress this error.
* * Path is undefined or not a string
* * Target is undefined/null
* @param target Object to update
* @param path Path to set value
* @param value Value to set
* @param allowShapeChange By default _false_, throwing an error if an update change the shape of the original object.
* @returns
*/
const updateByPath = (target, path, value, allowShapeChange = false) => {
	if (path === void 0) throw new Error(`Parameter 'path' is undefined`);
	if (typeof path !== `string`) throw new Error(`Parameter 'path' should be a string. Got: ${typeof path}`);
	if (target === void 0) throw new Error(`Parameter 'target' is undefined`);
	if (target === null) throw new Error(`Parameter 'target' is null`);
	const split = path.split(`.`);
	const r = updateByPathImpl(target, split, value, allowShapeChange);
	return r;
};
const updateByPathImpl = (o, split, value, allowShapeChange) => {
	if (split.length === 0) {
		if (allowShapeChange) return value;
		if (Array.isArray(o) && !Array.isArray(value)) throw new Error(`Expected array value, got: '${JSON.stringify(value)}'. Set allowShapeChange=true to ignore.`);
		if (!Array.isArray(o) && Array.isArray(value)) throw new Error(`Unexpected array value, got: '${JSON.stringify(value)}'. Set allowShapeChange=true to ignore.`);
		if (typeof o !== typeof value) throw new Error(`Cannot reassign object type. (${typeof o} -> ${typeof value}). Set allowShapeChange=true to ignore.`);
		if (typeof o === `object` && !Array.isArray(o)) {
			const c = compareObjectKeys(o, value);
			if (c.a.length > 0) throw new Error(`New value is missing key(s): ${c.a.join(`,`)}`);
			if (c.b.length > 0) throw new Error(`New value cannot add new key(s): ${c.b.join(`,`)}`);
		}
		return value;
	}
	const start = split.shift();
	if (!start) return value;
	const isInt = isInteger(start);
	if (isInt && Array.isArray(o)) {
		const index = Number.parseInt(start);
		if (index >= o.length && !allowShapeChange) throw new Error(`Array index ${index.toString()} is outside of the existing length of ${o.length.toString()}. Use allowShapeChange=true to permit this.`);
		const copy = [...o];
		copy[index] = updateByPathImpl(copy[index], split, value, allowShapeChange);
		return copy;
	} else if (start in o) {
		const copy = { ...o };
		copy[start] = updateByPathImpl(copy[start], split, value, allowShapeChange);
		return copy;
	} else throw new Error(`Path ${start} not found in data`);
};
/**
* Gets the data at `path` in `object`. Assumes '.' separates each segment of path.
*
* ```js
* getField({ name: { first: `Thom`, last: `Yorke` }}, `name.first`); // { value: `Thom`  success: true }
* getField({ colours: [`red`, `green`, `blue` ]}, `colours.1`);      // { value: `green` success: true }
* ```
*
* Returns an error result with more details, eg `{ success: false, error: 'Path could not be found' }`
*
* Throws if:
* * `path` is not a string or empty
* * `object` is _undefined_ or null
* @param object Object to query
* @param path Path
* @param separator Separator of chunks of path. Defaults to '.'
* @returns
*/
const getField = (object, path, separator = `.`) => {
	if (typeof path !== `string`) throw new Error(`Param 'path' ought to be a string. Got: '${typeof path}'`);
	if (path.length === 0) throw new Error(`Param string 'path' is empty`);
	if (object === void 0) throw new Error(`Param 'object' is undefined`);
	if (object === null) throw new Error(`Param 'object' is null`);
	const split = path.split(separator);
	const v = getFieldImpl(object, split, path);
	return v;
};
const getFieldImpl = (object, split, position) => {
	if (object === void 0) return {
		success: false,
		error: `Param 'object' is undefined. Position: ${position}`
	};
	if (split.length === 0) return {
		success: false,
		error: `Path has been exhausted. position: ${position}`
	};
	const start = split.shift();
	if (!start) return {
		success: false,
		error: `Unexpected empty split path. Position: ${position}`
	};
	const isInt = isInteger(start);
	if (isInt && Array.isArray(object)) {
		const index = Number.parseInt(start);
		if (typeof object[index] === `undefined`) return {
			success: false,
			error: `Index '${index}' does not exist. Length: ${object.length}. Position: ${position}`
		};
		if (split.length === 0) return {
			value: object[index],
			success: true
		};
		else return getFieldImpl(object[index], split, split.join(`.`));
	} else if (typeof object === `object` && start in object) if (split.length === 0) return {
		value: object[start],
		success: true
	};
	else return getFieldImpl(object[start], split, split.join(`.`));
	else return {
		success: false,
		error: `Path '${start}' not found. Position: ${position}`
	};
};
/**
* Iterates 'paths' for all the fields on `o`
* ```
* const d = {
*  accel: { x: 1, y: 2, z: 3 },
*  gyro: { x: 4, y: 5, z: 6 }
* };
* const paths = [...getFieldPaths(d)];
* // Yields [ `accel`, `gyro`, `accel.x`, `accel.y`,`accel.z`,`gyro.x`,`gyro.y`,`gyro.z` ]
* ```
*
* Use {@link getField} to fetch data based on a path
*
* If object is _null_ or _undefined_, no results are returned.
*
* If `onlyLeaves` is _true_ (default: _false_), only 'leaf' nodes are included.
* Leaf nodes are those that contain a primitive value.
* ```js
* const paths = getFieldPaths(d, true);
* // Yields [ `accel.x`, `accel.y`,`accel.z`,`gyro.x`,`gyro.y`,`gyro.z` ]
* ```
*
* @param object Object to get paths for.
* @param onlyLeaves If true, only paths with a primitive value are returned.
* @returns
*/
function* getPaths(object, onlyLeaves = false) {
	if (object === void 0 || object === null) return;
	const iter = recordEntriesDepthFirst(object);
	for (const c of iter) {
		if (c.nodeValue === void 0 && onlyLeaves) continue;
		let path = c.name;
		if (c.ancestors.length > 0) path = c.ancestors.join(`.`) + `.` + path;
		yield path;
	}
}
/**
* Returns a representation of the object as a set of paths and data.
* ```js
* const o = { name: `hello`, size: 20, colour: { r:200, g:100, b:40 } }
* const pd = [...getPathsAndData(o)];
* // Yields:
* // [
* // { path: `name`, value: `hello` },
* // { path: `size`, value: `20` },
* // { path: `colour.r`, value: `200` },
* // { path: `colour.g`, value: `100` },
* // { path: `colour.b`, value: `40` }
* //]
* ```
* @param o Object to get paths and data for
* @param maxDepth Set maximum recursion depth. By default unlimited.
* @param prefix Manually set a path prefix if it's necessary
* @returns
*/
function* getPathsAndData(o, onlyLeaves = false, maxDepth = Number.MAX_SAFE_INTEGER, prefix = ``) {
	if (o === null) return;
	if (o === void 0) return;
	yield* getPathsAndDataImpl(o, prefix, onlyLeaves, maxDepth);
}
function* getPathsAndDataImpl(o, prefix, onlyLeaves = false, maxDepth) {
	if (maxDepth <= 0) return;
	if (typeof o !== `object`) return;
	for (const entries of Object.entries(o)) {
		const sub = (prefix.length > 0 ? prefix + `.` : ``) + entries[0];
		const value = entries[1];
		const leaf = typeof value !== `object`;
		if (onlyLeaves && leaf || !onlyLeaves) yield {
			path: sub,
			value
		};
		yield* getPathsAndDataImpl(value, sub, onlyLeaves, maxDepth - 1);
	}
}

//#endregion
//#region ../modulation/dist/src/source/ticks.js
/**
* Returns a function which cycles between 0..1 (inclusive of 0 and 1).
* `totalTicks` is how many ticks it takes to get to 1. Since we want an inclusive 0 & 1,
* the total ticks is actually +1.
*
* Ie. if totalTicks = 10, we get: 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0
*
* Use 'exclusiveStart' and 'exclusiveEnd' flags to shift range. Eg, with `totalTicks` of 10:
* * 'exclusiveStart:true': first value is 0.1, last value is 1.0 (10 values total)
* * 'exclusiveEnd:true': first value is 0, last value is 0.9 (10 values total)
* * If both are true, first value is 0.1, last value is 0.9 (9 values total)
* * If both are false (or not set), we get the case described earlier, first value is 0, last value is 1 (11 values total)
*
* Other examples:
* * totalTicks: 20, value goes up by 0.05
* * totalTicks: 1, value goes up by 1
* @param totalTicks Positive, integer value. How many ticks to complete a cycle
* @param options
* @returns
*/
function ticks$2(totalTicks, options = {}) {
	resultThrow(integerTest(totalTicks, `aboveZero`, `totalTicks`));
	const exclusiveStart = options.exclusiveStart ?? false;
	const exclusiveEnd = options.exclusiveEnd ?? false;
	const cycleLimit = options.cycleLimit ?? Number.MAX_SAFE_INTEGER;
	const startPoint = exclusiveStart ? 1 : 0;
	const endPoint = exclusiveEnd ? totalTicks - 1 : totalTicks;
	let cycleCount = 0;
	let v = options.startAt ?? startPoint;
	if (options.startAtRelative) {
		let totalTicksForReal = totalTicks;
		if (exclusiveStart) totalTicksForReal--;
		if (exclusiveEnd) totalTicksForReal--;
		v = Math.round(options.startAtRelative * totalTicksForReal);
	}
	return (feedback) => {
		if (feedback) {
			if (feedback.resetAt !== void 0) v = feedback.resetAt;
			if (feedback.resetAtRelative !== void 0) v = Math.floor(feedback.resetAtRelative * totalTicks);
		}
		if (cycleCount >= cycleLimit) return 1;
		const current = v / totalTicks;
		v++;
		if (v > endPoint) {
			cycleCount++;
			v = startPoint;
		}
		return current;
	};
}

//#endregion
//#region ../modulation/dist/src/source/time.js
/**
* Returns the percentage of time toward `interval`. See also: {@link bpm}, {@link hertz} which are the same but
* using different units for time.
*
* By default, it continues forever, cycling from 0..1 repeatedly for each interval. Use
* `cycleLimit` to restrict this. A value of 1 means it won't loop.
*
* The starting 'position' is `performance.now()`. If `startAt` option is provided, this will be used instead.
* It probably should be an offset of `performance.now()`, eg: `{ startAt: performance.now() - 500 }` to shift
* the cycle by 500ms.
*
* When using `startAtRelative`, the starting position will be set backward by the relative amount. A value
* of 0.5, for example, will set the timer back 50% of the interval, meaning the cycle will start half way through.
*
* @param interval
* @param options
* @returns
*/
function elapsed(interval, options = {}) {
	const cycleLimit = options.cycleLimit ?? Number.MAX_SAFE_INTEGER;
	const limitValue = 1;
	let start = options.startAt ?? performance.now();
	let cycleCount = 0;
	const intervalMs = intervalToMs(interval, 1e3);
	if (options.startAtRelative) {
		resultThrow(numberTest(options.startAtRelative, `percentage`, `startAtRelative`));
		start = performance.now() - intervalMs * options.startAtRelative;
	}
	return (feedback) => {
		if (feedback) {
			if (feedback.resetAt !== void 0) {
				start = feedback.resetAt;
				if (start === 0) start = performance.now();
			}
			if (feedback.resetAtRelative !== void 0) {
				resultThrow(numberTest(feedback.resetAtRelative, `percentage`, `resetAtRelative`));
				start = performance.now() - intervalMs * feedback.resetAtRelative;
			}
		}
		if (cycleCount >= cycleLimit) return limitValue;
		const now = performance.now();
		const elapsedCycle = now - start;
		if (elapsedCycle >= intervalMs) {
			cycleCount += Math.floor(elapsedCycle / intervalMs);
			start = now;
			if (cycleCount >= cycleLimit) return limitValue;
		}
		return elapsedCycle % intervalMs / intervalMs;
	};
}
/**
* Counts beats based on a BPM.
* Uses {@link elapsed} internally.
* @param bpm
* @param options
* @returns
*/
function bpm(bpm$1, options = {}) {
	const interval = 60 * 1e3 / bpm$1;
	return elapsed(interval, options);
}
/**
* Counts based on hertz (oscillations per second).
* Uses {@link elapsed} internally.
* @param hz
* @param options
* @returns
*/
function hertz(hz, options = {}) {
	const interval = 1e3 / hz;
	return elapsed(interval, options);
}

//#endregion
//#region ../modulation/dist/src/source/per-second.js
/**
* Returns a proportion of `amount` depending on elapsed time.
* Cumulatively, `amount` is yielded every second.
*
* ```js
* // Calculate a proportion of 0.1 every second
* const x = perSecond(0.1);
* x();
* ```
*
* The faster `x()` is called, the smaller the chunks of `amount` are returned.
* Values accumulate. For example, `x()` isn't called for two seconds, 2*amount is returned.
*
* @example Usage
* ```js
* const settings = {
*  ageMod: perSecond(0.1);
* };
*
* let state = {
*  age: 1
* };
*
* // Update
* setInterval(() => {
*  let { age } = state;
*  // Add 0.1 per second, regardless of
*  // loop speed
*  age += settings.ageMod();
*  state = {
*    ...state,
*    age: clamp(age)
*  }
* });
* ```
*
* Use the `clamp` option so the returned value never exceeds `amount`.
* Alternatively, `min`/`max` options allow you to set arbitrary limits.
* @param amount
* @returns
*/
const perSecond = (amount, options = {}) => {
	const perMilli = amount / 1e3;
	let min$1 = options.min ?? Number.MIN_SAFE_INTEGER;
	let max$1 = options.max ?? Number.MAX_SAFE_INTEGER;
	const clamp$1 = options.clamp ?? false;
	if (clamp$1 && options.max) throw new Error(`Use either 'max' or 'clamp', not both.`);
	if (clamp$1) max$1 = amount;
	let called = performance.now();
	return () => {
		const now = performance.now();
		const elapsed$1 = now - called;
		called = now;
		const x = perMilli * elapsed$1;
		if (x > max$1) return max$1;
		if (x < min$1) return min$1;
		return x;
	};
};
/**
* As {@link perSecond}, but per minute.
* @param amount
* @param options
* @returns
*/
const perMinute = (amount, options = {}) => {
	return perSecond(amount / 60, options);
};

//#endregion
//#region ../modulation/dist/src/source/index.js
var source_exports = {};
__export(source_exports, {
	bpm: () => bpm,
	elapsed: () => elapsed,
	hertz: () => hertz,
	perMinute: () => perMinute,
	perSecond: () => perSecond,
	ticks: () => ticks$2
});

//#endregion
//#region ../modulation/dist/src/oscillator.js
var oscillator_exports = {};
__export(oscillator_exports, {
	saw: () => saw,
	sine: () => sine,
	sineBipolar: () => sineBipolar,
	square: () => square,
	triangle: () => triangle
});
const piPi$1 = Math.PI * 2;
/**
* Sine oscillator.
*
* ```js
* import { Oscillators } from "@ixfx/modulation.js"
* import { frequencyTimer } from "@ixfx/flow.js";
* // Setup
* const osc = Oscillators.sine(frequencyTimer(10));
* const osc = Oscillators.sine(0.1);
*
* // Call whenever a value is needed
* const v = osc.next().value;
* ```
*
* @example Saw/tri pinch
* ```js
* const v = Math.pow(osc.value, 2);
* ```
*
* @example Saw/tri bulge
* ```js
* const v = Math.pow(osc.value, 0.5);
* ```
*
*/
function* sine(timerOrFreq) {
	if (timerOrFreq === void 0) throw new TypeError(`Parameter 'timerOrFreq' is undefined`);
	if (typeof timerOrFreq === `number`) timerOrFreq = frequencyTimer(timerOrFreq);
	while (true) yield (Math.sin(timerOrFreq.elapsed * piPi$1) + 1) / 2;
}
/**
* Bipolar sine (-1 to 1)
* @param timerOrFreq
*/
function* sineBipolar(timerOrFreq) {
	if (timerOrFreq === void 0) throw new TypeError(`Parameter 'timerOrFreq' is undefined`);
	if (typeof timerOrFreq === `number`) timerOrFreq = frequencyTimer(timerOrFreq);
	while (true) yield Math.sin(timerOrFreq.elapsed * piPi$1);
}
/**
* Triangle oscillator
*
* ```js
* // Setup
* const osc = triangle(Timers.frequencyTimer(0.1));
* const osc = triangle(0.1);
*
* // Call whenver a value is needed
* const v = osc.next().value;
* ```
*/
function* triangle(timerOrFreq) {
	if (typeof timerOrFreq === `number`) timerOrFreq = frequencyTimer(timerOrFreq);
	while (true) {
		let v = timerOrFreq.elapsed;
		if (v < .5) v *= 2;
		else v = 2 - v * 2;
		yield v;
	}
}
/**
* Saw oscillator
*
* ```js
* import { Oscillators } from "@ixfx/modulation.js"
* import { frequencyTimer } from "@ixfx/flow.js";
* // Setup
* const osc = Oscillators.saw(Timers.frequencyTimer(0.1));
*
* // Or
* const osc = Oscillators.saw(0.1);
*
* // Call whenever a value is needed
* const v = osc.next().value;
* ```
*/
function* saw(timerOrFreq) {
	if (timerOrFreq === void 0) throw new TypeError(`Parameter 'timerOrFreq' is undefined`);
	if (typeof timerOrFreq === `number`) timerOrFreq = frequencyTimer(timerOrFreq);
	while (true) yield timerOrFreq.elapsed;
}
/**
* Square oscillator
*
* ```js
* import { Oscillators } from "@ixfx/modulation.js"
*
* // Setup
* const osc = Oscillators.square(Timers.frequencyTimer(0.1));
* const osc = Oscillators.square(0.1);
*
* // Call whenever a value is needed
* osc.next().value;
* ```
*/
function* square(timerOrFreq) {
	if (typeof timerOrFreq === `number`) timerOrFreq = frequencyTimer(timerOrFreq);
	while (true) yield timerOrFreq.elapsed < .5 ? 0 : 1;
}

//#endregion
//#region ../modulation/dist/src/gaussian.js
const pow$1 = Math.pow;
const gaussianA = 1 / Math.sqrt(2 * Math.PI);
/**
* Returns a roughly gaussian easing function
* ```js
* const fn = Easings.gaussian();
* ```
*
* Try different positive and negative values for `stdDev` to pinch
* or flatten the bell shape.
* @param standardDeviation
* @returns
*/
const gaussian = (standardDeviation = .4) => {
	const mean = .5;
	return (t) => {
		const f = gaussianA / standardDeviation;
		let p = -2.5;
		let c = (t - mean) / standardDeviation;
		c *= c;
		p *= c;
		const v = f * pow$1(Math.E, p);
		if (v > 1) return 1;
		if (v < 0) return 0;
		return v;
	};
};

//#endregion
//#region ../modulation/dist/src/easing/easings-named.js
var easings_named_exports = {};
__export(easings_named_exports, {
	arch: () => arch,
	backIn: () => backIn,
	backInOut: () => backInOut,
	backOut: () => backOut,
	bell: () => bell,
	bounceIn: () => bounceIn,
	bounceInOut: () => bounceInOut,
	bounceOut: () => bounceOut,
	circIn: () => circIn,
	circInOut: () => circInOut,
	circOut: () => circOut,
	cubicIn: () => cubicIn,
	cubicOut: () => cubicOut,
	elasticIn: () => elasticIn,
	elasticInOut: () => elasticInOut,
	elasticOut: () => elasticOut,
	expoIn: () => expoIn,
	expoInOut: () => expoInOut,
	expoOut: () => expoOut,
	quadIn: () => quadIn,
	quadInOut: () => quadInOut,
	quadOut: () => quadOut,
	quartIn: () => quartIn,
	quartOut: () => quartOut,
	quintIn: () => quintIn,
	quintInOut: () => quintInOut,
	quintOut: () => quintOut,
	sineIn: () => sineIn,
	sineInOut: () => sineInOut,
	sineOut: () => sineOut,
	smootherstep: () => smootherstep,
	smoothstep: () => smoothstep
});
const sqrt = Math.sqrt;
const pow = Math.pow;
const cos = Math.cos;
const pi = Math.PI;
const sin = Math.sin;
const bounceOut = (x) => {
	const n1 = 7.5625;
	const d1 = 2.75;
	if (x < 1 / d1) return n1 * x * x;
	else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + .75;
	else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + .9375;
	else return n1 * (x -= 2.625 / d1) * x + .984375;
};
const quintIn = (x) => x * x * x * x * x;
const quintOut = (x) => 1 - pow(1 - x, 5);
const arch = (x) => x * (1 - x) * 4;
const smoothstep = (x) => x * x * (3 - 2 * x);
const smootherstep = (x) => (x * (x * 6 - 15) + 10) * x * x * x;
const sineIn = (x) => 1 - cos(x * pi / 2);
const sineOut = (x) => sin(x * pi / 2);
const quadIn = (x) => x * x;
const quadOut = (x) => 1 - (1 - x) * (1 - x);
const sineInOut = (x) => -(cos(pi * x) - 1) / 2;
const quadInOut = (x) => x < .5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2;
const cubicIn = (x) => x * x * x;
const cubicOut = (x) => 1 - pow(1 - x, 3);
const quartIn = (x) => x * x * x * x;
const quartOut = (x) => 1 - pow(1 - x, 4);
const expoIn = (x) => x === 0 ? 0 : pow(2, 10 * x - 10);
const expoOut = (x) => x === 1 ? 1 : 1 - pow(2, -10 * x);
const quintInOut = (x) => x < .5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2;
const expoInOut = (x) => x === 0 ? 0 : x === 1 ? 1 : x < .5 ? pow(2, 20 * x - 10) / 2 : (2 - pow(2, -20 * x + 10)) / 2;
const circIn = (x) => 1 - sqrt(1 - pow(x, 2));
const circOut = (x) => sqrt(1 - pow(x - 1, 2));
const backIn = (x) => {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return c3 * x * x * x - c1 * x * x;
};
const backOut = (x) => {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
};
const circInOut = (x) => x < .5 ? (1 - sqrt(1 - pow(2 * x, 2))) / 2 : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2;
const backInOut = (x) => {
	const c1 = 1.70158;
	const c2 = c1 * 1.525;
	return x < .5 ? pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2) / 2 : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
};
const elasticIn = (x) => {
	const c4 = 2 * pi / 3;
	return x === 0 ? 0 : x === 1 ? 1 : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4);
};
const elasticOut = (x) => {
	const c4 = 2 * pi / 3;
	return x === 0 ? 0 : x === 1 ? 1 : pow(2, -10 * x) * sin((x * 10 - .75) * c4) + 1;
};
const bounceIn = (x) => 1 - bounceOut(1 - x);
const bell = gaussian();
const elasticInOut = (x) => {
	const c5 = 2 * pi / 4.5;
	return x === 0 ? 0 : x === 1 ? 1 : x < .5 ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2 : pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5) / 2 + 1;
};
const bounceInOut = (x) => x < .5 ? (1 - bounceOut(1 - 2 * x)) / 2 : (1 + bounceOut(2 * x - 1)) / 2;

//#endregion
//#region ../modulation/dist/src/easing/line.js
/**
* Interpolates points along a line.
* By default it's a straight line, so use `bend` to make a non-linear curve.
* @param bend -1...1. -1 will pull line up, 1 will push it down.
* @returns
*/
const line = (bend = 0, warp = 0) => {
	const max$1 = 1;
	const cubicB = {
		x: scale(bend, -1, 1, 0, max$1),
		y: scale(bend, -1, 1, max$1, 0)
	};
	let cubicA = interpolate$1(Math.abs(bend), Empty, cubicB);
	if (bend !== 0 && warp > 0) if (bend > 0) cubicA = interpolate$1(warp, cubicA, {
		x: 0,
		y: cubicB.x * 2
	});
	else cubicA = interpolate$1(warp, cubicA, {
		x: cubicB.y * 2,
		y: 0
	});
	const bzr = cubic(Empty, Unit, cubicA, cubicB);
	const inter = interpolator(bzr);
	return (value) => inter(value);
};

//#endregion
//#region ../modulation/dist/src/modulator-timed.js
/**
* Produce values over time. When the modulate function is complete, the final
* value continues to return. Timer starts when return function is first invoked.
*
* ```js
* const fn = (t) => {
*  // 't' will be values 0..1 where 1 represents end of time period.
*  // Return some computed value based on 't'
*  return t*Math.random();
* }
* const e = Modulate.time(fn, 1000);
*
* // Keep calling e() to get the current value
* e();
* ```
* @param fn Modulate function
* @param duration Duration
* @returns
*/
const time$1 = (fn, duration) => {
	resultThrow(functionTest(fn, `fn`));
	let relative$1;
	return () => {
		if (typeof relative$1 === `undefined`) relative$1 = ofTotal(duration, { clampValue: true });
		return fn(relative$1());
	};
};
/**
* Creates an modulator based on clock time. Time
* starts being counted when modulate function is created.
*
* `timeModulator` allows you to reset and check for completion.
* Alternatively, use {@link time} which is a simple function that just returns a value.
*
* @example Time based easing
* ```
* import { timeModulator } from "@ixfx/modulation.js";
* const fn = (t) => {
*  // 't' will be a value 0..1 representing time elapsed. 1 being end of period.
*  return t*Math.random();
* }
* const t = timeModulator(fn, 5*1000); // Will take 5 seconds to complete
* ...
* t.compute(); // Get current value of modulator
* t.reset();   // Reset to 0
* t.isDone;    // _True_ if finished
* ```
* @param fn Modulator
* @param duration Duration
* @returns ModulatorTimed
*/
const timeModulator = (fn, duration) => {
	resultThrow(functionTest(fn, `fn`));
	const timer = elapsedMillisecondsAbsolute();
	const durationMs = intervalToMs(duration);
	if (durationMs === void 0) throw new Error(`Param 'duration' not provided`);
	const relativeTimer = relative(durationMs, {
		timer,
		clampValue: true
	});
	return timerWithFunction(fn, relativeTimer);
};
/**
* Produce modulate values with each invocation. When the time is complete, the final
* value continues to return. Timer starts when return function is first invoked.
*
* If you need to check if a modulator is done or reset it, consider {@link tickModulator}.
*
* ```js
* const fn = (t) => {
*  // 't' will be values 0..1 representing elapsed ticks toward totwal
* }
* const e = ticks(fn, 100);
*
* // Keep calling e() to get the current value
* e();
* ```
* @param fn Function that produces 0..1 scale
* @param totalTicks Total length of ticks
* @returns
*/
const ticks$1 = (fn, totalTicks) => {
	resultThrow(functionTest(fn, `fn`));
	let relative$1;
	return () => {
		if (typeof relative$1 === `undefined`) relative$1 = ofTotalTicks(totalTicks, { clampValue: true });
		return fn(relative$1());
	};
};
/**
* Creates an modulator based on ticks.
*
* `tickModulator` allows you to reset and check for completion.
* Alternatively, use {@link ticks} which is a simple function that just returns a value.
*
* @example Tick-based modulator
* ```
* import { tickModulator } from "@ixfx/modulation.js";
* const fn = (t) => {
*  // 't' will be values 0..1 based on completion
*  return Math.random() * t;
* }
* const t = tickModulator(fn, 1000);   // Will take 1000 ticks to complete
* t.compute(); // Each call to `compute` progresses the tick count
* t.reset();   // Reset to 0
* t.isDone;    // _True_ if finished
* ```
* @param fn Modulate function that returns 0..1
* @param durationTicks Duration in ticks
* @returns ModulatorTimed
*/
const tickModulator = (fn, durationTicks) => {
	resultThrow(functionTest(fn, `fn`));
	const timer = elapsedTicksAbsolute();
	const relativeTimer = relative(durationTicks, {
		timer,
		clampValue: true
	});
	return timerWithFunction(fn, relativeTimer);
};

//#endregion
//#region ../modulation/dist/src/easing/index.js
var easing_exports = {};
__export(easing_exports, {
	Named: () => easings_named_exports,
	create: () => create,
	get: () => get,
	getEasingNames: () => getEasingNames,
	line: () => line,
	tickEasing: () => tickEasing,
	ticks: () => ticks,
	time: () => time,
	timeEasing: () => timeEasing
});
/**
* Creates an easing function
* ```js
* const e = Easings.create({ duration: 1000, name: `quadIn` });
* const e = Easings.create({ ticks: 100, name: `sineOut` });
* const e = Easings.create({
*  duration: 1000,
*  fn: (v) => {
*    // v will be 0..1 based on time
*    return Math.random() * v
*  }
* });
* ```
* @param options
* @returns
*/
const create = (options) => {
	const name = resolveEasingName(options.name ?? `quintIn`);
	const fn = name ?? options.fn;
	if (typeof fn === `undefined`) throw new Error(`Either 'name' or 'fn' must be set`);
	if (`duration` in options) return time(fn, options.duration);
	else if (`ticks` in options) return ticks(fn, options.ticks);
	else throw new Error(`Expected 'duration' or 'ticks' in options`);
};
/**
* Creates an easing based on clock time. Time
* starts being counted when easing function is created.
*
* `timeEasing` allows you to reset and check for completion.
* Alternatively, use {@link time} which is a simple function that just returns a value.
*
*
* @example Time based easing
* ```
* const t = Easings.timeEasing(`quintIn`, 5*1000); // Will take 5 seconds to complete
* ...
* t.compute(); // Get current value of easing
* t.reset();   // Reset to 0
* t.isDone;    // _True_ if finished
* ```
*
* Thisi function is just a wrapper around Modulator.timedModulator.
* @param nameOrFunction Name of easing, or an easing function
* @param duration Duration
* @returns Easing
*/
const timeEasing = (nameOrFunction, duration) => {
	const fn = resolveEasingName(nameOrFunction);
	return timeModulator(fn, duration);
};
/**
* Produce easing values over time. When the easing is complete, the final
* value continues to return. Timer starts when return function is first invoked.
*
* If you need to check if an easing is done or reset it, consider {@link timeEasing}.
*
* ```js
* // Quad-in easing over one second
* const e = Easings.time(`quadIn`, 1000);
*
* // Keep calling e() to get the current value
* e();
* ```
*
* This function is just a wrapper around Modulate.time
* @param nameOrFunction Easing name or a function that produces 0..1 scale
* @param duration Duration
* @returns
*/
const time = (nameOrFunction, duration) => {
	const fn = resolveEasingName(nameOrFunction);
	return time$1(fn, duration);
};
/**
* Produce easing values with each invocation. When the easing is complete, the final
* value continues to return. Timer starts when return function is first invoked.
*
* If you need to check if an easing is done or reset it, consider {@link tickEasing}.
*
* ```js
* // Quad-in easing over 100 ticks
* const e = Easings.ticks(`quadIn`, 100);
*
* // Keep calling e() to get the current value
* e();
* ```
*
* This is just a wrapper around Modulator.ticks
* @param nameOrFunction Easing name or a function that produces 0..1 scale
* @param totalTicks Total length of ticks
* @returns
*/
const ticks = (nameOrFunction, totalTicks) => {
	const fn = resolveEasingName(nameOrFunction);
	return ticks$1(fn, totalTicks);
};
/**
* Creates an easing based on ticks.
*
* `tickEasing` allows you to reset and check for completion.
* Alternatively, use {@link ticks} which is a simple function that just returns a value.
*
* @example Tick-based easing
* ```
* const t = Easings.tickEasing(`sineIn`, 1000);   // Will take 1000 ticks to complete
* t.compute(); // Each call to `compute` progresses the tick count
* t.reset();   // Reset to 0
* t.isDone;    // _True_ if finished
* ```
* @param nameOrFunction Name of easing, or an easing function
* @param durationTicks Duration in ticks
* @returns Easing
*/
const tickEasing = (nameOrFunction, durationTicks) => {
	const fn = resolveEasingName(nameOrFunction);
	return tickModulator(fn, durationTicks);
};
const resolveEasingName = (nameOrFunction) => {
	const fn = typeof nameOrFunction === `function` ? nameOrFunction : get(nameOrFunction);
	if (typeof fn === `undefined`) {
		const error = typeof nameOrFunction === `string` ? /* @__PURE__ */ new Error(`Easing function not found: '${nameOrFunction}'`) : /* @__PURE__ */ new Error(`Easing function not found`);
		throw error;
	}
	return fn;
};
/**
* Creates a new easing by name
*
* ```js
* const e = Easings.create(`circInOut`, 1000, elapsedMillisecondsAbsolute);
* ```
* @param nameOrFunction Name of easing, or an easing function
* @param duration Duration (meaning depends on timer source)
* @param timerSource Timer source
* @returns
*/
let easingsMap;
/**
* Returns an easing function by name. Throws an error if
* easing is not found.
*
* ```js
* const fn = Easings.get(`sineIn`);
* // Returns 'eased' transformation of 0.5
* fn(0.5);
* ```
* @param easingName eg `sineIn`
* @returns Easing function
*/
const get = function(easingName) {
	resultThrow(stringTest(easingName, `non-empty`, `easingName`));
	const found = cacheEasings().get(easingName.toLowerCase());
	if (found === void 0) throw new Error(`Easing not found: '${easingName}'`);
	return found;
};
function cacheEasings() {
	if (easingsMap === void 0) {
		easingsMap = /* @__PURE__ */ new Map();
		for (const [k, v] of Object.entries(easings_named_exports)) easingsMap.set(k.toLowerCase(), v);
		return easingsMap;
	} else return easingsMap;
}
/**
* Iterate over available easings.
* @private
* @returns Returns list of available easing names
*/
function* getEasingNames() {
	const map = cacheEasings();
	yield* map.keys();
}

//#endregion
//#region ../modulation/dist/src/envelope/Types.js
const adsrStateTransitions = Object.freeze({
	attack: [`decay`, `release`],
	decay: [`sustain`, `release`],
	sustain: [`release`],
	release: [`complete`],
	complete: null
});

//#endregion
//#region ../modulation/dist/src/envelope/AdsrBase.js
const defaultAdsrTimingOpts = Object.freeze({
	attackDuration: 600,
	decayDuration: 200,
	releaseDuration: 800,
	shouldLoop: false
});
/**
* Base class for an ADSR envelope.
*
* It outputs values on a scale of 0..1 corresponding to each phase.
*/
var AdsrBase = class extends SimpleEventEmitter {
	#sm;
	#timeSource;
	#timer;
	#holding;
	#holdingInitial;
	#disposed = false;
	#triggered = false;
	attackDuration;
	decayDuration;
	releaseDuration;
	decayDurationTotal;
	/**
	* If _true_ envelope will loop
	*/
	shouldLoop;
	constructor(opts = {}) {
		super();
		this.attackDuration = opts.attackDuration ?? defaultAdsrTimingOpts.attackDuration;
		this.decayDuration = opts.decayDuration ?? defaultAdsrTimingOpts.decayDuration;
		this.releaseDuration = opts.releaseDuration ?? defaultAdsrTimingOpts.releaseDuration;
		this.shouldLoop = opts.shouldLoop ?? defaultAdsrTimingOpts.shouldLoop;
		this.#sm = new StateMachineWithEvents(adsrStateTransitions, { initial: `attack` });
		this.#sm.addEventListener(`change`, (event) => {
			if (event.newState === `release` && this.#holdingInitial) this.#timer?.reset();
			super.fireEvent(`change`, event);
		});
		this.#sm.addEventListener(`stop`, (event) => {
			super.fireEvent(`complete`, event);
		});
		this.#timeSource = () => elapsedMillisecondsAbsolute();
		this.#holding = this.#holdingInitial = false;
		this.decayDurationTotal = this.attackDuration + this.decayDuration;
	}
	dispose() {
		if (this.#disposed) return;
		this.#sm.dispose();
	}
	get isDisposed() {
		return this.#disposed;
	}
	/**
	* Changes state based on timer status
	* @returns _True_ if state was changed
	*/
	switchStateIfNeeded(allowLooping) {
		if (this.#timer === void 0) return false;
		let elapsed$1 = this.#timer.elapsed;
		const wasHeld = this.#holdingInitial && !this.#holding;
		let hasChanged = false;
		let state = this.#sm.state;
		do {
			hasChanged = false;
			state = this.#sm.state;
			switch (state) {
				case `attack`: {
					if (elapsed$1 > this.attackDuration || wasHeld) {
						this.#sm.next();
						hasChanged = true;
					}
					break;
				}
				case `decay`: {
					if (elapsed$1 > this.decayDurationTotal || wasHeld) {
						this.#sm.next();
						hasChanged = true;
					}
					break;
				}
				case `sustain`: {
					if (!this.#holding || wasHeld) {
						elapsed$1 = 0;
						this.#sm.next();
						this.#timer.reset();
						hasChanged = true;
					}
					break;
				}
				case `release`: {
					if (elapsed$1 > this.releaseDuration) {
						this.#sm.next();
						hasChanged = true;
					}
					break;
				}
				case `complete`: if (this.shouldLoop && allowLooping) this.trigger(this.#holdingInitial);
			}
		} while (hasChanged && state !== `complete`);
		return hasChanged;
	}
	/**
	* Computes a stage's progress from 0-1
	* @param allowStateChange
	* @returns
	*/
	computeRaw(allowStateChange = true, allowLooping = true) {
		if (this.#timer === void 0) return [
			void 0,
			0,
			this.#sm.state
		];
		if (allowStateChange) this.switchStateIfNeeded(allowLooping);
		const previousStage = this.#sm.state;
		const elapsed$1 = this.#timer.elapsed;
		let relative$1 = 0;
		const state = this.#sm.state;
		switch (state) {
			case `attack`: {
				relative$1 = elapsed$1 / this.attackDuration;
				break;
			}
			case `decay`: {
				relative$1 = (elapsed$1 - this.attackDuration) / this.decayDuration;
				break;
			}
			case `sustain`: {
				relative$1 = 1;
				break;
			}
			case `release`: {
				relative$1 = Math.min(elapsed$1 / this.releaseDuration, 1);
				break;
			}
			case `complete`: return [
				`complete`,
				1,
				previousStage
			];
			default: throw new Error(`State machine in unknown state: ${state}`);
		}
		return [
			state,
			relative$1,
			previousStage
		];
	}
	/**
	* Returns _true_ if envelope has finished
	*/
	get isDone() {
		return this.#sm.isDone;
	}
	onTrigger() {}
	/**
	* Triggers envelope, optionally _holding_ it.
	*
	* If `hold` is _false_ (default), envelope will run through all stages,
	* but sustain stage won't have an affect.
	*
	* If `hold` is _true_, it will run to, and stay at the sustain stage.
	* Use {@link release} to later release the envelope.
	*
	* If event is already trigged it will be _retriggered_.
	* Initial value depends on `opts.retrigger`
	* * _false_ (default): envelope continues at current value.
	* * _true_: envelope value resets to `opts.initialValue`.
	*
	* @param hold If _true_ envelope will hold at sustain stage
	*/
	trigger(hold = false) {
		this.onTrigger();
		this.#triggered = true;
		this.#sm.reset();
		this.#timer = this.#timeSource();
		this.#holding = hold;
		this.#holdingInitial = hold;
	}
	get hasTriggered() {
		return this.#triggered;
	}
	compute() {}
	/**
	* Release if 'trigger(true)' was previouslly called.
	* Has no effect if not triggered or held.
	* @returns
	*/
	release() {
		if (this.isDone || !this.#holdingInitial) return;
		this.#holding = false;
		this.compute();
	}
};

//#endregion
//#region ../modulation/dist/src/envelope/Adsr.js
const defaultAdsrOpts = Object.freeze({
	attackBend: -1,
	decayBend: -.3,
	releaseBend: -.3,
	peakLevel: 1,
	initialLevel: 0,
	sustainLevel: .6,
	releaseLevel: 0,
	retrigger: false
});
var AdsrIterator = class {
	adsr;
	constructor(adsr$1) {
		this.adsr = adsr$1;
	}
	next(...args) {
		if (!this.adsr.hasTriggered) this.adsr.trigger();
		const c = this.adsr.compute();
		return {
			value: c[1],
			done: c[0] === `complete`
		};
	}
	[Symbol.toStringTag] = `Generator`;
};
/**
* ADSR (Attack Decay Sustain Release) envelope. An envelope is a value that changes over time,
* usually in response to an intial trigger.
*
* [See the ixfx Guide on Envelopes](https://ixfx.fun/modulation/envelopes/introduction/).
*
* @example Setup
* ```js
* const env = new Envelopes.Adsr({
*  attackDuration: 1000,
*  decayDuration: 200,
*  sustainDuration: 100
* });
* ```
*
* Options for envelope are as follows:
*
* ```js
* initialLevel?: number
* attackBend: number
* attackDuration: number
* decayBend: number
* decayDuration:number
* sustainLevel: number
* releaseBend: number
* releaseDuration: number
* releaseLevel?: number
* peakLevel: number
* retrigger?: boolean
* shouldLoop: boolean
* ```
*
* If `retrigger` is _false_ (default), a re-triggered envelope continues at current value
* rather than resetting to `initialLevel`.
*
* If `shouldLoop` is true, envelope loops until `release()` is called.
*
* @example Using
* ```js
* env.trigger(); // Start envelope
* ...
* // Get current value of envelope
* const [state, scaled, raw] = env.compute();
* ```
*
* * `state` is a string, one of the following: 'attack', 'decay', 'sustain', 'release', 'complete'
* * `scaled` is a value scaled according to the stage's _levels_
* * `raw` is the progress from 0 to 1 within a stage. ie. 0.5 means we're halfway through a stage.
*
* Instead of `compute()`, most usage of the envelope is just fetching the `value` property, which returns the same scaled value of `compute()`:
*
* ```js
* const value = env.value; // Get scaled number
* ```
*
* @example Hold & release
* ```js
* env.trigger(true);   // Pass in true to hold
* ...envelope will stop at sustain stage...
* env.release();      // Release into decay
* ```
*
* Check if it's done:
*
* ```js
* env.isDone; // True if envelope is completed
* ```
*
* Envelope has events to track activity: 'change' and 'complete':
*
* ```
* env.addEventListener(`change`, ev => {
*  console.log(`Old: ${evt.oldState} new: ${ev.newState}`);
* })
* ```
*
* It's also possible to iterate over the values of the envelope:
* ```js
* const env = new Envelopes.Adsr();
* for await (const v of env) {
*  // v is the numeric value
*  await Flow.sleep(100); // Want to pause a little to give envelope time to run
* }
* // Envelope has finished
* ```
*/
var Adsr = class extends AdsrBase {
	attackPath;
	decayPath;
	releasePath;
	initialLevel;
	peakLevel;
	releaseLevel;
	sustainLevel;
	attackBend;
	decayBend;
	releaseBend;
	initialLevelOverride;
	retrigger;
	releasedAt;
	constructor(opts = {}) {
		super(opts);
		this.retrigger = opts.retrigger ?? defaultAdsrOpts.retrigger;
		this.initialLevel = opts.initialLevel ?? defaultAdsrOpts.initialLevel;
		this.peakLevel = opts.peakLevel ?? defaultAdsrOpts.peakLevel;
		this.releaseLevel = opts.releaseLevel ?? defaultAdsrOpts.releaseLevel;
		this.sustainLevel = opts.sustainLevel ?? defaultAdsrOpts.sustainLevel;
		this.attackBend = opts.attackBend ?? defaultAdsrOpts.attackBend;
		this.releaseBend = opts.releaseBend ?? defaultAdsrOpts.releaseBend;
		this.decayBend = opts.decayBend ?? defaultAdsrOpts.decayBend;
		const max$1 = 1;
		this.attackPath = toPath(quadraticSimple({
			x: 0,
			y: this.initialLevel
		}, {
			x: max$1,
			y: this.peakLevel
		}, -this.attackBend));
		this.decayPath = toPath(quadraticSimple({
			x: 0,
			y: this.peakLevel
		}, {
			x: max$1,
			y: this.sustainLevel
		}, -this.decayBend));
		this.releasePath = toPath(quadraticSimple({
			x: 0,
			y: this.sustainLevel
		}, {
			x: max$1,
			y: this.releaseLevel
		}, -this.releaseBend));
	}
	onTrigger() {
		this.initialLevelOverride = void 0;
		if (!this.retrigger) {
			const [_stage, scaled, _raw] = this.compute(true, false);
			if (!Number.isNaN(scaled) && scaled > 0) this.initialLevelOverride = scaled;
		}
	}
	[Symbol.iterator]() {
		return new AdsrIterator(this);
	}
	/**
	* Returns the scaled value
	* Same as .compute()[1]
	*/
	get value() {
		return this.compute(true)[1];
	}
	/**
	* Compute value of envelope at this point in time.
	*
	* Returns an array of [stage, scaled, raw]. Most likely you want to use {@link value} to just get the scaled value.
	* @param allowStateChange If true (default) envelope will be allowed to change state if necessary before returning value
	*/
	compute(allowStateChange = true, allowLooping = true) {
		const [stage, amt] = super.computeRaw(allowStateChange, allowLooping);
		if (stage === void 0) return [
			void 0,
			NaN,
			NaN
		];
		let v;
		switch (stage) {
			case `attack`: {
				v = this.attackPath.interpolate(amt).y;
				if (this.initialLevelOverride !== void 0) v = scale(v, 0, 1, this.initialLevelOverride, 1);
				this.releasedAt = v;
				break;
			}
			case `decay`: {
				v = this.decayPath.interpolate(amt).y;
				this.releasedAt = v;
				break;
			}
			case `sustain`: {
				v = this.sustainLevel;
				this.releasedAt = v;
				break;
			}
			case `release`: {
				v = this.releasePath.interpolate(amt).y;
				if (this.releasedAt !== void 0) v = scale(v, 0, this.sustainLevel, 0, this.releasedAt);
				break;
			}
			case `complete`: {
				v = this.releaseLevel;
				this.releasedAt = void 0;
				break;
			}
			default: throw new Error(`Unknown state: ${stage}`);
		}
		return [
			stage,
			v,
			amt
		];
	}
};

//#endregion
//#region ../modulation/dist/src/envelope/index.js
var envelope_exports = {};
__export(envelope_exports, {
	Adsr: () => Adsr,
	AdsrBase: () => AdsrBase,
	AdsrIterator: () => AdsrIterator,
	adsr: () => adsr,
	adsrIterable: () => adsrIterable,
	adsrStateTransitions: () => adsrStateTransitions,
	defaultAdsrOpts: () => defaultAdsrOpts,
	defaultAdsrTimingOpts: () => defaultAdsrTimingOpts
});
/**
* Returns a function that iterates over an envelope
* ```js
* const e = Envelopes.adsr();
*
* e(); // Yields current value
* ```
*
* Starts the envelope the first time the return function is called.
* When the envelope finishes, it continues to return the `releaseLevel` of the envelope.
*
* Options can be provided to set the shape of the envelope as usual, eg:
* ```js
* const e = Envelopes.adsr({
*  attackDuration: 1000,
*  releaseDuration: 500
* });
* ```
* @param opts
* @returns
*/
const adsr = (opts = {}) => {
	const envelope = new Adsr(opts);
	const finalValue = envelope.releaseLevel;
	const iterator = envelope[Symbol.iterator]();
	return () => resolveWithFallbackSync(iterator, {
		overrideWithLast: true,
		value: finalValue
	});
};
/**
* Creates and runs an envelope, sampling its values at `sampleRateMs`.
* Note that if the envelope loops, iterator never returns.
*
* @example Init
* ```js
* import { Envelopes } from '@ixfx/modulation.js';
* import { IterableAsync } from  '@ixfx/iterable.js';
*
* const opts = {
*  attackDuration: 1000,
*  releaseDuration: 1000,
*  sustainLevel: 1,
*  attackBend: 1,
*  decayBend: -1
* };
* ```
*
* ```js
* //  Add data to array
* // Sample an envelope every 20ms into an array
* const data = await IterableAsync.toArray(Envelopes.adsrIterable(opts, 20));
* ```
*
* ```js
* // Iterate with `for await`
* // Work with values as sampled
* for await (const v of Envelopes.adsrIterable(opts, 5)) {
*  // Work with envelope value `v`...
* }
* ```
* @param opts Envelope options
* @returns
*/
async function* adsrIterable(opts) {
	const envelope = new Adsr(opts.env);
	const sampleRateMs = opts.sampleRateMs ?? 100;
	envelope.trigger();
	const r = repeat(() => envelope.value, {
		while: () => !envelope.isDone,
		delay: sampleRateMs,
		signal: opts.signal
	});
	for await (const v of r) yield v;
}

//#endregion
//#region ../modulation/dist/src/forces.js
var forces_exports = {};
__export(forces_exports, {
	accelerationForce: () => accelerationForce,
	angleFromAccelerationForce: () => angleFromAccelerationForce,
	angleFromVelocityForce: () => angleFromVelocityForce,
	angularForce: () => angularForce,
	apply: () => apply,
	attractionForce: () => attractionForce,
	computeAccelerationToTarget: () => computeAccelerationToTarget,
	computeAttractionForce: () => computeAttractionForce,
	computePositionFromAngle: () => computePositionFromAngle,
	computePositionFromVelocity: () => computePositionFromVelocity,
	computeVelocity: () => computeVelocity,
	constrainBounce: () => constrainBounce,
	guard: () => guard,
	magnitudeForce: () => magnitudeForce,
	nullForce: () => nullForce,
	orientationForce: () => orientationForce,
	pendulumForce: () => pendulumForce,
	springForce: () => springForce,
	targetForce: () => targetForce,
	velocityForce: () => velocityForce
});
/**
* Throws an error if `t` is not of the `ForceAffected` shape.
* @param t
* @param name
*/
const guard = (t, name = `t`) => {
	if (t === void 0) throw new Error(`Parameter ${name} is undefined. Expected ForceAffected`);
	if (t === null) throw new Error(`Parameter ${name} is null. Expected ForceAffected`);
	if (typeof t !== `object`) throw new TypeError(`Parameter ${name} is type ${typeof t}. Expected object of shape ForceAffected`);
};
/**
* `constrainBounce` yields a function that affects `t`'s position and velocity such that it
* bounces within bounds.
*
* ```js
* // Setup bounce with area constraints
* // Reduce velocity by 10% with each impact
* const b = constrainBounce({ width:200, height:500 }, 0.9);
*
* // Thing
* const t = {
*  position: { x: 50,  y: 50 },
*  velocity: { x: 0.3, y: 0.01 }
* };
*
* // `b` returns an altereted version of `t`, with the
* // bounce logic applied.
* const bounced = b(t);
* ```
*
* `dampen` parameter allows velocity to be dampened with each bounce. A value
* of 0.9 for example reduces velocity by 10%. A value of 1.1 will increase velocity by
* 10% with each bounce.
* @param bounds Constraints of area
* @param dampen How much to dampen velocity by. Defaults to 1 meaning there is no damping.
* @returns A function that can perform bounce logic
*/
const constrainBounce = (bounds, dampen = 1) => {
	if (!bounds) bounds = {
		width: 1,
		height: 1
	};
	const minX = getEdgeX(bounds, `left`);
	const maxX = getEdgeX(bounds, `right`);
	const minY = getEdgeY(bounds, `top`);
	const maxY = getEdgeY(bounds, `bottom`);
	return (t) => {
		const position = computePositionFromVelocity(t.position ?? Empty, t.velocity ?? Empty);
		let velocity = t.velocity ?? Empty;
		let { x, y } = position;
		if (x > maxX) {
			x = maxX;
			velocity = invert(multiplyScalar(velocity, dampen), `x`);
		} else if (x < minX) {
			x = minX;
			velocity = invert(multiplyScalar(velocity, dampen), `x`);
		}
		if (y > maxY) {
			y = maxY;
			velocity = multiplyScalar(invert(velocity, `y`), dampen);
		} else if (position.y < minY) {
			y = minY;
			velocity = invert(multiplyScalar(velocity, dampen), `y`);
		}
		return Object.freeze({
			...t,
			position: {
				x,
				y
			},
			velocity
		});
	};
};
/**
* For a given set of attractors, returns a function that a sets acceleration of attractee.
* Keep note though that this bakes-in the values of the attractor, it won't reflect changes to their state. For dynamic
* attractors, it might be easier to use `computeAttractionForce`.
*
* @example Force
* ```js
* const f = Forces.attractionForce(sun, gravity);
* earth = Forces.apply(earth, f);
* ```
*
* @example Everything mutually attracted
* ```js
* // Create a force with all things as attractors.
* const f = Forces.attractionForce(things, gravity);
* // Apply force to all things.
* // The function returned by attractionForce will automatically ignore self-attraction
* things = things.map(a => Forces.apply(a, f));
* ```
* @param attractors
* @param gravity
* @param distanceRange
* @returns
*/
const attractionForce = (attractors, gravity, distanceRange = {}) => (attractee) => {
	let accel = attractee.acceleration ?? Empty;
	for (const a of attractors) {
		if (a === attractee) continue;
		const f = computeAttractionForce(a, attractee, gravity, distanceRange);
		accel = sum$1(accel, f);
	}
	return {
		...attractee,
		acceleration: accel
	};
};
/**
* Computes the attraction force between two things.
* Value for `gravity` will depend on what range is used for `mass`. It's probably a good idea
* to keep mass to mean something relative - ie 1 is 'full' mass, and adjust the `gravity`
* value until it behaves as you like. Keeping mass in 0..1 range makes it easier to apply to
* visual properties later.
*
* @example Attractee and attractor, gravity 0.005
* ```js
* const attractor = { position: { x:0.5, y:0.5 }, mass: 1 };
* const attractee = { position: Points.random(), mass: 0.01 };
* attractee = Forces.apply(attractee, Forces.computeAttractionForce(attractor, attractee, 0.005));
* ```
*
* @example Many attractees for one attractor, gravity 0.005
* ```js
* attractor =  { position: { x:0.5, y:0.5 }, mass: 1 };
* attractees = attractees.map(a => Forces.apply(a, Forces.computeAttractionForce(attractor, a, 0.005)));
* ```
*
* @example Everything mutually attracted
* ```js
* // Create a force with all things as attractors.
* const f = Forces.attractionForce(things, gravity);
* // Apply force to all things.
* // The function returned by attractionForce will automatically ignore self-attraction
* things = things.map(a => Forces.apply(a, f));
* ```
*
* `attractor` thing attracting (eg, earth)
* `attractee` thing being attracted (eg. satellite)
*
*
* `gravity` will have to be tweaked to taste.
* `distanceRange` clamps the computed distance. This affects how tightly the particles will orbit and can also determine speed. By default it is 0.001-0.7
* @param attractor Attractor (eg earth)
* @param attractee Attractee (eg satellite)
* @param gravity Gravity constant
* @param distanceRange Min/max that distance is clamped to.
* @returns
*/
const computeAttractionForce = (attractor, attractee, gravity, distanceRange = {}) => {
	if (attractor.position === void 0) throw new Error(`attractor.position not set`);
	if (attractee.position === void 0) throw new Error(`attractee.position not set`);
	const distributionRangeMin = distanceRange.min ?? .01;
	const distributionRangeMax = distanceRange.max ?? .7;
	const f = normalise(subtract(attractor.position, attractee.position));
	const d = clamp(distance(f), distributionRangeMin, distributionRangeMax);
	return multiplyScalar(f, gravity * (attractor.mass ?? 1) * (attractee.mass ?? 1) / (d * d));
};
/**
* A force that moves a thing toward `targetPos`.
*
* ```js
* const t = Forces.apply(t, Forces.targetForce(targetPos));
* ```
* @param targetPos
* @param opts
* @returns
*/
const targetForce = (targetPos, opts = {}) => {
	const fn = (t) => {
		const accel = computeAccelerationToTarget(targetPos, t.position ?? {
			x: .5,
			y: .5
		}, opts);
		return {
			...t,
			acceleration: sum$1(t.acceleration ?? Empty, accel)
		};
	};
	return fn;
};
/**
* Returns `pt` with x and y set to `setpoint` if either's absolute value is below `v`
* @param pt
* @param v
* @returns
*/
/**
* Apply a series of force functions or forces to `t`. Null/undefined entries are skipped silently.
* It also updates the velocity and position of the returned version of `t`.
*
* ```js
* // Wind adds acceleration. Force is dampened by mass
* const wind = Forces.accelerationForce({ x: 0.00001, y: 0 }, `dampen`);
*
* // Gravity adds acceleration. Force is magnified by mass
* const gravity = Forces.accelerationForce({ x: 0, y: 0.0001 }, `multiply`);
*
* // Friction is calculated based on velocity. Force is magnified by mass
* const friction = Forces.velocityForce(0.00001, `multiply`);
*
*  // Flip movement velocity if we hit a wall. And dampen it by 10%
* const bouncer = Forces.constrainBounce({ width: 1, height: 1 }, 0.9);
*
* let t = {
*  position: Points.random(),
*  mass: 0.1
* };
*
* // Apply list of forces, returning a new version of the thing
* t = Forces.apply(t,
*   gravity,
*   wind,
*   friction,
*   bouncer
* );
* ```
*/
const apply = (t, ...accelForces) => {
	if (t === void 0) throw new Error(`t parameter is undefined`);
	for (const f of accelForces) {
		if (f === null || f === void 0) continue;
		t = typeof f === `function` ? f(t) : {
			...t,
			acceleration: sum$1(t.acceleration ?? Empty, f)
		};
	}
	const velo = computeVelocity(t.acceleration ?? Empty, t.velocity ?? Empty);
	const pos = computePositionFromVelocity(t.position ?? Empty, velo);
	const ff = {
		...t,
		position: pos,
		velocity: velo,
		acceleration: Empty
	};
	return ff;
};
/**
* Apples `vector` to acceleration, scaling according to mass, based on the `mass` option.
* It returns a function which can later be applied to a thing.
*
* ```js
* // Acceleration vector of (0.1, 0), ie moving straight on horizontal axis
* const f = Forces.accelerationForce({ x:0.1, y:0 }, `dampen`);
*
* // Thing to move
* let t = { position: ..., acceleration: ... }
*
* // Apply force
* t = f(t);
* ```
* @param vector
* @returns Force function
*/
const accelerationForce = (vector, mass = `ignored`) => (t) => Object.freeze({
	...t,
	acceleration: massApplyAccel(vector, t, mass)
});
/**
* Returns an acceleration vector with mass either dampening or multiplying it.
* The passed-in `thing` is not modified.
*
* ```js
* // Initial acceleration vector
* const accel = { x: 0.1, y: 0};
*
* // Thing being moved
* const thing = { mass: 0.5, position: ..., acceleration: ... }
*
* // New acceleration vector, affected by mass of `thing`
* const accelWithMass = massApplyAccel(accel, thing, `dampen`);
* ```
* Mass of thing can be factored in, according to `mass` setting. Use `dampen`
* to reduce acceleration with greater mass of thing. Use `multiply` to increase
* the effect of acceleration with a greater mass of thing. `ignored` means
* mass is not taken into account.
*
* If `t` has no mass, the `mass` setting is ignored.
*
* This function is used internally by the predefined forces.
*
* @param vector Vector force
* @param thing Thing being affected
* @param mass How to factor in mass of thing (default ignored)
* @returns Acceleration vector
*/
const massApplyAccel = (vector, thing, mass = `ignored`) => {
	let op;
	switch (mass) {
		case `dampen`: {
			op = (mass$1) => divide(vector, mass$1, mass$1);
			break;
		}
		case `multiply`: {
			op = (mass$1) => multiply(vector, mass$1, mass$1);
			break;
		}
		case `ignored`: {
			op = (_mass) => vector;
			break;
		}
		default: throw new Error(`Unknown 'mass' parameter '${mass}. Expected 'dampen', 'multiply' or 'ignored'`);
	}
	return sum$1(thing.acceleration ?? Empty, op(thing.mass ?? 1));
};
/**
* A force based on the square of the thing's velocity.
* It's like {@link velocityForce}, but here the velocity has a bigger impact.
*
* ```js
* const thing = {
*  position: { x: 0.5, y:0.5 },
*  velocity: { x: 0.001, y:0 }
* };
* const drag = magnitudeForce(0.1);
*
* // Apply drag force to thing, returning result
* const t = Forces.apply(thing, drag);
* ```
* @param force Force value
* @param mass How to factor in mass
* @returns Function that computes force
*/
const magnitudeForce = (force, mass = `ignored`) => (t) => {
	if (t.velocity === void 0) return t;
	const mag = distance(normalise(t.velocity));
	const magSq = force * mag * mag;
	const vv = multiplyScalar(invert(t.velocity), magSq);
	return Object.freeze({
		...t,
		acceleration: massApplyAccel(vv, t, mass)
	});
};
/**
* Null force does nothing
* @returns A force that does nothing
*/
const nullForce = (t) => t;
/**
* Force calculated from velocity of object. Reads velocity and influences acceleration.
*
* ```js
* let t = { position: Points.random(), mass: 0.1 };
* const friction = velocityForce(0.1, `dampen`);
*
* // Apply force, updating position and velocity
* t = Forces.apply(t, friction);
* ```
* @param force Force
* @param mass How to factor in mass
* @returns Function that computes force
*/
const velocityForce = (force, mass) => {
	const pipeline$1 = pipeline(invert, (v) => multiplyScalar(v, force));
	return (t) => {
		if (t.velocity === void 0) return t;
		const v = pipeline$1(t.velocity);
		return Object.freeze({
			...t,
			acceleration: massApplyAccel(v, t, mass)
		});
	};
};
/**
* Sets angle, angularVelocity and angularAcceleration based on
*  angularAcceleration, angularVelocity, angle
* @returns
*/
const angularForce = () => (t) => {
	const accumulator = t.angularAcceleration ?? 0;
	const vel = t.angularVelocity ?? 0;
	const angle = t.angle ?? 0;
	const v = vel + accumulator;
	const a = angle + v;
	return Object.freeze({
		...t,
		angle: a,
		angularVelocity: v,
		angularAcceleration: 0
	});
};
/**
* Yields a force function that applies the thing's acceleration.x to its angular acceleration.
* @param scaling Use this to scale the accel.x value. Defaults to 20 (ie accel.x*20). Adjust if rotation is too much or too little
* @returns
*/
const angleFromAccelerationForce = (scaling = 20) => (t) => {
	const accel = t.acceleration ?? Empty;
	return Object.freeze({
		...t,
		angularAcceleration: accel.x * scaling
	});
};
/**
* Yields a force function that applies the thing's velocity to its angle.
* This will mean it points in the direction of travel.
* @param interpolateAmt If provided, the angle will be interpolated toward by this amount. Defaults to 1, no interpolation
* @returns
*/
const angleFromVelocityForce = (interpolateAmt = 1) => (t) => {
	const a = angleRadian(t.velocity ?? Empty);
	return Object.freeze({
		...t,
		angle: interpolateAmt < 1 ? interpolateAngle(interpolateAmt, t.angle ?? 0, a) : a
	});
};
/**
* Spring force
*
*  * ```js
* // End of spring that moves
* let thing = {
*   position: { x: 1, y: 0.5 },
*   mass: 0.1
* };
*
* // Anchored other end of spring
* const pinnedAt = {x: 0.5, y: 0.5};
*
* // Create force: length of 0.4
* const springForce = Forces.springForce(pinnedAt, 0.4);
*
* continuously(() => {
*  // Apply force
*  thing = Forces.apply(thing, springForce);
* }).start();
* ```
* [Read more](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/)
*
* @param pinnedAt Anchored end of the spring
* @param restingLength Length of spring-at-rest (default: 0.5)
* @param k Spring stiffness (default: 0.0002)
* @param damping Damping factor to apply, so spring slows over time. (default: 0.995)
* @returns
*/
const springForce = (pinnedAt, restingLength = .5, k = 2e-4, damping = .999) => (t) => {
	const direction = subtract(t.position ?? Empty, pinnedAt);
	const mag = distance(direction);
	const stretch = Math.abs(restingLength - mag);
	const f = pipelineApply(direction, normalise, (p) => multiplyScalar(p, -k * stretch));
	const accel = massApplyAccel(f, t, `dampen`);
	const velo = computeVelocity(accel ?? Empty, t.velocity ?? Empty);
	const veloDamped = multiply(velo, damping, damping);
	return {
		...t,
		velocity: veloDamped,
		acceleration: Empty
	};
};
/**
* The pendulum force swings something back and forth.
*
* ```js
* // Swinger
* let thing = {
*   position: { x: 1, y: 0.5 },
*   mass: 0.1
* };
*
* // Position thing swings from (middle of screen)
* const pinnedAt = {x: 0.5, y: 0.5};
*
* // Create force: length of 0.4
* const pendulumForce = Forces.pendulumForce(pinnedAt, { length: 0.4 });
*
* continuously(() => {
*  // Apply force
*  // Returns a new thing with recalculated angularVelocity, angle and position.
*  thing = Forces.apply(thing, pendulumForce);
* }).start();
* ```
*
* [Read more](https://natureofcode.com/book/chapter-3-oscillation/)
*
* @param pinnedAt Location to swing from (x:0.5, y:0.5 default)
* @param opts Options
* @returns
*/
const pendulumForce = (pinnedAt, opts = {}) => (t) => {
	if (!pinnedAt) pinnedAt = {
		x: 0,
		y: 0
	};
	const length = opts.length ?? distance(pinnedAt, t.position ?? Empty);
	const speed = opts.speed ?? .001;
	const damping = opts.damping ?? .995;
	let angle = t.angle;
	if (angle === void 0) if (t.position) angle = angleRadian(pinnedAt, t.position) - Math.PI / 2;
	else angle = 0;
	const accel = -1 * speed / length * Math.sin(angle);
	const v = (t.angularVelocity ?? 0) + accel;
	angle += v;
	return Object.freeze({
		angularVelocity: v * damping,
		angle,
		position: computePositionFromAngle(length, angle + Math.PI / 2, pinnedAt)
	});
};
/**
* Compute velocity based on acceleration and current velocity
* @param acceleration Acceleration
* @param velocity Velocity
* @param velocityMax If specified, velocity will be capped at this value
* @returns
*/
const computeVelocity = (acceleration, velocity, velocityMax) => {
	const p = sum$1(velocity, acceleration);
	return velocityMax === void 0 ? p : clampMagnitude(p, velocityMax);
};
/**
* Returns the acceleration to get from `currentPos` to `targetPos`.
*
* @example Barebones usage:
* ```js
* const accel = Forces.computeAccelerationToTarget(targetPos, currentPos);
* const vel = Forces.computeVelocity(accel, currentVelocity);
*
* // New position:
* const pos = Points.sum(currentPos, vel);
* ```
*
* @example Implementation:
* ```js
* const direction = Points.subtract(targetPos, currentPos);
* const accel = Points.multiply(direction, diminishBy);
* ```
* @param currentPos Current position
* @param targetPos Target position
* @param opts Options
* @returns
*/
const computeAccelerationToTarget = (targetPos, currentPos, opts = {}) => {
	const diminishBy = opts.diminishBy ?? .001;
	const direction = subtract(targetPos, currentPos);
	if (opts.range && compare(abs(direction), opts.range) === -2) return Empty;
	return multiplyScalar(direction, diminishBy);
};
/**
* Compute a new position based on existing position and velocity vector
* @param position Position Current position
* @param velocity Velocity vector
* @returns Point
*/
const computePositionFromVelocity = (position, velocity) => sum$1(position, velocity);
/**
* Compute a position based on distance and angle from origin
* @param distance Distance from origin
* @param angleRadians Angle, in radians from origin
* @param origin Origin point
* @returns Point
*/
const computePositionFromAngle = (distance$1, angleRadians, origin) => toCartesian(distance$1, angleRadians, origin);
const _angularForce = angularForce();
const _angleFromAccelerationForce = angleFromAccelerationForce();
/**
* A force that orients things according to direction of travel.
*
* Under the hood, it applies:
* * angularForce,
* * angleFromAccelerationForce, and
* * angleFromVelocityForce
* @param interpolationAmt
* @returns
*/
const orientationForce = (interpolationAmt = .5) => {
	const angleFromVel = angleFromVelocityForce(interpolationAmt);
	return (t) => {
		t = _angularForce(t);
		t = _angleFromAccelerationForce(t);
		t = angleFromVel(t);
		return t;
	};
};

//#endregion
//#region ../modulation/dist/src/cubic-bezier.js
/**
* Creates an easing function using a simple cubic bezier defined by two points.
*
* Eg: https://cubic-bezier.com/#0,1.33,1,-1.25
*  a:0, b: 1.33, c: 1, d: -1.25
*
* ```js
* import { Easings } from "@ixfx/modulation.js";
* // Time-based easing using bezier
* const e = Easings.time(fromCubicBezier(1.33, -1.25), 1000);
* e.compute();
* ```
* @param b
* @param d
* @returns Value
*/
const cubicBezierShape = (b, d) => (t) => {
	const s = 1 - t;
	const s2 = s * s;
	const t2 = t * t;
	const t3 = t2 * t;
	return 3 * b * s2 * t + 3 * d * s * t2 + t3;
};

//#endregion
//#region ../modulation/dist/src/drift.js
/**
* WIP
* Returns a {@link Drifter} that moves a value over time.
*
* It keeps track of how much time has elapsed, accumulating `driftAmtPerMs`.
* The accumulated drift is wrapped on a 0..1 scale.
* ```js
* // Set up the drifer
* const d = drif(0.001);
*
* d.update(1.0);
* // Returns 1.0 + accumulated drift
* ```
* @param driftAmtPerMs
* @returns
*/
const drift = (driftAmtPerMs) => {
	let lastChange = performance.now();
	const update = (v = 1) => {
		const elapsed$1 = performance.now() - lastChange;
		const amt = driftAmtPerMs * elapsed$1 % 1;
		lastChange = performance.now();
		const calc = (v + amt) % 1;
		return calc;
	};
	const reset = () => {
		lastChange = performance.now();
	};
	return {
		update,
		reset
	};
};

//#endregion
//#region ../modulation/dist/src/util/pi-pi.js
const piPi = Math.PI * 2;

//#endregion
//#region ../modulation/dist/src/interpolate.js
/**
* Interpolates between `a` and `b` by `amount`. Aka `lerp`.
*
* [ixfx Guide on Interpolation](https://ixfx.fun/data/interpolation/overview/)
*
* @example Get the halfway point between 30 and 60
* ```js
* import { interpolate } from '@ixfx/numbers.js';
* interpolate(0.5, 30, 60);
* ```
*
* See also {@link interpolatorStepped} and {@link interpolatorInterval} for functions
* which help to manage progression from A->B over steps or interval.
*
* Usually interpolation amount is on a 0...1 scale, inclusive. What is the interpolation result
* if this scale is exceeded? By default it is clamped to 0..1, so the return value is always between `a` and `b` (inclusive).
*
* Alternatively, set the `limits` option to process `amount`:
* * 'wrap': wrap amount, eg 1.5 is the same as 0.5, 2 is the same as 1
* * 'ignore': allow exceeding values. eg 1.5 will yield b*1.5.
* * 'clamp': default behaviour of clamping interpolation amount to 0..1
*
* Interpolation can be non-linear using 'easing' option or 'transform' funciton.
* ```js
* interpolate(0.1, 0, 100, { easing: `quadIn` });
* ```
* There are a few variations when calling `interpolate`, depending on what parameters are fixed.
* * `interpolate(amount)`: returns a function that needs a & b
* * `interpolate(a, b)`:  returns a function that needs the interpolation amount
*/
function interpolate$2(pos1, pos2, pos3, pos4) {
	let amountProcess;
	let limits = `clamp`;
	const handleAmount = (amount) => {
		if (amountProcess) amount = amountProcess(amount);
		if (limits === void 0 || limits === `clamp`) amount = clamp(amount);
		else if (limits === `wrap`) {
			if (amount > 1) amount = amount % 1;
			else if (amount < 0) amount = 1 + amount % 1;
		}
		return amount;
	};
	const doTheEase = (_amt, _a, _b) => {
		resultThrow(numberTest(_a, ``, `a`), numberTest(_b, ``, `b`), numberTest(_amt, ``, `amount`));
		_amt = handleAmount(_amt);
		return (1 - _amt) * _a + _amt * _b;
	};
	const readOpts = (o = {}) => {
		if (o.easing) {
			const easer = get(o.easing);
			if (!easer) throw new Error(`Easing function '${o.easing}' not found`);
			amountProcess = easer;
		} else if (o.transform) {
			if (typeof o.transform !== `function`) throw new Error(`Param 'transform' is expected to be a function. Got: ${typeof o.transform}`);
			amountProcess = o.transform;
		}
		limits = o.limits ?? `clamp`;
	};
	const rawEase = (_amt, _a, _b) => (1 - _amt) * _a + _amt * _b;
	if (typeof pos1 !== `number`) throw new TypeError(`First param is expected to be a number. Got: ${typeof pos1}`);
	if (typeof pos2 === `number`) {
		let a;
		let b;
		if (pos3 === void 0 || typeof pos3 === `object`) {
			a = pos1;
			b = pos2;
			readOpts(pos3);
			return (amount) => doTheEase(amount, a, b);
		} else if (typeof pos3 === `number`) {
			a = pos2;
			b = pos3;
			readOpts(pos4);
			return doTheEase(pos1, a, b);
		} else throw new Error(`Values for 'a' and 'b' not defined`);
	} else if (pos2 === void 0 || typeof pos2 === `object`) {
		const amount = handleAmount(pos1);
		readOpts(pos2);
		resultThrow(numberTest(amount, ``, `amount`));
		return (aValue, bValue) => rawEase(amount, aValue, bValue);
	}
}
/**
* Returns a function that interpolates from A to B.
*
* It steps through the interpolation with each call to the returned function.
* This means that the `incrementAmount` will hinge on the rate
* at which the function is called. Alternatively, consider {@link interpolatorInterval}
* which steps on the basis of clock time.
*
* ```js
* // Interpolate from 0..1 by 0.01
* const v = interpolatorStepped(0.01, 100, 200);
* v(); // Each call returns a value closer to target
* // Eg: 100, 110, 120, 130 ...
* ```
*
* Under the hood, it calls `interpolate` with an amount that
* increases by `incrementAmount` each time.
*
* When calling `v()` to step the interpolator, you can also pass
* in new B and A values. Note that the order is swapped: the B (target) is provided first, and
* then optionally A.
*
* ```js
* const v = interpolatorStepped(0.1, 100, 200); // Interpolate 100->200
* v(300, 200); // Retarget to 200->300 and return result
* v(150); // Retarget 200->150 and return result
* ```
*
* This allows you to maintain the current interpolation progress.
* @param incrementAmount Amount to increment by
* @param a Start value. Default: 0
* @param b End value. Default: 1
* @param startInterpolationAt Starting interpolation amount. Default: 0
* @param options Options for interpolation
* @returns
*/
const interpolatorStepped = (incrementAmount, a = 0, b = 1, startInterpolationAt = 0, options) => {
	let amount = startInterpolationAt;
	return (retargetB, retargetA) => {
		if (retargetB !== void 0) b = retargetB;
		if (retargetA !== void 0) a = retargetA;
		if (amount >= 1) return b;
		const value = interpolate$2(amount, a, b, options);
		amount += incrementAmount;
		return value;
	};
};
/**
* Interpolate between angles `a` and `b` by `amount`. Angles are in radians.
*
* ```js
* interpolateAngle(0.5, Math.PI, Math.PI/2);
* ```
* @param amount
* @param aRadians Start angle (radian)
* @param bRadians End angle (radian)
* @returns
*/
const interpolateAngle$1 = (amount, aRadians, bRadians, options) => {
	const t = wrap(bRadians - aRadians, 0, piPi);
	return interpolate$2(amount, aRadians, aRadians + (t > Math.PI ? t - piPi : t), options);
};
/**
* Interpolates between A->B over `duration`.
* Given the same A & B values, steps will be larger if it's a longer
* duration, and shorter if it's a smaller duration.
*
* A function is returned, which when invoked yields a value between A..B.
*
* Alternatively to step through by the same amount regardless
* of time, use {@link interpolatorStepped}.
*
* ```js
* // Interpolate from 0..1 over one minute
* const v = interpolatorInterval({mins:1});
* v(); // Compute current value
* ```
*
* Use start and end points:
* ```js
* // Interpolate from 100-200 over 10 seconds
* const v = interpolatorInterval({secs:10}, 100, 200);
* v(); // Compute current value
* ```
* @param duration Duration for interpolation
* @param a Start point
* @param b End point
* @param options Options for interpolation
* @returns
*/
const interpolatorInterval = (duration, a = 0, b = 1, options) => {
	const durationProgression = ofTotal(duration, { clampValue: true });
	return (retargetB, retargetA) => {
		const amount = durationProgression();
		if (retargetB !== void 0) b = retargetB;
		if (retargetA !== void 0) a = retargetA;
		if (amount >= 1) return b;
		const value = interpolate$2(amount, a, b, options);
		return value;
	};
};

//#endregion
//#region ../modulation/dist/src/jitter.js
/**
* Returns a {@link Jitterer} that works with absolute values,
* ie. values outside of 0..1 range.
*
* Jitter amount is _absolute_, meaning a fixed value regardless of input value,
* or _relative_, meaning it is scaled according to input value.
*
* ```js
* // Jitter by -10 to +10 (absolute value: 10)
* const j1 = jitterAbsolute({ absolute: 10 });
* j1(100); // Produces range of 90...110
*
* // Jitter by -20 to +20 (relative value 20%)
* const j2 = jitterAbsolute({ relative: 0.20 });
* j2(100); // Produces a range of -80...120
* ```
*
* The expected used case is calling `jitterAbsolute` to set up a jitterer
* and then reusing it with different input values, as above with the `j1` and `j2`.
*
* However to use it 'one-off', just call the returned function immediately:
* ```js
* const v = jitterAbsolute({ absolute: 10 })(100); // v is in range of 90-110
* ```
*
* When `clamped` is true, return value is clamped to 0...value.
* That is, rather than the usual bipolar jittering, the jittering only goes below.
* ```js
* const j = jitterAbsolute({ absolute: 10, clamped: true })
* j(100); // Produces range of 90-100
* ```
* @param options
* @returns
*/
const jitterAbsolute = (options) => {
	const { relative: relative$1, absolute } = options;
	const clamped = options.clamped ?? false;
	const source = options.source ?? Math.random;
	if (absolute !== void 0) return (value) => {
		const abs$1 = source() * absolute * 2 - absolute;
		const valueNew = value + abs$1;
		if (clamped) return clamp(valueNew, 0, value);
		return valueNew;
	};
	if (relative$1 !== void 0) return (value) => {
		const rel = value * relative$1;
		const abs$1 = source() * rel * 2 - rel;
		const valueNew = value + abs$1;
		if (clamped) return clamp(valueNew, 0, value);
		return valueNew;
	};
	throw new Error(`Either absolute or relative fields expected`);
};
/**
* Jitters `value` by the absolute `jitter` amount. Returns a function.
*
* All values should be on a 0..1 scale, and the return value is by default clamped to 0..1.
* Pass `clamped:false` as an option to allow for arbitary ranges.
*
* `jitter` returns a function that calculates jitter. If you only need a one-off
* jitter, you can immediately execute the returned function:
* ```js
* // Compute 10% jitter of input 0.5
* const value = jitter({ relative: 0.1 })(0.5);
* ```
*
* However, if the returned jitter function is to be used again,
* assign it to a variable:
* ```js
* const myJitter = jitter({ absolute: 0.5 });
*
* // Jitter an input value 1.0
* const value = myJitter(1);
* ```
*
* A custom source for random numbers can be provided. Eg, use a weighted
* random number generator:
*
* ```js
* import { weighted } from '@ixfx/random.js';
* jitter({ relative: 0.1, source: weighted });
* ```
*
* Options
* * clamped: If false, `value`s out of percentage range can be used and return value may be beyond percentage range. True by default
* * random: Random source (default is Math.random)
* @param options Options
* @returns Function that performs jitter
*/
const jitter = (options = {}) => {
	const clamped = options.clamped ?? true;
	let r = (_) => 0;
	if (options.absolute !== void 0) {
		resultThrow(numberTest(options.absolute, clamped ? `percentage` : `bipolar`, `opts.absolute`));
		const absRand = floatSource({
			min: -options.absolute,
			max: options.absolute,
			source: options.source
		});
		r = (v) => v + absRand();
	} else if (options.relative === void 0) throw new TypeError(`Either absolute or relative jitter amount is required.`);
	else {
		const rel = options.relative ?? .1;
		resultThrow(numberTest(rel, clamped ? `percentage` : `bipolar`, `opts.relative`));
		r = (v) => v + float({
			min: -Math.abs(rel * v),
			max: Math.abs(rel * v),
			source: options.source
		});
	}
	const compute = (value) => {
		resultThrow(numberTest(value, clamped ? `percentage` : `bipolar`, `value`));
		let v = r(value);
		if (clamped) v = clamp(v);
		return v;
	};
	return compute;
};

//#endregion
//#region ../modulation/dist/src/mix.js
/**
* Mixes in modulation. This is used when you want to
* fold in a controllable amount of modulation.
*
* For example, we have a base value of 0.5 (50%) that we want to modulate
* by 0.9 (90%). That is, reduce its value by 10%. `mix` allows us
* to slowly ramp up to the fully modulated value.
*
* ```js
* // When 'amt' is 0, modulation doesn't affect value at all,
* // original is returned
* mix(0, 0.5, 0.9); // 0.5
* // Mixing in 50% of modulation
* mix(0.5, 0.5, 0.9); // 0.475
* // All modulation applied, so now we get 90% of 0.5
* mix(1, 0.5, 0.9); // 0.45 (ie. 90% of 0.5)
* ```
* @param amount Amount of modulation (0..1). 0 means modulation value has no effect
* @param original Original value to modulate
* @param modulation Modulation amount (0..1)
* @returns
*/
const mix = (amount, original, modulation) => {
	const m = modulation * amount;
	const base = (1 - amount) * original;
	return base + original * m;
};
/**
* Returns a modulator that mixes between two modulation functions.
* Both modulators are given the same input value.
*
* ```js
* import { Easings } from "@ixfx/modulation.js";
* // Get a 50/50 mix of two easing functions
* const mix = Easings.mix(0.5, Easings.Named.sineIn, Easings.Named.sineOut);
*
* // 10% of sineIn, 90% of sineOut
* Easings.mix(0.90, 0.25, Easings.Named.sineIn, Easings.Named.sineOut);
* ```
* @param balance Mix between a and b
* @param a
* @param b
* @returns Numeric value
*/
const mixModulators = (balance, a, b) => (amt) => interpolate(balance, a(amt), b(amt));
/**
* Returns a 'crossfader` function of two easing functions, synchronised with the progress through the easing.
*
* Example `amt` values:
* * 0.0 will yield 100% of easingA at its `easing(0)` value.
* * 0.2 will yield 80% of easingA, 20% of easingB, both at their `easing(0.2)` values
* * 0.5 will yield 50% of both functions both at their `easing(0.5)` values
* * 0.8 will yield 20% of easingA, 80% of easingB, with both at their `easing(0.8)` values
* * 1.0 will yield 100% of easingB at its `easing(1)` value.
*
* So easingB will only ever kick in at higher `amt` values and `easingA` will only be present in lower values.
*
* ```js
* import { Easings } from "@ixfx/modulation.js";
* Easings.crossFade(0.5, Easings.Named.sineIn, Easings.Named.sineOut);
* ```
* @param a Easing A
* @param b Easing B
* @returns Numeric value
*/
const crossfade = (a, b) => {
	return (amt) => {
		const mixer = mixModulators(amt, a, b);
		return mixer(amt);
	};
};

//#endregion
//#region ../modulation/dist/src/no-op.js
/**
* A 'no-op' function. Returns the input value without modification.
* Useful for when some default is needed
* @param v
* @returns
*/
const noop = (v) => v;

//#endregion
//#region ../modulation/dist/src/ping-pong.js
/**
* Continually loops up and down between 0 and 1 by a specified interval.
* Looping returns start value, and is inclusive of 0 and 1.
*
* @example Usage
* ```js
* for (const v of percentPingPong(0.1)) {
*  // v will go up and down. Make sure you have a break somewhere because it is infinite
* }
* ```
*
* @example Alternative:
* ```js
* const pp = pingPongPercent(0.1, 0.5); // Setup generator one time
* const v = pp.next().value; // Call .next().value whenever a new value is needed
* ```
*
* Because limits are capped to -1 to 1, using large intervals can produce uneven distribution. Eg an interval of 0.8 yields 0, 0.8, 1
*
* `upper` and `lower` define the percentage range. Eg to ping pong between 40-60%:
* ```
* const pp = pingPongPercent(0.1, 0.4, 0.6);
* ```
* @param interval Amount to increment by. Defaults to 10%
* @param start Starting point within range. Defaults to 0 using a positive interval or 1 for negative intervals
* @param rounding Rounding to apply. This avoids floating-point rounding errors.
*/
const pingPongPercent = function(interval = .1, lower, upper, start, rounding) {
	if (typeof lower === `undefined`) lower = 0;
	if (typeof upper === `undefined`) upper = 1;
	if (typeof start === `undefined`) start = lower;
	resultThrow(numberTest(interval, `bipolar`, `interval`), numberTest(upper, `bipolar`, `end`), numberTest(start, `bipolar`, `offset`), numberTest(lower, `bipolar`, `start`));
	return pingPong(interval, lower, upper, start, rounding);
};
/**
* Ping-pongs continually back and forth a `lower` and `upper` value (both inclusive) by a given `interval`. Use `pingPongPercent` for 0-1 ping-ponging
*
* In a loop:
* ```
* for (const c of pingPong(10, 0, 100)) {
*  // 0, 10, 20 .. 100, 90, 80, 70 ...
* }
* ```
*
* Manual:
* ```
* const pp = pingPong(10, 0, 100);
* let v = pp.next().value; // Call .next().value whenever a new value is needed
* ```
* @param interval Amount to increment by. Use negative numbers to start counting down
* @param lower Lower bound (inclusive)
* @param upper Upper bound (inclusive, must be greater than start)
* @param start Starting point within bounds (defaults to `lower`)
* @param rounding Rounding is off by default. Use say 1000 if interval is a fractional amount to avoid rounding errors.
*/
const pingPong = function* (interval, lower, upper, start, rounding) {
	if (lower === void 0) throw new Error(`Parameter 'lower' is undefined`);
	if (interval === void 0) throw new Error(`Parameter 'interval' is undefined`);
	if (upper === void 0) throw new Error(`Parameter 'upper' is undefined`);
	if (rounding === void 0 && interval <= 1 && interval >= 0) rounding = 10 / interval;
	else if (typeof rounding === `undefined`) rounding = 1234;
	if (Number.isNaN(interval)) throw new Error(`interval parameter is NaN`);
	if (Number.isNaN(lower)) throw new Error(`lower parameter is NaN`);
	if (Number.isNaN(upper)) throw new Error(`upper parameter is NaN`);
	if (Number.isNaN(start)) throw new Error(`upper parameter is NaN`);
	if (lower >= upper) throw new Error(`lower must be less than upper`);
	if (interval === 0) throw new Error(`Interval cannot be zero`);
	const distance$1 = upper - lower;
	if (Math.abs(interval) >= distance$1) throw new Error(`Interval should be between -${distance$1} and ${distance$1}`);
	let incrementing = interval > 0;
	upper = Math.floor(upper * rounding);
	lower = Math.floor(lower * rounding);
	interval = Math.floor(Math.abs(interval * rounding));
	if (interval === 0) throw new Error(`Interval is zero (rounding: ${rounding})`);
	start = start === void 0 ? lower : Math.floor(start * rounding);
	if (start > upper || start < lower) throw new Error(`Start (${start / rounding}) must be within lower (${lower / rounding}) and upper (${upper / rounding})`);
	let v = start;
	yield v / rounding;
	let firstLoop = true;
	while (true) {
		v = v + (incrementing ? interval : -interval);
		if (incrementing && v >= upper) {
			incrementing = false;
			v = upper;
			if (v === upper && firstLoop) {
				v = lower;
				incrementing = true;
			}
		} else if (!incrementing && v <= lower) {
			incrementing = true;
			v = lower;
			if (v === lower && firstLoop) {
				v = upper;
				incrementing = false;
			}
		}
		yield v / rounding;
		firstLoop = false;
	}
};

//#endregion
//#region ../modulation/dist/src/spring.js
/**
* Produces values according to rough spring physics.
* å
* ```js
* import { continuously } from "@ixfx/flow.js"
* import { spring } from "@ixfx/modulation.js"
*
* const s = spring();
*
* continuously(() => {
*  const result = s.next();
*  if (result.done) return false; // Exit loop
*  const value = result.value;
*  // Value is mostly within 0..1 range but will exceed these limits
* }, 10).start();
* ```
*
* Parameters to the spring can be provided.
* ```js
* import { spring } from "@ixfx/modulation.js"
* const s = spring({
*  mass: 5,
*  damping: 10
*  stiffness: 100
* });
* ```
*
* If you don't want to use a generator: {@link springValue}.
*
* Note that the generated value can exceed 0..1 range. This is by design, since
* a spring can 'overshoot'. See Data.Normalise for functions to normalise.
*
* @param opts Options for spring
* @param timerOrFreq Timer to use, or frequency
*/
function* spring(opts = {}, timerOrFreq) {
	if (timerOrFreq === void 0) timerOrFreq = elapsedMillisecondsAbsolute();
	else if (typeof timerOrFreq === `number`) timerOrFreq = frequencyTimer(timerOrFreq);
	const fn = springShape(opts);
	let doneCountdown = opts.countdown ?? 10;
	while (doneCountdown > 0) {
		const s = fn(timerOrFreq.elapsed / 1e3);
		yield s;
		if (s === 1) doneCountdown--;
		else doneCountdown = 100;
	}
}
/**
* The same as {@link spring} but instead of a generator we get
* a value. When the spring is done, 1 is returned instead of undefined.
*
* ```js
* import { springValue } from "@ixfx/modulation.js"
* const s = springValue();
* s(); // 0..1 (roughly - exceeding 1 is possible)
* ```
*
* Options can be provided:
* ```js
* import { spring } from "@ixfx/modulation.js"
* const s = springValue({
*  stiffness: 100,
*  damping: 10
* })
* ```
* @example Applied
* ```js
* import { Modulation, Data } from  "@ixfx/bundle.js"
* let state = {
*  spring: Modulation.springValue()
* }
*
* function loop() {
*  const d = Data.resolveFields(state);
*
*  // Apply calculated spring value to compute x value
*  const x = window.innerWidth * d.spring;
*
*
*  window.requestAnimationFrame(loop);
* }
* loop();
* ```
* Note that the generated value can exceed 0..1 range. This is by design, since
* a spring can 'overshoot'. See Data.Normalise for functions to normalise.
*
* @param opts
* @param timerOrFreq
* @returns
*/
function springValue(opts = {}, timerOrFreq) {
	const s = spring(opts, timerOrFreq);
	return () => {
		const v = s.next();
		if (v.done) return 1;
		return v.value;
	};
}
/**
* Spring-dynamics modulator.
* To have spring driven by time or ticks, use {@link spring} or {@link springValue}.
* This is a lower-level function.
* @param opts
* @returns
*/
const springShape = (opts = {}) => {
	/** MIT License github.com/pushkine/ */
	const from = 0;
	const to = 1;
	const mass = opts.mass ?? 1;
	const stiffness = opts.stiffness ?? 100;
	const soft = opts.soft ?? false;
	const damping = opts.damping ?? 10;
	const velocity = opts.velocity ?? .1;
	const delta = to - from;
	if (soft || 1 <= damping / (2 * Math.sqrt(stiffness * mass))) {
		const angularFrequency = -Math.sqrt(stiffness / mass);
		const leftover = -angularFrequency * delta - velocity;
		return (t) => to - (delta + t * leftover) * Math.E ** (t * angularFrequency);
	} else {
		const dampingFrequency = Math.sqrt(4 * mass * stiffness - damping ** 2);
		const leftover = (damping * delta - 2 * mass * velocity) / dampingFrequency;
		const dfm = .5 * dampingFrequency / mass;
		const dm = -(.5 * damping) / mass;
		return (t) => to - (Math.cos(t * dfm) * delta + Math.sin(t * dfm) * leftover) * Math.E ** (t * dm);
	}
};

//#endregion
//#region ../modulation/dist/src/timing-source-factory.js
/**
* A factory function for creating a timing source. It returns
* a function which creates a designated timer.
*
* This is useful in times where you need to recreate timers, eg for reset
* type of behaviours because the options for the timer to be
* consolidated in one place.
*
* ```js
* // Get a factory for an elapsed timer
* const factory = sources(`elapsed`, 1000);
*
* // Create the timer
* let t = factory();
*
* // Get a value from the timer
* const value = t();
*
* // Recreate the timer, note we don't need any options
* t = factory();
* ```
*
* @param source Kind of timer to make
* @param duration Duration depends on the timer used. Will be milliseconds, hertz or bpm.
* @param options Options to pass to timer.
* @returns
*/
const timingSourceFactory = (source, duration, options = {}) => {
	switch (source) {
		case `elapsed`: return () => elapsed(duration, options);
		case `bpm`: return () => bpm(duration, options);
		case `hertz`: return () => hertz(duration, options);
		default: throw new Error(`Unknown source '${source}'. Expected: 'elapsed', 'hertz' or 'bpm'`);
	}
};

//#endregion
//#region ../modulation/dist/src/waveforms.js
/**
* Returns a function that shapes a 0..1 value as a
* triangle waveform.
*
* No bounds checks are performed on input value.
* Ensure it is 0..1 (inclusive).
* @param period
* @returns
*/
function triangleShape(period = 1) {
	period = 1 / period;
	const halfPeriod = period / 2;
	return (t) => {
		const v = Math.abs(t % period - halfPeriod);
		return v;
	};
}
/**
* Returns a function that shapes a 0..1 value as a square waveform.
*
* `period` sets the number of cycles in the 0..1 range.
* No bounds checks are performed on input value.
* Ensure it is 0..1 (inclusive).
* @param period
* @returns
*/
function squareShape(period = 1) {
	period = 1 / period;
	const halfPeriod = period / 2;
	return (t) => {
		return t % period < halfPeriod ? 1 : 0;
	};
}
/**
* Returns a function that shapes a 0..1 value as a sine waveform.
* An input value of 0 will be the very beginning of the wave cycle, input of 1 will be the end,
* 0.5 will be them middle and so on.
* ```js
* const s = sineShape();
* // Calculate value of sine wave at 50%
* // By default there is one oscillation, thus
* // it will be the middle of the cycle.
* s(0.5);
* ```
*
* The `period` determines number of cycles for
* an input value of 1.
* ```js
* // Oscillate twice in 0..1 range
* const s = sineShape(2);
* ```
*
* No bounds checks are performed on input value.
* Ensure it is 0..1 (inclusive).
* @param period
* @returns
*/
function sineShape(period = 1) {
	period = period * (Math.PI * 2);
	return (t) => {
		const v = (Math.sin(t * period) + 1) / 2;
		return v;
	};
}
/**
* A series of arcs, sort of like a bouncing ball.
* @param period
* @returns
*/
function arcShape(period = 1) {
	period = period * (Math.PI * 2);
	return (t) => Math.abs(Math.sin(t * period));
}
function sineBipolarShape(period = 1) {
	period = period * (Math.PI * 2);
	return (t) => Math.sin(t * period);
}
/**
* Creates a wave modulator by name.
*
* Defaults to 5-second sine wave.
* ```js
* import { wave } from '@ixfx/modulation.js';
* // Triangle wave that has a single cycle over two seconds
* const m = wave({ secs: 2, shape: `triangle`});
*
* // Call m() to get current value of wave, eg in
* // an animation loop
* const v = m();
* ```
*
* @example
* ```js
* import { wave } from '@ixfx/modulation.js';
* import { resolveFields } from '@ixfx/bundle.js';
*
* const state = {
*  intensity: wave({secs: 2, shape: `sine` }),
*  someOtherState: 10
* }
*
* const use = async () {
*  const { intensity } = await resolveFields(state);
*  // Do something with intensity value...
* }
* ```
* @param options
* @returns
*/
function wave(options) {
	const shape = options.shape ?? `sine`;
	const invert$1 = options.invert ?? false;
	const period = options.period ?? 1;
	let sourceFunction;
	resultThrow(integerTest(period, `aboveZero`, `period`));
	const sourceOptions = { ...options };
	if (options.ticks) sourceFunction = ticks$2(options.ticks, sourceOptions);
	else if (options.hertz) sourceFunction = hertz(options.hertz, sourceOptions);
	else if (options.millis) sourceFunction = elapsed(options.millis, sourceOptions);
	else if (options.source) sourceFunction = options.source;
	else {
		const secs = options.secs ?? 5;
		sourceFunction = elapsed(secs * 1e3, sourceOptions);
	}
	let shaperFunction;
	switch (shape) {
		case `saw`:
			shaperFunction = (v) => v;
			break;
		case `sine`:
			shaperFunction = sineShape(period);
			break;
		case `sine-bipolar`:
			shaperFunction = sineBipolarShape(period);
			break;
		case `square`:
			shaperFunction = squareShape(period);
			break;
		case `triangle`:
			shaperFunction = triangleShape(period);
			break;
		case `arc`:
			shaperFunction = arcShape(period);
			break;
		default: throw new Error(`Unknown wave shape '${shape}'. Expected: sine, sine-bipolar, saw, triangle, arc or square`);
	}
	return waveFromSource(sourceFunction, shaperFunction, invert$1);
}
/**
* Returns a wave-shaping modulator with a source and shaper as input.
* ```js
* // 1Hz sine wave source,
* const wm = waveFromSource(Sources.hertz(1), sineShape(period));
* ```
* @param sourceFunction Signal source
* @param shaperFunction Modulator
* @returns
*/
function waveFromSource(sourceFunction, shaperFunction, invert$1 = false) {
	return (feedback) => {
		let v = sourceFunction(feedback?.clock);
		if (feedback?.override) v = feedback.override;
		v = shaperFunction(v);
		if (invert$1) v = 1 - v;
		return v;
	};
}

//#endregion
//#region ../modulation/dist/src/weighted-average.js
/**
* Weighted average
*
* @param currentValue
* @param targetValue
* @param slowDownFactor
* @returns
*/
const weightedAverage = (currentValue, targetValue, slowDownFactor) => {
	return (currentValue * (slowDownFactor - 1) + targetValue) / slowDownFactor;
};

//#endregion
//#region ../modulation/dist/src/weighted-random.js
/***
* Returns a random number, 0..1, weighted by a given easing function.
* Default easing is `quadIn`, which skews towards zero.
*
* Use {@link weightedSource} to return a function instead.
*
* ```js
* Random.weighted();          // quadIn easing by default, which skews toward low values
* Random.weighted(`quadOut`); // quadOut favours high values
* ```
* @param easingNameOrOptions Options. Uses 'quadIn' by default.
* @see {@link weightedSource} Returns a function rather than value
* @returns Random number (0-1)
*/
const weighted = (easingNameOrOptions = `quadIn`) => weightedSource(easingNameOrOptions)();
/***
* Returns a random number, 0..1, weighted by a given easing function.
* Default easing is `quadIn`, which skews towards zero.
* Use {@link weighted} to get a value directly.
*
* ```js
* const r1 = Random.weightedSource();          // quadIn easing by default, which skews toward low values
* r1(); // Produce a value
*
* const r2 = Random.weightedSource(`quadOut`); // quadOut favours high values
* r2(); // Produce a value
* ```
* @param easingNameOrOptions Easing name or options `quadIn` by default.
* @see {@link weighted} Returns value instead of function
* @returns Function which returns a weighted random value
*/
const weightedSource = (easingNameOrOptions = `quadIn`) => {
	const options = typeof easingNameOrOptions === `string` ? { easing: easingNameOrOptions } : easingNameOrOptions;
	const source = options.source ?? Math.random;
	const easingName = options.easing ?? `quadIn`;
	const easingFunction = get(easingName);
	if (typeof easingFunction === `undefined`) throw new Error(`Easing function '${easingName}' not found.`);
	const compute = () => {
		const r = source();
		return easingFunction(r);
	};
	return compute;
};

//#endregion
//#region ../modulation/dist/src/index.js
var src_exports$1 = {};
__export(src_exports$1, {
	Easings: () => easing_exports,
	Envelopes: () => envelope_exports,
	Forces: () => forces_exports,
	Oscillators: () => oscillator_exports,
	Sources: () => source_exports,
	arcShape: () => arcShape,
	crossfade: () => crossfade,
	cubicBezierShape: () => cubicBezierShape,
	drift: () => drift,
	gaussian: () => gaussian,
	interpolate: () => interpolate,
	interpolateAngle: () => interpolateAngle$1,
	interpolatorInterval: () => interpolatorInterval,
	interpolatorStepped: () => interpolatorStepped,
	jitter: () => jitter,
	jitterAbsolute: () => jitterAbsolute,
	mix: () => mix,
	mixModulators: () => mixModulators,
	noop: () => noop,
	pingPong: () => pingPong,
	pingPongPercent: () => pingPongPercent,
	sineBipolarShape: () => sineBipolarShape,
	sineShape: () => sineShape,
	spring: () => spring,
	springShape: () => springShape,
	springValue: () => springValue,
	squareShape: () => squareShape,
	tickModulator: () => tickModulator,
	ticks: () => ticks$1,
	time: () => time$1,
	timeModulator: () => timeModulator,
	timingSourceFactory: () => timingSourceFactory,
	triangleShape: () => triangleShape,
	wave: () => wave,
	waveFromSource: () => waveFromSource,
	weighted: () => weighted,
	weightedAverage: () => weightedAverage,
	weightedSource: () => weightedSource
});

//#endregion
//#region ../process/dist/src/cancel-error.js
var CancelError = class extends Error {
	constructor(message) {
		super(message);
		this.name = `CancelError`;
	}
};

//#endregion
//#region ../process/dist/src/flow.js
/**
* Creates a flow of data processors (up to 5 are supported).
* The flow is encapsulated in a function that accepts an input value an returns an output.
*
* ```js
* const p = flow(
*  (value:string) => value.toUpperCase(), // Convert to uppercase
*  (value:string) => value.at(0) === 'A') // If first letter is an A, return true
* );
* p('apple'); // True
* ```
*
* Each processing function is expected to take in one input value and return one value.
* @param processors
* @returns
*/
function flow(...processors) {
	return (value) => {
		let v = value;
		for (const p of processors) try {
			v = p(v);
		} catch (err) {
			if (err instanceof CancelError) break;
			else throw err;
		}
		return v;
	};
}

//#endregion
//#region ../process/dist/src/if-undefined.js
/**
* Calls a function if the input value is not undefined.
* Return value from function is passed to next function in flow.
*
* ```js
* const flow = Process.flow(
*  Process.max(),
*  Process.seenLastToUndefined(),
*  Process.ifNotUndefined(v => {
*    console.log(`v:`, v);
*  })
* );
* flow(100); // Prints 'v:100'
* flow(90);  // Nothing happens max value has not changed
* flow(110); // Prints 'v:110'
* ```
* @param fn
* @returns
*/
function ifNotUndefined(fn) {
	return (value) => {
		if (value === void 0) return value;
		const v = fn(value);
		return v;
	};
}
/**
* Cancels the remaining flow operations if _undefined_ is an input.
* See also {@link ifUndefined} or {@link ifNotUndefined}.
*
* ```js
* const c3 = Process.flow(
*  Basic.max(),
*  Process.seenLastToUndefined(),
*  Process.cancelIfUndefined(),
*  (v => {
*   console.log(v);
*  })
* );
* c3(100); // Prints '100'
* c3(90);  // Doesn't print anything since max does not change
* c3(110); // Prints '110'
* ```
* @returns
*/
function cancelIfUndefined() {
	return (value) => {
		if (value === void 0) throw new CancelError(`cancel`);
		return value;
	};
}
/**
* Returns the output of `fn` if the input value is _undefined_.
* See also: {@link ifNotUndefined} and {@link cancelIfUndefined}.
* @param fn
* @returns
*/
function ifUndefined(fn) {
	return (value) => {
		if (value === void 0) return fn();
		else return value;
	};
}

//#endregion
//#region ../process/dist/src/util.js
/**
* Default comparer function is equiv to checking `a === b`.
* Use {@link isEqualValueDefault} to compare by value, via comparing JSON string representation.
*/
const isEqualDefault = (a, b) => a === b;
/**
* A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
*/
const toStringDefault = (itemToMakeStringFor) => typeof itemToMakeStringFor === `string` ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor);

//#endregion
//#region ../process/dist/src/seen.js
/**
* If a value is same as the previous value, _undefined_ is emitted instead.
*
* @param eq Equality function. If not specified, === semantics are used.
* @returns
*/
function seenLastToUndefined(eq) {
	if (typeof eq === `undefined`) eq = isEqualDefault;
	let lastValue;
	return (value) => {
		if (value !== lastValue) {
			lastValue = value;
			return value;
		}
		return void 0;
	};
}
/**
* If a value is same as any previously-seen value, _undefined_ is emitted instead.
*
* It stores all previous values and compares against them for each new value.
* This would likely be not very efficient compared to {@link seenToUndefinedByKey} which uses a one-time computed
* key and efficient storage of only the keys (using a Set).
*
* @param eq Equality function. If not specified, === semantics are used.
* @returns
*/
function seenToUndefined(eq) {
	const seen = [];
	if (typeof eq === `undefined`) eq = isEqualDefault;
	return (value) => {
		if (value === void 0) return;
		for (const s of seen) if (eq(s, value)) return;
		seen.push(value);
		return value;
	};
}
/**
* If a value is the same as any previously-seen value, _undefined_ is emitted instead.
*
* This version uses a function to create a string key of the object, by default JSON.stringify.
* Thus we don't need to store all previously seen objects, just their keys.
*
* Alternatively, if a key function doesn't make sense for the value, use
* {@link seenToUndefined}, which stores the values (less efficient).
*
* @param toString
* @returns
*/
function seenToUndefinedByKey(toString) {
	const seen = /* @__PURE__ */ new Set();
	if (typeof toString === `undefined`) toString = toStringDefault;
	return (value) => {
		if (value === void 0) return;
		const key = toString(value);
		if (seen.has(key)) return;
		seen.add(key);
		return value;
	};
}

//#endregion
//#region ../process/dist/src/index.js
var src_exports = {};
__export(src_exports, {
	CancelError: () => CancelError,
	average: () => average,
	cancelIfUndefined: () => cancelIfUndefined,
	flow: () => flow,
	ifNotUndefined: () => ifNotUndefined,
	ifUndefined: () => ifUndefined,
	max: () => max,
	min: () => min,
	rank: () => rank,
	seenLastToUndefined: () => seenLastToUndefined,
	seenToUndefined: () => seenToUndefined,
	seenToUndefinedByKey: () => seenToUndefinedByKey,
	sum: () => sum,
	tally: () => tally
});

//#endregion
export { compareData, getField, getPathsAndData, pathed_exports, src_exports, src_exports$1, updateByPath };
//# sourceMappingURL=src-SGLqiJ8Q.js.map