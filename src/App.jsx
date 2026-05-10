import React, { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_RULES = {
  modes: {
    major: {
      directTransitions: {
        I: ["IV", "II6", "V", "VI", "I6", "IV6", "V64", "VII6"],
        II: ["V", "VII6", "IV", "I", "VI", "III"],
        II6: ["V"],
        III: ["VI", "IV", "II", "V", "I"],
        IV: ["V", "I", "II", "VII6", "VI"],
        IV6: ["V"],
        V: ["I", "VI", "IV", "II", "VII6", "III"],
        VI: ["II", "II6", "IV", "V", "III", "I", "VII6"],
        VII6: ["I", "I6", "V"],
      },
      chromaticAndAppliedAdditions: {
        appliedDominants: { "V/III": ["III"], "V/VI": ["VI"], "V/II": ["II"], "V/V": ["V"], "V/IV": ["IV"] },
        appliedLeadingToneChords: { "VII/III": ["III"], "VII/VI": ["VI"], "VII/II": ["II"], "VII/V": ["V"], "VII/IV": ["IV"] },
        chromaticPredominants: { bII6: ["V"], "+6": ["V"] },
        modalMixture: { IVminor: ["I"], bVI: ["bVII"], bVII: ["I"], bVII7: ["I"] },
      },
    },
    minor: {
      directTransitionsStrictHarmonic: {
        I: ["IV", "II6", "V", "VI", "I6", "IV6", "V64", "VII6"],
        II6: ["V", "I", "I6", "VI", "III+6", "VII6"],
        "III+6": ["VI", "I", "V", "VII6"],
        IV: ["V", "I", "II6", "VI", "VII6"],
        IV6: ["V"],
        V: ["I", "VI", "IV", "II6", "VII6", "III+6"],
        VI: ["II6", "IV", "V", "I", "III+6", "VII6"],
        VII6: ["I", "I6", "V"],
      },
      directTransitionsCommonExpanded: {
        bVII: ["III", "I", "IV"],
        III: ["VI"],
        VI: ["IV", "II6", "V", "I", "bVII"],
        IV: ["bVII", "II6", "V", "I"],
        II6: ["V"],
        V: ["I", "VI"],
        VII6: ["I", "I6"],
      },
      chromaticAndAppliedAdditions: {
        appliedDominants: { "V/IV": ["IV"], "V/bVII": ["bVII"], "V/III": ["III"], "V/VI": ["VI"], "V/V": ["V"] },
        appliedLeadingToneChords: { "VII/IV": ["IV"], "VII/bVII": ["bVII"], "VII/III": ["III"], "VII/VI": ["VI"], "VII/V": ["V"] },
        chromaticPredominants: { bII6: ["V"], "+6": ["V"] },
        picardy: { V: ["I_MAJOR"] },
      },
    },
  },
};

const DEFAULT_VOICE_RULES = {
  schema: "harm31a.voiceLeadingRules.v2",
  pitchAuthority: { system: "native 31-EDO", octaveSteps: 31, referenceHz: 440, referenceLabel: "A4", referenceStep31: 147 },
  voices: [
    { id: "S", name: "Soprano", range: { lowLabel: "C4", lowAbsoluteStep31: 124, highLabel: "G5", highAbsoluteStep31: 173 } },
    { id: "A", name: "Alto", range: { lowLabel: "G3", lowAbsoluteStep31: 111, highLabel: "D5", highAbsoluteStep31: 160 } },
    { id: "T", name: "Tenor", range: { lowLabel: "C3", lowAbsoluteStep31: 93, highLabel: "G4", highAbsoluteStep31: 142 } },
    { id: "B", name: "Bass", range: { lowLabel: "E2", lowAbsoluteStep31: 72, highLabel: "C4", highAbsoluteStep31: 124 } },
  ],
  profiles: [
    { id: "strictCounterpoint", name: "Strict counterpoint", beamWidth: 8, severityOverrides: { "melodic.large-leap": "error", "dissonance.non-chord-tone": "error" }, spacingThresholds31: { sopranoAltoMax: 31, altoTenorMax: 31, tenorBassMax: 43 } },
    { id: "commonPracticeSatb", name: "Common-practice SATB", beamWidth: 12, severityOverrides: {}, spacingThresholds31: { sopranoAltoMax: 31, altoTenorMax: 31, tenorBassMax: 43 } },
    { id: "nineteenthCenturyExpanded", name: "Nineteenth-century expanded", beamWidth: 20, severityOverrides: { "hidden.outer-fifth": "style", "hidden.outer-octave": "style", "harmony.tendency-doubling": "style" }, spacingThresholds31: { sopranoAltoMax: 36, altoTenorMax: 36, tenorBassMax: 48 } },
    { id: "customRevisionist31", name: "Custom revisionist 31", beamWidth: 24, severityOverrides: { "dissonance.non-chord-tone": "style", "melodic.augmented": "style" }, spacingThresholds31: { sopranoAltoMax: 43, altoTenorMax: 43, tenorBassMax: 55 } },
  ],
};

const ROOTS_31 = [
  ["C", 0],
  ["C#", 2],
  ["Db", 3],
  ["D", 5],
  ["D#", 7],
  ["Eb", 8],
  ["E", 10],
  ["E#", 12],
  ["Fb", 11],
  ["F", 13],
  ["F#", 15],
  ["Gb", 16],
  ["G", 18],
  ["G#", 20],
  ["Ab", 21],
  ["A", 23],
  ["A#", 25],
  ["Bb", 26],
  ["B", 28],
  ["B#", 30],
  ["Cb", 29],
];

const REGISTERS = [
  { label: "-2 oct", shift: -2 },
  { label: "-1 oct", shift: -1 },
  { label: "central", shift: 0 },
  { label: "+1 oct", shift: 1 },
  { label: "+2 oct", shift: 2 },
];

const EMOTION_AXES = [
  { key: "x_valence", field: "emotion_x_valence", label: "X · Light / Valence", shortLabel: "Valence", question: "Which progression feels more positive / bright / hopeful?", highMeaning: "higher = more positive, bright, hopeful, loving, pure" },
  { key: "y_energy", field: "emotion_y_energy", label: "Y · Energy / Activation", shortLabel: "Energy", question: "Which progression feels more active / energetic / forceful?", highMeaning: "higher = more active, forceful, triumphant, fiery, energetic" },
  { key: "z_tension", field: "emotion_z_tension", label: "Z · Tension / Security", shortLabel: "Tension", question: "Which progression feels more tense / anxious / unstable?", highMeaning: "higher = more tense, anxious, unstable, struggling, uncanny" },
  { key: "w_heroic_outward", field: "emotion_w_heroic_outward", label: "W · Inward ↔ Heroic / Outward", shortLabel: "Heroic/outward", question: "Which progression feels more outward / heroic / public / martial?", highMeaning: "higher = more outward, heroic, public, martial; lower = more inward, tender, intimate, devotional" },
];
const EMOTION_OPTIONS = [
  { label: "A much more", value: 2 },
  { label: "A slightly more", value: 1 },
  { label: "no difference / unsure", value: 0 },
  { label: "B slightly more", value: -1 },
  { label: "B much more", value: -2 },
];
const DEFAULT_EMOTION_FORM = Object.freeze({ x_valence: 0, y_energy: 0, z_tension: 0, w_heroic_outward: 0 });
const DEFAULT_SELECTION_WEIGHTS = Object.freeze({ preference: 1, valence: 1, energy: 1, tension: 1, heroic: 1 });

const STORAGE_KEY = "chord-preference-tester-v4-native31";
const SESSION_ID_STORAGE_KEY = "chord-preference-tester-session-id";
const VOICES = ["S", "A", "T", "B"];
const ADJACENT = [["S", "A"], ["A", "T"], ["T", "B"]];
const DIATONIC_31 = { C: 0, D: 5, E: 10, F: 13, G: 18, A: 23, B: 28 };
const ACCIDENTAL_STEP_31 = 2; // 31-EDO meantone spelling: sharps/flats move by 2 native steps; enharmonic spellings stay distinct.
const TENDENCY_PCS_31 = new Set([12, 17, 27, 30]);
const VOICING_CACHE = new Map();
const VOICING_CACHE_LIMIT = 2200;
function cacheGet(cache, key) {
  if (!cache.has(key)) return undefined;
  const value = cache.get(key);
  cache.delete(key);
  cache.set(key, value);
  return value;
}
function cacheSet(cache, key, value, limit = VOICING_CACHE_LIMIT) {
  cache.set(key, value);
  while (cache.size > limit) cache.delete(cache.keys().next().value);
  return value;
}
function clearVoicingCache() { VOICING_CACHE.clear(); }

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function mod(n, m) { return ((n % m) + m) % m; }
function pc31(n) { return mod(Math.round(n), 31); }
function freq31(step31, voiceRules) {
  const authority = voiceRules?.pitchAuthority || {};
  const referenceHz = authority.referenceHz || 440;
  const referenceStep31 = authority.referenceStep31 || 147;
  return referenceHz * Math.pow(2, (step31 - referenceStep31) / 31);
}
function defaultRating(id, ratings) { return ratings[id] ?? 1000; }
function statFor(id, stats) { return stats[id] || { wins: 0, losses: 0, draws: 0, total: 0 }; }
function pairKey(a, b) { return [a.id, b.id].sort().join("__vs__"); }
function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}
function formatSeconds(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  const seconds = ms / 1000;
  return seconds < 10 ? `${seconds.toFixed(1)}s` : `${Math.round(seconds)}s`;
}
function formatRate(rate) {
  if (!Number.isFinite(rate) || rate <= 0) return "—";
  return rate < 10 ? rate.toFixed(1) : Math.round(rate).toString();
}
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function preferenceProbabilityFromRatings(ratingA, ratingB) { return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400)); }
function confidenceFromTrials(total) { return Math.max(0, Math.min(0.99, 1 - Math.exp(-(total || 0) / 12))); }
function uncertaintyFromTrials(total) { return 1 - confidenceFromTrials(total); }
function pct(x, digits = 1) {
  if (!Number.isFinite(x)) return "—";
  return `${(x * 100).toFixed(digits)}%`;
}
function formatEmotionCoordinate(mean, uncertainty) {
  const m = Number.isFinite(mean) ? mean : 0;
  const u = Number.isFinite(uncertainty) ? uncertainty : 0.5;
  return `${m.toFixed(2)} ± ${u.toFixed(2)}`;
}
function emotionExportFields(e = {}) {
  return {
    x_valence_mean: e.x_valence_mean ?? 0,
    x_valence_uncertainty: e.x_valence_uncertainty ?? 0.5,
    y_energy_mean: e.y_energy_mean ?? 0,
    y_energy_uncertainty: e.y_energy_uncertainty ?? 0.5,
    z_tension_mean: e.z_tension_mean ?? 0,
    z_tension_uncertainty: e.z_tension_uncertainty ?? 0.5,
    w_heroic_outward_mean: e.w_heroic_outward_mean ?? 0,
    w_heroic_outward_uncertainty: e.w_heroic_outward_uncertainty ?? 0.5,
    emotionalQualities: {
      x_valence: { label: "Light / Valence", mean: e.x_valence_mean ?? 0, uncertainty: e.x_valence_uncertainty ?? 0.5 },
      y_energy: { label: "Energy / Activation", mean: e.y_energy_mean ?? 0, uncertainty: e.y_energy_uncertainty ?? 0.5 },
      z_tension: { label: "Tension / Security", mean: e.z_tension_mean ?? 0, uncertainty: e.z_tension_uncertainty ?? 0.5 },
      w_heroic_outward: { label: "Inward ↔ Heroic / Outward", mean: e.w_heroic_outward_mean ?? 0, uncertainty: e.w_heroic_outward_uncertainty ?? 0.5 },
    },
  };
}
function stepName31(offset) {
  return ROOTS_31.find(([, value]) => value === pc31(offset))?.[0] || `step ${pc31(offset)}`;
}
function tuningSummary31(voiceRules) {
  const authority = voiceRules?.pitchAuthority || {};
  return {
    system: authority.system || "native 31-EDO",
    octaveSteps: authority.octaveSteps || 31,
    referenceHz: authority.referenceHz || 440,
    referenceLabel: authority.referenceLabel || "A4",
    referenceStep31: authority.referenceStep31 || 147,
    frequencyFormula: authority.frequencyFormula || "frequency = referenceHz * 2 ** ((absoluteStep31 - referenceStep31) / 31)",
    accidentalStep31: ACCIDENTAL_STEP_31,
    naturalSteps31: DIATONIC_31,
    triadIntervals31: { major: [0, 10, 18], minor: [0, 8, 18], diminished: [0, 8, 16], augmented: [0, 10, 20] },
  };
}
function sourcePrior(source) {
  const text = String(source || "").toLowerCase();
  if (text.includes("direct") || text.includes("strict")) return 0.45;
  if (text.includes("common expanded")) return 0.28;
  if (text.includes("chromatic") || text.includes("applied")) return 0.18;
  if (text.includes("slash stack")) return 0.08;
  return 0.15;
}
function stackDepth(symbol) { return String(symbol || "").split("/").filter(Boolean).length; }
function featureGroup(item) {
  const depth = Math.max(stackDepth(item.from), stackDepth(item.to));
  if (depth >= 3) return "triple slash stack";
  if (depth === 2) return "double slash stack";
  if (String(item.source || "").includes("chromatic") || String(item.source || "").includes("applied")) return "chromatic/applied";
  if (item.mode === "major") return "diatonic major";
  return "diatonic minor";
}

