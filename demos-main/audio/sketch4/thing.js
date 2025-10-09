import { interpolate, clamp } from '@ixfx/numbers.js';

// Audio context and nodes
let audioCtx;

// Technique 1: Adaptive Spectral Tilt nodes
let ambienceSource;
let ambienceGain;
let highShelfFilter;
let lowShelfFilter;

// Technique 2: Layer Crossfader nodes
let nearSource;
let farSource;
let nearGain;
let farGain;
let nearLpf;
let farLpf;
let nearShelf;
let farShelf;

// Distance modulation for near/far layers (sine wave for gradual energy changes)
let distanceModulation = {
  phase: 0, // Current phase of the sine wave
  baseFrequency: 0.05, // Very slow oscillation (~20 second cycle)
  erraticFactor: 0, // Random variation to make it slightly erratic
  lastUpdate: 0
};

// Technique 3: Tremolo nodes
let tremoloOscillator;
let tremoloGain;

// Technique 4: Experimental frequency filters for personalization
let experimentalFilters = []; // Array of bandpass filters being tested

// Session management
let sessionState = {
  startTime: Date.now(),
  unfocusedDuration: 0, // Time spent unfocused in current streak
  focusedDuration: 0, // Time spent focused in current streak
  lastFocusCheck: Date.now(),
  shouldEndSession: false,
  unfocusedThreshold: 30000, // 30 seconds of unfocused time ends session
  extendedFocusBonus: false // Whether we've extended the session due to good performance
};

// Audio buffer for ambience
let ambienceBuffer;

// User preferences stored in localStorage
const STORAGE_KEY = `focus_audio_preferences`;

/**
 * Load user preferences from localStorage
 */
function loadUserPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      console.log(`Loaded user preferences`, stored);
      const loaded = JSON.parse(stored);
      console.log(loaded);

      // Ensure backward compatibility and new fields exist
      if (!loaded.sessionData) loaded.sessionData = {};
      if (!loaded.sessionData.totalEngagedTime) loaded.sessionData.totalEngagedTime = loaded.sessionData.totalFocusTime || 0;
      if (!loaded.sessionData.totalSteadyTime) loaded.sessionData.totalSteadyTime = 0;
      if (!loaded.sessionData.totalSessionTime) loaded.sessionData.totalSessionTime = 0;
      if (!loaded.sessionData.totalFocusTime) loaded.sessionData.totalFocusTime = 0;
      if (!loaded.sessionData.currentSessionStart) loaded.sessionData.currentSessionStart = Date.now();
      if (!loaded.sessionData.sessionsCompleted) loaded.sessionData.sessionsCompleted = 0;
      if (!loaded.sessionData.avgSessionDuration) loaded.sessionData.avgSessionDuration = 0;
      if (!loaded.filterExperiments) {
        loaded.filterExperiments = {
          tested: [],
          positive: [],
          negative: [],
          currentExperiment: null,
          scores: {},
          activeFilters: [],
          lastRetestTime: 0
        };
      } else {
        // Ensure new fields exist in filterExperiments
        if (!loaded.filterExperiments.scores) loaded.filterExperiments.scores = {};
        if (!loaded.filterExperiments.activeFilters) loaded.filterExperiments.activeFilters = [];
        if (!loaded.filterExperiments.lastRetestTime) loaded.filterExperiments.lastRetestTime = 0;
        // Keep positive/negative for backward compatibility
        if (!loaded.filterExperiments.positive) loaded.filterExperiments.positive = [];
        if (!loaded.filterExperiments.negative) loaded.filterExperiments.negative = [];
      }

      return loaded;
    }
  } catch (e) {
    console.warn(`Could not load user preferences`, e);
  }
  return {
    rmsBaseline: 0.1,
    centroidBaseline: 0.5,
    preferredTremoloBpm: 76,
    nearCutoff: 5000,
    farCutoff: 2000,
    sessionData: {
      totalFocusTime: 0,
      totalSessionTime: 0,
      totalEngagedTime: 0, // Time spent in engaged state
      totalSteadyTime: 0, // Time spent in steady state
      currentSessionStart: Date.now(), // When current session started
      sessionsCompleted: 0, // Number of sessions completed
      avgSessionDuration: 0 // Average session duration
    },
    // Filter experimentation data with effectiveness scoring
    filterExperiments: {
      tested: [], // Array of tested filter configurations
      positive: [], // DEPRECATED - kept for backward compatibility
      negative: [], // DEPRECATED - kept for backward compatibility
      currentExperiment: null, // Active experiment or null
      scores: {}, // Map of filter name -> effectiveness score (-10 to +10 per test, cumulative up to 200)
      activeFilters: [], // Filters currently applied permanently (high positive scores)
      lastRetestTime: 0 // Timestamp of last retest
    }
  };
}

