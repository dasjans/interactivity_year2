import { interpolate, clamp } from '@ixfx/numbers.js';
//import * as Tone from 'http://unpkg.com/tone';

// Audio output node setup
let audioCtx,
  oscillator,
  gainNode,
  filter;

export const initAudio = () => {
  if (audioCtx) return; // Already initialized
  audioCtx = new window.AudioContext();
  oscillator = audioCtx.createOscillator();
  oscillator.type = `sawtooth`;
  gainNode = audioCtx.createGain();
  filter = audioCtx.createBiquadFilter();
  filter.type = `lowpass`;
  filter.frequency.setValueAtTime(5400, audioCtx.currentTime); // Initial cutoff
  oscillator.connect(filter).connect(gainNode)
    .connect(audioCtx.destination);
  oscillator.start();
};

export const getAudioCtx = () => audioCtx;

/**
 * Update audio output based on thing and state
 * @param {Thing} thing
 * @param {Object} ambientState
 */
export const useAudio = (thing, ambientState) => {
  if (!audioCtx) {
    console.log(`Audio context not initialized`);
    return; // Not initialized
  }
  // Example mapping: agitation -> frequency, loudness -> volume, agitation -> cutoff
  const { centroid, loudness } = ambientState;
  const { angle, intensity } = thing;
  // Frequency: 330Hz to 3300Hz
  oscillator.frequency.setValueAtTime(330 + centroid * 1000, audioCtx.currentTime);
  // Volume: 0.5 to 0.8
  gainNode.gain.setValueAtTime(1 - (loudness[19] * 5), audioCtx.currentTime);
  // Filter cutoff: 220Hz to 40000Hz
  //filter.frequency.setValueAtTime(5400 - (intensity * 3780), audioCtx.currentTime);
};


const settings = Object.freeze({
  intensityDropAmount: 0.3,
  agitationAmount: 0.3
});

/**
 * Define our thing
 * @typedef {Readonly<{
 *  intensity: number
 *  angle: number
 *  el: HTMLElement
 * }>} Thing
 */

/**
 * Make use of data from `thing` somehow...
 * @param {Thing} thing 
 */
export const use = (thing) => {
  //just ignore for now
};

/**
 * Updates a given thing based on state
 * @param {Thing} thing
 * @param {import('./script.js').State} ambientState
 * @returns {Thing}
 */
export const update = (thing, ambientState) => {
  const { intensityDropAmount, agitationAmount } = settings;
  let { centroid, loudness } = ambientState;
  let { intensity, angle } = thing;
  // Fold in some of the current 'agitation' value from the main sketch
  intensity += (centroid - 0.4) * agitationAmount;
  // Apply a decay of intensity so it slows down
  intensity = intensity - (intensity * intensityDropAmount);
  // Apply intensity to angle
  angle += intensity;
  // Return back changed state
  return Object.freeze({
    ...thing,
    intensity: clamp(intensity),
    angle
  });
};

/**
 * Creates a new thing
 * @returns {Thing}
 */
export const create = () => {
  const el = document.createElement(`div`);
  el.classList.add(`thing`);
  const container = document.querySelector(`#things`);
  if (container) {
    container.append(el);
  } else {
    document.body.append(el);
  }

  return {
    el,
    intensity: 0.4,
    angle: 0
  };
};