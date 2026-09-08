/**
 * AMML Performance Metrics Service
 * Implements standard employee metric formulas dynamically.
 */

import { getActiveBusinessDaysInRange, parseLocalDate, isWeekend, isPublicHoliday } from './calendar';

export interface PerformanceMetricsInput {
  totalTrackedDays: number;
  weekends: number;
  publicHolidays: number;
  approvedLeaveDays: number;
  daysPresent: number;
  daysPunctual: number;
}

export interface PerformanceMetricsOutput {
  noOfDays: number;
  attendanceRate: number;
  punctualRate: number;
  cummPerformance: number;
}

/**
 * Calculates No. of Days = (total tracked days - weekends - public holidays)
 * and further deducts approved leave days so that leave does not penalize staff.
 */
export function calculateNoOfDays(
  totalTrackedDays: number,
  weekends: number,
  publicHolidays: number,
  approvedLeaveDays: number = 0
): number {
  // Formula: No. of Days = (total tracked days - weekends - public holidays) - approvedLeaveDays
  const baseWorkDays = totalTrackedDays - weekends - publicHolidays;
  const noOfDays = baseWorkDays - approvedLeaveDays;
  return Math.max(0, noOfDays);
}

/**
 * Calculates Attendance Rate % = (Days Present / No. of Days) * 100
 */
export function calculateAttendanceRate(daysPresent: number, noOfDays: number): number {
  if (noOfDays <= 0) return 100; // Safeguard if on approved leave the whole tracking period
  const rate = (daysPresent / noOfDays) * 100;
  return Math.min(100, Math.round(rate * 10) / 10); // Rounded to 1 decimal place
}

/**
 * Calculates Punctual Rate % = (Days Punctual / No. of Days) * 100
 */
export function calculatePunctualRate(daysPunctual: number, noOfDays: number): number {
  if (noOfDays <= 0) return 100; // Safeguard
  const rate = (daysPunctual / noOfDays) * 100;
  return Math.min(100, Math.round(rate * 10) / 10); // Rounded to 1 decimal place
}

/**
 * Calculates Performance % = (Attendance % + Punctual %) / 2
 */
export function calculatePerformanceRate(attendanceRate: number, punctualRate: number): number {
  const perf = (attendanceRate + punctualRate) / 2;
  return Math.round(perf);
}

/**
 * High-level orchestration function used across ledger analysis modules.
 * Dynamically computes employee performance metrics by analyzing a calendar date range.
 */
export function computeStaffMetricsForRange(
  startDateStr: string,
  endDateStr: string,
  daysPresent: number,
  daysPunctual: number,
  approvedLeaveDays: number = 0
): PerformanceMetricsOutput {
  // Generate date list and analyze range
  let totalTrackedDays = 0;
  let weekendsCount = 0;
  let holidaysCount = 0;

  try {
    const start = parseLocalDate(startDateStr);
    const end = parseLocalDate(endDateStr);
    
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
  } catch (err) {
    console.error("Error analyzing calendar for metrics:", err);
  }

  // Fallback defaults if dates are invalid
  if (totalTrackedDays === 0) {
    totalTrackedDays = 31;
    weekendsCount = 10;
    holidaysCount = 3;
  }

  const noOfDays = calculateNoOfDays(totalTrackedDays, weekendsCount, holidaysCount, approvedLeaveDays);
  
  // Adjusted days present and punctual to not exceed noOfDays
  const adjustedPresent = Math.min(daysPresent, noOfDays);
  const adjustedPunctual = Math.min(daysPunctual, adjustedPresent);

  const attendanceRate = calculateAttendanceRate(adjustedPresent, noOfDays);
  const punctualRate = calculatePunctualRate(adjustedPunctual, noOfDays);
  const cummPerformance = calculatePerformanceRate(attendanceRate, punctualRate);

  return {
    noOfDays,
    attendanceRate,
    punctualRate,
    cummPerformance
  };
}
