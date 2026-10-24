/**
 * CoolShield AI - Resilient API Client
 * Connects the React SPA to FastAPI backend with full in-memory fallback
 * for seamless Vercel Cloud and Edge deployments.
 */

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api/v1';

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

export interface OptimizationPlanItem {
  plan_id: string;
  building_id: string;
  trigger_reason: string;
  eligible_loads: Array<{ asset_id: string; name: string; action: string; load_reduction_kw: number }>;
  safety_constraints: { min_indoor_temp_c: number; max_indoor_temp_c: number; min_ventilation_cfm_per_person: number };
  estimated_demand_reduction_kw: number;
  estimated_cost_avoided_aed: number;
  approval_status: string;
  approved_by?: string;
  execution_status: string;
  baseline_kw: number;
  actual_kw: number;
  verified_savings_kw: number;
  created_at: string;
}

export interface CommunityResourceItem {
  id: string;
  name: string;
  category: string;
  district: string;
  address: string;
  coordinates: { lat: number; lng: number };
  opening_hours: string;
  contact_phone: string;
  services_offered: string[];
  wheelchair_accessible: boolean;
  max_capacity: number;
  current_availability: string;
}

export interface CommunityServiceRequestItem {
  request_id: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  assigned_team: string;
  created_at: string;
}

export interface SustainabilityChallengeItem {
  id: string;
  title: string;
  category: string;
  description: string;
  target_metric: string;
  total_participants: number;
  aggregate_savings_kwh_or_m3: number;
  status: string;
  start_date: string;
  end_date: string;
}

export interface EducationalContentItem {
  id: string;
  title: string;
  topic: string;
  key_takeaway: string;
  translations: Record<string, string>;
}

export interface WeatherRiskItem {
  provider: string;
  dry_bulb_temperature_c: number;
  relative_humidity_pct: number;
  calculated_heat_index_c: number;
  aqi_pm25_ug_m3: number;
  risk_category: string;
  outdoor_warning: string;
  active_incident?: {
    incident_id: string;
    type: string;
    severity: string;
    recommended_action: string;
    recommended_cooling_shelter_id?: string;
  };
}

export interface ESGReportItem {
  report_id: string;
  building_id: string;
  reporting_period: string;
  scope_1_direct_kgco2e: number;
  scope_2_electricity_kgco2e: number;
  total_emissions_mtco2e: number;
  operational_reductions_mtco2e: number;
  carbon_offsets: {
    purchased_mtco2e: number;
    provider: string;
    serial_number: string;
    accounting_note: string;
  };
  standards_compliance: string;
  auditor_status: string;
}

export interface WorkflowItem {
  id: string;
  name: string;
  trigger: string;
  latency: string;
  status: string;
  schedule: string;
}

