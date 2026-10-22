"""
Unit and integration tests for Autonomous Agent tools and end-to-end lifecycle.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.models.db_models import Base, Building, AnomalyEvent, WorkOrder
from backend.app.services.data_generator import seed_database_with_defaults
from backend.app.agents.tools import (
    get_building_context,
    run_anomaly_detection,
    generate_diagnostic_report,
    create_work_order,
    record_approval_decision,
    simulate_technician_execution,
    verify_resolution
)
from backend.app.agents.orchestrator import AutonomousBuildingAgent


@pytest.fixture(scope="module")
def test_db():
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSession()
    seed_database_with_defaults(db, force_reset=True)
    yield db
    db.close()


def test_agent_building_context(test_db):
    context = get_building_context(test_db, "DXB-OFF-01")
    assert context["building_id"] == "DXB-OFF-01"
    assert "Burj Al-Amal" in context["name"]
    assert len(context["monitored_assets"]) > 0


def test_agent_detect_anomalies(test_db):
    events = run_anomaly_detection(test_db)
    assert len(events) > 0
    first = events[0]
    assert "event_id" in first
    assert "severity" in first
    assert "observed_value" in first
    assert "baseline_value" in first


def test_agent_full_lifecycle(test_db):
    # 1. Run detection
    events = run_anomaly_detection(test_db, "DXB-HOT-02")
    assert len(events) > 0
    water_event = next((e for e in events if "water" in e["metric"]), events[0])

    # 2. Investigate & Diagnose
    report = generate_diagnostic_report(test_db, water_event["event_id"])
    assert "summary" in report
    assert report["confidence_score"] > 0.7
    assert len(report["possible_causes"]) > 0
    assert "recommendations" in report

    # 3. Create Work Order (Awaiting Approval)
    wo_res = create_work_order(test_db, water_event["event_id"])
    wo_id = wo_res["work_order_id"]
    assert wo_res["status"] == "Awaiting Approval"

    # 4. Human Approval (Facilities Manager)
    appr_res = record_approval_decision(test_db, wo_id, approved=True, actor_name="Ahmed Al-Maktoum")
    assert appr_res["status"] == "Assigned"
    assert appr_res["approval_status"] == "Approved"

    # 5. Technician Intervention (Simulated field repair)
    tech_res = simulate_technician_execution(
        test_db,
        wo_id,
        technician_notes="Replaced faulty gasket and isolated leaking branch valve on B-04 loop."
    )
    assert tech_res["status"] == "Awaiting Verification"

    # 6. Autonomous Verification
    ver_res = verify_resolution(test_db, wo_id)
    assert ver_res["is_verified"] is True
    assert ver_res["status"] == "Resolved"
    assert ver_res["verified_weekly_savings_aed"] > 0
