import { __export, __toESM } from "./chunk-51aI8Tpl.js";
import { resultToError } from "./src-BBD50Kth.js";
import "./is-primitive-eBwrK4Yg.js";
import { intervalToMs } from "./interval-type-DajslxUJ.js";
import "./basic-D0XoOdBJ.js";
import { afterMatch } from "./src-CkygQtXo.js";
import "./key-value-JSby0EXT.js";
import { require_dist, uniqueInstances } from "./dist-DE4H3J9W.js";
import { getErrorMessage } from "./resolve-core-CZPH91No.js";
import { clamp$1 as clamp, round } from "./src-2eX6lIN8.js";
import "./src-BnNr7xTX.js";
import { Empty, Empty$1, EmptyPositioned, Placeholder, PlaceholderPositioned, cardinal, getPointParameter, guard, isPlaceholder, isPlaceholder$1, multiply, subtract } from "./src-CURfSkGx.js";
import { shortGuid } from "./bezier-5SBfGcNj.js";

//#region ../dom/src/resolve-el.ts
/**
* Resolves either a string or HTML element to an element.
* Useful when an argument is either an HTML element or query.
*
* ```js
* resolveEl(`#someId`);
* resolveEl(someElement);
* ```
* @param domQueryOrEl
* @returns
*/
const resolveEl = (domQueryOrEl) => {
	const r = resolveElementTry(domQueryOrEl);
	if (r.success) return r.value;
	throw resultToError(r);
};
/**
* Tries to resolve a query, returning a `Result`.
* 
* ```js
* const { success, value, error } = resolveElementTry(`#some-element`);
* if (success) {
*  // Do something with value
* } else {
*  console.error(error);
* }
* ```
* @param domQueryOrEl 
* @returns 
*/
const resolveElementTry = (domQueryOrEl) => {
	if (typeof domQueryOrEl === `string`) {
		const d = document.querySelector(domQueryOrEl);
		if (d === null) {
			const error = domQueryOrEl.startsWith(`#`) ? `Query '${domQueryOrEl}' did not match anything. Try '#id', 'div', or '.class'` : `Query '${domQueryOrEl}' did not match anything. Did you mean '#${domQueryOrEl}?`;
			return {
				success: false,
				error
			};
		}
		domQueryOrEl = d;
	} else if (domQueryOrEl === null) return {
		success: false,
		error: `Param 'domQueryOrEl' is null, cannot resolve.`
	};
	else if (domQueryOrEl === void 0) return {
		success: false,
		error: `Param 'domQueryOrEl' is undefined`
	};
	const el$1 = domQueryOrEl;
	return {
		success: true,
		value: el$1
	};
};
/**
* Returns a set of elements.
* 
* Returns an empty list if `selectors` is undefined or null.
* 
* @param selectors 
* @returns 
*/
const resolveEls = (selectors) => {
	if (selectors === void 0) return [];
	if (selectors === null) return [];
	if (Array.isArray(selectors)) return selectors;
	if (typeof selectors === `string`) {
		const elements = [...document.querySelectorAll(selectors)];
		return elements;
	}
	return [selectors];
};

//#endregion
//#region ../dom/src/data-table.ts
var data_table_exports = {};
__export(data_table_exports, {
	fromList: () => fromList,
	fromObject: () => fromObject
});
var import_dist$1 = __toESM(require_dist(), 1);
const padding = (v, options) => {
	if (options.leftPadding) {
		if (v.length < options.leftPadding) return "&nbsp;".repeat(options.leftPadding - v.length) + v;
	}
	return v;
};
const convertNumber = (v, o) => {
	v = o.roundNumbers !== void 0 ? round(o.roundNumbers, v) : v;
	let asString = o.precision !== void 0 ? v.toFixed(o.precision) : v.toString();
	asString = padding(asString.toString(), o);
	return asString;
};
const toHtmlSimple = (v, options) => {
	if (v === null) return `(null)`;
	if (v === void 0) return `(undefined)`;
	if (typeof v === `boolean`) return v ? `true` : `false`;
	if (typeof v === `string`) return `"${v}"`;
	if (typeof v === `number`) return convertNumber(v, options.numbers);
	if (typeof v === `object`) return toTableSimple(v, options);
	return import_dist$1.default.stringify(v);
};
const toTableSimple = (v, options) => {
	let html = `<div style="display:grid; grid-template-columns: repeat(2, 1fr)">`;
	for (const entry of Object.entries(v)) {
		const value = toHtmlSimple(entry[1], options);
		html += `<div class="label" style="display:table-cell">${entry[0]}</div>
      <div class="data" style="display:table-cell">${value}</div>`;
	}
	html += `</div>`;
	return html;
};
/**
* Creates a table of data points for each object in the map
* ```
* const t = DataTable.fromList(parentEl, map);
* t.update(newMap);
* ```
*/
const fromList = (parentOrQuery, data) => {
	const parent = resolveEl(parentOrQuery);
	let container = document.createElement(`DIV`);
	parent.append(container);
	const options = {
		numbers: {},
		objectsAsTables: true
	};
	const remove = () => {
		if (!container) return false;
		container.remove();
		container = void 0;
		return true;
	};
	const update = (data$1) => {
		const seenTables = /* @__PURE__ */ new Set();
		for (const [key, value] of data$1) {
			const tKey = `table-${key}`;
			seenTables.add(tKey);
			let t = parent.querySelector(`#${tKey}`);
			if (t === null) {
				t = document.createElement(`table`);
				if (!t) throw new Error(`Could not create table element`);
				t.id = tKey;
				parent.append(t);
			}
			updateElement(t, value, options);
		}
		const tables = Array.from(parent.querySelectorAll(`table`));
		for (const t of tables) if (!seenTables.has(t.id)) t.remove();
	};
	if (data) update(data);
	return {
		update,
		remove
	};
};
/**
* Updates the given table element so each entry in the map is a
* row in the table.
*
* Rows are keyed by the map key. Rows with keys not found in the map are deleted.
* @param t Table
* @param data Map of data
* @param options Options
* @returns
*/
const updateElement = (t, data, options) => {
	const numberFormatting = options.numbers ?? {};
	const idPrefix = options.idPrefix ?? ``;
	const objectsAsTables = options.objectsAsTables ?? false;
	if (data === void 0) {
		t.innerHTML = ``;
		return;
	}
	const seenRows = /* @__PURE__ */ new Set();
	for (const [key, value] of Object.entries(data)) {
		const domKey = `${idPrefix}-row-${key}`;
		seenRows.add(domKey);
		let rowEl = t.querySelector(`tr[data-key='${domKey}']`);
		if (rowEl === null) {
			rowEl = document.createElement(`tr`);
			t.append(rowEl);
			rowEl.setAttribute(`data-key`, domKey);
			const keyEl = document.createElement(`td`);
			keyEl.textContent = key;
			keyEl.classList.add(`label`);
			rowEl.append(keyEl);
		}
		let valEl = rowEl.querySelector(`td[data-key='${domKey}-val']`);
		if (valEl === null) {
			valEl = document.createElement(`td`);
			valEl.classList.add(`data`);
			valEl.setAttribute(`data-key`, `${domKey}-val`);
			rowEl.append(valEl);
		}
		let valueHTML;
		if (options.formatter) valueHTML = options.formatter(value, key);
		if (valueHTML === void 0) if (typeof value === `object`) valueHTML = objectsAsTables ? toTableSimple(value, options) : import_dist$1.default.stringify(value);
		else if (typeof value === `number`) valueHTML = convertNumber(value, numberFormatting);
		else if (typeof value === `boolean`) valueHTML = value ? `true` : `false`;
		else if (typeof value === `string`) valueHTML = `"${value}"`;
		else valueHTML = JSON.stringify(value);
		valEl.innerHTML = valueHTML;
	}
	const rows = Array.from(t.querySelectorAll(`tr`));
	for (const r of rows) {
		const key = r.getAttribute(`data-key`);
		if (!seenRows.has(key)) r.remove();
	}
};
/**
* Creates a HTML table where each row is a key-value pair from `data`.
* First column is the key, second column data.
*
* ```js
* const dt = fromObject(`#hostDiv`);
* ```
*
* `dt` is a function to call when you want to update data:
*
* ```js
* dt({
*  name: `Blerg`,
*  height: 120
* });
* ```
*/
const fromObject = (parentOrQuery, data, opts = {}) => {
	const parent = resolveEl(parentOrQuery);
	const idPrefix = opts.idPrefix ?? Math.floor(Math.random() * 1e3).toString();
	const options = {
		numbers: {},
		objectsAsTables: true,
		idPrefix: ``,
		...opts
	};
	let t = document.createElement(`table`);
	parent.append(t);
	const remove = () => {
		if (!t) return false;
		t.remove();
		t = void 0;
		return true;
	};
	if (data) updateElement(t, data, options);
	const update = (d) => {
		if (!t) throw new Error(`Table disposed`);
		updateElement(t, d, {
			...options,
			idPrefix
		});
	};
	return {
		remove,
		update
	};
};

