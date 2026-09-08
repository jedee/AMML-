/**
 * AMML Performance Metrics Service - performanceMetrics.ts
 * Implements standard equations:
 * 1. No. of Days = (total tracked days - weekends - public holidays)
 * 2. Attendance % = (Days Present / No. of Days) * 100
 * 3. Punctual % = (Days Punctual / No. of Days) * 100
 * 4. Performance % = (Attendance % + Punctual %) / 2
 *
 * Dynamically excludes holiday and weekend counts provided by callers or calendar utilities.
 */

import { calculateNetBusinessDays, parseDate, isWeekend, isPublicHoliday } from './calendarUtils';

/**
 * Calculates No. of Days = total tracked - weekends - public holidays
 */
export function calculateNoOfDays(
  totalTrackedDays: number,
  weekendsCount: number,
  holidaysCount: number,
  excusedLeaveDays: number = 0
): number {
  const businessDays = totalTrackedDays - weekendsCount - holidaysCount;
  const netDays = businessDays - excusedLeaveDays;
  return Math.max(0, netDays);
}

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

/**
 * Calculates how many dynamic leave days (business days) an employee is excused for during a target range
 * based on approved and synced memos in localStorage, ensuring days do not exceed the memo's specific defined days.
 */
export function getExcusedDaysFromMemos(
  staffName: string,
  staffId: string | undefined,
  startDateStr: string,
  endDateStr: string
): number {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('amml_leave_memos') : null;
    if (!saved) return 0;
    const memos: any[] = JSON.parse(saved);
    
    const idNorm = staffId ? staffId.toUpperCase().trim() : '';
    
    const startRange = parseDate(startDateStr);
    const endRange = parseDate(endDateStr);
    if (isNaN(startRange.getTime()) || isNaN(endRange.getTime())) return 0;
    
    const excusedDates = new Set<string>();

    memos.forEach(memo => {
      if (memo.status !== 'approved' && !memo.synced) return;
      
      const mNorm = memo.to ? memo.to.toUpperCase().replace(/[-.]/g, ' ').trim() : '';
      const memoStaffId = memo.staffId ? memo.staffId.toUpperCase().trim() : '';
      
      const isNameMatch = areNamesMatching(staffName, memo.to || '', memo.market || '', "Head Office");
      const isIdMatch = idNorm && memoStaffId && idNorm === memoStaffId;
      
      if (!isNameMatch && !isIdMatch) return;
      
      // Extract days limit from memo
      let maxApprovedDays = 31; // fallback
      if (memo.approvedDays) {
        const numMatch = memo.approvedDays.match(/\d+/);
        if (numMatch) {
          maxApprovedDays = parseInt(numMatch[0], 10);
        } else if (memo.approvedDays.toUpperCase().includes("TWENTY")) {
          maxApprovedDays = 20;
        } else if (memo.approvedDays.toUpperCase().includes("TEN")) {
          maxApprovedDays = 10;
        } else if (memo.approvedDays.toUpperCase().includes("FOURTEEN")) {
          maxApprovedDays = 14;
        } else if (memo.approvedDays.toUpperCase().includes("FIVE")) {
          maxApprovedDays = 5;
        } else if (memo.approvedDays.toUpperCase().includes("THREE")) {
          maxApprovedDays = 3;
        } else if (memo.approvedDays.toUpperCase().includes("TWO")) {
          maxApprovedDays = 2;
        } else if (memo.approvedDays.toUpperCase().includes("FIFTEEN")) {
          maxApprovedDays = 15;
        }
      }
      
      let memoStart = memo.startDate ? parseDate(memo.startDate) : null;
      let memoEnd = memo.endDate ? parseDate(memo.endDate) : null;
      
      // Target ranges fallback matching
      if (!memoStart || !memoEnd) {
        if (mNorm.includes("ABIGAIL") && memo.id.includes("exam")) {
          memoStart = new Date(2026, 4, 19);
          memoEnd = new Date(2026, 4, 21);
        } else if (mNorm.includes("DANIEL") && mNorm.includes("ONOJA")) {
          memoStart = new Date(2026, 4, 1);
          memoEnd = new Date(2026, 4, 13);
        } else if (mNorm.includes("BAMOR") || mNorm.includes("GABRIEL")) {
          memoStart = new Date(2026, 4, 1);
          memoEnd = new Date(2026, 4, 11);
        } else if (mNorm.includes("NWOBODO")) {
          memoStart = new Date(2026, 4, 8);
          memoEnd = new Date(2026, 4, 31);
        } else if (mNorm.includes("ASUE") || mNorm.includes("VICTOR")) {
          memoStart = new Date(2026, 4, 4);
          memoEnd = new Date(2026, 4, 15);
        }
      }
      
      if (memoStart && memoEnd && !isNaN(memoStart.getTime()) && !isNaN(memoEnd.getTime())) {
        const currentMemoDate = new Date(memoStart);
        let addedCount = 0;
        while (currentMemoDate <= memoEnd && addedCount < maxApprovedDays) {
          if (!isWeekend(currentMemoDate) && !isPublicHoliday(currentMemoDate)) {
            if (currentMemoDate >= startRange && currentMemoDate <= endRange) {
              const y = currentMemoDate.getFullYear();
              const m = String(currentMemoDate.getMonth() + 1).padStart(2, '0');
              const d = String(currentMemoDate.getDate()).padStart(2, '0');
              excusedDates.add(`${y}-${m}-${d}`);
            }
            addedCount++;
          }
          currentMemoDate.setDate(currentMemoDate.getDate() + 1);
        }
      }
    });
    
    return excusedDates.size;
  } catch (e) {
    console.error("error checking excused days from memos", e);
    return 0;
  }
}

