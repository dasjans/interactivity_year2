//#region ../guards/src/result.ts
const getErrorMessage = (ex) => {
	if (typeof ex === `string`) return ex;
	if (ex instanceof Error) return ex.message;
	return ex;
};
/**
* Throws an error if any result is a failure.
* Error message will be the combined from all errors.
* @param results 
* @returns 
*/
const throwIfFailed = (...results) => {
	const failed = results.filter((r) => resultIsError(r));
	if (failed.length === 0) return;
	const messages = failed.map((f) => resultErrorToString(f));
	throw new Error(messages.join(`, `));
};
/**
* If any of `results` is an error, throws it, otherwise ignored.
* @param results 
* @returns _true_ or throws
*/
function resultThrow(...results) {
	for (const r of results) {
		const rr = typeof r === `object` ? r : r();
		if (rr === void 0) continue;
		if (rr.success) continue;
		throw resultToError(rr);
	}
	return true;
}
function resultThrowSingle(result) {
	if (result.success) return true;
	throw resultToError(result);
}
/**
* Returns the first failed result, or _undefined_ if there are no fails
* @param results 
* @returns 
*/
const resultFirstFail_ = (...results) => {
	for (const r of results) {
		const rr = typeof r === `object` ? r : r();
		if (rr === void 0) continue;
		if (!rr.success) return rr;
	}
};
/**
* Returns _true_ if `result` is an error
* @param result 
* @returns 
*/
function resultIsError(result) {
	if (typeof result !== `object`) return false;
	return !result.success;
}
/**
* Returns _true_ if `result` is OK and has a value
* @param result 
* @returns 
*/
function resultIsOk(result) {
	if (typeof result !== `object`) return false;
	return result.success;
}
/**
* Gets the result as an Error
* @param result 
* @returns 
*/
function resultToError(result) {
	if (typeof result.error === `string`) throw new Error(result.error, { cause: result.info });
	if (result.error instanceof Error) throw result.error;
	return new Error(JSON.stringify(result.error), { cause: result.info });
}
/**
* Unwraps the result, returning its value if OK.
* If not, an exception is thrown.
* @param result 
* @returns 
*/
function resultToValue(result) {
	if (resultIsOk(result)) return result.value;
	throw resultToError(result);
}
/**
* Returns the error as a string.
* @param result 
* @returns 
*/
function resultErrorToString(result) {
	if (result.error instanceof Error) return getErrorMessage(result.error);
	if (typeof result.error === `string`) return result.error;
	return JSON.stringify(result.error);
}
/**
* Returns a {@link ResultError} using 'error' as the message.
* @param error 
* @param info 
* @returns 
*/
function errorResult(error, info) {
	return {
		success: false,
		error,
		info
	};
}
/**
* Returns first failed result or final value.
* @param results 
* @returns 
*/
const resultsCollate = (...results) => {
	let rr;
	for (const r of results) {
		rr = typeof r === `object` ? r : r();
		if (rr === void 0) continue;
		if (!rr.success) return rr;
	}
	if (!rr) throw new Error(`No results`);
	return rr;
};
/**
* If `result` is an error, calls `callback`, passing the error.
* Otherwise does nothing
* @param result 
* @param callback 
*/
const resultWithFail = (result, callback) => {
	if (resultIsError(result)) callback(result);
};

