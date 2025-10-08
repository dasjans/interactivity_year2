import * as Things from './thing.js';
import * as Meyda from '../features/lib/index.js';
import { continuously } from '@ixfx';
import { Normalise, scalePercent } from '@ixfx/numbers.js';
import { last } from '@ixfx/iterables.js';
import { number } from '@ixfx/trackers.js';

const settings = Object.freeze({
  // Meyda helper. Extended to include RMS, spectralCentroid, zcr for focus detection
  meyda: new Meyda.MeydaHelper({
    featureExtractors: [ `loudness`, `spectralCentroid`, `rms`, `zcr` ]
  }),
  // create 25 normalisers for all 24 loudness bands and loudness total as an array
  loudnessNormalise: Array.from({ length: 25 }, () => Normalise.stream()),
  // Normalising functions for audio features
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

  // Engagement tuning (new)
  engagementGraceMs: 1000,    // remain engaged for this long after drawing stops
  engageRequireMs: 200,       // brief debounce before entering engagement from drawing
  engageMinFocus: 0.18        // allow engagement when focusLevel >= this (with steadiness)
});
// Internal state for engagement tracking
let _lastDrawingTrue = 0;
let _lastDrawingFalse = 0;
let _engagedSince = 0;

/** 
 * @typedef {Readonly<{
 *  lastData?: Meyda.MeydaAudioFeature
 *  thing: Things.Thing
 *  centroid: number // Current spectral centroid (brightness of sound, 0-1 normalized)
 *  loudness: Array<number> // Array of loudness values across frequency bands
 *  rms: number // Current Root Mean Square energy level (overall activity, 0-1 normalized)
 *  zcr: number // Zero Crossing Rate (rate of signal changes)
 *  drawingHistory: Array<boolean> // Rolling buffer of recent drawing detection values
 *  loudnessHistory: Array<number> // Rolling buffer of recent total loudness values for variance calculation
 *  centroidHistory: Array<number> // Rolling buffer of recent centroid values for variance calculation
 *  lastActivityTime: number // Timestamp of last detected meaningful sound activity
 *  focusLevel: number // Computed focus score (0-1, where higher = more focused)
 *  isEngaged: boolean // Whether user is actively engaged (moderate activity, not idle)
 *  isSteady: boolean // Whether user's activity shows steady, consistent patterns
 *  isMonotonous: boolean // Whether activity is too repetitive/monotonous
 *  isDrawing: boolean // Whether the activity pattern suggests drawing/sketching
 *  activityLevel: number // Activity level based on drawing history (0-1)
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
  loudness: Array.from({ length: 25 }, Number),
  rms: 0,
  zcr: 0,
  drawingHistory: [],
  loudnessHistory: [],
  centroidHistory: [],
  lastActivityTime: performance.now(),
  focusLevel: 0.5,
  isEngaged: false,
  isSteady: false,
  isMonotonous: false,
  isDrawing: false,
  activityLevel: 0,
  rmsBaseline: 0.1,
  centroidBaseline: 0.5,
  steadyCount: 0,
  currentTremoloBpm: 76
});


function use() {
  const { centroid: agitation, loudness, isEngaged, focusLevel, activityLevel, steadyCount, isDrawing } = state;
  // Visually update thing for testing
  Things.use(state.thing);
  // Audio output handling
  Things.useAudio(state.thing, state);

  // Update status display
  const statusEl = document.getElementById(`status`);
  if (statusEl) {
    const engagementText = isEngaged ? `✓ Engaged` : `○ Not Engaged`;
    const focusText = `Focus: ${(focusLevel * 100).toFixed(0)}%`;
    const activityText = `Activity: ${(activityLevel * 100).toFixed(0)}%`;
    const steadyText = steadyCount > 0 ? `Steady: ${steadyCount}` : ``;
    const drawingText = isDrawing ? `✏️ Drawing` : ``;

    // Get filter experiment status from Things module
    const filterStatus = Things.getFilterExperimentStatus();
    const filterText = filterStatus ? `🔬 Testing: ${filterStatus}` : ``;

    statusEl.innerHTML = `
      <div>${engagementText}</div>
      <div>${focusText}</div>
      <div>${activityText}</div>
      ${steadyText ? `<div>${steadyText}</div>` : ``}
      ${drawingText ? `<div style="color: #90ee90;">${drawingText}</div>` : ``}
      ${filterText ? `<div style="color: #ffd700;">${filterText}</div>` : ``}
    `;
  }
}

function update() {
  const { lastData, isDrawing: wasDrawing } = state;
  if (!lastData) return; // No audio feature data yet

  const { loudnessNormalise, spectralCentroidNormalise, rmsNormalise, focusWindowSize, steadyThreshold } = settings;
  //console.log(loudnessNormalise);
  // 1. Compute changes to properties
  // Get loudness for each index from 0 to 23 and total on a 0..1 scale using normalisers
  let loudnessNormalised = Array.from({ length: 25 }, (_, i) => {
    if (i < 24) {
      return loudnessNormalise[i](lastData.loudness.specific.at(i) ?? 0);
    } else {
      return loudnessNormalise[i](lastData.loudness.total ?? 0);
    }
  });
  let spectralCentroidNormalised = 0;
  if (!Number.isNaN(lastData.spectralCentroid)) spectralCentroidNormalised = spectralCentroidNormalise(lastData.spectralCentroid);

  // Normalize RMS and ZCR
  let rmsNormalised = 0;
  if (!Number.isNaN(lastData.rms)) rmsNormalised = rmsNormalise(lastData.rms);
  let zcrValue = lastData.zcr ?? 0;

  // Get total loudness (index 24 in the normalized array)
  const totalLoudness = loudnessNormalised[24];

  // Update history buffers (keep only the most recent samples up to focusWindowSize)
  let loudnessHistory = [ ...state.loudnessHistory, totalLoudness ].slice(-focusWindowSize);
  let centroidHistory = [ ...state.centroidHistory, spectralCentroidNormalised ].slice(-focusWindowSize);

  // Detect if activity is drawing based on loudness pattern (indices 18-20)
  let isDrawing;
  if (!wasDrawing || (lastLoudnessCheck + 250 < performance.now())) {
    lastLoudnessCheck = performance.now();
    isDrawing = detectDrawing(loudnessNormalised);
  } else if (wasDrawing) {
    isDrawing = wasDrawing;
  }

  // Update drawing history buffer
  let drawingHistory = [ ...state.drawingHistory, isDrawing ].slice(-focusWindowSize);

  // Calculate activity level based on drawing history
  // Activity is high when frequently drawing, low when not
  const drawingCount = drawingHistory.filter(d => d).length;
  const activityLevel = drawingCount / Math.max(drawingHistory.length, 1);

  // Detect focus based on loudness and centroid patterns
  const focusMetrics = detectFocus(loudnessHistory, centroidHistory, totalLoudness, spectralCentroidNormalised);

  // Update baselines using Exponential Moving Average (EMA) for slow, gradual adaptation
  // Alpha of 0.05 means each new value has 5% influence, providing smooth long-term learning
  const emaAlpha = 0.05;
  let rmsBaseline = state.rmsBaseline * (1 - emaAlpha) + rmsNormalised * emaAlpha;
  let centroidBaseline = state.centroidBaseline * (1 - emaAlpha) + spectralCentroidNormalised * emaAlpha;

  // Detect idle state
  const now = performance.now();
  const timeSinceActivity = now - state.lastActivityTime;
  const isIdle = timeSinceActivity > settings.idleTimeoutMs;

  // Update last activity time if there's meaningful sound
  let lastActivityTime = state.lastActivityTime;
  if (rmsNormalised > rmsBaseline * 0.5) {
    lastActivityTime = now;
  }

  // Detect monotony
  const isMonotonous = focusMetrics.isMonotonous;

  // Track steady behavior count
  let steadyCount = state.steadyCount;
  if (focusMetrics.isSteady) {
    steadyCount++;
  } else {
    steadyCount = 0;
  }

  // Update drawing timestamps
  if (isDrawing && !wasDrawing) {
    _lastDrawingTrue = now;
  }
  if (!isDrawing && wasDrawing) {
    _lastDrawingFalse = now;
  }

  // Compute engagement with grace period logic
  const wasEngaged = !!state.isEngaged;
  let isEngaged;

  if (!wasEngaged) {
    // Not currently engaged - enter engagement if drawing
    if (isDrawing) {
      const drawingRecently = (now - _lastDrawingTrue) <= settings.engageRequireMs;
      if (drawingRecently) {
        isEngaged = true;
        _engagedSince = now;
      } else {
        isEngaged = false;
      }
    } else {
      // Not drawing and not engaged
      isEngaged = false;
    }
  } else {
    // Already engaged - maintain engagement with grace period
    if (isDrawing) {
      // Still drawing, stay engaged
      isEngaged = true;
    } else {
      // Stopped drawing - use grace period
      const timeSinceStopped = now - _lastDrawingFalse;
      const withinGracePeriod = timeSinceStopped <= settings.engagementGraceMs;
      isEngaged = withinGracePeriod;

      if (!isEngaged) {
        _engagedSince = 0;
      }
    }
  }

  // 2. Call saveState to save properties
  saveState({
    centroid: spectralCentroidNormalised,
    loudness: loudnessNormalised,
    rms: rmsNormalised,
    zcr: zcrValue,
    drawingHistory,
    loudnessHistory,
    centroidHistory,
    lastActivityTime,
    focusLevel: focusMetrics.focusLevel,
    isEngaged,
    isSteady: focusMetrics.isSteady,
    isMonotonous,
    isDrawing,
    activityLevel,
    rmsBaseline,
    centroidBaseline,
    steadyCount
  });
}

/**
 * Detect focus based on audio feature patterns
 * This function analyzes the variance (stability) of loudness and spectral centroid over time
 * to determine if the user is in a focused state
 * 
 * @param {Array<number>} loudnessHistory - Recent history of total loudness values
 * @param {Array<number>} centroidHistory - Recent history of spectral centroid values (sound brightness)
 * @param {number} currentLoudness - Current total loudness value (0-1 normalized)
 * @param {number} currentCentroid - Current spectral centroid value (0-1 normalized)
 * @returns {{focusLevel: number, isEngaged: boolean, isSteady: boolean, isMonotonous: boolean}}
 */
