import { __export } from "./chunk-51aI8Tpl.js";
import { errorResult, integerTest, numberTest, percentTest, resultThrow } from "./src-BBD50Kth.js";
import { zipKeyValue } from "./basic-D0XoOdBJ.js";
import { clamp$1 as clamp, clampIndex, dotProduct, linearSpace, minFast, minIndex, movingAverageLight, quantiseEvery, round, scale, sortByNumericProperty, wrap } from "./src-2eX6lIN8.js";
import { mutable } from "./src-BnNr7xTX.js";
import { Bezier, ObjectTracker, TrackedValueMap, randomElement } from "./bezier-5SBfGcNj.js";

//#region ../geometry/dist/src/point/guard.js
/**
* Returns true if xy (and z, if present) are _null_.
* @param p
* @returns
*/
const isNull = (p) => {
	if (isPoint3d(p)) {
		if (p.z !== null) return false;
	}
	return p.x === null && p.y === null;
};
/***
* Returns true if either x, y, z isNaN.
*/
const isNaN$1 = (p) => {
	if (isPoint3d(p)) {
		if (!Number.isNaN(p.z)) return false;
	}
	return Number.isNaN(p.x) || Number.isNaN(p.y);
};
function test(p, name = `Point`, extraInfo = ``) {
	if (p === void 0) return errorResult(`'${name}' is undefined. Expected {x,y} got ${JSON.stringify(p)}`, extraInfo);
	if (p === null) return errorResult(`'${name}' is null. Expected {x,y} got ${JSON.stringify(p)}`, extraInfo);
	if (typeof p !== `object`) return errorResult(`'${name}' is type '${typeof p}'. Expected object.`, extraInfo);
	if (p.x === void 0) return errorResult(`'${name}.x' is undefined. Expected {x,y} got ${JSON.stringify(p)}`, extraInfo);
	if (p.y === void 0) return errorResult(`'${name}.y' is undefined. Expected {x,y} got ${JSON.stringify(p)}`, extraInfo);
	if (typeof p.x !== `number`) return errorResult(`'${name}.x' must be a number. Got ${typeof p.x}`, extraInfo);
	if (typeof p.y !== `number`) return errorResult(`'${name}.y' must be a number. Got ${typeof p.y}`, extraInfo);
	if (p.z !== void 0) {
		if (typeof p.z !== `number`) return errorResult(`${name}.z must be a number. Got: ${typeof p.z}`, extraInfo);
		if (Number.isNaN(p.z)) return errorResult(`'${name}.z' is NaN. Got: ${JSON.stringify(p)}`, extraInfo);
	}
	if (p.x === null) return errorResult(`'${name}.x' is null`, extraInfo);
	if (p.y === null) return errorResult(`'${name}.y' is null`, extraInfo);
	if (Number.isNaN(p.x)) return errorResult(`'${name}.x' is NaN`, extraInfo);
	if (Number.isNaN(p.y)) return errorResult(`'${name}.y' is NaN`, extraInfo);
	return {
		success: true,
		value: p
	};
}
/**
* Throws an error if point is invalid
* @param p
* @param name
*/
function guard$1(p, name = `Point`, info) {
	resultThrow(test(p, name, info));
}
/**
* Throws if parameter is not a valid point, or either x or y is 0
* @param pt
* @returns
*/
const guardNonZeroPoint = (pt, name = `pt`) => {
	guard$1(pt, name);
	resultThrow(numberTest(pt.x, `nonZero`, `${name}.x`), numberTest(pt.y, `nonZero`, `${name}.y`), () => {
		if (typeof pt.z !== `undefined`) return numberTest(pt.z, `nonZero`, `${name}.z`);
	});
	return true;
};
/**
* Returns _true_ if `p` has x & y properties.
* Returns _false_ if `p` is undefined, null or does not contain properties.
* Use {@link isPoint3d} to check further check for `z`.
* @param p
* @returns
*/
function isPoint(p) {
	if (p === void 0) return false;
	if (p === null) return false;
	if (p.x === void 0) return false;
	if (p.y === void 0) return false;
	return true;
}
/**
* Returns _true_ if `p` has x, y, & z properties.
* Returns _false_ if `p` is undefined, null or does not contain properties.
* @param p
* @returns
*/
const isPoint3d = (p) => {
	if (p === void 0) return false;
	if (p === null) return false;
	if (p.x === void 0) return false;
	if (p.y === void 0) return false;
	if (p.z === void 0) return false;
	return true;
};
/**
* Returns true if both xy (and z, if present) are 0.
* Use `Points.Empty` to return an empty point.
* @param p
* @returns
*/
const isEmpty = (p) => {
	if (isPoint3d(p)) {
		if (p.z !== 0) return false;
	}
	return p.x === 0 && p.y === 0;
};
/**
* Returns true if point is a placeholder, where xy (and z, if present)
* are `NaN`.
*
* Use Points.Placeholder to return a placeholder point.
* @param p
* @returns
*/
const isPlaceholder = (p) => {
	if (isPoint3d(p)) {
		if (!Number.isNaN(p.z)) return false;
	}
	return Number.isNaN(p.x) && Number.isNaN(p.y);
};

//#endregion
//#region ../geometry/dist/src/rect/guard.js
/**
* Throws an error if the dimensions of the rectangle are undefined, NaN or negative.
* @param d
* @param name
*/
const guardDim = (d, name = `Dimension`) => {
	if (d === void 0) throw new Error(`${name} is undefined`);
	if (Number.isNaN(d)) throw new Error(`${name} is NaN`);
	if (d < 0) throw new Error(`${name} cannot be negative`);
};
/**
* Throws an error if rectangle is missing fields or they
* are not valid.
*
* Checks:
* * `width` and `height` must be defined on `rect`
* * dimensions (w & h) must not be NaN
* * dimensions (w & h) must not be negative
*
* If `rect` has x,y, this value is checked as well.
* @param rect
* @param name
*/
const guard$6 = (rect, name = `rect`) => {
	if (rect === void 0) throw new Error(`{$name} undefined`);
	if (isPositioned$1(rect)) guard$1(rect, name);
	guardDim(rect.width, name + `.width`);
	guardDim(rect.height, name + `.height`);
};
/**
* Returns a positioned rect or if it's not possible, throws an error.
*
* If `rect` does not have a position, `origin` is used.
* If `rect` is positioned and `origin` is provided, returned result uses `origin` as x,y instead.
* ```js
* // Returns input because it's positioned
* getRectPositioned({ x:1, y:2, width:10, height:20 });
*
* // Returns { x:1, y:2, width:10, height:20 }
* getRectPositioned({ width:10, height:20 }, { x:1, y:2 });
*
* // Throws, because we have no point
* getRectPositioned({width:10,height:20})
* ```
* @param rect
* @param origin
* @returns
*/
const getRectPositioned = (rect, origin) => {
	guard$6(rect);
	if (isPositioned$1(rect) && origin === void 0) return rect;
	if (origin === void 0) throw new Error(`Unpositioned rect needs origin parameter`);
	return Object.freeze({
		...rect,
		...origin
	});
};
/**
* Throws an error if `rect` is does not have a position, or
* is an invalid rectangle
* @param rect
* @param name
*/
const guardPositioned$1 = (rect, name = `rect`) => {
	if (!isPositioned$1(rect)) throw new Error(`Expected ${name} to have x,y`);
	guard$6(rect, name);
};
/**
* Returns _true_ if `rect` has width and height values of 0.
* Use Rects.Empty or Rects.EmptyPositioned to generate an empty rectangle.
* @param rect
* @returns
*/
const isEmpty$3 = (rect) => rect.width === 0 && rect.height === 0;
/**
* Returns _true_ if `rect` is a placeholder, with both width and height values of NaN.
* Use Rects.Placeholder or Rects.PlaceholderPositioned to generate a placeholder.
* @param rect
* @returns
*/
const isPlaceholder$3 = (rect) => Number.isNaN(rect.width) && Number.isNaN(rect.height);
/**
* Returns _true_ if `rect` has position (x,y) fields.
* @param rect Point, Rect or RectPositiond
* @returns
*/
const isPositioned$1 = (rect) => rect.x !== void 0 && rect.y !== void 0;
/**
* Returns _true_ if `rect` has width and height fields.
* @param rect
* @returns
*/
const isRect = (rect) => {
	if (rect === void 0) return false;
	if (rect.width === void 0) return false;
	if (rect.height === void 0) return false;
	return true;
};
/**
* Returns _true_ if `rect` is a positioned rectangle
* Having width, height, x and y properties.
* @param rect
* @returns
*/
const isRectPositioned = (rect) => isRect(rect) && isPositioned$1(rect);

//#endregion
//#region ../geometry/dist/src/rect/area.js
/**
* Returns the area of `rect`
*
* ```js
* const rect = { width: 100, height: 100, x: 100, y: 100 };
* Rects.area(rect);
* ```
* @param rect
* @returns
*/
const area$5 = (rect) => {
	guard$6(rect);
	return rect.height * rect.width;
};

//#endregion
//#region ../geometry/dist/src/rect/apply.js
/**
* Applies an operation over each field of a rectangle.
* ```js
* // Convert x,y,width,height to integer values
* applyFields(v => Number.floor(v), someRect);
* ```
* @param op
* @param rectOrWidth
* @param heightValue
* @returns
*/
function applyFields(op, rectOrWidth, heightValue) {
	let width = typeof rectOrWidth === `number` ? rectOrWidth : rectOrWidth.width;
	let height$3 = typeof rectOrWidth === `number` ? heightValue : rectOrWidth.height;
	if (width === void 0) throw new Error(`Param 'width' undefined`);
	if (height$3 === void 0) throw new Error(`Param 'height' undefined`);
	width = op(width, `width`);
	height$3 = op(height$3, `height`);
	if (typeof rectOrWidth === `object`) if (isPositioned$1(rectOrWidth)) {
		const x = op(rectOrWidth.x, `x`);
		const y = op(rectOrWidth.y, `y`);
		return {
			...rectOrWidth,
			width,
			height: height$3,
			x,
			y
		};
	} else return {
		...rectOrWidth,
		width,
		height: height$3
	};
	return {
		width,
		height: height$3
	};
}
/**
* Applies an joint operation field-wise on two rectangles, returning a single rectangle. This is used to support operations like summing two rectangles.
* ```js
* // Eg make a new rectangle by summing each field of rectangle A & B.
* apply((valueA,valueB) => valueA+valueB, rectA, rectB);
* ```
* @param op
* @param a
* @param b
* @param c
* @returns
*/
function applyMerge(op, a, b, c) {
	guard$6(a, `a`);
	if (isRect(b)) return isRectPositioned(a) ? Object.freeze({
		...a,
		x: op(a.x, b.width),
		y: op(a.y, b.height),
		width: op(a.width, b.width),
		height: op(a.height, b.height)
	}) : Object.freeze({
		...a,
		width: op(a.width, b.width),
		height: op(a.height, b.height)
	});
	else {
		if (typeof b !== `number`) throw new TypeError(`Expected second parameter of type Rect or number. Got ${JSON.stringify(b)}`);
		if (typeof c !== `number`) throw new Error(`Expected third param as height. Got ${JSON.stringify(c)}`);
		return isRectPositioned(a) ? Object.freeze({
			...a,
			x: op(a.x, b),
			y: op(a.y, c),
			width: op(a.width, b),
			height: op(a.height, c)
		}) : Object.freeze({
			...a,
			width: op(a.width, b),
			height: op(a.height, c)
		});
	}
}
function applyScalar(op, rect, parameter) {
	return isPositioned$1(rect) ? Object.freeze({
		...rect,
		x: op(rect.x, parameter),
		y: op(rect.y, parameter),
		width: op(rect.width, parameter),
		height: op(rect.height, parameter)
	}) : Object.freeze({
		...rect,
		width: op(rect.width, parameter),
		height: op(rect.height, parameter)
	});
}
/**
* Applies `op` with `param` to `rect`'s width and height.
* @param op
* @param rect
* @param parameter
* @returns
*/
function applyDim(op, rect, parameter) {
	return Object.freeze({
		...rect,
		width: op(rect.width, parameter),
		height: op(rect.height, parameter)
	});
}

//#endregion
//#region ../geometry/dist/src/rect/cardinal.js
/**
* Returns a point on cardinal direction, or 'center' for the middle.
*
* ```js
* cardinal({x: 10, y:10, width:100, height: 20}, 'center');
* ```
* @param rect Rectangle
* @param card Cardinal direction or 'center'
* @returns Point
*/
const cardinal = (rect, card) => {
	const { x, y, width, height: height$3 } = rect;
	switch (card) {
		case `nw`: return Object.freeze({
			x,
			y
		});
		case `n`: return Object.freeze({
			x: x + width / 2,
			y
		});
		case `ne`: return Object.freeze({
			x: x + width,
			y
		});
		case `sw`: return Object.freeze({
			x,
			y: y + height$3
		});
		case `s`: return Object.freeze({
			x: x + width / 2,
			y: y + height$3
		});
		case `se`: return Object.freeze({
			x: x + width,
			y: y + height$3
		});
		case `w`: return Object.freeze({
			x,
			y: y + height$3 / 2
		});
		case `e`: return Object.freeze({
			x: x + width,
			y: y + height$3 / 2
		});
		case `center`: return Object.freeze({
			x: x + width / 2,
			y: y + height$3 / 2
		});
		default: throw new Error(`Unknown direction: ${card}`);
	}
};

//#endregion
//#region ../geometry/dist/src/rect/center.js
/**
* Returns the center of a rectangle as a {@link Point}.
*  If the rectangle lacks a position and `origin` parameter is not provided, 0,0 is used instead.
*
* ```js
* const p = Rects.center({x:10, y:20, width:100, height:50});
* const p2 = Rects.center({width: 100, height: 50}); // Assumes 0,0 for rect x,y
* ```
* @param rect Rectangle
* @param origin Optional origin. Overrides `rect` position if available. If no position is available 0,0 is used by default.
* @returns
*/
const center$1 = (rect, origin) => {
	guard$6(rect);
	if (origin === void 0 && isPoint(rect)) origin = rect;
	else if (origin === void 0) origin = {
		x: 0,
		y: 0
	};
	const r = getRectPositioned(rect, origin);
	return Object.freeze({
		x: origin.x + rect.width / 2,
		y: origin.y + rect.height / 2
	});
};

//#endregion
//#region ../geometry/dist/src/rect/center-origin.js
/**
* Perform basic point translation using a rectangle where its center is the origin.
*
* Thus the relative coordinate { x: 0, y: 0} corresponds to the absolute middle of the
* rectangle.
*
* The relative coordinate { x: -1, y: -1 } corresponds to the rectangle's {x,y} properties, and so on.
* @param rectAbsolute
* @returns
*/
const centerOrigin = (rectAbsolute) => {
	const c = center$1(rectAbsolute);
	const w = rectAbsolute.width / 2;
	const h = rectAbsolute.height / 2;
	const relativeToAbsolute = (point$1) => {
		return {
			...point$1,
			x: point$1.x * w + c.x,
			y: point$1.y * h + c.y
		};
	};
	const absoluteToRelative = (point$1) => {
		return {
			...point$1,
			x: (point$1.x - rectAbsolute.x) / w - 1,
			y: (point$1.y - rectAbsolute.y) / h - 1
		};
	};
	return {
		relativeToAbsolute,
		absoluteToRelative
	};
};

//#endregion
//#region ../geometry/dist/src/point/point-type.js
/**
* Placeholder point: `{ x: NaN, y: NaN }`
* Use `isPlaceholder` to check if a point is a placeholder.
* Use `Placeholder3d` get a point with `z` property.
*/
const Placeholder$2 = Object.freeze({
	x: NaN,
	y: NaN
});
/**
* Placeholder point: `{x: NaN, y:NaN, z:NaN }`
* Use `isPlaceholder` to check if a point is a placeholder.
* Use `Placeholder` to get a point without `z` property.
*/
const Placeholder3d = Object.freeze({
	x: NaN,
	y: NaN,
	z: NaN
});

//#endregion
//#region ../geometry/dist/src/rect/corners.js
/**
* Returns the four corners of a rectangle as an array of Points.
*
* ```js
* const rect = { width: 100, height: 100, x: 0, y: 0};
* const pts = Rects.corners(rect);
* ```
*
* If the rectangle is not positioned, is origin can be provided.
* Order of corners: ne, nw, sw, se
* @param rect
* @param origin
* @returns
*/
const corners$1 = (rect, origin) => {
	const r = getRectPositioned(rect, origin);
	return [
		{
			x: r.x,
			y: r.y
		},
		{
			x: r.x + r.width,
			y: r.y
		},
		{
			x: r.x + r.width,
			y: r.y + r.height
		},
		{
			x: r.x,
			y: r.y + r.height
		}
	];
};

//#endregion
//#region ../geometry/dist/src/circle/guard.js
/**
* Throws if radius is out of range. If x,y is present, these will be validated too.
* @param circle
* @param parameterName
*/
const guard$2 = (circle, parameterName = `circle`) => {
	if (isCirclePositioned(circle)) guard$1(circle, `circle`);
	if (Number.isNaN(circle.radius)) throw new Error(`${parameterName}.radius is NaN`);
	if (circle.radius <= 0) throw new Error(`${parameterName}.radius must be greater than zero`);
};
/**
* Throws if `circle` is not positioned or has dodgy fields
* @param circle
* @param parameterName
* @returns
*/
const guardPositioned = (circle, parameterName = `circle`) => {
	if (!isCirclePositioned(circle)) throw new Error(`Expected a positioned circle with x,y`);
	guard$2(circle, parameterName);
};
/***
* Returns true if radius, x or y are NaN
*/
const isNaN = (a) => {
	if (Number.isNaN(a.radius)) return true;
	if (isCirclePositioned(a)) {
		if (Number.isNaN(a.x)) return true;
		if (Number.isNaN(a.y)) return true;
	}
	return false;
};
/**
* Returns true if parameter has x,y. Does not verify if parameter is a circle or not
*
* ```js
* const circleA = { radius: 5 };
* Circles.isPositioned(circle); // false
*
* const circleB = { radius: 5, x: 10, y: 10 }
* Circles.isPositioned(circle); // true
* ```
* @param p Circle
* @returns
*/
const isPositioned$2 = (p) => p.x !== void 0 && p.y !== void 0;
const isCircle = (p) => p.radius !== void 0;
const isCirclePositioned = (p) => isCircle(p) && isPositioned$2(p);

//#endregion
//#region ../geometry/dist/src/circle/is-equal.js
/**
* Returns true if the two objects have the same values
*
* ```js
* const circleA = { radius: 10, x: 5, y: 5 };
* const circleB = { radius: 10, x: 5, y: 5 };
*
* circleA === circleB; // false, because identity of objects is different
* Circles.isEqual(circleA, circleB); // true, because values are the same
* ```
*
* Circles must both be positioned or not.
* @param a
* @param b
* @returns
*/
const isEqual$6 = (a, b) => {
	if (a.radius !== b.radius) return false;
	if (isCirclePositioned(a) && isCirclePositioned(b)) {
		if (a.x !== b.x) return false;
		if (a.y !== b.y) return false;
		if (a.z !== b.z) return false;
		return true;
	} else if (!isCirclePositioned(a) && !isCirclePositioned(b)) {} else return false;
	return false;
};

//#endregion
//#region ../geometry/dist/src/point/get-point-parameter.js
function getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6) {
	if (isPoint3d(a1) && isPoint3d(ab2)) return [a1, ab2];
	if (isPoint(a1) && isPoint(ab2)) return [a1, ab2];
	if (isPoint3d(a1)) {
		const b$1 = {
			x: ab2,
			y: ab3,
			z: ab4
		};
		if (!isPoint3d(b$1)) throw new Error(`Expected x, y & z parameters`);
		return [a1, b$1];
	}
	if (isPoint(a1)) {
		const b$1 = {
			x: ab2,
			y: ab3
		};
		if (!isPoint(b$1)) throw new Error(`Expected x & y parameters`);
		return [a1, b$1];
	}
	if (typeof ab5 !== `undefined` && typeof ab4 !== `undefined`) {
		const a$1 = {
			x: a1,
			y: ab2,
			z: ab3
		};
		const b$1 = {
			x: ab4,
			y: ab5,
			z: ab6
		};
		if (!isPoint3d(a$1)) throw new Error(`Expected x,y,z for first point`);
		if (!isPoint3d(b$1)) throw new Error(`Expected x,y,z for second point`);
		return [a$1, b$1];
	}
	const a = {
		x: a1,
		y: ab2
	};
	const b = {
		x: ab3,
		y: ab4
	};
	if (!isPoint(a)) throw new Error(`Expected x,y for first point`);
	if (!isPoint(b)) throw new Error(`Expected x,y for second point`);
	return [a, b];
}
/**
* Returns a Point form of either a point, x,y params or x,y,z params.
* If parameters are undefined, an empty point is returned (0, 0)
* @ignore
* @param a
* @param b
* @returns
*/
function getPointParameter(a, b, c) {
	if (a === void 0) return {
		x: 0,
		y: 0
	};
	if (Array.isArray(a)) {
		if (a.length === 0) return Object.freeze({
			x: 0,
			y: 0
		});
		if (a.length === 1) return Object.freeze({
			x: a[0],
			y: 0
		});
		if (a.length === 2) return Object.freeze({
			x: a[0],
			y: a[1]
		});
		if (a.length === 3) return Object.freeze({
			x: a[0],
			y: a[1],
			z: a[2]
		});
		throw new Error(`Expected array to be 1-3 elements in length. Got ${a.length}.`);
	}
	if (isPoint(a)) return a;
	else if (typeof a !== `number` || typeof b !== `number`) throw new TypeError(`Expected point or x,y as parameters. Got: a: ${JSON.stringify(a)} b: ${JSON.stringify(b)}`);
	if (typeof c === `number`) return Object.freeze({
		x: a,
		y: b,
		z: c
	});
	return Object.freeze({
		x: a,
		y: b
	});
}

//#endregion
//#region ../geometry/dist/src/point/sum.js
/**
* Returns a Point with the x,y,z values of two points added.
*
* `z` parameter is used, if present. Uses a default value of 0 for 'z' when adding a 2D point with a 3D one.
*
* Examples:
*
* ```js
* sum(ptA, ptB);
* sum(x1, y1, x2, y2);
* sum(ptA, x2, y2);
* ```
*/
function sum(a1, ab2, ab3, ab4, ab5, ab6) {
	const [ptA, ptB] = getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6);
	guard$1(ptA, `a`);
	guard$1(ptB, `b`);
	const pt = {
		x: ptA.x + ptB.x,
		y: ptA.y + ptB.y
	};
	if (isPoint3d(ptA) || isPoint3d(ptB)) pt.z = (ptA.z ?? 0) + (ptB.z ?? 0);
	return Object.freeze(pt);
}

//#endregion
//#region ../geometry/dist/src/point/subtract.js
/**
* Returns a Point with the x,y,z values of two points subtracted (a-b).
*
* `z` parameter is used if present. Uses a default value of 0 for 'z' when subtracting a 2D point with a 3D one.
*
* Examples:
*
* ```js
* subtract(ptA, ptB);
* subtract(x1, y1, x2, y2);
* subtract(ptA, x2, y2);
* ```
*/
function subtract(a1, ab2, ab3, ab4, ab5, ab6) {
	const [ptA, ptB] = getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6);
	guard$1(ptA, `a`);
	guard$1(ptB, `b`);
	const pt = {
		x: ptA.x - ptB.x,
		y: ptA.y - ptB.y
	};
	if (isPoint3d(ptA) || isPoint3d(ptB)) pt.z = (ptA.z ?? 0) - (ptB.z ?? 0);
	return Object.freeze(pt);
}

//#endregion
//#region ../geometry/dist/src/circle/intersections.js
/**
* Returns the point(s) of intersection between a circle and line.
*
* ```js
* const circle = { radius: 5, x: 5, y: 5 };
* const line = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 } };
* const pts = Circles.intersectionLine(circle, line);
* ```
* @param circle
* @param line
* @returns Point(s) of intersection, or empty array
*/
const intersectionLine = (circle, line) => {
	const v1 = {
		x: line.b.x - line.a.x,
		y: line.b.y - line.a.y
	};
	const v2 = {
		x: line.a.x - circle.x,
		y: line.a.y - circle.y
	};
	const b = (v1.x * v2.x + v1.y * v2.y) * -2;
	const c = 2 * (v1.x * v1.x + v1.y * v1.y);
	const d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
	if (Number.isNaN(d)) return [];
	const u1 = (b - d) / c;
	const u2 = (b + d) / c;
	const returnValue = [];
	if (u1 <= 1 && u1 >= 0) returnValue.push({
		x: line.a.x + v1.x * u1,
		y: line.a.y + v1.y * u1
	});
	if (u2 <= 1 && u2 >= 0) returnValue.push({
		x: line.a.x + v1.x * u2,
		y: line.a.y + v1.y * u2
	});
	return returnValue;
};
/**
*
* Returns the points of intersection betweeen `a` and `b`.
*
* Returns an empty array if circles are equal, one contains the other or if they don't touch at all.
*
* @param a Circle
* @param b Circle
* @returns Points of intersection, or an empty list if there are none
*/
const intersections = (a, b) => {
	const vector = subtract(b, a);
	const centerD = Math.hypot(vector.y, vector.x);
	if (centerD > a.radius + b.radius) return [];
	if (centerD < Math.abs(a.radius - b.radius)) return [];
	if (isEqual$6(a, b)) return [];
	const centroidD = (a.radius * a.radius - b.radius * b.radius + centerD * centerD) / (2 * centerD);
	const centroid$2 = {
		x: a.x + vector.x * centroidD / centerD,
		y: a.y + vector.y * centroidD / centerD
	};
	const centroidIntersectionD = Math.sqrt(a.radius * a.radius - centroidD * centroidD);
	const intersection = {
		x: -vector.y * (centroidIntersectionD / centerD),
		y: vector.x * (centroidIntersectionD / centerD)
	};
	return [sum(centroid$2, intersection), subtract(centroid$2, intersection)];
};

//#endregion
//#region ../geometry/dist/src/intersects.js
const circleRect = (a, b) => {
	const deltaX = a.x - Math.max(b.x, Math.min(a.x, b.x + b.width));
	const deltaY = a.y - Math.max(b.y, Math.min(a.y, b.y + b.height));
	return deltaX * deltaX + deltaY * deltaY < a.radius * a.radius;
};
const circleCircle = (a, b) => intersections(a, b).length === 2;

//#endregion
//#region ../geometry/dist/src/rect/Intersects.js
/**
* Returns true if point is within or on boundary of `rect`.
*
* ```js
* Rects.intersectsPoint(rect, { x: 100, y: 100});
* Rects.intersectsPoint(rect, 100, 100);
* ```
* @param rect
* @param a
* @param b
* @returns
*/
function intersectsPoint(rect, a, b) {
	guard$6(rect, `rect`);
	let x = 0;
	let y = 0;
	if (typeof a === `number`) {
		if (b === void 0) throw new Error(`x and y coordinate needed`);
		x = a;
		y = b;
	} else {
		x = a.x;
		y = a.y;
	}
	if (isPositioned$1(rect)) {
		if (x - rect.x > rect.width || x < rect.x) return false;
		if (y - rect.y > rect.height || y < rect.y) return false;
	} else {
		if (x > rect.width || x < 0) return false;
		if (y > rect.height || y < 0) return false;
	}
	return true;
}
/**
* Returns true if `a` or `b` overlap, are equal, or `a` contains `b`.
* A rectangle can be checked for intersections with another RectPositioned, CirclePositioned or Point.
*
*/
const isIntersecting$1 = (a, b) => {
	if (!isRectPositioned(a)) throw new Error(`a parameter should be RectPositioned`);
	if (isCirclePositioned(b)) return circleRect(b, a);
	else if (isPoint(b)) return intersectsPoint(a, b);
	throw new Error(`Unknown shape for b: ${JSON.stringify(b)}`);
};

//#endregion
//#region ../geometry/dist/src/point/distance.js
/**
* Calculate distance between two points.
* If both points have a `z` property, the distance is 3D distance is calculated.
* If only one point has a `z`, it is ignored.
*
* ```js
* // Distance between two points
* const ptA = { x: 0.5, y:0.8 };
* const ptB = { x: 1, y: 0.4 };
* distance(ptA, ptB);
* // Or, provide x,y as parameters
* distance(ptA, 0.4, 0.9);
*
* // Distance from ptA to x: 0.5, y:0.8, z: 0.1
* const ptC = { x: 0.5, y:0.5, z: 0.3 };
* // With x,y,z as parameters:
* distance(ptC, 0.5, 0.8, 0.1);
* ```
* @param a First point
* @param xOrB Second point, or x coord
* @param y y coord, if x coord is given
* @param z Optional z coord, if x and y are given.
* @returns
*/
function distance(a, xOrB, y, z) {
	const pt = getPointParameter(xOrB, y, z);
	guard$1(pt, `b`);
	guard$1(a, `a`);
	return isPoint3d(pt) && isPoint3d(a) ? Math.hypot(pt.x - a.x, pt.y - a.y, pt.z - a.z) : Math.hypot(pt.x - a.x, pt.y - a.y);
}

//#endregion
//#region ../geometry/dist/src/rect/distance.js
/**
* Returns the distance from the perimeter of `rect` to `pt`.
* If the point is within the rectangle, 0 is returned.
*
* If `rect` does not have an x,y it's assumed to be 0,0
*
* ```js
* const rect = { width: 100, height: 100, x: 0, y: 0 };
* Rects.distanceFromExterior(rect, { x: 20, y: 20 });
* ```
* @param rect Rectangle
* @param pt Point
* @returns Distance
*/
const distanceFromExterior = (rect, pt) => {
	guardPositioned$1(rect, `rect`);
	guard$1(pt, `pt`);
	if (intersectsPoint(rect, pt)) return 0;
	const dx = Math.max(rect.x - pt.x, 0, pt.x - rect.x + rect.width);
	const dy = Math.max(rect.y - pt.y, 0, pt.y - rect.y + rect.height);
	return Math.hypot(dx, dy);
};
/**
* Return the distance of `pt` to the center of `rect`.
*
* ```js
* const rect = { width: 100, height: 100, x: 0, y: 0 };
* Rects.distanceFromCenter(rect, { x: 20, y: 20 });
* ```
* @param rect
* @param pt
* @returns
*/
const distanceFromCenter = (rect, pt) => distance(center$1(rect), pt);

//#endregion
//#region ../geometry/dist/src/rect/divide.js
const divideOp = (a, b) => a / b;
/**
* @internal
* @param a
* @param b
* @param c
* @returns
*/
function divide$4(a, b, c) {
	return applyMerge(divideOp, a, b, c);
}
/**
* Divides all components of `rect` by `amount`.
* This includes x,y if present.
*
* ```js
* divideScalar({ width:10, height:20 }, 2); // { width:5, height: 10 }
* divideScalar({ x: 1, y: 2, width:10, height:20 }, 2); // { x: 0.5, y: 1, width:5, height: 10 }
* ```
* @param rect
* @param amount
*/
function divideScalar(rect, amount) {
	return applyScalar(divideOp, rect, amount);
}
function divideDim(rect, amount) {
	return applyDim(divideOp, rect, amount);
}

//#endregion
//#region ../geometry/dist/src/line/from-points.js
/**
* Returns a line from two points
*
* ```js
* // Line from 0,1 to 10,15
* const line = Lines.fromPoints( { x:0, y:1 }, { x:10, y:15 });
* // line is: { a: { x: 0, y: 1}, b: { x: 10, y: 15 } };
* ```
* @param a Start point
* @param b End point
* @returns
*/
const fromPoints$2 = (a, b) => {
	guard$1(a, `a`);
	guard$1(b, `b`);
	a = Object.freeze({ ...a });
	b = Object.freeze({ ...b });
	return Object.freeze({
		a,
		b
	});
};

//#endregion
//#region ../geometry/dist/src/line/join-points-to-lines.js
/**
* Returns an array of lines that connects provided points. Note that line is not closed.
*
* Eg, if points a,b,c are provided, two lines are provided: a->b and b->c.
*
* ```js
* const lines = Lines.joinPointsToLines(ptA, ptB, ptC);
* // lines is an array of, well, lines
* ```
* @param points
* @returns
*/
const joinPointsToLines = (...points) => {
	const lines = [];
	let start = points[0];
	for (let index = 1; index < points.length; index++) {
		lines.push(fromPoints$2(start, points[index]));
		start = points[index];
	}
	return lines;
};

//#endregion
//#region ../geometry/dist/src/rect/edges.js
/**
* Returns four lines based on each corner.
* Lines are given in order: top, right, bottom, left
*
* ```js
* const rect = { width: 100, height: 100, x: 100, y: 100 };
* // Yields: array of length four
* const lines = Rects.lines(rect);
* ```
*
* @param {(RectPositioned|Rect)} rect
* @param {Points.Point} [origin]
* @returns {Lines.Line[]}
*/
const edges$1 = (rect, origin) => {
	const c = corners$1(rect, origin);
	return joinPointsToLines(...c, c[0]);
};
/**
* Returns a point on the edge of rectangle
* ```js
* const r1 = {x: 10, y: 10, width: 100, height: 50};
* Rects.getEdgeX(r1, `right`);  // Yields: 110
* Rects.getEdgeX(r1, `bottom`); // Yields: 10
*
* const r2 = {width: 100, height: 50};
* Rects.getEdgeX(r2, `right`);  // Yields: 100
* Rects.getEdgeX(r2, `bottom`); // Yields: 0
* ```
* @param rect
* @param edge Which edge: right, left, bottom, top
* @returns
*/
const getEdgeX = (rect, edge) => {
	guard$6(rect);
	switch (edge) {
		case `top`: return isPoint(rect) ? rect.x : 0;
		case `bottom`: return isPoint(rect) ? rect.x : 0;
		case `left`: return isPoint(rect) ? rect.y : 0;
		case `right`: return isPoint(rect) ? rect.x + rect.width : rect.width;
	}
};
/**
* Returns a point on the edge of rectangle
*
* ```js
* const r1 = {x: 10, y: 10, width: 100, height: 50};
* Rects.getEdgeY(r1, `right`);  // Yields: 10
* Rects.getEdgeY(r1, `bottom`); // Yields: 60
*
* const r2 = {width: 100, height: 50};
* Rects.getEdgeY(r2, `right`);  // Yields: 0
* Rects.getEdgeY(r2, `bottom`); // Yields: 50
* ```
* @param rect
* @param edge Which edge: right, left, bottom, top
* @returns
*/
const getEdgeY = (rect, edge) => {
	guard$6(rect);
	switch (edge) {
		case `top`: return isPoint(rect) ? rect.y : 0;
		case `bottom`: return isPoint(rect) ? rect.y + rect.height : rect.height;
		case `left`: return isPoint(rect) ? rect.y : 0;
		case `right`: return isPoint(rect) ? rect.y : 0;
	}
};

//#endregion
//#region ../geometry/dist/src/rect/empty.js
const Empty$3 = Object.freeze({
	width: 0,
	height: 0
});
const EmptyPositioned = Object.freeze({
	x: 0,
	y: 0,
	width: 0,
	height: 0
});

//#endregion
//#region ../geometry/dist/src/rect/encompass.js
/**
* Returns a copy of `rect` with `rect` resized so it also encompasses `points`.
* If provided point(s) are within bounds of `rect`, a copy of `rect` is returned.
* @param rect
* @param points
* @returns
*/
const encompass = (rect, ...points) => {
	const x = points.map((p) => p.x);
	const y = points.map((p) => p.y);
	let minX = Math.min(...x, rect.x);
	let minY = Math.min(...y, rect.y);
	let maxX = Math.max(...x, rect.x + rect.width);
	let maxY = Math.max(...y, rect.y + rect.height);
	let rectW = Math.max(rect.width, maxX - minX);
	let rectH = Math.max(rect.height, maxY - minY);
	return Object.freeze({
		...rect,
		x: minX,
		y: minY,
		width: rectW,
		height: rectH
	});
};

//#endregion
//#region ../geometry/dist/src/rect/from-center.js
/**
* Initialises a rectangle based on its center, a width and height
*
* ```js
* // Rectangle with center at 50,50, width 100 height 200
* Rects.fromCenter({x: 50, y:50}, 100, 200);
* ```
* @param origin
* @param width
* @param height
* @returns
*/
const fromCenter$2 = (origin, width, height$3) => {
	guard$1(origin, `origin`);
	guardDim(width, `width`);
	guardDim(height$3, `height`);
	const halfW = width / 2;
	const halfH = height$3 / 2;
	return {
		x: origin.x - halfW,
		y: origin.y - halfH,
		width,
		height: height$3
	};
};

//#endregion
//#region ../geometry/dist/src/rect/from-element.js
/**
* Initialise a rectangle based on the width and height of a HTML element.
*
* ```js
* Rects.fromElement(document.querySelector(`body`));
* ```
* @param el
* @returns
*/
const fromElement = (el) => ({
	width: el.clientWidth,
	height: el.clientHeight
});

//#endregion
//#region ../geometry/dist/src/rect/from-numbers.js
/**
* Returns a rectangle from a series of numbers: x, y, width, height OR width, height
*
* ```js
* const r1 = Rects.fromNumbers(100, 200);
* // {width: 100, height: 200}
*
* const r2 = Rects.fromNumbers(10, 20, 100, 200);
* // {x: 10, y: 20, width: 100, height: 200}
* ```
* Use the spread operator (...) if the source is an array:
*
* ```js
* const r3 = Rects.fromNumbers(...[10, 20, 100, 200]);
* ```
*
* Use {@link toArray} for the opposite conversion.
*
* @see toArray
* @param xOrWidth
* @param yOrHeight
* @param width
* @param height
* @returns
*/
function fromNumbers$2(xOrWidth, yOrHeight, width, height$3) {
	if (width === void 0 || height$3 === void 0) {
		if (typeof xOrWidth !== `number`) throw new Error(`width is not an number`);
		if (typeof yOrHeight !== `number`) throw new TypeError(`height is not an number`);
		return Object.freeze({
			width: xOrWidth,
			height: yOrHeight
		});
	}
	if (typeof xOrWidth !== `number`) throw new Error(`x is not an number`);
	if (typeof yOrHeight !== `number`) throw new Error(`y is not an number`);
	if (typeof width !== `number`) throw new Error(`width is not an number`);
	if (typeof height$3 !== `number`) throw new Error(`height is not an number`);
	return Object.freeze({
		x: xOrWidth,
		y: yOrHeight,
		width,
		height: height$3
	});
}

//#endregion
//#region ../geometry/dist/src/rect/from-top-left.js
/**
* Creates a rectangle from its top-left coordinate, a width and height.
*
* ```js
* // Rectangle at 50,50 with width of 100, height of 200.
* const rect = Rects.fromTopLeft({ x: 50, y:50 }, 100, 200);
* ```
* @param origin
* @param width
* @param height
* @returns
*/
const fromTopLeft = (origin, width, height$3) => {
	guardDim(width, `width`);
	guardDim(height$3, `height`);
	guard$1(origin, `origin`);
	return {
		x: origin.x,
		y: origin.y,
		width,
		height: height$3
	};
};

