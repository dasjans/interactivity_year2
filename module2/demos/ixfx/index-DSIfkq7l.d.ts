import { BasicType, Interval } from "./types-CcY4GIC4.js";
import { Result } from "./index-DTe1EM0y.js";
import { Comparer } from "./comparers-C6kfLE-t.js";
import { Continuously, ContinuouslyAsyncCallback, ContinuouslyOpts, ContinuouslySyncCallback, HasCompletion, HasCompletionRunStates, LogSet, OnStartCalled, continuously } from "./index-Bne6KcmH.js";
import { ResolveToValue, ResolveToValueSync } from "./resolve-core-CYBLBOMw.js";
import { sleep } from "./sleep-DiuAJS4P.js";
import { SimpleEventEmitter } from "./index-CZIsUroQ.js";
import { index_d_exports } from "./index-1oZyS9hM.js";

//#region ../flow/dist/src/behaviour-tree.d.ts
type TaskState = `Failed` | `Running` | `Success`;
type Task = {
  readonly state: TaskState;
};
type Traversal = readonly [node: BtNode, path: string];
/**
 * Node can have conditions as to whether they should even be considered
 * Conditions can have dependencies on values, ideally this is responsive
 * Conditions might abort sibling nodes, as in example: https://docs.unrealengine.com/4.27/en-US/InteractiveExperiences/ArtificialIntelligence/BehaviorTrees/BehaviorTreesOverview/
 */
type BtNodeBase = {
  readonly name?: string;
};
type SeqNode = BtNodeBase & {
  readonly seq: ReadonlyArray<BtNode>;
};
type SelNode = BtNodeBase & {
  readonly sel: ReadonlyArray<BtNode>;
};
type BtNode = SeqNode | SelNode | string;
declare function iterateBreadth(t: BtNode, pathPrefix?: string): Generator<Traversal>;
declare function iterateDepth(t: BtNode, pathPrefix?: string): Generator<Traversal>;
//# sourceMappingURL=behaviour-tree.d.ts.map
//#endregion
//#region ../flow/dist/src/delay.d.ts
/**
 * Delay options
 */
type DelayOpts = Interval & {
  /**
   * Signal for cancelling delay
   */
  readonly signal?: AbortSignal;
  /**
   * When delay is applied. "before" is default.
   */
  readonly delay?: `before` | `after` | `both`;
};
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
declare const delay: <V>(callback: () => Promise<V>, optsOrMillis: DelayOpts | number) => Promise<V>;
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
declare function delayLoop(timeout: Interval): AsyncGenerator<undefined, void, unknown>;
//# sourceMappingURL=delay.d.ts.map
//#endregion
//#region ../flow/dist/src/timeout.d.ts
type TimeoutSyncCallback = (elapsedMs?: number, ...args: readonly unknown[]) => void;
type TimeoutAsyncCallback = (elapsedMs?: number, ...args: readonly unknown[]) => Promise<void>;
/**
 * A resettable timeout, returned by {@link timeout}
 */
type Timeout = HasCompletion & {
  /**
   * Starts the timer.
   * If the timer has already been started and has a scheduled execution, this is cancelled
   * and re-scheduled.
   * @param altTimeoutMs Optional override for the interval. Use _undefined_ to use the original interval
   * @param args
   */
  start(altTimeoutMs?: number, args?: readonly unknown[]): void;
  /**
   * Cancels the timer, aborting any scheduled execution.
   */
  cancel(): void;
};
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
declare const timeout: (callback: TimeoutSyncCallback | TimeoutAsyncCallback, interval: Interval) => Timeout;
//# sourceMappingURL=timeout.d.ts.map
//#endregion
//#region ../flow/dist/src/debounce.d.ts
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
declare const debounce: (callback: TimeoutSyncCallback | TimeoutAsyncCallback, interval: Interval) => DebouncedFunction;
/**
 * Debounced function
 */
