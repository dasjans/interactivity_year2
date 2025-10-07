import * as Things from './thing.js';
import * as Meyda from '../features/lib/index.js';
import { continuously } from '@ixfx';
import { Normalise, scalePercent } from '@ixfx/numbers.js';

const settings = Object.freeze({
  // Meyda helper. Extended to include RMS, spectralCentroid, zcr for focus detection
  meyda: new Meyda.MeydaHelper({
    featureExtractors: [ `loudness`, `spectralCentroid`, `rms`, `zcr` ]
  }),
  // Used to normalise values on 0..1 scale
  loudnessNormalise: Normalise.stream(),
  spectralCentroidNormalise: Normalise.stream(),
  rmsNormalise: Normalise.stream(),

  // How often to update state of thing
  thingUpdateSpeedMs: 100,

  // How often to do update/use of main sketch
  sketchUpdateSpeedMs: 200,
  sketchUseSpeedMs: 10,

  // Focus detection parameters
  focusWindowSize: 20, // Number of samples to analyze for focus
  steadyThreshold: 0.15, // Threshold for "steady" behavior
  idleTimeoutMs: 8000, // Time to consider user idle (8s)
  monotonyWindowMs: 25000, // Window for monotony detection (25s)
  
  // Adaptive audio parameters
  tiltAttackMs: 60,
  tiltReleaseMs: 200,
  crossfadeTimeMs: 2000,
  
  // Tremolo BPM options
  tremoloBpmOptions: [72, 76, 80, 84],
});

/** 
 * @typedef {Readonly<{
 *  lastData?: Meyda.MeydaAudioFeature
 *  thing: Things.Thing
 *  centroid: number
 *  loudness: Array<number>
 *  rms: number
 *  zcr: number
 *  rmsHistory: Array<number>
 *  centroidHistory: Array<number>
 *  lastActivityTime: number
 *  focusLevel: number
 *  isEngaged: boolean
 *  isMonotonous: boolean
 *  rmsBaseline: number
 *  centroidBaseline: number
 *  steadyCount: number
 *  currentTremoloBpm: number
 * }>} State
 */

/** @type {State} */
let state = Object.freeze({
  thing: Things.create(),
  centroid: 0,
  loudness: Array.from({ length: 24 }, () => 0),
  rms: 0,
  zcr: 0,
  rmsHistory: [],
  centroidHistory: [],
  lastActivityTime: Date.now(),
  focusLevel: 0.5,
  isEngaged: false,
  isMonotonous: false,
  rmsBaseline: 0.1,
  centroidBaseline: 0.5,
  steadyCount: 0,
  currentTremoloBpm: 76
});


function use() {
  const { centroid: agitation, loudness, isEngaged, focusLevel, rms, steadyCount } = state;
  // Visually update thing for testing
  Things.use(state.thing);
  // Audio output handling
  Things.useAudio(state.thing, state);
  
  // Update status display
  const statusEl = document.getElementById('status');
  if (statusEl) {
    const engagementText = isEngaged ? '✓ Engaged' : '○ Not Engaged';
    const focusText = `Focus: ${(focusLevel * 100).toFixed(0)}%`;
    const rmsText = `Activity: ${(rms * 100).toFixed(0)}%`;
    const steadyText = steadyCount > 0 ? `Steady: ${steadyCount}` : '';
    statusEl.innerHTML = `
      <div>${engagementText}</div>
      <div>${focusText}</div>
      <div>${rmsText}</div>
      ${steadyText ? `<div>${steadyText}</div>` : ''}
    `;
  }
}

