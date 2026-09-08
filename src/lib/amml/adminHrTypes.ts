// Structured interfaces and shared types for Admin Infrastructure Telemetry and HR Personnel Records

// ==========================================
// 1. ADMIN INFRASTRUCTURE TELEMETRY TYPES
// ==========================================

export type NodeStatusType = 'HEALTHY' | 'SYNCING' | 'DEGRADED' | 'OFFLINE';
export type DiagnosticLevelType = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'CRITICAL';
export type DatabaseStatusType = 'OPTIMAL' | 'DEGRADED' | 'MAINTENANCE';

export interface SystemClusterMetrics {
  cpuUtilizationPct: number;
  cpuCores: number;
  memoryTotalGB: number;
  memoryUsedGB: number;
  memoryUsagePct: number;
  netIngressReqPerSec: number;
  netEgressReqPerSec: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  activeDbConnections: number;
  maxDbConnections: number;
  dbCacheHitRatioPct: number;
  ledgerUptimeSeconds: number;
  ledgerUptimePct: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface OutpostNode {
  id: string;
  name: string;
  zone: 'HQ' | 'GARKI' | 'WUSE' | 'KAURA' | 'UTAKO' | 'NYANYA' | string;
  ip: string;
  cpuPct: number;
  ramPct: number;
  pingLatencyMs: number;
  activeRequests: number;
  status: NodeStatusType;
  lastSync: string;
}

export interface DatabaseTelemetry {
  connectionPoolActive: number;
  connectionPoolMax: number;
  cacheHitRatioPct: number;
  readLatencyMs: number;
  writeLatencyMs: number;
  replicationLagMs: number;
  storageUsedGB: number;
  storageMaxGB: number;
  status: DatabaseStatusType;
}

export interface DiagnosticLogItem {
  id: string;
  timestamp: string;
  service: 'API-GATEWAY' | 'DB-CLUSTER' | 'CACHE-REDIS' | 'SECURITY-SEC' | 'NODE-BRIDGE' | string;
  level: DiagnosticLevelType;
  message: string;
  originNode?: string;
}

export interface InfrastructureTrafficPoint {
  time: string;
  ingress: number;
  egress: number;
  errors: number;
}

export interface InfrastructureTelemetrySnapshot {
  timestamp: string;
  cluster: SystemClusterMetrics;
  nodes: OutpostNode[];
  db: DatabaseTelemetry;
  logs: DiagnosticLogItem[];
  trafficData: InfrastructureTrafficPoint[];
  isLiveStreaming: boolean;
}

// ==========================================
// 2. HR PERSONNEL RECORDS TYPES
// ==========================================

export type EmploymentType = 'PERMANENT' | 'CONTRACT' | 'OUTSOURCED' | 'NYSC';
export type PersonnelStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'DISENGAGED';
export type ComplianceStatus = 'COMPLIANT' | 'FLAGGED' | 'UNDER_REVIEW';

export interface HRPersonnelMetrics {
  totalActiveStaff: number;
  onLeaveCount: number;
  disengagedCount: number;
  attendanceRatePct: number;
  punctualityIndexPct: number;
  monthlyPayrollOutlayNaira: string;
  governanceScorePct: number;
  departmentBreakdown: Record<string, number>;
}

export interface PersonnelRosterRecord {
  id: string; // e.g. 'AMML-102'
  fullName: string;
  department: 'CSIT' | 'OPERATIONS' | 'F&A' | 'AUDIT' | 'FIELD' | string;
  roleTitle: string;
  gradeStep: string; // e.g. 'GL-12 / Step 4'
  employmentType: EmploymentType;
  status: PersonnelStatus;
  punctualityPct: number;
  lastClockIn: string;
  marketSite: string;
  supervisorName?: string;
  dateOfAppointment?: string;
}

export interface ExStaffGovernanceRecord {
  fileRefId: string; // e.g. 'FILE-047'
  staffId: string; // e.g. 'AMML-EX047'
  fullName: string;
  disengagementDate: string;
  disengagementReason: string;
  complianceStatus: ComplianceStatus;
  systemAccessRevoked: boolean;
  payrollDiscontinued: boolean;
  leaveSystemBarred: boolean;
  remarks: string;
}

export interface DepartmentAttendanceTrendItem {
  week: string;
  present: number;
  punctual: number;
  absent: number;
}

export interface DepartmentDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface HRPersonnelSnapshot {
  timestamp: string;
  metrics: HRPersonnelMetrics;
  roster: PersonnelRosterRecord[];
  exStaffGovernance: ExStaffGovernanceRecord[];
  attendanceTrends: DepartmentAttendanceTrendItem[];
  departmentDistribution: DepartmentDistributionItem[];
}

// ==========================================
// 3. HR & ADMIN MEMO FILING & SORTING TYPES
// ==========================================

export type MemoClassificationCode = 
  | 'HR/PER/LEAVE'       // Staff Annual/Exam/Medical Leave & Relieving Applications
  | 'HR/PER/QUERY'       // HR Queries, Explanations & Disciplinary Actions
  | 'HR/PER/APPRAISAL'   // Staff Performance Appraisals, Nominations & Recommendations
  | 'HR/PER/RESIGN'      // Resignations, Disengagements & Exit Clearances
  | 'ADM/MEM/CIRCULAR'   // General Staff Circulars, Executive Directives & Policy Notices
  | 'ADM/MEM/DEPLOY'     // Staff Deployments, Re-assignments & Market Transfers
  | 'ADM/MEM/FINANCE'    // Financial Approvals, Impress & Wage Authorization Memos
  | 'ADM/MEM/PROCURE';   // Procurement Requisitions, Facilities & Asset Maintenance

export type IncomingMemoSortOption = 
  | 'RECEIVED_DATE_DESC'  // Newest First (Default incoming order)
  | 'RECEIVED_DATE_ASC'   // Oldest First
  | 'PRIORITY_DESC'       // Urgent / Action First
  | 'FILING_CODE_ASC'     // By Filing Code (HR/PER/LEAVE, etc.)
  | 'APPROVAL_STATUS'     // Pending Approval First
  | 'DEPARTMENT';         // By Target Office/Department

export interface MemoFilingGuideline {
  code: MemoClassificationCode;
  title: string;
  description: string;
  custodianSuite: 'HR_PERSONNEL' | 'ADMIN_SERVICES' | 'EXECUTIVE_REGISTRY';
  physicalCabinet: string;
  digitalFolder: string;
  masterFileNumber: number; // Linked AMML Master File # (1 to 90)
  retentionYears: number;
  sortingPriority: 'URGENT/ACTION' | 'HIGH' | 'ROUTINE' | 'ARCHIVAL';
  filingSop: string[];
}

export const MEMO_FILING_GUIDELINES: Record<MemoClassificationCode, MemoFilingGuideline> = {
  'HR/PER/LEAVE': {
    code: 'HR/PER/LEAVE',
    title: 'Staff Leave & Relieving Applications',
    description: 'Annual, casual, examination, and medical leave requests, reliever designations, and resumption notices.',
    custodianSuite: 'HR_PERSONNEL',
    physicalCabinet: 'HR Cabinet A1 - Folder 18 (Leave Applications)',
    digitalFolder: '/org/hr/memos/leave-applications',
    masterFileNumber: 18, // FILE-018: STAFF LEAVE & RELIEVING MATTERS
    retentionYears: 5,
    sortingPriority: 'URGENT/ACTION',
    filingSop: [
      'Verify leave dates against active business calendar.',
      'Confirm designated Relieving Officer signature & CC inclusion.',
      'Cross-check staff nominal roll name spelling.',
      'File original copy in Staff Confidential Jacket and digital archive.'
    ]
  },
  'HR/PER/QUERY': {
    code: 'HR/PER/QUERY',
    title: 'Disciplinary Queries & Explanations',
    description: 'Official query letters, formal explanation responses, and disciplinary panel hearing documentation.',
    custodianSuite: 'HR_PERSONNEL',
    physicalCabinet: 'HR Vault Cabinet A3 - Disciplinary Files',
    digitalFolder: '/org/hr/memos/disciplinary-queries',
    masterFileNumber: 24, // FILE-024: STAFF DISCIPLINE & QUERIES
    retentionYears: 10,
    sortingPriority: 'URGENT/ACTION',
    filingSop: [
      'Log receipt time (48-hour mandatory reply window).',
      'Attach attendance log or incident evidence report.',
      'Route to Disciplinary Panel / Head HR for review.'
    ]
  },
  'HR/PER/APPRAISAL': {
    code: 'HR/PER/APPRAISAL',
    title: 'Staff Performance Appraisals & Nominations',
    description: 'Annual performance evaluations, training nominations, promotion recommendations, and commendations.',
    custodianSuite: 'HR_PERSONNEL',
    physicalCabinet: 'HR Cabinet A2 - Appraisal Binders',
    digitalFolder: '/org/hr/memos/performance-appraisals',
    masterFileNumber: 15, // FILE-015: PERFORMANCE AGREEMENTS
    retentionYears: 7,
    sortingPriority: 'HIGH',
    filingSop: [
      'Verify supervisor & HOD recommendation signatures.',
      'Compute overall % performance score against attendance records.',
      'Update Staff Career Progression ledger.'
    ]
  },
  'HR/PER/RESIGN': {
    code: 'HR/PER/RESIGN',
    title: 'Resignations & Exit Clearances',
    description: 'Resignation notices, retirement declarations, exit interviews, and asset return clearance forms.',
    custodianSuite: 'HR_PERSONNEL',
    physicalCabinet: 'HR Cabinet A4 - Disengaged Personnel Jackets',
    digitalFolder: '/org/hr/memos/disengagements',
    masterFileNumber: 47, // FILE-047: EX-STAFF DISENGAGEMENT & CLEARANCE
    retentionYears: 15,
    sortingPriority: 'HIGH',
    filingSop: [
      'Ensure 1-month notice or pay in lieu receipt.',
      'Initiate Ex-Staff Governance Checklist (Revoke biometric/IT access).',
      'Update Nominal Roll to DISENGAGED.'
    ]
  },
  'ADM/MEM/CIRCULAR': {
    code: 'ADM/MEM/CIRCULAR',
    title: 'Executive Circulars & General Directives',
    description: 'Company-wide policy announcements, holiday notices, working hour adjustments, and executive directives.',
    custodianSuite: 'EXECUTIVE_REGISTRY',
    physicalCabinet: 'Admin Registry Cabinet B1 - Public Circular Binder',
    digitalFolder: '/org/admin/circulars/general-directives',
    masterFileNumber: 12, // FILE-012: EXECUTIVE CIRCULARS & NOTICES
    retentionYears: 20,
    sortingPriority: 'HIGH',
    filingSop: [
      'Assign official reference number (e.g., AMML/HQ/ADM/2026/VOL.1).',
      'Post copy on central Staff Notice Board & Kiosk Terminal.',
      'Distribute digital copy to all Head of Departments.'
    ]
  },
  'ADM/MEM/DEPLOY': {
    code: 'ADM/MEM/DEPLOY',
    title: 'Staff Deployments & Market Transfers',
    description: 'Inter-market posting orders, department re-assignments, and temporary duty station directives.',
    custodianSuite: 'ADMIN_SERVICES',
    physicalCabinet: 'Ops Registry Cabinet C2 - Market Deployments',
    digitalFolder: '/org/admin/memos/deployments',
    masterFileNumber: 31, // FILE-031: MARKET STAFF DEPLOYMENT
    retentionYears: 5,
    sortingPriority: 'ROUTINE',
    filingSop: [
      'Verify destination market location & duty schedule.',
      'Notify Market Manager & Ingest Terminal for biometric re-assignment.',
      'File copy in Staff Personal File.'
    ]
  },
  'ADM/MEM/FINANCE': {
    code: 'ADM/MEM/FINANCE',
    title: 'Financial Approvals & Impress Memos',
    description: 'Salary bank account change requests, housing upfront approvals, imprest requests, and wage adjustments.',
    custodianSuite: 'ADMIN_SERVICES',
    physicalCabinet: 'Finance Registry Cabinet F1 - Approved Memos',
    digitalFolder: '/org/finance/memos/payment-approvals',
    masterFileNumber: 19, // FILE-019: IMPRESS & FINANCIAL APPROVALS
    retentionYears: 7,
    sortingPriority: 'URGENT/ACTION',
    filingSop: [
      'Verify MD/CEO or Authorized Signatory approval stamp.',
      'Cross-check budget code & supporting tax invoices.',
      'Pass voucher to Wage Compiler / Accounts Disbursement.'
    ]
  },
  'ADM/MEM/PROCURE': {
    code: 'ADM/MEM/PROCURE',
    title: 'Procurement & Facility Maintenance Requisitions',
    description: 'Equipment repair requests, office supply requisitions, market infrastructure maintenance, and vendor POs.',
    custodianSuite: 'ADMIN_SERVICES',
    physicalCabinet: 'Admin Registry Cabinet B3 - Procurement Requisitions',
    digitalFolder: '/org/admin/memos/procurement-requisitions',
    masterFileNumber: 28, // FILE-028: FACILITY MAINTENANCE & ASSETS
    retentionYears: 5,
    sortingPriority: 'ROUTINE',
    filingSop: [
      'Verify 3 competitive vendor quotes attached.',
      'Ensure Facility Manager inspection certificate attached.',
      'File purchase order in Procurement Register.'
    ]
  }
};

