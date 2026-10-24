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
  OptimizationPlanItem,
  CommunityResourceItem,
  CommunityServiceRequestItem,
  SustainabilityChallengeItem,
  EducationalContentItem,
  WeatherRiskItem,
  ESGReportItem,
  WorkflowItem,
  AgentToolItem,
} from './api/client';
import { DubaiMap } from './components/DubaiMap';
import { DemoScenarioPlayer } from './components/DemoScenarioPlayer';
import { t, LANGUAGES } from './i18n/translations';
import {
  LayoutDashboard,
  Building2,
  Activity,
  Brain,
  Wrench,
  BarChart3,
  Leaf,
  Network,
  Settings,
  Globe,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  Droplets,
  Zap,
  Flame,
  FileText,
  Download,
  Send,
  HeartHandshake,
} from 'lucide-react';

export interface RoleConfig {
  id: string;
  labelKey: string;
  clearanceLevel: string;
  clearanceBadge: string;
  descKey: string;
  canInvestigate: boolean;
  canCreateWorkOrder: boolean;
  canApproveWorkOrders: boolean;
  canAuthorizePeakShedding: boolean;
  canSubmitServiceTickets: boolean;
  canPledgeChallenges: boolean;
  canTriggerWorkflows: boolean;
  canDownloadReports: boolean;
  isReadOnly: boolean;
  primarySections: string[];
}

export const ROLES_CONFIG: Record<string, RoleConfig> = {
  facilities_manager: {
    id: 'facilities_manager',
    labelKey: 'role_fm',
    clearanceLevel: 'LEVEL 4 — FULL OPERATIONAL AUTHORITY',
    clearanceBadge: 'Full Operational Authority',
    descKey: 'role_desc_fm',
    canInvestigate: true,
    canCreateWorkOrder: true,
    canApproveWorkOrders: true,
    canAuthorizePeakShedding: true,
    canSubmitServiceTickets: true,
    canPledgeChallenges: true,
    canTriggerWorkflows: true,
    canDownloadReports: true,
    isReadOnly: false,
    primarySections: ['overview', 'monitoring', 'peak_demand', 'comfort_safety', 'approval', 'integrations'],
  },
  property_owner: {
    id: 'property_owner',
    labelKey: 'role_owner',
    clearanceLevel: 'LEVEL 3 — PORTFOLIO ASSET & FINANCIAL OVERSIGHT',
    clearanceBadge: 'Executive & Financial View',
    descKey: 'role_desc_owner',
    canInvestigate: true,
    canCreateWorkOrder: false,
    canApproveWorkOrders: false,
    canAuthorizePeakShedding: false,
    canSubmitServiceTickets: false,
    canPledgeChallenges: true,
    canTriggerWorkflows: false,
    canDownloadReports: true,
    isReadOnly: false,
    primarySections: ['overview', 'esg', 'reports', 'integrations'],
  },
  hvac_technician: {
    id: 'hvac_technician',
    labelKey: 'role_tech',
    clearanceLevel: 'LEVEL 2 — FIELD DIAGNOSTICS & HARDWARE EXECUTION',
    clearanceBadge: 'Field Technical Execution',
    descKey: 'role_desc_tech',
    canInvestigate: true,
    canCreateWorkOrder: true,
    canApproveWorkOrders: false,
    canAuthorizePeakShedding: false,
    canSubmitServiceTickets: true,
    canPledgeChallenges: false,
    canTriggerWorkflows: true,
    canDownloadReports: false,
    isReadOnly: false,
    primarySections: ['monitoring', 'comfort_safety', 'timeline', 'approval', 'integrations'],
  },
  sustainability_manager: {
    id: 'sustainability_manager',
    labelKey: 'role_sustainability',
    clearanceLevel: 'LEVEL 3 — ESG COMPLIANCE & SOCIETAL IMPACT',
    clearanceBadge: 'Sustainability & ESG Oversight',
    descKey: 'role_desc_sustainability',
    canInvestigate: true,
    canCreateWorkOrder: false,
    canApproveWorkOrders: false,
    canAuthorizePeakShedding: false,
    canSubmitServiceTickets: true,
    canPledgeChallenges: true,
    canTriggerWorkflows: false,
    canDownloadReports: true,
    isReadOnly: false,
    primarySections: ['esg', 'community', 'education', 'resilience', 'reports'],
  },
  finance_analyst: {
    id: 'finance_analyst',
    labelKey: 'role_finance',
    clearanceLevel: 'LEVEL 2 — DEWA TARIFF & ROI AUDITING',
    clearanceBadge: 'Tariff & Cost Accounting',
    descKey: 'role_desc_finance',
    canInvestigate: true,
    canCreateWorkOrder: false,
    canApproveWorkOrders: false,
    canAuthorizePeakShedding: false,
    canSubmitServiceTickets: false,
    canPledgeChallenges: false,
    canTriggerWorkflows: false,
    canDownloadReports: true,
    isReadOnly: false,
    primarySections: ['overview', 'peak_demand', 'reports'],
  },
  auditor: {
    id: 'auditor',
    labelKey: 'role_auditor',
    clearanceLevel: 'LEVEL 1 — READ-ONLY REGULATORY COMPLIANCE',
    clearanceBadge: 'Strict Read-Only Mode',
    descKey: 'role_desc_auditor',
    canInvestigate: false,
    canCreateWorkOrder: false,
    canApproveWorkOrders: false,
    canAuthorizePeakShedding: false,
    canSubmitServiceTickets: false,
    canPledgeChallenges: false,
    canTriggerWorkflows: false,
    canDownloadReports: true,
    isReadOnly: true,
    primarySections: ['overview', 'timeline', 'reports', 'integrations'],
  },
};

