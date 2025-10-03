//#region ../process/src/basic.ts
/**
* Outputs the current largest-seen value
* @returns 
*/
const max = () => {
	let max$1 = Number.MIN_SAFE_INTEGER;
	const compute = (value) => {
		const valueArray = Array.isArray(value) ? value : [value];
		for (const subValue of valueArray) {
			if (typeof subValue !== `number`) break;
			max$1 = Math.max(subValue, max$1);
		}
		return max$1;
	};
	return compute;
};
/**
* Outputs the current smallest-seen value
* @returns
*/
const min = () => {
	let min$1 = Number.MAX_SAFE_INTEGER;
	const compute = (value) => {
		const valueArray = Array.isArray(value) ? value : [value];
		for (const subValue of valueArray) {
			if (typeof subValue !== `number`) break;
			min$1 = Math.min(subValue, min$1);
		}
		return min$1;
	};
	return compute;
};
/**
* Returns a sum of values
* @returns 
*/
const sum = () => {
	let t = 0;
	const compute = (value) => {
		const valueArray = Array.isArray(value) ? value : [value];
		for (const subValue of valueArray) {
			if (typeof subValue !== `number`) continue;
			t += subValue;
		}
		return t;
	};
	return compute;
};
/**
* Returns the current average of input values
* @returns 
*/
const average = () => {
	let total = 0;
	let tally$1 = 0;
	const compute = (value) => {
		const valueArray = Array.isArray(value) ? value : [value];
		for (const subValue of valueArray) {
			if (typeof subValue !== `number`) continue;
			tally$1++;
			total += subValue;
		}
		return total / tally$1;
	};
	return compute;
};
/**
* Returns the tally (ie number of) values
* @param countArrayItems 
* @returns 
*/
const tally = (countArrayItems) => {
	let t = 0;
	const compute = (value) => {
		if (countArrayItems) if (Array.isArray(value)) t += value.length;
		else t++;
		else t++;
		return t;
	};
	return compute;
};
/**
* Returns the 'best' value seen so far as determined by a ranking function.
* This is similar to min/max but usable for objects.
* @param r 
* @param options 
* @returns 
*/
function rank(r, options = {}) {
	const includeType = options.includeType;
	const emitEqualRanked = options.emitEqualRanked ?? false;
	const emitRepeatHighest = options.emitRepeatHighest ?? false;
	let best;
	return (value) => {
		if (includeType && typeof value !== includeType) return;
		if (best === void 0) {
			best = value;
			return best;
		} else {
			const result = r(value, best);
			if (result == `a`) {
				best = value;
				return best;
			} else if (result === `eq` && emitEqualRanked) return best;
			else if (emitRepeatHighest) return best;
		}
	};
}

//#endregion
//#region ../process/src/cancel-error.ts
var CancelError = class extends Error {
	constructor(message) {
		super(message);
		this.name = `CancelError`;
	}
};

//#endregion
//#region ../process/src/flow.ts
/**
* Creates a flow of data processors (up to 5 are supported).
* The flow is encapsulated in a function that accepts an input value an returns an output.
* 
* ```js
* const p = flow(
*  (value:string) => value.toUpperCase(), // Convert to uppercase
*  (value:string) => value.at(0) === 'A') // If first letter is an A, return true
* );
* p('apple'); // True
* ```
* 
* Each processing function is expected to take in one input value and return one value.
* @param processors 
* @returns 
*/
function flow(...processors) {
	return (value) => {
		let v = value;
		for (const p of processors) try {
			v = p(v);
		} catch (err) {
			if (err instanceof CancelError) break;
			else throw err;
		}
		return v;
	};
}

