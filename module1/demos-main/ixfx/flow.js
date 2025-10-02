import { __export } from "./chunk-51aI8Tpl.js";
import { integerTest, numberTest, resultIsError, resultThrow, resultToError } from "./src-BBD50Kth.js";
import "./is-primitive-eBwrK4Yg.js";
import { elapsedToHumanString, intervalToMs } from "./interval-type-DajslxUJ.js";
import { continuously, defaultComparer, elapsedInfinity, elapsedSince, sleep } from "./basic-D0XoOdBJ.js";
import { SimpleEventEmitter } from "./src-TlKlGoex.js";
import { getErrorMessage, logSet, resolve, resolveLogOption, resolveSync } from "./resolve-core-BwRmfzav.js";
import { clamp$1 as clamp, movingAverageLight, randomElement, shuffle, unique } from "./src-BeVDUOoq.js";
import { mutable$1 as mutable, rateMinimum } from "./src-BIfshA2g.js";

//#region ../flow/src/behaviour-tree.ts
const getName = (t, defaultValue = ``) => {
	if (typeof t === `object` && `name` in t && t.name !== void 0) return t.name;
	return defaultValue;
};
function* iterateBreadth(t, pathPrefix) {
	if (typeof pathPrefix === `undefined`) pathPrefix = getName(t);
	for (const [index, n] of entries(t)) yield [n, pathPrefix];
	for (const [index, n] of entries(t)) {
		const name = getName(n, `?`);
		const prefix = pathPrefix.length > 0 ? pathPrefix + `.` + name : name;
		yield* iterateBreadth(n, prefix);
	}
}
function* iterateDepth(t, pathPrefix) {
	if (typeof pathPrefix === `undefined`) pathPrefix = getName(t);
	for (const [index, n] of entries(t)) {
		yield [n, pathPrefix];
		const name = getName(n, `?`);
		const prefix = pathPrefix.length > 0 ? pathPrefix + `.` + name : name;
		yield* iterateBreadth(n, prefix);
	}
}
function isSeqNode(n) {
	return n.seq !== void 0;
}
function isSelNode(n) {
	return n.sel !== void 0;
}
function* entries(n) {
	if (isSeqNode(n)) yield* n.seq.entries();
	else if (isSelNode(n)) yield* n.sel.entries();
	else if (typeof n === `string`) {} else throw new TypeError(`Unexpected shape of node. seq/sel missing`);
}

//#endregion
//#region ../flow/src/delay.ts
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
const delay = async (callback, optsOrMillis) => {
	const opts = typeof optsOrMillis === `number` ? { millis: optsOrMillis } : optsOrMillis;
	const delayWhen = opts.delay ?? `before`;
	if (delayWhen === `before` || delayWhen === `both`) await sleep(opts);
	const r = Promise.resolve(await callback());
	if (delayWhen === `after` || delayWhen === `both`) await sleep(opts);
	return r;
};
/**
* Iterate over a source iterable with some delay between results.
* Delay can be before, after or both before and after each result from the
* source iterable.
*
* Since it's an async iterable, `for await ... of` is needed.
*
* ```js
* const opts = { intervalMs: 1000, delay: 'before' };
* const iterable = count(10);
* for await (const i of delayIterable(iterable, opts)) {
*  // Prints 0..9 with one second between
* }
* ```
*
* Use {@link delay} to return a result after some delay
*
* @param iter
* @param opts
*/
/**
* Async generator that loops via `requestAnimationFrame`.
*
* We can use `for await of` to run code:
* ```js
* const loop = delayAnimationLoop();
* for await (const o of loop) {
*  // Do something...
*  // Warning: loops forever
* }
* // Warning: execution doesn't continue to this point
* // unless there is a 'break' in loop.
* ```
* 
* Or use the generator in manually:
* ```js
* // Loop forever
* (async () => {
*  const loop = delayAnimationLoop();
*  while (true) {
*    await loop.next();
*
*    // Do something...
*    // Warning: loops forever
*  }
* })();
* ```
* 
* Practically, these approaches are not so useful
* because execution blocks until the loop finishes.
* 
* Instead, we might want to continually loop a bit
* of code while other bits of code continue to run.
* 
* The below example shows how to do this.
* 
* ```js
* setTimeout(async () => {
*  for await (const _ of delayAnimationLoop()) {
*    // Do soething at animation speed
*  }
* });
* 
* // Execution continues while loop also runs
* ```
*
*/
async function* delayAnimationLoop() {
	let resolve$1;
	let p = new Promise((r) => resolve$1 = r);
	let timer = 0;
	const callback = () => {
		if (resolve$1) resolve$1();
		p = new Promise((r) => resolve$1 = r);
	};
	try {
		while (true) {
			timer = globalThis.requestAnimationFrame(callback);
			const _ = await p;
			yield _;
		}
	} finally {
		if (resolve$1) resolve$1();
		globalThis.cancelAnimationFrame(timer);
	}
}
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
async function* delayLoop(timeout$1) {
	const timeoutMs = intervalToMs(timeout$1);
	if (typeof timeoutMs === `undefined`) throw new Error(`timeout is undefined`);
	if (timeoutMs < 0) throw new Error(`Timeout is less than zero`);
	if (timeoutMs === 0) return yield* delayAnimationLoop();
	let resolve$1;
	let p = new Promise((r) => resolve$1 = r);
	let timer;
	const callback = () => {
		if (resolve$1) resolve$1();
		p = new Promise((r) => resolve$1 = r);
	};
	try {
		while (true) {
			timer = globalThis.setTimeout(callback, timeoutMs);
			const _ = await p;
			yield _;
		}
	} finally {
		if (resolve$1) resolve$1();
		if (timer !== void 0) globalThis.clearTimeout(timer);
		timer = void 0;
	}
}

//#endregion
//#region ../flow/src/timeout.ts
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
const timeout = (callback, interval) => {
	if (callback === void 0) throw new Error(`callback parameter is undefined`);
	const intervalMs = intervalToMs(interval);
	resultThrow(integerTest(intervalMs, `aboveZero`, `interval`));
	let timer;
	let startedAt = 0;
	let startCount = 0;
	let startCountTotal = 0;
	let state = `idle`;
	const clear = () => {
		startedAt = 0;
		globalThis.clearTimeout(timer);
		state = `idle`;
	};
	const start = async (altInterval = interval, args) => {
		const p = new Promise((resolve$1, reject) => {
			startedAt = performance.now();
			const altTimeoutMs = intervalToMs(altInterval);
			const it = integerTest(altTimeoutMs, `aboveZero`, `altTimeoutMs`);
			if (resultIsError(it)) {
				reject(resultToError(it));
				return;
			}
			switch (state) {
				case `scheduled`: {
					cancel();
					break;
				}
				case `running`: break;
			}
			state = `scheduled`;
			timer = globalThis.setTimeout(async () => {
				if (state !== `scheduled`) {
					console.warn(`Timeout skipping execution since state is not 'scheduled'`);
					clear();
					return;
				}
				const args_ = args ?? [];
				startCount++;
				startCountTotal++;
				state = `running`;
				await callback(performance.now() - startedAt, ...args_);
				state = `idle`;
				clear();
				resolve$1();
			}, altTimeoutMs);
		});
		return p;
	};
	const cancel = () => {
		if (state === `idle`) return;
		clear();
	};
	return {
		start,
		cancel,
		get runState() {
			return state;
		},
		get startCount() {
			return startCount;
		},
		get startCountTotal() {
			return startCountTotal;
		}
	};
};

//#endregion
//#region ../flow/src/debounce.ts
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
const debounce = (callback, interval) => {
	const t = timeout(callback, interval);
	return (...args) => {
		t.start(void 0, args);
	};
};

//#endregion
//#region ../flow/src/dispatch-list.ts
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
var DispatchList = class {
	#handlers;
	#counter = 0;
	#id = Math.floor(Math.random() * 100);
	constructor() {
		this.#handlers = [];
	}
	/**
	* Returns _true_ if list is empty
	* @returns 
	*/
	isEmpty() {
		return this.#handlers.length === 0;
	}
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
	add(handler, options = {}) {
		this.#counter++;
		const once = options.once ?? false;
		const wrap = {
			id: `${this.#id} - ${this.#counter}`,
			handler,
			once
		};
		this.#handlers.push(wrap);
		return wrap.id;
	}
	/**
	* Remove a handler by its id.
	* @param id 
	* @returns _True_ if handler was removed, _false_ if not found.
	*/
	remove(id) {
		const length = this.#handlers.length;
		this.#handlers = this.#handlers.filter((handler) => handler.id !== id);
		return this.#handlers.length !== length;
	}
	/**
	* Emit a value to all handlers
	* @param value 
	*/
	notify(value) {
		for (const handler of this.#handlers) {
			handler.handler(value);
			if (handler.once) this.remove(handler.id);
		}
	}
	/**
	* Remove all handlers
	*/
	clear() {
		this.#handlers = [];
	}
};