/**
 * Save user preferences to localStorage
 */
function saveUserPreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn(`Could not save user preferences`, e);
  }
}

let userPreferences = loadUserPreferences();

export function resetUserPreferences() {
  // Log summary if there were experiments
  const { scores, tested, activeFilters } = userPreferences.filterExperiments;
  const { totalSessionTime, totalFocusTime, totalEngagedTime, totalSteadyTime, sessionsCompleted, avgSessionDuration } = userPreferences.sessionData;

  if (tested.length > 0 || Object.keys(scores).length > 0) {
    console.log(`Filter Experiment Summary (before reset):`);
    console.log(`  Total tested: ${tested.length}`);
    console.log(`  Active filters: ${activeFilters.length}`);

    // Show scores
    const scoreEntries = Object.entries(scores).sort((a, b) => b[1] - a[1]); // Sort by score descending
    if (scoreEntries.length > 0) {
      console.log(`  Filter effectiveness scores:`);
      for (const [ filterName, score ] of scoreEntries) {
        const status = score >= 50 ? `✓ ACTIVE` : score > 20 ? `+ positive` : score < -20 ? `- negative` : `○ neutral`;
        console.log(`    ${filterName}: ${score} (${status})`);
      }
    }
  }

  // Log session statistics
  console.log(`\nSession Statistics:`);
  console.log(`  Total session time: ${(totalSessionTime / 60).toFixed(1)} minutes`);
  console.log(`  Total focus time: ${(totalFocusTime / 60).toFixed(1)} minutes`);
  console.log(`  Focus percentage: ${totalSessionTime > 0 ? ((totalFocusTime / totalSessionTime) * 100).toFixed(1) : 0}%`);
  console.log(`  Engaged time: ${(totalEngagedTime / 60).toFixed(1)} minutes`);
  console.log(`  Steady time: ${(totalSteadyTime / 60).toFixed(1)} minutes`);
  console.log(`  Sessions completed: ${sessionsCompleted}`);
  if (sessionsCompleted > 0) {
    console.log(`  Avg session duration: ${(avgSessionDuration / 60).toFixed(1)} minutes`);
  }

  // Complete current session before reset
  endCurrentSession();

  // Clear storage and reset
  localStorage.removeItem(STORAGE_KEY); // Clear storage
  userPreferences = loadUserPreferences(); // Reset to defaults
  saveUserPreferences(userPreferences);
  console.log(`\nUser preferences reset to defaults`);
  removeExperimentalFilters();

  // Reset session state
  sessionState = {
    startTime: Date.now(),
    unfocusedDuration: 0,
    focusedDuration: 0,
    lastFocusCheck: Date.now(),
    shouldEndSession: false,
    unfocusedThreshold: 30000,
    extendedFocusBonus: false
  };
}

/**
 * End current session and update session statistics
 */
function endCurrentSession() {
  const sessionDuration = (Date.now() - userPreferences.sessionData.currentSessionStart) / 1000;

  if (sessionDuration > 60) { // Only count sessions longer than 1 minute
    userPreferences.sessionData.sessionsCompleted += 1;
    const totalSessions = userPreferences.sessionData.sessionsCompleted;
    const prevAvg = userPreferences.sessionData.avgSessionDuration;

    // Update running average
    userPreferences.sessionData.avgSessionDuration =
      ((prevAvg * (totalSessions - 1)) + sessionDuration) / totalSessions;

    console.log(`Session ended. Duration: ${(sessionDuration / 60).toFixed(1)} minutes`);
  }

  // Start new session
  userPreferences.sessionData.currentSessionStart = Date.now();
  sessionState.startTime = Date.now();
  sessionState.unfocusedDuration = 0;
  sessionState.focusedDuration = 0;
  sessionState.shouldEndSession = false;
  sessionState.extendedFocusBonus = false;
  sessionState.unfocusedThreshold = 180000;

  saveUserPreferences(userPreferences);
}

/**
 * Get current session state for UI display
 * @returns {Object} Session state information
 */