function detectFocus(loudnessHistory, centroidHistory, currentLoudness, currentCentroid) {
  const { steadyThreshold } = settings;

  if (loudnessHistory.length < 3) {
    return { focusLevel: 0.5, isEngaged: false, isSteady: false, isMonotonous: false };
  }

  // Calculate variance (measure of how much the values fluctuate)
  // Low variance = consistent, steady behavior (potentially focused)
  // High variance = erratic, changing behavior (potentially distracted)
  const loudnessVariance = calculateVariance(loudnessHistory);
  const centroidVariance = calculateVariance(centroidHistory);

  // Low variance in both loudness and centroid indicates focused, steady activity
  // (e.g., consistent drawing strokes, typing rhythm)
  // High variance suggests erratic, unfocused behavior
  const isSteady = loudnessVariance < steadyThreshold && centroidVariance < steadyThreshold;

  // Engagement check: user should have moderate loudness (not silent, not excessively loud)
  // Lowered the minimum threshold to be more lenient about detecting engagement
  const loudnessEngagement = currentLoudness > 0.05 && currentLoudness < 0.85;

  // Monotony: very low variance over extended period (might indicate boredom or mechanical repetition)
  const isMonotonous = loudnessVariance < 0.05 && centroidVariance < 0.05;

  // Calculate focus level as a score from 0 to 1
  // Highest score (0.8) when steady AND engaged
  // Medium score (0.6) when engaged but not steady
  // Low score (0.3) otherwise
  const focusLevel = isSteady && loudnessEngagement ? 0.8 : loudnessEngagement ? 0.6 : 0.3;

  // User is considered engaged if they have appropriate activity and it's not monotonous
  const isEngaged = loudnessEngagement && !isMonotonous;

  return { focusLevel, isEngaged, isSteady, isMonotonous };
}


