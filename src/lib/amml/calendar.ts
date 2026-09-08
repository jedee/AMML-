/**
 * AMML Calendar Utility
 * Identifies and filters out weekends and public holidays from any given date range.
 */

// Official/configured public holidays for 2026
export const PUBLIC_HOLIDAYS_2026 = [
  '2026-01-01', // New Year's Day
  '2026-03-20', // Eid al-Fitr Day 1
  '2026-03-23', // Eid al-Fitr Day 2 (Proposed/observed Monday)
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
 * Parses a date string in YYYY-MM-DD format to a Date object in local time.
 */
export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

/**
 * Checks if a given date is a weekend (Saturday or Sunday in local timezone).
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Checks if a given date is registered as a public holiday.
 */
export function isPublicHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  return PUBLIC_HOLIDAYS_2026.includes(dateStr);
}

/**
 * Returns a list of date strings (YYYY-MM-DD) between standard range, inclusive.
 */
export function getDateRangeList(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  try {
    const start = parseLocalDate(startDateStr);
    const end = parseLocalDate(endDateStr);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return [];
    }
    
    const current = new Date(start);
    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
    }
  } catch (e) {
    console.error("Error generating date range:", e);
  }
  return dates;
}

/**
 * Core utility function requested by ledger analysis:
 * Filters out weekends and public holidays from any given date range,
 * returning the list of active business/work days.
 */
export function getActiveBusinessDaysInRange(startDateStr: string, endDateStr: string): string[] {
  const allDates = getDateRangeList(startDateStr, endDateStr);
  return allDates.filter(dStr => {
    const dObj = parseLocalDate(dStr);
    return !isWeekend(dObj) && !isPublicHoliday(dObj);
  });
}

/**
 * Identifies and lists the detailed status of each day in a range.
 */
export function analyzeDateRange(startDateStr: string, endDateStr: string) {
  const allDates = getDateRangeList(startDateStr, endDateStr);
  let totalDays = 0;
  let weekendsCount = 0;
  let holidaysCount = 0;
  let businessDaysCount = 0;
  
  const details = allDates.map(dStr => {
    const dObj = parseLocalDate(dStr);
    const weekend = isWeekend(dObj);
    const holiday = isPublicHoliday(dObj);
    const active = !weekend && !holiday;
    
    totalDays++;
    if (weekend) weekendsCount++;
    else if (holiday) holidaysCount++;
    else businessDaysCount++;
    
    return {
      date: dStr,
      isWeekend: weekend,
      isHoliday: holiday,
      isActiveWorkday: active
    };
  });
  
  return {
    totalDays,
    weekendsCount,
    holidaysCount,
    businessDaysCount,
    details
  };
}
