import { useEffect, useState } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as RootRoute } from './__root';
import { useAmmlStore } from '../lib/amml/store';
import { AmmlLogo } from '../components/amml/AmmlLogo';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: IndexRouteComponent,
});

function IndexRouteComponent() {
  const { session } = useAmmlStore();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initiating secure system handshake...');

  const steps = [
    { threshold: 0, text: 'Resolving Abuja Markets command grid nodes...' },
    { threshold: 20, text: 'Synchronizing FCT field workforce directory...' },
    { threshold: 45, text: 'Securing biometric ingestion terminals and local databases...' },
    { threshold: 70, text: 'Compiling wage rates and policy rule lists...' },
    { threshold: 90, text: 'Clearance verified. Launching MMIS executive dashboard...' },
  ];

  useEffect(() => {
    const duration = 2500; // 2.5 seconds boost loading
    const intervalTime = 50;
    const stepsCount = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(Math.floor((currentStep / stepsCount) * 100), 100);
      setProgress(nextProgress);

      const matchingStep = [...steps].reverse().find(s => nextProgress >= s.threshold);
      if (matchingStep) {
        setStatusText(matchingStep.text);
      }

      if (currentStep >= stepsCount) {
        clearInterval(timer);
        if (session) {
          navigate({ to: '/dashboard' });
        } else {
          navigate({ to: '/login' });
        }
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [session, navigate]);

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center bg-gradient-to-b from-[#000d1e] to-[#041d3b] text-white p-6 select-none font-sans overflow-hidden">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Animated Brand Logo */}
        <div className="mb-10 transform scale-110 sm:scale-125 transition-transform duration-500 animate-[pulse_2s_infinite]">
          <AmmlLogo variant="full" size="lg" textColor="light" animate={true} />
        </div>

        {/* System Name Badge */}
        <div className="bg-amml-blue/15 border border-amml-blue/30 rounded-full px-4 py-1.5 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#9ec4f5] uppercase mb-8 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amml-green animate-ping" />
          <span>Market Management Information System (MMIS) v2.0</span>
        </div>

        {/* Dynamic Loading Text */}
        <div className="w-full text-center space-y-2 mt-4">
          <p className="font-mono text-[10px] sm:text-xs font-semibold tracking-wider text-slate-400 uppercase h-4">
            {statusText}
          </p>
          
          {/* Progress Bar Container */}
          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden p-[1px] border border-blue-900/40">
            <div 
              className="h-full bg-gradient-to-r from-amml-green via-[#008afc] to-amml-orange rounded-full transition-all duration-75 relative"
              style={{ width: `${progress}%` }}
            >
              {/* Refinement sheen light animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>

          {/* Progress Percent */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
            <span className="text-slate-500 uppercase">SYS_INITIALIZE_SECTOR</span>
            <span className="text-[#32b032] font-extrabold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Corporate Disclaimer Footer */}
      <div className="absolute bottom-6 text-center text-[10px] text-slate-500 font-sans tracking-wide">
        Abuja Markets Management Limited (AMML) • Official Command Portal • MMIS v2.0
      </div>
    </div>
  );
}

