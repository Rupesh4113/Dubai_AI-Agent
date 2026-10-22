# CoolShield AI — Security Architecture & Governance

---

## 1. Safety Guardrails & Physical Isolation

1. **Physical Building Control is Disabled:**
   The application intentionally operates without direct BACnet write, Modbus coil write, or valve actuator control commands. All corrective actions generate human-reviewed maintenance work orders.
2. **Human Approval Enforcement:**
   Consequential operational actions (technician dispatches, work order issuance, schedule revisions) are gated behind explicit multi-role sign-off (`Approval-required`).
3. **Prompt Injection Prevention:**
   Telemetry strings, sensor metadata, and technician notes are strictly treated as data rather than instructions. Deterministic code handles arithmetic, thresholds, and state transitions; language models are strictly used for structured synthesis.

---

## 2. Role-Based Access Control (RBAC)

Permissions are validated on the backend API layer:

- `facilities_manager`: Full operational management, anomaly investigation, work order approval, and technician assignment.
- `property_owner`: Portfolio overview, financial estimates, and KPI review.
- `hvac_technician`: Access to assigned work orders, recording diagnostic findings, and simulated intervention completion.
- `sustainability_manager`: Energy and water analytics, DEWA tariff modeling, and carbon footprint reduction reports.
- `auditor`: Read-only access to tamper-evident audit logs, verification math, and approval histories.

---

## 3. Tamper-Evident Audit Logging

Every critical mutation (creating work orders, approvals, rejections, technician submissions, verification calculations) logs an immutable record into the `audit_events` table including:
- Actor name & authenticated role
- Timestamp (ISO 8601 UTC)
- Action type (`INVESTIGATE`, `APPROVE`, `REJECT`, `EXECUTE_JOB`, `VERIFY`)
- Target resource type & identifier
- JSON payload snapshot of the decision context
