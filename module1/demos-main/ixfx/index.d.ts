import { ChangeKind, ChangeRecord, CompareChangeSet, PathDataChange, index_d_exports as index_d_exports$2, index_d_exports$1, index_d_exports$2 as index_d_exports, pathed_d_exports } from "./index-BGP5MfB7.js";
import { ReadonlyRemapObjectPropertyType, RecursivePartial, RecursiveReplace, RecursiveWriteable, RemapObjectPropertyType, RequireOnlyOne, Rest, Writeable } from "./ts-utility-DZKsU5oa.js";
import { IsEqual, IsEqualContext, isEmptyEntries, isEqualContextString, isEqualDefault, isEqualValueDefault, isEqualValueIgnoreOrder, isEqualValuePartial, toStringOrdered } from "./is-equal-BzhoT7pd.js";
import { BasicType, IDictionary, IWithEntries, Interval, KeyValue, Primitive, PrimitiveOrObject, RankArrayOptions, RankFunction, RankOptions, StringOrNumber, ToString } from "./types-CcY4GIC4.js";
import { maps_d_exports } from "./maps-Di0k-jsW.js";
import { index_d_exports as index_d_exports$3 } from "./index-DTe1EM0y.js";
import { CompareResult, Comparer, comparerInverse, defaultComparer, jsComparer, numericComparer } from "./comparers-C6kfLE-t.js";
import { Continuously, ContinuouslyAsyncCallback, ContinuouslyOpts, ContinuouslySyncCallback, HasCompletion, HasCompletionRunStates, OnStartCalled, continuously, index_d_exports as index_d_exports$4 } from "./index-Bne6KcmH.js";
import { KeyValueSortSyles, KeyValueSorter, keyValueSorter } from "./key-value-ww1DZidG.js";
import { Passed, Reactive, ReactiveInitial, ReactiveNonInitial, ResolveFallbackOpts, ResolveToValue, ResolveToValueAsync, ResolveToValueSync, SignalKinds, Unsubscriber, resolve, resolveSync, resolveWithFallback, resolveWithFallbackSync } from "./resolve-core-Cji7XRWY.js";
import { SleepOpts, sleep, sleepWhile } from "./sleep-DiuAJS4P.js";
import { QueueMutable, index_d_exports as index_d_exports$6, index_d_exports$1 as index_d_exports$5, index_d_exports$2 as index_d_exports$7 } from "./index-BD4Xy9K5.js";
import { ISimpleEventEmitter, SimpleEventEmitter, index_d_exports as index_d_exports$8 } from "./index-CZIsUroQ.js";
import { index_d_exports as index_d_exports$9 } from "./index-OoTuEEFP.js";
import { Point, Rect, index_d_exports as index_d_exports$10 } from "./index-D8PtH9JS.js";
import { NumbersComputeOptions, NumbersComputeResult, index_d_exports as index_d_exports$11 } from "./index-pdF5CCTk.js";
import { index_d_exports as index_d_exports$12 } from "./index-CrDQWgWl.js";
import { StateChangeEvent, StateMachineWithEvents, Transitions } from "./index-1oZyS9hM.js";
import { HslScalar, ManualCapturer, index_d_exports as index_d_exports$13 } from "./index-CUAMztEi.js";
import { EventSourceOptions, ObjectFieldHandler, Reactive as Reactive$1, ReactiveDiff, ReactiveInitial as ReactiveInitial$1, ReactiveNonInitial as ReactiveNonInitial$1, ReactiveWritable, index_d_exports as index_d_exports$14 } from "./index-X_q0_zPS.js";

//#region ../core/dist/src/correlate.d.ts
/**
 * Returns the similarity of `a` and `b` to each other,
 * where higher similarity should be a higher number.
 * @param a
 * @param b
 */
type Similarity<V> = (a: V, b: V) => number;
/**
 * Options for alignmnent
 */
type AlignOpts = {
  /**
   * If the similarity score is above this threshold,
   * consider them the same
   */
  readonly matchThreshold?: number;
  /**
   * If true, additional console messages are printed during
   * execution.
   */
  readonly debug?: boolean;
};
/**
 * Some data with an id property.
 */
type DataWithId<V> = V & {
  readonly id: string;
};
/**
 * Attempts to align prior data with new data, based on a provided similarity function.
 *
 * See also `alignById` for a version which encloses parameters.
 *
 * ```js
 * // Compare data based on x,y distance
 * const fn = (a, b) => {
 *  return 1-Points.distance(a, b);
 * }
 * const lastData = [
 *  { id:`1`, x:100, y:200 }
 *  ...
 * ]
 * const newData = [
 *  { id:`2`, x:101, y:200 }
 * ]
 * const aligned = Correlate.align(fn, lastdata, newData, opts);
 *
 * // Result:
 * [
 *  { id:`1`, x:101, y:200 }
 * ]
 * ```
 * @param similarityFunction Function to compute similarity
 * @param lastData Old data
 * @param newData New data
 * @param options Options
 * @returns
 */
declare const align: <V>(similarityFunction: Similarity<V>, lastData: readonly DataWithId<V>[] | undefined, newData: readonly DataWithId<V>[], options?: AlignOpts) => readonly DataWithId<V>[];
/**
 * Returns a function that attempts to align a series of data by its id.
 * See also {@link align} for a version with no internal storage.
 *
 * ```js
 * // Compare data based on x,y distance
 * const fn = (a, b) => {
 *  return 1-Points.distance(a, b);
 * }
 * const aligner = Correlate.alignById(fn, opts);
 *
 * const lastData = [
 *  { id:`1`, x:100, y:200 }
 *  ...
 * ]
 * const aligned = aligner(lastData);
 *
 * ```
 * @param fn Function to compute similarity
 * @param options Options
 * @returns
 */
declare const alignById: <V>(fn: Similarity<V>, options?: AlignOpts) => (newData: DataWithId<V>[]) => DataWithId<V>[];
//# sourceMappingURL=correlate.d.ts.map
//#endregion
//#region ../core/dist/src/default-keyer.d.ts
/**
 * If values are strings, uses that as the key.
 * Otherwise uses `JSON.stringify`.
 * @param a
 * @returns
 */
declare const defaultKeyer: <V>(a: V) => string;
//# sourceMappingURL=default-keyer.d.ts.map
//#endregion
//#region ../core/dist/src/elapsed.d.ts
type Since = () => number;
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
declare const elapsedSince: () => Since;
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
declare const elapsedInterval: () => Since;
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
declare const elapsedOnce: () => Since;
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
declare const elapsedInfinity: () => Since;
//# sourceMappingURL=elapsed.d.ts.map
//#endregion
//#region ../core/dist/src/filters.d.ts
/**
 * Returns `v` if `predicate` returns _true_,
 * alternatively returning `skipValue`.
 *
 * ```js
 * // Return true if value is less than 10
 * const p = v => v < 10;
 *
 * filterValue(5, p, 0);   // 5
 * filterValue(20, p, 0);  // 0
 * ```
 * @param v Value to test
 * @param predicate Predicate
 * @param skipValue Value to return if predicate returns false
 * @returns Input value if predicate is _true_, or `skipValue` if not.
 */
declare const filterValue: <V>(v: V, predicate: (v: V) => boolean, skipValue: V | undefined) => V | undefined;
//# sourceMappingURL=filters.d.ts.map
//#endregion
//#region ../core/dist/src/is-equal-test.d.ts
/**
 * Wraps the `eq` function, tracing the input data result
 * ```js
 * // Init trace
 * const traceEq = isEqualTrace(isEqualValueDefault);
 * // Use it in some function that takes IsEqual<T>
 * compare(a, b, eq);
 * ```
 * @param eq
 * @returns
 */
declare const isEqualTrace: <T>(eq: IsEqual<T>) => IsEqual<T>;
//# sourceMappingURL=is-equal-test.d.ts.map

//#endregion
//#region ../core/dist/src/is-integer.d.ts
/**
 * Returns _true_ if `value` is an integer. Parses string input, but
 * all other data types return _false_.
 *
 * ```js
 * isInteger(1);      // true
 * isInteger(1.1);    // false
 * isInteger(`1`);    // true
 * isInteger(`1.1`);  // false
 * isInteger(true);   // false
 * isInteger(false);  // false
 * ```
 *
 * Returns _false_ for _undefined_, NaN, booleans and infinite numbers.
 * @param value
 * @returns
 */
declare const isInteger: (value: string | number) => boolean;
//# sourceMappingURL=is-integer.d.ts.map
//#endregion
//#region ../core/dist/src/is-primitive.d.ts
/**
 * Returns _true_ if `value` is number, string, bigint or boolean.
 * Returns _false_ if `value` is an object, null, undefined
 *
 * Use {@link isPrimitiveOrObject} to also return true if `value` is an object.
 * @param value Value to check
 * @returns _True_ if value is number, string, bigint or boolean.
 */
declare function isPrimitive(value: any): value is Primitive;
/**
 * Returns _true_ if `value` is number, string, bigint, boolean or an object
 *
 * Use {@link isPrimitive} to not include objects.
 * @param value
 * @returns
 */
declare function isPrimitiveOrObject(value: any): value is PrimitiveOrObject;
//# sourceMappingURL=is-primitive.d.ts.map

//#endregion
//#region ../core/dist/src/iterable-compare-values-shallow.d.ts
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
declare const compareIterableValuesShallow: <V>(a: Iterable<V>, b: Iterable<V>, eq?: (a: V, b: V) => boolean) => {
  shared: V[];
  isSame: boolean;
  a: V[];
  b: V[];
};
//# sourceMappingURL=iterable-compare-values-shallow.d.ts.map
//#endregion
//#region ../core/dist/src/interval-type.d.ts
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
declare function intervalToMs(interval: Interval | undefined, defaultNumber?: number): number;
/**
 * Returns _true_ if `interval` matches the {@link Interval} type.
 * @param interval
 * @returns _True_ if `interval` is an {@link Interval}.
 */
declare function isInterval(interval: number | Interval | undefined): interval is Interval;
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
declare const elapsedToHumanString: (millisOrFunction: number | (() => number) | Interval, rounding?: number) => string;
//# sourceMappingURL=interval-type.d.ts.map
//#endregion
//#region ../core/dist/src/to-string.d.ts
/**
 * Returns _true_ if `value` is a Map type
 * @param value
 * @returns
 */
declare const isMap: (value: unknown) => value is Map<any, any>;
/**
 * Returns _true_ if `value` is a Set type
 * @param value
 * @returns
 */
declare const isSet: (value: unknown) => value is Set<any>;
/**
 * A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
 */
declare const toStringDefault: <V>(itemToMakeStringFor: V) => string;
/**
 * Converts a value to string form.
 * For simple objects, .toString() is used, other JSON.stringify is used.
 * It is meant for creating debugging output or 'hash' versions of objects, and does
 * not necessarily maintain full fidelity of the input
 * @param value
 * @returns
 */
declare const defaultToString: (value: null | boolean | string | object) => string;
//# sourceMappingURL=to-string.d.ts.map
//#endregion
//#region ../core/dist/src/track-unique.d.ts
type TrackUnique<T> = (value: T) => boolean;
/**
 * Tracks unique values. Returns _true_ if value is unique.
 * Alternatively: {@link uniqueInstances}
 *
 * ```js
 * const t = unique();
 * t(`hello`); // true
 * t(`hello`); // false
 * ```
 *
 * Uses JSON.stringify to compare anything which is not a string.
 *
 * Provide a custom function to convert to string to track uniqueness
 * for more complicated objects.
 *
 * ```js
 * const t = unique(p => p.name);
 * t({ name:`John`, level:2 }); // true
 *
 * // Since we're judging uniques by name only
 * t({ name:`John`, level:3 }); // false
 * ```
 *
 * Return function throws an error if `value` is null or undefined.
 * @returns
 */
declare const unique: <T>(toString?: ToString<T>) => TrackUnique<T>;
/**
 * Tracks unique object instances. Returns _true_ if value is unique.
 * Alternatively: {@link unique} to track by value.
 */
declare const uniqueInstances: <T>() => TrackUnique<T>;
//# sourceMappingURL=track-unique.d.ts.map
//#endregion
//#region ../core/dist/src/platform.d.ts
/**
 * Returns _true_ if it seems like the code is running on iOS (iPad/iPhone)
 * @returns
 */
declare const runningiOS: () => boolean;
//# sourceMappingURL=platform.d.ts.map
//#endregion
//#region ../core/dist/src/promise-from-event.d.ts
declare const promiseFromEvent: (target: EventTarget, name: string) => Promise<any>;
//# sourceMappingURL=promise-from-event.d.ts.map

//#endregion
//#region ../core/dist/src/reactive-core.d.ts
/**
 * Returns _true_ if `rx` is a Reactive
 * @param rx
 * @returns
 */
declare const isReactive: <V>(rx: object) => rx is Reactive<V>;
/**
 * Returns _true_ if `rx` has a last value
 *
 * Judged seeing if `.last()` exists on `rx`.
 * @param rx Reactive
 * @returns
 */
declare const hasLast: <V>(rx: object) => rx is ReactiveInitial<V>;
//# sourceMappingURL=reactive-core.d.ts.map
//#endregion
//#region ../core/dist/src/resolve-fields.d.ts
/**
 * An object that can be 'resolved'.
 * @see {@link resolveFields}
 */
type ResolvedObject<T extends Record<string, ResolveToValue<any>>> = { [K in keyof T]: T[K] extends number ? number : T[K] extends string ? string : T[K] extends boolean ? boolean : T[K] extends bigint ? bigint : T[K] extends (() => Promise<any>) ? Awaited<ReturnType<T[K]>> : T[K] extends (() => any) ? ReturnType<T[K]> : T[K] extends ReactiveNonInitial<infer V> ? V : T[K] extends Generator<infer V> ? V : T[K] extends AsyncGenerator<infer V> ? V : T[K] extends IterableIterator<infer V> ? V : T[K] extends AsyncIterableIterator<infer V> ? V : T[K] extends (infer V)[] ? V : T[K] extends object ? T[K] : never };
/**
 * Returns a copy of `object`, with the same properties. For each property
 * that has a basic value (string, number, boolean, object), the value is set
 * for the return object. If the property is a function or generator, its value
 * is used instead. Async functions and generators are also usable.
 *
 * Use {@link resolveFieldsSync} for a synchronous version.
 *
 * Not recursive.
 *
 * In the below example, the function for the property `random` is invoked.
 * ```js
 * const state = {
 *  length: 10,
 *  random: () => Math.random();
 * }
 * const x = resolveFields(state);
 * // { length: 10, random: 0.1235 }
 * ```
 *
 * It also works with generators. Probably best with those that are infinite.
 *
 * ```js
 * import { count } from './numbers.js';
 *
 * const state = {
 *  length: 10,
 *  index: count(2) // Generator that yields: 0, 1 and then ends
 * }
 * resolveFields(state); // { length: 10, index: 0 }
 * resolveFields(state); // { length: 10, index: 1 }
 * // Generator finishes after counting twice:
 * resolveFields(state); // { length: 10, index: undefined }
 * ```
 * @param object
 * @returns
 */
declare function resolveFields<T extends Record<string, ResolveToValue<any>>>(object: T): Promise<ResolvedObject<T>>;
/**
 * 'Resolves' all the fields of `object` in a synchronous manner.
 * Uses {@link resolveSync} under-the-hood
 * @param object
 * @returns
 */
declare function resolveFieldsSync<T extends Record<string, ResolveToValue<any>>>(object: T): ResolvedObject<T>;
/**
 * Returns a function that resolves `object`.
 *
 * Use {@link resolveFields} to resolve an object directly.
 * @param object
 * @returns
 */
//# sourceMappingURL=resolve-fields.d.ts.map
//#endregion
//#region ../core/dist/src/types-array.d.ts
/**
 * Functions which modify an array
 */
type ArrayLengthMutationKeys = `splice` | `push` | `pop` | `shift` | `unshift` | number;
/**
 * Array items
 */
type ArrayItems<T extends any[]> = T extends (infer TItems)[] ? TItems : never;
/**
 * A fixed-length array
 */
type FixedLengthArray<T extends any[]> = Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>> & {
  [Symbol.iterator]: () => IterableIterator<ArrayItems<T>>;
};
//# sourceMappingURL=types-array.d.ts.map

//#endregion
//#region ../arrays/dist/src/cycle.d.ts
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
declare const cycle: <T>(options: readonly T[] | T[]) => {
  toArray: () => T[];
  next: () => T;
  prev: () => T;
  readonly current: T;
  select: (indexOrValue: number | T) => void;
};
//# sourceMappingURL=cycle.d.ts.map
//#endregion
//#region ../arrays/dist/src/at-wrap.d.ts
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
declare const atWrap: <V>(array: V[], index: number) => V;
//# sourceMappingURL=at-wrap.d.ts.map
//#endregion
//#region ../arrays/dist/src/chunks.d.ts
/**
 * Return `array` broken up into chunks of `size` values
 *
 * ```js
 * chunks([1,2,3,4,5,6,7,8,9,10], 3);
 * // Yields: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 * ```
 * @param array
 * @param size
 * @returns
 */
declare function chunks$3<V>(array: readonly V[], size: number): V[][];
//# sourceMappingURL=chunks.d.ts.map

//#endregion
//#region ../arrays/dist/src/contains.d.ts
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
declare const contains: <V>(haystack: ArrayLike<V>, needles: ArrayLike<V>, eq?: (a: V, b: V) => boolean) => boolean;
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
declare const containsDuplicateValues: <V>(data: Iterable<V>, keyFunction?: (itemToMakeStringFor: V) => string) => boolean;
/**
 * Returns _true_ if array contains duplicate instances based on `===` equality checking
 * Use {@link containsDuplicateValues} if you'd rather compare by value.
 * @param array
 * @returns
 */
declare const containsDuplicateInstances: <V>(array: V[] | readonly V[]) => boolean;
//# sourceMappingURL=contains.d.ts.map
//#endregion
//#region ../arrays/dist/src/ensure-length.d.ts
declare function ensureLength<V>(data: readonly V[] | V[], length: number, expand: `repeat` | `first` | `last`): (V)[];
declare function ensureLength<V>(data: readonly V[] | V[], length: number, expand?: `undefined`): (V | undefined)[];
//# sourceMappingURL=ensure-length.d.ts.map
//#endregion
//#region ../arrays/dist/src/util/is-equal.d.ts
/**
 * Function that returns true if `a` and `b` are considered equal
 */
