import React, { useState } from 'react';
import { ApiClient } from '../api/client';
import { CheckCircle, AlertTriangle, ShieldCheck, Wrench, RefreshCw, X, ArrowRight } from 'lucide-react';
import { t } from '../i18n/translations';

interface DemoScenarioPlayerProps {
  onRefreshAll: () => void;
  lang?: string;
}

interface ScenarioDef {
  key: string;
  titleKey: string;
  descKey: string;
  building: string;
  metric: string;
  severity: string;
}

const SCENARIO_DEFS: ScenarioDef[] = [
  {
    key: 'B',
    titleKey: 'scenario_b_title',
    descKey: 'scenario_b_desc',
    building: 'DXB-HOT-02',
    metric: 'water_m3',
    severity: 'Critical'
  },
  {
    key: 'A',
    titleKey: 'scenario_a_title',
    descKey: 'scenario_a_desc',
    building: 'DXB-MIX-04',
    metric: 'cop_estimate',
    severity: 'High'
  },
  {
    key: 'C',
    titleKey: 'scenario_c_title',
    descKey: 'scenario_c_desc',
    building: 'DXB-OFF-01',
    metric: 'electricity_kwh',
    severity: 'High'
  },
  {
    key: 'D',
    titleKey: 'scenario_d_title',
    descKey: 'scenario_d_desc',
    building: 'DXB-RES-03',
    metric: 'indoor_temp_c',
    severity: 'Medium'
  }
];

