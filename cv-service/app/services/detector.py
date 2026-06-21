import os
import time
import logging
from PIL import Image
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
        self.model_path = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")
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
                    "confidence": round(conf, 4)
                })
        
        elapsed = time.time() - start_time
        logger.info(f"YOLOv8 inference completed: found {len(detections)} products in {elapsed:.4f} seconds.")
        return detections

# Instantiate singleton detector
detector_instance = ProductDetector()