type DebouncedFunction = (...args: readonly unknown[]) => void;
//# sourceMappingURL=debounce.d.ts.map
//#endregion
//#region ../flow/dist/src/dispatch-list.d.ts
type Dispatch<V> = (value: V) => void;
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
declare class DispatchList<V> {
  #private;
  constructor();
  /**
   * Returns _true_ if list is empty
   * @returns
   */
  isEmpty(): boolean;
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
  add(handler: Dispatch<V>, options?: {
    once?: boolean;
  }): string;
  /**
   * Remove a handler by its id.
   * @param id
   * @returns _True_ if handler was removed, _false_ if not found.
   */
  remove(id: string): boolean;
  /**
   * Emit a value to all handlers
   * @param value
   */
  notify(value: V): void;
  /**
   * Remove all handlers
   */
  clear(): void;
}
//# sourceMappingURL=dispatch-list.d.ts.map
//#endregion
//#region ../flow/dist/src/every.d.ts
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
declare const everyNth: <T>(nth: number, callback?: (data: T) => void) => (data: T) => boolean;
//# sourceMappingURL=every.d.ts.map
//#endregion
//#region ../flow/dist/src/execute.d.ts
type ExpressionOrResult<ArgsType, ResultType> = ResultType | ((args: ArgsType | undefined) => Promise<ResultType | undefined> | ResultType | undefined | void);
type RunOpts<ResultType> = {
  /**
   * If provided, filters the set of results prior to returning.
   * @param result
   * @returns
   */
  readonly filter?: (result: ResultType) => boolean;
  /**
   * If true, execution order is shuffled each time
   */
  readonly shuffle?: boolean;
  /**
   * Function to rank results. By default uses {@link defaultComparer} which orders
   * by numeric value or alphabetical.
   */
  readonly rank?: Comparer<ResultType>;
  /**
   * If provided, stops execution if _true_ is returned.
   * Result(s) include most recent execution.
   * @param latest Latest result
   * @param sorted Sorted list of current results, not including latest
   * @returns
   */
  readonly stop?: (latest: ResultType | undefined, sorted: readonly ResultType[]) => boolean;
};
type RunSingleOpts<V> = RunOpts<V> & {
  readonly at?: number;
};
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
declare const run: <ArgsType, ResultType>(expressions: ExpressionOrResult<ArgsType, ResultType>[] | ExpressionOrResult<ArgsType, ResultType> | readonly ExpressionOrResult<ArgsType, ResultType>[], opts?: RunOpts<ResultType>, args?: ArgsType) => Promise<ResultType[]>;
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
declare const runSingle: <ArgsType, ResultType>(expressions: readonly ExpressionOrResult<ArgsType, ResultType>[], opts?: RunSingleOpts<ResultType>, args?: ArgsType) => Promise<ResultType | undefined>;
//# sourceMappingURL=execute.d.ts.map
//#endregion
//#region ../flow/dist/src/event-race.d.ts
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
declare const eventRace: (target: EventTarget, eventNames: string[], options?: Partial<{
  timeoutMs: number;
  signal: AbortSignal;
}>) => Promise<Event>;
//# sourceMappingURL=event-race.d.ts.map
//#endregion
//#region ../flow/dist/src/moving-average.d.ts
type MovingAverageTimedOptions = Readonly<{
  interval: Interval;
  default?: number;
  abort?: AbortSignal;
}>;
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
declare const movingAverageTimed: (options: MovingAverageTimedOptions) => (v: number) => number;
//# sourceMappingURL=moving-average.d.ts.map
//#endregion
//#region ../flow/dist/src/pool.d.ts
/**
 * Policy for when the pool is fully used
 */
type FullPolicy = `error` | `evictOldestUser`;
/**
 * Pool options
 */
type PoolOptions<V> = {
  /**
   * Maximum number of resources for this pool
   */
  readonly capacity?: number;
  /**
   * If above 0, users will be removed if there is no activity after this interval.
   * Activity is marked whenever `use` us called with that user key.
   * Default: disabled
   */
  readonly userExpireAfterMs?: number;
  /**
   * If above 0, resources with no users will be automatically removed after this interval.
   * Default: disabled
   */
  readonly resourcesWithoutUserExpireAfterMs?: number;
  /**
   * Maximum number of users per resource. Defaults to 1
   */
  readonly capacityPerResource?: number;
  /**
   * What to do if pool is full and a new resource allocation is requested.
   * Default is `error`, throwing an error when pool is full.
   */
  readonly fullPolicy?: FullPolicy;
  /**
   * If true, additional logging will trace activity of pool.
   * Default: false
   */
  readonly debug?: boolean;
  /**
   * If specified, this function will generate new resources as needed.
   */
  readonly generate?: () => V;
  /**
   * If specified, this function will be called when a resource is disposed
   */
  readonly free?: (v: V) => void;
};
/**
 * Function that initialises a pool item
 */
