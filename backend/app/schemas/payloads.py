"""
CoolShield AI - Pydantic Request & Response Schemas
Provides strict validation, typing, and OpenAPI documentation for all building operations APIs.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class SensorReadingIngest(BaseModel):
    timestamp: str
    building_id: str = Field(min_length=1, max_length=100)
    asset_id: str = Field(min_length=1, max_length=100)
    electricity_kwh: Optional[float] = Field(default=None, ge=0)
    water_m3: Optional[float] = Field(default=None, ge=0)
    indoor_temp_c: Optional[float] = None
    outdoor_temp_c: Optional[float] = None
    hvac_supply_temp_c: Optional[float] = None
    hvac_return_temp_c: Optional[float] = None
    hvac_runtime_hours: Optional[float] = Field(default=None, ge=0, le=24)
    occupancy_estimate: Optional[float] = Field(default=None, ge=0, le=1)
    cop_estimate: Optional[float] = Field(default=None, ge=0, le=10)
    building_type: Optional[str] = "Commercial Office"


class WorkOrderCreateRequest(BaseModel):
    event_id: str
    title: Optional[str] = None
    assigned_team: Optional[str] = "HVAC & Plumbing Mobile Response Team"


class ApprovalDecisionRequest(BaseModel):
    approved: bool
    rationale: Optional[str] = ""
    actor_name: Optional[str] = "Ahmed Al-Maktoum (Facilities Manager)"


class TechnicianExecutionRequest(BaseModel):
    technician_notes: str = Field(min_length=5, description="Findings and actions taken by the field technician")


class CustomerInterviewCreateRequest(BaseModel):
    organization_name: str
    contact_name: str
    contact_role: str
    customer_segment: str
    reported_problem: str
    current_workflow: str
    target_building: str
    pilot_acceptance_criteria: str
    willingness_to_pilot: Optional[str] = "High"


class BuildingCreateRequest(BaseModel):
    id: str = Field(min_length=3, max_length=32)
    name: str = Field(min_length=3, max_length=128)
    building_type: str
    district: str
    latitude: float
    longitude: float
    gross_floor_area_m2: float
    floors: int = 20
    year_built: int = 2020
    cooling_system_type: str = "District Cooling + VAV"
    target_cop: float = 4.0
