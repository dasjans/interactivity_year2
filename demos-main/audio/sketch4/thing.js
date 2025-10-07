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

// Technique 3: Tremolo nodes
let tremoloOscillator;
let tremoloGain;

// Technique 4: Experimental frequency filters for personalization
let experimentalFilters = []; // Array of bandpass filters being tested

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
      return JSON.parse(stored);
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
      totalSteadyTime: 0 // Time spent in steady state
    },
    // Filter experimentation data
    filterExperiments: {
      tested: [], // Array of tested filter configurations
      positive: [], // Filters that correlated with better focus
      negative: [], // Filters that correlated with worse focus
      currentExperiment: null // Active experiment or null
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
  localStorage.removeItem(STORAGE_KEY);
  userPreferences = loadUserPreferences();
  console.log(`User preferences reset`);
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
  //console.log(highShelfFilter);

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
    isMonotonous, steadyCount, focusLevel, isSteady } = ambientState;

  const now = audioCtx.currentTime;
  const tau = 0.15; // Threshold multiplier

  // === Technique 1: Adaptive Spectral Tilt ===
  // High-shelf cut when RMS/centroid above baseline
  if (rms > rmsBaseline + tau || centroid > centroidBaseline + tau) {
    // Gentle high-shelf cut (-0.5 to -1.5 dB)
    const cutAmount = -0.5 - (Math.min((rms - rmsBaseline) / tau, 1.0) * 1.0);
    //console.log(highShelfFilter);
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

  // === Technique 2: Layer Crossfader ===
  if (isEngaged && !isMonotonous) {
    // Crossfade to Near
    nearGain.gain.setTargetAtTime(1.0, now, 0.5); // 1.5-3s crossfade
    farGain.gain.setTargetAtTime(0.0, now, 0.5);
    nearLpf.frequency.setTargetAtTime(5000, now, 0.5);
    nearShelf.gain.setTargetAtTime(0.3, now, 0.5);
  } else {
    // Crossfade to Far
    nearGain.gain.setTargetAtTime(0.0, now, 0.5);
    farGain.gain.setTargetAtTime(0.7, now, 0.5); // Slightly reduced volume
    farLpf.frequency.setTargetAtTime(2000, now, 0.5);
    farShelf.gain.setTargetAtTime(-0.5, now, 0.5);
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
  updatePersonalization(focusLevel, isEngaged, isSteady);
  
  // Manage filter experimentation (called periodically, has internal logic)
  if (Math.random() < 0.01) { // 1% chance per call = check every ~10 seconds
    manageFilterExperiments();
  }
};

/**
 * Update personalization based on user behavior
 */
function updatePersonalization(focusLevel, isEngaged, isSteady) {
  // Comprehensive time tracking for better personalization
  userPreferences.sessionData.totalSessionTime += 0.1; // Roughly 100ms intervals

  if (isEngaged) {
    userPreferences.sessionData.totalEngagedTime += 0.1;
  }

  if (isSteady) {
    userPreferences.sessionData.totalSteadyTime += 0.1;
  }

  // Update current experiment if active
  if (userPreferences.filterExperiments.currentExperiment) {
    const experiment = userPreferences.filterExperiments.currentExperiment;
    experiment.duration += 0.1;
    experiment.focusTimeAccumulator += focusLevel * 0.1; // Weight by focus level
    
    if (isEngaged) {
      experiment.engagedTime += 0.1;
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
  { min: 1000, max: 1050, name: '1kHz-1.05kHz' },
  { min: 300, max: 310, name: '300-310Hz' },
  { min: 450, max: 465, name: '450-465Hz' },
  { min: 2000, max: 2100, name: '2kHz-2.1kHz' },
  { min: 750, max: 780, name: '750-780Hz' },
  { min: 3500, max: 3600, name: '3.5kHz-3.6kHz' },
  { min: 150, max: 165, name: '150-165Hz' },
  { min: 5000, max: 5200, name: '5kHz-5.2kHz' }
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
    notchFilter.type = 'notch';
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
    
    console.log(`Applied ${experimentalFilters.length} experimental filter(s):`, filterConfigs.map(f => f.name).join(', '));
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
  const filterToTest = untested.length > 0 
    ? untested[Math.floor(Math.random() * untested.length)]
    : filterCandidates[Math.floor(Math.random() * filterCandidates.length)];

  // Can test multiple filters at once (1-2 filters)
  const numFilters = Math.random() < 0.7 ? 1 : 2; // 70% chance of single filter
  const filtersToTest = [filterToTest];
  
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
    engagedTime: 0
  };

  applyExperimentalFilters(filtersToTest);
  console.log(`Started filter experiment:`, filtersToTest.map(f => f.name).join(' + '));
}

/**
 * End current filter experiment and evaluate results
 */
function endFilterExperiment() {
  const experiment = userPreferences.filterExperiments.currentExperiment;
  if (!experiment || experiment.duration < 5) return; // Need at least 5 seconds of data

  // Calculate metrics
  const avgFocusLevel = experiment.focusTimeAccumulator / experiment.duration;
  const engagementRatio = experiment.engagedTime / experiment.duration;
  
  // Determine if this filter helped or hurt
  // Threshold: avg focus > 0.6 and engagement > 0.5 = positive
  const isPositive = avgFocusLevel > 0.6 && engagementRatio > 0.5;
  
  const result = {
    filters: experiment.filters,
    avgFocusLevel,
    engagementRatio,
    duration: experiment.duration,
    timestamp: experiment.startTime
  };

  // Store result
  for (const filter of experiment.filters) {
    if (!userPreferences.filterExperiments.tested.find(t => t.name === filter.name)) {
      userPreferences.filterExperiments.tested.push(filter);
    }
  }

  if (isPositive) {
    userPreferences.filterExperiments.positive.push(result);
    console.log(`✓ Filter experiment positive:`, result.filters.map(f => f.name).join(' + '), `(focus: ${avgFocusLevel.toFixed(2)}, engagement: ${engagementRatio.toFixed(2)})`);
  } else {
    userPreferences.filterExperiments.negative.push(result);
    console.log(`✗ Filter experiment negative:`, result.filters.map(f => f.name).join(' + '), `(focus: ${avgFocusLevel.toFixed(2)}, engagement: ${engagementRatio.toFixed(2)})`);
  }

  // Clean up
  removeExperimentalFilters();
  userPreferences.filterExperiments.currentExperiment = null;
  saveUserPreferences(userPreferences);
}

/**
 * Manage filter experimentation cycle
 * Called periodically to start/stop experiments
 */
function manageFilterExperiments() {
  const { currentExperiment } = userPreferences.filterExperiments;

  if (currentExperiment) {
    // Check if experiment should end (20-30 seconds duration)
    const experimentDuration = (Date.now() - currentExperiment.startTime) / 1000;
    if (experimentDuration > 20 + Math.random() * 10) { // 20-30 seconds
      endFilterExperiment();
    }
  } else {
    // Maybe start new experiment (20% chance when called)
    if (Math.random() < 0.2) {
      startFilterExperiment();
    }
  }
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