import React, { useState } from 'react';
import { BlastRadiusData, BlastRadiusNode } from '../types/incident';
import { AlertTriangle, CheckCircle2, XCircle, Info, ShieldAlert, Layers } from 'lucide-react';

interface BlastRadiusGraphProps {
  data: BlastRadiusData;
}

export const BlastRadiusGraph: React.FC<BlastRadiusGraphProps> = ({ data }) => {
  const [selectedNode, setSelectedNode] = useState<BlastRadiusNode | null>(null);

  const getNodeStatusBadge = (status: string) => {
    switch (status) {
      case 'failed':
        return {
          bg: 'bg-rose-950/40 border-rose-500/80 text-rose-400 shadow-lg shadow-rose-500/10',
          icon: <XCircle className="w-4 h-4 text-rose-500 animate-pulse" />,
          label: 'Failed (Root)',
        };
      case 'degraded':
        return {
          bg: 'bg-amber-950/40 border-amber-500/80 text-amber-400 shadow-lg shadow-amber-500/10',
          icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
          label: 'Degraded',
        };
      case 'at-risk':
        return {
          bg: 'bg-indigo-950/40 border-indigo-500/80 text-indigo-300 shadow-lg shadow-indigo-500/10',
          icon: <ShieldAlert className="w-4 h-4 text-indigo-400" />,
          label: 'At Risk',
        };
      case 'healthy':
      default:
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300 shadow-lg shadow-emerald-500/10',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          label: 'Operational',
        };
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            Interactive Architectural Blast Radius & Dependency Topology
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time cascading failure visualization across AWS infrastructure components. Click any node for telemetry.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium flex-wrap">
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            Failed
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Degraded
          </span>
          <span className="flex items-center gap-1 text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            At Risk
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Healthy
          </span>
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="relative overflow-x-auto py-6 px-2 min-h-[220px] flex items-center justify-center">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap md:flex-nowrap justify-center">
          {data.nodes.map((node, index) => {
            const statusConfig = getNodeStatusBadge(node.status);
            const isSelected = selectedNode?.id === node.id;
            const isRoot = node.role === 'root-cause';

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <div
                  onClick={() => setSelectedNode(node)}
                  className={`cursor-pointer group relative p-4 rounded-xl border transition-all duration-300 w-52 text-left flex flex-col justify-between ${
                    statusConfig.bg
                  } ${
                    isSelected
                      ? 'ring-2 ring-white scale-105'
                      : 'hover:scale-102 hover:border-slate-500'
                  }`}
                >
                  {isRoot && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-rose-600 text-white shadow">
                      Root Cause
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {node.service}
                      </span>
                      {statusConfig.icon}
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-white truncate">
                      {node.name}
                    </h4>

                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {node.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px]">
                    <span className="font-semibold">{statusConfig.label}</span>
                    <span className="text-slate-400 group-hover:text-slate-200">
                      Details →
                    </span>
                  </div>
                </div>

                {/* Edge Connector */}
                {index < data.nodes.length - 1 && (
                  <div className="hidden md:flex flex-col items-center justify-center px-1">
                    <div className="text-[10px] font-mono text-slate-400 mb-1 max-w-[100px] text-center truncate">
                      {data.edges[index]?.label || 'Traffic'}
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`h-0.5 w-10 sm:w-14 ${
                          data.edges[index]?.isBroken
                            ? 'border-t-2 border-dashed border-rose-500 animate-pulse'
                            : 'bg-slate-700'
                        }`}
                      ></div>
                      <span
                        className={`-ml-1 text-xs ${
                          data.edges[index]?.isBroken
                            ? 'text-rose-500'
                            : 'text-slate-700'
                        }`}
                      >
                        ▶
                      </span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Telemetry Drawer */}
      {selectedNode && (
        <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  {selectedNode.name}
                </span>
                <span className="font-mono text-slate-400">
                  [{selectedNode.service}]
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-700 text-slate-300">
                  Role: {selectedNode.role}
                </span>
              </div>
              <p className="text-slate-300 mt-1">{selectedNode.description}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded bg-slate-700/50 hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};