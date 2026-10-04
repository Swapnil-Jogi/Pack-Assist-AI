"""
Pack-Assist AI - FastAPI ML Microservice Entrypoint
Provides REST endpoints for food packaging recommendations, barrier calculation,
and polymer chemistry analytics.
"""

import sys
import os

# Add parent directory to path if needed
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from recommend_model import api_app as app, ml_pipeline

# Ensure model is loaded on startup
@app.on_event("startup")
async def startup_event():
    ml_pipeline.load_model()
    print("[Pack-Assist AI API] ML Recommendation model ready and operational.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=5000, reload=False)
