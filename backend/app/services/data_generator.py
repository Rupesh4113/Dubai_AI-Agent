"""
CoolShield AI - Deterministic Synthetic Building Data Generator
Generates realistic 90-day hourly telemetry for 5 Dubai commercial/hospitality/residential facilities.
Includes ground-truth injected operational anomalies for Scenarios A, B, C, and D.
"""
import json
import os
import uuid
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.db_models import (
    Building, BuildingAsset, SensorReading, UtilityTariff,
    IntegrationConnection, CustomerInterviewRecord, User
)

BUILDING_DEFINITIONS = [
    {
        "id": "DXB-OFF-01",
        "name": "Burj Al-Amal Commercial Tower",
        "building_type": "Commercial Office",
        "district": "Downtown Dubai / DIFC",
        "latitude": 25.2048,
        "longitude": 55.2708,
        "gross_floor_area_m2": 62000.0,
        "floors": 48,
        "year_built": 2019,
        "cooling_system_type": "District Cooling + Variable Air Volume (VAV)",
        "operational_status": "Attention Required",
        "target_cop": 4.5,
        "baseline_kwh_per_m2_day": 0.68,
        "baseline_water_m3_per_day": 18.5,
        "assets": [
            {"id": "DXB-OFF-01-CH-01", "name": "Centrifugal Chiller 1 (Carrier)", "asset_type": "Chiller", "rated_kw": 480.0},
            {"id": "DXB-OFF-01-AHU-04", "name": "Podium Air Handling Unit 4", "asset_type": "AHU", "rated_kw": 45.0},
            {"id": "DXB-OFF-01-PUMP-02", "name": "Chilled Water Primary Pump 2", "asset_type": "Pump", "rated_kw": 30.0},
            {"id": "DXB-OFF-01-MTR-MAIN", "name": "Main DEWA Electric Fiscal Meter", "asset_type": "Sub-meter", "rated_kw": 3200.0},
        ]
    },
    {
        "id": "DXB-HOT-02",
        "name": "Palm Oasis Resort & Luxury Spa",
        "building_type": "Hotel & Hospitality",
        "district": "Palm Jumeirah",
        "latitude": 25.1124,
        "longitude": 55.1390,
        "gross_floor_area_m2": 45000.0,
        "floors": 18,
        "year_built": 2021,
        "cooling_system_type": "Water-Cooled Centrifugal Chillers",
        "operational_status": "Critical Alert",
        "target_cop": 4.2,
        "baseline_kwh_per_m2_day": 0.85,
        "baseline_water_m3_per_day": 62.0,
        "assets": [
            {"id": "DXB-HOT-02-CH-01", "name": "Water-Cooled Chiller Unit 1", "asset_type": "Chiller", "rated_kw": 520.0},
            {"id": "DXB-HOT-02-CT-02", "name": "Induced Draft Cooling Tower 2", "asset_type": "Cooling Tower", "rated_kw": 35.0},
            {"id": "DXB-HOT-02-WTR-BOOST", "name": "Domestic Water Booster Station", "asset_type": "Water Booster Pump", "rated_kw": 22.0},
            {"id": "DXB-HOT-02-MTR-WATER", "name": "Main Potable Water Meter", "asset_type": "Sub-meter", "rated_kw": 0.0},
        ]
    },
    {
        "id": "DXB-RES-03",
        "name": "Marina Bay Horizon Luxury Residences",
        "building_type": "Residential Tower",
        "district": "Dubai Marina",
        "latitude": 25.0805,
        "longitude": 55.1403,
        "gross_floor_area_m2": 54000.0,
        "floors": 56,
        "year_built": 2020,
        "cooling_system_type": "District Cooling + FCU Distribution",
        "operational_status": "Sensor Degradation",
        "target_cop": 4.1,
        "baseline_kwh_per_m2_day": 0.52,
        "baseline_water_m3_per_day": 42.0,
        "assets": [
            {"id": "DXB-RES-03-ETS-01", "name": "Energy Transfer Station Heat Exchanger", "asset_type": "Chiller", "rated_kw": 380.0},
            {"id": "DXB-RES-03-FAHU-01", "name": "Fresh Air Handling Unit (Roof)", "asset_type": "AHU", "rated_kw": 55.0},
            {"id": "DXB-RES-03-TEMP-L28", "name": "Floor 28 Zone Temperature Probe", "asset_type": "Sensor", "rated_kw": 0.1},
        ]
    },
    {
        "id": "DXB-MIX-04",
        "name": "Al-Wasl Promenade Shopping & Suites",
        "building_type": "Mixed-Use Commercial & Retail",
        "district": "City Walk / Al Wasl",
        "latitude": 25.2084,
        "longitude": 55.2612,
        "gross_floor_area_m2": 38000.0,
        "floors": 6,
        "year_built": 2018,
        "cooling_system_type": "Air-Cooled Screw Chillers",
        "operational_status": "Efficiency Degradation",
        "target_cop": 3.8,
        "baseline_kwh_per_m2_day": 0.72,
        "baseline_water_m3_per_day": 24.0,
        "assets": [
            {"id": "DXB-MIX-04-CH-02", "name": "Air-Cooled Screw Chiller 2", "asset_type": "Chiller", "rated_kw": 410.0},
            {"id": "DXB-MIX-04-AHU-MALL", "name": "Atrium Mall Primary AHU", "asset_type": "AHU", "rated_kw": 60.0},
            {"id": "DXB-MIX-04-PUMP-SEC", "name": "Secondary Loop Distribution Pump", "asset_type": "Pump", "rated_kw": 25.0},
        ]
    },
    {
        "id": "DXB-WHS-05",
        "name": "Dubai South Aerospace Logistics Hub",
        "building_type": "Logistics & Temperature Controlled Warehouse",
        "district": "Dubai South / DWC",
        "latitude": 24.8966,
        "longitude": 55.1611,
        "gross_floor_area_m2": 28000.0,
        "floors": 2,
        "year_built": 2022,
        "cooling_system_type": "Direct Expansion Rooftop DX Packages",
        "operational_status": "Optimal",
        "target_cop": 3.6,
        "baseline_kwh_per_m2_day": 0.44,
        "baseline_water_m3_per_day": 8.0,
        "assets": [
            {"id": "DXB-WHS-05-DX-01", "name": "Cold Storage DX Unit A", "asset_type": "Chiller", "rated_kw": 280.0},
            {"id": "DXB-WHS-05-VENT-01", "name": "High Volume Low Speed Fan Array", "asset_type": "AHU", "rated_kw": 18.0},
        ]
    }
]