type IsEqual$1<T> = (a: T, b: T) => boolean;
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

//#endregion
//#region ../arrays/dist/src/equality.d.ts
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
declare const isEqual: <V>(arrayA: V[], arrayB: V[], equality?: (a: V, b: V) => boolean) => boolean;
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
declare const containsIdenticalValues: <V>(array: readonly V[] | V[], equality?: IsEqual$1<V>) => boolean;
//# sourceMappingURL=equality.d.ts.map
//#endregion
//#region ../arrays/dist/src/filter.d.ts
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
declare const filterAB: <V>(data: readonly V[], filter: (a: V) => boolean) => [a: V[], b: V[]];
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
declare function filterBetween<V>(array: readonly V[] | V[], predicate: (value: V, index: number, array: readonly V[] | V[]) => boolean, startIndex?: number, endIndex?: number): Generator<V>;
//# sourceMappingURL=filter.d.ts.map
//#endregion
//#region ../arrays/dist/src/flatten.d.ts
/**
 * Returns a 'flattened' copy of array, un-nesting arrays one level
 * ```js
 * flatten([1, [2, 3], [[4]] ]);
 * // Yields: [ 1, 2, 3, [4]];
 * ```
 * @param array
 * @returns
 */
declare const flatten$3: (array: ReadonlyArray<any> | Array<any>) => Array<any>;
//# sourceMappingURL=flatten.d.ts.map

//#endregion
//#region ../arrays/dist/src/for-each.d.ts
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
declare const mapWithEmptyFallback: <TValue, TReturn>(array: TValue[], fn: (value: TValue) => TReturn, fallback: TReturn | TReturn[]) => TReturn[];
//# sourceMappingURL=for-each.d.ts.map
//#endregion
//#region ../arrays/dist/src/frequency.d.ts
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
declare const frequencyByGroup: <TValue, TGroup extends string | number>(groupBy: ((value: TValue) => TGroup), data: TValue[]) => Map<TGroup, number>;
//# sourceMappingURL=frequency.d.ts.map

//#endregion
//#region ../arrays/dist/src/group-by.d.ts
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
declare const groupBy: <K, V>(array: Iterable<V>, grouper: (item: V) => K) => Map<K, V[]>;
//# sourceMappingURL=group-by.d.ts.map
//#endregion
//#region ../arrays/dist/src/unique.d.ts
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
declare const uniqueDeep: <V>(arrays: V[][] | V[] | readonly V[] | readonly (readonly V[])[], comparer?: (a: V, b: V) => boolean) => V[];
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
declare const unique$4: <V>(arrays: V[][] | V[] | readonly V[] | readonly (readonly V[])[], toString?: <V_1>(itemToMakeStringFor: V_1) => string) => V[];
//# sourceMappingURL=unique.d.ts.map
//#endregion
//#region ../arrays/dist/src/insert-at.d.ts
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
declare const insertAt: <V>(data: readonly V[] | V[], index: number, ...values: V[]) => V[];
//# sourceMappingURL=insert-at.d.ts.map
//#endregion
//#region ../arrays/dist/src/interleave.d.ts
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
declare const interleave: <V>(...arrays: readonly (readonly V[])[] | V[][]) => V[];
//# sourceMappingURL=interleave.d.ts.map
//#endregion
//#region ../arrays/dist/src/intersection.d.ts
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
declare const intersection: <V>(arrayA: readonly V[] | V[], arrayB: readonly V[] | V[], equality?: IsEqual$1<V>) => V[];
//# sourceMappingURL=intersection.d.ts.map
//#endregion
//#region ../arrays/dist/src/types.d.ts
/**
 * Returns a result of a merged into b.
 * B is always the 'newer' data that takes
 * precedence.
 */
type MergeReconcile<V> = (a: V, b: V) => V;
//#endregion
//#region ../arrays/dist/src/merge-by-key.d.ts
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
declare const mergeByKey: <V>(keyFunction: (value: V) => string, reconcile: MergeReconcile<V>, ...arrays: readonly (readonly V[])[]) => V[];
//# sourceMappingURL=merge-by-key.d.ts.map
//#endregion
//#region ../arrays/dist/src/pairwise.d.ts
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
declare function pairwise<T>(values: T[]): Generator<T[], void, unknown>;
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
declare const pairwiseReduce: <V, X>(array: readonly V[], reducer: (accumulator: X, a: V, b: V) => X, initial: X) => X;
//# sourceMappingURL=pairwise.d.ts.map
//#endregion
//#region ../arrays/dist/src/random.d.ts
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
declare const shuffle: <V>(dataToShuffle: readonly V[], rand?: () => number) => V[];
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
declare const randomElement: <V>(array: ArrayLike<V>, rand?: () => number) => V;
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
declare const randomIndex: <V>(array: ArrayLike<V>, rand?: () => number) => number;
//# sourceMappingURL=random.d.ts.map
//#endregion
//#region ../arrays/dist/src/remove.d.ts
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
declare const remove: <V>(data: readonly V[] | V[], index: number) => V[];
//# sourceMappingURL=remove.d.ts.map

//#endregion
//#region ../arrays/dist/src/sample.d.ts
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
declare const sample: <V>(array: ArrayLike<V>, amount: number) => V[];
//# sourceMappingURL=sample.d.ts.map
//#endregion
//#region ../arrays/dist/src/sort.d.ts
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
declare const sortByNumericProperty: <V, K extends keyof V>(data: readonly V[] | V[], propertyName: K) => V[];
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
declare const sortByProperty: <V, K extends keyof V>(data: readonly V[] | V[], propertyName: K, comparer?: (a: any, b: any) => number) => V[];
//# sourceMappingURL=sort.d.ts.map
//#endregion
//#region ../arrays/dist/src/until.d.ts
/**
 * Yields all items in the input array, stopping when `predicate` returns _true_.
 *
 * @example Yield values until we hit 3
 * ```js
 * const data = [ 1, 2, 3, 4, 5 ];
 * until(data, v => v === 3)
 * // [ 1, 2 ]
 * ```
 */
declare function until$3<V>(data: readonly V[] | V[], predicate: (v: V) => boolean): Generator<V>;
/**
 * Yields all items in the input array, stopping when `predicate` returns _true_.
 * This version allows a value to be 'accumulated' somehow
 *
 * @example Yield values until a total of 4
 * ```js
 * const data = [ 1, 2, 3, 4, 5 ];
 * until(data, (v, accumulated) => [accumulated >= 6, accumulated + v ]);
 * // [ 1, 2, 3 ]
 * ```
 */
declare function until$3<V, A>(data: readonly V[] | V[], predicate: (v: V, accumulator: A) => readonly [stop: boolean, acc: A], initial: A): Generator<V>;
//# sourceMappingURL=until.d.ts.map
//#endregion
//#region ../arrays/dist/src/without.d.ts
/**
 * Returns a copy of an input array with _undefined_ values removed.
 * @param data
 * @returns
 */
declare const withoutUndefined: <V>(data: readonly V[] | V[]) => V[];
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
declare const without: <V>(sourceArray: readonly V[] | V[], toRemove: V | V[], comparer?: IsEqual$1<V>) => V[];
//# sourceMappingURL=without.d.ts.map
//#endregion
//#region ../arrays/dist/src/zip.d.ts
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
declare const zip$3: (...arrays: any[][] | readonly any[][] | readonly (readonly any[])[]) => any[];
//# sourceMappingURL=zip.d.ts.map
declare namespace index_d_exports$15 {
  export { IsEqual$1 as IsEqual, MergeReconcile, atWrap, chunks$3 as chunks, contains, containsDuplicateInstances, containsDuplicateValues, containsIdenticalValues, cycle, ensureLength, filterAB, filterBetween, flatten$3 as flatten, frequencyByGroup, groupBy, insertAt, interleave, intersection, isEqual, mapWithEmptyFallback, mergeByKey, pairwise, pairwiseReduce, randomElement, randomIndex, remove, sample, shuffle, sortByNumericProperty, sortByProperty, unique$4 as unique, uniqueDeep, until$3 as until, without, withoutUndefined, zip$3 as zip };
}
//#endregion
//#region ../iterables/dist/src/types.d.ts
type WithEvents = {
  addEventListener(type: string, callbackfn: any): void;
  removeEventListener(type: string, callbackfn: any): void;
};
type IteratorControllerOptions<T> = Readonly<{
  delay?: Interval;
  onValue: (value: T) => boolean | void;
  iterator: () => IterableIterator<T>;
}>;
type IteratorControllerState = `stopped` | `running` | `paused`;
type ToArrayOptions = {
  /**
   * If set `toArray` continues until reaching this many results
   */
  limit: number;
  /**
   * If set, `toArray` continues until this function returns false
   * @param count
   * @returns
   */
  while: (count: number) => boolean;
  /**
   * If set, `toArray` continues until this much time elapses.
   */
  elapsed: Interval;
};
type ForEachOptions = {
  /**
   * Interval after each iteration.
   * Only works with asynchronous forEach.
   */
  interval?: Interval;
};
//# sourceMappingURL=types.d.ts.map
declare namespace async_d_exports {
  export { asCallback$3 as asCallback, chunks$2 as chunks, concat$2 as concat, dropWhile$2 as dropWhile, equals$2 as equals, every$2 as every, fill$2 as fill, filter$3 as filter, find$2 as find, flatten$2 as flatten, forEach$2 as forEach, fromArray$2 as fromArray, fromIterable$2 as fromIterable, last$2 as last, map$2 as map, max$3 as max, min$3 as min, nextWithTimeout, reduce$3 as reduce, repeat$1 as repeat, slice$2 as slice, some$2 as some, toArray$2 as toArray, unique$3 as unique, uniqueByValue$2 as uniqueByValue, until$2 as until, withDelay, zip$2 as zip };
}
/**
 * Yield values from `array`, one at a time.
 * Use `interval` to add time between each item.
 * The first item is yielded without delay.
 *
 * @param array Array of values
 * @param interval Interval (defaults: 1ms)
 */
declare function fromArray$2<V>(array: V[], interval?: Interval): AsyncGenerator<V>;
/**
 * Yield values from `iterable`, one at a time.
 * Use `interval` to add time between each item.
 * The first item is yielded without delay.
 * @param iterable Iterable or AsyncIterable
 * @param [interval=1] Interval to wait between yield
 */
declare function fromIterable$2<V>(iterable: Iterable<V> | AsyncIterable<V>, interval?: Interval): AsyncGenerator<V>;
declare function chunks$2<V>(it: AsyncIterable<V>, size: number): AsyncGenerator<V[], void, unknown>;
declare function concat$2<V>(...its: readonly AsyncIterable<V>[]): AsyncGenerator<Awaited<V>, void, any>;
declare function dropWhile$2<V>(it: AsyncIterable<V>, f: (v: V) => boolean): AsyncGenerator<Awaited<V>, void, unknown>;
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
declare const until$2: (it: AsyncIterable<any> | Iterable<any>, callback: () => (void | Promise<boolean> | undefined | boolean | Promise<undefined> | Promise<void>)) => Promise<undefined>;
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
declare const repeat$1: <T>(genCreator: () => Iterable<T> | AsyncIterable<T>, repeatsOrSignal: number | AbortSignal) => AsyncGenerator<T>;
/**
 * Returns true if items in two iterables are equal, as
 * determined by the `equality` function.
 * Order matters. It compares items at the same 'step' of each iterable.
 * @param it1
 * @param it2
 * @param equality
 * @returns
 */
declare function equals$2<V>(it1: AsyncIterable<V>, it2: AsyncIterable<V>, equality?: IsEqual<V>): Promise<boolean | undefined>;
declare function every$2<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<boolean>;
declare function fill$2<V>(it: AsyncIterable<V>, v: V): AsyncGenerator<Awaited<V>, void, unknown>;
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
declare function filter$3<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): AsyncGenerator<Awaited<V>, void, unknown>;
declare function find$2<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<V | undefined>;
declare function flatten$2<V>(it: AsyncIterable<V>): AsyncGenerator<any, void, unknown>;
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
declare const forEach$2: <T>(iterator: AsyncIterable<T> | T[], fn: (v?: T) => Promise<boolean> | Promise<void> | boolean | void, options?: Partial<ForEachOptions>) => Promise<void>;
/**
 * Returns last value from an iterable, or _undefined_
 * if no values are generated
 * @param it
 */
declare function last$2<V>(it: AsyncIterable<V>, opts?: Partial<{
  abort: AbortSignal;
}>): Promise<V | undefined>;
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
declare function map$2<V, X>(it: AsyncIterable<V>, f: (v: V) => X): AsyncGenerator<Awaited<X>, void, unknown>;
declare function max$3<V>(it: AsyncIterable<V>, gt?: (a: V, b: V) => boolean): AsyncGenerator<Awaited<V>, void, unknown>;
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
declare function min$3<V>(it: AsyncIterable<V>, gt?: (a: V, b: V) => boolean): AsyncGenerator<Awaited<V>, Awaited<V> | undefined, unknown>;
declare function reduce$3<V>(it: AsyncIterable<V>, f: (accumulator: V, current: V) => V, start: V): Promise<V>;
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
declare function asCallback$3<V>(input: AsyncIterable<V>, callback: (v: V) => unknown, onDone?: () => void): Promise<void>;
declare function slice$2<V>(it: AsyncIterable<V>, start?: number, end?: number): AsyncGenerator<Awaited<V>, void, unknown>;
/**
 * Enumerates over an input iterable, with a delay between items.
 * @param it
 * @param delay
 */
declare function withDelay<V>(it: Iterable<V>, delay: Interval): AsyncGenerator<Awaited<V>, void, unknown>;
/***
 * Returns the next IteratorResult,
 * throwing an error if it does not happen
 * within `interval` (default: 1s)
 */
declare function nextWithTimeout<V>(it: AsyncIterableIterator<V> | IterableIterator<V>, options: SleepOpts<any>): Promise<IteratorResult<V, any>>;
declare function some$2<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<boolean>;
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
declare function toArray$2<V>(it: AsyncIterable<V>, options?: Partial<ToArrayOptions>): Promise<V[]>;
declare function unique$3<V>(iterable: AsyncIterable<V> | AsyncIterable<V>[]): AsyncGenerator<Awaited<V>, void, unknown>;
declare function uniqueByValue$2<T>(input: AsyncIterable<T>, toString?: (value: T) => string, seen?: Set<string>): AsyncGenerator<T>;
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
declare function zip$2<V>(...its: readonly AsyncIterable<V>[]): AsyncGenerator<V[], void, unknown>;
//# sourceMappingURL=async.d.ts.map
//#endregion
//#region ../iterables/dist/src/sync/slice.d.ts
declare function slice$1<V>(it: Iterable<V>, start?: number, end?: number): Generator<V, void, unknown>;
//# sourceMappingURL=slice.d.ts.map
//#endregion
//#region ../iterables/dist/src/sync/reduce.d.ts
declare function reduce$2<V>(it: Iterable<V>, f: (accumulator: V, current: V) => V, start: V): V;
//# sourceMappingURL=reduce.d.ts.map
declare namespace sync_d_exports {
  export { asCallback$2 as asCallback, chunks$1 as chunks, chunksOverlapping, concat$1 as concat, dropWhile$1 as dropWhile, equals$1 as equals, every$1 as every, fill$1 as fill, filter$2 as filter, find$1 as find, first, flatten$1 as flatten, forEach$1 as forEach, fromArray$1 as fromArray, fromIterable$1 as fromIterable, last$1 as last, map$1 as map, max$2 as max, min$2 as min, next, reduce$2 as reduce, repeat, slice$1 as slice, some$1 as some, toArray$1 as toArray, unique$2 as unique, uniqueByValue$1 as uniqueByValue, until$1 as until, yieldNumber, zip$1 as zip };
}
declare function uniqueByValue$1<T>(input: Iterable<T>, toString?: ToString<T>, seen?: Set<string>): Generator<T>;
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
declare function asCallback$2<V>(input: Iterable<V>, callback: (v: V) => unknown, onDone?: () => void): void;
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
declare function yieldNumber(generator: Generator<number>, defaultValue?: number): () => number | undefined;
/**
 * Return first value from an iterable, or _undefined_ if
 * no values are generated
 * @param it
 * @returns
 */
declare function first<V>(it: Iterable<V>): V | undefined;
/**
 * Returns last value from an iterable, or _undefined_
 * if no values are generated
 * @param it
 */
declare function last$1<V>(it: Iterable<V>): V | undefined;
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
declare function chunksOverlapping<V>(it: Iterable<V>, size: number): Generator<V[], void, unknown>;
declare function chunks$1<V>(it: Iterable<V>, size: number): Generator<V[], void, unknown>;
declare function concat$1<V>(...its: readonly Iterable<V>[]): Generator<V, void, any>;
declare function dropWhile$1<V>(it: Iterable<V>, f: (v: V) => boolean): Generator<V, void, unknown>;
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
declare const until$1: (it: Iterable<any>, callback: () => (void | boolean | never)) => void;
declare const next: <T>(it: Generator<T>) => () => T | undefined;
/**
 * Returns true if items in two iterables are equal, as
 * determined by the `equality` function.
 * @param it1
 * @param it2
 * @param equality
 * @returns
 */
declare function equals$1<V>(it1: IterableIterator<V>, it2: IterableIterator<V>, equality?: IsEqual<V>): boolean | undefined;
declare function every$1<V>(it: Iterable<V>, f: (v: V) => boolean): boolean;
declare function fill$1<V>(it: Iterable<V>, v: V): Generator<V, void, unknown>;
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
declare function forEach$1<T>(iterator: Iterable<T> | T[], fn: (v: T) => boolean | void): void;
/**
 * ```js
 * filter([1, 2, 3, 4], e => e % 2 == 0);
 * returns [2, 4]
 * ```
 * @param it
 * @param f
 */
declare function filter$2<V>(it: Iterable<V>, f: (v: V) => boolean): Generator<V, void, unknown>;
declare function find$1<V>(it: Iterable<V>, f: (v: V) => boolean): V | undefined;
declare function flatten$1<V>(it: Iterable<V>): Generator<any, void, unknown>;
/**
 * Maps an iterable of type `V` to type `X`.
 * ```js
 * map([1, 2, 3], e => e*e)
 * returns [1, 4, 9]
 * ```
 * @param it
 * @param f
 */
