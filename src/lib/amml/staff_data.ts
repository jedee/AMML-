import { AmmlStaff } from './types';
import { rawFieldStaff } from './field_staff_data';
import { getDeptTagInfo } from './department_scopes';

export const realStaffRaw: Array<[
  string, // SN
  string, // last (Surname)
  string, // first (Other names)
  string, // stateOfOrigin
  string, // gender
  string, // dob
  string, // role
  string, // qualification
  string, // professionalMembership
  string, // dateOfFirstAppointment
  string, // gradeLevel
  string, // lastPromotionDate
  string, // remarks
  boolean // active
]> = [
  ["1", "ONYA", "OJIJI", "CROSSRIVER", "M", "04-Apr-75", "Ag. MD/CEO", "BL , LL.B ", "NBA, IFMA, ICSAN, CH. INST. OF ARBITRATORS(CIA)", "MAY-2-2006", "PRINCIPAL MANAGER STEP 3", "JAN-1-2024", "", true],
  ["2", "AMAECHINA", "INNOCENT", "ENUGU", "M", "18-May-72", "HEAD OF OPERATIONS", "B.A.PHILOSOPHY, MBA, MSc. MASS COMM.", "NIPR, APCON, IFMA", "FEB,2005", "PRINCIPAL MANAGER STEP 3", "JAN-1-2024", "", true],
  ["3", "BAFFA", "FARUK", "KANO", "M", "22-Aug-75", "HEAD FINANCE & ACCOUNT", "B.sc ACCOUNTING, MBA, PhD (in view)", "F.ICAN, INST. OF STR. MGT (MISMN), A.ICMA, A.NIM, CITN", "FEB-28-2013", "PRINCIPAL MANAGER STEP 3", "JAN-1-2024", "", true],
  ["4", "OKEREKE", "NGOZI", "EBONYI", "F", "22-Nov-75", "MANAGER APO ZONE A,D, E", "B.Sc. GOV.& PUBLIC ADMIN., MPA", "", "JULY-4-2006", "MANAGER STEP 4", "JAN-1-2024", "", true],
  ["5", "OFULUE", "TOLANI", "KOGI", "F", "06-Jun-75", "MANAGER WUSE MARKET", "HND - BUSINESS ADMIN & MGT", "", "MAY-2-2006", "MANAGER STEP 3", "JAN-1-2024", "", true],
  ["6", "EFOSA", "OKOSUN", "EDO", "F", "20-Feb-75", "HEAD, HR & ADMIN", "B.A. LINGUISTICS AND AFRICAN LANGUAGE", "CIPM (in view)", "MAY-2-2006", "MANAGER STEP 3", "JAN-1-2024", "", true],
  ["7", "HARUNA", "SA'ADATU", "EDO", "F", "22-Jun-80", "MANAGER AREA 1,&2", "DIP. BANKING & FIN., BSc & MSc ACCOUNTING", "IFMA, ANAN", "MAY-2-2006", "MANAGER STEP 3", "JAN-1-2024", "", true],
  ["8", "SHELLENG", "MUSA HUSSAINI", "ADAMAWA", "M", "17-Jun-77", "HEAD, Monitoring, SECURITY & ENFORCEMENT", "HND - CATERING & HOTEL MGT., MBA", "A.NIM, IFMA", "MAY-2-2006", "MANAGER STEP 3", "JAN-1-2024", "", true],
  ["9", "OKOH", "PEACE", "NASARAWA", "F", "05-Nov-74", "MANAGER GARKI MODEL MARKET", "HND ESTATE MANAGEMENT, PGD - MGT, MBA", "A.NIESV, IFMA", "MAY-2-2006", "MANAGER STEP 3", "JAN-1-2024", "", true],
  ["10", "OKPEWHO", "MICHEAL", "DELTA", "M", "06-May-77", "HEAD, AUDIT UNIT", "HND ACCOUNTING, BSc./MSc. ENTREPRENEURSHIP (in view)", "F.ICEN", "MAY-2-2006", "MANAGER STEP 3", "JAN-1-2024", "", true],
  ["11", "UDEKWU", "CHIBUZOR", "ANAMBRA", "M", "15-Mar-80", "MANAGER GUDU MARKET", "B.TECH MATHEMATICS/COMPUTER SCI", "", "MAY-2-2006", "MANAGER STEP 3", "JAN-1-2024", "", true],
  ["12", "UGWU", "EKECHUKWU UGWU", "ENUGU", "M", "08-Apr-74", "DEPUTY HEAD OF AUDIT", "BSc & MSc ACCOUNTING", "A.ICAN", "FEB-19-2024", "MANAGER STEP 3", "", "", true],
  ["13", "JAI", "DEBORAH", "BORNO", "F", "05-Apr-80", "MANAGER DEI DEI MARKETS", "B.AGRIC. (AGRIC ECONOMICS & EXT)", "", "MARCH-28-2007", "MANAGER STEP 1", "JAN-1-2026", "", true],
  ["14", "LEGUNSEN", "ADENIKE", "EKITI", "F", "06-Sept-85", "MANAGER ZONE 3 NH/SC", "B.A ENGLISH LITERATURE", "", "DEC-12-2011", "DEPUTY MANAGER STEP 3", "JAN-1-2024", "", true],
  ["15", "ASOGWA", "GLORIA", "ENUGU", "F", "10-Jul-78", "MANAGER GARKI INT'L MARKET", "BSc ECONOMICS", "", "JULY-4-211", "DEPUTY MANAGER STEP 3", "JAN-1-2024", "", true],
  ["16", "DANIEL", "ONOJA OJODOMO", "KOGI", "M", "03-Oct-78", "DEPUTY 1, FINANCE & ACCOUNTS", "B.SC ACCOUNTING, PGDE", "ANAN", "JUNE-3-2024", "DEPUTY MANAGER STEP 3", "", "", true],
  ["17", "YUSUF", "ISMAIL", "KOGI", "M", "06-Jun-78", "DEPUTY 2, FINANCE & ACCOUNTS", "ND/HND/PGD - BUSINESS ADMINISTRATION", "ANAN", "APRIL-13-2025", "DEPUTY MANAGER STEP 2", "", "", true],
  ["18", "SA'AD", "IBRAHIM", "KADUNA", "M", "11-Aug-86", "Ag. CS/LA", "LLB, BL", "NBA", "APRIL-1-2019", "DEPUTY MANAGER STEP 2", "NOV-1-2025", "", true],
  ["19", "OBANLA", "EBUN", "KOGI", "F", "03-May-80", "FACILITY OFFICER, NYANYA SC", "B.ED EDUCATIONAL MGT/POLITICAL SCIENCE", "", "OCT-07-2024", "ASSISTANT MANAGER STEP 4", "OCT-07-2024 (REINSTATED)", "", true],
  ["20", "SALIHU", "MUHAMMED MUSTAPHA", "TARABA", "M", "20-Feb-85", "DEP. HEAD ADMIN & HR", "HND.BUS. ADMIN & MGT.; PGDE, MBA (in view)", "GM.NIM", "FEB-19-2024", "ASSISTANT MANAGER STEP 3", "", "", true],
  ["21", "ALIYU", "HASSAN", "KOGI", "M", "28-Dec-86", "HEAD, FACILITIES & GS", "Bsc & Msc ARCHITECTURE", "", "FEB-19-2024", "ASSISTANT MANAGER STEP 3", "", "", true],
  ["22", "BWALA", "EUNICE MARAVI", "BORNO", "F", "22-Jan-98", "Ag. HEAD, REGISTRY UNIT", "LLB, BL", "", "JUNE-1-2026", "ASSISTANT MANAGER STEP 3", "", "", true],
  ["23", "UKONU", "IKECHUKWU MARVIN", "IMO", "M", "24-Jul-93", "HEAD, CSIT", "B.SC MASS COMMUNICATION", "", "JULY-1-2026", "ASSISTANT MANAGER STEP 3", "", "", true],
  ["24", "TOBINS", "AZIBAODINIYAR", "RIVERS", "M", "25-Oct-93", "HEAD, MONITORING", "B.SC CHEMISTRY, PGD-INTELLIGENCE & SECURITY STUDIES", "", "JULY-1-2026", "ASSISTANT MANAGER STEP 1", "", "", true],
  ["25", "MANGER", "JUSTINE", "BENUE", "M", "18-Aug-77", "FAC. OFFICER, KUGBO MARKET", "HND ESTATE MGT", "NIESV", "DEC-12-2011", "OFFICER STEP 4", "JUL-1-2021", "", true],
  ["26", "PARA-MALLAM", "EPHRAIM", "KADUNA", "M", "06-Dec-84", "FAC. OFFICER, KAURA MARKET", "B.Sc ACCOUNTING, MBA-FINANCE (in view)", "GM.NIM", "JULY-1-2011", "OFFICER STEP 4", "JUL-1-2021", "", true],
  ["27", "BUKAR", "MUSA SHUAIBU", "BORNO", "M", "09-Mar-86", "MANAGER, AREA 7/10 MARKET", "B.Sc SOCIOLOGY", "", "AUG-24-2010", "OFFICER STEP 4", "JUL-1-2021", "", true],
  ["28", "BAWA", "SANDRA", "EDO", "F", "28-Aug-81", "REGISTRY UNIT HEAD OFFICE", "HND SECRETARIAL STUDIES", "", "JULY-24-2014", "OFFICER STEP 4", "JUL-1-2021", "", true],
  ["29", "SULEIMAN", "ISSA", "KWARA", "M", "06-Sept-91", "FACILITY & GS UNIT", "B.TECH ESTATE MANAGEMENT & VALUATION", "", "APRIL-1-2026", "OFFICER STEP 4", "", "", true],
  ["30", "AGU", "CHINECHEREM PRECIOUS", "ABIA", "F", "21-Nov-97", "FACILITY & GS UNIT", "B.ENG CIVIL ENGINEERING", "NSE", "APRIL-1-2026", "OFFICER STEP 4", "", "", true],
  ["31", "AYINDE", "FOLASHADE DEBORAH", "OSUN", "F", "08-Mar-98", "HR & ADMIN UNIT", "LLB, BL", "NBA", "APRIL-1-2026", "OFFICER STEP 4", "", "", true],
  ["32", "ABIMIKU", "SARAH A.", "NASARAWA", "F", "07-Jan-89", "FAC. OFFICER, KUGBO MARKET", "B.TECH ESTATE MANAGEMENT", "NIESV", "OCT-07-2024", "OFFICER STEP 4", "OCT-07-2024 (REINSTATED)", "", true],
  ["33", "IDAEWOR", "AWARD OMOMOH", "EDO", "M", "15-Jan-92", "QUANTITY SURVEYOR", "B.TECH - QUANTITY SURVEYING", "NIQS, QSRBON", "JUL-14-2025", "OFFICER STEP 2", "", "", true],
  ["34", "UZOMA", "UKPABIA MICHAEL", "ABIA", "M", "05-Oct-83", "MANAGER, KARMO MARKET", "B.ENG CIVIL ENGINEERING", "", "JAN-14-2019", "OFFICER STEP 3", "JAN-1-2024", "", true],
  ["35", "OKOI", "JOY WILLIAMS", "CROSS RIVER", "F", "05-May-95", "Ag. HEAD, COROPRATE STRATEGY & INFO. TECH UNIT", "Bsc. BIO CHEM", "", "FEB-19-2024", "OFFICER STEP 3", "", "", true],
  ["36", "DURUJI", "CHIEMERIE EVANGELYN", "IMO", "F", "14-Aug-94", "HR & ADMIN UNIT", "Bsc. INDUST. RLTN & PERSONNEL MGT, PGDE, MSc. HRM (in view)", "", "FEB-19-2024", "OFFICER STEP 3", "", "", true],
  ["37", "RAZAK HASSAN", "MADINA", "ZAMFARA", "F", "30-Apr-77", "MANAGER, KAURA MARKET", "ND. BUS.ADMIN & MGT, HND MARKETING, PGDE, PGD-BUS.ADMIN, MASTERS IN PUB. ADMIN (MPA)", "", "MAY-1-2024", "OFFICER STEP 3", "", "", true],
  ["38", "SAMPSON", "ONYINYECHI TENIOLA", "IMO", "F", "11-Jan-84", "HUMAN RESOURCES/ ADMIN OFFICER", "B.AGRIC.TECH., PGDE, MBA", "DF.CIHRM, M.NIM, CH.HREM, ACIS, IAM, SHRM(in view)", "JULY-1-2021", "OFFICER STEP 2", "NOV-1-2025", "", true],
  ["39", "ISAH", "USMAN SHABA", "NIGER", "M", "15-Sept-82", "ACCOUNTS UNIT HEAD OFFICE", "HND. ACCOUNTING", "", "JAN-1-2024", "OFFICER STEP 2", "NOV-1-2025", "", true],
  ["40", "MAGAJI", "ALIYU MUAZU", "KADUNA", "M", "03-May-79", "ACCOUNTS UNIT HEAD OFFICE", "B.A NIG. & AFRICAN LANGUAGES (HAUSA)", "", "JAN-1-2024", "OFFICER STEP 2", "NOV-1-2025", "", true],
  ["41", "NNAMDI-OSUAGWU", "HAPPINESS IFEOMA", "ABIA", "F", "15-Nov-88", "P.A. TO THE AG. MD/CEO", "B.A ENGLISH LANG. & LITERATURE", "", "FEB-19-2024", "SENIOR SUPERVISOR 3", "", "", true],
  ["42", "OKORO", "CLEMENT ONYEDIKACHI", "ENUGU", "M", "03-Dec-83", "FACILITIES & GS STAFF HEAD OFFICE", "HND- ELECT/ELECTRONICS ENGINEERING", "", "FEB-19-2024", "SENIOR SUPERVISOR 3", "", "", true],
  ["43", "OKOYE", "IFEOMA BLESSING", "ANAMBRA", "F", "23-Apr-95", "ACCOUNTANT, GIM", "HND-MARKETING", "", "JULY-1-2026", "SENIOR SUPERVISOR 2", "", "", true],
  ["44", "MOMOH", "ABUBAKAR JUNIOR", "EDO", "M", "29-Sept-95", "ACCOUNTANT, KADO MKT", "B.SC LIBRARY & INFO. SC", "", "JULY-1-2026", "SENIOR SUPERVISOR 2", "", "", true],
  ["45", "MUSTAPHA", "MUKHTAR", "KADUNA", "M", "03-May-00", "ACCOUNTS UNIT HEAD OFFICE", "B.SC ZOOLOGY", "ICAN (in view)", "JULY-1-2026", "SENIOR SUPERVISOR 2", "", "", true],
  ["46", "SADIQ", "ADAM", "KOGI", "M", "10-Dec-85", "FACILITY (ELECTRICAL) GMM", "HND - ELECT. ELECT. ENGINEERING", "", "JULY-1-2026", "SENIOR SUPERVISOR 1", "", "", true],
  ["47", "MOMOH", "ABDULLAHI ENEYE", "KOGI", "M", "12-Feb-86", "ACCOUNTANT, AREA 3", "B.SC ACCOUNTING", "", "JULY-1-2026", "SENIOR SUPERVISOR 1", "", "", true],
  ["48", "IBRAHIM", "ZUWAIRA ODUS", "NASARAWA", "F", "11-Sept-92", "ACCOUNTANT, KAURA MKT", "ND-ESTATE MGT, B.SC GEOGRAPHY", "", "JULY-1-2026", "SENIOR SUPERVISOR 1", "", "", true],
  ["49", "PHILIP", "PRECIOUS KONI", "KADUNA", "F", "06-Oct-96", "ACCOUNTANT, ZONE 3 S/C", "B.SC ACCOUNTING", "", "JULY-1-2026", "SENIOR SUPERVISOR 1", "", "", true],
  ["50", "OVA", "FAUZIYYAH AHUOIZA", "KOGI", "F", "17-Oct-90", "ACCOUNTANT, GUDU MKT", "B.A HISTORY & INT'L STUDIES; PGD-ENTREPRENEURSHIP", "", "JULY-1-2026", "SENIOR SUPERVISOR 1", "", "", true],
  ["51", "MUHAMMAD", "HALIMA RABIU", "BAUCHI", "F", "07-Apr-95", "AUDIT STAFF HEAD OFFICE", "B.TECH COMPUTER SCIENCE (EDUCATION)", "", "JULY-1-2026", "SENIOR SUPERVISOR 1", "", "", true],
  ["52", "ANUNOBI", "CATHERINE", "IMO", "F", "04-Mar-78", "ACCOUNT STAFF HEAD OFFICE", "HND COMPUTER SCIENCE", "", "JULY-1-2021", "SUPERVISOR 4", "", "", true],
  ["53", "DAODU", "SUSAN", "KOGI", "F", "02-Apr-82", "MANAGER, KADO MARKET", "ND. ACCOUNTING, BSC PUBLIC ADMINISTRATION", "", "JULY-1-2021", "SUPERVISOR 4", "", "", true],
  ["54", "AHMED PATE", "SA'ADATU", "KADUNA", "F", "14-Jan-94", "ACCOUNTS KARMO MARKET", "BSC SOCIOLOGY", "", "JULY-1-2021", "SUPERVISOR 4", "", "", true],
  ["55", "AHMED UMAR", "ABUBAKAR", "GOMBE", "M", "08-Aug-88", "MANAGER MAITAMA FARMERS' MARKET", "BLS LIBRARY & INFO. SCIENCE", "NLA/LRCN", "JULY-1-2021", "SUPERVISOR 4", "", "", true],
  ["56", "IBRAHIM", "JAMES GATTA", "NASARAWA", "M", "05-Apr-89", "AUTOMATION STAFF GARKI MARKET", "BSC GEOLOGY AND MINING", "", "JULY-1-2021", "SUPERVISOR 4", "", "", true],
  ["57", "ILIYASU ALI", "HAUWA", "KANO", "F", "12-Aug-89", "AUDIT STAFF HEAD OFFICE", "HND ACCOUNTING", "AFAN, GM.NIM", "JULY-1-2021", "SUPERVISOR 4", "", "", true],
  ["58", "NADRO", "BALA DANIEL", "ADAMAWA", "M", "23-Nov-80", "FACILITY OFFICER, KARMO MARKET", "BSc ECONOMICS", "A.ICEN", "JULY-1-2021", "SUPERVISOR 4", "", "", true],
  ["59", "DANLAMI", "ADO", "PLATEAU", "M", "01-Oct-66", "AREA 1&2 FACILITY STAFF", "HND BUS. ADMIN & MGT", "", "JULY-1-2021", "SUPERVISOR 4", "", "", true],
  ["60", "EMELOGU", "OZICHI", "IMO", "F", "21-Apr-75", "MD'S SECRETARY", "B.Sc BUS. ADMIN", "", "DEC-1-2022", "SUPERVISOR 4", "", "", true],
  ["61", "MUHAMMAD", "YUSUF BIN YUSUF", "NIGER", "M", "02-Oct-94", "FACILITY OFFICER, WUSE MARKET", "B.AGRIC IN CROP SCIENCE; PGD INFO. TECH", "", "JAN-4-2022", "SUPERVISOR 4", "", "", true],
  ["62", "GALADIMA", "RUTH A.", "NASSARAWA", "F", "23-Sept-93", "ADMIN STAFF GARKI INT'L MARKET", "BSc. MASS COMMUNICATION", "", "JAN-1-2024", "SUPERVISOR STEP 3", "", "", true],
  ["63", "MUHAMMAD", "HAUWA KAKA", "NIGER", "F", "15-Aug-92", "ACCOUNTS GARKI MODEL MARKET", "HND ESTATE MANAGEMENT", "NIESV", "JAN-1-2024", "SUPERVISOR STEP 3", "", "", true],
  ["64", "OKPA", "OJIJI ENAGU", "CROSSRIVER", "M", "23-Sept-82", "GARKI INT'L MARKET ACCOUNT UNIT", "B.A. EDUCATION", "", "JAN-1-2024", "SUPERVISOR STEP 3", "", "", true],
  ["65", "AMINA", "KABARAINI S. A.", "NIGER", "F", "14-Apr-82", "FINANCE & ACCOUNT STAFF H/O", "BSC. PUBLIC ADMINISTRATION", "", "JAN-1-2024", "SUPERVISOR STEP 3", "", "", true],
  ["66", "NANSAH", "ABASHE A.", "PLATEAU", "M", "04-Jul-85", "FINANCE & ACCOUNT STAFF H/O", "BSC. ECONOMICS", "", "JAN-1-2024", "SUPERVISOR STEP 3", "", "", true],
  ["67", "AHMED ALIYU", "MUHAMMED", "NASSARAWA", "M", "01-Jan-94", "CORPORATE AFFAIRS WUSE MARKET", "BSC MASS COMM., MSc. INT'L RELATIONS & DIPLOMACY", "", "JAN-1-2024", "SUPERVISOR STEP 3", "", "", true],
  ["68", "IDAKWO", "JANET ILE", "KOGI", "F", "10-Oct-91", "CORPORATE AFFAIRS H/O", "BSC MASS COMMUNICATION", "", "JAN-1-2024", "SUPERVISOR STEP 3", "", "", true],
  ["69", "MGBII", "DORATHY CHISOM", "ANAMBRA", "F", "27-Jul-01", "FINANCE & ACCOUNT STAFF H/O", "BSC POLITICAL SCIENCE", "", "JAN-1-2024", "SUPERVISOR STEP 3", "", "", true],
  ["70", "DAVIDSON", "EBERECHUKWU DEBORAH", "ENUGU", "F", "25-May-00", "AREA 1 & 2 ACCOUNT STAFF ", "B.A INT'L STUDIES & DIPLOMACY", "", "JAN-1-2024", "SUPERVISOR STEP 3", "", "", true],
  ["71", "ADAMU", "AMINA", "KOGI", "F", "28-May-85", "ADMIN UNIT GUDU MARKET", "BSC. SOCIOLOGY", "", "JAN-1-2024", "SUPERVISOR STEP 3", "", "", true],
  ["72", "UMAR", "ISMAILA", "KOGI", "M", "14-May-91", "ACCOUNTS UNIT DEI-DEI MARKET", "Bsc. ACCOUNTING", "", "FEB-19-2024", "SUPERVISOR STEP 3", "", "", true],
  ["73", "ABBAS", "SHAFI'U", "KADUNA", "M", "02-Apr-87", "ACCOUNTS UNIT HEAD OFFICE", "Bsc. ACCOUNTING", "A.CIFCON", "FEB-19-2024", "SUPERVISOR STEP 3", "", "", true],
  ["74", "OJEH", "JEDIDIAH", "DELTA", "M", "05-Oct-99", "HEAD OFFICE ADMIN/HR UNIT", "Bsc. COMPUTER SCIENCE", "", "FEB-19-2024", "SUPERVISOR STEP 3", "", "", true],
  ["75", "ABBA", "ADAMU MUSTAPHA", "KOGI", "M", "07-Mar-96", "ACCOUNTS UNIT WUSE MARKET", "Bsc. ACCOUNTING", "", "FEB-19-2024", "SUPERVISOR STEP 3", "", "", true],
  ["76", "THOMPSON", "MBOUTIDEM DANIEL", "AKWA IBOM", "F", "07-Jan-98", "BUS.DEVELOPMENT UNIT STAFF", "Bsc. GEOGRAPHY & NAT. RES. MGT", "", "FEB-19-2024", "SUPERVISOR STEP 3", "", "", true],
  ["77", "NWOBODO", "ONYINYECHI", "ENUGU", "F", "10-Aug-89", "ACCOUNTS UNIT WUSE MARKET", "BSc. MASS COMMUNICATION, PGDE", "", "FEB-19-2024", "SUPERVISOR STEP 3", "", "", true],
  ["78", "BAIDI", "AISHA GAJO", "JIGAWA", "F", "10-Oct-95", "REGISTRY UNIT HEAD OFFICE", "B.ED ECONOMICS", "", "MAR-18-2024", "SUPERVISOR STEP 3", "", "", true],
  ["79", "SANGOTOYE", "ABIGAIL ADEWUMMI", "KWARA", "F", "06-May-00", "ACCOUNTS UNIT HEAD OFFICE", "BSc. ACCOUNTING", "", "APR-1-2025", "SUPERVISOR STEP 3", "", "", true],
  ["80", "OKEZIE", "KELECHI GODSWILL", "IMO", "M", "21-Jun-99", "CSIT UNIT", "B.ED INDUSTRIAL TECH. EDU", "", "NOV-1-2025", "SUPERVISOR STEP 2", "", "", true],
  ["81", "MUHAMMED", "FADEEL ISAH", "KOGI", "M", "23-May-94", "CSIT/ MS&E UNIT", "HND MICROBIOLOGY", "", "NOV-1-2025", "SUPERVISOR STEP 2", "", "", true],
  ["82", "AYOOLA", "JOSEPH KEHINDE", "KWARA", "M", "30-Oct-96", "FAC & GS UNIT", "BSC. URBAN & REGIONAL PLANNING", "", "MAR-16-2026", "SUPERVISOR STEP 1", "", "", true],
  ["83", "ANZAKU", "JOHN", "NASARAWA", "M", "17-Jun-76", "ADMIN UNIT HEAD OFFICE", "HND.BUSINESS ADMIN & MGT", "", "JAN-1-2024", "JUNIOR SUPERVISOR STEP 3", "", "", true],
  ["84", "ADAMU", "YUSUF", "KADUNA", "M", "30-Jan-70", "CHIEF DRIVER", "SSCE", "", "JAN-1-2024", "JUNIOR SUPERVISOR STEP 3", "", "", true],
  ["85", "ENEH", "CHUKWUDI", "ENUGU", "M", "25-Sept-84", "IT UNIT", "SSCE", "", "JAN-1-2024", "JUNIOR SUPERVISOR STEP 3", "", "", true],
  ["86", "OKON", "EYO AKANINYENE", "AKWA IBOM", "M", "26-Dec-83", "ACCOUNTS WUSE MARKET", "BSC. ACCOUNTING", "", "NOV-1-2025", "JUNIOR SUPERVISOR STEP 2", "", "", true],
  ["87", "MUHAMMED", "ABDULRAZAQ OMEIZA", "KOGI", "M", "28-Oct-84", "M,S & E WUSE MARKET", "BSC. ACCOUNTING", "", "NOV-1-2025", "JUNIOR SUPERVISOR STEP 2", "", "", true],
  ["88", "CHINDO", "SUNDAY", "NASARAWA", "M", "10-Jun-78", "DRIVER", "", "", "NOV-1-2025", "JUNIOR SUPERVISOR STEP 2", "", "", true],
  ["89", "ENIM", "MAUREEN MINKA", "", "F", "", "FACILITY OFFICER, ZONE 3", "B.SC (NYSC UPGRADE)", "", "JULY-1-2026", "OFFICER STEP 1", "", "NYSC UPGRADE JULY 2026", true],
  ["90-res", "MOHAMMED", "SANI", "", "M", "", "TASKFORCE DEI-DEI MARKET", "", "", "JAN-1-2024", "SUPERVISOR", "RESIGNED JUNE 30, 2026", "RESIGNED JUNE 30, 2026", false],
  ["91-res", "ADAMU", "ABUBAKAR", "", "M", "", "TOLL COLLECTOR DEI-DEI MARKET", "", "", "JAN-1-2024", "SUPERVISOR", "RESIGNED JUNE 30, 2026", "RESIGNED JUNE 30, 2026", false],
  ["92-res", "USMAN", "SENUSI", "", "M", "", "CLEANER DEI-DEI MARKET", "", "", "JAN-1-2024", "SUPERVISOR", "RESIGNED JUNE 30, 2026", "RESIGNED JUNE 30, 2026", false],
  ["41-res", "OHIEMI", "VICTOR UGBEDEOJO", "KOGI", "M", "04-Aug-00", "Ag. HEAD, REGISTRY", "LLB", "", "NOV-1-2025", "SENIOR SUPERVISOR 1", "RESIGNED JAN 22, 2026", "RESIGNED JAN 22, 2026", false],
  ["45-res", "MGBII", "JULIET", "ANAMBRA", "F", "28-Jul-94", "MANAGER, AREA 3 S/C ", "BSC BUSINESS ADMINISTRATION", "GM.NIM", "JULY-1-2021", "SUPERVISOR 4", "RESIGNED MARCH 25. 2026", "RESIGNED MARCH 25. 2026", false],
  ["66-res", "SHUAIBU", "AHMAD RAHMATU", "FCT", "F", "27-Jul-89", "ADMIN UNIT HEAD OFFICE", "Bsc. POLITICAL  SCIENCE, MSC. POLICY ANALYSIS", "", "FEB-19-2024", "SUPERVISOR STEP 2", "RESIGNED MARCH 2, 2026", "RESIGNED MARCH 2, 2026", false]
];

