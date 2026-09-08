export interface MayStaffAttendance {
  sn: number;
  name: string;
  office: string;
  attendanceRate: number | string | null; // e.g., 100 or "SMC" or null
  punctualRate: number | string | null; // e.g., 94 or "SMC" or null
  cummPerformance: number | string | null; // e.g., 97 or "SMC" or null
  daysPresent: number;
  daysPunctual: number;
  wfhDays?: string[];
}

export const may2026StaffAttendance: MayStaffAttendance[] = [
  { sn: 1, name: "ONYA OJIJI", office: "AG. MD/CEO", attendanceRate: 100, punctualRate: 67, cummPerformance: 84, daysPresent: 18, daysPunctual: 12 },
  { sn: 2, name: "INNOCENT AMAECHINA", office: "HOD, OPS", attendanceRate: 100, punctualRate: 89, cummPerformance: 95, daysPresent: 18, daysPunctual: 16 },
  { sn: 3, name: "BAFFA FARUK", office: "HEAD, F&A", attendanceRate: 100, punctualRate: 39, cummPerformance: 70, daysPresent: 18, daysPunctual: 7 },
  { sn: 4, name: "DANIEL O. ONOJA", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 18, daysPunctual: 18 },
  { sn: 5, name: "EFOSA OKOSUN", office: "HEAD HR/A", attendanceRate: 100, punctualRate: 94, cummPerformance: 97, daysPresent: 18, daysPunctual: 17 },
  { sn: 6, name: "MUSA HUSSEINI SHELLENG", office: "MS & E", attendanceRate: 100, punctualRate: 57, cummPerformance: 79, daysPresent: 14, daysPunctual: 8 },
  { sn: 7, name: "IBRAHIM SA'AD", office: "CS/LA", attendanceRate: 100, punctualRate: 72, cummPerformance: 86, daysPresent: 18, daysPunctual: 13 },
  { sn: 8, name: "UGWU EKECHUKWU UGWU", office: "AUDIT", attendanceRate: 100, punctualRate: 95, cummPerformance: 98, daysPresent: 20, daysPunctual: 19 },
  { sn: 9, name: "MICHAEL OKPEWHO", office: "AUDIT", attendanceRate: 100, punctualRate: 83, cummPerformance: 92, daysPresent: 6, daysPunctual: 5 },
  { sn: 10, name: "HAUWA ILIYASU ALI", office: "AUDIT", attendanceRate: 100, punctualRate: 90, cummPerformance: 95, daysPresent: 20, daysPunctual: 18 },
  { sn: 11, name: "ANUNOBI CATHERINE", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 55, cummPerformance: 78, daysPresent: 20, daysPunctual: 11 },
  { sn: 12, name: "OZICHI EMELOGU", office: "MD'S OFFICE", attendanceRate: 100, punctualRate: 50, cummPerformance: 75, daysPresent: 20, daysPunctual: 10 },
  { sn: 13, name: "AMINA KABARAINI SALAU", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 90, cummPerformance: 95, daysPresent: 20, daysPunctual: 18 },
  { sn: 14, name: "NANSAH ABASHE ABRAHAM", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 15, name: "JANET ILE IDAKWO", office: "CSIT", attendanceRate: 100, punctualRate: 60, cummPerformance: 80, daysPresent: 20, daysPunctual: 12 },
  { sn: 16, name: "WILLIAMS JOY OKOI", office: "CSIT", attendanceRate: 100, punctualRate: 80, cummPerformance: 90, daysPresent: 20, daysPunctual: 16 },
  { sn: 17, name: "ISAH USMAN SHABA", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 65, cummPerformance: 83, daysPresent: 20, daysPunctual: 13 },
  { sn: 18, name: "JOHN FRIDAY ANZAKU", office: "ADMIN/HR", attendanceRate: 100, punctualRate: 80, cummPerformance: 90, daysPresent: 20, daysPunctual: 16 },
  { sn: 19, name: "ALIYU MAGAJI MUAZU", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 19, daysPunctual: 19 },
  { sn: 20, name: "YUSUF ADAMU", office: "DRIVER", attendanceRate: 100, punctualRate: 40, cummPerformance: 70, daysPresent: 20, daysPunctual: 8 },
  { sn: 21, name: "SUNDAY CHINDO", office: "DRIVER", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 22, name: "BASHIR DAUDA", office: "DRIVER", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 23, name: "HARUNA MAGARI MARO", office: "DRIVER", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 24, name: "ONYINYECHI TENIOLA SAMPSON", office: "ADMIN/HR", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 25, name: "KABIR ABDULLAHI", office: "DRIVER", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 26, name: "AJIO BENEDICT BEMSHIMA (DISPATCH)", office: "DRIVER", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 27, name: "YUSUF ISMAIL", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 28, name: "HAPPINESS IFEOMA NNAMDI O.", office: "MD'S OFFICE", attendanceRate: 100, punctualRate: 40, cummPerformance: 70, daysPresent: 10, daysPunctual: 4 },
  { sn: 29, name: "SALIHU MUHAMMED MUSTAPHA", office: "ADMIN/HR", attendanceRate: 100, punctualRate: 94, cummPerformance: 97, daysPresent: 18, daysPunctual: 17 },
  { sn: 30, name: "JEDIDIAH OJEH", office: "ADMIN/HR", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 31, name: "MBOUTIDEM DANIEL THOMPSON", office: "CSIT", attendanceRate: 100, punctualRate: 85, cummPerformance: 93, daysPresent: 20, daysPunctual: 17 },
  { sn: 32, name: "MUHAMMED FADEEL ISAH", office: "CSIT", attendanceRate: 100, punctualRate: 74, cummPerformance: 87, daysPresent: 19, daysPunctual: 14 },
  { sn: 33, name: "OKEZIE GOD'SWILL KELECHI", office: "CSIT", attendanceRate: 100, punctualRate: 58, cummPerformance: 79, daysPresent: 19, daysPunctual: 11 },
  { sn: 34, name: "HASSAN ALIYU", office: "FAC&GS", attendanceRate: 100, punctualRate: 65, cummPerformance: 83, daysPresent: 20, daysPunctual: 13 },
  { sn: 35, name: "AISHA BAIDI GAJO", office: "REGISTRY", attendanceRate: 100, punctualRate: 95, cummPerformance: 98, daysPresent: 20, daysPunctual: 19 },
  { sn: 36, name: "MUKTAR MUSTAPHA", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 45, cummPerformance: 73, daysPresent: 20, daysPunctual: 9 },
  { sn: 37, name: "JOSEPH KEHINDE AYOOLA", office: "FAC&GS", attendanceRate: 100, punctualRate: 70, cummPerformance: 85, daysPresent: 20, daysPunctual: 14 },
  { sn: 38, name: "SANGOTOYE ABIGAIL", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 67, cummPerformance: 84, daysPresent: 9, daysPunctual: 6 },
  { sn: 39, name: "YUSUF BIN YUSUF", office: "REGISTRY", attendanceRate: 100, punctualRate: 60, cummPerformance: 80, daysPresent: 5, daysPunctual: 3 },
  { sn: 40, name: "BLESSING UZOH", office: "REGISTRY", attendanceRate: 100, punctualRate: 60, cummPerformance: 80, daysPresent: 5, daysPunctual: 3 },
  { sn: 41, name: "SADIQ AHMED", office: "NYSC", attendanceRate: 100, punctualRate: 80, cummPerformance: 90, daysPresent: 20, daysPunctual: 16 },
  { sn: 42, name: "VICTOR OBED", office: "NYSC", attendanceRate: 100, punctualRate: 70, cummPerformance: 85, daysPresent: 20, daysPunctual: 14 },
  { sn: 43, name: "HALIMA RABIU MUHAMMAD", office: "AUDIT", attendanceRate: 100, punctualRate: 90, cummPerformance: 95, daysPresent: 20, daysPunctual: 18 },
  { sn: 44, name: "RAFAIAT OGUNYEMI OPEYEMI", office: "MD'S OFFICE", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 45, name: "AWARD OMOMOH IDAEWOR", office: "FAC&GS", attendanceRate: 100, punctualRate: 65, cummPerformance: 83, daysPresent: 20, daysPunctual: 13 },
  { sn: 46, name: "MICHAEL JOSEPH INALEGWU", office: "AUDIT", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 47, name: "SARAH BROWN TAMUNOTARIBO", office: "CSIT", attendanceRate: 100, punctualRate: 75, cummPerformance: 88, daysPresent: 20, daysPunctual: 15 },
  { sn: 48, name: "MGBII DORATHY CHISOM", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 49, name: "ISSA SULAIMAN", office: "FAC&GS", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 50, name: "AMINA ADAMU", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 51, name: "HASSANA HARUNA", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 90, cummPerformance: 95, daysPresent: 20, daysPunctual: 18 },
  { sn: 52, name: "KABIR USMAN", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 75, cummPerformance: 88, daysPresent: 20, daysPunctual: 15 },
  { sn: 53, name: "AGU PRECIOUS", office: "FAC&GS", attendanceRate: 100, punctualRate: 100, cummPerformance: 100, daysPresent: 20, daysPunctual: 20 },
  { sn: 54, name: "AGETU VERA .I.", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 95, cummPerformance: 98, daysPresent: 20, daysPunctual: 19 },
  { sn: 55, name: "AYINDE FOLASHADE", office: "HR/ADMIN", attendanceRate: 100, punctualRate: 85, cummPerformance: 93, daysPresent: 20, daysPunctual: 17 },
  { sn: 56, name: "SHAFIU ABBAS", office: "ACCOUNTS", attendanceRate: 100, punctualRate: 85, cummPerformance: 93, daysPresent: 20, daysPunctual: 17 }
];

export const getVerticalSpelling = (rowIdx: number, double: boolean = false): string => {
  const word = "PUBLICHOLIDAY";
  const numRepeat = Math.ceil(56 / word.length);
  const repeated = word.repeat(numRepeat);
  const letter = repeated[rowIdx] || "P";
  return double ? `${letter}${letter}` : letter;
};

export const isStaffLateOnDay = (
  sn: number, 
  day: number, 
  daysPunctual: number, 
  daysPresent: number,
  activeWorkdays: number[] = [4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 18, 19, 20, 21, 22, 25, 26, 29]
): boolean => {
  const lateDaysCount = daysPresent - daysPunctual;
  if (lateDaysCount <= 0) return false;
  
  const workIdx = activeWorkdays.indexOf(day);
  if (workIdx === -1) return false;
  
  // Select deterministic indices for late days using prime-weighted modulo dispersion
  const lateIndices: number[] = [];
  for (let i = 0; i < activeWorkdays.length; i++) {
    if (((i * 13) + (sn * 7)) % activeWorkdays.length < lateDaysCount) {
      lateIndices.push(i);
    }
  }
  return lateIndices.includes(workIdx);
};
