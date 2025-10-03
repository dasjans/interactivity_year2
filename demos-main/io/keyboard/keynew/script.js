import { last } from "@ixfx/iterables.js";

const settings = Object.freeze({
  // Key we want to monitor
  key: `f`,
  // How often to update visuals based on state
  updateIntervalMs: 100,
  //Get width of the vis element and slice for just the number value
  visWidth: () => {
    const element = document.querySelector(`#vis`);
    if (!element) return 0;
    return parseFloat(getComputedStyle(element).width);
  }
});

/**
 * @typedef {{
 * pressed: boolean
*  repeating: boolean
*  lastPress: number
*  lastRelease: number
*  startPress:number
*  calculatedWidth: number
 * }} State
 */

/** @type State */
let state = Object.freeze({
  pressed: false,
  repeating: false,
  lastPress: 0,
  lastRelease: 0,
  startPress: 0,
  calculatedWidth: 95, // Initial width in vw
});

/**
 * Where we use the state of the keys
 * @returns 
 */
const use = () => {
  const { visWidth } = settings;
  const { pressed, startPress, lastPress, lastRelease, calculatedWidth } = state;
  console.log(visWidth());
  const element = document.querySelector(`#vis`);
  if (!element) return;
  element.style.width = `${calculatedWidth}vw`;

};

/**
 * Key is pressed
 * @param {KeyboardEvent} event 
 * @returns 
 */
const onKeyDown = (event) => {
  const { key } = settings;
  let { pressed, startPress } = state;


  // Is it the key we are tracking?
  if (key !== event.key) {
    console.log(`Ignoring keydown for key: ${event.key}`);
    return;
  }

  event.preventDefault();

  // Wasn't pressed before, now it is - keep track of time
  if (!pressed) startPress = performance.now();

  // Update state
  saveState({
    // We're in keydown, so yes pressed
    pressed: true,
    // This will be true if the keydown is a continuation
    // of the key being held
    repeating: event.repeat,
    // Track the time of this event
    lastPress: performance.now(),
    startPress
  });
};

/**
 * Key is released
 * @param {KeyboardEvent} event 
 * @returns 
 */
const onKeyUp = (event) => {
  const { key, visWidth } = settings;
  const { startPress, lastPress, lastRelease } = state;
  // Is it a key we're tracking?
  if (key !== event.key) {
    console.log(`Ignoring keyup for key: ${event.key}`);
    return;
  }

  event.preventDefault();

  const holdTime = Math.round(performance.now() - startPress);
  const pxWidth = visWidth() - (holdTime / 20); // Reduce width based on hold time
  console.log(pxWidth);
  if (pxWidth < 10) {
    document.querySelector(`section`).removeChild(document.querySelector(`#vis`));
  }
  const vwWidth = (pxWidth / window.innerWidth) * 100; // Convert px to vw
  console.log(`Key was held for ${holdTime}ms, reducing width to ${vwWidth}vw`);
  saveState({ lastPress: startPress, calculatedWidth: vwWidth });

  // Update state
  saveState({
    // Not pressed
    pressed: false,
    // Not repeating
    repeating: false,
    // Return to init
    startPress: 0,
    // Track when it was released
    lastRelease: performance.now()
  });
};

/**
 * Listen for key events
 */
function setup() {
  document.addEventListener(`keydown`, onKeyDown);
  document.addEventListener(`keyup`, onKeyUp);

  setInterval(use, settings.updateIntervalMs);
}
setup();

/**
 * Update state
 * @param {Partial<state>} s 
 */
function saveState(s) {
  state = Object.freeze({
    ...state,
    ...s
  });
}
