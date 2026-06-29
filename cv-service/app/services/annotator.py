import logging
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger("cv_service.annotator")
logger.setLevel(logging.INFO)

class ImageAnnotator:
    def __init__(self):
        logger.info("Initialized ImageAnnotator using Pillow.")

    def _draw_multiline_label(self, draw, xy, lines, fill, font):
        x, y = xy
        line_height = 14
        for idx, line in enumerate(lines):
            draw.text((x, y + idx * line_height), line, fill=fill, font=font)

    def _violation_lines(self, violation: dict) -> list:
        title = violation.get("display_title") or violation["violation_type"].replace("_", " ").title()
        lines = [f"R{violation['row']} P{violation['position']} {title}"]
        for detail in violation.get("display_details") or []:
            lines.append(detail)
        return lines

    def save_embedding_matches_debug(self, image: Image.Image, detections: list, job_id: str) -> str:
        debug_dir = Path("debug")
        debug_dir.mkdir(parents=True, exist_ok=True)
        output_path = debug_dir / f"embedding_matches_{job_id}.jpg"

        annotated = image.copy()
        draw = ImageDraw.Draw(annotated)
        try:
            font = ImageFont.load_default()
        except Exception as e:
            logger.warning(f"Failed to load default font for embedding debug image: {str(e)}")
            font = None

        for det in detections:
            bbox = det["bbox"]
            top_matches = det.get("embedding_top_matches") or []
            best_match = top_matches[0] if top_matches else None

            if best_match:
                label = f"{best_match['name']} {best_match['similarity']:.2f}"
            else:
                label = "No reference match"

            draw.rectangle(bbox, outline="cyan", width=3)
            draw.text((bbox[0], max(0, bbox[1] - 14)), label, fill="cyan", font=font)

        annotated.save(output_path, format="JPEG")
        logger.info(f"Saved embedding matches to {output_path}")
        print(f"Saved embedding matches to {output_path}")
        return str(output_path)

    def annotate(self, image: Image.Image, matched_products: list, violations: list) -> Image.Image:
        logger.info(f"Annotating image: drawing {len(matched_products)} matches and {len(violations)} violations.")
        
        # Create a copy of the image to avoid mutating the original
        annotated = image.copy()
        draw = ImageDraw.Draw(annotated)
        
        # Load default system font
        try:
            font = ImageFont.load_default()
        except Exception as e:
            logger.warning(f"Failed to load default font, text rendering might use basic fallbacks: {str(e)}")
            font = None
            
        # 1. Draw Correct Matches (Green)
        for p in matched_products:
            bbox = p["bbox"]  # [x1, y1, x2, y2]
            draw.rectangle(bbox, outline="green", width=4)
            label = f"R{p['row']} P{p['position']}"
            draw.text((bbox[0], max(0, bbox[1] - 15)), label, fill="green", font=font)
            
        # 2. Draw Bounded Violations (Red / Orange)
        for v in violations:
            if v["violation_type"] == "wrong_product" and v["bbox"]:
                bbox = v["bbox"]
                draw.rectangle(bbox, outline="red", width=4)
                self._draw_multiline_label(
                    draw,
                    (bbox[0], max(0, bbox[1] - 45)),
                    self._violation_lines(v),
                    "red",
                    font
                )
                
            elif v["violation_type"] == "gap_violation" and v["bbox"]:
                bbox = v["bbox"]
                draw.rectangle(bbox, outline="orange", width=2)
                self._draw_multiline_label(
                    draw,
                    (bbox[0], max(0, bbox[1] - 35)),
                    self._violation_lines(v),
                    "orange",
                    font
                )

        # 3. Draw Legend Box for Unbounded Violations (Missing / Facing)
        non_bbox_violations = [
            v for v in violations 
            if v["violation_type"] in ("missing_product", "facing_violation")
        ]
        
        if non_bbox_violations:
            legend_x = 10
            legend_y = 10
            line_height = 16
            legend_lines = []
            for v in non_bbox_violations:
                legend_lines.extend(self._violation_lines(v))
                legend_lines.append("")
            box_width = 360
            box_height = 30 + len(legend_lines) * line_height
            
            # Draw a dark semi-transparent legend background box
            draw.rectangle(
                [legend_x, legend_y, legend_x + box_width, legend_y + box_height], 
                fill=(0, 0, 0, 180),
                outline="red", 
                width=2
            )
            
            draw.text((legend_x + 10, legend_y + 5), "Planogram Violations Summary:", fill="white", font=font)
            for idx, line in enumerate(legend_lines):
                draw.text((legend_x + 10, legend_y + 25 + idx * line_height), line, fill="red", font=font)
                
        return annotated

# Export singleton image annotator
annotator_instance = ImageAnnotator()