//#endregion
//#region ../geometry/dist/src/rect/get-rect-positionedparameter.js
/**
* Accepts:
* * x,y,w,h
* * x,y,rect
* * point,rect
* * RectPositioned
* * Rect, x,y
* * Rect, Point
* @param a
* @param b
* @param c
* @param d
* @returns
*/
function getRectPositionedParameter(a, b, c, d) {
	if (typeof a === `number`) if (typeof b === `number`) if (typeof c === `number` && typeof d === `number`) return {
		x: a,
		y: b,
		width: c,
		height: d
	};
	else if (isRect(c)) return {
		x: a,
		y: b,
		width: c.width,
		height: c.height
	};
	else throw new TypeError(`If params 'a' & 'b' are numbers, expect following parameters to be x,y or Rect`);
	else throw new TypeError(`If parameter 'a' is a number, expect following parameters to be: y,w,h`);
	else if (isRectPositioned(a)) return a;
	else if (isRect(a)) if (typeof b === `number` && typeof c === `number`) return {
		width: a.width,
		height: a.height,
		x: b,
		y: c
	};
	else if (isPoint(b)) return {
		width: a.width,
		height: a.height,
		x: b.x,
		y: b.y
	};
	else throw new TypeError(`If param 'a' is a Rect, expects following parameters to be x,y`);
	else if (isPoint(a)) if (typeof b === `number` && typeof c === `number`) return {
		x: a.x,
		y: a.y,
		width: b,
		height: c
	};
	else if (isRect(b)) return {
		x: a.x,
		y: a.y,
		width: b.width,
		height: b.height
	};
	else throw new TypeError(`If parameter 'a' is a Point, expect following params to be: Rect or width,height`);
	throw new TypeError(`Expect a first parameter to be x,RectPositioned,Rect or Point`);
}

//#endregion
//#region ../geometry/dist/src/point/is-equal.js
/**
* Returns _true_ if the points have identical values
*
* ```js
* const a = {x: 10, y: 10};
* const b = {x: 10, y: 10;};
* a === b        // False, because a and be are different objects
* isEqual(a, b)   // True, because a and b are same value
* ```
* @param p Points
* @returns _True_ if points are equal
*/
const isEqual = (...p) => {
	if (p === void 0) throw new Error(`parameter 'p' is undefined`);
	if (p.length < 2) return true;
	for (let index = 1; index < p.length; index++) {
		if (p[index].x !== p[0].x) return false;
		if (p[index].y !== p[0].y) return false;
	}
	return true;
};

//#endregion
//#region ../geometry/dist/src/rect/is-equal.js
/**
* Returns _true_ if the width & height of the two rectangles is the same.
*
* ```js
* const rectA = { width: 10, height: 10, x: 10, y: 10 };
* const rectB = { width: 10, height: 10, x: 20, y: 20 };
*
* // True, even though x,y are different
* Rects.isEqualSize(rectA, rectB);
*
* // False, because coordinates are different
* Rects.isEqual(rectA, rectB)
* ```
* @param a
* @param b
* @returns
*/
const isEqualSize = (a, b) => {
	if (a === void 0) throw new Error(`a undefined`);
	if (b === void 0) throw new Error(`b undefined`);
	return a.width === b.width && a.height === b.height;
};
/**
* Returns _true_ if two rectangles have identical values.
* Both rectangles must be positioned or not.
*
* ```js
* const rectA = { width: 10, height: 10, x: 10, y: 10 };
* const rectB = { width: 10, height: 10, x: 20, y: 20 };
*
* // False, because coordinates are different
* Rects.isEqual(rectA, rectB)
*
* // True, even though x,y are different
* Rects.isEqualSize(rectA, rectB);
* ```
* @param a
* @param b
* @returns
*/
const isEqual$5 = (a, b) => {
	if (isPositioned$1(a) && isPositioned$1(b)) {
		if (!isEqual(a, b)) return false;
		return a.width === b.width && a.height === b.height;
	} else if (!isPositioned$1(a) && !isPositioned$1(b)) return a.width === b.width && a.height === b.height;
	else return false;
};

//#endregion
//#region ../geometry/dist/src/line/guard.js
/**
* Returns true if `p` is a valid line, containing `a` and `b` Points.
* ```js
* Lines.isLine(l);
* ```
* @param p Value to check
* @returns True if a valid line.
*/
const isLine = (p) => {
	if (p === void 0) return false;
	if (p.a === void 0) return false;
	if (p.b === void 0) return false;
	if (!isPoint(p.a)) return false;
	if (!isPoint(p.b)) return false;
	return true;
};
/**
* Returns true if `p` is a {@link PolyLine}, ie. an array of {@link Line}s.
* Validates all items in array.
* @param p
* @returns
*/
const isPolyLine = (p) => {
	if (!Array.isArray(p)) return false;
	const valid = !p.some((v) => !isLine(v));
	return valid;
};
/**
* Throws an exception if:
* * line is undefined
* * a or b parameters are missing
*
* Does not validate points
* @param line
* @param name
*/
const guard$4 = (line, name = `line`) => {
	if (line === void 0) throw new Error(`${name} undefined`);
	if (line.a === void 0) throw new Error(`${name}.a undefined. Expected {a:Point, b:Point}. Got: ${JSON.stringify(line)}`);
	if (line.b === void 0) throw new Error(`${name}.b undefined. Expected {a:Point, b:Point} Got: ${JSON.stringify(line)}`);
};

//#endregion
//#region ../geometry/dist/src/line/get-points-parameter.js
/**
* Returns [a,b] points from either a line parameter, or two points.
* It additionally applies the guardPoint function to ensure validity.
* This supports function overloading.
* @ignore
* @param aOrLine
* @param b
* @returns
*/
const getPointParameter$1 = (aOrLine, b) => {
	let a;
	if (isLine(aOrLine)) {
		b = aOrLine.b;
		a = aOrLine.a;
	} else {
		a = aOrLine;
		if (b === void 0) throw new Error(`Since first parameter is not a line, two points are expected. Got a: ${JSON.stringify(a)} b: ${JSON.stringify(b)}`);
	}
	guard$1(a, `a`);
	guard$1(a, `b`);
	return [a, b];
};

//#endregion
//#region ../geometry/dist/src/line/length.js
/**
* Returns length of line, polyline or between two points
*
* @param aOrLine Point A, line or polyline (array of lines)
* @param pointB Point B, if first parameter is a point
* @returns Length (total accumulated length for arrays)
*/
function length(aOrLine, pointB) {
	if (isPolyLine(aOrLine)) {
		const sum$4 = aOrLine.reduce((accumulator, v) => length(v) + accumulator, 0);
		return sum$4;
	}
	if (aOrLine === void 0) throw new TypeError(`Parameter 'aOrLine' is undefined`);
	const [a, b] = getPointParameter$1(aOrLine, pointB);
	const x = b.x - a.x;
	const y = b.y - a.y;
	if (a.z !== void 0 && b.z !== void 0) {
		const z = b.z - a.z;
		return Math.hypot(x, y, z);
	} else return Math.hypot(x, y);
}

//#endregion
//#region ../geometry/dist/src/rect/lengths.js
/**
* Returns the length of each side of the rectangle (top, right, bottom, left)
*
* ```js
* const rect = { width: 100, height: 100, x: 100, y: 100 };
* // Yields: array of length four
* const lengths = Rects.lengths(rect);
* ```
* @param rect
* @returns
*/
const lengths$1 = (rect) => {
	guardPositioned$1(rect, `rect`);
	return edges$1(rect).map((l) => length(l));
};

//#endregion
//#region ../geometry/dist/src/rect/max.js
/**
* Returns a rectangle based on provided four corners.
*
* To create a rectangle that contains an arbitary set of points, use {@link Points.bbox}.
*
* Does some sanity checking such as:
*  - x will be smallest of topLeft/bottomLeft
*  - y will be smallest of topRight/topLeft
*  - width will be largest between top/bottom left and right
*  - height will be largest between left and right top/bottom
*
*/
const maxFromCorners = (topLeft, topRight, bottomRight, bottomLeft) => {
	if (topLeft.y > bottomRight.y) throw new Error(`topLeft.y greater than bottomRight.y`);
	if (topLeft.y > bottomLeft.y) throw new Error(`topLeft.y greater than bottomLeft.y`);
	const w1 = topRight.x - topLeft.x;
	const w2 = bottomRight.x - bottomLeft.x;
	const h1 = Math.abs(bottomLeft.y - topLeft.y);
	const h2 = Math.abs(bottomRight.y - topRight.y);
	return {
		x: Math.min(topLeft.x, bottomLeft.x),
		y: Math.min(topRight.y, topLeft.y),
		width: Math.max(w1, w2),
		height: Math.max(h1, h2)
	};
};

//#endregion
//#region ../geometry/dist/src/rect/multiply.js
const multiplyOp = (a, b) => a * b;
/**
* @internal
* @param a
* @param b
* @param c
* @returns
*/
function multiply$4(a, b, c) {
	return applyMerge(multiplyOp, a, b, c);
}
/**
* Multiplies all components of `rect` by `amount`.
* This includes x,y if present.
*
* ```js
* multiplyScalar({ width:10, height:20 }, 2); // { width:20, height: 40 }
* multiplyScalar({ x: 1, y: 2, width:10, height:20 }, 2); // { x: 2, y: 4, width:20, height: 40 }
* ```
*
* Use {@link multiplyDim} to only multiply width & height.
* @param rect
* @param amount
*/
function multiplyScalar$2(rect, amount) {
	return applyScalar(multiplyOp, rect, amount);
}
/**
* Multiplies only the width/height of `rect`, leaving `x` and `y` as they are.
* ```js
* multiplyDim({ x:1,y:2,width:3,height:4 }, 2);
* // Yields: { x:1, y:2, width:6, height: 8 }
* ```
*
* In comparison, {@link multiply} will also include x & y.
* @param rect Rectangle
* @param amount Amount to multiply by
* @returns
*/
function multiplyDim(rect, amount) {
	return applyDim(multiplyOp, rect, amount);
}

//#endregion
//#region ../geometry/dist/src/rect/nearest.js
/**
* If `p` is inside of `rect`, a copy of `p` is returned.
* If `p` is outside of `rect`, a point is returned closest to `p` on the edge
* of the rectangle.
* @param rect
* @param p
* @returns
*/
const nearestInternal = (rect, p) => {
	let { x, y } = p;
	if (x < rect.x) x = rect.x;
	else if (x > rect.x + rect.width) x = rect.x + rect.width;
	if (y < rect.y) y = rect.y;
	else if (y > rect.y + rect.height) y = rect.y + rect.height;
	return Object.freeze({
		...p,
		x,
		y
	});
};

//#endregion
//#region ../geometry/dist/src/rect/placeholder.js
const Placeholder = Object.freeze({
	width: NaN,
	height: NaN
});
const PlaceholderPositioned = Object.freeze({
	x: NaN,
	y: NaN,
	width: NaN,
	height: NaN
});

//#endregion
//#region ../geometry/dist/src/rect/perimeter.js
/**
* Returns the perimeter of `rect` (ie. sum of all edges)
*  * ```js
* const rect = { width: 100, height: 100, x: 100, y: 100 };
* Rects.perimeter(rect);
* ```
* @param rect
* @returns
*/
const perimeter$4 = (rect) => {
	guard$6(rect);
	return rect.height + rect.height + rect.width + rect.width;
};

//#endregion
//#region ../geometry/dist/src/rect/normalise-by-rect.js
/**
* Returns a function that divides numbers or points by the largest dimension of `rect`.
*
* ```js
* const d = dividerByLargestDimension({width:100,height:50});
* d(50);                // 0.5 (50/100)
* d({ x: 10, y: 20 }); // { x: 0.1, y: 0.2 }
* ```
* @param rect
* @returns
*/
const dividerByLargestDimension = (rect) => {
	const largest = Math.max(rect.width, rect.height);
	return (value) => {
		if (typeof value === `number`) return value / largest;
		else if (isPoint3d(value)) return Object.freeze({
			...value,
			x: value.x / largest,
			y: value.y / largest,
			z: value.x / largest
		});
		else if (isPoint(value)) return Object.freeze({
			...value,
			x: value.x / largest,
			y: value.y / largest
		});
		else throw new Error(`Param 'value' is neither number nor Point`);
	};
};

//#endregion
//#region ../geometry/dist/src/rect/random.js
/**
* Returns a random positioned Rect on a 0..1 scale.
* ```js
* const r = Rects.random(); // eg {x: 0.2549012, y:0.859301, width: 0.5212, height: 0.1423 }
* ```
*
* A custom source of randomness can be provided:
* ```js
* import { Rects } from "@ixfx/geometry.js";
* import { weightedSource } from "@ixfx/random.js"
* const r = Rects.random(weightedSource(`quadIn`));
* ```
* @param rando
* @returns
*/
const random$2 = (rando) => {
	rando ??= Math.random;
	return Object.freeze({
		x: rando(),
		y: rando(),
		width: rando(),
		height: rando()
	});
};
/**
* Returns a random point within a rectangle.
*
* By default creates a uniform distribution.
*
* ```js
* const pt = randomPoint({width: 5, height: 10});
* ```'
* @param within Rectangle to generate a point within
* @param options Options
* @returns
*/
const randomPoint$2 = (within, options = {}) => {
	const rand = options.randomSource ?? Math.random;
	const margin = options.margin ?? {
		x: 0,
		y: 0
	};
	const x = rand() * (within.width - margin.x - margin.x);
	const y = rand() * (within.height - margin.y - margin.y);
	const pos = {
		x: x + margin.x,
		y: y + margin.y
	};
	return isPositioned$1(within) ? sum(pos, within) : Object.freeze(pos);
};

//#endregion
//#region ../geometry/dist/src/rect/subtract.js
const subtractOp = (a, b) => a - b;
/**
* Subtracts width/height from `a`.
*
* ```js
* const rectA = { width: 100, height: 100 };
* const rectB = { width: 200, height: 200 };
*
* // Yields: { width: -100, height: -100 }
* Rects.subtract(rectA, rectB);
* Rects.subtract(rectA, 200, 200);
* ```
* @param a
* @param b
* @param c
* @returns
*/
function subtract$3(a, b, c) {
	return applyMerge(subtractOp, a, b, c);
}
function subtractSize(a, b, c) {
	const w = typeof b === `number` ? b : b.width;
	const h = typeof b === `number` ? c : b.height;
	if (h === void 0) throw new Error(`Expected height as third parameter`);
	const r = {
		...a,
		width: a.width - w,
		height: a.height - h
	};
	return r;
}
/**
* Subtracts A-B. Applies to x, y, width & height
* ```js
* subtractOffset(
*  { x:100, y:100, width:100, height:100 },
*  { x:10, y:20,   width: 30, height: 40 }
* );
* // Yields: {x: 90, y: 80, width: 70, height: 60 }
* ```
* If either `a` or `b` are missing x & y, 0 is used.
* @param a
* @param b
* @returns
*/
function subtractOffset(a, b) {
	let x = 0;
	let y = 0;
	if (isPositioned$1(a)) {
		x = a.x;
		y = a.y;
	}
	let xB = 0;
	let yB = 0;
	if (isPositioned$1(b)) {
		xB = b.x;
		yB = b.y;
	}
	return Object.freeze({
		...a,
		x: x - xB,
		y: y - yB,
		width: a.width - b.width,
		height: a.height - b.height
	});
}

//#endregion
//#region ../geometry/dist/src/rect/sum.js
const sumOp = (a, b) => a + b;
/**
* Sums width/height of `b` with `a` (ie: a + b), returning result.
*
* ```js
* const rectA = { width: 100, height: 100 };
* const rectB = { width: 200, height: 200 };
*
* // Yields: { width: 300, height: 300 }
* Rects.sum(rectA, rectB);
* Rects.sum(rectA, 200, 200);
* ```
* @param a
* @param b
* @param c
* @returns
*/
function sum$3(a, b, c) {
	return applyMerge(sumOp, a, b, c);
}
/**
* Sums x,y,width,height of a+b.
* ```js
* sumOffset({x:100,y:100,width:100,height:100}, {x:10, y:20, width: 30, height: 40});
* // Yields: {x: 110, y: 120, width: 130, height: 140 }
* ```
* If either `a` or `b` are missing x & y, 0 is used
* @param a
* @param b
* @returns
*/
function sumOffset(a, b) {
	let x = 0;
	let y = 0;
	if (isPositioned$1(a)) {
		x = a.x;
		y = a.y;
	}
	let xB = 0;
	let yB = 0;
	if (isPositioned$1(b)) {
		xB = b.x;
		yB = b.y;
	}
	return Object.freeze({
		...a,
		x: x + xB,
		y: y + yB,
		width: a.width + b.width,
		height: a.height + b.height
	});
}

//#endregion
//#region ../geometry/dist/src/rect/to-array.js
/**
* Converts a rectangle to an array of numbers. See {@link fromNumbers} for the opposite conversion.
*
* ```js
* const r1 = Rects.toArray({ x: 10, y:20, width: 100, height: 200 });
* // [10, 20, 100, 200]
* const r2 = Rects.toArray({ width: 100, height: 200 });
* // [100, 200]
* ```
* @param rect
* @see fromNumbers
*/
function toArray$1(rect) {
	if (isPositioned$1(rect)) return [
		rect.x,
		rect.y,
		rect.width,
		rect.height
	];
	else if (isRect(rect)) return [rect.width, rect.height];
	else throw new Error(`Param 'rect' is not a rectangle. Got: ${JSON.stringify(rect)}`);
}

//#endregion
//#region ../geometry/dist/src/rect/index.js
var rect_exports = {};
__export(rect_exports, {
	Empty: () => Empty$3,
	EmptyPositioned: () => EmptyPositioned,
	Placeholder: () => Placeholder,
	PlaceholderPositioned: () => PlaceholderPositioned,
	applyDim: () => applyDim,
	applyFields: () => applyFields,
	applyMerge: () => applyMerge,
	applyScalar: () => applyScalar,
	area: () => area$5,
	cardinal: () => cardinal,
	center: () => center$1,
	centerOrigin: () => centerOrigin,
	corners: () => corners$1,
	distanceFromCenter: () => distanceFromCenter,
	distanceFromExterior: () => distanceFromExterior,
	divide: () => divide$4,
	divideDim: () => divideDim,
	divideScalar: () => divideScalar,
	dividerByLargestDimension: () => dividerByLargestDimension,
	edges: () => edges$1,
	encompass: () => encompass,
	fromCenter: () => fromCenter$2,
	fromElement: () => fromElement,
	fromNumbers: () => fromNumbers$2,
	fromTopLeft: () => fromTopLeft,
	getEdgeX: () => getEdgeX,
	getEdgeY: () => getEdgeY,
	getRectPositioned: () => getRectPositioned,
	getRectPositionedParameter: () => getRectPositionedParameter,
	guard: () => guard$6,
	guardDim: () => guardDim,
	guardPositioned: () => guardPositioned$1,
	intersectsPoint: () => intersectsPoint,
	isEmpty: () => isEmpty$3,
	isEqual: () => isEqual$5,
	isEqualSize: () => isEqualSize,
	isIntersecting: () => isIntersecting$1,
	isPlaceholder: () => isPlaceholder$3,
	isPositioned: () => isPositioned$1,
	isRect: () => isRect,
	isRectPositioned: () => isRectPositioned,
	lengths: () => lengths$1,
	maxFromCorners: () => maxFromCorners,
	multiply: () => multiply$4,
	multiplyDim: () => multiplyDim,
	multiplyScalar: () => multiplyScalar$2,
	nearestInternal: () => nearestInternal,
	perimeter: () => perimeter$4,
	random: () => random$2,
	randomPoint: () => randomPoint$2,
	subtract: () => subtract$3,
	subtractOffset: () => subtractOffset,
	subtractSize: () => subtractSize,
	sum: () => sum$3,
	sumOffset: () => sumOffset,
	toArray: () => toArray$1
});

//#endregion
//#region ../geometry/dist/src/point/abs.js
/**
* Returns a point with Math.abs applied to x,y and z if present.
* ```js
* Points.abs({ x:1,  y:1  }); // { x: 1, y: 1 }
* Points.abs({ x:-1, y:1  }); // { x: 1, y: 1 }
* Points.abs({ x:-1, y:-1 }); // { x: 1, y: 1 }
* ```
* @param pt
* @returns
*/
function abs(pt) {
	if (isPoint3d(pt)) return Object.freeze({
		...pt,
		x: Math.abs(pt.x),
		y: Math.abs(pt.y),
		z: Math.abs(pt.z)
	});
	else if (isPoint(pt)) return Object.freeze({
		...pt,
		x: Math.abs(pt.x),
		y: Math.abs(pt.y)
	});
	else throw new TypeError(`Param 'pt' is not a point`);
}

//#endregion
//#region ../geometry/dist/src/pi.js
const piPi = Math.PI * 2;

//#endregion
//#region ../geometry/dist/src/point/angle.js
/**
* Returns the angle in radians between `a` and `b`.
*
* Eg if `a` is the origin, and `b` is another point,
* in degrees one would get 0 to -180 when `b` was above `a`.
*  -180 would be `b` in line with `a`.
* Same for under `a`.
*
* Providing a third point `c` gives the interior angle, where `b` is the middle point.
*
* See also {@link angleRadianCircle} which returns coordinates on 0..Math.Pi*2
* range. This avoids negative numbers.
* @param a
* @param b
* @param c
* @returns
*/
const angleRadian = (a, b, c) => {
	guard$1(a, `a`);
	if (b === void 0) return Math.atan2(a.y, a.x);
	guard$1(b, `b`);
	if (c === void 0) return Math.atan2(b.y - a.y, b.x - a.x);
	guard$1(c, `c`);
	return Math.atan2(b.y - a.y, b.x - a.x) - Math.atan2(c.y - a.y, c.x - a.x);
};
/**
* Returns the angle between point(s) using a radian circle system.
* ```
*       90deg
*       Pi/2
*        |
* Pi  ---+--- 0
* 180    |
*       3PI/2
*       270deg
* ```
* @param a
* @param b
* @param c
* @returns
*/
const angleRadianCircle = (a, b, c) => {
	const angle = angleRadian(a, b, c);
	if (angle < 0) return angle + piPi;
	return angle;
};

//#endregion
//#region ../geometry/dist/src/point/apply.js
/**
* Applies `fn` on x,y & z (if present) fields, returning all other fields as well
* ```js
* const p = {x:1.234, y:4.9};
* const p2 = Points.apply(p, Math.round);
* // Yields: {x:1, y:5}
* ```
*
* The name of the field is provided as well. Here we only round the `x` field:
*
* ```js
* const p = {x:1.234, y:4.9};
* const p2 = Points.apply(p, (v, field) => {
*  if (field === `x`) return Math.round(v);
*  return v;
* });
* ```
* @param pt
* @param fn
* @returns
*/
function apply$2(pt, fn) {
	guard$1(pt, `pt`);
	if (isPoint3d(pt)) return Object.freeze({
		...pt,
		x: fn(pt.x, `x`),
		y: fn(pt.y, `y`),
		z: fn(pt.z, `z`)
	});
	return Object.freeze({
		...pt,
		x: fn(pt.x, `x`),
		y: fn(pt.y, `y`)
	});
}

//#endregion
//#region ../geometry/dist/src/point/averager.js
function averager(kind, opts = {}) {
	let x;
	let y;
	let z;
	switch (kind) {
		case `moving-average-light`: {
			const scaling = opts.scaling ?? 3;
			x = movingAverageLight(scaling);
			y = movingAverageLight(scaling);
			z = movingAverageLight(scaling);
			break;
		}
		default: throw new Error(`Unknown averaging kind '${kind}'. Expected: 'moving-average-light'`);
	}
	return (point$1) => {
		const ax = x(point$1.x);
		const ay = y(point$1.y);
		if (isPoint3d(point$1)) {
			const az = z(point$1.z);
			return Object.freeze({
				x: ax,
				y: ay,
				z: az
			});
		} else return Object.freeze({
			x: ax,
			y: ay
		});
	};
}

//#endregion
//#region ../geometry/dist/src/point/find-minimum.js
/**
* Returns the 'minimum' point from an array of points, using a comparison function.
*
* @example Find point closest to a coordinate
* ```js
* const points = [...];
* const center = {x: 100, y: 100};
*
* const closestToCenter = findMinimum((a, b) => {
*  const aDist = distance(a, center);
*  const bDist = distance(b, center);
*  if (aDistance < bDistance) return a;
*  return b;
* }, points);
* ```
* @param comparer Compare function returns the smallest of `a` or `b`
* @param points
* @returns
*/
function findMinimum(comparer, ...points) {
	if (points.length === 0) throw new Error(`No points provided`);
	let min = points[0];
	for (const p of points) if (isPoint3d(min) && isPoint3d(p)) min = comparer(min, p);
	else min = comparer(min, p);
	return min;
}

//#endregion
//#region ../geometry/dist/src/point/bbox.js
/**
* Returns the minimum rectangle that can enclose all provided points
* @param points
* @returns
*/
const bbox$1 = (...points) => {
	const leftMost = findMinimum((a, b) => {
		return a.x < b.x ? a : b;
	}, ...points);
	const rightMost = findMinimum((a, b) => {
		return a.x > b.x ? a : b;
	}, ...points);
	const topMost = findMinimum((a, b) => {
		return a.y < b.y ? a : b;
	}, ...points);
	const bottomMost = findMinimum((a, b) => {
		return a.y > b.y ? a : b;
	}, ...points);
	const topLeft = {
		x: leftMost.x,
		y: topMost.y
	};
	const topRight = {
		x: rightMost.x,
		y: topMost.y
	};
	const bottomRight = {
		x: rightMost.x,
		y: bottomMost.y
	};
	const bottomLeft = {
		x: leftMost.x,
		y: bottomMost.y
	};
	return maxFromCorners(topLeft, topRight, bottomRight, bottomLeft);
};
const bbox3d = (...points) => {
	const box = bbox$1(...points);
	const zMin = findMinimum((a, b) => {
		return a.z < b.z ? a : b;
	}, ...points);
	const zMax = findMinimum((a, b) => {
		return a.z > b.z ? a : b;
	}, ...points);
	return {
		...box,
		z: zMin.z,
		depth: zMax.z - zMin.z
	};
};

//#endregion
//#region ../geometry/dist/src/point/centroid.js
/**
* Calculates the [centroid](https://en.wikipedia.org/wiki/Centroid#Of_a_finite_set_of_points) of a set of points
* Undefined values are skipped over.
*
* ```js
* // Find centroid of a list of points
* const c1 = centroid(p1, p2, p3, ...);
*
* // Find centroid of an array of points
* const c2 = centroid(...pointsArray);
* ```
* @param points
* @returns A single point
*/
const centroid$1 = (...points) => {
	if (!Array.isArray(points)) throw new Error(`Expected list of points`);
	const sum$4 = points.reduce((previous, p) => {
		if (p === void 0) return previous;
		if (Array.isArray(p)) throw new TypeError(`'points' list contains an array. Did you mean: centroid(...myPoints)?`);
		if (!isPoint(p)) throw new Error(`'points' contains something which is not a point: ${JSON.stringify(p)}`);
		return {
			x: previous.x + p.x,
			y: previous.y + p.y
		};
	}, {
		x: 0,
		y: 0
	});
	return Object.freeze({
		x: sum$4.x / points.length,
		y: sum$4.y / points.length
	});
};

//#endregion
//#region ../geometry/dist/src/point/clamp.js
/**
* Clamps a point to be between `min` and `max` (0 & 1 by default)
* @param pt Point
* @param min Minimum value (0 by default)
* @param max Maximum value (1 by default)
*/
function clamp$1(a, min = 0, max = 1) {
	if (isPoint3d(a)) return Object.freeze({
		x: clamp(a.x, min, max),
		y: clamp(a.y, min, max),
		z: clamp(a.z, min, max)
	});
	else return Object.freeze({
		x: clamp(a.x, min, max),
		y: clamp(a.y, min, max)
	});
}

//#endregion
//#region ../geometry/dist/src/point/compare.js
/**
* Returns -2 if both x & y of a is less than b
* Returns -1 if either x/y of a is less than b
*
* Returns 2 if both x & y of a is greater than b
* Returns 1 if either x/y of a is greater than b's x/y
*
* Returns 0 if x/y of a and b are equal
* @param a
* @param b
* @returns
*/
const compare = (a, b) => {
	if (a.x < b.x && a.y < b.y) return -2;
	if (a.x > b.x && a.y > b.y) return 2;
	if (a.x < b.x || a.y < b.y) return -1;
	if (a.x > b.x || a.y > b.y) return 1;
	if (a.x === b.x && a.x === b.y) return 0;
	return NaN;
};
/**
* Compares points based on x value. Y value is ignored.
*
* Return values:
* * 0: If a.x === b.x
* * 1: a is to the right of b (ie. a.x > b.x)
* * -1: a is to the left of b (ie. a.x < b.x)
*
* @example Sorting by x
* ```js
* arrayOfPoints.sort(Points.compareByX);
* ```
*
* @param a
* @param b
* @returns
*/
const compareByX = (a, b) => {
	if (a.x === b.x) return 0;
	if (a.x < b.x) return -1;
	return 1;
};
/**
* Compares points based on Y value. X value is ignored.
*
* Return values:
* * 0: If a.y === b.y
* * 1: A is below B (ie. a.y > b.y)
* * -1: A is above B (ie. a.y < b.y)
*
* @example Sorting by Y
* ```js
* arrayOfPoints.sort(Points.compareByY);
* ```
* @param a
* @param b
* @returns
*/
const compareByY = (a, b) => {
	if (a.y === b.y) return 0;
	if (a.y < b.y) return -1;
	return 1;
};
/**
* Compares points based on Z value. XY values are ignored.
*
* Return values:
* * 0: If a.z === b.z
* * 1: A is below B (ie. a.z > b.z)
* * -1: A is above B (ie. a.z < b.z)
*
* @example Sorting by Y
* ```js
* arrayOfPoints.sort(Points.compareByZ);
* ```
* @param a
* @param b
* @returns
*/
const compareByZ = (a, b) => {
	if (a.z === b.z) return 0;
	if (a.z < b.z) return -1;
	return 1;
};

//#endregion
//#region ../geometry/dist/src/point/convex-hull.js
/**
* Simple convex hull impementation. Returns a set of points which
* enclose `pts`.
*
* For more power, see something like [Hull.js](https://github.com/AndriiHeonia/hull)
* @param pts
* @returns
*/
const convexHull = (...pts) => {
	const sorted = [...pts].sort(compareByX);
	if (sorted.length === 1) return sorted;
	const x = (points) => {
		const v = [];
		for (const p of points) {
			while (v.length >= 2) {
				const q = v.at(-1);
				const r = v.at(-2);
				if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) v.pop();
				else break;
			}
			v.push(p);
		}
		v.pop();
		return v;
	};
	const upper = x(sorted);
	const lower = x(sorted.reverse());
	if (upper.length === 1 && lower.length === 1 && isEqual(lower[0], upper[0])) return upper;
	return [...upper, ...lower];
};

//#endregion
//#region ../geometry/dist/src/circle/distance-center.js
/**
* Returns the distance between two circle centers.
*
* ```js
* const circleA = { radius: 5, x: 5, y: 5 }
* const circleB = { radius: 10, x: 20, y: 20 }
* const distance = Circles.distanceCenter(circleA, circleB);
* ```
* Throws an error if either is lacking position.
* @param a
* @param b
* @returns Distance
*/
const distanceCenter = (a, b) => {
	guardPositioned(a, `a`);
	if (isCirclePositioned(b)) guardPositioned(b, `b`);
	return distance(a, b);
};

//#endregion
//#region ../geometry/dist/src/circle/distance-from-exterior.js
/**
* Returns the distance between the exterior of two circles, or between the exterior of a circle and point.
* If `b` overlaps or is enclosed by `a`, distance is 0.
*
* ```js
* const circleA = { radius: 5, x: 5, y: 5 }
* const circleB = { radius: 10, x: 20, y: 20 }
* const distance = Circles.distanceCenter(circleA, circleB);
* ```
* @param a
* @param b
*/
const distanceFromExterior$1 = (a, b) => {
	guardPositioned(a, `a`);
	if (isCirclePositioned(b)) return Math.max(0, distanceCenter(a, b) - a.radius - b.radius);
	else if (isPoint(b)) {
		const distribution = distance(a, b);
		if (distribution < a.radius) return 0;
		return distribution;
	} else throw new Error(`Second parameter invalid type`);
};

//#endregion
//#region ../geometry/dist/src/point/distance-to-center.js
/**
* Returns the distance from point `a` to the center of `shape`.
* @param a Point
* @param shape Point, or a positioned Rect or Circle.
* @returns
*/
const distanceToCenter = (a, shape) => {
	if (isRectPositioned(shape)) return distanceFromExterior(shape, a);
	if (isCirclePositioned(shape)) return distanceFromExterior$1(shape, a);
	if (isPoint(shape)) return distance(a, shape);
	throw new Error(`Unknown shape`);
};

//#endregion
//#region ../geometry/dist/src/point/distance-to-exterior.js
/**
* Returns the distance from point `a` to the exterior of `shape`.
*
* @example Distance from point to rectangle
* ```
* const distance = distanceToExterior(
*  {x: 50, y: 50},
*  {x: 100, y: 100, width: 20, height: 20}
* );
* ```
*
* @example Find closest shape to point
* ```
* import {minIndex} from '../data/arrays.js';
* const shapes = [ some shapes... ]; // Shapes to compare against
* const pt = { x: 10, y: 10 };       // Comparison point
* const distances = shapes.map(v => distanceToExterior(pt, v));
* const closest = shapes[minIndex(...distances)];
* ```
* @param a Point
* @param shape Point, or a positioned Rect or Circle.
* @returns
*/
const distanceToExterior = (a, shape) => {
	if (isRectPositioned(shape)) return distanceFromExterior(shape, a);
	if (isCirclePositioned(shape)) return distanceFromExterior$1(shape, a);
	if (isPoint(shape)) return distance(a, shape);
	throw new Error(`Unknown shape`);
};

//#endregion
//#region ../geometry/dist/src/point/divider.js
/**
* Returns a Point with the x,y,z values of two points divide (a/b).
*
* `z` parameter is used, if present. Uses a default value of 0 for 'z' when dividing a 2D point with a 3D one.
*
* Examples:
*
* ```js
* divide(ptA, ptB);
* divide(x1, y1, x2, y2);
* divide(ptA, x2, y2);
* ```
*/
function divide$1(a1, ab2, ab3, ab4, ab5, ab6) {
	const [ptA, ptB] = getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6);
	guard$1(ptA, `a`);
	guard$1(ptB, `b`);
	if (ptB.x === 0) throw new TypeError("Cannot divide by zero (b.x is 0)");
	if (ptB.y === 0) throw new TypeError("Cannot divide by zero (b.y is 0)");
	const pt = {
		x: ptA.x / ptB.x,
		y: ptA.y / ptB.y
	};
	if (isPoint3d(ptA) || isPoint3d(ptB)) {
		if (ptB.z === 0) throw new TypeError("Cannot divide by zero (b.z is 0)");
		pt.z = (ptA.z ?? 0) / (ptB.z ?? 0);
	}
	return Object.freeze(pt);
}
/**
* Returns a function that divides a point:
* ```js
* const f = divider(100, 200);
* f(50,100); // Yields: { x: 0.5, y: 0.5 }
* ```
*
* Input values can be Point, separate x,y and optional z values or an array:
* ```js
* const f = divider({ x: 100, y: 100 });
* const f = divider( 100, 100 );
* const f = divider([ 100, 100 ]);
* ```
*
* Likewise the returned function an take these as inputs:
* ```js
* f({ x: 100, y: 100});
* f( 100, 100 );
* f([ 100, 100 ]);
* ```
*
* Function throws if divisor has 0 for any coordinate (since we can't divide by 0)
* @param a Divisor point, array of points or x
* @param b Divisor y value
* @param c Divisor z value
* @returns
*/
function divider(a, b, c) {
	const divisor = getPointParameter(a, b, c);
	guardNonZeroPoint(divisor, `divisor`);
	return (aa, bb, cc) => {
		const dividend = getPointParameter(aa, bb, cc);
		return typeof dividend.z === `undefined` ? Object.freeze({
			x: dividend.x / divisor.x,
			y: dividend.y / divisor.y
		}) : Object.freeze({
			x: dividend.x / divisor.x,
			y: dividend.y / divisor.y,
			z: dividend.z / (divisor.z ?? 1)
		});
	};
}

//#endregion
//#region ../geometry/dist/src/point/to-array.js
/**
* Returns point as an array in the form [x,y]. This can be useful for some libraries
* that expect points in array form.
*
* ```
* const p = {x: 10, y:5};
* const p2 = toArray(p); // yields [10,5]
* ```
* @param p
* @returns
*/
const toArray = (p) => [p.x, p.y];

//#endregion
//#region ../geometry/dist/src/point/dot-product.js
const dotProduct$1 = (...pts) => {
	const a = pts.map((p) => toArray(p));
	return dotProduct(a);
};

//#endregion
//#region ../geometry/dist/src/point/empty.js
/**
* An empty point of `{ x: 0, y: 0 }`.
*
* Use `isEmpty` to check if a point is empty.
* Use `Empty3d` to get an empty point with `z`.
*/
const Empty = {
	x: 0,
	y: 0
};
/**
* Returns { x:1, y:1 }
*/
const Unit = {
	x: 1,
	y: 1
};
/**
* An empty Point of `{ x: 0, y: 0, z: 0}`
* Use `isEmpty` to check if a point is empty.
* Use `Empty` to get an empty point without `z`.
*/
const Empty3d = {
	x: 0,
	y: 0,
	z: 0
};
/**
* Returns { x:1,y:1,z:1 }
*/
const Unit3d = {
	x: 1,
	y: 1,
	z: 1
};

