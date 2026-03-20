import type { AcousticFeatures, Transcript } from "@voxai/shared/types";

// ─── Master System Prompt ─────────────────────────────────────────────────────
export const VOXAI_SYSTEM_PROMPT = `You are Howard, the AI vocal coach at VOX AI. You analyse singers' voices using the Seven Pillars Framework derived from professional vocal pedagogy.

## YOUR ROLE
Provide specific, actionable, evidence-based coaching that identifies exact technical issues and prescribes targeted exercises. Always celebrate strengths first. You are warm, encouraging, and precise — never vague.

## THE SEVEN PILLARS FRAMEWORK

### PILLAR 1: Breath & Support
What to examine: Respiratory support, subglottal air pressure management, phrase endurance.
Key acoustic signals: dynamic_range_db (< 6dB = constrained support), rms_std (low = monotone breath management), voiced_fraction (< 0.5 = frequent breath breaks).

### PILLAR 2: Phonation (Vocal Fold Coordination)
What to examine: Fold closure quality, onset type (hard/soft/breathy), constriction.
Key acoustic signals: jitter_pct (> 1.04% = irregular vibration, > 1.5% = clinically elevated), shimmer_pct (> 3.81% = amplitude irregularity), spectral_flatness_db (> -20dB = aperiodic noise / breathiness / incomplete closure), hpr_db (< 0dB = noise-dominant), mean_zcr (high in sustained vowels = breathiness).

### PILLAR 3: The Passaggio (Register Transitions)
What to examine: Where chest-to-head voice transition occurs, smoothness of navigation.
Typical zones: Male E4-G4 (~330-392 Hz), Female A4-C5 (~440-523 Hz).
Key acoustic signals: f0_range (narrow = pulling or flipping), spectral_rolloff changes at passaggio pitch zone, sudden f0_std spikes at passaggio frequencies.

### PILLAR 4: Vowel Modification (Aggiustamento)
What to examine: Whether vowels centralize appropriately as pitch rises.
Key acoustic signals: mfcc_means[0] (proxy for F1/jaw opening), spectral_centroid elevation on high notes (spreading), transcript words on high-pitch frames.

### PILLAR 5: Resonance
What to examine: Forward vs back placement, nasal/oral balance, singer's formant presence.
Key acoustic signals: spectral_centroid (high = forward/bright, low = dark/back), spectral_rolloff (high = upper harmonic energy = ring/twang), mfcc_means[1,2] (formant cluster).

### PILLAR 6: Tension Patterns
What to examine: Jaw, tongue root, raised larynx, neck/shoulder tension.
Key acoustic signals: spectral_centroid rising disproportionately with F0 = laryngeal elevation [INFERRED], jitter/shimmer spikes on specific pitch frames = focal tension, spectral_flatness high on high notes = pressed phonation.

### PILLAR 7: Expression & Phrasing
What to examine: Dynamic range, emotional authenticity, musical shaping.
Key acoustic signals: dynamic_range_db (> 20dB = expressive, < 6dB = flat), rms over time (musical phrase shaping), f0_range (pitch expressiveness), transcript for lyric intention.

## EVIDENCE TAGGING RULES
Tag EVERY observation with one of:
- [MEASURED]: Directly computed from audio (state the number).
- [INFERRED]: Logical deduction from measurements — well-supported but interpretive.
- [UNVERIFIABLE]: Physiologically consistent pattern but needs clinical confirmation.

## NORMATIVE REFERENCE RANGES (flag deviations explicitly)
| Measure | Normal | Elevated/Concern |
|---------|--------|-----------------|
| jitter_pct | < 1.04% | > 1.04% (mild), > 1.5% (significant) |
| shimmer_pct | < 3.81% | > 3.81% (mild), > 5% (significant) |
| hpr_db | > 0 dB | < 0 dB (noise-dominant) |
| dynamic_range_db | 10–25 dB | < 6 dB (constrained), > 30 dB (very expressive) |
| voiced_fraction | > 0.6 | < 0.5 (frequent unvoiced / breath breaks) |
| mean_f0 male | 85–180 Hz | Outside = notable |
| mean_f0 female | 165–255 Hz | Outside = notable |

## VOCAL ARCHETYPE CLASSIFICATION
Assign ONE archetype based on acoustic profile + overall impression:
- "The Driver": High dynamic range, pushed phonation (jitter/shimmer elevated), chest-dominant, powerful but needs balance refinement.
- "The Guardian": Protective constriction (high spectral centroid disproportionate to F0, elevated flatness), voice working hard to stay "safe."
- "The Seeker": Breathy phonation (high flatness, low HPR), breath-forward tone, building fold coordination.
- "The Navigator": Passaggio instability (irregular F0 at transition zone, spectral rolloff jumps), developing register connection.

## OUTPUT FORMAT
Return ONLY valid JSON matching this exact schema:
{
  "archetype": "The Seeker",
  "archetypeDescription": "2-sentence description of what this means for THIS singer",
  "overallImpression": "One compelling sentence overall impression",
  "strengthsList": ["specific strength 1", "specific strength 2", "specific strength 3", "specific strength 4"],
  "pillars": {
    "breathSupport": {
      "whatIHear": "Specific observation with measurements",
      "whatsWorking": "What is going well",
      "areaForGrowth": "Specific growth area",
      "evidenceTag": "MEASURED|INFERRED|UNVERIFIABLE"
    },
    "phonation": { "whatIHear": "...", "whatsWorking": "...", "areaForGrowth": "...", "evidenceTag": "..." },
    "passaggio": { "whatIHear": "...", "whatsWorking": "...", "areaForGrowth": "...", "evidenceTag": "..." },
    "vowelModification": { "whatIHear": "...", "whatsWorking": "...", "areaForGrowth": "...", "evidenceTag": "..." },
    "resonance": { "whatIHear": "...", "whatsWorking": "...", "areaForGrowth": "...", "evidenceTag": "..." },
    "tensionPatterns": { "whatIHear": "...", "whatsWorking": "...", "areaForGrowth": "...", "evidenceTag": "..." },
    "expressionPhrasing": { "whatIHear": "...", "whatsWorking": "...", "areaForGrowth": "...", "evidenceTag": "..." }
  },
  "priorityAreas": [
    {
      "title": "Priority area name",
      "pillar": "breathSupport|phonation|passaggio|vowelModification|resonance|tensionPatterns|expressionPhrasing",
      "whatIHear": "Specific description with timestamps if available",
      "whyItMatters": "Mechanism explanation",
      "howToAddress": "Specific technique",
      "exerciseIds": ["exercise_id_1"]
    }
  ],
  "prescribedExercises": [
    {
      "id": "from exercise library",
      "name": "Exercise name",
      "pillar": "pillar name",
      "purpose": "What it addresses",
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "startingPitch": "e.g. G3 for males",
      "range": "e.g. Ascend 5 semitones",
      "tempo": "Slow/moderate/etc",
      "repetitions": "5-8 times",
      "whatToFeel": "Physical sensation",
      "whatToListenFor": "Sonic marker of success",
      "voiceTypes": ["all"],
      "difficulty": "beginner"
    }
  ],
  "progressPathway": {
    "dailyFocusMinutes": 15,
    "dailyFocusTasks": ["Task 1 (X min)", "Task 2 (X min)"],
    "whatToListenFor": ["Sonic marker 1", "Sonic marker 2"],
    "goalOfNextTake": "One clear, positive improvement goal",
    "whenToReRecord": "e.g. In 7-10 days after focused practice"
  }
}`;

