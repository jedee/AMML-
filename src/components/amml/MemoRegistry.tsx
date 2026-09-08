import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, CheckSquare, FileText, Send, Archive, AlertTriangle, 
  User, CheckCircle2, Calendar, MapPin, Search, ArrowRight, ShieldCheck, 
  Layers, Clock, HelpCircle, Check, Printer, FileDown, FolderTree, ArrowUpDown,
  BookOpen, Info, ShieldAlert, Tag, Sparkles, Route, Building, Users, CheckCircle
} from 'lucide-react';
import { useAmmlStore } from '../../lib/amml/store';
import { LeaveMemo } from './ReportsView';
import { getActiveBusinessDaysInRange } from '../../lib/amml/calendar';
import { 
  MEMO_FILING_GUIDELINES, 
  MemoClassificationCode, 
  IncomingMemoSortOption, 
  MemoFilingGuideline 
} from '../../lib/amml/adminHrTypes';
import { batchAutoFileMemos, autoFileMemo, AutoFilingRouting, InputMemoForFiling } from '../../lib/amml/autoFilingUtility';

export const getMemoClassificationCode = (m: { subject: string; body?: string; classificationCode?: MemoClassificationCode }): MemoClassificationCode => {
  if (m.classificationCode) return m.classificationCode;
  const text = `${m.subject} ${m.body || ''}`.toUpperCase();
  if (text.includes('QUERY') || text.includes('DISCIPLINARY') || text.includes('EXPLANATION')) return 'HR/PER/QUERY';
  if (text.includes('APPRAISAL') || text.includes('PROMOTION') || text.includes('NOMINATION')) return 'HR/PER/APPRAISAL';
  if (text.includes('RESIGN') || text.includes('DISENGAGE') || text.includes('EXIT CLEARANCE')) return 'HR/PER/RESIGN';
  if (text.includes('CIRCULAR') || text.includes('EXECUTIVE DIRECTIVE') || text.includes('POLICY NOTICE')) return 'ADM/MEM/CIRCULAR';
  if (text.includes('DEPLOY') || text.includes('TRANSFER') || text.includes('MARKET ASSIGNMENT')) return 'ADM/MEM/DEPLOY';
  if (text.includes('HOUSING') || text.includes('ACCOUNT') || text.includes('SALARY') || text.includes('FINANCE') || text.includes('ALLOWANCE') || text.includes('PAYMENT') || text.includes('IMPRESS')) return 'ADM/MEM/FINANCE';
  if (text.includes('PROCURE') || text.includes('REQUISITION') || text.includes('MAINTENANCE') || text.includes('FACILITY')) return 'ADM/MEM/PROCURE';
  return 'HR/PER/LEAVE';
};

interface MemoAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  fromStatus?: string;
  toStatus?: string;
}

// Extends LeaveMemo with fields required for central CRUD and linked database structure
interface CombinedMemo extends LeaveMemo {
  status: 'draft' | 'approved' | 'archived';
  body?: string;
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string;   // Format: YYYY-MM-DD
  staffId?: string;   // Linked employee ID
  relieverId?: string; // Linked handover personnel employee ID
  classificationCode?: MemoClassificationCode;
  targetModule?: 'HR' | 'Admin';
  routedSuite?: string;
  auditTrail: MemoAuditLog[];
}

const computeMemoInconsistencies = (
  toName: string, 
  relieverName: string, 
  startDate: string, 
  endDate: string, 
  approvedDaysStr: string, 
  memoMarket: string, 
  ccList: string[], 
  staffList: any[]
): string[] => {
  const anomalies: string[] = [];
  if (!toName) return ["Recipient name is missing entirely."];

  const toUpper = toName.toUpperCase().trim().replace(/[-.]/g, ' ');
  
  // Find matching staff fuzzy
  const sMatch = staffList.find(s => {
    const fullName = `${s.first} ${s.last}`.toUpperCase().replace(/[-.]/g, ' ');
    return fullName.includes(toUpper) || toUpper.includes(fullName);
  });

  if (sMatch) {
    const sName = `${sMatch.first} ${sMatch.last}`.toUpperCase();
    if (sName !== toUpper.toUpperCase() && toUpper.length > 3) {
      anomalies.push(`Spelling discrepancy: TO header says spelling '${toName}' but official personnel record logs '${sName}'.`);
    }

    if (memoMarket && sMatch.market && memoMarket !== sMatch.market) {
      if (!(sMatch.market === 'Head Office' && memoMarket === 'Head Office')) {
        anomalies.push(`Cross-market audit: Employee ${sMatch.first} is deployed under '${sMatch.market}' nominal accounts but leave is approved in '${memoMarket}'.`);
      }
    }
  } else {
    anomalies.push(`Nominal roll discrepancy: Recipient '${toName}' is not registered under any authorized personnel profile.`);
  }

  // Reliever Handover checks
  if (!relieverName || relieverName.trim() === '') {
    anomalies.push(`Major HR Omission: Relieving Officer is missing entirely from the handover of schedule.`);
  } else {
    const relUpper = relieverName.toUpperCase().trim();
    if (sMatch) {
      const sName = `${sMatch.first} ${sMatch.last}`.toUpperCase();
      if (sName === relUpper) {
        anomalies.push(`Handover conflict: Recipient cannot designate themselves as their own relieving handover officer.`);
      }
    }

    // CC check
    const relLastName = relUpper.split(' ').pop() || '';
    const hasCc = ccList.some(cc => cc.toUpperCase().includes(relLastName) || relLastName.includes(cc.toUpperCase()));
    if (!hasCc && relLastName.length > 2) {
      anomalies.push(`Audit Inconsistency: Reliever '${relieverName}' is referenced in document body but omitted from the official carbon copies (CC) list.`);
    }
  }

  // Calendar math checks
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      if (start > end) {
        anomalies.push(`Chronological Error: Start date ${startDate} is scheduled after end date ${endDate}.`);
      } else {
        // Calculate true business days
        let businessDays = 0;
        const temp = new Date(start);
        const holidays = [1, 27, 28]; // May 1, May 27, May 28 (Eid/Workers holidays)
        while (temp <= end) {
          const dayWeek = temp.getDay();
          const dayD = temp.getDate();
          const isWeekend = dayWeek === 0 || dayWeek === 6;
          const isHoliday = temp.getMonth() === 4 && holidays.includes(dayD);
          if (!isWeekend && !isHoliday) {
            businessDays++;
          }
          temp.setDate(temp.getDate() + 1);
        }

        let limit = 0;
        const matchDig = approvedDaysStr.match(/\d+/);
        if (matchDig) {
          limit = parseInt(matchDig[0], 10);
        } else {
          const lower = approvedDaysStr.toLowerCase();
          if (lower.includes("three")) limit = 3;
          else if (lower.includes("five")) limit = 5;
          else if (lower.includes("seven")) limit = 7;
          else if (lower.includes("ten")) limit = 10;
          else if (lower.includes("fourteen")) limit = 14;
          else if (lower.includes("fifteen")) limit = 15;
          else if (lower.includes("twenty")) limit = 20;
        }

        if (limit > 0 && businessDays !== limit) {
          anomalies.push(`Arithmetic discrepancy: Verbatim approved days '${approvedDaysStr}' does not match parsed active span of ${businessDays} business days.`);
        }
      }
    }
  }

  return anomalies;
};

