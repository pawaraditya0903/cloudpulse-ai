import React from 'react';
import { Gauge, ShieldCheck, Zap, TrendingDown } from 'lucide-react';

interface MetricsRibbonProps {
  severity: string;
  isSimulatedHealthy: boolean;
}

export const MetricsRibbon: React.FC<MetricsRibbonProps> = ({
  severity,
  isSimulatedHealthy,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
      {/* Metric 1 */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider">MTTR Reduction</span>
          <TrendingDown className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-white tracking-tight">84.2%</span>
          <span className="text-[11px] font-medium text-emerald-400">from 45m to 7m</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[84%]"></div>
        </div>
      </div>

      {/* Metric 2 */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Triage Latency</span>
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-white tracking-tight">&lt; 1.2s</span>
          <span className="text-[11px] font-medium text-amber-400">Sub-second RCA</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full w-[94%]"></div>
        </div>
      </div>

      {/* Metric 3 */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider">IAM Least Privilege</span>
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-white tracking-tight">100%</span>
          <span className="text-[11px] font-medium text-cyan-400">Zero Wildcard (*)</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full w-full"></div>
        </div>
      </div>

      {/* Metric 4 */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Cluster State</span>
          <Gauge className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-extrabold tracking-tight ${isSimulatedHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isSimulatedHealthy ? 'HEALTHY' : severity.split(' - ')[0]}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {isSimulatedHealthy ? 'All Nodes Restored' : 'Blast Radius Contained'}
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div className={`h-full rounded-full ${isSimulatedHealthy ? 'bg-emerald-500 w-full' : 'bg-rose-500 w-[60%]'}`}></div>
        </div>
      </div>
    </div>
  );
};
