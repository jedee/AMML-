import React, { useState, useMemo } from 'react';
import { 
  Calendar, UserCheck, Clock, CheckCircle, AlertTriangle, Search, Filter, 
  Plus, Trash2, X, Check, ShieldCheck, User, Eye, Phone, Briefcase, FileText,
  Download, Printer, FileSpreadsheet
} from 'lucide-react';
import { useAmmlStore } from '../../lib/amml/store';
import { AmmlLeave, AmmlStaff } from '../../lib/amml/types';
import { getDeptTagInfo, validateHROperationScope, isStaffActiveStatus, isExStaff } from '../../lib/amml/department_scopes';

export const LeaveSheetView: React.FC = () => {
  const { staff, leaves, setLeaves, session, auditLog } = useAmmlStore();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [viewingLeave, setViewingLeave] = useState<AmmlLeave | null>(null);

  // Report Generation State
  const [showReportModal, setShowReportModal] = useState(false);
  const [quarterFilter, setQuarterFilter] = useState<string>('Q3 2026');

  // Calendar State (Defaulting to July 2026 for rich mock data visibility)
  const [calendarMonth, setCalendarMonth] = useState<number>(6); // 0-indexed, 6 = July
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [showCalendar, setShowCalendar] = useState<boolean>(true);

  // Form States for New Leave Application
  const [formStaffId, setFormStaffId] = useState('');
  const [formType, setFormType] = useState<'Annual' | 'Casual' | 'Sick' | 'Maternity' | 'Study' | 'Compassionate'>('Annual');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formRelievingId, setFormRelievingId] = useState('');
  const [formReason, setFormReason] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formError, setFormError] = useState('');

  // Nigerian Public Holidays 2026 Reference (Eid, May Day, National Day, etc.)
  const holidays = useMemo(() => [
    '2026-01-01', // New Year's Day
    '2026-04-03', // Good Friday
    '2026-04-06', // Easter Monday
    '2026-05-01', // Worker's Day
    '2026-05-27', // Children's Day
    '2026-05-28', // Eid-el-Kabir
    '2026-06-12', // Democracy Day
    '2026-10-01', // Independence Day
    '2026-12-25', // Christmas Day
    '2026-12-26', // Boxing Day
  ], []);

  // Helper to calculate business days between two dates (excluding weekends & holidays)
  const calculateBusinessDays = (startStr: string, endStr: string): number => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dateString = current.toISOString().split('T')[0];
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      const isHoliday = holidays.includes(dateString);

      if (!isWeekend && !isHoliday) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  // Dynamic calculation of form duration
  const formDuration = useMemo(() => {
    return calculateBusinessDays(formStartDate, formEndDate);
  }, [formStartDate, formEndDate, holidays]);

  // Today ISO String
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Active Leaves (Currently ongoing on leave)
  const activeLeavesCount = useMemo(() => {
    return leaves.filter(lv => {
      if (lv.status !== 'Approved') return false;
      return todayStr >= lv.startDate && todayStr <= lv.endDate;
    }).length;
  }, [leaves, todayStr]);

  // Pending leaves count
  const pendingLeavesCount = useMemo(() => {
    return leaves.filter(lv => lv.status === 'Pending').length;
  }, [leaves]);

  // Leave stats cards
  const stats = useMemo(() => {
    const totalDays = leaves
      .filter(l => l.status === 'Approved' || l.status === 'Completed')
      .reduce((sum, l) => sum + l.duration, 0);

    const annualCount = leaves.filter(l => l.leaveType === 'Annual' && (l.status === 'Approved' || l.status === 'Completed')).length;
    const casualCount = leaves.filter(l => l.leaveType === 'Casual' && (l.status === 'Approved' || l.status === 'Completed')).length;

    return {
      totalDays,
      annualCount,
      casualCount,
      activeLeavesCount,
      pendingLeavesCount
    };
  }, [leaves, activeLeavesCount, pendingLeavesCount]);

  // Employee limits & allowances tracker:
  // Nigeria Civil Service Rules: Annual allowance is 28 working days, Casual allowance is 7 working days.
  const employeeLeaveBalances = useMemo(() => {
    return staff.map(st => {
      const activeStatus = isStaffActiveStatus(st.id || `${st.first} ${st.last}`);
      const isResigned = st.active === false || isExStaff(st.id) || isExStaff(`${st.first} ${st.last}`) || !activeStatus.active;

      const staffApprovedLeaves = isResigned ? [] : leaves.filter(l => l.staffId === st.id && (l.status === 'Approved' || l.status === 'Completed'));
      const annualUsed = staffApprovedLeaves.filter(l => l.leaveType === 'Annual').reduce((sum, l) => sum + l.duration, 0);
      const casualUsed = staffApprovedLeaves.filter(l => l.leaveType === 'Casual').reduce((sum, l) => sum + l.duration, 0);
      
      const isOfficer = st.authLevel === 'OFFICER';
      const annualAllowance = isResigned ? 0 : (isOfficer ? 21 : 28); // Officer grade = 21, senior/manager = 28
      const casualAllowance = isResigned ? 0 : 7;
      const tagInfo = getDeptTagInfo(st.dept, st.id, st.role);

      return {
        staffId: st.id,
        name: `${st.first} ${st.last}`,
        dept: st.dept,
        market: st.market,
        deptCode: st.deptCode || tagInfo.deptCode,
        supervisorId: st.supervisorId || tagInfo.supervisorId,
        supervisorName: st.supervisorName || tagInfo.supervisorName,
        reportingScope: st.reportingScope || tagInfo.reportingScope,
        active: !isResigned,
        annualAllowance,
        annualUsed,
        annualRemaining: Math.max(0, annualAllowance - annualUsed),
        casualAllowance,
        casualUsed,
        casualRemaining: Math.max(0, casualAllowance - casualUsed)
      };
    }).sort((a, b) => b.annualUsed - a.annualUsed);
  }, [staff, leaves]);

  // Overlap and schedule conflict checker for form/registry validation
  const scheduleConflicts = useMemo(() => {
    const conflicts: string[] = [];
    
    // Check form overlap if showApplyModal is true
    if (showApplyModal && formStaffId && formStartDate && formEndDate) {
      const selectedStaff = staff.find(s => s.id === formStaffId);
      
      // 0. Ex-Staff Active Status Verification
      if (selectedStaff) {
        const activeCheck = isStaffActiveStatus(selectedStaff.id || `${selectedStaff.first} ${selectedStaff.last}`);
        if (!selectedStaff.active || !activeCheck.active) {
          conflicts.push(`CRITICAL GOVERNANCE BLOCK: ${selectedStaff.first} ${selectedStaff.last} is an EX-STAFF (Resigned) member and is not authorized for active HR leave procedures.`);
        }
      }

      // 1. Check if employee already has approved leave overlapping these dates
      const employeeOverlaps = leaves.filter(lv => {
        if (lv.staffId !== formStaffId || lv.status === 'Rejected') return false;
        return (formStartDate <= lv.endDate && formEndDate >= lv.startDate);
      });

      if (employeeOverlaps.length > 0) {
        conflicts.push(`Personnel Duplicate Conflict: ${selectedStaff?.first} ${selectedStaff?.last} already has a ${employeeOverlaps[0].leaveType} leave scheduled between ${employeeOverlaps[0].startDate} and ${employeeOverlaps[0].endDate}.`);
      }

      // 2. Check if relieving officer is on leave during this period
      if (formRelievingId) {
        const selectedReliever = staff.find(s => s.id === formRelievingId);
        
        if (selectedReliever) {
          const relieverActiveCheck = isStaffActiveStatus(selectedReliever.id || `${selectedReliever.first} ${selectedReliever.last}`);
          if (!selectedReliever.active || !relieverActiveCheck.active) {
            conflicts.push(`EX-STAFF RELIEVER BLOCK: Designated reliever ${selectedReliever.first} ${selectedReliever.last} is an ex-staff member.`);
          }
        }

        const relieverOnLeave = leaves.filter(lv => {
          if (lv.staffId !== formRelievingId || lv.status !== 'Approved') return false;
          return (formStartDate <= lv.endDate && formEndDate >= lv.startDate);
        });

        if (relieverOnLeave.length > 0) {
          conflicts.push(`Reliever Conflict: Designated reliever ${selectedReliever?.first} ${selectedReliever?.last} will be on approved leave from ${relieverOnLeave[0].startDate} to ${relieverOnLeave[0].endDate}.`);
        }

        // Scope Governance Verification
        if (selectedStaff && selectedReliever) {
          const scopeCheck = validateHROperationScope(
            selectedStaff.dept,
            selectedReliever.dept,
            selectedReliever.id,
            `${selectedReliever.first} ${selectedReliever.last}`,
            selectedStaff.role
          );
          if (!scopeCheck.valid && scopeCheck.reason) {
            conflicts.push(`DEPARTMENTAL SCOPE WARNING: ${scopeCheck.reason}`);
          }
        }
      }

      // 3. Prevent self-relieving
      if (formStaffId === formRelievingId) {
        conflicts.push(`Self-Relieving Block: Staff cannot designate themselves as their own relieving officer.`);
      }

      // 4. Overlap warning for staff in the same department
      if (selectedStaff) {
        const tagInfo = getDeptTagInfo(selectedStaff.dept, selectedStaff.id);
        const deptOverlaps = leaves.filter(lv => {
          if (lv.staffId === formStaffId || lv.status !== 'Approved') return false;
          const itemTag = getDeptTagInfo(lv.dept, lv.staffId);
          if (itemTag.deptCode !== tagInfo.deptCode) return false;
          return (formStartDate <= lv.endDate && formEndDate >= lv.startDate);
        });

        if (deptOverlaps.length > 0) {
          conflicts.push(`⚠️ DEPARTMENT LEAVE OVERLAP ALERT [${tagInfo.deptCode}]: ${deptOverlaps.length} staff member(s) in ${selectedStaff.dept} (${deptOverlaps.map(d => d.staffName).join(', ')}) has overlapping leave dates during this window. Verify unit coverage before approval.`);
        }
      }
    }
    return conflicts;
  }, [showApplyModal, formStaffId, formStartDate, formEndDate, formRelievingId, leaves, staff]);

  // Report Generation Calculations
  const reportQuarterRange = useMemo(() => {
    let startStr = '2026-07-01';
    let endStr = '2026-09-30';
    let label = 'Q3 2026 (Jul 1 - Sep 30)';

    if (quarterFilter === 'Q1 2026') {
      startStr = '2026-01-01';
      endStr = '2026-03-31';
      label = 'Q1 2026 (Jan 1 - Mar 31)';
    } else if (quarterFilter === 'Q2 2026') {
      startStr = '2026-04-01';
      endStr = '2026-06-30';
      label = 'Q2 2026 (Apr 1 - Jun 30)';
    } else if (quarterFilter === 'Q4 2026') {
      startStr = '2026-10-01';
      endStr = '2026-12-31';
      label = 'Q4 2026 (Oct 1 - Dec 31)';
    }

    return { startStr, endStr, label };
  }, [quarterFilter]);

  const currentQuarterLeaves = useMemo(() => {
    const { startStr, endStr } = reportQuarterRange;
    return leaves.filter(lv => {
      return (lv.startDate <= endStr && lv.endDate >= startStr);
    });
  }, [leaves, reportQuarterRange]);

  const handleDownloadCSV = () => {
    const headers = [
      'Leave ID',
      'Staff ID',
      'Staff Name',
      'Department',
      'Leave Type',
      'Start Date',
      'End Date',
      'Duration (Working Days)',
      'Reliever Name',
      'Reliever ID',
      'Status',
      'Date Applied',
      'Emergency Phone',
      'Reason / Remarks',
      'Authorized Signature'
    ];
    
    const rows = currentQuarterLeaves.map(lv => [
      lv.id,
      lv.staffId,
      `"${lv.staffName.replace(/"/g, '""')}"`,
      `"${lv.dept.replace(/"/g, '""')}"`,
      lv.leaveType,
      lv.startDate,
      lv.endDate,
      lv.duration,
      `"${(lv.relievingStaffName || '').replace(/"/g, '""')}"`,
      lv.relievingStaffId || '',
      lv.status,
      lv.dateApplied,
      lv.contactPhone || '',
      `"${(lv.reason || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      lv.approvedBy || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AMML_Leave_Report_${quarterFilter.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    auditLog('LEAVE', 'Exported Leave Records', `Downloaded CSV Leave Report for ${quarterFilter}`);
  };

  const handleDownloadExcel = (recordsToExport: AmmlLeave[] = filteredLeaves, filenamePrefix: string = 'AMML_Staff_Leave_Registry_2026') => {
    const rowsHtml = recordsToExport.map((lv, index) => {
      return `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center;">${lv.sn || (index + 1)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold; color: #0f172a;">${lv.staffName || ''}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-family: monospace;">${lv.staffId || ''}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${lv.dept || ''}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; font-weight: 600;">${lv.leaveType || ''}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center;">${lv.startDate || ''}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center;">${lv.endDate || ''}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; font-weight: 500; color: #4338ca;">${lv.resumptionDate || 'N/A'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; font-weight: bold; color: #2563eb;">${lv.duration || 0}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${lv.relievingStaffName || 'N/A'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center;">${lv.status || 'Approved'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center;">${lv.leaveAllowanceStatus || 'N/A'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${(lv.reason || lv.notes || '').replace(/"/g, "'")}</td>
        </tr>
      `;
    }).join('');

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>AMML Leave Records 2026</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, Arial, sans-serif; }
          .title-header { font-size: 16pt; font-weight: bold; color: #0f5132; text-align: center; background-color: #d1e7dd; padding: 12px; }
          .sub-header { font-size: 10pt; color: #495057; text-align: center; margin-bottom: 12px; }
          th { background-color: #0f5132; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #0f5132; padding: 8px 12px; font-size: 11pt; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="13" class="title-header">ABUJA MARKETS MANAGEMENT LIMITED</td>
          </tr>
          <tr>
            <td colspan="13" class="sub-header">STAFF LEAVE & RELIEF REGISTRY LEDGER (2026 FINANCIAL CYCLE) &bull; Generated: ${new Date().toLocaleDateString()}</td>
          </tr>
          <tr><td colspan="13"></td></tr>
          <thead>
            <tr>
              <th>S/N</th>
              <th>STAFF NAME</th>
              <th>STAFF ID</th>
              <th>DEPARTMENT / UNIT</th>
              <th>LEAVE TYPE</th>
              <th>START DATE</th>
              <th>END DATE</th>
              <th>RESUMPTION DATE</th>
              <th>DURATION (DAYS)</th>
              <th>RELIEVING STAFF</th>
              <th>STATUS</th>
              <th>LEAVE ALLOWANCE</th>
              <th>REMARKS / NOTES</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filenamePrefix}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    auditLog('LEAVE', 'Exported Leave Registry to Excel', `Exported ${recordsToExport.length} leave records to ${filenamePrefix}.xls`);
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const rowsHtml = currentQuarterLeaves.map(lv => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-size: 12px; font-weight: 600; color: #1e293b;">${lv.staffName}</td>
        <td style="padding: 12px; font-size: 11px; color: #64748b;">${lv.staffId}</td>
        <td style="padding: 12px; font-size: 12px; color: #334155;">${lv.dept}</td>
        <td style="padding: 12px; font-size: 12px; font-weight: 500; color: #0f172a;">${lv.leaveType}</td>
        <td style="padding: 12px; font-size: 11px; font-family: monospace; color: #334155;">${lv.startDate} to ${lv.endDate}</td>
        <td style="padding: 12px; font-size: 12px; font-family: monospace; color: #4f46e5; font-weight: 600; text-align: center;">${lv.duration} Days</td>
        <td style="padding: 12px; font-size: 12px; color: #475569;">${lv.relievingStaffName}</td>
        <td style="padding: 12px; text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; background-color: ${
            lv.status === 'Approved' ? '#ecfdf5; color: #047857;' :
            lv.status === 'Completed' ? '#eff6ff; color: #1d4ed8;' :
            lv.status === 'Pending' ? '#fffbeb; color: #b45309;' :
            '#fef2f2; color: #b91c1c;'
          }">${lv.status}</span>
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>AMML Staff Leave Summary Report - ${quarterFilter}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: -0.5px; color: #4f46e5; }
            .meta { font-size: 12px; color: #64748b; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 12px; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; text-align: left; }
            .summary-box { display: flex; gap: 20px; margin-bottom: 20px; background-color: #f1f5f9; padding: 15px; border-radius: 8px; }
            .summary-item { flex: 1; }
            .summary-label { font-size: 10px; color: #64748b; text-transform: uppercase; }
            .summary-val { font-size: 18px; font-weight: bold; color: #0f172a; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">ABUJA MARKETS MANAGEMENT LTD</h1>
            <p class="meta">STAFF LEAVE & COVERAGE LEDGER SUMMARY REPORT • ${quarterFilter}</p>
            <p class="meta" style="margin-top: 2px;">Report Generated On: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary-box">
            <div class="summary-item">
              <div class="summary-label">Total Leave Records</div>
              <div class="summary-val">${currentQuarterLeaves.length}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Approved & Completed Leaves</div>
              <div class="summary-val">${currentQuarterLeaves.filter(l => l.status === 'Approved' || l.status === 'Completed').length}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Leave Days Spent</div>
              <div class="summary-val">${currentQuarterLeaves.reduce((acc, curr) => acc + curr.duration, 0)} Working Days</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Personnel Name</th>
                <th>Staff ID</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Leave Span</th>
                <th>Working Days</th>
                <th>Designated Reliever</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <div>Report verified by AMML Systems Administration</div>
            <div>Authorized signature: ___________________________</div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    auditLog('LEAVE', 'Dispatched PDF Report', `Dispatched official print/PDF report for ${quarterFilter}`);
  };

  const handlePrintLedgerPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const rowsHtml = filteredLeaves.map(lv => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-size: 12px; font-weight: 600; color: #1e293b;">${lv.staffName}</td>
        <td style="padding: 12px; font-size: 11px; color: #64748b;">${lv.staffId}</td>
        <td style="padding: 12px; font-size: 12px; color: #334155;">${lv.dept}</td>
        <td style="padding: 12px; font-size: 12px; font-weight: 500; color: #0f172a;">${lv.leaveType}</td>
        <td style="padding: 12px; font-size: 11px; font-family: monospace; color: #334155;">${lv.startDate} to ${lv.endDate}</td>
        <td style="padding: 12px; font-size: 12px; font-family: monospace; color: #4f46e5; font-weight: 600; text-align: center;">${lv.duration} Days</td>
        <td style="padding: 12px; font-size: 12px; color: #475569;">${lv.relievingStaffName || 'N/A'}</td>
        <td style="padding: 12px; text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; background-color: ${
            lv.status === 'Approved' ? '#ecfdf5; color: #047857;' :
            lv.status === 'Completed' ? '#eff6ff; color: #1d4ed8;' :
            lv.status === 'Pending' ? '#fffbeb; color: #b45309;' :
            '#fef2f2; color: #b91c1c;'
          }">${lv.status}</span>
        </td>
      </tr>
    `).join('');

    const filterSummary = `Search: "${searchTerm || 'All'}" • Type: "${typeFilter}" • Status: "${statusFilter}"`;

    printWindow.document.write(`
      <html>
        <head>
          <title>AMML Staff Leave & Relief Registry Ledger</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: -0.5px; color: #4f46e5; }
            .meta { font-size: 12px; color: #64748b; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 12px; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; text-align: left; }
            .summary-box { display: flex; gap: 20px; margin-bottom: 20px; background-color: #f1f5f9; padding: 15px; border-radius: 8px; }
            .summary-item { flex: 1; }
            .summary-label { font-size: 10px; color: #64748b; text-transform: uppercase; }
            .summary-val { font-size: 18px; font-weight: bold; color: #0f172a; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">ABUJA MARKETS MANAGEMENT LTD</h1>
            <p class="meta">STAFF LEAVE & RELIEF REGISTRY LEDGER REPORT</p>
            <p class="meta" style="margin-top: 2px;">Active Filters: ${filterSummary}</p>
            <p class="meta" style="margin-top: 2px;">Report Generated On: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary-box">
            <div class="summary-item">
              <div class="summary-label">Total Filtered Records</div>
              <div class="summary-val">${filteredLeaves.length}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Approved & Completed</div>
              <div class="summary-val">${filteredLeaves.filter(l => l.status === 'Approved' || l.status === 'Completed').length}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Days Spent</div>
              <div class="summary-val">${filteredLeaves.reduce((acc, curr) => acc + curr.duration, 0)} Working Days</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Personnel Name</th>
                <th>Staff ID</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Leave Span</th>
                <th>Working Days</th>
                <th>Designated Reliever</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="8" style="padding: 24px; text-align: center; color: #64748b;">No matching leave records found.</td></tr>'}
            </tbody>
          </table>
          
          <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <div>Report verified by AMML Systems Administration</div>
            <div>Authorized signature: ___________________________</div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    auditLog('LEAVE', 'Dispatched PDF Report', `Dispatched official print/PDF ledger of current filtered records`);
  };

  // Interactive Coverage Calendar Calculations
  const staffWithLeavesInMonth = useMemo(() => {
    const targetMonthStr = String(calendarMonth + 1).padStart(2, '0');
    const monthStart = `${calendarYear}-${targetMonthStr}-01`;
    const monthEnd = `${calendarYear}-${targetMonthStr}-${new Date(calendarYear, calendarMonth + 1, 0).getDate()}`;
    
    const overlappingLeaves = leaves.filter(lv => {
      if (lv.status !== 'Approved' && lv.status !== 'Completed') return false;
      // Exclude ex-staff / resigned personnel (e.g. Sarah T. Brown / AMML-EX047) from coverage calendar
      if (isExStaff(lv.staffId) || isExStaff(lv.staffName) || isExStaff(lv.relievingStaffName || '')) return false;
      const stObj = staff.find(s => s.id === lv.staffId || `${s.first} ${s.last}`.toUpperCase() === lv.staffName.toUpperCase());
      if (stObj && (stObj.active === false || isExStaff(stObj.id))) return false;

      return lv.startDate <= monthEnd && lv.endDate >= monthStart;
    });
    
    const uniqueStaffMap = new Map<string, { id: string; name: string; dept: string }>();
    overlappingLeaves.forEach(lv => {
      uniqueStaffMap.set(lv.staffId, { id: lv.staffId, name: lv.staffName, dept: lv.dept });
    });
    
    return Array.from(uniqueStaffMap.values());
  }, [leaves, calendarMonth, calendarYear, staff]);

  const daysInMonth = useMemo(() => {
    return new Date(calendarYear, calendarMonth + 1, 0).getDate();
  }, [calendarYear, calendarMonth]);

  const daysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  const getDayInfo = (day: number) => {
    const date = new Date(calendarYear, calendarMonth, day);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return {
      weekday: weekdays[dayOfWeek],
      isWeekend
    };
  };

  const getLeaveForStaffOnDay = (staffId: string, day: number) => {
    if (isExStaff(staffId)) return undefined;
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return leaves.find(lv => {
      if (lv.staffId !== staffId) return false;
      if (isExStaff(lv.staffName) || isExStaff(lv.staffId)) return false;
      if (lv.status !== 'Approved' && lv.status !== 'Completed') return false;
      return dateStr >= lv.startDate && dateStr <= lv.endDate;
    });
  };

  // Filtered Leave list
  const filteredLeaves = useMemo(() => {
    return leaves.filter(lv => {
      const matchSearch = lv.staffName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (lv.relievingStaffName && lv.relievingStaffName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          lv.dept.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'All' ? true : lv.leaveType === typeFilter;
      const matchStatus = statusFilter === 'All' ? true : lv.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [leaves, searchTerm, typeFilter, statusFilter]);

  // Apply Leave Submit handler
  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStaffId) {
      setFormError('Please select a staff member.');
      return;
    }
    if (!formStartDate || !formEndDate) {
      setFormError('Please select start and end dates.');
      return;
    }
    if (new Date(formStartDate) > new Date(formEndDate)) {
      setFormError('Start date cannot be after end date.');
      return;
    }
    if (formDuration <= 0) {
      setFormError('Leave duration cannot be 0 business days.');
      return;
    }
    if (!formRelievingId) {
      setFormError('Please assign a relieving officer.');
      return;
    }
    if (formStaffId === formRelievingId) {
      setFormError('Staff cannot designate themselves as their own relieving officer.');
      return;
    }

    const selectedStaff = staff.find(s => s.id === formStaffId);
    const selectedReliever = staff.find(s => s.id === formRelievingId);

    if (!selectedStaff || !selectedReliever) {
      setFormError('Invalid staff or reliever reference.');
      return;
    }

    // Ex-Staff Governance Block: Resigned personnel are prohibited from applying for or taking leave
    if (!selectedStaff.active || isExStaff(selectedStaff.id) || isExStaff(`${selectedStaff.first} ${selectedStaff.last}`)) {
      setFormError(`CRITICAL GOVERNANCE BLOCK: ${selectedStaff.first} ${selectedStaff.last} is an EX-STAFF (Resigned) member. Resigned personnel are strictly prohibited from applying for, approving, or taking leave.`);
      return;
    }

    if (!selectedReliever.active || isExStaff(selectedReliever.id) || isExStaff(`${selectedReliever.first} ${selectedReliever.last}`)) {
      setFormError(`RELIEVER GOVERNANCE BLOCK: Designated reliever ${selectedReliever.first} ${selectedReliever.last} is an EX-STAFF (Resigned) member and cannot act as a relieving officer.`);
      return;
    }

    // Duplicate / Overlapping Leave Check:
    const hasOverlappingLeave = leaves.some(l => 
      l.staffId === formStaffId &&
      l.status !== 'Rejected' &&
      !(formEndDate < l.startDate || formStartDate > l.endDate)
    );
    if (hasOverlappingLeave) {
      setFormError(`Duplicate Leave Error: ${selectedStaff.first} ${selectedStaff.last} already has an active or approved leave record during this date range (${formStartDate} to ${formEndDate}).`);
      return;
    }

    // Head of HR & Admin Reliever Check:
    // Head of HR & Admin (Efosa Okosun) cannot act as relieving officer for subordinate staff.
    const isHeadOfHR = (selectedReliever.role && selectedReliever.role.toUpperCase().includes('HEAD') && selectedReliever.dept.toUpperCase().includes('HR')) ||
                       (`${selectedReliever.first} ${selectedReliever.last}`.toUpperCase().includes('OKOSUN') && `${selectedReliever.first} ${selectedReliever.last}`.toUpperCase().includes('EFOSA'));
    if (isHeadOfHR) {
      setFormError(`Relieving Officer Restriction: ${selectedReliever.first} ${selectedReliever.last} (Head of HR & Admin) cannot be designated as a relieving officer for subordinate staff.`);
      return;
    }

    // Unit / Department Reliever Check:
    // Relieving officers must belong to the same unit/department as the staff member taking leave,
    // except for MD / Head of Operations, where Innocent Amaechina has authority to act as MD/Head of Operations.
    const isMDOrHeadOpsStaff = selectedStaff.dept.toUpperCase().includes('EXECUTIVE') || 
                               selectedStaff.dept.toUpperCase().includes('OPERATIONS') || 
                               (selectedStaff.role && (selectedStaff.role.toUpperCase().includes('MD') || selectedStaff.role.toUpperCase().includes('CEO')));
    const isInnocent = `${selectedReliever.first} ${selectedReliever.last}`.toUpperCase().includes('INNOCENT');

    if (selectedStaff.dept !== selectedReliever.dept && !(isMDOrHeadOpsStaff && isInnocent)) {
      setFormError(`Relieving Officer Error: ${selectedReliever.first} ${selectedReliever.last} (${selectedReliever.dept}) cannot relieve ${selectedStaff.first} ${selectedStaff.last} (${selectedStaff.dept}) because they are not in the same unit.`);
      return;
    }

    // Double check allowance limits
    const balanceObj = employeeLeaveBalances.find(b => b.staffId === formStaffId);
    if (balanceObj) {
      const remaining = formType === 'Annual' ? balanceObj.annualRemaining : balanceObj.casualRemaining;
      if (formDuration > remaining) {
        setFormError(`Insufficient Leave Balance: Selected staff only has ${remaining} days remaining of ${formType} leave, but requested ${formDuration} business days.`);
        return;
      }
    }

    const newLeave: AmmlLeave = {
      id: `leave-${Date.now()}`,
      staffId: formStaffId,
      staffName: `${selectedStaff.first} ${selectedStaff.last}`.toUpperCase(),
      dept: selectedStaff.dept,
      leaveType: formType,
      startDate: formStartDate,
      endDate: formEndDate,
      duration: formDuration,
      relievingStaffId: formRelievingId,
      relievingStaffName: `${selectedReliever.first} ${selectedReliever.last}`.toUpperCase(),
      status: 'Pending',
      reason: formReason || 'None provided',
      dateApplied: new Date().toISOString().slice(0, 10),
      contactPhone: formPhone || selectedStaff.phone || ''
    };

    setLeaves(prev => [...prev, newLeave]);
    auditLog('LEAVE', 'Applied for Leave', `Leave submitted for ${newLeave.staffName} (${newLeave.leaveType}, ${newLeave.duration} days)`);

    // Reset Form
    setFormStaffId('');
    setFormType('Annual');
    setFormStartDate('');
    setFormEndDate('');
    setFormRelievingId('');
    setFormReason('');
    setFormPhone('');
    setFormError('');
    setShowApplyModal(false);
  };

  // Status Modifiers
  const handleApproveLeave = (leaveId: string) => {
    setLeaves(prev => prev.map(l => {
      if (l.id === leaveId) {
        auditLog('LEAVE', 'Approved Leave Request', `Leave approved for ${l.staffName} (${l.leaveType})`);
        return { ...l, status: 'Approved', approvedBy: session?.name || 'Administrator' };
      }
      return l;
    }));
  };

  const handleRejectLeave = (leaveId: string) => {
    setLeaves(prev => prev.map(l => {
      if (l.id === leaveId) {
        auditLog('LEAVE', 'Rejected Leave Request', `Leave rejected for ${l.staffName} (${l.leaveType})`);
        return { ...l, status: 'Rejected' };
      }
      return l;
    }));
  };

  const handleCompleteLeave = (leaveId: string) => {
    setLeaves(prev => prev.map(l => {
      if (l.id === leaveId) {
        auditLog('LEAVE', 'Completed Leave Period', `Marked leave completed for ${l.staffName} (${l.leaveType})`);
        return { ...l, status: 'Completed' };
      }
      return l;
    }));
  };

  const handleDeleteLeave = (leaveId: string) => {
    const target = leaves.find(l => l.id === leaveId);
    if (confirm(`Are you sure you want to permanently delete this leave application for ${target?.staffName}?`)) {
      setLeaves(prev => prev.filter(l => l.id !== leaveId));
      if (target) {
        auditLog('LEAVE', 'Deleted Leave Record', `Removed leave record of ${target.staffName}`);
      }
    }
  };

  return (
    <div className="space-y-6" id="leave-sheet-view">
      {/* Title & Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm" id="leave-header-panel">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 font-sans tracking-tight">Staff Leave & Handover Registry</h1>
          <p className="text-sm text-slate-500 font-sans mt-1">
            Track annual and casual leaves, manage relief staff coverage schedules, and audit department capacity boundaries.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleDownloadExcel(filteredLeaves, 'AMML_Staff_Leave_Registry_2026')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold rounded-xl text-sm transition-all shadow-sm"
            id="btn-export-excel-top"
            title="Export all current filtered leave records to Excel"
          >
            <FileSpreadsheet size={16} className="text-emerald-700" />
            Export Excel
          </button>

          <button
            onClick={() => {
              setShowReportModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-all shadow-sm"
            id="btn-download-report"
          >
            <Download size={16} className="text-slate-500" />
            Download Report
          </button>
          
          <button
            onClick={() => {
              setFormError('');
              setShowApplyModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm"
            id="btn-apply-leave"
          >
            <Plus size={16} />
            Apply for Leave
          </button>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="leave-metrics-grid">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4" id="metric-active-leaves">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 font-mono">ACTIVE ON LEAVE</span>
            <span className="text-2xl font-semibold text-slate-900 font-sans tracking-tight mt-1 block">
              {stats.activeLeavesCount} <span className="text-sm font-normal text-slate-500">Staff</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4" id="metric-pending-leaves">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 font-mono">PENDING APPROVAL</span>
            <span className="text-2xl font-semibold text-slate-900 font-sans tracking-tight mt-1 block">
              {stats.pendingLeavesCount} <span className="text-sm font-normal text-slate-500">Applications</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4" id="metric-annual-days">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar size={24} />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 font-mono">ANNUAL LEAVES SPENT</span>
            <span className="text-2xl font-semibold text-slate-900 font-sans tracking-tight mt-1 block">
              {stats.annualCount} <span className="text-sm font-normal text-slate-500">Approved</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4" id="metric-casual-days">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Briefcase size={24} />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 font-mono">CASUAL LEAVES SPENT</span>
            <span className="text-2xl font-semibold text-slate-900 font-sans tracking-tight mt-1 block">
              {stats.casualCount} <span className="text-sm font-normal text-slate-500">Approved</span>
            </span>
          </div>
        </div>
      </div>

      {/* Visual Interactive Coverage Calendar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4" id="leave-coverage-calendar-section">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 font-sans tracking-tight">Interactive Personnel Coverage Calendar</h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">Visualizing approved overlapping staff leaves and handovers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Month selector */}
            <select
              value={calendarMonth}
              onChange={(e) => setCalendarMonth(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-indigo-600 font-medium"
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
            
            {/* Year selector */}
            <select
              value={calendarYear}
              onChange={(e) => setCalendarYear(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-indigo-600 font-medium"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
            
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all"
            >
              {showCalendar ? 'Collapse Schedule' : 'Expand Schedule'}
            </button>
          </div>
        </div>

        {showCalendar && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-100 rounded-xl custom-scrollbar relative">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 h-10 text-slate-500 text-[11px] font-medium">
                    <th className="sticky left-0 bg-slate-50 z-20 text-left px-4 min-w-[180px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                      Officer Name
                    </th>
                    {daysArray.map(day => {
                      const dayInfo = getDayInfo(day);
                      return (
                        <th 
                          key={day} 
                          className={`min-w-[36px] text-center border-r border-slate-150 last:border-0 ${dayInfo.isWeekend ? 'bg-slate-100/50 font-semibold text-indigo-900' : ''}`}
                        >
                          <div className="flex flex-col items-center">
                            <span>{day}</span>
                            <span className="text-[9px] text-slate-400 font-normal">{dayInfo.weekday}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {staffWithLeavesInMonth.length === 0 ? (
                    <tr>
                      <td colSpan={daysInMonth + 1} className="py-8 text-center text-xs text-slate-400">
                        No approved or completed staff leaves scheduled for {[
                          'January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'
                        ][calendarMonth]} {calendarYear}.
                      </td>
                    </tr>
                  ) : (
                    staffWithLeavesInMonth.map(st => (
                      <tr key={st.id} className="hover:bg-slate-50/50 transition-all border-b border-slate-100 last:border-0">
                        <td className="sticky left-0 bg-white z-10 px-4 py-3 border-r border-slate-100 font-medium shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] min-w-[180px]">
                          <div className="text-xs text-slate-800 font-semibold">{st.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{st.dept}</div>
                        </td>
                        {daysArray.map(day => {
                          const lv = getLeaveForStaffOnDay(st.id, day);
                          const dayInfo = getDayInfo(day);
                          const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          
                          if (lv) {
                            const isAnnual = lv.leaveType === 'Annual';
                            const isCasual = lv.leaveType === 'Casual';
                            
                            // Style cell
                            let bgClass = 'bg-emerald-500 hover:bg-emerald-600 text-white';
                            if (isAnnual) bgClass = 'bg-indigo-600 hover:bg-indigo-700 text-white';
                            else if (isCasual) bgClass = 'bg-purple-600 hover:bg-purple-700 text-white';
                            
                            // Check if it's the start or end of the leave bar
                            const isStartOfBar = dateStr === lv.startDate || day === 1;
                            const isEndOfBar = dateStr === lv.endDate || day === daysInMonth;
                            
                            let roundingClass = '';
                            if (isStartOfBar && isEndOfBar) roundingClass = 'rounded-md mx-1';
                            else if (isStartOfBar) roundingClass = 'rounded-l-md ml-1';
                            else if (isEndOfBar) roundingClass = 'rounded-r-md mr-1';
                            
                            return (
                              <td 
                                key={day} 
                                className={`p-0.5 border-r border-slate-100 last:border-0 ${dayInfo.isWeekend ? 'bg-slate-50' : 'bg-white'} min-w-[36px] h-12 relative group`}
                              >
                                <div className={`h-8 ${bgClass} ${roundingClass} flex items-center justify-center font-mono text-[9px] font-bold transition-all cursor-pointer relative`}>
                                  {isStartOfBar && <span className="px-1 text-[8px] truncate">{lv.leaveType[0]}</span>}
                                  
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white p-3 rounded-xl shadow-xl z-30 w-52 text-left border border-slate-800 pointer-events-none">
                                    <p className="font-semibold text-xs text-indigo-400 font-sans">{lv.staffName}</p>
                                    <p className="text-[11px] text-slate-200 mt-1 flex items-center gap-1 font-sans">
                                      <span className={`w-2 h-2 rounded-full ${isAnnual ? 'bg-indigo-500' : isCasual ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                                      {lv.leaveType} Leave ({lv.duration} Days)
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-1">Span: {lv.startDate} to {lv.endDate}</p>
                                    <p className="text-[10px] text-emerald-400 font-mono mt-0.5">Reliever: {lv.relievingStaffName}</p>
                                  </div>
                                </div>
                              </td>
                            );
                          } else {
                            return (
                              <td 
                                key={day} 
                                className={`border-r border-slate-100 last:border-0 text-center text-[10px] font-mono ${dayInfo.isWeekend ? 'bg-slate-50/80 text-slate-400' : 'bg-white text-slate-300'} min-w-[36px] h-12`}
                              >
                                •
                              </td>
                            );
                          }
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Legend bar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Legend:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600 block"></span>
                <span>Annual Leave</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-600 block"></span>
                <span>Casual Leave</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 block"></span>
                <span>Other/Special Category Leaves</span>
              </div>
              <span className="ml-auto text-[10px] text-slate-400 font-mono">
                Approved and completed records of personnel are automatically visualised.
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="leave-main-body-layout">
        {/* Left Side: Staff Allowance & Balance Tracker */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 flex flex-col max-h-[750px] overflow-hidden" id="leave-allowance-panel">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 font-sans tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={18} />
              Personnel Allowance Tracker
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Nigerian Civil Service: Annual (21–28 Days) & Casual (7 Days)
            </p>
          </div>

          <div className="overflow-y-auto space-y-3 flex-1 pr-1 custom-scrollbar">
            {employeeLeaveBalances.map(balance => (
              <div key={balance.staffId} className={`p-3 rounded-xl border transition-all space-y-2 ${!balance.active ? 'bg-rose-50/40 border-rose-100 opacity-75' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-800 font-sans">{balance.name}</h3>
                      <span className="text-[9px] bg-indigo-100 text-indigo-700 font-mono px-1.5 py-0.5 rounded font-bold">
                        {balance.deptCode}
                      </span>
                      {!balance.active && (
                        <span className="text-[9px] bg-rose-200 text-rose-800 font-bold px-1.5 py-0.5 rounded-full">
                          EX-STAFF (RESIGNED)
                        </span>
                      )}
                      {balance.staffId === 'AMML-001' && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded-full">
                          ✓ Audit Cleared (20/28 Days)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{balance.staffId} • {balance.dept}</p>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">Supervisor: <span className="font-medium text-slate-700">{balance.supervisorName}</span></p>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                    {balance.market || 'HQ'}
                  </span>
                </div>

                {/* Annual leave progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Annual Leave:</span>
                    <span className="font-medium text-slate-700 font-mono">{balance.annualUsed}/{balance.annualAllowance} Days Spent</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all" 
                      style={{ width: `${(balance.annualUsed / balance.annualAllowance) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Casual leave progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Casual Leave:</span>
                    <span className="font-medium text-slate-700 font-mono">{balance.casualUsed}/{balance.casualAllowance} Days Spent</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full transition-all" 
                      style={{ width: `${(balance.casualUsed / balance.casualAllowance) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Filters & Interactive Leaves Sheet */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col space-y-4" id="leave-list-panel">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 font-sans tracking-tight">Leave Registry & Relief Log</h2>
              <p className="text-xs text-slate-500 font-sans">Active, Pending, and historical database matching approved memos.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">{filteredLeaves.length} Records</span>
              <button
                onClick={() => handleDownloadExcel(filteredLeaves, 'AMML_Staff_Leave_Ledger')}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-200 hover:border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-[11px] transition-all shadow-sm"
                id="btn-export-ledger-excel"
              >
                <FileSpreadsheet size={13} className="text-emerald-700" />
                Export Excel
              </button>
              <button
                onClick={handlePrintLedgerPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-[11px] transition-all shadow-sm"
                id="btn-export-ledger-pdf"
              >
                <Printer size={13} />
                Export PDF
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="leave-filters-panel">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search staff, dept, reliever..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:outline-indigo-600 rounded-xl text-xs bg-slate-50 focus:bg-white transition-all font-sans"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-slate-400 shrink-0" size={14} />
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 focus:outline-indigo-600 rounded-xl text-xs font-sans"
              >
                <option value="All">All Types</option>
                <option value="Annual">Annual</option>
                <option value="Casual">Casual</option>
                <option value="Sick">Sick</option>
                <option value="Maternity">Maternity</option>
                <option value="Study">Study</option>
                <option value="Compassionate">Compassionate</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 focus:outline-indigo-600 rounded-xl text-xs font-sans"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl custom-scrollbar" id="leave-table-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="py-3 px-4 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">Employee</th>
                  <th className="py-3 px-4 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">Type & Duration</th>
                  <th className="py-3 px-4 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">Dates</th>
                  <th className="py-3 px-4 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">Relieving Staff</th>
                  <th className="py-3 px-4 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-slate-400 font-sans">
                      No matching leave records found.
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map(lv => {
                    const isOver = todayStr > lv.endDate;
                    
                    return (
                      <tr key={lv.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium font-mono text-xs">
                              {lv.staffName.slice(0, 2)}
                            </div>
                            <div>
                              <span className="block text-xs font-semibold text-slate-800">{lv.staffName}</span>
                              <span className="block text-[10px] text-slate-400 font-mono">{lv.staffId} • {lv.dept}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-700 font-semibold">{lv.leaveType}</span>
                            <span className="text-[10px] text-indigo-600 font-mono font-medium">{lv.duration} Working Days</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col text-[10px] font-mono text-slate-500">
                            <span>F: {lv.startDate}</span>
                            <span>T: {lv.endDate}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <User size={12} className="text-slate-400" />
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-600 font-medium">{lv.relievingStaffName}</span>
                              <span className="text-[9px] text-emerald-600 font-mono">Duty Reliever</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            lv.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            lv.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            lv.status === 'Completed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {lv.status}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewingLeave(lv)}
                              title="View Leave Memo Details"
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                            >
                              <Eye size={14} />
                            </button>

                            {lv.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveLeave(lv.id)}
                                  title="Approve Leave"
                                  className="p-1 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => handleRejectLeave(lv.id)}
                                  title="Reject Leave"
                                  className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            )}

                            {lv.status === 'Approved' && isOver && (
                              <button
                                onClick={() => handleCompleteLeave(lv.id)}
                                title="Mark Completed"
                                className="p-1 hover:bg-blue-50 text-indigo-500 hover:text-indigo-600 rounded-lg transition-colors"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteLeave(lv.id)}
                              title="Delete Leave Record"
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* VIEW LEAVE MODAL DETAILS */}
      {viewingLeave && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <span className="text-[10px] uppercase font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">
                  OFFICIAL LEAVE RECORD MEMO
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 font-sans">{viewingLeave.staffName}</h3>
              </div>
              <button 
                onClick={() => setViewingLeave(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans text-slate-600 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block font-mono">STAFF REGISTER ID</span>
                  <span className="font-semibold text-slate-800">{viewingLeave.staffId} {viewingLeave.sn ? `(S/N ${viewingLeave.sn})` : ''}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">DEPARTMENT / UNIT</span>
                  <span className="font-semibold text-slate-800">{viewingLeave.dept}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">LEAVE TYPE CATEGORY</span>
                  <span className="font-semibold text-slate-800">{viewingLeave.leaveType} Leave</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">BUSINESS DAYS LENGTH</span>
                  <span className="font-bold text-indigo-600 font-mono text-sm">{viewingLeave.duration} Working Days</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">START DATE</span>
                  <span className="font-semibold text-slate-800">{viewingLeave.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">END DATE</span>
                  <span className="font-semibold text-slate-800">{viewingLeave.endDate}</span>
                </div>
                {viewingLeave.resumptionDate && (
                  <div>
                    <span className="text-slate-400 block font-mono">RESUMPTION DATE</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block mt-0.5">{viewingLeave.resumptionDate}</span>
                  </div>
                )}
                {viewingLeave.leaveAllowanceStatus && (
                  <div>
                    <span className="text-slate-400 block font-mono">LEAVE ALLOWANCE</span>
                    <span className="font-semibold text-slate-800">{viewingLeave.leaveAllowanceStatus}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                <h4 className="font-semibold text-slate-800 font-sans flex items-center gap-1.5">
                  <UserCheck size={14} className="text-indigo-600" />
                  Designated Handover Cover
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-mono">DUTY RELIEVER</span>
                    <span className="font-semibold text-slate-800">{viewingLeave.relievingStaffName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono">RELIEVER ID</span>
                    <span className="font-mono text-slate-600">{viewingLeave.relievingStaffId}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 block font-mono">DETAILED REASON / COVERAGE REMARKS</span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 italic text-slate-700 leading-relaxed">
                  "{viewingLeave.reason}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block font-mono">DATE FILED / APPLIED</span>
                  <span>{viewingLeave.dateApplied}</span>
                </div>
                {viewingLeave.approvedBy && (
                  <div>
                    <span className="text-slate-400 block font-mono">AUTHORIZED SIGNATURE</span>
                    <span className="font-semibold text-emerald-600">{viewingLeave.approvedBy}</span>
                  </div>
                )}
                {viewingLeave.contactPhone && (
                  <div>
                    <span className="text-slate-400 block font-mono">EMERGENCY PHONE</span>
                    <span className="font-mono flex items-center gap-1 mt-0.5">
                      <Phone size={10} /> {viewingLeave.contactPhone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setViewingLeave(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl text-xs transition-all"
              >
                Close Memo View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLY FOR LEAVE MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-sans">Apply for Staff Leave</h3>
                <p className="text-xs text-slate-500 mt-0.5">Create a formal leave period, calculate exact business days, and link relief duty handover.</p>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Schedule conflicts checker */}
              {scheduleConflicts.length > 0 && (
                <div className="p-3.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-[11px] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                    <AlertTriangle size={14} />
                    <span>Real-time Schedule Conflict Audit</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    {scheduleConflicts.map((conf, index) => (
                      <li key={index}>{conf}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee selection */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600 font-mono">APPLICANT EMPLOYEE</label>
                  <select
                    value={formStaffId}
                    onChange={e => {
                      setFormStaffId(e.target.value);
                      const sel = staff.find(s => s.id === e.target.value);
                      if (sel && sel.phone) setFormPhone(sel.phone);
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-indigo-600 transition-all font-sans"
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {staff.map(s => {
                      const isEx = s.active === false || isExStaff(s.id) || isExStaff(`${s.first} ${s.last}`);
                      const tag = getDeptTagInfo(s.dept, s.id, s.role);
                      return (
                        <option key={s.id} value={s.id} disabled={isEx}>
                          {s.last.toUpperCase()} {s.first.toUpperCase()} ({s.id} • [{tag.deptCode}] {s.dept}) {isEx ? '— EX-STAFF (RESIGNED / INELIGIBLE FOR LEAVE)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Leave type */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600 font-mono">LEAVE CATEGORY TYPE</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-indigo-600 transition-all font-sans"
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                    <option value="Study">Study Leave</option>
                    <option value="Compassionate">Compassionate Leave</option>
                  </select>
                </div>

                {/* Department Governance Tag info card */}
                {formStaffId && (() => {
                  const s = staff.find(st => st.id === formStaffId);
                  if (!s) return null;
                  const tag = getDeptTagInfo(s.dept, s.id, s.role);
                  return (
                    <div className="md:col-span-2 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-indigo-900 font-sans flex items-center gap-1.5">
                          <ShieldCheck size={14} className="text-indigo-600" />
                          Departmental Governance Scope Tag
                        </span>
                        <span className="bg-indigo-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {tag.deptCode}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
                        <div>Direct Supervisor: <span className="font-semibold text-slate-900 font-mono">{tag.supervisorName}</span></div>
                        <div>Reporting Scope: <span className="text-indigo-800 font-medium">{tag.reportingScope}</span></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Dates */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600 font-mono">START DATE</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-indigo-600 transition-all font-sans"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600 font-mono">END DATE (INCLUSIVE)</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-indigo-600 transition-all font-sans"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Calculation Info */}
              {formStartDate && formEndDate && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-indigo-900 block font-sans">Calculated True Civil Duration</span>
                    <span className="text-[10px] text-slate-500 font-sans">Excluding weekends and Nigerian public holidays</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-indigo-700 font-mono block">{formDuration} Days</span>
                    <span className="text-[9px] text-indigo-500 font-mono">Approved Business Span</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Relieving staff */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600 font-mono">HANDOVER RELIEVING OFFICER</label>
                  <select
                    value={formRelievingId}
                    onChange={e => setFormRelievingId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-indigo-600 transition-all font-sans"
                    required
                  >
                    <option value="">-- Assign Reliever --</option>
                    {staff
                      .filter(s => s.id !== formStaffId && s.active !== false && !isExStaff(s.id) && !isExStaff(`${s.first} ${s.last}`)) // exclude self & inactive/ex-staff
                      .map(s => {
                        const tag = getDeptTagInfo(s.dept, s.id, s.role);
                        return (
                          <option key={s.id} value={s.id}>
                            {s.last.toUpperCase()} {s.first.toUpperCase()} ({s.id} • [{tag.deptCode}] {s.dept})
                          </option>
                        );
                      })}
                  </select>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600 font-mono">EMERGENCY PHONE NUMBER</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="Enter phone..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-indigo-600 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Leave Reason */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 font-mono">REASON FOR APPLICATION / REMARKS</label>
                <textarea
                  value={formReason}
                  onChange={e => setFormReason(e.target.value)}
                  placeholder="Details of assignments handed over, reason for emergency leaves, destination state, etc..."
                  rows={3}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-indigo-600 transition-all font-sans resize-none"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-all shadow-sm"
                >
                  File Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOWNLOAD / PRINT QUARTERLY REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-sans">Generate Quarterly Staff Leave Report</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate official structured CSV data or render high-fidelity print/PDF ledgers.
                </p>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 font-mono">SELECT TARGET QUARTER</label>
                  <select
                    value={quarterFilter}
                    onChange={(e) => setQuarterFilter(e.target.value)}
                    className="p-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-indigo-600 font-sans"
                  >
                    <option value="Q1 2026">Q1 2026 (Jan 1 - Mar 31)</option>
                    <option value="Q2 2026">Q2 2026 (Apr 1 - Jun 30)</option>
                    <option value="Q3 2026">Q3 2026 (Jul 1 - Sep 30)</option>
                    <option value="Q4 2026">Q4 2026 (Oct 1 - Dec 31)</option>
                  </select>
                </div>
                
                <div className="text-right flex flex-col sm:items-end justify-center font-sans">
                  <span className="text-[11px] text-slate-500 uppercase font-mono">Quarter Summary</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5">
                    {currentQuarterLeaves.length} Matching Records
                  </span>
                  <span className="text-[11px] text-indigo-600 font-semibold font-mono mt-0.5">
                    {currentQuarterLeaves.reduce((sum, l) => sum + l.duration, 0)} Total Working Days
                  </span>
                </div>
              </div>

              {/* Preview table */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono">
                  Report Preview ({quarterFilter})
                </h4>
                <div className="border border-slate-100 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium h-9">
                        <th className="px-4 py-2 font-mono">STAFF</th>
                        <th className="px-4 py-2 font-mono">TYPE</th>
                        <th className="px-4 py-2 font-mono">DATES</th>
                        <th className="px-4 py-2 font-mono text-center">DAYS</th>
                        <th className="px-4 py-2 font-mono">RELIEVER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentQuarterLeaves.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400">
                            No leave applications on file for this quarter.
                          </td>
                        </tr>
                      ) : (
                        currentQuarterLeaves.map(lv => (
                          <tr key={lv.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-semibold text-slate-800">
                              <div>{lv.staffName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{lv.staffId}</div>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                lv.leaveType === 'Annual' ? 'bg-indigo-50 text-indigo-700' :
                                lv.leaveType === 'Casual' ? 'bg-purple-50 text-purple-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {lv.leaveType}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-500 font-mono text-[10px]">
                              {lv.startDate} to {lv.endDate}
                            </td>
                            <td className="px-4 py-2.5 text-center font-bold font-mono text-indigo-600">
                              {lv.duration}
                            </td>
                            <td className="px-4 py-2.5 text-slate-600">
                              {lv.relievingStaffName}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[11px] text-slate-400 font-mono">
                Abuja Markets Management Limited official registry tool.
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-medium rounded-xl text-xs transition-all flex-1 sm:flex-none text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadExcel(currentQuarterLeaves, `AMML_Leave_Report_${quarterFilter.replace(' ', '_')}`)}
                  disabled={currentQuarterLeaves.length === 0}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                >
                  <FileSpreadsheet size={14} />
                  Export Excel
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  disabled={currentQuarterLeaves.length === 0}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                >
                  <Download size={14} />
                  Download CSV
                </button>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  disabled={currentQuarterLeaves.length === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                >
                  <Printer size={14} />
                  Print / PDF Ledger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