//#endregion
//#region ../geometry/dist/src/point/from.js
/**
* Returns a point from two or three coordinates or an array of [x,y] or [x,y,z].
* @example
* ```js
* let p = from([10, 5]);    // yields {x:10, y:5}
* let p = from([10, 5, 2]); // yields: {x:10, y:5, z:2}
* let p = from(10, 5);      // yields {x:10, y:5}
* let p = from(10, 5, 2);   // yields: {x:10, y:5, z:2}
* ```
* @param xOrArray
* @param [y]
* @returns Point
*/
function from(xOrArray, y, z) {
	if (Array.isArray(xOrArray)) if (xOrArray.length === 3) return Object.freeze({
		x: xOrArray[0],
		y: xOrArray[1],
		z: xOrArray[2]
	});
	else if (xOrArray.length === 2) return Object.freeze({
		x: xOrArray[0],
		y: xOrArray[1]
	});
	else throw new Error(`Expected array of length two or three, got ${xOrArray.length}`);
	else {
		if (xOrArray === void 0) throw new Error(`Requires an array of [x,y] or x,y parameters at least`);
		else if (Number.isNaN(xOrArray)) throw new Error(`x is NaN`);
		if (y === void 0) throw new Error(`Param 'y' is missing`);
		else if (Number.isNaN(y)) throw new Error(`y is NaN`);
		if (z === void 0) return Object.freeze({
			x: xOrArray,
			y
		});
		else return Object.freeze({
			x: xOrArray,
			y,
			z
		});
	}
}
/**
* Parses a point as a string, in the form 'x,y' or 'x,y,z'.
* eg '10,15' will be returned as `{ x: 10, y: 15 }`.
*
* Throws an error if `str` is not a string.
*
* ```js
* Points.fromString(`10,15`);  // { x:10, y:15 }
* Points.fromString(`a,10`);   // { x:NaN, y:10 }
* ```
*
* Use {@link Points.isNaN} to check if returned point has NaN for either coordinate.
* @param string_
*/
const fromString = (string_) => {
	if (typeof string_ !== `string`) throw new TypeError(`Param 'str' ought to be a string. Got: ${typeof string_}`);
	const comma = string_.indexOf(`,`);
	const x = Number.parseFloat(string_.substring(0, comma));
	const nextComma = string_.indexOf(",", comma + 1);
	if (nextComma > 0) {
		const y = Number.parseFloat(string_.substring(comma + 1, nextComma - comma + 2));
		const z = Number.parseFloat(string_.substring(nextComma + 1));
		return {
			x,
			y,
			z
		};
	} else {
		const y = Number.parseFloat(string_.substring(comma + 1));
		return {
			x,
			y
		};
	}
};
/**
* Returns an array of points from an array of numbers.
*
* Array can be a continuous series of x, y values:
* ```
* [1,2,3,4] would yield: [{x:1, y:2}, {x:3, y:4}]
* ```
*
* Or it can be an array of arrays:
* ```
* [[1,2], [3,4]] would yield: [{x:1, y:2}, {x:3, y:4}]
* ```
* @param coords
* @returns
*/
const fromNumbers = (...coords) => {
	const pts = [];
	if (Array.isArray(coords[0])) for (const coord of coords) {
		if (!(coord.length % 2 === 0)) throw new Error(`coords array should be even-numbered`);
		pts.push(Object.freeze({
			x: coord[0],
			y: coord[1]
		}));
	}
	else {
		if (coords.length % 2 !== 0) throw new Error(`Expected even number of elements: [x,y,x,y...]`);
		for (let index = 0; index < coords.length; index += 2) pts.push(Object.freeze({
			x: coords[index],
			y: coords[index + 1]
		}));
	}
	return pts;
};

//#endregion
//#region ../geometry/dist/src/line/reverse.js
/**
* Reverses a line.
* ````js
* const a = { x: 10, y: 20 };
* const b = { x: 100, y: 200 };
* const line = reverse({ a, b });
* // { a: { x: 100, y: 200 }, b: { x: 10, y: 20 } }
* ```
* @param line
* @returns
*/
function reverse(line) {
	guard$4(line, `line`);
	return {
		a: line.b,
		b: line.a
	};
}

//#endregion
//#region ../geometry/dist/src/line/interpolate.js
/**
* Calculates a point in-between a line's start and end points.
*
* @param amount Interpolation amount
* @param aOrLine Line, or first point
* @param pointBOrAllowOverflow Second point (if needed) or allowOverflow.
* @param allowOverflow If true, interpolation amount is permitted to exceed 0..1, extending the line.
* @returns
*/
function interpolate$2(amount, aOrLine, pointBOrAllowOverflow, allowOverflow) {
	if (typeof pointBOrAllowOverflow === `boolean`) {
		allowOverflow = pointBOrAllowOverflow;
		pointBOrAllowOverflow = void 0;
	}
	if (!allowOverflow) resultThrow(percentTest(amount, `amount`));
	else resultThrow(numberTest(amount, ``, `amount`));
	const [a, b] = getPointParameter$1(aOrLine, pointBOrAllowOverflow);
	const d = length(a, b);
	const d2 = d * (1 - amount);
	if (d === 0 && d2 === 0) return Object.freeze({ ...b });
	const x = b.x - d2 * (b.x - a.x) / d;
	const y = b.y - d2 * (b.y - a.y) / d;
	return Object.freeze({
		...b,
		x,
		y
	});
}
/**
* Returns the point along a line from its start (A)
* @param line Line
* @param distance Distance
* @param fromA If _true_ (default) returns from A. Use _false_ to calculate from end
* @returns
*/
function pointAtDistance(line, distance$2, fromA$2 = true) {
	if (!fromA$2) line = reverse(line);
	const dx = line.b.x - line.a.x;
	const dy = line.b.y - line.a.y;
	const theta = Math.atan2(dy, dx);
	const xp = distance$2 * Math.cos(theta);
	const yp = distance$2 * Math.sin(theta);
	return {
		x: xp + line.a.x,
		y: yp + line.a.y
	};
}

//#endregion
//#region ../geometry/dist/src/point/interpolate.js
/**
* Returns a relative point between two points.
*
* ```js
* interpolate(0.5, { x:0, y:0 }, { x:10, y:10 }); // Halfway { x, y }
* ```
*
* Alias for Lines.interpolate(amount, a, b);
*
* @param amount Relative amount, 0-1
* @param a
* @param b
* @param allowOverflow If true, length of line can be exceeded for `amount` of below 0 and above `1`.
* @returns {@link Point}
*/
const interpolate$4 = (amount, a, b, allowOverflow = false) => interpolate$2(amount, a, b, allowOverflow);

//#endregion
//#region ../geometry/dist/src/point/invert.js
/**
* Inverts one or more axis of a point
* ```js
* invert({x:10, y:10}); // Yields: {x:-10, y:-10}
* invert({x:10, y:10}, `x`); // Yields: {x:-10, y:10}
* ```
* @param pt Point to invert
* @param what Which axis. If unspecified, both axies are inverted
* @returns
*/
const invert$1 = (pt, what = `both`) => {
	switch (what) {
		case `both`: return isPoint3d(pt) ? Object.freeze({
			...pt,
			x: pt.x * -1,
			y: pt.y * -1,
			z: pt.z * -1
		}) : Object.freeze({
			...pt,
			x: pt.x * -1,
			y: pt.y * -1
		});
		case `x`: return Object.freeze({
			...pt,
			x: pt.x * -1
		});
		case `y`: return Object.freeze({
			...pt,
			y: pt.y * -1
		});
		case `z`: if (isPoint3d(pt)) return Object.freeze({
			...pt,
			z: pt.z * -1
		});
		else throw new Error(`pt parameter is missing z`);
		default: throw new Error(`Unknown what parameter. Expecting 'both', 'x' or 'y'`);
	}
};

//#endregion
//#region ../geometry/dist/src/point/multiply.js
/**
* Returns a Point with the x,y,z values of two points multiply (a/b).
*
* `z` parameter is used, if present. Uses a default value of 0 for 'z' when multiplying a 2D point with a 3D one.
*
* Examples:
*
* ```js
* multiply(ptA, ptB);
* multiply(x1, y1, x2, y2);
* multiply(ptA, x2, y2);
* ```
*/
function multiply$1(a1, ab2, ab3, ab4, ab5, ab6) {
	const [ptA, ptB] = getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6);
	guard$1(ptA, `a`);
	guard$1(ptB, `b`);
	const pt = {
		x: ptA.x * ptB.x,
		y: ptA.y * ptB.y
	};
	if (isPoint3d(ptA) || isPoint3d(ptB)) pt.z = (ptA.z ?? 0) * (ptB.z ?? 0);
	return Object.freeze(pt);
}
/**
* Multiplies all components by `v`.
* Existing properties of `pt` are maintained.
*
* ```js
* multiplyScalar({ x:2, y:4 }, 2);
* // Yields: { x:4, y:8 }
* ```
* @param pt Point
* @param v Value to multiply by
* @returns
*/
const multiplyScalar = (pt, v) => {
	return isPoint3d(pt) ? Object.freeze({
		...pt,
		x: pt.x * v,
		y: pt.y * v,
		z: pt.z * v
	}) : Object.freeze({
		...pt,
		x: pt.x * v,
		y: pt.y * v
	});
};

//#endregion
//#region ../geometry/dist/src/point/magnitude.js
/**
* Clamps the magnitude of a point.
* This is useful when using a Point as a vector, to limit forces.
* @param pt
* @param max Maximum magnitude (1 by default)
* @param min Minimum magnitude (0 by default)
* @returns
*/
const clampMagnitude = (pt, max = 1, min = 0) => {
	const length$4 = distance(pt);
	let ratio = 1;
	if (length$4 > max) ratio = max / length$4;
	else if (length$4 < min) ratio = min / length$4;
	return ratio === 1 ? pt : multiply$1(pt, ratio, ratio);
};

//#endregion
//#region ../geometry/dist/src/point/most.js
/**
* Returns the left-most of the provided points.
*
* Same as:
* ```js
* findMinimum((a, b) => {
*  if (a.x <= b.x) return a;
*  return b;
*}, ...points)
* ```
*
* @param points
* @returns
*/
const leftmost = (...points) => findMinimum((a, b) => a.x <= b.x ? a : b, ...points);
/**
* Returns the right-most of the provided points.
*
* Same as:
* ```js
* findMinimum((a, b) => {
*  if (a.x >= b.x) return a;
*  return b;
*}, ...points)
* ```
*
* @param points
* @returns
*/
const rightmost = (...points) => findMinimum((a, b) => a.x >= b.x ? a : b, ...points);

//#endregion
//#region ../geometry/dist/src/point/normalise.js
const length$3 = (ptOrX, y) => {
	if (isPoint(ptOrX)) {
		y = ptOrX.y;
		ptOrX = ptOrX.x;
	}
	if (y === void 0) throw new Error(`Expected y`);
	return Math.hypot(ptOrX, y);
};
/**
* Normalise point as a unit vector.
*
* ```js
* normalise({x:10, y:20});
* normalise(10, 20);
* ```
* @param ptOrX Point, or x value
* @param y y value if first param is x
* @returns
*/
const normalise = (ptOrX, y) => {
	const pt = getPointParameter(ptOrX, y);
	const l = length$3(pt);
	if (l === 0) return Empty;
	return Object.freeze({
		...pt,
		x: pt.x / l,
		y: pt.y / l
	});
};

//#endregion
//#region ../geometry/dist/src/point/normalise-by-rect.js
/**
* Normalises a point so it is on a 0..1 scale
*
* ```js
* normaliseByRect({ x: 10, y: 10, width: 20, height: 40 });
* normaliseByRect({ x: 10, y: 10 }, 20, 40);
* normaliseByRect(10, 10, 20, 40);
* ```
* @param a Point, or x
* @param b y coord or width
* @param c height or width
* @param d height
* @returns Point
*/
function normaliseByRect(a, b, c, d) {
	if (isPoint(a)) {
		if (typeof b === `number` && c !== void 0) resultThrow(numberTest(b, `positive`, `width`), numberTest(c, `positive`, `height`));
		else {
			if (!isRect(b)) throw new Error(`Expected second parameter to be a rect`);
			c = b.height;
			b = b.width;
		}
		return Object.freeze({
			x: a.x / b,
			y: a.y / c
		});
	} else {
		resultThrow(numberTest(a, `positive`, `x`));
		if (typeof b !== `number`) throw new TypeError(`Expecting second parameter to be a number (width)`);
		if (typeof c !== `number`) throw new TypeError(`Expecting third parameter to be a number (height)`);
		resultThrow(numberTest(b, `positive`, `y`));
		resultThrow(numberTest(c, `positive`, `width`));
		if (d === void 0) throw new Error(`Expected height parameter`);
		resultThrow(numberTest(d, `positive`, `height`));
		return Object.freeze({
			x: a / c,
			y: b / d
		});
	}
}

//#endregion
//#region ../geometry/dist/src/point/pipeline.js
/**
* Runs a sequential series of functions on `pt`. The output from one feeding into the next.
*
* ```js
* const p = Points.pipelineApply(somePoint, Points.normalise, Points.invert);
* ```
*
* If you want to make a reusable pipeline of functions, consider {@link pipeline} instead.
* @param point
* @param pipelineFns
* @returns
*/
const pipelineApply = (point$1, ...pipelineFns) => pipeline(...pipelineFns)(point$1);
/**
* Returns a pipeline function that takes a point to be transformed through a series of functions
* ```js
* // Create pipeline
* const p = Points.pipeline(Points.normalise, Points.invert);
*
* // Now run it on `somePoint`.
* // First we normalised, and then invert
* const changedPoint = p(somePoint);
* ```
*
* If you don't want to create a pipeline, use {@link pipelineApply}.
* @param pipeline Pipeline of functions
* @returns
*/
const pipeline = (...pipeline$1) => (pt) => pipeline$1.reduce((previous, current) => current(previous), pt);

//#endregion
//#region ../geometry/dist/src/polar/guard.js
/**
* Returns true if `p` seems to be a {@link Polar.Coord} (ie has both distance & angleRadian fields)
* @param p
* @returns True if `p` seems to be a PolarCoord
*/
const isPolarCoord = (p) => {
	if (p.distance === void 0) return false;
	if (p.angleRadian === void 0) return false;
	return true;
};
/**
* Throws an error if Coord is invalid
* @param p
* @param name
*/
const guard$5 = (p, name = `Point`) => {
	if (p === void 0) throw new Error(`'${name}' is undefined. Expected {distance, angleRadian} got ${JSON.stringify(p)}`);
	if (p === null) throw new Error(`'${name}' is null. Expected {distance, angleRadian} got ${JSON.stringify(p)}`);
	if (p.angleRadian === void 0) throw new Error(`'${name}.angleRadian' is undefined. Expected {distance, angleRadian} got ${JSON.stringify(p)}`);
	if (p.distance === void 0) throw new Error(`'${name}.distance' is undefined. Expected {distance, angleRadian} got ${JSON.stringify(p)}`);
	if (typeof p.angleRadian !== `number`) throw new TypeError(`'${name}.angleRadian' must be a number. Got ${p.angleRadian}`);
	if (typeof p.distance !== `number`) throw new TypeError(`'${name}.distance' must be a number. Got ${p.distance}`);
	if (p.angleRadian === null) throw new Error(`'${name}.angleRadian' is null`);
	if (p.distance === null) throw new Error(`'${name}.distance' is null`);
	if (Number.isNaN(p.angleRadian)) throw new TypeError(`'${name}.angleRadian' is NaN`);
	if (Number.isNaN(p.distance)) throw new Error(`'${name}.distance' is NaN`);
};

//#endregion
//#region ../geometry/dist/src/angles.js
function degreeToRadian(angleInDegrees) {
	return Array.isArray(angleInDegrees) ? angleInDegrees.map((v) => v * (Math.PI / 180)) : angleInDegrees * (Math.PI / 180);
}
/**
* Inverts the angle so it points in the opposite direction of a unit circle
* @param angleInRadians
* @returns
*/
function radianInvert(angleInRadians) {
	return (angleInRadians + Math.PI) % (2 * Math.PI);
}
function degreeToGradian(angleInDegrees) {
	return angleInDegrees * 1.111111;
}
/**
* Returns the gradian value converted to degrees.
* By default it wraps, so any value 360 or greater wraps around.
* @param angleInGradians
* @param wrap
* @returns
*/
function gradianToDegree(angleInGradians, wrap$4 = true) {
	if (wrap$4) return angleInGradians * .9 % 360;
	return angleInGradians * .9;
}
function radianToGradian(angleInRadians) {
	return angleInRadians * 63.6619772368;
}
function gradianToRadian(angleInGradian) {
	return angleInGradian * .0157079633;
}
function radianToDegree(angleInRadians) {
	return Array.isArray(angleInRadians) ? angleInRadians.map((v) => v * 180 / Math.PI) : angleInRadians * 180 / Math.PI;
}
/**
* Angle from x-axis to point (ie. `Math.atan2`)
* @param point
* @returns
*/
const radiansFromAxisX = (point$1) => Math.atan2(point$1.x, point$1.y);
/**
* Sum angles together, accounting for the 'wrap around'.
*
* `clockwise` of _true_ (default) means angles are added in clockwise direction
*
* ```js
* // From 180deg, add 90deg in the clockwise direction
* radiansSum(Math.PI, Math.PI/2, true);
* ```
*
* Orientation of angles is as follows:
* ```
*       90deg
*       Pi/2
*        |
* Pi  ---+--- 0
* 180    |
*       3PI/2
*       270deg
* ```
* {@link degreesSum} is the same, but uses degrees (0..360)
* @param start Starting angle, in radian
* @param amount Angle to add, in radian
* @param clockwise Add in clockwise direction (default: _true_)
* @returns Sum result, in radians
*/
const radiansSum = (start, amount, clockwise = true) => {
	if (clockwise) {
		let x = start + amount;
		if (x >= piPi) x = x % piPi;
		return x;
	} else {
		const x = start - amount;
		if (x < 0) return piPi + x;
		return x;
	}
};
/**
* Sum angles together, accounting for the 'wrap around'.
*
* `clockwise` of _true_ (default) means angles are added in clockwise direction
*
* ```js
* // From 180deg, add 90deg in the clockwise direction
* radiansSum(180, 90, true);
* ```
*
* {@link radiansSum} is the same, but uses radians (0..2 Pi)
*
* Orientation of angles is as follows:
* ```
*       90
*        |
* 180 ---+--- 0
*        |
*       270
* ```
* @param start Starting angle, in degrees
* @param amount Angle to add, in degrees
* @param clockwise Add in clockwise direction (default: _true_)
* @returns Sum result, in degrees
*/
const degreesSum = (start, amount, clockwise = true) => radianToDegree(radiansSum(degreeToRadian(start), degreeToRadian(amount), clockwise));
/**
* Computes the angle arc between a start and end angle,
* given in radians. It properly accounts for the wrap-around
* values.
*
* ```js
* // Between 0-90deg in clockwise direction
* radianArc(0, Math.PI/2, true); // Yields: 3Pi/2 (270 deg)
*
* // In counter-clockwise direction
* radianArc(0, Math.PI/2, false); // Yields: Math.PI/2 (90deg)
* ```
*
* See {@link degreeArc} to operate in degrees.
*
* Orientation of angles is as follows:
* ```
*       90deg
*       Pi/2
*        |
* Pi  ---+--- 0
* 180    |
*       3PI/2
*       270deg
* ```
* @param start Start angle, in radians
* @param end End angle, in radians
* @param clockwise Calculate in clockwise direction (default: _true_)
* @returns Angle of arc, in radians.
*/
const radianArc = (start, end, clockwise = true) => {
	let s = start;
	if (end < s) {
		s = 0;
		end = piPi - start + end;
	}
	let d = end - s;
	if (clockwise) d = piPi - d;
	if (d >= piPi) return d % piPi;
	return d;
};
/**
* Computes the angle arc between a start and end angle,
* given in degrees. It properly accounts for the wrap-around
* values.
*
* ```js
* // Between 0-90 in clockwise direction
* degreeArc(0, 90, true); // Yields: 270
*
* // In counter-clockwise direction
* degreeArc(0, 90, false); // Yields: 90
* ```
*
* See {@link radianArc} to operate in radians.
*
* Orientation of angles is as follows:
* ```
*       90
*        |
* 180 ---+--- 0
*        |
*       270
* ```
* @param start Start angle, in degrees
* @param end End angle, in degrees
* @param clockwise Calculate in clockwise direction (default: _true_)
* @returns Angle of arc, in degrees.
*/
const degreeArc = (start, end, clockwise = true) => radianToDegree(radianArc(degreeToRadian(start), degreeToRadian(end), clockwise));
/**
* Parses CSS-style angle strings. By default assumes degrees.
*
* ```js
* angleParse(`100`);     // { value: 100, unit: `deg` }
* angleParse(100);       // { value: 100, unit: `deg` }
* angleParse(`100deg`);   // { value: 100, unit: `deg` }
*
* // More exotic units:
* angleParse(`100rad`);  // { value: 100, unit: `rad` }
* angleParse(`100turn`); // { value: 100, unit: `turn` }
* angleParse(`100grad`); // { value: 100, unit: `grad` }
* ```
*
* Once parsed in this format, use {@link angleConvert} to convert to
* a different unit.
* @param value
* @returns
*/
const angleParse = (value) => {
	if (isAngle(value)) return value;
	if (typeof value === `number`) return {
		value,
		unit: `deg`
	};
	value = value.toLowerCase();
	let unit = `deg`;
	let numberValue = NaN;
	if (value.endsWith(`grad`)) {
		numberValue = Number.parseFloat(value.substring(0, value.length - 4));
		unit = `grad`;
	} else if (value.endsWith(`rad`)) {
		numberValue = Number.parseFloat(value.substring(0, value.length - 3));
		unit = `rad`;
	} else if (value.endsWith(`turn`)) {
		numberValue = Number.parseFloat(value.substring(0, value.length - 4));
		unit = `turn`;
	} else if (value.endsWith(`deg`)) {
		numberValue = Number.parseFloat(value.substring(0, value.length - 3));
		unit = `deg`;
	} else numberValue = Number.parseFloat(value);
	if (Number.isNaN(numberValue)) throw new Error(`Invalid angle (bad value?)`);
	if (unit.length === 0) throw new Error(`Invalid angle (no unit)`);
	return {
		value: numberValue,
		unit
	};
};
const isAngle = (v) => {
	if (typeof v !== `object`) return false;
	if (`unit` in v && `value` in v) {
		if (typeof v.unit !== `string`) return false;
		if (typeof v.value !== `number`) return false;
		return true;
	}
	return false;
};
/**
* Converts an angle to another representation.
* Input value is assumed degrees unless it's an {@link Angle} type of has the unit.
*
* These are all identical inputs: 100, `100`, `100deg`
* ```js
* angleConvert(100, `rad`); // Converts 100deg to radians
* ```
*
* Other units can be used for string input: `2turn`, `1grad`, `2rad`.
* ```js
* angleConvert(`2rad`, `deg`); // Converts 2radians to degrees
* ```
*
* Can also use an object input:
* ```js
* angleConvert({ value: 10, unit: `deg`}, `rad`);
* ```
* @param angleOrDegrees
* @param destination
* @returns
*/
const angleConvert = (angleOrDegrees, destination) => {
	const angle = typeof angleOrDegrees === `object` ? angleOrDegrees : angleParse(angleOrDegrees);
	switch (destination) {
		case `deg`:
			if (angle.unit === `deg`) return angle;
			if (angle.unit === `rad`) return {
				value: radianToDegree(angle.value),
				unit: `deg`
			};
			if (angle.unit === `grad`) return {
				value: gradianToDegree(angle.value),
				unit: `deg`
			};
			if (angle.unit === `turn`) return {
				value: turnToDegree(angle.value),
				unit: `deg`
			};
			throw new Error(`Unknown unit: ${angle.unit}`);
		case `grad`:
			if (angle.unit === `deg`) return {
				value: degreeToGradian(angle.value),
				unit: `grad`
			};
			if (angle.unit === `rad`) return {
				value: radianToGradian(angle.value),
				unit: `grad`
			};
			if (angle.unit === `grad`) return angle;
			if (angle.unit === `turn`) return {
				value: radianToGradian(turnToRadian(angle.value)),
				unit: `grad`
			};
			throw new Error(`Unknown unit: ${angle.unit}`);
		case `rad`:
			if (angle.unit === `deg`) return {
				value: degreeToRadian(angle.value),
				unit: `rad`
			};
			if (angle.unit === `rad`) return angle;
			if (angle.unit === `grad`) return {
				value: gradianToRadian(angle.value),
				unit: `rad`
			};
			if (angle.unit === `turn`) return {
				value: radianToGradian(turnToRadian(angle.value)),
				unit: `grad`
			};
			throw new Error(`Unknown unit: ${angle.unit}`);
		case `turn`:
			if (angle.unit === `deg`) return {
				value: degreeToTurn(angle.value),
				unit: `turn`
			};
			if (angle.unit === `rad`) return {
				value: radianToTurn(angle.value),
				unit: `turn`
			};
			if (angle.unit === `grad`) return {
				value: radianToTurn(gradianToRadian(angle.value)),
				unit: `turn`
			};
			if (angle.unit === `turn`) return angle;
			throw new Error(`Unknown unit: ${angle.unit}`);
		default: throw new Error(`Destination unit unknown ('${destination}). Expects: deg, grad, rad or turn`);
	}
};
/**
* Converts 'turns' to degrees. By defaults wraps the value, so
* turn value of 1 or 2 equal 0deg instead of 360 or 720deg.
* @param turns
* @param wrap
* @returns
*/
const turnToDegree = (turns, wrap$4 = true) => {
	if (wrap$4) return turns * 360 % 360;
	return turns * 360;
};
const turnToRadian = (turns) => turns * piPi;
const degreeToTurn = (degrees) => degrees / 360;
const radianToTurn = (radians) => radians / piPi;

//#endregion
//#region ../geometry/dist/src/polar/angles.js
/**
* Returns a rotated coordinate
* @param c Coordinate
* @param amountRadian Amount to rotate, in radians
* @returns
*/
const rotate$2 = (c, amountRadian) => Object.freeze({
	...c,
	angleRadian: c.angleRadian + amountRadian
});
/**
* Inverts the direction of coordinate. Ie if pointing north, will point south.
* @param p
* @returns
*/
const invert = (p) => {
	guard$5(p, `c`);
	return Object.freeze({
		...p,
		angleRadian: p.angleRadian - Math.PI
	});
};
/**
* Returns true if PolarCoords have same magnitude but opposite direction
* @param a
* @param b
* @returns
*/
const isOpposite = (a, b) => {
	guard$5(a, `a`);
	guard$5(b, `b`);
	if (a.distance !== b.distance) return false;
	return a.angleRadian === -b.angleRadian;
};
/**
* Returns true if Coords have the same direction, regardless of magnitude
* @param a
* @param b
* @returns
*/
const isParallel = (a, b) => {
	guard$5(a, `a`);
	guard$5(b, `b`);
	return a.angleRadian === b.angleRadian;
};
/**
* Returns true if coords are opposite direction, regardless of magnitude
* @param a
* @param b
* @returns
*/
const isAntiParallel = (a, b) => {
	guard$5(a, `a`);
	guard$5(b, `b`);
	return a.angleRadian === -b.angleRadian;
};
/**
* Returns a rotated coordinate
* @param c Coordinate
* @param amountDeg Amount to rotate, in degrees
* @returns
*/
const rotateDegrees = (c, amountDeg) => Object.freeze({
	...c,
	angleRadian: c.angleRadian + degreeToRadian(amountDeg)
});

//#endregion
//#region ../geometry/dist/src/polar/conversions.js
/**
* Converts a polar coordinate to a Line.
*
* ```js
* const line = toLine({ angleRadian: Math.Pi, distance: 0.5 }, { x: 0.2, y: 0.1 });
* // Yields { a: { x, y}, b: { x, y } }
* ```
*
* The 'start' parameter is taken to be the origin of the Polar coordinate.
* @param c
* @param start
* @returns
*/
const toLine$1 = (c, start) => {
	const b = toCartesian(c, start);
	return {
		a: start,
		b
	};
};
/**
* Converts to Cartesian coordinate from polar.
*
* ```js
*
* const origin = { x: 50, y: 50}; // Polar origin
* // Yields: { x, y }
* const polar = Polar.toCartesian({ distance: 10, angleRadian: 0 }, origin);
* ```
*
* Distance and angle can be provided as numbers intead:
*
* ```
* // Yields: { x, y }
* const polar = Polar.toCartesian(10, 0, origin);
* ```
*
* @param a
* @param b
* @param c
* @returns
*/
const toCartesian = (a, b, c) => {
	if (isPolarCoord(a)) {
		if (typeof b === `undefined`) b = Empty;
		if (isPoint(b)) return polarToCartesian(a.distance, a.angleRadian, b);
		throw new Error(`Expecting (Coord, Point). Second parameter is not a point`);
	} else if (typeof a === `object`) throw new TypeError(`First param is an object, but not a Coord: ${JSON.stringify(a)}`);
	else if (typeof a === `number` && typeof b === `number`) {
		if (typeof c === `undefined`) c = Empty;
		if (!isPoint(c)) throw new Error(`Expecting (number, number, Point). Point param wrong type`);
		return polarToCartesian(a, b, c);
	} else throw new TypeError(`Expecting parameters of (number, number). Got: (${typeof a}, ${typeof b}, ${typeof c}). a: ${JSON.stringify(a)}`);
};
/**
* Converts a Cartesian coordinate to polar
*
* ```js
*
* // Yields: { angleRadian, distance }
* const polar = Polar.fromCartesian({x: 50, y: 50}, origin);
* ```
*
* Any additional properties of `point` are copied to object.
* @param point Point
* @param origin Origin
* @returns
*/
const fromCartesian = (point$1, origin) => {
	if (typeof point$1 === `undefined`) throw new Error(`Param 'point' missing. Expecting a Point`);
	if (typeof origin === `undefined`) throw new Error(`Param 'origin' missing. Expecting a Point`);
	point$1 = subtract(point$1, origin);
	const angle = Math.atan2(point$1.y, point$1.x);
	const distance$2 = Math.hypot(point$1.x, point$1.y);
	const polar = {
		...point$1,
		angleRadian: angle,
		distance: distance$2
	};
	delete polar.x;
	delete polar.y;
	return Object.freeze(polar);
};
/**
* Converts a polar coordinate to Cartesian
* @param distance Distance
* @param angleRadians Angle in radians
* @param origin Origin, or 0,0 by default.
* @returns
*/
const polarToCartesian = (distance$2, angleRadians, origin = Empty) => {
	guard$1(origin);
	return Object.freeze({
		x: origin.x + distance$2 * Math.cos(angleRadians),
		y: origin.y + distance$2 * Math.sin(angleRadians)
	});
};
/**
* Returns a human-friendly string representation `(distance, angleDeg)`.
* If `precision` is supplied, this will be the number of significant digits.
* @param p
* @returns
*/
const toString$5 = (p, digits) => {
	if (p === void 0) return `(undefined)`;
	if (p === null) return `(null)`;
	const angleDeg = radianToDegree(p.angleRadian);
	const d = digits ? p.distance.toFixed(digits) : p.distance;
	const a = digits ? angleDeg.toFixed(digits) : angleDeg;
	return `(${d},${a})`;
};
const toPoint = (v, origin = Empty) => {
	guard$5(v, `v`);
	return Object.freeze({
		x: origin.x + v.distance * Math.cos(v.angleRadian),
		y: origin.y + v.distance * Math.sin(v.angleRadian)
	});
};

//#endregion
//#region ../geometry/dist/src/polar/math.js
const normalise$2 = (c) => {
	if (c.distance === 0) throw new Error(`Cannot normalise vector of length 0`);
	return Object.freeze({
		...c,
		distance: 1
	});
};
/**
* Clamps the magnitude of a vector
* @param v
* @param max
* @param min
* @returns
*/
const clampMagnitude$2 = (v, max = 1, min = 0) => {
	let mag = v.distance;
	if (mag > max) mag = max;
	if (mag < min) mag = min;
	return Object.freeze({
		...v,
		distance: mag
	});
};
/**
* Calculate dot product of two PolarCoords.
*
* Eg, power is the dot product of force and velocity
*
* Dot products are also useful for comparing similarity of
*  angle between two unit PolarCoords.
* @param a
* @param b
* @returns
*/
const dotProduct$3 = (a, b) => {
	guard$5(a, `a`);
	guard$5(b, `b`);
	return a.distance * b.distance * Math.cos(b.angleRadian - a.angleRadian);
};
/**
* Multiplies the magnitude of a coord by `amt`.
* Direction is unchanged.
* @param v
* @param amt
* @returns
*/
const multiply$3 = (v, amt) => {
	guard$5(v);
	resultThrow(numberTest(amt, ``, `amt`));
	return Object.freeze({
		...v,
		distance: v.distance * amt
	});
};
/**
* Divides the magnitude of a coord by `amt`.
* Direction is unchanged.
* @param v
* @param amt
* @returns
*/
const divide$3 = (v, amt) => {
	guard$5(v);
	resultThrow(numberTest(amt, ``, `amt`));
	return Object.freeze({
		...v,
		distance: v.distance / amt
	});
};

//#endregion
//#region ../geometry/dist/src/point/To.js
/**
* Returns a point with rounded x,y coordinates. By default uses `Math.round` to round.
* ```js
* toIntegerValues({x:1.234, y:5.567}); // Yields: {x:1, y:6}
* ```
*
* ```js
* toIntegerValues(pt, Math.ceil); // Use Math.ceil to round x,y of `pt`.
* ```
* @param pt Point to round
* @param rounder Rounding function, or Math.round by default
* @returns
*/
const toIntegerValues = (pt, rounder = Math.round) => {
	guard$1(pt, `pt`);
	return Object.freeze({
		x: rounder(pt.x),
		y: rounder(pt.y)
	});
};
/**
* Returns a copy of `pt` with `z` field omitted.
* If it didn't have one to begin within, a copy is still returned.
* @param pt
* @returns
*/
const to2d = (pt) => {
	guard$1(pt, `pt`);
	let copy = { ...pt };
	delete copy.z;
	return Object.freeze(copy);
};
/**
* Returns a copy of `pt` with a `z` field set.
* Defaults to a z value of 0.
* @param pt Point
* @param z Z-value, defaults to 0
* @returns
*/
const to3d = (pt, z = 0) => {
	guard$1(pt, `pt`);
	return Object.freeze({
		...pt,
		z
	});
};
/**
* Returns a human-friendly string representation `(x, y)`.
* If `precision` is supplied, this will be the number of significant digits.
* @param p
* @returns
*/
function toString$2(p, digits) {
	if (p === void 0) return `(undefined)`;
	if (p === null) return `(null)`;
	guard$1(p, `pt`);
	const x = digits ? p.x.toFixed(digits) : p.x;
	const y = digits ? p.y.toFixed(digits) : p.y;
	if (p.z === void 0) return `(${x},${y})`;
	else {
		const z = digits ? p.z.toFixed(digits) : p.z;
		return `(${x},${y},${z})`;
	}
}

//#endregion
//#region ../geometry/dist/src/polar/ray.js
var ray_exports = {};
__export(ray_exports, {
	fromLine: () => fromLine,
	toCartesian: () => toCartesian$2,
	toString: () => toString$4
});
/**
* Converts a ray to a Line in cartesian coordinates.
*
* By default, the ray's origin is taken to be 0,0.
* Passing in an origin will override this default, or whatever
* the ray's origin property is.
* @param ray Ray
* @param origin Override or provide origin point
* @returns
*/
const toCartesian$2 = (ray, origin) => {
	const o = getOrigin(ray, origin);
	const a = toCartesian(ray.offset, ray.angleRadian, o);
	const b = toCartesian(ray.offset + ray.length, ray.angleRadian, o);
	return {
		a,
		b
	};
};
const getOrigin = (ray, origin) => {
	if (origin !== void 0) return origin;
	if (ray.origin !== void 0) return ray.origin;
	return {
		x: 0,
		y: 0
	};
};
/**
* Returns a copy of `ray` ensuring it has an origin.
* If the `origin` parameter is provided, it will override the existing origin.
* If no origin information is available, 0,0 is used.
* @param ray
* @param origin
* @returns
*/
/**
* Returns a string representation of the ray, useful for debugging.
*
* ```
* "PolarRay(angle: ... offset: ... len: ... origin: ...)"
* ```
* @param ray
* @returns
*/
const toString$4 = (ray) => {
	let basic = `PolarRay(angle: ${ray.angleRadian} offset: ${ray.offset} len: ${ray.length}`;
	if (ray.origin) basic += ` origin: ${toString$2(ray.origin)}`;
	basic += `)`;
	return basic;
};
/**
* Returns a PolarRay based on a line and origin.
*
* If `origin` is omitted, the origin is taken to be the 'a' point of the line.
* Otherwise, the origin value is used to determine the 'offset' of the ray.
* @param line
* @param origin
* @returns
*/
const fromLine = (line, origin) => {
	const o = origin ?? line.a;
	return {
		angleRadian: angleRadian(line.b, o),
		offset: distance(line.a, o),
		length: distance(line.b, line.a),
		origin: o
	};
};

//#endregion
//#region ../geometry/dist/src/polar/spiral.js
/**
* Produces an Archimedean spiral. It's a generator.
*
* ```js
* const s = spiral(0.1, 1);
* for (const coord of s) {
*  // Use Polar coord...
*  if (coord.step === 1000) break; // Stop after 1000 iterations
* }
* ```
*
* @param smoothness 0.1 pretty rounded, at around 5 it starts breaking down
* @param zoom At smoothness 0.1, zoom starting at 1 is OK
*/
function* spiral(smoothness, zoom) {
	let step = 0;
	while (true) {
		const a = smoothness * step++;
		yield {
			distance: zoom * a,
			angleRadian: a,
			step
		};
	}
}
/**
* Produces an Archimedian spiral with manual stepping.
* @param step Step number. Typically 0, 1, 2 ...
* @param smoothness 0.1 pretty rounded, at around 5 it starts breaking down
* @param zoom At smoothness 0.1, zoom starting at 1 is OK
* @returns
*/
const spiralRaw = (step, smoothness, zoom) => {
	const a = smoothness * step;
	return Object.freeze({
		distance: zoom * a,
		angleRadian: a
	});
};

//#endregion
//#region ../geometry/dist/src/polar/index.js
var polar_exports = {};
__export(polar_exports, {
	Ray: () => ray_exports,
	clampMagnitude: () => clampMagnitude$2,
	divide: () => divide$3,
	dotProduct: () => dotProduct$3,
	fromCartesian: () => fromCartesian,
	guard: () => guard$5,
	invert: () => invert,
	isAntiParallel: () => isAntiParallel,
	isOpposite: () => isOpposite,
	isParallel: () => isParallel,
	isPolarCoord: () => isPolarCoord,
	multiply: () => multiply$3,
	normalise: () => normalise$2,
	rotate: () => rotate$2,
	rotateDegrees: () => rotateDegrees,
	spiral: () => spiral,
	spiralRaw: () => spiralRaw,
	toCartesian: () => toCartesian,
	toLine: () => toLine$1,
	toPoint: () => toPoint,
	toString: () => toString$5
});

