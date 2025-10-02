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
type ResolveToValueSync<V> = BasicType | ReactiveNonInitial<V> | Generator<V> | IterableIterator<V> | ((args: any) => V);
type ResolveToValueAsync<V> = AsyncGenerator<V> | AsyncIterableIterator<V> | Promise<V> | ((args: any) => Promise<V>);
type ResolveToValue<V> = ResolveToValueAsync<V> | ResolveToValueSync<V>;
/**
 * Resolves `r` to a value, where `r` is:
 * * primitive value
 * * a/sync function
 * * a/sync generator/iterator
 * * ReactiveNonInitial
 * ```js
 * await resolve(10);       // 10
 * await resolve(() => 10); // 10
 * await resole(async () => {
 *  sleep(100);
 *  return 10;
 * });                // 10
 * ```
 *
 * To resolve an object's properties, use {@link resolveFields}.
 *
 * Resolve is not recursive. So if `r` is an object, it will be returned, even
 * though its properties may be resolvable.
 * @param r
 * @param args
 * @returns
 */
declare function resolve<V extends BasicType>(r: ResolveToValue<V>, ...args: any): Promise<V>;
/**
 * For a given input `r`, attempts to 'resolve' it. See {@link resolve} for details.
 * @param r
 * @param args
 * @returns
 */
declare function resolveSync<V extends BasicType>(r: ResolveToValueSync<V>, ...args: any): V;
/**
 * Resolves a value as per {@link resolve}, however
 * If an error is thrown or the resolution results in _undefined_
 * or NaN, `fallbackValue` is returned instead.
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
 * @param p Thing to resolve
 * @param fallback Fallback value if an error happens, undefined or NaN
 * @param args
 * @returns
 */
declare function resolveWithFallback<T extends BasicType>(p: ResolveToValue<T>, fallback: ResolveFallbackOpts<T>, ...args: any): Promise<T>;
declare function resolveWithFallbackSync<T extends BasicType>(p: ResolveToValueSync<T>, fallback: ResolveFallbackOpts<T>, ...args: any): T;
type ResolveFallbackOpts<T> = {
  value: T;
  overrideWithLast?: boolean;
};
//# sourceMappingURL=resolve-core.d.ts.map

//#endregion
export { Passed, Reactive, ReactiveInitial, ReactiveNonInitial, ResolveFallbackOpts, ResolveToValue, ResolveToValueAsync, ResolveToValueSync, SignalKinds, Unsubscriber, resolve, resolveSync, resolveWithFallback, resolveWithFallbackSync };
//# sourceMappingURL=resolve-core-Cji7XRWY.d.ts.map