//#endregion
//#region ../dom/src/drag-drop.ts
var drag_drop_exports = {};
__export(drag_drop_exports, { draggable: () => draggable });
const draggable = (elemOrQuery, listener, options = {}) => {
	const elem = resolveEl(elemOrQuery);
	/**
	* Viewport location at drag start
	*/
	let initialPointerPosition = Placeholder;
	let token;
	const autoTranslate = options.autoTranslate ?? false;
	const quickDrag = options.quickDrag ?? false;
	const fence = options.fence ? resolveEl(options.fence) : void 0;
	const fenceViewport = options.fenceViewport;
	let fenceOffset = PlaceholderPositioned;
	const relativePosition = window.getComputedStyle(elem).position === `relative`;
	const onParentClick = () => {
		const selected = elem.classList.contains(`drag-sel`);
		if (selected) elem.classList.remove(`drag-sel`);
	};
	const onElementClick = (event) => {
		const selected = elem.classList.contains(`drag-sel`);
		if (selected) elem.classList.remove(`drag-sel`);
		else elem.classList.add(`drag-sel`);
		event.stopPropagation();
	};
	elem.ownerDocument.addEventListener(`click`, onParentClick);
	elem.addEventListener(`click`, onElementClick);
	const dragCleanup = () => {
		elem.classList.remove(`drag-progress`);
		elem.ownerDocument.removeEventListener(`pointermove`, onPointerMove);
		elem.ownerDocument.removeEventListener(`pointerup`, onPointerUp);
		elem.ownerDocument.removeEventListener(`pointercancel`, onDragCancel);
	};
	const dispose = () => {
		if (elem.classList.contains(`drag-progress`)) onDragCancel(void 0, `dispose`);
		else dragCleanup();
		elem.ownerDocument.removeEventListener(`click`, onParentClick);
		elem.removeEventListener(`click`, onElementClick);
	};
	const validateOffsetAndPoint = (offset, x, y) => {
		if (!isPlaceholder(fenceOffset)) {
			offset = {
				x: clamp(offset.x, fenceOffset.x, fenceOffset.width),
				y: clamp(offset.y, fenceOffset.y, fenceOffset.height)
			};
			if (fenceViewport) {
				x = clamp(x, fenceViewport.x, fenceViewport.x + fenceViewport.width);
				y = clamp(y, fenceViewport.y, fenceViewport.y + fenceViewport.height);
			}
		}
		return [offset, {
			x,
			y
		}];
	};
	let lastMoveOffset = Empty;
	const onPointerMove = (moveEvent) => {
		moveEvent.preventDefault();
		moveEvent.stopPropagation();
		const { x, y } = moveEvent;
		let offset = isPlaceholder$1(initialPointerPosition) ? {
			x: moveEvent.offsetX,
			y: moveEvent.offsetY
		} : {
			x: x - initialPointerPosition.x,
			y: y - initialPointerPosition.y
		};
		const r = validateOffsetAndPoint(offset, x, y);
		offset = r[0];
		const state = {
			delta: offset,
			initial: initialPointerPosition,
			token,
			viewport: r[1]
		};
		if (typeof listener.progress !== `undefined`) {
			const p = listener.progress(state);
			if (p.abort) {
				onDragCancel(void 0, `discontinued`);
				return;
			}
			if (p.viewport) offset = {
				x: p.viewport.x - initialPointerPosition.x,
				y: p.viewport.y - initialPointerPosition.y
			};
		}
		lastMoveOffset = offset;
		if (autoTranslate) {
			const offsetX = offset.x;
			const offsetY = offset.y;
			elem.style.translate = `${offsetX}px ${offsetY}px`;
		}
	};
	const onPointerUp = (upEvent) => {
		const bounds = elem.getBoundingClientRect();
		dragCleanup();
		const { x, y } = upEvent;
		const r = validateOffsetAndPoint(lastMoveOffset, x, y);
		const state = {
			initial: initialPointerPosition,
			token,
			delta: r[0],
			viewport: r[1]
		};
		if (autoTranslate) {
			elem.style.translate = `none`;
			if (relativePosition) {
				const parent = elem.parentElement?.getBoundingClientRect();
				elem.style.left = `${bounds.x - parent.left}px`;
				elem.style.top = `${bounds.y - parent.top}px`;
			} else {
				elem.style.left = `${bounds.x}px`;
				elem.style.top = `${bounds.y}px`;
			}
		}
		if (typeof listener.success !== `undefined`) listener.success(state);
	};
	const onDragCancel = (event, reason = `pointercancel`) => {
		dragCleanup();
		let viewport = Placeholder;
		if (event && `x` in event && `y` in event) viewport = {
			x: event.x,
			y: event.y
		};
		const state = {
			token,
			initial: initialPointerPosition,
			delta: {
				x: -1,
				y: -1
			},
			viewport
		};
		if (typeof listener.abort !== `undefined`) listener.abort(reason, state);
	};
	elem.addEventListener(`pointerdown`, (event) => {
		const selected = elem.classList.contains(`drag-sel`);
		if (!selected && !quickDrag) return;
		const event_ = event;
		initialPointerPosition = {
			x: event_.x,
			y: event_.y
		};
		const s = typeof listener.start === `undefined` ? {
			allow: true,
			token
		} : listener.start();
		if (!s.allow) return;
		token = s.token;
		if (fence) {
			const fenceBounds = fence.getBoundingClientRect();
			fenceOffset = {
				x: fenceBounds.x - initialPointerPosition.x,
				y: fenceBounds.y - initialPointerPosition.y,
				width: fenceBounds.x + fenceBounds.width - initialPointerPosition.x,
				height: fenceBounds.y + fenceBounds.height - initialPointerPosition.y
			};
		} else if (fenceViewport) fenceOffset = {
			x: fenceViewport.x - initialPointerPosition.x,
			y: fenceViewport.y - initialPointerPosition.y,
			width: fenceViewport.width + fenceViewport.x - initialPointerPosition.x,
			height: fenceViewport.height + fenceViewport.y - initialPointerPosition.y
		};
		elem.classList.add(`drag-progress`);
		elem.ownerDocument.addEventListener(`pointermove`, onPointerMove);
		elem.ownerDocument.addEventListener(`pointerup`, onPointerUp);
		elem.ownerDocument.addEventListener(`pointercancel`, onDragCancel);
	});
	return dispose;
};

