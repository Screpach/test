# Emotional comparison extension

## Existing architecture found

The provided project is a single-file React/Vite web app (`src/App.jsx`) with client-side localStorage/session JSON export. It already contains:

- progression-rule generation
- native 31-EDO playback
- SATB voice-leading search/cache
- Elo-like Bayesian/Bradley-Terry-style preference updates
- active/balanced/random pair selection
- timer/statistics
- JSON export/import

No connected Python backend was present in the project zip. A small Python reference module and unit tests were added under `python/` and `tests/` so the emotional model can also be used in a Python pipeline.

## Files changed or added

Changed:

- `src/App.jsx`

Added:

- `python/emotion_model.py`
- `python/__init__.py`
- `tests/test_emotion_model.py`
- `EMOTION_EXTENSION.md`

## Trial row example

```json
{
  "trial_id": "trial_000001_example",
  "listener_id": "session-example",
  "session_id": "session-example",
  "progression_a_id": "major:I->V:reg0",
  "progression_b_id": "minor:VI->V:reg0",
  "preferred_choice": "A",
  "preference_value": 1,
  "emotion_x_valence": 1,
  "emotion_y_energy": -1,
  "emotion_z_tension": 0,
  "emotion_w_heroic_outward": 2,
  "response_time_ms": 8420,
  "timestamp": "2026-05-10T12:00:00.000Z"
}
```

## Tests

Run:

```bash
python -m unittest discover -s tests
npm run build
```

## Conceptual boundary

The app does not assign fixed meanings to keys, tonalities, or chords. Emotional axes are learned only from listener comparisons.
