import { ChangeRecord, InterpolateOptions, PathDataChange, Processors } from "./index-BGP5MfB7.js";
import { RecursivePartial } from "./ts-utility-DZKsU5oa.js";
import { IsEqual, IsEqualContext } from "./is-equal-BzhoT7pd.js";
import { Interval, Primitive, RankFunction, RankOptions } from "./types-CcY4GIC4.js";
import { IQueueMutableWithEvents } from "./index-BD4Xy9K5.js";

//#region ../rx/dist/src/ops/types.d.ts
type SyncOptions = {
  /**
   * How to handle when a source completes.
   * * 'allow' means we continue synchronising with remaining alive sources. Use 'finalValue' option to control what data is returned for completed sources
   * * 'break' means we stop the stream, because synchronisation across all sources is no longer possible.
   *
   * Default: 'break'.
   */
  onSourceDone: `allow` | `break`;
  /**
   * Maximum time to wait for synchronisation to happen.
   * If interval is exceeded, stream closes.
   * Default: 2s
   */
  maximumWait: Interval;
  /**
   * If we continue synchronisation when a source is done (via `onSourceDone:'allow'`),
   * what source should be returned for a completed source?
   * * 'undefined': _undefined_
   * * 'last': the last received value, or _undefined_
   *
   * Default: 'undefined'
   */
  finalValue: `undefined` | `last`;
};
/**
 * Switcher options.
 *
 * match (default: 'first')
 * * 'first': Outputs to first case where predicate is _true_
 * * 'all': Outputs to all cases where predicate is _true_
 */
type SwitcherOptions = {
  match: `first` | `all`;
};
/**
 * Transform options
 */
type TransformOpts = InitStreamOptions & {
  traceInput: boolean;
  traceOutput: boolean;
};
type ChunkOptions = InitStreamOptions & {
  /**
   * If _true_ (default) remaining results are yielded
   * if source closes. If _false_, only chunks that meet
   * `elapsed` or `quantity` are emitted.
   */
  returnRemainder: boolean;
  /**
   * Amount of time to gather results for a chunk.
   * 'elapsed' and 'quantity' is ORed. Meaning a chunk will the minimum of
   * 'elapsed' and 'quantity'
   */
  elapsed: Interval;
  /**
   * Number of items to gather for a chunk.
   * 'elapsed' and 'quantity' is ORed. Meaning a chunk will the minimum of
   * 'elapsed' and 'quantity'
   */
  quantity: number;
};
type DebounceOptions = InitStreamOptions & {
  /**
   * Minimum time between events. Default 50ms
   */
  elapsed: Interval;
};
type FilterPredicate<In> = (value: In) => boolean;
type ThrottleOptions = InitStreamOptions & {
  elapsed: Interval;
};
type SplitOptions = {
  quantity: number;
};
type FieldOptions<TSource, TValue> = InitStreamOptions & {
  /**
   * If `field` is missing on a value, it is query from this object instead.
   * If this also is missing, `fallbackFieldValue` is attempted.
   */
  fallbackObject: TSource;
  /**
   * If `field` is missing on a value and `fallbackObject` (if specified),
   * this value is used in its place.
   * If not set, no value is emitted when the field is missing.
   */
  fallbackFieldValue: TValue;
};
type SingleFromArrayOptions<V> = {
  /**
   * Function to select a single value from array
   * @param value
   * @returns
   */
  predicate: (value: V) => boolean;
  /**
   * `default`: leave array in same order (default option)
   * `random`: shuffles array before further processing
   * function: function that sorts values
   */
  order: `default` | `random` | ((a: V, b: V) => number);
  /**
   * Selects an index from array. 0 being first, 1 being second.
   * Reverse indexing also works: -1 being last, -2 being second last...
   *
   * If index exceeds length of array, _undefined_ is returned
   */
  at: number;
};
type OpAsAnnotation = {
  annotate: true;
};
type OpMathOptions = Partial<InitStreamOptions> & {
  annotate?: boolean;
  /**
   * If _true_ (default) operations that return _undefined_ do not emit a value.
   * If _false_, _undefined_ is potentially emitted
   */
  skipUndefined?: boolean;
  /**
   * If _true_ (default) operations only emit a value if it has changed.
   * In the case of `max()`, for example, a stream of '1, 2, 3, 2, 1' would emit '1, 2, 3'.
   * If _false_ was used, same input would emit '1, 2, 3, 3, 3'
   */
  skipIdentical?: boolean;
};
//# sourceMappingURL=types.d.ts.map
//#endregion
//#region ../rx/dist/src/from/types.d.ts
type TriggerValue<TTriggerValue> = {
  value: TTriggerValue;
};
/**
 * Options for the 'count' source.
 */
type CountOptions = {
  /**
   * Determines when counting starts
   * @defaultValue 'initial'
   */
  lazy: Lazy;
  /**
   * Amount to increment by
   * @defaultValue 1
   */
  amount: number;
  /**
   * Where to begin counting
   * @defaultValue 0
   */
  offset: number;
  /**
   * How long to wait before incrementing.
   * @defaultValue 1 second
   */
  interval: Interval;
  /**
   * Abort signal to trigger the source to close.
   */
  signal: AbortSignal;
};
/**
 * Function which returns a result. Or promised result.
 *
 * `abort` value is a callback to exit out of looped execution.
 */
type FunctionFunction<T> = ((abort: (reason: string) => void) => T) | ((abort: (reason: string) => void) => Promise<T>);
type ArrayOptions = {
  /**
   * Interval between each item being read. Default: 5ms.
   */
  interval: Interval;
  lazy: Lazy;
  /**
   * Behaviour when reactive stops, for example due to having no subscribers
   * * continue: iteration continues through array where it left off
   * * reset: iteration begins from start of array
   */
  whenStopped: `continue` | `reset`;
  debugLifecycle: boolean;
  signal: AbortSignal;
};
/**
 * Function which returns a result. Or promised result.
 * Takes a `value` as first parameter, and callback to signal an abort as the second.
 */
type PingedFunctionFunction<T, TSource> = ((value: TSource, abort: (reason: string) => void) => T) | ((value: TSource, abort: (reason: string) => void) => Promise<T>);
/**
 * Trigger that calls a `fn`.
 * If `fn` returns _undefined_, it means the trigger is complete
 */
type TriggerFunction<TTriggerValue> = {
  fn: () => TTriggerValue;
};
type TriggerGenerator<TTriggerValue> = {
  gen: IterableIterator<TTriggerValue>;
};
/**
 * A trigger can be a value, a function or generator. Value triggers never complete.
 *
 * A trigger function is considered complete if it returns undefined.
 * A trigger generator is considered complete if it returns done.
 *
 */
type Trigger<TTriggerValue> = TriggerValue<TTriggerValue> | TriggerFunction<TTriggerValue> | TriggerGenerator<TTriggerValue>;
type TimeoutPingOptions = Interval & {
  /**
   * If abort signals, it will disable
   */
  abort?: AbortSignal;
};
type TimeoutValueOptions<TTriggerValue> = Trigger<TTriggerValue> & {
  /**
   * Whether to repeatedly trigger even if upstream source doesn't emit values.
   * When _false_ (default) it will emit a max of one value after a source value if `interval` is reached.
   * When _true_, it will continue emitting values at `interval`.
   * Default: false
   */
  repeat?: boolean;
  /**
   * Interval before emitting trigger value
   * Default: 1s
   */
  interval: Interval;
  /**
   * If _true_ (default) start the timeout
   * immediately, even before the first value.
   * If _false_, it won't timeout until the first
   * upstream value happens.
   */
  immediate?: boolean;
};
/**
 * Options when creating a reactive object.
 */
type ObjectOptions<V extends Record<string, unknown>> = {
  /**
   * _false_ by default.
   * If _true_, inherited fields are included. This is necessary for event args, for example.
   */
  deepEntries: boolean;
  /**
   * Uses JSON.stringify() by default.
   * Fn that returns _true_ if two values are equal, given a certain path.
   */
  eq: IsEqualContext<V>;
};
type ValueToPingOptions<TUpstream> = {
  /**
   * If set, this function acts as a threshold gate.
   * If the function returns _true_ the upstream value will trigger a ping
   * Otherwise the value won't trigger a ping.
   *
   * By default all values trigger a ping.
   * @param value
   * @returns
   */
  gate: (value: TUpstream) => boolean;
  /**
   * Laziness
   * * start: only begins on first subscriber. Keeps running even when there are no subscribers
   * * very: only begins on first subscriber. Stops looping if there are no subscribers
   * * never: begins calling function when initalised and doesn't stop until Reactive is disposed
   */
  lazy: Lazy;
  /**
    * If specified, signal is checked to prevent function execution.
    * Also used for aborting a looped fromFunction.
  */
  signal: AbortSignal;
};
type PingedFunctionOptions = {
  /**
   * If _true_, stream closes if function throws an error.
   * If _false_, errors are emitted as signals, but stream is not closed.
   * Default: _true_
   */
  closeOnError: boolean;
  /**
   * Laziness
   * * start: only begins on first subscriber. Keeps running even when there are no subscribers
   * * very: only begins on first subscriber. Stops looping if there are no subscribers
   * * never: begins calling function when initalised and doesn't stop until Reactive is disposed
   */
  lazy: Lazy;
  /**
    * If specified, a time before invoking function.
    * If `repeat` is used, this is in addition to `interval` time.
    */
  predelay: Interval;
  /***
  * If specified, signal is checked to prevent function execution.
  * Also used for aborting a looped fromFunction.
  */
  signal: AbortSignal;
};
/**
 * Options when creating a reactive object.
 */
