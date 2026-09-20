import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { OneClickScenarios } from './components/OneClickScenarios';
import { BlastRadiusGraph } from './components/BlastRadiusGraph';
import { RemediationTerminal } from './components/RemediationTerminal';
import { AgentWorkflowModal } from './components/AgentWorkflowModal';
import { PostmortemModal } from './components/PostmortemModal';
import { PRESET_SCENARIOS } from './data/presets';
import { PresetScenario, RemediationPlan } from './types/incident';
import { analyzeLogs, simulateRemediation } from './services/triageEngine';
import {
  Activity,
  AlertCircle,
  FileText,

  Sparkles,
  ShieldAlert,


  Send,
  Terminal,
} from 'lucide-react';

export const App: React.FC = () => {
  const [logInput, setLogInput] = useState<string>(PRESET_SCENARIOS[0].sampleLog);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(PRESET_SCENARIOS[0].id);
  const [activePlan, setActivePlan] = useState<RemediationPlan>(PRESET_SCENARIOS[0].solution);
  const [isSimulatedHealthy, setIsSimulatedHealthy] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Modals
  const [isAgentModalOpen, setIsAgentModalOpen] = useState<boolean>(false);
  const [agentModalTab, setAgentModalTab] = useState<'agent' | 'architecture' | 'wellarchitected'>('agent');
  const [isPostmortemOpen, setIsPostmortemOpen] = useState<boolean>(false);

  const handleSelectScenario = (scenario: PresetScenario) => {
    setSelectedScenarioId(scenario.id);
    setLogInput(scenario.sampleLog);
    setIsAnalyzing(true);
    setIsSimulatedHealthy(false);

    setTimeout(() => {
      setActivePlan(scenario.solution);
      setIsAnalyzing(false);
    }, 350);
  };

  const handleRunTriage = () => {
    if (!logInput.trim()) return;
    setIsAnalyzing(true);
    setIsSimulatedHealthy(false);

    setTimeout(() => {
      const result = analyzeLogs(logInput);
      setActivePlan(result);
      setIsAnalyzing(false);
    }, 450);
  };

  const handleSimulateFix = () => {
    if (!activePlan) return;
    const healedBlastRadius = simulateRemediation(activePlan.blastRadius);
    setActivePlan({
      ...activePlan,
      blastRadius: healedBlastRadius,
    });
    setIsSimulatedHealthy(true);
  };

  const handleReset = () => {
    handleSelectScenario(PRESET_SCENARIOS[0]);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col">
      {/* Navigation */}
      <Navbar
        onOpenAgentProof={() => {
          setAgentModalTab('agent');
          setIsAgentModalOpen(true);
        }}
        onOpenArchitecture={() => {
          setAgentModalTab('architecture');
          setIsAgentModalOpen(true);
        }}
        onReset={handleReset}
      />

      {/* Hero Header */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-transparent py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Autonomous AWS Incident Triage & Self-Healing SRE
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Turn Cryptic AWS Outages into <br />
                <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                  Instant Root Causes & Least-Privilege Fixes
                </span>
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
                Paste any raw CloudWatch trace, broken IAM policy, or ECS timeout. CloudPulse AI maps the visual blast radius, determines Well-Architected compliance, and generates copy-paste AWS CLI runbooks with 1-click rollbacks.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-slate-900/90 border border-slate-800 shrink-0 text-xs">
              <div className="text-slate-400 font-medium">Submission Details:</div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono">Category:</span>
                <span className="font-semibold text-emerald-400">Workplace Efficiency</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono">Lane:</span>
                <span className="font-semibold text-amber-400">Startup</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono">Status:</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live on AWS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* 1-Click Judge Presets */}
        <OneClickScenarios
          onSelectScenario={handleSelectScenario}
          activeScenarioId={selectedScenarioId}
        />

        {/* Input Log Console */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                AWS Error Log & Incident Stream Console
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Accepts CloudWatch, CloudTrail, ECS, Lambda, IAM, or DynamoDB traces
            </span>
          </div>

          <div className="relative">
            <textarea
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              placeholder="Paste raw AWS error logs or stack trace here..."
              rows={5}
              className="w-full font-mono text-xs p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition resize-y"
            />
          </div>

          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>Try typing or editing the log above to test heuristic AI triage</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLogInput('')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 transition"
              >
                Clear Log
              </button>
              <button
                onClick={handleRunTriage}
                disabled={isAnalyzing || !logInput.trim()}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition shadow-md shadow-amber-500/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    Triaging Telemetry...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Run AI Triage
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Triage Overview Card */}
        {activePlan && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      activePlan.severity.startsWith('P1')
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {activePlan.severity}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    Service: {activePlan.service}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Pillar: {activePlan.wellArchitectedPillar}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activePlan.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPostmortemOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  View Postmortem
                </button>
              </div>
            </div>

            {/* Root Cause & Architectural Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Identified Root Cause
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {activePlan.rootCause}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  Blast Radius & Cascading Impact
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {activePlan.architecturalImpact}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Visual Blast Radius Topology Graph */}
        {activePlan && <BlastRadiusGraph data={activePlan.blastRadius} />}

        {/* Remediation Terminal & IAM Policy Generator */}
        {activePlan && (
          <RemediationTerminal
            plan={activePlan}
            onSimulateFix={handleSimulateFix}
            isSimulatedHealthy={isSimulatedHealthy}
          />
        )}
      </main>

      {/* Modals */}
      <AgentWorkflowModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        defaultTab={agentModalTab}
      />

      {activePlan && (
        <PostmortemModal
          isOpen={isPostmortemOpen}
          onClose={() => setIsPostmortemOpen(false)}
          markdownContent={activePlan.postmortemMarkdown}
          incidentTitle={activePlan.title}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#090d14] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">CloudPulse AI</span>
            <span>—</span>
            <span>Built for the AWS Builder Center "Zero to Shipped" Hackathon</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Tags:</span>
            <span className="text-amber-400 font-mono">#workplace-efficiency</span>
            <span className="text-emerald-400 font-mono">#startup</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