//#endregion
//#region ../geometry/dist/src/vector.js
var vector_exports = {};
__export(vector_exports, {
	clampMagnitude: () => clampMagnitude$1,
	divide: () => divide$2,
	dotProduct: () => dotProduct$2,
	fromLineCartesian: () => fromLineCartesian,
	fromLinePolar: () => fromLinePolar,
	fromPointPolar: () => fromPointPolar,
	fromRadians: () => fromRadians,
	multiply: () => multiply$2,
	normalise: () => normalise$1,
	quadrantOffsetAngle: () => quadrantOffsetAngle,
	subtract: () => subtract$2,
	sum: () => sum$2,
	toCartesian: () => toCartesian$1,
	toPolar: () => toPolar,
	toRadians: () => toRadians,
	toString: () => toString$3
});
const EmptyCartesian = Object.freeze({
	x: 0,
	y: 0
});
const piPi$5 = Math.PI * 2;
const pi$1 = Math.PI;
const fromRadians = (radians) => {
	return Object.freeze({
		x: Math.cos(radians),
		y: Math.sin(radians)
	});
};
const toRadians = (point$1) => {
	return Math.atan2(point$1.y, point$1.x);
};
/**
* Create a vector from a point
*
* If `unipolar` normalisation is used, direction will be fixed to 0..2π
* if `bipolar` normalisation is used, direction will be fixed to -π...π
* @param pt Point
* @param angleNormalisation Technique to normalise angle
* @param origin Origin to calculate vector from or 0,0 if left empty
* @returns
*/
const fromPointPolar = (pt, angleNormalisation = ``, origin = EmptyCartesian) => {
	pt = subtract(pt, origin);
	let direction = Math.atan2(pt.y, pt.x);
	if (angleNormalisation === `unipolar` && direction < 0) direction += piPi$5;
	else if (angleNormalisation === `bipolar`) {
		if (direction > pi$1) direction -= piPi$5;
		else if (direction <= -pi$1) direction += piPi$5;
	}
	return Object.freeze({
		distance: distance(pt),
		angleRadian: direction
	});
};
/**
* Returns a Cartesian-coordinate vector from a line a -> b
* @param line
* @returns
*/
const fromLineCartesian = (line) => subtract(line.b, line.a);
/**
* Returns a polar-coordinate vector from a line a -> b
* @param line
* @returns
*/
const fromLinePolar = (line) => {
	guard$4(line, `line`);
	const pt = subtract(line.b, line.a);
	return fromPointPolar(pt);
};
const isPolar = (v) => {
	if (isPolarCoord(v)) return true;
	return false;
};
const isCartesian = (v) => {
	if (isPoint(v)) return true;
	return false;
};
/**
* Returns the normalised vector (aka unit vector). This is where
* direction is kept, but magnitude set to 1. This then just
* suggests direction.
* @param v
* @returns
*/
const normalise$1 = (v) => {
	if (isPolar(v)) return normalise$2(v);
	else if (isCartesian(v)) return normalise(v);
	throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
};
const quadrantOffsetAngle = (p) => {
	if (p.x >= 0 && p.y >= 0) return 0;
	if (p.x < 0 && p.y >= 0) return pi$1;
	if (p.x < 0 && p.y < 0) return pi$1;
	return piPi$5;
};
/**
* Converts a vector to a polar coordinate. If the provided
* value is already Polar, it is returned.
* @param v
* @param origin
* @returns Polar vector
*/
const toPolar = (v, origin = Empty) => {
	if (isPolar(v)) return v;
	else if (isCartesian(v)) return fromCartesian(v, origin);
	throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
};
/**
* Converts a Vector to a Cartesian coordinate. If the provided
* value is already Cartesian, it is returned.
* @param v
* @returns Cartestian vector
*/
const toCartesian$1 = (v) => {
	if (isPolar(v)) return toPoint(v);
	else if (isCartesian(v)) return v;
	throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
};
/**
* Return a human-friendly representation of vector
* @param v
* @param digits
* @returns
*/
const toString$3 = (v, digits) => {
	if (isPolar(v)) return toString$5(v, digits);
	else if (isCartesian(v)) return toString$2(v, digits);
	throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
};
/**
* Calculate dot product of a vector
* @param a
* @param b
* @returns
*/
const dotProduct$2 = (a, b) => {
	if (isPolar(a) && isPolar(b)) return dotProduct$3(a, b);
	else if (isCartesian(a) && isCartesian(b)) return dotProduct$1(a, b);
	throw new Error(`Expected two polar/Cartesian vectors.`);
};
/**
* Clamps the magnitude of a vector
* @param v Vector to clamp
* @param max Maximum magnitude
* @param min Minium magnitude
* @returns
*/
const clampMagnitude$1 = (v, max = 1, min = 0) => {
	if (isPolar(v)) return clampMagnitude$2(v, max, min);
	else if (isCartesian(v)) return clampMagnitude(v, max, min);
	throw new Error(`Expected either polar or Cartesian vector`);
};
/**
* Returns `a + b`.
*
* Vector is returned in the same type as `a`.
* @param a
* @param b
* @returns
*/
const sum$2 = (a, b) => {
	const polar = isPolar(a);
	a = toCartesian$1(a);
	b = toCartesian$1(b);
	const c = sum(a, b);
	return polar ? toPolar(c) : c;
};
/**
* Returns `a - b`.
*
* Vector is returned in the same type as `a`
* @param a
* @param b
*/
const subtract$2 = (a, b) => {
	const polar = isPolar(a);
	a = toCartesian$1(a);
	b = toCartesian$1(b);
	const c = subtract(a, b);
	return polar ? toPolar(c) : c;
};
/**
* Returns `a * b`.
*
* Vector is returned in the same type `a`.
* @param a
* @param b
*/
const multiply$2 = (a, b) => {
	const polar = isPolar(a);
	a = toCartesian$1(a);
	b = toCartesian$1(b);
	const c = multiply$1(a, b);
	return polar ? toPolar(c) : c;
};
/**
* Returns `a / b`.
*
* Vector is returned in the same type `a`.
* @param a
* @param b
*/
const divide$2 = (a, b) => {
	const polar = isPolar(a);
	a = toCartesian$1(a);
	b = toCartesian$1(b);
	const c = divide$1(a, b);
	return polar ? toPolar(c) : c;
};

//#endregion
//#region ../geometry/dist/src/line/nearest.js
/**
* Returns the nearest point on `line` closest to `point`.
*
* ```js
* const pt = Lines.nearest(line, {x:10,y:10});
* ```
*
* If an array of lines is provided, it will be the closest point amongst all the lines
* @param line Line or array of lines
* @param point
* @returns Point `{ x, y }`
*/
const nearest$1 = (line, point$1) => {
	const n = (line$1) => {
		const { a, b } = line$1;
		const atob = {
			x: b.x - a.x,
			y: b.y - a.y
		};
		const atop = {
			x: point$1.x - a.x,
			y: point$1.y - a.y
		};
		const length$4 = atob.x * atob.x + atob.y * atob.y;
		let dot = atop.x * atob.x + atop.y * atob.y;
		const t = Math.min(1, Math.max(0, dot / length$4));
		dot = (b.x - a.x) * (point$1.y - a.y) - (b.y - a.y) * (point$1.x - a.x);
		return {
			x: a.x + atob.x * t,
			y: a.y + atob.y * t
		};
	};
	if (Array.isArray(line)) {
		const pts = line.map((l) => n(l));
		const dists = pts.map((p) => distance(p, point$1));
		return Object.freeze(pts[minIndex(...dists)]);
	} else return Object.freeze(n(line));
};

//#endregion
//#region ../geometry/dist/src/line/distance-single-line.js
/**
* Returns the distance of `point` to the nearest point on `line`
*
* ```js
* const distance = Lines.distanceSingleLine(line, pt);
* ```
* @param line Line
* @param point Target point
* @returns
*/
const distanceSingleLine = (line, point$1) => {
	guard$4(line, `line`);
	guard$1(point$1, `point`);
	if (length(line) === 0) return length(line.a, point$1);
	const near = nearest$1(line, point$1);
	return length(near, point$1);
};

//#endregion
//#region ../geometry/dist/src/line/angles.js
const directionVector = (line) => ({
	x: line.b.x - line.a.x,
	y: line.b.y - line.a.y
});
const directionVectorNormalised = (line) => {
	const l = length(line);
	const v = directionVector(line);
	return {
		x: v.x / l,
		y: v.y / l
	};
};
/**
* Returns a parallel line to `line` at `distance`.
*
* ```js
* const l = Lines.parallel(line, 10);
* ```
* @param line
* @param distance
*/
const parallel = (line, distance$2) => {
	const dv = directionVector(line);
	const dvn = directionVectorNormalised(line);
	const a = {
		x: line.a.x - dvn.y * distance$2,
		y: line.a.y + dvn.x * distance$2
	};
	return {
		a,
		b: {
			x: a.x + dv.x,
			y: a.y + dv.y
		}
	};
};
/**
* Returns a point perpendicular to `line` at a specified `distance`. Use negative
* distances for the other side of line.
* ```
* // Project a point 100 units away from line, at its midpoint.
* const pt = Lines.perpendicularPoint(line, 100, 0.5);
* ```
* @param line Line
* @param distance Distance from line. Use negatives to flip side
* @param amount Relative place on line to project point from. 0 projects from A, 0.5 from the middle, 1 from B.
*/
const perpendicularPoint = (line, distance$2, amount = 0) => {
	const origin = interpolate$2(amount, line);
	const dvn = directionVectorNormalised(line);
	return {
		x: origin.x - dvn.y * distance$2,
		y: origin.y + dvn.x * distance$2
	};
};

//#endregion
//#region ../geometry/dist/src/line/bbox.js
/**
* Returns a rectangle that encompasses dimension of line
*
* ```js
* const rect = Lines.bbox(line);
* ```
*/
const bbox$5 = (line) => bbox$1(line.a, line.b);

//#endregion
//#region ../geometry/dist/src/line/divide.js
/**
* Divides both start and end points by given x,y
* ```js
* // Line 1,1 -> 10,10
* const l = Lines.fromNumbers(1,1,10,10);
* const ll = Lines.divide(l, {x:2, y:4});
* // Yields: 0.5,0.25 -> 5,2.5
* ```
*
* Dividing by zero will give Infinity for that dimension.
* @param line
* @param point
* @returns
*/
const divide = (line, point$1) => Object.freeze({
	...line,
	a: divide$1(line.a, point$1),
	b: divide$1(line.b, point$1)
});

//#endregion
//#region ../geometry/dist/src/line/from-numbers.js
/**
* Returns a line from a basis of coordinates (x1, y1, x2, y2)
*
* ```js
* // Line from 0,1 -> 10,15
* Lines.fromNumbers(0, 1, 10, 15);
* ```
* @param x1
* @param y1
* @param x2
* @param y2
* @returns
*/
const fromNumbers$1 = (x1, y1, x2, y2) => {
	if (Number.isNaN(x1)) throw new Error(`x1 is NaN`);
	if (Number.isNaN(x2)) throw new Error(`x2 is NaN`);
	if (Number.isNaN(y1)) throw new Error(`y1 is NaN`);
	if (Number.isNaN(y2)) throw new Error(`y2 is NaN`);
	const a = {
		x: x1,
		y: y1
	};
	const b = {
		x: x2,
		y: y2
	};
	return fromPoints$2(a, b);
};

//#endregion
//#region ../geometry/dist/src/line/from-flat-array.js
/**
* Returns a line from four numbers [x1,y1,x2,y2].
*
* See {@link toFlatArray} to create an array from a line.
*
* ```js
* const line = Lines.fromFlatArray(...[0, 0, 100, 100]);
* // line is {a: { x:0, y:0 }, b: { x: 100, y: 100 } }
* ```
* @param array Array in the form [x1,y1,x2,y2]
* @returns Line
*/
const fromFlatArray$1 = (array) => {
	if (!Array.isArray(array)) throw new Error(`arr parameter is not an array`);
	if (array.length !== 4) throw new Error(`array is expected to have length four`);
	return fromNumbers$1(array[0], array[1], array[2], array[3]);
};

//#endregion
//#region ../geometry/dist/src/line/from-pivot.js
/**
* Creates a line from an origin point.
* ```js
* // Line of length 0.2 with middle at 0.5,0.5
* fromPivot({ x:0.5, y:0.5 }, 0.2);
* // Same line, but on an angle
* fromPivot({ x:0.5, y:0.5 }, 0.2, degreesToRadian(45));
*
* // ...now with pivot point at 20%, rather than center
* fromPivot({ x:0.5, y:0.5 }, 0.2, degreesToRadian(45), 0.2);
* ```
*
* Examples:
* * Angle of 0 (deg/rad) results in a horizontal line,
* * Angle of 90deg in a vertical line.
* * Angle of 45deg will be angled downwards.
*
* @param origin Origin to pivot around
* @param length Total length of line
* @param angleRadian Angle of line, in radians
* @param balance Percentage of where origin ought to be on line. Default: 0.5, meaning the middle of line
*/
const fromPivot = (origin = {
	x: .5,
	y: .5
}, length$4 = 1, angleRadian$2 = 0, balance = .5) => {
	const left = length$4 * balance;
	const right = length$4 * (1 - balance);
	const a = toCartesian(left, radianInvert(angleRadian$2), origin);
	const b = toCartesian(right, angleRadian$2, origin);
	return Object.freeze({
		a,
		b
	});
};

//#endregion
//#region ../geometry/dist/src/line/midpoint.js
/**
* Returns the mid-point of a line (same as `interpolate` with an amount of 0.5)
*
* ```js
* Lines.midpoint(line); // Returns {x, y}
* ```
* @param aOrLine
* @param pointB
* @returns
*/
const midpoint = (aOrLine, pointB) => {
	const [a, b] = getPointParameter$1(aOrLine, pointB);
	return interpolate$2(.5, a, b);
};

//#endregion
//#region ../geometry/dist/src/line/relative-position.js
/**
* Returns the relative position of `pt` along `line`.
* Warning: assumes `pt` is actually on `line`. Results may be bogus if not.
* @param line
* @param pt
*/
const relativePosition$1 = (line, pt) => {
	const fromStart = distance(line.a, pt);
	const total = length(line);
	return fromStart / total;
};

//#endregion
//#region ../geometry/dist/src/line/sum.js
/**
* Adds both start and end points by given x,y
* ```js
*
* // Line 1,1 -> 10,10
* const l = Lines.fromNumbers(1,1,10,10);
* const ll = Lines.sum(l, {x:2, y:4});
* // Yields: 3,5 -> 12,14
* ```
* @param line
* @param point
* @returns
*/
const sum$1 = (line, point$1) => Object.freeze({
	...line,
	a: sum(line.a, point$1),
	b: sum(line.b, point$1)
});

//#endregion
//#region ../geometry/dist/src/line/rotate.js
/**
* Returns a line that is rotated by `angleRad`. By default it rotates
* around its center, but an arbitrary `origin` point can be provided.
* If `origin` is a number, it's presumed to be a 0..1 percentage of the line.
*
* ```js
* // Rotates line by 0.1 radians around point 10,10
* const r = Lines.rotate(line, 0.1, {x:10,y:10});
*
* // Rotate line by 5 degrees around its center
* const r = Lines.rotate(line, degreeToRadian(5));
*
* // Rotate line by 5 degres around its end point
* const r = Lines.rotate(line, degreeToRadian(5), line.b);
*
* // Rotate by 90 degrees at the 80% position
* const r = Lines.rotated = rotate(line, Math.PI / 2, 0.8);
* ```
* @param line Line to rotate
* @param amountRadian Angle in radians to rotate by
* @param origin Point to rotate around. If undefined, middle of line will be used
* @returns
*/
const rotate$3 = (line, amountRadian, origin) => {
	if (typeof amountRadian === `undefined` || amountRadian === 0) return line;
	if (typeof origin === `undefined`) origin = .5;
	if (typeof origin === `number`) origin = interpolate$2(origin, line.a, line.b);
	return Object.freeze({
		...line,
		a: rotate(line.a, amountRadian, origin),
		b: rotate(line.b, amountRadian, origin)
	});
};

//#endregion
//#region ../geometry/dist/src/line/is-equal.js
/**
* Returns true if the lines have the same value. Note that only
* the line start and end points are compared. So the lines might
* be different in other properties, and `isEqual` will still return
* true.
*
* ```js
* const a = { a: {x:0,  y: 10 }, b: { x: 20, y: 20 }};
* const b = { a: {x:0,  y: 10 }, b: { x: 20, y: 20 }};
* a === b; // false, because they are different objects
* Lines.isEqual(a, b); // true, because they have the same value
* ```
* @param {Line} a
* @param {Line} b
* @returns {boolean}
*/
const isEqual$4 = (a, b) => isEqual(a.a, b.a) && isEqual(a.b, b.b);

//#endregion
//#region ../geometry/dist/src/line/multiply.js
/**
* Multiplies start and end of line by point.x, point.y.
*
* ```js
*
* // Line 1,1 -> 10,10
* const l = Lines.fromNumbers(1, 1, 10, 10);
* const ll = Lines.multiply(l, {x:2, y:3});
* // Yields: 2,20 -> 3,30
* ```
* @param line
* @param point
* @returns
*/
const multiply = (line, point$1) => Object.freeze({
	...line,
	a: multiply$1(line.a, point$1),
	b: multiply$1(line.b, point$1)
});

//#endregion
//#region ../geometry/dist/src/line/subtract.js
/**
* Subtracts both start and end points by given x,y
* ```js
* // Line 1,1 -> 10,10
* const l = Lines.fromNumbers(1,1,10,10);
* const ll = Lines.subtract(l, {x:2, y:4});
* // Yields: -1,-3 -> 8,6
* ```
* @param line
* @param point
* @returns
*/
const subtract$1 = (line, point$1) => Object.freeze({
	...line,
	a: subtract(line.a, point$1),
	b: subtract(line.b, point$1)
});

//#endregion
//#region ../geometry/dist/src/line/to-string.js
/**
* Returns a string representation of a line or two points.
* @param a
* @param b
* @returns
*/
function toString$1(a, b) {
	if (isLine(a)) {
		guard$4(a, `a`);
		b = a.b;
		a = a.a;
	} else if (b === void 0) throw new Error(`Expect second point if first is a point`);
	return toString$2(a) + `-` + toString$2(b);
}

//#endregion
//#region ../geometry/dist/src/line/to-path.js
/**
* Returns a path wrapper around a line instance. This is useful if there are a series
* of operations you want to do with the same line because you don't have to pass it
* in as an argument to each function.
*
* Note that the line is immutable, so a function like `sum` returns a new LinePath,
* wrapping the result of `sum`.
*
* ```js
* // Create a path
* const l = Lines.toPath(fromNumbers(0,0,10,10));
*
* // Now we can use it...
* l.length();
*
* // Mutate functions return a new path
* const ll = l.sum({x:10,y:10});
* ll.length();
* ```
* @param line
* @returns
*/
const toPath = (line) => {
	const { a, b } = line;
	return Object.freeze({
		...line,
		length: () => length(a, b),
		interpolate: (amount) => interpolate$2(amount, a, b),
		relativePosition: (point$1) => relativePosition$1(line, point$1),
		bbox: () => bbox$5(line),
		toString: () => toString$1(a, b),
		toFlatArray: () => toFlatArray$1(a, b),
		toSvgString: () => toSvgString$1(a, b),
		toPoints: () => [a, b],
		rotate: (amountRadian, origin) => toPath(rotate$3(line, amountRadian, origin)),
		nearest: (point$1) => nearest$1(line, point$1),
		sum: (point$1) => toPath(sum$1(line, point$1)),
		divide: (point$1) => toPath(divide(line, point$1)),
		multiply: (point$1) => toPath(multiply(line, point$1)),
		subtract: (point$1) => toPath(subtract$1(line, point$1)),
		midpoint: () => midpoint(a, b),
		distanceToPoint: (point$1) => distanceSingleLine(line, point$1),
		parallel: (distance$2) => parallel(line, distance$2),
		perpendicularPoint: (distance$2, amount) => perpendicularPoint(line, distance$2, amount),
		slope: () => slope(line),
		withinRange: (point$1, maxRange) => withinRange$1(line, point$1, maxRange),
		isEqual: (otherLine) => isEqual$4(line, otherLine),
		apply: (fn) => toPath(apply$1(line, fn)),
		kind: `line`
	});
};

//#endregion
//#region ../geometry/dist/src/line/from-points-to-path.js
/**
* Returns a {@link LinePath} from two points
*
* ```js
* const path = Lines.fromPointsToPath(ptA, ptB);
* ```
* @param a
* @param b
* @returns
*/
const fromPointsToPath = (a, b) => toPath(fromPoints$2(a, b));

//#endregion
//#region ../geometry/dist/src/line/index.js
var line_exports = {};
__export(line_exports, {
	Empty: () => Empty$2,
	Placeholder: () => Placeholder$3,
	angleRadian: () => angleRadian$1,
	apply: () => apply$1,
	asPoints: () => asPoints,
	bbox: () => bbox$5,
	distance: () => distance$1,
	distanceSingleLine: () => distanceSingleLine,
	divide: () => divide,
	extendFromA: () => extendFromA,
	fromFlatArray: () => fromFlatArray$1,
	fromNumbers: () => fromNumbers$1,
	fromPivot: () => fromPivot,
	fromPoints: () => fromPoints$2,
	fromPointsToPath: () => fromPointsToPath,
	getPointParameter: () => getPointParameter$1,
	guard: () => guard$4,
	interpolate: () => interpolate$2,
	isEmpty: () => isEmpty$2,
	isEqual: () => isEqual$4,
	isLine: () => isLine,
	isPlaceholder: () => isPlaceholder$2,
	isPolyLine: () => isPolyLine,
	joinPointsToLines: () => joinPointsToLines,
	length: () => length,
	midpoint: () => midpoint,
	multiply: () => multiply,
	nearest: () => nearest$1,
	normaliseByRect: () => normaliseByRect$1,
	parallel: () => parallel,
	perpendicularPoint: () => perpendicularPoint,
	pointAtDistance: () => pointAtDistance,
	pointAtX: () => pointAtX,
	pointsOf: () => pointsOf,
	relativePosition: () => relativePosition$1,
	reverse: () => reverse,
	rotate: () => rotate$3,
	scaleFromMidpoint: () => scaleFromMidpoint,
	slope: () => slope,
	subtract: () => subtract$1,
	sum: () => sum$1,
	toFlatArray: () => toFlatArray$1,
	toPath: () => toPath,
	toString: () => toString$1,
	toSvgString: () => toSvgString$1,
	withinRange: () => withinRange$1
});
const Empty$2 = Object.freeze({
	a: Object.freeze({
		x: 0,
		y: 0
	}),
	b: Object.freeze({
		x: 0,
		y: 0
	})
});
const Placeholder$3 = Object.freeze({
	a: Object.freeze({
		x: NaN,
		y: NaN
	}),
	b: Object.freeze({
		x: NaN,
		y: NaN
	})
});
/**
* Returns true if `l` is the same as Line.Empty, that is
* the `a` and `b` points are Points.Empty.
* @param l
* @returns
*/
const isEmpty$2 = (l) => isEmpty(l.a) && isEmpty(l.b);
const isPlaceholder$2 = (l) => isPlaceholder(l.a) && isPlaceholder(l.b);
/**
* Applies `fn` to both start and end points.
*
* ```js
* // Line 10,10 -> 20,20
* const line = Lines.fromNumbers(10,10, 20,20);
*
* // Applies randomisation to both x and y.
* const rand = (p) => ({
*  x: p.x * Math.random(),
*  y: p.y * Math.random()
* });
*
* // Applies our randomisation function
* const line2 = apply(line, rand);
* ```
* @param line Line
* @param fn Function that takes a point and returns a point
* @returns
*/
const apply$1 = (line, fn) => Object.freeze({
	...line,
	a: fn(line.a),
	b: fn(line.b)
});
/**
* Returns the angle in radians of a line, or two points
* ```js
* Lines.angleRadian(line);
* Lines.angleRadian(ptA, ptB);
* ```
* @param lineOrPoint
* @param b
* @returns
*/
const angleRadian$1 = (lineOrPoint, b) => {
	let a;
	if (isLine(lineOrPoint)) {
		a = lineOrPoint.a;
		b = lineOrPoint.b;
	} else {
		a = lineOrPoint;
		if (b === void 0) throw new Error(`b point must be provided`);
	}
	return Math.atan2(b.y - a.y, b.x - a.x);
};
/**
* Normalises start and end points by given width and height. Useful
* for converting an absolutely-defined line to a relative one.
*
* ```js
*
* // Line 1,1 -> 10,10
* const l = Lines.fromNumbers(1,1,10,10);
* const ll = Lines.normaliseByRect(l, 10, 10);
* // Yields: 0.1,0.1 -> 1,1
* ```
* @param line
* @param width
* @param height
* @returns
*/
const normaliseByRect$1 = (line, width, height$3) => Object.freeze({
	...line,
	a: normaliseByRect(line.a, width, height$3),
	b: normaliseByRect(line.b, width, height$3)
});
/**
* Returns true if `point` is within `maxRange` of `line`.
*
* ```js
* const line = Lines.fromNumbers(0,20,20,20);
* Lines.withinRange(line, {x:0,y:21}, 1); // True
* ```
* @param line
* @param point
* @param maxRange
* @returns True if point is within range
*/
const withinRange$1 = (line, point$1, maxRange) => {
	const calculatedDistance = distance$1(line, point$1);
	return calculatedDistance <= maxRange;
};
/**
* Calculates [slope](https://en.wikipedia.org/wiki/Slope) of line.
*
* @example
* ```js
* Lines.slope(line);
* Lines.slope(ptA, ptB)
* ```
* @param lineOrPoint Line or point. If point is provided, second point must be given too
* @param b Second point if needed
* @returns
*/
const slope = (lineOrPoint, b) => {
	let a;
	if (isLine(lineOrPoint)) {
		a = lineOrPoint.a;
		b = lineOrPoint.b;
	} else {
		a = lineOrPoint;
		if (b === void 0) throw new Error(`b parameter required`);
	}
	if (b === void 0) throw new TypeError(`Second point missing`);
	else return (b.y - a.y) / (b.x - a.x);
};
/**
* Scales a line from its midpoint
*
* @example Shorten by 50%, anchored at the midpoint
* ```js
* const l = {
*  a: {x:50, y:50}, b: {x: 100, y: 90}
* }
* const l2 = Lines.scaleFromMidpoint(l, 0.5);
* ```
* @param line
* @param factor
*/
const scaleFromMidpoint = (line, factor) => {
	const a = interpolate$2(factor / 2, line);
	const b = interpolate$2(.5 + factor / 2, line);
	return {
		a,
		b
	};
};
/**
* Calculates `y` where `line` intersects `x`.
* @param line Line to extend
* @param x Intersection of x-axis.
*/
const pointAtX = (line, x) => {
	const y = line.a.y + (x - line.a.x) * slope(line);
	return Object.freeze({
		x,
		y
	});
};
/**
* Returns a line extended from its `a` point by a specified distance
*
* ```js
* const line = {a: {x: 0, y:0}, b: {x:10, y:10} }
* const extended = Lines.extendFromA(line, 2);
* ```
* @param line
* @param distance
* @return Newly extended line
*/
const extendFromA = (line, distance$2) => {
	const calculatedLength = length(line);
	return Object.freeze({
		...line,
		a: line.a,
		b: Object.freeze({
			x: line.b.x + (line.b.x - line.a.x) / calculatedLength * distance$2,
			y: line.b.y + (line.b.y - line.a.y) / calculatedLength * distance$2
		})
	});
};
/**
* Yields every integer point along `line`.
*
* @example Basic usage
* ```js
* const l = { a: {x: 0, y: 0}, b: {x: 100, y: 100} };
* for (const p of Lines.pointsOf(l)) {
*  // Do something with point `p`...
* }
* ```
*
* Some precision is lost as start and end
* point is also returned as an integer.
*
* Uses [Bresenham's line algorithm](https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm)
* @param line Line
*/
function* pointsOf(line) {
	const { a, b } = line;
	let x0 = Math.floor(a.x);
	let y0 = Math.floor(a.y);
	const x1 = Math.floor(b.x);
	const y1 = Math.floor(b.y);
	const dx = Math.abs(x1 - x0);
	const dy = -Math.abs(y1 - y0);
	const sx = x0 < x1 ? 1 : -1;
	const sy = y0 < y1 ? 1 : -1;
	let err = dx + dy;
	while (true) {
		yield {
			x: x0,
			y: y0
		};
		if (x0 === x1 && y0 === y1) break;
		const e2 = 2 * err;
		if (e2 >= dy) {
			err += dy;
			x0 += sx;
		}
		if (e2 <= dx) {
			err += dx;
			y0 += sy;
		}
	}
}
/**
* Returns the distance of `point` to the
* nearest point on `line`.
*
* ```js
* const d = Lines.distance(line, {x:10,y:10});
* ```
*
* If an array of lines is provided, the shortest distance is returned.
* @param line Line (or array of lines)
* @param point Point to check against
* @returns Distance
*/
const distance$1 = (line, point$1) => {
	if (Array.isArray(line)) {
		const distances = line.map((l) => distanceSingleLine(l, point$1));
		return minFast(distances);
	} else return distanceSingleLine(line, point$1);
};
/**
* Returns an array representation of line: [a.x, a.y, b.x, b.y]
*
* See {@link fromFlatArray} to create a line _from_ this representation.
*
* ```js
* Lines.toFlatArray(line);
* Lines.toFlatArray(pointA, pointB);
* ```
* @param {Point} a
* @param {Point} b
* @returns {number[]}
*/
const toFlatArray$1 = (a, b) => {
	if (isLine(a)) return [
		a.a.x,
		a.a.y,
		a.b.x,
		a.b.y
	];
	else if (isPoint(a) && isPoint(b)) return [
		a.x,
		a.y,
		b.x,
		b.y
	];
	else throw new Error(`Expected single line parameter, or a and b points`);
};
/**
* Yields all the points of all the lines.
*
* ```js
* const lines = [ ..some array of lines.. ];
* for (const pt of Lines.asPoints(lines)) {
*  // Yields a and then b of each point sequentially
* }
* ```
* @param lines
*/
function* asPoints(lines) {
	for (const l of lines) {
		yield l.a;
		yield l.b;
	}
}
/**
* Returns an SVG description of line
* ```
* Lines.toSvgString(ptA, ptB);
* ```
* @param a
* @param b
* @returns
*/
const toSvgString$1 = (a, b) => [`M${a.x} ${a.y} L ${b.x} ${b.y}`];

//#endregion
//#region ../geometry/dist/src/point/relation.js
/**
* Tracks the relation between two points.
*
* 1. Call `Points.relation` with the initial reference point
* 2. You get back a function
* 3. Call the function with a new point to compute relational information.
*
* It computes angle, average, centroid, distance and speed.
*
* ```js
* // Reference point: 50,50
* const t = Points.relation({x:50,y:50}); // t is a function
*
* // Invoke the returned function with a point
* const relation = t({ x:0, y:0 }); // Juicy relational data
* ```
*
* Or with destructuring:
*
* ```js
* const { angle, distanceFromStart, distanceFromLast, average, centroid, speed } = t({ x:0,y:0 });
* ```
*
* x & y coordinates can also be used as parameters:
* ```js
* const t = Points.relation(50, 50);
* const result = t(0, 0);
* // result.speed, result.angle ...
* ```
*
* Note that intermediate values are not stored. It keeps the initial
* and most-recent point. If you want to compute something over a set
* of prior points, you may want to use {@link PointsTracker}
* @param a Initial point, or x value
* @param b y value, if first option is a number.
* @returns
*/
const relation = (a, b) => {
	const start = getPointParameter(a, b);
	let totalX = 0;
	let totalY = 0;
	let count = 0;
	let lastUpdate = performance.now();
	let lastPoint = start;
	const update = (aa, bb) => {
		const p = getPointParameter(aa, bb);
		totalX += p.x;
		totalY += p.y;
		count++;
		const distanceFromStart = distance(p, start);
		const distanceFromLast = distance(p, lastPoint);
		const now = performance.now();
		const speed = distanceFromLast / (now - lastUpdate);
		lastUpdate = now;
		lastPoint = p;
		return Object.freeze({
			angle: angleRadian(p, start),
			distanceFromStart,
			distanceFromLast,
			speed,
			centroid: centroid$1(p, start),
			average: {
				x: totalX / count,
				y: totalY / count
			}
		});
	};
	return update;
};

//#endregion
//#region ../geometry/dist/src/point/point-tracker.js
/**
* A tracked point. Mutable. Useful for monitoring how
* it changes over time. Eg. when a pointerdown event happens, to record the start position and then
* track the pointer as it moves until pointerup.
*
* See also
* * [Playground](https://clinth.github.io/ixfx-play/data/point-tracker/index.html)
* * {@link PointsTracker}: Track several points, useful for multi-touch.
* * [ixfx Guide to Point Tracker](https://ixfx.fun/geometry/tracking/)
*
* ```js
* // Create a tracker on a pointerdown
* const t = new PointTracker();
*
* // ...and later, tell it when a point is seen (eg. pointermove)
* const nfo = t.seen({x: evt.x, y:evt.y});
* // nfo gives us some details on the relation between the seen point, the start, and points inbetween
* // nfo.angle, nfo.centroid, nfo.speed etc.
* ```
*
* Compute based on last seen point
* ```js
* t.angleFromStart();
* t.distanceFromStart();
* t.x / t.y
* t.length; // Total length of accumulated points
* t.elapsed; // Total duration since start
* t.lastResult; // The PointSeenInfo for last seen point
* ```
*
* Housekeeping
* ```js
* t.reset(); // Reset tracker
* ```
*
* By default, the tracker only keeps track of the initial point and
* does not store intermediate 'seen' points. To use the tracker as a buffer,
* set `storeIntermediate` option to _true_.
*
* ```js
* // Keep only the last 10 points
* const t = new PointTracker({
*  sampleLimit: 10
* });
*
* // Store all 'seen' points
* const t = new PointTracker({
*  storeIntermediate: true
* });
*
* // In this case, the whole tracker is automatically
* // reset after 10 samples
* const t = new PointTracker({
*  resetAfterSamples: 10
* })
* ```
*
* When using a buffer limited by `sampleLimit`, the 'initial' point will be the oldest in the
* buffer, not actually the very first point seen.
*/
var PointTracker = class extends ObjectTracker {
	initialRelation;
	markRelation;
	lastResult;
	constructor(opts = {}) {
		super(opts);
	}
	/**
	* Notification that buffer has been knocked down to `sampleLimit`.
	*
	* This will reset the `initialRelation`, which will use the new oldest value.
	*/
	onTrimmed(_reason) {
		this.initialRelation = void 0;
	}
	/**
	* @ignore
	*/
	onReset() {
		super.onReset();
		this.lastResult = void 0;
		this.initialRelation = void 0;
		this.markRelation = void 0;
	}
	/**
	* Adds a PointerEvent along with its
	* coalesced events, if available.
	* @param p
	* @returns
	*/
	seenEvent(p) {
		if (`getCoalescedEvents` in p) {
			const events = p.getCoalescedEvents();
			const asPoints$1 = events.map((event) => ({
				x: event.clientX,
				y: event.clientY
			}));
			return this.seen(...asPoints$1);
		} else return this.seen({
			x: p.clientX,
			y: p.clientY
		});
	}
	/**
	* Makes a 'mark' in the tracker, allowing you to compare values
	* to this point.
	*/
	mark() {
		this.markRelation = relation(this.last);
	}
	/**
	* Tracks a point, returning data on its relation to the
	* initial point and the last received point.
	*
	* Use {@link seenEvent} to track a raw `PointerEvent`.
	*
	* @param _p Point
	*/
	computeResults(_p) {
		const currentLast = this.last;
		const previousLast = this.values.at(-2);
		if (this.initialRelation === void 0 && this.initial) this.initialRelation = relation(this.initial);
		else if (this.initialRelation === void 0) throw new Error(`Bug: No initialRelation, and this.inital is undefined?`);
		const lastRelation = previousLast === void 0 ? relation(currentLast) : relation(previousLast);
		const initialRel = this.initialRelation(currentLast);
		const markRel = this.markRelation !== void 0 ? this.markRelation(currentLast) : void 0;
		const speed = previousLast === void 0 ? 0 : length(previousLast, currentLast) / (currentLast.at - previousLast.at);
		const lastRel = {
			...lastRelation(currentLast),
			speed
		};
		const r = {
			fromInitial: initialRel,
			fromLast: lastRel,
			fromMark: markRel,
			values: [...this.values]
		};
		this.lastResult = r;
		return r;
	}
	/**
	* Returns a polyline representation of stored points.
	* Returns an empty array if points were not saved, or there's only one.
	*/
	get line() {
		if (this.values.length === 1) return [];
		return joinPointsToLines(...this.values);
	}
	/**
	* Returns a vector of the initial/last points of the tracker.
	* Returns as a polar coordinate
	*/
	get vectorPolar() {
		return fromLinePolar(this.lineStartEnd);
	}
	/**
	* Returns a vector of the initial/last points of the tracker.
	* Returns as a Cartesian coordinate
	*/
	get vectorCartesian() {
		return fromLineCartesian(this.lineStartEnd);
	}
	/**
	* Returns a line from initial point to last point.
	*
	* If there are less than two points, Lines.Empty is returned
	*/
	get lineStartEnd() {
		const initial = this.initial;
		if (this.values.length < 2 || !initial) return Empty$2;
		return {
			a: initial,
			b: this.last
		};
	}
	/**
	* Returns distance from latest point to initial point.
	* If there are less than two points, zero is returned.
	*
	* This is the direct distance from initial to last,
	* not the accumulated length.
	* @returns Distance
	*/
	distanceFromStart() {
		const initial = this.initial;
		return this.values.length >= 2 && initial !== void 0 ? distance(initial, this.last) : 0;
	}
	/**
	* Difference between last point and the initial point, calculated
	* as a simple subtraction of x,y & z.
	*
	* `Points.Placeholder` is returned if there's only one point so far.
	*/
	difference() {
		const initial = this.initial;
		return this.values.length >= 2 && initial !== void 0 ? subtract(this.last, initial) : Placeholder$2;
	}
	/**
	* Returns angle (in radians) from latest point to the initial point
	* If there are less than two points, undefined is return.
	* @returns Angle in radians
	*/
	angleFromStart() {
		const initial = this.initial;
		if (initial !== void 0 && this.values.length > 2) return angleRadian(initial, this.last);
	}
	/**
	* Returns the total length of accumulated points.
	* Returns 0 if points were not saved, or there's only one
	*/
	get length() {
		if (this.values.length === 1) return 0;
		const l = this.line;
		return length(l);
	}
	/**
	* Returns the last x coord
	*/
	get x() {
		return this.last.x;
	}
	/**
	* Returns the last y coord
	*/
	get y() {
		return this.last.y;
	}
	/**
	* Returns the last z coord (or _undefined_ if not available)
	*/
	get z() {
		return this.last.z;
	}
};
/**
* A {@link TrackedValueMap} for points. Uses {@link PointTracker} to
* track added values.
*/
var PointsTracker = class extends TrackedValueMap {
	constructor(opts = {}) {
		super((key, start) => {
			if (start === void 0) throw new Error(`Requires start point`);
			const p = new PointTracker({
				...opts,
				id: key
			});
			p.seen(start);
			return p;
		});
	}
	/**
	* Track a PointerEvent
	* @param event
	*/
	seenEvent(event) {
		if (`getCoalescedEvents` in event) {
			const events = event.getCoalescedEvents();
			const seens = events.map((subEvent) => super.seen(subEvent.pointerId.toString(), subEvent));
			return Promise.all(seens);
		} else return Promise.all([super.seen(event.pointerId.toString(), event)]);
	}
};

