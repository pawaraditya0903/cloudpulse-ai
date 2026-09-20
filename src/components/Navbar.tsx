import React from 'react';
import { Activity, Cpu, RefreshCw, Sparkles, } from 'lucide-react';

interface NavbarProps {
  onOpenAgentProof: () => void;
  onOpenArchitecture: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAgentProof,
  onOpenArchitecture,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0b0f17]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20 text-slate-950">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                Cloud<span className="text-amber-500">Pulse</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                AI SRE Copilot
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Zero to Shipped AWS Builder Center Hackathon
            </p>
          </div>
        </div>

        {/* Hackathon Badges */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            #workplace-efficiency
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-800/80 text-amber-300/90 border border-slate-700/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            #startup
          </span>
        </div>

        {/* Navigation CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenAgentProof}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 transition"
            title="View documented proof of the coding agent AWS console connection"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Agent Proof</span>
          </button>

          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 transition"
            title="View AWS Architecture and Well-Architected Framework alignment"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Architecture</span>
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
            title="Reset Console"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