declare function map$1<V, X>(it: Iterable<V>, f: (v: V) => X): Generator<X, void, unknown>;
declare function max$2<V>(it: Iterable<V>, gt?: (a: V, b: V) => boolean): Generator<V>;
declare function min$2<V>(it: Iterable<V>, gt?: (a: V, b: V) => boolean): Generator<V, void, unknown>;
declare function some$1<V>(it: Iterable<V>, f: (v: V) => boolean): boolean;
declare function repeat<T>(genCreator: () => Iterable<T>, repeatsOrSignal: number | AbortSignal): Generator<T>;
declare function unique$2<V>(iterable: Iterable<V> | Iterable<V>[]): Generator<V, void, unknown>;
/**
 * Combine same-positioned items from several iterables
 * ```js
 * zip( [1, 2, 3], [4, 5, 6], [7, 8, 9] );
 * Yields: [ [1, 4, 7], [2, 5, 8], [3, 6, 9] ]
 * ```
 * @param its
 * @returns
 */
declare function zip$1<V>(...its: readonly Iterable<V>[]): Generator<V[], void, unknown>;
declare function fromIterable$1<T>(iterable: Iterable<T>): Generator<T, void, unknown>;
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
declare function toArray$1<V>(it: Iterable<V>, options?: Partial<ToArrayOptions>): V[];
/**
 * Yield values from `array`, one at a time.
 * Use `interval` to add time between each item.
 * The first item is yielded without delay.
 * @param array Array of values
 */
declare function fromArray$1<V>(array: V[]): Generator<V>;
//# sourceMappingURL=sync.d.ts.map
//#endregion
//#region ../iterables/dist/src/chain/types.d.ts
type SyncOptions = {
  /**
   * How to handle when a source completes.
   * * 'allow' means we continue synchronising with remaining alive sources. Use 'finalValue' option to control what data is returned for completed sources
   * * 'break' means we stop the stream, because synchronisation across all sources is no longer possible.
   *
   * Default: 'break'.
   */
  onSourceDone: `allow` | `break`;
  /**
   * Maximum time to wait for synchronisation to happen.
   * If interval is exceeded, stream closes.
   * Default: 2s
   */
  maximumWait: Interval;
  /**
   * If we continue synchronisation when a source is done (via `onSourceDone:'allow'`),
   * what source should be returned for a completed source?
   * * 'undefined': _undefined_
   * * 'last': the last received value, or _undefined_
   *
   * Default: 'undefined'
   */
  finalValue: `undefined` | `last`;
};
type CombineLatestOptions = {
  onSourceDone: `allow` | `break`;
  /**
  * If we continue synchronisation when a source is done (via `onSourceDone:'allow'`),
  * what source should be returned for a completed source?
  * * 'undefined': _undefined_
  * * 'last': the last received value, or _undefined_
  *
  * Default: 'undefined'
  */
  finalValue: `undefined` | `last`;
  /**
   * After an array is emitted, what to do with
   * last values. By default, the last value is kept.
   * If 'undefined' is used, _undefined_ is used until
   * source emits again.
   *
   * Default: 'last'
   */
  afterEmit: `undefined` | `last`;
};
/**
 * A Generator, AsyncGenerator or IterableIterator
 */
type Gen<V> = Generator<V> | AsyncGenerator<V> | IterableIterator<V>;
/**
 * Some kind of (async) generator or an array of data of type V
 */
type GenOrData<V> = V[] | Gen<V>;
/**
 * A function which can form part of a chain.
 * It takes an input {@link GenOrData}, and returns a new generator.
 */
type Link<In, Out> = {
  (input: GenOrData<In>): AsyncGenerator<Out>;
  _name?: string;
};
/**
 * A function which can start a chain, since it takes no input
 */
type GenFactoryNoInput<Out> = {
  (): AsyncGenerator<Out>;
  _type: `GenFactoryNoInput`;
  _name: string;
};
/**
 * An array of chain links where first one is a source
 */
type LinksWithSource<In, Out> = [Link<In, any> | GenOrData<In> | GenFactoryNoInput<In>, ...Link<any, any>[], Link<any, Out>];
/**
 * An array of chain links without a source
 */
type Links<In, Out> = [Link<In, any>, ...Link<any, any>[], Link<any, Out>];
/**
 * Delay options
 */
type DelayOptions = {
  /**
   * Time before yielding
   */
  before?: Interval;
  /**
   * Time after yielding
   */
  after?: Interval;
};
type TickOptions = {
  interval: Interval;
  loops?: number;
  elapsed?: Interval;
  asClockTime?: boolean;
};
/**
 * Lazy execution of a chain
 */
type LazyChain<In, Out> = {
  /**
   * Sets `data` to be the data for the chain
   * @param data
   * @returns
   */
  input: (data: GenOrData<In>) => LazyChain<In, Out>;
  /**
   * Return the results of the chain as a regular generator.
   * If `data` is not supplied, the last value given calling `input(data)` is used.
   * @param data
   * @returns
   */
  asGenerator: (data?: GenOrData<In>) => AsyncGenerator<Out>;
  /**
   * Returns the results of the chain as an array.
   * If `data` is not supplied, the last value given calling `input(data)` is used.
   * @param data
   * @returns
   */
  asArray: (data?: GenOrData<In>) => Promise<Out[]>;
  asAsync: (data?: GenOrData<In>) => LazyChain<In, Out>;
  /**
   * Gets the last output value from the chain.
   * If `data` is not supplied, the last value given calling `input(data)` is used.
   * @param data
   * @returns
   */
  lastOutput: (data?: GenOrData<In>) => Promise<Out | undefined>;
  /**
   * Gets the first output value from the chain.
   * If `data` is not supplied, the last value given calling `input(data)` is used.
   * @param data
   * @returns
   */
  firstOutput: (data?: GenOrData<In>) => Promise<Out | undefined>;
  /**
   * Uses a function as a source of values
   * @param callback
   * @returns
   */
  fromFunction: (callback: () => any) => LazyChain<any, any>;
  /**
   * Take `limit` number of values from the chain before ending
   * @param limit
   * @returns
   */
  take: (limit: number) => LazyChain<In, Out>;
  /**
   * Only emit values that have ranked higher than previously seen
   */
  rank: (r: RankFunction<In>, options: Partial<RankOptions>) => LazyChain<In, Out>;
  rankArray: (r: RankFunction<In>, options: Partial<RankArrayOptions>) => LazyChain<In, Out>;
  /**
   * Debounce values
   * @param duration
   * @returns
   */
  debounce: (duration: Interval) => LazyChain<In, Out>;
  /**
   * Delay emitting values
   * @param options
   * @returns
   */
  delay: (options: DelayOptions) => LazyChain<In, Out>;
  /**
   * Chunk values into arrays
   * @param size
   * @param returnRemainers
   * @returns
   */
  chunk: (size: number, returnRemainers?: boolean) => LazyChain<In, Out>;
  /**
   * Only allow values that meet `predicate` to pass
   * @param predicate
   * @returns
   */
  filter: (predicate: (input: any) => boolean) => LazyChain<In, Out>;
  /**
   * Gets the minimum numerical value (if relevant)
   * @returns
   */
  min: () => LazyChain<any, number>;
  /**
   * Gets the maximum numerical value (if relevant)
   * @returns
   */
  max: () => LazyChain<any, number>;
  /**
   * Gets the average numerical value (if relevant)
   * @returns
   */
  average: () => LazyChain<any, number>;
  /**
   * Gets the total of numerical values
   * @returns
   */
  sum: () => LazyChain<In, number>;
  /**
   * Emits a running tally of how many values have been emitted
   * @returns
   */
  tally: (countArrayItems: boolean) => LazyChain<In, number>;
  /**
   * Ignore values that match `predicate` (opposite of `filter()`)
   * @param predicate
   * @returns
   */
  drop: (predicate: (value: In) => boolean) => LazyChain<In, Out>;
  /**
   * Emit values until `period` has elapsed
   * @param period
   * @returns
   */
  duration: (period: Interval) => LazyChain<In, Out>;
  /**
   * Flatten values in an array into a single value
   * @param reducer
   * @returns
   */
  reduce: (reducer: (values: any[]) => any) => LazyChain<In, Out>;
  /**
   * Transform an input value to an output
   * @param transformer
   * @returns
   */
  transform: (transformer: (v: any) => any) => LazyChain<In, Out>;
};
type GenValueTypeObject<T extends Record<string, GenOrData<any> | GenFactoryNoInput<any>>> = { [K in keyof T]: T[K] extends Generator<infer V> ? V | undefined : T[K] extends AsyncGenerator<infer V> ? V | undefined : T[K] extends IterableIterator<infer V> ? V | undefined : T[K] extends AsyncIterableIterator<infer V> ? V | undefined : T[K] extends (infer V)[] ? V | undefined : T[K] extends ((...args: any) => any) ? ReturnType<T[K]> | undefined : never };
//# sourceMappingURL=types.d.ts.map
declare namespace dom_d_exports {
  export { CreateOptions, ElementWithValue, QueryOptions, perValue, query };
}
type QueryOptions = {
  baseElement: HTMLElement;
};
type CreateOptions<In> = {
  /**
   * Parent element to create elements in. Defaults to `document.body`.
   */
  parentEl: string | HTMLElement;
  /**
   * When set, provide a custom function to return a unique key for a value.
   * This is used for matching values with elements when using immutable data.
   *
   * By default uses the
   * JSON.stringify() representation.
   *
   * To match elements with values by reference, set `byReference` instead.
   *
   * @param value
   * @returns
   */
  key: (value: In) => string;
  /**
   * Default: _false_. When _true_, associate created elements
   * to values by reference rather than value. This can be useful with mutable values.
   *
   * Use this _or_ the `key` option.
   */
  byReference: boolean;
  /**
   * What kind of HTML element to make, defaults to DIV
   */
  tagName: string;
  /**
   * Called whenever an element is created but not yet added to parent element
   * @param element
   * @returns
   */
  beforeInsert: (element: HTMLElement) => void;
  /**
   * Called after an element is inserted to the parent element
   */
  afterInsert: (element: HTMLElement) => void;
  /**
   * Called after an element has been removed
   * @param element
   * @returns
   */
  beforeRemove: (element: HTMLElement) => void;
};
type ElementWithValue<T> = {
  el: HTMLElement;
  value: T;
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
declare function perValue<In>(options?: Partial<CreateOptions<In>>): Link<In, ElementWithValue<In>>;
/**
 * From an input stream of strings, yields an output of HTMLElememnts
 * @param options
 * @returns
 */
declare function query(options?: Partial<QueryOptions>): Link<string, HTMLElement>;
//# sourceMappingURL=dom.d.ts.map
declare namespace links_d_exports {
  export { average, chunk, debounce, delay, drop, duration, filter$1 as filter, max$1 as max, min$1 as min, rank, rankArray, reduce$1 as reduce, sum, take, tally, transform };
}
/**
 * Transform values from one type to another. Just like a map function.
 * @param transformer
 * @returns
 */
declare function transform<In, Out>(transformer: (v: In) => Out): Link<In, Out>;
/**
 * Take `limit` number of results from the stream, before closing
 * @param limit
 * @returns
 */
declare function take<In>(limit: number): Link<In, In>;
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
declare function reduce$1<In, Out>(reducer: (v: In[]) => Out): Link<In[], Out>;
/**
 * Allow values through until a duration has elapsed. After
 * that, the chain stops.
 * @param elapsed
 * @returns
 */
declare function duration<In>(elapsed: Interval): Link<In, In>;
/**
 * Add delay before/after values are emitted from the input stream.
 * @param options
 * @returns
 */
declare function delay<In>(options: DelayOptions): Link<In, In>;
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
declare function debounce<In>(rate: Interval): Link<In, In>;
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
declare function tally<In>(countArrayItems?: boolean): Link<In, number>;
/**
 * Returns the smallest value from the input.
 * Can work with numbers or number[] as input.
 * Non-numeric data is filtered out.
 * @returns
 */
declare function min$1(): Link<number | number[], number>;
/**
 * Returns the largest value from the input.
 * - Non-numeric data is filtered out.
 * - Looks inside of numeric arrays.
 * @returns
 */
declare function max$1(): Link<number | number[], number>;
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
declare function rank<In>(r: RankFunction<In>, options?: Partial<RankOptions>): Link<In, In>;
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
declare function rankArray<In>(r: RankFunction<In>, options?: Partial<RankArrayOptions>): Link<In[], In>;
/**
 * Returns the average from the input.
 * Non-numeric values are filtered out.
 * @returns
 */
declare function average(): Link<number, number>;
/**
 * Returns the total of the numeric values.
 * Non-numeric values are filtered out.
 * @returns
 */
declare function sum(): Link<number, number>;
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
declare function chunk<In>(size: number, returnRemainders?: boolean): Link<In, In[]>;
/**
 * Filters the input source, only allowing through
 * data for which `predicate` returns _true_
 *
 * {@link drop}, on the other hand excludes values for which predicate is _true_
 * @param predicate
 * @returns
 */
declare function filter$1<In>(predicate: (v: In) => boolean): Link<In, In>;
/**
 * Drops all values from input stream for which `predicate` returns _true_
 *
 * {@link filter}, on the other hand includes values where the predicate is _true_
 * @param predicate
 * @returns
 */
declare function drop<In>(predicate: (v: In) => boolean): Link<In, In>;
//# sourceMappingURL=links.d.ts.map
//#endregion
//#region ../iterables/dist/src/chain/from/array.d.ts
/**
 * Creates a chain from an array, reading values at a given interval
 * @param it
 * @param delay
 * @returns
 */
declare function array<Out>(it: Out[], delay?: Interval): GenFactoryNoInput<Out>;
//# sourceMappingURL=array.d.ts.map
//#endregion
//#region ../iterables/dist/src/chain/from/event.d.ts
/**
 * Create an iterable from an event
 * @param target Event source (eg HTML element)
 * @param name Name of event (eg. 'pointermove')
 * @returns
 */
declare function event<Out>(target: EventTarget, name: string): GenFactoryNoInput<Out>;
//# sourceMappingURL=event.d.ts.map

//#endregion
//#region ../iterables/dist/src/chain/from/function.d.ts
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
declare function func<Out>(callback: () => Promise<Out> | Out): GenFactoryNoInput<Out>;
//# sourceMappingURL=function.d.ts.map
//#endregion
//#region ../iterables/dist/src/chain/from/iterable.d.ts
/**
 * Creates a chain from an interable
 * @param it
 * @returns
 */
declare function iterable<Out>(it: Iterable<Out> | AsyncIterable<Out>): GenFactoryNoInput<Out>;
//# sourceMappingURL=iterable.d.ts.map

//#endregion
//#region ../iterables/dist/src/chain/from/ticks.d.ts
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
declare function timestamp(options: TickOptions): GenFactoryNoInput<number>;
//# sourceMappingURL=ticks.d.ts.map
declare namespace index_d_exports$25 {
  export { array, event, func, iterable, timestamp };
}
//#endregion
//#region ../iterables/dist/src/chain/add-to-array.d.ts
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
declare function addToArray<Out>(array: Out[], valueToWrap: AsyncGenerator<Out> | GenFactoryNoInput<Out>): Promise<void>;
//# sourceMappingURL=add-to-array.d.ts.map

//#endregion
//#region ../iterables/dist/src/chain/as-array.d.ts
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
declare function asArray<Out>(valueToWrap: AsyncGenerator<Out> | GenFactoryNoInput<Out>, options?: Partial<ToArrayOptions>): Promise<Out[]>;
//# sourceMappingURL=as-array.d.ts.map

//#endregion
//#region ../iterables/dist/src/chain/as-callback.d.ts
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
declare function asCallback$1<V>(valueToWrap: GenOrData<V> | GenFactoryNoInput<V>, callback: (v: V) => unknown, onDone?: () => void): Promise<void>;
//# sourceMappingURL=as-callback.d.ts.map
//#endregion
//#region ../iterables/dist/src/chain/as-promise.d.ts
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
declare function asPromise<V>(valueToWrap: AsyncGenerator<V> | GenFactoryNoInput<V>): () => Promise<V | undefined>;
//# sourceMappingURL=as-promise.d.ts.map

//#endregion
//#region ../iterables/dist/src/chain/as-value.d.ts
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
declare function asValue<V>(valueToWrap: AsyncGenerator<V> | GenFactoryNoInput<V>, initialValue?: V): () => V | undefined;
//# sourceMappingURL=as-value.d.ts.map
//#endregion
//#region ../iterables/dist/src/chain/combine-latest-to-array.d.ts
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
declare function combineLatestToArray(sources: (GenOrData<any> | GenFactoryNoInput<any>)[], options?: Partial<CombineLatestOptions>): AsyncGenerator<any[]>;
//# sourceMappingURL=combine-latest-to-array.d.ts.map
//#endregion
//#region ../iterables/dist/src/chain/combine-latest-to-object.d.ts
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
declare function combineLatestToObject<const T extends Record<string, GenOrData<any> | GenFactoryNoInput<any>>>(sources: T, options?: Partial<CombineLatestOptions>): AsyncGenerator<GenValueTypeObject<T>>;
//# sourceMappingURL=combine-latest-to-object.d.ts.map
//#endregion
//#region ../iterables/dist/src/chain/lazy.d.ts
declare function lazy<In, Out>(): LazyChain<In, Out>;
//# sourceMappingURL=lazy.d.ts.map

//#endregion
//#region ../iterables/dist/src/chain/merge-flat.d.ts
/**
 * Merge values from several sources into one stream, interleaving values.
 * When all streams are complete it finishes.
 *
 * Alternatively:
 * - {@link combineLatestToArray}/{@link combineLatestToObject} emits snapshots of all the generators, as quickly as the fastest one
 * - {@link syncToArray}/{@link syncToObject} which releases a set of results when all inputs have emitted a value
 * @param sources
 */
declare function mergeFlat<Out>(...sources: (GenOrData<any> | GenFactoryNoInput<any>)[]): AsyncGenerator<Out>;
//# sourceMappingURL=merge-flat.d.ts.map

//#endregion
//#region ../iterables/dist/src/chain/prepare.d.ts
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
declare function prepare<In, Out>(...functions: Links<In, Out>): (source: GenOrData<In> | GenFactoryNoInput<In>) => AsyncGenerator<Out, any, any>;
//# sourceMappingURL=prepare.d.ts.map

//#endregion
//#region ../iterables/dist/src/chain/run.d.ts
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
declare function runN<In, Out>(...functions: LinksWithSource<In, Out>): AsyncGenerator<Out>;
declare function run<T1>(gen: GenOrData<T1> | GenFactoryNoInput<T1>): AsyncGenerator<T1>;
declare function run<T1, T2>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>): AsyncGenerator<T2>;
declare function run<T1, T2, T3>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>): AsyncGenerator<T3>;
declare function run<T1, T2, T3, T4>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>, l2: Link<T3, T4>): AsyncGenerator<T4>;
declare function run<T1, T2, T3, T4, T5>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>, l2: Link<T3, T4>, l3: Link<T4, T5>): AsyncGenerator<T5>;
declare function run<T1, T2, T3, T4, T5, T6>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>, l2: Link<T3, T4>, l3: Link<T4, T5>, l4: Link<T5, T6>): AsyncGenerator<T6>;
declare function run<T1, T2, T3, T4, T5, T6, T7>(gen: GenOrData<T1> | GenFactoryNoInput<T1>, l0: Link<T1, T2>, l1: Link<T2, T3>, l2: Link<T3, T4>, l3: Link<T4, T5>, l4: Link<T5, T6>, l5: Link<T6, T7>): AsyncGenerator<T7>;
//# sourceMappingURL=run.d.ts.map
//#endregion
//#region ../iterables/dist/src/chain/single.d.ts
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
declare function single<In, Out>(f: Link<In, Out>, input: In): Promise<Out | undefined>;
//# sourceMappingURL=single.d.ts.map
//#endregion
//#region ../iterables/dist/src/chain/sync.d.ts
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
declare function syncToArray(sources: (GenOrData<any> | GenFactoryNoInput<any>)[], options?: Partial<SyncOptions>): AsyncGenerator<any[]>;
//# sourceMappingURL=sync.d.ts.map
//#endregion
//#region ../iterables/dist/src/chain/utility.d.ts
declare function isGenFactoryNoInput<Out>(c: any): c is GenFactoryNoInput<Out>;
/**
 * Resolve the array, data or function to a Generator
 * @param input
 * @returns
 */
