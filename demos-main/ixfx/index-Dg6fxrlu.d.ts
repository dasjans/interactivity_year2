import { IsEqual } from "./is-equal-BzhoT7pd.js";
import { IWithEntries, Interval, KeyValue, ToString } from "./types-CcY4GIC4.js";
import { GetOrGenerate, MergeReconcile, addObjectEntriesMutate, addValue, addValueMutate, addValueMutator, deleteByValueCompareMutate, filterValues, findBySomeKey, findEntryByPredicate, findEntryByValue, findValue, fromIterable, fromObject, getClosestIntegerKey, getOrGenerate, getOrGenerateSync, hasAnyValue, hasKeyValue, mapToArray, mapToObjectTransform, mergeByKey, some, sortByValue, sortByValueProperty, toArray, toObject, transformMap, zipKeyValue } from "./maps-Di0k-jsW.js";
import { KeyValueSortSyles } from "./key-value-ww1DZidG.js";
import { SimpleEventEmitter } from "./index-CZIsUroQ.js";
import { NumbersComputeResult } from "./index-iwzx6A0f.js";

//#region ../collections/dist/src/circular-array.d.ts
interface ICircularArray<V> extends Array<V> {
  /**
   * Returns true if the array has filled to capacity and is now
   * recycling array indexes.
   */
  get isFull(): boolean;
  /**
   * Returns a new Circular with item added
   *
   * Items are added at `pointer` position, which automatically cycles through available array indexes.
   *
   * @param value Thing to add
   * @returns Circular with item added
   */
  add(value: V): ICircularArray<V>;
  get length(): number;
  /**
   * Returns the current add position of array.
   */
  get pointer(): number;
}
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
declare class CircularArray<V> extends Array {
  #private;
  constructor(capacity?: number);
  /**
   * Add to array
   * @param value Thing to add
   * @returns
   */
  add(value: V): CircularArray<V>;
  get pointer(): number;
  get isFull(): boolean;
}
//# sourceMappingURL=circular-array.d.ts.map
//#endregion
//#region ../collections/dist/src/tree/types.d.ts
/**
 * A labelled single value or array of values
 */
type LabelledValue<TValue> = LabelledSingleValue<TValue> | LabelledValues<TValue>;
/**
 * A value that is labelled
 * @see {@link LabelledValues}
 */
type LabelledSingleValue<TValue> = {
  label: string;
  value: TValue | undefined;
};
/**
 * A label for any number of values
 * @see {@link LabelledValues}
 */
type LabelledValues<TValue> = {
  label: string;
  values: TValue[];
};
/**
 * Array-backed tree node.
 *
 * Create using {@link Trees.Mutable.root}
 */
type TreeNode<TValue> = {
  /**
   * Parent node, or _undefined_ if a root
   */
  parent: TreeNode<TValue> | undefined;
  /**
   * Associated value
   */
  value: TValue | undefined;
  /**
   * Children of this node
   */
  childrenStore: readonly TreeNode<TValue>[];
};
type SimplifiedNode<TValue> = {
  /**
   * Value of node, or _undefined_ if it has no value
   */
  value: TValue | undefined;
  /**
   * Children nodes of this one
   */
  childrenStore: readonly SimplifiedNode<TValue>[];
};
/**
 * A node with an accompanying label
 */
type LabelledNode<TValue> = TreeNode<LabelledValue<TValue>>;
/**
 * Traversable Tree
 */
type TraversableTree<TValue> = {
  /**
   * Direct children of node
   */
  children(): IterableIterator<TraversableTree<TValue>>;
  /**
   * Direct parent of node
   */
  getParent(): TraversableTree<TValue> | undefined;
  /**
   * Value of node
   */
  getValue(): TValue;
  /**
   * Object reference that acts as the identity of the node
   */
  getIdentity(): any;
};
type TraverseObjectEntry = Readonly<{
  name: string;
  sourceValue: any;
  leafValue: any;
  _kind: `entry`;
}>;
type TraverseObjectEntryWithAncestors = Readonly<{
  name: string;
  sourceValue: any;
  leafValue: any;
  ancestors: string[];
  _kind: `entry-ancestors`;
}>;
type TraverseObjectEntryStatic = Readonly<{
  name: string;
  sourceValue: any;
  ancestors: string[];
  _kind: `entry-static`;
}>;
/**
 * Options for parsing a path
 */
type TraverseObjectPathOpts = {
  /**
   * Separator for path, eg '.'
   */
  readonly separator?: string;
};
/**
 * Wraps a {@link TreeNode} for a more object-oriented means of access.
 */
type WrappedNode<T> = TraversableTree<T> & {
  /**
   * Underlying Node
   */
  wraps: TreeNode<T>;
  /**
   * Gets value of node, if defined
   * @returns Value of Node
   */
  getValue: () => T | undefined;
  /**
   * Remove node and its children from tree
   * @returns
   */
  remove: () => void;
  /**
   * Adds a child node
   * @param child
   * @returns
   */
  add: (child: WrappedNode<T> | TreeNode<T>) => WrappedNode<T>;
  /**
   * Adds a new child node, with `value` as its value
   * @param value
   * @returns
   */
  addValue: (value: T) => WrappedNode<T>;
  /**
   * Returns _true_ if `child` is an immediate child of this node
   * @param child
   * @returns
   */
  hasChild: (child: WrappedNode<T> | TreeNode<T>) => boolean;
  queryValue: (value: T) => IterableIterator<WrappedNode<T>>;
  /**
  * Yields all parents of `child` that have a given value.
  * Use 'findParentsValue' to find the first match only.
  * @param child
  * @param value
  * @param eq
  * @returns
  */
  queryParentsValue<T>(child: TreeNode<T>, value: T, eq?: IsEqual<T>): IterableIterator<WrappedNode<T>>;
  /**
  * Returns the first parent that has a given value.
  * @param child
  * @param value
  * @param eq
  * @returns
  */
  findParentsValue<T>(child: TreeNode<T>, value: T, eq: IsEqual<T>): WrappedNode<T> | undefined;
  /**
   * Yields the node value of each parent of `child`.
   * _undefined_ values are not returned.
   *
   * Use 'queryParentsValue' to search for a particular value
   * @param child
   * @returns
   */
  parentsValues<T>(child: TreeNode<T>): IterableIterator<T>;
  /**
   * Returns _true_ if `child` is contained any any descendant
   * @param child
   * @returns
   */
  hasAnyChild: (child: WrappedNode<T> | TreeNode<T>) => boolean;
  /**
   * Returns _true_ if `parent` is the immediate parent for this node
   * @param parent
   * @returns
   */
  hasParent: (parent: WrappedNode<T> | TreeNode<T>) => boolean;
  /**
   * Returns _true_ if `parent` is the immediate or ancestor parent for this node
   * @param parent
   * @returns
   */
  hasAnyParent: (parent: WrappedNode<T> | TreeNode<T>) => boolean;
};
//# sourceMappingURL=types.d.ts.map
//#endregion
//#region ../collections/dist/src/tree/compare.d.ts
type DiffAnnotation<T> = {
  /**
   * In the case of changes, this is old value
   */
  a: TraversableTree<T>;
  /**
   * In the case of changes, this is the new value
   */
  b: TraversableTree<T>;
  /**
   * If true, this node's value has been modified
   */
  valueChanged: boolean;
  /**
   * If true, one of the child values has changed
   */
  childChanged: boolean;
  /**
   * List of new children
   */
  added: TraversableTree<T>[];
  /**
   * List of removed children
   */
  removed: TraversableTree<T>[];
};
type DiffNode<T> = TreeNode<DiffAnnotation<T>> & {
  toString: () => string;
};
declare const compare$1: <T>(a: TraversableTree<T>, b: TraversableTree<T>, eq?: IsEqual<T>, parent?: DiffNode<T>) => DiffNode<T>;
//# sourceMappingURL=compare.d.ts.map
declare namespace tree_mutable_d_exports {
  export { add, addValue$1 as addValue, asDynamicTraversable$1 as asDynamicTraversable, breadthFirst$1 as breadthFirst, children$1 as children, childrenLength$1 as childrenLength, childrenValues, compare, computeMaxDepth, createNode, depthFirst$2 as depthFirst, findAnyChildByValue$1 as findAnyChildByValue, findChildByValue$1 as findChildByValue, findParentsValue, followValue$1 as followValue, fromPlainObject, getRoot, hasAnyChild$1 as hasAnyChild, hasAnyParent$1 as hasAnyParent, hasChild$1 as hasChild, hasParent$1 as hasParent, nodeDepth, parents$1 as parents, parentsValues, queryByValue, queryParentsValue, remove, root, rootWrapped, setChildren, stripParentage, throwTreeTest, toStringDeep$2 as toStringDeep, treeTest, value, wrap };
}
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
declare const compare: <T>(a: TreeNode<T>, b: TreeNode<T>, eq?: IsEqual<T>) => DiffNode<T>;
/**
 * Converts `TreeNode` to `SimplifiedNode`, removing the 'parent' fields.
 * This can be useful because if you have the whole tree, the parent field
 * is redundant and because it makes circular references can make dumping to console etc more troublesome.
 *
 * Recursive: strips parentage of all children and so on too.
 * @param node
 * @returns
 */
declare const stripParentage: <T>(node: TreeNode<T>) => SimplifiedNode<T>;
/**
 * Wraps node `n` for a more object-oriented means of access.
 * It will wrap child nodes on demand. For this reason, WrappedNode object
 * identity is not stable
 * @param n Node to wrap
 * @returns
 */
declare const wrap: <T>(n: TreeNode<T>) => WrappedNode<T>;
/**
 * Removes `child` from the tree structure it is in.
 * It removes `child` from its parent. Any sub-children of `child` still remain connected.
 * @param child
 * @returns
 */
declare const remove: <T>(child: TreeNode<T>) => void;
/**
 * Depth-first iteration of the children of `node`
 * @param node
 * @returns
 */
declare function depthFirst$2<T>(node: TreeNode<T>): IterableIterator<TreeNode<T>>;
/**
 * Breadth-first iteration of the children of `node`
 * @param node
 * @returns
 */
declare function breadthFirst$1<T>(node: TreeNode<T>): IterableIterator<TreeNode<T>>;
/**
 * Validates the tree from `root` downwards.
 * @param root
 * @param seen
 * @returns
 */
declare function treeTest<T>(root: TreeNode<T>, seen?: TreeNode<T>[]): [ok: boolean, msg: string, node: TreeNode<T>];
/**
 * Throws an exception if `root` fails tree validation
 * @param root
 * @returns
 */
declare function throwTreeTest<T>(root: TreeNode<T>): void;
/**
 * Iterate over direct children of `root`, yielding {@link TreeNode} instances.
 * Use {@link childrenValues} to iterate over child values
 * @param root
 */
declare function children$1<T>(root: TreeNode<T>): IterableIterator<TreeNode<T>>;
/**
 * Iterate over the value ofdirect children of `root`.
 * Use {@link children} if you want to iterate over {@link TreeNode} instances instead.
 * @param root
 */
declare function childrenValues<T>(root: TreeNode<T>): IterableIterator<T>;
/**
 * Iterate over all parents of `root`. First result is the immediate parent.
 * @param root
 */
declare function parents$1<T>(root: TreeNode<T>): IterableIterator<TreeNode<T>>;
/**
 * Returns the depth of `node`. A root node (ie. with no parents) has a depth of 0.
 * @param node
 * @returns
 */
declare function nodeDepth(node: TreeNode<any>): number;
declare const hasChild$1: <T>(child: TreeNode<T>, parent: TreeNode<T>) => boolean;
/**
 * Returns the first immediate child of `parent` that matches `value`.
 *
 * Use {@link queryByValue} if you want all matching children.
 * @param value
 * @param parent
 * @param eq
 * @returns
 */
declare const findChildByValue$1: <T>(value: T, parent: TreeNode<T>, eq?: IsEqual<T>) => TreeNode<T> | undefined;
/**
 * Yield all immediate children of `parent` that match `value`.
 *
 * Use {@link findChildByValue} if you only want the first matching child.
 * @param value
 * @param parent
 * @param eq
 */
declare function queryByValue<T>(value: T, parent: TreeNode<T>, eq?: IsEqual<T>): IterableIterator<TreeNode<T>>;
/**
 * Returns _true_ if `prospectiveChild` is some child node of `parent`,
 * anywhere in the tree structure.
 *
 * Use {@link hasChild} to only check immediate children.
 * @param prospectiveChild
 * @param parent
 * @returns
 */
declare const hasAnyChild$1: <T>(prospectiveChild: TreeNode<T>, parent: TreeNode<T>) => boolean;
declare const findAnyChildByValue$1: <T>(value: T, parent: TreeNode<T>, eq?: IsEqual<T>) => TreeNode<T> | undefined;
declare const getRoot: <T>(node: TreeNode<T>) => TreeNode<T>;
/**
 * Returns _true_ if `prospectiveParent` is any ancestor
 * parent of `child`.
 *
 * Use {@link hasParent} to only check immediate parent.
 * @param child
 * @param prospectiveParent
 * @returns
 */
declare const hasAnyParent$1: <T>(child: TreeNode<T>, prospectiveParent: TreeNode<T>) => boolean;
/**
 * Yields the node value of each parent of `child`.
 * _undefined_ values are not returned.
 *
 * Use {@link queryParentsValue} to search for a particular value
 * @param child
 * @returns
 */
declare function parentsValues<T>(child: TreeNode<T>): Generator<T & ({} | null), boolean, unknown>;
/**
 * Yields all parents of `child` that have a given value.
 * Use {@link findParentsValue} to find the first match only.
 * @param child
 * @param value
 * @param eq
 * @returns
 */
declare function queryParentsValue<T>(child: TreeNode<T>, value: T, eq?: IsEqual<T>): Generator<TreeNode<T>, boolean, unknown>;
/**
 * Returns the first parent that has a given value.
 * @param child
 * @param value
 * @param eq
 * @returns
 */
declare function findParentsValue<T>(child: TreeNode<T>, value: T, eq?: IsEqual<T>): TreeNode<T> | undefined;
/**
 * Returns _true_ if `prospectiveParent` is the immediate
 * parent of `child`.
 *
 * Use {@link hasAnyParent} to check for any ancestor parent.
 * @param child
 * @param prospectiveParent
 * @returns
 */
declare const hasParent$1: <T>(child: TreeNode<T>, prospectiveParent: TreeNode<T>) => boolean;
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
declare const computeMaxDepth: <T>(node: TreeNode<T>) => number;
declare const add: <T>(child: TreeNode<T>, parent: TreeNode<T>) => void;
declare const addValue$1: <T>(value: T | undefined, parent: TreeNode<T>) => TreeNode<T>;
/**
 * Creates the root for a tree, with an optional `value`.
 * Use {@link rootWrapped} if you want a more object-oriented mode of access.
 * @param value
 * @returns
 */
declare const root: <T>(value?: T) => TreeNode<T>;
declare const fromPlainObject: (value: Record<string, any>, label?: string, parent?: TreeNode<any>, seen?: any[]) => TreeNode<LabelledSingleValue<any>>;
/**
 * Creates a tree, returning it as a {@link WrappedNode} for object-oriented access.
 * Use {@link Trees.Mutable.root} alternatively.
 * @param value
 * @returns
 */
declare const rootWrapped: <T>(value: T | undefined) => WrappedNode<T>;
/**
 * Creates a `TreeNode` instance with a given value and parent.
 * Parent node, if specified, has its `childrenStore` property changed to include new child.
 * @param value
 * @param parent
 * @returns
 */
declare const createNode: <T>(value: T | undefined, parent?: TreeNode<T>) => TreeNode<T>;
declare const childrenLength$1: <T>(node: TreeNode<T>) => number;
declare const value: <T>(node: TreeNode<T>) => T | undefined;
/**
 * Projects `node` as a dynamic traversable.
 * Dynamic in the sense that it creates the traversable project for nodes on demand.
 * A consequence is that node identities are not stable.
 * @param node
 * @returns
 */
declare const asDynamicTraversable$1: <T>(node: TreeNode<T>) => TraversableTree<T>;
declare const setChildren: <T>(parent: TreeNode<T>, children: TreeNode<T>[]) => void;
declare const toStringDeep$2: <T>(node: TreeNode<T>, indent?: number) => string;
declare function followValue$1<T>(root: TreeNode<T>, continuePredicate: (nodeValue: T, depth: number) => boolean, depth?: number): IterableIterator<T | undefined>;
//# sourceMappingURL=tree-mutable.d.ts.map
declare namespace pathed_d_exports {
  export { PathOpts, addValueByPath, childrenLengthByPath, clearValuesByPath, create$2 as create, removeByPath, valueByPath, valuesByPath };
}
/**
 * Options for parsing a path
 */