export const DemoScenarioPlayer: React.FC<DemoScenarioPlayerProps> = ({ onRefreshAll, lang = 'en' }) => {
  const [selectedKey, setSelectedKey] = useState<string>('B');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [scenarioData, setScenarioData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const startScenario = async (key: string) => {
    setSelectedKey(key);
    setLoading(true);
    setIsModalOpen(true);
    setActiveStep(1); // Baseline & detection
    try {
      const data = await ApiClient.runScenario(key);
      setScenarioData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!scenarioData?.work_order?.work_order_id) return;
    setLoading(true);
    try {
      await ApiClient.approveWorkOrder(
        scenarioData.work_order.work_order_id,
        true,
        'Emergency response work order authorized by Dubai Facilities Manager.'
      );
      setActiveStep(3); // Technician step
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateTechnician = async () => {
    if (!scenarioData?.work_order?.work_order_id) return;
    setLoading(true);
    try {
      await ApiClient.executeWorkOrder(
        scenarioData.work_order.work_order_id,
        'Field technician Tariq Mansoor arrived on site. Defective component replaced, line isolated, and telemetry normalized.'
      );
      setActiveStep(4); // Verification step
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!scenarioData?.work_order?.work_order_id) return;
    setLoading(true);
    try {
      const verRes = await ApiClient.verifyWorkOrder(scenarioData.work_order.work_order_id);
      setScenarioData((prev: any) => ({ ...prev, verification: verRes }));
      setActiveStep(5); // Completed
      onRefreshAll();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await ApiClient.resetDemo();
      onRefreshAll();
      alert('Demo database reset to pristine deterministic state.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-lg mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {t('demo_mode_badge', lang)}
            </span>
            <span className="text-xs text-slate-400">{t('demo_player_badge', lang)}</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {t('demo_player_heading', lang)}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {t('demo_reset_btn', lang)}
          </button>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SCENARIO_DEFS.map((s) => (
          <div
            key={s.key}
            onClick={() => startScenario(s.key)}
            className={`cursor-pointer p-3.5 rounded-lg border transition-all text-left ${
              selectedKey === s.key
                ? 'bg-slate-800/90 border-teal-500 shadow-md ring-1 ring-teal-500/50'
                : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                s.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {s.severity}
              </span>
              <span className="text-xs font-mono text-slate-400">{s.building}</span>
            </div>
            <h4 className="text-xs font-bold text-slate-200 line-clamp-1 mb-1">{t(s.titleKey, lang)}</h4>
            <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{t(s.descKey, lang)}</p>
            <div className="flex items-center justify-between text-[11px] text-teal-400 font-semibold">
              <span>{t('demo_execute_scenario', lang)} {s.key}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Walkthrough Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 text-white shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Workflow Step Indicator */}
            <div className="mb-6">
              <div className="text-xs text-teal-400 font-semibold mb-2">
                {t('demo_modal_workflow', lang)}: {selectedKey}
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {[
                  { n: 1, label: t('demo_step_1', lang) },
                  { n: 2, label: t('demo_step_2', lang) },
                  { n: 3, label: t('demo_step_3', lang) },
                  { n: 4, label: t('demo_step_4', lang) },
                  { n: 5, label: t('demo_step_5', lang) },
                ].map((st) => (
                  <div
                    key={st.n}
                    className={`py-2 px-1 rounded-lg border font-medium ${
                      activeStep === st.n
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                        : activeStep > st.n
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    {st.label}
                  </div>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-400 mb-3" />
                <p className="text-slate-300 text-sm">{t('demo_pipeline_loading', lang)}</p>
              </div>
            ) : (
              <div>
                {/* Step 1 & 2: Detection and AI Evidence Dossier */}
                {(activeStep === 1 || activeStep === 2) && scenarioData && (
                  <div className="space-y-4">
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-teal-300 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          {t('demo_anomaly_event', lang)} #{scenarioData.event?.event_id}
                        </span>
                        <span className="text-xs text-slate-400">{t('demo_building', lang)}: {scenarioData.event?.building_id}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">{t('demo_anomaly_type', lang)}</span>
                          <span className="font-semibold text-slate-200">{scenarioData.event?.anomaly_type}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">{t('demo_observed_value', lang)}</span>
                          <span className="font-bold text-red-400">{scenarioData.event?.observed_value}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">{t('demo_expected_baseline', lang)}</span>
                          <span className="font-semibold text-emerald-400">{scenarioData.event?.baseline_value}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">{t('demo_deviation', lang)}</span>
                          <span className="font-bold text-amber-400">+{scenarioData.event?.deviation_pct}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                        {scenarioData.investigation_report?.summary}
                      </p>
                    </div>

                    {/* Ranked Causes */}
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                      <h4 className="text-xs font-bold text-slate-200 mb-2">
                        {t('demo_root_causes', lang)} ({t('demo_calibrated_conf', lang)}: {(scenarioData.investigation_report?.confidence_score * 100).toFixed(0)}%)
                      </h4>
                      <div className="space-y-2">
                        {scenarioData.investigation_report?.possible_causes?.map((c: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                            <span className="text-slate-300">{idx + 1}. {c.cause}</span>
                            <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded text-[10px] font-semibold">
                              Prob: {(c.probability * 100).toFixed(0)}% ({c.evidence_strength} Evidence)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Avoidable Cost */}
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">{t('demo_avoidable_cost_24h', lang)}</span>
                        <span className="text-lg font-bold text-amber-400">
                          AED {scenarioData.investigation_report?.financial_impact?.potential_avoidable_cost_24h_aed?.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveStep(2)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        {t('demo_btn_proceed_approval', lang)} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Human Approval */}
                {activeStep === 2 && scenarioData && (
                  <div className="space-y-4">
                    <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-amber-300 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-amber-400" />
                          {t('demo_approval_required', lang)}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{scenarioData.work_order?.work_order_id}</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-4">
                        {t('demo_approval_disclaimer', lang)}
                      </p>
                      <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-2 text-xs mb-4">
                        <div><b className="text-slate-400">{t('demo_target_asset', lang)}:</b> {scenarioData.event?.asset_id}</div>
                        <div><b className="text-slate-400">{t('demo_action', lang)}:</b> {scenarioData.investigation_report?.recommendations?.[0]?.title}</div>
                        <div><b className="text-slate-400">{t('demo_safety_notes', lang)}:</b> {scenarioData.investigation_report?.recommendations?.[0]?.safety_instructions}</div>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                        >
                          {t('demo_btn_dismiss', lang)}
                        </button>
                        <button
                          onClick={handleApprove}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {t('demo_btn_authorize', lang)}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Technician Intervention Simulation */}
                {activeStep === 3 && scenarioData && (
                  <div className="space-y-4">
                    <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-teal-300 flex items-center gap-2">
                          <Wrench className="w-5 h-5 text-teal-400" />
                          {t('demo_tech_title', lang)}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {t('demo_tech_status', lang)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-4">
                        {t('demo_tech_desc', lang)}
                      </p>
                      <button
                        onClick={handleSimulateTechnician}
                        className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                      >
                        <Wrench className="w-4 h-4" />
                        {t('demo_btn_tech_complete', lang)}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Autonomous Post-Intervention Verification */}
                {activeStep === 4 && scenarioData && (
                  <div className="space-y-4">
                    <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          {t('demo_verify_title', lang)}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {t('demo_verify_status', lang)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-4">
                        {t('demo_verify_desc', lang)}
                      </p>
                      <button
                        onClick={handleVerify}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t('demo_btn_verify', lang)}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 6: Verified Resolution Dossier */}
                {activeStep === 5 && scenarioData && (
                  <div className="space-y-4 text-center py-6">
                    <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{t('demo_verified_success', lang)}</h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
                      {t('demo_verified_desc', lang)}
                    </p>
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 max-w-lg mx-auto grid grid-cols-2 gap-3 text-xs mb-6 text-left">
                      <div>
                        <span className="text-slate-400 block text-[10px]">{t('demo_verified_savings', lang)}</span>
                        <span className="font-bold text-emerald-400 text-sm">
                          AED {scenarioData.verification?.verified_weekly_savings_aed?.toLocaleString() || '3,360'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">{t('demo_verified_audit_status', lang)}</span>
                        <span className="font-bold text-teal-400 text-sm">{t('demo_verified_ipmvp', lang)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      {t('demo_btn_return_dashboard', lang)}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