export const contractStaffRaw: Array<[
  string, // SN
  string, // Full Name (First and Last name combined or split)
  string, // DOB
  string, // Gender
  string, // State of Origin
  string, // Qualification
  string, // Status/Role
  string, // Location code
  string, // Date of Employment
  string, // Date of Renewal
  string, // Remark
  boolean // Active
]> = [
  ["C1", "IBRAHIM ZUBAIRU ENESI", "25-Aug-59", "M", "KOGI", "HND. EEE", "ENGINEER/MANAGER", "WUSE", "09-Sept-19", "", "", true],
  ["C2", "ROSE THOMAS ZAMANI", "29-Oct-65", "F", "PLATEAU", "BSC. COOPERATIVE MGT", "MARKET MANAGER", "KUGBO", "01-Jan-26", "", "", true],
  ["C3", "JAMES MUSA", "24-May-91", "M", "BORNO", "LLB", "SECURITY CONSULTANT", "HEAD OFFICE", "01-Jul-26", "", "", true],
  ["C4", "ALIYU MARYAM", "08-Jul-89", "F", "KADUNA", "BSC. MASS COMMUNICATION (in view)", "ACCOUNT", "GIM", "28-Nov-23", "01-Jan-26", "", true],
  ["C5", "ASUE VICTOR", "13-Feb-85", "M", "BENUE", "BSC. ENTREPRENEURSHIP (in view)", "ACCOUNT", "DEI-DEI MARKET", "01-Jan-24", "", "", true],
  ["C6", "ACHENEJE JOHN FRIDAY", "03-Mar-89", "M", "KOGI", "BSC. PUBLIC ADMINISTRATION", "ADMIN", "ZONE 3", "01-Mar-24", "01-Jan-26", "", true],
  ["C7", "HASSANA HARUNA", "15-Nov-96", "F", "KOGI", "HND. SCI.LAB.TECH.(BIOCHEM)", "ADMIN/ACCOUNTS", "WUSE MARKET", "22-Jul-24", "", "", true],
  ["C8", "NNAEGBO HELEN CHIZOBA", "13-Oct-88", "F", "ANAMBRA", "BSC. GEOLOGY", "ADMIN/ACCOUNTS", "KUGBO MARKET", "01-Mar-24", "01-Jan-26", "", true],
  ["C9", "JA'AFARU IDRIS", "19-Sept-92", "M", "NASSARAWA", "HND. QUANTITY SURVEYING", "FACILITY STAFF", "GARKI MM", "15-Feb-21", "", "", true],
  ["C10", "UZAIBAT MUSA IBRAHIM", "20-May-74", "M", "NASSARAWA", "OND. CRIME MANAGEMENT", "FACILITY STAFF", "GARKI MM", "15-Feb-21", "", "", true],
  ["C11", "DAUDA HUZAIFA", "02-Aug-97", "M", "BAUCHI", "HND. ESTATE MGT", "FACILITIES STAFF", "KARMO MARKET", "20-Dec-23", "01-Jan-26", "", true],
  ["C12", "DAMEN LILIAN NIPALANG", "23-Nov-83", "F", "PLATEAU", "BA. FRENCH", "ACCOUNT", "GARKI MM", "18-Sept-23", "01-Jan-26", "", true],
  ["C13", "CHARITY ISAAC", "27-Nov-96", "F", "KADUNA", "SSCE", "FRONT DESK", "GIM", "01-Dec-21", "01-Jan-26", "", true],
  ["C14", "HARUNA NURUDEEN", "03-Mar-93", "M", "NIGER", "HND. PUBLIC ADMINISTRATION", "ASST TOLL SUP.", "GARKI MM", "01-Dec-21", "", "", true],
  ["C15", "POLYCARP GOKUM", "27-Sept-86", "M", "PLATEAU", "", "ADMIN", "NYANYA", "15-Aug-11", "", "", true],
  ["C16", "AUGUSTINE EMMANUEL FRANCIS", "30-Jun-73", "M", "PLATEAU", "OND. LAND ADMINISTRATION", "FACILITY STAFF", "AREA 1 & 2", "May-06", "01-Jan-26", "", true],
  ["C17", "EMMANUEL SUNDAY", "04-Oct-89", "M", "KOGI", "HND. CHEMICAL ENGINEERING", "FACILITY STAFF", "KADO", "15-May-23", "", "", true],
  ["C18", "ISAH SAMUEL UKWUMONU", "08-Aug-94", "M", "KOGI", "HND. SURV. & GEO-INFORMATICS", "FACILITY STAFF", "DEIDEI MARKET", "13-May-24", "", "", true],
  ["C19", "CELESTINA ANOKHUAGBOR SIRAIJA", "14-Jul-97", "F", "EDO", "HND. COMPUTER SCIENCE", "ADMIN", "NEW AREA 10", "02-Jun-25", "", "", true],
  ["C20", "FALILA ABDULLAHI MAISARKI", "24-Apr-93", "F", "KANO", "BSC. LIB & INFO SCI/ POL. SCI", "ACCOUNTS UNIT", "WUSE MARKET", "02-Jun-25", "", "", true],
  ["C21", "ZAINAB ADAMU SAFIYANU", "12-Nov-94", "F", "NASSARAWA", "BSC. PSYCHOLOGY", "ACCOUNTS UNIT", "GARKI MM", "01-Jul-25", "", "", true],
  ["C22", "MOSES BENSON OKOROGBUDJE", "21-Sept-88", "M", "DELTA", "", "FACILITY UNIT", "DEIDEI MARKET", "01-Aug-25", "", "", true],
  ["C23", "MICHEAL JOSEPH INALEGWE", "19-Mar-84", "M", "BENUE", "HND - STATISTICS", "AUDIT UNIT", "HEAD OFFICE", "29-Jul-24", "", "", true],
  ["C24", "EZE CHUKWUDI BANABAS", "23-Feb-86", "M", "ENUGU", "MECH. & PROD. ENGINEERING", "FACILITY UNIT", "KAURA MARKET", "10-Nov-25", "", "", true],
  ["C25", "RAFIAT OPEYEMI OGUNYEMI", "25-Aug-96", "F", "OGUN", "", "MD'S OFFICE", "HEAD OFFICE", "17-Nov-25", "", "", true],
  ["C26", "KHADIJAT YAKUBU", "12-May-02", "F", "KOGI", "OND - ESTATE MGT & VALUATION", "ACCOUNTS UNIT", "DEIDEI MARKET", "01-Apr-26", "", "", true],
  ["C27", "BLESSING EBERE UZOH", "27-Apr-01", "F", "ANAMBRA", "BSC. SOCIOLOGY", "REGISTRY UNIT", "HEAD OFFICE", "01-May-26", "", "", true],
  ["C28", "BATHOLOMEOW EZEKIEL", "04-Apr-83", "M", "KADUNA", "NCE", "ELECTRICIAN", "WUSE", "01-Jul-26", "01-Jan-26", "", true],
  ["C29", "AKINOLA SUNDAY EMMANUEL", "20-Mar-82", "M", "LAGOS", "BSc. CRIMINOLOGY & SECURITY STUDIES (in view)", "GENERATOR TECHNICIAN", "GIM", "01-Dec-21", "01-Jan-26", "", true],
  ["C30", "SUNDAY HENRY OJO", "15-Jan-86", "M", "KOGI", "HND-BUSINESS ADMIN", "ACCOUNTANT", "UTAKO FM", "01-Jul-26", "01-Jan-26", "", true],
  ["C31", "JAMO SALIM ABUBAKAR", "01-Jun-93", "M", "KADUNA", "B.ENG- CIVIL ENG.", "FACILITY UNIT", "ZONE 3", "01-Jul-26", "", "", true],
  ["C32", "DIMESORO U HENRY", "04-Dec-94", "M", "ANAMBRA", "OND-PUBLIC ADMIN", "ACCOUNTS UNIT", "WUSE", "01-Jul-26", "", "", true],
  ["C33", "ABDUL SULE", "11-Jan-84", "M", "KADUNA", "BSc. CRIMINOLOGY & SECURITY STUDIES", "M, S & E", "GARKI MODEL MARKET", "01-Jul-26", "", "", true],
  ["C34", "SAMUEL IDOKO ISAH", "05-Nov-84", "M", "KOGI", "HND-COMPUTER ENG.TECH.", "ACCOUNTANT", "APO A, D & E", "01-Jul-26", "", "", true],
  ["C35", "ONAJI JOHN", "25-Oct-88", "M", "BENUE", "BSc. BUSINESS MGT", "FACILITY OFFICER", "GUDU", "01-Jul-26", "", "", true],
  ["C36", "SAIFULLAH KABIR", "", "M", "", "", "CONTRACT STAFF", "WUSE MARKET", "01-Jan-26", "", "RESIGNED JULY 2, 2026", false]
];

