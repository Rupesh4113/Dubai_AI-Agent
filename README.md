# CoolShield AI
## Dubai Smart Building Operations & Autonomous Efficiency Agent

[![Tests: Passing](https://img.shields.io/badge/tests-25%20passed-emerald)](./tests)
[![Localization: 6 Languages](https://img.shields.io/badge/languages-EN%20%7C%20AR%20%7C%20HI%20%7C%20UR%20%7C%20ML%20%7C%20FIL-teal)](./backend/app/localization)
[![RTL: Arabic Ready](https://img.shields.io/badge/RTL-Arabic%20Supported-blue)](./frontend)
[![DEWA Tariffs: Active](https://img.shields.io/badge/tariffs-DEWA%20Tiered%20Slabs-amber)](./backend/app/services/tariff_service.py)

CoolShield AI is an autonomous building operations and efficiency agent designed for commercial office towers, luxury hotels, residential high-rises, and mixed-use retail developments in Dubai.

It demonstrates a complete end-to-end closed-loop agentic workflow:

$$\text{Observe} \to \text{Detect} \to \text{Investigate} \to \text{Diagnose} \to \text{Prioritize} \to \text{Recommend} \to \text{Approve} \to \text{Execute} \to \text{Verify} \to \text{Learn}$$

> **Important Disclosure:** Telemetry data is simulated for demonstration and competition purposes. Physical building control (direct actuator or BMS write operations) is strictly disabled. Consequential maintenance dispatches require human authorization. CoolShield AI is an independent software application and is not officially endorsed by Dubai Municipality, DEWA, or any UAE government entity.

---

## Key Features

1. **Interactive Dubai Portfolio Map:**
   - Geocoded map of 5 major Dubai facilities (Downtown DIFC, Palm Jumeirah, Dubai Marina, City Walk, Dubai South) with live status markers and telemetry inspection.
2. **Multi-Strategy Anomaly Detection:**
   - Layer A: Data quality validation (flatlines, dropouts, physical bound checks).
   - Layer B: Univariate Median Absolute Deviation (MAD), 168-hour seasonal profiles, and domain HVAC heuristics.
3. **Evidence-Based Diagnostics & Calibrated Confidence:**
   - Evaluates multi-sensor correlation across chilled water supply/return temperatures, VAV runtimes, and sub-meters.
   - Calibrated confidence scoring ($0.0 - 1.0$) with ranked causes and safety instructions.
4. **DEWA Tiered Tariff Engine:**
   - Deterministic calculation of electricity costs using DEWA commercial slabs, fuel surcharge (~0.05 AED/kWh), water rates, sewerage fees, and 5% UAE VAT.
   - Separates *potential modeled savings* from *verified realized savings*.
5. **Human-in-the-Loop Approval & RBAC:**
   - 8 user roles (Facilities Manager, Property Owner, HVAC Technician, Sustainability Manager, Finance Analyst, Auditor, etc.) enforced on backend API endpoints.
   - Mandatory human approval gate before work orders are dispatched.
6. **Post-Intervention Verification (IPMVP Option B):**
   - Automatically compares post-repair telemetry against the weather-adjusted baseline and records verified AED savings in an immutable audit ledger.
7. **6-Language Localization Engine with Full Arabic RTL:**
   - English (`en`), Arabic (`ar` with full right-to-left layout and mirrored navigation), Hindi (`hi`), Urdu (`ur`), Malayalam (`ml`), and Tagalog / Filipino (`fil`).
8. **Customer Validation Framework (Section 13):**
   - Built-in pilot agreement tracker and interview guide for Dubai real estate operators.
9. **Guided Competition Demonstration Player (Section 14):**
   - 11-step interactive walkthrough for Scenarios A, B, C, and D with one-click database reset.

---

## Quick Start & Deployments

### Option 1: Deploy to Vercel (1-Click Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Import this repository into your **[Vercel Dashboard](https://vercel.com)**.
2. Vercel automatically detects `vercel.json` and builds the production React enterprise app.
3. Your application is live instantly with the interactive Dubai map, 11-step competition player, and all 12 modules!
4. See the full [Vercel Deployment Guide](docs/vercel_deployment.md).

---

### Option 2: Run Locally with Python & Node

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   cd frontend
   npm install
   npm run build
   cd ..
   ```

2. **Run Unified Production Server:**
   ```bash
   python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
   ```

3. **Open the Application:**
   - **Enterprise Web UI & Interactive Dubai Map:** [http://localhost:8000](http://localhost:8000)
   - **Interactive OpenAPI Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **API Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### Option 2: Docker Compose

```bash
docker compose up --build
```
Open [http://localhost:8000](http://localhost:8000).

---

## Automated Test Suite

Run all 25 unit and integration tests:

```bash
python -m pytest tests/ -v
```

Verified test coverage includes:
- Data quality validation (Layer A)
- DEWA slab tariffs and financial impact arithmetic
- Granular Role-Based Access Control (RBAC) permissions
- Autonomous agent tools and closed-loop lifecycle
- FastAPI REST endpoints and static React frontend mounting

---

## Documentation Index

- [System Architecture & Data-Flow Diagrams](docs/architecture.md)
- [Prospective Customer Validation & Pilot Plan](docs/customer_pilot.md)
- [Data Dictionary & Schema Specification](docs/data_dictionary.md)
- [REST API Integration Guide](docs/api_guide.md)
- [Security Architecture & Governance](docs/security.md)
- [Known Limitations & Risk Register](docs/limitations.md)
- [Anomaly Detection Validation Report](docs/validation_report.md)
- [Competition Demonstration Script](docs/demo_script.md)
- [Commercial & Technical Roadmap](docs/roadmap.md)
