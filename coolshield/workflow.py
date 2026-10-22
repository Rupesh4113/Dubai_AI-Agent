import pandas as pd

def investigate_event(event, readings):
    metric = str(event.get("metric", "electricity_kwh"))
    value = float(event.get("observed_value", 0) or 0)
    baseline = float(event.get("baseline_value", 0) or 0)
    ratio = value / baseline if baseline else None
    evidence = {
        "metric": metric,
        "observed_value": value,
        "baseline_value": baseline,
        "relative_change_pct": round((ratio - 1) * 100, 1) if ratio is not None else None,
        "building_id": str(event.get("building_id")),
        "asset_id": str(event.get("asset_id")),
        "data_source": str(event.get("source_type", "unknown")),
        "interpretation": "Statistical deviation; physical cause is not confirmed."
    }
    if "water" in metric.lower():
        recommendation = "Inspect the water meter and downstream fixtures for abnormal flow; verify onsite before declaring a leak."
    elif "hvac" in metric.lower():
        recommendation = "Inspect HVAC runtime, filters, setpoints, and relevant sensor quality; compare against operating schedule."
    else:
        recommendation = "Compare with occupancy, weather, and operating hours; inspect the meter and major loads before corrective action."
    summary = f'{event.get("anomaly_type","Anomaly")} detected at {event.get("building_id")} on {event.get("timestamp")}. Observed {value:.3f} versus baseline {baseline:.3f}. The cause is a hypothesis requiring verification.'
    impact = max(0.0, value-baseline) * (0.35 if "water" not in metric else 3.5)
    return {"summary":summary, "evidence":evidence, "recommendation":recommendation, "estimated_impact_aed":impact}

def verify_work_order(work_order_id, readings):
    # Demo-only verification stub. Production verification must compare measured post-action data
    # against a pre-agreed baseline with weather/occupancy adjustments and adequate data coverage.
    return {
        "work_order_id": work_order_id,
        "verified": False,
        "result": "Needs real post-intervention evidence",
        "method": "MVP stub: attach before/after readings and a baseline model before marking savings verified."
    }
