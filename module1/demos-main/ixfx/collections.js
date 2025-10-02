import { __export } from "./chunk-51aI8Tpl.js";
import { integerTest, nullUndefTest, numberTest, resultIsError, resultThrow, stringTest } from "./src-BBD50Kth.js";
import { isPrimitive } from "./is-primitive-eBwrK4Yg.js";
import { intervalToMs, isEqualDefault, isEqualValueIgnoreOrder, toStringDefault } from "./interval-type-DajslxUJ.js";
import { addObjectEntriesMutate, addValue, addValueMutate, addValueMutator, deleteByValueCompareMutate, filterValues, findBySomeKey, findEntryByPredicate, findEntryByValue, findValue, fromIterable, fromObject, getClosestIntegerKey, getOrGenerate, getOrGenerateSync, hasAnyValue, hasKeyValue, mapToArray, mapToObjectTransform, mergeByKey, some, sortByValue, sortByValueProperty, toArray, toObject, transformMap, zipKeyValue } from "./basic-D0XoOdBJ.js";
import { SimpleEventEmitter, defaultKeyer, last as last$1, last$1 as last, map, max, min, toStringAbbreviate } from "./src-TlKlGoex.js";
import { containsDuplicateInstances, without } from "./src-BeVDUOoq.js";

//#region ../collections/src/circular-array.ts
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
//#region ../collections/src/queue/queue-fns.ts
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
//#region ../collections/src/queue/queue-mutable.ts
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
//#region ../collections/src/stack/StackFns.ts
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
//#region ../collections/src/stack/StackMutable.ts
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
//#region ../collections/src/tree/compare.ts
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
//#region ../collections/src/tree/tree-mutable.ts
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
	const entries = Object.entries(value$1);
	parent = parent === void 0 ? root() : addValue$1({
		label,
		value: value$1
	}, parent);
	for (const entry of entries) {
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
//#region ../collections/src/tree/traverse-object.ts
var traverse_object_exports = {};
__export(traverse_object_exports, {
	asDynamicTraversable: () => asDynamicTraversable,
	children: () => children,
	create: () => create$2,
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
function prettyPrintEntries(entries) {
	if (entries.length === 0) return `(empty)`;
	let t = ``;
	for (const [index, entry] of entries.entries()) {
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
	return wrap(create$2(node, options));
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
const create$2 = (node, options = {}) => {
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
	return stripParentage(create$2(node, options));
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
//#region ../collections/src/tree/pathed.ts
var pathed_exports = {};
__export(pathed_exports, {
	addValueByPath: () => addValueByPath,
	childrenLengthByPath: () => childrenLengthByPath,
	clearValuesByPath: () => clearValuesByPath,
	create: () => create$1,
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
const create$1 = (pathOpts = {}) => {
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
//#region ../collections/src/tree/traversable-tree.ts
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
		const entries = isTraversable(entry) ? [...entry.children()] : [...entry.childrenStore];
		stack.push(...entries);
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
//#region ../collections/src/tree/index.ts
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
//#region ../collections/src/stack/StackImmutable.ts
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
//#region ../collections/src/stack/index.ts
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
//#region ../collections/src/set/set-mutable.ts
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
//#region ../collections/src/set/SetImmutable.ts
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
//#region ../collections/src/set/massive-set.ts
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
	#getChild(value$1, create$3) {
		if (value$1 === void 0) throw new Error(`Param 'value' undefined`);
		if (this.#depth === this.#maxDepth) return this;
		if (value$1.length <= this.#depth) return this;
		const k = value$1[this.#depth];
		if (k === void 0) throw new Error(`Logic error. Depth: ${this.#depth} Len: ${value$1.length}`);
		let child = this.children.get(k);
		if (child === void 0 && create$3) {
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
//#region ../collections/src/set/index.ts
var set_exports = {};
__export(set_exports, {
	MassiveSet: () => MassiveSet,
	SetStringImmutable: () => SetStringImmutable,
	SetStringMutable: () => SetStringMutable,
	immutable: () => immutable$2,
	mutable: () => mutable$2
});

//#endregion
//#region ../collections/src/queue/priority-mutable.ts
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
//#region ../collections/src/queue/queue-immutable.ts
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
//#region ../collections/src/queue/index.ts
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
//#region ../collections/src/map/expiring-map.ts
/**
* Create a ExpiringMap instance
* @param options Options when creating map
* @returns
*/
const create = (options = {}) => new ExpiringMap(options);
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
		const entries = [...this.store.entries()];
		const prune = [];
		const intervalMs = intervalToMs(interval, 1e3);
		const now = performance.now();
		for (const entry of entries) {
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
//#region ../collections/src/map/map-multi-fns.ts
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
//#region ../collections/src/map/map-of-simple-base.ts
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
		for (const entries of this.map) yield* entries[1];
	}
	/**
	* Yields the values for each key in sequence, returning an array.
	* Use {@link valuesFlat} to iterate over all keys regardless of key.
	*/
	*values() {
		for (const entries of this.map) yield entries[1];
	}
	/**
	* Iterate over keys and length of values stored under keys
	*/
	*keysAndCounts() {
		for (const entries of this.map) yield [entries[0], entries[1].length];
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
//#region ../collections/src/map/map-of-simple-mutable.ts
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
		const entries = [...this.map.entries()];
		for (const keyEntries of entries) for (const values of keyEntries[1]) if (this.valueEq(values, value$1)) {
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
//#region ../collections/src/map/map-immutable-fns.ts
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
//#region ../collections/src/map/map.ts
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
//#region ../collections/src/map/map-mutable.ts
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
//#region ../collections/src/map/map-of-multi-impl.ts
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
//#region ../collections/src/map/map-of-set-mutable.ts
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
//#region ../collections/src/map/map-of-circular-mutable.ts
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
//#region ../collections/src/map/number-map.ts
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
//#region ../collections/src/map/map-of-array-mutable.ts
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
//#region ../collections/src/map/map-of-simple.ts
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
	addBatch(entries) {
		const temporary = new Map([...this.map.entries()].map((e) => [e[0], [...e[1]]]));
		for (const [key, list] of entries) {
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
		const entries = [...this.map.entries()];
		const eqFunction = eq ?? this.valueEq;
		const x = entries.map((entry) => {
			const key = entry[0];
			const values = entry[1].filter((vv) => !eqFunction(vv, value$1));
			return [key, values];
		});
		return new MapOfSimple(this.groupBy, this.valueEq, x);
	}
	delete(key) {
		const entries = [...this.map.entries()].filter((e) => e[0] !== key);
		return new MapOfSimple(this.groupBy, this.valueEq, entries);
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
//#region ../collections/src/map/index.ts
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
	expiringMap: () => create,
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
//#region ../collections/src/table.ts
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
//#region ../collections/src/graph/directed-graph.ts
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
function disconnect(graph$2, from, to) {
	resultThrow(graphTest(graph$2));
	const fromV = resolveVertex$1(graph$2, from);
	const toV = resolveVertex$1(graph$2, to);
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
function connectTo$1(graph$2, from, to, weight) {
	resultThrow(graphTest(graph$2));
	const fromResult = getOrCreate$1(graph$2, from);
	graph$2 = fromResult.graph;
	const toResult = getOrCreate$1(graph$2, to);
	graph$2 = toResult.graph;
	const edge = {
		id: to,
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
	const { to, weight, from } = options;
	const bidi = options.bidi ?? false;
	const toList = Array.isArray(to) ? to : [to];
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
//#region ../collections/src/graph/undirected-graph.ts
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
//#region ../collections/src/graph/index.ts
var graph_exports = {};
__export(graph_exports, {
	Directed: () => directed_graph_exports,
	Undirected: () => undirected_graph_exports
});

//#endregion
export { CircularArray, ExpiringMap, graph_exports as Graphs, MapOfSimpleMutable, map_exports as Maps, QueueImmutable, QueueMutable, queue_exports as Queues, SetStringImmutable, SetStringMutable, set_exports as Sets, StackImmutable, StackMutable, stack_exports as Stacks, Table, tree_exports as Trees };
//# sourceMappingURL=collections.js.map