//#endregion
//#region ../dom/src/forms.ts
var forms_exports = {};
__export(forms_exports, {
	button: () => button,
	buttonCreate: () => buttonCreate,
	checkbox: () => checkbox,
	numeric: () => numeric,
	select: () => select,
	textAreaKeyboard: () => textAreaKeyboard
});
/**
* Adds tab and shift+tab to TEXTAREA
* @param el
*/
const textAreaKeyboard = (el$1) => {
	el$1.addEventListener(`keydown`, (event) => {
		const elementValue = el$1.value;
		const start = el$1.selectionStart;
		const end = el$1.selectionEnd;
		if (event.key === `Tab` && event.shiftKey) {
			if (el$1.value.substring(start - 2, start) === `  `) el$1.value = elementValue.slice(0, Math.max(0, start - 2)) + elementValue.slice(Math.max(0, end));
			el$1.selectionStart = el$1.selectionEnd = start - 2;
			event.preventDefault();
			return false;
		} else if (event.key === `Tab`) {
			el$1.value = elementValue.slice(0, Math.max(0, start)) + `  ` + elementValue.slice(Math.max(0, end));
			el$1.selectionStart = el$1.selectionEnd = start + 2;
			event.preventDefault();
			return false;
		}
	});
};
/**
* Quick access to <input type="checkbox"> value.
* Provide a checkbox by string id or object reference. If a callback is
* supplied, it will be called when the checkbox changes value.
*
* ```
* const opt = checkbox(`#chkMate`);
* opt.checked; // Gets/sets
*
* const opt = checkbox(document.getElementById(`#chkMate`), newVal => {
*  if (newVal) ...
* });
* ```
* @param {(string | HTMLInputElement)} domIdOrEl
* @param {(currentVal:boolean) => void} [onChanged]
* @returns
*/
const checkbox = (domIdOrEl, onChanged) => {
	const el$1 = resolveEl(domIdOrEl);
	if (onChanged) el$1.addEventListener(`change`, () => {
		onChanged(el$1.checked);
	});
	return {
		get checked() {
			return el$1.checked;
		},
		set checked(value) {
			el$1.checked = value;
		}
	};
};
/**
* Numeric INPUT
*
* ```
* const el = numeric(`#num`, (currentValue) => {
*  // Called when input changes
* })
* ```
*
* Get/set value
* ```
* el.value = 10;
* ```
* @param domIdOrEl
* @param onChanged
* @param live If true, event handler fires based on `input` event, rather than `change`
* @returns
*/
const numeric = (domIdOrEl, onChanged, live) => {
	const el$1 = resolveEl(domIdOrEl);
	const eventName = live ? `change` : `input`;
	if (onChanged) el$1.addEventListener(eventName, () => {
		onChanged(Number.parseInt(el$1.value));
	});
	return {
		get value() {
			return Number.parseInt(el$1.value);
		},
		set value(value) {
			el$1.value = value.toString();
		}
	};
};
/**
* Button
*
* ```
* const b = button(`#myButton`, () => {
*  console.log(`Button clicked`);
* });
* ```
*
* ```
* b.click(); // Call the click handler
* b.disabled = true / false;
* ```
* @param domQueryOrEl Query string or element instance
* @param onClickHandler Callback when button is clicked
* @returns
*/
const button = (domQueryOrEl, onClickHandler) => {
	const el$1 = resolveEl(domQueryOrEl);
	const addEvent = () => {
		if (onClickHandler) el$1.addEventListener(`click`, onClickHandler);
	};
	const removeEvent = () => {
		if (onClickHandler) el$1.removeEventListener(`click`, onClickHandler);
	};
	addEvent();
	return {
		get title() {
			return el$1.textContent;
		},
		set title(value) {
			el$1.textContent = value;
		},
		dispose(deleteElement = false) {
			removeEvent();
			if (deleteElement) el$1.remove();
		},
		onClick(handler) {
			removeEvent();
			onClickHandler = handler;
			addEvent();
		},
		click() {
			if (onClickHandler) onClickHandler();
		},
		set disabled(value) {
			el$1.disabled = value;
		},
		get el() {
			return el$1;
		}
	};
};
/**
* Creates a BUTTON element, wrapping it via {@link button} and returning it.
* ```js
* const b = buttonCreate(`Stop`, () => console.log(`Stop`));
* someParent.addNode(b.el);
* ```
* @param title 
* @param onClick 
* @returns 
*/
const buttonCreate = (title, onClick) => {
	const el$1 = document.createElement(`button`);
	const w = button(el$1, onClick);
	w.title = title;
	return w;
};
/**
* SELECT element.
*
* Handle changes in value:
* ```
* const mySelect = select(`#mySelect`, (newValue) => {
*  console.log(`Value is now ${newValue}`);
* });
* ```
*
* Enable/disable:
* ```
* mySelect.disabled = true / false;
* ```
*
* Get currently selected index or value:
* ```
* mySelect.value / mySelect.index
* ```
*
* Is the currently selected value a placeholder?
* ```
* mySelect.isSelectedPlaceholder
* ```
*
* Set list of options
* ```
* // Adds options, preselecting `opt2`.
* mySelect.setOpts([`opt1`, `opt2 ...], `opt2`);
* ```
*
* Select an element
* ```
* mySelect.select(1); // Select second item
* mySelect.select(1, true); // If true is added, change handler fires as well
* ```
* @param domQueryOrEl Query (eg `#id`) or element
* @param onChanged Callback when a selection is made
* @param options Options
* @return
*/
const select = (domQueryOrEl, onChanged, options = {}) => {
	const el$1 = resolveEl(domQueryOrEl);
	const { placeholderOpt, shouldAddChoosePlaceholder = false, autoSelectAfterChoice = -1 } = options;
	const change = () => {
		if (onChanged !== void 0) onChanged(el$1.value);
		if (autoSelectAfterChoice >= 0) el$1.selectedIndex = autoSelectAfterChoice;
	};
	if (onChanged) el$1.addEventListener(`change`, (_event) => {
		change();
	});
	return {
		set disabled(value) {
			el$1.disabled = value;
		},
		get value() {
			return el$1.value;
		},
		get index() {
			return el$1.selectedIndex;
		},
		get isSelectedPlaceholder() {
			return (shouldAddChoosePlaceholder || options.placeholderOpt !== void 0) && el$1.selectedIndex === 0;
		},
		setOpts(opts, preSelect) {
			el$1.options.length = 0;
			if (shouldAddChoosePlaceholder) opts = [`-- Choose --`, ...opts];
			else if (placeholderOpt !== void 0) opts = [placeholderOpt, ...opts];
			let toSelect = 0;
			for (const [index, o] of opts.entries()) {
				const optEl = document.createElement(`option`);
				optEl.value = o;
				optEl.innerHTML = o;
				if (preSelect !== void 0 && o === preSelect) toSelect = index;
				el$1.options.add(optEl);
			}
			el$1.selectedIndex = toSelect;
		},
		select(index = 0, trigger = false) {
			el$1.selectedIndex = index;
			if (trigger && onChanged) change();
		}
	};
};

//#endregion
//#region ../dom/src/ts-util.ts
function isHtmlElement(o) {
	return typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
}

//#endregion
//#region ../dom/src/css-variables.ts
/**
* Parses input in the form of: `['elementid-attribute', 'default-value']`.
* Eg, `['indicator-fill', 'gray']` will yield:
* ```
* { variable: `indicator-fill`, attribute: `fill`, id: `indicator`, defaultValue: `gray` }
* ```
* 
* Once parsed, use {@link setFromCssVariables} to apply data.
* 
* ```js
* // Array of arrays is treated as a set of key-value pairs
* const options = [ [`indicator-fill`, `gray`], [`backdrop-fill`, `whitesmoke`] ]
* const attrs = parseCssVariablesAsAttributes(options);
* Yields:
* [
*  { variable: `indicator-fill`, attribute: `fill`, id: `indicator`, defaultValue: `gray` }
*  { variable: `backdrop-fill`, attribute: `fill`, id: `backdrop`, defaultValue: `whitesmoke` }
* ]
* 
* // Assign
* setFromCssVariables(document.body, attrs);
* ```
* @param options 
* @returns 
*/
const parseCssVariablesAsAttributes = (options) => {
	return options.map((opt) => {
		let defaultValue;
		if (Array.isArray(opt)) {
			defaultValue = opt[1];
			opt = opt[0];
		}
		const dash = opt.indexOf(`-`);
		if (dash < 0) throw new Error(`Simple expression expects form of: 'elementid-attribute'`);
		return {
			variable: opt,
			attribute: opt.slice(dash + 1),
			id: opt.slice(0, dash),
			defaultValue
		};
	});
};
/**
* Reads the value of a CSS variable and assign it to HTML attributes or object field.
* 
* ```js
* const options = [
*  // Set the 'width' attribute to the value of --some-css-variable to all elements with class 'blah'
*  { query: `.blah`, variable: `some-css-variable`, attribute: `width` }
* 
*  // Set #blah's 'size' attribute to the value of css variable '--size'
*  { id: 'blah', variable: 'size', attribute: 'size' }
* 
*  // Sets someEL.blah = css variable '--hue'
*  { element: someEl, variable: `hue`, field: `blah` }
* ]
* 
* setFromCssVariables(document.body, ...options);
* ```
* 
* The first parameter is the context for which CSS variable values are fetched
* as well as for resolving query selectors. This can usually be `document.body`.
* @param context Context element which is needed for relative querying. Otherwise use document.body
* @param options Details of what to do
*/
const setFromCssVariables = (context, ...options) => {
	const contextEl = resolveEl(context);
	const style = window.getComputedStyle(contextEl);
	for (const opt of options) {
		const variable = afterMatch(opt.variable, `--`);
		let v = style.getPropertyValue(`--${variable}`);
		if (v === null || v.length === 0) if (opt.defaultValue === void 0) continue;
		else v = opt.defaultValue;
		let query$1;
		let els;
		if (`query` in opt && opt.query !== void 0) query$1 = opt.query;
		else if (`id` in opt && opt.id !== void 0) query$1 = `#${opt.id}`;
		else if (`object` in opt && opt.object !== void 0) els = Array.isArray(opt.object) ? opt.object : [opt.object];
		if (query$1 === void 0) {
			if (els === void 0) throw new Error(`Missing 'query', 'id' or 'object' fields`);
		} else els = [...contextEl.querySelectorAll(query$1)];
		if (els === null) continue;
		if (els === void 0) continue;
		if (opt.attribute) for (const el$1 of els) if (isHtmlElement(el$1)) el$1.setAttribute(opt.attribute, v);
		else throw new Error(`Trying to set an attribute on something not a HTML element`, { cause: el$1 });
		else if (opt.field) for (const el$1 of els) if (typeof el$1 === `object`) el$1[opt.field] = v;
		else throw new Error(`Trying to set field on something that is not an object (${typeof el$1})`, { cause: el$1 });
		else throw new Error(`Neither 'attribute' or 'field' to set is defined in option (${JSON.stringify(opt)})`);
	}
};
/**
* Computes the styles for `elt` (or defaults to document.body) using `fallback`
* as a set of default values.
* 
* ```js
* // Fetch styles
* const styles = getCssVariablesWithFallback({
*  my_var: `red` // reads CSS variable '--my-var' 
* }, element);
* 
* // Access --my-var, or if it doesn't exist returns 'red'
* styles.my_var;
* ```
* 
* Hyphen case (eg 'my-var') is a common way of delimiting words in CSS variables, but 
* can't be (elegantly) used in object properties. Instead, use '_' in the
* object key, which is replaced with '-'.
* 
* The leading '--' is not needed either.
* @param fallback 
* @param elt 
* @returns 
*/
function getCssVariablesWithFallback(fallback, elt) {
	const styles = getComputedStyle(elt ?? document.body);
	const entries = Object.entries(fallback);
	const filledEntries = entries.map((entry) => {
		return [entry[0], getCssVariablesFromStyles(styles, entry[0], entry[1])];
	});
	return Object.fromEntries(filledEntries);
}
/**
* Returns the value of a CSS variable. If it is no defined, returns `fallbackValue`;
* ```js
* // Returns the value of --fg, or 'white' otherwise
* getCssVariable(`--fg`, `white`);
* ```
* 
* `--` prefix can be omitted:
* ```js
* getCssVariable(`fg`, `white`);
* ```
* @param cssVariable 
* @param fallbackValue 
* @returns 
*/
function getCssVariable(cssVariable, fallbackValue) {
	if (!cssVariable.startsWith(`--`)) cssVariable = `--${cssVariable}`;
	const fromCss = getComputedStyle(document.body).getPropertyValue(cssVariable).trim();
	if (fromCss.length === 0) return fallbackValue;
	return fromCss;
}
/**
* Sets CSS variables using an object.
* 
* ```js
* const vars = {
*  my_var: `red`,
*  my_size: 10
* }
* 
* // Set to document.body
* setCssVariables(vars);
* 
* // Set to an element
* setCssVariables(vars, elem);
* 
* // Or to a CSSStyleDeclaration
* setCssVariables(vars, styles);
* ```
* 
* @param variables 
* @param stylesOrEl 
*/
function setCssVariables(variables, stylesOrEl) {
	const styles = stylesOrEl === void 0 ? document.body.style : isHtmlElement(stylesOrEl) ? stylesOrEl.style : stylesOrEl;
	for (const [key, value] of Object.entries(variables)) {
		let variableName = key.replaceAll("_", "-");
		if (!variableName.startsWith(`--`)) variableName = `--` + variableName;
		styles.setProperty(variableName, value.toString());
	}
}
/**
* Returns a CSS variable from a CSS style declaration, or returning `fallback`.
* ```js
* // These will all access --my-var
* getCssVariablesFromStyles(getComputedStyle(element), `--my-var`, `red`);
* getCssVariablesFromStyles(getComputedStyle(element), `my-var`, `red`);
* getCssVariablesFromStyles(getComputedStyle(element), `my_var`, `red`);
* ```
* @param styles 
* @param name 
* @param fallback 
* @returns 
*/
function getCssVariablesFromStyles(styles, name, fallback) {
	if (!name.startsWith(`--`)) name = `--` + name;
	name = name.replaceAll(`_`, `-`);
	const v = styles.getPropertyValue(name);
	if (v.length === 0) return fallback;
	if (typeof fallback === `number`) return parseFloat(v);
	if (typeof fallback === `boolean`) {
		if (v === `true`) return true;
		else if (v === `false`) return false;
	}
	return v;
}