export function getSessionState() {
  const sessionDuration = (Date.now() - sessionState.startTime) / 1000;
  const focusDuration = sessionState.focusedDuration / 1000;
  const unfocusDuration = sessionState.unfocusedDuration / 1000;

  return {
    sessionDuration,
    focusDuration,
    unfocusDuration,
    shouldEndSession: sessionState.shouldEndSession,
    extendedFocusBonus: sessionState.extendedFocusBonus,
    focusPercentage: sessionDuration > 0 ? (focusDuration / sessionDuration) * 100 : 0
  };
}

export const initAudio = async () => {
  if (audioCtx) return; // Already initialized
  audioCtx = new window.AudioContext();
  // Load audio file
  try {
    const response = await fetch(`../rainstorm.mp3`);
    const arrayBuffer = await response.arrayBuffer();
    ambienceBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    console.log(`Audio file loaded successfully`);
  } catch (e) {
    console.error(`Failed to load audio file:`, e);
    return;
  }

  // === Technique 1: Adaptive Spectral Tilt ===
  ambienceSource = audioCtx.createBufferSource();
  ambienceSource.buffer = ambienceBuffer;
  ambienceSource.loop = true;

  highShelfFilter = audioCtx.createBiquadFilter();
  highShelfFilter.type = `highshelf`;
  highShelfFilter.frequency.value = 5000;
  highShelfFilter.gain.value = 0;

  lowShelfFilter = audioCtx.createBiquadFilter();
  lowShelfFilter.type = `lowshelf`;
  lowShelfFilter.frequency.value = 200;
  lowShelfFilter.gain.value = 0;

  ambienceGain = audioCtx.createGain();
  ambienceGain.gain.value = 0.3;

  // === Technique 3: Tremolo (LFO modulation) ===
  tremoloOscillator = audioCtx.createOscillator();
  tremoloOscillator.type = `sine`;
  tremoloOscillator.frequency.value = userPreferences.preferredTremoloBpm / 60; // Convert BPM to Hz

  tremoloGain = audioCtx.createGain();
  tremoloGain.gain.value = 0.01; // Depth of tremolo (0.6-1.8 dB mapped to 0.007-0.021 amplitude)

  // === Technique 2: Near/Far Crossfader ===
  nearSource = audioCtx.createBufferSource();
  nearSource.buffer = ambienceBuffer;
  nearSource.loop = true;

  farSource = audioCtx.createBufferSource();
  farSource.buffer = ambienceBuffer;
  farSource.loop = true;

  nearGain = audioCtx.createGain();
  nearGain.gain.value = 1.0; // Start with near

  farGain = audioCtx.createGain();
  farGain.gain.value = 0.0;

  nearLpf = audioCtx.createBiquadFilter();
  nearLpf.type = `lowpass`;
  nearLpf.frequency.value = userPreferences.nearCutoff;
  nearLpf.Q.value = 0.707;

  farLpf = audioCtx.createBiquadFilter();
  farLpf.type = `lowpass`;
  farLpf.frequency.value = userPreferences.farCutoff;
  farLpf.Q.value = 0.707;

  nearShelf = audioCtx.createBiquadFilter();
  nearShelf.type = `highshelf`;
  nearShelf.frequency.value = 4000;
  nearShelf.gain.value = 0.3;

  farShelf = audioCtx.createBiquadFilter();
  farShelf.type = `highshelf`;
  farShelf.frequency.value = 4000;
  farShelf.gain.value = -0.5;

  // Connect tremolo LFO to gain modulation
  tremoloOscillator.connect(tremoloGain);
  tremoloGain.connect(ambienceGain.gain);

  // Connect Technique 1 chain
  ambienceSource.connect(highShelfFilter)
    .connect(lowShelfFilter)
    .connect(ambienceGain);

  // Connect Technique 2 chains
  nearSource.connect(nearLpf)
    .connect(nearShelf)
    .connect(nearGain);
  farSource.connect(farLpf)
    .connect(farShelf)
    .connect(farGain);

  // Merge both techniques to destination
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.7;

  ambienceGain.connect(masterGain);
  nearGain.connect(masterGain);
  farGain.connect(masterGain);

  masterGain.connect(audioCtx.destination);

  // Start all sources and oscillators
  ambienceSource.start();
  nearSource.start();
  farSource.start();
  tremoloOscillator.start();

  console.log(`Adaptive audio system initialized`);
};