function getDept(role: string): string {
  const r = role.toLowerCase();
  if (r.includes("md") || r.includes("ceo") || r.includes("executive")) return "Executive";
  if (r.includes("audit")) return "Audit Unit";
  if (r.includes("csit") || r.includes("cs & it") || r.includes("it unit") || r.includes("automation") || r.includes("info. tech") || r.includes("corporate strategy")) return "CS & IT";
  if (r.includes("hr") || r.includes("admin") || r.includes("p.a. to") || r.includes("registry") || r.includes("corporate affairs") || r.includes("human resources") || r.includes("md's office") || r.includes("front desk")) return "HR & Admin";
  if (r.includes("account") || r.includes("finance") || r.includes("cashier") || r.includes("accounting") || r.includes("toll") || r.includes("collector")) return "Finance & Accounts";
  if (r.includes("sec") || r.includes("enforce") || r.includes("monitoring") || r.includes("security") || r.includes("taskforce") || r.includes("clamp") || r.includes("m,s") || r.includes("ms&e") || r.includes("criminology")) return "Security";
  if (r.includes("clean") || r.includes("wash") || r.includes("waste")) return "Cleaning";
  if (r.includes("facility") || r.includes("facilities & gs") || r.includes("fac & gs") || r.includes("quantity surveyor") || r.includes("engineer") || r.includes("electrician") || r.includes("generator") || r.includes("technician") || r.includes("carpenter") || r.includes("plumber")) return "Facilities & GS";
  if (r.includes("operation") || r.includes("manager") || r.includes("scanning") || r.includes("operator")) return "Market Operations";
  return "Market Operations";
}