//#endregion
//#region ../dom/src/css.ts
/**
* Returns the value of `getBoundingClientRect` plus the width of all the borders
* @param elOrQuery 
* @returns 
*/
const getBoundingClientRectWithBorder = (elOrQuery) => {
	let el$1 = resolveEl(elOrQuery);
	const size = el$1.getBoundingClientRect();
	if (el$1 instanceof SVGElement) el$1 = el$1.parentElement;
	const border = getComputedPixels(el$1, `borderTopWidth`, `borderLeftWidth`, `borderRightWidth`, `borderBottomWidth`);
	return {
		x: size.x,
		y: size.y,
		width: size.width + border.borderLeftWidth + border.borderRightWidth,
		height: size.height + border.borderTopWidth + border.borderBottomWidth
	};
};
/**
* Returns the computed measurements of CSS properties via [getComputedStyle](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).
* 
* ```js
* const v = getComputedPixels(`#some-el`, `borderTopWidth`, `borderLeftWidth`);
* v.borderTopWidth;  // number
* b.borderLeftWidth; // number
* ```
* 
* Throws an error if value from `getComputedStyle` is not a string or does not end in 'px'.
* @param elOrQuery 
* @param properties 
* @returns 
*/
const getComputedPixels = (elOrQuery, ...properties) => {
	const s = getComputedStyle(resolveEl(elOrQuery));
	const returnValue = {};
	for (const property of properties) {
		const v = s[property];
		if (typeof v === `string`) if (v.endsWith(`px`)) returnValue[property] = Number.parseFloat(v.substring(0, v.length - 2));
		else throw new Error(`Property '${String(property)}' does not end in 'px'. Value: ${v}`);
		else throw new Error(`Property '${String(property)}' is not type string. Got: ${typeof v} Value: ${v}`);
	}
	return returnValue;
};
/**
* If `value` is _true_, the provided CSS class is added to element(s), otherwise it is removed.
* 
* ```js
* setClass(`#someId`, true, `activated`); // Add 'activated'
* setClass(`#someId`, false, `activated`); // Removes 'activated'
* ```
* 
* @param selectors 
* @param value 
* @param cssClass 
* @returns 
*/
const setCssClass = (selectors, value, cssClass) => {
	const elements = resolveEls(selectors);
	if (elements.length === 0) return;
	for (const element of elements) if (value) element.classList.add(cssClass);
	else element.classList.remove(cssClass);
};
/**
* Toggles a CSS class on all elements that match selector.
* 
* ```js
* setCssToggle(`span`, `activated`); // Toggles the 'activated' class on all SPAN elements
* ```
* 
* Uses `HTMLElement.classList.toggle`
* @param selectors 
* @param cssClass 
* @returns 
*/
const setCssToggle = (selectors, cssClass) => {
	const elements = resolveEls(selectors);
	if (elements.length === 0) return;
	for (const element of elements) element.classList.toggle(cssClass);
};
/**
* Sets the CSS 'display' property
* 
* ```js
* setCssDisplay(`span`, `block`); // Sets display:block for all spans
* ```
* 
* @param selectors 
* @param value 
* @returns 
*/
const setCssDisplay = (selectors, value) => {
	const elements = resolveEls(selectors);
	if (elements.length === 0) return;
	for (const element of elements) element.style.display = value;
};

//#endregion
//#region ../dom/src/data-display.ts
/**
* Creates a simple display for data. Designed to show ixfx state data
* 
* ```js
* // Create once
* const display = new DataDisplay();
* 
* // Call .update to show state
* display.update(state);
* ```
*/
var DataDisplay = class {
	dataTable;
	/**
	* Constructor
	* @param options Options
	*/
	constructor(options = {}) {
		const theme = options.theme ?? `dark`;
		const existing = document.querySelector(`#ixfx-data-display`);
		if (existing !== null) throw new Error(`DataDisplay already loaded on this page`);
		const container = document.createElement(`div`);
		container.id = `ixfx-data-display`;
		container.classList.add(`theme-${theme}`);
		const css = document.createElement(`style`);
		css.textContent = `
    #ixfx-data-display {
      background: white;
      color: black;
      border: 2px solid hsl(0deg 0.61% 90%);
      border-radius: 4px;
      z-index: 1000;
      opacity: 40%;
      padding: 1em;
      font-family: monospace;
      position: fixed;
      right: 1em;
      top: 1em;
    }
    #ixfx-data-display.theme-dark {
      background: black;
      color: white;
      border: 2px solid hsl(0deg 0.61% 10%);
    }
    #ixfx-data-display:hover {
      opacity: 100%;
    }
    #ixfx-data-display table {
      border-collapse: collapse;
    }
    #ixfx-data-display tr:not(:last-child) {
      border-bottom: 2px solid hsl(0deg 0.61% 90%);
    }
    #ixfx-data-display.dark tr:not(:last-child) {
      border-bottom: 2px solid hsl(0deg 0.61% 10%);
    }
    #ixfx-data-display td {
      padding-bottom: 0.4em;
      padding-top: 0.4em;
    }
    #ixfx-data-display .label {
      color: hsl(0deg 0.61% 60%);
      text-align: right;
      padding-right: 0.5em;
    }
    #ixfx-data-display.theme-dark .label {
      color: gray;
    }
    `;
		container.style.display = `inline-block`;
		document.body.append(css);
		document.body.append(container);
		this.dataTable = fromObject(container, void 0, {
			objectsAsTables: true,
			...options
		});
	}
	update(data) {
		this.dataTable.update(data);
	}
};

//#endregion
//#region ../dom/src/set-property.ts
function setText(selectors, value) {
	return setProperty(`textContent`, selectors, value);
}
/**
* Sets the innerHTML of an element.
* 
* ```js
* setHtml(`#some-el`, `<b>hello</b>`);
* ```
* @param selectors 
* @param value 
* @returns 
*/
function setHtml(selectors, value) {
	return setProperty(`innerHTML`, selectors, value);
}
/**
* Sets some property on an element
* 
* ```js
* setProperty(`width`, `canvas`, 100); // Set the width property to 100
* ```
* 
* If `value` is an object, converts to JSON first.
* @param property 
* @param selectors 
* @param value 
* @returns 
*/
function setProperty(property, selectors, value) {
	let elements = [];
	const set = (v) => {
		const typ = typeof v;
		const vv = typ === `string` || typ === `number` || typ === `boolean` ? v : JSON.stringify(v);
		if (elements.length === 0) elements = resolveEls(selectors);
		for (const element of elements) element[property] = vv;
		return vv;
	};
	return value === void 0 ? set : set(value);
}

