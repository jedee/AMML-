import React, { useState, useEffect } from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { AmmlStaff } from '../../lib/amml/types';
import { Plus, Search, Trash, Edit, Settings, Contact, X, IdCard, User, LayoutGrid, List } from 'lucide-react';
import { EmployeeProfileCard } from './EmployeeProfileCard';
import { AttendanceStatusPill } from './AttendanceStatusPill';

import { getDeptTagInfo, validateHROperationScope, isStaffActiveStatus, isExStaff } from '../../lib/amml/department_scopes';

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

function getStaffStatus(s: AmmlStaff) {
  const remarksUpper = (s.remarks || '').toUpperCase();
  const fullName = `${s.first} ${s.last}`;
  
  if (remarksUpper.includes('RESIGNED') || !s.active || s.id === 'AMML-EX047' || isExStaff(s.id) || isExStaff(fullName)) {
    return {
      label: 'Resigned',
      class: 'bg-red-50 text-red-800 border border-red-200',
      dot: 'bg-red-500'
    };
  }
  if (remarksUpper.includes('ABSCONDED')) {
    return {
      label: 'Absconded',
      class: 'bg-rose-50 text-rose-800 border border-rose-200',
      dot: 'bg-rose-500 font-bold animate-pulse'
    };
  }

  // Dynamic approved & synced leave memo check to set 'On Leave' status
  try {
    const saved = localStorage.getItem('amml_leave_memos');
    if (saved) {
      const memos: any[] = JSON.parse(saved);

      const hasActiveLeave = memos.some(memo => {
        if (memo.status !== 'approved' && !memo.synced) return false;
        
        const isNameMatch = areNamesMatching(fullName, memo.to || '', memo.market || '', s.market || '');

        return isNameMatch;
      });

      if (hasActiveLeave) {
        return {
          label: 'On Leave',
          class: 'bg-indigo-55 text-indigo-700 border border-indigo-200 bg-indigo-50/50',
          dot: 'bg-indigo-600 font-bold animate-pulse shadow-sm shadow-indigo-500/50'
        };
      }
    }
  } catch (e) {
    console.error("error checking leave memos in getStaffStatus", e);
  }

  return {
    label: 'Active',
    class: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    dot: 'bg-emerald-500'
  };
}

