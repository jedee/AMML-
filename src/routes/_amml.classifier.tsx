import { createRoute, Link } from '@tanstack/react-router';
import { Route as AmmlLayoutRoute } from './_amml';
import { ClassifierLane } from '../components/amml/ClassifierLane';
import { ArrowLeft, BrainCircuit, Terminal } from 'lucide-react';

export const Route = createRoute({
  getParentRoute: () => AmmlLayoutRoute,
  path: '/classifier',
  component: ClassifierRouteComponent,
});

function ClassifierRouteComponent() {
  return (
    <div id="amml-classifier-view" className="space-y-6">
      
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
            <span className="text-[10px] font-bold text-amml-green uppercase tracking-widest">COGNITIVE COMPUTE SUB-DECK</span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-wider mt-1.5 uppercase">AI Inference & Filter Engine</h1>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-amml-muted bg-amml-panel border border-amml-line px-3 py-1.5 rounded">
          <BrainCircuit className="h-4 w-4 text-amml-green animate-pulse" />
          <span>MODEL ID: GEMINI_FLASH_AUTO</span>
        </div>
      </div>

      {/* Main Classifier stages */}
      <ClassifierLane />

      {/* Pipeline execution logs description */}
      <div className="border border-amml-line bg-amml-panel p-6 rounded-lg font-mono text-xs space-y-4">
        <h3 className="font-semibold text-gray-200 uppercase flex items-center gap-2">
          <Terminal className="h-4 w-4 text-amml-green" />
          Classification Parameters Guide_
        </h3>
        
        <p className="text-amml-muted leading-relaxed uppercase">
          Each incoming data packet synapting through Zone Alpha gets tokenized and queued for batch execution. Standard thresholds:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="border border-amml-line bg-amml-ink/40 p-3 rounded">
            <p className="font-bold text-amml-green">CONFIDENCE THRESHOLD</p>
            <p className="text-[10px] text-amml-muted uppercase mt-1">Classifies anomalous nodes if &gt; 94.2% model reliability matches.</p>
          </div>
          <div className="border border-amml-line bg-amml-ink/40 p-3 rounded">
            <p className="font-bold text-amml-blue">ZK VERIFICATION RANGE</p>
            <p className="text-[10px] text-amml-muted uppercase mt-1">Accepts validity proof batches under 12ms network latency max.</p>
          </div>
          <div className="border border-amml-line bg-amml-ink/40 p-3 rounded">
            <p className="font-bold text-amml-gold">THROTTLING FILTER</p>
            <p className="text-[10px] text-amml-muted uppercase mt-1">Self-throttling synapses triggers dynamically if CPU exceeds 75%.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ClassifierRouteComponent;
