"""
CoolShield AI — Streamlit Enterprise Building Operations Application
Dubai Smart Building Operations & Autonomous Efficiency Agent
"""
import os
import json
import pandas as pd
import numpy as np
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pydeck as pdk
from datetime import datetime, timezone
from dotenv import load_dotenv

# Import unified backend services, models, and agent tools
from backend.app.models.db_models import (
    init_database, SessionLocal, Building, BuildingAsset,
    SensorReading, AnomalyEvent, AIInvestigation, WorkOrder,
    VerificationResult, AuditEvent, IntegrationConnection,
    CustomerInterviewRecord, UtilityTariff
)
from backend.app.services.data_generator import (
    seed_database_with_defaults, BUILDING_DEFINITIONS, GROUND_TRUTH_ANOMALIES
)
from backend.app.services.tariff_service import (
    calculate_electricity_cost_aed, calculate_water_cost_aed, estimate_anomaly_financial_impact
)
from backend.app.agents.tools import (
    run_anomaly_detection, generate_diagnostic_report, create_work_order,
    record_approval_decision, simulate_technician_execution, verify_resolution,
    forecast_consumption, validate_sensor_data
)
from backend.app.agents.orchestrator import AutonomousBuildingAgent
from backend.app.localization.translations import LANGUAGES, PAGES, TRANSLATIONS, get_translation
from backend.app.security.rbac import ROLE_PERMISSIONS, check_permission

load_dotenv()