export interface AgentToolItem {
  name: string;
  risk_level: string;
  category: string;
  approval_required: boolean;
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return DEFAULT_KPIS;
  }

  public static async fetchBuildings(): Promise<BuildingItem[]> {
    try {
      const res = await fetch(`${API_BASE}/buildings`, { headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return DEFAULT_BUILDINGS;
  }

  public static async fetchTelemetry(buildingId: string, limit = 168): Promise<TelemetryReading[]> {
    try {
      const res = await fetch(`${API_BASE}/buildings/${buildingId}/telemetry?limit=${limit}`, { headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    if (buildingId) {
      return DEFAULT_ANOMALIES.filter(a => a.building_id === buildingId);
    }
    return DEFAULT_ANOMALIES;
  }

  public static async fetchInvestigation(eventId: string): Promise<InvestigationReport> {
    try {
      const res = await fetch(`${API_BASE}/anomalies/${eventId}/investigate`, { headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return { daily_trends: [] };
  }

  public static async fetchForecast(buildingId = 'DXB-OFF-01', horizon = 48): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/analytics/forecast?building_id=${buildingId}&horizon=${horizon}`, { headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return { status: "synced", readings_added: 24 };
  }

  public static async fetchPilots(): Promise<PilotRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/pilots`, { headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return { status: "created", pilot_id: `cust_${Date.now()}` };
  }

  public static async fetchAudits(): Promise<AuditItem[]> {
    try {
      const res = await fetch(`${API_BASE}/audits`, { headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return { status: "success", message: "Demo database reset." };
  }

  public static async runScenario(key: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/demo/scenario/${key}`, { method: 'POST', headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
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

  // ---------------------------------------------------------------------------
  // Societal AI Modules: Peak Demand, ESG, Social Inclusion, Education, Resilience
  // ---------------------------------------------------------------------------
  public static async fetchOptimizationPlans(): Promise<OptimizationPlanItem[]> {
    try {
      const res = await fetch(`${API_BASE}/optimization/plans`, { headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return [
      {
        plan_id: "opt_plan_peak_dxb01",
        building_id: "DXB-OFF-01",
        trigger_reason: "DEWA Peak Tariff Window (12:00 - 18:00)",
        eligible_loads: [
          { asset_id: "DXB-OFF-01-CH-01", name: "Chiller 1", action: "Increase CHW setpoint from 6.8°C to 8.0°C", load_reduction_kw: 115.0 },
          { asset_id: "DXB-OFF-01-AHU-04", name: "Podium AHU 4", action: "Modulate supply fan VFD speed to 82%", load_reduction_kw: 18.0 }
        ],
        safety_constraints: { min_indoor_temp_c: 23.5, max_indoor_temp_c: 25.5, min_ventilation_cfm_per_person: 15.0 },
        estimated_demand_reduction_kw: 133.0,
        estimated_cost_avoided_aed: 495.0,
        approval_status: "Pending",
        execution_status: "Draft",
        baseline_kw: 820.0,
        actual_kw: 0.0,
        verified_savings_kw: 0.0,
        created_at: new Date().toISOString()
      }
    ];
  }

  public static async approveOptimizationPlan(planId: string, approved: boolean): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/optimization/plans/${planId}/approve`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ approved })
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return { plan_id: planId, approval_status: approved ? "Approved" : "Rejected" };
  }

  public static async executeOptimizationPlan(planId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/optimization/plans/${planId}/execute`, {
        method: 'POST',
        headers: this.headers()
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return {
      plan_id: planId,
      execution_status: "Executed & Verified",
      baseline_kw: 820.0,
      actual_kw: 687.0,
      verified_savings_kw: 133.0,
      safety_breach_detected: false
    };
  }

  public static async fetchCommunityResources(district?: string, category?: string): Promise<CommunityResourceItem[]> {
    try {
      const query = new URLSearchParams();
      if (district && district !== 'All') query.append('district', district);
      if (category && category !== 'All') query.append('category', category);
      const res = await fetch(`${API_BASE}/community/resources?${query.toString()}`, { headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return [
      {
        id: "res_cooling_albarsha",
        name: "Al Barsha Community Centre Cooling Hub",
        category: "Cooling Shelter",
        district: "Al Barsha 2",
        address: "9th Street, Al Barsha 2, Dubai",
        coordinates: { lat: 25.1098, lng: 55.2012 },
        opening_hours: "07:00 - 23:00",
        contact_phone: "+971-4-800-900",
        services_offered: ["Air conditioned cooling lounge", "Free chilled hydration electrolyte station", "Wi-Fi & Device charging"],
        wheelchair_accessible: true,
        max_capacity: 220,
        current_availability: "Open"
      },
      {
        id: "res_happiness_downtown",
        name: "Downtown Dubai Customer Happiness Centre",
        category: "Happiness Centre",
        district: "Downtown Dubai",
        address: "Financial Centre Road, Downtown Dubai",
        coordinates: { lat: 25.1972, lng: 55.2744 },
        opening_hours: "08:00 - 20:00",
        contact_phone: "+971-4-800-3392",
        services_offered: ["DEWA smart bill consultations", "Multilingual translation assistance (6 languages)"],
        wheelchair_accessible: true,
        max_capacity: 160,
        current_availability: "Open"
      },
      {
        id: "res_cooling_deira",
        name: "Deira Heritage Public Library & Climate Haven",
        category: "Cooling Shelter",
        district: "Deira / Al Ras",
        address: "Al Khaleej Road, Al Ras, Dubai",
        coordinates: { lat: 25.2711, lng: 55.2974 },
        opening_hours: "08:00 - 22:00",
        contact_phone: "+971-4-515-5000",
        services_offered: ["Climate-controlled study halls", "Filtered water dispensers", "Children literacy zone"],
        wheelchair_accessible: true,
        max_capacity: 180,
        current_availability: "Open"
      },
      {
        id: "res_clinic_alwasl",
        name: "Al Wasl Health & Wellness Clinic",
        category: "Health Clinic",
        district: "City Walk / Al Wasl",
        address: "Al Wasl Road, Jumeirah 1, Dubai",
        coordinates: { lat: 25.2150, lng: 55.2580 },
        opening_hours: "08:00 - 21:00",
        contact_phone: "+971-4-344-0000",
        services_offered: ["Heat stress recovery & rehydration", "Respiratory consultation"],
        wheelchair_accessible: true,
        max_capacity: 90,
        current_availability: "Open"
      }
    ];
  }

  public static async createServiceRequest(data: { category: string; description: string; language?: string; priority?: string }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/community/service-requests`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(data)
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    // In-memory sanitized ticket
    let text = data.description || '';
    text = text.replace(/[\w\.-]+@[\w\.-]+/g, '[EMAIL REDACTED]');
    text = text.replace(/(\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{3,5}/g, '[PHONE REDACTED]');
    return {
      request_id: `SR-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: "Received",
      assigned_team: "Community Operations & Facilities Support",
      message: "Service ticket logged with PII protection."
    };
  }

  public static async fetchServiceRequests(): Promise<CommunityServiceRequestItem[]> {
    try {
      const res = await fetch(`${API_BASE}/community/service-requests`, { headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return [
      {
        request_id: "SR-2026-401",
        category: "Thermal Comfort & Cooling",
        description: "Zone temperature is 26.5C in Level 4 common corridor. [EMAIL REDACTED]",
        priority: "Routine",
        status: "Assigned",
        assigned_team: "HVAC Operations",
        created_at: new Date().toISOString()
      },
      {
        request_id: "SR-2026-398",
        category: "Indoor Air Quality",
        description: "Dust odor reported near Podium Fresh Air intake. [PHONE REDACTED]",
        priority: "Urgent",
        status: "In Progress",
        assigned_team: "Filter Maintenance",
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ];
  }

  public static async fetchSustainabilityChallenges(): Promise<SustainabilityChallengeItem[]> {
    try {
      const res = await fetch(`${API_BASE}/community/challenges`, { headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return [
      {
        id: "ch_2026_w43",
        title: "Dubai 24°C Comfort & Cool Sprint (Week 43)",
        category: "Energy Conservation",
        description: "Keep indoor thermostat at 24°C or above during DEWA peak tariff hours (12:00 - 18:00) to support grid stability.",
        target_metric: "Thermostat setpoint >= 24°C during 12:00-18:00 window",
        total_participants: 164,
        aggregate_savings_kwh_or_m3: 3640.0,
        status: "Active",
        start_date: "2026-10-20",
        end_date: "2026-10-27"
      },
      {
        id: "ch_2026_w42",
        title: "Zero Night Flow Water Leak Audit",
        category: "Water Stewardship",
        description: "Verify zero unexplained flow in domestic booster and sub-meters between 02:00 AM and 05:00 AM.",
        target_metric: "Zero unexpected baseline flow in dormant hours",
        total_participants: 98,
        aggregate_savings_kwh_or_m3: 215.0,
        status: "Active",
        start_date: "2026-10-18",
        end_date: "2026-10-25"
      }
    ];
  }

  public static async pledgeChallenge(challengeId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/community/challenges/${challengeId}/participate`, {
        method: 'POST',
        headers: this.headers()
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return { status: "pledged", challenge_id: challengeId };
  }

  public static async fetchEducationalContent(): Promise<EducationalContentItem[]> {
    try {
      const res = await fetch(`${API_BASE}/community/education`, { headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return [
      {
        id: "edu_comfort_24",
        title: "The 24°C Comfort Standard: Efficiency & Well-being",
        topic: "Thermostat Setpoints",
        key_takeaway: "Every 1°C increase in AC setpoint saves ~9% electricity without compromising thermal comfort.",
        translations: {
          en: "Setting your thermostat to 24°C provides ideal thermal comfort under UAE conditions while cutting cooling electricity by up to 9% per degree Celsius compared to 20°C.",
          ar: "إن ضبط منظم الحرارة (الثرموستات) عند 24 درجة مئوية يوفر الراحة الحرارية المثالية في مناخ الإمارات مع خفض استهلاك طاقة التبريد بنسبة تصل إلى 9% لكل درجة مئوية مقارنة بـ 20 درجة.",
          hi: "अपने थर्मोस्टेट को 24 डिग्री सेल्सियस पर सेट करने से यूएई की जलवायु में आदर्श आराम मिलता है और 20 डिग्री की तुलना में ऊर्जा की खपत में 9% तक की कमी आती है।",
          ur: "تھرموسٹیٹ کو 24 ڈگری سینٹی گریڈ پر رکھنا مثالی آرام فراہم کرتا ہے اور 20 ڈگری کے مقابلے میں 9 فیصد تک بجلی کی بچت کرتا ہے۔",
          ml: "തെർമോസ്റ്റാറ്റ് 24 ഡിഗ്രി സെൽഷ്യസിൽ ക്രമീകരിക്കുന്നത് യുഎഇയിലെ താപനിലയിൽ മികച്ച സുഖസൗകര്യം നൽകുകയും തണുപ്പിക്കൽ ഊർജ്ജം 9% വരെ കുറയ്ക്കുകയും ചെയ്യുന്നു.",
          fil: "Ang pag-set ng thermostat sa 24°C ay nagbibigay ng perpektong ginhawa sa klima ng UAE habang binabawasan ang pagkonsumo ng kuryente nang hanggang 9%."
        }
      },
      {
        id: "edu_water_leak_detect",
        title: "Early Detection of Concealed Water Leaks",
        topic: "Water Stewardship",
        key_takeaway: "Check sub-meter baseline flow between 02:00 AM and 05:00 AM when occupancy is dormant.",
        translations: {
          en: "A continuous trickle of just 1 liter per minute from a concealed booster pump or toilet cistern wastes over 1,440 liters daily (~AED 650/month in Dubai tariffs).",
          ar: "إن تسرباً خفياً مستمراً بمعدل لتر واحد فقط في الدقيقة يهدر أكثر من 1,440 لتراً يومياً (حوالي 650 درهماً شهرياً وفق تسعيرة ديوا في دبي).",
          hi: "प्रति मिनट सिर्फ 1 लीटर का निरंतर रिसाव रोजाना 1,440 लीटर पानी बर्बाद करता है (दुबई टैरिफ में लगभग 650 दिरहम प्रति माह)।",
          ur: "ایک منٹ میں صرف ایک لیٹر کا مسلسل رساؤ روزانہ 1440 لیٹر پانی ضائع کرتا ہے۔",
          ml: "ഒരു മിനിറ്റിൽ 1 ലിറ്റർ വെള്ളം ചോരുന്നത് പ്രതിദിനം 1,440 ലിറ്റർ വെള്ളം പാഴാക്കുന്നു.",
          fil: "Ang patuloy na pagtagas ng 1 litro kada minuto ay nag-aaksaya ng higit sa 1,440 litro ng tubig araw-araw."
        }
      }
    ];
  }

  public static async fetchWeatherRisk(): Promise<WeatherRiskItem> {
    try {
      const res = await fetch(`${API_BASE}/resilience/weather-risk`, { headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return {
      provider: "UAE National Center of Meteorology (NCM) & Dubai Municipality Feed",
      dry_bulb_temperature_c: 41.5,
      relative_humidity_pct: 68.0,
      calculated_heat_index_c: 43.8,
      aqi_pm25_ug_m3: 86.0,
      risk_category: "Alert",
      outdoor_warning: "High heat stress risk for outdoor maintenance personnel and elderly tenants.",
      active_incident: {
        incident_id: "res_heat_2026_01",
        type: "Extreme Heat Wave Advisory",
        severity: "Alert",
        recommended_action: "Activate pre-cooling cycle; route vulnerable personnel to verified Al Barsha & Downtown cooling hubs.",
        recommended_cooling_shelter_id: "res_cooling_albarsha"
      }
    };
  }

  public static async fetchESGReport(): Promise<ESGReportItem> {
    try {
      const res = await fetch(`${API_BASE}/esg/report`, { headers: this.headers() });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return {
      report_id: "esg_q3_2026_portfolio",
      building_id: "PORTFOLIO",
      reporting_period: "2026-Q3",
      scope_1_direct_kgco2e: 1420.0,
      scope_2_electricity_kgco2e: 52400.0,
      total_emissions_mtco2e: 53.82,
      operational_reductions_mtco2e: 7.45,
      carbon_offsets: {
        purchased_mtco2e: 5.0,
        provider: "Dubai Carbon Centre of Excellence (DCCE)",
        serial_number: "DCCE-UAE-2026-8819A",
        accounting_note: "Carbon offsets are reported strictly as separate line items and are NOT subtracted from operational Scope 1 and Scope 2 totals."
      },
      standards_compliance: "GHG Protocol Corporate Standard / DEWA Grid Factor (0.42 kg CO2e/kWh)",
      auditor_status: "Verified by Independent ESG Assurance"
    };
  }

  public static async fetchWorkflows(): Promise<WorkflowItem[]> {
    try {
      const res = await fetch(`${API_BASE}/workflows/status`, { headers: this.headers() });
      if (res.ok) {
        const d = await res.json();
        return (d.workflows || []).map((w: any) => ({
          id: w.workflow_id,
          name: w.name,
          trigger: w.trigger_type,
          latency: `${w.latency_ms}ms`,
          status: w.status,
          schedule: w.trigger_type === 'Webhook' ? 'Continuous Webhook' : 'Scheduled'
        }));
      }
    } catch {}
    return [
      { id: "01_sensor_ingestion", name: "01 Sensor Ingestion & Quality Validation", trigger: "Webhook", latency: "85ms", status: "HEALTHY", schedule: "Continuous Webhook" },
      { id: "02_energy_anomaly_detection", name: "02 Energy & Water Anomaly Detection Engine", trigger: "Schedule", latency: "240ms", status: "HEALTHY", schedule: "Every 15 min" },
      { id: "03_peak_demand_optimization", name: "03 Peak-Demand & Pre-Cooling Optimizer", trigger: "Schedule", latency: "165ms", status: "HEALTHY", schedule: "Daily 11:30 AM" },
      { id: "04_human_approval", name: "04 Human Approval & Action Gate", trigger: "Webhook", latency: "110ms", status: "HEALTHY", schedule: "Event-driven" },
      { id: "05_community_inclusion", name: "05 Social Inclusion & Resident Routing", trigger: "Webhook", latency: "95ms", status: "HEALTHY", schedule: "Event-driven" },
      { id: "06_resilience_monitoring", name: "06 NCM Weather & Heat Early Warning", trigger: "Schedule", latency: "140ms", status: "HEALTHY", schedule: "Every 10 min" },
      { id: "07_esg_reporting", name: "07 GHG Scope 1 & 2 ESG Report Generator", trigger: "Schedule", latency: "380ms", status: "HEALTHY", schedule: "Monthly 1st" },
      { id: "08_daily_societal_briefing", name: "08 Daily Societal Operations Briefing", trigger: "Schedule", latency: "290ms", status: "HEALTHY", schedule: "Daily 07:00 AM" },
      { id: "09_workflow_health", name: "09 Autonomous Watchdog & Dead-Letter Queue", trigger: "Schedule", latency: "70ms", status: "HEALTHY", schedule: "Every 5 min" }
    ];
  }

  public static async triggerWorkflow(workflowId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/workflows/trigger/${workflowId}`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ trigger_origin: "vercel_react_ui" })
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) return await res.json();
    } catch {}
    return { status: "recorded", workflow_id: workflowId, execution_status: "SUCCESS" };
  }

  public static async fetchAgentTools(): Promise<AgentToolItem[]> {
    try {
      const res = await fetch(`${API_BASE}/agent/tools`, { headers: this.headers() });
      if (res.ok) {
        const d = await res.json();
        return (d.tools || []).map((t: any) => ({
          name: t.name,
          risk_level: t.risk_level,
          category: t.category,
          approval_required: t.requires_human_approval
        }));
      }
    } catch {}
    return [
      { name: "get_building_context", risk_level: "Read-only", category: "Telemetry & Assets", approval_required: false },
      { name: "get_asset_history", risk_level: "Read-only", category: "Telemetry & Assets", approval_required: false },
      { name: "query_sensor_readings", risk_level: "Read-only", category: "Telemetry & Assets", approval_required: false },
      { name: "run_data_quality_check", risk_level: "Read-only", category: "Quality & Diagnostics", approval_required: false },
      { name: "detect_anomalies", risk_level: "Read-only", category: "Quality & Diagnostics", approval_required: false },
      { name: "investigate_alert", risk_level: "Read-only", category: "Quality & Diagnostics", approval_required: false },
      { name: "forecast_consumption", risk_level: "Read-only", category: "Analytics & Modeling", approval_required: false },
      { name: "calculate_tariff_cost", risk_level: "Read-only", category: "Analytics & Modeling", approval_required: false },
      { name: "generate_recommendation", risk_level: "Low-risk internal", category: "Decision Support", approval_required: false },
      { name: "create_work_order", risk_level: "Consequential", category: "Field Action", approval_required: true },
      { name: "record_approval_decision", risk_level: "Consequential", category: "Governance", approval_required: true },
      { name: "simulate_technician_execution", risk_level: "Low-risk internal", category: "Field Action", approval_required: false },
      { name: "verify_resolution", risk_level: "Low-risk internal", category: "Verification", approval_required: false },
      { name: "get_safety_policy", risk_level: "Read-only", category: "Governance & Safety", approval_required: false },
      { name: "search_verified_community_resources", risk_level: "Read-only", category: "Societal & Community", approval_required: false },
      { name: "create_service_request", risk_level: "Low-risk internal", category: "Societal & Community", approval_required: false },
      { name: "draft_multilingual_announcement", risk_level: "Low-risk internal", category: "Societal & Community", approval_required: false },
      { name: "get_weather_risk", risk_level: "Read-only", category: "Resilience & Early Warning", approval_required: false },
      { name: "generate_esg_report", risk_level: "Low-risk internal", category: "ESG & Carbon", approval_required: false }
    ];
  }
}