function getMarket(roleOrLoc: string): string {
  const r = roleOrLoc.toUpperCase();
  if (r.includes("GUDU")) return "Gudu Market";
  if (r.includes("WUSE")) return "Wuse Market";
  if (r.includes("KADO")) return "Kado Market";
  if (r.includes("KARMO")) return "Karimo Market";
  if (r.includes("KUGBO")) return "Kugbo International Market";
  if (r.includes("AREA 7/10") || r.includes("AREA 7") || r.includes("AREA 10")) return "Area 7/10 Market";
  if (r.includes("GARKI INT") || r.includes("GIM")) return "Garki International Market";
  if (r.includes("GARKI MODEL") || r.includes("GARKI MM")) return "Garki Model Market";
  if (r.includes("ZONE 3")) return "Zone 3 Market";
  if (r.includes("APO")) return "Apo Zone A, D & E Shopping Complex";
  if (r.includes("AREA 1")) return "Area 1 Market";
  if (r.includes("NYANYA")) return "Nyanya Market";
  if (r.includes("AREA 2")) return "Area 2 Market";
  if (r.includes("AREA 3")) return "Area 3 Neighbourhood Centre";
  if (r.includes("KAURA")) return "Kaura Market";
  if (r.includes("DEI DEI") || r.includes("DEIDEI")) return "Dei Dei Market";
  if (r.includes("UTAKO")) return "Utako Farmers Market";
  if (r.includes("FARMERS") || r.includes("MAITAMA")) return "Farmers Market";
  return "Head Office";
}

