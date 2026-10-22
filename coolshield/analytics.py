import numpy as np
import pandas as pd
import uuid

BUILDINGS = [
    ("DXB-OFF-01", "Office Tower"),
    ("DXB-HOT-02", "Hotel"),
    ("DXB-RES-03", "Residential Tower"),
    ("DXB-MIX-04", "Mixed Use"),
    ("DXB-WHS-05", "Warehouse"),
]

def make_synthetic_readings(days=90, seed=17):
    rng = np.random.default_rng(seed)
    timestamps = pd.date_range(end=pd.Timestamp.now(tz="UTC").floor("h"), periods=days*24, freq="h")
    rows = []
    for bid, btype in BUILDINGS:
        scale = {"Office Tower":1.4,"Hotel":1.8,"Residential Tower":1.1,"Mixed Use":1.6,"Warehouse":0.8}[btype]
        for i, ts in enumerate(timestamps):
            hour = ts.hour
            weekday = ts.dayofweek < 5
            occupancy = (0.75 if 8 <= hour <= 18 and weekday else 0.25) if btype != "Hotel" else 0.65
            outdoor = 31 + 7*np.sin((hour-8)*np.pi/12) + rng.normal(0, 1.2)
            indoor = 23.5 + rng.normal(0, .6)
            hvac = max(0, (0.7 + max(0, outdoor-24)/18) * scale + rng.normal(0,.08))
            elec = max(0.1, (14 + max(0,outdoor-22)*1.6 + occupancy*8) * scale + rng.normal(0,2))
            water = max(.01, (0.22 + occupancy*.28) * scale + rng.normal(0,.04))
            # Deterministic injected events for demo reproducibility.
            if bid == "DXB-OFF-01" and 48 <= i % (days*24) <= 60:
                elec *= 1.9  # overnight / abnormal consumption window
            if bid == "DXB-HOT-02" and 1000 <= i < 1012:
                water *= 5.5  # suspected leak event
            if bid == "DXB-MIX-04" and 1400 <= i < 1500:
                hvac *= 1.45  # possible HVAC degradation
            rows.append({
                "timestamp": ts.isoformat(), "building_id": bid, "building_type": btype,
                "asset_id": f"{bid}-HVAC-01", "electricity_kwh": round(elec,3),
                "water_m3": round(water,4), "indoor_temp_c": round(indoor,2),
                "outdoor_temp_c": round(outdoor,2), "hvac_runtime_hours": round(min(1.0,hvac),3),
                "occupancy_estimate": round(occupancy,2), "source_type":"simulated",
                "quality_status":"valid"
            })
    return pd.DataFrame(rows)

def detect_anomalies(df):
    if df.empty:
        return pd.DataFrame(columns=["event_id","timestamp","building_id","asset_id","anomaly_type","severity","observed_value","baseline_value"])
    x = df.copy()
    x["timestamp"] = pd.to_datetime(x["timestamp"], utc=True, errors="coerce")
    x = x.dropna(subset=["timestamp"])
    # Per-building robust baseline by metric. Robust rolling median and MAD.
    events = []
    for metric, label in [("electricity_kwh","High electricity consumption"),("water_m3","Abnormal water flow"),("hvac_runtime_hours","HVAC runtime deviation")]:
        for bid, g in x.groupby("building_id"):
            g = g.sort_values("timestamp").copy()
            # Use expanding median to avoid needing a long rolling history for demo.
            baseline = g[metric].shift(1).rolling(168, min_periods=24).median()
            mad = (g[metric].shift(1) - baseline).abs().rolling(168, min_periods=24).median()
            threshold = baseline + 4.5 * (1.4826 * mad.fillna(0) + 0.01)
            hits = g[g[metric] > threshold].copy()
            for idx, row in hits.tail(25).iterrows():
                base = float(baseline.loc[idx]) if pd.notna(baseline.loc[idx]) else float(g[metric].median())
                val = float(row[metric])
                events.append({
                    "event_id": str(uuid.uuid5(uuid.NAMESPACE_DNS, f'{bid}-{row["timestamp"]}-{metric}'))[:12],
                    "timestamp": str(row["timestamp"]), "building_id": bid, "asset_id": row["asset_id"],
                    "anomaly_type": label, "severity": "High" if val > max(base*1.8, base+0.5) else "Medium",
                    "metric": metric, "observed_value": round(val,4), "baseline_value": round(base,4),
                    "source_type": row.get("source_type","unknown")
                })
    out = pd.DataFrame(events)
    if out.empty:
        return out
    return out.drop_duplicates("event_id").sort_values("timestamp", ascending=False).reset_index(drop=True)

def build_kpis(df, anomalies):
    return {"buildings": int(df["building_id"].nunique()) if not df.empty else 0, "alerts": len(anomalies)}

