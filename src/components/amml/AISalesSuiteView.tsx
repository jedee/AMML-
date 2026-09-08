import React, { useState } from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { 
  Brain, Send, Loader2, Zap, ShieldCheck, AlertTriangle, FileText, 
  HelpCircle, Sparkles, Clipboard, Users, Building, DollarSign,
  TrendingUp, Settings, CheckCircle2, ArrowRight, RefreshCw, Layers
} from 'lucide-react';

const COMPLIANCE_MEMO_TEMPLATE = `ABUJA MARKETS MANAGEMENT LIMITED
INTERNAL MEMO

FROM: HEAD, ADMIN/HR				TO: Ag. MD/CEO
DATE: 2nd June 2026

ENFORCEMENT OF COMPLIANCE: MANDATORY WEARING OF OFFICIAL ID CARDS AND BRANDED T-SHIRTS

It has been observed with great dismay that most of the staff amongst us have consistently made it their culture to continue to come to work without their official Identification (ID) cards. To this effect, let this memo serve as a FINAL WARNING to all staff that this will not be tolerated on the job going forward.

Also be reminded that enforcement has strictly resumed and violations will result in the following:

Mandatory ID Cards (All Staff): All staff members must visibly wear their valid AMML ID cards at all times during working hours. Failure to do so will attract a direct financial penalty via deduction from your monthly allowances (stipends). "Forgetting your ID at home" will not be accepted to waive this deduction. If lost, visit HR immediately for a replacement.

Task Force Branded T-Shirts: Furthermore, all Task Force personnel must wear their official AMML branded T-shirts at all times while on duty at their markets. Operating out of uniform will not go unpunished, and Market Managers must ensure their task force team complies fully.

Market Managers are hereby charged with the absolute responsibility of ensuring that all personnel under their supervision strictly adhere to these compliance directives daily. Failure to do so will be met with immediate punishments from management.

Thank you for your understanding and cooperation.

EFOSA OKOSUN`;

