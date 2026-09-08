import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Download, MapPin, Calendar, ShieldCheck, 
  Search, Sliders, CheckCircle, FileSpreadsheet, Upload,
  AlertCircle, TrendingUp, X, FileText, Check
} from 'lucide-react';
import { may2026StaffAttendance, MayStaffAttendance, isStaffLateOnDay, getVerticalSpelling } from '../../lib/amml/may_attendance_data';
import { march2026StaffAttendance, MarchStaffAttendance } from '../../lib/amml/march_attendance_data';
import { getJuneStaffAttendance, june2026DailyLogs, july2026DailyLogs } from '../../lib/amml/june_attendance_data';
import { LeaveMemo } from './ReportsView';
import { calculateNoOfDays, calculateAttendancePercentage, calculatePunctualPercentage, calculatePerformancePercentage } from '../../lib/amml/performanceMetrics';
import { calculateNetBusinessDays } from '../../lib/amml/calendarUtils';
import { MEMO_FILING_GUIDELINES, MemoClassificationCode } from '../../lib/amml/adminHrTypes';

interface May2026AuditSectionProps {
  search: string;
  setSearch: (val: string) => void;
  mayInnerTab: 'analytical' | 'grid' | 'excel';
  setMayInnerTab: (val: 'analytical' | 'grid' | 'excel') => void;
  onNavigateToMemo?: (memoId: string) => void;
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

export const May2026AuditSection: React.FC<May2026AuditSectionProps> = ({
  search,
  setSearch,
  mayInnerTab,
  setMayInnerTab,
  onNavigateToMemo
}) => {
  const [memos, setMemos] = useState<LeaveMemo[]>([]);
  const [auditMonth, setAuditMonth] = useState<'march' | 'may' | 'june' | 'july'>('july');
  const [periodType, setPeriodType] = useState<'salary' | 'calendar'>('salary');
  
  // State for hover tooltip popup
  const [hoveredCell, setHoveredCell] = useState<{
    staffName: string;
    dayNum: number;
    memo: LeaveMemo;
    x: number;
    y: number;
  } | null>(null);

  // Excel Paste upload state
  const [pastedRosterText, setPastedRosterText] = useState<string>('');
  const [parsedRosterResult, setParsedRosterResult] = useState<any[] | null>(null);
  const [excelAuditAlerts, setExcelAuditAlerts] = useState<string[]>([]);
  const [excelAuditMonth, setExcelAuditMonth] = useState<'march' | 'may'>('may');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Load live leaf registry to check for excused days
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('amml_leave_memos');
      if (saved) {
        try {
          setMemos(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    // Poll localstorage periodically to keep tabs completely synchronized
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const getPeriodDays = (): {
    date: Date;
    dayNum: number;
    label: string;
    monthLabel: string;
    isWeekend: boolean;
    isHoliday: boolean;
    isWorkday: boolean;
  }[] => {
    const days: {
      date: Date;
      dayNum: number;
      label: string;
      monthLabel: string;
      isWeekend: boolean;
      isHoliday: boolean;
      isWorkday: boolean;
    }[] = [];
    
    if (auditMonth === 'june') {
      if (periodType === 'calendar') {
        // June 1 to June 30, 2026
        for (let d = 1; d <= 30; d++) {
          const date = new Date(2026, 5, d); // June
          const isWk = date.getDay() === 0 || date.getDay() === 6;
          const isHol = d === 12; // Democracy Day
          days.push({
            date,
            dayNum: d,
            label: `${d}`,
            monthLabel: 'Jun',
            isWeekend: isWk,
            isHoliday: isHol,
            isWorkday: !isWk && !isHol
          });
        }
      } else {
        // June Salary Period: June 11 to June 30, 2026
        for (let d = 11; d <= 30; d++) {
          const date = new Date(2026, 5, d); // June
          const isWk = date.getDay() === 0 || date.getDay() === 6;
          const isHol = d === 12;
          days.push({
            date,
            dayNum: d,
            label: `${d}`,
            monthLabel: 'Jun',
            isWeekend: isWk,
            isHoliday: isHol,
            isWorkday: !isWk && !isHol
          });
        }
        // July 1 to July 10, 2026
        for (let d = 1; d <= 10; d++) {
          const date = new Date(2026, 6, d); // July
          const isWk = date.getDay() === 0 || date.getDay() === 6;
          const isHol = false;
          days.push({
            date,
            dayNum: d,
            label: `${d}`,
            monthLabel: 'Jul',
            isWeekend: isWk,
            isHoliday: isHol,
            isWorkday: !isWk && !isHol
          });
        }
      }
    } else if (auditMonth === 'may') {
      if (periodType === 'calendar') {
        // May 1 to May 31, 2026
        for (let d = 1; d <= 31; d++) {
          const date = new Date(2026, 4, d); // May
          const isWk = date.getDay() === 0 || date.getDay() === 6;
          const isHol = d === 1 || d === 27 || d === 28;
          days.push({
            date,
            dayNum: d,
            label: `${d}`,
            monthLabel: 'May',
            isWeekend: isWk,
            isHoliday: isHol,
            isWorkday: !isWk && !isHol
          });
        }
      } else {
        // May Salary Period: May 11 to May 31, 2026
        for (let d = 11; d <= 31; d++) {
          const date = new Date(2026, 4, d); // May
          const isWk = date.getDay() === 0 || date.getDay() === 6;
          const isHol = d === 27 || d === 28;
          days.push({
            date,
            dayNum: d,
            label: `${d}`,
            monthLabel: 'May',
            isWeekend: isWk,
            isHoliday: isHol,
            isWorkday: !isWk && !isHol
          });
        }
        // June 1 to June 10, 2026
        for (let d = 1; d <= 10; d++) {
          const date = new Date(2026, 5, d); // June
          const isWk = date.getDay() === 0 || date.getDay() === 6;
          const isHol = false;
          days.push({
            date,
            dayNum: d,
            label: `${d}`,
            monthLabel: 'Jun',
            isWeekend: isWk,
            isHoliday: isHol,
            isWorkday: !isWk && !isHol
          });
        }
      }
    } else {
      // March Month
      if (periodType === 'calendar') {
        // March 1 to March 31, 2026
        for (let d = 1; d <= 31; d++) {
          const date = new Date(2026, 2, d); // March
          const isWk = date.getDay() === 0 || date.getDay() === 6;
          const isHol = d === 20 || d === 23;
          days.push({
            date,
            dayNum: d,
            label: `${d}`,
            monthLabel: 'Mar',
            isWeekend: isWk,
            isHoliday: isHol,
            isWorkday: !isWk && !isHol
          });
        }
      } else {
        // March Salary Period: Feb 11 to Feb 28, 2026
        for (let d = 11; d <= 28; d++) {
          const date = new Date(2026, 1, d); // Feb
          const isWk = date.getDay() === 0 || date.getDay() === 6;
          const isHol = false;
          days.push({
            date,
            dayNum: d,
            label: `${d}`,
            monthLabel: 'Feb',
            isWeekend: isWk,
            isHoliday: isHol,
            isWorkday: !isWk && !isHol
          });
        }
        // March 1 to March 10, 2026
        for (let d = 1; d <= 10; d++) {
          const date = new Date(2026, 2, d); // March
          const isWk = date.getDay() === 0 || date.getDay() === 6;
          const isHol = false;
          days.push({
            date,
            dayNum: d,
            label: `${d}`,
            monthLabel: 'Mar',
            isWeekend: isWk,
            isHoliday: isHol,
            isWorkday: !isWk && !isHol
          });
        }
      }
    }
    return days;
  };

  // Helper date checker inside March/May 2026 for grid rendering
  const isStaffOnLeaveOnDate = (staffName: string, date: Date) => {
    const dayNum = date.getDate();
    const monthIndex = date.getMonth(); // 1 = Feb, 2 = Mar, 4 = May, 5 = Jun
    
    return memos.some(memo => {
      if (memo.status !== 'approved' && !memo.synced) return false;
      
      if (!areNamesMatching(staffName, memo.to, memo.market, "Head Office")) return false;
      
      const mNorm = memo.to.toUpperCase().replace(/[-.]/g, ' ').trim();

      // Extract limit of approved leave days
      let maxApprovedDays = 31;
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

      // Check range validity
      let isWithinRange = false;

      if (memo.startDate && memo.endDate) {
        try {
          const sDate = new Date(memo.startDate);
          const eDate = new Date(memo.endDate);
          const dTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
          const sTime = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate()).getTime();
          const eTime = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate()).getTime();
          if (dTime >= sTime && dTime <= eTime) {
            isWithinRange = true;
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (!isWithinRange) {
        // Fallback checks using day and month for legacy memos in database
        if (monthIndex === 4) { // May
          if (mNorm.includes("ABIGAIL") && memo.id.includes("exam")) {
            isWithinRange = dayNum >= 19 && dayNum <= 21;
          } else if (mNorm.includes("DANIEL") && mNorm.includes("ONOJA")) {
            isWithinRange = dayNum <= 13;
          } else if (mNorm.includes("BAMOR") || mNorm.includes("GABRIEL")) {
            isWithinRange = dayNum <= 11;
          } else if (mNorm.includes("NWOBODO")) {
            isWithinRange = dayNum >= 8;
          } else if (mNorm.includes("ASUE") || mNorm.includes("VICTOR")) {
            isWithinRange = dayNum >= 4 && dayNum <= 15;
          } else if (mNorm.includes("SALIHU") || (mNorm.includes("MUSTAPHA") && memo.id.includes("salihu"))) {
            isWithinRange = dayNum >= 26;
          } else if (mNorm.includes("SARAH") || mNorm.includes("BROWN")) {
            isWithinRange = dayNum >= 14 && dayNum <= 15;
          } else if (mNorm.includes("ILIYASU") || mNorm.includes("ALI")) {
            isWithinRange = dayNum >= 18;
          } else if (mNorm.includes("MUKHTAR") || (mNorm.includes("MUSTAPHA") && memo.id.includes("mukhtar"))) {
            isWithinRange = dayNum >= 15 && dayNum <= 21;
          } else if (mNorm.includes("MADINA") || mNorm.includes("HASSAN")) {
            isWithinRange = dayNum >= 25 && dayNum <= 29;
          } else if (mNorm.includes("HALIMA") || mNorm.includes("RABIU")) {
            isWithinRange = dayNum >= 25 && dayNum <= 29;
          } else if (mNorm.includes("KAKA") || mNorm.includes("HAUWA")) {
            isWithinRange = dayNum >= 25;
          } else if (mNorm.includes("GAJO") || mNorm.includes("BAIDI")) {
            isWithinRange = dayNum >= 25 && dayNum <= 29;
          } else if (mNorm.includes("YUSUF BIN YUSUF") || mNorm.includes("BIN YUSUF")) {
            isWithinRange = dayNum >= 25 && dayNum <= 29;
          } else if (mNorm.includes("AHMED") || mNorm.includes("UMAR") || mNorm.includes("ABUBAKAR")) {
            isWithinRange = dayNum >= 25;
          } else if (mNorm.includes("OKPEWHO") || mNorm.includes("MICHAEL") || mNorm.includes("MICHEAL")) {
            isWithinRange = dayNum === 4;
          }
        }
      }

      if (!isWithinRange) return false;

      // Ensure workdays index <= maxApprovedDays
      const periodDays = getPeriodDays();
      const currentWorkdays = periodDays.filter(d => d.isWorkday);
      const candidates: Date[] = [];
      
      currentWorkdays.forEach(wd => {
        let isCand = false;
        if (memo.startDate && memo.endDate) {
          try {
            const sDate = new Date(memo.startDate);
            const eDate = new Date(memo.endDate);
            const dTime = new Date(wd.date.getFullYear(), wd.date.getMonth(), wd.date.getDate()).getTime();
            const sTime = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate()).getTime();
            const eTime = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate()).getTime();
            if (dTime >= sTime && dTime <= eTime) {
              isCand = true;
            }
          } catch (e) {}
        }
        if (!isCand) {
          const dNum = wd.date.getDate();
          if (wd.date.getMonth() === 4) { // May
            if (mNorm.includes("ABIGAIL") && memo.id.includes("exam")) {
              isCand = dNum >= 19 && dNum <= 21;
            } else if (mNorm.includes("DANIEL") && mNorm.includes("ONOJA")) {
              isCand = dNum <= 13;
            } else if (mNorm.includes("BAMOR") || mNorm.includes("GABRIEL")) {
              isCand = dNum <= 11;
            } else if (mNorm.includes("NWOBODO")) {
              isCand = dNum >= 8;
            } else if (mNorm.includes("ASUE") || mNorm.includes("VICTOR")) {
              isCand = dNum >= 4 && dNum <= 15;
            } else if (mNorm.includes("SALIHU") || (mNorm.includes("MUSTAPHA") && memo.id.includes("salihu"))) {
              isCand = dNum >= 26;
            } else if (mNorm.includes("SARAH") || mNorm.includes("BROWN")) {
              isCand = dNum >= 14 && dNum <= 15;
            } else if (mNorm.includes("ILIYASU") || mNorm.includes("ALI")) {
              isCand = dNum >= 18;
            } else if (mNorm.includes("MUKHTAR") || (mNorm.includes("MUSTAPHA") && memo.id.includes("mukhtar"))) {
              isCand = dNum >= 15 && dNum <= 21;
            } else if (mNorm.includes("MADINA") || mNorm.includes("HASSAN")) {
              isCand = dNum >= 25 && dNum <= 29;
            } else if (mNorm.includes("HALIMA") || mNorm.includes("RABIU")) {
              isCand = dNum >= 25 && dNum <= 29;
            } else if (mNorm.includes("KAKA") || mNorm.includes("HAUWA")) {
              isCand = dNum >= 25;
            } else if (mNorm.includes("GAJO") || mNorm.includes("BAIDI")) {
              isCand = dNum >= 25 && dNum <= 29;
            } else if (mNorm.includes("YUSUF BIN YUSUF") || mNorm.includes("BIN YUSUF")) {
              isCand = dNum >= 25 && dNum <= 29;
            } else if (mNorm.includes("AHMED") || mNorm.includes("UMAR") || mNorm.includes("ABUBAKAR")) {
              isCand = dNum >= 25;
            } else if (mNorm.includes("OKPEWHO") || mNorm.includes("MICHAEL") || mNorm.includes("MICHEAL")) {
              isCand = dNum === 4;
            }
          }
        }
        if (isCand) {
          candidates.push(wd.date);
        }
      });

      const idx = candidates.findIndex(c => c.toDateString() === date.toDateString());
      return idx !== -1 && idx < maxApprovedDays;
    });
  };

  const getStaffLeaveMemoOnDate = (staffName: string, date: Date): LeaveMemo | undefined => {
    const dayNum = date.getDate();
    const monthIndex = date.getMonth();

    return memos.find(memo => {
      if (memo.status !== 'approved' && !memo.synced) return false;
      
      if (!areNamesMatching(staffName, memo.to, memo.market, "Head Office")) return false;
      
      const mNorm = memo.to.toUpperCase().replace(/[-.]/g, ' ').trim();

      let maxApprovedDays = 31;
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

      let isWithinRange = false;

      if (memo.startDate && memo.endDate) {
        try {
          const sDate = new Date(memo.startDate);
          const eDate = new Date(memo.endDate);
          const dTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
          const sTime = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate()).getTime();
          const eTime = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate()).getTime();
          if (dTime >= sTime && dTime <= eTime) {
            isWithinRange = true;
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (!isWithinRange) {
        if (monthIndex === 4) { // May
          if (mNorm.includes("ABIGAIL") && memo.id.includes("exam")) {
            isWithinRange = dayNum >= 19 && dayNum <= 21;
          } else if (mNorm.includes("DANIEL") && mNorm.includes("ONOJA")) {
            isWithinRange = dayNum <= 13;
          } else if (mNorm.includes("BAMOR") || mNorm.includes("GABRIEL")) {
            isWithinRange = dayNum <= 11;
          } else if (mNorm.includes("NWOBODO")) {
            isWithinRange = dayNum >= 8;
          } else if (mNorm.includes("ASUE") || mNorm.includes("VICTOR")) {
            isWithinRange = dayNum >= 4 && dayNum <= 15;
          } else if (mNorm.includes("SALIHU") || (mNorm.includes("MUSTAPHA") && memo.id.includes("salihu"))) {
            isWithinRange = dayNum >= 26;
          } else if (mNorm.includes("SARAH") || mNorm.includes("BROWN")) {
            isWithinRange = dayNum >= 14 && dayNum <= 15;
          } else if (mNorm.includes("ILIYASU") || mNorm.includes("ALI")) {
            isWithinRange = dayNum >= 18;
          } else if (mNorm.includes("MUKHTAR") || (mNorm.includes("MUSTAPHA") && memo.id.includes("mukhtar"))) {
            isWithinRange = dayNum >= 15 && dayNum <= 21;
          } else if (mNorm.includes("MADINA") || mNorm.includes("HASSAN")) {
            isWithinRange = dayNum >= 25 && dayNum <= 29;
          } else if (mNorm.includes("HALIMA") || mNorm.includes("RABIU")) {
            isWithinRange = dayNum >= 25 && dayNum <= 29;
          } else if (mNorm.includes("KAKA") || mNorm.includes("HAUWA")) {
            isWithinRange = dayNum >= 25;
          } else if (mNorm.includes("GAJO") || mNorm.includes("BAIDI")) {
            isWithinRange = dayNum >= 25 && dayNum <= 29;
          } else if (mNorm.includes("YUSUF BIN YUSUF") || mNorm.includes("BIN YUSUF")) {
            isWithinRange = dayNum >= 25 && dayNum <= 29;
          } else if (mNorm.includes("AHMED") || mNorm.includes("UMAR") || mNorm.includes("ABUBAKAR")) {
            isWithinRange = dayNum >= 25;
          } else if (mNorm.includes("OKPEWHO") || mNorm.includes("MICHAEL") || mNorm.includes("MICHEAL")) {
            isWithinRange = dayNum === 4;
          }
        }
      }

      if (!isWithinRange) return false;

      const periodDays = getPeriodDays();
      const currentWorkdays = periodDays.filter(d => d.isWorkday);
      const candidates: Date[] = [];
      
      currentWorkdays.forEach(wd => {
        let isCand = false;
        if (memo.startDate && memo.endDate) {
          try {
            const sDate = new Date(memo.startDate);
            const eDate = new Date(memo.endDate);
            const dTime = new Date(wd.date.getFullYear(), wd.date.getMonth(), wd.date.getDate()).getTime();
            const sTime = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate()).getTime();
            const eTime = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate()).getTime();
            if (dTime >= sTime && dTime <= eTime) {
              isCand = true;
            }
          } catch (e) {}
        }
        if (!isCand) {
          const dNum = wd.date.getDate();
          if (wd.date.getMonth() === 4) { // May
            if (mNorm.includes("ABIGAIL") && memo.id.includes("exam")) {
              isCand = dNum >= 19 && dNum <= 21;
            } else if (mNorm.includes("DANIEL") && mNorm.includes("ONOJA")) {
              isCand = dNum <= 13;
            } else if (mNorm.includes("BAMOR") || mNorm.includes("GABRIEL")) {
              isCand = dNum <= 11;
            } else if (mNorm.includes("NWOBODO")) {
              isCand = dNum >= 8;
            } else if (mNorm.includes("ASUE") || mNorm.includes("VICTOR")) {
              isCand = dNum >= 4 && dNum <= 15;
            } else if (mNorm.includes("SALIHU") || (mNorm.includes("MUSTAPHA") && memo.id.includes("salihu"))) {
              isCand = dNum >= 26;
            } else if (mNorm.includes("SARAH") || mNorm.includes("BROWN")) {
              isCand = dNum >= 14 && dNum <= 15;
            } else if (mNorm.includes("ILIYASU") || mNorm.includes("ALI")) {
              isCand = dNum >= 18;
            } else if (mNorm.includes("MUKHTAR") || (mNorm.includes("MUSTAPHA") && memo.id.includes("mukhtar"))) {
              isCand = dNum >= 15 && dNum <= 21;
            } else if (mNorm.includes("MADINA") || mNorm.includes("HASSAN")) {
              isCand = dNum >= 25 && dNum <= 29;
            } else if (mNorm.includes("HALIMA") || mNorm.includes("RABIU")) {
              isCand = dNum >= 25 && dNum <= 29;
            } else if (mNorm.includes("KAKA") || mNorm.includes("HAUWA")) {
              isCand = dNum >= 25;
            } else if (mNorm.includes("GAJO") || mNorm.includes("BAIDI")) {
              isCand = dNum >= 25 && dNum <= 29;
            } else if (mNorm.includes("YUSUF BIN YUSUF") || mNorm.includes("BIN YUSUF")) {
              isCand = dNum >= 25 && dNum <= 29;
            } else if (mNorm.includes("AHMED") || mNorm.includes("UMAR") || mNorm.includes("ABUBAKAR")) {
              isCand = dNum >= 25;
            } else if (mNorm.includes("OKPEWHO") || mNorm.includes("MICHAEL") || mNorm.includes("MICHEAL")) {
              isCand = dNum === 4;
            }
          }
        }
        if (isCand) {
          candidates.push(wd.date);
        }
      });

      const idx = candidates.findIndex(c => c.toDateString() === date.toDateString());
      return idx !== -1 && idx < maxApprovedDays;
    });
  };

  const getExcusedDays = (staffName: string): number => {
    let count = 0;
    const periodDays = getPeriodDays();
    periodDays.forEach(pDay => {
      if (pDay.isWorkday && isStaffOnLeaveOnDate(staffName, pDay.date)) {
        count++;
      }
    });
    return count;
  };

  const getStaffStats = (s: MayStaffAttendance | MarchStaffAttendance) => {
    const excusedDays = getExcusedDays(s.name);
    const periodDays = getPeriodDays();
    
    const totalTrackedDays = periodDays.length;
    const weekendsCount = periodDays.filter(d => d.isWeekend).length;
    const holidaysCount = periodDays.filter(d => d.isHoliday).length;

    // Use performance metrics service formulas
    const noOfDays = calculateNoOfDays(totalTrackedDays, weekendsCount, holidaysCount, excusedDays);

    // Calc base present & punctual days
    const rawPresent = s.daysPresent ?? 0;
    const rawPunctual = s.daysPunctual ?? 0;
    let daysPresent = rawPresent;
    let daysPunctual = rawPunctual;

    if (auditMonth === 'june' || auditMonth === 'july') {
      // For June/July, we have the exact counts calculated inside `getJuneStaffAttendance`
      // So they are already correct for the portion of June/July with logs!
      // But we can cap to noOfDays to be safe
      daysPresent = Math.min(noOfDays, rawPresent);
      daysPunctual = Math.min(daysPresent, rawPunctual);
    } else if (periodType === 'calendar') {
      // Scale from base workdays (which was the Salary Cycle, e.g. 21 days for May, 20 days for March)
      const originalSalaryWorkdays = auditMonth === 'may' ? 21 : 20;
      const scale = noOfDays / originalSalaryWorkdays;

      daysPresent = Math.min(noOfDays, Math.round(rawPresent * scale));
      daysPunctual = Math.min(daysPresent, Math.round(rawPunctual * scale));
    } else {
      // In salary mode, keep them as is but cap to noOfDays
      daysPresent = Math.min(noOfDays, rawPresent);
      daysPunctual = Math.min(daysPresent, rawPunctual);
    }

    // Force scale if nominal rates are 100% (only for March/May)
    if (auditMonth !== 'june' && auditMonth !== 'july') {
      if (s.attendanceRate === 100 || s.attendanceRate === '100%') {
        daysPresent = noOfDays;
      }
      if (s.punctualRate === 100 || s.punctualRate === '100%') {
        daysPunctual = daysPresent;
      }
    }

    const attendanceRate = calculateAttendancePercentage(daysPresent, noOfDays);
    const punctualRate = calculatePunctualPercentage(daysPunctual, noOfDays);
    const cummPerformance = calculatePerformancePercentage(attendanceRate, punctualRate);

    return {
      totalDaysInMonth: totalTrackedDays,
      excusedDays,
      noOfDays,
      daysPresent,
      daysPunctual,
      attendanceRate,
      punctualRate,
      cummPerformance
    };
  };

  // Parser for pasted text
  const handleParseExcelText = () => {
    if (!pastedRosterText.trim()) {
      alert("Please paste some text in the Excel format or load a blank template first!");
      return;
    }

    try {
      const lines = pastedRosterText.split('\n').filter(l => l.trim().length > 0);
      if (lines.length === 0) return;

      // Split each line by commas, tabs or semicolons
      const rows = lines.map(line => {
        return line.split(/\t|,|;/).map(cell => cell.trim().replace(/^["']|["']$/g, ''));
      });

      // Analyze which month
      const currentMonthIndex = excelAuditMonth === 'march' ? 2 : 4; // Index for March (2) or May (4) 2026
      const year = 2026;
      
      // Determine public holidays & weekends based on selected model month
      const activeMonthHolidays = excelAuditMonth === 'march' ? [20, 23] : [1, 27, 28]; // March (Eid al-Fitr) vs May (Workers/Eid al-Adha)
      
      const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
      const numDays = getDaysInMonth(year, currentMonthIndex);

      const computedResults: any[] = [];
      const alerts: string[] = [];

      // Determine expected business days for this month
      const activeMonthWeekends: number[] = [];
      const activeMonthWorkdays: number[] = [];
      for (let d = 1; d <= numDays; d++) {
        const dObj = new Date(year, currentMonthIndex, d);
        const dayOfWeek = dObj.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          activeMonthWeekends.push(d);
        } else {
          activeMonthWorkdays.push(d);
        }
      }

      rows.forEach((row, rIdx) => {
        // Skip header lines
        if (row.some(c => c.toLowerCase().includes('name') || c.toLowerCase().includes('staff') || c.toLowerCase() === 'd1' || c.toLowerCase() === 'personnel name')) {
          return;
        }

        const name = row[0] || '';
        if (name.length < 3) return;

        // Parse days status starting from column index 1 through day count
        let presentCount = 0;
        let punctualCount = 0;
        let lateCount = 0;
        let leaveCount = 0;
        let absenceCount = 0;

        const dayStatuses: { day: number, status: string, notes?: string }[] = [];

        for (let d = 1; d <= numDays; d++) {
          const colIndex = d; // Assume name is in col 0, Day 1 in col 1, etc.
          let status = row[colIndex] || '';

          const isWknd = activeMonthWeekends.includes(d);
          const isHolidy = activeMonthHolidays.includes(d);

          // Standardize status
          let solvedStatus = '—';
          if (status === '✓' || status.toUpperCase() === 'P' || status.toUpperCase() === 'PRESENT') {
            solvedStatus = '✓';
          } else if (status.toUpperCase() === 'L' || status.toUpperCase() === 'LATE') {
            solvedStatus = 'L';
          } else if (status.toUpperCase() === 'LV' || status.toUpperCase() === 'LEAVE') {
            solvedStatus = 'LV';
          }

          // If the uploaded Excel has checked in on a weekend or public holiday: Fine-tune it!
          if (isWknd) {
            if (solvedStatus === '✓' || solvedStatus === 'L') {
              alerts.push(`${name}: Workday presence marked on Day ${d} which is a Weekend (Sat/Sun). Auto-aligned Excel workbook to ignore weekend workload, but preserved attendance reward!`);
            }
            dayStatuses.push({ day: d, status: solvedStatus, notes: 'Weekend' });
          } else if (isHolidy) {
            if (solvedStatus === '✓' || solvedStatus === 'L') {
              alerts.push(`${name}: Workday presence marked on Day ${d} which is an Official Government Public Holiday. Auto-dismissed calendar liability flag.`);
            }
            dayStatuses.push({ day: d, status: solvedStatus, notes: 'Public Holiday' });
          } else {
            // Business Day
            if (solvedStatus === '✓') {
              presentCount++;
              punctualCount++;
            } else if (solvedStatus === 'L') {
              presentCount++;
              lateCount++;
            } else if (solvedStatus === 'LV') {
              leaveCount++;
            } else {
              absenceCount++;
            }
            dayStatuses.push({ day: d, status: solvedStatus });
          }
        }

        // Apply performance metrics service formulas
        // 'No. of Days' (tracked - weekends - holidays - excused/leave days)
        const excusedDays = leaveCount;
        const noOfDays = Math.max(1, activeMonthWorkdays.length - activeMonthHolidays.filter(h => !activeMonthWeekends.includes(h)).length - excusedDays);

        const attendancePct = calculateAttendancePercentage(presentCount, noOfDays);
        const punctualPct = calculatePunctualPercentage(punctualCount, noOfDays);
        const performancePct = calculatePerformancePercentage(attendancePct, punctualPct);

        computedResults.push({
          sn: computedResults.length + 1,
          name,
          present: presentCount,
          late: lateCount,
          punctual: punctualCount,
          leave: leaveCount,
          absence: absenceCount,
          noOfDays,
          attendancePct,
          punctualPct,
          performancePct,
          dayStatuses
        });
      });

      setParsedRosterResult(computedResults);
      setExcelAuditAlerts(Array.from(new Set(alerts)).slice(0, 10)); // Display unique top 10 fine-tuning notifications
    } catch (e) {
      console.error(e);
      alert("Error parsing clipboard grid. Ensure your clipboard contains Tab-Separated columns from Excel.");
    }
  };

  const handleLoadExcelTemplate = () => {
    // Generates a mock layout populated for direct copy pasting or immediate evaluation
    const template = `Personnel Name\tD1\tD2\tD3\tD4\tD5\tD6\tD7\tD8\tD9\tD10\tD11\tD12\tD13\tD14\tD15\tD16\tD17\tD18\tD19\tD20\tD21\tD22\tD23\tD24\tD25\tD26\tD27\tD28\tD29\tD30\tD31
Aisha Aminu (MD/CEO Office)\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓
Daniel Onoja (Finance)\tLV\tLV\tLV\tLV\tLV\t•\t•\tLV\tLV\tLV\tLV\tLV\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓
Salihu Mustapha (HR)\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\tLV\tLV\tLV
Amina Yusuf (Operations)\t✓\tL\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\tL\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓
Victor Asu (Internal Audit)\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓
Kaka Al-Hassan (Admin Office)\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓\t✓\t✓\t•\t•\t✓\t✓\t✓`;
    setPastedRosterText(template);
    setExcelAuditMonth('may');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setPastedRosterText(text);
    };
    reader.readAsText(file);
  };

  const getAdjustedAttendanceRate = (s: MayStaffAttendance): string => {
    const stats = getStaffStats(s);
    if (stats.excusedDays === 0) return `${stats.attendanceRate}%`;
    return `${stats.attendanceRate}% (Excused: +${stats.excusedDays}d)`;
  };

  // Export CSV
  const handleExportMayCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'S/N,Name,Office,No. of Days Present,No. of Days Punctual,Attendance %,Punctual %,Cumulative Performance %,Excused Leave Sync\r\n';
    
    const activeStaffList = auditMonth === 'march'
      ? march2026StaffAttendance
      : (auditMonth === 'june' || auditMonth === 'july')
        ? getJuneStaffAttendance(getPeriodDays().filter(d => d.isWorkday), isStaffOnLeaveOnDate) 
        : may2026StaffAttendance;

    activeStaffList.forEach(s => {
      const stats = getStaffStats(s);
      csvContent += `${s.sn},"${s.name}","${s.office}",${stats.daysPresent},${stats.daysPunctual},${stats.attendanceRate}%,${stats.punctualRate}%,${stats.cummPerformance}%,${stats.excusedDays} days\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amml_${auditMonth}_2026_head_office_attendance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeStaffList = auditMonth === 'march'
    ? march2026StaffAttendance
    : (auditMonth === 'june' || auditMonth === 'july')
      ? getJuneStaffAttendance(getPeriodDays().filter(d => d.isWorkday), isStaffOnLeaveOnDate) 
      : may2026StaffAttendance;

  const filteredStaff = activeStaffList.filter(s => {
    return !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.office.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6" id="may-2026-audit-subcomponent">
      {/* Search & Toolbars */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#0d1624] p-4 border border-[#0064B4]/20 rounded-xl">
        <div className="space-y-1">
          <h2 className="font-serif font-black text-sm flex items-center gap-2 text-amml-text">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            Head Office Duty Ledger Analysis — {auditMonth === 'march' ? 'March 2026' : auditMonth === 'may' ? 'May 2026' : auditMonth === 'june' ? 'June 2026' : 'July 2026'}
          </h2>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 items-center">
            <p className="text-[10px] text-amml-text3 font-sans">
              Nominal roll tracks exactly {auditMonth === 'july' ? 61 : auditMonth === 'june' ? 58 : 56} HQ personnel. Excused leaves dynamically adjust clock compliance rates.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0064B4]/15 border border-[#0064B4]/30 text-[9px] text-[#008aff] font-mono font-black uppercase">
              <Calendar className="h-3 w-3" />
              Boundary: {auditMonth === 'july'
                ? (periodType === 'salary' ? '11 Jun 2026 – 13 Jul 2026' : '01 Jul 2026 – 31 Jul 2026')
                : auditMonth === 'june' 
                  ? (periodType === 'salary' ? '11 Jun 2026 – 10 Jul 2026' : '01 Jun 2026 – 30 Jun 2026') 
                  : auditMonth === 'may' 
                    ? (periodType === 'salary' ? '11 May 2026 – 10 Jun 2026' : '01 May 2026 – 31 May 2026') 
                    : (periodType === 'salary' ? '11 Feb 2026 – 10 Mar 2026' : '01 Mar 2026 – 31 Mar 2026')}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Boundary period selective toggler */}
          <select
            id="audit-period-selector"
            value={periodType}
            onChange={e => setPeriodType(e.target.value as 'salary' | 'calendar')}
            className="bg-amml-surface2 border border-[#0064B4]/40 rounded-lg text-xs text-indigo-300 font-bold py-1.5 px-3 focus:ring-1 focus:ring-[#0064B4] outline-none font-sans cursor-pointer hover:border-[#0064B4] transition-all"
            title="Attendance boundary: Salary month (ends on 10th of new month) vs standard Calendar month"
          >
            <option value="salary">Salary Cycle Period (11th to 10th)</option>
            <option value="calendar">Whole Calendar Month (1st to 31st)</option>
          </select>

          {/* Month selective toggler */}
          <select
            id="audit-month-selector"
            value={auditMonth}
            onChange={e => setAuditMonth(e.target.value as 'march' | 'may' | 'june' | 'july')}
            className="bg-amml-surface2 border border-amml-border rounded-lg text-xs text-amml-text py-1.5 px-3 focus:ring-1 focus:ring-[#0064B4] outline-none font-sans cursor-pointer"
          >
            <option value="july">July 2026 (Processed Salary Cycle)</option>
            <option value="june">June 2026 (Biometric Logs)</option>
            <option value="may">May 2026 (Workforce Tracker)</option>
            <option value="march">March 2026 (Audit Sheet Proof)</option>
          </select>

          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input 
              id="input-ho-search-filter"
              type="text" 
              placeholder="Search personnel..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-amml-surface2 border border-amml-border rounded-lg text-xs text-amml-text placeholder-amml-text3 focus:ring-1 focus:ring-[#0064B4] outline-none font-sans"
            />
          </div>
          <button 
            id="subtab-btn-analytical"
            onClick={() => setMayInnerTab('analytical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mayInnerTab === 'analytical' ? 'bg-[#0064B4] text-white' : 'bg-amml-surface2 text-amml-text border border-amml-border'
            }`}
          >
            Ledger View
          </button>
          <button 
            id="subtab-btn-grid"
            onClick={() => setMayInnerTab('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mayInnerTab === 'grid' ? 'bg-[#0064B4] text-white' : 'bg-amml-surface2 text-amml-text border border-amml-border'
            }`}
          >
            Checkerboard
          </button>
          <button 
            id="subtab-btn-excel"
            onClick={() => setMayInnerTab('excel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              mayInnerTab === 'excel' ? 'bg-[#0064B4] text-white border-transparent' : 'bg-amml-surface2 text-amml-text border border-amml-border'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Excel Import
          </button>
          <button 
            id="subtab-btn-export-csv"
            onClick={handleExportMayCSV} 
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all"
          >
            <Download className="h-3.5 w-3.5" /> Exports
          </button>
        </div>
      </div>

      {mayInnerTab === 'analytical' && (
        <div className="overflow-x-auto border border-amml-border/60 rounded-xl bg-amml-surface" id="may-analytical-table-container">
          <table className="w-full text-left text-xs border-collapse" id="ho-analytical-payroll-grid">
            <thead>
              <tr className="bg-amml-surface2 text-[10px] text-amml-text font-bold uppercase tracking-wider border-b border-amml-border/60">
                <th className="p-3 text-center">S/N</th>
                <th className="p-3">Staff Name</th>
                <th className="p-3">Office / Unit</th>
                <th className="p-3 text-center text-amber-400">Tracked Days</th>
                <th className="p-3 text-center">Days Present</th>
                <th className="p-3 text-center">Days Punctual</th>
                <th className="p-3 text-center text-emerald-400">Attendance %</th>
                <th className="p-3 text-center text-indigo-400">Punctual %</th>
                <th className="p-3 text-center text-amml-blue">Performance %</th>
                <th className="p-3 text-center">Excused Leave Days</th>
                <th className="p-3 text-center">Payroll Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amml-border/40 font-sans text-amml-text">
              {filteredStaff.map((s, idx) => {
                const stats = getStaffStats(s);
                const hasExcused = stats.excusedDays > 0;
                
                return (
                  <tr key={idx} className="hover:bg-amml-surface3/40 transition-all">
                    <td className="p-3 text-center font-mono text-amml-text3">{s.sn}</td>
                    <td className="p-3 font-semibold text-amml-text">{s.name}</td>
                    <td className="p-3 text-amml-text2 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-amml-orange" />
                      {s.office}
                    </td>
                    <td className="p-3 text-center font-mono font-medium text-amber-400">{stats.noOfDays}</td>
                    <td className="p-3 text-center font-mono">{stats.daysPresent}</td>
                    <td className="p-3 text-center font-mono">{stats.daysPunctual}</td>
                    <td className="p-3 text-center font-mono text-emerald-400 font-semibold">{stats.attendanceRate}%</td>
                    <td className="p-3 text-center font-mono text-indigo-400 font-semibold">{stats.punctualRate}%</td>
                    <td className="p-3 text-center font-mono font-bold text-amml-blue bg-[#0064B4]/5">
                      {stats.cummPerformance}%
                    </td>
                    <td className="p-3 text-center">
                      {hasExcused ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                          <Calendar className="h-2.5 w-2.5" />
                          {stats.excusedDays} workdays
                        </span>
                      ) : (
                        <span className="text-amml-text3 text-[10px] font-mono">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {hasExcused ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <ShieldCheck className="h-3 w-3" /> Fully Excused
                        </span>
                      ) : (stats.cummPerformance >= 85) ? (
                        <span className="text-emerald-400 font-bold">✓ Compliant</span>
                      ) : (
                        <span className="text-rose-400 font-bold">⚠️ Flagged</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {mayInnerTab === 'grid' && (
        /* Checkerboard Grid layout */
        <div className="space-y-4" id="checkerboard-duty-ledger-wrapper">
          <div className="flex flex-wrap justify-between items-center bg-amml-surface2 p-3 rounded-xl border border-amml-border/60 text-xs gap-2">
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>Present (✓)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span>Late Arrival (L)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block"></span>Excused Approved Leave (LV)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#172535] border border-amml-border rounded-full inline-block"></span>Absence (—)</span>
            </div>
            <div className="text-amml-text3 italic font-serif">
              {auditMonth === 'march' ? 'March 2026' : auditMonth === 'may' ? 'May 2026' : auditMonth === 'june' ? 'June 2026' : 'July 2026'} Grid Matrix
            </div>
          </div>

          <div className="overflow-x-auto border border-amml-border/60 rounded-xl bg-amml-surface max-h-[500px]" id="checkerboard-ledger-scroller-inner">
            <table className="w-full text-left border-collapse text-[10px]" id="checkerboard-table-data">
              <thead className="sticky top-0 bg-amml-surface2 z-10 border-b border-amml-border/80 text-amml-text font-bold">
                <tr>
                  <th className="p-2 border-r border-amml-border/60 text-center">S/N</th>
                  <th className="p-2 border-r border-amml-border/60 min-w-[150px]">Personnel Name</th>
                  {getPeriodDays().map((pDay, idx) => {
                    return (
                      <th 
                        key={idx} 
                        className={`p-1 border-r border-amml-border/40 text-center min-w-[24px] ${
                          pDay.isWeekend ? 'bg-slate-800 text-slate-400' : pDay.isHoliday ? 'bg-indigo-950 text-indigo-300' : 'bg-amml-surface2 text-amml-text'
                        }`}
                        title={`${pDay.monthLabel} ${pDay.dayNum}, 2026`}
                      >
                        <div className="text-[8px] opacity-70 font-sans tracking-tight leading-none mb-0.5">{pDay.monthLabel}</div>
                        <div className="font-bold text-[10px] leading-none">{pDay.label}</div>
                      </th>
                    );
                  })}
                  <th className="p-2 border-l border-r border-amber-500/30 text-center min-w-[60px] bg-amber-950/20 text-amber-300">No. of Days</th>
                  <th className="p-2 border-r border-amml-border/60 text-center min-w-[50px]">Present</th>
                  <th className="p-2 border-r border-amml-border/60 text-center min-w-[50px]">Punctual</th>
                  <th className="p-2 border-r border-emerald-500/30 text-center min-w-[70px] bg-emerald-950/20 text-emerald-400">Attendance %</th>
                  <th className="p-2 border-r border-indigo-500/30 text-center min-w-[70px] bg-indigo-950/20 text-indigo-400 font-bold">Punctual %</th>
                  <th className="p-2 text-center min-w-[80px] bg-[#0064B4]/10 text-amml-blue">Performance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amml-border/40 text-amml-text">
                {filteredStaff.map((s, sIdx) => {
                  const stats = getStaffStats(s);
                  return (
                    <tr key={sIdx} className="hover:bg-amml-surface3/30 transition-all font-mono">
                      <td className="p-2 border-r border-amml-border/60 text-center text-amml-text3">{s.sn}</td>
                      <td className="p-2 border-r border-amml-border/60 font-sans font-semibold text-amml-text2 text-xs truncate max-w-[140px]" title={s.name}>{s.name}</td>
                      
                      {getPeriodDays().map((pDay, idx) => {
                        if (pDay.isWeekend) {
                          return <td key={idx} className="p-1 border-r border-amml-border/30 text-center bg-slate-900/50 text-slate-600 font-mono">•</td>;
                        }
                        if (pDay.isHoliday) {
                          const letter = getVerticalSpelling(sIdx);
                          return (
                            <td key={idx} className="p-1 border-r border-[#0064B4]/10 text-center bg-indigo-950/20 text-indigo-400 font-bold select-none font-sans">
                              {letter}
                            </td>
                          );
                        }

                        // Check approved synced leaves
                        const onLeave = isStaffOnLeaveOnDate(s.name, pDay.date);
                        if (onLeave) {
                          const matchingMemo = getStaffLeaveMemoOnDate(s.name, pDay.date);
                          return (
                            <td 
                              key={idx} 
                              onClick={() => {
                                if (matchingMemo && onNavigateToMemo) {
                                  onNavigateToMemo(matchingMemo.id);
                                }
                              }}
                              onMouseEnter={(e) => {
                                if (matchingMemo) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredCell({
                                    staffName: s.name,
                                    dayNum: pDay.dayNum,
                                    memo: matchingMemo,
                                    x: rect.left,
                                    y: rect.bottom
                                  });
                                }
                              }}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`p-1 border-r border-[#0064B4]/20 text-center font-bold bg-indigo-600/30 text-indigo-300 text-[10px] select-none ${
                                matchingMemo ? 'cursor-pointer hover:bg-indigo-500/60 hover:text-white transition-all underline decoration-indigo-300/60 font-black' : ''
                              }`}
                            >
                              LV
                            </td>
                          );
                        }

                        let isLate = false;
                        let isPresent = false;
                        let timeString = "";
                        let isWFH = false;
                        let hasLog = false;

                        if (auditMonth === 'june' || auditMonth === 'july') {
                          const dateKey = `${pDay.monthLabel}-${pDay.dayNum}`;
                          isWFH = ('wfhDays' in s && s.wfhDays) ? s.wfhDays.includes(dateKey) : false;

                          const dayLogs = pDay.monthLabel === 'Jul' ? july2026DailyLogs[pDay.dayNum] : june2026DailyLogs[pDay.dayNum];
                          const log = dayLogs ? dayLogs[s.sn] : undefined;
                          if (log) {
                            hasLog = true;
                            isPresent = true;
                            isLate = log.inTime > "09:10";
                            timeString = `${log.inTime}${log.outTime ? ' - ' + log.outTime : ''}`;
                          } else if (isWFH) {
                            isPresent = true;
                            timeString = "Work From Home (Day Off)";
                          }
                        } else {
                          const currentActiveWorkdays = getPeriodDays().filter(d => d.isWorkday).map(d => d.dayNum);
                          isLate = isStaffLateOnDay(s.sn, pDay.dayNum, stats.daysPunctual, stats.daysPresent, currentActiveWorkdays);
                          isPresent = true;
                        }

                        if ((auditMonth === 'june' || auditMonth === 'july') && isWFH && !hasLog) {
                          return (
                            <td 
                              key={idx} 
                              className="p-1 border-r border-[#0064B4]/20 text-center font-bold bg-[#0064B4]/15 text-[#008aff] text-[8px] select-none cursor-help font-sans"
                              title="Work From Home (Excused Day Off)"
                            >
                              WFH
                            </td>
                          );
                        }

                        if ((auditMonth === 'june' || auditMonth === 'july') && !isPresent) {
                          return (
                            <td 
                              key={idx} 
                              className="p-1 border-r border-amml-border/20 text-center text-slate-500 font-mono text-[10px]"
                              title="No scan record for this date"
                            >
                              •
                            </td>
                          );
                        }

                        return (
                          <td 
                            key={idx} 
                            className={`p-1 border-r border-amml-border/30 text-center font-bold text-[10px] select-none cursor-help ${
                              isLate ? 'text-rose-400 bg-rose-500/5' : 'text-emerald-400 bg-emerald-500/5'
                            }`}
                            title={timeString || (isLate ? 'Late Arrival' : 'Punctual')}
                          >
                            {isLate ? 'L' : '✓'}
                          </td>
                        );
                      })}

                      {/* Summary Columns values */}
                      <td className="p-2 border-l border-r border-amber-500/20 text-center font-bold text-amber-400 bg-amber-950/15">{stats.noOfDays}</td>
                      <td className="p-2 border-r border-amml-border/40 text-center">{stats.daysPresent}</td>
                      <td className="p-2 border-r border-amml-border/40 text-center">{stats.daysPunctual}</td>
                      <td className="p-2 border-r border-emerald-500/20 text-center font-bold text-emerald-400 bg-emerald-500/5">{stats.attendanceRate}%</td>
                      <td className="p-2 border-r border-indigo-500/20 text-center font-bold text-indigo-400 bg-indigo-500/5">{stats.punctualRate}%</td>
                      <td className="p-2 text-center font-bold text-amml-blue bg-[#0064B4]/5">{stats.cummPerformance}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mayInnerTab === 'excel' && (
        /* Excel Interactive Import Desk Workspace */
        <div className="space-y-6 bg-amml-panel border border-[#0064B4]/20 rounded-xl p-5 shadow-inner text-amml-text animate-stage-wake" id="excel-interactive-solver-console">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                Excel Duty Roster Compliance Solver
              </h3>
              <p className="text-[10px] text-slate-450 mt-0.5">
                Paste any tab-separated duty sheets straight from Microsoft Excel or Google Sheets. The solver isolates public holidays and weekends automatically to avoid penalizing staff.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#0d1624] p-1 border border-amml-border rounded-lg">
              <span className="text-[10px] font-bold text-slate-450 px-2 font-sans">Roster month range:</span>
              <select
                id="excel-month-roster-selector"
                value={excelAuditMonth}
                onChange={e => setExcelAuditMonth(e.target.value as 'march' | 'may')}
                className="bg-[#000d1a] border border-amml-border rounded-lg text-xs text-amml-text py-1 px-3 focus:ring-1 focus:ring-[#0064B4] outline-none font-sans cursor-pointer font-bold"
              >
                <option value="march">March 2026</option>
                <option value="may">May 2026</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Input Form Desk */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 font-sans">Paste Excel Rows Block</label>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-load-excel-demo"
                    onClick={handleLoadExcelTemplate}
                    className="text-[10px] bg-slate-850 hover:bg-slate-800 hover:text-white border border-slate-705 px-2.5 py-1 text-emerald-400 font-bold rounded flex items-center gap-1 transition-all font-sans cursor-pointer"
                  >
                    📦 Load Custom Excel Template
                  </button>
                  <label className="text-[10px] bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-400/40 px-2.5 py-1 text-indigo-300 font-bold rounded flex items-center gap-1 cursor-pointer transition-all font-sans">
                    <Upload className="h-3 w-3" /> Upload CSV/TSV
                    <input type="file" accept=".csv,.tsv,.txt" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Text area paste grid */}
              <div className="relative">
                <textarea
                  id="textarea-pasted-raw-roster"
                  value={pastedRosterText}
                  onChange={e => setPastedRosterText(e.target.value)}
                  placeholder="Paste roster data here... (Format: Staff Name \t D1 \t D2... Columns copy-pasted straight from Excel)"
                  className="w-full h-56 bg-slate-950/85 border border-[#0064B4]/20 rounded-lg p-3 font-mono text-[10px] text-emerald-400 outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-600 leading-normal resize-none"
                />
                {pastedRosterText && (
                  <button 
                    onClick={() => setPastedRosterText('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white bg-slate-850 p-1 rounded transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <button
                id="btn-solve-excel"
                onClick={handleParseExcelText}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-2 shadow cursor-pointer shadow-emerald-900/40"
              >
                <Check className="h-4 w-4" /> Run Fine-Tuned Calendar Analysis
              </button>
            </div>

            {/* Calendar fine tuning alerts & information block */}
            <div className="bg-slate-950/30 rounded-xl p-4 border border-white/5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2 font-serif">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-450 animate-bounce" />
                  Calendar Fine-Tuning Notifications
                </h4>
                
                {excelAuditAlerts.length > 0 ? (
                  <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                    {excelAuditAlerts.map((alertMessage, aIdx) => (
                      <div key={aIdx} className="p-2 rounded bg-amber-500/5 text-amber-300 border border-amber-500/10 text-[9px] font-mono leading-relaxed animate-fade-in-down">
                        • {alertMessage}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic py-12 text-center font-sans">
                    No fine-tuning warnings. Paste an Excel sheet and click "Run Fine-Tuned Calendar Analysis" to inspect alignment warnings.
                  </div>
                )}
              </div>

              {/* Information notes */}
              <div className="bg-indigo-600/5 p-3.5 rounded-lg border border-indigo-400/10 text-[10px]">
                <strong className="text-white block font-sans">Processor Instructions:</strong>
                <ul className="list-disc list-inside mt-1.5 text-slate-400 space-y-1 font-mono text-[9px]">
                  <li><strong>Holidays isolated:</strong> {excelAuditMonth === 'march' ? 'March 20 (Eid Day 1), March 23 (Eid Day 2 observed)' : 'May 1 (Workers Day), May 27 (Eid Day 1), May 28 (Eid Day 2)'}</li>
                  <li><strong>Weekends isolated:</strong> All Saturdays & Sundays excluded from "No. of Days" workload.</li>
                  <li><strong>Leave adjustment sync:</strong> Any cells with "LV" are counted as approved excused leaves to protect pay status.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Parsed spreadsheet results grid */}
          {parsedRosterResult && (
            <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0d1624] mt-6 animate-stage-wake" id="parsed-excel-results-table">
              <div className="p-3 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400 font-sans flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  Analyzed Excel Workforce Sheet — {parsedRosterResult.length} personnel compiled successfully
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">Weekends & Holiday vectors adjusted</span>
              </div>
              
              <div className="overflow-x-auto max-h-[350px]">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead className="sticky top-0 bg-[#0d1624] z-10 border-b border-white/10 text-white font-bold font-sans">
                    <tr>
                      <th className="p-2 border-r border-white/5 text-center">S/N</th>
                      <th className="p-2 border-r border-white/5 min-w-[150px]">Staff Name</th>
                      <th className="p-2 border-r border-white/5 text-center text-amber-400">Tracked Days</th>
                      <th className="p-2 border-r border-white/5 text-center">Present</th>
                      <th className="p-2 border-r border-white/5 text-center text-rose-400">Late</th>
                      <th className="p-2 border-r border-white/5 text-center text-indigo-400 font-semibold">Leaves (LV)</th>
                      <th className="p-2 border-r border-white/5 text-center text-emerald-400">Attendance %</th>
                      <th className="p-2 border-r border-white/5 text-center text-indigo-400 font-bold">Punctual %</th>
                      <th className="p-2 text-center bg-[#0064B4]/10 text-indigo-300 font-black">Performance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                    {parsedRosterResult.map((pr, pIdx) => (pr.name && (
                      <tr key={pIdx} className="hover:bg-white/5 transition-all">
                        <td className="p-2.5 border-r border-white/5 text-center text-slate-500 font-mono">{pr.sn}</td>
                        <td className="p-2.5 border-r border-white/5 font-sans text-white font-medium">{pr.name}</td>
                        <td className="p-2.5 border-r border-white/5 text-center text-amber-400 font-semibold">{pr.noOfDays}</td>
                        <td className="p-2.5 border-r border-white/5 text-center text-emerald-400">{pr.present}</td>
                        <td className="p-2.5 border-r border-white/5 text-center text-rose-400">{pr.late}</td>
                        <td className="p-2.5 border-r border-white/5 text-center text-indigo-400 font-semibold">{pr.leave}</td>
                        <td className="p-2.5 border-r border-white/5 text-center font-bold text-emerald-400">{pr.attendancePct}%</td>
                        <td className="p-2.5 border-r border-white/5 text-center font-bold text-indigo-400">{pr.punctualPct}%</td>
                        <td className="p-2.5 text-center font-black text-indigo-200 bg-indigo-500/5">{pr.performancePct}%</td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Hover Synced Memo Tooltip */}
      {hoveredCell && (
        <div 
          className="fixed z-50 bg-[#0d1624] text-white border-2 border-indigo-500/80 rounded-xl p-4 shadow-2xl max-w-sm pointer-events-none transition-opacity animate-stage-wake"
          style={{ 
            left: `${Math.min(window.innerWidth - 300, hoveredCell.x + 10)}px`, 
            top: `${Math.min(window.innerHeight - 200, hoveredCell.y + 10)}px` 
          }}
        >
          <div className="flex items-center gap-1.5 border-b border-indigo-500/20 pb-1.5 mb-2">
            <FileText className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider font-sans">Approved Sync Leave Memo</span>
          </div>
          <h4 className="font-semibold text-xs text-white uppercase font-sans tracking-wide leading-tight">{hoveredCell.staffName}</h4>
          <p className="text-[9px] text-[#0064B4] font-bold font-mono mt-0.5">
            Day {hoveredCell.dayNum} of {auditMonth === 'march' ? 'March' : auditMonth === 'may' ? 'May' : auditMonth === 'june' ? 'June' : 'July'} 2026
          </p>
          <div className="mt-2 space-y-1 bg-slate-900/40 p-2 rounded border border-white/5 text-[10px]">
            <div><strong className="text-slate-400">Subject:</strong> <span className="text-white italic">{hoveredCell.memo.subject}</span></div>
            <div><strong className="text-slate-400 font-sans">Written Dates:</strong> <span className="text-amber-450 font-sans font-semibold">{hoveredCell.memo.dates}</span></div>
            <div><strong className="text-slate-400 font-sans">Event Span (From-To):</strong> <span className="text-emerald-400 font-mono font-bold">from {hoveredCell.memo.startDate} to {hoveredCell.memo.endDate}</span></div>

            <div><strong className="text-slate-400 font-sans">Days Approved:</strong> <span className="text-[#008aff] font-bold font-mono">{hoveredCell.memo.approvedDays}</span></div>
            {hoveredCell.memo.reliever && (
              <div><strong className="text-slate-400 font-sans">Reliever Officer:</strong> <span className="text-slate-200">{hoveredCell.memo.reliever}</span></div>
            )}
            {hoveredCell.memo.resumeDate && (
              <div><strong className="text-slate-400 font-sans">Resumption Date:</strong> <span className="text-slate-200 font-mono text-[9px]">{hoveredCell.memo.resumeDate}</span></div>
            )}
            
            {/* Direct Tooltip displaying of Inconsistencies */}
            {hoveredCell.memo.inconsistencies && hoveredCell.memo.inconsistencies.length > 0 && (
              <div className="pt-1.5 mt-1.5 border-t border-rose-500/20">
                <span className="block text-[8px] font-bold text-rose-400 uppercase tracking-wider font-sans mb-1">Irregularities Flagged:</span>
                <ul className="list-disc pl-3 text-[9px] text-rose-300/90 leading-tight space-y-0.5">
                  {hoveredCell.memo.inconsistencies.map((inc, iIdx) => (
                    <li key={iIdx}>{inc}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-[9px] text-slate-400 border-t border-white/5 pt-1.5 mt-1.5 font-sans leading-relaxed text-indigo-300/80">
              * Click this LV cell in the checkerboard to automatically jump and view the original approved document!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
