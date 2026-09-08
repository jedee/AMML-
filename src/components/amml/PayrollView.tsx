import React, { useState } from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { Download, FileSpreadsheet, Printer, Search, X } from 'lucide-react';

export const PayrollView: React.FC = () => {
  const { staff, att, settings, auditLog } = useAmmlStore();
  const [search, setSearch] = useState('');
  const [selectedStaffPayslip, setSelectedStaffPayslip] = useState<any | null>(null);

  const calculatePayrollList = () => {
    return staff.filter(s => s.active).map(s => {
      const sAtt = att.filter(a => a.staffId === s.id);
      const presentCount = sAtt.length;
      
      const absentDays = Math.max(0, 26 - presentCount); // assuming 26 base working days monthly
      
      const baseSalary = s.salary; // monthly base salary
      const dailyEquivalent = baseSalary / 26;

      const lateCount = sAtt.filter(a => a.late).length;
      
      const lateDeductions = lateCount * settings.lateDeduction;
      const absentDeductions = absentDays * dailyEquivalent * (settings.absentDeductPct / 100);
      
      const grossDeductions = lateDeductions + absentDeductions;
      const netPay = Math.max(0, baseSalary - grossDeductions);

      return {
        id: s.id,
        name: `${s.first} ${s.last}`,
        role: s.role,
        market: s.market,
        dept: s.dept,
        baseSalary,
        presentDays: presentCount,
        absentDays,
        lateFlags: lateCount,
        lateDeductions,
        absentDeductions,
        totalDeductions: grossDeductions,
        netPay,
        phone: s.phone || 'No phone'
      };
    }).filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()));
  };

  const payrollData = calculatePayrollList();

  const handleExportPayrollLedger = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Staff ID,Name,Market,Monthly Base (N),Present Days,Late Count,Absence Deductions (N),Lateness Deductions (N),Net Payable (N)\r\n';
    
    payrollData.forEach(p => {
      csvContent += `"${p.id}","${p.name}","${p.market}",${p.baseSalary},${p.presentDays},${p.lateFlags},${p.absentDeductions.toFixed(0)},${p.lateDeductions},${p.netPay.toFixed(0)}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amml_payroll_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    auditLog('SETTINGS', 'Payroll Ledger Exported', 'CSV generated for active roster');
  };

  return (
    <div className="space-y-6 animate-stage-wake">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amml-text tracking-tight">Wage compiling</h2>
          <p className="text-amml-text3 text-sm mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Estimate workforce payroll payouts, lateness penalties and absentee deductions.</span>
            <span className="inline-flex items-center bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[10px] font-mono tracking-wider font-extrabold px-2 py-0.5 rounded">
              SALARY CYCLE PERIOD: 11TH MAY – 10TH JUN 2026 (ENDS ON the 10TH)
            </span>
          </p>
        </div>
        <button 
          onClick={handleExportPayrollLedger}
          className="flex items-center gap-2 bg-amml-blue hover:bg-amml-blue-dk text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export Ledger Sheet
        </button>
      </div>

      {/* Rules Dashboard banner specs */}
      <div className="bg-amml-panel border border-amml-line rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <span className="text-amml-text3 text-[10px] font-bold uppercase tracking-wider block">Penalty per late arrival</span>
          <span className="text-xl sm:text-2xl font-serif font-extrabold text-amml-orange mt-1 block">₦{settings.lateDeduction}</span>
          <span className="text-xs text-amml-text3 block mt-1">Deducted per raw late log</span>
        </div>
        <div>
          <span className="text-amml-text3 text-[10px] font-bold uppercase tracking-wider block">Absent penalization</span>
          <span className="text-xl sm:text-2xl font-serif font-extrabold text-[#D97706] dark:text-[#FBBF24] mt-1 block">{settings.absentDeductPct}%</span>
          <span className="text-xs text-amml-text3 block mt-1">Deduction of daily equivalent pay</span>
        </div>
        <div>
          <span className="text-amml-text3 text-[10px] font-bold uppercase tracking-wider block">Standard working schedule</span>
          <span className="text-xl sm:text-2xl font-serif font-extrabold text-amml-blue mt-1 block">26 Days</span>
          <span className="text-xs text-amml-text3 block mt-1">Monthly base coefficient</span>
        </div>
        <div>
          <span className="text-amml-text3 text-[10px] font-bold uppercase tracking-wider block">Total active payroll gross</span>
          <span className="text-xl sm:text-2xl font-serif font-extrabold text-amml-green mt-1 block">
            ₦{(payrollData.reduce((acc, current) => acc + current.netPay, 0) / 1000).toFixed(0)}k
          </span>
          <span className="text-xs text-amml-text3 block mt-1">Total estimated net payable</span>
        </div>
      </div>

      {/* Payroll spreadsheet grid */}
      <div className="bg-amml-panel border border-amml-line rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-amml-line flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
          <h3 className="font-serif text-base font-bold text-amml-text">💵 Payroll Ledger Records</h3>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-amml-text3" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee payouts..."
              className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue focus:ring-1 focus:ring-amml-blue px-9 py-2 rounded-lg text-xs sm:text-sm text-amml-text outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-amml-surface2 border-b border-amml-line text-amml-text3 font-extrabold text-[11px] uppercase tracking-wider">
                <th className="p-4">Employee Node</th>
                <th className="p-4">Market Location</th>
                <th className="p-4 text-right">Base salary (₦)</th>
                <th className="p-4 text-center">Clocked Attendance</th>
                <th className="p-4 text-right">Absent Deductions</th>
                <th className="p-4 text-right">Lateness Penalties</th>
                <th className="p-4 text-right">Net Payable Pay</th>
                <th className="p-4 text-center">Receipt and Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amml-line">
              {payrollData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-amml-text3">
                    😴 No matching staff wages compiled.
                  </td>
                </tr>
              ) : (
                payrollData.map(p => (
                  <tr key={p.id} className="hover:bg-amml-surface3/40 transition-colors">
                    <td className="p-4 font-bold text-amml-text">
                      <div>{p.name}</div>
                      <span className="text-[10px] text-amml-text3 font-mono block mt-0.5">{p.id} · {p.role}</span>
                    </td>
                    <td className="p-4 text-amml-text2 text-xs font-semibold">{p.market}</td>
                    <td className="p-4 text-right font-mono text-xs text-amml-text2 font-bold">₦{p.baseSalary.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-amml-green">{p.presentDays} days</span>
                      <span className="text-amml-text3 text-xs block font-mono">absent: {p.absentDays}d</span>
                    </td>
                    <td className="p-4 text-right font-mono text-xs text-orange-600 dark:text-orange-400 font-semibold">-₦{p.absentDeductions.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="p-4 text-right font-mono text-xs text-red-600 dark:text-red-400 font-semibold">-₦{p.lateDeductions.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono text-sm font-extrabold text-amml-blue">₦{p.netPay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setSelectedStaffPayslip(p)}
                        className="bg-amml-surface border border-amml-line hover:border-amml-blue hover:text-amml-blue text-amml-text hover:bg-amml-surface2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
                      >
                        Payslip 📄
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Payslip Card view (Print mode target) */}
      {selectedStaffPayslip && (
        <div className="fixed inset-0 z-50 bg-amml-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-amml-panel border border-amml-line rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-stage-wake flex flex-col justify-between">
            <button 
              onClick={() => setSelectedStaffPayslip(null)}
              className="absolute right-4 top-4 text-amml-text3 hover:text-amml-text cursor-pointer p-1 no-print"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Payslip details grid */}
            <div className="space-y-4" id="payslip-target-print">
              <div className="text-center font-sans border-b border-dashed border-amml-line pb-4">
                <h3 className="text-lg font-serif font-extrabold text-amml-blue uppercase tracking-wider">Abuja Markets Management Limited</h3>
                <p className="text-[10px] text-amml-text3 uppercase font-semibold mt-0.5">MMIS Salary Remittance Slip</p>
                <span className="text-[10px] text-amml-text3 font-mono block mt-1">Generated date: {new Date().toISOString().slice(0, 10)}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-3.5 text-xs pb-4 border-b border-dashed border-amml-line">
                <div>
                  <span className="text-amml-text3 font-bold uppercase text-[9px]">Employee Name</span>
                  <p className="font-extrabold text-amml-text">{selectedStaffPayslip.name}</p>
                </div>
                <div>
                  <span className="text-amml-text3 font-bold uppercase text-[9px]">Staff Roster ID</span>
                  <p className="font-mono font-bold text-amml-blue">{selectedStaffPayslip.id}</p>
                </div>
                <div>
                  <span className="text-amml-text3 font-bold uppercase text-[9px]">Role / Dept</span>
                  <p className="font-semibold text-amml-text2 text-xs">{selectedStaffPayslip.role} ({selectedStaffPayslip.dept})</p>
                </div>
                <div>
                  <span className="text-amml-text3 font-bold uppercase text-[9px]">Active Location</span>
                  <p className="font-extrabold text-amml-text">{selectedStaffPayslip.market}</p>
                </div>
              </div>

              {/* Math breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-amml-text2">Monthly Base Rate Salary:</span>
                  <span className="font-mono text-amml-text">₦{selectedStaffPayslip.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-amml-line pt-2 text-orange-600 dark:text-orange-400 font-semibold">
                  <span>Absence Deduction ({selectedStaffPayslip.absentDays} Days absent):</span>
                  <span className="font-mono">-₦{selectedStaffPayslip.absentDeductions.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between border-t border-amml-line pt-1 text-red-600 dark:text-red-400 font-semibold">
                  <span>Lateness Deduction ({selectedStaffPayslip.lateFlags} Flags):</span>
                  <span className="font-mono">-₦{selectedStaffPayslip.lateDeductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-amml-line pt-4 font-extrabold text-sm text-amml-blue">
                  <span>Net remitted payout:</span>
                  <span className="font-mono text-amml-green">₦{selectedStaffPayslip.netPay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className="p-3 bg-amml-surface2 rounded-xl border border-amml-line text-[10px] text-amml-text3 leading-relaxed text-center italic mt-2">
                "Remittance computed using Abuja MMIS biometrics attendance telemetry indices. Standard ₦{settings.lateDeduction} penalty rules applied."
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-amml-line mt-6 no-print">
              <button 
                onClick={() => setSelectedStaffPayslip(null)}
                className="bg-amml-surface border border-amml-line hover:bg-amml-surface2 text-amml-text2 text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer"
              >
                Close Slip
              </button>
              <button 
                onClick={() => window.print()}
                className="bg-amml-blue hover:bg-amml-blue-dk text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm cursor-pointer"
              >
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
