# CoolShield AI — Vercel Deployment Guide

Deploy **CoolShield AI** on Vercel to access the enterprise React dashboard, interactive Dubai Leaflet map, 11-step agentic walkthrough player, Arabic RTL layout, and all 12 operational modules with zero configuration.

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

## Features Active on Vercel

Every feature is pre-configured and fully functional on Vercel:
- **Interactive Dubai Leaflet Map:** Geocoded markers for Downtown Burj Al-Amal, Palm Oasis Resort, Marina Bay Horizon, Al-Wasl Promenade, and Dubai South with live telemetry inspection.
- **Top Demonstration Player:** Walkthrough player for Scenario A (HVAC COP Degradation), Scenario B (Water Leak), Scenario C (Overnight Energy Surge), and Scenario D (Sensor Drift) with 1-click reset.
- **All 12 Modules:** Executive Overview, Building Portfolio, Live Monitoring, AI Insights, Alerts & Incidents, Maintenance Work Orders, Energy & Water Analytics, Equipment Health, Savings & Sustainability, Customer Pilots, Integrations, and Settings & Audit Log.
- **Role Switcher (RBAC):** Switch between Facilities Manager, Property Owner, HVAC Technician, Sustainability Manager, Finance Analyst, and Auditor.
- **6 Languages & Arabic RTL:** Switch to العربية to test right-to-left layout and mirrored navigation.