/**
 * State of pool
 */
type PoolState = `idle` | `active` | `disposed`;
type PoolUserEventMap<V> = {
  readonly disposed: {
    readonly data: V;
    readonly reason: string;
  };
  readonly released: {
    readonly data: V;
    readonly reason: string;
  };
};
/**
 * A use of a pool resource
 *
 * Has two events, _disposed_ and _released_.
 */
declare class PoolUser<V> extends SimpleEventEmitter<PoolUserEventMap<V>> {
  readonly key: string;
  readonly resource: Resource<V>;
  private _lastUpdate;
  private _pool;
  private _state;
  private _userExpireAfterMs;
  /**
   * Constructor
   * @param key User key
   * @param resource Resource being used
   */
  constructor(key: string, resource: Resource<V>);
  /**
   * Returns a human readable debug string
   * @returns
   */
  toString(): string;
  /**
   * Resets countdown for instance expiry.
   * Throws an error if instance is disposed.
   */
  keepAlive(): void;
  /**
   * @internal
   * @param reason
   * @returns
   */
  _dispose(reason: string, data: V): void;
  /**
   * Release this instance
   * @param reason
   */
  release(reason: string): void;
  get data(): V;
  /**
   * Returns true if this instance has expired.
   * Expiry counts if elapsed time is greater than `userExpireAfterMs`
   */
  get isExpired(): boolean;
  /**
   * Returns elapsed time since last 'update'
   */
  get elapsed(): number;
  /**
   * Returns true if instance is disposed
   */
  get isDisposed(): boolean;
  /**
   * Returns true if instance is neither disposed nor expired
   */
  get isValid(): boolean;
}
/**
 * A resource allocated in the Pool
 */
declare class Resource<V> {
  #private;
  readonly pool: Pool<V>;
  /**
   * Constructor.
   * @param pool Pool
   * @param data Data
   */
  constructor(pool: Pool<V>, data: V);
  /**
   * Gets data associated with resource.
   * Throws an error if disposed
   */
  get data(): V;
  /**
   * Changes the data associated with this resource.
   * Throws an error if disposed or `data` is undefined.
   * @param data
   */
  updateData(data: V): void;
  /**
   * Returns a human-readable debug string for resource
   * @returns
   */
  toString(): string;
  /**
   * Assigns a user to this resource.
   * @internal
   * @param user
   */
  _assign(user: PoolUser<V>): void;
  /**
   * Releases a user from this resource
   * @internal
   * @param user
   */
  _release(user: PoolUser<V>): void;
  /**
   * Returns true if resource can have additional users allocated
   */
  get hasUserCapacity(): boolean;
  /**
   * Returns number of uses of the resource
   */
  get usersCount(): number;
  /**
   * Returns true if automatic expiry is enabled, and that interval
   * has elapsed since the users list has changed for this resource
   */
  get isExpiredFromUsers(): boolean;
  /**
   * Returns true if instance is disposed
   */
  get isDisposed(): boolean;
  /**
   * Disposes the resource.
   * If it is already disposed, it does nothing.
   * @param reason
   * @returns
   */
  dispose(reason: string): void;
}
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
declare class Pool<V> {
  #private;
  private _resources;
  private _users;
  readonly capacity: number;
  readonly userExpireAfterMs: number;
  readonly resourcesWithoutUserExpireAfterMs: number;
  readonly capacityPerResource: number;
  readonly fullPolicy: FullPolicy;
  private generateResource?;
  readonly freeResource?: (v: V) => void;
  readonly log: LogSet;
  /**
   * Constructor.
   *
   * By default, no capacity limit, one user per resource
   * @param options Pool options
   */
  constructor(options?: PoolOptions<V>);
  /**
   * Returns a debug string of Pool state
   * @returns
   */
  dumpToString(): string;
  /**
   * Sorts users by longest elapsed time since update
   * @returns
   */
  getUsersByLongestElapsed(): PoolUser<V>[];
  /**
   * Returns resources sorted with least used first
   * @returns
   */
  getResourcesSortedByUse(): Resource<V>[];
  /**
   * Adds a shared resource to the pool
   * @throws Error if the capacity limit is reached or resource is null
   * @param resource
   * @returns
   */
  addResource(resource: V): Resource<V>;
  /**
   * Performs maintenance, removing disposed/expired resources & users.
   * This is called automatically when using a resource.
   */
  maintain(): void;
  /**
   * Iterate over resources in the pool.
   * To iterate over the data associated with each resource, use
   * `values`.
   */
  resources(): Generator<Resource<V>, void, unknown>;
  /**
   * Iterate over resource values in the pool.
   * to iterate over the resources, use `resources`.
   *
   * Note that values may be returned even though there is no
   * active user.
   */
  values(): Generator<V, void, unknown>;
  /**
   * Unassociate a key with a pool item
   * @param userKey
   */
  release(userKey: string, reason?: string): void;
  /**
   * @internal
   * @param user
   */
  _release(user: PoolUser<V>): void;
  /**
   * @internal
   * @param resource
   * @param _
   */
  _releaseResource(resource: Resource<V>, _: string): void;
  /**
   * Returns true if `v` has an associted resource in the pool
   * @param resource
   * @returns
   */
  hasResource(resource: V): boolean;
  /**
   * Returns true if a given `userKey` is in use.
   * @param userKey
   * @returns
   */
  hasUser(userKey: string): boolean;
  /**
   * @internal
   * @param key
   * @param resource
   * @returns
   */
  private _assign;
  /**
   * Return the number of users
   */
  get usersLength(): number;
  /**
   * 'Uses' a resource, returning the value
   * @param userKey
   * @returns
   */
  useValue(userKey: string): V;
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
  use(userKey: string): PoolUser<V>;
}
/**
 * Creates an instance of a Pool
 * @param options
 * @returns
 */