function getAuthLevel(grade: string): 'SUPERADMIN' | 'MD' | 'MANAGER' | 'SUPERVISOR' | 'OFFICER' {
  const g = grade.toUpperCase();
  if (g.includes("MD") || g.includes("CEO")) return "MD";
  if (g.includes("PRINCIPAL") || g.includes("HEAD")) return "MANAGER";
  if (g.includes("MANAGER") || g.includes("SUPERVISOR")) return "SUPERVISOR";
  return "OFFICER";
}

function getInferredSalary(gradeOrRole: string): number {
  const g = gradeOrRole.toUpperCase();
  if (g.includes("MD") || g.includes("CEO")) return 380000;
  if (g.includes("PRINCIPAL")) return 320000;
  if (g.includes("DEPUTY MANAGER")) return 260000;
  if (g.includes("ASSISTANT MANAGER")) return 210000;
  if (g.includes("OFFICER")) return 140000;
  if (g.includes("SENIOR SUPERVISOR")) return 110000;
  if (g.includes("SUPERVISOR")) return 90000;
  
  // Contract specific or fallbacks
  if (g.includes("CONSULTANT") || g.includes("ENGINEER") || g.includes("SPECIALIST")) return 150000;
  if (g.includes("ACCOUNT") || g.includes("ADMIN") || g.includes("FACILITY")) return 100000;
  return 70000;
}

