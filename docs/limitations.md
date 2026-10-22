# CoolShield AI — Known Limitations & Risk Register

---

## 1. Transparency & Simulation Disclosures

- **Simulated Demonstration Telemetry:** All 90-day hourly readings bundled with this MVP are generated via deterministic physical modeling simulating typical Dubai summer and shoulder-month temperatures (22°C to 48°C), diurnal heat gain, and chiller COP behavior. No live connection to real commercial Dubai towers is active in the demonstration tier.
- **No Official Government Endorsement:** CoolShield AI is an independent enterprise software application. It is not endorsed, approved, or sponsored by Dubai Municipality, DEWA (Dubai Electricity & Water Authority), or any UAE government entity.

---

## 2. Technical Limitations

| Category | Current State in MVP | Production Requirement |
|---|---|---|
| **Database** | SQLite supported for single-binary demo; PostgreSQL migrations ready | Multi-AZ High Availability PostgreSQL with TimescaleDB extension for time-series |
| **Physical Control** | Disabled by design for safety | Future bidirectional BMS integration will require hardware safety interlocks and BACnet/SC (Secure Connect) |
| **Forecast Horizon** | 48-hour autoregressive projection | 14-day weather-integrated Prophet / XGBoost predictive model |
| **Language Coverage** | 100% Arabic and English full workflow; core UI translated for Hindi, Urdu, Malayalam, and Tagalog | Continuous localization review with certified FM domain linguists |

---

## 3. Operational Risk Register

1. **Risk: Statistical Anomaly Mistaken for Physical Failure**
   - *Mitigation:* The agent classifies findings as *operational hypotheses* requiring physical verification before replacing expensive equipment.
2. **Risk: Alert Fatigue from Sensor Noise**
   - *Mitigation:* Layer A data quality filtering removes flatlines and communication dropouts before Layer B anomaly detection is executed.
3. **Risk: Premature Savings Claims**
   - *Mitigation:* The system strictly separates *potential modeled savings* from *verified realized savings* based on post-intervention IPMVP Option B evidence.
