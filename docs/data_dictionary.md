# CoolShield AI — Data Dictionary & Telemetry Schema

---

## 1. Table Definitions

### `buildings`
| Column | Type | Unit / Format | Description |
|---|---|---|---|
| `id` | String(32) | Primary Key (e.g. `DXB-OFF-01`) | Unique identifier for monitored property |
| `name` | String(128) | Text | Official facility name |
| `building_type` | String(64) | Category | Office Tower, Hotel, Residential, Mixed-Use, Warehouse |
| `district` | String(64) | Dubai Location | Downtown, Palm Jumeirah, Marina, Al Wasl, Dubai South |
| `latitude` | Float | Decimal Degrees (e.g. 25.2048) | WGS84 Latitude |
| `longitude` | Float | Decimal Degrees (e.g. 55.2708) | WGS84 Longitude |
| `gross_floor_area_m2` | Float | Square Meters ($m^2$) | Total air-conditioned gross floor area |
| `floors` | Integer | Count | Number of above-ground levels |
| `cooling_system_type` | String(64) | Category | District Cooling, Centrifugal Chiller, DX Package |
| `operational_status` | String(32) | Status | Optimal, Attention Required, Critical Alert |
| `target_cop` | Float | Ratio (COP) | Design coefficient of performance ($kW_{th} / kW_e$) |

### `sensor_readings`
| Column | Type | Unit / Format | Description |
|---|---|---|---|
| `id` | Integer | Auto-increment PK | Unique telemetry reading index |
| `timestamp` | String(64) | ISO 8601 UTC | Sample collection timestamp |
| `building_id` | String(32) | Foreign Key | Associated building ID |
| `asset_id` | String(64) | String | Sub-meter, Chiller, or AHU asset tag |
| `electricity_kwh` | Float | $kWh$ | Hourly electrical energy consumption |
| `water_m3` | Float | $m^3$ | Hourly potable/irrigation water volume |
| `indoor_temp_c` | Float | Celsius ($^\circ C$) | Zone average dry-bulb temperature |
| `outdoor_temp_c` | Float | Celsius ($^\circ C$) | Ambient weather temperature in Dubai |
| `hvac_supply_temp_c` | Float | Celsius ($^\circ C$) | Chilled water supply temperature (design ~7°C) |
| `hvac_return_temp_c` | Float | Celsius ($^\circ C$) | Chilled water return temperature |
| `hvac_runtime_hours` | Float | Hours (0.0 to 1.0/h) | Duty cycle ratio of cooling equipment |
| `occupancy_estimate` | Float | Ratio (0.0 to 1.0) | Zone occupancy fraction |
| `cop_estimate` | Float | Ratio | Estimated chiller coefficient of performance |
| `source_type` | String(32) | Source | `simulated`, `rest_api`, `mqtt`, `bms_gateway`, `csv_import` |
| `quality_status` | String(32) | Quality Flag | `valid`, `imputed`, `suspect`, `invalid` |

### `anomaly_events`
| Column | Type | Description |
|---|---|---|
| `event_id` | String(64) PK | Unique hash-based event identifier |
| `timestamp` | String(64) | Event detection timestamp |
| `building_id` | String(32) FK | Target building ID |
| `asset_id` | String(64) | Target equipment asset |
| `metric` | String(64) | `electricity_kwh`, `water_m3`, `cop_estimate`, `indoor_temp_c` |
| `anomaly_type` | String(128) | Human-readable classification |
| `severity` | String(32) | `Critical`, `High`, `Medium`, `Low` |
| `observed_value` | Float | Measured physical value |
| `baseline_value` | Float | Expected model baseline |
| `deviation_pct` | Float | Percentage deviation from baseline ($+$ or $-$) |
| `dedup_hash` | String(64) | Deduplication key across time window |

### `work_orders`
| Column | Type | Description |
|---|---|---|
| `work_order_id` | String(64) PK | Formatted identifier (e.g. `WO-2026-001`) |
| `linked_event_id` | String(64) | Source anomaly event |
| `status` | String(64) | Lifecycle state: `Detected` $\to$ `Investigating` $\to$ `Awaiting Approval` $\to$ `Approved` $\to$ `Assigned` $\to$ `In Progress` $\to$ `Awaiting Verification` $\to$ `Resolved` $\to$ `Closed` |
| `approval_status` | String(32) | `Pending`, `Approved`, `Rejected` |
| `assigned_technician`| String(128) | Assigned service technician |
| `verified_savings_aed` | Float | Realized financial benefit verified post-intervention |