function update() {
  const { lastData } = state;
  if (!lastData) return; // No audio feature data yet

  const { loudnessNormalise, spectralCentroidNormalise, rmsNormalise, focusWindowSize, steadyThreshold } = settings;

  // 1. Compute changes to properties
  // Get loudness for each index from 0 to 23 on a 0..1 scale
  let loudnessNormalised = Array.from({ length: 24 }, (_, i) => loudnessNormalise(lastData.loudness.specific.at(i) ?? 0));
  let spectralCentroidNormalised = 0;
  if (!Number.isNaN(lastData.spectralCentroid)) spectralCentroidNormalised = spectralCentroidNormalise(lastData.spectralCentroid);
  
  // Normalize RMS and ZCR
  let rmsNormalised = 0;
  if (!Number.isNaN(lastData.rms)) rmsNormalised = rmsNormalise(lastData.rms);
  let zcrValue = lastData.zcr ?? 0;
  
  // Update history buffers
  let rmsHistory = [...state.rmsHistory, rmsNormalised].slice(-focusWindowSize);
  let centroidHistory = [...state.centroidHistory, spectralCentroidNormalised].slice(-focusWindowSize);
  
  // Detect focus based on activity patterns
  const focusMetrics = detectFocus(rmsHistory, centroidHistory, rmsNormalised, spectralCentroidNormalised);
  
  // Update baselines with EMA (alpha = 0.05 for slow adaptation)
  const emaAlpha = 0.05;
  let rmsBaseline = state.rmsBaseline * (1 - emaAlpha) + rmsNormalised * emaAlpha;
  let centroidBaseline = state.centroidBaseline * (1 - emaAlpha) + spectralCentroidNormalised * emaAlpha;
  
  // Detect idle state
  const now = Date.now();
  const timeSinceActivity = now - state.lastActivityTime;
  const isIdle = timeSinceActivity > settings.idleTimeoutMs;
  
  // Update last activity time if there's meaningful sound
  let lastActivityTime = state.lastActivityTime;
  if (rmsNormalised > rmsBaseline * 0.5) {
    lastActivityTime = now;
  }
  
  // Detect engagement and monotony
  const isEngaged = focusMetrics.isEngaged && !isIdle;
  const isMonotonous = focusMetrics.isMonotonous;
  
  // Track steady behavior count
  let steadyCount = state.steadyCount;
  if (focusMetrics.isSteady) {
    steadyCount++;
  } else {
    steadyCount = 0;
  }

  // 2. Call saveState to save properties
  saveState({ 
    centroid: spectralCentroidNormalised, 
    loudness: loudnessNormalised,
    rms: rmsNormalised,
    zcr: zcrValue,
    rmsHistory,
    centroidHistory,
    lastActivityTime,
    focusLevel: focusMetrics.focusLevel,
    isEngaged,
    isMonotonous,
    rmsBaseline,
    centroidBaseline,
    steadyCount
  });
}

/**
 * Detect focus based on audio feature patterns
 * @param {Array<number>} rmsHistory 
 * @param {Array<number>} centroidHistory 
 * @param {number} currentRms 
 * @param {number} currentCentroid 
 * @returns {{focusLevel: number, isEngaged: boolean, isSteady: boolean, isMonotonous: boolean}}
 */
function detectFocus(rmsHistory, centroidHistory, currentRms, currentCentroid) {
  const { steadyThreshold } = settings;
  
  if (rmsHistory.length < 3) {
    return { focusLevel: 0.5, isEngaged: false, isSteady: false, isMonotonous: false };
  }
  
  // Calculate variance for RMS and centroid
  const rmsVariance = calculateVariance(rmsHistory);
  const centroidVariance = calculateVariance(centroidHistory);
  
  // Low variance in both = focused, steady activity
  // High variance = erratic, unfocused
  const isSteady = rmsVariance < steadyThreshold && centroidVariance < steadyThreshold;
  
  // Engagement: moderate RMS (not silent, not too loud)
  const rmsEngagement = currentRms > 0.1 && currentRms < 0.8;
  
  // Monotony: very low variance over extended period
  const isMonotonous = rmsVariance < 0.05 && centroidVariance < 0.05;
  
  // Focus level: combination of steadiness and appropriate activity level
  const focusLevel = isSteady && rmsEngagement ? 0.8 : 
                     rmsEngagement ? 0.6 : 0.3;
  
  const isEngaged = rmsEngagement && !isMonotonous;
  
  return { focusLevel, isEngaged, isSteady, isMonotonous };
}

/**
 * Calculate variance of an array
 * @param {Array<number>} arr 
 * @returns {number}
 */
function calculateVariance(arr) {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  return variance;
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