//#endregion
//#region ../geometry/dist/src/point/progress-between.js
/**
* Computes the progress between two waypoints, given `position`.
*
* [Source](https://www.habrador.com/tutorials/math/2-passed-waypoint/?s=09)
* @param position Current position
* @param waypointA Start
* @param waypointB End
* @returns
*/
const progressBetween = (position, waypointA, waypointB) => {
	const a = subtract(position, waypointA);
	const b = subtract(waypointB, waypointA);
	return isPoint3d(a) && isPoint3d(b) ? (a.x * b.x + a.y * b.y + a.z * b.z) / (b.x * b.x + b.y * b.y + b.z * b.z) : (a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y);
};

//#endregion
//#region ../geometry/dist/src/point/project.js
/**
* Project `origin` by `distance` and `angle` (radians).
*
* To figure out rotation, imagine a horizontal line running through `origin`.
* * Rotation = 0 deg puts the point on the right of origin, on same y-axis
* * Rotation = 90 deg/3:00 puts the point below origin, on the same x-axis
* * Rotation = 180 deg/6:00 puts the point on the left of origin on the same y-axis
* * Rotation = 270 deg/12:00 puts the point above the origin, on the same x-axis
*
* ```js
* // Yields a point 100 units away from 10,20 with 10 degrees rotation (ie slightly down)
* const a = Points.project({x:10, y:20}, 100, degreeToRadian(10));
* ```
* @param origin
* @param distance
* @param angle
* @returns
*/
const project = (origin, distance$2, angle) => {
	const x = Math.cos(angle) * distance$2 + origin.x;
	const y = Math.sin(angle) * distance$2 + origin.y;
	return {
		x,
		y
	};
};

//#endregion
//#region ../geometry/dist/src/point/quantise.js
/**
* Quantises a point.
* @param pt
* @param snap
* @param middleRoundsUp
* @returns
*/
function quantiseEvery$1(pt, snap, middleRoundsUp = true) {
	guard$1(pt, `pt`);
	guard$1(snap, `snap`);
	if (isPoint3d(pt)) {
		if (!isPoint3d(snap)) throw new TypeError(`Param 'snap' is missing 'z' field`);
		return Object.freeze({
			x: quantiseEvery(pt.x, snap.x, middleRoundsUp),
			y: quantiseEvery(pt.y, snap.y, middleRoundsUp),
			z: quantiseEvery(pt.z, snap.z, middleRoundsUp)
		});
	}
	return Object.freeze({
		x: quantiseEvery(pt.x, snap.x, middleRoundsUp),
		y: quantiseEvery(pt.y, snap.y, middleRoundsUp)
	});
}

//#endregion
//#region ../geometry/dist/src/point/random.js
/**
* Returns a random 2D point on a 0..1 scale.
* ```js
* import { Points } from "@ixfx/geometry.js";
* const pt = Points.random(); // eg {x: 0.2549012, y:0.859301}
* ```
*
* A custom source of randomness can be provided:
* ```js
* import { Points } from "@ixfx/geometry.js";
* import { weightedSource } from "@ixfx/random.js"
* const pt = Points.random(weightedSource(`quadIn`));
* ```
* @param rando
* @returns
*/
const random$1 = (rando) => {
	if (typeof rando === `undefined`) rando = Math.random;
	return Object.freeze({
		x: rando(),
		y: rando()
	});
};
/**
* Returns a random 3D point on a 0..1 scale.
* ```js
* import { Points } from "@ixfx/geometry";
* const pt = Points.random(); // eg {x: 0.2549012, y:0.859301}
* ```
*
* A custom source of randomness can be provided:
* ```js
* import { Points } from "@ixfx/geometry";
* import { weightedSource } from "@ixfx/random.js"
* const pt = Points.random(weightedSource(`quadIn`));
* ```
* @param rando
* @returns
*/
const random3d = (rando) => {
	if (typeof rando === `undefined`) rando = Math.random;
	return Object.freeze({
		x: rando(),
		y: rando(),
		z: rando()
	});
};

//#endregion
//#region ../geometry/dist/src/point/reduce.js
/**
* Reduces over points, treating _x_ and _y_ separately.
*
* ```
* // Sum x and y values
* const total = Points.reduce(points, (p, acc) => {
*  return {x: p.x + acc.x, y: p.y + acc.y}
* });
* ```
* @param pts Points to reduce
* @param fn Reducer
* @param initial Initial value, uses `{ x:0, y:0 }` by default
* @returns
*/
const reduce = (pts, fn, initial) => {
	if (initial === void 0) initial = {
		x: 0,
		y: 0
	};
	let accumulator = initial;
	for (const p of pts) accumulator = fn(p, accumulator);
	return accumulator;
};

//#endregion
//#region ../geometry/dist/src/point/rotate.js
function rotate(pt, amountRadian, origin) {
	if (typeof origin === `undefined`) origin = {
		x: 0,
		y: 0
	};
	guard$1(origin, `origin`);
	resultThrow(numberTest(amountRadian, ``, `amountRadian`));
	const arrayInput = Array.isArray(pt);
	if (amountRadian === 0) return pt;
	if (!arrayInput) pt = [pt];
	const ptAr = pt;
	for (const [index, p] of ptAr.entries()) guard$1(p, `pt[${index}]`);
	const asPolar = ptAr.map((p) => fromCartesian(p, origin));
	const rotated = asPolar.map((p) => rotate$2(p, amountRadian));
	const asCartesisan = rotated.map((p) => toCartesian(p, origin));
	return arrayInput ? asCartesisan : asCartesisan[0];
}

//#endregion
//#region ../geometry/dist/src/point/rotate-point-array.js
const rotatePointArray = (v, amountRadian) => {
	const mat = [[Math.cos(amountRadian), -Math.sin(amountRadian)], [Math.sin(amountRadian), Math.cos(amountRadian)]];
	const result = [];
	for (const [index, element] of v.entries()) result[index] = [mat[0][0] * element[0] + mat[0][1] * element[1], mat[1][0] * element[0] + mat[1][1] * element[1]];
	return result;
};

//#endregion
//#region ../geometry/dist/src/point/round.js
/**
* Round the point's _x_ and _y_ to given number of digits
* @param ptOrX
* @param yOrDigits
* @param digits
* @returns
*/
const round$1 = (ptOrX, yOrDigits, digits) => {
	const pt = getPointParameter(ptOrX, yOrDigits);
	digits = digits ?? yOrDigits;
	digits = digits ?? 2;
	return Object.freeze({
		...pt,
		x: round(digits, pt.x),
		y: round(digits, pt.y)
	});
};

//#endregion
//#region ../geometry/dist/src/point/within-range.js
/**
* Returns true if two points are within a specified range on both axes.
*
* Provide a point for the range to set different x/y range, or pass a number
* to use the same range for both axis.
*
* Note this simply compares x,y values it does not calcuate distance.
*
* @example
* ```js
* withinRange({x:100,y:100}, {x:101, y:101}, 1); // True
* withinRange({x:100,y:100}, {x:105, y:101}, {x:5, y:1}); // True
* withinRange({x:100,y:100}, {x:105, y:105}, {x:5, y:1}); // False - y axis too far
* ```
* @param a
* @param b
* @param maxRange
* @returns
*/
const withinRange = (a, b, maxRange) => {
	guard$1(a, `a`);
	guard$1(b, `b`);
	if (typeof maxRange === `number`) {
		resultThrow(numberTest(maxRange, `positive`, `maxRange`));
		maxRange = {
			x: maxRange,
			y: maxRange
		};
	} else guard$1(maxRange, `maxRange`);
	const x = Math.abs(b.x - a.x);
	const y = Math.abs(b.y - a.y);
	return x <= maxRange.x && y <= maxRange.y;
};

//#endregion
//#region ../geometry/dist/src/point/wrap.js
/**
* Wraps a point to be within `ptMin` and `ptMax`.
* Note that max values are _exclusive_, meaning the return value will always be one less.
*
* Eg, if a view port is 100x100 pixels, wrapping the point 150,100 yields 50,99.
*
* ```js
* // Wraps 150,100 to on 0,0 -100,100 range
* wrap({x:150,y:100}, {x:100,y:100});
* ```
*
* Wrap normalised point:
* ```js
* wrap({x:1.2, y:1.5}); // Yields: {x:0.2, y:0.5}
* ```
* @param pt Point to wrap
* @param ptMax Maximum value, or `{ x:1, y:1 }` by default
* @param ptMin Minimum value, or `{ x:0, y:0 }` by default
* @returns Wrapped point
*/
const wrap$3 = (pt, ptMax, ptMin) => {
	if (ptMax === void 0) ptMax = {
		x: 1,
		y: 1
	};
	if (ptMin === void 0) ptMin = {
		x: 0,
		y: 0
	};
	guard$1(pt, `pt`);
	guard$1(ptMax, `ptMax`);
	guard$1(ptMin, `ptMin`);
	return Object.freeze({
		x: wrap(pt.x, ptMin.x, ptMax.x),
		y: wrap(pt.y, ptMin.y, ptMax.y)
	});
};

//#endregion
//#region ../geometry/dist/src/point/index.js
var point_exports = {};
__export(point_exports, {
	Empty: () => Empty,
	Empty3d: () => Empty3d,
	Placeholder: () => Placeholder$2,
	Placeholder3d: () => Placeholder3d,
	PointTracker: () => PointTracker,
	PointsTracker: () => PointsTracker,
	Unit: () => Unit,
	Unit3d: () => Unit3d,
	abs: () => abs,
	angleRadian: () => angleRadian,
	angleRadianCircle: () => angleRadianCircle,
	apply: () => apply$2,
	averager: () => averager,
	bbox: () => bbox$1,
	bbox3d: () => bbox3d,
	centroid: () => centroid$1,
	clamp: () => clamp$1,
	clampMagnitude: () => clampMagnitude,
	compare: () => compare,
	compareByX: () => compareByX,
	compareByY: () => compareByY,
	compareByZ: () => compareByZ,
	convexHull: () => convexHull,
	distance: () => distance,
	distanceToCenter: () => distanceToCenter,
	distanceToExterior: () => distanceToExterior,
	divide: () => divide$1,
	divider: () => divider,
	dotProduct: () => dotProduct$1,
	findMinimum: () => findMinimum,
	from: () => from,
	fromNumbers: () => fromNumbers,
	fromString: () => fromString,
	getPointParameter: () => getPointParameter,
	getTwoPointParameters: () => getTwoPointParameters,
	guard: () => guard$1,
	guardNonZeroPoint: () => guardNonZeroPoint,
	interpolate: () => interpolate$4,
	invert: () => invert$1,
	isEmpty: () => isEmpty,
	isEqual: () => isEqual,
	isNaN: () => isNaN$1,
	isNull: () => isNull,
	isPlaceholder: () => isPlaceholder,
	isPoint: () => isPoint,
	isPoint3d: () => isPoint3d,
	leftmost: () => leftmost,
	multiply: () => multiply$1,
	multiplyScalar: () => multiplyScalar,
	normalise: () => normalise,
	normaliseByRect: () => normaliseByRect,
	pipeline: () => pipeline,
	pipelineApply: () => pipelineApply,
	progressBetween: () => progressBetween,
	project: () => project,
	quantiseEvery: () => quantiseEvery$1,
	random: () => random$1,
	random3d: () => random3d,
	reduce: () => reduce,
	relation: () => relation,
	rightmost: () => rightmost,
	rotate: () => rotate,
	rotatePointArray: () => rotatePointArray,
	round: () => round$1,
	subtract: () => subtract,
	sum: () => sum,
	test: () => test,
	to2d: () => to2d,
	to3d: () => to3d,
	toArray: () => toArray,
	toIntegerValues: () => toIntegerValues,
	toString: () => toString$2,
	withinRange: () => withinRange,
	wrap: () => wrap$3
});

//#endregion
//#region ../geometry/dist/src/arc/index.js
var arc_exports = {};
__export(arc_exports, {
	angularSize: () => angularSize,
	bbox: () => bbox$4,
	distanceCenter: () => distanceCenter$1,
	fromCircle: () => fromCircle,
	fromCircleAmount: () => fromCircleAmount,
	fromDegrees: () => fromDegrees$1,
	getStartEnd: () => getStartEnd,
	guard: () => guard$3,
	interpolate: () => interpolate$3,
	isArc: () => isArc,
	isEqual: () => isEqual$3,
	isPositioned: () => isPositioned,
	length: () => length$2,
	point: () => point,
	toLine: () => toLine,
	toPath: () => toPath$3,
	toSvg: () => toSvg$1
});
/**
* Returns true if parameter is an arc
* @param p Arc or number
* @returns
*/
const isArc = (p) => typeof p.startRadian !== `undefined` && typeof p.endRadian !== `undefined` && typeof p.clockwise !== `undefined`;
/**
* Returns true if parameter has a positioned (x,y)
* @param p Point, Arc or ArcPositiond
* @returns
*/
const isPositioned = (p) => typeof p.x !== `undefined` && typeof p.y !== `undefined`;
/**
* Returns an arc from degrees, rather than radians
* @param radius Radius of arc
* @param startDegrees Start angle in degrees
* @param endDegrees End angle in degrees
* @param origin Optional center of arc
* @param clockwise Whether arc moves in clockwise direction
* @returns Arc
*/
function fromDegrees$1(radius, startDegrees, endDegrees, clockwise, origin) {
	const a = {
		radius,
		startRadian: degreeToRadian(startDegrees),
		endRadian: degreeToRadian(endDegrees),
		clockwise
	};
	if (isPoint(origin)) {
		guard$1(origin);
		const ap = {
			...a,
			x: origin.x,
			y: origin.y
		};
		return Object.freeze(ap);
	} else return Object.freeze(a);
}
/**
* Returns a {@link Line} linking the start and end points of an {@link ArcPositioned}.
*
* @param arc
* @returns Line from start to end of arc
*/
const toLine = (arc) => fromPoints$2(point(arc, arc.startRadian), point(arc, arc.endRadian));
/**
* Return start and end points of `arc`.
* `origin` will override arc's origin, if defined.
*
* See also:
* * {@link point} - get point on arc by angle
* * {@link interpolate} - get point on arc by interpolation percentage
* @param arc
* @param origin
* @returns
*/
const getStartEnd = (arc, origin) => {
	guard$3(arc);
	const start = point(arc, arc.startRadian, origin);
	const end = point(arc, arc.endRadian, origin);
	return [start, end];
};
/**
* Calculates a coordinate on an arc, based on an angle.
* `origin` will override arc's origin, if defined.
*
* See also:
* * {@link getStartEnd} - get start and end of arc
* * {@link interpolate} - get point on arc by interpolation percentage
* @param arc Arc
* @param angleRadian Angle of desired coordinate
* @param origin Origin of arc (0,0 used by default)
* @returns Coordinate
*/
const point = (arc, angleRadian$2, origin) => {
	if (typeof origin === `undefined`) origin = isPositioned(arc) ? arc : {
		x: 0,
		y: 0
	};
	return {
		x: Math.cos(angleRadian$2) * arc.radius + origin.x,
		y: Math.sin(angleRadian$2) * arc.radius + origin.y
	};
};
/**
* Throws an error if arc instance is invalid
* @param arc
*/
const guard$3 = (arc) => {
	if (typeof arc === `undefined`) throw new TypeError(`Arc is undefined`);
	if (isPositioned(arc)) guard$1(arc, `arc`);
	if (typeof arc.radius === `undefined`) throw new TypeError(`Arc radius is undefined (${JSON.stringify(arc)})`);
	if (typeof arc.radius !== `number`) throw new TypeError(`Radius must be a number`);
	if (Number.isNaN(arc.radius)) throw new TypeError(`Radius is NaN`);
	if (arc.radius <= 0) throw new TypeError(`Radius must be greater than zero`);
	if (typeof arc.startRadian === `undefined`) throw new TypeError(`Arc is missing 'startRadian' field`);
	if (typeof arc.endRadian === `undefined`) throw new TypeError(`Arc is missing 'startRadian' field`);
	if (Number.isNaN(arc.endRadian)) throw new TypeError(`Arc endRadian is NaN`);
	if (Number.isNaN(arc.startRadian)) throw new TypeError(`Arc endRadian is NaN`);
	if (typeof arc.clockwise === `undefined`) throw new TypeError(`Arc is missing 'clockwise field`);
	if (arc.startRadian >= arc.endRadian) throw new TypeError(`startRadian is expected to be les than endRadian`);
};
/**
* Compute relative position on arc.
*
* See also:
* * {@link getStartEnd} - get start and end of arc
* * {@link point} - get point on arc by angle
* @param arc Arc
* @param amount Relative position 0-1
* @param origin If arc is not positioned, pass in an origin
* @param allowOverflow If _true_ allows point to overflow arc dimensions (default: _false_)
* @returns
*/
const interpolate$3 = (amount, arc, allowOverflow, origin) => {
	guard$3(arc);
	const overflowOk = allowOverflow ?? false;
	if (!overflowOk) {
		if (amount < 0) throw new Error(`Param 'amount' is under zero, and overflow is not allowed`);
		if (amount > 1) throw new Error(`Param 'amount' is above 1 and overflow is not allowed`);
	}
	const span = angularSize(arc);
	const rel = span * amount;
	const angle = radiansSum(arc.startRadian, rel, arc.clockwise);
	return point(arc, angle, origin);
};
/**
* Returns the angular size of arc.
* Eg if arc runs from 45-315deg in clockwise direction, size will be 90deg.
* @param arc
*/
const angularSize = (arc) => radianArc(arc.startRadian, arc.endRadian, arc.clockwise);
/**
* Creates a {@link Path} instance from the arc. This wraps up some functions for convienence.
* @param arc
* @returns Path
*/
const toPath$3 = (arc) => {
	guard$3(arc);
	return Object.freeze({
		...arc,
		nearest: (_point) => {
			throw new Error(`not implemented`);
		},
		interpolate: (amount) => interpolate$3(amount, arc),
		bbox: () => bbox$4(arc),
		length: () => length$2(arc),
		toSvgString: () => toSvg$1(arc),
		relativePosition: (_point, _intersectionThreshold) => {
			throw new Error(`Not implemented`);
		},
		distanceToPoint: (_point) => {
			throw new Error(`Not implemented`);
		},
		kind: `arc`
	});
};
/**
* Returns an arc based on a circle using start and end angles.
* If you don't have the end angle, but rather the size of the arc, use {@link fromCircleAmount}
* @param circle Circle
* @param startRadian Start radian
* @param endRadian End radian
* @param clockwise Whether arc goes in a clockwise direction (default: true)
* @returns
*/
const fromCircle = (circle, startRadian, endRadian, clockwise = true) => {
	const a = Object.freeze({
		...circle,
		endRadian,
		startRadian,
		clockwise
	});
	return a;
};
/**
* Returns an arc based on a circle, a start angle, and the size of the arc.
* See {@link fromCircle} if you already have start and end angles.
* @param circle Circle to base off
* @param startRadian Starting angle
* @param sizeRadian Size of arc
* @param clockwise Whether arc moves in clockwise direction (default: true)
* @returns
*/
const fromCircleAmount = (circle, startRadian, sizeRadian, clockwise = true) => {
	const endRadian = radiansSum(startRadian, sizeRadian, clockwise);
	return fromCircle(circle, startRadian, endRadian);
};
/**
* Calculates the length of the arc
* @param arc
* @returns Length
*/
const length$2 = (arc) => piPi * arc.radius * ((arc.startRadian - arc.endRadian) / piPi);
/**
* Calculates a {@link Rect} bounding box for arc.
* @param arc
* @returns Rectangle encompassing arc.
*/
const bbox$4 = (arc) => {
	if (isPositioned(arc)) {
		const middle = interpolate$3(.5, arc);
		const asLine = toLine(arc);
		return bbox$1(middle, asLine.a, asLine.b);
	} else return {
		width: arc.radius * 2,
		height: arc.radius * 2
	};
};
/**
* Creates an SV path snippet for arc
* @returns
*/
const toSvg$1 = (a, b, c, d, e) => {
	if (isArc(a)) if (isPositioned(a)) if (isPoint(b)) return toSvgFull$1(b, a.radius, a.startRadian, a.endRadian, c);
	else return toSvgFull$1(a, a.radius, a.startRadian, a.endRadian, b);
	else return isPoint(b) ? toSvgFull$1(b, a.radius, a.startRadian, a.endRadian, c) : toSvgFull$1({
		x: 0,
		y: 0
	}, a.radius, a.startRadian, a.endRadian);
	else {
		if (c === void 0) throw new Error(`startAngle undefined`);
		if (d === void 0) throw new Error(`endAngle undefined`);
		if (isPoint(a)) if (typeof b === `number` && typeof c === `number` && typeof d === `number`) return toSvgFull$1(a, b, c, d, e);
		else throw new TypeError(`Expected (point, number, number, number). Missing a number param.`);
		else throw new Error(`Expected (point, number, number, number). Missing first point.`);
	}
};
const toSvgFull$1 = (origin, radius, startRadian, endRadian, opts) => {
	if (opts === void 0 || typeof opts !== `object`) opts = {};
	const isFullCircle = endRadian - startRadian === 360;
	const start = toCartesian(radius, endRadian - .01, origin);
	const end = toCartesian(radius, startRadian, origin);
	const { largeArc = false, sweep = false } = opts;
	const d = [`
    M ${start.x} ${start.y}
    A ${radius} ${radius} 0 ${largeArc ? `1` : `0`} ${sweep ? `1` : `0`} ${end.x} ${end.y},
  `];
	if (isFullCircle) d.push(`z`);
	return d;
};
/**
* Calculates the distance between the centers of two arcs
* @param a
* @param b
* @returns Distance
*/
const distanceCenter$1 = (a, b) => distance(a, b);
/**
* Returns true if the two arcs have the same values
*
* ```js
* const arcA = { radius: 5, endRadian: 0, startRadian: 1 };
* const arcA = { radius: 5, endRadian: 0, startRadian: 1 };
* arcA === arcB; // false, because object identities are different
* Arcs.isEqual(arcA, arcB); // true, because values are identical
* ```
* @param a
* @param b
* @returns {boolean}
*/
const isEqual$3 = (a, b) => {
	if (a.radius !== b.radius) return false;
	if (a.endRadian !== b.endRadian) return false;
	if (a.startRadian !== b.startRadian) return false;
	if (a.clockwise !== b.clockwise) return false;
	if (isPositioned(a) && isPositioned(b)) {
		if (a.x !== b.x) return false;
		if (a.y !== b.y) return false;
		if (a.z !== b.z) return false;
	} else if (!isPositioned(a) && !isPositioned(b)) {} else return false;
	return true;
};

//#endregion
//#region ../geometry/dist/src/bezier/guard.js
const isQuadraticBezier = (path) => path.quadratic !== void 0;
const isCubicBezier = (path) => path.cubic1 !== void 0 && path.cubic2 !== void 0;

//#endregion
//#region ../geometry/dist/src/bezier/index.js
var bezier_exports = {};
__export(bezier_exports, {
	cubic: () => cubic,
	interpolator: () => interpolator,
	isCubicBezier: () => isCubicBezier,
	isQuadraticBezier: () => isQuadraticBezier,
	quadratic: () => quadratic,
	quadraticSimple: () => quadraticSimple,
	quadraticToSvgString: () => quadraticToSvgString,
	toPath: () => toPath$2
});
/**
* Returns a new quadratic bezier with specified bend amount
*
* @param {QuadraticBezier} b Curve
* @param {number} [bend=0] Bend amount, from -1 to 1
* @returns {QuadraticBezier}
*/
/**
* Creates a simple quadratic bezier with a specified amount of 'bend'.
* Bend of -1 will pull curve down, 1 will pull curve up. 0 is no curve.
*
* Use {@link interpolator} to calculate a point along the curve.
* @param {Point} start Start of curve
* @param {Point} end End of curve
* @param {number} [bend=0] Bend amount, -1 to 1
* @returns {QuadraticBezier}
*/
const quadraticSimple = (start, end, bend = 0) => {
	if (Number.isNaN(bend)) throw new Error(`bend is NaN`);
	if (bend < -1 || bend > 1) throw new Error(`Expects bend range of -1 to 1`);
	const middle = interpolate$2(.5, start, end);
	let target = middle;
	if (end.y < start.y) target = bend > 0 ? {
		x: Math.min(start.x, end.x),
		y: Math.min(start.y, end.y)
	} : {
		x: Math.max(start.x, end.x),
		y: Math.max(start.y, end.y)
	};
	else target = bend > 0 ? {
		x: Math.max(start.x, end.x),
		y: Math.min(start.y, end.y)
	} : {
		x: Math.min(start.x, end.x),
		y: Math.max(start.y, end.y)
	};
	const handle = interpolate$2(Math.abs(bend), middle, target);
	return quadratic(start, end, handle);
};
/**
* Returns a relative point on a simple quadratic
* @param start Start
* @param end  End
* @param bend Bend (-1 to 1)
* @param amt Amount
* @returns Point
*/
/**
* Interpolate cubic or quadratic bezier
* ```js
* const i = interpolator(myBezier);
*
* // Get point at 50%
* i(0.5); // { x, y }
* ```
* @param q
* @returns
*/
const interpolator = (q) => {
	const bzr = isCubicBezier(q) ? new Bezier(q.a.x, q.a.y, q.cubic1.x, q.cubic1.y, q.cubic2.x, q.cubic2.y, q.b.x, q.b.y) : new Bezier(q.a, q.quadratic, q.b);
	return (amount) => bzr.compute(amount);
};
const quadraticToSvgString = (start, end, handle) => [`M ${start.x} ${start.y} Q ${handle.x} ${handle.y} ${end.x} ${end.y}`];
const toPath$2 = (cubicOrQuadratic) => {
	if (isCubicBezier(cubicOrQuadratic)) return cubicToPath(cubicOrQuadratic);
	else if (isQuadraticBezier(cubicOrQuadratic)) return quadratictoPath(cubicOrQuadratic);
	else throw new Error(`Unknown bezier type`);
};
const cubic = (start, end, cubic1, cubic2) => ({
	a: Object.freeze(start),
	b: Object.freeze(end),
	cubic1: Object.freeze(cubic1),
	cubic2: Object.freeze(cubic2)
});
const cubicToPath = (cubic$1) => {
	const { a, cubic1, cubic2, b } = cubic$1;
	const bzr = new Bezier(a, cubic1, cubic2, b);
	return Object.freeze({
		...cubic$1,
		length: () => bzr.length(),
		interpolate: (t) => bzr.compute(t),
		nearest: (_) => {
			throw new Error(`not implemented`);
		},
		bbox: () => {
			const { x, y } = bzr.bbox();
			const xSize = x.size;
			const ySize = y.size;
			if (xSize === void 0) throw new Error(`x.size not present on calculated bbox`);
			if (ySize === void 0) throw new Error(`x.size not present on calculated bbox`);
			return fromTopLeft({
				x: x.min,
				y: y.min
			}, xSize, ySize);
		},
		relativePosition: (_point, _intersectionThreshold) => {
			throw new Error(`Not implemented`);
		},
		distanceToPoint: (_point) => {
			throw new Error(`Not implemented`);
		},
		toSvgString: () => [`brrup`],
		kind: `bezier/cubic`
	});
};
const quadratic = (start, end, handle) => ({
	a: Object.freeze(start),
	b: Object.freeze(end),
	quadratic: Object.freeze(handle)
});
const quadratictoPath = (quadraticBezier) => {
	const { a, b, quadratic: quadratic$1 } = quadraticBezier;
	const bzr = new Bezier(a, quadratic$1, b);
	return Object.freeze({
		...quadraticBezier,
		length: () => bzr.length(),
		interpolate: (t) => bzr.compute(t),
		nearest: (_) => {
			throw new Error(`not implemented`);
		},
		bbox: () => {
			const { x, y } = bzr.bbox();
			const xSize = x.size;
			const ySize = y.size;
			if (xSize === void 0) throw new Error(`x.size not present on calculated bbox`);
			if (ySize === void 0) throw new Error(`x.size not present on calculated bbox`);
			return fromTopLeft({
				x: x.min,
				y: y.min
			}, xSize, ySize);
		},
		distanceToPoint: (_point) => {
			throw new Error(`Not implemented`);
		},
		relativePosition: (_point, _intersectionThreshold) => {
			throw new Error(`Not implemented`);
		},
		toString: () => bzr.toString(),
		toSvgString: () => quadraticToSvgString(a, b, quadratic$1),
		kind: `bezier/quadratic`
	});
};

//#endregion
//#region ../geometry/dist/src/circle/area.js
/**
* Returns the area of `circle`.
* @param circle
* @returns
*/
const area$4 = (circle) => {
	guard$2(circle);
	return Math.PI * circle.radius * circle.radius;
};

//#endregion
//#region ../geometry/dist/src/circle/bbox.js
/**
* Computes a bounding box that encloses circle
* @param circle
* @returns
*/
const bbox$3 = (circle) => {
	return isCirclePositioned(circle) ? fromCenter$2(circle, circle.radius * 2, circle.radius * 2) : {
		width: circle.radius * 2,
		height: circle.radius * 2,
		x: 0,
		y: 0
	};
};

//#endregion
//#region ../geometry/dist/src/circle/center.js
/**
* Returns the center of a circle
*
* If the circle has an x,y, that is the center.
* If not, `radius` is used as the x and y.
*
* ```js
* const circle = { radius: 5, x: 10, y: 10};
*
* // Yields: { x: 5, y: 10 }
* Circles.center(circle);
* ```
*
* It's a trivial function, but can make for more understandable code
* @param circle
* @returns Center of circle
*/
const center = (circle) => {
	return isCirclePositioned(circle) ? Object.freeze({
		x: circle.x,
		y: circle.y
	}) : Object.freeze({
		x: circle.radius,
		y: circle.radius
	});
};

//#endregion
//#region ../geometry/dist/src/circle/exterior-points.js
/**
* Yields the points making up the exterior (ie. circumference) of the circle.
* Uses [Midpoint Circle Algorithm](http://en.wikipedia.org/wiki/Midpoint_circle_algorithm)
*
* @example Draw outline of circle
* ```js
* const circle = { x: 100, y: 100, radius: 50 }
* for (const pt of Circles.exteriorIntegerPoints(circle)) {
*  // Fill 1x1 pixel
*  ctx.fillRect(pt.x, pt.y, 1, 1);
* }
* ```
* @param circle
*/
function* exteriorIntegerPoints(circle) {
	const { x, y, radius } = circle;
	let xx = radius;
	let yy = 0;
	let radiusError = 1 - x;
	while (xx >= yy) {
		yield {
			x: xx + x,
			y: yy + y
		};
		yield {
			x: yy + x,
			y: xx + y
		};
		yield {
			x: -xx + x,
			y: yy + y
		};
		yield {
			x: -yy + x,
			y: xx + y
		};
		yield {
			x: -xx + x,
			y: -yy + y
		};
		yield {
			x: -yy + x,
			y: -xx + y
		};
		yield {
			x: xx + x,
			y: -yy + y
		};
		yield {
			x: yy + x,
			y: -xx + y
		};
		yy++;
		if (radiusError < 0) radiusError += 2 * yy + 1;
		else {
			xx--;
			radiusError += 2 * (yy - xx + 1);
		}
	}
}

//#endregion
//#region ../geometry/dist/src/circle/interior-points.js
/**
* Returns all integer points contained within `circle`.
*
* ```js
* const c = { x:100, y:100, radius:100 };
* for (const pt of Circles.interiorIntegerPoints(c)) {
*   ctx.fillRect(pt.x, pt.y, 1, 1);
* }
* ```
* @param circle
*/
function* interiorIntegerPoints(circle) {
	const xMin = circle.x - circle.radius;
	const xMax = circle.x + circle.radius;
	const yMin = circle.y - circle.radius;
	const yMax = circle.y + circle.radius;
	for (let x = xMin; x < xMax; x++) for (let y = yMin; y < yMax; y++) {
		const r = Math.abs(distance(circle, x, y));
		if (r <= circle.radius) yield {
			x,
			y
		};
	}
}

//#endregion
//#region ../geometry/dist/src/circle/perimeter.js
const piPi$4 = Math.PI * 2;
/**
* Returns the nearest point on `circle`'s perimeter closest to `point`.
*
* ```js
* const pt = Circles.nearest(circle, {x:10,y:10});
* ```
*
* If an array of circles is provided, it will be the closest point amongst all the circles
* @param circle Circle or array of circles
* @param point
* @returns Point `{ x, y }`
*/
const nearest = (circle, point$1) => {
	const n = (a) => {
		const l = Math.sqrt(Math.pow(point$1.x - a.x, 2) + Math.pow(point$1.y - a.y, 2));
		const x = a.x + a.radius * ((point$1.x - a.x) / l);
		const y = a.y + a.radius * ((point$1.y - a.y) / l);
		return {
			x,
			y
		};
	};
	if (Array.isArray(circle)) {
		const pts = circle.map((l) => n(l));
		const dists = pts.map((p) => distance(p, point$1));
		return Object.freeze(pts[minIndex(...dists)]);
	} else return Object.freeze(n(circle));
};
/**
* Returns a point on a circle's perimeter at a specified angle in radians
*
* ```js
* // Circle without position
* const circleA = { radius: 5 };
*
* // Get point at angle Math.PI, passing in a origin coordinate
* const ptA = Circles.pointOnPerimeter(circleA, Math.PI, {x: 10, y: 10 });
*
* // Point on circle with position
* const circleB = { radius: 5, x: 10, y: 10};
* const ptB = Circles.pointOnPerimeter(circleB, Math.PI);
* ```
* @param circle
* @param angleRadian Angle in radians
* @param origin or offset of calculated point. By default uses center of circle or 0,0 if undefined
* @returns Point oo circle
*/
const pointOnPerimeter = (circle, angleRadian$2, origin) => {
	if (origin === void 0) origin = isCirclePositioned(circle) ? circle : {
		x: 0,
		y: 0
	};
	return {
		x: Math.cos(-angleRadian$2) * circle.radius + origin.x,
		y: Math.sin(-angleRadian$2) * circle.radius + origin.y
	};
};
/**
* Returns circumference of `circle` (alias of {@link length})
* @param circle
* @returns
*/
const circumference = (circle) => {
	guard$2(circle);
	return piPi$4 * circle.radius;
};
/**
* Returns circumference of `circle` (alias of {@link circumference})
* @param circle
* @returns
*/
const length$1 = (circle) => circumference(circle);

//#endregion
//#region ../geometry/dist/src/circle/interpolate.js
const piPi$3 = Math.PI * 2;
/**
* Computes relative position along circle perimeter
*
* ```js
* const circle = { radius: 100, x: 100, y: 100 };
*
* // Get a point halfway around circle
* // Yields { x, y }
* const pt = Circles.interpolate(circle, 0.5);
* ```
* @param circle
* @param t Position, 0-1
* @returns
*/
const interpolate$1 = (circle, t) => pointOnPerimeter(circle, t * piPi$3);

//#endregion
//#region ../geometry/dist/src/circle/is-contained-by.js
/**
* Returns true if `b` is completely contained by `a`
*
* ```js
* // Compare two points
* isContainedBy(circleA, circleB);
*
* // Compare a circle with a point
* isContainedBy(circleA, {x: 10, y: 20});
*
* // Define radius as third parameter
* isContainedBy(circleA, {x: 10, y: 20}, 20);
* ```
* @param a Circle
* @param b Circle or point to compare to
* @param c Radius to accompany parameter b if it's a point
* @returns
*/
const isContainedBy = (a, b, c) => {
	const d = distanceCenter(a, b);
	if (isCircle(b)) return d < Math.abs(a.radius - b.radius);
	else if (isPoint(b)) if (c === void 0) return d <= a.radius;
	else return d < Math.abs(a.radius - c);
	else throw new Error(`b parameter is expected to be CirclePositioned or Point`);
};

//#endregion
//#region ../geometry/dist/src/circle/intersecting.js
/**
* Returns true if `a` or `b` overlap, are equal, or `a` contains `b`.
* A circle can be checked for intersections with another CirclePositioned, Point or RectPositioned.
*
* Use `intersections` to find the points of intersection.
*
* @param a Circle
* @param b Circle or point to test
* @returns True if circle overlap
*/
const isIntersecting = (a, b, c) => {
	if (isEqual(a, b)) return true;
	if (isContainedBy(a, b, c)) return true;
	if (isCircle(b)) return circleCircle(a, b);
	else if (isRectPositioned(b)) return circleRect(a, b);
	else if (isPoint(b) && c !== void 0) return circleCircle(a, {
		...b,
		radius: c
	});
	return false;
};

//#endregion
//#region ../geometry/dist/src/circle/multiply.js
/**
* Multiplies a circle's radius and position (if provided) by `value`.
*
* ```js
* multiplyScalar({ radius: 5 }, 5);
* // Yields: { radius: 25 }
*
* multiplyScalar({ radius: 5, x: 10, y: 20 }, 5);
* // Yields: { radius: 25, x: 50, y: 100 }
* ```
*/
function multiplyScalar$1(a, value) {
	if (isCirclePositioned(a)) {
		const pt = multiplyScalar(a, value);
		return Object.freeze({
			...a,
			...pt,
			radius: a.radius * value
		});
	} else return Object.freeze({
		...a,
		radius: a.radius * value
	});
}

//#endregion
//#region ../geometry/dist/src/circle/random.js
const piPi$2 = Math.PI * 2;
/**
* Returns a random point within a circle.
*
* By default creates a uniform distribution.
*
* ```js
* const pt = randomPoint({radius: 5});
* const pt = randomPoint({radius: 5, x: 10, y: 20});
* ```'
*
* Generate points with a gaussian distribution
* ```js
* const pt = randomPoint(circle, {
*  randomSource: Random.gaussian
* })
* ```
* @param within Circle to generate a point within
* @param opts Options
* @returns
*/
const randomPoint$1 = (within, opts = {}) => {
	const offset$1 = isCirclePositioned(within) ? within : {
		x: 0,
		y: 0
	};
	const strategy = opts.strategy ?? `uniform`;
	const margin = opts.margin ?? 0;
	const radius = within.radius - margin;
	const rand = opts.randomSource ?? Math.random;
	switch (strategy) {
		case `naive`: return sum(offset$1, toCartesian(rand() * radius, rand() * piPi$2));
		case `uniform`: return sum(offset$1, toCartesian(Math.sqrt(rand()) * radius, rand() * piPi$2));
		default: throw new Error(`Unknown strategy '${strategy}'. Expects 'uniform' or 'naive'`);
	}
};