export const getAudioCtx = () => audioCtx;

/**
 * Stop all audio playback
 */
export const stopAudio = () => {
  if (!audioCtx) return;

  // Stop all source nodes
  if (ambienceSource) {
    try {
      ambienceSource.stop();
    } catch (e) {
      // Already stopped
    }
  }
  if (nearSource) {
    try {
      nearSource.stop();
    } catch (e) {
      // Already stopped
    }
  }
  if (farSource) {
    try {
      farSource.stop();
    } catch (e) {
      // Already stopped
    }
  }

  console.log(`Audio playback stopped`);
};

/**
 * Start a new session (resets session state and restarts audio if needed)
 */
export const startNewSession = async () => {
  // End current session and reset
  endCurrentSession();

  // Reinitialize audio if needed
  if (audioCtx) {
    await initAudio();
  }

  console.log(`New session started`);
};

let warnCount;

/**
 * Update audio output based on thing and state
 * @param {Thing} thing
 * @param {Object} ambientState
 */
export const useAudio = (thing, ambientState) => {
  // Guard: Ensure all required nodes are initialized

  if (
    !audioCtx ||
    !highShelfFilter ||
    !lowShelfFilter ||
    !nearGain ||
    !farGain ||
    !nearLpf ||
    !farLpf ||
    !nearShelf ||
    !farShelf ||
    !tremoloGain ||
    !tremoloOscillator
  ) {
    if (warnCount === undefined) {
      warnCount = 0;
      console.log(`Audio nodes not initialized yet`);
    } else if (warnCount < 10) {
      warnCount++;
      console.warn(`Audio nodes not initialized yet`);
    }
    return; // Not initialized
  }

  const { rms, centroid, rmsBaseline, centroidBaseline, isEngaged,
    isMonotonous, steadyCount, focusLevel, isSteady, isDrawing } = ambientState;

  const now = audioCtx.currentTime;
  const tau = 0.15; // Threshold multiplier

  // === Technique 1: Adaptive Spectral Tilt ===
  // High-shelf cut when RMS/centroid above baseline
  if (rms > rmsBaseline + tau || centroid > centroidBaseline + tau) {
    // Gentle high-shelf cut (-0.5 to -1.5 dB)
    const cutAmount = -0.5 - (Math.min((rms - rmsBaseline) / tau, 1.0) * 1.0);
    highShelfFilter.gain.setTargetAtTime(cutAmount, now, 0.06); // 60ms attack
  } else {
    highShelfFilter.gain.setTargetAtTime(0, now, 0.2); // 200ms release
  }

  // Low-shelf lift when steady and light for >= 2 seconds (20 samples at 100ms interval)
  if (steadyCount >= 20 && rms < rmsBaseline + 0.1) {
    const liftAmount = 0.3 + (Math.min(steadyCount / 50, 1.0) * 0.3);
    lowShelfFilter.gain.setTargetAtTime(liftAmount, now, 0.06);
  } else {
    lowShelfFilter.gain.setTargetAtTime(0, now, 0.2);
  }

  // === Technique 2: Layer Crossfader with Gradual Distance Modulation ===
  // Update distance modulation (slightly erratic sine wave)
  const timeSinceLastUpdate = now - distanceModulation.lastUpdate;
  if (timeSinceLastUpdate > 0.1) { // Update every 100ms
    distanceModulation.lastUpdate = now;

    // Add small random variation to frequency for erratic effect
    if (Math.random() < 0.05) { // 5% chance to adjust erratic factor
      distanceModulation.erraticFactor = (Math.random() - 0.5) * 0.02; // ±0.01 frequency variation
    }

    const effectiveFreq = distanceModulation.baseFrequency + distanceModulation.erraticFactor;
    distanceModulation.phase += effectiveFreq * timeSinceLastUpdate * 2 * Math.PI;

    // Keep phase in 0-2π range
    if (distanceModulation.phase > 2 * Math.PI) {
      distanceModulation.phase -= 2 * Math.PI;
    }
  }

  // Calculate distance modulation value (-1 to 1 sine wave)
  const distanceWave = Math.sin(distanceModulation.phase);

  // Map sine wave to distance/energy parameters
  // When wave is positive: sounds feel closer/more energetic
  // When wave is negative: sounds feel farther/less energetic
  const energyModulation = 0.5 + distanceWave * 0.15; // 0.35 to 0.65 range

  if (isEngaged && !isMonotonous) {
    // Crossfade to Near with modulation
    const nearLevel = 1.0 * energyModulation;
    const farLevel = 0.0 + (1 - energyModulation) * 0.1; // Slight far layer for depth

    nearGain.gain.setTargetAtTime(nearLevel, now, 0.5); // 1.5-3s crossfade
    farGain.gain.setTargetAtTime(farLevel, now, 0.5);

    // Modulate filter cutoffs based on distance wave
    const nearCutoff = 5000 + distanceWave * 800; // 4200-5800 Hz
    nearLpf.frequency.setTargetAtTime(nearCutoff, now, 0.5);
    nearShelf.gain.setTargetAtTime(0.3 + distanceWave * 0.1, now, 0.5);
  } else {
    // Crossfade to Far with modulation
    const nearLevel = 0.0 + energyModulation * 0.1; // Slight near layer for presence
    const farLevel = 0.7 * (1 - energyModulation * 0.3); // 0.49 to 0.7 range

    nearGain.gain.setTargetAtTime(nearLevel, now, 0.5);
    farGain.gain.setTargetAtTime(farLevel, now, 0.5);

    // Modulate far layer filter
    const farCutoff = 2000 + distanceWave * 300; // 1700-2300 Hz
    farLpf.frequency.setTargetAtTime(farCutoff, now, 0.5);
    farShelf.gain.setTargetAtTime(-0.5 + distanceWave * 0.15, now, 0.5);
  }

  // === Technique 3: Tremolo ===
  // Adjust tremolo depth based on jitter (using RMS variance as proxy)
  const jitter = Math.abs(rms - rmsBaseline);

  if (jitter < 0.1) {
    // Low jitter: reduce depth (crisper)
    tremoloGain.gain.setTargetAtTime(0.007, now, 0.1); // ~0.6 dB
  } else {
    // High jitter: increase depth (wobbly)
    tremoloGain.gain.setTargetAtTime(0.018, now, 0.1); // ~1.5 dB
  }

  // Update tremolo BPM from state if needed
  const currentBpm = ambientState.currentTremoloBpm || 76;
  tremoloOscillator.frequency.setValueAtTime(currentBpm / 60, now);

  // Personalization: track session metrics
  updatePersonalization(focusLevel, isEngaged, isSteady, isDrawing);

  // Manage filter experimentation (called periodically, has internal logic)
  if (Math.random() < 0.01) { // 1% chance per call = check every ~10 seconds
    manageFilterExperiments();
  }
};

