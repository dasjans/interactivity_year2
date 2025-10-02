import { __export } from "./chunk-51aI8Tpl.js";
import { integerTest, isPowerOfTwo, numberTest, resultThrow, src_exports } from "./src-BBD50Kth.js";
import { records_exports } from "./records-Cei7yF1D.js";
import { isPrimitive, isPrimitiveOrObject } from "./is-primitive-eBwrK4Yg.js";
import { compareIterableValuesShallow, defaultToString, elapsedToHumanString, intervalToMs, isEmptyEntries, isEqualContextString, isEqualDefault, isEqualValueDefault, isEqualValueIgnoreOrder, isEqualValuePartial, isInterval, isMap, isSet, toStringDefault, toStringOrdered } from "./interval-type-DajslxUJ.js";
import { comparerInverse, continuously, defaultComparer, elapsedInfinity, elapsedInterval, elapsedOnce, elapsedSince, findBySomeKey, jsComparer, maps_exports, numericComparer, promiseFromEvent, sleep, sleepWhile } from "./basic-D0XoOdBJ.js";
import { getPathsAndData, pathed_exports, src_exports as src_exports$1, src_exports$1 as src_exports$2 } from "./src-SGLqiJ8Q.js";
import { SimpleEventEmitter, afterMatch, beforeMatch, defaultKeyer, indexOfCharCode, omitChars, splitByLength, src_exports as src_exports$3, src_exports$1 as src_exports$4, stringSegmentsWholeToEnd, stringSegmentsWholeToFirst, toStringAbbreviate } from "./src-CkygQtXo.js";
import { isInteger } from "./is-integer-BmMnD0ra.js";
import { keyValueSorter } from "./key-value-JSby0EXT.js";
import { unique, uniqueInstances } from "./dist-DE4H3J9W.js";
import { getErrorMessage, hasLast, isReactive, resolve, resolveSync, resolveWithFallback, resolveWithFallbackSync, src_exports as src_exports$5 } from "./resolve-core-CZPH91No.js";
import { clamp$1 as clamp, mapWithEmptyFallback, max, maxFast, numberArrayCompute, scale, src_exports as src_exports$6, src_exports$1 as src_exports$7 } from "./src-2eX6lIN8.js";
import { QueueMutable, StateMachineWithEvents, debounce, eventRace, init, retryFunction, retryTask, src_exports as src_exports$8, src_exports$1 as src_exports$9, to, waitFor } from "./src-BnNr7xTX.js";
import { resolveEl, src_exports as src_exports$10 } from "./src-CtUbQWIP.js";
import { src_exports as src_exports$11 } from "./src-CURfSkGx.js";
import { number, shortGuid, src_exports as src_exports$12, src_exports$1 as src_exports$13, string } from "./bezier-5SBfGcNj.js";
import { fromCss as fromCss$1, fromCss$1 as fromCss, manualCapture, src_exports as src_exports$14, toColour, toCssColour, toCssString } from "./src-3nHXiifJ.js";
import { debounce as debounce$1, event, eventTrigger, hasLast as hasLast$1, initStream, messageHasValue, messageIsSignal, object, observable, src_exports as src_exports$15, transform } from "./src-DUdYWbDU.js";

//#region ../core/dist/src/correlate.js
const orderScore = (a, b) => {
	if (a.score > b.score) return -1;
	else if (a.score < b.score) return 1;
	return 0;
};
/**
* Attempts to align prior data with new data, based on a provided similarity function.
*
* See also `alignById` for a version which encloses parameters.
*
* ```js
* // Compare data based on x,y distance
* const fn = (a, b) => {
*  return 1-Points.distance(a, b);
* }
* const lastData = [
*  { id:`1`, x:100, y:200 }
*  ...
* ]
* const newData = [
*  { id:`2`, x:101, y:200 }
* ]
* const aligned = Correlate.align(fn, lastdata, newData, opts);
*
* // Result:
* [
*  { id:`1`, x:101, y:200 }
* ]
* ```
* @param similarityFunction Function to compute similarity
* @param lastData Old data
* @param newData New data
* @param options Options
* @returns
*/
const align = (similarityFunction, lastData, newData, options = {}) => {
	const matchThreshold = options.matchThreshold ?? 0;
	const debug = options.debug ?? false;
	const results = /* @__PURE__ */ new Map();
	const newThings = [];
	const lastMap = /* @__PURE__ */ new Map();
	lastData?.forEach((d, index) => {
		if (typeof d === `undefined`) throw new Error(`'lastData' contains undefined (index: ${index.toString()})`);
		lastMap.set(d.id, d);
	});
	for (const newD of newData) {
		if (!lastData || lastData.length === 0) {
			if (debug) console.debug(`Correlate.align() new id: ${newD.id}`);
			newThings.push(newD);
			continue;
		}
		const scoredLastValues = Array.from(lastMap.values()).map((last) => ({
			id: last.id,
			score: last === null ? -1 : similarityFunction(last, newD),
			last
		}));
		if (scoredLastValues.length === 0) {
			if (debug) console.debug(`Correlate.align() no valid last values id: ${newD.id}`);
			newThings.push(newD);
			continue;
		}
		scoredLastValues.sort(orderScore);
		const top = scoredLastValues[0];
		if (top.score < matchThreshold) {
			if (debug) console.debug(`Correlate.align() new item does not reach threshold. Top score: ${top.score.toString()} id: ${newD.id}`);
			newThings.push(newD);
			continue;
		}
		if (debug && top.id !== newD.id) console.log(`Correlate.align() Remapped ${newD.id} -> ${top.id} (score: ${top.score.toString()})`);
		results.set(top.id, {
			...newD,
			id: top.id
		});
		lastMap.delete(top.id);
	}
	newThings.forEach((t) => results.set(t.id, t));
	return Array.from(results.values());
};
/**
* Returns a function that attempts to align a series of data by its id.
* See also {@link align} for a version with no internal storage.
*
* ```js
* // Compare data based on x,y distance
* const fn = (a, b) => {
*  return 1-Points.distance(a, b);
* }
* const aligner = Correlate.alignById(fn, opts);
*
* const lastData = [
*  { id:`1`, x:100, y:200 }
*  ...
* ]
* const aligned = aligner(lastData);
*
* ```
* @param fn Function to compute similarity
* @param options Options
* @returns
*/
const alignById = (fn, options = {}) => {
	let lastData = [];
	const compute = (newData) => {
		lastData = align(fn, lastData, newData, options);
		return [...lastData];
	};
	return compute;
};

//#endregion
//#region ../core/dist/src/filters.js
/**
* Returns `v` if `predicate` returns _true_,
* alternatively returning `skipValue`.
*
* ```js
* // Return true if value is less than 10
* const p = v => v < 10;
*
* filterValue(5, p, 0);   // 5
* filterValue(20, p, 0);  // 0
* ```
* @param v Value to test
* @param predicate Predicate
* @param skipValue Value to return if predicate returns false
* @returns Input value if predicate is _true_, or `skipValue` if not.
*/
const filterValue = (v, predicate, skipValue) => {
	if (predicate(v)) return v;
	return skipValue;
};

//#endregion
//#region ../core/dist/src/is-equal-test.js
/**
* Wraps the `eq` function, tracing the input data result
* ```js
* // Init trace
* const traceEq = isEqualTrace(isEqualValueDefault);
* // Use it in some function that takes IsEqual<T>
* compare(a, b, eq);
* ```
* @param eq
* @returns
*/
const isEqualTrace = (eq) => {
	return (a, b) => {
		const result = eq(a, b);
		console.log(`isEqualTrace eq: ${result} a: ${toStringAbbreviate(a)} b: ${toStringAbbreviate(b)}`);
		return result;
	};
};

//#endregion
//#region ../core/dist/src/platform.js
/**
* Returns _true_ if it seems like the code is running on iOS (iPad/iPhone)
* @returns
*/
const runningiOS = () => [
	`iPad Simulator`,
	`iPhone Simulator`,
	`iPod Simulator`,
	`iPad`,
	`iPhone`,
	`iPod`
].includes(navigator.platform) || navigator.userAgent.includes(`Mac`) && `ontouchend` in document;

//#endregion
//#region ../core/dist/src/util/zip.js
const zip = (...arrays) => {
	if (arrays.some((a) => !Array.isArray(a))) throw new Error(`All parameters must be an array`);
	const lengths = arrays.map((a) => a.length);
	const returnValue = [];
	const length = lengths[0];
	for (let index = 0; index < length; index++) returnValue.push(arrays.map((a) => a[index]));
	return returnValue;
};

//#endregion
//#region ../core/dist/src/resolve-fields.js
/**
* Returns a copy of `object`, with the same properties. For each property
* that has a basic value (string, number, boolean, object), the value is set
* for the return object. If the property is a function or generator, its value
* is used instead. Async functions and generators are also usable.
*
* Use {@link resolveFieldsSync} for a synchronous version.
*
* Not recursive.
*
* In the below example, the function for the property `random` is invoked.
* ```js
* const state = {
*  length: 10,
*  random: () => Math.random();
* }
* const x = resolveFields(state);
* // { length: 10, random: 0.1235 }
* ```
*
* It also works with generators. Probably best with those that are infinite.
*
* ```js
* import { count } from './numbers.js';
*
* const state = {
*  length: 10,
*  index: count(2) // Generator that yields: 0, 1 and then ends
* }
* resolveFields(state); // { length: 10, index: 0 }
* resolveFields(state); // { length: 10, index: 1 }
* // Generator finishes after counting twice:
* resolveFields(state); // { length: 10, index: undefined }
* ```
* @param object
* @returns
*/
async function resolveFields(object$1) {
	const resolvers = [];
	const keys = [];
	for (const entry of Object.entries(object$1)) {
		const resolvable = entry[1];
		resolvers.push(resolve(resolvable));
		keys.push(entry[0]);
	}
	const results = await Promise.all(resolvers);
	const entries = zip(keys, results);
	return Object.fromEntries(entries);
}
/**
* 'Resolves' all the fields of `object` in a synchronous manner.
* Uses {@link resolveSync} under-the-hood
* @param object
* @returns
*/
function resolveFieldsSync(object$1) {
	const entries = [];
	for (const entry of Object.entries(object$1)) {
		const resolvable = entry[1];
		const value = resolveSync(resolvable);
		entries.push([entry[0], value]);
	}
	return Object.fromEntries(entries);
}
/**
* Returns a function that resolves `object`.
*
* Use {@link resolveFields} to resolve an object directly.
* @param object
* @returns
*/

//#endregion
//#region ../io/dist/src/codec.js
/**
* Handles utf-8 text encoding/decoding
*/
var Codec = class {
	enc = new TextEncoder();
	dec = new TextDecoder(`utf-8`);
	/**
	* Convert string to Uint8Array buffer
	* @param text
	* @returns
	*/
	toBuffer(text) {
		return this.enc.encode(text);
	}
	/**
	* Returns a string from a provided buffer
	* @param buffer
	* @returns
	*/
	fromBuffer(buffer) {
		return this.dec.decode(buffer);
	}
};

//#endregion
//#region ../io/dist/src/string-receive-buffer.js
/**
* Receives text
*/
var StringReceiveBuffer = class {
	onData;
	separator;
	buffer = ``;
	stream;
	constructor(onData, separator = `\n`) {
		this.onData = onData;
		this.separator = separator;
	}
	async close() {
		const s = this.stream;
		if (!s) return;
		await s.abort();
		await s.close();
	}
	clear() {
		this.buffer = ``;
	}
	writable() {
		if (this.stream === void 0) this.stream = this.createWritable();
		return this.stream;
	}
	createWritable() {
		const b = this;
		return new WritableStream({
			write(chunk) {
				b.add(chunk);
			},
			close() {
				b.clear();
			}
		});
	}
	addImpl(string_) {
		const pos = string_.indexOf(this.separator);
		if (pos < 0) {
			this.buffer += string_;
			return ``;
		}
		const part = string_.substring(0, pos);
		try {
			this.onData(this.buffer + part);
			string_ = string_.substring(part.length + this.separator.length);
		} catch (ex) {
			console.warn(ex);
		}
		this.buffer = ``;
		return string_;
	}
	add(string_) {
		while (string_.length > 0) string_ = this.addImpl(string_);
	}
};

//#endregion
//#region ../io/dist/src/string-write-buffer.js
/**
* Buffers a queue of strings.
*
* When text is queued via {@link add}, it is chopped up
* into chunks and sent in serial to the `dataHandler` function.
* Data is processed at a set rate, by default 10ms.
*
* ```js
* const dataHandler = (data:string) => {
*  // Do something with queued data.
*  // eg. send to serial port
* }
*
* // Create a buffer with a chunk size of 100 characters
* const b = new StringWriteBuffer(dataHandler, { chunkSize: 100 });
* b.add('some text'); // Write to buffer
* // dataHandler will be called until queued data is empty
* ```
*
* It's also possible to get the buffer as a WritableStream<string>:
* ```js
* const dataHandler = (data:string) => { ... }
* const b = new StringWriteBuffer(dataHandler, 100);
* const s = b.writable();
* ```
*
* Other functions:
* ```js
* b.close(); // Close buffer
* b.clear(); // Clear queued data, but don't close anything
* ```
*/
var StringWriteBuffer = class {
	dataHandler;
	paused = false;
	queue = new QueueMutable();
	writer;
	stream;
	closed = false;
	chunkSize;
	/**
	* Constructor
	* @param dataHandler Calback to 'send' data onwards
	* @param opts Options
	*/
	constructor(dataHandler, opts = {}) {
		this.dataHandler = dataHandler;
		this.chunkSize = opts.chunkSize ?? -1;
		this.writer = continuously(async () => {
			await this.onWrite();
		}, opts.interval ?? 10);
	}
	/**
	* Close writer (async)
	*/
	async close() {
		if (this.closed) return;
		const w = this.stream?.getWriter();
		w?.releaseLock();
		await w?.close();
		this.closed = true;
	}
	/**
	* Clear queued data.
	*
	* Throws an error if {@link close} has been called.
	*/
	clear() {
		if (this.closed) throw new Error(`Buffer closed`);
		this.queue = new QueueMutable();
	}
	/**
	* Gets the buffer as a writable stream.
	*
	* Do not close stream directly, use .close on this class instead.
	*
	* Throws an error if .close() has been called.
	* @returns Underlying stream
	*/
	writable() {
		if (this.closed) throw new Error(`Buffer closed`);
		if (this.stream === void 0) this.stream = this.createWritable();
		return this.stream;
	}
	createWritable() {
		const b = this;
		return new WritableStream({
			write(chunk) {
				b.add(chunk);
			},
			close() {
				b.clear();
			}
		});
	}
	/**
	* Run in a `continunously` loop to process queued data
	* @returns _False_ if queue is empty and loop should stop. _True_ if it shoud continue.
	*/
	async onWrite() {
		if (this.queue.isEmpty) return false;
		if (this.paused) {
			console.warn(`WriteBuffer.onWrite: paused...`);
			return true;
		}
		const s = this.queue.dequeue();
		if (s === void 0) return false;
		await this.dataHandler(s);
		return true;
	}
	/**
	* Returns _true_ if {@link close} has been called.
	*/
	get isClosed() {
		return this.closed;
	}
	/**
	* Adds some queued data to send.
	* Longer strings are automatically chunked up according to the buffer's settings.
	*
	* Throws an error if {@link close} has been called.
	* @param stringToQueue
	*/
	add(stringToQueue) {
		if (this.closed) throw new Error(`Buffer closed`);
		if (this.chunkSize > 0) this.queue.enqueue(...splitByLength(stringToQueue, this.chunkSize));
		else this.queue.enqueue(stringToQueue);
		this.writer.start();
	}
};

//#endregion
//#region ../io/dist/src/generic-state-transitions.js
const genericStateTransitionsInstance = Object.freeze({
	ready: `connecting`,
	connecting: [`connected`, `closed`],
	connected: [`closed`],
	closed: `connecting`
});

//#endregion
//#region ../io/dist/src/ble-device.js
var BleDevice = class extends SimpleEventEmitter {
	device;
	config;
	states;
	codec;
	rx;
	tx;
	gatt;
	verboseLogging = false;
	rxBuffer;
	txBuffer;
	constructor(device, config) {
		super();
		this.device = device;
		this.config = config;
		this.verboseLogging = config.debug;
		this.txBuffer = new StringWriteBuffer(async (data) => {
			await this.writeInternal(data);
		}, config);
		this.rxBuffer = new StringReceiveBuffer((line) => {
			this.fireEvent(`data`, { data: line });
		});
		this.codec = new Codec();
		this.states = new StateMachineWithEvents(genericStateTransitionsInstance, { initial: `ready` });
		this.states.addEventListener(`change`, (event$1) => {
			this.fireEvent(`change`, event$1);
			this.verbose(`${event$1.priorState} -> ${event$1.newState}`);
			if (event$1.priorState === `connected`) {
				this.rxBuffer.clear();
				this.txBuffer.clear();
			}
		});
		device.addEventListener(`gattserverdisconnected`, () => {
			if (this.isClosed) return;
			this.verbose(`GATT server disconnected`);
			this.states.state = `closed`;
		});
		this.verbose(`ctor ${device.name} ${device.id}`);
	}
	get isConnected() {
		return this.states.state === `connected`;
	}
	get isClosed() {
		return this.states.state === `closed`;
	}
	write(txt) {
		if (this.states.state !== `connected`) throw new Error(`Cannot write while state is ${this.states.state}`);
		this.txBuffer.add(txt);
	}
	async writeInternal(txt) {
		this.verbose(`writeInternal ${txt}`);
		const tx = this.tx;
		if (tx === void 0) throw new Error(`Unexpectedly without tx characteristic`);
		try {
			await tx.writeValue(this.codec.toBuffer(txt));
		} catch (error) {
			this.warn(error);
		}
	}
	disconnect() {
		if (this.states.state !== `connected`) return;
		this.gatt?.disconnect();
	}
	async connect() {
		const attempts = this.config.connectAttempts ?? 3;
		this.states.state = `connecting`;
		this.verbose(`connect`);
		const gatt = this.device.gatt;
		if (gatt === void 0) throw new Error(`Gatt not available on device`);
		await retryFunction(async () => {
			this.verbose(`connect.retry`);
			const server = await gatt.connect();
			this.verbose(`Getting primary service`);
			const service = await server.getPrimaryService(this.config.service);
			this.verbose(`Getting characteristics`);
			const rx = await service.getCharacteristic(this.config.rxGattCharacteristic);
			const tx = await service.getCharacteristic(this.config.txGattCharacteristic);
			rx.addEventListener(`characteristicvaluechanged`, (event$1) => {
				this.onRx(event$1);
			});
			this.rx = rx;
			this.tx = tx;
			this.gatt = gatt;
			this.states.state = `connected`;
			await rx.startNotifications();
			return true;
		}, {
			limitAttempts: attempts,
			startAt: 200
		});
	}
	onRx(event$1) {
		const rx = this.rx;
		if (rx === void 0) return;
		const view = event$1.target.value;
		if (view === void 0) return;
		let text = this.codec.fromBuffer(view.buffer);
		const plzStop = indexOfCharCode(text, 19);
		const plzStart = indexOfCharCode(text, 17);
		if (plzStart && plzStop < plzStart) {
			this.verbose(`Tx plz start`);
			text = omitChars(text, plzStart, 1);
			this.txBuffer.paused = false;
		}
		if (plzStop && plzStop > plzStart) {
			this.verbose(`Tx plz stop`);
			text = omitChars(text, plzStop, 1);
			this.txBuffer.paused = true;
		}
		this.rxBuffer.add(text);
	}
	verbose(m) {
		if (this.verboseLogging) console.info(this.config.name, m);
	}
	log(m) {
		console.log(this.config.name, m);
	}
	warn(m) {
		console.warn(this.config.name, m);
	}
};