// Map permanent staff
const mappedPermanent: AmmlStaff[] = realStaffRaw.map(r => {
  const [sn, last, first, stateOfOrigin, gender, dob, role, qualification, professionalMembership, dateOfFirstAppointment, gradeLevel, lastPromotionDate, remarks, active] = r;
  
  const id = sn.endsWith("-res") ? `AMML-${sn.split("-")[0]}` : `AMML-${sn.padStart(3, '0')}`;
  let salary = getInferredSalary(gradeLevel);
  if (id === "AMML-089") { // Enim Maureen Minka
    salary = 120000;
  }

  return {
    id,
    first: first.trim(),
    last: last.trim(),
    dept: getDept(role),
    market: getMarket(role),
    phone: `080312${sn.split("-")[0].padStart(5, '0')}`,
    role,
    salary,
    active,
    authLevel: getAuthLevel(gradeLevel),
    stateOfOrigin: stateOfOrigin || undefined,
    gender: gender || undefined,
    dob: dob || undefined,
    qualification: qualification.trim() || undefined,
    professionalMembership: professionalMembership.trim() || undefined,
    dateOfFirstAppointment: dateOfFirstAppointment || undefined,
    gradeLevel: gradeLevel || undefined,
    lastPromotionDate: lastPromotionDate || undefined,
    remarks: remarks || undefined,
    isContract: false
  };
});

