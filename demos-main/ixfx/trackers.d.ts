import "./is-equal-BzhoT7pd.js";
import { Interval, KeyValue, ToString } from "./types-CcY4GIC4.js";
import { GetOrGenerate } from "./maps-Di0k-jsW.js";
import { KeyValueSortSyles } from "./key-value-ww1DZidG.js";
import { SimpleEventEmitter } from "./index-CZIsUroQ.js";
import { NumbersComputeResult } from "./index-iwzx6A0f.js";

//#region ../trackers/src/changes.d.ts
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
//#region ../trackers/src/frequency-mutable.d.ts
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
//#region ../trackers/src/types.d.ts
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
//#region ../trackers/src/tracker-base.d.ts
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
//#region ../trackers/src/primitive-tracker.d.ts
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
//#region ../trackers/src/number-tracker.d.ts
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
//#region ../trackers/src/interval-tracker.d.ts
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
//#region ../trackers/src/rate-tracker.d.ts
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
//#region ../trackers/src/object-tracker.d.ts
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
//#region ../trackers/src/tracked-value.d.ts
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

//#endregion
export { FrequencyEventMap, FrequencyTracker, IntervalTracker, NumberTracker, NumberTrackerResults, ObjectTracker, PrimitiveTracker, RateTracker, RateTrackerOpts, Timestamped, TimestampedObject, TimestampedPrimitive, TrackChangeOptions, TrackChangeResult, TrackNumberChangeOptions, TrackedValueMap, TrackedValueOpts, TrackerBase, TrimReason, frequency, handleChangeResult, interval, number, rate, trackBooleanChange, trackNumberChange };
//# sourceMappingURL=trackers.d.ts.map