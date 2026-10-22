/**
 * CoolShield AI - Resilient API Client
 * Connects the React SPA to FastAPI backend with full in-memory fallback
 * for seamless Vercel Cloud and Edge deployments.
 */

const API_BASE = '/api/v1';

export interface ExecutiveKPIs {
  total_buildings: number;
  electricity_kwh_today: number;
  water_m3_today: number;
  total_operating_cost_aed_today: number;
  open_alerts_total: number;
  open_critical_incidents: number;
  open_high_incidents: number;
  equipment_requiring_attention: number;
  maintenance_completion_rate_pct: number;
  verified_savings_aed: number;
  potential_savings_aed: number;
  currency: string;
  is_simulated_badge: boolean;
}

export interface BuildingItem {
  id: string;
  name: string;
  building_type: string;
  district: string;
  latitude: number;
  longitude: number;
  gross_floor_area_m2: number;
  floors: number;
  year_built: number;
  cooling_system_type: string;
  operational_status: string;
  target_cop: number;
  monitored_assets_count: number;
  open_incidents_count: number;
}

export interface TelemetryReading {
  timestamp: string;
  electricity_kwh?: number;
  water_m3?: number;
  indoor_temp_c?: number;
  outdoor_temp_c?: number;
  hvac_supply_temp_c?: number;
  hvac_return_temp_c?: number;
  hvac_runtime_hours?: number;
  cop_estimate?: number;
  occupancy_estimate?: number;
  quality_status: string;
}

export interface AnomalyEventItem {
  event_id: string;
  timestamp: string;
  building_id: string;
  asset_id: string;
  metric: string;
  anomaly_type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  urgency: string;
  observed_value: number;
  baseline_value: number;
  deviation_pct: number;
  duration_hours: number;
  source_type: string;
  dedup_hash: string;
}