//#endregion
//#region ../geometry/dist/src/circle/svg.js
/**
* Creates a SVG path segment.
* @param a Circle or radius
* @param sweep If true, path is 'outward'
* @param origin Origin of path. Required if first parameter is just a radius or circle is non-positioned
* @returns
*/
const toSvg = (a, sweep, origin) => {
	if (isCircle(a)) {
		if (origin !== void 0) return toSvgFull(a.radius, origin, sweep);
		if (isCirclePositioned(a)) return toSvgFull(a.radius, a, sweep);
		else throw new Error(`origin parameter needed for non-positioned circle`);
	} else if (origin === void 0) throw new Error(`origin parameter needed`);
	else return toSvgFull(a, origin, sweep);
};
const toSvgFull = (radius, origin, sweep) => {
	const { x, y } = origin;
	const s = sweep ? `1` : `0`;
	return `
    M ${x}, ${y}
    m -${radius}, 0
    a ${radius},${radius} 0 1,${s} ${radius * 2},0
    a ${radius},${radius} 0 1,${s} -${radius * 2},0
  `.split(`\n`);
};

//#endregion
//#region ../geometry/dist/src/circle/to-path.js
/**
* Returns a `CircularPath` representation of a circle
*
* @param {CirclePositioned} circle
* @returns {CircularPath}
*/
const toPath$1 = (circle) => {
	guard$2(circle);
	return {
		...circle,
		nearest: (point$1) => nearest(circle, point$1),
		interpolate: (t) => interpolate$1(circle, t),
		bbox: () => bbox$3(circle),
		length: () => circumference(circle),
		toSvgString: (sweep = true) => toSvg(circle, sweep),
		relativePosition: (_point, _intersectionThreshold) => {
			throw new Error(`Not implemented`);
		},
		distanceToPoint: (_point) => {
			throw new Error(`Not implemented`);
		},
		kind: `circular`
	};
};

//#endregion
//#region ../geometry/dist/src/circle/to-positioned.js
/**
* Returns a positioned version of a circle.
* If circle is already positioned, it is returned.
* If no default position is supplied, 0,0 is used.
* @param circle
* @param defaultPositionOrX
* @param y
* @returns
*/
const toPositioned = (circle, defaultPositionOrX, y) => {
	if (isCirclePositioned(circle)) return circle;
	const pt = getPointParameter(defaultPositionOrX, y);
	return Object.freeze({
		...circle,
		...pt
	});
};

//#endregion
//#region ../geometry/dist/src/circle/index.js
var circle_exports = {};
__export(circle_exports, {
	area: () => area$4,
	bbox: () => bbox$3,
	center: () => center,
	circumference: () => circumference,
	distanceCenter: () => distanceCenter,
	distanceFromExterior: () => distanceFromExterior$1,
	exteriorIntegerPoints: () => exteriorIntegerPoints,
	guard: () => guard$2,
	guardPositioned: () => guardPositioned,
	interiorIntegerPoints: () => interiorIntegerPoints,
	interpolate: () => interpolate$1,
	intersectionLine: () => intersectionLine,
	intersections: () => intersections,
	isCircle: () => isCircle,
	isCirclePositioned: () => isCirclePositioned,
	isContainedBy: () => isContainedBy,
	isEqual: () => isEqual$6,
	isIntersecting: () => isIntersecting,
	isNaN: () => isNaN,
	isPositioned: () => isPositioned$2,
	length: () => length$1,
	multiplyScalar: () => multiplyScalar$1,
	nearest: () => nearest,
	pointOnPerimeter: () => pointOnPerimeter,
	randomPoint: () => randomPoint$1,
	toPath: () => toPath$1,
	toPositioned: () => toPositioned,
	toSvg: () => toSvg
});

//#endregion
//#region ../geometry/dist/src/grid/inside.js
/**
* Returns _true_ if cell coordinates are above zero and within bounds of grid
*
* @param grid
* @param cell
* @return
*/
const inside = (grid, cell) => {
	if (cell.x < 0 || cell.y < 0) return false;
	if (cell.x >= grid.cols || cell.y >= grid.rows) return false;
	return true;
};

//#endregion
//#region ../geometry/dist/src/grid/guards.js
/**
* Returns true if `cell` parameter is a cell with x,y fields.
* Does not check validity of fields.
*
* @param cell
* @return True if parameter is a cell
*/
const isCell = (cell) => {
	if (cell === void 0) return false;
	return `x` in cell && `y` in cell;
};
/**
* Throws an exception if any of the cell's parameters are invalid
* @private
* @param cell
* @param parameterName
* @param grid
*/
const guardCell = (cell, parameterName = `Param`, grid) => {
	if (cell === void 0) throw new Error(parameterName + ` is undefined. Expecting {x,y}`);
	if (cell.x === void 0) throw new Error(parameterName + `.x is undefined`);
	if (cell.y === void 0) throw new Error(parameterName + `.y is undefined`);
	if (Number.isNaN(cell.x)) throw new Error(parameterName + `.x is NaN`);
	if (Number.isNaN(cell.y)) throw new Error(parameterName + `.y is NaN`);
	if (!Number.isInteger(cell.x)) throw new TypeError(parameterName + `.x is non-integer`);
	if (!Number.isInteger(cell.y)) throw new TypeError(parameterName + `.y is non-integer`);
	if (grid !== void 0 && !inside(grid, cell)) throw new Error(`${parameterName} is outside of grid. Cell: ${cell.x},${cell.y} Grid: ${grid.cols}, ${grid.rows}`);
};
/**
* Throws an exception if any of the grid's parameters are invalid
* @param grid
* @param parameterName
*/
const guardGrid = (grid, parameterName = `Param`) => {
	if (grid === void 0) throw new Error(`${parameterName} is undefined. Expecting grid.`);
	if (!(`rows` in grid)) throw new Error(`${parameterName}.rows is undefined`);
	if (!(`cols` in grid)) throw new Error(`${parameterName}.cols is undefined`);
	if (!Number.isInteger(grid.rows)) throw new TypeError(`${parameterName}.rows is not an integer`);
	if (!Number.isInteger(grid.cols)) throw new TypeError(`${parameterName}.cols is not an integer`);
};

//#endregion
//#region ../geometry/dist/src/grid/apply-bounds.js
/**
* Calculates a legal position for a cell based on
* `grid` size and `bounds` wrapping logic.
* @param grid
* @param cell
* @param wrap
* @returns
*/
const applyBounds = function(grid, cell, wrap$4 = `undefined`) {
	guardGrid(grid, `grid`);
	guardCell(cell, `cell`);
	let x = cell.x;
	let y = cell.y;
	switch (wrap$4) {
		case `wrap`: {
			x = x % grid.cols;
			y = y % grid.rows;
			if (x < 0) x = grid.cols + x;
			else if (x >= grid.cols) x -= grid.cols;
			if (y < 0) y = grid.rows + y;
			else if (y >= grid.rows) y -= grid.rows;
			x = Math.abs(x);
			y = Math.abs(y);
			break;
		}
		case `stop`: {
			x = clampIndex(x, grid.cols);
			y = clampIndex(y, grid.rows);
			break;
		}
		case `undefined`: {
			if (x < 0 || y < 0) return;
			if (x >= grid.cols || y >= grid.rows) return;
			break;
		}
		case `unbounded`: break;
		default: throw new Error(`Unknown BoundsLogic '${wrap$4}'. Expected: wrap, stop, undefined or unbounded`);
	}
	return Object.freeze({
		x,
		y
	});
};

//#endregion
//#region ../geometry/dist/src/grid/array-1d.js
var array_1d_exports = {};
__export(array_1d_exports, {
	access: () => access$1,
	createArray: () => createArray,
	createMutable: () => createMutable,
	set: () => set$1,
	setMutate: () => setMutate$1,
	wrap: () => wrap$2,
	wrapMutable: () => wrapMutable$1
});
/**
* Returns a {@link GridCellAccessor} to get values from `array`
* based on cell (`{x,y}`) coordinates.
*
* ```js
* const arr = [
*  1,2,3,
*  4,5,6
* ]
* const a = access(arr, 3);
* a({x:0,y:0});  // 1
* a({x:2, y:2}); // 6
* ```
* @param array
* @param cols
* @returns
*/
const access$1 = (array, cols) => {
	const grid = gridFromArrayDimensions(array, cols);
	const fn = (cell, wrap$4 = `undefined`) => accessWithGrid$1(grid, array, cell, wrap$4);
	return fn;
};
const accessWithGrid$1 = (grid, array, cell, wrap$4) => {
	const index = indexFromCell(grid, cell, wrap$4);
	if (index === void 0) return void 0;
	return array[index];
};
/**
* Returns a {@link GridCellSetter} that can mutate
* array values based on cell {x,y} positions.
* ```js
* const arr = [
*  1,2,3,
*  4,5,6
* ]
* const a = setMutate(arr, 3);
* a(10, {x:0,y:0});
* a(20, {x:2, y:2});
*
* // Arr is now:
* // [
* //  10, 2, 3,
* //  4, 5, 20
* // ]
* ```
* @param array
* @param cols
* @returns
*/
const setMutate$1 = (array, cols) => {
	const grid = gridFromArrayDimensions(array, cols);
	return (value, cell, wrap$4 = `undefined`) => setMutateWithGrid$1(grid, array, value, cell, wrap$4);
};
const setMutateWithGrid$1 = (grid, array, value, cell, wrap$4) => {
	const index = indexFromCell(grid, cell, wrap$4);
	if (index === void 0) throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid cols: ${grid.cols} rows: ${grid.rows}`);
	array[index] = value;
	return array;
};
const set$1 = (array, cols) => {
	const grid = gridFromArrayDimensions(array, cols);
	return (value, cell, wrap$4) => setWithGrid$1(grid, array, value, cell, wrap$4);
};
const setWithGrid$1 = (grid, array, value, cell, wrap$4) => {
	const index = indexFromCell(grid, cell, wrap$4);
	if (index === void 0) throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid cols: ${grid.cols} rows: ${grid.rows}`);
	const copy = [...array];
	copy[index] = value;
	array = copy;
	return copy;
};
/**
* Creates a {@link Grid} from the basis of an array and a given number of columns
* @param array
* @param cols
* @returns
*/
const gridFromArrayDimensions = (array, cols) => {
	const grid = {
		cols,
		rows: Math.ceil(array.length / cols)
	};
	return grid;
};
/**
* Wraps `array` for grid access.
* Mutable, meaning that `array` gets modified if `set` function is used.
*
* ```js
* const g = wrapMutable(myArray, 5); // 5 columns wide
* g.get({x:1,y:2});     // Get value at cell position
* g.set(10, {x:1,y:2}); // Set value at cell position
* g.array;              // Get reference to original passed-in array
* ```
*
* Use {@link wrap} for an immutable version.
*
* @param array Array to wrap
* @param cols Width of grid
* @returns
*/
const wrapMutable$1 = (array, cols) => {
	const grid = gridFromArrayDimensions(array, cols);
	return {
		...grid,
		get: access$1(array, cols),
		set: setMutate$1(array, cols),
		get array() {
			return array;
		}
	};
};
/**
* Wraps `array` for grid access.
* Immutable, such that underlying array is not modified and a
* call to `set` returns a new `GridArray1d`.
*
* ```js
* const myArray = [
*    `a`, `b`, `c`,
*    `d`, `e`, `f`
* ];
* let g = wrap(myArray, 3);  // 3 columns wide
* g.get({ x:1, y:2 });          // Get value at cell position
*
* // Note that `set` returns a new instance
* g = g.set(10, { x:1, y:2 });  // Set value at cell position
* g.array;                      // Get reference to current array
* ```
*
* Use {@link wrapMutable} to modify an array in-place
* @param array Array to wrap
* @param cols Width of grid
* @returns
*/
const wrap$2 = (array, cols) => {
	const grid = gridFromArrayDimensions(array, cols);
	return {
		...grid,
		get: (cell, boundsLogic = `undefined`) => accessWithGrid$1(grid, array, cell, boundsLogic),
		set: (value, cell, boundsLogic = `undefined`) => {
			array = setWithGrid$1(grid, array, value, cell, boundsLogic);
			return wrap$2(array, cols);
		},
		get array() {
			return array;
		}
	};
};
/**
* Creates a 1-dimensional array to fit a grid of rows x cols.
* Use {@link createArray} if you want to create this array and wrap it for grid access.
*
* ```js
* // Creates an array filled with 0, sized for a grid 10 rows by 20 columns
* const arr = createArray(0, 10, 20);
*
* // Alternatively, pass in a grid
* const arr = createArray(0, { rows: 10, cols: 20 });
* ```
* @param rowsOrGrid Number of rows, or a grid to use the settings of
* @param columns Columns
*/
const createArray = (initialValue, rowsOrGrid, columns$1) => {
	const rows$1 = typeof rowsOrGrid === `number` ? rowsOrGrid : rowsOrGrid.rows;
	const cols = typeof rowsOrGrid === `object` ? rowsOrGrid.cols : columns$1;
	if (!cols) throw new Error(`Parameter 'columns' missing`);
	resultThrow(integerTest(rows$1, `aboveZero`, `rows`), integerTest(cols, `aboveZero`, `cols`));
	const t = [];
	const total = rows$1 * cols;
	for (let index = 0; index < total; index++) t[index] = initialValue;
	return t;
};
/**
* Creates a {@link GridArray1d} instance given the dimensions of the grid.
* Use {@link createArray} if you just want to create an array sized for a grid.
*
* Behind the scenes, it runs:
* ```js
* const arr = createArray(initialValue, rows, cols);
* return wrapMutable(arr, cols);
* ```
* @param initialValue
* @param rowsOrGrid
* @param columns
* @returns
*/
const createMutable = (initialValue, rowsOrGrid, columns$1) => {
	const rows$1 = typeof rowsOrGrid === `number` ? rowsOrGrid : rowsOrGrid.rows;
	const cols = typeof rowsOrGrid === `object` ? rowsOrGrid.cols : columns$1;
	if (!cols) throw new Error(`Parameter 'columns' missing`);
	const array = createArray(initialValue, rows$1, cols);
	return wrapMutable$1(array, cols);
};

//#endregion
//#region ../geometry/dist/src/grid/array-2d.js
var array_2d_exports = {};
__export(array_2d_exports, {
	access: () => access,
	create: () => create$1,
	set: () => set,
	setMutate: () => setMutate,
	wrap: () => wrap$1,
	wrapMutable: () => wrapMutable
});
/**
* Create a grid from a 2-dimensional array.
* ```js
* const data = [
*  [1,2,3],
*  [4,5,6]
* ]
* const g = create(data);
* // { rows: 2, cols: 3 }
* ```
* @param array
* @returns
*/
const create$1 = (array) => {
	let colLen = NaN;
	for (const row of array) if (Number.isNaN(colLen)) colLen = row.length;
	else if (colLen !== row.length) throw new Error(`Array does not have uniform column length`);
	return {
		rows: array.length,
		cols: colLen
	};
};
const setMutate = (array) => {
	const grid = create$1(array);
	return (value, cell, wrap$4 = `undefined`) => setMutateWithGrid(grid, array, value, cell, wrap$4);
};
/**
* Returns a function that updates a 2D array representation
* of a grid. Array is mutated.
*
* ```js
* const m = Grids.Array2d.setMutateWithGrid(grid, array);
* m(someValue, { x:2, y:3 });
* ```
* @param grid
* @param array
* @returns
*/
const setMutateWithGrid = (grid, array, value, cell, bounds) => {
	let boundCell = applyBounds(grid, cell, bounds);
	if (boundCell === void 0) throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid cols: ${grid.cols} rows: ${grid.rows}`);
	array[boundCell.y][boundCell.x] = value;
	return array;
};
const access = (array) => {
	const grid = create$1(array);
	const fn = (cell, wrap$4 = `undefined`) => accessWithGrid(grid, array, cell, wrap$4);
	return fn;
};
const accessWithGrid = (grid, array, cell, wrap$4) => {
	let boundCell = applyBounds(grid, cell, wrap$4);
	if (boundCell === void 0) return void 0;
	return array[boundCell.y][boundCell.x];
};
const wrapMutable = (array) => {
	const grid = create$1(array);
	return {
		...grid,
		get: access(array),
		set: setMutate(array),
		get array() {
			return array;
		}
	};
};
const set = (array) => {
	const grid = create$1(array);
	return (value, cell, wrap$4) => setWithGrid(grid, array, value, cell, wrap$4);
};
const setWithGrid = (grid, array, value, cell, wrap$4) => {
	let boundCell = applyBounds(grid, cell, wrap$4);
	if (boundCell === void 0) throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid cols: ${grid.cols} rows: ${grid.rows}`);
	let copyWhole = [...array];
	let copyRow = [...copyWhole[boundCell.y]];
	copyRow[boundCell.x] = value;
	copyWhole[boundCell.y] = copyRow;
	array = copyWhole;
	return copyWhole;
};
/**
* Wraps `array` with two dimensions for grid access.
* Immutable, such that underlying array is not modified and a
* call to `set` returns a new `GridArray1d`.
*
* ```js
* // Grid of rows: 2, cols: 3
* const myArray = [
*  [ `a`, `b`, `c` ],
*  [ `d`, `e`, `f` ]
* ]
* let g = wrap(myArray);
* g.get({x:1,y:2});          // Get value at cell position
* g = g.set(10, {x:1,y:2}); // Set value at cell position
* g.array;                  // Get reference to current array
* ```
*
* Use {@link wrapMutable} to modify an array in-place
* @param array Array to wrap
* @returns
*/
const wrap$1 = (array) => {
	const grid = create$1(array);
	return {
		...grid,
		get: (cell, boundsLogic = `undefined`) => accessWithGrid(grid, array, cell, boundsLogic),
		set: (value, cell, boundsLogic = `undefined`) => {
			array = setWithGrid(grid, array, value, cell, boundsLogic);
			return wrap$1(array);
		},
		get array() {
			return array;
		}
	};
};

//#endregion
//#region ../geometry/dist/src/grid/values.js
/**
* Converts an 1D or 2D array of cell coordinates into values
*
* ```js
* // 1D (ie an array of coordinates)
* const cells = Grid.As.cells(grid);
* for (const v of Grid.values(grid, cells)) {
*
* }
* ```
* ```js
* // 2D (ie an array of rows)
* const rows = Grid.As.rows(grid);
* for (const v of Grid.values(grid, rows)) {
* }
* ```
* @param grid
* @param iter
*/
function* values(grid, iter) {
	for (const d of iter) if (Array.isArray(d)) yield d.map((v) => grid.get(v, `undefined`));
	else yield grid.get(d, `undefined`);
}

//#endregion
//#region ../geometry/dist/src/grid/enumerators/cells.js
/**
* Enumerate all cell coordinates in an efficient manner.
* Runs left-to-right, top-to-bottom.
*
* If end of grid is reached, behaviour depends on `wrap`:
* * _true_ (default): iterator will wrap to ensure all are visited.
* * _false_: iterator stops at end of grid
*
* ```js
* import { Grids } from 'ixfx/geometry.js';
*
* // Enumerate each cell position, left-to-right, top-to-bottom
* for (const cell of Grids.By.cells(grid)) {
*  // cell will be { x, y }
* }
* ```
*
* See also:
* * {@link cellValues}: Iterate over cell values
* * {@link cellsAndValues}: Iterate over pairs of cell coordinates and cell values
* @param grid Grid to iterate over
* @param start Starting cell position (default: {x:0,y:0})
* @param wrap If true (default), iteration will wrap around through (0,0) when end of grid is reached.
*/
function* cells(grid, start, wrap$4 = true) {
	if (!start) start = {
		x: 0,
		y: 0
	};
	guardGrid(grid, `grid`);
	guardCell(start, `start`, grid);
	let { x, y } = start;
	let canMove = true;
	do {
		yield {
			x,
			y
		};
		x++;
		if (x === grid.cols) {
			y++;
			x = 0;
		}
		if (y === grid.rows) if (wrap$4) {
			y = 0;
			x = 0;
		} else canMove = false;
		if (x === start.x && y === start.y) canMove = false;
	} while (canMove);
}
/**
* Yield all the values of a grid, left-to-right, top-to-bottom.
*
* This is just a wrapper around Grids.values:
* ```js
* yield* values(grid, cells(grid, start, wrap));
* ```
*
* See also:
* * {@link cells}: Iterate over cell coordinates
* * {@link cellsAndValues}: Iterate over pairs of cell coordinates and cell values
* @param grid
* @param start
* @param wrap
*/
function* cellValues(grid, start, wrap$4 = true) {
	yield* values(grid, cells(grid, start, wrap$4));
}
/**
* Yield all cell coordinates and values of a grid, left-to-right, top-to-bottom
*
* See also:
* * {@link cells}: Iterate over cell coordinates
* * {@link cellValues}: Iterate over cell values
* @param grid
* @param start
* @param wrap
*/
function* cellsAndValues(grid, start, wrap$4 = true) {
	for (const cell of cells(grid, start, wrap$4)) yield {
		cell,
		value: grid.get(cell)
	};
}

//#endregion
//#region ../geometry/dist/src/grid/as.js
var as_exports = {};
__export(as_exports, {
	columns: () => columns,
	rows: () => rows
});
/**
* Enumerate rows of grid, returning all the cells in the row
* as an array
*
* ```js
* for (const row of Grid.As.rows(shape)) {
*  // row is an array of Cells.
*  // [ {x:0, y:0}, {x:1, y:0} ... ]
* }
* ```
*
* Use `Grid.values` to convert the returned iterator into values:
* ```js
* for (const v of Grid.values(Grid.rows(shape))) {
* }
* ```
* @param grid
* @param start
*/
const rows = function* (grid, start) {
	if (!start) start = {
		x: 0,
		y: 0
	};
	let row = start.y;
	let rowCells = [];
	for (const c of cells(grid, start)) if (c.y === row) rowCells.push(c);
	else {
		yield rowCells;
		rowCells = [c];
		row = c.y;
	}
	if (rowCells.length > 0) yield rowCells;
};
/**
* Enumerate columns of grid, returning all the cells in the
* same column as an array.
*
* ```js
* for (const col of Grid.As.columns(grid)) {
* }
* ```
*
* Use `Grid.values` to convert into values
* ```js
* for (const value of Grid.values(Grid.As.columns(grid))) {
* }
* ```
* @param grid
* @param start
*/
function* columns(grid, start) {
	if (!start) start = {
		x: 0,
		y: 0
	};
	for (let x = start.x; x < grid.cols; x++) {
		let colCells = [];
		for (let y = start.y; y < grid.rows; y++) colCells.push({
			x,
			y
		});
		yield colCells;
	}
}

//#endregion
//#region ../geometry/dist/src/grid/offset.js
/**
* Returns a coordinate offset from `start` by `vector` amount.
*
* Different behaviour can be specified for how to handle when coordinates exceed the bounds of the grid
*
* Note: x and y wrapping are calculated independently. A large wrapping of x, for example won't shift up/down a line.
*
* Use {@link Grids.applyBounds} if you need to calculate a wrapped coordinate without adding two together.
* @param grid Grid to traverse
* @param vector Offset in x/y
* @param start Start point
* @param bounds
* @returns Cell
*/
const offset = function(grid, start, vector, bounds = `undefined`) {
	return applyBounds(grid, {
		x: start.x + vector.x,
		y: start.y + vector.y
	}, bounds);
};

//#endregion
//#region ../geometry/dist/src/grid/directions.js
/**
* Returns a list of all cardinal directions: n, ne, nw, e, s, se, sw, w
*/
const allDirections = Object.freeze([
	`n`,
	`ne`,
	`nw`,
	`e`,
	`s`,
	`se`,
	`sw`,
	`w`
]);
/**
* Returns a list of + shaped directions: n, e, s, w
*/
const crossDirections = Object.freeze([
	`n`,
	`e`,
	`s`,
	`w`
]);
/**
* Returns cells that correspond to the cardinal directions at a specified distance
* i.e. it projects a line from `start` cell in all cardinal directions and returns the cells at `steps` distance.
* @param grid Grid
* @param steps Distance
* @param start Start poiint
* @param bounds Logic for if bounds of grid are exceeded
* @returns Cells corresponding to cardinals
*/
const offsetCardinals = (grid, start, steps, bounds = `stop`) => {
	guardGrid(grid, `grid`);
	guardCell(start, `start`);
	resultThrow(integerTest(steps, `aboveZero`, `steps`));
	const directions = allDirections;
	const vectors = directions.map((d) => getVectorFromCardinal(d, steps));
	const cells$1 = directions.map((d, index) => offset(grid, start, vectors[index], bounds));
	return zipKeyValue(directions, cells$1);
};
/**
* Returns an `{ x, y }` signed vector corresponding to the provided cardinal direction.
* ```js
* const n = getVectorFromCardinal(`n`); // {x: 0, y: -1}
* ```
*
* Optional `multiplier` can be applied to vector
* ```js
* const n = getVectorFromCardinal(`n`, 10); // {x: 0, y: -10}
* ```
*
* Blank direction returns `{ x: 0, y: 0 }`
* @param cardinal Direction
* @param multiplier Multipler
* @returns Signed vector in the form of `{ x, y }`
*/
const getVectorFromCardinal = (cardinal$1, multiplier = 1) => {
	let v;
	switch (cardinal$1) {
		case `n`: {
			v = {
				x: 0,
				y: -1 * multiplier
			};
			break;
		}
		case `ne`: {
			v = {
				x: 1 * multiplier,
				y: -1 * multiplier
			};
			break;
		}
		case `e`: {
			v = {
				x: 1 * multiplier,
				y: 0
			};
			break;
		}
		case `se`: {
			v = {
				x: 1 * multiplier,
				y: 1 * multiplier
			};
			break;
		}
		case `s`: {
			v = {
				x: 0,
				y: 1 * multiplier
			};
			break;
		}
		case `sw`: {
			v = {
				x: -1 * multiplier,
				y: 1 * multiplier
			};
			break;
		}
		case `w`: {
			v = {
				x: -1 * multiplier,
				y: 0
			};
			break;
		}
		case `nw`: {
			v = {
				x: -1 * multiplier,
				y: -1 * multiplier
			};
			break;
		}
		default: v = {
			x: 0,
			y: 0
		};
	}
	return Object.freeze(v);
};

//#endregion
//#region ../geometry/dist/src/grid/enumerators/index.js
var enumerators_exports = {};
__export(enumerators_exports, {
	cellValues: () => cellValues,
	cells: () => cells,
	cellsAndValues: () => cellsAndValues
});

//#endregion
//#region ../geometry/dist/src/grid/geometry.js
/**
* Returns the cells on the line of `start` and `end`, inclusive
*
* ```js
* // Get cells that connect 0,0 and 10,10
* const cells = Grids.getLine({x:0,y:0}, {x:10,y:10});
* ```
*
* This function does not handle wrapped coordinates.
* @param start Starting cell
* @param end End cell
* @returns
*/
const getLine = (start, end) => {
	guardCell(start);
	guardCell(end);
	let startX = start.x;
	let startY = start.y;
	const dx = Math.abs(end.x - startX);
	const dy = Math.abs(end.y - startY);
	const sx = startX < end.x ? 1 : -1;
	const sy = startY < end.y ? 1 : -1;
	let error = dx - dy;
	const cells$1 = [];
	while (true) {
		cells$1.push(Object.freeze({
			x: startX,
			y: startY
		}));
		if (startX === end.x && startY === end.y) break;
		const error2 = 2 * error;
		if (error2 > -dy) {
			error -= dy;
			startX += sx;
		}
		if (error2 < dx) {
			error += dx;
			startY += sy;
		}
	}
	return cells$1;
};
/**
* Returns a list of cells from `start` to `end`.
*
* Throws an error if start and end are not on same row or column.
*
* @param start Start cell
* @param end end clel
* @param endInclusive
* @return Array of cells
*/
const simpleLine = function(start, end, endInclusive = false) {
	const cells$1 = [];
	if (start.x === end.x) {
		const lastY = endInclusive ? end.y + 1 : end.y;
		for (let y = start.y; y < lastY; y++) cells$1.push({
			x: start.x,
			y
		});
	} else if (start.y === end.y) {
		const lastX = endInclusive ? end.x + 1 : end.x;
		for (let x = start.x; x < lastX; x++) cells$1.push({
			x,
			y: start.y
		});
	} else throw new Error(`Only does vertical and horizontal: ${start.x},${start.y} - ${end.x},${end.y}`);
	return cells$1;
};

//#endregion
//#region ../geometry/dist/src/grid/indexing.js
/**
* Returns the index for a given cell.
* This is useful if a grid is stored in an array.
*
* ```js
* const data = [
*  1, 2,
*  3, 4,
*  5, 6 ];
* const cols = 2; // Grid of 2 columns wide
* const index = indexFromCell(cols, {x: 1, y: 1});
* // Yields an index of 3
* console.log(data[index]); // Yields 4
* ```
*
* Bounds logic is applied to cell.x/y separately. Wrapping
* only ever happens in same col/row.
* @see cellFromIndex
* @param grid Grid
* @param cell Cell to get index for
* @param wrap Logic for if we hit bounds of grid
* @returns
*/
const indexFromCell = (grid, cell, wrap$4) => {
	guardGrid(grid, `grid`);
	if (cell.x < 0) switch (wrap$4) {
		case `stop`: {
			cell = {
				...cell,
				x: 0
			};
			break;
		}
		case `unbounded`: throw new Error(`unbounded not supported`);
		case `undefined`: return void 0;
		case `wrap`: {
			cell = offset(grid, {
				x: 0,
				y: cell.y
			}, {
				x: cell.x,
				y: 0
			}, `wrap`);
			break;
		}
	}
	if (cell.y < 0) switch (wrap$4) {
		case `stop`: {
			cell = {
				...cell,
				y: 0
			};
			break;
		}
		case `unbounded`: throw new Error(`unbounded not supported`);
		case `undefined`: return void 0;
		case `wrap`: {
			cell = {
				...cell,
				y: grid.rows + cell.y
			};
			break;
		}
	}
	if (cell.x >= grid.cols) switch (wrap$4) {
		case `stop`: {
			cell = {
				...cell,
				x: grid.cols - 1
			};
			break;
		}
		case `unbounded`: throw new Error(`unbounded not supported`);
		case `undefined`: return void 0;
		case `wrap`: {
			cell = {
				...cell,
				x: cell.x % grid.cols
			};
			break;
		}
	}
	if (cell.y >= grid.rows) switch (wrap$4) {
		case `stop`: {
			cell = {
				...cell,
				y: grid.rows - 1
			};
			break;
		}
		case `unbounded`: throw new Error(`unbounded not supported`);
		case `undefined`: return void 0;
		case `wrap`: {
			cell = {
				...cell,
				y: cell.y % grid.rows
			};
			break;
		}
	}
	const index = cell.y * grid.cols + cell.x;
	return index;
};
/**
* Returns x,y from an array index.
*
* ```js
*  const data = [
*   1, 2,
*   3, 4,
*   5, 6 ];
*
* // Cols of 2, index 2 (ie. data[2] == 3)
* const cell = cellFromIndex(2, 2);
* // Yields: {x: 0, y: 1}
* ```
* @see indexFromCell
* @param colsOrGrid
* @param index
* @returns
*/
const cellFromIndex = (colsOrGrid, index) => {
	let cols = 0;
	cols = typeof colsOrGrid === `number` ? colsOrGrid : colsOrGrid.cols;
	resultThrow(integerTest(cols, `aboveZero`, `colsOrGrid`));
	return {
		x: index % cols,
		y: Math.floor(index / cols)
	};
};

//#endregion
//#region ../geometry/dist/src/grid/is-equal.js
/**
* Returns _true_ if grids `a` and `b` are equal in value.
* Returns _false_ if either parameter is undefined.
*
* @param a
* @param b
* @return
*/
const isEqual$2 = (a, b) => {
	if (b === void 0) return false;
	if (a === void 0) return false;
	if (`rows` in a && `cols` in a) if (`rows` in b && `cols` in b) {
		if (a.rows !== b.rows || a.cols !== b.cols) return false;
	} else return false;
	if (`size` in a) if (`size` in b) {
		if (a.size !== b.size) return false;
	} else return false;
	return true;
};
/**
* Returns _true_ if two cells equal.
* Returns _false_ if either cell are undefined
*
* @param a
* @param b
* @returns
*/
const cellEquals = (a, b) => {
	if (b === void 0) return false;
	if (a === void 0) return false;
	return a.x === b.x && a.y === b.y;
};

//#endregion
//#region ../geometry/dist/src/grid/neighbour.js
const randomNeighbour = (nbos) => randomElement(nbos);
/**
* Returns _true_ if `n` is a Neighbour type, eliminating NeighbourMaybe possibility
*
* @param n
* @return
*/
const isNeighbour = (n) => {
	if (n === void 0) return false;
	if (n[1] === void 0) return false;
	return true;
};
/**
* Gets a list of neighbours for `cell` (using {@link neighbours}), filtering
* results to only those that are valid neighbours (using {@link isNeighbour})
*
* ```js
* // Get all eight surrounding cells
* const n = Grids.neighbourList(grid, cell, Grids.allDirections);
*
* // Get north, east, south, west cells
* const n = Grids.neighbourList(grid, cell, Grids.crossDirections);
* ```
* @param grid Grid
* @param cell Cell
* @param directions Directions
* @param bounds Bounds
* @returns
*/
const neighbourList = (grid, cell, directions, bounds) => {
	const cellNeighbours = neighbours(grid, cell, bounds, directions);
	const entries = Object.entries(cellNeighbours);
	return entries.filter((n) => isNeighbour(n));
};
/**
* Returns neighbours for a cell. If no `directions` are provided, it defaults to {@link allDirections}.
*
* ```js
* const grid = { rows: 5, cols: 5 };
* const cell = { x:2, y:2 };
*
* // Get n,ne,nw,e,s,se,sw and w neighbours
* const n = Grids.neighbours(grid, cell, `wrap`);
*
* Yields:
* {
*  n: {x: 2, y: 1}
*  s: {x: 2, y: 3}
*  ....
* }
* ```
*
* Returns neighbours without diagonals (ie: n, e, s, w):
* ```js
* const n = Grids.neighbours(grid, cell, `stop`, Grids.crossDirections);
* ```
* @returns Returns a map of cells, keyed by cardinal direction
* @param grid Grid
* @param cell Cell
* @param bounds How to handle edges of grid
* @param directions Directions to return
*/
const neighbours = (grid, cell, bounds = `undefined`, directions) => {
	const directories = directions ?? allDirections;
	const points = directories.map((c) => offset(grid, cell, getVectorFromCardinal(c), bounds));
	return zipKeyValue(directories, points);
};

//#endregion
//#region ../geometry/dist/src/grid/to-array.js
/**
* Returns a two-dimensional array according to `grid`
* size.
*
* ```js
* const a = Grids.toArray({ rows: 3, cols: 2 });
* Yields:
* [ [_,_] ]
* [ [_,_] ]
* [ [_,_] ]
* ```
*
* `initialValue` can be provided to set the value
* for all cells.
* @param grid Grid
* @param initialValue Initial value
* @returns
*/
const toArray2d = (grid, initialValue) => {
	const returnValue = [];
	for (let row = 0; row < grid.rows; row++) {
		returnValue[row] = Array.from({ length: grid.cols });
		if (initialValue) for (let col = 0; col < grid.cols; col++) returnValue[row][col] = initialValue;
	}
	return returnValue;
};

//#endregion
//#region ../geometry/dist/src/grid/to-string.js
/**
* Returns a key string for a cell instance
* A key string allows comparison of instances by value rather than reference
*
* ```js
* cellKeyString({x:10,y:20});
* // Yields: "Cell{10,20}";
* ```
* @param v
* @returns
*/
const cellKeyString = (v) => `Cell{${v.x},${v.y}}`;

//#endregion
//#region ../geometry/dist/src/grid/visual.js
/**
* Generator that returns rectangles for each cell in a grid
*
* @example Draw rectangles
* ```js
* import { Drawing } from 'visuals.js'
* const rects = [...Grids.asRectangles(grid)];
* Drawing.rect(ctx, rects, { strokeStyle: `silver`});
* ```
* @param grid
*/
function* asRectangles(grid) {
	for (const c of cells(grid)) yield rectangleForCell(grid, c);
}
/**
* Returns the cell at a specified visual coordinate
* or _undefined_ if the position is outside of the grid.
*
* `position` must be in same coordinate/scale as the grid.
*
* @param position Position, eg in pixels
* @param grid Grid
* @return Cell at position or undefined if outside of the grid
*/
const cellAtPoint = (grid, position) => {
	const size = grid.size;
	resultThrow(numberTest(size, `positive`, `grid.size`));
	if (position.x < 0 || position.y < 0) return;
	const x = Math.floor(position.x / size);
	const y = Math.floor(position.y / size);
	if (x >= grid.cols) return;
	if (y >= grid.rows) return;
	return {
		x,
		y
	};
};
/**
* Returns a visual rectangle of the cell, positioned from the top-left corner
*
* ```js
* const cell = { x: 1, y: 0 };
*
* // 5x5 grid, each cell 5px in size
* const grid = { rows: 5, cols: 5, size: 5 }
*
* const r = rectangleForCell(grid, cell,);
*
* // Yields: { x: 5, y: 0, width: 5, height: 5 }
* ```
* @param cell
* @param grid
* @return
*/
const rectangleForCell = (grid, cell) => {
	guardCell(cell);
	const size = grid.size;
	const x = cell.x * size;
	const y = cell.y * size;
	const r = fromTopLeft({
		x,
		y
	}, size, size);
	return r;
};
/**
* Returns the visual midpoint of a cell (eg. pixel coordinate)
*
* @param cell
* @param grid
* @return
*/
const cellMiddle = (grid, cell) => {
	guardCell(cell);
	const size = grid.size;
	const x = cell.x * size;
	const y = cell.y * size;
	return Object.freeze({
		x: x + size / 2,
		y: y + size / 2
	});
};

//#endregion
//#region ../geometry/dist/src/grid/visitors/breadth.js
const breadthLogic = () => {
	return { select: (nbos) => nbos[0] };
};

//#endregion
//#region ../geometry/dist/src/grid/visitors/cell-neighbours.js
const neighboursLogic = () => {
	return {
		select: (neighbours$1) => {
			return neighbours$1.at(0);
		},
		getNeighbours: (grid, cell) => {
			return neighbourList(grid, cell, allDirections, `undefined`);
		}
	};
};

//#endregion
//#region ../geometry/dist/src/grid/visitors/columns.js
/**
* Visits cells running down columns, left-to-right.
* @param opts Options
* @returns Visitor generator
*/
const columnLogic = (opts = {}) => {
	const reversed = opts.reversed ?? false;
	return {
		select: (nbos) => nbos.find((n) => n[0] === (reversed ? `n` : `s`)),
		getNeighbours: (grid, cell) => {
			if (reversed) if (cell.y > 0) cell = {
				x: cell.x,
				y: cell.y - 1
			};
			else if (cell.x === 0) cell = {
				x: grid.cols - 1,
				y: grid.rows - 1
			};
			else cell = {
				x: cell.x - 1,
				y: grid.rows - 1
			};
			else if (cell.y < grid.rows - 1) cell = {
				x: cell.x,
				y: cell.y + 1
			};
			else if (cell.x < grid.cols - 1) cell = {
				x: cell.x + 1,
				y: 0
			};
			else cell = {
				x: 0,
				y: 0
			};
			return [[reversed ? `n` : `s`, cell]];
		}
	};
};

