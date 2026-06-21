import logging
from typing import List, Dict, Any
logger = logging.getLogger("cv_service.scorer")
logger.setLevel(logging.INFO)
class ComplianceScorer:
    def calculate_scores(self, expected_cells: List[Dict[str, Any]], matched_products: List[Dict[str, Any]], violations: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Calculate compliance metrics: product_accuracy, spacing_accuracy, facing_accuracy, and overall_score.
        """
        # Count occurrences
        matched_count = len(matched_products)
        wrong_count = sum(1 for v in violations if v["violation_type"] == "wrong_product")
        missing_count = sum(1 for v in violations if v["violation_type"] == "missing_product")
        gap_count = sum(1 for v in violations if v["violation_type"] == "gap_violation")
        facing_count_v = sum(1 for v in violations if v["violation_type"] == "facing_violation")
        
        # 1. Product Accuracy
        total_slots = matched_count + wrong_count + missing_count
        product_accuracy = 100.0 if total_slots == 0 else (matched_count / total_slots) * 100.0
        
        # 2. Spacing Accuracy
        # Group matched products by row to find total adjacent pairs
        matched_by_row = {}
        for m in matched_products:
            r = m["row"]
            if r not in matched_by_row:
                matched_by_row[r] = []
            matched_by_row[r].append(m)
            
        total_gaps = 0
        for r_matches in matched_by_row.values():
            if len(r_matches) > 1:
                total_gaps += len(r_matches) - 1
                
        spacing_accuracy = 100.0 if total_gaps == 0 else max(0.0, ((total_gaps - gap_count) / total_gaps) * 100.0)
        
        # 3. Facing Accuracy
        total_cells = len(expected_cells)
        facing_accuracy = 100.0 if total_cells == 0 else max(0.0, ((total_cells - facing_count_v) / total_cells) * 100.0)
        
        # 4. Overall Score (Weighted: 50% Product, 25% Spacing, 25% Facing)
        overall_score = (0.50 * product_accuracy) + (0.25 * spacing_accuracy) + (0.25 * facing_accuracy)
        
        # Round all values to 2 decimal places
        scores = {
            "overall_score": round(overall_score, 2),
            "product_accuracy": round(product_accuracy, 2),
            "spacing_accuracy": round(spacing_accuracy, 2),
            "facing_accuracy": round(facing_accuracy, 2)
        }
        
        logger.info(f"Calculated Scores: {scores}")
        return scores
# Export singleton scorer
scorer_instance = ComplianceScorer()
