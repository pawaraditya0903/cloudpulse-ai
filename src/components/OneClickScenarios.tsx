import React from 'react';
import { PRESET_SCENARIOS } from '../data/presets';
import { PresetScenario } from '../types/incident';
import { KeyRound, Network, Database, Timer, Zap } from 'lucide-react';

interface OneClickScenariosProps {
  onSelectScenario: (scenario: PresetScenario) => void;
  activeScenarioId?: string;
}

export const OneClickScenarios: React.FC<OneClickScenariosProps> = ({
  onSelectScenario,
  activeScenarioId,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 's3-kms-access-denied':
        return <KeyRound className="w-5 h-5 text-rose-400" />;
      case 'ecs-fargate-nat-timeout':
        return <Network className="w-5 h-5 text-indigo-400" />;
      case 'dynamodb-hot-partition':
        return <Database className="w-5 h-5 text-amber-400" />;
      case 'apigw-timeout-coldstart':
        return <Timer className="w-5 h-5 text-cyan-400" />;
      default:
        return <Zap className="w-5 h-5 text-amber-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    if (severity.startsWith('P1')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Judge & Evaluator 1-Click Simulations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select an authentic AWS production failure to test instantaneous root-cause analysis & blast radius mapping.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {PRESET_SCENARIOS.map((scenario) => {
          const isSelected = activeScenarioId === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-800/90 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 group-hover:scale-105 transition-transform">
                    {getIcon(scenario.id)}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                      scenario.severity
                    )}`}
                  >
                    {scenario.severity}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
                  {scenario.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {scenario.summary}
                </p>
              </div>

              <div className="w-full pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {scenario.awsServices.map((svc) => (
                    <span
                      key={svc}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/40"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-amber-500 group-hover:translate-x-0.5 transition-transform">
                  Test →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};