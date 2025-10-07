# Focus-Adaptive Audio System Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     MICROPHONE INPUT                             │
│                  (User Activity Sounds)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MEYDA ANALYSIS                                │
│   Features: RMS, Spectral Centroid, Loudness, ZCR               │
│   Sample Rate: ~100ms intervals                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FOCUS DETECTION                                 │
│                                                                   │
│  History Buffers (20 samples):                                   │
│  • RMS History → Calculate Variance                              │
│  • Centroid History → Calculate Variance                         │
│                                                                   │
│  Metrics Computed:                                               │
│  • Low variance = Steady, Focused                                │
│  • High variance = Erratic, Unfocused                            │
│  • Moderate RMS = Engaged (not silent, not too loud)             │
│  • Very low variance = Monotonous                                │
│                                                                   │
│  Baselines (EMA α=0.05):                                         │
│  • RMS Baseline - adapts to user's typical volume                │
│  • Centroid Baseline - adapts to typical sound brightness        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STATE UPDATES                                 │
│                                                                   │
│  Focus Metrics:                                                  │
│  • focusLevel: 0.3 (low) to 0.8 (high)                          │
│  • isEngaged: boolean                                            │
│  • isSteady: boolean                                             │
│  • isMonotonous: boolean                                         │
│  • steadyCount: continuous steady samples                        │
│                                                                   │
│  Activity Tracking:                                              │
│  • lastActivityTime: timestamp of last meaningful sound          │
│  • Idle detection: >8s without activity                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              ADAPTIVE AUDIO TECHNIQUES                           │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  TECHNIQUE 1: Adaptive Spectral Tilt                      │  │
│  │                                                            │  │
│  │  rainstorm.mp3 (looping)                                  │  │
│  │       ↓                                                    │  │
│  │  High-Shelf Filter (5kHz)                                 │  │
│  │  • Gain: 0 to -1.5 dB                                     │  │
│  │  • Triggered when: RMS/Centroid > baseline + 0.15         │  │
│  │  • Attack: 60ms, Release: 200ms                           │  │
│  │       ↓                                                    │  │
│  │  Low-Shelf Filter (200Hz)                                 │  │
│  │  • Gain: 0 to +0.6 dB                                     │  │
│  │  • Triggered when: steady ≥2s AND light activity          │  │
│  │       ↓                                                    │  │
│  │  Tremolo Modulation (Technique 3)                         │  │
│  │       ↓                                                    │  │
│  │  Gain Node (0.3) → Master                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  TECHNIQUE 2: Near/Far Crossfader                         │  │
│  │                                                            │  │
│  │  NEAR Track:                       FAR Track:             │  │
│  │  rainstorm.mp3                     rainstorm.mp3          │  │
│  │       ↓                                  ↓                 │  │
│  │  LPF (5kHz, Q=0.707)              LPF (2kHz, Q=0.707)     │  │
│  │       ↓                                  ↓                 │  │
│  │  High-Shelf (+0.3dB)              High-Shelf (-0.5dB)     │  │
│  │       ↓                                  ↓                 │  │
│  │  Gain (0-1.0) ──────crossfade──────▶ Gain (0-0.7)        │  │
│  │       │                                  │                 │  │
│  │       └──────────────┬───────────────────┘                │  │
│  │                      ↓                                     │  │
│  │                  Master Mix                                │  │
│  │                                                            │  │
│  │  Crossfade Logic:                                         │  │
│  │  • Engaged: Near (1.0) / Far (0.0)                        │  │
│  │  • Idle/Monotonous: Near (0.0) / Far (0.7)                │  │
│  │  • Transition: 1.5-3s (setTargetAtTime τ=0.5)             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  TECHNIQUE 3: Micro-Pulse Tremolo                         │  │
│  │                                                            │  │
│  │  Oscillator (Sine Wave)                                   │  │
│  │  • Frequency: 72-84 BPM (1.2-1.4 Hz)                      │  │
│  │  • Current default: 76 BPM (1.27 Hz)                      │  │
│  │       ↓                                                    │  │
│  │  Tremolo Gain Node                                        │  │
│  │  • Depth: 0.007-0.018 (0.6-1.8 dB)                        │  │
│  │  • Low jitter → 0.007 (crisp)                             │  │
│  │  • High jitter → 0.018 (wobbly)                           │  │
│  │       ↓                                                    │  │
│  │  Modulates: Technique 1 Gain Node                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PERSONALIZATION                                │
│                                                                   │
│  localStorage: 'focus_audio_preferences'                         │
│  {                                                               │
│    rmsBaseline: 0.1,            // Learned user baseline         │
│    centroidBaseline: 0.5,       // Learned user baseline         │
│    preferredTremoloBpm: 76,     // Optimal tempo for user        │
│    nearCutoff: 5000,            // Best near filter for user     │
│    farCutoff: 2000,             // Best far filter for user      │
│    sessionData: {                                                │
│      totalFocusTime: 0,         // Cumulative engaged time       │
│      totalSessionTime: 0        // Total usage time              │
│    }                                                             │
│  }                                                               │
│                                                                   │
│  Auto-save: ~5 second intervals (2% probability per call)        │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUDIO OUTPUT                                  │
│           (Speakers/Headphones)                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Parameters