//#endregion
//#region ../flow/src/every.ts
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
const everyNth = (nth, callback) => {
	resultThrow(integerTest(nth, `positive`, `nth`));
	let counter = 0;
	return (data) => {
		counter++;
		if (counter === nth) {
			counter = 0;
			if (callback) callback(data);
			return true;
		}
		return false;
	};
};

//#endregion
//#region ../flow/src/execute.ts
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
const run = async (expressions, opts = {}, args) => {
	const results = [];
	const compareFunction = opts.rank ?? defaultComparer;
	let expressionsArray = Array.isArray(expressions) ? expressions : [expressions];
	if (opts.shuffle) expressionsArray = shuffle(expressionsArray);
	for (let index = 0; index < expressionsArray.length; index++) {
		const exp = expressionsArray[index];
		let r;
		if (typeof exp === "function") r = await exp(args);
		else r = exp;
		if (r !== void 0) {
			results.push(r);
			results.sort(compareFunction);
		}
		if (typeof opts.stop !== "undefined") {
			if (opts.stop(r, results)) break;
		}
	}
	if (opts.filter) return results.filter(opts.filter);
	return results;
};
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
const runSingle = async (expressions, opts = {}, args) => {
	const results = await run(expressions, opts, args);
	if (!results) return;
	if (results.length === 0) return;
	const at = opts.at ?? -1;
	return results.at(at);
};

//#endregion
//#region ../flow/src/event-race.ts
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
const eventRace = (target, eventNames, options = {}) => {
	const intervalMs = options.timeoutMs ?? 601e3;
	const signal = options.signal;
	let triggered = false;
	let disposed = false;
	let timeout$1;
	const promise = new Promise((resolve$1, reject) => {
		const onEvent = (event) => {
			if (`type` in event) if (eventNames.includes(event.type)) {
				triggered = true;
				resolve$1(event);
				dispose();
			} else console.warn(`eventRace: Got event '${event.type}' that is not in race list`);
			else {
				console.warn(`eventRace: Event data does not have expected 'type' field`);
				console.log(event);
			}
		};
		for (const name of eventNames) target.addEventListener(name, onEvent);
		const dispose = () => {
			if (disposed) return;
			if (timeout$1 !== void 0) clearTimeout(timeout$1);
			timeout$1 = void 0;
			disposed = true;
			for (const name of eventNames) target.removeEventListener(name, onEvent);
		};
		timeout$1 = setTimeout(() => {
			if (triggered || disposed) return;
			dispose();
			reject(/* @__PURE__ */ new Error(`eventRace: Events not fired within interval. Events: ${JSON.stringify(eventNames)} Interval: ${intervalMs}`));
		}, intervalMs);
		signal?.addEventListener(`abort`, () => {
			if (triggered || disposed) return;
			dispose();
			reject(/* @__PURE__ */ new Error(`Abort signal received ${signal.reason}`));
		});
	});
	return promise;
};

//#endregion
//#region ../flow/src/moving-average.ts
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
const movingAverageTimed = (options) => {
	const average = movingAverageLight();
	const rm = rateMinimum({
		...options,
		whatToCall: (distance) => {
			average(distance);
		},
		fallback() {
			return options.default ?? 0;
		}
	});
	return (v) => {
		rm(v);
		return average();
	};
};