//#endregion
//#region ../dom/src/el.ts
/**
* Returns an object with handy functions for working on/against the provided selector.
* 
* ```js
* const e = el(`#my-element`);
* e.text(`hello`);           // Set the inner text of the elemenet
* e.cssDisplay(`block`);    // Sets display:block
* e.cssToggle(`activated`);  // Toggles the 'activated' CSS class
* e.cssClass(true, `activated`); // Turns on the 'activated' CSS class
* e.el();                    // Returns the HTML Element
* ```
* 
* The selector is only queried when created. Use {@link elRequery} to continually
* re-query the selector before each operation. 
* 
* @param selectors 
* @returns 
*/
const el = (selectors) => {
	const elements = resolveEls(selectors);
	const text = setText(elements);
	const html = setHtml(elements);
	return {
		text,
		html,
		cssDisplay: (value) => {
			setCssDisplay(elements, value);
		},
		cssClass: (value, cssClass) => {
			setCssClass(elements, value, cssClass);
		},
		cssToggle: (cssClass) => {
			setCssToggle(elements, cssClass);
		},
		el: () => elements[0],
		els: () => elements
	};
};
const elRequery = (selectors) => ({
	text: (value) => setText(selectors, value),
	html: (value) => setHtml(selectors, value),
	cssDisplay: (value) => {
		setCssDisplay(selectors, value);
	},
	cssClass: (value, cssClass) => {
		setCssClass(selectors, value, cssClass);
	},
	cssToggle: (cssClass) => {
		setCssToggle(selectors, cssClass);
	},
	el: () => resolveEl(selectors),
	els: () => resolveEls(selectors)
});

//#endregion
//#region ../dom/src/internal/debounce.ts
const debounce = (callback, interval) => {
	let timer;
	const ms = intervalToMs(interval, 100);
	return () => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(callback, ms);
	};
};

//#endregion
//#region ../dom/src/element-sizing.ts
/**
* Consider using static methods:
* 
* ```js
* // Resize an <SVG> element to match viewport
* Dom.ElementSizer.svgViewport(svg);
* 
* // Resize canvas to match its parent
* Dom.ElementSizer.canvasParent(canvas);
* 
* // Resize canvas to match viewport
* Dom.ElementSizer.canvasViewport(canvas);
* ```
*/
var ElementSizer = class ElementSizer {
	#stretch;
	#size;
	#naturalSize;
	#naturalRatio;
	#viewport;
	#onSizeChanging = (size, el$1) => {	/** no-op */};
	#el;
	#containerEl;
	#disposed = false;
	#resizeObservable;
	#sizeDebounce = () => ({});
	constructor(elOrQuery, options) {
		this.#el = resolveEl(elOrQuery);
		const container = options.containerEl;
		if (container === null || typeof container === `undefined`) {
			const pe = this.#el.parentElement;
			if (pe !== null) this.#containerEl = pe;
			else {
				const pn = this.#el.parentNode;
				if (pn !== null) this.#containerEl = pn;
			}
		} else if (typeof container === `string` || typeof container === `object`) this.#containerEl = resolveEl(container);
		this.#stretch = options.stretch ?? `none`;
		this.#onSizeChanging = options.onSizeChanging;
		this.#size = Empty$1;
		const onSizeDone = options.onSizeDone;
		if (typeof onSizeDone !== `undefined`) this.#sizeDebounce = debounce(() => {
			onSizeDone(this.size, this.#el);
		}, options.debounceTimeout);
		let naturalSize = options.naturalSize;
		naturalSize ??= this.#el.getBoundingClientRect();
		this.#naturalRatio = 1;
		this.#naturalSize = naturalSize;
		this.setNaturalSize(naturalSize);
		this.#viewport = EmptyPositioned;
		if (this.#containerEl === document.body) this.#byViewport();
		else this.#byContainer();
	}
	dispose(reason) {
		if (this.#disposed) return;
		this.#disposed = true;
		if (this.#resizeObservable) {
			this.#resizeObservable.disconnect();
			this.#resizeObservable = void 0;
		}
	}
	static canvasParent(canvasElementOrQuery, options) {
		const el$1 = resolveEl(canvasElementOrQuery);
		const er = new ElementSizer(el$1, {
			...options,
			onSizeChanging(size, el$2) {
				el$2.width = size.width;
				el$2.height = size.height;
				if (options.onSizeChanging) options.onSizeChanging(size, el$2);
			}
		});
		return er;
	}
	static canvasViewport(canvasElementOrQuery, options) {
		const el$1 = resolveEl(canvasElementOrQuery);
		el$1.style.position = `absolute`;
		el$1.style.zIndex = (options.zIndex ?? 0).toString();
		el$1.style.left = `0px`;
		el$1.style.top = `0px`;
		const opts = {
			...options,
			containerEl: document.body
		};
		return this.canvasParent(canvasElementOrQuery, opts);
	}
	/**
	* Size an SVG element to match viewport
	* @param svg 
	* @returns 
	*/
	static svgViewport(svg, onSizeSet) {
		const er = new ElementSizer(svg, {
			containerEl: document.body,
			stretch: `both`,
			onSizeChanging(size) {
				svg.setAttribute(`width`, size.width.toString());
				svg.setAttribute(`height`, size.height.toString());
				if (onSizeSet) onSizeSet(size);
			}
		});
		return er;
	}
	#byContainer() {
		const c = this.#containerEl;
		if (!c) throw new Error(`No container element`);
		const r = new ResizeObserver((entries) => {
			this.#onParentResize(entries);
		});
		r.observe(c);
		const current = this.#computeSizeBasedOnParent(c.getBoundingClientRect());
		this.size = current;
		this.#resizeObservable = r;
	}
	#byViewport() {
		const r = new ResizeObserver((entries) => {
			this.#onViewportResize();
		});
		r.observe(document.documentElement);
		this.#resizeObservable = r;
		this.#onViewportResize();
	}
	#onViewportResize() {
		this.size = {
			width: window.innerWidth,
			height: window.innerHeight
		};
		this.#viewport = {
			x: 0,
			y: 0,
			...this.size
		};
	}
	/**
	* Sets the 'natural' size of an element.
	* This can also be specified when creating ElementSizer.
	* @param size 
	*/
	setNaturalSize(size) {
		this.#naturalSize = size;
		this.#naturalRatio = size.width / size.height;
	}
	get naturalSize() {
		return this.#naturalSize;
	}
	get viewport() {
		return this.#viewport;
	}
	#computeSizeBasedOnParent(parentSize) {
		let { width, height } = parentSize;
		let stretch = this.#stretch;
		if (stretch === `min`) stretch = width < height ? `width` : `height`;
		else if (stretch === `max`) stretch = width > height ? `width` : `height`;
		if (stretch === `width`) height = width / this.#naturalRatio;
		else if (stretch === `height`) width = height * this.#naturalRatio;
		if (this.#el instanceof HTMLElement) {
			const b = getComputedPixels(this.#el, `borderTopWidth`, `borderLeftWidth`, `borderRightWidth`, `borderBottomWidth`);
			width -= b.borderLeftWidth + b.borderRightWidth;
			height -= b.borderTopWidth + b.borderBottomWidth;
		}
		return {
			width,
			height
		};
	}
	#onParentResize(args) {
		const box = args[0].contentBoxSize[0];
		const parentSize = {
			width: box.inlineSize,
			height: box.blockSize
		};
		this.size = this.#computeSizeBasedOnParent(parentSize);
		this.#viewport = {
			x: 0,
			y: 0,
			width: parentSize.width,
			height: parentSize.height
		};
	}
	set size(size) {
		guard(size, `size`);
		this.#size = size;
		if (this.#onSizeChanging) this.#onSizeChanging(size, this.#el);
		this.#sizeDebounce();
	}
	get size() {
		return this.#size;
	}
};

