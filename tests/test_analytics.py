from coolshield.analytics import make_synthetic_readings, detect_anomalies

def test_synthetic_data_has_expected_columns():
    df = make_synthetic_readings(days=3, seed=1)
    expected = {"timestamp","building_id","asset_id","electricity_kwh","water_m3","source_type"}
    assert expected.issubset(df.columns)
    assert df["building_id"].nunique() == 5

def test_detector_returns_expected_schema():
    df = make_synthetic_readings(days=10, seed=2)
    events = detect_anomalies(df)
    assert "event_id" in events.columns
    assert "severity" in events.columns
