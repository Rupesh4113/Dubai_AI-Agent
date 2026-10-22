"""
CoolShield AI - Database Models & Persistence Engine
Supports SQLite (local demo & tests) and PostgreSQL (production).
"""
import os
import json
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import (
    create_engine, Column, String, Float, Integer, Boolean,
    DateTime, Text, ForeignKey, Index, desc
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./coolshield.db")

# For SQLite, check_same_thread=False is needed for multi-threaded FastAPI
engine_args = {}
if DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, future=True, pool_pre_ping=True, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def utcnow_str() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------
# Core RBAC & Users
# ---------------------------------------------------------
class User(Base):
    __tablename__ = "users"
    id = Column(String(64), primary_key=True, default=lambda: f"usr_{uuid.uuid4().hex[:8]}")
    email = Column(String(128), unique=True, nullable=False, index=True)
    full_name = Column(String(128), nullable=False)
    role = Column(String(64), nullable=False, default="facilities_manager")
    organization = Column(String(128), default="Dubai Commercial Properties LLC")
    preferred_language = Column(String(10), default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(String(64), default=utcnow_str)


# ---------------------------------------------------------
# Buildings & Assets
# ---------------------------------------------------------
class Building(Base):
    __tablename__ = "buildings"
    id = Column(String(32), primary_key=True)  # e.g., DXB-OFF-01
    name = Column(String(128), nullable=False)
    building_type = Column(String(64), nullable=False)  # Office Tower, Hotel, Residential, Mixed-Use, Warehouse
    district = Column(String(64), nullable=False)  # Downtown, Palm Jumeirah, Marina, Al Wasl, Dubai South
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    gross_floor_area_m2 = Column(Float, nullable=False)
    floors = Column(Integer, default=20)
    year_built = Column(Integer, default=2019)
    cooling_system_type = Column(String(64), default="District Cooling + VAV")
    operational_status = Column(String(32), default="Optimal")  # Optimal, Degraded, Critical, Maintenance
    target_cop = Column(Float, default=4.2)  # Coefficient of performance
    baseline_kwh_per_m2_day = Column(Float, default=0.65)
    baseline_water_m3_per_day = Column(Float, default=15.0)
    created_at = Column(String(64), default=utcnow_str)

    assets = relationship("BuildingAsset", back_populates="building", cascade="all, delete-orphan")


class BuildingAsset(Base):
    __tablename__ = "building_assets"
    id = Column(String(64), primary_key=True)  # e.g., DXB-OFF-01-CH-01
    building_id = Column(String(32), ForeignKey("buildings.id"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    asset_type = Column(String(64), nullable=False)  # Chiller, AHU, Cooling Tower, Water Booster Pump, Sub-meter
    model = Column(String(128), default="Carrier AquaEdge 19DV")
    rated_kw = Column(Float, default=450.0)
    rated_flow_m3h = Column(Float, default=120.0)
    status = Column(String(32), default="Running")  # Running, Warning, Fault, Off
    health_score = Column(Float, default=95.0)  # 0 - 100
    last_serviced_at = Column(String(64), default=utcnow_str)
    created_at = Column(String(64), default=utcnow_str)

    building = relationship("Building", back_populates="assets")


# ---------------------------------------------------------
# Telemetry Readings
# ---------------------------------------------------------
class SensorReading(Base):
    __tablename__ = "sensor_readings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(64), nullable=False, index=True)
    building_id = Column(String(32), nullable=False, index=True)
    asset_id = Column(String(64), nullable=False, index=True)
    electricity_kwh = Column(Float, nullable=True)
    water_m3 = Column(Float, nullable=True)
    indoor_temp_c = Column(Float, nullable=True)
    outdoor_temp_c = Column(Float, nullable=True)
    hvac_supply_temp_c = Column(Float, nullable=True)
    hvac_return_temp_c = Column(Float, nullable=True)
    hvac_runtime_hours = Column(Float, nullable=True)
    occupancy_estimate = Column(Float, nullable=True)
    cop_estimate = Column(Float, nullable=True)
    source_type = Column(String(32), default="simulated")  # simulated, rest_api, mqtt, bms_gateway, csv_import
    quality_status = Column(String(32), default="valid")  # valid, imputed, suspect, invalid
    quality_notes = Column(String(256), nullable=True)


Index("idx_readings_bld_ts", SensorReading.building_id, SensorReading.timestamp)
Index("idx_readings_asset_ts", SensorReading.asset_id, SensorReading.timestamp)


# ---------------------------------------------------------
# Anomaly Events
# ---------------------------------------------------------
class AnomalyEvent(Base):
    __tablename__ = "anomaly_events"
    event_id = Column(String(64), primary_key=True)
    timestamp = Column(String(64), nullable=False, index=True)
    building_id = Column(String(32), ForeignKey("buildings.id"), nullable=False, index=True)
    asset_id = Column(String(64), nullable=False)
    metric = Column(String(64), nullable=False)
    anomaly_type = Column(String(128), nullable=False)
    severity = Column(String(32), nullable=False)  # Critical, High, Medium, Low
    urgency = Column(String(32), default="Immediate")  # Immediate, Next Shift, Routine
    observed_value = Column(Float, nullable=False)
    baseline_value = Column(Float, nullable=False)
    deviation_pct = Column(Float, nullable=False)
    duration_hours = Column(Float, default=1.0)
    status = Column(String(32), default="Detected")  # Detected, Investigated, WorkOrderCreated, Dismissed, Resolved
    source_type = Column(String(32), default="simulated")
    dedup_hash = Column(String(64), unique=True, index=True)
    created_at = Column(String(64), default=utcnow_str)


# ---------------------------------------------------------
# AI Investigations & Recommendations
# ---------------------------------------------------------
class AIInvestigation(Base):
    __tablename__ = "ai_investigations"
    investigation_id = Column(String(64), primary_key=True, default=lambda: f"inv_{uuid.uuid4().hex[:8]}")
    event_id = Column(String(64), ForeignKey("anomaly_events.event_id"), nullable=False, index=True)
    building_id = Column(String(32), nullable=False)
    asset_id = Column(String(64), nullable=False)
    summary = Column(Text, nullable=False)
    confidence_score = Column(Float, nullable=False)  # 0.0 - 1.0
    confidence_rationale = Column(Text, nullable=False)
    possible_causes_json = Column(Text, nullable=False)  # list of {cause, evidence_strength, probability}
    supporting_evidence_json = Column(Text, nullable=False)  # dictionary of observed metrics vs baselines
    estimated_financial_impact_aed = Column(Float, default=0.0)
    required_approval_level = Column(String(32), default="Facilities Manager")
    created_at = Column(String(64), default=utcnow_str)


class Recommendation(Base):
    __tablename__ = "recommendations"
    recommendation_id = Column(String(64), primary_key=True, default=lambda: f"rec_{uuid.uuid4().hex[:8]}")
    investigation_id = Column(String(64), ForeignKey("ai_investigations.investigation_id"), nullable=False)
    title = Column(String(128), nullable=False)
    action_type = Column(String(64), nullable=False)  # Inspection, Filter Replacement, Setpoint Tuning, Valve Repair
    description = Column(Text, nullable=False)
    safety_instructions = Column(Text, nullable=True)
    estimated_avoidable_cost_aed = Column(Float, default=0.0)
    estimated_action_cost_aed = Column(Float, default=0.0)
    net_benefit_aed = Column(Float, default=0.0)
    priority = Column(String(32), default="High")
    created_at = Column(String(64), default=utcnow_str)


# ---------------------------------------------------------
# Work Orders & Lifecycle
# ---------------------------------------------------------
class WorkOrder(Base):
    __tablename__ = "work_orders"
    work_order_id = Column(String(64), primary_key=True)  # e.g., WO-2026-001
    linked_event_id = Column(String(64), nullable=True)
    building_id = Column(String(32), nullable=False, index=True)
    asset_id = Column(String(64), nullable=False)
    title = Column(String(160), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(32), default="Medium")
    priority = Column(String(32), default="Normal")
    target_response_hours = Column(Integer, default=24)
    # Lifecycle: Detected -> Investigating -> Awaiting Approval -> Approved -> Assigned -> In Progress -> Awaiting Verification -> Resolved -> Closed
    status = Column(String(64), default="Awaiting Approval")
    approval_status = Column(String(32), default="Pending")  # Pending, Approved, Rejected
    assigned_to_team = Column(String(64), default="HVAC Maintenance Team A")
    assigned_technician = Column(String(128), default="Tariq Mansoor")
    safety_notes = Column(Text, nullable=True)
    parts_labor_json = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    before_measurements_json = Column(Text, nullable=True)
    after_measurements_json = Column(Text, nullable=True)
    verified_savings_aed = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(String(64), default=utcnow_str)
    updated_at = Column(String(64), default=utcnow_str)


# ---------------------------------------------------------
# Operational Approvals
# ---------------------------------------------------------
class ApprovalRecord(Base):
    __tablename__ = "approvals"
    approval_id = Column(String(64), primary_key=True, default=lambda: f"app_{uuid.uuid4().hex[:8]}")
    work_order_id = Column(String(64), ForeignKey("work_orders.work_order_id"), nullable=False)
    action_class = Column(String(32), default="Approval-required")  # Read-only, Approval-required, Restricted
    requested_by = Column(String(128), default="CoolShield AI Agent")
    approved_by = Column(String(128), nullable=True)
    status = Column(String(32), default="Pending")  # Pending, Approved, Rejected
    rationale = Column(Text, nullable=True)
    created_at = Column(String(64), default=utcnow_str)


# ---------------------------------------------------------
# Post-Intervention Verification Results
# ---------------------------------------------------------
class VerificationResult(Base):
    __tablename__ = "verification_results"
    verification_id = Column(String(64), primary_key=True, default=lambda: f"ver_{uuid.uuid4().hex[:8]}")
    work_order_id = Column(String(64), ForeignKey("work_orders.work_order_id"), nullable=False)
    method = Column(String(64), default="Weather-Adjusted Baseline Comparison")
    pre_intervention_value = Column(Float, nullable=False)
    post_intervention_value = Column(Float, nullable=False)
    weather_adjusted_baseline = Column(Float, nullable=False)
    avoided_resource_units = Column(Float, default=0.0)
    verified_savings_aed = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    verified_at = Column(String(64), default=utcnow_str)


# ---------------------------------------------------------
# Tariffs (DEWA Dubai Electricity & Water Authority)
# ---------------------------------------------------------
class UtilityTariff(Base):
    __tablename__ = "utility_tariffs"
    id = Column(String(32), primary_key=True)  # e.g., DEWA-COM-ELEC, DEWA-COM-WATER
    utility_type = Column(String(32), nullable=False)  # electricity, water
    category = Column(String(32), default="commercial")  # commercial, residential, industrial
    slab_name = Column(String(64), nullable=False)
    slab_min = Column(Float, default=0.0)
    slab_max = Column(Float, default=2000.0)
    rate_aed_per_unit = Column(Float, nullable=False)  # AED per kWh or AED per m3
    fuel_surcharge_aed = Column(Float, default=0.05)  # Electricity fuel surcharge
    sewerage_rate_aed = Column(Float, default=0.0)  # Water sewerage charge
    effective_date = Column(String(64), default="2026-01-01")


# ---------------------------------------------------------
# Audit Trail & Integrations & Customer Validation
# ---------------------------------------------------------
class AuditEvent(Base):
    __tablename__ = "audit_events"
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(64), default=utcnow_str)
    actor = Column(String(128), nullable=False)
    role = Column(String(64), nullable=False)
    action = Column(String(64), nullable=False)  # DETECT, INVESTIGATE, APPROVE, REJECT, ASSIGN, RESOLVE, VERIFY, IMPORT
    resource_type = Column(String(64), nullable=False)
    resource_id = Column(String(64), nullable=False)
    details_json = Column(Text, nullable=True)
    ip_address = Column(String(64), default="127.0.0.1")


class IntegrationConnection(Base):
    __tablename__ = "integration_connections"
    id = Column(String(64), primary_key=True)  # e.g., bms_bacnet_01, mqtt_broker_01
    name = Column(String(128), nullable=False)
    integration_type = Column(String(64), nullable=False)  # BACnet/IP, MQTT, REST, Modbus, Weather API
    endpoint_url = Column(String(256), nullable=False)
    status = Column(String(32), default="Operational")  # Operational, Degraded, Disconnected
    protocol = Column(String(32), default="MQTT 5.0")
    last_sync_time = Column(String(64), default=utcnow_str)
    readings_synced_total = Column(Integer, default=14200)
    error_count = Column(Integer, default=0)
    last_error_message = Column(Text, nullable=True)


class CustomerInterviewRecord(Base):
    __tablename__ = "customer_interview_records"
    id = Column(String(64), primary_key=True, default=lambda: f"cust_{uuid.uuid4().hex[:8]}")
    organization_name = Column(String(128), nullable=False)
    contact_name = Column(String(128), nullable=False)
    contact_role = Column(String(64), nullable=False)
    customer_segment = Column(String(64), nullable=False)  # Commercial, Hospitality, Residential, FM Provider
    reported_problem = Column(Text, nullable=False)
    current_workflow = Column(Text, nullable=False)
    willingness_to_pilot = Column(String(32), default="High")
    target_building = Column(String(128), nullable=False)
    pilot_acceptance_criteria = Column(Text, nullable=False)
    interview_date = Column(String(64), default="2026-10-15")
    status = Column(String(32), default="Pilot Proposed")


def init_database():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI Dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