/**
 * Update personalization based on user behavior
 */
function updatePersonalization(focusLevel, isEngaged, isSteady, isDrawing) {
  // Comprehensive time tracking for better personalization
  userPreferences.sessionData.totalSessionTime += 0.1; // Roughly 100ms intervals

  // Track focus time (when focus level > 0.5)
  if (focusLevel > 0.5) {
    userPreferences.sessionData.totalFocusTime += 0.1;
  }

  if (isEngaged) {
    userPreferences.sessionData.totalEngagedTime += 0.1;
  }

  if (isSteady) {
    userPreferences.sessionData.totalSteadyTime += 0.1;
  }

  // Session management: track focused/unfocused streaks
  const now = Date.now();
  const timeSinceLastCheck = now - sessionState.lastFocusCheck;
  sessionState.lastFocusCheck = now;

  // Consider user focused if engaged AND drawing with decent focus
  const isCurrentlyFocused = isEngaged && isDrawing && focusLevel > 0.5;

  if (isCurrentlyFocused) {
    sessionState.focusedDuration += timeSinceLastCheck;
    sessionState.unfocusedDuration = 0; // Reset unfocused streak

    // Check if user has been doing exceptionally well (10+ minutes focused)
    if (sessionState.focusedDuration > 600000 && !sessionState.extendedFocusBonus) {
      sessionState.extendedFocusBonus = true;
      sessionState.unfocusedThreshold += 30000; // add 30 seconds to unfocused threshold permanently
      console.log(`🌟 Great focus! Session extended - you can take longer breaks.`);
    }
  } else {
    sessionState.unfocusedDuration += timeSinceLastCheck;
    sessionState.focusedDuration = Math.max(0, sessionState.focusedDuration - timeSinceLastCheck * 0.5); // Decay

    // Check if user has been unfocused too long
    if (sessionState.unfocusedDuration > sessionState.unfocusedThreshold) {
      sessionState.shouldEndSession = true;
      console.log(`⏸️ Unfocused for too long. Consider taking a break. Press 'R' to reset and start fresh.`);
    }
  }

  // Update current experiment if active
  if (userPreferences.filterExperiments.currentExperiment) {
    const experiment = userPreferences.filterExperiments.currentExperiment;
    experiment.duration += 0.1;
    experiment.focusTimeAccumulator += focusLevel * 0.1; // Weight by focus level

    if (isEngaged) {
      experiment.engagedTime += 0.1;
    }

    if (isDrawing) {
      experiment.drawingTime += 0.1;
    }

    if (isSteady) {
      experiment.steadyTime += 0.1;
    }
  }

  // Save preferences every ~5 seconds
  if (Math.random() < 0.02) { // 2% chance per call = ~5s at 100ms intervals
    saveUserPreferences(userPreferences);
  }
}

