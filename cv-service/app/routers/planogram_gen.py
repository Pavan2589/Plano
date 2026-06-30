import os
import io
import logging
import cv2
import numpy as np
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from PIL import Image

from app.services.detector import detector_instance
from app.services.embedder import embedder_instance
from app.services.matcher import matcher_instance
from app.db.queries import db_queries

logger = logging.getLogger("cv_service.router.planogram_gen")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

router = APIRouter()


class PlanogramGenRequest(BaseModel):
    planogramId: str
    referenceImagePath: str


class DetectedCell(BaseModel):
    row: int
    position: int
    reference_product_id: str
    product_name: str
    similarity: float
    bbox: List[float]
    facing_count: int


class PlanogramGenResponse(BaseModel):
    status: str
    num_rows: int
    ref_image_width: float
    cells: List[DetectedCell]


def preprocess_with_clahe(image: Image.Image) -> Image.Image:
    img_array = np.array(image.convert('RGB'))
    lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l)
    lab_enhanced = cv2.merge([l_enhanced, a, b])
    rgb_enhanced = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2RGB)
    return Image.fromarray(rgb_enhanced)


@router.post("/generate-planogram", response_model=PlanogramGenResponse)
async def generate_planogram(payload: PlanogramGenRequest):
    logger.info(f"Starting planogram generation for planogram: {payload.planogramId}")

    # 1. Download reference image from MinIO "reference-planograms" bucket
    minio_endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    minio_endpoint = minio_endpoint.replace("http://", "").replace("https://", "")
    url = f"http://{minio_endpoint}/reference-planograms/{payload.referenceImagePath}"

    logger.info(f"Downloading reference image from: {url}")
    try:
        response = requests.get(url, timeout=15)
        if response.status_code != 200:
            raise HTTPException(
                status_code=404,
                detail=f"Reference image '{payload.referenceImagePath}' not found in MinIO bucket (HTTP {response.status_code})"
            )
    except requests.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect to MinIO: {str(e)}"
        )

    # 2. Load image with PIL, get dimensions
    try:
        image = Image.open(io.BytesIO(response.content))
        image_width, image_height = image.size
        logger.info(f"Loaded reference image: {image_width}x{image_height}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image content: {str(e)}")

    # 3. Apply CLAHE preprocessing
    image = preprocess_with_clahe(image)

    # 4. Detect bounding boxes
    try:
        detections = detector_instance.detect(image)
        logger.info(f"Detected {len(detections)} products in reference image")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Object detection failed: {str(e)}")

    # 5. Generate embeddings for each detection
    for idx, det in enumerate(detections):
        x1, y1, x2, y2 = det["bbox"]
        try:
            crop_img = image.crop((int(x1), int(y1), int(x2), int(y2)))
            embedding = embedder_instance.generate_embedding(crop_img)
            det["embedding"] = embedding.tolist()
        except Exception as e:
            logger.warning(f"Skipping detection {idx} due to embedding error: {str(e)}")
            det["embedding"] = None

    # 6. Fetch reference products for this planogram's client
    try:
        client_id = db_queries.fetch_planogram_client_id(payload.planogramId)
        reference_products = db_queries.fetch_all_reference_products(client_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")

    if not reference_products:
        raise HTTPException(
            status_code=404,
            detail="No reference products with complete embeddings found for this planogram's client"
        )

    # 7. Match each detection to best reference product; skip if similarity < 0.75
    SIMILARITY_THRESHOLD = 0.75
    accepted_detections = []
    for det in detections:
        if not det.get("embedding"):
            continue
        best_product = max(
            reference_products,
            key=lambda r: matcher_instance.calculate_similarity(r["embedding"], det["embedding"])
        )
        best_similarity = matcher_instance.calculate_similarity(best_product["embedding"], det["embedding"])
        if best_similarity < SIMILARITY_THRESHOLD:
            continue
        det["matched_product"] = best_product
        det["similarity"] = best_similarity
        accepted_detections.append(det)

    logger.info(f"{len(accepted_detections)} of {len(detections)} detections accepted above similarity threshold")

    # 8. Cluster accepted detections into rows
    row_groups = matcher_instance.cluster_rows(accepted_detections)

    # 9. Sort within each row left-to-right by cx, assign positions, build cells
    cells = []
    for row_idx, row_dets in enumerate(row_groups):
        row_num = row_idx + 1
        sorted_row = sorted(row_dets, key=lambda d: d.get("cx", (d["bbox"][0] + d["bbox"][2]) / 2.0))
        for pos_idx, det in enumerate(sorted_row):
            product = det["matched_product"]
            cells.append(DetectedCell(
                row=row_num,
                position=pos_idx + 1,
                reference_product_id=str(product["id"]),
                product_name=product["name"] or product.get("sku_code") or str(product["id"]),
                similarity=round(float(det["similarity"]), 4),
                bbox=det["bbox"],
                facing_count=1
            ))

    logger.info(f"Generated {len(cells)} cells across {len(row_groups)} rows for planogram {payload.planogramId}")

    return PlanogramGenResponse(
        status="complete",
        num_rows=len(row_groups),
        ref_image_width=float(image_width),
        cells=cells
    )