function makeSessionId() {
  if (typeof window === "undefined") return `session-${Date.now().toString(36)}`;
  const existing = window.localStorage.getItem(SESSION_ID_STORAGE_KEY);
  if (existing) return existing;
  const random = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const id = `session-${random}`;
  window.localStorage.setItem(SESSION_ID_STORAGE_KEY, id);
  return id;
}
function normalizeSelectionMode(mode) {
  if (mode === "active") return "preference_only";
  if (["preference_only", "emotion_only", "hybrid", "balanced", "random"].includes(mode)) return mode;
  return "preference_only";
}
function normalizePreferredChoice(choice) {
  if (choice === "A" || choice === "B" || choice === "equal" || choice === "unsure") return choice;
  if (choice === "draw" || choice === "none" || choice === null || choice === undefined) return "unsure";
  return "unsure";
}
function preferenceValueForChoice(choice) {
  const normalized = normalizePreferredChoice(choice);
  if (normalized === "A") return 1;
  if (normalized === "B") return -1;
  return 0;
}
function winnerForChoice(choice) {
  const normalized = normalizePreferredChoice(choice);
  return normalized === "A" ? "A" : normalized === "B" ? "B" : "draw";
}
function clampEmotionValue(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return clamp(Math.round(n), -2, 2);
}
function normalizedTrialRow(row, sessionId = "unknown-session") {
  const choice = normalizePreferredChoice(row.preferred_choice || row.preferredChoice || row.winner);
  const timestamp = row.timestamp || row.at || new Date().toISOString();
  const progressionA = row.progression_a_id || row.a;
  const progressionB = row.progression_b_id || row.b;
  return {
    trial_id: row.trial_id || row.trialId || `legacy-${timestamp}-${progressionA || "A"}-${progressionB || "B"}`,
    listener_id: row.listener_id || row.session_id || sessionId,
    session_id: row.session_id || row.listener_id || sessionId,
    progression_a_id: progressionA,
    progression_b_id: progressionB,
    preferred_choice: choice,
    preference_value: Number.isFinite(row.preference_value) ? row.preference_value : preferenceValueForChoice(choice),
    emotion_x_valence: clampEmotionValue(row.emotion_x_valence),
    emotion_y_energy: clampEmotionValue(row.emotion_y_energy),
    emotion_z_tension: clampEmotionValue(row.emotion_z_tension),
    emotion_w_heroic_outward: clampEmotionValue(row.emotion_w_heroic_outward),
    response_time_ms: Number.isFinite(row.response_time_ms) ? row.response_time_ms : (Number.isFinite(row.answerActiveMs) ? row.answerActiveMs : null),
    timestamp,
  };
}
function estimateEmotionCoordinates(items, history, priorWeight = 4) {
  const itemIds = new Set(items.map((item) => item.id));
  const byId = {};
  const accum = new Map();
  for (const item of items) {
    const row = {};
    for (const axis of EMOTION_AXES) row[axis.key] = { sum: 0, weight: 0, comparisons: 0 };
    accum.set(item.id, row);
  }
  for (const raw of history || []) {
    const row = normalizedTrialRow(raw);
    const aId = row.progression_a_id;
    const bId = row.progression_b_id;
    if (!itemIds.has(aId) || !itemIds.has(bId)) continue;
    const a = accum.get(aId);
    const b = accum.get(bId);
    for (const axis of EMOTION_AXES) {
      const value = clampEmotionValue(row[axis.field]);
      const evidenceWeight = Math.abs(value) > 0 ? Math.abs(value) : 0.35;
      a[axis.key].sum += value;
      b[axis.key].sum -= value;
      a[axis.key].weight += evidenceWeight;
      b[axis.key].weight += evidenceWeight;
      a[axis.key].comparisons += 1;
      b[axis.key].comparisons += 1;
    }
  }
  const rows = items.map((item) => {
    const out = { progression_id: item.id };
    const source = accum.get(item.id);
    for (const axis of EMOTION_AXES) {
      const data = source[axis.key];
      const denominator = priorWeight + data.weight;
      const mean = data.sum / denominator;
      const uncertainty = 1 / Math.sqrt(denominator);
      out[`${axis.key}_mean`] = mean;
      out[`${axis.key}_uncertainty`] = uncertainty;
      out[`${axis.key}_comparisons`] = data.comparisons;
    }
    byId[item.id] = out;
    return out;
  });
  return { schema: "empirical-listener-emotion-coordinates.v1", priorWeight, axes: EMOTION_AXES, byId, rows };
}
function emotionAxisScoreForPair(a, b, emotionModel, weights) {
  const get = (item, key, field) => emotionModel?.byId?.[item.id]?.[field] ?? (field.endsWith("_uncertainty") ? 0.5 : 0);
  let score = 0;
  const rows = [
    ["x_valence", weights.valence],
    ["y_energy", weights.energy],
    ["z_tension", weights.tension],
    ["w_heroic_outward", weights.heroic],
  ];
  for (const [key, weight] of rows) {
    const uA = get(a, key, `${key}_uncertainty`);
    const uB = get(b, key, `${key}_uncertainty`);
    const mA = get(a, key, `${key}_mean`);
    const mB = get(b, key, `${key}_mean`);
    const closeness = 1 / (1 + Math.abs(mA - mB));
    score += (weight || 0) * ((uA + uB) / 2 + closeness * 0.35);
  }
  return score;
}
function buildObservedEmotionPairwiseMap(history, emotionModel, limit = 5000) {
  const seen = new Set();
  const rows = [];
  for (let i = (history || []).length - 1; i >= 0 && rows.length < limit; i--) {
    const row = normalizedTrialRow(history[i]);
    const a = row.progression_a_id;
    const b = row.progression_b_id;
    if (!a || !b) continue;
    const key = `${a}__${b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const item = { progression_a_id: a, progression_b_id: b };
    for (const axis of EMOTION_AXES) {
      const aMean = emotionModel?.byId?.[a]?.[`${axis.key}_mean`] ?? 0;
      const bMean = emotionModel?.byId?.[b]?.[`${axis.key}_mean`] ?? 0;
      item[`probability_a_higher_${axis.key}`] = sigmoid((aMean - bMean) * 1.75);
    }
    rows.push(item);
  }
  return rows;
}
function emotionExampleRow() {
  return {
    trial_id: "trial_000001_example",
    listener_id: "session-example",
    session_id: "session-example",
    progression_a_id: "major:I->V:reg0",
    progression_b_id: "minor:VI->V:reg0",
    preferred_choice: "A",
    preference_value: 1,
    emotion_x_valence: 1,
    emotion_y_energy: -1,
    emotion_z_tension: 0,
    emotion_w_heroic_outward: 2,
    response_time_ms: 8420,
    timestamp: "2026-05-10T12:00:00.000Z",
  };
}

function parseNoteLabel31(label) {
  const text = String(label || "").trim();
  if (text.length < 2) return null;
  const letter = text[0].toUpperCase();
  if (!(letter in DIATONIC_31)) return null;
  let index = 1;
  let accidental = 0;
  while (text[index] === "#" || text[index] === "b") {
    accidental += text[index] === "#" ? ACCIDENTAL_STEP_31 : -ACCIDENTAL_STEP_31;
    index += 1;
  }
  const octave = Number(text.slice(index));
  if (!Number.isFinite(octave)) return null;
  return octave * 31 + DIATONIC_31[letter] + accidental;
}

function getVoiceRanges31(voiceRules) {
  const ranges = {
    S: { low: 124, high: 173 },
    A: { low: 111, high: 160 },
    T: { low: 93, high: 142 },
    B: { low: 72, high: 124 },
  };
  (voiceRules?.voices || []).forEach((voice) => {
    const low = Number.isFinite(voice?.range?.lowAbsoluteStep31) ? voice.range.lowAbsoluteStep31 : parseNoteLabel31(voice?.range?.lowLabel);
    const high = Number.isFinite(voice?.range?.highAbsoluteStep31) ? voice.range.highAbsoluteStep31 : parseNoteLabel31(voice?.range?.highLabel);
    if (voice?.id && Number.isFinite(low) && Number.isFinite(high)) ranges[voice.id] = { low, high };
  });
  return ranges;
}

function getProfile(voiceRules, profileId) {
  return (voiceRules?.profiles || []).find((p) => p.id === profileId) || DEFAULT_VOICE_RULES.profiles[1];
}
function severityFor(ruleId, profile, fallback = "warning") { return profile?.severityOverrides?.[ruleId] || fallback; }
function diagnosticCost(severity) { return severity === "error" ? 1000 : severity === "warning" ? 40 : 8; }

function cleanSymbol(symbol) {
  return String(symbol || "I").trim().replace(/\s+/g, "").replace("_MAJOR", "");
}
function stripFiguredBass(symbol) {
  return cleanSymbol(symbol).replace(/64$/, "").replace(/6$/, "").replace(/7$/, "");
}
function getRomanDegree(symbol) {
  const normalized = stripFiguredBass(symbol);
  if (normalized.startsWith("bVII")) return "bVII";
  if (normalized.startsWith("bVI")) return "bVI";
  if (normalized.startsWith("bII")) return "bII";
  for (const degree of ["VII", "VI", "IV", "III", "II", "V", "I"]) if (normalized.startsWith(degree)) return degree;
  return "I";
}

function getScaleOffset31(symbol, mode) {
  const degree = getRomanDegree(symbol);
  if (degree === "bII") return 3;
  if (degree === "bVI") return 21;
  if (degree === "bVII") return 26;
  const major = { I: 0, II: 5, III: 10, IV: 13, V: 18, VI: 23, VII: 28 };
  const minor = { I: 0, II: 5, III: 8, IV: 13, V: 18, VI: 21, VII: 28 };
  return mode === "minor" ? minor[degree] ?? 0 : major[degree] ?? 0;
}

function getRootStep31(symbol, mode, tonicStep31) {
  const normalized = cleanSymbol(symbol);
  if (normalized === "+6") return tonicStep31 + 21;
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length > 1) {
    const numerator = parts[0];
    const denominator = parts.slice(1).join("/");
    return getRootStep31(denominator, mode, tonicStep31) + getScaleOffset31(numerator, mode);
  }
  return tonicStep31 + getScaleOffset31(normalized, mode);
}

function getQuality(symbol, mode) {
  const raw = String(symbol || "I").trim().replace(/\s+/g, "");
  const normalized = cleanSymbol(symbol);
  const numerator = normalized.split("/")[0];
  if (normalized === "+6" || normalized.startsWith("III+")) return "aug";
  if (raw.includes("_MAJOR")) return "maj";
  if (normalized.startsWith("IVminor")) return "min";
  if (numerator.includes("7") && numerator.startsWith("V")) return "dom7";
  if (numerator.includes("7") && numerator.startsWith("bVII")) return "dom7";
  const degree = getRomanDegree(numerator);
  if (["bII", "bVI", "bVII"].includes(degree)) return "maj";
  if (mode === "major") {
    if (["I", "IV", "V"].includes(degree)) return "maj";
    if (["II", "III", "VI"].includes(degree)) return "min";
    return "dim";
  }
  if (["I", "IV"].includes(degree)) return "min";
  if (["V", "III", "VI"].includes(degree)) return "maj";
  return "dim";
}

function chordDescriptor31(symbol, mode, tonicStep31) {
  const rootStep = getRootStep31(symbol, mode, tonicStep31);
  const rootPc = pc31(rootStep);
  const quality = getQuality(symbol, mode);
  const intervals = quality === "min" ? [0, 8, 18] : quality === "dim" ? [0, 8, 16] : quality === "aug" ? [0, 10, 20] : quality === "dom7" ? [0, 10, 18, 26] : [0, 10, 18];
  const pcs = [...new Set(intervals.map((i) => pc31(rootStep + i)))];
  let bassPc = rootPc;
  const normalized = cleanSymbol(symbol);
  if (normalized.includes("64")) bassPc = pcs[2] ?? rootPc;
  else if (normalized.endsWith("6") || normalized.includes("+6")) bassPc = pcs[1] ?? rootPc;
  return { rootStep, rootPc, bassPc, pcs, quality };
}

function flattenTransitions(map = {}, mode, source) {
  const items = [];
  Object.entries(map || {}).forEach(([from, tos]) => {
    (tos || []).forEach((to) => {
      if (!to || to === "X" || to === "PICARDY") return;
      if (String(from).includes("/X") || String(to).includes("/X")) return;
      items.push({ baseId: `${mode}:${from}->${to}`, mode, from, to, source, octaveShift: 0 });
    });
  });
  return items;
}

function collectTargets(rules, mode, includeChromatic) {
  const modeRules = rules?.modes?.[mode] || {};
  const maps = mode === "major" ? [modeRules.directTransitions] : [modeRules.directTransitionsStrictHarmonic, modeRules.directTransitionsCommonExpanded];
  if (includeChromatic) Object.values(modeRules.chromaticAndAppliedAdditions || {}).forEach((m) => maps.push(m));
  const set = new Set(mode === "minor" ? ["I", "II6", "III", "III+6", "IV", "V", "VI", "VII6", "bVII"] : ["I", "II", "II6", "III", "IV", "V", "VI", "VII6"]);
  maps.forEach((map) => Object.entries(map || {}).forEach(([from, tos]) => {
    [from, ...(tos || [])].forEach((x) => {
      const symbol = cleanSymbol(x);
      if (!symbol || symbol === "X" || symbol === "PICARDY" || symbol.includes("/") || symbol.includes("_MAJOR") || symbol === "+6") return;
      set.add(symbol);
    });
  }));
  return [...set].sort((a, b) => a.localeCompare(b));
}

function slashCombos(bases, depth) {
  if (depth <= 1) return [...bases];
  const shorter = slashCombos(bases, depth - 1);
  const out = [];
  for (const head of bases) for (const tail of shorter) out.push(`${head}/${tail}`);
  return out;
}

function buildFullSlashStack(mode, bases, depth, maxItemsPerDepth = 20000) {
  const fromSymbols = slashCombos(bases, depth).slice(0, maxItemsPerDepth);
  const items = [];
  for (const from of fromSymbols) {
    for (const to of bases) {
      items.push({ baseId: `${mode}:${from}->${to}`, mode, from, to, source: depth === 2 ? "full slash stack A/B → C" : "full slash stack A/B/C → D", octaveShift: 0 });
    }
  }
  return items;
}

function withRegisters(items, registerMode) {
  const registers = registerMode === "all" ? REGISTERS : [REGISTERS[2]];
  return items.flatMap((item) => registers.map((r) => ({ ...item, octaveShift: r.shift, registerLabel: r.label, id: `${item.baseId}:reg${r.shift}` })));
}

function buildItemsFromRules(rules, options) {
  const { includeChromatic, includeSlashDepth2, includeSlashDepth3, registerMode, slashBasisLimit } = options;
  const major = rules?.modes?.major || {};
  const minor = rules?.modes?.minor || {};
  let items = [
    ...flattenTransitions(major.directTransitions, "major", "direct"),
    ...flattenTransitions(minor.directTransitionsStrictHarmonic, "minor", "strict harmonic"),
    ...flattenTransitions(minor.directTransitionsCommonExpanded, "minor", "common expanded"),
  ];
  if (includeChromatic) {
    Object.values(major.chromaticAndAppliedAdditions || {}).forEach((m) => items.push(...flattenTransitions(m, "major", "optional chromatic/applied")));
    Object.values(minor.chromaticAndAppliedAdditions || {}).forEach((m) => items.push(...flattenTransitions(m, "minor", "optional chromatic/applied")));
  }
  for (const mode of ["major", "minor"]) {
    const bases = collectTargets(rules, mode, includeChromatic).slice(0, slashBasisLimit);
    if (includeSlashDepth2) items.push(...buildFullSlashStack(mode, bases, 2));
    if (includeSlashDepth3) items.push(...buildFullSlashStack(mode, bases, 3));
  }
  const seen = new Map();
  for (const item of items) if (!seen.has(item.baseId)) seen.set(item.baseId, item);
  return withRegisters([...seen.values()], registerMode).sort((a, b) => a.mode.localeCompare(b.mode) || a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || a.octaveShift - b.octaveShift);
}

function allChordToneSteps31(desc, range) {
  const notes = [];
  for (let step = range.low; step <= range.high; step++) if (desc.pcs.includes(pc31(step))) notes.push(step);
  return notes;
}

function verticalCost31(voicing, desc, profile) {
  const th = profile?.spacingThresholds31 || {};
  const limits = { SA: th.sopranoAltoMax ?? 31, AT: th.altoTenorMax ?? 31, TB: th.tenorBassMax ?? 43 };
  let cost = 0;
  const diagnostics = [];
  for (const [upper, lower, max, ruleId] of [["S", "A", limits.SA, "spacing.upper"], ["A", "T", limits.AT, "spacing.upper"], ["T", "B", limits.TB, "spacing.tenor-bass"]]) {
    const span = voicing[upper] - voicing[lower];
    if (span < 0) {
      diagnostics.push({ ruleId: "voice.crossing", severity: "error", message: `${upper}/${lower} crossing` });
      cost += 1000;
    }
    if (span > max) {
      const sev = ruleId === "spacing.tenor-bass" ? "style" : "warning";
      diagnostics.push({ ruleId, severity: sev, message: `${upper}-${lower} spacing ${span} steps31` });
      cost += diagnosticCost(sev);
    }
    cost += Math.max(0, span - Math.round(max * 0.7)) * 0.35;
  }
  if (pc31(voicing.B) !== desc.bassPc) cost += 25;
  const present = new Set(VOICES.map((v) => pc31(voicing[v])));
  const missing = desc.pcs.filter((p) => !present.has(p));
  if (missing.length) {
    diagnostics.push({ ruleId: "harmony.incomplete", severity: "style", message: `Incomplete chord: ${missing.length} missing pitch classes` });
    cost += 14 * missing.length;
  }
  const rootCount = VOICES.filter((v) => pc31(voicing[v]) === desc.rootPc).length;
  if (rootCount === 0) cost += 10;
  if (rootCount >= 2) cost -= 4;
  for (const pitchClass of TENDENCY_PCS_31) {
    const count = VOICES.filter((v) => pc31(voicing[v]) === pitchClass).length;
    if (count > 1) {
      const sev = severityFor("harmony.tendency-doubling", profile, "warning");
      diagnostics.push({ ruleId: "harmony.tendency-doubling", severity: sev, message: `Doubled tendency tone pc31 ${pitchClass}` });
      cost += diagnosticCost(sev);
    }
  }
  return { cost, diagnostics };
}

function classifyPerfect31(upper, lower) {
  const distance = upper - lower;
  const dpc = pc31(distance);
  if (distance === 0) return "unison";
  if (dpc === 0) return "octave";
  if (dpc === 18) return "fifth";
  return null;
}

function evaluateMotion31(v1, v2, profile) {
  let cost = 0;
  const diagnostics = [];
  for (const [upper, lower] of ADJACENT) {
    if (v2[upper] < v1[lower] || v2[lower] > v1[upper]) {
      diagnostics.push({ ruleId: "voice.overlap", severity: "warning", message: `${upper}/${lower} overlap` });
      cost += 40;
    }
  }
  for (let i = 0; i < VOICES.length; i++) {
    for (let j = i + 1; j < VOICES.length; j++) {
      const u = VOICES[i];
      const l = VOICES[j];
      const m1 = v2[u] - v1[u];
      const m2 = v2[l] - v1[l];
      if (!m1 || !m2 || Math.sign(m1) !== Math.sign(m2)) continue;
      const prev = classifyPerfect31(v1[u], v1[l]);
      const next = classifyPerfect31(v2[u], v2[l]);
      if (prev && next && prev === next) {
        const ruleId = prev === "fifth" ? "parallel.fifth" : prev === "octave" ? "parallel.octave" : "parallel.unison";
        diagnostics.push({ ruleId, severity: "error", message: `Parallel ${prev} in ${u}/${l}` });
        cost += 1200;
      }
    }
  }
  const sMove = v2.S - v1.S;
  const bMove = v2.B - v1.B;
  const outer = classifyPerfect31(v2.S, v2.B);
  if (sMove && bMove && Math.sign(sMove) === Math.sign(bMove) && Math.abs(sMove) > 5 && ["fifth", "octave"].includes(outer)) {
    const ruleId = outer === "fifth" ? "hidden.outer-fifth" : "hidden.outer-octave";
    const sev = severityFor(ruleId, profile, "warning");
    diagnostics.push({ ruleId, severity: sev, message: `Hidden/direct ${outer}` });
    cost += diagnosticCost(sev);
  }
  for (const voice of VOICES) {
    const move = Math.abs(v2[voice] - v1[voice]);
    cost += move * 0.12;
    if (move > 18) {
      const sev = severityFor("melodic.large-leap", profile, "warning");
      diagnostics.push({ ruleId: "melodic.large-leap", severity: sev, message: `${voice} large leap: ${move} steps31` });
      cost += diagnosticCost(sev);
    }
    if (move >= 6 && ![0, 1, 5, 8, 10, 13, 18, 31].includes(move % 31)) {
      const sev = severityFor("melodic.augmented", profile, "style");
      diagnostics.push({ ruleId: "melodic.augmented", severity: sev, message: `${voice} unclassified melodic interval` });
      cost += diagnosticCost(sev);
    }
  }
  if ([0, 10, 18].includes(pc31(v2.S - v2.B))) cost -= 8;
  return { cost, diagnostics };
}

function generateVoicings31(symbol, mode, tonicStep31, voiceRules, profileId) {
  const profile = getProfile(voiceRules, profileId);
  const ranges = getVoiceRanges31(voiceRules);
  const key = `voicing|${symbol}|${mode}|${tonicStep31}|${profile.id}|${JSON.stringify(ranges)}`;
  const cached = cacheGet(VOICING_CACHE, key);
  if (cached !== undefined) return cached;
  const desc = chordDescriptor31(symbol, mode, tonicStep31);
  const pools = {
    B: allChordToneSteps31(desc, ranges.B),
    T: allChordToneSteps31(desc, ranges.T),
    A: allChordToneSteps31(desc, ranges.A),
    S: allChordToneSteps31(desc, ranges.S),
  };
  const th = profile?.spacingThresholds31 || {};
  const sA = th.sopranoAltoMax ?? 31;
  const aT = th.altoTenorMax ?? 31;
  const tB = th.tenorBassMax ?? 43;
  const candidates = [];
  const limit = clamp((profile?.beamWidth || 12) * 10, 40, 260);
  for (const B of pools.B) for (const T of pools.T) {
    if (T < B || T - B > tB + 6) continue;
    for (const A of pools.A) {
      if (A < T || A - T > aT + 6) continue;
      for (const S of pools.S) {
        if (S < A || S - A > sA + 6) continue;
        const voicing = { S, A, T, B };
        const vc = verticalCost31(voicing, desc, profile);
        const centerCost = Math.abs(S - 147) * 0.025 + Math.abs(A - 132) * 0.02 + Math.abs(T - 116) * 0.02 + Math.abs(B - 98) * 0.018;
        candidates.push({ voicing, cost: vc.cost + centerCost, diagnostics: vc.diagnostics });
      }
    }
  }
  candidates.sort((a, b) => a.cost - b.cost);
  const result = candidates.slice(0, limit);
  if (!result.length) result.push({ voicing: { B: 93, T: 111, A: 124, S: 134 }, cost: 9999, diagnostics: [{ ruleId: "fallback", severity: "warning", message: "Fallback voicing" }] });
  return cacheSet(VOICING_CACHE, key, result);
}

function harmonizeProgression31(item, tonicStep31, voiceRules, profileId) {
  const profile = getProfile(voiceRules, profileId);
  const key = `pair|${item.id}|${tonicStep31}|${profile.id}`;
  const cached = cacheGet(VOICING_CACHE, key);
  if (cached !== undefined) return cached;
  const first = generateVoicings31(item.from, item.mode, tonicStep31, voiceRules, profileId).slice(0, 36);
  const second = generateVoicings31(item.to, item.mode, tonicStep31, voiceRules, profileId).slice(0, 36);
  let best = null;
  for (const a of first) for (const b of second) {
    const motion = evaluateMotion31(a.voicing, b.voicing, profile);
    const cost = a.cost + b.cost + motion.cost;
    if (!best || cost < best.cost) best = { first: a.voicing, second: b.voicing, cost, diagnostics: [...a.diagnostics, ...b.diagnostics, ...motion.diagnostics] };
  }
  return cacheSet(VOICING_CACHE, key, best);
}

function normalizedOutcomeForPair(historyRow) {
  if (!historyRow) return "unknown";
  const a = historyRow.a || historyRow.progression_a_id;
  const b = historyRow.b || historyRow.progression_b_id;
  const winner = winnerForChoice(historyRow.preferred_choice || historyRow.winner);
  if (!a || !b) return "unknown";
  if (winner === "draw") return "draw";
  const winnerId = winner === "A" ? a : b;
  const ids = [a, b].sort();
  if (winnerId === ids[0]) return "first";
  if (winnerId === ids[1]) return "second";
  return "unknown";
}

function findRepeatPair(items, history, repeatRate, allowCrossMode) {
  if (!history.length || Math.random() >= repeatRate / 100) return null;
  const byId = new Map(items.map((item) => [item.id, item]));
  const recent = history.slice(-1200).filter((h) => byId.has(h.a || h.progression_a_id) && byId.has(h.b || h.progression_b_id));
  if (!recent.length) return null;
  for (let tries = 0; tries < 40; tries++) {
    const h = recent[Math.floor(Math.random() * recent.length)];
    const a = byId.get(h.a || h.progression_a_id);
    const b = byId.get(h.b || h.progression_b_id);
    if (!a || !b || a.id === b.id) continue;
    if (!allowCrossMode && a.mode !== b.mode) continue;
    return Math.random() > 0.5 ? [a, b] : [b, a];
  }
  return null;
}

function chooseRandomPair(items, allowCrossMode) {
  if (items.length < 2) return null;
  for (let tries = 0; tries < 80; tries++) {
    const a = items[Math.floor(Math.random() * items.length)];
    const b = items[Math.floor(Math.random() * items.length)];
    if (!a || !b || a.id === b.id) continue;
    if (!allowCrossMode && a.mode !== b.mode) continue;
    return Math.random() > 0.5 ? [a, b] : [b, a];
  }
  const a = items[0];
  const b = items.find((item) => item.id !== a.id && (allowCrossMode || item.mode === a.mode)) || items.find((item) => item.id !== a.id);
  return b ? [a, b] : null;
}

function choosePair(items, ratings, stats, history, allowCrossMode, options = {}) {
  if (items.length < 2) return null;
  const selectionMode = normalizeSelectionMode(options.selectionMode || "preference_only");
  const repeatRate = Number.isFinite(options.repeatRate) ? options.repeatRate : 7;
  const repeatPair = findRepeatPair(items, history, repeatRate, allowCrossMode);
  if (repeatPair) return repeatPair;
  if (selectionMode === "random") return chooseRandomPair(items, allowCrossMode);

  const historyCounts = new Map();
  history.slice(-5000).forEach((h) => { const key = h.pairKey || [h.progression_a_id, h.progression_b_id].filter(Boolean).sort().join("__vs__"); historyCounts.set(key, (historyCounts.get(key) || 0) + 1); });

  if (selectionMode === "balanced") {
    let minTotal = Infinity;
    for (const item of items) minTotal = Math.min(minTotal, statFor(item.id, stats).total);
    const underTested = [];
    for (const item of items) if (statFor(item.id, stats).total <= minTotal + 1) underTested.push(item);
    const a = underTested[Math.floor(Math.random() * underTested.length)] || items[Math.floor(Math.random() * items.length)];
    const sampleSize = Math.min(items.length, 900);
    const candidates = [];
    for (let i = 0; i < sampleSize; i++) {
      const item = items[Math.floor(Math.random() * items.length)];
      if (!item || item.id === a.id) continue;
      if (!allowCrossMode && item.mode !== a.mode) continue;
      const repeated = historyCounts.get(pairKey(a, item)) || 0;
      const ratingGap = Math.abs(defaultRating(item.id, ratings) - defaultRating(a.id, ratings));
      const testedGap = Math.abs(statFor(item.id, stats).total - statFor(a.id, stats).total);
      candidates.push({ item, score: repeated * 100000 + ratingGap + testedGap * 12 + Math.random() * 8 });
    }
    if (!candidates.length) return chooseRandomPair(items, allowCrossMode);
    candidates.sort((x, y) => x.score - y.score);
    const b = candidates[0].item;
    return Math.random() > 0.5 ? [a, b] : [b, a];
  }

  const weights = { ...DEFAULT_SELECTION_WEIGHTS, ...(options.weights || {}) };
  const preferenceWeight = selectionMode === "emotion_only" ? 0 : weights.preference;
  const emotionScale = selectionMode === "preference_only" ? 0 : 1;
  const samplePairs = Math.min(1600, Math.max(220, Math.round(Math.sqrt(items.length) * 20)));
  let best = null;
  for (let i = 0; i < samplePairs; i++) {
    const a = items[Math.floor(Math.random() * items.length)];
    const b = items[Math.floor(Math.random() * items.length)];
    if (!a || !b || a.id === b.id) continue;
    if (!allowCrossMode && a.mode !== b.mode) continue;
    const sa = statFor(a.id, stats);
    const sb = statFor(b.id, stats);
    const ra = defaultRating(a.id, ratings);
    const rb = defaultRating(b.id, ratings);
    const p = preferenceProbabilityFromRatings(ra, rb);
    const closeness = 1 - Math.min(1, Math.abs(p - 0.5) * 2);
    const uncertainty = (uncertaintyFromTrials(sa.total) + uncertaintyFromTrials(sb.total)) / 2;
    const coverage = 1 / (1 + Math.min(sa.total, sb.total));
    const repeated = historyCounts.get(pairKey(a, b)) || 0;
    const featureNovelty = featureGroup(a) === featureGroup(b) ? 0.05 : 0.16;
    const preferenceScore = closeness * 2.2 + uncertainty * 1.55 + coverage * 1.35 + featureNovelty;
    const emotionScore = emotionAxisScoreForPair(a, b, options.emotionModel, weights);
    const repeatedPenalty = repeated * (selectionMode === "emotion_only" ? 1.65 : 2.8);
    const score = preferenceScore * preferenceWeight + emotionScore * emotionScale - repeatedPenalty + Math.random() * 0.05;
    if (!best || score > best.score) best = { a, b, score };
  }
  if (!best) return chooseRandomPair(items, allowCrossMode);
  return Math.random() > 0.5 ? [best.a, best.b] : [best.b, best.a];
}

function getRankedPreview(items, ratings, stats, limit) {
  const n = Math.max(1, Math.min(limit || 250, items.length));
  const heap = [];
  const scoreOf = (item) => {
    const s = statFor(item.id, stats);
    return [defaultRating(item.id, ratings), s.total, s.wins - s.losses, item.id];
  };
  const less = (a, b) => {
    if (a.score[0] !== b.score[0]) return a.score[0] < b.score[0];
    if (a.score[1] !== b.score[1]) return a.score[1] < b.score[1];
    if (a.score[2] !== b.score[2]) return a.score[2] < b.score[2];
    return a.score[3] > b.score[3];
  };
  const swap = (i, j) => { const tmp = heap[i]; heap[i] = heap[j]; heap[j] = tmp; };
  const bubbleUp = (idx) => {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (!less(heap[idx], heap[parent])) break;
      swap(idx, parent); idx = parent;
    }
  };
  const sinkDown = (idx) => {
    while (true) {
      const left = idx * 2 + 1;
      const right = left + 1;
      let smallest = idx;
      if (left < heap.length && less(heap[left], heap[smallest])) smallest = left;
      if (right < heap.length && less(heap[right], heap[smallest])) smallest = right;
      if (smallest === idx) break;
      swap(idx, smallest); idx = smallest;
    }
  };
  for (const item of items) {
    const entry = { item, score: scoreOf(item) };
    if (heap.length < n) { heap.push(entry); bubbleUp(heap.length - 1); }
    else if (less(heap[0], entry)) { heap[0] = entry; sinkDown(0); }
  }
  return heap.sort((a, b) => (less(a, b) ? 1 : less(b, a) ? -1 : 0)).map((x) => x.item);
}


function transitionScore(item, ratings, stats, temperature = 1) {
  const s = statFor(item.id, stats);
  const ratingPart = (defaultRating(item.id, ratings) - 1000) / 220;
  const confidencePart = confidenceFromTrials(s.total) * 0.32;
  const priorPart = sourcePrior(item.source);
  const registerPenalty = Math.abs(item.octaveShift || 0) * 0.05;
  const tiePenalty = s.total ? (s.draws / s.total) * 0.12 : 0;
  return (ratingPart + confidencePart + priorPart - registerPenalty - tiePenalty) / Math.max(0.25, temperature || 1);
}

function buildProbabilityMap(items, ratings, stats, temperature = 1, limit = 60, emotionModel = null) {
  const scored = items.map((item) => ({ item, score: transitionScore(item, ratings, stats, temperature) }));
  const maxScore = scored.reduce((m, row) => Math.max(m, row.score), -Infinity);
  let sum = 0;
  for (const row of scored) { row.exp = Math.exp(row.score - maxScore); sum += row.exp; }
  scored.sort((a, b) => b.exp - a.exp);
  return scored.slice(0, limit).map((row, index) => {
    const s = statFor(row.item.id, stats);
    const probability = sum > 0 ? row.exp / sum : 0;
    const e = emotionModel?.byId?.[row.item.id] || {};
    return {
      rank: index + 1,
      id: row.item.id,
      mode: row.item.mode,
      from: row.item.from,
      to: row.item.to,
      progression: `${row.item.from} -> ${row.item.to}`,
      register: row.item.registerLabel,
      octaveShift: row.item.octaveShift,
      source: row.item.source,
      rating: defaultRating(row.item.id, ratings),
      confidence: confidenceFromTrials(s.total),
      preferenceProbabilityVsNeutral: preferenceProbabilityFromRatings(defaultRating(row.item.id, ratings), 1000),
      transitionProbability: probability,
      trials: s.total,
      wins: s.wins,
      losses: s.losses,
      draws: s.draws,
      ...emotionExportFields(e),
    };
  });
}

function buildFeatureEffects(items, ratings, stats, limit = 36) {
  const groups = new Map();
  const add = (name, value, item) => {
    const key = `${name}:${value}`;
    const s = statFor(item.id, stats);
    const weight = Math.max(1, s.total);
    const row = groups.get(key) || { feature: name, value, count: 0, tested: 0, weightSum: 0, weightedRating: 0, wins: 0, losses: 0, draws: 0 };
    row.count += 1;
    row.tested += s.total;
    row.weightSum += weight;
    row.weightedRating += defaultRating(item.id, ratings) * weight;
    row.wins += s.wins;
    row.losses += s.losses;
    row.draws += s.draws;
    groups.set(key, row);
  };
  for (const item of items) {
    add("mode", item.mode, item);
    add("source", item.source, item);
    add("register", item.registerLabel, item);
    add("from", item.from, item);
    add("to", item.to, item);
    add("stack", featureGroup(item), item);
  }
  return [...groups.values()].map((row) => ({
    ...row,
    meanRating: row.weightedRating / Math.max(1, row.weightSum),
    effect: row.weightedRating / Math.max(1, row.weightSum) - 1000,
    confidence: confidenceFromTrials(row.tested),
  })).sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect)).slice(0, limit);
}

function buildModelDiagnostics(items, ratings, stats, history, currentActiveMs) {
  const repeats = new Map();
  let comparableRepeats = 0;
  let sameRepeatOutcomes = 0;
  for (const row of history) {
    const outcome = normalizedOutcomeForPair(row);
    if (outcome === "unknown" || outcome === "draw") continue;
    const repeatKey = row.pairKey || [row.a || row.progression_a_id, row.b || row.progression_b_id].filter(Boolean).sort().join("__vs__");
    const prev = repeats.get(repeatKey);
    if (prev) {
      comparableRepeats += 1;
      if (prev === outcome) sameRepeatOutcomes += 1;
    }
    repeats.set(repeatKey, outcome);
  }
  const repeatReliability = comparableRepeats ? sameRepeatOutcomes / comparableRepeats : null;
  const answered = history.length;
  const tieRate = answered ? history.filter((h) => winnerForChoice(h.preferred_choice || h.winner) === "draw").length / answered : 0;
  const allConfidence = items.length ? items.reduce((sum, item) => sum + confidenceFromTrials(statFor(item.id, stats).total), 0) / items.length : 0;
  const ranked = getRankedPreview(items, ratings, stats, Math.min(20, items.length));
  const topConfidence = ranked.length ? ranked.reduce((sum, item) => sum + confidenceFromTrials(statFor(item.id, stats).total), 0) / ranked.length : 0;
  const recent = history.slice(-50).map((h) => h.answerActiveMs).filter((x) => Number.isFinite(x) && x > 0);
  const early = history.slice(0, 50).map((h) => h.answerActiveMs).filter((x) => Number.isFinite(x) && x > 0);
  const recentMean = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
  const earlyMean = early.length ? early.reduce((a, b) => a + b, 0) / early.length : 0;
  const fatigueRatio = earlyMean > 0 && recentMean > 0 ? recentMean / earlyMean : null;
  const fatigueWarning = fatigueRatio !== null && fatigueRatio > 1.65 && answered > 80;
  const answersPerMinute = currentActiveMs > 0 ? answered / (currentActiveMs / 60000) : 0;
  let stopAdvice = "Continue collecting data.";
  if (answered >= 1000 && topConfidence > 0.82 && repeatReliability !== null && repeatReliability >= 0.72) stopAdvice = "Good first-pass map: top items are fairly stable.";
  if (answered >= 5000 && topConfidence > 0.92 && allConfidence > 0.45) stopAdvice = "Strong deep-run map: export probability map and analyze feature effects.";
  if (fatigueWarning) stopAdvice = "Pause recommended: recent answer time is much slower than early answer time.";
  return { answered, repeatChecks: comparableRepeats, repeatReliability, tieRate, allConfidence, topConfidence, recentMean, earlyMean, fatigueRatio, fatigueWarning, answersPerMinute, stopAdvice };
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function useAudio31() {
  const ctxRef = useRef(null);
  function getCtx() {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  }
  function playVoicing(voicing, start, duration, octaveShift, voiceRules, level = 0.048) {
    const ctx = getCtx();
    ["B", "T", "A", "S"].forEach((voice, idx) => {
      const step31 = voicing[voice] + octaveShift * 31;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq31(step31, voiceRules), start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(level * (idx === 0 ? 1.3 : 1), start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.04);
    });
  }
  function playProgression(item, tonicStep31, tempo, voiceRules, profileId) {
    const ctx = getCtx();
    const h = harmonizeProgression31(item, tonicStep31, voiceRules, profileId);
    const now = ctx.currentTime + 0.04;
    const beat = 60 / tempo;
    const dur = beat * 1.35;
    playVoicing(h.first, now, dur, item.octaveShift, voiceRules);
    playVoicing(h.second, now + dur + 0.09, dur, item.octaveShift, voiceRules);
  }
  function playComparison(a, b, tonicStep31, tempo, voiceRules, profileId) {
    const ctx = getCtx();
    const ha = harmonizeProgression31(a, tonicStep31, voiceRules, profileId);
    const hb = harmonizeProgression31(b, tonicStep31, voiceRules, profileId);
    const now = ctx.currentTime + 0.04;
    const beat = 60 / tempo;
    const dur = beat * 1.25;
    const gap = beat * 1.2;
    playVoicing(ha.first, now, dur, a.octaveShift, voiceRules);
    playVoicing(ha.second, now + dur + 0.08, dur, a.octaveShift, voiceRules);
    const startB = now + dur * 2 + gap;
    playVoicing(hb.first, startB, dur, b.octaveShift, voiceRules);
    playVoicing(hb.second, startB + dur + 0.08, dur, b.octaveShift, voiceRules);
  }
  return { playProgression, playComparison };
}

export default function ChordProgressionPreferenceTester() {
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [voiceRules, setVoiceRules] = useState(DEFAULT_VOICE_RULES);
  const [modeFilter, setModeFilter] = useState("mixed");
  const [includeChromatic, setIncludeChromatic] = useState(true);
  const [includeSlashDepth2, setIncludeSlashDepth2] = useState(true);
  const [includeSlashDepth3, setIncludeSlashDepth3] = useState(true);
  const [slashBasisLimit, setSlashBasisLimit] = useState(8);
  const [registerMode, setRegisterMode] = useState("all");
  const [allowCrossMode, setAllowCrossMode] = useState(true);
  const [voiceProfile, setVoiceProfile] = useState("commonPracticeSatb");
  const [targetComparisons, setTargetComparisons] = useState(1000);
  const [tonicOffset31, setTonicOffset31] = useState(0);
  const [tempo, setTempo] = useState(84);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [selectionMode, setSelectionMode] = useState("preference_only");
  const [selectionWeights, setSelectionWeights] = useState(DEFAULT_SELECTION_WEIGHTS);
  const [repeatRate, setRepeatRate] = useState(7);
  const [probabilityTemperature, setProbabilityTemperature] = useState(1);
  const [timerElapsedMs, setTimerElapsedMs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const timerLastTickRef = useRef(Date.now());
  const autosaveTimerRef = useRef(null);
  const runtimeRef = useRef({});
  const [displayLimit, setDisplayLimit] = useState(250);
  const [pairSearch, setPairSearch] = useState("");
  const [pairSourceFilter, setPairSourceFilter] = useState("all");
  const [pairRegisterFilter, setPairRegisterFilter] = useState("all");
  const [pairVisibleLimit, setPairVisibleLimit] = useState(200);
  const [ratings, setRatings] = useState({});
  const [stats, setStats] = useState({});
  const [history, setHistory] = useState([]);
  const [currentPair, setCurrentPair] = useState(null);
  const [sessionId] = useState(makeSessionId);
  const [preferenceChoice, setPreferenceChoice] = useState("unsure");
  const [emotionForm, setEmotionForm] = useState(DEFAULT_EMOTION_FORM);
  const trialStartedAtRef = useRef(Date.now());
  const [message, setMessage] = useState("Play A/B, choose preference and four emotion comparisons, then submit.");
  const { playProgression, playComparison } = useAudio31();
  const tonicStep31 = 124 + tonicOffset31;
  const currentTuning = useMemo(() => tuningSummary31(voiceRules), [voiceRules]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) {
        setModeFilter(saved.modeFilter || "mixed");
        setIncludeChromatic(saved.includeChromatic ?? true);
        setIncludeSlashDepth2(saved.includeSlashDepth2 ?? true);
        setIncludeSlashDepth3(saved.includeSlashDepth3 ?? true);
        setSlashBasisLimit(saved.slashBasisLimit || 8);
        setRegisterMode(saved.registerMode || "all");
        setAllowCrossMode(saved.allowCrossMode ?? true);
        setVoiceProfile(saved.voiceProfile || "commonPracticeSatb");
        setTargetComparisons(saved.targetComparisons || 1000);
        setTonicOffset31(saved.tonicOffset31 ?? 0);
        setTempo(saved.tempo ?? 84);
        setAutoPlayNext(Boolean(saved.autoPlayNext));
        setSelectionMode(normalizeSelectionMode(saved.selectionMode));
        setSelectionWeights({ ...DEFAULT_SELECTION_WEIGHTS, ...(saved.selectionWeights || {}) });
        setRepeatRate(saved.repeatRate ?? 7);
        setProbabilityTemperature(saved.probabilityTemperature ?? 1);
        setTimerElapsedMs(saved.timerElapsedMs || saved.timing?.timerElapsedMs || 0);
        setTimerRunning(saved.timerRunning ?? saved.timing?.timerRunning ?? true);
        setDisplayLimit(saved.displayLimit || 250);
        setPairSearch(saved.pairSearch || "");
        setPairSourceFilter(saved.pairSourceFilter || "all");
        setPairRegisterFilter(saved.pairRegisterFilter || "all");
        setPairVisibleLimit(saved.pairVisibleLimit || 200);
        setRatings(saved.ratings || {});
        setStats(saved.stats || {});
        setHistory(saved.history || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    timerLastTickRef.current = Date.now();
    if (!timerRunning) return undefined;
    const id = window.setInterval(() => {
      const now = Date.now();
      const delta = Math.max(0, now - timerLastTickRef.current);
      timerLastTickRef.current = now;
      setTimerElapsedMs((value) => value + delta);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const autosaveData = useMemo(() => ({ sessionId, modeFilter, includeChromatic, includeSlashDepth2, includeSlashDepth3, slashBasisLimit, registerMode, allowCrossMode, voiceProfile, targetComparisons, tonicOffset31, tempo, autoPlayNext, selectionMode, selectionWeights, repeatRate, probabilityTemperature, timerElapsedMs, timerRunning, displayLimit, pairSearch, pairSourceFilter, pairRegisterFilter, pairVisibleLimit, ratings, stats, history }), [sessionId, modeFilter, includeChromatic, includeSlashDepth2, includeSlashDepth3, slashBasisLimit, registerMode, allowCrossMode, voiceProfile, targetComparisons, tonicOffset31, tempo, autoPlayNext, selectionMode, selectionWeights, repeatRate, probabilityTemperature, timerElapsedMs, timerRunning, displayLimit, pairSearch, pairSourceFilter, pairRegisterFilter, pairVisibleLimit, ratings, stats, history]);

  useEffect(() => {
    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(autosaveData));
    }, 1200);
    return () => {
      if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    };
  }, [autosaveData]);

  useEffect(() => {
    const saveNow = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(autosaveData));
    window.addEventListener("beforeunload", saveNow);
    return () => window.removeEventListener("beforeunload", saveNow);
  }, [autosaveData]);

  const allItems = useMemo(() => buildItemsFromRules(rules, { includeChromatic, includeSlashDepth2, includeSlashDepth3, registerMode, slashBasisLimit }), [rules, includeChromatic, includeSlashDepth2, includeSlashDepth3, registerMode, slashBasisLimit]);
  const activeItems = useMemo(() => modeFilter === "major" ? allItems.filter((i) => i.mode === "major") : modeFilter === "minor" ? allItems.filter((i) => i.mode === "minor") : allItems, [allItems, modeFilter]);
  const rankedPreview = useMemo(() => getRankedPreview(activeItems, ratings, stats, displayLimit), [activeItems, ratings, stats, displayLimit]);
  const profileOptions = voiceRules?.profiles?.length ? voiceRules.profiles : DEFAULT_VOICE_RULES.profiles;
  const pairSourceOptions = useMemo(() => ["all", ...Array.from(new Set(activeItems.map((item) => item.source))).sort()], [activeItems]);
  const pairRegisterOptions = useMemo(() => ["all", ...Array.from(new Set(activeItems.map((item) => String(item.octaveShift)))).sort((a, b) => Number(a) - Number(b))], [activeItems]);
  const pairBrowserData = useMemo(() => {
    const query = pairSearch.trim().toLowerCase();
    const rows = [];
    let total = 0;
    for (const item of activeItems) {
      if (pairSourceFilter !== "all" && item.source !== pairSourceFilter) continue;
      if (pairRegisterFilter !== "all" && String(item.octaveShift) !== pairRegisterFilter) continue;
      if (query) {
        const haystack = `${item.from} ${item.to} ${item.mode} ${item.source} ${item.registerLabel}`.toLowerCase();
        if (!haystack.includes(query)) continue;
      }
      total += 1;
      if (rows.length < pairVisibleLimit) rows.push(item);
    }
    return { rows, total };
  }, [activeItems, pairSearch, pairSourceFilter, pairRegisterFilter, pairVisibleLimit]);

  useEffect(() => { setPairVisibleLimit(200); }, [pairSearch, pairSourceFilter, pairRegisterFilter, activeItems.length]);

  const emotionModel = useMemo(() => estimateEmotionCoordinates(activeItems, history), [activeItems, history]);

  useEffect(() => {
    setCurrentPair(choosePair(activeItems, ratings, stats, history, modeFilter === "mixed" ? allowCrossMode : false, { selectionMode, repeatRate, emotionModel, weights: selectionWeights }));
  }, [activeItems.length, modeFilter, allowCrossMode, includeChromatic, includeSlashDepth2, includeSlashDepth3, registerMode, slashBasisLimit, selectionMode, repeatRate, selectionWeights, emotionModel]);

  useEffect(() => {
    setPreferenceChoice("unsure");
    setEmotionForm(DEFAULT_EMOTION_FORM);
    trialStartedAtRef.current = Date.now();
  }, [currentPair?.[0]?.id, currentPair?.[1]?.id]);

  useEffect(() => {
    runtimeRef.current = { currentPair, tonicStep31, tempo, voiceRules, voiceProfile, playComparison, submitTrial, setPreferenceChoice };
  });

  useEffect(() => {
    const handler = (e) => {
      const runtime = runtimeRef.current;
      if (!runtime.currentPair) return;
      const key = e.key.toLowerCase();
      if (key === "a") runtime.setPreferenceChoice("A");
      if (key === "b") runtime.setPreferenceChoice("B");
      if (e.key === " " || key === "p") {
        e.preventDefault();
        runtime.playComparison(runtime.currentPair[0], runtime.currentPair[1], runtime.tonicStep31, runtime.tempo, runtime.voiceRules, runtime.voiceProfile);
      }
      if (key === "n") runtime.setPreferenceChoice("unsure");
      if (key === "enter") runtime.submitTrial();
    };
    window.addEventListener("keydown", handler, { passive: false });
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const [a, b] = currentPair || [];
  const completed = history.length;
  const progress = Math.min(100, Math.round((completed / targetComparisons) * 100));
  const currentActiveMs = timerRunning ? timerElapsedMs + Math.max(0, Date.now() - timerLastTickRef.current) : timerElapsedMs;
  const meanAnswerMs = completed > 0 ? currentActiveMs / completed : 0;
  const answersPerMinute = currentActiveMs > 0 ? completed / (currentActiveMs / 60000) : 0;
  const timingTargets = [1000, 5000, 10000].map((target) => ({
    target,
    remainingPairs: Math.max(0, target - completed),
    totalEstimateMs: meanAnswerMs > 0 ? target * meanAnswerMs : null,
    remainingEstimateMs: meanAnswerMs > 0 ? Math.max(0, target - completed) * meanAnswerMs : null,
  }));
  const aHarmony = useMemo(() => a ? harmonizeProgression31(a, tonicStep31, voiceRules, voiceProfile) : null, [a, tonicStep31, voiceRules, voiceProfile]);
  const bHarmony = useMemo(() => b ? harmonizeProgression31(b, tonicStep31, voiceRules, voiceProfile) : null, [b, tonicStep31, voiceRules, voiceProfile]);
  const currentPredictedA = a && b ? preferenceProbabilityFromRatings(defaultRating(a.id, ratings), defaultRating(b.id, ratings)) : null;
  const modelDiagnostics = useMemo(() => buildModelDiagnostics(activeItems, ratings, stats, history, currentActiveMs), [activeItems, ratings, stats, history]);
  const featureEffects = useMemo(() => buildFeatureEffects(activeItems, ratings, stats, 24), [activeItems, ratings, stats]);
  const probabilityPreview = useMemo(() => buildProbabilityMap(activeItems, ratings, stats, probabilityTemperature, 30, emotionModel), [activeItems, ratings, stats, probabilityTemperature, emotionModel]);
  const emotionCoordinatePreview = useMemo(() => emotionModel.rows.slice().sort((a, b) => {
    const au = EMOTION_AXES.reduce((sum, axis) => sum + (a[`${axis.key}_uncertainty`] || 0), 0);
    const bu = EMOTION_AXES.reduce((sum, axis) => sum + (b[`${axis.key}_uncertainty`] || 0), 0);
    return bu - au;
  }).slice(0, 14), [emotionModel]);

  function getCurrentActiveMs() {
    return timerRunning ? timerElapsedMs + Math.max(0, Date.now() - timerLastTickRef.current) : timerElapsedMs;
  }

  function toggleTimer() {
    if (timerRunning) {
      setTimerElapsedMs(getCurrentActiveMs());
      setTimerRunning(false);
    } else {
      timerLastTickRef.current = Date.now();
      setTimerRunning(true);
    }
  }

  function resetTimerOnly() {
    timerLastTickRef.current = Date.now();
    setTimerElapsedMs(0);
    setTimerRunning(true);
  }

  function nextPair(nextRatings = ratings, nextStats = stats, nextHistory = history, shouldPlay = false) {
    const nextEmotionModel = estimateEmotionCoordinates(activeItems, nextHistory);
    const pair = choosePair(activeItems, nextRatings, nextStats, nextHistory, modeFilter === "mixed" ? allowCrossMode : false, { selectionMode, repeatRate, emotionModel: nextEmotionModel, weights: selectionWeights });
    setCurrentPair(pair);
    if (shouldPlay && pair) setTimeout(() => playComparison(pair[0], pair[1], tonicStep31, tempo, voiceRules, voiceProfile), 80);
    return pair;
  }

  function choosePreference(choice) {
    setPreferenceChoice(normalizePreferredChoice(choice));
  }

  function updateEmotion(axisKey, value) {
    setEmotionForm((current) => ({ ...current, [axisKey]: clampEmotionValue(value) }));
  }

  function submitTrial() {
    if (!currentPair) return;
    const [left, right] = currentPair;
    const choice = normalizePreferredChoice(preferenceChoice);
    const preferenceValue = preferenceValueForChoice(choice);
    const winner = winnerForChoice(choice);
    const ra = defaultRating(left.id, ratings);
    const rb = defaultRating(right.id, ratings);
    const ea = 1 / (1 + Math.pow(10, (rb - ra) / 400));
    const eb = 1 - ea;
    const k = completed < 200 ? 40 : completed < 1000 ? 32 : 24;
    const scoreA = choice === "A" ? 1 : choice === "B" ? 0 : 0.5;
    const scoreB = 1 - scoreA;
    const nextRatings = { ...ratings, [left.id]: Math.round(ra + k * (scoreA - ea)), [right.id]: Math.round(rb + k * (scoreB - eb)) };
    const nextStats = { ...stats };
    const bump = (item, result) => {
      const s = statFor(item.id, nextStats);
      nextStats[item.id] = { wins: s.wins + (result === "win" ? 1 : 0), losses: s.losses + (result === "loss" ? 1 : 0), draws: s.draws + (result === "draw" ? 1 : 0), total: s.total + 1 };
    };
    if (choice === "A") { bump(left, "win"); bump(right, "loss"); }
    else if (choice === "B") { bump(left, "loss"); bump(right, "win"); }
    else { bump(left, "draw"); bump(right, "draw"); }
    const activeMsAtVote = getCurrentActiveMs();
    const previousActiveMs = history.length ? history[history.length - 1].activeMsAtVote ?? 0 : 0;
    const answerActiveMs = Math.max(0, activeMsAtVote - previousActiveMs);
    const responseWallMs = Math.max(0, Date.now() - trialStartedAtRef.current);
    const timestamp = new Date().toISOString();
    const trial = {
      trial_id: `trial_${String(history.length + 1).padStart(6, "0")}_${Date.now()}`,
      listener_id: sessionId,
      session_id: sessionId,
      progression_a_id: left.id,
      progression_b_id: right.id,
      preferred_choice: choice,
      preference_value: preferenceValue,
      emotion_x_valence: clampEmotionValue(emotionForm.x_valence),
      emotion_y_energy: clampEmotionValue(emotionForm.y_energy),
      emotion_z_tension: clampEmotionValue(emotionForm.z_tension),
      emotion_w_heroic_outward: clampEmotionValue(emotionForm.w_heroic_outward),
      response_time_ms: Math.round(answerActiveMs || responseWallMs),
      timestamp,
      at: timestamp,
      modeFilter,
      voiceProfile,
      tonicStep31,
      tempo,
      a: left.id,
      b: right.id,
      winner,
      pairKey: pairKey(left, right),
      activeMsAtVote,
      answerActiveMs,
      emotionEncoding: "A much more=+2, A slightly more=+1, no difference/unsure=0, B slightly more=-1, B much more=-2",
    };
    const nextHistory = [...history, trial];
    setRatings(nextRatings);
    setStats(nextStats);
    setHistory(nextHistory);
    setMessage(winner === "draw" ? "No clear preference recorded. Emotion comparison saved." : `Preference and emotion comparison recorded for ${choice}.`);
    nextPair(nextRatings, nextStats, nextHistory, autoPlayNext);
  }

  function resetResults() {
    setRatings({});
    setStats({});
    setHistory([]);
    setPreferenceChoice("unsure");
    setEmotionForm(DEFAULT_EMOTION_FORM);
    trialStartedAtRef.current = Date.now();
    resetTimerOnly();
    setMessage("Results and timer reset. Start a new 1000+ comparison run.");
    setTimeout(() => nextPair({}, {}, []), 0);
  }

  function sortedRowsForExport() {
    return [...activeItems].sort((a, b) => defaultRating(b.id, ratings) - defaultRating(a.id, ratings)).map((item, index) => {
      const s = statFor(item.id, stats);
      const e = emotionModel.byId[item.id] || {};
      return {
        rank: index + 1,
        rating: defaultRating(item.id, ratings),
        confidence: confidenceFromTrials(s.total),
        preferenceProbabilityVsNeutral: preferenceProbabilityFromRatings(defaultRating(item.id, ratings), 1000),
        mode: item.mode,
        progression_id: item.id,
        progression: `${item.from} -> ${item.to}`,
        register: item.registerLabel,
        octaveShift: item.octaveShift,
        source: item.source,
        wins: s.wins,
        losses: s.losses,
        draws: s.draws,
        comparisons: s.total,
        ...emotionExportFields(e),
      };
    });
  }

  function exportResults() {
    const rawTrialResponses = history.map((row) => normalizedTrialRow(row, sessionId));
    const pairwiseEmotionProbabilities = buildObservedEmotionPairwiseMap(history, emotionModel, 5000);
    downloadText("chord-progression-session.json", JSON.stringify({
      schema: "chord-progression-preference-emotion-session.v1-native31-spelled",
      exportedAt: new Date().toISOString(),
      targetComparisons,
      explanation: {
        emotionAxes: "Empirical listener-response coordinates only. The app does not encode fixed historical or musicological meanings for keys or chords.",
        emotionEncoding: "For each axis, +2/+1 means A is higher than B, 0 means no difference/unsure, -1/-2 means B is higher than A.",
        wAxis: "For W, higher means more outward/heroic/public/martial; lower means more inward/tender/intimate/devotional.",
      },
      settings: { modeFilter, includeChromatic, includeSlashDepth2, includeSlashDepth3, slashBasisLimit, registerMode, allowCrossMode, voiceProfile, tonicOffset31, tonicName31: stepName31(tonicOffset31), tonicStep31, tempo, autoPlayNext, selectionMode, selectionWeights, repeatRate, probabilityTemperature, timerElapsedMs: getCurrentActiveMs(), timerRunning, displayLimit, pairSearch, pairSourceFilter, pairRegisterFilter, pairVisibleLimit },
      tuning: currentTuning,
      timing: { timerElapsedMs: getCurrentActiveMs(), timerRunning, completed, meanAnswerMs, answersPerMinute, timingTargets },
      preferenceModel: { diagnostics: modelDiagnostics, featureEffects, probabilityMapPreview: probabilityPreview, fullProbabilityMapTop1000: buildProbabilityMap(activeItems, ratings, stats, probabilityTemperature, 1000, emotionModel) },
      emotionalCoordinateModel: emotionModel,
      pairwiseEmotionProbabilities,
      exampleSavedTrialRow: emotionExampleRow(),
      ratings,
      stats,
      history,
      rawTrialResponses,
      rows: sortedRowsForExport(),
      rules,
      voiceRules,
    }, null, 2));
  }

  function exportAllChordPairs() {
    const rows = activeItems.map((item, index) => {
      const s = statFor(item.id, stats);
      const e = emotionModel.byId[item.id] || {};
      return {
        index: index + 1,
        id: item.id,
        mode: item.mode,
        from: item.from,
        to: item.to,
        progression: `${item.from} -> ${item.to}`,
        register: item.registerLabel,
        octaveShift: item.octaveShift,
        source: item.source,
        rating: defaultRating(item.id, ratings),
        confidence: confidenceFromTrials(s.total),
        preferenceProbabilityVsNeutral: preferenceProbabilityFromRatings(defaultRating(item.id, ratings), 1000),
        wins: s.wins,
        losses: s.losses,
        draws: s.draws,
        comparisons: s.total,
        ...emotionExportFields(e),
      };
    });
    downloadText("all-chord-pairs.json", JSON.stringify({
      schema: "chord-progression-pair-list.v3-native31-spelled-emotion",
      exportedAt: new Date().toISOString(),
      total: rows.length,
      filters: { modeFilter, registerMode, includeChromatic, includeSlashDepth2, includeSlashDepth3, slashBasisLimit },
      emotionAxes: EMOTION_AXES,
      rows,
    }, null, 2));
  }

  function exportProbabilityMap() {
    downloadText("harmony-probability-map.json", JSON.stringify({
      schema: "harmony-probability-map.v3-native31-spelled-emotion",
      exportedAt: new Date().toISOString(),
      explanation: {
        preferenceProbabilityVsNeutral: "Probability that this item beats a neutral 1000-rated item in the current personal preference model.",
        transitionProbability: "Softmax-normalized transition probability using grammar prior, preference rating, confidence, register penalty, and tie penalty.",
        confidence: "Data confidence from number of trials; not a guarantee of musical truth.",
      },
      settings: { modeFilter, voiceProfile, probabilityTemperature, selectionMode, selectionWeights, repeatRate, tonicOffset31, tonicName31: stepName31(tonicOffset31), registerMode },
      tuning: currentTuning,
      diagnostics: modelDiagnostics,
      featureEffects,
      emotionalCoordinateModel: emotionModel,
      pairwiseEmotionProbabilities: buildObservedEmotionPairwiseMap(history, emotionModel, 5000),
      probabilityMap: buildProbabilityMap(activeItems, ratings, stats, probabilityTemperature, Math.min(activeItems.length, 10000), emotionModel),
    }, null, 2));
  }

  async function loadQualificationFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const saved = JSON.parse(await file.text());
      const settings = saved.settings || {};
      if (saved.rules) setRules(saved.rules);
      if (saved.voiceRules) setVoiceRules(saved.voiceRules);
      setModeFilter(settings.modeFilter || saved.modeFilter || "mixed");
      setIncludeChromatic(settings.includeChromatic ?? saved.includeChromatic ?? true);
      setIncludeSlashDepth2(settings.includeSlashDepth2 ?? true);
      setIncludeSlashDepth3(settings.includeSlashDepth3 ?? true);
      setSlashBasisLimit(settings.slashBasisLimit || 8);
      setRegisterMode(settings.registerMode || "all");
      setAllowCrossMode(settings.allowCrossMode ?? true);
      setVoiceProfile(settings.voiceProfile || saved.voiceProfile || "commonPracticeSatb");
      setTargetComparisons(saved.targetComparisons || settings.targetComparisons || 1000);
      setTonicOffset31(settings.tonicOffset31 ?? saved.tonicOffset31 ?? 0);
      setTempo(settings.tempo ?? saved.tempo ?? 84);
      setAutoPlayNext(Boolean(settings.autoPlayNext ?? saved.autoPlayNext));
      setSelectionMode(normalizeSelectionMode(settings.selectionMode || saved.selectionMode));
      setSelectionWeights({ ...DEFAULT_SELECTION_WEIGHTS, ...(settings.selectionWeights || saved.selectionWeights || {}) });
      setRepeatRate(settings.repeatRate ?? saved.repeatRate ?? 7);
      setProbabilityTemperature(settings.probabilityTemperature ?? saved.probabilityTemperature ?? 1);
      setTimerElapsedMs(saved.timing?.timerElapsedMs ?? settings.timerElapsedMs ?? saved.timerElapsedMs ?? 0);
      setTimerRunning(saved.timing?.timerRunning ?? settings.timerRunning ?? saved.timerRunning ?? true);
      timerLastTickRef.current = Date.now();
      setDisplayLimit(settings.displayLimit || 250);
      setPairSearch(settings.pairSearch || "");
      setPairSourceFilter(settings.pairSourceFilter || "all");
      setPairRegisterFilter(settings.pairRegisterFilter || "all");
      setPairVisibleLimit(settings.pairVisibleLimit || 200);
      setRatings(saved.ratings || {});
      setStats(saved.stats || {});
      setHistory(saved.history || []);
      clearVoicingCache();
      setMessage(`Opened saved qualification: ${file.name}`);
      setTimeout(() => nextPair(saved.ratings || {}, saved.stats || {}, saved.history || []), 0);
    } catch {
      setMessage("Could not open that saved qualification JSON.");
    }
  }

  async function loadRulesFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setRules(JSON.parse(await file.text()));
      setMessage(`Loaded progression rules: ${file.name}`);
    } catch {
      setMessage("Could not parse progression rules JSON.");
    }
  }

  async function loadVoiceRulesFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      setVoiceRules(parsed);
      setVoiceProfile(parsed?.profiles?.find((p) => p.id === "commonPracticeSatb")?.id || parsed?.profiles?.[0]?.id || "commonPracticeSatb");
      clearVoicingCache();
      setMessage(`Loaded voice-leading rules: ${file.name}`);
    } catch {
      setMessage("Could not parse voice-leading rules JSON.");
    }
  }

  function ChoiceButton({ active, children, onClick }) {
    return (
      <button
        type="button"
        className={`rounded-xl border px-3 py-2 text-sm transition ${active ? "bg-neutral-100 text-neutral-950 border-neutral-100" : "border-neutral-700 text-neutral-200 hover:bg-neutral-800"}`}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  function EmotionAxisQuestion({ axis }) {
    return (
      <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 space-y-3">
        <div>
          <div className="text-sm font-semibold text-neutral-200">{axis.label}</div>
          <div className="text-sm text-neutral-400">{axis.question}</div>
          <div className="text-xs text-neutral-500 mt-1">{axis.highMeaning}</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {EMOTION_OPTIONS.map((option) => (
            <ChoiceButton key={`${axis.key}-${option.value}`} active={emotionForm[axis.key] === option.value} onClick={() => updateEmotion(axis.key, option.value)}>
              {option.label}
            </ChoiceButton>
          ))}
        </div>
      </div>
    );
  }

  function ItemCard({ letter, item, harmony }) {
    const s = statFor(item.id, stats);
    const errorCount = harmony?.diagnostics?.filter((d) => d.severity === "error").length || 0;
    const warningCount = harmony?.diagnostics?.filter((d) => d.severity === "warning").length || 0;
    const styleCount = harmony?.diagnostics?.filter((d) => d.severity === "style").length || 0;
    return (
      <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-neutral-400">Option {letter}</div>
          <div className="text-xs uppercase tracking-wide rounded-full border border-neutral-700 px-2 py-1 text-neutral-300">{item.mode} · {item.registerLabel}</div>
        </div>
        <div className="text-3xl md:text-4xl font-semibold tracking-tight break-words">{item.from} → {item.to}</div>
        <div className="text-sm text-neutral-400">{item.source} · rating {defaultRating(item.id, ratings)} · pref. {pct(preferenceProbabilityFromRatings(defaultRating(item.id, ratings), 1000), 0)} · confidence {pct(confidenceFromTrials(s.total), 0)} · tested {s.total}x</div>
        <div className="text-xs text-neutral-500">SATB cost {Math.round(harmony?.cost || 0)} · diagnostics {errorCount} error / {warningCount} warning / {styleCount} style</div>
        <div className="flex gap-2 flex-wrap">
          <button className="rounded-xl border border-neutral-700 px-3 py-2 hover:bg-neutral-800" onClick={() => playProgression(item, tonicStep31, tempo, voiceRules, voiceProfile)}>Play {letter}</button>
          <button className="rounded-xl bg-neutral-100 text-neutral-950 px-3 py-2 font-medium" onClick={() => choosePreference(letter)}>{preferenceChoice === letter ? "Selected" : `Choose ${letter}`}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Chord Progression Preference Tester</h1>
            <p className="text-neutral-300 mt-2 max-w-3xl">Native 31-EDO / 1⁄4-comma-meantone-style SATB voice-led A/B testing for 2-chord progressions, including major, minor, full A/B and A/B/C slash stacks, and five octave registers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 min-w-64">
              <div className="text-sm text-neutral-400">Comparison target</div>
              <div className="text-2xl font-semibold">{completed} / {targetComparisons}</div>
              <div className="h-2 bg-neutral-800 rounded-full mt-3 overflow-hidden"><div className="h-full bg-neutral-100 rounded-full" style={{ width: `${progress}%` }} /></div>
              <div className="text-xs text-neutral-500 mt-2">Keyboard: A, B, N, Enter, Space/P</div>
            </div>
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 min-w-64">
              <div className="flex items-center justify-between gap-3"><div className="text-sm text-neutral-400">Active time</div><button className="rounded-lg border border-neutral-700 px-2 py-1 text-xs hover:bg-neutral-800" onClick={toggleTimer}>{timerRunning ? "Pause" : "Resume"}</button></div>
              <div className="text-2xl font-semibold tabular-nums">{formatDuration(currentActiveMs)}</div>
              <div className="text-xs text-neutral-500 mt-2">{formatSeconds(meanAnswerMs)} / answer · {formatRate(answersPerMinute)} answers/min</div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <aside className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-4 lg:col-span-1">
            <h2 className="text-lg font-semibold">Test setup</h2>

            <label className="block text-sm text-neutral-300">Test pool
              <select className="mt-1 w-full rounded-xl bg-neutral-950 border border-neutral-700 p-2" value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
                <option value="major">Major only</option>
                <option value="minor">Minor only</option>
                <option value="mixed">Major + minor</option>
              </select>
            </label>

            <label className="block text-sm text-neutral-300">Voice-leading profile
              <select className="mt-1 w-full rounded-xl bg-neutral-950 border border-neutral-700 p-2" value={voiceProfile} onChange={(e) => { setVoiceProfile(e.target.value); clearVoicingCache(); }}>
                {profileOptions.map((p) => <option key={p.id} value={p.id}>{p.name || p.id}</option>)}
              </select>
            </label>

            <label className="block text-sm text-neutral-300">Tonic root
              <select className="mt-1 w-full rounded-xl bg-neutral-950 border border-neutral-700 p-2" value={tonicOffset31} onChange={(e) => { setTonicOffset31(Number(e.target.value)); clearVoicingCache(); }}>
                {ROOTS_31.map(([name, value]) => <option key={`${name}-${value}`} value={value}>{name} · step {value}</option>)}
              </select>
            </label>

            <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-neutral-400 leading-relaxed">
              <div className="font-semibold text-neutral-200">Tuning: native 31-EDO / 1⁄4-comma meantone approximation</div>
              <div>{currentTuning.octaveSteps} equal steps per octave · A4 = {currentTuning.referenceHz} Hz · A4 step31 = {currentTuning.referenceStep31}</div>
              <div>Sharps/flats move by {ACCIDENTAL_STEP_31} steps, so C# and Db are different pitches.</div>
              <div>Triads: major 0–10–18, minor 0–8–18, diminished 0–8–16.</div>
            </div>

            <label className="block text-sm text-neutral-300">Tempo: {tempo} BPM
              <input className="mt-2 w-full" type="range" min="55" max="150" value={tempo} onChange={(e) => setTempo(Number(e.target.value))} />
            </label>

            <label className="block text-sm text-neutral-300">Target comparisons: {targetComparisons}
              <input className="mt-2 w-full" type="range" min="1000" max="10000" step="100" value={targetComparisons} onChange={(e) => setTargetComparisons(Number(e.target.value))} />
            </label>

            <label className="block text-sm text-neutral-300">Octave/register test
              <select className="mt-1 w-full rounded-xl bg-neutral-950 border border-neutral-700 p-2" value={registerMode} onChange={(e) => setRegisterMode(e.target.value)}>
                <option value="central">Central only</option>
                <option value="all">All five: -2, -1, central, +1, +2</option>
              </select>
            </label>

            <label className="block text-sm text-neutral-300">Slash basis limit: {slashBasisLimit} symbols per mode
              <input className="mt-2 w-full" type="range" min="4" max="9" step="1" value={slashBasisLimit} onChange={(e) => setSlashBasisLimit(Number(e.target.value))} />
            </label>

            <label className="flex items-start gap-2 text-sm text-neutral-300"><input type="checkbox" checked={includeChromatic} onChange={(e) => setIncludeChromatic(e.target.checked)} className="mt-1" /><span>Include optional chromatic/modal transitions</span></label>
            <label className="flex items-start gap-2 text-sm text-neutral-300"><input type="checkbox" checked={includeSlashDepth2} onChange={(e) => setIncludeSlashDepth2(e.target.checked)} className="mt-1" /><span>Include full stack A/B → C</span></label>
            <label className="flex items-start gap-2 text-sm text-neutral-300"><input type="checkbox" checked={includeSlashDepth3} onChange={(e) => setIncludeSlashDepth3(e.target.checked)} className="mt-1" /><span>Include full stack A/B/C → D</span></label>
            <label className="flex items-start gap-2 text-sm text-neutral-300"><input type="checkbox" checked={allowCrossMode} onChange={(e) => setAllowCrossMode(e.target.checked)} className="mt-1" disabled={modeFilter !== "mixed"} /><span>Allow major-vs-minor comparisons</span></label>
            <label className="flex items-start gap-2 text-sm text-neutral-300"><input type="checkbox" checked={autoPlayNext} onChange={(e) => setAutoPlayNext(e.target.checked)} className="mt-1" /><span>Auto-play next pair after vote</span></label>

            <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-3 space-y-3">
              <div className="text-sm font-semibold text-neutral-200">Scientific mode</div>
              <label className="block text-sm text-neutral-300">Next-pair selection
                <select className="mt-1 w-full rounded-xl bg-neutral-950 border border-neutral-700 p-2" value={selectionMode} onChange={(e) => setSelectionMode(normalizeSelectionMode(e.target.value))}>
                  <option value="preference_only">Preference only: active learning</option>
                  <option value="emotion_only">Emotion only: uncertain axes</option>
                  <option value="hybrid">Hybrid: preference + emotion</option>
                  <option value="balanced">Balanced Elo/Swiss control</option>
                  <option value="random">Random control</option>
                </select>
              </label>
              <div className="rounded-xl border border-neutral-800 p-3 space-y-2">
                <div className="text-xs text-neutral-400">Hybrid/emotion weights</div>
                {[
                  ["preference", "Preference", 0, 3],
                  ["valence", "X valence", 0, 3],
                  ["energy", "Y energy", 0, 3],
                  ["tension", "Z tension", 0, 3],
                  ["heroic", "W heroic/outward", 0, 3],
                ].map(([key, label, min, max]) => (
                  <label key={key} className="block text-xs text-neutral-300">{label}: {Number(selectionWeights[key]).toFixed(1)}
                    <input className="mt-1 w-full" type="range" min={min} max={max} step="0.1" value={selectionWeights[key]} onChange={(e) => setSelectionWeights((w) => ({ ...w, [key]: Number(e.target.value) }))} />
                  </label>
                ))}
              </div>

              <label className="block text-sm text-neutral-300">Repeat reliability checks: {repeatRate}%
                <input className="mt-2 w-full" type="range" min="0" max="20" step="1" value={repeatRate} onChange={(e) => setRepeatRate(Number(e.target.value))} />
              </label>
              <label className="block text-sm text-neutral-300">Probability-map temperature: {probabilityTemperature.toFixed(2)}
                <input className="mt-2 w-full" type="range" min="0.35" max="2.5" step="0.05" value={probabilityTemperature} onChange={(e) => setProbabilityTemperature(Number(e.target.value))} />
              </label>
              <button className="w-full rounded-xl border border-neutral-700 px-3 py-2 hover:bg-neutral-800" onClick={exportProbabilityMap}>Export probability map</button>
            </div>

            <label className="block text-sm text-neutral-300">Load progression rules JSON<input className="mt-2 w-full text-xs" type="file" accept=".json,application/json" onChange={loadRulesFile} /></label>
            <label className="block text-sm text-neutral-300">Load voice-leading rules JSON<input className="mt-2 w-full text-xs" type="file" accept=".json,application/json" onChange={loadVoiceRulesFile} /></label>
            <label className="block text-sm text-neutral-300">Open saved qualification/session<input className="mt-2 w-full text-xs" type="file" accept=".json,application/json" onChange={loadQualificationFile} /></label>

            <label className="block text-sm text-neutral-300">Visible ranking rows: {displayLimit}
              <input className="mt-2 w-full" type="range" min="50" max="1000" step="50" value={displayLimit} onChange={(e) => setDisplayLimit(Number(e.target.value))} />
            </label>

            <div className="text-xs text-neutral-400 leading-relaxed rounded-xl bg-neutral-950 border border-neutral-800 p-3">Pool: <b>{activeItems.length}</b> chord-pair items. The app renders only visible rows and computes audio only for the current A/B cards, so big pools stay usable.</div>
          </aside>

          <main className="lg:col-span-3 space-y-4">
            <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div><h2 className="text-lg font-semibold">Current comparison</h2><p className="text-sm text-neutral-400">{message}</p>{currentPredictedA !== null && <p className="text-xs text-neutral-500 mt-1">Model prediction: A beats B with {pct(currentPredictedA, 0)} probability. Active learning focuses on close or uncertain choices.</p>}</div>
                <button className="rounded-xl bg-neutral-100 text-neutral-950 px-4 py-2 font-medium disabled:opacity-40" disabled={!a || !b} onClick={() => playComparison(a, b, tonicStep31, tempo, voiceRules, voiceProfile)}>Play A then B</button>
              </div>

              {a && b ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"><ItemCard letter="A" item={a} harmony={aHarmony} /><ItemCard letter="B" item={b} harmony={bHarmony} /></div> : <div className="mt-4 rounded-2xl bg-neutral-950 border border-neutral-800 p-8 text-neutral-400">Not enough progressions in this pool.</div>}

              {a && b && (
                <div className="mt-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Judgment form</h3>
                    <p className="text-sm text-neutral-400">All emotion questions compare A vs B. The axes are empirical listener-response dimensions only.</p>
                  </div>
                  <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 space-y-3">
                    <div className="text-sm font-semibold text-neutral-200">Preference · Which progression do you prefer?</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <ChoiceButton active={preferenceChoice === "A"} onClick={() => choosePreference("A")}>A</ChoiceButton>
                      <ChoiceButton active={preferenceChoice === "unsure" || preferenceChoice === "equal"} onClick={() => choosePreference("unsure")}>No preference / unsure</ChoiceButton>
                      <ChoiceButton active={preferenceChoice === "B"} onClick={() => choosePreference("B")}>B</ChoiceButton>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {EMOTION_AXES.map((axis) => <EmotionAxisQuestion key={axis.key} axis={axis} />)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-xl bg-neutral-100 text-neutral-950 px-5 py-3 font-medium disabled:opacity-40" onClick={submitTrial} disabled={!a || !b}>Submit and load next pair</button>
                    <button className="rounded-xl border border-neutral-700 px-3 py-2 hover:bg-neutral-800" onClick={() => { setPreferenceChoice("unsure"); setEmotionForm(DEFAULT_EMOTION_FORM); }} disabled={!a || !b}>Neutral / unsure all</button>
                    <button className="rounded-xl border border-neutral-700 px-3 py-2 hover:bg-neutral-800" onClick={() => nextPair()} disabled={!a || !b}>Skip pair</button>
                    <button className="rounded-xl border border-red-900/70 text-red-200 px-3 py-2 hover:bg-red-950" onClick={resetResults}>Reset results</button>
                    <button className="rounded-xl border border-neutral-700 px-3 py-2 hover:bg-neutral-800" onClick={exportResults}>Save session / export results</button>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-4" style={{ contentVisibility: "auto", containIntrinsicSize: "560px" }}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Model dashboard</h2>
                  <p className="text-sm text-neutral-400">Preference learning summary: reliability, confidence, fatigue check, and stop-rule advice.</p>
                </div>
                <div className="text-sm rounded-full border border-neutral-700 px-3 py-1 text-neutral-300">{selectionMode === "preference_only" ? "Preference active" : selectionMode === "emotion_only" ? "Emotion active" : selectionMode === "hybrid" ? "Hybrid active" : selectionMode === "balanced" ? "Balanced" : "Random control"}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4"><div className="text-xs text-neutral-500">Repeat reliability</div><div className="text-2xl font-semibold tabular-nums">{modelDiagnostics.repeatReliability === null ? "—" : pct(modelDiagnostics.repeatReliability, 0)}</div><div className="text-xs text-neutral-500">{modelDiagnostics.repeatChecks} repeat checks</div></div>
                <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4"><div className="text-xs text-neutral-500">Tie / no-preference rate</div><div className="text-2xl font-semibold tabular-nums">{pct(modelDiagnostics.tieRate, 0)}</div></div>
                <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4"><div className="text-xs text-neutral-500">Top-20 confidence</div><div className="text-2xl font-semibold tabular-nums">{pct(modelDiagnostics.topConfidence, 0)}</div></div>
                <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4"><div className="text-xs text-neutral-500">Whole-pool confidence</div><div className="text-2xl font-semibold tabular-nums">{pct(modelDiagnostics.allConfidence, 0)}</div></div>
                <div className={`rounded-2xl border p-4 ${modelDiagnostics.fatigueWarning ? "bg-red-950/40 border-red-900" : "bg-neutral-950 border-neutral-800"}`}><div className="text-xs text-neutral-500">Fatigue check</div><div className="text-xl font-semibold">{modelDiagnostics.fatigueWarning ? "Pause" : "OK"}</div><div className="text-xs text-neutral-500">Recent/early speed {modelDiagnostics.fatigueRatio === null ? "—" : modelDiagnostics.fatigueRatio.toFixed(2)}×</div></div>
              </div>
              <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 text-sm text-neutral-300"><b>Stop-rule advice:</b> {modelDiagnostics.stopAdvice}</div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="overflow-auto rounded-xl border border-neutral-800 max-h-[360px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-neutral-950 text-neutral-300"><tr><th className="text-left p-3">Feature</th><th className="text-left p-3">Value</th><th className="text-right p-3">Effect</th><th className="text-right p-3">Confidence</th></tr></thead>
                    <tbody>{featureEffects.slice(0, 14).map((row) => <tr key={`${row.feature}:${row.value}`} className="border-t border-neutral-800 odd:bg-neutral-950/50"><td className="p-3 text-neutral-400">{row.feature}</td><td className="p-3 break-words">{row.value}</td><td className="p-3 text-right tabular-nums">{row.effect > 0 ? "+" : ""}{row.effect.toFixed(0)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{pct(row.confidence, 0)}</td></tr>)}</tbody>
                  </table>
                </div>
                <div className="overflow-auto rounded-xl border border-neutral-800 max-h-[360px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-neutral-950 text-neutral-300"><tr><th className="text-left p-3">Transition probability map</th><th className="text-right p-3">Pref.</th><th className="text-right p-3">Trans.</th><th className="text-right p-3">Conf.</th></tr></thead>
                    <tbody>{probabilityPreview.slice(0, 14).map((row) => <tr key={row.id} className="border-t border-neutral-800 odd:bg-neutral-950/50"><td className="p-3"><div className="font-medium break-words">{row.progression}</div><div className="text-xs text-neutral-500">{row.mode} · {row.register} · {row.source}</div></td><td className="p-3 text-right tabular-nums">{pct(row.preferenceProbabilityVsNeutral, 0)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{pct(row.transitionProbability, 3)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{pct(row.confidence, 0)}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-200">Emotional coordinate preview</h3>
                  <p className="text-xs text-neutral-500">Higher uncertainty means the active learner can learn more from comparisons involving that progression. Coordinates are learned only from listener judgments.</p>
                </div>
                <div className="overflow-auto rounded-xl border border-neutral-800 max-h-[360px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-neutral-950 text-neutral-300"><tr><th className="text-left p-3">Progression ID</th><th className="text-right p-3">X</th><th className="text-right p-3">Y</th><th className="text-right p-3">Z</th><th className="text-right p-3">W</th><th className="text-right p-3">Mean uncertainty</th></tr></thead>
                    <tbody>{emotionCoordinatePreview.map((row) => { const meanU = EMOTION_AXES.reduce((sum, axis) => sum + row[`${axis.key}_uncertainty`], 0) / EMOTION_AXES.length; return <tr key={row.progression_id} className="border-t border-neutral-800 odd:bg-neutral-950/50"><td className="p-3 font-medium break-words">{row.progression_id}</td><td className="p-3 text-right tabular-nums">{row.x_valence_mean.toFixed(2)}</td><td className="p-3 text-right tabular-nums">{row.y_energy_mean.toFixed(2)}</td><td className="p-3 text-right tabular-nums">{row.z_tension_mean.toFixed(2)}</td><td className="p-3 text-right tabular-nums">{row.w_heroic_outward_mean.toFixed(2)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{meanU.toFixed(2)}</td></tr>; })}</tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div><h2 className="text-lg font-semibold">Timer and clock calculator</h2><p className="text-sm text-neutral-400">Counts active testing time only. Pause when you rest so the estimates remain useful.</p></div>
                <div className="flex gap-2"><button className="rounded-xl bg-neutral-100 text-neutral-950 px-4 py-2 font-medium" onClick={toggleTimer}>{timerRunning ? "Pause time" : "Resume time"}</button><button className="rounded-xl border border-neutral-700 px-4 py-2 hover:bg-neutral-800" onClick={resetTimerOnly}>Reset timer</button></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4"><div className="text-xs text-neutral-500">Total active time</div><div className="text-2xl font-semibold tabular-nums">{formatDuration(currentActiveMs)}</div></div>
                <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4"><div className="text-xs text-neutral-500">Mean answer time</div><div className="text-2xl font-semibold tabular-nums">{formatSeconds(meanAnswerMs)}</div></div>
                <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4"><div className="text-xs text-neutral-500">Answers per minute</div><div className="text-2xl font-semibold tabular-nums">{formatRate(answersPerMinute)}</div></div>
                <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4"><div className="text-xs text-neutral-500">Timer status</div><div className="text-2xl font-semibold">{timerRunning ? "Running" : "Paused"}</div></div>
              </div>
              <div className="overflow-auto rounded-xl border border-neutral-800"><table className="w-full text-sm"><thead className="bg-neutral-950 text-neutral-300"><tr><th className="text-left p-3">Target</th><th className="text-right p-3">Remaining answers</th><th className="text-right p-3">Estimated remaining time</th><th className="text-right p-3">Estimated full run time</th></tr></thead><tbody>{timingTargets.map((row) => <tr key={row.target} className="border-t border-neutral-800 odd:bg-neutral-950/50"><td className="p-3 font-medium">{row.target}</td><td className="p-3 text-right tabular-nums text-neutral-300">{row.remainingPairs}</td><td className="p-3 text-right tabular-nums">{row.remainingEstimateMs === null ? "—" : formatDuration(row.remainingEstimateMs)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{row.totalEstimateMs === null ? "—" : formatDuration(row.totalEstimateMs)}</td></tr>)}</tbody></table></div>
            </section>

            <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-4" style={{ contentVisibility: "auto", containIntrinsicSize: "700px" }}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">All chord pairs</h2>
                  <p className="text-sm text-neutral-400">Browse every generated 2-chord item in the active pool, including emotional coordinates. The list is paged so it does not render thousands of rows at once.</p>
                </div>
                <button className="rounded-xl border border-neutral-700 px-4 py-2 hover:bg-neutral-800" onClick={exportAllChordPairs}>Export all chord pairs</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="block text-sm text-neutral-300">Search pair
                  <input className="mt-1 w-full rounded-xl bg-neutral-950 border border-neutral-700 p-2" value={pairSearch} onChange={(e) => setPairSearch(e.target.value)} placeholder="VI → V, V/V, minor, slash..." />
                </label>
                <label className="block text-sm text-neutral-300">Source
                  <select className="mt-1 w-full rounded-xl bg-neutral-950 border border-neutral-700 p-2" value={pairSourceFilter} onChange={(e) => setPairSourceFilter(e.target.value)}>
                    {pairSourceOptions.map((source) => <option key={source} value={source}>{source === "all" ? "All sources" : source}</option>)}
                  </select>
                </label>
                <label className="block text-sm text-neutral-300">Register
                  <select className="mt-1 w-full rounded-xl bg-neutral-950 border border-neutral-700 p-2" value={pairRegisterFilter} onChange={(e) => setPairRegisterFilter(e.target.value)}>
                    {pairRegisterOptions.map((reg) => <option key={reg} value={reg}>{reg === "all" ? "All registers" : REGISTERS.find((r) => String(r.shift) === reg)?.label || reg}</option>)}
                  </select>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-neutral-400">
                <div>Showing <b>{pairBrowserData.rows.length}</b> of <b>{pairBrowserData.total}</b> matching chord pairs. Active pool total: <b>{activeItems.length}</b>.</div>
                <div className="flex gap-2">
                  <button className="rounded-xl border border-neutral-700 px-3 py-2 hover:bg-neutral-800 disabled:opacity-40" disabled={pairVisibleLimit <= 200} onClick={() => setPairVisibleLimit(200)}>Back to 200</button>
                  <button className="rounded-xl border border-neutral-700 px-3 py-2 hover:bg-neutral-800 disabled:opacity-40" disabled={pairBrowserData.rows.length >= pairBrowserData.total} onClick={() => setPairVisibleLimit((n) => Math.min(n + 200, pairBrowserData.total))}>Show 200 more</button>
                </div>
              </div>

              <div className="overflow-auto max-h-[520px] rounded-xl border border-neutral-800">
                <table className="w-full text-sm table-fixed">
                  <thead className="sticky top-0 bg-neutral-950 text-neutral-300"><tr><th className="text-left p-3 w-16">#</th><th className="text-left p-3">Chord pair</th><th className="text-left p-3 w-24">Mode</th><th className="text-left p-3 w-28">Register</th><th className="text-left p-3">Source</th><th className="text-right p-3 w-24">Rating</th><th className="text-right p-3 w-20">Pref.</th><th className="text-right p-3 w-28">X Valence</th><th className="text-right p-3 w-28">Y Energy</th><th className="text-right p-3 w-28">Z Tension</th><th className="text-right p-3 w-28">W Heroic</th><th className="text-right p-3 w-20">Conf.</th><th className="text-right p-3 w-20">Tested</th></tr></thead>
                  <tbody>{pairBrowserData.rows.map((item, index) => { const s = statFor(item.id, stats); const e = emotionModel.byId[item.id] || {}; return <tr key={item.id} className="border-t border-neutral-800 odd:bg-neutral-950/50"><td className="p-3 text-neutral-500 tabular-nums">{index + 1}</td><td className="p-3 font-medium break-words">{item.from} → {item.to}</td><td className="p-3 text-neutral-300">{item.mode}</td><td className="p-3 text-neutral-300">{item.registerLabel}</td><td className="p-3 text-neutral-400 break-words">{item.source}</td><td className="p-3 text-right tabular-nums">{defaultRating(item.id, ratings)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{pct(preferenceProbabilityFromRatings(defaultRating(item.id, ratings), 1000), 0)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{formatEmotionCoordinate(e.x_valence_mean, e.x_valence_uncertainty)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{formatEmotionCoordinate(e.y_energy_mean, e.y_energy_uncertainty)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{formatEmotionCoordinate(e.z_tension_mean, e.z_tension_uncertainty)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{formatEmotionCoordinate(e.w_heroic_outward_mean, e.w_heroic_outward_uncertainty)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{pct(confidenceFromTrials(s.total), 0)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{s.total}</td></tr>; })}</tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4" style={{ contentVisibility: "auto", containIntrinsicSize: "700px" }}>
              <div className="flex items-center justify-between gap-3 mb-3"><h2 className="text-lg font-semibold">Ranking</h2><div className="text-sm text-neutral-400">Most preferred → least preferred · emotion cells show mean ± uncertainty</div></div>
              <div className="overflow-auto max-h-[560px] rounded-xl border border-neutral-800">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-neutral-950 text-neutral-300"><tr><th className="text-left p-3">Rank</th><th className="text-left p-3">Progression</th><th className="text-left p-3">Mode</th><th className="text-left p-3">Register</th><th className="text-right p-3">Rating</th><th className="text-right p-3">Pref.</th><th className="text-right p-3">X Valence</th><th className="text-right p-3">Y Energy</th><th className="text-right p-3">Z Tension</th><th className="text-right p-3">W Heroic</th><th className="text-right p-3">Conf.</th><th className="text-right p-3">W-L-D</th><th className="text-right p-3">Tested</th></tr></thead>
                  <tbody>{rankedPreview.map((item, index) => { const s = statFor(item.id, stats); const e = emotionModel.byId[item.id] || {}; return <tr key={item.id} className="border-t border-neutral-800 odd:bg-neutral-950/50"><td className="p-3 text-neutral-400">{index + 1}</td><td className="p-3 font-medium break-words">{item.from} → {item.to}</td><td className="p-3 text-neutral-300">{item.mode}</td><td className="p-3 text-neutral-300">{item.registerLabel}</td><td className="p-3 text-right tabular-nums">{defaultRating(item.id, ratings)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{pct(preferenceProbabilityFromRatings(defaultRating(item.id, ratings), 1000), 0)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{formatEmotionCoordinate(e.x_valence_mean, e.x_valence_uncertainty)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{formatEmotionCoordinate(e.y_energy_mean, e.y_energy_uncertainty)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{formatEmotionCoordinate(e.z_tension_mean, e.z_tension_uncertainty)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{formatEmotionCoordinate(e.w_heroic_outward_mean, e.w_heroic_outward_uncertainty)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{pct(confidenceFromTrials(s.total), 0)}</td><td className="p-3 text-right tabular-nums text-neutral-300">{s.wins}-{s.losses}-{s.draws}</td><td className="p-3 text-right tabular-nums text-neutral-300">{s.total}</td></tr>; })}</tbody>
                </table>
              </div>
            </section>
          </main>
        </section>
      </div>
    </div>
  );
}
