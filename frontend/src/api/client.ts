/**
 * CoolShield AI - API Client
 * Connects the React SPA to the FastAPI backend.
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
    const res = await fetch(`${API_BASE}/kpis`, { headers: this.headers() });
    return res.json();
  }

  public static async fetchBuildings(): Promise<BuildingItem[]> {
    const res = await fetch(`${API_BASE}/buildings`, { headers: this.headers() });
    return res.json();
  }

  public static async fetchTelemetry(buildingId: string, limit = 168): Promise<TelemetryReading[]> {
    const res = await fetch(`${API_BASE}/buildings/${buildingId}/telemetry?limit=${limit}`, { headers: this.headers() });
    return res.json();
  }

  public static async fetchAnomalies(buildingId?: string): Promise<AnomalyEventItem[]> {
    const url = buildingId ? `${API_BASE}/anomalies?building_id=${buildingId}` : `${API_BASE}/anomalies`;
    const res = await fetch(url, { headers: this.headers() });
    return res.json();
  }

  public static async fetchInvestigation(eventId: string): Promise<InvestigationReport> {
    const res = await fetch(`${API_BASE}/anomalies/${eventId}/investigate`, { headers: this.headers() });
    return res.json();
  }

  public static async fetchWorkOrders(buildingId?: string): Promise<WorkOrderItem[]> {
    const url = buildingId ? `${API_BASE}/work_orders?building_id=${buildingId}` : `${API_BASE}/work_orders`;
    const res = await fetch(url, { headers: this.headers() });
    return res.json();
  }

  public static async createWorkOrder(eventId: string, title?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/work_orders`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ event_id: eventId, title })
    });
    return res.json();
  }

  public static async approveWorkOrder(workOrderId: string, approved: boolean, rationale = ''): Promise<any> {
    const res = await fetch(`${API_BASE}/work_orders/${workOrderId}/approve`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ approved, rationale })
    });
    return res.json();
  }

  public static async executeWorkOrder(workOrderId: string, notes: string): Promise<any> {
    const res = await fetch(`${API_BASE}/work_orders/${workOrderId}/execute`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ technician_notes: notes })
    });
    return res.json();
  }

  public static async verifyWorkOrder(workOrderId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/work_orders/${workOrderId}/verify`, {
      method: 'POST',
      headers: this.headers()
    });
    return res.json();
  }

  public static async fetchEnergyWaterAnalytics(buildingId?: string): Promise<any> {
    const url = buildingId ? `${API_BASE}/analytics/energy_water?building_id=${buildingId}` : `${API_BASE}/analytics/energy_water`;
    const res = await fetch(url, { headers: this.headers() });
    return res.json();
  }

  public static async fetchForecast(buildingId = 'DXB-OFF-01', horizon = 48): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics/forecast?building_id=${buildingId}&horizon=${horizon}`, { headers: this.headers() });
    return res.json();
  }

  public static async fetchEquipment(): Promise<EquipmentItem[]> {
    const res = await fetch(`${API_BASE}/equipment`, { headers: this.headers() });
    return res.json();
  }

  public static async fetchSustainability(): Promise<any> {
    const res = await fetch(`${API_BASE}/sustainability`, { headers: this.headers() });
    return res.json();
  }

  public static async fetchIntegrations(): Promise<IntegrationItem[]> {
    const res = await fetch(`${API_BASE}/integrations`, { headers: this.headers() });
    return res.json();
  }

  public static async syncIntegration(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/integrations/${id}/sync`, { method: 'POST', headers: this.headers() });
    return res.json();
  }

  public static async fetchPilots(): Promise<PilotRecord[]> {
    const res = await fetch(`${API_BASE}/pilots`, { headers: this.headers() });
    return res.json();
  }

  public static async createPilot(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/pilots`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async fetchAudits(): Promise<AuditItem[]> {
    const res = await fetch(`${API_BASE}/audits`, { headers: this.headers() });
    return res.json();
  }

  public static async resetDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST', headers: this.headers() });
    return res.json();
  }

  public static async runScenario(key: string): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/scenario/${key}`, { method: 'POST', headers: this.headers() });
    return res.json();
  }
}