declare function resolveToGen<V>(input: GenOrData<V> | GenFactoryNoInput<V>): Gen<V>;
/**
 * Resolve the data, primitive or function to an AsyncGenerator
 * @param input
 * @returns
 */
declare function resolveToAsyncGen<V>(input: GenOrData<V> | GenFactoryNoInput<V> | undefined): AsyncGenerator<V> | undefined;
//# sourceMappingURL=utility.d.ts.map
declare namespace index_d_exports$24 {
  export { CombineLatestOptions, DelayOptions, dom_d_exports as Dom, index_d_exports$25 as From, Gen, GenFactoryNoInput, GenOrData, GenValueTypeObject, LazyChain, Link, links_d_exports as Links, LinksWithSource, SyncOptions, TickOptions, addToArray, asArray, asCallback$1 as asCallback, asPromise, asValue, combineLatestToArray, combineLatestToObject, isGenFactoryNoInput, lazy, mergeFlat, prepare, resolveToAsyncGen, resolveToGen, run, runN, single, syncToArray };
}
//#endregion
//#region ../iterables/dist/src/compare-values.d.ts
/**
 * Returns the 'max' of some iterable using the provided scoring function.
 * It only yields a value when iterator finishes.
 * @param iterable
 * @param scorer
 * @returns
 */
declare const maxScore: <V>(iterable: Iterable<V>, scorer: (v: V) => number) => V | undefined;
/**
 * Returns the 'min' of some iterable using the provided scoring function.
 * It only yields a value when iterator finishes.
 * @param iterable
 * @param scorer
 * @returns
 */
declare const minScore: <V>(iterable: Iterable<V>, scorer: (v: V) => number) => V | undefined;
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
declare const hasEqualValuesShallow: <V>(iterableA: Iterable<V>, iterableB: Iterable<V>, eq?: IsEqual<V>) => boolean;
//# sourceMappingURL=compare-values.d.ts.map
//#endregion
//#region ../iterables/dist/src/controller.d.ts
type IteratorController = {
  get state(): IteratorControllerState;
  /**
   * Starts 'playback' of the iterator.
   * If already started, this does nothing.
   * If paused, continues playback.
   * Use {@link restart} if you want to start with a reset.
   * @returns
   */
  start: () => void;
  /**
   * Starts or restarts 'playback' of the iterator.
   * @returns
   */
  restart: () => void;
  /**
   * Pauses 'playback' of the iterator.
   * If already paused, does nothing.
   * Use {@link start} to resume.
   * @returns
   */
  pause: () => void;
  /**
   * Cancels the running timer. This will
   * stop playback, and next time {@link start}
   * is called, it will be from the beginning.
   * @returns
   */
  cancel: () => void;
};
/**
 * Retrieve values from an iterator, passing them to a callback.
 * Allows iterator to be started, paused, or restarted and an optional delay between reading items from iterator.
 * @param options
 * @returns
 */
declare const iteratorController: <T>(options: IteratorControllerOptions<T>) => IteratorController;
//# sourceMappingURL=controller.d.ts.map
//#endregion
//#region ../iterables/dist/src/from-event.d.ts
declare const fromEvent: <V>(eventSource: WithEvents, eventType: string) => AsyncIterator<any>;
//# sourceMappingURL=from-event.d.ts.map
//#endregion
//#region ../iterables/dist/src/guard.d.ts
declare const isAsyncIterable: (v: any) => v is AsyncIterable<any>;
declare const isIterable: (v: any) => v is Iterable<any>;
//# sourceMappingURL=guard.d.ts.map

//#endregion
//#region ../iterables/dist/src/numbers-compute.d.ts
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
declare const numbersCompute: (data: readonly number[] | number[] | Iterable<number>, options?: NumbersComputeOptions) => NumbersComputeResult;
declare function computeAverage(data: Iterable<number>, options?: NumbersComputeOptions): number;
//# sourceMappingURL=numbers-compute.d.ts.map
declare namespace index_d_exports$17 {
  export { async_d_exports as Async, index_d_exports$24 as Chains, ForEachOptions, IteratorController, IteratorControllerOptions, IteratorControllerState, sync_d_exports as Sync, ToArrayOptions, WithEvents, asCallback, chunks, combineLatestToArray, combineLatestToObject, computeAverage, concat, dropWhile, equals, every, fill, filter, find, flatten, forEach, fromArray, fromEvent, fromFunction, fromFunctionAwaited, fromIterable, hasEqualValuesShallow, isAsyncIterable, isIterable, iteratorController, last, map, max, maxScore, min, minScore, numbersCompute, reduce, slice, some, toArray, unique$1 as unique, uniqueByValue, until, zip };
}
declare function min<V>(it: AsyncIterable<V>, gt?: (a: V, b: V) => boolean): AsyncGenerator<V>;
declare function min<V>(it: Iterable<V>, gt?: (a: V, b: V) => boolean): Generator<V>;
declare function max<V>(it: AsyncIterable<V>, gt?: (a: V, b: V) => boolean): AsyncGenerator<V>;
declare function max<V>(it: Iterable<V>, gt?: (a: V, b: V) => boolean): Generator<V>;
declare function dropWhile<V>(it: AsyncIterable<V>, f: (v: V) => boolean): AsyncGenerator<V>;
declare function dropWhile<V>(it: Iterable<V>, f: (v: V) => boolean): Generator<V>;
declare function until(it: AsyncIterable<any>, f: () => Promise<boolean> | Promise<undefined>): Promise<undefined>;
declare function until(it: Iterable<any>, f: () => boolean | never): void;
declare function until(it: Iterable<any>, f: () => Promise<boolean>): Promise<undefined>;
declare function chunks<V>(it: Iterable<V>, size: number): Generator<V[]>;
declare function chunks<V>(it: AsyncIterable<V>, size: number): AsyncGenerator<V[]>;
declare function filter<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): AsyncGenerator<V>;
declare function filter<V>(it: AsyncIterable<V>, f: (v: V) => boolean): Generator<V>;
declare function fill<V>(it: AsyncIterable<V>, v: V): AsyncGenerator<V>;
declare function fill<V>(it: Iterable<V>, v: V): Generator<V>;
declare function concat<V>(...its: Iterable<V>[]): Generator<V>;
declare function concat<V>(...its: AsyncIterable<V>[]): AsyncGenerator<V>;
declare function find<V>(it: V[] | Iterable<V>, f: (v: V) => boolean): V | undefined;
declare function find<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<V | undefined>;
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
declare function forEach<T>(it: T[] | AsyncIterable<T> | Iterable<T>, fn: (v: T | undefined) => boolean | Promise<boolean> | void | Promise<void>, options?: Partial<ForEachOptions>): Promise<void> | undefined;
declare function map<V, X>(it: AsyncIterable<V>, f: (v: V) => Promise<X> | X): Generator<X>;
declare function map<V, X>(it: V[] | Iterable<V>, f: (v: V) => X): Generator<X>;
declare function fromArray<V>(array: V[], interval: Interval): AsyncGenerator<V>;
declare function fromArray<V>(array: V[]): Generator<V>;
declare function flatten<V>(it: AsyncIterable<V[] | V>): AsyncIterable<V>;
declare function flatten<V>(it: Iterable<V[] | V> | V[]): Iterable<V>;
declare function some<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<boolean>;
declare function some<V>(it: Iterable<V> | V[], f: (v: V) => boolean): boolean;
declare function last<V>(it: AsyncIterable<V>): Promise<V | undefined>;
declare function last<V>(it: Iterable<V>): V;
declare function reduce<V>(it: AsyncIterable<V>, f: (accumulator: V, current: V) => V, start: V): Promise<V>;
declare function reduce<V>(it: Iterable<V> | V[], f: (accumulator: V, current: V) => V, start: V): V;
declare function slice<V>(it: AsyncIterable<V>, start?: number, end?: number): AsyncGenerator<V>;
declare function slice<V>(it: Iterable<V> | V[], start?: number, end?: number): Generator<V>;
declare function unique$1<V>(iterable: Iterable<V> | Iterable<V>[]): Generator<V>;
declare function unique$1<V>(iterable: AsyncIterable<V> | AsyncIterable<V>[]): AsyncGenerator<V>;
declare function uniqueByValue<T>(input: Iterable<T> | T[], toString: (v: T) => string, seen?: Set<string>): Generator<T>;
declare function uniqueByValue<T>(input: AsyncIterable<T>, toString: (v: T) => string, seen?: Set<string>): AsyncGenerator<T>;
declare function toArray<V>(it: AsyncIterable<V>, options?: Partial<ToArrayOptions>): Promise<V[]>;
declare function toArray<V>(it: Iterable<V>, options?: Partial<ToArrayOptions>): V[];
declare function every<V>(it: Iterable<V> | V[], f: (v: V) => boolean): boolean;
declare function every<V>(it: AsyncIterable<V>, f: (v: V) => boolean | Promise<boolean>): Promise<boolean>;
declare function equals<V>(it1: AsyncIterable<V>, it2: AsyncIterable<V>, equality?: (a: V, b: V) => boolean): Promise<boolean>;
declare function equals<V>(it1: IterableIterator<V>, it2: IterableIterator<V>, equality?: (a: V, b: V) => boolean): boolean;
declare function zip<V>(...its: readonly AsyncIterable<V>[]): Generator<V[]>;
declare function zip<V>(...its: readonly Iterable<V>[]): Generator<V>;
declare function fromIterable<V>(iterable: Iterable<V>): Generator<V>;
declare function fromIterable<V>(iterable: AsyncIterable<V> | Iterable<V>, interval: Interval): AsyncGenerator<V>;
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
declare function fromFunction<T>(callback: () => T): Generator<T, void, unknown>;
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
declare function fromFunctionAwaited<T>(callback: () => Promise<T> | T): AsyncGenerator<Awaited<T>, void, unknown>;
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
declare function asCallback<V>(input: AsyncIterable<V> | Iterable<V>, callback: (v: V) => unknown, onDone?: () => void): Promise<void> | undefined;
//# sourceMappingURL=index.d.ts.map
//#endregion
//#region ../io/dist/src/codec.d.ts
/**
 * Handles utf-8 text encoding/decoding
 */
declare class Codec {
  enc: TextEncoder;
  dec: TextDecoder;
  /**
   * Convert string to Uint8Array buffer
   * @param text
   * @returns
   */
  toBuffer(text: string): Uint8Array<ArrayBufferLike>;
  /**
   * Returns a string from a provided buffer
   * @param buffer
   * @returns
   */
  fromBuffer(buffer: AllowSharedBufferSource): string;
}
//# sourceMappingURL=codec.d.ts.map
//#endregion
//#region ../io/dist/src/string-receive-buffer.d.ts
/**
 * Receives text
 */
declare class StringReceiveBuffer {
  private onData;
  separator: string;
  buffer: string;
  stream: WritableStream<string> | undefined;
  constructor(onData: (data: string) => void, separator?: string);
  close(): Promise<void>;
  clear(): void;
  writable(): WritableStream<string>;
  private createWritable;
  addImpl(string_: string): string;
  add(string_: string): void;
}
//# sourceMappingURL=string-receive-buffer.d.ts.map
//#endregion
//#region ../io/dist/src/string-write-buffer.d.ts
type Opts = {
  readonly chunkSize?: number;
  readonly interval?: Interval;
};
/**
 * Buffers a queue of strings.
 *
 * When text is queued via {@link add}, it is chopped up
 * into chunks and sent in serial to the `dataHandler` function.
 * Data is processed at a set rate, by default 10ms.
 *
 * ```js
 * const dataHandler = (data:string) => {
 *  // Do something with queued data.
 *  // eg. send to serial port
 * }
 *
 * // Create a buffer with a chunk size of 100 characters
 * const b = new StringWriteBuffer(dataHandler, { chunkSize: 100 });
 * b.add('some text'); // Write to buffer
 * // dataHandler will be called until queued data is empty
 * ```
 *
 * It's also possible to get the buffer as a WritableStream<string>:
 * ```js
 * const dataHandler = (data:string) => { ... }
 * const b = new StringWriteBuffer(dataHandler, 100);
 * const s = b.writable();
 * ```
 *
 * Other functions:
 * ```js
 * b.close(); // Close buffer
 * b.clear(); // Clear queued data, but don't close anything
 * ```
 */
declare class StringWriteBuffer {
  private dataHandler;
  paused: boolean;
  queue: QueueMutable<string>;
  writer: Continuously;
  stream: WritableStream<string> | undefined;
  closed: boolean;
  chunkSize: number;
  /**
   * Constructor
   * @param dataHandler Calback to 'send' data onwards
   * @param opts Options
   */
  constructor(dataHandler: (data: string) => Promise<void>, opts?: Opts);
  /**
   * Close writer (async)
   */
  close(): Promise<void>;
  /**
   * Clear queued data.
   *
   * Throws an error if {@link close} has been called.
   */
  clear(): void;
  /**
   * Gets the buffer as a writable stream.
   *
   * Do not close stream directly, use .close on this class instead.
   *
   * Throws an error if .close() has been called.
   * @returns Underlying stream
   */
  writable(): WritableStream<string>;
  private createWritable;
  /**
   * Run in a `continunously` loop to process queued data
   * @returns _False_ if queue is empty and loop should stop. _True_ if it shoud continue.
   */
  onWrite(): Promise<boolean>;
  /**
   * Returns _true_ if {@link close} has been called.
   */
  get isClosed(): boolean;
  /**
   * Adds some queued data to send.
   * Longer strings are automatically chunked up according to the buffer's settings.
   *
   * Throws an error if {@link close} has been called.
   * @param stringToQueue
   */
  add(stringToQueue: string): void;
}
//# sourceMappingURL=string-write-buffer.d.ts.map
//#endregion
//#region ../io/dist/src/generic-state-transitions.d.ts
declare const genericStateTransitionsInstance: Readonly<{
  ready: "connecting";
  connecting: string[];
  connected: string[];
  closed: "connecting";
}>;
//# sourceMappingURL=generic-state-transitions.d.ts.map
//#endregion
//#region ../io/dist/src/types.d.ts
type IoDataEvent = {
  readonly data: string;
};
type IoEvents<StateMachineTransitions extends Transitions> = {
  readonly data: IoDataEvent;
  readonly change: StateChangeEvent<StateMachineTransitions>;
};
type GenericStateTransitions = Readonly<typeof genericStateTransitionsInstance>;
type BleDeviceOptions = {
  readonly service: string;
  readonly rxGattCharacteristic: string;
  readonly txGattCharacteristic: string;
  readonly chunkSize: number;
  readonly name: string;
  readonly connectAttempts: number;
  readonly debug: boolean;
};
type FrameProcessorSources = `` | `camera` | `video`;
//# sourceMappingURL=types.d.ts.map
//#endregion
//#region ../io/dist/src/ble-device.d.ts
declare class BleDevice extends SimpleEventEmitter<IoEvents<GenericStateTransitions>> {
  private device;
  private config;
  states: StateMachineWithEvents<GenericStateTransitions>;
  codec: Codec;
  rx: BluetoothRemoteGATTCharacteristic | undefined;
  tx: BluetoothRemoteGATTCharacteristic | undefined;
  gatt: BluetoothRemoteGATTServer | undefined;
  verboseLogging: boolean;
  rxBuffer: StringReceiveBuffer;
  txBuffer: StringWriteBuffer;
  constructor(device: BluetoothDevice, config: BleDeviceOptions);
  get isConnected(): boolean;
  get isClosed(): boolean;
  write(txt: string): void;
  private writeInternal;
  disconnect(): void;
  connect(): Promise<void>;
  private onRx;
  protected verbose(m: string): void;
  protected log(m: string): void;
  protected warn(m: unknown): void;
}
//# sourceMappingURL=ble-device.d.ts.map
declare namespace nordic_ble_device_d_exports {
  export { NordicBleDevice, Opts$2 as Opts, defaultOpts };
}
declare const defaultOpts: {
  chunkSize: number;
  service: string;
  txGattCharacteristic: string;
  rxGattCharacteristic: string;
  name: string;
  connectAttempts: number;
  debug: boolean;
};
type Opts$2 = {
  readonly chunkSize?: number;
  readonly name?: string;
  readonly connectAttempts?: number;
  readonly debug?: boolean;
};
declare class NordicBleDevice extends BleDevice {
  constructor(device: BluetoothDevice, opts?: Opts$2);
}
//# sourceMappingURL=nordic-ble-device.d.ts.map
//#endregion
//#region ../io/dist/src/audio/visualiser.d.ts
declare class AudioVisualiser {
  freqMaxRange: number;
  audio: AudioAnalyser;
  parent: HTMLElement;
  lastPointer: Point;
  pointerDown: boolean;
  pointerClicking: boolean;
  pointerClickDelayMs: number;
  pointerDelaying: boolean;
  waveTracker: any;
  freqTracker: any;
  el: HTMLElement;
  constructor(parentElement: HTMLElement, audio: AudioAnalyser);
  renderFreq(freq: readonly number[]): void;
  isExpanded(): boolean;
  setExpanded(value: boolean): void;
  clear(): void;
  clearCanvas(canvas: HTMLCanvasElement | null): void;
  renderWave(wave: readonly number[], bipolar?: boolean): void;
  getPointerRelativeTo(elem: HTMLElement): {
    x: number;
    y: number;
  };
  onPointer(event: MouseEvent | PointerEvent): void;
}
//# sourceMappingURL=visualiser.d.ts.map
//#endregion
//#region ../io/dist/src/audio/analyser.d.ts
/**
 * Options for audio processing
 *
 * fftSize: Must be a power of 2, from 32 - 32768. Higher number means
 * more precision and higher CPU overhead
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
 *
 * smoothingTimeConstant: Range from 0-1, default is 0.8.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant
 *
 * debug: If true, additonal console logging will happen
 */
