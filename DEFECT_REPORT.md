# CoolShield AI — Defect Report
**Target System:** Dubai AI Agent / CoolShield AI  
**Repository:** `F:\github\Dubai_AI Agent`  
**Production URL:** `https://dubai-ai-agent-30psowcfw-amerupesh08-9440.vercel.app/`  
**Audit Date:** 2026-10-24  

---

### Defect Inventory

| Defect ID | Severity | Module / Component | Title | Status |
|---|---|---|---|---|
| **DEF-01** | High | `frontend/src/App.tsx`, `i18n` | Language dropdown does not translate strings for Hindi, Urdu, Malayalam, or Filipino; only hardcoded Arabic checks exist | Confirmed |
| **DEF-02** | High | `frontend/src/components/DubaiMap.tsx` | Map is invisible due to missing Leaflet CSS bundle, detached DOM map instance leak on route change, and non-open tile API | Confirmed |
| **DEF-03** | High | `frontend/src/App.tsx`, RBAC | Persona/role switcher does not alter application behavior, lacks role-based UI permissions, and does not enforce action constraints | Confirmed |
| **DEF-04** | Medium | `frontend/src/api/client.ts` | API client ignores `VITE_API_URL` and throws JSON syntax errors on Vercel SPA rewrites when `/api/v1` returns `index.html` | Confirmed |
| **DEF-05** | Low | Root configuration | Missing `.env.example` detailing Vercel environment variables and configuration guidelines | Confirmed |

---

### Defect Details & Evidence

#### DEF-01: Multi-Language Dropdown Incomplete & Non-Functional for 4 of 6 Languages
- **Severity:** High
- **Files Affected:** `frontend/src/App.tsx`, `backend/app/localization/translations.py`
- **Reproduction Steps:**
  1. Open the application.
  2. Select "हिन्दी (Hindi)", "اردو (Urdu)", "മലയാളം (Malayalam)", or "Tagalog (Filipino)" from the language dropdown.
- **Observed Behavior:**
  Only English text is displayed across the interface. The codebase only implements binary conditionals of the form `{lang === 'ar' ? '...' : '...'}`. Translations for the other 4 UAE-relevant languages are ignored.
- **Expected Behavior:**
  Selecting any of the 6 supported languages (`en`, `ar`, `hi`, `ur`, `ml`, `fil`) should dynamically translate navigation items, KPI cards, diagnostic titles, buttons, statuses, and notices. RTL layout should be applied to both Arabic and Urdu.
- **Root Cause:**
  Lack of a centralized frontend internationalization module. While the backend possessed a dictionary in `translations.py`, the React frontend had no translation lookup function `t(key, lang)`.
- **Proposed Correction:**
  Create `frontend/src/i18n/translations.ts` containing complete 6-language dictionaries and implement a global translation lookup helper `t(key, lang)` across all 13 sections in `App.tsx`.

---

#### DEF-02: Map Component Invisible / Blank in Browser and on Vercel
- **Severity:** High
- **Files Affected:** `frontend/src/components/DubaiMap.tsx`, `frontend/src/main.tsx`, `frontend/index.html`
- **Reproduction Steps:**
  1. Open the Executive Overview section.
  2. Inspect the "Interactive Dubai Property Portfolio Map".
  3. Navigate to another section (e.g. "Live Sensor Telemetry") and return to "Executive Overview".
- **Observed Behavior:**
  The map area renders as a blank/grey box or fails to load tiles. When navigating back to Overview, Leaflet throws `Error: Map container is already initialized` or fails silently because the instance is bound to an unmounted DOM node.
- **Expected Behavior:**
  The map must render high-contrast OpenStreetMap tiles immediately, display geocoded pins for all 5 Dubai facilities, center on Dubai ($25.14^\circ\text{N}, 55.22^\circ\text{E}$), and reinitialize cleanly upon tab switching.
