# CoolShield AI — Prospective Customer Validation & Pilot Framework
**Section 13 Requirement: Repeatable Pilot Plan for Dubai Commercial & Hospitality Facilities**

---

## 1. Prospective Customer Profile

- **Target Organization:** Emaar Hospitality & Commercial Asset Management
- **Contact Persona:** Khalid Al-Shaikh, Director of Technical Services & Property Engineering
- **Facility Selected for Pilot:** Downtown Luxury Residences & Serviced Suites (Tower B)
- **Facility Specifications:** 48 floors, 62,000 m² gross floor area, District Cooling heat exchangers + VAV terminal units, domestic water booster stations.

---

## 2. Customer Interview Guide

### Operational Discovery Questions

1. **Incident Detection Speed:**
   - *Question:* How long does it currently take your FM team to notice an anomalous increase in chiller power draw or continuous water flow in secondary riser loops?
   - *Typical Baseline:* Usually 3 to 4 weeks later, when the monthly DEWA utility invoice arrives showing unexpected slab penalties.

2. **False Alarms & BMS Noise:**
   - *Question:* How many nuisance alarms does your BMS operator experience on an average shift?
   - *Typical Baseline:* 40 to 60 alarms per day, leading to alarm fatigue and operators acknowledging alarms without investigation.

3. **Maintenance Dispatch & Verification:**
   - *Question:* Once a technician completes an inspection (e.g. cleaning a fouled condenser coil or adjusting a stuck damper), how do you verify that energy efficiency was actually restored?
   - *Typical Baseline:* Informal technician sign-off on paper work order without post-intervention telemetry verification.

4. **Approval & Governance:**
   - *Question:* What level of approval is required before dispatching external service contractors or modifying BMS setpoints?
   - *Requirement:* Facilities Manager or Operations Director must authorize any work order with potential cost or tenant comfort impact.

---

## 3. 30-Day Proof-of-Concept Pilot Plan

### Scope & Constraints
- **Scope:** 1 commercial tower or hotel property.
- **Access Level:** Read-only telemetry gateway via BACnet/IP or secure MQTT bridge.
- **Physical Control:** **Disabled.** The system operates purely in advisory and dispatch-preparation mode.

### Agreed Acceptance Criteria
1. **Anomaly Detection Rate:** Detect at least **80%** of verified abnormal consumption events within 2 hours of occurrence.
2. **False Positive Rate:** Maintain false alarm rate below **1 incident per building-week**.
3. **Investigation Completeness:** 100% of generated work orders must include quantitative telemetry evidence, ranked causes, and calibrated confidence scores.
4. **Human-in-the-Loop Governance:** Enforce mandatory Facilities Manager authorization for 100% of external contractor dispatches.
5. **Post-Intervention Verification:** Automatically compare post-work telemetry against the baseline and compute verified AED savings.
6. **Mean Time to Investigate (MTTI):** Reduce diagnostic time from an average of 4.5 hours to under 15 minutes.
