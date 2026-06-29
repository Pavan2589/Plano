import os
import time
import logging
from pathlib import Path
from PIL import Image
from PIL import ImageDraw, ImageFont
from typing import List, Dict, Any
from ultralytics import YOLO

# Configure logger
logger = logging.getLogger("cv_service.detector")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

class ProductDetector:
    def __init__(self):
        # Configurable model path and confidence threshold
        self.model_path = os.getenv("YOLO_MODEL_PATH", "best.pt")
        self.confidence = float(os.getenv("YOLO_CONFIDENCE", "0.25"))
        
        logger.info(f"Loading YOLOv8 model from {self.model_path} once during startup...")
        start_time = time.time()
        
        # Load YOLOv8 model instance
        self.model = YOLO(self.model_path)
        
        elapsed = time.time() - start_time
        logger.info(f"YOLOv8 model loaded successfully in {elapsed:.3f} seconds.")

    def detect(self, image: Image.Image) -> List[Dict[str, Any]]:
        start_time = time.time()
        
        # Run inference using the confidence threshold
        results = self.model(image, conf=self.confidence)
        
        detections = []
        if len(results) > 0:
            for box in results[0].boxes:
                # Extract coordinates and confidence score
                xyxy = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                conf = float(box.conf[0].item())
                class_id = int(box.cls[0].item()) if getattr(box, "cls", None) is not None else None
                class_name = None
                if class_id is not None:
                    if isinstance(self.model.names, dict):
                        class_name = self.model.names.get(class_id, str(class_id))
                    elif isinstance(self.model.names, (list, tuple)) and class_id < len(self.model.names):
                        class_name = self.model.names[class_id]
                    else:
                        class_name = str(class_id)
                
                x1, y1, x2, y2 = xyxy
                
                # Coordinate Validation: x1 <= x2, y1 <= y2, values non-negative
                if x1 < 0 or y1 < 0 or x2 < x1 or y2 < y1:
                    logger.warning(f"Invalid bounding box coordinate detected and skipped: [{x1}, {y1}, {x2}, {y2}]")
                    continue
                    
                # Confidence Validation: conf is between [0.0, 1.0]
                if not (0.0 <= conf <= 1.0):
                    logger.warning(f"Invalid confidence score detected and skipped: {conf}")
                    continue
                
                detections.append({
                    "bbox": [round(float(x1), 2), round(float(y1), 2), round(float(x2), 2), round(float(y2), 2)],
                    "confidence": round(conf, 4),
                    "class_id": class_id,
                    "class_name": class_name
                })
        
        elapsed = time.time() - start_time
        logger.info(f"YOLOv8 inference completed: found {len(detections)} products in {elapsed:.4f} seconds.")
        return detections

    def save_debug_detections(self, image: Image.Image, detections: List[Dict[str, Any]], job_id: str = None) -> str:
        debug_dir = Path("debug")
        debug_dir.mkdir(parents=True, exist_ok=True)

        filename = f"yolo_{job_id}.jpg" if job_id else f"yolo_detections_{int(time.time())}.jpg"
        output_path = debug_dir / filename

        annotated = image.copy()
        draw = ImageDraw.Draw(annotated)
        try:
            font = ImageFont.load_default()
        except Exception as e:
            logger.warning(f"Failed to load default font for YOLO debug image: {str(e)}")
            font = None

        for idx, det in enumerate(detections, start=1):
            bbox = det["bbox"]
            class_name = det.get("class_name") or "unknown"
            confidence = det.get("confidence")

            print(f"Detection {idx}")
            print(f"Class: {class_name}")
            print(f"Confidence: {confidence}")
            print(f"BBox: {bbox}")
            print("")

            label = f"{class_name} {confidence:.2f}" if isinstance(confidence, (int, float)) else class_name
            draw.rectangle(bbox, outline="yellow", width=3)
            draw.text((bbox[0], max(0, bbox[1] - 14)), label, fill="yellow", font=font)

        annotated.save(output_path, format="JPEG")
        logger.info(f"Saved YOLO detections to {output_path}")
        print(f"Saved YOLO detections to {output_path}")
        return str(output_path)

# Instantiate singleton detector
detector_instance = ProductDetector()
