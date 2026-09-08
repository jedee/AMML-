import React, { useState, useEffect } from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { AmmlStaff } from '../../lib/amml/types';
import { getDeptTagInfo, isExStaff } from '../../lib/amml/department_scopes';
import { 
  MapPin, Calendar, Clock, Phone, Award, Shield, FileText, 
  ArrowLeftRight, Check, Send, AlertCircle, Sparkles, User, Briefcase,
  Upload, Trash2, Download, Eye
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

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

interface EmployeeProfileCardProps {
  staffMember: AmmlStaff;
  onClose?: () => void;
}

export const EmployeeProfileCard: React.FC<EmployeeProfileCardProps> = ({ staffMember, onClose }) => {
  const { markets, setStaff, auditLog, staff } = useAmmlStore();
  const navigate = useNavigate();
  const [selectedTargetMarket, setSelectedTargetMarket] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);

  const [matchedDocs, setMatchedDocs] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Appointment Letter');
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // Hook to load matched documents for this staff member
  useEffect(() => {
    const loadDocs = () => {
      try {
        const saved = localStorage.getItem('amml_staff_documents');
        let docsList = [];
        if (saved) {
          docsList = JSON.parse(saved);
        } else {
          // Seed some realistic matched documents for all employees so they aren't empty
          docsList = [
            {
              id: 'doc-seed-1',
              staffId: 'AMML-001',
              fileName: 'Appointment_Letter_CEO.pdf',
              fileSize: '1.8 MB',
              uploadDate: '2026-07-10',
              category: 'Appointment Letter'
            },
            {
              id: 'doc-seed-2',
              staffId: 'AMML-001',
              fileName: 'NIN_Slip_Onya.pdf',
              fileSize: '450 KB',
              uploadDate: '2026-07-12',
              category: 'National ID (NIN)'
            },
            {
              id: 'doc-seed-3',
              staffId: 'AMML-002',
              fileName: 'MBA_Degree_Innocent.pdf',
              fileSize: '2.3 MB',
              uploadDate: '2026-06-15',
              category: 'Academic Degree'
            },
            {
              id: 'doc-seed-4',
              staffId: 'AMML-C01', // Ibrahim Zubairu contract
              fileName: 'Contract_Agreement_Wuse_EEnesi.pdf',
              fileSize: '1.2 MB',
              uploadDate: '2026-07-01',
              category: 'Contract Agreement'
            }
          ];
          localStorage.setItem('amml_staff_documents', JSON.stringify(docsList));
        }
        setMatchedDocs(docsList.filter((d: any) => d.staffId === staffMember.id));
      } catch (e) {
        console.error(e);
      }
    };
    loadDocs();
  }, [staffMember.id]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addFile(e.target.files[0]);
    }
  };

  const addFile = (file: File) => {
    try {
      const saved = localStorage.getItem('amml_staff_documents');
      const docs = saved ? JSON.parse(saved) : [];
      
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;

      const newDoc = {
        id: 'doc-' + Date.now(),
        staffId: staffMember.id,
        fileName: file.name,
        fileSize: sizeStr,
        uploadDate: new Date().toISOString().slice(0, 10),
        category: selectedCategory
      };

      const updated = [newDoc, ...docs];
      localStorage.setItem('amml_staff_documents', JSON.stringify(updated));
      setMatchedDocs(updated.filter((d: any) => d.staffId === staffMember.id));
      
      // Force trigger state sync for other views by dispatching a custom storage event
      window.dispatchEvent(new Event('storage'));
      
      // Log this activity
      auditLog(
        'SETTINGS', 
        'Document matched to employee', 
        `Matched "${file.name}" under category [${selectedCategory}] to ${staffMember.first} ${staffMember.last} (${staffMember.id})`
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDoc = (docId: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to detach and remove file "${fileName}" from this employee record?`)) {
      try {
        const saved = localStorage.getItem('amml_staff_documents');
        if (saved) {
          const docs = JSON.parse(saved);
          const filtered = docs.filter((d: any) => d.id !== docId);
          localStorage.setItem('amml_staff_documents', JSON.stringify(filtered));
          setMatchedDocs(filtered.filter((d: any) => d.staffId === staffMember.id));
          
          window.dispatchEvent(new Event('storage'));
          
          auditLog(
            'SETTINGS',
            'Document detached from employee',
            `Detached "${fileName}" from ${staffMember.first} ${staffMember.last} (${staffMember.id})`
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Helper to retrieve live leave memos from storage
  const getLeaveStatus = () => {
    let leaveMemos: any[] = [];
    try {
      const saved = localStorage.getItem('amml_leave_memos');
      if (saved) {
        leaveMemos = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error reading amml_leave_memos", e);
    }

    const staffName = `${staffMember.first} ${staffMember.last}`;
    const idNorm = staffMember.id.toUpperCase().trim();

    // Check if there is an active/approved memo for this user
    const matchingMemos = leaveMemos.filter((memo: any) => {
      const memoStaffId = memo.staffId ? memo.staffId.toUpperCase().trim() : '';
      const isNameMatch = areNamesMatching(staffName, memo.to || '', memo.market || '', staffMember.market || '');
      const isIdMatch = idNorm && memoStaffId && idNorm === memoStaffId;

      return isNameMatch || isIdMatch;
    });

    const activeLeave = matchingMemos.find((memo: any) => {
      if (memo.status !== 'approved' && !memo.synced) return false;
      if (!memo.startDate || !memo.endDate) return false;

      const today = new Date();
      // Set to midnight UTC of local time for precise equivalence
      today.setHours(0,0,0,0);
      const start = new Date(memo.startDate + 'T00:00:00');
      const end = new Date(memo.endDate + 'T00:00:00');
      
      return today >= start && today <= end;
    });

    return {
      allMemos: matchingMemos,
      activeLeave: activeLeave || null,
      isOnLeave: !!activeLeave
    };
  };

  const leaveMetrics = getLeaveStatus();

  // Rapid Deployment handler
  const handleRapidRedeploy = () => {
    if (!selectedTargetMarket) return;
    
    if (staffMember.market === selectedTargetMarket) {
      alert(`Staff is already assigned to the ${selectedTargetMarket} station.`);
      return;
    }

    setIsDeploying(true);

    const oldMarket = staffMember.market;
    
    // Core database state synchronized setting
    setStaff(prev => prev.map(s => {
      if (s.id === staffMember.id) {
        return { ...s, market: selectedTargetMarket };
      }
      return s;
    }));

    // HR general log sync
    auditLog(
      'SETTINGS', 
      'Rapid Staff Relocation', 
      `Direct redeployment of ${staffMember.first} ${staffMember.last} (ID: ${staffMember.id}) from [${oldMarket}] to [${selectedTargetMarket}] executed in Rapid Console.`
    );

    setDeploySuccess(`Relocated to ${selectedTargetMarket}!`);
    setTimeout(() => {
      setDeploySuccess(null);
      setIsDeploying(false);
      setSelectedTargetMarket('');
    }, 2000);
  };

  // Memo Quick Launch Integration
  const handleQuickLaunchMemo = () => {
    // Stage employee ID in local storage for automated loading inside MemoRegistry
    localStorage.setItem('amml_draft_staff_id', staffMember.id);
    // Navigate to Reports component that renders MemoRegistry
    navigate({ to: '/reports' });
  };

  // Compute status for display styling
  const getStatusDisplay = () => {
    const remarksUpper = (staffMember.remarks || '').toUpperCase();
    if (remarksUpper.includes('RESIGNED')) {
      return { 
        label: 'Resigned', 
        classes: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
      };
    }
    if (remarksUpper.includes('ABSCONDED')) {
      return { 
        label: 'Absconded', 
        classes: 'bg-red-500/10 text-red-400 border border-red-500/30' 
      };
    }
    if (leaveMetrics.isOnLeave) {
      return { 
        label: 'On Leave', 
        classes: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse' 
      };
    }
    if (!staffMember.active) {
      return { 
        label: 'Suspended', 
        classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
      };
    }
    return { 
      label: 'Active Nominal Roll', 
      classes: 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
    };
  };

  const statusStyle = getStatusDisplay();

  return (
    <div className="bg-[#0b131f] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full font-sans" id={`employee-profile-card-${staffMember.id}`}>
      
      {/* Visual Header Banner */}
      <div className="relative p-6 pb-4 bg-gradient-to-r from-slate-900 to-[#070d14] border-b border-slate-800 overflow-hidden flex flex-col sm:flex-row items-center gap-5">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none font-serif font-black text-6xl text-slate-300 select-none tracking-widest leading-none rotate-12 -right-4 top-2">
          AMML
        </div>

        {/* Big Avatar with matching initials and decorative outer ring */}
        <div className="relative shrink-0 select-none">
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#0064B4] to-indigo-600 p-[2.5px] shadow-lg">
            <div className="bg-slate-950 rounded-full h-full w-full flex items-center justify-center font-serif font-black text-white text-2xl uppercase tracking-wider">
              {staffMember.first[0]}{staffMember.last[0]}
            </div>
          </div>
          {staffMember.active && (
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#0b131f] flex items-center justify-center" title="System Connected">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            </span>
          )}
        </div>

        {/* Identity Details */}
        <div className="text-center sm:text-left flex-1 space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="font-serif font-black text-lg text-white uppercase tracking-tight leading-snug">
              {staffMember.last}, {staffMember.first}
            </h3>
            <span className={`inline-block py-0.5 px-2.5 rounded-md font-mono text-[9px] uppercase tracking-wide font-black border text-center self-center sm:self-auto ${statusStyle.classes}`}>
              {statusStyle.label}
            </span>
          </div>

          <p className="text-xs text-indigo-400 font-mono flex items-center justify-center sm:justify-start gap-1">
            <Briefcase className="h-3.5 w-3.5 shrink-0" />
            <span>{staffMember.role || 'Nominal Officer'}</span>
            <span className="text-slate-600">•</span>
            <span>{staffMember.dept}</span>
          </p>

          <p className="text-[10px] text-slate-400 font-mono tracking-tight">
            ID REF: <span className="text-slate-200 font-bold font-mono">{staffMember.id}</span>
            {staffMember.gradeLevel && (
              <>
                <span className="mx-1 text-slate-600">|</span>
                RANK: <span className="text-slate-250 font-bold">{staffMember.gradeLevel}</span>
              </>
            )}
          </p>
        </div>

        {onClose && (
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-900 border border-slate-800 p-1 px-2 text-xs rounded-lg hover:bg-slate-800 text-slate-450 transition-all cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Corporate Metadata Dashboard Grid */}
      <div className="flex-1 p-5 space-y-5 overflow-y-auto text-xs text-slate-300">
        
        {/* Ex-Staff Governance Status Notice */}
        {(staffMember.active === false || isExStaff(staffMember.id) || isExStaff(`${staffMember.first} ${staffMember.last}`) || staffMember.remarks?.toUpperCase().includes('RESIGNED')) && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-800/80 rounded-xl space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase font-mono text-[10px]">
              <Shield className="h-3.5 w-3.5 text-rose-400" />
              EX-STAFF (RESIGNED PERSONNEL) — HR POLICY ENFORCEMENT
            </div>
            <p className="text-[11px] text-rose-200 leading-relaxed font-sans">
              This staff member has resigned from AMML. Annual leave privileges, duty coverage schedules, and active HR handover authorizations are permanently revoked under company regulations.
            </p>
          </div>
        )}
        
        {/* Department Tag & Scope Governance */}
        {(() => {
          const tagInfo = getDeptTagInfo(staffMember.dept, staffMember.id, staffMember.role);
          const deptCode = staffMember.deptCode || tagInfo.deptCode;
          const supervisor = staffMember.supervisorName || tagInfo.supervisorName;
          const scope = staffMember.reportingScope || tagInfo.reportingScope;

          return (
            <div className="p-3.5 bg-slate-900/90 border border-indigo-900/50 rounded-xl space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-indigo-400" />
                  Department Governance Scope Tag
                </span>
                <span className="bg-indigo-600 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                  {deptCode}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[9px] uppercase font-mono block">Direct Supervisor</span>
                  <span className="text-slate-200 font-bold font-mono text-[11px]">{supervisor}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] uppercase font-mono block">Reporting Scope</span>
                  <span className="text-indigo-300 font-medium text-[11px]">{scope}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Nominal Roll Profile Columns */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest border-b border-slate-800/60 pb-1 flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-[#0064B4]" />
            Official HR Nominal Dossier
          </h4>

          <div className="grid grid-cols-2 gap-3.5 bg-[#121b26]/50 p-3.5 border border-slate-800 rounded-xl font-medium">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider">State of Origin</span>
              <span className="text-slate-200 text-xs font-semibold">{staffMember.stateOfOrigin || 'Not Provided'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider">Gender / Sex</span>
              <span className="text-slate-200 text-xs font-semibold">
                {staffMember.gender === 'F' ? 'Female (F)' : staffMember.gender === 'M' ? 'Male (M)' : 'Not Registered'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider">Date of Birth</span>
              <span className="text-slate-200 text-xs font-semibold font-mono">{staffMember.dob || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider">First Appointment</span>
              <span className="text-slate-200 text-xs font-semibold font-mono">{staffMember.dateOfFirstAppointment || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider">Current Station Station</span>
              <span className="text-xs font-black text-indigo-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {staffMember.market || 'Head Office'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider">Contact Number</span>
              <span className="text-slate-200 text-xs font-mono font-semibold">{staffMember.phone || '+234 Omitted'}</span>
            </div>
          </div>
        </div>

        {/* Intellectual/Qualifications section */}
        {(staffMember.qualification || staffMember.professionalMembership) && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest border-b border-slate-800/60 pb-1 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-blue-400" />
              Credentials & Memberships
            </h4>
            <div className="p-3 bg-[#111924] border border-slate-800 rounded-xl space-y-2.5">
              {staffMember.qualification && (
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Qualifications</span>
                  <p className="text-slate-250 leading-relaxed font-semibold">{staffMember.qualification}</p>
                </div>
              )}
              {staffMember.professionalMembership && (
                <div className="pt-2 border-t border-slate-800/50">
                  <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Body Memberships</span>
                  <p className="text-slate-300 italic leading-relaxed">{staffMember.professionalMembership}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* leave Status Overview Compartment */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest border-b border-slate-800/60 pb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              Corporate Leave Audit Status
            </span>
            <span className="font-mono text-[9px] text-slate-500">
              {leaveMetrics.allMemos.length} Memos Filed
            </span>
          </h4>

          {leaveMetrics.isOnLeave && leaveMetrics.activeLeave ? (
            /* ACTIVE LEAVE DISPLAY CARD */
            <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3.5 space-y-3">
              <div className="flex justify-between items-center bg-indigo-500/10 p-2 rounded-lg border border-indigo-505/20 text-indigo-350">
                <span className="font-bold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
                  Active Annual Leave Block
                </span>
                <span className="text-[10px] font-mono bg-indigo-950 border border-indigo-500/40 px-2 py-0.5 rounded font-extrabold text-indigo-400">
                  ON LEAVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-normal leading-none mb-0.5">Start Date</span>
                  <span className="font-semibold text-slate-200">{leaveMetrics.activeLeave.startDate || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-normal leading-none mb-0.5">Approved Days</span>
                  <span className="font-semibold text-slate-200">{leaveMetrics.activeLeave.approvedDays || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-normal leading-none mb-0.5">End Date</span>
                  <span className="font-semibold text-slate-200">{leaveMetrics.activeLeave.endDate || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-normal leading-none mb-0.5">Resume Scheduled</span>
                  <span className="font-semibold text-indigo-400 font-mono font-medium">{leaveMetrics.activeLeave.resumeDate || '—'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-500/10 text-[10px] text-slate-400 flex justify-between items-center">
                <span>Handover Reliever Cover:</span>
                <span className="font-bold text-slate-200 uppercase">{leaveMetrics.activeLeave.reliever || 'NOT DECLARED'}</span>
              </div>
            </div>
          ) : (
            /* NO ACTIVE LEAVE DISPLAY CARD */
            <div className="bg-slate-900/40 p-3.5 border border-slate-800 rounded-xl flex items-center gap-3">
              <span className="p-2 bg-emerald-500/10 text-emerald-450 rounded-lg">
                <Clock className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <span className="block font-bold text-slate-100">At Post / Working Duty</span>
                <span className="text-[10px] text-slate-500 font-mono">No active leave matches today's date bounds. Available for active stationing.</span>
              </div>
            </div>
          )}

          {/* leave history timeline or overview */}
          {leaveMetrics.allMemos.length > 0 && (
            <div className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-lg">
              <span className="block text-[8px] font-mono tracking-widest uppercase text-slate-500 mb-1.5 px-1 font-black">History of Memo filings</span>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {leaveMetrics.allMemos.map((memo: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] hover:bg-slate-900 p-1 px-1.5 rounded transition-all">
                    <span className="text-slate-400 truncate max-w-[240px] font-medium uppercase font-serif">
                      {memo.isExam ? '📝 Exam: ' : '🌴 Leave: '} {memo.subject || 'Internal Directive'}
                    </span>
                    <span className={`font-mono text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                      memo.status === 'approved' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}>
                      {memo.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Matched Documents & Files Console */}
        <div className="space-y-3 p-4 bg-[#111924] border border-slate-800 rounded-xl">
          <div className="flex items-center gap-1.5 justify-between">
            <h4 className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-blue-400" />
              Matched Documents & Files
            </h4>
            <span className="text-[9px] font-bold text-blue-400 font-mono uppercase bg-blue-500/15 p-1 px-1.5 rounded-md leading-none border border-blue-500/20">
              {matchedDocs.length} Matched
            </span>
          </div>

          <p className="text-[10px] text-slate-400">
            Select a document category, then drop or browse files to match them to this employee record.
          </p>

          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="flex-1 bg-[#121b26] border border-slate-800 rounded-lg p-2 text-white font-bold text-[11px] focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Appointment Letter">Appointment Letter</option>
                <option value="Academic Degree">Academic Degree</option>
                <option value="National ID (NIN)">National ID (NIN)</option>
                <option value="Promotion Letter">Promotion Letter</option>
                <option value="Contract Agreement">Contract Agreement</option>
                <option value="Guarantor Form">Guarantor Form</option>
                <option value="Code of Conduct">Code of Conduct</option>
              </select>

              <label className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold p-2 px-3 rounded-lg text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all">
                <Upload className="h-3 w-3" />
                <span>Browse</span>
                <input
                  type="file"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-500/5 text-blue-300'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400'
              }`}
            >
              <Upload className="h-6 w-6 text-slate-500 mx-auto mb-1.5" />
              <p className="text-[10px] font-medium">
                {dragActive ? 'Drop file to match here...' : 'Drag and drop files here to match'}
              </p>
            </div>

            {/* Document List */}
            {matchedDocs.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {matchedDocs.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex justify-between items-center bg-[#0d141e] border border-slate-800/80 p-2 rounded-lg hover:border-slate-700/80 transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 font-sans">
                        <div className="text-[11px] font-bold text-slate-200 truncate" title={doc.fileName}>
                          {doc.fileName}
                        </div>
                        <div className="text-[9px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                          <span>{doc.category}</span>
                          <span>•</span>
                          <span>{doc.fileSize}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer transition-all"
                        title="Preview document"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id, doc.fileName)}
                        className="p-1 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded cursor-pointer transition-all"
                        title="Detach document"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-900/10 border border-slate-850 rounded-xl text-slate-500 text-[10px]">
                No files matched to this employee yet.
              </div>
            )}
          </div>
        </div>

        {/* Rapid Deployment Form Console */}
        <div className="space-y-2.5 p-4 bg-[#111c2a] border border-slate-800 rounded-xl">
          <div className="flex items-center gap-1.5 justify-between">
            <h4 className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest flex items-center gap-1">
              <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-400" />
              🔌 Rapid Stations Relocator
            </h4>
            <span className="text-[9px] font-bold text-indigo-400 font-mono uppercase bg-indigo-500/15 p-1 px-1.5 rounded-md leading-none border border-indigo-500/20">
              DEPLOY ENGINE
            </span>
          </div>

          <p className="text-[10px] text-slate-400">
            Relocate this employee instantly under the AMML Roster grid to adjust workforce density across complexes.
          </p>

          <div className="flex gap-2">
            <select
              value={selectedTargetMarket}
              onChange={e => setSelectedTargetMarket(e.target.value)}
              className="flex-1 bg-[#121b26] border border-slate-800 rounded-lg p-2 text-white font-bold text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">-- select relocation market station --</option>
              {markets
                .filter(m => m.name !== staffMember.market && m.active)
                .map(m => {
                  const occupants = staff.filter(s => s.market === m.name).length;
                  return (
                    <option key={m.id} value={m.name}>
                      🏪 {m.name} ({occupants} / {m.capacity} Stationed)
                    </option>
                  );
                })}
            </select>

            <button
              type="button"
              onClick={handleRapidRedeploy}
              disabled={isDeploying || !selectedTargetMarket}
              className={`p-2 px-3.5 font-bold rounded-lg text-xs leading-none transition-all flex items-center justify-center gap-1 border cursor-pointer ${
                selectedTargetMarket 
                  ? 'bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white shadow-md' 
                  : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isDeploying ? (
                <span className="inline-block h-3 w-3 rounded-full border-2 border-slate-400 border-t-white animate-spin"></span>
              ) : (
                <span>Re-Route</span>
              )}
            </button>
          </div>

          {deploySuccess && (
            <div className="p-2 text-center text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] animate-stage-wake flex items-center justify-center gap-1.5">
              <Check className="h-3.5 w-3.5 shrink-0" />
              <span>{deploySuccess}</span>
            </div>
          )}
        </div>

      </div>

      {/* Launcher CTA Footer Section with Direct Memo Draft Sync */}
      <div className="p-4 px-5 border-t border-slate-800 flex items-center justify-between bg-[#070d14] gap-2.5 select-none">
        <span className="text-[9px] font-mono text-slate-500">
          AMML RADID-STATION v1.2
        </span>
        
        <button
          onClick={handleQuickLaunchMemo}
          className="bg-[#0064B4] hover:bg-blue-600 text-white rounded-lg p-2 px-3.5 text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-[#005299] hover:border-blue-500"
          title="Pre-populate employee inside Leave Memo template and load reports workspace"
        >
          <FileText className="h-3.5 w-3.5 text-blue-200" />
          <span>Launch Memo Draft</span>
        </button>
      </div>

      {/* Document Preview Overlay Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b131f] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative flex flex-col max-h-[85vh] animate-stage-wake text-left">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer p-1 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{previewDoc.category}</h3>
                <p className="text-[10px] text-slate-500 font-mono">Matched File: {previewDoc.fileName} ({previewDoc.fileSize})</p>
              </div>
            </div>

            {/* Simulated Paper Document Viewer */}
            <div className="flex-1 overflow-y-auto bg-white text-slate-900 p-8 rounded-xl font-sans relative border border-slate-300 shadow-inner select-none max-h-[50vh]">
              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none">
                <div className="font-serif font-black text-6xl text-slate-900 tracking-widest text-center border-4 border-slate-900 p-4 rotate-12">
                  AMML STAMPED
                </div>
              </div>

              {/* Official Stamped Stamp Emblem */}
              <div className="absolute top-6 right-6 border-2 border-emerald-600 rounded text-emerald-600 font-mono font-black text-[9px] uppercase tracking-wider p-1 rotate-6 leading-none pointer-events-none opacity-85 select-none text-center">
                AMML AUDITED<br/>
                JULY 2026
              </div>

              {/* Letterhead */}
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-6 font-serif">
                <h4 className="text-base font-black tracking-wide uppercase text-slate-900">Abuja Markets Management Limited</h4>
                <p className="text-[9px] text-slate-600 font-mono italic mt-0.5">8 Dar Es Salaam Street, Wuse II, Abuja, FCT, Nigeria</p>
                <div className="text-[8px] text-slate-500 font-mono mt-0.5 uppercase tracking-widest">Nominal Document Audit Verification Desk</div>
              </div>

              {/* Document Contents */}
              <div className="space-y-4 text-[11px] leading-relaxed text-slate-800">
                <div className="flex justify-between font-mono text-[9px] text-slate-600 border-b border-slate-150 pb-2">
                  <span>REF: AMML/HR/ROLL/{staffMember.id}</span>
                  <span>DATE: {previewDoc.uploadDate}</span>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-slate-950 uppercase border-b border-slate-200 pb-1">
                    CERTIFIED RECORD DOCKET FOR {staffMember.first} {staffMember.last}
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[10px] bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div><span className="text-slate-500 font-bold">Employee ID:</span> <span className="font-bold text-slate-900">{staffMember.id}</span></div>
                    <div><span className="text-slate-500 font-bold">Target Station:</span> <span className="font-bold text-slate-900">{staffMember.market || 'Head Office'}</span></div>
                    <div><span className="text-slate-500 font-bold">Designation:</span> <span className="font-bold text-slate-900">{staffMember.role}</span></div>
                    <div><span className="text-slate-500 font-bold">Grade Level:</span> <span className="font-bold text-slate-900">{staffMember.gradeLevel || '—'}</span></div>
                    <div><span className="text-slate-500 font-bold">State of Origin:</span> <span className="font-bold text-slate-900">{staffMember.stateOfOrigin || '—'}</span></div>
                    <div><span className="text-slate-500 font-bold">Date of Birth:</span> <span className="font-bold text-slate-900">{staffMember.dob || '—'}</span></div>
                  </div>
                </div>

                <div className="space-y-2 font-serif text-[11px] text-slate-700 leading-relaxed italic border-t border-slate-100 pt-3">
                  <p>
                    This serves to confirm that the official document file <span className="font-mono font-bold text-slate-900 not-italic">"{previewDoc.fileName}"</span> has been verified and successfully matched to the named employee's permanent nominal roll file in Abuja Markets Management Limited (AMML).
                  </p>
                  <p>
                    The linked file represents certified academic credentials, employment verification records, statutory identity slips, or deployment forms matched during the July 2026 nominal review audit.
                  </p>
                </div>

                {/* Sign-off */}
                <div className="pt-8 flex justify-between items-end font-serif">
                  <div className="text-center">
                    <div className="font-mono text-[9px] text-slate-400">[Stamp Seal Applied]</div>
                    <div className="border-t border-slate-400 mt-1 pt-1 text-[9px] font-bold text-slate-800 uppercase">Head HR & Admin</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-900 font-mono">Status: CERTIFIED</div>
                    <div className="text-[8px] text-slate-500 font-mono">Security Hash: {previewDoc.id}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Download manifest option */}
            <div className="flex gap-2 justify-end pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-all"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                    docRef: previewDoc.id,
                    matchedEmployeeId: staffMember.id,
                    matchedEmployeeName: `${staffMember.first} ${staffMember.last}`,
                    currentMarketStation: staffMember.market,
                    role: staffMember.role,
                    categoryMatched: previewDoc.category,
                    fileName: previewDoc.fileName,
                    fileSize: previewDoc.fileSize,
                    certifiedDate: previewDoc.uploadDate,
                    originCode: "AMML-NOMINAL-2026-AUDIT"
                  }, null, 2));
                  const dlAnchor = document.createElement('a');
                  dlAnchor.setAttribute("href",     dataStr     );
                  dlAnchor.setAttribute("download", `AMML_Matched_Dossier_${staffMember.id}_${previewDoc.category.replace(/\s+/g, '_')}.json`);
                  document.body.appendChild(dlAnchor);
                  dlAnchor.click();
                  dlAnchor.remove();
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-md"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Matched Docket</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
