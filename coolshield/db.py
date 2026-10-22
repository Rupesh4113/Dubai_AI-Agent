import os
import json
import uuid
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./coolshield.db")
engine = create_engine(DATABASE_URL, future=True, pool_pre_ping=True)

def init_db():
    with engine.begin() as conn:
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS sensor_readings (
          timestamp TEXT, building_id TEXT, building_type TEXT, asset_id TEXT,
          electricity_kwh REAL, water_m3 REAL, indoor_temp_c REAL, outdoor_temp_c REAL,
          hvac_runtime_hours REAL, occupancy_estimate REAL, source_type TEXT, quality_status TEXT
        )"""))
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS work_orders (
          work_order_id TEXT PRIMARY KEY, event_id TEXT, building_id TEXT, asset_id TEXT,
          title TEXT, severity TEXT, status TEXT, recommendation TEXT, evidence_json TEXT,
          created_at TEXT, updated_at TEXT
        )"""))

def load_readings():
    try:
        return pd.read_sql_query("SELECT * FROM sensor_readings", engine)
    except SQLAlchemyError:
        return pd.DataFrame()

def save_readings(df):
    if df.empty:
        return
    cols = ["timestamp","building_id","building_type","asset_id","electricity_kwh","water_m3",
            "indoor_temp_c","outdoor_temp_c","hvac_runtime_hours","occupancy_estimate","source_type","quality_status"]
    clean = df.copy()
    for c in cols:
        if c not in clean.columns:
            clean[c] = None
    clean = clean[cols]
    clean.to_sql("sensor_readings", engine, if_exists="append", index=False, method="multi", chunksize=1000)

def list_work_orders():
    return pd.read_sql_query("SELECT * FROM work_orders ORDER BY created_at DESC", engine)

def create_work_order(event, report):
    event_id = str(event.get("event_id", "unknown"))
    existing = list_work_orders()
    if not existing.empty and event_id in existing["event_id"].astype(str).values:
        return
    now = pd.Timestamp.now(tz="UTC").isoformat()
    record = {
        "work_order_id": "WO-" + uuid.uuid4().hex[:8].upper(),
        "event_id": event_id, "building_id": str(event.get("building_id","unknown")),
        "asset_id": str(event.get("asset_id","unknown")), "title": str(event.get("anomaly_type","Building anomaly")),
        "severity": str(event.get("severity","Medium")), "status":"Awaiting Approval",
        "recommendation": str(report.get("recommendation","Inspect asset")),
        "evidence_json": json.dumps(report.get("evidence",{})), "created_at":now, "updated_at":now
    }
    pd.DataFrame([record]).to_sql("work_orders", engine, if_exists="append", index=False)

def update_work_order(work_order_id, status):
    with engine.begin() as conn:
        conn.execute(text("UPDATE work_orders SET status=:s, updated_at=:u WHERE work_order_id=:id"),
                     {"s":status,"u":pd.Timestamp.now(tz="UTC").isoformat(),"id":work_order_id})
