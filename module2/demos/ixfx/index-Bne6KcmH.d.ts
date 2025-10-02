import { Interval } from "./types-CcY4GIC4.js";

//#region ../core/dist/src/continuously.d.ts
type HasCompletionRunStates = `idle` | `scheduled` | `running`;
type HasCompletion = {
  /**
   * Gets the current run state
   * idle: not yet started or completed with no future run scheduled
   * scheduled: waiting to run
   * running: currently executing its callback
   */
  get runState(): HasCompletionRunStates;
  /**
   * Returns the number of times the scheduled function
   * has been executed.
   *
   * This number will be reset in some conditions.
   * For example `continuously` resets it when the loop stops.
   *
   * Use {@link startCountTotal} to track total number.
   */
  get startCount(): number;
  /**
   * Total number of times scheduled function has been
   * executed.
   */
  get startCountTotal(): number;
};
/**
 * Runs a function continuously, returned by {@link continuously}
 */
type Continuously = HasCompletion & {
  /**
   * Starts loop. If already running, does nothing
   */
  start(): void;
  /**
   * (Re-)starts the loop. If an existing iteration has been
   * scheduled, this is cancelled and started again.
   *
   * This can be useful when adjusting the interval
   */
  reset(): void;
  /**
   * How many milliseconds since loop was started after being stopped.
   */
  get elapsedMs(): number;
  /**
   * If disposed, the continuously instance won't be re-startable
   */
  get isDisposed(): boolean;
  /**
   * Stops loop. It can be restarted using .start()
   */
  cancel(): void;
  /**
   * Sets the interval speed of loop. Change will take effect on next loop. For it to kick
   * in earlier, call .reset() after changing the value.
   */
  set interval(interval: Interval);
  /**
   * Gets the current interval, ie. speed of loop.
   */
  get interval(): Interval;
};
type ContinuouslySyncCallback = (
/**
 * Number of times loop
 * Ticks is reset when loop exits.
 */
ticks?: number,
/**
 * Elapsed milliseconds.
 * Reset when loop exits
 */
elapsedMs?: number) => boolean | void;
type ContinuouslyAsyncCallback = (
/**
 * Number of times loop has run
 * Reset when loop exits.
 */
ticks?: number,
/**
 * Elapsed milliseconds.
 * Reset when loop exits.
 */
elapsedMs?: number) => Promise<boolean | void>;
type OnStartCalled = `continue` | `cancel` | `reset` | `dispose`;
/**
 * Options for {@link continuously}
 */
type ContinuouslyOpts = Readonly<{
  /**
   * Abort signal to exit loop
   */
  signal: AbortSignal;
  /**
   * If _true_, callback runs before waiting period.
   * @defaultValue false
   */
  fireBeforeWait: boolean;
  /**
   * Called whenever .start() is invoked.
   * If this function returns:
   *  - `continue`: the loop starts if it hasn't started yet, or continues if already started
   *  - `cancel`: loop stops, but can be re-started if .start() is called again
   *  - `dispose`: loop stops and will throw an error if .start() is attempted to be called
   *  - `reset`: loop resets (ie. existing scheduled task is cancelled)
   *
   */
  onStartCalled: (
  /**
   * Number of times loop has run
   * Reset when loop is exits.
   */
  ticks?: number,
  /**
   * Elapsed milliseconds.
   * Reset when loop is exits.
   */
  elapsedMs?: number) => OnStartCalled;
}>;
/**
 * Returns a {@link Continuously} that continually executes `callback` at `interval` rate.
 *
 * By default, first the sleep period happens and then the callback happens.
 *
 * Call `start` to begin/reset loop. The looping stops when `cancel` is called, or when `callback` returns _false_.
 *
 * @example
 * Animation loop
 * ```js
 * const draw = () => {
 *  // Draw on canvas
 * }
 *
 * // Run draw() synchronised with monitor refresh rate via `window.requestAnimationFrame`
 * continuously(draw).start();
 * ```
 *
 * @example
 * With delay
 * ```js
 * const fn = () => {
 *  // Runs after one minute
 * }
 * const c = continuously(fn, { mins: 1 } );
 * c.start(); // Runs `fn` every minute
 * ```
 *
 * @example
 * Control a 'continuously'
 * ```js
 * c.cancel();   // Stop the loop, cancelling any up-coming calls to `fn`
 * c.elapsedMs;  // How many milliseconds have elapsed since start
 * c.ticks;      // How many iterations of loop since start
 * c.interval;   // Get/set speed of loop. Change kicks-in at next loop.
 *               // Use .start() to reset to new interval immediately
 * ```
 *
 * Asynchronous callback functions are supported too:
 * ```js
 * continuously(async () => { ..});
 * ```
 *
 * The `callback` function can receive a few arguments:
 *
 * ```js
 * continuously( (ticks, elapsedMs) => {
 *  // ticks: how many times loop has run
 *  // elapsedMs:  how long since last loop
 * }).start();
 * ```
 *
 * If the callback explicitly returns _false_, the loop will be cancelled.
 *
 * ```js
 * continuously(ticks => {
 *  // Stop after 100 iterations
 *  if (ticks > 100) return false;
 * }).start();
 * ```
 *
 * You can intercept the logic for calls to `start()` with `onStartCalled`. It can determine
 * whether the `start()` proceeds, if the loop is cancelled, or the whole thing disposed,
 * so it can't run any longer.
 *
 * ```js
 * continuously(callback, intervalMs, {
 *  onStartCalled:(ticks, elapsedMs) => {
 *    // Cancel the loop after 1000ms has elapsed
 *    if (elapsedMs > 1000) return `cancel`;
 *  }
 * }).start();
 * ```
 *
 * To run `callback` *before* the sleep happens, set `fireBeforeWait`:
 * ```js
 * continuously(callback, intervalMs, { fireBeforeWait: true });
 * ```
 * @param callback - Function to run. If it returns _false_, loop exits.
 * @param options - {@link ContinuouslyOpts ContinuouslyOpts}
 * @param interval - Speed of loop (default: 0)
 * @returns Instance to control looping.
 * @see Flow.timeout if you want to trigger something once.
 */
