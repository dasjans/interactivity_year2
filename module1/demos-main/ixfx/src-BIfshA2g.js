import { __export } from "./chunk-51aI8Tpl.js";
import { integerTest, nullUndefTest, numberTest, resultIsError, resultThrow, resultToError, stringTest } from "./src-BBD50Kth.js";
import { isPrimitive } from "./is-primitive-eBwrK4Yg.js";
import { elapsedToHumanString, intervalToMs, isEqualDefault, isEqualValueIgnoreOrder, toStringDefault } from "./interval-type-DajslxUJ.js";
import { addObjectEntriesMutate, addValue, addValueMutate, addValueMutator, continuously, defaultComparer, deleteByValueCompareMutate, elapsedInfinity, elapsedSince, filterValues, findBySomeKey, findEntryByPredicate, findEntryByValue, findValue, fromIterable, fromObject, getClosestIntegerKey, getOrGenerate, getOrGenerateSync, hasAnyValue, hasKeyValue, mapToArray, mapToObjectTransform, mergeByKey, sleep, some, sortByValue, sortByValueProperty, toArray, toObject, transformMap, zipKeyValue } from "./basic-D0XoOdBJ.js";
import { SimpleEventEmitter, defaultKeyer, last as last$1, last$1 as last, map, max, min, toStringAbbreviate } from "./src-TlKlGoex.js";
import { getErrorMessage, logSet, resolve, resolveLogOption, resolveSync } from "./resolve-core-BwRmfzav.js";
import { clamp$1 as clamp, containsDuplicateInstances, movingAverageLight, randomElement, shuffle, unique, without } from "./src-BeVDUOoq.js";

