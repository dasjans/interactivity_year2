//#region ../process/src/types.d.ts
type Process<TIn, TOut> = (value: TIn) => TOut;
type ProcessFactory<TIn, TOut> = () => Process<TIn, TOut>;
type Processors1<T1, T2> = [Process<T1, T2>];
type Processors2<T1, T2, T3> = [Process<T1, T2>, Process<T2, T3>];
type Processors3<T1, T2, T3, T4> = [Process<T1, T2>, Process<T2, T3>, Process<T3, T4>];
type Processors4<T1, T2, T3, T4, T5> = [Process<T1, T2>, Process<T2, T3>, Process<T3, T4>, Process<T4, T5>];
type Processors5<T1, T2, T3, T4, T5, T6> = [Process<T1, T2>, Process<T2, T3>, Process<T3, T4>, Process<T4, T5>, Process<T5, T6>];
type Processors<T1, T2, T3, T4, T5, T6> = Processors1<T1, T2> | Processors2<T1, T2, T3> | Processors3<T1, T2, T3, T4> | Processors4<T1, T2, T3, T4, T5> | Processors5<T1, T2, T3, T4, T5, T6>;
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
//#endregion
//#region ../process/src/basic.d.ts
/**
 * Outputs the current largest-seen value
 * @returns
 */
declare const max: () => Process<number | number[], number>;
/**
 * Outputs the current smallest-seen value
 * @returns
 */
declare const min: () => Process<number | number[], number>;
/**
 * Returns a sum of values
 * @returns
 */
declare const sum: () => Process<number | number[], number>;
/**
 * Returns the current average of input values
 * @returns
 */
declare const average: () => Process<number | number[], number>;
/**
 * Returns the tally (ie number of) values
 * @param countArrayItems
 * @returns
 */
declare const tally: (countArrayItems: boolean) => Process<any, number>;
/**
 * Returns the 'best' value seen so far as determined by a ranking function.
 * This is similar to min/max but usable for objects.
 * @param r
 * @param options
 * @returns
 */
declare function rank<In>(r: RankFunction<In>, options?: Partial<RankOptions>): (value: In) => In | undefined;
//# sourceMappingURL=basic.d.ts.map
//#endregion
//#region ../process/src/cancel-error.d.ts
declare class CancelError extends Error {
  constructor(message: any);
}
//# sourceMappingURL=cancel-error.d.ts.map
//#endregion
//#region ../process/src/flow.d.ts
declare function flow<T1, T2>(...processors: [Process<T1, T2>]): (value: T1) => T2;
declare function flow<T1, T2, T3>(...processors: [Process<T1, T2>, Process<T2, T3>]): (value: T1) => T3;
declare function flow<T1, T2, T3, T4>(...processors: [Process<T1, T2>, Process<T2, T3>, Process<T3, T4>]): (value: T1) => T4;
declare function flow<T1, T2, T3, T4, T5>(...processors: [Process<T1, T2>, Process<T2, T3>, Process<T3, T4>, Process<T4, T5>]): (value: T1) => T5;
declare function flow<T1, T2, T3, T4, T5, T6>(...processors: [Process<T1, T2>, Process<T2, T3>, Process<T3, T4>, Process<T4, T5>, Process<T5, T6>]): (value: T1) => T6;
//# sourceMappingURL=flow.d.ts.map

//#endregion
//#region ../process/src/if-undefined.d.ts
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
declare function ifNotUndefined<TIn, TOut>(fn: (value: Exclude<TIn, undefined>) => TOut): (value: TIn) => TIn | TOut;
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
declare function cancelIfUndefined<TIn>(): (value: TIn | undefined) => TIn;
/**
 * Returns the output of `fn` if the input value is _undefined_.
 * See also: {@link ifNotUndefined} and {@link cancelIfUndefined}.
 * @param fn
 * @returns
 */
declare function ifUndefined<TIn, TOut>(fn: () => TOut): (value: TIn) => TOut | (TIn & ({} | null));
//# sourceMappingURL=if-undefined.d.ts.map
//#endregion
//#region ../process/src/seen.d.ts
/**
 * If a value is same as the previous value, _undefined_ is emitted instead.
 *
 * @param eq Equality function. If not specified, === semantics are used.
 * @returns
 */
declare function seenLastToUndefined<TIn>(eq?: (a: TIn, b: TIn) => boolean): Process<TIn, TIn | undefined>;
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
declare function seenToUndefined<TIn>(eq?: (a: TIn, b: TIn) => boolean): Process<TIn, TIn | undefined>;
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
declare function seenToUndefinedByKey<TIn>(toString?: (value: TIn) => string): Process<TIn, TIn | undefined>;
//# sourceMappingURL=seen.d.ts.map

//#endregion
export { CancelError, type Process, ProcessFactory, Processors, Processors1, Processors2, Processors3, Processors4, Processors5, RankFunction, RankOptions, average, cancelIfUndefined, flow, ifNotUndefined, ifUndefined, max, min, rank, seenLastToUndefined, seenToUndefined, seenToUndefinedByKey, sum, tally };
//# sourceMappingURL=process.d.ts.map