import unittest

from python.emotion_model import (
    TrialResult,
    active_learning_score,
    clamp_emotion_value,
    estimate_emotional_coordinates,
    export_emotion_model,
    preference_value,
)


class EmotionModelTests(unittest.TestCase):
    def test_response_encoding(self):
        self.assertEqual(clamp_emotion_value(3), 2)
        self.assertEqual(clamp_emotion_value(-9), -2)
        self.assertEqual(clamp_emotion_value("bad"), 0)
        self.assertEqual(preference_value("A"), 1)
        self.assertEqual(preference_value("B"), -1)
        self.assertEqual(preference_value("unsure"), 0)

    def test_saving_trial_result(self):
        row = TrialResult.from_raw({
            "trial_id": "t1",
            "session_id": "s1",
            "progression_a_id": "pA",
            "progression_b_id": "pB",
            "preferred_choice": "A",
            "emotion_x_valence": 2,
            "emotion_y_energy": -1,
            "emotion_z_tension": 0,
            "emotion_w_heroic_outward": 1,
            "response_time_ms": 1200,
            "timestamp": "2026-05-10T12:00:00Z",
        })
        self.assertEqual(row.preference_value, 1)
        self.assertEqual(row.emotion_x_valence, 2)
        self.assertEqual(row.progression_b_id, "pB")

    def test_estimating_emotional_coordinates(self):
        coords = estimate_emotional_coordinates(["pA", "pB"], [{
            "progression_a_id": "pA",
            "progression_b_id": "pB",
            "emotion_x_valence": 2,
            "emotion_y_energy": 1,
            "emotion_z_tension": -1,
            "emotion_w_heroic_outward": 0,
        }])
        self.assertGreater(coords["pA"]["x_valence_mean"], 0)
        self.assertLess(coords["pB"]["x_valence_mean"], 0)
        self.assertLess(coords["pA"]["z_tension_mean"], 0)

    def test_export_format(self):
        export = export_emotion_model(["pA", "pB"], [{"progression_a_id": "pA", "progression_b_id": "pB"}])
        self.assertIn("coordinates", export)
        self.assertIn("rawTrialResponses", export)
        self.assertEqual(export["schema"], "empirical-listener-emotion-coordinates.v1")

    def test_active_learning_selection_modes(self):
        coords = estimate_emotional_coordinates(["pA", "pB"], [])
        pref = active_learning_score("pA", "pB", coords, selection_mode="preference_only", preference_uncertainty=0.4)
        emo = active_learning_score("pA", "pB", coords, selection_mode="emotion_only", preference_uncertainty=0.4)
        hybrid = active_learning_score("pA", "pB", coords, selection_mode="hybrid", preference_uncertainty=0.4)
        self.assertAlmostEqual(pref, 0.4)
        self.assertGreater(emo, 0.0)
        self.assertGreater(hybrid, pref)

    def test_backward_compatibility_preference_only_data(self):
        row = TrialResult.from_raw({"a": "oldA", "b": "oldB", "winner": "draw", "at": "old-time"})
        self.assertEqual(row.preferred_choice, "unsure")
        self.assertEqual(row.preference_value, 0)
        self.assertEqual(row.emotion_x_valence, 0)


if __name__ == "__main__":
    unittest.main()