export const AISalesSuiteView: React.FC = () => {
  const { staff, att, markets, devices, settings } = useAmmlStore();
  const [activeTab, setActiveTab] = useState<'compliance' | 'revenue' | 'memo' | 'custom'>('compliance');
  const [question, setQuestion] = useState('Analyze June 2026 Admin HR Compliance Memo regarding ID Cards & Branded T-Shirts');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [thinkingStep, setThinkingStep] = useState(0);

  // Customize memo template variables
  const [memoSubject, setMemoSubject] = useState('ENFORCEMENT OF BIOMETRIC CLOCK-IN HOURLY THRESHOLDS');
  const [memoSender, setMemoSender] = useState('Ag. MD/CEO (Onya Ojiji)');
  const [memoTarget, setMemoTarget] = useState('All Market Managers & Gate Supervisors');

  // Derive active live stats to feed Gemini API context safely
  const mktCount = markets.length;
  const activeStaff = staff.filter(s => s.active);
  const staffCount = activeStaff.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysAtt = att.filter(a => a.date === todayStr);
  const presentCount = new Set(todaysAtt.map(a => a.staffId)).size;
  const totalLateCount = todaysAtt.filter(a => a.late).length;
  const latePercent = presentCount ? Math.round((totalLateCount / presentCount) * 100) : 0;

  // Real data correlations for the AI advisor context
  const totalLateEver = att.filter(a => a.late).length;
  const totalAttendanceRecords = att.length;
  const historicalLatePct = totalAttendanceRecords ? Math.round((totalLateEver / totalAttendanceRecords) * 100) : 0;
  
  // Calculate top late employees as compliance target focus
  const lateFrequencies: Record<string, { name: string; count: number; dept: string; market: string }> = {};
  att.forEach(a => {
    if (a.late) {
      if (!lateFrequencies[a.staffId]) {
        lateFrequencies[a.staffId] = { name: a.staffName, count: 0, dept: a.dept, market: a.market };
      }
      lateFrequencies[a.staffId].count += 1;
    }
  });
  const topOffenders = Object.values(lateFrequencies)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Simulated compliance penalty collections
  const currentLateDeductionFee = settings.lateDeduction || 500;
  const estimatedComplianceLossTotal = totalLateEver * currentLateDeductionFee;

  const handleConsultAI = async (textPrompt = question, category = activeTab) => {
    setLoading(true);
    setResult(null);
    setThinkingStep(0);

    const interval = setInterval(() => {
      setThinkingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1100);

    const statsPayload = {
      marketCount: mktCount,
      staffCount,
      presentCount,
      latePct: latePercent,
      historicalLatePct,
      totalLateEver,
      estimatedComplianceLossTotal,
      topOffenders: topOffenders.map(o => `${o.name} (${o.count} infractions inside ${o.market})`),
      lateDeductionFee: currentLateDeductionFee,
      devicesCount: devices.length,
      inactiveDevicesCount: devices.filter(d => !d.active).length
    };

    try {
      const response = await fetch('/api/amml/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: statsPayload,
          question: textPrompt,
          category,
          memoDetails: category === 'memo' ? { subject: memoSubject, sender: memoSender, target: memoTarget } : null
        })
      });

      const data = await response.json();
      setResult(data.text || 'Could not retrieve advice from FCT neural node.');
    } catch (error) {
      console.error(error);
      setResult('### 🚨 Node Offline Connection Error\n\nFailed to establish API handshake with AI analytics routing endpoint.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'compliance' | 'revenue' | 'memo' | 'custom') => {
    setActiveTab(tab);
    setResult(null);
    
    if (tab === 'compliance') {
      setQuestion('Analyze June 2026 Admin HR Compliance Memo regarding ID Cards & Branded T-Shirts');
    } else if (tab === 'revenue') {
      setQuestion('Draft a strategic revenue audit projection assessing stall rental yield, parking fees leaks, and active gate tolls optimizations across the Wuse, Gudu and Utako complexes.');
    } else if (tab === 'memo') {
      setQuestion(`Draft a high-impact corporate memorandum on "${memoSubject}" from ${memoSender} to ${memoTarget} enforcing the strict Abuja Markets administrative guidelines.`);
    } else {
      setQuestion('');
    }
  };

  return (
    <div id="amml-ai-advisor-container" className="space-y-6 animate-stage-wake select-none">
      
      {/* Dynamic Upper Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-amml-panel/60 border border-amml-line p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-amml-muted font-mono uppercase font-bold">Historical Infractions</p>
            <p className="text-base font-serif font-black text-white">{totalLateEver} Late Scans</p>
          </div>
        </div>
        
        <div className="bg-amml-panel/60 border border-amml-line p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-amml-muted font-mono uppercase font-bold">Est. Stipend Deductions</p>
            <p className="text-base font-serif font-black text-white">₦{(estimatedComplianceLossTotal).toLocaleString('en-NG')}</p>
          </div>
        </div>

        <div className="bg-amml-panel/60 border border-amml-line p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-[#0064B4]/10 text-sky-400 rounded-lg">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-amml-muted font-mono uppercase font-bold">Active Roster Size</p>
            <p className="text-base font-serif font-black text-white">{staffCount} Personnel</p>
          </div>
        </div>

        <div className="bg-amml-panel/60 border border-amml-line p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-amml-muted font-mono uppercase font-bold">Average Lateness Pct</p>
            <p className="text-base font-serif font-black text-white">{historicalLatePct}% Rate</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-amml-line pb-1">
        <button
          onClick={() => handleTabChange('compliance')}
          className={`flex items-center gap-2 px-4 py-2.5 font-mono text-[11px] font-extrabold uppercase transition-all rounded-lg cursor-pointer ${
            activeTab === 'compliance'
              ? 'bg-[#DC6400] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-amml-panel'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Workforce Compliance &amp; Penalties</span>
        </button>

        <button
          onClick={() => handleTabChange('revenue')}
          className={`flex items-center gap-2 px-4 py-2.5 font-mono text-[11px] font-extrabold uppercase transition-all rounded-lg cursor-pointer ${
            activeTab === 'revenue'
              ? 'bg-[#DC6400] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-amml-panel'
          }`}
        >
          <Building className="h-3.5 w-3.5" />
          <span>Revenue &amp; Lease Optimization</span>
        </button>

        <button
          onClick={() => handleTabChange('memo')}
          className={`flex items-center gap-2 px-4 py-2.5 font-mono text-[11px] font-extrabold uppercase transition-all rounded-lg cursor-pointer ${
            activeTab === 'memo'
              ? 'bg-[#DC6400] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-amml-panel'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Internal Memo Formulator</span>
        </button>

        <button
          onClick={() => handleTabChange('custom')}
          className={`flex items-center gap-2 px-4 py-2.5 font-mono text-[11px] font-extrabold uppercase transition-all rounded-lg cursor-pointer ${
            activeTab === 'custom'
              ? 'bg-[#DC6400] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-amml-panel'
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Cognitive Query Sandbox</span>
        </button>
      </div>

      {/* Grid structure main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Parameters Form Deck */}
        <div className="lg:col-span-1 bg-amml-panel border border-amml-line rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2 text-[#9ec4f5] font-bold text-xs uppercase font-mono">
            <Brain className="h-4 w-4 text-amml-blue animate-pulse" /> 
            <span>Cognitive Parameter Deck</span>
          </div>
          
          <p className="text-xs text-amml-muted leading-relaxed">
            Configure target operational metadata, rosters profiles, and active compliance variables to direct the AI generation pipeline.
          </p>

          <div className="border-t border-amml-line/35 pt-4 space-y-4">
            {activeTab === 'compliance' && (
              <div className="space-y-3">
                <div className="bg-[#050C16] border border-white/5 rounded-lg p-3 space-y-2 text-xs">
                  <span className="font-mono text-[9px] text-[#DC6400] font-extrabold uppercase">Roster Offenders (Top 3 Late):</span>
                  {topOffenders.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {topOffenders.map((offender, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] text-slate-300">
                          <span className="truncate max-w-[140px] font-bold">⚠️ {offender.name}</span>
                          <span className="font-mono text-slate-450 bg-amml-ink/50 border border-white/5 px-1.5 py-0.5 rounded">
                            {offender.count} late ({offender.market})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-emerald-400 font-bold">🟢 No late logs on file. 100% compliance!</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase">Input / Raw HR Directive Memo</label>
                  <textarea 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={6}
                    className="w-full bg-amml-surface border border-amml-line focus:border-[#DC6400] px-3 py-2 rounded-lg text-xs font-mono text-slate-300 outline-none transition-all resize-none"
                    placeholder="Enter compliance memorandum, custom rules, or disciplinary updates..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className="space-y-4">
                <div className="bg-[#050C16] border border-white/5 rounded-lg p-3 space-y-2 text-xs">
                  <span className="font-mono text-[9px] text-[#288C28] font-extrabold uppercase">Markets Facility Inventory:</span>
                  <div className="space-y-1 pt-1 font-mono text-[10px] text-slate-350">
                    {markets.map(m => (
                      <div key={m.id} className="flex justify-between">
                        <span>• {m.name}</span>
                        <span className="text-white">Cap: {m.capacity} stalls</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase">Strategic Focus Query</label>
                  <textarea 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={6}
                    className="w-full bg-amml-surface border border-amml-line focus:border-[#DC6400] px-3 py-2 rounded-lg text-xs font-sans text-slate-300 outline-none transition-all resize-none"
                    placeholder="Enter custom revenue optimization objectives..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'memo' && (
              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Memo Subject Line</label>
                  <input 
                    type="text" 
                    value={memoSubject}
                    onChange={(e) => {
                      setMemoSubject(e.target.value);
                      setQuestion(`Draft a high-impact corporate memorandum on "${e.target.value}" from ${memoSender} to ${memoTarget} enforcing the strict Abuja Markets administrative guidelines.`);
                    }}
                    className="w-full bg-amml-surface border border-amml-line focus:border-[#DC6400] px-2.5 py-2 rounded-lg font-mono text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Sender (From)</label>
                  <input 
                    type="text" 
                    value={memoSender}
                    onChange={(e) => {
                      setMemoSender(e.target.value);
                      setQuestion(`Draft a high-impact corporate memorandum on "${memoSubject}" from ${e.target.value} to ${memoTarget} enforcing the strict Abuja Markets administrative guidelines.`);
                    }}
                    className="w-full bg-amml-surface border border-amml-line focus:border-[#DC6400] px-2.5 py-2 rounded-lg font-mono text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Target (To)</label>
                  <input 
                    type="text" 
                    value={memoTarget}
                    onChange={(e) => {
                      setMemoTarget(e.target.value);
                      setQuestion(`Draft a high-impact corporate memorandum on "${memoSubject}" from ${memoSender} to ${e.target.value} enforcing the strict Abuja Markets administrative guidelines.`);
                    }}
                    className="w-full bg-amml-surface border border-amml-line focus:border-[#DC6400] px-2.5 py-2 rounded-lg font-mono text-xs text-white outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase">Ask AMML Executive Advisor AI</label>
                  <textarea 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={6}
                    className="w-full bg-amml-surface border border-amml-line focus:border-[#DC6400] px-3 py-2 rounded-lg text-xs sm:text-sm text-slate-200 outline-none transition-all resize-none"
                    placeholder="E.g., How can we reduce Gudu Market lateness by 15% using incentive models? Or draft an asset replenishment purchase plan."
                  />
                </div>
              </div>
            )}

            <button 
              disabled={loading || !question.trim()}
              onClick={() => handleConsultAI(question)}
              className="w-full flex items-center justify-center gap-2 bg-[#DC6400] hover:bg-[#B34C00] disabled:opacity-40 text-white font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-lg cursor-pointer transition-all shadow-lg border border-orange-500/10"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Synthesizing Advice...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-white" />
                  <span>Execute AI Synthesis</span>
                </>
              )}
            </button>
          </div>

          {/* Prompt quick overrides */}
          <div className="space-y-2 pt-4 border-t border-amml-line/30">
            <span className="block text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider">Operational Presets</span>
            <div className="grid grid-cols-1 gap-1.5">
              {activeTab === 'compliance' && (
                <button
                  onClick={() => {
                    setQuestion(COMPLIANCE_MEMO_TEMPLATE);
                    handleConsultAI(COMPLIANCE_MEMO_TEMPLATE, 'compliance');
                  }}
                  className="w-full text-left text-[11px] font-mono text-slate-400 hover:text-[#DC6400] hover:bg-amml-surface border border-amml-line/30 p-2.5 rounded-lg transition-all truncate cursor-pointer outline-none"
                >
                  📝 Ingest June 2026 HR Memo
                </button>
              )}

              {activeTab === 'revenue' && (
                <>
                  <button
                    onClick={() => {
                      const prompt = 'Formulate a 4-year capacity expansion strategy for Utako Market complexes to increase stall rent collection bounds.';
                      setQuestion(prompt);
                      handleConsultAI(prompt, 'revenue');
                    }}
                    className="w-full text-left text-[11px] font-sans text-slate-400 hover:text-[#DC6400] hover:bg-amml-surface border border-amml-line/30 p-2.5 rounded-lg transition-all truncate cursor-pointer"
                  >
                    📈 Utako Stall Yield Expansion
                  </button>
                  <button
                    onClick={() => {
                      const prompt = 'Review parking space allocations and gate toll automation leakage preventions at Wuse Market blocks.';
                      setQuestion(prompt);
                      handleConsultAI(prompt, 'revenue');
                    }}
                    className="w-full text-left text-[11px] font-sans text-slate-400 hover:text-[#DC6400] hover:bg-amml-surface border border-amml-line/30 p-2.5 rounded-lg transition-all truncate cursor-pointer"
                  >
                    🚗 Wuse Gate Toll Leak Audit
                  </button>
                </>
              )}

              {activeTab === 'memo' && (
                <button
                  onClick={() => {
                    setMemoSubject('PROHIBITION OF SUBLETTING AND UNAUTHORIZED STALL ALTERATIONS');
                    setMemoSender('Ag. MD/CEO (Onya Ojiji)');
                    setMemoTarget('All Market Managers, Facilities Teams & Shop Owners');
                    const prompt = 'Draft a high-impact corporate memorandum on "PROHIBITION OF SUBLETTING AND UNAUTHORIZED STALL ALTERATIONS" from Ag. MD/CEO (Onya Ojiji) to All Market Managers, Facilities Teams & Shop Owners enforcing the strict Abuja Markets administrative guidelines.';
                    setQuestion(prompt);
                    handleConsultAI(prompt, 'memo');
                  }}
                  className="w-full text-left text-[11px] font-mono text-slate-400 hover:text-[#DC6400] hover:bg-amml-surface border border-amml-line/30 p-2.5 rounded-lg transition-all truncate cursor-pointer"
                >
                  📄 Shop Subletting Ban Memo
                </button>
              )}

              {activeTab === 'custom' && (
                <button
                  onClick={() => {
                    const prompt = 'Simulate the financial and operational impact of increasing shift-duration limits from 8 to 9.5 hours for FCT sanitation agents.';
                    setQuestion(prompt);
                    handleConsultAI(prompt, 'custom');
                  }}
                  className="w-full text-left text-[11px] font-sans text-slate-400 hover:text-[#DC6400] hover:bg-amml-surface border border-amml-line/30 p-2.5 rounded-lg transition-all truncate cursor-pointer"
                >
                  ⚡ FCT Sanitation Shift Simulation
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: AI Strategic Output report panel */}
        <div className="lg:col-span-2 bg-amml-panel border border-amml-line rounded-xl shadow-sm min-h-[500px] flex flex-col justify-between overflow-hidden">
          
          {/* Output Header */}
          <div className="p-4 sm:p-5 border-b border-amml-line bg-amml-surface2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 select-none">
            <span className="text-xs font-bold text-slate-200 inline-flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#DC6400] animate-pulse" /> 
              <span>Abuja MMIS AI Advisor Intelligence Log</span>
            </span>
            <div className="flex items-center gap-2 font-mono text-[9px] font-extrabold">
              <span className="text-slate-400 bg-amml-ink/40 px-2 py-0.5 border border-white/5 rounded-md uppercase">
                STALL_COGNITIVE_PORTAL
              </span>
              <span className="bg-[#288C28]/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                SYS ONLINE
              </span>
            </div>
          </div>

          {/* Advisor report viewport */}
          <div className="flex-1 p-6 overflow-y-auto text-left text-amml-text">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full border-4 border-[#DC6400]/20 border-t-[#DC6400] animate-spin" />
                  <Brain className="h-6 w-6 text-[#DC6400] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-3 w-full max-w-sm">
                  <p className="text-xs font-mono font-bold text-[#DC6400] italic uppercase tracking-wider">
                    MMIS COGNITIVE PIPELINE RUNNING...
                  </p>
                  <div className="bg-amml-surface border border-amml-line rounded-lg p-3.5 space-y-2 text-left">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className={`h-2 w-2 rounded-full transition-all duration-300 ${thinkingStep >= 0 ? 'bg-amml-green animate-pulse shadow-[0_0_8px_#288C28]' : 'bg-gray-650'}`} />
                      <span className={thinkingStep === 0 ? 'text-white font-bold' : 'text-slate-450'}>1. Structuring live markets revenue &amp; rosters index context...</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className={`h-2 w-2 rounded-full transition-all duration-300 ${thinkingStep >= 1 ? 'bg-amml-green animate-pulse shadow-[0_0_8px_#288C28]' : 'bg-gray-650'}`} />
                      <span className={thinkingStep === 1 ? 'text-white font-bold' : 'text-slate-450'}>2. Formulating local FCT legal and municipal directives...</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className={`h-2 w-2 rounded-full transition-all duration-300 ${thinkingStep >= 2 ? 'bg-amml-green animate-pulse shadow-[0_0_8px_#288C28]' : 'bg-gray-650'}`} />
                      <span className={thinkingStep === 2 ? 'text-white font-bold' : 'text-slate-450'}>3. Calculating projected allowanced penalties &amp; yields...</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className={`h-2 w-2 rounded-full transition-all duration-300 ${thinkingStep >= 3 ? 'bg-amml-green animate-pulse shadow-[0_0_8px_#288C28]' : 'bg-gray-650'}`} />
                      <span className={thinkingStep === 3 ? 'text-white font-bold' : 'text-slate-450'}>4. Structuring official administrative memoranda...</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-4 text-xs sm:text-sm max-w-none leading-relaxed text-left whitespace-pre-wrap font-sans text-slate-300 select-text">
                {/* Visual Paper Envelope look if it's a corporate memo */}
                {activeTab === 'memo' ? (
                  <div className="border border-amml-line bg-amml-surface p-5 rounded-lg space-y-4 font-mono shadow-inner">
                    <div className="border-b border-dashed border-amml-line/60 pb-3 text-center space-y-1">
                      <p className="text-xs font-bold text-white tracking-widest uppercase">ABUJA MARKETS MANAGEMENT LIMITED (AMML)</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">FCT Administration, Abuja, Nigeria</p>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-1.5 border-b border-amml-line pb-3">
                      <div className="flex"><span className="w-16 font-extrabold text-slate-450 uppercase">TO:</span> <span className="text-white font-bold">{memoTarget}</span></div>
                      <div className="flex"><span className="w-16 font-extrabold text-slate-450 uppercase">FROM:</span> <span className="text-white font-bold">{memoSender}</span></div>
                      <div className="flex"><span className="w-16 font-extrabold text-slate-450 uppercase">DATE:</span> <span className="text-white font-bold">{new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                      <div className="flex"><span className="w-16 font-extrabold text-slate-450 uppercase">SUBJECT:</span> <span className="text-amml-orange font-bold uppercase">{memoSubject}</span></div>
                    </div>
                    <div className="text-slate-300 text-xs leading-relaxed space-y-3 pt-1 whitespace-pre-wrap">
                      {result}
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-xs max-w-none space-y-4">
                    {/* Format headers and bold markers nicely */}
                    {result.split('\n').map((line, i) => {
                      if (line.startsWith('### ')) {
                        return <h3 key={i} className="text-sm font-bold font-serif text-white uppercase tracking-wider mt-4 pt-2 border-b border-amml-line pb-1.5 flex items-center gap-1.5">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('#### ')) {
                        return <h4 key={i} className="text-xs font-bold font-mono text-[#9ec4f5] uppercase tracking-wide mt-2">{line.replace('#### ', '')}</h4>;
                      }
                      if (line.startsWith('* ')) {
                        return <div key={i} className="flex items-start gap-2 text-xs text-slate-350 ml-2"><span>•</span><span>{line.replace('* ', '')}</span></div>;
                      }
                      return <p key={i} className="text-slate-300 text-xs sm:text-sm leading-relaxed">{line}</p>;
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20 space-y-4 select-none">
                <div className="w-16 h-16 bg-amml-surface2 text-amml-orange rounded-full border border-amml-line flex items-center justify-center text-3xl font-extrabold shadow-md animate-bounce">
                  🧠
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-white uppercase tracking-wider">AMML MMIS Executive Consulting Core</h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                    Select a core operational category from the navigation header, calibrate the input parameters, and trigger the AI Synthesis engine to generate highly specific system audits.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="bg-amml-surface2 p-4 border-t border-amml-line flex flex-col sm:flex-row gap-3 items-center justify-between text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider select-none">
            <span>Powered by Gemini &amp; Abuja FCT Cognitive Core</span>
            <span>AMML-NOC INTEL-LOG V3</span>
          </div>
        </div>

      </div>

    </div>
  );
};