/**
 * Candidate filter configurations to test
 * Each filter removes a narrow frequency band to see if it helps or hurts focus
 */
const filterCandidates = [
  { min: 1000, max: 1050, name: `1kHz-1.05kHz` },
  { min: 300, max: 310, name: `300-310Hz` },
  { min: 450, max: 465, name: `450-465Hz` },
  { min: 2000, max: 2100, name: `2kHz-2.1kHz` },
  { min: 750, max: 780, name: `750-780Hz` },
  { min: 3500, max: 3600, name: `3.5kHz-3.6kHz` },
  { min: 150, max: 165, name: `150-165Hz` },
  { min: 5000, max: 5200, name: `5kHz-5.2kHz` }
];

/**
 * Apply experimental filters to the audio chain
 * @param {Array<Object>} filterConfigs - Array of {min, max, name} filter configurations
 */
function applyExperimentalFilters(filterConfigs) {
  if (!audioCtx || !ambienceGain) return;

  // Remove existing experimental filters
  removeExperimentalFilters();

  // Create new filters
  for (const config of filterConfigs) {
    const notchFilter = audioCtx.createBiquadFilter();
    notchFilter.type = `notch`;
    notchFilter.frequency.value = (config.min + config.max) / 2; // Center frequency
    notchFilter.Q.value = ((config.min + config.max) / 2) / (config.max - config.min); // Q based on bandwidth

    experimentalFilters.push({
      filter: notchFilter,
      config: config
    });
  }

  // Reconnect the audio chain with experimental filters
  if (experimentalFilters.length > 0) {
    // Disconnect existing connection
    ambienceSource.disconnect();

    // Rebuild chain: source -> experimental filters -> high shelf -> low shelf -> gain
    let currentNode = ambienceSource;

    for (const { filter } of experimentalFilters) {
      currentNode.connect(filter);
      currentNode = filter;
    }

    currentNode.connect(highShelfFilter);

    console.log(`Applied ${experimentalFilters.length} experimental filter(s):`, filterConfigs.map(f => f.name).join(`, `));
  }
}

/**
 * Remove all experimental filters and restore default audio chain
 */
function removeExperimentalFilters() {
  if (experimentalFilters.length > 0) {
    // Disconnect experimental filters
    for (const { filter } of experimentalFilters) {
      filter.disconnect();
    }
    experimentalFilters = [];

    // Restore original connection
    if (ambienceSource && highShelfFilter) {
      ambienceSource.disconnect();
      ambienceSource.connect(highShelfFilter);
    }

    console.log(`Removed experimental filters`);
  }
}

/**
 * Start a new filter experiment
 * Tests a random untested filter configuration or retests if all have been tried
 */
function startFilterExperiment() {
  if (!audioCtx) return;

  // Find untested filters
  const tested = userPreferences.filterExperiments.tested.map(t => t.name);
  const untested = filterCandidates.filter(f => !tested.includes(f.name));

  // If all tested, clear and start over (retesting with new data)
  const filterToTest = untested.length > 0 ? untested[Math.floor(Math.random() * untested.length)] : filterCandidates[Math.floor(Math.random() * filterCandidates.length)];

  // Can test multiple filters at once (1-2 filters)
  const numFilters = Math.random() < 0.7 ? 1 : 2; // 70% chance of single filter
  const filtersToTest = [ filterToTest ];

  if (numFilters === 2) {
    const otherFilters = filterCandidates.filter(f => f.name !== filterToTest.name);
    if (otherFilters.length > 0) {
      filtersToTest.push(otherFilters[Math.floor(Math.random() * otherFilters.length)]);
    }
  }

  userPreferences.filterExperiments.currentExperiment = {
    filters: filtersToTest,
    startTime: Date.now(),
    duration: 0,
    focusTimeAccumulator: 0,
    engagedTime: 0,
    drawingTime: 0, // Time spent drawing during experiment
    steadyTime: 0 // Time spent in steady state during experiment
  };

  applyExperimentalFilters(filtersToTest);
  console.log(`Started filter experiment:`, filtersToTest.map(f => f.name).join(` + `));
}

