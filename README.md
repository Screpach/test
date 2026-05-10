# Chord Progression Preference Tester — Research / Science Version

## Run

1. Install Node.js LTS from https://nodejs.org/
2. Open Terminal / Command Prompt in this folder.
3. Run:

```bash
npm install
npm run dev
```

4. Open the local URL shown in the terminal, usually http://localhost:5173/

## Main features

- A/B preference testing for 2-chord progressions.
- Four empirical emotional comparison axes: valence, energy, tension, and heroic/outward.
- Per-trial storage of preference, four emotion values, response time, session id, trial id, and timestamp.
- Major, minor, and mixed pools.
- Full slash-stack pools: A/B → C and A/B/C → D.
- Five register/octave options.
- Native 31-EDO SATB voice-leading.
- Timer, mean answer time, answers/minute, and time estimates for 1000, 5000, and 10000 comparisons.
- Save/open qualification sessions.
- Browse and export all generated chord-pair items.
- Active-learning next-pair selection with preference-only, emotion-only, and hybrid modes.
- Balanced Elo/Swiss and random-control modes.
- Repeat reliability checks.
- Fatigue detection from answer time.
- Confidence estimate per chord-pair item.
- Preference probability vs neutral item.
- Transition-probability map export plus emotional coordinate export.
- Ranking and All chord pairs tables display X/Y/Z/W emotional qualities as mean ± uncertainty.
- Feature-effect summary by mode, source, register, from chord, to chord, and stack type.
- Stop-rule dashboard for deciding when a study block is stable enough.

## Recommended study protocol

Start with active-learning mode, central register, and 1000 comparisons. Keep repeat reliability checks around 5–10%. If the top-20 confidence and repeat reliability are acceptable, export the probability map. Then run a deeper 5000–10000 comparison block with all registers enabled.

Use random-control mode occasionally to check whether active learning is biasing what you hear.

## Performance notes

The app avoids rendering every generated item at once. The ranking table and all-chord-pairs browser are paged/limited, and SATB/audio is computed only for the current A/B pair or when playback is requested. Voicing calculations use a bounded LRU-style cache.

## Save work

Use **Save session / export results** in the app. To continue later, use **Open saved qualification/session** and select the saved JSON file.

Use **Export probability map** when you want data for your harmony-language model.

## Emotional axes

The emotional axes are empirical listener-response dimensions only. The app does not hard-code claims such as a specific key or chord always meaning a specific emotion. Coordinates are learned only from your comparisons.

Encoding: A much more = +2, A slightly more = +1, no difference/unsure = 0, B slightly more = -1, B much more = -2. For W, higher means more outward/heroic/public/martial; lower means more inward/tender/intimate/devotional.

## Tests

```bash
python -m unittest discover -s tests
npm run build
```
