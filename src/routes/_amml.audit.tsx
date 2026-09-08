import { useState } from 'react';
import { createRoute, Link } from '@tanstack/react-router';
import { Route as AmmlLayoutRoute } from './_amml';
import { ActivityLogView } from '../components/amml/ActivityLogView';
import { SystemAuditSuite } from '../components/amml/SystemAuditSuite';
import { ArrowLeft, Terminal, ShieldAlert, History } from 'lucide-react';

export const Route = createRoute({
  getParentRoute: () => AmmlLayoutRoute,
  path: '/audit',
  component: AuditRouteComponent,
});

function AuditRouteComponent() {
  const [activeTab, setActiveTab] = useState<'trail' | 'analyzer'>('analyzer');

  return (
    <div className="space-y-6">
      
      {/* Route Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono select-none">
        <div>
          <div className="flex items-center gap-2">
            <Link 
              to="/dashboard" 
              className="p-1 px-2 bg-amml-panel hover:bg-amml-line border border-amml-line rounded text-amml-green text-[10px] uppercase transition-colors"
            >
              <div className="flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                <span>Return</span>
              </div>
            </Link>
            <span className="text-amml-muted">•</span>
            <span className="text-[10px] font-bold text-amml-green uppercase tracking-widest">NOC AUDIT CENTRE</span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-wider mt-1.5 uppercase">SYSTEM ASSURANCE & AUDITS</h1>
        </div>
        
        {/* Tab Selection Switcher */}
        <div className="flex items-center gap-1.5 bg-amml-ink/40 border border-amml-line p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
              activeTab === 'analyzer'
                ? 'bg-[#DC6400] text-white shadow-md'
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>INTEGRITY ANALYZER</span>
          </button>
          <button
            onClick={() => setActiveTab('trail')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
              activeTab === 'trail'
                ? 'bg-[#DC6400] text-white shadow-md'
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>OPERATIONS LEDGER</span>
          </button>
        </div>
      </div>

      {/* Main View Port Container */}
      <div className="bg-amml-panel text-amml-text p-6 rounded-2xl border border-amml-line shadow-xl">
        {activeTab === 'analyzer' ? (
          <SystemAuditSuite />
        ) : (
          <ActivityLogView />
        )}
      </div>
    </div>
  );
}

