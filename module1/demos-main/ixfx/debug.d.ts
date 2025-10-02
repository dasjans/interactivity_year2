//#region ../debug/src/types.d.ts
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
//#region ../debug/src/logger.d.ts
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
//#region ../debug/src/fps-counter.d.ts
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
//#region ../debug/src/error-message.d.ts
/**
 * Returns a string representation of an error
 * @param ex
 * @returns
 */
declare const getErrorMessage: (ex: unknown) => string;
//# sourceMappingURL=error-message.d.ts.map

//#endregion
export { LogKind, LogMessage, LogOption, LogSet, MessageLogger, fpsCounter, getErrorMessage, logColours, logSet, logger, resolveLogOption };
//# sourceMappingURL=debug.d.ts.map