GROUND_TRUTH_ANOMALIES = [
    {
        "scenario_key": "Scenario A",
        "title": "HVAC Efficiency Degradation",
        "building_id": "DXB-MIX-04",
        "asset_id": "DXB-MIX-04-CH-02",
        "metric": "cop_estimate",
        "anomaly_type": "Chiller COP Degradation / Fouled Condenser",
        "severity": "High",
        "start_hour_offset": 1400,
        "duration_hours": 96,
        "multiplier": 0.65,
        "description": "Gradual drop in Coefficient of Performance (COP) from 3.8 to 2.45 due to condenser coil scaling and dust accumulation, leading to 35% higher electric draw per ton of refrigeration.",
        "expected_action": "Condenser coil chemical washing and refrigerant pressure check."
    },
    {
        "scenario_key": "Scenario B",
        "title": "Suspected Major Water Leak",
        "building_id": "DXB-HOT-02",
        "asset_id": "DXB-HOT-02-WTR-BOOST",
        "metric": "water_m3",
        "anomaly_type": "Abnormal Continuous Water Flow / Pipe Rupture",
        "severity": "Critical",
        "start_hour_offset": 1000,
        "duration_hours": 36,
        "multiplier": 4.8,
        "description": "Uninterrupted nighttime water flow surge of ~4.8x normal baseline in the hotel spa basement piping loop, wasting ~28 m3 per day.",
        "expected_action": "Emergency isolation of Spa Zone Valve B-04 and physical pipe inspection."
    },
    {
        "scenario_key": "Scenario C",
        "title": "Unexpected Overnight Energy Consumption",
        "building_id": "DXB-OFF-01",
        "asset_id": "DXB-OFF-01-AHU-04",
        "metric": "electricity_kwh",
        "anomaly_type": "After-Hours HVAC Schedule Override / Stuck Damper",
        "severity": "High",
        "start_hour_offset": 48,
        "duration_hours": 24,
        "multiplier": 2.1,
        "description": "Commercial office VAV and AHU system running at 100% capacity between 11 PM and 5 AM during an un-cleared manual BMS override.",
        "expected_action": "BMS schedule reset and damper actuator recalibration."
    },
    {
        "scenario_key": "Scenario D",
        "title": "Faulty Temperature Sensor & Data Gap",
        "building_id": "DXB-RES-03",
        "asset_id": "DXB-RES-03-TEMP-L28",
        "metric": "indoor_temp_c",
        "anomaly_type": "Sensor Drift & Intermittent Communication Packet Loss",
        "severity": "Medium",
        "start_hour_offset": 1720,
        "duration_hours": 48,
        "multiplier": 1.4,
        "description": "Floor 28 Modbus temperature transmitter calibration drifting by +7.5°C with 42% missing packet telemetry, falsely triggering localized over-cooling.",
        "expected_action": "Recalibrate or replace Modbus RTU temperature transmitter."
    }
]


