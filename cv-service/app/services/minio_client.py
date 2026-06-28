import os
import datetime
import hashlib
import hmac
import requests
import logging

logger = logging.getLogger("cv_service.minio")
logger.setLevel(logging.INFO)

def sign(key, msg):
    return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()

def getSignatureKey(key, dateStamp, regionName, serviceName):
    kDate = sign(('AWS4' + key).encode('utf-8'), dateStamp)
    kRegion = sign(kDate, regionName)
    kService = sign(kRegion, serviceName)
    kSigning = sign(kService, 'aws4_request')
    return kSigning

def upload_to_minio(bucket: str, object_name: str, data: bytes, content_type: str = "image/jpeg") -> str:
    # Read environment variables
    endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    access_key = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    secret_key = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    
    # Extract host and port
    host = endpoint.replace("http://", "").replace("https://", "")
    
    # Construct URL
    url = f"http://{host}/{bucket}/{object_name}"
    
    # Compute actual payload hash
    payload_hash = hashlib.sha256(data).hexdigest()
    
    # Compute standard AWS S3 V4 signature
    now = datetime.datetime.utcnow()
    amz_date = now.strftime('%Y%m%dT%H%M%SZ')
    date_stamp = now.strftime('%Y%m%d')
    
    region = "us-east-1"
    service = "s3"
    
    # Create canonical request components
    canonical_uri = f"/{bucket}/{object_name}"
    canonical_headers = f"host:{host}\nx-amz-content-sha256:{payload_hash}\nx-amz-date:{amz_date}\n"
    signed_headers = "host;x-amz-content-sha256;x-amz-date"
    
    canonical_request = (
        "PUT\n"
        f"{canonical_uri}\n"
        "\n"
        f"{canonical_headers}\n"
        f"{signed_headers}\n"
        f"{payload_hash}"
    )
    
    # Create string to sign
    algorithm = "AWS4-HMAC-SHA256"
    credential_scope = f"{date_stamp}/{region}/{service}/aws4_request"
    hashed_canonical_request = hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()
    
    string_to_sign = (
        f"{algorithm}\n"
        f"{amz_date}\n"
        f"{credential_scope}\n"
        f"{hashed_canonical_request}"
    )
    
    # Calculate signature
    signing_key = getSignatureKey(secret_key, date_stamp, region, service)
    signature = hmac.new(signing_key, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()
    
    # Construct authorization header
    authorization_header = (
        f"{algorithm} Credential={access_key}/{credential_scope}, "
        f"SignedHeaders={signed_headers}, Signature={signature}"
    )
    
    headers = {
        "x-amz-date": amz_date,
        "x-amz-content-sha256": payload_hash,
        "Authorization": authorization_header,
        "Content-Type": content_type
    }
    
    logger.info(f"Uploading {len(data)} bytes to MinIO bucket '{bucket}' object '{object_name}'...")
    try:
        response = requests.put(url, data=data, headers=headers, timeout=15)
        if response.status_code != 200:
            logger.error(f"MinIO PUT request failed (HTTP {response.status_code}): {response.text}")
            raise IOError(f"MinIO upload failed with HTTP {response.status_code}: {response.text}")
    except requests.RequestException as e:
        logger.error(f"Failed to connect to MinIO for upload: {str(e)}")
        raise IOError(f"Failed to connect to MinIO: {str(e)}")
        
    logger.info("Upload completed successfully.")
    return f"http://{host}/{bucket}/{object_name}"