/**
 * Calculates Attendance % = (Days Present / No. of Days) * 100
 */
export function calculateAttendancePercentage(daysPresent: number, noOfDays: number): number {
  if (noOfDays <= 0) return 100; // Excused for entire duration -> default compliant 100%
  const rate = (daysPresent / noOfDays) * 100;
  return Math.min(100, Math.round(rate * 10) / 10);
}

/**
 * Calculates Punctual % = (Days Punctual / No. of Days) * 100
 */
export function calculatePunctualPercentage(daysPunctual: number, noOfDays: number): number {
  if (noOfDays <= 0) return 100; // Excused for entire duration -> default compliant 100%
  const rate = (daysPunctual / noOfDays) * 100;
  return Math.min(100, Math.round(rate * 10) / 10);
}

/**
 * Calculates Performance % = (Attendance % + Punctual %) / 2
 */
export function calculatePerformancePercentage(attendancePct: number, punctualPct: number): number {
  const avg = (attendancePct + punctualPct) / 2;
  return Math.round(avg);
}

/**
 * Orchestrator to calculate metrics dynamically for a staff member over a date range.
 */
export function calculateStaffMetrics(
  startDateStr: string,
  endDateStr: string,
  daysPresent: number,
  daysPunctual: number,
  excusedLeaveDays: number = 0,
  staffName?: string,
  staffId?: string
) {
  let totalTrackedDays = 0;
  let weekendsCount = 0;
  let holidaysCount = 0;

  try {
    const start = parseDate(startDateStr);
    const end = parseDate(endDateStr);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const current = new Date(start);
      while (current <= end) {
        totalTrackedDays++;
        if (isWeekend(current)) {
          weekendsCount++;
        } else if (isPublicHoliday(current)) {
          holidaysCount++;
        }
        current.setDate(current.getDate() + 1);
      }
    }
  } catch (e) {
    console.error("Error analyzing metrics:", e);
  }

  // Handle defaults in case of fallback
  if (totalTrackedDays === 0) {
    totalTrackedDays = 31;
    weekendsCount = 10;
    holidaysCount = 3;
  }

  // Dynamic calculations from approved leave memos
  let finalExcused = excusedLeaveDays;
  if (staffName && finalExcused === 0) {
    finalExcused = getExcusedDaysFromMemos(staffName, staffId, startDateStr, endDateStr);
  }

  const noOfDays = calculateNoOfDays(totalTrackedDays, weekendsCount, holidaysCount, finalExcused);
  
  // Bound actual days present and punctual to noOfDays
  const actualPresent = Math.min(daysPresent, noOfDays);
  const actualPunctual = Math.min(daysPunctual, actualPresent);

  const attendanceRate = calculateAttendancePercentage(actualPresent, noOfDays);
  const punctualRate = calculatePunctualPercentage(actualPunctual, noOfDays);
  const cummPerformance = calculatePerformancePercentage(attendanceRate, punctualRate);

  return {
    noOfDays,
    daysPresent: actualPresent,
    daysPunctual: actualPunctual,
    attendanceRate,
    punctualRate,
    cummPerformance,
    excusedDays: finalExcused
  };
}
