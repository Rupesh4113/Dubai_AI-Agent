import os
import pandas as pd
import streamlit as st
import plotly.express as px
from dotenv import load_dotenv
from coolshield.db import init_db, load_readings, save_readings, list_work_orders, create_work_order, update_work_order
from coolshield.analytics import detect_anomalies, build_kpis, make_synthetic_readings
from coolshield.i18n import t, LANGUAGES
from coolshield.workflow import investigate_event, verify_work_order

load_dotenv()
st.set_page_config(page_title="CoolShield AI", page_icon="🏙️", layout="wide")
init_db()

if "lang" not in st.session_state:
    st.session_state.lang = "en"
with st.sidebar:
    st.markdown("## 🏙️ CoolShield AI")
    st.caption("Smart Building Operations")
    selected = st.selectbox("Language / اللغة", list(LANGUAGES), index=list(LANGUAGES).index(st.session_state.lang),
                             format_func=lambda x: LANGUAGES[x])
    st.session_state.lang = selected
    page = st.radio(t(selected, "navigation"), [
        t(selected, "overview"), t(selected, "monitoring"), t(selected, "insights"),
        t(selected, "workorders"), t(selected, "data"), t(selected, "settings")
    ])
    st.divider()
    st.caption(t(selected, "demo_banner"))

rtl = st.session_state.lang == "ar"
if rtl:
    st.markdown("""<style>
    [data-testid="stAppViewContainer"] { direction: rtl; }
    [data-testid="stSidebar"] * { text-align: right; }
    </style>""", unsafe_allow_html=True)

readings = load_readings()
if readings.empty:
    readings = make_synthetic_readings(days=90, seed=17)
    save_readings(readings)

anomalies = detect_anomalies(readings)
kpis = build_kpis(readings, anomalies)

st.title(page)
st.caption(t(selected, "demo_banner"))

if page == t(selected, "overview"):
    a,b,c,d = st.columns(4)
    a.metric(t(selected, "buildings"), int(readings["building_id"].nunique()))
    b.metric(t(selected, "electricity"), f'{readings["electricity_kwh"].tail(24).sum():,.0f} kWh')
    c.metric(t(selected, "water"), f'{readings["water_m3"].tail(24).sum():,.1f} m³')
    d.metric(t(selected, "open_alerts"), int(len(anomalies)))
    st.subheader(t(selected, "consumption_trends"))
    daily = readings.groupby(pd.to_datetime(readings["timestamp"]).dt.date, as_index=False).agg(
        electricity_kwh=("electricity_kwh","sum"), water_m3=("water_m3","sum"))
    fig = px.line(daily, x="timestamp", y="electricity_kwh", title=t(selected, "electricity_trend"))
    st.plotly_chart(fig, use_container_width=True)
    st.subheader(t(selected, "recent_alerts"))
    st.dataframe(anomalies.head(15), use_container_width=True, hide_index=True)

elif page == t(selected, "monitoring"):
    buildings = sorted(readings["building_id"].unique())
    building = st.selectbox(t(selected, "building"), buildings)
    df = readings[readings["building_id"] == building].copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    metric = st.selectbox("Metric", ["electricity_kwh", "water_m3", "indoor_temp_c", "outdoor_temp_c", "hvac_runtime_hours"])
    st.plotly_chart(px.line(df, x="timestamp", y=metric, title=f"{building} — {metric}"), use_container_width=True)
    st.dataframe(df.tail(100), use_container_width=True, hide_index=True)

elif page == t(selected, "insights"):
    st.info(t(selected, "simulated_notice"))
    if anomalies.empty:
        st.success("No anomalies detected in current demo data.")
    for _, event in anomalies.head(20).iterrows():
        with st.expander(f'{event["severity"]} | {event["building_id"]} | {event["anomaly_type"]} | {event["timestamp"]}'):
            report = investigate_event(event, readings)
            st.write(report["summary"])
            st.write("**Evidence**")
            st.json(report["evidence"])
            st.write("**Recommended action**")
            st.write(report["recommendation"])
            st.write(f'Estimated potential cost impact: AED {report["estimated_impact_aed"]:.2f} (illustrative)')
            if st.button(t(selected, "create_work_order"), key=f'wo_{event["event_id"]}'):
                create_work_order(event, report)
                st.success("Demo work order created.")

elif page == t(selected, "workorders"):
    work_orders = list_work_orders()
    if work_orders.empty:
        st.info(t(selected, "no_workorders"))
    else:
        st.dataframe(work_orders, use_container_width=True, hide_index=True)
        selected_id = st.selectbox("Work order", work_orders["work_order_id"].tolist())
        record = work_orders[work_orders["work_order_id"] == selected_id].iloc[0]
        st.write(f'Current status: **{record["status"]}**')
        col1, col2, col3 = st.columns(3)
        if col1.button("Approve"):
            update_work_order(selected_id, "Approved")
            st.rerun()
        if col2.button("Simulate technician completion"):
            update_work_order(selected_id, "Awaiting Verification")
            st.rerun()
        if col3.button("Verify resolution"):
            result = verify_work_order(selected_id, readings)
            update_work_order(selected_id, "Resolved" if result["verified"] else "Needs Review")
            st.json(result)
            st.rerun()

elif page == t(selected, "data"):
    st.write("Upload sensor readings as CSV. Required columns: timestamp, building_id, asset_id, electricity_kwh, water_m3, indoor_temp_c, outdoor_temp_c, hvac_runtime_hours.")
    upload = st.file_uploader("Upload CSV", type=["csv"])
    if upload:
        incoming = pd.read_csv(upload)
        required = {"timestamp","building_id","asset_id","electricity_kwh","water_m3","indoor_temp_c","outdoor_temp_c","hvac_runtime_hours"}
        missing = required - set(incoming.columns)
        if missing:
            st.error(f"Missing columns: {', '.join(sorted(missing))}")
        else:
            incoming["timestamp"] = pd.to_datetime(incoming["timestamp"], errors="coerce", utc=True)
            numeric = list(required - {"timestamp","building_id","asset_id"})
            for col in numeric:
                incoming[col] = pd.to_numeric(incoming[col], errors="coerce")
            incoming["source_type"] = "csv_import"
            incoming["quality_status"] = incoming[list(numeric)].notna().all(axis=1).map({True:"valid", False:"invalid"})
            st.write(f"Rows: {len(incoming)} | Valid rows: {(incoming['quality_status']=='valid').sum()}")
            st.dataframe(incoming.head(20), use_container_width=True)
            if st.button("Import valid rows"):
                save_readings(incoming[incoming["quality_status"] == "valid"])
                st.success("Imported valid rows.")
                st.rerun()

elif page == t(selected, "settings"):
    st.subheader("Deployment & integration status")
    st.write("Database:", os.getenv("DATABASE_URL", "sqlite:///./coolshield.db"))
    st.write("MQTT broker:", os.getenv("MQTT_BROKER", "localhost"))
    st.write("LLM integration: optional; deterministic fallback enabled.")
    st.write("Physical building control: disabled in this MVP.")
    st.write("Supported languages:", ", ".join(LANGUAGES.values()))
    st.warning("All bundled building data and work-order actions are simulated. Do not use this MVP to control physical infrastructure.")
