import React, { useState } from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { AmmlUser } from '../../lib/amml/types';
import { Plus, Trash, Shield, ShieldCheck, X, Check } from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users, setUsers, markets, auditLog } = useAmmlStore();
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uLevel, setULevel] = useState<'SUPERADMIN' | 'MD' | 'MANAGER' | 'SUPERVISOR' | 'OFFICER'>('SUPERVISOR');
  const [uMkt, setUMkt] = useState('all');
  const [uPass, setUPass] = useState('password123');

  const levels = [
    { value: 'SUPERADMIN', label: 'Super Administrator' },
    { value: 'MD', label: 'Managing Director' },
    { value: 'MANAGER', label: 'Operations Head / Area Manager' },
    { value: 'SUPERVISOR', label: 'Market Supervisor' },
    { value: 'OFFICER', label: 'Market Officer' }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName.trim() || !uEmail.trim()) return;

    const newU: AmmlUser = {
      id: `u-${Date.now()}`,
      name: uName,
      email: uEmail,
      level: uLevel,
      market: uMkt,
      lastLogin: 'Never',
      active: true,
      _demoPass: uPass
    };

    setUsers(prev => [...prev, newU]);
    auditLog('SETTINGS', 'Web user registered', uName + ' (' + uLevel + ')');
    setModalOpen(false);
    setUName('');
    setUEmail('');
    setUPass('password123');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Permanently revoke credential access for web user "${name}"?`)) {
      setUsers(prev => prev.filter(x => x.id !== id));
      auditLog('SETTINGS', 'Web user credentials revoked', name);
    }
  };

  return (
    <div className="space-y-6 animate-stage-wake">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amml-text tracking-tight">Portal accounts</h2>
          <p className="text-amml-text3 text-sm mt-1">Manage web users, supervisors and administrative roles</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-amml-blue hover:bg-amml-blue-dk text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Register Portal Account
        </button>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <div key={u.id} className="bg-amml-panel border border-amml-line rounded-xl shadow-sm overflow-hidden p-5 flex flex-col justify-between h-[180px]">
            <div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-amml-text truncate">{u.name}</h3>
                    <p className="text-[10px] sm:text-xs text-amml-text3 truncate">{u.email}</p>
                  </div>
                </div>
                <span className={`inline-block text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
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
              <div className="mt-4 space-y-1 text-xs text-amml-text2">
                <div>🏢 Market Bound: <strong>{u.market}</strong></div>
                <div>🔑 Acc Passcode: <span className="font-mono bg-amml-surface2 px-1 text-amml-text font-bold border border-amml-line/30 rounded">{u._demoPass || '••••••'}</span></div>
              </div>
            </div>

            <div className="pt-3 border-t border-amml-line flex justify-between items-center text-xs text-amml-text3">
              <span>Last login: {u.lastLogin || 'Never'}</span>
              <button 
                onClick={() => handleDelete(u.id, u.name)}
                className="text-red-600 dark:text-red-400 font-bold cursor-pointer hover:underline"
              >
                Revoke Acc
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Register dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-amml-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-amml-panel border border-amml-line rounded-2xl w-full max-w-lg p-7 shadow-2xl relative animate-stage-wake">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-amml-text3 hover:text-amml-text cursor-pointer p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-amml-text mb-1">👤 Register Portal Account</h3>
            <p className="text-xs text-amml-text3 mb-4">Assign custom user levels for the administrative console.</p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Human Account Name *</label>
                <input 
                  type="text" 
                  required
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  placeholder="e.g. Ebun Obanla"
                  className="w-full bg-amml-surface border border-amml-line text-amml-text focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Official Email *</label>
                  <input 
                    type="email" 
                    required
                    value={uEmail}
                    onChange={(e) => setUEmail(e.target.value)}
                    placeholder="name@amml.gov.ng"
                    className="w-full bg-amml-surface border border-amml-line text-amml-text focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Access Passcode</label>
                  <input 
                    type="text" 
                    value={uPass}
                    onChange={(e) => setUPass(e.target.value)}
                    className="w-full bg-amml-surface border border-amml-line text-amml-text px-3 py-2 rounded-lg text-sm font-mono focus:border-amml-blue transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">System Authorization Level</label>
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
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Market bounding</label>
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
                  className="bg-amml-surface border border-amml-line hover:bg-amml-surface2 text-amml-text px-4 py-2.5 rounded-lg cursor-pointer transition-all font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-amml-blue hover:bg-amml-blue-dk text-white text-sm font-semibold px-5 py-2.5 rounded-lg cursor-pointer shadow-sm transition-all"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