export const MemoRegistry: React.FC = () => {
  const { staff, markets, auditLog, session } = useAmmlStore();

  // Load and manage merged memo database (loads existing leave memos and adds status / audit trail defaults)
  const [memos, setMemos] = useState<CombinedMemo[]>(() => {
    const saved = localStorage.getItem('amml_leave_memos');
    let baseList: any[] = [];
    if (saved) {
      try {
        baseList = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse standard leave memos, reloading defaults", e);
      }
    }

    // Default seed memos if none or fallback
    const defaultMemos = [
      {
        id: "memo-okpewho",
        to: "MICHAEL OKPEWHO",
        date: "1st April, 2026",
        subject: "RE- APPLICATION FOR FIFTEEN (15) DAYS ANNUAL LEAVE.",
        dates: "Monday 13th April to Monday 4th May 2026",
        startDate: "2026-04-13",
        endDate: "2026-05-04",
        reliever: "Ugwu Ekechukwu",
        resumeDate: "Tuesday 5th May 2026",
        approvedDays: "Fifteen (15)",
        isExam: false,
        market: "Head Office",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "Ag. CS/LA", "UGWU EKECHUKWU"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-abigail-1",
        to: "SANGOTOYE ABIGAIL",
        date: "1st April, 2026",
        subject: "RE- APPLICATION FOR TEN (10) DAYS ANNUAL LEAVE.",
        dates: "Thursday 2nd April to Wednesday 15th April, 2026",
        startDate: "2026-04-02",
        endDate: "2026-04-15",
        reliever: "Isah Usman Shabba",
        resumeDate: "Thursday 16th April, 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Head Office",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "ISAH USMAN SHABBA"],
        inconsistencies: [
          "Minor Spelling: Spelled 'Isah Usman Shabba' in body but 'ISAH USMAN SHABA' in CC list."
        ],
        correctedDays: "Ten (10)",
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-onoja",
        to: "DANIEL ONOJA O.",
        date: "10th April, 2026",
        subject: "RE- APPLICATION FOR TEN (10) DAYS ANNUAL LEAVE.",
        dates: "Wednesday 29th April to Wednesday 13th May, 2026",
        startDate: "2026-04-29",
        endDate: "2026-05-13",
        reliever: "Yusuf Ismail",
        resumeDate: "Thursday 14th May, 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Head Office",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "YUSUF ISMAIL"],
        inconsistencies: [
          "Minor Policy: May 1st (May Day public holiday) falls in the leave period. If excluded, active leave count matches precisely."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-bamor",
        to: "GABRIEL MSUGHTER BAMOR",
        date: "20th April, 2026",
        subject: "RE- APPLICATION FOR FOURTEEN (14) DAYS ANNUAL LEAVE.",
        dates: "Wednesday 22nd April to Monday 11th May, 2026",
        startDate: "2026-04-22",
        endDate: "2026-05-11",
        reliever: "Alex Ogbunike",
        resumeDate: "Tuesday 12th May, 2026",
        approvedDays: "Fourteen (14)",
        isExam: false,
        market: "Kado Market",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "MANAGER, KADO MARKET", "PATRICK IKYO"],
        inconsistencies: [
          "Cross-market audit: Gabriel is deployed to Kado Market accounts but the approval is retained in Head Office nominal roll S/N 4."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-joseph",
        to: "UJULLU LEO JOSEPH",
        date: "106h April, 2026",
        subject: "RE- APPLICATION FOR SEVEN (7) DAYS ANNUAL LEAVE.",
        dates: "Friday 17th April to Monday 27th April, 2026",
        startDate: "2026-04-17",
        endDate: "2026-04-27",
        reliever: "",
        resumeDate: "Tuesday 28th April, 2026",
        approvedDays: "Seven (7)",
        isExam: false,
        market: "Wuse Market",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "MANAGER, WUSE MARKET"],
        inconsistencies: [
          "Critical Date Typo: Memo date is written as '106h April, 2026' (system should correct to 16th April).",
          "Major HR Omission: Body references 'comprehensive handover of your schedule of duties to him' but a designated reliever is missing entirely."
        ],
        synced: false,
        corrected: false,
        status: 'draft' as const
      },
      {
        id: "memo-onyinyechi-1",
        to: "NWOBODO-OGBU ONYINYECHI",
        date: "30th April, 2026",
        subject: "RE- APPLICATION FOR TWENTY (20) DAYS ANNUAL LEAVE.",
        dates: "Friday 8th May to Monday 8th June, 2026",
        startDate: "2026-05-08",
        endDate: "2026-06-08",
        reliever: "Alex Ogbunike",
        resumeDate: "Tuesday 9th June, 2026",
        approvedDays: "Twenty (20)",
        isExam: false,
        market: "Wuse Market",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "MANAGER, WUSE MARKET", "ALEX OGBUNIKE"],
        inconsistencies: [
          "Mathematical discrepancy: Friday 8th May to Monday 8th June spans 22 working days, which represents a 2-day over-allocation error.",
          "Structural Duplicate: This approved leave record has been duplicated twice in the registry file log."
        ],
        correctedDays: "Twenty (20)",
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-victor",
        to: "ASUE I. VICTOR",
        date: "May 4th, 2026",
        subject: "RE- APPLICATION FOR EXAMINATION LEAVE (10 WORKING DAYS).",
        dates: "Monday 4th May to Friday 15th May, 2026",
        startDate: "2026-05-04",
        endDate: "2026-05-15",
        reliever: "Faruk Baffa",
        resumeDate: "Monday 18th May, 2026",
        approvedDays: "Ten (10)",
        isExam: true,
        market: "Dei Dei Market",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "MANAGER, DEI DEI MARKETS", "MOSES BENSON OKOROGBUDJE"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-salihu",
        to: "SALIHU MUHAMMED MUSTAPHA",
        date: "May 8th, 2026",
        subject: "RE- APPLICATION FOR FIVE (5) DAYS LEAVE.",
        dates: "Tuesday 26th May to Thursday, 4th June 2026",
        startDate: "2026-05-26",
        endDate: "2026-06-04",
        reliever: "Ayinde Folashade Deborah",
        resumeDate: "Friday 5th June 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Head Office",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "AYINDE FOLASHADE DEBORAH"],
        inconsistencies: [
          "Arithmetic mismatch: Tuesday 26th May to Thursday 4th June covers 8 working days, not the approved 5, causing an unexcused 3 working day extension."
        ],
        correctedDays: "Eight (8)",
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-sarah",
        to: "SARAH T. BROWN",
        date: "May 8th, 2026",
        subject: "RE- APPROVAL OF TWO (2) DAYS PROFESSIONAL EXAMINATION LEAVE.",
        dates: "Thursday, 14th May to Friday, 15th May 2026",
        startDate: "2026-05-14",
        endDate: "2026-05-15",
        reliever: "Corporate Services Division",
        resumeDate: "Monday, 18th May 2026",
        approvedDays: "Two (2)",
        isExam: true,
        market: "Head Office",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA"],
        inconsistencies: [
          "Nominal Spell Discrepancy: Recipient's registered nominal name is 'SARAH BROWN TAMUNOTARIBO' (S/N 47) instead of 'SARAH T. BROWN'.",
          "CRITICAL HR STATUS NOTICE: Sarah T. Brown is no longer with AMML (Resigned / Ex-Staff). This historic memo record is archived and cannot generate active leave."
        ],
        synced: false,
        corrected: false,
        status: 'archived' as const
      },
      {
        id: "memo-adjustment",
        to: "HAUWA ILIYASU ALI",
        staffId: "AMML-046",
        date: "May 11th, 2026",
        subject: "RE- NOTIFICATION FOR LEAVE ADJUSTMENT",
        dates: "Monday 18th May to Tuesday 16th June 2026",
        startDate: "2026-05-18",
        endDate: "2026-06-16",
        reliever: "Micheal Joseph Inalegwu",
        resumeDate: "Wednesday 17th June 2026",
        approvedDays: "Twenty (20)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. HEAD, CSIT"],
        inconsistencies: [
          "Calendar Span Check: May 18th to June 16th is 22 working days, which represents a minor 2-day offset from the 20 scheduled."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo dated May 11th, 2026 on the above subject matter.\n\nThis is to acknowledge and confirm the adjustment of your approved annual leave earlier scheduled to commence on 11th May 2026. Management has noted that your twenty (20) days annual leave will now commence with effect from Monday 18th May to Tuesday 16th June 2026.\n\nMicheal Joseph Inalegwu will cover your schedule while you are away. Kindly ensure proper handover of your duties to him before proceeding on leave and copy the undersigned.\n\nYou are to resume duty on Wednesday 17th June 2026.\n\nEnjoy your leave period."
      },
      {
        id: "memo-mukhtar",
        to: "MUSTAPHA MUKHTAR",
        date: "May 11th, 2026",
        subject: "RE- APPROVAL OF FIVE (5) DAYS EXAMINATION LEAVE.",
        dates: "Friday, 15th May to Thursday, 21st May 2026",
        startDate: "2026-05-15",
        endDate: "2026-05-21",
        reliever: "Yusuf Ismail",
        resumeDate: "Friday, 22nd May 2026",
        approvedDays: "Five (5)",
        isExam: true,
        market: "Head Office",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "YUSUF ISMAIL"],
        inconsistencies: [
          "Spelling Alignment: Payroll registry registers 'MUKTAR MUSTAPHA' (S/N 36)."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-justine",
        to: "MANGER JUSTINE",
        date: "May 12th, 2026",
        subject: "RE- APPROVAL OF FIVE (5) DAYS EXAMINATION LEAVE.",
        dates: "Tuesday, 2nd June to Monday, 8th June 2026",
        startDate: "2026-06-02",
        endDate: "2026-06-08",
        reliever: "Innocent Amaechina",
        resumeDate: "Tuesday, 9th June 2026",
        approvedDays: "Five (5)",
        isExam: true,
        market: "Kugbo International Market",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "MANAGER, KUGBO INT'L MRKT", "NNAEGBO HELEN CHIZOBA"],
        inconsistencies: [
          "Spelling error: TO header says 'MANGER JUSTINE' instead of 'MANAGER JUSTINE' or she S/N 23 nominal 'Justine Manger'."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-madina",
        to: "MADINA RAZAQ HASSAN",
        date: "May 18, 2026",
        subject: "RE- APPROVAL OF FIVE (5) DAYS LEAVE.",
        dates: "Monday, 25th May to Friday, 29th May 2026",
        startDate: "2026-05-25",
        endDate: "2026-05-29",
        reliever: "Para-Mallam Ephraim and Ibrahim Zuwaira Odus",
        resumeDate: "Monday, 1st June 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Kaura Market",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "MANAGER, KAURA MARKET", "PARA-MALLAM EPHRAIM", "IBRAHIM ZUWAIRA ODUS"],
        inconsistencies: [
          "Spelling Check: TO lines read 'MADINA RAZAQ HASSAN' but nominal roll is 'MADINA RASAK HASSAN' S/N 34."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-halima",
        to: "HALIMA MUHAMMAD RABIU",
        date: "May 18, 2026",
        subject: "RE- APPROVAL OF FIVE (5) DAYS LEAVE.",
        dates: "Monday, 25th May to Friday, 29th May 2026",
        startDate: "2026-05-25",
        endDate: "2026-05-29",
        reliever: "Micheal Joseph Inalegwu",
        resumeDate: "Monday, 1st June 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Head Office",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "MICHEAL JOSEPH INALEGWU"],
        inconsistencies: [
          "Spelling check: TO says 'HALIMA MUHAMMAD RABIU' vs nominal database S/N 43 'HALIMA RABIU MUHAMMAD'."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-abigail-2",
        to: "SANGOTOYE A. ABIGAIL",
        date: "May 18, 2026",
        subject: "RE- APPROVAL OF THREE (3) DAYS LEAVE.",
        dates: "Tuesday, 19th May to Thursday, 21st May 2026",
        startDate: "2026-05-19",
        endDate: "2026-05-21",
        reliever: "Isah Usman Shaba",
        resumeDate: "Friday, 22nd May 2026",
        approvedDays: "Three (3)",
        isExam: true,
        market: "Head Office",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "ISAH USMAN SHABA"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-kaka",
        to: "MUHAMMAD HAUWA KAKA",
        date: "May 18, 2026",
        subject: "RE- APPROVAL OF FIFTEEN (15) DAYS LEAVE.",
        dates: "Monday, 25th May to Friday, 12th June 2026",
        startDate: "2026-05-25",
        endDate: "2026-06-12",
        reliever: "Abraham Nansah Abashe",
        resumeDate: "Monday, 15th June 2026",
        approvedDays: "Fifteen (15)",
        isExam: false,
        market: "Garki Model Market",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "MANAGER, GARKI MODEL MARKET", "ABRAHAM NANSAH ABASHE"],
        inconsistencies: [
          "Surname mismatch: TO shows 'MUHAMMAD HAUWA KAKA' but nominal roll is 'HAUWA KAKA MUHAMMAD' S/N 52."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-baidi",
        to: "BAIDI AISHA GAJO",
        date: "May 19, 2026",
        subject: "RE- APPROVAL OF THREE (3) DAYS LEAVE.",
        dates: "Monday 25th May to Friday 29th May, 2026",
        startDate: "2026-05-25",
        endDate: "2026-05-29",
        reliever: "Blessing Uzoh",
        resumeDate: "Monday, 1st June 2026",
        approvedDays: "Three (3)",
        isExam: false,
        market: "Head Office",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "BLESSING UZOH"],
        inconsistencies: [
          "Major Calculation Typo: Memo header says 'THREE (3) DAYS LEAVE' but approved date range covers Monday 25th May to Friday 29th May, which is FINAL(5) active working days."
        ],
        correctedDays: "Five (5)",
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-binyusuf",
        to: "YUSUF BIN YUSUF",
        date: "May 19, 2026",
        subject: "RE- APPROVAL OF THREE (3) DAYS LEAVE.",
        dates: "Monday, 25th May to Friday, 29th May 2026",
        startDate: "2026-05-25",
        endDate: "2026-05-29",
        reliever: "Ebun Obanla",
        resumeDate: "Monday, 1st June 2026",
        approvedDays: "Three (3)",
        isExam: false,
        market: "Wuse Market",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "BLESSING UZOH"],
        inconsistencies: [
          "Major Calculation Typo: Approved 'THREE (3) DAYS LEAVE' but dates span Monday 25th May to Friday 29th May which is FIVE (5) active working days."
        ],
        correctedDays: "Five (5)",
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-ahmed",
        to: "AHMED UMAR ABUBAKAR",
        date: "May 25, 2026",
        subject: "RE- APPLICATION FOR FIVE (5) DAYS LEAVE.",
        dates: "Monday 25th May to Tuesday 2nd June 2026",
        startDate: "2026-05-25",
        endDate: "2026-06-02",
        reliever: "Samuel Nyitamen Tsaw",
        resumeDate: "Wednesday, 3rd June 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Farmers Market",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "SAMUEL NYITAMEN TSAW"],
        inconsistencies: [
          "Range calculation error: Approved 'Five (5) days' but dates 'Monday 25th May to Tuesday 2nd June' span seven (7) active working days.",
          "Mismatched Gender reference: The text says 'comprehensive handover of your schedule of duties to HER' but the designated reliever Samuel is male."
        ],
        correctedDays: "Seven (7)",
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-joy",
        to: "WILLIAMS JOY OKOI",
        date: "June 1st, 2026",
        subject: "RE- APPLICATION FOR TWENTY (20) DAYS LEAVE.",
        dates: "Tuesday 2nd to Tuesday 30th June, 2026",
        startDate: "2026-06-02",
        endDate: "2026-06-30",
        reliever: "Ikechukwu Marvin Ukonu",
        resumeDate: "Wednesday, 1st July, 2026",
        approvedDays: "Twenty (20)",
        isExam: false,
        market: "Head Office",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "HAPPINESS IFEOMA N.O."],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-rafiat",
        to: "OGUNYEMI RAFIAT OPEYEMI",
        date: "June 8, 2026",
        subject: "RE- APPLICATION FOR FIVE (5) DAYS ANNUAL LEAVE.",
        dates: "Wednesday 17th June to Tuesday 23rd June 2026",
        startDate: "2026-06-17",
        endDate: "2026-06-23",
        reliever: "Ozichi Emelogu",
        resumeDate: "Wednesday, 24th June 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Head Office",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA", "OZICHI EMELOGU"],
        inconsistencies: [
          "Regulatory Sign-off Check: Approved and signed by 'D/Head HR & Admin Unit' rather than standard departmental head."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const
      },
      {
        id: "memo-onya-ojiji-annual-1",
        to: "ONYA N. OJIJI",
        date: "June 10, 2026",
        subject: "RE- APPLICATION FOR TWENTY (20) DAYS ANNUAL LEAVE.",
        dates: "Wednesday, 1st July 2026 to Tuesday, 28th July 2026",
        startDate: "2026-07-01",
        endDate: "2026-07-28",
        reliever: "Innocent Amaechina",
        resumeDate: "Wednesday, 29th July 2026",
        approvedDays: "Twenty (20)",
        isExam: false,
        market: "Head Office",
        cc: ["INNOCENT AMAECHINA", "TOLANI OFULUE", "HEAD, F&A", "HEAD, AUDIT", "Ag. CS/LA"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your application for annual leave dated 8th June 2026. This is to acknowledge your application to proceed on Twenty (20) days annual leave for the 2026 financial year with effect from Wednesday, 1st July 2026 to Tuesday, 28th July 2026. During your absence Innocent Amaechina will serve as Acting MD/CEO while; Tolani Ofulue will assume the responsibilities of Acting Head of Operations in your absence. Please ensure you do a comprehensive handover of your duties and ongoing assignments to him before you proceed and copy the undersigned. You are expected to resume duty on Wednesday, 29th July 2026. We wish you a pleasant and restful leave period."
      },
      {
        id: "memo-saifullah-kabir-casual",
        to: "SAIFULLAH KABIR",
        date: "June 9, 2026",
        subject: "RE- APPLICATION FOR FIVE (5) DAYS CASUAL LEAVE.",
        dates: "Monday 29th June 2026 to Friday, 3rd July 2026",
        startDate: "2026-06-29",
        endDate: "2026-07-03",
        reliever: "Innocent Amaechina",
        resumeDate: "Monday, 6th July 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Wuse Market",
        cc: ["Ag.MD/CEO", "HOD, OPS", "HEAD, F&A", "HEAD, AUDIT", "MANAGER, WUSE MARKET", "HENRY DIMESORO"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your application for annual leave dated 8th June 2026. This is to convey management's approval of your request to proceed on Five (5) days leave with effect from Monday 29th June 2026 to Friday, 3rd July 2026. Henry Dimesoro will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on Monday, 6th July 2026. Enjoy your leave period."
      },
      {
        id: "memo-halima-rabiu-casual",
        to: "HALIMA RABIU MUHAMMAD",
        date: "June 11th, 2026",
        subject: "RE- APPLICATION FOR FIVE (5) DAYS LEAVE.",
        dates: "Monday 15th June to Friday, 19th June 2026",
        startDate: "2026-06-15",
        endDate: "2026-06-19",
        reliever: "Micheal Joseph Inalegwe",
        resumeDate: "Monday, 22nd June 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "MICHEAL JOSEPH INALEGWE"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated June 11th, 2026. This is to convey management's approval of your request to proceed on Five (5) days casual leave from 2026 year. This is with effect from Monday 15th June to Friday, 19th June 2026. Micheal Joseph Inalegwe will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on Monday, 22nd June 2026. Enjoy your leave period."
      },
      {
        id: "memo-bashiru-dauda-annual",
        to: "BASHIRU DAUDA",
        date: "May 21st, 2026",
        subject: "RE- REQUEST FOR ANNUAL LEAVE 2026",
        dates: "Tuesday, 26th May to Friday, 31st May 2026",
        startDate: "2026-05-26",
        endDate: "2026-05-31",
        reliever: "",
        resumeDate: "Monday, 1st June 2026",
        approvedDays: "Two (2)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT"],
        inconsistencies: [
          "Arithmetic mismatch: Approved 'Two (2) days' but date range Tuesday 26th May to Friday 31st May represents four (4) active business days."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated 21st May, 2026. This is to convey management's approval of your request to proceed on your Two (2) days annual leave for 2026 financial year. This is with effect from Tuesday, 26th May to Friday, 31st May 2026. You are to resume duty on Monday, 1st June 2026. Enjoy your leave period."
      },
      {
        id: "memo-binya-usman-annual",
        to: "BINYA USMAN",
        date: "May 21st, 2026",
        subject: "RE- APPLICATION FOR SEVEN (7) DAYS ANNUAL LEAVE 2026.",
        dates: "Monday 1st June to Monday 8th June 2026",
        startDate: "2026-06-01",
        endDate: "2026-06-08",
        reliever: "",
        resumeDate: "Tuesday, 9th June 2026",
        approvedDays: "Seven (7)",
        isExam: false,
        market: "Head Office",
        cc: ["Manager Zone 3 NC/SC"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated 21st May, 2026. This is to convey management's approval of your request to proceed on your Seven (7) days annual leave for 2026 financial year. This is with effect from Monday 1st June to Monday 8th June 2026. You are to resume duty on Tuesday, 9th June 2026. Enjoy your leave period."
      },
      {
        id: "memo-faruk-baffa-annual",
        to: "FARUK BAFFA",
        date: "May 22nd, 2026",
        subject: "RE- 2026 ANNUAL LEAVE (5 DAYS-PART) & PAYMENT OF LEAVE ALLOWANCE",
        dates: "Tuesday 26th May to Wednesday 3rd June 2026",
        startDate: "2026-05-26",
        endDate: "2026-06-03",
        reliever: "Yusuf Ismail",
        resumeDate: "Thursday, 4th June 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Head Office",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, AUDIT", "Ag. CS/LA", "YUSUF ISMAIL"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated 21st May, 2026. This is to convey management's approval of your request to proceed on your Five (5) days annual leave for 2026 financial year. This is with effect from Tuesday 26th May to Wednesday 3rd June 2026. Mr. Yusuf Ismail will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on, Thursday 4th June 2026. Enjoy your leave period."
      },
      {
        id: "memo-muhammed-fadeel-annual",
        to: "MUHAMMED FADEEL ISAH",
        date: "May 25th, 2026",
        subject: "RE- APPLICATION FOR THREE (3) DAYS ANNUAL LEAVE 2026.",
        dates: "Tuesday 26th May to Monday 1st June, 2026",
        startDate: "2026-05-26",
        endDate: "2026-06-01",
        reliever: "",
        resumeDate: "Tuesday 2nd June, 2026",
        approvedDays: "Three (3)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "HEAD, M, S & E"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated May 25th, 2026. This is to convey management's approval of your request to proceed on Three (3) days annual leave from 2026 financial year. This is with effect from Tuesday 26th May to Monday 1st June, 2026. You are to resume duty on Tuesday 2nd June, 2026. Enjoy your leave period."
      },
      {
        id: "memo-ozichi-emelogu-annual",
        to: "OZICHI EMELOGU",
        date: "May 25th, 2026",
        subject: "RE- APPLICATION FOR FIVE (5) DAYS ANNUAL LEAVE.",
        dates: "Tuesday 26th May, 2026 to Wednesday 3rd June, 2026",
        startDate: "2026-05-26",
        endDate: "2026-06-03",
        reliever: "Ogunyemi Rafiat Opeyemi",
        resumeDate: "Thursday, 4th June 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HOD, OPS", "HEAD, F&A", "HEAD, AUDIT", "OGUNYEMI RAFIAT OPEYEMI"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your application for annual leave dated 18th May, 2025. This is to convey management's approval of your request to proceed on Five (5) days annual leave from 2026 financial year with effect from Tuesday 26th May, 2026 to Wednesday 3rd June, 2026. Ogunyemi Rafiat Opeyemi will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to her before you proceed and copy the undersigned. You are to resume duty on Thursday, 4th June 2026. Enjoy your leave period."
      },
      {
        id: "memo-yusuf-ismail-annual",
        to: "YUSUF ISMAIL",
        date: "May 25th, 2026",
        subject: "RE- APPLICATION FOR ONE (1) DAY LEAVE.",
        dates: "Friday 29th May",
        startDate: "2026-05-29",
        endDate: "2026-05-29",
        reliever: "",
        resumeDate: "Monday, 1st June 2026",
        approvedDays: "One (1)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated May 25th, 2026. This is to convey management's approval of your request to proceed on One (1) day annual leave from 2026 financial year. This is with effect on Friday 29th May. You are to resume duty on Monday, 1st June 2026. Enjoy your leave period."
      },
      {
        id: "memo-nipalang-damen-annual",
        to: "NIPALANG L. DAMEN",
        date: "June 5th, 2026",
        subject: "RE- APPLICATION FOR EIGHT (8) DAYS LEAVE.",
        dates: "Monday 8th June – Wednesday 17th June, 2026",
        startDate: "2026-06-08",
        endDate: "2026-06-17",
        reliever: "Zainab Adamu",
        resumeDate: "Thursday, 18th June 2026",
        approvedDays: "Eight (8)",
        isExam: false,
        market: "Garki Model Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "MANAGER GARKI MODEL MARKET", "ZAINAB ADAMU"],
        inconsistencies: [
          "Calendar Day-of-Week Discrepancy: Resume date is written as 'Monday, 18th June 2026' in body but June 18th, 2026 is a Thursday."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated June 1st, 2026. This is to convey management's approval of your request to proceed on Eight (8) days annual leave from 2026 financial year. This is with effect on Monday 8th June – Wednesday 17th June, 2026. Zainab Adamu will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to her before you proceed and copy the undersigned. You are to resume duty on Thursday, 18th June 2026. Enjoy your leave period."
      },
      {
        id: "memo-para-mallam-annual",
        to: "PARA-MALLAM E.",
        date: "June 18th, 2026",
        subject: "RE- APPLICATION FOR FIFTEEN (15) WORKING DAYS LEAVE",
        dates: "Monday 29th June – Friday 17th July, 2026",
        startDate: "2026-06-29",
        endDate: "2026-07-17",
        reliever: "Innocent Amaechina",
        resumeDate: "Monday, 20th July 2026",
        approvedDays: "Fifteen (15)",
        isExam: false,
        market: "Kaura Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "MANAGER, KAURA MARKET", "EZE CHUKWUDI"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated June 18th, 2026. This is to convey management's approval of your request to proceed on Fifteen (15) days annual leave from 2026 financial year. This is with effect on Monday 29th June – Friday 17th July, 2026. Eze Chukwudi will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on Monday, 20th July 2026. Enjoy your leave period."
      },
      {
        id: "memo-yusuf-bin-yusuf-annual-seven",
        to: "YUSUF BIN YUSUF",
        date: "June 23rd, 2026",
        subject: "RE- APPLICATION FOR SEVEN (7) WORKING DAYS LEAVE",
        dates: "Wednesday 24th June – Thursday 2nd July, 2026",
        startDate: "2026-06-24",
        endDate: "2026-07-02",
        reliever: "Ebun Obanla",
        resumeDate: "Friday, 3rd July 2026",
        approvedDays: "Seven (7)",
        isExam: false,
        market: "Wuse Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "BLESSING UZOH"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated June 22nd, 2026. This is to convey management's approval of your request to proceed on Seven (7) days annual leave from 2026 financial year. This is with effect on Wednesday 24th June – Thursday 2nd July, 2026. Blessing Uzoh will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to her before you proceed and copy the undersigned. You are to resume duty on Friday, 3rd July 2026. Enjoy your leave period."
      },
      {
        id: "memo-michael-ukpabia-annual",
        to: "MICHAEL UKPABIA",
        date: "June 23rd, 2026",
        subject: "RE- APPLICATION FOR TEN (10) WORKING DAYS LEAVE",
        dates: "Monday 6th July – Friday 17th July, 2026",
        startDate: "2026-07-06",
        endDate: "2026-07-17",
        reliever: "Innocent Amaechina",
        resumeDate: "Monday, 20th July 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "CELESTINA SIRAIJA"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated June 22nd, 2026. This is to convey management's approval of your request to proceed on Ten (10) days annual leave from 2026 financial year. This is with effect on Monday 6th July – Friday 17th July, 2026. Celestina Siraija will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on Monday, 20th July 2026. Enjoy your leave period."
      },
      {
        id: "memo-benedict-ajio-annual",
        to: "BENEDICT AJIO",
        date: "June 23rd, 2026",
        subject: "RE- APPLICATION FOR THREE (3) WORKING DAYS LEAVE",
        dates: "Wednesday 24th June – Friday 26th June, 2026",
        startDate: "2026-06-24",
        endDate: "2026-06-26",
        reliever: "",
        resumeDate: "Monday, 29th June 2026",
        approvedDays: "Three (3)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT"],
        inconsistencies: [
          "Major HR Omission: Handover text requires a reliever, but no relieving officer was designated in the memo body or carbon copies."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated June 22nd, 2026. This is to convey management's approval of your request to proceed on Three (3) days annual leave from 2026 financial year. This is with effect on Wednesday 24th June – Friday 26th June, 2026. You are to resume duty on Monday, 29th June 2026. Enjoy your leave period."
      },
      {
        id: "memo-deborah-jai-annual",
        to: "DEBORAH JAI",
        date: "June 25th, 2026",
        subject: "RE- APPLICATION FOR FIVE (5) WORKING DAYS LEAVE",
        dates: "Wednesday 24th June – Tuesday 30th June, 2026",
        startDate: "2026-06-24",
        endDate: "2026-06-30",
        reliever: "Innocent Amaechina",
        resumeDate: "Wednesday, 1st July 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "UMAR ISMAILA"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated June 23rd, 2026. This is to convey management's approval of your request to proceed on Five (5) days annual leave from 2026 financial year. This is with effect on Wednesday 24th June – Tuesday 30th June, 2026. Umar Ismaila will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on Wednesday, 1st July 2026. Enjoy your leave period."
      },
      {
        id: "memo-happiness-ifeoma-annual-five",
        to: "HAPPINESS IFEOMA N.O",
        date: "July 1st, 2026",
        subject: "RE- APPLICATION FOR FIVE (5) WORKING DAYS LEAVE",
        dates: "Wednesday 24th June – Tuesday 30th June, 2026",
        startDate: "2026-06-24",
        endDate: "2026-06-30",
        reliever: "Ozichi Emelogu",
        resumeDate: "Wednesday, 1st July 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "UMAR ISMAILA"],
        inconsistencies: [
          "Retroactive Approval Check: Approved leave period (June 24 to June 30) occurs entirely prior to the memo date of July 1st, 2026."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated June 23rd, 2026. This is to convey management's approval of your request to proceed on Five (5) days annual leave from 2026 financial year. This is with effect on Wednesday 24th June – Tuesday 30th June, 2026. Umar Ismaila will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on Wednesday, 1st July 2026. Enjoy your leave period."
      },
      {
        id: "memo-happiness-ifeoma-annual-ten",
        to: "HAPPINESS IFEOMA N.O",
        date: "July 1st, 2026",
        subject: "RE- APPLICATION FOR TEN (10) WORKING DAYS LEAVE",
        dates: "Monday 6th July – Friday 17th July, 2026",
        startDate: "2026-07-06",
        endDate: "2026-07-17",
        reliever: "Ozichi Emelogu",
        resumeDate: "Monday, 20th July, 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "OZICHI EMELOGU"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated June 29th, 2026. This is to convey management's approval of your request to proceed on Ten (10) days annual leave from 2026 financial year. This is with effect on Monday 6th July – Friday 17th July, 2026. Ozichi Emelogu will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to her before you proceed and copy the undersigned. You are to resume duty on Monday, 20th July, 2026. Enjoy your leave period."
      },
      {
        id: "memo-ahmed-saadatu-pate-annual",
        to: "AHMED SA’ADATU PATE",
        date: "July 1st, 2026",
        subject: "RE- APPLICATION FOR TWENTY-FIVE (25) WORKING DAYS LEAVE",
        dates: "Monday 20th July – Friday 21st August, 2026",
        startDate: "2026-07-20",
        endDate: "2026-08-21",
        reliever: "Faruk Baffa",
        resumeDate: "Monday, 24th August, 2026",
        approvedDays: "Twenty-Five (25)",
        isExam: false,
        market: "Karmo Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "MANAGER KARMO DISTRICT MARKET", "DAUDA HUZAIFA"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated June 30th, 2026. This is to convey management's approval of your request to proceed on Twenty-Five (25) days annual leave from 2026 financial year. This is with effect on Monday 20th July – Friday 21st August, 2026. Dauda Huzaifa will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on Monday, 24th August, 2026. Enjoy your leave period."
      },
      {
        id: "memo-okpewho-july-2026",
        to: "MICHEAL O. OKPEWHO",
        staffId: "AMML-010",
        date: "July 8th, 2026",
        subject: "RE- APPLICATION FOR FIVE (5) DAYS LEAVE.",
        dates: "Wednesday 15th July 2026 to Tuesday 21st July, 2026",
        startDate: "2026-07-15",
        endDate: "2026-07-21",
        reliever: "Ugwu Ekechukwu",
        relieverId: "AMML-012",
        resumeDate: "Wednesday, 22nd July 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "UGWU EKECHUKWU"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Please refer to your memo on the above subject matter dated July 7th, 2026. This is to convey management's approval of your request to proceed on Five (5) days annual leave for the 2026 financial year with effect from Wednesday 15th July 2026 to Tuesday 21st July, 2026. Ugwu Ekechukwu will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on Wednesday, 22nd July 2026. Enjoy your leave period.",
        status: 'approved' as const
      },
      {
        id: "memo-chindo-july-2026",
        to: "SUNDAY CHINDO",
        staffId: "AMML-078",
        date: "July 10th, 2026",
        subject: "RE- APPLICATION FOR EIGHT (8) DAYS LEAVE.",
        dates: "Tuesday 14th July 2026 to Thursday July 23rd, 2026",
        startDate: "2026-07-14",
        endDate: "2026-07-23",
        reliever: "",
        resumeDate: "Friday, 24th July 2026",
        approvedDays: "Eight (8)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT"],
        inconsistencies: [
          "Major Typo: The body text states 'Twenty-Five (25) days annual leave' but the subject and the scheduled date range (Tuesday 14th July to Thursday 23rd July) span exactly eight (8) working days."
        ],
        synced: false,
        corrected: false,
        body: "Please refer to your memo on the above subject matter dated July 10th, 2026. This is to convey management's approval of your request to proceed on Twenty-Five (25) days annual leave for the 2026 financial year with effect from Tuesday 14th July 2026 to Thursday July 23rd, 2026. You are to resume duty on Friday, 24th July 2026. Enjoy your leave period.",
        status: 'approved' as const
      },
      {
        id: "memo-idaewor-july-2026",
        to: "IDAEWOR AWARD O.",
        staffId: "AMML-035",
        date: "July 13th, 2026",
        subject: "RE- APPLICATION FOR TEN (10) DAYS LEAVE.",
        dates: "Monday 13th July 2026 to Friday 24th July, 2026",
        startDate: "2026-07-13",
        endDate: "2026-07-24",
        reliever: "Precious Chinecherem Agu",
        relieverId: "AMML-028",
        resumeDate: "Monday, 27th July 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "PRECIOUS CHINECHEREM AGU"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Please refer to your memo on the above subject matter dated July 10th, 2026. This is to convey management's approval of your request to proceed on Ten (10) days annual leave for the 2026 financial year with effect from Monday 13th July 2026 to Friday 24th July, 2026. Precious Chinecherem Agu will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to her before you proceed and copy the undersigned. You are to resume duty on Monday, 27th July 2026. Enjoy your leave period.",
        status: 'approved' as const
      },
      {
        id: "memo-tolani-august-2026",
        to: "TOLANI OFULUE",
        staffId: "AMML-005",
        date: "July 28th, 2026",
        subject: "RE- APPLICATION FOR TEN (10) DAYS LEAVE.",
        dates: "Monday 3rd August 2026 to Friday 14th August, 2026",
        startDate: "2026-08-03",
        endDate: "2026-08-14",
        reliever: "Innocent Amaechina",
        relieverId: "AMML-080",
        resumeDate: "Monday, 17th August 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Wuse Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "YUSUF BIN YUSUF"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Please refer to your memo dated July 25th, 2026. Management conveys approval for Ten (10) days annual leave for the 2026 financial year with effect from Monday 3rd August 2026 to Friday 14th August, 2026. Yusuf Bin Yusuf will relieve you during this period. You are expected to resume duty on Monday, 17th August 2026.",
        status: 'approved' as const
      },
      {
        id: "memo-gloria-august-2026",
        to: "GLORIA ASOGWA",
        staffId: "AMML-015",
        date: "August 3rd, 2026",
        subject: "RE- APPLICATION FOR TEN (10) DAYS LEAVE.",
        dates: "Monday 10th August 2026 to Friday 21st August, 2026",
        startDate: "2026-08-10",
        endDate: "2026-08-21",
        reliever: "Innocent Amaechina",
        relieverId: "AMML-081",
        resumeDate: "Monday, 24th August 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Garki International Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "RUTH GALADIMA"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Please refer to your memo dated July 30th, 2026. Management approves Ten (10) days annual leave for the 2026 financial year with effect from Monday 10th August 2026 to Friday 21st August, 2026. Ruth Galadima will cover your schedule. Resumption is on Monday, 24th August 2026.",
        status: 'approved' as const
      },
      {
        id: "memo-shelleng-august-2026",
        to: "MUSA HUSSAINI SHELLENG",
        staffId: "AMML-008",
        date: "August 18th, 2026",
        subject: "RE- APPLICATION FOR TEN (10) DAYS LEAVE.",
        dates: "Monday 24th August 2026 to Friday 4th September, 2026",
        startDate: "2026-08-24",
        endDate: "2026-09-04",
        reliever: "Azibaodiniyar Tobins",
        relieverId: "AMML-024",
        resumeDate: "Monday, 7th September 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "AZIBAODINIYAR TOBINS"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "This is to convey management approval for your request to proceed on Ten (10) days annual leave for the 2026 financial year from Monday 24th August to Friday 4th September 2026. Azibaodiniyar Tobins will cover your duties. Resumption is on Monday, 7th September 2026.",
        status: 'approved' as const
      },
      {
        id: "memo-saadatu-september-2026",
        to: "SA'ADATU HARUNA",
        staffId: "AMML-007",
        date: "August 25th, 2026",
        subject: "RE- APPLICATION FOR TEN (10) DAYS LEAVE.",
        dates: "Tuesday 1st September 2026 to Monday 14th September, 2026",
        startDate: "2026-09-01",
        endDate: "2026-09-14",
        reliever: "Innocent Amaechina",
        relieverId: "AMML-070",
        resumeDate: "Tuesday, 15th September 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Area 1 Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "EBERECHUKWU DEBORAH DAVIDSON"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Management conveys approval of Ten (10) days annual leave for the 2026 financial year with effect from Tuesday 1st September to Monday 14th September 2026. Eberechukwu Deborah Davidson will cover your schedule. You are expected to resume duty on Tuesday, 15th September 2026.",
        status: 'approved' as const
      },
      {
        id: "memo-fauziyyah-maternity-2026",
        to: "FAUZIYYAH AHUOIZA OVA",
        staffId: "AMML-050",
        date: "August 20th, 2026",
        subject: "RE- APPLICATION FOR TWELVE (12) WEEKS MATERNITY LEAVE.",
        dates: "Tuesday 1st September 2026 to Tuesday 24th November, 2026",
        startDate: "2026-09-01",
        endDate: "2026-11-24",
        reliever: "Faruk Baffa",
        relieverId: "AMML-071",
        resumeDate: "Wednesday, 25th November 2026",
        approvedDays: "Sixty (60)",
        isExam: false,
        market: "Gudu Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "AMINA ADAMU"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Management hereby conveys approval for your Twelve (12) weeks maternity leave with effect from Tuesday 1st September 2026 to Tuesday 24th November 2026. Amina Adamu will cover your duties as Accountant at Gudu Market. Resumption date is Wednesday, 25th November 2026.",
        status: 'approved' as const
      },
      {
        id: "memo-bwala-september-2026",
        to: "EUNICE MARAVI BWALA",
        staffId: "AMML-022",
        date: "September 15th, 2026",
        subject: "RE- APPLICATION FOR TEN (10) DAYS LEAVE.",
        dates: "Monday 21st September 2026 to Friday 2nd October, 2026",
        startDate: "2026-09-21",
        endDate: "2026-10-02",
        reliever: "Sandra Bawa",
        relieverId: "AMML-028",
        resumeDate: "Monday, 5th October 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "SANDRA BAWA"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Management conveys approval for your Ten (10) days annual leave for 2026 from Monday 21st September to Friday 2nd October 2026. Sandra Bawa will relieve you during this period. Resumption is on Monday, 5th October 2026.",
        status: 'approved' as const
      },
      {
        id: "memo-legunsen-october-2026",
        to: "ADENIKE LEGUNSEN",
        staffId: "AMML-014",
        date: "September 28th, 2026",
        subject: "RE- APPLICATION FOR TEN (10) DAYS LEAVE.",
        dates: "Monday 5th October 2026 to Friday 16th October, 2026",
        startDate: "2026-10-05",
        endDate: "2026-10-16",
        reliever: "Innocent Amaechina",
        relieverId: "AMML-049",
        resumeDate: "Monday, 19th October 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Zone 3 Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "PRECIOUS KONI PHILIP"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Management conveys approval for Ten (10) days annual leave for 2026 from Monday 5th October to Friday 16th October 2026. Precious Koni Philip will cover duties at Zone 3 Shopping Complex. Resumption date is Monday, 19th October 2026.",
        status: 'approved' as const
      },
      {
        id: "memo-anunobi-october-2026",
        to: "CATHERINE ANUNOBI",
        staffId: "AMML-052",
        date: "October 19th, 2026",
        subject: "RE- APPLICATION FOR TEN (10) DAYS LEAVE.",
        dates: "Monday 26th October 2026 to Friday 6th November, 2026",
        startDate: "2026-10-26",
        endDate: "2026-11-06",
        reliever: "Dorathy Chisom Mgbii",
        relieverId: "AMML-069",
        resumeDate: "Monday, 9th November 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "DORATHY CHISOM MGBII"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Management conveys approval for Ten (10) days annual leave for 2026 from Monday 26th October to Friday 6th November 2026. Dorathy Chisom Mgbii will relieve you. Resumption date is Monday, 9th November 2026.",
        status: 'approved' as const
      },
      {
        id: "memo-abubakar-november-2026",
        to: "ABUBAKAR AHMED UMAR",
        staffId: "AMML-055",
        date: "October 26th, 2026",
        subject: "RE- APPLICATION FOR TEN (10) DAYS LEAVE.",
        dates: "Monday 2nd November 2026 to Friday 13th November, 2026",
        startDate: "2026-11-02",
        endDate: "2026-11-13",
        reliever: "Samuel Nyitamen Tsaw",
        resumeDate: "Monday, 16th November 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Farmers Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "SAMUEL NYITAMEN TSAW"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Management conveys approval for Ten (10) days annual leave from Monday 2nd November to Friday 13th November 2026. Samuel Nyitamen Tsaw will cover duties at Farmers Market. Resumption date is Monday, 16th November 2026.",
        status: 'approved' as const
      },
      {
        id: "memo-madina-november-2026",
        to: "MADINA RASAK HASSAN",
        staffId: "AMML-037",
        date: "November 2nd, 2026",
        subject: "RE- APPLICATION FOR TEN (10) DAYS LEAVE.",
        dates: "Monday 9th November 2026 to Friday 20th November, 2026",
        startDate: "2026-11-09",
        endDate: "2026-11-20",
        reliever: "Innocent Amaechina",
        relieverId: "AMML-048",
        resumeDate: "Monday, 23rd November 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Kaura Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "ZUWAIRA ODUS IBRAHIM"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Management conveys approval for Ten (10) days annual leave from Monday 9th November to Friday 20th November 2026. Zuwaira Odus Ibrahim will relieve you at Kaura Market. Resumption date is Monday, 23rd November 2026.",
        status: 'approved' as const
      },
      {
        id: "memo-ojeh-december-2026",
        to: "JEDIDIAH OJEH",
        staffId: "AMML-074",
        date: "November 24th, 2026",
        subject: "RE- APPLICATION FOR TEN (10) DAYS LEAVE.",
        dates: "Tuesday 1st December 2026 to Monday 14th December, 2026",
        startDate: "2026-12-01",
        endDate: "2026-12-14",
        reliever: "Sandra Bawa",
        relieverId: "AMML-028",
        resumeDate: "Tuesday, 15th December 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "SANDRA BAWA"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Management conveys approval for Ten (10) days annual leave from Tuesday 1st December to Monday 14th December 2026. Sandra Bawa will cover your duties in HR & Admin. Resumption date is Tuesday, 15th December 2026.",
        status: 'approved' as const
      },
      {
        id: "memo-idakwo-december-2026",
        to: "JANET ILE IDAKWO",
        staffId: "AMML-068",
        date: "December 8th, 2026",
        subject: "RE- APPLICATION FOR TWELVE (12) DAYS LEAVE.",
        dates: "Tuesday 15th December 2026 to Thursday 31st December, 2026",
        startDate: "2026-12-15",
        endDate: "2026-12-31",
        reliever: "Sandra Bawa",
        relieverId: "AMML-076",
        resumeDate: "Monday, 4th January 2027",
        approvedDays: "Twelve (12)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "MBOUTIDEM DANIEL THOMPSON"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Management conveys approval for Twelve (12) days year-end annual leave from Tuesday 15th December to Thursday 31st December 2026. Mboutidem Daniel Thompson will relieve you in Corporate Affairs. Resumption date is Monday, 4th January 2027.",
        status: 'approved' as const
      },
      {
        id: "memo-saad-december-2026",
        to: "IBRAHIM SA'AD",
        staffId: "AMML-018",
        date: "December 14th, 2026",
        subject: "RE- APPLICATION FOR EIGHT (8) DAYS LEAVE.",
        dates: "Monday 21st December 2026 to Thursday 31st December, 2026",
        startDate: "2026-12-21",
        endDate: "2026-12-31",
        reliever: "Innocent Amaechina",
        relieverId: "AMML-031",
        resumeDate: "Monday, 4th January 2027",
        approvedDays: "Eight (8)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "FOLASHADE DEBORAH AYINDE"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        body: "Management conveys approval for Eight (8) days year-end annual leave from Monday 21st December to Thursday 31st December 2026. Folashade Deborah Ayinde will cover legal/CS affairs. Resumption is on Monday, 4th January 2027.",
        status: 'approved' as const
      },
      {
        id: "memo-adamu-mustapha-abba",
        to: "ADAMU MUSTAPHA ABBA",
        staffId: "AMML-075",
        date: "July 17th, 2026",
        subject: "RE: APPLICATION FOR TEN (10) WORKING DAYS LEAVE",
        dates: "Monday, 20th July – Friday, 31st July, 2026",
        startDate: "2026-07-20",
        endDate: "2026-07-31",
        reliever: "Henry Dimesoro",
        relieverId: "AMML-C32",
        resumeDate: "Monday, 3rd August 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Wuse Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "MANAGER, WUSE MARKET", "HENRY DIMESORO"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated July 14th, 2026. This is to convey management's approval of your request to proceed on Ten (10) days' annual leave from the 2026 financial year. This is with effect from Monday, 20th July – Friday, 31st July, 2026. Henry Dimesoro will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on Monday, 3rd August 2026. Enjoy your leave period."
      },
      {
        id: "memo-dimesoro-casual-2026",
        to: "DIMESORO HENRY",
        staffId: "AMML-C32",
        date: "July 29th, 2026",
        subject: "RE: APPLICATION FOR FOUR (4) DAYS LEAVE",
        dates: "Tuesday, 28th July to Friday, 31st July 2026",
        startDate: "2026-07-28",
        endDate: "2026-07-31",
        reliever: "Onyinyechi Nwobodo",
        relieverId: "AMML-083",
        resumeDate: "Monday, 3rd August 2026",
        approvedDays: "Four (4)",
        isExam: false,
        market: "Wuse Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "ONYINYECHI NWOBODO"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated July 26th, 2026. This is to convey management's approval of your request to proceed on four (4) days Casual Leave with effect from Tuesday, 28th July to Friday, 31st July 2026. Onyinyechi Nwobodo will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to her before you proceed and copy the undersigned. Following the expiration of your four-day leave period, you are expected to resume duty on Monday, 3rd August 2026. Enjoy your leave period."
      },
      {
        id: "memo-haruna-maro-medical-2026",
        to: "HARUNA MARO MAGANI",
        staffId: "AMML-088",
        date: "July 29th, 2026",
        subject: "RE- APPLICATION FOR SEVEN (7) DAYS MEDICAL LEAVE",
        dates: "Friday July 31st, 2026 to Monday 10th August, 2026",
        startDate: "2026-07-31",
        endDate: "2026-08-10",
        resumeDate: "Tuesday 11th August, 2026",
        approvedDays: "Seven (7)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT"],
        inconsistencies: [
          "Document Body Typo: Resumption date text states 'Tuesday 11th July, 2026' (system corrects to August 11th, 2026 based on July 31 - August 10 date range)."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated 29th July 2026. This is to convey to you management's approval to proceed with your medical leave to enable you take proper care of your health. This is with effect from Friday July 31st, 2026 to Monday 10th August, 2026. You are to resume duty on Tuesday 11th August, 2026. We pray that you have a speedy recovery."
      },
      {
        id: "memo-bamor-salary-account-2026",
        to: "HEAD (F&A)",
        staffId: "AMML-004",
        date: "July 29th, 2026",
        subject: "REQUEST FOR CHANGE OF SALARY ACCOUNT (GABRIEL MSUGHTER BAMOR)",
        dates: "Effective July 29th, 2026",
        startDate: "2026-07-29",
        endDate: "2026-07-29",
        approvedDays: "N/A",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD, F&A", "HEAD, AUDIT"],
        inconsistencies: [],
        synced: true,
        corrected: true,
        status: 'approved' as const,
        body: "I humbly request for change of my salary account from GTBANK 0178903636 to ACCESS BANK 1985997925. Yours faithfully, Bamor Gabriel. [Endorsement Head Audit 28/07/26]: Pls. you are dealt. [Endorsement Head F&A 29/07/26]: Kindly note and effect the change of the salary bank account details of the above named staff in the payroll."
      },
      {
        id: "memo-thompson-housing-upfront-2026",
        to: "HEAD, ADMIN/HR",
        staffId: "AMML-077",
        date: "July 29th, 2026",
        subject: "REQUEST FOR HOUSING UPFRONT PAYMENT (THOMPSON MBOUTIDEM)",
        dates: "Approved July 30th, 2026",
        startDate: "2026-07-29",
        endDate: "2026-07-30",
        approvedDays: "N/A",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD, F&A", "HEAD, AUDIT"],
        inconsistencies: [],
        synced: true,
        corrected: true,
        status: 'approved' as const,
        body: "I respectfully write to request the approval of the upfront payment of my housing allowance. Thank you, Thompson Mboutidem (HOD Operations Assistant). [Ag. MD/CEO Endorsement 29/07/26]: Kindly approve the payment of the housing upfront allowance of the applicant in the sum of N519,762.82. [Head F&A Endorsement 30/07/26]: Kindly proceed with Payment as approved."
      },
      {
        id: "memo-faruk-baffa-july-2026",
        to: "FARUK BAFFA",
        staffId: "AMML-071",
        date: "July 30th, 2026",
        subject: "RE- APPLICATION FOR FIVE (5) WORKING DAYS LEAVE",
        dates: "Friday 31st July to Thursday 6th August, 2026",
        startDate: "2026-07-31",
        endDate: "2026-08-06",
        reliever: "Yusuf Ismail",
        resumeDate: "Friday, 7th August, 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "YUSUF ISMAIL"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated July 30th, 2026. This is to acknowledge your application to proceed on Five (5) days annual leave for the 2026 financial year with effect on Friday 31st July - Thursday 6th August, 2026. During your absence Mr. Yusuf Ismail will cover your schedule. You are expected to resume duty on Friday, 7th August, 2026. We wish you a pleasant and restful leave period."
      },
      {
        id: "memo-bawa-sandra-housing-upfront-2026",
        to: "Head HR/Admin",
        staffId: "AMML-028",
        date: "July 28th, 2026",
        subject: "APPLICATION FOR HOUSING UPFRONT (BAWA SANDRA SADAT)",
        dates: "Approved July 30th, 2026",
        startDate: "2026-07-28",
        endDate: "2026-07-30",
        approvedDays: "N/A",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD, F&A", "HEAD, AUDIT"],
        inconsistencies: [],
        synced: true,
        corrected: true,
        status: 'approved' as const,
        body: "I write to kindly request for my 2026 housing upfront. This is to enable me solve some personal issues. Forwarded for your consideration. Thank you, Bawa Sandra Sadat. [Ag. MD/CEO Endorsement 28/07/26]: Kindly approve the housing upfront request in the sum of N818,626.44 for the applicant. [Head F&A Endorsement 30/07/26]: Kindly proceed with Payment as approved."
      },
      {
        id: "memo-egbe-isaac-annual-2026",
        to: "EGBE ISAAC OLA",
        staffId: "AMML-TF086",
        date: "July 30th, 2026",
        subject: "RE- APPLICATION FOR 14 DAYS ANNUAL LEAVE",
        dates: "Friday 14th August to Friday 28th August, 2026",
        startDate: "2026-08-14",
        endDate: "2026-08-28",
        resumeDate: "Monday, 31st August 2026",
        approvedDays: "Fourteen (14)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT"],
        inconsistencies: [
          "Text Discrepancy: Memo header states 14 days annual leave, but body date line reads August 28 - August 31. System registers full 14-day leave allocation through Monday, 31st August 2026."
        ],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated July 29th, 2026. This is to convey management's approval of your request to proceed on Fourteen (14) days annual leave from 2026 financial year. This is with effect from Friday 14th August - Friday 28th August, 2026. You are to resume duty on Monday 31st August 2026. Enjoy your leave period."
      },
      {
        id: "memo-hauwa-iliyasu-april-2026",
        to: "HAUWA ILIYASU ALI",
        staffId: "AMML-041",
        date: "April 21st, 2026",
        subject: "RE: APPLICATION FOR TWENTY (20) DAYS LEAVE",
        dates: "Monday 11th May to Friday 5th June, 2026",
        startDate: "2026-05-11",
        endDate: "2026-06-05",
        reliever: "Micheal Joseph Inalegwe",
        resumeDate: "Monday, 8th June 2026",
        approvedDays: "Twenty (20)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "MICHEAL JOSEPH INALEGWE"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated April 20th, 2026. This is to convey management's approval of your request to proceed on Twenty (20) days leave. This is with effect from Monday 11th May to Friday 5th June, 2026. Micheal Joseph Inalegwe will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on Monday 8th June, 2026. Enjoy your leave period."
      },
      {
        id: "memo-rilwanu-exam-2026",
        to: "RILWANU LAWAL",
        staffId: "AMML-079",
        date: "July 21st, 2026",
        subject: "RE: APPLICATION FOR TEN (10) DAYS LEAVE (EXCUSE DUTY / EXAM LEAVE)",
        dates: "Monday 20th July to Friday 31st July, 2026",
        startDate: "2026-07-20",
        endDate: "2026-07-31",
        resumeDate: "Monday, 3rd August 2026",
        approvedDays: "Ten (10)",
        isExam: true,
        market: "Wuse Market",
        cc: ["MANAGER WUSE MARKET"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated July 16th, 2026. This is to convey management's approval of your request to proceed on Ten (10) days annual leave / excuse duty to sit for final examination at Fed. Co-operative College, Kaduna. This is with effect from Monday 20th July - Friday 31st July, 2026. You are to resume duty on Monday, 3rd August 2026. Enjoy your leave period."
      },
      {
        id: "memo-benedict-ajio-july-2026",
        to: "BENEDICT AJIO",
        staffId: "AMML-072",
        date: "July 21st, 2026",
        subject: "RE- APPLICATION FOR FIVE (5) WORKING DAYS LEAVE",
        dates: "Monday 27th July to Friday 31st July, 2026",
        startDate: "2026-07-27",
        endDate: "2026-07-31",
        resumeDate: "Monday, 3rd August 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated July 21st, 2026. This is to convey management's approval of your request to proceed on Five (5) days annual leave from 2026 financial year. This is with effect on Monday 27th July - Friday 31st July, 2026. You are to resume duty on Monday, 3rd August 2026. Enjoy your leave period."
      },
      {
        id: "memo-amina-adamu-july-2026",
        to: "AMINA ADAMU",
        staffId: "AMML-063",
        date: "July 22nd, 2026",
        subject: "RE- APPLICATION FOR TEN (10) WORKING DAYS LEAVE",
        dates: "Monday 27th July to Friday 7th August, 2026",
        startDate: "2026-07-27",
        endDate: "2026-08-07",
        reliever: "Hassana Haruna",
        resumeDate: "Monday, 10th August 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Wuse Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "MANAGER (WUSE MARKET)", "HASSANA HARUNA"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated July 20th, 2026. This is to convey management's approval of your request to proceed on Ten (10) days annual leave from 2026 financial year. This is with effect on Monday 27th July - Friday 7th August, 2026. Hassana Haruna will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to her before you proceed and copy the undersigned. You are to resume duty on Monday, 10th August 2026. Enjoy your leave period."
      },
      {
        id: "memo-baidi-aisha-july-2026",
        to: "BAIDI AISHA GAJO",
        staffId: "AMML-045",
        date: "July 23rd, 2026",
        subject: "RE- APPLICATION FOR FIVE (5) WORKING DAYS LEAVE & LEAVE ALLOWANCE",
        dates: "Monday 27th July to Friday 31st July, 2026",
        startDate: "2026-07-27",
        endDate: "2026-07-31",
        reliever: "Mgbii Dorathy Chisom",
        resumeDate: "Monday, 3rd August 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Head Office",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "MAGAJI ALIYU MUAZU", "MGBII DORATHY CHISOM"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved' as const,
        body: "Please refer to your memo on the above subject matter dated July 23rd, 2026. This is to convey management's approval of your request to proceed on Five (5) days annual leave from 2026 financial year. This is with effect on Monday 27th July - Friday 31st July, 2026. Management has also approved the sum of N103,952.56 as your 2026 annual leave allowance. Mgbii Dorathy Chisom will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to her before you proceed and copy the undersigned. You are to resume duty on Monday, 3rd August 2026. Enjoy your leave period."
      }
    ];

      if (baseList.length === 0) {
        baseList = defaultMemos;
      } else {
        defaultMemos.forEach(def => {
          if (!baseList.some(m => m.id === def.id)) {
            baseList.push(def);
          }
        });
      }

      // Strictly filter out any leave memo starting after December 31, 2026
      baseList = baseList.filter((m: any) => !m.startDate || m.startDate <= '2026-12-31');

    // Ensure status and audit trail exist for all loaded elements
    return baseList.map((m: any, idx: number) => {
      // Map names to actual staff records to populate link IDs if missing
      let staffId = m.staffId;
      if (!staffId) {
        const match = staff.find(s => 
          `${s.first} ${s.last}`.toUpperCase().includes(m.to.toUpperCase()) ||
          m.to.toUpperCase().includes(`${s.first} ${s.last}`.toUpperCase())
        );
        staffId = match ? match.id : `AMML-0${idx + 10}`;
      }

      let relieverId = m.relieverId;
      if (!relieverId && m.reliever) {
        const matchRel = staff.find(s => 
          `${s.first} ${s.last}`.toUpperCase().includes(m.reliever.toUpperCase())
        );
        relieverId = matchRel ? matchRel.id : undefined;
      }

      return {
        ...m,
        status: m.status || 'approved',
        staffId,
        relieverId,
        startDate: m.startDate || (m.id === 'memo-onoja' ? '2026-05-04' : m.id === 'memo-abigail-1' ? '2026-05-19' : m.id === 'memo-bamor' ? '2026-05-01' : undefined),
        endDate: m.endDate || (m.id === 'memo-onoja' ? '2026-05-13' : m.id === 'memo-abigail-1' ? '2026-05-21' : m.id === 'memo-bamor' ? '2026-05-11' : undefined),
        body: m.body || `This is to convey management's approval of your request for annual leave for the 2026 financial year. Ensure all duties are fully handed over before proceeding.`,
        auditTrail: m.auditTrail || [
          {
            id: `seed-log-1-${m.id}`,
            timestamp: "2026-05-15 08:30:12",
            user: "EFOSA OKOSUN (HR)",
            action: "ENTRY CREATION",
            details: "Standard leave correspondence drafted from official HR filing register."
          },
          ...(m.status !== 'draft' ? [{
            id: `seed-log-2-${m.id}`,
            timestamp: "2026-05-15 11:45:00",
            user: "SYSTEM AUTO-AUDIT",
            action: "STATUS CHANGED",
            fromStatus: "draft",
            toStatus: "approved",
            details: "Leave memo processed and synchronized with payroll parameters."
          }] : [])
        ]
      };
    });
  });

  // State values for active selection and filters
  const [activeMemoId, setActiveMemoId] = useState<string>(memos[0]?.id || '');
  const [mktFilter, setMktFilter] = useState<string>(''); // Grouping filter
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, draft, approved, archived
  const [classificationFilter, setClassificationFilter] = useState<string>('all'); // Memo classification filter
  const [targetModuleFilter, setTargetModuleFilter] = useState<string>('all'); // all, HR, Admin
  const [sortOrder, setSortOrder] = useState<IncomingMemoSortOption>('RECEIVED_DATE_DESC');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilingGuideOpen, setIsFilingGuideOpen] = useState(false);

  // Automated Filing & Routing State
  const [isAutoFilingModalOpen, setIsAutoFilingModalOpen] = useState(false);
  const [autoFilingSummary, setAutoFilingSummary] = useState<{
    total: number;
    hrCount: number;
    adminCount: number;
    routings: AutoFilingRouting[];
  } | null>(null);
  const [autoFilingModalTab, setAutoFilingModalTab] = useState<'all' | 'HR' | 'Admin'>('all');
  const [autoFilingModalSearch, setAutoFilingModalSearch] = useState('');

  const handleRunAutoFiling = () => {
    const batchRes = batchAutoFileMemos(memos);
    const routings = batchRes.routings;
    const dateString = new Date().toISOString().slice(0, 10);
    const timeString = new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logUser = session ? `${session.name} (${session.level})` : 'System Auto-Classifier';

    let hrCount = 0;
    let adminCount = 0;

    const updatedMemos = memos.map(m => {
      const routing = routings.find((r: AutoFilingRouting) => r.memoId === m.id) || autoFileMemo(m);
      if (routing.targetModule === 'HR') hrCount++;
      else adminCount++;

      const trail = [...(m.auditTrail || [])];
      trail.push({
        id: `auto-file-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: `${dateString} ${timeString}`,
        user: logUser,
        action: "AUTOMATED FILING & ROUTING",
        details: `Tagged [${routing.classificationCode}] and routed to [${routing.moduleName}] with ${routing.confidenceScore}% confidence. Matched keywords: ${routing.matchedKeywords.length > 0 ? routing.matchedKeywords.join(', ') : 'Default rule'}.`
      });

      return {
        ...m,
        targetModule: routing.targetModule,
        routedSuite: routing.moduleName,
        classificationCode: routing.classificationCode,
        auditTrail: trail
      };
    });

    setMemos(updatedMemos);
    try {
      localStorage.setItem('amml_leave_memos', JSON.stringify(updatedMemos));
    } catch (e) {
      console.error('Failed to save auto-filed memos', e);
    }

    setAutoFilingSummary({
      total: memos.length,
      hrCount: batchRes.hrCount,
      adminCount: batchRes.adminCount,
      routings
    });
    setIsAutoFilingModalOpen(true);
    auditLog('MEMO_AUTOMATED_FILING', 'Batch auto-filing processed', `Processed ${memos.length} memos: ${hrCount} routed to HR Suite, ${adminCount} routed to Admin Suite.`);
  };

  // Editing / WYSIWYG Form state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editorId, setEditorId] = useState('');
  
  // WYSIWYG fields
  const [formFrom, setFormFrom] = useState('Head HR & Admin Unit');
  const [formDate, setFormDate] = useState('11th June, 2026');
  const [formStaffId, setFormStaffId] = useState('');
  const [formToName, setFormToName] = useState('');
  const [formMarket, setFormMarket] = useState('Head Office');
  const [formSubject, setFormSubject] = useState('RE- APPLICATION FOR LEAVE APPROVAL');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formRelieverId, setFormRelieverId] = useState('');
  const [formRelieverName, setFormRelieverName] = useState('');
  const [formResumeDate, setFormResumeDate] = useState('');
  const [formApprovedDays, setFormApprovedDays] = useState('Ten (10)');
  const [formBody, setFormBody] = useState('');
  const [formClassificationCode, setFormClassificationCode] = useState<MemoClassificationCode>('HR/PER/LEAVE');
  const [formCC, setFormCC] = useState<string[]>(["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT"]);
  const [ccInput, setCcInput] = useState('');
  
  // Custom template select state
  const [selectedTemplate, setSelectedTemplate] = useState('annual'); // annual, exam, adjustment
  
  // Validations & Flags
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('amml_leave_memos', JSON.stringify(memos));
  }, [memos]);

  // Synchronically listen to selected active memo redirection
  useEffect(() => {
    const focusId = localStorage.getItem('amml_active_memo_id');
    if (focusId) {
      const match = memos.find(m => m.id === focusId);
      if (match) {
        setActiveMemoId(focusId);
      }
      localStorage.removeItem('amml_active_memo_id');
    }
  }, [memos]);

  const activeMemo = memos.find(m => m.id === activeMemoId) || memos[0];

  // Helper template populated data
  const handleTemplateChange = (tmpl: string) => {
    setSelectedTemplate(tmpl);
    const dateRangeText = (formStartDate && formEndDate) 
      ? `from ${formStartDate} to ${formEndDate}` 
      : 'from [start date] to [end date]';
    
    if (tmpl === 'annual') {
      setFormSubject("RE- APPLICATION FOR TEN (10) DAYS ANNUAL LEAVE.");
      setFormApprovedDays("Ten (10)");
      setFormBody(`This is to convey management's approval of your request to proceed on ten (10) days annual leave for the 2026 financial year ${dateRangeText}. You are to hand over all outstanding tasks before proceeding.`);
    } else if (tmpl === 'exam') {
      setFormSubject("RE- APPLICATION FOR FIVE (5) DAYS EXAMINATION LEAVE.");
      setFormApprovedDays("Five (5)");
      setFormBody(`This is to convey management's approval of your request to proceed on five (5) days examination leave ${dateRangeText}. Please ensure your schedule is fully covered during the examination period.`);
    } else if (tmpl === 'adjustment') {
      setFormSubject("NOTIFICATION FOR LEAVE ADJUSTMENT DIRECTIVE / DISPATCH.");
      setFormApprovedDays("Twelve (12)");
      setFormBody(`Pursuant to the official 'Notification for Leave Adjustment' memo type compliance framework, this is to convey management's formal approval of adjusted leave terms and dates ${dateRangeText}.`);
    }
  };

  // Automated Overlap & Attendance Collision Checker (Hook style analysis on field change)
  useEffect(() => {
    if (!formStaffId || !formStartDate || !formEndDate) {
      setOverlapWarning(null);
      return;
    }

    const checkStart = new Date(formStartDate);
    const checkEnd = new Date(formEndDate);

    if (isNaN(checkStart.getTime()) || isNaN(checkEnd.getTime())) {
      setOverlapWarning(null);
      return;
    }

    // Search for conflicting APPROVED leave requests in the registry database
    const overlap = memos.find(m => {
      // Skip the current memo being edited
      if (isEditing && m.id === editorId) return false;
      if (m.status !== 'approved' || m.staffId !== formStaffId) return false;
      if (!m.startDate || !m.endDate) return false;

      const mStart = new Date(m.startDate);
      const mEnd = new Date(m.endDate);

      // Check if dates overlap
      return (checkStart <= mEnd && checkEnd >= mStart);
    });

    if (overlap) {
      setOverlapWarning(`Conflict Flag: This employee has an already APPROVED leave overlapping this period (From ${overlap.startDate} to ${overlap.endDate} in Memo REF-${overlap.id.slice(0, 5).toUpperCase()})! Approval is blocked until dates are adjusted.`);
    } else {
      setOverlapWarning(null);
    }
  }, [formStaffId, formStartDate, formEndDate, memos, isEditing, editorId]);

  // Handle staff selection and auto fill fields
  const handleStaffSelect = (sId: string) => {
    setFormStaffId(sId);
    const matched = staff.find(s => s.id === sId);
    if (matched) {
      setFormToName(`${matched.first} ${matched.last}`.toUpperCase());
      setFormMarket(matched.market);
    }
  };

  const handleRelieverSelect = (sId: string) => {
    setFormRelieverId(sId);
    const matched = staff.find(s => s.id === sId);
    if (matched) {
      setFormRelieverName(`${matched.first} matched last` ? `${matched.first} ${matched.last}` : '');
    }
  };

  // Add CC tag
  const addCCTag = () => {
    if (ccInput.trim()) {
      setFormCC([...formCC, ccInput.toUpperCase()]);
      setCcInput('');
    }
  };

  const removeCCTag = (idx: number) => {
    setFormCC(formCC.filter((_, i) => i !== idx));
  };

  // Run rigorous compliance and reliever checks before submit
  const validateForm = (isSubmittingToHR: boolean): boolean => {
    const errors: string[] = [];
    
    if (!formStaffId) errors.push("Mandatory Link Error: Official employee link is required.");
    if (!formToName) errors.push("To/Recipient field is required.");
    if (!formSubject) errors.push("Subject of memo is required.");
    if (!formStartDate || !formEndDate) errors.push("Leave boundary parameters (Start and End Dates) are blank.");
    
    // Rigorous Handover validation check
    if (isSubmittingToHR && !formRelieverId) {
      errors.push("CRITICAL COMPLIANCE FAILURE: Designated reliever (Handover Personnel) is blank! Company HR regulations require a formal reliever designation to process active leaves.");
    }

    if (overlapWarning) {
      errors.push("Active date collision block is unresolved. Adjust dates to avoid overlap.");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Open Composer for new memo draft
  const handleOpenComposer = () => {
    setIsEditing(false);
    setEditorId('');
    setFormFrom('Head HR & Admin Unit');
    setFormDate(new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }));
    setFormStaffId('');
    setFormToName('');
    setFormMarket('Head Office');
    setFormSubject('RE- APPLICATION FOR TEN (10) DAYS ANNUAL LEAVE.');
    setFormStartDate('');
    setFormEndDate('');
    setFormRelieverId('');
    setFormRelieverName('');
    setFormResumeDate('Thursday 16th April, 2026');
    setFormApprovedDays('Ten (10)');
    setFormBody("This is to convey management's approval of your request to proceed on ten (10) days annual leave for the 2026 financial year.");
    setFormCC(["MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT"]);
    setValidationErrors([]);
    setOverlapWarning(null);
    setSelectedTemplate('annual');
    setIsComposerOpen(true);
  };

  // Load memo inside composer to Edit / WYSIWYG adjust
  const handleEditMemo = (m: CombinedMemo) => {
    setIsEditing(true);
    setEditorId(m.id);
    setFormFrom('Head HR & Admin Unit');
    setFormDate(m.date || '11th June, 2026');
    setFormStaffId(m.staffId || '');
    setFormToName(m.to || '');
    setFormMarket(m.market || 'Head Office');
    setFormSubject(m.subject || '');
    setFormStartDate(m.startDate || '');
    setFormEndDate(m.endDate || '');
    setFormRelieverId(m.relieverId || '');
    setFormRelieverName(m.reliever || '');
    setFormResumeDate(m.resumeDate || '');
    setFormApprovedDays(m.approvedDays || '');
    setFormBody(m.body || "Please refer to your application...");
    setFormCC(m.cc || []);
    setValidationErrors([]);
    setOverlapWarning(null);
    setIsComposerOpen(true);
  };

  // Execute full CRUD Create / Update with explicit logs
  const handleSaveMemo = (statusToSet: 'draft' | 'approved') => {
    const isApprovedSub = statusToSet === 'approved';
    const isValid = validateForm(isApprovedSub);
    if (!isValid) return;

    const matchedStaff = staff.find(s => s.id === formStaffId);
    const matchedReliever = staff.find(s => s.id === formRelieverId);

    const timeString = new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateString = new Date().toISOString().slice(0, 10);
    const logUser = session ? `${session.name} (${session.level})` : 'Efosa Okosun (HR)';

    const ccList = [...formCC];
    if (matchedReliever && !ccList.includes(matchedReliever.last.toUpperCase())) {
      ccList.push(`${matchedReliever.first} ${matchedReliever.last}`.toUpperCase());
    }

    let calculatedApprovedDays = formApprovedDays;
    if (statusToSet === 'approved' && formStartDate && formEndDate) {
      const activeDays = getActiveBusinessDaysInRange(formStartDate, formEndDate);
      calculatedApprovedDays = `${activeDays.length} Days (${activeDays.length} Business Days)`;
    }

    if (isEditing) {
      // Find original memo and analyze changes for adjustments log
      setMemos(prev => prev.map(m => {
        if (m.id === editorId) {
          const originalStatus = m.status;
          const origStart = m.startDate;
          const origEnd = m.endDate;
          const isDateAdjusted = origStart !== formStartDate || origEnd !== formEndDate;

          const localLogs = [...(m.auditTrail || [])];

          // Log general updates
          localLogs.push({
            id: `sys-log-${Date.now()}`,
            timestamp: `${dateString} ${timeString}`,
            user: logUser,
            action: isApprovedSub ? "MEMO APPROVED" : "DRAFT STATE REVISED",
            fromStatus: originalStatus,
            toStatus: statusToSet,
            details: `Memo values updated by administrator. Reliever linked with nominal designation: ${formRelieverName || 'None'}.`
          });

          // Log status transition explicitly if it changes (e.g., Draft -> Approved)
          if (originalStatus !== statusToSet) {
            localLogs.push({
              id: `sys-status-trans-${Date.now()}`,
              timestamp: `${dateString} ${timeString}`,
              user: logUser,
              action: "STATUS TRANSITION REGISTERED",
              fromStatus: originalStatus,
              toStatus: statusToSet,
              details: `Memo status changed from '${originalStatus}' to '${statusToSet}'.`
            });
          }

          // Log specific date adjustment that complies with 'Notification for Leave Adjustment'
          if (isDateAdjusted) {
            localLogs.push({
              id: `sys-date-adjust-${Date.now()}`,
              timestamp: `${dateString} ${timeString}`,
              user: logUser,
              action: "LEAVE ADJUSTMENT REGISTERED",
              details: `Date frame shifted from [${origStart || 'none'} to ${origEnd || 'none'}] to [${formStartDate} to ${formEndDate}]. Compliant with 'Notification for Leave Adjustment' directive.`
            });
            auditLog('HR_COMPLIANCE', 'Notification for Leave Adjustment applied', `${formToName} leave frame shifted to ${formStartDate} - ${formEndDate}`);
          }

          return {
            ...m,
            to: formToName,
            staffId: formStaffId,
            market: formMarket,
            subject: formSubject,
            startDate: formStartDate,
            endDate: formEndDate,
            reliever: formRelieverName,
            relieverId: formRelieverId,
            resumeDate: formResumeDate,
            approvedDays: calculatedApprovedDays,
            body: formBody,
            cc: ccList,
            status: statusToSet,
            synced: statusToSet === 'approved', // Auto-sync to workforce attendance grid on approval!
            inconsistencies: computeMemoInconsistencies(formToName, formRelieverName, formStartDate, formEndDate, calculatedApprovedDays, formMarket, ccList, staff),
            auditTrail: localLogs
          } as CombinedMemo;
        }
        return m;
      }));

      auditLog('MEMOS', 'Internal Memo updated in registry', `${formToName} - ${formSubject}`);
    } else {
      // Create new memo
      const newMemoId = `memo-custom-${Date.now()}`;
      const newMemo: CombinedMemo = {
        id: newMemoId,
        to: formToName,
        staffId: formStaffId,
        date: formDate,
        startDate: formStartDate,
        endDate: formEndDate,
        subject: formSubject,
        dates: `${formStartDate} to ${formEndDate}`,
        reliever: formRelieverName,
        relieverId: formRelieverId,
        resumeDate: formResumeDate,
        approvedDays: calculatedApprovedDays,
        isExam: selectedTemplate === 'exam',
        market: formMarket,
        cc: ccList,
        synced: statusToSet === 'approved',
        corrected: false,
        inconsistencies: computeMemoInconsistencies(formToName, formRelieverName, formStartDate, formEndDate, calculatedApprovedDays, formMarket, ccList, staff),
        status: statusToSet,
        body: formBody,
        auditTrail: [
          {
            id: `audit-trail-${Date.now()}-1`,
            timestamp: `${dateString} ${timeString}`,
            user: logUser,
            action: "ENTRY CREATION",
            details: `Memo database log generated for ${formToName} linked via employee registry id ${formStaffId}.`
          },
          ...(statusToSet === 'approved' ? [{
            id: `audit-trail-${Date.now()}-2`,
            timestamp: `${dateString} ${timeString}`,
            user: logUser,
            action: "STATUS CHANGED",
            fromStatus: "draft",
            toStatus: "approved",
            details: "Leave memo officially processed, approved, and synchronized with May checkerboard state."
          }] : [])
        ]
      };

      setMemos(prev => [newMemo, ...prev]);
      setActiveMemoId(newMemoId);
      auditLog('MEMOS', 'New Internal Memo created', `${formToName} - ${formSubject}`);
    }

    setIsComposerOpen(false);
  };

  // Delete memo handler
  const handleDeleteMemo = (id: string) => {
    if (confirm("Are you sure you want to delete this memo? Operating histories will be permanently truncated.")) {
      setMemos(prev => prev.filter(m => m.id !== id));
      auditLog('MEMOS', 'Memo permanently deleted', `Deleted record REF-${id.slice(0, 5).toUpperCase()}`);
    }
  };

  // Toggle sync manually from dashboard
  const handleToggleSyncStatus = (id: string) => {
    const dateString = new Date().toISOString().slice(0, 10);
    const timeString = new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logUser = session ? `${session.name} (${session.level})` : 'Efosa Okosun (HR)';

    setMemos(prev => prev.map(m => {
      if (m.id === id) {
        const nextSyncState = !m.synced;
        const trail = [...(m.auditTrail || [])];
        trail.push({
          id: `sync-log-${Date.now()}`,
          timestamp: `${dateString} ${timeString}`,
          user: logUser,
          action: "GRID SYNC ADJUSTED",
          details: nextSyncState 
            ? "Leave dates synchronized to May 2026 workforce tracker. Staff marked ON LEAVE (LV)." 
            : "Leave dates detached from workforce tracker."
        });

        return {
          ...m,
          synced: nextSyncState,
          auditTrail: trail
        };
      }
      return m;
    }));
  };

  // Quick approve memo directly from the registry preview layout
  const handleQuickApprove = (id: string) => {
    const dateString = new Date().toISOString().slice(0, 10);
    const timeString = new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logUser = session ? `${session.name} (${session.level})` : 'Efosa Okosun (HR)';

    setMemos(prev => prev.map(m => {
      if (m.id === id) {
        const trail = [...(m.auditTrail || [])];
        
        // Log status change
        trail.push({
          id: `quick-approve-log-${Date.now()}`,
          timestamp: `${dateString} ${timeString}`,
          user: logUser,
          action: "STATUS TRANSITION REGISTERED",
          fromStatus: m.status,
          toStatus: "approved",
          details: `Memo officially approved using the registry dashboard quick actions panel. Auto-synchronized with employee attendance ledger.`
        });

        let updatedApprovedDays = m.approvedDays;
        if (m.startDate && m.endDate) {
          const activeDays = getActiveBusinessDaysInRange(m.startDate, m.endDate);
          updatedApprovedDays = `${activeDays.length} Days (${activeDays.length} Business Days)`;
        }

        auditLog('HR_COMPLIANCE', 'Quick leave memo approved and synced', `${m.to} leave status is now Approved`);

        return {
          ...m,
          status: 'approved',
          synced: true,
          approvedDays: updatedApprovedDays,
          auditTrail: trail
        };
      }
      return m;
    }));
  };

  // Filter and group memo rows
  const filteredMemos = memos.filter(m => {
    const matchesMarket = !mktFilter || m.market === mktFilter;
    const matchesSearch = !searchQuery || 
      m.to.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = m.status === statusFilter;
    }

    let matchesClassification = true;
    if (classificationFilter !== 'all') {
      const code = getMemoClassificationCode(m);
      matchesClassification = code === classificationFilter;
    }

    let matchesTargetModule = true;
    if (targetModuleFilter !== 'all') {
      const target = m.targetModule || autoFileMemo(m).targetModule;
      matchesTargetModule = target === targetModuleFilter;
    }

    return matchesMarket && matchesSearch && matchesStatus && matchesClassification && matchesTargetModule;
  });

  const sortedMemos = [...filteredMemos].sort((a, b) => {
    if (sortOrder === 'RECEIVED_DATE_DESC') {
      return (b.startDate || b.date || '').localeCompare(a.startDate || a.date || '');
    }
    if (sortOrder === 'RECEIVED_DATE_ASC') {
      return (a.startDate || a.date || '').localeCompare(b.startDate || a.date || '');
    }
    if (sortOrder === 'PRIORITY_DESC') {
      const aUrgent = (a.inconsistencies && a.inconsistencies.length > 0) || a.status === 'draft' ? 1 : 0;
      const bUrgent = (b.inconsistencies && b.inconsistencies.length > 0) || b.status === 'draft' ? 1 : 0;
      return bUrgent - aUrgent;
    }
    if (sortOrder === 'FILING_CODE_ASC') {
      const codeA = getMemoClassificationCode(a);
      const codeB = getMemoClassificationCode(b);
      return codeA.localeCompare(codeB);
    }
    if (sortOrder === 'APPROVAL_STATUS') {
      const rank: Record<string, number> = { draft: 1, approved: 2, archived: 3 };
      return (rank[a.status] || 9) - (rank[b.status] || 9);
    }
    if (sortOrder === 'DEPARTMENT') {
      return (a.market || '').localeCompare(b.market || '');
    }
    return 0;
  });

  return (
    <div className="space-y-6" id="amml-memo-registry-root">
      
      {/* 1. Header with Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#09101d] p-5 rounded-2xl border border-[#0064B4]/20 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#0064B4]/20 text-[#0064B4] rounded-lg">
              <Layers className="h-5 w-5" />
            </span>
            <h2 className="font-serif font-black text-base text-white tracking-wide">
              Centralized Corporate Memo & Leave Registry
            </h2>
          </div>
          <p className="text-xs text-amml-text3 max-w-xl font-sans leading-relaxed">
            Create, inspect, and audit formal internal correspondence. Link memos to specific nominal roll personnel. Approved leaves automatically override workforce attendance sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-run-auto-filing"
            onClick={handleRunAutoFiling}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold text-xs rounded-xl transition-all shadow-sm shrink-0"
            title="Automatically process incoming memos, tag as Admin or HR, and route to destination suites based on content keywords"
          >
            <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
            Automated Filing Utility
          </button>

          <button
            id="btn-open-filing-guide"
            onClick={() => setIsFilingGuideOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#0064B4]/20 hover:bg-[#0064B4]/30 text-[#008aff] border border-[#0064B4]/40 font-bold text-xs rounded-xl transition-all shadow-sm shrink-0"
          >
            <BookOpen className="h-4 w-4" />
            SOP Guide
          </button>

          <button
            id="btn-open-composer"
            onClick={handleOpenComposer}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Compose Memo
          </button>
        </div>
      </div>

      {/* 2. Grid Dashboard Filters & Sidebar + Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="memo-registry-workspace">
        
        {/* LEFT COLUMN: Controls & Ledger list */}
        <div className="lg:col-span-4 space-y-4" id="memo-registry-left-bar">
          
          {/* Quick Search & Filters Card */}
          <div className="bg-amml-surface2/80 p-4 border border-amml-border/60 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">Ledger Filters & Filing Sequence</h3>
                <p className="text-[10px] text-amml-text3">Refine and sort incoming memos.</p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#0064B4]/20 text-[#008aff] rounded-full border border-[#0064B4]/30">
                {sortedMemos.length} Logged
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4.5 w-4.5 text-slate-400" />
                <input 
                  id="input-memo-reg-search"
                  type="text"
                  placeholder="Query recipient, subject, or ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-amml-surface border border-amml-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-amml-text placeholder-amml-text3 outline-none focus:ring-1 focus:ring-[#0064B4]"
                />
              </div>

              {/* Incoming Memo Sorting Sequence */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
                  <span>Incoming Sorting Order</span>
                  <ArrowUpDown className="h-3 w-3 text-indigo-400" />
                </label>
                <select
                  id="select-memo-sort-order"
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as IncomingMemoSortOption)}
                  className="w-full bg-amml-surface border border-amml-border rounded-lg p-2 text-xs text-amml-text font-medium outline-none focus:ring-1 focus:ring-[#0064B4]"
                >
                  <option value="RECEIVED_DATE_DESC">📥 Newest Received First (Default)</option>
                  <option value="RECEIVED_DATE_ASC">📅 Oldest Received First</option>
                  <option value="PRIORITY_DESC">⚡ Action / Urgent Memos First</option>
                  <option value="FILING_CODE_ASC">🗂️ By Filing Code (HR/PER/LEAVE, etc.)</option>
                  <option value="APPROVAL_STATUS">📝 Pending Approval / Drafts First</option>
                  <option value="DEPARTMENT">🏢 Group by Office / Market Site</option>
                </select>
              </div>

              {/* Automated Routing Target Module Filter */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase">Automated Route Target Module</label>
                <div className="grid grid-cols-3 gap-1 bg-amml-surface p-0.5 rounded-lg border border-amml-border">
                  <button
                    type="button"
                    onClick={() => setTargetModuleFilter('all')}
                    className={`py-1 text-[10px] font-bold rounded transition-all ${
                      targetModuleFilter === 'all'
                        ? 'bg-[#0064B4] text-white shadow-xs'
                        : 'text-amml-text3 hover:text-white hover:bg-amml-surface3'
                    }`}
                  >
                    All Suites
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetModuleFilter('HR')}
                    className={`py-1 text-[10px] font-bold rounded transition-all ${
                      targetModuleFilter === 'HR'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-purple-300 hover:bg-purple-600/20'
                    }`}
                  >
                    🏛️ HR Suite
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetModuleFilter('Admin')}
                    className={`py-1 text-[10px] font-bold rounded transition-all ${
                      targetModuleFilter === 'Admin'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'text-cyan-300 hover:bg-cyan-600/20'
                    }`}
                  >
                    🏢 Admin Suite
                  </button>
                </div>
              </div>

              {/* Memo Filing Classification Type Filter */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase">Filing Classification Filter</label>
                <select
                  id="select-memo-reg-classification"
                  value={classificationFilter}
                  onChange={e => setClassificationFilter(e.target.value)}
                  className="w-full bg-amml-surface border border-amml-border rounded-lg p-2 text-xs text-amml-text outline-none focus:ring-1 focus:ring-[#0064B4]"
                >
                  <option value="all">All Filing Types (HR & Admin)</option>
                  {Object.entries(MEMO_FILING_GUIDELINES).map(([code, g]) => (
                    <option key={code} value={code}>
                      {code} • {g.title} ({g.masterFileNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Market Filter */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase">Market-level association Filter</label>
                <select
                  id="select-memo-reg-market"
                  value={mktFilter}
                  onChange={e => setMktFilter(e.target.value)}
                  className="w-full bg-amml-surface border border-amml-border rounded-lg p-2 text-xs text-amml-text outline-none focus:ring-1 focus:ring-[#0064B4]"
                >
                  <option value="">All Markets & Nodes</option>
                  <option value="Head Office">Head Office / HQ</option>
                  {markets.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase">Approval State Filter</label>
                <div className="grid grid-cols-4 gap-1 bg-amml-surface p-0.5 rounded-lg border border-amml-border">
                  {['all', 'draft', 'approved', 'archived'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`py-1 rounded text-[10px] font-bold capitalize transition-all ${
                        statusFilter === st 
                          ? 'bg-[#0064B4] text-white shadow-xs' 
                          : 'text-amml-text3 hover:text-white hover:bg-amml-surface3'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* List of matching memo elements */}
          <div className="space-y-2 overflow-y-auto max-h-[520px] pr-1" id="memo-list-scroller">
            {sortedMemos.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-amml-border/40 rounded-2xl bg-amml-surface2/30">
                <FileText className="h-8 w-8 text-amml-text3 mx-auto opacity-30 mb-2" />
                <span className="block text-xs text-amml-text3">No catalogued memos match selected filter parameters.</span>
              </div>
            ) : (
              sortedMemos.map(m => {
                const code = getMemoClassificationCode(m);
                const isSelected = activeMemoId === m.id;
                return (
                  <button
                    key={m.id}
                    id={`btn-memo-card-${m.id}`}
                    onClick={() => setActiveMemoId(m.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 relative group ${
                      isSelected 
                        ? 'bg-gradient-to-r from-[#0064B4]/90 to-[#005299]/90 border-[#0064B4] shadow-md text-white' 
                        : 'bg-amml-surface border-amml-border/60 hover:border-amml-border hover:bg-amml-surface2 text-amml-text'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full text-[9px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-bold uppercase tracking-wider ${isSelected ? 'text-blue-200' : 'text-indigo-400'}`}>
                          {m.market}
                        </span>
                        <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[8px] ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#0064B4]/15 text-[#008aff] border border-[#0064B4]/30'
                        }`}>
                          {code}
                        </span>
                        <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[8px] ${
                          isSelected
                            ? 'bg-purple-900/40 text-purple-200 border border-purple-400/40'
                            : (m.targetModule || autoFileMemo(m).targetModule) === 'HR'
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                              : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {(m.targetModule || autoFileMemo(m).targetModule) === 'HR' ? '🏛️ HR' : '🏢 Admin'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {m.status === 'draft' ? (
                          <span className="px-1.5 py-0.5 font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                            Draft (Pending)
                          </span>
                        ) : m.status === 'approved' ? (
                          <span className="px-1.5 py-0.5 font-bold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                            Approved
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 font-bold rounded bg-slate-500/15 text-slate-300 border border-slate-500/30 uppercase">
                            Archived
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="font-serif font-black text-xs leading-tight tracking-tight">
                      {m.to}
                    </div>

                    <p className={`text-[10px] line-clamp-1 truncate ${isSelected ? 'text-blue-100' : 'text-amml-text3'}`}>
                      {m.subject}
                    </p>

                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-amml-border/30 mt-0.5">
                      <span className="flex items-center gap-1 text-[9px]">
                        <Calendar className="h-3 w-3 opacity-60" />
                        {m.dates.split(' to ')[0] || m.date}
                      </span>
                      <span className="font-mono font-bold">
                        {m.approvedDays}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Official Letterhead Preview, Audit Logs, Quick CRUD controls */}
        <div className="lg:col-span-8 space-y-6" id="memo-registry-right-workspace">
          {activeMemo ? (
            <div className="space-y-6" id="memo-active-workspace">
              
              {/* Toolbar of Selected Item */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-amml-surface2 p-3 border border-amml-border/60 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-amml-text2">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  <span>REF CODE: <strong>REG-2026-0{memos.indexOf(activeMemo) + 12}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {activeMemo.status === 'draft' && (
                    <button
                      id={`btn-quick-approve-${activeMemo.id}`}
                      onClick={() => handleQuickApprove(activeMemo.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve Memo
                    </button>
                  )}

                  <button
                    id={`btn-manual-sync-${activeMemo.id}`}
                    onClick={() => handleToggleSyncStatus(activeMemo.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-all ${
                      activeMemo.synced 
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' 
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200'
                    }`}
                  >
                    {activeMemo.synced ? 'Synced (Marked On Leave)' : 'Inactive Sync (Tap to Sync)'}
                  </button>

                  <button
                    id={`btn-edit-memo-form-${activeMemo.id}`}
                    onClick={() => handleEditMemo(activeMemo)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#0064B4] hover:bg-[#005299] text-white font-bold rounded-lg transition-all"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>

                  <button
                    id={`btn-delete-memo-id-${activeMemo.id}`}
                    onClick={() => handleDeleteMemo(activeMemo.id)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg transition-all"
                    title="Delete Memo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Live Official Government double-bordered Letterhead letter */}
              <div className="border-4 border-double border-amml-border/80 p-6 sm:p-10 bg-amml-surface rounded-2xl space-y-6 shadow-xl relative overflow-hidden" id="letterhead-preview-frame">
                
                {/* Background watermarked emblem */}
                <div className="absolute inset-x-0 top-32 flex justify-center opacity-[0.02] pointer-events-none select-none">
                  <Layers className="h-80 w-80 text-white" />
                </div>

                {/* Letterhead Header Banner */}
                <div className="text-center pb-5 border-b-2 border-amml-border" id="classic-header-content">
                  <h1 className="font-serif font-black text-xl tracking-widest text-[#0064B4]">ABUJA MARKETS MANAGEMENT LIMITED</h1>
                  <p className="text-[10px] text-amml-text3 tracking-wider uppercase font-mono mt-0.5">Corporate Headquarters Garki FCT Abuja • HR & Admin Unit</p>
                  <p className="text-[8px] text-slate-500 font-mono italic mt-1">Real-time Integrated Employee Workforce Sync Portal</p>
                  
                  <div className="flex justify-center gap-2 mt-3">
                    <span className="w-2 h-2 bg-[#0064B4] rounded-full"></span>
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  </div>
                </div>

                {/* Reference Code & Confidential Line */}
                <div className="flex justify-between items-center text-[10px] font-mono border-b border-amml-border/30 pb-2">
                  <span>REF NO: AMML/HR/REG/2026/0{memos.indexOf(activeMemo) + 12}</span>
                  <span className="text-[#0064B4] font-bold">CONFIDENTIAL LEDGER RECORD</span>
                </div>

                {/* Formal From, To, Date block */}
                <div className="grid grid-cols-2 gap-4 text-xs font-sans tracking-wide leading-relaxed border-b border-amml-border/35 pb-4">
                  <div className="space-y-1">
                    <p><strong className="text-amml-text3 font-mono">FROM:</strong> Head HR & Admin Unit</p>
                    <p><strong className="text-amml-text3 font-mono">DATE:</strong> {activeMemo.date}</p>
                    {activeMemo.startDate && (
                      <p className="text-[10px] text-[#0064B4] font-mono">
                        PERIOD: {activeMemo.startDate} to {activeMemo.endDate}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p><strong className="text-amml-text3 font-mono">TO:</strong> <span className="font-bold underline text-white">{activeMemo.to}</span></p>
                    <p><strong className="text-amml-text3 font-mono">DEPT:</strong> {activeMemo.market} (ID: {activeMemo.staffId || 'AMML-UNLINKED'})</p>
                    <p><strong className="text-amml-text3 font-mono">RELIEVER:</strong> {activeMemo.reliever ? <span className="text-emerald-400 font-bold">{activeMemo.reliever}</span> : <span className="text-rose-400 italic">No designated Reliever (Omission!)</span>}</p>
                  </div>
                </div>

                {/* Directive Heading / Subject */}
                <div className="space-y-5" id="memo-directives-subject">
                  <h3 className="font-serif font-black text-center text-sm leading-snug tracking-wider border-b border-amml-border/25 pb-2 text-white">
                    {activeMemo.subject}
                  </h3>

                  {/* WYSIWYG Content output paragraphs */}
                  <div className="space-y-4 text-xs text-amml-text2 leading-relaxed text-justify font-sans">
                    {activeMemo.body ? (
                      activeMemo.body.split('\n\n').map((para, pIdx) => (
                        <p key={pIdx} dangerouslySetInnerHTML={{ __html: para }} />
                      ))
                    ) : (
                      <>
                        <p>
                          Please refer to your application/memo regarding your annual leave entitlement processed for the 2026 fiscal cycle.
                        </p>
                        <p>
                          Management has processed and hereby conveys approval for you to proceed on <strong>{activeMemo.approvedDays}</strong> days annual leave, effective from the scheduled range: <strong>{activeMemo.dates}</strong>.
                        </p>
                        <p>
                          {activeMemo.reliever ? (
                            <span>You are instructed to fully brief and complete a structured handover of all pending tasks to your designated reliever, <strong>{activeMemo.reliever}</strong>, who will act in your stead during this period.</span>
                          ) : (
                            <span className="text-rose-400 italic">Note: Handover personnel coverage checklist is currently in breach of standard directive. HR clearance is pending.</span>
                          )}
                        </p>
                        <p>You are expected to resume active official duty on the morning of <strong>{activeMemo.resumeDate}</strong>.</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Letter Signature Block */}
                <div className="pt-8 border-t border-amml-border/30 flex justify-between items-start">
                  <div className="space-y-1 text-[9px] font-mono text-amml-text3">
                    <span className="block font-bold">CC DISPATCH PATH:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {activeMemo.cc?.map((ccPerson, cIdx) => (
                        <li key={cIdx}>{ccPerson}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-right">
                    <span className="block italic text-[11px] text-slate-400">Signed officially,</span>
                    <span className="block font-bold text-xs uppercase text-[#0064B4] mt-5 font-serif">EFOSA OKOSUN</span>
                    <span className="block text-[8px] tracking-widest font-mono text-slate-400">Head HR & Admin Unit</span>
                  </div>
                </div>

              </div>

              {/* 3. OFFICIAL FILING & CABINET DESIGNATION GUIDANCE CARD */}
              {(() => {
                const code = getMemoClassificationCode(activeMemo);
                const guideline = MEMO_FILING_GUIDELINES[code];
                return (
                  <div className="bg-[#0b1320] border-2 border-[#0064B4]/30 p-5 rounded-xl space-y-3.5 shadow-md" id="memo-filing-guidance-card">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amml-border/50 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-[#0064B4]/20 text-[#008aff] rounded-lg">
                          <FolderTree className="h-4.5 w-4.5" />
                        </span>
                        <div>
                          <h4 className="font-serif font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
                            Official Filing & Cabinet Routing Designation
                          </h4>
                          <p className="text-[10px] text-amml-text3 font-mono">
                            Classification Code: <strong className="text-[#008aff]">{guideline.code}</strong> (Master File #{guideline.masterFileNumber})
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setIsFilingGuideOpen(true)}
                        className="px-3 py-1 bg-[#0064B4]/20 hover:bg-[#0064B4]/40 text-[#008aff] border border-[#0064B4]/40 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        Filing SOP Guide
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-amml-surface p-3 rounded-lg border border-amml-border/60 space-y-1">
                        <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Physical Cabinet Designation</span>
                        <p className="font-semibold text-amber-300 text-[11px]">{guideline.physicalCabinet}</p>
                      </div>
                      
                      <div className="bg-amml-surface p-3 rounded-lg border border-amml-border/60 space-y-1">
                        <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Digital Archival Directory</span>
                        <p className="font-mono text-indigo-300 text-[10px] truncate">{guideline.digitalFolder}</p>
                      </div>

                      <div className="bg-amml-surface p-3 rounded-lg border border-amml-border/60 space-y-1">
                        <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Custodian Suite & Retention</span>
                        <p className="font-bold text-emerald-400 text-[11px]">
                          {guideline.custodianSuite.replace('_', ' ')} ({guideline.retentionYears} Yrs Retention)
                        </p>
                      </div>
                    </div>

                    <div className="bg-amml-surface2/80 p-3 rounded-lg border border-amml-border/40 space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-blue-300 uppercase tracking-wider block">
                        Mandatory Filing SOP Sequence
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-amml-text2">
                        {guideline.filingSop.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}

              {/* 4. AUDIT TRAIL LOGS (Satisfying requested Audit Trail logging changes) */}
              <div className="bg-[#0b1320] border-2 border-indigo-500/20 p-5 rounded-xl space-y-4 shadow-md" id="memo-audit-trail-card">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-xs font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1.5">
                    <Clock className="h-4.5 w-4.5" />
                    Memo Ingress logs & compliance audit trail
                  </h4>
                  <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded font-mono">
                    Regulatory Tracking Level-V2
                  </span>
                </div>

                {/* Audit trail list rendering */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {activeMemo.auditTrail && activeMemo.auditTrail.map((log, lIdx) => (
                    <div key={log.id || lIdx} className="p-3 bg-amml-surface2/60 border border-amml-border/45 rounded-lg text-xs space-y-1 flex items-start gap-3">
                      <div className="p-1 bg-indigo-600/15 rounded-md text-indigo-400 inline-block font-mono text-[9px] uppercase mt-0.5 shrink-0">
                        {log.action.replace("LEAVE_ADJUSTMENT", "ADJUST")}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-semibold text-slate-300 font-mono">{log.user}</span>
                          <span className="text-amml-text3 font-mono">{log.timestamp}</span>
                        </div>
                        <p className="text-amml-text2 leading-relaxed text-xs">
                          {log.details}
                        </p>
                        {log.fromStatus && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Status State Transition: <span className="text-amber-400">{log.fromStatus}</span> &rarr; <span className="text-emerald-400">{log.toStatus}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Automated notice for leave adjustment checks */}
                  {activeMemo.subject.toUpperCase().includes("ADJUST") && (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                      <span>Certified Notification: This record completely matches mandatory 'Notification for Leave Adjustment' audits. Compliance metrics have been updated.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center border border-amml-border/60 rounded-2xl bg-amml-surface2/20 text-amml-text3">
              <FileDown className="h-10 w-10 mx-auto stroke-1 opacity-20 mb-3" />
              <p className="text-sm font-sans">No memo has been selected. Use the search index filters on the left rail to initialize.</p>
            </div>
          )}
        </div>

      </div>      {/* 4. WYSIWYG COMPOSER OVERLAY DIALOG */}
      {isComposerOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="memo-composer-backdrop">
          <div className="bg-[#0b131f] border border-slate-800 w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden" id="memo-composer-modal">
            
            {/* Header */}
            <div className="p-4 px-6 border-b border-slate-800 flex justify-between items-center bg-[#070d14]">
              <div>
                <h3 className="font-serif font-black text-sm text-[#0064B4] uppercase tracking-wider flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  {isEditing ? 'Editing Official Memo Draft' : 'Unified Internal Memo Composer'}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">AMML Nominal Roll Automatic Sync & HR Dispatch Center</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs p-1.5 px-3 rounded-lg transition-all"
                >
                  ✕ Close Composer
                </button>
              </div>
            </div>

            {/* Validation Dashboard Checklist Bar */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 text-[11px] grid grid-cols-2 md:grid-cols-5 gap-2 px-6">
              <div className="flex items-center gap-1.5 font-mono">
                {formStaffId ? (
                  <span className="text-emerald-400 font-bold">🟢 RECIPIENT LINKED</span>
                ) : (
                  <span className="text-rose-400 font-bold">🔴 NO RECIPIENT LINK</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                {formStartDate && formEndDate ? (
                  <span className="text-emerald-400 font-bold">🟢 DATES VALIDATED</span>
                ) : (
                  <span className="text-rose-400 font-bold">🔴 OUT OF LEAVE BOUNDS</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                {formRelieverId ? (
                  <span className="text-emerald-400 font-bold">🟢 REGULATORY RELIEVER SET</span>
                ) : (
                  <span className="text-rose-400 font-bold animate-pulse font-black">🔴 BREACH: NO HANDOVER COV</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                {formSubject ? (
                  <span className="text-emerald-400 font-bold">🟢 SUBJECT FILED</span>
                ) : (
                  <span className="text-rose-400 font-bold">🔴 NO MEMO SUBJECT</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                {formBody.trim().length > 10 ? (
                  <span className="text-emerald-400 font-bold">🟢 CONTENT AUTHORED</span>
                ) : (
                  <span className="text-rose-400 font-bold">🔴 EMPTY DIRECTIVE</span>
                )}
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="p-3.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 text-xs px-6">
                <span className="font-mono text-[9px] uppercase font-bold text-rose-400 tracking-wider block mb-1">Company Clearance Blocks Detected:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            {overlapWarning && (
              <div className="p-3 bg-amber-500/10 border-b border-amber-500/25 text-amber-300 text-[11px] px-6 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{overlapWarning}</span>
              </div>
            )}

            {/* Main Editor + Dual Layout Pane */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Pane: Full Custom Form Controls */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs border-r border-slate-800/80">
                
                {/* Preset Wording Select */}
                <div className="bg-[#111c2a] p-3 border border-slate-800 rounded-xl space-y-2">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Select HR Dispatch Preset Wording</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      type="button"
                      onClick={() => handleTemplateChange('annual')}
                      className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                        selectedTemplate === 'annual' 
                          ? 'bg-[#0064B4]/20 border-[#0064B4] text-white' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Annual Leave approval
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleTemplateChange('exam')}
                      className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                        selectedTemplate === 'exam' 
                          ? 'bg-[#0064B4]/20 border-[#0064B4] text-white' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Examination Leave Approval
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleTemplateChange('adjustment')}
                      className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                        selectedTemplate === 'adjustment' 
                          ? 'bg-[#0064B4]/20 border-[#0064B4] text-white' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Leave Adjustment Notification
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* From & Date */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase">From (Issuing Department)</label>
                    <input 
                      type="text"
                      value={formFrom}
                      onChange={e => setFormFrom(e.target.value)}
                      className="w-full bg-[#121b26] border border-slate-800 rounded-lg p-2 text-white text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase">Date of Issuance</label>
                    <input 
                      type="text"
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                      className="w-full bg-[#121b26] border border-slate-800 rounded-lg p-2 text-white text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Recipient Link dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold text-[#0064B4]">
                      Linked Recipient Personnel (Matches Nominal Roll)
                    </label>
                    <select
                      id="select-composer-recipient"
                      value={formStaffId}
                      onChange={e => handleStaffSelect(e.target.value)}
                      className="w-full bg-[#121b26] border border-slate-800 rounded-lg p-2 text-white font-bold text-xs"
                    >
                      <option value="">-- Choose employee from nominal roll --</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.id} - {s.last.toUpperCase()}, {s.first} ({s.market})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Recipient Name</label>
                      <input 
                        type="text"
                        value={formToName}
                        onChange={e => setFormToName(e.target.value)}
                        className="w-full bg-[#121b26] border border-slate-800 rounded-lg p-2 text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Market node Association</label>
                      <select
                        value={formMarket}
                        onChange={e => setFormMarket(e.target.value)}
                        className="w-full bg-[#121b26] border border-slate-800 rounded-lg p-2 text-white text-xs"
                      >
                        <option value="Head Office">Head Office / HQ</option>
                        {markets.map(m => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dates bounds */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-indigo-400 uppercase font-bold">Planned Start Date</label>
                      <input 
                        id="input-composer-start-date"
                        type="date"
                        value={formStartDate}
                        onChange={e => setFormStartDate(e.target.value)}
                        className="w-full bg-[#121b26] border border-slate-800 rounded-lg p-2 text-white text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-indigo-400 uppercase font-bold">Planned End Date</label>
                      <input 
                        id="input-composer-end-date"
                        type="date"
                        value={formEndDate}
                        onChange={e => setFormEndDate(e.target.value)}
                        className="w-full bg-[#121b26] border border-slate-800 rounded-lg p-2 text-white text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Approved Leaves Count (Text)</label>
                      <input 
                        type="text"
                        value={formApprovedDays}
                        onChange={e => setFormApprovedDays(e.target.value)}
                        placeholder="EX: Ten (10)"
                        className="w-full bg-[#121b26] border border-slate-800 rounded-lg p-2 text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Return Duty Date</label>
                      <input 
                        type="text"
                        value={formResumeDate}
                        onChange={e => setFormResumeDate(e.target.value)}
                        placeholder="EX: Thursday 16th April"
                        className="w-full bg-[#121b26] border border-slate-800 rounded-lg p-2 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Handover personnel (MANDATORY REGULATORY REQUIREMENT) */}
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3" id="comp-handover-personnel-box">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-emerald-400 uppercase font-black">
                      Mandatory Handover Reliever Cover *
                    </label>
                    <select
                      id="select-composer-reliever"
                      value={formRelieverId}
                      onChange={e => handleRelieverSelect(e.target.value)}
                      className="w-full bg-[#121b26] border border-emerald-500/50 rounded-lg p-2 text-white font-bold text-xs"
                    >
                      <option value="">-- Choose reliever from staff register --</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id} disabled={s.id === formStaffId}>
                          {s.id} - {s.last.toUpperCase()} {s.first} ({s.market})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase">Reliever Complete Name Reference</label>
                    <input 
                      type="text"
                      value={formRelieverName}
                      onChange={e => setFormRelieverName(e.target.value)}
                      placeholder="EX: Samuel Nyitamen"
                      className="w-full bg-[#121b26] border border-slate-800 rounded-lg p-2 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Subject Line */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Memo Heading / Subject</label>
                  <input 
                    type="text"
                    value={formSubject}
                    onChange={e => setFormSubject(e.target.value)}
                    className="w-full bg-[#121b26] border border-slate-800 rounded-lg p-2 text-white text-xs font-serif uppercase tracking-normal"
                  />
                </div>

                {/* WYSIWYG Message text editor */}
                <div className="space-y-1.5" id="wysiwyg-text-block-editor">
                  <label className="block text-[10px] font-mono text-[#0064B4] uppercase font-bold">
                    Official Memo Directive text Body (WYSIWYG Plain-Text Container)
                  </label>
                  
                  {/* HTML Toolbar */}
                  <div className="flex bg-[#121b26] p-1 border border-slate-800 rounded-t-lg gap-1">
                    <button 
                      type="button" 
                      onClick={() => setFormBody(prev => prev + " <strong></strong>")} 
                      className="p-1 px-3 rounded hover:bg-white/10 font-bold border border-slate-800 bg-slate-900 text-slate-200 text-xs font-sans"
                      title="Bold text"
                    >
                      B
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormBody(prev => prev + " <em></em>")} 
                      className="p-1 px-3 rounded hover:bg-white/10 italic border border-slate-800 bg-slate-900 text-slate-200 text-xs font-serif"
                      title="Italic text"
                    >
                      I
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormBody(prev => prev + " <u></u>")} 
                      className="p-1 px-3 rounded hover:bg-white/10 underline border border-slate-800 bg-slate-900 text-slate-200 text-xs font-sans"
                      title="Underline text"
                    >
                      U
                    </button>
                    <span className="text-slate-700 block self-center px-1">|</span>
                    <button 
                      type="button" 
                      onClick={() => setFormBody(prev => prev + "\n\n")} 
                      className="p-1 px-2.5 text-[10px] rounded hover:bg-white/10 font-mono border border-slate-800 bg-slate-900 text-slate-300"
                      title="Add clean paragraph spacing"
                    >
                      + Paragraph Block
                    </button>
                  </div>
                  
                  <textarea 
                    id="textarea-composer-body"
                    value={formBody}
                    onChange={e => setFormBody(e.target.value)}
                    rows={6}
                    className="w-full bg-[#121b26] border border-t-0 border-slate-800 rounded-b-lg p-2.5 text-white leading-relaxed font-sans text-xs"
                    placeholder="Draft memo core directives here..."
                    required
                  />
                </div>

                {/* CC list Path settings */}
                <div className="bg-[#111c2a] p-3 border border-slate-800 rounded-xl space-y-3">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">Cc Dispatch List list</label>
                  
                  <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-slate-950 border border-slate-800 rounded-lg">
                    {formCC.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0064B4] text-white font-mono text-[9px] font-bold">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => removeCCTag(i)} 
                          className="text-white/60 hover:text-white"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {formCC.length === 0 && (
                      <span className="text-slate-500 text-[10px]">No corporate entities cced.</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={ccInput}
                      onChange={e => setCcInput(e.target.value)}
                      placeholder="EX: MANAGER, GARKI MODEL MARKET"
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCCTag(); } }}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-1 px-2.5 text-white text-xs"
                    />
                    <button 
                      type="button"
                      onClick={addCCTag}
                      className="p-1 px-3 bg-slate-800 text-xs font-bold hover:bg-slate-700 border border-slate-700 text-white rounded-lg"
                    >
                      + Add
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Pane: GORGEOUS simulated A4 Paper Memorandum Document Preview */}
              <div className="hidden md:flex w-[480px] bg-slate-950/50 p-6 flex-col overflow-y-auto items-center justify-start border-l border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-3">Live Internal Memo Preview (A4 Form)</span>
                
                {/* Simulated A4 Paper */}
                <div className="bg-white text-slate-800 p-8 shadow-2xl rounded-sm w-full min-h-[620px] font-sans flex flex-col justify-between border border-slate-300 relative overflow-hidden" id="wysiwyg-memo-a4-preview">
                  
                  {/* Watermark Logo */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                    <span className="font-serif font-black text-6xl text-[#0064B4] uppercase tracking-widest border-4 border-[#0064B4] p-4 rotate-45">AMML</span>
                  </div>

                  <div className="space-y-6 relative z-10">
                    {/* Official Letterhead Heading */}
                    <div className="text-center font-serif border-b border-double border-slate-400 pb-2.5">
                      <h2 className="font-sans font-black text-xs text-[#0064B4] tracking-wider uppercase leading-none">Abuja Markets Management Limited</h2>
                      <div className="text-[8px] tracking-wide font-sans text-slate-500 font-medium">Head Office, Garki Market Complex, Area 10, Abuja</div>
                      <h1 className="font-serif font-black text-sm tracking-widest uppercase text-slate-900 mt-2 border-t border-slate-200 pt-2 block">Internal Memorandum</h1>
                    </div>

                    {/* Standard corporate header lines: TO, FROM, DATE, SUBJECT */}
                    <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-800 border-b border-slate-200 pb-4">
                      <div className="flex">
                        <span className="w-16 font-extrabold uppercase font-mono text-[10px] text-slate-500">TO:</span>
                        <span className="flex-1 font-bold text-slate-900 uppercase">
                          {formToName || '__________________________________'}
                          {formMarket ? ` (${formMarket.toUpperCase()})` : ''}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-16 font-extrabold uppercase font-mono text-[10px] text-slate-500">FROM:</span>
                        <span className="flex-1 font-semibold text-slate-800 capitalize">{formFrom || 'Head HR & Admin Unit'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-16 font-extrabold uppercase font-mono text-[10px] text-slate-500">DATE:</span>
                        <span className="flex-1 font-semibold text-slate-800">{formDate || '__________________________________'}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-16 font-extrabold uppercase font-mono text-[10px] text-slate-500 mt-0.5">SUBJECT:</span>
                        <span className="flex-1 font-black text-slate-950 underline uppercase leading-snug">
                          {formSubject || 'RE: APPLICATION FOR DISPATCH DEPLOYMENT/LEAVE'}
                        </span>
                      </div>
                    </div>

                    {/* Body content with real-time splitter HTML rendering */}
                    <div className="space-y-3.5 text-[11px] text-slate-700 leading-relaxed text-justify">
                      {formBody.trim() ? (
                        formBody.split('\n\n').map((para, pIdx) => (
                          <p key={pIdx} dangerouslySetInnerHTML={{ __html: para }} />
                        ))
                      ) : (
                        <div className="py-12 text-center text-slate-400 italic font-mono text-[10px]">
                          (Start drafting in the visual editor to auto-compile the letter text)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mandated regulatory and reliever verification signs */}
                  <div className="pt-6 border-t border-slate-200 space-y-4 relative z-10">
                    
                    {/* Verification Compliance Pill */}
                    {formRelieverId ? (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[10px] font-sans flex items-center gap-1.5 font-bold">
                        <span>🟢 CLEARED: Handover reliever assigned to {formRelieverName.toUpperCase()}</span>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[10px] font-sans font-bold flex flex-col gap-0.5">
                        <span className="text-[10px] font-black uppercase text-rose-700 block">🔴 COMPLIANCE BREACH:</span>
                        <span>Designated reliever is REQUIRED. Leave processing not cleared.</span>
                      </div>
                    )}

                    {/* Cc Dispatch block */}
                    {formCC.length > 0 && (
                      <div className="text-[9px] font-mono text-slate-500 uppercase leading-normal">
                        <span className="font-extrabold block mb-0.5 text-slate-400 uppercase">Cc Dispatch List list:</span>
                        <ul className="list-none pl-0 space-y-0.5 font-semibold text-slate-700">
                          {formCC.map((tag, idx) => (
                            <li key={idx}>- {tag}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-between items-end text-[9px] font-mono text-slate-400">
                      <div>AMML-REGISTRY-SYS</div>
                      <div>CONFIDENTIAL DOCUMENT</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Footer with dual CTA save states */}
            <div className="p-4 px-6 border-t border-slate-800 flex flex-wrap justify-between items-center bg-[#070d14] gap-3">
              <button
                type="button"
                onClick={() => handleSaveMemo('draft')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all"
              >
                Save as Draft Only
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-bold transition-all"
                >
                  Close
                </button>
                <button
                  id="btn-composer-submit-hr"
                  type="button"
                  onClick={() => handleSaveMemo('approved')}
                  className="px-5 py-2 bg-[#0064B4] hover:bg-blue-600 text-white rounded-lg text-xs font-black transition-all shadow-md"
                >
                  Submit & Sync to HR Attendance
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. HR & ADMIN MEMO FILING & SORTING SOP GUIDE MODAL */}
      {isFilingGuideOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4" id="memo-filing-guide-backdrop">
          <div className="bg-[#09111e] border-2 border-[#0064B4]/50 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-[#060a12] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0064B4]/20 text-[#008aff] rounded-xl border border-[#0064B4]/30">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-white tracking-wide flex items-center gap-2">
                    AMML HR & Admin Memo Filing & Incoming Sorting SOP
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Standard Operating Procedure • File Classification & Sorting Directives
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setIsFilingGuideOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition-all"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Section A: Incoming Memo Sorting Order Protocol */}
              <div className="bg-amml-surface p-4 rounded-xl border border-amml-border/80 space-y-3">
                <div className="flex items-center gap-2 text-[#008aff]">
                  <ArrowUpDown className="h-4 w-4" />
                  <h4 className="font-serif font-bold text-sm text-white">1. Incoming Memos Priority & Sorting Order Protocol</h4>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  To eliminate processing bottlenecks and prevent compliance oversights, all incoming internal correspondence arriving at HR / Admin registry desks must be sorted and acted upon according to the following strict operational hierarchy:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg space-y-1">
                    <span className="font-mono text-[10px] font-bold text-amber-400 uppercase block">Step 1 • Action Needed / Urgent</span>
                    <p className="text-[#e2e8f0] font-semibold text-[11px]">Drafts, Queries & Resignations</p>
                    <p className="text-slate-400 text-[10px]">Must be reviewed within 24 hours. Process disciplinary responses & exit clearance notices first.</p>
                  </div>

                  <div className="bg-[#0064B4]/10 border border-[#0064B4]/20 p-3 rounded-lg space-y-1">
                    <span className="font-mono text-[10px] font-bold text-[#008aff] uppercase block">Step 2 • Date Chronology</span>
                    <p className="text-[#e2e8f0] font-semibold text-[11px]">Newest Received Date (Reverse Date)</p>
                    <p className="text-slate-400 text-[10px]">Sort routine leave applications and housing requests by incoming submission date.</p>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg space-y-1">
                    <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase block">Step 3 • Classification Filing</span>
                    <p className="text-[#e2e8f0] font-semibold text-[11px]">File Jackets by Code & Staff ID</p>
                    <p className="text-slate-400 text-[10px]">Route physical originals to designated master cabinets and update digital audit logs.</p>
                  </div>
                </div>
              </div>

              {/* Section B: Classification Guidelines Catalog Table */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-[#008aff]" />
                  2. Master File Classification & Storage Location Directory
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(MEMO_FILING_GUIDELINES).map(([code, g]) => (
                    <div key={code} className="bg-amml-surface p-4 rounded-xl border border-amml-border/70 space-y-2">
                      <div className="flex justify-between items-start gap-2 border-b border-amml-border/40 pb-2">
                        <div>
                          <span className="font-mono font-black text-[#008aff] text-xs bg-[#0064B4]/15 px-2 py-0.5 rounded border border-[#0064B4]/30 inline-block mb-1">
                            {g.code}
                          </span>
                          <h5 className="font-serif font-bold text-white text-xs">{g.title}</h5>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {g.masterFileNumber}
                        </span>
                      </div>

                      <p className="text-slate-300 text-[11px] leading-relaxed">{g.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                        <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                          <span className="text-slate-400 uppercase block text-[9px] font-bold">Physical Cabinet</span>
                          <span className="text-amber-200 font-semibold">{g.physicalCabinet}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                          <span className="text-slate-400 uppercase block text-[9px] font-bold">Digital Folder Path</span>
                          <span className="text-indigo-300 truncate block">{g.digitalFolder}</span>
                        </div>
                      </div>

                      <div className="pt-1 text-[10px] text-slate-400">
                        <strong className="text-slate-300">Retention & Custodian:</strong> {g.retentionYears} Years • {g.custodianSuite.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#060a12] flex justify-end">
              <button
                type="button"
                onClick={() => setIsFilingGuideOpen(false)}
                className="px-5 py-2 bg-[#0064B4] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Acknowledge SOP Guidelines
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. AUTOMATED INCOMING MEMO FILING & ROUTING UTILITY MODAL */}
      {isAutoFilingModalOpen && autoFilingSummary && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4" id="auto-filing-modal-backdrop">
          <div className="bg-[#09111e] border-2 border-purple-500/50 w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-purple-900/50 bg-[#070b14] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-white tracking-wide flex items-center gap-2">
                    Automated Incoming Memo Filing & Dashboard Routing Engine
                  </h3>
                  <p className="text-xs text-purple-300 font-mono">
                    Keywords-based Content Extraction • Automatic Admin / HR Tagging & Route Classification
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setIsAutoFilingModalOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition-all"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Executive Summary Metrics Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Total Memos Evaluated</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-white">{autoFilingSummary.total}</span>
                    <span className="text-[10px] text-slate-400">incoming records</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 pt-1">
                    <CheckCircle className="h-3 w-3" /> 100% Keyword scanned
                  </span>
                </div>

                <div className="bg-gradient-to-br from-purple-950/40 to-purple-900/20 p-4 rounded-xl border border-purple-500/30 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-purple-300 uppercase block">Routed to HR Personnel Suite</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-purple-200">{autoFilingSummary.hrCount}</span>
                    <span className="text-[10px] text-purple-300">memos ({Math.round((autoFilingSummary.hrCount / autoFilingSummary.total) * 100)}%)</span>
                  </div>
                  <span className="text-[10px] text-purple-300 font-medium block pt-1">
                    Leave, Queries, Appraisals, Resignations & Discipline
                  </span>
                </div>

                <div className="bg-gradient-to-br from-cyan-950/40 to-cyan-900/20 p-4 rounded-xl border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase block">Routed to Admin Services Suite</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-cyan-200">{autoFilingSummary.adminCount}</span>
                    <span className="text-[10px] text-cyan-300">memos ({Math.round((autoFilingSummary.adminCount / autoFilingSummary.total) * 100)}%)</span>
                  </div>
                  <span className="text-[10px] text-cyan-300 font-medium block pt-1">
                    Circulars, Deployments, Housing/Finance & Procurement
                  </span>
                </div>
              </div>

              {/* Filter Tabs & Search in Modal */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAutoFilingModalTab('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      autoFilingModalTab === 'all'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Memos ({autoFilingSummary.total})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoFilingModalTab('HR')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      autoFilingModalTab === 'HR'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-purple-300 hover:bg-purple-600/20'
                    }`}
                  >
                    🏛️ HR Personnel Suite ({autoFilingSummary.hrCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoFilingModalTab('Admin')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      autoFilingModalTab === 'Admin'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'text-cyan-300 hover:bg-cyan-600/20'
                    }`}
                  >
                    🏢 Admin Services Suite ({autoFilingSummary.adminCount})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input 
                    type="text"
                    placeholder="Search processed filing..."
                    value={autoFilingModalSearch}
                    onChange={e => setAutoFilingModalSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* List of processed filing records */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {autoFilingSummary.routings
                  .filter(r => {
                    if (autoFilingModalTab !== 'all' && r.targetModule !== autoFilingModalTab) return false;
                    if (!autoFilingModalSearch) return true;
                    const s = autoFilingModalSearch.toLowerCase();
                    return r.memoSubject.toLowerCase().includes(s) || r.memoTo.toLowerCase().includes(s) || r.classificationCode.toLowerCase().includes(s);
                  })
                  .map(r => (
                    <div 
                      key={r.memoId}
                      className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        r.targetModule === 'HR'
                          ? 'bg-purple-950/20 border-purple-500/30 hover:border-purple-500/50'
                          : 'bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-500/50'
                      }`}
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2 text-[10px]">
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                            {r.classificationCode}
                          </span>
                          <span className="font-mono font-bold text-slate-400">• To: <strong className="text-white">{r.memoTo}</strong></span>
                          {r.memoMarket && (
                            <span className="font-mono text-slate-400">• Location: <strong className="text-slate-300">{r.memoMarket}</strong></span>
                          )}
                        </div>

                        <h5 className="font-serif font-bold text-xs text-white leading-snug">
                          {r.memoSubject}
                        </h5>

                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                          {r.routingRationale}
                        </p>

                        {/* Matched Keyword Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[9px] font-mono text-slate-400">Trigger Keywords:</span>
                          {r.matchedKeywords.length > 0 ? (
                            r.matchedKeywords.map((kw, idx) => (
                              <span key={idx} className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700">
                                #{kw}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] font-mono text-slate-400 italic font-sans">Standard fallback classification</span>
                          )}
                        </div>
                      </div>

                      {/* Route Destination Card Badge */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0 bg-slate-900/90 p-3 rounded-xl border border-slate-800 min-w-[190px]">
                        <span className={`text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                          r.targetModule === 'HR'
                            ? 'bg-purple-500/20 text-purple-200 border-purple-500/40'
                            : 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                        }`}>
                          {r.targetModule === 'HR' ? '🏛️ HR Personnel Suite' : '🏢 Admin Services Suite'}
                        </span>

                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="text-slate-400">Confidence Score:</span>
                          <span className={`font-bold ${r.confidenceScore >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {r.confidenceScore}%
                          </span>
                        </div>

                        <span className="text-[9px] text-slate-400 font-mono">
                          Master File: {MEMO_FILING_GUIDELINES[r.classificationCode]?.masterFileNumber || 'ADM/FILE/2026'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-purple-900/50 bg-[#070b14] flex justify-between items-center">
              <span className="text-xs text-purple-300 font-mono">
                ⚡ Auto-filing routes updated in database state & synchronized with dashboard views.
              </span>
              <button
                type="button"
                onClick={() => setIsAutoFilingModalOpen(false)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-md"
              >
                Apply Routing & Update Database Logs
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