declare const continuously: (callback: ContinuouslyAsyncCallback | ContinuouslySyncCallback, interval?: Interval, options?: Partial<ContinuouslyOpts>) => Continuously;
//# sourceMappingURL=continuously.d.ts.map
//#endregion
//#region ../debug/dist/src/types.d.ts
type LogSet = {
  readonly log: MessageLogger;
  readonly warn: MessageLogger;
  readonly error: MessageLogger;
};
type MessageLogger = (message: LogMessage | string) => void;
type LogKind = `info` | `debug` | `error` | `warn`;
type LogMessage = {
  readonly kind?: LogKind;
  readonly msg: any;
  readonly category?: string;
};
//# sourceMappingURL=types.d.ts.map

//#endregion
//#region ../debug/dist/src/logger.d.ts
/**
 * Returns a console logging function which prefixes messages. This is
 * useful for tracing messages from different components. Each prefix
 * is assigned a colour, further helping to distinguish messages.
 *
 * Use {@link logSet} to get a bundled set.
 *
 * ```
 * // Initialise once
 * const log = logger(`a`);
 * const error = logger(`a`, `error`);
 * const warn = logger(`a`, `warn);
 *
 * // And then use
 * log(`Hello`);    // console.log(`a Hello`);
 * error(`Uh-oh`);  // console.error(`a Uh-oh`);
 * warn(`Eek!`);    // console.warn(`a Eeek!`);
 * ```
 *
 * Provide the `colourKey` parameter to make log messages
 * be coloured the same, even though the prefix is different.
 * ```js
 * // Both loggers will use the same colour because they
 * // share the colour key `system`
 * const log = logger(`a`,`log`,`system`);
 * const log2 = logger(`b`, `log`, `system`);
 * ```
 * @param prefix
 * @param kind
 * @param colourKey Optional key to colour log lines by instead of prefix
 * @returns
 */
declare const logger: (prefix: string, kind?: `log` | `warn` | `error`, colourKey?: string) => MessageLogger;
/**
* Returns a bundled collection of {@link logger}s
*
* ```js
* const con = logSet(`a`);
* con.log(`Hello`);  // console.log(`a Hello`);
* con.warn(`Uh-oh`); // console.warn(`a Uh-oh`);
* con.error(`Eek!`); // console.error(`a Eek!`);
* ```
*
* By default each prefix is assigned a colour. To use
* another logic, provide the `colourKey` parameter.
*
* ```js
* // Both set of loggers will use same colour
* const con = logSet(`a`, true, `system`);
* const con2 = logSet(`b`, true, `system`);
* ```
* @param prefix Prefix for log messages
* @param verbose True by default. If false, log() messages are a no-op
* @param colourKey If specified, log messages will be coloured by this key instead of prefix (default)
* @returns
*/
declare const logSet: (prefix: string, verbose?: boolean, colourKey?: string) => {
  log: MessageLogger;
  warn: MessageLogger;
  error: MessageLogger;
};
/**
 * Either a flag for default console logging, or a simple log function
 */
type LogOption = boolean | MessageLogger;
/**
 * Resolve a LogOption to a function
 * @param l
 * @returns
 */
declare const resolveLogOption: (l?: LogOption, defaults?: {
  readonly category?: string;
  readonly kind?: string;
}) => MessageLogger;
declare const logColours: (key: string, args?: unknown) => string;
//# sourceMappingURL=logger.d.ts.map
//#endregion
//#region ../debug/dist/src/fps-counter.d.ts
/**
 * Calculates frames per second.
 *
 * Returns a function which needs to be called at the end of each frame.
 *
 * ```js
 * const fps = fpsCounter();
 *
 * function loop() {
 *  fps(); // Calculate fps
 *  window.requestAnimationFrame(loop);
 * }
 *
 * loop();
 * ```
 * @param autoDisplay If true (default), prints out the FPS to the console
 * @param computeAfterFrames Calculates after this many frames. Higher numbers smoothes the value somewhat
 * @returns
 */
declare const fpsCounter: (autoDisplay?: boolean, computeAfterFrames?: number) => () => number;
//# sourceMappingURL=fps-counter.d.ts.map
//#endregion
//#region ../debug/dist/src/error-message.d.ts
/**
 * Returns a string representation of an error
 * @param ex
 * @returns
 */
declare const getErrorMessage: (ex: unknown) => string;
//# sourceMappingURL=error-message.d.ts.map
declare namespace index_d_exports {
  export { LogKind, LogMessage, LogOption, LogSet, MessageLogger, fpsCounter, getErrorMessage, logColours, logSet, logger, resolveLogOption };
}
//#endregion
export { Continuously, ContinuouslyAsyncCallback, ContinuouslyOpts, ContinuouslySyncCallback, HasCompletion, HasCompletionRunStates, LogOption, LogSet, OnStartCalled, continuously, index_d_exports };
//# sourceMappingURL=index-Bne6KcmH.d.ts.map