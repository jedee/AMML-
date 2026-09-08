import React, { useState } from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { AmmlDevice } from '../../lib/amml/types';
import { Plus, Wifi, WifiOff, Trash, Cpu, RefreshCw, X, Check } from 'lucide-react';

export const DevicesView: React.FC = () => {
  const { devices, setDevices, markets, auditLog } = useAmmlStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [dName, setDName] = useState('');
  const [dType, setDType] = useState('Fingerprint Terminal');
  const [dMkt, setDMkt] = useState('');
  const [dSerial, setDSerial] = useState('');
  const [dLoc, setDLoc] = useState('');

  const [pinging, setPinging] = useState(false);

  const resetForm = () => {
    setDName('');
    setDType('Fingerprint Terminal');
    setDMkt(markets[0]?.name || '');
    setDSerial('');
    setDLoc('');
    setEditId(null);
    setIsEdit(false);
  };

  const deviceTypes = [
    'Fingerprint Terminal',
    'Face Recognition',
    'RFID Card Reader',
    'QR Code Scanner',
    'PIN Pad'
  ];

  const handleOpenAdd = () => {
    resetForm();
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (d: AmmlDevice) => {
    setDName(d.name);
    setDType(d.type);
    setDMkt(d.market);
    setDSerial(d.serial);
    setDLoc(d.location);
    setEditId(d.id);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Permanently remove hardware terminal node "${name}" from FCT network registry?`)) {
      setDevices(prev => prev.filter(x => x.id !== id));
      auditLog('DEVICE', 'Device decommissioned', name + ' (' + id + ')');
    }
  };

  const handleToggleState = (id: string, name: string, currentState: boolean) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, active: !currentState, lastSeen: !currentState ? 'Just now' : 'Disconnected' } : d));
    auditLog('DEVICE', `Device ${!currentState ? 'restored' : 'isolated'}`, name);
  };

  const triggerNetworkSweep = () => {
    setPinging(true);
    setTimeout(() => {
      setDevices(prev => prev.map(d => {
        // Randomly toggle state of offline ones occasionally, update lastSeen
        const active = Math.random() > 0.12; 
        return {
          ...d,
          active,
          lastSeen: active ? 'Just now' : 'Timeout failure',
        };
      }));
      auditLog('DEVICE', 'Biometrics Network Diagnostics', 'Diagnostic ping sweeps deployed to online nodes');
      setPinging(false);
    }, 1200);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dName.trim() || !dSerial.trim() || !dMkt) return;

    if (isEdit && editId) {
      setDevices(prev => prev.map(d => d.id === editId ? {
        ...d,
        name: dName,
        type: dType,
        market: dMkt,
        serial: dSerial,
        location: dLoc,
      } : d));
      auditLog('DEVICE', 'Device parameters reconfigured', dName);
    } else {
      const newD: AmmlDevice = {
        id: `d-${Date.now()}`,
        name: dName,
        type: dType,
        market: dMkt,
        serial: dSerial,
        location: dLoc,
        active: true,
        lastSeen: 'Just now',
        clocksToday: 0
      };
      setDevices(prev => [...prev, newD]);
      auditLog('DEVICE', 'New Device Integrated', dName);
    }

    setModalOpen(false);
    resetForm();
  };

  const onlineCount = devices.filter(d => d.active).length;

  return (
    <div className="space-y-6 animate-stage-wake">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amml-text tracking-tight">Access Nodes</h2>
          <p className="text-amml-text3 text-sm mt-1">
            Biometric terminal controllers status ({onlineCount} / {devices.length} online)
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            disabled={pinging}
            onClick={triggerNetworkSweep}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-amml-surface border border-amml-line text-amml-text hover:text-amml-blue hover:bg-amml-surface2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${pinging ? 'animate-spin text-amml-blue' : ''}`} /> 
            {pinging ? 'Diagnosing Nodes...' : 'Diagnose Nodes'}
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-amml-blue hover:bg-amml-blue-dk text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Provision Node
          </button>
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map(d => (
          <div key={d.id} className={`bg-amml-panel border rounded-xl shadow-sm transition-all duration-200 overflow-hidden flex flex-col justify-between ${d.active ? 'border-amml-line' : 'border-red-500/30 bg-red-500/5'}`}>
            <div className="p-5 flex gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${d.active ? 'bg-amml-surface2 text-amml-blue border border-amml-line' : 'bg-red-500/10 text-red-500 border border-red-500/25'}`}>
                <Cpu className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 justify-between">
                  <h3 className="text-base font-bold text-amml-text truncate">{d.name}</h3>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${d.active ? 'bg-amml-green/10 text-amml-green' : 'bg-red-500/10 text-red-500'}`}>
                    {d.active ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
                <div className="text-xs text-amml-text3 mt-0.5">{d.type}</div>
                <div className="text-xs text-amml-text2 font-bold mt-3 truncate">🏢 {d.market}</div>
                <div className="text-[11px] text-amml-text3 font-mono mt-1">SN: {d.serial} · Loc: {d.location || 'Entrance'}</div>
              </div>
            </div>

            {/* Performance line metrics */}
            <div className="px-5 py-3 border-y border-amml-line bg-amml-surface2 flex justify-between items-center text-xs">
              <span className="text-amml-text3">Pings Ingest Limit</span>
              <span className="font-mono font-bold text-amml-text">
                {d.clocksToday} clock streams today
              </span>
            </div>

            {/* Footer actions */}
            <div className="p-4 bg-amml-surface2 border-t border-amml-line/30 flex justify-between items-center text-xs text-amml-text3">
              <span>Last diagnostic: <strong>{d.lastSeen}</strong></span>
              
              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleOpenEdit(d)}
                  className="bg-amml-surface border border-amml-line text-amml-text hover:text-amml-blue hover:bg-amml-surface2 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Configure
                </button>
                <button 
                  onClick={() => handleToggleState(d.id, d.name, d.active)}
                  className={`px-2.5 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                    d.active 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/15' 
                      : 'bg-amml-green/10 border-amml-green/20 text-amml-green hover:bg-amml-green/15'
                  }`}
                >
                  {d.active ? 'Isolate' : 'Connect'}
                </button>
                <button 
                  onClick={() => handleDelete(d.id, d.name)}
                  className="border border-red-500/20 text-red-500 hover:bg-red-500/10 p-2 rounded-lg cursor-pointer transition-colors"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog for Provisioning hardware */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-amml-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-amml-panel border border-amml-line rounded-2xl w-full max-w-lg p-7 shadow-2xl relative animate-stage-wake">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-amml-text3 hover:text-amml-text cursor-pointer p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-amml-text mb-1">
              {isEdit ? '🔌 Reconfigure Hardware Node' : '🔌 Provision Hardware Node'}
            </h3>
            <p className="text-xs text-amml-text3 mb-4">Set network credentials and physical bindings.</p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Terminal Node Identifier (Name) *</label>
                <input 
                  type="text" 
                  required
                  value={dName}
                  onChange={(e) => setDName(e.target.value)}
                  placeholder="e.g. West Wing Ingest Gate"
                  className="w-full bg-amml-surface border border-amml-line text-amml-text focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Hardware Interface Category</label>
                  <select 
                    value={dType}
                    onChange={(e) => setDType(e.target.value)}
                    className="w-full bg-amml-surface border border-amml-line text-amml-text px-2.5 py-2 rounded-lg text-sm outline-none cursor-pointer"
                  >
                    {deviceTypes.map((t, idx) => (
                      <option className="bg-amml-panel text-amml-text" key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Binds Market Zone *</label>
                  <select 
                    required
                    value={dMkt}
                    onChange={(e) => setDMkt(e.target.value)}
                    className="w-full bg-amml-surface border border-amml-line text-amml-text px-2.5 py-2 rounded-lg text-sm outline-none cursor-pointer font-sans"
                  >
                    {markets.map(m => (
                      <option className="bg-amml-panel text-amml-text" key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Hardware Serial Number SN *</label>
                  <input 
                    type="text" 
                    required
                    value={dSerial}
                    onChange={(e) => setDSerial(e.target.value)}
                    placeholder="e.g. SN-ZK-3392"
                    className="w-full bg-amml-surface border border-amml-line text-amml-text focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Installation Physical Spot</label>
                  <input 
                    type="text" 
                    value={dLoc}
                    onChange={(e) => setDLoc(e.target.value)}
                    placeholder="e.g. Main entrance path"
                    className="w-full bg-amml-surface border border-amml-line text-amml-text focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-amml-line mt-6 font-sans">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-amml-surface border border-amml-line hover:bg-amml-surface2 text-amml-text px-4 py-2.5 rounded-lg cursor-pointer transition-all font-semibold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-amml-blue hover:bg-amml-blue-dk text-white text-xs font-bold px-5 py-2.5 rounded-lg cursor-pointer shadow-sm transition-all"
                >
                  {isEdit ? 'Apply Configuration' : 'Connect Terminal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