type ArrayObjectOptions<V> = {
  /**
   * Uses JSON.stringify() by default.
   * Fn that returns _true_ if two values are equal, given a certain path.
   */
  eq: IsEqual<V>;
};
type FunctionOptions = Partial<InitLazyStreamOptions> & {
  /**
   * If _true_, stream closes if function throws an error.
   * If _false_, errors are emitted as signals, but stream is not closed.
   * Default: _true_
   */
  closeOnError: boolean;
  /**
   * Laziness
   * * start: only begins on first subscriber. Keeps running even when there are no subscribers
   * * very: only begins on first subscriber. Stops looping if there are no subscribers
   * * never: begins calling function when initalised and doesn't stop until Reactive is disposed
   */
  lazy: Lazy;
  /**
   * If _true_, no automatic calling of function will happen, it will only
   * be executed if the reactive gets a ping
   * When this is set, 'interval' is ignored. 'maximumRepeats' and 'predelay' still apply.
   * Default: _false_
  */
  manual: boolean;
  /**
   * If specified, sets an upper limit of how many times we loop
   * (if this is also enabled)
   */
  maximumRepeats: number;
  /**
   * If specified, function is called repeatedly with this delay
   */
  interval: Interval;
  /**
   * If specified, a time before invoking function.
   * If `repeat` is used, this is in addition to `interval` time.
   */
  predelay: Interval;
  /***
   * If specified, signal is checked to prevent function execution.
   * Also used for aborting a looped fromFunction.
   */
  signal: AbortSignal;
};
type GeneratorOptions = {
  traceLifecycle: boolean;
  /**
   * Wait between reading from generator
   * Default: 5ms
   */
  readInterval: Interval;
  /**
   * Timeout when waiting for a value
   * Default: `{ mins: 5 }`
   */
  readTimeout: Interval;
  /**
   * If _true_, only accesses the generator if there is a subscriber.
   * Default: true
   */
  lazy: Lazy;
  signal: AbortSignal;
  /**
   * Behaviour when reactive stops, for example due to having no subscribers
   * * continue: iteration continues through array where it left off
   * * reset: iteration begins from start of array
   */
  whenStopped: `continue` | `reset`;
};
type EventSourceOptions = {
  /**
   * If true, behaves like Source.object where event
   * properties are compared and source only
   * emits where there is a change.
   *
   * Default: _false_
   */
  diff?: boolean;
  lazy?: Lazy;
  /**
   * If true, log messages are emitted
   * when event handlers are added/removed
   */
  debugLifecycle?: boolean;
  /**
   * If true, log messages are emitted
   * when the source event fires
   */
  debugFiring?: boolean;
};
type EventSourceTriggerOptions = EventSourceOptions & {
  /**
   * If _true_ sends an initial trigger when starting
   * Default: false
   */
  fireInitial: boolean;
};
type EventPluckedFieldOptions<T> = {
  lazy?: Lazy;
  initialValue: T;
};
type EventPluckedFieldOptions2<TDomSource, TValueDestination> = {
  lazy?: Lazy;
  initialValue: TValueDestination;
  domToValue: (value: TDomSource | undefined) => TValueDestination | undefined;
  valueToDom: (value: TValueDestination) => TDomSource;
};
type DerivedFunction<TOutput> = (...args: unknown[]) => TOutput;
type DerivedOptions<TResult, T> = {
  ignoreIdentical: boolean;
  eq: (a: TResult, b: TResult) => boolean;
} & CombineLatestOptions & UpstreamOptions<T>;
//# sourceMappingURL=types.d.ts.map
//#endregion
//#region ../rx/dist/src/sinks/dom.d.ts
type SetHtmlOptionsQuery = {
  query: string;
};
type SetHtmlOptionsElement = {
  el: HTMLElement;
};
type SetHtmlOptions = (SetHtmlOptionsQuery | SetHtmlOptionsElement) & {
  /**
   * If _true_ .innerHTML is used
   * If _false_ (default) .textContent is used
   */
  asHtml?: boolean;
};
/**
 * Values from `input` are set to the textContent/innerHTML of an element.
 * ```js
 * const rxSource = Rx.From.string('hello');
 * const rxSet = Rx.Sinks.setHtmlText(rxSource, { query: })
 * ```
 * @param rxOrSource
 * @param optionsOrElementOrQuery
 */
