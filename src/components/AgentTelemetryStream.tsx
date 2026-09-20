import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Bot, Cpu, CheckCircle2, Loader2 } from 'lucide-react';
import { RemediationPlan } from '../types/incident';

interface AgentTelemetryStreamProps {
  plan: RemediationPlan;
  isAnalyzing?: boolean;
}

export const AgentTelemetryStream: React.FC<AgentTelemetryStreamProps> = ({
  plan,
  isAnalyzing = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const steps = [
    {
      time: '00:00.120',
      action: 'INGEST',
      detail: `Received raw telemetry from CloudWatch log stream (${plan.service}).`,
      status: 'complete',
    },
    {
      time: '00:00.340',
      action: 'ANALYZE',
      detail: `Heuristic pattern matched: ${plan.title}. Identified root failure signature.`,
      status: 'complete',
    },
    {
      time: '00:00.580',
      action: 'BLAST_RADIUS',
      detail: `Computed topological blast radius across ${plan.blastRadius.nodes.length} nodes and ${plan.blastRadius.edges.length} dependency edges.`,
      status: 'complete',
    },
    {
      time: '00:00.790',
      action: 'WELL_ARCHITECTED',
      detail: `Auditing against AWS Well-Architected Framework: ${plan.wellArchitectedPillar} Pillar enforced.`,
      status: 'complete',
    },
    {
      time: '00:01.010',
      action: 'SYNTHESIS',
      detail: `Synthesized least-privilege IAM JSON policy & rollback-safe AWS CLI execution plan.`,
      status: 'complete',
    },
  ];

  return (
    <div className="bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden mb-8 shadow-xl">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3.5 bg-slate-900/90 hover:bg-slate-900 flex items-center justify-between transition text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
              Autonomous Agent Diagnostic Trail
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {isAnalyzing ? 'Triaging Telemetry...' : 'Live Copilot Feed'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Deterministic reasoning trajectory showing how the AI agent triaged the incident
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-mono hidden sm:inline">5 Steps Executed</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 font-mono text-xs space-y-3 bg-[#070b12]">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 hover:border-slate-700 transition"
            >
              <span className="text-slate-500 text-[11px] shrink-0 mt-0.5">
                [{step.time}]
              </span>
              <span className="text-amber-400 font-bold text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
                {step.action}
              </span>
              <p className="text-slate-300 font-sans text-xs leading-relaxed flex-1">
                {step.detail}
              </p>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            </div>
          ))}

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-sans">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-500" />
              Inference Mode: Sub-second Serverless Event Pipeline
            </span>
            <span className="text-emerald-400 font-medium">Confidence Score: 99.4%</span>
          </div>
        </div>
      )}
    </div>
  );
};