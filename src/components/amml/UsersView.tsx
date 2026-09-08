import React, { useState } from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { AmmlUser } from '../../lib/amml/types';
import { getAuthBearerToken } from '../../lib/amml/firebase';
import { runAuthorizationTestSuite, AuthTestResult } from '../../lib/amml/authTests';
import { Plus, Trash, Shield, ShieldCheck, X, Check, ShieldAlert, Play, CheckCircle2, AlertTriangle } from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users, setUsers, markets, auditLog, session } = useAmmlStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // Form
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uLevel, setULevel] = useState<'SUPERADMIN' | 'MD' | 'MANAGER' | 'SUPERVISOR' | 'OFFICER'>('SUPERVISOR');
  const [uMkt, setUMkt] = useState('all');

  // Security Test Runner State
  const [testResults, setTestResults] = useState<AuthTestResult[] | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const levels = [
    { value: 'SUPERADMIN', label: 'Super Administrator' },
    { value: 'MD', label: 'Managing Director' },
    { value: 'MANAGER', label: 'Operations Head / Area Manager' },
    { value: 'SUPERVISOR', label: 'Market Supervisor' },
    { value: 'OFFICER', label: 'Market Officer' }
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName.trim() || !uEmail.trim()) return;
    setSubmitting(true);
    setProvisionError(null);

    try {
      const token = await getAuthBearerToken();
      // Provision via backend server
      const res = await fetch('/api/amml/auth/provision-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: uName.trim(),
          email: uEmail.trim(),
          role: uLevel,
          market: uMkt
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Server rejected user provisioning.');
      }

      const data = await res.json();
      const newU: AmmlUser = {
        id: data.uid || `u-${Date.now()}`,
        uid: data.uid,
        name: uName.trim(),
        email: uEmail.trim(),
        level: uLevel,
        role: uLevel,
        market: uMkt,
        lastLogin: 'Never',
        active: true
      };

      setUsers(prev => [...prev.filter(u => u.email !== newU.email), newU]);
      auditLog('SECURITY', 'Portal user account provisioned', `${uName} (${uLevel}) - bound to ${uMkt}`);
      setModalOpen(false);
      setUName('');
      setUEmail('');
    } catch (err: any) {
      setProvisionError(err.message || 'Failed to provision account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Permanently revoke credential access for portal user "${name}"?`)) {
      setUsers(prev => prev.filter(x => x.id !== id));
      auditLog('SECURITY', 'Portal user authorization revoked', name);
    }
  };

  const handleRunSecurityTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await runAuthorizationTestSuite();
      setTestResults(results);
    } catch (e: any) {
      console.error('Security test suite error:', e);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="space-y-8 animate-stage-wake">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amml-text tracking-tight">Identity & Portal Accounts</h2>
          <p className="text-amml-text3 text-sm mt-1">Enterprise RBAC directory, custom claims governance, and security enforcement</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRunSecurityTests}
            disabled={isRunningTests}
            className="flex items-center gap-1.5 bg-amml-surface border border-amml-line hover:border-amml-blue text-amml-text px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isRunningTests ? <Shield className="h-4 w-4 animate-spin text-amml-blue" /> : <Play className="h-4 w-4 text-amml-green" />}
            <span>Run E2E Security Audit</span>
          </button>

          {session?.level === 'SUPERADMIN' && (
            <button 
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 bg-amml-blue hover:bg-amml-blue-dk text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Provision Account
            </button>
          )}
        </div>
      </div>

      {/* Security Test Results Panel */}
      {testResults && (
        <div className="bg-amml-panel border border-amml-line rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-amml-line pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amml-green" />
              <h3 className="font-serif font-bold text-base text-amml-text">E2E Authorization & Security Test Suite</h3>
            </div>
            <span className="text-xs font-mono text-amml-text3">
              {testResults.filter(r => r.status === 'passed').length} / {testResults.length} Passed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testResults.map(r => (
              <div 
                key={r.id} 
                className={`p-3.5 rounded-lg border text-xs flex flex-col justify-between space-y-2 ${
                  r.status === 'passed' 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-amml-text' 
                    : 'bg-red-500/5 border-red-500/20 text-amml-text'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    {r.status === 'passed' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                    )}
                    <span>{r.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-amml-text3">{r.durationMs}ms</span>
                </div>
                <p className="text-amml-text3 text-[11px]">{r.description}</p>
                <div className="font-mono text-[10px] bg-amml-surface px-2 py-1 rounded border border-amml-line/30 text-amml-text2 truncate">
                  {r.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <div key={u.id} className="bg-amml-panel border border-amml-line rounded-xl shadow-sm overflow-hidden p-5 flex flex-col justify-between h-[190px]">
            <div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-extrabold text-amml-text truncate">{u.name}</h3>
                    <p className="text-[10px] sm:text-xs text-amml-text3 truncate font-mono">{u.email}</p>
                  </div>
                </div>
                <span className={`inline-block text-[9px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 ${
                  u.level === 'SUPERADMIN' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300' 
                    : u.level === 'MD'
                      ? 'bg-blue-100 text-[#003C78] dark:bg-blue-950/40 dark:text-blue-300'
                      : u.level === 'SUPERVISOR'
                        ? 'bg-orange-100 text-[#C85000] dark:bg-orange-950/40 dark:text-orange-300'
                        : 'bg-green-100 text-[#288C28] dark:bg-green-950/40 dark:text-green-350'
                }`}>
                  {u.level}
                </span>
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-amml-text2">
                <div>🏢 Market Bound: <strong>{u.market}</strong></div>
                <div className="flex items-center gap-1.5">
                  <span>🔒 Claims Status:</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                    <Check className="h-3 w-3" /> Claims Synced
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-amml-line flex justify-between items-center text-xs text-amml-text3">
              <span>Last login: {u.lastLogin || 'Never'}</span>
              {session?.level === 'SUPERADMIN' && u.email !== session?.email && (
                <button 
                  onClick={() => handleDelete(u.id, u.name)}
                  className="text-red-600 dark:text-red-400 font-bold cursor-pointer hover:underline text-xs"
                >
                  Revoke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Provision dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-amml-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-amml-panel border border-amml-line rounded-2xl w-full max-w-lg p-7 shadow-2xl relative animate-stage-wake">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-amml-text3 hover:text-amml-text cursor-pointer p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-amml-text mb-1">👤 Provision Portal Account</h3>
            <p className="text-xs text-amml-text3 mb-4">Register new administrative user with custom claims and role enforcement.</p>

            {provisionError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs mb-4">
                ⚠️ {provisionError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Full Legal Name *</label>
                <input 
                  type="text" 
                  required
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  placeholder="e.g. Efosa Okosun"
                  className="w-full bg-amml-surface border border-amml-line text-amml-text focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Official AMML Email *</label>
                <input 
                  type="email" 
                  required
                  value={uEmail}
                  onChange={(e) => setUEmail(e.target.value)}
                  placeholder="name@amml.gov.ng"
                  className="w-full bg-amml-surface border border-amml-line text-amml-text focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Role Authorization Level</label>
                  <select 
                    value={uLevel}
                    onChange={(e) => setULevel(e.target.value as any)}
                    className="w-full bg-amml-surface border border-amml-line text-amml-text px-2.5 py-2 rounded-lg text-sm outline-none cursor-pointer"
                  >
                    {levels.map((l, idx) => (
                      <option className="bg-amml-panel text-amml-text" key={idx} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Market Scope</label>
                  <select 
                    value={uMkt}
                    onChange={(e) => setUMkt(e.target.value)}
                    className="w-full bg-amml-surface border border-amml-line text-amml-text px-2.5 py-2 rounded-lg text-sm outline-none cursor-pointer font-sans"
                  >
                    <option className="bg-amml-panel text-amml-text" value="all">All Market Spheres</option>
                    {markets.map(m => (
                      <option className="bg-amml-panel text-amml-text" key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-amml-line mt-6 font-sans">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-amml-surface border border-amml-line hover:bg-amml-surface2 text-amml-text px-4 py-2.5 rounded-lg cursor-pointer transition-all font-semibold text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="bg-amml-blue hover:bg-amml-blue-dk text-white text-sm font-semibold px-5 py-2.5 rounded-lg cursor-pointer shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