// Map contract staff
const mappedContract: AmmlStaff[] = contractStaffRaw.map(c => {
  const [sn, fullName, dob, gender, stateOfOrigin, qualification, role, location, dateOfEmployment, dateOfRenewal, remark, active] = c;
  
  // Split fullname to last and first
  const words = fullName.trim().split(' ');
  const last = words[0] || 'CONTRACT';
  const first = words.slice(1).join(' ') || 'STAFF';

  const id = `AMML-${sn}`;
  let salary = getInferredSalary(role);
  if (id === "AMML-C28") salary = 120000; // Batholomeow Ezekiel
  if (id === "AMML-C30") salary = 120000; // Sunday Henry Ojo
  if (id === "AMML-C32") salary = 100000; // Henry Ugonna Dimesoro
  if (id === "AMML-C33") salary = 100000; // Abdul Sule
  if (id === "AMML-C34") salary = 100000; // Samuel Idoko Isah
  if (id === "AMML-C35") salary = 100000; // John Onaji

  return {
    id,
    first,
    last,
    dept: getDept(role),
    market: getMarket(location),
    phone: `070911${sn.replace('C', '').padStart(5, '0')}`,
    role: `Contract ${role}`,
    salary,
    active,
    authLevel: 'OFFICER',
    stateOfOrigin: stateOfOrigin || undefined,
    gender: gender || undefined,
    dob: dob || undefined,
    qualification: qualification.trim() || undefined,
    professionalMembership: undefined,
    dateOfFirstAppointment: dateOfEmployment || undefined,
    gradeLevel: `Contract Staff (${sn})`,
    lastPromotionDate: dateOfRenewal || undefined,
    remarks: remark || `Contract Staff Stationed at ${location}`,
    isContract: true
  };
});

