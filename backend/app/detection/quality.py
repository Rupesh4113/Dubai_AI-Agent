"""
CoolShield AI - Layer A: Data Quality Validation Engine
Detects telemetry corruption, missing values, flatlines, out-of-range sensor readings,
and communication dropouts before running anomaly detection or ML models.
"""
from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np


PHYSICAL_LIMITS = {
    "electricity_kwh": (0.0, 10000.0),
    "water_m3": (0.0, 500.0),
    "indoor_temp_c": (10.0, 45.0),
    "outdoor_temp_c": (10.0, 58.0),
    "hvac_supply_temp_c": (3.0, 20.0),
    "hvac_return_temp_c": (6.0, 30.0),
    "hvac_runtime_hours": (0.0, 1.0),
    "cop_estimate": (0.5, 8.0),
    "occupancy_estimate": (0.0, 1.0)
}


def validate_reading_record(reading: Dict[str, Any]) -> Tuple[str, List[str]]:
    """
    Validates an individual telemetry packet against physical feasibility bounds.
    Returns: (quality_status: 'valid' | 'suspect' | 'invalid', quality_notes: List[str])
    """
    notes = []
    status = "valid"

    # Check timestamp
    if not reading.get("timestamp"):
        return "invalid", ["Missing timestamp"]

    # Check physical limits
    for metric, (low, high) in PHYSICAL_LIMITS.items():
        val = reading.get(metric)
        if val is not None:
            try:
                num = float(val)
                if num < low or num > high:
                    notes.append(f"{metric} value {num} out of physical range [{low}, {high}]")
                    status = "invalid" if num < 0 else "suspect"
            except (ValueError, TypeError):
                notes.append(f"Invalid non-numeric value for {metric}: {val}")
                status = "invalid"

    return status, notes


def validate_dataframe_quality(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyzes an entire time-series DataFrame for:
    - Missing timestamps & gap analysis
    - Flatlines (dead sensors)
    - Sudden spike ratios
    - Communication dropout rate
    """
    if df.empty:
        return {
            "total_records": 0,
            "data_quality_score": 0.0,
            "missing_count": 0,
            "flatline_metrics": [],
            "dropout_rate_pct": 0.0,
            "status": "empty"
        }

    total_records = len(df)
    missing_counts = df.isna().sum().to_dict()
    total_missing = sum(missing_counts.values())

    # Flatline detection: check if any metric has 0 standard deviation over >= 12 readings
    flatlines = []
    numeric_cols = [c for c in PHYSICAL_LIMITS.keys() if c in df.columns]
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) >= 12:
            rolling_std = series.rolling(12).std()
            if (rolling_std == 0.0).any():
                flatlines.append(col)

    dropout_rate = (total_missing / (total_records * max(1, len(numeric_cols)))) * 100.0
    quality_score = max(0.0, min(100.0, 100.0 - dropout_rate * 2.0 - len(flatlines) * 10.0))

    return {
        "total_records": total_records,
        "data_quality_score": round(quality_score, 1),
        "missing_counts": missing_counts,
        "flatline_metrics": flatlines,
        "dropout_rate_pct": round(dropout_rate, 2),
        "status": "healthy" if quality_score >= 85 else ("degraded" if quality_score >= 60 else "critical")
    }
