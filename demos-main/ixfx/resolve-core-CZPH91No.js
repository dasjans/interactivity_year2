import { __export } from "./chunk-51aI8Tpl.js";

//#region ../core/dist/src/reactive-core.js
/**
* Returns _true_ if `rx` is a Reactive
* @param rx
* @returns
*/
const isReactive = (rx) => {
	if (typeof rx !== `object`) return false;
	if (rx === null) return false;
	return `on` in rx && `onValue` in rx;
};
/**
* Returns _true_ if `rx` has a last value
*
* Judged seeing if `.last()` exists on `rx`.
* @param rx Reactive
* @returns
*/
const hasLast = (rx) => {
	if (!isReactive(rx)) return false;
	if (`last` in rx) {
		const v = rx.last();
		if (v !== void 0) return true;
	}
	return false;
};

//#endregion
//#region ../debug/dist/src/util.js
const getOrGenerateSync = (map, fn) => (key, args) => {
	let value = map.get(key);
	if (value !== void 0) return value;
	value = fn(key, args);
	map.set(key, value);
	return value;
};

//#endregion
//#region ../debug/dist/src/logger.js
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
const logger = (prefix, kind = `log`, colourKey) => (m) => {
	if (m === void 0) m = `(undefined)`;
	else if (typeof m === `object`) m = JSON.stringify(m);
	const colour = colourKey ?? prefix;
	switch (kind) {
		case `log`: {
			console.log(`%c${prefix} ${m}`, `color: ${logColours(colour)}`);
			break;
		}
		case `warn`: {
			console.warn(prefix, m);
			break;
		}
		case `error`: {
			console.error(prefix, m);
			break;
		}
	}
};
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
const logSet = (prefix, verbose = true, colourKey) => {
	if (verbose) return {
		log: logger(prefix, `log`, colourKey),
		warn: logger(prefix, `warn`, colourKey),
		error: logger(prefix, `error`, colourKey)
	};
	return {
		log: (_) => {
			/** no-op */
		},
		warn: logger(prefix, `warn`, colourKey),
		error: logger(prefix, `error`, colourKey)
	};
};
/**
* Resolve a LogOption to a function
* @param l
* @returns
*/
const resolveLogOption = (l, defaults = {}) => {
	if (l === void 0 || typeof l === `boolean` && !l) return (_) => {
		/** no-op */
	};
	const defaultCat = defaults.category ?? ``;
	const defaultKind = defaults.kind ?? void 0;
	if (typeof l === `boolean`) return (messageOrString) => {
		const m = typeof messageOrString === `string` ? { msg: messageOrString } : messageOrString;
		const kind = m.kind ?? defaultKind;
		const category = m.category ?? defaultCat;
		let message = m.msg;
		if (category) message = `[${category}] ${message}`;
		switch (kind) {
			case `error`: {
				console.error(message);
				break;
			}
			case `warn`: {
				console.warn(message);
				break;
			}
			case `info`: {
				console.info(message);
				break;
			}
			default: console.log(message);
		}
	};
	return l;
};
let logColourCount = 0;
const logColours = getOrGenerateSync(/* @__PURE__ */ new Map(), () => {
	const hue = ++logColourCount * 137.508;
	return `hsl(${hue},50%,75%)`;
});

//#endregion
//#region ../debug/dist/src/fps-counter.js
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
const fpsCounter = (autoDisplay = true, computeAfterFrames = 500) => {
	let count = 0;
	let lastFps = 0;
	let countStart = performance.now();
	return () => {
		if (count++ >= computeAfterFrames) {
			const elapsed = performance.now() - countStart;
			countStart = performance.now();
			count = 0;
			lastFps = Math.floor(computeAfterFrames / elapsed * 1e3);
			if (autoDisplay) console.log(`fps: ${lastFps}`);
		}
		return lastFps;
	};
};

//#endregion
//#region ../debug/dist/src/error-message.js
/**
* Returns a string representation of an error
* @param ex
* @returns
*/
const getErrorMessage = (ex) => {
	if (typeof ex === `string`) return ex;
	if (ex instanceof Error) return ex.message;
	return ex;
};