//#endregion
//#region ../guards/src/numbers.ts
/**
* Returns true if `x` is a power of two
* @param x
* @returns True if `x` is a power of two
*/
const isPowerOfTwo = (x) => Math.log2(x) % 1 === 0;
/**
* Returns `fallback` if `v` is NaN, otherwise returns `v`.
* 
* Throws if `v` is not a number type, null or undefined
* @param v
* @param fallback
* @returns
*/
const ifNaN = (v, fallback) => {
	if (typeof v !== `number`) throw new TypeError(`v is not a number. Got: ${typeof v}`);
	if (Number.isNaN(v)) return fallback;
	return v;
};
/**
* Parses `value` as an integer, returning it if it meets the `range` criteria.
* If not, `defaultValue` is returned.
*
* ```js
* const i = integerParse('10', 'positive');    // 10
* const i = integerParse('10.5', 'positive');  // 10
* const i = integerParse('0', 'nonZero', 100); // 100
* ```
*
* NaN is returned if criteria does not match and no default is given
* ```js
* const i = integerParse('10', 'negative');    // NaN
* ```
*
* @param value
* @param range
* @param defaultValue
* @returns
*/
const integerParse = (value, range = ``, defaultValue = NaN) => {
	if (typeof value === `undefined`) return defaultValue;
	if (value === null) return defaultValue;
	try {
		const parsed = Number.parseInt(typeof value === `number` ? value.toString() : value);
		const r = integerTest(parsed, range, `parsed`);
		return r.success ? parsed : defaultValue;
	} catch {
		return defaultValue;
	}
};
/**
* Checks if `t` is not a number or within specified range.
* Returns `[false, reason:string]` if invalid or `[true]` if valid.
* 
* Alternatives: {@link integerTest} for additional integer check, {@link percentTest} for percentage-range.
*
* * (empty, default): must be a number type and not NaN.
* * finite: must be a number, not NaN and not infinite
* * positive: must be at least zero
* * negative: must be zero or lower
* * aboveZero: must be above zero
* * belowZero: must be below zero
* * percentage: must be within 0-1, inclusive
* * nonZero: can be anything except zero
* * bipolar: can be -1 to 1, inclusive
* @param value Value to check
* @param parameterName Name of parameter (for more helpful exception messages)
* @param range Range to enforce
* @returns
*/
const numberTest = (value, range = ``, parameterName = `?`, info) => {
	if (value === null) return {
		success: false,
		error: `Parameter '${parameterName}' is null`,
		info
	};
	if (typeof value === `undefined`) return {
		success: false,
		error: `Parameter '${parameterName}' is undefined`,
		info
	};
	if (Number.isNaN(value)) return {
		success: false,
		error: `Parameter '${parameterName}' is NaN`,
		info
	};
	if (typeof value !== `number`) return {
		success: false,
		error: `Parameter '${parameterName}' is not a number (${JSON.stringify(value)})`,
		info
	};
	switch (range) {
		case `finite`: {
			if (!Number.isFinite(value)) return {
				success: false,
				error: `Parameter '${parameterName} must be finite (Got: ${value})`,
				info
			};
			break;
		}
		case `positive`: {
			if (value < 0) return {
				success: false,
				error: `Parameter '${parameterName}' must be at least zero (${value})`,
				info
			};
			break;
		}
		case `negative`: {
			if (value > 0) return {
				success: false,
				error: `Parameter '${parameterName}' must be zero or lower (${value})`,
				info
			};
			break;
		}
		case `aboveZero`: {
			if (value <= 0) return {
				success: false,
				error: `Parameter '${parameterName}' must be above zero (${value})`,
				info
			};
			break;
		}
		case `belowZero`: {
			if (value >= 0) return {
				success: false,
				error: `Parameter '${parameterName}' must be below zero (${value})`,
				info
			};
			break;
		}
		case `percentage`: {
			if (value > 1 || value < 0) return {
				success: false,
				error: `Parameter '${parameterName}' must be in percentage range (0 to 1). (${value})`,
				info
			};
			break;
		}
		case `nonZero`: {
			if (value === 0) return {
				success: false,
				error: `Parameter '${parameterName}' must non-zero. (${value})`,
				info
			};
			break;
		}
		case `bipolar`: {
			if (value > 1 || value < -1) return {
				success: false,
				error: `Parameter '${parameterName}' must be in bipolar percentage range (-1 to 1). (${value})`,
				info
			};
			break;
		}
	}
	return {
		success: true,
		value,
		info
	};
};
/**
* Checks if `t` is not a number or within specified range.
* Throws if invalid. Use {@link numberTest} to test without throwing.
*
* * (empty, default): must be a number type and not NaN.
* * positive: must be at least zero
* * negative: must be zero or lower
* * aboveZero: must be above zero
* * belowZero: must be below zero
* * percentage: must be within 0-1, inclusive
* * nonZero: can be anything except zero
* * bipolar: can be -1 to 1, inclusive
* 
* Alternatives: {@link integerTest} for additional integer check, {@link percentTest} for percentage-range.
* @param value Value to test
* @param range Range
* @param parameterName Name of parameter 
*/
/**
* Compares two numbers with a given number of decimal places
* ```js
* a: 10.123 b: 10.1    decimals: 1 = true
* a: 10.123 b: 10.2    decimals: 0 = true
* a: 10.123 b: 10.14   decimals: 1 = true
* a: 10.123 b: 10.14   decimals: 2 = false
* ``
* @param a 
* @param b 
* @param decimals How many decimals to include
* @returns 
*/
const numberDecimalTest = (a, b, decimals = 3) => {
	if (decimals === 0) {
		a = Math.floor(a);
		b = Math.floor(b);
		if (a === b) return {
			success: true,
			value: a
		};
		return {
			success: false,
			error: `A is not identical to B`
		};
	}
	const mult = Math.pow(10, decimals);
	const aa = Math.floor(a * mult);
	const bb = Math.floor(b * mult);
	if (aa !== bb) return {
		success: false,
		error: `A is not close enough to B. A: ${a} B: ${b} Decimals: ${decimals}`
	};
	return {
		success: true,
		value: a
	};
};
/**
* Returns test of `value` being in the range of 0-1.
* Equiv to `number(value, `percentage`);`
*
* This is the same as calling ```number(t, `percentage`)```
* @param value Value to check
* @param parameterName Param name for customising exception message
* @returns
*/
const percentTest = (value, parameterName = `?`, info) => numberTest(value, `percentage`, parameterName, info);
/**
* Checks if `value` an integer and meets additional criteria.
* See {@link numberTest} for guard details, or use that if integer checking is not required.
*
* Note:
* * `bipolar` will mean -1, 0 or 1.
* * positive: must be at least zero
* * negative: must be zero or lower
* * aboveZero: must be above zero
* * belowZero: must be below zero
* * percentage: must be within 0-1, inclusive
* * nonZero: can be anything except zero
* @param value Value to check
* @param parameterName Param name for customising exception message
* @param range Guard specifier.
*/
const integerTest = (value, range = ``, parameterName = `?`) => {
	return resultsCollate(numberTest(value, range, parameterName), () => {
		if (!Number.isInteger(value)) return {
			success: false,
			error: `Param '${parameterName}' is not an integer`
		};
		return {
			success: true,
			value
		};
	});
};
const integerArrayTest = (numbers) => {
	for (const v of numbers) if (Math.abs(v) % 1 !== 0) return {
		success: false,
		error: `Value is not an integer: ${v}`
	};
	return {
		success: true,
		value: numbers
	};
};
/**
* Returns _true_ if `value` is an integer in number or string form
* @param value 
* @returns 
*/
const isInteger = (value) => {
	if (typeof value === `string`) value = Number.parseFloat(value);
	const r = integerTest(value);
	return r.success;
};
const numberInclusiveRangeTest = (value, min, max, parameterName = `?`) => {
	if (typeof value !== `number`) return {
		success: false,
		error: `Param '${parameterName}' is not a number type. Got type: '${typeof value}' value: '${JSON.stringify(value)}'`
	};
	if (Number.isNaN(value)) return {
		success: false,
		error: `Param '${parameterName}' is not within range ${min}-${max}. Got: NaN`
	};
	if (Number.isFinite(value)) {
		if (value < min) return {
			success: false,
			error: `Param '${parameterName}' is below range ${min}-${max}. Got: ${value}`
		};
		else if (value > max) return {
			success: false,
			error: `Param '${parameterName}' is above range ${min}-${max}. Got: ${value}`
		};
		return {
			success: true,
			value
		};
	} else return {
		success: false,
		error: `Param '${parameterName}' is not within range ${min}-${max}. Got: infinite`
	};
};

