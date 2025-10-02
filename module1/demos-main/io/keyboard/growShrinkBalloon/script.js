const settings = Object.freeze({
  // Key we want to monitor
  key: `f`,
  // Function to update HTML element
  size: document.getElementById(`vis`)?.style.height ?? `oops`,
  // How often to update visuals based on state
  updateIntervalMs: 100
});

/**
 * @typedef {{
 * pressed: boolean
*  repeating: boolean
*  lastPress: number
*  lastRelease: number
*  startPress:number
 * }} State
 */

/** @type State */
let state = Object.freeze({
  pressed: false,
  repeating: false,
  lastPress: 0,
  lastRelease: 0,
  startPress: 0
});

/**
 * Where we use the state of the keys
 * @returns 
 */
const use = () => {
  const { size } = settings;
  const { pressed, startPress } = state;
  // Remove the "em" from size and convert to number
  const baseSize = Number(size.replace(`em`, ``));

  const element = document.getElementById(`vis`);
  if (!element) return;
  // center element position
  element.style.position = `absolute`;
  element.style.top = `50%`;
  element.style.left = `50%`;
  element.style.transform = `translate(-50%, -50%)`;
  if (pressed) {
    element.classList.add(`pressed`);
    // Eg: if being held down, for how long
    const holdTime = Math.round(performance.now() - startPress);
    // Make it bigger the longer it's held, up to double size
    const newSize = Math.min(baseSize * 2, baseSize + holdTime / 1000);
    console.log(newSize);
    element.style.height = `${newSize}em`;
    element.style.width = `${newSize}em`;
  } else {
    element.classList.remove(`pressed`);
    // Shrink slowly back to original size
    const currentSize = Number(element.style.height.replace(`em`, ``));
    if (currentSize > baseSize) {
      const newSize = Math.max(baseSize, currentSize - 0.1);
      element.style.height = `${newSize}em`;
      element.style.width = `${newSize}em`;
    }
  }
};
/**
 * Key is pressed
 * @param {KeyboardEvent} event 
 * @returns 
 */
const onKeyDown = (event) => {
  const { key } = settings;
  let { pressed, startPress } = state;

  console.log(`onKeyDown`);

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
  const { key } = settings;

  // Is it a key we're tracking?
  if (key !== event.key) {
    console.log(`Ignoring keyup for key: ${event.key}`);
    return;
  }
  console.log(`onKeyUp`);

  event.preventDefault();

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
