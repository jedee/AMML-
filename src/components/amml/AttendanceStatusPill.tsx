import React from 'react';
import { CheckCircle2, Clock, Stethoscope, AlertTriangle, XCircle, LogOut, Calendar } from 'lucide-react';

export type AttendanceStatusType = 'Present' | 'Late' | 'Sick Leave' | 'On Leave' | 'Absent' | 'Clocked Out';

interface AttendanceStatusPillProps {
  status: AttendanceStatusType | string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AttendanceStatusPill: React.FC<AttendanceStatusPillProps> = ({
  status,
  className = '',
  showIcon = true,
  size = 'md',
}) => {
  const norm = (status || '').toLowerCase().trim();

  let isSickLeave = norm.includes('sick') || norm.includes('medical') || norm.includes('health');
  let isLeave = norm.includes('leave') || norm.includes('excused') || norm.includes('vacation');
  let isLate = norm.includes('late') || norm.includes('tardy') || norm.includes('delay');
  let isClockedOut = norm.includes('out') || norm.includes('closed');
  let isAbsent = norm.includes('absent') || norm.includes('not clocked') || norm.includes('missing');
  let isPresent = norm.includes('present') || norm.includes('on time') || norm.includes('in logged') || norm.includes('clocked in') || (!isSickLeave && !isLeave && !isLate && !isClockedOut && !isAbsent);

  // Size styling
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[9px] gap-1',
    md: 'px-2.5 py-1 text-[10px] gap-1.5',
    lg: 'px-3.5 py-1.5 text-xs gap-2',
  }[size];

  const iconSize = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  }[size];

  if (isSickLeave) {
    return (
      <span
        id={`status-pill-sick-leave`}
        className={`inline-flex items-center font-extrabold rounded-full border shadow-xs transition-all uppercase tracking-wider
          bg-sky-100 text-sky-950 border-sky-300 
          dark:bg-sky-950/90 dark:text-sky-200 dark:border-sky-500/80
          ${sizeClasses} ${className}`}
      >
        {showIcon && <Stethoscope className={`${iconSize} text-sky-700 dark:text-sky-300 shrink-0`} />}
        <span>Sick Leave</span>
      </span>
    );
  }

  if (isLeave) {
    return (
      <span
        id={`status-pill-leave`}
        className={`inline-flex items-center font-extrabold rounded-full border shadow-xs transition-all uppercase tracking-wider
          bg-purple-100 text-purple-950 border-purple-300 
          dark:bg-purple-950/90 dark:text-purple-200 dark:border-purple-500/80
          ${sizeClasses} ${className}`}
      >
        {showIcon && <Calendar className={`${iconSize} text-purple-700 dark:text-purple-300 shrink-0`} />}
        <span>On Leave</span>
      </span>
    );
  }

  if (isLate) {
    return (
      <span
        id={`status-pill-late`}
        className={`inline-flex items-center font-extrabold rounded-full border shadow-xs transition-all uppercase tracking-wider
          bg-amber-100 text-amber-950 border-amber-300 
          dark:bg-amber-950/90 dark:text-amber-200 dark:border-amber-500/80
          ${sizeClasses} ${className}`}
      >
        {showIcon && <Clock className={`${iconSize} text-amber-700 dark:text-amber-300 shrink-0`} />}
        <span>Late</span>
      </span>
    );
  }

  if (isAbsent) {
    return (
      <span
        id={`status-pill-absent`}
        className={`inline-flex items-center font-extrabold rounded-full border shadow-xs transition-all uppercase tracking-wider
          bg-rose-100 text-rose-950 border-rose-300 
          dark:bg-rose-950/90 dark:text-rose-200 dark:border-rose-500/80
          ${sizeClasses} ${className}`}
      >
        {showIcon && <XCircle className={`${iconSize} text-rose-700 dark:text-rose-300 shrink-0`} />}
        <span>Absent</span>
      </span>
    );
  }

  if (isClockedOut) {
    return (
      <span
        id={`status-pill-clocked-out`}
        className={`inline-flex items-center font-extrabold rounded-full border shadow-xs transition-all uppercase tracking-wider
          bg-indigo-100 text-indigo-950 border-indigo-300 
          dark:bg-indigo-950/90 dark:text-indigo-200 dark:border-indigo-500/80
          ${sizeClasses} ${className}`}
      >
        {showIcon && <LogOut className={`${iconSize} text-indigo-700 dark:text-indigo-300 shrink-0`} />}
        <span>Clocked Out</span>
      </span>
    );
  }

  // Default: Present
  return (
    <span
      id={`status-pill-present`}
      className={`inline-flex items-center font-extrabold rounded-full border shadow-xs transition-all uppercase tracking-wider
        bg-emerald-100 text-emerald-950 border-emerald-300 
        dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-500/80
        ${sizeClasses} ${className}`}
    >
      {showIcon && <CheckCircle2 className={`${iconSize} text-emerald-700 dark:text-emerald-300 shrink-0`} />}
      <span>Present</span>
    </span>
  );
};