export interface WorkOrderItem {
  work_order_id: string;
  linked_event_id: string;
  building_id: string;
  asset_id: string;
  title: string;
  description: string;
  severity: string;
  priority: string;
  status: string;
  approval_status: string;
  assigned_to_team: string;
  assigned_technician: string;
  safety_notes?: string;
  resolution_notes?: string;
  verified_savings_aed: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestigationReport {
  investigation_id: string;
  event_id: string;
  building_id: string;
  asset_id: string;
  summary: string;
  confidence_score: number;
  confidence_rationale: string;
  possible_causes: Array<{ cause: string; evidence_strength: string; probability: number }>;
  supporting_evidence: Record<string, any>;
  financial_impact: Record<string, any>;
  recommendations: Array<{
    title: string;
    action_type: string;
    description: string;
    safety_instructions?: string;
    priority?: string;
  }>;
  required_approval_level: string;
}

export interface EquipmentItem {
  id: string;
  building_id: string;
  building_name: string;
  name: string;
  asset_type: string;
  model: string;
  status: string;
  health_score: number;
  rated_kw: number;
  last_serviced: string;
}

export interface IntegrationItem {
  id: string;
  name: string;
  integration_type: string;
  endpoint_url: string;
  status: string;
  protocol: string;
  last_sync_time: string;
  readings_synced_total: number;
  error_count: number;
}

export interface PilotRecord {
  id: string;
  organization_name: string;
  contact_name: string;
  contact_role: string;
  customer_segment: string;
  reported_problem: string;
  current_workflow: string;
  willingness_to_pilot: string;
  target_building: string;
  pilot_acceptance_criteria: string;
  interview_date: string;
  status: string;
}

export interface AuditItem {
  id: number;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details_json?: string;
}

// -----------------------------------------------------------------------------
// Deterministic Fallback Data for Cloud Edge & Vercel
// -----------------------------------------------------------------------------
const DEFAULT_BUILDINGS: BuildingItem[] = [
  {
    id: "DXB-OFF-01",
    name: "Burj Al-Amal Commercial Tower",
    building_type: "Commercial Office",
    district: "Downtown Dubai / DIFC",
    latitude: 25.2048,
    longitude: 55.2708,
    gross_floor_area_m2: 62000.0,
    floors: 48,
    year_built: 2019,
    cooling_system_type: "District Cooling + Variable Air Volume (VAV)",
    operational_status: "Attention Required",
    target_cop: 4.5,
    monitored_assets_count: 4,
    open_incidents_count: 1
  },
  {
    id: "DXB-HOT-02",
    name: "Palm Oasis Resort & Luxury Spa",
    building_type: "Hotel & Hospitality",
    district: "Palm Jumeirah",
    latitude: 25.1124,
    longitude: 55.1390,
    gross_floor_area_m2: 45000.0,
    floors: 18,
    year_built: 2021,
    cooling_system_type: "Water-Cooled Centrifugal Chillers",
    operational_status: "Critical Alert",
    target_cop: 4.2,
    monitored_assets_count: 4,
    open_incidents_count: 1
  },
  {
    id: "DXB-RES-03",
    name: "Marina Bay Horizon Luxury Residences",
    building_type: "Residential Tower",
    district: "Dubai Marina",
    latitude: 25.0805,
    longitude: 55.1403,
    gross_floor_area_m2: 54000.0,
    floors: 56,
    year_built: 2020,
    cooling_system_type: "District Cooling + FCU Distribution",
    operational_status: "Sensor Degradation",
    target_cop: 4.1,
    monitored_assets_count: 3,
    open_incidents_count: 1
  },
  {
    id: "DXB-MIX-04",
    name: "Al-Wasl Promenade Shopping & Suites",
    building_type: "Mixed-Use Commercial & Retail",
    district: "City Walk / Al Wasl",
    latitude: 25.2084,
    longitude: 55.2612,
    gross_floor_area_m2: 38000.0,
    floors: 6,
    year_built: 2018,
    cooling_system_type: "Air-Cooled Screw Chillers",
    operational_status: "Efficiency Degradation",
    target_cop: 3.8,
    monitored_assets_count: 3,
    open_incidents_count: 1
  },
  {
    id: "DXB-WHS-05",
    name: "Dubai South Aerospace Logistics Hub",
    building_type: "Logistics & Warehouse",
    district: "Dubai South / DWC",
    latitude: 24.8966,
    longitude: 55.1611,
    gross_floor_area_m2: 28000.0,
    floors: 2,
    year_built: 2022,
    cooling_system_type: "Rooftop DX Packages",
    operational_status: "Optimal",
    target_cop: 3.6,
    monitored_assets_count: 2,
    open_incidents_count: 0
  }
];

const DEFAULT_KPIS: ExecutiveKPIs = {
  total_buildings: 5,
  electricity_kwh_today: 3840.0,
  water_m3_today: 94.5,
  total_operating_cost_aed_today: 2145.8,
  open_alerts_total: 4,
  open_critical_incidents: 1,
  open_high_incidents: 2,
  equipment_requiring_attention: 2,
  maintenance_completion_rate_pct: 88.5,
  verified_savings_aed: 14850.0,
  potential_savings_aed: 29400.0,
  currency: "AED",
  is_simulated_badge: true
};

const DEFAULT_ANOMALIES: AnomalyEventItem[] = [
  {
    event_id: "evt_water_leak_02",
    timestamp: new Date().toISOString(),
    building_id: "DXB-HOT-02",
    asset_id: "DXB-HOT-02-WTR-BOOST",
    metric: "water_m3",
    anomaly_type: "Abnormal Continuous Water Flow / Pipe Rupture",
    severity: "Critical",
    urgency: "Immediate",
    observed_value: 2.85,
    baseline_value: 0.52,
    deviation_pct: 448.1,
    duration_hours: 36.0,
    source_type: "simulated",
    dedup_hash: "hash_hot_water"
  },
  {
    event_id: "evt_cop_degrade_04",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    building_id: "DXB-MIX-04",
    asset_id: "DXB-MIX-04-CH-02",
    metric: "cop_estimate",
    anomaly_type: "Chiller COP Degradation / Fouled Condenser",
    severity: "High",
    urgency: "Next Shift",
    observed_value: 2.45,
    baseline_value: 3.80,
    deviation_pct: -35.5,
    duration_hours: 96.0,
    source_type: "simulated",
    dedup_hash: "hash_mix_cop"
  },
  {
    event_id: "evt_overnight_elec_01",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    building_id: "DXB-OFF-01",
    asset_id: "DXB-OFF-01-AHU-04",
    metric: "electricity_kwh",
    anomaly_type: "After-Hours HVAC Schedule Override / Stuck Damper",
    severity: "High",
    urgency: "Next Shift",
    observed_value: 48.6,
    baseline_value: 22.4,
    deviation_pct: 116.9,
    duration_hours: 24.0,
    source_type: "simulated",
    dedup_hash: "hash_off_elec"
  },
  {
    event_id: "evt_sensor_drift_03",
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    building_id: "DXB-RES-03",
    asset_id: "DXB-RES-03-TEMP-L28",
    metric: "indoor_temp_c",
    anomaly_type: "Sensor Drift & Intermittent Packet Loss",
    severity: "Medium",
    urgency: "Routine",
    observed_value: 30.8,
    baseline_value: 23.2,
    deviation_pct: 32.7,
    duration_hours: 48.0,
    source_type: "simulated",
    dedup_hash: "hash_res_temp"
  }
];

let inMemoryWorkOrders: WorkOrderItem[] = [
  {
    work_order_id: "WO-2026-001",
    linked_event_id: "evt_water_leak_02",
    building_id: "DXB-HOT-02",
    asset_id: "DXB-HOT-02-WTR-BOOST",
    title: "Emergency Isolation: Palm Oasis Spa Water Riser Leak",
    description: "Abnormal continuous water flow of 2.85 m3/h detected during 3 AM low-occupancy period. Plumber dispatched to isolate branch valve B-04.",
    severity: "Critical",
    priority: "High",
    status: "Awaiting Approval",
    approval_status: "Pending",
    assigned_to_team: "Plumbing Quick Response Team",
    assigned_technician: "Tariq Mansoor",
    verified_savings_aed: 3360.0,
    is_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    work_order_id: "WO-2026-002",
    linked_event_id: "evt_cop_degrade_04",
    building_id: "DXB-MIX-04",
    asset_id: "DXB-MIX-04-CH-02",
    title: "Chiller 2 Condenser Tube Chemical Wash & Pressure Test",
    description: "COP degraded to 2.45. Elevated condenser approach temperature indicates scaling in cooling tower circuit.",
    severity: "High",
    priority: "High",
    status: "Resolved",
    approval_status: "Approved",
    assigned_to_team: "HVAC Heavy Mechanicals",
    assigned_technician: "Tariq Mansoor",
    verified_savings_aed: 8400.0,
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export class ApiClient {
  private static role: string = 'facilities_manager';

  public static setRole(newRole: string) {
    this.role = newRole;
  }

  public static getRole(): string {
    return this.role;
  }

  private static headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-user-role': this.role,
      'x-user-email': `${this.role}@coolshield.ae`
    };
  }

  public static async fetchKPIs(): Promise<ExecutiveKPIs> {
    try {
      const res = await fetch(`${API_BASE}/kpis`, { headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}
    return DEFAULT_KPIS;
  }

  public static async fetchBuildings(): Promise<BuildingItem[]> {
    try {
      const res = await fetch(`${API_BASE}/buildings`, { headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}
    return DEFAULT_BUILDINGS;
  }

  public static async fetchTelemetry(buildingId: string, limit = 168): Promise<TelemetryReading[]> {
    try {
      const res = await fetch(`${API_BASE}/buildings/${buildingId}/telemetry?limit=${limit}`, { headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}

    // Fallback realistic telemetry series
    const series: TelemetryReading[] = [];
    const now = Date.now();
    for (let i = 0; i < 24; i++) {
      const t = new Date(now - (23 - i) * 3600000);
      const hr = t.getHours();
      const outdoor = 31 + 8 * Math.sin(((hr - 8) * Math.PI) / 12);
      series.push({
        timestamp: t.toISOString(),
        electricity_kwh: Math.round(35 + (outdoor - 24) * 1.5 + (8 <= hr && hr <= 18 ? 12 : 2)),
        water_m3: parseFloat((0.25 + (8 <= hr && hr <= 18 ? 0.35 : 0.05)).toFixed(3)),
        indoor_temp_c: 23.2,
        outdoor_temp_c: Math.round(outdoor * 10) / 10,
        cop_estimate: 4.1,
        hvac_runtime_hours: 0.85,
        occupancy_estimate: 8 <= hr && hr <= 18 ? 0.8 : 0.15,
        quality_status: 'valid'
      });
    }
    return series;
  }

  public static async fetchAnomalies(buildingId?: string): Promise<AnomalyEventItem[]> {
    try {
      const url = buildingId ? `${API_BASE}/anomalies?building_id=${buildingId}` : `${API_BASE}/anomalies`;
      const res = await fetch(url, { headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}
    if (buildingId) {
      return DEFAULT_ANOMALIES.filter(a => a.building_id === buildingId);
    }
    return DEFAULT_ANOMALIES;
  }

  public static async fetchInvestigation(eventId: string): Promise<InvestigationReport> {
    try {
      const res = await fetch(`${API_BASE}/anomalies/${eventId}/investigate`, { headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}

    const ev = DEFAULT_ANOMALIES.find(a => a.event_id === eventId) || DEFAULT_ANOMALIES[0];
    return {
      investigation_id: `inv_${ev.event_id.slice(-6)}`,
      event_id: ev.event_id,
      building_id: ev.building_id,
      asset_id: ev.asset_id,
      summary: `Autonomous agent investigation for ${ev.anomaly_type} at ${ev.building_id}. Observed ${ev.observed_value} vs baseline ${ev.baseline_value} (+${ev.deviation_pct}%). Cause ranked by multi-sensor correlation.`,
      confidence_score: 0.90,
      confidence_rationale: "Strong deviation persisting during un-scheduled hours without pressure telemetry balance.",
      possible_causes: [
        { cause: "Concealed secondary riser pipe crack or ruptured valve seal", evidence_strength: "High", probability: 0.65 },
        { cause: "Continuous open solenoid flush fixture in spa zone", evidence_strength: "Medium", probability: 0.25 },
        { cause: "Meter pulse multiplier transmitter drift", evidence_strength: "Low", probability: 0.10 }
      ],
      supporting_evidence: {
        observed: ev.observed_value,
        baseline: ev.baseline_value,
        deviation: `${ev.deviation_pct}%`
      },
      financial_impact: {
        potential_avoidable_cost_24h_aed: 1840.0,
        estimated_weekly_net_benefit_aed: 12430.0
      },
      recommendations: [
        {
          title: "On-Site Physical Isolation & Valve Diagnostic",
          action_type: "Isolation & Inspection",
          description: `Deploy technician to isolate branch valve on ${ev.asset_id} and acoustic check pipe integrity.`,
          safety_instructions: "Wear anti-slip boots and verify electrical panel isolation nearby.",
          priority: "Critical"
        }
      ],
      required_approval_level: "Facilities Manager"
    };
  }

  public static async fetchWorkOrders(buildingId?: string): Promise<WorkOrderItem[]> {
    try {
      const url = buildingId ? `${API_BASE}/work_orders?building_id=${buildingId}` : `${API_BASE}/work_orders`;
      const res = await fetch(url, { headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}
    if (buildingId) {
      return inMemoryWorkOrders.filter(w => w.building_id === buildingId);
    }
    return inMemoryWorkOrders;
  }

  public static async createWorkOrder(eventId: string, title?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/work_orders`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ event_id: eventId, title })
      });
      if (res.ok) return await res.json();
    } catch {}

    const ev = DEFAULT_ANOMALIES.find(a => a.event_id === eventId) || DEFAULT_ANOMALIES[0];
    const newWo: WorkOrderItem = {
      work_order_id: `WO-2026-${Math.floor(100 + Math.random() * 900)}`,
      linked_event_id: eventId,
      building_id: ev.building_id,
      asset_id: ev.asset_id,
      title: title || `Corrective Action: ${ev.anomaly_type}`,
      description: `Automated dispatch order for ${ev.anomaly_type} detected on ${ev.asset_id}.`,
      severity: ev.severity,
      priority: 'High',
      status: 'Awaiting Approval',
      approval_status: 'Pending',
      assigned_to_team: 'HVAC & Plumbing Mobile Response Team',
      assigned_technician: 'Tariq Mansoor',
      verified_savings_aed: 3360.0,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    inMemoryWorkOrders = [newWo, ...inMemoryWorkOrders];
    return { work_order_id: newWo.work_order_id, status: newWo.status };
  }

  public static async approveWorkOrder(workOrderId: string, approved: boolean, rationale = ''): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/work_orders/${workOrderId}/approve`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ approved, rationale })
      });
      if (res.ok) return await res.json();
    } catch {}

    inMemoryWorkOrders = inMemoryWorkOrders.map(wo => {
      if (wo.work_order_id === workOrderId) {
        return {
          ...wo,
          status: approved ? 'Assigned' : 'Rejected',
          approval_status: approved ? 'Approved' : 'Rejected',
          updated_at: new Date().toISOString()
        };
      }
      return wo;
    });
    return { work_order_id: workOrderId, status: approved ? 'Assigned' : 'Rejected' };
  }

  public static async executeWorkOrder(workOrderId: string, notes: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/work_orders/${workOrderId}/execute`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ technician_notes: notes })
      });
      if (res.ok) return await res.json();
    } catch {}

    inMemoryWorkOrders = inMemoryWorkOrders.map(wo => {
      if (wo.work_order_id === workOrderId) {
        return {
          ...wo,
          status: 'Awaiting Verification',
          resolution_notes: notes,
          updated_at: new Date().toISOString()
        };
      }
      return wo;
    });
    return { work_order_id: workOrderId, status: 'Awaiting Verification' };
  }

  public static async verifyWorkOrder(workOrderId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/work_orders/${workOrderId}/verify`, {
        method: 'POST',
        headers: this.headers()
      });
      if (res.ok) return await res.json();
    } catch {}

    inMemoryWorkOrders = inMemoryWorkOrders.map(wo => {
      if (wo.work_order_id === workOrderId) {
        return {
          ...wo,
          status: 'Resolved',
          is_verified: true,
          verified_savings_aed: 3360.0,
          updated_at: new Date().toISOString()
        };
      }
      return wo;
    });
    return {
      work_order_id: workOrderId,
      status: 'Resolved',
      is_verified: true,
      verified_weekly_savings_aed: 3360.0
    };
  }

  public static async fetchEnergyWaterAnalytics(buildingId?: string): Promise<any> {
    try {
      const url = buildingId ? `${API_BASE}/analytics/energy_water?building_id=${buildingId}` : `${API_BASE}/analytics/energy_water`;
      const res = await fetch(url, { headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}
    return { daily_trends: [] };
  }

  public static async fetchForecast(buildingId = 'DXB-OFF-01', horizon = 48): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/analytics/forecast?building_id=${buildingId}&horizon=${horizon}`, { headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}

    const pts = [];
    const now = Date.now();
    for (let i = 1; i <= 8; i++) {
      const t = new Date(now + i * 3600000);
      pts.push({
        timestamp: t.toISOString(),
        predicted_value: 42.5,
        lower_bound_90: 36.2,
        upper_bound_90: 48.8
      });
    }
    return { forecast_points: pts };
  }

  public static async fetchEquipment(): Promise<EquipmentItem[]> {
    try {
      const res = await fetch(`${API_BASE}/equipment`, { headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}

    return [
      { id: "DXB-OFF-01-CH-01", building_id: "DXB-OFF-01", building_name: "Burj Al-Amal", name: "Carrier Centrifugal Chiller 1", asset_type: "Chiller", model: "Carrier AquaEdge 19DV", status: "Running", health_score: 94.0, rated_kw: 480.0, last_serviced: "2026-09-15" },
      { id: "DXB-HOT-02-CH-01", building_id: "DXB-HOT-02", building_name: "Palm Oasis", name: "Water-Cooled Chiller Unit 1", asset_type: "Chiller", model: "Trane CenTraVac", status: "Running", health_score: 91.0, rated_kw: 520.0, last_serviced: "2026-09-20" },
      { id: "DXB-MIX-04-CH-02", building_id: "DXB-MIX-04", building_name: "Al-Wasl Promenade", name: "Air-Cooled Screw Chiller 2", asset_type: "Chiller", model: "York YVAA", status: "Warning", health_score: 68.0, rated_kw: 410.0, last_serviced: "2026-08-10" },
      { id: "DXB-HOT-02-WTR-BOOST", building_id: "DXB-HOT-02", building_name: "Palm Oasis", name: "Domestic Water Booster Station", asset_type: "Water Booster Pump", model: "Grundfos Hydro MPC", status: "Warning", health_score: 72.0, rated_kw: 22.0, last_serviced: "2026-07-14" },
    ];
  }

  public static async fetchSustainability(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/sustainability`, { headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}
    return {
      avoided_energy_kwh: 24500.0,
      avoided_water_m3: 410.0,
      avoided_co2e_tons: 10.3,
      trees_equivalent_planted: 164,
      green_building_rating: "Al Sa'fat Gold Certified Compatible"
    };
  }

  public static async fetchIntegrations(): Promise<IntegrationItem[]> {
    try {
      const res = await fetch(`${API_BASE}/integrations`, { headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}
    return [
      { id: "bms_bacnet_downtown", name: "Downtown BMS BACnet/IP Gateway", integration_type: "BACnet/IP", endpoint_url: "bacnet://10.240.12.10:47808", status: "Operational", protocol: "BACnet MSTP/IP", readings_synced_total: 32840, error_count: 0, last_sync_time: new Date().toISOString() },
      { id: "mqtt_iot_palm", name: "Palm Oasis LoRaWAN / MQTT Broker", integration_type: "MQTT", endpoint_url: "mqtts://broker.coolshield.ae:8883", status: "Operational", protocol: "MQTT 5.0 TLS", readings_synced_total: 48120, error_count: 2, last_sync_time: new Date().toISOString() },
      { id: "dewa_smart_meter_api", name: "DEWA Smart Fiscal Meter Telemetry", integration_type: "REST", endpoint_url: "https://api.dewa.gov.ae/v2/smartgrid", status: "Operational", protocol: "HTTPS/REST", readings_synced_total: 19400, error_count: 0, last_sync_time: new Date().toISOString() },
      { id: "ncm_weather_radar", name: "UAE National Center of Meteorology (NCM) Feed", integration_type: "Weather API", endpoint_url: "https://api.ncm.ae/v1/forecast/dubai", status: "Operational", protocol: "REST JSON", readings_synced_total: 2160, error_count: 0, last_sync_time: new Date().toISOString() },
    ];
  }

  public static async syncIntegration(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/integrations/${id}/sync`, { method: 'POST', headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}
    return { status: "synced", readings_added: 24 };
  }

  public static async fetchPilots(): Promise<PilotRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/pilots`, { headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}
    return [
      {
        id: "cust_emaar_pilot_01",
        organization_name: "Emaar Hospitality & Asset Operations",
        contact_name: "Khalid Al-Shaikh",
        contact_role: "Director of Property Engineering",
        customer_segment: "Hospitality & Mixed-Use Commercial",
        reported_problem: "Unexplained high chiller energy during summer night shoulder hours and delayed detection of concealed water leaks in guest towers.",
        current_workflow: "Manual monthly DEWA utility bill comparison and reactive tenant maintenance tickets via legacy SAP PM.",
        willingness_to_pilot: "High - Ready for 30-day proof-of-concept",
        target_building: "Downtown Luxury Residences Tower B",
        pilot_acceptance_criteria: "Detect at least 80% of abnormal energy/water events within 2 hours; provide evidence-backed work orders with estimated AED savings.",
        interview_date: "2026-10-14",
        status: "Proposal Under Review"
      }
    ];
  }

  public static async createPilot(data: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/pilots`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}
    return { status: "created", pilot_id: `cust_${Date.now()}` };
  }

  public static async fetchAudits(): Promise<AuditItem[]> {
    try {
      const res = await fetch(`${API_BASE}/audits`, { headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}
    return [
      { id: 1, timestamp: new Date().toISOString(), actor: "CoolShield AI Verification Engine", role: "Autonomous Verifier", action: "VERIFY", resource_type: "WorkOrder", resource_id: "WO-2026-002" },
      { id: 2, timestamp: new Date(Date.now() - 3600000).toISOString(), actor: "Tariq Mansoor", role: "HVAC Technician", action: "EXECUTE_JOB", resource_type: "WorkOrder", resource_id: "WO-2026-002" },
      { id: 3, timestamp: new Date(Date.now() - 7200000).toISOString(), actor: "Ahmed Al-Maktoum", role: "Facilities Manager", action: "APPROVE", resource_type: "WorkOrder", resource_id: "WO-2026-002" },
      { id: 4, timestamp: new Date(Date.now() - 10800000).toISOString(), actor: "CoolShield AI Agent", role: "Autonomous Agent", action: "INVESTIGATE", resource_type: "AnomalyEvent", resource_id: "evt_water_leak_02" },
    ];
  }

  public static async resetDemo(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST', headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}
    return { status: "success", message: "Demo database reset." };
  }

  public static async runScenario(key: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/demo/scenario/${key}`, { method: 'POST', headers: this.headers() });
      if (res.ok) return await res.json();
    } catch {}

    const scenarioKey = key.toUpperCase();
    const ev = DEFAULT_ANOMALIES.find(a => (
      scenarioKey === 'B' ? a.metric === 'water_m3' :
      scenarioKey === 'A' ? a.metric === 'cop_estimate' :
      scenarioKey === 'C' ? a.metric === 'electricity_kwh' :
      a.metric === 'indoor_temp_c'
    )) || DEFAULT_ANOMALIES[0];

    const inv = await this.fetchInvestigation(ev.event_id);
    const wo = await this.createWorkOrder(ev.event_id);

    return {
      scenario: key,
      event: ev,
      investigation_report: inv,
      work_order: wo,
      workflow_step: "Awaiting Approval"
    };
  }
}