//#endregion
//#region ../io/dist/src/nordic-ble-device.js
var nordic_ble_device_exports = {};
__export(nordic_ble_device_exports, {
	NordicBleDevice: () => NordicBleDevice,
	defaultOpts: () => defaultOpts
});
const defaultOpts = {
	chunkSize: 20,
	service: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`,
	txGattCharacteristic: `6e400002-b5a3-f393-e0a9-e50e24dcca9e`,
	rxGattCharacteristic: `6e400003-b5a3-f393-e0a9-e50e24dcca9e`,
	name: `NordicDevice`,
	connectAttempts: 5,
	debug: false
};
var NordicBleDevice = class extends BleDevice {
	constructor(device, opts = {}) {
		super(device, {
			...defaultOpts,
			...opts
		});
	}
};

//#endregion
//#region ../io/dist/src/audio/visualiser.js
var AudioVisualiser = class {
	freqMaxRange = 200;
	audio;
	parent;
	lastPointer = {
		x: 0,
		y: 0
	};
	pointerDown = false;
	pointerClicking = false;
	pointerClickDelayMs = 100;
	pointerDelaying = false;
	waveTracker;
	freqTracker;
	el;
	constructor(parentElement, audio) {
		this.audio = audio;
		this.parent = parentElement;
		this.waveTracker = number();
		this.freqTracker = number();
		parentElement.innerHTML = `
    <section>
      <button id="rendererComponentToggle">🔼</button>
      <div>
        <h1>Visualiser</h1>
        <div style="display:flex; flex-wrap: wrap">
          <div class="visPanel">
            <h2>Frequency distribution</h2>
            <br />
            <canvas id="rendererComponentFreqData" height="200" width="400"></canvas>
          </div>
          <div class="visPanel">
            <h2>Waveform</h2>
            <button id="rendererComponentWaveReset">Reset</button>
            <div>
              Press and hold on wave to measure
            </div>
            <br />
            <canvas id="rendererComponentWaveData" height="200" width="400"></canvas>
          </div>
        </div>
      </div>
    </section>
    `;
		this.el = parentElement.children[0];
		document.getElementById(`rendererComponentToggle`)?.addEventListener(`click`, () => {
			this.setExpanded(!this.isExpanded());
		});
		this.el.addEventListener(`pointermove`, (e) => {
			this.onPointer(e);
		});
		this.el.addEventListener(`pointerup`, () => {
			this.pointerDelaying = false;
			this.pointerDown = false;
		});
		this.el.addEventListener(`pointerdown`, () => {
			this.pointerDelaying = true;
			setTimeout(() => {
				if (this.pointerDelaying) {
					this.pointerDelaying = false;
					this.pointerDown = true;
				}
			}, this.pointerClickDelayMs);
		});
		this.el.addEventListener(`pointerleave`, () => {
			this.pointerDelaying = false;
			this.pointerDown = false;
		});
		document.getElementById(`rendererComponentWaveReset`)?.addEventListener(`click`, () => {
			this.clear();
		});
	}
	renderFreq(freq) {
		if (!this.isExpanded()) return;
		if (!freq) return;
		const canvas = document.getElementById(`rendererComponentFreqData`);
		if (canvas === null) throw new Error(`Cannot find canvas element`);
		const g = canvas.getContext(`2d`);
		if (g === null) throw new Error(`Cannot create drawing context`);
		const bins = freq.length;
		const canvasWidth = canvas.clientWidth;
		const canvasHeight = canvas.clientHeight;
		g.clearRect(0, 0, canvasWidth, canvasHeight);
		const pointer = this.getPointerRelativeTo(canvas);
		const width = canvasWidth / bins;
		const minMax = numberArrayCompute(freq);
		for (let index = 0; index < bins; index++) {
			if (!Number.isFinite(freq[index])) continue;
			const value = freq[index] - minMax.min;
			const valueRelative = value / this.freqMaxRange;
			const height = Math.abs(canvasHeight * valueRelative);
			const offset = canvasHeight - height;
			const hue = index / bins * 360;
			const left = index * width;
			g.fillStyle = `hsl(${hue}, 100%, 50%)`;
			if (pointer.y > 0 && pointer.y <= canvasHeight && pointer.x >= left && pointer.x <= left + width) {
				if (this.freqTracker.id !== index.toString()) this.freqTracker = number({ id: index.toString() });
				this.freqTracker.seen(freq[index]);
				const freqMma = this.freqTracker.getMinMaxAvg();
				g.fillStyle = `black`;
				if (this.audio) g.fillText(`Frequency (${index}) at pointer: ${this.audio.getFrequencyAtIndex(index).toLocaleString(`en`)} - ${this.audio.getFrequencyAtIndex(index + 1).toLocaleString(`en`)}`, 2, 10);
				g.fillText(`Raw value: ${freq[index].toFixed(2)}`, 2, 20);
				g.fillText(`Min: ${freqMma.min.toFixed(2)}`, 2, 40);
				g.fillText(`Max: ${freqMma.max.toFixed(2)}`, 60, 40);
				g.fillText(`Avg: ${freqMma.avg.toFixed(2)}`, 120, 40);
			}
			g.fillRect(left, offset, width, height);
		}
	}
	isExpanded() {
		const contentsElement = this.el.querySelector(`div`);
		if (contentsElement === null) throw new Error(`contents div not found`);
		return contentsElement.style.display === ``;
	}
	setExpanded(value) {
		const contentsElement = this.el.querySelector(`div`);
		const button = this.el.querySelector(`button`);
		if (button === null) throw new Error(`Button element not found`);
		if (contentsElement === null) throw new Error(`Contents element not found`);
		if (value) {
			contentsElement.style.display = ``;
			button.innerText = `🔼`;
		} else {
			contentsElement.style.display = `none`;
			button.innerText = `🔽`;
		}
	}
	clear() {
		this.clearCanvas(document.getElementById(`rendererComponentFreqData`));
		this.clearCanvas(document.getElementById(`rendererComponentWaveData`));
	}
	clearCanvas(canvas) {
		if (canvas === null) throw new Error(`Canvas is null`);
		const g = canvas.getContext(`2d`);
		if (g === null) throw new Error(`Cannot create drawing context`);
		g.fillStyle = `white`;
		g.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	}
	renderWave(wave, bipolar = true) {
		if (!this.isExpanded()) return;
		if (!wave) return;
		const canvas = document.getElementById(`rendererComponentWaveData`);
		if (canvas === null) throw new Error(`Cannot find wave canvas`);
		const g = canvas.getContext(`2d`);
		if (g === null) throw new Error(`Cannot create drawing context for wave`);
		const canvasWidth = canvas.clientWidth;
		const canvasHeight = canvas.clientHeight;
		const pointer = this.getPointerRelativeTo(canvas);
		const infoAreaHeight = 20;
		const infoAreaWidth = 60;
		const bins = wave.length;
		g.fillStyle = `white`;
		g.fillRect(0, 0, infoAreaWidth, infoAreaHeight);
		const width = canvasWidth / bins;
		g.fillStyle = `rgba(255, 255, 255, 0.03)`;
		g.fillRect(0, 20, canvasWidth, canvasHeight);
		g.fillStyle = `red`;
		if (bipolar) g.fillRect(0, canvasHeight / 2, canvasWidth, 1);
		else g.fillRect(0, canvasHeight - 1, canvasWidth, 1);
		g.lineWidth = 1;
		g.strokeStyle = `black`;
		g.beginPath();
		let x = 0;
		for (let index = 0; index < bins; index++) {
			const height = wave[index] * canvasHeight;
			const y = bipolar ? canvasHeight / 2 - height : canvasHeight - height;
			if (index === 0) g.moveTo(x, y);
			else g.lineTo(x, y);
			x += width;
			if (this.pointerDown) this.waveTracker.seen(wave[index]);
		}
		g.lineTo(canvasWidth, bipolar ? canvasHeight / 2 : canvasHeight);
		g.stroke();
		if (this.pointerDown) {
			const waveMma = this.waveTracker.getMinMaxAvg();
			g.fillStyle = `rgba(255,255,0,1)`;
			g.fillRect(infoAreaWidth, 0, 150, 20);
			g.fillStyle = `black`;
			g.fillText(`Min: ` + waveMma.min.toFixed(2), 60, 10);
			g.fillText(`Max: ` + waveMma.max.toFixed(2), 110, 10);
			g.fillText(`Avg: ` + waveMma.avg.toFixed(2), 160, 10);
		} else this.waveTracker.reset();
		if (pointer.y > 0 && pointer.y <= canvasHeight && pointer.x >= 0 && pointer.x <= canvasWidth) {
			g.fillStyle = `black`;
			g.fillText(`Level: ` + (1 - pointer.y / canvasHeight).toFixed(2), 2, 10);
		}
	}
	getPointerRelativeTo(elem) {
		const rect = elem.getBoundingClientRect();
		return {
			x: this.lastPointer.x - rect.left - window.scrollX,
			y: this.lastPointer.y - rect.top - window.scrollY
		};
	}
	onPointer(event$1) {
		this.lastPointer = {
			x: event$1.pageX,
			y: event$1.pageY
		};
		event$1.preventDefault();
	}
};

//#endregion
//#region ../io/dist/src/audio/analyser.js
/**
* Basic audio analyser. Returns back waveform and FFT analysis. Use {@link analyserPeakLevel} if you want sound level, or {@link analyserFrequency} if you just want FFT results.
*
* ```js
* const onData = (freq, wave, analyser) => {
*  // Demo: Get FFT results just for 100Hz-1KHz.
*  const freqSlice = analyser.sliceByFrequency(100,1000,freq);
*
*  // Demo: Get FFT value for a particular frequency (1KHz)
*  const amt = freq[analyser.getIndexForFrequency(1000)];
* }
* analyserBasic(onData, {fftSize: 512});
* ```
*
* An `Analyser` instance is returned and can be controlled:
* ```js
* const analyser = analyserBasic(onData);
* analyser.paused = true;
* ```
*
* Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
*
* @param onData Handler for data
* @param opts Options
* @returns Analyser instance
*/
const analyserBasic = (onData, opts = {}) => new AudioAnalyser((node, analyser) => {
	const freq = new Float32Array(node.frequencyBinCount);
	const wave = new Float32Array(node.fftSize);
	node.getFloatFrequencyData(freq);
	node.getFloatTimeDomainData(wave);
	onData(freq, wave, analyser);
}, opts);
/**
* Basic audio analyser. Returns FFT analysis. Use {@link analyserPeakLevel} if you want the sound level, or {@link analyserBasic} if you also want the waveform.
*
* ```js
* const onData = (freq, analyser) => {
*  // Demo: Print out each sound frequency (Hz) and amount of energy in that band
*  for (let i=0;i<freq.length;i++) {
*    const f = analyser.getFrequencyAtIndex(0);
*    console.log(`${i}. frequency: ${f} amount: ${freq[i]}`);
*  }
* }
* analyserFrequency(onData, {fftSize:512});
* ```
*
* Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
*
* @param onData
* @param opts
* @returns
*/
const analyserFrequency = (onData, opts = {}) => new AudioAnalyser((node, analyser) => {
	const freq = new Float32Array(node.frequencyBinCount);
	node.getFloatFrequencyData(freq);
	onData(freq, analyser);
}, opts);
/**
* Basic audio analyser which reports the peak sound level.
*
* ```js
* analyserPeakLevel(level => {
*  console.log(level);
* });
* ```
*
* Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
* @param onData
* @param opts
* @returns
*/
const analyserPeakLevel = (onData, opts = {}) => new AudioAnalyser((node, analyser) => {
	const wave = new Float32Array(node.fftSize);
	node.getFloatTimeDomainData(wave);
	onData(maxFast(wave), analyser);
}, opts);
/**
* Helper for doing audio analysis. It takes case of connecting the audio stream, running in a loop and pause capability.
*
* Provide a function which works with an [AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode), and does something with the result.
* ```js
* const myAnalysis = (node, analyser) => {
*  const freq = new Float32Array(node.frequencyBinCount);
*  node.getFloatFrequencyData(freq);
*  // Do something with frequency data...
* }
* const a = new Analyser(myAnalysis);
* ```
*
* Helper functions provide ready-to-use Analysers:
* * {@link analyserPeakLevel} peak decibel reading
* * {@link analyserFrequency} FFT results
* * {@link analyserBasic} FFT results and waveform
*
* Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
*
*/
var AudioAnalyser = class {
	showVis;
	fftSize;
	smoothingTimeConstant;
	#isPaused = false;
	debug;
	#initInProgress = false;
	visualiser;
	audioCtx;
	analyserNode;
	analyse;
	constructor(analyse, opts = {}) {
		this.showVis = opts.showVis ?? false;
		this.fftSize = opts.fftSize ?? 1024;
		this.debug = opts.debug ?? false;
		this.smoothingTimeConstant = opts.smoothingTimeConstant ?? .8;
		resultThrow(integerTest(this.fftSize, `positive`, `opts.fftSize`), numberTest(this.smoothingTimeConstant, `percentage`, `opts.smoothingTimeConstant`));
		if (!isPowerOfTwo(this.fftSize)) throw new Error(`fftSize must be a power of two from 32 to 32768 (${this.fftSize})`);
		if (this.fftSize < 32) throw new Error(`fftSize must be at least 32`);
		if (this.fftSize > 32768) throw new Error(`fftSize must be no greater than 32768`);
		this.analyse = analyse;
		this.paused = false;
		this.init();
		const visualiserEl = document.querySelector(`#audio-visualiser`);
		if (visualiserEl) {
			const visualiser = new AudioVisualiser(visualiserEl, this);
			visualiser.setExpanded(this.showVis);
			this.visualiser = visualiser;
		}
	}
	init() {
		if (this.#initInProgress) {
			if (this.debug) console.debug(`Init already in progress`);
			return;
		}
		this.#initInProgress = true;
		navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
			this.onMicSuccess(stream);
		}).catch((error) => {
			this.#initInProgress = false;
			console.error(error);
		});
	}
	get paused() {
		return this.#isPaused;
	}
	set paused(v) {
		if (v === this.#isPaused) return;
		this.#isPaused = v;
		if (v) {
			if (this.debug) console.log(`Paused`);
		} else {
			if (this.debug) console.log(`Unpaused`);
			window.requestAnimationFrame(this.analyseLoop.bind(this));
		}
	}
	setup(context, stream) {
		const analyser = context.createAnalyser();
		analyser.fftSize = this.fftSize;
		analyser.smoothingTimeConstant = this.smoothingTimeConstant;
		const micSource = context.createMediaStreamSource(stream);
		micSource.connect(analyser);
		return analyser;
	}
	onMicSuccess(stream) {
		try {
			const context = new AudioContext();
			context.addEventListener(`statechange`, () => {
				if (this.debug) console.log(`Audio context state: ${context.state}`);
			});
			this.audioCtx = context;
			this.analyserNode = this.setup(context, stream);
			window.requestAnimationFrame(this.analyseLoop.bind(this));
		} catch (error) {
			this.#initInProgress = false;
			console.error(error);
		}
	}
	analyseLoop() {
		if (this.paused) {
			if (this.debug) console.log(`Paused`);
			return;
		}
		const a = this.analyserNode;
		if (a === void 0) {
			console.warn(`Analyser undefined`);
			return;
		}
		try {
			this.analyse(a, this);
		} catch (error) {
			console.error(error);
		}
		window.requestAnimationFrame(this.analyseLoop.bind(this));
	}
	/**
	* Returns the maximum FFT value within the given frequency range
	*/
	getFrequencyRangeMax(lowFreq, highFreq, freqData) {
		const samples = this.sliceByFrequency(lowFreq, highFreq, freqData);
		return max(samples);
	}
	/**
	* Returns a sub-sampling of frequency analysis data that falls between
	* `lowFreq` and `highFreq`.
	* @param lowFreq Low frequency
	* @param highFreq High frequency
	* @param freqData Full-spectrum frequency data
	* @returns Sub-sampling of analysis
	*/
	sliceByFrequency(lowFreq, highFreq, freqData) {
		const lowIndex = this.getIndexForFrequency(lowFreq);
		const highIndex = this.getIndexForFrequency(highFreq);
		const samples = freqData.slice(lowIndex, highIndex);
		return samples;
	}
	/**
	* Returns the starting frequency for a given binned frequency index.
	* @param index Array index
	* @returns Sound frequency
	*/
	getFrequencyAtIndex(index) {
		const a = this.analyserNode;
		const ctx = this.audioCtx;
		if (a === void 0) throw new Error(`Analyser not available`);
		if (ctx === void 0) throw new Error(`Audio context not available`);
		resultThrow(integerTest(index, `positive`, `index`));
		if (index > a.frequencyBinCount) throw new Error(`Index ${index} exceeds frequency bin count ${a.frequencyBinCount}`);
		return index * ctx.sampleRate / (a.frequencyBinCount * 2);
	}
	/**
	* Returns a binned array index for a given frequency
	* @param freq Sound frequency
	* @returns Array index into frequency bins
	*/
	getIndexForFrequency(freq) {
		const a = this.analyserNode;
		if (a === void 0) throw new Error(`Analyser not available`);
		const nyquist = a.context.sampleRate / 2;
		const index = Math.round(freq / nyquist * a.frequencyBinCount);
		if (index < 0) return 0;
		if (index >= a.frequencyBinCount) return a.frequencyBinCount - 1;
		return index;
	}
};

