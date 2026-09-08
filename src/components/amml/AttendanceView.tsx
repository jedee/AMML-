import React, { useState } from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { AmmlAttendance } from '../../lib/amml/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Search, MapPin, Calendar as CalendarIcon, Upload, Plus, FileText, CheckCircle, Clock, Trash, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AttendanceStatusPill } from './AttendanceStatusPill';

export const AttendanceView: React.FC = () => {
  const { 
    markets, 
    staff, 
    att, 
    setAtt, 
    clockInOut, 
    bulkClockIn, 
    auditLog, 
    session 
  } = useAmmlStore();

  const [search, setSearch] = useState('');
  const [selectedMkt, setSelectedMkt] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [activeFeedTab, setActiveFeedTab] = useState<'all' | 'in' | 'out'>('all');

  // Excel Modal
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelParsed, setExcelParsed] = useState<any[]>([]);
  const [excelFileName, setExcelFileName] = useState('');

  // Manual Entry Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manStaffId, setManStaffId] = useState('');
  const [manMkt, setManMkt] = useState('');
  const [manDate, setManDate] = useState(new Date().toISOString().slice(0, 10));
  const [manIn, setManIn] = useState('08:00');
  const [manOut, setManOut] = useState('17:00');
  const [manNotes, setManNotes] = useState('');

  // QR Emulation Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrInput, setQrIn] = useState('');
  const [qrMkt, setQrMkt] = useState('');
  const [qrAction, setQrAct] = useState<'In' | 'Out'>('In');

  // Bulk Clock In Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkMkt, setBulkMkt] = useState('');
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todAtt = att.filter(a => a.date === todayStr);

  const totalStaffCount = staff.filter(s => s.active).length;
  const presentCount = new Set(todAtt.map(a => a.staffId)).size;
  const lateCount = todAtt.filter(a => a.late).length;
  const outCount = todAtt.filter(a => a.clockOut).length;

  const kpis = [
    { label: 'Present Today', val: presentCount, sub: `of ${totalStaffCount} active staff`, color: '#0064B4' },
    { label: 'Absent Today', val: Math.max(0, totalStaffCount - presentCount), sub: 'Not clocked-in', color: '#DC6400' },
    { label: 'Late Attendees', val: lateCount, sub: 'Flagged behind roster time', color: '#E8821A' },
    { label: 'Closed Out', val: outCount, sub: 'Completed and clocked-out', color: '#288C28' }
  ];

  // Filtering records logic
  const filteredRecords = att.filter(r => {
    const sMatch = !search || `${r.staffName} ${r.staffId} ${r.dept}`.toLowerCase().includes(search.toLowerCase());
    const mMatch = !selectedMkt || r.market === selectedMkt;
    const dMatch = !selectedDate || r.date === selectedDate;
    return sMatch && mMatch && dMatch;
  });

  // Today by Market chart data
  const chartData = markets.map(m => {
    const present = new Set(todAtt.filter(a => a.market === m.name).map(a => a.staffId)).size;
    const capacity = staff.filter(s => s.market === m.name).length;
    return {
      name: m.name.replace(" Market", "").replace(" Shopping Complex", ""),
      Present: present,
      Capacity: capacity,
    };
  });

  // Hourly / Feed Tab Filter
  const feedRecords = todAtt.filter(a => {
    if (activeFeedTab === 'in') return !a.clockOut;
    if (activeFeedTab === 'out') return !!a.clockOut;
    return true;
  });

  // Excel handlers
  const handleExcelDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        if (!rows.length) {
          alert('Excel has no record structures.');
          return;
        }
        setExcelParsed(rows);
      } catch (err) {
        alert('Invalid spreadsheet schema parser fail.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmRawExcelImport = () => {
    if (!excelParsed.length) return;
    
    const recordsToPush: AmmlAttendance[] = excelParsed.map((row, idx) => {
      const sId = row.Staff_ID || row.staff_id || `AMML-${String(idx + 1).padStart(3, '0')}`;
      const name = row.Name || row.name || row.Staff || 'Staff Member';
      const mkt = row.Market || row.market || markets[0]?.name || 'Gudu Market';
      const ci = row.Clock_In || row.clock_in || '08:00';
      const co = row.Clock_Out || row.clock_out || '17:00';
      const date = row.Date || row.date || todayStr;

      return {
        id: `att-import-${sId}-${Date.now()}-${idx}`,
        staffId: sId,
        staffName: name,
        market: mkt,
        dept: row.Department || row.dept || 'Operations',
        date,
        clockIn: ci,
        clockOut: co,
        device: 'Excel Direct Import',
        late: ci > '08:15',
        duration: co ? co : null,
      };
    });

    setAtt(prev => [...recordsToPush, ...prev]);
    auditLog('IMPORT', 'Bulk Ingest List Sync', `${recordsToPush.length} logs integrated from ${excelFileName}`);
    setExcelModalOpen(false);
    setExcelParsed([]);
    setExcelFileName('');
  };

  // Submit manual record
  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manStaffId || !manMkt) {
      alert('Populate staff ID and associated market.');
      return;
    }
    const targetStaff = staff.find(s => s.id === manStaffId);
    if (!targetStaff) return;

    clockInOut(manStaffId, manMkt, 'Manual Portal Log', 'In', manIn, manDate);
    if (manOut) {
      // Find recently created element and patch clock out
      // To simulate, we just pass direct parameters to standard store operation
      setAtt(prev => {
        const list = [...prev];
        if (list[0]) {
          list[0].clockOut = manOut;
          list[0].duration = (manIn && manOut) ? manOut : null;
        }
        return list;
      });
    }

    setManualModalOpen(false);
    setManNotes('');
  };

  // Submit emulated QR
  const handleQRProcess = (e: React.FormEvent) => {
    e.preventDefault();
    const targeted = staff.find(s => s.id.toUpperCase().trim() === qrInput.toUpperCase().trim());
    if (!targeted) {
      alert('Unregistered Staff ID token node.');
      return;
    }
    const selectedMarket = qrMkt || targeted.market;
    const ok = clockInOut(targeted.id, selectedMarket, 'QR scanner terminal', qrAction);
    if (ok) {
      setQrModalOpen(false);
      setQrIn('');
    } else {
      alert('Duplicate sequence detected for today or no active check-in logs recorded to check-out.');
    }
  };

  // Bulk process operations
  const handleBulkCheckIn = () => {
    if (!bulkMkt) {
      alert('Choose target check-in market location.');
      return;
    }
    if (!selectedBulkIds.length) {
      alert('Mark at least one employee check-in node.');
      return;
    }
    const processed = bulkClockIn(selectedBulkIds, bulkMkt);
    setBulkModalOpen(false);
    setSelectedBulkIds([]);
    alert(`${processed} staff modules clocked in successfully.`);
  };

  const handleBulkToggle = (id: string) => {
    setSelectedBulkIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  const currentLoggedInSupervisorMarket = session?.level === 'SUPERVISOR' ? session?.market : '';

  return (
    <div className="space-y-6 animate-stage-wake">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amml-text tracking-tight">Ingest Registers</h2>
          <p className="text-amml-text3 text-sm mt-1">Real-time attendance clock feeds, devices and registers</p>
        </div>

        {session?.level !== 'OFFICER' && (
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => setExcelModalOpen(true)}
              className="flex items-center gap-1.5 bg-amml-surface border border-amml-line text-amml-text hover:text-amml-blue hover:bg-amml-surface2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Upload className="h-4 w-4" /> Excel Upload
            </button>
            <button 
              onClick={() => setManualModalOpen(true)}
              className="flex items-center gap-1.5 bg-amml-surface border border-amml-line text-amml-text hover:text-amml-blue hover:bg-amml-surface2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" /> Manual Log
            </button>
            <button 
              onClick={() => {
                setQrIn('');
                setQrModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-amml-surface border border-amml-line text-amml-text hover:text-amml-blue hover:bg-amml-surface2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
            >
              <FileText className="h-4 w-4" /> Emulate QR Scan
            </button>
            <button 
              onClick={() => {
                setBulkMkt(currentLoggedInSupervisorMarket || markets[0]?.name || '');
                setSelectedBulkIds([]);
                setBulkModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-amml-blue hover:bg-amml-blue-dk text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm animate-stage-wake"
            >
              <CheckCircle className="h-4 w-4" /> Bulk Check-In
            </button>
          </div>
        )}
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, idx) => (
          <div key={idx} className="bg-amml-panel border border-amml-line rounded-xl p-4 shadow-sm relative">
            <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: k.color }} />
            <div className="text-amml-text3 text-[10px] font-bold uppercase tracking-wider">{k.label}</div>
            <div className="text-2xl sm:text-3xl font-serif font-extrabold text-amml-text mt-1">{k.val}</div>
            <div className="text-[10px] text-amml-text3 leading-none mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Live Log Feeds and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Feed Container */}
        <div className="bg-amml-panel border border-amml-line rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-amml-line bg-amml-surface2 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-serif text-sm font-bold text-amml-text flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-amml-green rounded-full animate-pulse" /> Live feeds
            </h3>
            <div className="flex border border-amml-line rounded-lg overflow-hidden bg-amml-surface p-0.5 text-xs">
              <button 
                onClick={() => setActiveFeedTab('all')}
                className={`px-3 py-1 font-semibold rounded cursor-pointer transition-all ${activeFeedTab === 'all' ? 'bg-amml-blue text-white' : 'text-amml-text3 hover:text-amml-text'}`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveFeedTab('in')}
                className={`px-3 py-1 font-semibold rounded cursor-pointer transition-all ${activeFeedTab === 'in' ? 'bg-amml-blue text-white' : 'text-amml-text3 hover:text-amml-text'}`}
              >
                In Only
              </button>
              <button 
                onClick={() => setActiveFeedTab('out')}
                className={`px-3 py-1 font-semibold rounded cursor-pointer transition-all ${activeFeedTab === 'out' ? 'bg-amml-blue text-white' : 'text-amml-text3 hover:text-amml-text'}`}
              >
                Out Only
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3.5 max-h-[340px] overflow-y-auto divide-y divide-amml-line">
            {feedRecords.length === 0 ? (
              <div className="text-center py-20 text-amml-text3 text-sm">
                🥱 No active feeds found under current filter.
              </div>
            ) : (
              feedRecords.map(r => (
                <div key={r.id} className="pt-3.5 first:pt-0 flex items-center justify-between gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-amml-surface2 border border-amml-line flex items-center justify-center font-bold text-amml-blue shrink-0">
                    {r.staffName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-amml-text font-bold truncate">{r.staffName}</div>
                    <div className="text-amml-text3 text-[11px] truncate">📍 {r.market} • Terminal Ingest: {r.device}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-amml-text">{r.clockOut || r.clockIn}</div>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${r.clockOut ? 'bg-amml-surface3 text-amml-text25' : 'bg-amml-green/10 text-amml-green border border-amml-green/20'}`}>
                      {r.clockOut ? 'Out Checked' : 'In Logged'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-amml-panel border border-amml-line rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-serif text-sm sm:text-base font-bold text-amml-text mb-4">🏆 Attendance vs Capacity by Market Complex</h3>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10} debounce={50}>
              <BarChart data={chartData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--amml-line)" />
                <XAxis dataKey="name" stroke="var(--amml-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--amml-muted)" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "var(--amml-panel)",
                    borderColor: "var(--amml-line)",
                    borderRadius: "8px",
                    color: "var(--amml-text)",
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Present" fill="#0064B4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Capacity" fill="var(--amml-surface3)" stroke="var(--amml-line)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Structured Attendance Table logs log list */}
      <div className="bg-amml-panel border border-amml-line rounded-xl shadow-sm overflow-hidden animate-stage-wake">
        <div className="p-4 sm:p-5 border-b border-amml-line flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
          <h3 className="font-serif text-base font-bold text-amml-text">📋 Logs Directory</h3>
          
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-amml-text3" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff, role or depts..."
                className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue focus:ring-1 focus:ring-amml-blue px-9 py-2 rounded-lg text-xs sm:text-sm text-amml-text outline-none transition-all"
              />
            </div>
            
            {/* Market Selection */}
            {session?.level !== 'SUPERVISOR' && (
              <select 
                value={selectedMkt}
                onChange={(e) => setSelectedMkt(e.target.value)}
                className="bg-amml-surface border border-amml-line focus:border-amml-blue px-3 py-2 rounded-lg text-xs sm:text-sm text-amml-text outline-none transition-all cursor-pointer"
              >
                <option value="">All Markets</option>
                {markets.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            )}

            {/* Date Selection */}
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-amml-surface border border-amml-line focus:border-amml-blue px-3 py-2 rounded-lg text-xs sm:text-sm text-amml-text outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-amml-surface2 border-b border-amml-line text-amml-text3 font-bold text-xs uppercase tracking-wider">
                <th className="p-4">Employee info</th>
                <th className="p-4">Market complex</th>
                <th className="p-4">Operational date</th>
                <th className="p-4">Clock in</th>
                <th className="p-4">Clock out</th>
                <th className="p-4">Total hours</th>
                <th className="p-4">Terminal source</th>
                <th className="p-4">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amml-line">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-amml-text3">
                    😴 No matching log entries registered.
                  </td>
                </tr>
              ) : (
                filteredRecords.slice(0, 100).map(r => (
                  <tr key={r.id} className="hover:bg-amml-surface3/40 transition-colors">
                    <td className="p-4 font-bold text-amml-text">
                      <div>{r.staffName}</div>
                      <div className="text-[10px] text-amml-text3 font-mono mt-0.5">{r.staffId} • {r.dept}</div>
                    </td>
                    <td className="p-4 text-amml-text2 text-xs font-semibold">{r.market}</td>
                    <td className="p-4 text-amml-text2 text-xs font-mono">{r.date}</td>
                    <td className="p-4 text-xs font-mono font-bold text-[#288C28] dark:text-[#56C256]">{r.clockIn || '—'}</td>
                    <td className="p-4 text-xs font-mono font-bold text-amml-blue">{r.clockOut || '—'}</td>
                    <td className="p-4 text-xs font-mono font-semibold text-amml-text">{r.duration || '—'}</td>
                    <td className="p-4 text-amml-text3 text-xs truncate max-w-[150px]">{r.device || 'Unspecified'}</td>
                    <td className="p-4">
                      <AttendanceStatusPill 
                        status={r.late ? 'Late' : r.clockOut ? 'Clocked Out' : 'Present'} 
                        size="sm"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-amml-surface2 p-4 text-center border-t border-amml-line text-xs text-amml-text3 font-semibold">
          Showing {Math.min(filteredRecords.length, 100)} of {filteredRecords.length} records • Abuja Markets Management Limited (AMML)
        </div>
      </div>

      {/* Modal Definitions */}
      {/* 1. Upload Excel CSV */}
      {excelModalOpen && (
        <div className="fixed inset-0 z-50 bg-amml-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-amml-panel border border-amml-line rounded-2xl w-full max-w-lg p-7 shadow-2xl relative animate-stage-wake">
            <button 
              onClick={() => {
                setExcelModalOpen(false);
                setExcelParsed([]);
                setExcelFileName('');
              }}
              className="absolute right-4 top-4 text-amml-text3 hover:text-amml-text cursor-pointer p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-amml-text mb-1">📂 Bulk Upload Attendance spreadsheet</h3>
            <p className="text-xs text-amml-text3 mb-4">
              Supported columns: <strong>Name, Staff_ID, Market, Date, Clock_In, Clock_Out, Department</strong>
            </p>
            
            <div className="border-2 border-dashed border-amml-line hover:border-amml-blue rounded-xl p-8 text-center bg-amml-surface2 hover:bg-amml-surface3 transition-all relative">
              <input 
                type="file" 
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelDrop}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-10 w-10 text-amml-blue mx-auto mb-3" />
              <p className="text-sm font-bold text-amml-text">
                {excelFileName ? excelFileName : 'Click or Drag spreadsheet file to upload'}
              </p>
              <span className="text-xs text-amml-text3 mt-1 block">Supports .xlsx, .xls, .csv files</span>
            </div>

            {excelParsed.length > 0 && (
              <div className="mt-4 p-3 bg-amml-green/10 border border-amml-green/20 rounded-lg text-xs text-amml-green flex items-center justify-between">
                <span>✅ Parsed <strong>{excelParsed.length}</strong> matching transaction lines.</span>
                <span className="font-mono text-[9px] uppercase tracking-wider">Preview Available</span>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t border-amml-line mt-6">
              <button 
                onClick={() => {
                  setExcelModalOpen(false);
                  setExcelParsed([]);
                  setExcelFileName('');
                }}
                className="bg-amml-surface border border-amml-line hover:bg-amml-surface2 text-amml-text2 text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={!excelParsed.length}
                onClick={confirmRawExcelImport}
                className="bg-amml-blue hover:bg-amml-blue-dk disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-lg cursor-pointer transition-all"
              >
                Ingest Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Manual Entry form popups */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 bg-amml-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-amml-panel border border-amml-line rounded-2xl w-full max-w-lg p-7 shadow-2xl relative animate-stage-wake">
            <button 
              onClick={() => setManualModalOpen(false)}
              className="absolute right-4 top-4 text-amml-text3 hover:text-amml-text cursor-pointer p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-amml-text mb-1">✏️ Manual Attendance Overrides</h3>
            <p className="text-xs text-amml-text3 mb-4">Record individual logs manually for exceptions.</p>

            <form onSubmit={handleManualSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Staff Member *</label>
                <select 
                  required
                  value={manStaffId}
                  onChange={(e) => setManStaffId(e.target.value)}
                  className="w-full bg-amml-surface border border-amml-line px-2.5 py-2 rounded-lg text-sm outline-none cursor-pointer text-amml-text"
                >
                  <option className="bg-amml-panel text-amml-text" value="">Select Staff...</option>
                  {staff.map(s => (
                    <option className="bg-amml-panel text-amml-text" key={s.id} value={s.id}>{s.first} {s.last} ({s.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Date *</label>
                  <input 
                    type="date"
                    required
                    value={manDate}
                    onChange={(e) => setManDate(e.target.value)}
                    className="w-full bg-amml-surface border border-amml-line px-3 py-2 rounded-lg text-sm text-amml-text focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Market Complex *</label>
                  <select 
                    required
                    value={manMkt}
                    onChange={(e) => setManMkt(e.target.value)}
                    className="w-full bg-amml-surface border border-amml-line px-2.5 py-2 rounded-lg text-sm outline-none cursor-pointer text-amml-text"
                  >
                    <option className="bg-amml-panel text-amml-text" value="">Select Market...</option>
                    {markets.map(m => (
                      <option className="bg-amml-panel text-amml-text" key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Clock In *</label>
                  <input 
                    type="time"
                    required
                    value={manIn}
                    onChange={(e) => setManIn(e.target.value)}
                    className="w-full bg-amml-surface border border-amml-line px-3 py-2 rounded-lg text-sm text-amml-text focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Clock Out</label>
                  <input 
                    type="time"
                    value={manOut}
                    onChange={(e) => setManOut(e.target.value)}
                    className="w-full bg-amml-surface border border-amml-line px-3 py-2 rounded-lg text-sm text-amml-text focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Notes / Reason Code</label>
                <input 
                  type="text"
                  value={manNotes}
                  onChange={(e) => setManNotes(e.target.value)}
                  placeholder="e.g. Card malfunctioning retry override..."
                  className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue focus:ring-1 focus:ring-amml-blue px-3 py-2 rounded-lg text-sm text-amml-text outline-none transition-all"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-amml-line mt-6">
                <button 
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="bg-amml-surface border border-amml-line hover:bg-amml-surface2 text-amml-text2 text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-amml-blue hover:bg-amml-blue-dk text-white text-xs font-bold px-5 py-2.5 rounded-lg cursor-pointer shadow-sm transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. QR Code scanner emulator popups */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-amml-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-amml-panel border border-amml-line rounded-2xl w-full max-w-sm p-7 shadow-2xl relative animate-stage-wake">
            <button 
              onClick={() => setQrModalOpen(false)}
              className="absolute right-4 top-4 text-amml-text3 hover:text-amml-text cursor-pointer p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-amml-text mb-1">📸 Ingest QR Emulation Scanner</h3>
            <p className="text-xs text-amml-text3 mb-4">Simulate card scanner scans inside virtual terminals.</p>

            <form onSubmit={handleQRProcess} className="space-y-4">
              <div className="bg-amml-surface2 p-6 text-center border border-amml-line rounded-xl">
                <span className="text-4xl animate-pulse inline-block">📸</span>
                <input 
                  type="text" 
                  required
                  value={qrInput}
                  onChange={(e) => setQrIn(e.target.value)}
                  placeholder="Insert staff token (e.g. AMML-002)"
                  className="w-full bg-amml-surface border border-amml-line text-center font-bold font-mono tracking-widest text-amml-text focus:border-amml-blue px-3 py-2 rounded-lg text-sm outline-none transition-all mt-4 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Target Complex</label>
                  <select 
                    value={qrMkt}
                    onChange={(e) => setQrMkt(e.target.value)}
                    className="w-full bg-amml-surface border border-amml-line px-2.5 py-2 rounded-lg text-xs outline-none cursor-pointer font-sans text-amml-text"
                  >
                    <option className="bg-amml-panel text-amml-text" value="">Auto-Detect</option>
                    {markets.map(m => (
                      <option className="bg-amml-panel text-amml-text" key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-amml-text2 mb-1">Action Type</label>
                  <select 
                    value={qrAction}
                    onChange={(e) => setQrAct(e.target.value as any)}
                    className="w-full bg-amml-surface border border-amml-line px-2.5 py-2 rounded-lg text-xs outline-none cursor-pointer font-sans text-amml-text"
                  >
                    <option className="bg-amml-panel text-amml-text" value="In">Clock In</option>
                    <option className="bg-amml-panel text-amml-text" value="Out">Clock Out</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-amml-line mt-4">
                <button 
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="bg-amml-surface border border-amml-line hover:bg-amml-surface2 text-amml-text2 text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-amml-blue hover:bg-amml-blue-dk text-white text-xs font-bold px-5 py-2.5 rounded-lg cursor-pointer shadow-sm transition-all"
                >
                  Authenticate Scan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Bulk Check In Modals */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-amml-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-amml-panel border border-amml-line rounded-xl w-full max-w-lg p-6 shadow-2xl relative animate-stage-wake flex flex-col justify-between">
            <button 
              onClick={() => setBulkModalOpen(false)}
              className="absolute right-4 top-4 text-amml-text3 hover:text-amml-text cursor-pointer p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-amml-text mb-1">☑️ Bulk Mark Attendance checks</h3>
            <p className="text-xs text-amml-text3 mb-4">Directly select staff to clock in present together for today.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Location Complex Ingest Zone</label>
                <select 
                  value={bulkMkt}
                  onChange={(e) => setBulkMkt(e.target.value)}
                  className="w-full bg-amml-surface border border-amml-line px-2.5 py-2.5 rounded-lg text-sm outline-none cursor-pointer font-sans text-amml-text"
                >
                  {markets.map(m => (
                    <option className="bg-amml-panel text-amml-text" key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Staff checkbox lists with filters */}
              <div className="border border-amml-line rounded-xl max-h-[220px] overflow-y-auto divide-y divide-amml-line bg-amml-surface2 p-1">
                {staff
                  .filter(s => s.active && s.market === bulkMkt)
                  .map(s => {
                    const alreadyPresent = todAtt.some(a => a.staffId === s.id);
                    return (
                      <label 
                        key={s.id} 
                        className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors select-none ${alreadyPresent ? 'opacity-50 cursor-not-allowed bg-green-550/10' : 'hover:bg-amml-surface3/40 cursor-pointer'}`}
                      >
                        <input 
                          type="checkbox"
                          disabled={alreadyPresent}
                          checked={alreadyPresent || selectedBulkIds.includes(s.id)}
                          onChange={() => handleBulkToggle(s.id)}
                          className="h-4 w-4 text-amml-blue rounded border-amml-line focus:ring-amml-blue/20 shrink-0"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-bold text-amml-text">{s.first} {s.last}</div>
                          <div className="text-[10px] text-amml-text3 font-mono">{s.id} • {s.role}</div>
                        </div>
                        {alreadyPresent && <span className="text-[9px] font-bold text-amml-green bg-amml-green/10 border border-amml-green/20 px-2 py-0.5 rounded-full shrink-0">Already Present</span>}
                      </label>
                    );
                  })}
              </div>

              <div className="text-xs text-amml-text3 font-bold">
                {selectedBulkIds.length} staff members marked for clocks.
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-amml-line mt-6">
              <button 
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="bg-amml-surface border border-amml-line hover:bg-amml-surface2 text-amml-text2 text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleBulkCheckIn}
                className="bg-amml-blue hover:bg-amml-blue-dk text-white text-xs font-bold px-5 py-2.5 rounded-lg cursor-pointer shadow-sm transition-all"
              >
                Mark Present
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
