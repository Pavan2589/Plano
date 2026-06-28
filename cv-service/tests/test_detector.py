import unittest
from unittest.mock import MagicMock, patch
import numpy as np
from PIL import Image
import sys
import os

# Add cv-service root to python path to import app modules correctly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.detector import ProductDetector

class TestProductDetector(unittest.TestCase):
    @patch('app.services.detector.YOLO')
    def test_detector_initialization(self, mock_yolo):
        # Verify YOLO model gets loaded with config path
        detector = ProductDetector()
        mock_yolo.assert_called_once_with("yolov8n.pt")

    @patch('app.services.detector.YOLO')
    def test_bbox_and_confidence_validation(self, mock_yolo):
        # 1. Setup mock YOLO instance and return structures
        detector = ProductDetector()
        
        mock_box_valid = MagicMock()
        mock_box_valid.xyxy = [np.array([10.0, 20.0, 150.0, 250.0])]
        mock_box_valid.conf = [MagicMock(item=lambda: 0.95)]
        
        # Coordinate Flipped Box (x1 > x2) -> should be filtered
        mock_box_flipped_coords = MagicMock()
        mock_box_flipped_coords.xyxy = [np.array([150.0, 250.0, 10.0, 20.0])]
        mock_box_flipped_coords.conf = [MagicMock(item=lambda: 0.90)]

        # Negative Coordinate Box -> should be filtered
        mock_box_negative = MagicMock()
        mock_box_negative.xyxy = [np.array([-10.0, 20.0, 150.0, 250.0])]
        mock_box_negative.conf = [MagicMock(item=lambda: 0.85)]

        # Out of bounds confidence (> 1.0) -> should be filtered
        mock_box_invalid_conf = MagicMock()
        mock_box_invalid_conf.xyxy = [np.array([15.0, 25.0, 160.0, 260.0])]
        mock_box_invalid_conf.conf = [MagicMock(item=lambda: 1.25)]

        mock_result = MagicMock()
        mock_result.boxes = [
            mock_box_valid,
            mock_box_flipped_coords,
            mock_box_negative,
            mock_box_invalid_conf
        ]
        
        detector.model.return_value = [mock_result]

        # 2. Perform detection
        mock_image = Image.new('RGB', (500, 500), color='white')
        detections = detector.detect(mock_image)

        # 3. Assertions
        # Only the valid box should have passed filters
        self.assertEqual(len(detections), 1, "Only one valid box should be returned")
        
        valid_det = detections[0]
        self.assertEqual(valid_det["bbox"], [10.0, 20.0, 150.0, 250.0])
        self.assertEqual(valid_det["confidence"], 0.95)

if __name__ == '__main__':
    unittest.main()