//#endregion
//#region ../dom/src/error-handler.ts
/**
* Creates an error handler to show errors on-screen.
* This is useful when testing on mobile devices that lack access to the console.
*
* ```js
* const e = defaultErrorHandler();
* ```
*
* Manual control:
* ```js
* const e = defaultErrorHandler();
* e.show(someError);
* e.hide();
* ```
* @returns
*/
const defaultErrorHandler = () => {
	let enabled = true;
	const container = document.createElement(`div`);
	container.style.color = `black`;
	container.style.border = `2px solid red`;
	container.style.backgroundColor = `hsl(0, 80%, 90%)`;
	container.style.padding = `1em`;
	container.style.display = `none`;
	container.style.top = `1em`;
	container.style.left = `1em`;
	container.style.position = `absolute`;
	container.style.fontFamily = `monospace`;
	const messageElement = document.createElement(`div`);
	messageElement.style.maxWidth = `50vw`;
	messageElement.style.maxHeight = `50vh`;
	messageElement.style.overflowY = `scroll`;
	container.innerHTML = `<h1>Error</h1>`;
	container.append(messageElement);
	const styleButton = (b) => {
		b.style.padding = `0.3em`;
		b.style.marginTop = `1em`;
	};
	const buttonClose = document.createElement(`button`);
	buttonClose.textContent = `Close`;
	buttonClose.addEventListener(`click`, () => {
		hide();
	});
	const buttonStop = document.createElement(`button`);
	buttonStop.textContent = `Stop displaying errors`;
	buttonStop.addEventListener(`click`, () => {
		enabled = false;
		hide();
	});
	styleButton(buttonClose);
	styleButton(buttonStop);
	container.append(buttonClose);
	container.append(buttonStop);
	document.body.append(container);
	const show = (ex) => {
		container.style.display = `inline`;
		messageElement.innerHTML += ex.stack ? `<pre>${ex.stack}</pre>` : `<p>${getErrorMessage(ex)}</p>`;
	};
	const hide = () => {
		container.style.display = `none`;
	};
	window.onerror = (message, url, lineNo, colNo, error) => {
		if (enabled) if (error) {
			console.log(error);
			show(error);
		} else {
			console.log(message);
			show(message);
		}
	};
	window.addEventListener(`unhandledrejection`, (event) => {
		console.log(event.reason);
		if (enabled) show(event.reason);
	});
	return {
		show,
		hide
	};
};

//#endregion
//#region ../dom/src/shadow-dom.ts
const addShadowCss = (parentEl, styles) => {
	const styleEl = document.createElement(`style`);
	styleEl.textContent = styles;
	let shadowRoot;
	if (parentEl.shadowRoot) {
		shadowRoot = parentEl.shadowRoot;
		shadowRoot.innerHTML = ``;
	} else shadowRoot = parentEl.attachShadow({ mode: `open` });
	shadowRoot.append(styleEl);
	return shadowRoot;
};

//#endregion
//#region ../dom/src/log.ts
/**
* Allows writing to a DOM element in console.log style. Element grows in size, so use
* something like `overflow-y: scroll` on its parent
*
* ```
* const l = log(`#dataStream`); // Assumes HTML element with id `dataStream` exists
* l.log(`Hi`);
* l.log(); // Displays a horizontal rule
*
* const l = log(document.getElementById(`dataStream`), {
*  timestamp: true,
*  truncateEntries: 20
* });
* l.log(`Hi`);
* l.error(`Some error`); // Adds class `error` to line
* ```
*
* For logging high-throughput streams:
* ```
* // Silently drop log if it was less than 5ms since the last
* const l = log(`#dataStream`, { minIntervalMs: 5 });
*
* // Only the last 100 entries are kept
* const l = log(`#dataStream`, { capacity: 100 });
* ```
*
* @param domQueryOrElement Element or id of element
* @param opts
*/
const log = (domQueryOrElement, opts = {}) => {
	const { capacity = 0, monospaced = true, timestamp = false, collapseDuplicates = true, css = `` } = opts;
	let added = 0;
	let lastLog;
	let lastLogRepeats = 0;
	const parentElement = resolveEl(domQueryOrElement);
	const fontFamily = monospaced ? `Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", Monaco, "Courier New", Courier, monospace` : `normal`;
	const shadowRoot = addShadowCss(parentElement, `
  .log {
    font-family: ${fontFamily};
    background-color: var(--code-background-color);
    padding: var(--padding1, 0.2em);
    overflow-y: auto;
    height:100%;
  }
  .timestamp {
    margin-right: 0.5em;
    opacity: 0.5;
    font-size: 70%;
    align-self: center;
  }
  .line {
    display: flex;
    padding-bottom: 0.1em;
    padding-top: 0.1em;
  }
  .line:hover {
  
  }
  .error {
    color: red;
  }
  .badge {
    border: 1px solid currentColor;
    align-self: center;
    font-size: 70%;
    padding-left: 0.2em;
    padding-right: 0.2em;
    border-radius: 1em;
    margin-left: 0.5em;
    margin-right: 0.5em;
  }
  .msg {
    flex: 1;
    word-break: break-word;
  }
  ${css}
  `);
	const el$1 = document.createElement(`div`);
	el$1.className = `log`;
	shadowRoot.append(el$1);
	const error = (messageOrError) => {
		const line = document.createElement(`div`);
		if (typeof messageOrError === `string`) line.innerHTML = messageOrError;
		else if (messageOrError instanceof Error) {
			const stack = messageOrError.stack;
			line.innerHTML = stack === void 0 ? messageOrError.toString() : stack.toString();
		} else line.innerHTML = messageOrError;
		line.classList.add(`error`);
		append(line);
		lastLog = void 0;
		lastLogRepeats = 0;
	};
	let lastLogTime = 0;
	const warn = (whatToLog = ``) => {
		const element = log$1(whatToLog);
		if (!element) return element;
		element.classList.add(`warning`);
		return element;
	};
	const log$1 = (whatToLog = ``) => {
		let message;
		const interval = window.performance.now() - lastLogTime;
		if (opts.minIntervalMs && interval < opts.minIntervalMs) return;
		lastLogTime = window.performance.now();
		if (typeof whatToLog === `object`) message = JSON.stringify(whatToLog);
		else if (whatToLog === void 0) message = `(undefined)`;
		else if (whatToLog === null) message = `(null)`;
		else if (typeof whatToLog === `number`) {
			if (Number.isNaN(message)) message = `(NaN)`;
			message = whatToLog.toString();
		} else message = whatToLog;
		if (message.length === 0) {
			const rule = document.createElement(`hr`);
			lastLog = void 0;
			append(rule);
		} else if (message === lastLog && collapseDuplicates) {
			const lastElement = el$1.firstElementChild;
			let lastBadge = lastElement.querySelector(`.badge`);
			if (lastBadge === null) {
				lastBadge = document.createElement(`div`);
				lastBadge.className = `badge`;
				lastElement.insertAdjacentElement(`beforeend`, lastBadge);
			}
			if (lastElement !== null) lastBadge.textContent = (++lastLogRepeats).toString();
			return lastElement;
		} else {
			const line = document.createElement(`div`);
			line.textContent = message;
			append(line);
			lastLog = message;
			return line;
		}
	};
	const append = (line) => {
		if (timestamp) {
			const wrapper = document.createElement(`div`);
			const timestamp$1 = document.createElement(`div`);
			timestamp$1.className = `timestamp`;
			timestamp$1.textContent = (/* @__PURE__ */ new Date()).toLocaleTimeString();
			wrapper.append(timestamp$1, line);
			line.classList.add(`msg`);
			wrapper.classList.add(`line`);
			line = wrapper;
		} else line.classList.add(`line`, `msg`);
		if (opts.reverse) el$1.append(line);
		else el$1.insertBefore(line, el$1.firstChild);
		if (capacity > 0 && ++added > capacity * 2) while (added > capacity) {
			el$1.lastChild?.remove();
			added--;
		}
		if (opts.reverse) el$1.scrollTop = el$1.scrollHeight;
		lastLogRepeats = 0;
	};
	const clear$1 = () => {
		el$1.innerHTML = ``;
		lastLog = void 0;
		lastLogRepeats = 0;
		added = 0;
	};
	const dispose = () => {
		el$1.remove();
	};
	return {
		error,
		log: log$1,
		warn,
		append,
		clear: clear$1,
		dispose,
		get isEmpty() {
			return added === 0;
		}
	};
};

//#endregion
//#region ../dom/src/inline-console.ts
/**
* Adds an inline console to the page. A DIV is added to display log messages.
* 
* Captures all console.log, console.warn and console.error calls, as well as unhandled exceptions.
* 
* ```js
* // Adds the DIV and intercepts console logs
* inlineConsole();
* 
* console.log(`Hello`); // message is displayed in the inline console
* ```
* @param options 
*/
const inlineConsole = (options = {}) => {
	const original = {
		log: console.log,
		error: console.error,
		warn: console.warn
	};
	const witholdCss = options.witholdCss ?? false;
	const insertIntoEl = options.insertIntoEl;
	let logElement;
	if (insertIntoEl) logElement = resolveEl(insertIntoEl);
	else {
		logElement = document.createElement(`DIV`);
		logElement.id = `ixfx-log`;
		document.body.prepend(logElement);
	}
	if (!witholdCss) {
		logElement.style.position = `fixed`;
		logElement.style.left = `0px`;
		logElement.style.top = `0px`;
		logElement.style.pointerEvents = `none`;
		logElement.style.display = `none`;
	}
	const logger = log(logElement, options);
	const visibility = (show) => {
		logElement.style.display = show ? `block` : `none`;
	};
	console.error = (message, ...optionalParameters) => {
		logger.error(message);
		if (optionalParameters.length > 0) logger.error(optionalParameters);
		original.error(message, ...optionalParameters);
		visibility(true);
	};
	console.warn = (message, ...optionalParameters) => {
		logger.warn(message);
		if (optionalParameters.length > 0) logger.warn(optionalParameters);
		visibility(true);
	};
	console.log = (message, ...optionalParameters) => {
		logger.log(message);
		if (optionalParameters.length > 0) logger.log(optionalParameters);
		original.log(message, ...optionalParameters);
		visibility(true);
	};
	window.onerror = (event, source, lineno, _colno, error) => {
		const abbreviatedSource = source === void 0 ? `` : afterMatch(source, `/`, { fromEnd: true });
		const eventString = getErrorMessage(error);
		logger.error(eventString + ` (${abbreviatedSource}:${lineno})`);
		visibility(true);
	};
	window.addEventListener("unhandledrejection", function(e) {
		logger.error(e.reason);
		visibility(true);
	});
};

