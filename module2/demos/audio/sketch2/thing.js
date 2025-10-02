import { Points, Rects } from '@ixfx/geometry.js';
import { interpolate, clamp } from '@ixfx/numbers.js';
import * as Util from './util.js';


const settings = Object.freeze({
  intensityDropAmount: 0.3,
  agitationAmount: 0.3
});

/**
 * Define our thing
 * @typedef {Readonly<{
 *  position: Points.Point
 *  size: Rects.Rect
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
  const { el, intensity, angle } = thing;
  let { position, size } = thing;

  // Get absolute coordinates
  position = Util.absolutePoint(position);
  size = Util.absoluteRect(size);

  // Apply visual properties to the element
  el.style.width = `${size.width}px`;
  el.style.height = `${size.height}px`;
  el.style.transform = `translate(${position.x}px,${position.y}px) rotate(${angle.toString()}rad)`;
};

/**
 * Updates a given thing based on state
 * @param {Thing} thing
 * @param {import('./script.js').State} ambientState
 * @returns {Thing}
 */
export const update = (thing, ambientState) => {
  const { intensityDropAmount, agitationAmount } = settings;
  let { agitation, loudness: speed } = ambientState;
  let { intensity, angle, position } = thing;

  // Apply speed to position with relation to current rotation angle
  // use speed and body min(width, height) to get movement amount
  const movementAmount = speed * Math.min(window.innerWidth, window.innerHeight) * 0.000015;
  let newX = position.x + Math.cos(angle) * movementAmount;
  let newY = position.y + Math.sin(angle) * movementAmount;
  // Clamp around the edges
  if (newX < 0) newX = 0;
  if (newX > (1)) newX = 1;
  if (newY < 0) newY = 0;
  if (newY > (1 - thing.size.width)) newY = 1 - thing.size.width;
  position = { x: newX, y: newY };
  // Fold in some of the current 'agitation' value from the main sketch
  intensity += (agitation - 0.4) * agitationAmount;

  // Apply a decay of intensity so it slows down
  intensity = intensity - (intensity * intensityDropAmount);

  // Apply intensity to angle
  angle += intensity;

  // Return back changed state
  return Object.freeze({
    ...thing,
    intensity: clamp(intensity),
    angle,
    position
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
    position: { x: 0.5, y: 0.5 },
    size: { width: 0.2, height: 0.2 },
    el,
    intensity: 0.4,
    angle: 0
  };
};