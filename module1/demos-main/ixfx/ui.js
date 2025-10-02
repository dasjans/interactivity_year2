import { __export } from "./chunk-51aI8Tpl.js";
import "./src-BBD50Kth.js";
import "./records-Cei7yF1D.js";
import "./is-primitive-eBwrK4Yg.js";
import "./interval-type-DajslxUJ.js";
import { findBySomeKey } from "./basic-D0XoOdBJ.js";
import { getPathsAndData } from "./src-5y1UH40E.js";
import { afterMatch, beforeMatch, stringSegmentsWholeToEnd, stringSegmentsWholeToFirst } from "./src-TlKlGoex.js";
import "./is-integer-BmMnD0ra.js";
import "./key-value-JSby0EXT.js";
import "./dist-DE4H3J9W.js";
import "./resolve-core-BwRmfzav.js";
import "./src-BeVDUOoq.js";
import { QueueMutable } from "./src-BIfshA2g.js";
import { resolveEl } from "./src-sHR31-XU.js";
import "./src-C7XtfIer.js";
import "./bezier-CITq2XUb.js";
import { fromCss as fromCss$1, fromCss$1 as fromCss, toColour, toCssColour, toCssString } from "./src-DtTSywET.js";
import { debounce, event, eventTrigger, hasLast, initStream, messageHasValue, messageIsSignal, object, observable, transform } from "./src-DewS48xO.js";

//#region ../ui/src/rx/browser-resize.ts
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
	return debounce({ elapsed: interval ?? 100 })(m);
};
/**
* Returns an Reactive for window resize. Default 100ms debounce.
* @param elapsed
* @returns
*/
const windowResize = (elapsed) => debounce({ elapsed: elapsed ?? 100 })(event(window, `resize`, {
	innerWidth: 0,
	innerHeight: 0
}));

//#endregion
//#region ../ui/src/rx/browser-theme-change.ts
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
//#region ../ui/src/rx/colour.ts
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
//#region ../ui/src/rx/dom-source.ts
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
		if (hasLast(upstreamSource)) setUpstream(upstreamSource.last());
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
		if (hasLast(upstreamSource)) setFromUpstream(upstreamSource.last());
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
//#region ../ui/src/rx/dom.ts
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
	if (hasLast(source)) update(source.last());
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
	if (hasLast(source)) update(source.last());
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
	const init = () => {
		if (hasLast(source) && opts.initial) opts.initial(source.last(), el);
	};
	init();
	return {
		refresh: () => {
			init();
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
	if (hasLast(source)) {
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
//#region ../ui/src/rx/index.ts
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
export { rx_exports as RxUi };
//# sourceMappingURL=ui.js.map