//#endregion
//#region ../dom/src/query.ts
/**
* Async iterator over DOM query strings
* ```js
* query(`div`); // all DIVs
* query([`.class`, `.and-other-class`]); // All things with these two classes
* ```
* @param queryOrElement 
* @returns 
*/
async function* query(queryOrElement, options = {}) {
	if (typeof queryOrElement === `string`) return query([queryOrElement], options);
	else if (typeof queryOrElement === `object` && `nodeName` in queryOrElement) return query([queryOrElement], options);
	const ensureUnique = options ?? false;
	const isUnique = ensureUnique ? uniqueInstances() : (_) => true;
	if (Array.isArray(queryOrElement)) {
		for (const item of queryOrElement) if (typeof item === `string`) for (const element of document.querySelectorAll(item)) {
			const elementProper = element;
			if (isUnique(elementProper)) yield elementProper;
		}
		else if (isUnique(item)) yield item;
	} else for await (const item of queryOrElement) if (typeof item === `string`) {
		for (const element of document.querySelectorAll(item)) if (isUnique(element)) yield element;
	} else if (isUnique(item)) yield item;
}

//#endregion
//#region ../dom/src/tabbed-panel.ts
const tabSet = (options) => {
	const panels = options.panels;
	const preselectId = options.preselectId ?? panels[0].id;
	const guid = `tabset-${shortGuid()}`;
	const parentEl = resolveEl(options.parent);
	const switcher = `
  <div class="ixfx-tabset" id="${guid}">
    <fieldset class="ixfx-tabset-controls">
    ${panels.map((p) => {
		const panelId = `${guid}-${p.id}-select`;
		return `<input type="radio" name="${guid}-tabs" id="${panelId}" data-tabset="${p.id}"><label for="${panelId}">${p.label}</label>`;
	}).join(``)}
    </fieldset>
    <div class="ixfx-tabset-host" id="${guid}-host"></div>
  </div>
  `;
	parentEl.innerHTML = switcher;
	const hostEl = document.getElementById(`${guid}-host`);
	const tabSetEl = document.getElementById(guid);
	tabSetEl.querySelector(`fieldset`)?.addEventListener(`change`, (event) => {
		const el$1 = event.target;
		select$1(el$1.getAttribute(`data-tabset`));
	});
	let currentPanel;
	const select$1 = (id) => {
		const newPanel = panels.find((p) => p.id === id);
		const priorPanel = currentPanel;
		if (options.onPanelChanging) {
			const allow = options.onPanelChanging(priorPanel, newPanel);
			if (typeof allow === `boolean` && !allow) return;
		}
		if (priorPanel) priorPanel.dismount();
		currentPanel = newPanel;
		if (newPanel) {
			newPanel.mount(hostEl);
			const domId = `#${guid}-${id}-select`;
			const inputEl = tabSetEl.querySelector(domId);
			if (inputEl) inputEl.checked = true;
			else console.warn(`Could not find INPUT element for panel id: ${id} (${domId})`);
		}
		if (options.onPanelChange) options.onPanelChange(priorPanel, newPanel);
	};
	select$1(preselectId);
	let warned = false;
	const notify = (name, args) => {
		if (!currentPanel) return;
		if (currentPanel.notify) currentPanel.notify(name, args);
		else if (!warned) {
			warned = true;
			console.warn(`TabbedPanel.notify dropping notification '${name}'. Panel implementation is missing 'notify' function`);
		}
	};
	return {
		select: select$1,
		panels,
		hostEl,
		tabSetEl,
		notify
	};
};