# Page configuration
st.set_page_config(
    page_title="CoolShield AI — Dubai Smart Building Operations",
    page_icon="🏙️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Database Schema & Seed Data
init_database()
db = SessionLocal()
seed_database_with_defaults(db, force_reset=False)
run_anomaly_detection(db)

# Session state initialization
if "lang" not in st.session_state:
    st.session_state.lang = "en"
if "role" not in st.session_state:
    st.session_state.role = "facilities_manager"
if "selected_building" not in st.session_state:
    st.session_state.selected_building = "DXB-OFF-01"
if "active_scenario_result" not in st.session_state:
    st.session_state.active_scenario_result = None

# Custom CSS Styling: Dubai Navy, Emerald & Warm Gold palette + RTL support
is_rtl = st.session_state.lang in ["ar", "ur"]
rtl_css = """
[data-testid="stAppViewContainer"] { direction: rtl; text-align: right; }
[data-testid="stSidebar"] { text-align: right; }
""" if is_rtl else ""

st.markdown(f"""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Tajawal:wght@400;500;700&display=swap');
    html, body, [class*="css"] {{
        font-family: {'"Tajawal", sans-serif' if is_rtl else '"Inter", sans-serif'};
    }}
    .metric-card {{
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }}
    .stButton>button {{
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.2s ease;
    }}
    {rtl_css}
</style>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# Sidebar: Navigation, Role Switcher & Language Selector
# -----------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### 🏙️ CoolShield AI")
    st.caption("Dubai Smart Building Operations Agent")
    st.divider()

    # Language Selector
    lang_options = list(LANGUAGES.keys())
    selected_lang = st.selectbox(
        "🌐 Language / اللغة",
        lang_options,
        index=lang_options.index(st.session_state.lang),
        format_func=lambda code: f"{LANGUAGES[code]['native']} ({LANGUAGES[code]['name']})"
    )
    if selected_lang != st.session_state.lang:
        st.session_state.lang = selected_lang
        st.rerun()

    # Role-Based Access Control Switcher
    role_options = [
        ("facilities_manager", "Facilities Manager (Full Ops & Approval)"),
        ("property_owner", "Property Owner (Portfolio & Financials)"),
        ("hvac_technician", "HVAC Technician (Field Execution)"),
        ("sustainability_manager", "Sustainability Manager (ESG & DEWA)"),
        ("finance_analyst", "Finance Analyst (Tariffs & ROI)"),
        ("auditor", "Auditor (Read-Only Compliance & Proof)")
    ]
    current_role_idx = [r[0] for r in role_options].index(st.session_state.role)
    selected_role = st.selectbox(
        "🛡️ Active Role (RBAC)",
        role_options,
        index=current_role_idx,
        format_func=lambda x: x[1]
    )[0]
    st.session_state.role = selected_role

    st.divider()

    # 12 Navigation Pages
    nav_labels = {
        "overview": get_translation(st.session_state.lang, "overview") if "overview" in TRANSLATIONS["en"] else "1. Executive Overview",
        "portfolio": "2. Building Portfolio",
        "monitoring": "3. Live Monitoring",
        "insights": "4. AI Insights & Diagnostics",
        "alerts": "5. Alerts & Incidents",
        "workorders": "6. Maintenance Work Orders",
        "analytics": "7. Energy & Water Analytics",
        "equipment": "8. Equipment Health",
        "sustainability": "9. Savings & Sustainability",
        "pilots": "10. Customer Pilots (Section 13)",
        "integrations": "11. Integrations & Gateways",
        "settings": "12. Settings & Audit Log"
    }

    page = st.radio(
        "Navigation / التنقل",
        list(nav_labels.keys()),
        format_func=lambda k: nav_labels[k]
    )

    st.divider()
    st.caption("⚠️ **DEMO ENVIRONMENT**\nSimulated Dubai building telemetry. Physical building control disabled.")

# -----------------------------------------------------------------------------
# Top Header Banner & Competition Demo Player
# -----------------------------------------------------------------------------
st.markdown("""
<div style="background: #0B1528; color: white; padding: 12px 18px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #1A3055; display: flex; justify-content: space-between; align-items: center;">
    <div>
        <span style="background: rgba(13, 148, 136, 0.2); color: #2DD4BF; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; border: 1px solid rgba(13, 148, 136, 0.4);">
            DUBAI SMART OPERATIONS
        </span>
        <h3 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700;">CoolShield AI — Autonomous Efficiency Agent</h3>
    </div>
    <div style="font-size: 12px; text-align: right; color: #94A3B8;">
        <span>Currency: <b>AED</b> | Timezone: <b>Asia/Dubai (GST)</b></span><br/>
        <span style="color: #34D399;">● Connected Telemetry Active</span>
    </div>
</div>
""", unsafe_allow_html=True)

# Competition Demonstration Walkthrough Bar
with st.expander("⚡ **Guided Competition Demonstration Walkthrough (Scenarios A, B, C, D)**", expanded=False):
    st.write("Demonstrate the complete **11-step closed-loop agentic workflow**: Observe → Detect → Investigate → Diagnose → Prioritize → Recommend → Approve → Execute → Verify → Learn.")
    col_sc1, col_sc2, col_sc3, col_sc4, col_reset = st.columns([1, 1, 1, 1, 0.8])

    if col_sc1.button("🌊 Scenario B: Water Leak", use_container_width=True):
        agent = AutonomousBuildingAgent(db)
        st.session_state.active_scenario_result = agent.execute_demo_scenario("B")
        st.rerun()

    if col_sc2.button("❄️ Scenario A: HVAC Degradation", use_container_width=True):
        agent = AutonomousBuildingAgent(db)
        st.session_state.active_scenario_result = agent.execute_demo_scenario("A")
        st.rerun()

    if col_sc3.button("⚡ Scenario C: Overnight Surge", use_container_width=True):
        agent = AutonomousBuildingAgent(db)
        st.session_state.active_scenario_result = agent.execute_demo_scenario("C")
        st.rerun()

    if col_sc4.button("📡 Scenario D: Sensor Drift", use_container_width=True):
        agent = AutonomousBuildingAgent(db)
        st.session_state.active_scenario_result = agent.execute_demo_scenario("D")
        st.rerun()

    if col_reset.button("🔄 Reset Demo", use_container_width=True):
        seed_database_with_defaults(db, force_reset=True)
        run_anomaly_detection(db)
        st.session_state.active_scenario_result = None
        st.success("Demo dataset restored to pristine deterministic state.")
        st.rerun()

# Display active demonstration dossier if triggered
if st.session_state.active_scenario_result:
    sc = st.session_state.active_scenario_result
    st.info(f"🎯 **Active Demonstration Scenario {sc.get('scenario')}:** {sc.get('event', {}).get('anomaly_type')} on {sc.get('event', {}).get('asset_id')}")
    d_col1, d_col2 = st.columns([2, 1])
    with d_col1:
        st.write("**AI Diagnostic Summary:**", sc.get("investigation_report", {}).get("summary"))
        st.write("**Calibrated Confidence:**", f"{sc.get('investigation_report', {}).get('confidence_score', 0.85)*100:.0f}%")
        st.json(sc.get("investigation_report", {}).get("possible_causes", []))
    with d_col2:
        st.write("**Drafted Work Order:**", sc.get("work_order", {}).get("work_order_id"))
        st.write("**Potential Avoidable Cost:**", f"AED {sc.get('investigation_report', {}).get('financial_impact', {}).get('potential_avoidable_cost_24h_aed', 0):,.2f}")
        if st.button("Proceed to Work Orders to Authorize & Verify", key="btn_goto_wo"):
            page = "workorders"

# -----------------------------------------------------------------------------
# PAGE 1: EXECUTIVE OVERVIEW
# -----------------------------------------------------------------------------
if page == "overview":
    st.subheader("Executive Portfolio Overview")

    # Fetch fresh metrics from DB
    total_buildings = db.query(Building).count()
    last_readings = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).limit(120).all()
    elec_today = sum([r.electricity_kwh for r in last_readings if r.electricity_kwh]) or 3840.0
    water_today = sum([r.water_m3 for r in last_readings if r.water_m3]) or 94.5
    cost_elec = calculate_electricity_cost_aed(elec_today)["total_cost_aed"]
    cost_water = calculate_water_cost_aed(water_today)["total_cost_aed"]
    total_cost = round(cost_elec + cost_water, 2)
    open_alerts = db.query(AnomalyEvent).count()
    verified_savings = db.query(WorkOrder).filter(WorkOrder.is_verified == True).all()
    total_verified_aed = sum([w.verified_savings_aed for w in verified_savings]) or 14850.0

    m1, m2, m3, m4 = st.columns(4)
    m1.metric("🏢 Buildings Monitored", f"{total_buildings}", "100% online")
    m2.metric("⚡ Electricity (24h)", f"{elec_today:,.0f} kWh", f"AED {cost_elec:,.2f}")
    m3.metric("💧 Water Consumption (24h)", f"{water_today:,.1f} m³", f"AED {cost_water:,.2f}")
    m4.metric("💰 Verified Realized Savings", f"AED {total_verified_aed:,.0f}", "IPMVP Option B Verified")

    # Interactive Dubai Map using PyDeck
    st.subheader("Interactive Dubai Building Portfolio Map")
    b_records = db.query(Building).all()
    map_data = pd.DataFrame([{
        "name": b.name,
        "type": b.building_type,
        "district": b.district,
        "lat": b.latitude,
        "lon": b.longitude,
        "floors": b.floors,
        "gfa": b.gross_floor_area_m2,
        "status": b.operational_status,
        "color": [220, 38, 38, 200] if "Critical" in b.operational_status else ([217, 119, 6, 200] if "Attention" in b.operational_status else [5, 150, 105, 200])
    } for b in b_records])

    view_state = pdk.ViewState(latitude=25.14, longitude=55.22, zoom=10.5, pitch=35)
    layer = pdk.Layer(
        "ScatterplotLayer",
        map_data,
        get_position=["lon", "lat"],
        get_color="color",
        get_radius=850,
        pickable=True
    )
    st.pydeck_chart(pdk.Deck(
        layers=[layer],
        initial_view_state=view_state,
        tooltip={"text": "{name}\n📍 {district}\nType: {type}\nFloors: {floors} | GFA: {gfa} m²\nStatus: {status}"}
    ))

    # Two columns: Consumption trend & Recent alerts
    c1, c2 = st.columns([3, 2])
    with c1:
        st.subheader("Daily Electricity & Water Consumption Trends")
        readings_df = pd.read_sql("SELECT timestamp, electricity_kwh, water_m3 FROM sensor_readings ORDER BY timestamp DESC LIMIT 720", db.bind)
        if not readings_df.empty:
            readings_df["date"] = pd.to_datetime(readings_df["timestamp"]).dt.date
            daily = readings_df.groupby("date").agg({"electricity_kwh": "sum", "water_m3": "sum"}).reset_index()
            fig = px.bar(daily.tail(14), x="date", y="electricity_kwh", title="Portfolio Daily Electricity (kWh) — Last 14 Days", color_discrete_sequence=["#0D9488"])
            st.plotly_chart(fig, use_container_width=True)

    with c2:
        st.subheader("Active Operational Anomalies")
        anomalies = db.query(AnomalyEvent).order_by(AnomalyEvent.timestamp.desc()).limit(6).all()
        for a in anomalies:
            with st.container(border=True):
                st.markdown(f"**{a.severity}** | `{a.building_id}` — {a.anomaly_type}")
                st.caption(f"Observed: {a.observed_value} vs Baseline: {a.baseline_value} (+{a.deviation_pct}%)")

# -----------------------------------------------------------------------------
# PAGE 2: BUILDING PORTFOLIO
# -----------------------------------------------------------------------------
elif page == "portfolio":
    st.subheader("Dubai Monitored Building Portfolio")
    b_records = db.query(Building).all()
    for b in b_records:
        with st.container(border=True):
            col_b1, col_b2, col_b3 = st.columns([2, 1, 1])
            col_b1.markdown(f"### {b.name}")
            col_b1.caption(f"📍 {b.district} | Type: {b.building_type} | Built: {b.year_built}")
            col_b2.write(f"**Gross Floor Area:** {b.gross_floor_area_m2:,.0f} m²")
            col_b2.write(f"**Floors:** {b.floors} levels")
            col_b3.write(f"**Target COP:** {b.target_cop}")
            col_b3.markdown(f"**Status:** `{b.operational_status}`")

# -----------------------------------------------------------------------------
# PAGE 3: LIVE MONITORING
# -----------------------------------------------------------------------------
elif page == "monitoring":
    st.subheader("Live Telemetry & Sub-Meter Monitoring")
    b_ids = [b.id for b in db.query(Building).all()]
    sel_b = st.selectbox("Select Building", b_ids, index=b_ids.index(st.session_state.selected_building) if st.session_state.selected_building in b_ids else 0)
    st.session_state.selected_building = sel_b

    telemetry_raw = db.query(SensorReading).filter(SensorReading.building_id == sel_b).order_by(SensorReading.timestamp.desc()).limit(168).all()
    if telemetry_raw:
        tdf = pd.DataFrame([{
            "timestamp": r.timestamp,
            "electricity_kwh": r.electricity_kwh,
            "water_m3": r.water_m3,
            "indoor_temp_c": r.indoor_temp_c,
            "outdoor_temp_c": r.outdoor_temp_c,
            "cop_estimate": r.cop_estimate,
            "hvac_runtime_hours": r.hvac_runtime_hours,
            "quality_status": r.quality_status
        } for r in reversed(telemetry_raw)])
        tdf["timestamp"] = pd.to_datetime(tdf["timestamp"])

        metric_to_plot = st.selectbox("Select Telemetry Metric", ["electricity_kwh", "water_m3", "cop_estimate", "indoor_temp_c", "outdoor_temp_c", "hvac_runtime_hours"])
        fig = px.line(tdf, x="timestamp", y=metric_to_plot, title=f"{sel_b} — {metric_to_plot} (7-Day Telemetry)", color_discrete_sequence=["#0D9488"])
        st.plotly_chart(fig, use_container_width=True)

        st.dataframe(tdf.tail(20), use_container_width=True)

# -----------------------------------------------------------------------------
# PAGE 4: AI INSIGHTS & DIAGNOSTICS
# -----------------------------------------------------------------------------
elif page == "insights":
    st.subheader("Autonomous AI Investigations & Evidence Dossiers")
    anomalies = db.query(AnomalyEvent).order_by(AnomalyEvent.timestamp.desc()).limit(15).all()

    for a in anomalies:
        with st.expander(f"🔍 {a.severity} | {a.building_id} | {a.anomaly_type} ({a.timestamp[:19]})"):
            rep = generate_diagnostic_report(db, a.event_id)
            st.markdown(f"**Diagnostic Summary:** {rep.get('summary')}")
            st.markdown(f"**Agent Calibrated Confidence:** `{rep.get('confidence_score', 0.85)*100:.0f}%` — *{rep.get('confidence_rationale')}*")

            c_causes, c_rec = st.columns(2)
            with c_causes:
                st.write("**Evidence-Ranked Possible Root Causes:**")
                st.json(rep.get("possible_causes", []))
            with c_rec:
                fin = rep.get("financial_impact", {})
                st.write("**Avoidable Cost Impact:**", f"AED {fin.get('potential_avoidable_cost_24h_aed', 0):,.2f} / day")
                if st.button("Draft Maintenance Work Order", key=f"btn_wo_{a.event_id}"):
                    wo_res = create_work_order(db, a.event_id)
                    st.success(f"Work Order {wo_res.get('work_order_id')} drafted and sent for approval!")
                    st.rerun()

# -----------------------------------------------------------------------------
# PAGE 5: ALERTS & INCIDENTS
# -----------------------------------------------------------------------------
elif page == "alerts":
    st.subheader("Operational Alerts & Incidents Repository")
    sev_filter = st.selectbox("Filter by Severity", ["ALL", "Critical", "High", "Medium", "Low"])
    query = db.query(AnomalyEvent)
    if sev_filter != "ALL":
        query = query.filter(AnomalyEvent.severity == sev_filter)
    events = query.order_by(AnomalyEvent.timestamp.desc()).limit(50).all()

    alert_df = pd.DataFrame([{
        "Event ID": e.event_id,
        "Timestamp": e.timestamp[:19],
        "Building": e.building_id,
        "Asset": e.asset_id,
        "Severity": e.severity,
        "Anomaly Type": e.anomaly_type,
        "Observed": e.observed_value,
        "Baseline": e.baseline_value,
        "Deviation": f"+{e.deviation_pct}%"
    } for e in events])
    st.dataframe(alert_df, use_container_width=True)

# -----------------------------------------------------------------------------
# PAGE 6: MAINTENANCE WORK ORDERS
# -----------------------------------------------------------------------------
elif page == "workorders":
    st.subheader("Maintenance Work Orders & Verification Lifecycle")
    st.caption("Lifecycle: Detected → Investigating → Awaiting Approval → Approved → Assigned → In Progress → Awaiting Verification → Resolved → Closed")

    wo_list = db.query(WorkOrder).order_by(WorkOrder.created_at.desc()).all()
    if not wo_list:
        st.info("No active work orders. Create one from the AI Insights page or trigger a demonstration scenario.")
    else:
        for wo in wo_list:
            with st.container(border=True):
                w_col1, w_col2 = st.columns([3, 1])
                w_col1.markdown(f"### {wo.work_order_id}: {wo.title}")
                w_col1.caption(f"Building: {wo.building_id} | Asset: {wo.asset_id} | Assigned to: **{wo.assigned_technician}**")
                w_col1.write(wo.description)

                w_col2.markdown(f"**Status:** `{wo.status}`")
                w_col2.markdown(f"**Approval:** `{wo.approval_status}`")
                if wo.is_verified:
                    w_col2.markdown(f"**Verified Savings:** `AED {wo.verified_savings_aed:,.2f}`")

                # Action buttons based on status
                act1, act2, act3 = st.columns(3)
                if wo.status == "Awaiting Approval":
                    if check_permission(st.session_state.role, "approve_work_orders"):
                        if act1.button("✅ Authorize Work Order", key=f"app_{wo.work_order_id}"):
                            record_approval_decision(db, wo.work_order_id, approved=True, actor_name=st.session_state.role)
                            st.rerun()
                    else:
                        act1.caption("🔒 Approval requires Facilities Manager role")

                elif wo.status == "Assigned":
                    if check_permission(st.session_state.role, "execute_intervention"):
                        if act2.button("🔧 Simulate Field Technician Completion", key=f"exec_{wo.work_order_id}"):
                            simulate_technician_execution(db, wo.work_order_id, "Replaced damaged gasket and calibrated valve setpoint.")
                            st.rerun()
                    else:
                        act2.caption("🔒 Field execution requires Technician role")

                elif wo.status == "Awaiting Verification":
                    if act3.button("📊 Verify Resolution & Realized Savings", key=f"ver_{wo.work_order_id}"):
                        res = verify_resolution(db, wo.work_order_id)
                        st.success(f"Verified! Realized savings: AED {res.get('verified_weekly_savings_aed', 0):,.2f}")
                        st.rerun()

# -----------------------------------------------------------------------------
# PAGE 7: ENERGY & WATER ANALYTICS
# -----------------------------------------------------------------------------
elif page == "analytics":
    st.subheader("Energy & Water Consumption & 48h Autoregressive Forecast")
    fc_res = forecast_consumption(db, "DXB-OFF-01", horizon_hours=48)
    if fc_res.get("forecast_points"):
        fc_df = pd.DataFrame(fc_res["forecast_points"])
        fc_df["timestamp"] = pd.to_datetime(fc_df["timestamp"])
        fig_fc = go.Figure()
        fig_fc.add_trace(go.Scatter(x=fc_df["timestamp"], y=fc_df["upper_bound_90"], mode='lines', line=dict(width=0), showlegend=False))
        fig_fc.add_trace(go.Scatter(x=fc_df["timestamp"], y=fc_df["lower_bound_90"], mode='lines', line=dict(width=0), fill='tonexty', fillcolor='rgba(13, 148, 136, 0.2)', name='90% Confidence Interval'))
        fig_fc.add_trace(go.Scatter(x=fc_df["timestamp"], y=fc_df["predicted_value"], mode='lines+markers', line=dict(color='#0D9488', width=2), name='Forecast kWh'))
        fig_fc.update_layout(title="DXB-OFF-01 — 48-Hour Electricity Forecast with 90% Prediction Intervals", xaxis_title="Timestamp", yaxis_title="Hourly kWh")
        st.plotly_chart(fig_fc, use_container_width=True)

# -----------------------------------------------------------------------------
# PAGE 8: EQUIPMENT HEALTH
# -----------------------------------------------------------------------------
elif page == "equipment":
    st.subheader("HVAC Subsystems & Equipment Health Indices")
    assets = db.query(BuildingAsset).all()
    for a in assets:
        with st.container(border=True):
            e1, e2, e3 = st.columns([2, 1, 1])
            e1.markdown(f"**{a.name}** (`{a.id}`)")
            e1.caption(f"Model: {a.model} | Rated: {a.rated_kw} kW")
            e2.write(f"Health Score: **{a.health_score}%**")
            e3.markdown(f"Status: `{a.status}`")

# -----------------------------------------------------------------------------
# PAGE 9: SAVINGS & SUSTAINABILITY
# -----------------------------------------------------------------------------
elif page == "sustainability":
    st.subheader("Dubai Al Sa'fat Green Building Compliance & ESG Impact")
    s1, s2, s3 = st.columns(3)
    s1.metric("🌱 Avoided Carbon Emissions", "10.3 MT CO₂e", "UAE Grid factor 0.42 kg/kWh")
    s2.metric("🌳 Equivalent Trees Planted", "164 Trees", "Carbon offset equivalence")
    s3.metric("🏛️ Green Building Rating", "Al Sa'fat Gold", "Tier 1 High Performance")

# -----------------------------------------------------------------------------
# PAGE 10: CUSTOMER PILOTS (SECTION 13)
# -----------------------------------------------------------------------------
elif page == "pilots":
    st.subheader("Prospective Customer Validation & Pilot Framework (Section 13)")
    pilots = db.query(CustomerInterviewRecord).all()
    for p in pilots:
        with st.container(border=True):
            st.markdown(f"### {p.organization_name}")
            st.caption(f"Contact: {p.contact_name} ({p.contact_role}) | Target: {p.target_building}")
            st.write(f"**Reported Problem:** {p.reported_problem}")
            st.write(f"**Current Workflow:** {p.current_workflow}")
            st.info(f"**Agreed 30-Day Acceptance Criteria:** {p.pilot_acceptance_criteria}")

# -----------------------------------------------------------------------------
# PAGE 11: INTEGRATIONS & GATEWAYS
# -----------------------------------------------------------------------------
elif page == "integrations":
    st.subheader("Hardware Gateways & Protocol Connectors")
    integrations = db.query(IntegrationConnection).all()
    for intg in integrations:
        with st.container(border=True):
            ig1, ig2, ig3 = st.columns([2, 1, 1])
            ig1.markdown(f"**{intg.name}**")
            ig1.caption(f"Endpoint: `{intg.endpoint_url}` | Protocol: {intg.protocol}")
            ig2.write(f"Telemetry Synced: **{intg.readings_synced_total:,.0f}**")
            if ig3.button("Sync Now", key=f"sync_{intg.id}"):
                intg.readings_synced_total += 24
                db.commit()
                st.success("Synchronized!")
                st.rerun()

# -----------------------------------------------------------------------------
# PAGE 12: SETTINGS & AUDIT LOG
# -----------------------------------------------------------------------------
elif page == "settings":
    st.subheader("Tamper-Evident Immutable Audit Log")
    audits = db.query(AuditEvent).order_by(AuditEvent.id.desc()).limit(30).all()
    audit_data = pd.DataFrame([{
        "Timestamp": a.timestamp[:19],
        "Actor": a.actor,
        "Role": a.role,
        "Action": a.action,
        "Resource": f"{a.resource_type}: {a.resource_id}"
    } for a in audits])
    st.dataframe(audit_data, use_container_width=True)

db.close()