type Opts$1 = {
  readonly showVis?: boolean;
  /**
   * FFT size. Must be a power of 2, from 32 - 32768. Higher number means
   * more precision and higher CPU overhead
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
   */
  readonly fftSize?: number;
  /**
   * Range from 0-1, default is 0.8
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant
   */
  readonly smoothingTimeConstant?: number;
  readonly debug?: boolean;
};
type DataAnalyser = (node: AnalyserNode, analyser: AudioAnalyser) => void;
/**
 * Basic audio analyser. Returns back waveform and FFT analysis. Use {@link analyserPeakLevel} if you want sound level, or {@link analyserFrequency} if you just want FFT results.
 *
 * ```js
 * const onData = (freq, wave, analyser) => {
 *  // Demo: Get FFT results just for 100Hz-1KHz.
 *  const freqSlice = analyser.sliceByFrequency(100,1000,freq);
 *
 *  // Demo: Get FFT value for a particular frequency (1KHz)
 *  const amt = freq[analyser.getIndexForFrequency(1000)];
 * }
 * analyserBasic(onData, {fftSize: 512});
 * ```
 *
 * An `Analyser` instance is returned and can be controlled:
 * ```js
 * const analyser = analyserBasic(onData);
 * analyser.paused = true;
 * ```
 *
 * Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
 *
* @param onData Handler for data
 * @param opts Options
 * @returns Analyser instance
 */
declare const analyserBasic: (onData: (freq: Float32Array, wave: Float32Array, analyser: AudioAnalyser) => void, opts?: Opts$1) => AudioAnalyser;
/**
 * Basic audio analyser. Returns FFT analysis. Use {@link analyserPeakLevel} if you want the sound level, or {@link analyserBasic} if you also want the waveform.
 *
 * ```js
 * const onData = (freq, analyser) => {
 *  // Demo: Print out each sound frequency (Hz) and amount of energy in that band
 *  for (let i=0;i<freq.length;i++) {
 *    const f = analyser.getFrequencyAtIndex(0);
 *    console.log(`${i}. frequency: ${f} amount: ${freq[i]}`);
 *  }
 * }
 * analyserFrequency(onData, {fftSize:512});
 * ```
 *
 * Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
 *
 * @param onData
 * @param opts
 * @returns
 */
declare const analyserFrequency: (onData: (freq: Float32Array, analyser: AudioAnalyser) => void, opts?: Opts$1) => AudioAnalyser;
/**
 * Basic audio analyser which reports the peak sound level.
 *
 * ```js
 * analyserPeakLevel(level => {
 *  console.log(level);
 * });
 * ```
 *
 * Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
 * @param onData
 * @param opts
 * @returns
 */
declare const analyserPeakLevel: (onData: (level: number, analyser: AudioAnalyser) => void, opts?: Opts$1) => AudioAnalyser;
/**
 * Helper for doing audio analysis. It takes case of connecting the audio stream, running in a loop and pause capability.
 *
 * Provide a function which works with an [AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode), and does something with the result.
 * ```js
 * const myAnalysis = (node, analyser) => {
 *  const freq = new Float32Array(node.frequencyBinCount);
 *  node.getFloatFrequencyData(freq);
 *  // Do something with frequency data...
 * }
 * const a = new Analyser(myAnalysis);
 * ```
 *
 * Helper functions provide ready-to-use Analysers:
 * * {@link analyserPeakLevel} peak decibel reading
 * * {@link analyserFrequency} FFT results
 * * {@link analyserBasic} FFT results and waveform
 *
 * Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
 *
 */
declare class AudioAnalyser {
  #private;
  showVis: boolean;
  fftSize: number;
  smoothingTimeConstant: number;
  debug: boolean;
  visualiser: AudioVisualiser | undefined;
  audioCtx: AudioContext | undefined;
  analyserNode: AnalyserNode | undefined;
  analyse: DataAnalyser;
  constructor(analyse: DataAnalyser, opts?: Opts$1);
  init(): void;
  get paused(): boolean;
  set paused(v: boolean);
  private setup;
  private onMicSuccess;
  private analyseLoop;
  /**
   * Returns the maximum FFT value within the given frequency range
   */
  getFrequencyRangeMax(lowFreq: number, highFreq: number, freqData: readonly number[]): number;
  /**
   * Returns a sub-sampling of frequency analysis data that falls between
   * `lowFreq` and `highFreq`.
   * @param lowFreq Low frequency
   * @param highFreq High frequency
   * @param freqData Full-spectrum frequency data
   * @returns Sub-sampling of analysis
   */
  sliceByFrequency(lowFreq: number, highFreq: number, freqData: readonly number[]): number[];
  /**
   * Returns the starting frequency for a given binned frequency index.
   * @param index Array index
   * @returns Sound frequency
   */
  getFrequencyAtIndex(index: number): number;
  /**
   * Returns a binned array index for a given frequency
   * @param freq Sound frequency
   * @returns Array index into frequency bins
   */
  getIndexForFrequency(freq: number): number;
}
//# sourceMappingURL=analyser.d.ts.map
//#endregion
//#region ../io/dist/src/audio/types.d.ts
type AudioOscillatorOptions = {
  type: OscillatorType;
  frequency: number;
  id: string;
};
type BasicAudio = {
  ctx: AudioContext;
  pan: StereoPannerNode;
  gain: GainNode;
  filter: BiquadFilterNode;
  id: string;
};
type BasicAudioElement = BasicAudio & {
  el: HTMLMediaElement;
};
type BasicAudioOscillator = BasicAudio & {
  osc: OscillatorNode;
};
//# sourceMappingURL=types.d.ts.map
//#endregion
//#region ../io/dist/src/audio/from-audio-element.d.ts
/**
 * Scans page for <AUDIO> elements and creates playable controllers for them.
 * It uses the element's 'id' attribute as a way of fetching one later.
 *
 * ```js
 * const ae = new AudioElements();
 * ae.init(); // Initialise
 *
 * const a = ae.get('kick'); // Get the source that had id 'kick'
 * ```
 */
declare class AudioElements {
  #private;
  filterType: BiquadFilterType;
  constructor();
  init(): void;
  /**
   * Gets a BasicAudio instance by key
   * @param key
   * @returns BasicAudio instance, or undefined
   */
  get(key: string): BasicAudioElement | undefined;
}
/**
 * Create a BasicAudioElement instance from an <AUDIO> tag in the HTML document.
 *
 * See {@link AudioElements} to automatically create sources from all <AUDIO> elements.
 * @param audioElementOrQuery Element or query (eg '#some-id')
 * @param filterType Filter type. Defaults to 'lowpass'
 * @returns
 */
declare function createFromAudioElement(audioElementOrQuery: HTMLMediaElement | string, filterType?: BiquadFilterType): BasicAudioElement;
//# sourceMappingURL=from-audio-element.d.ts.map
//#endregion
//#region ../io/dist/src/audio/from-oscillator.d.ts
/**
 * Initialise audio with an oscillator source
 * @param oscillatorOptions
 * @returns BasicAudio instance
 */
declare function createOscillator(oscillatorOptions?: Partial<AudioOscillatorOptions>): BasicAudioOscillator;
//# sourceMappingURL=from-oscillator.d.ts.map
declare namespace index_d_exports$22 {
  export { AudioAnalyser, AudioElements, AudioOscillatorOptions, AudioVisualiser, BasicAudio, BasicAudioElement, BasicAudioOscillator, DataAnalyser, Opts$1 as Opts, analyserBasic, analyserFrequency, analyserPeakLevel, createFromAudioElement, createOscillator };
}
//#endregion
//#region ../io/dist/src/midi/types.d.ts
type MidiCommands = 'noteon' | 'noteoff' | 'pitchbend' | 'cc' | 'poly-at' | 'progchange' | 'at';
type MidiMessage = {
  command: MidiCommands;
  channel: number;
  note: number;
  velocity: number;
};
type NoteMidiMessage = MidiMessage & {
  command: `noteon` | `noteoff`;
  noteName: string;
  frequency: number;
};
//# sourceMappingURL=types.d.ts.map
//#endregion
//#region ../io/dist/src/midi/midi-fns.d.ts
/**
 * Sends a note on and note off
 * @param port
 * @param channel
 * @param note
 * @param velocity
 * @param duration
 * @param delay
 */
declare const sendNote: (port: MIDIOutput, channel: number, note: number, velocity: number, duration?: number, delay?: DOMHighResTimeStamp) => void;
/**
 * Parses MIDI data from an array into a MidiMessage
 *
 * ```js
 * function onMidiMessage(event: MIDIMessageEvent) {
 *  const msg = unpack(event.data);
 *  // { command, channel, note, velocity }
 * }
 *
 * // Where 'input' is a MIDIInput
 * input.addEventListener(`midimessage`, onMidiMessage);
 * ```
 * @param data
 * @returns
 */
declare const unpack: (data: Uint8Array) => MidiMessage;
/**
 * Packs a MidiMessage into an array for sending to a MIDIOutput.
 *
 * ```js
 * const msg: Midi.MidiMessage = {
 *  command: `cc`,
 *  channel: 1,
 *  velocity: 50,
 *  note: 40
 * }
 *
 * // Where 'output' is a MIDIOutput
 * output.send(pack(msg));
 * ```
 * @param message
 * @returns
 */
declare const pack: (message: MidiMessage) => Uint8Array;
//# sourceMappingURL=midi-fns.d.ts.map
//#endregion
//#region ../io/dist/src/midi/manager.d.ts
type MidiManagerState = {
  initialised: boolean;
  errorReason: string;
};
type MidiManagerEvents = {
  open: {
    port: MIDIPort;
  };
  close: {
    port: MIDIPort;
  };
  deviceConnected: {
    port: MIDIPort;
  };
  deviceDisconnected: {
    port: MIDIPort;
  };
  message: (MidiMessage | NoteMidiMessage) & {
    port: MIDIInput;
    raw: Uint8Array;
  };
};
/**
 * Midi Manager makes simplifies connecting to ports
 * and having omni input/output
 *
 * ```js
 * const midi = new MidiManager(); // By default connects to all ins and outs
 * midi.addEventListener(`message`, event => {
 *  // Do something with received MIDI data from any input
 * })
 *
 * midi.scan();
 * midi.send({ command: `cc`, note: 10, channel: 1, velocity: 20 });
 *
 * // Sends note '10' on channel 1, velocity 100, duration 200ms
 * midi.sendNote(1, 10, 100, 200);
 * ```
 * Events:
 * * open/close: Connected port is open/closed
 * * deviceConnected/deviceDisconnected: A port is newly available or unavailable
 * * message: MIDI event received
 */
declare class MidiManager extends SimpleEventEmitter<MidiManagerEvents> {
  #private;
  verbose: boolean;
  constructor();
  getInUse(): Generator<MIDIPort, void, unknown>;
  getInUseInput(): Generator<MIDIInput, void, unknown>;
  getInUseOutput(): Generator<MIDIOutput, void, unknown>;
  known(): Generator<MIDIPort, void, unknown>;
  knownInput(): Generator<MIDIInput, void, unknown>;
  knownOutput(): Generator<MIDIOutput, void, unknown>;
  scan(): Promise<void>;
  /**
   * Sends a message to a port.
   *
   * If port is omitted, all open output ports are used.
   * @param message
   * @param port
   * @param timestamp
   */
  send(message: MidiMessage, port?: MIDIOutput, timestamp?: DOMHighResTimeStamp): void;
  sendNote(channel: number, note: number, velocity: number, duration: number, delay?: DOMHighResTimeStamp, port?: MIDIOutput): void;
  closeAll(what?: `input` | `output` | `both`): Promise<void>;
  setOmniInput(value: boolean): Promise<void>;
  get omniInput(): boolean;
  setOmniOutput(value: boolean): Promise<void>;
  get omniOutput(): boolean;
  dumpToStringLines(): string[];
  /**
   * Opens `port`.
   *
   * If `exclusive` is _true_, all other ports of that type
   * (ie. input or output) are closed before the port is opened.
   *
   * If `exclusive` is _false_ (default), already open ports are left open.
   * @param port
   * @param exclusive
   */
  open(port: MIDIPort, exclusive?: boolean): Promise<void>;
  findKnownPort(fn: (p: MIDIPort) => boolean): MIDIPort | undefined;
  filterKnownPort(fn: (p: MIDIPort) => boolean): Generator<MIDIPort, void, unknown>;
  findInUsePort(fn: (p: MIDIPort) => boolean): MIDIPort | undefined;
  filterInUsePort(fn: (p: MIDIPort) => boolean): Generator<MIDIPort, void, unknown>;
}
//# sourceMappingURL=manager.d.ts.map
//#endregion
//#region ../io/dist/src/midi/control.d.ts
type ControlEvents = {
  change: {
    velocity: number;
    velocityScaled: number;
    control: Control;
  };
};
declare class Feedback {
  channel: number;
  cc: number;
  note: number;
  output?: MIDIOutput;
  portName?: string;
  constructor(options?: Partial<{
    channel: number;
    cc: number;
    note: number;
    output: MIDIOutput;
    portName: string;
  }>);
  setOutputPort(port: MIDIPort): boolean;
  sendRaw(value: number): boolean;
}
declare class Control extends SimpleEventEmitter<ControlEvents> {
  #private;
  static controlCount: number;
  inputChannel: number;
  inputCommand?: MidiCommands;
  inputNote: number;
  inputVelocityScale: number[];
  feedbackChannel: number;
  feedbackCommand?: MidiCommands;
  feedbackNote: number;
  feedbackVelocity: number;
  name: string;
  lastMessage?: MidiMessage;
  onInputMessage(message: MidiMessage): boolean;
  get scaledVelocity(): number;
}
//# sourceMappingURL=control.d.ts.map
//#endregion
//#region ../io/dist/src/midi/midi-fighter.d.ts
/**
 * Events fired by a {@link MidiFighter}} instance
 */
type MidiFighterEvents = {
  /**
   * Virtual bank has changed
   */
  bankChange: {
    prev: number;
    current: number;
    mf: MidiFighter;
    implicit: boolean;
  };
  /**
   * A side button has been pressed
   */
  sideButton: {
    position: `top` | `bottom`;
    side: `left` | `right`;
    bank: number;
    mf: MidiFighter;
  };
  /**
   * An encoder has been pressed
   */
  switch: {
    previous: number;
    encoder: MidiFighterEncoder;
    value: number;
  };
  /**
   * An encoder has been changed
   */
  encoder: {
    previous: number;
    encoder: MidiFighterEncoder;
    value: number;
  };
  /**
   * Connection state changed
   */
  state: {
    previous: MidiFighterState;
    state: MidiFighterState;
    mf: MidiFighter;
  };
};
/**
 * Events of a {@link MidiFighterEncoder}
 */
type MidiFighterEncoderEvents = {
  switch: {
    previous: number;
    encoder: MidiFighterEncoder;
    value: number;
  };
  encoder: {
    previous: number;
    encoder: MidiFighterEncoder;
    value: number;
  };
};
/**
 * States for a {@link MidiFighter} instance
 */
type MidiFighterState = `ready` | `disconnected`;
/**
 * Connects to a DJ Tech Tools Midi Fighter controller.
 *
 * Use the 'state' event and wait for state to be 'ready'.
 *
 * ```js
 * const mf = new MidiFighter();
 * mf.addEventListener(`state`, event => {
 *  if (event.state === `ready`) {
 *    // Can work with device now
 *    mf.bank = 1;
 *  }
 * });
 * mf.addEventListener(`encoder`, event => {
 *  // Do something with encoder value
 * });
 * mf.setPort(someMidiInputPort);
 * mf.setPort(someMidiOutputPort);
 * ```
 * Assumes default settings are loaded on the controller
 *
 * Supports
 * * Listening for encoder moves and button presses
 * * Changing colour pip below each encoder
 * * Setting LED bar for each encoder
 * * Changing banks, or detecting when the user has done so via the physical buttons
 *
 * Events:
 * * bankChange: Current bank has changed
 * * sideButton: Side button pressed
 * * switch: Encoder has been pressed
 * * encoder: Encoder has been moved
 * * state: Midi Fighter has both input/output ports or not.
 */
