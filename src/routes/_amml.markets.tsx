import { createRoute, Link } from '@tanstack/react-router';
import { Route as AmmlLayoutRoute } from './_amml';
import { MarketsView } from '../components/amml/MarketsView';
import { ArrowLeft, Landmark } from 'lucide-react';

export const Route = createRoute({
  getParentRoute: () => AmmlLayoutRoute,
  path: '/markets',
  component: MarketsRouteComponent,
});

function MarketsRouteComponent() {
  return (
    <div id="amml-markets-view" className="space-y-6">
      
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
            <span className="text-[10px] font-bold text-amml-green uppercase tracking-widest">ledger pricing portal</span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-wider mt-1.5 uppercase">Abuja Market Outposts</h1>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-amml-muted bg-amml-panel border border-amml-line px-3 py-1.5 rounded">
          <Landmark className="h-4 w-4 text-amml-green" />
          <span>LEDGER STATUS: ACTIVE SYSTEM</span>
        </div>
      </div>

      {/* Main Full-width Markets grid card view */}
      <div className="bg-amml-panel text-amml-text p-6 rounded-2xl border border-amml-line shadow-xl">
        <MarketsView />
      </div>
    </div>
  );
}
export default MarketsRouteComponent;