//#endregion
//#region ../io/dist/src/audio/from-audio-element.js
/**
* Scans page for <AUDIO> elements and creates playable controllers for them.
* It uses the element's 'id' attribute as a way of fetching one later.
*
* ```js
* const ae = new AudioElements();
* ae.init(); // Initialise
*
* const a = ae.get('kick'); // Get the source that had id 'kick'
* ```
*/
var AudioElements = class {
	#initialised = false;
	#sources = /* @__PURE__ */ new Map();
	filterType = `lowpass`;
	constructor() {}
	init() {
		if (this.#initialised) return;
		this.#initialised = true;
		for (const element of document.querySelectorAll(`audio`)) this.#sources.set(element.id, createFromAudioElement(element, this.filterType));
	}
	/**
	* Gets a BasicAudio instance by key
	* @param key
	* @returns BasicAudio instance, or undefined
	*/
	get(key) {
		this.init();
		return this.#sources.get(key);
	}
};
/**
* Create a BasicAudioElement instance from an <AUDIO> tag in the HTML document.
*
* See {@link AudioElements} to automatically create sources from all <AUDIO> elements.
* @param audioElementOrQuery Element or query (eg '#some-id')
* @param filterType Filter type. Defaults to 'lowpass'
* @returns
*/
function createFromAudioElement(audioElementOrQuery, filterType = `lowpass`) {
	const el = resolveEl(audioElementOrQuery);
	const context = new AudioContext();
	const source = context.createMediaElementSource(el);
	const pan = context.createStereoPanner();
	const gain = context.createGain();
	const filter = context.createBiquadFilter();
	filter.type = filterType;
	source.connect(gain);
	gain.connect(pan);
	pan.connect(filter);
	filter.connect(context.destination);
	return {
		pan,
		gain,
		filter,
		id: el.id,
		ctx: context,
		el
	};
}

//#endregion
//#region ../io/dist/src/audio/from-oscillator.js
/**
* Initialise audio with an oscillator source
* @param oscillatorOptions
* @returns BasicAudio instance
*/
function createOscillator(oscillatorOptions = {}) {
	const context = new AudioContext();
	const oscType = oscillatorOptions.type ?? `sawtooth`;
	const oscFreq = oscillatorOptions.frequency ?? 440;
	const id = oscillatorOptions.id ?? shortGuid();
	const source = context.createOscillator();
	source.type = oscType;
	source.frequency.setValueAtTime(oscFreq, context.currentTime);
	const pan = context.createStereoPanner();
	const gain = context.createGain();
	const filter = context.createBiquadFilter();
	source.connect(gain);
	gain.connect(pan);
	pan.connect(filter);
	filter.connect(context.destination);
	return {
		pan,
		gain,
		filter,
		ctx: context,
		osc: source,
		id
	};
}

//#endregion
//#region ../io/dist/src/audio/index.js
var audio_exports = {};
__export(audio_exports, {
	AudioAnalyser: () => AudioAnalyser,
	AudioElements: () => AudioElements,
	AudioVisualiser: () => AudioVisualiser,
	analyserBasic: () => analyserBasic,
	analyserFrequency: () => analyserFrequency,
	analyserPeakLevel: () => analyserPeakLevel,
	createFromAudioElement: () => createFromAudioElement,
	createOscillator: () => createOscillator
});

//#endregion
//#region ../io/dist/src/midi/midi-fns.js
/**
* Sends a note on and note off
* @param port
* @param channel
* @param note
* @param velocity
* @param duration
* @param delay
*/
const sendNote = (port, channel, note, velocity, duration = 200, delay) => {
	const noteOn = {
		channel,
		note,
		velocity,
		command: `noteon`
	};
	const noteOff = {
		channel,
		note,
		velocity: 0,
		command: `noteoff`
	};
	port.send(pack(noteOn), delay);
	port.send(pack(noteOff), window.performance.now() + duration);
};
/**
* Parses MIDI data from an array into a MidiMessage
*
* ```js
* function onMidiMessage(event: MIDIMessageEvent) {
*  const msg = unpack(event.data);
*  // { command, channel, note, velocity }
* }
*
* // Where 'input' is a MIDIInput
* input.addEventListener(`midimessage`, onMidiMessage);
* ```
* @param data
* @returns
*/
const unpack = (data) => {
	let command;
	const first = data[0];
	const second = data[1];
	const third = data[2];
	let channel = 0;
	if (first >= 144 && first <= 159) {
		channel = first - 143;
		command = third === 0 ? `noteoff` : `noteon`;
	} else if (first >= 128 && first <= 143) {
		channel = first - 127;
		command = `noteoff`;
	} else if (first >= 160 && first <= 175) {
		channel = first - 159;
		command = `poly-at`;
	} else if (first >= 176 && first <= 191) {
		channel = first - 175;
		command = `cc`;
	} else if (first >= 192 && first <= 207) {
		channel = first - 191;
		command = `progchange`;
	} else if (first >= 208 && first <= 223) {
		channel = first - 207;
		command = `at`;
	} else if (first >= 224 && first <= 239) {
		channel = first - 223;
		command = `pitchbend`;
	}
	if (command === void 0) throw new Error(`Unknown command: '${command}'`);
	else return {
		command,
		note: second,
		velocity: third,
		channel
	};
};
/**
* Packs a MidiMessage into an array for sending to a MIDIOutput.
*
* ```js
* const msg: Midi.MidiMessage = {
*  command: `cc`,
*  channel: 1,
*  velocity: 50,
*  note: 40
* }
*
* // Where 'output' is a MIDIOutput
* output.send(pack(msg));
* ```
* @param message
* @returns
*/
const pack = (message) => {
	const data = new Uint8Array(3);
	data[1] = message.note;
	data[2] = message.velocity;
	switch (message.command) {
		case `cc`:
			data[0] = message.channel + 175;
			break;
		case `noteon`:
			data[0] = message.channel + 143;
			break;
		case `noteoff`:
			data[0] = message.channel + 127;
			break;
		case `pitchbend`:
			data[0] = message.channel + 223;
			break;
		case `poly-at`:
			data[0] = message.channel + 159;
			break;
		case `progchange`:
			data[0] = message.channel + 191;
			break;
		case `at`:
			data[0] = message.channel + 207;
			break;
		default: throw new Error(`Command not supported '${message.command}'`);
	}
	return data;
};

//#endregion
//#region ../io/dist/src/midi/notes.js
const notesRaw = `0	C-1	8.176
1	C#-1	8.662
2	D-1	9.177
3	D#-1	9.723
4	E-1	10.301
5	F-1	10.913
6	F#-1	11.562
7	G-1	12.250
8	G#-1	12.978
9	A-1	13.750
10	A#-1	14.568
11	B-1	15.434
12	C0	16.352
13	C#0	17.324
14	D0	18.354
15	D#0	19.445
16	E0	20.602
17	F0	21.827
18	F#0	23.125
19	G0	24.500
20	G#0	25.957
21	A0	27.500
22	A#0	29.135
23	B0	30.868
24	C1	32.703
25	C#1	34.648
26	D1	36.708
27	D#1	38.891
28	E1	41.203
29	F1	43.654
30	F#1	46.249
31	G1	48.999
32	G#1	51.913
33	A1	55.000
34	A#1	58.270
35	B1	61.735
36	C2	65.406
37	C#2	69.296
38	D2	73.416
39	D#2	77.782
40	E2	82.407
41	F2	87.307
42	F#2	92.499
43	G2	97.999
44	G#2	103.826
45	A2	110.000
46	A#2	116.541
47	B2	123.471
48	C3	130.813
49	C#3	138.591
50	D3	146.832
51	D#3	155.563
52	E3	164.814
53	F3	174.614
54	F#3	184.997
55	G3	195.998
56	G#3	207.652
57	A3	220.000
58	A#3	233.082
59	B3	246.942
60	C4	261.626
61	C#4	277.183
62	D4	293.665
63	D#4	311.127
64	E4	329.628
65	F4	349.228
66	F#4	369.994
67	G4	391.995
68	G#4	415.305
69	A4	440.000
70	A#4	466.164
71	B4	493.883
72	C5	523.251
73	C#5	554.365
74	D5	587.330
75	D#5	622.254
76	E5	659.255
77	F5	698.456
78	F#5	739.989
79	G5	783.991
80	G#5	830.609
81	A5	880.000
82	A#5	932.328
83	B5	987.767
84	C6	1046.502
85	C#6	1108.731
86	D6	1174.659
87	D#6	1244.508
88	E6	1318.510
89	F6	1396.913
90	F#6	1479.978
91	G6	1567.982
92	G#6	1661.219
93	A6	1760.000
94	A#6	1864.655
95	B6	1975.533
96	C7	2093.005
97	C#7	2217.461
98	D7	2349.318
99	D#7	2489.016
100	E7	2637.020
101	F7	2793.826
102	F#7	2959.955
103	G7	3135.963
104	G#7	3322.438
105	A7	3520.000
106	A#7	3729.310
107	B7	3951.066
108	C8	4186.009
109	C#8	4434.922
110	D8	4698.636
111	D#8	4978.032
112	E8	5274.041
113	F8	5587.652
114	F#8	5919.911
115	G8	6271.927
116	G#8	6644.875
117	A8	7040.000
118	A#8	7458.620
119	B8	7902.133
120	C9	8372.018
121	C#9	8869.844
122	D9	9397.273
123	D#9	9956.063
124	E9	10548.080
125	F9	11175.300
126	F#9	11839.820
127	G9	12543.850`;
const notesParsed = [];
const getParsedNotes = () => {
	if (notesParsed.length > 0) return notesParsed;
	const lines = notesRaw.split("\n");
	for (const line of lines) {
		const s = line.split(`\t`);
		if (s.length !== 3) {
			console.warn(`Expected three elements, got ${s.length}. Line:`, s);
			continue;
		}
		notesParsed.push([
			Number.parseInt(s[0]),
			s[1].toUpperCase(),
			Number.parseFloat(s[2])
		]);
	}
	return notesParsed;
};
const noteNameToNumber = (name) => {
	const notes = getParsedNotes();
	name = name.toUpperCase();
	const n = notes.find((n$1) => n$1[1] === name);
	if (n) return n[0];
	return NaN;
};
const noteNameToFrequency = (name) => {
	const notes = getParsedNotes();
	name = name.toUpperCase();
	const n = notes.find((n$1) => n$1[1] === name);
	if (n) return n[2];
	return NaN;
};
const noteNumberToName = (number$1) => {
	const notes = getParsedNotes();
	const n = notes.find((n$1) => n$1[0] === number$1);
	if (n) return n[1];
	return ``;
};
const noteNumberToFrequency = (number$1) => {
	const notes = getParsedNotes();
	const n = notes.find((n$1) => n$1[0] === number$1);
	if (n) return n[2];
	return NaN;
};

//#endregion
//#region ../io/dist/src/midi/manager.js
/**
* Midi Manager makes simplifies connecting to ports
* and having omni input/output
*
* ```js
* const midi = new MidiManager(); // By default connects to all ins and outs
* midi.addEventListener(`message`, event => {
*  // Do something with received MIDI data from any input
* })
*
* midi.scan();
* midi.send({ command: `cc`, note: 10, channel: 1, velocity: 20 });
*
* // Sends note '10' on channel 1, velocity 100, duration 200ms
* midi.sendNote(1, 10, 100, 200);
* ```
* Events:
* * open/close: Connected port is open/closed
* * deviceConnected/deviceDisconnected: A port is newly available or unavailable
* * message: MIDI event received
*/
var MidiManager = class extends SimpleEventEmitter {
	verbose = true;
	#state;
	#access;
	#inUse = [];
	#known = [];
	#omniInput = true;
	#omniOutput = true;
	#connectAllInputsDebounced = debounce(() => this.#connectAllInputs(), 1e3);
	#connectAllOutputsDebounced = debounce(() => this.#connectAllOutputs(), 1e3);
	constructor() {
		super();
		this.#state = {
			initialised: false,
			errorReason: ``
		};
		this.#throwIfNotSupported();
	}
	*getInUse() {
		for (const p of this.#inUse) yield p;
	}
	*getInUseInput() {
		for (const p of this.#inUse) if (p.type === `input`) yield p;
	}
	*getInUseOutput() {
		for (const p of this.#inUse) if (p.type === `output`) yield p;
	}
	*known() {
		for (const p of this.#known) yield p;
	}
	*knownInput() {
		for (const p of this.#known) if (p.type === `input`) yield p;
	}
	*knownOutput() {
		for (const p of this.#known) if (p.type === `output`) yield p;
	}
	async scan() {
		await this.#init();
		const a = this.#access;
		if (!a) return;
		for (const [_name, port] of a.inputs) this.#updatePort(port);
		for (const [_name, port] of a.outputs) this.#updatePort(port);
		if (this.#omniInput) this.#connectAllInputsDebounced();
		if (this.#omniOutput) this.#connectAllOutputsDebounced();
	}
	/**
	* Sends a message to a port.
	*
	* If port is omitted, all open output ports are used.
	* @param message
	* @param port
	* @param timestamp
	*/
	send(message, port, timestamp) {
		const packed = pack(message);
		if (typeof port === `undefined`) {
			for (const p of this.#inUse) if (p.type === `output`) p.send(packed, timestamp);
		} else port.send(packed, timestamp);
	}
	sendNote(channel, note, velocity, duration, delay, port) {
		if (port === void 0) for (const port$1 of this.getInUseOutput()) this.sendNote(channel, note, velocity, duration, delay, port$1);
		else sendNote(port, channel, note, velocity, duration, delay);
	}
	#updatePort(p) {
		if (p.state === `connected`) {
			this.#onPortConnected(p);
			if (p.connection === `open`) this.#onPortOpen(p);
		} else if (p.state === `disconnected`) this.#onPortDisconnected(p);
	}
	#onMessage = (event$1) => {
		const raw = event$1.data;
		const port = event$1.currentTarget;
		if (!raw) return;
		const data = unpack(raw);
		if (data.command === `noteoff` || data.command === `noteon`) {
			this.fireEvent(`message`, {
				...data,
				port,
				raw,
				frequency: noteNumberToFrequency(data.note),
				noteName: noteNumberToName(data.note)
			});
			return;
		}
		this.fireEvent(`message`, {
			...data,
			port,
			raw
		});
	};
	#onPortOpen(port) {
		const inUse = this.#inUse.find((p) => p.id === port.id);
		this.#logVerbose(`onPortOpen: id: ${port.id} name: ${port.name} (${port.type})`);
		if (inUse) {
			this.#logVerbose(`-- bug, port already in use?`);
			return;
		}
		this.#onPortConnected(port);
		if (port.type === `input`) port.addEventListener(`midimessage`, this.#onMessage);
		this.#inUse = [...this.#inUse, port];
		this.fireEvent(`open`, { port });
	}
	#onPortClose(port) {
		const inUse = this.#inUse.find((p) => p.id === port.id);
		if (!inUse) return;
		if (port.type === `input`) port.removeEventListener(`midimessage`, this.#onMessage);
		this.#inUse = this.#inUse.filter((p) => p.id !== port.id);
		this.fireEvent(`close`, { port });
	}
	/**
	* New device connected, but not necessarily open
	* @param port
	*/
	#onPortConnected(port) {
		const known = this.#known.find((p) => p.id === port.id);
		if (known) return;
		this.#known = [...this.#known, port];
		this.fireEvent(`deviceConnected`, { port });
	}
	/**
	* Device disconnected
	* @param port
	* @returns
	*/
	#onPortDisconnected(port) {
		const known = this.#known.find((p) => p.id === port.id);
		if (!known) return;
		this.#onPortClose(port);
		this.#known = this.#known.filter((p) => p.id !== port.id);
		this.fireEvent(`deviceDisconnected`, { port });
	}
	#isPortInUse(port) {
		return this.#inUse.find((p) => p.id === port.id) !== void 0;
	}
	async closeAll(what = `both`) {
		for (const p of this.#inUse) {
			if (p.type == `input` && (what === `both` || what === `input`)) await p.close();
			if (p.type == `output` && (what === `both` || what === `output`)) await p.close();
		}
	}
	async setOmniInput(value) {
		this.#omniInput = value;
		await this.closeAll(`input`);
		if (value) await this.#connectAllInputs();
	}
	get omniInput() {
		return this.#omniInput;
	}
	async setOmniOutput(value) {
		this.#omniOutput = value;
		await this.closeAll(`output`);
		if (value) await this.#connectAllOutputs();
	}
	get omniOutput() {
		return this.#omniOutput;
	}
	async #connectAllInputs() {
		const a = this.#access;
		if (!a) return;
		for (const [_name, input] of a.inputs) if (input.connection === `closed`) {
			if (this.#isPortInUse(input)) throw new Error(`Bug: Input closed, but inUse?`);
			await input.open();
		}
	}
	async #connectAllOutputs() {
		const a = this.#access;
		if (!a) return;
		for (const [_name, output] of a.outputs) if (output.connection === `closed`) {
			if (this.#isPortInUse(output)) throw new Error(`Bug: Output closed, but inUse?`);
			await output.open();
		}
	}
	dumpToStringLines() {
		const returnValue = [];
		const portToString = (p) => ` -  ${p.name} (${p.type}) state: ${p.state} conn: ${p.connection} id: ${p.id}`;
		returnValue.push(`MidiManager`);
		returnValue.push(`In Use:`);
		returnValue.push(...mapWithEmptyFallback(this.#inUse, portToString, `  (none)`));
		returnValue.push(`Known:`);
		returnValue.push(...mapWithEmptyFallback(this.#known, portToString, `  (none)`));
		return returnValue;
	}
	#onStateChange(event$1) {
		const port = event$1.port;
		if (port === null) return;
		if (port.state === `connected`) {
			if (port.connection === `open`) this.#onPortOpen(port);
			else if (port.connection === `closed`) {
				this.#onPortClose(port);
				this.#onPortConnected(port);
				if (this.#omniInput && port.type === `input`) this.#connectAllInputsDebounced();
				else if (this.#omniOutput && port.type === `output`) this.#connectAllOutputsDebounced();
			}
		} else if (port.state === `disconnected`) this.#onPortDisconnected(port);
	}
	/**
	* Opens `port`.
	*
	* If `exclusive` is _true_, all other ports of that type
	* (ie. input or output) are closed before the port is opened.
	*
	* If `exclusive` is _false_ (default), already open ports are left open.
	* @param port
	* @param exclusive
	*/
	async open(port, exclusive = false) {
		if (exclusive) {
			if (port.type === `input`) await this.closeAll(`input`);
			else if (port.type === `output`) await this.closeAll(`output`);
		}
		const p = port.open();
	}
	#logVerbose(message) {
		if (!this.verbose) return;
		console.log(`MIDI`, message);
	}
	#setState(state) {
		this.#state = {
			...this.#state,
			...state
		};
		this.#logVerbose(`State change: ${JSON.stringify(this.#state)}`);
	}
	async #init() {
		if (this.#state.initialised && this.#access !== void 0) return;
		const q = await navigator.permissions.query({
			name: "midi",
			software: true,
			sysex: false
		});
		if (q.state === `denied`) {
			this.#access = void 0;
			this.#setState({
				initialised: false,
				errorReason: `Permission denied`
			});
			return;
		}
		this.#access = await navigator.requestMIDIAccess({
			software: true,
			sysex: false
		});
		this.#access.addEventListener(`statechange`, (event$1) => {
			this.#onStateChange(event$1);
		});
		this.#setState({
			initialised: true,
			errorReason: ``
		});
	}
	#isSupported() {
		if (!navigator.requestMIDIAccess) return false;
		return true;
	}
	#throwIfNotSupported() {
		if (!window.isSecureContext) throw new Error(`Code is not running in a secure context. Load it via https`);
		if (!this.#isSupported()) throw new Error(`MIDI not supported in this browser`);
	}
	findKnownPort(fn) {
		return this.#known.find(fn);
	}
	*filterKnownPort(fn) {
		yield* this.#known.filter(fn);
	}
	findInUsePort(fn) {
		return this.#inUse.find(fn);
	}
	*filterInUsePort(fn) {
		yield* this.#inUse.filter(fn);
	}
};