declare const create: <V>(options?: PoolOptions<V>) => Pool<V>;
//# sourceMappingURL=pool.d.ts.map
//#endregion
//#region ../flow/dist/src/promise-with-resolvers.d.ts
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
declare function promiseWithResolvers<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
};
//# sourceMappingURL=promise-with-resolvers.d.ts.map
//#endregion
//#region ../flow/dist/src/rate-minimum.d.ts
type RateMinimumOptions<TInput> = Readonly<{
  whatToCall: (args: TInput) => void;
  fallback: () => TInput;
  interval: Interval;
  abort?: AbortSignal;
}>;
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
declare const rateMinimum: <TInput>(options: RateMinimumOptions<TInput>) => (args: TInput) => void;
//# sourceMappingURL=rate-minimum.d.ts.map
//#endregion
//#region ../flow/dist/src/repeat.d.ts
type RepeatDelayOpts = RepeatOpts & Readonly<Partial<{
  /**
  * Sleep a fixed period of time regardless of how long each invocation of 'produce' takes
  */
  delay: Interval;
  /**
   * Minimum interval. That is, only sleep if there is time left over after 'produce'
   * is invoked.
   */
  delayMinimum: Interval;
  /**
  * When to perform delay. Default is before 'produce' is invoked.
  * Default: 'before'
  */
  delayWhen: `before` | `after` | `both`;
}>>;
/**
 * Options for repeat
 */
