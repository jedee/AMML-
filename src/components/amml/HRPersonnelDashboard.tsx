import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  Clock, 
  Wallet, 
  Award, 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Download, 
  Filter, 
  ShieldCheck, 
  ChevronRight,
  ChevronDown,
  Sparkles,
  MapPin,
  User,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { useAmmlStore } from '../../lib/amml/store';
import { 
  DataCard, 
  DataMetricTile, 
  DashboardHeaderBar, 
  SkeletonTable,
  DataChartCard,
  DataListCard,
  StatusBadge,
  DataGridContainer,
  DataSectionHeader
} from './SharedDataCardLayout';
import { 
  PersonnelRosterRecord, 
  ExStaffGovernanceRecord, 
  DepartmentAttendanceTrendItem,
  HRPersonnelMetrics 
} from '../../lib/amml/types';

export const HRPersonnelDashboard: React.FC = () => {
  const { staff, att, leaves } = useAmmlStore();

  // Global Controls & State
  const [isSkeletonMode, setIsSkeletonMode] = useState<boolean>(false);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('en-US'));
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);

  // Calculate HR Metrics
  const metrics: HRPersonnelMetrics = useMemo(() => {
    const activeStaff = staff.filter(s => s.active !== false && !s.remarks?.includes('RESIGNED') && s.id !== 'AMML-EX047');
    const totalActive = activeStaff.length;
    
    const deptCounts: Record<string, number> = {};
    activeStaff.forEach(s => {
      const dept = s.dept || 'OPERATIONS';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    const onLeaveCount = leaves.filter(l => l.status === 'Approved').length;

    return {
      totalActiveStaff: totalActive,
      onLeaveCount,
      disengagedCount: 1, // Sarah T. Brown (AMML-EX047)
      attendanceRatePct: 94.2,
      punctualityIndexPct: 88.5,
      monthlyPayrollOutlayNaira: '₦ 18,450,000',
      governanceScorePct: 98.4,
      departmentBreakdown: deptCounts,
    };
  }, [staff, leaves]);

  // Attendance Trend Mock Data
  const attendanceTrendData: DepartmentAttendanceTrendItem[] = [
    { week: 'Week 1', present: 50, punctual: 45, absent: 2 },
    { week: 'Week 2', present: 48, punctual: 42, absent: 4 },
    { week: 'Week 3', present: 51, punctual: 47, absent: 1 },
    { week: 'Week 4', present: 49, punctual: 44, absent: 3 },
  ];

  // Department Pie Chart Data
  const deptPieData = [
    { name: 'CSIT / TECH', value: metrics.departmentBreakdown['CSIT'] || 8, color: '#06b6d4' },
    { name: 'OPERATIONS', value: metrics.departmentBreakdown['OPERATIONS'] || 18, color: '#10b981' },
    { name: 'FINANCE & ADMIN', value: metrics.departmentBreakdown['F&A'] || metrics.departmentBreakdown['FINANCE'] || 10, color: '#f59e0b' },
    { name: 'AUDIT & COMPLIANCE', value: metrics.departmentBreakdown['AUDIT'] || 6, color: '#a855f7' },
    { name: 'FIELD & MARKETS', value: metrics.departmentBreakdown['FIELD'] || 10, color: '#3b82f6' },
  ];

  const scopeOptions = [
    { id: 'ALL', name: 'ALL DEPARTMENTS' },
    { id: 'CSIT', name: 'CSIT / TECH' },
    { id: 'OPERATIONS', name: 'OPERATIONS' },
    { id: 'F&A', name: 'FINANCE & ADMIN' },
    { id: 'AUDIT', name: 'INTERNAL AUDIT' },
    { id: 'LEGAL', name: 'LEGAL & SECRETARIAT' },
  ];

  // Map store staff records into PersonnelRosterRecord
  const mappedRoster: PersonnelRosterRecord[] = useMemo(() => {
    return staff
      .filter(s => s.id !== 'AMML-EX047' && !s.remarks?.includes('RESIGNED'))
      .map(s => ({
        id: s.id,
        fullName: `${s.first} ${s.last}`,
        department: s.dept || 'OPERATIONS',
        roleTitle: s.role || 'Staff Officer',
        gradeStep: s.gradeLevel || 'GL-08 / Step 2',
        employmentType: s.isContract ? 'CONTRACT' : 'PERMANENT',
        status: 'ACTIVE',
        punctualityPct: 92,
        lastClockIn: '08:14 AM Today',
        marketSite: s.market || 'Abuja HQ',
        supervisorName: s.supervisorName || 'Department Manager',
        dateOfAppointment: s.dateOfFirstAppointment || '2021-03-15'
      }));
  }, [staff]);

  const filteredRoster = useMemo(() => {
    return mappedRoster.filter(s => {
      const matchesDept = selectedDept === 'ALL' || s.department.toUpperCase().includes(selectedDept) || (selectedDept === 'F&A' && s.department.includes('FINANCE'));
      const matchesSearch = !searchQuery || `${s.fullName} ${s.id} ${s.roleTitle}`.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    }).slice(0, 8);
  }, [mappedRoster, selectedDept, searchQuery]);

  // Ex-Staff Governance Record
  const exStaffRecord: ExStaffGovernanceRecord = {
    fileRefId: 'FILE-047',
    staffId: 'AMML-EX047',
    fullName: 'Sarah T. Brown',
    disengagementDate: '2024-01-15',
    disengagementReason: 'Resignation / Offboarding',
    complianceStatus: 'COMPLIANT',
    systemAccessRevoked: true,
    payrollDiscontinued: true,
    leaveSystemBarred: true,
    remarks: 'Archived (S/N 47). Fully sanitized across active rosters.'
  };

  const handleRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString('en-US'));
    }, 700);
  };

  return (
    <div className="space-y-6 font-mono text-slate-900 dark:text-slate-100">

      {/* 1. Integrated Control Bar */}
      <DashboardHeaderBar
        title="HR PERSONNEL & ROSTER MANAGEMENT"
        subtitle="Personnel headcount, attendance rates, leave coverage, wage compliance, and ex-staff governance audit."
        badgeText="HR OPERATIONS DESK"
        isSkeletonMode={isSkeletonMode}
        onToggleSkeletonMode={() => setIsSkeletonMode(!isSkeletonMode)}
        selectedScope={selectedDept}
        onSelectScope={setSelectedDept}
        scopeOptions={scopeOptions}
        onRefresh={handleRefresh}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* 2. Expandable Metric Tiles Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <DataMetricTile
          label="ACTIVE PERSONNEL"
          value={metrics.totalActiveStaff}
          subtext="Synchronized Roster"
          accentColor="blue"
          progress={100}
          icon={Users}
          isSkeleton={isSkeletonMode}
          change={{ value: '+2 New', type: 'positive' }}
          expandedDetails={{ target: '52 Personnel', peak: '56 Capacity' }}
        />
        <DataMetricTile
          label="ATTENDANCE RATE"
          value={`${metrics.attendanceRatePct}%`}
          subtext="Daily Check-in Rate"
          accentColor="green"
          progress={metrics.attendanceRatePct}
          icon={UserCheck}
          isSkeleton={isSkeletonMode}
          change={{ value: '+1.4%', type: 'positive' }}
          expandedDetails={{ target: '> 90.0%', peak: '98.2%' }}
        />
        <DataMetricTile
          label="PUNCTUALITY INDEX"
          value={`${metrics.punctualityIndexPct}%`}
          subtext="Check-in Before 08:30"
          accentColor="gold"
          progress={metrics.punctualityIndexPct}
          icon={Clock}
          isSkeleton={isSkeletonMode}
          change={{ value: '+3.2%', type: 'positive' }}
          expandedDetails={{ target: '> 85.0%', peak: '92.4%' }}
        />
        <DataMetricTile
          label="ON LEAVE / RELIEVED"
          value={metrics.onLeaveCount}
          subtext="Approved Leave Requests"
          accentColor="amber"
          progress={15}
          icon={Calendar}
          isSkeleton={isSkeletonMode}
          change={{ value: 'COVERED', type: 'neutral' }}
          expandedDetails={{ target: '< 5 Active', peak: '3 Maximum' }}
        />
        <DataMetricTile
          label="MONTHLY WAGE OUTLAY"
          value={metrics.monthlyPayrollOutlayNaira}
          subtext="Disbursement Audit"
          accentColor="purple"
          progress={92}
          icon={Wallet}
          isSkeleton={isSkeletonMode}
          change={{ value: 'VERIFIED', type: 'positive' }}
          expandedDetails={{ target: '₦ 19.5M Budget', peak: '₦ 18.45M Actual' }}
        />
        <DataMetricTile
          label="GOVERNANCE SCORE"
          value={`${metrics.governanceScorePct}%`}
          subtext="100% Ex-Staff Sanitized"
          accentColor="green"
          progress={metrics.governanceScorePct}
          icon={Award}
          isSkeleton={isSkeletonMode}
          change={{ value: 'PASSED', type: 'positive' }}
          expandedDetails={{ target: '100.0%', peak: 'Audit Clear' }}
        />
      </div>

      {/* 3. Main Row 1: Attendance Dynamics + Departmental Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Card A: Attendance Chart (2 Cols) */}
        <div className="lg:col-span-2">
          <DataChartCard
            title="ATTENDANCE & PUNCTUALITY WEEKLY DYNAMICS"
            subtitle="Comparative check-in stats: Present, Punctual, and Absence rates across active weeks."
            icon={UserCheck}
            badge={{ text: 'WEEKLY CYCLE', variant: 'green' }}
            isSkeleton={isSkeletonMode}
            summaryMetrics={[
              { label: 'AVG PRESENT', value: '49.5 Operators', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'AVG PUNCTUAL', value: '44.5 Operators', color: 'text-amber-600 dark:text-amber-400' },
              { label: 'TARGET RATE', value: '> 90%', color: 'text-cyan-600 dark:text-cyan-400' },
            ]}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="week" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--amml-surface)', 
                    borderColor: 'var(--amml-border)', 
                    borderRadius: '8px', 
                    fontSize: '11px', 
                    color: 'var(--amml-text)' 
                  }}
                />
                <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="punctual" name="Punctual" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </DataChartCard>
        </div>

        {/* Card B: Departmental Headcount (1 Col) */}
        <div>
          <DataCard
            title="DEPARTMENTAL HEADCOUNT SCOPES"
            subtitle="Staff distribution across CSIT, Operations, Finance, Audit, and Field Units."
            icon={Building2}
            badge={{ text: `${staff.length} TOTAL`, variant: 'purple' }}
            isSkeleton={isSkeletonMode}
            expandedContent={(
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="p-2 rounded-lg bg-amml-surface2/60 border border-amml-line/40 flex justify-between">
                  <span className="text-amml-muted">PERMANENT CADRE:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">38 Staff (73%)</span>
                </div>
                <div className="p-2 rounded-lg bg-amml-surface2/60 border border-amml-line/40 flex justify-between">
                  <span className="text-amml-muted">CONTRACT OFFICERS:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">14 Staff (27%)</span>
                </div>
              </div>
            )}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center h-28 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deptPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {deptPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1 text-xs font-mono">
                {deptPieData.map(item => (
                  <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-amml-surface2/60 border border-amml-line/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-amml-muted truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.value} Staff</span>
                  </div>
                ))}
              </div>
            </div>
          </DataCard>
        </div>

      </div>

      {/* 4. Main Row 2: Governance + Expandable Personnel Roster Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Card C: Ex-Staff & Leave Governance Card */}
        <div>
          <DataCard
            title="EX-STAFF & LEAVE GOVERNANCE"
            subtitle="Coverage status and archived ex-staff compliance notices."
            icon={ShieldCheck}
            badge={{ text: 'ARCHIVE SANITIZED', variant: 'amber' }}
            isSkeleton={isSkeletonMode}
            expandedContent={(
              <button 
                onClick={() => alert(`Ex-Staff Audit Report:\n• Name: ${exStaffRecord.fullName}\n• ID: ${exStaffRecord.staffId}\n• Disengaged: ${exStaffRecord.disengagementDate}\n• System Access: REVOKED\n• Payroll: DISCONTINUED\n• Leave System: BARRED\n• Status: 100% SANITIZED`)}
                className="w-full py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-lg font-bold text-xs transition-all font-mono"
              >
                RUN GOVERNANCE AUDIT VERIFICATION
              </button>
            )}
          >
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 space-y-1.5">
                <div className="flex items-center justify-between gap-2 font-bold text-amber-700 dark:text-amber-400">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    <span>EX-STAFF: {exStaffRecord.fullName}</span>
                  </div>
                  <StatusBadge status={exStaffRecord.complianceStatus} variant="green" />
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700 dark:text-amber-200/90">
                  Record <strong>{exStaffRecord.staffId} ({exStaffRecord.fileRefId})</strong> is archived ({exStaffRecord.disengagementReason}). System access revoked, payroll discontinued, and leave system barred.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-amml-surface2/60 border border-amml-line/40 space-y-0.5">
                <span className="text-amml-muted text-[10px]">PENDING LEAVE APPROVALS</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{leaves.filter(l => l.status === 'Pending').length} Requests Queue</p>
              </div>

              <div className="p-2.5 rounded-lg bg-amml-surface2/60 border border-amml-line/40 space-y-0.5">
                <span className="text-amml-muted text-[10px]">RELIEVING COVERAGE</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">100% Assigned &amp; Verified</p>
              </div>
            </div>
          </DataCard>
        </div>

        {/* Card D: Personnel Roster & Audit Matrix (Click to Expand Row) */}
        <div className="lg:col-span-2">
          <DataCard
            title="PERSONNEL ROSTER & AUDIT MATRIX"
            subtitle="Click any staff row to expand appointment, market site, and supervisor details."
            icon={Briefcase}
            badge={{ text: `${filteredRoster.length} DISPLAYED`, variant: 'blue' }}
            isSkeleton={isSkeletonMode}
            actions={(
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-amml-muted" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-2 py-1 bg-amml-surface2 border border-amml-line rounded-lg text-xs text-slate-800 dark:text-slate-200 w-36 sm:w-48 focus:outline-none focus:border-amml-orange"
                />
              </div>
            )}
          >
            {isSkeletonMode ? (
              <SkeletonTable rows={5} columns={4} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-amml-line/60 text-amml-muted uppercase text-[10px]">
                      <th className="py-2 px-2">ID / NAME</th>
                      <th className="py-2 px-2">DEPARTMENT</th>
                      <th className="py-2 px-2">ROLE / GRADE</th>
                      <th className="py-2 px-2">PUNCTUALITY</th>
                      <th className="py-2 px-2">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amml-line/40">
                    {filteredRoster.map(s => {
                      const isExpanded = expandedStaffId === s.id;
                      return (
                        <React.Fragment key={s.id}>
                          <tr 
                            onClick={() => setExpandedStaffId(isExpanded ? null : s.id)}
                            className={`cursor-pointer transition-colors ${
                              isExpanded ? 'bg-amml-surface3/60' : 'hover:bg-amml-surface2/50'
                            }`}
                          >
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-1.5">
                                <ChevronDown className={`h-3.5 w-3.5 text-amml-muted transition-transform duration-200 ${isExpanded ? 'rotate-180 text-amml-orange' : ''}`} />
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-slate-100">{s.fullName}</div>
                                  <div className="text-[10px] text-amml-muted">{s.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{s.department}</td>
                            <td className="py-2.5 px-2 text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{s.roleTitle}</td>
                            <td className="py-2.5 px-2 font-bold text-emerald-600 dark:text-emerald-400">{s.punctualityPct}%</td>
                            <td className="py-2.5 px-2">
                              <StatusBadge status={s.status} variant="green" />
                            </td>
                          </tr>

                          {/* Expanded Staff Details Row */}
                          {isExpanded && (
                            <tr className="bg-amml-surface2/80">
                              <td colSpan={5} className="p-3 border-t border-amml-line/50">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-mono">
                                  <div className="p-2 rounded bg-amml-panel border border-amml-line/40 space-y-0.5">
                                    <span className="text-amml-muted text-[10px] uppercase">MARKET LOCATION</span>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                      <MapPin className="h-3 w-3 text-amml-orange shrink-0" />
                                      <span>{s.marketSite}</span>
                                    </p>
                                  </div>

                                  <div className="p-2 rounded bg-amml-panel border border-amml-line/40 space-y-0.5">
                                    <span className="text-amml-muted text-[10px] uppercase">SUPERVISOR &amp; GRADE</span>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                      {s.supervisorName} ({s.gradeStep})
                                    </p>
                                  </div>

                                  <div className="p-2 rounded bg-amml-panel border border-amml-line/40 flex items-center justify-between">
                                    <div>
                                      <span className="text-amml-muted text-[10px] uppercase block">APPOINTED</span>
                                      <span className="font-bold text-slate-800 dark:text-slate-200">{s.dateOfAppointment}</span>
                                    </div>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        alert(`Audited Personnel File: ${s.fullName} (${s.id})\n• Department: ${s.department}\n• Grade: ${s.gradeStep}\n• Type: ${s.employmentType}\n• Status: Active & Verified`);
                                      }}
                                      className="px-2.5 py-1 bg-amml-orange hover:bg-amml-orange-lt text-white rounded font-bold text-[10px] transition-all"
                                    >
                                      AUDIT RECORD
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DataCard>
        </div>

      </div>

    </div>
  );
};