type PathOpts = Readonly<{
  /**
   * Separator for path, eg '.'
   */
  separator: string;
  /**
   * If two values are stored at same path, what to do? Default: overwrite
   * * overwrite: last-write wins
   * * ignore: first-write wins
   * * allow: allow multiple values
   */
  duplicates: `overwrite` | `allow` | `ignore`;
}>;
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
declare const create$2: <T>(pathOpts?: Partial<PathOpts>) => {
  getRoot: () => TreeNode<LabelledValue<T>> | undefined;
  add: (value: T, path: string) => void;
  prettyPrint: () => string;
  remove: (path: string) => boolean;
  getValue: (path: string) => T | undefined;
  getValues: (path: string) => T[];
  hasPath: (path: string) => boolean;
  childrenLength: (path: string) => number;
  getNode: (path: string) => LabelledNode<T> | undefined;
  clearValues: (path: string) => boolean;
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
declare const addValueByPath: <T>(value: T, path: string, node?: LabelledNode<T>, pathOpts?: Partial<PathOpts>) => LabelledNode<T>;
declare const removeByPath: <T>(path: string, root: LabelledNode<T>, pathOpts?: Partial<PathOpts>) => boolean;
declare const clearValuesByPath: <T>(path: string, root: LabelledNode<T>, pathOpts?: Partial<PathOpts>) => boolean;
declare const childrenLengthByPath: <T>(path: string, node: LabelledNode<T>, pathOpts?: Partial<PathOpts>) => number;
declare const valueByPath: <T>(path: string, node: LabelledNode<T>, pathOpts?: Partial<PathOpts>) => T | undefined;
declare const valuesByPath: <T>(path: string, node: LabelledNode<T>, pathOpts?: Partial<PathOpts>) => T[];
//# sourceMappingURL=pathed.d.ts.map
declare namespace traverse_object_d_exports {
  export { ChildrenOptions, CreateOptions, asDynamicTraversable, children, create$1 as create, createSimplified, createWrapped, depthFirst$1 as depthFirst, getByPath, prettyPrint, prettyPrintEntries, toStringDeep$1 as toStringDeep, traceByPath };
}
/**
 * Helper function to get a 'friendly' string representation of an array of {@link TraverseObjectEntry}.
 * @param entries
 * @returns
 */
declare function prettyPrintEntries(entries: readonly TraverseObjectEntry[]): string;
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
declare const prettyPrint: (node: object, indent?: number, options?: Partial<ChildrenOptions>) => string;
/**
 * Returns a debug string representation of the node (recursive)
 * @param node
 * @param indent
 * @returns
 */
declare const toStringDeep$1: (node: TreeNode<TraverseObjectEntry | TraverseObjectEntryStatic>, indent?: number) => string;
type ChildrenOptions = Readonly<{
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
declare function children(node: object, options?: Partial<ChildrenOptions>): IterableIterator<TraverseObjectEntry>;
declare function depthFirst$1(node: object, options?: Partial<ChildrenOptions>, ancestors?: string[]): IterableIterator<TraverseObjectEntryWithAncestors>;
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
declare function getByPath(path: string, node: object, options?: TraverseObjectPathOpts): TraverseObjectEntryWithAncestors;
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
declare function traceByPath(path: string, node: object, options?: TraverseObjectPathOpts): Iterable<TraverseObjectEntryWithAncestors>;
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
declare const asDynamicTraversable: (node: object, options?: Partial<ChildrenOptions>, ancestors?: string[], parent?: TraversableTree<TraverseObjectEntryStatic>) => TraversableTree<TraverseObjectEntryStatic>;
/**
 * Reads all fields and sub-fields of `node`, returning as a 'wrapped' tree structure.
 * @param node
 * @param options
 * @returns
 */
declare const createWrapped: (node: object, options: Partial<CreateOptions>) => WrappedNode<any>;
type CreateOptions = {
  name: string;
  /**
   * If _true_, only leaf nodes have values. This avoids repetition (important
   * when comparing trees), with semantics being in the tree itself.
   *
   * When _false_ (default) values get decomposed down the tree. This
   * makes it easy to get all the data for a branch of the tree.
   *
   *
   * Eg if storing { person: { address { state: `qld` } } }
   * When _true_, the tree would be:
   * ```
   * person, value: undefined
   *  + address, value: undefined
   *    + state, value: 'qld'
   * ```
   * But when _false_, the tree would be:
   * ```
   * person, value: { address: { state: `qld } }
   *  + address, value: { state: `qld` }
   *    + state, value: `qld`
   * ```
   */
  valuesAtLeaves: boolean;
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
declare const create$1: (node: object, options?: Partial<CreateOptions>) => TreeNode<TraverseObjectEntryStatic>;
/**
 * Returns a copy of `node` with its (and all its children's) parent information removed.
 * @param node
 * @param options
 * @returns
 */
declare const createSimplified: (node: object, options?: Partial<CreateOptions>) => SimplifiedNode<TraverseObjectEntryStatic>;
//# sourceMappingURL=traverse-object.d.ts.map
declare namespace traversable_tree_d_exports {
  export { breadthFirst, childrenLength, couldAddChild, depthFirst, find, findAnyChildByValue, findAnyParentByValue, findByValue, findChildByValue, findParentByValue, followValue, hasAnyChild, hasAnyChildValue, hasAnyParent, hasAnyParentValue, hasChild, hasChildValue, hasParent, hasParentValue, parents, siblings, toString, toStringDeep };
}
declare const childrenLength: <T>(tree: TraversableTree<T>) => number;
/**
 * Returns _true_ if `child` is parented at any level (grand-parented etc) by `possibleParent`
 * @param child Child being sought
 * @param possibleParent Possible parent of child
 * @param eq Equality comparison function {@link isEqualDefault} used by default
 * @returns
 */
declare const hasAnyParent: <T extends TraversableTree<TV> | TreeNode<TV>, TV>(child: T, possibleParent: T, eq?: IsEqual<T>) => boolean;
declare const hasAnyParentValue: <T extends TraversableTree<TV> | TreeNode<TV>, TV>(child: T, possibleParentValue: TV, eq?: IsEqual<TV>) => boolean;
declare const findAnyParentByValue: <TValue>(child: TraversableTree<TValue>, possibleParentValue: TValue, eq?: IsEqual<TValue>) => TraversableTree<TValue> | undefined;
/**
 * Returns _true_ if `child` exists within `possibleParent`. By default it only looks at the immediate
 * parent (maxDepth: 0). Use Number.MAX_SAFE_INTEGER for searching recursively upwards (or {@link hasAnyParent})
 * @param child Child being sought
 * @param possibleParent Possible parent of child
 * @param maxDepth Max depth of traversal. Default of 0 only looks for immediate parent.
 * @param eq Equality comparison function. {@link isEqualDefault} used by default.
 * @returns
 */
declare const hasParent: <T extends TraversableTree<TV> | TreeNode<TV>, TV>(child: T, possibleParent: T, eq?: IsEqual<T>, maxDepth?: number) => boolean;
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
declare const hasParentValue: <T extends TraversableTree<TV> | TreeNode<TV>, TV>(child: T, possibleParentValue: TV, eq?: IsEqual<TV>, maxDepth?: number) => boolean;
declare const findParentByValue: <T extends TraversableTree<TV> | TreeNode<TV>, TV>(child: T, possibleParentValue: TV, eq?: IsEqual<TV>, maxDepth?: number) => T | undefined;
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
declare const couldAddChild: <T>(parent: TraversableTree<T>, prospectiveChild: TraversableTree<T>, eq?: IsEqual<TraversableTree<T>>) => void;
/**
 * Returns _true_ if _possibleChild_ is contained within _parent_ tree.
 * That is, it is any sub-child.
 * @param parent Parent tree
 * @param possibleChild Sought child
 * @param eq Equality function, or {@link isEqualDefault} if undefined.
 * @returns
 */
declare const hasAnyChild: <T extends TraversableTree<TV> | TreeNode<TV>, TV>(parent: T, possibleChild: T, eq?: IsEqual<T>) => boolean;
declare const hasAnyChildValue: <T>(parent: TraversableTree<T>, possibleChildValue: T, eq?: IsEqual<T>) => boolean;
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
declare const hasChild: <T extends TraversableTree<TV> | TreeNode<TV>, TV>(parent: T, possibleChild: T, eq?: IsEqual<T>, maxDepth?: number) => boolean;
declare const hasChildValue: <T>(parent: TraversableTree<T>, possibleValue: T, eq?: IsEqual<T>, maxDepth?: number) => boolean;
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
declare function siblings<T>(node: TraversableTree<T>): IterableIterator<TraversableTree<T>>;
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
declare function parents<T extends TraversableTree<TV> | TreeNode<TV>, TV>(node: T): IterableIterator<T>;
/**
 * Descends `parent`, breadth-first, looking for a particular value.
 * Returns _undefined_ if not found.
 * @param parent
 * @param possibleValue
 * @param eq
 * @returns
 */
declare function findAnyChildByValue<T extends TraversableTree<TV> | TreeNode<TV>, TV>(parent: T, possibleValue: TV, eq?: IsEqual<TV>): T | undefined;
/**
 * Searches breadth-first for `possibleValue` under and including `parent`.
 * `maxDepth` sets he maximum level to which the tree is searched.
 * @param parent
 * @param possibleValue
 * @param eq
 * @param maxDepth
 * @returns
 */
declare function findChildByValue<T extends TraversableTree<TV> | TreeNode<TV>, TV>(parent: T, possibleValue: TV, eq?: IsEqual<TV>, maxDepth?: number): T | undefined;
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
declare function depthFirst<T extends TraversableTree<TV> | TreeNode<TV>, TV>(root: T): Generator<T>;
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
declare function breadthFirst<T extends TraversableTree<TV> | TreeNode<TV>, TV>(root: T, depth?: number): IterableIterator<T>;
/**
 * Applies `predicate` to `root` and all its child nodes, returning the node where
 * `predicate` yields _true_.
 * Use {@link findByValue} to find a node by its value
 * @param root
 * @param predicate
 * @param order Iterate children by breadth or depth. Default 'breadth'
 * @returns
 */
declare function find<T>(root: TraversableTree<T>, predicate: (node: TraversableTree<T>) => boolean, order?: `breadth` | `depth`): TraversableTree<T> | undefined;
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
declare function findByValue<T>(root: TraversableTree<T>, predicate: (nodeValue: T) => boolean, order?: `breadth` | `depth`): TraversableTree<T> | undefined;
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
declare function followValue<T>(root: TraversableTree<T>, continuePredicate: (nodeValue: T, depth: number) => boolean, depth?: number): IterableIterator<T>;
declare function toStringDeep<T>(node: TraversableTree<T>, depth?: number): string;
declare function toString(...nodes: TraversableTree<any>[]): string;
//# sourceMappingURL=traversable-tree.d.ts.map
declare namespace index_d_exports$4 {
  export { DiffAnnotation, DiffNode, traverse_object_d_exports as FromObject, LabelledNode, LabelledSingleValue, LabelledValue, LabelledValues, tree_mutable_d_exports as Mutable, pathed_d_exports as Pathed, SimplifiedNode, TraversableTree, traversable_tree_d_exports as Traverse, TraverseObjectEntry, TraverseObjectEntryStatic, TraverseObjectEntryWithAncestors, TraverseObjectPathOpts, TreeNode, WrappedNode, compare$1 as compare, isTraversable, isTreeNode, toTraversable };
}
/**
 * Makes a 'traversable' to move around a {@link TreeNode}, an existing {@link TraversableTree} or a plain object.
 *
 * @param node
 * @returns
 */
declare const toTraversable: <T>(node: TreeNode<T> | TraversableTree<T> | object) => TraversableTree<any>;
/**
 * Checks whether `node` is of type {@link TreeNode}.
 *
 * Checks for: parent, childrenStore and value defined on `node`.
 * @param node
 * @returns
 */
declare const isTreeNode: (node: any) => node is TreeNode<any>;
/**
 * Checks if `node` is of type {@link TraversableTree}.
 *
 * Checks by looking for: children, getParent, getValue and getIdentity defined on `node`.
 * @param node
 * @returns
 */
declare const isTraversable: (node: any) => node is TraversableTree<any>;
//# sourceMappingURL=index.d.ts.map
//#endregion
//#region ../collections/dist/src/types.d.ts
/**
 * Key-value pairs in an array
 * @see {@link ObjectKeys}
 */
type ArrayKeys<K, V> = readonly (readonly [key: K, value: V])[];
/**
 * Key-value pairs in object form
 * @see {@link ArrayKeys}
 */
type ObjectKeys<K, V> = readonly {
  readonly key: K;
  readonly value: V;
}[];
/**
 * Type that represents key-values in object or array form
 */
type EitherKey<K, V> = ArrayKeys<K, V> | ObjectKeys<K, V>;
/**
 * A table value or _undefined_
 */
type TableValue<V> = V | undefined;
/**
 * A row of table values
 */
type TableRow<V> = TableValue<V>[];
//# sourceMappingURL=types.d.ts.map

//#endregion
//#region ../collections/dist/src/stack/IStack.d.ts
/**
 * Stack (immutable)
 *
 * @example Overview
 * ```js
 * stack.push(item); // Return a new stack with item(s) added
 * stack.pop();      // Return a new stack with top-most item removed (ie. newest)
 * stack.peek;       // Return what is at the top of the stack or undefined if empty
 * stack.isEmpty;
 * stack.isFull;
 * stack.length;     // How many items in stack
 * stack.data;       // Get the underlying array
 * ```
 *
 * @example
 * ```js
 * let sanga = new Stack();
 * sanga = sanga.push(`bread`, `tomato`, `cheese`);
 * sanga.peek;  // `cheese`
 * sanga = sanga.pop(); // removes `cheese`
 * sanga.peek;  // `tomato`
 * const sangaAlt = sanga.push(`lettuce`, `cheese`); // sanga stays [`bread`, `tomato`], while sangaAlt is [`bread`, `tomato`, `lettuce`, `cheese`]
 * ```
 *
 * Stack can also be created from the basis of an existing array. First index of array will be the bottom of the stack.
 * @class Stack
 * @typeParam V - Type of stored items
 */
interface IStack<V> {
  /**
   * Enumerates stack from bottom-to-top
   *
   */
  forEach(fn: (v: V) => void): void;
  /**
   * Enumerates stack from top-to-bottom
   * @param fn
   */
  forEachFromTop(fn: (v: V) => void): void;
  get data(): readonly V[];
  /**
   * _True_ if stack is empty
   */
  get isEmpty(): boolean;
  /**
   * _True_ if stack is at its capacity. _False_ if not, or if there is no capacity.
   */
  get isFull(): boolean;
  /**
   * Get the item at the top of the stack without removing it (like `pop` would do)
   * @returns Item at the top of the stack, or _undefined_ if empty.
   */
  get peek(): V | undefined;
  /**
   * Number of items in stack
   */
  get length(): number;
}
//# sourceMappingURL=IStack.d.ts.map
//#endregion
//#region ../collections/dist/src/stack/IStackMutable.d.ts
/**
 * Stack (mutable)
 *
 * @example Overview
 * ```
 * stack.push(item); // Add one or more items to the top of the stack
 * stack.pop(); // Removes and retiurns the item at the top of the stack (ie the newest thing)
 * stack.peek; // Return what is at the top of the stack or undefined if empty
 * stack.isEmpty/.isFull;
 * stack.length; // How many items in stack
 * stack.data; // Get the underlying array
 * ```
 *
 * @example
 * ```
 * const sanga = new MutableStack();
 * sanga.push(`bread`, `tomato`, `cheese`);
 * sanga.peek;  // `cheese`
 * sanga.pop(); // removes `cheese`
 * sanga.peek;  // `tomato`
 * sanga.push(`lettuce`, `cheese`); // Stack is now [`bread`, `tomato`, `lettuce`, `cheese`]
 * ```
 *
 * Stack can also be created from the basis of an existing array. First index of array will be the bottom of the stack.
 * @typeParam V - Type of stored items
 */
interface IStackMutable<V> extends IStack<V> {
  /**
   * Add items to the 'top' of the stack.
   *
   * @param toAdd Items to add.
   * @returns How many items were added
   */
  push(...toAdd: readonly V[]): number;
  /**
   * Remove and return item from the top of the stack, or _undefined_ if empty.
   * If you just want to find out what's at the top, use {@link peek}.
   */
  pop(): V | undefined;
}
//# sourceMappingURL=IStackMutable.d.ts.map
//#endregion
//#region ../collections/dist/src/stack/IStackImmutable.d.ts
interface IStackImmutable<V> extends IStack<V> {
  push(...toAdd: readonly V[]): IStackImmutable<V>;
  pop(): IStackImmutable<V>;
}
//# sourceMappingURL=IStackImmutable.d.ts.map
//#endregion
//#region ../collections/dist/src/stack/Types.d.ts
type StackDiscardPolicy = `older` | `newer` | `additions`;
type StackOpts = {
  readonly debug?: boolean;
  readonly capacity?: number;
  readonly discardPolicy?: StackDiscardPolicy;
};
//# sourceMappingURL=Types.d.ts.map
//#endregion
//#region ../collections/dist/src/stack/StackImmutable.d.ts
declare class StackImmutable<V> implements IStackImmutable<V> {
  private readonly opts;
  readonly data: ReadonlyArray<V>;
  constructor(opts?: StackOpts, data?: ReadonlyArray<V>);
  push(...toAdd: ReadonlyArray<V>): StackImmutable<V>;
  pop(): IStackImmutable<V>;
  forEach(fn: (v: V) => void): void;
  forEachFromTop(fn: (v: V) => void): void;
  get isEmpty(): boolean;
  get isFull(): boolean;
  get peek(): V | undefined;
  get length(): number;
}
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
declare const immutable$3: <V>(options?: StackOpts, ...startingItems: ReadonlyArray<V>) => IStackImmutable<V>;
//# sourceMappingURL=StackImmutable.d.ts.map
//#endregion
//#region ../collections/dist/src/stack/StackMutable.d.ts
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
declare class StackMutable<V> implements IStackMutable<V> {
  readonly opts: StackOpts;
  data: readonly V[];
  constructor(opts?: StackOpts, data?: readonly V[]);
  /**
   * Push data onto the stack.
   * If `toAdd` is empty, nothing happens
   * @param toAdd Data to add
   * @returns Length of stack
   */
  push(...toAdd: readonly V[]): number;
  forEach(fn: (v: V) => void): void;
  forEachFromTop(fn: (v: V) => void): void;
  pop(): V | undefined;
  get isEmpty(): boolean;
  get isFull(): boolean;
  get peek(): V | undefined;
  get length(): number;
}
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
declare const mutable$3: <V>(opts?: StackOpts, ...startingItems: readonly V[]) => IStackMutable<V>;
//# sourceMappingURL=StackMutable.d.ts.map
//#endregion
//#region ../collections/dist/src/stack/StackFns.d.ts
declare const trimStack: <V>(opts: StackOpts, stack: ReadonlyArray<V>, toAdd: ReadonlyArray<V>) => ReadonlyArray<V>;
declare const push: <V>(opts: StackOpts, stack: ReadonlyArray<V>, ...toAdd: ReadonlyArray<V>) => ReadonlyArray<V>;
declare const pop: <V>(opts: StackOpts, stack: ReadonlyArray<V>) => ReadonlyArray<V>;
/**
 * Peek at the top of the stack (end of array)
 *
 * @typeParam V - Type of stored items
 * @param {StackOpts} opts
 * @param {V[]} stack
 * @returns {(V | undefined)}
 */
declare const peek$1: <V>(opts: StackOpts, stack: ReadonlyArray<V>) => V | undefined;
declare const isEmpty$1: <V>(opts: StackOpts, stack: ReadonlyArray<V>) => boolean;
declare const isFull$1: <V>(opts: StackOpts, stack: ReadonlyArray<V>) => boolean;
//# sourceMappingURL=StackFns.d.ts.map
declare namespace index_d_exports$5 {
  export { IStack, IStackImmutable, IStackMutable, StackDiscardPolicy, StackImmutable, StackMutable, StackOpts, immutable$3 as immutable, isEmpty$1 as isEmpty, isFull$1 as isFull, mutable$3 as mutable, peek$1 as peek, pop, push, trimStack };
}
//#endregion
//#region ../collections/dist/src/set/Types.d.ts
type ValueSetEventMap<V> = {
  readonly add: {
    readonly value: V;
    readonly updated: boolean;
  };
  readonly clear: boolean;
  readonly delete: V;
};
//# sourceMappingURL=Types.d.ts.map

//#endregion
//#region ../collections/dist/src/set/ISetMutable.d.ts
/**
 * A Set which stores unique items determined by their value, rather
 * than object reference (unlike the default JS Set). Create with {@link Sets.mutable}. Mutable.
 *
 * By default the `JSON.stringify()` representation is considered the 'key' for an object.
 * Pass in a function to `Sets.mutable` to define your own way of creating keys for values. The principle should
 * be that objects that you consider identical should have the same string key value.
 *
 * ISetMutable fires `add`, `clear` and `delete` events.
 *
 * @example Overview of functions
 * ```js
 * const s = Sets.mutable();
 * s.add(item);    // Add one or more items. Items with same key are overriden.
 * s.has(item);    // Returns true if item value is present
 * s.clear();      // Remove everything
 * s.delete(item); // Delete item by value
 * s.toArray();    // Returns values as an array
 * s.values();     // Returns an iterator over values
 * s.size;         // Number of items stored in set
 * ```
 *
 * @example Example usage
 * ```js
 * // Data to add
 * const people = [
 *  {name: `Barry`, city: `London`}
 *  {name: `Sally`, city: `Bristol`}
 * ];
 *
 * // Create a set, defining how keys will be generated
 * const set = Sets.mutable(person => {
 *    // Key person objects by name and city.
 *    // ie. Generated keys will be: `Barry-London`, `Sally-Bristol`
 *    return `${person.name}-${person.city}`
 * });
 *
 * // Add list
 * set.add(...people);
 *
 * // Demo:
 * set.has({name:`Barry`, city:`Manchester`})); // False, key is different (Barry-Manchester)
 * set.has({name:`Barry`, city:`London`}));     // True, we have Barry-London as a key
 * set.has(people[1]);   // True, key of object is found (Sally-Bristol)
 * ```
 *
 * @example
 * Events
 * ```js
 * set.addEventListener(`add`, ev => {
 *  console.log(`New item added: ${ev.value}`);
 * });
 * ```
 *
 * @typeParam V - Type of data stored
 */
interface ISetMutable<V> extends SimpleEventEmitter<ValueSetEventMap<V>> {
  /**
   * Add `values` to set.
   * Corresponding keys will be generated according to the
   * function provided to `setMutable`, or `JSON.stringify` by default.
   * @param values Value(s) to add
   * @returns _true_ if something new was added
   */
  add(...values: readonly V[]): boolean;
  /**
   * Iterate over values
   * ```js
   * for (let value of set.values()) {
   *    // use value...
   * }
   * ```
   */
  values(): IterableIterator<V>;
  /**
   * Clears set
   */
  clear(): void;
  /**
   * Deletes specified value, if present.
   * @param value
   * @returns True if value was found
   */
  delete(value: V): boolean;
  /**
   * Returns _true_ if _value_ is contained in Set
   * @param value
   */
  has(value: V): boolean;
  /**
   * Returns an array of values
   */
  toArray(): readonly V[];
  /**
   * Returns the number of items stored in the set
   */
  get size(): number;
}
//# sourceMappingURL=ISetMutable.d.ts.map
//#endregion
//#region ../collections/dist/src/set/set-mutable.d.ts
/**
 * Creates a {@link ISetMutable}.
 * @param keyString Function that produces a key based on a value. If unspecified, uses `JSON.stringify`
 * @returns
 */
declare const mutable$2: <V>(keyString?: ToString<V>) => ISetMutable<V>;
/**
 * Mutable string set
 */
declare class SetStringMutable<V> extends SimpleEventEmitter<ValueSetEventMap<V>> implements ISetMutable<V> {
  store: Map<string, V>;
  keyString: ToString<V>;
  /**
   * Constructor
   * @param keyString Function which returns a string version of added items. If unspecified `JSON.stringify`
   */
  constructor(keyString: ToString<V> | undefined);
  /**
   * Number of items stored in set
   */
  get size(): number;
  /**
   * Adds one or more items to set. `add` event is fired for each item
   * @param values items to add
   */
  add(...values: V[]): boolean;
  /**
   * Returns values from set as an iterable
   * @returns
   */
  values(): MapIterator<V>;
  /**
   * Clear items from set
   */
  clear(): void;
  /**
   * Delete value from set.
   * @param v Value to delete
  * @returns _True_ if item was found and removed
   */
  delete(v: V): boolean;
  /**
   * Returns _true_ if item exists in set
   * @param v
   * @returns
   */
  has(v: V): boolean;
  /**
   * Returns array copy of set
   * @returns Array copy of set
   */
  toArray(): V[];
}
//# sourceMappingURL=set-mutable.d.ts.map
//#endregion
//#region ../collections/dist/src/set/ISet.d.ts
interface ISet<V> {
  has(v: V): boolean;
  get size(): number;
  values(): IterableIterator<V>;
  /**
   * Returns an array of values
   */
  toArray(): readonly V[];
}
//# sourceMappingURL=ISet.d.ts.map

//#endregion
//#region ../collections/dist/src/set/ISetImmutable.d.ts
/**
 * A Set which stores unique items determined by their value, rather
 * than object reference (unlike the default JS Set). Create with {@link Sets.mutable}. Immutable.
 *
 * By default the `JSON.stringify()` representation is considered the 'key' for an object.
 * Pass in a function to `setMutable` to define your own way of creating keys for values. The principle should
 * be that objects that you consider identical should have the same string key value.
 *
 * The {@link Sets.ISetMutable} alternative also has events for monitoring changes.
 *
 * @example Overview of functions
 * ```js
 * const s = Sets.mutable();
 * s.add(item);    // Add one or more items. Items with same key are overriden.
 * s.has(item);    // Returns true if item value is present
 * s.clear();      // Remove everything
 * s.delete(item); // Delete item by value
 * s.toArray();    // Returns values as an array
 * s.values();     // Returns an iterator over values
 * s.size;         // Returns number of items in set
 * ```
 *
 * @example Example usage
 * ```js
 * // Data to add
 * const people = [
 *  {name: `Barry`, city: `London`}
 *  {name: `Sally`, city: `Bristol`}
 * ];
 *
 * // Create a set, defining how keys will be generated
 * let s = Sets.mutable(person => {
 *    // Key person objects by name and city.
 *    // ie. Generated keys will be: `Barry-London`, `Sally-Bristol`
 *    return `${person.name}-${person.city}`
 * });
 *
 * // Add list - since it's immutable, a changed copy is returned
 * s = s.add(...people);
 *
 * // Accessing: has/get
 * s.has({name:`Barry`, city:`Manchester`})); // False, key is different (Barry-Manchester)
 * s.has({name:`Barry`, city:`London`}));     // True, we have Barry-London as a key
 * s.has(people[1]);   // True, key of object is found (Sally-Bristol)
 *
 * // Deleting (returns changed copy)
 * s = s.delete({name:`Barry`, city:`London`});
 * ```
 *
 * @typeParam V - Type of data stored
 */
interface ISetImmutable<V> extends ISet<V> {
  add(...values: readonly V[]): ISetImmutable<V>;
  delete(v: V): ISetImmutable<V>;
}
//# sourceMappingURL=ISetImmutable.d.ts.map
//#endregion
//#region ../collections/dist/src/set/SetImmutable.d.ts
declare class SetStringImmutable<V> implements ISetImmutable<V> {
  private store;
  private keyString;
  constructor(keyString?: ToString<V>, map?: Map<string, V>);
  get size(): number;
  add(...values: readonly V[]): ISetImmutable<V>;
  delete(v: V): ISetImmutable<V>;
  has(v: V): boolean;
  toArray(): V[];
  values(): Generator<V, void, unknown>;
}
/**
 * Immutable set that uses a `keyString` function to determine uniqueness
 *
 * @param keyString Function that produces a key based on a value. If unspecified, uses `JSON.stringify`.
 * @returns
 */
declare const immutable$2: <V>(keyString?: ToString<V>) => ISetImmutable<V>;
//# sourceMappingURL=SetImmutable.d.ts.map

//#endregion
//#region ../collections/dist/src/set/massive-set.d.ts
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
declare class MassiveSet {
  #private;
  children: Map<string, MassiveSet>;
  values: Array<string>;
  constructor(maxDepth?: number, depth?: number);
  /**
   * Returns the number of values stored in just this level of the set
   * @returns
   */
  sizeLocal(): number;
  /**
   * Returns the number of branches at this node
   * Use {@link sizeChildrenDeep} to count all branches recursively
   * @returns
   */
  sizeChildren(): number;
  sizeChildrenDeep(): number;
  /**
   * Returns the total number of values stored in the set
   */
  size(): number;
  add(value: string): void;
  remove(value: string): boolean;
  debugDump(): void;
  /**
   * Returns _true_ if `value` stored on this node
   * @param value
   * @returns
   */
  hasLocal(value: string): boolean;
  has(value: string): boolean;
}
//# sourceMappingURL=massive-set.d.ts.map
declare namespace index_d_exports$6 {
  export { ISetImmutable, ISetMutable, MassiveSet, SetStringImmutable, SetStringMutable, ValueSetEventMap, immutable$2 as immutable, mutable$2 as mutable };
}
//#endregion
//#region ../collections/dist/src/queue/iqueue-mutable.d.ts
type QueueMutableEvents<V> = {
  /**
   * Data has been added
   * * added: data attempted to be added. Note: not all of it may have been accepted into queue
   * * finalData: actual state of queue
   */
  enqueue: {
    added: readonly V[];
    finalData: readonly V[];
  };
  /**
   * Single item dequeued.
   * When dequeing the 'removed' event also fires
   */
  dequeue: {
    removed: V;
    finalData: readonly V[];
  };
  /**
   * One or more items removed due to dequeuing, clearing or removeWhere called
   */
  removed: {
    removed: readonly V[];
    finalData: readonly V[];
  };
};
interface IQueueMutableWithEvents<V> extends IQueueMutable<V>, SimpleEventEmitter<QueueMutableEvents<V>> {}
/**
 * Queue (mutable). See also {@link IQueueImmutable} for the immutable version.
 *
 * Queues are useful if you want to treat 'older' or 'newer'
 * items differently. _Enqueing_ adds items at the back of the queue, while
 * _dequeing_ removes items from the front (ie. the oldest).
 *
 * ```js
 * const q = queue();       // Create
 * q.enqueue(`a`, `b`);     // Add two strings
 * const front = q.dequeue();  // `a` is at the front of queue (oldest)
 * ```
 *
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = queue({capacity: 5, discardPolicy: `newer`});
 * ```
 *
 */
interface IQueueMutable<V> {
  /**
   * Dequeues (removes oldest item / item at front of queue)
   *
   * Use {@link peek} to look at the item at front of queue without removing it.
   * @returns Item, or undefined if queue is empty
   */
  readonly dequeue: () => V | undefined;
  /**
   * Enqueues (adds items to back of queue).
   * If a capacity is set, not all items might be added.
   * @returns How many items were added
   */
  readonly enqueue: (...toAdd: readonly V[]) => number;
  /**
  * Returns a copy of data in queue as an array
  */
  toArray(): readonly V[];
  /**
   * Returns front of queue (oldest item), or _undefined_ if queue is empty
   */
  get peek(): V | undefined;
  /**
   * Number of items in queue
   */
  get length(): number;
  /**
   * Is queue full? Returns _false_ if no capacity has been set
   */
  get isFull(): boolean;
  /**
  * Returns true if queue is empty
  */
  get isEmpty(): boolean;
  /**
   * Removes values that match `predicate`.
   *
   * ```js
   * // Eg queue of strings, compare by value
   * queue.removeWhere(v => v === `someValue`);
   *
   * // Eg queue of objects, compare by reference
   * queue.removeWhere(v => v === someTarget);
   *
   * // Eg use ixfx function to compare value of objects, regardless of key ordering
   * queue.removeWhere(v => isEqualValueIgnoreOrder(v, someTarget));
   * ```
   * @param predicate
   * @returns Returns number of items removed.
   */
  removeWhere(predicate: (item: V) => boolean): number;
  /**
   * Returns the item at given rank (0 being front of queue)
   * @param index
   */
  at(index: number): V;
  /**
   * Clears the queue
   */
  clear(): void;
}
//# sourceMappingURL=iqueue-mutable.d.ts.map
//#endregion
//#region ../collections/dist/src/queue/ipriority-queue-mutable.d.ts
/**
 * A prioritised item in queue
 */
type PriorityItem<V> = Readonly<{
  /**
   * Item
   */
  item: V;
  /**
   * Priority
   */
  priority: number;
}>;
interface IPriorityQueueMutable<V> extends IQueueMutable<PriorityItem<V>> {
  /**
   * Dequeues the item with highest priority.
   */
  dequeueMax(): V | undefined;
  /**
   * Dequeues the item with the lowest priority.
   */
  dequeueMin(): V | undefined;
  /**
   * Peeks at the item with highest priority without removing it.
   * _undefined_ if queue is empty.
   */
  peekMax(): V | undefined;
  /**
   * Peeks at the item with the lowest priority without removing it.
   * _undefined_ if queue is empty.
   */
  peekMin(): V | undefined;
}
//# sourceMappingURL=ipriority-queue-mutable.d.ts.map
//#endregion
//#region ../collections/dist/src/queue/iqueue-immutable.d.ts
/**
 * Queue (immutable). See also {@link QueueMutable}.
 *
 * Queues are useful if you want to treat 'older' or 'newer'
 * items differently. _Enqueing_ adds items at the back of the queue, while
 * _dequeing_ removes items from the front (ie. the oldest).
 *
 * ```js
 * let q = queue();           // Create
 * q = q.enqueue(`a`, `b`);   // Add two strings
 * const front = q.peek;      // `a` is at the front of queue (oldest)
 * q = q.dequeue();           // q now just consists of `b`
 * ```
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = queue({capacity: 5, discardPolicy: `newer`});
 * ```
 *
 */
interface IQueueImmutable<V> {
  /**
   * Enumerates queue from back-to-front
   *
   */
  forEach(fn: (v: V) => void): void;
  /**
   * Enumerates queue from front-to-back
   * @param fn
   */
  forEachFromFront(fn: (v: V) => void): void;
  /**
   * Returns a new queue with item(s) added
   * @param toAdd Items to add
   */
  enqueue(...toAdd: ReadonlyArray<V>): IQueueImmutable<V>;
  /**
   * Dequeues (removes oldest item / item at front of queue).
   * Use {@link peek} to get item that will be removed.
   *
   * @returns Queue with item removed
   */
  dequeue(): IQueueImmutable<V>;
  /**
   * Returns true if queue is empty
   */
  get isEmpty(): boolean;
  /**
   * Is queue full? Returns _false_ if no capacity has been set
   */
  get isFull(): boolean;
  /**
   * Number of items in queue
   */
  get length(): number;
  /**
   * Returns front of queue (oldest item), or _undefined_ if queue is empty
   */
  get peek(): V | undefined;
  /**
   * Returns a copy of data in queue as an array
   */
  toArray(): Array<V>;
}
//# sourceMappingURL=iqueue-immutable.d.ts.map
//#endregion
//#region ../collections/dist/src/queue/queue-types.d.ts
type QueueDiscardPolicy = `older` | `newer` | `additions`;
/**
 * Queue options.
 *
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = Queues.mutable({capacity: 5, discardPolicy: `newer`});
 * ```
 */
type QueueOpts<V> = {
  readonly eq?: IsEqual<V>;
  /**
   * @private
   */
  readonly debug?: boolean;
  /**
   * Capcity limit
   */
  readonly capacity?: number;
  /**
   * Default is `additions`, meaning new items are discarded.
   *
   * `older`: Removes items front of the queue (ie older items are discarded)
   *
   * `newer`: Remove from rear of queue to make space for new items (ie newer items are discarded)
   *
   * `additions`: Only adds new items that there are room for (ie. brand new items are discarded)
   *
   */
  readonly discardPolicy?: QueueDiscardPolicy;
};
//# sourceMappingURL=queue-types.d.ts.map

//#endregion
//#region ../collections/dist/src/queue/queue-mutable.d.ts
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
declare class QueueMutable<V> extends SimpleEventEmitter<QueueMutableEvents<V>> implements IQueueMutable<V> {
  readonly options: QueueOpts<V>;
  data: readonly V[];
  eq: IsEqual<V>;
  constructor(opts?: QueueOpts<V>, data?: readonly V[]);
  clear(): void;
  /**
   * Called when all data is cleared
   */
  protected onClear(): void;
  at(index: number): V;
  enqueue(...toAdd: readonly V[]): number;
  protected onEnqueue(result: readonly V[], attemptedToAdd: readonly V[]): void;
  dequeue(): V | undefined;
  protected onRemoved(removed: readonly V[], finalData: readonly V[]): void;
  /**
   * Removes values that match `predicate`.
   * @param predicate
   * @returns Returns number of items removed.
   */
  removeWhere(predicate: (item: V) => boolean): number;
  /**
  * Return a copy of the array
  * @returns
  */
  toArray(): V[];
  get isEmpty(): boolean;
  get isFull(): boolean;
  get length(): number;
  get peek(): V | undefined;
}
/**
 * Creates a new QueueMutable
 * @param options
 * @param startingItems
 * @returns
 */
declare function mutable$1<V>(options?: QueueOpts<V>, ...startingItems: readonly V[]): IQueueMutableWithEvents<V>;
//# sourceMappingURL=queue-mutable.d.ts.map
//#endregion
//#region ../collections/dist/src/queue/priority-mutable.d.ts
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
declare class PriorityMutable<V> extends QueueMutable<PriorityItem<V>> implements IPriorityQueueMutable<V> {
  constructor(opts?: QueueOpts<PriorityItem<V>>);
  /**
   * Adds an item with a given priority
   * @param item Item
   * @param priority Priority (higher numeric value means higher priority)
   */
  enqueueWithPriority(item: V, priority: number): void;
  changePriority(item: V, priority: number, addIfMissing?: boolean, eq?: IsEqual<V>): void;
  dequeueMax(): V | undefined;
  dequeueMin(): V | undefined;
  peekMax(): V | undefined;
  peekMin(): V | undefined;
}
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
declare function priority<V>(opts?: QueueOpts<PriorityItem<V>>): IPriorityQueueMutable<V>;
//# sourceMappingURL=priority-mutable.d.ts.map
//#endregion
//#region ../collections/dist/src/queue/queue-immutable.d.ts
declare class QueueImmutable<V> implements IQueueImmutable<V> {
  #private;
  readonly opts: QueueOpts<V>;
  /**
   * Creates an instance of Queue.
   * @param {QueueOpts} opts Options foor queue
   * @param {V[]} data Initial data. Index 0 is front of queue
   */
  constructor(opts?: QueueOpts<V>, data?: readonly V[]);
  forEach(fn: (v: V) => void): void;
  forEachFromFront(fn: (v: V) => void): void;
  enqueue(...toAdd: readonly V[] | V[]): QueueImmutable<V>;
  dequeue(): QueueImmutable<V>;
  get isEmpty(): boolean;
  get isFull(): boolean;
  get length(): number;
  get peek(): V | undefined;
  toArray(): V[];
}
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
declare const immutable$1: <V>(options?: QueueOpts<V>, ...startingItems: readonly V[]) => IQueueImmutable<V>;
//# sourceMappingURL=queue-immutable.d.ts.map
//#endregion
//#region ../collections/dist/src/queue/queue-fns.d.ts
declare const debug: (opts: QueueOpts<any>, message: string) => void;
declare const trimQueue: <V>(opts: QueueOpts<V>, queue: ReadonlyArray<V>, toAdd: ReadonlyArray<V>) => ReadonlyArray<V>;
/**
 * Adds to the back of the queue (last array index)
 * Last item of `toAdd` will potentially be the new end of the queue (depending on capacity limit and overflow policy)
 * @typeParam V - Type of values
 * @param {QueueOpts} opts
 * @param {V[]} queue
 * @param {...V[]} toAdd
 * @returns {V[]}
 */
declare const enqueue: <V>(opts: QueueOpts<V>, queue: ReadonlyArray<V>, ...toAdd: ReadonlyArray<V>) => ReadonlyArray<V>;
declare const dequeue: <V>(opts: QueueOpts<V>, queue: ReadonlyArray<V>) => ReadonlyArray<V>;
/**
 * Returns front of queue (oldest item), or undefined if queue is empty
 *
 * @typeParam V - Type of values stored
 * @param {QueueOpts} opts
 * @param {V[]} queue
 * @returns {(V | undefined)}
 */
declare const peek: <V>(opts: QueueOpts<V>, queue: ReadonlyArray<V>) => V | undefined;
declare const isEmpty: <V>(opts: QueueOpts<V>, queue: ReadonlyArray<V>) => boolean;
declare const isFull: <V>(opts: QueueOpts<V>, queue: ReadonlyArray<V>) => boolean;
//# sourceMappingURL=queue-fns.d.ts.map
declare namespace index_d_exports$7 {
  export { IPriorityQueueMutable, IQueueImmutable, IQueueMutable, IQueueMutableWithEvents, PriorityItem, PriorityMutable, QueueDiscardPolicy, QueueImmutable, QueueMutable, QueueMutableEvents, QueueOpts, debug, dequeue, enqueue, immutable$1 as immutable, isEmpty, isFull, mutable$1 as mutable, peek, priority, trimQueue };
}
//#endregion
//#region ../collections/dist/src/map/expiring-map.d.ts
/**
 * Expiring map options
 */
type Opts = {
  /**
   * Capacity limit
   */
  readonly capacity?: number;
  /**
   * Policy for evicting items if capacity is reached
   */
  readonly evictPolicy?: `none` | `oldestGet` | `oldestSet`;
  /**
   * Automatic deletion policy.
   * none: no automatic deletion (default)
   * get/set: interval based on last get/set
   * either: if either interval has elapsed
   */
  readonly autoDeletePolicy?: `none` | `get` | `set` | `either`;
  /**
   * Automatic deletion interval
   */
  readonly autoDeleteElapsedMs?: number;
};
/**
 * Event from the ExpiringMap
 */
type ExpiringMapEvent<K, V> = {
  readonly key: K;
  readonly value: V;
};
type ExpiringMapEvents<K, V> = {
  /**
   * Fires when an item is removed due to eviction
   * or automatic expiry
   */
  readonly expired: ExpiringMapEvent<K, V>;
  /**
   * Fires when a item with a new key is added
   */
  readonly newKey: ExpiringMapEvent<K, V>;
  /**
   * Fires when an item is manually removed,
   * removed due to eviction or automatic expiry
   */
  readonly removed: ExpiringMapEvent<K, V>;
};
/**
 * Create a ExpiringMap instance
 * @param options Options when creating map
 * @returns
 */
declare const create: <K, V>(options?: Opts) => ExpiringMap<K, V>;
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
declare class ExpiringMap<K, V> extends SimpleEventEmitter<ExpiringMapEvents<K, V>> {
  #private;
  private capacity;
  private store;
  private evictPolicy;
  private autoDeleteElapsedMs;
  private autoDeletePolicy;
  private autoDeleteTimer;
  private disposed;
  constructor(opts?: Opts);
  dispose(): void;
  /**
   * Returns the number of keys being stored.
   */
  get keyLength(): number;
  entries(): IterableIterator<[k: K, v: V]>;
  values(): IterableIterator<V>;
  keys(): IterableIterator<K>;
  /**
   * Returns the elapsed time since `key`
   * was set. Returns _undefined_ if `key`
   * does not exist
   */
  elapsedSet(key: K): number | undefined;
  /**
   * Returns the elapsed time since `key`
   * was accessed. Returns _undefined_ if `key`
   * does not exist
   */
  elapsedGet(key: K): number | undefined;
  /**
   * Returns true if `key` is stored.
   * Does not affect the key's last access time.
   * @param key
   * @returns
   */
  has(key: K): boolean;
  /**
   * Gets an item from the map by key, returning
   * undefined if not present
   * @param key Key
   * @returns Value, or undefined
   */
  get(key: K): V | undefined;
  /**
   * Deletes the value under `key`, if present.
   *
   * Returns _true_ if something was removed.
   * @param key
   * @returns
   */
  delete(key: K): boolean;
  /**
   * Clears the contents of the map.
   * Note: does not fire `removed` event
   */
  clear(): void;
  /**
   * Updates the lastSet/lastGet time for a value
   * under `k`.
   *
   * Returns false if key was not found
   * @param key
   * @returns
   */
  touch(key: K): boolean;
  private findEvicteeKey;
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
  deleteWithElapsed(interval: Interval, property: `get` | `set` | `either`): [k: K, v: V][];
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
  set(key: K, value: V): void;
}
//# sourceMappingURL=expiring-map.d.ts.map
//#endregion
//#region ../collections/dist/src/map/imap-of.d.ts
interface IMapOf<V> {
  /**
   * Iterates over all keys
   */
  keys(): IterableIterator<string>;
  /**
   * Iterates over all values stored under `key`
   * @param key
   */
  get(key: string): IterableIterator<V>;
  /**
   * Iterates over all values, regardless of key.
   * Same value may re-appear if it's stored under different keys.
   */
  valuesFlat(): IterableIterator<V>;
  /**
   * Iterates over key-value pairs.
   * Unlike a normal map, the same key may appear several times.
   */
  entriesFlat(): IterableIterator<readonly [key: string, value: V]>;
  entries(): IterableIterator<[key: string, value: V[]]>;
  /**
   * Iteates over all keys and the count of values therein
   */
  keysAndCounts(): IterableIterator<readonly [string, number]>;
  /**
   * Returns _true_ if `value` is stored under `key`.
   *
   * @param key Key
   * @param value Value
   */
  hasKeyValue(key: string, value: V, eq?: IsEqual<V>): boolean;
  /**
   * Returns _true_ if `key` has any values
   * @param key
   */
  has(key: string): boolean;
  /**
   * Returns _true_ if the map is empty
   */
  get isEmpty(): boolean;
  /**
   * Returns the number of values stored under `key`, or _0_ if `key` is not present.
   * @param key Key
   */
  count(key: string): number;
  /**
   * Finds the first key where value is stored.
   * Note: value could be stored in multiple keys
   * @param value Value to seek
   * @returns Key, or undefined if value not found
   */
  firstKeyByValue(value: V, eq?: IsEqual<V>): string | undefined;
}
//# sourceMappingURL=imap-of.d.ts.map
//#endregion
//#region ../collections/dist/src/map/imap-of-mutable.d.ts
interface IMapOfMutable<V> extends IMapOf<V> {
  /**
   * Adds several `values` under the same `key`. Duplicate values are permitted, depending on implementation.
   * @param key
   * @param values
   */
  addKeyedValues(key: string, ...values: readonly V[]): void;
  /**
   * Adds a value, automatically extracting a key via the
   * `groupBy` function assigned in the constructor options.
   * @param values Adds several values
   */
  addValue(...values: readonly V[]): void;
  /**
   * Clears the map
   */
  clear(): void;
  /**
   * Returns the number of keys
   */
  get lengthKeys(): number;
  /**
   * Deletes all values under `key` that match `value`.
   * @param key Key
   * @param value Value
   */
  deleteKeyValue(key: string, value: V): boolean;
  /**
   * Delete all occurrences of `value`, regardless of
   * key it is stored under.
   * Returns _true_ if something was deleted.
   * @param value
   */
  deleteByValue(value: V): boolean;
  /**
   * Deletes all values stored under `key`. Returns _true_ if key was found
   * @param key
   */
  delete(key: string): boolean;
}
//# sourceMappingURL=imap-of-mutable.d.ts.map
//#endregion
//#region ../collections/dist/src/map/map-of-simple-base.d.ts
declare class MapOfSimpleBase<V> {
  protected map: Map<string, readonly V[]>;
  protected readonly groupBy: any;
  protected valueEq: any;
  /**
   * Constructor
   * @param groupBy Creates keys for values when using `addValue`. By default uses JSON.stringify
   * @param valueEq Compare values. By default uses JS logic for equality
   */
  constructor(groupBy?: (value: V) => string, valueEq?: IsEqual<V>, initial?: [string, readonly V[]][]);
  /**
   * Returns _true_ if `key` exists
   * @param key
   * @returns
   */
  has(key: string): boolean;
  /**
   * Returns _true_ if `value` exists under `key`.
   * @param key Key
   * @param value Value to seek under `key`
   * @returns _True_ if `value` exists under `key`.
   */
  hasKeyValue(key: string, value: V): boolean;
  /**
   * Debug dump of contents
   * @returns
   */
  debugString(): string;
  /**
   * Return number of values stored under `key`.
   * Returns 0 if `key` is not found.
   * @param key
   * @returns
   */
  count(key: string): number;
  /**
  * Returns first key that contains `value`
  * @param value
  * @param eq
  * @returns
  */
  firstKeyByValue(value: V, eq?: IsEqual<V>): string | undefined;
  /**
   * Iterate over all entries
   */
  entriesFlat(): IterableIterator<[key: string, value: V]>;
  /**
   * Iterate over keys and array of values for that key
   */
  entries(): IterableIterator<[key: string, value: V[]]>;
  /**
   * Get all values under `key`
   * @param key
   * @returns
   */
  get(key: string): IterableIterator<V>;
  /**
   * Iterate over all keys
   */
  keys(): IterableIterator<string>;
  /**
   * Iterate over all values (regardless of key).
   * Use {@link values} to iterate over a set of values per key
   */
  valuesFlat(): IterableIterator<V>;
  /**
   * Yields the values for each key in sequence, returning an array.
   * Use {@link valuesFlat} to iterate over all keys regardless of key.
   */
  values(): IterableIterator<readonly V[]>;
  /**
   * Iterate over keys and length of values stored under keys
   */
  keysAndCounts(): IterableIterator<[string, number]>;
  /**
   * Returns the count of keys.
   */
  get lengthKeys(): number;
  /**
  * _True_ if empty
  */
  get isEmpty(): boolean;
}
//# sourceMappingURL=map-of-simple-base.d.ts.map
//#endregion
//#region ../collections/dist/src/map/map-of-simple-mutable.d.ts
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
declare class MapOfSimpleMutable<V> extends MapOfSimpleBase<V> implements IMapOfMutable<V> {
  addKeyedValues(key: string, ...values: readonly V[]): void;
  /**
   * Set `values` to `key`.
   * Previous data stored under `key` is thrown away.
   * @param key
   * @param values
   */
  setValues(key: string, values: readonly V[]): void;
  /**
   * Adds a value, automatically extracting a key via the
   * `groupBy` function assigned in the constructor options.
   * @param values Adds several values
   */
  addValue(...values: readonly V[]): void;
  /**
   * Delete `value` under a particular `key`
   * @param key
   * @param value
   * @returns _True_ if `value` was found under `key`
   */
  deleteKeyValue(key: string, value: V): boolean;
  /**
   * Deletes `value` regardless of key.
   *
   * Uses the constructor-defined equality function.
   * @param value Value to delete
   * @returns
   */
  deleteByValue(value: V): boolean;
  /**
   * Deletes all values under `key`,
   * @param key
   * @returns _True_ if `key` was found and values stored
   */
  delete(key: string): boolean;
  /**
   * Clear contents
   */
  clear(): void;
}
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
declare const ofSimpleMutable: <V>(groupBy?: (value: V) => string, valueEq?: IsEqual<V>) => IMapOfMutable<V>;
//# sourceMappingURL=map-of-simple-mutable.d.ts.map
//#endregion
//#region ../collections/dist/src/map/imap-base.d.ts
interface IMapBase<K, V> {
  /**
   * Gets an item by key
   * @example
   * ```js
   * const item = map.get(`hello`);
   * ```
   * @param key
   */
  get(key: K): V | undefined;
  /**
  * Returns _true_ if map contains key
  * @example
  * ```js
  * if (map.has(`hello`)) ...
  * ```
  * @param key
  */
  has(key: K): boolean;
  /**
  * Returns _true_ if map is empty
  */
  isEmpty(): boolean;
  /**
   * Iterates over entries (consisting of [key,value])
   * @example
   * ```js
   * for (const [key, value] of map.entries()) {
   *  // Use key, value...
   * }
   * ```
   */
  entries(): IterableIterator<readonly [K, V]>;
  values(): IterableIterator<V>;
}
//# sourceMappingURL=imap-base.d.ts.map
//#endregion
//#region ../collections/dist/src/map/map.d.ts
/**
 * An immutable map. Rather than changing the map, functions like `add` and `delete`
 * return a new map reference which must be captured.
 *
 * Immutable data is useful because as it gets passed around your code, it never
 * changes from underneath you. You have what you have.
 *
 * @example
 * ```js
 * let m = map(); // Create
 * let m2 = m.set(`hello`, `samantha`);
 * // m is still empty, only m2 contains a value.
 * ```
 *
 * @typeParam K - Type of map keys. Typically `string`
 * @typeParam V - Type of stored values
 */
interface IMapImmutable<K, V> extends IMapBase<K, V> {
  /**
   * Adds one or more items, returning the changed map.
   *
   * Can add items in the form of `[key,value]` or `{key, value}`.
   * @example These all produce the same result
   * ```js
   * map.set(`hello`, `samantha`);
   * map.add([`hello`, `samantha`]);
   * map.add({key: `hello`, value: `samantha`})
   * ```
   * @param itemsToAdd
   */
  add(...itemsToAdd: EitherKey<K, V>): IMapImmutable<K, V>;
  /**
   * Deletes an item by key, returning the changed map
   * @param key
   */
  delete(key: K): IMapImmutable<K, V>;
  /**
   * Returns an empty map
   */
  clear(): IMapImmutable<K, V>;
  /**
   * Sets `key` to be `value`, overwriting anything existing.
   * Returns a new map with added key.
   * @param key
   * @param value
   */
  set(key: K, value: V): IMapImmutable<K, V>;
}
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
declare const immutable: <K, V>(dataOrMap?: ReadonlyMap<K, V> | EitherKey<K, V>) => IMapImmutable<K, V>;
//# sourceMappingURL=map.d.ts.map
//#endregion
//#region ../collections/dist/src/map/map-mutable.d.ts
/**
 * A mutable map.
 *
 * It is a wrapper around the in-built Map type, but adds roughly the same API as {@link IMapImmutable}.
 *
 * @typeParam K - Type of map keys. Typically `string`
 * @typeParam V - Type of stored values
 */
interface IMapMutable<K, V> extends IMapBase<K, V> {
  /**
   * Adds one or more items to map
   *
   * Can add items in the form of [key,value] or `{key, value}`.
   * @example These all produce the same result
   * ```js
   * map.set(`hello`, `samantha`);
   * map.add([`hello`, `samantha`]);
   * map.add({key: `hello`, value: `samantha`})
   * ```
   * @param itemsToAdd
   * @param itemsToAdd
   */
  add(...itemsToAdd: EitherKey<K, V>): void;
  /**
   * Sets a value to a specified key
   * @param key
   * @param value
   */
  set(key: K, value: V): void;
  /**
   * Deletes an item by key
   * @param key
   */
  delete(key: K): void;
  /**
   * Clears map
   */
  clear(): void;
}
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
declare const mutable: <K, V>(...data: EitherKey<K, V>) => IMapMutable<K, V>;
//# sourceMappingURL=map-mutable.d.ts.map
//#endregion
//#region ../collections/dist/src/map/imap-of-mutable-extended.d.ts
/**
 * Events from mapArray
 */
type MapArrayEvents<V> = {
  readonly addedValues: {
    readonly values: readonly V[];
  };
  readonly addedKey: {
    readonly key: string;
  };
  readonly clear: boolean;
  readonly deleteKey: {
    readonly key: string;
  };
};
/**
 * Like a `Map` but multiple values can be stored for each key.
 * Duplicate values can be added to the same or even a several keys.
 *
 * Three pre-defined MapOf's are available:
 * * {@link ofArrayMutable} - Map of arrays
 * * {@link ofSetMutable} - Map of unique items
 * * {@link ofCircularMutable} - Hold a limited set of values per key
 *
 * Adding
 * ```js
 * // Add one or more values using the predefined key function to generate a key
 * map.addValue(value1, value2, ...);
 * // Add one or more values under a specified key
 * map.addKeyedValues(key, value1, value2, ...);
 * ```
 *
 * Finding/accessing
 * ```js
 * // Returns all values stored under key
 * map.get(key);
 * // Returns the first key where value is found, or _undefined_ if not found
 * map.findKeyForValue(value);
 * // Returns _true_  if value is stored under key
 * map.hasKeyValue(key, value);
 * // Returns _true_ if map contains key
 * map.has(key);
 * ```
 *
 * Removing
 * ```js
 * // Removes everything
 * map.clear();
 * // Delete values under key. Returns _true_ if key was found.
 * map.delete(key);
 * // Deletes specified value under key. Returns _true_ if found.
 * map.deleteKeyValue(key, value);
 * ```
 *
 * Metadata about the map:
 * ```js
 * map.isEmpty;         // True/false
 * map.lengthMax;       // Largest count of items under any key
 * map.count(key);      // Count of items stored under key, or 0 if key is not present.
 * map.keys();          // Returns a string array of keys
 * map.keysAndCounts(); // Returns an array of [string,number] for all keys and number of values for each key
 * map.debugString();   // Returns a human-readable string dump of the contents
 * ```
 *
 * Events can be listened to via `addEventListener`
 * * `addedKey`, `addedValue` - when a new key is added, or when a new value is added
 * * `clear` - when contents are cleared
 * * `deleteKey` - when a key is deleted
 *
 * @example Event example
 * ```js
 * map.addEventLister(`addedKey`, ev => {
 *  // New key evt.key seen.
 * });
 * ```
 *
 * @typeParam V - Values stored under keys
 * @typeParam M - Type of data structure managing values
 */
interface IMapOfMutableExtended<V, M> extends SimpleEventEmitter<MapArrayEvents<V>>, IMapOfMutable<V> {
  /**
   * Returns the object managing values under the specified `key`
   * @private
   * @param key
   */
  getSource(key: string): M | undefined;
  /**
   * Returns the type name. For in-built implementations, it will be one of: array, set or circular
   */
  get typeName(): string;
  /**
   * Returns a human-readable rendering of contents
   */
  debugString(): string;
}
//# sourceMappingURL=imap-of-mutable-extended.d.ts.map
//#endregion
//#region ../collections/dist/src/map/map-of-array-mutable.d.ts
/**
 * Map of array options
 */
type MapArrayOpts<V> = MapMultiOpts<V> & {
  /**
   * Comparer to use
   */
  readonly comparer?: IsEqual<V>;
  /**
   * Key function
   */
  readonly convertToString?: ToString<V>;
};
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
declare const ofArrayMutable: <V>(options?: MapArrayOpts<V>) => IMapOfMutableExtended<V, readonly V[]>;
//# sourceMappingURL=map-of-array-mutable.d.ts.map

//#endregion
//#region ../collections/dist/src/map/imap-of-immutable.d.ts
/**
 * Like a `Map` but multiple values can be stored for each key. Immutable.
 * Duplicate values can be added to the same or even a several keys.
 *
 * Adding
 * ```js
 * // Add one or more values using the predefined key function to generate a key
 * map = map.addValue(value1, value2, ...);
 * // Add one or more values under a specified key
 * map = map.addKeyedValues(key, value1, value2, ...);
 * ```
 *
 * Finding/accessing
 * ```js
 * // Returns all values stored under key
 * map.get(key);
 * // Returns the first key where value is found, or _undefined_ if not found
 * map.findKeyForValue(value);
 * // Returns _true_  if value is stored under key
 * map.hasKeyValue(key, value);
 * // Returns _true_ if map contains key
 * map.has(key);
 * ```
 *
 * Removing
 * ```js
 * // Removes everything
 * map = map.clear();
 * // Delete values under key. Returns _true_ if key was found.
 * map = map.delete(key);
 * // Deletes specified value under key. Returns _true_ if found.
 * map = map.deleteKeyValue(key, value);
 * ```
 *
 * Metadata about the map:
 * ```js
 * map.isEmpty;         // True/false
 * map.lengthMax;       // Largest count of items under any key
 * map.count(key);      // Count of items stored under key, or 0 if key is not present.
 * map.keys();          // Returns a string array of keys
 * map.keysAndCounts(); // Returns an array of [string,number] for all keys and number of values for each key
 * map.debugString();   // Returns a human-readable string dump of the contents
 * ```
 *
 * @typeParam V - Values stored under keys
 * @typeParam M - Type of data structure managing values
 */
interface IMapOfImmutable<V> extends IMapOf<V> {
  /**
   * Adds several `values` under the same `key`. Duplicate values are permitted, depending on implementation.
   * @param key
   * @param values
   */
  addKeyedValues(key: string, ...values: ReadonlyArray<V>): IMapOfImmutable<V>;
  /**
   * Adds a value, automatically extracting a key via the
   * `groupBy` function assigned in the constructor options.
   * @param values Adds several values
   */
  addValue(...values: ReadonlyArray<V>): IMapOfImmutable<V>;
  /**
   * Clears the map
   */
  clear(): IMapOfImmutable<V>;
  /**
   * Deletes all values under `key` that match `value`.
   * @param key Key
   * @param value Value
   */
  deleteKeyValue(key: string, value: V): IMapOfImmutable<V>;
  /**
   * Delete all occurrences of `value`, regardless of
   * key it is stored under.
   * @param value
   */
  deleteByValue(value: V): IMapOfImmutable<V>;
  /**
   * Deletes all values stored under `key`.
   * @param key
   */
  delete(key: string): IMapOfImmutable<V>;
}
//# sourceMappingURL=imap-of-immutable.d.ts.map
//#endregion
//#region ../collections/dist/src/map/map-of-simple.d.ts
/**
 * Simple immutable MapOf
 */
declare class MapOfSimple<V> extends MapOfSimpleBase<V> implements IMapOf<V>, IMapOfImmutable<V> {
  addKeyedValues(key: string, ...values: readonly V[]): IMapOfImmutable<V>;
  addValue(...values: readonly V[]): IMapOfImmutable<V>;
  addBatch(entries: [key: string, value: readonly V[]][]): IMapOfImmutable<V>;
  clear(): IMapOfImmutable<V>;
  deleteKeyValue(_key: string, _value: V): IMapOfImmutable<V>;
  deleteByValue(value: V, eq?: IsEqual<V>): IMapOfImmutable<V>;
  delete(key: string): IMapOfImmutable<V>;
}
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
declare const ofSimple: <V>(groupBy?: ToString<V>, valueEq?: IsEqual<V>) => IMapOfImmutable<V>;
//# sourceMappingURL=map-of-simple.d.ts.map
//#endregion
//#region ../collections/dist/src/map/map-of-multi-impl.d.ts
/**
 * @internal
 */
declare class MapOfMutableImpl<V, M> extends SimpleEventEmitter<MapArrayEvents<V>> implements IMapOfMutableExtended<V, M> {
  #private;
  readonly groupBy: ToString<V>;
  readonly type: MultiValue<V, M>;
  constructor(type: MultiValue<V, M>, opts?: MapMultiOpts<V>);
  /**
   * Returns the type name. For in-built implementations, it will be one of: array, set or circular
   */
  get typeName(): string;
  /**
   * Returns the number of keys
   */
  get lengthKeys(): number;
  /**
   * Returns the length of the longest child list
   */
  get lengthMax(): number;
  debugString(): string;
  get isEmpty(): boolean;
  clear(): void;
  addKeyedValues(key: string, ...values: V[]): void;
  set(key: string, values: V[]): this;
  addValue(...values: readonly V[]): void;
  hasKeyValue(key: string, value: V, eq: IsEqual<V>): boolean;
  has(key: string): boolean;
  deleteKeyValue(key: string, value: V): boolean;
  private deleteKeyValueFromMap;
  deleteByValue(value: V): boolean;
  delete(key: string): boolean;
  firstKeyByValue(value: V, eq?: IsEqual<V>): string | undefined;
  count(key: string): number;
  /**
   * Iterates over values stored under `key`
   * An empty array is returned if there are no values
   */
  get(key: string): IterableIterator<V>;
  /**
   * Iterate over the values stored under `key`.
   * If key does not exist, iteration is essentially a no-op
   * @param key
   * @returns
   */
  valuesFor(key: string): Generator<V, void, any>;
  getSource(key: string): M | undefined;
  keys(): IterableIterator<string>;
  entriesFlat(): IterableIterator<[key: string, value: V]>;
  valuesFlat(): IterableIterator<V>;
  entries(): IterableIterator<[key: string, value: V[]]>;
  keysAndCounts(): IterableIterator<[string, number]>;
  merge(other: IMapOf<V>): void;
  get size(): number;
  get [Symbol.toStringTag](): string;
}
//# sourceMappingURL=map-of-multi-impl.d.ts.map
//#endregion
//#region ../collections/dist/src/map/map-multi-fns.d.ts
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
declare const firstEntry: <K, V>(map: IWithEntries<K, Iterable<V>>, predicate: (value: V, key: K) => boolean) => readonly [key: K, value: Iterable<V>] | undefined;
/**
 * Returns the size of the largest key, or 0 if empty.
 */
declare const lengthMax: <V>(map: IMapOf<V>) => number;
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
declare const firstEntryByValue: <K, V>(map: IWithEntries<K, Iterable<V>>, value: V, isEqual?: IsEqual<V>) => readonly [key: K, value: Iterable<V>] | undefined;
//# sourceMappingURL=map-multi-fns.d.ts.map
//#endregion
//#region ../collections/dist/src/map/map-multi.d.ts
/**
 * @private
 */
type MultiValue<V, M> = {
  get name(): string;
  has(source: M, value: V, eq: IsEqual<V>): boolean;
  addKeyedValues(destination: M | undefined, values: Iterable<V>): M;
  toArray(source: M): readonly V[];
  iterable(source: M): IterableIterator<V>;
  find(source: M, predicate: (v: V) => boolean): V | undefined;
  filter(source: M, predicate: (v: V) => boolean): Iterable<V>;
  without(source: M, value: V): readonly V[];
  count(source: M): number;
};
type MapMultiOpts<V> = {
  /**
   * Returns a group for values added via `addValue`. Eg. maybe you want to
   * group values in the shape `{name: 'Samantha' city: 'Copenhagen'}` by city:
   *
   * ```
   * const opts = {
   *  groupBy: (v) => v.city
   * }
   * ```
   *
   * @type {(ToString<V>|undefined)}
   */
  readonly groupBy?: ((value: V) => string) | undefined;
};
type MapSetOpts<V> = MapMultiOpts<V> & {
  readonly hash: (value: V) => string;
};
//# sourceMappingURL=map-multi.d.ts.map
//#endregion
//#region ../collections/dist/src/map/map-of-set-mutable.d.ts
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
declare const ofSetMutable: <V>(options?: MapSetOpts<V>) => IMapOfMutableExtended<V, ReadonlyMap<string, V>>;
//# sourceMappingURL=map-of-set-mutable.d.ts.map
//#endregion
//#region ../collections/dist/src/map/map-of-circular-mutable.d.ts
type MapCircularOpts<V> = MapMultiOpts<V> & {
  readonly capacity: number;
};
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
declare const ofCircularMutable: <V>(options: MapCircularOpts<V>) => IMapOfMutableExtended<V, ICircularArray<V>>;
//# sourceMappingURL=map-of-circular-mutable.d.ts.map

//#endregion
//#region ../collections/dist/src/map/number-map.d.ts
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
declare class NumberMap<K> extends Map<K, number> {
  readonly defaultValue: number;
  constructor(defaultValue?: number);
  get(key: K): number;
  reset(key: K): number;
  multiply(key: K, amount: number): number;
  add(key: K, amount?: number): number;
  subtract(key: K, amount?: number): number;
}
//# sourceMappingURL=number-map.d.ts.map
declare namespace index_d_exports$8 {
  export { ExpiringMap, ExpiringMapEvent, ExpiringMapEvents, Opts as ExpiringMapOpts, GetOrGenerate, IMapImmutable, IMapMutable, IMapOf, IMapOfImmutable, IMapOfMutable, IMapOfMutableExtended, MapArrayEvents, MapArrayOpts, MapCircularOpts, MapMultiOpts, MapOfMutableImpl, MapOfSimple, MapOfSimpleMutable, MapSetOpts, MergeReconcile, MultiValue, NumberMap, addObjectEntriesMutate, addValue, addValueMutate, addValueMutator, deleteByValueCompareMutate, create as expiringMap, filterValues, findBySomeKey, findEntryByPredicate, findEntryByValue, findValue, firstEntry, firstEntryByValue, fromIterable, fromObject, getClosestIntegerKey, getOrGenerate, getOrGenerateSync, hasAnyValue, hasKeyValue, immutable, lengthMax, ofSimpleMutable as mapOfSimpleMutable, mapToArray, mapToObjectTransform, mergeByKey, mutable, ofArrayMutable, ofCircularMutable, ofSetMutable, ofSimple, ofSimpleMutable, some, sortByValue, sortByValueProperty, toArray, toObject, transformMap, zipKeyValue };
}
//#endregion
//#region ../collections/dist/src/table.d.ts
/**
 * Stores values in a table of rows (vertical) and columns (horizontal)
 */
declare class Table<V> {
  #private;
  rows: TableRow<V>[];
  rowLabels: string[];
  colLabels: string[];
  /**
   * Keep track of widest row
   */
  columnMaxLength: number;
  /**
   * Gets the label for a given column index,
   * returning _undefined_ if not found.
   *
   * Case-sensitive
   * @param label Label to seek
   * @returns Index of column, or _undefined_ if not found
   */
  getColumnLabelIndex(label: string): number | undefined;
  /**
   * Gets the label for a given row index,
   * returning _undefined_ if not found.
   *
   * Case-sensitive
   * @param label Label to seek
   * @returns Index of row, or _undefined_ if not found
   */
  getRowLabelIndex(label: string): number | undefined;
  /**
   * Dumps the values of the table to the console
   */
  print(): void;
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
  asArray(): (V | undefined)[][];
  /**
   * Return the number of rows
   */
  get rowCount(): number;
  /**
   * Return the maximum number of columns in any row
   */
  get columnCount(): number;
  /**
   * Iterates over the table row-wise, in object format.
   * @see {@link rowsWithLabelsArray} to get rows in array format
   */
  rowsWithLabelsObject(): Generator<object | undefined, void, unknown>;
  /**
   * Iterates over each row, including the labels if available
   * @see {@link rowsWithLabelsObject} to get rows in object format
   */
  rowsWithLabelsArray(): Generator<[label: string | undefined, value: V | undefined][] | undefined, void, unknown>;
  /**
   * Assign labels to columns
   * @param labels
   */
  labelColumns(...labels: string[]): void;
  /**
   * Assign label to a specific column
   * First column has an index of 0
   * @param columnIndex
   * @param label
   */
  labelColumn(columnIndex: number, label: string): void;
  /**
   * Label rows
   * @param labels Labels
   */
  labelRows(...labels: string[]): void;
  /**
   * Assign label to a specific row
   * First row has an index of 0
   * @param rowIndex
   * @param label
   */
  labelRow(rowIndex: number, label: string): void;
  /**
   * Adds a new row
   * @param data Columns
   */
  appendRow(...data: TableValue<V>[]): TableRow<V>;
  /**
   * Gets a row along with labels, as an array
   * @param rowIndex
   * @returns
   */
  getRowWithLabelsArray(rowIndex: number): [label: string | undefined, value: V | undefined][] | undefined;
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
  getRowWithLabelsObject(rowIndex: number): object | undefined;
  /**
   * Gets a copy of values at given row, specified by index or label
   * @param row
   * @returns Returns row or throws an error if label or index not found
   */
  row(row: number | string): readonly (V | undefined)[] | undefined;
  /**
   * Set the value of row,columm.
   * Row is created if it doesn't exist, with the other column values being _undefined_
   * @param row Index or label
   * @param column Column
   * @param value Value to set at row,column
   */
  set(row: number | string, column: number | string, value: V | undefined): void;
  /**
   * Gets the value at a specified row and column.
   * Throws an error if coordinates are out of range or missing.
   * @param row Row index or label
   * @param column Column index or label
   * @returns
   */
  get(row: number | string, column: number | string): TableValue<V>;
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
  setRow(row: number | string, value: V | undefined, length?: number): TableRow<V>;
}
//# sourceMappingURL=table.d.ts.map
declare namespace directed_graph_d_exports {
  export { ConnectOptions$1 as ConnectOptions, DirectedGraph, DistanceCompute, Edge$1 as Edge, Vertex$1 as Vertex, adjacentVertices$1 as adjacentVertices, areAdjacent, bfs, clone, connect$1 as connect, connectTo$1 as connectTo, connectWithEdges$1 as connectWithEdges, createVertex$1 as createVertex, dfs, disconnect, distance, distanceDefault, dumpGraph$1 as dumpGraph, edges, get, getCycles, getOrCreate$1 as getOrCreate, getOrFail, graph$1 as graph, graphFromVertices, hasKey, hasNoOuts, hasOnlyOuts, hasOut, isAcyclic, pathDijkstra, toAdjacencyMatrix$1 as toAdjacencyMatrix, topologicalSort, transitiveReduction, updateGraphVertex$1 as updateGraphVertex, vertexHasOut, vertices };
}
type DistanceCompute = (graph: DirectedGraph, edge: Edge$1) => number;
/**
 * Vertex. These are the _nodes_ of the graph. Immutable.
 *
 * They keep track of all of their outgoing edges, and
 * a unique id.
 *
 * Ids are used for accessing/updating vertices as well as in the
 * {@link Edge} type. They must be unique.
 */
type Vertex$1 = Readonly<{
  out: readonly Edge$1[];
  id: string;
}>;
/**
 * Edge. Immutable.
 *
 * Only encodes the destination vertex. The from
 * is known since edges are stored on the from vertex.
 */
type Edge$1 = Readonly<{
  /**
   * Vertex id edge connects to (ie. destination)
   */
  id: string;
  /**
   * Optional weight of edge
   */
  weight?: number;
}>;
/**
 * Create a vertex with given id
 * @param id
 * @returns
 */
declare const createVertex$1: (id: string) => Vertex$1;
/**
 * Options for connecting vertices
 */
type ConnectOptions$1 = Readonly<{
  /**
   * From, or source of connection
   */
  from: string;
  /**
   * To, or destination of connection. Can be multiple vertices for quick use
   */
  to: string | string[];
  /**
   * If true, edges in opposite direction are made as well
   */
  bidi?: boolean;
  /**
   * Weight for this connection (optional)
   */
  weight?: number;
}>;
/**
 * Directed graph. Immutable.
 *
 * Consists of {@link Vertex|vertices}, which all have zero or more outgoing {@link Edge|Edges}.
 */
type DirectedGraph = Readonly<{
  vertices: IMapImmutable<string, Vertex$1>;
}>;
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
declare function hasKey(graph: DirectedGraph, key: string): boolean;
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
declare function get(graph: DirectedGraph, key: string): Vertex$1 | undefined;
/**
 * Returns the graph connections as an adjacency matrix
 * @param graph
 * @returns
 */
declare function toAdjacencyMatrix$1(graph: DirectedGraph): Table<boolean>;
/**
 * Return a string representation of the graph for debug inspection
 * @param graph
 * @returns
 */
declare const dumpGraph$1: (graph: DirectedGraph | Iterable<Vertex$1>) => string;
/**
 * Returns the weight of an edge, or 1 if undefined.
 * @param graph
 * @param edge
 * @returns
 */
declare const distance: (graph: DirectedGraph, edge: Edge$1) => number;
/**
 * Iterate over all the edges in the graph
 * @param graph
 */
declare function edges(graph: DirectedGraph): Generator<Readonly<{
  /**
   * Vertex id edge connects to (ie. destination)
   */
  id: string;
  /**
   * Optional weight of edge
   */
  weight?: number;
}>, void, unknown>;
/**
 * Iterate over all the vertices of the graph
 * @param graph
 */
declare function vertices(graph: DirectedGraph): Generator<Readonly<{
  out: readonly Edge$1[];
  id: string;
}>, void, unknown>;
/**
 * Iterate over all the vertices connected to `context` vertex
 * @param graph Graph
 * @param context id or Vertex.
 * @returns
 */
declare function adjacentVertices$1(graph: DirectedGraph, context: Vertex$1 | string | undefined): Generator<Readonly<{
  out: readonly Edge$1[];
  id: string;
}>, void, unknown>;
/**
 * Returns _true_ if `vertex` has an outgoing connection to
 * the supplied id or vertex.
 *
 * If `vertex` is undefined, _false_ is returned.
 * @param vertex From vertex
 * @param outIdOrVertex To vertex
 * @returns
 */
declare const vertexHasOut: (vertex: Vertex$1, outIdOrVertex: string | Vertex$1) => boolean;
/**
 * Returns _true_ if `vertex` has no outgoing connections
 * @param graph
 * @param vertex
 * @returns
 */
declare const hasNoOuts: (graph: DirectedGraph, vertex: string | Vertex$1) => boolean;
/**
 * Returns _true_ if `vertex` only has the given list of vertices.
 * Returns _false_ early if the length of the list does not match up with `vertex.out`
 * @param graph
 * @param vertex
 * @param outIdOrVertex
 * @returns
 */
declare const hasOnlyOuts: (graph: DirectedGraph, vertex: string | Vertex$1, ...outIdOrVertex: (string | Vertex$1)[]) => boolean;
/**
 * Returns _true_ if `vertex` has an outgoing connection to the given vertex.
 * @param graph
 * @param vertex
 * @param outIdOrVertex
 * @returns
 */
declare const hasOut: (graph: DirectedGraph, vertex: string | Vertex$1, outIdOrVertex: string | Vertex$1) => boolean;
/**
 * Gets a vertex by id, creating it if it does not exist.
 * @param graph
 * @param id
 * @returns
 */
declare const getOrCreate$1: (graph: DirectedGraph, id: string) => Readonly<{
  graph: DirectedGraph;
  vertex: Vertex$1;
}>;
/**
 * Gets a vertex by id, throwing an error if it does not exist
 * @param graph
 * @param id
 * @returns
 */
declare const getOrFail: (graph: DirectedGraph, id: string) => Vertex$1;
/**
 * Updates a vertex by returning a mutated graph
 * @param graph Graph
 * @param vertex Newly changed vertex
 * @returns
 */
declare const updateGraphVertex$1: (graph: DirectedGraph, vertex: Vertex$1) => DirectedGraph;
/**
 * Default distance computer. Uses `weight` property of edge, or `1` if not found.
 * @param graph
 * @param edge
 * @returns
 */
declare const distanceDefault: (graph: DirectedGraph, edge: Edge$1) => number;
/**
 * Returns a mutation of `graph`, with a given edge removed.
 *
 * If edge was not there, original graph is returned.
 * @param graph
 * @param from
 * @param to
 * @returns
 */
declare function disconnect(graph: DirectedGraph, from: string | Vertex$1, to: string | Vertex$1): DirectedGraph;
/**
 * Make a connection between two vertices with a given weight.
 * It returns the new graph as wll as the created edge.
 * @param graph
 * @param from
 * @param to
 * @param weight
 * @returns
 */
declare function connectTo$1(graph: DirectedGraph, from: string, to: string, weight?: number): {
  graph: DirectedGraph;
  edge: Edge$1;
};
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
declare function connect$1(graph: DirectedGraph, options: ConnectOptions$1): DirectedGraph;
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
declare function connectWithEdges$1(graph: DirectedGraph, options: ConnectOptions$1): {
  graph: DirectedGraph;
  edges: Edge$1[];
};
/**
 * Returns _true_ if a->b or b->a
 * @param graph
 * @param a
 * @param b
 * @returns
 */
declare function areAdjacent(graph: DirectedGraph, a: Vertex$1, b: Vertex$1): true | undefined;
/**
 * Iterates over vertices from a starting vertex in an bread-first-search
 * @param graph
 * @param startIdOrVertex
 * @param targetIdOrVertex
 * @returns
 */
declare function bfs(graph: DirectedGraph, startIdOrVertex: string | Vertex$1, targetIdOrVertex?: string | Vertex$1): Generator<Readonly<{
  out: readonly Edge$1[];
  id: string;
}>, void, unknown>;
/**
 * Iterates over vertices from a starting vertex in an depth-first-search
 * @param graph
 * @param startIdOrVertex
 */
declare function dfs(graph: DirectedGraph, startIdOrVertex: string | Vertex$1): Generator<Readonly<{
  out: readonly Edge$1[];
  id: string;
}>, void, unknown>;
/**
 * Compute shortest distance from the source vertex to the rest of the graph.
 * @param graph
 * @param sourceOrId
 * @returns
 */
declare const pathDijkstra: (graph: DirectedGraph, sourceOrId: Vertex$1 | string) => {
  distances: Map<string, number>;
  previous: Map<string, Readonly<{
    out: readonly Edge$1[];
    id: string;
  }> | null>;
  pathTo: (id: string) => Edge$1[];
};
/**
 * Clones the graph. Uses shallow clone, because it's all immutable
 * @param graph
 * @returns
 */
declare const clone: (graph: DirectedGraph) => DirectedGraph;
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
declare const graph$1: (...initialConnections: ConnectOptions$1[]) => DirectedGraph;
/**
 * Returns _true_ if the graph contains is acyclic - that is, it has no loops
 * @param graph
 */
declare function isAcyclic(graph: DirectedGraph): boolean;
/**
 * Topological sort using Kahn's algorithm.
 * Returns a new graph that is sorted
 * @param graph
 */
declare function topologicalSort(graph: DirectedGraph): DirectedGraph;
/**
 * Create a graph from an iterable of vertices
 * @param vertices
 * @returns
 */
declare function graphFromVertices(vertices: Iterable<Vertex$1>): DirectedGraph;
/**
 * Get all the cycles ('strongly-connected-components') within the graph
 * [Read more](https://en.wikipedia.org/wiki/Strongly_connected_component)
 * @param graph
 * @returns
 */
declare function getCycles(graph: DirectedGraph): Vertex$1[][];
/**
 * Returns a new graph which is transitively reduced.
 * That is, redundant edges are removed
 * @param graph
 * @returns
 */
declare function transitiveReduction(graph: DirectedGraph): Readonly<{
  vertices: IMapImmutable<string, Vertex$1>;
}>;
//# sourceMappingURL=directed-graph.d.ts.map
declare namespace undirected_graph_d_exports {
  export { ConnectOptions, Edge, Graph, Vertex, adjacentVertices, connect, connectTo, connectWithEdges, createVertex, dumpGraph, edgesForVertex, getConnection, getOrCreate, graph, hasConnection, toAdjacencyMatrix, updateGraphVertex };
}
type Vertex = Readonly<{
  id: string;
}>;
type Edge = Readonly<{
  a: string;
  b: string;
  weight?: number;
}>;
type Graph = Readonly<{
  edges: readonly Edge[];
  vertices: IMapImmutable<string, Vertex>;
}>;
type ConnectOptions = Readonly<{
  a: string;
  b: string | string[];
  weight?: number;
}>;
declare const createVertex: (id: string) => Vertex;
declare const updateGraphVertex: (graph: Graph, vertex: Vertex) => Graph;
declare const getOrCreate: (graph: Graph, id: string) => Readonly<{
  graph: Graph;
  vertex: Vertex;
}>;
/**
 * Returns _true/false_ if there is a connection between `a` and `b` in `graph`.
 * Use {@link getConnection} if you want to the edge.
 * @param graph Graph to search
 * @param a
 * @param b
 * @returns _true_ if edge exists
 */
declare const hasConnection: (graph: Graph, a: string | Vertex, b: string | Vertex) => boolean;
/**
 * Gets the connection, if it exists between `a` and `b` in `graph`.
 * If it doesn't exist, _undefined_ is returned.
 * Use {@link hasConnection} for a simple true/false if edge exists.
 * @param graph Graph
 * @param a
 * @param b
 * @returns
 */
declare const getConnection: (graph: Graph, a: string | Vertex, b: string | Vertex) => Edge | undefined;
/**
 * Connects A with B, returning the changed graph and created edge.
 * If the connection already exists, the original graph & edge is returned.
 * @param graph
 * @param a
 * @param b
 * @param weight
 * @returns
 */
declare function connectTo(graph: Graph, a: string, b: string, weight?: number): {
  graph: Graph;
  edge: Edge;
};
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
declare function connect(graph: Graph, options: ConnectOptions): Graph;
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
declare function connectWithEdges(graph: Graph, options: ConnectOptions): {
  graph: Graph;
  edges: Edge[];
};
declare const graph: (...initialConnections: ConnectOptions[]) => Graph;
declare function toAdjacencyMatrix(graph: Graph): Table<boolean>;
/**
 * Return a string representation of the graph for debug inspection
 * @param graph
 * @returns
 */
declare const dumpGraph: (graph: Graph) => string;
/**
 * Iterate over all the vertices connectd to `context` vertex
 * @param graph Graph
 * @param context id or Vertex
 * @returns
 */
declare function adjacentVertices(graph: Graph, context: Vertex | string | undefined): Generator<Readonly<{
  id: string;
}>, void, unknown>;
declare function edgesForVertex(graph: Graph, context: Vertex | string | undefined): Generator<Readonly<{
  a: string;
  b: string;
  weight?: number;
}>, void, unknown>;
//# sourceMappingURL=undirected-graph.d.ts.map
declare namespace index_d_exports$9 {
  export { directed_graph_d_exports as Directed, undirected_graph_d_exports as Undirected };
}
declare namespace index_d_exports$3 {
  export { ArrayKeys, CircularArray, EitherKey, ExpiringMap, index_d_exports$9 as Graphs, ICircularArray, ISetImmutable, ISetMutable, IStackImmutable, LabelledNode, LabelledSingleValue, LabelledValue, LabelledValues, MapOfSimpleMutable, index_d_exports$8 as Maps, ObjectKeys, QueueDiscardPolicy, QueueImmutable, QueueMutable, QueueOpts, index_d_exports$7 as Queues, SetStringImmutable, SetStringMutable, index_d_exports$6 as Sets, SimplifiedNode, StackImmutable, StackMutable, index_d_exports$5 as Stacks, Table, TableRow, TableValue, TraversableTree, TraverseObjectEntry, TraverseObjectEntryStatic, TraverseObjectEntryWithAncestors, TraverseObjectPathOpts, TreeNode, index_d_exports$4 as Trees, ValueSetEventMap, WrappedNode };
}
//#endregion
//#region ../random/dist/src/types.d.ts
/**
 * A random source.
 *
 * Predefined sources: Math.random, {@link gaussianSource}, {@link weightedSource}
 */
type RandomSource = () => number;
type WeightedOptions = RandomNumberOptions & Readonly<{
  easingFunction: (v: number) => number;
  easing?: string;
}>;
type StringOptions = Readonly<{
  length: number;
  source?: RandomSource;
}>;
type RandomOptions = Readonly<{
  source?: RandomSource;
}>;
type RandomNumberOptions = RandomOptions & Readonly<{
  max?: number;
  min?: number;
}>;
/**
 * Options for generating a random boolean
 */
type RandomBooleanOptions = RandomOptions & Readonly<{
  /**
   * If a random value is above threshold, _true_ is returned,
   * otherwise _false_.
   * Defaults to 0.5
   */
  threshold?: number;
}>;
type GenerateRandomOptions = RandomNumberOptions & Readonly<{
  /**
   * If true, number range is looped
   */
  loop?: boolean;
}>;
//# sourceMappingURL=types.d.ts.map
//#endregion
//#region ../random/dist/src/arrays.d.ts
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
declare const randomIndex: <V>(array: ArrayLike<V>, rand?: RandomSource) => number;
/**
 * Returns a random value from `array`,
 * and removes it from the array.
 *
 * ```js
 * const data = [100,20,50];
 * const v = randomPluck(data, { mutate: true });
 * // eg: v: 20, data is now [100,50]
 * ```
 * @param array
 * @param options
 */
declare function randomPluck<V>(array: readonly V[] | V[], options: {
  mutate: true;
  source?: RandomSource;
}): V | undefined;
/**
 * Returns a random element from an array
 * along with the remaining elements. Does not
 * modify the original array.
 * ```js
 * const data = [100,20,50];
 * const {value,remainder} = randomPluck(data);
 * // eg: value: 20, remainder: [100,50], data remains [100,20,50]
 * ```
 * @param array
 * @param options
 */
declare function randomPluck<V>(array: readonly V[] | V[], options?: {
  mutate: false;
  source?: RandomSource;
}): {
  value: V;
  remainder: V[];
};
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
declare const randomElement: <V>(array: ArrayLike<V>, rand?: RandomSource) => V;
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
declare const randomElementWeightedSource: <V>(array: ArrayLike<V>, weightings: number[], randomSource?: RandomSource) => () => V;
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
declare const shuffle: <V>(dataToShuffle: readonly V[], rand?: RandomSource) => V[];
//# sourceMappingURL=arrays.d.ts.map
//#endregion
//#region ../random/dist/src/chance.d.ts
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
declare const chance: <T>(p: number | (() => number), a: T | (() => T), b: T | (() => T), randomSource?: RandomSource) => T;
//# sourceMappingURL=chance.d.ts.map
//#endregion
//#region ../random/dist/src/float-source.d.ts
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
declare const bipolarSource: (maxOrOptions?: number | RandomNumberOptions) => RandomSource;
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
declare const bipolar: (maxOrOptions?: number | RandomNumberOptions) => number;
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
declare const floatSource: (maxOrOptions?: (number | RandomNumberOptions)) => RandomSource;
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
declare const float: (maxOrOptions?: (number | RandomNumberOptions)) => number;
//# sourceMappingURL=float-source.d.ts.map
//#endregion
//#region ../random/dist/src/gaussian.d.ts
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
declare const gaussian: (skew?: number) => number;
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
declare const gaussianSource: (skew?: number) => RandomSource;
//# sourceMappingURL=gaussian.d.ts.map
//#endregion
//#region ../random/dist/src/guid.d.ts
/**
 * Generates a six-digit roughly unique id
 * ```js
 * const id = shortGuid();
 * ```
 * @param options Options.
 * @returns
 */
declare const shortGuid: (options?: Readonly<{
  source?: RandomSource;
}>) => string;
//# sourceMappingURL=guid.d.ts.map

//#endregion
//#region ../random/dist/src/integer.d.ts
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
declare const integerSource: (maxOrOptions: number | RandomNumberOptions) => RandomSource;
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
declare const integer: (maxOrOptions: number | RandomNumberOptions) => number;
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
declare function integerUniqueGen(maxOrOptions: number | GenerateRandomOptions): IterableIterator<number>;
//# sourceMappingURL=integer.d.ts.map
//#endregion
//#region ../random/dist/src/non-zero.d.ts
/**
 * Keeps generating a random number until
 * it's not 0
 * @param source Random number generator
 * @returns Non-zero number
 */
declare const calculateNonZero: (source?: RandomSource) => number;
//# sourceMappingURL=non-zero.d.ts.map

//#endregion
//#region ../random/dist/src/seeded.d.ts
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
declare function mersenneTwister(seed?: number | undefined): {
  integer: (maxExclusive: number, minInclusive?: number) => number;
  float: () => number;
};
//# sourceMappingURL=seeded.d.ts.map
//#endregion
//#region ../random/dist/src/string.d.ts
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
declare const string: (lengthOrOptions?: number | StringOptions) => string;
//# sourceMappingURL=string.d.ts.map

//#endregion
//#region ../random/dist/src/time.d.ts
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
declare const minutesMsSource: (maxMinutesOrOptions: number | RandomNumberOptions) => RandomSource;
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
declare const minutesMs: (maxMinutesOrOptions: number | RandomNumberOptions) => number;
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
declare const secondsMsSource: (maxSecondsOrOptions: number | RandomNumberOptions) => RandomSource;
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
declare const secondsMs: (maxSecondsOrOptions: number | RandomNumberOptions) => number;
//# sourceMappingURL=time.d.ts.map
//#endregion
//#region ../random/dist/src/weighted-index.d.ts
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
declare const weightedIndex: (weightings: Array<number>, rand?: RandomSource) => () => number;
//# sourceMappingURL=weighted-index.d.ts.map

//#endregion
//#region ../random/dist/src/weighted-integer.d.ts
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
declare const weightedIntegerSource: (options: WeightedOptions) => RandomSource;
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
declare const weightedInteger: (options: WeightedOptions) => number;
//# sourceMappingURL=weighted-integer.d.ts.map
//#endregion
//#region ../random/dist/src/weighted.d.ts
/***
 * Returns a random number, 0..1, weighted by a given easing function.
 * See @ixfx/modulation.weighted to use a named easing function.
 * Use {@link weightedSource} to return a function instead.
 *
 * @see {@link weightedSource} Returns a function rather than value
 * @returns Random number (0-1)
 */
declare const weighted: (options: WeightedOptions) => number;
/***
 * Returns a random number, 0..1, weighted by a given easing function.
 * See @ixfx/modulation.weighted to use a named easing function.
 * Use {@link weighted} to get a value directly.
 *
 * @see {@link weighted} Returns value instead of function
 * @returns Function which returns a weighted random value
 */
declare const weightedSource: (options: WeightedOptions) => RandomSource;
//# sourceMappingURL=weighted.d.ts.map
declare namespace index_d_exports$2 {
  export { GenerateRandomOptions, RandomBooleanOptions, RandomNumberOptions, RandomOptions, RandomSource, StringOptions, WeightedOptions, bipolar, bipolarSource, calculateNonZero, chance, float, floatSource, gaussian, gaussianSource, integer, integerSource, integerUniqueGen, mersenneTwister, minutesMs, minutesMsSource, randomElement, randomElementWeightedSource, randomIndex, randomPluck, secondsMs, secondsMsSource, shortGuid, shuffle, string, weighted, weightedIndex, weightedInteger, weightedIntegerSource, weightedSource };
}
//#endregion
//#region ../trackers/dist/src/changes.d.ts
type TrackChangeResult = {
  /**
   * If value has changed
   */
  changed: boolean;
  /**
   * Number of times value has changed for duration of monitor
   */
  changes: number;
  /**
   * Number of times the same value has come
   * up in a row
   */
  identicalRun: number;
  /**
   * Number of values total
   */
  total: number;
};
type TrackChangeOptions<T> = {
  includeFirstValueInCount: boolean;
  initial: T;
};
type TrackNumberChangeOptions = TrackChangeOptions<number> & {
  nanHandling: `allow` | `skip` | `error`;
};
/**
 * Run a function if a value changes
 * ```js
 * const r = handleChangeResult(trackNumberChange, (value) => {
 *  // Called when value changes
 * });
 * r(10);
 * ```
 * @param monitor
 * @param onChanged
 * @param onNotChanged
 * @returns
 */
declare function handleChangeResult<T>(monitor: (v: T) => TrackChangeResult, onChanged: (v: T, countChanges: number, countTotal: number) => void, onNotChanged?: (v: T, countIdentical: number, countTotal: number) => void): (v: T) => void;
/**
 * Returns a function to monitor value changes.
 * ```js
 * const f = trackNumberChange(true);
 * f(10); // { changed: true, changesCount: 1 }
 * f(10); // { changed: false, changesCount: 1 }
 * ```
 *
 * Default options:
 * * nanHandling: error
 * * includeFirstValueInCount: false
 *
 * NaN handling:
 * * allow: use NaN value as a legal value and report a change
 * * skip: ignore NaN values, reporting back no change and use the same changes count
 * * error: throw an error if a NaN value is received
 *
 *
 * @returns
 */
declare function trackNumberChange(options?: Partial<TrackNumberChangeOptions>): (v: number) => TrackChangeResult;
/**
 * Returns a function to track changes in a boolean value
 * ```js
 * const t = trackBooleanChange();
 * t(true); // { changed:false }
 * t(true); // { changed:false }
 * t(false); // { changed: true }
 * ```
 *
 * Default options:
 * * includeFirstValueInCount: false
 * @param options
 * @returns
 */
declare function trackBooleanChange(options?: Partial<TrackChangeOptions<boolean>>): (v: boolean) => TrackChangeResult;
//# sourceMappingURL=changes.d.ts.map
//#endregion
//#region ../trackers/dist/src/frequency-mutable.d.ts
type FrequencyEventMap = {
  readonly change: {
    context: unknown;
  };
};
/**
 * Frequency keeps track of how many times a particular value is seen, but
 * unlike a Map it does not store the data. By default compares
 * items by value (via JSON.stringify).
 *
 * Fires `change` event when items are added or it is cleared.
 *
 * Overview
 * ```
 * const fh = new FrequencyTracker();
 * fh.add(value); // adds a value
 * fh.clear();    // clears all data
 * fh.keys() / .values() // returns an iterator for keys and values
 * fh.toArray();  //  returns an array of data in the shape [[key,freq],[key,freq]...]
 * ```
 *
 * Usage
 * ```
 * const fh = new FrequencyTracker();
 * fh.add(`apples`); // Count an occurence of `apples`
 * fh.add(`oranges)`;
 * fh.add(`apples`);
 *
 * const fhData = fh.toArray(); // Expect result [[`apples`, 2], [`oranges`, 1]]
 * fhData.forEach((d) => {
 *  const [key,freq] = d;
 *  console.log(`Key '${key}' occurred ${freq} time(s).`);
 * })
 * ```
 *
 * Custom key string
 * ```
 * const fh = frequency( person => person.name);
 * // All people with name `Samantha` will be counted in same group
 * fh.add({name:`Samantha`, city:`Brisbane`});
 * ```
 * @typeParam V - Type of items
 */
declare class FrequencyTracker<V> extends SimpleEventEmitter<FrequencyEventMap> {
  #private;
  /**
   * Constructor
   * @param keyString Function to key items. Uses JSON.stringify by default
   */
  constructor(keyString?: ToString<V>);
  /**
   * Clear data. Fires `change` event
   */
  clear(): void;
  /**
   * @returns Iterator over keys (ie. groups)
   */
  keys(): IterableIterator<string>;
  /**
   * @returns Iterator over frequency counts
   */
  values(): IterableIterator<number>;
  /**
   * @returns Copy of entries as an array of `[key, count]`
   */
  toArray(): [key: string, count: number][];
  /**
   * Returns a string with keys and counts, useful for debugging.
   * @returns
   */
  debugString(): string;
  /**
   *
   * @param value Value to count
   * @returns Frequency of value, or _undefined_ if it does not exist
   */
  frequencyOf(value: V | string): number | undefined;
  /**
   *
   * @param value Value to count
   * @returns Relative frequency of `value`, or _undefined_ if it does not exist
   */
  relativeFrequencyOf(value: V | string): number | undefined;
  /**
   * Returns copy of entries as an array
   * @returns Copy of entries as an array
   */
  entries(): KeyValue[];
  /**
   * Calculate min,max,avg,total & count from values
   * @returns Returns `{min,max,avg,total}`
   */
  computeValues(): NumbersComputeResult;
  /**
   * Return entries sorted
   * @param sortStyle Sorting style (default: _value_, ie. count)
   * @returns Sorted array of [key,frequency]
   */
  entriesSorted(sortStyle?: KeyValueSortSyles): readonly KeyValue[];
  /**
   * Add one or more values, firing _change_ event.
   * @param values Values to add. Fires _change_ event after adding item(s)
   */
  add(...values: V[]): void;
}
declare const frequency: <V>(keyString?: ToString<V>) => FrequencyTracker<V>;
//# sourceMappingURL=frequency-mutable.d.ts.map
//#endregion
//#region ../trackers/dist/src/types.d.ts
type Timestamped = {
  readonly at: number;
};
type TimestampedObject<V> = V & Timestamped;
/**
 * Options
 */
type TrackedValueOpts = {
  readonly id?: string;
  /**
   * If true, intermediate points are stored. False by default
   */
  readonly storeIntermediate?: boolean;
  /**
   * If above zero, tracker will reset after this many samples
   */
  readonly resetAfterSamples?: number;
  /**
   * If above zero, there will be a limit to intermediate values kept.
   *
   * When the seen values is twice `sampleLimit`, the stored values will be trimmed down
   * to `sampleLimit`. We only do this when the values are double the size so that
   * the collections do not need to be trimmed repeatedly whilst we are at the limit.
   *
   * Automatically implies storeIntermediate
   */
  readonly sampleLimit?: number;
  /**
   * If _true_, prints debug info
   */
  readonly debug?: boolean;
};
type TrimReason = `reset` | `resize`;
type TimestampedPrimitive<V extends number | string> = {
  at: number;
  value: V;
};
//# sourceMappingURL=types.d.ts.map
//#endregion
//#region ../trackers/dist/src/tracker-base.d.ts
/**
 * Base tracker class
 */
declare abstract class TrackerBase<V, SeenResultType> {
  /**
   * @ignore
   */
  seenCount: number;
  /**
   * @ignore
   */
  protected storeIntermediate: boolean;
  /**
   * @ignore
   */
  protected resetAfterSamples: number;
  /**
   * @ignore
   */
  protected sampleLimit: number;
  readonly id: string;
  protected debug: boolean;
  constructor(opts?: TrackedValueOpts);
  /**
   * Reset tracker
   */
  reset(): void;
  /**
   * Adds a value, returning computed result.
   *
   * At this point, we check if the buffer is larger than `resetAfterSamples`. If so, `reset()` is called.
   * If not, we check `sampleLimit`. If the buffer is twice as large as sample limit, `trimStore()` is
   * called to take it down to sample limit, and `onTrimmed()` is called.
   * @param p
   * @returns
   */
  seen(...p: V[]): SeenResultType;
  /**
   * @ignore
   * @param p
   */
  abstract filterData(p: V[]): Timestamped[];
  abstract get last(): V | undefined;
  /**
   * Returns the initial value, or undefined
   */
  abstract get initial(): V | undefined;
  /**
   * Returns the elapsed milliseconds since the initial value
   */
  abstract get elapsed(): number;
  /**
   * @ignore
   */
  abstract computeResults(_p: Timestamped[]): SeenResultType;
  /**
   * @ignore
   */
  abstract onReset(): void;
  /**
   * Notification that buffer has been trimmed
   */
  abstract onTrimmed(reason: TrimReason): void;
  abstract trimStore(limit: number): number;
}
//# sourceMappingURL=tracker-base.d.ts.map
//#endregion
//#region ../trackers/dist/src/primitive-tracker.d.ts
declare abstract class PrimitiveTracker<V extends number | string, TResult> extends TrackerBase<V, TResult> {
  values: V[];
  timestamps: number[];
  constructor(opts?: TrackedValueOpts);
  /**
   * Reduces size of value store to `limit`. Returns
   * number of remaining items
   * @param limit
   */
  trimStore(limit: number): number;
  onTrimmed(reason: TrimReason): void;
  get last(): V | undefined;
  get initial(): V | undefined;
  /**
   * Returns number of recorded values (this can include the initial value)
   */
  get size(): number;
  /**
   * Returns the elapsed time, in milliseconds since the instance was created
   */
  get elapsed(): number;
  onReset(): void;
  /**
   * Tracks a value
   */
  filterData(rawValues: V[]): TimestampedPrimitive<V>[];
}
//# sourceMappingURL=primitive-tracker.d.ts.map
//#endregion
//#region ../trackers/dist/src/number-tracker.d.ts
type NumberTrackerResults = {
  readonly total: number;
  readonly min: number;
  readonly max: number;
  readonly avg: number;
};
declare class NumberTracker extends PrimitiveTracker<number, NumberTrackerResults> {
  total: number;
  min: number;
  max: number;
  get avg(): number;
  /**
   * Difference between last value and initial.
   * Eg. if last value was 10 and initial value was 5, 5 is returned (10 - 5)
   * If either of those is missing, undefined is returned
   */
  difference(): number | undefined;
  /**
   * Relative difference between last value and initial.
   * Eg if last value was 10 and initial value was 5, 2 is returned (200%)
   */
  relativeDifference(): number | undefined;
  onReset(): void;
  /**
   * When trimmed, recomputes to set total/min/max to be based on
   * current values.
   * @param reason
   */
  onTrimmed(reason: TrimReason): void;
  computeResults(values: TimestampedPrimitive<number>[]): NumberTrackerResults;
  getMinMaxAvg(): {
    min: number;
    max: number;
    avg: number;
  };
}
/**
 * Keeps track of the total, min, max and avg in a stream of values. By default values
 * are not stored.
 *
 * Usage:
 *
 * ```js
 * import { number } from '@ixfx/trackers.js';
 *
 * const t = number();
 * t.seen(10);
 *
 * t.avg / t.min/ t.max
 * t.initial; // initial value
 * t.size;    // number of seen values
 * t.elapsed; // milliseconds since intialisation
 * t.last;    // last value
 * ```
 *
 * To get `{ avg, min, max, total }`
 * ```
 * t.getMinMax()
 * ```
 *
 * Use `t.reset()` to clear everything.
 *
 * Trackers can automatically reset after a given number of samples
 * ```
 * // reset after 100 samples
 * const t = number({ resetAfterSamples: 100 });
 * ```
 *
 * To store values, use the `storeIntermediate` option:
 *
 * ```js
 * const t = number({ storeIntermediate: true });
 * ```
 *
 * Difference between last value and initial value:
 * ```js
 * t.relativeDifference();
 * ```
 *
 * Get raw data (if it is being stored):
 * ```js
 * t.values; // array of numbers
 * t.timestampes; // array of millisecond times, indexes correspond to t.values
 * ```
 */
declare const number: (opts?: TrackedValueOpts) => NumberTracker;
//# sourceMappingURL=number-tracker.d.ts.map
//#endregion
//#region ../trackers/dist/src/interval-tracker.d.ts
/**
 * A `Tracker` that tracks interval between calls to `mark()`
 */
declare class IntervalTracker extends NumberTracker {
  lastMark: number;
  mark(): void;
}
/**
 * Returns a new {@link IntervalTracker} instance. IntervalTracker
 * records the interval between each call to `mark`.
 *
 * ```js
 * import { interval } from '@ixfx/trackers.js';
 *
 * const t = interval();
 *
 * // Call `mark` to record an interval
 * t.mark();
 * ...
 * t.mark();
 *
 * // Get average time in milliseconds between calls to `mark`
 * t.avg;
 *
 * // Longest and shortest times are available too...
 * t.min / t.max
 * ```
 *
 * Interval tracker can automatically reset after a given number of samples:
 *
 * ```
 * // Reset after 100 samples
 * const t = interval({ resetAfterSamples: 100} );
 * ```
 * @param options Options for tracker
 * @returns New interval tracker
 */
declare const interval: (options?: TrackedValueOpts) => IntervalTracker;
//# sourceMappingURL=interval-tracker.d.ts.map
//#endregion
//#region ../trackers/dist/src/rate-tracker.d.ts
type RateTrackerOpts = Readonly<{
  /**
  * If above zero, tracker will reset after this many samples
  */
  resetAfterSamples?: number;
  /**
   * If set, tracker will reset after this much time
   * since last `mark()` call.
   */
  timeoutInterval?: Interval;
  /**
   * If above zero, there will be a limit to intermediate values kept.
   *
   * When the seen values is twice `sampleLimit`, the stored values will be trimmed down
   * to `sampleLimit`. We only do this when the values are double the size so that
   * the collections do not need to be trimmed repeatedly whilst we are at the limit.
   *
   * Automatically implies storeIntermediate
   */
  sampleLimit?: number;
}>;
/**
 * Tracks the rate of events.
 * It's also able to compute the min,max and average interval between events.
 *
 * @example
 * ```js
 * const clicks = Trackers.rate();
 *
 * // Mark when a click happens
 * document.addEventListener(`click`, () => clicks.mark());
 *
 * // Get details
 * clicks.perSecond; // How many clicks per second
 * clicks.perMinute; // How many clicks per minute
 * ```
 *
 * `timeoutInterval` is a useful option to make the tracker reset
 * after some period without `mark()` being called.
 *
 * Another useful option is `sampleLimit`, which sets an upper bound
 * for how many events to track. A smaller value means the results
 * will more accurately track, but it might be less smooth.
 *
 * ```js
 * // Eg reset tracker after 5 seconds of inactivity
 * const clicks = Trackers.rate({
 *  sampleLimit: 10,
 *  timeoutInterval: { secs: 5 }
 * });
 * ```
 */
declare class RateTracker {
  #private;
  constructor(opts?: Partial<RateTrackerOpts>);
  /**
   * Mark that an event has happened
   */
  mark(): void;
  /**
   * Compute {min,max,avg} for the interval _between_ events.
   * @returns
   */
  computeIntervals(): {
    min: number;
    max: number;
    avg: number;
  };
  /**
   * Returns the time period (in milliseconds) that encompasses
   * the data set. Eg, a result of 1000 means there's data that
   * covers a one second period.
   */
  get elapsed(): number;
  /**
   * Resets the tracker.
   */
  reset(): void;
  /**
   * Get the number of events per second
   */
  get perSecond(): number;
  /**
   * Get the number of events per minute
   */
  get perMinute(): number;
}
/**
 * @inheritdoc RateTracker
 * @param opts
 * @returns
 */
declare const rate: (opts?: Partial<RateTrackerOpts>) => RateTracker;
//# sourceMappingURL=rate-tracker.d.ts.map
//#endregion
//#region ../trackers/dist/src/object-tracker.d.ts
/**
 * A tracked value of type `V`.
 */
declare abstract class ObjectTracker<V extends object, SeenResultType> extends TrackerBase<V, SeenResultType> {
  values: TimestampedObject<V>[];
  constructor(opts?: TrackedValueOpts);
  onTrimmed(reason: TrimReason): void;
  /**
   * Reduces size of value store to `limit`.
   * Returns number of remaining items
   * @param limit
   */
  trimStore(limit: number): number;
  /**
   * Allows sub-classes to be notified when a reset happens
   * @ignore
   */
  onReset(): void;
  /**
   * Tracks a value
   * @ignore
   */
  filterData(p: V[] | TimestampedObject<V>[]): TimestampedObject<V>[];
  /**
   * Last seen value. If no values have been added, it will return the initial value
   */
  get last(): TimestampedObject<V>;
  /**
   * Returns the oldest value in the buffer
   */
  get initial(): TimestampedObject<V> | undefined;
  /**
   * Returns number of recorded values (includes the initial value in the count)
   */
  get size(): number;
  /**
   * Returns the elapsed time, in milliseconds since the initial value
   */
  get elapsed(): number;
}
//# sourceMappingURL=object-tracker.d.ts.map
//#endregion
//#region ../trackers/dist/src/tracked-value.d.ts
/**
 * Keeps track of keyed values of type `V` (eg Point). It stores occurences in type `T`, which
 * must extend from `TrackerBase<V>`, eg `PointTracker`.
 *
 * The `creator` function passed in to the constructor is responsible for instantiating
 * the appropriate `TrackerBase` sub-class.
 *
 * @example Sub-class
 * ```js
 * export class PointsTracker extends TrackedValueMap<Points.Point> {
 *  constructor(opts:TrackOpts = {}) {
 *   super((key, start) => {
 *    if (start === undefined) throw new Error(`Requires start point`);
 *    const p = new PointTracker(key, opts);
 *    p.seen(start);
 *    return p;
 *   });
 *  }
 * }
 * ```
 *
 */
declare class TrackedValueMap<V, T extends TrackerBase<V, TResult>, TResult> {
  store: Map<string, T>;
  gog: GetOrGenerate<string, T, V>;
  constructor(creator: (key: string, start: V | undefined) => T);
  /**
   * Number of named values being tracked
   */
  get size(): number;
  /**
   * Returns _true_ if `id` is stored
   * @param id
   * @returns
   */
  has(id: string): boolean;
  /**
   * For a given id, note that we have seen one or more values.
   * @param id Id
   * @param values Values(s)
   * @returns Information about start to last value
   */
  seen(id: string, ...values: V[]): Promise<TResult>;
  /**
   * Creates or returns a TrackedValue instance for `id`.
   * @param id
   * @param values
   * @returns
   */
  protected getTrackedValue(id: string, ...values: V[]): Promise<T>;
  /**
   * Remove a tracked value by id.
   * Use {@link reset} to clear them all.
   * @param id
   */
  delete(id: string): void;
  /**
   * Remove all tracked values.
   * Use {@link delete} to remove a single value by id.
   */
  reset(): void;
  /**
   * Enumerate ids
   */
  ids(): Generator<string, void, unknown>;
  /**
   * Enumerate tracked values
   */
  tracked(): Generator<T, void, unknown>;
  /**
   * Iterates TrackedValues ordered with oldest first
   * @returns
   */
  trackedByAge(): Generator<T, void, unknown>;
  /**
   * Iterates underlying values, ordered by age (oldest first)
   * First the named values are sorted by their `elapsed` value, and then
   * we return the last value for that group.
   */
  valuesByAge(): Generator<V | undefined, void, unknown>;
  /**
   * Enumerate last received values
   *
   * @example Calculate centroid of latest-received values
   * ```js
   * const pointers = pointTracker();
   * const c = Points.centroid(...Array.from(pointers.lastPoints()));
   * ```
   */
  last(): Generator<V | undefined, void, unknown>;
  /**
   * Enumerate starting values
   */
  initialValues(): Generator<V | undefined, void, unknown>;
  /**
   * Returns a tracked value by id, or undefined if not found
   * @param id
   * @returns
   */
  get(id: string): TrackerBase<V, TResult> | undefined;
}
//# sourceMappingURL=tracked-value.d.ts.map
declare namespace index_d_exports {
  export { FrequencyEventMap, FrequencyTracker, IntervalTracker, NumberTracker, NumberTrackerResults, ObjectTracker, PrimitiveTracker, RateTracker, RateTrackerOpts, Timestamped, TimestampedObject, TimestampedPrimitive, TrackChangeOptions, TrackChangeResult, TrackNumberChangeOptions, TrackedValueMap, TrackedValueOpts, TrackerBase, TrimReason, frequency, handleChangeResult, interval, number, rate, trackBooleanChange, trackNumberChange };
}
//#endregion
export { IQueueMutableWithEvents, type ISetMutable, type IStackImmutable, ObjectTracker, QueueMutable, RandomSource, TimestampedObject, TrackedValueMap, TrackedValueOpts, TraversableTree, TrimReason, index_d_exports, index_d_exports$2 as index_d_exports$1, index_d_exports$3 as index_d_exports$2 };
//# sourceMappingURL=index-Dg6fxrlu.d.ts.map