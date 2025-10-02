//#region ../core/dist/src/comparers.d.ts
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
export { CompareResult, Comparer, comparerInverse, defaultComparer, jsComparer, numericComparer };
//# sourceMappingURL=comparers-C6kfLE-t.d.ts.map