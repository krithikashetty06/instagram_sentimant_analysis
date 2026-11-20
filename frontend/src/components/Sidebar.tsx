import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BarChart3,
  MessageSquareQuote,
  MessageSquareText,
  Info,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasAnalysis: boolean;
  backendHealthy: boolean | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  hasAnalysis,
  backendHealthy,
}) => {
  const navItems = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'analyze' as ActiveTab, label: 'Analyze Posts', icon: Sparkles },
    { id: 'single' as ActiveTab, label: 'Single Comment Analyzer', icon: MessageSquareText },
    { id: 'results' as ActiveTab, label: 'Results', icon: BarChart3, requiresData: true },
    { id: 'dataset' as ActiveTab, label: 'Comment Explorer', icon: MessageSquareQuote, requiresData: true },
    { id: 'about' as ActiveTab, label: 'About Project', icon: Info },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              SocialPulse
            </h1>
            <p className="text-xs text-slate-400 font-medium">Sentiment Analytics</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isDisabled = item.requiresData && !hasAnalysis;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setActiveTab(item.id)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : isDisabled
                  ? 'text-slate-500 opacity-50 cursor-not-allowed'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="flex-1">{item.label}</span>
              {item.requiresData && !hasAnalysis && (
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  Run
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Team / Student Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
        {/* Backend health status */}
        <div className="flex items-center justify-between text-xs px-1 text-slate-400">
          <span className="flex items-center gap-1.5">
            {backendHealthy ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-300 font-medium">API Connected</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span className="text-rose-400 font-medium">API Offline</span>
              </>
            )}
          </span>
          <span className="text-[11px] text-slate-500">v1.0</span>
        </div>

        {/* Project & Team Badge */}
        <div className="rounded-lg bg-slate-800/60 p-3 border border-slate-700/60 text-xs space-y-1.5">
          <p className="font-semibold text-slate-200">College Project</p>
          <div className="space-y-0.5 text-slate-400">
            <p className="flex justify-between">
              <span>KRITHIKA</span>
              <span className="font-mono text-slate-300">R25DG010</span>
            </p>
            <p className="flex justify-between">
              <span>TEJASWINI S</span>
              <span className="font-mono text-slate-300">R25DG026</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