//#endregion
//#region ../process/src/if-undefined.ts
/**
* Calls a function if the input value is not undefined.
* Return value from function is passed to next function in flow.
* 
* ```js
* const flow = Process.flow(
*  Process.max(),
*  Process.seenLastToUndefined(),
*  Process.ifNotUndefined(v => {
*    console.log(`v:`, v);
*  })
* );
* flow(100); // Prints 'v:100'
* flow(90);  // Nothing happens max value has not changed
* flow(110); // Prints 'v:110'
* ```
* @param fn 
* @returns 
*/
function ifNotUndefined(fn) {
	return (value) => {
		if (value === void 0) return value;
		const v = fn(value);
		return v;
	};
}
/**
* Cancels the remaining flow operations if _undefined_ is an input.
* See also {@link ifUndefined} or {@link ifNotUndefined}.
* 
* ```js
* const c3 = Process.flow(
*  Basic.max(),
*  Process.seenLastToUndefined(),
*  Process.cancelIfUndefined(),
*  (v => {
*   console.log(v);
*  })
* );
* c3(100); // Prints '100'
* c3(90);  // Doesn't print anything since max does not change
* c3(110); // Prints '110'
* ```
* @returns 
*/
function cancelIfUndefined() {
	return (value) => {
		if (value === void 0) throw new CancelError(`cancel`);
		return value;
	};
}
/**
* Returns the output of `fn` if the input value is _undefined_.
* See also: {@link ifNotUndefined} and {@link cancelIfUndefined}.
* @param fn 
* @returns 
*/
function ifUndefined(fn) {
	return (value) => {
		if (value === void 0) return fn();
		else return value;
	};
}

//#endregion
//#region ../process/src/util.ts
/**
* Default comparer function is equiv to checking `a === b`.
* Use {@link isEqualValueDefault} to compare by value, via comparing JSON string representation.
*/
const isEqualDefault = (a, b) => a === b;
/**
* A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
*/
const toStringDefault = (itemToMakeStringFor) => typeof itemToMakeStringFor === `string` ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor);

//#endregion
//#region ../process/src/seen.ts
/**
* If a value is same as the previous value, _undefined_ is emitted instead.
* 
* @param eq Equality function. If not specified, === semantics are used.
* @returns 
*/
function seenLastToUndefined(eq) {
	if (typeof eq === `undefined`) eq = isEqualDefault;
	let lastValue;
	return (value) => {
		if (value !== lastValue) {
			lastValue = value;
			return value;
		}
		return void 0;
	};
}
/**
* If a value is same as any previously-seen value, _undefined_ is emitted instead.
* 
* It stores all previous values and compares against them for each new value. 
* This would likely be not very efficient compared to {@link seenToUndefinedByKey} which uses a one-time computed
* key and efficient storage of only the keys (using a Set).
*  
* @param eq Equality function. If not specified, === semantics are used.
* @returns 
*/
function seenToUndefined(eq) {
	const seen = [];
	if (typeof eq === `undefined`) eq = isEqualDefault;
	return (value) => {
		if (value === void 0) return;
		for (const s of seen) if (eq(s, value)) return;
		seen.push(value);
		return value;
	};
}
/**
* If a value is the same as any previously-seen value, _undefined_ is emitted instead.
* 
* This version uses a function to create a string key of the object, by default JSON.stringify.
* Thus we don't need to store all previously seen objects, just their keys.
* 
* Alternatively, if a key function doesn't make sense for the value, use
* {@link seenToUndefined}, which stores the values (less efficient).
* 
* @param toString 
* @returns 
*/
function seenToUndefinedByKey(toString) {
	const seen = /* @__PURE__ */ new Set();
	if (typeof toString === `undefined`) toString = toStringDefault;
	return (value) => {
		if (value === void 0) return;
		const key = toString(value);
		if (seen.has(key)) return;
		seen.add(key);
		return value;
	};
}

//#endregion
export { CancelError, average, cancelIfUndefined, flow, ifNotUndefined, ifUndefined, max, min, rank, seenLastToUndefined, seenToUndefined, seenToUndefinedByKey, sum, tally };
//# sourceMappingURL=process.js.map