/**
 * End current filter experiment and evaluate results with effectiveness scoring
 */
function endFilterExperiment() {
  const experiment = userPreferences.filterExperiments.currentExperiment;
  if (!experiment || experiment.duration < 5) return; // Need at least 5 seconds of data

  // Calculate metrics
  const avgFocusLevel = experiment.focusTimeAccumulator / experiment.duration;
  const engagementRatio = experiment.engagedTime / experiment.duration;
  const drawingRatio = experiment.drawingTime / experiment.duration;
  const steadyRatio = experiment.steadyTime / experiment.duration;

  // Calculate effectiveness score (-10 to +10)
  // Based on user's state during the experiment
  let effectivenessScore = 0;

  // If user was actively drawing and focused
  if (drawingRatio > 0.3 && engagementRatio > 0.3) {
    // User was active - score based on focus improvement
    if (avgFocusLevel > 0.7 && steadyRatio > 0.5) {
      // High focus and steady - very positive (+8 to +10)
      effectivenessScore = 8 + Math.round((avgFocusLevel - 0.7) * 6.67); // Scale 0.7-1.0 to 8-10
    } else if (avgFocusLevel > 0.5) {
      // Moderate focus - moderately positive (+3 to +7)
      effectivenessScore = 3 + Math.round((avgFocusLevel - 0.5) * 20); // Scale 0.5-0.7 to 3-7
    } else if (avgFocusLevel < 0.4) {
      // Low focus despite activity - negative (-10 to -3)
      effectivenessScore = -10 + Math.round((avgFocusLevel - 0.2) * 35); // Scale 0.2-0.4 to -10 to -3
    } else {
      // Neutral to slightly positive (0 to +2)
      effectivenessScore = Math.round((avgFocusLevel - 0.4) * 20); // Scale 0.4-0.5 to 0-2
    }
  } else if (drawingRatio < 0.1 && engagementRatio < 0.2) {
    // User was not active - neutral result (can't determine filter effect)
    effectivenessScore = 0;
  } else {
    // Mixed activity - small score based on engagement
    if (engagementRatio > 0.5) {
      effectivenessScore = 2;
    } else {
      effectivenessScore = -1;
    }
  }

  // Clamp to range
  effectivenessScore = clamp(effectivenessScore, -10, 10);

  // Update scores for each filter tested
  for (const filter of experiment.filters) {
    const filterName = filter.name;
    if (!userPreferences.filterExperiments.scores[filterName]) {
      userPreferences.filterExperiments.scores[filterName] = 0;
    }

    // Add to cumulative score (cap at ±200)
    userPreferences.filterExperiments.scores[filterName] = clamp(
      userPreferences.filterExperiments.scores[filterName] + effectivenessScore,
      -200,
      200
    );

    // Track in tested array if not already there
    if (!userPreferences.filterExperiments.tested.find(t => t.name === filterName)) {
      userPreferences.filterExperiments.tested.push(filter);
    }
  }

  const result = {
    filters: experiment.filters,
    avgFocusLevel,
    engagementRatio,
    drawingRatio,
    steadyRatio,
    effectivenessScore,
    duration: experiment.duration,
    timestamp: experiment.startTime
  };

  // Log result
  const filterNames = result.filters.map(f => f.name).join(` + `);
  const scoreDisplay = effectivenessScore > 0 ? `+${effectivenessScore}` : effectivenessScore;
  const totalScores = result.filters.map(f => `${f.name}: ${userPreferences.filterExperiments.scores[f.name]}`).join(`, `);

  if (effectivenessScore > 5) {
    console.log(`✓✓ Filter experiment strongly positive: ${filterNames} (score: ${scoreDisplay}) [${totalScores}]`);
  } else if (effectivenessScore > 0) {
    console.log(`✓ Filter experiment positive: ${filterNames} (score: ${scoreDisplay}) [${totalScores}]`);
  } else if (effectivenessScore < -5) {
    console.log(`✗✗ Filter experiment strongly negative: ${filterNames} (score: ${scoreDisplay}) [${totalScores}]`);
  } else if (effectivenessScore < 0) {
    console.log(`✗ Filter experiment negative: ${filterNames} (score: ${scoreDisplay}) [${totalScores}]`);
  } else {
    console.log(`○ Filter experiment neutral: ${filterNames} (score: ${scoreDisplay}) [${totalScores}]`);
  }

  // Update active filters based on scores
  updateActiveFilters();

  // Clean up
  removeExperimentalFilters();
  userPreferences.filterExperiments.currentExperiment = null;
  saveUserPreferences(userPreferences);
}

