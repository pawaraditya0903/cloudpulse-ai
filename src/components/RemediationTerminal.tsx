import React, { useState } from 'react';
import { RemediationPlan } from '../types/incident';
import { Terminal, Copy, Check, Play, Undo2, ShieldCheck, ListChecks, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RemediationTerminalProps {
  plan: RemediationPlan;
  onSimulateFix: () => void;
  isSimulatedHealthy: boolean;
}

export const RemediationTerminal: React.FC<RemediationTerminalProps> = ({
  plan,
  onSimulateFix,
  isSimulatedHealthy,
}) => {
  const [activeTab, setActiveTab] = useState<'cli' | 'iam' | 'rollback' | 'checklist'>('cli');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRunSimulation = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff9900', '#10b981', '#38bdf8'],
    });
    onSimulateFix();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mb-8">
      {/* Header Tabs */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 mr-3">
            <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
          </div>

          <button
            onClick={() => setActiveTab('cli')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'cli'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            AWS CLI Fix
          </button>

          {plan.iamPolicyFix && (
            <button
              onClick={() => setActiveTab('iam')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'iam'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              IAM Policy (Least-Privilege)
            </button>
          )}

          <button
            onClick={() => setActiveTab('rollback')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'rollback'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
            Rollback Command
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'checklist'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            Action Plan
          </button>
        </div>

        {/* 1-Click Simulation */}
        <button
          onClick={handleRunSimulation}
          disabled={isSimulatedHealthy}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-md ${
            isSimulatedHealthy
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 hover:shadow-amber-500/20'
          }`}
        >
          {isSimulatedHealthy ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              System Restored (Healthy)
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Simulate Self-Healing Fix
            </>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-5 font-mono text-xs text-slate-300">
        {/* CLI Commands */}
        {activeTab === 'cli' && (
          <div className="space-y-4">
            {plan.cliCommands.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-sans text-slate-400 font-medium">
                    Step {idx + 1}: {item.explanation}
                  </span>
                  <button
                    onClick={() => copyToClipboard(item.command, idx)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-400 px-2 py-1 rounded bg-slate-800 border border-slate-700 transition"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="text-amber-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  <span className="text-slate-500 select-none">$ </span>
                  {item.command}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* IAM Policy JSON */}
        {activeTab === 'iam' && plan.iamPolicyFix && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-sans text-slate-400">
                AWS Least-Privilege IAM Policy (Strict Resource Scoping)
              </span>
              <button
                onClick={() => copyToClipboard(plan.iamPolicyFix!, 999)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-400 px-2 py-1 rounded bg-slate-800 border border-slate-700 transition"
              >
                {copiedIndex === 999 ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy JSON
                  </>
                )}
              </button>
            </div>
            <pre className="text-cyan-300 overflow-x-auto max-h-72 p-2">
              {plan.iamPolicyFix}
            </pre>
          </div>
        )}

        {/* Rollback Script */}
        {activeTab === 'rollback' && (
          <div className="space-y-4">
            {plan.cliCommands.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-sans text-rose-400 font-medium">
                    Rollback for Step {idx + 1}
                  </span>
                  <button
                    onClick={() => copyToClipboard(item.rollback, idx + 100)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 px-2 py-1 rounded bg-slate-800 border border-slate-700 transition"
                  >
                    {copiedIndex === idx + 100 ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Rollback
                      </>
                    )}
                  </button>
                </div>
                <div className="text-rose-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  <span className="text-slate-500 select-none">$ </span>
                  {item.rollback}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Plan Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-3 font-sans">
            {plan.remediationSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-slate-200 text-xs leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};