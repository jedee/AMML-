import React, { useState } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as RootRoute } from './__root';
import { useAmmlStore } from '../lib/amml/store';
import { AmmlLogo } from '../components/amml/AmmlLogo';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/login',
  component: LoginRouteComponent,
});

function LoginRouteComponent() {
  const { handleLoginSim, users } = useAmmlStore();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'demo' | 'live'>('demo');
  const [selectedRole, setSelectedRole] = useState<'SUPERADMIN' | 'MD' | 'MANAGER' | 'SUPERVISOR' | 'OFFICER'>('MD');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const rolesList = [
    {
      role: 'SUPERADMIN' as const,
      name: 'Super Administrator',
      desc: 'System config · User management · All access',
      badge: 'LEVEL 1',
      badgeColor: 'rgba(74,20,140,.2)',
      textColor: '#CE93D8',
      icon: '👑',
      defaultEmail: 'admin@amml.gov.ng'
    },
    {
      role: 'MD' as const,
      name: 'Managing Director',
      desc: 'Executive view · Finance · Full reports',
      badge: 'LEVEL 2',
      badgeColor: 'rgba(0,60,120,.25)',
      textColor: '#90CAF9',
      icon: '🏛️',
      defaultEmail: 'director@amml.gov.ng'
    },
    {
      role: 'MANAGER' as const,
      name: 'Head of Operations / Area Manager',
      desc: 'Multi-market · Devices · Staff management',
      badge: 'LEVEL 3',
      badgeColor: 'rgba(0,100,180,.2)',
      textColor: '#64B5F6',
      icon: '⚙️',
      defaultEmail: 'manager@amml.gov.ng'
    },
    {
      role: 'SUPERVISOR' as const,
      name: 'Market Supervisor / HR & Admin',
      desc: 'Single market · Attendance · Staff records',
      badge: 'LEVEL 4',
      badgeColor: 'rgba(220,100,0,.2)',
      textColor: '#FFB74D',
      icon: '📋',
      defaultEmail: 'supervisor@amml.gov.ng'
    },
    {
      role: 'OFFICER' as const,
      name: 'Market Officer / Field Staff',
      desc: 'Clock in/out · My records · Notices',
      badge: 'LEVEL 5',
      badgeColor: 'rgba(40,140,40,.2)',
      textColor: '#81C784',
      icon: '👤',
      defaultEmail: 'officer@amml.gov.ng'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsVerifying(true);

    try {
      let targetEmail = email;
      let targetPass = password;

      if (mode === 'demo') {
        const matchingRole = rolesList.find(r => r.role === selectedRole);
        targetEmail = matchingRole ? matchingRole.defaultEmail : 'director@amml.gov.ng';
        // Password for demo seed accounts resides in mock/users (they match default passwords)
        targetPass = selectedRole === 'SUPERADMIN' ? 'admin123' :
                     selectedRole === 'MD' ? 'director123' :
                     selectedRole === 'MANAGER' ? 'manager123' :
                     selectedRole === 'SUPERVISOR' ? 'supervisor123' : 'officer123';
      }

      await handleLoginSim(targetEmail, selectedRole, targetPass);
      navigate({ to: '/dashboard' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Access Denied. Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000018] via-[#00285a] to-[#001030] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-[24px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] flex flex-col my-8">
        
        {/* Reusable High-Fidelity AMML Logo */}
        <div className="flex flex-col items-center mb-6">
          <AmmlLogo variant="full" size="lg" textColor="light" />
          <div className="w-full h-px bg-white/10 my-5" />
          <h2 className="text-xl sm:text-2xl font-sans font-black text-white tracking-tight text-center">Portal Authorization</h2>
          <p className="text-white/45 text-xs text-center mt-1">Abuja Markets Management Information System</p>
        </div>

        {/* Roles Level Grid (Demo mode select) */}
        {mode === 'demo' && (
          <div className="flex flex-col gap-2 mb-6">
            {rolesList.map(r => (
              <button
                key={r.role}
                type="button"
                onClick={() => setSelectedRole(r.role)}
                className={`flex items-center gap-4 text-left p-3.5 rounded-[12px] border transition-all duration-200 cursor-pointer ${
                  selectedRole === r.role
                    ? 'bg-amml-blue/20 border-amml-blue shadow-[0_0_12px_rgba(0,100,180,0.3)]'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: r.badgeColor }}>
                  {r.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{r.name}</div>
                  <div className="text-[11px] text-white/50 mt-0.5">{r.desc}</div>
                </div>
                <span className="text-[9px] font-extrabold tracking-wider px-2 py-1 rounded-full shrink-0" style={{ backgroundColor: r.badgeColor, color: r.textColor }}>
                  {r.badge}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Real Live Inputs (Live mode) */}
        {mode === 'live' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-white/50 uppercase mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@amml.gov.ng"
                className="w-full bg-white/5 border border-white/10 rounded-[8px] px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amml-blue focus:bg-amml-blue/10 transition-all font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-white/50 uppercase mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full bg-white/5 border border-white/10 rounded-[8px] px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amml-blue focus:bg-amml-blue/10 transition-all font-sans"
              />
            </div>
          </div>
        )}

        {/* Demo Mode or Live Mode Switch Toggle */}
        <div className="flex border border-white/15 rounded-lg overflow-hidden mb-6">
          <button
            type="button"
            onClick={() => setMode('demo')}
            className={`flex-1 py-2 text-xs font-bold leading-normal transition-all cursor-pointer ${
              mode === 'demo' ? 'bg-amml-orange text-white' : 'bg-transparent text-white/45 hover:text-white'
            }`}
          >
            🎭 Demo Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('live')}
            className={`flex-1 py-2 text-xs font-bold leading-normal transition-all cursor-pointer ${
              mode === 'live' ? 'bg-amml-blue text-white' : 'bg-transparent text-white/45 hover:text-white'
            }`}
          >
            🌐 Live (Backend)
          </button>
        </div>

        {/* Error Dialog info */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-xs font-sans text-red-300 mb-4 text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Submit Gate Access Trigger */}
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 bg-gradient-to-r from-amml-blue to-amml-blue-dk border-none rounded-[12px] text-white font-sans font-extrabold text-sm sm:text-base tracking-wide uppercase hover:scale-[1.01] hover:-translate-y-0.5 active:scale-100 transition-all duration-200 cursor-pointer shadow-[0_4px_15px_rgba(0,100,180,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <span className="animate-spin text-white">⚙️</span>
                <span>AUTHENTICATING LEVEL...</span>
              </>
            ) : (
              <span>Access System →</span>
            )}
          </button>
        </form>

        <p className="text-center text-white/20 text-[10px] mt-6 font-sans">
          Abuja Markets Management Limited (AMML) • MMIS v2.0 • FCT Abuja
        </p>
      </div>
    </div>
  );
}