//#endregion
//#region ../debug/dist/src/index.js
var src_exports = {};
__export(src_exports, {
	fpsCounter: () => fpsCounter,
	getErrorMessage: () => getErrorMessage,
	logColours: () => logColours,
	logSet: () => logSet,
	logger: () => logger,
	resolveLogOption: () => resolveLogOption
});

//#endregion
//#region ../core/dist/src/resolve-core.js
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
async function resolve(resolvable, ...args) {
	if (typeof resolvable === `object`) if (`next` in resolvable) {
		const tag = resolvable[Symbol.toStringTag];
		if (tag === `Generator` || tag == `Array Iterator`) {
			const v = resolvable.next();
			if (`done` in v && `value` in v) return v.value;
			return v;
		} else if (tag === `AsyncGenerator`) {
			const v = await resolvable.next();
			if (`done` in v && `value` in v) return v.value;
			return v;
		} else throw new Error(`Object has 'next' prop, but does not have 'AsyncGenerator', 'Generator' or 'Array Iterator' string tag symbol. Got: '${tag}'`);
	} else if (isReactive(resolvable)) {
		if (hasLast(resolvable)) return resolvable.last();
		throw new Error(`Reactive does not have last value`);
	} else return resolvable;
	else if (typeof resolvable === `function`) {
		const v = await resolvable(...args);
		return v;
	} else return resolvable;
}
/**
* For the given input, attempts to 'resolve' it. See {@link resolve} for details and asynchronous version.
* @param resolvable
* @param args
* @returns
*/
function resolveSync(resolvable, ...args) {
	if (typeof resolvable === `object`) if (`next` in resolvable) {
		const tag = resolvable[Symbol.toStringTag];
		if (tag === `Generator` || tag == `Array Iterator`) {
			const v = resolvable.next();
			if (`done` in v && `value` in v) return v.value;
			return v;
		} else if (tag === `AsyncGenerator`) throw new Error(`resolveSync cannot work with an async generator`);
		else throw new Error(`Object has 'next' prop, but does not have 'Generator' or 'Array Iterator' string tag symbol. Got: '${tag}'`);
	} else if (isReactive(resolvable)) {
		if (hasLast(resolvable)) return resolvable.last();
		throw new Error(`Reactive does not have last value`);
	} else return resolvable;
	else if (typeof resolvable === `function`) return resolvable(...args);
	else return resolvable;
}
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
async function resolveWithFallback(p, options, ...args) {
	let errored = false;
	let fallbackValue = options.value;
	const overrideWithLast = options.overrideWithLast ?? false;
	if (fallbackValue === void 0) throw new Error(`Param 'options.value' is undefined`);
	try {
		const r = await resolve(p, ...args);
		if (typeof r === `undefined`) return fallbackValue;
		if (typeof r === `number` && Number.isNaN(r)) return fallbackValue;
		if (overrideWithLast) fallbackValue = r;
		return r;
	} catch (error) {
		if (!errored) {
			errored = true;
			console.warn(`resolveWithFallback swallowed an error. Additional errors not reported.`, getErrorMessage(error));
		}
		return fallbackValue;
	}
}
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
function resolveWithFallbackSync(p, options, ...args) {
	let errored = false;
	let fallbackValue = options.value;
	const overrideWithLast = options.overrideWithLast ?? false;
	if (fallbackValue === void 0) throw new Error(`Param 'options.value' is undefined`);
	try {
		const r = resolveSync(p, ...args);
		if (typeof r === `undefined`) return fallbackValue;
		if (typeof r === `number` && Number.isNaN(r)) return fallbackValue;
		if (overrideWithLast) fallbackValue = r;
		return r;
	} catch (error) {
		if (!errored) {
			errored = true;
			console.warn(`resolveWithFallbackSync swallowed an error. Additional errors not reported.`, getErrorMessage(error));
		}
		return fallbackValue;
	}
}

//#endregion
export { getErrorMessage, hasLast, isReactive, logSet, resolve, resolveLogOption, resolveSync, resolveWithFallback, resolveWithFallbackSync, src_exports };
//# sourceMappingURL=resolve-core-CZPH91No.js.map