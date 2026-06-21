import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from PIL import Image
import io
import sys
import os

# Add cv-service root to python path to import app modules correctly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app

class TestComplianceAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    @patch('requests.get')
    @patch('app.routers.compliance.detector_instance')
    @patch('app.routers.compliance.embedder_instance')
    @patch('app.routers.compliance.db_queries')
    @patch('app.routers.compliance.upload_to_minio')
    def test_compliance_endpoint_success(self, mock_upload, mock_db, mock_embedder, mock_detector, mock_get):
        # 1. Create dummy image bytes
        img = Image.new('RGB', (100, 100), color='green')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_bytes = img_byte_arr.getvalue()
        
        # Mock requests.get response
        mock_get.return_value.status_code = 200
        mock_get.return_value.content = img_bytes
        
        # Mock YOLOv8 detection
        mock_detector.detect.return_value = [
            {"bbox": [10.0, 20.0, 80.0, 90.0], "confidence": 0.88}
        ]
        
        # Mock ResNet50 embedding extraction
        mock_embedder.generate_embedding.return_value = MagicMock(
            tolist=lambda: [1.0 if idx == 0 else 0.0 for idx in range(2048)]
        )
        
        # Mock database cells (returns 1 expected cell)
        mock_db.fetch_planogram_cells.return_value = [
            {
                "row": 1,
                "position": 1,
                "reference_product_id": "prod-uuid-1",
                "facing_count": 1,
                "embedding": [1.0 if idx == 0 else 0.0 for idx in range(2048)]
            }
        ]
        
        # Mock upload
        mock_upload.return_value = "http://localhost:9000/annotated-results/annotated_dummy.jpg"
        
        # 2. Call endpoint
        response = self.client.post("/process/compliance", json={
            "jobId": "00000000-0000-0000-0000-000000000000",
            "shelfImagePath": "shelf_photo.jpg",
            "planogramId": "00000000-0000-0000-0000-000000000000",
            "sectionId": "00000000-0000-0000-0000-000000000000",
            "storeId": "00000000-0000-0000-0000-000000000000"
        })
        
        # 3. Assertions
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "complete")
        self.assertIn("matched_products", data)
        self.assertIn("violations", data)
        self.assertIn("overall_score", data)
        self.assertIn("product_accuracy", data)
        self.assertIn("spacing_accuracy", data)
        self.assertIn("facing_accuracy", data)
        self.assertEqual(data["annotated_image_url"], "http://localhost:9000/annotated-results/annotated_dummy.jpg")
        
        # Since the mock embeddings match exactly, there should be 1 match and 0 violations
        self.assertEqual(len(data["matched_products"]), 1)
        self.assertEqual(data["matched_products"][0]["expected_product_id"], "prod-uuid-1")
        self.assertEqual(len(data["violations"]), 0)
        self.assertEqual(data["overall_score"], 100.0)

    @patch('requests.get')
    def test_compliance_endpoint_image_not_found(self, mock_get):
        # Mock requests.get to return a 404
        mock_get.return_value.status_code = 404
        
        response = self.client.post("/process/compliance", json={
            "jobId": "00000000-0000-0000-0000-000000000000",
            "shelfImagePath": "nonexistent.jpg",
            "planogramId": "00000000-0000-0000-0000-000000000000",
            "sectionId": "00000000-0000-0000-0000-000000000000",
            "storeId": "00000000-0000-0000-0000-000000000000"
        })
        
        self.assertEqual(response.status_code, 404)
        self.assertIn("detail", response.json())

if __name__ == '__main__':
    unittest.main()
