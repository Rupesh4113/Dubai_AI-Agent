import os
import pandas as pd
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel, Field
from typing import Optional
from dotenv import load_dotenv
from coolshield.db import init_db, save_readings

load_dotenv()
app = FastAPI(title="CoolShield Sensor Ingestion API", version="0.1.0")
init_db()
INGEST_API_KEY = os.getenv("INGEST_API_KEY", "local-demo-key-change-me")

class SensorReading(BaseModel):
    timestamp: str
    building_id: str = Field(min_length=1, max_length=100)
    asset_id: str = Field(min_length=1, max_length=100)
    electricity_kwh: Optional[float] = Field(default=None, ge=0)
    water_m3: Optional[float] = Field(default=None, ge=0)
    indoor_temp_c: Optional[float] = None
    outdoor_temp_c: Optional[float] = None
    hvac_runtime_hours: Optional[float] = Field(default=None, ge=0, le=24)
    occupancy_estimate: Optional[float] = Field(default=None, ge=0, le=1)
    building_type: Optional[str] = "Unknown"

@app.get("/health")
def health():
    return {"status":"ok", "service":"coolshield-ingestion-api"}

@app.post("/v1/readings")
def ingest_reading(payload: SensorReading, x_api_key: str = Header(default="")):
    if x_api_key != INGEST_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    data = payload.model_dump()
    ts = pd.to_datetime(data["timestamp"], utc=True, errors="coerce")
    if pd.isna(ts):
        raise HTTPException(status_code=422, detail="timestamp must be parseable")
    data["timestamp"] = ts.isoformat()
    data["source_type"] = "rest_api"
    data["quality_status"] = "valid"
    save_readings(pd.DataFrame([data]))
    return {"accepted": True, "building_id": data["building_id"], "asset_id": data["asset_id"], "timestamp": data["timestamp"]}
