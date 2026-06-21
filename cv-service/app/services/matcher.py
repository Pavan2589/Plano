import os
import logging
import numpy as np
from typing import List, Dict, Any
logger = logging.getLogger("cv_service.matcher")
logger.setLevel(logging.INFO)
class CosineMatcher:
    def __init__(self):
        # Configure thresholds from environment variables
        self.similarity_threshold = float(os.getenv("SIMILARITY_THRESHOLD", "0.75"))
        self.row_tolerance = float(os.getenv("ROW_TOLERANCE", "50.0"))
        self.gap_threshold = float(os.getenv("GAP_THRESHOLD", "0.05"))
        logger.info(f"Initialized CosineMatcher: similarity_threshold={self.similarity_threshold}, row_tolerance={self.row_tolerance}, gap_threshold={self.gap_threshold}")
    def calculate_similarity(self, embedding_a: List[float], embedding_b: List[float]) -> float:
        if not embedding_a or not embedding_b:
            return 0.0
        
        a = np.array(embedding_a, dtype=np.float32)
        b = np.array(embedding_b, dtype=np.float32)
        
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
            
        return float(np.dot(a, b) / (norm_a * norm_b))
    def cluster_rows(self, detections: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
        """
        Group detections into rows based on center Y coordinates.
        Sort rows from top to bottom, and products within each row from left to right.
        """
        if not detections:
            return []
        # Calculate center coordinates for each detection
        for d in detections:
            x1, y1, x2, y2 = d["bbox"]
            d["cy"] = (y1 + y2) / 2.0
            d["cx"] = (x1 + x2) / 2.0
        # Sort detections by center Y coordinate (top-to-bottom)
        sorted_dets = sorted(detections, key=lambda x: x["cy"])
        
        rows = []
        for det in sorted_dets:
            placed = False
            for r in rows:
                avg_y = sum(d["cy"] for d in r) / len(r)
                if abs(det["cy"] - avg_y) <= self.row_tolerance:
                    r.append(det)
                    placed = True
                    break
            
            if not placed:
                rows.append([det])
        # Sort rows top-to-bottom
        rows = sorted(rows, key=lambda r: sum(d["cy"] for d in r) / len(r))
        
        # Sort items within each row left-to-right (cx ascending)
        for i in range(len(rows)):
            rows[i] = sorted(rows[i], key=lambda x: x["cx"])
            
        logger.info(f"Clustered {len(detections)} detections into {len(rows)} rows.")
        return rows
    def align_sequence(self, expected_expanded: List[Dict[str, Any]], detected: List[Dict[str, Any]], row_num: int) -> Dict[str, List[Dict[str, Any]]]:
        """
        Align detected products in a row against expanded expected planogram cells using Needleman-Wunsch sequence alignment.
        """
        N = len(expected_expanded)
        M = len(detected)
        
        # Scoring settings
        gap_penalty = -0.5
        
        def get_match_score(e, d):
            sim = self.calculate_similarity(e["embedding"], d["embedding"])
            if sim >= self.similarity_threshold:
                return 2.0 * sim
            else:
                return sim - 1.0 # mismatch penalty
        
        # Initialize DP Table
        dp = np.zeros((N + 1, M + 1), dtype=np.float32)
        for i in range(1, N + 1):
            dp[i, 0] = dp[i - 1, 0] + gap_penalty
        for j in range(1, M + 1):
            dp[0, j] = dp[0, j - 1] + gap_penalty
            
        # Fill DP Table
        for i in range(1, N + 1):
            for j in range(1, M + 1):
                score_diag = dp[i - 1, j - 1] + get_match_score(expected_expanded[i - 1], detected[j - 1])
                score_up = dp[i - 1, j] + gap_penalty
                score_left = dp[i, j - 1] + gap_penalty
                dp[i, j] = max(score_diag, score_up, score_left)
                
        # Backtrack to find alignment
        i, j = N, M
        aligned_pairs = []
        while i > 0 or j > 0:
            if i > 0 and j > 0:
                score_diag = dp[i - 1, j - 1] + get_match_score(expected_expanded[i - 1], detected[j - 1])
                score_up = dp[i - 1, j] + gap_penalty
                score_left = dp[i, j - 1] + gap_penalty
                
                max_score = max(score_diag, score_up, score_left)
                if abs(max_score - score_diag) < 1e-6:
                    aligned_pairs.append(('match', i - 1, j - 1))
                    i -= 1
                    j -= 1
                elif abs(max_score - score_up) < 1e-6:
                    aligned_pairs.append(('missing', i - 1, None))
                    i -= 1
                else:
                    aligned_pairs.append(('extra', None, j - 1))
                    j -= 1
            elif i > 0:
                aligned_pairs.append(('missing', i - 1, None))
                i -= 1
            else:
                aligned_pairs.append(('extra', None, j - 1))
                j -= 1
                
        aligned_pairs.reverse()
        
        # Group alignment results by original expected cell position
        cell_alignments = {}
        for action, e_idx, d_idx in aligned_pairs:
            if action in ('match', 'missing'):
                e = expected_expanded[e_idx]
                cell_key = (row_num, e["position"])
                if cell_key not in cell_alignments:
                    cell_alignments[cell_key] = []
                cell_alignments[cell_key].append((action, e, d_idx))
        matched_products = []
        violations = []
        for cell_key, alignments in cell_alignments.items():
            row_no, pos_no = cell_key
            
            matches_list = []
            wrong_list = []
            
            for action, e, d_idx in alignments:
                if action == 'match':
                    d = detected[d_idx]
                    sim = self.calculate_similarity(e["embedding"], d["embedding"])
                    if sim >= self.similarity_threshold:
                        matches_list.append((e, d, sim))
                    else:
                        wrong_list.append((e, d, sim))
            
            total_expected = len(alignments) # facing_count for this product cell
            correct_count = len(matches_list)
            wrong_count = len(wrong_list)
            # 1. Add correct matches to matched list (detected_product_id is None per requirements)
            for e, d, sim in matches_list:
                matched_products.append({
                    "row": row_no,
                    "position": pos_no,
                    "expected_product_id": e["reference_product_id"],
                    "detected_product_id": None,
                    "bbox": d["bbox"],
                    "similarity": round(sim, 4)
                })
            # 2. Determine violations
            # Check if there are any wrong products:
            if wrong_count > 0:
                for e, d, sim in wrong_list:
                    violations.append({
                        "row": row_no,
                        "position": pos_no,
                        "violation_type": "wrong_product",
                        "expected_product_id": e["reference_product_id"],
                        "detected_product_id": None,
                        "bbox": d["bbox"]
                    })
            # Check if correct_count is less than the expected facing count:
            if correct_count < total_expected:
                if correct_count == 0 and wrong_count == 0:
                    # No detections matched this slot at all
                    violations.append({
                        "row": row_no,
                        "position": pos_no,
                        "violation_type": "missing_product",
                        "expected_product_id": alignments[0][1]["reference_product_id"],
                        "detected_product_id": None,
                        "bbox": None
                    })
                else:
                    # Either correct matches exist but are fewer than required, OR wrong products exist.
                    # This qualifies as a facing count violation.
                    violations.append({
                        "row": row_no,
                        "position": pos_no,
                        "violation_type": "facing_violation",
                        "expected_product_id": alignments[0][1]["reference_product_id"],
                        "detected_product_id": None,
                        "bbox": None
                    })
                    
        return {
            "matched_products": matched_products,
            "violations": violations
        }
    def match_planogram(self, expected_cells: List[Dict[str, Any]], detected_products: List[Dict[str, Any]], image_width: float = 1.0) -> Dict[str, Any]:
        """
        Group expected cells and detected products by row, align them, and run gap analysis.
        """
        # Group expected cells by row
        expected_rows = {}
        for cell in expected_cells:
            r = cell["row"]
            if r not in expected_rows:
                expected_rows[r] = []
            expected_rows[r].append(cell)
            
        # Ensure expected cells are sorted left-to-right by position
        for r in expected_rows:
            expected_rows[r] = sorted(expected_rows[r], key=lambda x: x["position"])
        # Group detected products by row
        detected_rows = self.cluster_rows(detected_products)
        
        matched_products = []
        violations = []
        
        # We align row-by-row
        all_row_numbers = set(expected_rows.keys())
        for idx in range(len(detected_rows)):
            all_row_numbers.add(idx + 1)
            
        for row_num in sorted(all_row_numbers):
            exp_list = expected_rows.get(row_num, [])
            det_list = detected_rows[row_num - 1] if row_num - 1 < len(detected_rows) else []
            
            if exp_list and det_list:
                # Expand expected cells by facing_count before aligning
                exp_expanded = []
                for cell in exp_list:
                    for f in range(cell["facing_count"]):
                        exp_expanded.append({
                            "row": cell["row"],
                            "position": cell["position"],
                            "reference_product_id": cell["reference_product_id"],
                            "embedding": cell["embedding"],
                            "facing_index": f
                        })
                
                align_res = self.align_sequence(exp_expanded, det_list, row_num)
                matched_products.extend(align_res["matched_products"])
                violations.extend(align_res["violations"])
            elif exp_list:
                # All expected products are missing in this row
                for e in exp_list:
                    violations.append({
                        "row": row_num,
                        "position": e["position"],
                        "violation_type": "missing_product",
                        "expected_product_id": e["reference_product_id"],
                        "detected_product_id": None,
                        "bbox": None
                    })
            # Extra detections are ignored in 6C & 6D
        # 3. Horizontal Gap Analysis (spacing accuracy)
        # Group correct matched products by row
        matched_by_row = {}
        for m in matched_products:
            r = m["row"]
            if r not in matched_by_row:
                matched_by_row[r] = []
            matched_by_row[r].append(m)
        for r_num, row_matches in matched_by_row.items():
            # Sort left-to-right by x1 (bbox[0])
            sorted_matches = sorted(row_matches, key=lambda x: x["bbox"][0])
            
            for k in range(len(sorted_matches) - 1):
                curr_p = sorted_matches[k]
                next_p = sorted_matches[k + 1]
                
                # gap = left_edge(next) - right_edge(current)
                gap = next_p["bbox"][0] - curr_p["bbox"][2]
                normalized_gap = gap / image_width
                
                if normalized_gap > self.gap_threshold:
                    gap_bbox = [
                        curr_p["bbox"][2],
                        min(curr_p["bbox"][1], next_p["bbox"][1]),
                        next_p["bbox"][0],
                        max(curr_p["bbox"][3], next_p["bbox"][3])
                    ]
                    violations.append({
                        "row": r_num,
                        "position": curr_p["position"],
                        "violation_type": "gap_violation",
                        "expected_product_id": curr_p["expected_product_id"],
                        "detected_product_id": None,
                        "expected_gap": self.gap_threshold,
                        "detected_gap": round(normalized_gap, 4),
                        "bbox": [round(x, 2) for x in gap_bbox]
                    })
            
        return {
            "matched_products": matched_products,
            "violations": violations
        }
# Singleton instance
matcher_instance = CosineMatcher()