type RepeatOpts = Partial<Readonly<{
  /**
   * If specified, repeating stops if this function returns false
   * @param count
   * @returns
   */
  while: (count: number) => boolean;
  /**
   * By default, if the callback returns
   * _undefined_ the repeating exits. Set this to _true_ to
   * ignore undefined values
   * @default false
   */
  allowUndefined: boolean;
  /**
   * Optional signal to abort
   */
  signal: AbortSignal;
  /**
   * Maximum times to repeat (default: no limit)
   */
  count: number;
  /**
   * Function to call when initialising
   * @returns
   */
  onStart: () => void;
  /**
   * Function to call when done (or an error occurs)
   * @returns
   */
  onComplete: (withError: boolean) => void;
}>>;
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
declare function repeat<T extends BasicType>(produce: ResolveToValue<T> | ArrayLike<T>, opts: RepeatDelayOpts): AsyncGenerator<T>;
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
declare function repeatSync<T extends BasicType>(produce: ResolveToValueSync<T> | ArrayLike<T>, opts: RepeatOpts): Generator<T, void, unknown>;
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
//# sourceMappingURL=repeat.d.ts.map
//#endregion
//#region ../flow/dist/src/req-resp-match.d.ts
type RequestResponseOptions<TRequest, TResp> = {
  timeoutMs: number;
  key: (requestOrResp: TRequest | TResp) => string;
  keyRequest: (request: TRequest) => string;
  keyResponse: (resp: TResp) => string;
  whenUnmatchedResponse: `ignore` | `throw`;
};
type RequestResponseMatchEvents<TRequest, TResp> = {
  match: {
    request: TRequest;
    response: TResp;
  };
  completed: {
    request: TRequest;
    response: TResp | string;
    success: boolean;
  };
};
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
declare class RequestResponseMatch<TRequest, TResp> extends SimpleEventEmitter<RequestResponseMatchEvents<TRequest, TResp>> {
  #private;
  timeoutMs: any;
  whenUnmatchedResponse: any;
  keyRequest: any;
  keyResponse: any;
  constructor(options?: Partial<RequestResponseOptions<TRequest, TResp>>);
  debugDump(): void;
  /**
   * Make a request and get the outcome via a Promise
   * @param request
   */
  request(request: TRequest): Promise<TResp>;
  /**
   * Makes a request with a callback for the outcome
   * @param request
   * @param callback
   */
  request(request: TRequest, callback: (error: boolean, response: TResp | string) => void): void;
  /**
   * Make a request and don't wait for the outcome.
   * @param request
   */
  requestAndForget(request: TRequest): void;
  /**
   * Response has been received
   * @param response Response
   * @returns _True_ if response matched a request
   */
  response(response: TResp, keepAlive: boolean): boolean;
}
//# sourceMappingURL=req-resp-match.d.ts.map
//#endregion
//#region ../flow/dist/src/retry.d.ts
/**
 * Result of backoff
 */
type RetryResult<V> = {
  /**
   * Message describing outcome.
   *
   * If retry was aborted, message will be abort reason.
   */
  readonly message?: string;
  /**
   * True if callback function was invoked once where it returned _true_
   */
  readonly success: boolean;
  /**
   * Number of times callback was attempted
   */
  readonly attempts: number;
  /**
   * Total elapsed time since beginning of call to `retry`
   */
  readonly elapsed: number;
  /**
   * Value returned by succeeding function,
   * or _undefined_ if it failed
   */
  readonly value: V | undefined;
};
type BackoffOptions = {
  /**
   * Initial value.
   * Default: 1
   */
  startAt: number;
  /**
   * Maximum times to run.
   * Default: continues forever
   */
  limitAttempts: number;
  /**
   * Stop retrying if this maximum is reached
   * Default: no limit
   */
  limitValue: number;
  /**
   * Math power.
   * Default: 1.1
   */
  power: number;
};
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
declare function backoffGenerator(options?: Partial<BackoffOptions>): Generator<number, void, unknown>;
/**
 * Backoff options
 */
type RetryOpts<T> = BackoffOptions & {
  /**
   * Initial waiting period before first attempt (optional)
   */
  readonly predelayMs: number;
  /**
   * Optional abort signal
   */
  readonly abort: AbortSignal;
  /**
   * Log: _true_ monitors the task execution by logging to console
   */
  readonly log: boolean;
  /***
   * Default task value to return if it fails
   */
  readonly taskValueFallback: T;
};
type RetryTask<T> = {
  /**
   * If `probe` returns {success:true} task is considered
   * complete and retrying stops
   * @returns
   */
  probe: (attempts: number) => Promise<Result<T, any>>;
};
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
declare const retryFunction: <T>(callback: () => Promise<T | undefined>, options?: Partial<RetryOpts<T>>) => Promise<RetryResult<T>>;
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
declare const retryTask: <V>(task: RetryTask<V>, opts?: Partial<RetryOpts<V>>) => Promise<RetryResult<V>>;
//# sourceMappingURL=retry.d.ts.map
//#endregion
//#region ../flow/dist/src/run-once.d.ts
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
declare const runOnce: (onRun: () => boolean) => (() => boolean);
//# sourceMappingURL=run-once.d.ts.map

