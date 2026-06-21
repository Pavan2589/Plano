import unittest
import numpy as np
from PIL import Image
import sys
import os

# Add cv-service root to python path to import app modules correctly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.embedder import ProductEmbedder

class TestProductEmbedder(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize the embedder (runs model loading once)
        cls.embedder = ProductEmbedder()

    def test_embedding_generation_successful(self):
        # Create a mock 300x300 RGB image
        mock_image = Image.new('RGB', (300, 300), color='red')
        
        # Extract the embedding
        embedding = self.embedder.generate_embedding(mock_image)
        
        # Assertions
        self.assertIsInstance(embedding, np.ndarray, "Output must be a numpy ndarray")
        self.assertEqual(embedding.ndim, 1, "Output array must be 1-dimensional")
        self.assertEqual(embedding.shape[0], 2048, "Output vector size must be exactly 2048")
        
        # Verify L2 normalization: norm of L2-normalized vector should be very close to 1.0
        l2_norm = np.linalg.norm(embedding)
        self.assertAlmostEqual(l2_norm, 1.0, places=5, msg="Output vector is not L2 normalized")

    def test_non_rgb_image_handling(self):
        # Create a mock grayscale (L) image
        mock_image = Image.new('L', (200, 200), color=128)
        
        # Extract the embedding (should convert to RGB and succeed)
        embedding = self.embedder.generate_embedding(mock_image)
        
        # Assertions
        self.assertEqual(embedding.shape[0], 2048, "Grayscale image should be handled and return 2048-d vector")
        l2_norm = np.linalg.norm(embedding)
        self.assertAlmostEqual(l2_norm, 1.0, places=5)

if __name__ == '__main__':
    unittest.main()
