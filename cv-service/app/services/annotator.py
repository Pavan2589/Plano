import logging
from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger("cv_service.annotator")
logger.setLevel(logging.INFO)

class ImageAnnotator:
    def __init__(self):
        logger.info("Initialized ImageAnnotator using Pillow.")

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
                label = f"R{v['row']} P{v['position']} Mismatch"
                draw.text((bbox[0], max(0, bbox[1] - 15)), label, fill="red", font=font)
                
            elif v["violation_type"] == "gap_violation" and v["bbox"]:
                bbox = v["bbox"]
                draw.rectangle(bbox, outline="orange", width=2)
                label = f"R{v['row']} P{v['position']} Gap"
                draw.text((bbox[0], max(0, bbox[1] - 15)), label, fill="orange", font=font)

        # 3. Draw Legend Box for Unbounded Violations (Missing / Facing)
        non_bbox_violations = [
            v for v in violations 
            if v["violation_type"] in ("missing_product", "facing_violation")
        ]
        
        if non_bbox_violations:
            legend_x = 10
            legend_y = 10
            line_height = 20
            box_width = 280
            box_height = 30 + len(non_bbox_violations) * line_height
            
            # Draw a dark semi-transparent legend background box
            draw.rectangle(
                [legend_x, legend_y, legend_x + box_width, legend_y + box_height], 
                fill=(0, 0, 0, 180),
                outline="red", 
                width=2
            )
            
            draw.text((legend_x + 10, legend_y + 5), "Planogram Violations Summary:", fill="white", font=font)
            for idx, v in enumerate(non_bbox_violations):
                v_text = f"Row {v['row']} Pos {v['position']}: {v['violation_type'].replace('_', ' ').title()}"
                draw.text((legend_x + 10, legend_y + 25 + idx * line_height), v_text, fill="red", font=font)
                
        return annotated

# Export singleton image annotator
annotator_instance = ImageAnnotator()
