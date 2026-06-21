import os
import requests
import io
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from PIL import Image
from app.services.embedder import embedder_instance

# Configure logger
logger = logging.getLogger("cv_service.router.embedding")
logger.setLevel(logging.INFO)

router = APIRouter()

class EmbeddingRequest(BaseModel):
    referenceProductId: str
    imagePath: str

class EmbeddingResponse(BaseModel):
    status: str
    message: str
    embedding: Optional[List[float]] = None

@router.post("/embedding", response_model=EmbeddingResponse)
async def process_embedding(payload: EmbeddingRequest):
    logger.info(f"Received embedding extraction request for referenceProductId: {payload.referenceProductId}, imagePath: {payload.imagePath}")
    
    # 1. Resolve MinIO endpoint and construct internal HTTP GET URL
    minio_endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    # Remove protocol if included in env var
    minio_endpoint = minio_endpoint.replace("http://", "").replace("https://", "")
    
    url = f"http://{minio_endpoint}/reference-products/{payload.imagePath}"
    logger.info(f"Downloading image from: {url}")
    
    # 2. Fetch the image from MinIO
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            logger.error(f"MinIO returned status code {response.status_code} for image {payload.imagePath}")
            raise HTTPException(
                status_code=404,
                detail=f"Image '{payload.imagePath}' not found in MinIO reference-products bucket (HTTP {response.status_code})"
            )
    except requests.RequestException as e:
        logger.error(f"Failed to connect to MinIO at {url}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect to MinIO object storage: {str(e)}"
        )

    # 3. Read image bytes into Pillow
    try:
        image = Image.open(io.BytesIO(response.content))
    except Exception as e:
        logger.error(f"Failed to open downloaded bytes as PIL Image: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Downloaded file is not a valid image format: {str(e)}"
        )

    # 4. Generate 2048-dimensional embedding vector
    try:
        embedding_vector = embedder_instance.generate_embedding(image)
        # Convert numpy array to standard python list of floats
        embedding_list = [float(val) for val in embedding_vector]
    except Exception as e:
        logger.error(f"Error during ResNet50 embedding extraction: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Embedding extraction failed: {str(e)}"
        )

    logger.info(f"Successfully extracted embedding vector for {payload.referenceProductId} (length: {len(embedding_list)})")
    
    return EmbeddingResponse(
        status="complete",
        message=f"Embedding generated for reference product {payload.referenceProductId}",
        embedding=embedding_list
    )
