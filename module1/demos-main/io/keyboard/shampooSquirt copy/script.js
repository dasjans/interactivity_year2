const settings = Object.freeze({
  // Key we want to monitor
  key: `f`,
  // ID of element to show backdrop in
  dropElementId: `drop`,
  // How often to update visuals based on state
  updateIntervalMs: 100
});

/**
 * @typedef {{
 * pressed: boolean
*  startPress:number
*  lastRelease:number
*  changeRate:{r:number, g:number, b:number}
*  backdropColor: {r:number, g:number, b:number}}
 * }} state
 */

/** @type state */
let state = Object.freeze({
  pressed: false,
  startPress: 0,
  lastRelease: 0,
  changeRate: { r: 2.5, g: 2.5, b: 2.5 },
  backdropColor: { r: 0, g: 0, b: 0 }
});

/**
 * Where we use the state of the keys
 * @returns 
 */
const use = () => {
  const { key, dropElementId } = settings;
  const { pressed, startPress, changeRate, backdropColor } = state;
  // Get the element we want to show the backdrop in and warn if not found
  const dropElement = document.getElementById(dropElementId);
  if (!dropElement) {
    console.warn(`No element with id: ${dropElementId}`);
    return;
  }
  // Reduce changeRate over time by 40% all the time if not pressed
  console.log(`changeRate: r:${changeRate.r}, g:${changeRate.g}, b:${changeRate.b}`);
  if (!pressed) {
    changeRate.r *= 0.6;
    changeRate.g *= 0.6;
    changeRate.b *= 0.6;
  } else { // If pressed, increase changeRate based on how long it's been pressed
    const pressDuration = performance.now() - startPress;
    // The longer it's been pressed, the faster the changeRate increases
    const rateIncrease = Math.min(pressDuration / 50, 5); // Cap increase to avoid too fast
    changeRate.r += 0.5 * rateIncrease;
    changeRate.g += 0.5 * rateIncrease;
    changeRate.b += 0.5 * rateIncrease;
    // Cap changeRate to avoid it getting too fast
    changeRate.r = Math.min(changeRate.r, 3);
    changeRate.g = Math.min(changeRate.g, 3);
    changeRate.b = Math.min(changeRate.b, 3);
  }
  // If changeRate is very high and not pressed, reduce it quickly and go into negative to create a "bounce back" effect for a short time
  if (!pressed && (changeRate.r > 2 || changeRate.g > 2 || changeRate.b > 2)) {
    changeRate.r -= 5;
    changeRate.g -= 5;
    changeRate.b -= 5;
    // Ensure backdropColor doesn't go below 0
    backdropColor.r = Math.max(backdropColor.r, 0);
    backdropColor.g = Math.max(backdropColor.g, 0);
    backdropColor.b = Math.max(backdropColor.b, 0);
  }
  // Update backdropColor based on changeRate and cap to 0-255 range
  saveState({
    backdropColor: {
      r: Math.min((backdropColor.r + changeRate.r), 255),
      g: Math.min((backdropColor.g + changeRate.g), 255),
      b: Math.min((backdropColor.b + changeRate.b), 255)
    }
  });
  // If any of the values of backdropColor is at max, set backdropColor to (255,10,0) and reset changeRate to (0,0,0)
  if (backdropColor.r === 255 || backdropColor.g === 255 || backdropColor.b === 255) {
    saveState({
      backdropColor: { r: 255, g: 10, b: 0 },
      changeRate: { r: 0, g: 0, b: 0 }
    });
    dropElement.style.backgroundColor = `rgb(${Math.floor(backdropColor.r)}, ${Math.floor(backdropColor.g)}, ${Math.floor(backdropColor.b)})`;
    return;
  }
  // Update the element's background color
  dropElement.style.backgroundColor = `rgb(${Math.floor(backdropColor.r)}, ${Math.floor(backdropColor.g)}, ${Math.floor(backdropColor.b)})`;
};

/**
 * Key is pressed
 * @param {KeyboardEvent} event 
 * @returns 
 */
const onKeyDown = (event) => {
  const { key } = settings;
  let { pressed, startPress, lastRelease, changeRate, backdropColor } = state;

  // Is it the key we are tracking?
  if (key !== event.key) {
    console.log(`Ignoring keydown for key: ${event.key}`);
    return;
  }
  // Prevent default action (like scrolling for space)
  event.preventDefault();
  // If pressed again within 350ms of last release, ignore it (debounce) and if held down, ignore repeats
  if ((performance.now() - lastRelease) < 350 || event.repeat) {
    console.log(`Ignoring keydown for key: ${event.key} due to debounce or repeat`);
    return;
  }
  // Wasn't pressed before, now it is - keep track of time
  if (!pressed) startPress = performance.now();
  // 
  // Update state
  saveState({
    // We're in keydown, so yes pressed
    pressed: true,
    // Track the time of this event
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
