import * as Things from './thing.js';
import * as Util from './util.js';
import * as Meyda from '../features/lib/index.js';
import { continuously } from '@ixfx';
import { Normalise, scalePercent } from '@ixfx/numbers.js';

const settings = Object.freeze({
  // Meyda helper. In this case just one the feature extractor
  // is added, 'loudness' and 'spectralCentroid'.
  meyda: new Meyda.MeydaHelper({
    featureExtractors: [ `loudness`, `spectralCentroid` ]
  }),
  // Used to normalise values on 0..1 scale
  loudnessNormalise: Normalise.stream(),
  spectralCentroidNormalise: Normalise.stream(),

  // How often to update state of thing
  thingUpdateSpeedMs: 100,

  // How often to do update/use of main sketch
  sketchUpdateSpeedMs: 200,
  sketchUseSpeedMs: 10,
});

//just messing around with git

let stuff = 0;

/** 
 * @typedef {Readonly<{
 *  lastData?: Meyda.MeydaAudioFeature
 *  thing: Things.Thing
 *  centroid: number
 *  loudness: Array<number>
 * }>} State
 */

/** @type {State} */
let state = Object.freeze({
  thing: Things.create(),
  centroid: 0,
  loudness: Array.from({ length: 24 }, () => 0)
});


function use() {
  const { centroid: agitation, loudness } = state;
  // Visually update thing for testing
  Things.use(state.thing);
  // Audio output handling
  Things.useAudio(state.thing, state);
}

function update() {
  const { lastData } = state;
  if (!lastData) return; // No audio feature data yet

  const { loudnessNormalise: loudnessNormalise, spectralCentroidNormalise: spectralCentroidNormalise } = settings;

  // 1. Compute changes to properties
  // Get loudness for each index from 0 to 23 on a 0..1 scale
  let loudnessNormalised = Array.from({ length: 24 }, (_, i) => loudnessNormalise(lastData.loudness.specific.at(i) ?? 0));
  let spectralCentroidNormalised = 0;
  if (!Number.isNaN(lastData.spectralCentroid)) spectralCentroidNormalised = spectralCentroidNormalise(lastData.spectralCentroid);
  // 2. Call saveState to save properties
  saveState({ centroid: spectralCentroidNormalised, loudness: loudnessNormalised });
}

function setup() {
  const { meyda } = settings;

  // Initialise audio input analyser
  meyda.onData = onData;
  meyda.init();

  // Update thing at a fixed rate
  continuously(() => {
    // Compute new state for thing
    const changedThing = Things.update(state.thing, state);

    // Save it
    saveState({ thing: changedThing });
  }, settings.thingUpdateSpeedMs).start();

  // Update state of sketch and use state
  // at full speed
  continuously(() => {
    update();
  }, settings.sketchUpdateSpeedMs).start();
  continuously(() => {
    use();
  }, settings.sketchUseSpeedMs).start();

  // Resume audio context on user gesture
  window.addEventListener(`click`, () => {
    console.log(`Event click. Resuming audio context if needed.`);

    Things.initAudio();
    const ctx = Things.getAudioCtx();

    ctx.resume().then(() => {
      console.log(`AudioContext state after resume:`, ctx.state);
    });
  }, { once: true });
}

/**
 * Called each time we have new analysis data
 * @param {Meyda.MeydaAudioFeature} data 
 */
function onData(data) {
  // Save all the feature data into state
  saveState({ lastData: data });
}

setup();

/**
 * Save state
 * @param {Partial<State>} s 
 */
function saveState(s) {
  state = Object.freeze({
    ...state,
    ...s
  });
  return state;
}

