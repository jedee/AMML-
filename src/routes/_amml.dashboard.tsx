import { createRoute, Link } from '@tanstack/react-router';
import { Route as AmmlLayoutRoute } from './_amml';
import { DashboardView } from '../components/amml/DashboardView';
import { NetworkStatusCard } from '../components/NetworkStatusCard';
import { Shield, ArrowRight } from 'lucide-react';

export const Route = createRoute({
  getParentRoute: () => AmmlLayoutRoute,
  path: '/dashboard',
  component: DashboardRouteComponent,
});

function DashboardRouteComponent() {
  return (
    <div id="amml-dashboard-view" className="space-y-6">
      
      {/* 1. Hero Cover Panel */}
      <section id="sec-hero-map" className="grid grid-cols-1 gap-6">
        
        {/* Info Text description block */}
        <div 
          id="dashboard-hero-info" 
          className="relative border border-amml-line bg-gradient-to-br from-amml-panel to-amml-ink/80 p-6 rounded-lg flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle background radar circles */}
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full border border-amml-green/5 pointer-events-none" />
          
          <div className="space-y-4 font-mono">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amml-green animate-pulse" />
              <span className="text-xs font-bold text-gray-200 uppercase tracking-widest">COGNITIVE SYNC CONTROL</span>
            </div>
            
            <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
              OPERATIONAL MASTER DECK ACTIVE_
            </h2>
            
            <p className="text-xs text-amml-muted leading-relaxed uppercase">
              Phase 4a manages active biometrics monitoring and cognitive sync status systems across FCT Abuja market zones (Gudu, Wuse, Utako, Nyanya).
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-amml-line/60 flex flex-col sm:flex-row gap-4 font-mono text-xs">
            <Link 
              to="/insights" 
              className="group flex items-center justify-between px-3 py-2 bg-amml-page hover:bg-white/5 border border-amml-line rounded text-amml-green transition-all"
            >
              <span>ACCESS AI ANALYZER SUITE</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Network Live Mesh Telemetry Status Widget */}
      <NetworkStatusCard />

      {/* Main Full-Width Dashboard Panel */}
      <div className="bg-amml-surface text-amml-text p-6 rounded-2xl border border-amml-border shadow-xl">
        <DashboardView />
      </div>
    </div>
  );
}
export default DashboardRouteComponent;