//#endregion
//#region ../geometry/dist/src/grid/visitors/depth.js
const depthLogic = () => {
	return { select: (nbos) => nbos.at(-1) };
};

//#endregion
//#region ../geometry/dist/src/grid/visitors/random.js
const randomLogic = () => {
	return {
		getNeighbours: (grid, cell) => {
			const t = [];
			for (const c of cells(grid, cell)) t.push([`n`, c]);
			return t;
		},
		select: randomNeighbour
	};
};

//#endregion
//#region ../geometry/dist/src/grid/visitors/random-contiguous.js
const randomContiguousLogic = () => {
	return { select: randomNeighbour };
};

//#endregion
//#region ../geometry/dist/src/grid/visitors/rows.js
/**
* Visit by following rows. Normal order is left-to-right, top-to-bottom.
* @param opts Options
* @returns
*/
const rowLogic = (opts = {}) => {
	const reversed = opts.reversed ?? false;
	return {
		select: (nbos) => nbos.find((n) => n[0] === (reversed ? `w` : `e`)),
		getNeighbours: (grid, cell) => {
			if (reversed) if (cell.x > 0) cell = {
				x: cell.x - 1,
				y: cell.y
			};
			else if (cell.y > 0) cell = {
				x: grid.cols - 1,
				y: cell.y - 1
			};
			else cell = {
				x: grid.cols - 1,
				y: grid.rows - 1
			};
			else if (cell.x < grid.rows - 1) cell = {
				x: cell.x + 1,
				y: cell.y
			};
			else if (cell.y < grid.rows - 1) cell = {
				x: 0,
				y: cell.y + 1
			};
			else cell = {
				x: 0,
				y: 0
			};
			return [[reversed ? `w` : `e`, cell]];
		}
	};
};

//#endregion
//#region ../geometry/dist/src/grid/visitors/visitor.js
/**
* Visits every cell in grid using supplied selection function
* In-built functions to use: visitorDepth, visitorBreadth, visitorRandom,
* visitorColumn, visitorRow.
*
* Usage example:
* ```js
*  let visitor = Grids.visitor(Grids.visitorRandom, grid, startCell);
*  for (let cell of visitor) {
*   // do something with cell
*  }
* ```
*
* If you want to keep tabs on the visitor, pass in a @ixfx/collections.Sets.ISetMutable instance. This gets
* updated as cells are visited to make sure we don't visit the same one twice. If a set is not passed
* in, one will be created internally.
* ```js
* let visited = new SetStringMutable<Grids.Cell>(c => Grids.cellKeyString(c));
* let visitor = Grids.visitor(Grids.visitorRandom, grid, startCell, visited);
* ```
*
* To visit with some delay, try this pattern
* ```js
*  const delayMs = 100;
*  const run = () => {
*   let cell = visitor.next().value;
*   if (cell === undefined) return;
*   // Do something with cell
*   setTimeout(run, delayMs);
*  }
*  setTimeout(run, delayMs);
* ```
* @param logic Logic for selecting next cell
* @param grid Grid to visitl
* @param opts Options
* @returns Cells
*/
function* visitByNeighbours(logic, grid, opts = {}) {
	guardGrid(grid, `grid`);
	const start = opts.start ?? {
		x: 0,
		y: 0
	};
	guardCell(start, `opts.start`, grid);
	const v = opts.visited ?? mutable(cellKeyString);
	const possibleNeighbours = logic.getNeighbours ?? ((g, c) => neighbourList(g, c, crossDirections, `undefined`));
	let cellQueue = [start];
	let moveQueue = [];
	let current = void 0;
	while (cellQueue.length > 0) {
		if (current === void 0) {
			const nv = cellQueue.pop();
			if (nv === void 0) break;
			current = nv;
		}
		if (!v.has(current)) {
			v.add(current);
			yield current;
			const nextSteps = possibleNeighbours(grid, current).filter((step) => {
				if (step[1] === void 0) return false;
				return !v.has(step[1]);
			});
			if (nextSteps.length === 0) {
				if (current !== void 0) cellQueue = cellQueue.filter((cq) => cellEquals(cq, current));
			} else for (const n of nextSteps) {
				if (n === void 0) continue;
				if (n[1] === void 0) continue;
				moveQueue.push(n);
			}
		}
		moveQueue = moveQueue.filter((step) => !v.has(step[1]));
		if (moveQueue.length === 0) current = void 0;
		else {
			const potential = logic.select(moveQueue);
			if (potential !== void 0) {
				cellQueue.push(potential[1]);
				current = potential[1];
			}
		}
	}
}

//#endregion
//#region ../geometry/dist/src/grid/visitors/step.js
/**
* Runs the provided `visitor` for `steps`, returning the cell we end at
* ```js
* // Create visitor & stepper
* const visitor = Grids.Visit.create(`row`);
* const stepper = Grids.Visit.stepper(grid, visitor);
*
* // Step by 10
* stepper(10); // GridCell {x,y}
*
* // Step by another 2
* stepper(2);
* ```
* @param grid Grid to traverse
* @param start Start point
* @param createVisitor Visitor function
* @returns
*/
const stepper = (grid, createVisitor, start = {
	x: 0,
	y: 0
}, resolution = 1) => {
	guardGrid(grid, `grid`);
	guardCell(start, `start`);
	resultThrow(integerTest(resolution, ``, `resolution`));
	const steps = [];
	let count = 0;
	let position = 0;
	for (const c of createVisitor(grid, {
		start,
		boundsWrap: `undefined`
	})) {
		count++;
		if (count % resolution !== 0) continue;
		steps.push(c);
	}
	return (step, fromStart = false) => {
		resultThrow(integerTest(step, ``, `step`));
		if (fromStart) position = step;
		else position += step;
		return steps.at(position % steps.length);
	};
};

//#endregion
//#region ../geometry/dist/src/grid/visitors/index.js
var visitors_exports = {};
__export(visitors_exports, {
	breadthLogic: () => breadthLogic,
	columnLogic: () => columnLogic,
	create: () => create,
	depthLogic: () => depthLogic,
	neighboursLogic: () => neighboursLogic,
	randomContiguousLogic: () => randomContiguousLogic,
	randomLogic: () => randomLogic,
	rowLogic: () => rowLogic,
	stepper: () => stepper,
	visitByNeighbours: () => visitByNeighbours,
	withLogic: () => withLogic
});
/**
* Logic types:
* * 'row': left-to-right, top-to-bottom
* * 'column': top-to-bottom, left-to-right
* * 'neighbours': neighbours surrounding cell (eight)
* * 'breadth`: breadth-first
* * 'depth': depth-first
* * 'random': any random cell in grid
* * 'random-contiguous': any random cell neighbouring an already visited cell
* @param type
* @param opts
* @returns
*/
const create = (type, opts = {}) => {
	switch (type) {
		case `random-contiguous`: return withLogic(randomContiguousLogic(), opts);
		case `random`: return withLogic(randomLogic(), opts);
		case `depth`: return withLogic(depthLogic(), opts);
		case `breadth`: return withLogic(breadthLogic(), opts);
		case `neighbours`: return withLogic(neighboursLogic(), opts);
		case `row`: return withLogic(rowLogic(opts), opts);
		case `column`: return withLogic(columnLogic(opts), opts);
		default: throw new TypeError(`Param 'type' unknown. Value: ${type}`);
	}
};
const withLogic = (logic, options = {}) => {
	return (grid, optionsOverride = {}) => {
		return visitByNeighbours(logic, grid, {
			...options,
			...optionsOverride
		});
	};
};

//#endregion
//#region ../geometry/dist/src/grid/index.js
var grid_exports = {};
__export(grid_exports, {
	Array1d: () => array_1d_exports,
	Array2d: () => array_2d_exports,
	As: () => as_exports,
	By: () => enumerators_exports,
	Visit: () => visitors_exports,
	allDirections: () => allDirections,
	applyBounds: () => applyBounds,
	asRectangles: () => asRectangles,
	cellAtPoint: () => cellAtPoint,
	cellEquals: () => cellEquals,
	cellFromIndex: () => cellFromIndex,
	cellKeyString: () => cellKeyString,
	cellMiddle: () => cellMiddle,
	crossDirections: () => crossDirections,
	getLine: () => getLine,
	getVectorFromCardinal: () => getVectorFromCardinal,
	guardCell: () => guardCell,
	guardGrid: () => guardGrid,
	indexFromCell: () => indexFromCell,
	inside: () => inside,
	isCell: () => isCell,
	isEqual: () => isEqual$2,
	neighbourList: () => neighbourList,
	neighbours: () => neighbours,
	offset: () => offset,
	offsetCardinals: () => offsetCardinals,
	randomNeighbour: () => randomNeighbour,
	rectangleForCell: () => rectangleForCell,
	simpleLine: () => simpleLine,
	toArray2d: () => toArray2d,
	values: () => values
});

//#endregion
//#region ../geometry/dist/src/path/start-end.js
/**
* Return the start point of a path
*
* @param path
* @return Point
*/
const getStart = function(path) {
	if (isQuadraticBezier(path)) return path.a;
	else if (isLine(path)) return path.a;
	else throw new Error(`Unknown path type ${JSON.stringify(path)}`);
};
/**
* Return the end point of a path
*
* @param path
* @return Point
*/
const getEnd = function(path) {
	if (isQuadraticBezier(path)) return path.b;
	else if (isLine(path)) return path.b;
	else throw new Error(`Unknown path type ${JSON.stringify(path)}`);
};

//#endregion
//#region ../geometry/dist/src/path/compound-path.js
var compound_path_exports = {};
__export(compound_path_exports, {
	bbox: () => bbox$2,
	computeDimensions: () => computeDimensions,
	distanceToPoint: () => distanceToPoint,
	fromPaths: () => fromPaths,
	guardContinuous: () => guardContinuous,
	interpolate: () => interpolate,
	relativePosition: () => relativePosition,
	setSegment: () => setSegment,
	toString: () => toString,
	toSvgString: () => toSvgString
});
/**
* Returns a new compoundpath, replacing a path at a given index
*
* @param compoundPath Existing compoundpath
* @param index Index to replace at
* @param path Path to substitute in
* @returns New compoundpath
*/
const setSegment = (compoundPath, index, path) => {
	const existing = [...compoundPath.segments];
	existing[index] = path;
	return fromPaths(...existing);
};
/**
* Computes x,y point at a relative position along compoundpath
*
* @param paths Combined paths (assumes contiguous)
* @param t Position (given as a percentage from 0 to 1)
* @param useWidth If true, widths are used for calulcating. If false, lengths are used
* @param dimensions Precalculated dimensions of paths, will be computed if omitted
* @returns
*/
const interpolate = (paths, t, useWidth, dimensions) => {
	if (dimensions === void 0) dimensions = computeDimensions(paths);
	const expected = t * (useWidth ? dimensions.totalWidth : dimensions.totalLength);
	let soFar = 0;
	const l = useWidth ? dimensions.widths : dimensions.lengths;
	for (const [index, element] of l.entries()) if (soFar + element >= expected) {
		const relative = expected - soFar;
		let amt = relative / element;
		if (amt > 1) amt = 1;
		return paths[index].interpolate(amt);
	} else soFar += element;
	return {
		x: 0,
		y: 0
	};
};
/**
* Returns the shortest distance of `point` to any point on `paths`.
* @param paths
* @param point
* @returns
*/
const distanceToPoint = (paths, point$1) => {
	if (paths.length === 0) return 0;
	let distances = paths.map((p, index) => ({
		path: p,
		index,
		distance: p.distanceToPoint(point$1)
	}));
	distances = sortByNumericProperty(distances, `distance`);
	if (distances.length === 0) throw new Error(`Could not look up distances`);
	return distances[0].distance;
};
/**
* Relative position
* @param paths Paths
* @param point Point
* @param intersectionThreshold Threshold
* @param dimensions Pre-computed dimensions
* @returns
*/
const relativePosition = (paths, point$1, intersectionThreshold, dimensions) => {
	if (dimensions === void 0) dimensions = computeDimensions(paths);
	let distances = paths.map((p, index) => ({
		path: p,
		index,
		distance: p.distanceToPoint(point$1)
	}));
	distances = sortByNumericProperty(distances, `distance`);
	if (distances.length < 0) throw new Error(`Point does not intersect with path`);
	const d = distances[0];
	if (d.distance > intersectionThreshold) throw new Error(`Point does not intersect with path. Minimum distance: ${d.distance}, threshold: ${intersectionThreshold}`);
	const relativePositionOnPath = d.path.relativePosition(point$1, intersectionThreshold);
	let accumulated = 0;
	for (let index = 0; index < d.index; index++) accumulated += dimensions.lengths[index];
	accumulated += dimensions.lengths[d.index] * relativePositionOnPath;
	const accumulatedRel = accumulated / dimensions.totalLength;
	console.log(`acc: ${accumulated} rel: ${accumulatedRel} on path: ${relativePositionOnPath} path: ${d.index}`);
	return accumulatedRel;
};
/**
* Computes the widths and lengths of all paths, adding them up as well
*
* @param paths
* @returns
*/
const computeDimensions = (paths) => {
	const widths = paths.map((l) => l.bbox().width);
	const lengths$2 = paths.map((l) => l.length());
	let totalLength = 0;
	let totalWidth = 0;
	for (const length$4 of lengths$2) totalLength += length$4;
	for (const width of widths) totalWidth += width;
	return {
		totalLength,
		totalWidth,
		widths,
		lengths: lengths$2
	};
};
/**
* Computes the bounding box that encloses entire compoundpath
*
* @param paths
* @returns
*/
const bbox$2 = (paths) => {
	const boxes = paths.map((p) => p.bbox());
	const corners$2 = boxes.flatMap((b) => corners$1(b));
	return bbox$1(...corners$2);
};
/**
* Produce a human-friendly representation of paths
*
* @param paths
* @returns
*/
const toString = (paths) => paths.map((p) => p.toString()).join(`, `);
/**
* Throws an error if paths are not connected together, in order
*
* @param paths
*/
const guardContinuous = (paths) => {
	let lastPos = getEnd(paths[0]);
	for (let index = 1; index < paths.length; index++) {
		const start = getStart(paths[index]);
		if (!isEqual(start, lastPos)) throw new Error(`Path index ${index} does not start at prior path end. Start: ${start.x},${start.y} expected: ${lastPos.x},${lastPos.y}`);
		lastPos = getEnd(paths[index]);
	}
};
const toSvgString = (paths) => paths.flatMap((p) => p.toSvgString());
/**
* Create a compoundpath from an array of paths.
* All this does is verify they are connected, and precomputes dimensions
*
* @param paths
* @returns
*/
const fromPaths = (...paths) => {
	guardContinuous(paths);
	const dims = computeDimensions(paths);
	return Object.freeze({
		segments: paths,
		length: () => dims.totalLength,
		nearest: (_) => {
			throw new Error(`not implemented`);
		},
		interpolate: (t, useWidth = false) => interpolate(paths, t, useWidth, dims),
		relativePosition: (point$1, intersectionThreshold) => relativePosition(paths, point$1, intersectionThreshold, dims),
		distanceToPoint: (point$1) => distanceToPoint(paths, point$1),
		bbox: () => bbox$2(paths),
		toString: () => toString(paths),
		toSvgString: () => toSvgString(paths),
		kind: `compound`
	});
};

//#endregion
//#region ../geometry/dist/src/path/index.js
var path_exports = {};
__export(path_exports, {
	bbox: () => bbox$2,
	computeDimensions: () => computeDimensions,
	distanceToPoint: () => distanceToPoint,
	fromPaths: () => fromPaths,
	getEnd: () => getEnd,
	getStart: () => getStart,
	guardContinuous: () => guardContinuous,
	interpolate: () => interpolate,
	relativePosition: () => relativePosition,
	setSegment: () => setSegment,
	toString: () => toString,
	toSvgString: () => toSvgString
});

//#endregion
//#region ../geometry/dist/src/triangle/create.js
/**
* A triangle consisting of three empty points (Points.Empty)
*/
const Empty$1 = Object.freeze({
	a: {
		x: 0,
		y: 0
	},
	b: {
		x: 0,
		y: 0
	},
	c: {
		x: 0,
		y: 0
	}
});
/**
* A triangle consisting of three placeholder points (Points.Placeholder)
*/
const Placeholder$1 = Object.freeze({
	a: {
		x: NaN,
		y: NaN
	},
	b: {
		x: NaN,
		y: NaN
	},
	c: {
		x: NaN,
		y: NaN
	}
});
/**
* Returns a triangle anchored at `origin` with a given `length` and `angleRadian`.
* The origin will be point `b` of the triangle, and the angle will be the angle for b.
* @param origin Origin
* @param length Length
* @param angleRadian Angle
* @returns
*/
const equilateralFromVertex = (origin, length$4 = 10, angleRadian$2 = Math.PI / 2) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const a = project(origin, length$4, Math.PI - -angleRadian$2 / 2);
	const c = project(origin, length$4, Math.PI - angleRadian$2 / 2);
	return {
		a,
		b: origin,
		c
	};
};

//#endregion
//#region ../geometry/dist/src/shape/arrow.js
/**
* Returns the points forming an arrow.
*
* @example Create an arrow anchored by its tip at 100,100
* ```js
* const opts = {
*  tailLength: 10,
*  arrowSize: 20,
*  tailThickness: 5,
*  angleRadian: degreeToRadian(45)
* }
* const arrow = Shapes.arrow({x:100, y:100}, `tip`, opts); // Yields an array of points
*
* // Eg: draw points
* Drawing.connectedPoints(ctx, arrow, {strokeStyle: `red`, loop: true});
* ```
*
* @param origin Origin of arrow
* @param from Does origin describe the tip, tail or middle?
* @param opts Options for arrow
* @returns
*/
const arrow = (origin, from$1, opts = {}) => {
	const tailLength = opts.tailLength ?? 10;
	const tailThickness = opts.tailThickness ?? Math.max(tailLength / 5, 5);
	const angleRadian$2 = opts.angleRadian ?? 0;
	const arrowSize = opts.arrowSize ?? Math.max(tailLength / 5, 15);
	const triAngle = Math.PI / 2;
	let tri;
	let tailPoints;
	if (from$1 === `tip`) {
		tri = equilateralFromVertex(origin, arrowSize, triAngle);
		tailPoints = corners$1(fromTopLeft({
			x: tri.a.x - tailLength,
			y: origin.y - tailThickness / 2
		}, tailLength, tailThickness));
	} else if (from$1 === `middle`) {
		const midX = tailLength + arrowSize / 2;
		const midY = tailThickness / 2;
		tri = equilateralFromVertex({
			x: origin.x + arrowSize * 1.2,
			y: origin.y
		}, arrowSize, triAngle);
		tailPoints = corners$1(fromTopLeft({
			x: origin.x - midX,
			y: origin.y - midY
		}, tailLength + arrowSize, tailThickness));
	} else {
		tailPoints = corners$1(fromTopLeft({
			x: origin.x,
			y: origin.y - tailThickness / 2
		}, tailLength, tailThickness));
		tri = equilateralFromVertex({
			x: origin.x + tailLength + arrowSize * .7,
			y: origin.y
		}, arrowSize, triAngle);
	}
	const arrow$1 = rotate([
		tailPoints[0],
		tailPoints[1],
		tri.a,
		tri.b,
		tri.c,
		tailPoints[2],
		tailPoints[3]
	], angleRadian$2, origin);
	return arrow$1;
};

//#endregion
//#region ../geometry/dist/src/triangle/guard.js
/**
* Throws an exception if the triangle is invalid
* @param t
* @param name
*/
const guard = (t, name = `t`) => {
	if (t === void 0) throw new Error(`{$name} undefined`);
	guard$1(t.a, name + `.a`);
	guard$1(t.b, name + `.b`);
	guard$1(t.c, name + `.c`);
};
/**
* Returns true if the parameter appears to be a valid triangle
* @param p
* @returns
*/
const isTriangle = (p) => {
	if (p === void 0) return false;
	const tri = p;
	if (!isPoint(tri.a)) return false;
	if (!isPoint(tri.b)) return false;
	if (!isPoint(tri.c)) return false;
	return true;
};
/**
* Returns true if triangle is empty
* @param t
* @returns
*/
const isEmpty$1 = (t) => isEmpty(t.a) && isEmpty(t.b) && isEmpty(t.c);
/**
* Returns true if triangle is a placeholder
* @param t
* @returns
*/
const isPlaceholder$1 = (t) => isPlaceholder(t.a) && isPlaceholder(t.b) && isPlaceholder(t.c);
/**
* Returns true if the two parameters have equal values
* @param a
* @param b
* @returns
*/
const isEqual$1 = (a, b) => isEqual(a.a, b.a) && isEqual(a.b, b.b) && isEqual(a.c, b.c);

//#endregion
//#region ../geometry/dist/src/triangle/centroid.js
/**
* Returns simple centroid of triangle
* @param t
* @returns
*/
const centroid = (t) => {
	guard(t);
	const total = reduce([
		t.a,
		t.b,
		t.c
	], (p, accumulator) => ({
		x: p.x + accumulator.x,
		y: p.y + accumulator.y
	}));
	const div = {
		x: total.x / 3,
		y: total.y / 3
	};
	return div;
};

//#endregion
//#region ../geometry/dist/src/shape/etc.js
/**
* Returns a random point within a shape.
* `shape` can be {@link Circles.CirclePositioned} or {@link Rects.RectPositioned}
* @param shape
* @param opts
* @returns
*/
const randomPoint = (shape, opts = {}) => {
	if (isCirclePositioned(shape)) return randomPoint$1(shape, opts);
	else if (isRectPositioned(shape)) return randomPoint$2(shape, opts);
	throw new Error(`Unknown shape. Only CirclePositioned and RectPositioned are supported.`);
};
/**
* Returns the center of a shape
* Shape can be: rectangle, triangle, circle
* @param shape
* @returns
*/
const center$2 = (shape) => {
	if (shape === void 0) return Object.freeze({
		x: .5,
		y: .5
	});
	else if (isRect(shape)) return center$1(shape);
	else if (isTriangle(shape)) return centroid(shape);
	else if (isCircle(shape)) return center(shape);
	else throw new Error(`Unknown shape: ${JSON.stringify(shape)}`);
};

//#endregion
//#region ../geometry/dist/src/shape/is-intersecting.js
/**
* Returns the intersection result between a and b.
* `a` can be a {@link Circles.CirclePositioned} or {@link Rects.RectPositioned}
* `b` can be as above or a {@link Point}.
* @param a
* @param b
*/
const isIntersecting$2 = (a, b) => {
	if (isCirclePositioned(a)) return isIntersecting(a, b);
	else if (isRectPositioned(a)) return isIntersecting$1(a, b);
	throw new Error(`a or b are unknown shapes. a: ${JSON.stringify(a)} b: ${JSON.stringify(b)}`);
};

//#endregion
//#region ../geometry/dist/src/shape/starburst.js
/**
* Generates a starburst shape, returning an array of points. By default, initial point is top and horizontally-centred.
*
* ```
* // Generate a starburst with four spikes
* const pts = starburst(4, 100, 200);
* ```
*
* `points` of two produces a lozenge shape.
* `points` of three produces a triangle shape.
* `points` of five is the familiar 'star' shape.
*
* Note that the path will need to be closed back to the first point to enclose the shape.
*
* @example Create starburst and draw it. Note use of 'loop' flag to close the path
* ```
* const points = starburst(4, 100, 200);
* Drawing.connectedPoints(ctx, pts, {loop: true, fillStyle: `orange`, strokeStyle: `red`});
* ```
*
* Options:
* * initialAngleRadian: angle offset to begin from. This overrides the `-Math.PI/2` default.
*
* @param points Number of points in the starburst. Defaults to five, which produces a typical star
* @param innerRadius Inner radius. A proportionally smaller inner radius makes for sharper spikes. If unspecified, 50% of the outer radius is used.
* @param outerRadius Outer radius. Maximum radius of a spike to origin
* @param opts Options
* @param origin Origin, or `{ x:0, y:0 }` by default.
*/
const starburst = (outerRadius, points = 5, innerRadius, origin = Empty, opts) => {
	resultThrow(integerTest(points, `positive`, `points`));
	const angle = Math.PI * 2 / points;
	const angleHalf = angle / 2;
	const initialAngle = opts?.initialAngleRadian ?? -Math.PI / 2;
	if (innerRadius === void 0) innerRadius = outerRadius / 2;
	let a = initialAngle;
	const pts = [];
	for (let index = 0; index < points; index++) {
		const peak = toCartesian(outerRadius, a, origin);
		const left = toCartesian(innerRadius, a - angleHalf, origin);
		const right = toCartesian(innerRadius, a + angleHalf, origin);
		pts.push(left, peak);
		if (index + 1 < points) pts.push(right);
		a += angle;
	}
	return pts;
};

//#endregion
//#region ../geometry/dist/src/shape/index.js
var shape_exports = {};
__export(shape_exports, {
	arrow: () => arrow,
	center: () => center$2,
	isIntersecting: () => isIntersecting$2,
	randomPoint: () => randomPoint,
	starburst: () => starburst
});

//#endregion
//#region ../geometry/dist/src/waypoint.js
var waypoint_exports = {};
__export(waypoint_exports, {
	fromPoints: () => fromPoints$1,
	init: () => init
});
/**
* Create from set of points, connected in order starting at array position 0.
* @param waypoints
* @param opts
* @returns
*/
const fromPoints$1 = (waypoints, opts = {}) => {
	const lines = joinPointsToLines(...waypoints);
	return init(lines.map((l) => toPath(l)), opts);
};
/**
* Initialise
*
* Options:
* * maxDistanceFromLine: Distances greater than this are not matched. Default 0.1
* @param paths
* @param opts
* @returns
*/
const init = (paths, opts = {}) => {
	const maxDistanceFromLine = opts.maxDistanceFromLine ?? .1;
	const checkUnordered = (pt) => {
		const results = paths.map((p, index) => {
			const nearest$2 = p.nearest(pt);
			const distance$2 = distance(pt, nearest$2);
			const positionRelative = p.relativePosition(nearest$2, maxDistanceFromLine);
			return {
				positionRelative,
				path: p,
				index,
				nearest: nearest$2,
				distance: distance$2,
				rank: Number.MAX_SAFE_INTEGER
			};
		});
		const filtered = results.filter((v) => v.distance <= maxDistanceFromLine);
		const sorted = sortByNumericProperty(filtered, `distance`);
		for (let rank = 0; rank < sorted.length; rank++) sorted[rank].rank = rank;
		return sorted;
	};
	return checkUnordered;
};

//#endregion
//#region ../geometry/dist/src/circle-packing.js
var circle_packing_exports = {};
__export(circle_packing_exports, { random: () => random });
/**
* Naive randomised circle packing.
* [Algorithm by Taylor Hobbs](https://tylerxhobbs.com/essays/2016/a-randomized-approach-to-cicle-packing)
*/
const random = (circles, container, opts = {}) => {
	if (!Array.isArray(circles)) throw new Error(`Parameter 'circles' is not an array`);
	const attempts = opts.attempts ?? 2e3;
	const sorted = sortByNumericProperty(circles, `radius`);
	const positionedCircles = [];
	const willHit = (b, radius) => positionedCircles.some((v) => isIntersecting(v, b, radius));
	while (sorted.length > 0) {
		const circle = sorted.pop();
		if (!circle) break;
		const randomPointOpts = {
			...opts,
			margin: {
				x: circle.radius,
				y: circle.radius
			}
		};
		for (let index = 0; index < attempts; index++) {
			const position = randomPoint(container, randomPointOpts);
			if (!willHit(position, circle.radius)) {
				positionedCircles.push(Object.freeze({
					...circle,
					...position
				}));
				break;
			}
		}
	}
	return positionedCircles;
};

//#endregion
//#region ../geometry/dist/src/layout.js
var layout_exports = {};
__export(layout_exports, { CirclePacking: () => circle_packing_exports });

//#endregion
//#region ../geometry/dist/src/ellipse.js
var ellipse_exports = {};
__export(ellipse_exports, { fromDegrees: () => fromDegrees });
const fromDegrees = (radiusX, radiusY, rotationDeg = 0, startAngleDeg = 0, endAngleDeg = 360) => ({
	radiusX,
	radiusY,
	rotation: degreeToRadian(rotationDeg),
	startAngle: degreeToRadian(startAngleDeg),
	endAngle: degreeToRadian(endAngleDeg)
});

//#endregion
//#region ../geometry/dist/src/curve-simplification.js
var curve_simplification_exports = {};
__export(curve_simplification_exports, {
	rdpPerpendicularDistance: () => rdpPerpendicularDistance,
	rdpShortestDistance: () => rdpShortestDistance
});
/**
* Simplifies a curve by dropping points based on shortest distance.
*
* Values of `epsilon` approaching zero keep more of the original points.
* Making `epsilon` larger will filter out more points, making the curve more lossy and jagged.
*
* ```js
* // Source set of points that define the curve
* const pts = [ {x:100,y:200}, {x:10, y:20}, ... ];
*
* const simplified = rdpShortestDistance(pts, 3); // Yields an array of points
* ```
* It is an implementation of the [Ramer Douglas Peucker algorithm](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm)
* by Marius Karthaus. Try the online playground: https://karthaus.nl/rdp/
*
* @param points
* @param epsilon
* @returns
*/
const rdpShortestDistance = (points, epsilon = .1) => {
	const firstPoint = points[0];
	const lastPoint = points.at(-1);
	if (points.length < 3) return points;
	let index = -1;
	let distribution = 0;
	for (let index_ = 1; index_ < points.length - 1; index_++) {
		const cDistribution = distanceFromPointToLine(points[index_], firstPoint, lastPoint);
		if (cDistribution > distribution) {
			distribution = cDistribution;
			index = index_;
		}
	}
	if (distribution > epsilon) {
		const l1 = points.slice(0, index + 1);
		const l2 = points.slice(index);
		const r1 = rdpShortestDistance(l1, epsilon);
		const r2 = rdpShortestDistance(l2, epsilon);
		const rs = [...r1.slice(0, -1), ...r2];
		return rs;
	} else return [firstPoint, lastPoint];
};
/**
* Simplifies a curve by dropping points based on perpendicular distance
*
* Values of `epsilon` approaching zero keep more of the original points.
* Making `epsilon` larger will filter out more points, making the curve more lossy and jagged.
*
* ```js
* // Source set of points that define the curve
* const pts = [ {x:100,y:200}, {x:10, y:20}, ... ];
*
* const simplified = rdpShortestDistance(pts, 3); // Yields an array of points
* ```
* It is an implementation of the [Ramer Douglas Peucker algorithm](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm)
* by Marius Karthaus. Try the online playground: https://karthaus.nl/rdp/
*
* @param points
* @param epsilon
* @returns
*/
const rdpPerpendicularDistance = (points, epsilon = .1) => {
	const firstPoint = points[0];
	const lastPoint = points.at(-1);
	if (points.length < 3) return points;
	let index = -1;
	let distribution = 0;
	for (let index_ = 1; index_ < points.length - 1; index_++) {
		const cDistribution = findPerpendicularDistance(points[index_], firstPoint, lastPoint);
		if (cDistribution > distribution) {
			distribution = cDistribution;
			index = index_;
		}
	}
	if (distribution > epsilon) {
		const l1 = points.slice(0, index + 1);
		const l2 = points.slice(index);
		const r1 = rdpPerpendicularDistance(l1, epsilon);
		const r2 = rdpPerpendicularDistance(l2, epsilon);
		const rs = [...r1.slice(0, -1), ...r2];
		return rs;
	} else return [firstPoint, lastPoint];
};
function findPerpendicularDistance(p, p1, p2) {
	let result;
	let slope$1;
	let intercept;
	if (p1.x == p2.x) result = Math.abs(p.x - p1.x);
	else {
		slope$1 = (p2.y - p1.y) / (p2.x - p1.x);
		intercept = p1.y - slope$1 * p1.x;
		result = Math.abs(slope$1 * p.x - p.y + intercept) / Math.sqrt(Math.pow(slope$1, 2) + 1);
	}
	return result;
}
const distanceFromPointToLine = (p, index, index_) => {
	const lineLength = distance(index, index_);
	if (lineLength == 0) return distance(p, index);
	const t = ((p.x - index.x) * (index_.x - index.x) + (p.y - index.y) * (index_.y - index.y)) / lineLength;
	if (t < 0) return distance(p, index);
	if (t > 1) return distance(p, index_);
	return distance(p, {
		x: index.x + t * (index_.x - index.x),
		y: index.y + t * (index_.y - index.y)
	});
};

