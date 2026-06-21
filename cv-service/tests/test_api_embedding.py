import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from PIL import Image
import io
import sys
import os

# Add cv-service root to python path to import app modules correctly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app

class TestEmbeddingAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    @patch('requests.get')
    def test_embedding_endpoint_success(self, mock_get):
        # 1. Create a dummy image in bytes
        img = Image.new('RGB', (100, 100), color='blue')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_bytes = img_byte_arr.getvalue()
        
        # Mock requests.get response to return success with image bytes
        mock_get.return_value.status_code = 200
        mock_get.return_value.content = img_bytes
        
        # 2. Call the endpoint
        response = self.client.post("/process/embedding", json={
            "referenceProductId": "00000000-0000-0000-0000-000000000000",
            "imagePath": "test_image.jpg"
        })
        
        # 3. Assertions
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "complete")
        self.assertIn("embedding", data)
        self.assertEqual(len(data["embedding"]), 2048)
        
    @patch('requests.get')
    def test_embedding_endpoint_image_not_found(self, mock_get):
        # Mock requests.get to return a 404
        mock_get.return_value.status_code = 404
        
        response = self.client.post("/process/embedding", json={
            "referenceProductId": "00000000-0000-0000-0000-000000000000",
            "imagePath": "nonexistent.jpg"
        })
        
        self.assertEqual(response.status_code, 404)
        self.assertIn("detail", response.json())

if __name__ == '__main__':
    unittest.main()
