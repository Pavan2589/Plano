import os
from fastapi import FastAPI
from dotenv import load_dotenv

# Load env vars
load_dotenv(override=True)

from app.routers import health, compliance, embedding

app = FastAPI(
    title="Planogram Compliance CV Microservice",
    description="Python microservice containing the YOLOv8 and ResNet50 pipelines",
    version="1.0.0"
)

# Register routers
app.include_router(health.router)
app.include_router(compliance.router, prefix="/process", tags=["compliance"])
app.include_router(embedding.router, prefix="/process", tags=["embedding"])

@app.get("/")
def read_root():
    return {"message": "Planogram Compliance CV Service is online."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("CV_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
