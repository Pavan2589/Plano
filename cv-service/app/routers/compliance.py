import os
import requests
import io
import time
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from PIL import Image

from app.services.detector import detector_instance
from app.services.embedder import embedder_instance
from app.services.matcher import matcher_instance
from app.services.scorer import scorer_instance
from app.services.annotator import annotator_instance
from app.services.minio_client import upload_to_minio
from app.db.queries import db_queries

# Configure logger
logger = logging.getLogger("cv_service.router.compliance")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

router = APIRouter()

class ComplianceRequest(BaseModel):
    jobId: str
    shelfImagePath: str
    planogramId: str
    sectionId: str
    storeId: str

class ViolationItem(BaseModel):
    row: int
    position: int
    violation_type: str
    expected_product_id: Optional[str] = None
    detected_product_id: Optional[str] = None
    bbox: Optional[List[float]] = None
    expected_gap: Optional[float] = None
    detected_gap: Optional[float] = None

class MatchedProductItem(BaseModel):
    row: int
    position: int
    expected_product_id: str
    detected_product_id: Optional[str] = None
    bbox: List[float]
    similarity: float

class ComplianceResponse(BaseModel):
    status: str
    overall_score: float
    product_accuracy: float
    spacing_accuracy: float
    facing_accuracy: float
    annotated_image_url: str
    violations: List[ViolationItem]
    matched_products: List[MatchedProductItem]

@router.post("/compliance", response_model=ComplianceResponse)
async def process_compliance(payload: ComplianceRequest):
    logger.info(f"Starting compliance processing for Job ID: {payload.jobId}")
    start_total_time = time.time()

    # 1. Resolve MinIO Endpoint and construct download URL
    minio_endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    minio_endpoint = minio_endpoint.replace("http://", "").replace("https://", "")
    url = f"http://{minio_endpoint}/shelf-images/{payload.shelfImagePath}"
    
    logger.info(f"Downloading shelf image from MinIO URL: {url}")
    try:
        response = requests.get(url, timeout=15)
        if response.status_code != 200:
            logger.error(f"Failed to fetch shelf image from MinIO (HTTP {response.status_code})")
            raise HTTPException(
                status_code=404,
                detail=f"Shelf image '{payload.shelfImagePath}' not found in MinIO bucket (HTTP {response.status_code})"
            )
    except requests.RequestException as e:
        logger.error(f"Failed to connect to MinIO at {url}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect to MinIO object storage: {str(e)}"
        )

    # 2. Read image using Pillow
    try:
        image = Image.open(io.BytesIO(response.content))
        image_width, image_height = image.size
        logger.info(f"Successfully loaded image. Size: {image_width}x{image_height}")
    except Exception as e:
        logger.error(f"Invalid image content: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Downloaded file is not a valid image format: {str(e)}"
        )

    # 3. Step 1 & 2: YOLOv8 Detection
    try:
        detections = detector_instance.detect(image)
    except Exception as e:
        logger.error(f"YOLOv8 inference failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Object detection failed: {str(e)}"
        )

    # 4. Step 3 & 4: Crop each bbox and extract ResNet50 Embedding
    logger.info(f"Extracting Crops and generating ResNet50 embeddings for {len(detections)} detections...")
    start_embed_time = time.time()
    
    for idx, det in enumerate(detections):
        x1, y1, x2, y2 = det["bbox"]
        
        # Crop the product bbox
        try:
            crop_box = (int(x1), int(y1), int(x2), int(y2))
            crop_img = image.crop(crop_box)
            
            # Generate 2048-d embedding
            embedding = embedder_instance.generate_embedding(crop_img)
            det["embedding"] = embedding.tolist()
        except Exception as e:
            logger.error(f"Failed to process crop/embedding for detection {idx}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Crop/Embedding processing failed: {str(e)}"
            )
            
    elapsed_embed = time.time() - start_embed_time
    logger.info(f"Generated embeddings for {len(detections)} products in {elapsed_embed:.3f} seconds.")

    # 5. Fetch active planogram cells from DB
    try:
        expected_cells = db_queries.fetch_planogram_cells(payload.planogramId)
    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database query failed while fetching planogram cells: {str(e)}"
        )

    if not expected_cells:
        logger.warning(f"No expected cells configured for Planogram ID: {payload.planogramId}")
        raise HTTPException(
            status_code=404,
            detail=f"No planogram cells configured in database for planogramId: {payload.planogramId}"
        )

    # 6. Step 5 to 7: Sequence Matching & Positional Alignment
    try:
        match_results = matcher_instance.match_planogram(
            expected_cells=expected_cells,
            detected_products=detections,
            image_width=float(image_width)
        )
    except Exception as e:
        logger.error(f"Planogram alignment failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Planogram sequence alignment failed: {str(e)}"
        )

    matched_products = match_results["matched_products"]
    violations = match_results["violations"]

    # 7. Step 8: Compliance Scoring
    try:
        scores = scorer_instance.calculate_scores(
            expected_cells=expected_cells,
            matched_products=matched_products,
            violations=violations
        )
    except Exception as e:
        logger.error(f"Scoring calculations failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Compliance scoring failed: {str(e)}"
        )

    # 8. Step 9: Image Annotation
    try:
        annotated_image = annotator_instance.annotate(
            image=image,
            matched_products=matched_products,
            violations=violations
        )
    except Exception as e:
        logger.error(f"Image annotation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Image annotation failed: {str(e)}"
        )

    # 9. Step 9: Save & Upload Annotated Image to MinIO
    try:
        # Save Pillow Image as JPEG bytes
        img_byte_arr = io.BytesIO()
        annotated_image.save(img_byte_arr, format='JPEG')
        img_bytes = img_byte_arr.getvalue()
        
        # We upload to the annotated-results bucket using the original filename or prefixed by jobId
        object_name = f"annotated_{payload.jobId}_{payload.shelfImagePath}"
        annotated_image_url = upload_to_minio(
            bucket="annotated-results",
            object_name=object_name,
            data=img_bytes,
            content_type="image/jpeg"
        )
        logger.info(f"Successfully uploaded annotated image: {annotated_image_url}")
    except Exception as e:
        logger.error(f"Annotated image upload failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload annotated image results to MinIO: {str(e)}"
        )

    elapsed_total = time.time() - start_total_time
    logger.info(f"Job {payload.jobId} processed fully in {elapsed_total:.3f} seconds.")

    # 10. Return compliance results
    return ComplianceResponse(
        status="complete",
        overall_score=scores["overall_score"],
        product_accuracy=scores["product_accuracy"],
        spacing_accuracy=scores["spacing_accuracy"],
        facing_accuracy=scores["facing_accuracy"],
        annotated_image_url=annotated_image_url,
        violations=violations,
        matched_products=matched_products
    )
