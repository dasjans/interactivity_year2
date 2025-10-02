import { BasicType } from "./types-CcY4GIC4.js";

//#region ../core/dist/src/types-reactive.d.ts
/**
 * A reactive that does not have an initial value
 */
type ReactiveNonInitial<V> = Reactive<V> & {
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
//#region ../core/dist/src/resolve-core.d.ts
/**
 * Something that can resolve to a value
 */
type ResolveToValueSync<V> = BasicType | ReactiveNonInitial<V> | Generator<V> | IterableIterator<V> | ((...args: unknown[]) => V);
type ResolveToValueAsync<V> = AsyncGenerator<V> | AsyncIterableIterator<V> | Promise<V> | ((...args: unknown[]) => Promise<V>);
type ResolveToValue<V> = ResolveToValueAsync<V> | ResolveToValueSync<V>;
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
declare function resolve<V extends BasicType>(resolvable: ResolveToValue<V>, ...args: unknown[]): Promise<V>;
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
declare function resolveWithFallback<T extends BasicType>(p: ResolveToValue<T>, options: ResolveFallbackOptions<T>, ...args: unknown[]): Promise<T>;
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
export { Passed, Reactive, ReactiveInitial, ReactiveNonInitial, ResolveFallbackOptions, ResolveToValue, ResolveToValueAsync, ResolveToValueSync, SignalKinds, Unsubscriber, resolve, resolveSync, resolveWithFallback, resolveWithFallbackSync };
//# sourceMappingURL=resolve-core-CYBLBOMw.d.ts.map