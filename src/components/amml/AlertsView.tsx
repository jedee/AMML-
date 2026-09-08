import React from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { AlertCircle, ShieldAlert, Cpu, HardDrive, Bell } from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { devices, staff, att } = useAmmlStore();
  const todayStr = new Date().toISOString().slice(0, 10);
  const todAtt = att.filter(a => a.date === todayStr);

  const totalStaffCount = staff.filter(s => s.active).length;
  const presentCount = new Set(todAtt.map(a => a.staffId)).size;
  const offlineNodes = devices.filter(d => !d.active);

  return (
    <div className="space-y-6 animate-stage-wake">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amml-text tracking-tight">Active Notices</h2>
        <p className="text-amml-text3 text-sm mt-1">Real-time alerts, critical biometrics hardware status and compliance reports</p>
      </div>

      {/* Grid status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Device Failures */}
        <div className="bg-amml-panel border border-amml-line p-5 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-red-500 font-extrabold text-xs tracking-wider uppercase">
            <ShieldAlert className="h-4 w-4" /> Biometrics fail blocks
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-extrabold text-amml-text">
            {offlineNodes.length} Nodes Offline
          </div>
          <p className="text-xs text-amml-text3">
            Offline hardware nodes are quarantined and failing to report check-in events.
          </p>
          <div className="space-y-1.5 pt-2">
            {offlineNodes.length === 0 ? (
              <p className="text-xs text-amml-green bg-amml-green/10 p-2 border rounded border-amml-green/20 font-semibold font-sans">✅ All registered biometric scanners are online.</p>
            ) : (
              offlineNodes.map(d => (
                <div key={d.id} className="text-[11px] font-mono p-1.5 bg-red-500/10 border border-red-500/20 rounded text-red-500 font-semibold">
                  ⚠️ {d.name} ({d.market})
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attendance levels compliance */}
        <div className="bg-amml-panel border border-amml-line p-5 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-500 font-extrabold text-xs tracking-wider uppercase">
            <Bell className="h-4 w-4" /> compliance warnings
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-extrabold text-amml-text">
            {Math.max(0, totalStaffCount - presentCount)} Unrecorded Staff
          </div>
          <p className="text-xs text-amml-text3">
            Active staff members not logged present for today's operational window.
          </p>
          <div className="pt-2">
            {totalStaffCount === presentCount ? (
              <p className="text-xs text-amml-green bg-amml-green/10 p-2 border rounded border-amml-green/20 font-semibold">✅ 100% staff attendance logged present.</p>
            ) : (
              <p className="text-xs text-amber-500 bg-amber-500/10 p-2 border border-amber-500/20 rounded font-semibold">
                ⚠️ Absence rate estimated at {Math.round(((totalStaffCount - presentCount) / totalStaffCount) * 100)}% today.
              </p>
            )}
          </div>
        </div>

        {/* Operations Advisory */}
        <div className="bg-amml-panel border border-amml-line p-5 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amml-blue font-extrabold text-xs tracking-wider uppercase">
            <Cpu className="h-4 w-4" /> Operations advises
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-extrabold text-amml-text">
            Normal System
          </div>
          <p className="text-xs text-amml-text3">
            Local database syncing is operational. Background clock pings are flowing cleanly.
          </p>
          <div className="pt-2">
            <p className="text-xs text-amml-green bg-amml-green/10 p-2 rounded border border-amml-green/20 font-semibold">
              📊 All FCT Abuja server channels healthy.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