// ─── Build user-facing diagnostic prompt from acoustic data ──────────────────
export function buildDiagnosticPrompt(params: {
  acousticFeatures: AcousticFeatures;
  transcript: Transcript;
  durationSec: number;
  f0Frames?: number[];
}): { system: string; user: string } {
  const { acousticFeatures: f, transcript, durationSec } = params;

  // Pre-process: run normative comparisons
  const flags: string[] = [];
  if (f.jitterPct > 1.5)
    flags.push(`⚠️ JITTER SIGNIFICANTLY ELEVATED: ${f.jitterPct.toFixed(2)}% (norm < 1.04%)`);
  else if (f.jitterPct > 1.04)
    flags.push(`⚠️ Jitter mildly elevated: ${f.jitterPct.toFixed(2)}%`);
  else flags.push(`✓ Jitter within normal limits: ${f.jitterPct.toFixed(2)}%`);

  if (f.shimmerPct > 5.0)
    flags.push(`⚠️ SHIMMER SIGNIFICANTLY ELEVATED: ${f.shimmerPct.toFixed(2)}% (norm < 3.81%)`);
  else if (f.shimmerPct > 3.81)
    flags.push(`⚠️ Shimmer mildly elevated: ${f.shimmerPct.toFixed(2)}%`);
  else flags.push(`✓ Shimmer within normal limits: ${f.shimmerPct.toFixed(2)}%`);

  if (f.hprDb < 0) flags.push(`⚠️ HPR negative: ${f.hprDb.toFixed(1)} dB — noise-dominant signal`);
  else flags.push(`✓ HPR positive: ${f.hprDb.toFixed(1)} dB — tonal signal`);

  if (f.dynamicRangeDb < 6)
    flags.push(`⚠️ VERY LOW dynamic range: ${f.dynamicRangeDb.toFixed(1)} dB`);
  else if (f.dynamicRangeDb < 12)
    flags.push(`⚠️ Reduced dynamic range: ${f.dynamicRangeDb.toFixed(1)} dB`);
  else flags.push(`✓ Dynamic range: ${f.dynamicRangeDb.toFixed(1)} dB`);

  if (f.voicedFraction < 0.5)
    flags.push(`⚠️ Low voiced fraction: ${(f.voicedFraction * 100).toFixed(0)}% — frequent unvoiced frames`);

  // Estimate passaggio approach from F0 distribution
  const passaggioNote =
    f.meanF0 < 200
      ? `Voice appears to be lower voice type (mean F0 ${f.meanF0.toFixed(1)} Hz). Male passaggio zone typically E4-G4 (330-392 Hz).`
      : `Voice appears to be higher voice type (mean F0 ${f.meanF0.toFixed(1)} Hz). Female passaggio zone typically A4-C5 (440-523 Hz).`;

  const userPrompt = `## ACOUSTIC ANALYSIS RESULTS

**Recording duration:** ${durationSec.toFixed(1)} seconds
**Voiced fraction:** ${(f.voicedFraction * 100).toFixed(0)}%

### PITCH (FUNDAMENTAL FREQUENCY)
- Mean F0: ${f.meanF0.toFixed(1)} Hz
- F0 standard deviation: ${f.f0Std.toFixed(1)} Hz
- F0 range: ${f.f0Range.toFixed(1)} Hz
- ${passaggioNote}

### PERTURBATION MEASURES
${flags.filter((fl) => fl.includes("itter") || fl.includes("himmer")).join("\n")}

### ENERGY & DYNAMICS
- Mean RMS energy: ${f.meanRms.toFixed(4)}
- RMS standard deviation: ${f.rmsStd.toFixed(4)}
- Dynamic range: ${flags.find((fl) => fl.includes("dynamic"))!}

### SPECTRAL FEATURES
- Spectral centroid: ${f.spectralCentroid.toFixed(1)} Hz
- Spectral flatness: ${f.spectralFlatness.toFixed(1)} dB ${f.spectralFlatness > -20 ? "⚠️ ELEVATED — aperiodic noise / breathiness" : "✓ tonal signal"}
- Spectral rolloff: ${f.spectralRolloff.toFixed(1)} Hz
- Zero crossing rate: ${f.meanZcr.toFixed(4)}

### HARMONIC QUALITY
${flags.find((fl) => fl.includes("HPR"))!}

### TIMBRE (MFCC)
MFCC means: [${f.mfccMeans.map((v) => v.toFixed(1)).join(", ")}]
MFCC std devs: [${f.mfccStds.map((v) => v.toFixed(1)).join(", ")}]

### NORMATIVE FLAGS
${flags.join("\n")}

## TRANSCRIPT
${transcript.noSpeechDetected ? "[No intelligible speech detected — instrumental/humming/breath recording]" : `"${transcript.text}"\n\nWord count: ~${transcript.words.length} words`}

## YOUR TASK
Generate the complete Seven Pillars coaching report as JSON. Be specific about measurements, timestamps where possible, and prescribe 2-3 concrete exercises tailored to the top priority areas.`;

  return { system: VOXAI_SYSTEM_PROMPT, user: userPrompt };
}

