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
  focusWindowSize: 20, // Number of recent audio samples to keep in history buffers for variance analysis
  steadyThreshold: 0.2, // Maximum variance allowed to consider behavior "steady" (higher = more lenient, easier to be focused)
  idleTimeoutMs: 8000, // Milliseconds of inactivity before user is considered idle (8s)
  monotonyWindowMs: 25000, // Time window for detecting monotonous behavior (25s)

  // Adaptive audio parameters
  tiltAttackMs: 60,
  tiltReleaseMs: 200,
  crossfadeTimeMs: 2000,

  // Tremolo BPM options
  tremoloBpmOptions: [ 72, 76, 80, 84 ],
});

/** 
 * @typedef {Readonly<{
 *  lastData?: Meyda.MeydaAudioFeature
 *  thing: Things.Thing
 *  centroid: number // Current spectral centroid (brightness of sound, 0-1 normalized)
 *  loudness: Array<number> // Array of loudness values across frequency bands
 *  rms: number // Current Root Mean Square energy level (overall activity, 0-1 normalized)
 *  zcr: number // Zero Crossing Rate (rate of signal changes)
 *  rmsHistory: Array<number> // Rolling buffer of recent RMS values for variance calculation
 *  centroidHistory: Array<number> // Rolling buffer of recent centroid values for variance calculation
 *  lastActivityTime: number // Timestamp of last detected meaningful sound activity
 *  focusLevel: number // Computed focus score (0-1, where higher = more focused)
 *  isEngaged: boolean // Whether user is actively engaged (moderate activity, not idle)
 *  isSteady: boolean // Whether user's activity shows steady, consistent patterns
 *  isMonotonous: boolean // Whether activity is too repetitive/monotonous
 *  rmsBaseline: number // Learned baseline for user's typical RMS level (adapts over time)
 *  centroidBaseline: number // Learned baseline for user's typical spectral centroid (adapts over time)
 *  steadyCount: number // Counter for consecutive steady samples (resets when not steady)
 *  currentTremoloBpm: number // Current tremolo beats per minute
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
  isSteady: false,
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
  const statusEl = document.getElementById(`status`);
  if (statusEl) {
    const engagementText = isEngaged ? `✓ Engaged` : `○ Not Engaged`;
    const focusText = `Focus: ${(focusLevel * 100).toFixed(0)}%`;
    const rmsText = `Activity: ${(rms * 100).toFixed(0)}%`;
    const steadyText = steadyCount > 0 ? `Steady: ${steadyCount}` : ``;
    
    // Get filter experiment status from Things module
    const filterStatus = Things.getFilterExperimentStatus();
    const filterText = filterStatus ? `🔬 Testing: ${filterStatus}` : ``;
    
    statusEl.innerHTML = `
      <div>${engagementText}</div>
      <div>${focusText}</div>
      <div>${rmsText}</div>
      ${steadyText ? `<div>${steadyText}</div>` : ``}
      ${filterText ? `<div style="color: #ffd700;">${filterText}</div>` : ``}
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

  // Update history buffers (keep only the most recent samples up to focusWindowSize)
  let rmsHistory = [ ...state.rmsHistory, rmsNormalised ].slice(-focusWindowSize);
  let centroidHistory = [ ...state.centroidHistory, spectralCentroidNormalised ].slice(-focusWindowSize);

  // Detect focus based on activity patterns
  const focusMetrics = detectFocus(rmsHistory, centroidHistory, rmsNormalised, spectralCentroidNormalised);

  // Update baselines using Exponential Moving Average (EMA) for slow, gradual adaptation
  // Alpha of 0.05 means each new value has 5% influence, providing smooth long-term learning
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
    isSteady: focusMetrics.isSteady,
    isMonotonous,
    rmsBaseline,
    centroidBaseline,
    steadyCount
  });
}

/**
 * Detect focus based on audio feature patterns
 * This function analyzes the variance (stability) of RMS and spectral centroid over time
 * to determine if the user is in a focused state
 * 
 * @param {Array<number>} rmsHistory - Recent history of RMS values (activity level)
 * @param {Array<number>} centroidHistory - Recent history of spectral centroid values (sound brightness)
 * @param {number} currentRms - Current RMS value (0-1 normalized)
 * @param {number} currentCentroid - Current spectral centroid value (0-1 normalized)
 * @returns {{focusLevel: number, isEngaged: boolean, isSteady: boolean, isMonotonous: boolean}}
 */
function detectFocus(rmsHistory, centroidHistory, currentRms, currentCentroid) {
  const { steadyThreshold } = settings;

  if (rmsHistory.length < 3) {
    return { focusLevel: 0.5, isEngaged: false, isSteady: false, isMonotonous: false };
  }

  // Calculate variance (measure of how much the values fluctuate)
  // Low variance = consistent, steady behavior (potentially focused)
  // High variance = erratic, changing behavior (potentially distracted)
  const rmsVariance = calculateVariance(rmsHistory);
  const centroidVariance = calculateVariance(centroidHistory);

  // Low variance in both RMS and centroid indicates focused, steady activity
  // (e.g., consistent drawing strokes, typing rhythm)
  // High variance suggests erratic, unfocused behavior
  const isSteady = rmsVariance < steadyThreshold && centroidVariance < steadyThreshold;

  // Engagement check: user should have moderate RMS (not silent, not excessively loud)
  // Lowered the minimum threshold to be more lenient about detecting engagement
  const rmsEngagement = currentRms > 0.05 && currentRms < 0.85;

  // Monotony: very low variance over extended period (might indicate boredom or mechanical repetition)
  const isMonotonous = rmsVariance < 0.05 && centroidVariance < 0.05;

  // Calculate focus level as a score from 0 to 1
  // Highest score (0.8) when steady AND engaged
  // Medium score (0.6) when engaged but not steady
  // Low score (0.3) otherwise
  const focusLevel = isSteady && rmsEngagement ? 0.8 : rmsEngagement ? 0.6 : 0.3;

  // User is considered engaged if they have appropriate activity and it's not monotonous
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
  // Add reset button handler for user preferences
  window.addEventListener(`keydown`, (event) => {
    if (event.key === `r` || event.key === `R`) {
      Things.resetUserPreferences();
    }
  });
  // Resume audio context on user gesture
  window.addEventListener(`click`, async () => {
    console.log(`Event click. Resuming audio context if needed.`);

    await Things.initAudio();
    const ctx = Things.getAudioCtx();

    if (ctx) {
      ctx.resume().then(() => {
        console.log(`AudioContext state after resume:`, ctx.state);
      });
    }
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

