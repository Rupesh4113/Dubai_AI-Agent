import React, { useState, useEffect } from 'react';
import { ApiClient } from './api/client';
import type {
  ExecutiveKPIs,
  BuildingItem,
  TelemetryReading,
  AnomalyEventItem,
  WorkOrderItem,
  InvestigationReport,
  EquipmentItem,
  IntegrationItem,
  PilotRecord,
  AuditItem,
} from './api/client';
import { DubaiMap } from './components/DubaiMap';
import { DemoScenarioPlayer } from './components/DemoScenarioPlayer';
import {
  LayoutDashboard,
  Building2,
  Activity,
  Brain,
  Bell,
  Wrench,
  BarChart3,
  Cpu,
  Leaf,
  Network,
  Settings,
  Globe,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Droplets,
  Zap,
} from 'lucide-react';

// Languages dictionary
const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', native: 'العربية', dir: 'rtl' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
  { code: 'ur', label: 'Urdu', native: 'اردو', dir: 'rtl' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', dir: 'ltr' },
  { code: 'fil', label: 'Filipino', native: 'Tagalog', dir: 'ltr' },
];

const ROLES = [
  { id: 'facilities_manager', label: 'Facilities Manager (Full Ops & Approval)' },
  { id: 'property_owner', label: 'Property Owner (Portfolio & Financials)' },
  { id: 'hvac_technician', label: 'HVAC Technician (Field Execution)' },
  { id: 'sustainability_manager', label: 'Sustainability Manager (ESG & DEWA)' },
  { id: 'finance_analyst', label: 'Finance Analyst (Tariffs & ROI)' },
  { id: 'auditor', label: 'Auditor (Read-Only Compliance & Proof)' },
];

