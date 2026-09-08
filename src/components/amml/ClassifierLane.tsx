import React from 'react';
import { Database, KeyRound, Workflow, BrainCircuit, Box } from 'lucide-react';

export const ClassifierLane: React.FC = () => {
  const stages = [
    {
      id: 'stg-1',
      idx: 'STAGE 01',
      title: 'Packet Ingest Synapse',
      desc: 'Edge UDP payload socket stream',
      icon: Database,
      status: 'RECEIVING',
      color: 'border-amml-green text-amml-green',
      delay: '100ms'
    },
    {
      id: 'stg-2',
      idx: 'STAGE 02',
      title: 'HMAC Authentication',
      desc: 'Validity hash token checks',
      icon: KeyRound,
      status: 'VERIFIED',
      color: 'border-amml-green text-amml-green',
      delay: '200ms'
    },
    {
      id: 'stg-3',
      idx: 'STAGE 03',
      title: 'ZK Proof Ingestion',
      desc: 'Tokenizing zero-knowledge proofs',
      icon: Workflow,
      status: 'RESOLVED',
      color: 'border-amml-blue text-amml-blue',
      delay: '300ms'
    },
    {
      id: 'stg-4',
      idx: 'STAGE 04',
      title: 'AI Model Taxonomy',
      desc: 'Auto classifying anomalous streams',
      icon: BrainCircuit,
      status: 'EVALUATING',
      color: 'border-amml-gold text-amml-gold bg-amber-950/10',
      delay: '400ms'
    },
    {
      id: 'stg-5',
      idx: 'STAGE 05',
      title: 'Ledger Commit Append',
      desc: 'Posting classified block digests',
      icon: Box,
      status: 'COMMITTING',
      color: 'border-amml-muted text-amml-muted',
      delay: '500ms'
    }
  ];

  return (
    <div className="border border-amml-line bg-amml-panel p-5 rounded-lg select-none">
      <div className="flex justify-between items-center mb-5 font-mono">
        <div>
          <span className="text-[10px] font-bold text-amml-green uppercase tracking-widest block">AI CLASSIFICATION PIPELINE</span>
          <span className="text-[9px] text-amml-muted uppercase mt-0.5 block">Hydra Cognitive Threading Stages</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-amml-green bg-amml-green-2/15 border border-amml-green/25 px-2 py-0.5 rounded font-mono animate-pulse">
          <span>PIPELINE ENGINE: RUNNING</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {stages.map((stg, i) => {
          const Icon = stg.icon;
          return (
            <div 
              key={stg.id}
              id={stg.id}
              className={`border rounded p-4 flex flex-col justify-between h-40 bg-amml-ink/40 animate-stage-wake opacity-0 ${stg.color}`}
              style={{ animationDelay: stg.delay }}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[8px] tracking-wider text-amml-muted font-bold block">{stg.idx}</span>
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
                <h3 className="font-mono text-xs font-bold text-gray-200 mt-3 truncate">{stg.title}</h3>
                <p className="font-mono text-[9px] text-amml-muted mt-1 leading-snug uppercase">{stg.desc}</p>
              </div>

              <div className="flex items-center justify-between mt-4 @container font-mono text-[9px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  <span className="font-semibold">{stg.status}</span>
                </div>
                {i < 4 && (
                  <span className="hidden @xs:inline text-amml-muted font-bold text-[10px] animate-pulse">→</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
