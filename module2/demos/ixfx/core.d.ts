import { IsEqual, IsEqualContext } from "./is-equal-BzhoT7pd.js";
import { BasicType, Interval, ToString } from "./types-CcY4GIC4.js";
import { Result } from "./index-DTe1EM0y.js";
import { ReactiveNonInitial, ResolveToValue } from "./resolve-core-CYBLBOMw.js";

//#region ../core/src/types-compare.d.ts
/**
 * Kind of change
 */
type ChangeKind = `mutate` | `add` | `del`;
/**
 * Change record
 */
type ChangeRecord<TKey extends string | number | symbol> = [kind: ChangeKind, path: TKey, value: unknown];
/**
 * Result of compareObjectData
 */
type CompareChangeSet<TKey extends string | number> = {
  /**
   * _True_ if there are any changes
   */
  hasChanged: boolean;
  /**
   * Results for child objects
   */
  children: Record<TKey, CompareChangeSet<string | number>>;
  /**
   * Values that have changed
   */
  changed: Record<TKey, unknown>;
  /**
   * Fields that have been added
   */
  added: Record<TKey, unknown>;
  /**
   * Fields that have been removed
   */
  removed: TKey[];
  /**
   * _True_ if value is an array
   */
  isArray: boolean;
  /**
   * Summary of changes
   */
  summary: ChangeRecord<TKey>[];
};
//# sourceMappingURL=types-compare.d.ts.map
//#endregion
//#region ../core/src/records/compare.d.ts
/**
 * Compares the keys of two objects, returning a set of those in
 * common, and those in either A or B exclusively.
 * ```js
 * const a = { colour: `red`, intensity: 5 };
 * const b = { colour: `pink`, size: 10 };
 * const c = compareObjectKeys(a, b);
 * // c.shared = [ `colour` ]
 * // c.a = [ `intensity` ]
 * // c.b = [ `size`  ]
 * ```
 * @param a
 * @param b
 * @returns
 */
declare const compareObjectKeys: (a: object, b: object) => {
  shared: string[];
  isSame: boolean;
  a: string[];
  b: string[];
};
/**
 * Returns the changed fields from A -> B. It's assumed that A and B have the same shape.
 * ie. returns an object that only consists of fields which have changed in B compared to A.
 *
 * ```js
 * const a = { msg: `hi`, v: 10 };
 *
 * changedObjectDataFields(a, { msg: `hi`,   v: 10 }); // {}
 * changedObjectDataFields(a, { msg: `hi!!`, v: 10 }); // { msg: `hi!!` }
 * changedObjectDataFields(a, { msg: `hi!!` });       // { msg: `hi!!`, v: undefined }
 * ```
 *
 * If B has additional or removed fields, this is considered an error.
 *
 * If a field is an array, the whole array is returned, rather than a diff.
 * @param a
 * @param b
 */
declare const changedObjectDataFields: (a: object, b: object) => object[] | Record<string, unknown>;
/**
 * Produces a {@link CompareChangeSet} between two arrays.
 *
 * @param a Earlier array to compare
 * @param b Later array to compare
 * @param eq Equality comparison for values
 * @returns Change set.
 */
declare const compareArrays: <TValue>(a: TValue[], b: TValue[], eq?: IsEqual<TValue>) => CompareChangeSet<number>;
/**
 * Compares A to B. Assumes they are simple objects, essentially key-value pairs, where the
 * values are primitive values or other simple objects. It also works with arrays.
 *
 * Uses === equality semantics by default.
 * @param a
 * @param b
 */
declare const compareObjectData: <T>(a: object | null, b: object | null, assumeSameShape?: boolean, eq?: IsEqual<T>) => CompareChangeSet<string>;
//# sourceMappingURL=compare.d.ts.map
//#endregion
//#region ../core/src/records/clone-from-fields.d.ts
declare const cloneFromFields: <T extends object>(source: T) => T;
//# sourceMappingURL=clone-from-fields.d.ts.map

//#endregion
//#region ../core/src/ts-utility.d.ts
/**
 * Remaps `TShape` so each field has type `TFieldValue`.
 * Recursive.
 */
type RecursiveReplace<TShape, TFieldValue> = { [P in keyof TShape]: TShape[P] extends (infer U)[] ? RecursiveReplace<U, TFieldValue>[] : TShape[P] extends number | string | symbol | undefined ? TFieldValue : RecursiveReplace<TShape[P], TFieldValue> };
/**
 * A type where every property is partial (recursive)
 */
