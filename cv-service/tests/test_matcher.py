import unittest
import sys
import os
import numpy as np

# Add cv-service root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.matcher import CosineMatcher

class TestCosineMatcher(unittest.TestCase):
    def setUp(self):
        self.matcher = CosineMatcher()

    def test_calculate_similarity(self):
        # Exact match
        emb_a = [1.0, 0.0, 0.0]
        emb_b = [1.0, 0.0, 0.0]
        sim = self.matcher.calculate_similarity(emb_a, emb_b)
        self.assertAlmostEqual(sim, 1.0, places=5)

        # Orthogonal
        emb_c = [0.0, 1.0, 0.0]
        sim_ortho = self.matcher.calculate_similarity(emb_a, emb_c)
        self.assertAlmostEqual(sim_ortho, 0.0, places=5)

        # Empty / None
        self.assertEqual(self.matcher.calculate_similarity([], [1.0]), 0.0)

    def test_cluster_rows(self):
        # 3 rows of detections
        detections = [
            {"bbox": [10, 120, 50, 160]}, # Row 2
            {"bbox": [10, 10, 50, 50]},   # Row 1, left
            {"bbox": [100, 230, 140, 270]}, # Row 3
            {"bbox": [60, 15, 95, 45]},   # Row 1, right
        ]
        
        # Row tolerance is 50.0 by default
        rows = self.matcher.cluster_rows(detections)
        
        # We expect 3 clustered rows:
        # Row 1: y centers ~ 30, x sorted: [10, 10, 50, 50] then [60, 15, 95, 45]
        # Row 2: y centers ~ 140
        # Row 3: y centers ~ 250
        self.assertEqual(len(rows), 3)
        self.assertEqual(len(rows[0]), 2)
        self.assertEqual(len(rows[1]), 1)
        self.assertEqual(len(rows[2]), 1)
        
        # Check sorting left-to-right in first row
        self.assertLess(rows[0][0]["cx"], rows[0][1]["cx"])

    def test_sequence_alignment_perfect_match(self):
        # Simulating one expected cell with 2 facings
        expected = [
            {
                "row": 1,
                "position": 1,
                "reference_product_id": "prod-1",
                "embedding": [1.0, 0.0],
                "facing_count": 2
            }
        ]
        
        # 2 correct detections
        detected = [
            {"bbox": [10, 10, 50, 50], "embedding": [0.99, 0.0]},
            {"bbox": [60, 10, 100, 50], "embedding": [0.98, 0.0]}
        ]
        
        # We need to expand expected cells before passing to align_sequence
        exp_expanded = []
        for cell in expected:
            for f in range(cell["facing_count"]):
                exp_expanded.append({
                    "row": cell["row"],
                    "position": cell["position"],
                    "reference_product_id": cell["reference_product_id"],
                    "embedding": cell["embedding"],
                    "facing_index": f
                })

        res = self.matcher.align_sequence(exp_expanded, detected, row_num=1)
        
        # 2 correct matches, 0 violations, detected_product_id is None
        self.assertEqual(len(res["matched_products"]), 2)
        self.assertEqual(len(res["violations"]), 0)
        self.assertIsNone(res["matched_products"][0]["detected_product_id"])

    def test_sequence_alignment_violations(self):
        # 2 expected cells with 1 facing each
        expected = [
            {
                "row": 1,
                "position": 1,
                "reference_product_id": "prod-1",
                "embedding": [1.0, 0.0],
                "facing_count": 1
            },
            {
                "row": 1,
                "position": 2,
                "reference_product_id": "prod-2",
                "embedding": [0.0, 1.0],
                "facing_count": 1
            }
        ]
        
        # Detected: 1 wrong product, 1 missing
        detected = [
            {"bbox": [10, 10, 50, 50], "embedding": [0.0, 1.0]} # Matches prod-2 better than prod-1
        ]
        
        exp_expanded = []
        for cell in expected:
            for f in range(cell["facing_count"]):
                exp_expanded.append({
                    "row": cell["row"],
                    "position": cell["position"],
                    "reference_product_id": cell["reference_product_id"],
                    "embedding": cell["embedding"],
                    "facing_index": f
                })

        res = self.matcher.align_sequence(exp_expanded, detected, row_num=1)
        
        # Let's verify we get a missing or wrong product violation
        violations = res["violations"]
        self.assertGreater(len(violations), 0)
        
        violation_types = [v["violation_type"] for v in violations]
        self.assertTrue("wrong_product" in violation_types or "missing_product" in violation_types)

    def test_gap_analysis(self):
        expected_cells = [
            {
                "row": 1,
                "position": 1,
                "reference_product_id": "prod-1",
                "embedding": [1.0, 0.0],
                "facing_count": 1
            },
            {
                "row": 1,
                "position": 2,
                "reference_product_id": "prod-2",
                "embedding": [0.0, 1.0],
                "facing_count": 1
            }
        ]
        
        # Detected products with a large gap between them (100px gap, width is 500px, so 0.20 ratio > 0.05)
        detected_products = [
            {"bbox": [10.0, 10.0, 50.0, 50.0], "embedding": [1.0, 0.0]},
            {"bbox": [150.0, 10.0, 190.0, 50.0], "embedding": [0.0, 1.0]}
        ]
        
        res = self.matcher.match_planogram(expected_cells, detected_products, image_width=500.0)
        violations = res["violations"]
        
        # Should generate a gap violation
        gap_violations = [v for v in violations if v["violation_type"] == "gap_violation"]
        self.assertEqual(len(gap_violations), 1)
        self.assertIsNone(gap_violations[0]["detected_product_id"])

if __name__ == '__main__':
    unittest.main()
