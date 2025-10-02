import { __export } from "./chunk-51aI8Tpl.js";
import { nullUndefTest, resultThrow, testPlainObjectOrPrimitive } from "./src-BBD50Kth.js";
import { isPrimitive } from "./is-primitive-eBwrK4Yg.js";
import { compareIterableValuesShallow, isEqualDefault } from "./interval-type-DajslxUJ.js";

//#region ../core/dist/src/records/map-object-keys.js
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
const mapObjectKeys = (object, mapFunction) => {
	const destinationObject = {};
	for (const entries of Object.entries(object)) {
		const key = mapFunction(entries[0]);
		destinationObject[key] = entries[1];
	}
	return destinationObject;
};

//#endregion
//#region ../core/dist/src/records/compare.js
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
const compareObjectKeys = (a, b) => {
	const c = compareIterableValuesShallow(Object.keys(a), Object.keys(b));
	return c;
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
const changedObjectDataFields = (a, b) => {
	const r = compareObjectData(a, b, true);
	if (Object.entries(r.added).length > 0) throw new Error(`Shape of data has changed`);
	if (Object.entries(r.removed).length > 0) throw new Error(`Shape of data has changed`);
	const output = compareResultToObject(r, b);
	return output;
};
const compareResultToObject = (r, b) => {
	const output = {};
	if (r.isArray) return b;
	for (const entry of Object.entries(r.changed)) output[entry[0]] = entry[1];
	for (const entry of Object.entries(r.added)) output[entry[0]] = entry[1];
	for (const childEntry of Object.entries(r.children)) {
		const childResult = childEntry[1];
		if (childResult.hasChanged) output[childEntry[0]] = compareResultToObject(childResult, b[childEntry[0]]);
	}
	return output;
};
/**
* Produces a {@link CompareChangeSet} between two arrays.
*
* @param a Earlier array to compare
* @param b Later array to compare
* @param eq Equality comparison for values
* @returns Change set.
*/
const compareArrays = (a, b, eq = isEqualDefault) => {
	if (!Array.isArray(a)) throw new Error(`Param 'a' is not an array`);
	if (!Array.isArray(b)) throw new Error(`Param 'b' is not an array`);
	const c = compareObjectData(a, b, false, eq);
	if (!c.isArray) throw new Error(`Change set does not have arrays as parameters`);
	const convert = (key) => {
		if (key.startsWith(`_`)) return Number.parseInt(key.slice(1));
		else throw new Error(`Unexpected key '${key}'`);
	};
	const cc = {
		...c,
		added: mapObjectKeys(c.added, convert),
		changed: mapObjectKeys(c.changed, convert),
		removed: c.removed.map((v) => convert(v)),
		summary: c.summary.map((value) => {
			return [
				value[0],
				convert(value[1]),
				value[2]
			];
		})
	};
	return cc;
};
/**
* Compares A to B. Assumes they are simple objects, essentially key-value pairs, where the
* values are primitive values or other simple objects. It also works with arrays.
*
* Uses === equality semantics by default.
* @param a
* @param b
*/
const compareObjectData = (a, b, assumeSameShape = false, eq = isEqualDefault) => {
	a ??= {};
	b ??= {};
	const entriesA = Object.entries(a);
	const entriesB = Object.entries(b);
	const scannedKeys = /* @__PURE__ */ new Set();
	const changed = {};
	const added = {};
	const children = {};
	const removed = [];
	const isArray = Array.isArray(a);
	const summary = new Array();
	let hasChanged = false;
	for (const entry of entriesA) {
		const outputKey = isArray ? `_${entry[0]}` : entry[0];
		const aValue = entry[1];
		const bValue = b[entry[0]];
		scannedKeys.add(entry[0]);
		if (bValue === void 0) {
			hasChanged = true;
			if (assumeSameShape && !isArray) {
				changed[outputKey] = bValue;
				summary.push([
					`mutate`,
					outputKey,
					bValue
				]);
			} else {
				removed.push(outputKey);
				summary.push([
					`del`,
					outputKey,
					aValue
				]);
			}
			continue;
		}
		if (typeof aValue === `object`) {
			const r = compareObjectData(aValue, bValue, assumeSameShape, eq);
			if (r.hasChanged) hasChanged = true;
			children[outputKey] = r;
			const childSummary = r.summary.map((sum) => {
				return [
					sum[0],
					outputKey + `.` + sum[1],
					sum[2]
				];
			});
			summary.push(...childSummary);
		} else if (!eq(aValue, bValue)) {
			changed[outputKey] = bValue;
			hasChanged = true;
			summary.push([
				`mutate`,
				outputKey,
				bValue
			]);
		}
	}
	if (!assumeSameShape || isArray) for (const entry of entriesB) {
		const key = isArray ? `_${entry[0]}` : entry[0];
		if (scannedKeys.has(entry[0])) continue;
		added[key] = entry[1];
		hasChanged = true;
		summary.push([
			`add`,
			key,
			entry[1]
		]);
	}
	return {
		changed,
		added,
		removed,
		children,
		hasChanged,
		isArray,
		summary
	};
};

//#endregion
//#region ../core/dist/src/records/clone-from-fields.js
const cloneFromFields = (source) => {
	const entries = [];
	for (const field in source) {
		const value = source[field];
		if (testPlainObjectOrPrimitive(value)) entries.push([field, value]);
	}
	return Object.fromEntries(entries);
};

//#endregion
//#region ../core/dist/src/records/map-object.js
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
const mapObjectShallow = (object, mapFunction) => {
	const entries = Object.entries(object);
	const mapped = entries.map(([sourceField, sourceFieldValue], index) => [sourceField, mapFunction({
		value: sourceFieldValue,
		field: sourceField,
		index,
		path: sourceField
	})]);
	return Object.fromEntries(mapped);
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
function mapObjectByObject(data, mapper) {
	const entries = Object.entries(data);
	for (const entry of entries) if (entry[0] in mapper) {
		const m = mapper[entry[0]];
		entry[1] = typeof m === `object` ? mapObjectByObject(entry[1], m) : m(entry[1], data);
	}
	return Object.fromEntries(entries);
}

//#endregion
//#region ../core/dist/src/records/traverse.js
/**
* Helper function to get a 'friendly' string representation of an array of {@link RecordEntry}.
* @param entries
* @returns
*/
function prettyPrintEntries(entries) {
	if (entries.length === 0) return `(empty)`;
	let t = ``;
	for (const [index, entry] of entries.entries()) {
		t += `  `.repeat(index);
		t += entry.name + ` = ` + JSON.stringify(entry.nodeValue) + `\n`;
	}
	return t;
}
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
const recordEntryPrettyPrint = (node, indent = 0, options = {}) => {
	resultThrow(nullUndefTest(node, `node`));
	const defaultName = options.name ?? `node`;
	const entry = getNamedRecordEntry(node, defaultName);
	const t = `${`  `.repeat(indent)} + name: ${entry.name} value: ${JSON.stringify(entry.nodeValue)}`;
	const childrenAsArray = [...recordChildren(node, options)];
	return childrenAsArray.length > 0 ? t + `\n` + childrenAsArray.map((d) => recordEntryPrettyPrint(d.nodeValue, indent + 1, {
		...options,
		name: d.name
	})).join(`\n`) : t;
};
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
function* recordChildren(node, options = {}) {
	resultThrow(nullUndefTest(node, `node`));
	const filter = options.filter ?? `none`;
	const filterByValue = (v) => {
		if (filter === `none`) return [true, isPrimitive(v)];
		else if (filter === `leaves` && isPrimitive(v)) return [true, true];
		else if (filter === `branches` && !isPrimitive(v)) return [true, false];
		return [false, isPrimitive(v)];
	};
	if (Array.isArray(node)) for (const [index, element] of node.entries()) {
		const f = filterByValue(element);
		if (f[0]) yield {
			name: index.toString(),
			sourceValue: element,
			nodeValue: f[1] ? element : void 0
		};
	}
	else if (typeof node === `object`) {
		const entriesIter = `entries` in node ? node.entries() : Object.entries(node);
		for (const [name, value] of entriesIter) {
			const f = filterByValue(value);
			if (f[0]) yield {
				name,
				sourceValue: value,
				nodeValue: f[1] ? value : void 0
			};
		}
	}
}
function* recordEntriesDepthFirst(node, options = {}, ancestors = []) {
	for (const c of recordChildren(node, options)) {
		yield {
			...c,
			ancestors: [...ancestors]
		};
		yield* recordEntriesDepthFirst(c.sourceValue, options, [...ancestors, c.name]);
	}
}
/**
* Finds a given direct child by name
* @param name
* @param node
* @returns
*/
function recordEntryChildByName(name, node) {
	for (const d of recordChildren(node)) if (d.name === name) return d;
}
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
function getRecordEntryByPath(path, node, options = {}) {
	const paths = [...traceRecordEntryByPath(path, node, options)];
	if (paths.length === 0) throw new Error(`Could not trace path: ${path} `);
	return paths.at(-1);
}
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
function* traceRecordEntryByPath(path, node, options = {}) {
	resultThrow(nullUndefTest(path, `path`), nullUndefTest(node, `node`));
	const separator = options.separator ?? `.`;
	const pathSplit = path.split(separator);
	const ancestors = [];
	for (const p of pathSplit) {
		const entry = recordEntryChildByName(p, node);
		if (!entry) {
			yield {
				name: p,
				sourceValue: void 0,
				nodeValue: void 0,
				ancestors
			};
			return;
		}
		node = entry.sourceValue;
		yield {
			...entry,
			ancestors: [...ancestors]
		};
		ancestors.push(p);
	}
}
/**
* Generates a name for a node.
* Uses the 'name' property if it exists, otherwise uses `defaultName`
* @param node
* @param defaultName
* @returns
*/
function getNamedRecordEntry(node, defaultName = ``) {
	if (`name` in node && `nodeValue` in node && `sourceValue` in node) return node;
	if (`name` in node) return {
		name: node.name,
		nodeValue: node,
		sourceValue: node
	};
	return {
		name: defaultName,
		nodeValue: node,
		sourceValue: node
	};
}

//#endregion
//#region ../core/dist/src/records/merge.js
function mergeObjects(...a) {
	return Object.assign({}, ...a);
}

//#endregion
//#region ../core/dist/src/records/keys-to-numbers.js
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
const keysToNumbers = (object, onInvalidKey = `throw`) => {
	const returnObject = {};
	for (const entry of Object.entries(object)) {
		const asNumber = Number.parseInt(entry[0]);
		if (Number.isNaN(asNumber)) switch (onInvalidKey) {
			case `throw`: throw new TypeError(`Cannot convert key '${entry[0]}' to an integer`);
			case `ignore`: continue;
			case `keep`: {
				returnObject[entry[0]] = entry[1];
				continue;
			}
			default: throw new Error(`Param 'onInvalidKey' should be: 'throw', 'ignore' or 'keep'.`);
		}
		returnObject[asNumber] = entry[1];
	}
	return returnObject;
};

//#endregion
//#region ../core/dist/src/records/index.js
var records_exports = {};
__export(records_exports, {
	changedObjectDataFields: () => changedObjectDataFields,
	cloneFromFields: () => cloneFromFields,
	compareArrays: () => compareArrays,
	compareObjectData: () => compareObjectData,
	compareObjectKeys: () => compareObjectKeys,
	getRecordEntryByPath: () => getRecordEntryByPath,
	keysToNumbers: () => keysToNumbers,
	mapObjectByObject: () => mapObjectByObject,
	mapObjectKeys: () => mapObjectKeys,
	mapObjectShallow: () => mapObjectShallow,
	mergeObjects: () => mergeObjects,
	prettyPrintEntries: () => prettyPrintEntries,
	recordChildren: () => recordChildren,
	recordEntriesDepthFirst: () => recordEntriesDepthFirst,
	recordEntryPrettyPrint: () => recordEntryPrettyPrint,
	traceRecordEntryByPath: () => traceRecordEntryByPath
});

//#endregion
export { cloneFromFields, compareArrays, compareObjectKeys, mapObjectShallow, recordEntriesDepthFirst, records_exports };
//# sourceMappingURL=records-Cei7yF1D.js.map