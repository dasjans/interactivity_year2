# Focus-Adaptive Audio System

An intelligent ambient audio system that uses microphone input to detect user focus patterns and adapts playback in real-time to enhance concentration.

## Overview

This project implements three adaptive audio techniques that respond to user activity patterns detected through microphone analysis:

1. **Adaptive Spectral Tilt** - Adjusts tone warmth based on activity steadiness
2. **Near/Far Crossfader** - Sound "approaches" when engaged, "recedes" when idle  
3. **Micro-Pulse Tremolo** - Subtle rhythm that adapts to activity patterns

## How It Works

### Focus Detection

The system analyzes microphone input using Meyda to extract audio features:
- **RMS (Root Mean Square)** - Overall loudness/activity level
- **Spectral Centroid** - Brightness of sound
- **Zero Crossing Rate** - Rate of signal changes

Focus is determined by analyzing variance in these features:
- **Low variance** = Steady, focused activity (e.g., drawing, writing)
- **High variance** = Erratic, unfocused activity
- **Appropriate activity level** = Not silent, not too loud

### Adaptive Techniques

#### 1. Adaptive Spectral Tilt

**What it does:** Adjusts the tonal quality of ambient sound to reward steady behavior.

**How it works:**
- Monitors RMS and spectral centroid against learned baselines
- When activity exceeds baseline + threshold (τ = 0.15):
  - Applies gentle high-shelf filter cut (-0.5 to -1.5 dB @ 5kHz)
  - Attack: 60ms, Release: 200ms
- When strokes are steady for ≥2 seconds:
  - Applies low-shelf lift (+0.3 to +0.6 dB @ 200Hz)
  - Makes sound warmer and more pleasant

**Personalization:** 
- Baselines adapt over time using Exponential Moving Average (EMA, α = 0.05)
- User preferences stored in localStorage

#### 2. Layer Crossfader with Distance Filter

**What it does:** Creates spatial depth by crossfading between "near" and "far" versions of the same ambient sound.

**How it works:**
- Two versions of rainstorm.mp3 with different processing:
  - **Near**: Brighter, less filtered (LPF @ 5kHz, +0.3dB shelf)
  - **Far**: Darker, more filtered (LPF @ 2kHz, -0.5dB shelf)
- When engaged:
  - Crossfades to Near over 1.5-3s
  - Sound feels closer and more present
- When idle or monotonous (>8s inactivity):
  - Crossfades to Far
  - Sound recedes into background

**Personalization:**
- Tracks which cutoff frequencies correlate with longer focus sessions
- Stores preferred Near/Far settings per user

#### 3. Masked Micro-Pulse via Tremolo

**What it does:** Adds subtle rhythmic movement to help pace activity without being distracting.

**How it works:**
- Oscillator modulates ambience gain at 72-84 BPM
- Depth: 0.6-1.8 dB (mapped to 0.007-0.021 amplitude)
- Adapts based on activity "jitter":
  - Low jitter → Reduce depth (crisper, steadier feel)
  - High jitter → Increase depth (wobbly, discourages chaos)

**Personalization:**
- Treats BPM as a 4-arm bandit problem
- Learns which tempo maximizes focus time for this user
- Current implementation uses default 76 BPM with adaptive depth

### User Behavior Learning

The system learns from user behavior over time:

1. **Baseline Adaptation**
   - RMS and centroid baselines adjust using EMA
   - Slow adaptation (α = 0.05) prevents rapid drift
   - Captures individual work style

2. **Session Tracking**
   - Total session time
   - Total focus time
   - Engagement patterns

3. **Personalization Storage**
   - Preferences saved to localStorage
   - Includes baselines, preferred BPM, filter cutoffs
   - Persists across sessions

## Technical Implementation

### Audio Architecture

```
Microphone Input → Meyda Analysis → Focus Detection → State Update
                                                            ↓
                            ┌───────────────────────────────┘
                            ↓
┌─────────── Technique 1: Adaptive Spectral Tilt ───────────┐
│  Audio Buffer → High-Shelf Filter → Low-Shelf Filter      │
│                           ↓                                │
│                    Tremolo LFO (Technique 3)               │
│                           ↓                                │
│                      Gain Node → Master                    │
└────────────────────────────────────────────────────────────┘

┌──────────── Technique 2: Near/Far Crossfader ─────────────┐
│  Near Buffer → LPF (5kHz) → High-Shelf → Gain → Master    │
│  Far Buffer → LPF (2kHz) → High-Shelf → Gain → Master     │
└────────────────────────────────────────────────────────────┘
```

### Key Files

- **script.js** - Main application, focus detection, state management
- **thing.js** - Audio setup and adaptive technique implementation  
- **index.html** - UI and instructions

### Audio Nodes Used

- `BufferSourceNode` - Audio playback
- `BiquadFilterNode` - High-shelf, low-shelf, low-pass filters
- `GainNode` - Volume control and crossfading
- `OscillatorNode` - Tremolo LFO generation

## Usage

1. **Click anywhere** to start audio (browser requirement)
2. Grant microphone permission when prompted
3. Begin your focused activity (drawing, writing, etc.)
4. The system will:
   - Learn your baseline activity patterns
   - Adapt audio in real-time
   - Store preferences for future sessions

## Focus Monitor Display

The UI shows real-time status:
- **Engagement** - ✓ Engaged or ○ Not Engaged
- **Focus Level** - 0-100% based on activity analysis
- **Activity Level** - Current RMS as percentage
- **Steady Count** - How long steady behavior has been maintained

## Future Enhancements

Potential improvements:
- Multi-armed bandit for tremolo BPM optimization
- Scene swapping for extended monotony (>30-45s)
- Onset detection for more nuanced activity tracking
- Visual feedback showing which technique is active
- Configurable parameters via UI controls
- Export/import of user preferences

## Dependencies

- **Meyda** - Audio feature extraction library
- **ixfx** - Utility functions for normalization and continuous loops
- **Web Audio API** - Native browser audio processing

## Browser Compatibility

Requires modern browser with:
- Web Audio API support
- MediaDevices.getUserMedia() for microphone
- localStorage for personalization
- ES6 modules support