type RecursivePartial<T> = { [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object | undefined ? RecursivePartial<T[P]> : T[P] };
type ReadonlyRemapObjectPropertyType<OriginalType, PropertyType> = { readonly [Property in keyof OriginalType]: PropertyType };
type RemapObjectPropertyType<OriginalType, PropertyType> = { [Property in keyof OriginalType]: PropertyType };
/**
 * Removes readonly from all properties (non-recursive)
 */
type Writeable<T> = { -readonly [P in keyof T]: T[P] };
/**
 * Removes readonly from all properties (recursive)
 */
type RecursiveWriteable<T> = { -readonly [P in keyof T]: RecursiveWriteable<T[P]> };
/**
 * Makes a type such that only one of the provided properties is required.
 * RequireOnlyOne<someType, 'prop1'|'prop2'>
 */
type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & { [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>> }[Keys];
type Rest<T extends any[]> = T extends [infer A, ...infer R] ? R : never;
//# sourceMappingURL=ts-utility.d.ts.map

//#endregion
//#region ../core/src/records/map-object.d.ts
/**
 * Maps the top-level properties of an object through a map function.
 * That is, run each of the values of an object through a function,
 * setting the result onto the same key structure as original.
 *
 * It is NOT recursive.
 *
 * The mapping function gets a single args object, consisting of `{ value, field, index }`,
 * where 'value' is the value of the field, 'field' the name, and 'index' a numeric count.
 * @example Double the value of all fields
 * ```js
 * const rect = { width: 100, height: 250 };
 * const doubled = mapObjectShallow(rect, args => {
 *  return args.value*2;
 * });
 * // Yields: { width: 200, height: 500 }
 * ```
 *
 * Since the map callback gets the name of the property, it can do context-dependent things.
 * ```js
 * const rect = { width: 100, height: 250, colour: 'red' }
 * const doubled = mapObjectShallow(rect, args => {
 *  if (args.field === 'width') return args.value*3;
 *  else if (typeof args.value === 'number') return args.value*2;
 *  return args.value;
 * });
 * // Yields: { width: 300, height: 500, colour: 'red' }
 * ```
 * In addition to bulk processing, it allows remapping of property types.
 *
 * In terms of type-safety, the mapped properties are assumed to have the
 * same type.
 *
 * ```js
 * const o = {
 *  x: 10,
 *  y: 20,
 *  width: 200,
 *  height: 200
 * }
 *
 * // Make each property use an averager instead
 * const oAvg = mapObjectShallow(o, args => {
 *  return movingAverage(10);
 * });
 *
 * // Instead of { x:number, y:number... }, we now have { x:movingAverage(), y:movingAverage()... }
 * // Add a value to the averager
 * oAvg.x.add(20);
 * ```
 */
declare const mapObjectShallow: <TSource extends Record<string, any>, TFieldValue>(object: TSource, mapFunction: (args: MapObjectArgs) => TFieldValue) => RemapObjectPropertyType<TSource, TFieldValue>;
type MapObjectArgs = {
  field: string;
  path: string;
  value: any;
  index: number;
};
/**
 * Maps the contents of `data` using `mapper` as a structured set of map functions.
 * ```js
 * const a = {
 *  person: {
 *    size: 20
 *  }
 *  hello: `there`
 * }
 * mapObjectByObject(a, {
 *  person: {
 *    size: (value, context) => {
 *      return value * 2
 *    }
 *  }
 * });
 * // Yields: { person: { size: 40 }, hello: `there` }
 * ```
 * @param data
 * @param mapper
 * @returns
 */
declare function mapObjectByObject(data: object, mapper: Record<string, (value: any, context: any) => any>): {
  [k: string]: any;
};
//# sourceMappingURL=map-object.d.ts.map
//#endregion
//#region ../core/src/records/map-object-keys.d.ts
/**
 * Maps the keys of an object, returning a transformed object.
 * ```js
 * const input = {
 *  hello: `there`,
 *  chap: `chappie`
 * }
 *
 * mapObjectKeys(input, key => key.toUppercase());
 *
 * // Yields: { HELLO: `there`, CHAP: `chappie` }
 * ```
 * @param object
 * @param mapFunction
 * @returns
 */
declare const mapObjectKeys: <TKeySource extends string | number | symbol, TKeyDestination extends string | number | symbol>(object: Record<TKeySource, unknown>, mapFunction: (key: TKeySource) => TKeyDestination) => Record<TKeyDestination, unknown>;
//# sourceMappingURL=map-object-keys.d.ts.map
//#endregion
//#region ../core/src/records/traverse.d.ts
type RecordEntry = Readonly<{
  name: string;
  sourceValue: any;
  nodeValue: any;
}>;
type RecordEntryWithAncestors = Readonly<{
  name: string;
  sourceValue: any;
  nodeValue: any;
  ancestors: string[];
}>;
type RecordEntryStatic = Readonly<{
  name: string;
  value: any;
  ancestors: string[];
}>;
/**
 * Options for parsing a path
 */
type PathOpts = {
  /**
   * Separator for path, eg '.'
   */
  readonly separator?: string;
};
type RecordChildrenOptions = Readonly<{
  /**
   * If set, only uses leaves or branches. 'none' means there is no filter.
   */
  filter: `none` | `leaves` | `branches`;
  /**
   * Default name to use. This is necessary in some cases, eg a root object.
   */
  name: string;
}>;
/**
 * Helper function to get a 'friendly' string representation of an array of {@link RecordEntry}.
 * @param entries
 * @returns
 */
declare function prettyPrintEntries(entries: readonly RecordEntry[]): string;
/**
 * Returns a human-friendly debug string for a tree-like structure
 * ```js
 * console.log(Trees.prettyPrint(obj));
 * ```
 * @param indent
 * @param node
 * @param options
 * @returns
 */
declare const recordEntryPrettyPrint: (node: object, indent?: number, options?: Partial<RecordChildrenOptions>) => string;
/**
 * Returns the direct children of a tree-like object as a pairing
 * of node name and value. Supports basic objects, Maps and arrays.
 *
 * Sub-children are included as an object blob.
 *
 * @example Simple object
 * ```js
 * const o = {
 *  colour: {
 *    r: 0.5, g: 0.5, b: 0.5
 *  }
 * };
 *
 * const children = [ ...Trees.children(o) ];
 * // Children:
 * // [
 * //  { name: "colour", value: { b: 0.5, g: 0.5, r: 0.5 } }
 * // ]
 * const subChildren = [ ...Trees.children(o.colour) ];
 * // [ { name: "r", value: 0.5 }, { name: "g", value: 0.5 }, { name: "b", value: 0.5 } ]
 * ```
 *
 * Arrays are assigned a name based on index.
 * @example Arrays
 * ```js
 * const colours = [ { r: 1, g: 0, b: 0 }, { r: 0, g: 1, b: 0 }, { r: 0, g: 0, b: 1 } ];
 * // Children:
 * // [
 * //  { name: "array[0]", value: {r:1,g:0,b:0} },
 * //  { name: "array[1]", value: {r:0,g:1,b:0} },
 * //  { name: "array[2]", value: {r:0,g:0,b:1} },
 * // ]
 * ```
 *
 * Pass in `options.name` (eg 'colours') to have names generated as 'colours[0]', etc.
 * Options can also be used to filter children. By default all direct children are returned.
 * @param node
 * @param options
 */
declare function recordChildren<T extends object>(node: T, options?: Partial<RecordChildrenOptions>): IterableIterator<RecordEntry>;
declare function recordEntriesDepthFirst<T extends object>(node: T, options?: Partial<RecordChildrenOptions>, ancestors?: string[]): IterableIterator<RecordEntryWithAncestors>;
/**
 * Returns the closest matching entry, tracing `path` in an array, Map or simple object.
 * Returns an entry with _undefined_ value at the point where tracing stopped.
 * Use {@link traceRecordEntryByPath} to step through all the segments.
 *
 * ```js
  * const people = {
    *  jane: {
 *   address: {
 *    postcode: 1000,
    *    street: 'West St',
    *    city: 'Blahville'
 *   },
 * colour: 'red'
  *  }
 * }
 * Trees.getByPath('jane.address.postcode', people); // '.' default separator
 * // ['postcode', 1000]
 * Trees.getByPath('jane.address.country.state', people);
 * // ['country', undefined] - since full path could not be resolved.
 * ```
 * @param path Path, eg `jane.address.postcode`
 * @param node Node to look within
 * @param options Options for parsing path. By default '.' is used as a separator
 * @returns
 */
declare function getRecordEntryByPath<T extends object>(path: string, node: T, options?: PathOpts): RecordEntry;
/**
 * Enumerates over children of `node` towards the node named in `path`.
 * This is useful if you want to get the interim steps to the target node.
 *
 * Use {@link getRecordEntryByPath} if you don't care about interim steps.
 *
 * ```js
 * const people = {
 *  jane: {
 *   address: {
 *    postcode: 1000,
 *    street: 'West St',
 *    city: 'Blahville'
 *   },
 * colour: 'red'
 *  }
 * }
 * for (const p of Trees.traceByPath('jane.address.street', people)) {
 * // { name: "jane", value: { address: { postcode: 1000,street: 'West St', city: 'Blahville' }, colour: 'red'} },
 * // { name: "address", value: { postcode: 1000, street: 'West St', city: 'Blahville' } },
 * // { name: "street", value: "West St" } }
 * }
 * ```
 *
 * Results stop when the path can't be followed any further.
 * The last entry will have a name of the last sought path segment, and _undefined_ as its value.
 *
 * @param path Path to traverse
 * @param node Starting node
 * @param options Options for path traversal logic
 * @returns
 */
declare function traceRecordEntryByPath<T extends object>(path: string, node: T, options?: PathOpts): Iterable<RecordEntryWithAncestors>;
//# sourceMappingURL=traverse.d.ts.map
//#endregion
//#region ../core/src/records/merge.d.ts
type OptionalPropertyNames<T> = { [K in keyof T]-?: ({} extends Record<K, T[K]> ? K : never) }[keyof T];
type SpreadProperties<L, R, K extends keyof L & keyof R> = { [P in K]: L[P] | Exclude<R[P], undefined> };
type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;
type SpreadTwo<L, R> = Id<Pick<L, Exclude<keyof L, keyof R>> & Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>> & Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>> & SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>>;
type Spread<A extends readonly [...any]> = A extends [infer L, ...infer R] ? SpreadTwo<L, Spread<R>> : unknown;
declare function mergeObjects<A extends object[]>(...a: [...A]): Spread<A>;
//#endregion
//#region ../core/src/records/keys-to-numbers.d.ts
/**
 * Returns a copy of `object` with integer numbers as keys instead of whatever it has.
 * ```js
 * keysToNumbers({ '1': true }); // Yields: { 1: true }
 * ```
 *
 * The `onInvalidKey` sets how to handle keys that cannot be converted to integers.
 * * 'throw' (default): throws an exception
 * * 'ignore': that key & value is ignored
 * * 'keep': uses the string key instead
 *
 *
 * ```js
 * keysToNumber({ hello: 'there' }, `ignore`); // Yields: {  }
 * keysToNumber({ hello: 'there' }, `throw`);  // Exception
 * keysToNumber({ hello: 'there' }, `keep`);   // Yields: { hello: 'there' }
 * ```
 *
 * Floating-point numbers will be converted to integer by rounding.
 * ```js
 * keysToNumbers({ '2.4': 'hello' }); // Yields: { 2: 'hello' }
 * ```
 * @param object
 * @param onInvalidKey
 * @returns
 */
declare const keysToNumbers: <T>(object: Record<string | number | symbol, T>, onInvalidKey?: `throw` | `ignore` | `keep`) => Record<number, T>;
//# sourceMappingURL=keys-to-numbers.d.ts.map
declare namespace index_d_exports {
  export { ChangeKind, ChangeRecord, CompareChangeSet, MapObjectArgs, PathOpts, RecordChildrenOptions, RecordEntry, RecordEntryStatic, RecordEntryWithAncestors, Spread, changedObjectDataFields, cloneFromFields, compareArrays, compareObjectData, compareObjectKeys, getRecordEntryByPath, keysToNumbers, mapObjectByObject, mapObjectKeys, mapObjectShallow, mergeObjects, prettyPrintEntries, recordChildren, recordEntriesDepthFirst, recordEntryPrettyPrint, traceRecordEntryByPath };
}
//#endregion
//#region ../core/src/is-equal.d.ts
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
declare const toStringOrdered: (itemToMakeStringFor: unknown) => string;
/**
 * Default comparer function is equiv to checking `a === b`.
 * Use {@link isEqualValueDefault} to compare by value, via comparing JSON string representation.
 */
declare const isEqualDefault: <T>(a: T, b: T) => boolean;
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
declare const isEqualValueDefault: <T>(a: T, b: T) => boolean;
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
declare const isEqualValuePartial: (a: Record<string, unknown>, b: Record<string, unknown>, fieldComparer?: IsEqual$1<unknown>) => boolean;
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
declare const isEqualValueIgnoreOrder: <T>(a: T, b: T) => boolean;
/**
 * Returns _true_ if Object.entries() is empty for `value`
 * @param value
 * @returns
 */
declare const isEmptyEntries: (value: object) => boolean;
/**
 * Return _true_ if `a` and `b` ought to be considered equal
 * at a given path
 */
type IsEqualContext$1<V> = (a: V, b: V | undefined, path: string) => boolean;
/**
 * Returns _true_ if `a` and `b` are equal based on their JSON representations.
 * `path` is ignored.
 * @param a
 * @param b
 * @param path
 * @returns
 */
declare const isEqualContextString: IsEqualContext$1<unknown>;
//# sourceMappingURL=is-equal.d.ts.map
//#endregion
//#region ../core/src/types.d.ts
type ToString$1<V> = (itemToMakeStringFor: V) => string;
type StringOrNumber = string | number | bigint;
type Primitive = string | number | bigint | boolean;
type PrimitiveOrObject = Primitive | object;
type BasicType$1 = StringOrNumber | object | boolean;
type KeyValue = readonly [key: string, value: StringOrNumber];
/**
 * Interval types allows for more expressive coding, rather than embedding millisecond values.
 *
 * That is, we can use `{ mins: 5 }` to mean 5 minutes rather than `5*60*1000`
 * or worse, 300000, for the same value.
 *
 * @example
 * ```js
 * { hours: 1 };  // 1 hour
 * { mins: 5 };   // 5 mins
 * { secs: 5 };   // 5 secs
 * { millis: 5 }; // 5 milliseconds
 * ```
 *
 * If several fields are used, this sums their value
 * ```js
 * { secs: 2, millis: 1 }; // equal 2001 milliseconds.
 * ```
 *
 * Wherever ixfx takes an `Interval`, you can also just provide a number instead.
 * This will be taken as a millisecond value.
 *
 * @see {@link intervalToMs} to convert to milliseconds.
 * @see {@link isInterval} check whether input is an Interval type
 * @see {@link elapsedToHumanString} render interval in human-friendly form
 */
type Interval$1 = number | {
  readonly millis?: number;
  readonly secs?: number;
  readonly hours?: number;
  readonly mins?: number;
};
type IDictionary<K, V> = {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
};
type IWithEntries<K, V> = {
  entries(): IterableIterator<readonly [K, V]>;
};
type RankArrayOptions = RankOptions & {
  /**
   * If _true_, it's only the highest _within_ an array that is considered,
   * rather than tracking the higest between arrays
   * Default: _false_
   */
  withinArrays?: boolean;
};
/**
 * A rank function that compares A and B.
 * Returns the highest value, 'a' or 'b'.
 * Returns 'eq' if values are equal
 */
type RankFunction<T> = (a: T, b: T) => `a` | `b` | `eq`;
type RankOptions = {
  /**
   * If set, only values with this JS type are included
   */
  includeType?: `string` | `number` | `object` | `boolean`;
  /**
   * If _true_, also emits values when they rank equal with current highest.
   * _false_ by default
   */
  emitEqualRanked?: boolean;
  /**
   * If _true_, emits the current highest value even if it hasn't changed.
   * This means it will match the tempo of the incoming stream.
   */
  emitRepeatHighest?: boolean;
};
//# sourceMappingURL=types.d.ts.map
declare namespace maps_d_exports {
  export { GetOrGenerate, MergeReconcile, addObjectEntriesMutate, addValue, addValueMutate, addValueMutator, deleteByValueCompareMutate, filterValues, findBySomeKey, findEntryByPredicate, findEntryByValue, findValue, fromIterable, fromObject, getClosestIntegerKey, getOrGenerate, getOrGenerateSync, hasAnyValue, hasKeyValue, mapToArray, mapToObjectTransform, mergeByKey, some, sortByValue, sortByValueProperty, toArray, toObject, transformMap, zipKeyValue };
}
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
declare const getClosestIntegerKey: (data: ReadonlyMap<number, unknown>, target: number) => number;
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
declare const findBySomeKey: <T>(data: ReadonlyMap<string, T>, keys: Iterable<string>) => T | undefined;
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
declare const hasKeyValue: <K, V>(map: ReadonlyMap<K, V>, key: K, value: V, comparer?: IsEqual$1<V>) => boolean;
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
declare const deleteByValueCompareMutate: <K, V>(map: Map<K, V>, value: V, comparer?: IsEqual$1<V>) => void;
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
declare const findEntryByPredicate: <K, V>(map: IWithEntries<K, V>, predicate: (value: V, key: K) => boolean) => readonly [key: K, value: V] | undefined;
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
declare const findEntryByValue: <K, V>(map: IWithEntries<K, V>, value: V, isEqual?: IsEqual$1<V>) => readonly [key: K, value: V] | undefined;
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
declare const addValueMutate: <V>(map: Map<string, V> | undefined, hasher: ToString$1<V>, collisionPolicy: `overwrite` | `skip` | `throw`, ...values: readonly V[]) => Map<string, V>;
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
declare const addValue: <V>(map: Map<string, V> | ReadonlyMap<string, V> | undefined, hasher: ToString$1<V>, collisionPolicy: `overwrite` | `skip` | `throw`, ...values: readonly V[]) => Map<string, V>;
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
declare const addValueMutator: <V>(map: Map<string, V>, hasher: ToString$1<V>, collisionPolicy?: `overwrite` | `skip` | `throw`) => (...values: readonly V[]) => Map<string, V>;
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
declare const sortByValue: <K, V>(map: ReadonlyMap<K, V>, comparer?: (a: V, b: V) => number) => [K, V][];
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
declare const sortByValueProperty: <K, V, Z>(map: ReadonlyMap<K, V>, property: string, compareFunction?: (a: Z, b: Z) => number) => [K, V][];
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
declare const hasAnyValue: <K, V>(map: ReadonlyMap<K, V>, value: V, comparer: IsEqual$1<V>) => boolean;
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
declare function filterValues<V>(map: ReadonlyMap<string, V>, predicate: (v: V) => boolean): Generator<V, void, unknown>;
/**
 * Copies data to an array
 * @param map
 * @returns
 */
declare const toArray: <V>(map: ReadonlyMap<string, V>) => readonly V[];
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
declare const fromIterable: <V>(data: Iterable<V>, keyFunction?: (itemToMakeStringFor: V) => string, collisionPolicy?: `overwrite` | `skip` | `throw`) => ReadonlyMap<string, V>;
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
declare const fromObject: <V>(data: object | object[]) => ReadonlyMap<string, V>;
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
declare const addObjectEntriesMutate: <V>(map: Map<string, V>, data: object) => void;
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
declare const findValue: <K, V>(map: ReadonlyMap<K, V>, predicate: (v: V) => boolean) => V | undefined;
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
declare const some: <V>(map: ReadonlyMap<string, V>, predicate: (v: V) => boolean) => boolean;
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
declare const mapToObjectTransform: <T, K>(m: ReadonlyMap<string, T>, valueTransform: (value: T) => K) => Readonly<Record<string, K>>;
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
declare const zipKeyValue: <V>(keys: readonly string[], values: ArrayLike<V | undefined>) => {
  [k: string]: V | undefined;
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
declare const transformMap: <K, V, R>(source: ReadonlyMap<K, V>, transformer: (value: V, key: K) => R) => Map<K, R>;
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
declare const toObject: <T>(m: ReadonlyMap<string, T>) => Readonly<Record<string, T>>;
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
declare const mapToArray: <K, V, R>(m: ReadonlyMap<K, V>, transformer: (key: K, item: V) => R) => readonly R[];
/**
 * Returns a result of `a` merged into `b`.
 * `b` is always the 'newer' data that takes
 * precedence.
 */
type MergeReconcile<V> = (a: V, b: V) => V;
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
declare const mergeByKey: <K, V>(reconcile: MergeReconcile<V>, ...maps: readonly ReadonlyMap<K, V>[]) => ReadonlyMap<K, V>;
type GetOrGenerate<K, V, Z> = (key: K, args?: Z) => Promise<V>;
/**
 * @inheritDoc getOrGenerate
 * @param map
 * @param fn
 * @returns
 */
declare const getOrGenerateSync: <K, V, Z>(map: IDictionary<K, V>, fn: (key: K, args?: Z) => V) => (key: K, args?: Z) => V;
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
declare const getOrGenerate: <K, V, Z>(map: IDictionary<K, V>, fn: (key: K, args?: Z) => Promise<V> | V) => GetOrGenerate<K, V, Z>;
//# sourceMappingURL=maps.d.ts.map
declare namespace pathed_d_exports {
  export { CompareDataOptions, PathData, PathDataChange, applyChanges, compareData, getField, getPaths, getPathsAndData, updateByPath };
}
/**
 * Data at a particular path
 */
type PathData<V> = {
  /**
   * Path
   */
  path: string;
  /**
   * Value
   */
  value: V;
};
/**
 * A change to a value
 */
type PathDataChange<V> = PathData<V> & {
  /**
   * Previous value, if any
   */
  previous?: V;
  /**
   * Nature of the change
   */
  state: `change` | `added` | `removed`;
};
/**
 * Compare data
 */
type CompareDataOptions<V> = {
  /**
   * If _true_, it treats the B value as a partial
   * version of B. Only the things present in B are compared.
   * Omissions from B are not treated as removed keys.
   */
  asPartial: boolean;
  /**
   * If _true_ (default), if a value is undefined,
   * it signals that the key itself is removed.
   */
  undefinedValueMeansRemoved: boolean;
  pathPrefix: string;
  /**
   * Comparison function for values. By default uses
   * JSON.stringify() to compare by value.
   */
  eq: IsEqualContext<V>;
  /**
   * If true, inherited fields are also compared.
   * This is necessary for events, for example.
   *
   * Only plain-object values are used, the other keys are ignored.
   */
  deepEntries: boolean;
  /**
   * If _true_, includes fields that are present in B, but missing in A.
   * _False_ by default.
   */
  includeMissingFromA: boolean;
  /**
   * If _true_, emits a change under the path of a parent if its child has changed.
   * If _false_ (default) only changed keys are emitted.
   *
   * Eg if data is:
   * `{ colour: { h:0.5, s: 0.3, l: 0.5 }}`
   * and we compare with:
   * `{ colour: { h:1, s: 0.3, l: 0.5 }}`
   *
   * By default only 'colour.h' is emitted. If _true_ is set, 'colour' and 'colour.h' is emitted.
   */
  includeParents: boolean;
  skipInstances: WeakSet<any>;
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
declare function compareData<V extends Record<string, any>>(a: V, b: Partial<V>, options?: Partial<CompareDataOptions<V>>): Generator<PathDataChange<any>>;
/**
 * Returns a copy of `source` with `changes` applied.
 * @param source
 * @param changes
 */
declare const applyChanges: <V extends Record<string, any>>(source: V, changes: PathDataChange<any>[]) => V;
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
declare const updateByPath: <V extends Record<string, any>>(target: V, path: string, value: any, allowShapeChange?: boolean) => V;
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
declare const getField: <V>(object: Record<string, any>, path: string, separator?: string) => Result<V, any>;
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
declare function getPaths(object: object | null, onlyLeaves?: boolean): Generator<string>;
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
declare function getPathsAndData(o: object, onlyLeaves?: boolean, maxDepth?: number, prefix?: string): Generator<PathData<any>>;
//# sourceMappingURL=pathed.d.ts.map
//#endregion
//#region ../core/src/comparers.d.ts
type CompareResult = number;
type Comparer<V> = (a: V, b: V) => CompareResult;
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
declare const numericComparer: (a: number, b: number) => CompareResult;
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
declare const jsComparer: (x: any, y: any) => CompareResult;
/**
 * Inverts the source comparer.
 * @param comparer
 * @returns
 */
declare const comparerInverse: <V>(comparer: Comparer<V>) => Comparer<V>;
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
declare const defaultComparer: (x: any, y: any) => CompareResult;
//# sourceMappingURL=comparers.d.ts.map
//#endregion
//#region ../core/src/continuously.d.ts
type HasCompletionRunStates = `idle` | `scheduled` | `running`;
type HasCompletion = {
  /**
   * Gets the current run state
   * idle: not yet started or completed with no future run scheduled
   * scheduled: waiting to run
   * running: currently executing its callback
   */
  get runState(): HasCompletionRunStates;
  /**
   * Returns the number of times the scheduled function
   * has been executed.
   *
   * This number will be reset in some conditions.
   * For example `continuously` resets it when the loop stops.
   *
   * Use {@link startCountTotal} to track total number.
   */
  get startCount(): number;
  /**
   * Total number of times scheduled function has been
   * executed.
   */
  get startCountTotal(): number;
};
/**
 * Runs a function continuously, returned by {@link continuously}
 */
type Continuously = HasCompletion & {
  /**
   * Starts loop. If already running, does nothing
   */
  start(): void;
  /**
   * (Re-)starts the loop. If an existing iteration has been
   * scheduled, this is cancelled and started again.
   *
   * This can be useful when adjusting the interval
   */
  reset(): void;
  /**
   * How many milliseconds since loop was started after being stopped.
   */
  get elapsedMs(): number;
  /**
   * If disposed, the continuously instance won't be re-startable
   */
  get isDisposed(): boolean;
  /**
   * Stops loop. It can be restarted using .start()
   */
  cancel(): void;
  /**
   * Sets the interval speed of loop. Change will take effect on next loop. For it to kick
   * in earlier, call .reset() after changing the value.
   */
  set interval(interval: Interval);
  /**
   * Gets the current interval, ie. speed of loop.
   */
  get interval(): Interval;
};
type ContinuouslySyncCallback = (
/**
 * Number of times loop
 * Ticks is reset when loop exits.
 */
ticks?: number,
/**
 * Elapsed milliseconds.
 * Reset when loop exits
 */
elapsedMs?: number) => boolean | void;
type ContinuouslyAsyncCallback = (
/**
 * Number of times loop has run
 * Reset when loop exits.
 */
ticks?: number,
/**
 * Elapsed milliseconds.
 * Reset when loop exits.
 */
elapsedMs?: number) => Promise<boolean | void>;
type OnStartCalled = `continue` | `cancel` | `reset` | `dispose`;
/**
 * Options for {@link continuously}
 */
type ContinuouslyOpts = Readonly<{
  /**
   * Abort signal to exit loop
   */
  signal: AbortSignal;
  /**
   * If _true_, callback runs before waiting period.
   * @defaultValue false
   */
  fireBeforeWait: boolean;
  /**
   * Called whenever .start() is invoked.
   * If this function returns:
   *  - `continue`: the loop starts if it hasn't started yet, or continues if already started
   *  - `cancel`: loop stops, but can be re-started if .start() is called again
   *  - `dispose`: loop stops and will throw an error if .start() is attempted to be called
   *  - `reset`: loop resets (ie. existing scheduled task is cancelled)
   *
   */
  onStartCalled: (
  /**
   * Number of times loop has run
   * Reset when loop is exits.
   */
  ticks?: number,
  /**
   * Elapsed milliseconds.
   * Reset when loop is exits.
   */
  elapsedMs?: number) => OnStartCalled;
}>;
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
declare const continuously: (callback: ContinuouslyAsyncCallback | ContinuouslySyncCallback, interval?: Interval, options?: Partial<ContinuouslyOpts>) => Continuously;
//# sourceMappingURL=continuously.d.ts.map
//#endregion
//#region ../core/src/correlate.d.ts
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
//#region ../core/src/default-keyer.d.ts
/**
 * If values are strings, uses that as the key.
 * Otherwise uses `JSON.stringify`.
 * @param a
 * @returns
 */
declare const defaultKeyer: <V>(a: V) => string;
//# sourceMappingURL=default-keyer.d.ts.map
//#endregion
//#region ../core/src/elapsed.d.ts
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
//#region ../core/src/filters.d.ts
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
//#region ../core/src/is-equal-test.d.ts
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
declare const isEqualTrace: <T>(eq: IsEqual$1<T>) => IsEqual$1<T>;
//# sourceMappingURL=is-equal-test.d.ts.map

//#endregion
//#region ../core/src/is-integer.d.ts
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
//#region ../core/src/is-primitive.d.ts
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
//#region ../core/src/iterable-compare-values-shallow.d.ts
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
//#region ../core/src/key-value.d.ts
type KeyValueSorter = (data: KeyValue[]) => KeyValue[];
type KeyValueSortSyles = `value` | `value-reverse` | `key` | `key-reverse`;
declare const keyValueSorter: (sortStyle: KeyValueSortSyles) => KeyValueSorter;
//# sourceMappingURL=key-value.d.ts.map

//#endregion
//#region ../core/src/interval-type.d.ts
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
declare function intervalToMs(interval: Interval$1 | undefined, defaultNumber?: number): number;
/**
 * Returns _true_ if `interval` matches the {@link Interval} type.
 * @param interval
 * @returns _True_ if `interval` is an {@link Interval}.
 */
declare function isInterval(interval: number | Interval$1 | undefined): interval is Interval$1;
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
declare const elapsedToHumanString: (millisOrFunction: number | (() => number) | Interval$1, rounding?: number) => string;
//# sourceMappingURL=interval-type.d.ts.map
//#endregion
//#region ../core/src/to-string.d.ts
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
//#region ../core/src/track-unique.d.ts
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
//#region ../core/src/platform.d.ts
/**
 * Returns _true_ if it seems like the code is running on iOS (iPad/iPhone)
 * @returns
 */
declare const runningiOS: () => boolean;
//# sourceMappingURL=platform.d.ts.map
//#endregion
//#region ../core/src/promise-from-event.d.ts
declare const promiseFromEvent: (target: EventTarget, name: string) => Promise<any>;
//# sourceMappingURL=promise-from-event.d.ts.map

//#endregion
//#region ../core/src/types-reactive.d.ts
/**
 * A reactive that does not have an initial value
 */
type ReactiveNonInitial$1<V> = Reactive<V> & {
  last(): V | undefined;
};
/**
 * A reactive with an initial value
 */
type ReactiveInitial<V> = Reactive<V> & {
  last(): V;
};
/**
 * Unsubscribes from a reactive
 */
type Unsubscriber = () => void;
/**
 * Signals
 */
type SignalKinds = `done` | `warn`;
/**
 * A message
 */
type Passed<V> = {
  value: V | undefined;
  signal?: SignalKinds;
  context?: string;
};
/**
 * A Reactive
 */
type Reactive<V> = {
  /**
   * Subscribes to a reactive. Receives
   * data as well as signals. Use `onValue` if you
   * just care about values.
   *
   * Return result unsubscribes.
   *
   * ```js
   * const unsub = someReactive.on(msg => {
   *    // Do something with msg.value
   * });
   *
   * unsub(); // Unsubscribe
   * ```
   * @param handler
   */
  on(handler: (value: Passed<V>) => void): Unsubscriber;
  /**
   * Subscribes to a reactive's values.
   * Returns a function that unsubscribes.
   * @param handler
   */
  onValue(handler: (value: V) => void): Unsubscriber;
  /**
   * Disposes the reactive, providing a reason for debug tracing
   * @param reason
   */
  dispose(reason: string): void;
  /**
   * Returns _true_ if Reactive is disposed
   */
  isDisposed(): boolean;
  /**
   * Optional 'set' to write a value.
   * @param value
   */
  set?(value: V): void;
};
//# sourceMappingURL=types-reactive.d.ts.map
//#endregion
//#region ../core/src/reactive-core.d.ts
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
//#region ../core/src/resolve-core.d.ts
/**
 * Something that can resolve to a value
 */
type ResolveToValueSync<V> = BasicType | ReactiveNonInitial$1<V> | Generator<V> | IterableIterator<V> | ((...args: unknown[]) => V);
type ResolveToValueAsync<V> = AsyncGenerator<V> | AsyncIterableIterator<V> | Promise<V> | ((...args: unknown[]) => Promise<V>);
type ResolveToValue$1<V> = ResolveToValueAsync<V> | ResolveToValueSync<V>;
/**
 * Resolves the input to a concrete value.
 *
 * The input can be:
 * * primitive value (string, boolean, number, object)
 * * a/sync function
 * * a/sync generator/iterator
 * * ReactiveNonInitial
 *
 * Examples:
 * ```js
 * await resolve(10);       // 10
 * await resolve(() => 10); // 10
 * await resole(async () => {
 *  sleep(100);
 *  return 10;
 * });                // 10
 * ```
 *
 * If the input is a function, any arguments given to `resolve` are passed to it as a spread.
 *
 * Resolve is not recursive. If the input is an object, it will be returned, even
 * though its properties may be resolvable. Use {@link resolveFields} if you want to handle this case.
 * @param resolvable Input to resolve
 * @param args Additional arguments to pass to function-resolvables.
 * @returns
 */
declare function resolve<V extends BasicType>(resolvable: ResolveToValue$1<V>, ...args: unknown[]): Promise<V>;
/**
 * For the given input, attempts to 'resolve' it. See {@link resolve} for details and asynchronous version.
 * @param resolvable
 * @param args
 * @returns
 */
declare function resolveSync<V extends BasicType>(resolvable: ResolveToValueSync<V>, ...args: unknown[]): V;
/**
 * Resolves a value as per {@link resolve}, however f an error is thrown
 * or the resolution results in _undefined_
 * or NaN, the fallback value is returned instead.
 *
 * `null` is an allowed return value.
 *
 * ```js
 * // Function returns undefined 50% of the time or 0
 * const fn = () => {
 *  if (Math.random() >= 0.5) return; // undefined
 *  return 0;
 * }
 * const r = resolveWithFallback(fn, 1);
 * const value = r(); // Always 0 or 1
 * ```
 *
 * See also {@link resolveWithFallbackSync}
 * @param p Thing to resolve
 * @param options Fallback value if an error happens, undefined or NaN
 * @param args
 * @returns
 */
declare function resolveWithFallback<T extends BasicType>(p: ResolveToValue$1<T>, options: ResolveFallbackOptions<T>, ...args: unknown[]): Promise<T>;
/**
 * Resolves a 'resolvable', using a fallback value if it results to _undefined_ or _NaN_. _null_ is allowed.
 *
 * See also {@link resolveWithFallback} for the asynchronous version.
 *
 * Options:
 * * value: Fallback value
 * * overrideWithLast: If true, uses the previously-valid value as the replacement fallback (default: false)
 * @param p
 * @param options
 * @param args
 * @returns
 */
declare function resolveWithFallbackSync<T extends BasicType>(p: ResolveToValueSync<T>, options: ResolveFallbackOptions<T>, ...args: unknown[]): T;
/**
 * Options for {@link resolveWithFallbackSync}
 */
type ResolveFallbackOptions<T> = {
  /**
   * Fallback value
   */
  value: T;
  /**
   * If _true_, will use the last valid value as a replacement fallback
   * Default: false
   */
  overrideWithLast?: boolean;
};
//# sourceMappingURL=resolve-core.d.ts.map
//#endregion
//#region ../core/src/resolve-fields.d.ts
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
//#region ../core/src/sleep.d.ts
type SleepOpts<V> = Interval$1 & Partial<{
  readonly signal: AbortSignal;
  readonly value: V;
}>;
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
declare const sleep: <V>(optsOrMillis: SleepOpts<V>) => Promise<V | undefined>;
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
declare const sleepWhile: (predicate: () => boolean, checkInterval?: Interval$1) => Promise<void>;
//# sourceMappingURL=sleep.d.ts.map
//#endregion
//#region ../core/src/types-array.d.ts
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
export { AlignOpts, ArrayItems, ArrayLengthMutationKeys, BasicType$1 as BasicType, ChangeKind, ChangeRecord, CompareChangeSet, CompareResult, Comparer, Continuously, ContinuouslyAsyncCallback, ContinuouslyOpts, ContinuouslySyncCallback, DataWithId, FixedLengthArray, HasCompletion, HasCompletionRunStates, IDictionary, IWithEntries, Interval$1 as Interval, IsEqual$1 as IsEqual, IsEqualContext$1 as IsEqualContext, KeyValue, KeyValueSortSyles, KeyValueSorter, maps_d_exports as Maps, OnStartCalled, Passed, pathed_d_exports as Pathed, Primitive, PrimitiveOrObject, RankArrayOptions, RankFunction, RankOptions, Reactive, ReactiveInitial, ReactiveNonInitial$1 as ReactiveNonInitial, ReadonlyRemapObjectPropertyType, index_d_exports as Records, RecursivePartial, RecursiveReplace, RecursiveWriteable, RemapObjectPropertyType, RequireOnlyOne, ResolveFallbackOptions, ResolveToValue$1 as ResolveToValue, ResolveToValueAsync, ResolveToValueSync, ResolvedObject, Rest, SignalKinds, Similarity, Since, SleepOpts, StringOrNumber, ToString$1 as ToString, TrackUnique, index_d_exports$1 as Trackers, Unsubscriber, Writeable, align, alignById, compareIterableValuesShallow, comparerInverse, continuously, defaultComparer, defaultKeyer, defaultToString, elapsedInfinity, elapsedInterval, elapsedOnce, elapsedSince, elapsedToHumanString, filterValue, hasLast, intervalToMs, isEmptyEntries, isEqualContextString, isEqualDefault, isEqualTrace, isEqualValueDefault, isEqualValueIgnoreOrder, isEqualValuePartial, isInteger, isInterval, isMap, isPrimitive, isPrimitiveOrObject, isReactive, isSet, jsComparer, keyValueSorter, numericComparer, promiseFromEvent, resolve, resolveFields, resolveFieldsSync, resolveSync, resolveWithFallback, resolveWithFallbackSync, runningiOS, sleep, sleepWhile, toStringDefault, toStringOrdered, unique, uniqueInstances };
//# sourceMappingURL=core.d.ts.map