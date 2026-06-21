import unittest
import sys
import os

# Add cv-service root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.scorer import ComplianceScorer

class TestComplianceScorer(unittest.TestCase):
    def setUp(self):
        self.scorer = ComplianceScorer()

    def test_calculate_scores_perfect(self):
        # 100% compliant shelf row
        expected_cells = [
            {"row": 1, "position": 1, "reference_product_id": "prod-1", "facing_count": 1},
            {"row": 1, "position": 2, "reference_product_id": "prod-2", "facing_count": 1}
        ]
        matched_products = [
            {"row": 1, "position": 1, "expected_product_id": "prod-1", "bbox": [10.0, 10.0, 50.0, 50.0]},
            {"row": 1, "position": 2, "expected_product_id": "prod-2", "bbox": [60.0, 10.0, 100.0, 50.0]}
        ]
        violations = [] # No violations
        
        scores = self.scorer.calculate_scores(expected_cells, matched_products, violations)
        
        self.assertEqual(scores["product_accuracy"], 100.0)
        self.assertEqual(scores["spacing_accuracy"], 100.0)
        self.assertEqual(scores["facing_accuracy"], 100.0)
        self.assertEqual(scores["overall_score"], 100.0)

    def test_calculate_scores_with_violations(self):
        expected_cells = [
            {"row": 1, "position": 1, "reference_product_id": "prod-1", "facing_count": 1},
            {"row": 1, "position": 2, "reference_product_id": "prod-2", "facing_count": 1},
            {"row": 1, "position": 3, "reference_product_id": "prod-3", "facing_count": 1}
        ]
        matched_products = [
            {"row": 1, "position": 1, "expected_product_id": "prod-1", "bbox": [10.0, 10.0, 50.0, 50.0]},
            # Position 2 matches but wrong product
            # Position 3 correct matches
            {"row": 1, "position": 3, "expected_product_id": "prod-3", "bbox": [180.0, 10.0, 220.0, 50.0]}
        ]
        
        violations = [
            # Wrong product at position 2
            {"row": 1, "position": 2, "violation_type": "wrong_product", "expected_product_id": "prod-2", "bbox": [60.0, 10.0, 100.0, 50.0]},
            # Gap violation between position 1 and 3 (missing position 2)
            {"row": 1, "position": 1, "violation_type": "gap_violation", "expected_product_id": "prod-1", "bbox": [50.0, 10.0, 180.0, 50.0]},
            # Facing violation for position 2 (correct matches: 0 < expected: 1)
            {"row": 1, "position": 2, "violation_type": "facing_violation", "expected_product_id": "prod-2", "bbox": None}
        ]
        
        scores = self.scorer.calculate_scores(expected_cells, matched_products, violations)
        
        # Product Accuracy: matched_count (2) / total_slots (2 matched + 1 wrong + 0 missing) = 2/3 = 66.67%
        self.assertAlmostEqual(scores["product_accuracy"], 66.67, places=2)
        
        # Spacing Accuracy: total adjacent pairs = 1 (position 1 & 3 correct matches), 1 gap violation -> (1 - 1)/1 = 0%
        self.assertEqual(scores["spacing_accuracy"], 0.0)
        
        # Facing Accuracy: total_cells (3), 1 facing_violation -> (3 - 1)/3 = 66.67%
        self.assertAlmostEqual(scores["facing_accuracy"], 66.67, places=2)
        
        # Overall Score: 50% * 66.67 + 25% * 0.0 + 25% * 66.67 = 33.33 + 0 + 16.67 = 50.00%
        self.assertAlmostEqual(scores["overall_score"], 50.00, places=2)

if __name__ == '__main__':
    unittest.main()