- **Root Cause:**
  1. `leaflet/dist/leaflet.css` was never imported into the Vite bundle, relying on an external unpkg CDN link in `index.html` which is subject to network blocks, CORS, and latency.
  2. The `useEffect` cleanup function in `DubaiMap.tsx` was empty (`return () => {}`), leaking the previous Leaflet map instance on component unmount and crashing re-initialization.
  3. Missing `map.invalidateSize()` call after mounting causes the map container to compute zero height during initial layout.
  4. CartoDB tile URLs can be restricted or blocked; open-source OpenStreetMap (OSM) API was requested.
- **Proposed Correction:**
  1. Directly import `leaflet/dist/leaflet.css` in `DubaiMap.tsx` and `main.tsx`.
  2. Implement proper cleanup: `if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }`.
  3. Use the open-source OpenStreetMap tile API (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`).
  4. Add a `map.invalidateSize()` timer on mount.
  5. Provide an interactive SVG fallback overlay ensuring map visibility even if offline or tile networks fail.

---

#### DEF-03: Persona / Role Switcher Does Not Enforce RBAC or Alter App Experience
- **Severity:** High
- **Files Affected:** `frontend/src/App.tsx`
- **Reproduction Steps:**
  1. Select different roles from the Persona Switcher (e.g. "Property Owner", "HVAC Technician", "Auditor", "Finance Analyst").
- **Observed Behavior:**
  The UI remains static with identical access and options. Non-Facilities-Manager personas can still view or attempt technical actions with no visual indication of their permission boundaries.
- **Expected Behavior:**
  Switching personas must visibly adapt the application:
  - Display an **Active Persona Banner** with the role title, security clearance level, and allowed/restricted actions.
  - Enforce permissions: Auditors are strictly Read-Only; Property Owners are locked from engineering setpoint overrides; HVAC Technicians can execute field work orders but cannot approve financial budgets; Facilities Managers hold full operational authority.
  - Action buttons must visually reflect permissions (enabled vs. disabled with informative badge/tooltip).
- **Root Cause:**
  Role state `currentRole` was only used in two inline conditions in `App.tsx` without a structured RBAC permissions matrix or persona-aware UI layout.
- **Proposed Correction:**
  Implement a formal `ROLE_PERMISSIONS` configuration defining capabilities per role. Display an active persona banner, mark navigation items with role relevance badges, and enforce permission gates on all operational buttons.

---

#### DEF-04: API Client Fails on Vercel SPA Rewrites and Ignores `VITE_API_URL`
- **Severity:** Medium
- **Files Affected:** `frontend/src/api/client.ts`
- **Reproduction Steps:**
  1. Deploy frontend to Vercel without a live FastAPI backend.
  2. Open browser developer console.
- **Observed Behavior:**
  Console logs `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON` when endpoints return Vercel's rewritten `index.html`. Furthermore, configuring `VITE_API_URL` has no effect because `const API_BASE = '/api/v1'` is hardcoded.
- **Expected Behavior:**
  `API_BASE` must dynamically read `import.meta.env.VITE_API_URL`. Responses must verify `content-type: application/json` before calling `.json()`, falling back cleanly to in-memory mocks without throwing console syntax errors.
- **Root Cause:**
  `API_BASE` hardcoded without reading Vite environment variables; `fetch` response validation omitted `content-type` header check.
- **Proposed Correction:**
  Update `API_BASE` to `(import.meta.env.VITE_API_URL as string) || '/api/v1'`, and guard `.json()` parsing with `res.headers.get('content-type')?.includes('application/json')`.

---

#### DEF-05: Missing `.env.example`
- **Severity:** Low
- **Files Affected:** Root directory
- **Reproduction Steps:**
  Inspect root repository for environment variable templates.
- **Observed Behavior:**
  No `.env.example` file is provided, creating ambiguity for Vercel deployment variable configuration.
- **Expected Behavior:**
  A sanitized `.env.example` documenting all configuration keys (`VITE_API_URL`, `DATABASE_URL`, `N8N_WEBHOOK_URL`, `APP_ENV`, etc.) must be provided.
- **Proposed Correction:**
  Create `.env.example` with documented variable definitions and placeholder values.
