"""
CoolShield AI - Main Application Entrypoint
FastAPI Backend with Autonomous Agent Pipelines, Telemetry Ingestion,
DEWA Utility Tariffs, RBAC Security, and Static Frontend SPA Mounting.
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.models.db_models import init_database, SessionLocal
from backend.app.services.data_generator import seed_database_with_defaults
from backend.app.agents.tools import run_anomaly_detection
from backend.app.api.routes import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    init_database()
    # Seed database with deterministic Dubai simulation data
    db = SessionLocal()
    try:
        seed_database_with_defaults(db, force_reset=False)
        from backend.app.models.db_models import AnomalyEvent
        if db.query(AnomalyEvent).count() == 0:
            run_anomaly_detection(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="CoolShield AI - Dubai Smart Building Operations & Autonomous Efficiency Agent",
    description="Enterprise AI Agent for autonomous anomaly detection, diagnostics, work order routing, and outcome verification across commercial property portfolios in Dubai.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)


# Mount compiled React frontend if built
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/")
    async def serve_root():
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"service": "CoolShield AI", "status": "operational"}

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="File Not Found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