//#endregion
//#region ../geometry/dist/src/quad-tree.js
var quad_tree_exports = {};
__export(quad_tree_exports, {
	Direction: () => Direction,
	QuadTreeNode: () => QuadTreeNode,
	quadTree: () => quadTree
});
/**
* Direction
*/
var Direction;
(function(Direction$1) {
	Direction$1[Direction$1["Nw"] = 0] = "Nw";
	Direction$1[Direction$1["Ne"] = 1] = "Ne";
	Direction$1[Direction$1["Sw"] = 2] = "Sw";
	Direction$1[Direction$1["Se"] = 3] = "Se";
})(Direction || (Direction = {}));
/**
* Creates a QuadTreeNode
* @param bounds Bounds of region
* @param initialData Initial items to place in quad tree
* @param opts Options
* @returns New quad tree
*/
const quadTree = (bounds, initialData = [], opts = {}) => {
	const o = {
		maxItems: opts.maxItems ?? 4,
		maxLevels: opts.maxLevels ?? 4
	};
	const n = new QuadTreeNode(void 0, bounds, 0, o);
	for (const d of initialData) n.add(d);
	return n;
};
/**
* QuadTreeNode. The values of the node is an array of {@link QuadTreeItem}.
*
* To create, you probably want the {@link quadTree} function.
*
*/
var QuadTreeNode = class QuadTreeNode {
	boundary;
	level;
	opts;
	#items = [];
	#children = [];
	#parent;
	/**
	* Constructor
	* @param boundary
	* @param level
	* @param opts
	*/
	constructor(parent, boundary, level, opts) {
		this.boundary = boundary;
		this.level = level;
		this.opts = opts;
		this.#parent = parent;
	}
	getLengthChildren() {
		return this.#children.length;
	}
	*parents() {
		let n = this;
		while (n.#parent !== void 0) {
			yield n.#parent;
			n = n.#parent;
		}
	}
	getParent() {
		return this.#parent;
	}
	/**
	* Iterates over immediate children
	*/
	*children() {
		for (const c of this.#children) yield c;
	}
	/**
	* Array of QuadTreeItem
	* @returns
	*/
	getValue() {
		return this.#items;
	}
	getIdentity() {
		return this;
	}
	/**
	* Get a descendant node in a given direction
	* @param d
	* @returns
	*/
	direction(d) {
		return this.#children[d];
	}
	/**
	* Add an item to the quadtree
	* @param p
	* @returns False if item is outside of boundary, True if item was added
	*/
	add(p) {
		if (!isIntersecting$2(this.boundary, p)) return false;
		if (this.#children.length > 0) {
			for (const d of this.#children) d.add(p);
			return true;
		}
		this.#items.push(p);
		if (this.#items.length > this.opts.maxItems && this.level < this.opts.maxLevels) {
			if (this.#children.length === 0) this.#subdivide();
			for (const item of this.#items) for (const d of this.#children) d.add(item);
			this.#items = [];
		}
		return true;
	}
	/**
	* Returns true if point is inside node's boundary
	* @param p
	* @returns
	*/
	couldHold(p) {
		return intersectsPoint(this.boundary, p);
	}
	#subdivide() {
		const w = this.boundary.width / 2;
		const h = this.boundary.height / 2;
		const x = this.boundary.x;
		const y = this.boundary.y;
		const coords = fromNumbers(x + w, y, x, y, x, y + h, x + w, y + h);
		const rects = coords.map((p) => fromTopLeft(p, w, h));
		this.#children = rects.map((r) => new QuadTreeNode(this, r, this.level + 1, this.opts));
	}
};

//#endregion
//#region ../geometry/dist/src/scaler.js
/**
* Returns a set of scaler functions, to convert to and from ranges.
*
* ```js
* const scaler = Scaler.scaler(`both`, {width:window.innerWidth, height:window.innerHeight});
* // Assuming screen of 800x400...
* scaler.abs(400,200);          // Yields { x:0.5, y:0.5 }
* scaler.abs({ x:400, y:200 }); // Yields { x:0.5, y:0.5 }
*
* scaler.rel(0.5, 0.5);         // Yields: { x:400, y:200 }
* scaler.rel({ x:0.5, y:0.5 }); // Yields: { x:400, y:200 }
* ```
*
* If no default range is provided, it must be given each time the scale function is used.
*
* ```js
* const scaler = Scaler.scaler(`both`);
*
* scaler.abs(400, 200, 800, 400);
* scaler.abs(400, 200, { width: 800, height: 400 });
* scaler.abs({ x:400, y: 200}, { width: 800, height: 400 });
* scaler.abs({ x:400, y: 200}, 800, 400);
* // All are the same, yielding { x:0.5, y:0.5 }
*
* scaler.abs(400, 200); // Throws an exception because there is no scale
* ```
* @param scaleBy Dimension to scale by
* @param defaultRect Default range
* @returns
*/
const scaler = (scaleBy = `both`, defaultRect) => {
	const defaultBounds = defaultRect ?? Placeholder;
	let sw = 1;
	let sh = 1;
	let s = {
		x: 1,
		y: 1
	};
	const computeScale = () => {
		switch (scaleBy) {
			case `height`: return {
				x: sh,
				y: sh
			};
			case `width`: return {
				x: sw,
				y: sw
			};
			case `min`: return {
				x: Math.min(sw, sh),
				y: Math.min(sw, sh)
			};
			case `max`: return {
				x: Math.max(sw, sh),
				y: Math.max(sw, sh)
			};
			default: return {
				x: sw,
				y: sh
			};
		}
	};
	const normalise$3 = (a, b, c, d) => {
		let inX = NaN;
		let inY = NaN;
		let outW = defaultBounds.width;
		let outH = defaultBounds.height;
		if (typeof a === `number`) {
			inX = a;
			if (typeof b === `number`) {
				inY = b;
				if (c === void 0) return [
					inX,
					inY,
					outW,
					outH
				];
				if (isRect(c)) {
					outW = c.width;
					outH = c.height;
				} else if (typeof c === `number`) {
					outW = c;
					if (typeof d === `number`) outH = d;
					else throw new TypeError(`Missing final height value`);
				} else throw new Error(`Missing valid output range`);
			} else if (isRect(b)) {
				outW = b.width;
				outH = b.height;
			} else throw new Error(`Expected input y or output Rect to follow first number parameter`);
		} else if (isPoint(a)) {
			inX = a.x;
			inY = a.y;
			if (b === void 0) return [
				inX,
				inY,
				outW,
				outH
			];
			if (isRect(b)) {
				outW = b.width;
				outH = b.height;
			} else if (typeof b === `number`) {
				outW = b;
				if (typeof c === `number`) outH = c;
				else throw new TypeError(`Expected height as third parameter after Point and output width`);
			} else throw new TypeError(`Expected Rect or width as second parameter when first parameter is a Point`);
		} else throw new Error(`Expected input Point or x value as first parameter`);
		return [
			inX,
			inY,
			outW,
			outH
		];
	};
	const scaleAbs = (a, b, c, d) => {
		const n = normalise$3(a, b, c, d);
		return scaleNormalised(true, ...n);
	};
	const scaleRel = (a, b, c, d) => {
		const n = normalise$3(a, b, c, d);
		return scaleNormalised(false, ...n);
	};
	const scaleNormalised = (abs$1, x, y, w, h) => {
		if (Number.isNaN(w)) throw new Error(`Output width range missing`);
		if (Number.isNaN(h)) throw new Error(`Output height range missing`);
		if (w !== sw || h !== sh) {
			sw = w;
			sh = h;
			s = computeScale();
		}
		return abs$1 ? {
			x: x * s.x,
			y: y * s.y
		} : {
			x: x / s.x,
			y: y / s.y
		};
	};
	return {
		computeScale,
		rel: scaleRel,
		abs: scaleAbs,
		width: defaultBounds.width,
		height: defaultBounds.height
	};
};

//#endregion
//#region ../geometry/dist/src/surface-points.js
var surface_points_exports = {};
__export(surface_points_exports, {
	circleRings: () => circleRings,
	circleVogelSpiral: () => circleVogelSpiral,
	sphereFibonacci: () => sphereFibonacci
});
const cos = Math.cos;
const sin = Math.sin;
const asin = Math.asin;
const sqrt = Math.sqrt;
const pow = Math.pow;
const pi = Math.PI;
const piPi$1 = Math.PI * 2;
const goldenAngle = pi * (3 - sqrt(5));
const goldenSection = (1 + sqrt(5)) / 2;
/**
* Generates points on a Vogel spiral - a sunflower-like arrangement of points.
*
* @example With no arguments, assumes a unit circle
* ```js
* for (const pt of circleVogelSpiral()) {
*  // Generate points on a unit circle, with 95% density
* }
* ```
*
*
* @example Specifying a circle and options
* ```js
* const circle = { radius: 100, x: 100, y: 100 };
* const opts = {
*  maxPoints: 50,
*  density: 0.99
* };
* for (const pt of circleVogelSpiral(circle, opts)) {
*  // Do something with point...
* }
* ```
*
* @example Array format
* ```js
* const ptsArray = [...circleVogelSpiral(circle, opts)];
* ```
* @param circle
* @param opts
*/
function* circleVogelSpiral(circle, opts = {}) {
	const maxPoints = opts.maxPoints ?? 5e3;
	const density = opts.density ?? .95;
	const rotationOffset = opts.rotation ?? 0;
	const c = toPositioned(circle ?? {
		radius: 1,
		x: 0,
		y: 0
	});
	const max = c.radius;
	let spacing = c.radius * scale(density, 0, 1, .3, .01);
	if (opts.spacing) spacing = opts.spacing;
	let radius = 0;
	let count = 0;
	let angle = 0;
	while (count < maxPoints && radius < max) {
		radius = spacing * count ** .5;
		angle = rotationOffset + count * 2 * pi / goldenSection;
		yield Object.freeze({
			x: c.x + radius * cos(angle),
			y: c.y + radius * sin(angle)
		});
		count++;
	}
}
/**
* Generates points spaced out on the given number of rings.
*
* Get points as array
* ```js
* const circle = { radius: 5, x: 100, y: 100 };
* const opts = { rings: 5 };
* const points = [...circleRings(circle, rings)];
* ```
*
* Or iterate over them
* ```js
* for (const point of circleRings(circle, opts)) {
* }
* ```
* Source: http://www.holoborodko.com/pavel/2015/07/23/generating-equidistant-points-on-unit-disk/#more-3453
* @param circle
*/
function* circleRings(circle, opts = {}) {
	const rings = opts.rings ?? 5;
	const c = toPositioned(circle ?? {
		radius: 1,
		x: 0,
		y: 0
	});
	const ringR = 1 / rings;
	const rotationOffset = opts.rotation ?? 0;
	let ringCount = 1;
	yield Object.freeze({
		x: c.x,
		y: c.y
	});
	for (let r = ringR; r <= 1; r += ringR) {
		const n = Math.round(pi / asin(1 / (2 * ringCount)));
		for (const theta of linearSpace(0, piPi$1, n + 1)) yield Object.freeze({
			x: c.x + r * cos(theta + rotationOffset) * c.radius,
			y: c.y + r * sin(theta + rotationOffset) * c.radius
		});
		ringCount++;
	}
}
/**
* Fibonacci sphere algorithm. Generates points
* distributed on a sphere.
*
* @example Generate points of a unit sphere
* ```js
* for (const pt of sphereFibonacci(100)) {
*  // pt.x, pt.y, pt.z
* }
* ```
*
* @example Generate points into an array
* ```js
* const sphere = { radius: 10, x: 10, y: 200 }
* const pts = [...sphereFibonacci(100, 0, sphere)];
* ```
*
* Source: https://codepen.io/elchininet/pen/vXeRyL
*
* @param samples
* @returns
*/
function* sphereFibonacci(samples = 100, rotationRadians = 0, sphere) {
	const offset$1 = 2 / samples;
	const s = sphere ?? {
		x: 0,
		y: 0,
		z: 0,
		radius: 1
	};
	for (let index = 0; index < samples; index++) {
		const y = index * offset$1 - 1 + offset$1 / 2;
		const r = sqrt(1 - pow(y, 2));
		const a = (index + 1) % samples * goldenAngle + rotationRadians;
		const x = cos(a) * r;
		const z = sin(a) * r;
		yield Object.freeze({
			x: s.x + x * s.radius,
			y: s.y + y * s.radius,
			z: s.z + z * s.radius
		});
	}
}

//#endregion
//#region ../geometry/dist/src/triangle/angles.js
/**
* Return the three interior angles of the triangle, in radians.
* @param t
* @returns
*/
const angles = (t) => {
	guard(t);
	return [
		angleRadian(t.a, t.b),
		angleRadian(t.b, t.c),
		angleRadian(t.c, t.a)
	];
};
/**
* Returns the three interior angles of the triangle, in degrees
* @param t
* @returns
*/
const anglesDegrees = (t) => {
	guard(t);
	return radianToDegree(angles(t));
};

//#endregion
//#region ../geometry/dist/src/triangle/edges.js
/**
* Returns the edges (ie sides) of the triangle as an array of lines
* @param t
* @returns Array of length three
*/
const edges = (t) => {
	guard(t);
	return joinPointsToLines(t.a, t.b, t.c, t.a);
};

//#endregion
//#region ../geometry/dist/src/triangle/area.js
/**
* Calculates the area of a triangle
* @param t
* @returns
*/
const area$3 = (t) => {
	guard(t, `t`);
	const lengths$2 = edges(t).map((l) => length(l));
	const p = (lengths$2[0] + lengths$2[1] + lengths$2[2]) / 2;
	return Math.sqrt(p * (p - lengths$2[0]) * (p - lengths$2[1]) * (p - lengths$2[2]));
};

//#endregion
//#region ../geometry/dist/src/triangle/barycentric.js
/**
* Returns the [Barycentric coordinate](https://en.wikipedia.org/wiki/Barycentric_coordinate_system) of a point within a triangle
*
* @param t
* @param a
* @param b
* @returns
*/
const barycentricCoord = (t, a, b) => {
	const pt = getPointParameter(a, b);
	const ab = (x, y, pa, pb) => (pa.y - pb.y) * x + (pb.x - pa.x) * y + pa.x * pb.y - pb.x * pa.y;
	const alpha = ab(pt.x, pt.y, t.b, t.c) / ab(t.a.x, t.a.y, t.b, t.c);
	const theta = ab(pt.x, pt.y, t.c, t.a) / ab(t.b.x, t.b.y, t.c, t.a);
	const gamma = ab(pt.x, pt.y, t.a, t.b) / ab(t.c.x, t.c.y, t.a, t.b);
	return {
		a: alpha,
		b: theta,
		c: gamma
	};
};
/**
* Convert Barycentric coordinate to Cartesian
* @param t
* @param bc
* @returns
*/
const barycentricToCartestian = (t, bc) => {
	guard(t);
	const { a, b, c } = t;
	const x = a.x * bc.a + b.x * bc.b + c.x * bc.c;
	const y = a.y * bc.a + b.y * bc.b + c.y * bc.c;
	if (a.z && b.z && c.z) {
		const z = a.z * bc.a + b.z * bc.b + c.z * bc.c;
		return Object.freeze({
			x,
			y,
			z
		});
	} else return Object.freeze({
		x,
		y
	});
};

//#endregion
//#region ../geometry/dist/src/triangle/bbox.js
/**
* Returns the bounding box that encloses the triangle.
* @param t
* @param inflation If specified, box will be inflated by this much. Default: 0.
* @returns
*/
const bbox = (t, inflation = 0) => {
	const { a, b, c } = t;
	const xMin = Math.min(a.x, b.x, c.x) - inflation;
	const xMax = Math.max(a.x, b.x, c.x) + inflation;
	const yMin = Math.min(a.y, b.y, c.y) - inflation;
	const yMax = Math.max(a.y, b.y, c.y) + inflation;
	const r = {
		x: xMin,
		y: yMin,
		width: xMax - xMin,
		height: yMax - yMin
	};
	return r;
};

//#endregion
//#region ../geometry/dist/src/triangle/corners.js
/**
* Returns the corners (vertices) of the triangle as an array of points
* @param t
* @returns Array of length three
*/
const corners = (t) => {
	guard(t);
	return [
		t.a,
		t.b,
		t.c
	];
};

//#endregion
//#region ../geometry/dist/src/triangle/from.js
/**
* Returns an equilateral triangle centered at the origin.
*
* ```js
* // Create a triangle at 100,100 with radius of 60
* const tri = fromRadius({x:100,y:100}, 60);
*
* // Triangle with point A upwards, B to the right, C to the left
* constr tri2 = fromRadius({x:100,y:100}, 60, {initialAngleRadian: -Math.PI / 2});
* ```
*
*
* @param origin Origin
* @param radius Radius of triangle
* @param opts Options
*/
const fromRadius = (origin, radius, opts = {}) => {
	resultThrow(numberTest(radius, `positive`, `radius`));
	guard$1(origin, `origin`);
	const initialAngleRadian = opts.initialAngleRadian ?? 0;
	const angles$1 = [
		initialAngleRadian,
		initialAngleRadian + piPi * 1 / 3,
		initialAngleRadian + piPi * 2 / 3
	];
	const points = angles$1.map((a) => toCartesian(radius, a, origin));
	return fromPoints(points);
};
/**
* Returns a triangle from a set of coordinates in a flat array form:
* [xA, yA, xB, yB, xC, yC]
* @param coords
* @returns
*/
const fromFlatArray = (coords) => {
	if (!Array.isArray(coords)) throw new Error(`coords expected as array`);
	if (coords.length !== 6) throw new Error(`coords array expected with 6 elements. Got ${coords.length}`);
	return fromPoints(fromNumbers(...coords));
};
/**
* Returns a triangle from an array of three points
* @param points
* @returns
*/
const fromPoints = (points) => {
	if (!Array.isArray(points)) throw new Error(`points expected as array`);
	if (points.length !== 3) throw new Error(`points array expected with 3 elements. Got ${points.length}`);
	const t = {
		a: points[0],
		b: points[1],
		c: points[2]
	};
	return t;
};

//#endregion
//#region ../geometry/dist/src/triangle/perimeter.js
/**
* Calculates perimeter of a triangle
* @param t
* @returns
*/
const perimeter$3 = (t) => {
	guard(t);
	return edges(t).reduce((accumulator, v) => accumulator + length(v), 0);
};

//#endregion
//#region ../geometry/dist/src/triangle/inner-circle.js
/**
* Returns the largest circle enclosed by triangle `t`.
* @param t
*/
const innerCircle = (t) => {
	const c = centroid(t);
	const p = perimeter$3(t) / 2;
	const a = area$3(t);
	const radius = a / p;
	return {
		radius,
		...c
	};
};

//#endregion
//#region ../geometry/dist/src/triangle/intersects.js
/**
* Returns true if point is within or on the boundary of triangle
* @param t
* @param a
* @param b
*/
const intersectsPoint$1 = (t, a, b) => {
	const box = bbox(t);
	const pt = getPointParameter(a, b);
	if (!intersectsPoint(box, pt)) return false;
	const bc = barycentricCoord(t, pt);
	return 0 <= bc.a && bc.a <= 1 && 0 <= bc.b && bc.b <= 1 && 0 <= bc.c && bc.c <= 1;
};

//#endregion
//#region ../geometry/dist/src/triangle/lengths.js
/**
* Returns the lengths of the triangle sides
* @param t
* @returns Array of length three
*/
const lengths = (t) => {
	guard(t);
	return [
		distance(t.a, t.b),
		distance(t.b, t.c),
		distance(t.c, t.a)
	];
};

//#endregion
//#region ../geometry/dist/src/triangle/kinds.js
/**
* Returns true if it is an equilateral triangle
* @param t
* @returns
*/
const isEquilateral = (t) => {
	guard(t);
	const [a, b, c] = lengths(t);
	return a === b && b === c;
};
/**
* Returns true if it is an isosceles triangle
* @param t
* @returns
*/
const isIsosceles = (t) => {
	const [a, b, c] = lengths(t);
	if (a === b) return true;
	if (b === c) return true;
	if (c === a) return true;
	return false;
};
/**
* Returns true if at least one interior angle is 90 degrees
* @param t
* @returns
*/
const isRightAngle = (t) => angles(t).includes(Math.PI / 2);
/**
* Returns true if triangle is oblique: No interior angle is 90 degrees
* @param t
* @returns
*/
const isOblique = (t) => !isRightAngle(t);
/**
* Returns true if triangle is actue: all interior angles less than 90 degrees
* @param t
* @returns
*/
const isAcute = (t) => !angles(t).some((v) => v >= Math.PI / 2);
/**
* Returns true if triangle is obtuse: at least one interior angle is greater than 90 degrees
* @param t
* @returns
*/
const isObtuse = (t) => angles(t).some((v) => v > Math.PI / 2);

//#endregion
//#region ../geometry/dist/src/triangle/math.js
/**
* Applies `fn` to each of a triangle's corner points, returning the result.
*
* @example Add some random to the x of each corner
* ```
* const t = apply(tri, p => {
*  const r = 10;
*  return {
*    x: p.x + (Math.random()*r*2) - r,
*    y: p.y
*  }
* });
* ```
* @param t
* @param fn
* @returns
*/
const apply = (t, fn) => Object.freeze({
	...t,
	a: fn(t.a, `a`),
	b: fn(t.b, `b`),
	c: fn(t.c, `c`)
});

//#endregion
//#region ../geometry/dist/src/triangle/outer-circle.js
/**
* Returns the largest circle touching the corners of triangle `t`.
* @param t
* @returns
*/
const outerCircle = (t) => {
	const [a, b, c] = edges(t).map((l) => length(l));
	const cent = centroid(t);
	const radius = a * b * c / Math.sqrt((a + b + c) * (-a + b + c) * (a - b + c) * (a + b - c));
	return {
		radius,
		...cent
	};
};

//#endregion
//#region ../geometry/dist/src/triangle/rotate.js
/**
* Returns a triangle that is rotated by `angleRad`. By default it rotates
* around its center but an arbitrary `origin` point can be provided.
*
* ```js
* let triangle = Triangles.fromPoints([a, b, c]);
*
* // Rotate triangle by 5 degrees
* triangle = Triangles.rotate(triangle, degreeToRadian(5));
*
* // Rotate by 90 degrees
* triangle = Triangles.rotate(triangle, Math.PI / 2);
* ```
* @param triangle Triangle to rotate
* @param amountRadian Angle in radians to rotate by
* @param origin Point to rotate around. If undefined, middle of triangle will be used
* @returns A new triangle
*/
const rotate$1 = (triangle, amountRadian, origin) => {
	if (amountRadian === void 0 || amountRadian === 0) return triangle;
	if (origin === void 0) origin = centroid(triangle);
	return Object.freeze({
		...triangle,
		a: rotate(triangle.a, amountRadian, origin),
		b: rotate(triangle.b, amountRadian, origin),
		c: rotate(triangle.c, amountRadian, origin)
	});
};
/**
* Rotates the vertices of the triangle around one point (by default, `b`), returning
* as a new object.
*
* ```js
* let triangle = Triangles.fromPoints([a, b, c]);
* triangle = Triangles.rotateByVertex(triangle, Math.Pi, `a`);
* ```
* @param triangle Triangle
* @param amountRadian Angle to rotate by
* @param vertex Name of vertex: a, b or c.
* @returns A new triangle
*/
const rotateByVertex = (triangle, amountRadian, vertex = `b`) => {
	const origin = vertex === `a` ? triangle.a : vertex === `b` ? triangle.b : triangle.c;
	return Object.freeze({
		a: rotate(triangle.a, amountRadian, origin),
		b: rotate(triangle.b, amountRadian, origin),
		c: rotate(triangle.c, amountRadian, origin)
	});
};

//#endregion
//#region ../geometry/dist/src/triangle/to.js
/**
* Returns the coordinates of triangle in a flat array form:
* [xA, yA, xB, yB, xC, yC]
* @param t
* @returns
*/
const toFlatArray = (t) => {
	guard(t);
	return [
		t.a.x,
		t.a.y,
		t.b.x,
		t.b.y,
		t.c.x,
		t.c.y
	];
};

//#endregion
//#region ../geometry/dist/src/triangle/equilateral.js
var equilateral_exports = {};
__export(equilateral_exports, {
	area: () => area$2,
	centerFromA: () => centerFromA,
	centerFromB: () => centerFromB,
	centerFromC: () => centerFromC,
	circumcircle: () => circumcircle$2,
	fromCenter: () => fromCenter$1,
	height: () => height$2,
	incircle: () => incircle$2,
	perimeter: () => perimeter$2
});
const pi4over3 = Math.PI * 4 / 3;
const pi2over3 = Math.PI * 2 / 3;
const resolveLength = (t) => {
	if (typeof t === `number`) return t;
	return t.length;
};
/**
* Returns a positioned `Triangle` from an equilateral triangle definition.
* By default the rotation is such that point `a` and `c` are lying on the horizontal,
* and `b` is the upward-facing tip.
*
* Default is a triangle pointing upwards with b at the top, c to the left and b to right on the baseline.
*
* Example rotation values in radians:
* * ▶️ 0: a and c on vertical, b at the tip
* * ◀️ Math.PI: `c`and `a` are on vertical, with `b` at the tip.
* * 🔽 Math.PI/2: `c` and `a` are on horizontal, `c` to the left. `b` at the bottom.
* * 🔼 Math.PI*1.5: `c` and `a` are on horizontal, `c` to the right. `b` at the top. (default)
* @param t
* @param origin
* @param rotationRad
* @returns
*/
const fromCenter$1 = (t, origin, rotationRad) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const r = resolveLength(t) / Math.sqrt(3);
	const rot = rotationRad ?? Math.PI * 1.5;
	const b = {
		x: r * Math.cos(rot) + origin.x,
		y: r * Math.sin(rot) + origin.y
	};
	const a = {
		x: r * Math.cos(rot + pi4over3) + origin.x,
		y: r * Math.sin(rot + pi4over3) + origin.y
	};
	const c = {
		x: r * Math.cos(rot + pi2over3) + origin.x,
		y: r * Math.sin(rot + pi2over3) + origin.y
	};
	return Object.freeze({
		a,
		b,
		c
	});
};
/**
* Calculate center from the given point A
* @param t
* @param ptA
* @returns
*/
const centerFromA = (t, ptA) => {
	if (!ptA) ptA = Object.freeze({
		x: 0,
		y: 0
	});
	const r = resolveLength(t);
	const { radius } = incircle$2(t);
	return {
		x: ptA.x + r / 2,
		y: ptA.y - radius
	};
};
/**
* Calculate center from the given point B
* @param t
* @param ptB
* @returns
*/
const centerFromB = (t, ptB) => {
	if (!ptB) ptB = Object.freeze({
		x: 0,
		y: 0
	});
	const { radius } = incircle$2(t);
	return {
		x: ptB.x,
		y: ptB.y + radius * 2
	};
};
/**
* Calculate center from the given point C
* @param t
* @param ptC
* @returns
*/
const centerFromC = (t, ptC) => {
	if (!ptC) ptC = Object.freeze({
		x: 0,
		y: 0
	});
	const r = resolveLength(t);
	const { radius } = incircle$2(t);
	return {
		x: ptC.x - r / 2,
		y: ptC.y - radius
	};
};
/**
* Returns the height (or rise) of an equilateral triangle.
* Ie. from one vertex to the perpendicular edge.
* (line marked x in the diagram below)
*
* ```
*      .
*     .x .
*    . x  .
*   .  x   .
*  ..........
* ```
* @param t
*/
const height$2 = (t) => Math.sqrt(3) / 2 * resolveLength(t);
const perimeter$2 = (t) => resolveLength(t) * 3;
const area$2 = (t) => Math.pow(resolveLength(t), 2) * Math.sqrt(3) / 4;
/**
* Circle that encompasses all points of triangle
* @param t
*/
const circumcircle$2 = (t) => ({ radius: Math.sqrt(3) / 3 * resolveLength(t) });
/**
* Circle that is inside the edges of the triangle
* @param t
* @returns
*/
const incircle$2 = (t) => ({ radius: Math.sqrt(3) / 6 * resolveLength(t) });

//#endregion
//#region ../geometry/dist/src/triangle/right.js
var right_exports = {};
__export(right_exports, {
	adjacentFromHypotenuse: () => adjacentFromHypotenuse,
	adjacentFromOpposite: () => adjacentFromOpposite,
	angleAtPointA: () => angleAtPointA,
	angleAtPointB: () => angleAtPointB,
	area: () => area$1,
	circumcircle: () => circumcircle$1,
	fromA: () => fromA$1,
	fromB: () => fromB$1,
	fromC: () => fromC$1,
	height: () => height$1,
	hypotenuseFromAdjacent: () => hypotenuseFromAdjacent,
	hypotenuseFromOpposite: () => hypotenuseFromOpposite,
	hypotenuseSegments: () => hypotenuseSegments,
	incircle: () => incircle$1,
	medians: () => medians$1,
	oppositeFromAdjacent: () => oppositeFromAdjacent,
	oppositeFromHypotenuse: () => oppositeFromHypotenuse,
	perimeter: () => perimeter$1,
	resolveLengths: () => resolveLengths
});
/**
* Returns a positioned triangle from a point for A.
*
* ```
*             c (90 deg)
*             .
*          .   .
*       .       .
*    .           .
* a .............. b
* ```
* @param t
* @param origin
* @returns
*/
const fromA$1 = (t, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const tt = resolveLengths(t);
	const seg = hypotenuseSegments(t);
	const h = height$1(t);
	const a = {
		x: origin.x,
		y: origin.y
	};
	const b = {
		x: origin.x + tt.hypotenuse,
		y: origin.y
	};
	const c = {
		x: origin.x + seg[1],
		y: origin.y - h
	};
	return {
		a,
		b,
		c
	};
};
/**
* Returns a positioned triangle from a point for B.
*
* ```
*             c (90 deg)
*             .
*          .   .
*       .       .
*    .           .
* a .............. b
* ```
* @param t
* @param origin
* @returns
*/
const fromB$1 = (t, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const tt = resolveLengths(t);
	const seg = hypotenuseSegments(t);
	const h = height$1(t);
	const b = {
		x: origin.x,
		y: origin.y
	};
	const a = {
		x: origin.x - tt.hypotenuse,
		y: origin.y
	};
	const c = {
		x: origin.x - seg[0],
		y: origin.y - h
	};
	return {
		a,
		b,
		c
	};
};
/**
* Returns a positioned triangle from a point for C.
*
* ```
*             c (90 deg)
*             .
*          .   .
*       .       .
*    .           .
* a .............. b
* ```
*
*
* ```js
* // Triangle pointing up to 0,0 with sides of 15
* Triangles.Right.fromC({ adjacent: 15, opposite:15 }, { x: 0, y: 0 });
* ```
* @param t
* @param origin
* @returns
*/
const fromC$1 = (t, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const seg = hypotenuseSegments(t);
	const h = height$1(t);
	const c = {
		x: origin.x,
		y: origin.y
	};
	const a = {
		x: origin.x - seg[1],
		y: origin.y + h
	};
	const b = {
		x: origin.x + seg[0],
		y: origin.y + h
	};
	return {
		a,
		b,
		c
	};
};
/**
* Returns a right triangle with all lengths defined.
* At least two lengths must already exist
* @param t
* @returns
*/
const resolveLengths = (t) => {
	const a = t.adjacent;
	const o = t.opposite;
	const h = t.hypotenuse;
	if (a !== void 0 && o !== void 0) return {
		...t,
		adjacent: a,
		opposite: o,
		hypotenuse: Math.hypot(a, o)
	};
	else if (a && h) return {
		...t,
		adjacent: a,
		hypotenuse: h,
		opposite: h * h - a * a
	};
	else if (o && h) return {
		...t,
		hypotenuse: h,
		opposite: o,
		adjacent: h * h - o * o
	};
	else if (t.opposite && t.hypotenuse && t.adjacent) return t;
	throw new Error(`Missing at least two edges`);
};
/**
* Height of right-triangle
* @param t
* @returns
*/
const height$1 = (t) => {
	const tt = resolveLengths(t);
	const p = tt.opposite * tt.opposite / tt.hypotenuse;
	const q = tt.adjacent * tt.adjacent / tt.hypotenuse;
	return Math.sqrt(p * q);
};
/**
* Returns the lengths of the hypotenuse split into p and q segments.
* In other words, if one makes a line from the right-angle vertex down to hypotenuse.
*
* [See here](https://rechneronline.de/pi/right-triangle.php)
* @param t
* @returns
*/
const hypotenuseSegments = (t) => {
	const tt = resolveLengths(t);
	const p = tt.opposite * tt.opposite / tt.hypotenuse;
	const q = tt.adjacent * tt.adjacent / tt.hypotenuse;
	return [p, q];
};
const perimeter$1 = (t) => {
	const tt = resolveLengths(t);
	return tt.adjacent + tt.hypotenuse + tt.opposite;
};
const area$1 = (t) => {
	const tt = resolveLengths(t);
	return tt.opposite * tt.adjacent / 2;
};
/**
* Angle (in radians) between hypotenuse and adjacent edge
* @param t
* @returns
*/
const angleAtPointA = (t) => {
	const tt = resolveLengths(t);
	return Math.acos((tt.adjacent * tt.adjacent + tt.hypotenuse * tt.hypotenuse - tt.opposite * tt.opposite) / (2 * tt.adjacent * tt.hypotenuse));
};
/**
* Angle (in radians) between opposite edge and hypotenuse
* @param t
* @returns
*/
const angleAtPointB = (t) => {
	const tt = resolveLengths(t);
	return Math.acos((tt.opposite * tt.opposite + tt.hypotenuse * tt.hypotenuse - tt.adjacent * tt.adjacent) / (2 * tt.opposite * tt.hypotenuse));
};
/**
* Returns the median line lengths a, b and c in an array.
*
* The median lines are the lines from each vertex to the center.
*
* @param t
* @returns
*/
const medians$1 = (t) => {
	const tt = resolveLengths(t);
	const b = tt.adjacent * tt.adjacent;
	const c = tt.hypotenuse * tt.hypotenuse;
	const a = tt.opposite * tt.opposite;
	return [
		Math.sqrt(2 * (b + c) - a) / 2,
		Math.sqrt(2 * (c + a) - b) / 2,
		Math.sqrt(2 * (a + b) - c) / 2
	];
};
/**
* The circle which passes through the points of the triangle
* @param t
* @returns
*/
const circumcircle$1 = (t) => {
	const tt = resolveLengths(t);
	return { radius: tt.hypotenuse / 2 };
};
/**
* Circle enclosed by triangle
* @param t
* @returns
*/
const incircle$1 = (t) => {
	const tt = resolveLengths(t);
	return { radius: (tt.adjacent + tt.opposite - tt.hypotenuse) / 2 };
};
/**
* Returns the opposite length of a right-angle triangle,
* marked here
*
* ```
*    .  <
*   ..  <
* ....  <
* ```
*
* This is just:
* ```js
* opposite = Math.tan(angle) * adjacent
* ```
* @param angleRad
* @param adjacent
* @returns
*/
const oppositeFromAdjacent = (angleRad, adjacent) => Math.tan(angleRad) * adjacent;
/**
* Returns the opposite length of a right-angle triangle,
* marked here
*
* ```
*    .  <
*   ..  <
* ....  <
* ```
*
* This is just:
* ```js
* opposite = Math.tan(angle) * adjacent
* ```
* @param angleRad
* @param hypotenuse
* @returns
*/
const oppositeFromHypotenuse = (angleRad, hypotenuse) => Math.sin(angleRad) * hypotenuse;
/**
* Returns the adjecent length of a right-angle triangle,
* marked here
* ```
*    .
*   ..  o
* ....
* ^^^^
* ```
* This is just:
* ```js
* opposite = Math.tan(angle) * adjacent
* ```
* @param angleRadian
* @param hypotenuse
* @returns
*/
const adjacentFromHypotenuse = (angleRadian$2, hypotenuse) => Math.cos(angleRadian$2) * hypotenuse;
/**
* Returns the adjecent length of a right-angle triangle,
* marked here
* ```
*    .
*   ..  o
* ....
* ^^^^
* ```
* This is just:
* ```js
* opposite = Math.tan(angle) * adjacent
* ```
* @param angleRadian
* @param opposite
* @returns
*/
const adjacentFromOpposite = (angleRadian$2, opposite) => opposite / Math.tan(angleRadian$2);
/**
* Returns the hypotenuse length of a right-angle triangle,
* marked here
* ```
*      .
* >   ..
* >  ...
* > ....  opp
*  .....
*   adj
* ```
* This is just:
* ```js
* opposite = Math.tan(angle) * adjacent
* ```
* @param angleRadian
* @param opposite
* @returns
*/
const hypotenuseFromOpposite = (angleRadian$2, opposite) => opposite / Math.sin(angleRadian$2);
/**
* Returns the hypotenuse length of a right-angle triangle,
* marked here
* ```
*      .
* >   ..
* >  ...
* > ....  opp
*  .....
*   adj
* ```
* This is just:
* ```js
* opposite = Math.tan(angle) * adjacent
* ```
* @param angleRadian
* @param adjacent
* @returns
*/
const hypotenuseFromAdjacent = (angleRadian$2, adjacent) => adjacent / Math.cos(angleRadian$2);

//#endregion
//#region ../geometry/dist/src/triangle/isosceles.js
var isosceles_exports = {};
__export(isosceles_exports, {
	apexAngle: () => apexAngle,
	area: () => area,
	baseAngle: () => baseAngle,
	circumcircle: () => circumcircle,
	fromA: () => fromA,
	fromB: () => fromB,
	fromC: () => fromC,
	fromCenter: () => fromCenter,
	height: () => height,
	incircle: () => incircle,
	legHeights: () => legHeights,
	medians: () => medians,
	perimeter: () => perimeter
});
const baseAngle = (t) => Math.acos(t.base / (2 * t.legs));
const apexAngle = (t) => {
	const aa = t.legs * t.legs;
	const cc = t.base * t.base;
	return Math.acos((2 * aa - cc) / (2 * aa));
};
const height = (t) => {
	const aa = t.legs * t.legs;
	const cc = t.base * t.base;
	return Math.sqrt((4 * aa - cc) / 4);
};
const legHeights = (t) => {
	const b = baseAngle(t);
	return t.base * Math.sin(b);
};
const perimeter = (t) => 2 * t.legs + t.base;
const area = (t) => {
	const h = height(t);
	return h * t.base / 2;
};
const circumcircle = (t) => {
	const h = height(t);
	const hh = h * h;
	const cc = t.base * t.base;
	return { radius: (4 * hh + cc) / (8 * h) };
};
const incircle = (t) => {
	const h = height(t);
	return { radius: t.base * h / (2 * t.legs + t.base) };
};
const medians = (t) => {
	const aa = t.legs * t.legs;
	const cc = t.base * t.base;
	const medianAB = Math.sqrt(aa + 2 * cc) / 2;
	const medianC = Math.sqrt(4 * aa - cc) / 2;
	return [
		medianAB,
		medianAB,
		medianC
	];
};
/**
* Returns a positioned `Triangle` based on a center origin.
* Center is determined by the intesecting of the medians.
*
* See: https://rechneronline.de/pi/isosceles-triangle.php
* @param t
* @param origin
* @returns
*/
const fromCenter = (t, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const h = height(t);
	const incircleR = incircle(t).radius;
	const verticalToApex = h - incircleR;
	const a = {
		x: origin.x - t.base / 2,
		y: origin.y + incircleR
	};
	const b = {
		x: origin.x + t.base / 2,
		y: origin.y + incircleR
	};
	const c = {
		x: origin.x,
		y: origin.y - verticalToApex
	};
	return {
		a,
		b,
		c
	};
};
const fromA = (t, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const h = height(t);
	const a = {
		x: origin.x,
		y: origin.y
	};
	const b = {
		x: origin.x + t.base,
		y: origin.y
	};
	const c = {
		x: origin.x + t.base / 2,
		y: origin.y - h
	};
	return {
		a,
		b,
		c
	};
};
const fromB = (t, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const h = height(t);
	const b = {
		x: origin.x,
		y: origin.y
	};
	const a = {
		x: origin.x - t.base,
		y: origin.y
	};
	const c = {
		x: origin.x - t.base / 2,
		y: origin.y - h
	};
	return {
		a,
		b,
		c
	};
};
const fromC = (t, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const h = height(t);
	const c = {
		x: origin.x,
		y: origin.y
	};
	const a = {
		x: origin.x - t.base / 2,
		y: origin.y + h
	};
	const b = {
		x: origin.x + t.base / 2,
		y: origin.y + h
	};
	return {
		a,
		b,
		c
	};
};

//#endregion
//#region ../geometry/dist/src/triangle/index.js
var triangle_exports = {};
__export(triangle_exports, {
	Empty: () => Empty$1,
	Equilateral: () => equilateral_exports,
	Isosceles: () => isosceles_exports,
	Placeholder: () => Placeholder$1,
	Right: () => right_exports,
	angles: () => angles,
	anglesDegrees: () => anglesDegrees,
	apply: () => apply,
	area: () => area$3,
	barycentricCoord: () => barycentricCoord,
	barycentricToCartestian: () => barycentricToCartestian,
	bbox: () => bbox,
	centroid: () => centroid,
	corners: () => corners,
	edges: () => edges,
	equilateralFromVertex: () => equilateralFromVertex,
	fromFlatArray: () => fromFlatArray,
	fromPoints: () => fromPoints,
	fromRadius: () => fromRadius,
	guard: () => guard,
	innerCircle: () => innerCircle,
	intersectsPoint: () => intersectsPoint$1,
	isAcute: () => isAcute,
	isEmpty: () => isEmpty$1,
	isEqual: () => isEqual$1,
	isEquilateral: () => isEquilateral,
	isIsosceles: () => isIsosceles,
	isOblique: () => isOblique,
	isObtuse: () => isObtuse,
	isPlaceholder: () => isPlaceholder$1,
	isRightAngle: () => isRightAngle,
	isTriangle: () => isTriangle,
	lengths: () => lengths,
	outerCircle: () => outerCircle,
	perimeter: () => perimeter$3,
	rotate: () => rotate$1,
	rotateByVertex: () => rotateByVertex,
	toFlatArray: () => toFlatArray
});
/**
* Triangle.
*
* Helpers for creating:
*  - {@link Triangles.fromFlatArray}: Create from [x1, y1, x2, y2, x3, y3]
*  - {@link Triangles.fromPoints}: Create from three `{x,y}` sets
*  - {@link Triangles.fromRadius}: Equilateral triangle of a given radius and center
*/

//#endregion
//#region ../geometry/dist/src/index.js
var src_exports = {};
__export(src_exports, {
	Arcs: () => arc_exports,
	Beziers: () => bezier_exports,
	Circles: () => circle_exports,
	Compound: () => compound_path_exports,
	CurveSimplification: () => curve_simplification_exports,
	Ellipses: () => ellipse_exports,
	Grids: () => grid_exports,
	Layouts: () => layout_exports,
	Lines: () => line_exports,
	Paths: () => path_exports,
	PointTracker: () => PointTracker,
	Points: () => point_exports,
	PointsTracker: () => PointsTracker,
	Polar: () => polar_exports,
	QuadTree: () => quad_tree_exports,
	Rects: () => rect_exports,
	Shapes: () => shape_exports,
	SurfacePoints: () => surface_points_exports,
	Triangles: () => triangle_exports,
	Vectors: () => vector_exports,
	Waypoints: () => waypoint_exports,
	angleConvert: () => angleConvert,
	angleParse: () => angleParse,
	degreeArc: () => degreeArc,
	degreeToGradian: () => degreeToGradian,
	degreeToRadian: () => degreeToRadian,
	degreeToTurn: () => degreeToTurn,
	degreesSum: () => degreesSum,
	gradianToDegree: () => gradianToDegree,
	gradianToRadian: () => gradianToRadian,
	radianArc: () => radianArc,
	radianInvert: () => radianInvert,
	radianToDegree: () => radianToDegree,
	radianToGradian: () => radianToGradian,
	radianToTurn: () => radianToTurn,
	radiansFromAxisX: () => radiansFromAxisX,
	radiansSum: () => radiansSum,
	scaler: () => scaler,
	turnToDegree: () => turnToDegree,
	turnToRadian: () => turnToRadian
});

//#endregion
export { Empty, Empty$3 as Empty$1, EmptyPositioned, Placeholder$2 as Placeholder, PlaceholderPositioned, PointsTracker, Unit, abs, angleConvert, angleParse, angleRadian, applyFields, cardinal, cells, center$1 as center, clampMagnitude, compare, corners, corners$1, cubic, distance, divide$1 as divide, fromLine, fromNumbers$1 as fromNumbers, getEdgeX, getEdgeY, getPointParameter, guard$6 as guard, guard$1, indexFromCell, interpolate$4 as interpolate, interpolator, invert$1 as invert, isCubicBezier, isEqual$5 as isEqual, isLine, isPlaceholder$3 as isPlaceholder, isPlaceholder as isPlaceholder$1, isQuadraticBezier, isRectPositioned, multiply$1 as multiply, multiplyScalar, multiplyScalar$2 as multiplyScalar$1, normalise, offset, pipeline, pipelineApply, quadraticSimple, rows, scaler, src_exports, subtract, subtractSize, sum, toCartesian$2 as toCartesian, toCartesian as toCartesian$1, toPath$2 as toPath };
//# sourceMappingURL=src-CURfSkGx.js.map