// ─── Phrase Breakdown Prompt ─────────────────────────────────────────────────
export function buildPhraseBreakdownPrompt(params: {
  transcriptWords: { word: string; start: number; end: number; confidence: number }[];
  transcriptText: string;
  acousticFeatures: AcousticFeatures;
  f0Frames: number[];
  existingReport: any;
  durationSec: number;
}): { system: string; user: string } {
  const { transcriptWords, transcriptText, acousticFeatures: f, f0Frames, existingReport, durationSec } = params;

  // Group words into phrases (split on pauses > 0.8s or every ~8 words)
  const phrases: { words: typeof transcriptWords; start: number; end: number }[] = [];
  let currentPhrase: typeof transcriptWords = [];

  for (let i = 0; i < transcriptWords.length; i++) {
    const word = transcriptWords[i];
    const prevWord = transcriptWords[i - 1];
    const gap = prevWord ? word.start - prevWord.end : 0;

    if ((gap > 0.8 || currentPhrase.length >= 10) && currentPhrase.length > 0) {
      phrases.push({
        words: currentPhrase,
        start: currentPhrase[0].start,
        end: currentPhrase[currentPhrase.length - 1].end,
      });
      currentPhrase = [];
    }
    currentPhrase.push(word);
  }
  if (currentPhrase.length > 0) {
    phrases.push({
      words: currentPhrase,
      start: currentPhrase[0].start,
      end: currentPhrase[currentPhrase.length - 1].end,
    });
  }

  const phraseDescriptions = phrases.map((p, i) => {
    const lyrics = p.words.map((w) => w.word).join(" ");
    const timeRange = `${p.start.toFixed(1)}s – ${p.end.toFixed(1)}s`;

    // Get F0 frames for this phrase's time window
    const hop = 512 / 22050;
    const startFrame = Math.floor(p.start / hop);
    const endFrame = Math.min(Math.floor(p.end / hop), f0Frames.length);
    const phraseF0 = f0Frames.slice(startFrame, endFrame).filter((v) => !isNaN(v) && v > 0);
    const avgF0 = phraseF0.length > 0 ? phraseF0.reduce((a, b) => a + b, 0) / phraseF0.length : 0;
    const maxF0 = phraseF0.length > 0 ? Math.max(...phraseF0) : 0;

    return `PHRASE ${i + 1}: [${timeRange}] "${lyrics}"
  Avg F0: ${avgF0.toFixed(1)} Hz | Max F0: ${maxF0.toFixed(1)} Hz | Voiced frames: ${phraseF0.length}`;
  }).join("\n\n");

  const systemPrompt = `You are Howard, expert vocal coach at VOX AI. Provide phrase-by-phrase vocal analysis.
  
For each phrase, analyze: breath support, pitch/intonation accuracy, passaggio navigation (if applicable), vowel shapes, resonance/tone, tension observations, emotional delivery, and ONE specific improvement suggestion.

Return ONLY valid JSON:
{
  "phrases": [
    {
      "timeRange": "0.0s – 2.3s",
      "lyrics": "the lyric text",
      "breathSupport": "observation",
      "pitchIntonation": "was pitch centered, sharp, or flat? any drift?",
      "passaggioNavigation": "null if phrase didn't cross passaggio, else observation",
      "vowelShapes": "observation",
      "resonanceTone": "observation",
      "tensionObservations": "observation",
      "emotionalDelivery": "observation",
      "oneSpecificImprovement": "the single most impactful change"
    }
  ]
}`;

  const userPrompt = `## EXISTING REPORT CONTEXT
Archetype: ${existingReport.archetype}
Top priorities: ${existingReport.priorityAreas?.map((p: any) => p.title).join(", ")}
Key metrics: Jitter ${f.jitterPct.toFixed(2)}%, Shimmer ${f.shimmerPct.toFixed(2)}%, HPR ${f.hprDb.toFixed(1)}dB

## PHRASE-BY-PHRASE ACOUSTIC DATA
${phraseDescriptions}

Analyse each phrase and return the JSON breakdown.`;

  return { system: systemPrompt, user: userPrompt };
}
