import { defaultComparer } from "./basic-D0XoOdBJ.js";

//#region ../core/dist/src/key-value.js
const sorterByValueIndex = (index, reverse = false) => {
	return (values) => {
		const s = values.toSorted((a, b) => {
			return defaultComparer(a[index], b[index]);
		});
		if (reverse) return s.reverse();
		return s;
	};
};
const keyValueSorter = (sortStyle) => {
	switch (sortStyle) {
		case `value`: return sorterByValueIndex(1, false);
		case `value-reverse`: return sorterByValueIndex(1, true);
		case `key`: return sorterByValueIndex(0, false);
		case `key-reverse`: return sorterByValueIndex(0, true);
		default: throw new Error(`Unknown sorting value '${sortStyle}'. Expecting: value, value-reverse, key or key-reverse`);
	}
};

//#endregion
export { keyValueSorter };
//# sourceMappingURL=key-value-JSby0EXT.js.map