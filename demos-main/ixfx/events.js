//#region ../events/src/map-of.ts
var MapOfSimple = class {
	#store = /* @__PURE__ */ new Map();
	/**
	* Gets a copy of the underlying array storing values at `key`, or an empty array if
	* key does not exist
	* @param key 
	* @returns 
	*/
	get(key) {
		const arr = this.#store.get(key);
		if (!arr) return [];
		return [...arr];
	}
	/**
	* Returns the number of values stored under `key`
	* @param key 
	* @returns 
	*/
	size(key) {
		const arr = this.#store.get(key);
		if (!arr) return 0;
		return arr.length;
	}
	/**
	* Iterate over all values contained under `key`
	* @param key 
	* @returns 
	*/
	*iterateKey(key) {
		const arr = this.#store.get(key);
		if (!arr) return;
		yield* arr.values();
	}
	/**
	* Iterate all values, regardless of key
	*/
	*iterateValues() {
		for (const key of this.#store.keys()) yield* this.iterateKey(key);
	}
	/**
	* Iterate all keys
	*/
	*iterateKeys() {
		yield* this.#store.keys();
	}
	addKeyedValues(key, ...values) {
		let arr = this.#store.get(key);
		if (!arr) {
			arr = [];
			this.#store.set(key, arr);
		}
		arr.push(...values);
	}
	deleteKeyValue(key, value) {
		const arr = this.#store.get(key);
		if (!arr) return false;
		const arrCopy = arr.filter((v) => v !== value);
		if (arrCopy.length === arr.length) return false;
		this.#store.set(key, arrCopy);
		return true;
	}
	clear() {
		this.#store.clear();
	}
};

//#endregion
//#region ../events/src/simple-event-emitter.ts
var SimpleEventEmitter = class {
	#listeners = new MapOfSimple();
	#disposed = false;
	dispose() {
		if (this.#disposed) return;
		this.clearEventListeners();
	}
	get isDisposed() {
		return this.#disposed;
	}
	/**
	* Fire event
	* @param type Type of event
	* @param args Arguments for event
	* @returns
	*/
	fireEvent(type, args) {
		if (this.#disposed) throw new Error(`Disposed`);
		for (const l of this.#listeners.iterateKey(type)) l(args, this);
	}
	/**
	* Adds event listener.
	* 
	* @throws Error if emitter is disposed
	* @typeParam K - Events
	* @param name Event name
	* @param listener Event handler
	*/
	addEventListener(name, listener) {
		if (this.#disposed) throw new Error(`Disposed`);
		this.#listeners.addKeyedValues(name, listener);
	}
	/**
	* Remove event listener
	*
	* @param listener
	*/
	removeEventListener(type, listener) {
		if (this.#disposed) return;
		this.#listeners.deleteKeyValue(type, listener);
	}
	/**
	* Clear all event listeners
	* @private
	*/
	clearEventListeners() {
		if (this.#disposed) return;
		this.#listeners.clear();
	}
};

//#endregion
export { SimpleEventEmitter };
//# sourceMappingURL=events.js.map