declare class MidiFighter extends SimpleEventEmitter<MidiFighterEvents> {
  #private;
  readonly encoders: MidiFighterEncoder[];
  /**
   * If true, messages sent to Midi Fighter are printed to console
   */
  logOutgoing: boolean;
  /**
   * Channel bank change events are received on
   */
  bankChangeChannel: number;
  /**
   * Channel side button press events are received on
   */
  sideButtonChannel: number;
  constructor();
  /**
   * Sets a port for this instance to use.
   * This will need to be called separately for the input and output ports
   * @param port
   */
  setPort(port: MIDIPort): void;
  /**
   * Sets the current bank (1..4)
   *
   * Triggers `bankChange` event.
   */
  set bank(bank: number);
  /**
   * Gets the current bank number (1-4)
   */
  get bank(): number;
  /**
   * Yields all encooders within the specified bank number.
   * If no bank number is given, current bank is used
   * @param bank
   */
  getBank(bank?: number): Generator<MidiFighterEncoder, void, unknown>;
  /**
   * Gets an encoder by its index and bank. If no bank is specified,
   * the current is used.
   *
   * ```js
   * mf.getEncoder(4);    // Get encoder #4 on current bank
   * mf.getEncoder(4, 2); // Get encoder #4 from bank #2
   * ```
   * @param encoder Encoder number (1..16)
   * @param bank Bank number (1..4)
   * @returns Encoder
   */
  getEncoder(encoder: number, bank?: number): MidiFighterEncoder | undefined;
  /**
   * Sends a message to the output port associated with this instance.
   * If there's no output port, message is dropped and _false_ returned.
   * @param message
   */
  send(message: MidiMessage): boolean;
  /**
   * Gets the current output port
   */
  get outputPort(): MIDIOutput | undefined;
  /**
   * Gets the current input port
   */
  get inputPort(): MIDIInput | undefined;
  /**
  * Returns the current state
  */
  get state(): MidiFighterState;
}
/**
 * Represents a single encoder.
 */
declare class MidiFighterEncoder extends SimpleEventEmitter<MidiFighterEncoderEvents> {
  readonly mf: MidiFighter;
  /**
   * Bank (1..4) of encoder
   */
  readonly bank: number;
  /**
   * Encoder index (1..16)
   */
  readonly encoder: number;
  /**
   * Note/CC for received encoder values
   */
  inputEncoderNoteOrCc: number;
  /**
   * Midi channel for received encoder values
   */
  inputEncoderChannel: number;
  /**
   * Midi channel for received switch values
   */
  inputSwitchChannel: number;
  /**
   * Note/CC for received switch values
   */
  inputSwitchNoteOrCc: number;
  /**
   * Channel to change LED effect (eg strobe)
   */
  ledEffectChannel: number;
  /**
   * Channel to change LED colour
   */
  ledColourChannel: number;
  /**
   * Channel to change LED ring value
   */
  ledRingChannel: number;
  /**
   * Note for this encoder.
   */
  encoderStaticNote: number;
  /**
   * The last encoder value received
   */
  lastEncoderValue: number;
  /**
   * The last switch value received
   */
  lastSwitchValue: number;
  /**
   * Do not create yourself. Access via a {@link MidiFighter} instance.
   * @private
   * @param mf
   * @param options
   */
  constructor(mf: MidiFighter, options: {
    bank: number;
    encoder: number;
  });
  /**
   * Called by a {@link MidiFighter} instance when a value is received associated with this encoder.
   * Do not call directly
   * @private
   * @param value
   */
  onValueSet(value: number): void;
  /**
   * Called by a {@link MidiFighter} instance when the switch value for this encoder changes
   * @private
   * @param value
   */
  onSwitchSet(value: number): void;
  /**
   * Set a scalar LED ring value (0..1).
   *
   * ```js
   * encoder.setLedRing(0.5); // Set to 50%
   * ```
   * Use {@link setLedRingRaw} to set 0..127 integer value
   * @param v Scalar (0..1)
   */
  setLedRing(v: number): void;
  /**
   * Sets the raw (0..127) value for the LED ring feedback. Use {@link setLedRing} for scalar values (0..1)
   *
   * ```js
   * encoder.setLedRingRaw(50);
   * ```
   *
   * @param v Raw value (0..127)
   */
  setLedRingRaw(v: number): void;
  /**
   * Sets the switch colour based on a 0..1 standard hue degree
   * ```js
   * const hsl = Colour.HslSpace.fromCss(`orange`);
   * encoder.setSwitchColourHue(hsl.hue);
   * ```
   * @param v Hue degree (0..1) range
   */
  setSwitchColourHue(v: number): void;
  /**
   * Set the switch colour based on 0..127 Midi Fighter range (start/end in blue).
   * Use {@link setSwitchColourHue} to set colour based on hue angle instead
   *
   * See page 4 of the MF manual.
   * @param v
   * @returns
   */
  setSwitchColourRaw(v: number): void;
  /**
   * Set the effect of the colour pip
   * ```js
   * encoder.setSwitchEffect(`strobe`, 3);
   * ```
   * @param kind
   * @param value
   */
  setSwitchEffect(kind: `none` | `strobe` | `pulse` | `rainbow`, value?: number): void;
}
//# sourceMappingURL=midi-fighter.d.ts.map
//#endregion
//#region ../io/dist/src/midi/notes.d.ts
type ParsedNote = [noteNumber: number, name: string, frequency: number];
declare const getParsedNotes: () => ParsedNote[];
declare const noteNameToNumber: (name: string) => number;
declare const noteNameToFrequency: (name: string) => number;
declare const noteNumberToName: (number: number) => string;
declare const noteNumberToFrequency: (number: number) => number;
declare namespace index_d_exports$23 {
  export { Control, ControlEvents, Feedback, MidiCommands, MidiFighter, MidiFighterEncoder, MidiFighterEncoderEvents, MidiFighterEvents, MidiFighterState, MidiManager, MidiManagerEvents, MidiManagerState, MidiMessage, NoteMidiMessage, getParsedNotes, noteNameToFrequency, noteNameToNumber, noteNumberToFrequency, noteNumberToName, pack, sendNote, unpack };
}
//#endregion
//#region ../io/dist/src/espruino-ble-device.d.ts
/**
 * An Espruino BLE-connection
 *
 * See [online demos](https://demos.ixfx.fun/io/)
 *
 * Use the `puck` function to initialise and connect to a Puck.js.
 * It must be called in a UI event handler for browser security reasons.
 *
 * ```js
 * const e = await Espruino.puck();
 * ```
 *
 * To connect to a particular device:
 *
 * ```js
 * const e = await Espruino.puck({name:`Puck.js a123`});
 * ```
 *
 * Listen for events:
 * ```js
 * // Received something
 * e.addEventListener(`data`, d => console.log(d.data));
 * // Monitor connection state
 * e.addEventListener(`change`, c => console.log(`${d.priorState} -> ${d.newState}`));
 * ```
 *
 * Write to the device (note the \n for a new line at the end of the string). This will
 * execute the code on the Espruino.
 *
 * ```js
 * e.write(`digitalPulse(LED1,1,[10,500,10,500,10]);\n`);
 * ```
 *
 * Run some code and return result:
 * ```js
 * const result = await e.eval(`2+2\n`);
 * ```
 */
declare class EspruinoBleDevice extends NordicBleDevice {
  evalTimeoutMs: number;
  evalReplyBluetooth: boolean;
  /**
   * Creates instance. You probably would rather use {@link puck} to create.
   * @param device
   * @param opts
   */
  constructor(device: BluetoothDevice, opts?: Options);
  /**
   * Writes a script to Espruino.
   *
   * It will first send a CTRL+C to cancel any previous input, `reset()` to clear the board,
   * and then the provided `code` followed by a new line.
   *
   * Use {@link eval} instead to execute remote code and get the result back.
   *
   * ```js
   * // Eg from https://www.espruino.com/Web+Bluetooth
   * writeScript(`
   *  setInterval(() => Bluetooth.println(E.getTemperature()), 1000);
   *  NRF.on('disconnect',()=>reset());
   * `);
   * ```
   *
   * @param code Code to send. A new line is added automatically.
   */
  writeScript(code: string): Promise<void>;
  /**
   * Sends some code to be executed on the Espruino. The result
   * is packaged into JSON and sent back to your code. An exception is
   * thrown if code can't be executed for some reason.
   *
   * ```js
   * const sum = await e.eval(`2+2`);
   * ```
   *
   * It will wait for a period of time for a well-formed response from the
   * Espruino. This might not happen if there is a connection problem
   * or a syntax error in the code being evaled. In cases like the latter,
   * it will take up to `timeoutMs` (default 5 seconds) before we give up
   * waiting for a correct response and throw an error.
   *
   * Tweaking of the timeout may be required if `eval()` is giving up too quickly
   * or too slowly. A default timeout can be given when creating the class.
   *
   * Options:
   *  timeoutMs: Timeout for execution. 5 seconds by default
   *  assumeExclusive If true, eval assumes all replies from controller are in response to eval. True by default
   *  debug: If true, execution is traced via `warn` callback
   * @param code Code to run on the Espruino.
   * @param opts Options
   * @param warn Function to pass warning/trace messages to. If undefined, this.warn is used, printing to console.
   */
  eval(code: string, opts?: EvalOpts, warn?: (message: string) => void): Promise<string>;
}
//# sourceMappingURL=espruino-ble-device.d.ts.map
//#endregion
//#region ../io/dist/src/json-device.d.ts
/**
 * Options for JsonDevice
 */
type JsonDeviceOpts = {
  /**
   * How much data to transfer at a time
   */
  readonly chunkSize?: number;
  /**
   * Name of device. This is only used for assisting the console.log output
   */
  readonly name?: string;
  /**
   * Number of times to automatically try to reconnect
   */
  readonly connectAttempts?: number;
  /**
   * If true, additional logging will be done
   */
  readonly debug?: boolean;
};
/**
 * Data received event
 */
type JsonDataEvent = {
  /**
   * Data received
   */
  readonly data: string;
};
/**
 * Events emitted by JsonDevice
 */
type JsonDeviceEvents = {
  /**
   * Data received
   */
  readonly data: JsonDataEvent;
  /**
   * State changed
   */
  readonly change: StateChangeEvent<GenericStateTransitions>;
};
declare abstract class JsonDevice extends SimpleEventEmitter<JsonDeviceEvents> {
  states: StateMachineWithEvents<GenericStateTransitions>;
  codec: Codec;
  verboseLogging: boolean;
  name: string;
  connectAttempts: number;
  chunkSize: number;
  rxBuffer: StringReceiveBuffer;
  txBuffer: StringWriteBuffer;
  constructor(config?: JsonDeviceOpts);
  get isConnected(): boolean;
  get isClosed(): boolean;
  write(txt: string): void;
  /**
   * Writes text to output device
   * @param txt
   */
  protected abstract writeInternal(txt: string): void;
  close(): Promise<void>;
  /**
   * Must change state
   */
  abstract onClosed(): void;
  abstract onPreConnect(): Promise<void>;
  connect(): Promise<void>;
  /**
   * Should throw if did not succeed.
   */
  protected abstract onConnectAttempt(): Promise<void>;
  private onRx;
  protected verbose(m: string): void;
  protected log(m: string): void;
  protected warn(m: unknown): void;
}
//# sourceMappingURL=json-device.d.ts.map
declare namespace serial_d_exports {
  export { Device, JsonDataEvent, JsonDeviceEvents, JsonDeviceOpts, SerialOpts };
}
type SerialOpts = JsonDeviceOpts & {
  readonly filters?: readonly SerialPortFilter[];
  readonly baudRate?: number;
  /**
   * End-of-line string sequence. \r\n by default.
   */
  readonly eol?: string;
};
/**
 * Serial device. Assumes data is sent with new line characters (\r\n) between messages.
 *
 * ```
 * import { Serial } from '@ixfx/io.js'
 * const s = new Serial.Device();
 * s.addEventListener(`change`, evt => {
 *  console.log(`State change ${evt.priorState} -> ${evt.newState}`);
 *  if (evt.newState === `connected`) {
 *    // Do something when connected...
 *  }
 * });
 *
 * // In a UI event handler...
 * s.connect();
 * ```
 *
 * Reading incoming data:
 * ```
 * // Parse incoming data as JSON
 * s.addEventListener(`data`, evt => {
 *  try {
 *    const o = JSON.parse(evt.data);
 *    // If we get this far, JSON is legit
 *  } catch (ex) {
 *  }
 * });
 * ```
 *
 * Writing to the microcontroller
 * ```
 * s.write(JSON.stringify({msg:"hello"}));
 * ```
 */
declare class Device extends JsonDevice {
  private config;
  port: SerialPort | undefined;
  tx: WritableStreamDefaultWriter<string> | undefined;
  abort: AbortController;
  baudRate: number;
  constructor(config?: SerialOpts);
  /**
   * Writes text collected in buffer
   * @param txt
   */
  protected writeInternal(txt: string): Promise<void>;
  onClosed(): void;
  onPreConnect(): Promise<void>;
  onConnectAttempt(): Promise<void>;
}
//#endregion
//#region ../io/dist/src/espruino-serial-device.d.ts
type EspruinoSerialDeviceOpts = SerialOpts & {
  readonly evalTimeoutMs?: number;
};
declare class EspruinoSerialDevice extends Device {
  evalTimeoutMs: number;
  evalReplyBluetooth: boolean;
  constructor(opts?: EspruinoSerialDeviceOpts);
  disconnect(): Promise<void>;
  /**
   * Writes a script to Espruino.
   *
   * It will first send a CTRL+C to cancel any previous input, `reset()` to clear the board,
   * and then the provided `code` followed by a new line.
   *
   * Use {@link eval} instead to execute remote code and get the result back.
   *
   * ```js
   * // Eg from https://www.espruino.com/Web+Bluetooth
   * writeScript(`
   *  setInterval(() => Bluetooth.println(E.getTemperature()), 1000);
   *  NRF.on('disconnect',()=>reset());
   * `);
   * ```
   *
   * @param code Code to send. A new line is added automatically.
   */
  writeScript(code: string): void;
  /**
   * Sends some code to be executed on the Espruino. The result
   * is packaged into JSON and sent back to your code. An exception is
   * thrown if code can't be executed for some reason.
   *
   * ```js
   * const sum = await e.eval(`2+2`);
   * ```
   *
   * It will wait for a period of time for a well-formed response from the
   * Espruino. This might not happen if there is a connection problem
   * or a syntax error in the code being evaled. In cases like the latter,
   * it will take up to `timeoutMs` (default 5 seconds) before we give up
   * waiting for a correct response and throw an error.
   *
   * Tweaking of the timeout may be required if `eval()` is giving up too quickly
   * or too slowly. A default timeout can be given when creating the class.
   *
   * Options:
   *  timeoutMs: Timeout for execution. 5 seconds by default
   *  assumeExclusive: If true, eval assumes all replies from controller are in response to eval. True by default
   *  debug: If true, execution is traced via `warn` callback
   * @param code Code to run on the Espruino.
   * @param opts Options
   * @param warn Function to pass warning/trace messages to. If undefined, this.warn is used, printing to console.
   */
  eval(code: string, opts?: EvalOpts, warn?: (message: string) => void): Promise<string>;
}
//# sourceMappingURL=espruino-serial-device.d.ts.map
declare namespace espruino_d_exports {
  export { EspruinoBleDevice, EspruinoBleOpts, EspruinoDevice, EspruinoSerialDevice, EspruinoSerialDeviceOpts, EspruinoStates, EvalOpts, Events, Options, bangle, connectBle, deviceEval, puck, serial };
}
type EspruinoStates = `ready` | `connecting` | `connected` | `closed` | `closing`;
/**
 * Options for device
 */
type Options = {
  /**
   * Default milliseconds to wait before giving up on a well-formed reply. 5 seconds is the default.
   */
  readonly evalTimeoutMs?: number;
  /**
   * Name of device. Only used for printing log mesages to the console
   */
  readonly name?: string;
  /**
   * If true, additional logging information is printed
   */
  readonly debug?: boolean;
};
/**
 * Options for code evaluation
 */
type EvalOpts = {
  /**
   * Milliseconds to wait before giving up on well-formed reply. 5 seconds is the default.
   */
  readonly timeoutMs?: number;
  /**
   * If true (default), it assumes that anything received from the board
   * is a response to the eval
   */
  readonly assumeExclusive?: boolean;
  /**
   * If true, executed code is traced
   */
  readonly debug?: boolean;
};
type EspruinoBleOpts = {
  /**
   * If the name is specified, this value is used
   * for filtering Bluetooth devices
   */
  readonly name?: string;
  /**
   * If true, additional logging messages are
   * displayed on the console
   */
  readonly debug?: boolean;
  /**
   * If specified, these filtering options are used instead
   */
  readonly filters?: readonly BluetoothLEScanFilter[];
};
/**
 * Instantiates a Puck.js. See {@link EspruinoBleDevice} for more info.
 * [Online demos](https://demos.ixfx.fun/io/)
 *
 * If `opts.name` is specified, this will the the Bluetooth device sought.
 *
 * ```js
 * import { Espruino } from '@ixfx/io.js'
 * const e = await Espruino.puck({ name:`Puck.js a123` });
 * ```
 *
 * If no name is specified, a list of all devices starting with `Puck.js` are shown.
 *
 * To get more control over filtering, pass in `opts.filter`. `opts.name` is not used as a filter in this scenario.
 *
 * ```js
 * import { Espruino } from '@ixfx/io.js'
 * const filters = [
 *  { namePrefix: `Puck.js` },
 *  { namePrefix: `Pixl.js` },
 *  {services: [NordicDefaults.service] }
 * ]
 * const e = await Espruino.puck({ filters });
 * ```
 *
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
declare const puck: (opts?: EspruinoBleOpts) => Promise<EspruinoBleDevice>;
declare const bangle: (opts?: EspruinoBleOpts) => Promise<EspruinoBleDevice>;
/**
 * Create a serial-connected Espruino device.
 *
 * ```js
 * import { Espruino } from '@ixfx/io.js'
 * const e = await Espruio.serial();
 * e.connect();
 * ```
 *
 * Options:
 * ```js
 * import { Espruino } from '@ixfx/io.js'
 * const e = await Espruino.serial({ debug: true, evalTimeoutMs: 1000, name: `My Pico` });
 * e.connect();
 * ```
 *
 * Listen for events:
 * ```js
 * e.addEventListener(`change`, evt => {
 *  console.log(`State change ${evt.priorState} -> ${evt.newState}`);
 *  if (evt.newState === `connected`) {
 *    // Do something when connected...
 *  }
 * });
 * ```
 *
 * Reading incoming data:
 * ```
 * // Parse incoming data as JSON
 * s.addEventListener(`data`, evt => {
 *  try {
 *    const o = JSON.parse(evt.data);
 *    // If we get this far, JSON is legit
 *  } catch (ex) {
 *  }
 * });
 * ```
 *
 * Writing to the microcontroller
 * ```
 * s.write(JSON.stringify({msg:"hello"}));
 * ```
 * @param opts
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
declare const serial: (opts?: {
  readonly name?: string;
  readonly debug?: boolean;
  readonly evalTimeoutMs?: number;
}) => Promise<EspruinoSerialDevice>;
/**
 * Connects to a generic Espruino BLE device. See  {@link EspruinoBleDevice} for more info.
 * Use {@link puck} if you're connecting to a Puck.js
 *
 * If `opts.name` is specified, only this BLE device will be shown.
 * ```js
 * const e = await connectBle({ name: `Puck.js a123` });
 * ```
 *
 * `opts.filters` overrides and sets arbitary filters.
 *
 * ```js
 * import { Espruino } from '@ixfx/io.js'
 * const filters = [
 *  { namePrefix: `Puck.js` },
 *  { namePrefix: `Pixl.js` },
 *  {services: [NordicDefaults.service] }
 * ]
 * const e = await Espruino.connectBle({ filters });
 * ```
 *
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
declare const connectBle: (opts?: EspruinoBleOpts) => Promise<EspruinoBleDevice>;
type Events = IoEvents<GenericStateTransitions>;
/**
 * EspruinoDevice
 *
 * This base interface is implemented by {@link EspruinoBleDevice} and {@link EspruinoSerialDevice}.
 */