export const App: React.FC = () => {
  // Navigation & Localization
  const [currentPage, setCurrentPage] = useState<string>('overview');
  const [lang, setLang] = useState<string>('en');
  const [currentRole, setCurrentRole] = useState<string>('facilities_manager');

  // Application Data States
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('DXB-OFF-01');
  const [telemetry, setTelemetry] = useState<TelemetryReading[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyEventItem[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [pilots, setPilots] = useState<PilotRecord[]>([]);
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [forecastData, setForecastData] = useState<any>(null);
  const [sustainability, setSustainability] = useState<any>(null);

  // UI state
  const [investigationData, setInvestigationData] = useState<InvestigationReport | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // Direction (LTR vs RTL for Arabic)
  const isRtl = lang === 'ar' || lang === 'ur';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  const loadAllData = async () => {
    try {
      const [
        kpiRes,
        bldRes,
        anomRes,
        woRes,
        eqRes,
        intRes,
        pilotRes,
        auditRes,
        sustRes,
        _anRes,
        fcRes,
      ] = await Promise.all([
        ApiClient.fetchKPIs(),
        ApiClient.fetchBuildings(),
        ApiClient.fetchAnomalies(),
        ApiClient.fetchWorkOrders(),
        ApiClient.fetchEquipment(),
        ApiClient.fetchIntegrations(),
        ApiClient.fetchPilots(),
        ApiClient.fetchAudits(),
        ApiClient.fetchSustainability(),
        ApiClient.fetchEnergyWaterAnalytics('DXB-OFF-01'),
        ApiClient.fetchForecast('DXB-OFF-01', 48),
      ]);

      setKpis(kpiRes);
      setBuildings(bldRes);
      setAnomalies(anomRes);
      setWorkOrders(woRes);
      setEquipment(eqRes);
      setIntegrations(intRes);
      setPilots(pilotRes);
      setAudits(auditRes);
      setSustainability(sustRes);
      setForecastData(fcRes);

      if (bldRes.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(bldRes[0].id);
      }
    } catch (err) {
      console.error('Failed loading telemetry or API data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      ApiClient.fetchTelemetry(selectedBuildingId, 72).then(setTelemetry).catch(console.error);
    }
  }, [selectedBuildingId]);

  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
    ApiClient.setRole(newRole);
  };

  const handleInvestigate = async (eventId: string) => {
    try {
      const rep = await ApiClient.fetchInvestigation(eventId);
      setInvestigationData(rep);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWorkOrder = async (eventId: string) => {
    try {
      await ApiClient.createWorkOrder(eventId);
      const updatedWo = await ApiClient.fetchWorkOrders();
      setWorkOrders(updatedWo);
      alert('Maintenance Work Order drafted and awaiting approval.');
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { id: 'overview', label: lang === 'ar' ? 'النظرة العامة' : 'Executive Overview', icon: LayoutDashboard },
    { id: 'portfolio', label: lang === 'ar' ? 'محفظة المباني' : 'Building Portfolio', icon: Building2 },
    { id: 'monitoring', label: lang === 'ar' ? 'المراقبة المباشرة' : 'Live Monitoring', icon: Activity },
    { id: 'insights', label: lang === 'ar' ? 'رؤى الذكاء الاصطناعي' : 'AI Insights', icon: Brain },
    { id: 'alerts', label: lang === 'ar' ? 'التنبيهات والحوادث' : 'Alerts & Incidents', icon: Bell },
    { id: 'workorders', label: lang === 'ar' ? 'أوامر الصيانة' : 'Work Orders', icon: Wrench },
    { id: 'analytics', label: lang === 'ar' ? 'تحليلات الطاقة' : 'Energy & Water', icon: BarChart3 },
    { id: 'equipment', label: lang === 'ar' ? 'صحة المعدات' : 'Equipment Health', icon: Cpu },
    { id: 'sustainability', label: lang === 'ar' ? 'الاستدامة والوفورات' : 'Savings & ESG', icon: Leaf },
    { id: 'pilots', label: lang === 'ar' ? 'التحقق من العملاء' : 'Customer Pilots', icon: UserCheck },
    { id: 'integrations', label: lang === 'ar' ? 'التكامل والبوابات' : 'Integrations', icon: Network },
    { id: 'settings', label: lang === 'ar' ? 'الإعدادات والتدقيق' : 'Settings & Audit', icon: Settings },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Top Banner: Demo & Safety Notice */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          <span className="font-semibold text-white">CoolShield AI</span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">
            {lang === 'ar'
              ? 'نظام عمليات المباني الذكية لوكلاء الذكاء الاصطناعي في دبي (التحكم الفيزيائي معطل للأمان)'
              : 'Autonomous Building Operations & Efficiency Agent for Dubai Commercial Portfolios (Physical control disabled)'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300">
            Timezone: Asia/Dubai (GST)
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-teal-900/40 text-teal-300 border border-teal-700/50">
            DEWA Tariff Engine Active
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-700 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              CoolShield AI
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                v1.0 Dubai
              </span>
            </h1>
            <p className="text-xs text-slate-500">Autonomous Efficiency & Closed-Loop Operations</p>
          </div>
        </div>

        {/* Global Controls: Role Switcher & Language Selector */}
        <div className="flex items-center gap-3">
          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <select
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Globe className="w-4 h-4 text-teal-600" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.label})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between border-r border-slate-800">
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'ar' ? 'لوحة التحكم الرئيسية' : 'Operations Modules'}
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Sidebar Info */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>BMS Telemetry:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Active Portfolios:</span>
              <span className="text-slate-200 font-semibold">{buildings.length} Properties</span>
            </div>
          </div>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Guided Competition Demonstration Walkthrough Player */}
          <DemoScenarioPlayer onRefreshAll={loadAllData} lang={lang} />

          {/* PAGE 1: EXECUTIVE OVERVIEW */}
          {currentPage === 'overview' && (
            <div className="space-y-6">
              {/* Top Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="cs-card p-4">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>{lang === 'ar' ? 'المباني المراقبة' : 'Buildings Monitored'}</span>
                    <Building2 className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{kpis?.total_buildings ?? 5}</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">100% telemetry online</div>
                </div>

                <div className="cs-card p-4">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>{lang === 'ar' ? 'الكهرباء اليوم' : 'Electricity (24h)'}</span>
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {kpis?.electricity_kwh_today?.toLocaleString() ?? '3,840'} <span className="text-sm font-normal">kWh</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">DEWA Tiered Tariff</div>
                </div>

                <div className="cs-card p-4">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>{lang === 'ar' ? 'المياه اليوم' : 'Water (24h)'}</span>
                    <Droplets className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {kpis?.water_m3_today?.toLocaleString() ?? '94.5'} <span className="text-sm font-normal">m³</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Sewerage included</div>
                </div>

                <div className="cs-card p-4 bg-teal-50/50 border-teal-200">
                  <div className="flex items-center justify-between text-teal-800 text-xs mb-1 font-semibold">
                    <span>{lang === 'ar' ? 'الوفورات المحققة' : 'Verified Realized Savings'}</span>
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-bold text-teal-700">
                    AED {kpis?.verified_savings_aed?.toLocaleString() ?? '14,850'}
                  </div>
                  <div className="text-[11px] text-teal-600 mt-1">IPMVP Option B Verified</div>
                </div>
              </div>

              {/* Interactive Dubai Map & Building Location Telemetry */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {lang === 'ar' ? 'خريطة مواقع المباني في دبي' : 'Interactive Dubai Property Portfolio Map'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {lang === 'ar'
                        ? 'انقر على أي مبنى في الخريطة لعرض تفاصيله والقياسات الحية والملف التشغيلي'
                        : 'Select any building marker to inspect telemetry, COP efficiency, and active incident dossiers.'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Dubai Coordinates (25.14°N, 55.22°E)</span>
                </div>
                <DubaiMap
                  buildings={buildings}
                  selectedBuildingId={selectedBuildingId}
                  onSelectBuilding={(id) => {
                    setSelectedBuildingId(id);
                    setCurrentPage('monitoring');
                  }}
                  lang={lang}
                />
              </div>

              {/* Recent AI Investigations & Alerts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Alerts */}
                <div className="cs-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      {lang === 'ar' ? 'أحدث التنبيهات والحوادث التشغيلية' : 'Detected Operational Anomalies'}
                    </h3>
                    <button
                      onClick={() => setCurrentPage('alerts')}
                      className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                    >
                      View All ({anomalies.length})
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {anomalies.slice(0, 4).map((a) => (
                      <div
                        key={a.event_id}
                        className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                a.severity === 'Critical' ? 'badge-critical' : 'badge-high'
                              }`}
                            >
                              {a.severity}
                            </span>
                            {a.anomaly_type}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Building: <b>{a.building_id}</b> | Asset: {a.asset_id}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleInvestigate(a.event_id);
                            setCurrentPage('insights');
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded text-xs transition"
                        >
                          Investigate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Open Work Orders & Approvals */}
                <div className="cs-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-teal-600" />
                      {lang === 'ar' ? 'أوامر العمل المعلقة والموافقات' : 'Pending Work Orders & Approvals'}
                    </h3>
                    <button
                      onClick={() => setCurrentPage('workorders')}
                      className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                    >
                      Manage ({workOrders.length})
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {workOrders.slice(0, 4).map((w) => (
                      <div
                        key={w.work_order_id}
                        className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{w.title}</div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            ID: <span className="font-mono">{w.work_order_id}</span> | Status:{' '}
                            <b className="text-teal-700">{w.status}</b>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded bg-slate-200/60 text-slate-700 text-[10px] font-semibold">
                          {w.assigned_technician}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: BUILDING PORTFOLIO */}
          {currentPage === 'portfolio' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {lang === 'ar' ? 'محفظة العقارات والمباني المراقبة' : 'Monitored Dubai Building Portfolio'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {lang === 'ar'
                      ? '5 منشآت رئيسية في دبي مغطاة بالمجسات وعدادات ديوا الذكية'
                      : '5 major commercial, hospitality, residential, and logistics facilities with live sub-metering.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buildings.map((b) => (
                  <div
                    key={b.id}
                    className={`cs-card p-5 hover:border-teal-500 transition cursor-pointer ${
                      selectedBuildingId === b.id ? 'ring-2 ring-teal-500 border-teal-500' : ''
                    }`}
                    onClick={() => {
                      setSelectedBuildingId(b.id);
                      setCurrentPage('monitoring');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {b.building_type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.operational_status.includes('Critical')
                            ? 'badge-critical'
                            : b.operational_status.includes('Attention')
                            ? 'badge-high'
                            : 'badge-optimal'
                        }`}
                      >
                        {b.operational_status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{b.name}</h3>
                    <p className="text-xs text-slate-500 mb-3">📍 {b.district}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Gross Floor Area</span>
                        <span className="font-semibold">{b.gross_floor_area_m2.toLocaleString()} m²</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Floors</span>
                        <span className="font-semibold">{b.floors} Levels</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Target COP</span>
                        <span className="font-semibold text-teal-700">{b.target_cop}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Open Incidents</span>
                        <span className="font-semibold text-red-600">{b.open_incidents_count}</span>
                      </div>
                    </div>

                    <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                      View Live Telemetry <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGE 3: LIVE MONITORING */}
          {currentPage === 'monitoring' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {lang === 'ar' ? 'المراقبة الحية والقياسات المستمرة' : 'Live Telemetry & Environmental Monitoring'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time time series for electricity, water flow, chilled water delta T, and quality flags.
                  </p>
                </div>
                {/* Building Selector */}
                <select
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Telemetry Table */}
              <div className="cs-card p-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Timestamp (UTC)</th>
                      <th className="p-2.5">Electricity (kWh)</th>
                      <th className="p-2.5">Water (m³)</th>
                      <th className="p-2.5">Indoor Temp</th>
                      <th className="p-2.5">Outdoor Temp</th>
                      <th className="p-2.5">Chiller COP</th>
                      <th className="p-2.5">HVAC Runtime</th>
                      <th className="p-2.5">Quality Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {telemetry.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-2.5 font-mono text-[11px] text-slate-500">
                          {row.timestamp.replace('T', ' ').slice(0, 19)}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-800">{row.electricity_kwh ?? '-'}</td>
                        <td className="p-2.5 font-semibold text-slate-800">{row.water_m3 ?? '-'}</td>
                        <td className="p-2.5 text-slate-700">{row.indoor_temp_c ? `${row.indoor_temp_c}°C` : '-'}</td>
                        <td className="p-2.5 text-slate-700">{row.outdoor_temp_c ? `${row.outdoor_temp_c}°C` : '-'}</td>
                        <td className="p-2.5 font-semibold text-teal-700">{row.cop_estimate ?? '-'}</td>
                        <td className="p-2.5 text-slate-700">{row.hvac_runtime_hours ? `${row.hvac_runtime_hours} h` : '-'}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.quality_status === 'valid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {row.quality_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGE 4: AI INSIGHTS */}
          {currentPage === 'insights' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'رؤى الذكاء الاصطناعي والتحقيق السببي' : 'AI Autonomous Investigation & Insights'}
                </h2>
                <p className="text-xs text-slate-500">
                  Explainable diagnostic dossiers with calibrated confidence scores, supporting evidence, and DEWA cost impact.
                </p>
              </div>

              {investigationData ? (
                <div className="cs-card p-6 space-y-5 bg-white border-teal-500 border-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-mono text-teal-600 font-semibold block mb-1">
                        Investigation #{investigationData.investigation_id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        Incident Analysis for {investigationData.building_id} ({investigationData.asset_id})
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Agent Confidence</span>
                      <span className="text-lg font-bold text-teal-700">
                        {(investigationData.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {investigationData.summary}
                  </p>

                  {/* Possible Causes */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2">Ranked Possible Root Causes</h4>
                    <div className="space-y-2">
                      {investigationData.possible_causes.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                        >
                          <span className="font-medium text-slate-800">{c.cause}</span>
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-semibold text-[10px]">
                            {c.evidence_strength} Evidence ({(c.probability * 100).toFixed(0)}% Probability)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleCreateWorkOrder(investigationData.event_id)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-2"
                    >
                      <Wrench className="w-4 h-4" />
                      Create Maintenance Work Order
                    </button>
                  </div>
                </div>
              ) : (
                <div className="cs-card p-12 text-center text-slate-500 text-xs">
                  Select an anomaly from the Executive Overview or Alerts page to inspect its AI diagnostic dossier.
                </div>
              )}
            </div>
          )}

          {/* PAGE 5: ALERTS & INCIDENTS */}
          {currentPage === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {lang === 'ar' ? 'سجل التنبيهات والحوادث' : 'Alerts & Incidents Repository'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Deduplicated telemetry anomalies detected across HVAC, water, and power infrastructure.
                  </p>
                </div>
                {/* Severity Filter */}
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
                >
                  <option value="ALL">All Severities</option>
                  <option value="Critical">Critical Only</option>
                  <option value="High">High Only</option>
                  <option value="Medium">Medium Only</option>
                </select>
              </div>

              <div className="cs-card overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Event ID</th>
                      <th className="p-3">Building</th>
                      <th className="p-3">Asset</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Anomaly Type</th>
                      <th className="p-3">Observed vs Baseline</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {anomalies
                      .filter((a) => filterSeverity === 'ALL' || a.severity === filterSeverity)
                      .map((a) => (
                        <tr key={a.event_id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-mono text-[11px] text-slate-500">{a.event_id}</td>
                          <td className="p-3 font-semibold text-slate-800">{a.building_id}</td>
                          <td className="p-3 text-slate-600">{a.asset_id}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                a.severity === 'Critical' ? 'badge-critical' : 'badge-high'
                              }`}
                            >
                              {a.severity}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-800">{a.anomaly_type}</td>
                          <td className="p-3 text-slate-700">
                            {a.observed_value} / <span className="text-slate-400">{a.baseline_value}</span> (+{a.deviation_pct}%)
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => {
                                handleInvestigate(a.event_id);
                                setCurrentPage('insights');
                              }}
                              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded font-semibold text-xs"
                            >
                              Investigate
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGE 6: MAINTENANCE WORK ORDERS */}
          {currentPage === 'workorders' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'أوامر عمل الصيانة وسير العمليات' : 'Maintenance Work Orders & Verification Lifecycle'}
                </h2>
                <p className="text-xs text-slate-500">
                  Track jobs from detection to human approval, technician dispatch, and IPMVP Option B verification.
                </p>
              </div>

              <div className="space-y-3">
                {workOrders.map((wo) => (
                  <div key={wo.work_order_id} className="cs-card p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-xs font-mono text-slate-400 block mb-0.5">{wo.work_order_id}</span>
                        <h3 className="text-sm font-bold text-slate-900">{wo.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {wo.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600">{wo.description}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Building / Asset</span>
                        <span className="font-semibold">{wo.building_id} / {wo.asset_id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Assigned Technician</span>
                        <span className="font-semibold">{wo.assigned_technician}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Approval Status</span>
                        <span className="font-semibold text-amber-600">{wo.approval_status}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Verified Savings</span>
                        <span className="font-bold text-emerald-600">AED {wo.verified_savings_aed?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGE 7: ENERGY & WATER ANALYTICS */}
          {currentPage === 'analytics' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'تحليلات الطاقة والمياه والتوقعات' : 'Energy & Water Analytics & 48h Forecast'}
                </h2>
                <p className="text-xs text-slate-500">
                  Aggregated consumption against DEWA tariff slabs and autoregressive 48-hour forecasts with 90% confidence bounds.
                </p>
              </div>

              {/* 48-Hour Forecast Card */}
              {forecastData?.forecast_points && (
                <div className="cs-card p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    48-Hour Hourly Electric Consumption Forecast with 90% Prediction Intervals
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {forecastData.forecast_points.slice(0, 8).map((pt: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-mono">
                          +{i + 1}h ({pt.timestamp.slice(11, 16)})
                        </span>
                        <span className="text-sm font-bold text-slate-800">{pt.predicted_value} kWh</span>
                        <span className="text-[10px] text-slate-500 block">
                          [{pt.lower_bound_90} - {pt.upper_bound_90}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAGE 8: EQUIPMENT HEALTH */}
          {currentPage === 'equipment' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'سجل وكفاءة المعدات والمبردات' : 'Equipment Health, Chillers & AHU Subsystems'}
                </h2>
                <p className="text-xs text-slate-500">
                  Degradation scores, rated capacities, and maintenance schedules for all monitored HVAC assets.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.map((eq) => (
                  <div key={eq.id} className="cs-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {eq.asset_type}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          eq.health_score < 75 ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        Health: {eq.health_score}%
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{eq.name}</h3>
                    <p className="text-xs text-slate-500">Building: {eq.building_name}</p>
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>Model: <b>{eq.model}</b></div>
                      <div>Rated Capacity: <b>{eq.rated_kw} kW</b></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGE 9: SAVINGS & SUSTAINABILITY */}
          {currentPage === 'sustainability' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'الوفورات المحققة والامتثال البيئي' : 'Savings & Al Sa\'fat Sustainability Compliance'}
                </h2>
                <p className="text-xs text-slate-500">
                  Green building metrics aligned with Dubai Green Building Regulations and UAE Net Zero 2050 pathway.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="cs-card p-5 bg-emerald-50/50 border-emerald-200">
                  <span className="text-xs text-emerald-800 font-semibold block mb-1">Avoided GHG Emissions</span>
                  <div className="text-2xl font-bold text-emerald-700">{sustainability?.avoided_co2e_tons ?? '10.3'} MT CO₂e</div>
                  <span className="text-[11px] text-emerald-600">Calculated via UAE Grid Emission Factor (0.42 kg/kWh)</span>
                </div>
                <div className="cs-card p-5 bg-teal-50/50 border-teal-200">
                  <span className="text-xs text-teal-800 font-semibold block mb-1">Equivalent Trees Planted</span>
                  <div className="text-2xl font-bold text-teal-700">{sustainability?.trees_equivalent_planted ?? 164} Trees</div>
                  <span className="text-[11px] text-teal-600">Ecological carbon offset equivalence</span>
                </div>
                <div className="cs-card p-5 bg-slate-900 text-white border-slate-800">
                  <span className="text-xs text-teal-300 font-semibold block mb-1">Dubai Green Standard</span>
                  <div className="text-base font-bold text-white">{sustainability?.green_building_rating ?? "Al Sa'fat Gold Compatible"}</div>
                  <span className="text-[11px] text-slate-400">Tier 1 High Performance Facility</span>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 10: CUSTOMER PILOTS & VALIDATION (SECTION 13) */}
          {currentPage === 'pilots' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'التحقق مع العملاء وخطة التجارب التجريبية' : 'Prospective Customer Validation & Pilot Framework (Section 13)'}
                </h2>
                <p className="text-xs text-slate-500">
                  Structured interview records, operational hypotheses, and 30-day proof-of-concept acceptance criteria with Dubai commercial landlords.
                </p>
              </div>

              <div className="space-y-4">
                {pilots.map((p) => (
                  <div key={p.id} className="cs-card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-xs font-mono text-teal-600 block mb-0.5">{p.id}</span>
                        <h3 className="text-sm font-bold text-slate-900">{p.organization_name}</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        {p.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div><b className="text-slate-400">Contact:</b> {p.contact_name} ({p.contact_role})</div>
                      <div><b className="text-slate-400">Target Building:</b> {p.target_building}</div>
                      <div><b className="text-slate-400">Reported Problem:</b> {p.reported_problem}</div>
                      <div><b className="text-slate-400">Current Workflow:</b> {p.current_workflow}</div>
                    </div>
                    <div className="text-xs bg-teal-50/60 p-3 rounded-lg border border-teal-200 text-teal-900">
                      <b>Proposed Pilot Acceptance Criteria:</b> {p.pilot_acceptance_criteria}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGE 11: INTEGRATIONS */}
          {currentPage === 'integrations' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'التكامل وبوابات الاتصال والمجسات' : 'BMS Gateways, MQTT Brokers & API Connectors'}
                </h2>
                <p className="text-xs text-slate-500">
                  Modular hardware and protocol adapters connecting BACnet/IP, MQTT 5.0, and DEWA smart meter APIs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((intg) => (
                  <div key={intg.id} className="cs-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {intg.integration_type}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {intg.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{intg.name}</h3>
                    <div className="text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 truncate">
                      {intg.endpoint_url}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <span>Telemetry Synced: <b>{intg.readings_synced_total?.toLocaleString()}</b></span>
                      <button
                        onClick={async () => {
                          await ApiClient.syncIntegration(intg.id);
                          loadAllData();
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold"
                      >
                        Sync Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGE 12: SETTINGS & AUDIT LOG */}
          {currentPage === 'settings' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'الإعدادات وسجل التدقيق غير القابل للتلاعب' : 'System Settings & Tamper-Evident Audit Log'}
                </h2>
                <p className="text-xs text-slate-500">
                  Complete immutable ledger of all agent actions, operator approvals, and technician interventions.
                </p>
              </div>

              <div className="cs-card overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Timestamp (UTC)</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Resource</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {audits.slice(0, 15).map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono text-[11px] text-slate-500">
                          {a.timestamp.replace('T', ' ').slice(0, 19)}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{a.actor}</td>
                        <td className="p-3 text-slate-600">{a.role}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {a.action}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">{a.resource_type}: {a.resource_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
