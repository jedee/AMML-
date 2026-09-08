import React, { useState } from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { AmmlMarket, AmmlStaff } from '../../lib/amml/types';
import { Plus, Store, Check, PlusCircle, Trash, X, ArrowLeftRight, Users, Smartphone, MapPin, Package } from 'lucide-react';
import { EmployeeProfileCard } from './EmployeeProfileCard';

const getCorrectedName = (name: string): string => {
  const u = name.toUpperCase().replace(/[-.]/g, ' ').trim();
  if (u.includes("MANGER JUSTINE") || u.includes("JUSTINE MANGER")) return "JUSTINE MANGER";
  if (u.includes("MADINA RAZAQ HASSAN") || u.includes("MADINA RASAK HASSAN")) return "MADINA RASAK HASSAN";
  if (u.includes("HALIMA MUHAMMAD RABIU") || u.includes("HALIMA RABIU MUHAMMAD")) return "HALIMA RABIU MUHAMMAD";
  if (u.includes("SANGOTOYE A ABIGAIL") || u.includes("SANGOTOYE ABIGAIL")) return "SANGOTOYE ABIGAIL";
  if (u.includes("MUHAMMAD HAUWA KAKA") || u.includes("HAUWA KAKA MUHAMMAD")) return "HAUWA KAKA MUHAMMAD";
  if (u.includes("BAIDI AISHA GAJO") || u.includes("AISHA BAIDI GAJO")) return "AISHA BAIDI GAJO";
  if (u.includes("AHMED UMAR ABUBAKAR") || u.includes("ABUBAKAR AHMED UMAR")) return "ABUBAKAR AHMED UMAR";
  if (u.includes("SARAH T BROWN") || u.includes("SARAH BROWN")) return "SARAH BROWN TAMUNOTARIBO";
  if (u.includes("WILLIAMS JOY OKRI") || u.includes("WILLIAMS JOY OKOI")) return "WILLIAMS JOY OKOI";
  if (u.includes("OGUNYEMI RAFIAT") || u.includes("RAFAIAT OGUNYEMI")) return "RAFAIAT OGUNYEMI OPEYEMI";
  if (u.includes("ONYA N OJIJI") || u.includes("ONYA OJIJI")) return "ONYA OJIJI";
  if (u.includes("MICHEAL O OKPEWHO") || u.includes("MICHAEL OKPEWHO")) return "MICHAEL OKPEWHO";
  if (u.includes("BENEDICT AJIO") || u.includes("AJIO BENEDICT")) return "AJIO BENEDICT BEMSHIMA (DISPATCH)";
  if (u.includes("BASHIRU DAUDA")) return "BASHIR DAUDA";
  return u;
};

const areNamesMatching = (staffName: string, memoTo: string, memoMarket?: string, staffMarket?: string): boolean => {
  if (memoMarket && staffMarket) {
    const mktMemo = memoMarket.toLowerCase().replace(/market|operations|international|model|farmers/g, '').trim();
    const mktStaff = staffMarket.toLowerCase().replace(/market|operations|international|model|farmers/g, '').trim();
    if (mktMemo !== mktStaff && mktMemo !== "head office" && mktStaff !== "head office") {
      return false;
    }
  }

  const sNorm = getCorrectedName(staffName);
  const mNorm = getCorrectedName(memoTo);

  if (sNorm === mNorm) return true;
  if (sNorm.includes(mNorm) || mNorm.includes(sNorm)) return true;

  const sWords = sNorm.split(' ').filter(w => w.length > 2);
  const mWords = mNorm.split(' ').filter(w => w.length > 2);

  const overlap = sWords.filter(w => mWords.includes(w));
  if (overlap.length >= 2) return true;
  if (overlap.length > 0 && (overlap.length === sWords.length || overlap.length === mWords.length)) return true;

  return false;
};

