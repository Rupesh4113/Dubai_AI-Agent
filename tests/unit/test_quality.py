"""
Unit tests for Layer A: Data Quality Validation.
"""
import pandas as pd
from backend.app.detection.quality import validate_reading_record, validate_dataframe_quality


def test_valid_reading_record():
    valid_record = {
        "timestamp": "2026-10-22T12:00:00Z",
        "electricity_kwh": 45.2,
        "water_m3": 0.85,
        "indoor_temp_c": 23.4,
        "outdoor_temp_c": 36.1,
        "hvac_runtime_hours": 0.8
    }
    status, notes = validate_reading_record(valid_record)
    assert status == "valid"
    assert len(notes) == 0


def test_invalid_negative_reading():
    invalid_record = {
        "timestamp": "2026-10-22T12:00:00Z",
        "electricity_kwh": -15.0
    }
    status, notes = validate_reading_record(invalid_record)
    assert status == "invalid"
    assert any("out of physical range" in n for n in notes)


def test_dataframe_quality_flatline():
    df = pd.DataFrame({
        "electricity_kwh": [25.0] * 15,  # 15 constant values = flatline
        "water_m3": [1.0 + i * 0.1 for i in range(15)]
    })
    quality = validate_dataframe_quality(df)
    assert "electricity_kwh" in quality["flatline_metrics"]
    assert quality["status"] in ["degraded", "healthy"]
