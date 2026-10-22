# CoolShield AI — REST API Integration Guide

Base URL: `http://localhost:8000/api/v1`
Interactive Swagger Docs: `http://localhost:8000/docs`

---

## Authentication & Headers

| Header | Example | Description |
|---|---|---|
| `Content-Type` | `application/json` | Required for POST/PUT |
| `x-user-role` | `facilities_manager` | Role for RBAC permission validation |
| `x-user-email` | `fm@coolshield.ae` | User email for audit trail logging |

---

## Principal Endpoints

### 1. Ingest Telemetry Reading
- **POST** `/api/v1/readings`
```json
{
  "timestamp": "2026-10-22T14:00:00Z",
  "building_id": "DXB-OFF-01",
  "asset_id": "DXB-OFF-01-CH-01",
  "electricity_kwh": 48.5,
  "water_m3": 0.42,
  "indoor_temp_c": 23.2,
  "outdoor_temp_c": 38.6,
  "hvac_runtime_hours": 0.95,
  "occupancy_estimate": 0.85
}
```

### 2. Trigger Anomaly Detection
- **POST** `/api/v1/anomalies/detect`
- Optional query param: `?building_id=DXB-HOT-02`

### 3. Retrieve AI Investigation Dossier
- **GET** `/api/v1/anomalies/{event_id}/investigate`

### 4. Create Work Order
- **POST** `/api/v1/work_orders`
```json
{
  "event_id": "evt_b82a7f01",
  "title": "Emergency isolation of spa riser loop",
  "assigned_team": "Plumbing Quick Response"
}
```

### 5. Authorize Work Order (Approval Gate)
- **POST** `/api/v1/work_orders/{work_order_id}/approve`
```json
{
  "approved": true,
  "rationale": "Authorized by Facilities Manager Ahmed Al-Maktoum"
}
```

### 6. Verify Resolution (IPMVP Option B)
- **POST** `/api/v1/work_orders/{work_order_id}/verify`
- Returns verified post-intervention reduction and calculated AED savings.