export const StaffView: React.FC = () => {
  const { staff, setStaff, markets, auditLog, triggerSimulateScan, att } = useAmmlStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedStaffForCard, setSelectedStaffForCard] = useState<AmmlStaff | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [mktFilterVal, setMktFilterVal] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PERMANENT' | 'CONTRACT'>('ALL');
  const [docCounts, setDocCounts] = useState<Record<string, number>>({});

  // Document Matcher Hub States
  const [activeTab, setActiveTab] = useState<'directory' | 'matcher'>('directory');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [unassignedDragActive, setUnassignedDragActive] = useState(false);
  const [unassignedFiles, setUnassignedFiles] = useState<Array<{ id: string; name: string; size: string; category: string; matchedStaffId: string }>>([
    { id: 'u-1', name: 'NIN_Slip_Maureen_Minka.pdf', size: '540 KB', category: 'National ID (NIN)', matchedStaffId: '' },
    { id: 'u-2', name: 'Appointment_Letter_James_Musa.pdf', size: '1.4 MB', category: 'Appointment Letter', matchedStaffId: '' },
    { id: 'u-3', name: 'Contract_Agreement_Bartholomew.pdf', size: '2.1 MB', category: 'Contract Agreement', matchedStaffId: '' },
    { id: 'u-4', name: 'Academic_Degree_Mustapha_Mukhtar.pdf', size: '3.2 MB', category: 'Academic Degree', matchedStaffId: '' },
    { id: 'u-5', name: 'Utako_Accountant_Credentials_Sunday_Ojo.pdf', size: '1.7 MB', category: 'Guarantor Form', matchedStaffId: '' }
  ]);

  const handleAutoSuggest = (fileId: string) => {
    const file = unassignedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    const fLower = file.name.toLowerCase();
    
    // Check if filename contains first name or last name of any staff
    const found = staff.find(s => {
      const firstL = s.first.toLowerCase();
      const lastL = s.last.toLowerCase();
      return (firstL.length > 2 && fLower.includes(firstL)) || (lastL.length > 2 && fLower.includes(lastL));
    });

    if (found) {
      setUnassignedFiles(prev => prev.map(f => f.id === fileId ? { ...f, matchedStaffId: found.id } : f));
      setSuccessMessage(`Auto-suggested match for "${file.name}" to ${found.first} ${found.last} (${found.market})`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setSuccessMessage(`No clear name match found in database for "${file.name}"`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleMatchUnassignedFile = (fileId: string) => {
    const file = unassignedFiles.find(f => f.id === fileId);
    if (!file || !file.matchedStaffId) return;

    try {
      const saved = localStorage.getItem('amml_staff_documents');
      const docs = saved ? JSON.parse(saved) : [];
      
      const newDoc = {
        id: 'doc-' + Date.now(),
        staffId: file.matchedStaffId,
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString().slice(0, 10),
        category: file.category
      };

      const updated = [newDoc, ...docs];
      localStorage.setItem('amml_staff_documents', JSON.stringify(updated));
      
      const matchedStaff = staff.find(s => s.id === file.matchedStaffId);
      const staffName = matchedStaff ? `${matchedStaff.first} ${matchedStaff.last}` : file.matchedStaffId;
      const staffMkt = matchedStaff ? matchedStaff.market : 'Unknown Market';

      auditLog(
        'SETTINGS', 
        'Document matched to employee', 
        `Matched "${file.name}" under category [${file.category}] to ${staffName} (${file.matchedStaffId}) stationed at ${staffMkt}`
      );

      // Remove from unassigned
      setUnassignedFiles(prev => prev.filter(f => f.id !== fileId));
      
      // Update counts
      updateDocCounts();
      
      // Notify other views
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('storage_sync_docs'));

      setSuccessMessage(`Successfully matched "${file.name}" to ${staffName} (${staffMkt})!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnassignedDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setUnassignedDragActive(true);
    } else if (e.type === "dragleave") {
      setUnassignedDragActive(false);
    }
  };

  const handleUnassignedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUnassignedDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;

      setUnassignedFiles(prev => [
        ...prev,
        {
          id: 'u-' + Date.now(),
          name: file.name,
          size: sizeStr,
          category: 'Appointment Letter',
          matchedStaffId: ''
        }
      ]);
    }
  };

  const handleUnassignedFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;

      setUnassignedFiles(prev => [
        ...prev,
        {
          id: 'u-' + Date.now(),
          name: file.name,
          size: sizeStr,
          category: 'Appointment Letter',
          matchedStaffId: ''
        }
      ]);
    }
  };

  const updateDocCounts = () => {
    try {
      const saved = localStorage.getItem('amml_staff_documents');
      if (saved) {
        const docs = JSON.parse(saved);
        const counts: Record<string, number> = {};
        docs.forEach((d: any) => {
          counts[d.staffId] = (counts[d.staffId] || 0) + 1;
        });
        setDocCounts(counts);
      } else {
        // Seed standard document counts on first load if local storage is empty
        const initialSeed = [
          { staffId: 'AMML-001', count: 2 },
          { staffId: 'AMML-002', count: 1 },
          { staffId: 'AMML-C01', count: 1 }
        ];
        const counts: Record<string, number> = {};
        initialSeed.forEach(s => {
          counts[s.staffId] = s.count;
        });
        setDocCounts(counts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    updateDocCounts();
    const handleStorageChange = () => {
      updateDocCounts();
    };
    window.addEventListener('storage', handleStorageChange);
    // Custom window event also triggers in single-page navigation context
    window.addEventListener('storage_sync_docs', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage_sync_docs', handleStorageChange);
    };
  }, []);

  // Form Fields
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [dept, setDept] = useState('Market Operations');
  const [market, setMarket] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState(70000);
  const [authLevel, setAuthLevel] = useState<'SUPERADMIN' | 'MD' | 'MANAGER' | 'SUPERVISOR' | 'OFFICER'>('OFFICER');
  const [isContract, setIsContract] = useState(false);

  // Nominal Roll Fields
  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [gender, setGender] = useState('M');
  const [dob, setDob] = useState('');
  const [qualification, setQualification] = useState('');
  const [professionalMembership, setProfessionalMembership] = useState('');
  const [dateOfFirstAppointment, setDateOfFirstAppointment] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [lastPromotionDate, setLastPromotionDate] = useState('');
  const [remarks, setRemarks] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);

  const resetForm = () => {
    setFirst('');
    setLast('');
    setDept('Market Operations');
    setMarket(markets[0]?.name || '');
    setPhone('');
    setRole('');
    setSalary(70000);
    setAuthLevel('OFFICER');
    setStateOfOrigin('');
    setGender('M');
    setDob('');
    setQualification('');
    setProfessionalMembership('');
    setDateOfFirstAppointment('');
    setGradeLevel('');
    setLastPromotionDate('');
    setRemarks('');
    setIsContract(false);
    setEditId(null);
    setIsEdit(false);
  };

  const departments = ['Administration', 'Market Operations', 'Finance', 'Security', 'Cleaning'];

  const filteredStaff = staff.filter(s => {
    const sMatch = !search || `${s.first} ${s.last} ${s.id} ${s.role} ${s.stateOfOrigin || ''} ${s.qualification || ''}`.toLowerCase().includes(search.toLowerCase());
    const dMatch = !deptFilter || s.dept === deptFilter;
    const mMatch = !mktFilterVal || s.market === mktFilterVal;
    
    let tMatch = true;
    if (typeFilter === 'PERMANENT') {
      tMatch = !s.isContract;
    } else if (typeFilter === 'CONTRACT') {
      tMatch = !!s.isContract;
    }
    
    return sMatch && dMatch && mMatch && tMatch;
  });

  const handleOpenAdd = () => {
    resetForm();
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (s: AmmlStaff) => {
    setFirst(s.first);
    setLast(s.last);
    setDept(s.dept);
    setMarket(s.market);
    setPhone(s.phone);
    setRole(s.role || '');
    setSalary(s.salary);
    setAuthLevel(s.authLevel);
    setStateOfOrigin(s.stateOfOrigin || '');
    setGender(s.gender || 'M');
    setDob(s.dob || '');
    setQualification(s.qualification || '');
    setProfessionalMembership(s.professionalMembership || '');
    setDateOfFirstAppointment(s.dateOfFirstAppointment || '');
    setGradeLevel(s.gradeLevel || '');
    setLastPromotionDate(s.lastPromotionDate || '');
    setRemarks(s.remarks || '');
    setIsContract(!!s.isContract);
    setEditId(s.id);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Permanently remove employee registered credentials for "${name}" (${id})?`)) {
      setStaff(prev => prev.filter(x => x.id !== id));
      auditLog('SETTINGS', 'Staff roster removed', name + ' (' + id + ')');
    }
  };

  const handleToggleState = (id: string, name: string, curState: boolean) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !curState } : s));
    auditLog('SETTINGS', `Staff ${!curState ? 'activated' : 'suspended'}`, name);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!first.trim() || !last.trim() || !market) return;

    if (isEdit && editId) {
      setStaff(prev => prev.map(s => s.id === editId ? {
        ...s,
        first,
        last,
        dept,
        market,
        phone,
        role,
        salary,
        authLevel,
        isContract,
        stateOfOrigin: stateOfOrigin || undefined,
        gender: gender || undefined,
        dob: dob || undefined,
        qualification: qualification || undefined,
        professionalMembership: professionalMembership || undefined,
        dateOfFirstAppointment: dateOfFirstAppointment || undefined,
        gradeLevel: gradeLevel || undefined,
        lastPromotionDate: lastPromotionDate || undefined,
        remarks: remarks || undefined
      } : s));
      auditLog('SETTINGS', 'Staff record updated', `${first} ${last} (${editId})`);
    } else {
      // Find highest suffix depending on isContract
      let nextId = '';
      if (isContract) {
        const cDigitsList = staff.filter(s => s.id.startsWith('AMML-C')).map(s => parseInt(s.id.replace('AMML-C', ''))).filter(n => !isNaN(n));
        const nextIdDigit = cDigitsList.length ? Math.max(...cDigitsList) + 1 : 1;
        nextId = `AMML-C${String(nextIdDigit).padStart(2, '0')}`;
      } else {
        const digitsList = staff.filter(s => !s.id.startsWith('AMML-C')).map(s => parseInt(s.id.replace('AMML-', ''))).filter(n => !isNaN(n));
        const nextIdDigit = digitsList.length ? Math.max(...digitsList) + 1 : 1;
        nextId = `AMML-${String(nextIdDigit).padStart(3, '0')}`;
      }

      const newS: AmmlStaff = {
        id: nextId,
        first,
        last,
        dept,
        market,
        phone,
        role,
        salary,
        active: true,
        authLevel,
        isContract,
        stateOfOrigin: stateOfOrigin || undefined,
        gender: gender || undefined,
        dob: dob || undefined,
        qualification: qualification || undefined,
        professionalMembership: professionalMembership || undefined,
        dateOfFirstAppointment: dateOfFirstAppointment || undefined,
        gradeLevel: gradeLevel || undefined,
        lastPromotionDate: lastPromotionDate || undefined,
        remarks: remarks || undefined
      };

      setStaff(prev => [...prev, newS]);
      auditLog('SETTINGS', 'Staff enrolled in directory', `${first} ${last} (${nextId})`);
    }

    setModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6 animate-stage-wake">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amml-text tracking-tight font-sans">Workforce directory</h2>
          <p className="text-amml-text3 text-sm mt-1">Enroll staff, modify departments and trigger virtual scanner sweeps</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-amml-blue hover:bg-amml-blue-dk text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Enroll Staff Node
        </button>
      </div>

      {/* Tab Controls */}
      <div className="flex border-b border-amml-line">
        <button
          type="button"
          onClick={() => { setActiveTab('directory'); setSelectedStaffForCard(null); }}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'directory' 
              ? 'border-amml-blue text-white font-sans' 
              : 'border-transparent text-amml-text3 hover:text-white font-sans'
          }`}
        >
          📁 Workforce Directory Roster
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('matcher'); setSelectedStaffForCard(null); }}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'matcher' 
              ? 'border-amml-blue text-white font-sans' 
              : 'border-transparent text-amml-text3 hover:text-white font-sans'
          }`}
        >
          📂 Document Matching Hub
          {unassignedFiles.length > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full animate-pulse">
              {unassignedFiles.length}
            </span>
          )}
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2 animate-stage-wake font-medium font-sans">
          <span>✨</span>
          <span>{successMessage}</span>
        </div>
      )}

      {activeTab === 'matcher' ? (
        <div className="space-y-6 animate-stage-wake font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Upload Zone / Left Column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-amml-panel border border-amml-line p-5 rounded-xl">
                <h3 className="font-serif font-bold text-sm text-white mb-2 uppercase tracking-wide">Add Unassigned Files</h3>
                <p className="text-xs text-amml-text3 mb-4">
                  Upload raw staff documents (NIN, letters, academic certificates) that need to be matched to names on the nominal roll.
                </p>

                {/* Drag & Drop */}
                <div
                  onDragEnter={handleUnassignedDrag}
                  onDragOver={handleUnassignedDrag}
                  onDragLeave={handleUnassignedDrag}
                  onDrop={handleUnassignedDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    unassignedDragActive
                      ? 'border-amml-blue bg-amml-blue/5 text-[#0064B4]'
                      : 'border-amml-line hover:border-amml-text3 bg-amml-surface/40 text-amml-text3'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-amml-surface3 border border-amml-line flex items-center justify-center mx-auto mb-3 text-amml-text2">
                    📥
                  </div>
                  <p className="text-xs font-semibold text-white">Drag and drop files here</p>
                  <p className="text-[10px] text-amml-text3 mt-1">or click to browse from system</p>
                  <label className="inline-block mt-4 bg-amml-blue hover:bg-amml-blue-dk text-white font-bold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer transition-all">
                    Choose File
                    <input
                      type="file"
                      onChange={handleUnassignedFileInput}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Matching Summary Widget */}
              <div className="bg-gradient-to-br from-[#0e1825] to-[#070e17] border border-slate-800 p-5 rounded-xl space-y-3.5">
                <h4 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">
                  Matching Dossier Summary
                </h4>
                <div className="space-y-2 text-[11px] font-medium text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Total Nominals</span>
                    <span className="text-slate-200 font-bold font-mono">{staff.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Unassigned Files</span>
                    <span className="text-[#a5b4cd] font-bold font-mono">{unassignedFiles.length} files</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Matched Files in System</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {Object.values(docCounts).reduce((a, b) => a + b, 0)} files
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Matching Queue / Right Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-amml-panel border border-amml-line p-5 rounded-xl">
                <div className="flex justify-between items-center border-b border-amml-line pb-3 mb-4">
                  <h3 className="font-serif font-bold text-sm text-white uppercase tracking-wide">Matching Queue ({unassignedFiles.length})</h3>
                  <span className="text-[10px] font-mono font-bold text-indigo-400">JULY 2026 AUDIT TASK</span>
                </div>

                {unassignedFiles.length === 0 ? (
                  <div className="py-12 text-center text-amml-text3 space-y-2.5">
                    <span className="text-4xl">🎉</span>
                    <h4 className="font-bold text-white text-sm">All files are matched!</h4>
                    <p className="text-xs max-w-sm mx-auto">
                      Every document in the queue has been securely assigned and registered to its corresponding staff node.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {unassignedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="bg-amml-panel border border-amml-line rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center hover:border-amml-blue/40 transition-all duration-200"
                      >
                        {/* File Details */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-lg select-none">
                            📄
                          </div>
                          <div className="min-w-0 font-sans text-left">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[280px]" title={file.name}>
                              {file.name}
                            </h4>
                            <p className="text-[10px] text-amml-text3 flex items-center gap-1.5 font-mono mt-0.5">
                              <span>{file.size}</span>
                              <span>•</span>
                              <span className="text-slate-400 uppercase font-bold">{file.category}</span>
                            </p>
                          </div>
                        </div>

                        {/* Interactive Matching Controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                          {/* Category Selector */}
                          <select
                            value={file.category}
                            onChange={(e) => setUnassignedFiles(prev => prev.map(f => f.id === file.id ? { ...f, category: e.target.value } : f))}
                            className="bg-amml-surface border border-amml-line rounded-lg px-2 py-1.5 text-xs text-white outline-none font-bold cursor-pointer max-w-[140px]"
                          >
                            <option value="Appointment Letter" className="bg-slate-900 text-white">Appointment Letter</option>
                            <option value="Academic Degree" className="bg-slate-900 text-white">Academic Degree</option>
                            <option value="National ID (NIN)" className="bg-slate-900 text-white">National ID (NIN)</option>
                            <option value="Promotion Letter" className="bg-slate-900 text-white">Promotion Letter</option>
                            <option value="Contract Agreement" className="bg-slate-900 text-white">Contract Agreement</option>
                            <option value="Guarantor Form" className="bg-slate-900 text-white">Guarantor Form</option>
                            <option value="Code of Conduct" className="bg-slate-900 text-white">Code of Conduct</option>
                          </select>

                          {/* Staff Selector (showing Market) */}
                          <select
                            value={file.matchedStaffId}
                            onChange={(e) => setUnassignedFiles(prev => prev.map(f => f.id === file.id ? { ...f, matchedStaffId: e.target.value } : f))}
                            className="bg-amml-surface border border-amml-line rounded-lg px-2.5 py-1.5 text-xs text-indigo-200 outline-none font-bold cursor-pointer max-w-[180px] truncate"
                          >
                            <option value="" className="bg-slate-900 text-white">Select Staff Name...</option>
                            {staff.map((s) => (
                              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-300">
                                {s.id} • {s.first} {s.last} ({s.market})
                              </option>
                            ))}
                          </select>

                          <div className="flex gap-1.5">
                            {/* Auto suggest button */}
                            <button
                              type="button"
                              onClick={() => handleAutoSuggest(file.id)}
                              className="bg-amml-surface hover:bg-amml-surface2 border border-amml-line hover:border-amml-blue p-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-indigo-400"
                              title="Attempt smart-matching suggestion based on file name overlap"
                            >
                              ⚡ Smart Match
                            </button>

                            {/* Confirm Match button */}
                            <button
                              type="button"
                              disabled={!file.matchedStaffId}
                              onClick={() => handleMatchUnassignedFile(file.id)}
                              className={`p-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                file.matchedStaffId
                                  ? 'bg-[#288C28] hover:bg-[#207020] text-white shadow-sm'
                                  : 'bg-amml-surface border border-amml-line text-amml-text3 cursor-not-allowed'
                              }`}
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <>
          {/* Filter and Search Bar controls */}
          <div className="bg-amml-panel border border-amml-line p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-amml-text3" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff names, ID codes, roles..."
            className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue focus:ring-1 focus:ring-amml-blue px-9 py-2 rounded-lg text-xs sm:text-sm text-amml-text outline-none transition-all"
          />
        </div>

        <select 
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-amml-surface border border-amml-line px-3 py-2 rounded-lg text-xs sm:text-sm text-amml-text outline-none cursor-pointer"
        >
          <option value="">All Departments</option>
          {departments.map((d, index) => (
            <option key={index} value={d}>{d}</option>
          ))}
        </select>

        <select 
          value={mktFilterVal}
          onChange={(e) => setMktFilterVal(e.target.value)}
          className="bg-amml-surface border border-amml-line px-3 py-2 rounded-lg text-xs sm:text-sm text-amml-text outline-none cursor-pointer"
        >
          <option value="">All Market Zones</option>
          {markets.map(m => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>

        <select 
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="bg-amml-surface border border-amml-line px-3 py-2 rounded-lg text-xs sm:text-sm text-indigo-400 font-semibold outline-none cursor-pointer"
        >
          <option value="ALL">All Staff Types</option>
          <option value="PERMANENT">Permanent Staff</option>
          <option value="CONTRACT">Contract Staff</option>
        </select>

        {/* Layout View Toggle */}
        <div className="flex border border-amml-line rounded-lg overflow-hidden shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-bold transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-amml-blue text-white' : 'bg-amml-surface text-amml-text2 hover:bg-amml-surface3'}`}
            title="Switch to Card Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-bold transition-all cursor-pointer ${viewMode === 'table' ? 'bg-amml-blue text-white' : 'bg-amml-surface text-amml-text2 hover:bg-amml-surface3'}`}
            title="Switch to Nominal Roll Table view"
          >
            <List className="h-3.5 w-3.5" />
            <span>Nominal Roll Table</span>
          </button>
        </div>
      </div>

      {/* Dynamic 60/40 Split board for EmployeeProfileCard Desk */}
      <div className={`grid grid-cols-1 ${selectedStaffForCard ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6`}>
        
        {/* Left Column (Main Directory Listings) */}
        <div className={`${selectedStaffForCard ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300`}>

          {viewMode === 'grid' ? (
            /* Staff Roster Grid */
            <div className={`grid grid-cols-1 md:grid-cols-2 ${selectedStaffForCard ? 'xl:grid-cols-2' : 'xl:grid-cols-3'} gap-6`}>
          {filteredStaff.map(s => {
            const presentToday = att.some(a => a.date === todayStr && a.staffId === s.id);
            const clockedOut = att.some(a => a.date === todayStr && a.staffId === s.id && a.clockOut);
            const statusInfo = getStaffStatus(s);
            
            return (
              <div key={s.id} className={`bg-amml-panel border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-200 ${s.active ? 'border-amml-line hover:border-indigo-500/50' : 'border-red-250 opacity-90'}`}>
                <div 
                  className="p-5 flex gap-4 cursor-pointer hover:bg-slate-500/5 transition-all text-left"
                  onClick={() => setSelectedStaffForCard(s)}
                  title="Inspect Profile details in card deck"
                >
                  <div className="w-12 h-12 rounded-xl bg-amml-surface3 border border-amml-border flex items-center justify-center font-bold font-serif text-amml-blue text-lg shrink-0 select-none">
                    {s.first.charAt(0)}{s.last.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 font-sans">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-base font-bold text-amml-text truncate">{s.first} {s.last}</h3>
                      <span className="font-mono text-[10px] font-bold text-amml-blue bg-amml-surface3 px-2 py-0.5 rounded-full shrink-0 animate-stage-wake">
                        {s.id}
                      </span>
                    </div>
                    <div className="text-xs text-amml-text3 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{s.role}</span>
                      <span>•</span>
                      <span>{s.dept}</span>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                        s.isContract 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-650 border-emerald-500/20'
                      }`}>
                        {s.isContract ? 'Contract' : 'Permanent'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-xs text-indigo-400 font-semibold truncate">🏢 {s.market}</span>
                      <span className="text-[10px] font-medium text-amml-blue flex items-center gap-1">
                        📄 {docCounts[s.id] || 0} matched
                      </span>
                    </div>
                    <div className="text-[11px] text-amml-text3 mt-1 font-mono">📞 {s.phone || 'No phone'}</div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="px-5 py-3 border-y border-amml-surface2 bg-amml-surface2 flex justify-between items-center text-xs">
                  <span className="text-amml-text3">Work Status Log</span>
                  <span className={`font-bold inline-flex items-center gap-1 ${clockedOut ? 'text-amml-blue' : presentToday ? 'text-amml-green' : 'text-amml-text3'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${clockedOut ? 'bg-amml-blue' : presentToday ? 'bg-amml-green animate-pulse' : 'bg-amml-muted'}`} />
                    {clockedOut ? 'Clocked Out' : presentToday ? 'Clocked In' : 'Not Clocked'}
                  </span>
                </div>

                {/* Roster actions */}
                <div className="p-4 bg-amml-surface3 flex justify-between items-center gap-1.5">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusInfo.class}`}>
                    {statusInfo.label}
                  </span>
                  
                  <div className="flex gap-1.5 items-center">
                    <button 
                      onClick={() => triggerSimulateScan(s.id)}
                      className="flex items-center gap-1 bg-amml-surface border border-amml-line hover:border-amml-blue text-amml-text2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm ml-1"
                      title="Simulate terminal sweep badge scan"
                    >
                      ⚡ Scan Badge
                    </button>

                    <button 
                      onClick={() => setSelectedStaffForCard(selectedStaffForCard?.id === s.id ? null : s)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        selectedStaffForCard?.id === s.id 
                          ? 'bg-indigo-600 border-indigo-500 text-white' 
                          : 'bg-amml-surface border-amml-line text-amml-text2 hover:text-indigo-400 hover:border-indigo-400'
                      }`}
                      title="Inspect nominal profile card"
                    >
                      <Contact className="h-3.5 w-3.5" />
                    </button>

                    <button 
                      onClick={() => handleOpenEdit(s)}
                      className="bg-amml-surface border border-amml-line text-amml-text2 hover:text-amml-blue p-1.5 rounded-lg cursor-pointer"
                      title="Edit record parameters"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleToggleState(s.id, s.first + ' ' + s.last, s.active)}
                      className={`p-1.5 rounded-lg border cursor-pointer ${
                        s.active 
                          ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' 
                          : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                      }`}
                      title={s.active ? 'Suspend roster node' : 'Activate roster node'}
                    >
                      ⚙️
                    </button>
                    <button 
                      onClick={() => handleDelete(s.id, s.first + ' ' + s.last)}
                      className="border border-red-200 text-red-600 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer"
                      title="Delete employee metadata"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Staff Roster Nominal Roll Table with beautiful color-coded badges */
        <div className="bg-amml-panel border border-amml-line rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amml-surface2 border-b border-amml-line text-[10px] sm:text-[11px] font-mono tracking-wider font-extrabold text-[#3a5d85] dark:text-[#a5b4cd] uppercase">
                  <th className="p-4">Staff ID</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Origin & Gen</th>
                  <th className="p-4">Grade Level & Step</th>
                  <th className="p-4">Dept / Primary Role</th>
                  <th className="p-4">Market Station</th>
                  <th className="p-4">Nominal Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amml-line text-xs text-amml-text5">
                {filteredStaff.map(s => {
                  const statusInfo = getStaffStatus(s);
                  const isSuspendedOrResigned = !s.active || statusInfo.label === 'Resigned' || statusInfo.label === 'Absconded';
                  const presentToday = att.some(a => a.date === todayStr && a.staffId === s.id);
                  const clockedOut = att.some(a => a.date === todayStr && a.staffId === s.id && a.clockOut);
                  
                  return (
                    <tr 
                      key={s.id} 
                      className={`hover:bg-amml-surface3/40 transition-colors ${selectedStaffForCard?.id === s.id ? 'bg-[#0f1d30]' : ''} ${isSuspendedOrResigned ? 'bg-amml-surface2/50 text-amml-text3' : ''}`}
                    >
                      <td className="p-4 font-mono font-bold text-xs select-none">
                        <span className="bg-amml-surface2 px-2.5 py-1 rounded border border-amml-line text-amml-blue">
                          {s.id}
                        </span>
                      </td>
                      <td 
                        className="p-4 font-sans cursor-pointer hover:text-indigo-400 group transition-colors"
                        onClick={() => setSelectedStaffForCard(s)}
                        title="Inspect nominal profile card"
                      >
                        <div className="font-bold text-[13px] text-amml-text group-hover:text-indigo-400 transition-colors flex items-center gap-1.5 flex-wrap">
                          <span>{s.first} {s.last}</span>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                            s.isContract 
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                              : 'bg-emerald-500/10 text-emerald-650 border-emerald-500/20'
                          }`}>
                            {s.isContract ? 'Contract' : 'Permanent'}
                          </span>
                        </div>
                        <div className="text-[10px] text-amml-text3 font-mono mt-0.5 flex items-center gap-2">
                          <span>📞 {s.phone || 'No Phone'}</span>
                          <span>•</span>
                          <span className="text-amml-blue font-bold flex items-center gap-0.5">
                            📄 {docCounts[s.id] || 0} matched files
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-amml-text">
                        <div>{s.stateOfOrigin || '—'}</div>
                        <span className="text-amml-text3 text-[10px]">({s.gender || '—'})</span>
                      </td>
                      <td className="p-4 text-xs">
                        <div className="font-mono text-[11px] font-semibold text-amml-text2">{s.gradeLevel || '—'}</div>
                        <div className="text-[9px] text-amml-text3 mt-0.5">1st Appt: {s.dateOfFirstAppointment || '—'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-amml-text">{s.role}</div>
                        <div className="text-[10px] text-amml-text3 font-medium">{s.dept}</div>
                      </td>
                      <td className="p-4 font-semibold text-xs text-indigo-400">
                        🏢 {s.market}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <AttendanceStatusPill status={statusInfo.label} size="sm" />
                          
                          {/* Inner Attendance Check Log */}
                          <div className="text-[10px] font-mono font-medium flex items-center gap-1 text-amml-text3 mt-0.5">
                            <span className={`h-1 w-1 rounded-full ${clockedOut ? 'bg-amml-blue' : presentToday ? 'bg-amml-green' : 'bg-amml-muted'}`} />
                            {clockedOut ? 'Clocked Out' : presentToday ? 'Present Today' : 'Not Clocked'}
                          </div>

                          {s.remarks && (
                            <span className="text-[9px] bg-red-500/10 text-red-550 font-mono px-1 py-0.5 rounded leading-none italic max-w-[150px] truncate animate-stage-wake" title={s.remarks}>
                              {s.remarks}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-1.5 justify-end items-center">
                          <button 
                            type="button"
                            onClick={() => triggerSimulateScan(s.id)}
                            className="bg-amml-surface border border-amml-line hover:border-amml-blue text-amml-text2 text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer shadow-sm"
                            title="Simulate terminal sweep badge scan"
                          >
                            ⚡ Scan
                          </button>
                          <button 
                            type="button"
                            onClick={() => setSelectedStaffForCard(selectedStaffForCard?.id === s.id ? null : s)}
                            className={`p-1 rounded border transition-all cursor-pointer ${
                              selectedStaffForCard?.id === s.id 
                                ? 'bg-indigo-600 border-indigo-500 text-white' 
                                : 'bg-amml-surface border-amml-line text-amml-text2 hover:text-indigo-450 hover:border-indigo-450'
                            }`}
                            title="Inspect nominal profile card"
                          >
                            <Contact className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleOpenEdit(s)}
                            className="bg-amml-surface border border-amml-line hover:border-amml-blue text-amml-text2 p-1 rounded cursor-pointer transition-all"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleToggleState(s.id, s.first + ' ' + s.last, s.active)}
                            className={`p-1 rounded border cursor-pointer ${
                              s.active 
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20' 
                                : 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20'
                            }`}
                            title={s.active ? 'Suspend employee' : 'Activate employee'}
                          >
                            ⚙️
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDelete(s.id, s.first + ' ' + s.last)}
                            className="border border-red-500/20 text-red-500 hover:bg-red-500/10 p-1 rounded cursor-pointer"
                            title="Delete"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>

        {/* Right Column (Highly Detailed EmployeeProfileCard Descriptor Desk) */}
        {selectedStaffForCard && (
          <div className="lg:col-span-4 h-fit sticky top-6 animate-stage-wake">
            <EmployeeProfileCard 
              staffMember={selectedStaffForCard} 
              onClose={() => setSelectedStaffForCard(null)} 
            />
          </div>
        )}
      </div>
        </>
      )}

      {/* Modal Dialog for Enrollments and Edits */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-amml-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-amml-panel border border-amml-line rounded-2xl w-full max-w-xl p-7 shadow-2xl relative animate-stage-wake">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-amml-text3 hover:text-amml-text cursor-pointer p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-lg font-bold text-amml-text mb-1">
              {isEdit ? '👤 Modify Staff Record' : '👤 Enroll New Staff Member'}
            </h3>
            <p className="text-xs text-amml-text3 mb-4">Set department assignments, monthly base logs, and official nominal roll records.</p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-4">
                
                {/* Section A: Core Parameters */}
                <div className="border-b border-amml-line pb-4">
                  <span className="text-amml-blue font-bold text-[10px] uppercase tracking-wider block mb-2">Primary Core Settings</span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">First Name *</label>
                      <input 
                        type="text" 
                        required
                        value={first}
                        onChange={(e) => setFirst(e.target.value)}
                        placeholder="e.g. Aisha"
                        className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue focus:ring-2 focus:ring-amml-blue/15 px-3 py-2 rounded-lg text-sm transition-all outline-none text-amml-text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">Last Name *</label>
                      <input 
                        type="text" 
                        required
                        value={last}
                        onChange={(e) => setLast(e.target.value)}
                        placeholder="e.g. Yusuf"
                        className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue focus:ring-2 focus:ring-amml-blue/15 px-3 py-2 rounded-lg text-sm transition-all outline-none text-amml-text"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">Department assignment</label>
                      <select 
                        value={dept}
                        onChange={(e) => setDept(e.target.value)}
                        className="w-full bg-amml-surface border border-amml-line px-2.5 py-2 rounded-lg text-sm outline-none cursor-pointer text-amml-text"
                      >
                        {departments.map((d, index) => (
                          <option key={index} className="bg-amml-panel text-amml-text" value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">Primary Market *</label>
                      <select 
                        required
                        value={market}
                        onChange={(e) => setMarket(e.target.value)}
                        className="w-full bg-amml-surface border border-amml-line px-2.5 py-2 rounded-lg text-sm outline-none cursor-pointer font-sans text-amml-text"
                      >
                        <option className="bg-amml-panel text-amml-text" value="">Choose Market...</option>
                        {markets.map(m => (
                          <option key={m.id} className="bg-amml-panel text-amml-text" value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">Role Title</label>
                      <input 
                        type="text" 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Officer"
                        className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none text-amml-text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">Phone Contact</label>
                      <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 080..."
                        className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none text-amml-text"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">Base Monthly Salary (₦)</label>
                      <input 
                        type="number"
                        value={salary}
                        onChange={(e) => setSalary(parseInt(e.target.value) || 70000)}
                        placeholder="Salary"
                        className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none text-amml-text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">Roster Authorization Category</label>
                      <select 
                        value={authLevel}
                        onChange={(e) => setAuthLevel(e.target.value as any)}
                        className="w-full bg-amml-surface border border-amml-line px-2.5 py-2 rounded-lg text-sm outline-none cursor-pointer font-sans text-amml-text"
                      >
                        <option className="bg-amml-panel text-amml-text" value="SUPERVISOR">Supervisor (Roster modifications)</option>
                        <option className="bg-amml-panel text-amml-text" value="OFFICER">Officer (Logs scan only)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-lg">
                    <input 
                      type="checkbox" 
                      id="isContractCheckbox"
                      checked={isContract}
                      onChange={(e) => setIsContract(e.target.checked)}
                      className="h-4 w-4 rounded border-amml-line text-amml-blue focus:ring-amml-blue cursor-pointer"
                    />
                    <label htmlFor="isContractCheckbox" className="text-xs font-bold text-indigo-400 cursor-pointer select-none">
                      Contract Employment Status (Uses AMML-C ID prefixing)
                    </label>
                  </div>
                </div>

                {/* Section B: Federal Government Nominal Roll Service Parameters */}
                <div>
                  <span className="text-amml-blue font-bold text-[10px] uppercase tracking-wider block mb-2">Nominal Roll Service Parameters</span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">State of Origin</label>
                      <input 
                        type="text" 
                        value={stateOfOrigin}
                        onChange={(e) => setStateOfOrigin(e.target.value)}
                        placeholder="e.g. KOGI"
                        className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none text-amml-text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">Gender</label>
                      <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-amml-surface border border-amml-line px-2.5 py-2 rounded-lg text-sm outline-none cursor-pointer font-sans text-amml-text"
                      >
                        <option className="bg-amml-panel text-amml-text" value="M">Male (M)</option>
                        <option className="bg-amml-panel text-amml-text" value="F">Female (F)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">Date of Birth</label>
                      <input 
                        type="text" 
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        placeholder="e.g. 04-Apr-75"
                        className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none text-amml-text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">Grade Level & Step</label>
                      <input 
                        type="text" 
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        placeholder="e.g. MANAGER STEP 2"
                        className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none text-amml-text"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">1st Appointment Date</label>
                      <input 
                        type="text" 
                        value={dateOfFirstAppointment}
                        onChange={(e) => setDateOfFirstAppointment(e.target.value)}
                        placeholder="e.g. FEB-19-2024"
                        className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none text-amml-text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amml-text2 mb-1">Last Date of Promotion</label>
                      <input 
                        type="text" 
                        value={lastPromotionDate}
                        onChange={(e) => setLastPromotionDate(e.target.value)}
                        placeholder="e.g. JAN-1-2024"
                        className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none text-amml-text"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-bold text-amml-text2 mb-1">Academic Qualifications</label>
                    <input 
                      type="text" 
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. Bsc. COMPUTER SCIENCE"
                      className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none text-amml-text"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-bold text-amml-text2 mb-1">Professional Membership</label>
                    <textarea 
                      rows={2}
                      value={professionalMembership}
                      onChange={(e) => setProfessionalMembership(e.target.value)}
                      placeholder="e.g. NBA, IFMA, ICSAN, CITN"
                      className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none resize-none text-amml-text"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-bold text-amml-text2 mb-1">Remarks / Resignation / Inactivity reason</label>
                    <input 
                      type="text" 
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. RESIGNED MARCH 2, 2026"
                      className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue px-3 py-2 rounded-lg text-sm transition-all outline-none text-red-500 dark:text-red-400"
                    />
                  </div>
                </div>

              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-amml-line mt-6 font-sans">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-amml-surface border border-amml-line hover:bg-amml-surface2 text-amml-text2 text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-amml-blue hover:bg-amml-blue-dk text-white text-xs font-bold px-5 py-2.5 rounded-lg cursor-pointer shadow-sm transition-all"
                >
                  {isEdit ? 'Save Changes' : 'Enroll Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