### Focus Detection
| Parameter | Value | Purpose |
|-----------|-------|---------|
| focusWindowSize | 20 samples | History buffer size for variance calculation |
| steadyThreshold | 0.15 | Variance threshold for "steady" classification |
| idleTimeoutMs | 8000ms | Time before user considered idle |
| emaAlpha | 0.05 | Exponential moving average smoothing factor |

### Adaptive Spectral Tilt
| Parameter | Value | Purpose |
|-----------|-------|---------|
| High-Shelf Freq | 5000 Hz | Brightness control frequency |
| High-Shelf Gain | -0.5 to -1.5 dB | Cut amount when over-active |
| Low-Shelf Freq | 200 Hz | Warmth control frequency |
| Low-Shelf Gain | +0.3 to +0.6 dB | Boost amount when steady |
| Attack Time | 60ms | How fast filters respond |
| Release Time | 200ms | How fast filters relax |

### Near/Far Crossfader
| Parameter | Near Value | Far Value | Purpose |
|-----------|------------|-----------|---------|
| LPF Cutoff | 5000 Hz | 2000 Hz | Spatial depth control |
| High-Shelf Gain | +0.3 dB | -0.5 dB | Brightness difference |
| Max Gain | 1.0 | 0.7 | Volume difference |
| Crossfade Time | 1.5-3s | 1.5-3s | Smooth transitions |

### Tremolo
| Parameter | Min | Max | Purpose |
|-----------|-----|-----|---------|
| BPM Options | 72 | 84 | Pace variations (4 choices) |
| Depth Range | 0.007 | 0.018 | Amplitude modulation (0.6-1.8 dB) |

## Update Loop Timing

```
┌──────────────────────────────┐
│  Meyda Analysis: ~20-50ms    │  Audio buffer size dependent
│  (driven by Web Audio API)   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  State Update: 200ms         │  Process focus metrics
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Audio Update: 10ms          │  Apply adaptive techniques
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Thing Update: 100ms         │  Visual state (legacy)
└──────────────────────────────┘
```

## Web Audio API Node Graph

```
┌─────────────────┐
│ AudioContext    │
└────────┬────────┘
         │
         ├───────────────────────────────────────────────────────┐
         │                                                        │
         │  TECHNIQUE 1 CHAIN                                    │
         │                                                        │
    ┌────▼─────────┐      ┌──────────┐      ┌──────────┐        │
    │BufferSource  │─────▶│HighShelf │─────▶│ LowShelf │        │
    │(ambienceSource)     │ Filter   │      │ Filter   │        │
    └──────────────┘      └──────────┘      └────┬─────┘        │
                                                  │              │
    ┌──────────────┐      ┌──────────┐          │              │
    │ Oscillator   │─────▶│ Tremolo  │          │              │
    │(tremoloOsc)  │      │   Gain   │──────────┼──────┐       │
    └──────────────┘      └──────────┘          │      │       │
                                                 │      │       │
                                            ┌────▼──────▼─┐     │
                                            │  Ambience   │     │
                                            │    Gain     │     │
                                            └────┬────────┘     │
                                                 │              │
         ┌───────────────────────────────────────┘              │
         │                                                       │
         │  TECHNIQUE 2 CHAIN                                   │
         │                                                       │
    ┌────▼─────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
    │BufferSource  │─────▶│   LPF    │─────▶│HighShelf │─────▶│   Near   │
    │(nearSource)  │      │  (5kHz)  │      │(+0.3 dB) │      │   Gain   │
    └──────────────┘      └──────────┘      └──────────┘      └────┬─────┘
                                                                     │
    ┌──────────────┐      ┌──────────┐      ┌──────────┐           │
    │BufferSource  │─────▶│   LPF    │─────▶│HighShelf │─────▶┌────▼─────┐
    │(farSource)   │      │  (2kHz)  │      │(-0.5 dB) │      │   Far    │
    └──────────────┘      └──────────┘      └──────────┘      │   Gain   │
                                                               └────┬─────┘
                                                                    │
         ┌──────────────────────────────────────────────────────────┘
         │
    ┌────▼────────┐
    │   Master    │
    │    Gain     │
    └────┬────────┘
         │
    ┌────▼────────┐
    │ Destination │
    │ (Speakers)  │
    └─────────────┘
```

## Data Flow Sequence

1. **Input** → Microphone captures pencil/pen sounds
2. **Analysis** → Meyda extracts RMS, Centroid, Loudness, ZCR
3. **Normalization** → Stream normalizers scale to 0-1 range
4. **History** → Last 20 samples stored for variance calculation
5. **Focus Detection** → Variance analysis determines engagement
6. **Baseline Adaptation** → EMA updates user-specific baselines
7. **Audio Modulation** → Three techniques applied simultaneously:
   - Spectral tilt adjusts tone warmth
   - Crossfader controls spatial depth
   - Tremolo adds rhythmic pulse
8. **Personalization** → Preferences saved to localStorage
9. **UI Update** → Status display shows current metrics
10. **Audio Output** → Modulated ambience plays through speakers

## Future Enhancements

### Ready to Implement
- [ ] Multi-armed bandit for BPM selection
- [ ] Scene swapping after prolonged monotony (>45s)
- [ ] Onset detection for more nuanced activity tracking
- [ ] Export/import user preferences

### Requires Additional Work
- [ ] Multiple ambience scene library
- [ ] Advanced onset pattern recognition
- [ ] Machine learning for preference optimization
- [ ] Cloud sync for multi-device preferences
