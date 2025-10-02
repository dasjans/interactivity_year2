import "./src-BBD50Kth.js";
import "./is-primitive-eBwrK4Yg.js";
import "./interval-type-DajslxUJ.js";
import { getOrGenerate } from "./basic-D0XoOdBJ.js";
import { SimpleEventEmitter } from "./src-CkygQtXo.js";
import { keyValueSorter } from "./key-value-JSby0EXT.js";
import "./resolve-core-CZPH91No.js";
import { maxFast, minFast, numberArrayCompute, totalFast } from "./src-2eX6lIN8.js";
import { timeout } from "./src-BnNr7xTX.js";

//#region ../trackers/src/changes.ts
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
function handleChangeResult(monitor, onChanged, onNotChanged) {
	return (v) => {
		const r = monitor(v);
		if (r.changed) onChanged(v, r.changes, r.total);
		else if (typeof onNotChanged !== `undefined`) onNotChanged(v, r.identicalRun, r.total);
	};
}
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
function trackNumberChange(options = {}) {
	const nanHandling = options.nanHandling ?? `error`;
	const includeFirstValueInCount = options.includeFirstValueInCount ?? false;
	let lastValue = options.initial;
	let changes = 0;
	let total = 0;
	let identicalRun = 0;
	return (v) => {
		if (typeof v !== `number`) throw new TypeError(`Parameter should be number. Got type: ${typeof v}`);
		if (Number.isNaN(v)) switch (nanHandling) {
			case `error`: throw new Error(`Parameter is NaN`);
			case `skip`: return {
				changed: false,
				changes,
				total,
				identicalRun
			};
		}
		total++;
		let eq = lastValue === v;
		if (Number.isNaN(lastValue) && Number.isNaN(v)) eq = true;
		if (!eq) {
			identicalRun = 0;
			if (lastValue !== void 0 || includeFirstValueInCount) changes++;
			lastValue = v;
			return {
				changed: true,
				changes,
				total,
				identicalRun
			};
		} else identicalRun++;
		return {
			changed: false,
			changes,
			total,
			identicalRun
		};
	};
}
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
function trackBooleanChange(options = {}) {
	const includeFirstValueInCount = options.includeFirstValueInCount ?? false;
	let lastValue = options.initial;
	let changes = 0;
	let total = 0;
	let identicalRun = 0;
	return (v) => {
		if (typeof v !== `boolean`) throw new TypeError(`Parameter should be boolean. Got type: ${typeof v}`);
		total++;
		if (lastValue !== v) {
			identicalRun = 0;
			if (lastValue !== void 0 || includeFirstValueInCount) changes++;
			lastValue = v;
			return {
				changed: true,
				changes,
				total,
				identicalRun
			};
		} else identicalRun++;
		return {
			changed: false,
			changes,
			total,
			identicalRun
		};
	};
}