//#endregion
//#region ../io/dist/src/midi/control.js
var Feedback = class {
	channel = 0;
	cc = -1;
	note = -1;
	output;
	portName;
	constructor(options = {}) {
		this.channel = options.channel ?? -1;
		this.cc = options.cc ?? -1;
		this.note = options.note ?? -1;
		this.output = options.output;
		this.portName = options.portName;
	}
	setOutputPort(port) {
		if (port.type === `input`) return false;
		if (this.portName !== void 0) {
			if (port.name !== port.name) return false;
		}
		this.output = port;
		return true;
	}
	sendRaw(value) {
		if (!this.output) return false;
		if (this.channel < 0) return false;
		if (this.cc < 0 && this.note < 0) return false;
		let message;
		if (this.cc >= 0) {
			message = {
				channel: this.channel,
				command: `cc`,
				note: this.cc,
				velocity: value
			};
			console.log(message);
			this.output.send(pack(message));
			return true;
		}
		console.log(`sendNote: ch: ${this.channel} note: ${this.note} vel: ${value}`);
		sendNote(this.output, this.channel, this.note, value, 200);
		return true;
	}
};
var Control = class Control extends SimpleEventEmitter {
	static controlCount = 0;
	inputChannel = 1;
	inputCommand = `cc`;
	inputNote = -1;
	inputVelocityScale = [0, 127];
	feedbackChannel = 1;
	feedbackCommand = `cc`;
	feedbackNote = -1;
	feedbackVelocity = 1;
	name = `Control-${Control.controlCount++}`;
	lastMessage;
	onInputMessage(message) {
		if (this.inputChannel >= 0 && message.channel !== this.inputChannel) return false;
		if (this.inputNote >= 0 && message.note !== this.inputNote) return false;
		if (this.inputCommand !== void 0 && message.command !== this.inputCommand) return false;
		this.lastMessage = message;
		this.fireEvent(`change`, {
			velocity: message.velocity,
			velocityScaled: this.#scaleVelocity(message.velocity),
			control: this
		});
		return true;
	}
	#scaleVelocity(v) {
		return scale(v, this.inputVelocityScale[0], this.inputVelocityScale[1]);
	}
	get scaledVelocity() {
		if (this.lastMessage) return this.#scaleVelocity(this.lastMessage.velocity);
		return NaN;
	}
};

