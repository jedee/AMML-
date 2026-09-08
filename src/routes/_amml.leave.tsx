import { createRoute, Link } from '@tanstack/react-router';
import { Route as AmmlLayoutRoute } from './_amml';
import { LeaveSheetView } from '../components/amml/LeaveSheetView';
import { ArrowLeft, Calendar } from 'lucide-react';

export const Route = createRoute({
  getParentRoute: () => AmmlLayoutRoute,
  path: '/leave',
  component: LeaveRouteComponent,
});

function LeaveRouteComponent() {
  return (
    <div className="space-y-6">
      {/* Route Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono select-none" id="leave-route-header">
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
            <span className="text-[10px] font-bold text-amml-green uppercase tracking-widest font-mono">HR Management</span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-wider mt-1.5 uppercase font-mono">Staff Leave Sheets</h1>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-amml-muted bg-amml-panel border border-amml-line px-3 py-1.5 rounded font-mono">
          <Calendar className="h-4 w-4 text-amml-green" />
          <span>SYSTEM CLEARANCE: ACCREDITED</span>
        </div>
      </div>

      <div className="bg-slate-50 text-slate-800 p-6 rounded-2xl border border-slate-100 shadow-xl" id="leave-view-wrapper">
        <LeaveSheetView />
      </div>
    </div>
  );
}