def generate_synthetic_dataset(days: int = 90, seed: int = 42) -> pd.DataFrame:
    """
    Generates deterministic hourly readings for the 5 Dubai buildings.
    Accurately simulates diurnal weather patterns in Dubai (24°C - 44°C),
    occupancy variations, chilled water heat transfer delta T, and controlled anomalies.
    """
    rng = np.random.default_rng(seed)
    end_time = pd.Timestamp.now(tz="UTC").floor("h")
    total_hours = days * 24
    timestamps = pd.date_range(end=end_time, periods=total_hours, freq="h")

    all_readings = []

    for bdef in BUILDING_DEFINITIONS:
        bid = bdef["id"]
        btype = bdef["building_type"]
        gfa = bdef["gross_floor_area_m2"]
        target_cop = bdef["target_cop"]

        # Base scale based on floor area and building type
        type_load_factor = {
            "Commercial Office": 1.35,
            "Hotel & Hospitality": 1.75,
            "Residential Tower": 1.10,
            "Mixed-Use Commercial & Retail": 1.55,
            "Logistics & Temperature Controlled Warehouse": 0.85
        }.get(btype, 1.2)

        primary_asset = bdef["assets"][0]["id"]

        for i, ts in enumerate(timestamps):
            hour = ts.hour
            weekday = ts.dayofweek < 5  # Mon-Fri (UAE standard business week since 2022)

            # Dubai ambient temperature simulation: Diurnal sine wave + noise
            # Peaks around 14:00 (hour 14), lowest around 05:00
            diurnal_cycle = np.sin((hour - 8) * np.pi / 12)
            seasonal_drift = 2.0 * np.sin(i / (total_hours) * np.pi)
            outdoor_temp = 32.0 + 8.5 * diurnal_cycle + seasonal_drift + float(rng.normal(0, 0.8))
            outdoor_temp = round(max(22.0, min(48.5, outdoor_temp)), 2)

            # Occupancy model
            if btype == "Commercial Office":
                occ = 0.82 if (8 <= hour <= 18 and weekday) else 0.12
            elif btype == "Hotel & Hospitality":
                occ = 0.72 + 0.15 * np.cos((hour - 21) * np.pi / 12)  # evening peak
            elif btype == "Residential Tower":
                occ = 0.85 if (hour >= 19 or hour <= 7 or not weekday) else 0.35
            elif btype == "Mixed-Use Commercial & Retail":
                occ = 0.78 if (10 <= hour <= 23) else 0.15
            else:  # Warehouse
                occ = 0.55 if (6 <= hour <= 20) else 0.20
            occ = round(max(0.05, min(1.0, occ + float(rng.normal(0, 0.03)))), 2)

            # Indoor temperature setpoint control: target ~23.0°C with small variation
            indoor_temp = 23.0 + float(rng.normal(0, 0.4))
            indoor_temp = round(max(20.5, min(26.5, indoor_temp)), 2)

            # Cooling delta T and COP
            cop = target_cop + float(rng.normal(0, 0.12))
            cooling_delta_temp = max(1.0, outdoor_temp - indoor_temp)
            hvac_runtime = min(1.0, max(0.15, (0.45 + (cooling_delta_temp / 35.0) * 0.4 + occ * 0.15)))

            # Electricity kWh calculation (HVAC + base lighting/plug loads)
            base_elec_rate = (gfa / 1000.0) * type_load_factor * 0.45
            thermal_elec = (cooling_delta_temp * 1.8 + occ * 12.0) * (gfa / 10000.0)
            elec_kwh = max(2.0, (base_elec_rate + thermal_elec) + float(rng.normal(0, 2.5)))

            # Water m3 calculation
            base_water = (gfa / 20000.0) * (0.3 + occ * 0.9)
            water_m3 = max(0.02, base_water + float(rng.normal(0, 0.03)))

            # Chilled water supply and return
            hvac_supply = 7.0 + float(rng.normal(0, 0.2))
            hvac_return = hvac_supply + 5.5 * hvac_runtime + float(rng.normal(0, 0.3))

            source_type = "simulated"
            quality_status = "valid"
            quality_notes = None

            # Apply Injected Anomalies
            # Scenario A: HVAC efficiency degradation at DXB-MIX-04
            if bid == "DXB-MIX-04" and 1400 <= i < 1496:
                cop *= 0.65  # COP degrades
                elec_kwh *= 1.35  # Consumes 35% more power
                hvac_return = hvac_supply + 3.2  # Low delta T syndrome

            # Scenario B: Suspected water leak at DXB-HOT-02
            if bid == "DXB-HOT-02" and 1000 <= i < 1036:
                water_m3 *= 4.8  # 4.8x normal water flow

            # Scenario C: Overnight HVAC schedule override at DXB-OFF-01
            if bid == "DXB-OFF-01" and 48 <= (i % (24 * 7)) <= 68 and (hour >= 23 or hour <= 5):
                elec_kwh *= 2.1
                hvac_runtime = 0.98

            # Scenario D: Faulty sensor and missing data at DXB-RES-03
            if bid == "DXB-RES-03" and 1720 <= i < 1768:
                if i % 3 == 0:
                    quality_status = "suspect"
                    quality_notes = "Modbus transmission timeout / dropped packet"
                    indoor_temp = None
                else:
                    indoor_temp = round(indoor_temp + 7.5, 2)  # Sensor drift +7.5 C
                    quality_status = "suspect"
                    quality_notes = "Sensor calibration out-of-range drift detected"

            all_readings.append({
                "timestamp": ts.isoformat(),
                "building_id": bid,
                "asset_id": primary_asset,
                "electricity_kwh": round(elec_kwh, 2) if elec_kwh is not None else None,
                "water_m3": round(water_m3, 4) if water_m3 is not None else None,
                "indoor_temp_c": indoor_temp,
                "outdoor_temp_c": outdoor_temp,
                "hvac_supply_temp_c": round(hvac_supply, 2),
                "hvac_return_temp_c": round(hvac_return, 2),
                "hvac_runtime_hours": round(hvac_runtime, 3),
                "occupancy_estimate": occ,
                "cop_estimate": round(max(1.5, cop), 2),
                "source_type": source_type,
                "quality_status": quality_status,
                "quality_notes": quality_notes
            })

    return pd.DataFrame(all_readings)


