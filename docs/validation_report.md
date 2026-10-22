# CoolShield AI — Anomaly Detection Validation Report

---

## 1. Evaluation Methodology

The detection engine was evaluated across 90 days of synthetic hourly telemetry across 5 fictional Dubai commercial and hospitality facilities containing 4 controlled ground-truth operational anomalies:

- **Scenario A:** Chiller COP degradation due to condenser tube scaling (DXB-MIX-04)
- **Scenario B:** Continuous water flow surge / riser pipe rupture (DXB-HOT-02)
- **Scenario C:** After-hours HVAC continuous operation override (DXB-OFF-01)
- **Scenario D:** Zone temperature sensor calibration drift & packet loss (DXB-RES-03)

---

## 2. Measured Detection Metrics

| Anomaly Scenario | Ground-Truth Window | Detection Window | Detection Delay | Status | Precision | Recall | F1 Score |
|---|---|---|---|---|---|---|---|
| **Scenario A (HVAC COP Degradation)** | Hour 1400–1496 | Hour 1402 | 2 hours | **Detected** | 92.5% | 88.0% | 0.902 |
| **Scenario B (Water Leakage)** | Hour 1000–1036 | Hour 1001 | 1 hour | **Detected** | 98.1% | 96.5% | 0.973 |
| **Scenario C (Overnight Energy Surge)** | Hour 48–72 | Hour 49 | 1 hour | **Detected** | 94.0% | 91.2% | 0.926 |
| **Scenario D (Sensor Drift & Gap)** | Hour 1720–1768 | Hour 1722 | 2 hours | **Detected** | 89.4% | 85.0% | 0.871 |

### Summary Performance
- **Overall Recall:** **90.2%** (exceeds the 80% pilot target).
- **Overall Precision:** **93.5%**.
- **Average Detection Delay:** **1.5 hours** from anomaly inception.
- **False Alarm Rate:** **0.78 incidents per building-month** (well within commercial FM thresholds).
