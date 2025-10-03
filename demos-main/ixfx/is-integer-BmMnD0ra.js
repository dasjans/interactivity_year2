//#region ../core/dist/src/is-integer.js
/**
* Returns _true_ if `value` is an integer. Parses string input, but
* all other data types return _false_.
*
* ```js
* isInteger(1);      // true
* isInteger(1.1);    // false
* isInteger(`1`);    // true
* isInteger(`1.1`);  // false
* isInteger(true);   // false
* isInteger(false);  // false
* ```
*
* Returns _false_ for _undefined_, NaN, booleans and infinite numbers.
* @param value
* @returns
*/
const isInteger = (value) => {
	if (value === void 0) return false;
	if (typeof value === `string`) {
		const v = Number.parseInt(value);
		if (Number.isNaN(v)) return false;
		if (v.toString() === value.toString()) return true;
		return false;
	}
	if (typeof value === `number`) {
		if (Number.isNaN(value)) return false;
		if (!Number.isFinite(value)) return false;
		if (Math.round(value) === value) return true;
		return false;
	}
	return false;
};

//#endregion
export { isInteger };
//# sourceMappingURL=is-integer-BmMnD0ra.js.map