import time
import logging
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import numpy as np

# Configure logger
logger = logging.getLogger("cv_service.embedder")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

class ProductEmbedder:
    def __init__(self):
        logger.info("Initializing ResNet50 ProductEmbedder (classification head will be removed)...")
        start_time = time.time()
        
        # Load torchvision ResNet50 model once during startup
        try:
            weights = models.ResNet50_Weights.DEFAULT
            self.model = models.resnet50(weights=weights)
            logger.info("Loaded ResNet50 with ResNet50_Weights.DEFAULT")
        except AttributeError:
            self.model = models.resnet50(pretrained=True)
            logger.info("Loaded ResNet50 with pretrained=True (fallback)")
        
        # Remove the classification head by swapping with Identity
        self.model.fc = torch.nn.Identity()
        
        # Set model to evaluation mode
        self.model.eval()
        
        # Transformations: Resize to 224x224 and normalize using ImageNet constants
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        elapsed = time.time() - start_time
        logger.info(f"ResNet50 ProductEmbedder initialized successfully in {elapsed:.3f} seconds.")

    def generate_embedding(self, image: Image.Image) -> np.ndarray:
        start_time = time.time()
        
        # 1. Convert image to RGB format
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        # 2. Preprocess with transformations
        tensor = self.transform(image).unsqueeze(0) # Shape: (1, 3, 224, 224)
        
        # 3. Model inference (extract feature vector)
        with torch.no_grad():
            features = self.model(tensor)
            features = features.squeeze(0) # Shape: (2048,)
            
            # 4. L2 Normalize the embedding vector
            norm = torch.norm(features, p=2, keepdim=True)
            normalized_features = features / (norm + 1e-12)
            
            embedding = normalized_features.cpu().numpy()
            
        # 5. Validation check: verify length = 2048
        if embedding.shape[0] != 2048:
            raise ValueError(f"Extracted embedding dimension is {embedding.shape[0]}, expected 2048.")
            
        elapsed = time.time() - start_time
        logger.info(f"Generated and L2-normalized 2048-d embedding in {elapsed:.4f} seconds.")
        
        return embedding

# Instantiate the singleton instance to load the model exactly once during import / app startup
embedder_instance = ProductEmbedder()
