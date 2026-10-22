import pandas as pd
from coolshield.workflow import investigate_event, verify_work_order

def test_investigation_includes_evidence():
    event = {"event_id":"e1","building_id":"B1","asset_id":"A1","anomaly_type":"High electricity",
             "timestamp":"2026-10-22T10:00:00Z","metric":"electricity_kwh","observed_value":20,"baseline_value":10}
    report = investigate_event(event, pd.DataFrame())
    assert "evidence" in report
    assert report["estimated_impact_aed"] >= 0

def test_verification_does_not_claim_savings_without_evidence():
    result = verify_work_order("WO-1", pd.DataFrame())
    assert result["verified"] is False