//#endregion
//#region ../guards/src/arrays.ts
/**
* Throws an error if parameter is not an array
* @param value
* @param parameterName
*/
const arrayTest = (value, parameterName = `?`) => {
	if (!Array.isArray(value)) return {
		success: false,
		error: `Parameter '${parameterName}' is expected to be an array'`
	};
	return {
		success: true,
		value
	};
};
/**
* Throws if `index` is an invalid array index for `array`, and if
* `array` itself is not a valid array.
* @param array
* @param index
*/
const arrayIndexTest = (array, index, name = `index`) => {
	return resultsCollate(arrayTest(array), integerTest(index, `positive`, name), numberInclusiveRangeTest(index, 0, array.length - 1, name));
};
/**
* Returns true if parameter is an array of strings
* @param value
* @returns
*/
const arrayStringsTest = (value) => {
	if (!Array.isArray(value)) return {
		success: false,
		error: `Value is not an array`
	};
	if (value.some((v) => typeof v !== `string`)) return {
		success: false,
		error: `Contains something not a string`
	};
	return {
		success: true,
		value
	};
};

//#endregion
//#region ../guards/src/empty.ts
const nullUndefTest = (value, parameterName = `?`) => {
	if (typeof value === `undefined`) return {
		success: false,
		error: `${parameterName} param is undefined`
	};
	if (value === null) return {
		success: false,
		error: `${parameterName} param is null`
	};
	return {
		success: true,
		value
	};
};
const isDefined = (argument) => argument !== void 0;

