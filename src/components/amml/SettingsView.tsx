import React, { useState } from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { Save, Settings, Trash2, ShieldAlert } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, saveAttSettings, savePaySettings, dbClear, auditLog } = useAmmlStore();

  // Form states
  const [startTime, setStartTime] = useState(settings.startTime);
  const [endTime, setEndTime] = useState(settings.endTime);
  const [lateMinutes, setLateMinutes] = useState(settings.lateMinutes);
  const [minHours, setMinHours] = useState(settings.minHours);

  const [dailyRate, setDailyRate] = useState(settings.dailyRate);
  const [lateDeduction, setLateDeduction] = useState(settings.lateDeduction);
  const [absentDeductPct, setAbsentDeductPct] = useState(settings.absentDeductPct);

  const handleSaveAttendanceRules = (e: React.FormEvent) => {
    e.preventDefault();
    saveAttSettings({ startTime, endTime, lateMinutes, minHours });
    alert('Attendance policy settings updated successfully.');
  };

  const handleSavePayrollRules = (e: React.FormEvent) => {
    e.preventDefault();
    savePaySettings({ dailyRate, lateDeduction, absentDeductPct });
    alert('Payroll deductions formula settings locked successfully.');
  };

  const executeHardReset = () => {
    if (window.confirm('🚨 CRITICAL ACTION: Wipe all local state databases, custom logs enrollments, and reload the initial Abuja master directory? Any unsaved edits will be completely deleted.')) {
      dbClear();
      auditLog('SETTINGS', 'Database Wipe Triggered', 'Local state restored to original Abuja MMIS directory templates.');
      alert('Local state database cleared. Roster reloaded.');
    }
  };

  return (
    <div className="space-y-6 animate-stage-wake">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amml-text tracking-tight">System configuration</h2>
        <p className="text-amml-text3 text-sm mt-1">Set work shift margins, lateness multipliers, payroll offsets, and database resets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attendance Policy Forms */}
        <div className="bg-amml-panel border border-amml-line rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-sm sm:text-base font-bold text-amml-text flex items-center gap-2">
            ⚠️ Work Schedule & Lateness Policies
          </h3>
          <p className="text-xs text-amml-text3">Configure shift thresholds. Staff arriving after starting threshold + late margins are flagged.</p>
          
          <form onSubmit={handleSaveAttendanceRules} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Standard Start Time</label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-amml-surface border border-amml-line text-amml-text px-3 py-2 rounded-lg text-sm transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Standard Close Time</label>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-amml-surface border border-amml-line text-amml-text px-3 py-2 rounded-lg text-sm transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Late Arrivals Margin (Mins)</label>
                <input 
                  type="number" 
                  value={lateMinutes}
                  onChange={(e) => setLateMinutes(parseInt(e.target.value) || 0)}
                  className="w-full bg-amml-surface border border-amml-line text-amml-text px-3 py-2 rounded-lg text-sm transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Min Shift Hours Required</label>
                <input 
                  type="number" 
                  value={minHours}
                  onChange={(e) => setMinHours(parseInt(e.target.value) || 0)}
                  className="w-full bg-amml-surface border border-amml-line text-amml-text px-3 py-2 rounded-lg text-sm transition-all outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-amml-line flex justify-end">
              <button 
                type="submit"
                className="flex items-center gap-1.5 bg-amml-blue hover:bg-amml-blue-dk text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-all shadow-sm"
              >
                <Save className="h-3.5 w-3.5" /> Save Roster Rules
              </button>
            </div>
          </form>
        </div>

        {/* Payroll Policy Forms */}
        <div className="bg-amml-panel border border-amml-line rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-sm sm:text-base font-bold text-amml-text flex items-center gap-2">
            💵 Payroll Coefficients & Deductions
          </h3>
          <p className="text-xs text-amml-text3">Specify penalties applied during wage compilation. These variables lock payslips calculations.</p>
          
          <form onSubmit={handleSavePayrollRules} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Representative Daily Rate (₦)</label>
                <input 
                  type="number" 
                  value={dailyRate}
                  onChange={(e) => setDailyRate(parseInt(e.target.value) || 0)}
                  className="w-full bg-amml-surface border border-amml-line text-amml-text px-3 py-2 rounded-lg text-sm transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amml-text2 mb-1">Lateness Deduction Penalty (₦)</label>
                <input 
                  type="number" 
                  value={lateDeduction}
                  onChange={(e) => setLateDeduction(parseInt(e.target.value) || 0)}
                  className="w-full bg-amml-surface border border-amml-line text-amml-text px-3 py-2 rounded-lg text-sm transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amml-text2 mb-1">Absence Penalty Scale (%)</label>
              <select 
                value={absentDeductPct}
                onChange={(e) => setAbsentDeductPct(parseInt(e.target.value) || 0)}
                className="w-full bg-amml-surface border border-amml-line text-amml-text px-2.5 py-2.5 rounded-lg text-sm outline-none cursor-pointer"
              >
                <option className="bg-amml-panel text-amml-text" value={100}>100% (No pay for absent days)</option>
                <option className="bg-amml-panel text-amml-text" value={150}>150% (Surcharge absent days)</option>
                <option className="bg-amml-panel text-amml-text" value={50}>50% (Half pay on excuse absentees)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-amml-line flex justify-end">
              <button 
                type="submit"
                className="flex items-center gap-1.5 bg-amml-blue hover:bg-amml-blue-dk text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-all shadow-sm"
              >
                <Save className="h-3.5 w-3.5" /> Save Payout Policies
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Database Hard Clear */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-sm sm:text-base font-bold text-red-500 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 animate-pulse" /> Danger Area
        </h3>
        <p className="text-xs text-red-500/90 font-medium">
          Resetting database completely wipes local store indices and restores Abuja registered markets/staff. This is irreversible. Use with caution.
        </p>
        <button 
          onClick={executeHardReset}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm cursor-pointer"
        >
          <Trash2 className="h-4 w-4" /> Clear & Restore Seed Database
        </button>
      </div>

    </div>
  );
};