// Map field/casual staff from our raw roster
const mappedField: AmmlStaff[] = rawFieldStaff.map(item => {
  const [cat, sn, fullName, dob, gender, stateOfOrigin, qualification, location, role, doe, renewal, remark] = item;

  // Split name
  const words = fullName.trim().split(' ');
  const last = words[0] || 'FIELD';
  const first = words.slice(1).join(' ') || 'STAFF';

  // ID Scheme: e.g. AMML-TC001, AMML-TF001
  const id = `AMML-${cat}${sn.padStart(3, '0')}`;

  // Inferred salary for casual/field staff
  let salary = 65000;
  const r = role.toLowerCase();
  if (r.includes("supervisor")) salary = 85000;
  else if (r.includes("cleaner")) salary = 50000;
  else if (r.includes("electrician") || r.includes("carpenter") || r.includes("plumber") || r.includes("operator")) salary = 75000;
  else if (r.includes("assistant") || r.includes("front desk")) salary = 60000;
  else if (r.includes("clamper")) salary = 60000;

  // Inferred authLevel
  let authLevel: AmmlStaff['authLevel'] = 'OFFICER';
  if (r.includes("supervisor")) authLevel = 'SUPERVISOR';

  return {
    id,
    first,
    last,
    dept: getDept(role),
    market: getMarket(location),
    phone: `090511${cat}${sn.padStart(3, '0')}`.slice(0, 11),
    role: `${cat === 'WT' ? 'Wumata ' : ''}${role}`,
    salary,
    active: true,
    authLevel,
    stateOfOrigin: stateOfOrigin || undefined,
    gender: gender || undefined,
    dob: dob || undefined,
    qualification: qualification.trim() || undefined,
    professionalMembership: undefined,
    dateOfFirstAppointment: doe || undefined,
    gradeLevel: `${cat === 'WT' ? 'Wumata ' : ''}${role} (${cat}-${sn})`,
    lastPromotionDate: renewal || undefined,
    remarks: remark || `Field Staff Stationed at ${location}`,
    isContract: true
  };
});

// Ex-Staff Record for Sarah T. Brown / Sarah Brown Tamunotaribo
export const sarahBrownExStaff: AmmlStaff = {
  id: 'AMML-EX047',
  first: 'SARAH BROWN',
  last: 'TAMUNOTARIBO',
  dept: 'CS & IT',
  market: 'Head Office',
  phone: '08031200047',
  role: 'EX-STAFF (CSIT OFFICER)',
  salary: 0,
  active: false,
  authLevel: 'OFFICER',
  stateOfOrigin: 'RIVERS',
  gender: 'F',
  dob: '14-May-92',
  qualification: 'B.SC COMPUTER SCIENCE',
  dateOfFirstAppointment: 'JAN-1-2024',
  gradeLevel: 'OFFICER (RESIGNED)',
  remarks: 'EX-STAFF (RESIGNED): No longer with AMML. Excluded from active HR workflows.',
  isContract: false,
  deptCode: 'DEPT-CSIT',
  supervisorId: 'AMML-023',
  supervisorName: 'IKECHUKWU MARVIN UKONU',
  reportingScope: 'Corporate Strategy & IT Systems Scope'
};

// Combine all categories and apply automated department & supervisor scope tags
const rawCombined: AmmlStaff[] = [...mappedPermanent, ...mappedContract, ...mappedField, sarahBrownExStaff];

export const seedStaff: AmmlStaff[] = rawCombined.map(st => {
  const tag = getDeptTagInfo(st.dept, st.id, st.role);
  return {
    ...st,
    deptCode: st.deptCode || tag.deptCode,
    supervisorId: st.supervisorId || tag.supervisorId,
    supervisorName: st.supervisorName || tag.supervisorName,
    reportingScope: st.reportingScope || tag.reportingScope
  };
});