//#endregion
//#region ../dom/src/utility.ts
var import_dist = __toESM(require_dist(), 1);
/**
* Convert an absolute point to relative, in different coordinate spaces.
*
* When calling the returned function, the input value must be in the same
* scale as the intended output scale.
*
* Viewport-relative is used by default.
*
* @example Get relative position of click in screen coordinates
* ```js
* const f = pointScaler({ to: 'screen' });
* document.addEventListener('click', evt => {
*  const screenRelative = f(evt.screenX, evt.screenY);
*  // Yields {x,y} on 0..1 scale
* });
* ```
*
* @example Get relative position of click in viewport coordinates
* ```js
* const f = pointScaler({ to: 'viewport' });
* document.addEventListener('click', evt => {
*  const viewportRelative = f(evt.clientX, evt.clientY);
*  // Yields {x,y} on 0..1 scale
* });
* ```
*
* @example Get relative position of click in document coordinates
* ```js
* const f = pointScaler({ to: 'document' });
* document.addEventListener('click', evt => {
*  const documentRelative = f(evt.pageX, evt.pageY);
*  // Yields {x,y} on 0..1 scale
* });
* ```
*
* @param reference
* @returns
*/
const pointScaler = (reference = `viewport`) => {
	switch (reference) {
		case `viewport`: return (a, b) => {
			const pt = getPointParameter(a, b);
			return Object.freeze({
				x: pt.x / window.innerWidth,
				y: pt.y / window.innerHeight
			});
		};
		case `screen`: return (a, b) => {
			const pt = getPointParameter(a, b);
			return Object.freeze({
				x: pt.x / screen.width,
				y: pt.y / screen.height
			});
		};
		case `document`: return (a, b) => {
			const pt = getPointParameter(a, b);
			return Object.freeze({
				x: pt.x / document.body.scrollWidth,
				y: pt.y / document.body.scrollHeight
			});
		};
		default: throw new Error(`Unknown 'reference' parameter: ${JSON.stringify(reference)}`);
	}
};
/**
* Returns a function which yields element position in target coordinate space with optional scaling.
* Live position is calculated when the function is invoked.
* Use {@link positionRelative} to simply get relative position of element in given coordinate space.
*
* @example Absolute position of #blah in viewport coordinate space
* ```js
* const f = positionFn('#blah');
* f(); // Yields: {x,y}
* // Or:
* positionFn('#blah')(); // Immediately invoke
* ```
*
* @example Relative position of element in viewport-space
* ```js
* const f = positionFn(evt.target, { relative: true });
* f(); // Yields: {x,y}
* ```
*
* @example Relative position of #blah in screen-space
* ```js
* const f = positionFn('#blah', { target: 'screen', relative: true });
* f(); // Yields: {x,y}
* ```
*
* By default, top-left corner (north west) is used. Other cardinal points or 'center' can be specified:
* ```js
* // Relative position by center
* positionFn('#blah', { relative: true, anchor: 'center' });
*
* // ...by bottom-right corner
* positionFn('#blah', { relative: true, anchor: 'se' });
* ```
*
* This function is useful if you have a stable DOM element and conversion target.
* If the DOM element is changing continually, consider using {@link viewportToSpace} to
* convert from viewport coordinates to target coordinates:
*
* ```js
* // Eg.1 Absolute coords in screen space
* const vpToScreen = viewportToSpace('screen');
* vpToScreen(el.getBoundingClientRect());
*
* // Eg.2 Relative coords in viewport space
* const vpRelative = pointScaler(); // Re-usable scaler. Default uses viewport
* vpRelative(el.getBoundingClientRect()); // Yields: { x,y }
*
* // Eg.3 Relative coords in screen space
* const vpToScreen = viewportToSpace('screen'); // Map viewport->screen
* const screenRelative = pointScaler('screen'); // Scale screen units
*
* // Combine into a resuable function that takes an element
* const mapAndScale = (el) => screenRelative(vpToScreen(el.getBoundingClientRect()));
*
* // Call
* mapAndScale(document.getElementById('blah')); // Yields: { x,y }
* ```
* @param domQueryOrEl
* @param options
* @returns
*/
const positionFn = (domQueryOrEl, options = {}) => {
	const targetSpace = options.target ?? `viewport`;
	const relative = options.relative ?? false;
	const anchor = options.anchor ?? `nw`;
	const el$1 = resolveEl(domQueryOrEl);
	const vpToSpace = viewportToSpace(targetSpace);
	if (relative) {
		const s = pointScaler(targetSpace);
		return () => s(vpToSpace(cardinal(el$1.getBoundingClientRect(), anchor)));
	} else return () => vpToSpace(cardinal(el$1.getBoundingClientRect(), anchor));
};
/**
* Returns a {x,y} Point on a cardinal position of element.
* ```
* // Top edge, middle horizontal position
* const pos = cardinalPosition(`#blah`, `n`);
* ```
* @param domQueryOrEl 
* @param anchor 
* @returns 
*/
const cardinalPosition = (domQueryOrEl, anchor = `nw`) => {
	const el$1 = resolveEl(domQueryOrEl);
	return cardinal(el$1.getBoundingClientRect(), anchor);
};
/**
* Returns relative position of element in target coordinate space, or viewport by default.
* Relative means that { x:0.5, y: 0.5 } is the middle of the target space. Eg for viewport, that means its the middle of the browser window.
* ```js
* // These all yield { x, y }
* elPositionRelative('#blah');
* elPositionRelative(evt.target, 'screen');
* ```
* @param domQueryOrEl DOM query or element
* @param target Target coordinate space, or viewport by default
* @returns Point
*/
const positionRelative = (domQueryOrEl, target = `viewport`) => {
	const f = positionFn(domQueryOrEl, {
		relative: true,
		target
	});
	return f();
};
/**
* Returns a function that converts input viewport coordinate space
* to an output coordinate space.
*
* ```js
* // f() will convert from viewport to document coordinate space
* const f = viewportToSpace('document');
*
* // {x:100,y:100} is viewport coordinate space
* f(100,100); // Yields: { x, y } converted to document space
* ```
*
* Or immediately invoke for one-off use:
* ```js
* viewportToSpace('document')(100,100); // Yields: { x, y }
* ```
* @param targetSpace
* @returns
*/
const viewportToSpace = (targetSpace = `viewport`) => {
	switch (targetSpace) {
		case `screen`: return (a, b) => {
			const pt = getPointParameter(a, b);
			return Object.freeze({
				x: pt.x + window.screenX,
				y: pt.y + window.screenY
			});
		};
		case `document`: return (a, b) => {
			const pt = getPointParameter(a, b);
			return Object.freeze({
				x: pt.x + window.scrollX,
				y: pt.y + window.scrollY
			});
		};
		case `viewport`: return (a, b) => {
			const pt = getPointParameter(a, b);
			return Object.freeze({
				x: pt.x,
				y: pt.y
			});
		};
		default: throw new Error(`Unexpected target coordinate space: ${targetSpace}. Expected: viewport, document or screen`);
	}
};
/**
* Position element by relative coordinate. Relative to window dimensions by default
* @param relativePos Window-relative coordinate. 0.5/0.5 is middle of window.
*/
const positionFromMiddle = (domQueryOrEl, relativePos, relativeTo = `window`) => {
	if (!domQueryOrEl) throw new Error(`domQueryOrEl is null or undefined`);
	const el$1 = resolveEl(domQueryOrEl);
	const absPosition = multiply(relativePos, window.innerWidth, window.innerHeight);
	const thingRect = el$1.getBoundingClientRect();
	const offsetPos = subtract(absPosition, thingRect.width / 2, thingRect.height / 2);
	el$1.style.transform = `translate(${offsetPos.x}px, ${offsetPos.y}px)`;
};
/**
* Given an array of class class names, this will cycle between them each time
* it is called.
*
* Eg, assume `list` is: [ `a`, `b`, `c` ]
*
* If `el` already has the class `a`, the first time it is called, class `a`
* is removed, and `b` added. The next time `b` is swapped for `c`. Once again,
* `c` will swap with `a` and so on.
*
* If `el` is undefined or null, function silently returns.
* @param el Element
* @param list List of class names
* @returns
*/
const cycleCssClass = (el$1, list) => {
	if (el$1 === null || !el$1) return;
	if (!Array.isArray(list)) throw new TypeError(`List should be an array of strings`);
	for (let index = 0; index < list.length; index++) if (el$1.classList.contains(list[index])) {
		el$1.classList.remove(list[index]);
		if (index + 1 < list.length) el$1.classList.add(list[index + 1]);
		else el$1.classList.add(list[0]);
		return;
	}
	el$1.classList.add(list[0]);
};
/**
* Source: https://zellwk.com/blog/translate-in-javascript
* @param domQueryOrEl
*/
const getTranslation = (domQueryOrEl) => {
	const el$1 = resolveEl(domQueryOrEl);
	const style = window.getComputedStyle(el$1);
	const matrix = style.transform;
	if (matrix === `none` || typeof matrix === `undefined`) return {
		x: 0,
		y: 0,
		z: 0
	};
	const matrixType = matrix.includes(`3d`) ? `3d` : `2d`;
	const matrixValues = /matrix.*\((.+)\)/.exec(matrix)[1].split(`, `);
	if (matrixType === `2d`) return {
		x: Number.parseFloat(matrixValues[4]),
		y: Number.parseFloat(matrixValues[5]),
		z: 0
	};
	if (matrixType === `3d`) return {
		x: Number.parseFloat(matrixValues[12]),
		y: Number.parseFloat(matrixValues[13]),
		z: Number.parseFloat(matrixValues[14])
	};
	return {
		x: 0,
		y: 0,
		z: 0
	};
};
/**
* Creates an element after `sibling`
* ```
* const el = createAfter(siblingEl, `DIV`);
* ```
* @param sibling Element
* @param tagName Element to create
* @returns New element
*/
const createAfter = (sibling, tagName) => {
	const el$1 = document.createElement(tagName);
	sibling.parentElement?.insertBefore(el$1, sibling.nextSibling);
	return el$1;
};
/**
* Creates an element inside of `parent`
* ```
* const newEl = createIn(parentEl, `DIV`);
* ```
* @param parent Parent element
* @param tagName Tag to create
* @returns New element
*/
const createIn = (parent, tagName) => {
	const el$1 = document.createElement(tagName);
	parent.append(el$1);
	return el$1;
};
/**
* Remove all child nodes from `parent`
* @param parent
*/
const clear = (parent) => {
	let c = parent.lastElementChild;
	while (c) {
		c.remove();
		c = parent.lastElementChild;
	}
};
/**
* Copies string representation of object to clipboard
* @param object
* @returns Promise
*/
const copyToClipboard = (object) => {
	const p = new Promise((resolve, reject) => {
		const string_ = import_dist.default.stringify(object);
		navigator.clipboard.writeText(JSON.stringify(string_)).then(() => {
			resolve(true);
		}, (error) => {
			console.warn(`Could not copy to clipboard`);
			console.log(string_);
			reject(new Error(error));
		});
	});
	return p;
};
/**
* Inserts `element` into `parent` sorted according to its HTML attribute `data-sort`.
* 
* Assumes:
* * Every child of `parent` and `element`, has a `data-sort` attribute. This is the basis for sorting.
* * `parent` starts off empty or pre-sorted.
* * Order of `parent`'s children is not changed (ie it always remains sorted)
* @param parent Parent to insert into
* @param element Element to insert
*/
const insertSorted = (parent, element) => {
	const elSort = element.getAttribute(`data-sort`) ?? ``;
	let elAfter;
	let elBefore;
	for (const c of parent.children) {
		const sort = c.getAttribute(`data-sort`) ?? ``;
		if (elSort >= sort) elAfter = c;
		if (elSort <= sort) elBefore = c;
		if (elAfter !== void 0 && elBefore !== void 0) break;
	}
	if (elAfter !== void 0) elAfter.insertAdjacentElement(`afterend`, element);
	else if (elBefore === void 0) parent.append(element);
	else elBefore.insertAdjacentElement(`beforebegin`, element);
};
/**
* Creates a DOM tree, based on provided data.
* 
* This will create new DOM elements if needed, update
* existing ones or remove them if the value is no longer present.
* 
* 
* @param parentEl 
* @param list Values to create elements for
* @param createUpdate Function to create/update elements based on a value
*/
const reconcileChildren = (parentEl, list, createUpdate) => {
	if (typeof parentEl === `undefined`) throw new Error(`Param 'parentEl' is undefined`);
	if (parentEl === null) throw new Error(`Param 'parentEl' is null`);
	const seen = /* @__PURE__ */ new Set();
	for (const [key, value] of list) {
		const id = `c-${key}`;
		const el$1 = parentEl.querySelector(`#${id}`);
		const finalEl = createUpdate(value, el$1);
		if (el$1 !== finalEl) {
			finalEl.id = id;
			parentEl.append(finalEl);
		}
		seen.add(id);
	}
	const prune = [];
	for (const child of parentEl.children) if (!seen.has(child.id)) prune.push(child);
	for (const p of prune) p.remove();
};
/**
* Gets a HTML element by id, throwing an error if not found
* @param id 
* @returns 
*/
const byId = (id) => {
	const element = document.getElementById(id);
	if (element === null) throw new Error(`HTML element with id '${id}' not found`);
	return element;
};

//#endregion
export { DataDisplay, data_table_exports as DataTable, drag_drop_exports as DragDrop, ElementSizer, forms_exports as Forms, addShadowCss, byId, cardinalPosition, clear, copyToClipboard, createAfter, createIn, cycleCssClass, defaultErrorHandler, el, elRequery, getBoundingClientRectWithBorder, getComputedPixels, getCssVariable, getCssVariablesFromStyles, getCssVariablesWithFallback, getTranslation, inlineConsole, insertSorted, log, parseCssVariablesAsAttributes, pointScaler, positionFn, positionFromMiddle, positionRelative, query, reconcileChildren, resolveEl, resolveElementTry, resolveEls, setCssClass, setCssDisplay, setCssToggle, setCssVariables, setFromCssVariables, setHtml, setProperty, setText, tabSet, viewportToSpace };
//# sourceMappingURL=dom.js.map