export const MarketsView: React.FC = () => {
  const { markets, setMarkets, staff, setStaff, att, auditLog, assets, assetStocks } = useAmmlStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Selected market for the staff redeployment cards viewer
  const [selectedRedeployMarket, setSelectedRedeployMarket] = useState<string>('');
  const [selectedStaffForCard, setSelectedStaffForCard] = useState<AmmlStaff | null>(null);

  // Local helper to track dynamic leave status & others
  const getLocalStaffStatus = (s: AmmlStaff) => {
    const remarksUpper = (s.remarks || '').toUpperCase();
    if (remarksUpper.includes('RESIGNED')) {
      return { label: 'Resigned', class: 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20' };
    }
    if (remarksUpper.includes('ABSCONDED')) {
      return { label: 'Absconded', class: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
    }

    try {
      const saved = localStorage.getItem('amml_leave_memos');
      if (saved) {
        const memos: any[] = JSON.parse(saved);
        const staffName = `${s.first} ${s.last}`;
        const idNorm = s.id.toUpperCase().trim();

        const hasActiveLeave = memos.some(memo => {
          if (memo.status !== 'approved' && !memo.synced) return false;
          
          const memoStaffId = memo.staffId ? memo.staffId.toUpperCase().trim() : '';

          const isNameMatch = areNamesMatching(staffName, memo.to || '', memo.market || '', s.market || '');
          const isIdMatch = idNorm && memoStaffId && idNorm === memoStaffId;

          if (!isNameMatch && !isIdMatch) return false;

          if (memo.startDate && memo.endDate) {
            const check = new Date();
            const start = new Date(memo.startDate + 'T00:00:00');
            const end = new Date(memo.endDate + 'T00:00:00');
            return check >= start && check <= end;
          }
          return false;
        });

        if (hasActiveLeave) {
          return { label: 'On Leave', class: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold' };
        }
      }
    } catch (e) {
      console.error(e);
    }

    if (!s.active) {
      return { label: 'Suspended', class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
    }
    return { label: 'Active', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
  };

  // Redeployment action handler
  const handleRedeployStaff = (staffId: string, oldMarket: string, targetMarketName: string) => {
    if (!targetMarketName) return;
    const personnel = staff.find(s => s.id === staffId);
    if (!personnel) return;

    if (personnel.market === targetMarketName) {
      alert(`Personnel is already assigned to ${targetMarketName}.`);
      return;
    }

    // Check capacity target
    const targetM = markets.find(m => m.name === targetMarketName);
    if (targetM) {
      const currentAssigned = staff.filter(s => s.market === targetMarketName).length;
      if (currentAssigned >= targetM.capacity) {
        if (!window.confirm(`WARNING: ${targetMarketName} has reached its designated capacity load of ${targetM.capacity} staff. Proceed with override redeployment?`)) {
          return;
        }
      }
    }

    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, market: targetMarketName } : s));
    auditLog('SETTINGS', 'Staff Redeployed', `${personnel.first} ${personnel.last} (ID: ${staffId}) relocated from [${oldMarket}] to [${targetMarketName}]`);
    alert(`Success! ${personnel.first} ${personnel.last} has been officially redeployed to ${targetMarketName}.`);
  };

  // Form Fields
  const [mName, setMName] = useState('');
  const [mLoc, setMLoc] = useState('');
  const [mMgr, setMMgr] = useState('');
  const [mCap, setMCap] = useState(100);
  const [mDays, setMDays] = useState('Mon–Sat');
  const [mDesc, setMDesc] = useState('');
  const [redeploySearch, setRedeploySearch] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);

  const resetForm = () => {
    setMName('');
    setMLoc('');
    setMMgr('');
    setMCap(100);
    setMDays('Mon–Sat');
    setMDesc('');
    setEditId(null);
    setIsEdit(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (m: AmmlMarket) => {
    setMName(m.name);
    setMLoc(m.location);
    setMMgr(m.manager);
    setMCap(m.capacity);
    setMDays(m.days);
    setMDesc(m.desc);
    setEditId(m.id);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    const attachedCount = staff.filter(s => s.market === name).length;
    if (attachedCount > 0) {
       alert(`Cannot delete ${name} — ${attachedCount} active staff are currently assigned here. Reassign staff first.`);
       return;
    }
    if (window.confirm(`Permanently remove "${name}" from registered AMML markets registry? This cannot be undone.`)) {
      setMarkets(prev => prev.filter(m => m.id !== id));
      auditLog('SETTINGS', 'Market deleted', name);
    }
  };

  const handleToggleActive = (id: string, name: string, curState: boolean) => {
    setMarkets(prev => prev.map(m => m.id === id ? { ...m, active: !curState } : m));
    auditLog('SETTINGS', `Market ${!curState ? 'activated' : 'suspended'}`, name);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim()) return;

    if (isEdit && editId) {
      setMarkets(prev => prev.map(m => m.id === editId ? {
        ...m,
        name: mName,
        location: mLoc,
        manager: mMgr,
        capacity: mCap,
        days: mDays,
        desc: mDesc,
      } : m));
      auditLog('SETTINGS', 'Market updated', mName);
    } else {
      const newM: AmmlMarket = {
        id: `m-${Date.now()}`,
        name: mName,
        location: mLoc,
        manager: mMgr,
        capacity: mCap,
        days: mDays,
        active: true,
        desc: mDesc,
      };
      setMarkets(prev => [...prev, newM]);
      auditLog('SETTINGS', 'Market registered', mName);
    }

    setModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6 animate-stage-wake">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amml-text tracking-tight">Market complexes</h2>
          <p className="text-amml-text3 text-sm mt-1">Manage physical market directories across FCT Abuja</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-amml-blue hover:bg-amml-blue-dk text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Market Complex
        </button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map(m => {
          const associatedStaffCount = staff.filter(s => s.market === m.name).length;
          const presentTodayCount = new Set(att.filter(a => a.date === todayStr && a.market === m.name).map(a => a.staffId)).size;
          const loadPct = m.capacity > 0 ? Math.round((associatedStaffCount / m.capacity) * 100) : 0;
          
          return (
            <div key={m.id} className={`bg-amml-panel border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-200 ${m.active ? 'border-amml-line' : 'border-red-500/30 opacity-70 bg-red-500/5'}`}>
              <div className="bg-gradient-to-br from-amml-blue-dkr to-amml-blue p-5 text-white relative">
                <h3 className="text-lg font-serif font-bold pr-8">{m.name}</h3>
                <p className="text-xs text-white/70 mt-1">📍 {m.location}</p>
                <div className="absolute right-4 bottom-[-10px] text-5xl opacity-10">🏪</div>
              </div>

              <div className="p-5 space-y-3.5 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-amml-text3">Manager In Charge</span>
                  <span className="font-bold text-amml-text">{m.manager}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-amml-text3">Staff Capacity</span>
                  <span className="font-bold text-amml-text">{associatedStaffCount} / {m.capacity}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-amml-text3">Operating Days</span>
                  <span className="font-bold text-amml-text">{m.days}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-amml-text3">Today present</span>
                  <span className="font-bold text-amml-blue">{presentTodayCount} checked-in</span>
                </div>

                {/* Progress bar represent current staff allocation vs capacity limit */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-amml-text3 mb-1">
                    <span>Staff allocation load</span>
                    <span>{loadPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-amml-surface2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amml-blue to-amml-orange transition-all" 
                      style={{ width: `${Math.min(loadPct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Expand / select redeployment focus button to view live nominal cards */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRedeployMarket(m.name);
                    const el = document.getElementById('staff-redeployment-board');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5" />
                  Redeployment nominal card deck ({associatedStaffCount})
                </button>

                <p className="text-xs text-amml-text3 italic leading-relaxed pt-2 border-t border-amml-line mt-2">{m.desc || 'No descriptive information loaded.'}</p>
              </div>

              {/* Card Footer actions */}
              <div className="p-4 border-t border-amml-line bg-amml-surface2 flex justify-between items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${m.active ? 'bg-amml-green/10 text-amml-green' : 'bg-red-500/10 text-red-550'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${m.active ? 'bg-amml-green' : 'bg-red-500 animate-pulse'}`} />
                  {m.active ? 'Operational' : 'Suspended'}
                </span>
                
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => handleOpenEdit(m)}
                    className="bg-amml-surface border border-amml-line text-amml-text hover:border-amml-blue text-xs font-bold px-3 py-1.5 rounded-md transition-colors cursor-pointer outline-none"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleToggleActive(m.id, m.name, m.active)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                      m.active 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/15' 
                        : 'bg-amml-green/10 border-amml-green/20 text-amml-green hover:bg-amml-green/15'
                    }`}
                  >
                    {m.active ? 'Suspend' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleDelete(m.id, m.name)}
                    className="border border-red-500/20 hover:bg-red-500/10 text-red-500 p-1.5 rounded-md transition-colors cursor-pointer"
                    title="Delete complex registry"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. INTERACTIVE STAFF ALLOCATION & REDEPLOYMENT STUDY BOARD */}
      <div 
        id="staff-redeployment-board" 
        className="bg-amml-panel border border-amml-line rounded-2xl p-6 space-y-6 shadow-sm mt-8 animate-stage-wake"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-amml-line pb-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-amml-text flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/15 text-indigo-400 rounded-lg">
                <ArrowLeftRight className="h-5 w-5" />
              </span>
              Abuja Staff Nominal Desk & Redeployment Deck
            </h3>
            <p className="text-amml-text3 text-xs mt-1">
              Select any physical market complex to see live stationed nominal card registries and trigger instant personnel redeployment.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            {/* Market selector dropdown */}
            <select
              value={selectedRedeployMarket || (markets[0]?.name || '')}
              onChange={e => setSelectedRedeployMarket(e.target.value)}
              className="bg-amml-surface border border-amml-line rounded-lg px-3 py-2 text-xs font-bold text-amml-text focus:outline-none focus:border-indigo-500 min-w-[200px]"
            >
              <option value="">-- Choose Market Complex --</option>
              {markets.map(m => (
                <option key={m.id} value={m.name}>
                  🏪 {m.name} ({staff.filter(s => s.market === m.name).length} stationed)
                </option>
              ))}
            </select>

            {/* Quick search input */}
            <input 
              type="text" 
              placeholder="Search staff Name/Role..."
              value={redeploySearch}
              onChange={e => setRedeploySearch(e.target.value)}
              className="bg-amml-surface border border-amml-line rounded-lg px-3 py-2 text-xs text-amml-text placeholder-amml-text3 focus:outline-none focus:border-indigo-500 w-full sm:w-[180px]"
            />
          </div>
        </div>

        {/* Selected Market Header metadata summaries */}
        {(() => {
          const currentMarketName = selectedRedeployMarket || (markets[0]?.name || '');
          const currentMarketObj = markets.find(m => m.name === currentMarketName);
          const filteredStaff = staff.filter(s => {
            const matchesMarket = s.market === currentMarketName;
            if (!matchesMarket) return false;
            if (!redeploySearch.trim()) return true;
            const term = redeploySearch.toLowerCase();
            return (
              s.first.toLowerCase().includes(term) ||
              s.last.toLowerCase().includes(term) ||
              s.role.toLowerCase().includes(term) ||
              s.id.toLowerCase().includes(term)
            );
          });

          return (
            <div className="space-y-4">
              {currentMarketObj && (
                <div className="p-3 bg-[#111c2a] border border-slate-800 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono">Current Complex</span>
                    <span className="font-bold text-slate-200">{currentMarketObj.name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono">Supervisor In Charge</span>
                    <span className="font-bold text-indigo-400">{currentMarketObj.manager}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono">Stationed Nominal Register</span>
                    <span className="font-bold text-slate-200">
                      {staff.filter(s => s.market === currentMarketObj.name).length} of {currentMarketObj.capacity} capacity limit
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono">Operational Mode</span>
                    <span className="inline-flex items-center gap-1 text-emerald-450 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {currentMarketObj.days}
                    </span>
                  </div>
                </div>
              )}

              {/* Dynamic Deployed Corporate Assets ledger for the active Market outpost */}
              {(() => {
                const marketAssets = (assetStocks || [])
                  .filter(s => s.warehouseId === currentMarketName && s.quantity > 0)
                  .map(stock => {
                    const asset = (assets || []).find(a => a.id === stock.itemId);
                    return {
                      ...stock,
                      asset
                    };
                  })
                  .filter(item => item.asset !== undefined);

                const totalAssetValuation = marketAssets.reduce(
                  (sum, item) => sum + (item.quantity * (item.asset?.unitCost || 0)), 0
                );

                return (
                  <div className="bg-[#0e1a2b] border border-slate-800 rounded-xl p-4.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/60 select-none">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#DC6400]" />
                        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          Deployed Logistics Assets — {currentMarketName}
                        </h4>
                      </div>
                      <span className="font-mono text-xs text-slate-350">
                        Total Market Valuation: <strong className="text-indigo-400 font-bold">₦{totalAssetValuation.toLocaleString()}</strong>
                      </span>
                    </div>

                    {marketAssets.length === 0 ? (
                      <div className="py-5 text-center text-[11px] font-mono text-slate-500">
                        <span>No capital logistics assets are currently stationed at {currentMarketName}.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3.5">
                        {marketAssets.map(item => (
                          <div key={item.itemId} className="p-2.5 bg-[#030811] border border-slate-800/70 hover:border-slate-700 rounded-lg flex items-center justify-between font-mono text-[11px] transition-colors">
                            <div className="min-w-0 pr-2">
                              <span className="text-white font-bold block truncate" title={item.asset?.name}>
                                {item.asset?.name}
                              </span>
                              <span className="text-slate-450 text-[9px] uppercase tracking-wider block">
                                {item.asset?.sku} • ₦{item.asset?.unitCost.toLocaleString()}
                              </span>
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-2 py-0.5 font-bold text-[10px] shrink-0">
                              {item.quantity} units
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}


              {filteredStaff.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-[#0064B4] text-xs font-mono">No physical nominal logs located matching filters.</p>
                  <p className="text-[10px] text-slate-500 mt-1">Try resetting the search input or select active markets above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStaff.map((person) => {
                    const status = getLocalStaffStatus(person);
                    return (
                      <div 
                        key={person.id}
                        className="bg-amml-surface border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all duration-150 relative overflow-hidden group shadow-xs animate-stage-wake"
                      >
                        {/* Background subtle ID Card pattern */}
                        <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-indigo-500/5 to-transparent pointer-events-none rounded-bl-3xl" />
                        
                        <div 
                          className="cursor-pointer hover:bg-indigo-500/5 p-1.5 -m-1.5 rounded-lg transition-all"
                          onClick={() => setSelectedStaffForCard(person)}
                          title="Inspect full nominal profile card"
                        >
                          {/* Header section of ID Card */}
                          <div className="flex justify-between items-start gap-2 mb-3">
                            <div className="flex items-center gap-2.5">
                              {/* Avatar Initials icon */}
                              <div className="h-9 w-9 rounded-full bg-[#0064B4]/15 border border-[#0064B4]/30 flex items-center justify-center font-bold text-[#0064B4] uppercase tracking-wider text-xs">
                                {person.first[0]}{person.last[0]}
                              </div>
                              <div>
                                <h4 className="font-serif font-black text-xs text-slate-100 tracking-tight leading-snug uppercase">
                                  {person.last.toUpperCase()}, {person.first}
                                </h4>
                                <span className="text-[9px] font-mono text-slate-400 font-medium tracking-normal block">
                                  ID: {person.id} | GL: {person.gradeLevel || 'N/A'}
                                </span>
                              </div>
                            </div>

                            <span className={`inline-block py-0.5 px-2 rounded-md font-mono text-[9px] uppercase tracking-wide font-black border ${status.class}`}>
                              {status.label}
                            </span>
                          </div>

                          {/* ID info rows */}
                          <div className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800/40 pt-2.5 mb-4">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Designation / Role</span>
                              <span className="font-semibold text-slate-200 capitalize">{person.role || 'Officer'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Contact Line</span>
                              <span className="font-mono text-slate-200 font-medium">{person.phone || '+234 Omitted'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Service Department</span>
                              <span className="font-semibold text-indigo-400">{person.dept}</span>
                            </div>
                          </div>
                        </div>

                        {/* Redeployment dispatch select form */}
                        <div className="bg-slate-900/60 p-2 border border-slate-800 rounded-lg space-y-1.5">
                          <label className="block text-[8px] font-mono text-slate-400 uppercase font-black tracking-widest">
                            ⚡ Relocate Dispatch Node
                          </label>
                          <select
                            value=""
                            onChange={e => handleRedeployStaff(person.id, currentMarketName, e.target.value)}
                            className="w-full bg-[#0d1522] border border-slate-800 hover:border-indigo-500 rounded p-1.5 text-[10px] text-slate-205 font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="">-- select target market --</option>
                            {markets
                              .filter(m => m.name !== currentMarketName && m.active)
                              .map(m => (
                                <option key={m.id} value={m.name}>
                                  Deploy: {m.name} ({staff.filter(s => s.market === m.name).length} stationed)
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Modal Dialog */}
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
              {isEdit ? '🏪 Update Market Complex' : '🏪 Register Market Complex'}
            </h3>
            <p className="text-xs text-amml-text3 mb-4">Set location and manager capacities for Abuja registry.</p>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Market Complex Name *</label>
                <input 
                  type="text" 
                  required
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  placeholder="e.g. Wuse International Market"
                  className="w-full bg-amml-surface border border-amml-line text-amml-text focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Location *</label>
                  <input 
                    type="text" 
                    required
                    value={mLoc}
                    onChange={(e) => setMLoc(e.target.value)}
                    placeholder="Area, Abuja"
                    className="w-full bg-amml-surface border border-amml-line text-amml-text focus:border-amml-blue px-3 py-2 rounded-lg text-sm focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Manager In Charge *</label>
                  <input 
                    type="text" 
                    required
                    value={mMgr}
                    onChange={(e) => setMMgr(e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-amml-surface border border-amml-line text-amml-text focus:border-amml-blue px-3 py-2 rounded-lg text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Stall/Staff Capacity</label>
                  <input 
                    type="number" 
                    min={1}
                    value={mCap}
                    onChange={(e) => setMCap(parseInt(e.target.value) || 100)}
                    className="w-full bg-amml-surface border border-amml-line text-amml-text focus:border-amml-blue px-3 py-2 rounded-lg text-sm focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Operating Days</label>
                  <select 
                    value={mDays}
                    onChange={(e) => setMDays(e.target.value)}
                    className="w-full bg-amml-surface border border-amml-line text-amml-text px-2.5 py-2 rounded-lg text-sm focus:outline-none transition-all cursor-pointer"
                  >
                    <option className="bg-amml-panel text-amml-text" value="Mon–Fri">Mon–Fri Only</option>
                    <option className="bg-amml-panel text-amml-text" value="Mon–Sat">Monday–Saturday</option>
                    <option className="bg-amml-panel text-amml-text" value="Daily">Daily Operation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Operational Description</label>
                <textarea 
                  value={mDesc}
                  onChange={(e) => setMDesc(e.target.value)}
                  placeholder="Details about active zones, levies, structural condition..."
                  rows={3}
                  className="w-full bg-amml-surface border border-amml-line text-amml-text focus:border-amml-blue px-3 py-2 rounded-lg text-sm focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-amml-line">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-amml-surface border border-amml-line hover:bg-amml-surface2 text-amml-text font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-amml-blue hover:bg-amml-blue-dk text-white text-xs font-bold px-5 py-2.5 rounded-lg cursor-pointer shadow-sm transition-colors"
                >
                  {isEdit ? 'Update Details' : 'Register Complex'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-over Modal Backdrop for EmployeeProfileCard inspect deck */}
      {selectedStaffForCard && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-stage-wake">
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl">
            <EmployeeProfileCard 
              staffMember={selectedStaffForCard} 
              onClose={() => setSelectedStaffForCard(null)} 
            />
          </div>
        </div>
      )}

    </div>
  );
};
