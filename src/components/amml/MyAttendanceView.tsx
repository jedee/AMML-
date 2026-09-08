import React, { useState, useEffect, useRef } from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { calculateNetBusinessDays } from '../../lib/amml/calendarUtils';
import { 
  Clock, 
  Calendar, 
  Printer, 
  User, 
  Award, 
  Fingerprint, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Sparkles, 
  Volume2, 
  VolumeX,
  FileText,
  BadgeAlert,
  Sliders,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { May2026AuditSection } from './May2026AuditSection';
import { AttendanceStatusPill } from './AttendanceStatusPill';

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

export const MyAttendanceView: React.FC = () => {
  const { session, att, clockInOut, markets } = useAmmlStore();
  const [clockMkt, setClockMkt] = useState(session?.market === 'all' ? 'Gudu Market' : (session?.market || 'Gudu Market'));
  
  // Tab control state
  const [activeMainTab, setActiveMainTab] = useState<'terminal' | 'may2026'>('may2026');
  const [maySearch, setMaySearch] = useState('');
  const [mayInnerTab, setMayInnerTab] = useState<'analytical' | 'grid' | 'excel'>('analytical');
  
  // Local storage check for personal leaves
  const [personalMemos, setPersonalMemos] = useState<any[]>([]);
  useEffect(() => {
    const handleCheckMemos = () => {
      const saved = localStorage.getItem('amml_leave_memos');
      if (saved) {
        try {
          setPersonalMemos(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    handleCheckMemos();
    window.addEventListener('storage', handleCheckMemos);
    const poller = setInterval(handleCheckMemos, 1000);
    return () => {
      window.removeEventListener('storage', handleCheckMemos);
      clearInterval(poller);
    };
  }, []);

  // Interactive Simulator States
  const [authMethod, setAuthMethod] = useState<'biometric' | 'rfid'>('biometric');
  const [isMuted, setIsMuted] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [scanMessage, setScanMessage] = useState('DEVICE READY. PRESENT BIOMETRIC OR BADGE.');
  
  // Compliance verification states matching admin memo
  const [compliantWearID, setCompliantWearID] = useState(true);
  const [compliantTShirt, setCompliantTShirt] = useState(true);

  // Badge Customizer States
  const [badgeTheme, setBadgeTheme] = useState<'corporate' | 'taskforce'>('corporate');
  const [tilt, setTilt] = useState({ x: 0, y: 0, hover: false });

  // Filter and statistics states
  const [searchTerm, setSearchTerm] = useState('');
  const [marketFilter, setMarketFilter] = useState('');
  
  const todayStr = new Date().toISOString().slice(0, 10);
  const myRosterId = session?.staffId || 'AMML-001';

  // Audio tone generator using native Web Audio API
  const playSynthTone = (freq: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth', duration: number) => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio Context playback bypassed in sandbox:', e);
    }
  };

  const playSuccessChime = () => {
    playSynthTone(523.25, 'sine', 0.12); // C5
    setTimeout(() => {
      playSynthTone(659.25, 'sine', 0.22); // E5
    }, 100);
  };

  const playFailureBuzz = () => {
    playSynthTone(170, 'sawtooth', 0.35);
  };

  const playTickSound = () => {
    playSynthTone(800, 'triangle', 0.03);
  };

  // Holographic card mouse rotation coordinate solver
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // range -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // range -0.5 to 0.5
    setTilt({ x: x * 15, y: y * -15, hover: true });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, hover: false });
  };

  // Find today's session attendance record
  const todayRecord = att.find(a => a.date === todayStr && a.staffId === myRosterId);

  // My history array filtered
  const myHistory = att.filter(a => a.staffId === myRosterId);

  // Generate simulated biometric trigger
  const runHardwarePunch = (action: 'In' | 'Out') => {
    if (scanState === 'scanning') return;
    
    setScanState('scanning');
    setScanMessage('INGESTING CHARACTERISTICS... HOLD STEADY');
    
    // Play recurring click indicators
    let clickCount = 0;
    const interval = setInterval(() => {
      if (clickCount < 4) {
        playTickSound();
        clickCount++;
      } else {
        clearInterval(interval);
      }
    }, 380);

    setTimeout(() => {
      clearInterval(interval);
      
      // Determine device description incorporating the compliance checklist states
      let finalClientDevice = `Portal-Self-Service [Biometric Terminal]`;
      if (authMethod === 'rfid') {
        finalClientDevice = `RFID Card Proximity Sweep Terminal`;
      }

      if (!compliantWearID) {
        finalClientDevice += ` (Infraction: ID CARDS OMITTED - ₦5000 Ded)`;
      }
      if (!compliantTShirt && (session?.level === 'SUPERVISOR' || session?.level === 'OFFICER')) {
        finalClientDevice += ` (Infraction: NO T-SHIRT UNIFORM)`;
      }

      if (action === 'In') {
        const success = clockInOut(myRosterId, clockMkt, finalClientDevice, 'In', undefined, todayStr);
        if (success) {
          setScanState('success');
          // Infraction warnings trigger warning tone instead of pristine secure tone
          if (!compliantWearID) {
            playFailureBuzz();
            setScanMessage('ACCESS ACCEPTED with COMPLIANCE PENALTY: ID card missing flag registered.');
          } else {
            playSuccessChime();
            setScanMessage('SUCCESS! CHECK-IN BIOMETRICS OK. ACCESS GRANTED.');
          }
        } else {
          setScanState('failed');
          playFailureBuzz();
          setScanMessage('AUTHENTICATION FAIL: Attendance already registered for today.');
        }
      } else {
        const success = clockInOut(myRosterId, clockMkt, finalClientDevice, 'Out', undefined, todayStr);
        if (success) {
          setScanState('success');
          playSuccessChime();
          setScanMessage('EXIT RECORDED! CLOCK OUT SUCCESSFUL. TRAVEL SAFE.');
        } else {
          setScanState('failed');
          playFailureBuzz();
          setScanMessage('TRANSACTION DENIED: No active clock-in recorded to close out.');
        }
      }

      // Restore scanning view after 5 seconds
      setTimeout(() => {
        setScanState('idle');
        setScanMessage('DEVICE READY. PRESENT BIOMETRIC OR DEPLOY RFID BADGE.');
      }, 5000);

    }, 2000);
  };

  // Print function
  const triggerPrintBadge = () => {
    window.print();
  };

  // Stats Counters
  const completedShifts = myHistory.filter(h => h.clockIn && h.clockOut).length;
  const lateCount = myHistory.filter(h => h.late).length;
  const onTimePercentage = myHistory.length ? Math.round(((myHistory.length - lateCount) / myHistory.length) * 100) : 100;

  // Personal approved leaves and balance stats
  const approvedPersonalLeaves = personalMemos.filter(m => {
    const sName = session?.name || '';
    const isNameMatch = areNamesMatching(sName, m.to || '', m.market || '', session?.market || '');
    
    return (m.status === 'approved' || m.synced) && (m.staffId === myRosterId || m.staffId === session?.staffId || isNameMatch);
  });

  let leaveDaysTaken = 0;
  approvedPersonalLeaves.forEach(m => {
    if (m.startDate && m.endDate) {
      leaveDaysTaken += calculateNetBusinessDays(m.startDate, m.endDate);
    } else {
      const matches = m.approvedDays?.match(/\d+/);
      leaveDaysTaken += matches ? parseInt(matches[0], 10) : 10;
    }
  });
  const totalEntitlement = 30;
  const leaveDaysRemaining = Math.max(0, totalEntitlement - leaveDaysTaken);

  // Filter logs logic
  const filteredHistory = myHistory.filter(h => {
    const matchesSearch = h.date.includes(searchTerm) || 
                          h.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (h.device && h.device.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMarket = marketFilter === '' || h.market === marketFilter;
    return matchesSearch && matchesMarket;
  });

  return (
    <div className="space-y-6 animate-stage-wake select-none">
      
      {/* View Header with control flags */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amml-line pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amml-text tracking-tight flex items-center gap-2.5">
            🪪 Live Staff self-terminal
          </h2>
          <p className="text-amml-text3 text-xs sm:text-sm mt-1">
            Access secure check-ins, simulated physical sensor biometrics, and customized biometric printable badges.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 no-print">
          {/* Mute Synth Toggle */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-1.5 bg-amml-surface border border-amml-line hover:bg-amml-surface2 p-2 rounded-lg text-xs font-bold text-amml-text transition-colors cursor-pointer outline-none"
            title={isMuted ? 'Unmute scanner synthetic audio' : 'Mute scanner synthetic audio'}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 text-amml-orange" />
                <span className="sr-only sm:not-sr-only">Synth Audio Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-amml-green" />
                <span className="sr-only sm:not-sr-only">Synth Ambient Audio</span>
              </>
            )}
          </button>

          <button 
            onClick={triggerPrintBadge}
            className="flex items-center gap-2 bg-amml-blue hover:bg-amml-blue-dk text-white border border-amml-blue-dk px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer outline-none"
          >
            <Printer className="h-3.5 w-3.5" /> Print Credential Badge
          </button>
        </div>
      </div>

      {/* Main Terminal Tab Swappers */}
      <div className="flex border border-amml-line rounded-xl bg-amml-surface p-1 self-start select-none w-full max-w-lg font-sans no-print">
        <button 
          type="button" 
          onClick={() => setActiveMainTab('may2026')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg cursor-pointer transition-colors ${activeMainTab === 'may2026' ? 'bg-amml-blue text-white shadow-sm' : 'text-amml-text3 hover:text-amml-blue'}`}
        >
          🗓️ March 2026 Attendance Board
        </button>
        <button 
          type="button" 
          onClick={() => setActiveMainTab('terminal')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg cursor-pointer transition-colors ${activeMainTab === 'terminal' ? 'bg-amml-blue text-white shadow-sm' : 'text-amml-text3 hover:text-amml-blue'}`}
        >
          🎛️ Biometrics Scanner & Badging
        </button>
      </div>

      {activeMainTab === 'may2026' ? (
        <May2026AuditSection 
          search={maySearch}
          setSearch={setMaySearch}
          mayInnerTab={mayInnerTab}
          setMayInnerTab={setMayInnerTab}
        />
      ) : (
        <>
          {/* Grid Layout containing interaction triggers and live card design */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Module A: Hardware Simulator Core Panel (Punches/Checkpoints) */}
        <div className="lg:col-span-7 bg-amml-panel border border-amml-line rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          
          {/* Hardware Header Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center sm:gap-2">
              <h3 className="font-serif text-sm sm:text-base font-bold text-amml-text inline-flex items-center gap-2">
                <Sliders className="h-4 w-4 text-amml-blue animate-pulse" /> FCT Biometrics Simulator Rack
              </h3>
              
              <div className="flex rounded-md bg-amml-surface border border-amml-line p-0.5 text-[10px] font-bold">
                <button
                  onClick={() => { setAuthMethod('biometric'); playTickSound(); }}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${authMethod === 'biometric' ? 'bg-amml-blue text-white' : 'text-amml-text3 hover:text-amml-text'}`}
                >
                  Fingerprint Scan
                </button>
                <button
                  onClick={() => { setAuthMethod('rfid'); playTickSound(); }}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${authMethod === 'rfid' ? 'bg-amml-blue text-white' : 'text-amml-text3 hover:text-amml-text'}`}
                >
                  RFID Proximity Swipe
                </button>
              </div>
            </div>
            <p className="text-xs text-amml-text3">
              Simulate high-fidelity clock parameters. Interactive audio-visual physical logs reflect actual compliance flags globally inside database logs.
            </p>
          </div>

          {/* Interactive visual scanner housing */}
          <div className="bg-amml-surface2 rounded-xl p-5 border border-amml-line flex flex-col items-center justify-center relative overflow-hidden group select-none min-h-[170px]">
            {/* Horizontal scan visual baseline bar */}
            {scanState === 'scanning' && (
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_8px_#F59E0B] animate-bounce top-1/2 pointer-events-none z-10" />
            )}
            
            {authMethod === 'biometric' ? (
              <div className="flex flex-col items-center space-y-3 font-sans">
                <div 
                  onClick={() => {
                    if (scanState === 'scanning') return;
                    runHardwarePunch(todayRecord && !todayRecord.clockOut ? 'Out' : 'In');
                  }}
                  className={`relative p-5 rounded-full border transition-all duration-300 ${
                    scanState === 'scanning' 
                      ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_#F59E0B]/20 scale-95' 
                      : scanState === 'success' 
                      ? 'bg-amml-green/10 border-amml-green shadow-[0_0_15px_#288C28]/25'
                      : scanState === 'failed'
                      ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                      : 'bg-amml-surface hover:bg-amml-surface3 border-amml-line cursor-pointer hover:shadow-md'
                  }`}
                >
                  <Fingerprint className={`h-10 w-10 transition-all ${
                    scanState === 'scanning' 
                      ? 'text-amber-500 animate-pulse scale-105' 
                      : scanState === 'success' 
                      ? 'text-amml-green'
                      : scanState === 'failed'
                      ? 'text-red-500'
                      : 'text-amml-blue'
                  }`} />
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase Tracking-widest text-amml-blue block">ZK optical biometric window</span>
                  <p className="text-[11px] font-mono font-semibold max-w-md mx-auto text-amml-text leading-relaxed">
                    {scanState === 'idle' ? '👇 TAP FINGERPRINT TO COMMENCE ROTATION SCAN' : scanMessage}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                {/* RFID Reader Swiper */}
                <div 
                  onClick={() => {
                    if (scanState === 'scanning') return;
                    runHardwarePunch(todayRecord && !todayRecord.clockOut ? 'Out' : 'In');
                  }}
                  className="flex items-center gap-4 relative cursor-pointer hover:opacity-90"
                >
                  <div className={`p-4 rounded-lg border transition-all ${
                    scanState === 'scanning' 
                      ? 'bg-amber-500/10 border-amber-500 shadow-md' 
                      : scanState === 'success' 
                      ? 'bg-amml-green/10 border-amml-green'
                      : 'bg-amml-surface border-amml-line'
                  }`}>
                    <CreditCard className="h-8 w-8 text-amml-text3" />
                  </div>
                  
                  {/* Decorative terminal representation */}
                  <div className="w-1.5 h-12 rounded bg-amml-blue relative">
                    <div className={`w-3 h-3 rounded-full absolute -right-[4px] top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                      scanState === 'success' ? 'bg-amml-green shadow-[0_0_6px_#288C28]' : scanState === 'scanning' ? 'bg-amber-400 animate-ping' : 'bg-red-600'
                    }`} />
                  </div>
                  
                  {/* Sweep simulator miniature badge */}
                  <div className={`w-14 h-9 rounded bg-amml-navy border border-white/20 p-1 flex items-center justify-between text-[6px] text-white transition-all duration-700 pointer-events-none ${
                    scanState === 'scanning' ? 'translate-x-12 opacity-50 scale-105 rotate-6' : 'translate-x-0'
                  }`}>
                    <div className="w-2 h-2 rounded bg-amml-blue shrink-0" />
                    <div className="flex-1 ml-1 scale-75 leading-none">AMML ID</div>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amml-orange block">13.56MHz RFID Card reader sensor</span>
                  <p className="text-[11px] font-mono font-semibold max-w-md mx-auto text-amml-text leading-relaxed">
                    {scanState === 'idle' ? '🏢 CLICK THE ACTION BUTTON BELO TO ENGAGE SWIPE' : scanMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Target selection spot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-amml-surface p-4 rounded-xl border border-amml-line">
            <div>
              <span className="text-amml-text3 text-[10px] uppercase font-extrabold tracking-wider block">Ingest Gate Target Location</span>
              {session?.market === 'all' ? (
                <select 
                  value={clockMkt}
                  onChange={(e) => { setClockMkt(e.target.value); playTickSound(); }}
                  className="bg-amml-surface2 text-amml-text border border-amml-line text-xs w-full py-2.5 px-3 rounded-lg outline-none cursor-pointer mt-1 font-bold"
                >
                  {markets.map(m => (
                    <option className="bg-amml-panel text-amml-text" key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              ) : (
                <div className="text-sm font-extrabold text-amml-blue mt-1 flex items-center gap-1.5 px-1 py-1">
                  <span>📍</span> {clockMkt}
                </div>
              )}
            </div>

            <div className="text-xs text-amml-text3 text-left sm:text-right">
              Operational date today: <strong className="text-amml-text text-sm font-mono block sm:inline">{todayStr}</strong>
            </div>
          </div>

          {/* Core admin compliance checklist checkbox form directly responding to HR final warning memo rules */}
          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-red-500">
              <BadgeAlert className="h-4 w-4 shrink-0 animate-pulse" /> 
              <span>Efosa Okosun compliance Verification Checklist (Memo Vol. June 2026)</span>
            </div>
            
            <p className="text-[11px] text-amml-text3">
              The MD/CEO mandated hardware biometrics to detect compliance. Check all attributes to bypass automated flat-fee salary deductions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2.5 bg-amml-surface border border-amml-line rounded-lg p-2.5 cursor-pointer hover:bg-amml-surface2 transition-all">
                <input 
                  type="checkbox" 
                  checked={compliantWearID} 
                  onChange={(e) => { setCompliantWearID(e.target.checked); playTickSound(); }}
                  className="rounded border-amml-line text-amml-blue focus:ring-0 scale-110 cursor-pointer"
                />
                <div className="text-left">
                  <span className="text-xs font-bold text-amml-text block">Wearing Official AMML ID Card 🪪</span>
                  <span className="text-[9px] text-amml-text3 block">Checked/visible at all working hours.</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 bg-amml-surface border border-amml-line rounded-lg p-2.5 cursor-pointer hover:bg-amml-surface2 transition-all">
                <input 
                  type="checkbox" 
                  checked={compliantTShirt} 
                  onChange={(e) => { setCompliantTShirt(e.target.checked); playTickSound(); }}
                  className="rounded border-amml-line text-amml-blue focus:ring-0 scale-110 cursor-pointer"
                />
                <div className="text-left">
                  <span className="text-xs font-bold text-amml-text block">wearing Task Force T-Shirt 👕</span>
                  <span className="text-[9px] text-amml-text3 block">Mandatory for field service supervisors.</span>
                </div>
              </label>
            </div>

            {/* Dynamic visual warning on absent parameters */}
            {!compliantWearID && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-2.5 text-[10px] font-medium leading-relaxed animate-pulse">
                ⚠️ <strong>PENALTY WARNING ACTIVE:</strong> Operating without visible ID card card bypasses standard clearance. Punching now triggers an **automatic ₦5,000 monthly allowance deduction** directly linked with payroll software records.
              </div>
            )}
          </div>

          {/* Action triggers */}
          <div className="flex gap-3">
            <button 
              disabled={!!todayRecord || scanState === 'scanning'}
              onClick={() => runHardwarePunch('In')}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-amml-green hover:bg-amml-green-lt disabled:opacity-30 disabled:cursor-not-allowed text-white font-sans font-extrabold text-xs sm:text-sm tracking-wide uppercase rounded-xl transition-all cursor-pointer shadow-md text-center outline-none"
            >
              <CheckCircle2 className="h-4 w-4" />
              {todayRecord ? 'Biometric In Registered' : 'Transmit Clock In Present'}
            </button>
            <button
              disabled={!todayRecord || !!todayRecord.clockOut || scanState === 'scanning'}
              onClick={() => runHardwarePunch('Out')}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-amml-blue hover:bg-amml-blue-dk disabled:opacity-30 disabled:cursor-not-allowed text-white font-sans font-extrabold text-xs sm:text-sm tracking-wide uppercase rounded-xl transition-all cursor-pointer shadow-md text-center outline-none"
            >
              <Clock className="h-4 w-4" />
              {todayRecord?.clockOut ? 'Clocked Out Exit Done' : 'Transmit Clock Out Exit'}
            </button>
          </div>

        </div>

        {/* Module B: Holographic Printable Credential Badge (Tilt-Ready Card) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          {/* Badge Visual Customizer */}
          <div className="bg-amml-panel border border-amml-line rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-serif text-xs font-bold text-amml-text flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amml-orange animate-pulse" /> Interactive Badge visual skin
              </h4>
              <span className="text-[9px] font-mono font-bold text-amml-text3 bg-amml-surface2 px-2 py-0.5 rounded border border-amml-line">PREVIEWING CARD</span>
            </div>
            
            <p className="text-[11px] text-amml-text3">
              Switch layout overlays depending on operational assignments for biometric hardware integration:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold font-mono">
              <button
                onClick={() => { setBadgeTheme('corporate'); playTickSound(); }}
                className={`py-2 px-3 border rounded-lg cursor-pointer transition-all ${
                  badgeTheme === 'corporate' 
                    ? 'bg-amml-blue text-white border-amml-blue' 
                    : 'bg-amml-surface text-amml-text3 border-amml-line hover:bg-amml-surface2'
                }`}
              >
                🏢 Standard Officer
              </button>
              <button
                onClick={() => { setBadgeTheme('taskforce'); playTickSound(); }}
                className={`py-2 px-3 border rounded-lg cursor-pointer transition-all ${
                  badgeTheme === 'taskforce' 
                    ? 'bg-gradient-to-r from-amml-orange to-amber-500 text-white border-amml-orange' 
                    : 'bg-amml-surface text-amml-text3 border-amml-line hover:bg-amml-surface2'
                }`}
              >
                🪖 Patrol Specialist
              </button>
            </div>
          </div>

          {/* The Holographic Badge Container */}
          <div 
            className={`w-full relative shadow-2xl rounded-2xl p-6 flex flex-col items-stretch justify-between min-h-[380px] overflow-hidden select-none select-none transition-transform duration-100 ease-out border`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: tilt.hover 
                ? `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(1.01)` 
                : 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)',
              background: badgeTheme === 'corporate'
                ? 'linear-gradient(135deg, #020815 0%, #0c1c38 50%, #020a1c 100%)'
                : 'linear-gradient(135deg, #1b0a00 0%, #3a1500 50%, #150500 100%)',
              borderColor: badgeTheme === 'corporate' ? '#0064B4' : '#DC6400',
              boxShadow: tilt.hover 
                ? `0 25px 50px -12px ${badgeTheme === 'corporate' ? 'rgba(0,100,180,0.25)' : 'rgba(220,100,0,0.25)'}` 
                : 'none'
            }}
            id="staff-id-badge-card"
          >
            {/* Ambient reflective glow shimmer highlight */}
            {tilt.hover && (
              <div 
                className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/10 to-white/0 mix-blend-overlay"
                style={{
                  transform: `translate(${tilt.x * 15}px, ${tilt.y * 15}px)`
                }}
              />
            )}

            {/* Top Chevron decorative stripes for Patrol Spec theme */}
            {badgeTheme === 'taskforce' && (
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amml-orange via-yellow-500 to-amml-orange repeating-linear-stripes opacity-90" />
            )}

            {/* Badge Layout Top Header */}
            <div className="flex items-center gap-3 relative z-10 border-b border-white/10 pb-4">
              <span className="text-2xl leading-none bg-white/10 p-2 rounded-lg">🏛️</span>
              <div className="min-w-0">
                <h4 className="text-white text-xs font-serif font-extrabold uppercase tracking-widest truncate">Abuja Markets Management Ltd</h4>
                <p className="text-[8px] text-white/50 uppercase tracking-wider font-mono">Official Identification Credential</p>
              </div>
            </div>

            {/* Middle biometric information profile block */}
            <div className="my-5 relative z-10 flex flex-col items-center text-center space-y-4">
              
              {/* Photo placeholder or initials badge */}
              <div className="relative">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold border-2 relative overflow-hidden bg-gradient-to-br transition-all duration-300 ${
                  badgeTheme === 'corporate' 
                    ? 'from-amml-blue to-amml-blue-dk text-white border-amml-blue shadow-[0_0_12px_rgba(0,100,180,0.3)]' 
                    : 'from-amml-orange to-amber-500 text-white border-amml-orange shadow-[0_0_12px_rgba(220,100,0,0.3)]'
                }`}>
                  {session?.name ? session.name.substring(0, 2).toUpperCase() : 'AM'}
                </div>
                
                {/* Visual live holographic state overlay chip */}
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white font-mono text-[7px] font-bold px-1.5 py-0.5 rounded-full border border-black animate-pulse flex items-center gap-0.5 shadow">
                  <span className="h-1 w-1 bg-white rounded-full inline-block" /> ONLINE
                </div>
              </div>

              <div>
                <span className="text-white/40 text-[8px] uppercase tracking-widest block font-serif">Credential Holder</span>
                <h3 className="text-lg font-serif font-extrabold text-white leading-tight mt-0.5">{session?.name || 'Staff Representative'}</h3>
                <p className="text-xs text-white/75 font-mono truncate max-w-xs mt-0.5">{session?.email}</p>
              </div>

              {/* Clearance metrics */}
              <div className="grid grid-cols-2 gap-4 w-full pt-1.5 border-t border-white/5 text-xs">
                <div>
                  <span className="text-white/40 text-[8px] uppercase block tracking-wider font-mono">Authorization Level</span>
                  <span className="text-white font-extrabold font-mono inline-block bg-white/10 px-2.5 py-0.5 rounded mt-1 select-none text-[10px]">
                    {session?.level || 'SUPERVISOR'}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 text-[8px] uppercase tracking-wider block font-mono">Employee Staff ID</span>
                  <span className="text-amml-orange font-mono font-extrabold block mt-1 text-[11px] tracking-wide select-none">
                    {session?.staffId || 'AMML-001'}
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom barcode ingest simulation */}
            <div className="bg-white p-3 rounded-lg flex flex-col items-center justify-center shrink-0 relative z-10 select-none shadow">
              <div className="w-full h-8 bg-slate-900 flex gap-[1px] items-end px-1.5 py-0.5 pointer-events-none rounded sm:gap-0.5">
                {[5,2,4,1,5,3,2,4,1,3,2,5,1,4,2,3,5,1,2,5,3,1,4,2,3,5,4,2,5].map((height, i) => (
                  <div key={i} className="bg-white flex-1 transition-all" style={{ height: `${height * 18}%` }} />
                ))}
              </div>
              <span className="font-mono text-[8px] font-bold text-slate-800 tracking-widest mt-1.5">{session?.staffId}</span>
              <div className="text-[7px] text-slate-400 font-extrabold tracking-wider mt-0.5 uppercase">AMML INTEGRATED ENFORCEMENT NODE</div>
            </div>

          </div>

        </div>

      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-amml-panel border border-amml-line rounded-xl p-4 shadow-sm text-amml-text">
        <div className="flex items-center gap-3.5 p-1 border-r border-amml-line/60 last:border-0">
          <div className="p-2.5 rounded-lg bg-amml-blue/10 text-amml-blue">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-amml-text3 font-medium">Logged Days</span>
            <span className="text-base font-bold text-amml-text block font-mono mt-0.5">{myHistory.length} cycles</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-1 border-r border-amml-line/60 last:border-0">
          <div className="p-2.5 rounded-lg bg-amml-orange/10 text-amml-orange">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-amml-text3 font-medium">Completed Shifts</span>
            <span className="text-base font-bold text-amml-text block font-mono mt-0.5">{completedShifts} logged exits</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-1 border-r border-amml-line/60 last:border-0">
          <div className="p-2.5 rounded-lg bg-amml-green/10 text-amml-green">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-amml-text3 font-medium">Compliance Ratio</span>
            <span className={`text-base font-bold block font-mono mt-0.5 ${onTimePercentage >= 85 ? 'text-amml-green' : 'text-amml-orange'}`}>
              {onTimePercentage}% On-Time
            </span>
          </div>
        </div>

        {/* Dynamic leaves dashboard panel for every user */}
        <div className="flex items-center gap-3.5 p-1">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-amml-text3 font-medium flex items-center gap-1">Leave Days Bal</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-white font-mono">{leaveDaysRemaining}</span>
              <span className="text-[10px] text-amml-text3">/ {totalEntitlement} left</span>
            </div>
            <span className="text-[9px] text-indigo-300 font-bold block mt-0.5">{leaveDaysTaken} days approved leaves taken</span>
          </div>
        </div>
      </div>

      {/* History log list view with Search, filtering, and responsive high-end aesthetics */}
      <div className="bg-amml-panel border border-amml-line rounded-xl shadow-sm overflow-hidden text-amml-text">
        
        {/* Table Search Filters Header Block */}
        <div className="p-5 border-b border-amml-line bg-amml-surface2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="font-serif text-sm sm:text-base font-bold text-amml-text flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amml-blue animate-pulse" /> My Personal Biometric Logs registry
            </h3>
            
            <span className="text-[10px] font-mono bg-amml-surface border border-amml-line px-2 py-1 rounded text-amml-text3 select-none">
              TOTAL TRANSACTIONS: {filteredHistory.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="h-3.5 w-3.5 text-amml-text3 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search logs by operational date, location keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-amml-surface border border-amml-line text-amml-text placeholder-amml-text3 text-xs pl-8.5 pr-3 py-2.5 rounded-lg outline-none transition-all focus:border-amml-blue"
              />
            </div>

            {/* Dropdown Filter */}
            <div className="sm:w-56 flex items-center gap-2 bg-amml-surface border border-amml-line rounded-lg px-2.5 py-1 text-xs">
              <Filter className="h-3.5 w-3.5 text-amml-text3 shrink-0" />
              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value)}
                className="w-full bg-transparent text-amml-text text-xs outline-none cursor-pointer py-1 font-bold"
              >
                <option className="bg-amml-panel text-amml-text" value="">All Market Spot Filters</option>
                <option className="bg-amml-panel text-amml-text" value="Gudu Market">Gudu Market</option>
                <option className="bg-amml-panel text-amml-text" value="Wuse International Market">Wuse Market</option>
                <option className="bg-amml-panel text-amml-text" value="Utako Market">Utako Market</option>
                <option className="bg-amml-panel text-amml-text" value="Nyanya Market Complex">Nyanya Market</option>
              </select>
            </div>
          </div>
        </div>

        {/* The responsive attendance log registry table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-amml-surface3 text-amml-text3 font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider border-b border-amml-line select-none">
                <th className="p-4">Operational Date</th>
                <th className="p-4">Market Complex Area</th>
                <th className="p-4">Biometric Clock-In</th>
                <th className="p-4">Biometric Clock-Out</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Ingest Device Client ID</th>
                <th className="p-4 text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amml-line/50 text-xs">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-amml-text3 italic">
                    😴 No personal card punches logged matching active filter parameters.
                  </td>
                </tr>
              ) : (
                filteredHistory.slice(0, 30).map(r => {
                  const isInfraction = r.device && (r.device.includes('Infraction') || r.device.includes('OMITTED'));
                  return (
                    <tr key={r.id} className="hover:bg-amml-surface2/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-amml-text">{r.date || todayStr}</td>
                      <td className="p-4 font-semibold text-amml-text2">{r.market}</td>
                      <td className="p-4 font-mono font-bold text-[#288C28]">{r.clockIn || '—'}</td>
                      <td className="p-4 font-mono font-bold text-amml-blue">{r.clockOut || '—'}</td>
                      <td className="p-4 font-mono text-amml-text3">{r.duration || 'Active Shift'}</td>
                      <td className="p-4 text-amml-text3 truncate max-w-[170px] font-mono" title={r.device}>
                        {r.device || 'Unspecified'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <AttendanceStatusPill status={r.late ? 'Late' : r.clockOut ? 'Clocked Out' : 'Present'} size="sm" />
                          
                          {isInfraction && (
                            <span className="text-[8px] font-bold bg-red-500/10 text-red-500 px-1.5 py-0.2 rounded font-mono uppercase tracking-tight">
                              ⚠️ ID CARD MISSED (₦5k DED)
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info banner */}
        <div className="p-4 bg-amml-surface border-t border-amml-line flex flex-col sm:flex-row justify-between items-center text-[10px] text-amml-text3 font-medium select-none gap-2">
          <span>Displaying latest personal clocking indices aligned with AMML compliance parameters.</span>
          <span className="font-mono text-amml-blue select-none">ZK-TECO BIOMETRIC BACKEND SYNC • SECURE</span>
        </div>

      </div>
      </>
      )}

    </div>
  );
};