//#endregion
//#region ../trackers/src/frequency-mutable.ts
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
var FrequencyTracker = class extends SimpleEventEmitter {
	#store;
	#keyString;
	/**
	* Constructor
	* @param keyString Function to key items. Uses JSON.stringify by default
	*/
	constructor(keyString) {
		super();
		this.#store = /* @__PURE__ */ new Map();
		if (typeof keyString === `undefined`) keyString = (a) => {
			if (a === void 0) throw new Error(`Cannot create key for undefined`);
			return typeof a === `string` ? a : JSON.stringify(a);
		};
		this.#keyString = keyString;
	}
	/**
	* Clear data. Fires `change` event
	*/
	clear() {
		this.#store.clear();
		this.fireEvent(`change`, { context: this });
	}
	/**
	* @returns Iterator over keys (ie. groups)
	*/
	keys() {
		return this.#store.keys();
	}
	/**
	* @returns Iterator over frequency counts
	*/
	values() {
		return this.#store.values();
	}
	/**
	* @returns Copy of entries as an array of `[key, count]`
	*/
	toArray() {
		return [...this.#store.entries()];
	}
	/**
	* Returns a string with keys and counts, useful for debugging.
	* @returns
	*/
	debugString() {
		let t = ``;
		for (const [key, count] of this.#store.entries()) t += `${key}: ${count.toString()}, `;
		if (t.endsWith(`, `)) return t.slice(0, Math.max(0, t.length - 2));
		return t;
	}
	/**
	*
	* @param value Value to count
	* @returns Frequency of value, or _undefined_ if it does not exist
	*/
	frequencyOf(value) {
		if (typeof value === `string`) return this.#store.get(value);
		const key = this.#keyString(value);
		return this.#store.get(key);
	}
	/**
	*
	* @param value Value to count
	* @returns Relative frequency of `value`, or _undefined_ if it does not exist
	*/
	relativeFrequencyOf(value) {
		let freq;
		if (typeof value === `string`) freq = this.#store.get(value);
		else {
			const key = this.#keyString(value);
			freq = this.#store.get(key);
		}
		if (freq === void 0) return;
		const mma = this.computeValues();
		return freq / mma.total;
	}
	/**
	* Returns copy of entries as an array
	* @returns Copy of entries as an array
	*/
	entries() {
		return [...this.#store.entries()];
	}
	/**
	* Calculate min,max,avg,total & count from values
	* @returns Returns `{min,max,avg,total}`
	*/
	computeValues() {
		const valuesAsNumbers = [...this.values()];
		return numberArrayCompute(valuesAsNumbers);
	}
	/**
	* Return entries sorted
	* @param sortStyle Sorting style (default: _value_, ie. count)
	* @returns Sorted array of [key,frequency]
	*/
	entriesSorted(sortStyle = `value`) {
		const s = keyValueSorter(sortStyle);
		return s(this.entries());
	}
	/**
	* Add one or more values, firing _change_ event.
	* @param values Values to add. Fires _change_ event after adding item(s)
	*/
	add(...values) {
		if (typeof values === `undefined`) throw new Error(`Param 'values' undefined`);
		const keys = values.map((v) => this.#keyString(v));
		for (const key of keys) {
			const score = this.#store.get(key) ?? 0;
			this.#store.set(key, score + 1);
		}
		this.fireEvent(`change`, { context: this });
	}
};
const frequency = (keyString) => new FrequencyTracker(keyString);

//#endregion
//#region ../trackers/src/tracker-base.ts
/**
* Base tracker class
*/
var TrackerBase = class {
	/**
	* @ignore
	*/
	seenCount;
	/**
	* @ignore
	*/
	storeIntermediate;
	/**
	* @ignore
	*/
	resetAfterSamples;
	/**
	* @ignore
	*/
	sampleLimit;
	id;
	debug;
	constructor(opts = {}) {
		this.id = opts.id ?? `tracker`;
		this.debug = opts.debug ?? false;
		this.sampleLimit = opts.sampleLimit ?? -1;
		this.resetAfterSamples = opts.resetAfterSamples ?? -1;
		this.storeIntermediate = opts.storeIntermediate ?? (this.sampleLimit > -1 || this.resetAfterSamples > -1);
		this.seenCount = 0;
		if (this.debug) console.log(`TrackerBase: sampleLimit: ${this.sampleLimit} resetAfter: ${this.resetAfterSamples} store: ${this.storeIntermediate}`);
	}
	/**
	* Reset tracker
	*/
	reset() {
		this.seenCount = 0;
		this.onReset();
	}
	/**
	* Adds a value, returning computed result.
	*  
	* At this point, we check if the buffer is larger than `resetAfterSamples`. If so, `reset()` is called.
	* If not, we check `sampleLimit`. If the buffer is twice as large as sample limit, `trimStore()` is
	* called to take it down to sample limit, and `onTrimmed()` is called.
	* @param p 
	* @returns 
	*/
	seen(...p) {
		if (this.resetAfterSamples > 0 && this.seenCount > this.resetAfterSamples) this.reset();
		else if (this.sampleLimit > 0 && this.seenCount > this.sampleLimit * 2) {
			this.seenCount = this.trimStore(this.sampleLimit);
			this.onTrimmed(`resize`);
		}
		this.seenCount += p.length;
		const t = this.filterData(p);
		return this.computeResults(t);
	}
};

//#endregion
//#region ../trackers/src/primitive-tracker.ts
var PrimitiveTracker = class extends TrackerBase {
	values;
	timestamps;
	constructor(opts) {
		super(opts);
		this.values = [];
		this.timestamps = [];
	}
	/**
	* Reduces size of value store to `limit`. Returns
	* number of remaining items
	* @param limit
	*/
	trimStore(limit) {
		if (limit >= this.values.length) return this.values.length;
		this.values = this.values.slice(-limit);
		this.timestamps = this.timestamps.slice(-limit);
		return this.values.length;
	}
	onTrimmed(reason) {}
	get last() {
		return this.values.at(-1);
	}
	get initial() {
		return this.values.at(0);
	}
	/**
	* Returns number of recorded values (this can include the initial value)
	*/
	get size() {
		return this.values.length;
	}
	/**
	* Returns the elapsed time, in milliseconds since the instance was created
	*/
	get elapsed() {
		if (this.values.length < 0) throw new Error(`No values seen yet`);
		return Date.now() - this.timestamps[0];
	}
	onReset() {
		this.values = [];
		this.timestamps = [];
	}
	/**
	* Tracks a value
	*/
	filterData(rawValues) {
		const lastValue = rawValues.at(-1);
		const last = {
			value: lastValue,
			at: performance.now()
		};
		const values = rawValues.map((value) => ({
			at: performance.now(),
			value
		}));
		if (this.storeIntermediate) {
			this.values.push(...rawValues);
			this.timestamps.push(...values.map((v) => v.at));
		} else switch (this.values.length) {
			case 0: {
				this.values.push(last.value);
				this.timestamps.push(last.at);
				break;
			}
			case 2: {
				this.values[1] = last.value;
				this.timestamps[1] = last.at;
				break;
			}
			case 1: {
				this.values.push(last.value);
				this.timestamps.push(last.at);
				break;
			}
		}
		return values;
	}
};

//#endregion
//#region ../trackers/src/number-tracker.ts
var NumberTracker = class extends PrimitiveTracker {
	total = 0;
	min = Number.MAX_SAFE_INTEGER;
	max = Number.MIN_SAFE_INTEGER;
	get avg() {
		return this.total / this.seenCount;
	}
	/**
	* Difference between last value and initial.
	* Eg. if last value was 10 and initial value was 5, 5 is returned (10 - 5)
	* If either of those is missing, undefined is returned
	*/
	difference() {
		if (this.last === void 0) return;
		if (this.initial === void 0) return;
		return this.last - this.initial;
	}
	/**
	* Relative difference between last value and initial.
	* Eg if last value was 10 and initial value was 5, 2 is returned (200%)
	*/
	relativeDifference() {
		if (this.last === void 0) return;
		if (this.initial === void 0) return;
		return this.last / this.initial;
	}
	onReset() {
		this.min = Number.MAX_SAFE_INTEGER;
		this.max = Number.MIN_SAFE_INTEGER;
		this.total = 0;
		super.onReset();
	}
	/**
	* When trimmed, recomputes to set total/min/max to be based on
	* current values.
	* @param reason 
	*/
	onTrimmed(reason) {
		this.min = minFast(this.values);
		this.max = maxFast(this.values);
		this.total = totalFast(this.values);
	}
	computeResults(values) {
		if (values.some((v) => Number.isNaN(v))) throw new Error(`Cannot add NaN`);
		const numbers = values.map((value) => value.value);
		this.total = numbers.reduce((accumulator, v) => accumulator + v, this.total);
		this.min = Math.min(...numbers, this.min);
		this.max = Math.max(...numbers, this.max);
		const r = {
			max: this.max,
			min: this.min,
			total: this.total,
			avg: this.avg
		};
		return r;
	}
	getMinMaxAvg() {
		return {
			min: this.min,
			max: this.max,
			avg: this.avg
		};
	}
};
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
const number = (opts = {}) => new NumberTracker(opts);

//#endregion
//#region ../trackers/src/interval-tracker.ts
/**
* A `Tracker` that tracks interval between calls to `mark()`
*/
var IntervalTracker = class extends NumberTracker {
	lastMark = 0;
	mark() {
		if (this.lastMark > 0) this.seen(performance.now() - this.lastMark);
		this.lastMark = performance.now();
	}
};
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
const interval = (options) => new IntervalTracker(options);

//#endregion
//#region ../trackers/src/rate-tracker.ts
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
var RateTracker = class {
	#events = [];
	#fromTime;
	#resetAfterSamples;
	#sampleLimit;
	#resetTimer;
	constructor(opts = {}) {
		this.#resetAfterSamples = opts.resetAfterSamples ?? Number.MAX_SAFE_INTEGER;
		this.#sampleLimit = opts.sampleLimit ?? Number.MAX_SAFE_INTEGER;
		if (opts.timeoutInterval) this.#resetTimer = timeout(() => {
			this.reset();
		}, opts.timeoutInterval);
		this.#fromTime = performance.now();
	}
	/**
	* Mark that an event has happened
	*/
	mark() {
		if (this.#events.length >= this.#resetAfterSamples) this.reset();
		else if (this.#events.length >= this.#sampleLimit) {
			this.#events = this.#events.slice(1);
			this.#fromTime = this.#events[0];
		}
		this.#events.push(performance.now());
		if (this.#resetTimer) this.#resetTimer.start();
	}
	/**
	* Compute {min,max,avg} for the interval _between_ events.
	* @returns 
	*/
	computeIntervals() {
		const intervals = [];
		let min = Number.MAX_SAFE_INTEGER;
		let max = Number.MIN_SAFE_INTEGER;
		let total = 0;
		let count = 0;
		let start = 0;
		for (const event of this.#events) {
			if (count > 0) {
				const index = event - start;
				min = Math.min(index, min);
				max = Math.max(index, max);
				total += index;
				intervals.push(index);
			}
			start = event;
			count++;
		}
		const avg = total / count;
		return {
			min,
			max,
			avg
		};
	}
	/**
	* Returns the time period (in milliseconds) that encompasses
	* the data set. Eg, a result of 1000 means there's data that
	* covers a one second period.
	*/
	get elapsed() {
		return performance.now() - this.#fromTime;
	}
	/**
	* Resets the tracker.
	*/
	reset() {
		this.#events = [];
		this.#fromTime = performance.now();
	}
	/**
	* Get the number of events per second
	*/
	get perSecond() {
		return this.#events.length / (this.elapsed / 1e3);
	}
	/**
	* Get the number of events per minute
	*/
	get perMinute() {
		return this.#events.length / (this.elapsed / 1e3 / 60);
	}
};
/**
* @inheritdoc RateTracker
* @param opts 
* @returns 
*/
const rate = (opts = {}) => new RateTracker(opts);

//#endregion
//#region ../trackers/src/object-tracker.ts
/**
* A tracked value of type `V`.
*/
var ObjectTracker = class extends TrackerBase {
	values;
	constructor(opts = {}) {
		super(opts);
		this.values = [];
	}
	onTrimmed(reason) {}
	/**
	* Reduces size of value store to `limit`. 
	* Returns number of remaining items
	* @param limit
	*/
	trimStore(limit) {
		if (limit >= this.values.length) return this.values.length;
		this.values = this.values.slice(-limit);
		return this.values.length;
	}
	/**
	* Allows sub-classes to be notified when a reset happens
	* @ignore
	*/
	onReset() {
		this.values = [];
	}
	/**
	* Tracks a value
	* @ignore
	*/
	filterData(p) {
		const ts = p.map((v) => `at` in v ? v : {
			...v,
			at: Date.now()
		});
		const last = ts.at(-1);
		if (this.storeIntermediate) this.values.push(...ts);
		else switch (this.values.length) {
			case 0: {
				this.values.push(last);
				break;
			}
			case 1: {
				this.values.push(last);
				break;
			}
			case 2: {
				this.values[1] = last;
				break;
			}
		}
		return ts;
	}
	/**
	* Last seen value. If no values have been added, it will return the initial value
	*/
	get last() {
		if (this.values.length === 1) return this.values[0];
		return this.values.at(-1);
	}
	/**
	* Returns the oldest value in the buffer
	*/
	get initial() {
		return this.values.at(0);
	}
	/**
	* Returns number of recorded values (includes the initial value in the count)
	*/
	get size() {
		return this.values.length;
	}
	/**
	* Returns the elapsed time, in milliseconds since the initial value
	*/
	get elapsed() {
		return Date.now() - this.values[0].at;
	}
};

//#endregion
//#region ../trackers/src/tracked-value.ts
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
var TrackedValueMap = class {
	store;
	gog;
	constructor(creator) {
		this.store = /* @__PURE__ */ new Map();
		this.gog = getOrGenerate(this.store, creator);
	}
	/**
	* Number of named values being tracked
	*/
	get size() {
		return this.store.size;
	}
	/**
	* Returns _true_ if `id` is stored
	* @param id
	* @returns
	*/
	has(id) {
		return this.store.has(id);
	}
	/**
	* For a given id, note that we have seen one or more values.
	* @param id Id
	* @param values Values(s)
	* @returns Information about start to last value
	*/
	async seen(id, ...values) {
		const trackedValue = await this.getTrackedValue(id, ...values);
		const result = trackedValue.seen(...values);
		return result;
	}
	/**
	* Creates or returns a TrackedValue instance for `id`.
	* @param id
	* @param values
	* @returns
	*/
	async getTrackedValue(id, ...values) {
		if (id === null) throw new Error(`id parameter cannot be null`);
		if (id === void 0) throw new Error(`id parameter cannot be undefined`);
		const trackedValue = await this.gog(id, values[0]);
		return trackedValue;
	}
	/**
	* Remove a tracked value by id.
	* Use {@link reset} to clear them all.
	* @param id
	*/
	delete(id) {
		this.store.delete(id);
	}
	/**
	* Remove all tracked values.
	* Use {@link delete} to remove a single value by id.
	*/
	reset() {
		this.store = /* @__PURE__ */ new Map();
	}
	/**
	* Enumerate ids
	*/
	*ids() {
		yield* this.store.keys();
	}
	/**
	* Enumerate tracked values
	*/
	*tracked() {
		yield* this.store.values();
	}
	/**
	* Iterates TrackedValues ordered with oldest first
	* @returns
	*/
	*trackedByAge() {
		const tp = [...this.store.values()];
		tp.sort((a, b) => {
			const aa = a.elapsed;
			const bb = b.elapsed;
			if (aa === bb) return 0;
			if (aa > bb) return -1;
			return 1;
		});
		for (const t of tp) yield t;
	}
	/**
	* Iterates underlying values, ordered by age (oldest first)
	* First the named values are sorted by their `elapsed` value, and then
	* we return the last value for that group.
	*/
	*valuesByAge() {
		for (const tb of this.trackedByAge()) yield tb.last;
	}
	/**
	* Enumerate last received values
	*
	* @example Calculate centroid of latest-received values
	* ```js
	* const pointers = pointTracker();
	* const c = Points.centroid(...Array.from(pointers.lastPoints()));
	* ```
	*/
	*last() {
		for (const p of this.store.values()) yield p.last;
	}
	/**
	* Enumerate starting values
	*/
	*initialValues() {
		for (const p of this.store.values()) yield p.initial;
	}
	/**
	* Returns a tracked value by id, or undefined if not found
	* @param id
	* @returns
	*/
	get(id) {
		return this.store.get(id);
	}
};

//#endregion
export { FrequencyTracker, IntervalTracker, NumberTracker, ObjectTracker, PrimitiveTracker, RateTracker, TrackedValueMap, TrackerBase, frequency, handleChangeResult, interval, number, rate, trackBooleanChange, trackNumberChange };
//# sourceMappingURL=trackers.js.map