/**
 * Update which filters are actively applied based on effectiveness scores
 */
function updateActiveFilters() {
  const scores = userPreferences.filterExperiments.scores;
  const newActiveFilters = [];

  // Apply filters with high positive scores (>= 50)
  for (const filterName in scores) {
    if (scores[filterName] >= 50) {
      const filterConfig = filterCandidates.find(f => f.name === filterName);
      if (filterConfig) {
        newActiveFilters.push(filterConfig);
      }
    }
  }

  userPreferences.filterExperiments.activeFilters = newActiveFilters;

  if (newActiveFilters.length > 0) {
    console.log(`Active filters updated:`, newActiveFilters.map(f => `${f.name} (${scores[f.name]})`).join(`, `));
  }
}

/**
 * Manage filter experimentation cycle
 * Called periodically to start/stop experiments and handle retesting
 */
function manageFilterExperiments() {
  const { currentExperiment, lastRetestTime, scores } = userPreferences.filterExperiments;

  if (currentExperiment) {
    // Check if experiment should end (20-30 seconds duration)
    const experimentDuration = (Date.now() - currentExperiment.startTime) / 1000;
    if (experimentDuration > 20 + Math.random() * 10) { // 20-30 seconds
      endFilterExperiment();
    }
  } else {
    const now = Date.now();

    // Check if it's time for a retest (approximately every 2 minutes = 120000ms)
    const timeSinceLastRetest = now - lastRetestTime;
    const shouldRetest = timeSinceLastRetest > 120000 && Object.keys(scores).length > 0;

    if (shouldRetest && Math.random() < 0.3) {
      // Retest a random filter that has been tested before
      const testedFilters = Object.keys(scores);
      const filterNameToRetest = testedFilters[Math.floor(Math.random() * testedFilters.length)];
      const filterToRetest = filterCandidates.find(f => f.name === filterNameToRetest);

      if (filterToRetest) {
        userPreferences.filterExperiments.currentExperiment = {
          filters: [ filterToRetest ],
          startTime: now,
          duration: 0,
          focusTimeAccumulator: 0,
          engagedTime: 0,
          drawingTime: 0,
          steadyTime: 0,
          isRetest: true
        };

        applyExperimentalFilters([ filterToRetest ]);
        userPreferences.filterExperiments.lastRetestTime = now;
        console.log(`🔄 Retesting filter:`, filterToRetest.name, `(current score: ${scores[filterNameToRetest]})`);
      }
    } else if (!shouldRetest && Math.random() < 0.2) {
      // Normal new experiment (20% chance when called)
      startFilterExperiment();
    }
  }

  // Apply active filters if not currently experimenting
  if (!currentExperiment) {
    applyActiveFilters();
  }
}

/**
 * Apply filters that have proven effective (high positive scores)
 */
function applyActiveFilters() {
  const { activeFilters } = userPreferences.filterExperiments;

  if (activeFilters.length > 0 && experimentalFilters.length === 0) {
    applyExperimentalFilters(activeFilters);
    console.log(`Applied ${activeFilters.length} active filter(s) based on effectiveness scores`);
  }
}

/**
 * Get current filter experiment status for UI display
 * @returns {string|null} - Description of active experiment or null
 */
export function getFilterExperimentStatus() {
  const { currentExperiment } = userPreferences.filterExperiments;
  if (!currentExperiment) return null;

  const filterNames = currentExperiment.filters.map(f => f.name).join(` + `);
  const duration = Math.floor((Date.now() - currentExperiment.startTime) / 1000);
  return `${filterNames} (${duration}s)`;
}

export { manageFilterExperiments };

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
  // Visual feedback could be added here
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