type EspruinoDevice = {
  /**
   * Sends some code to be executed on the Espruino. The result
   * is packaged into JSON and sent back to your code. An exception is
   * thrown if code can't be executed for some reason.
   *
   * ```js
   * const sum = await e.eval(`2+2`);
   * ```
   *
   * It will wait for a period of time for a well-formed response from the
   * Espruino. This might not happen if there is a connection problem
   * or a syntax error in the code being evaled. In cases like the latter,
   * it will take up to `timeoutMs` (default 5 seconds) before we give up
   * waiting for a correct response and throw an error.
   *
   * Tweaking of the timeout may be required if `eval()` is giving up too quickly
   * or too slowly. A default timeout can be given when creating the class.
   *
   * Options:
   *  timeoutMs: Timeout for execution. 5 seconds by default
   *  assumeExclusive If true, eval assumes all replies from controller are in response to eval. True by default
   *  debug: If true, execution is traced via `warn` callback
   * @param code Code to run on the Espruino.
   * @param opts Options
   * @param warn Function to pass warning/trace messages to. If undefined, this.warn is used, printing to console.
   */
  eval(code: string, opts?: EvalOpts, warn?: (message: string) => void): Promise<string>;
  /**
   * Write some code for immediate execution. This is a lower-level
   * alternative to {@link writeScript}. Be sure to include a new line character '\n' at the end.
   * @param m Code
   */
  write(m: string): void;
  /**
   * Writes a script to Espruino.
   *
   * It will first send a CTRL+C to cancel any previous input, `reset()` to clear the board,
   * and then the provided `code` followed by a new line.
   *
   * Use {@link eval} instead to execute remote code and get the result back.
   *
   * ```js
   * // Eg from https://www.espruino.com/Web+Bluetooth
   * espruino.writeScript(`
   *  setInterval(() => Bluetooth.println(E.getTemperature()), 1000);
   *  NRF.on('disconnect',()=>reset());
   * `);
   * ```
   *
   * @param code Code to send. A new line is added automatically.
   */
  writeScript(code: string): void;
  /**
   * Disconnect
   */
  disconnect(): void;
  /**
   * Gets the current evaluation (millis)
   */
  get evalTimeoutMs(): number;
  get isConnected(): boolean;
} & ISimpleEventEmitter<Events>;
/**
 * Evaluates some code on an Espruino device.
 *
 * Options:
 * * timeoutMs: how many millis to wait before assuming code failed. If not specified, `device.evalTimeoutMs` is used as a default.
 * * assumeExlusive: assume device is not producing any other output than for our evaluation
 *
 * A random string is created to pair eval requests and responses. `code` will be run on the device, with the result
 * wrapped in JSON, and in turn wrapped in a object that is sent back.
 *
 * The actual code that gets sent to the device is then:
 * `\x10${evalReplyPrefix}(JSON.stringify({reply:"${id}", result:JSON.stringify(${code})}))\n`
 *
 * For example, it might end up being:
 * `\x10Bluetooth.println(JSON.stringify({reply: "a35gP", result: "{ 'x': '10' }" }))\n`
 *
 * @param code Code to evaluation
 * @param opts Options for evaluation
 * @param device Device to execute on
 * @param evalReplyPrefix How to send code back (eg `Bluetooth.println`, `console.log`)
 * @param debug If true, the full evaled code is printed locally to the console
 * @param warn Callback to display warnings
 * @returns
 */
declare const deviceEval: (code: string, opts: EvalOpts | undefined, device: EspruinoDevice, evalReplyPrefix: string, debug: boolean, warn: (m: string) => void) => Promise<string>;
//# sourceMappingURL=espruino.d.ts.map
declare namespace camera_d_exports {
  export { Constraints, StartResult$1 as StartResult, dumpDevices, start$1 as start };
}
/**
 * Print available media devices to console
 *
 * ```js
 * camera.dumpDevices(); // Will print results to console
 * ```
 * @param filterKind Defaults `videoinput`
 */
declare const dumpDevices: (filterKind?: string) => Promise<void>;
/**
 * Constraints when requesting a camera source
 */
type Constraints = {
  /**
   * Camera facing: user is front-facing, environment is a rear camera
   */
  readonly facingMode?: `user` | `environment`;
  /**
   * Maximum resolution
   */
  readonly max?: Rect;
  /**
   * Minimum resolution
   */
  readonly min?: Rect;
  /**
   * Ideal resolution
   */
  readonly ideal?: Rect;
  /**
   * If specified, will try to use this media device id
   */
  readonly deviceId?: string;
  /**
   * Number of milliseconds to wait on `getUserMedia` before giving up.
   * Defaults to 30seconds
   */
  readonly startTimeoutMs?: number;
};
/**
 * Result from starting a camera
 */
type StartResult$1 = {
  /**
   * Call dispose to stop the camera feed and remove any created resources,
   * such as a VIDEO element
   */
  readonly dispose: () => void;
  /**
   * Video element camera is connected to
   */
  readonly videoEl: HTMLVideoElement;
};
/**
 * Attempts to start a video-only stream from a camera into a hidden
 * VIDEO element for frame capture. The VIDEO element is created automatically.
 *
 *
 * ```js
 * import { Camera } from '@ixfx/io.js'
 * import { Video } from '@ixfx/visual.js'
 * try {
 *  const { videoEl, dispose } = await Camera.start();
 *  for await (const frame of Video.frames(videoEl)) {
 *    // Do something with pixels...
 *  }
 * } catch (ex) {
 *  console.error(`Video could not be started`);
 * }
 * ```
 *
 * Be sure to call the dispose() function to stop the video stream and remov
 * the created VIDEO element.
 *
 * _Constraints_ can be specified to select a camera and resolution:
 * ```js
 * import { Camera } from '@ixfx/io.js'
 * import { Video } from '@ixfx/visual.js'
 *
 * try {
 *  const { videoEl, dispose } = await Camera.start({
 *    facingMode: `environment`,
 *    max: { width: 640, height: 480 }
 *  });
 *
 *  for await (const frame of Video.frames(videoEl)) {
 *    // Do something with pixels...
 *  }
 * } catch (ex) {
 *  // Can happen if user cancels camera request, for example.
 *  console.error(`Video could not be started`, ex);
 * }
 * ```
 *
 * An alternative to Video.frames is Video.capture.
 * @param constraints
 * @returns Returns `{ videoEl, dispose }`, where `videoEl` is the created VIDEO element, and `dispose` is a function for removing the element and stopping the video.
 */
declare const start$1: (constraints?: Constraints) => Promise<StartResult$1>;
//# sourceMappingURL=camera.d.ts.map
declare namespace video_file_d_exports {
  export { StartResult, start };
}
/**
 * Result from starting a camera
 */
type StartResult = {
  /**
   * Call dispose to stop the camera feed and remove any created resources,
   * such as a VIDEO element
   */
  readonly dispose: () => void;
  /**
   * Video element camera is connected to
   */
  readonly videoEl: HTMLVideoElement;
};
/**
 * Starts video file playback, creating a VIDEO element automatically.
 * @param file File
 * @returns StartResult
 */
declare const start: (file: File) => Promise<StartResult>;
//# sourceMappingURL=video-file.d.ts.map
//#endregion
//#region ../io/dist/src/frame-processor.d.ts
/**
 * Frame procesor options
 */
type FrameProcessorOpts = {
  /**
   * If true, capture canvas will be shown. Default: false
   */
  readonly showCanvas?: boolean;
  /**
   * If true, raw source will be shown. Default: false.
   */
  readonly showPreview?: boolean;
  /**
   * If specified, this function will be called after ImageData is captured
   * from the intermediate canvs. This allows for drawing on top of the
   * captured image.
   */
  readonly postCaptureDraw?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  /**
   * Default constraints to use for the camera source
   */
  readonly cameraConstraints?: Constraints;
  /**
   * If specified, this canvas will be used for capturing frames to
   */
  readonly captureCanvasEl?: HTMLCanvasElement;
};
/**
 * Frame Processor
 * Simplifies grabbing frames from a camera or video file.
 *
 * First, create:
 * ```js
 * const fp = new FrameProcessor();
 * ```
 *
 * Then either use the camera or a video file:
 * ```js
 * fp.useCamera(constraints);
 * // or:
 * gp.useVideo(file);
 * ```
 *
 * With `useCamera`, optionally specify {@link Camera.Constraints} to pick which camera and resolution.
 *
 * ```js
 * fp.getFrame(); // Gets the last frame
 * fp.dispose(); // Close down camera/file
 * ```
 *
 * See {@link FrameProcessorOpts} for details on available options.
 */
declare class FrameProcessor {
  private _source;
  private _state;
  private _teardownNeeded;
  private _cameraConstraints;
  private _cameraStartResult;
  private _videoSourceCapture;
  private _videoFile;
  private _videoStartResult;
  private _showCanvas;
  private _showPreview;
  private _postCaptureDraw;
  private _timer;
  private _captureCanvasEl?;
  /**
   * Create a new frame processor
   * @param opts
   */
  constructor(opts?: FrameProcessorOpts);
  /**
   * Hides or shows the raw source in the DOM
   * @param enabled Preview enabled
   */
  showPreview(enabled: boolean): void;
  /**
   * Shows or hides the Canvas we're capturing to
   * @param enabled
   */
  showCanvas(enabled: boolean): void;
  /**
   * Returns the current capturer instance
   * @returns
   */
  getCapturer(): ManualCapturer | undefined;
  /**
   * Grab frames from a video camera source and initialises
   * frame processor.
   *
   * If `constraints` are not specified, it will use the ones
   * provided when creating the class, or defaults.
   *
   * @param constraints Override of constraints when requesting camera access
   */
  useCamera(constraints?: Constraints): Promise<void>;
  useVideo(file: File): Promise<void>;
  /**
   * Initialises camera
   */
  private initCamera;
  private initVideo;
  private postInit;
  /**
   * Closes down connections and removes created elements.
   * Once disposed, the frame processor cannot be used
   * @returns
   */
  dispose(): void;
  private init;
  private teardown;
  /**
   * Get the last frame
   * @returns
   */
  getFrame(): ImageData | undefined;
  /**
   * Get the timestamp of the processor (elapsed time since starting)
   * @returns
   */
  getTimestamp(): number;
  private getFrameCamera;
}
//# sourceMappingURL=frame-processor.d.ts.map
//#endregion
//#region ../io/dist/src/reconnecting-web-socket.d.ts
type ReconnectingWebsocket = {
  /**
   * Sends data
   * @param data
   * @returns
   */
  send: (data: string | ArrayBufferLike | ArrayBufferView | Blob) => void;
  /**
   * Closes websocket, disabling reconnection
   * @returns
   */
  close: () => void;
  /**
   * Opens websocket if it's not already connected or connecting
   * @returns
   */
  open: () => Promise<boolean>;
  /**
   * Returns _true_ if it seems the websocket is connected
   * @returns
   */
  isConnected: () => boolean;
};
type ReconnectingWebsocketStates = `connecting` | `open` | `closed`;
type ReconnectingOptions = {
  startDelay: Interval;
  maxDelay: Interval;
  limitAttempts: number;
  /**
   * How often to check the state of the
   * underlying websocket.
   *
   * Default: 5s
   */
  checkStateMs: Interval;
  /**
   * Callback when message is received
   * @param message
   * @returns
   */
  onMessage: (message: any) => void;
  onConnected: () => void;
  onDisconnected: () => void;
  onError: (error: any) => void;
};
/**
 * Maintains a web socket connection. Connects automatically.
 *
 * The essential usage is:
 * ```js
 * import { reconnectingWebsocket } from '@ixfx/io.js'
 * const ws = reconnectingWebsocket(`wss://somehost.com/ws`, {
 *  onMessage: (msg) => {
 *    // Do something with received message...
 *  }
 * }
 *
 * // Send some data
 * ws.send(JSON.stringify(someData));
 *
 * // Check state of connection
 * ws.isConnected();
 * ```
 *
 * More options can be provided to monitor state
 * ```js
 * import { reconnectingWebsocket } from '@ixfx/io.js'
 * const ws = reconnectingWebsocket(`wss://somehost.com/ws`, {
 *  onError: (err) => {
 *    console.error(err)
 *  },
 *  onMessage: (msg) => {
 *    // Received data
 *    console.log(msg);
 *  },
 *  onConnected: () => {
 *    // Connected!
 *  },
 *  onDisconnected: () => {
 *    // Disconnected :(
 *  }
 * });
 * ```
 * @param url
 * @param opts
 * @returns
 */
declare const reconnectingWebsocket: (url: string | URL, opts?: Partial<ReconnectingOptions>) => ReconnectingWebsocket;
//# sourceMappingURL=reconnecting-web-socket.d.ts.map
declare namespace index_d_exports$16 {
  export { index_d_exports$22 as Audio, BleDeviceOptions, nordic_ble_device_d_exports as Bluetooth, camera_d_exports as Camera, Codec, espruino_d_exports as Espruino, FrameProcessor, FrameProcessorOpts, FrameProcessorSources, GenericStateTransitions, IoDataEvent, IoEvents, index_d_exports$23 as Midi, ReconnectingOptions, ReconnectingWebsocket, ReconnectingWebsocketStates, serial_d_exports as Serial, StateChangeEvent, StringReceiveBuffer, StringWriteBuffer, Opts as StringWriteBufferOpts, video_file_d_exports as VideoFile, genericStateTransitionsInstance, reconnectingWebsocket };
}
//#endregion
//#region ../ui/dist/src/rx/browser-resize.d.ts
/**
 * Observe when element resizes. Specify `interval` to debounce, uses 100ms by default.
 *
 * ```
 * const o = resizeObservable(myEl, 500);
 * o.subscribe(() => {
 *  // called 500ms after last resize
 * });
 * ```
 * @param elem
 * @param interval Tiemout before event gets triggered
 * @returns
 */
declare const browserResizeObservable: (elem: Readonly<Element>, interval?: Interval) => Reactive$1<ResizeObserverEntry[]>;
/**
 * Returns an Reactive for window resize. Default 100ms debounce.
 * @param elapsed
 * @returns
 */
declare const windowResize: (elapsed?: Interval) => Reactive$1<{
  innerWidth: number;
  innerHeight: number;
}>;
//# sourceMappingURL=browser-resize.d.ts.map
//#endregion
//#region ../ui/dist/src/rx/browser-theme-change.d.ts
/**
 * Observe when a class changes on a target element, by default the document.
 * Useful for tracking theme changes.
 *
 * ```js
 * const c = cssClassChange();
 * c.on(msg => {
 *  // some class has changed on the document
 * });
 * ```
 */
