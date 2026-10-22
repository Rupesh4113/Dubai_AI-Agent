# CoolShield AI — Streamlit MVP

A Dubai-oriented building operations demo for anomaly detection, sensor ingestion, evidence-based recommendations, maintenance workflows, and six-language UI.

**Important:** Bundled data is simulated. The MQTT broker configuration is for local development only and permits anonymous access. Do not expose it to the public internet. Physical building control is disabled.

## Stack

- Streamlit UI
- Python analytics and deterministic workflow logic
- PostgreSQL (Docker Compose)
- FastAPI REST ingestion endpoint
- Optional MQTT adapter (Paho MQTT)
- English, Arabic, Hindi, Urdu, Malayalam, Tagalog/Filipino UI
- Docker Compose

## Quick start with Docker

1. Copy `.env.example` to `.env`.
2. Change demo passwords and API keys for your environment.
3. Build and start the app:

```bash
docker compose up --build
```

4. Open:
   - Streamlit: http://localhost:8501
   - Ingestion API docs: http://localhost:8000/docs
   - Health: http://localhost:8000/health

The Streamlit app seeds synthetic readings on first launch.

## Enable MQTT worker

```bash
docker compose --profile iot up --build
```

Publish a JSON message to topic `coolshield/readings` with fields such as:

```json
{
  "timestamp": "2026-10-22T10:00:00Z",
  "building_id": "DXB-OFF-01",
  "building_type": "Office Tower",
  "asset_id": "DXB-OFF-01-HVAC-01",
  "electricity_kwh": 21.4,
  "water_m3": 0.31,
  "indoor_temp_c": 23.8,
  "outdoor_temp_c": 36.1,
  "hvac_runtime_hours": 0.9,
  "occupancy_estimate": 0.7
}
```

The example broker is unauthenticated for local development only. Configure broker authentication, TLS, ACLs, network isolation, and secrets before any shared or production environment.

## Send a sensor reading to the REST API

Use the API key configured in `.env`:

```bash
curl -X POST http://localhost:8000/v1/readings \
  -H "Content-Type: application/json" \
  -H "X-API-Key: local-demo-key-change-me" \
  -d '{
    "timestamp":"2026-10-22T10:00:00Z",
    "building_id":"DXB-OFF-01",
    "asset_id":"DXB-OFF-01-HVAC-01",
    "electricity_kwh":21.4,
    "water_m3":0.31,
    "indoor_temp_c":23.8,
    "outdoor_temp_c":36.1,
    "hvac_runtime_hours":0.9,
    "occupancy_estimate":0.7,
    "building_type":"Office Tower"
  }'
```

## CSV import schema

Required columns:

- `timestamp`
- `building_id`
- `asset_id`
- `electricity_kwh`
- `water_m3`
- `indoor_temp_c`
- `outdoor_temp_c`
- `hvac_runtime_hours`

Optional: `building_type`, `occupancy_estimate`.

Timestamps are normalized to UTC on ingestion. The UI timezone can be localized in a later enhancement; operational records should retain unambiguous timestamps.

## Local Python setup without Docker

Python 3.12 is recommended.

```bash
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
streamlit run app.py
```

For a local non-Docker run, set `DATABASE_URL=sqlite:///./coolshield.db` in `.env`. Run the API separately using `uvicorn api:app --reload --port 8000`.

## Six languages

The selector includes English (`en`), Arabic (`ar`), Hindi (`hi`), Urdu (`ur`), Malayalam (`ml`), and Filipino/Tagalog (`fil`). Arabic has a basic RTL layout treatment. This starter translates core navigation and primary UI labels; production readiness requires translation coverage tests for every page, form, notification, validation message, chart label, and generated report, plus native-speaker review.

## MVP limitations to address before a customer pilot

1. Demo anomaly detector is intentionally simple; evaluate against labeled test windows and tune false alarms.
2. The resolution verification function deliberately does not mark savings as verified without real before/after evidence.
3. Authentication and fine-grained authorization are not yet implemented.
4. Add tenant isolation, production secrets, TLS, MQTT authentication/ACLs, rate limits, and stronger API validation before external exposure.
5. Add durable idempotency, deduplication, retry handling, and dead-letter processing for ingestion.
6. Add explicit tariff models, weather/occupancy-adjusted baselines, and audited savings calculations.
7. Add customer interviews and a consented pilot; do not invent customer validation.
8. Keep all physical controls disabled until safety engineering and customer authorization are complete.

## Project tree

```text
coolshield-ai-mvp/
├── app.py
├── api.py
├── mqtt_worker.py
├── coolshield/
│   ├── __init__.py
│   ├── analytics.py
│   ├── db.py
│   ├── i18n.py
│   └── workflow.py
├── mosquitto/
│   └── mosquitto.conf
├── tests/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md
```