//#region ../collections/dist/src/circular-array.js
/**
* A circular array keeps a maximum number of values, overwriting older values as needed. Immutable.
*
* `CircularArray` extends the regular JS array. Only use `add` to change the array if you want
* to keep the `CircularArray` behaviour.
*
* @example Basic functions
* ```js
* let a = new CircularArray(10);
* a = a.add(`hello`);  // Because it's immutable, capture the return result of `add`
* a.isFull;            // True if circular array is full
* a.pointer;           // The current position in array it will write to
* ```
*
* Since it extends the regular JS array, you can access items as usual:
* @example Accessing
* ```js
* let a = new CircularArray(10);
* ... add some stuff ..
* a.forEach(item => // do something with item);
* ```
* @param capacity Maximum capacity before recycling array entries
* @return Circular array
*/
var CircularArray = class CircularArray extends Array {
	#capacity;
	#pointer;
	constructor(capacity = 0) {
		super();
		resultThrow(integerTest(capacity, `positive`, `capacity`));
		this.#capacity = capacity;
		this.#pointer = 0;
	}
	/**
	* Add to array
	* @param value Thing to add
	* @returns
	*/
	add(value$1) {
		const ca = CircularArray.from(this);
		ca[this.#pointer] = value$1;
		ca.#capacity = this.#capacity;
		if (this.#capacity > 0) ca.#pointer = this.#pointer + 1 === this.#capacity ? 0 : this.#pointer + 1;
		else ca.#pointer = this.#pointer + 1;
		return ca;
	}
	get pointer() {
		return this.#pointer;
	}
	get isFull() {
		if (this.#capacity === 0) return false;
		return this.length === this.#capacity;
	}
};

//#endregion
//#region ../collections/dist/src/queue/queue-fns.js
const debug = (opts, message) => {
	opts.debug && console.log(`queue:${message}`);
};
const trimQueue = (opts, queue, toAdd) => {
	const potentialLength = queue.length + toAdd.length;
	const capacity = opts.capacity ?? potentialLength;
	const toRemove = potentialLength - capacity;
	const policy = opts.discardPolicy ?? `additions`;
	switch (policy) {
		case `additions`: {
			if (queue.length === 0) return toAdd.slice(0, toAdd.length - toRemove);
			if (queue.length === opts.capacity) return queue;
			else return [...queue, ...toAdd.slice(0, toRemove - 1)];
		}
		case `newer`: if (toRemove >= queue.length) {
			if (queue.length === 0) return [...toAdd.slice(0, capacity - 1), toAdd.at(-1)];
			return toAdd.slice(Math.max(0, toAdd.length - capacity), Math.min(toAdd.length, capacity) + 1);
		} else {
			const countToAdd = Math.max(1, toAdd.length - queue.length);
			const toAddFinal = toAdd.slice(toAdd.length - countToAdd, toAdd.length);
			const toKeep = queue.slice(0, Math.min(queue.length, capacity - 1));
			const t = [...toKeep, ...toAddFinal];
			return t;
		}
		case `older`: return [...queue, ...toAdd].slice(toRemove);
		default: throw new Error(`Unknown overflow policy ${policy}`);
	}
};
/**
* Adds to the back of the queue (last array index)
* Last item of `toAdd` will potentially be the new end of the queue (depending on capacity limit and overflow policy)
* @typeParam V - Type of values
* @param {QueueOpts} opts
* @param {V[]} queue
* @param {...V[]} toAdd
* @returns {V[]}
*/
const enqueue = (opts, queue, ...toAdd) => {
	if (opts === void 0) throw new Error(`opts parameter undefined`);
	const potentialLength = queue.length + toAdd.length;
	const overSize = opts.capacity && potentialLength > opts.capacity;
	const toReturn = overSize ? trimQueue(opts, queue, toAdd) : [...queue, ...toAdd];
	if (opts.capacity && toReturn.length !== opts.capacity && overSize) throw new Error(`Bug! Expected return to be at capacity. Return len: ${toReturn.length} capacity: ${opts.capacity} opts: ${JSON.stringify(opts)}`);
	if (!opts.capacity && toReturn.length !== potentialLength) throw new Error(`Bug! Return length not expected. Return len: ${toReturn.length} expected: ${potentialLength} opts: ${JSON.stringify(opts)}`);
	return toReturn;
};
const dequeue = (opts, queue) => {
	if (queue.length === 0) throw new Error(`Queue is empty`);
	return queue.slice(1);
};
/**
* Returns front of queue (oldest item), or undefined if queue is empty
*
* @typeParam V - Type of values stored
* @param {QueueOpts} opts
* @param {V[]} queue
* @returns {(V | undefined)}
*/
const peek = (opts, queue) => queue[0];
const isEmpty = (opts, queue) => queue.length === 0;
const isFull = (opts, queue) => {
	if (opts.capacity) return queue.length >= opts.capacity;
	return false;
};

//#endregion
//#region ../collections/dist/src/queue/queue-mutable.js
/**
* Mutable queue that fires events when manipulated.
*
* Queues are useful if you want to treat 'older' or 'newer'
* items differently. _Enqueing_ adds items at the back of the queue, while
* _dequeing_ removes items from the front (ie. the oldest).
*
* ```js
* const q = Queues.mutable();       // Create
* q.enqueue(`a`, `b`);     // Add two strings
* const front = q.dequeue();  // `a` is at the front of queue (oldest)
* ```
*
* @example Cap size to 5 items, throwing away newest items already in queue.
* ```js
* const q = Queues.mutable({capacity: 5, discardPolicy: `newer`});
* ```
*
* Events can be used to monitor data flows.
* * 'enqueue': fires when item(s) are added
* * 'dequeue': fires when an item is dequeued from front
* * 'removed': fires when an item is dequeued, queue is cleared or .removeWhere is used to trim queue
*
* Each of the event handlers return the state of the queue as the 'finalData'
* field.
*
* ```js
* q.addEventListener(`enqueue`, e => {
*  // e.added, e.finalData
* });
* q.addEventListener(`removed`, e => {
*  // e.removed, e.finalData
* });
* q.addEventListener(`dequeue`, e=> {
*  // e.removed, e.finalData
* })
* ```
* @typeParam V - Data type of items
*/
var QueueMutable = class extends SimpleEventEmitter {
	options;
	data;
	eq;
	constructor(opts = {}, data = []) {
		super();
		if (opts === void 0) throw new Error(`opts parameter undefined`);
		this.options = opts;
		this.data = data;
		this.eq = opts.eq ?? isEqualDefault;
	}
	clear() {
		const copy = [...this.data];
		this.data = [];
		this.fireEvent(`removed`, {
			finalData: this.data,
			removed: copy
		});
		this.onClear();
	}
	/**
	* Called when all data is cleared
	*/
	onClear() {}
	at(index) {
		if (index >= this.data.length) throw new Error(`Index outside bounds of queue`);
		const v = this.data.at(index);
		if (v === void 0) throw new Error(`Index appears to be outside range of queue`);
		return v;
	}
	enqueue(...toAdd) {
		this.data = enqueue(this.options, this.data, ...toAdd);
		const length = this.data.length;
		this.onEnqueue(this.data, toAdd);
		return length;
	}
	onEnqueue(result, attemptedToAdd) {
		this.fireEvent(`enqueue`, {
			added: attemptedToAdd,
			finalData: result
		});
	}
	dequeue() {
		const v = peek(this.options, this.data);
		if (v === void 0) return;
		this.data = dequeue(this.options, this.data);
		this.fireEvent(`dequeue`, {
			removed: v,
			finalData: this.data
		});
		this.onRemoved([v], this.data);
		return v;
	}
	onRemoved(removed, finalData) {
		this.fireEvent(`removed`, {
			removed,
			finalData
		});
	}
	/**
	* Removes values that match `predicate`.
	* @param predicate
	* @returns Returns number of items removed.
	*/
	removeWhere(predicate) {
		const countPre = this.data.length;
		const toRemove = this.data.filter((v) => predicate(v));
		if (toRemove.length === 0) return 0;
		this.data = this.data.filter((element) => !predicate(element));
		this.onRemoved(toRemove, this.data);
		return countPre - this.data.length;
	}
	/**
	* Return a copy of the array
	* @returns
	*/
	toArray() {
		return [...this.data];
	}
	get isEmpty() {
		return isEmpty(this.options, this.data);
	}
	get isFull() {
		return isFull(this.options, this.data);
	}
	get length() {
		return this.data.length;
	}
	get peek() {
		return peek(this.options, this.data);
	}
};
/**
* Creates a new QueueMutable
* @param options
* @param startingItems
* @returns
*/
function mutable$1(options = {}, ...startingItems) {
	return new QueueMutable({ ...options }, [...startingItems]);
}

//#endregion
//#region ../collections/dist/src/stack/StackFns.js
const trimStack = (opts, stack, toAdd) => {
	const potentialLength = stack.length + toAdd.length;
	const policy = opts.discardPolicy ?? `additions`;
	const capacity = opts.capacity ?? potentialLength;
	const toRemove = potentialLength - capacity;
	if (opts.debug) console.log(`Stack.push: stackLen: ${stack.length} potentialLen: ${potentialLength} toRemove: ${toRemove} policy: ${policy}`);
	switch (policy) {
		case `additions`: {
			if (opts.debug) console.log(`Stack.push:DiscardAdditions: stackLen: ${stack.length} slice: ${potentialLength - capacity} toAddLen: ${toAdd.length}`);
			if (stack.length === opts.capacity) return stack;
			else return [...stack, ...toAdd.slice(0, toAdd.length - toRemove)];
		}
		case `newer`: if (toRemove >= stack.length) return toAdd.slice(Math.max(0, toAdd.length - capacity), Math.min(toAdd.length, capacity) + 1);
		else {
			if (opts.debug) console.log(` from orig: ${JSON.stringify(stack.slice(0, stack.length - toRemove))}`);
			return [...stack.slice(0, stack.length - toRemove), ...toAdd.slice(0, Math.min(toAdd.length, capacity - toRemove + 1))];
		}
		case `older`: return [...stack, ...toAdd].slice(toRemove);
		default: throw new Error(`Unknown discard policy ${policy}`);
	}
};
const push = (opts, stack, ...toAdd) => {
	const potentialLength = stack.length + toAdd.length;
	const overSize = opts.capacity && potentialLength > opts.capacity;
	const toReturn = overSize ? trimStack(opts, stack, toAdd) : [...stack, ...toAdd];
	return toReturn;
};
const pop = (opts, stack) => {
	if (stack.length === 0) throw new Error(`Stack is empty`);
	return stack.slice(0, -1);
};
/**
* Peek at the top of the stack (end of array)
*
* @typeParam V - Type of stored items
* @param {StackOpts} opts
* @param {V[]} stack
* @returns {(V | undefined)}
*/
const peek$1 = (opts, stack) => stack.at(-1);
const isEmpty$1 = (opts, stack) => stack.length === 0;
const isFull$1 = (opts, stack) => {
	if (opts.capacity) return stack.length >= opts.capacity;
	return false;
};

//#endregion
//#region ../collections/dist/src/stack/StackMutable.js
/**
* Creates a stack. Mutable. Use {@link StackImmutable} for an immutable alternative.
*
* @example Basic usage
* ```js
* // Create
* const s = new StackMutable();
* // Add one or more items
* s.push(1, 2, 3, 4);
*
* // See what's on top
* s.peek;  // 4
*
* // Remove the top-most, and return it
* s.pop();   // 4
*
* // Now there's a new top-most element
* s.peek;  // 3
* ```
*/
var StackMutable = class {
	opts;
	data;
	constructor(opts = {}, data = []) {
		this.opts = opts;
		this.data = data;
	}
	/**
	* Push data onto the stack.
	* If `toAdd` is empty, nothing happens
	* @param toAdd Data to add
	* @returns Length of stack
	*/
	push(...toAdd) {
		if (toAdd.length === 0) return this.data.length;
		this.data = push(this.opts, this.data, ...toAdd);
		return this.data.length;
	}
	forEach(fn) {
		this.data.forEach(fn);
	}
	forEachFromTop(fn) {
		[...this.data].reverse().forEach(fn);
	}
	pop() {
		const v = peek$1(this.opts, this.data);
		this.data = pop(this.opts, this.data);
		return v;
	}
	get isEmpty() {
		return isEmpty$1(this.opts, this.data);
	}
	get isFull() {
		return isFull$1(this.opts, this.data);
	}
	get peek() {
		return peek$1(this.opts, this.data);
	}
	get length() {
		return this.data.length;
	}
};
/**
* Creates a stack. Mutable. Use {@link Stacks.immutable} for an immutable alternative.
*
* @example Basic usage
* ```js
* // Create
* const s = Stacks.mutable();
* // Add one or more items
* s.push(1, 2, 3, 4);
*
* // See what's on top
* s.peek;  // 4
*
* // Remove the top-most, and return it
* s.pop();   // 4
*
* // Now there's a new top-most element
* s.peek;  // 3
* ```
*/
const mutable$3 = (opts = {}, ...startingItems) => new StackMutable({ ...opts }, [...startingItems]);

//#endregion
//#region ../collections/dist/src/tree/compare.js
const compare = (a, b, eq = isEqualValueIgnoreOrder, parent) => {
	const valueEqual = valueOrIdentityEqual(a, b, eq);
	const childrenCompare = compareChildren(a, b, eq);
	const diff = {
		valueChanged: !valueEqual,
		a,
		b,
		added: childrenCompare.added,
		removed: childrenCompare.removed,
		childChanged: false
	};
	const diffNode = {
		value: diff,
		childrenStore: [],
		parent
	};
	const childrenDiff = childrenCompare.identical.map((c) => compare(c[0], c[1], eq, diffNode));
	const someChildChange = hasChange(diff) || childrenDiff.some((v) => hasChange(v.value));
	setChildren(diffNode, childrenDiff);
	diffNode.toString = () => toString$1(diffNode, 0);
	diffNode.value.childChanged = someChildChange;
	throwTreeTest(diffNode);
	return diffNode;
};
const hasChange = (vv) => {
	if (vv === void 0) return false;
	if (vv.valueChanged) return true;
	if (vv.childChanged) return true;
	if (vv.added.length > 0) return true;
	if (vv.removed.length > 0) return true;
	return false;
};
const compareChildren = (a, b, eq = isEqualValueIgnoreOrder) => {
	const childrenOfA = [...a.children()];
	const childrenOfB = [...b.children()];
	const identical = [];
	const removed = [];
	for (const childA of childrenOfA) {
		let foundIndex = -1;
		for (const [index, childOfB] of childrenOfB.entries()) {
			const d = valueOrIdentityEqual(childA, childOfB, eq);
			if (d) {
				identical.push([childA, childOfB]);
				foundIndex = index;
				break;
			}
		}
		if (foundIndex === -1) removed.push(childA);
		else childrenOfB.splice(foundIndex, 1);
	}
	const added = [...childrenOfB];
	return {
		added,
		identical,
		removed
	};
};
const valueOrIdentityEqual = (a, b, eq) => {
	if (a.getIdentity() === b.getIdentity()) return true;
	if (eq(a.getValue(), b.getValue())) return true;
	return false;
};
const toStringSingle = (n) => {
	return JSON.stringify(n.getValue());
};
const toString$1 = (n, indent = 0) => {
	if (n === void 0) return `(undefined)`;
	let t = toStringDiff(n.value, indent);
	for (const c of n.childrenStore) t += toString$1(c, indent + 2);
	return t;
};
const toStringDiff = (n, indent) => {
	const spaces = ` `.repeat(indent);
	if (n === void 0) return `${spaces}(undefined)`;
	const t = [];
	t.push(`a: ${toStringSingle(n.a)} b: ${toStringSingle(n.b)}`);
	if (n.valueChanged) t.push(`Value changed. Child changed: ${n.childChanged}`);
	else t.push(`Value unchanged. Child changed: ${n.childChanged}`);
	if (n.added.length > 0) {
		t.push(`Added:`);
		for (const c of n.added) t.push(` - ` + toStringSingle(c));
	}
	if (n.removed.length > 0) {
		t.push(`Removed: ${n.removed.length}`);
		for (const c of n.removed) t.push(` - ` + toStringSingle(c));
	}
	t.push(`----\n`);
	return t.map((line) => spaces + line).join(`\n`);
};

//#endregion
//#region ../collections/dist/src/tree/tree-mutable.js
var tree_mutable_exports = {};
__export(tree_mutable_exports, {
	add: () => add$1,
	addValue: () => addValue$1,
	asDynamicTraversable: () => asDynamicTraversable$1,
	breadthFirst: () => breadthFirst$1,
	children: () => children$1,
	childrenLength: () => childrenLength$1,
	childrenValues: () => childrenValues,
	compare: () => compare$1,
	computeMaxDepth: () => computeMaxDepth,
	createNode: () => createNode,
	depthFirst: () => depthFirst$2,
	findAnyChildByValue: () => findAnyChildByValue$1,
	findChildByValue: () => findChildByValue$1,
	findParentsValue: () => findParentsValue,
	followValue: () => followValue$1,
	fromPlainObject: () => fromPlainObject,
	getRoot: () => getRoot,
	hasAnyChild: () => hasAnyChild$1,
	hasAnyParent: () => hasAnyParent$1,
	hasChild: () => hasChild$1,
	hasParent: () => hasParent$1,
	nodeDepth: () => nodeDepth,
	parents: () => parents$1,
	parentsValues: () => parentsValues,
	queryByValue: () => queryByValue,
	queryParentsValue: () => queryParentsValue,
	remove: () => remove,
	root: () => root,
	rootWrapped: () => rootWrapped,
	setChildren: () => setChildren,
	stripParentage: () => stripParentage,
	throwTreeTest: () => throwTreeTest,
	toStringDeep: () => toStringDeep$2,
	treeTest: () => treeTest,
	value: () => value,
	wrap: () => wrap
});
/**
* Compares two nodes.
*
* By default uses `isEqualValueIgnoreOrder` to compare nodes. This means
* values of nodes will be compared, ignoring the order of fields.
* @param a
* @param b
* @param eq Comparison function. Uses `isEqualValueIgnoreOrder` by default.
* @returns Compare results
*/
const compare$1 = (a, b, eq) => {
	return compare(asDynamicTraversable$1(a), asDynamicTraversable$1(b), eq);
};
/**
* Converts `TreeNode` to `SimplifiedNode`, removing the 'parent' fields.
* This can be useful because if you have the whole tree, the parent field
* is redundant and because it makes circular references can make dumping to console etc more troublesome.
*
* Recursive: strips parentage of all children and so on too.
* @param node
* @returns
*/
const stripParentage = (node) => {
	const n = {
		value: node.value,
		childrenStore: node.childrenStore.map((c) => stripParentage(c))
	};
	return n;
};
const unwrapped = (node) => `wraps` in node ? node.wraps : node;
const wrapped = (node) => `wraps` in node ? node : wrap(node);
/**
* Wraps node `n` for a more object-oriented means of access.
* It will wrap child nodes on demand. For this reason, WrappedNode object
* identity is not stable
* @param n Node to wrap
* @returns
*/
const wrap = (n) => {
	return {
		*children() {
			for (const c of n.childrenStore) yield wrap(c);
		},
		getValue: () => n.value,
		getIdentity: () => n,
		*queryValue(value$1) {
			for (const v of queryByValue(value$1, unwrapped(n))) yield wrap(v);
		},
		*queryParentsValue(child, value$1, eq) {
			for (const v of queryParentsValue(unwrapped(child), value$1, eq)) yield wrap(v);
		},
		*parentsValues(child) {
			yield* parentsValues(unwrapped(child));
		},
		findParentsValue(child, value$1, eq) {
			const n$1 = findParentsValue(child, value$1, eq);
			if (n$1 !== void 0) return wrap(n$1);
		},
		getParent: () => n.parent === void 0 ? void 0 : wrap(n.parent),
		hasParent: (parent) => {
			return hasParent$1(n, unwrapped(parent));
		},
		hasAnyParent: (parent) => {
			return hasAnyParent$1(n, unwrapped(parent));
		},
		hasChild: (child) => {
			return hasChild$1(unwrapped(child), n);
		},
		hasAnyChild: (child) => {
			return hasAnyChild$1(unwrapped(child), n);
		},
		remove: () => {
			remove(n);
		},
		addValue: (value$1) => {
			const nodeValue = addValue$1(value$1, n);
			return wrap(nodeValue);
		},
		add: (child) => {
			add$1(unwrapped(child), n);
			return wrapped(child);
		},
		wraps: n
	};
};
/**
* Removes `child` from the tree structure it is in.
* It removes `child` from its parent. Any sub-children of `child` still remain connected.
* @param child
* @returns
*/
const remove = (child) => {
	const p = child.parent;
	if (p === void 0) return;
	child.parent = void 0;
	p.childrenStore = without(p.childrenStore, child);
};
/**
* Depth-first iteration of the children of `node`
* @param node
* @returns
*/
function* depthFirst$2(node) {
	if (!root) return;
	const stack = new StackMutable();
	stack.push(...node.childrenStore);
	let entry = stack.pop();
	while (entry) {
		yield entry;
		if (entry) stack.push(...entry.childrenStore);
		if (stack.isEmpty) break;
		entry = stack.pop();
	}
}
/**
* Breadth-first iteration of the children of `node`
* @param node
* @returns
*/
function* breadthFirst$1(node) {
	if (!node) return;
	const queue = new QueueMutable();
	queue.enqueue(...node.childrenStore);
	let entry = queue.dequeue();
	while (entry) {
		yield entry;
		if (entry) queue.enqueue(...entry.childrenStore);
		if (queue.isEmpty) break;
		entry = queue.dequeue();
	}
}
/**
* Validates the tree from `root` downwards.
* @param root
* @param seen
* @returns
*/
function treeTest(root$1, seen = []) {
	if (root$1.parent === root$1) return [
		false,
		`Root has itself as parent`,
		root$1
	];
	if (seen.includes(root$1)) return [
		false,
		`Same node instance is appearing further in tree`,
		root$1
	];
	seen.push(root$1);
	if (containsDuplicateInstances(root$1.childrenStore)) return [
		false,
		`Children list contains duplicates`,
		root$1
	];
	for (const c of root$1.childrenStore) {
		if (c.parent !== root$1) return [
			false,
			`Member of childrenStore does not have .parent set`,
			c
		];
		if (hasAnyChild$1(root$1, c)) return [
			false,
			`Child has parent as its own child`,
			c
		];
		const v = treeTest(c, seen);
		if (!v[0]) return v;
	}
	return [
		true,
		``,
		root$1
	];
}
/**
* Throws an exception if `root` fails tree validation
* @param root
* @returns
*/
function throwTreeTest(root$1) {
	const v = treeTest(root$1);
	if (v[0]) return;
	throw new Error(`${v[1]} Node: ${toStringAbbreviate(v[2].value, 30)}`, { cause: v[2] });
}
/**
* Iterate over direct children of `root`, yielding {@link TreeNode} instances.
* Use {@link childrenValues} to iterate over child values
* @param root
*/
function* children$1(root$1) {
	for (const c of root$1.childrenStore) yield c;
}
/**
* Iterate over the value ofdirect children of `root`.
* Use {@link children} if you want to iterate over {@link TreeNode} instances instead.
* @param root
*/
function* childrenValues(root$1) {
	for (const c of root$1.childrenStore) if (typeof c.value !== `undefined`) yield c.value;
}
/**
* Iterate over all parents of `root`. First result is the immediate parent.
* @param root
*/
function* parents$1(root$1) {
	let p = root$1.parent;
	while (p) {
		yield p;
		p = p.parent;
	}
}
/**
* Returns the depth of `node`. A root node (ie. with no parents) has a depth of 0.
* @param node
* @returns
*/
function nodeDepth(node) {
	const p = [...parents$1(node)];
	return p.length;
}
const hasChild$1 = (child, parent) => {
	for (const c of parent.childrenStore) if (c === child) return true;
	return false;
};
/**
* Returns the first immediate child of `parent` that matches `value`.
*
* Use {@link queryByValue} if you want all matching children.
* @param value
* @param parent
* @param eq
* @returns
*/
const findChildByValue$1 = (value$1, parent, eq = isEqualDefault) => {
	for (const c of parent.childrenStore) if (eq(value$1, c.value)) return c;
};
/**
* Yield all immediate children of `parent` that match `value`.
*
* Use {@link findChildByValue} if you only want the first matching child.
* @param value
* @param parent
* @param eq
*/
function* queryByValue(value$1, parent, eq = isEqualDefault) {
	for (const c of parent.childrenStore) if (eq(value$1, c.value)) yield c;
}
/**
* Returns _true_ if `prospectiveChild` is some child node of `parent`,
* anywhere in the tree structure.
*
* Use {@link hasChild} to only check immediate children.
* @param prospectiveChild
* @param parent
* @returns
*/
const hasAnyChild$1 = (prospectiveChild, parent) => {
	for (const c of breadthFirst$1(parent)) if (c === prospectiveChild) return true;
	return false;
};
const findAnyChildByValue$1 = (value$1, parent, eq = isEqualDefault) => {
	for (const c of breadthFirst$1(parent)) if (eq(c.value, value$1)) return c;
};
const getRoot = (node) => {
	if (node.parent) return getRoot(node.parent);
	return node;
};
/**
* Returns _true_ if `prospectiveParent` is any ancestor
* parent of `child`.
*
* Use {@link hasParent} to only check immediate parent.
* @param child
* @param prospectiveParent
* @returns
*/
const hasAnyParent$1 = (child, prospectiveParent) => {
	for (const p of parents$1(child)) if (p === prospectiveParent) return true;
	return false;
};
/**
* Yields the node value of each parent of `child`.
* _undefined_ values are not returned.
*
* Use {@link queryParentsValue} to search for a particular value
* @param child
* @returns
*/
function* parentsValues(child) {
	for (const p of parents$1(child)) if (typeof p.value !== `undefined`) yield p.value;
	return false;
}
/**
* Yields all parents of `child` that have a given value.
* Use {@link findParentsValue} to find the first match only.
* @param child
* @param value
* @param eq
* @returns
*/
function* queryParentsValue(child, value$1, eq = isEqualDefault) {
	for (const p of parents$1(child)) if (typeof p.value !== `undefined`) {
		if (eq(p.value, value$1)) yield p;
	}
	return false;
}
/**
* Returns the first parent that has a given value.
* @param child
* @param value
* @param eq
* @returns
*/
function findParentsValue(child, value$1, eq = isEqualDefault) {
	for (const p of queryParentsValue(child, value$1, eq)) return p;
}
/**
* Returns _true_ if `prospectiveParent` is the immediate
* parent of `child`.
*
* Use {@link hasAnyParent} to check for any ancestor parent.
* @param child
* @param prospectiveParent
* @returns
*/
const hasParent$1 = (child, prospectiveParent) => {
	return child.parent === prospectiveParent;
};
/**
* Computes the maximum depth of the tree.
* That is, how many steps down from `node` it can go.
* If a tree is: root -> childA -> subChildB
* ```js
* // Yields 2, since there are at max two steps down from root
* computeMaxDepth(root);
* ```
* @param node
* @returns
*/
const computeMaxDepth = (node) => {
	return computeMaxDepthImpl(node, 0);
};
const computeMaxDepthImpl = (node, startingDepth = 0) => {
	let depth = startingDepth;
	for (const c of node.childrenStore) depth = Math.max(depth, computeMaxDepthImpl(c, startingDepth + 1));
	return depth;
};
const add$1 = (child, parent) => {
	throwAttemptedChild(child, parent);
	const p = child.parent;
	parent.childrenStore = [...parent.childrenStore, child];
	child.parent = parent;
	if (p) p.childrenStore = without(p.childrenStore, child);
};
const addValue$1 = (value$1, parent) => {
	return createNode(value$1, parent);
};
/**
* Creates the root for a tree, with an optional `value`.
* Use {@link rootWrapped} if you want a more object-oriented mode of access.
* @param value
* @returns
*/
const root = (value$1) => {
	return createNode(value$1);
};
const fromPlainObject = (value$1, label = ``, parent, seen = []) => {
	const entries$1 = Object.entries(value$1);
	parent = parent === void 0 ? root() : addValue$1({
		label,
		value: value$1
	}, parent);
	for (const entry of entries$1) {
		const value$2 = entry[1];
		if (seen.includes(value$2)) continue;
		seen.push(value$2);
		if (typeof entry[1] === `object`) fromPlainObject(value$2, entry[0], parent, seen);
		else addValue$1({
			label: entry[0],
			value: value$2
		}, parent);
	}
	return parent;
};
/**
* Creates a tree, returning it as a {@link WrappedNode} for object-oriented access.
* Use {@link Trees.Mutable.root} alternatively.
* @param value
* @returns
*/
const rootWrapped = (value$1) => {
	return wrap(createNode(value$1));
};
/**
* Creates a `TreeNode` instance with a given value and parent.
* Parent node, if specified, has its `childrenStore` property changed to include new child.
* @param value
* @param parent
* @returns
*/
const createNode = (value$1, parent) => {
	const n = {
		childrenStore: [],
		parent,
		value: value$1
	};
	if (parent !== void 0) parent.childrenStore = [...parent.childrenStore, n];
	return n;
};
const childrenLength$1 = (node) => {
	return node.childrenStore.length;
};
const value = (node) => {
	return node.value;
};
/**
* Projects `node` as a dynamic traversable.
* Dynamic in the sense that it creates the traversable project for nodes on demand.
* A consequence is that node identities are not stable.
* @param node
* @returns
*/
const asDynamicTraversable$1 = (node) => {
	const t = {
		*children() {
			for (const c of node.childrenStore) yield asDynamicTraversable$1(c);
		},
		getParent() {
			if (node.parent === void 0) return;
			return asDynamicTraversable$1(node.parent);
		},
		getValue() {
			return node.value;
		},
		getIdentity() {
			return node;
		}
	};
	return t;
};
const throwAttemptedChild = (c, parent) => {
	if (parent === c) throw new Error(`Cannot add self as child`);
	if (c.parent === parent) return;
	if (hasAnyParent$1(parent, c)) throw new Error(`Child contains parent (1)`, { cause: c });
	if (hasAnyParent$1(c, parent)) throw new Error(`Parent already contains child`, { cause: c });
	if (hasAnyChild$1(parent, c)) throw new Error(`Child contains parent (2)`, { cause: c });
};
const setChildren = (parent, children$2) => {
	for (const c of children$2) throwAttemptedChild(c, parent);
	parent.childrenStore = [...children$2];
	for (const c of children$2) c.parent = parent;
};
const toStringDeep$2 = (node, indent = 0) => {
	const t = `${`  `.repeat(indent)} + ${node.value ? JSON.stringify(node.value) : `-`}`;
	return node.childrenStore.length > 0 ? t + `\n` + node.childrenStore.map((d) => toStringDeep$2(d, indent + 1)).join(`\n`) : t;
};
function* followValue$1(root$1, continuePredicate, depth = 1) {
	for (const c of root$1.childrenStore) {
		const value$1 = c.value;
		if (value$1 === void 0) continue;
		if (continuePredicate(value$1, depth)) {
			yield c.value;
			yield* followValue$1(c, continuePredicate, depth + 1);
		}
	}
}

//#endregion
//#region ../collections/dist/src/tree/traverse-object.js
var traverse_object_exports = {};
__export(traverse_object_exports, {
	asDynamicTraversable: () => asDynamicTraversable,
	children: () => children,
	create: () => create$3,
	createSimplified: () => createSimplified,
	createWrapped: () => createWrapped,
	depthFirst: () => depthFirst$1,
	getByPath: () => getByPath,
	prettyPrint: () => prettyPrint,
	prettyPrintEntries: () => prettyPrintEntries,
	toStringDeep: () => toStringDeep$1,
	traceByPath: () => traceByPath
});
/**
* Helper function to get a 'friendly' string representation of an array of {@link TraverseObjectEntry}.
* @param entries
* @returns
*/
function prettyPrintEntries(entries$1) {
	if (entries$1.length === 0) return `(empty)`;
	let t = ``;
	for (const [index, entry] of entries$1.entries()) {
		t += `  `.repeat(index);
		t += entry.name + ` = ` + JSON.stringify(entry.leafValue) + `\n`;
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
const prettyPrint = (node, indent = 0, options = {}) => {
	resultThrow(nullUndefTest(node, `node`));
	const defaultName = options.name ?? `node`;
	const entry = getNamedEntry(node, defaultName);
	const t = `${`  `.repeat(indent)} + name: ${entry.name} value: ${JSON.stringify(entry.leafValue)}`;
	const childrenAsArray = [...children(node, options)];
	return childrenAsArray.length > 0 ? t + `\n` + childrenAsArray.map((d) => prettyPrint(d.leafValue, indent + 1, {
		...options,
		name: d.name
	})).join(`\n`) : t;
};
/**
* Returns a debug string representation of the node (recursive)
* @param node
* @param indent
* @returns
*/
const toStringDeep$1 = (node, indent = 0) => {
	let t = ` `.repeat(indent) + ` ${node.value?.name}`;
	if (node.value !== void 0) {
		if (`sourceValue` in node.value && `leafValue` in node.value) {
			let sourceValue = toStringAbbreviate(node.value.sourceValue, 20);
			const leafValue = toStringAbbreviate(node.value.leafValue, 20);
			sourceValue = sourceValue === leafValue ? `` : `source: ` + sourceValue;
			t += ` = ${leafValue} ${sourceValue}`;
		} else if (`sourceValue` in node.value && node.value.sourceValue !== void 0) t += ` = ${node.value.sourceValue}`;
		if (`ancestors` in node.value) t += ` (ancestors: ${node.value.ancestors.join(`, `)})`;
	}
	t += `\n`;
	for (const c of node.childrenStore) t += toStringDeep$1(c, indent + 1);
	return t;
};
/**
* Yields the direct (ie. non-recursive) children of a tree-like object as a pairing
* of node name and value. Supports basic objects, Maps and arrays.
*
* To iterate recursively, consider {@link depthFirst}
*
* Each child is returned in an {@link TraverseObjectEntry} structure:
* ```typescript
* type Entry = Readonly<{
*  // Property name
*  name: string,
*  // Value of property, as if you called `object[propertyName]`
*  sourceValue: any,
*  // Branch nodes will have _undefined_, leaf nodes will contain the value
*  leafValue: any
* }>;
* ```
*
* For example, iterating over a flat object:
* ```js
* const verySimpleObject = { field: `hello`, flag: true }
* const kids = [ ...children(verySimpleObject) ];
* // Yields:
* // [ { name: "field", sourceValue: `hello`, leafValue: `hello` },
* //  { name: "flag", sourceValue: true, leafValue: true } ]
* ```
*
* For objects containing objects:
* ```js
* const lessSimpleObject = { field: `hello`, flag: true, colour: { `red`, opacity: 0.5 } }
* const kids = [ ...children(verySimpleObject) ];
* // Yields as before, plus:
* //  { name: "colour", sourceValue: { name: 'red', opacity: 0.5 }, leafValue: undefined }
* ```
*
* Note that 'sourceValue' always contains the property value, as if you
* access it via `object[propName]`. 'leafValue' only contains the value if it's a leaf
* node.
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
function* children(node, options = {}) {
	resultThrow(nullUndefTest(node, `node`));
	const filteringOption = options.filter ?? `none`;
	const filterByValue = (v) => {
		if (filteringOption === `none`) return [true, isPrimitive(v)];
		else if (filteringOption === `leaves` && isPrimitive(v)) return [true, true];
		else if (filteringOption === `branches` && !isPrimitive(v)) return [true, false];
		return [false, isPrimitive(v)];
	};
	if (Array.isArray(node)) for (const [index, element] of node.entries()) {
		const f = filterByValue(element);
		if (f[0]) yield {
			name: index.toString(),
			_kind: `entry`,
			sourceValue: element,
			leafValue: f[1] ? element : void 0
		};
	}
	else if (typeof node === `object`) {
		const entriesIter = `entries` in node ? node.entries() : Object.entries(node);
		for (const [name, value$1] of entriesIter) {
			const [filter, isPrimitive$1] = filterByValue(value$1);
			if (filter) yield {
				name,
				_kind: `entry`,
				sourceValue: value$1,
				leafValue: isPrimitive$1 ? value$1 : void 0
			};
		}
	}
}
function* depthFirst$1(node, options = {}, ancestors = []) {
	for (const c of children(node, options)) {
		yield {
			...c,
			ancestors: [...ancestors],
			_kind: `entry-ancestors`
		};
		yield* depthFirst$1(c.sourceValue, options, [...ancestors, c.name]);
	}
}
/**
* Finds a given direct child by name
* @param name
* @param node
* @returns
*/
function childByName(name, node) {
	for (const d of children(node)) if (d.name === name) return d;
}
/**
* Returns the closest matching entry, tracing `path` in an array, Map or simple object.
* Returns an entry with _undefined_ value at the point where tracing stopped.
* Use {@link traceByPath} to step through all the segments.
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
function getByPath(path, node, options = {}) {
	const v = last(traceByPath(path, node, options));
	if (!v) throw new Error(`Could not trace path: ${path} `);
	return v;
}
/**
* Enumerates over children of `node` towards the node named in `path`.
* This is useful if you want to get the interim steps to the target node.
*
* Use {@link getByPath} if you don't care about interim steps.
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
function* traceByPath(path, node, options = {}) {
	resultThrow(nullUndefTest(path, `path`), nullUndefTest(node, `node`));
	const separator = options.separator ?? `.`;
	const pathSplit = path.split(separator);
	const ancestors = [];
	for (const p of pathSplit) {
		const entry = childByName(p, node);
		if (!entry) {
			yield {
				name: p,
				sourceValue: void 0,
				leafValue: void 0,
				ancestors,
				_kind: `entry-ancestors`
			};
			return;
		}
		node = entry.sourceValue;
		yield {
			...entry,
			ancestors: [...ancestors],
			_kind: `entry-ancestors`
		};
		ancestors.push(p);
	}
}
/**
* Returns a projection of `node` as a dynamic traversable.
* This means that the tree structure is dynamically created as last-minute as possible.
*
* The type when calling `getValue()` is {@link TraverseObjectEntryStatic}:
* ```typescript
* type EntryStatic = Readonly<{
*  name: string,
*  value: any
*  ancestors: string[]
* }>
* ```
*
* Note that the object identity of TraversableTree return results is not stable.
* This is because they are created on-the-fly by reading fields of `node`.
*
* ```js
* const c1 = [ ...asDynamicTraversable(someObject).children() ];
* const c2 = [ ...asDynamicTraversable(someObject).children() ];
*
* // Object identity is not the same
* c1[ 0 ] === c1[ 0 ]; // false
*
* // ...even though its referring to the same value
* c1[ 0 ].getValue() === c1[ 0 ].getValue(); // true
* ```
*
* Instead .getIdentity() to get a stable identity:
* ```js
* c1[ 0 ].getIdentity() === c2[ 0 ].getIdentity(); // true
* ```
*
* @example
* ```js
* import { Trees } from "https://unpkg.com/@ixfx/collections/bundle"
* const myObj = { name: `Pedro`, size: 45, colour: `orange` };
* const root = Trees.FromObject.asDynamicTraversable(myObj);
* for (const v of Trees.Traverse.breadthFirst(root)) {
* // v.getValue() yields:
* // { name: 'name', sourceValue: 'Pedro' ...},
* // { name: 'size', sourceValue: 45 ... }
* // ...
* }
* ```
* @param node Object to read
* @param options Options when creating traversable
* @param ancestors Do not use
* @param parent Do not use
* @returns
*/
const asDynamicTraversable = (node, options = {}, ancestors = [], parent) => {
	const name = options.name ?? `object`;
	const t = {
		*children() {
			for (const { name: childName, sourceValue, leafValue } of children(node, options)) yield asDynamicTraversable(sourceValue, {
				...options,
				name: childName
			}, [...ancestors, name], t);
		},
		getParent() {
			return parent;
		},
		getValue() {
			return {
				name,
				sourceValue: node,
				ancestors,
				_kind: `entry-static`
			};
		},
		getIdentity() {
			return node;
		}
	};
	return t;
};
/**
* Reads all fields and sub-fields of `node`, returning as a 'wrapped' tree structure.
* @param node
* @param options
* @returns
*/
const createWrapped = (node, options) => {
	return wrap(create$3(node, options));
};
/**
* Reads all fields and sub-fields of `node`, returning as a basic tree structure.
* The structure is a snapshot of the object. If the object changes afterwards, the tree will
* remain the same.
*
* Alternatively, consider {@link asDynamicTraversable} which reads the object dynamically.
* @example
* ```js
* import { Trees } from "https://unpkg.com/@ixfx/collections/bundle"
* const myObj = { name: `Pedro`, size: 45, colour: `orange` };
* const root = Trees.FromObject.create(myObj);
* for (const v of Trees.Traverse.breadthFirst(root)) {
* // v.getValue() yields:
* // { name: 'name', sourceValue: 'Pedro' ...},
* // { name: 'size', sourceValue: 45 ... }
* // ...
* }
* ```
* @param node
* @param options
* @returns
*/
const create$3 = (node, options = {}) => {
	const valuesAtLeaves = options.valuesAtLeaves ?? false;
	const valueFor = valuesAtLeaves ? (v) => {
		if (isPrimitive(v)) return v;
	} : (v) => v;
	return createImpl(node, valueFor(node), options, []);
};
const createImpl = (sourceValue, leafValue, options = {}, ancestors) => {
	const defaultName = options.name ?? `object_ci`;
	const r = root({
		name: defaultName,
		sourceValue: leafValue,
		ancestors: [...ancestors],
		_kind: `entry-static`
	});
	ancestors = [...ancestors, defaultName];
	for (const c of children(sourceValue, options)) {
		const v = options.valuesAtLeaves ? c.leafValue : c.sourceValue;
		add$1(createImpl(c.sourceValue, v, {
			...options,
			name: c.name
		}, ancestors), r);
	}
	return r;
};
/**
* Returns a copy of `node` with its (and all its children's) parent information removed.
* @param node
* @param options
* @returns
*/
const createSimplified = (node, options = {}) => {
	return stripParentage(create$3(node, options));
};
/**
* Generates a name for a node.
* Uses the 'name' property if it exists, otherwise uses `defaultName`
* @param node
* @param defaultName
* @returns
*/
function getNamedEntry(node, defaultName = ``) {
	if (`name` in node && `leafValue` in node && `sourceValue` in node) return {
		name: node.name,
		_kind: `entry`,
		leafValue: node.leafValue,
		sourceValue: node.sourceValue
	};
	if (`name` in node) return {
		name: node.name,
		leafValue: node,
		sourceValue: node,
		_kind: `entry`
	};
	return {
		name: defaultName,
		leafValue: node,
		sourceValue: node,
		_kind: `entry`
	};
}

//#endregion
//#region ../collections/dist/src/tree/pathed.js
var pathed_exports = {};
__export(pathed_exports, {
	addValueByPath: () => addValueByPath,
	childrenLengthByPath: () => childrenLengthByPath,
	clearValuesByPath: () => clearValuesByPath,
	create: () => create$2,
	removeByPath: () => removeByPath,
	valueByPath: () => valueByPath,
	valuesByPath: () => valuesByPath
});
/**
* Creates a wrapper for working with 'pathed' trees.
* An example is a filesystem.
*
* ```js
* const t = create();
* // Store a value. Path implies a structure of
* //   c -> users -> admin
* // ...which is autoatically created
* t.add({x:10}, `c.users.admin`);
*
* t.add({x:20}, `c.users.guest`);
* // Tree will now be:
* // c-> users -> admin
* //            -> guest
*
* t.getValue(`c.users.guest`); // { x:20 }
* ```
*
* By default only a single value can be stored at a path.
* Set options to allow this:
* ```js
* const t = create({ duplicates: `allow` });
* t.add({x:10}, `c.users.admin`);
* t.add({x:20}, `c.users.admin`);
* t.getValue(`c.users.admin`);   // Throws an error because there are multiple values
* t.getValues(`c.users.admin`);  // [ {x:10}, {x:20 } ]
* ```
* @param pathOpts
* @returns
*/
const create$2 = (pathOpts = {}) => {
	let root$1;
	const add$2 = (value$1, path) => {
		const n = addValueByPath(value$1, path, root$1, pathOpts);
		if (root$1 === void 0) root$1 = getRoot(n);
	};
	const prettyPrint$1 = () => {
		if (root$1 === void 0) return `(empty)`;
		return toStringDeep$2(root$1);
	};
	const getValue = (path) => {
		if (root$1 === void 0) return;
		return valueByPath(path, root$1, pathOpts);
	};
	const remove$1 = (path) => {
		if (root$1 === void 0) return false;
		return removeByPath(path, root$1, pathOpts);
	};
	const hasPath = (path) => {
		if (root$1 === void 0) return false;
		const c = findChildByPath(path, root$1, pathOpts);
		return c !== void 0;
	};
	const getNode = (path) => {
		if (root$1 === void 0) return;
		const c = findChildByPath(path, root$1, pathOpts);
		return c;
	};
	const childrenLength$2 = (path) => {
		if (root$1 === void 0) return 0;
		const c = findChildByPath(path, root$1, pathOpts);
		if (c === void 0) return 0;
		return c.childrenStore.length;
	};
	const getValues = (path) => {
		if (root$1 === void 0) return [];
		return valuesByPath(path, root$1, pathOpts);
	};
	const getRoot$1 = () => {
		return root$1;
	};
	const clearValues = (path) => {
		if (root$1 === void 0) return false;
		return clearValuesByPath(path, root$1, pathOpts);
	};
	return {
		getRoot: getRoot$1,
		add: add$2,
		prettyPrint: prettyPrint$1,
		remove: remove$1,
		getValue,
		getValues,
		hasPath,
		childrenLength: childrenLength$2,
		getNode,
		clearValues
	};
};
/**
* Adds a value by a string path, with '.' as a the default delimiter
* Automatically generates intermediate nodes.
*
* ```js
* const root = addValueByPath({}, 'c');
* addValueByPath({x:'blah'}, 'c.users.admin', root);
* ```
*
* Creates the structure:
* ```
* c          value: { }            label: c
* + users    value: undefined      label: users
*  + admin   value: { x: 'blah' }  label: admin
* ```
*
* By default, multiple values under same key are overwritten, with the most recent winning.
* @param value
* @param path
* @param pathOpts
*/
const addValueByPath = (value$1, path, node, pathOpts = {}) => {
	const separator = pathOpts.separator ?? `.`;
	const duplicatePath = pathOpts.duplicates ?? `overwrite`;
	const split = path.split(separator);
	let count = 0;
	for (const p of split) {
		const lastEntry = count === split.length - 1;
		const found = findChildByLabel(p, node);
		if (found === void 0) {
			const labelled = {
				value: lastEntry ? value$1 : void 0,
				label: p
			};
			node = createNode(labelled, node);
		} else {
			node = found;
			if (lastEntry) switch (duplicatePath) {
				case `ignore`: break;
				case `allow`: {
					const existing = getValuesFromNode(node);
					node.value = {
						values: [...existing, value$1],
						label: p
					};
					break;
				}
				case `overwrite`: {
					node.value = {
						value: value$1,
						label: p
					};
					break;
				}
			}
			else node = found;
		}
		count++;
	}
	if (node === void 0) throw new Error(`Could not create tree`);
	return node;
};
const removeByPath = (path, root$1, pathOpts = {}) => {
	if (root$1 === void 0) return false;
	const c = findChildByPath(path, root$1, pathOpts);
	if (c === void 0) return false;
	remove(c);
	return true;
};
const clearValuesByPath = (path, root$1, pathOpts = {}) => {
	if (root$1 === void 0) return false;
	const c = findChildByPath(path, root$1, pathOpts);
	if (c === void 0) return false;
	c.value = {
		label: c.value?.label ?? ``,
		value: void 0
	};
	return true;
};
const childrenLengthByPath = (path, node, pathOpts = {}) => {
	if (node === void 0) return 0;
	const c = findChildByPath(path, node, pathOpts);
	if (c === void 0) return 0;
	return c.childrenStore.length;
};
/**
* Searches direct children, returning the node that has the given `label`
* @param label
* @returns
*/
const findChildByLabel = (label, node) => {
	if (node === void 0) return void 0;
	if (label === void 0) throw new Error(`Parameter 'label' cannot be undefined`);
	if (node.value?.label === label) return node;
	for (const c of node.childrenStore) if (c.value?.label === label) return c;
};
const valueByPath = (path, node, pathOpts = {}) => {
	const values = valuesByPath(path, node, pathOpts);
	if (values.length === 0) return void 0;
	if (values.length > 1) throw new Error(`Multiple values at path. Use getValues instead`);
	return values[0];
};
const getValuesFromNode = (c) => {
	if (c.value === void 0) return [];
	if (`values` in c.value) return c.value.values;
	if (`value` in c.value) {
		if (c.value.value === void 0) return [];
		return [c.value.value];
	}
	return [];
};
const findChildByPath = (path, node, pathOpts = {}) => {
	const separator = pathOpts.separator ?? `.`;
	const split = path.split(separator);
	let c = node;
	for (const p of split) {
		c = findChildByLabel(p, c);
		if (c === void 0) return;
	}
	return c;
};
const valuesByPath = (path, node, pathOpts = {}) => {
	const separator = pathOpts.separator ?? `.`;
	const split = path.split(separator);
	let c = node;
	for (const p of split) {
		c = findChildByLabel(p, c);
		if (c === void 0) return [];
	}
	return getValuesFromNode(c);
};

//#endregion
//#region ../collections/dist/src/tree/traversable-tree.js
var traversable_tree_exports = {};
__export(traversable_tree_exports, {
	breadthFirst: () => breadthFirst,
	childrenLength: () => childrenLength,
	couldAddChild: () => couldAddChild,
	depthFirst: () => depthFirst,
	find: () => find,
	findAnyChildByValue: () => findAnyChildByValue,
	findAnyParentByValue: () => findAnyParentByValue,
	findByValue: () => findByValue,
	findChildByValue: () => findChildByValue,
	findParentByValue: () => findParentByValue,
	followValue: () => followValue,
	hasAnyChild: () => hasAnyChild,
	hasAnyChildValue: () => hasAnyChildValue,
	hasAnyParent: () => hasAnyParent,
	hasAnyParentValue: () => hasAnyParentValue,
	hasChild: () => hasChild,
	hasChildValue: () => hasChildValue,
	hasParent: () => hasParent,
	hasParentValue: () => hasParentValue,
	parents: () => parents,
	siblings: () => siblings,
	toString: () => toString,
	toStringDeep: () => toStringDeep
});
const childrenLength = (tree) => {
	return [...tree.children()].length;
};
/**
* Returns _true_ if `child` is parented at any level (grand-parented etc) by `possibleParent`
* @param child Child being sought
* @param possibleParent Possible parent of child
* @param eq Equality comparison function {@link isEqualDefault} used by default
* @returns
*/
const hasAnyParent = (child, possibleParent, eq) => {
	return hasParent(child, possibleParent, eq, Number.MAX_SAFE_INTEGER);
};
const hasAnyParentValue = (child, possibleParentValue, eq) => {
	if (typeof child === `undefined`) throw new TypeError(`Param 'child' is undefined`);
	return hasParentValue(child, possibleParentValue, eq, Number.MAX_SAFE_INTEGER);
};
const findAnyParentByValue = (child, possibleParentValue, eq) => {
	return findParentByValue(child, possibleParentValue, eq, Number.MAX_SAFE_INTEGER);
};
/**
* Returns _true_ if `child` exists within `possibleParent`. By default it only looks at the immediate
* parent (maxDepth: 0). Use Number.MAX_SAFE_INTEGER for searching recursively upwards (or {@link hasAnyParent})
* @param child Child being sought
* @param possibleParent Possible parent of child
* @param maxDepth Max depth of traversal. Default of 0 only looks for immediate parent.
* @param eq Equality comparison function. {@link isEqualDefault} used by default.
* @returns
*/
const hasParent = (child, possibleParent, eq = isEqualDefault, maxDepth = 0) => {
	if (maxDepth < 0) return false;
	const isChildTrav = isTraversable(child);
	const isParentTrav = isTraversable(possibleParent);
	const p = isChildTrav ? child.getParent() : child.parent;
	if (typeof p === `undefined`) return false;
	if (eq(p, possibleParent)) return true;
	const pId = isChildTrav ? p.getIdentity() : p.value;
	const ppId = isParentTrav ? possibleParent.getIdentity() : possibleParent.value;
	if (eq(pId, ppId)) return true;
	return hasParent(p, possibleParent, eq, maxDepth - 1);
};
/**
* Checks if a child node has a parent with a certain value
* Note: by default only checks immediate parent. Set maxDepth to a large value to recurse
*
* Uses `getValue()` on the parent if that function exists.
* @param child Node to start looking from
* @param possibleParentValue Value to seek
* @param eq Equality checker
* @param maxDepth Defaults to 0, so it only checks immediate parent
* @returns
*/
const hasParentValue = (child, possibleParentValue, eq = isEqualDefault, maxDepth = 0) => {
	if (child === void 0) throw new Error(`Param 'child' is undefined`);
	if (maxDepth < 0) return false;
	const p = `getParent` in child ? child.getParent() : child.parent;
	if (p === void 0) return false;
	const value$1 = `getValue` in p ? p.getValue() : p.value;
	if (eq(value$1, possibleParentValue)) return true;
	return hasParentValue(p, possibleParentValue, eq, maxDepth - 1);
};
const findParentByValue = (child, possibleParentValue, eq = isEqualDefault, maxDepth = 0) => {
	if (maxDepth < 0) return;
	const p = `getParent` in child ? child.getParent() : child.parent;
	if (p === void 0) return;
	const value$1 = `getValue` in p ? p.getValue() : p.value;
	if (eq(value$1, possibleParentValue)) return p;
	return findParentByValue(p, possibleParentValue, eq, maxDepth - 1);
};
/**
* Returns _true_ if `prospectiveChild` can be legally added to `parent`.
* _False_ is returned if:
*  * `parent` and `prospectiveChild` are equal
*  * `parent` already contains `prospectiveChild`
*  * `prospectiveChild` has `parent` as its own child
*
* Throws an error if `parent` or `prospectiveChild` is null/undefined.
* @param parent Parent to add to
* @param prospectiveChild Prospective child
* @param eq Equality function
*/
const couldAddChild = (parent, prospectiveChild, eq = isEqualDefault) => {
	if (eq(parent, prospectiveChild)) throw new Error(`Child equals parent`);
	if (hasAnyChild(parent, prospectiveChild, eq)) throw new Error(`Circular. Parent already has child`);
	if (hasAnyChild(prospectiveChild, parent, eq)) throw new Error(`Prospective child has parent as child relation`);
};
/**
* Returns _true_ if _possibleChild_ is contained within _parent_ tree.
* That is, it is any sub-child.
* @param parent Parent tree
* @param possibleChild Sought child
* @param eq Equality function, or {@link isEqualDefault} if undefined.
* @returns
*/
const hasAnyChild = (parent, possibleChild, eq = isEqualDefault) => {
	return hasChild(parent, possibleChild, eq, Number.MAX_SAFE_INTEGER);
};
const hasAnyChildValue = (parent, possibleChildValue, eq = isEqualDefault) => {
	return hasChildValue(parent, possibleChildValue, eq, Number.MAX_SAFE_INTEGER);
};
/**
* Returns _true_ if _possibleChild_ is contained within _maxDepth_ children
* of _parent_ node. By default only looks at immediate children (maxDepth = 0).
*
* ```js
* // Just check parentNode for childNode
* Trees.hasChild(parentNode, childNode);
* // See if parentNode or parentNode's parents have childNode
* Trees.hasChild(parentNode, childNode, 1);
* // Use custom equality function, in this case comparing on name field
* Trees.hasChild(parentNode, childNode, 0, (a, b) => a.name === b.name);
* ```
* @param parent Parent tree
* @param possibleChild Sought child
* @param maxDepth Maximum depth. 0 for immediate children, Number.MAX_SAFE_INTEGER for boundless
* @param eq Equality function, or {@link isEqualDefault} if undefined.
* @returns
*/
const hasChild = (parent, possibleChild, eq = isEqualDefault, maxDepth = 0) => {
	if (maxDepth < 0) return false;
	if (eq(parent, possibleChild)) return true;
	const pId = `getIdentity` in parent ? parent.getIdentity() : parent.value;
	const pcId = `getIdentity` in possibleChild ? possibleChild.getIdentity() : possibleChild.value;
	if (eq(pId, pcId)) return true;
	for (const c of breadthFirst(parent, maxDepth)) {
		const cId = `getIdentity` in c ? c.getIdentity() : c.value;
		if (eq(c, possibleChild)) return true;
		if (eq(cId, pcId)) return true;
	}
	return false;
};
const hasChildValue = (parent, possibleValue, eq = isEqualDefault, maxDepth = 0) => {
	if (maxDepth < 0) return false;
	if (eq(parent.getValue(), possibleValue)) return true;
	for (const c of breadthFirst(parent, maxDepth)) {
		const v = c.getValue();
		if (eq(v, possibleValue)) return true;
	}
	return false;
};
/**
* Iterates over siblings of `node`.
*
* Other iteration options:
* * {@link breadthFirst}: Children, breadth-first
* * {@link depthFirst}: Children, depth-first
* * {@link parents}: Chain of parents, starting with immediate parent
* * {@link siblings}: Nodes with same parent
* @param node Node to begin from
* @returns
*/
function* siblings(node) {
	const p = node.getParent();
	if (p === void 0) return;
	for (const s of p.children()) {
		if (s === node) continue;
		yield s;
	}
}
/**
* Iterates over parents of `node`, starting with immediate parent
*
* Other iteration options:
* * {@link breadthFirst}: Children, breadth-first
* * {@link depthFirst}: Children, depth-first
* * {@link parents}: Chain of parents, starting with immediate parent
* * {@link siblings}: Nodes with same parent
* @param node Node to begin from
* @returns
*/
function* parents(node) {
	if (isTraversable(node)) {
		let p = node.getParent();
		while (p !== void 0) {
			yield p;
			p = p.getParent();
		}
	} else {
		let p = node.parent;
		while (p !== void 0) {
			yield p;
			p = p.parent;
		}
	}
}
/**
* Descends `parent`, breadth-first, looking for a particular value.
* Returns _undefined_ if not found.
* @param parent
* @param possibleValue
* @param eq
* @returns
*/
function findAnyChildByValue(parent, possibleValue, eq = isEqualDefault) {
	return findChildByValue(parent, possibleValue, eq, Number.MAX_SAFE_INTEGER);
}
/**
* Searches breadth-first for `possibleValue` under and including `parent`.
* `maxDepth` sets he maximum level to which the tree is searched.
* @param parent
* @param possibleValue
* @param eq
* @param maxDepth
* @returns
*/
function findChildByValue(parent, possibleValue, eq = isEqualDefault, maxDepth = 0) {
	if (maxDepth < 0) return;
	const isTraver = isTraversable(parent);
	if (isTraver) {
		if (eq(parent.getValue(), possibleValue)) return parent;
	} else if (eq(parent.value, possibleValue)) return parent;
	for (const d of breadthFirst(parent, maxDepth)) if (isTraver) {
		if (eq(d.getValue(), possibleValue)) return d;
	} else if (eq(d.value, possibleValue)) return d;
	return;
}
/**
* Iterates over children of `root`, depth-first.
*
* Other iteration options:
* * {@link breadthFirst}: Children, breadth-first
* * {@link depthFirst}: Children, depth-first
* * {@link parents}: Chain of parents, starting with immediate parent
* * {@link siblings}: Nodes with same parent
* @param root Root node
* @returns
*/
function* depthFirst(root$1) {
	if (!root$1) return;
	const stack = new StackMutable();
	let entry = root$1;
	while (entry) {
		const entries$1 = isTraversable(entry) ? [...entry.children()] : [...entry.childrenStore];
		stack.push(...entries$1);
		if (stack.isEmpty) break;
		entry = stack.pop();
		if (entry) yield entry;
	}
}
/**
* Iterates over the children of `root`, breadth-first
*
* Other iteration options:
* * {@link breadthFirst}: Children, breadth-first
* * {@link depthFirst}: Children, depth-first
* * {@link parents}: Chain of parents, starting with immediate parent
* * {@link siblings}: Nodes with same parent
*
* @example Traversing over a simple object
* ```js
* import { Trees } from "https://unpkg.com/@ixfx/collections/bundle"
* const myObj = { name: `Pedro`, size: 45, colour: `orange` };
* const root = Trees.FromObject.asDynamicTraversable(myObj);
* for (const v of Trees.Traverse.breadthFirst(root)) {
* // v.getValue() yields:
* // { name: 'name', sourceValue: 'Pedro' ...},
* // { name: 'size', sourceValue: 45 ... }
* // ...
* }
* ```
* @param root Root node
* @param depth How many levels to traverse
* @returns
*/
function* breadthFirst(root$1, depth = Number.MAX_SAFE_INTEGER) {
	if (!root$1) return;
	const isTrav = isTraversable(root$1);
	const queue = isTrav ? new QueueMutable() : new QueueMutable();
	let entry = root$1;
	while (entry) {
		if (depth < 0) return;
		if (entry !== void 0) {
			const kids = `childrenStore` in entry ? entry.childrenStore : entry.children();
			for (const c of kids) {
				yield c;
				queue.enqueue(c);
			}
		}
		entry = queue.dequeue();
		depth--;
	}
}
/**
* Applies `predicate` to `root` and all its child nodes, returning the node where
* `predicate` yields _true_.
* Use {@link findByValue} to find a node by its value
* @param root
* @param predicate
* @param order Iterate children by breadth or depth. Default 'breadth'
* @returns
*/
function find(root$1, predicate, order = `breadth`) {
	if (predicate(root$1)) return root$1;
	const iter = order === `breadth` ? breadthFirst : depthFirst;
	for (const c of iter(root$1)) if (predicate(c)) return c;
}
/**
* Applies `predicate` to `root` and all its child nodes, returning the node value for
* `predicate` yields _true_.
* Use {@link find} to filter by nodes rather than values
*
* ```js
* const n = findByValue(root, (v) => v.name === 'Bob');
* ```
* @param root
* @param predicate
* @param order Iterate children by breadth or depth. Default 'breadth'
* @returns
*/
function findByValue(root$1, predicate, order = `breadth`) {
	if (predicate(root$1.getValue())) return root$1;
	const iter = order === `breadth` ? breadthFirst : depthFirst;
	for (const c of iter(root$1)) if (predicate(c.getValue())) return c;
}
/**
* Search through children in a path-like manner.
*
* It finds the first child of `root` that matches `continuePredicate`.
* The function gets passed a depth of 1 to begin with. It recurses, looking for the next sub-child, etc.
*
* If it can't find a child, it stops.
*
* This is different to 'find' functions, which exhaustively search all possible child nodes, regardless of position in tree.
*
* ```js
* const path = 'a.aa.aaa'.split('.');
* const pred = (nodeValue, depth) => {
*  if (nodeValue === path[0]) {
*    path.shift(); // Remove first element
*    return true;
*  }
*  return false;
* }
*
* // Assuming we have a tree of string values:
* // a
* //   - aa
* //       - aaa
* //   - ab
* // b
* //   - ba
* for (const c of follow(tree, pred)) {
*  // Returns nodes: a, aa and then aaa
* }
* ```
* @param root
* @param continuePredicate
* @param depth
*/
function* followValue(root$1, continuePredicate, depth = 1) {
	for (const c of root$1.children()) if (continuePredicate(c.getValue(), depth)) {
		yield c.getValue();
		yield* followValue(c, continuePredicate, depth + 1);
	}
}
function toStringDeep(node, depth = 0) {
	if (node === void 0) return `(undefined)`;
	if (node === null) return `(null)`;
	const v = node.getValue();
	let type = typeof v;
	if (Array.isArray(v)) type = `array`;
	let t = `  `.repeat(depth) + `value: ${JSON.stringify(v)} (${type})\n`;
	for (const n of node.children()) t += toStringDeep(n, depth + 1);
	return t;
}
function toString(...nodes) {
	let t = ``;
	for (const node of nodes) {
		const v = node.getValue();
		const vString = toStringAbbreviate(v);
		const children$2 = [...node.children()];
		const parent = node.getParent();
		let type = typeof v;
		if (Array.isArray(v)) type = `array`;
		t += `value: ${vString} (${type}) kids: ${children$2.length} parented: ${parent ? `y` : `n`}\n`;
	}
	return t;
}

//#endregion
//#region ../collections/dist/src/tree/index.js
var tree_exports = {};
__export(tree_exports, {
	FromObject: () => traverse_object_exports,
	Mutable: () => tree_mutable_exports,
	Pathed: () => pathed_exports,
	Traverse: () => traversable_tree_exports,
	compare: () => compare,
	isTraversable: () => isTraversable,
	isTreeNode: () => isTreeNode,
	toTraversable: () => toTraversable
});
/**
* Makes a 'traversable' to move around a {@link TreeNode}, an existing {@link TraversableTree} or a plain object.
*
* @param node
* @returns
*/
const toTraversable = (node) => {
	if (isTraversable(node)) return node;
	if (isTreeNode(node)) return asDynamicTraversable$1(node);
	if (typeof node === `object`) return asDynamicTraversable(node);
	throw new Error(`Parameter 'node' not convertible`);
};
/**
* Checks whether `node` is of type {@link TreeNode}.
*
* Checks for: parent, childrenStore and value defined on `node`.
* @param node
* @returns
*/
const isTreeNode = (node) => {
	if (`parent` in node && `childrenStore` in node && `value` in node) {
		if (Array.isArray(node.childrenStore)) return true;
	}
	return false;
};
/**
* Checks if `node` is of type {@link TraversableTree}.
*
* Checks by looking for: children, getParent, getValue and getIdentity defined on `node`.
* @param node
* @returns
*/
const isTraversable = (node) => {
	return `children` in node && `getParent` in node && `getValue` in node && `getIdentity` in node;
};

//#endregion
//#region ../collections/dist/src/stack/StackImmutable.js
var StackImmutable = class StackImmutable {
	opts;
	data;
	constructor(opts = {}, data = []) {
		this.opts = opts;
		this.data = data;
	}
	push(...toAdd) {
		return new StackImmutable(this.opts, push(this.opts, this.data, ...toAdd));
	}
	pop() {
		return new StackImmutable(this.opts, pop(this.opts, this.data));
	}
	forEach(fn) {
		this.data.forEach(fn);
	}
	forEachFromTop(fn) {
		[...this.data].reverse().forEach(fn);
	}
	get isEmpty() {
		return isEmpty$1(this.opts, this.data);
	}
	get isFull() {
		return isFull$1(this.opts, this.data);
	}
	get peek() {
		return peek$1(this.opts, this.data);
	}
	get length() {
		return this.data.length;
	}
};
/**
* Returns a stack. Immutable. Use {@link Stacks.mutable} for a mutable alternative.
*
* The basic usage is `push`/`pop` to add/remove, returning the modified stack. Use the
* property `peek` to see what's on top.
*
* @example Basic usage
* ```js
* // Create
* let s = stack();
* // Add one or more items
* s = s.push(1, 2, 3, 4);
* // See what's at the top of the stack
* s.peek;      // 4
*
* // Remove from the top of the stack, returning
* // a new stack without item
* s = s.pop();
* s.peek;        // 3
* ```
* @param options Options
* @param startingItems List of items to add to stack. Items will be pushed 'left to right', ie array index 0 will be bottom of the stack.
*/
const immutable$3 = (options = {}, ...startingItems) => new StackImmutable({ ...options }, [...startingItems]);

//#endregion
//#region ../collections/dist/src/stack/index.js
var stack_exports = {};
__export(stack_exports, {
	StackImmutable: () => StackImmutable,
	StackMutable: () => StackMutable,
	immutable: () => immutable$3,
	isEmpty: () => isEmpty$1,
	isFull: () => isFull$1,
	mutable: () => mutable$3,
	peek: () => peek$1,
	pop: () => pop,
	push: () => push,
	trimStack: () => trimStack
});

//#endregion
//#region ../collections/dist/src/set/set-mutable.js
/**
* Creates a {@link ISetMutable}.
* @param keyString Function that produces a key based on a value. If unspecified, uses `JSON.stringify`
* @returns
*/
const mutable$2 = (keyString) => new SetStringMutable(keyString);
/**
* Mutable string set
*/
var SetStringMutable = class extends SimpleEventEmitter {
	store = /* @__PURE__ */ new Map();
	keyString;
	/**
	* Constructor
	* @param keyString Function which returns a string version of added items. If unspecified `JSON.stringify`
	*/
	constructor(keyString) {
		super();
		this.keyString = keyString ?? defaultKeyer;
	}
	/**
	* Number of items stored in set
	*/
	get size() {
		return this.store.size;
	}
	/**
	* Adds one or more items to set. `add` event is fired for each item
	* @param values items to add
	*/
	add(...values) {
		let somethingAdded = false;
		for (const value$1 of values) {
			const isUpdated = this.has(value$1);
			this.store.set(this.keyString(value$1), value$1);
			super.fireEvent(`add`, {
				value: value$1,
				updated: isUpdated
			});
			if (!isUpdated) somethingAdded = true;
		}
		return somethingAdded;
	}
	/**
	* Returns values from set as an iterable
	* @returns
	*/
	values() {
		return this.store.values();
	}
	/**
	* Clear items from set
	*/
	clear() {
		this.store.clear();
		super.fireEvent(`clear`, true);
	}
	/**
	* Delete value from set.
	* @param v Value to delete
	* @returns _True_ if item was found and removed
	*/
	delete(v) {
		const isDeleted = this.store.delete(this.keyString(v));
		if (isDeleted) super.fireEvent(`delete`, v);
		return isDeleted;
	}
	/**
	* Returns _true_ if item exists in set
	* @param v
	* @returns
	*/
	has(v) {
		return this.store.has(this.keyString(v));
	}
	/**
	* Returns array copy of set
	* @returns Array copy of set
	*/
	toArray() {
		return [...this.store.values()];
	}
};

//#endregion
//#region ../collections/dist/src/set/SetImmutable.js
var SetStringImmutable = class SetStringImmutable {
	store;
	keyString;
	constructor(keyString, map$1) {
		this.store = map$1 ?? /* @__PURE__ */ new Map();
		this.keyString = keyString ?? defaultKeyer;
	}
	get size() {
		return this.store.size;
	}
	add(...values) {
		const s = new Map(this.store);
		for (const v of values) {
			const key = this.keyString(v);
			s.set(key, v);
		}
		return new SetStringImmutable(this.keyString, s);
	}
	delete(v) {
		const s = new Map(this.store);
		const key = this.keyString(v);
		if (s.delete(key)) return new SetStringImmutable(this.keyString, s);
		return this;
	}
	has(v) {
		const key = this.keyString(v);
		return this.store.has(key);
	}
	toArray() {
		return [...this.store.values()];
	}
	*values() {
		yield* this.store.values();
	}
};
/**
* Immutable set that uses a `keyString` function to determine uniqueness
*
* @param keyString Function that produces a key based on a value. If unspecified, uses `JSON.stringify`.
* @returns
*/
const immutable$2 = (keyString = toStringDefault) => new SetStringImmutable(keyString);

//#endregion
//#region ../collections/dist/src/set/massive-set.js
/**
* MassiveSet supports semantics similar to Set, but without the
* limitation on how much data is stored.
*
* It only supports strings, and stores data in a hierarchy.
*
* ```js
* const set = new MassiveSet(); // maxDepth=1 default
* set.add(`test`);
* set.add(`bloorp`);
* ```
*
* In the above example, it will create a subtree for the first letter
* of each key, putting the value underneath it. So we'd get a sub
* MassiveSet for every key starting with 't' and every one starting with 'b'.
*
* If `maxDepth` was 2, we'd get the same two top-level nodes, but then
* another sub-node based on the _second_ character of the value.
*
* It's not a very smart data-structure since it does no self-balancing
* or tuning.
*/
var MassiveSet = class MassiveSet {
	#depth;
	#maxDepth;
	children = /* @__PURE__ */ new Map();
	values = [];
	constructor(maxDepth = 1, depth = 0) {
		this.#depth = depth;
		this.#maxDepth = maxDepth;
	}
	/**
	* Returns the number of values stored in just this level of the set
	* @returns
	*/
	sizeLocal() {
		return this.values.length;
	}
	/**
	* Returns the number of branches at this node
	* Use {@link sizeChildrenDeep} to count all branches recursively
	* @returns
	*/
	sizeChildren() {
		return [...this.children.values()].length;
	}
	sizeChildrenDeep() {
		let t = this.sizeChildren();
		for (const c of this.children.values()) t += c.sizeChildrenDeep();
		return t;
	}
	/**
	* Returns the total number of values stored in the set
	*/
	size() {
		let x = this.values.length;
		for (const set$1 of this.children.values()) x += set$1.size();
		return x;
	}
	add(value$1) {
		if (typeof value$1 !== `string`) throw new Error(`Param 'value' must be a string. Got: ${typeof value$1}`);
		if (value$1.length === 0) throw new Error(`Param 'value' is empty`);
		const destination = this.#getChild(value$1, true);
		if (destination === this) {
			if (!this.hasLocal(value$1)) this.values.push(value$1);
			return;
		}
		if (!destination) throw new Error(`Could not create child set for: ${value$1}`);
		destination.add(value$1);
	}
	remove(value$1) {
		if (typeof value$1 !== `string`) throw new Error(`Param 'value' must be a string. Got: ${typeof value$1}`);
		if (value$1.length === 0) throw new Error(`Param 'value' is empty`);
		const destination = this.#getChild(value$1, false);
		if (destination === void 0) return false;
		if (destination === this) {
			if (this.hasLocal(value$1)) {
				this.values = this.values.filter((v) => v !== value$1);
				return true;
			}
			return false;
		}
		return destination.remove(value$1);
	}
	debugDump() {
		const r = this.#dumpToArray();
		for (const rr of r) console.log(rr);
	}
	#dumpToArray(depth = 0) {
		const r = [];
		r.push(`Depth: ${this.#depth} Max: ${this.#maxDepth}`);
		for (const [key, value$1] of this.children.entries()) {
			const dumped = value$1.#dumpToArray(depth + 1);
			r.push(` key: ${key}`);
			for (const d of dumped) r.push(` `.repeat(depth + 1) + d);
		}
		r.push(`Values: (${this.values.length})`);
		for (const v of this.values) r.push(` ${v}`);
		return r.map((line) => ` `.repeat(depth) + line);
	}
	#getChild(value$1, create$4) {
		if (value$1 === void 0) throw new Error(`Param 'value' undefined`);
		if (this.#depth === this.#maxDepth) return this;
		if (value$1.length <= this.#depth) return this;
		const k = value$1[this.#depth];
		if (k === void 0) throw new Error(`Logic error. Depth: ${this.#depth} Len: ${value$1.length}`);
		let child = this.children.get(k);
		if (child === void 0 && create$4) {
			child = new MassiveSet(this.#maxDepth, this.#depth + 1);
			this.children.set(k, child);
		}
		return child;
	}
	/**
	* Returns _true_ if `value` stored on this node
	* @param value
	* @returns
	*/
	hasLocal(value$1) {
		for (const v of this.values) if (v === value$1) return true;
		return false;
	}
	has(value$1) {
		if (typeof value$1 !== `string`) return false;
		const destination = this.#getChild(value$1, false);
		if (destination === void 0) return false;
		if (destination === this) return this.hasLocal(value$1);
		return destination.has(value$1);
	}
};

//#endregion
//#region ../collections/dist/src/set/index.js
var set_exports = {};
__export(set_exports, {
	MassiveSet: () => MassiveSet,
	SetStringImmutable: () => SetStringImmutable,
	SetStringMutable: () => SetStringMutable,
	immutable: () => immutable$2,
	mutable: () => mutable$2
});

//#endregion
//#region ../collections/dist/src/queue/priority-mutable.js
/**
* Simple priority queue implementation.
* Higher numbers mean higher priority.
*
* ```js
* const pm = new PriorityMutable();
*
* // Add items with a priority (higher numeric value = higher value)
* pm.enqueueWithPriority(`hello`, 4);
* pm.enqueueWithPriotity(`there`, 1);
*
* ```
*/
var PriorityMutable = class extends QueueMutable {
	constructor(opts = {}) {
		if (opts.eq === void 0) opts = {
			...opts,
			eq: (a, b) => {
				return isEqualDefault(a.item, b.item);
			}
		};
		super(opts);
	}
	/**
	* Adds an item with a given priority
	* @param item Item
	* @param priority Priority (higher numeric value means higher priority)
	*/
	enqueueWithPriority(item, priority$1) {
		resultThrow(numberTest(priority$1, `positive`));
		super.enqueue({
			item,
			priority: priority$1
		});
	}
	changePriority(item, priority$1, addIfMissing = false, eq) {
		if (item === void 0) throw new Error(`Item cannot be undefined`);
		let toDelete;
		for (const d of this.data) if (eq) {
			if (eq(d.item, item)) {
				toDelete = d;
				break;
			}
		} else if (this.eq(d, {
			item,
			priority: 0
		})) {
			toDelete = d;
			break;
		}
		if (toDelete === void 0 && !addIfMissing) throw new Error(`Item not found in priority queue. Item: ${JSON.stringify(item)}`);
		if (toDelete !== void 0) this.removeWhere((item$1) => toDelete === item$1);
		this.enqueueWithPriority(item, priority$1);
	}
	dequeueMax() {
		const m = last$1(max(this.data, (a, b) => a.priority >= b.priority));
		if (m === void 0) return;
		this.removeWhere((item) => item === m);
		return m.item;
	}
	dequeueMin() {
		const m = last$1(max(this.data, (a, b) => a.priority >= b.priority));
		if (m === void 0) return;
		this.removeWhere((item) => item.item === m);
		return m.item;
	}
	peekMax() {
		const m = last$1(max(this.data, (a, b) => a.priority >= b.priority));
		if (m === void 0) return;
		return m.item;
	}
	peekMin() {
		const m = last$1(min(this.data, (a, b) => a.priority >= b.priority));
		if (m === void 0) return;
		return m.item;
	}
};
/**
* Creates a {@link PriorityMutable} queue.
*
* Options:
* * eq: Equality function
* * capacity: limit on number of items
* * discardPolicy: what to do if capacity is reached
* @param opts
* @returns
*/
function priority(opts = {}) {
	return new PriorityMutable(opts);
}

//#endregion
//#region ../collections/dist/src/queue/queue-immutable.js
var QueueImmutable = class QueueImmutable {
	opts;
	#data;
	/**
	* Creates an instance of Queue.
	* @param {QueueOpts} opts Options foor queue
	* @param {V[]} data Initial data. Index 0 is front of queue
	*/
	constructor(opts = {}, data = []) {
		if (opts === void 0) throw new Error(`opts parameter undefined`);
		this.opts = opts;
		this.#data = data;
	}
	forEach(fn) {
		for (let index = this.#data.length - 1; index >= 0; index--) fn(this.#data[index]);
	}
	forEachFromFront(fn) {
		this.#data.forEach((item) => {
			fn(item);
		});
	}
	enqueue(...toAdd) {
		return new QueueImmutable(this.opts, enqueue(this.opts, this.#data, ...toAdd));
	}
	dequeue() {
		return new QueueImmutable(this.opts, dequeue(this.opts, this.#data));
	}
	get isEmpty() {
		return isEmpty(this.opts, this.#data);
	}
	get isFull() {
		return isFull(this.opts, this.#data);
	}
	get length() {
		return this.#data.length;
	}
	get peek() {
		return peek(this.opts, this.#data);
	}
	toArray() {
		return [...this.#data];
	}
};
/**
* Returns an immutable queue. Queues are useful if you want to treat 'older' or 'newer'
* items differently. _Enqueing_ adds items at the back of the queue, while
* _dequeing_ removes items from the front (ie. the oldest).
*
* ```js
* let q = Queues.immutable();           // Create
* q = q.enqueue(`a`, `b`);   // Add two strings
* const front = q.peek();    // `a` is at the front of queue (oldest)
* q = q.dequeue();           // q now just consists of `b`
* ```
* @example Cap size to 5 items, throwing away newest items already in queue.
* ```js
* const q = Queues.immutable({capacity: 5, discardPolicy: `newer`});
* ```
*
* @typeParam V - Type of values stored
* @param options
* @param startingItems Index 0 is the front of the queue
* @returns A new queue
*/
const immutable$1 = (options = {}, ...startingItems) => {
	options = { ...options };
	return new QueueImmutable(options, [...startingItems]);
};

//#endregion
//#region ../collections/dist/src/queue/index.js
var queue_exports = {};
__export(queue_exports, {
	PriorityMutable: () => PriorityMutable,
	QueueImmutable: () => QueueImmutable,
	QueueMutable: () => QueueMutable,
	debug: () => debug,
	dequeue: () => dequeue,
	enqueue: () => enqueue,
	immutable: () => immutable$1,
	isEmpty: () => isEmpty,
	isFull: () => isFull,
	mutable: () => mutable$1,
	peek: () => peek,
	priority: () => priority,
	trimQueue: () => trimQueue
});

//#endregion
//#region ../collections/dist/src/map/expiring-map.js
/**
* Create a ExpiringMap instance
* @param options Options when creating map
* @returns
*/
const create$1 = (options = {}) => new ExpiringMap(options);
/***
* A map that can have a capacity limit. The elapsed time for each get/set
* operation is maintained allowing for items to be automatically removed.
* `has()` does not affect the last access time.
*
* By default, it uses the `none` eviction policy, meaning that when full
* an error will be thrown if attempting to add new keys.
*
* Eviction policies:
* `oldestGet` removes the item that hasn't been accessed the longest,
* `oldestSet` removes the item that hasn't been updated the longest.
*
* ```js
* const map = new ExpiringMap();
* map.set(`fruit`, `apple`);
*
* // Remove all entries that were set more than 100ms ago
* map.deleteWithElapsed(100, `set`);
* // Remove all entries that were last accessed more than 100ms ago
* map.deleteWithElapsed(100, `get`);
* // Returns the elapsed time since `fruit` was last accessed
* map.elapsedGet(`fruit`);
* // Returns the elapsed time since `fruit` was last set
* map.elapsedSet(`fruit`);
* ```
*
* Last set/get time for a key can be manually reset using {@link touch}.
*
*
* Events:
* * 'expired': when an item is automatically removed.
* * 'removed': when an item is manually or automatically removed.
* * 'newKey': when a new key is added
*
* ```js
* map.addEventListener(`expired`, evt => {
*  const { key, value } = evt;
* });
* ```
* The map can automatically remove items based on elapsed intervals.
*
* @example
* Automatically delete items that haven't been accessed for one second
* ```js
* const map = new ExpiringMap({
*  autoDeleteElapsed: 1000,
*  autoDeletePolicy: `get`
* });
* ```
*
* @example
* Automatically delete the oldest item if we reach a capacity limit
* ```js
* const map = new ExpiringMap({
*  capacity: 5,
*  evictPolicy: `oldestSet`
* });
* ```
* @typeParam K - Type of keys
* @typeParam V - Type of values
*/
var ExpiringMap = class extends SimpleEventEmitter {
	capacity;
	store;
	evictPolicy;
	autoDeleteElapsedMs;
	autoDeletePolicy;
	autoDeleteTimer;
	disposed = false;
	constructor(opts = {}) {
		super();
		this.capacity = opts.capacity ?? -1;
		resultThrow(integerTest(this.capacity, `nonZero`, `capacity`));
		this.store = /* @__PURE__ */ new Map();
		if (opts.evictPolicy && this.capacity <= 0) throw new Error(`evictPolicy is set, but no capacity limit is set`);
		this.evictPolicy = opts.evictPolicy ?? `none`;
		this.autoDeleteElapsedMs = opts.autoDeleteElapsedMs ?? -1;
		this.autoDeletePolicy = opts.autoDeletePolicy ?? `none`;
		if (this.autoDeleteElapsedMs > 0) this.autoDeleteTimer = setInterval(() => {
			this.#maintain();
		}, Math.max(1e3, this.autoDeleteElapsedMs * 2));
	}
	dispose() {
		if (this.disposed) return;
		this.disposed = true;
		if (this.autoDeleteTimer) {
			clearInterval(this.autoDeleteTimer);
			this.autoDeleteTimer = void 0;
		}
	}
	/**
	* Returns the number of keys being stored.
	*/
	get keyLength() {
		return this.store.size;
	}
	*entries() {
		for (const entry of this.store.entries()) yield [entry[0], entry[1].value];
	}
	*values() {
		for (const v of this.store.values()) yield v.value;
	}
	*keys() {
		yield* this.store.keys();
	}
	/**
	* Returns the elapsed time since `key`
	* was set. Returns _undefined_ if `key`
	* does not exist
	*/
	elapsedSet(key) {
		const v = this.store.get(key);
		if (typeof v === `undefined`) return;
		return Date.now() - v.lastSet;
	}
	/**
	* Returns the elapsed time since `key`
	* was accessed. Returns _undefined_ if `key`
	* does not exist
	*/
	elapsedGet(key) {
		const v = this.store.get(key);
		if (typeof v === `undefined`) return;
		return Date.now() - v.lastGet;
	}
	/**
	* Returns true if `key` is stored.
	* Does not affect the key's last access time.
	* @param key
	* @returns
	*/
	has(key) {
		return this.store.has(key);
	}
	/**
	* Gets an item from the map by key, returning
	* undefined if not present
	* @param key Key
	* @returns Value, or undefined
	*/
	get(key) {
		const v = this.store.get(key);
		if (v) {
			if (this.autoDeletePolicy === `either` || this.autoDeletePolicy === `get`) this.store.set(key, {
				...v,
				lastGet: performance.now()
			});
			return v.value;
		}
	}
	/**
	* Deletes the value under `key`, if present.
	*
	* Returns _true_ if something was removed.
	* @param key
	* @returns
	*/
	delete(key) {
		const value$1 = this.store.get(key);
		if (!value$1) return false;
		const d = this.store.delete(key);
		this.fireEvent(`removed`, {
			key,
			value: value$1.value
		});
		return d;
	}
	/**
	* Clears the contents of the map.
	* Note: does not fire `removed` event
	*/
	clear() {
		this.store.clear();
	}
	/**
	* Updates the lastSet/lastGet time for a value
	* under `k`.
	*
	* Returns false if key was not found
	* @param key
	* @returns
	*/
	touch(key) {
		const v = this.store.get(key);
		if (!v) return false;
		this.store.set(key, {
			...v,
			lastSet: Date.now(),
			lastGet: Date.now()
		});
		return true;
	}
	findEvicteeKey() {
		if (this.evictPolicy === `none`) return;
		let sortBy = ``;
		if (this.evictPolicy === `oldestGet`) sortBy = `lastGet`;
		else if (this.evictPolicy === `oldestSet`) sortBy = `lastSet`;
		else throw new Error(`Unknown eviction policy ${this.evictPolicy}`);
		const sorted = sortByValueProperty(this.store, sortBy);
		return sorted[0][0];
	}
	#maintain() {
		if (this.autoDeletePolicy === `none`) return;
		this.deleteWithElapsed(this.autoDeleteElapsedMs, this.autoDeletePolicy);
	}
	/**
	* Deletes all values where elapsed time has past
	* for get/set or either.
	* ```js
	* // Delete all keys (and associated values) not accessed for a minute
	* em.deleteWithElapsed({mins:1}, `get`);
	* // Delete things that were set 1s ago
	* em.deleteWithElapsed(1000, `set`);
	* ```
	*
	* @param interval Interval
	* @param property Basis for deletion 'get','set' or 'either'
	* @returns Items removed
	*/
	deleteWithElapsed(interval, property) {
		const entries$1 = [...this.store.entries()];
		const prune = [];
		const intervalMs = intervalToMs(interval, 1e3);
		const now = performance.now();
		for (const entry of entries$1) {
			const elapsedGet = now - entry[1].lastGet;
			const elapsedSet = now - entry[1].lastSet;
			const elapsed = property === `get` ? elapsedGet : property === `set` ? elapsedSet : Math.max(elapsedGet, elapsedSet);
			if (elapsed >= intervalMs) prune.push([entry[0], entry[1].value]);
		}
		for (const entry of prune) {
			this.store.delete(entry[0]);
			const eventArguments = {
				key: entry[0],
				value: entry[1]
			};
			this.fireEvent(`expired`, eventArguments);
			this.fireEvent(`removed`, eventArguments);
		}
		return prune;
	}
	/**
	* Sets the `key` to be `value`.
	*
	* If the key already exists, it is updated.
	*
	* If the map is full, according to its capacity,
	* another value is selected for removal.
	* @param key
	* @param value
	* @returns
	*/
	set(key, value$1) {
		const existing = this.store.get(key);
		if (existing) {
			this.store.set(key, {
				...existing,
				lastSet: performance.now()
			});
			return;
		}
		if (this.keyLength === this.capacity && this.capacity > 0) {
			const key$1 = this.findEvicteeKey();
			if (!key$1) throw new Error(`ExpiringMap full (capacity: ${this.capacity})`);
			const existing$1 = this.store.get(key$1);
			this.store.delete(key$1);
			if (existing$1) {
				const eventArguments = {
					key: key$1,
					value: existing$1.value
				};
				this.fireEvent(`expired`, eventArguments);
				this.fireEvent(`removed`, eventArguments);
			}
		}
		this.store.set(key, {
			lastGet: 0,
			lastSet: performance.now(),
			value: value$1
		});
		this.fireEvent(`newKey`, {
			key,
			value: value$1
		});
	}
};

//#endregion
//#region ../collections/dist/src/map/map-multi-fns.js
/**
* Finds first entry by iterable value. Expects a map with an iterable as values.
*
* ```js
* const map = new Map();
* map.set('hello', ['a', 'b', 'c']);
* map.set('there', ['d', 'e', 'f']);
*
* const entry = firstEntry(map, (value, key) => {
*  return (value === 'e');
* });
* // Entry is: ['there', ['d', 'e', 'f']]
* ```
*
* An alternative is {@link firstEntryByValue} to search by value.
* @param map Map to search
* @param predicate Filter function returns true when there is a match of value
* @returns Entry, or _undefined_ if `filter` function never returns _true_
*/
const firstEntry = (map$1, predicate) => {
	for (const e of map$1.entries()) {
		const value$1 = e[1];
		for (const subValue of value$1) if (predicate(subValue, e[0])) return e;
	}
};
/**
* Returns the size of the largest key, or 0 if empty.
*/
const lengthMax = (map$1) => {
	let largest = ["", 0];
	for (const e of map$1.keysAndCounts()) if (e[1] > largest[1]) largest = e;
	return largest[1];
};
/**
* Finds first entry by iterable value. Expects a map with an iterable as values.
*
* ```js
* const map = new Map();
* map.set('hello', ['a', 'b', 'c']);
* map.set('there', ['d', 'e', 'f']);
*
* const entry = firstEntryByValue(map, 'e');
* // Entry is: ['there', ['d', 'e', 'f']]
* ```
*
* An alternative is {@link firstEntry} to search by predicate function.
* @param map Map to search
* @param value Value to seek
* @param isEqual Filter function which checks equality. Uses JS comparer by default.
* @returns Entry, or _undefined_ if `value` not found.
*/
const firstEntryByValue = (map$1, value$1, isEqual = isEqualDefault) => {
	for (const e of map$1.entries()) {
		const value_ = e[1];
		for (const subValue of value_) if (isEqual(subValue, value$1)) return e;
	}
};

//#endregion
//#region ../collections/dist/src/map/map-of-simple-base.js
var MapOfSimpleBase = class {
	map;
	groupBy;
	valueEq;
	/**
	* Constructor
	* @param groupBy Creates keys for values when using `addValue`. By default uses JSON.stringify
	* @param valueEq Compare values. By default uses JS logic for equality
	*/
	constructor(groupBy = defaultKeyer, valueEq = isEqualDefault, initial = []) {
		this.groupBy = groupBy;
		this.valueEq = valueEq;
		this.map = new Map(initial);
	}
	/**
	* Returns _true_ if `key` exists
	* @param key
	* @returns
	*/
	has(key) {
		return this.map.has(key);
	}
	/**
	* Returns _true_ if `value` exists under `key`.
	* @param key Key
	* @param value Value to seek under `key`
	* @returns _True_ if `value` exists under `key`.
	*/
	hasKeyValue(key, value$1) {
		const values = this.map.get(key);
		if (!values) return false;
		for (const v of values) if (this.valueEq(v, value$1)) return true;
		return false;
	}
	/**
	* Debug dump of contents
	* @returns
	*/
	debugString() {
		let r = ``;
		const keys = [...this.map.keys()];
		keys.every((k) => {
			const v = this.map.get(k);
			if (v === void 0) return;
			r += k + ` (${v.length}) = ${JSON.stringify(v)}\r\n`;
		});
		return r;
	}
	/**
	* Return number of values stored under `key`.
	* Returns 0 if `key` is not found.
	* @param key
	* @returns
	*/
	count(key) {
		const values = this.map.get(key);
		if (!values) return 0;
		return values.length;
	}
	/**
	* Returns first key that contains `value`
	* @param value
	* @param eq
	* @returns
	*/
	firstKeyByValue(value$1, eq = isEqualDefault) {
		const entry = firstEntryByValue(this, value$1, eq);
		if (entry) return entry[0];
	}
	/**
	* Iterate over all entries
	*/
	*entriesFlat() {
		for (const key of this.map.keys()) for (const value$1 of this.map.get(key)) yield [key, value$1];
	}
	/**
	* Iterate over keys and array of values for that key
	*/
	*entries() {
		for (const [k, v] of this.map.entries()) yield [k, [...v]];
	}
	/**
	* Get all values under `key`
	* @param key
	* @returns
	*/
	*get(key) {
		const m = this.map.get(key);
		if (!m) return;
		yield* m.values();
	}
	/**
	* Iterate over all keys
	*/
	*keys() {
		yield* this.map.keys();
	}
	/**
	* Iterate over all values (regardless of key).
	* Use {@link values} to iterate over a set of values per key
	*/
	*valuesFlat() {
		for (const entries$1 of this.map) yield* entries$1[1];
	}
	/**
	* Yields the values for each key in sequence, returning an array.
	* Use {@link valuesFlat} to iterate over all keys regardless of key.
	*/
	*values() {
		for (const entries$1 of this.map) yield entries$1[1];
	}
	/**
	* Iterate over keys and length of values stored under keys
	*/
	*keysAndCounts() {
		for (const entries$1 of this.map) yield [entries$1[0], entries$1[1].length];
	}
	/**
	* Returns the count of keys.
	*/
	get lengthKeys() {
		return this.map.size;
	}
	/**
	* _True_ if empty
	*/
	get isEmpty() {
		return this.map.size === 0;
	}
};

//#endregion
//#region ../collections/dist/src/map/map-of-simple-mutable.js
/**
* A simple mutable map of arrays, without events. It can store multiple values
* under the same key.
*
* For a fancier approaches, consider ofArrayMutable, ofCircularMutable or ofSetMutable.
*
* @example
* ```js
* const m = mapOfSimpleMutable();
* m.add(`hello`, 1, 2, 3); // Adds numbers under key `hello`
* m.delete(`hello`);       // Deletes everything under `hello`
*
* const hellos = m.get(`hello`); // Get list of items under `hello`
* ```
*
* Constructor takes a `groupBy` parameter, which yields a string key for a value. This is the
* basis by which values are keyed when using `addValues`.
*
* Constructor takes a `valueEq` parameter, which compares values. This is used when checking
* if a value exists under a key, for example.
* @typeParam V - Type of items
*/
var MapOfSimpleMutable = class extends MapOfSimpleBase {
	addKeyedValues(key, ...values) {
		const existing = this.map.get(key);
		if (existing === void 0) this.map.set(key, values);
		else this.map.set(key, [...existing, ...values]);
	}
	/**
	* Set `values` to `key`.
	* Previous data stored under `key` is thrown away.
	* @param key
	* @param values
	*/
	setValues(key, values) {
		this.map.set(key, values);
	}
	/**
	* Adds a value, automatically extracting a key via the
	* `groupBy` function assigned in the constructor options.
	* @param values Adds several values
	*/
	addValue(...values) {
		for (const v of values) {
			const key = this.groupBy(v);
			this.addKeyedValues(key, v);
		}
	}
	/**
	* Delete `value` under a particular `key`
	* @param key
	* @param value
	* @returns _True_ if `value` was found under `key`
	*/
	deleteKeyValue(key, value$1) {
		const existing = this.map.get(key);
		if (existing === void 0) return false;
		const without$1 = existing.filter((existingValue) => !this.valueEq(existingValue, value$1));
		this.map.set(key, without$1);
		return without$1.length < existing.length;
	}
	/**
	* Deletes `value` regardless of key.
	*
	* Uses the constructor-defined equality function.
	* @param value Value to delete
	* @returns
	*/
	deleteByValue(value$1) {
		let del$1 = false;
		const entries$1 = [...this.map.entries()];
		for (const keyEntries of entries$1) for (const values of keyEntries[1]) if (this.valueEq(values, value$1)) {
			del$1 = true;
			this.deleteKeyValue(keyEntries[0], value$1);
		}
		return del$1;
	}
	/**
	* Deletes all values under `key`,
	* @param key
	* @returns _True_ if `key` was found and values stored
	*/
	delete(key) {
		const values = this.map.get(key);
		if (!values) return false;
		if (values.length === 0) return false;
		this.map.delete(key);
		return true;
	}
	/**
	* Clear contents
	*/
	clear() {
		this.map.clear();
	}
};
/**
* A simple mutable map of arrays, without events. It can store multiple values
* under the same key.
*
* For a fancier approaches, consider {@link ofArrayMutable}, {@link ofCircularMutable} or {@link ofSetMutable}.
*
* @example
* ```js
* const m = mapOfSimpleMutable();
* m.add(`hello`, 1, 2, 3); // Adds numbers under key `hello`
* m.delete(`hello`);       // Deletes everything under `hello`
*
* const hellos = m.get(`hello`); // Get list of items under `hello`
* ```
*
* @typeParam V - Type of items
* @returns New instance
*/
const ofSimpleMutable = (groupBy = defaultKeyer, valueEq = isEqualDefault) => new MapOfSimpleMutable(groupBy, valueEq);

//#endregion
//#region ../collections/dist/src/map/map-immutable-fns.js
/**
* Adds an array o [k,v] to the map, returning a new instance
* @param map Initial data
* @param data Data to add
* @returns New map with data added
*/
const addArray = (map$1, data) => {
	const x = new Map(map$1.entries());
	for (const d of data) {
		if (d[0] === void 0) throw new Error(`key cannot be undefined`);
		if (d[1] === void 0) throw new Error(`value cannot be undefined`);
		x.set(d[0], d[1]);
	}
	return x;
};
/**
* Adds objects to the map, returning a new instance
* @param map Initial data
* @param data Data to add
* @returns A new map with data added
*/
const addObjects = (map$1, data) => {
	const x = new Map(map$1.entries());
	for (const d of data) {
		if (d.key === void 0) throw new Error(`key cannot be undefined`);
		if (d.value === void 0) throw new Error(`value cannot be undefined`);
		x.set(d.key, d.value);
	}
	return x;
};
/**
* Returns true if map contains key
*
* @example
* ```js
* if (has(map, `London`)) ...
* ```
* @param map Map to search
* @param key Key to find
* @returns True if map contains key
*/
const has = (map$1, key) => map$1.has(key);
/**
* Adds data to a map, returning the new map.
*
* Can add items in the form of [key,value] or {key, value}.
* @example These all produce the same result
* ```js
* map.set(`hello`, `samantha`);
* map.add([`hello`, `samantha`]);
* map.add({key: `hello`, value: `samantha`})
* ```
* @param map Initial data
* @param data One or more data to add in the form of [key,value] or {key, value}
* @returns New map with data added
*/
const add = (map$1, ...data) => {
	if (map$1 === void 0) throw new Error(`map parameter is undefined`);
	if (data === void 0) throw new Error(`data parameter i.s undefined`);
	if (data.length === 0) return map$1;
	const firstRecord = data[0];
	const isObject = typeof firstRecord.key !== `undefined` && typeof firstRecord.value !== `undefined`;
	return isObject ? addObjects(map$1, data) : addArray(map$1, data);
};
/**
* Sets data in a copy of the initial map
* @param map Initial map
* @param key Key
* @param value Value to  set
* @returns New map with data set
*/
const set = (map$1, key, value$1) => {
	const x = new Map(map$1.entries());
	x.set(key, value$1);
	return x;
};
/**
* Delete a key from the map, returning a new map
* @param map Initial data
* @param key
* @returns New map with data deleted
*/
const del = (map$1, key) => {
	const x = new Map(map$1.entries());
	x.delete(key);
	return x;
};

//#endregion
//#region ../collections/dist/src/map/map.js
/**
* Returns an {@link IMapImmutable}.
* Use {@link Maps.mutable} as a mutable alternatve.
*
* @example Basic usage
* ```js
* // Creating
* let m = map();
* // Add
* m = m.set("name", "sally");
* // Recall
* m.get("name");
* ```
*
* @example Enumerating
* ```js
* for (const [key, value] of map.entries()) {
*  console.log(`${key} = ${value}`);
* }
* ```
*
* @example Overview
* ```js
* // Create
* let m = map();
* // Add as array or key & value pair
* m = m.add(["name" , "sally"]);
* m = m.add({ key: "name", value: "sally" });
* // Add using the more typical set
* m = m.set("name", "sally");
* m.get("name");   // "sally";
* m.has("age");    // false
* m.has("name");   // true
* m.isEmpty;       // false
* m = m.delete("name");
* m.entries();     // Iterator of key value pairs
* ```
*
* Since it is immutable, `add()`, `delete()` and `clear()` return a new version with change.
*
* @param dataOrMap Optional initial data in the form of an array of `{ key: value }` or `[ key, value ]`
*/
const immutable = (dataOrMap) => {
	if (dataOrMap === void 0) return immutable([]);
	if (Array.isArray(dataOrMap)) return immutable(add(/* @__PURE__ */ new Map(), ...dataOrMap));
	const data = dataOrMap;
	return {
		add: (...itemsToAdd) => {
			const s = add(data, ...itemsToAdd);
			return immutable(s);
		},
		set: (key, value$1) => {
			const s = set(data, key, value$1);
			return immutable(s);
		},
		get: (key) => data.get(key),
		delete: (key) => immutable(del(data, key)),
		clear: () => immutable(),
		has: (key) => data.has(key),
		entries: () => data.entries(),
		values: () => data.values(),
		isEmpty: () => data.size === 0
	};
};

//#endregion
//#region ../collections/dist/src/map/map-mutable.js
/**
* Returns a {@link IMapMutable} (which just wraps the in-built Map)
* Use {@link Maps.immutable} for the immutable alternative.
*
* @example Basic usage
* ```js
* const m = mapMutable();
* // Add one or more entries
* m.add(["name", "sally"]);
* // Alternatively:
* m.set("name", "sally");
* // Recall
* m.get("name");           // "sally"
* m.delete("name");
* m.isEmpty; // True
* m.clear();
* ```
* @param data Optional initial data in the form of an array of `{ key: value }` or `[ key, value ]`
*/
const mutable = (...data) => {
	let m = add(/* @__PURE__ */ new Map(), ...data);
	return {
		add: (...data$1) => {
			m = add(m, ...data$1);
		},
		delete: (key) => {
			m = del(m, key);
		},
		clear: () => {
			m = add(/* @__PURE__ */ new Map());
		},
		set: (key, value$1) => {
			m = set(m, key, value$1);
		},
		get: (key) => m.get(key),
		entries: () => m.entries(),
		values: () => m.values(),
		isEmpty: () => m.size === 0,
		has: (key) => has(m, key)
	};
};

//#endregion
//#region ../collections/dist/src/map/map-of-multi-impl.js
/**
* @internal
*/
var MapOfMutableImpl = class extends SimpleEventEmitter {
	#map = /* @__PURE__ */ new Map();
	groupBy;
	type;
	constructor(type, opts = {}) {
		super();
		this.type = type;
		this.groupBy = opts.groupBy ?? toStringDefault;
	}
	/**
	* Returns the type name. For in-built implementations, it will be one of: array, set or circular
	*/
	get typeName() {
		return this.type.name;
	}
	/**
	* Returns the number of keys
	*/
	get lengthKeys() {
		return this.#map.size;
	}
	/**
	* Returns the length of the longest child list
	*/
	get lengthMax() {
		let m = 0;
		for (const v of this.#map.values()) m = Math.max(m, this.type.count(v));
		return m;
	}
	debugString() {
		const keys = [...this.#map.keys()];
		let r = `Keys: ${keys.join(`, `)}\r\n`;
		for (const k of keys) {
			const v = this.#map.get(k);
			if (v === void 0) r += ` - ${k} (undefined)\r\n`;
			else {
				const asArray = this.type.toArray(v);
				if (asArray !== void 0) r += ` - ${k} (${this.type.count(v)}) = ${JSON.stringify(asArray)}\r\n`;
			}
		}
		return r;
	}
	get isEmpty() {
		return this.#map.size === 0;
	}
	clear() {
		this.#map.clear();
		super.fireEvent(`clear`, true);
	}
	addKeyedValues(key, ...values) {
		const set$1 = this.#map.get(key);
		if (set$1 === void 0) {
			this.#map.set(key, this.type.addKeyedValues(void 0, values));
			super.fireEvent(`addedKey`, { key });
			super.fireEvent(`addedValues`, { values });
		} else {
			this.#map.set(key, this.type.addKeyedValues(set$1, values));
			super.fireEvent(`addedValues`, { values });
		}
	}
	set(key, values) {
		this.addKeyedValues(key, ...values);
		return this;
	}
	addValue(...values) {
		for (const v of values) this.addKeyedValues(this.groupBy(v), v);
	}
	hasKeyValue(key, value$1, eq) {
		const m = this.#map.get(key);
		if (m === void 0) return false;
		return this.type.has(m, value$1, eq);
	}
	has(key) {
		return this.#map.has(key);
	}
	deleteKeyValue(key, value$1) {
		const a = this.#map.get(key);
		if (a === void 0) return false;
		return this.deleteKeyValueFromMap(a, key, value$1);
	}
	deleteKeyValueFromMap(map$1, key, value$1) {
		const preCount = this.type.count(map$1);
		const filtered = this.type.without(map$1, value$1);
		const postCount = filtered.length;
		this.#map.set(key, this.type.addKeyedValues(void 0, filtered));
		return preCount > postCount;
	}
	deleteByValue(value$1) {
		let something = false;
		[...this.#map.keys()].filter((key) => {
			const a = this.#map.get(key);
			if (!a) throw new Error(`Bug: map could not be accessed`);
			if (this.deleteKeyValueFromMap(a, key, value$1)) {
				something = true;
				if (this.count(key) === 0) this.delete(key);
			}
		});
		return something;
	}
	delete(key) {
		const a = this.#map.get(key);
		if (a === void 0) return false;
		this.#map.delete(key);
		this.fireEvent(`deleteKey`, { key });
		return true;
	}
	firstKeyByValue(value$1, eq = isEqualDefault) {
		const keys = [...this.#map.keys()];
		const found = keys.find((key) => {
			const a = this.#map.get(key);
			if (a === void 0) throw new Error(`Bug: map could not be accessed`);
			const r = this.type.has(a, value$1, eq);
			return r;
		});
		return found;
	}
	count(key) {
		const entry = this.#map.get(key);
		if (entry === void 0) return 0;
		return this.type.count(entry);
	}
	/**
	* Iterates over values stored under `key`
	* An empty array is returned if there are no values
	*/
	*get(key) {
		const m = this.#map.get(key);
		if (m === void 0) return;
		yield* this.type.iterable(m);
	}
	/**
	* Iterate over the values stored under `key`.
	* If key does not exist, iteration is essentially a no-op
	* @param key
	* @returns
	*/
	*valuesFor(key) {
		const m = this.#map.get(key);
		if (m === void 0) return;
		yield* this.type.iterable(m);
	}
	getSource(key) {
		return this.#map.get(key);
	}
	*keys() {
		yield* this.#map.keys();
	}
	*entriesFlat() {
		for (const entry of this.#map.entries()) for (const v of this.type.iterable(entry[1])) yield [entry[0], v];
	}
	*valuesFlat() {
		for (const entry of this.#map.entries()) yield* this.type.iterable(entry[1]);
	}
	*entries() {
		for (const [k, v] of this.#map.entries()) {
			const temporary = [...this.type.iterable(v)];
			yield [k, temporary];
		}
	}
	*keysAndCounts() {
		for (const key of this.keys()) yield [key, this.count(key)];
	}
	merge(other) {
		for (const key of other.keys()) {
			const data = other.get(key);
			this.addKeyedValues(key, ...data);
		}
	}
	get size() {
		return this.#map.size;
	}
	get [Symbol.toStringTag]() {
		return this.#map[Symbol.toStringTag];
	}
};

//#endregion
//#region ../collections/dist/src/map/map-of-set-mutable.js
/**
* Returns a {@link IMapOfMutableExtended} that uses a set to hold values.
* This means that only unique values are stored under each key. By default it
* uses the JSON representation to compare items.
*
* Options: `{ hash: toStringFn } }`
*
* `hash` is Util.ToString function: `(object) => string`. By default it uses
* `JSON.stringify`.
*
* @example Only storing the newest three items per key
* ```js
* const map = ofSetMutable();
* map.addKeyedValues(`hello`, [1, 2, 3, 1, 2, 3]);
* const hello = map.get(`hello`); // [1, 2, 3]
* ```
*
* @example
* ```js
* const hash = (v) => v.name; // Use name as the key
* const map = ofSetMutable({hash});
* map.addValue({age:40, name: `Mary`});
* map.addValue({age:29, name: `Mary`}); // Value ignored as same name exists
* ```
* @param options
* @returns
*/
const ofSetMutable = (options) => {
	const hash = options?.hash ?? toStringDefault;
	const comparer = (a, b) => hash(a) === hash(b);
	const t = {
		get name() {
			return `set`;
		},
		iterable: (source) => source.values(),
		addKeyedValues: (dest, values) => addValue(dest, hash, `skip`, ...values),
		count: (source) => source.size,
		find: (source, predicate) => findValue(source, predicate),
		filter: (source, predicate) => filterValues(source, predicate),
		toArray: (source) => toArray(source),
		has: (source, value$1) => hasAnyValue(source, value$1, comparer),
		without: (source, value$1) => without(toArray(source), value$1, comparer)
	};
	const m = new MapOfMutableImpl(t, options);
	return m;
};

//#endregion
//#region ../collections/dist/src/map/map-of-circular-mutable.js
/**
* Returns a {@link IMapOfMutableExtended} that uses a {@link ICircularArray} to hold values. Mutable.
* This means that the number of values stored under each key will be limited to the defined
* capacity.
*
* Required option:
* * `capacity`: how many items to hold
*
* @example Only store the most recent three items per key
* ```js
* const map = ofCircularMutable({capacity: 3});
* map.add(`hello`, [1, 2, 3, 4, 5]);
* const hello = map.get(`hello`); // [3, 4, 5]
* ```
*
*
* @param options
* @returns
*/
const ofCircularMutable = (options) => {
	const comparer = isEqualDefault;
	const t = {
		get name() {
			return `circular`;
		},
		addKeyedValues: (destination, values) => {
			let ca = destination ?? new CircularArray(options.capacity);
			for (const v of values) ca = ca.add(v);
			return ca;
		},
		count: (source) => source.length,
		find: (source, predicate) => source.find(predicate),
		filter: (source, predicate) => source.filter(predicate),
		toArray: (source) => source,
		iterable: (source) => source.values(),
		has: (source, value$1) => source.find((v) => comparer(v, value$1)) !== void 0,
		without: (source, value$1) => source.filter((v) => !comparer(v, value$1))
	};
	return new MapOfMutableImpl(t, options);
};

//#endregion
//#region ../collections/dist/src/map/number-map.js
/**
* Simple map for numbers.
*
* Keys not present in map return the `defaultValue` given in the constructor
* ```js
* // All keys default to zero.
* const map = new NumberMap();
* map.get(`hello`); // 0
* ```
*
* To check if a key is present, use `has`:
* ```js
* map.has(`hello`); // false
* ```
*
* Math:
* ```js
* // Adds 1 by default to value of `hello`
* map.add(`hello`);         // 1
* map.multiply(`hello`, 2); // 2
*
* // Reset key to default value
* map.reset(`hello`); // 0
* ```
*
* Different default value:
* ```js
* const map = new NumberMap(10);
* map.get(`hello`); // 10
* ```
*
* Regular `set` works as well:
* ```js
* map.set(`hello`, 5);
* map.add(`hello`, 2); // 7
* ```
*/
var NumberMap = class extends Map {
	defaultValue;
	constructor(defaultValue = 0) {
		super();
		this.defaultValue = defaultValue;
	}
	get(key) {
		const v = super.get(key);
		if (v === void 0) return this.defaultValue;
		return v;
	}
	reset(key) {
		super.set(key, this.defaultValue);
		return this.defaultValue;
	}
	multiply(key, amount) {
		const v = super.get(key);
		let value$1 = v ?? this.defaultValue;
		value$1 *= amount;
		super.set(key, value$1);
		return value$1;
	}
	add(key, amount = 1) {
		const v = super.get(key);
		let value$1 = v ?? this.defaultValue;
		value$1 += amount;
		super.set(key, value$1);
		return value$1;
	}
	subtract(key, amount = 1) {
		const v = super.get(key);
		let value$1 = v ?? this.defaultValue;
		value$1 -= amount;
		super.set(key, value$1);
		return value$1;
	}
};

//#endregion
//#region ../collections/dist/src/map/map-of-array-mutable.js
/**
* Returns a {@link IMapOfMutableExtended} to allow storing multiple values under a key, unlike a regular Map.
* @example
* ```js
* const map = ofArrayMutable();
* map.addKeyedValues(`hello`, [1,2,3,4]); // Adds series of numbers under key `hello`
*
* const hello = map.get(`hello`); // Get back values
* ```
*
* Takes options:
* * `comparer`: {@link IsEqual}
* * `toString`: Util.ToString
*
* A custom Util.ToString function can be provided as the `convertToString` opion. This is then used when checking value equality (`has`, `without`)
* ```js
* const map = ofArrayMutable({ convertToString:(v) => v.name}); // Compare values based on their `name` field;
* ```
*
* Alternatively, a {@link IsEqual} function can be used:
* ```js
* const map = ofArrayMutable({comparer: (a, b) => a.name === b.name });
* ```
* @param options Optiosn for mutable array
* @typeParam V - Data type of items
* @returns {@link IMapOfMutableExtended}
*/
const ofArrayMutable = (options = {}) => {
	const convertToString = options.convertToString;
	const toStringFunction = typeof convertToString === `undefined` ? isEqualDefault : (a, b) => convertToString(a) === convertToString(b);
	const comparer = options.comparer ?? toStringFunction;
	const t = {
		get name() {
			return `array`;
		},
		addKeyedValues: (destination, values) => {
			if (destination === void 0) return [...values];
			return [...destination, ...values];
		},
		iterable: (source) => source.values(),
		count: (source) => source.length,
		find: (source, predicate) => source.find((f) => predicate(f)),
		filter: (source, predicate) => source.filter((f) => predicate(f)),
		toArray: (source) => source,
		has: (source, value$1) => source.some((v) => comparer(v, value$1)),
		without: (source, value$1) => source.filter((v) => !comparer(v, value$1))
	};
	const m = new MapOfMutableImpl(t, options);
	return m;
};

//#endregion
//#region ../collections/dist/src/map/map-of-simple.js
/**
* Simple immutable MapOf
*/
var MapOfSimple = class MapOfSimple extends MapOfSimpleBase {
	addKeyedValues(key, ...values) {
		return this.addBatch([[key, values]]);
	}
	addValue(...values) {
		const asEntries = values.map((v) => [this.groupBy(v), v]);
		return this.addBatch(asEntries);
	}
	addBatch(entries$1) {
		const temporary = new Map([...this.map.entries()].map((e) => [e[0], [...e[1]]]));
		for (const [key, list] of entries$1) {
			const existingList = temporary.get(key);
			if (typeof existingList === `undefined`) temporary.set(key, list);
			else existingList.push(...list);
		}
		return new MapOfSimple(this.groupBy, this.valueEq, [...temporary.entries()]);
	}
	clear() {
		return new MapOfSimple(this.groupBy, this.valueEq);
	}
	deleteKeyValue(_key, _value) {
		throw new Error(`Method not implemented.`);
	}
	deleteByValue(value$1, eq) {
		const entries$1 = [...this.map.entries()];
		const eqFunction = eq ?? this.valueEq;
		const x = entries$1.map((entry) => {
			const key = entry[0];
			const values = entry[1].filter((vv) => !eqFunction(vv, value$1));
			return [key, values];
		});
		return new MapOfSimple(this.groupBy, this.valueEq, x);
	}
	delete(key) {
		const entries$1 = [...this.map.entries()].filter((e) => e[0] !== key);
		return new MapOfSimple(this.groupBy, this.valueEq, entries$1);
	}
};
/**
* A simple immutable map of arrays, without events. It can store multiple values
* under the same key.
*
* For a fancier approaches, consider {@link ofArrayMutable}, {@link ofCircularMutable} or {@link ofSetMutable}.
*
* @example
* ```js
* let m = mapSimple();
* m = m.add(`hello`, 1, 2, 3); // Adds numbers under key `hello`
* m = m.delete(`hello`);       // Deletes everything under `hello`
*
* const hellos = m.get(`hello`); // Get list of items under `hello`
* ```
*
* @typeParam V - Type of items
* @returns New instance
*/
const ofSimple = (groupBy = defaultKeyer, valueEq = isEqualDefault) => new MapOfSimple(groupBy, valueEq);

//#endregion
//#region ../collections/dist/src/map/index.js
var map_exports = {};
__export(map_exports, {
	ExpiringMap: () => ExpiringMap,
	MapOfMutableImpl: () => MapOfMutableImpl,
	MapOfSimple: () => MapOfSimple,
	MapOfSimpleMutable: () => MapOfSimpleMutable,
	NumberMap: () => NumberMap,
	addObjectEntriesMutate: () => addObjectEntriesMutate,
	addValue: () => addValue,
	addValueMutate: () => addValueMutate,
	addValueMutator: () => addValueMutator,
	deleteByValueCompareMutate: () => deleteByValueCompareMutate,
	expiringMap: () => create$1,
	filterValues: () => filterValues,
	findBySomeKey: () => findBySomeKey,
	findEntryByPredicate: () => findEntryByPredicate,
	findEntryByValue: () => findEntryByValue,
	findValue: () => findValue,
	firstEntry: () => firstEntry,
	firstEntryByValue: () => firstEntryByValue,
	fromIterable: () => fromIterable,
	fromObject: () => fromObject,
	getClosestIntegerKey: () => getClosestIntegerKey,
	getOrGenerate: () => getOrGenerate,
	getOrGenerateSync: () => getOrGenerateSync,
	hasAnyValue: () => hasAnyValue,
	hasKeyValue: () => hasKeyValue,
	immutable: () => immutable,
	lengthMax: () => lengthMax,
	mapOfSimpleMutable: () => ofSimpleMutable,
	mapToArray: () => mapToArray,
	mapToObjectTransform: () => mapToObjectTransform,
	mergeByKey: () => mergeByKey,
	mutable: () => mutable,
	ofArrayMutable: () => ofArrayMutable,
	ofCircularMutable: () => ofCircularMutable,
	ofSetMutable: () => ofSetMutable,
	ofSimple: () => ofSimple,
	ofSimpleMutable: () => ofSimpleMutable,
	some: () => some,
	sortByValue: () => sortByValue,
	sortByValueProperty: () => sortByValueProperty,
	toArray: () => toArray,
	toObject: () => toObject,
	transformMap: () => transformMap,
	zipKeyValue: () => zipKeyValue
});

//#endregion
//#region ../collections/dist/src/table.js
/**
* Stores values in a table of rows (vertical) and columns (horizontal)
*/
var Table = class {
	rows = [];
	rowLabels = [];
	colLabels = [];
	/**
	* Keep track of widest row
	*/
	columnMaxLength = 0;
	/**
	* Gets the label for a given column index,
	* returning _undefined_ if not found.
	*
	* Case-sensitive
	* @param label Label to seek
	* @returns Index of column, or _undefined_ if not found
	*/
	getColumnLabelIndex(label) {
		for (const [index, l] of this.colLabels.entries()) if (l === label) return index;
	}
	/**
	* Gets the label for a given row index,
	* returning _undefined_ if not found.
	*
	* Case-sensitive
	* @param label Label to seek
	* @returns Index of row, or _undefined_ if not found
	*/
	getRowLabelIndex(label) {
		for (const [index, l] of this.rowLabels.entries()) if (l === label) return index;
	}
	/**
	* Dumps the values of the table to the console
	*/
	print() {
		console.table([...this.rowsWithLabelsObject()]);
	}
	/**
	* Return a copy of table as nested array
	*
	* ```js
	* const t = new Table();
	* // add stuff
	* // ...
	* const m = t.asArray();
	* for (const row of m) {
	*  for (const colValue of row) {
	*    // iterate over all column values for this row
	*  }
	* }
	* ```
	*
	* Alternative: get value at row Y and column X
	* ```js
	* const value = m[y][x];
	* ```
	* @returns
	*/
	asArray() {
		const r = [];
		for (const row of this.rows) if (row === void 0) r.push([]);
		else r.push([...row]);
		return r;
	}
	/**
	* Return the number of rows
	*/
	get rowCount() {
		return this.rows.length;
	}
	/**
	* Return the maximum number of columns in any row
	*/
	get columnCount() {
		return this.columnMaxLength;
	}
	/**
	* Iterates over the table row-wise, in object format.
	* @see {@link rowsWithLabelsArray} to get rows in array format
	*/
	*rowsWithLabelsObject() {
		for (let index = 0; index < this.rows.length; index++) {
			const labelledRow = this.getRowWithLabelsObject(index);
			yield labelledRow;
		}
	}
	/**
	* Iterates over each row, including the labels if available
	* @see {@link rowsWithLabelsObject} to get rows in object format
	*/
	*rowsWithLabelsArray() {
		for (let index = 0; index < this.rows.length; index++) {
			const labelledRow = this.getRowWithLabelsArray(index);
			yield labelledRow;
		}
	}
	/**
	* Assign labels to columns
	* @param labels
	*/
	labelColumns(...labels) {
		this.colLabels = labels;
	}
	/**
	* Assign label to a specific column
	* First column has an index of 0
	* @param columnIndex
	* @param label
	*/
	labelColumn(columnIndex, label) {
		this.colLabels[columnIndex] = label;
	}
	/**
	* Label rows
	* @param labels Labels
	*/
	labelRows(...labels) {
		this.rowLabels = labels;
	}
	/**
	* Assign label to a specific row
	* First row has an index of 0
	* @param rowIndex
	* @param label
	*/
	labelRow(rowIndex, label) {
		this.rowLabels[rowIndex] = label;
	}
	/**
	* Adds a new row
	* @param data Columns
	*/
	appendRow(...data) {
		this.columnMaxLength = Math.max(this.columnMaxLength, data.length);
		this.rows.push(data);
		return data;
	}
	/**
	* Gets a row along with labels, as an array
	* @param rowIndex
	* @returns
	*/
	getRowWithLabelsArray(rowIndex) {
		const row = this.rows.at(rowIndex);
		if (row === void 0) return void 0;
		return row.map((value$1, index) => [this.colLabels.at(index), value$1]);
	}
	/**
	* Return a row of objects. Keys use the column labels.
	*
	* ```js
	* const row = table.getRowWithLabelsObject(10);
	* // eg:
	* // [{ colour: red, size: 10}, { colour: blue, size: 20 }]
	* ```
	* @param rowIndex
	* @returns
	*/
	getRowWithLabelsObject(rowIndex) {
		const row = this.rows.at(rowIndex);
		if (row === void 0) return void 0;
		const object = {};
		for (let index = 0; index < this.colLabels.length; index++) {
			const label = this.colLabels.at(index) ?? index.toString();
			object[label] = row[index];
		}
		return object;
	}
	/**
	* Gets or creates a row at given position
	* @param row Index or label of row
	* @returns
	*/
	#getOrCreateRawRow(row) {
		const index = typeof row === `number` ? row : this.getRowLabelIndex(row);
		if (index === void 0) return {
			success: false,
			error: `row-label-notfound`
		};
		if (index < 0) return {
			success: false,
			error: `row-index-invalid`
		};
		if (index < this.rows.length) return {
			success: true,
			value: this.rows[index]
		};
		const newRow = [];
		this.rows[index] = newRow;
		return {
			success: true,
			value: newRow
		};
	}
	/**
	* Gets a copy of values at given row, specified by index or label
	* @param row
	* @returns Returns row or throws an error if label or index not found
	*/
	row(row) {
		const r = this.#getRowRaw(row);
		if (resultIsError(r)) throw new Error(r.error);
		return [...r.value];
	}
	/**
	* Set the value of row,columm.
	* Row is created if it doesn't exist, with the other column values being _undefined_
	* @param row Index or label
	* @param column Column
	* @param value Value to set at row,column
	*/
	set(row, column, value$1) {
		const result = this.#getOrCreateRawRow(row);
		if (resultIsError(result)) throw new Error(result.error);
		const r = result.value;
		const columnIndex = typeof column === `number` ? column : this.getColumnLabelIndex(column);
		if (typeof columnIndex === `undefined`) throw new Error(`Column label '${column}' not found or is invalid`);
		if (columnIndex < 0) throw new Error(`Column index invalid (less than zero)`);
		r[columnIndex] = value$1;
	}
	/**
	* Gets the value at a specified row and column.
	* Throws an error if coordinates are out of range or missing.
	* @param row Row index or label
	* @param column Column index or label
	* @returns
	*/
	get(row, column) {
		const rowR = this.#getRowRaw(row);
		if (resultIsError(rowR)) throw new Error(rowR.error);
		const colR = this.#getColumnRaw(rowR.value, column);
		if (resultIsError(colR)) throw new Error(colR.error);
		return colR.value.value;
	}
	#getRowRaw(row) {
		let index = 0;
		if (typeof row === `number`) index = row;
		else {
			index = this.getRowLabelIndex(row);
			if (typeof index !== `number`) return {
				error: `row-label-notfound`,
				success: false
			};
		}
		if (typeof index !== `number`) return {
			error: `row-invalid`,
			success: false
		};
		if (index < 0 || index >= this.rows.length) return {
			error: `row-index-out-of-range`,
			success: false
		};
		return {
			success: true,
			value: this.rows[index]
		};
	}
	#getColumnRaw(row, column) {
		const colIndex = typeof column === `number` ? column : this.getColumnLabelIndex(column);
		if (typeof colIndex !== `number`) return {
			success: false,
			error: `col-label-notfound`
		};
		if (colIndex < 0 || colIndex >= row.length) return {
			success: false,
			error: `col-index-out-of-range`
		};
		return {
			success: true,
			value: {
				index: colIndex,
				value: row[colIndex]
			}
		};
	}
	/**
	* Set all the columns of a row to a specified value.
	*
	* By default, sets the number of columns corresponding to
	* the table's maximum column length. To set an arbitrary
	* length of the row, use `length`
	* @param row Index or label of row
	* @param length How wide the row is. If unset, uses the current maximum width of rows.
	* @param value Value to set
	*/
	setRow(row, value$1, length) {
		const rowResult = this.#getOrCreateRawRow(row);
		if (resultIsError(rowResult)) throw new Error(rowResult.error);
		const r = rowResult.value;
		const width = typeof length === `number` ? length : this.columnMaxLength;
		for (let columnNumber = 0; columnNumber < width; columnNumber++) r[columnNumber] = value$1;
		return r;
	}
};

//#endregion
//#region ../collections/dist/src/graph/directed-graph.js
var directed_graph_exports = {};
__export(directed_graph_exports, {
	adjacentVertices: () => adjacentVertices$1,
	areAdjacent: () => areAdjacent,
	bfs: () => bfs,
	clone: () => clone,
	connect: () => connect$1,
	connectTo: () => connectTo$1,
	connectWithEdges: () => connectWithEdges$1,
	createVertex: () => createVertex$1,
	dfs: () => dfs,
	disconnect: () => disconnect,
	distance: () => distance,
	distanceDefault: () => distanceDefault,
	dumpGraph: () => dumpGraph$1,
	edges: () => edges,
	get: () => get,
	getCycles: () => getCycles,
	getOrCreate: () => getOrCreate$1,
	getOrFail: () => getOrFail,
	graph: () => graph$1,
	graphFromVertices: () => graphFromVertices,
	hasKey: () => hasKey,
	hasNoOuts: () => hasNoOuts,
	hasOnlyOuts: () => hasOnlyOuts,
	hasOut: () => hasOut,
	isAcyclic: () => isAcyclic,
	pathDijkstra: () => pathDijkstra,
	toAdjacencyMatrix: () => toAdjacencyMatrix$1,
	topologicalSort: () => topologicalSort,
	transitiveReduction: () => transitiveReduction,
	updateGraphVertex: () => updateGraphVertex$1,
	vertexHasOut: () => vertexHasOut,
	vertices: () => vertices
});
/**
* Create a vertex with given id
* @param id
* @returns
*/
const createVertex$1 = (id) => {
	return {
		id,
		out: []
	};
};
/**
* Returns _true_ if graph contains `key`.
*
* ```js
* // Same as
* g.vertices.has(key)
* ```
* @param graph
* @param key
* @returns
*/
function hasKey(graph$2, key) {
	resultThrow(graphTest(graph$2));
	return graph$2.vertices.has(key);
}
/**
* Returns {@link Vertex} under `key`, or _undefined_
* if not found.
*
* ```js
* // Same as
* g.vertices.get(key)
* ```
* @param graph
* @param key
* @returns
*/
function get(graph$2, key) {
	resultThrow(graphTest(graph$2));
	resultThrow(stringTest(key, `non-empty`, `key`));
	return graph$2.vertices.get(key);
}
/**
* Returns the graph connections as an adjacency matrix
* @param graph
* @returns
*/
function toAdjacencyMatrix$1(graph$2) {
	resultThrow(graphTest(graph$2));
	const v = [...graph$2.vertices.values()];
	const table = new Table();
	table.labelColumns(...v.map((vv) => vv.id));
	table.labelRows(...v.map((vv) => vv.id));
	for (let i = 0; i < v.length; i++) {
		table.setRow(i, false, v.length);
		const ii = v[i];
		for (const [j, jj] of v.entries()) if (ii.out.some((o) => o.id === jj.id)) table.set(i, j, true);
	}
	return table;
}
/**
* Return a string representation of the graph for debug inspection
* @param graph
* @returns
*/
const dumpGraph$1 = (graph$2) => {
	const lines = debugGraphToArray$1(graph$2);
	return lines.join(`\n`);
};
/**
* Return an array of a debug-print of every vertex.
* @param graph
* @returns
*/
const debugGraphToArray$1 = (graph$2) => {
	const r = [];
	const vertices$1 = `vertices` in graph$2 ? graph$2.vertices.values() : graph$2;
	for (const v of vertices$1) {
		const str = debugDumpVertex(v);
		r.push(...str.map((line) => ` ${line}`));
	}
	return r;
};
/**
* Returns the weight of an edge, or 1 if undefined.
* @param graph
* @param edge
* @returns
*/
const distance = (graph$2, edge) => {
	if (edge.weight !== void 0) return edge.weight;
	return 1;
};
/**
* Iterate over all the edges in the graph
* @param graph
*/
function* edges(graph$2) {
	resultThrow(graphTest(graph$2));
	const vertices$1 = [...graph$2.vertices.values()];
	for (const vertex of vertices$1) for (const edge of vertex.out) yield edge;
}
/**
* Iterate over all the vertices of the graph
* @param graph
*/
function* vertices(graph$2) {
	resultThrow(graphTest(graph$2));
	const vertices$1 = [...graph$2.vertices.values()];
	for (const vertex of vertices$1) yield vertex;
}
function graphTest(g, parameterName = `graph`) {
	if (g === void 0) return {
		success: false,
		error: `Param '${parameterName}' is undefined. Expected Graph`
	};
	if (g === null) return {
		success: false,
		error: `Param '${parameterName}' is null. Expected Graph`
	};
	if (typeof g === `object`) {
		if (!(`vertices` in g)) return {
			success: false,
			error: `Param '${parameterName}.vertices' does not exist. Is it a Graph type?`
		};
	} else return {
		success: false,
		error: `Param '${parameterName} is type '${typeof g}'. Expected an object Graph`
	};
	return {
		success: true,
		value: g
	};
}
/**
* Iterate over all the vertices connected to `context` vertex
* @param graph Graph
* @param context id or Vertex.
* @returns
*/
function* adjacentVertices$1(graph$2, context) {
	resultThrow(graphTest(graph$2));
	if (context === void 0) return;
	const vertex = typeof context === `string` ? graph$2.vertices.get(context) : context;
	if (vertex === void 0) throw new Error(`Vertex not found ${JSON.stringify(context)}`);
	for (const edge of vertex.out) {
		const edgeV = graph$2.vertices.get(edge.id);
		if (edgeV === void 0) throw new Error(`Could not find vertex: ${edge.id}`);
		yield edgeV;
	}
}
/**
* Returns _true_ if `vertex` has an outgoing connection to
* the supplied id or vertex.
*
* If `vertex` is undefined, _false_ is returned.
* @param vertex From vertex
* @param outIdOrVertex To vertex
* @returns
*/
const vertexHasOut = (vertex, outIdOrVertex) => {
	if (vertex === void 0) return false;
	const outId = typeof outIdOrVertex === `string` ? outIdOrVertex : outIdOrVertex.id;
	return vertex.out.some((edge) => edge.id === outId);
};
/**
* Returns _true_ if `vertex` has no outgoing connections
* @param graph
* @param vertex
* @returns
*/
const hasNoOuts = (graph$2, vertex) => {
	resultThrow(graphTest(graph$2));
	const context = typeof vertex === `string` ? graph$2.vertices.get(vertex) : vertex;
	if (context === void 0) return false;
	return context.out.length === 0;
};
/**
* Returns _true_ if `vertex` only has the given list of vertices.
* Returns _false_ early if the length of the list does not match up with `vertex.out`
* @param graph
* @param vertex
* @param outIdOrVertex
* @returns
*/
const hasOnlyOuts = (graph$2, vertex, ...outIdOrVertex) => {
	resultThrow(graphTest(graph$2));
	const context = resolveVertex$1(graph$2, vertex);
	const outs = outIdOrVertex.map((o) => resolveVertex$1(graph$2, o));
	if (outs.length !== context.out.length) return false;
	for (const out of outs) if (!hasOut(graph$2, context, out)) return false;
	return true;
};
/**
* Returns _true_ if `vertex` has an outgoing connection to the given vertex.
* @param graph
* @param vertex
* @param outIdOrVertex
* @returns
*/
const hasOut = (graph$2, vertex, outIdOrVertex) => {
	resultThrow(graphTest(graph$2));
	const context = resolveVertex$1(graph$2, vertex);
	const outId = typeof outIdOrVertex === `string` ? outIdOrVertex : outIdOrVertex.id;
	return context.out.some((edge) => edge.id === outId);
};
/**
* Gets a vertex by id, creating it if it does not exist.
* @param graph
* @param id
* @returns
*/
const getOrCreate$1 = (graph$2, id) => {
	resultThrow(graphTest(graph$2));
	const v = graph$2.vertices.get(id);
	if (v !== void 0) return {
		graph: graph$2,
		vertex: v
	};
	const vv = createVertex$1(id);
	const gg = updateGraphVertex$1(graph$2, vv);
	return {
		graph: gg,
		vertex: vv
	};
};
/**
* Gets a vertex by id, throwing an error if it does not exist
* @param graph
* @param id
* @returns
*/
const getOrFail = (graph$2, id) => {
	resultThrow(graphTest(graph$2));
	const v = graph$2.vertices.get(id);
	if (v === void 0) throw new Error(`Vertex '${id}' not found in graph`);
	return v;
};
/**
* Updates a vertex by returning a mutated graph
* @param graph Graph
* @param vertex Newly changed vertex
* @returns
*/
const updateGraphVertex$1 = (graph$2, vertex) => {
	resultThrow(graphTest(graph$2));
	const gr = {
		...graph$2,
		vertices: graph$2.vertices.set(vertex.id, vertex)
	};
	return gr;
};
/**
* Default distance computer. Uses `weight` property of edge, or `1` if not found.
* @param graph
* @param edge
* @returns
*/
const distanceDefault = (graph$2, edge) => {
	if (edge.weight !== void 0) return edge.weight;
	return 1;
};
/**
* Returns a mutation of `graph`, with a given edge removed.
*
* If edge was not there, original graph is returned.
* @param graph
* @param from
* @param to
* @returns
*/
function disconnect(graph$2, from, to$1) {
	resultThrow(graphTest(graph$2));
	const fromV = resolveVertex$1(graph$2, from);
	const toV = resolveVertex$1(graph$2, to$1);
	return hasOut(graph$2, fromV, toV) ? updateGraphVertex$1(graph$2, {
		...fromV,
		out: fromV.out.filter((t) => t.id !== toV.id)
	}) : graph$2;
}
/**
* Make a connection between two vertices with a given weight.
* It returns the new graph as wll as the created edge.
* @param graph
* @param from
* @param to
* @param weight
* @returns
*/
function connectTo$1(graph$2, from, to$1, weight) {
	resultThrow(graphTest(graph$2));
	const fromResult = getOrCreate$1(graph$2, from);
	graph$2 = fromResult.graph;
	const toResult = getOrCreate$1(graph$2, to$1);
	graph$2 = toResult.graph;
	const edge = {
		id: to$1,
		weight
	};
	if (!hasOut(graph$2, fromResult.vertex, toResult.vertex)) graph$2 = updateGraphVertex$1(graph$2, {
		...fromResult.vertex,
		out: [...fromResult.vertex.out, edge]
	});
	return {
		graph: graph$2,
		edge
	};
}
/**
* Connect from -> to. Same as {@link connectWithEdges}, but this version just returns the graph.
*
* By default unidirectional, meaning a connection is made only from->to. Use `bidi` option to set a bidirection connection, adding also to->from.
*
* Returns a result of `{ graph, edges }`, where `graph` is the new {@link DirectedGraph} and `edges`
* is an array of {@link Edge Edges}. One for unidirectional, or two for bidirectional.
* @param graph
* @param options
* @returns
*/
function connect$1(graph$2, options) {
	if (typeof graph$2 !== `object`) throw new TypeError(`Param 'graph' is expected to be a DirectedGraph object. Got: ${typeof graph$2}`);
	if (typeof options !== `object`) throw new TypeError(`Param 'options' is expected to be ConnectOptions object. Got: ${typeof options}`);
	const result = connectWithEdges$1(graph$2, options);
	return result.graph;
}
/**
* Connect from -> to. Same as {@link connect} except you get back the edges as well.
*
* By default unidirectional, meaning a connection is made only from->to. Use `bidi` option to set a bidirection connection, adding also to->from.
*
* Returns a result of `{ graph, edges }`, where `graph` is the new {@link DirectedGraph} and `edges`
* is an array of {@link Edge Edges}. One for unidirectional, or two for bidirectional.
* @param graph
* @param options
* @returns
*/
function connectWithEdges$1(graph$2, options) {
	resultThrow(graphTest(graph$2));
	const { to: to$1, weight, from } = options;
	const bidi = options.bidi ?? false;
	const toList = Array.isArray(to$1) ? to$1 : [to$1];
	const edges$1 = [];
	for (const toSingle of toList) {
		const result = connectTo$1(graph$2, from, toSingle, weight);
		graph$2 = result.graph;
		edges$1.push(result.edge);
	}
	if (!bidi) return {
		graph: graph$2,
		edges: edges$1
	};
	for (const toSingle of toList) {
		const result = connectTo$1(graph$2, toSingle, from, weight);
		graph$2 = result.graph;
		edges$1.push(result.edge);
	}
	return {
		graph: graph$2,
		edges: edges$1
	};
}
/**
* Returns an array of debug-representations for the given vertex.
* @param v
* @returns
*/
const debugDumpVertex = (v) => {
	const r = [v.id];
	const stringForEdge$1 = (edge) => edge.weight === void 0 ? edge.id : `${edge.id} (${edge.weight})`;
	for (const edge of v.out) r.push(` -> ${stringForEdge$1(edge)}`);
	if (v.out.length === 0) r[0] += ` (terminal)`;
	return r;
};
/**
* Returns _true_ if a->b or b->a
* @param graph
* @param a
* @param b
* @returns
*/
function areAdjacent(graph$2, a, b) {
	resultThrow(graphTest(graph$2));
	if (hasOut(graph$2, a, b.id)) return true;
	if (hasOut(graph$2, b, a.id)) return true;
}
/**
* Resolves the id or vertex into a Vertex.
* throws an error if vertex is not found
* @param graph
* @param idOrVertex
* @returns
*/
function resolveVertex$1(graph$2, idOrVertex) {
	resultThrow(graphTest(graph$2));
	if (idOrVertex === void 0) throw new Error(`Param 'idOrVertex' is undefined. Expected string or Vertex`);
	const v = typeof idOrVertex === `string` ? graph$2.vertices.get(idOrVertex) : idOrVertex;
	if (v === void 0) throw new Error(`Id not found ${idOrVertex}`);
	return v;
}
/**
* Iterates over vertices from a starting vertex in an bread-first-search
* @param graph
* @param startIdOrVertex
* @param targetIdOrVertex
* @returns
*/
function* bfs(graph$2, startIdOrVertex, targetIdOrVertex) {
	resultThrow(graphTest(graph$2));
	const start = resolveVertex$1(graph$2, startIdOrVertex);
	const target = targetIdOrVertex === void 0 ? void 0 : resolveVertex$1(graph$2, targetIdOrVertex);
	const queue = new QueueMutable();
	const seen = /* @__PURE__ */ new Set();
	queue.enqueue(start);
	while (!queue.isEmpty) {
		const v = queue.dequeue();
		yield v;
		if (target !== void 0 && target === v) return;
		for (const edge of adjacentVertices$1(graph$2, v)) if (!seen.has(edge.id)) {
			seen.add(edge.id);
			queue.enqueue(resolveVertex$1(graph$2, edge.id));
		}
	}
}
/**
* Iterates over vertices from a starting vertex in an depth-first-search
* @param graph
* @param startIdOrVertex
*/
function* dfs(graph$2, startIdOrVertex) {
	resultThrow(graphTest(graph$2));
	const source = resolveVertex$1(graph$2, startIdOrVertex);
	const s = new StackMutable();
	const seen = /* @__PURE__ */ new Set();
	s.push(source);
	while (!s.isEmpty) {
		const v = s.pop();
		if (v === void 0) continue;
		if (!seen.has(v.id)) {
			seen.add(v.id);
			yield v;
			for (const edge of v.out) {
				const destination = graph$2.vertices.get(edge.id);
				if (destination) s.push(destination);
			}
		}
	}
}
/**
* Compute shortest distance from the source vertex to the rest of the graph.
* @param graph
* @param sourceOrId
* @returns
*/
const pathDijkstra = (graph$2, sourceOrId) => {
	resultThrow(graphTest(graph$2));
	const source = typeof sourceOrId === `string` ? graph$2.vertices.get(sourceOrId) : sourceOrId;
	if (source === void 0) throw new Error(`source vertex not found`);
	const distances = /* @__PURE__ */ new Map();
	const previous = /* @__PURE__ */ new Map();
	distances.set(source.id, 0);
	const pq = new PriorityMutable();
	const vertices$1 = [...graph$2.vertices.values()];
	for (const v of vertices$1) {
		if (v.id !== source.id) {
			distances.set(v.id, Number.MAX_SAFE_INTEGER);
			previous.set(v.id, null);
		}
		pq.enqueueWithPriority(v.id, Number.MAX_SAFE_INTEGER);
	}
	while (!pq.isEmpty) {
		const u = pq.dequeueMin();
		if (u === void 0) throw new Error(`Bug. Queue unexpectedly empty`);
		const vertexU = graph$2.vertices.get(u);
		for (const neighbour of vertexU.out) {
			const alt = distances.get(u) + distance(graph$2, neighbour);
			if (alt < distances.get(neighbour.id)) {
				distances.set(neighbour.id, alt);
				previous.set(neighbour.id, vertexU);
				pq.changePriority(neighbour.id, alt, true);
			}
		}
	}
	const pathTo = (id) => {
		const path = [];
		while (true) {
			if (id === source.id) break;
			const v = previous.get(id);
			if (v === void 0 || v === null) throw new Error(`Id not present: ${id}`);
			path.push({
				id,
				weight: distances.get(id)
			});
			id = v.id;
		}
		return path;
	};
	return {
		distances,
		previous,
		pathTo
	};
};
/**
* Clones the graph. Uses shallow clone, because it's all immutable
* @param graph
* @returns
*/
const clone = (graph$2) => {
	resultThrow(graphTest(graph$2));
	const g = { vertices: immutable([...graph$2.vertices.entries()]) };
	return g;
};
/**
* Create a graph
* ```js
* let g = graph();
* ```
*
* Can optionally provide initial connections:
* ```js
* let g = graph(
*  { from: `a`, to: `b` },
*  { from: `b`, to: `c` }
* )
* ```
* @param initialConnections
* @returns
*/
const graph$1 = (...initialConnections) => {
	let g = { vertices: immutable() };
	for (const ic of initialConnections) g = connect$1(g, ic);
	return g;
};
/**
* Returns _true_ if the graph contains is acyclic - that is, it has no loops
* @param graph
*/
function isAcyclic(graph$2) {
	resultThrow(graphTest(graph$2));
	const cycles = getCycles(graph$2);
	return cycles.length === 0;
}
/**
* Topological sort using Kahn's algorithm.
* Returns a new graph that is sorted
* @param graph
*/
function topologicalSort(graph$2) {
	resultThrow(graphTest(graph$2));
	const indegrees = new NumberMap(0);
	for (const edge of edges(graph$2)) indegrees.add(edge.id, 1);
	const queue = new QueueMutable();
	let vertexCount = 0;
	for (const vertex of vertices(graph$2)) {
		if (indegrees.get(vertex.id) === 0) queue.enqueue(vertex);
		vertexCount++;
	}
	const topOrder = [];
	while (!queue.isEmpty) {
		const u = queue.dequeue();
		topOrder.push(u);
		for (const neighbour of u.out) {
			const result = indegrees.subtract(neighbour.id, 1);
			if (result === 0) queue.enqueue(graph$2.vertices.get(neighbour.id));
		}
	}
	if (topOrder.length !== vertexCount) throw new Error(`Graph contains cycles`);
	return graphFromVertices(topOrder);
}
/**
* Create a graph from an iterable of vertices
* @param vertices
* @returns
*/
function graphFromVertices(vertices$1) {
	const keyValues = map(vertices$1, (f) => {
		return [f.id, f];
	});
	const m = immutable([...keyValues]);
	return { vertices: m };
}
/**
* Get all the cycles ('strongly-connected-components') within the graph
* [Read more](https://en.wikipedia.org/wiki/Strongly_connected_component)
* @param graph
* @returns
*/
function getCycles(graph$2) {
	resultThrow(graphTest(graph$2));
	let index = 0;
	const stack = new StackMutable();
	const vertices$1 = /* @__PURE__ */ new Map();
	const scc = [];
	for (const v of graph$2.vertices.values()) vertices$1.set(v.id, {
		...v,
		lowlink: NaN,
		index: NaN,
		onStack: false
	});
	const strongConnect = (vertex) => {
		vertex.index = index;
		vertex.lowlink = index;
		index++;
		stack.push(vertex);
		vertex.onStack = true;
		for (const edge of vertex.out) {
			const edgeV = vertices$1.get(edge.id);
			if (Number.isNaN(edgeV.index)) {
				strongConnect(edgeV);
				vertex.lowlink = Math.min(vertex.lowlink, edgeV.lowlink);
			} else if (edgeV.onStack) vertex.lowlink = Math.min(vertex.lowlink, edgeV.lowlink);
		}
		if (vertex.lowlink === vertex.index) {
			const stronglyConnected = [];
			let w;
			while (vertex !== w) {
				w = stack.pop();
				w.onStack = false;
				stronglyConnected.push({
					id: w.id,
					out: w.out
				});
			}
			if (stronglyConnected.length > 1) scc.push(stronglyConnected);
		}
	};
	for (const v of vertices$1.values()) if (Number.isNaN(v.index)) strongConnect(v);
	return scc;
}
/**
* Returns a new graph which is transitively reduced.
* That is, redundant edges are removed
* @param graph
* @returns
*/
function transitiveReduction(graph$2) {
	resultThrow(graphTest(graph$2));
	for (const u of vertices(graph$2)) for (const v of adjacentVertices$1(graph$2, u)) for (const v1 of dfs(graph$2, v)) {
		if (v.id === v1.id) continue;
		if (hasOut(graph$2, u, v1)) {
			const g = disconnect(graph$2, u, v1);
			return transitiveReduction(g);
		}
	}
	return graph$2;
}

//#endregion
//#region ../collections/dist/src/graph/undirected-graph.js
var undirected_graph_exports = {};
__export(undirected_graph_exports, {
	adjacentVertices: () => adjacentVertices,
	connect: () => connect,
	connectTo: () => connectTo,
	connectWithEdges: () => connectWithEdges,
	createVertex: () => createVertex,
	dumpGraph: () => dumpGraph,
	edgesForVertex: () => edgesForVertex,
	getConnection: () => getConnection,
	getOrCreate: () => getOrCreate,
	graph: () => graph,
	hasConnection: () => hasConnection,
	toAdjacencyMatrix: () => toAdjacencyMatrix,
	updateGraphVertex: () => updateGraphVertex
});
const createVertex = (id) => {
	return { id };
};
const updateGraphVertex = (graph$2, vertex) => {
	const gr = {
		...graph$2,
		vertices: graph$2.vertices.set(vertex.id, vertex)
	};
	return gr;
};
const getOrCreate = (graph$2, id) => {
	const v = graph$2.vertices.get(id);
	if (v !== void 0) return {
		graph: graph$2,
		vertex: v
	};
	const vv = createVertex(id);
	const gg = updateGraphVertex(graph$2, vv);
	return {
		graph: gg,
		vertex: vv
	};
};
function resolveVertex(graph$2, idOrVertex) {
	if (idOrVertex === void 0) throw new Error(`Param 'idOrVertex' is undefined. Expected string or Vertex`);
	if (graph$2 === void 0) throw new Error(`Param 'graph' is undefined. Expected Graph`);
	const v = typeof idOrVertex === `string` ? graph$2.vertices.get(idOrVertex) : idOrVertex;
	if (v === void 0) throw new Error(`Id not found ${idOrVertex}`);
	return v;
}
/**
* Returns _true/false_ if there is a connection between `a` and `b` in `graph`.
* Use {@link getConnection} if you want to the edge.
* @param graph Graph to search
* @param a
* @param b
* @returns _true_ if edge exists
*/
const hasConnection = (graph$2, a, b) => {
	const edge = getConnection(graph$2, a, b);
	return edge !== void 0;
};
/**
* Gets the connection, if it exists between `a` and `b` in `graph`.
* If it doesn't exist, _undefined_ is returned.
* Use {@link hasConnection} for a simple true/false if edge exists.
* @param graph Graph
* @param a
* @param b
* @returns
*/
const getConnection = (graph$2, a, b) => {
	if (a === void 0) throw new Error(`Param 'a' is undefined. Expected string or Vertex`);
	if (b === void 0) throw new Error(`Param 'b' is undefined. Expected string or Vertex`);
	if (graph$2 === void 0) throw new Error(`Param 'graph' is undefined. Expected Graph`);
	const aa = resolveVertex(graph$2, a);
	const bb = resolveVertex(graph$2, b);
	for (const edge of graph$2.edges) {
		if (edge.a == aa.id && edge.b === bb.id) return edge;
		if (edge.a == bb.id && edge.b === aa.id) return edge;
	}
	return;
};
/**
* Connects A with B, returning the changed graph and created edge.
* If the connection already exists, the original graph & edge is returned.
* @param graph
* @param a
* @param b
* @param weight
* @returns
*/
function connectTo(graph$2, a, b, weight) {
	const aResult = getOrCreate(graph$2, a);
	graph$2 = aResult.graph;
	const bResult = getOrCreate(graph$2, b);
	graph$2 = bResult.graph;
	let edge = getConnection(graph$2, a, b);
	if (edge !== void 0) return {
		graph: graph$2,
		edge
	};
	edge = {
		a,
		b,
		weight
	};
	const graphChanged = {
		...graph$2,
		edges: [...graph$2.edges, edge]
	};
	return {
		graph: graphChanged,
		edge
	};
}
/**
* Makes a connection between `options.a` and one or more nodes in `options.b`.
* Same as {@link connectWithEdges} but only the {@link Graph} is returned.
*
* ```js
* let g = graph(); // Create an empty graph
* // Make a connection between `red` and `orange`
* g = connect(g, { a: `red`, b: `orange` });
*
* // Make a connection between `red` and `orange as well as `red` and `yellow`.
* g = connect(g, { a: `red`, b: [`orange`, `yellow`] })
* ```
* @param graph Initial graph
* @param options Options
*/
function connect(graph$2, options) {
	const result = connectWithEdges(graph$2, options);
	return result.graph;
}
/**
* Makes a connection between `options.a` and one or more nodes in `options.b`.
* Same as {@link connect} but graph and edges are returned.
*
* ```js
* let g = graph(); // Create an empty graph
*
* // Make a connection between `red` and `orange`
* result = connectWithEdges(g, { a: `red`, b: `orange` });
*
* // Make a connection between `red` and `orange as well as `red` and `yellow`.
* result = connectWithEdges(g, { a: `red`, b: [`orange`, `yellow`] })
* ```
* @param graph Initial graph
* @param options Options
*/
function connectWithEdges(graph$2, options) {
	const { a, weight, b } = options;
	const destinations = Array.isArray(b) ? b : [b];
	const edges$1 = [];
	for (const destination of destinations) {
		const result = connectTo(graph$2, a, destination, weight);
		graph$2 = result.graph;
		edges$1.push(result.edge);
	}
	return {
		graph: graph$2,
		edges: edges$1
	};
}
const graph = (...initialConnections) => {
	let g = {
		vertices: immutable(),
		edges: []
	};
	for (const ic of initialConnections) g = connect(g, ic);
	return g;
};
function toAdjacencyMatrix(graph$2) {
	const v = [...graph$2.vertices.values()];
	const table = new Table();
	table.labelColumns(...v.map((vv) => vv.id));
	table.labelRows(...v.map((vv) => vv.id));
	for (let i = 0; i < v.length; i++) {
		table.setRow(i, false, v.length);
		const ii = v[i];
		for (const [j, jj] of v.entries()) {
			const connected = hasConnection(graph$2, ii, jj);
			if (connected) table.set(i, j, true);
		}
	}
	return table;
}
/**
* Return a string representation of the graph for debug inspection
* @param graph
* @returns
*/
const dumpGraph = (graph$2) => {
	const lines = debugGraphToArray(graph$2);
	return lines.join(`\n`);
};
/**
* Return an array of a debug-print of every vertex.
* @param graph
* @returns
*/
const debugGraphToArray = (graph$2) => {
	const r = [];
	r.push(`Vertices: ${[...graph$2.vertices.values()].map((v) => v.id).join(`, `)}`);
	r.push(`Edges:`);
	for (const edge of graph$2.edges) r.push(stringForEdge(edge));
	return r;
};
const stringForEdge = (edge) => {
	const weight = edge.weight ? ` (${edge.weight})` : ``;
	return `${edge.a} <-> ${edge.b}${weight}`;
};
/**
* Iterate over all the vertices connectd to `context` vertex
* @param graph Graph
* @param context id or Vertex
* @returns
*/
function* adjacentVertices(graph$2, context) {
	if (context === void 0) return;
	const vertex = typeof context === `string` ? graph$2.vertices.get(context) : context;
	if (vertex === void 0) throw new Error(`Vertex not found ${JSON.stringify(context)}`);
	for (const edge of graph$2.edges) if (edge.a === context) yield resolveVertex(graph$2, edge.b);
	else if (edge.b === context) yield resolveVertex(graph$2, edge.a);
}
function* edgesForVertex(graph$2, context) {
	if (context === void 0) return;
	const vertex = typeof context === `string` ? graph$2.vertices.get(context) : context;
	if (vertex === void 0) throw new Error(`Vertex not found ${JSON.stringify(context)}`);
	for (const edge of graph$2.edges) if (edge.a === context) yield edge;
	else if (edge.b === context) yield edge;
}

//#endregion
//#region ../collections/dist/src/graph/index.js
var graph_exports = {};
__export(graph_exports, {
	Directed: () => directed_graph_exports,
	Undirected: () => undirected_graph_exports
});

//#endregion
//#region ../collections/dist/src/index.js
var src_exports$2 = {};
__export(src_exports$2, {
	CircularArray: () => CircularArray,
	ExpiringMap: () => ExpiringMap,
	Graphs: () => graph_exports,
	MapOfSimpleMutable: () => MapOfSimpleMutable,
	Maps: () => map_exports,
	QueueImmutable: () => QueueImmutable,
	QueueMutable: () => QueueMutable,
	Queues: () => queue_exports,
	SetStringImmutable: () => SetStringImmutable,
	SetStringMutable: () => SetStringMutable,
	Sets: () => set_exports,
	StackImmutable: () => StackImmutable,
	StackMutable: () => StackMutable,
	Stacks: () => stack_exports,
	Table: () => Table,
	Trees: () => tree_exports
});

//#endregion
//#region ../flow/dist/src/behaviour-tree.js
const getName = (t, defaultValue = ``) => {
	if (typeof t === `object` && `name` in t && t.name !== void 0) return t.name;
	return defaultValue;
};
function* iterateBreadth(t, pathPrefix) {
	if (typeof pathPrefix === `undefined`) pathPrefix = getName(t);
	for (const [index, n] of entries(t)) yield [n, pathPrefix];
	for (const [index, n] of entries(t)) {
		const name = getName(n, `?`);
		const prefix = pathPrefix.length > 0 ? pathPrefix + `.` + name : name;
		yield* iterateBreadth(n, prefix);
	}
}
function* iterateDepth(t, pathPrefix) {
	if (typeof pathPrefix === `undefined`) pathPrefix = getName(t);
	for (const [index, n] of entries(t)) {
		yield [n, pathPrefix];
		const name = getName(n, `?`);
		const prefix = pathPrefix.length > 0 ? pathPrefix + `.` + name : name;
		yield* iterateBreadth(n, prefix);
	}
}
function isSeqNode(n) {
	return n.seq !== void 0;
}
function isSelNode(n) {
	return n.sel !== void 0;
}
function* entries(n) {
	if (isSeqNode(n)) yield* n.seq.entries();
	else if (isSelNode(n)) yield* n.sel.entries();
	else if (typeof n === `string`) {} else throw new TypeError(`Unexpected shape of node. seq/sel missing`);
}

//#endregion
//#region ../flow/dist/src/delay.js
/**
* Pauses execution for interval after which the asynchronous `callback` is executed and awaited.
* Must be called with `await` if you want the pause effect.
*
* @example Pause and wait for function
* ```js
* const result = await delay(async () => Math.random(), 1000);
* console.log(result); // Prints out result after one second
* ```
*
* If the `interval` option is a number its treated as milliseconds. {@link Interval} can also be used:
* ```js
* const result = await delay(async () => Math.random(), { mins: 1 });
* ```
*
* If `await` is omitted, the function will run after the provided timeout, and code will continue to run.
*
* @example Schedule a function without waiting
* ```js
* await delay(async () => {
*  console.log(Math.random())
* }, 1000);
* // Prints out a random number after 1 second.
* ```
*
* {@link delay} and {@link sleep} are similar. `delay()` takes a parameter of what code to execute after the timeout, while `sleep()` just resolves after the timeout.
*
* Optionally takes an AbortSignal to cancel delay.
* ```js
* const ac = new AbortController();
* // Super long wait
* await delay(someFn, { signal: ac.signal, hours: 1 }}
* ...
* ac.abort(); // Cancels long delay
* ```
*
* It also allows choice of when delay should happen.
* If you want to be able to cancel or re-run a delayed function, consider using
* {@link timeout} instead.
*
* @typeParam V - Type of callback return value
* @param callback What to run after interval
* @param optsOrMillis Options for delay, or millisecond delay. By default delay is before `callback` is executed.
* @return Returns result of `callback`.
*/
const delay = async (callback, optsOrMillis) => {
	const opts = typeof optsOrMillis === `number` ? { millis: optsOrMillis } : optsOrMillis;
	const delayWhen = opts.delay ?? `before`;
	if (delayWhen === `before` || delayWhen === `both`) await sleep(opts);
	const r = Promise.resolve(await callback());
	if (delayWhen === `after` || delayWhen === `both`) await sleep(opts);
	return r;
};
/**
* Iterate over a source iterable with some delay between results.
* Delay can be before, after or both before and after each result from the
* source iterable.
*
* Since it's an async iterable, `for await ... of` is needed.
*
* ```js
* const opts = { intervalMs: 1000, delay: 'before' };
* const iterable = count(10);
* for await (const i of delayIterable(iterable, opts)) {
*  // Prints 0..9 with one second between
* }
* ```
*
* Use {@link delay} to return a result after some delay
*
* @param iter
* @param opts
*/
/**
* Async generator that loops via `requestAnimationFrame`.
*
* We can use `for await of` to run code:
* ```js
* const loop = delayAnimationLoop();
* for await (const o of loop) {
*  // Do something...
*  // Warning: loops forever
* }
* // Warning: execution doesn't continue to this point
* // unless there is a 'break' in loop.
* ```
*
* Or use the generator in manually:
* ```js
* // Loop forever
* (async () => {
*  const loop = delayAnimationLoop();
*  while (true) {
*    await loop.next();
*
*    // Do something...
*    // Warning: loops forever
*  }
* })();
* ```
*
* Practically, these approaches are not so useful
* because execution blocks until the loop finishes.
*
* Instead, we might want to continually loop a bit
* of code while other bits of code continue to run.
*
* The below example shows how to do this.
*
* ```js
* setTimeout(async () => {
*  for await (const _ of delayAnimationLoop()) {
*    // Do soething at animation speed
*  }
* });
*
* // Execution continues while loop also runs
* ```
*
*/
async function* delayAnimationLoop() {
	let resolve$1;
	let p = new Promise((r) => resolve$1 = r);
	let timer = 0;
	const callback = () => {
		if (resolve$1) resolve$1();
		p = new Promise((r) => resolve$1 = r);
	};
	try {
		while (true) {
			timer = globalThis.requestAnimationFrame(callback);
			const _ = await p;
			yield _;
		}
	} finally {
		if (resolve$1) resolve$1();
		globalThis.cancelAnimationFrame(timer);
	}
}
/**
* Async generator that loops at a given interval.
*
* @example
* For Await loop every second
* ```js
* const loop = delayLoop(1000);
* // Or: const loop = delayLoop({ secs: 1 });
* for await (const o of loop) {
*  // Do something...
*  // Warning: loops forever
* }
* ```
*
* @example
* Loop runs every second
* ```js
* (async () => {
*  const loop = delayLoop(1000);
*  // or: loop = delayLoop({ secs: 1 });
*  while (true) {
*    await loop.next();
*
*    // Do something...
*    // Warning: loops forever
*  }
* })();
* ```
*
* Alternatives:
* * {@link delay} to run a single function after a delay
* * {@link sleep} pause execution
* * {@link continuously} to start/stop/adjust a constantly running loop
*
* @param timeout Delay. If 0 is given, `requestAnimationFrame` is used over `setTimeout`.
*/
async function* delayLoop(timeout$1) {
	const timeoutMs = intervalToMs(timeout$1);
	if (typeof timeoutMs === `undefined`) throw new Error(`timeout is undefined`);
	if (timeoutMs < 0) throw new Error(`Timeout is less than zero`);
	if (timeoutMs === 0) return yield* delayAnimationLoop();
	let resolve$1;
	let p = new Promise((r) => resolve$1 = r);
	let timer;
	const callback = () => {
		if (resolve$1) resolve$1();
		p = new Promise((r) => resolve$1 = r);
	};
	try {
		while (true) {
			timer = globalThis.setTimeout(callback, timeoutMs);
			const _ = await p;
			yield _;
		}
	} finally {
		if (resolve$1) resolve$1();
		if (timer !== void 0) globalThis.clearTimeout(timer);
		timer = void 0;
	}
}

//#endregion
//#region ../flow/dist/src/timeout.js
/**
* Returns a {@link Timeout} that can be triggered, cancelled and reset. Use {@link continuously} for interval-
* based loops.
*
* Once `start()` is called, `callback` will be scheduled to execute after `interval`.
* If `start()` is called again, the waiting period will be reset to `interval`.
*
* @example Essential functionality
* ```js
* const fn = () => {
*  console.log(`Executed`);
* };
* const t = timeout(fn, 60*1000);
* t.start();   // After 1 minute `fn` will run, printing to the console
* ```
*
* @example Control execution functionality
* ```
* t.cancel();  // Cancel it from running
* t.start();   // Schedule again after 1 minute
* t.start(30*1000); // Cancel that, and now scheduled after 30s
*
* // Get the current state of timeout
* t.runState;    // "idle", "scheduled" or "running"
* ```
*
* Callback function receives any additional parameters passed in from start. This can be useful for passing through event data:
*
* @example
* ```js
* const t = timeout( (elapsedMs, ...args) => {
*  // args contains event data
* }, 1000);
* el.addEventListener(`click`, t.start);
* ```
*
* Asynchronous callbacks can be used as well:
* ```js
* timeout(async () => {...}, 100);
* ```
*
* If you don't expect to need to control the timeout, consider using {@link delay},
* which can run a given function after a specified delay.
* @param callback
* @param interval
* @returns {@link Timeout}
*/
const timeout = (callback, interval) => {
	if (callback === void 0) throw new Error(`callback parameter is undefined`);
	const intervalMs = intervalToMs(interval);
	resultThrow(integerTest(intervalMs, `aboveZero`, `interval`));
	let timer;
	let startedAt = 0;
	let startCount = 0;
	let startCountTotal = 0;
	let state = `idle`;
	const clear = () => {
		startedAt = 0;
		globalThis.clearTimeout(timer);
		state = `idle`;
	};
	const start = async (altInterval = interval, args) => {
		const p = new Promise((resolve$1, reject) => {
			startedAt = performance.now();
			const altTimeoutMs = intervalToMs(altInterval);
			const it = integerTest(altTimeoutMs, `aboveZero`, `altTimeoutMs`);
			if (resultIsError(it)) {
				reject(resultToError(it));
				return;
			}
			switch (state) {
				case `scheduled`: {
					cancel();
					break;
				}
				case `running`: break;
			}
			state = `scheduled`;
			timer = globalThis.setTimeout(async () => {
				if (state !== `scheduled`) {
					console.warn(`Timeout skipping execution since state is not 'scheduled'`);
					clear();
					return;
				}
				const args_ = args ?? [];
				startCount++;
				startCountTotal++;
				state = `running`;
				await callback(performance.now() - startedAt, ...args_);
				state = `idle`;
				clear();
				resolve$1();
			}, altTimeoutMs);
		});
		return p;
	};
	const cancel = () => {
		if (state === `idle`) return;
		clear();
	};
	return {
		start,
		cancel,
		get runState() {
			return state;
		},
		get startCount() {
			return startCount;
		},
		get startCountTotal() {
			return startCountTotal;
		}
	};
};

//#endregion
//#region ../flow/dist/src/debounce.js
/**
* Returns a debounce function which acts to filter calls to a given function `fn`.
*
* Eg, Let's create a debounced wrapped for a function:
* ```js
* const fn = () => console.log('Hello');
* const debouncedFn = debounce(fn, 1000);
* ```
*
* Now we can call `debouncedFn()` as often as we like, but it will only execute
* `fn()` after 1 second has elapsed since the last invocation. It essentially filters
* many calls to fewer calls. Each time `debounceFn()` is called, the timeout is
* reset, so potentially `fn` could never be called if the rate of `debounceFn` being called
* is faster than the provided timeout.
*
* Remember that to benefit from `debounce`, you must call the debounced wrapper, not the original function.
*
* ```js
* // Create
* const d = debounce(fn, 1000);
*
* // Don't do this if we want to benefit from the debounce
* fn();
*
* // Use the debounced wrapper
* d(); // Only calls fn after 1000s
* ```
*
* A practical use for this is handling high-frequency streams of data, where we don't really
* care about processing every event, only last event after a period. Debouncing is commonly
* used on microcontrollers to prevent button presses being counted twice.
*
* @example Handle most recent pointermove event after 1000ms
* ```js
* // Set up debounced handler
* const moveDebounced = debounce((elapsedMs, evt) => {
*    // Handle event
* }, 500);
*
* // Wire up event
* el.addEventListener(`pointermove`, moveDebounced);
* ```
*
* Arguments can be passed to the debounced function:
*
* ```js
* const fn = (x) => console.log(x);
* const d = debounce(fn, 1000);
* d(10);
* ```
*
* If the provided function is asynchronous, it's possible to await the debounced
* version as well. If the invocation was filtered, it returns instantly.
*
* ```js
* const d = debounce(fn, 1000);
* await d();
* ```
* @param callback Function to filter access to
* @param interval Minimum time between invocations
* @returns Debounce function
*/
const debounce = (callback, interval) => {
	const t = timeout(callback, interval);
	return (...args) => {
		t.start(void 0, args);
	};
};

//#endregion
//#region ../flow/dist/src/dispatch-list.js
/**
* Maintains a list of listeners to receive data
*
* ```js
* const d = new DispatchList();
*
* // Eg: add a listener
* d.add(v => {
*  // Handle a value
* });
*
* // Eg. send a value to all listeners
* d.notify(`some value`);
* ```
*/
var DispatchList = class {
	#handlers;
	#counter = 0;
	#id = Math.floor(Math.random() * 100);
	constructor() {
		this.#handlers = [];
	}
	/**
	* Returns _true_ if list is empty
	* @returns
	*/
	isEmpty() {
		return this.#handlers.length === 0;
	}
	/**
	* Adds a handler. You get back an id which can be used
	* to remove the handler later.
	*
	* Handlers can be added with 'once' flag set to _true_. This will
	* automatically remove them after the first value is sent to them.
	* @param handler
	* @param options
	* @returns
	*/
	add(handler, options = {}) {
		this.#counter++;
		const once = options.once ?? false;
		const wrap$1 = {
			id: `${this.#id} - ${this.#counter}`,
			handler,
			once
		};
		this.#handlers.push(wrap$1);
		return wrap$1.id;
	}
	/**
	* Remove a handler by its id.
	* @param id
	* @returns _True_ if handler was removed, _false_ if not found.
	*/
	remove(id) {
		const length = this.#handlers.length;
		this.#handlers = this.#handlers.filter((handler) => handler.id !== id);
		return this.#handlers.length !== length;
	}
	/**
	* Emit a value to all handlers
	* @param value
	*/
	notify(value$1) {
		for (const handler of this.#handlers) {
			handler.handler(value$1);
			if (handler.once) this.remove(handler.id);
		}
	}
	/**
	* Remove all handlers
	*/
	clear() {
		this.#handlers = [];
	}
};

//#endregion
//#region ../flow/dist/src/every.js
/**
* Returns true for every _n_th call, eg 2 for every second call.
*
* If `nth` is 1, returns true for everything. 0 will be false for everything.
*
* Usage:
* ```js
* const tenth = everyNth(10);
* window.addEventListener(`pointermove`, evt => {
*  if (!tenth(evt)) return; // Filter out
*  // Continue processing, it is the 10th thing.
*
* });
* ```
*
* Alternative:
* ```js
* window.addEventListener(`pointermove`, everyNth(10, evt => {
*  // Do something with tenth item...
* });
* ```
* @param nth Every nth item
* @param callback
* @returns Function which in turn returns true if nth call has been hit, false otherwise
*/
const everyNth = (nth, callback) => {
	resultThrow(integerTest(nth, `positive`, `nth`));
	let counter = 0;
	return (data) => {
		counter++;
		if (counter === nth) {
			counter = 0;
			if (callback) callback(data);
			return true;
		}
		return false;
	};
};

//#endregion
//#region ../flow/dist/src/execute.js
/**
* Runs a series of async expressions, returning the results.
* Use {@link runSingle} if it's only a single result you care about.
*
* @example Run three functions, returning the highest-ranked result.
* ```js
* const result = runSingle([
*  () => 10,
*  () => 2,
*  () => 3
* ]);
* // Yields: 10
* ```
*
* Options can be passed for evaluation:
* ```js
* const result = run([
*  (args) => {
*    if (args === 'apple') return 100;
*  },
*  () => {
*    return 10;
*  }
* ])
* ```
*
* ```js
* const expr = [
*  (opts) => 10,
*  (opts) => 2,
*  (opts) => 3
* ];
* const opts = {
*  rank: (a, b) => {
*    if (a < b) return -1;
*    if (a > b) return 1;
*    return 0;
*  }
* }
* const result = await run(expr, opts);
* // Returns: 2
* ```
*
* In terms of typing, it takes an generic arguments `ArgsType` and `ResultType`:
* - `ArgsType`: type of expression arguments. This might be `void` if no arguments are used.
* - `ResultType`:  return type of expression functions
*
* Thus the `expressions` parameter is an array of functions:
* ```js
* (args:ArgsType|undefined) => ResultType|undefined
* // or
* (args:ArgsType|undefined) => Promise<ResultType|undefined>
* ```
*
* Example:
* ```js
* const expressions = [
*  // Function takes a string arg
*  (args:string) => return true; // boolean is the necessary return type
* ];
* const run<string,boolean>(expressions, opts, 'hello');
* ```
* @param expressions
* @param opts
* @param args
* @returns
*/
const run = async (expressions, opts = {}, args) => {
	const results = [];
	const compareFunction = opts.rank ?? defaultComparer;
	let expressionsArray = Array.isArray(expressions) ? expressions : [expressions];
	if (opts.shuffle) expressionsArray = shuffle(expressionsArray);
	for (let index = 0; index < expressionsArray.length; index++) {
		const exp = expressionsArray[index];
		let r;
		if (typeof exp === "function") r = await exp(args);
		else r = exp;
		if (r !== void 0) {
			results.push(r);
			results.sort(compareFunction);
		}
		if (typeof opts.stop !== "undefined") {
			if (opts.stop(r, results)) break;
		}
	}
	if (opts.filter) return results.filter(opts.filter);
	return results;
};
/**
* Like {@link run}, but it returns a single result or _undefined_.
* Use the `at` option to specify which index of results to use.
* By default it's -1, which is the presumably the highest-ranked result.
*
* @param expressions
* @param opts
* @param args
* @returns
*/
const runSingle = async (expressions, opts = {}, args) => {
	const results = await run(expressions, opts, args);
	if (!results) return;
	if (results.length === 0) return;
	const at = opts.at ?? -1;
	return results.at(at);
};

//#endregion
//#region ../flow/dist/src/event-race.js
/**
* Subscribes to events on `target`, returning the event data
* from the first event that fires.
*
* By default waits a maximum of 1 minute.
*
* Automatically unsubscribes on success or failure (ie. timeout)
*
* ```js
* // Event will be data from either event, whichever fires first
* // Exception is thrown if neither fires within 1 second
* const event = await eventRace(document.body, [`pointermove`, `pointerdown`], { timeout: 1000 });
* ```
* @param target Event source
* @param eventNames Event name(s)
* @param options Options
* @returns
*/
const eventRace = (target, eventNames, options = {}) => {
	const intervalMs = options.timeoutMs ?? 601e3;
	const signal = options.signal;
	let triggered = false;
	let disposed = false;
	let timeout$1;
	const promise = new Promise((resolve$1, reject) => {
		const onEvent = (event) => {
			if (`type` in event) if (eventNames.includes(event.type)) {
				triggered = true;
				resolve$1(event);
				dispose();
			} else console.warn(`eventRace: Got event '${event.type}' that is not in race list`);
			else {
				console.warn(`eventRace: Event data does not have expected 'type' field`);
				console.log(event);
			}
		};
		for (const name of eventNames) target.addEventListener(name, onEvent);
		const dispose = () => {
			if (disposed) return;
			if (timeout$1 !== void 0) clearTimeout(timeout$1);
			timeout$1 = void 0;
			disposed = true;
			for (const name of eventNames) target.removeEventListener(name, onEvent);
		};
		timeout$1 = setTimeout(() => {
			if (triggered || disposed) return;
			dispose();
			reject(/* @__PURE__ */ new Error(`eventRace: Events not fired within interval. Events: ${JSON.stringify(eventNames)} Interval: ${intervalMs}`));
		}, intervalMs);
		signal?.addEventListener(`abort`, () => {
			if (triggered || disposed) return;
			dispose();
			reject(/* @__PURE__ */ new Error(`Abort signal received ${signal.reason}`));
		});
	});
	return promise;
};

//#endregion
//#region ../flow/dist/src/moving-average.js
/**
* Uses the same algorithm as {@link movingAverageLight}, but adds values automatically if
* nothing has been manually added.
*
* ```js
* // By default, 0 is added if interval elapses
* const mat = movingAverageTimed({ interval: 1000 });
* mat(10); // Add value of 10, returns latest average
*
* mat(); // Get current average
* ```
*
* This is useful if you are averaging something based on events. For example calculating the
* average speed of the pointer. If there is no speed, there is no pointer move event. Using
* this function, `value` is added at a rate of `updateRateMs`. This timer is reset
* every time a value is added, a bit like the `debounce` function.
*
* Use an AbortSignal to cancel the timer associated with the `movingAverageTimed` function.
* @param options
* @returns
*/
const movingAverageTimed = (options) => {
	const average = movingAverageLight();
	const rm = rateMinimum({
		...options,
		whatToCall: (distance$1) => {
			average(distance$1);
		},
		fallback() {
			return options.default ?? 0;
		}
	});
	return (v) => {
		rm(v);
		return average();
	};
};

//#endregion
//#region ../flow/dist/src/pool.js
/**
* A use of a pool resource
*
* Has two events, _disposed_ and _released_.
*/
var PoolUser = class extends SimpleEventEmitter {
	key;
	resource;
	_lastUpdate;
	_pool;
	_state;
	_userExpireAfterMs;
	/**
	* Constructor
	* @param key User key
	* @param resource Resource being used
	*/
	constructor(key, resource) {
		super();
		this.key = key;
		this.resource = resource;
		this._lastUpdate = performance.now();
		this._pool = resource.pool;
		this._userExpireAfterMs = this._pool.userExpireAfterMs;
		this._state = `idle`;
		this._pool.log.log(`PoolUser ctor key: ${this.key}`);
	}
	/**
	* Returns a human readable debug string
	* @returns
	*/
	toString() {
		if (this.isDisposed) return `PoolUser. State: disposed`;
		return `PoolUser. State: ${this._state} Elapsed: ${performance.now() - this._lastUpdate} Data: ${JSON.stringify(this.resource.data)}`;
	}
	/**
	* Resets countdown for instance expiry.
	* Throws an error if instance is disposed.
	*/
	keepAlive() {
		if (this._state === `disposed`) throw new Error(`PoolItem disposed`);
		this._lastUpdate = performance.now();
	}
	/**
	* @internal
	* @param reason
	* @returns
	*/
	_dispose(reason, data) {
		if (this._state === `disposed`) return;
		const resource = this.resource;
		this._state = `disposed`;
		resource._release(this);
		this._pool.log.log(`PoolUser dispose key: ${this.key} reason: ${reason}`);
		this.fireEvent(`disposed`, {
			data,
			reason
		});
		super.clearEventListeners();
	}
	/**
	* Release this instance
	* @param reason
	*/
	release(reason) {
		if (this.isDisposed) throw new Error(`User disposed`);
		const resource = this.resource;
		const data = resource.data;
		this._pool.log.log(`PoolUser release key: ${this.key} reason: ${reason}`);
		this.fireEvent(`released`, {
			data,
			reason
		});
		this._dispose(`release-${reason}`, data);
	}
	get data() {
		if (this.isDisposed) throw new Error(`User disposed`);
		return this.resource.data;
	}
	/**
	* Returns true if this instance has expired.
	* Expiry counts if elapsed time is greater than `userExpireAfterMs`
	*/
	get isExpired() {
		if (this._userExpireAfterMs > 0) return performance.now() > this._lastUpdate + this._userExpireAfterMs;
		return false;
	}
	/**
	* Returns elapsed time since last 'update'
	*/
	get elapsed() {
		return performance.now() - this._lastUpdate;
	}
	/**
	* Returns true if instance is disposed
	*/
	get isDisposed() {
		return this._state === `disposed`;
	}
	/**
	* Returns true if instance is neither disposed nor expired
	*/
	get isValid() {
		if (this.isDisposed || this.isExpired) return false;
		if (this.resource.isDisposed) return false;
		return true;
	}
};
/**
* A resource allocated in the Pool
*/
var Resource = class {
	pool;
	#state;
	#data;
	#users;
	#capacityPerResource;
	#resourcesWithoutUserExpireAfterMs;
	#lastUsersChange;
	/**
	* Constructor.
	* @param pool Pool
	* @param data Data
	*/
	constructor(pool, data) {
		this.pool = pool;
		if (data === void 0) throw new Error(`Parameter 'data' is undefined`);
		if (pool === void 0) throw new Error(`Parameter 'pool' is undefined`);
		this.#data = data;
		this.#lastUsersChange = 0;
		this.#resourcesWithoutUserExpireAfterMs = pool.resourcesWithoutUserExpireAfterMs;
		this.#capacityPerResource = pool.capacityPerResource;
		this.#users = [];
		this.#state = `idle`;
	}
	/**
	* Gets data associated with resource.
	* Throws an error if disposed
	*/
	get data() {
		if (this.#state === `disposed`) throw new Error(`Resource disposed`);
		return this.#data;
	}
	/**
	* Changes the data associated with this resource.
	* Throws an error if disposed or `data` is undefined.
	* @param data
	*/
	updateData(data) {
		if (this.#state === `disposed`) throw new Error(`Resource disposed`);
		if (data === void 0) throw new Error(`Parameter 'data' is undefined`);
		this.#data = data;
	}
	/**
	* Returns a human-readable debug string for resource
	* @returns
	*/
	toString() {
		return `Resource (expired: ${this.isExpiredFromUsers} users: ${this.#users.length}, state: ${this.#state}) data: ${JSON.stringify(this.data)}`;
	}
	/**
	* Assigns a user to this resource.
	* @internal
	* @param user
	*/
	_assign(user) {
		const existing = this.#users.find((u) => u === user || u.key === user.key);
		if (existing) throw new Error(`User instance already assigned to resource`);
		this.#users.push(user);
		this.#lastUsersChange = performance.now();
	}
	/**
	* Releases a user from this resource
	* @internal
	* @param user
	*/
	_release(user) {
		this.#users = this.#users.filter((u) => u !== user);
		this.pool._release(user);
		this.#lastUsersChange = performance.now();
	}
	/**
	* Returns true if resource can have additional users allocated
	*/
	get hasUserCapacity() {
		return this.usersCount < this.#capacityPerResource;
	}
	/**
	* Returns number of uses of the resource
	*/
	get usersCount() {
		return this.#users.length;
	}
	/**
	* Returns true if automatic expiry is enabled, and that interval
	* has elapsed since the users list has changed for this resource
	*/
	get isExpiredFromUsers() {
		if (this.#resourcesWithoutUserExpireAfterMs <= 0) return false;
		if (this.#users.length > 0) return false;
		return performance.now() > this.#resourcesWithoutUserExpireAfterMs + this.#lastUsersChange;
	}
	/**
	* Returns true if instance is disposed
	*/
	get isDisposed() {
		return this.#state === `disposed`;
	}
	/**
	* Disposes the resource.
	* If it is already disposed, it does nothing.
	* @param reason
	* @returns
	*/
	dispose(reason) {
		if (this.#state === `disposed`) return;
		const data = this.#data;
		this.#state = `disposed`;
		this.pool.log.log(`Resource disposed (${reason})`);
		for (const u of this.#users) u._dispose(`resource-${reason}`, data);
		this.#users = [];
		this.#lastUsersChange = performance.now();
		this.pool._releaseResource(this, reason);
		if (this.pool.freeResource) this.pool.freeResource(data);
	}
};
/**
* Resource pool
* It does the housekeeping of managing a limited set of resources which are shared by 'users'.
* All resources in the Pool are meant to be the same kind of object.
*
* An example is an audio sketch driven by TensorFlow. We might want to allocate a sound oscillator per detected human body. A naive implementation would be to make an oscillator for each detected body. However, because poses appear/disappear unpredictably, it's a lot of extra work to maintain the binding between pose and oscillator.
*
* Instead, we might use the Pool to allocate oscillators to poses. This will allow us to limit resources and clean up automatically if they haven't been used for a while.
*
* Resources can be added manually with `addResource()`, or automatically by providing a `generate()` function in the Pool options. They can then be accessed via a _user key_. This is meant to associated with a single 'user' of a resource. For example, if we are associating oscillators with TensorFlow poses, the 'user key' might be the id of the pose.
*/
var Pool = class {
	_resources;
	_users;
	capacity;
	userExpireAfterMs;
	resourcesWithoutUserExpireAfterMs;
	capacityPerResource;
	fullPolicy;
	generateResource;
	freeResource;
	log = logSet(`Pool`);
	/**
	* Constructor.
	*
	* By default, no capacity limit, one user per resource
	* @param options Pool options
	*/
	constructor(options = {}) {
		this.capacity = options.capacity ?? -1;
		this.fullPolicy = options.fullPolicy ?? `error`;
		this.capacityPerResource = options.capacityPerResource ?? 1;
		this.userExpireAfterMs = options.userExpireAfterMs ?? -1;
		this.resourcesWithoutUserExpireAfterMs = options.resourcesWithoutUserExpireAfterMs ?? -1;
		this.generateResource = options.generate;
		this.freeResource = options.free;
		this._users = /* @__PURE__ */ new Map();
		this._resources = [];
		this.log = logSet(`Pool`, options.debug ?? false);
		const timer = Math.max(this.userExpireAfterMs, this.resourcesWithoutUserExpireAfterMs);
		if (timer > 0) setInterval(() => {
			this.maintain();
		}, timer * 1.1);
	}
	/**
	* Returns a debug string of Pool state
	* @returns
	*/
	dumpToString() {
		let r = `Pool
    capacity: ${this.capacity} userExpireAfterMs: ${this.userExpireAfterMs} capacityPerResource: ${this.capacityPerResource}
    resources count: ${this._resources.length}`;
		const resource = this._resources.map((r$1) => r$1.toString()).join(`\r\n\t`);
		r += `\r\nResources:\r\n\t` + resource;
		r += `\r\nUsers: \r\n`;
		for (const [k, v] of this._users.entries()) r += `\tk: ${k} v: ${v.toString()}\r\n`;
		return r;
	}
	/**
	* Sorts users by longest elapsed time since update
	* @returns
	*/
	getUsersByLongestElapsed() {
		return [...this._users.values()].sort((a, b) => {
			const aa = a.elapsed;
			const bb = b.elapsed;
			if (aa === bb) return 0;
			if (aa < bb) return 1;
			return -1;
		});
	}
	/**
	* Returns resources sorted with least used first
	* @returns
	*/
	getResourcesSortedByUse() {
		return [...this._resources].sort((a, b) => {
			if (a.usersCount === b.usersCount) return 0;
			if (a.usersCount < b.usersCount) return -1;
			return 1;
		});
	}
	/**
	* Adds a shared resource to the pool
	* @throws Error if the capacity limit is reached or resource is null
	* @param resource
	* @returns
	*/
	addResource(resource) {
		if (resource === void 0) throw new Error(`Cannot add undefined resource`);
		if (resource === null) throw new TypeError(`Cannot add null resource`);
		if (this.capacity > 0 && this._resources.length === this.capacity) throw new Error(`Capacity limit (${this.capacity}) reached. Cannot add more.`);
		this.log.log(`Adding resource: ${JSON.stringify(resource)}`);
		const pi = new Resource(this, resource);
		this._resources.push(pi);
		return pi;
	}
	/**
	* Performs maintenance, removing disposed/expired resources & users.
	* This is called automatically when using a resource.
	*/
	maintain() {
		let changed = false;
		const nuke = [];
		for (const p of this._resources) if (p.isDisposed) {
			this.log.log(`Maintain, disposed resource: ${JSON.stringify(p.data)}`);
			nuke.push(p);
		} else if (p.isExpiredFromUsers) {
			this.log.log(`Maintain, expired resource: ${JSON.stringify(p.data)}`);
			nuke.push(p);
		}
		if (nuke.length > 0) {
			for (const resource of nuke) resource.dispose(`diposed/expired`);
			changed = true;
		}
		const userKeysToRemove = [];
		for (const [key, user] of this._users.entries()) if (!user.isValid) {
			this.log.log(`Maintain. Invalid user: ${user.key} (Disposed: ${user.isDisposed} Expired: ${user.isExpired} Resource disposed: ${user.resource.isDisposed})`);
			userKeysToRemove.push(key);
			user._dispose(`invalid`, user.data);
		}
		for (const userKey of userKeysToRemove) {
			this._users.delete(userKey);
			changed = true;
		}
		if (changed) this.log.log(`End: resource len: ${this._resources.length} users: ${this.usersLength}`);
	}
	/**
	* Iterate over resources in the pool.
	* To iterate over the data associated with each resource, use
	* `values`.
	*/
	*resources() {
		const resource = [...this._resources];
		for (const r of resource) yield r;
	}
	/**
	* Iterate over resource values in the pool.
	* to iterate over the resources, use `resources`.
	*
	* Note that values may be returned even though there is no
	* active user.
	*/
	*values() {
		const resource = [...this._resources];
		for (const r of resource) yield r.data;
	}
	/**
	* Unassociate a key with a pool item
	* @param userKey
	*/
	release(userKey, reason) {
		const pi = this._users.get(userKey);
		if (!pi) return;
		pi.release(reason ?? `Pool.release`);
	}
	/**
	* @internal
	* @param user
	*/
	_release(user) {
		this._users.delete(user.key);
	}
	/**
	* @internal
	* @param resource
	* @param _
	*/
	_releaseResource(resource, _) {
		this._resources = this._resources.filter((v) => v !== resource);
	}
	/**
	* Returns true if `v` has an associted resource in the pool
	* @param resource
	* @returns
	*/
	hasResource(resource) {
		const found = this._resources.find((v) => v.data === resource);
		return found !== void 0;
	}
	/**
	* Returns true if a given `userKey` is in use.
	* @param userKey
	* @returns
	*/
	hasUser(userKey) {
		return this._users.has(userKey);
	}
	/**
	* @internal
	* @param key
	* @param resource
	* @returns
	*/
	_assign(key, resource) {
		const u = new PoolUser(key, resource);
		this._users.set(key, u);
		resource._assign(u);
		return u;
	}
	/**
	* Allocates a resource for `userKey`
	* @internal
	* @param userKey
	* @returns
	*/
	#allocateResource(userKey) {
		const sorted = this.getResourcesSortedByUse();
		if (sorted.length > 0 && sorted[0].hasUserCapacity) {
			const u = this._assign(userKey, sorted[0]);
			return u;
		}
		if (this.generateResource && (this.capacity < 0 || this._resources.length < this.capacity)) {
			this.log.log(`capacity: ${this.capacity} resources: ${this._resources.length}`);
			const resourceGenerated = this.addResource(this.generateResource());
			const u = this._assign(userKey, resourceGenerated);
			return u;
		}
	}
	/**
	* Return the number of users
	*/
	get usersLength() {
		return [...this._users.values()].length;
	}
	/**
	* 'Uses' a resource, returning the value
	* @param userKey
	* @returns
	*/
	useValue(userKey) {
		const resource = this.use(userKey);
		return resource.resource.data;
	}
	/**
	* Gets a pool item based on a 'user' key.
	*
	* The same key should return the same pool item,
	* for as long as it still exists.
	*
	* If a 'user' already has a resource, it will 'keep alive' their use.
	* If a 'user' does not already have resource
	*  - if there is capacity, a resource is allocated to user
	*  - if pool is full
	*    - fullPolicy = 'error': an error is thrown
	*    - fullPolicy = 'evictOldestUser': evicts an older user
	*    - Throw error
	* @param userKey
	* @throws Error If all resources are used and fullPolicy = 'error'
	* @returns
	*/
	use(userKey) {
		const pi = this._users.get(userKey);
		if (pi) {
			pi.keepAlive();
			return pi;
		}
		this.maintain();
		const match = this.#allocateResource(userKey);
		if (match) return match;
		if (this.fullPolicy === `error`) throw new Error(`Pool is fully used (fullPolicy: ${this.fullPolicy}, capacity: ${this.capacity})`);
		if (this.fullPolicy === `evictOldestUser`) {
			const users = this.getUsersByLongestElapsed();
			if (users.length > 0) {
				this.release(users[0].key, `evictedOldestUser`);
				const match2 = this.#allocateResource(userKey);
				if (match2) return match2;
			}
		}
		throw new Error(`Pool is fully used (${this.fullPolicy})`);
	}
};
/**
* Creates an instance of a Pool
* @param options
* @returns
*/
const create = (options = {}) => new Pool(options);

//#endregion
//#region ../flow/dist/src/promise-with-resolvers.js
/**
* Creates a new Promise, returning the promise
* along with its resolve and reject functions.
*
* ```js
* const { promise, resolve, reject } = promiseWithResolvers();
*
* setTimeout(() => {
*  resolve();
* }, 1000);
*
* await promise;
* ```
*
* Promise would be passed somewhere that expects a promise,
* and you're free to call `resolve` or `reject` when needed.
* @returns
*/
function promiseWithResolvers() {
	let resolve$1;
	let reject;
	const promise = new Promise((_resolve, _reject) => {
		resolve$1 = _resolve;
		reject = _reject;
	});
	return {
		promise,
		resolve: resolve$1,
		reject
	};
}

//#endregion
//#region ../flow/dist/src/rate-minimum.js
/**
* Ensures that `whatToCall` is executed with a given tempo.
*
* ```js
* const rm = rateMinimum({
*  fallback: () => {
*    return Math.random();
*  },
*  whatToCall: (value:number) => {
*    console.log(value);
*  },
*  interval: { secs: 10 }
* });
*
* // Invokes `whatToCall`, resetting timeout
* rm(10);
*
* // If we don't call rm() before 'interval' has elapsed,
* // 'fallback' will be invoked
* ```
*
* A practical use for this is to update calculations based on firing of events
* as well as when they don't fire. For example user input.
*
* ```js
* // Average distances
* const average = movingAverageLight();
* const rm = rateMinimum({
*  interval: { secs: 1 },
*  whatToCall: (distance: number) => {
*    average(distance);
*  },
*  // If there are no pointermove events, distance is 0
*  fallback() {
*    return 0;
*  }
* })
*
* // Report total movemeent
* document.addEventListener(`pointermove`, event => {
*  rm(event.movementX + event.movementY);
* });
* ```
*
* @param options
* @returns
*/
const rateMinimum = (options) => {
	let disposed = false;
	const t = timeout(() => {
		if (disposed) return;
		t.start();
		options.whatToCall(options.fallback());
	}, options.interval);
	if (options.abort) options.abort.addEventListener(`abort`, (_) => {
		disposed = true;
		t.cancel();
	});
	t.start();
	return (args) => {
		if (disposed) throw new Error(`AbortSignal has been fired`);
		t.start();
		options.whatToCall(args);
	};
};

//#endregion
//#region ../flow/dist/src/repeat.js
/**
* Generates values from `produce` with a time delay.
* `produce` can be a simple function that returns a value, an async function, or a generator.
* If `produce` returns _undefined_, generator exits.
*
* @example
* Produce a random number every 500ms
* ```js
* const randomGenerator = repeat(() => Math.random(), 500);
* for await (const r of randomGenerator) {
*  // Random value every 1 second
*  // Warning: does not end by itself, a `break` statement is needed
* }
* ```
*
* @example
* Return values from a generator every 500ms
* ```js
* import { repeat } from '@ixfx/flow.js'
* import { count } from '@ixfx/numbers.js'
* for await (const v of repeat(count(10), { fixed: 1000 })) {
*  // Do something with `v`
* }
* ```
*
* Options allow either fixed interval (wait this long between iterations), or a minimum interval (wait at least this long). The latter is useful if `produce` takes some time - it will only wait the remaining time or not at all.
*
* If the AbortSignal is triggered, an exception will be thrown, stopping iteration.
*
* @see {@link continuously}: loop that runs at a constant speed. Able to be started and stopped
* @see {@link repeat}: run a function a certain number of times, collecting results
*
* @param produce Function/generator to use
* @param opts
* @typeParam T - Data type
* @returns Returns value of `produce` function
*/
async function* repeat(produce, opts) {
	const signal = opts.signal ?? void 0;
	const delayWhen = opts.delayWhen ?? `before`;
	const count = opts.count ?? void 0;
	const allowUndefined = opts.allowUndefined ?? false;
	const minIntervalMs = opts.delayMinimum ? intervalToMs(opts.delayMinimum) : void 0;
	const whileFunction = opts.while;
	let cancelled = false;
	let sleepMs = intervalToMs(opts.delay, intervalToMs(opts.delayMinimum, 0));
	let started = performance.now();
	const doDelay = async () => {
		const elapsed = performance.now() - started;
		if (typeof minIntervalMs !== `undefined`) sleepMs = Math.max(0, minIntervalMs - elapsed);
		if (sleepMs) await sleep({
			millis: sleepMs,
			signal
		});
		started = performance.now();
		if (signal?.aborted) throw new Error(`Signal aborted ${signal.reason}`);
	};
	if (Array.isArray(produce)) produce = produce.values();
	if (opts.onStart) opts.onStart();
	let errored = true;
	let loopedTimes = 0;
	try {
		while (!cancelled) {
			loopedTimes++;
			if (delayWhen === `before` || delayWhen === `both`) await doDelay();
			const result = await resolve(produce);
			if (typeof result === `undefined` && !allowUndefined) cancelled = true;
			else {
				yield result;
				if (delayWhen === `after` || delayWhen === `both`) await doDelay();
				if (count !== void 0 && loopedTimes >= count) cancelled = true;
			}
			if (whileFunction) {
				if (!whileFunction(loopedTimes)) cancelled = true;
			}
		}
		errored = false;
	} finally {
		cancelled = true;
		if (opts.onComplete) opts.onComplete(errored);
	}
}
/**
* Generates values from `produce` with a time delay.
* `produce` can be a simple function that returns a value, an function, or a generator.
* If `produce` returns _undefined_, generator exits.
*
* This is the synchronous version. {@link repeat} allows for delays between loops
* as well as asynchronous callbacks.
*
* If the AbortSignal is triggered, an exception will be thrown, stopping iteration.
*
* @param produce Function/generator to use
* @param opts Options
* @typeParam T - Data type
* @returns Returns value of `produce` function
*/
function* repeatSync(produce, opts) {
	const signal = opts.signal ?? void 0;
	const count = opts.count ?? void 0;
	const allowUndefined = opts.allowUndefined ?? false;
	let cancelled = false;
	if (Array.isArray(produce)) produce = produce.values();
	if (opts.onStart) opts.onStart();
	let errored = true;
	let loopedTimes = 0;
	try {
		while (!cancelled) {
			loopedTimes++;
			const result = resolveSync(produce);
			if (typeof result === `undefined` && !allowUndefined) cancelled = true;
			else {
				yield result;
				if (count !== void 0 && loopedTimes >= count) cancelled = true;
				if (signal?.aborted) cancelled = true;
			}
		}
		errored = false;
	} finally {
		cancelled = true;
		if (opts.onComplete) opts.onComplete(errored);
	}
}
/**
* Logic for continuing repeats
*/
/**
* Calls and waits for the async function `fn` repeatedly, yielding each result asynchronously.
* Use {@link repeat} if `fn` does not need to be awaited.
*
* ```js
* // Eg. iterate
* const r = Flow.repeat(5, async () => Math.random());
* for await (const v of r) {
*
* }
* // Eg read into array
* const results = await Array.fromAsync(Flow.repeatAwait(5, async () => Math.random()));
* ```
*
* The number of repeats is determined by the first parameter. If it's a:
* - number: how many times to repeat
* - function: it gets called before each repeat, if it returns _false_ repeating stops.
*
* Using a fixed number of repeats:
* ```js
* // Calls - and waits - for Flow.sleep(1) 5 times
* await Flow.repeatAwait(5, async () => {
*    // some kind of async function where we can use await
*    // eg. sleep for 1s
*    await Flow.sleep(1);
* });
* ```
*
* Using a function to dynamically determine number of repeats. The function gets
* passed the number of repeats so far as well as the number of values produced. This
* is count of non-undefined results from `cb` that is being repeated.
*
* ```js
* async function task() {
*  // do something
* }
*
* await Flow.repeatAwait(
*  (repeats, valuesProduced) => {
*    // Logic for deciding whether to repeat or not
*    if (repeats > 5) return false; // Stop repeating
*  },
*  task
* );
* ```
*
* In the above cases we're not using the return value from `fn`. This would look like:
* ```js
* const g = Flow.repeatAwait(5, async () => Math.random);
* for await (const v of g) {
*  // Loops 5 times, v is the return value of calling `fn` (Math.random)
* }
* ```
* @param countOrPredicate Number of times to repeat, or a function that returns _false_ to stop the loop.
* @param fn Function to execute. Asynchronous functions will be awited
* @typeParam V - Return type of repeating function
* @returns Asynchronous generator of `fn` results.
*/
/**
* Calls `fn` repeatedly, yielding each result.
* Use {@link repeatAwait} if `fn` is asynchronous and you want to wait for it.
*
* The number of repeats is determined by the first parameter. If it's a:
* - number: how many times to repeat
* - function: it gets called before each repeat, if it returns _false_ repeating stops.
*
* Example: using a fixed number of repeats
* ```js
* // Results will be an array with five random numbers
* const results = [...repeat(5, () => Math.random())];
*
* // Or as an generator (note also the simpler expression form)
* for (const result of repeat(5, Math.random)) {
* }
* ```
*
* Example: Using a function to dynamically determine number of repeats
* ```js
* function task() {
* }
*
* Flow.repeat(
*  (repeats, valuesProduced) => {
*    if (repeats > 5) return false; // Stop repeating
*  },
*  task
* );
* ```
*
* In the above cases we're not using the return value from `fn`. To do so,
* this would look like:
* ```js
* const g = Flow.repeat(5, () => Math.random);
* for (const v of g) {
*  // Loops 5 times, v is the return value of calling `fn` (Math.random)
* }
* ```
*
* Alternatives:
* * {@link Flow.forEach | Flow.forEach} - if you don't need return values
* * {@link Flow.interval} - if you want to repeatedly call something with an interval between
* @param countOrPredicate Numnber of repeats, or a function that returns _false_ for when to stop.
* @param fn Function to execute. Asynchronous functions will be awited
* @typeParam V - Return type of repeating function
* @returns Asynchronous generator of `fn` results.
*/
/**
* Calls `fn` until `predicate` returns _false_. Awaits result of `fn` each time.
* Yields result of `fn` asynchronously
* @param predicate
* @param fn
* @typeParam V - Return type of repeating function
*/
/**
* Calls `fn` until `predicate` returns _false_. Yields result of `fn`.
* @param predicate Determiner for whether repeating continues
* @param fn Function to call
* @typeParam V - Return type of repeating function
*/
/**
* Calls `fn`, `count` number of times, waiting for the result of `fn`.
* Yields result of `fn` asynchronously
* @param count Number of times to run
* @param fn Function to run
* @typeParam V - Return type of repeating function
*/
/**
* Calls `fn`, `count` times. Assumes a synchronous function. Yields result of `fn`.
*
* Note that if `fn` returns _undefined_ repeats will stop.
* @typeParam V - Return type of repeating function
* @param count Number of times to run
* @param fn Function to run
*/
/**
* Repeatedly calls `fn`, reducing via `reduce`.
*
* ```js
* repeatReduce(10, () => 1, (acc, v) => acc + v);
* // Yields: 10
*
* // Multiplies random values against each other 10 times
* repeatReduce(10, Math.random, (acc, v) => acc * v);
* // Yields a single number
* ```
* @param countOrPredicate Number of times to run, or function to keep running
* @param fn Function to call
* @param initial Initial value
* @param reduce Function to reduce value
* @typeParam V - Return type of repeating function
* @returns Final result
*/

//#endregion
//#region ../flow/dist/src/req-resp-match.js
/**
* Matches responses with requests, expiring requests if they do not get a response in a timely manner.
*
* Basic usage:
* ```js
* const m = new RequestResponseMatch(options);
* // Listen for when a response matches a request
* m.addEventListener(`match`, event => {
*  // event: { request:Req, response:Resp}
* });
* // Or alternatively, listen for success and failures
* m.addEventListener(`completed`, event => {
*  // { request:Resp, response:Req|undefined, success:boolean }
*  // 'response' will be data or a string error message
* });
* m.request(req); // Note that some request was sent
* ...
* m.response(resp); // Call when a response is received
* ```
*
* It's also possible to wait for specific replies:
* ```js
* // With a promise
* const resp = await m.requestAwait(req);
* // With a callback
* m.requestCallback(req, (success, resp) => {
*  // Runs on success or failure
* })
* ```
* It relies on creating an id of a request/response for them to be matched up. Use the `key`
* option if the function can generate a key from either request or response. Or alternatively set both `keyRequest` and `keyResponse` for two functions that can generate a key for request and response respectively.
*
*
* The easy case is if req & resp both have the same field:
* ```js
* const m = new RequestResponseMatch({
*  key: (reqOrResp) => {
*    // Requests has an 'id' field
*    // Response also has an 'id' field that corresponds to the request id
*    return reqOrResp.id;
*  }
* });
* ```
*
* A more complicated case:
* ```js
* const m = new RequestResponseMatch({
*  keyRequest: (req) => {
*    // Requests have an 'id' field
*    return req.id;
*  },
*  keyResponse: (resp) => {
*    // Responses have id under a different field
*    return resp.reply_to
*  }
* })
* ```
*
* By default, error will be thrown if a response is received that doesn't match up to any request.
*/
var RequestResponseMatch = class extends SimpleEventEmitter {
	timeoutMs;
	whenUnmatchedResponse;
	keyRequest;
	keyResponse;
	#outgoing = /* @__PURE__ */ new Map();
	#maintainLoop;
	constructor(options = {}) {
		super();
		if (typeof window === `undefined`) globalThis.window = {
			setTimeout,
			clearTimeout
		};
		this.timeoutMs = options.timeoutMs ?? 1e3;
		this.whenUnmatchedResponse = options.whenUnmatchedResponse ?? `throw`;
		this.#maintainLoop = continuously(() => this.#maintain(), this.timeoutMs * 2);
		if (options.key) {
			if (options.keyRequest) throw new Error(`Cannot set 'keyRequest' when 'key' is set `);
			if (options.keyResponse) throw new Error(`Cannot set 'keyResponse' when 'key' is set `);
			this.keyRequest = options.key;
			this.keyResponse = options.key;
		} else {
			if (!options.keyRequest || !options.keyResponse) throw new Error(`Expects 'keyRequest' & 'keyResponse' fields to be set if 'key' is not set`);
			this.keyRequest = options.keyRequest;
			this.keyResponse = options.keyResponse;
		}
	}
	#maintain() {
		const values = [...this.#outgoing.values()];
		const now = Date.now();
		for (const v of values) if (v.expiresAt <= now) {
			if (v.promiseReject) v.promiseReject(`Request timeout`);
			const callback = v.callback;
			if (callback) setTimeout(() => {
				callback(true, `Request timeout`);
			}, 1);
			this.fireEvent(`completed`, {
				request: v.req,
				response: `Request timeout`,
				success: false
			});
			this.#outgoing.delete(v.id);
		}
		this.debugDump();
		return this.#outgoing.size > 0;
	}
	debugDump() {
		const values = [...this.#outgoing.values()];
		const now = Date.now();
		for (const v of values) {
			const expire = now - v.expiresAt;
			console.log(`${v.id} Expires in: ${Math.floor(expire / 1e3).toString()}s`);
		}
	}
	/**
	* Makes a request.
	* If `callback` is set, it's equivalent to calling `requestCallback`.
	* If `callback` is not set, a promise is returned
	* @param request
	* @param callback
	* @returns
	*/
	request(request, callback) {
		if (callback !== void 0) {
			this.#requestCallback(request, callback);
			return;
		}
		return this.#requestAwait(request);
	}
	/**
	* Make a request and don't wait for the outcome.
	* @param request
	*/
	requestAndForget(request) {
		const id = this.keyRequest(request);
		if (this.#outgoing.has(id)) throw new Error(`Already a request pending with id '${id}'`);
		const r = {
			expiresAt: Date.now() + this.timeoutMs,
			id,
			req: request
		};
		this.#outgoing.set(id, r);
		this.#maintainLoop.start();
	}
	/**
	* Make a request, returning a Promise for the outcome.
	* Errors will throw an exception.
	* @param request
	* @returns
	*/
	#requestAwait(request) {
		const id = this.keyRequest(request);
		if (this.#outgoing.has(id)) throw new Error(`Already a request pending with id '${id}'`);
		const p = new Promise((resolve$1, reject) => {
			const r = {
				expiresAt: Date.now() + this.timeoutMs,
				id,
				req: request,
				promiseResolve: resolve$1,
				promiseReject: reject
			};
			this.#outgoing.set(id, r);
			this.#maintainLoop.start();
		});
		return p;
	}
	/**
	* Make a request, and get notified of outcome with a callback
	* @param request
	* @param callback
	*/
	#requestCallback(request, callback) {
		const id = this.keyRequest(request);
		if (this.#outgoing.has(id)) throw new Error(`Already a request pending with id '${id}'`);
		const r = {
			expiresAt: Date.now() + this.timeoutMs,
			id,
			req: request,
			callback
		};
		this.#outgoing.set(id, r);
		this.#maintainLoop.start();
	}
	/**
	* Response has been received
	* @param response Response
	* @returns _True_ if response matched a request
	*/
	response(response, keepAlive) {
		const id = this.keyResponse(response);
		const request = this.#outgoing.get(id);
		if (!request) {
			if (this.whenUnmatchedResponse === `throw`) throw new Error(`Unmatched response with id: '${id}'`, { cause: response });
			return false;
		}
		if (keepAlive) request.expiresAt = Date.now() + this.timeoutMs;
		else this.#outgoing.delete(id);
		if (request.promiseResolve) request.promiseResolve(response);
		if (request.callback) request.callback(false, response);
		this.fireEvent(`match`, {
			request: request.req,
			response
		});
		if (!keepAlive) this.fireEvent(`completed`, {
			request: request.req,
			response,
			success: true
		});
		return true;
	}
};

//#endregion
//#region ../flow/dist/src/retry.js
/**
* Generates an expoential backoff series of values
* ```js
* // Default: start at 1, power 1.1
* for (const v of backoffGenerator()) {
*  // v: numeric value
* }
* ```
*
* By default the generator runs forever. Use either
* `limitAttempts` or `limitValue` to stop it when it produces a
* given quantity of values, or when the value itself reaches a threshold.
*
* For example:
* ```js
* // `values` will have five values in it
* const values = [...backoffGenerator({ limitAttempts: 5 })];
* // Keep generating values until max is reached
* const values = [...backoffGenerator({ limitValue: 1000 })];
* ```
*
* Options:
* * startAt: start value
* * limitAttempts: cap the number of values to generate
* * limitValue: cap the maximum calculated value
* * power: power value (default 1.1)
*
* @param options
* @returns
*/
function* backoffGenerator(options = {}) {
	const startAt = options.startAt ?? 1;
	let limitAttempts = options.limitAttempts ?? Number.MAX_SAFE_INTEGER;
	const limitValue = options.limitValue;
	const power = options.power ?? 1.1;
	let value$1 = startAt;
	resultThrow(integerTest(limitAttempts, `aboveZero`, `limitAttempts`), numberTest(startAt, ``, `startAt`), numberTest(limitAttempts, ``, `limitAttempts`), () => limitValue !== void 0 ? numberTest(limitValue, ``, `limitValue`) : void 0, numberTest(power, ``, `power`));
	while (limitAttempts > 0) {
		if (limitValue && value$1 >= limitValue) return;
		limitAttempts--;
		yield value$1;
		value$1 += Math.pow(value$1, power);
	}
}
/**
* Keeps calling `callback` until it returns something other than _undefined_.
* There is an exponentially-increasing delay between each retry attempt.
*
* If `callback` throws an exception, the retry is cancelled, bubbling the exception.
*
* ```js
* // A function that only works some of the time
* const flakyFn = async () => {
*  // do the thing
*  if (Math.random() > 0.9) return true; // success
*  return; // fake failure
* };
*
* // Retry it up to five times,
* // starting with 1000ms interval
* const result = await retryFunction(flakyFn, {
*  limitAttempts: 5
* });
*
* if (result.success) {
*  // Yay
* } else {
*  console.log(`Failed after ${result.attempts} attempts. Elapsed: ${result.elapsed}`);
*  console.log(result.message);
* }
* ```
*
* An `AbortSignal` can be used to cancel process.
* ```js
* const abort = new AbortController();
* const result = await retryFunction(cb, { signal: abort.signal });
*
* // Somewhere else...
* abort('Cancel!'); // Trigger abort
* ```
* @param callback Function to run
* @param options Options
* @returns
*/
const retryFunction = (callback, options = {}) => {
	const task = { async probe() {
		try {
			const v = await callback();
			if (v === void 0) return {
				value: options.taskValueFallback,
				error: `Fallback`,
				success: false
			};
			return {
				value: v,
				success: true
			};
		} catch (error) {
			return {
				success: false,
				error
			};
		}
	} };
	return retryTask(task, options);
};
/**
* Keeps trying to run `task`.
*
* ```js
* const task = (attempts) => {
*  // attempts is number of times it has been retried
*
*  if (Math.random() > 0.5) {
*    // Return a succesful result
*    return { success: true }
*  } else {
*  }
*
* }
* const t = await retryTask(task, opts);
* ```
* @param task
* @param opts
* @returns
*/
const retryTask = async (task, opts = {}) => {
	const signal = opts.abort;
	const log = resolveLogOption(opts.log);
	const predelayMs = opts.predelayMs ?? 0;
	const startedAt = elapsedSince();
	let attempts = 0;
	const initialValue = opts.startAt ?? 1e3;
	const limitAttempts = opts.limitAttempts ?? Number.MAX_SAFE_INTEGER;
	const backoffGen = backoffGenerator({
		...opts,
		startAt: initialValue,
		limitAttempts
	});
	if (initialValue <= 0) throw new Error(`Param 'initialValue' must be above zero`);
	if (predelayMs > 0) try {
		await sleep({
			millis: predelayMs,
			signal
		});
	} catch (error) {
		return {
			success: false,
			attempts,
			value: opts.taskValueFallback,
			elapsed: startedAt(),
			message: getErrorMessage(error)
		};
	}
	for (const t of backoffGen) {
		attempts++;
		const result = await task.probe(attempts);
		if (result.success) return {
			success: result.success,
			value: result.value,
			attempts,
			elapsed: startedAt()
		};
		log({ msg: `retry attempts: ${attempts.toString()} t: ${elapsedToHumanString(t)}` });
		if (attempts >= limitAttempts) break;
		try {
			await sleep({
				millis: t,
				signal
			});
		} catch (error) {
			return {
				success: false,
				attempts,
				value: opts.taskValueFallback,
				message: getErrorMessage(error),
				elapsed: startedAt()
			};
		}
	}
	return {
		message: `Giving up after ${attempts.toString()} attempts.`,
		success: false,
		attempts,
		value: opts.taskValueFallback,
		elapsed: startedAt()
	};
};

//#endregion
//#region ../flow/dist/src/run-once.js
/**
* Runs a function once
*
* ```js
* const init = runOnce(() => {
*  // do some initialisation
* });
*
* init(); // Runs once
* init(); // no-op
* ```
* @param onRun
* @returns
*/
const runOnce = (onRun) => {
	let run$1 = false;
	let success = false;
	return () => {
		if (run$1) return success;
		run$1 = true;
		success = onRun();
		return success;
	};
};

//#endregion
//#region ../flow/dist/src/sync-wait.js
/**
* Simple synchronisation. Supports only a single signal/waiter.
* Expects one or more calls to .signal() for .forSignal() to resolve
*
* ```js
* const sw = new SyncWait();
* obj.addEventListener(`click`, () => {
*  sw.signal();
* });
*
* // Wait until click event
* await sw.forSignal();
* ```
*
* `forSignal` can also take a maximum time to wait. If the
* time elapses, an exception is thrown.
*
* {@link didSignal} returns _true_/_false_ if signal happened rather
* than throwing an exception.
*
*/
var SyncWait = class {
	#resolve;
	#reject;
	#promise;
	signal() {
		if (this.#resolve) {
			this.#resolve();
			this.#resolve = void 0;
		}
		this.#promise = Promise.resolve();
	}
	/**
	* Throw away any previous signalled state.
	* This will cause any currently waiters to throw
	*/
	flush() {
		if (this.#reject) {
			this.#reject(`Flushed`);
			this.#reject = void 0;
		}
		this.#resolve = void 0;
		this.#promise = void 0;
	}
	#initPromise() {
		const p = new Promise((resolve$1, reject) => {
			this.#resolve = resolve$1;
			this.#reject = reject;
		});
		this.#promise = p;
		return p;
	}
	/**
	* Call with `await` to wait until .signal() happens.
	* If a wait period is specified, an exception is thrown if signal does not happen within this time.
	* @param maximumWaitMs
	*/
	async forSignal(maximumWaitMs) {
		let p = this.#promise;
		p ??= this.#initPromise();
		if (maximumWaitMs) {
			const reject = this.#reject;
			setTimeout(() => {
				if (reject) reject(`Timeout elapsed ${maximumWaitMs.toString()}`);
			}, maximumWaitMs);
		}
		await p;
		this.#promise = void 0;
		this.#resolve = void 0;
		this.#reject = void 0;
	}
	/**
	* An alternative to {@link forSignal}, returning _true_
	* if signalled, or _false_ if wait period was exceeded
	*
	* ```js
	* const s = await sw.didSignal(5000);
	* ```
	* @param maximumWaitMs
	* @returns
	*/
	async didSignal(maximumWaitMs) {
		try {
			await this.forSignal(maximumWaitMs);
			return true;
		} catch {
			return false;
		}
	}
};

//#endregion
//#region ../flow/dist/src/task-queue-mutable.js
/**
* Simple task queue. Each task is awaited and run
* in turn.
*
* The TaskQueueMutable is shared across your code,
* so you don't create it directly. Rather, use:
*
* ```js
* const queue = TaskQueueMutable.shared;
* ```
*
* @example Usage
* ```js
* const queue = TaskQueueMutable.shared;
* q.enqueue(async () => {
*  // Takes one second to run
*  await sleep(1000);
* });
* ```
*
* You can listen to events from the TaskQueue:
* ```js
* TaskQueueMutable.shared.addEventListener(`started`, () => {
*  // Queue was empty, now started processing
* });
*
* TaskQueueMutable.shared.addEventListener(`empty`, () => {
*  // Queue has finished processing all items
* });
* ```
*/
var TaskQueueMutable = class TaskQueueMutable extends SimpleEventEmitter {
	static shared = new TaskQueueMutable();
	_loop;
	_queue;
	constructor() {
		super();
		this._queue = mutable$1();
		this._loop = continuously(() => {
			return this.processQueue();
		}, 100);
	}
	/**
	* Adds a task. This triggers processing loop if not already started.
	*
	* ```js
	* queue.add(async () => {
	*  await sleep(1000);
	* });
	* ```
	* @param task Task to run
	*/
	enqueue(task) {
		const length = this._queue.enqueue(task);
		if (this._loop.runState === `idle`) {
			this.fireEvent(`started`, {});
			this._loop.start();
		}
		return length;
	}
	dequeue() {
		return this._queue.dequeue();
	}
	async processQueue() {
		const task = this._queue.dequeue();
		if (task === void 0) {
			this.fireEvent(`empty`, {});
			return false;
		}
		try {
			await task();
		} catch (error) {
			console.error(error);
		}
	}
	/**
	* Clears all tasks, and stops any scheduled processing.
	* Currently running tasks will continue.
	* @returns
	*/
	clear() {
		if (this._queue.length === 0) return;
		this._queue.clear();
		this._loop.cancel();
		this.fireEvent(`empty`, {});
	}
	/**
	* Returns true if queue is empty
	*/
	get isEmpty() {
		return this._queue.isEmpty;
	}
	/**
	* Number of items in queue
	*/
	get length() {
		return this._queue.length;
	}
};

//#endregion
//#region ../flow/dist/src/throttle.js
/***
* Throttles a function. Callback only allowed to run after minimum of `intervalMinMs`.
*
* @example Only handle move event every 500ms
* ```js
* const moveThrottled = throttle( (elapsedMs, args) => {
*  // Handle ar
* }, 500);
* el.addEventListener(`pointermove`, moveThrottled)
* ```
*
* Note that `throttle` does not schedule invocations, but rather acts as a filter that
* sometimes allows follow-through to `callback`, sometimes not. There is an expectation then
* that the return function from `throttle` is repeatedly called, such as the case for handling
* a stream of data/events.
*
* @example Manual trigger
* ```js
* // Set up once
* const t = throttle( (elapsedMs, args) => { ... }, 5000);
*
* // Later, trigger throttle. Sometimes the callback will run,
* // with data passed in to args[0]
* t(data);
* ```
*/
const throttle = (callback, intervalMinMs) => {
	let trigger = 0;
	return async (...args) => {
		const elapsed = performance.now() - trigger;
		if (elapsed >= intervalMinMs) {
			const r = callback(elapsed, ...args);
			if (typeof r === `object`) await r;
			trigger = performance.now();
		}
	};
};

//#endregion
//#region ../flow/dist/src/timer.js
/**
* A function that returns _true_ when an interval has elapsed
*
* ```js
* const oneSecond = hasElapsed(1000);
*
* // Keep calling to check if time has elapsed.
* // Will return _true_ when it has
* oneSecond();
* ```
*
* @param elapsed
* @returns
*/
function hasElapsed(elapsed) {
	const t = relative(intervalToMs(elapsed, 0), {
		timer: elapsedMillisecondsAbsolute(),
		clampValue: true
	});
	return () => t.isDone;
}
/**
* Returns a function that returns the percentage of timer completion.
* Starts when return function is first invoked.
*
* ```js
* const timer = Flow.ofTotal(1000);
*
* // Call timer() to find out the completion
* timer(); // Returns 0..1
* ```
*
* Note that timer can exceed 1 (100%). To cap it:
* ```js
* Flow.ofTotal(1000, { clampValue: true });
* ```
*
* Takes an {@link Interval} for more expressive time:
* ```js
* const timer = Flow.ofTotal({ mins: 4 });
* ```
*
* Is a simple wrapper around {@link relative}.
* @param duration
* @see {@link ofTotalTicks} - Use ticks instead of time
* @see {@link hasElapsed} - Simple _true/false_ if interval has elapsed
* @returns
*/
function ofTotal(duration, opts = {}) {
	const totalMs = intervalToMs(duration);
	if (!totalMs) throw new Error(`Param 'duration' not valid`);
	const timerOpts = {
		...opts,
		timer: elapsedMillisecondsAbsolute()
	};
	let t;
	return () => {
		t ??= relative(totalMs, timerOpts);
		return t.elapsed;
	};
}
/**
* Returns a function that returns the percentage (0..1) of timer completion.
* Uses 'ticks' as a measure. Use {@link ofTotal} if you want time-based.
*
* ```js
* const timer = Flow.ofTotalTicks(1000);
* timer(); // Returns 0..1
* ```
*
* Note that timer can exceed 1 (100%). To cap it:
* ```js
* Flow.ofTotalTicks(1000, { clampValue: true });
* ```
*
* This is a a simple wrapper around {@link relative}.
* @see {@link ofTotal}
* @see {@link hasElapsed}: Simple _true/false_ if interval has elapsed
* @param totalTicks
* @returns
*/
function ofTotalTicks(totalTicks, opts = {}) {
	const timerOpts = {
		...opts,
		timer: elapsedTicksAbsolute()
	};
	let t;
	return () => {
		t ??= relative(totalTicks, timerOpts);
		return t.elapsed;
	};
}
/**
* Returns a {@link ModulationTimer} that is always at 100%.
* Opposite: {@link timerNeverDone}.
* @returns
*/
const timerAlwaysDone = () => ({
	elapsed: 1,
	isDone: true,
	reset() {},
	mod(amt) {}
});
/**
* Returns a {@link ModulationTimer} that is always at 0%.
* Opposite: {@link timerAlwaysDone}.
* @returns
*/
const timerNeverDone = () => ({
	elapsed: 0,
	isDone: false,
	reset() {},
	mod() {}
});
/**
* Wraps a timer, returning a relative elapsed value based on
* a given total. ie. percentage complete toward a total value.
* This is useful because other parts of code don't need to know
* about the absolute time values, you get a nice relative completion number.
*
* If no timer is specified, a milliseconds-based timer is used.
*
* ```js
* const t = relative(1000);
* t.elapsed;   // returns % completion (0...1)
* ```
* It can also use a tick based timer
* ```js
* // Timer that is 'done' at 100 ticks
* const t = relative(100, { timer: ticksElapsedTimer() });
* ```
*
* Additional fields/methods on the timer instance
* ```js
* t.isDone;  // _true_ if .elapsed has reached (or exceeded) 1
* t.reset(); // start from zero again
* ```
*
* Options:
* * timer: timer to use. If not specified, `elapsedMillisecondsAbsolute()` is used.
* * clampValue: if _true_, return value is clamped to 0..1 (default: _false_)
* * wrapValue: if _true_, return value wraps around continously from 0..1..0 etc. (default: _false_)
*
* Note that `clampValue` and `wrapValue` are mutually exclusive: only one can be _true_, but both can be _false_.
*
* With options
* ```js
* // Total duration of 1000 ticks
* const t = Timer.relative(1000, { timer: ticksElapsedTimer(); clampValue:true });
* ```
*
* If `total` is Infinity, a 'always completed; timer is returned. Use a value of `NaN` for a
* timer that always returns 0.
* @private
* @param total Total (of milliseconds or ticks, depending on timer source)
* @param options Options
* @returns Timer
*/
const relative = (total, options = {}) => {
	if (!Number.isFinite(total)) return timerAlwaysDone();
	else if (Number.isNaN(total)) return timerNeverDone();
	const clampValue = options.clampValue ?? false;
	const wrapValue = options.wrapValue ?? false;
	if (clampValue && wrapValue) throw new Error(`clampValue and wrapValue cannot both be enabled`);
	let modulationAmount = 1;
	const timer = options.timer ?? elapsedMillisecondsAbsolute();
	let lastValue = 0;
	const computeElapsed = (value$1) => {
		lastValue = value$1;
		let v = value$1 / (total * modulationAmount);
		if (clampValue) v = clamp(v);
		else if (wrapValue && v >= 1) v = v % 1;
		return v;
	};
	return {
		mod(amt) {
			modulationAmount = amt;
		},
		get isDone() {
			return computeElapsed(lastValue) >= 1;
		},
		get elapsed() {
			return computeElapsed(timer.elapsed);
		},
		reset: () => {
			timer.reset();
		}
	};
};
/**
* A timer based on frequency: cycles per unit of time. These timers return a number from
* 0..1 indicating position with a cycle.
*
* In practice, timers are used to 'drive' something like an Oscillator.
*
* By default it uses elapsed clock time as a basis for frequency. ie., cycles per second.
*
* It returns a `ModulationTimer`, which allows for a modulation amount to be continually applied
* to the calculation of the 'position' within a cycle.
*
* @example Prints around 0/0.5 each second, as timer is half a cycle per second
* ```js
* const t = frequencyTimer(0.5);
* setInterval(() => {
*  console.log(t.elapsed);
* }, 1000);
* ```
* @param frequency Cycles
* @param options Options for timer
* @returns
*/
const frequencyTimer = (frequency, options = {}) => {
	const timer = options.timer ?? elapsedMillisecondsAbsolute();
	const cyclesPerSecond = frequency / 1e3;
	let modulationAmount = 1;
	const computeElapsed = () => {
		const v = timer.elapsed * (cyclesPerSecond * modulationAmount);
		const f = v - Math.floor(v);
		if (f < 0) throw new Error(`Unexpected cycle fraction less than 0. Elapsed: ${v} f: ${f}`);
		if (f > 1) throw new Error(`Unexpected cycle fraction more than 1. Elapsed: ${v} f: ${f}`);
		return f;
	};
	return {
		mod: (amt) => {
			modulationAmount = amt;
		},
		reset: () => {
			timer.reset();
		},
		get isDone() {
			return computeElapsed() >= 1;
		},
		get elapsed() {
			return computeElapsed();
		}
	};
};
/**
* A timer that uses clock time. Start time is from the point of invocation.
*
* ```js
* const t = elapsedMillisecondsAbsolute();
* t.reset(); // reset start
* t.elapsed; // milliseconds since start
* ```
* @returns {Timer}
* @see {ticksElapsedTimer}
*/
const elapsedMillisecondsAbsolute = () => {
	let start = performance.now();
	return {
		reset: () => {
			start = performance.now();
		},
		get elapsed() {
			return performance.now() - start;
		}
	};
};
/**
* A timer that progresses with each call to `elapsed`.
*
* The first call to elapsed will return 1.
*
* ```js
* const timer = elapsedTicksAbsolute();
* timer.reset(); // Reset to 0
* timer.elapsed; // Number of ticks (and also increment ticks)
* timer.peek;    // Number of ticks (without incrementing)
* ```
*
* Like other {@link Timer} functions, returns with a `isDone` field,
* but this will always return _true_.
* @returns {Timer}
* @see {elapsedMillisecondsAbsolute}
*/
const elapsedTicksAbsolute = () => {
	let start = 0;
	return {
		reset: () => {
			start = 0;
		},
		get peek() {
			return start;
		},
		get elapsed() {
			return ++start;
		}
	};
};
/**
* Wraps `timer`, computing a value based on its elapsed value.
* `fn` creates this value.
*
* ```js
* const t = timerWithFunction(v=>v/2, relativeTimer(1000));
* t.compute();
* ```
*
* In the above case, `relativeTimer(1000)` creates a timer that goes
* from 0..1 over one second. `fn` will divide that value by 2, so
* `t.compute()` will yield values 0..0.5.
*
* @param fn
* @param timer
* @returns
*/
const timerWithFunction = (fn, timer) => {
	if (typeof fn !== `function`) throw new Error(`Param 'fn' should be a function. Got: ${typeof fn}`);
	let startCount = 1;
	return {
		get elapsed() {
			return timer.elapsed;
		},
		get isDone() {
			return timer.isDone;
		},
		get runState() {
			if (timer.isDone) return `idle`;
			return `scheduled`;
		},
		get startCount() {
			return startCount;
		},
		get startCountTotal() {
			return startCount;
		},
		compute: () => {
			const elapsed = timer.elapsed;
			return fn(elapsed);
		},
		reset: () => {
			timer.reset();
			startCount++;
		}
	};
};

//#endregion
//#region ../flow/dist/src/update-outdated.js
/**
* Calls the async `fn` to generate a value if there is no prior value or
* `interval` has elapsed since value was last generated.
* @example
* ```js
* const f = updateOutdated(async () => {
*  const r = await fetch(`blah`);
*  return await r.json();
* }, 60*1000);
*
* // Result will be JSON from fetch. If fetch happened already in the
* // last 60s, return cached result. Otherwise it will fetch data
* const result = await f();
* ```
*
* Callback `fn` is passed how many milliseconds have elapsed since last update. Its minimum value will be `interval`.
*
* ```js
* const f = updateOutdated(async elapsedMs => {
*  // Do something with elapsedMs?
* }, 60*1000;
* ```
*
* There are different policies for what to happen if `fn` fails. `slow` is the default.
* * `fast`: Invocation will happen immediately on next attempt
* * `slow`: Next invocation will wait `interval` as if it was successful
* * `backoff`: Attempts will get slower and slower until next success. Interval is multipled by 1.2 each time.
*
* @param fn Async function to call. Must return a value.
* @param interval Maximum age of cached result
* @param updateFail `slow` by default
* @typeParam V - Return type of `fn`
* @returns Value
*/
const updateOutdated = (fn, interval, updateFail = `slow`) => {
	let lastRun = 0;
	let lastValue;
	let intervalMsCurrent = intervalToMs(interval, 1e3);
	return () => new Promise(async (resolve$1, reject) => {
		const elapsed = performance.now() - lastRun;
		if (lastValue === void 0 || elapsed > intervalMsCurrent) try {
			lastRun = performance.now();
			lastValue = await fn(elapsed);
			intervalMsCurrent = intervalToMs(interval, 1e3);
		} catch (error) {
			if (updateFail === `fast`) {
				lastValue = void 0;
				lastRun = 0;
			} else if (updateFail === `backoff`) intervalMsCurrent = Math.floor(intervalMsCurrent * 1.2);
			reject(error);
			return;
		}
		resolve$1(lastValue);
	});
};

//#endregion
//#region ../flow/dist/src/wait-for-value.js
/**
* Queue of a single item, only once, allows for simple synchronisation.
*
* It has a 'first write wins' behaviour
*
* ```js
* const q = new WaitForValue(); // or singleItem();
*
* // In some part of the code add a value
* const value = q.add(`some-val`);
*
* // Somewhere else, wait for value
* await q.get(value);
* ```
*
* It is not possible to `add` a second item (an exception will throw), however
* it is possible to call `get` as many times as you need.
*
* The `.isUsed` property allows you to to check if a value
* has been already added to the queue.
*
* Based on: https://2ality.com/2024/05/proposal-promise-with-resolvers.html
*/
var WaitForValue = class {
	#promise;
	#resolve;
	#written = false;
	constructor() {
		const { promise, resolve: resolve$1 } = promiseWithResolvers();
		this.#promise = promise;
		this.#resolve = resolve$1;
	}
	/**
	* Gets the promise
	* ```js
	* const wv = new WaitForValue();
	*
	* await wv.get();
	* ```
	* @returns
	*/
	get() {
		return this.#promise;
	}
	/**
	* Adds a value, triggering promise resolution.
	*
	* Throws an exception if queue has already been used. Use {@link isUsed} to check.
	* @param value
	*/
	add(value$1) {
		if (this.#written) throw new Error(`QueueSingleUse has already been used`);
		this.#written = true;
		this.#resolve(value$1);
	}
	/**
	* Returns _true_ if a value has been added
	* and therefore no more values can be written
	*/
	get isUsed() {
		return this.#written;
	}
};
/**
* {@inheritDoc WaitForValue}
*/
const singleItem = () => new WaitForValue();

//#endregion
//#region ../flow/dist/src/wait-for.js
/**
* Helper function for calling code that should fail after a timeout.
* In short, it allows you to signal when the function succeeded, to cancel it, or
* to be notified if it was canceled or completes.
*
* It does not execute or track the outcome of execution itself. Rather it's a bit
* of machinery that needs to be steered by your own logic.
*
* `waitFor` takes a timeout, and two lifecycle functions, `onAborted` and `onComplete`.
* `onAborted` is called if the timeout has elapsed. `onComplete` will run on either success or failure.
*
* ```js
* waitFor(1000,
* (error) => {
*  // Failed
* },
* (success) => {
*  if (success) {
*    // Succeeded
*  }
* });
* ```
*
* When calling `waitFor` you get back a function to signal success or failure:
* ```js
* const done = waitFor(1000, onAborted, onComplete);
* done();          // No parameters signals success
* done('failed');  // A string parameter indicates failure
* ```
*
* @example Compact
* ```js
* const done = waitFor(1000,
*  (reason) => {
*    console.log(`Aborted: ${reason}`);
*  });
*
* try {
*  runSomethingThatMightScrewUp();
*  done(); // Signal it succeeded
* } catch (e) {
*  done(e); // Signal there was an error
* }
* ```
*
* @example Verbose
* ```js
* // This function is called by `waitFor` if it was cancelled
* const onAborted = (reason:string) => {
*  // 'reason' is a string describing why it has aborted.
*  // ie: due to timeout or because done() was called with an error
* };
*
* // This function is called by `waitFor` if it completed
* const onComplete = (success:boolean) => {
*  // Called if we were aborted or finished succesfully.
*  // onComplete will be called after onAborted, if it was an error case
* }
*
* // If done() is not called after 1000, onAborted will be called
* // if done() is called or there was a timeout, onComplete is called
* const done = waitFor(1000, onAborted, onComplete);
*
* // Signal completed successfully (thus calling onComplete(true))
* done();
*
* // Signal there was an error (thus calling onAborted and onComplete(false))
* done(`Some error`);
* ```
*
* The completion handler is useful for removing event handlers.
*

* @param timeoutMs
* @param onAborted
* @param onComplete
* @returns
*/
const waitFor = (timeoutMs, onAborted, onComplete) => {
	let t;
	let success = false;
	const done = (error) => {
		if (t !== void 0) {
			window.clearTimeout(t);
			t = void 0;
		}
		if (error) onAborted(error);
		else success = true;
		if (onComplete !== void 0) onComplete(success);
	};
	t = globalThis.setTimeout(() => {
		t = void 0;
		try {
			onAborted(`Timeout after ${timeoutMs}ms`);
		} finally {
			if (onComplete !== void 0) onComplete(success);
		}
	}, timeoutMs);
	return done;
};

//#endregion
//#region ../flow/dist/src/state-machine/state-machine.js
/**
* Clones machine state
* @param toClone
* @returns Cloned of `toClone`
*/
const cloneState = (toClone) => {
	return Object.freeze({
		value: toClone.value,
		visited: [...toClone.visited],
		machine: toClone.machine
	});
};
/**
* Initialises a state machine. [Read more in the ixfx Guide](https://ixfx.fun/flow/state-machine/overview/)
*
* ```js
* const desc = {
*  pants: ['shoes','socks'],
*  socks: ['shoes', 'pants'],
*  shoes: 'shirt',
*  shirt: null
* }
*
* // Defaults to first key, 'pants'
* let sm = StateMachine.init(descr);
*
* // Move to 'shoes' state
* sm = StateMachine.to(sm, 'shoes');
* sm.state; // 'shoes'
* sm.visited; // [ 'pants' ]
*
* StateMachine.isDone(sm); // false
* StateMachine.possible(sm); // [ 'shirt' ]
* ```
* @param stateMachine Settings for state machine
* @param initialState Initial state name
* @returns
*/
const init = (stateMachine, initialState) => {
	const [machine, machineValidationError] = validateMachine(stateMachine);
	if (!machine) throw new Error(machineValidationError);
	const state = initialState ?? Object.keys(machine.states)[0];
	if (typeof machine.states[state] === `undefined`) throw new TypeError(`Initial state ('${state}') not found`);
	const transitions = validateAndNormaliseTransitions(machine.states);
	if (transitions === void 0) throw new Error(`Could not normalise transitions`);
	return Object.freeze({
		value: state,
		visited: [],
		machine: Object.freeze(Object.fromEntries(transitions))
	});
};
const reset = (sm) => {
	return init(sm.machine);
};
const validateMachine = (smOrTransitions) => {
	if (typeof smOrTransitions === `undefined`) return [void 0, `Parameter undefined`];
	if (smOrTransitions === null) return [void 0, `Parameter null`];
	if (`states` in smOrTransitions) return [smOrTransitions, ``];
	if (typeof smOrTransitions === `object`) return [{ states: smOrTransitions }, ``];
	return [void 0, `Unexpected type: ${typeof smOrTransitions}. Expected object`];
};
/**
* Returns _true_ if MachineState `sm` is in its final state.
* @param sm
* @returns
*/
const isDone = (sm) => {
	return possible(sm).length === 0;
};
/**
* Returns a list of possible state targets for `sm`, or
* an empty list if no transitions are possible.
* @param sm
* @returns
*/
const possibleTargets = (sm) => {
	validateMachineState(sm);
	const fromS = sm.machine[sm.value];
	if (fromS.length === 1 && fromS[0].state === null) return [];
	return fromS;
};
/**
* Returns a list of possible state names for `sm`, or
* an empty list if no transitions are possible.
*
* @param sm
* @returns
*/
const possible = (sm) => {
	const targets = possibleTargets(sm);
	return targets.map((v) => v.state);
};
const normaliseTargets = (targets) => {
	const normaliseSingleTarget = (target) => {
		if (target === null) return { state: null };
		if (typeof target === `string`) return { state: target };
		else if (typeof target === `object` && `state` in target) {
			const targetState = target.state;
			if (typeof targetState !== `string`) throw new TypeError(`Target 'state' field is not a string. Got: ${typeof targetState}`);
			if (`preconditions` in target) return {
				state: targetState,
				preconditions: target.preconditions
			};
			return { state: targetState };
		} else throw new Error(`Unexpected type: ${typeof target}. Expected string or object with 'state' field.`);
	};
	if (Array.isArray(targets)) {
		let containsNull = false;
		const mapResults = targets.map((t) => {
			const r = normaliseSingleTarget(t);
			if (!r) throw new Error(`Invalid target`);
			containsNull = containsNull || r.state === null;
			return r;
		});
		if (containsNull && mapResults.length > 1) throw new Error(`Cannot have null as an possible state`);
		return mapResults;
	} else {
		const target = normaliseSingleTarget(targets);
		if (!target) return;
		return [target];
	}
};
const validateAndNormaliseTransitions = (d) => {
	const returnMap = /* @__PURE__ */ new Map();
	for (const [topLevelState, topLevelTargets] of Object.entries(d)) {
		if (typeof topLevelState === `undefined`) throw new TypeError(`Top-level undefined state`);
		if (typeof topLevelTargets === `undefined`) throw new TypeError(`Undefined target state for ${topLevelState}`);
		if (returnMap.has(topLevelState)) throw new Error(`State defined twice: ${topLevelState}`);
		if (topLevelState.includes(` `)) throw new Error(`State names cannot contain spaces`);
		returnMap.set(topLevelState, []);
	}
	for (const [topLevelState, topLevelTargets] of Object.entries(d)) {
		const targets = normaliseTargets(topLevelTargets);
		if (targets === void 0) throw new Error(`Could not normalise target`);
		if (targets !== null) {
			const seenStates = /* @__PURE__ */ new Set();
			for (const target of targets) {
				if (seenStates.has(target.state)) throw new Error(`Target state '${target.state}' already exists for '${topLevelState}'`);
				seenStates.add(target.state);
				if (target.state === null) continue;
				if (!returnMap.has(target.state)) throw new Error(`Target state '${target.state}' is not defined as a top-level state. Defined under: '${topLevelState}'`);
			}
			returnMap.set(topLevelState, targets);
		}
	}
	return returnMap;
};
/**
* Validates machine state, throwing an exception if not valid
* and returning `StateTargetStrict`
* @param state
* @returns
*/
const validateMachineState = (state) => {
	if (typeof state === `undefined`) throw new TypeError(`Param 'state' is undefined`);
	if (typeof state.value !== `string`) throw new TypeError(`Existing state is not a string`);
};
/**
* Attempts to transition to a new state. Either a new
* `MachineState` is returned reflecting the change, or
* an exception is thrown.
*
* @example Attempts to transition to 'name-of-state'
* ```js
* const newState = StateMachine.to(currentState, `name-of-state`);
* ```
*
* Note that 'currentState' is not changed.
* @param sm
* @param toState
* @returns
*/
const to = (sm, toState) => {
	validateMachineState(sm);
	validateTransition(sm, toState);
	return Object.freeze({
		value: toState,
		machine: sm.machine,
		visited: unique([sm.visited, [sm.value]])
	});
};
const next = (sm) => {
	const first = possibleTargets(sm).at(0);
	if (!first || first.state === null) throw new Error(`Not possible to move to a next state from '${sm.value}`);
	return to(sm, first.state);
};
/**
* Returns _true_ if `toState` is a valid transition from current state of `sm`
* @param sm
* @param toState
* @returns
*/
const isValidTransition = (sm, toState) => {
	try {
		validateTransition(sm, toState);
		return true;
	} catch {
		return false;
	}
};
const validateTransition = (sm, toState) => {
	if (toState === null) throw new Error(`Cannot transition to null state`);
	if (typeof toState === `undefined`) throw new Error(`Cannot transition to undefined state`);
	if (typeof toState !== `string`) throw new TypeError(`Parameter 'toState' should be a string. Got: ${typeof toState}`);
	const p = possible(sm);
	if (p.length === 0) throw new Error(`Machine is in terminal state`);
	if (!p.includes(toState)) throw new Error(`Target state '${toState}' not available at current state '${sm.value}'. Possible states: ${p.join(`, `)}`);
};
/**
* Returns state transitions based on a list of strings.
* The last string is the terminal state.
*  A -> B -> C -> D
*
* See also: {@link fromListBidirectional}
*
* ```js
* const transitions = fromList([`a`, `b`, `c`, `d`]);
* // Object state machine with events
* const sm = new StateMachine.WithEvents(transitions);
* // OR, immutable state machine
* const sm = StateMachine.init(transitions);
* ```
* @param states List of states
* @return MachineDescription
*/
const fromList = (...states) => {
	const t = {};
	if (!Array.isArray(states)) throw new Error(`Expected array of strings`);
	if (states.length <= 2) throw new Error(`Expects at least two states`);
	for (let index = 0; index < states.length; index++) {
		const s = states[index];
		if (typeof s !== `string`) throw new TypeError(`Expected array of strings. Got type '${typeof s}' at index ${index.toString()}`);
		t[s] = index === states.length - 1 ? null : states[index + 1];
	}
	return t;
};
/**
* Returns a machine description based on a list of strings. Machine
* can go back and forth between states:
*  A <-> B <-> C <-> D
*
* See also {@link fromList}.
*
* ```js
* const transitions = fromListBidirectional([`a`, `b`, `c`, `d`]);
* // Object state machine with events
* const sm = new StateMachine.WithEvents(transitions);
* // OR, immutable state machine
* const sm = StateMachine.init(transitions);
* ```
* @param states
* @returns
*/
const fromListBidirectional = (...states) => {
	const t = {};
	if (!Array.isArray(states)) throw new Error(`Expected array of strings`);
	if (states.length < 2) throw new Error(`Expects at least two states`);
	for (const [index, s] of states.entries()) {
		if (typeof s !== `string`) throw new TypeError(`Expected array of strings. Got type '${typeof s}' at index ${index.toString()}`);
		t[s] = [];
	}
	for (let index = 0; index < states.length; index++) {
		const v = t[states[index]];
		if (index === states.length - 1) if (states.length > 1) v.push(states[index - 1]);
		else t[states[index]] = null;
		else {
			v.push(states[index + 1]);
			if (index > 0) v.push(states[index - 1]);
		}
	}
	return t;
};

//#endregion
//#region ../flow/dist/src/state-machine/driver.js
/**
* Drives a state machine.
*
* [Read more on the ixfx Guide](https://ixfx.fun/flow/state-machine/driver/)
*
* Uses a 'handlers' structure to determine when to change
* state and actions to take.
*
* The structure is a set of logical conditions: if we're in
* this state, then move to this other state etc.
*
* ```js
* const handlers = [
*  {
*    // If we're in the 'sleeping' state, move to next state
*    if: 'sleeping',
*    then: { next: true }
*  },
*  {
*    // If we're in the 'waking' state, randomly either go to 'resting' or 'sleeping' state
*    if: 'waking',
*    then: [
*      () => {
*        if (Math.random() > 0.5) {
*          return { next: 'resting' }
*        } else {
*          return { next: 'sleeping' }
*        }
*      }
*    ]
*   }
* ];
* ```
*
* Set up the driver, and call `run()` when you want to get
* the machine to change state or take action:
*
* ```js
* const driver = await StateMachine.driver(states, handlers);
* setInterval(async () => {
*  await driver.run(); // Note use of 'await' again
* }, 1000);
* ```
*
* Essentially, the 'handlers' structure gets run through each time `run()`
* is called.
*
* Defaults to selecting the highest-ranked result to determine
* what to do next.
* @param machine
* @param handlersOrOpts
* @returns
*/
async function driver(machine, handlersOrOpts) {
	const opts = Array.isArray(handlersOrOpts) ? { handlers: handlersOrOpts } : handlersOrOpts;
	const debug$1 = resolveLogOption(opts.debug, { category: `StateMachineDriver` });
	const byState = /* @__PURE__ */ new Map();
	for (const h of opts.handlers) {
		const ifBlock = Array.isArray(h.if) ? h.if : [h.if];
		for (const state of ifBlock) {
			if (typeof state !== `string`) throw new TypeError(`Expected single or array of strings for the 'if' field. Got: '${typeof state}'.`);
			if (byState.has(state)) throw new Error(`Multiple handlers defined for state '${state}'. There should be at most one.`);
			byState.set(state, h);
		}
	}
	const runOpts = {
		rank: (a, b) => {
			return defaultComparer(a.score ?? 0, b.score ?? 0);
		},
		shuffle: opts.shuffleHandlers ?? false
	};
	let sm = init(machine);
	for (const [ifState] of byState) if (typeof sm.machine[ifState] === `undefined` && ifState !== `__fallback`) throw new Error(`StateMachineDriver handler references a state ('${ifState}') which is not defined on the machine. Therefore this handler will never run.'`);
	const run$1 = async () => {
		debug$1(`Run. State: ${sm.value}`);
		const state = sm.value;
		let handler = byState.get(state);
		if (handler === void 0) {
			debug$1(`  No handler for state '${state}', trying __fallback`);
			handler = byState.get(`__fallback`);
		}
		if (handler === void 0) {
			debug$1(`  No __fallback handler`);
			return;
		}
		const runOptionsForHandler = handler.resultChoice === `first` ? {
			...runOpts,
			stop: (latest) => {
				if (!latest) return false;
				if (`reset` in latest) return true;
				if (`next` in latest && latest.next !== void 0) return true;
				return false;
			}
		} : runOpts;
		const results = await run(handler.then, runOptionsForHandler, sm);
		debug$1(`  In state '${sm.value}' results: ${results.length}. Choice: ${handler.resultChoice}`);
		let r;
		switch (handler.resultChoice ?? `highest`) {
			case `highest`: {
				r = results.at(-1);
				break;
			}
			case `first`: {
				r = results[0];
				break;
			}
			case `lowest`: {
				r = results.at(0);
				break;
			}
			case `random`: {
				r = randomElement(results);
				break;
			}
			default: throw new Error(`Unknown 'resultChoice' option: ${handler.resultChoice}. Expected highest, first, lowest or random`);
		}
		debug$1(`  Chosen result: ${JSON.stringify(r)}`);
		if (r?.reset) sm = reset(sm);
		else if (r && r.next) if (typeof r.next === `boolean`) sm = next(sm);
		else {
			debug$1(JSON.stringify(results));
			sm = to(sm, r.next);
		}
		return sm;
	};
	return {
		reset: () => {
			sm = reset(sm);
		},
		getValue: () => sm.value,
		run: run$1,
		to: (state) => {
			sm = to(sm, state);
			return sm;
		}
	};
}

//#endregion
//#region ../flow/dist/src/state-machine/with-events.js
/**
* A state machine that fires events when state changes.
*
* ```js
* const transitions = StateMachine.fromList(`a`, `b`, `c`);
* const m = new StateMachineWithEvents(transitions);
* m.addEventListener(`change`, event => {
*  console.log(`${event.priorState} -> ${event.newState}`);
* });
* m.addEventListener(`stop`, event => {
*  console.log(`State machine has reached final state`);
* });
* ```
*/
var StateMachineWithEvents = class extends SimpleEventEmitter {
	#sm;
	#smInitial;
	#debug;
	#isDoneNeedsFiring = false;
	#isDone = false;
	#changedAt = elapsedInfinity();
	/**
	* Create a state machine with initial state, description and options
	* @param m Machine description
	* @param opts Options for machine (defaults to `{debug:false}`)
	*/
	constructor(m, opts = {}) {
		super();
		this.#debug = opts.debug ?? false;
		this.#sm = init(m, opts.initial);
		this.#smInitial = cloneState(this.#sm);
	}
	#setIsDone(v) {
		if (this.#isDone === v) return;
		this.#isDone = v;
		if (v) {
			this.#isDoneNeedsFiring = true;
			setTimeout(() => {
				if (!this.#isDoneNeedsFiring) return;
				this.#isDoneNeedsFiring = false;
				this.fireEvent(`stop`, { state: this.#sm.value });
			}, 2);
		} else this.#isDoneNeedsFiring = false;
	}
	/**
	* Return a list of possible states from current state.
	*
	* If list is empty, no states are possible. Otherwise lists
	* possible states, including 'null' for terminal
	*/
	get statesPossible() {
		return possible(this.#sm);
	}
	/**
	* Return a list of all defined states
	*/
	get statesDefined() {
		return Object.keys(this.#sm.machine);
	}
	/**
	* Moves to the next state if possible. If multiple states are possible, it will use the first.
	* If machine is finalised, no error is thrown and null is returned.
	*
	* @returns {(string|null)} Returns new state, or null if machine is finalised
	*/
	next() {
		const p = possible(this.#sm);
		if (p.length === 0) return null;
		this.state = p[0];
		return p[0];
	}
	/**
	* Returns _true_ if state machine is in its final state
	*
	* @returns
	*/
	get isDone() {
		return isDone(this.#sm);
	}
	/**
	* Resets machine to initial state
	*/
	reset() {
		this.#setIsDone(false);
		this.#sm = cloneState(this.#smInitial);
		this.#changedAt = elapsedSince();
	}
	/**
	* Throws if it's not valid to transition to `newState`
	* @param newState
	* @returns
	*/
	validateTransition(newState) {
		validateTransition(this.#sm, newState);
	}
	/**
	* Returns _true_ if `newState` is valid transition from current state.
	* Use {@link validateTransition} if you want an explanation for the _false_ results.
	* @param newState
	* @returns
	*/
	isValid(newState) {
		return isValidTransition(this.#sm, newState);
	}
	/**
	* Gets or sets state. Throws an error if an invalid transition is attempted.
	* Use `isValid()` to check validity without changing.
	*
	* If `newState` is the same as current state, the request is ignored silently.
	*/
	set state(newState) {
		const priorState = this.#sm.value;
		if (newState === this.#sm.value) return;
		this.#sm = to(this.#sm, newState);
		if (this.#debug) console.log(`StateMachine: ${priorState} -> ${newState}`);
		this.#changedAt = elapsedSince();
		setTimeout(() => {
			this.fireEvent(`change`, {
				newState,
				priorState
			});
		}, 1);
		if (isDone(this.#sm)) this.#setIsDone(true);
	}
	get state() {
		return this.#sm.value;
	}
	/**
	* Returns timestamp when state was last changed.
	* See also `elapsed`
	*/
	get changedAt() {
		return this.#changedAt();
	}
	/**
	* Returns milliseconds elapsed since last state change.
	* See also `changedAt`
	*/
	get elapsed() {
		return this.#changedAt();
	}
};

//#endregion
//#region ../flow/dist/src/state-machine/index.js
var state_machine_exports = {};
__export(state_machine_exports, {
	StateMachineWithEvents: () => StateMachineWithEvents,
	cloneState: () => cloneState,
	driver: () => driver,
	fromList: () => fromList,
	fromListBidirectional: () => fromListBidirectional,
	init: () => init,
	isDone: () => isDone,
	isValidTransition: () => isValidTransition,
	next: () => next,
	normaliseTargets: () => normaliseTargets,
	possible: () => possible,
	possibleTargets: () => possibleTargets,
	reset: () => reset,
	to: () => to,
	validateMachine: () => validateMachine,
	validateTransition: () => validateTransition
});

//#endregion
//#region ../flow/dist/src/index.js
var src_exports = {};
__export(src_exports, {
	DispatchList: () => DispatchList,
	Pool: () => Pool,
	PoolUser: () => PoolUser,
	RequestResponseMatch: () => RequestResponseMatch,
	Resource: () => Resource,
	StateMachine: () => state_machine_exports,
	SyncWait: () => SyncWait,
	TaskQueueMutable: () => TaskQueueMutable,
	WaitForValue: () => WaitForValue,
	backoffGenerator: () => backoffGenerator,
	continuously: () => continuously,
	create: () => create,
	debounce: () => debounce,
	delay: () => delay,
	delayLoop: () => delayLoop,
	elapsedMillisecondsAbsolute: () => elapsedMillisecondsAbsolute,
	elapsedTicksAbsolute: () => elapsedTicksAbsolute,
	eventRace: () => eventRace,
	everyNth: () => everyNth,
	frequencyTimer: () => frequencyTimer,
	hasElapsed: () => hasElapsed,
	iterateBreadth: () => iterateBreadth,
	iterateDepth: () => iterateDepth,
	movingAverageTimed: () => movingAverageTimed,
	ofTotal: () => ofTotal,
	ofTotalTicks: () => ofTotalTicks,
	promiseWithResolvers: () => promiseWithResolvers,
	rateMinimum: () => rateMinimum,
	relative: () => relative,
	repeat: () => repeat,
	repeatSync: () => repeatSync,
	retryFunction: () => retryFunction,
	retryTask: () => retryTask,
	run: () => run,
	runOnce: () => runOnce,
	runSingle: () => runSingle,
	singleItem: () => singleItem,
	sleep: () => sleep,
	throttle: () => throttle,
	timeout: () => timeout,
	timerAlwaysDone: () => timerAlwaysDone,
	timerNeverDone: () => timerNeverDone,
	timerWithFunction: () => timerWithFunction,
	updateOutdated: () => updateOutdated,
	waitFor: () => waitFor
});

//#endregion
export { DispatchList, MapOfSimpleMutable, QueueImmutable, QueueMutable, StackImmutable, StateMachineWithEvents, connect$1 as connect, debounce, delayLoop, elapsedMillisecondsAbsolute, elapsedTicksAbsolute, eventRace, frequencyTimer, graph$1 as graph, init, mutable$2 as mutable, mutable$1, ofTotal, ofTotalTicks, rateMinimum, relative, repeat, retryFunction, retryTask, src_exports, src_exports$2 as src_exports$1, timeout, timerWithFunction, to, waitFor };
//# sourceMappingURL=src-BIfshA2g.js.map