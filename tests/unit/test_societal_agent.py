"""
Unit tests for Societal AI Agent modules:
- Module A: ESG & Carbon Accounting (Scope 1 & 2 + Separate Offsets)
- Module B: Peak Demand & HVAC Optimization (Safety interlocks)
- Module C: Social Inclusion & Multilingual Routing (PII minimization)
- Module D: Sustainability Education & Sprints
- Module E: Community Resilience & Early Warning (NCM Weather & Heat Index)
- 19 Typed Tools Execution Gate (Prohibited / Consequential / Read-only)
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.models.db_models import Base
from backend.app.services.data_generator import seed_database_with_defaults
from backend.app.agents.tools import (
    get_safety_policy, search_verified_community_resources,
    create_service_request, draft_multilingual_announcement,
    get_weather_risk, generate_esg_report, execute_agent_tool,
    AGENT_TOOLS_MANIFEST
)


@pytest.fixture(scope="module")
def db_session():
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSession()
    seed_database_with_defaults(db, force_reset=True)
    yield db
    db.close()


def test_safety_policy():
    """Verify ASHRAE 55 and 62.1 life safety and comfort constraints."""
    policy = get_safety_policy()
    assert "thermal_comfort" in policy
    assert policy["thermal_comfort"]["min_indoor_temp_c"] == 23.0
    assert policy["thermal_comfort"]["max_indoor_temp_c"] == 26.0
    assert policy["indoor_air_quality"]["min_ventilation_cfm_per_person"] >= 15.0
    assert policy["indoor_air_quality"]["max_indoor_co2_ppm"] <= 800.0
    assert "strictly override" in policy["non_negotiable_rule"]


def test_verified_community_resources(db_session):
    """Verify verified Dubai cooling shelters and happiness centres."""
    resources = search_verified_community_resources(db_session)
    assert len(resources) >= 4
    cooling = [r for r in resources if r["category"] == "Cooling Shelter"]
    assert len(cooling) >= 2
    # Check wheelchair accessibility
    assert any(r["wheelchair_accessible"] for r in cooling)
    # Check district filtering
    barsha = search_verified_community_resources(db_session, district="Al Barsha")
    assert len(barsha) >= 1
    assert "Al Barsha" in barsha[0]["name"]


def test_service_request_pii_sanitization(db_session):
    """Verify PII scrubbing on resident service tickets."""
    raw_desc = "My contact is john.doe@example.com or +971-50-123-4567. AC is leaking on 3rd floor."
    req = create_service_request(db_session, category="Thermal Comfort", description=raw_desc, language="en")
    assert req["status"] == "Received"
    assert "request_id" in req

    # Fetch from DB and verify PII was redacted
    from backend.app.models.db_models import CommunityServiceRequest
    saved = db_session.query(CommunityServiceRequest).filter(CommunityServiceRequest.request_id == req["request_id"]).first()
    assert saved is not None
    assert "john.doe@example.com" not in saved.description
    assert "+971-50-123-4567" not in saved.description
    assert "[EMAIL REDACTED]" in saved.description or "[PHONE REDACTED]" in saved.description


def test_multilingual_announcements(db_session):
    """Verify educational and advisory content across 6 Dubai community languages."""
    ann = draft_multilingual_announcement(db_session, topic="Thermostat Setpoints")
    assert "translations" in ann
    trans = ann["translations"]
    for lang in ["en", "ar", "hi", "ur", "ml", "fil"]:
        assert lang in trans
        assert len(trans[lang]) > 0


def test_weather_and_heat_index(db_session):
    """Verify NCM weather integration and calculated heat index."""
    risk = get_weather_risk(db_session)
    assert risk["dry_bulb_temperature_c"] >= 35.0
    assert risk["calculated_heat_index_c"] >= 40.0
    assert "active_incident" in risk
    assert risk["risk_category"] in ["Alert", "Advisory"]


def test_esg_carbon_accounting_separation(db_session):
    """Verify Scope 1 & 2 calculation and strict offset separation."""
    report = generate_esg_report(db_session, period_label="2026-Q3")
    assert report["scope_1_direct_kgco2e"] > 0
    assert report["scope_2_electricity_kgco2e"] > 0
    assert report["operational_reductions_mtco2e"] > 0
    assert "carbon_offsets" in report
    assert report["carbon_offsets"]["purchased_mtco2e"] > 0
    assert "NOT subtracted" in report["carbon_offsets"]["accounting_note"]


def test_typed_tools_manifest_count():
    """Verify all 19 typed tools are registered."""
    assert len(AGENT_TOOLS_MANIFEST) == 19
    for tool_name, meta in AGENT_TOOLS_MANIFEST.items():
        assert "risk" in meta
        assert meta["risk"] in ["Read-only", "Low-risk internal", "Consequential", "Prohibited"]


def test_agent_tools_safety_gate(db_session):
    """Verify security policy enforcement on tool execution."""
    # Prohibited action rejection
    prohibited_res = execute_agent_tool("raw_shell_exec", db_session, {}, actor_role="facilities_manager")
    assert "error" in prohibited_res
    assert prohibited_res["error"] == "PROHIBITED_ACTION"

    # Consequential action requires FM authorization
    consequential_blocked = execute_agent_tool("create_work_order", db_session, {"event_id": "evt_test"}, actor_role="read_only_auditor")
    assert "error" in consequential_blocked
    assert consequential_blocked["error"] == "INSUFFICIENT_PERMISSIONS"

    # Read-only tool succeeds for any role
    read_only_res = execute_agent_tool("get_safety_policy", db_session, {}, actor_role="read_only_auditor")
    assert "thermal_comfort" in read_only_res