//#endregion
//#region ../flow/dist/src/sync-wait.d.ts
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
declare class SyncWait {
  #private;
  signal(): void;
  /**
   * Throw away any previous signalled state.
   * This will cause any currently waiters to throw
   */
  flush(): void;
  /**
   * Call with `await` to wait until .signal() happens.
   * If a wait period is specified, an exception is thrown if signal does not happen within this time.
   * @param maximumWaitMs
   */
  forSignal(maximumWaitMs?: number): Promise<void>;
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
  didSignal(maximumWaitMs: number): Promise<boolean>;
}
//# sourceMappingURL=sync-wait.d.ts.map
//#endregion
//#region ../flow/dist/src/task-queue-mutable.d.ts
type AsyncTask = () => Promise<void>;
type TaskQueueEvents = {
  /**
   * Task queue has emptied.
   * @returns
   */
  empty: any;
  /**
   * Task queue was empty and now processing
   * @returns
   */
  started: any;
};
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
declare class TaskQueueMutable extends SimpleEventEmitter<TaskQueueEvents> {
  static readonly shared: TaskQueueMutable;
  private _loop;
  private _queue;
  private constructor();
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
  enqueue(task: () => Promise<void>): any;
  dequeue(): any;
  private processQueue;
  /**
   * Clears all tasks, and stops any scheduled processing.
   * Currently running tasks will continue.
   * @returns
   */
  clear(): void;
  /**
  * Returns true if queue is empty
  */
  get isEmpty(): any;
  /**
   * Number of items in queue
   */
  get length(): any;
}
//# sourceMappingURL=task-queue-mutable.d.ts.map
//#endregion
//#region ../flow/dist/src/throttle.d.ts
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
declare const throttle: (callback: (elapsedMs: number, ...args: readonly unknown[]) => void | Promise<unknown>, intervalMinMs: number) => (...args: unknown[]) => Promise<void>;
//# sourceMappingURL=throttle.d.ts.map
//#endregion
//#region ../flow/dist/src/timer.d.ts
/**
 * Creates a timer
 */
type TimerSource = () => Timer;
/**
 * A timer instance.
 * {@link CompletionTimer} also contains an 'isDone' field.
 *
 * Implementations: {@link elapsedMillisecondsAbsolute}, {@link elapsedTicksAbsolute}, {@link frequencyTimer}
 */
type Timer = {
  reset(): void;
  get elapsed(): number;
};
/**
 * A {@link Timer} that has a sense of completion, when `isDone` returns _true_.
 * See {@link relative}
 */
type CompletionTimer = Timer & {
  /**
   * Returns _true_ if this timer has completed.
   */
  get isDone(): boolean;
};
type ModulationTimer = CompletionTimer & {
  mod(amt: number): void;
};
type TimerOpts = {
  /**
   * Timer to use. By default {@link elapsedMillisecondsAbsolute}.
   */
  readonly timer: Timer;
};
/**
 * Options for relative timer
 */
type RelativeTimerOpts = TimerOpts & {
  /**
   * If true, returned value will be clamped to 0..1. False by default
   */
  readonly clampValue: boolean;
  readonly wrapValue: boolean;
};
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
declare function hasElapsed(elapsed: Interval): () => boolean;
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
declare function ofTotal(duration: Interval, opts?: {
  readonly clampValue?: boolean;
  readonly wrapValue?: boolean;
}): () => number;
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
declare function ofTotalTicks(totalTicks: number, opts?: {
  readonly clampValue?: boolean;
  readonly wrapValue?: boolean;
}): () => number;
/**
 * Returns a {@link ModulationTimer} that is always at 100%.
 * Opposite: {@link timerNeverDone}.
 * @returns
 */
declare const timerAlwaysDone: () => ModulationTimer;
/**
 * Returns a {@link ModulationTimer} that is always at 0%.
 * Opposite: {@link timerAlwaysDone}.
 * @returns
 */
