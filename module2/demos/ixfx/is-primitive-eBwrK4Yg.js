//#region ../core/dist/src/is-primitive.js
/**
* Returns _true_ if `value` is number, string, bigint or boolean.
* Returns _false_ if `value` is an object, null, undefined
*
* Use {@link isPrimitiveOrObject} to also return true if `value` is an object.
* @param value Value to check
* @returns _True_ if value is number, string, bigint or boolean.
*/
function isPrimitive(value) {
	if (typeof value === `number`) return true;
	if (typeof value === `string`) return true;
	if (typeof value === `bigint`) return true;
	if (typeof value === `boolean`) return true;
	return false;
}
/**
* Returns _true_ if `value` is number, string, bigint, boolean or an object
*
* Use {@link isPrimitive} to not include objects.
* @param value
* @returns
*/
function isPrimitiveOrObject(value) {
	if (isPrimitive(value)) return true;
	if (typeof value === `object`) return true;
	return false;
}

//#endregion
export { isPrimitive, isPrimitiveOrObject };
//# sourceMappingURL=is-primitive-eBwrK4Yg.js.map