import React, { useState, useEffect } from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { 
  FileText, Search, Printer, Download, MapPin, Award, 
  CheckCircle2, AlertOctagon, Mail, Calendar, ChevronRight, 
  Sparkles, TrendingUp, AlertTriangle, ShieldCheck, CheckCircle, 
  RefreshCw, Send, Plus, Trash2, ArrowRight 
} from 'lucide-react';
import { may2026StaffAttendance, MayStaffAttendance, getVerticalSpelling, isStaffLateOnDay } from '../../lib/amml/may_attendance_data';
import { May2026AuditSection } from './May2026AuditSection';
import { MemoRegistry } from './MemoRegistry';

export interface LeaveMemo {
  id: string;
  to: string;
  date: string;
  subject: string;
  dates: string;
  startDate?: string;
  endDate?: string;
  reliever?: string;
  resumeDate?: string;
  approvedDays: string;
  isExam: boolean;
  market: string;
  cc: string[];
  inconsistencies: string[];
  correctedDays?: string;
  synced: boolean;
  corrected: boolean;
  body?: string;
  status?: 'draft' | 'approved' | 'archived';
  auditTrail?: any[];
  staffId?: string;
  relieverId?: string;
}

export interface Circular {
  id: string;
  ref: string;
  date: string;
  subject: string;
  body: string;
  audience: string;
  signee: string;
  pinned: boolean;
}