def seed_database_with_defaults(db: Session, force_reset: bool = False):
    """
    Populates buildings, assets, tariffs, initial user accounts, integration adapters,
    customer validation records, and the 90-day telemetry dataset.
    """
    existing_buildings = db.query(Building).count()
    if existing_buildings > 0 and not force_reset:
        return

    if force_reset:
        # Clear existing rows
        db.query(SensorReading).delete()
        db.query(BuildingAsset).delete()
        db.query(Building).delete()
        db.query(UtilityTariff).delete()
        db.query(User).delete()
        db.query(IntegrationConnection).delete()
        db.query(CustomerInterviewRecord).delete()
        db.commit()

    # 1. Seed Users with RBAC roles
    users = [
        User(id="usr_owner", email="owner@dubairealestate.ae", full_name="Sultan Al-Ghurair", role="property_owner", organization="Dubai Commercial Properties"),
        User(id="usr_fm", email="fm@coolshield.ae", full_name="Ahmed Al-Maktoum", role="facilities_manager", organization="Al-Wasl Asset Management"),
        User(id="usr_tech", email="tech@coolshield.ae", full_name="Tariq Mansoor", role="hvac_technician", organization="Emirates FM Technical Services"),
        User(id="usr_energy", email="sustainability@coolshield.ae", full_name="Dr. Noor Al-Nuaimi", role="sustainability_manager", organization="Dubai Clean Energy Hub"),
        User(id="usr_analyst", email="finance@coolshield.ae", full_name="Zayd Farooq", role="finance_analyst", organization="Gulf Real Estate Investment"),
        User(id="usr_auditor", email="auditor@pwc.ae", full_name="Fatima Al-Hashemi", role="auditor", organization="Independent ESG Assurance"),
    ]
    db.add_all(users)

    # 2. Seed DEWA Tariffs
    tariffs = [
        UtilityTariff(id="DEWA-COM-ELEC-S1", utility_type="electricity", category="commercial", slab_name="Commercial Slab 1 (0-2000 kWh)", slab_min=0, slab_max=2000, rate_aed_per_unit=0.23, fuel_surcharge_aed=0.05),
        UtilityTariff(id="DEWA-COM-ELEC-S2", utility_type="electricity", category="commercial", slab_name="Commercial Slab 2 (2001-4000 kWh)", slab_min=2001, slab_max=4000, rate_aed_per_unit=0.28, fuel_surcharge_aed=0.05),
        UtilityTariff(id="DEWA-COM-ELEC-S3", utility_type="electricity", category="commercial", slab_name="Commercial Slab 3 (4001-6000 kWh)", slab_min=4001, slab_max=6000, rate_aed_per_unit=0.32, fuel_surcharge_aed=0.05),
        UtilityTariff(id="DEWA-COM-ELEC-S4", utility_type="electricity", category="commercial", slab_name="Commercial Slab 4 (6001+ kWh)", slab_min=6001, slab_max=99999999, rate_aed_per_unit=0.38, fuel_surcharge_aed=0.05),
        UtilityTariff(id="DEWA-COM-WTR-S1", utility_type="water", category="commercial", slab_name="Commercial Potable Water (0-10000 IG)", slab_min=0, slab_max=10000, rate_aed_per_unit=0.035, sewerage_rate_aed=0.010),
        UtilityTariff(id="DEWA-COM-WTR-S2", utility_type="water", category="commercial", slab_name="Commercial Potable Water (10000+ IG)", slab_min=10001, slab_max=99999999, rate_aed_per_unit=0.045, sewerage_rate_aed=0.015),
    ]
    db.add_all(tariffs)

    # 3. Seed Buildings & Assets
    for bdef in BUILDING_DEFINITIONS:
        b = Building(
            id=bdef["id"],
            name=bdef["name"],
            building_type=bdef["building_type"],
            district=bdef["district"],
            latitude=bdef["latitude"],
            longitude=bdef["longitude"],
            gross_floor_area_m2=bdef["gross_floor_area_m2"],
            floors=bdef["floors"],
            year_built=bdef["year_built"],
            cooling_system_type=bdef["cooling_system_type"],
            operational_status=bdef["operational_status"],
            target_cop=bdef["target_cop"],
            baseline_kwh_per_m2_day=bdef["baseline_kwh_per_m2_day"],
            baseline_water_m3_per_day=bdef["baseline_water_m3_per_day"]
        )
        db.add(b)
        for adef in bdef["assets"]:
            asset = BuildingAsset(
                id=adef["id"],
                building_id=bdef["id"],
                name=adef["name"],
                asset_type=adef["asset_type"],
                rated_kw=adef.get("rated_kw", 100.0),
                status="Running",
                health_score=92.0 if "MIX-04" not in adef["id"] else 68.0
            )
            db.add(asset)

    # 4. Seed Integrations
    integrations = [
        IntegrationConnection(id="bms_bacnet_downtown", name="Downtown BMS BACnet/IP Gateway", integration_type="BACnet/IP", endpoint_url="bacnet://10.240.12.10:47808", status="Operational", protocol="BACnet MSTP/IP", readings_synced_total=32840, error_count=0),
        IntegrationConnection(id="mqtt_iot_palm", name="Palm Oasis LoRaWAN / MQTT Broker", integration_type="MQTT", endpoint_url="mqtts://broker.coolshield.ae:8883", status="Operational", protocol="MQTT 5.0 TLS", readings_synced_total=48120, error_count=2),
        IntegrationConnection(id="dewa_smart_meter_api", name="DEWA Smart Fiscal Meter Telemetry", integration_type="REST", endpoint_url="https://api.dewa.gov.ae/v2/smartgrid", status="Operational", protocol="HTTPS/REST", readings_synced_total=19400, error_count=0),
        IntegrationConnection(id="ncm_weather_radar", name="UAE National Center of Meteorology (NCM) Feed", integration_type="Weather API", endpoint_url="https://api.ncm.ae/v1/forecast/dubai", status="Operational", protocol="REST JSON", readings_synced_total=2160, error_count=0),
    ]
    db.add_all(integrations)

    # 5. Seed Prospective Customer Validation Record (Section 13)
    pilot = CustomerInterviewRecord(
        id="cust_emaar_pilot_01",
        organization_name="Emaar Hospitality & Asset Operations",
        contact_name="Khalid Al-Shaikh",
        contact_role="Director of Property Engineering",
        customer_segment="Hospitality & Mixed-Use Commercial",
        reported_problem="Unexplained high chiller energy during summer night shoulder hours and delayed detection of concealed water booster leaks in guest towers.",
        current_workflow="Manual monthly DEWA utility bill comparison and reactive tenant maintenance tickets via legacy SAP PM.",
        willingness_to_pilot="High - Ready for 30-day proof-of-concept",
        target_building="Downtown Luxury Residences Tower B",
        pilot_acceptance_criteria="Detect at least 80% of abnormal energy/water events within 2 hours; provide evidence-backed work orders with estimated AED savings.",
        interview_date="2026-10-14",
        status="Proposal Under Review"
    )
    db.add(pilot)

    db.commit()

    # 6. Generate and save synthetic sensor readings
    df = generate_synthetic_dataset(days=90, seed=42)
    records = df.to_dict(orient="records")
    # Batch insert to avoid SQLite parameter limit
    chunk_size = 500
    for idx in range(0, len(records), chunk_size):
        chunk = [SensorReading(**r) for r in records[idx:idx + chunk_size]]
        db.add_all(chunk)
        db.commit()

    # 7. Write Dataset Manifest to disk
    manifest_path = os.path.join("data", "manifests", "dataset_manifest.json")
    os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
    manifest_data = {
        "dataset_name": "CoolShield AI Synthetic Dubai Building Telemetry",
        "version": "1.0.0",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "random_seed": 42,
        "duration_days": 90,
        "sample_interval": "1 hour",
        "total_readings": len(df),
        "buildings_count": len(BUILDING_DEFINITIONS),
        "buildings": [b["id"] for b in BUILDING_DEFINITIONS],
        "ground_truth_anomalies": GROUND_TRUTH_ANOMALIES,
        "limitations": [
            "Data is synthetically generated for simulation and competition demonstration only.",
            "Weather profiles simulate typical Dubai climate conditions (22C to 48C) with seasonal drift.",
            "Physical building control interfaces are disabled; all work orders require human operator approval."
        ]
    }
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)