//#endregion
//#region ../guards/src/function.ts
const isFunction = (object) => object instanceof Function;
const functionTest = (value, parameterName = `?`) => {
	if (value === void 0) return {
		success: false,
		error: `Param '${parameterName}' is undefined. Expected: function.`
	};
	if (value === null) return {
		success: false,
		error: `Param '${parameterName}' is null. Expected: function.`
	};
	if (typeof value !== `function`) return {
		success: false,
		error: `Param '${parameterName}' is type '${typeof value}'. Expected: function`
	};
	return {
		success: true,
		value
	};
};

//#endregion
//#region ../guards/src/object.ts
/**
* Tests_if `value` is a plain object
* 
* ```js
* isPlainObject(`text`); // false
* isPlainObject(document); // false
* isPlainObject({ hello: `there` }); // true
* ```
* @param value 
* @returns 
*/
const testPlainObject = (value) => {
	if (typeof value !== `object` || value === null) return {
		success: false,
		error: `Value is null or not object type`
	};
	const prototype = Object.getPrototypeOf(value);
	const t = (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
	if (t) return {
		success: true,
		value
	};
	return {
		success: false,
		error: `Fancy object`
	};
};
/**
* Tests if `value` is primitive value (bigint,number,string or boolean) or plain object
* @param value 
* @returns 
*/
const testPlainObjectOrPrimitive = (value) => {
	const t = typeof value;
	if (t === `symbol`) return {
		success: false,
		error: `Symbol type`
	};
	if (t === `function`) return {
		success: false,
		error: `Function type`
	};
	if (t === `bigint`) return {
		success: true,
		value
	};
	if (t === `number`) return {
		success: true,
		value
	};
	if (t === `string`) return {
		success: true,
		value
	};
	if (t === `boolean`) return {
		success: true,
		value
	};
	return testPlainObject(value);
};

//#endregion
//#region ../guards/src/range.ts
const rangeIntegerTest = (v, expected) => {
	return resultsCollate(rangeTest(v, expected), integerArrayTest(v));
};
/**
* Inclusive range 4-6 = 4, 5, 6
* Exclusive range 4-6 = 5
* 
* @param numbers 
* @param expected 
* @returns 
*/
const rangeTest = (numbers, expected) => {
	for (const v of numbers) {
		if (expected.minExclusive !== void 0) {
			if (v <= expected.minExclusive) return {
				success: false,
				error: `Value '${v}' must be higher than minExclusive: '${expected.minExclusive}'`
			};
		}
		if (expected.minInclusive !== void 0) {
			if (v < expected.minInclusive) return {
				success: false,
				error: `Value '${v}' must be equal or higher than minInclusive: '${expected.minInclusive}'`
			};
		}
		if (expected.maxExclusive !== void 0) {
			if (v >= expected.maxExclusive) return {
				success: false,
				error: `Value '${v}' must be less than maxExclusive: '${expected.maxExclusive}'`
			};
		}
		if (expected.maxInclusive !== void 0) {
			if (v > expected.maxInclusive) return {
				success: false,
				error: `Value '${v}' must be equal or less than maxInclusive: '${expected.maxInclusive}'`
			};
		}
	}
	return {
		success: true,
		value: numbers
	};
};

//#endregion
//#region ../guards/src/string.ts
/**
* Throws an error if parameter is not an string
* @param value
* @param parameterName
*/
const stringTest = (value, range = ``, parameterName = `?`) => {
	if (typeof value !== `string`) return {
		success: false,
		error: `Param '${parameterName} is not type string. Got: ${typeof value}`
	};
	switch (range) {
		case `non-empty`:
			if (value.length === 0) return {
				success: false,
				error: `Param '${parameterName} is empty`
			};
			break;
	}
	return {
		success: true,
		value
	};
};

//#endregion
export { arrayIndexTest, arrayStringsTest, arrayTest, errorResult, functionTest, getErrorMessage, ifNaN, integerArrayTest, integerParse, integerTest, isDefined, isFunction, isInteger, isPowerOfTwo, nullUndefTest, numberDecimalTest, numberInclusiveRangeTest, numberTest, percentTest, rangeIntegerTest, rangeTest, resultErrorToString, resultFirstFail_, resultIsError, resultIsOk, resultThrow, resultThrowSingle, resultToError, resultToValue, resultWithFail, resultsCollate, stringTest, testPlainObject, testPlainObjectOrPrimitive, throwIfFailed };
//# sourceMappingURL=guards.js.map