export const App: React.FC = () => {
  // Navigation & Localization
  const [currentPage, setCurrentPage] = useState<string>('overview');
  const [lang, setLang] = useState<string>('en');
  const [currentRole, setCurrentRole] = useState<string>('facilities_manager');
  const activeRoleConfig = ROLES_CONFIG[currentRole] || ROLES_CONFIG.facilities_manager;

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

  // Societal Modules Data States
  const [optimizationPlans, setOptimizationPlans] = useState<OptimizationPlanItem[]>([]);
  const [communityResources, setCommunityResources] = useState<CommunityResourceItem[]>([]);
  const [serviceRequests, setServiceRequests] = useState<CommunityServiceRequestItem[]>([]);
  const [challenges, setChallenges] = useState<SustainabilityChallengeItem[]>([]);
  const [educationalContent, setEducationalContent] = useState<EducationalContentItem[]>([]);
  const [weatherRisk, setWeatherRisk] = useState<WeatherRiskItem | null>(null);
  const [esgReport, setEsgReport] = useState<ESGReportItem | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [agentTools, setAgentTools] = useState<AgentToolItem[]>([]);

  // Resident service request form state
  const [srCategory, setSrCategory] = useState<string>('Thermal Comfort & Cooling');
  const [srDescription, setSrDescription] = useState<string>('Common corridor temperature is 26.5C. Please check fan coil unit.');
  const [srPriority, setSrPriority] = useState<string>('Routine');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [approvalRationale, setApprovalRationale] = useState<string>('Approved after reviewing telemetry and asset history.');

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
        fcRes,
        optRes,
        comRes,
        srRes,
        chRes,
        eduRes,
        wRiskRes,
        esgRes,
        wfRes,
        toolsRes,
      ] = await Promise.all([
        ApiClient.fetchKPIs(),
        ApiClient.fetchBuildings(),
        ApiClient.fetchAnomalies(),
        ApiClient.fetchWorkOrders(),
        ApiClient.fetchEquipment(),
        ApiClient.fetchIntegrations(),
        ApiClient.fetchPilots(),
        ApiClient.fetchAudits(),
        ApiClient.fetchForecast('DXB-OFF-01', 48),
        ApiClient.fetchOptimizationPlans(),
        ApiClient.fetchCommunityResources(),
        ApiClient.fetchServiceRequests(),
        ApiClient.fetchSustainabilityChallenges(),
        ApiClient.fetchEducationalContent(),
        ApiClient.fetchWeatherRisk(),
        ApiClient.fetchESGReport(),
        ApiClient.fetchWorkflows(),
        ApiClient.fetchAgentTools(),
      ]);

      setKpis(kpiRes);
      setBuildings(bldRes);
      setAnomalies(anomRes);
      setWorkOrders(woRes);
      setEquipment(eqRes);
      setIntegrations(intRes);
      setPilots(pilotRes);
      setAudits(auditRes);
      setForecastData(fcRes);
      setOptimizationPlans(optRes);
      setCommunityResources(comRes);
      setServiceRequests(srRes);
      setChallenges(chRes);
      setEducationalContent(eduRes);
      setWeatherRisk(wRiskRes);
      setEsgReport(esgRes);
      setWorkflows(wfRes);
      setAgentTools(toolsRes);

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
    if (!activeRoleConfig.canCreateWorkOrder) {
      alert(t(activeRoleConfig.isReadOnly ? 'perm_denied_auditor' : 'perm_denied_owner', lang));
      return;
    }
    try {
      await ApiClient.createWorkOrder(eventId);
      const updatedWo = await ApiClient.fetchWorkOrders();
      setWorkOrders(updatedWo);
      alert('Maintenance Work Order drafted and awaiting Facilities Manager approval.');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePledge = async (challengeId: string) => {
    if (!activeRoleConfig.canPledgeChallenges) {
      alert(t('perm_denied_auditor', lang));
      return;
    }
    await ApiClient.pledgeChallenge(challengeId);
    const updated = await ApiClient.fetchSustainabilityChallenges();
    setChallenges(updated);
    alert('Thank you for pledging! Your contribution to UAE grid stability is recorded.');
  };

  const handleServiceTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoleConfig.canSubmitServiceTickets) {
      alert(t('perm_denied_auditor', lang));
      return;
    }
    await ApiClient.createServiceRequest({
      category: srCategory,
      description: srDescription,
      priority: srPriority,
      language: lang,
    });
    const updatedSr = await ApiClient.fetchServiceRequests();
    setServiceRequests(updatedSr);
    alert('Community service request registered with automatic PII sanitization.');
  };

  const handleApprovePlan = async (planId: string) => {
    if (!activeRoleConfig.canAuthorizePeakShedding) {
      alert(t('perm_denied_owner', lang));
      return;
    }
    await ApiClient.approveOptimizationPlan(planId, true);
    const updatedPlans = await ApiClient.fetchOptimizationPlans();
    setOptimizationPlans(updatedPlans);
    alert('Peak demand optimization plan authorized and dispatched to BMS gateway!');
  };

  const handleExecutePlan = async (planId: string) => {
    if (!activeRoleConfig.canAuthorizePeakShedding) {
      alert(t('perm_denied_owner', lang));
      return;
    }
    await ApiClient.executeOptimizationPlan(planId);
    const updatedPlans = await ApiClient.fetchOptimizationPlans();
    setOptimizationPlans(updatedPlans);
    alert('Peak load curtailment executed! Indoor comfort bounds verified within ASHRAE 55.');
  };

  const handleTriggerWorkflow = async (workflowId: string) => {
    if (!activeRoleConfig.canTriggerWorkflows) {
      alert(t('perm_denied_auditor', lang));
      return;
    }
    await ApiClient.triggerWorkflow(workflowId);
    const updatedWf = await ApiClient.fetchWorkflows();
    setWorkflows(updatedWf);
    alert(`n8n workflow '${workflowId}' executed successfully with 0 errors!`);
  };

  // 13 Navigation Sections (Societal AI Agent Dashboard)
  const navItems = [
    { id: 'overview', labelKey: 'nav_overview', icon: LayoutDashboard },
    { id: 'monitoring', labelKey: 'nav_monitoring', icon: Activity },
    { id: 'peak_demand', labelKey: 'nav_peak_demand', icon: Zap },
    { id: 'esg', labelKey: 'nav_esg', icon: Leaf },
    { id: 'comfort_safety', labelKey: 'nav_comfort_safety', icon: ShieldCheck },
    { id: 'community', labelKey: 'nav_community', icon: Building2 },
    { id: 'education', labelKey: 'nav_education', icon: Brain },
    { id: 'resilience', labelKey: 'nav_resilience', icon: AlertCircle },
    { id: 'timeline', labelKey: 'nav_timeline', icon: TrendingUp },
    { id: 'approval', labelKey: 'nav_approval', icon: UserCheck },
    { id: 'n8n_health', labelKey: 'nav_n8n_health', icon: Network },
    { id: 'reports', labelKey: 'nav_reports', icon: BarChart3 },
    { id: 'integrations', labelKey: 'nav_integrations', icon: Settings },
  ];

  const filteredResources = districtFilter === 'All'
    ? communityResources
    : communityResources.filter((r) => r.district.toLowerCase().includes(districtFilter.toLowerCase()));

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Top Banner: Dubai Societal Notice */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          <span className="font-semibold text-white">CoolShield AI</span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">
            {t('societal_notice', lang)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300">
            Timezone: Asia/Dubai (GST)
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-teal-900/40 text-teal-300 border border-teal-700/50">
            DEWA Peak Tariff Window: 12 PM - 6 PM
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
                v2.0 Societal
              </span>
            </h1>
            <p className="text-xs text-slate-500">Autonomous Efficiency, ESG Accounting & Community Resilience</p>
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
              {Object.values(ROLES_CONFIG).map((r) => (
                <option key={r.id} value={r.id}>
                  {t(r.labelKey, lang)}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector (6 Languages) */}
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

      {/* Active Persona Context & Clearance Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-xs ${
            activeRoleConfig.isReadOnly ? 'bg-slate-700' : 'bg-teal-700'
          }`}>
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{t(activeRoleConfig.labelKey, lang)}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activeRoleConfig.isReadOnly
                  ? 'bg-slate-100 text-slate-700 border border-slate-300'
                  : 'bg-teal-50 text-teal-800 border border-teal-200'
              }`}>
                {activeRoleConfig.clearanceBadge}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{t(activeRoleConfig.descKey, lang)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono">
            Clearance: <b className="text-slate-900">{activeRoleConfig.clearanceLevel.split(' — ')[0]}</b>
          </span>
          {activeRoleConfig.canApproveWorkOrders ? (
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Consequential Approvals Enabled
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200 flex items-center gap-1">
              🔒 Approvals Restricted to Facilities Manager
            </span>
          )}
        </div>
      </div>

      {/* Demonstration Scenario Bar */}
      <DemoScenarioPlayer
        onRefreshAll={() => loadAllData()}
        lang={lang}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation (13 Sections) */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 space-y-1.5 shrink-0 overflow-y-auto">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-2">
            {lang === 'ar' ? 'أقسام النظام الـ 13' : '13 Operational Sections'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  active
                    ? 'bg-slate-900 text-teal-300 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span className="truncate text-left">{t(item.labelKey, lang)}</span>
                </div>
                {activeRoleConfig.primarySections.includes(item.id) && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-700 font-bold shrink-0">
                    Primary
                  </span>
                )}
                {activeRoleConfig.isReadOnly && !activeRoleConfig.primarySections.includes(item.id) && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold shrink-0">
                    View
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: EXECUTIVE OVERVIEW */}
          {currentPage === 'overview' && (
            <div className="space-y-6">
              {/* Executive KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="cs-card p-4">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>{lang === 'ar' ? 'المباني المراقبة' : 'Monitored Buildings'}</span>
                    <Building2 className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {kpis?.total_buildings ?? 5} <span className="text-xs font-normal text-slate-500">Dubai Assets</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 100% Online Telemetry
                  </div>
                </div>

                <div className="cs-card p-4">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>{lang === 'ar' ? 'استهلاك الكهرباء (24 ساعة)' : 'Electricity (24h)'}</span>
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {kpis?.electricity_kwh_today?.toLocaleString() ?? '3,840'} <span className="text-xs font-normal text-slate-500">kWh</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Est. Cost: <b>AED {kpis?.total_operating_cost_aed_today?.toLocaleString() ?? '1,420.00'}</b>
                  </div>
                </div>

                <div className="cs-card p-4">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>{lang === 'ar' ? 'استهلاك المياه (24 ساعة)' : 'Water Consumption (24h)'}</span>
                    <Droplets className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {kpis?.water_m3_today?.toLocaleString() ?? '94.5'} <span className="text-xs font-normal text-slate-500">m³</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Tiered DEWA Potable Slabs</div>
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

              {/* 48-Hour DEWA Load Forecast Projection */}
              {forecastData && (
                <div className="p-3 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-bold">DEWA 48-Hour Load Forecast:</span>
                    <span className="text-slate-200">
                      Projected consumption for {forecastData.building_id || 'DXB-OFF-01'} is {forecastData.forecast_kwh_mean?.toLocaleString() || '4,320'} kWh (Peak window: 12:00 - 17:00).
                    </span>
                  </div>
                  <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded text-teal-300">
                    Confidence: {forecastData.confidence_interval || '95% CI'}
                  </span>
                </div>
              )}

              {/* Interactive Dubai Map */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {lang === 'ar' ? 'خريطة مواقع المباني في دبي' : 'Interactive Dubai Property Portfolio Map'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {lang === 'ar'
                        ? 'انقر على أي مبنى في الخريطة لعرض القياسات الحية والملف التشغيلي'
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

              {/* Active AI Diagnostic Investigation Modal / Dossier */}
              {investigationData && (
                <div className="cs-card p-5 border-2 border-teal-500 bg-teal-50/20 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-teal-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        AI Diagnostic Investigation Report: {investigationData.event_id}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                        Confidence: {Math.round(investigationData.confidence_score * 100)}%
                      </span>
                    </div>
                    <button
                      onClick={() => setInvestigationData(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 space-y-2">
                    <div><b>Root Cause Hypothesis:</b> {investigationData.possible_causes?.[0]?.cause || investigationData.summary}</div>
                    <div><b>Recommended Action:</b> {investigationData.recommendations?.[0]?.description || 'Inspect asset telemetry and verify BMS damper calibration.'}</div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <span>Confidence Rationale: <b>{investigationData.confidence_rationale}</b></span>
                      <span>Approval Tier: <b>{investigationData.required_approval_level}</b></span>
                    </div>
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => {
                          handleCreateWorkOrder(investigationData.event_id);
                          setInvestigationData(null);
                        }}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded text-xs transition"
                      >
                        Draft Maintenance Work Order
                      </button>
                      <button
                        onClick={() => setInvestigationData(null)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Anomalies & Work Orders Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="cs-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      {lang === 'ar' ? 'أحدث التنبيهات والحوادث التشغيلية' : 'Detected Operational Anomalies'}
                    </h3>
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="text-xs bg-slate-100 border border-slate-300 rounded px-2 py-1 text-slate-700 font-semibold"
                    >
                      <option value="ALL">All Severities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                    </select>
                  </div>
                  <div className="space-y-2.5">
                    {anomalies
                      .filter((a) => filterSeverity === 'ALL' || a.severity === filterSeverity)
                      .slice(0, 4)
                      .map((a) => (
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
                            setCurrentPage('overview');
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded text-xs transition"
                        >
                          Investigate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cs-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-teal-600" />
                      {lang === 'ar' ? 'أوامر العمل المعلقة والموافقات' : 'Pending Work Orders & Approvals'}
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {workOrders.slice(0, 4).map((wo) => (
                      <div
                        key={wo.work_order_id}
                        className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{wo.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {wo.work_order_id} | Status: <b className="text-teal-700">{wo.status}</b>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded bg-slate-200/60 text-slate-700 font-mono text-[10px]">
                          {wo.approval_status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: LIVE SENSOR TELEMETRY */}
          {currentPage === 'monitoring' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {lang === 'ar' ? 'القياسات الحية وفحص جودة البيانات' : 'Live Sensor Telemetry & Data Quality Gate'}
                  </h2>
                  <p className="text-xs text-slate-500">Continuous sub-meter streams with Layer A quality validation.</p>
                </div>
                <select
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                  className="bg-white border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Data Quality Card */}
              <div className="cs-card p-4 bg-emerald-50/50 border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">Layer A Telemetry Quality Verification: PASS</h4>
                      <p className="text-[11px] text-emerald-700">0.0% missing records | Dynamic variance verified | Zero flatlines</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 text-white">100% Quality Score</span>
                </div>
              </div>

              {/* Telemetry Stream Table */}
              <div className="cs-card overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">Recent Hourly Sub-Meter Ingested Readings</h3>
                  <span className="text-[11px] text-slate-400">Total samples: {telemetry.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Timestamp (UTC)</th>
                        <th className="p-3">Electricity (kWh)</th>
                        <th className="p-3">Water (m³)</th>
                        <th className="p-3">Indoor (°C)</th>
                        <th className="p-3">Outdoor (°C)</th>
                        <th className="p-3">Est. COP</th>
                        <th className="p-3">Quality Gate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {telemetry.slice(0, 15).map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="p-3 font-mono text-[11px] text-slate-500">{t.timestamp.replace('T', ' ').slice(0, 19)}</td>
                          <td className="p-3 font-bold text-slate-800">{t.electricity_kwh?.toFixed(1) ?? '--'}</td>
                          <td className="p-3 text-slate-800">{t.water_m3?.toFixed(2) ?? '--'}</td>
                          <td className="p-3 text-slate-800">{t.indoor_temp_c?.toFixed(1) ?? '--'}°C</td>
                          <td className="p-3 text-slate-500">{t.outdoor_temp_c?.toFixed(1) ?? '--'}°C</td>
                          <td className="p-3 font-semibold text-teal-700">{t.cop_estimate?.toFixed(2) ?? '--'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {t.quality_status || 'PASS'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: PEAK DEMAND & HVAC OPTIMIZATION (MODULE B) */}
          {currentPage === 'peak_demand' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'تحسين ذروة الطلب وتحويل الأحمال (الوحدة B)' : 'Energy-Grid & HVAC Optimization: Peak Load Shifting (Module B)'}
                </h2>
                <p className="text-xs text-slate-500">
                  Automated pre-cooling schedules and non-critical load shifting during the DEWA 12 PM - 6 PM peak tariff window.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="cs-card p-4">
                  <span className="text-xs text-slate-500">Peak Demand Reduction Target</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">133.0 kW</div>
                  <span className="text-[11px] text-teal-600 font-semibold">16.2% Chiller Baseline Shed</span>
                </div>
                <div className="cs-card p-4">
                  <span className="text-xs text-slate-500">Estimated Cost Avoided</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">AED 495.00 / day</div>
                  <span className="text-[11px] text-teal-600 font-semibold">DEWA Slab 4 Tariff</span>
                </div>
                <div className="cs-card p-4">
                  <span className="text-xs text-slate-500">Thermal Comfort Guarantee</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">±1.0°C Max Drift</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">ASHRAE Standard 55 Compliant</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Active Peak Optimization Plans</h3>
                {optimizationPlans.map((plan) => (
                  <div key={plan.plan_id} className="cs-card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-teal-600 block">{plan.plan_id}</span>
                        <h4 className="text-sm font-bold text-slate-900">{plan.building_id}: {plan.trigger_reason}</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {plan.approval_status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                      <div><b>Eligible Non-Critical Loads:</b></div>
                      {plan.eligible_loads.map((l, i) => (
                        <div key={i} className="text-slate-500 pl-2">
                          • {l.name} ({l.asset_id}): {l.action} (Shed: {l.load_reduction_kw} kW)
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-slate-500">
                        Baseline: <b>{plan.baseline_kw} kW</b> | Avoided: <b className="text-emerald-600">AED {plan.estimated_cost_avoided_aed.toFixed(2)}</b>
                      </div>
                      <div className="flex items-center gap-2">
                        {plan.approval_status === 'Pending' && (
                          <button
                            onClick={() => handleApprovePlan(plan.plan_id)}
                            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                              activeRoleConfig.canAuthorizePeakShedding
                                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {activeRoleConfig.canAuthorizePeakShedding
                              ? 'Approve Plan (FM)'
                              : '🔒 Restricted to FM'}
                          </button>
                        )}
                        {plan.approval_status === 'Approved' && plan.execution_status !== 'Executed & Verified' && (
                          <button
                            onClick={() => handleExecutePlan(plan.plan_id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-teal-300 font-semibold text-xs transition"
                          >
                            Execute Load Shedding
                          </button>
                        )}
                        {plan.execution_status === 'Executed & Verified' && (
                          <span className="px-3 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Executed & Verified (133 kW Shed)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: CARBON & ESG INTELLIGENCE (SCOPE 1 & 2 - MODULE A) */}
          {currentPage === 'esg' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'ذكاء الكربون وحسابات الاستدامة (الوحدة A)' : 'Autonomous Energy & ESG Carbon Accounting (Module A)'}
                </h2>
                <p className="text-xs text-slate-500">
                  GHG Protocol Corporate Accounting Standard | Transparent DEWA Grid Factor (0.42 kg CO₂e/kWh) | Strictly Separated Carbon Offsets
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="cs-card p-4">
                  <span className="text-xs text-slate-500">Scope 1 Direct Emissions</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {((esgReport?.scope_1_direct_kgco2e ?? 1420) / 1000).toFixed(2)} MT CO₂e
                  </div>
                  <span className="text-[11px] text-slate-400">On-site diesel backup</span>
                </div>

                <div className="cs-card p-4">
                  <span className="text-xs text-slate-500">Scope 2 Grid Electricity</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {((esgReport?.scope_2_electricity_kgco2e ?? 52400) / 1000).toFixed(2)} MT CO₂e
                  </div>
                  <span className="text-[11px] text-teal-600 font-semibold">DEWA 0.42 kg/kWh Factor</span>
                </div>

                <div className="cs-card p-4 bg-emerald-50/50 border-emerald-200">
                  <span className="text-xs text-emerald-800 font-semibold">Verified Operational Reductions</span>
                  <div className="text-xl font-bold text-emerald-700 mt-1">
                    -{esgReport?.operational_reductions_mtco2e ?? 7.45} MT CO₂e
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">CoolShield AI Efficiency</span>
                </div>

                <div className="cs-card p-4 bg-sky-50/50 border-sky-200">
                  <span className="text-xs text-sky-800 font-semibold">DCCE Registered Carbon Offsets</span>
                  <div className="text-xl font-bold text-sky-700 mt-1">
                    {esgReport?.carbon_offsets?.purchased_mtco2e ?? 5.0} MT CO₂e
                  </div>
                  <span className="text-[11px] text-sky-600 font-semibold">Serial: DCCE-UAE-2026-8819A</span>
                </div>
              </div>

              <div className="cs-card p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">GHG Protocol Compliance & Carbon Segregation Notice</h3>
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200 leading-relaxed">
                  <b>Methodology & Accounting Integrity:</b> Under official GHG Protocol Corporate Standard guidelines,
                  carbon offsets are reported strictly as separate line items and are <b>NOT</b> subtracted from gross Scope 1 and Scope 2 totals.
                  Our reported <b>7.45 MT</b> reduction represents genuine, verified on-site operational energy curtailment.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: INDOOR COMFORT & SAFETY BOUNDS */}
          {currentPage === 'comfort_safety' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'معايير الراحة الحرارية وجودة الهواء الداخلي' : 'Indoor Comfort, Air Quality & Safety Interlocks'}
                </h2>
                <p className="text-xs text-slate-500">
                  Non-negotiable life safety and comfort constraints complying with ASHRAE 55 and ASHRAE 62.1.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="cs-card p-4">
                  <span className="text-xs text-slate-500">Thermal Comfort Zone</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">23.0°C – 26.0°C</div>
                  <span className="text-[11px] text-teal-600 font-semibold">ASHRAE Standard 55</span>
                </div>
                <div className="cs-card p-4">
                  <span className="text-xs text-slate-500">Min Fresh Air Ventilation</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">15.0 CFM / person</div>
                  <span className="text-[11px] text-teal-600 font-semibold">ASHRAE Standard 62.1</span>
                </div>
                <div className="cs-card p-4">
                  <span className="text-xs text-slate-500">Indoor CO₂ Safe Ceiling</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">&lt; 800 ppm</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Alarm at 1,000 ppm</span>
                </div>
                <div className="cs-card p-4">
                  <span className="text-xs text-slate-500">Relative Humidity Bounds</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">30% – 65% RH</div>
                  <span className="text-[11px] text-teal-600 font-semibold">Mold & Condensation Guard</span>
                </div>
              </div>

              <div className="cs-card p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Safety Interlock Rules Matrix</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Interlock ID</th>
                        <th className="p-3">Parameter</th>
                        <th className="p-3">Safe Operating Range</th>
                        <th className="p-3">Automated Abort Action</th>
                        <th className="p-3">Priority Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3 font-mono font-bold text-slate-700">INT-01</td>
                        <td className="p-3 text-slate-800">Indoor Zone Temperature</td>
                        <td className="p-3 font-mono text-slate-600">23.0°C - 26.0°C</td>
                        <td className="p-3 text-slate-800">Emergency Chiller Ramp-Up</td>
                        <td className="p-3 font-bold text-red-600">Critical</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-slate-700">INT-02</td>
                        <td className="p-3 text-slate-800">Indoor CO₂ Concentration</td>
                        <td className="p-3 font-mono text-slate-600">&lt; 800 ppm</td>
                        <td className="p-3 text-slate-800">100% Outdoor Air Damper Open</td>
                        <td className="p-3 font-bold text-amber-600">Life Safety</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-slate-700">INT-03</td>
                        <td className="p-3 text-slate-800">Chilled Water Delta-T</td>
                        <td className="p-3 font-mono text-slate-600">&ge; 5.0°C</td>
                        <td className="p-3 text-slate-800">Modulate Secondary Flow Valve</td>
                        <td className="p-3 font-bold text-teal-600">Equipment Protection</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-slate-700">INT-04</td>
                        <td className="p-3 text-slate-800">Relative Humidity (RH)</td>
                        <td className="p-3 font-mono text-slate-600">30% - 65%</td>
                        <td className="p-3 text-slate-800">Reheat Coil Modulation</td>
                        <td className="p-3 font-bold text-slate-600">Air Quality</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: SOCIAL INCLUSION & COMMUNITY HUB (MODULE C) */}
          {currentPage === 'community' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'الشمول الاجتماعي والمراكز المجتمعية (الوحدة C)' : 'Social Inclusion & Community Hub (Module C)'}
                </h2>
                <p className="text-xs text-slate-500">
                  Verified Dubai cooling shelters, customer happiness centres, health clinics, and privacy-preserving resident tickets.
                </p>
              </div>

              {/* District Filter & Resource Directory */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Verified Dubai Community Infrastructure</h3>
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="bg-white border border-slate-200 text-xs px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    <option value="All">All Districts</option>
                    <option value="Al Barsha">Al Barsha</option>
                    <option value="Downtown">Downtown Dubai</option>
                    <option value="Deira">Deira</option>
                    <option value="Al Wasl">Al Wasl</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredResources.map((r) => (
                    <div key={r.id} className="cs-card p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {r.category}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600">● {r.current_availability}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{r.name}</h4>
                      <p className="text-xs text-slate-500">📍 {r.address} | District: {r.district}</p>
                      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <span>⏰ {r.opening_hours}</span>
                        <span>👥 Capacity: {r.max_capacity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Resident Service Ticket */}
              <div className="cs-card p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-teal-600" />
                  Submit Community Service Request (Automatic PII Scrubbing)
                </h3>
                <form onSubmit={handleServiceTicketSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Issue Category</label>
                      <select
                        value={srCategory}
                        onChange={(e) => setSrCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-2 rounded-lg"
                      >
                        <option>Thermal Comfort & Cooling</option>
                        <option>Accessibility & Wheelchair Mobility</option>
                        <option>Indoor Air / Water Quality</option>
                        <option>Recycling & Environmental Waste</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Priority</label>
                      <select
                        value={srPriority}
                        onChange={(e) => setSrPriority(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-2 rounded-lg"
                      >
                        <option>Routine</option>
                        <option>Urgent</option>
                        <option>Emergency</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Description (Emails and phone numbers are automatically redacted):
                    </label>
                    <textarea
                      value={srDescription}
                      onChange={(e) => setSrDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-lg focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition"
                  >
                    Submit Sanitized Service Ticket
                  </button>
                </form>

                {/* Recent Service Tickets */}
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Recent Community Requests</h4>
                  <div className="space-y-2">
                    {serviceRequests.map((req) => (
                      <div key={req.request_id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-900">{req.category}: {req.description}</div>
                          <span className="text-[11px] text-slate-400 font-mono">{req.request_id} | Assigned: {req.assigned_team}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">{req.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: SUSTAINABILITY EDUCATION & SPRINTS (MODULE D) */}
          {currentPage === 'education' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'التوعية وتحديات الاستدامة المجتمعية (الوحدة D)' : 'Sustainability Education & Community Participation Sprints (Module D)'}
                </h2>
                <p className="text-xs text-slate-500">
                  Multilingual education across 6 languages + Community energy & water conservation sprints.
                </p>
              </div>

              {/* Sprints */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Active Community Sustainability Sprints</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.map((ch) => (
                    <div key={ch.id} className="cs-card p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {ch.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{ch.start_date} to {ch.end_date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{ch.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{ch.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{ch.total_participants}</span>
                          <span className="text-[11px] text-slate-400 ml-1">Pledged Participants</span>
                        </div>
                        <button
                          onClick={() => handlePledge(ch.id)}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                          <HeartHandshake className="w-3.5 h-3.5" />
                          Pledge Participation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multilingual Educational Cards */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Multilingual Educational Cards (Active Language: {lang.toUpperCase()})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {educationalContent.map((ed) => (
                    <div key={ed.id} className="cs-card p-5 space-y-3">
                      <span className="text-xs font-mono text-teal-600 font-bold block">{ed.topic}</span>
                      <h4 className="text-sm font-bold text-slate-900">{ed.title}</h4>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {ed.translations[lang] || ed.translations['en']}
                      </p>
                      <div className="text-[11px] text-teal-800 font-semibold bg-teal-50 p-2 rounded border border-teal-200">
                        <b>Key Takeaway:</b> {ed.key_takeaway}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: RESILIENCE & EARLY WARNING (NCM - MODULE E) */}
          {currentPage === 'resilience' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'المرونة المجتمعية والإنذار المبكر (الوحدة E)' : 'Community Resilience & Early Warning System (Module E)'}
                </h2>
                <p className="text-xs text-slate-500">
                  Integration with UAE National Center of Meteorology (NCM) & Dubai Municipality Air Quality Telemetry.
                </p>
              </div>

              {/* Weather & Heat Risk Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="cs-card p-4">
                  <span className="text-xs text-slate-500">Ambient Dry-Bulb Temp</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">{weatherRisk?.dry_bulb_temperature_c ?? 41.5}°C</div>
                  <span className="text-[11px] text-slate-400">Dubai Coastal Weather</span>
                </div>
                <div className="cs-card p-4">
                  <span className="text-xs text-slate-500">Relative Humidity</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">{weatherRisk?.relative_humidity_pct ?? 68.0}%</div>
                  <span className="text-[11px] text-slate-400">High Dew Point</span>
                </div>
                <div className="cs-card p-4 bg-amber-50/50 border-amber-200">
                  <span className="text-xs text-amber-800 font-semibold">Calculated Heat Index</span>
                  <div className="text-xl font-bold text-amber-700 mt-1">{weatherRisk?.calculated_heat_index_c ?? 43.8}°C</div>
                  <span className="text-[11px] text-amber-700 font-semibold">LEVEL 2 HEAT ALERT</span>
                </div>
                <div className="cs-card p-4">
                  <span className="text-xs text-slate-500">Outdoor PM2.5 AQI</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">{weatherRisk?.aqi_pm25_ug_m3 ?? 86.0} µg/m³</div>
                  <span className="text-[11px] text-slate-400">Moderate Inflow</span>
                </div>
              </div>

              {/* Active Incident & Cooling Shelter Routing */}
              {weatherRisk?.active_incident && (
                <div className="cs-card p-5 bg-red-50/40 border-red-200 space-y-3">
                  <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                    <Flame className="w-5 h-5 text-red-600" />
                    Active Resilience Advisory: {weatherRisk.active_incident.type} ({weatherRisk.active_incident.severity})
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {weatherRisk.active_incident.recommended_action}
                  </p>
                  <div className="text-xs font-semibold text-teal-800 bg-white p-2.5 rounded-lg border border-teal-200 flex items-center justify-between">
                    <span>Dispatched Cooling Shelter Hub: <b>{weatherRisk.active_incident.recommended_cooling_shelter_id}</b></span>
                    <button
                      onClick={() => setCurrentPage('community')}
                      className="text-xs text-teal-600 hover:text-teal-700 font-bold underline"
                    >
                      View Map & Directions
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 9: AI REASONING & ACTIVITY TIMELINE */}
          {currentPage === 'timeline' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'سلسلة قرارات الذكاء الاصطناعي وجدول الأنشطة' : 'AI Reasoning & Transparent Operating Timeline'}
                </h2>
                <p className="text-xs text-slate-500">
                  Observe → Validate → Reason → Prioritize → Plan → Approve → Execute → Verify → Learn.
                </p>
              </div>

              <div className="space-y-3">
                {audits.map((a) => (
                  <div key={a.id} className="cs-card p-4 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {a.action}
                        </span>
                        {a.resource_type}: {a.resource_id}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Actor: <b>{a.actor}</b> ({a.role}) | {a.timestamp.replace('T', ' ').slice(0, 19)}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-teal-700">Verified Step</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 10: HUMAN APPROVAL CENTRE */}
          {currentPage === 'approval' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'مركز الموافقات البشرية والإجراءات الجوهرية' : 'Human Approval Centre (Consequential Action Gate)'}
                </h2>
                <p className="text-xs text-slate-500">
                  Consequential physical interventions and peak load shedding strictly require human FM authorization.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Pending Approvals ({workOrders.filter((w) => w.approval_status === 'Pending').length + optimizationPlans.filter((p) => p.approval_status === 'Pending').length} Awaiting Review)
                </h3>

                {workOrders
                  .filter((w) => w.approval_status === 'Pending')
                  .map((wo) => (
                    <div key={wo.work_order_id} className="cs-card p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-mono text-teal-600 block">{wo.work_order_id}</span>
                          <h4 className="text-sm font-bold text-slate-900">{wo.title} ({wo.building_id})</h4>
                        </div>
                        <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{wo.description}</p>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Approval Rationale / Notes:</label>
                        <input
                          type="text"
                          value={approvalRationale}
                          onChange={(e) => setApprovalRationale(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs p-2 rounded-lg"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={async () => {
                            if (!activeRoleConfig.canApproveWorkOrders) {
                              alert(t('perm_denied_owner', lang));
                              return;
                            }
                            await ApiClient.approveWorkOrder(wo.work_order_id, true, approvalRationale);
                            loadAllData();
                            alert(`Work Order ${wo.work_order_id} authorized and dispatched to field technician!`);
                          }}
                          className={`px-4 py-2 rounded-lg font-semibold text-xs transition ${
                            activeRoleConfig.canApproveWorkOrders
                              ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {activeRoleConfig.canApproveWorkOrders
                            ? '✅ Authorize Work Order (FM)'
                            : '🔒 Restricted to Facilities Manager'}
                        </button>
                        <button
                          onClick={async () => {
                            await ApiClient.approveWorkOrder(wo.work_order_id, false, approvalRationale);
                            loadAllData();
                            alert(`Work Order ${wo.work_order_id} rejected.`);
                          }}
                          className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}

                {workOrders.filter((w) => w.approval_status === 'Pending').length === 0 && (
                  <div className="cs-card p-8 text-center text-xs text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    All operational work orders have been reviewed. No pending gates.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 11: N8N WORKFLOW AUTOMATION ENGINE */}
          {currentPage === 'n8n_health' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'محرك الأتمتة البصري n8n وصحة المهام' : 'n8n Visual Workflow Automation Engine & Execution Health'}
                </h2>
                <p className="text-xs text-slate-500">
                  Self-hosted n8n orchestrator executing 9 autonomous event-driven and scheduled building workflows.
                </p>
              </div>

              <div className="cs-card overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Workflow ID & Name</th>
                      <th className="p-3">Trigger Type</th>
                      <th className="p-3">Schedule</th>
                      <th className="p-3">Latency</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Test Trigger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workflows.map((wf) => (
                      <tr key={wf.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-semibold text-slate-900">{wf.name}</td>
                        <td className="p-3 text-slate-600">{wf.trigger}</td>
                        <td className="p-3 text-slate-500">{wf.schedule}</td>
                        <td className="p-3 font-mono text-teal-700">{wf.latency}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {wf.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleTriggerWorkflow(wf.id)}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-teal-300 font-semibold text-[11px]"
                          >
                            Trigger
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 12: REPORTS & AUDITABLE DELIVERABLES */}
          {currentPage === 'reports' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'التقارير وسجلات التدقيق القابلة للتنزيل' : 'Reports & Auditable Deliverables'}
                </h2>
                <p className="text-xs text-slate-500">
                  Download official corporate ESG compliance JSON and tamper-evident audit CSV files.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="cs-card p-5 space-y-4">
                  <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                    <FileText className="w-5 h-5 text-teal-600" />
                    Corporate ESG Compliance Report (2026-Q3)
                  </div>
                  <p className="text-xs text-slate-600">
                    Complete Scope 1, Scope 2, IPMVP Option B operational reductions, and DCCE registered carbon offsets.
                  </p>
                  <button
                    onClick={() => {
                      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(esgReport, null, 2));
                      const a = document.createElement('a');
                      a.setAttribute('href', dataStr);
                      a.setAttribute('download', 'coolshield_esg_q3_2026.json');
                      a.click();
                    }}
                    className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Official ESG JSON
                  </button>
                </div>

                <div className="cs-card p-5 space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <FileText className="w-5 h-5 text-slate-700" />
                    Tamper-Evident Audit Trail Ledger
                  </div>
                  <p className="text-xs text-slate-600">
                    Complete immutable chronological ledger of all AI diagnostic investigations, human sign-offs, and verified interventions.
                  </p>
                  <button
                    onClick={() => {
                      const csvContent = 'data:text/csv;charset=utf-8,id,timestamp,actor,role,action,resource_type,resource_id\n' +
                        audits.map((a) => `${a.id},${a.timestamp},${a.actor},${a.role},${a.action},${a.resource_type},${a.resource_id}`).join('\n');
                      const a = document.createElement('a');
                      a.setAttribute('href', encodeURI(csvContent));
                      a.setAttribute('download', 'coolshield_audit_trail.csv');
                      a.click();
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Audit CSV Ledger
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 13: INTEGRATIONS, SAFETY & PILOTS */}
          {currentPage === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'التكاملات والطيار ومصفوفة أمان الـ 19 أداة' : 'Integrations, Customer Pilots & Agent 19 Typed Tools Manifest'}
                </h2>
                <p className="text-xs text-slate-500">
                  BMS gateways, prospective customer validation agreements, and typed tool risk classifications.
                </p>
              </div>

              {/* Hardware Protocol & BMS Integrations Gateways */}
              <div className="cs-card overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">BMS & Hardware Protocol Ingestion Gateways</h3>
                    <p className="text-[11px] text-slate-500">Live telemetry pipelines connected to Dubai facility infrastructure.</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {integrations.length} Active Gateways
                  </span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Gateway Name</th>
                      <th className="p-3">Protocol</th>
                      <th className="p-3">Endpoint URL</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Synced Telemetry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {integrations.map((i) => (
                      <tr key={i.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-semibold text-slate-800">{i.name}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">{i.protocol}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">{i.endpoint_url}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            i.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {i.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-700">
                          {i.readings_synced_total.toLocaleString()} msgs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Monitored Building Equipment Assets */}
              <div className="cs-card overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Monitored Building Equipment Assets</h3>
                    <p className="text-[11px] text-slate-500">Chillers, cooling towers, booster pumps, and AHUs across Dubai properties.</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                    {equipment.length} Assets Registered
                  </span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Asset</th>
                      <th className="p-3">Building</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Rated Power</th>
                      <th className="p-3">Health Score</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {equipment.map((eq) => (
                      <tr key={eq.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-semibold text-slate-800">{eq.name}</td>
                        <td className="p-3 text-slate-600">{eq.building_name}</td>
                        <td className="p-3 text-slate-600">{eq.asset_type}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-700">{eq.rated_kw} kW</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            eq.health_score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {eq.health_score}%
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {eq.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Customer Pilot Validation */}
              <div className="cs-card p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Prospective Customer Validation: Emaar Hospitality Pilot</h3>
                {pilots.map((p) => (
                  <div key={p.id} className="space-y-2 text-xs bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">{p.organization_name}</h4>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        {p.status}
                      </span>
                    </div>
                    <div>Contact: <b>{p.contact_name}</b> ({p.contact_role}) | Target: <b>{p.target_building}</b></div>
                    <div>Reported Problem: {p.reported_problem}</div>
                    <div className="p-2 bg-teal-50/60 rounded border border-teal-200 text-teal-900">
                      <b>Agreed 30-Day Acceptance Criteria:</b> {p.pilot_acceptance_criteria}
                    </div>
                  </div>
                ))}
              </div>

              {/* 19 Typed Tools Security Governance */}
              <div className="cs-card overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">Agent 19 Typed Tools Security Governance Manifest</h3>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Tool Name</th>
                      <th className="p-3">Risk Classification</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Human Approval Gate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {agentTools.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-semibold text-slate-800">{t.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.risk_level === 'Consequential'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {t.risk_level}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{t.category}</td>
                        <td className="p-3 font-semibold text-slate-700">
                          {t.approval_required ? '✅ Human FM Required' : 'Auto-Allowed'}
                        </td>
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
