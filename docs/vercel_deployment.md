# CoolShield AI — Vercel Deployment Guide

Deploy **CoolShield AI** to Vercel to access the enterprise React dashboard, interactive Dubai Leaflet map, scenario walkthrough player, Arabic RTL layout, and all 13 operational & societal sections with zero configuration.

---

## 1-Click Fast Deployment Options on Vercel

### Method A: Deploy Entire Repository (Recommended)

1. Log in to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **"Add New..."** $\to$ **"Project"**.
3. Import your GitHub repository: `<your-github-username>/Dubai_AI Agent`.
4. Vercel will automatically detect `vercel.json` and configure:
   - **Framework Preset:** Vite
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
5. Click **"Deploy"**.
6. Within 60 seconds, your application is live on a high-speed global CDN (e.g. `https://coolshield-ai.vercel.app`)!

---

### Method B: Deploy with Root Directory Set to `frontend`

If you prefer pointing Vercel directly to the frontend folder:
1. In the Vercel Project Import screen, click **"Edit"** next to **Root Directory**.
2. Select the `frontend` folder.
3. Keep default settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **"Deploy"**.

---

## Zero-Configuration Resilient Architecture

The React/TypeScript frontend features an **in-memory deterministic fallback layer** (`frontend/src/api/client.ts`). When deployed to Vercel without a live backend:
- All 13 operational modules run seamlessly directly in the browser.
- Interactive Dubai Leaflet map loads geocoded facilities with live telemetry.
- Demonstration player executes Scenarios A, B, C, and D with instant step-by-step state progression.
- DEWA slab tariff calculations, PII redactions, and ESG reporting function client-side.
- Connecting to an external FastAPI backend is as simple as setting `VITE_API_URL` in Vercel environment variables.

---

## All 13 Sections Fully Operational on Vercel

1. **Executive Impact Overview:** High-level KPIs, 14-day energy & water trends, DEWA 48-hour load forecast projection, interactive Leaflet Dubai map, active anomalies, and diagnostic investigation drawer with work order drafting.
2. **Live Sensor Telemetry:** Granular sub-meter feeds, chilled water $\Delta T$, and Layer A Data Quality Gate check (range bounds, rate-of-change, flatlines).
3. **Peak Demand & HVAC Optimization (Module B):** Pre-cooling schedules, 133 kW shed capacity, AED 495/day peak tariff avoidance, and 1-click authorization.
4. **Carbon & ESG Intelligence (Module A):** Scope 1 & Scope 2 greenhouse gas reporting using DEWA factor ($0.42\text{ kg CO}_2\text{e/kWh}$) and district cooling factor ($0.18$), verified reductions ($7.45\text{ MT}$), and official corporate ESG JSON export.
5. **Indoor Comfort & Safety Bounds:** ASHRAE 55 thermal comfort compliance ($23^\circ\text{C}-26^\circ\text{C}$), ASHRAE 62.1 indoor air quality ventilation, and mechanical freeze/overpressure safety override interlocks.
6. **Social Inclusion & Community Hub (Module C):** Verified Dubai municipal cooling shelter directory with district filtering, and resident service ticket submission with automated PII regex scrubbing.
7. **Sustainability Education & Sprints (Module D):** Weekly community conservation sprints with live pledge counters, and multilingual educational flashcards.
8. **Resilience & Early Warning (Module E):** National Center of Meteorology (NCM) live weather feed, $43.8^\circ\text{C}$ Heat Index Level 2 warning, outdoor $\text{PM}_{2.5}$ AQI, and automated cooling shelter routing.
9. **AI Reasoning & Activity Timeline:** 9-stage closed-loop audit trail ($\text{Observe} \to \text{Validate} \to \text{Reason} \to \text{Prioritize} \to \text{Plan} \to \text{Approve} \to \text{Execute} \to \text{Verify} \to \text{Learn}$).
10. **Human Approval Centre:** Consequential operational action sign-offs with Facilities Manager role enforcement and approval rationale logging.
11. **n8n Workflow Automation Engine:** Live health monitor for 9 orchestration workflows with sub-second latency and webhook triggers.
12. **Reports & Auditable Deliverables:** 1-click downloads for Official Corporate ESG JSON and Tamper-Evident SHA-256 Audit CSV.
13. **Integrations, Safety & Pilots:** Hardware protocol gateways (Modbus TCP/IP, BACnet/IP, DEWA REST), monitored building equipment assets, Emaar Hospitality 30-day pilot validation agreement, and the 19 Typed Tools Security Governance Manifest.