declare const cssClassChange: (target?: HTMLElement) => Reactive$1<MutationRecord[]>;
//# sourceMappingURL=browser-theme-change.d.ts.map
//#endregion
//#region ../ui/dist/src/rx/colour.d.ts
type ReactiveColour = ReactiveWritable<HslScalar> & {
  setHsl: (hsl: HslScalar) => void;
};
declare function colour(initialValue: HslScalar): ReactiveColour & ReactiveInitial$1<HslScalar>;
declare function colour(): ReactiveColour & ReactiveNonInitial$1<HslScalar>;
//# sourceMappingURL=colour.d.ts.map
//#endregion
//#region ../ui/dist/src/rx/dom-types.d.ts
type DomBindValueTarget = {
  /**
   * If _true_ `innerHTML` is set (a shortcut for elField:`innerHTML`)
   */
  htmlContent?: boolean;
  /**
   * If _true_, 'textContent' is set (a shortcut for elField:'textContext')
   */
  textContent?: boolean;
  /**
   * If set, this DOM element field is set. Eg 'textContent'
   */
  elField?: string;
  /**
   * If set, this DOM attribute is set, Eg 'width'
   */
  attribName?: string;
  /**
   * If set, this CSS variable is set, Eg 'hue' (sets '--hue')
   */
  cssVariable?: string;
  /**
   * If set, this CSS property is set, Eg 'background-color'
   */
  cssProperty?: string;
};
type ElementBind = {
  /**
   * Tag name for this binding.
   * Overrides `defaultTag`
   */
  tagName?: string;
  /**
   * If _true_, sub-paths are appended to element, rather than `container`
   */
  nestChildren?: boolean;
  transform?: (value: any) => string;
};
type ElementsOptions = {
  container: HTMLElement | string;
  defaultTag: string;
  binds: Record<string, DomBindValueTarget & ElementBind>;
};
type DomBindTargetNode = {
  query?: string;
  element?: HTMLElement;
};
type DomBindTargetNodeResolved = {
  element: HTMLElement;
};
type DomBindUnresolvedSource<TSource, TDestination> = DomBindTargetNode & DomBindSourceValue<TSource, TDestination> & DomBindValueTarget;
type DomBindResolvedSource<TSource, TDestination> = DomBindTargetNodeResolved & DomBindSourceValue<TSource, TDestination> & DomBindValueTarget;
type DomBindSourceValue<TSource, TDestination> = {
  twoway?: boolean;
  /**
   * Field from source value to pluck and use.
   * This will also be the value passed to the transform
   */
  sourceField?: keyof TSource;
  transform?: (input: TSource) => TDestination;
  transformValue?: (input: any) => TDestination;
};
type DomBindInputOptions<TSource, TDestination> = DomBindSourceValue<TSource, TDestination> & {
  transformFromInput: (input: TDestination) => TSource;
};
type BindUpdateOpts<V> = {
  initial: (v: V, el: HTMLElement) => void;
  binds: Record<string, DomBindValueTarget & {
    transform?: (value: any) => string;
  }>;
};
type DomCreateOptions = {
  tagName: string;
  parentEl: string | HTMLElement;
};
type PipeDomBinding = {
  /**
   * Remove binding and optionally delete element(s) (false by default)
   */
  remove(deleteElements: boolean): void;
};
type DomValueOptions = EventSourceOptions & {
  /**
   * If true, the current value will be emitted even though it wasn't
   * triggered by an event.
   * Default: false
   */
  emitInitialValue: boolean;
  attributeName: string;
  fieldName: string;
  /**
   * Respond to when value has changed or when value is changing
   * Default: `changed`
   */
  when: `changed` | `changing`;
  fallbackValue: string;
  upstreamSource?: Reactive$1<unknown>;
  upstreamFilter?: (value: unknown) => string;
};
type DomFormOptions<T extends Record<string, unknown>> = EventSourceOptions & {
  /**
   * If true, the current value will be emitted even though it wasn't
   * triggered by an event.
   * Default: false
   */
  emitInitialValue: boolean;
  /**
   * Respond to when value has changed or when value is changing
   * Default: `changed`
   */
  when: `changed` | `changing`;
  upstreamSource?: Reactive$1<T>;
  upstreamFilter?: (name: string, value: unknown) => string;
};
type DomNumberInputValueOptions = DomValueOptions & {
  /**
   * If true, sets up INPUT element to operate with relative values
   */
  relative?: boolean;
  /**
   * If true, when setting up, sets max to be on left side
   */
  inverted?: boolean;
  upstreamSource?: Reactive$1<number>;
};
//# sourceMappingURL=dom-types.d.ts.map
//#endregion
//#region ../ui/dist/src/rx/dom-source.d.ts
/**
 * Reactive getting/setting of values to a HTML INPUT element.
 *
 * Options:
 * - relative: if _true_, values are 0..1 (default: false)
 * - inverted: if _true_, values are 1..0 (default: false)
 *
 * If element is missing a 'type' attribute, this will be set to 'range'.
 * @param targetOrQuery
 * @param options
 * @returns
 */
declare function domNumberInputValue(targetOrQuery: HTMLInputElement | string, options?: Partial<DomNumberInputValueOptions>): ReactiveInitial$1<number> & ReactiveWritable<number>;
declare function domHslInputValue(targetOrQuery: HTMLInputElement | string, options?: Partial<DomValueOptions>): ReactiveInitial$1<HslScalar> & Reactive$1<HslScalar> & ReactiveWritable<HslScalar>;
/**
 * A stream of values when the a HTMLInputElement changes. Eg a <input type="range">
 * ```js
 * const r = Rx.From.domInputValue(`#myEl`);
 * r.onValue(value => {
 *  // value will be string
 * });
 * ```
 *
 * Options:
 * * emitInitialValue: If _true_ emits the HTML value of element (default: false)
 * * attributeName: If set, this is the HTML attribute value is set to when writing to stream (default: 'value')
 * * fieldName: If set, this is the DOM object field set when writing to stream (default: 'value')
 * * when: 'changed'|'changing' when values are emitted. (default: 'changed')
 * * fallbackValue:  Fallback value to use if field/attribute cannot be read (default: '')
 * @param targetOrQuery
 * @param options
 * @returns
 */
declare function domInputValue(targetOrQuery: HTMLInputElement | string, options?: Partial<DomValueOptions>): {
  el: HTMLInputElement;
} & ReactiveInitial$1<string> & ReactiveWritable<string>;
/**
 * Listens for data changes from elements within a HTML form element.
 * Input elements must have a 'name' attribute.
 *
 * Simple usage:
 * ```js
 * const rx = Rx.From.domForm(`#my-form`);
 * rx.onValue(value => {
 *  // Object containing values from form
 * });
 *
 * rx.last(); // Read current values of form
 * ```
 *
 * UI can be updated
 * ```js
 * // Set using an object of key-value pairs
 * rx.set({
 *  size: 'large'
 * });
 *
 * // Or set a single name-value pair
 * rx.setNamedValue(`size`, `large`);
 * ```
 *
 * If an 'upstream' reactive is provided, this is used to set initial values of the UI, overriding
 * whatever may be in the HTML. Upstream changes modify UI elements, but UI changes do not modify the upstream
 * source.
 *
 * ```js
 * // Create a reactive object
 * const obj = Rx.From.object({
 *  when: `2024-10-03`,
 *  size: 12,
 *  checked: true
 * });
 *
 * // Use this as initial values for a HTML form
 * // (assuming appropriate INPUT/SELECT elements exist)
 * const rx = Rx.From.domForm(`form`, {
 *  upstreamSource: obj
 * });
 *
 * // Listen for changes in the UI
 * rx.onValue(value => {
 *
 * });
 * ```
 * @param formElOrQuery
 * @param options
 * @returns
 */
declare function domForm<T extends Record<string, any>>(formElOrQuery: HTMLFormElement | string, options?: Partial<DomFormOptions<T>>): {
  setNamedValue: (name: string, value: any) => void;
  el: HTMLFormElement;
} & ReactiveInitial$1<T> & ReactiveWritable<T>;
//# sourceMappingURL=dom-source.d.ts.map
//#endregion
//#region ../ui/dist/src/rx/dom.d.ts
/**
 * Reactive stream of array of elements that match `query`.
 * @param query
 * @returns
 */
declare function fromDomQuery(query: string): Reactive$1<HTMLElement[]> & {
  set(value: HTMLElement[]): void;
} & {
  onField(fieldName: string, handler: (result: ObjectFieldHandler) => void): () => void;
  onDiff(changes: (changes: PathDataChange<any>[]) => void): () => void;
  update(changedPart: (RecursivePartial<HTMLElement> | undefined)[]): HTMLElement[];
  updateField(field: string, value: any): void;
} & {
  last(): HTMLElement[];
};
/**
 * Updates an element's `textContent` when the source value changes.
 * ```js
 * bindText(source, `#blah`);
 * ```
 * @param elOrQuery
 * @param source
 * @param bindOpts
 */
declare const bindText: <TSource>(source: Reactive$1<TSource>, elOrQuery: string | HTMLElement | null, bindOpts?: Partial<DomBindSourceValue<TSource, string>>) => PipeDomBinding;
/**
 * Updates an element's `value` (as well as the 'value' attribute) when the source value changes.s
 * @param source
 * @param elOrQuery
 * @param bindOpts
 * @returns
 */
declare const bindValueText: <TSource>(source: Reactive$1<TSource>, elOrQuery: string | HTMLInputElement | null, bindOpts?: Partial<DomBindSourceValue<TSource, string>>) => PipeDomBinding;
/**
 * Updates an element's `innerHTML` when the source value changes
 * ```js
 * bindHtml(source, `#blah`);
 * ```
 *
 * Uses {@link bindElement}, with `{elField:'innerHTML'}` as the options.
 * @param elOrQuery
 * @param source
 * @param bindOpts
 * @returns
 */
declare const bindHtml: <TSource>(source: Reactive$1<TSource>, elOrQuery: string | HTMLElement | null, bindOpts?: DomBindSourceValue<TSource, string>) => PipeDomBinding;
/**
 * Shortcut to bind to an elements attribute
 * @param elOrQuery
 * @param source
 * @param attribute
 * @param bindOpts
 * @returns
 */
/**
 * Shortcut to bind to a CSS variable
 * @param elOrQuery
 * @param source
 * @param cssVariable
 * @param bindOpts
 * @returns
 */
/**
 * Creates a new HTML element, calling {@link bind} on it to update when `source` emits new values.
 *
 *
 * ```js
 * // Set textContent of a SPAN with values from `source`
 * create(source, { tagName: `span`, parentEl: document.body })
 * ```
 *
 * If `parentEl` is not given in the options, the created element needs to be manually added
 * ```js
 * const b = create(source);
 * someEl.append(b.el); // Append manually
 * ```
 *
 * ```
 * // Set 'title' attribute based on values from `source`
 * create(source, { parentEl: document.body, attribName: `title` })
 * ```
 * @param source
 * @param options
 * @returns
 */
/**
 * Update a DOM element's field, attribute or CSS variable when `source` produces a value.
 *
 * ```js
 * // Access via DOM query. Binds to 'textContent' by default
 * bind(readableSource, `#someEl`);
 *
 * // Set innerHTML instead
 * bind(readableSource, someEl, { elField: `innerHTML` });
 *
 * // An attribute
 * bind(readableSource, someEl, { attribName: `width` });
 *
 * // A css variable ('--' optiona)
 * bind(readableSource, someEl, { cssVariable: `hue` });
 *
 * // Pluck a particular field from source data.
 * // Ie someEl.textContent = value.colour
 * bind(readableSource, someEl, { sourceField: `colour` });
 *
 * // Transform value before setting it to field
 * bind(readableSource, someEl, {
 *  field: `innerHTML`,
 *  transform: (v) => `Colour: ${v.colour}`
 * })
 * ```
 *
 * If `source` has an initial value, this is used when first bound.
 *
 * Returns {@link PipeDomBinding} to control binding:
 * ```js
 * const bind = bind(source, `#someEl`);
 * bind.remove();     // Unbind
 * bind.remove(true); // Unbind and remove HTML element
 * ```
 *
 * If several fields need to be updated based on a new value, consider using {@link bindUpdate} instead.
 * @param elOrQuery Element to update to, or query string such as '#someid'
 * @param source Source of data
 * @param binds Bindings
 */
declare const bindElement: <TSource, TDestination>(source: Reactive$1<TSource>, elOrQuery: string | HTMLElement | null, ...binds: (DomBindSourceValue<TSource, TDestination> & DomBindValueTarget)[]) => PipeDomBinding;
/**
 * Binds `source` to one or more element(s). One or more bindings for the same source
 * can be provided.
 *
 * ```js
 * bind(source,
 *  // Binds .name field of source values to textContent of #some-element
 *  { query: `#some-element`, sourceField: `name` },
 *  { query: `section`, }
 * );
 * ```
 *
 * Can update
 * * CSS variables
 * * CSS styles
 * * textContent / innerHTML
 * * HTML DOM attributes and object fields
 *
 * Can use a particular field on source values, or use the whole value. These can
 * pass through `transformValue` or `transform` respectively.
 *
 * Returns a function to unbind from source and optionally remove HTML element
 * ```js
 * const unbind = bind( . . . );
 * unbind();     // Unbind
 * unbind(true); // Unbind and remove HTML element(s)
 * ```
 * @param source
 * @param bindsUnresolvedElements
 * @returns
 */
declare const bind: <TSource, TDestination>(source: Reactive$1<TSource>, ...bindsUnresolvedElements: DomBindUnresolvedSource<TSource, TDestination>[]) => PipeDomBinding;
/**
 * Calls `updater` whenever `source` produces a value. Useful when several fields from a value
 * are needed to update an element.
 * ```js
 * bindUpdate(source, `#someEl`, (v, el) => {
 *  el.setAttribute(`width`, v.width);
 *  el.setAttribute(`height`, v.height);
 * });
 * ```
 *
 * Returns a {@link PipeDomBinding} to manage binding
 * ```js
 * const b = bindUpdate(...);
 * b.remove();     // Disconnect binding
 * b.remove(true); // Disconnect binding and remove element
 * b.el;           // HTML element
 * ```
 * @param elOrQuery
 * @param source
 * @param updater
 * @returns
 */
declare const bindUpdate: <V>(source: Reactive$1<V>, elOrQuery: string | HTMLElement, updater: (v: V, el: HTMLElement) => void) => PipeDomBinding;
/**
 * Updates a HTML element based on diffs on an object.
 * ```js
 * // Wrap an object
 * const o = Rx.object({ name: `Jane`, ticks: 0 });
 * const b = bindDiffUpdate(`#test`, o, (diffs, el) => {
 *  // el = reference to #test
 * // diff = Array of Changes,
 * //  eg [ { path: `ticks`, value: 797, previous: 0 } ]
 *  for (const diff of diffs) {
 *    if (diff.path === `ticks`) el.textContent = `${diff.previous} -> ${diff.value}`
 *  }
 * })
 *
 * // Eg. update field
 * o.updateField(`ticks`, Math.floor(Math.random()*1000));
 * ```
 *
 * If `initial` is provided as an option, this will be called if `source` has an initial value. Without this, the DOM won't be updated until the first data
 * update happens.
 * ```js
 * bindDiffUpdate(el, source, updater, {
 *  initial: (v, el) => {
 *    el.innerHTML = v.name;
 *  }
 * })
 * ```
 * @param elOrQuery
 * @param source
 * @param updater
 * @param opts
 * @returns
 */
declare const bindDiffUpdate: <V>(source: ReactiveDiff<V>, elOrQuery: string | HTMLElement | null, updater: (diffs: PathDataChange<any>[], el: HTMLElement) => void, opts?: Partial<BindUpdateOpts<V>>) => PipeDomBinding & {
  refresh: () => void;
};
/**
 * Creates a new HTML element and calls `bindUpdate` so values from `source` can be used
 * to update it.
 *
 *
 * ```js
 * // Creates a span, adding it to <body>
 * const b = createUpdate(dataSource, (value, el) => {
 *  el.width = value.width;
 *  el.height = value.height;
 * }, {
 *  tagName: `SPAN`,
 *  parentEl: document.body
 * })
 * ```
 * @param source
 * @param updater
 * @param options
 * @returns
 */
/**
 * Creates, updates & deletes elements based on pathed values from a reactive.
 *
 * This means that elements are only manipulated if its associated data changes,
 * and elements are not modified if there's no need to.
 * @param source
 * @param options
 */
declare const elements: <T>(source: ReactiveDiff<T> | (ReactiveDiff<T> & ReactiveInitial$1<T>), options: Partial<ElementsOptions>) => void;
declare function win(): {
  dispose: (reason?: string) => void;
  size: Reactive$1<{
    lazy: string;
    transform: () => {
      width: number;
      height: number;
    };
  }> & {
    last(): {
      lazy: string;
      transform: () => {
        width: number;
        height: number;
      };
    };
  };
  pointer: Reactive$1<{
    lazy: string;
    transform: (args: Event | undefined) => {
      x: number;
      y: number;
    };
  }> & {
    last(): {
      lazy: string;
      transform: (args: Event | undefined) => {
        x: number;
        y: number;
      };
    };
  };
};
//# sourceMappingURL=dom.d.ts.map
declare namespace index_d_exports$19 {
  export { BindUpdateOpts, DomBindInputOptions, DomBindResolvedSource, DomBindSourceValue, DomBindTargetNode, DomBindTargetNodeResolved, DomBindUnresolvedSource, DomBindValueTarget, DomCreateOptions, DomFormOptions, DomNumberInputValueOptions, DomValueOptions, ElementBind, ElementsOptions, PipeDomBinding, ReactiveColour, bind, bindDiffUpdate, bindElement, bindHtml, bindText, bindUpdate, bindValueText, browserResizeObservable, colour, cssClassChange, domForm, domHslInputValue, domInputValue, domNumberInputValue, elements, fromDomQuery, win, windowResize };
}
declare namespace index_d_exports$18 {
  export { index_d_exports$19 as RxUi };
}
//#endregion
export { AlignOpts, ArrayItems, ArrayLengthMutationKeys, index_d_exports$15 as Arrays, BasicType, ChangeKind, ChangeRecord, index_d_exports$7 as Collections, CompareChangeSet, CompareResult, Comparer, Continuously, ContinuouslyAsyncCallback, ContinuouslyOpts, ContinuouslySyncCallback, DataWithId, index_d_exports$4 as Debug, index_d_exports$9 as Dom, index_d_exports$8 as Events, FixedLengthArray, index_d_exports$12 as Flow, index_d_exports$10 as Geometry, index_d_exports$3 as Guards, HasCompletion, HasCompletionRunStates, IDictionary, IWithEntries, Interval, index_d_exports$16 as Io, type IsEqual, IsEqualContext, index_d_exports$17 as Iterables, KeyValue, KeyValueSortSyles, KeyValueSorter, maps_d_exports as Maps, index_d_exports$1 as Modulation, index_d_exports$11 as Numbers, OnStartCalled, Passed, pathed_d_exports as Pathed, Primitive, PrimitiveOrObject, index_d_exports$2 as Process, index_d_exports$5 as Random, RankArrayOptions, RankFunction, RankOptions, Reactive, ReactiveInitial, ReactiveNonInitial, ReadonlyRemapObjectPropertyType, index_d_exports as Records, RecursivePartial, RecursiveReplace, RecursiveWriteable, RemapObjectPropertyType, RequireOnlyOne, ResolveFallbackOpts, ResolveToValue, ResolveToValueAsync, ResolveToValueSync, ResolvedObject, Rest, index_d_exports$14 as Rx, SignalKinds, Similarity, Since, SleepOpts, StringOrNumber, ToString, TrackUnique, index_d_exports$6 as Trackers, index_d_exports$18 as Ui, Unsubscriber, index_d_exports$13 as Visual, Writeable, align, alignById, compareIterableValuesShallow, comparerInverse, continuously, defaultComparer, defaultKeyer, defaultToString, elapsedInfinity, elapsedInterval, elapsedOnce, elapsedSince, elapsedToHumanString, filterValue, hasLast, intervalToMs, isEmptyEntries, isEqualContextString, isEqualDefault, isEqualTrace, isEqualValueDefault, isEqualValueIgnoreOrder, isEqualValuePartial, isInteger, isInterval, isMap, isPrimitive, isPrimitiveOrObject, isReactive, isSet, jsComparer, keyValueSorter, numericComparer, promiseFromEvent, resolve, resolveFields, resolveFieldsSync, resolveSync, resolveWithFallback, resolveWithFallbackSync, runningiOS, sleep, sleepWhile, toStringDefault, toStringOrdered, unique, uniqueInstances };
//# sourceMappingURL=index.d.ts.map