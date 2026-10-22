"""
CoolShield AI - Autonomous Agent Orchestrator
Executes the full closed-loop building operations lifecycle:
Observe -> Detect -> Investigate -> Diagnose -> Prioritize -> Recommend -> Approve -> Execute -> Verify -> Learn
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.agents.tools import (
    get_building_context,
    validate_sensor_data,
    run_anomaly_detection,
    generate_diagnostic_report,
    estimate_financial_impact,
    create_work_order,
    record_approval_decision,
    simulate_technician_execution,
    verify_resolution,
    log_agent_audit
)
from backend.app.models.db_models import AnomalyEvent, WorkOrder, Building


class AutonomousBuildingAgent:
    """
    Autonomous Building Operations Agent for Dubai commercial/hospitality properties.
    Orchestrates deterministic tools with safety guardrails.
    """

    def __init__(self, db: Session):
        self.db = db

    def run_full_pipeline(self, building_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes an end-to-end monitoring cycle:
        1. Observe & Validate
        2. Detect Anomaly
        3. Investigate & Diagnose
        4. Prioritize & Estimate Cost
        5. Draft Work Order
        6. Await Human Approval
        """
        # Step 1: Observe & Validate
        target_buildings = [building_id] if building_id else [b.id for b in self.db.query(Building).all()]
        validation_reports = {}
        for b_id in target_buildings:
            validation_reports[b_id] = validate_sensor_data(self.db, b_id)

        # Step 2: Detect
        detected_anomalies = run_anomaly_detection(self.db, building_id)

        # Step 3: Investigate & Diagnose the top detected incident
        investigation_results = []
        for ev in detected_anomalies[:3]:  # Top 3 most critical
            rep = generate_diagnostic_report(self.db, ev["event_id"])
            investigation_results.append({
                "event_id": ev["event_id"],
                "report": rep
            })

        return {
            "monitored_buildings_count": len(target_buildings),
            "data_quality_checks": validation_reports,
            "detected_anomalies_count": len(detected_anomalies),
            "recent_investigations": investigation_results,
            "pipeline_status": "Ready for operator approval"
        }

    def execute_demo_scenario(self, scenario_key: str) -> Dict[str, Any]:
        """
        Executes a deterministic step-by-step walkthrough for demonstration purposes:
        Scenario A: HVAC Efficiency Degradation (DXB-MIX-04)
        Scenario B: Suspected Water Leak (DXB-HOT-02)
        Scenario C: Unexpected Overnight Energy Surge (DXB-OFF-01)
        Scenario D: Faulty Sensor & Data Gap (DXB-RES-03)
        """
        mapping = {
            "A": ("DXB-MIX-04", "cop_estimate"),
            "B": ("DXB-HOT-02", "water_m3"),
            "C": ("DXB-OFF-01", "electricity_kwh"),
            "D": ("DXB-RES-03", "indoor_temp_c")
        }
        b_id, metric = mapping.get(scenario_key.upper(), ("DXB-MIX-04", "cop_estimate"))

        # 1. Run detection
        anomalies = run_anomaly_detection(self.db, b_id)
        target_event = next((a for a in anomalies if a["metric"] == metric), anomalies[0] if anomalies else None)

        if not target_event:
            return {"error": f"No anomaly found for scenario {scenario_key} in {b_id}"}

        # 2. Investigate & Diagnose
        report = generate_diagnostic_report(self.db, target_event["event_id"])

        # 3. Create Draft Work Order
        wo_res = create_work_order(self.db, target_event["event_id"])
        wo_id = wo_res["work_order_id"]

        # Return full evidence dossier
        return {
            "scenario": scenario_key,
            "building_context": get_building_context(self.db, b_id),
            "event": target_event,
            "investigation_report": report,
            "work_order": wo_res,
            "workflow_step": "Awaiting Approval"
        }
