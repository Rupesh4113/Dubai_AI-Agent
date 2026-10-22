"""
Integration tests for FastAPI endpoints: KPIs, Buildings, Telemetry, Anomalies, Work Orders, Demo Scenarios.
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health_endpoint(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "operational"
    assert data["currency"] == "AED"


def test_kpis_endpoint(client):
    res = client.get("/api/v1/kpis")
    assert res.status_code == 200
    data = res.json()
    assert data["total_buildings"] >= 5
    assert "total_operating_cost_aed_today" in data
    assert data["currency"] == "AED"


def test_buildings_and_map_endpoint(client):
    res = client.get("/api/v1/buildings")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 5
    first = data[0]
    assert "latitude" in first
    assert "longitude" in first
    assert 24.0 <= first["latitude"] <= 26.0
    assert 54.0 <= first["longitude"] <= 56.0


def test_anomalies_and_investigate(client):
    res = client.get("/api/v1/anomalies")
    assert res.status_code == 200
    events = res.json()
    assert len(events) > 0
    first_id = events[0]["event_id"]

    inv_res = client.get(f"/api/v1/anomalies/{first_id}/investigate")
    assert inv_res.status_code == 200
    inv = inv_res.json()
    assert "summary" in inv
    assert "confidence_score" in inv
    assert "possible_causes" in inv


def test_demo_scenario_and_lifecycle(client):
    # Trigger Scenario B (Water Leak)
    res = client.post("/api/v1/demo/scenario/B")
    assert res.status_code == 200
    data = res.json()
    assert data["scenario"] == "B"
    assert "work_order" in data
    wo_id = data["work_order"]["work_order_id"]

    # Approve
    appr_res = client.post(
        f"/api/v1/work_orders/{wo_id}/approve",
        json={"approved": True, "rationale": "Emergency plumbing repair authorized by FM"}
    )
    assert appr_res.status_code == 200
    assert appr_res.json()["status"] == "Assigned"

    # Execute
    exec_res = client.post(
        f"/api/v1/work_orders/{wo_id}/execute",
        headers={"x-user-role": "hvac_technician"},
        json={"technician_notes": "Main branch shut-off completed. Defective valve replaced."}
    )
    assert exec_res.status_code == 200
    assert exec_res.json()["status"] == "Awaiting Verification"

    # Verify
    ver_res = client.post(f"/api/v1/work_orders/{wo_id}/verify")
    assert ver_res.status_code == 200
    assert ver_res.json()["status"] == "Resolved"
    assert ver_res.json()["is_verified"] is True