export const ReportsView: React.FC = () => {
  const { staff, att, markets } = useAmmlStore();
  const [search, setSearch] = useState('');
  const [selectedMkt, setSelectedMkt] = useState('');
  const [reportType, setReportType] = useState<'attendance' | 'late' | 'summary' | 'memos' | 'circulars' | 'may2026'>('may2026');
  const [mayInnerTab, setMayInnerTab] = useState<'analytical' | 'grid' | 'excel'>('analytical');

  // Load and state manage Memos
  const [memos, setMemos] = useState<LeaveMemo[]>(() => {
    const saved = localStorage.getItem('amml_leave_memos');
    let loaded: LeaveMemo[] = [];
    if (saved) {
      try { loaded = JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const defaultMemos: LeaveMemo[] = [
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
        corrected: false
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
        corrected: false
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
        corrected: false
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
        corrected: false
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
        corrected: false
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
        corrected: false
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
        corrected: false
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
        corrected: false
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
          "CRITICAL HR STATUS NOTICE: Sarah T. Brown is no longer with AMML (Resigned / Ex-Staff). This historic memo record is archived."
        ],
        synced: false,
        corrected: false
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
        corrected: false
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
        corrected: false
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
        corrected: false
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
        corrected: false
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
        corrected: false
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
        corrected: false
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
          "Major Calculation Typo: Memo header says 'THREE (3) DAYS LEAVE' but approved date range covers Monday 25th May to Friday 29th May, which is FIVE (5) active working days."
        ],
        correctedDays: "Five (5)",
        synced: false,
        corrected: false
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
        corrected: false
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
        corrected: false
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
        corrected: false
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
        corrected: false
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
        resumeDate: "Thursday 4th June 2026",
        approvedDays: "Five (5)",
        isExam: false,
        market: "Head Office",
        cc: ["MD/CEO", "HEAD OPS", "HEAD, AUDIT", "Ag. CS/LA", "YUSUF ISMAIL"],
        inconsistencies: [],
        synced: false,
        corrected: false,
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
        reliever: "Faruk Baffa",
        resumeDate: "Thursday, 18th June 2026",
        approvedDays: "Eight (8)",
        isExam: false,
        market: "Garki Model Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT"],
        inconsistencies: [
          "Calendar Day-of-Week Discrepancy: Resume date is written as 'Monday, 18th June 2026' but June 18th, 2026 is a Thursday."
        ],
        synced: false,
        corrected: false,
        body: "Please refer to your memo on the above subject matter dated June 1st, 2026. This is to convey management's approval of your request to proceed on Eight (8) days annual leave from 2026 financial year. This is with effect on Monday 8th June – Wednesday 17th June, 2026. You are to resume duty on Monday, 18th June 2026. Enjoy your leave period."
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved'
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
        status: 'approved',
        body: "Please refer to your memo on the above subject matter dated July 14th, 2026. This is to convey management's approval of your request to proceed on Ten (10) days' annual leave from the 2026 financial year. This is with effect from Monday, 20th July – Friday, 31st July, 2026. Henry Dimesoro will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on Monday, 3rd August 2026. Enjoy your leave period."
      },
      {
        id: "memo-dimesoro-casual-2026",
        to: "DIMESORO HENRY",
        date: "July 29th, 2026",
        subject: "RE: APPLICATION FOR FOUR (4) DAYS LEAVE",
        dates: "Tuesday, 28th July to Friday, 31st July 2026",
        startDate: "2026-07-28",
        endDate: "2026-07-31",
        reliever: "Onyinyechi Nwobodo",
        resumeDate: "Monday, 3rd August 2026",
        approvedDays: "Four (4)",
        isExam: false,
        market: "Wuse Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "ONYINYECHI NWOBODO"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved',
        body: "Please refer to your memo on the above subject matter dated July 26th, 2026. This is to convey management's approval of your request to proceed on four (4) days Casual Leave with effect from Tuesday, 28th July to Friday, 31st July 2026. Onyinyechi Nwobodo will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to her before you proceed and copy the undersigned. Following the expiration of your four-day leave period, you are expected to resume duty on Monday, 3rd August 2026. Enjoy your leave period."
      },
      {
        id: "memo-haruna-maro-medical-2026",
        to: "HARUNA MARO MAGANI",
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
        status: 'approved',
        body: "Please refer to your memo on the above subject matter dated 29th July 2026. This is to convey to you management's approval to proceed with your medical leave to enable you take proper care of your health. This is with effect from Friday July 31st, 2026 to Monday 10th August, 2026. You are to resume duty on Tuesday 11th August, 2026. We pray that you have a speedy recovery."
      },
      {
        id: "memo-bamor-salary-account-2026",
        to: "HEAD (F&A)",
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
        status: 'approved',
        body: "I humbly request for change of my salary account from GTBANK 0178903636 to ACCESS BANK 1985997925. Yours faithfully, Bamor Gabriel. [Endorsement Head Audit 28/07/26]: Pls. you are dealt. [Endorsement Head F&A 29/07/26]: Kindly note and effect the change of the salary bank account details of the above named staff in the payroll."
      },
      {
        id: "memo-thompson-housing-upfront-2026",
        to: "HEAD, ADMIN/HR",
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
        status: 'approved',
        body: "I respectfully write to request the approval of the upfront payment of my housing allowance. Thank you, Thompson Mboutidem (HOD Operations Assistant). [Ag. MD/CEO Endorsement 29/07/26]: Kindly approve the payment of the housing upfront allowance of the applicant in the sum of N519,762.82. [Head F&A Endorsement 30/07/26]: Kindly proceed with Payment as approved."
      },
      {
        id: "memo-faruk-baffa-july-2026",
        to: "FARUK BAFFA",
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
        status: 'approved',
        body: "Please refer to your memo on the above subject matter dated July 30th, 2026. This is to acknowledge your application to proceed on Five (5) days annual leave for the 2026 financial year with effect on Friday 31st July - Thursday 6th August, 2026. During your absence Mr. Yusuf Ismail will cover your schedule. You are expected to resume duty on Friday, 7th August, 2026. We wish you a pleasant and restful leave period."
      },
      {
        id: "memo-bawa-sandra-housing-upfront-2026",
        to: "Head HR/Admin",
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
        status: 'approved',
        body: "I write to kindly request for my 2026 housing upfront. This is to enable me solve some personal issues. Forwarded for your consideration. Thank you, Bawa Sandra Sadat. [Ag. MD/CEO Endorsement 28/07/26]: Kindly approve the housing upfront request in the sum of N818,626.44 for the applicant. [Head F&A Endorsement 30/07/26]: Kindly proceed with Payment as approved."
      },
      {
        id: "memo-egbe-isaac-annual-2026",
        to: "EGBE ISAAC OLA",
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
        status: 'approved',
        body: "Please refer to your memo on the above subject matter dated July 29th, 2026. This is to convey management's approval of your request to proceed on Fourteen (14) days annual leave from 2026 financial year. This is with effect from Friday 14th August - Friday 28th August, 2026. You are to resume duty on Monday 31st August 2026. Enjoy your leave period."
      },
      {
        id: "memo-hauwa-iliyasu-april-2026",
        to: "HAUWA ILIYASU ALI",
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
        status: 'approved',
        body: "Please refer to your memo on the above subject matter dated April 20th, 2026. This is to convey management's approval of your request to proceed on Twenty (20) days leave. This is with effect from Monday 11th May to Friday 5th June, 2026. Micheal Joseph Inalegwe will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on Monday 8th June, 2026. Enjoy your leave period."
      },
      {
        id: "memo-rilwanu-exam-2026",
        to: "RILWANU LAWAL",
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
        status: 'approved',
        body: "Please refer to your memo on the above subject matter dated July 16th, 2026. This is to convey management's approval of your request to proceed on Ten (10) days annual leave / excuse duty to sit for final examination at Fed. Co-operative College, Kaduna. This is with effect from Monday 20th July - Friday 31st July, 2026. You are to resume duty on Monday, 3rd August 2026. Enjoy your leave period."
      },
      {
        id: "memo-benedict-ajio-july-2026",
        to: "BENEDICT AJIO",
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
        status: 'approved',
        body: "Please refer to your memo on the above subject matter dated July 21st, 2026. This is to convey management's approval of your request to proceed on Five (5) days annual leave from 2026 financial year. This is with effect on Monday 27th July - Friday 31st July, 2026. You are to resume duty on Monday, 3rd August 2026. Enjoy your leave period."
      },
      {
        id: "memo-amina-adamu-july-2026",
        to: "AMINA ADAMU",
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
        status: 'approved',
        body: "Please refer to your memo on the above subject matter dated July 20th, 2026. This is to convey management's approval of your request to proceed on Ten (10) days annual leave from 2026 financial year. This is with effect on Monday 27th July - Friday 7th August, 2026. Hassana Haruna will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to her before you proceed and copy the undersigned. You are to resume duty on Monday, 10th August 2026. Enjoy your leave period."
      },
      {
        id: "memo-baidi-aisha-july-2026",
        to: "BAIDI AISHA GAJO",
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
        status: 'approved',
        body: "Please refer to your memo on the above subject matter dated July 23rd, 2026. This is to convey management's approval of your request to proceed on Five (5) days annual leave from 2026 financial year. This is with effect on Monday 27th July - Friday 31st July, 2026. Management has also approved the sum of N103,952.56 as your 2026 annual leave allowance. Mgbii Dorathy Chisom will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to her before you proceed and copy the undersigned. You are to resume duty on Monday, 3rd August 2026. Enjoy your leave period."
      }
    ];
    if (loaded.length === 0) {
      return defaultMemos;
    }
    const merged = [...loaded];
    defaultMemos.forEach(def => {
      if (!merged.some(m => m.id === def.id)) {
        merged.push(def);
      }
    });
    return merged;
  });

  const [activeMemoIdx, setActiveMemoIdx] = useState<number>(0);

  // Circulars Roster State
  const [circulars, setCirculars] = useState<Circular[]>(() => {
    const saved = localStorage.getItem('amml_official_circulars');
    let loaded: Circular[] = [];
    if (saved) {
      try { loaded = JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const defaultCircs: Circular[] = [
      {
        id: "circ-1",
        ref: "AMML/HR/CIR/2026/01",
        date: "1st April, 2026",
        subject: "MANDATORY ENFORCEMENT OF BIOMETRIC CLOCK-IN AND CHECKOUT TERMINALS",
        body: "Following the installation of our modern facial recognition and fingerprint biometric nodes at our Central Head Office and various operational market gates, the management directs all staff members (including head office officers and market supervisors) to record their arrivals on or before 8:00 AM daily. Failure to clock-in will register as an unexcused absence in subsequent payroll calculation windows. Market registrars are strictly in charge of monitoring compliance.",
        audience: "All Markets & locations",
        signee: "EFOSA OKOSUN (Head HR & Admin Unit)",
        pinned: true
      },
      {
        id: "circ-2",
        ref: "AMML/OPS/CIR/2026/03",
        date: "15th May, 2026",
        subject: "LEAVE CORRESPONDENCE REGULATION & COMPLIANCE RULES",
        body: "All leave applications (including annual, exam, professional exam, and casual leaves) must be channeled through the HR Registry Desk 14 days prior to departure. No handover scheduling can be executed without specifying a valid active reliever, who must be physical at the location. All market desk coordinators will have to synchronize circular schedules directly into their local logs.",
        audience: "Head Office & Markets",
        signee: "EFOSA OKOSUN (Head HR & Admin Unit)",
        pinned: false
      },
      {
        id: "circ-3",
        ref: "AMML/HR/CIR/2026/04",
        date: "10th July, 2026",
        subject: "MID-YEAR PERFORMANCE REVIEW & HANDOVER REGISTRY COMPLIANCE",
        body: "As part of the Q3 2026 operational guidelines, all Heads of Unit, Market Managers, and Facility Officers must ensure that all staff proceeding on approved annual or casual leave execute a formal Handover Note registered at the HR & Admin Registry Desk. Relieving officers must sign and confirm operational takeover prior to leave commencement.",
        audience: "All Head Office & Market Personnel",
        signee: "EFOSA OKOSUN (Head HR & Admin Unit)",
        pinned: false
      },
      {
        id: "circ-4",
        ref: "AMML/FIN/CIR/2026/05",
        date: "1st September, 2026",
        subject: "LEAVE ALLOWANCE DISBURSEMENT & Q3 ACCOUNTS RECONCILIATION",
        body: "Notice is hereby given to all staff members due for 2026 Leave Allowance disbursement. Payments will be processed alongside respective approved annual leave start dates in accordance with Finance & Accounts guidelines. All market accountants are directed to submit reconciled leave allowance registers to Head Office Finance by September 15th, 2026.",
        audience: "All AMML Personnel",
        signee: "FARUK BAFFA (Head Finance & Accounts)",
        pinned: false
      },
      {
        id: "circ-5",
        ref: "AMML/HR/CIR/2026/06",
        date: "15th October, 2026",
        subject: "FINAL CALL FOR Q4 2026 ANNUAL LEAVE APPLICATIONS",
        body: "Staff members with unutilized 2026 annual leave allowances are reminded to submit their formal leave applications for Q4 2026 (October – December) to the HR & Admin Desk before October 31st, 2026. Unused leave days will not be automatically carried forward into 2027 without prior written clearance from the Ag. MD/CEO.",
        audience: "All Staff Members",
        signee: "EFOSA OKOSUN (Head HR & Admin Unit)",
        pinned: false
      },
      {
        id: "circ-6",
        ref: "AMML/OPS/CIR/2026/07",
        date: "1st December, 2026",
        subject: "END OF YEAR MARKET OPERATIONS & FESTIVE PERIOD DEPLOYMENT SCHEDULE",
        body: "To ensure seamless market management, security, and facility upkeep during the upcoming holiday season, all Market Managers and Security Personnel are directed to operate under emergency duty rosters. Essential service officers must be designated at all markets (Wuse, Garki, Area 1/2, Gudu, Kaura, Kado, Karmo, Dei-Dei, Kugbo, Farmers Market).",
        audience: "All Market Operations & Security Staff",
        signee: "INNOCENT AMAECHINA (Head of Operations)",
        pinned: true
      },
      {
        id: "circ-7",
        ref: "AMML/HR/CIR/2026/08",
        date: "15th December, 2026",
        subject: "2026 HANDOVER REGISTRIES CLOSURE & 2027 ROSTER PLANNING DIRECTIVE",
        body: "All leave applications and handover notes for the 2026 financial year will officially close on December 24th, 2026. Unit Heads are required to submit draft 2027 Annual Leave Rosters for their respective divisions to HR & Admin on or before January 8th, 2027. We appreciate all staff for their dedication throughout 2026.",
        audience: "All Divisions & Units",
        signee: "EFOSA OKOSUN (Head HR & Admin Unit)",
        pinned: true
      }
    ];

    if (loaded.length === 0) return defaultCircs;
    const merged = [...loaded];
    defaultCircs.forEach(def => {
      if (!merged.some(c => c.id === def.id)) {
        merged.push(def);
      }
    });
    return merged;
  });

  // Circular Composer States
  const [newCircRef, setNewCircRef] = useState('AMML/HR/CIR/2026/02');
  const [newCircSubj, setNewCircSubj] = useState('');
  const [newCircBody, setNewCircBody] = useState('');
  const [newCircAud, setNewCircAud] = useState('All Markets');
  const [newCircSign, setNewCircSign] = useState('EFOSA OKOSUN (Head HR & Admin Unit)');
  const [showCircSuccess, setShowCircSuccess] = useState(false);

  // Save changes
  useEffect(() => {
    localStorage.setItem('amml_leave_memos', JSON.stringify(memos));
  }, [memos]);

  useEffect(() => {
    localStorage.setItem('amml_official_circulars', JSON.stringify(circulars));
  }, [circulars]);

  // Aggregated Stats per staff calculation
  const staffStats = staff.filter(s => s.active).map(s => {
    const sAtt = att.filter(a => a.staffId === s.id);
    const presentDays = sAtt.length;
    const lateDays = sAtt.filter(a => a.late).length;
    const lateRate = presentDays ? Math.round((lateDays / presentDays) * 100) : 0;
    
    let totalMins = 0;
    let counts = 0;
    sAtt.forEach(a => {
      if (a.clockIn && a.clockOut) {
        const [ih, im] = a.clockIn.split(':').map(Number);
        const [oh, om] = a.clockOut.split(':').map(Number);
        if (!isNaN(ih) && !isNaN(oh)) {
          totalMins += (oh * 60 + om) - (ih * 60 + im);
          counts++;
        }
      }
    });
    const avgHrsStr = counts ? `${(Math.floor((totalMins / counts) / 60))}h ${Math.round((totalMins / counts) % 60)}m` : '—';

    return {
      id: s.id,
      name: `${s.first} ${s.last}`,
      market: s.market,
      dept: s.dept,
      role: s.role,
      presentDays,
      lateDays,
      lateRate,
      avgHrs: avgHrsStr,
      attendanceRate: 100,
    };
  }).filter(stat => {
    const sMatch = !search || stat.name.toLowerCase().includes(search.toLowerCase()) || stat.id.toLowerCase().includes(search.toLowerCase());
    const mMatch = !selectedMkt || stat.market === selectedMkt;
    return sMatch && mMatch;
  });

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Staff ID,Name,Market,Department,Present Days,Late Days,Late Rate %,Avg Daily Hours\r\n';
    staffStats.forEach(s => {
      csvContent += `"${s.id}","${s.name}","${s.market}","${s.dept}",${s.presentDays},${s.lateDays},${s.lateRate}%,"${s.avgHrs}"\r\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amml_attendance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMayCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'S/N,Name,Office,No. of Days Present,No. of Days Punctual,Attendance %,Punctual %,Cumulative Performance %,Excused Leave Sync\r\n';
    
    may2026StaffAttendance.forEach(s => {
      const onLeaveCount = getExcusedDaysInMay(s.name);
      csvContent += `${s.sn},"${s.name}","${s.office}",${s.daysPresent},${s.daysPunctual},${s.attendanceRate ? s.attendanceRate + '%' : 'SMC'},${s.punctualRate ? s.punctualRate + '%' : 'SMC'},${s.cummPerformance ? s.cummPerformance + '%' : 'SMC'},${onLeaveCount} days\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amml_may_2026_head_office_attendance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  // Helper date checker inside May 2026 (for checkerboard grid display)
  const isStaffOnLeaveOnDayInMay = (staffName: string, dayNum: number) => {
    const activeWorkdays = [4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 18, 19, 20, 21, 22, 25, 26, 29];
    
    return memos.some(memo => {
      if (!memo.synced) return false;
      
      if (!areNamesMatching(staffName, memo.to, memo.market, "Head Office")) return false;
      
      const mNorm = memo.to.toUpperCase().replace(/[-.]/g, ' ').trim();

      // Extract the limit of approved leave days
      let maxApprovedDays = 31; // fallback default
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
      
      // For structured date range
      if (memo.startDate && memo.endDate) {
        try {
          const sDate = new Date(memo.startDate);
          const eDate = new Date(memo.endDate);
          const currentDate = new Date(2026, 4, dayNum); // May is index 4
          if (currentDate >= sDate && currentDate <= eDate) {
            isWithinRange = true;
          }
        } catch (e) {
          console.error("Format parse skip", e);
        }
      }

      if (!isWithinRange) {
        // Fallback to March/May historical ranges
        if (mNorm.includes("ABIGAIL") && memo.id.includes("exam")) {
          isWithinRange = dayNum >= 19 && dayNum <= 21;
        } else if (mNorm.includes("DANIEL") && mNorm.includes("ONOJA")) {
          isWithinRange = dayNum <= 13;
        } else if (mNorm.includes("BAMOR") || mNorm.includes("GABRIEL")) {
          isWithinRange = dayNum <= 11;
        } else if (mNorm.includes("NWOBODO")) { // Strict Nwobodo checker, no ONYINYECHI wildcard here
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
        } else if (mNorm.includes("AHMED UMAR") || mNorm.includes("ABUBAKAR")) {
          isWithinRange = dayNum >= 25;
        }
      }

      if (!isWithinRange) return false;

      // Ensure we don't give them more days than approved on their memo
      const rangeWorkdaysInMonth: number[] = [];
      activeWorkdays.forEach(day => {
        let isCand = false;
        if (memo.startDate && memo.endDate) {
          try {
            const sDate = new Date(memo.startDate);
            const eDate = new Date(memo.endDate);
            const currentDate = new Date(2026, 4, day);
            if (currentDate >= sDate && currentDate <= eDate) {
              isCand = true;
            }
          } catch (e) {}
        }
        if (!isCand) {
          if (mNorm.includes("ABIGAIL") && memo.id.includes("exam")) {
            isCand = day >= 19 && day <= 21;
          } else if (mNorm.includes("DANIEL") && mNorm.includes("ONOJA")) {
            isCand = day <= 13;
          } else if (mNorm.includes("BAMOR") || mNorm.includes("GABRIEL")) {
            isCand = day <= 11;
          } else if (mNorm.includes("NWOBODO")) {
            isCand = day >= 8;
          } else if (mNorm.includes("ASUE") || mNorm.includes("VICTOR")) {
            isCand = day >= 4 && day <= 15;
          } else if (mNorm.includes("SALIHU") || (mNorm.includes("MUSTAPHA") && memo.id.includes("salihu"))) {
            isCand = day >= 26;
          } else if (mNorm.includes("SARAH") || mNorm.includes("BROWN")) {
            isCand = day >= 14 && day <= 15;
          } else if (mNorm.includes("ILIYASU") || mNorm.includes("ALI")) {
            isCand = day >= 18;
          } else if (mNorm.includes("MUKHTAR") || (mNorm.includes("MUSTAPHA") && memo.id.includes("mukhtar"))) {
            isCand = day >= 15 && day <= 21;
          } else if (mNorm.includes("MADINA") || mNorm.includes("HASSAN")) {
            isCand = day >= 25 && day <= 29;
          } else if (mNorm.includes("HALIMA") || mNorm.includes("RABIU")) {
            isCand = day >= 25 && day <= 29;
          } else if (mNorm.includes("KAKA") || mNorm.includes("HAUWA")) {
            isCand = day >= 25;
          } else if (mNorm.includes("GAJO") || mNorm.includes("BAIDI")) {
            isCand = day >= 25 && day <= 29;
          } else if (mNorm.includes("YUSUF BIN YUSUF") || mNorm.includes("BIN YUSUF")) {
            isCand = day >= 25 && day <= 29;
          } else if (mNorm.includes("AHMED UMAR") || mNorm.includes("ABUBAKAR")) {
            isCand = day >= 25;
          }
        }
        if (isCand) {
          rangeWorkdaysInMonth.push(day);
        }
      });

      const idx = rangeWorkdaysInMonth.indexOf(dayNum);
      return idx !== -1 && idx < maxApprovedDays;
    });
  };

  // Helper calculates excused leave days during May active workdays
  const getExcusedDaysInMay = (staffName: string): number => {
    const activeWorkdays = [4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 18, 19, 20, 21, 22, 25, 26, 29];
    let count = 0;
    activeWorkdays.forEach(day => {
      if (isStaffOnLeaveOnDayInMay(staffName, day)) {
        count++;
      }
    });
    return count;
  };

  // Recalculates dynamically attendance score if leave is synced
  const getAdjustedAttendanceRate = (s: MayStaffAttendance): string => {
    const excused = getExcusedDaysInMay(s.name);
    if (excused === 0) return s.attendanceRate ? s.attendanceRate + '%' : 'SMC';
    
    // Active workdays count is 18
    const totalActiveDays = 18;
    const initialPresent = s.daysPresent || 0;
    const adjustedPresent = Math.min(totalActiveDays, initialPresent + excused);
    const rate = Math.round((adjustedPresent / totalActiveDays) * 100);
    return `${rate}% (Excused: +${excused}d)`;
  };

  const getDynamicToName = (m: LeaveMemo) => {
    if (m.corrected) {
      if (m.id === 'memo-justine') return "JUSTINE MANGER";
      if (m.id === 'memo-sarah') return "SARAH BROWN TAMUNOTARIBO";
      if (m.id === 'memo-madina') return "MADINA RASAK HASSAN";
      if (m.id === 'memo-halima') return "HALIMA RABIU MUHAMMAD";
      if (m.id === 'memo-kaka') return "HAUWA KAKA MUHAMMAD";
    }
    return m.to;
  };

  const getDynamicCcList = (m: LeaveMemo) => {
    let list = [...m.cc];
    if (m.corrected) {
      if (m.id === 'memo-joseph') {
        if (!list.includes("SAMUEL NYITAMEN")) {
          list.push("SAMUEL NYITAMEN");
        }
      }
      if (m.id === 'memo-abigail-1') {
        list = list.map(c => c === 'ISAH USMAN SHABBA' ? 'ISAH USMAN SHABA' : c);
      }
    }
    return list;
  };

  // Memo detail content logic based on template
  const getDynamicMemoContent = (m: LeaveMemo) => {
    if (m.body) {
      return m.body.split('\n\n');
    }
    const datesText = m.dates;
    const resumeText = m.resumeDate;
    const relieverText = m.corrected && m.id === 'memo-joseph' ? "Samuel Nyitamen" : m.reliever;
    const approvedDaysText = m.corrected && m.correctedDays ? m.correctedDays : m.approvedDays;
    const dateText = m.corrected && m.id === 'memo-joseph' ? "16th April, 2026" : m.date;

    const leadIn = `Please refer to your application/memo on the above subject matter dated ${m.id === 'memo-joseph' ? '10th April, 2026' : (m.isExam ? 'March 25th, 2026' : 'March 30th, 2026')}.`;
    
    if (m.isExam) {
      return [
        leadIn,
        `This is to convey management's approval of your request to proceed on ${approvedDaysText} days examination leave for the 2026 financial year with effect from ${datesText}.`,
        relieverText ? `${relieverText} will cover your schedule while you proceed on leave.` : `Please ensure your schedule is fully covered and managed before proceeding.`,
        `Please ensure you perform a perfect handover of your schedule of duties to ${relieverText ? relieverText : 'your designated cover'} before you proceed, copying the undersigned.`,
        `You are to resume duty on ${resumeText}.`
      ];
    } else if (m.id === 'memo-adjustment') {
      return [
        `Please refer to your notification dated May 4th, 2026, on the above-captioned subject structure.`,
        `This is to convey management's approval of your adjusted ${approvedDaysText} days annual leave period for the 2026 financial year with effect from ${datesText}.`,
        `${relieverText} will cover your schedule while you are away.`,
        `Please do a perfect handover to him before you proceed and verify that all file registry is completely clear.`,
        `You are to resume duty on ${resumeText}.`
      ];
    } else {
      return [
        leadIn,
        `This is to convey management's approval of your request to proceed on ${approvedDaysText} days annual leave for the 2026 financial year with effect from ${datesText}.`,
        relieverText ? `${relieverText} will cover your schedule while you are away.` : `Please ensure your desk duties are coordinated before you proceed.`,
        `Please do a comprehensive handover of your schedule of duties to ${relieverText ? relieverText : 'your designee'} before you proceed, copying the undersigned.`,
        `You are to resume duty on ${resumeText}.`
      ];
    }
  };

  // Actions
  const handleToggleSync = (idx: number) => {
    const updated = [...memos];
    updated[idx].synced = !updated[idx].synced;
    setMemos(updated);
  };

  const handleToggleCorrection = (idx: number) => {
    const updated = [...memos];
    updated[idx].corrected = !updated[idx].corrected;
    setMemos(updated);
  };

  // Circular publisher action
  const handleCirculateCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircSubj.trim() || !newCircBody.trim()) return;

    const newCirc: Circular = {
      id: `circ-${Date.now()}`,
      ref: newCircRef,
      date: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }),
      subject: newCircSubj.toUpperCase(),
      body: newCircBody,
      audience: newCircAud,
      signee: newCircSign,
      pinned: false
    };

    setCirculars([newCirc, ...circulars]);
    setNewCircSubj('');
    setNewCircBody('');
    setShowCircSuccess(true);
    setTimeout(() => setShowCircSuccess(false), 5000);
  };

  const currentMemo = memos[activeMemoIdx];

  const activeWorkdays = [4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 18, 19, 20, 21, 22, 25, 26, 29];
  const weekends = [2, 3, 9, 10, 16, 17, 23, 24, 30, 31];
  const holidays = [1, 27, 28];

  return (
    <div className="space-y-6" id="amml-reports-view">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-amml-border/60 pb-5" id="reports-header-section">
        <div>
          <h1 className="font-serif font-black text-2xl text-amml-text tracking-wide" id="reports-view-title">AMML Registry & Circulars Desk</h1>
          <p className="text-xs text-amml-text3 font-medium font-sans">
            Central coordination portal for leave approvals, corporate circulars, and head office desk synchronizations.
          </p>
        </div>
        
        {/* Report Type Selector Tabs */}
        <div className="flex flex-wrap gap-1 bg-amml-surface2 p-1 rounded-xl border border-amml-border/60 mt-4 md:mt-0" id="report-type-selectors">
          <button 
            id="btn-tab-may2026"
            onClick={() => setReportType('may2026')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reportType === 'may2026' 
                ? 'bg-[#0064B4] text-white shadow-md' 
                : 'text-amml-text opacity-70 hover:opacity-100 hover:bg-amml-surface3'
            }`}
          >
            Audit Grid
          </button>
          <button 
            id="btn-tab-memos"
            onClick={() => setReportType('memos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reportType === 'memos' 
                ? 'bg-[#0064B4] text-white shadow-md' 
                : 'text-amml-text opacity-70 hover:opacity-100 hover:bg-amml-surface3'
            }`}
          >
            Leave Correspondence ({memos.length})
          </button>
          <button 
            id="btn-tab-circulars"
            onClick={() => setReportType('circulars')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reportType === 'circulars' 
                ? 'bg-[#0064B4] text-white shadow-md' 
                : 'text-amml-text opacity-70 hover:opacity-100 hover:bg-amml-surface3'
            }`}
          >
            Dissemination Hub ({circulars.length})
          </button>
          <button 
            id="btn-tab-summary"
            onClick={() => setReportType('summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reportType === 'summary' 
                ? 'bg-[#0064B4] text-white shadow-md' 
                : 'text-amml-text opacity-70 hover:opacity-100 hover:bg-amml-surface3'
            }`}
          >
            Terminal Stats
          </button>
          <button 
            id="btn-tab-late"
            onClick={() => setReportType('late')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reportType === 'late' 
                ? 'bg-[#0064B4] text-white shadow-md' 
                : 'text-amml-text opacity-70 hover:opacity-100 hover:bg-amml-surface3'
            }`}
          >
            Lateness Trends
          </button>
        </div>
      </div>

      {showCircSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-3 animate-fade-in" id="circular-success-banner">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>
            <strong>CIRCULATED SUCCESSFULLY:</strong> Corporate Circular broadcasted and delivered across all locations and registered terminals.
          </span>
        </div>
      )}

      {/* 1. SECTOR: MAY 2026 HEAD OFFICE AUDIT */}
      {reportType === 'may2026' && (
        <May2026AuditSection 
          search={search}
          setSearch={setSearch}
          mayInnerTab={mayInnerTab}
          setMayInnerTab={setMayInnerTab}
          onNavigateToMemo={(memoId) => {
            localStorage.setItem('amml_active_memo_id', memoId);
            setReportType('memos');
          }}
        />
      )}

      {/* 2. SECTOR: OFFICIAL CORRESPONDENCE AND MEMOS */}
      {reportType === 'memos' && (
        <MemoRegistry />
      )}
      {false && reportType === 'memos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="leave-memos-workspace">
          {/* Memos Sidebar selection */}
          <div className="lg:col-span-4 shrink-0 flex flex-col gap-3" id="memos-sidebar">
            <div className="bg-amml-surface2 p-3 border border-amml-border rounded-xl space-y-1">
              <h3 className="font-serif font-black text-xs text-amml-text uppercase tracking-wider">Leave Approvals Ledger</h3>
              <p className="text-[10px] text-amml-text3 font-sans">Click any correspondence to view terms and compliance report.</p>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[500px] pr-1" id="memos-list">
              {memos.map((m, idx) => (
                <button
                  key={m.id}
                  id={`btn-memo-select-${m.id}`}
                  onClick={() => setActiveMemoIdx(idx)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    activeMemoIdx === idx 
                      ? 'bg-gradient-to-r from-[#0064B4] to-[#005299] border-[#0064B4]/50 shadow-md text-white' 
                      : 'bg-amml-surface2/60 border-amml-border/60 hover:bg-amml-surface3/40 text-amml-text'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`font-mono text-[9px] uppercase tracking-wider ${activeMemoIdx === idx ? 'text-blue-200' : 'text-amml-text3'}`}>
                      {m.market}
                    </span>
                    {m.synced ? (
                      <span className="inline-flex items-center text-[8px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        SYNCED
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[8px] font-bold bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                        PENDING
                      </span>
                    )}
                  </div>
                  
                  <div className="font-semibold text-xs leading-snug tracking-tight">
                    {m.to}
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-medium ${activeMemoIdx === idx ? 'text-blue-100' : 'text-amml-text2'}`}>
                      {m.isExam ? 'Exam Leave' : 'Annual Leave'}
                    </span>
                    <span className={`font-mono font-bold ${activeMemoIdx === idx ? 'text-white' : 'text-amml-text'}`}>
                      {m.corrected && m.correctedDays ? m.correctedDays : m.approvedDays} Days
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Letterhead and compliance audit forms */}
          <div className="lg:col-span-8 space-y-6" id="memos-detail-view bg-opacity-30">
            {currentMemo ? (
              <div className="space-y-6">
                {/* Government Formal Letterhead */}
                <div className="border-4 border-double border-amml-border/70 p-6 sm:p-8 bg-amml-surface border-opacity-90 rounded-xl space-y-6 shadow-xl relative overflow-hidden" id="official-letterhead">
                  
                  {/* Classical AMML Header logo strip */}
                  <div className="text-center pb-4 border-b border-amml-border/40" id="letterhead-header">
                    <h2 className="font-serif font-black text-lg tracking-widest text-[#0064B4]">ABUJA MARKETS MANAGEMENT LIMITED</h2>
                    <p className="text-[9px] text-amml-text3 tracking-wider uppercase font-mono mt-0.5">Corporate Headquarters Garki FCT Abuja • HR Unit</p>
                    <div className="flex justify-center gap-1.5 mt-2">
                      <span className="w-1.5 h-1.5 bg-[#0064B4] rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-amml-orange rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono border-b border-amml-border/30 pb-2" id="letterhead-metadatabar">
                    <span>REF: AMML/HR/REG/2026/0{activeMemoIdx + 12}</span>
                    <span>CONFIDENTIAL</span>
                  </div>

                  {/* TO/FROM Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-sans tracking-wide leading-relaxed border-b border-amml-border/35 pb-4" id="letterhead-memo-terms">
                    <div className="space-y-1">
                      <p><strong className="text-amml-text3 font-mono">FROM:</strong> Head HR & Admin Unit</p>
                      <p><strong className="text-amml-text3 font-mono">DATE:</strong> {currentMemo.corrected && currentMemo.id === 'memo-joseph' ? "16th April, 2026" : currentMemo.date}</p>
                    </div>
                    <div className="space-y-1">
                      <p><strong className="text-amml-text3 font-mono">TO:</strong> <span className="font-bold underline text-amml-text">{getDynamicToName(currentMemo)}</span></p>
                      <p><strong className="text-amml-text3 font-mono">LOCATION:</strong> {currentMemo.market}</p>
                    </div>
                  </div>

                  {/* Subject and body paragraphs */}
                  <div className="space-y-4" id="letterhead-memo-body">
                    <h3 className="font-serif font-black text-center text-xs tracking-wider border-b border-amml-border/25 pb-2 text-amml-text">
                      {currentMemo.subject}
                    </h3>

                    <div className="space-y-3.5 text-xs text-amml-text2 leading-relaxed">
                      {getDynamicMemoContent(currentMemo).map((p, pIdx) => (
                        <p key={pIdx} className="text-justify font-sans">{p}</p>
                      ))}
                    </div>
                  </div>

                  {/* CC list and Signature */}
                  <div className="pt-6 border-t border-amml-border/30 flex justify-between items-start" id="letterhead-signature-block">
                    <div className="space-y-1 text-[10px] font-mono text-amml-text3">
                      <span className="block font-bold">Cc:</span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {getDynamicCcList(currentMemo).map((c, cIdx) => (
                          <li key={cIdx}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-right">
                      <span className="block italic text-[11px] font-serif pr-2 text-amml-text3 font-bold">Signed,</span>
                      <span className="block font-bold text-xs uppercase text-[#0064B4] mt-4 font-serif">EFOSA OKOSUN</span>
                      <span className="block text-[8px] tracking-widest font-mono text-amml-text3">Head HR & Admin Unit</span>
                    </div>
                  </div>

                </div>

                {/* Registry Smart Auditing Section */}
                <div className="bg-[#0b1320] border-2 border-indigo-500/20 p-5 rounded-xl space-y-4 shadow-md" id="smart-audit-card">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-black text-xs text-indigo-400 tracking-wider uppercase flex items-center gap-2">
                      <AlertOctagon className="h-4 w-4" />
                      Registrar Audit Statement & Sync Tool
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">AMML-COMPLIANCE-V2.6</span>
                  </div>

                  {currentMemo.inconsistencies.length > 0 ? (
                    <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg space-y-2">
                      <span className="block text-[10px] font-bold text-rose-400 uppercase tracking-widest">Inconsistencies Flagged:</span>
                      <ul className="space-y-1 text-xs text-amml-text2">
                        {currentMemo.inconsistencies.map((inc, incIdx) => (
                          <li key={incIdx} className="flex items-start gap-2 text-rose-300">
                            <span className="text-rose-400 shrink-0 select-none">•</span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>Formal and calculated terms of this memo are 100% compliant with standard company regulations.</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2" id="audit-card-action-bar">
                    {/* Repair button */}
                    {currentMemo.inconsistencies.length > 0 && (
                      <button
                        id="btn-fix-memo"
                        onClick={() => handleToggleCorrection(activeMemoIdx)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          currentMemo.corrected 
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                            : 'bg-amber-600/10 hover:bg-amber-600/20 border-amber-500/40 text-amber-400'
                        }`}
                      >
                        <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                        {currentMemo.corrected ? 'Repair Applied' : 'Auto-Resolve & Correct'}
                      </button>
                    )}

                    {/* Sync button */}
                    <button
                      id="btn-sync-memo-grid"
                      onClick={() => handleToggleSync(activeMemoIdx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        currentMemo.synced 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
                          : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200'
                      }`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      {currentMemo.synced ? 'Synced (Click to Unsync)' : 'Sync Leave to Workforce Ledger'}
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-amml-text3" id="memo-none">Select a leave memo to start.</div>
            )}
          </div>
        </div>
      )}

      {/* 3. SECTOR: CORPORATE CIRCULAR BROADCAST AND BOARD */}
      {reportType === 'circulars' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="circulars-hub-grid">
          
          {/* Draft Composer Form */}
          <div className="lg:col-span-5 bg-amml-surface border border-amml-border/60 p-5 rounded-xl space-y-4 shadow-lg h-fit" id="circular-composer">
            <h3 className="font-serif font-black text-sm text-[#0064B4] tracking-wider uppercase flex items-center gap-2">
              <Plus className="h-4 w-4" /> Drafting Circular Dissemination Desk
            </h3>
            <p className="text-[10px] text-amml-text3 font-sans mt-1">Write and dispatch new official circular to registered market terminals instantly.</p>
            
            <form onSubmit={handleCirculateCircular} className="space-y-4 pt-3 text-xs" id="circular-draft-form">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-amml-text2 font-mono text-[9px] uppercase">Ref. Code</label>
                  <input 
                    id="input-circ-ref"
                    type="text" 
                    value={newCircRef} 
                    onChange={e => setNewCircRef(e.target.value)}
                    className="w-full bg-amml-surface2 border border-amml-border rounded-lg p-2 text-amml-text font-mono" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-amml-text2 font-mono text-[9px] uppercase">Target Audience</label>
                  <select 
                    id="select-circ-audience"
                    value={newCircAud} 
                    onChange={e => setNewCircAud(e.target.value)}
                    className="w-full bg-amml-surface2 border border-amml-border rounded-lg p-2 text-amml-text font-sans"
                  >
                    <option value="All Markets">All Company Markets</option>
                    <option value="Head Office">Head Office Only</option>
                    <option value="Wuse Market Only">Wuse Market Only</option>
                    <option value="Gudu Market Only">Gudu Market Only</option>
                    <option value="Dei Dei Market Only">Dei Dei Market Only</option>
                    <option value="Kaura Market Only">Kaura Market Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-amml-text2 font-mono text-[9px] uppercase">Circular Heading / Subject</label>
                <input 
                  id="input-circ-subject"
                  type="text" 
                  value={newCircSubj} 
                  onChange={e => setNewCircSubj(e.target.value)}
                  placeholder="EX: MANDATORY WEARING OF OFFICIAL STAFF ACCREDITATION"
                  className="w-full bg-amml-surface2 border border-amml-border rounded-lg p-2 text-amml-text font-serif" 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="block text-amml-text2 font-mono text-[9px] uppercase">Directive Details / Body Message</label>
                <textarea 
                  id="textarea-circ-body"
                  value={newCircBody} 
                  onChange={e => setNewCircBody(e.target.value)}
                  placeholder="Draft the directive details here. This message will be active across all attendance kiosks."
                  rows={4}
                  className="w-full bg-amml-surface2 border border-amml-border rounded-lg p-2 text-amml-text font-sans leading-relaxed text-xs" 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="block text-amml-text2 font-mono text-[9px] uppercase">Signee Sign-off Details</label>
                <input 
                  id="input-circ-signee"
                  type="text" 
                  value={newCircSign} 
                  onChange={e => setNewCircSign(e.target.value)}
                  className="w-full bg-amml-surface2 border border-amml-border rounded-lg p-2 text-amml-text font-sans font-bold" 
                  required 
                />
              </div>

              <button 
                id="btn-broadcast-circular"
                type="submit" 
                className="w-full bg-[#0064B4] hover:bg-[#005299] text-white font-bold p-2.5 rounded-lg flex items-center justify-center gap-2 text-xs transition-all shadow-md"
              >
                <Send className="h-4 w-4" /> Broadcast & Circulate Directive
              </button>
            </form>
          </div>

          {/* Active Directive Board */}
          <div className="lg:col-span-7 space-y-4" id="circular-board-view">
            <div className="bg-gradient-to-r from-indigo-950 to-[#0c1624] p-4 border border-indigo-500/20 rounded-xl space-y-1" id="circ-board-header">
              <h3 className="font-serif font-black text-sm text-indigo-300 tracking-wide uppercase flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-pulse text-indigo-400" /> Active Corporate Broadcast Directives
              </h3>
              <p className="text-[10px] text-slate-300">Live feed streaming real-time to all field scanners and attendance points.</p>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1" id="circulars-ticker">
              {circulars.map((c, cIdx) => (
                <div key={c.id} className="bg-amml-surface border border-amml-border/60 rounded-xl p-5 shadow-md relative overflow-hidden" id={`card-circular-${c.id}`}>
                  
                  {/* Pinned accent line */}
                  <span className="absolute top-0 left-0 w-1.5 h-full bg-[#0064B4]"></span>

                  <div className="flex justify-between items-start text-[10px] font-mono text-amml-text3 pb-2 border-b border-amml-border/30">
                    <span>{c.ref}</span>
                    <span className="bg-[#0064B4]/10 text-[#0064B4] px-1.5 py-0.5 rounded font-sans font-bold">{c.audience}</span>
                  </div>

                  <div className="pt-3 space-y-2">
                    <h4 className="font-serif font-black text-xs text-amml-text leading-snug tracking-normal uppercase">{c.subject}</h4>
                    <p className="text-xs text-amml-text2 leading-relaxed text-justify font-sans">{c.body}</p>
                  </div>

                  <div className="pt-4 border-t border-amml-border/30 flex justify-between items-center text-[10px] font-sans text-amml-text3 mt-4" id="circular-footer-card">
                    <span>Date Issued: <strong className="text-amml-text2">{c.date}</strong></span>
                    <span>Signee: <strong className="text-amml-text2">{c.signee}</strong></span>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 4. SECTOR: SUMMARY STATISTICS AND REPORTING */}
      {reportType === 'summary' && (
        <div className="space-y-6" id="summary-reporting-sector">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-amml-surface2 p-4 rounded-xl border border-amml-border/60">
            <div>
              <h2 className="font-serif font-black text-sm text-amml-text">Active Hardware node registry aggregates</h2>
              <p className="text-xs text-amml-text3 mt-0.5">Summary of attendance, total logged durations, and compliance scores across all locations.</p>
            </div>
            
            <div className="flex gap-2">
              <input 
                id="input-staff-stats-search"
                type="text"
                placeholder="Search by ID or name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-amml-surface border border-amml-border rounded-lg px-3 py-1.5 text-xs text-amml-text placeholder-amml-text3 font-sans"
              />
              <select
                id="select-staff-stats-market"
                value={selectedMkt}
                onChange={e => setSelectedMkt(e.target.value)}
                className="bg-amml-surface border border-amml-border rounded-lg px-3 py-1.5 text-xs text-amml-text font-sans"
              >
                <option value="">All Markets</option>
                {markets.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
              <button 
                id="btn-export-stats-csv"
                onClick={handleExportCSV}
                className="flex items-center gap-1 bg-[#0064B4] hover:bg-[#005299] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              >
                <Download className="h-3.5 w-3.5" /> Exports
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-amml-border/60 rounded-xl bg-amml-surface bg-opacity-90" id="stats-summary-table-container">
            <table className="w-full text-left text-xs border-collapse font-sans text-amml-text" id="stats-summary-table">
              <thead>
                <tr className="bg-amml-surface2 text-[10px] text-amml-text font-bold uppercase tracking-wider border-b border-amml-border">
                  <th className="p-3 w-24">Staff ID</th>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Designated Location</th>
                  <th className="p-3 text-center">Days Clocked</th>
                  <th className="p-3 text-center">Average Logged Session</th>
                  <th className="p-3 text-center text-amml-orange">Lateness Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amml-border/40 font-sans">
                {staffStats.length > 0 ? (
                  staffStats.map(s => (
                    <tr key={s.id} className="hover:bg-amml-surface3/40 transition-all">
                      <td className="p-3 font-mono text-amml-text3 font-bold">{s.id}</td>
                      <td className="p-3 font-semibold text-amml-text">{s.name}</td>
                      <td className="p-3 text-amml-text2">{s.market} ({s.dept})</td>
                      <td className="p-3 text-center font-mono font-medium">{s.presentDays}</td>
                      <td className="p-3 text-center font-mono">{s.avgHrs}</td>
                      <td className="p-3 text-center font-mono text-rose-400 font-bold bg-rose-500/5">{s.lateRate}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-amml-text3">No records matched active search filter parameters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SECTOR: LATENESS ANALYSIS AND GRAPHICAL PATTERNS */}
      {reportType === 'late' && (
        <div className="space-y-6" id="late-analysis-sector">
          <div className="bg-amml-surface2 p-4 border border-amml-border/60 rounded-xl space-y-1">
            <h2 className="font-serif font-black text-sm text-amml-text leading-tight">Terminal Late Attendance Audits</h2>
            <p className="text-xs text-amml-text3 leading-relaxed">Aggregated lateness distribution by locations. Tracks nodes clocking in past threshold minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="late-aggregates-cards">
            {markets.slice(0, 6).map((m, mIdx) => {
              const mAtt = att.filter(a => a.market === m.name);
              const mLate = mAtt.filter(a => a.late).length;
              const rate = mAtt.length ? Math.round((mLate / mAtt.length) * 100) : 0;
              
              return (
                <div key={mIdx} className="bg-amml-surface border border-amml-border/60 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-[#0064B4]/40" id={`late-idx-card-${mIdx}`}>
                  <div>
                    <span className="block font-serif font-black text-xs text-amml-text truncate max-w-[150px]">{m.name}</span>
                    <span className="block text-[10px] text-amml-text3 font-mono mt-0.5">{mLate} late logs in last 30d</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono text-lg font-black ${rate > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>{rate}%</span>
                    <span className="block text-[8px] text-slate-500 uppercase font-mono tracking-widest">Rate</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