let lastLoudnessCheck = 0;
/**
 * Detect if the activity is likely drawing/sketching based on loudness pattern
 * Drawing typically creates a bell curve pattern in loudness indices 17-21 with peak at 19
 *
 * @param {Array<number>} loudness - Array of normalized loudness values (0-1) for each frequency band
 * @returns {boolean} - True if the pattern suggests drawing activity
 */
function detectDrawing(loudness) {
  const { isDrawing } = state;
  //console.log(`checking if drawing`);
  // Need at least 24 loudness values
  if (!loudness || loudness.length < 24) return false;

  // Extract the relevant indices (18-20)
  const idx18 = loudness[18] || 0;
  const idx19 = loudness[19] || 0;
  const idx20 = loudness[20] || 0;

  // Check if there's sufficient activity in this range
  const avgActivity = (idx18 + idx19 + idx20) / 3;
  //console.log(`Average activity: ${avgActivity} (at idx18: ${idx18}, idx19: ${idx19}, idx20: ${idx20})`);
  // if already drawing, be more lenient
  if (isDrawing) {
    if (avgActivity < 0.25) return false; // Too quiet to be drawing
  } else {
    if (avgActivity < 0.3) return false; // Too quiet to be drawing
  }
  // Check for bell curve pattern: idx19 should be highest or near-highest
  // Being lenient as other sounds may interfere
  //const isPeakAt19 = idx19 >= idx18 * 0.88 && idx19 >= idx20 * 0.88;

  // Drawing is likely if we have a peak at 19
  return true;
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