//#endregion
//#region ../io/dist/src/midi/midi-fighter.js
/**
* Connects to a DJ Tech Tools Midi Fighter controller.
*
* Use the 'state' event and wait for state to be 'ready'.
*
* ```js
* const mf = new MidiFighter();
* mf.addEventListener(`state`, event => {
*  if (event.state === `ready`) {
*    // Can work with device now
*    mf.bank = 1;
*  }
* });
* mf.addEventListener(`encoder`, event => {
*  // Do something with encoder value
* });
* mf.setPort(someMidiInputPort);
* mf.setPort(someMidiOutputPort);
* ```
* Assumes default settings are loaded on the controller
*
* Supports
* * Listening for encoder moves and button presses
* * Changing colour pip below each encoder
* * Setting LED bar for each encoder
* * Changing banks, or detecting when the user has done so via the physical buttons
*
* Events:
* * bankChange: Current bank has changed
* * sideButton: Side button pressed
* * switch: Encoder has been pressed
* * encoder: Encoder has been moved
* * state: Midi Fighter has both input/output ports or not.
*/
var MidiFighter = class extends SimpleEventEmitter {
	encoders = [];
	#currentBank = -1;
	#state = `disconnected`;
	#inputPort;
	#outputPort;
	/**
	* If true, messages sent to Midi Fighter are printed to console
	*/
	logOutgoing = false;
	/**
	* Channel bank change events are received on
	*/
	bankChangeChannel = 4;
	/**
	* Channel side button press events are received on
	*/
	sideButtonChannel = 4;
	constructor() {
		super();
		for (let bank = 1; bank < 5; bank++) for (let encoder = 1; encoder < 17; encoder++) {
			const enc = new MidiFighterEncoder(this, {
				bank,
				encoder
			});
			this.encoders.push(enc);
			enc.addEventListener(`encoder`, (event$1) => {
				this.fireEvent(`encoder`, event$1);
			});
			enc.addEventListener(`switch`, (event$1) => {
				this.fireEvent(`switch`, event$1);
			});
		}
	}
	/**
	* Our input/output port has changed state
	* @param event
	* @returns
	*/
	#onPortState = (event$1) => {
		const port = event$1.port;
		if (!port) return;
		if (port === this.#outputPort && (port.state === `disconnected` || port.connection === `closed`)) this.#outputPortUnbind();
		if (port === this.#inputPort && (port.state === `disconnected` || port.connection === `closed`)) this.#inputPortUnbind();
		if (this.#outputPort !== void 0 && this.#inputPort !== void 0) this.#setState(`ready`);
		else this.#setState(`disconnected`);
	};
	/**
	* Unsubscribe from events of current input port, if we have one
	*/
	#inputPortUnbind() {
		const ip = this.#inputPort;
		if (ip !== void 0) {
			ip.removeEventListener(`statechange`, this.#onPortState);
			ip.removeEventListener(`midimessage`, this.#onMessage);
		}
		this.#inputPort = void 0;
	}
	/**
	* Unsubcribe from events of current output port, if we have one
	*/
	#outputPortUnbind() {
		const op = this.#outputPort;
		if (op !== void 0) op.removeEventListener(`statechange`, this.#onPortState);
		this.#outputPort = void 0;
	}
	/**
	* Sets a port for this instance to use.
	* This will need to be called separately for the input and output ports
	* @param port
	*/
	setPort(port) {
		if (port.name === `Midi Fighter Twister`) {
			if (port.type === `output`) {
				this.#outputPortUnbind();
				this.#outputPort = port;
				if (this.#outputPort !== void 0) this.#outputPort.addEventListener(`statechange`, this.#onPortState);
			} else if (port.type === `input`) {
				this.#inputPortUnbind();
				this.#inputPort = port;
				if (port !== void 0) {
					this.#inputPort.addEventListener(`midimessage`, this.#onMessage);
					this.#inputPort.addEventListener(`statechange`, this.#onPortState);
				}
			}
		}
		if (this.#outputPort !== void 0 && this.#inputPort !== void 0) this.#setState(`ready`);
	}
	#setState(state) {
		const previous = this.#state;
		if (previous === state) return;
		this.#state = state;
		this.fireEvent(`state`, {
			previous,
			state,
			mf: this
		});
	}
	#onMessage = (event$1) => {
		const data = event$1.data;
		if (!data) return;
		const message = unpack(data);
		if (message.channel === this.bankChangeChannel) {
			if (message.command === `cc` && message.note < 4) {
				this.#onBankChange(message.note + 1, false);
				return;
			}
		}
		if (message.channel === this.sideButtonChannel && message.command == `cc`) {
			let buttonBank = -1;
			let position;
			let side;
			if (message.note === 8) {
				buttonBank = 1;
				position = `top`;
				side = `left`;
			} else if (message.note === 10) {
				buttonBank = 1;
				side = `left`;
				position = `bottom`;
			} else if (message.note === 11) {
				buttonBank = 1;
				side = `right`;
				position = `top`;
			} else if (message.note === 13) {
				buttonBank = 1;
				side = `right`;
				position = `bottom`;
			} else if (message.note === 14) {
				buttonBank = 2;
				side = `left`;
				position = `top`;
			} else if (message.note === 16) {
				buttonBank = 2;
				side = `left`;
				position = `bottom`;
			} else if (message.note === 17) {
				buttonBank = 2;
				side = `right`;
				position = `top`;
			} else if (message.note === 19) {
				buttonBank = 2;
				side = `right`;
				position = `bottom`;
			} else if (message.note === 20) {
				buttonBank = 3;
				position = `top`;
				side = `left`;
			} else if (message.note === 22) {
				buttonBank = 3;
				position = `bottom`;
				side = `left`;
			} else if (message.note === 23) {
				buttonBank = 3;
				position = `top`;
				side = `right`;
			} else if (message.note == 25) {
				buttonBank = 3;
				position = `bottom`;
				side = `right`;
			} else if (message.note == 26) {
				buttonBank = 4;
				position = `top`;
				side = `left`;
			} else if (message.note == 28) {
				buttonBank = 4;
				position = `bottom`;
				side = `left`;
			} else if (message.note == 29) {
				buttonBank = 4;
				position = `top`;
				side = `right`;
			} else if (message.note == 31) {
				buttonBank = 4;
				position = `bottom`;
				side = `right`;
			}
			if (position !== void 0 && side !== void 0) {
				if (buttonBank !== this.#currentBank) this.#onBankChange(buttonBank, true);
				this.fireEvent(`sideButton`, {
					bank: buttonBank,
					position,
					side,
					mf: this
				});
				return;
			}
		}
		for (const enc of this.encoders) {
			if (enc.inputEncoderChannel === message.channel && enc.inputEncoderNoteOrCc === message.note) {
				enc.onValueSet(message.velocity);
				return;
			}
			if (enc.inputSwitchChannel === message.channel && enc.inputSwitchNoteOrCc === message.note) {
				enc.onSwitchSet(message.velocity);
				return;
			}
		}
	};
	/**
	* When bank has changed
	* @param bank
	* @param implicit
	*/
	#onBankChange(bank, implicit) {
		const previousBank = this.#currentBank;
		this.#currentBank = bank;
		if (previousBank !== bank) this.fireEvent(`bankChange`, {
			prev: previousBank,
			current: this.#currentBank,
			mf: this,
			implicit
		});
	}
	/**
	* Sets the current bank (1..4)
	*
	* Triggers `bankChange` event.
	*/
	set bank(bank) {
		if (bank < 1 || bank > 4) throw new Error(`Bank must be 1-4`);
		if (!this.#outputPort) return;
		sendNote(this.#outputPort, this.bankChangeChannel, bank - 1, 127, 100);
		this.#onBankChange(bank, false);
	}
	/**
	* Gets the current bank number (1-4)
	*/
	get bank() {
		return this.#currentBank;
	}
	/**
	* Yields all encooders within the specified bank number.
	* If no bank number is given, current bank is used
	* @param bank
	*/
	*getBank(bank) {
		if (typeof bank === `undefined`) bank = this.#currentBank;
		if (bank < 1 || bank > 4) throw new Error(`Bank out of range, expected 1-4`);
		for (const enc of this.encoders) if (enc.bank === bank) yield enc;
	}
	/**
	* Gets an encoder by its index and bank. If no bank is specified,
	* the current is used.
	*
	* ```js
	* mf.getEncoder(4);    // Get encoder #4 on current bank
	* mf.getEncoder(4, 2); // Get encoder #4 from bank #2
	* ```
	* @param encoder Encoder number (1..16)
	* @param bank Bank number (1..4)
	* @returns Encoder
	*/
	getEncoder(encoder, bank) {
		if (typeof bank === `undefined`) bank = this.#currentBank;
		if (bank < 1 || bank > 4) throw new Error(`Bank out of range, expected 1-4. Got: ${bank}`);
		if (encoder < 1 || encoder > 16) throw new Error(`Encoder out of range, expected 1-16`);
		return this.encoders.find((enc) => enc.bank === bank && enc.encoder === encoder);
	}
	/**
	* Sends a message to the output port associated with this instance.
	* If there's no output port, message is dropped and _false_ returned.
	* @param message
	*/
	send(message) {
		if (this.#outputPort) {
			if (this.logOutgoing) console.log(`MF send: ${JSON.stringify(message)}`);
			this.#outputPort.send(pack(message));
			return true;
		}
		return false;
	}
	/**
	* Gets the current output port
	*/
	get outputPort() {
		return this.#outputPort;
	}
	/**
	* Gets the current input port
	*/
	get inputPort() {
		return this.#inputPort;
	}
	/**
	* Returns the current state
	*/
	get state() {
		return this.#state;
	}
};
/**
* Represents a single encoder.
*/
var MidiFighterEncoder = class extends SimpleEventEmitter {
	mf;
	/**
	* Bank (1..4) of encoder
	*/
	bank;
	/**
	* Encoder index (1..16)
	*/
	encoder;
	/**
	* Note/CC for received encoder values
	*/
	inputEncoderNoteOrCc;
	/**
	* Midi channel for received encoder values
	*/
	inputEncoderChannel;
	/**
	* Midi channel for received switch values
	*/
	inputSwitchChannel;
	/**
	* Note/CC for received switch values
	*/
	inputSwitchNoteOrCc;
	/**
	* Channel to change LED effect (eg strobe)
	*/
	ledEffectChannel = 3;
	/**
	* Channel to change LED colour
	*/
	ledColourChannel = 2;
	/**
	* Channel to change LED ring value
	*/
	ledRingChannel = 1;
	/**
	* Note for this encoder.
	*/
	encoderStaticNote = 0;
	/**
	* The last encoder value received
	*/
	lastEncoderValue = -1;
	/**
	* The last switch value received
	*/
	lastSwitchValue = -1;
	/**
	* Do not create yourself. Access via a {@link MidiFighter} instance.
	* @private
	* @param mf
	* @param options
	*/
	constructor(mf, options) {
		super();
		this.mf = mf;
		const bank = options.bank;
		const encoder = options.encoder;
		if (bank < 0 || bank > 4) throw new Error(`Expected bank value 1-4. Got: ${bank}`);
		if (encoder < 0 || encoder > 16) throw new Error(`Expected encoder number 1-16. Got: ${encoder}`);
		const bankOffset = (bank - 1) * 16;
		this.encoderStaticNote = encoder - 1 + bankOffset;
		this.inputEncoderChannel = 1;
		this.inputEncoderNoteOrCc = this.encoderStaticNote;
		this.inputSwitchChannel = 2;
		this.inputSwitchNoteOrCc = this.encoderStaticNote;
		this.bank = bank;
		this.encoder = encoder;
	}
	/**
	* Called by a {@link MidiFighter} instance when a value is received associated with this encoder.
	* Do not call directly
	* @private
	* @param value
	*/
	onValueSet(value) {
		const lastValue = this.lastEncoderValue;
		this.lastEncoderValue = value;
		this.fireEvent(`encoder`, {
			previous: lastValue,
			value,
			encoder: this
		});
	}
	/**
	* Called by a {@link MidiFighter} instance when the switch value for this encoder changes
	* @private
	* @param value
	*/
	onSwitchSet(value) {
		const lastValue = this.lastSwitchValue;
		this.lastSwitchValue = value;
		this.fireEvent(`switch`, {
			previous: lastValue,
			value,
			encoder: this
		});
	}
	/**
	* Set a scalar LED ring value (0..1).
	*
	* ```js
	* encoder.setLedRing(0.5); // Set to 50%
	* ```
	* Use {@link setLedRingRaw} to set 0..127 integer value
	* @param v Scalar (0..1)
	*/
	setLedRing(v) {
		this.setLedRingRaw(clamp(Math.floor(v * 127)));
	}
	/**
	* Sets the raw (0..127) value for the LED ring feedback. Use {@link setLedRing} for scalar values (0..1)
	*
	* ```js
	* encoder.setLedRingRaw(50);
	* ```
	*
	* @param v Raw value (0..127)
	*/
	setLedRingRaw(v) {
		if (v < 0 || v > 127) throw new Error(`Param 'v' should be between 0-127`);
		const message = {
			channel: this.ledRingChannel,
			command: `cc`,
			note: this.encoderStaticNote,
			velocity: v
		};
		this.mf.send(message);
	}
	/**
	* Sets the switch colour based on a 0..1 standard hue degree
	* ```js
	* const hsl = Colour.HslSpace.fromCss(`orange`);
	* encoder.setSwitchColourHue(hsl.hue);
	* ```
	* @param v Hue degree (0..1) range
	*/
	setSwitchColourHue(v) {
		if (v < 0 || v > 1) throw new Error(`Param 'v' should be in 0-1 range`);
		let vv = 1 - v + .7;
		if (vv > 1) vv = vv - 1;
		const velo = Math.floor(vv * 127);
		this.setSwitchColourRaw(velo);
	}
	/**
	* Set the switch colour based on 0..127 Midi Fighter range (start/end in blue).
	* Use {@link setSwitchColourHue} to set colour based on hue angle instead
	*
	* See page 4 of the MF manual.
	* @param v
	* @returns
	*/
	setSwitchColourRaw(v) {
		if (v < 0 || v > 127) throw new Error(`Param 'v' should be between 0-127`);
		const message = {
			channel: this.ledColourChannel,
			command: `cc`,
			note: this.encoderStaticNote,
			velocity: v
		};
		this.mf.send(message);
	}
	/**
	* Set the effect of the colour pip
	* ```js
	* encoder.setSwitchEffect(`strobe`, 3);
	* ```
	* @param kind
	* @param value
	*/
	setSwitchEffect(kind, value = 1) {
		let velocity = 0;
		if (kind === `rainbow`) velocity = 127;
		else if (kind === `pulse`) {
			if (value < 1 || value > 7) throw new Error(`Pulse effect expects a value 1-7`);
			velocity = 9 + value;
		} else if (kind === `strobe`) {
			if (value < 1 || value > 8) throw new Error(`Strobe effect expects a value 1-8`);
			velocity = value;
		} else if (kind === `none`) velocity = 0;
		else throw new Error(`Unknown kind: '${kind}'`);
		const message = {
			channel: this.ledEffectChannel,
			command: `cc`,
			note: this.encoderStaticNote,
			velocity
		};
		this.mf.send(message);
	}
};

//#endregion
//#region ../io/dist/src/midi/index.js
var midi_exports = {};
__export(midi_exports, {
	Control: () => Control,
	Feedback: () => Feedback,
	MidiFighter: () => MidiFighter,
	MidiFighterEncoder: () => MidiFighterEncoder,
	MidiManager: () => MidiManager,
	getParsedNotes: () => getParsedNotes,
	noteNameToFrequency: () => noteNameToFrequency,
	noteNameToNumber: () => noteNameToNumber,
	noteNumberToFrequency: () => noteNumberToFrequency,
	noteNumberToName: () => noteNumberToName,
	pack: () => pack,
	sendNote: () => sendNote,
	unpack: () => unpack
});

//#endregion
//#region ../io/dist/src/espruino-ble-device.js
/**
* An Espruino BLE-connection
*
* See [online demos](https://demos.ixfx.fun/io/)
*
* Use the `puck` function to initialise and connect to a Puck.js.
* It must be called in a UI event handler for browser security reasons.
*
* ```js
* const e = await Espruino.puck();
* ```
*
* To connect to a particular device:
*
* ```js
* const e = await Espruino.puck({name:`Puck.js a123`});
* ```
*
* Listen for events:
* ```js
* // Received something
* e.addEventListener(`data`, d => console.log(d.data));
* // Monitor connection state
* e.addEventListener(`change`, c => console.log(`${d.priorState} -> ${d.newState}`));
* ```
*
* Write to the device (note the \n for a new line at the end of the string). This will
* execute the code on the Espruino.
*
* ```js
* e.write(`digitalPulse(LED1,1,[10,500,10,500,10]);\n`);
* ```
*
* Run some code and return result:
* ```js
* const result = await e.eval(`2+2\n`);
* ```
*/
var EspruinoBleDevice = class extends NordicBleDevice {
	evalTimeoutMs;
	evalReplyBluetooth = true;
	/**
	* Creates instance. You probably would rather use {@link puck} to create.
	* @param device
	* @param opts
	*/
	constructor(device, opts = {}) {
		super(device, opts);
		this.evalTimeoutMs = opts.evalTimeoutMs ?? 5 * 1e3;
	}
	/**
	* Writes a script to Espruino.
	*
	* It will first send a CTRL+C to cancel any previous input, `reset()` to clear the board,
	* and then the provided `code` followed by a new line.
	*
	* Use {@link eval} instead to execute remote code and get the result back.
	*
	* ```js
	* // Eg from https://www.espruino.com/Web+Bluetooth
	* writeScript(`
	*  setInterval(() => Bluetooth.println(E.getTemperature()), 1000);
	*  NRF.on('disconnect',()=>reset());
	* `);
	* ```
	*
	* @param code Code to send. A new line is added automatically.
	*/
	async writeScript(code) {
		this.write(`\u0003\u0010reset();\n`);
		this.write(`\u0010${code}\n`);
	}
	/**
	* Sends some code to be executed on the Espruino. The result
	* is packaged into JSON and sent back to your code. An exception is
	* thrown if code can't be executed for some reason.
	*
	* ```js
	* const sum = await e.eval(`2+2`);
	* ```
	*
	* It will wait for a period of time for a well-formed response from the
	* Espruino. This might not happen if there is a connection problem
	* or a syntax error in the code being evaled. In cases like the latter,
	* it will take up to `timeoutMs` (default 5 seconds) before we give up
	* waiting for a correct response and throw an error.
	*
	* Tweaking of the timeout may be required if `eval()` is giving up too quickly
	* or too slowly. A default timeout can be given when creating the class.
	*
	* Options:
	*  timeoutMs: Timeout for execution. 5 seconds by default
	*  assumeExclusive If true, eval assumes all replies from controller are in response to eval. True by default
	*  debug: If true, execution is traced via `warn` callback
	* @param code Code to run on the Espruino.
	* @param opts Options
	* @param warn Function to pass warning/trace messages to. If undefined, this.warn is used, printing to console.
	*/
	async eval(code, opts = {}, warn) {
		const debug = opts.debug ?? false;
		const warnCallback = warn ?? ((m) => {
			this.warn(m);
		});
		return deviceEval(code, opts, this, `Bluetooth.println`, debug, warnCallback);
	}
};

//#endregion
//#region ../io/dist/src/json-device.js
var JsonDevice = class extends SimpleEventEmitter {
	states;
	codec;
	verboseLogging = false;
	name;
	connectAttempts;
	chunkSize;
	rxBuffer;
	txBuffer;
	constructor(config = {}) {
		super();
		this.verboseLogging = config.debug ?? false;
		this.chunkSize = config.chunkSize ?? 1024;
		this.connectAttempts = config.connectAttempts ?? 3;
		this.name = config.name ?? `JsonDevice`;
		this.txBuffer = new StringWriteBuffer(async (data) => {
			await this.writeInternal(data);
		}, config);
		this.rxBuffer = new StringReceiveBuffer((line) => {
			this.fireEvent(`data`, { data: line });
		});
		this.codec = new Codec();
		this.states = new StateMachineWithEvents(genericStateTransitionsInstance, { initial: `ready` });
		this.states.addEventListener(`change`, (event$1) => {
			this.fireEvent(`change`, event$1);
			this.verbose(`${event$1.priorState} -> ${event$1.newState}`);
			if (event$1.priorState === `connected`) {
				this.rxBuffer.clear();
				this.txBuffer.clear();
			}
		});
	}
	get isConnected() {
		return this.states.state === `connected`;
	}
	get isClosed() {
		return this.states.state === `closed`;
	}
	write(txt) {
		if (this.states.state !== `connected`) throw new Error(`Cannot write while state is ${this.states.state}`);
		this.txBuffer.add(txt);
	}
	async close() {
		if (this.states.state !== `connected`) return;
		this.onClosed();
	}
	async connect() {
		const attempts = this.connectAttempts;
		this.states.state = `connecting`;
		await this.onPreConnect();
		await retryFunction(async () => {
			await this.onConnectAttempt();
			this.states.state = `connected`;
			return true;
		}, {
			limitAttempts: attempts,
			startAt: 200
		});
	}
	onRx(event$1) {
		const view = event$1.target.value;
		if (view === void 0) return;
		let string_ = this.codec.fromBuffer(view.buffer);
		const plzStop = indexOfCharCode(string_, 19);
		const plzStart = indexOfCharCode(string_, 17);
		if (plzStart && plzStop < plzStart) {
			this.verbose(`Tx plz start`);
			string_ = omitChars(string_, plzStart, 1);
			this.txBuffer.paused = false;
		}
		if (plzStop && plzStop > plzStart) {
			this.verbose(`Tx plz stop`);
			string_ = omitChars(string_, plzStop, 1);
			this.txBuffer.paused = true;
		}
		this.rxBuffer.add(string_);
	}
	verbose(m) {
		if (this.verboseLogging) console.info(this.name, m);
	}
	log(m) {
		console.log(this.name, m);
	}
	warn(m) {
		console.warn(this.name, m);
	}
};

//#endregion
//#region ../io/dist/src/serial.js
var serial_exports = {};
__export(serial_exports, { Device: () => Device });
/**
* Serial device. Assumes data is sent with new line characters (\r\n) between messages.
*
* ```
* import { Serial } from '@ixfx/io.js'
* const s = new Serial.Device();
* s.addEventListener(`change`, evt => {
*  console.log(`State change ${evt.priorState} -> ${evt.newState}`);
*  if (evt.newState === `connected`) {
*    // Do something when connected...
*  }
* });
*
* // In a UI event handler...
* s.connect();
* ```
*
* Reading incoming data:
* ```
* // Parse incoming data as JSON
* s.addEventListener(`data`, evt => {
*  try {
*    const o = JSON.parse(evt.data);
*    // If we get this far, JSON is legit
*  } catch (ex) {
*  }
* });
* ```
*
* Writing to the microcontroller
* ```
* s.write(JSON.stringify({msg:"hello"}));
* ```
*/
var Device = class extends JsonDevice {
	config;
	port;
	tx;
	abort;
	baudRate;
	constructor(config = {}) {
		super(config);
		this.config = config;
		this.abort = new AbortController();
		const eol = config.eol ?? `\r\n`;
		this.baudRate = config.baudRate ?? 9600;
		if (config.name === void 0) this.name = `Serial.Device`;
		this.rxBuffer.separator = eol;
	}
	/**
	* Writes text collected in buffer
	* @param txt
	*/
	async writeInternal(txt) {
		if (this.tx === void 0) throw new Error(`tx not ready`);
		try {
			this.tx.write(txt);
		} catch (error) {
			this.warn(error);
		}
	}
	onClosed() {
		this.tx?.releaseLock();
		this.abort.abort(`closing port`);
		this.states.state = `closed`;
	}
	onPreConnect() {
		return Promise.resolve();
	}
	async onConnectAttempt() {
		let reqOpts = { filters: [] };
		const openOpts = { baudRate: this.baudRate };
		if (this.config.filters) reqOpts = { filters: [...this.config.filters] };
		this.port = await navigator.serial.requestPort(reqOpts);
		this.port.addEventListener(`disconnect`, (_) => {
			this.close();
		});
		await this.port.open(openOpts);
		const txW = this.port.writable;
		const txText = new TextEncoderStream();
		if (txW !== null) {
			txText.readable.pipeTo(txW, { signal: this.abort.signal }).catch((error) => {
				console.log(`Serial.onConnectAttempt txText pipe:`);
				console.log(error);
			});
			this.tx = txText.writable.getWriter();
		}
		const rxR = this.port.readable;
		const rxText = new TextDecoderStream();
		if (rxR !== null) {
			rxR.pipeTo(rxText.writable, { signal: this.abort.signal }).catch((error) => {
				console.log(`Serial.onConnectAttempt rxR pipe:`);
				console.log(error);
			});
			rxText.readable.pipeTo(this.rxBuffer.writable(), { signal: this.abort.signal }).catch((error) => {
				console.log(`Serial.onConnectAttempt rxText pipe:`);
				console.log(error);
				try {
					this.port?.close();
				} catch (error$1) {
					console.log(error$1);
				}
			});
		}
	}
};

//#endregion
//#region ../io/dist/src/espruino-serial-device.js
var EspruinoSerialDevice = class extends Device {
	evalTimeoutMs;
	evalReplyBluetooth = false;
	constructor(opts) {
		super(opts);
		if (opts === void 0) opts = {};
		this.evalTimeoutMs = opts.evalTimeoutMs ?? 5 * 1e3;
	}
	async disconnect() {
		return super.close();
	}
	/**
	* Writes a script to Espruino.
	*
	* It will first send a CTRL+C to cancel any previous input, `reset()` to clear the board,
	* and then the provided `code` followed by a new line.
	*
	* Use {@link eval} instead to execute remote code and get the result back.
	*
	* ```js
	* // Eg from https://www.espruino.com/Web+Bluetooth
	* writeScript(`
	*  setInterval(() => Bluetooth.println(E.getTemperature()), 1000);
	*  NRF.on('disconnect',()=>reset());
	* `);
	* ```
	*
	* @param code Code to send. A new line is added automatically.
	*/
	writeScript(code) {
		this.write(`\u0003\u0010reset();\n`);
		this.write(`\u0010${code}\n`);
	}
	/**
	* Sends some code to be executed on the Espruino. The result
	* is packaged into JSON and sent back to your code. An exception is
	* thrown if code can't be executed for some reason.
	*
	* ```js
	* const sum = await e.eval(`2+2`);
	* ```
	*
	* It will wait for a period of time for a well-formed response from the
	* Espruino. This might not happen if there is a connection problem
	* or a syntax error in the code being evaled. In cases like the latter,
	* it will take up to `timeoutMs` (default 5 seconds) before we give up
	* waiting for a correct response and throw an error.
	*
	* Tweaking of the timeout may be required if `eval()` is giving up too quickly
	* or too slowly. A default timeout can be given when creating the class.
	*
	* Options:
	*  timeoutMs: Timeout for execution. 5 seconds by default
	*  assumeExclusive: If true, eval assumes all replies from controller are in response to eval. True by default
	*  debug: If true, execution is traced via `warn` callback
	* @param code Code to run on the Espruino.
	* @param opts Options
	* @param warn Function to pass warning/trace messages to. If undefined, this.warn is used, printing to console.
	*/
	async eval(code, opts = {}, warn) {
		const debug = opts.debug ?? false;
		const warner = warn ?? ((m) => {
			this.warn(m);
		});
		return deviceEval(code, opts, this, `USB.println`, debug, warner);
	}
};

//#endregion
//#region ../io/dist/src/espruino.js
var espruino_exports = {};
__export(espruino_exports, {
	EspruinoBleDevice: () => EspruinoBleDevice,
	EspruinoSerialDevice: () => EspruinoSerialDevice,
	bangle: () => bangle,
	connectBle: () => connectBle,
	deviceEval: () => deviceEval,
	puck: () => puck,
	serial: () => serial
});
/**
* Instantiates a Puck.js. See {@link EspruinoBleDevice} for more info.
* [Online demos](https://demos.ixfx.fun/io/)
*
* If `opts.name` is specified, this will the the Bluetooth device sought.
*
* ```js
* import { Espruino } from '@ixfx/io.js'
* const e = await Espruino.puck({ name:`Puck.js a123` });
* ```
*
* If no name is specified, a list of all devices starting with `Puck.js` are shown.
*
* To get more control over filtering, pass in `opts.filter`. `opts.name` is not used as a filter in this scenario.
*
* ```js
* import { Espruino } from '@ixfx/io.js'
* const filters = [
*  { namePrefix: `Puck.js` },
*  { namePrefix: `Pixl.js` },
*  {services: [NordicDefaults.service] }
* ]
* const e = await Espruino.puck({ filters });
* ```
*
* @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
*/
const puck = async (opts = {}) => {
	const name = opts.name ?? `Puck`;
	const debug = opts.debug ?? false;
	const device = await navigator.bluetooth.requestDevice({
		filters: getFilters(opts, `Puck.js`),
		optionalServices: [defaultOpts.service]
	});
	if (opts.debug) console.info(`Espruino.puck device name: ${device.name}`);
	const d = new EspruinoBleDevice(device, {
		name,
		debug
	});
	await d.connect();
	return d;
};
const bangle = async (opts = {}) => {
	const name = opts.name ?? `Bangle`;
	const debug = opts.debug ?? false;
	const device = await navigator.bluetooth.requestDevice({
		filters: getFilters(opts, `Bangle.js`),
		optionalServices: [defaultOpts.service]
	});
	if (opts.debug) console.info(`Espruino.bangle device name: ${device.name}`);
	const d = new EspruinoBleDevice(device, {
		name,
		debug
	});
	await d.connect();
	return d;
};
/**
* Create a serial-connected Espruino device.
*
* ```js
* import { Espruino } from '@ixfx/io.js'
* const e = await Espruio.serial();
* e.connect();
* ```
*
* Options:
* ```js
* import { Espruino } from '@ixfx/io.js'
* const e = await Espruino.serial({ debug: true, evalTimeoutMs: 1000, name: `My Pico` });
* e.connect();
* ```
*
* Listen for events:
* ```js
* e.addEventListener(`change`, evt => {
*  console.log(`State change ${evt.priorState} -> ${evt.newState}`);
*  if (evt.newState === `connected`) {
*    // Do something when connected...
*  }
* });
* ```
*
* Reading incoming data:
* ```
* // Parse incoming data as JSON
* s.addEventListener(`data`, evt => {
*  try {
*    const o = JSON.parse(evt.data);
*    // If we get this far, JSON is legit
*  } catch (ex) {
*  }
* });
* ```
*
* Writing to the microcontroller
* ```
* s.write(JSON.stringify({msg:"hello"}));
* ```
* @param opts
* @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
*/
const serial = async (opts = {}) => {
	const d = new EspruinoSerialDevice(opts);
	await d.connect();
	return d;
};
/**
* Returns a list of BLE scan filters, given the
* connect options.
* @param opts
* @returns
*/
const getFilters = (opts, defaultNamePrefix) => {
	const filters = [];
	if (opts.filters) filters.push(...opts.filters);
	else if (opts.name) {
		filters.push({ name: opts.name });
		console.info(`Filtering Bluetooth devices by name '${opts.name}'`);
	} else filters.push({ namePrefix: defaultNamePrefix });
	return filters;
};
/**
* Connects to a generic Espruino BLE device. See  {@link EspruinoBleDevice} for more info.
* Use {@link puck} if you're connecting to a Puck.js
*
* If `opts.name` is specified, only this BLE device will be shown.
* ```js
* const e = await connectBle({ name: `Puck.js a123` });
* ```
*
* `opts.filters` overrides and sets arbitary filters.
*
* ```js
* import { Espruino } from '@ixfx/io.js'
* const filters = [
*  { namePrefix: `Puck.js` },
*  { namePrefix: `Pixl.js` },
*  {services: [NordicDefaults.service] }
* ]
* const e = await Espruino.connectBle({ filters });
* ```
*
* @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
*/
const connectBle = async (opts = {}) => {
	const device = await navigator.bluetooth.requestDevice({
		filters: getFilters(opts, `Puck.js`),
		optionalServices: [defaultOpts.service]
	});
	const d = new EspruinoBleDevice(device, {
		name: `Espruino`,
		...opts
	});
	await d.connect();
	return d;
};
/**
* Evaluates some code on an Espruino device.
*
* Options:
* * timeoutMs: how many millis to wait before assuming code failed. If not specified, `device.evalTimeoutMs` is used as a default.
* * assumeExlusive: assume device is not producing any other output than for our evaluation
*
* A random string is created to pair eval requests and responses. `code` will be run on the device, with the result
* wrapped in JSON, and in turn wrapped in a object that is sent back.
*
* The actual code that gets sent to the device is then:
* `\x10${evalReplyPrefix}(JSON.stringify({reply:"${id}", result:JSON.stringify(${code})}))\n`
*
* For example, it might end up being:
* `\x10Bluetooth.println(JSON.stringify({reply: "a35gP", result: "{ 'x': '10' }" }))\n`
*
* @param code Code to evaluation
* @param opts Options for evaluation
* @param device Device to execute on
* @param evalReplyPrefix How to send code back (eg `Bluetooth.println`, `console.log`)
* @param debug If true, the full evaled code is printed locally to the console
* @param warn Callback to display warnings
* @returns
*/
const deviceEval = async (code, opts = {}, device, evalReplyPrefix, debug, warn) => {
	const timeoutMs = opts.timeoutMs ?? device.evalTimeoutMs;
	const assumeExclusive = opts.assumeExclusive ?? true;
	if (typeof code !== `string`) throw new TypeError(`Param 'code' should be a string. Got: ${typeof code}`);
	return new Promise((resolve$1, reject) => {
		const id = string(5);
		const onData = (d) => {
			try {
				let cleaned = d.data.trim();
				if (cleaned.startsWith(`>{`) && cleaned.endsWith(`}`)) cleaned = cleaned.slice(1);
				const dd = JSON.parse(cleaned);
				if (`reply` in dd) if (dd.reply === id) {
					done();
					if (`result` in dd) resolve$1(dd.result);
				} else warn(`Expected reply ${id}, got ${dd.reply}`);
				else warn(`Expected packet, missing 'reply' field. Got: ${d.data}`);
			} catch (error) {
				if (assumeExclusive) done(`Unexpected reply: ${d.data}. Error: ${getErrorMessage(error)}`);
				else warn(getErrorMessage(error));
			}
		};
		const onStateChange = (event$1) => {
			if (event$1.newState !== `connected`) done(`State changed to '${event$1.newState}', aborting`);
		};
		device.addEventListener(`data`, onData);
		device.addEventListener(`change`, onStateChange);
		const done = waitFor(timeoutMs, (reason) => {
			reject(new Error(reason));
		}, (_success) => {
			device.removeEventListener(`data`, onData);
			device.removeEventListener(`change`, onStateChange);
		});
		const source = `\u0010${evalReplyPrefix}(JSON.stringify({reply:"${id}", result:JSON.stringify(${code})}))\n`;
		if (debug) warn(source);
		device.write(source);
	});
};

//#endregion
//#region ../io/dist/src/camera.js
var camera_exports = {};
__export(camera_exports, {
	dumpDevices: () => dumpDevices,
	start: () => start$1
});
const startTimeoutMs = 1e4;
/**
* Print available media devices to console
*
* ```js
* camera.dumpDevices(); // Will print results to console
* ```
* @param filterKind Defaults `videoinput`
*/
const dumpDevices = async (filterKind = `videoinput`) => {
	const devices = await navigator.mediaDevices.enumerateDevices();
	for (const d of devices) {
		if (d.kind !== filterKind) continue;
		console.log(d.label);
		console.log(` Kind: ${d.kind}`);
		console.log(` Device id: ${d.deviceId}`);
	}
};
/**
* Attempts to start a video-only stream from a camera into a hidden
* VIDEO element for frame capture. The VIDEO element is created automatically.
*
*
* ```js
* import { Camera } from '@ixfx/io.js'
* import { Video } from '@ixfx/visual.js'
* try {
*  const { videoEl, dispose } = await Camera.start();
*  for await (const frame of Video.frames(videoEl)) {
*    // Do something with pixels...
*  }
* } catch (ex) {
*  console.error(`Video could not be started`);
* }
* ```
*
* Be sure to call the dispose() function to stop the video stream and remov
* the created VIDEO element.
*
* _Constraints_ can be specified to select a camera and resolution:
* ```js
* import { Camera } from '@ixfx/io.js'
* import { Video } from '@ixfx/visual.js'
*
* try {
*  const { videoEl, dispose } = await Camera.start({
*    facingMode: `environment`,
*    max: { width: 640, height: 480 }
*  });
*
*  for await (const frame of Video.frames(videoEl)) {
*    // Do something with pixels...
*  }
* } catch (ex) {
*  // Can happen if user cancels camera request, for example.
*  console.error(`Video could not be started`, ex);
* }
* ```
*
* An alternative to Video.frames is Video.capture.
* @param constraints
* @returns Returns `{ videoEl, dispose }`, where `videoEl` is the created VIDEO element, and `dispose` is a function for removing the element and stopping the video.
*/
const start$1 = async (constraints = {}) => {
	const videoEl = document.createElement(`VIDEO`);
	videoEl.style.display = `none`;
	videoEl.playsInline = true;
	videoEl.muted = true;
	videoEl.classList.add(`ixfx-camera`);
	document.body.append(videoEl);
	let stopVideo = () => {};
	const dispose = () => {
		try {
			stopVideo();
		} catch {}
		videoEl.remove();
	};
	try {
		const r = await startWithVideoEl$1(videoEl, constraints);
		stopVideo = r.dispose;
		return {
			videoEl,
			dispose
		};
	} catch (error) {
		console.error(error);
		dispose();
		throw error;
	}
};
/**
* Attempts to start a video-only stream from a camera into the designated VIDEO element.
* @param videoEl
* @param constraints
* @returns Result contains videoEl and dispose function
*/
const startWithVideoEl$1 = async (videoEl, constraints = {}) => {
	if (videoEl === void 0) throw new Error(`videoEl undefined`);
	if (videoEl === null) throw new Error(`videoEl null`);
	const maxResolution = constraints.max;
	const minResolution = constraints.min;
	const idealResolution = constraints.ideal;
	const c = {
		audio: false,
		video: {
			width: {},
			height: {}
		}
	};
	if (constraints.facingMode === `front`) constraints = {
		...constraints,
		facingMode: `user`
	};
	if (constraints.facingMode === `back`) constraints = {
		...constraints,
		facingMode: `environment`
	};
	if (constraints.facingMode) c.video.facingMode = constraints.facingMode;
	if (constraints.deviceId) c.video.deviceId = constraints.deviceId;
	if (idealResolution) {
		c.video.width = {
			...c.video.width,
			ideal: idealResolution.width
		};
		c.video.height = {
			...c.video.height,
			ideal: idealResolution.height
		};
	}
	if (maxResolution) {
		c.video.width = {
			...c.video.width,
			max: maxResolution.width
		};
		c.video.height = {
			...c.video.height,
			max: maxResolution.height
		};
	}
	if (minResolution) {
		c.video.width = {
			...c.video.width,
			min: minResolution.width
		};
		c.video.height = {
			...c.video.height,
			min: minResolution.height
		};
	}
	const done = waitFor(constraints.startTimeoutMs ?? startTimeoutMs, (reason) => {
		throw new Error(`Camera getUserMedia failed: ${reason}`);
	});
	try {
		const stream = await navigator.mediaDevices.getUserMedia(c);
		const dispose = () => {
			videoEl.pause();
			const t = stream.getTracks();
			for (const track of t) track.stop();
		};
		videoEl.srcObject = stream;
		done();
		const returnValue = {
			videoEl,
			dispose
		};
		const p = new Promise((resolve$1, reject) => {
			videoEl.addEventListener(`loadedmetadata`, () => {
				videoEl.play().then(() => {
					resolve$1(returnValue);
				}).catch((error) => {
					reject(error);
				});
			});
		});
		return p;
	} catch (error) {
		done(getErrorMessage(error));
		throw error;
	}
};

//#endregion
//#region ../io/dist/src/video-file.js
var video_file_exports = {};
__export(video_file_exports, { start: () => start });
/**
* Starts video file playback, creating a VIDEO element automatically.
* @param file File
* @returns StartResult
*/
const start = async (file) => {
	const videoEl = document.createElement(`VIDEO`);
	videoEl.style.display = `none`;
	videoEl.playsInline = true;
	videoEl.muted = true;
	videoEl.classList.add(`ixfx-video`);
	document.body.appendChild(videoEl);
	let stopVideo = () => {};
	const dispose = () => {
		try {
			stopVideo();
		} catch {}
		videoEl.remove();
	};
	try {
		const r = await startWithVideoEl(videoEl, file);
		stopVideo = r.dispose;
		return {
			videoEl,
			dispose
		};
	} catch (ex) {
		console.error(ex);
		dispose();
		throw ex;
	}
};
/**
* Starts playback of a video file in the provided VIDEO element.
* @param videoEl
* @param file
* @returns
*/
const startWithVideoEl = async (videoEl, file) => {
	if (videoEl === void 0) throw new Error(`videoEl undefined`);
	if (videoEl === null) throw new Error(`videoEl null`);
	const url = URL.createObjectURL(file);
	videoEl.src = url;
	videoEl.loop = true;
	const dispose = () => {
		videoEl.pause();
	};
	const returnValue = {
		videoEl,
		dispose
	};
	const p = new Promise((resolve$1, reject) => {
		videoEl.addEventListener(`loadedmetadata`, () => {
			videoEl.play().then(() => {
				resolve$1(returnValue);
			}).catch((ex) => {
				reject(ex);
			});
		});
	});
	return p;
};

//#endregion
//#region ../io/dist/src/frame-processor.js
/**
* Frame Processor
* Simplifies grabbing frames from a camera or video file.
*
* First, create:
* ```js
* const fp = new FrameProcessor();
* ```
*
* Then either use the camera or a video file:
* ```js
* fp.useCamera(constraints);
* // or:
* gp.useVideo(file);
* ```
*
* With `useCamera`, optionally specify {@link Camera.Constraints} to pick which camera and resolution.
*
* ```js
* fp.getFrame(); // Gets the last frame
* fp.dispose(); // Close down camera/file
* ```
*
* See {@link FrameProcessorOpts} for details on available options.
*/
var FrameProcessor = class {
	_source;
	_state;
	_teardownNeeded = false;
	_cameraConstraints;
	_cameraStartResult;
	_videoSourceCapture;
	_videoFile;
	_videoStartResult;
	_showCanvas;
	_showPreview;
	_postCaptureDraw;
	_timer;
	_captureCanvasEl;
	/**
	* Create a new frame processor
	* @param opts
	*/
	constructor(opts = {}) {
		this._state = `ready`;
		this._source = ``;
		this._timer = performance.now();
		this._showCanvas = opts.showCanvas ?? false;
		this._showPreview = opts.showPreview ?? false;
		this._cameraConstraints = opts.cameraConstraints ?? void 0;
		this._captureCanvasEl = opts.captureCanvasEl ?? void 0;
		this._postCaptureDraw = opts.postCaptureDraw;
	}
	/**
	* Hides or shows the raw source in the DOM
	* @param enabled Preview enabled
	*/
	showPreview(enabled) {
		if (this._state === `disposed`) throw new Error(`Disposed`);
		let el;
		switch (this._source) {
			case `camera`: {
				el = this._cameraStartResult?.videoEl;
				if (el !== void 0) el.style.display = enabled ? `block` : `none`;
				break;
			}
		}
		this._showPreview = enabled;
	}
	/**
	* Shows or hides the Canvas we're capturing to
	* @param enabled
	*/
	showCanvas(enabled) {
		if (this._state === `disposed`) throw new Error(`Disposed`);
		let el;
		if (this._source === `camera` || this._source === `video`) {
			el = this._videoSourceCapture?.canvasEl;
			if (el !== void 0) el.style.display = enabled ? `block` : `none`;
		} else throw new Error(`Source not implemented: ${this._source}`);
		this._showCanvas = enabled;
	}
	/**
	* Returns the current capturer instance
	* @returns
	*/
	getCapturer() {
		if (this._state === `disposed`) throw new Error(`Disposed`);
		if (this._source === `camera` || this._source === `video`) return this._videoSourceCapture;
		throw new Error(`Source kind not supported ${this._source}`);
	}
	/**
	* Grab frames from a video camera source and initialises
	* frame processor.
	*
	* If `constraints` are not specified, it will use the ones
	* provided when creating the class, or defaults.
	*
	* @param constraints Override of constraints when requesting camera access
	*/
	async useCamera(constraints) {
		if (this._state === `disposed`) throw new Error(`Disposed`);
		this._source = `camera`;
		if (this._teardownNeeded) this.teardown();
		if (constraints) this._cameraConstraints = constraints;
		await this.init();
	}
	async useVideo(file) {
		if (this._state === `disposed`) throw new Error(`Disposed`);
		this._source = `video`;
		if (this._teardownNeeded) this.teardown();
		this._videoFile = file;
		await this.init();
	}
	/**
	* Initialises camera
	*/
	async initCamera() {
		const r = await start$1(this._cameraConstraints);
		if (r === void 0) throw new Error(`Could not start camera`);
		this._cameraStartResult = r;
		this.postInit(r);
	}
	async initVideo() {
		if (!this._videoFile) throw new Error(`Video file not defined`);
		const r = await start(this._videoFile);
		this._videoStartResult = r;
		this.postInit(r);
	}
	async postInit(r) {
		if (this._showPreview) r.videoEl.style.display = `block`;
		this._videoSourceCapture = manualCapture(r.videoEl, {
			postCaptureDraw: this._postCaptureDraw,
			showCanvas: this._showCanvas,
			canvasEl: this._captureCanvasEl
		});
		this._teardownNeeded = true;
		this._cameraStartResult = r;
		return Promise.resolve();
	}
	/**
	* Closes down connections and removes created elements.
	* Once disposed, the frame processor cannot be used
	* @returns
	*/
	dispose() {
		if (this._state === `disposed`) return;
		this.teardown();
		this._state = `disposed`;
	}
	async init() {
		this._timer = performance.now();
		switch (this._source) {
			case `camera`: {
				await this.initCamera();
				break;
			}
			case `video`: {
				await this.initVideo();
				break;
			}
		}
		this._state = `initialised`;
	}
	teardown() {
		if (!this._teardownNeeded) return;
		if (this._source === `camera` || this._source === `video`) this._videoSourceCapture?.dispose();
		switch (this._source) {
			case `camera`: {
				this._cameraStartResult?.dispose();
				break;
			}
			case `video`: {
				this._videoStartResult?.dispose();
				break;
			}
		}
		this._teardownNeeded = false;
	}
	/**
	* Get the last frame
	* @returns
	*/
	getFrame() {
		if (this._state === `disposed`) throw new Error(`Disposed`);
		switch (this._source) {
			case `camera`: return this.getFrameCamera();
			case `video`: return this.getFrameCamera();
			default: throw new Error(`source type unhandled ${this._source}`);
		}
	}
	/**
	* Get the timestamp of the processor (elapsed time since starting)
	* @returns
	*/
	getTimestamp() {
		return performance.now() - this._timer;
	}
	getFrameCamera() {
		return this._videoSourceCapture?.capture();
	}
};

//#endregion
//#region ../io/dist/src/reconnecting-web-socket.js
/**
* Maintains a web socket connection. Connects automatically.
*
* The essential usage is:
* ```js
* import { reconnectingWebsocket } from '@ixfx/io.js'
* const ws = reconnectingWebsocket(`wss://somehost.com/ws`, {
*  onMessage: (msg) => {
*    // Do something with received message...
*  }
* }
*
* // Send some data
* ws.send(JSON.stringify(someData));
*
* // Check state of connection
* ws.isConnected();
* ```
*
* More options can be provided to monitor state
* ```js
* import { reconnectingWebsocket } from '@ixfx/io.js'
* const ws = reconnectingWebsocket(`wss://somehost.com/ws`, {
*  onError: (err) => {
*    console.error(err)
*  },
*  onMessage: (msg) => {
*    // Received data
*    console.log(msg);
*  },
*  onConnected: () => {
*    // Connected!
*  },
*  onDisconnected: () => {
*    // Disconnected :(
*  }
* });
* ```
* @param url
* @param opts
* @returns
*/
const reconnectingWebsocket = (url, opts = {}) => {
	const startDelayMs = intervalToMs(opts.startDelay, 2e3);
	const maxDelayMs = intervalToMs(opts.maxDelay, startDelayMs * 10);
	const checkStateMs = intervalToMs(opts.checkStateMs, 5e3);
	if (startDelayMs > maxDelayMs) throw new Error(`startDelay should be less than maxDelay`);
	if (checkStateMs < 0) throw new Error(`Param 'checkState' should be above zero`);
	let reconnect = true;
	let currentState = init({
		closed: `connecting`,
		open: `closed`,
		connecting: [`closed`, `open`]
	});
	let ws;
	const onError = (event_) => {
		if (opts.onError) opts.onError(event_);
		else {
			console.log(`rw on error`, event_);
			console.error(` error: ${event_.error}`);
			console.error(` type: ${event_.type}`);
			console.error(` error msg: ${event_.message}`);
		}
	};
	const onMessage = (message) => {
		if (opts.onMessage) opts.onMessage(message.data);
	};
	const connect = async () => {
		if (currentState.value === `connecting`) throw new Error(`Cannot connect twice`);
		currentState = to(currentState, `connecting`);
		if (ws !== void 0) {
			ws.removeEventListener(`error`, onError);
			if (opts.onMessage) ws.removeEventListener(`message`, onMessage);
			ws = void 0;
		}
		const retry = await retryTask({ async probe(_attempts) {
			try {
				const wss = new WebSocket(url);
				const r = await eventRace(wss, [`open`, `error`], { timeoutMs: 1e3 });
				return r.type === `open` ? {
					success: true,
					value: wss
				} : {
					success: false,
					error: `Could not open`
				};
			} catch (error) {
				return {
					success: false,
					error: getErrorMessage(error)
				};
			}
		} }, {
			predelayMs: startDelayMs,
			limitAttempts: opts.limitAttempts
		});
		ws = retry.value;
		let result = false;
		if (retry.success && ws) {
			if (opts.onMessage) {}
			result = true;
			currentState = to(currentState, `open`);
			if (opts.onConnected) opts.onConnected();
		} else currentState = to(currentState, `closed`);
		return result;
	};
	const send = (data) => {
		if (ws) if (ws.readyState === ws.OPEN) ws.send(data);
		else onDisconnected();
		else throw new Error(`Not connected`);
	};
	const onDisconnected = () => {
		if (currentState.value === `closed`) return;
		if (currentState.value === `open`) {
			currentState = to(currentState, `closed`);
			if (opts.onDisconnected) opts.onDisconnected();
		}
		if (reconnect && currentState.value !== `connecting`) {
			console.log(`Scheduling connect`);
			setTimeout(() => {
				connect();
			}, 100);
		}
	};
	const isConnected = () => {
		if (!ws) return false;
		return ws.readyState === ws.OPEN;
	};
	const close = () => {
		reconnect = false;
		currentState = to(currentState, `closed`);
		ws?.close();
		if (opts.onDisconnected) opts.onDisconnected();
	};
	const open = () => {
		reconnect = true;
		if (currentState.value === `open`) return Promise.resolve(true);
		if (currentState.value === `connecting`) return Promise.resolve(false);
		return connect();
	};
	connect();
	setInterval(() => {
		if (!ws) return;
		switch (ws.readyState) {
			case ws.CLOSED: {
				if (currentState.value === `open`) onDisconnected();
				break;
			}
		}
	}, checkStateMs);
	return {
		send,
		isConnected,
		close,
		open
	};
};

//#endregion
//#region ../io/dist/src/index.js
var src_exports$16 = {};
__export(src_exports$16, {
	Audio: () => audio_exports,
	Bluetooth: () => nordic_ble_device_exports,
	Camera: () => camera_exports,
	Codec: () => Codec,
	Espruino: () => espruino_exports,
	FrameProcessor: () => FrameProcessor,
	Midi: () => midi_exports,
	Serial: () => serial_exports,
	StringReceiveBuffer: () => StringReceiveBuffer,
	StringWriteBuffer: () => StringWriteBuffer,
	VideoFile: () => video_file_exports,
	genericStateTransitionsInstance: () => genericStateTransitionsInstance,
	reconnectingWebsocket: () => reconnectingWebsocket
});

//#endregion
//#region ../ui/dist/src/rx/browser-resize.js
/**
* Observe when element resizes. Specify `interval` to debounce, uses 100ms by default.
*
* ```
* const o = resizeObservable(myEl, 500);
* o.subscribe(() => {
*  // called 500ms after last resize
* });
* ```
* @param elem
* @param interval Tiemout before event gets triggered
* @returns
*/
const browserResizeObservable = (elem, interval) => {
	if (elem === null) throw new Error(`Param 'elem' is null. Expected element to observe`);
	if (elem === void 0) throw new Error(`Param 'elem' is undefined. Expected element to observe`);
	const m = observable((stream) => {
		const ro = new ResizeObserver((entries) => {
			stream.set(entries);
		});
		ro.observe(elem);
		return () => {
			ro.unobserve(elem);
		};
	});
	return debounce$1({ elapsed: interval ?? 100 })(m);
};
/**
* Returns an Reactive for window resize. Default 100ms debounce.
* @param elapsed
* @returns
*/
const windowResize = (elapsed) => debounce$1({ elapsed: elapsed ?? 100 })(event(window, `resize`, {
	innerWidth: 0,
	innerHeight: 0
}));

//#endregion
//#region ../ui/dist/src/rx/browser-theme-change.js
/**
* Observe when a class changes on a target element, by default the document.
* Useful for tracking theme changes.
*
* ```js
* const c = cssClassChange();
* c.on(msg => {
*  // some class has changed on the document
* });
* ```
*/
const cssClassChange = (target = document.documentElement) => {
	const m = observable((stream) => {
		const ro = new MutationObserver((entries) => {
			stream.set(entries);
		});
		const opts = {
			attributeFilter: [`class`],
			attributes: true
		};
		ro.observe(target, opts);
		return () => {
			ro.disconnect();
		};
	});
	return m;
};

//#endregion
//#region ../ui/dist/src/rx/colour.js
function colour(initialValue) {
	let value = initialValue;
	const events = initStream();
	const set = (v) => {
		value = v;
		events.set(v);
	};
	return {
		dispose: events.dispose,
		isDisposed: events.isDisposed,
		last: () => value,
		on: events.on,
		onValue: events.onValue,
		set,
		setHsl: (hsl) => {
			set(hsl);
		}
	};
}

//#endregion
//#region ../ui/dist/src/rx/dom-source.js
/**
* Reactive getting/setting of values to a HTML INPUT element.
*
* Options:
* - relative: if _true_, values are 0..1 (default: false)
* - inverted: if _true_, values are 1..0 (default: false)
*
* If element is missing a 'type' attribute, this will be set to 'range'.
* @param targetOrQuery
* @param options
* @returns
*/
function domNumberInputValue(targetOrQuery, options = {}) {
	const input = domInputValue(targetOrQuery, options);
	const el = input.el;
	const relative = options.relative ?? false;
	const inverted = options.inverted ?? false;
	const rx = transform(input, (v) => {
		return Number.parseFloat(v);
	});
	if (relative) {
		el.max = inverted ? "0" : "1";
		el.min = inverted ? "1" : "0";
		if (!el.hasAttribute(`step`)) el.step = "0.1";
	}
	if (el.getAttribute(`type`) === null) el.type = `range`;
	const set = (value) => {
		input.set(value.toString());
	};
	return {
		...rx,
		last() {
			return Number.parseFloat(input.last());
		},
		set
	};
}
function domHslInputValue(targetOrQuery, options = {}) {
	const input = domInputValue(targetOrQuery, {
		...options,
		upstreamFilter: (value) => {
			return typeof value === `object` ? toCssColour(value) : value;
		}
	});
	const rx = transform(input, (v) => {
		return fromCss(v, {
			scalar: true,
			ensureSafe: true
		});
	});
	return {
		...rx,
		last() {
			return fromCss(input.last(), {
				scalar: true,
				ensureSafe: true
			});
		},
		set(value) {
			input.set(toCssString(value));
		}
	};
}
/**
* A stream of values when the a HTMLInputElement changes. Eg a <input type="range">
* ```js
* const r = Rx.From.domInputValue(`#myEl`);
* r.onValue(value => {
*  // value will be string
* });
* ```
*
* Options:
* * emitInitialValue: If _true_ emits the HTML value of element (default: false)
* * attributeName: If set, this is the HTML attribute value is set to when writing to stream (default: 'value')
* * fieldName: If set, this is the DOM object field set when writing to stream (default: 'value')
* * when: 'changed'|'changing' when values are emitted. (default: 'changed')
* * fallbackValue:  Fallback value to use if field/attribute cannot be read (default: '')
* @param targetOrQuery
* @param options
* @returns
*/
function domInputValue(targetOrQuery, options = {}) {
	const target = typeof targetOrQuery === `string` ? document.querySelector(targetOrQuery) : targetOrQuery;
	if (target === null && typeof targetOrQuery === `string`) throw new Error(`Element query could not be resolved '${targetOrQuery}'`);
	if (target === null) throw new Error(`targetOrQuery is null`);
	const el = resolveEl(targetOrQuery);
	const when = options.when ?? `changed`;
	const eventName = when === `changed` ? `change` : `input`;
	const emitInitialValue = options.emitInitialValue ?? false;
	const fallbackValue = options.fallbackValue ?? ``;
	const upstreamSource = options.upstreamSource;
	let upstreamSourceUnsub = () => {};
	let attribName = options.attributeName;
	let fieldName = options.fieldName;
	if (fieldName === void 0 && attribName === void 0) attribName = fieldName = `value`;
	const readValue = () => {
		let value;
		if (attribName) value = el.getAttribute(attribName);
		if (fieldName) value = el[fieldName];
		if (value === void 0 || value === null) value = fallbackValue;
		return value;
	};
	const setValue = (value) => {
		if (attribName) el.setAttribute(attribName, value);
		if (fieldName) el[fieldName] = value;
	};
	const setUpstream = (v) => {
		v = options.upstreamFilter ? options.upstreamFilter(v) : v;
		setValue(v);
	};
	if (upstreamSource) {
		upstreamSourceUnsub = upstreamSource.onValue(setUpstream);
		if (hasLast$1(upstreamSource)) setUpstream(upstreamSource.last());
	}
	const rxEvents = eventTrigger(el, eventName, {
		fireInitial: emitInitialValue,
		debugFiring: options.debugFiring ?? false,
		debugLifecycle: options.debugLifecycle ?? false
	});
	const rxValues = transform(rxEvents, (_trigger) => readValue());
	return {
		...rxValues,
		el,
		last() {
			return readValue();
		},
		set(value) {
			setValue(value);
		},
		dispose(reason) {
			upstreamSourceUnsub();
			rxValues.dispose(reason);
			rxEvents.dispose(reason);
		}
	};
}
/**
* Listens for data changes from elements within a HTML form element.
* Input elements must have a 'name' attribute.
*
* Simple usage:
* ```js
* const rx = Rx.From.domForm(`#my-form`);
* rx.onValue(value => {
*  // Object containing values from form
* });
*
* rx.last(); // Read current values of form
* ```
*
* UI can be updated
* ```js
* // Set using an object of key-value pairs
* rx.set({
*  size: 'large'
* });
*
* // Or set a single name-value pair
* rx.setNamedValue(`size`, `large`);
* ```
*
* If an 'upstream' reactive is provided, this is used to set initial values of the UI, overriding
* whatever may be in the HTML. Upstream changes modify UI elements, but UI changes do not modify the upstream
* source.
*
* ```js
* // Create a reactive object
* const obj = Rx.From.object({
*  when: `2024-10-03`,
*  size: 12,
*  checked: true
* });
*
* // Use this as initial values for a HTML form
* // (assuming appropriate INPUT/SELECT elements exist)
* const rx = Rx.From.domForm(`form`, {
*  upstreamSource: obj
* });
*
* // Listen for changes in the UI
* rx.onValue(value => {
*
* });
* ```
* @param formElOrQuery
* @param options
* @returns
*/
function domForm(formElOrQuery, options = {}) {
	const formEl = resolveEl(formElOrQuery);
	const when = options.when ?? `changed`;
	const eventName = when === `changed` ? `change` : `input`;
	const emitInitialValue = options.emitInitialValue ?? false;
	const upstreamSource = options.upstreamSource;
	const typeHints = /* @__PURE__ */ new Map();
	let upstreamSourceUnsub = () => {};
	const readValue = () => {
		const fd = new FormData(formEl);
		const entries = [];
		for (const [k, v] of fd.entries()) {
			const vString = v.toString();
			let typeHint = typeHints.get(k);
			if (!typeHint) {
				const el = getFormElement(k, vString);
				if (el) {
					if (el.type === `range` || el.type === `number`) typeHint = `number`;
					else if (el.type === `color`) typeHint = `colour`;
					else if (el.type === `checkbox` && (v === `true` || v === `on`)) typeHint = `boolean`;
					else typeHint = `string`;
					typeHints.set(k, typeHint);
				}
			}
			if (typeHint === `number`) entries.push([k, Number.parseFloat(vString)]);
			else if (typeHint === `boolean`) {
				const vBool = vString === `true` ? true : false;
				entries.push([k, vBool]);
			} else if (typeHint === `colour`) {
				const vRgb = toCssColour(vString);
				entries.push([k, fromCss$1(vRgb, { scalar: false })]);
			} else entries.push([k, v.toString()]);
		}
		for (const el of formEl.querySelectorAll(`input[type="checkbox"]`)) if (!el.checked && el.value === `true`) entries.push([el.name, false]);
		const asObject = Object.fromEntries(entries);
		return asObject;
	};
	const getFormElement = (name, value) => {
		const el = formEl.querySelector(`[name="${name}"]`);
		if (!el) {
			console.warn(`Form does not contain an element with name="${name}"`);
			return;
		}
		if (el.type === `radio`) {
			const radioEl = formEl.querySelector(`[name="${name}"][value="${value}"]`);
			if (!radioEl) {
				console.warn(`Form does not contain radio option for name=${name} value=${value}`);
				return;
			}
			return radioEl;
		}
		return el;
	};
	const setNamedValue = (name, value) => {
		const el = getFormElement(name, value);
		if (!el) return;
		if (el.nodeName === `INPUT` || el.nodeName === `SELECT`) {
			if (el.type === `color`) {
				if (typeof value === `object`) value = toCssColour(value);
			} else if (el.type === `checkbox`) if (typeof value === `boolean`) {
				el.checked = value;
				return;
			} else console.warn(`Rx.Sources.domForm: Trying to set non boolean type to a checkbox. Name: ${name} Value: ${value} (${typeof value})`);
			else if (el.type === `radio`) {
				el.checked = true;
				return;
			}
			el.value = value;
		}
	};
	const setFromUpstream = (value) => {
		for (const [name, v] of Object.entries(value)) {
			let hint = typeHints.get(name);
			if (!hint) {
				hint = typeof v;
				if (hint === `object`) {
					const rgb = toColour(v);
					hint = `colour`;
				}
				typeHints.set(name, hint);
			}
			const valueFiltered = options.upstreamFilter ? options.upstreamFilter(name, v) : v;
			setNamedValue(name, valueFiltered);
		}
	};
	if (upstreamSource) {
		upstreamSourceUnsub = upstreamSource.onValue(setFromUpstream);
		if (hasLast$1(upstreamSource)) setFromUpstream(upstreamSource.last());
	}
	const rxEvents = eventTrigger(formEl, eventName, {
		fireInitial: emitInitialValue,
		debugFiring: options.debugFiring ?? false,
		debugLifecycle: options.debugLifecycle ?? false
	});
	const rxValues = transform(rxEvents, (_trigger) => readValue());
	return {
		...rxValues,
		el: formEl,
		last() {
			return readValue();
		},
		set: setFromUpstream,
		setNamedValue,
		dispose(reason) {
			upstreamSourceUnsub();
			rxValues.dispose(reason);
			rxEvents.dispose(reason);
		}
	};
}

//#endregion
//#region ../ui/dist/src/rx/dom.js
/**
* Reactive stream of array of elements that match `query`.
* @param query
* @returns
*/
function fromDomQuery(query) {
	const elements$1 = [...document.querySelectorAll(query)];
	return object(elements$1);
}
/**
* Updates an element's `textContent` when the source value changes.
* ```js
* bindText(source, `#blah`);
* ```
* @param elOrQuery
* @param source
* @param bindOpts
*/
const bindText = (source, elOrQuery, bindOpts = {}) => {
	return bindElement(source, elOrQuery, {
		...bindOpts,
		elField: `textContent`
	});
};
/**
* Updates an element's `value` (as well as the 'value' attribute) when the source value changes.s
* @param source
* @param elOrQuery
* @param bindOpts
* @returns
*/
const bindValueText = (source, elOrQuery, bindOpts = {}) => {
	return bindElement(source, elOrQuery, {
		...bindOpts,
		elField: `value`,
		attribName: `value`
	});
};
/**
* Updates an element's `innerHTML` when the source value changes
* ```js
* bindHtml(source, `#blah`);
* ```
*
* Uses {@link bindElement}, with `{elField:'innerHTML'}` as the options.
* @param elOrQuery
* @param source
* @param bindOpts
* @returns
*/
const bindHtml = (source, elOrQuery, bindOpts = {}) => {
	return bindElement(source, elOrQuery, {
		...bindOpts,
		elField: `innerHTML`
	});
};
/**
* Shortcut to bind to an elements attribute
* @param elOrQuery
* @param source
* @param attribute
* @param bindOpts
* @returns
*/
/**
* Shortcut to bind to a CSS variable
* @param elOrQuery
* @param source
* @param cssVariable
* @param bindOpts
* @returns
*/
/**
* Creates a new HTML element, calling {@link bind} on it to update when `source` emits new values.
*
*
* ```js
* // Set textContent of a SPAN with values from `source`
* create(source, { tagName: `span`, parentEl: document.body })
* ```
*
* If `parentEl` is not given in the options, the created element needs to be manually added
* ```js
* const b = create(source);
* someEl.append(b.el); // Append manually
* ```
*
* ```
* // Set 'title' attribute based on values from `source`
* create(source, { parentEl: document.body, attribName: `title` })
* ```
* @param source
* @param options
* @returns
*/
/**
* Update a DOM element's field, attribute or CSS variable when `source` produces a value.
*
* ```js
* // Access via DOM query. Binds to 'textContent' by default
* bind(readableSource, `#someEl`);
*
* // Set innerHTML instead
* bind(readableSource, someEl, { elField: `innerHTML` });
*
* // An attribute
* bind(readableSource, someEl, { attribName: `width` });
*
* // A css variable ('--' optiona)
* bind(readableSource, someEl, { cssVariable: `hue` });
*
* // Pluck a particular field from source data.
* // Ie someEl.textContent = value.colour
* bind(readableSource, someEl, { sourceField: `colour` });
*
* // Transform value before setting it to field
* bind(readableSource, someEl, {
*  field: `innerHTML`,
*  transform: (v) => `Colour: ${v.colour}`
* })
* ```
*
* If `source` has an initial value, this is used when first bound.
*
* Returns {@link PipeDomBinding} to control binding:
* ```js
* const bind = bind(source, `#someEl`);
* bind.remove();     // Unbind
* bind.remove(true); // Unbind and remove HTML element
* ```
*
* If several fields need to be updated based on a new value, consider using {@link bindUpdate} instead.
* @param elOrQuery Element to update to, or query string such as '#someid'
* @param source Source of data
* @param binds Bindings
*/
const bindElement = (source, elOrQuery, ...binds) => {
	if (elOrQuery === null) throw new Error(`Param 'elOrQuery' is null`);
	if (elOrQuery === void 0) throw new Error(`Param 'elOrQuery' is undefined`);
	const el = resolveEl(elOrQuery);
	let b = [];
	if (binds.length === 0) b.push({ elField: `textContent` });
	else b = [...binds];
	const bb = b.map((bind$1) => {
		if (`element` in bind$1) return bind$1;
		return {
			...bind$1,
			element: el
		};
	});
	return bind(source, ...bb);
};
const resolveBindUpdater = (bind$1, element) => {
	const b = resolveBindUpdaterBase(bind$1);
	return (value) => {
		b(value, element);
	};
};
const resolveBindUpdaterBase = (bind$1) => {
	if (bind$1.elField !== void 0 || bind$1.cssVariable === void 0 && bind$1.attribName === void 0 && bind$1.cssProperty === void 0 && bind$1.textContent === void 0 && bind$1.htmlContent === void 0) {
		const field = bind$1.elField ?? `textContent`;
		return (v, element) => {
			element[field] = v;
		};
	}
	if (bind$1.attribName !== void 0) {
		const attrib = bind$1.attribName;
		return (v, element) => {
			element.setAttribute(attrib, v);
		};
	}
	if (bind$1.textContent) return (v, element) => {
		element.textContent = v;
	};
	if (bind$1.htmlContent) return (v, element) => {
		element.innerHTML = v;
	};
	if (bind$1.cssVariable !== void 0) {
		let css = bind$1.cssVariable;
		if (!css.startsWith(`--`)) css = `--` + css;
		return (v, element) => {
			element.style.setProperty(css, v);
		};
	}
	if (bind$1.cssProperty !== void 0) return (v, element) => {
		element.style[bind$1.cssProperty] = v;
	};
	return (_, _element) => {
		/** no-op */
	};
};
const resolveTransform = (bind$1) => {
	if (!bind$1.transform && !bind$1.transformValue) return;
	if (bind$1.transformValue) {
		if (bind$1.sourceField === void 0) throw new Error(`Expects 'sourceField' to be set when 'transformValue' is set`);
		return (value) => {
			const fieldValue = value[bind$1.sourceField];
			return bind$1.transformValue(fieldValue);
		};
	} else if (bind$1.transform) {
		if (bind$1.sourceField !== void 0) throw new Error(`If 'transform' is set, 'sourceField' is ignored`);
		return (value) => bind$1.transform(value);
	}
};
/**
* Binds `source` to one or more element(s). One or more bindings for the same source
* can be provided.
*
* ```js
* bind(source,
*  // Binds .name field of source values to textContent of #some-element
*  { query: `#some-element`, sourceField: `name` },
*  { query: `section`, }
* );
* ```
*
* Can update
* * CSS variables
* * CSS styles
* * textContent / innerHTML
* * HTML DOM attributes and object fields
*
* Can use a particular field on source values, or use the whole value. These can
* pass through `transformValue` or `transform` respectively.
*
* Returns a function to unbind from source and optionally remove HTML element
* ```js
* const unbind = bind( . . . );
* unbind();     // Unbind
* unbind(true); // Unbind and remove HTML element(s)
* ```
* @param source
* @param bindsUnresolvedElements
* @returns
*/
const bind = (source, ...bindsUnresolvedElements) => {
	const binds = bindsUnresolvedElements.map((bind$1) => {
		if (bind$1.element && bind$1.element !== void 0) return bind$1;
		if (bind$1.query) return {
			...bind$1,
			element: resolveEl(bind$1.query)
		};
		throw new Error(`Unable to resolve element. Missing 'element' or 'query' values on bind. ${JSON.stringify(bind$1)}`);
	});
	const bindsResolved = binds.map((bind$1) => ({
		update: resolveBindUpdater(bind$1, bind$1.element),
		transformer: resolveTransform(bind$1),
		sourceField: bind$1.sourceField
	}));
	const update = (value) => {
		for (const bind$1 of bindsResolved) if (bind$1.transformer) bind$1.update(bind$1.transformer(value));
		else {
			const v = bind$1.sourceField ? value[bind$1.sourceField] : value;
			if (typeof v === `object`) if (bind$1.sourceField) bind$1.update(JSON.stringify(v));
			else bind$1.update(JSON.stringify(v));
			else bind$1.update(v);
		}
	};
	const unsub = source.on((message) => {
		if (messageHasValue(message)) update(message.value);
		else if (messageIsSignal(message)) console.warn(message);
	});
	if (hasLast$1(source)) update(source.last());
	return { remove: (removeElements) => {
		unsub();
		if (removeElements) for (const bind$1 of binds) bind$1.element.remove();
	} };
};
/**
* Calls `updater` whenever `source` produces a value. Useful when several fields from a value
* are needed to update an element.
* ```js
* bindUpdate(source, `#someEl`, (v, el) => {
*  el.setAttribute(`width`, v.width);
*  el.setAttribute(`height`, v.height);
* });
* ```
*
* Returns a {@link PipeDomBinding} to manage binding
* ```js
* const b = bindUpdate(...);
* b.remove();     // Disconnect binding
* b.remove(true); // Disconnect binding and remove element
* b.el;           // HTML element
* ```
* @param elOrQuery
* @param source
* @param updater
* @returns
*/
const bindUpdate = (source, elOrQuery, updater) => {
	const el = resolveEl(elOrQuery);
	const update = (value) => {
		updater(value, el);
	};
	const unsub = source.on((message) => {
		if (messageHasValue(message)) {
			console.log(message);
			update(message.value);
		} else console.warn(message);
	});
	if (hasLast$1(source)) update(source.last());
	return { remove: (removeElement) => {
		unsub();
		if (removeElement) el.remove();
	} };
};
/**
* Updates a HTML element based on diffs on an object.
* ```js
* // Wrap an object
* const o = Rx.object({ name: `Jane`, ticks: 0 });
* const b = bindDiffUpdate(`#test`, o, (diffs, el) => {
*  // el = reference to #test
* // diff = Array of Changes,
* //  eg [ { path: `ticks`, value: 797, previous: 0 } ]
*  for (const diff of diffs) {
*    if (diff.path === `ticks`) el.textContent = `${diff.previous} -> ${diff.value}`
*  }
* })
*
* // Eg. update field
* o.updateField(`ticks`, Math.floor(Math.random()*1000));
* ```
*
* If `initial` is provided as an option, this will be called if `source` has an initial value. Without this, the DOM won't be updated until the first data
* update happens.
* ```js
* bindDiffUpdate(el, source, updater, {
*  initial: (v, el) => {
*    el.innerHTML = v.name;
*  }
* })
* ```
* @param elOrQuery
* @param source
* @param updater
* @param opts
* @returns
*/
const bindDiffUpdate = (source, elOrQuery, updater, opts = {}) => {
	if (elOrQuery === null) throw new Error(`Param 'elOrQuery' is null`);
	if (elOrQuery === void 0) throw new Error(`Param 'elOrQuery' is undefined`);
	const el = resolveEl(elOrQuery);
	const update = (value) => {
		updater(value, el);
	};
	const unsub = source.onDiff((value) => {
		update(value);
	});
	const init$1 = () => {
		if (hasLast$1(source) && opts.initial) opts.initial(source.last(), el);
	};
	init$1();
	return {
		refresh: () => {
			init$1();
		},
		remove: (removeElement) => {
			unsub();
			if (removeElement) el.remove();
		}
	};
};
/**
* Creates a new HTML element and calls `bindUpdate` so values from `source` can be used
* to update it.
*
*
* ```js
* // Creates a span, adding it to <body>
* const b = createUpdate(dataSource, (value, el) => {
*  el.width = value.width;
*  el.height = value.height;
* }, {
*  tagName: `SPAN`,
*  parentEl: document.body
* })
* ```
* @param source
* @param updater
* @param options
* @returns
*/
/**
* Creates, updates & deletes elements based on pathed values from a reactive.
*
* This means that elements are only manipulated if its associated data changes,
* and elements are not modified if there's no need to.
* @param source
* @param options
*/
const elements = (source, options) => {
	const containerEl = options.container ? resolveEl(options.container) : document.body;
	const defaultTag = options.defaultTag ?? `div`;
	const elByField = /* @__PURE__ */ new Map();
	const binds = /* @__PURE__ */ new Map();
	for (const [key, value] of Object.entries(options.binds ?? {})) {
		const tagName = value.tagName ?? defaultTag;
		binds.set(key, {
			...value,
			update: resolveBindUpdaterBase(value),
			transform: resolveTransform(value),
			tagName,
			path: key
		});
	}
	const findBind = (path) => {
		const bind$1 = findBySomeKey(binds, stringSegmentsWholeToEnd(path));
		if (bind$1 !== void 0) return bind$1;
		if (!path.includes(`.`)) return binds.get(`_root`);
	};
	function* ancestorBinds(path) {
		for (const p of stringSegmentsWholeToFirst(path)) if (binds.has(p)) yield binds.get(p);
		if (binds.has(`_root`) && path.includes(`.`)) yield binds.get(`_root`);
	}
	const create = (path, value) => {
		const rootedPath = getRootedPath(path);
		console.log(`Rx.Dom.elements.create: ${path} rooted: ${rootedPath} value: ${JSON.stringify(value)}`);
		const bind$1 = findBind(getRootedPath(path));
		let tagName = defaultTag;
		if (bind$1?.tagName) tagName = bind$1.tagName;
		const el = document.createElement(tagName);
		el.setAttribute(`data-path`, path);
		update(path, el, value);
		let parentForEl;
		for (const b of ancestorBinds(rootedPath)) if (b?.nestChildren) {
			const absoluteRoot = beforeMatch(path, `.`);
			const findBy = b.path.replace(`_root`, absoluteRoot);
			parentForEl = elByField.get(findBy);
			if (parentForEl === void 0) {} else break;
		}
		(parentForEl ?? containerEl).append(el);
		elByField.set(path, el);
		console.log(`Added el: ${path}`);
	};
	const update = (path, el, value) => {
		console.log(`Rx.dom.update path: ${path} value:`, value);
		const bind$1 = findBind(getRootedPath(path));
		if (bind$1 === void 0) {
			if (typeof value === `object`) value = JSON.stringify(value);
			el.textContent = value;
		} else {
			if (bind$1.transform) value = bind$1.transform(value);
			bind$1.update(value, el);
		}
	};
	const changes = (changes$1) => {
		const queue = new QueueMutable({}, changes$1);
		let d = queue.dequeue();
		const seenPaths = /* @__PURE__ */ new Set();
		while (d !== void 0) {
			const path = d.path;
			if (!(`previous` in d) || d.previous === void 0) {
				console.log(`Rx.Dom.elements.changes no previous. path: ${path}`);
				create(path, d.value);
				const subdata = [...getPathsAndData(d.value, false, Number.MAX_SAFE_INTEGER, path)];
				console.log(subdata);
				for (const dd of subdata) if (!seenPaths.has(dd.path)) {
					queue.enqueue(dd);
					seenPaths.add(dd.path);
				}
			} else if (d.value === void 0) {
				const el = elByField.get(path);
				if (el === void 0) console.warn(`No element to delete? ${path} `);
				else {
					console.log(`Rx.Dom.elements.changes delete ${path}`);
					el.remove();
				}
			} else {
				const el = elByField.get(path);
				if (el === void 0) {
					console.warn(`Rx.Dom.elements.changes No element to update ? ${path} `);
					create(path, d.value);
				} else update(path, el, d.value);
			}
			d = queue.dequeue();
		}
	};
	/**
	* Source has changed
	*/
	source.onDiff((value) => {
		changes(value);
	});
	if (hasLast$1(source)) {
		const last = source.last();
		changes([...getPathsAndData(last, false, 1)]);
	}
};
/**
* Replaces the root portion of `path` with the magic keyword `_root`
* @param path
* @returns
*/
const getRootedPath = (path) => {
	const after = afterMatch(path, `.`);
	return after === path ? `_root` : `_root.` + after;
};
function win() {
	const generateRect = () => ({
		width: window.innerWidth,
		height: window.innerHeight
	});
	const size = event(window, `resize`, {
		lazy: `very`,
		transform: () => generateRect()
	});
	const pointer = event(window, `pointermove`, {
		lazy: `very`,
		transform: (args) => {
			if (args === void 0) return {
				x: 0,
				y: 0
			};
			const pe = args;
			return {
				x: pe.x,
				y: pe.y
			};
		}
	});
	const dispose = (reason = `Reactive.win.dispose`) => {
		size.dispose(reason);
		pointer.dispose(reason);
	};
	return {
		dispose,
		size,
		pointer
	};
}

//#endregion
//#region ../ui/dist/src/rx/index.js
var rx_exports = {};
__export(rx_exports, {
	bind: () => bind,
	bindDiffUpdate: () => bindDiffUpdate,
	bindElement: () => bindElement,
	bindHtml: () => bindHtml,
	bindText: () => bindText,
	bindUpdate: () => bindUpdate,
	bindValueText: () => bindValueText,
	browserResizeObservable: () => browserResizeObservable,
	colour: () => colour,
	cssClassChange: () => cssClassChange,
	domForm: () => domForm,
	domHslInputValue: () => domHslInputValue,
	domInputValue: () => domInputValue,
	domNumberInputValue: () => domNumberInputValue,
	elements: () => elements,
	fromDomQuery: () => fromDomQuery,
	win: () => win,
	windowResize: () => windowResize
});

//#endregion
//#region ../ui/dist/src/index.js
var src_exports$17 = {};
__export(src_exports$17, { RxUi: () => rx_exports });

//#endregion
export { src_exports$7 as Arrays, src_exports$9 as Collections, src_exports$5 as Debug, src_exports$10 as Dom, src_exports$4 as Events, src_exports$8 as Flow, src_exports$11 as Geometry, src_exports as Guards, src_exports$16 as Io, src_exports$3 as Iterables, maps_exports as Maps, src_exports$2 as Modulation, src_exports$6 as Numbers, pathed_exports as Pathed, src_exports$1 as Process, src_exports$13 as Random, records_exports as Records, src_exports$15 as Rx, src_exports$12 as Trackers, src_exports$17 as Ui, src_exports$14 as Visual, align, alignById, compareIterableValuesShallow, comparerInverse, continuously, defaultComparer, defaultKeyer, defaultToString, elapsedInfinity, elapsedInterval, elapsedOnce, elapsedSince, elapsedToHumanString, filterValue, hasLast, intervalToMs, isEmptyEntries, isEqualContextString, isEqualDefault, isEqualTrace, isEqualValueDefault, isEqualValueIgnoreOrder, isEqualValuePartial, isInteger, isInterval, isMap, isPrimitive, isPrimitiveOrObject, isReactive, isSet, jsComparer, keyValueSorter, numericComparer, promiseFromEvent, resolve, resolveFields, resolveFieldsSync, resolveSync, resolveWithFallback, resolveWithFallbackSync, runningiOS, sleep, sleepWhile, toStringDefault, toStringOrdered, unique, uniqueInstances };
//# sourceMappingURL=index.js.map