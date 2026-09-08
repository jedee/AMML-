/**
 * AMML Calendar Utility - calendarUtils.ts
 * Provides key logic to identify and exclude weekends and public holidays.
 * Helps calculate net business/active tracking days between two dates.
 */

export const PUBLIC_HOLIDAYS_LIST = [
  '2026-01-01', // New Year's Day
  '2026-03-20', // Eid al-Fitr Day 1
  '2026-03-23', // Eid al-Fitr Day 2 (observed Monday)
  '2026-04-03', // Good Friday
  '2026-04-06', // Easter Monday
  '2026-05-01', // Workers' Day
  '2026-05-27', // Eid al-Adha Day 1
  '2026-05-28', // Eid al-Adha Day 2
  '2026-06-12', // Democracy Day
  '2026-10-01', // Independence Day
  '2026-12-25', // Christmas Day
  '2026-12-26', // Boxing Day
];

/**
 * Parses date string in YYYY-MM-DD or MM/DD/YYYY format into a local Date object.
 */
export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  
  // Try YYYY-MM-DD format
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  // Try MM/DD/YYYY format
  const slashes = dateStr.split('/');
  if (slashes.length === 3) {
    const month = parseInt(slashes[0], 10) - 1;
    const day = parseInt(slashes[1], 10);
    const year = parseInt(slashes[2], 10);
    return new Date(year, month, day);
  }

  return new Date(dateStr);
}

/**
 * Checks if a Date object is a weekend.
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Checks if a Date object is a public holiday in 2026 list.
 */
export function isPublicHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  return PUBLIC_HOLIDAYS_LIST.includes(dateStr);
}

/**
 * Calculates net business days (excluding weekends and public holidays)
 * between a start date and end date (inclusive).
 */
export function calculateNetBusinessDays(startStr: string, endStr: string): number {
  try {
    const start = parseDate(startStr);
    const end = parseDate(endStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }

    if (start > end) {
      return 0;
    }

    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      if (!isWeekend(current) && !isPublicHoliday(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  } catch (e) {
    console.error("Error in calculateNetBusinessDays:", e);
    return 0;
  }
}

/**
 * Returns list of date strings (YYYY-MM-DD) indicating holidays/weekends inside a range.
 */
export function getBusinessDaysList(startStr: string, endStr: string): string[] {
  const list: string[] = [];
  try {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    
    const current = new Date(start);
    while (current <= end) {
      if (!isWeekend(current) && !isPublicHoliday(current)) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        list.push(`${y}-${m}-${d}`);
      }
      current.setDate(current.getDate() + 1);
    }
  } catch (e) {
    console.error(e);
  }
  return list;
}

/**
 * Returns exactly the list of active business days in a date range, excluding weekends and public holidays.
 */
export function getActiveBusinessDaysInRange(startDateStr: string, endDateStr: string): string[] {
  return getBusinessDaysList(startDateStr, endDateStr);
}