//#endregion
//#region ../flow/src/pool.ts
/**
* A use of a pool resource
*
* Has two events, _disposed_ and _released_.
*/
var PoolUser = class extends SimpleEventEmitter {
	_lastUpdate;
	_pool;
	_state;
	_userExpireAfterMs;
	/**
	* Constructor
	* @param key User key
	* @param resource Resource being used
	*/
	constructor(key, resource) {
		super();
		this.key = key;
		this.resource = resource;
		this._lastUpdate = performance.now();
		this._pool = resource.pool;
		this._userExpireAfterMs = this._pool.userExpireAfterMs;
		this._state = `idle`;
		this._pool.log.log(`PoolUser ctor key: ${this.key}`);
	}
	/**
	* Returns a human readable debug string
	* @returns
	*/
	toString() {
		if (this.isDisposed) return `PoolUser. State: disposed`;
		return `PoolUser. State: ${this._state} Elapsed: ${performance.now() - this._lastUpdate} Data: ${JSON.stringify(this.resource.data)}`;
	}
	/**
	* Resets countdown for instance expiry.
	* Throws an error if instance is disposed.
	*/
	keepAlive() {
		if (this._state === `disposed`) throw new Error(`PoolItem disposed`);
		this._lastUpdate = performance.now();
	}
	/**
	* @internal
	* @param reason
	* @returns
	*/
	_dispose(reason, data) {
		if (this._state === `disposed`) return;
		const resource = this.resource;
		this._state = `disposed`;
		resource._release(this);
		this._pool.log.log(`PoolUser dispose key: ${this.key} reason: ${reason}`);
		this.fireEvent(`disposed`, {
			data,
			reason
		});
		super.clearEventListeners();
	}
	/**
	* Release this instance
	* @param reason
	*/
	release(reason) {
		if (this.isDisposed) throw new Error(`User disposed`);
		const resource = this.resource;
		const data = resource.data;
		this._pool.log.log(`PoolUser release key: ${this.key} reason: ${reason}`);
		this.fireEvent(`released`, {
			data,
			reason
		});
		this._dispose(`release-${reason}`, data);
	}
	get data() {
		if (this.isDisposed) throw new Error(`User disposed`);
		return this.resource.data;
	}
	/**
	* Returns true if this instance has expired.
	* Expiry counts if elapsed time is greater than `userExpireAfterMs`
	*/
	get isExpired() {
		if (this._userExpireAfterMs > 0) return performance.now() > this._lastUpdate + this._userExpireAfterMs;
		return false;
	}
	/**
	* Returns elapsed time since last 'update'
	*/
	get elapsed() {
		return performance.now() - this._lastUpdate;
	}
	/**
	* Returns true if instance is disposed
	*/
	get isDisposed() {
		return this._state === `disposed`;
	}
	/**
	* Returns true if instance is neither disposed nor expired
	*/
	get isValid() {
		if (this.isDisposed || this.isExpired) return false;
		if (this.resource.isDisposed) return false;
		return true;
	}
};
/**
* A resource allocated in the Pool
*/
var Resource = class {
	#state;
	#data;
	#users;
	#capacityPerResource;
	#resourcesWithoutUserExpireAfterMs;
	#lastUsersChange;
	/**
	* Constructor.
	* @param pool Pool
	* @param data Data
	*/
	constructor(pool, data) {
		this.pool = pool;
		if (data === void 0) throw new Error(`Parameter 'data' is undefined`);
		if (pool === void 0) throw new Error(`Parameter 'pool' is undefined`);
		this.#data = data;
		this.#lastUsersChange = 0;
		this.#resourcesWithoutUserExpireAfterMs = pool.resourcesWithoutUserExpireAfterMs;
		this.#capacityPerResource = pool.capacityPerResource;
		this.#users = [];
		this.#state = `idle`;
	}
	/**
	* Gets data associated with resource.
	* Throws an error if disposed
	*/
	get data() {
		if (this.#state === `disposed`) throw new Error(`Resource disposed`);
		return this.#data;
	}
	/**
	* Changes the data associated with this resource.
	* Throws an error if disposed or `data` is undefined.
	* @param data
	*/
	updateData(data) {
		if (this.#state === `disposed`) throw new Error(`Resource disposed`);
		if (data === void 0) throw new Error(`Parameter 'data' is undefined`);
		this.#data = data;
	}
	/**
	* Returns a human-readable debug string for resource
	* @returns
	*/
	toString() {
		return `Resource (expired: ${this.isExpiredFromUsers} users: ${this.#users.length}, state: ${this.#state}) data: ${JSON.stringify(this.data)}`;
	}
	/**
	* Assigns a user to this resource.
	* @internal
	* @param user
	*/
	_assign(user) {
		const existing = this.#users.find((u) => u === user || u.key === user.key);
		if (existing) throw new Error(`User instance already assigned to resource`);
		this.#users.push(user);
		this.#lastUsersChange = performance.now();
	}
	/**
	* Releases a user from this resource
	* @internal
	* @param user
	*/
	_release(user) {
		this.#users = this.#users.filter((u) => u !== user);
		this.pool._release(user);
		this.#lastUsersChange = performance.now();
	}
	/**
	* Returns true if resource can have additional users allocated
	*/
	get hasUserCapacity() {
		return this.usersCount < this.#capacityPerResource;
	}
	/**
	* Returns number of uses of the resource
	*/
	get usersCount() {
		return this.#users.length;
	}
	/**
	* Returns true if automatic expiry is enabled, and that interval
	* has elapsed since the users list has changed for this resource
	*/
	get isExpiredFromUsers() {
		if (this.#resourcesWithoutUserExpireAfterMs <= 0) return false;
		if (this.#users.length > 0) return false;
		return performance.now() > this.#resourcesWithoutUserExpireAfterMs + this.#lastUsersChange;
	}
	/**
	* Returns true if instance is disposed
	*/
	get isDisposed() {
		return this.#state === `disposed`;
	}
	/**
	* Disposes the resource.
	* If it is already disposed, it does nothing.
	* @param reason
	* @returns
	*/
	dispose(reason) {
		if (this.#state === `disposed`) return;
		const data = this.#data;
		this.#state = `disposed`;
		this.pool.log.log(`Resource disposed (${reason})`);
		for (const u of this.#users) u._dispose(`resource-${reason}`, data);
		this.#users = [];
		this.#lastUsersChange = performance.now();
		this.pool._releaseResource(this, reason);
		if (this.pool.freeResource) this.pool.freeResource(data);
	}
};
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
var Pool = class {
	_resources;
	_users;
	capacity;
	userExpireAfterMs;
	resourcesWithoutUserExpireAfterMs;
	capacityPerResource;
	fullPolicy;
	generateResource;
	freeResource;
	log = logSet(`Pool`);
	/**
	* Constructor.
	*
	* By default, no capacity limit, one user per resource
	* @param options Pool options
	*/
	constructor(options = {}) {
		this.capacity = options.capacity ?? -1;
		this.fullPolicy = options.fullPolicy ?? `error`;
		this.capacityPerResource = options.capacityPerResource ?? 1;
		this.userExpireAfterMs = options.userExpireAfterMs ?? -1;
		this.resourcesWithoutUserExpireAfterMs = options.resourcesWithoutUserExpireAfterMs ?? -1;
		this.generateResource = options.generate;
		this.freeResource = options.free;
		this._users = /* @__PURE__ */ new Map();
		this._resources = [];
		this.log = logSet(`Pool`, options.debug ?? false);
		const timer = Math.max(this.userExpireAfterMs, this.resourcesWithoutUserExpireAfterMs);
		if (timer > 0) setInterval(() => {
			this.maintain();
		}, timer * 1.1);
	}
	/**
	* Returns a debug string of Pool state
	* @returns
	*/
	dumpToString() {
		let r = `Pool
    capacity: ${this.capacity} userExpireAfterMs: ${this.userExpireAfterMs} capacityPerResource: ${this.capacityPerResource}
    resources count: ${this._resources.length}`;
		const resource = this._resources.map((r$1) => r$1.toString()).join(`\r\n\t`);
		r += `\r\nResources:\r\n\t` + resource;
		r += `\r\nUsers: \r\n`;
		for (const [k, v] of this._users.entries()) r += `\tk: ${k} v: ${v.toString()}\r\n`;
		return r;
	}
	/**
	* Sorts users by longest elapsed time since update
	* @returns
	*/
	getUsersByLongestElapsed() {
		return [...this._users.values()].sort((a, b) => {
			const aa = a.elapsed;
			const bb = b.elapsed;
			if (aa === bb) return 0;
			if (aa < bb) return 1;
			return -1;
		});
	}
	/**
	* Returns resources sorted with least used first
	* @returns
	*/
	getResourcesSortedByUse() {
		return [...this._resources].sort((a, b) => {
			if (a.usersCount === b.usersCount) return 0;
			if (a.usersCount < b.usersCount) return -1;
			return 1;
		});
	}
	/**
	* Adds a shared resource to the pool
	* @throws Error if the capacity limit is reached or resource is null
	* @param resource
	* @returns
	*/
	addResource(resource) {
		if (resource === void 0) throw new Error(`Cannot add undefined resource`);
		if (resource === null) throw new TypeError(`Cannot add null resource`);
		if (this.capacity > 0 && this._resources.length === this.capacity) throw new Error(`Capacity limit (${this.capacity}) reached. Cannot add more.`);
		this.log.log(`Adding resource: ${JSON.stringify(resource)}`);
		const pi = new Resource(this, resource);
		this._resources.push(pi);
		return pi;
	}
	/**
	* Performs maintenance, removing disposed/expired resources & users.
	* This is called automatically when using a resource.
	*/
	maintain() {
		let changed = false;
		const nuke = [];
		for (const p of this._resources) if (p.isDisposed) {
			this.log.log(`Maintain, disposed resource: ${JSON.stringify(p.data)}`);
			nuke.push(p);
		} else if (p.isExpiredFromUsers) {
			this.log.log(`Maintain, expired resource: ${JSON.stringify(p.data)}`);
			nuke.push(p);
		}
		if (nuke.length > 0) {
			for (const resource of nuke) resource.dispose(`diposed/expired`);
			changed = true;
		}
		const userKeysToRemove = [];
		for (const [key, user] of this._users.entries()) if (!user.isValid) {
			this.log.log(`Maintain. Invalid user: ${user.key} (Disposed: ${user.isDisposed} Expired: ${user.isExpired} Resource disposed: ${user.resource.isDisposed})`);
			userKeysToRemove.push(key);
			user._dispose(`invalid`, user.data);
		}
		for (const userKey of userKeysToRemove) {
			this._users.delete(userKey);
			changed = true;
		}
		if (changed) this.log.log(`End: resource len: ${this._resources.length} users: ${this.usersLength}`);
	}
	/**
	* Iterate over resources in the pool.
	* To iterate over the data associated with each resource, use
	* `values`.
	*/
	*resources() {
		const resource = [...this._resources];
		for (const r of resource) yield r;
	}
	/**
	* Iterate over resource values in the pool.
	* to iterate over the resources, use `resources`.
	*
	* Note that values may be returned even though there is no
	* active user.
	*/
	*values() {
		const resource = [...this._resources];
		for (const r of resource) yield r.data;
	}
	/**
	* Unassociate a key with a pool item
	* @param userKey
	*/
	release(userKey, reason) {
		const pi = this._users.get(userKey);
		if (!pi) return;
		pi.release(reason ?? `Pool.release`);
	}
	/**
	* @internal
	* @param user
	*/
	_release(user) {
		this._users.delete(user.key);
	}
	/**
	* @internal
	* @param resource
	* @param _
	*/
	_releaseResource(resource, _) {
		this._resources = this._resources.filter((v) => v !== resource);
	}
	/**
	* Returns true if `v` has an associted resource in the pool
	* @param resource
	* @returns
	*/
	hasResource(resource) {
		const found = this._resources.find((v) => v.data === resource);
		return found !== void 0;
	}
	/**
	* Returns true if a given `userKey` is in use.
	* @param userKey
	* @returns
	*/
	hasUser(userKey) {
		return this._users.has(userKey);
	}
	/**
	* @internal
	* @param key
	* @param resource
	* @returns
	*/
	_assign(key, resource) {
		const u = new PoolUser(key, resource);
		this._users.set(key, u);
		resource._assign(u);
		return u;
	}
	/**
	* Allocates a resource for `userKey`
	* @internal
	* @param userKey
	* @returns
	*/
	#allocateResource(userKey) {
		const sorted = this.getResourcesSortedByUse();
		if (sorted.length > 0 && sorted[0].hasUserCapacity) {
			const u = this._assign(userKey, sorted[0]);
			return u;
		}
		if (this.generateResource && (this.capacity < 0 || this._resources.length < this.capacity)) {
			this.log.log(`capacity: ${this.capacity} resources: ${this._resources.length}`);
			const resourceGenerated = this.addResource(this.generateResource());
			const u = this._assign(userKey, resourceGenerated);
			return u;
		}
	}
	/**
	* Return the number of users
	*/
	get usersLength() {
		return [...this._users.values()].length;
	}
	/**
	* 'Uses' a resource, returning the value
	* @param userKey
	* @returns
	*/
	useValue(userKey) {
		const resource = this.use(userKey);
		return resource.resource.data;
	}
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
	use(userKey) {
		const pi = this._users.get(userKey);
		if (pi) {
			pi.keepAlive();
			return pi;
		}
		this.maintain();
		const match = this.#allocateResource(userKey);
		if (match) return match;
		if (this.fullPolicy === `error`) throw new Error(`Pool is fully used (fullPolicy: ${this.fullPolicy}, capacity: ${this.capacity})`);
		if (this.fullPolicy === `evictOldestUser`) {
			const users = this.getUsersByLongestElapsed();
			if (users.length > 0) {
				this.release(users[0].key, `evictedOldestUser`);
				const match2 = this.#allocateResource(userKey);
				if (match2) return match2;
			}
		}
		throw new Error(`Pool is fully used (${this.fullPolicy})`);
	}
};
/**
* Creates an instance of a Pool
* @param options
* @returns
*/
const create = (options = {}) => new Pool(options);

//#endregion
//#region ../flow/src/promise-with-resolvers.ts
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
function promiseWithResolvers() {
	let resolve$1;
	let reject;
	const promise = new Promise((_resolve, _reject) => {
		resolve$1 = _resolve;
		reject = _reject;
	});
	return {
		promise,
		resolve: resolve$1,
		reject
	};
}

//#endregion
//#region ../flow/src/rate-minimum.ts
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
const rateMinimum$1 = (options) => {
	let disposed = false;
	const t = timeout(() => {
		if (disposed) return;
		t.start();
		options.whatToCall(options.fallback());
	}, options.interval);
	if (options.abort) options.abort.addEventListener(`abort`, (_) => {
		disposed = true;
		t.cancel();
	});
	t.start();
	return (args) => {
		if (disposed) throw new Error(`AbortSignal has been fired`);
		t.start();
		options.whatToCall(args);
	};
};

//#endregion
//#region ../flow/src/repeat.ts
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
async function* repeat(produce, opts) {
	const signal = opts.signal ?? void 0;
	const delayWhen = opts.delayWhen ?? `before`;
	const count = opts.count ?? void 0;
	const allowUndefined = opts.allowUndefined ?? false;
	const minIntervalMs = opts.delayMinimum ? intervalToMs(opts.delayMinimum) : void 0;
	const whileFunction = opts.while;
	let cancelled = false;
	let sleepMs = intervalToMs(opts.delay, intervalToMs(opts.delayMinimum, 0));
	let started = performance.now();
	const doDelay = async () => {
		const elapsed = performance.now() - started;
		if (typeof minIntervalMs !== `undefined`) sleepMs = Math.max(0, minIntervalMs - elapsed);
		if (sleepMs) await sleep({
			millis: sleepMs,
			signal
		});
		started = performance.now();
		if (signal?.aborted) throw new Error(`Signal aborted ${signal.reason}`);
	};
	if (Array.isArray(produce)) produce = produce.values();
	if (opts.onStart) opts.onStart();
	let errored = true;
	let loopedTimes = 0;
	try {
		while (!cancelled) {
			loopedTimes++;
			if (delayWhen === `before` || delayWhen === `both`) await doDelay();
			const result = await resolve(produce);
			if (typeof result === `undefined` && !allowUndefined) cancelled = true;
			else {
				yield result;
				if (delayWhen === `after` || delayWhen === `both`) await doDelay();
				if (count !== void 0 && loopedTimes >= count) cancelled = true;
			}
			if (whileFunction) {
				if (!whileFunction(loopedTimes)) cancelled = true;
			}
		}
		errored = false;
	} finally {
		cancelled = true;
		if (opts.onComplete) opts.onComplete(errored);
	}
}
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
function* repeatSync(produce, opts) {
	const signal = opts.signal ?? void 0;
	const count = opts.count ?? void 0;
	const allowUndefined = opts.allowUndefined ?? false;
	let cancelled = false;
	if (Array.isArray(produce)) produce = produce.values();
	if (opts.onStart) opts.onStart();
	let errored = true;
	let loopedTimes = 0;
	try {
		while (!cancelled) {
			loopedTimes++;
			const result = resolveSync(produce);
			if (typeof result === `undefined` && !allowUndefined) cancelled = true;
			else {
				yield result;
				if (count !== void 0 && loopedTimes >= count) cancelled = true;
				if (signal?.aborted) cancelled = true;
			}
		}
		errored = false;
	} finally {
		cancelled = true;
		if (opts.onComplete) opts.onComplete(errored);
	}
}
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

//#endregion
//#region ../flow/src/req-resp-match.ts
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
var RequestResponseMatch = class extends SimpleEventEmitter {
	timeoutMs;
	whenUnmatchedResponse;
	keyRequest;
	keyResponse;
	#outgoing = /* @__PURE__ */ new Map();
	#maintainLoop;
	constructor(options = {}) {
		super();
		if (typeof window === `undefined`) globalThis.window = {
			setTimeout,
			clearTimeout
		};
		this.timeoutMs = options.timeoutMs ?? 1e3;
		this.whenUnmatchedResponse = options.whenUnmatchedResponse ?? `throw`;
		this.#maintainLoop = continuously(() => this.#maintain(), this.timeoutMs * 2);
		if (options.key) {
			if (options.keyRequest) throw new Error(`Cannot set 'keyRequest' when 'key' is set `);
			if (options.keyResponse) throw new Error(`Cannot set 'keyResponse' when 'key' is set `);
			this.keyRequest = options.key;
			this.keyResponse = options.key;
		} else {
			if (!options.keyRequest || !options.keyResponse) throw new Error(`Expects 'keyRequest' & 'keyResponse' fields to be set if 'key' is not set`);
			this.keyRequest = options.keyRequest;
			this.keyResponse = options.keyResponse;
		}
	}
	#maintain() {
		const values = [...this.#outgoing.values()];
		const now = Date.now();
		for (const v of values) if (v.expiresAt <= now) {
			if (v.promiseReject) v.promiseReject(`Request timeout`);
			const callback = v.callback;
			if (callback) setTimeout(() => {
				callback(true, `Request timeout`);
			}, 1);
			this.fireEvent(`completed`, {
				request: v.req,
				response: `Request timeout`,
				success: false
			});
			this.#outgoing.delete(v.id);
		}
		this.debugDump();
		return this.#outgoing.size > 0;
	}
	debugDump() {
		const values = [...this.#outgoing.values()];
		const now = Date.now();
		for (const v of values) {
			const expire = now - v.expiresAt;
			console.log(`${v.id} Expires in: ${Math.floor(expire / 1e3).toString()}s`);
		}
	}
	/**
	* Makes a request.
	* If `callback` is set, it's equivalent to calling `requestCallback`.
	* If `callback` is not set, a promise is returned
	* @param request 
	* @param callback 
	* @returns 
	*/
	request(request, callback) {
		if (callback !== void 0) {
			this.#requestCallback(request, callback);
			return;
		}
		return this.#requestAwait(request);
	}
	/**
	* Make a request and don't wait for the outcome.
	* @param request 
	*/
	requestAndForget(request) {
		const id = this.keyRequest(request);
		if (this.#outgoing.has(id)) throw new Error(`Already a request pending with id '${id}'`);
		const r = {
			expiresAt: Date.now() + this.timeoutMs,
			id,
			req: request
		};
		this.#outgoing.set(id, r);
		this.#maintainLoop.start();
	}
	/**
	* Make a request, returning a Promise for the outcome.
	* Errors will throw an exception.
	* @param request 
	* @returns 
	*/
	#requestAwait(request) {
		const id = this.keyRequest(request);
		if (this.#outgoing.has(id)) throw new Error(`Already a request pending with id '${id}'`);
		const p = new Promise((resolve$1, reject) => {
			const r = {
				expiresAt: Date.now() + this.timeoutMs,
				id,
				req: request,
				promiseResolve: resolve$1,
				promiseReject: reject
			};
			this.#outgoing.set(id, r);
			this.#maintainLoop.start();
		});
		return p;
	}
	/**
	* Make a request, and get notified of outcome with a callback
	* @param request 
	* @param callback 
	*/
	#requestCallback(request, callback) {
		const id = this.keyRequest(request);
		if (this.#outgoing.has(id)) throw new Error(`Already a request pending with id '${id}'`);
		const r = {
			expiresAt: Date.now() + this.timeoutMs,
			id,
			req: request,
			callback
		};
		this.#outgoing.set(id, r);
		this.#maintainLoop.start();
	}
	/**
	* Response has been received
	* @param response Response
	* @returns _True_ if response matched a request 
	*/
	response(response, keepAlive) {
		const id = this.keyResponse(response);
		const request = this.#outgoing.get(id);
		if (!request) {
			if (this.whenUnmatchedResponse === `throw`) throw new Error(`Unmatched response with id: '${id}'`, { cause: response });
			return false;
		}
		if (keepAlive) request.expiresAt = Date.now() + this.timeoutMs;
		else this.#outgoing.delete(id);
		if (request.promiseResolve) request.promiseResolve(response);
		if (request.callback) request.callback(false, response);
		this.fireEvent(`match`, {
			request: request.req,
			response
		});
		if (!keepAlive) this.fireEvent(`completed`, {
			request: request.req,
			response,
			success: true
		});
		return true;
	}
};

//#endregion
//#region ../flow/src/retry.ts
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
function* backoffGenerator(options = {}) {
	const startAt = options.startAt ?? 1;
	let limitAttempts = options.limitAttempts ?? Number.MAX_SAFE_INTEGER;
	const limitValue = options.limitValue;
	const power = options.power ?? 1.1;
	let value = startAt;
	resultThrow(integerTest(limitAttempts, `aboveZero`, `limitAttempts`), numberTest(startAt, ``, `startAt`), numberTest(limitAttempts, ``, `limitAttempts`), () => limitValue !== void 0 ? numberTest(limitValue, ``, `limitValue`) : void 0, numberTest(power, ``, `power`));
	while (limitAttempts > 0) {
		if (limitValue && value >= limitValue) return;
		limitAttempts--;
		yield value;
		value += Math.pow(value, power);
	}
}
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
const retryFunction = (callback, options = {}) => {
	const task = { async probe() {
		try {
			const v = await callback();
			if (v === void 0) return {
				value: options.taskValueFallback,
				error: `Fallback`,
				success: false
			};
			return {
				value: v,
				success: true
			};
		} catch (error) {
			return {
				success: false,
				error
			};
		}
	} };
	return retryTask(task, options);
};
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
const retryTask = async (task, opts = {}) => {
	const signal = opts.abort;
	const log = resolveLogOption(opts.log);
	const predelayMs = opts.predelayMs ?? 0;
	const startedAt = elapsedSince();
	let attempts = 0;
	const initialValue = opts.startAt ?? 1e3;
	const limitAttempts = opts.limitAttempts ?? Number.MAX_SAFE_INTEGER;
	const backoffGen = backoffGenerator({
		...opts,
		startAt: initialValue,
		limitAttempts
	});
	if (initialValue <= 0) throw new Error(`Param 'initialValue' must be above zero`);
	if (predelayMs > 0) try {
		await sleep({
			millis: predelayMs,
			signal
		});
	} catch (error) {
		return {
			success: false,
			attempts,
			value: opts.taskValueFallback,
			elapsed: startedAt(),
			message: getErrorMessage(error)
		};
	}
	for (const t of backoffGen) {
		attempts++;
		const result = await task.probe(attempts);
		if (result.success) return {
			success: result.success,
			value: result.value,
			attempts,
			elapsed: startedAt()
		};
		log({ msg: `retry attempts: ${attempts.toString()} t: ${elapsedToHumanString(t)}` });
		if (attempts >= limitAttempts) break;
		try {
			await sleep({
				millis: t,
				signal
			});
		} catch (error) {
			return {
				success: false,
				attempts,
				value: opts.taskValueFallback,
				message: getErrorMessage(error),
				elapsed: startedAt()
			};
		}
	}
	return {
		message: `Giving up after ${attempts.toString()} attempts.`,
		success: false,
		attempts,
		value: opts.taskValueFallback,
		elapsed: startedAt()
	};
};

//#endregion
//#region ../flow/src/run-once.ts
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
const runOnce = (onRun) => {
	let run$1 = false;
	let success = false;
	return () => {
		if (run$1) return success;
		run$1 = true;
		success = onRun();
		return success;
	};
};

//#endregion
//#region ../flow/src/sync-wait.ts
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
var SyncWait = class {
	#resolve;
	#reject;
	#promise;
	signal() {
		if (this.#resolve) {
			this.#resolve();
			this.#resolve = void 0;
		}
		this.#promise = Promise.resolve();
	}
	/**
	* Throw away any previous signalled state.
	* This will cause any currently waiters to throw
	*/
	flush() {
		if (this.#reject) {
			this.#reject(`Flushed`);
			this.#reject = void 0;
		}
		this.#resolve = void 0;
		this.#promise = void 0;
	}
	#initPromise() {
		const p = new Promise((resolve$1, reject) => {
			this.#resolve = resolve$1;
			this.#reject = reject;
		});
		this.#promise = p;
		return p;
	}
	/**
	* Call with `await` to wait until .signal() happens.
	* If a wait period is specified, an exception is thrown if signal does not happen within this time.
	* @param maximumWaitMs 
	*/
	async forSignal(maximumWaitMs) {
		let p = this.#promise;
		p ??= this.#initPromise();
		if (maximumWaitMs) {
			const reject = this.#reject;
			setTimeout(() => {
				if (reject) reject(`Timeout elapsed ${maximumWaitMs.toString()}`);
			}, maximumWaitMs);
		}
		await p;
		this.#promise = void 0;
		this.#resolve = void 0;
		this.#reject = void 0;
	}
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
	async didSignal(maximumWaitMs) {
		try {
			await this.forSignal(maximumWaitMs);
			return true;
		} catch {
			return false;
		}
	}
};

//#endregion
//#region ../flow/src/task-queue-mutable.ts
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
var TaskQueueMutable = class TaskQueueMutable extends SimpleEventEmitter {
	static shared = new TaskQueueMutable();
	_loop;
	_queue;
	constructor() {
		super();
		this._queue = mutable();
		this._loop = continuously(() => {
			return this.processQueue();
		}, 100);
	}
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
	enqueue(task) {
		const length = this._queue.enqueue(task);
		if (this._loop.runState === `idle`) {
			this.fireEvent(`started`, {});
			this._loop.start();
		}
		return length;
	}
	dequeue() {
		return this._queue.dequeue();
	}
	async processQueue() {
		const task = this._queue.dequeue();
		if (task === void 0) {
			this.fireEvent(`empty`, {});
			return false;
		}
		try {
			await task();
		} catch (error) {
			console.error(error);
		}
	}
	/**
	* Clears all tasks, and stops any scheduled processing.
	* Currently running tasks will continue.
	* @returns 
	*/
	clear() {
		if (this._queue.length === 0) return;
		this._queue.clear();
		this._loop.cancel();
		this.fireEvent(`empty`, {});
	}
	/**
	* Returns true if queue is empty
	*/
	get isEmpty() {
		return this._queue.isEmpty;
	}
	/**
	* Number of items in queue
	*/
	get length() {
		return this._queue.length;
	}
};

//#endregion
//#region ../flow/src/throttle.ts
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
const throttle = (callback, intervalMinMs) => {
	let trigger = 0;
	return async (...args) => {
		const elapsed = performance.now() - trigger;
		if (elapsed >= intervalMinMs) {
			const r = callback(elapsed, ...args);
			if (typeof r === `object`) await r;
			trigger = performance.now();
		}
	};
};

//#endregion
//#region ../flow/src/timer.ts
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
function hasElapsed(elapsed) {
	const t = relative(intervalToMs(elapsed, 0), {
		timer: elapsedMillisecondsAbsolute(),
		clampValue: true
	});
	return () => t.isDone;
}
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
function ofTotal(duration, opts = {}) {
	const totalMs = intervalToMs(duration);
	if (!totalMs) throw new Error(`Param 'duration' not valid`);
	const timerOpts = {
		...opts,
		timer: elapsedMillisecondsAbsolute()
	};
	let t;
	return () => {
		t ??= relative(totalMs, timerOpts);
		return t.elapsed;
	};
}
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
function ofTotalTicks(totalTicks, opts = {}) {
	const timerOpts = {
		...opts,
		timer: elapsedTicksAbsolute()
	};
	let t;
	return () => {
		t ??= relative(totalTicks, timerOpts);
		return t.elapsed;
	};
}
/**
* Returns a {@link ModulationTimer} that is always at 100%.
* Opposite: {@link timerNeverDone}.
* @returns 
*/
const timerAlwaysDone = () => ({
	elapsed: 1,
	isDone: true,
	reset() {},
	mod(amt) {}
});
/**
* Returns a {@link ModulationTimer} that is always at 0%.
* Opposite: {@link timerAlwaysDone}.
* @returns 
*/
const timerNeverDone = () => ({
	elapsed: 0,
	isDone: false,
	reset() {},
	mod() {}
});
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
const relative = (total, options = {}) => {
	if (!Number.isFinite(total)) return timerAlwaysDone();
	else if (Number.isNaN(total)) return timerNeverDone();
	const clampValue = options.clampValue ?? false;
	const wrapValue = options.wrapValue ?? false;
	if (clampValue && wrapValue) throw new Error(`clampValue and wrapValue cannot both be enabled`);
	let modulationAmount = 1;
	const timer = options.timer ?? elapsedMillisecondsAbsolute();
	let lastValue = 0;
	const computeElapsed = (value) => {
		lastValue = value;
		let v = value / (total * modulationAmount);
		if (clampValue) v = clamp(v);
		else if (wrapValue && v >= 1) v = v % 1;
		return v;
	};
	return {
		mod(amt) {
			modulationAmount = amt;
		},
		get isDone() {
			return computeElapsed(lastValue) >= 1;
		},
		get elapsed() {
			return computeElapsed(timer.elapsed);
		},
		reset: () => {
			timer.reset();
		}
	};
};
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
const frequencyTimer = (frequency, options = {}) => {
	const timer = options.timer ?? elapsedMillisecondsAbsolute();
	const cyclesPerSecond = frequency / 1e3;
	let modulationAmount = 1;
	const computeElapsed = () => {
		const v = timer.elapsed * (cyclesPerSecond * modulationAmount);
		const f = v - Math.floor(v);
		if (f < 0) throw new Error(`Unexpected cycle fraction less than 0. Elapsed: ${v} f: ${f}`);
		if (f > 1) throw new Error(`Unexpected cycle fraction more than 1. Elapsed: ${v} f: ${f}`);
		return f;
	};
	return {
		mod: (amt) => {
			modulationAmount = amt;
		},
		reset: () => {
			timer.reset();
		},
		get isDone() {
			return computeElapsed() >= 1;
		},
		get elapsed() {
			return computeElapsed();
		}
	};
};
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
const elapsedMillisecondsAbsolute = () => {
	let start = performance.now();
	return {
		reset: () => {
			start = performance.now();
		},
		get elapsed() {
			return performance.now() - start;
		}
	};
};
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
const elapsedTicksAbsolute = () => {
	let start = 0;
	return {
		reset: () => {
			start = 0;
		},
		get peek() {
			return start;
		},
		get elapsed() {
			return ++start;
		}
	};
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
const timerWithFunction = (fn, timer) => {
	if (typeof fn !== `function`) throw new Error(`Param 'fn' should be a function. Got: ${typeof fn}`);
	let startCount = 1;
	return {
		get elapsed() {
			return timer.elapsed;
		},
		get isDone() {
			return timer.isDone;
		},
		get runState() {
			if (timer.isDone) return `idle`;
			return `scheduled`;
		},
		get startCount() {
			return startCount;
		},
		get startCountTotal() {
			return startCount;
		},
		compute: () => {
			const elapsed = timer.elapsed;
			return fn(elapsed);
		},
		reset: () => {
			timer.reset();
			startCount++;
		}
	};
};

//#endregion
//#region ../flow/src/update-outdated.ts
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
const updateOutdated = (fn, interval, updateFail = `slow`) => {
	let lastRun = 0;
	let lastValue;
	let intervalMsCurrent = intervalToMs(interval, 1e3);
	return () => new Promise(async (resolve$1, reject) => {
		const elapsed = performance.now() - lastRun;
		if (lastValue === void 0 || elapsed > intervalMsCurrent) try {
			lastRun = performance.now();
			lastValue = await fn(elapsed);
			intervalMsCurrent = intervalToMs(interval, 1e3);
		} catch (error) {
			if (updateFail === `fast`) {
				lastValue = void 0;
				lastRun = 0;
			} else if (updateFail === `backoff`) intervalMsCurrent = Math.floor(intervalMsCurrent * 1.2);
			reject(error);
			return;
		}
		resolve$1(lastValue);
	});
};

//#endregion
//#region ../flow/src/wait-for-value.ts
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
var WaitForValue = class {
	#promise;
	#resolve;
	#written = false;
	constructor() {
		const { promise, resolve: resolve$1 } = promiseWithResolvers();
		this.#promise = promise;
		this.#resolve = resolve$1;
	}
	/**
	* Gets the promise
	* ```js
	* const wv = new WaitForValue();
	* 
	* await wv.get();
	* ```
	* @returns
	*/
	get() {
		return this.#promise;
	}
	/**
	* Adds a value, triggering promise resolution.
	* 
	* Throws an exception if queue has already been used. Use {@link isUsed} to check.
	* @param value 
	*/
	add(value) {
		if (this.#written) throw new Error(`QueueSingleUse has already been used`);
		this.#written = true;
		this.#resolve(value);
	}
	/**
	* Returns _true_ if a value has been added
	* and therefore no more values can be written
	*/
	get isUsed() {
		return this.#written;
	}
};
/**
* {@inheritDoc WaitForValue}
*/
const singleItem = () => new WaitForValue();

//#endregion
//#region ../flow/src/wait-for.ts
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
const waitFor = (timeoutMs, onAborted, onComplete) => {
	let t;
	let success = false;
	const done = (error) => {
		if (t !== void 0) {
			window.clearTimeout(t);
			t = void 0;
		}
		if (error) onAborted(error);
		else success = true;
		if (onComplete !== void 0) onComplete(success);
	};
	t = globalThis.setTimeout(() => {
		t = void 0;
		try {
			onAborted(`Timeout after ${timeoutMs}ms`);
		} finally {
			if (onComplete !== void 0) onComplete(success);
		}
	}, timeoutMs);
	return done;
};

//#endregion
//#region ../flow/src/state-machine/state-machine.ts
/**
* Clones machine state
* @param toClone
* @returns Cloned of `toClone`
*/
const cloneState = (toClone) => {
	return Object.freeze({
		value: toClone.value,
		visited: [...toClone.visited],
		machine: toClone.machine
	});
};
/**
* Initialises a state machine. [Read more in the ixfx Guide](https://ixfx.fun/flow/state-machine/overview/)
* 
* ```js
* const desc = {
*  pants: ['shoes','socks'],
*  socks: ['shoes', 'pants'],
*  shoes: 'shirt',
*  shirt: null
* }
* 
* // Defaults to first key, 'pants'
* let sm = StateMachine.init(descr);
* 
* // Move to 'shoes' state
* sm = StateMachine.to(sm, 'shoes');
* sm.state; // 'shoes'
* sm.visited; // [ 'pants' ]
* 
* StateMachine.isDone(sm); // false
* StateMachine.possible(sm); // [ 'shirt' ]
* ```
* @param stateMachine Settings for state machine
* @param initialState Initial state name
* @returns
*/
const init = (stateMachine, initialState) => {
	const [machine, machineValidationError] = validateMachine(stateMachine);
	if (!machine) throw new Error(machineValidationError);
	const state = initialState ?? Object.keys(machine.states)[0];
	if (typeof machine.states[state] === `undefined`) throw new TypeError(`Initial state ('${state}') not found`);
	const transitions = validateAndNormaliseTransitions(machine.states);
	if (transitions === void 0) throw new Error(`Could not normalise transitions`);
	return Object.freeze({
		value: state,
		visited: [],
		machine: Object.freeze(Object.fromEntries(transitions))
	});
};
const reset = (sm) => {
	return init(sm.machine);
};
const validateMachine = (smOrTransitions) => {
	if (typeof smOrTransitions === `undefined`) return [void 0, `Parameter undefined`];
	if (smOrTransitions === null) return [void 0, `Parameter null`];
	if (`states` in smOrTransitions) return [smOrTransitions, ``];
	if (typeof smOrTransitions === `object`) return [{ states: smOrTransitions }, ``];
	return [void 0, `Unexpected type: ${typeof smOrTransitions}. Expected object`];
};
/**
* Returns _true_ if MachineState `sm` is in its final state.
* @param sm
* @returns
*/
const isDone = (sm) => {
	return possible(sm).length === 0;
};
/**
* Returns a list of possible state targets for `sm`, or
* an empty list if no transitions are possible.
* @param sm
* @returns
*/
const possibleTargets = (sm) => {
	validateMachineState(sm);
	const fromS = sm.machine[sm.value];
	if (fromS.length === 1 && fromS[0].state === null) return [];
	return fromS;
};
/**
* Returns a list of possible state names for `sm`, or
* an empty list if no transitions are possible.
*
* @param sm
* @returns
*/
const possible = (sm) => {
	const targets = possibleTargets(sm);
	return targets.map((v) => v.state);
};
const normaliseTargets = (targets) => {
	const normaliseSingleTarget = (target) => {
		if (target === null) return { state: null };
		if (typeof target === `string`) return { state: target };
		else if (typeof target === `object` && `state` in target) {
			const targetState = target.state;
			if (typeof targetState !== `string`) throw new TypeError(`Target 'state' field is not a string. Got: ${typeof targetState}`);
			if (`preconditions` in target) return {
				state: targetState,
				preconditions: target.preconditions
			};
			return { state: targetState };
		} else throw new Error(`Unexpected type: ${typeof target}. Expected string or object with 'state' field.`);
	};
	if (Array.isArray(targets)) {
		let containsNull = false;
		const mapResults = targets.map((t) => {
			const r = normaliseSingleTarget(t);
			if (!r) throw new Error(`Invalid target`);
			containsNull = containsNull || r.state === null;
			return r;
		});
		if (containsNull && mapResults.length > 1) throw new Error(`Cannot have null as an possible state`);
		return mapResults;
	} else {
		const target = normaliseSingleTarget(targets);
		if (!target) return;
		return [target];
	}
};
const validateAndNormaliseTransitions = (d) => {
	const returnMap = /* @__PURE__ */ new Map();
	for (const [topLevelState, topLevelTargets] of Object.entries(d)) {
		if (typeof topLevelState === `undefined`) throw new TypeError(`Top-level undefined state`);
		if (typeof topLevelTargets === `undefined`) throw new TypeError(`Undefined target state for ${topLevelState}`);
		if (returnMap.has(topLevelState)) throw new Error(`State defined twice: ${topLevelState}`);
		if (topLevelState.includes(` `)) throw new Error(`State names cannot contain spaces`);
		returnMap.set(topLevelState, []);
	}
	for (const [topLevelState, topLevelTargets] of Object.entries(d)) {
		const targets = normaliseTargets(topLevelTargets);
		if (targets === void 0) throw new Error(`Could not normalise target`);
		if (targets !== null) {
			const seenStates = /* @__PURE__ */ new Set();
			for (const target of targets) {
				if (seenStates.has(target.state)) throw new Error(`Target state '${target.state}' already exists for '${topLevelState}'`);
				seenStates.add(target.state);
				if (target.state === null) continue;
				if (!returnMap.has(target.state)) throw new Error(`Target state '${target.state}' is not defined as a top-level state. Defined under: '${topLevelState}'`);
			}
			returnMap.set(topLevelState, targets);
		}
	}
	return returnMap;
};
/**
* Validates machine state, throwing an exception if not valid
* and returning `StateTargetStrict`
* @param state
* @returns
*/
const validateMachineState = (state) => {
	if (typeof state === `undefined`) throw new TypeError(`Param 'state' is undefined`);
	if (typeof state.value !== `string`) throw new TypeError(`Existing state is not a string`);
};
/**
* Attempts to transition to a new state. Either a new
* `MachineState` is returned reflecting the change, or
* an exception is thrown.
* 
* @example Attempts to transition to 'name-of-state'
* ```js
* const newState = StateMachine.to(currentState, `name-of-state`);
* ```
* 
* Note that 'currentState' is not changed.
* @param sm
* @param toState
* @returns
*/
const to = (sm, toState) => {
	validateMachineState(sm);
	validateTransition(sm, toState);
	return Object.freeze({
		value: toState,
		machine: sm.machine,
		visited: unique([sm.visited, [sm.value]])
	});
};
const next = (sm) => {
	const first = possibleTargets(sm).at(0);
	if (!first || first.state === null) throw new Error(`Not possible to move to a next state from '${sm.value}`);
	return to(sm, first.state);
};
/**
* Returns _true_ if `toState` is a valid transition from current state of `sm`
* @param sm
* @param toState
* @returns
*/
const isValidTransition = (sm, toState) => {
	try {
		validateTransition(sm, toState);
		return true;
	} catch {
		return false;
	}
};
const validateTransition = (sm, toState) => {
	if (toState === null) throw new Error(`Cannot transition to null state`);
	if (typeof toState === `undefined`) throw new Error(`Cannot transition to undefined state`);
	if (typeof toState !== `string`) throw new TypeError(`Parameter 'toState' should be a string. Got: ${typeof toState}`);
	const p = possible(sm);
	if (p.length === 0) throw new Error(`Machine is in terminal state`);
	if (!p.includes(toState)) throw new Error(`Target state '${toState}' not available at current state '${sm.value}'. Possible states: ${p.join(`, `)}`);
};
/**
* Returns state transitions based on a list of strings.
* The last string is the terminal state.
*  A -> B -> C -> D
* 
* See also: {@link fromListBidirectional}
*
* ```js
* const transitions = fromList([`a`, `b`, `c`, `d`]);
* // Object state machine with events
* const sm = new StateMachine.WithEvents(transitions);
* // OR, immutable state machine
* const sm = StateMachine.init(transitions);
* ```
* @param states List of states
* @return MachineDescription
*/
const fromList = (...states) => {
	const t = {};
	if (!Array.isArray(states)) throw new Error(`Expected array of strings`);
	if (states.length <= 2) throw new Error(`Expects at least two states`);
	for (let index = 0; index < states.length; index++) {
		const s = states[index];
		if (typeof s !== `string`) throw new TypeError(`Expected array of strings. Got type '${typeof s}' at index ${index.toString()}`);
		t[s] = index === states.length - 1 ? null : states[index + 1];
	}
	return t;
};
/**
* Returns a machine description based on a list of strings. Machine
* can go back and forth between states:
*  A <-> B <-> C <-> D
* 
* See also {@link fromList}.
* 
* ```js
* const transitions = fromListBidirectional([`a`, `b`, `c`, `d`]);
* // Object state machine with events
* const sm = new StateMachine.WithEvents(transitions);
* // OR, immutable state machine
* const sm = StateMachine.init(transitions);
* ```
* @param states
* @returns
*/
const fromListBidirectional = (...states) => {
	const t = {};
	if (!Array.isArray(states)) throw new Error(`Expected array of strings`);
	if (states.length < 2) throw new Error(`Expects at least two states`);
	for (const [index, s] of states.entries()) {
		if (typeof s !== `string`) throw new TypeError(`Expected array of strings. Got type '${typeof s}' at index ${index.toString()}`);
		t[s] = [];
	}
	for (let index = 0; index < states.length; index++) {
		const v = t[states[index]];
		if (index === states.length - 1) if (states.length > 1) v.push(states[index - 1]);
		else t[states[index]] = null;
		else {
			v.push(states[index + 1]);
			if (index > 0) v.push(states[index - 1]);
		}
	}
	return t;
};

//#endregion
//#region ../flow/src/state-machine/driver.ts
/**
* Drives a state machine.
*
* [Read more on the ixfx Guide](https://ixfx.fun/flow/state-machine/driver/)
* 
* Uses a 'handlers' structure to determine when to change
* state and actions to take.
* 
* The structure is a set of logical conditions: if we're in
* this state, then move to this other state etc.
* 
* ```js
* const handlers = [
*  {
*    // If we're in the 'sleeping' state, move to next state
*    if: 'sleeping',
*    then: { next: true }
*  },
*  {
*    // If we're in the 'waking' state, randomly either go to 'resting' or 'sleeping' state
*    if: 'waking',
*    then: [
*      () => {
*        if (Math.random() > 0.5) {
*          return { next: 'resting' }
*        } else {
*          return { next: 'sleeping' }
*        }
*      }
*    ]
*   }
* ];
* ```
* 
* Set up the driver, and call `run()` when you want to get
* the machine to change state or take action:
* 
* ```js
* const driver = await StateMachine.driver(states, handlers);
* setInterval(async () => {
*  await driver.run(); // Note use of 'await' again
* }, 1000);
* ```
* 
* Essentially, the 'handlers' structure gets run through each time `run()`
* is called.
* 
* Defaults to selecting the highest-ranked result to determine
* what to do next.
* @param machine
* @param handlersOrOpts
* @returns
*/
async function driver(machine, handlersOrOpts) {
	const opts = Array.isArray(handlersOrOpts) ? { handlers: handlersOrOpts } : handlersOrOpts;
	const debug = resolveLogOption(opts.debug, { category: `StateMachineDriver` });
	const byState = /* @__PURE__ */ new Map();
	for (const h of opts.handlers) {
		const ifBlock = Array.isArray(h.if) ? h.if : [h.if];
		for (const state of ifBlock) {
			if (typeof state !== `string`) throw new TypeError(`Expected single or array of strings for the 'if' field. Got: '${typeof state}'.`);
			if (byState.has(state)) throw new Error(`Multiple handlers defined for state '${state}'. There should be at most one.`);
			byState.set(state, h);
		}
	}
	const runOpts = {
		rank: (a, b) => {
			return defaultComparer(a.score ?? 0, b.score ?? 0);
		},
		shuffle: opts.shuffleHandlers ?? false
	};
	let sm = init(machine);
	for (const [ifState] of byState) if (typeof sm.machine[ifState] === `undefined` && ifState !== `__fallback`) throw new Error(`StateMachineDriver handler references a state ('${ifState}') which is not defined on the machine. Therefore this handler will never run.'`);
	const run$1 = async () => {
		debug(`Run. State: ${sm.value}`);
		const state = sm.value;
		let handler = byState.get(state);
		if (handler === void 0) {
			debug(`  No handler for state '${state}', trying __fallback`);
			handler = byState.get(`__fallback`);
		}
		if (handler === void 0) {
			debug(`  No __fallback handler`);
			return;
		}
		const runOptionsForHandler = handler.resultChoice === `first` ? {
			...runOpts,
			stop: (latest) => {
				if (!latest) return false;
				if (`reset` in latest) return true;
				if (`next` in latest && latest.next !== void 0) return true;
				return false;
			}
		} : runOpts;
		const results = await run(handler.then, runOptionsForHandler, sm);
		debug(`  In state '${sm.value}' results: ${results.length}. Choice: ${handler.resultChoice}`);
		let r;
		switch (handler.resultChoice ?? `highest`) {
			case `highest`: {
				r = results.at(-1);
				break;
			}
			case `first`: {
				r = results[0];
				break;
			}
			case `lowest`: {
				r = results.at(0);
				break;
			}
			case `random`: {
				r = randomElement(results);
				break;
			}
			default: throw new Error(`Unknown 'resultChoice' option: ${handler.resultChoice}. Expected highest, first, lowest or random`);
		}
		debug(`  Chosen result: ${JSON.stringify(r)}`);
		if (r?.reset) sm = reset(sm);
		else if (r && r.next) if (typeof r.next === `boolean`) sm = next(sm);
		else {
			debug(JSON.stringify(results));
			sm = to(sm, r.next);
		}
		return sm;
	};
	return {
		reset: () => {
			sm = reset(sm);
		},
		getValue: () => sm.value,
		run: run$1,
		to: (state) => {
			sm = to(sm, state);
			return sm;
		}
	};
}

//#endregion
//#region ../flow/src/state-machine/with-events.ts
/**
* A state machine that fires events when state changes.
* 
* ```js
* const transitions = StateMachine.fromList(`a`, `b`, `c`);
* const m = new StateMachineWithEvents(transitions);
* m.addEventListener(`change`, event => {
*  console.log(`${event.priorState} -> ${event.newState}`);
* });
* m.addEventListener(`stop`, event => {
*  console.log(`State machine has reached final state`);
* });
* ```
*/
var StateMachineWithEvents = class extends SimpleEventEmitter {
	#sm;
	#smInitial;
	#debug;
	#isDoneNeedsFiring = false;
	#isDone = false;
	#changedAt = elapsedInfinity();
	/**
	* Create a state machine with initial state, description and options
	* @param m Machine description
	* @param opts Options for machine (defaults to `{debug:false}`)
	*/
	constructor(m, opts = {}) {
		super();
		this.#debug = opts.debug ?? false;
		this.#sm = init(m, opts.initial);
		this.#smInitial = cloneState(this.#sm);
	}
	#setIsDone(v) {
		if (this.#isDone === v) return;
		this.#isDone = v;
		if (v) {
			this.#isDoneNeedsFiring = true;
			setTimeout(() => {
				if (!this.#isDoneNeedsFiring) return;
				this.#isDoneNeedsFiring = false;
				this.fireEvent(`stop`, { state: this.#sm.value });
			}, 2);
		} else this.#isDoneNeedsFiring = false;
	}
	/**
	* Return a list of possible states from current state.
	*
	* If list is empty, no states are possible. Otherwise lists
	* possible states, including 'null' for terminal
	*/
	get statesPossible() {
		return possible(this.#sm);
	}
	/**
	* Return a list of all defined states
	*/
	get statesDefined() {
		return Object.keys(this.#sm.machine);
	}
	/**
	* Moves to the next state if possible. If multiple states are possible, it will use the first.
	* If machine is finalised, no error is thrown and null is returned.
	*
	* @returns {(string|null)} Returns new state, or null if machine is finalised
	*/
	next() {
		const p = possible(this.#sm);
		if (p.length === 0) return null;
		this.state = p[0];
		return p[0];
	}
	/**
	* Returns _true_ if state machine is in its final state
	*
	* @returns
	*/
	get isDone() {
		return isDone(this.#sm);
	}
	/**
	* Resets machine to initial state
	*/
	reset() {
		this.#setIsDone(false);
		this.#sm = cloneState(this.#smInitial);
		this.#changedAt = elapsedSince();
	}
	/**
	* Throws if it's not valid to transition to `newState`
	* @param newState
	* @returns
	*/
	validateTransition(newState) {
		validateTransition(this.#sm, newState);
	}
	/**
	* Returns _true_ if `newState` is valid transition from current state.
	* Use {@link validateTransition} if you want an explanation for the _false_ results.
	* @param newState
	* @returns
	*/
	isValid(newState) {
		return isValidTransition(this.#sm, newState);
	}
	/**
	* Gets or sets state. Throws an error if an invalid transition is attempted.
	* Use `isValid()` to check validity without changing.
	*
	* If `newState` is the same as current state, the request is ignored silently.
	*/
	set state(newState) {
		const priorState = this.#sm.value;
		if (newState === this.#sm.value) return;
		this.#sm = to(this.#sm, newState);
		if (this.#debug) console.log(`StateMachine: ${priorState} -> ${newState}`);
		this.#changedAt = elapsedSince();
		setTimeout(() => {
			this.fireEvent(`change`, {
				newState,
				priorState
			});
		}, 1);
		if (isDone(this.#sm)) this.#setIsDone(true);
	}
	get state() {
		return this.#sm.value;
	}
	/**
	* Returns timestamp when state was last changed.
	* See also `elapsed`
	*/
	get changedAt() {
		return this.#changedAt();
	}
	/**
	* Returns milliseconds elapsed since last state change.
	* See also `changedAt`
	*/
	get elapsed() {
		return this.#changedAt();
	}
};

//#endregion
//#region ../flow/src/state-machine/index.ts
var state_machine_exports = {};
__export(state_machine_exports, {
	StateMachineWithEvents: () => StateMachineWithEvents,
	cloneState: () => cloneState,
	driver: () => driver,
	fromList: () => fromList,
	fromListBidirectional: () => fromListBidirectional,
	init: () => init,
	isDone: () => isDone,
	isValidTransition: () => isValidTransition,
	next: () => next,
	normaliseTargets: () => normaliseTargets,
	possible: () => possible,
	possibleTargets: () => possibleTargets,
	reset: () => reset,
	to: () => to,
	validateMachine: () => validateMachine,
	validateTransition: () => validateTransition
});

//#endregion
export { DispatchList, Pool, PoolUser, RequestResponseMatch, Resource, state_machine_exports as StateMachine, SyncWait, TaskQueueMutable, WaitForValue, backoffGenerator, continuously, create, debounce, delay, delayLoop, elapsedMillisecondsAbsolute, elapsedTicksAbsolute, eventRace, everyNth, frequencyTimer, hasElapsed, iterateBreadth, iterateDepth, movingAverageTimed, ofTotal, ofTotalTicks, promiseWithResolvers, rateMinimum$1 as rateMinimum, relative, repeat, repeatSync, retryFunction, retryTask, run, runOnce, runSingle, singleItem, sleep, throttle, timeout, timerAlwaysDone, timerNeverDone, timerWithFunction, updateOutdated, waitFor };
//# sourceMappingURL=flow.js.map