declare const timerNeverDone: () => ModulationTimer;
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
declare const relative: (total: number, options?: Partial<RelativeTimerOpts>) => ModulationTimer;
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
declare const frequencyTimer: (frequency: number, options?: Partial<TimerOpts>) => ModulationTimer;
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
declare const elapsedMillisecondsAbsolute: () => Timer;
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
declare const elapsedTicksAbsolute: () => Timer & {
  peek: number;
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
declare const timerWithFunction: (fn: ((v: number) => number), timer: CompletionTimer) => HasCompletion & CompletionTimer & {
  compute: () => number;
};
//# sourceMappingURL=timer.d.ts.map
//#endregion
//#region ../flow/dist/src/types.d.ts
type AsyncPromiseOrGenerator<V> = (() => Promise<V> | Promise<undefined>) | (() => V | undefined) | Generator<V> | IterableIterator<V> | AsyncIterableIterator<V> | AsyncGenerator<V> | AsyncIterable<V> | Iterable<V>;
//# sourceMappingURL=types.d.ts.map
//#endregion
//#region ../flow/dist/src/update-outdated.d.ts
type UpdateFailPolicy = `fast` | `slow` | `backoff`;
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
declare const updateOutdated: <V>(fn: (elapsedMs?: number) => Promise<V>, interval: Interval, updateFail?: UpdateFailPolicy) => (() => Promise<V>);
//# sourceMappingURL=update-outdated.d.ts.map
//#endregion
//#region ../flow/dist/src/wait-for-value.d.ts
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
declare class WaitForValue<T> {
  #private;
  constructor();
  /**
   * Gets the promise
   * ```js
   * const wv = new WaitForValue();
   *
   * await wv.get();
   * ```
   * @returns
   */
  get(): Promise<T>;
  /**
   * Adds a value, triggering promise resolution.
   *
   * Throws an exception if queue has already been used. Use {@link isUsed} to check.
   * @param value
   */
  add(value: T): void;
  /**
   * Returns _true_ if a value has been added
   * and therefore no more values can be written
   */
  get isUsed(): boolean;
}
/**
 * {@inheritDoc WaitForValue}
 */
declare const singleItem: <T>() => WaitForValue<T>;
//# sourceMappingURL=wait-for-value.d.ts.map

//#endregion
//#region ../flow/dist/src/wait-for.d.ts
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
declare const waitFor: (timeoutMs: number, onAborted: (reason: string) => void, onComplete?: (success: boolean) => void) => (error?: string) => void;
//# sourceMappingURL=wait-for.d.ts.map
declare namespace index_d_exports$1 {
  export { AsyncPromiseOrGenerator, AsyncTask, BackoffOptions, BtNode, BtNodeBase, CompletionTimer, Continuously, ContinuouslyAsyncCallback, ContinuouslyOpts, ContinuouslySyncCallback, DebouncedFunction, DelayOpts, Dispatch, DispatchList, ExpressionOrResult, FullPolicy, HasCompletion, HasCompletionRunStates, ModulationTimer, MovingAverageTimedOptions, OnStartCalled, Pool, PoolOptions, PoolState, PoolUser, PoolUserEventMap, RateMinimumOptions, RelativeTimerOpts, RepeatDelayOpts, RepeatOpts, RequestResponseMatch, RequestResponseMatchEvents, RequestResponseOptions, Resource, RetryOpts, RetryResult, RetryTask, RunOpts, RunSingleOpts, SelNode, SeqNode, index_d_exports as StateMachine, SyncWait, Task, TaskQueueEvents, TaskQueueMutable, TaskState, Timeout, TimeoutAsyncCallback, TimeoutSyncCallback, Timer, TimerOpts, TimerSource, Traversal, UpdateFailPolicy, WaitForValue, backoffGenerator, continuously, create, debounce, delay, delayLoop, elapsedMillisecondsAbsolute, elapsedTicksAbsolute, eventRace, everyNth, frequencyTimer, hasElapsed, iterateBreadth, iterateDepth, movingAverageTimed, ofTotal, ofTotalTicks, promiseWithResolvers, rateMinimum, relative, repeat, repeatSync, retryFunction, retryTask, run, runOnce, runSingle, singleItem, sleep, throttle, timeout, timerAlwaysDone, timerNeverDone, timerWithFunction, updateOutdated, waitFor };
}
//#endregion
export { Timer, index_d_exports$1 as index_d_exports };
//# sourceMappingURL=index-DSIfkq7l.d.ts.map