declare const setHtmlText: (rxOrSource: ReactiveOrSource<any>, optionsOrElementOrQuery: SetHtmlOptions | string | HTMLElement) => Unsubscriber;
//# sourceMappingURL=dom.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/math.d.ts
declare function max(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number>;
declare function max(input: ReactiveOrSource<any>, options: OpAsAnnotation & OpMathOptions): Reactive<{
  value: number;
  max: number;
}>;
declare function min(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number>;
declare function min(input: ReactiveOrSource<any>, options: OpAsAnnotation & OpMathOptions): Reactive<{
  value: number;
  min: number;
}>;
declare function average(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number>;
declare function average(input: ReactiveOrSource<any>, options: OpAsAnnotation & OpMathOptions): Reactive<{
  value: number;
  average: number;
}>;
declare function sum(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number>;
declare function sum(input: ReactiveOrSource<any>, options: OpAsAnnotation & OpMathOptions): Reactive<{
  value: number;
  sum: number;
}>;
type TallyOptions = OpMathOptions & {
  countArrayItems: boolean;
};
declare function tally(input: ReactiveOrSource<any>, options: Partial<TallyOptions>): Reactive<number>;
declare function tally<TIn>(input: ReactiveOrSource<TIn>, options: OpAsAnnotation & Partial<TallyOptions>): Reactive<{
  value: TIn;
  tally: number;
}>;
declare function rank<TIn>(input: ReactiveOrSource<any>, rank: RankFunction<TIn>, options: Partial<RankOptions & OpMathOptions>): Reactive<TIn>;
declare function rank<TIn>(input: ReactiveOrSource<any>, rank: RankFunction<TIn>, options: OpAsAnnotation & Partial<RankOptions & OpMathOptions>): Reactive<{
  value: TIn;
  rank: TIn;
}>;
//# sourceMappingURL=math.d.ts.map
//#endregion
//#region ../rx/dist/src/types.d.ts
type CombineLatestOptions = {
  /**
   * If _true_, disposes all the merged sources when the merged reactive closes.
   * Default: _true_.
   */
  disposeSources: boolean;
  /**
   * How to handle when a source ends.
   * * 'allow': continue combined stream, last value for done stream will kept
   * * 'break': stop combined stream
   *
   * Default: 'break'
   */
  onSourceDone: `allow` | `break`;
  /**
   * If _true_ (default), emits a value when initialised.
   */
  emitInitial: boolean;
};
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
declare const symbol: unique symbol;
type SignalKinds = `done` | `warn`;
type Passed<V> = {
  value: V | undefined;
  signal?: SignalKinds;
  context?: string;
};
type PassedSignal = Passed<any> & {
  value: undefined;
  signal: SignalKinds;
  context: string;
};
type PassedValue<V> = Passed<V> & {
  value: V;
};
type UpstreamOptions<In> = {
  lazy: Lazy;
  /**
   * If _true_ (default), we dispose the underlying stream if the upstream closes. This happens after onStop() is called.
   */
  disposeIfSourceDone: boolean;
  onValue: (v: In) => void;
  /**
   * Called just before we subscribe to source
   * @returns
   */
  onStart: () => void;
  /**
   * Called after we unsubscribe from source
   * @returns
   */
  onStop: () => void;
  debugLabel: string;
  onDispose: (reason: string) => void;
};
type UpstreamInitialOptions<In> = UpstreamOptions<In> & {
  initialValue: In;
};
/**
 * Wrapped Reactive for object-oriented access
 */
type Wrapped<TIn> = {
  enacts: {
    setHtmlText: (options: SetHtmlOptions) => () => void;
  };
  source: Reactive<TIn>;
  /**
   * Annotate values with output from the `annotation` function.
   * Returned values will be in the form `{ value:TIn, annotation:TAnnotation }`
   * @param transformer
   * @returns
   */
  annotate: <TAnnotation>(transformer: (value: TIn) => TAnnotation) => Wrapped<{
    value: TIn;
    annotation: TAnnotation;
  }>;
  annotateWithOp: <TOut>(op: ReactiveOp<TIn, TOut>) => Wrapped<{
    value: TIn;
    annotation: TOut;
  }>;
  /**
  * Accumulate a chunk of values, emitted as an array
  * @param options
  * @returns
  */
  chunk: (options: Partial<ChunkOptions>) => Wrapped<TIn[]>;
  debounce: (options: Partial<DebounceOptions>) => Wrapped<TIn>;
  /**
   * Pluck and emit a single field from values
   * @param fieldName
   * @param options
   * @returns
   */
  field: <TSource, TFieldType>(fieldName: keyof TIn, options: Partial<FieldOptions<TSource, TFieldType>>) => Wrapped<TFieldType>;
  /**
   * Throws away values that don't match `predicate`
   * @param predicate
   * @param options
   * @returns
   */
  filter: (predicate: FilterPredicate<TIn>, options: Partial<InitStreamOptions>) => Wrapped<TIn>;
  combineLatestToArray: <const T extends readonly ReactiveOrSource<any>[]>(sources: T, options: Partial<CombineLatestOptions>) => Wrapped<RxValueTypes<T>>;
  combineLatestToObject: <const T extends Record<string, ReactiveOrSource<any>>>(sources: T, options: {
    name: string;
  } & Partial<CombineLatestOptions>) => Wrapped<RxValueTypeObject<T>>;
  min: (options?: Partial<OpMathOptions>) => Wrapped<number>;
  max: (options?: Partial<OpMathOptions>) => Wrapped<number>;
  average: (options?: Partial<OpMathOptions>) => Wrapped<number>;
  sum: (options?: Partial<OpMathOptions>) => Wrapped<number>;
  tally: (options?: Partial<TallyOptions>) => Wrapped<number>;
  /**
   * Converts one source stream into two, with values being emitted by both
   * @param options
   * @returns
   */
  split: (options?: Partial<SplitOptions>) => Wrapped<TIn>[];
  /**
  * Emits values when this stream and any additional streams produce a value. The resulting stream is
  * thus an array of values, each source at a given index.
  * Waits to output a value until each stream has produced a value. Thus, the pace is determined by
  * the slowest stream.
  * @returns
  */
  syncToArray: <const T extends readonly ReactiveOrSource<any>[]>(reactiveSources: T, options?: Partial<SyncOptions>) => Wrapped<[TIn, ...RxValueTypes<T>]>;
  syncToObject: <const T extends Record<string, ReactiveOrSource<any>>>(reactiveSources: T, options?: {
    name?: string;
  } & Partial<SyncOptions>) => Wrapped<RxValueTypeObject<T>>;
  /**
   * Creates new streams for each case, sending values to the stream if they match the filter predicate
   * @param cases
   * @param options
   * @returns
   */
  switcher: <TRec extends Record<string, FilterPredicate<TIn>>, TLabel extends keyof TRec>(cases: TRec, options: Partial<SwitcherOptions>) => Record<TLabel, Wrapped<TIn>>;
  /**
   * Creates new streams for each case
   * @param labels
   * @returns
   */
  splitLabelled: <K extends keyof TIn>(...labels: K[]) => Record<K, Wrapped<TIn>>;
  /**
   * Taps the stream, passing values to one or more 'processor' functions.
   * This processing essentially happens in parallel, not affecting the main stream.
   *
   * ```js
   * // Stream of pointermove events with {x:0,y:0} as default
   * const move = Rx.From.event(document.body, `pointermove`, {x:0,y:0});
   * // Wrap it for fluent access
   * const ptr = Rx.wrap(move)
   *  .tapProcess(
   *    // Create a string representation
   *    v => `${v.x},${v.y}`
   *    // Set to DOM
   *    v => {
   *      document.getElementById(`coords`).innerText = v;
   *    }
   *   )
   *  .onValue(value => {
   *    // 'value' will be original PointerEvent, since .tapProcess happened in parallel,
   *    // not affecting stream
   *  });
   * ```
   * @param processors One-five processing functions
   * @returns
   */
  tapProcess: <T2, T3, T4, T5, T6>(...processors: Processors<TIn, T2, T3, T4, T5, T6>) => Wrapped<TIn>;
  tapStream: (divergedStream: ReactiveWritable<TIn>) => Wrapped<TIn>;
  tapOps: <TOut>(source: ReactiveOrSource<TIn>, ...ops: ReactiveOp<TIn, TOut>[]) => Wrapped<TIn>;
  /**
   * Transforms all values
   * @param transformer
   * @param options
   * @returns
   */
  transform: <TOut>(transformer: (value: TIn) => TOut, options?: Partial<TransformOpts>) => Wrapped<TOut>;
  /**
   * Only allow values through if a minimum of time has elapsed. Throws away values.
   * Ie. converts a fast stream into a slower one.
   * @param options
   * @returns
   */
  throttle: (options: Partial<ThrottleOptions>) => Wrapped<TIn>;
  /**
   * Emits a value if `source` does not emit a value after `interval`
   * has elapsed. This can be useful to reset a reactive to some
   * 'zero' state if nothing is going on.
   *
   * If `source` emits faster than the `interval`, it won't get triggered.
   *
   * Default for 'timeout': 1000s.
   *
   * ```js
   * // Emit 'hello' if 'source' doesn't emit a value after 1 minute
   * const r = Rx.timeoutValue(source, { value: 'hello', interval: { mins: 1 } });
   * ```
   *
   * Can also emit results from a function or generator
   * ```js
   * // Emits a random number if 'source' doesn't emit a value after 500ms
   * const r = Rx.timeoutValue(source, { fn: Math.random, interval: 500 });
   * ```
   *
   * If `immediate` option is _true_ (default), the timer starts from stream initialisation.
   * Otherwise it won't start until it observes the first value from `source`.
   * @param options
   */
  timeoutValue: <TTriggerValue>(options: TimeoutValueOptions<TTriggerValue>) => Wrapped<TIn | TTriggerValue>;
  /**
   * 'Pings' reactive (if it supports it) if a value is not received within a given interval.
   * Behaviour can be stopped using an abort signal.
   * @param options
   * @returns
   */
  timeoutPing: (options: TimeoutPingOptions) => Wrapped<TIn>;
  /**
   * Copies values from source into an array, throwing
   * an error if expected number of items is not reached
   * @param options
   * @returns
   */
  toArrayOrThrow: (options: Partial<ToArrayOptions<TIn>>) => Promise<TIn[]>;
  /**
   * Copies values from source into an array.
   * @param options
   * @returns
   */
  toArray: (options: Partial<ToArrayOptions<TIn>>) => Promise<(TIn | undefined)[]>;
  /**
   * Listen for values
   * @param callback
   * @returns
   */
  onValue: (callback: (value: TIn) => void) => void;
};
type ToArrayOptions<V> = {
  /**
   * Maximim time to wait for `limit` to be reached. 10s by default.
   */
  maximumWait: Interval;
  /**
   * Number of items to read
   */
  limit: number;
  /**
   * Behaviour if threshold is not reached.
   * partial: return partial results
   * throw: throw an error
   * fill: fill remaining array slots with `fillValue`
   */
  underThreshold: `partial` | `throw` | `fill`;
  /**
   * Value to fill empty slots with if `underThreshold = 'fill'`.
   */
  fillValue: V;
};
/**
 * Laziness
 * * start: only begins on first subscriber. Keeps running even when there are no subscribers
 * * very: only begins on first subscriber. Stops looping if there are no subscribers
 * * never: begins calling function when initalised and doesn't stop until Reactive is disposed
 */
type Lazy = `initial` | `never` | `very`;
type InitLazyStreamOptions = Partial<InitStreamOptions> & {
  lazy?: Lazy;
  debugLabel?: string;
  onStart: () => void;
  onStop: () => void;
};
type InitLazyStreamInitedOptions<T> = InitLazyStreamOptions & {
  initialValue: T;
};
type ReactiveOrSource<V> = Wrapped<V> | Reactive<V> | IterableIterator<V> | AsyncIterableIterator<V> | Generator<V> | AsyncGenerator<V> | V[] | (() => V);
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
   * Optional 'set' to write a value. Use {@link ReactiveWritable} if you want this non-optional
   * @param value
   */
  set?(value: V): void;
};
/**
 * A reactive that can be 'pinged' to produce a value.
 *
 * Use {@link isPingable} to check if a reactive is pingable.
 *
 * Pingable reactives are returned from
 * * interpolate
 * * computeWithPrevious
 * * valueToPing
 */
type ReactivePingable<V> = Reactive<V> & {
  ping(): void;
};
type Unsubscriber = () => void;
type ReactiveNonInitial<V> = Reactive<V> & {
  last(): V | undefined;
};
/**
 * A stream that can be written to
 */
type ReactiveWritable<TIn, TOut = TIn> = Reactive<TOut> & {
  /**
   * Sets a value
   * @param value Value to write
   */
  set(value: TIn): void;
};
type ReactiveInitial<V> = Reactive<V> & {
  last(): V;
};
type ReactiveFinite = {
  isDone(): boolean;
};
type ReactiveArray<V> = ReactiveWritable<V[]> & {
  push(value: V): void;
  deleteAt(index: number): void;
  deleteWhere(filter: (value: V) => boolean): number;
  setAt(index: number, value: V): void;
  insertAt(index: number, value: V): void;
  onArray(handler: (changes: Passed<ChangeRecord<number>[]>) => void): () => void;
};
type ObjectFieldHandler = {
  value: any;
  fieldName: string;
  pattern: string;
};
type ReactiveDiff<V> = Reactive<V> & ReactiveWritable<V> & {
  /**
   * Notifies when the value of `fieldName` is changed.
   *
   * Use the returned function to unsubscribe.
   * @param fieldName
   * @param handler
   */
  onField(fieldName: string, handler: (result: ObjectFieldHandler) => void): () => void;
  /**
   * Notifies of which field(s) were changed.
   * If you just care about the whole, changed data use the `value` event.
   *
   * Use the returned function to unsubscribe.
   * @param changes
   */
  onDiff(changes: (changes: PathDataChange<any>[]) => void): () => void;
  /**
   * Updates the reactive with some partial key-value pairs.
   * Keys omitted are left the same as the current value.
   * @param changedPart
   * @returns Returns new value
   */
  update(changedPart: RecursivePartial<V>): V;
  /**
   * Updates a particular field by its path
   * @param field
   * @param value
   */
  updateField(field: string, value: any): void;
};
/**
 * A reactive stream which can be read and written to
 */
type ReactiveStream<V> = Reactive<V> & ReactiveWritable<V> & {
  /**
   * Removes all the subscribers from this stream.
   */
  removeAllSubscribers(): void;
  /**
   * Dispatches a signal
   * @param signal
   * @param context
   */
  signal(signal: SignalKinds, context?: string): void;
};
type ReactiveInitialStream<V> = ReactiveStream<V> & ReactiveInitial<V>;
type PipeSet<In, Out> = [Reactive<In>, ...(Reactive<any> & ReactiveWritable<any>)[]];
type InitStreamOptions = {
  /**
   * Optional label to associate with this stream. Useful for debugging.
   */
  debugLabel: string;
  /**
   * Called when there is a subscriber after there were no subscribers.
   * Useful for 'startup' types of things that we want to run only when someone is actually listening.
   *
   * During the lifeycle of a stream, this could be called multiple times. Eg if all subscribers are removed
   * next time someone subscribes it will get called again.
   * @returns
   */
  onFirstSubscribe: () => void;
  /**
   * Called when there are no longer any subscribers. Useful for shutting down
   * activities now that no-one is listening.
   *
   * During the lifecycle of a stream, this could be called multiple times.
   * @returns
   */
  onNoSubscribers: () => void;
  /**
   * Called whenever the stream disposes. Useful for cleaning up.
   * @param reason
   * @returns
   */
  onDispose: (reason: string) => void;
};
/**
 * WithValue stream options
 */
type WithValueOptions<V> = Partial<InitStreamOptions> & {
  /**
   * Initial value
   */
  initial: V;
  /**
   * Laziness
   */
  lazy?: Lazy;
};
type ResolveOptions = {
  /**
   * How many times to return value or call function.
   * If _infinite_ is set to true, this value is ignored
   */
  loops: number;
  /**
   * If _true_ loops forever
   */
  infinite: boolean;
  /**
   * Delay before value
   */
  interval: Interval;
  lazy: Lazy;
};
type ReactiveOpInit<TIn, TOut, TOpts> = (options: Partial<TOpts>) => ReactiveOp<TIn, TOut>;
type ReactiveOp<TIn, TOut> = (source: ReactiveOrSource<TIn>) => Reactive<TOut>;
type ReactiveOpLinks<In, Out> = [ReactiveOrSource<In>, ...ReactiveOp<any, any>[], ReactiveOp<any, Out>];
type RxValueTypes<T extends readonly ReactiveOrSource<any>[]> = { [K in keyof T]: T[K] extends Reactive<infer V> ? V | undefined : T[K] extends Wrapped<infer V> ? V | undefined : T[K] extends Generator<infer V> ? V | undefined : T[K] extends AsyncGenerator<infer V> ? V | undefined : T[K] extends IterableIterator<infer V> ? V | undefined : T[K] extends AsyncIterableIterator<infer V> ? V | undefined : T[K] extends (infer V)[] ? V | undefined : never };
type RxValueTypeObject<T extends Record<string, ReactiveOrSource<any>>> = { [K in keyof T]: T[K] extends Reactive<infer V> ? V : T[K] extends Wrapped<infer V> ? V : T[K] extends Generator<infer V> ? V : T[K] extends AsyncGenerator<infer V> ? V : T[K] extends IterableIterator<infer V> ? V : T[K] extends AsyncIterableIterator<infer V> ? V : T[K] extends (infer V)[] ? V : never };
type RxValueTypeObjectOrUndefined<T extends Record<string, ReactiveOrSource<any>>> = { [K in keyof T]: T[K] extends Reactive<infer V> ? V | undefined : T[K] extends Wrapped<infer V> ? V | undefined : T[K] extends Generator<infer V> ? V | undefined : T[K] extends AsyncGenerator<infer V> ? V | undefined : T[K] extends IterableIterator<infer V> ? V | undefined : T[K] extends AsyncIterableIterator<infer V> ? V | undefined : T[K] extends (infer V)[] ? V | undefined : never };
type RxValueTypeRx<T extends Record<string, ReactiveOrSource<any>>> = { [K in keyof T]: T[K] extends Reactive<infer V> ? Reactive<V> : T[K] extends Wrapped<infer V> ? Reactive<V> : T[K] extends Generator<infer V> ? Reactive<V> : T[K] extends AsyncGenerator<infer V> ? Reactive<V> : T[K] extends IterableIterator<infer V> ? Reactive<V> : T[K] extends AsyncIterableIterator<infer V> ? Reactive<V> : T[K] extends (infer V)[] ? Reactive<V> : never };
type PrimitiveValueTypeObject<T extends Record<string, Primitive>> = { [K in keyof T]: T[K] extends number ? number | undefined : T[K] extends string ? string | undefined : T[K] extends boolean ? boolean | undefined : T[K] extends bigint ? bigint | undefined : never };
//# sourceMappingURL=types.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/annotate.d.ts
/**
 * Annotates values from `source`. Output values will be
 * in the form `{ value: TIn, annotation: TAnnotation }`.
 * Where `TIn` is the type of the input, and `TAnnotation` is
 * the return type of the annotator function.
 *
 * Example calculating area from width & height:
 * ```js
 * const data = Rx.From.array(
 *  { w: 1, h: 3 }, { w: 1, h: 1 }, { w: 2, h: 2 }
 * );
 * const annotated = Rx.Ops.annotate(data, v => {
 *  return { area: v.w * v.h }
 * });
 * const data = await Rx.toArray(annotated);
 * // Data =  [ { value: { w:1, h:3 }, annotation: { area:3 } } ...]
 * ```
 *
 * If you would rather annotate and have values merge with the input,
 * use `transform`:
 * ```js
 * const data = Rx.From.array(
 *  { w: 1, h: 3 }, { w: 1, h: 1 }, { w: 2, h: 2 }
 * );
 * const withArea = Rx.Ops.transform(data, v => {
 *  return { ...v, area: v.w * v.h }
 * });
 * const data = await Rx.toArray(withArea);
 * // Data =  [ { w:1, h:3, area:3 }, ...]
 * ```
 */
declare function annotate<In, TAnnotation>(input: ReactiveOrSource<In>, annotator: (value: In) => TAnnotation, options?: Partial<TransformOpts>): Reactive<{
  value: In;
  annotation: TAnnotation;
}>;
/**
 * Annotates the input stream using {@link ReactiveOp} as the source of annotations.
 * The output values will have the shape of `{ value: TIn, annotation: TAnnotation }`.
 * Meaning that the original value is stored under `.value`, and the annotation under `.annotation`.
 *
 * ```js
 * const data = Rx.From.array([ 1, 2, 3 ]);
 * const annotated = Rx.Ops.annotateWithOp(data, Rx.Ops.sum());
 * const data = await annotated.toArray(annotated);
 * // Data =  [ { value: 1, annotation: 1 }, { value: 2, annotation: 3 }, { value: 3, annotation: 6 } ]
 * ```
 * @param annotatorOp Operator to generate annotations
 * @param input Input stream
 * @returns
 */
declare function annotateWithOp<In, TAnnotation>(input: ReactiveOrSource<In>, annotatorOp: ReactiveOp<In, TAnnotation>): Reactive<{
  value: In;
  annotation: TAnnotation;
}>;
//# sourceMappingURL=annotate.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/chunk.d.ts
/**
 * Queue from `source`, emitting when thresholds are reached.
 * The resulting Reactive produces arrays.
 *
 * Can use a combination of elapsed time or number of data items.
 *
 * By default options are OR'ed together.
 *
 * ```js
 * // Emit data in chunks of 5 items
 * chunk(source, { quantity: 5 });
 * // Emit a chunk of data every second
 * chunk(source, { elapsed: 1000 });
 * ```
 * @param source
 * @param options
 * @returns
 */
declare function chunk<V>(source: ReactiveOrSource<V>, options?: Partial<ChunkOptions>): Reactive<V[]>;
//# sourceMappingURL=chunk.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/clone-from-fields.d.ts
/**
 * Create a new object from input, based on cloning fields rather than a destructured copy.
 * This is useful for event args.
 * @param source
 * @returns
 */
declare const cloneFromFields: <In>(source: ReactiveOrSource<In>) => Reactive<In>;
//# sourceMappingURL=clone-from-fields.d.ts.map

//#endregion
//#region ../rx/dist/src/ops/combine-latest-to-array.d.ts
/**
 * Monitors input reactive values, storing values as they happen to an array.
 * Whenever a new value is emitted, the whole array is sent out, containing current
 * values from each source, or _undefined_ if not yet emitted.
 *
 * See {@link combineLatestToObject} to combine streams by name into an object, rather than array.
 *
 * ```
 * const sources = [
 *  Rx.fromFunction(Math.random, { loop: true, interval: 100 }),
 *  Rx.fromFunction(Math.random, { loop: true, interval: 200 })
 * ];
 * const r = Rx.combineLatestToArray(sources);
 * r.onValue(value => {
 *  // Value will be an array of last value from each source:
 *  // [number,number]
 * });
 * ```
 *
 * The tempo of this stream will be set by the fastest source stream.
 * See {@link syncToArray} to have pace determined by slowest source, and only
 * send when each source has produce a new value compared to last time.
 *
 * Set `onSourceDone` to choose behaviour if a source stops. By default it
 * is 'break', meaning the whole merged stream stops.
 *
 * Note: unlike RxJS's `combineLatest`, does not wait for each source to emit once
 * before emitting first value.
 * @param reactiveSources Sources to merge
 * @param options Options for merging
 * @returns
 */
declare function combineLatestToArray<const T extends readonly ReactiveOrSource<any>[]>(reactiveSources: T, options?: Partial<CombineLatestOptions>): Reactive<RxValueTypes<T>>;
//# sourceMappingURL=combine-latest-to-array.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/combine-latest-to-object.d.ts
type CombineLatestToObject<T extends Record<string, ReactiveOrSource<any>>> = {
  hasSource: (field: string) => boolean;
  replaceSource: (field: Extract<keyof T, string>, source: ReactiveOrSource<any>) => void;
  /**
   * Reactive sources being combined
   */
  sources: RxValueTypeRx<T>;
  /**
   * Updates writable sources with values.
   * @param data
   * @returns Keys and values set to writable source(s)
   */
  setWith: (data: Partial<RxValueTypeObject<T>>) => Partial<RxValueTypeObject<T>>;
} & ReactiveDiff<RxValueTypeObject<T>> & ReactiveInitial<RxValueTypeObject<T>>;
/**
 * Monitors input reactive values, storing values as they happen to an object.
 * Whenever a new value is emitted, the whole object is sent out, containing current
 * values from each source (or _undefined_ if not yet emitted)
 *
 * See {@link combineLatestToArray} to combine streams by name into an array instead.
 *
 * ```
 * const sources = {
 *  fast: Rx.fromFunction(Math.random, { loop: true, interval: 100 }),
 *  slow: Rx.fromFunction(Math.random, { loop: true, interval: 200 })
 * ];
 * const r = Rx.combineLatestToObject(sources);
 * r.onValue(value => {
 *  // 'value' will be an object containing the labelled latest
 *  // values from each source.
 *  // { fast: number, slow: number }
 * });
 * ```
 *
 * The tempo of this stream will be set by the fastest source stream.
 * See {@link syncToObject} to have pace determined by slowest source, and only
 * send when each source has produce a new value compared to last time.
 *
 * This source ends if all source streams end.
 * @param reactiveSources Sources to merge
 * @param options Options for merging
 * @returns
 */
declare function combineLatestToObject<const T extends Record<string, ReactiveOrSource<any>>>(reactiveSources: T, options?: Partial<CombineLatestOptions>): CombineLatestToObject<T>;
//# sourceMappingURL=combine-latest-to-object.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/compute-with-previous.d.ts
/**
 * When there is a value from `input`, or the reactive is pinged,
 * this reactive emits the result of `fn`.
 *
 * `fn` is provided the previous value as well as the most recent value.
 *
 * If no previous value is available, the current value is emitted and `fn` is not called.
 * @param input
 * @param fn
 * @returns
 */
declare function computeWithPrevious<TIn>(input: ReactiveOrSource<TIn>, fn: (previous: TIn, current: TIn) => TIn): ReactivePingable<TIn>;
//# sourceMappingURL=compute-with-previous.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/debounce.d.ts
declare function debounce<V>(options: Partial<DebounceOptions>): ReactiveOp<V, V>;
//# sourceMappingURL=debounce.d.ts.map

//#endregion
//#region ../rx/dist/src/ops/elapsed.d.ts
/**
 * Emits time in milliseconds since last message.
 * If it is the first value, 0 is used.
 * @param input
 * @returns
 */
declare const elapsed: <In>(input: ReactiveOrSource<In>) => Reactive<number>;
//# sourceMappingURL=elapsed.d.ts.map

//#endregion
//#region ../rx/dist/src/ops/field.d.ts
/**
 * From a source value, yields a field from it. Only works
 * if stream values are objects.
 *
 * If a source value doesn't have that field, it is skipped.
 *
 * @returns
 */
declare function field<TIn extends object, TFieldType>(fieldSource: ReactiveOrSource<TIn>, fieldName: keyof TIn, options?: Partial<FieldOptions<TIn, TFieldType>>): Reactive<TFieldType>;
//# sourceMappingURL=field.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/filter.d.ts
/**
 * Passes all values where `predicate` function returns _true_.
 */
declare function filter<In>(input: ReactiveOrSource<In>, predicate: FilterPredicate<In>, options: Partial<InitStreamOptions>): Reactive<In>;
/**
 * Drops all values where `predicate` function returns _true_.
 */
declare function drop<In>(input: ReactiveOrSource<In>, predicate: FilterPredicate<In>, options: Partial<InitStreamOptions>): Reactive<In>;
//# sourceMappingURL=filter.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/interpolate.d.ts
type OpInterpolateOptions = InterpolateOptions & {
  amount: number;
  /**
   * Percentage of value that we consider 'done'.
   * Since interpolation can never converge to target exactly, this allows us to snap to completion.
   * Default: 0.99, meaning if value gets to within 99%, return the target.
   */
  snapAt: number;
};
/**
 * Interpolates to the source value.
 *
 * Outputs one value for every input value. Thus, to interpolation
 * over time, it's necessary to get the source to emit values at the desired rate.
 *
 * Options can specify an easing name or custom transform of easing progress.
 * @param input
 * @param options
 * @returns
 */
declare function interpolate(input: ReactiveOrSource<number>, options?: Partial<OpInterpolateOptions>): ReactivePingable<number>;
/**
 * From the basis of an input stream of values, run a function over
 * each value. The function takes in the last value from the stream as well as the current.
 * @param input
 * @param fn
 * @returns
 */
//# sourceMappingURL=interpolate.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/pipe.d.ts
/**
 * Pipes the output of one stream into another, in order.
 * The stream returned is a new stream which captures the final output.
 *
 * If any stream in the pipe closes the whole pipe is closed.
 * @param streams
 * @returns
 */
declare const pipe: <TInput, TOutput>(...streams: PipeSet<TInput, TOutput>) => Reactive<TOutput>;
//# sourceMappingURL=pipe.d.ts.map

//#endregion
//#region ../rx/dist/src/ops/single-from-array.d.ts
/**
 * For a stream that emits arrays of values, this op will select a single value.
 *
 * Can select based on:
 * * predicate: a function that returns _true_ for a value
 * * at: selection based on array index (can be combined with random ordering to select a random value)
 *
 * ```js
 * // If source is Reactive<Array<number>>, picks the first even number
 * singleFromArray(source, {
 *  predicate: v => v % 2 === 0
 * });
 *
 * // Selects a random value from source
 * singleFromArray(source, {
 *  order: `random`,
 *  at: 0
 * });
 * ```
 *
 * If neither `predicate` or `at` options are given, exception is thrown.
 * @param source Source to read from
 * @param options Options for selection
 * @returns
 */
declare function singleFromArray<V>(source: ReactiveOrSource<V[]>, options?: Partial<SingleFromArrayOptions<V>>): Reactive<V>;
//# sourceMappingURL=single-from-array.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/split.d.ts
/**
 * Creates a set of streams each of which receives data from `source`.
 * By default these are lazy and dispose if the upstream source closes.
 *
 * See also {@link splitLabelled} to split into named streams.
 * @param rxOrSource
 * @param options
 * @returns
 */
declare const split: <T>(rxOrSource: ReactiveOrSource<T>, options?: Partial<SplitOptions>) => ReactiveStream<T>[];
/**
 * Splits `source` into several duplicated streams.
 * Returns an object with keys according to `labels`.
 * Each value is a stream which echos the values from `source`.
 * ```js
 * const { a, b, c} = splitLabelled(source, `a`, `b`, `c`);
 * // a, b, c are Reactive types
 * ```
 *
 * See also {@link split} to get an unlabelled split
 * @param rxOrSource
 * @param labels
 * @returns
 */
declare const splitLabelled: <T, K extends PropertyKey>(rxOrSource: ReactiveOrSource<T>, labels: K[]) => Record<K, Reactive<T>>;
//# sourceMappingURL=split.d.ts.map

//#endregion
//#region ../rx/dist/src/ops/switcher.d.ts
/**
 * Switcher generates several output streams, labelled according to the values of `cases`.
 * Values from `source` are fed to the output streams if their associated predicate function returns _true_.
 *
 * In this way, we can split one input stream into several output streams, each potentially getting a different
 * subset of the input.
 *
 * With `options`, you can specify whether to send to multiple outputs if several match, or just the first (default behaviour).
 *
 * The below example shows setting up a switcher and consuming the output streams.
 * @example
 * ```js
 * // Initialise a reactive number, starting at 0
 * const switcherSource = Reactive.number(0);
 * // Set up the switcher
 * const x = Reactive.switcher(switcherSource, {
 *  even: v => v % 2 === 0,
 *  odd: v => v % 2 !== 0
 * });
 * // Listen for outputs from each of the resulting streams
 * x.even.on(msg => {
 *   log(`even: ${msg.value}`);
 * });
 * x.odd.on(msg => {
 *   log(`odd: ${msg.value}`);
 * })
 * // Set new values to the number source, counting upwards
 * // ...this will in turn trigger the outputs above
 * setInterval(() => {
 *   switcherSource.set(switcherSource.last() + 1);
 * }, 1000);
 * ```
 *
 * If `source` closes, all the output streams will be closed as well.
 * @param reactiveOrSource
 * @param cases
 * @param options
 * @returns
 */
declare const switcher: <TValue, TRec extends Record<string, FilterPredicate<TValue>>, TLabel extends keyof TRec>(reactiveOrSource: ReactiveOrSource<TValue>, cases: TRec, options?: Partial<SwitcherOptions>) => Record<TLabel, Reactive<TValue>>;
//# sourceMappingURL=switcher.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/sync-to-array.d.ts
/**
 * Waits for all sources to produce a value, sending the combined results as an array.
 * After sending, it waits again for each source to send at least one value.
 *
 * Use {@link syncToObject} to output objects based on labelled sources rather than an array of values.
 *
 * Pace will be set by the slowest source. Alternatively, use {@link combineLatestToArray} where the rate is determined by fastest source.
 *
 * Only complete results are sent. For example if source A & B finish and source C is still producing values,
 * synchronisation is not possible because A & B stopped producing values. Thus the stream will self-terminate
 * after `maximumWait` (2 seconds). The newer values from C are lost.
 */
declare function syncToArray<const T extends readonly ReactiveOrSource<any>[]>(reactiveSources: T, options?: Partial<SyncOptions>): Reactive<RxValueTypes<T>>;
//# sourceMappingURL=sync-to-array.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/sync-to-object.d.ts
declare function syncToObject<const T extends Record<string, ReactiveOrSource<any>>>(reactiveSources: T, options?: Partial<SyncOptions>): Reactive<RxValueTypeObject<T>>;
//# sourceMappingURL=sync-to-object.d.ts.map

//#endregion
//#region ../rx/dist/src/ops/tap.d.ts
/**
 * 'Taps' the values from 'input', passing them to the 'process' function.
 * Return stream is the input stream, unaffected by what 'process' does.
 * @param input Input stream
 * @param processors List of processors
 * @returns
 */
declare function tapProcess<In, T2, T3, T4, T5, T6>(input: ReactiveOrSource<In>, ...processors: Processors<In, T2, T3, T4, T5, T6>): Reactive<In>;
/**
 * 'Taps' the values from 'input', passing them to 'diverged'
 * Returns the original input stream, unaffected by what 'diverged' does.
 * @param input Input stream
 * @param diverged Stream to write to
 * @returns
 */
declare function tapStream<In>(input: ReactiveOrSource<In>, diverged: ReactiveWritable<In>): Reactive<In>;
/**
 * Create a parallel 'tap' of processing
 * @param input Input stream
 * @param ops Series of ops to process data
 * @returns
 */
declare const tapOps: <TIn, TOut>(input: ReactiveOrSource<TIn>, ...ops: ReactiveOp<TIn, TOut>[]) => Reactive<TOut>;
//# sourceMappingURL=tap.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/throttle.d.ts
/**
 * Only allow a value through if a minimum amount of time has elapsed.
 * since the last value. This effectively slows down a source to a given number
 * of values/ms. Values emitted by the source which are too fast are discarded.
 *
 * Throttle will fire on the first value received.
 *
 * In more detail:
 * Every time throttle passes a value, it records the time it allowed something through. For every
 * value received, it checks the elapsed time against this timestamp, throwing away values if
 * the period hasn't elapsed.
 *
 * With this logic, a fury of values of the source might be discarded if they fall within the elapsed time
 * window. But then if there is not a new value for a while, the actual duration between values can be longer
 * than expected. This is in contrast to {@link debounce}, which will emit the last value received after a duration,
 * even if the source stops sending.
 * @param options
 * @returns
 */
declare function throttle<V>(throttleSource: ReactiveOrSource<V>, options?: Partial<ThrottleOptions>): Reactive<V>;
//# sourceMappingURL=throttle.d.ts.map

//#endregion
//#region ../rx/dist/src/ops/timeout-value.d.ts
/**
 * Emits a value if `source` does not emit a value after `interval`
 * has elapsed. This can be useful to reset a reactive to some
 * 'zero' state if nothing is going on.
 *
 * If `source` emits faster than the `interval`, it won't get triggered.
 *
 * Default for 'timeout': 1000s.
 *
 * ```js
 * // Emit 'hello' if 'source' doesn't emit a value after 1 minute
 * const r = Rx.timeoutValue(source, { value: 'hello', interval: { mins: 1 } });
 * ```
 *
 * Can also emit results from a function or generator
 * ```js
 * // Emits a random number if 'source' doesn't emit a value after 500ms
 * const r = Rx.timeoutValue(source, { fn: Math.random, interval: 500 });
 * ```
 *
 * If `immediate` option is _true_ (default), the timer starts from stream initialisation.
 * Otherwise it won't start until it observes the first value from `source`.
 * @param source
 * @param options
 */
declare function timeoutValue<TSource, TTriggerValue>(source: ReactiveOrSource<TSource>, options: TimeoutValueOptions<TTriggerValue>): Reactive<TSource | TTriggerValue>;
//# sourceMappingURL=timeout-value.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/timeout-ping.d.ts
/**
 * Pings a reactive if no value is emitted at after `interval`.
 * Returns `source`.
 *
 * ```js
 * // Ping `source` if no value is emitted after one minute
 * const r = Rx.timeoutPing(source, { mins: 1 });
 * ```
 *
 * Behavior can be stopped using an abort signal.
 * @see {@link ReactivePingable}
 * @param source
 * @param options
 */
declare function timeoutPing<TSource>(source: ReactiveOrSource<TSource>, options: TimeoutPingOptions): Reactive<TSource>;
//# sourceMappingURL=timeout-ping.d.ts.map
//#endregion
//#region ../rx/dist/src/ops/transform.d.ts
/**
 * Transforms values from `source` using the `transformer` function.
 * @param transformer
 * @returns
 */
declare function transform<In, Out>(input: ReactiveOrSource<In>, transformer: (value: In) => Out, options?: Partial<TransformOpts>): Reactive<Out>;
//# sourceMappingURL=transform.d.ts.map

//#endregion
//#region ../rx/dist/src/ops/value-to-ping.d.ts
/**
 * Pings `target` whenever `source` emits a value. The value itself is ignored, it just
 * acts as a trigger.
 *
 * Returns a new stream capturing the output of `target`.
 *
 * It `source` or `target` closes, output stream closes too.
 *
 * @returns
 */
declare function valueToPing<TSource, TTarget>(source: ReactiveOrSource<TSource>, target: ReactivePingable<TTarget>, options?: Partial<ValueToPingOptions<TSource>>): Reactive<TTarget>;
//# sourceMappingURL=value-to-ping.d.ts.map

//#endregion
//#region ../rx/dist/src/ops/with-value.d.ts
/**
 * A reactive where the last value can be read at any time.
 * An initial value must be provided.
 * ```js
 * const r = Rx.withValue(source, { initial: `hello` });
 * r.last(); // Read last value
 * ```
 *
 * Warning: Since most reactives only active when subscribed to, it's important to also subscribe
 * to the results of `r` for this flow to happen. Alternatively, use `lazy: 'never'` as an option.
 * @param input
 * @param options
 * @returns
 */
declare function withValue<In>(input: ReactiveOrSource<In>, options: WithValueOptions<In>): ReactiveInitial<In>;
//# sourceMappingURL=with-value.d.ts.map
//#endregion
//#region ../rx/dist/src/from/array.d.ts
declare const of: <V>(source: V[] | Iterable<V>, options?: Partial<ArrayOptions>) => (Reactive<V> & ReactiveFinite & {
  last(): V;
}) | undefined;
/**
 * Reads the contents of `array` into a Reactive, with optional time interval
 * between values. A copy of the array is used, so changes will not
 * affect the reactive.
 *
 * See also {@link arrayObject} which monitors changes to array values.
 *
 * Reads items from an array with a given interval, by default 5ms
 *
 * ```js
 * const data = [`apples`, `oranges`, `pears` ];
 * const rx = Rx.From.array(data);
 * rx.onValue(v => {
 *  // v will be each fruit in turn
 * })
 * ```
 *
 * Note that there is the possibility of missing values since there is delay between subscribing and when items start getting emitted.
 * If a new subscriber connects to the reactive, they won't get values already emitted.
 * @param sourceArray
 * @param options
 * @returns
 */
declare const array: <V>(sourceArray: V[], options?: Partial<ArrayOptions>) => Reactive<V> & ReactiveFinite & ReactiveInitial<V>;
//# sourceMappingURL=array.d.ts.map
//#endregion
//#region ../rx/dist/src/from/array-object.d.ts
/**
 * Wraps an array object.
 *
 * It returns an reactive along with some array-ish functions to manipulating it.
 * @param initialValue
 * @param options
 * @returns
 */
declare function arrayObject<V>(initialValue?: readonly V[], options?: Partial<ArrayObjectOptions<V>>): ReactiveArray<V> & ReactiveInitial<readonly V[]>;
//# sourceMappingURL=array-object.d.ts.map
//#endregion
//#region ../rx/dist/src/from/boolean.d.ts
declare function boolean(initialValue: boolean): ReactiveWritable<boolean> & ReactiveInitial<boolean>;
declare function boolean(): ReactiveWritable<boolean> & ReactiveNonInitial<boolean>;
//# sourceMappingURL=boolean.d.ts.map

//#endregion
//#region ../rx/dist/src/from/count.d.ts
/**
 * Produces an incrementing value. By default starts at 0 and counts
 * forever, incrementing every second.
 *
 * ```js
 * const r = Rx.From.count();
 * r.onValue(c => {
 *  // 0, 1, 2, 3 ... every second
 * });
 * ```
 *
 * The `limit` is exclusive
 * ```js
 * const r = Rx.From.count({limit:5});
 * // Yields 0,1,2,3,4
 * ```
 *
 * If limit is less than start, it will count down instead.
 * ```js
 * const r = Rx.count({start:5, limit: 0});
 * // Yie:ds 5,4,3,2,1
 * ```
 *
 * ```js
 * // Count 10, 12, 14 ... every 500ms
 * const r = Rx.From.count({ start: 10, amount: 2, interval: 500 });
 * ```
 *
 * In addition to setting `limit` (which is exclusive), you can stop with an abort signal
 * ```js
 * const ac = new AbortController();
 * const r = Rx.From.count({signal:ac.signal});
 * ...
 * ac.abort(`stop`);
 * ```
 * @param options
 */
declare function count(options?: Partial<CountOptions>): ReactiveStream<number>;
//# sourceMappingURL=count.d.ts.map
//#endregion
//#region ../rx/dist/src/from/derived.d.ts
declare function derived<TResult, const T extends Record<string, ReactiveOrSource<any>>>(fn: (combined: RxValueTypeObject<T>) => TResult | undefined, reactiveSources: T, options?: Partial<DerivedOptions<TResult, CombineLatestToObject<T>>>): ReactiveNonInitial<TResult>;
//# sourceMappingURL=derived.d.ts.map

//#endregion
//#region ../rx/dist/src/from/event.d.ts
/**
 * Fired when `eventName` fires on `target`.
 *
 * Rather than whole event args being emitted on the stream,
 * it plucks a field from the event args, or if that's missing, from the target.
 *
 * ```js
 * // Emits the the value of a field named 'x'
 * // on the change event args
 * eventField(el, `pointermove`, `x`);
 * ```
 * @param targetOrQuery Event target, HTML element or HTML query (eg '#someId')
 * @param eventName Name of event, eg. 'pointermove'
 * @param fieldName Name of field, eg 'x'
 * @param initialValue Initial data
 * @param options Options for source
 */
declare function eventField<TFieldValue = string>(targetOrQuery: EventTarget | string | null, eventName: string, fieldName: string, initialValue: TFieldValue, options?: Partial<EventSourceOptions & FieldOptions<any, TFieldValue>>): Reactive<TFieldValue>;
/**
 * Subscribes to an event, emitting data
 *
 * @example Print x,y position of mouse as it moves
 * ```js
 * const r = Rx.From.event(document, `pointermove`);
 * r.onValue(event => {
 *  const { x, y } = event;
 * });
 * ```
 *
 * If `options.lazy` is _true_ (default: _false_), event will only be subscribed to when the stream
 * itself has a subscriber.
 *
 * `options.debugFiring` and `options.debugLifecycle` can be turned on to troubleshoot behaviour
 * of the stream if necessary.
 * @param targetOrQuery Event emitter, HTML element or string. If a string, it will be queryed as a selector.
 * @param name Event name
 * @param options Options
 * @returns
 */
declare function event<TEventArgs extends Record<string, any>>(targetOrQuery: EventTarget | null | string, name: string, initialValue: TEventArgs | undefined, options?: Partial<EventSourceOptions>): ReactiveInitial<TEventArgs> & Reactive<TEventArgs>;
type TriggerData = {
  sinceLast: number;
  total: number;
};
/**
 * Emits a value whenever event happens.
 * Data emitted is `{ sinceLast, total }`, where 'sinceLast'
 * is milliseconds since last event and 'total' is total number of
 * times event has been fired.
 * @param targetOrQuery
 * @param name
 * @param options
 * @returns
 */
declare function eventTrigger(targetOrQuery: EventTarget | null | string, name: string, options?: Partial<EventSourceTriggerOptions>): Reactive<TriggerData>;
//# sourceMappingURL=event.d.ts.map
//#endregion
//#region ../rx/dist/src/from/function.d.ts
/**
 * Produces a reactive from the basis of a function. `callback` is executed, with its result emitted via the returned reactive.
 *
 * ```js
 * // Produce a random number every second
 * const r = Rx.From.func(Math.random, { interval: 1000 });
 * ```
 *
 * `callback` can be called repeatedly by providing the `interval` option to set the rate of repeat.
 * Looping can be limited with `options.maximumRepeats`, or passing a signal `options.signal`
 * and then activating it.
 * ```js
 * // Reactive that emits a random number every second, five times
 * const r1 = Rx.From.func(Math.random, { interval: 1000, maximumRepeats: 5 }
 * ```
 *
 * ```js
 * // Generate a random number every second until ac.abort() is called
 * const ac = new AbortController();
 * const r2 = Rx.From.func(Math.random, { interval: 1000, signal: ac.signal });
 * ```
 *
 * The third option is for `callback` to fire the provided abort function.
 * ```js
 * Rx.From.func((abort) => {
 *  if (Math.random() > 0.5) abort('Random exit');
 *  return 1;
 * });
 * ```
 *
 * By default has a laziness of 'very' meaning that `callback` is run only when there's a subscriber
 * By default stream closes if `callback` throws an error. Use `options.closeOnError:'ignore'` to change.
 * @param callback
 * @param options
 * @returns
 */
declare function func<V>(callback: FunctionFunction<V>, options?: Partial<FunctionOptions>): ReactivePingable<V>;
//# sourceMappingURL=function.d.ts.map
//#endregion
//#region ../rx/dist/src/from/iterator.d.ts
/**
 * Creates a Reactive from an AsyncGenerator or Generator
 * @param gen
 * @returns
 */
/**
 * Creates a readable reactive based on a (async)generator or iterator
 * ```js
 * // Generator a random value every 5 seconds
 * const valuesOverTime = Flow.interval(() => Math.random(), 5000);
 * // Wrap the generator
 * const r = Rx.From.iterator(time);
 * // Get notified when there is a new value
 * r.onValue(v => {
 *   console.log(v);
 * });
 * ```
 *
 * Awaiting values could potentially hang code. Thus there is a `readTimeout`, the maximum time to wait for a value from the generator. Default: 5 minutes.
 * If `signal` is given, this will also cancel waiting for the value.
 * @param source
 */
declare function iterator<V>(source: IterableIterator<V> | V[] | AsyncIterableIterator<V> | Generator<V> | AsyncGenerator<V>, options?: Partial<GeneratorOptions>): Reactive<V>;
//# sourceMappingURL=iterator.d.ts.map
//#endregion
//#region ../rx/dist/src/from/merged.d.ts
/**
 * Returns a stream that merges the output of a list of homogenous streams.
 * Use {@link mergedWithOptions} to specify additional options.
 * @param sources
 * @returns
 */
declare function merged<T>(...sources: Reactive<T>[]): Reactive<T>;
/**
 * Returns a stream that merges the output of a list of homogenous streams.
 *
 * @param sources
 * @param options
 * @returns
 */
declare function mergedWithOptions<T>(sources: Reactive<T>[], options?: Partial<InitLazyStreamOptions>): Reactive<T>;
//# sourceMappingURL=merged.d.ts.map
//#endregion
//#region ../rx/dist/src/from/number.d.ts
declare function number(initialValue: number): ReactiveWritable<number> & ReactiveInitial<number>;
declare function number(): ReactiveWritable<number> & ReactiveNonInitial<number>;
//# sourceMappingURL=number.d.ts.map
//#endregion
//#region ../rx/dist/src/from/object.d.ts
declare function object<V extends Record<string, any>>(initialValue: V, options?: Partial<ObjectOptions<V>>): ReactiveDiff<V> & ReactiveInitial<V>;
declare function object<V extends Record<string, any>>(initialValue: undefined, options?: Partial<ObjectOptions<V>>): ReactiveDiff<V> & ReactiveNonInitial<V>;
//# sourceMappingURL=object.d.ts.map
//#endregion
//#region ../rx/dist/src/from/object-proxy.d.ts
type ReactiveProxied<V> = V & {
  [symbol]: ReactiveDiff<V> & ReactiveInitial<V>;
};
/**
 * Creates a proxy of `target` object (or array), so that regular property setting will be intercepted and output
 * on a {@link Reactive} object as well.
 *
 * ```js
 * const { proxy, rx } = Rx.From.objectProxy({ colour: `red`, x: 10, y: 20 });
 *
 * rx.onValue(v => {
 *  // Get notified when proxy is changed
 * });
 *
 * // Get and set properties as usual
 * console.log(proxy.x);
 * proxy.x = 20; // Triggers Reactive
 * ```
 *
 * Keep in mind that changing `target` directly won't affect the proxied object or Reactive. Thus,
 * only update the proxied object after calling `fromProxy`.
 *
 * The benefit of `objectProxy` instead of {@link From.object} is because the proxied object can be passed to other code that doesn't need
 * to know anything about Reactive objects.
 *
 * You can assign the return values to more meaningful names using
 * JS syntax.
 * ```js
 * const { proxy:colour, rx:colourRx } = Rx.From.objectProxy({ colour: `red` });
 * ```
 *
 * If `target` is an array, it's not possible to change the shape of the array by adding or removing
 * elements, only by updating existing ones. This follows the same behaviour of objects. Alternatively, use {@link arrayProxy}.
 *
 * See also:
 * * {@link objectProxySymbol}: Instead of {proxy,rx} return result, puts the `rx` under a symbol on the proxy.
 * * {@link arrayProxy}: Proxy an array, allowing inserts and deletes.
 * @param target
 * @returns
 */
declare const objectProxy: <V extends object>(target: V) => {
  proxy: V;
  rx: ReactiveDiff<V> & ReactiveInitial<V>;
};
declare const arrayProxy: <V, T extends V[]>(target: T) => {
  proxy: T;
  rx: ReactiveArray<V> & ReactiveInitial<readonly V[]>;
};
/**
 * Same as {@link objectProxy}, but the return value is the proxied object along with
 * the Reactive wrapped as symbol property.
 *
 * ```js
 * const person = Rx.fromProxySymbol({name: `marie` });
 * person.name = `blah`;
 * person[Rx.symbol].on(msg => {
 *  // Value changed...
 * });
 * ```
 *
 * This means of access can be useful as the return result
 * is a bit neater, being a single object instead of two.
 * @param target
 * @returns
 */
declare const objectProxySymbol: <V extends object>(target: V) => ReactiveProxied<V>;
//# sourceMappingURL=object-proxy.d.ts.map
//#endregion
//#region ../rx/dist/src/from/observable.d.ts
/**
 * Creates a RxJs style observable
 * ```js
 * const o = observable(stream => {
 *  // Code to run for initialisation when we go from idle to at least one subscriber
 *  // Won't run again for additional subscribers, but WILL run again if we lose
 *  // all subscribers and then get one
 *
 *  // To send a value:
 *  stream.set(someValue);
 *
 *   // Optional: return function to call when all subscribers are removed
 *   return () => {
 *     // Code to run when all subscribers are removed
 *   }
 * });
 * ```
 *
 * For example:
 * ```js
 * const xy = observable<(stream => {
 *  // Send x,y coords from PointerEvent
 *  const send = (event) => {
 *    stream.set({ x: event.x, y: event.y });
 *  }
 *  window.addEventListener(`pointermove`, send);
 *  return () => {
 *    // Unsubscribe
 *    window.removeEventListener(`pointermove`, send);
 *  }
 * });
 *
 * xy.onValue(value => {
 *  console.log(value);
 * });
 * ```
 * @param init
 * @returns
 */
declare function observable<V>(init: (stream: Reactive<V> & ReactiveWritable<V>) => (() => void) | undefined): Reactive<V>;
/**
 * As {@link observable}, but returns a Reactive that allows writing
 * @param init
 * @returns
 */
declare function observableWritable<V>(init: (stream: Reactive<V> & ReactiveWritable<V>) => (() => void) | undefined): ReactiveWritable<V> & Reactive<V>;
//# sourceMappingURL=observable.d.ts.map
//#endregion
//#region ../rx/dist/src/from/string.d.ts
declare function string(initialValue: string): ReactiveWritable<string> & ReactiveInitial<string>;
declare function string(): ReactiveWritable<string> & ReactiveNonInitial<string>;
//# sourceMappingURL=string.d.ts.map
declare namespace index_d_exports$3 {
  export { ArrayObjectOptions, ArrayOptions, CountOptions, DerivedFunction, DerivedOptions, EventPluckedFieldOptions, EventPluckedFieldOptions2, EventSourceOptions, EventSourceTriggerOptions, FunctionFunction, FunctionOptions, GeneratorOptions, ObjectOptions, PingedFunctionFunction, PingedFunctionOptions, ReactiveProxied, TimeoutPingOptions, TimeoutValueOptions, Trigger, TriggerData, TriggerFunction, TriggerGenerator, TriggerValue, ValueToPingOptions, array, arrayObject, arrayProxy, boolean, count, derived, event, eventField, eventTrigger, func, iterator, merged, mergedWithOptions, number, object, objectProxy, objectProxySymbol, observable, observableWritable, of, string };
}
//#endregion
//#region ../rx/dist/src/collections/responsive-queue.d.ts
/**
 * Changes to `queue` are output as a responsive stream.
 * The stream emits the full data of the queue (first item being the head of the queue)
 * whenever there is an enqueue, remove or clear operation.
 *
 * ```js
 * const queue = new QueueMutable();
 * const r = asResponsive(queue);
 * r.onValue(v => {
 *  // v is an array of values
 * });
 *
 *
 * Calling `set()` on the stream enqueues data to the wrapped queue.
 * ```js
 * r.set([ `1, `2` ]); // Enqueues 1, 2
 * ```
 * @param queue
 * @returns
 */
declare function asResponsive<T>(queue: IQueueMutableWithEvents<T>): {
  set: (data: T[]) => void;
  on(handler: (value: Passed<readonly T[]>) => void): Unsubscriber;
  onValue(handler: (value: readonly T[]) => void): Unsubscriber;
  dispose(reason: string): void;
  isDisposed(): boolean;
};
//# sourceMappingURL=responsive-queue.d.ts.map
declare namespace index_d_exports$4 {
  export { asResponsive };
}
//#endregion
//#region ../rx/dist/src/graph.d.ts
/**
 * Build a graph of reactive dependencies for `rx`
 * @param _rx
 */
declare function prepare<V extends Record<string, any>>(_rx: V): Reactive<V>;
//# sourceMappingURL=graph.d.ts.map

//#endregion
//#region ../rx/dist/src/to-array.d.ts
/**
 * Reads a set number of values from `source`, returning as an array. May contain
 * empty values if desired values is not reached.
 *
 * After the limit is reached (or `source` completes), `source` is unsubscribed from.
 *
 * If no limit is set, it will read until `source` completes or `maximumWait` is reached.
 * `maximumWait` is 10 seconds by default.
 *
 * Use {@link toArrayOrThrow} to throw if desired limit is not reached.
 *
 * ```js
 * // Read from `source` for 5 seconds
 * const data = await toArray()(source);
 * // Read 5 items from `source`
 * const data = await toArray({ limit: 5 })(source);
 * // Read for 10s
 * const data = await toArray({ maximumWait: 10_1000 })(source);
 * ```
 * @param source
 * @param options
 * @returns
 */
declare function toArray<V>(source: ReactiveOrSource<V>, options?: Partial<ToArrayOptions<V>>): Promise<(V | undefined)[]>;
/**
 * By default, reads all the values from `source`, or until 5 seconds has elapsed.
 *
 * If `limit` is provided as an option, it will exit early, or throw if that number of values was not acheived.
 *
 * ```js
 * // Read from `source` for 5 seconds
 * const data = await toArrayOrThrow()(source);
 * // Read 5 items from `source`
 * const data = await toArrayOrThrow({ limit: 5 })(source);
 * // Read for 10s
 * const data = await toArrayOrThrow({ maximumWait: 10_1000 })(source);
 * ```
 * @param source
 * @param options
 * @returns
 */
declare function toArrayOrThrow<V>(source: ReactiveOrSource<V>, options?: Partial<ToArrayOptions<V>>): Promise<V[]>;
//# sourceMappingURL=to-array.d.ts.map

//#endregion
//#region ../rx/dist/src/to-generator.d.ts
/**
 * Returns an AsyncGenerator wrapper around Reactive.
 * This allows values to be iterated over using a `for await` loop,
 * like Chains.
 *
 * ```js
 * // Reactive numerical value
 * const number = Reactive.number(10);
 *
 * const g = Reactive.toGenerator(number);
 * for await (const v of g) {
 *  console.log(v); // Prints out whenever the reactive value changes
 * }
 * // Execution doesn't continue until Reactive finishes
 * ```
 *
 * When/if `source` closes, an exception is thrown.
 * To catch this, wrap the calling `for await` in a try-catch block
 * ```js
 * try {
 *  for await (const v of g) {
 *  }
 * } catch (error) {
 * }
 * // Completed
 * ```
 *
 * Use something like `setTimeout` to loop over the generator
 * without impeding the rest of your code flow. For example:
 * ```js
 * // Listen for every pointerup event
 * const ptr = Reactive.fromEvent(document.body, `pointerup`);
 * // Start iterating
 * setTimeout(async () => {
 *  const gen = Reactive.toGenerator(ptr);
 *  try {
 *    for await (const v of gen) {
 *      // Prints out whenever there is a click
 *      console.log(v);
 *    }
 *  } catch (e) { }
 *  console.log(`Iteration done`);
 * });
 *
 * // Execution continues here immediately
 * ```
 * @param source
 */
declare function toGenerator<V>(source: ReactiveOrSource<V>): AsyncGenerator<V>;
//# sourceMappingURL=to-generator.d.ts.map
//#endregion
//#region ../rx/dist/src/util.d.ts
declare function messageIsSignal<V>(message: Passed<V> | PassedSignal): message is PassedSignal;
declare function messageIsDoneSignal<V>(message: Passed<V> | PassedSignal): boolean;
/**
 * Returns _true_ if `v` has a non-undefined value. Note that sometimes
 * _undefined_ is a legal value to pass
 * @param v
 * @returns
 */
declare function messageHasValue<V>(v: Passed<V> | PassedSignal): v is PassedValue<V>;
declare const isPingable: <V>(rx: Reactive<V> | ReactiveDiff<V> | object) => rx is ReactivePingable<V>;
declare const hasLast: <V>(rx: Reactive<V> | ReactiveDiff<V> | object) => rx is ReactiveInitial<V>;
/**
 * Returns _true_ if `rx` is a Reactive
 * @param rx
 * @returns
 */
declare const isReactive: <V>(rx: object) => rx is Reactive<V>;
/**
 * Returns true if `rx` is a disposable reactive.
 * @param rx
 * @returns
 */
/**
 * Returns _true_ if `rx` is a writable Reactive
 * @param rx
 * @returns
 */
declare const isWritable: <V>(rx: Reactive<V> | ReactiveWritable<V>) => rx is ReactiveWritable<V>;
declare const isWrapped: <T>(v: any) => v is Wrapped<T>;
declare const opify: <TIn, TRxOut = Reactive<TIn>>(fn: (source: ReactiveOrSource<TIn>, ...args: any[]) => TRxOut, ...args: any[]) => (source: ReactiveOrSource<TIn>) => TRxOut;
declare const isTriggerValue: <V>(t: Trigger<V>) => t is TriggerValue<V>;
declare const isTriggerFunction: <V>(t: Trigger<V>) => t is TriggerFunction<V>;
declare const isTriggerGenerator: <V>(t: Trigger<V>) => t is TriggerGenerator<V>;
declare const isTrigger: <V>(t: any) => t is Trigger<V>;
type ResolveTriggerValue<V> = [value: V, false];
type ResolveTriggerDone = [undefined, true];
/**
 * Resolves a trigger value.
 *
 * A trigger can be a value, a function or generator. Value triggers never complete.
 * A trigger function is considered complete if it returns undefined.
 * A trigger generator is considered complete if it returns done.
 *
 * Returns `[value, _false_]` if we have a value and trigger is not completed.
 * Returns `[value, _true_]` trigger is completed
 * @param t
 * @returns
 */
declare function resolveTriggerValue<V>(t: Trigger<V>): ResolveTriggerDone | ResolveTriggerValue<V>;
//# sourceMappingURL=util.d.ts.map
//#endregion
//#region ../rx/dist/src/wrap.d.ts
/**
 * Wrap a reactive source to allow for chained
 * function calls.
 *
 * Example:
 * For every `pointerup` event on the body, chunk the events over
 * periods of 200ms, get the number of events in that period,
 * and print it out.
 *
 * eg. detecting single or double-clicks
 * ```js
 * wrap(Rx.fromEvent<{ x: number, y: number }>(document.body, `pointerup`))
 *  .chunk({ elapsed: 200 })
 *  .transform(v => v.length)
 *  .onValue(v => { console.log(v) });
 * ```
 * @param source
 * @returns
 */
declare function wrap<TIn>(source: ReactiveOrSource<TIn>): Wrapped<TIn>;
//# sourceMappingURL=wrap.d.ts.map
//#endregion
//#region ../rx/dist/src/resolve-source.d.ts
type ResolveSourceOptions = {
  /**
   * Options when creating a reactive from a generator
   * Default:  `{ lazy: true, interval: 5 }`
   */
  generator: GeneratorOptions;
  /**
   * Options when creating a reactive from a function.
   */
  function: FunctionOptions;
};
/**
 * Resolves various kinds of sources into a Reactive.
 * If `source` is an iterable/generator, it gets wrapped via `generator()`.
 *
 * Default options:
 * * generator: `{ lazy: true, interval: 5 }`
 * @param source
 * @returns
 */
declare const resolveSource: <V>(source: ReactiveOrSource<V>, options?: Partial<ResolveSourceOptions>) => Reactive<V>;
//# sourceMappingURL=resolve-source.d.ts.map
//#endregion
//#region ../rx/dist/src/cache.d.ts
/**
 * A stream that caches its last value
 */
type CacheStream<T> = {
  /**
   * Clears the last cached value
   * @returns
   */
  resetCachedValue: () => void;
  /**
   * Gets the cached value, if available
   * @returns
   */
  last: () => T | undefined;
};
/**
 * A {@link CacheStream} with an initial value
 */
type CacheStreamInitial<T> = CacheStream<T> & {
  last: () => T;
};
/**
 * Wraps an input stream to cache values, and provide an initial value
 * @param r Input stream
 * @param initialValue Initial value
 */
declare function cache<TValue, RT extends Reactive<TValue>>(r: RT, initialValue: TValue): CacheStreamInitial<TValue> & RT;
//# sourceMappingURL=cache.d.ts.map
//#endregion
//#region ../rx/dist/src/init-stream.d.ts
/**
 * Initialise a stream based on an upstream source.
 * Calls initLazyStream under the hood.
 *
 * Options:
 * * onValue: called when upstream emits a value (default: does nothing with upstream value)
 * * lazy: laziness of stream (default: 'initial')
 * * disposeIfSourceDone: disposes stream if upstream disposes (default: true)
 * @ignore
 * @param upstreamSource
 * @param options
 * @returns
 */
declare function initUpstream<In, Out>(upstreamSource: ReactiveOrSource<In>, options: Partial<UpstreamOptions<In>>): ReactiveStream<Out>;
/**
 * Initialises a lazy stream with an initial value.
 * Uses {@link initLazyStream} and {@link cache} together.
 * @param options
 * @returns
 */
declare function initLazyStreamWithInitial<V>(options: InitLazyStreamInitedOptions<V>): ReactiveInitialStream<V>;
/**
 * Initialises a lazy stream
 * Consider also: {@link initLazyStreamWithInitial}
 *
 * @param options
 * @returns
 */
declare function initLazyStream<V>(options: InitLazyStreamOptions): ReactiveStream<V>;
/**
 * Initialises a new stream.
 *
 * Options:
 * * onFirstSubscribe: Called when there is a subscriber after there have been no subscribers.
 * * onNoSubscribers: Called when there are no more subscribers. 'onFirstSubscriber' will be called next time a subscriber is added.
 *
 * Alternatives:
 * * {@link initLazyStream} - a stream with callbacks for when there is some/none subscribers
 * @ignore
 * @param options
 * @returns
 */
declare function initStream<V>(options?: Partial<InitStreamOptions>): ReactiveStream<V>;
//# sourceMappingURL=init-stream.d.ts.map
declare namespace index_d_exports {
  export { CacheStream, CacheStreamInitial, ChunkOptions, index_d_exports$4 as Collections, CombineLatestOptions, CombineLatestToObject, DebounceOptions, FieldOptions, FilterPredicate, index_d_exports$3 as From, InitLazyStreamInitedOptions, InitLazyStreamOptions, InitStreamOptions, Lazy, ObjectFieldHandler, OpAsAnnotation, OpInterpolateOptions, OpMathOptions, Ops, Optional, Passed, PassedSignal, PassedValue, PipeSet, PrimitiveValueTypeObject, Reactive, ReactiveArray, ReactiveDiff, ReactiveFinite, ReactiveInitial, ReactiveInitialStream, ReactiveNonInitial, ReactiveOp, ReactiveOpInit, ReactiveOpLinks, ReactiveOrSource, ReactivePingable, ReactiveStream, ReactiveWritable, ResolveOptions, ResolveSourceOptions, ResolveTriggerDone, ResolveTriggerValue, RxValueTypeObject, RxValueTypeObjectOrUndefined, RxValueTypeRx, RxValueTypes, SetHtmlOptions, SetHtmlOptionsElement, SetHtmlOptionsQuery, SignalKinds, SingleFromArrayOptions, Sinks, SplitOptions, SwitcherOptions, SyncOptions, TallyOptions, ThrottleOptions, ToArrayOptions, TransformOpts, Unsubscriber, UpstreamInitialOptions, UpstreamOptions, WithValueOptions, Wrapped, annotate, annotateWithOp, average, cache, chunk, cloneFromFields, combineLatestToArray, combineLatestToObject, computeWithPrevious, debounce, drop, elapsed, field, filter, hasLast, initLazyStream, initLazyStreamWithInitial, initStream, initUpstream, interpolate, isPingable, isReactive, isTrigger, isTriggerFunction, isTriggerGenerator, isTriggerValue, isWrapped, isWritable, manual, max, messageHasValue, messageIsDoneSignal, messageIsSignal, min, opify, pipe, prepare, rank, resolveSource, resolveTriggerValue, run, setHtmlText, singleFromArray, split, splitLabelled, sum, switcher, symbol, syncToArray, syncToObject, takeNextValue, tally, tapOps, tapProcess, tapStream, throttle, timeoutPing, timeoutValue, to, toArray, toArrayOrThrow, toGenerator, transform, valueToPing, withValue, wrap, writable };
}
declare function run<TIn, TOut>(source: ReactiveOrSource<any>, ...ops: ReactiveOp<any, any>[]): Reactive<any>;
declare function writable<TIn, TOut>(source: ReactiveOrSource<TIn>, ...ops: ReactiveOp<any, any>[]): ReactiveWritable<TIn, TOut>;
/**
 * Initialises a reactive that pipes values to listeners directly.
 * @returns
 */
declare function manual<V>(options?: Partial<InitStreamOptions>): Reactive<V> & ReactiveWritable<V>;
declare const Sinks: {
  setHtmlText: (options: SetHtmlOptions) => (source: ReactiveOrSource<string>) => void;
};
declare const Ops: {
  /**
  * Annotates values with the result of a function.
  * The input value needs to be an object.
  *
  * For every value `input` emits, run it through `annotator`, which should
  * return the original value with additional fields.
  *
  * Conceptually the same as `transform`, just with typing to enforce result
  * values are V & TAnnotation
  * @param annotator
  * @returns
  */
  readonly annotate: <V, TAnnotation>(annotator: (input: V) => V & TAnnotation) => <In, TAnnotation_1>(source: ReactiveOrSource<In>) => Reactive<{
    value: In;
    annotation: TAnnotation_1;
  }>;
  /**
   * Annotates the input stream using {@link ReactiveOp} as the source of annotations.
   * The output values will have the shape of `{ value: TIn, annotation: TAnnotation }`.
   * Meaning that the original value is stored under `.value`, and the annotation under `.annotation`.
   *
   * ```js
   * // Emit values from an array
   * const r1 = Rx.run(
   *  Rx.From.array([ 1, 2, 3 ]),
   *  Rx.Ops.annotateWithOp(
   *    // Add the 'max' operator to emit the largest-seen value
   *    Rx.Ops.sum()
   *  )
   * );
   * const data = await Rx.toArray(r1);
   * // Data =  [ { value: 1, annotation: 1 }, { value: 2, annotation: 3 }, { value: 3, annotation: 6 } ]
   * ```
   * @param annotatorOp
   * @returns
   */
  readonly annotateWithOp: <TIn, TAnnotation>(annotatorOp: ReactiveOp<TIn, TAnnotation>) => <In, TAnnotation_1>(source: ReactiveOrSource<In>) => Reactive<{
    value: In;
    annotation: TAnnotation_1;
  }>;
  /**
   * Takes a stream of values and chunks them up (by quantity or time elapsed),
   * emitting them as an array.
   * @param options
   * @returns
   */
  readonly chunk: <V>(options: Partial<ChunkOptions>) => ReactiveOp<V, V[]>;
  readonly cloneFromFields: <V>() => ReactiveOp<V, V>;
  /**
  * Merges values from several sources into a single source that emits values as an array.
  * @param options
  * @returns
  */
  readonly combineLatestToArray: <const T extends readonly ReactiveOrSource<any>[]>(options?: Partial<CombineLatestOptions>) => (sources: T) => Reactive<RxValueTypes<T>>;
  /**
   * Merges values from several sources into a single source that emits values as an object.
   * @param options
   * @returns
   */
  readonly combineLatestToObject: <const T extends Record<string, ReactiveOrSource<any>>>(options?: Partial<CombineLatestOptions>) => (reactiveSources: T) => CombineLatestToObject<T>;
  /**
  * Debounce values from the stream. It will wait until a certain time
  * has elapsed before emitting latest value.
  *
  * Effect is that no values are emitted if input emits faster than the provided
  * timeout.
  *
  * See also: throttle
  * @param options
  * @returns
  */
  /**
   * Drops values from the input stream that match `predicate`
   * @param predicate If it returns _true_ value is ignored
   * @returns
   */
  readonly drop: <V>(predicate: (value: V) => boolean) => <In>(source: ReactiveOrSource<In>) => Reactive<In>;
  /**
   * Every upstream value is considered the target for interpolation.
   * Output value interpolates by a given amount toward the target.
   * @returns
   */
  readonly elapsed: <V>() => ReactiveOp<V, number>;
  /**
   * Yields the value of a field from an input stream of values.
   * Eg if the source reactive emits `{ colour: string, size: number }`,
   * we might use `field` to pluck out the `colour` field, thus returning
   * a stream of string values.
   * @param fieldName
   * @param options
   * @returns
   */
  readonly field: <TSource extends object, TFieldType>(fieldName: keyof TSource, options?: Partial<FieldOptions<TSource, TFieldType>>) => (source: ReactiveOrSource<TSource>) => Reactive<TFieldType>;
  /**
   * Filters the input stream, only re-emitting values that pass the predicate
   * @param predicate If it returns _true_ value is allowed through
   * @returns
   */
  readonly filter: <V>(predicate: (value: V) => boolean) => <In>(source: ReactiveOrSource<In>) => Reactive<In>;
  /**
   * Every upstream value is considered the target for interpolation.
   * Output value interpolates by a given amount toward the target.
   * @param options
   * @returns
   */
  readonly interpolate: <TIn = number>(options?: Partial<OpInterpolateOptions>) => (source: ReactiveOrSource<TIn>) => ReactivePingable<number>;
  /**
  * Outputs the minimum numerical value of the stream.
  * A value is only emitted when minimum decreases.
  * @returns
  */
  readonly min: <TIn = number>(options?: OpMathOptions) => (source: ReactiveOrSource<TIn>) => Reactive<number>;
  /**
   * Outputs the maxium numerical value of the stream.
   * A value is only emitted when maximum increases.
   * @returns
   */
  readonly max: <TIn = number>(options?: OpMathOptions) => (source: ReactiveOrSource<TIn>) => Reactive<number>;
  readonly sum: <TIn = number>(options?: OpMathOptions) => (source: ReactiveOrSource<TIn>) => Reactive<number>;
  readonly average: <TIn = number>(options?: OpMathOptions) => (source: ReactiveOrSource<TIn>) => Reactive<number>;
  readonly tally: <TIn>(options?: TallyOptions) => (source: ReactiveOrSource<TIn>) => Reactive<number>;
  readonly rank: <TIn>(rank: RankFunction<TIn>, options?: RankOptions & OpMathOptions) => (source: ReactiveOrSource<TIn>) => Reactive<TIn>;
  readonly pipe: <TInput, TOutput>(...streams: (Reactive<any> & ReactiveWritable<any>)[]) => (source: ReactiveOrSource<TInput>) => Reactive<unknown>;
  readonly singleFromArray: <V>(options?: Partial<SingleFromArrayOptions<V>>) => (source: ReactiveOrSource<V[]>) => Reactive<V>;
  readonly split: <V>(options?: Partial<SplitOptions>) => (source: ReactiveOrSource<V>) => ReactiveStream<V>[];
  readonly splitLabelled: <V>(labels: string[]) => (source: ReactiveOrSource<V>) => Record<string, Reactive<V>>;
  readonly switcher: <TValue, TRec extends Record<string, FilterPredicate<TValue>>, TLabel extends keyof TRec>(cases: TRec, options?: Partial<SwitcherOptions>) => (source: ReactiveOrSource<TValue>) => Record<TLabel, Reactive<TValue>>;
  readonly syncToArray: <const T extends readonly ReactiveOrSource<any>[]>(options?: Partial<SyncOptions>) => (reactiveSources: T) => Reactive<RxValueTypes<T>>;
  readonly syncToObject: <const T extends Record<string, ReactiveOrSource<any>>>(options?: Partial<SyncOptions>) => (reactiveSources: T) => Reactive<RxValueTypeObject<T>>;
  readonly tapProcess: <In>(processor: ((value: In) => any)) => ReactiveOp<In, In>;
  readonly tapStream: <In>(divergedStream: ReactiveWritable<In>) => ReactiveOp<In, In>;
  readonly tapOps: <In, Out>(...ops: ReactiveOp<In, Out>[]) => (source: ReactiveOrSource<In>) => Reactive<Out>;
  /**
  * Throttle values from the stream.
  * Only emits a value if some minimum time has elapsed.
  * @param options
  * @returns
  */
  readonly throttle: <V>(options: Partial<ThrottleOptions>) => (source: ReactiveOrSource<V>) => Reactive<V>;
  /**
   * Trigger a value if 'source' does not emit a value within an interval.
   * Trigger value can be a fixed value, result of function, or step through an iterator.
   * @param options
   * @returns
   */
  readonly timeoutValue: <V, TTriggerValue>(options: TimeoutValueOptions<TTriggerValue>) => (source: ReactiveOrSource<V>) => Reactive<V | TTriggerValue>;
  readonly timeoutPing: <V>(options: TimeoutPingOptions) => (source: ReactiveOrSource<V>) => Reactive<V>;
  readonly transform: <In, Out>(transformer: ((value: In) => Out), options?: Partial<TransformOpts>) => ReactiveOp<In, Out>;
  /**
  * Reactive where last (or a given initial) value is available to read
  * @param opts
  * @returns
  */
  readonly withValue: <V>(opts: Partial<WithValueOptions<V>>) => ReactiveOp<V, V>;
};
/**
 * Grabs the next value emitted from `source`.
 * By default waits up to a maximum of one second.
 * Handles subscribing and unsubscribing.
 *
 * ```js
 * const value = await Rx.takeNextValue(source);
 * ```
 *
 * Throws an error if the source closes without
 * a value or the timeout is reached.
 *
 * @param source
 * @param maximumWait
 * @returns
 */
declare function takeNextValue<V>(source: ReactiveOrSource<V>, maximumWait?: Interval): Promise<V>;
/**
 * Connects reactive A to B, optionally transforming the value as it does so.
 *
 * Returns a function to unsubcribe A->B
 * @param a
 * @param b
 * @param transform
 */
declare const to: <TA, TB>(a: Reactive<TA>, b: ReactiveWritable<TB>, transform?: (valueA: TA) => TB, closeBonA?: boolean) => Unsubscriber;
//# sourceMappingURL=index.d.ts.map

//#endregion
export { EventSourceOptions, ObjectFieldHandler, Reactive, ReactiveDiff, ReactiveInitial, ReactiveNonInitial, ReactiveWritable, index_d_exports };
//# sourceMappingURL=index-X_q0_zPS.d.ts.map