"""Empirical emotional-comparison extension for chord-progression tests.

The axes in this module are listener-response dimensions only. They do not
encode fixed musicological or historical claims about chords, keys, modes, or
tonalities. Coordinates are estimated only from listener comparisons.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from math import exp, sqrt
from typing import Dict, Iterable, List, Mapping, MutableMapping, Optional, Sequence, Tuple

AXES: Tuple[str, ...] = (
    "x_valence",
    "y_energy",
    "z_tension",
    "w_heroic_outward",
)
AXIS_FIELDS: Mapping[str, str] = {
    "x_valence": "emotion_x_valence",
    "y_energy": "emotion_y_energy",
    "z_tension": "emotion_z_tension",
    "w_heroic_outward": "emotion_w_heroic_outward",
}


def clamp_emotion_value(value: object) -> int:
    """Encode one five-point A-vs-B emotional judgment as -2..+2."""
    try:
        number = int(round(float(value)))
    except (TypeError, ValueError):
        return 0
    return max(-2, min(2, number))


def preference_value(choice: object) -> int:
    """Encode preference as A=+1, B=-1, equal/unsure=0."""
    if choice == "A":
        return 1
    if choice == "B":
        return -1
    return 0


@dataclass(frozen=True)
class TrialResult:
    trial_id: str
    listener_id: str
    session_id: str
    progression_a_id: str
    progression_b_id: str
    preferred_choice: str
    preference_value: int
    emotion_x_valence: int
    emotion_y_energy: int
    emotion_z_tension: int
    emotion_w_heroic_outward: int
    response_time_ms: Optional[int]
    timestamp: str

    @staticmethod
    def from_raw(raw: Mapping[str, object], *, session_id: str = "unknown-session") -> "TrialResult":
        """Normalize new or legacy preference-only rows into the extended row shape."""
        choice = raw.get("preferred_choice") or raw.get("winner") or "unsure"
        if choice == "draw":
            choice = "unsure"
        if choice not in {"A", "B", "equal", "unsure"}:
            choice = "unsure"
        a_id = str(raw.get("progression_a_id") or raw.get("a") or "")
        b_id = str(raw.get("progression_b_id") or raw.get("b") or "")
        timestamp = str(raw.get("timestamp") or raw.get("at") or datetime.now(timezone.utc).isoformat())
        return TrialResult(
            trial_id=str(raw.get("trial_id") or f"legacy-{timestamp}-{a_id}-{b_id}"),
            listener_id=str(raw.get("listener_id") or raw.get("session_id") or session_id),
            session_id=str(raw.get("session_id") or raw.get("listener_id") or session_id),
            progression_a_id=a_id,
            progression_b_id=b_id,
            preferred_choice=str(choice),
            preference_value=int(raw.get("preference_value") if raw.get("preference_value") in {-1, 0, 1} else preference_value(choice)),
            emotion_x_valence=clamp_emotion_value(raw.get("emotion_x_valence")),
            emotion_y_energy=clamp_emotion_value(raw.get("emotion_y_energy")),
            emotion_z_tension=clamp_emotion_value(raw.get("emotion_z_tension")),
            emotion_w_heroic_outward=clamp_emotion_value(raw.get("emotion_w_heroic_outward")),
            response_time_ms=(int(raw["response_time_ms"]) if raw.get("response_time_ms") is not None else None),
            timestamp=timestamp,
        )

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


def estimate_emotional_coordinates(
    progression_ids: Sequence[str],
    trials: Iterable[Mapping[str, object]],
    *,
    prior_weight: float = 4.0,
) -> Dict[str, Dict[str, float]]:
    """Estimate regularized coordinates for each progression on each listener-response axis.

    Each axis is treated as signed pairwise evidence. A positive response means
    progression A is judged higher on that axis than B; B receives the opposite
    signed evidence. Neutral responses weakly reduce uncertainty without moving
    the coordinate mean.
    """
    ids = set(progression_ids)
    accum: Dict[str, Dict[str, Dict[str, float]]] = {
        pid: {axis: {"sum": 0.0, "weight": 0.0, "comparisons": 0.0} for axis in AXES}
        for pid in progression_ids
    }
    for raw in trials:
        trial = TrialResult.from_raw(raw)
        if trial.progression_a_id not in ids or trial.progression_b_id not in ids:
            continue
        for axis in AXES:
            field = AXIS_FIELDS[axis]
            value = clamp_emotion_value(getattr(trial, field))
            evidence_weight = abs(value) if value else 0.35
            a = accum[trial.progression_a_id][axis]
            b = accum[trial.progression_b_id][axis]
            a["sum"] += value
            b["sum"] -= value
            a["weight"] += evidence_weight
            b["weight"] += evidence_weight
            a["comparisons"] += 1
            b["comparisons"] += 1

    output: Dict[str, Dict[str, float]] = {}
    for pid in progression_ids:
        row: Dict[str, float] = {}
        for axis in AXES:
            data = accum[pid][axis]
            denom = prior_weight + data["weight"]
            row[f"{axis}_mean"] = data["sum"] / denom
            row[f"{axis}_uncertainty"] = 1.0 / sqrt(denom)
            row[f"{axis}_comparisons"] = data["comparisons"]
        output[pid] = row
    return output


def pairwise_probability(a_mean: float, b_mean: float, *, scale: float = 1.75) -> float:
    """Approximate probability that A is higher than B on one emotional axis."""
    return 1.0 / (1.0 + exp(-(a_mean - b_mean) * scale))


def export_emotion_model(progression_ids: Sequence[str], trials: Iterable[Mapping[str, object]]) -> Dict[str, object]:
    coordinates = estimate_emotional_coordinates(progression_ids, trials)
    return {
        "schema": "empirical-listener-emotion-coordinates.v1",
        "note": "Axes are empirical listener-response dimensions, not fixed musicological truths.",
        "coordinates": coordinates,
        "rawTrialResponses": [TrialResult.from_raw(row).to_dict() for row in trials],
    }


def active_learning_score(
    a_id: str,
    b_id: str,
    coordinates: Mapping[str, Mapping[str, float]],
    *,
    selection_mode: str = "preference_only",
    preference_uncertainty: float = 1.0,
    weights: Optional[Mapping[str, float]] = None,
) -> float:
    """Transparent candidate score for preference, emotion, or hybrid selection.

    Preference and emotion are not mixed in the model itself; this only ranks
    candidate comparisons for efficient data collection.
    """
    weights = {"preference": 1.0, "valence": 1.0, "energy": 1.0, "tension": 1.0, "heroic": 1.0, **dict(weights or {})}
    if selection_mode == "preference_only":
        return weights["preference"] * preference_uncertainty
    axis_weights = {
        "x_valence": weights["valence"],
        "y_energy": weights["energy"],
        "z_tension": weights["tension"],
        "w_heroic_outward": weights["heroic"],
    }
    emotion_score = 0.0
    for axis, weight in axis_weights.items():
        au = coordinates.get(a_id, {}).get(f"{axis}_uncertainty", 0.5)
        bu = coordinates.get(b_id, {}).get(f"{axis}_uncertainty", 0.5)
        am = coordinates.get(a_id, {}).get(f"{axis}_mean", 0.0)
        bm = coordinates.get(b_id, {}).get(f"{axis}_mean", 0.0)
        closeness = 1.0 / (1.0 + abs(am - bm))
        emotion_score += weight * ((au + bu) / 2.0 + 0.35 * closeness)
    if selection_mode == "emotion_only":
        return emotion_score
    if selection_mode == "hybrid":
        return weights["preference"] * preference_uncertainty + emotion_score
    return weights["preference"] * preference_uncertainty
