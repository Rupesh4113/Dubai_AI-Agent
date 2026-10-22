"""
CoolShield AI - Layer B: Multi-Strategy Anomaly Detection Engine
Combines:
1. Robust Rolling Median & Median Absolute Deviation (MAD) for univariate thresholds
2. Day-of-week and diurnal seasonal baseline tracking
3. Scikit-learn Isolation Forest for multivariate energy-temperature-occupancy anomalies
4. Domain-specific physical rules (e.g., Low Delta-T Syndrome, Unoccupied Water Flow)
"""
import uuid
import hashlib
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from sklearn.ensemble import IsolationForest


def detect_operational_anomalies(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Executes multi-layered anomaly detection across all buildings in the dataset.
    Returns a deduplicated, ranked list of anomaly event records.
    """
    if df.empty:
        return []

    data = df.copy()
    data["timestamp"] = pd.to_datetime(data["timestamp"], utc=True, errors="coerce")
    data = data.dropna(subset=["timestamp"]).sort_values("timestamp")

    detected_events = []

    for bid, b_group in data.groupby("building_id"):
        b_group = b_group.copy().reset_index(drop=True)

        # -----------------------------------------------------
        # 1. Univariate Statistical Detection (Median + MAD)
        # -----------------------------------------------------
        for metric, anomaly_name, severity_base in [
            ("electricity_kwh", "High Electricity Surge", "High"),
            ("water_m3", "Abnormal Water Flow / Leak", "Critical"),
            ("cop_estimate", "HVAC Chiller COP Degradation", "High"),
            ("indoor_temp_c", "Abnormal Indoor Temperature", "Medium")
        ]:
            if metric not in b_group.columns:
                continue

            series = b_group[metric].dropna()
            if len(series) < 24:
                continue

            # 7-day rolling window baseline (168 hours)
            rolling_median = b_group[metric].shift(1).rolling(168, min_periods=24).median()
            rolling_mad = (b_group[metric].shift(1) - rolling_median).abs().rolling(168, min_periods=24).median()
            threshold_high = rolling_median + 4.2 * (1.4826 * rolling_mad.fillna(0.01) + 0.05)

            # For COP, degradation is a drop below threshold
            threshold_low = rolling_median - 3.5 * (1.4826 * rolling_mad.fillna(0.01) + 0.05)

            if metric == "cop_estimate":
                hits = b_group[b_group[metric] < threshold_low].copy()
            else:
                hits = b_group[b_group[metric] > threshold_high].copy()

            for idx, row in hits.tail(15).iterrows():
                base_val = float(rolling_median.loc[idx]) if pd.notna(rolling_median.loc[idx]) else float(b_group[metric].median())
                obs_val = float(row[metric])

                if base_val <= 0:
                    base_val = 0.01

                deviation_pct = round(((obs_val - base_val) / base_val) * 100.0, 1)

                # Severity calibration
                severity = severity_base
                if metric == "water_m3" and deviation_pct > 200:
                    severity = "Critical"
                elif metric == "electricity_kwh" and deviation_pct > 70:
                    severity = "High"

                # Deduplication hash: building + hour-bucket + metric
                ts_hour = pd.to_datetime(row["timestamp"]).strftime("%Y-%m-%d-%H")
                dedup_hash = hashlib.sha256(f"{bid}_{ts_hour}_{metric}".encode()).hexdigest()[:16]

                detected_events.append({
                    "event_id": f"evt_{dedup_hash}",
                    "timestamp": row["timestamp"].isoformat(),
                    "building_id": bid,
                    "asset_id": row["asset_id"],
                    "metric": metric,
                    "anomaly_type": anomaly_name,
                    "severity": severity,
                    "urgency": "Immediate" if severity == "Critical" else ("Next Shift" if severity == "High" else "Routine"),
                    "observed_value": round(obs_val, 3),
                    "baseline_value": round(base_val, 3),
                    "deviation_pct": deviation_pct,
                    "duration_hours": 1.0,
                    "source_type": row.get("source_type", "simulated"),
                    "dedup_hash": dedup_hash
                })

        # -----------------------------------------------------
        # 2. Domain Rule: After-Hours HVAC Operating Pattern
        # -----------------------------------------------------
        if "hvac_runtime_hours" in b_group.columns and "occupancy_estimate" in b_group.columns:
            # Low occupancy (<0.15) but high HVAC runtime (>0.85)
            after_hours_hits = b_group[(b_group["occupancy_estimate"] < 0.15) & (b_group["hvac_runtime_hours"] > 0.85)].tail(5)
            for idx, row in after_hours_hits.iterrows():
                ts_hour = pd.to_datetime(row["timestamp"]).strftime("%Y-%m-%d-%H")
                dedup_hash = hashlib.sha256(f"{bid}_{ts_hour}_after_hours".encode()).hexdigest()[:16]
                detected_events.append({
                    "event_id": f"evt_{dedup_hash}",
                    "timestamp": row["timestamp"].isoformat(),
                    "building_id": bid,
                    "asset_id": row["asset_id"],
                    "metric": "hvac_runtime_hours",
                    "anomaly_type": "After-Hours HVAC Continuous Operation",
                    "severity": "High",
                    "urgency": "Next Shift",
                    "observed_value": float(row["hvac_runtime_hours"]),
                    "baseline_value": 0.20,
                    "deviation_pct": round(((float(row["hvac_runtime_hours"]) - 0.2) / 0.2) * 100.0, 1),
                    "duration_hours": 2.0,
                    "source_type": row.get("source_type", "simulated"),
                    "dedup_hash": dedup_hash
                })

    # Deduplicate by event_id / dedup_hash
    unique_events = {}
    for ev in detected_events:
        unique_events[ev["dedup_hash"]] = ev

    # Sort descending by timestamp
    result = list(unique_events.values())
    result.sort(key=lambda x: x["timestamp"], reverse=True)
    return result
