export interface MarchStaffAttendance {
  sn: number;
  name: string;
  office: string;
  scheduledDays: number | null;
  daysPresent: number | null;
  daysPunctual: number | null;
  attendanceRate: number | string | null; // e.g. 100
  punctualRate: number | string | null;   // e.g. 67
  cummPerformance: number | string | null; // e.g. 83
  dailyCodes?: string[]; // 30 entries for days 1 to 30
}

export const march2026StaffAttendance: MarchStaffAttendance[] = [
  { sn: 1, name: "ONYA OJIJI", office: "AG. MD/CEO", scheduledDays: 18, daysPresent: 18, daysPunctual: 12, attendanceRate: 100, punctualRate: 67, cummPerformance: 83 },
  { sn: 2, name: "INNOCENT AMAECHINA", office: "HOD, OPS", scheduledDays: 18, daysPresent: 18, daysPunctual: 16, attendanceRate: 100, punctualRate: 89, cummPerformance: 94 },
  { sn: 3, name: "BAFFA FARUK", office: "HEAD, F&A", scheduledDays: 18, daysPresent: 18, daysPunctual: 7, attendanceRate: 100, punctualRate: 39, cummPerformance: 69 },
  { sn: 4, name: "DANIEL O. ONOJA", office: "ACCOUNTS", scheduledDays: 18, daysPresent: 18, daysPunctual: 18, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 5, name: "EFOSA OKOSUN", office: "HEAD HR/A", scheduledDays: 18, daysPresent: 18, daysPunctual: 17, attendanceRate: 100, punctualRate: 94, cummPerformance: 97 },
  { sn: 6, name: "MUSA HUSSEINI SHELLENG", office: "MS & E", scheduledDays: 14, daysPresent: 14, daysPunctual: 8, attendanceRate: 100, punctualRate: 57, cummPerformance: 79 },
  { sn: 7, name: "IBRAHIM SA'AD", office: "CS/LA", scheduledDays: 18, daysPresent: 18, daysPunctual: 13, attendanceRate: 100, punctualRate: 72, cummPerformance: 86 },
  { sn: 8, name: "UGWU EKECHUKWU UGWU", office: "AUDIT", scheduledDays: 20, daysPresent: 20, daysPunctual: 19, attendanceRate: 100, punctualRate: 95, cummPerformance: 98 },
  { sn: 9, name: "MICHAEL OKPEWHO", office: "AUDIT", scheduledDays: 6, daysPresent: 6, daysPunctual: 5, attendanceRate: 100, punctualRate: 83, cummPerformance: 92 },
  { sn: 10, name: "HAUWA ILIYASU", office: "AUDIT", scheduledDays: 20, daysPresent: 20, daysPunctual: 18, attendanceRate: 100, punctualRate: 90, cummPerformance: 95 },
  { sn: 11, name: "ANUNOBI CATHERINE", office: "ACCOUNTS", scheduledDays: 20, daysPresent: 20, daysPunctual: 11, attendanceRate: 100, punctualRate: 55, cummPerformance: 78 },
  { sn: 12, name: "OZICHI EMELOGU", office: "MD'S OFFICE", scheduledDays: 20, daysPresent: 20, daysPunctual: 10, attendanceRate: 100, punctualRate: 50, cummPerformance: 75 },
  { sn: 13, name: "AMINA KABARAINI SALAU", office: "ACCOUNTS", scheduledDays: 20, daysPresent: 20, daysPunctual: 18, attendanceRate: 100, punctualRate: 90, cummPerformance: 95 },
  { sn: 14, name: "JANET ILE IDAKWO", office: "CSIT", scheduledDays: 20, daysPresent: 20, daysPunctual: 12, attendanceRate: 100, punctualRate: 60, cummPerformance: 80 },
  { sn: 15, name: "WILLIAMS JOY OKOI", office: "CSIT", scheduledDays: 20, daysPresent: 20, daysPunctual: 16, attendanceRate: 100, punctualRate: 80, cummPerformance: 90 },
  { sn: 16, name: "ISAH USMAN SHABA", office: "ACCOUNTS", scheduledDays: 20, daysPresent: 20, daysPunctual: 13, attendanceRate: 100, punctualRate: 65, cummPerformance: 83 },
  { sn: 17, name: "JOHN FRIDAY ANZAKU", office: "ADMIN/HR", scheduledDays: 20, daysPresent: 20, daysPunctual: 16, attendanceRate: 100, punctualRate: 80, cummPerformance: 90 },
  { sn: 18, name: "ALIYU MAGAJI MUAZU", office: "ACCOUNTS", scheduledDays: 19, daysPresent: 19, daysPunctual: 19, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 19, name: "YUSUF ADAMU", office: "DRIVER", scheduledDays: 20, daysPresent: 20, daysPunctual: 8, attendanceRate: 100, punctualRate: 40, cummPerformance: 70 },
  { sn: 20, name: "SUNDAY CHINDO", office: "DRIVER", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 21, name: "BASHIRU DAUDA", office: "DRIVER", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 22, name: "HARUNA MAGARI MARO", office: "DRIVER", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 23, name: "ONYINYECHI TENIOLA SAMPSON", office: "ADMIN/HR", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 24, name: "KABIRU ABDULLAHI", office: "DRIVER", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 25, name: "AJIO BENEDICT BEMSHIMA (DISPATCH)", office: "DRIVER", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 26, name: "YUSUF ISMAIL", office: "ACCOUNTS", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 27, name: "HAPPINESS IFEOMA NNAMDI O.", office: "MD'S OFFICE", scheduledDays: 10, daysPresent: 10, daysPunctual: 4, attendanceRate: 100, punctualRate: 40, cummPerformance: 70 },
  { sn: 28, name: "SALIHU MUHAMMED MUSTAPHA", office: "ADMIN/HR", scheduledDays: 18, daysPresent: 18, daysPunctual: 17, attendanceRate: 100, punctualRate: 94, cummPerformance: 97 },
  { sn: 29, name: "JEDIDIAH OJEH", office: "CSIT", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 30, name: "MBOUTIDEM DANIEL THOMPSON", office: "CSIT", scheduledDays: 20, daysPresent: 20, daysPunctual: 17, attendanceRate: 100, punctualRate: 85, cummPerformance: 93 },
  { sn: 31, name: "MUHAMMED FADEEL ISAH", office: "CSIT", scheduledDays: 19, daysPresent: 19, daysPunctual: 14, attendanceRate: 100, punctualRate: 74, cummPerformance: 87 },
  { sn: 32, name: "OKEZIE GOD'SWILL KELECHI", office: "CSIT", scheduledDays: 19, daysPresent: 19, daysPunctual: 11, attendanceRate: 100, punctualRate: 58, cummPerformance: 79 },
  { sn: 33, name: "HASSAN ALIYU", office: "FAC&GS", scheduledDays: 20, daysPresent: 20, daysPunctual: 13, attendanceRate: 100, punctualRate: 65, cummPerformance: 83 },
  { sn: 34, name: "AISHA BAIDI GAJO", office: "REGISTRY", scheduledDays: 20, daysPresent: 20, daysPunctual: 19, attendanceRate: 100, punctualRate: 95, cummPerformance: 98 },
  { sn: 35, name: "MUKHTAR MUSTAPHA", office: "ACCOUNTS", scheduledDays: 20, daysPresent: 20, daysPunctual: 9, attendanceRate: 100, punctualRate: 45, cummPerformance: 73 },
  { sn: 36, name: "JOSEPH KEHINDE AYOOLA", office: "FAC&GS", scheduledDays: 20, daysPresent: 20, daysPunctual: 14, attendanceRate: 100, punctualRate: 70, cummPerformance: 85 },
  { sn: 37, name: "SANGOTOYE ABIGAIL", office: "ACCOUNTS", scheduledDays: 9, daysPresent: 9, daysPunctual: 6, attendanceRate: 100, punctualRate: 67, cummPerformance: 83 },
  { sn: 38, name: "YUSUF BIN YUSUF", office: "REGISTRY", scheduledDays: 20, daysPresent: 20, daysPunctual: 12, attendanceRate: 100, punctualRate: 60, cummPerformance: 80 },
  { sn: 39, name: "BLESSING UZOH", office: "REGISTRY", scheduledDays: 5, daysPresent: 5, daysPunctual: 3, attendanceRate: 100, punctualRate: 60, cummPerformance: 80 },
  { sn: 40, name: "HALIMA RABIU MUHAMMAD", office: "AUDIT", scheduledDays: 20, daysPresent: 20, daysPunctual: 18, attendanceRate: 100, punctualRate: 90, cummPerformance: 95 },
  { sn: 41, name: "RAFAIAT OGUNYEMI OPEYEMI", office: "MD'S OFFICE", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 42, name: "AWARD OMOMOH IDAEWOR", office: "FAC&GS", scheduledDays: 20, daysPresent: 20, daysPunctual: 13, attendanceRate: 100, punctualRate: 65, cummPerformance: 83 },
  { sn: 43, name: "MICHAEL JOSEPH INALEGWU", office: "AUDIT", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 44, name: "MGBII DORATHY CHISOM", office: "ACCOUNTS", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 45, name: "ISSA SULAIMAN", office: "FAC&GS", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 46, name: "AMINA ADAMU", office: "ACCOUNTS", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 47, name: "HASSANA HARUNA", office: "ACCOUNTS", scheduledDays: 20, daysPresent: 20, daysPunctual: 18, attendanceRate: 100, punctualRate: 90, cummPerformance: 95 },
  { sn: 48, name: "AGU PRECIOUS", office: "FAC&GS", scheduledDays: 20, daysPresent: 20, daysPunctual: 20, attendanceRate: 100, punctualRate: 100, cummPerformance: 100 },
  { sn: 49, name: "AGETU VERA .I.", office: "ACCOUNTS", scheduledDays: 20, daysPresent: 20, daysPunctual: 19, attendanceRate: 100, punctualRate: 95, cummPerformance: 98 },
  { sn: 50, name: "AYINDE FOLASHADE", office: "HR/ADMIN", scheduledDays: 20, daysPresent: 20, daysPunctual: 17, attendanceRate: 100, punctualRate: 85, cummPerformance: 93 },
  { sn: 51, name: "SHAFIU ABBAS", office: "ACCOUNTS", scheduledDays: 10, daysPresent: 10, daysPunctual: 17, attendanceRate: 100, punctualRate: 170, cummPerformance: 135 },
  { sn: 52, name: "JAMES MUSA", office: "MS & E", scheduledDays: 18, daysPresent: 18, daysPunctual: 12, attendanceRate: 100, punctualRate: 67, cummPerformance: 83 },
  { sn: 53, name: "AZIBAODINIYAR TOBINS", office: "MS & E", scheduledDays: 18, daysPresent: 18, daysPunctual: 14, attendanceRate: 100, punctualRate: 78, cummPerformance: 89 },
  { sn: 54, name: "UKONU IKECHUKWU M.", office: "CSIT", scheduledDays: 20, daysPresent: 20, daysPunctual: 16, attendanceRate: 100, punctualRate: 80, cummPerformance: 90 },
  { sn: 55, name: "EUNICE MARAVI BWALA", office: "REGISTRY", scheduledDays: 20, daysPresent: 20, daysPunctual: 18, attendanceRate: 100, punctualRate: 90, cummPerformance: 95 },
  { sn: 56, name: "CHRISTOPHER O. MISHAEL", office: "HR/ADMIN", scheduledDays: 18, daysPresent: 18, daysPunctual: 14, attendanceRate: 100, punctualRate: 78, cummPerformance: 89 }
];

export const getMarchSummaryStats = () => {
  const totalStaff = march2026StaffAttendance.length;
  const avgAttendance = 100; // All present in schedule
  const avgPunctuality = Math.round(
    march2026StaffAttendance.reduce((acc, curr) => acc + (typeof curr.punctualRate === 'number' ? curr.punctualRate : 0), 0) / totalStaff
  );
  const avgPerformance = Math.round(
    march2026StaffAttendance.reduce((acc, curr) => acc + (typeof curr.cummPerformance === 'number' ? curr.cummPerformance : 0), 0) / totalStaff
  );

  return {
    totalStaff,
    avgAttendance,
    avgPunctuality,
    avgPerformance,
    period: "March 2026 Head Office Sheet"
  };
};
