import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Search, 
  Filter, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  ChevronRight, 
  Tag, 
  Building2, 
  Users, 
  Wallet, 
  Server, 
  Download, 
  Sparkles,
  Archive,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export interface RegistryFileItem {
  id: string; // e.g., 'FILE-015'
  fileNumber: number; // e.g. 15
  title: string;
  category: 'HR_PERSONNEL' | 'ADMIN_SERVICES' | 'MARKET_OPERATIONS' | 'FINANCE_AUDIT' | 'EXECUTIVE_STRATEGY';
  physicalLocation: string; // e.g. 'HR Cabinet A2 - Drawer 1'
  digitalPath: string; // e.g. '/org/hr/staff-ethics'
  custodianDept: string; // e.g. 'Human Resources'
  status: 'ACTIVE' | 'KIV' | 'ARCHIVED' | 'CONFIDENTIAL' | 'PENDING_ACTION';
  dateRef?: string;
  sopSteps: string[];
  notes?: string;
}

// Full transcribed catalog of official AMML files (1 to 90) based on physical handwritten ledger images and Admin/Ops counterparts
export const AMML_MASTER_FILES_CATALOG: RegistryFileItem[] = [
  // Admin & Strategy Baseline (1 - 14)
  {
    id: 'FILE-001',
    fileNumber: 1,
    title: 'AMML INCORPORATION & BOARD RESOLUTIONS',
    category: 'EXECUTIVE_STRATEGY',
    physicalLocation: 'MD/CEO Safe A1 - Executive Vault',
    digitalPath: '/org/exec/incorporation-charter',
    custodianDept: 'Legal & Company Secretariat',
    status: 'CONFIDENTIAL',
    dateRef: '12/10/2004',
    sopSteps: [
      'Access restricted to MD/CEO, Company Secretary, and Authorized Auditors.',
      'Must be referenced when issuing new shares or updating statutory CAC records.',
      'Copy saved in Digital Compliance Vault.'
    ],
    notes: 'Primary foundational incorporation charter of Abuja Markets Management Limited.'
  },
  {
    id: 'FILE-002',
    fileNumber: 2,
    title: 'FCDA LEASE & LAND ALLOCATION MATTERS',
    category: 'ADMIN_SERVICES',
    physicalLocation: 'Admin Registry Cabinet B1 - Shelf 2',
    digitalPath: '/org/admin/fcda-allocations',
    custodianDept: 'Admin & General Services',
    status: 'ACTIVE',
    dateRef: '15/05/2006',
    sopSteps: [
      'Check tenure and ground rent renewal dates annually.',
      'Cross-reference with FCDA/FCTA correspondence prior to market expansion.',
      'Route ground rent vouchers to Finance & Accounts.'
    ]
  },
  {
    id: 'FILE-003',
    fileNumber: 3,
    title: 'ABUJA MARKETS MASTER PLAN & INFRASTRUCTURE MAPS',
    category: 'MARKET_OPERATIONS',
    physicalLocation: 'Operations Desk Ops-1 - Blueprint Rack',
    digitalPath: '/org/ops/masterplan-blueprints',
    custodianDept: 'Operations & Engineering',
    status: 'ACTIVE',
    dateRef: '20/08/2008',
    sopSteps: [
      'Refer to zoning plans before approving shop allocation or site modifications.',
      'Update architectural overlays after facility audits.',
      'Route structural changes to FCTA Development Control.'
    ]
  },

  // Files 15 - 90 (Directly matching handwritten ledger images)
  {
    id: 'FILE-015',
    fileNumber: 15,
    title: 'PERFORMANCE SHATTERED AGREEMENT FOR MARKETS',
    category: 'MARKET_OPERATIONS',
    physicalLocation: 'Ops Registry Cabinet C1 - File Box 15',
    digitalPath: '/org/ops/performance-agreements',
    custodianDept: 'Market Operations & Facilities',
    status: 'ACTIVE',
    dateRef: '12/09/2018',
    sopSteps: [
      'Review market revenue metrics against target performance SLAs.',
      'Forward non-compliance reports to Head of Operations for escalation.',
      'Archive quarterly performance reviews.'
    ],
    notes: 'Covers revenue & operational SLAs across all 8 AMML market clusters.'
  },
  {
    id: 'FILE-016',
    fileNumber: 16,
    title: 'STAFF WORK ETHICS',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Registry Cabinet A1 - Drawer 2',
    digitalPath: '/org/hr/work-ethics-policy',
    custodianDept: 'Human Resources',
    status: 'ACTIVE',
    dateRef: '01/01/2015',
    sopSteps: [
      'Issue copy to all newly onboarded staff during orientation.',
      'Reference when issuing query letters or disciplinary committee memos.',
      'Requires staff signature on acknowledgment form.'
    ]
  },
  {
    id: 'FILE-017',
    fileNumber: 17,
    title: 'TASK FORCE NEW',
    category: 'MARKET_OPERATIONS',
    physicalLocation: 'Ops Security Unit Desk - Box 17',
    digitalPath: '/org/ops/taskforce-new',
    custodianDept: 'Security & Enforcement Task Force',
    status: 'ACTIVE',
    dateRef: '10/02/2019',
    sopSteps: [
      'Verify duty rosters for market enforcement officers.',
      'Log daily field incident briefs and toll collection compliance.',
      'Route discipline complaints to Disciplinary File 23.'
    ]
  },
  {
    id: 'FILE-018',
    fileNumber: 18,
    title: 'HR MATTERS',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Registry Cabinet A1 - Drawer 1',
    digitalPath: '/org/hr/general-matters-2012',
    custodianDept: 'Human Resources',
    status: 'ARCHIVED',
    dateRef: '05/10/2012',
    sopSteps: [
      'Historic general HR correspondence archive.',
      'Reference for retrospective personnel queries or legal audits.',
      'Store in dry archive vault.'
    ]
  },
  {
    id: 'FILE-019',
    fileNumber: 19,
    title: 'MARKET STAFF SCHEDULE OF DUTIES',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Registry Cabinet A2 - Drawer 2',
    digitalPath: '/org/hr/duty-schedules-markets',
    custodianDept: 'Human Resources & Operations',
    status: 'ACTIVE',
    dateRef: '15/06/2016',
    sopSteps: [
      'Maintain updated job descriptions for market managers & field officers.',
      'Review annually during appraisal exercise.',
      'Copy to be displayed at market administrative outposts.'
    ]
  },
  {
    id: 'FILE-020',
    fileNumber: 20,
    title: 'CONTRACT STAFF MATTERS',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Registry Cabinet A2 - Drawer 3',
    digitalPath: '/org/hr/contract-staff-2011',
    custodianDept: 'Human Resources',
    status: 'ACTIVE',
    dateRef: '22/08/2011',
    sopSteps: [
      'Track contract expiration dates 60 days in advance.',
      'Prepare contract renewal / termination recommendations for Head HR.',
      'Cross-reference with conversion file FILE-053.'
    ]
  },
  {
    id: 'FILE-021',
    fileNumber: 21,
    title: 'K.I.V (KEEP IN VIEW)',
    category: 'ADMIN_SERVICES',
    physicalLocation: 'Admin Registry KIV Shelf - Box 21',
    digitalPath: '/org/admin/kiv-matters-2016',
    custodianDept: 'Admin & General Services',
    status: 'KIV',
    dateRef: '07/09/2016',
    sopSteps: [
      'Review pending files bi-weekly for required follow-up action.',
      'Re-route to active file once missing documentation is received.',
      'Log KIV status in Master Tracking System.'
    ]
  },
  {
    id: 'FILE-022',
    fileNumber: 22,
    title: 'TOLL COLLECTORS',
    category: 'MARKET_OPERATIONS',
    physicalLocation: 'Ops Toll Unit Desk - Cabinet C2',
    digitalPath: '/org/ops/toll-collectors',
    custodianDept: 'Market Operations & Revenue',
    status: 'ACTIVE',
    dateRef: '05/07/2013',
    sopSteps: [
      'Reconcile daily ticket issuance against cash deposits with Finance.',
      'Enforce shift rosters and biometric clock-ins.',
      'File monthly revenue compliance summaries.'
    ]
  },
  {
    id: 'FILE-023',
    fileNumber: 23,
    title: 'TASK FORCE DISCIPLINARY COMMITTEE',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Disciplinary Vault - Confidential Safe',
    digitalPath: '/org/hr/taskforce-disciplinary',
    custodianDept: 'HR & Internal Audit',
    status: 'CONFIDENTIAL',
    dateRef: '22/02/2017',
    sopSteps: [
      'Record committee query hearings, witness testimony, and findings.',
      'Submit recommendations to Executive Committee.',
      'Enforce sanctions / disengagements (cross-ref FILE-047).'
    ]
  },
  {
    id: 'FILE-024',
    fileNumber: 24,
    title: 'AMML MARKET CLEANERS',
    category: 'ADMIN_SERVICES',
    physicalLocation: 'Admin Sanitation Desk - Shelf 4',
    digitalPath: '/org/admin/market-cleaners',
    custodianDept: 'Admin & Facility Maintenance',
    status: 'ACTIVE',
    dateRef: '10/11/2014',
    sopSteps: [
      'Verify contractor cleaning schedules across all market sites.',
      'Audit sanitation supplies inventory monthly.',
      'Route contractor payment certificates to Accounts.'
    ]
  },
  {
    id: 'FILE-025',
    fileNumber: 25,
    title: 'AMML SHARES MICRO FINANCE BANK',
    category: 'FINANCE_AUDIT',
    physicalLocation: 'Finance Vault - Shareholder Binder 25',
    digitalPath: '/org/finance/mfb-shares',
    custodianDept: 'Finance & Accounts',
    status: 'ACTIVE',
    dateRef: '18/04/2015',
    sopSteps: [
      'Maintain share dividend certificates and equity ledger for AMML MFB.',
      'Reconcile annual dividend yields.',
      'Cross-reference with FILE-064.'
    ]
  },
  {
    id: 'FILE-026',
    fileNumber: 26,
    title: 'TRAINING FILE',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Development Desk - Shelf 3',
    digitalPath: '/org/hr/training-records-2010',
    custodianDept: 'Human Resources',
    status: 'ARCHIVED',
    dateRef: '17/08/2010',
    sopSteps: [
      'Archive of staff capacity building workshops.',
      'Store certificate copies in individual personnel files.',
      'Reference for training history audits.'
    ]
  },
  {
    id: 'FILE-027',
    fileNumber: 27,
    title: 'TRAINING PROPOSAL',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Development Desk - Shelf 3',
    digitalPath: '/org/hr/training-proposals-2017',
    custodianDept: 'Human Resources',
    status: 'ACTIVE',
    dateRef: '04/01/2017',
    sopSteps: [
      'Evaluate external training vendor proposals and budgets.',
      'Submit cost-benefit analysis to Head HR and Finance.',
      'Track post-training impact assessments.'
    ]
  },
  {
    id: 'FILE-028',
    fileNumber: 28,
    title: 'AMML MFB LOAN FORMS',
    category: 'FINANCE_AUDIT',
    physicalLocation: 'Finance Welfare Safe - Box 28',
    digitalPath: '/org/finance/mfb-loan-forms',
    custodianDept: 'Finance & HR Welfare',
    status: 'ACTIVE',
    dateRef: '12/03/2016',
    sopSteps: [
      'Verify staff loan eligibility and payroll deduction limits (< 33% net).',
      'Obtain guarantor signatures before dispatching to AMML MFB.',
      'Monitor monthly repayment schedules.'
    ]
  },
  {
    id: 'FILE-029',
    fileNumber: 29,
    title: 'CONTRACT STAFF GIFT',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Welfare Desk - Shelf 1',
    digitalPath: '/org/hr/contract-staff-welfare-2016',
    custodianDept: 'Human Resources',
    status: 'ARCHIVED',
    dateRef: '23/11/2016',
    sopSteps: [
      'Record annual end-of-year welfare/gift distribution to contract staff.',
      'Verify signed recipient acknowledgment forms.',
      'File with Finance for audit.'
    ]
  },
  {
    id: 'FILE-030',
    fileNumber: 30,
    title: 'NATIONAL HOUSING FUND (NHF)',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Payroll Desk - Box 30',
    digitalPath: '/org/hr/nhf-remittances',
    custodianDept: 'HR & Payroll',
    status: 'ACTIVE',
    dateRef: '01/02/2014',
    sopSteps: [
      'Compute 2.5% statutory monthly basic salary deductions.',
      'Remit monthly payments to FMBN (Federal Mortgage Bank of Nigeria).',
      'Issue annual NHF passbook statements to participating staff.'
    ]
  },
  {
    id: 'FILE-031',
    fileNumber: 31,
    title: 'CONTRACT EMPLOYMENT',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Cabinet A2 - Drawer 1',
    digitalPath: '/org/hr/contract-employment-2023',
    custodianDept: 'Human Resources',
    status: 'ACTIVE',
    dateRef: '17/02/2023',
    sopSteps: [
      'File active temporary and fixed-term employment contracts.',
      'Verify background check and reference letters.',
      'Notify staff 30 days prior to contract expiration.'
    ]
  },
  {
    id: 'FILE-032',
    fileNumber: 32,
    title: 'PERMANENT STAFF GIFT / WELFARE',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Welfare Desk - Shelf 2',
    digitalPath: '/org/hr/permanent-staff-welfare-2016',
    custodianDept: 'Human Resources',
    status: 'ARCHIVED',
    dateRef: '27/11/2016',
    sopSteps: [
      'Record annual welfare distribution for permanent staff.',
      'Reconcile distribution lists with nominal roll.',
      'Archive signed receipts.'
    ]
  },
  {
    id: 'FILE-033',
    fileNumber: 33,
    title: 'STEP INCREMENT / PROMOTION',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Cabinet A1 - Drawer 3',
    digitalPath: '/org/hr/promotions-increments-2017',
    custodianDept: 'Human Resources',
    status: 'ACTIVE',
    dateRef: '21/09/2017',
    sopSteps: [
      'Compile annual promotion evaluation results from Appraisal FILE-042.',
      'Draft step increment approval memos for Executive Management.',
      'Update payroll step scale upon formal approval.'
    ]
  },
  {
    id: 'FILE-034',
    fileNumber: 34,
    title: 'NIGERIA SOCIAL INSURANCE TRUST FUND (NSITF)',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Payroll Desk - Box 34',
    digitalPath: '/org/hr/nsitf-compliance-2017',
    custodianDept: 'HR & Payroll',
    status: 'ACTIVE',
    dateRef: '15/02/2017',
    sopSteps: [
      'Calculate 1% ECA employer contribution based on total monthly payroll.',
      'Remit to NSITF and file compliance certificates.',
      'Report workplace injury incidents for ECA compensation processing.'
    ]
  },
  {
    id: 'FILE-035',
    fileNumber: 35,
    title: 'PENCOM ISSUES',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Pensions Desk - Box 35',
    digitalPath: '/org/hr/pencom-issues-2016',
    custodianDept: 'Human Resources & Pensions',
    status: 'ACTIVE',
    dateRef: '05/12/2016',
    sopSteps: [
      'Monitor statutory 10% employer / 8% employee pension contributions.',
      'Resolve PFA PIN mismatch or uncredited remittances.',
      'File PenCom annual compliance certificates.'
    ]
  },
  {
    id: 'FILE-036',
    fileNumber: 36,
    title: 'NEW HMO',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Benefits Desk - Box 36',
    digitalPath: '/org/hr/hmo-enrollment-2022',
    custodianDept: 'Human Resources Welfare',
    status: 'ACTIVE',
    dateRef: '17/05/2022',
    sopSteps: [
      'Process annual staff & dependent health insurance registrations.',
      'Handle HMO hospital access complaints and plan upgrades.',
      'Reconcile quarterly HMO premium invoices.'
    ]
  },
  {
    id: 'FILE-037',
    fileNumber: 37,
    title: 'BUDGET 2017',
    category: 'FINANCE_AUDIT',
    physicalLocation: 'Finance Registry Cabinet F1 - Box 37',
    digitalPath: '/org/finance/budget-2017',
    custodianDept: 'Finance & Planning',
    status: 'ARCHIVED',
    dateRef: '01/01/2017',
    sopSteps: [
      'Historic corporate budget document.',
      'Reference for multi-year financial trend analysis.',
      'Stored in dry archive vault.'
    ]
  },
  {
    id: 'FILE-038',
    fileNumber: 38,
    title: 'COMPREHENSIVE STAFF LIST JULY 2018',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Registry Cabinet A1 - Box 38',
    digitalPath: '/org/hr/staff-list-july-2018',
    custodianDept: 'Human Resources',
    status: 'ARCHIVED',
    dateRef: '01/07/2018',
    sopSteps: [
      'Historic nominal roll snapshot.',
      'Reference for service duration calculations or historical audits.'
    ]
  },
  {
    id: 'FILE-039',
    fileNumber: 39,
    title: 'PERSONAL LOAN',
    category: 'FINANCE_AUDIT',
    physicalLocation: 'Finance Welfare Safe - Box 39',
    digitalPath: '/org/finance/personal-loans',
    custodianDept: 'Finance & HR Welfare',
    status: 'ACTIVE',
    dateRef: '10/08/2018',
    sopSteps: [
      'Process staff emergency loan applications.',
      'Enforce monthly salary deduction agreement.',
      'Reconcile loan ledger balance before issuing exit clearance.'
    ]
  },
  {
    id: 'FILE-040',
    fileNumber: 40,
    title: 'KAURA MARKET',
    category: 'MARKET_OPERATIONS',
    physicalLocation: 'Kaura Outpost Desk / Ops Cabinet C3',
    digitalPath: '/org/ops/kaura-market-files',
    custodianDept: 'Market Operations - Kaura Zone',
    status: 'ACTIVE',
    dateRef: '14/02/2015',
    sopSteps: [
      'Maintain Kaura Modern Market shop allocation records and leases.',
      'Log monthly service charge collections and utility billing.',
      'Coordinate security & sanitation operations.'
    ]
  },
  {
    id: 'FILE-041',
    fileNumber: 41,
    title: 'EXTERNAL AUDITORS CORRESPONDENCE',
    category: 'FINANCE_AUDIT',
    physicalLocation: 'Audit Vault - Cabinet E1',
    digitalPath: '/org/audit/external-auditors-2017',
    custodianDept: 'Internal Audit & Finance',
    status: 'ACTIVE',
    dateRef: '03/06/2017',
    sopSteps: [
      'Coordinate annual financial statement audits with external audit firm.',
      'Submit requested trial balances, bank reconciliations, and vouchers.',
      'Archive published audit reports.'
    ]
  },
  {
    id: 'FILE-042',
    fileNumber: 42,
    title: 'APPRAISAL FORMS',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Cabinet A1 - Confidential Box 42',
    digitalPath: '/org/hr/appraisal-forms-2012',
    custodianDept: 'Human Resources',
    status: 'ACTIVE',
    dateRef: '25/04/2012',
    sopSteps: [
      'Distribute annual performance evaluation forms to HODs.',
      'Collate scorecards and calculate department grade averages.',
      'Route top/bottom performers to HR Advisory Board for promotion/remedial action.'
    ]
  },
  {
    id: 'FILE-043',
    fileNumber: 43,
    title: 'PENSION OPENING FORMS FILE',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Pensions Desk - Box 43',
    digitalPath: '/org/hr/pension-opening-forms',
    custodianDept: 'Human Resources Pensions',
    status: 'ACTIVE',
    dateRef: '11/01/2015',
    sopSteps: [
      'Ensure new hires complete PFA registration forms during onboarding.',
      'Verify RSA (Retirement Savings Account) PIN numbers.',
      'Submit PIN details to Payroll for contribution routing.'
    ]
  },
  {
    id: 'FILE-044',
    fileNumber: 44,
    title: 'OUTSOURCING OF CONTRACT STAFF',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Cabinet A2 - Drawer 4',
    digitalPath: '/org/hr/outsourced-contract-staff-2016',
    custodianDept: 'Human Resources & Admin',
    status: 'ACTIVE',
    dateRef: '28/11/2016',
    sopSteps: [
      'Manage SLA contracts with third-party manpower recruitment agencies.',
      'Verify monthly attendance sheets prior to vendor invoice payout.',
      'Enforce background security vetting for outsourced personnel.'
    ]
  },
  {
    id: 'FILE-045',
    fileNumber: 45,
    title: 'STAFF SELF ASSESSMENT',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Cabinet A1 - Box 45',
    digitalPath: '/org/hr/staff-self-assessment',
    custodianDept: 'Human Resources',
    status: 'ACTIVE',
    dateRef: '18/09/2017',
    sopSteps: [
      'Administer bi-annual self-assessment performance reviews.',
      'Compare self-ratings against supervisor scorecards in Appraisal FILE-042.',
      'Identify skill gaps for Training Proposal FILE-027.'
    ]
  },
  {
    id: 'FILE-046',
    fileNumber: 46,
    title: 'END OF SERVICE GRATUITY / RETIREMENT / TERMINAL BENEFIT',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Benefits Vault - Box 46',
    digitalPath: '/org/hr/terminal-benefits',
    custodianDept: 'HR & Finance Pensions',
    status: 'ACTIVE',
    dateRef: '02/05/2016',
    sopSteps: [
      'Compute severance, gratuity, and unutilized leave payout for retiring staff.',
      'Ensure exit clearance form is signed by all 5 key departments.',
      'Obtain executive disbursement sign-off.'
    ]
  },
  {
    id: 'FILE-047',
    fileNumber: 47,
    title: 'DISENGAGED TASKFORCE AND TOLL COLLECTORS',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Archive Vault - Box 47 (EX-STAFF)',
    digitalPath: '/org/hr/disengaged-taskforce-exstaff',
    custodianDept: 'HR Governance & Legal',
    status: 'ARCHIVED',
    dateRef: '12/12/2016',
    sopSteps: [
      'Strict Ex-Staff Archive: Contains disengaged/resigned enforcement personnel.',
      'Includes Sarah T. Brown (AMML-EX047 / S/N 47) disengagement records.',
      'BARRED FROM ACTIVE LEAVE, RELIEVING DUTY, OR RE-HIRE.'
    ],
    notes: 'Primary ex-staff compliance file for terminated / resigned enforcement staff.'
  },
  {
    id: 'FILE-048',
    fileNumber: 48,
    title: 'UNUTILIZED LEAVE',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Leave Desk - Box 48',
    digitalPath: '/org/hr/unutilized-leave-2016',
    custodianDept: 'Human Resources Leave Unit',
    status: 'ACTIVE',
    dateRef: '11/01/2016',
    sopSteps: [
      'Track accumulated unused leave days for carry-forward approval.',
      'Verify MD/CEO approval for leave commutation / allowance payment.',
      'Cross-reference with Leave Matters FILE-081 & FILE-082.'
    ]
  },
  {
    id: 'FILE-049',
    fileNumber: 49,
    title: 'AUTOMATION SPECIAL MONITORING EXERCISE (GARKI)',
    category: 'MARKET_OPERATIONS',
    physicalLocation: 'Garki Market Desk / Ops Cabinet C1',
    digitalPath: '/org/ops/garki-automation-monitoring-2012',
    custodianDept: 'Operations & CSIT',
    status: 'ACTIVE',
    dateRef: '20/08/2012',
    sopSteps: [
      'Audit automated toll barrier gates and POS collection devices at Garki Market.',
      'Cross-examine physical vehicle counts against automated system revenue logs.',
      'Report system bypass attempts to Internal Audit.'
    ]
  },
  {
    id: 'FILE-050',
    fileNumber: 50,
    title: 'STAFF RECOGNITION AWARD',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Welfare Desk - Box 50',
    digitalPath: '/org/hr/staff-recognition-awards-2021',
    custodianDept: 'Human Resources',
    status: 'ACTIVE',
    dateRef: '04/08/2021',
    sopSteps: [
      'Collate quarterly Employee of the Month / Year nominations.',
      'Submit shortlisted staff to Management Board.',
      'Organize annual award commendation ceremony & plaque presentation.'
    ]
  },
  {
    id: 'FILE-051',
    fileNumber: 51,
    title: 'NHIS CLEARLINE',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Benefits Desk - Box 51',
    digitalPath: '/org/hr/nhis-clearline-2011',
    custodianDept: 'Human Resources Benefits',
    status: 'ARCHIVED',
    dateRef: '21/03/2011',
    sopSteps: [
      'Historic Clearline HMO contract and medical claims file.',
      'Reference for legacy healthcare claim reconciliations.'
    ]
  },
  {
    id: 'FILE-052',
    fileNumber: 52,
    title: 'JAJZ TAKAFUL INSURANCE',
    category: 'FINANCE_AUDIT',
    physicalLocation: 'Finance Insurance Desk - Box 52',
    digitalPath: '/org/finance/jaiz-takaful-insurance-2011',
    custodianDept: 'Finance & Accounts',
    status: 'ACTIVE',
    dateRef: '05/07/2011',
    sopSteps: [
      'Maintain market asset and cash-in-transit Islamic insurance policies.',
      'Process insurance claim filings during market incidents or loss.',
      'Reconcile annual premium payments.'
    ]
  },
  {
    id: 'FILE-053',
    fileNumber: 53,
    title: 'CONVERSION CONTRACT TO PERMANENT AND CONFIRMATION',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Cabinet A1 - Drawer 2 (FILE 53)',
    digitalPath: '/org/hr/conversion-contract-to-permanent-2021',
    custodianDept: 'Human Resources',
    status: 'ACTIVE',
    dateRef: '31/07/2021',
    sopSteps: [
      'Step 1: Check Appraisal Form FILE-042 and HOD recommendation.',
      'Step 2: Route to HR Head for confirmation assessment.',
      'Step 3: Forward to MD/CEO for confirmation sign-off.',
      'Step 4: Issue formal Confirmation / Conversion Letter and file copy in Staff File.'
    ]
  },
  {
    id: 'FILE-054',
    fileNumber: 54,
    title: 'PENSION REMITTANCE / ISSUES',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Payroll Desk - Box 54',
    digitalPath: '/org/hr/pension-remittances-2018',
    custodianDept: 'HR & Payroll',
    status: 'ACTIVE',
    dateRef: '26/04/2018',
    sopSteps: [
      'Reconcile monthly bank remittance schedules with PFA accounts.',
      'Resolve uncredited pension payments flagged by employees.',
      'File monthly PenCom bank schedules.'
    ]
  },
  {
    id: 'FILE-055',
    fileNumber: 55,
    title: 'RETIREMENT PROCUREMENT',
    category: 'ADMIN_SERVICES',
    physicalLocation: 'Admin Procurement Desk - Box 55',
    digitalPath: '/org/admin/retirement-procurement-2017',
    custodianDept: 'Admin & Procurement',
    status: 'ARCHIVED',
    dateRef: '01/01/2017',
    sopSteps: [
      'Procurement records for retiring staff gift packages & plaques.',
      'Reconcile with Finance disbursement vouchers.'
    ]
  },
  {
    id: 'FILE-056',
    fileNumber: 56,
    title: 'PENSION STANBIC IBTC',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Pensions Desk - Box 56',
    digitalPath: '/org/hr/pension-stanbic-ibtc-2013',
    custodianDept: 'Human Resources Pensions',
    status: 'ACTIVE',
    dateRef: '01/11/2013',
    sopSteps: [
      'Specific PFA remittance schedule for Stanbic IBTC Pension Managers.',
      'Verify monthly employer/employee credit receipts.'
    ]
  },
  {
    id: 'FILE-057',
    fileNumber: 57,
    title: 'HOUSING SUBSIDY',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Payroll Desk - Box 57',
    digitalPath: '/org/hr/housing-subsidy-2017',
    custodianDept: 'HR & Payroll',
    status: 'ACTIVE',
    dateRef: '30/11/2017',
    sopSteps: [
      'Process annual staff housing allowance disbursement schedules.',
      'Verify grade-step entitlement parameters in Payroll.',
      'Obtain MD/CEO authorization.'
    ]
  },
  {
    id: 'FILE-058',
    fileNumber: 58,
    title: 'ETHICS OF HANDLING CASH',
    category: 'FINANCE_AUDIT',
    physicalLocation: 'Finance Vault - Compliance Shelf 1',
    digitalPath: '/org/finance/ethics-handling-cash-2017',
    custodianDept: 'Finance & Internal Audit',
    status: 'ACTIVE',
    dateRef: '11/03/2017',
    sopSteps: [
      'Mandatory SOP for market revenue collectors & cashiers.',
      'Prohibits holding unbanked cash over 24 hours.',
      'Enforce daily dual-sign cashbook reconciliation.'
    ]
  },
  {
    id: 'FILE-059',
    fileNumber: 59,
    title: 'SSASC GDCTUC AMML BRANCH "STAFF UNION"',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Registry Cabinet A1 - Box 59',
    digitalPath: '/org/hr/staff-union-ssasc-2020',
    custodianDept: 'HR & Industrial Relations',
    status: 'ACTIVE',
    dateRef: '01/11/2020',
    sopSteps: [
      'Maintain union executive election records and CBA agreements.',
      'Process monthly check-off dues deductions.',
      'Log Joint Management-Union consultative meeting minutes.'
    ]
  },
  {
    id: 'FILE-060',
    fileNumber: 60,
    title: 'QUERY',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Disciplinary Vault - Box 60',
    digitalPath: '/org/hr/queries-disciplinary-2017',
    custodianDept: 'Human Resources Disciplinary Unit',
    status: 'CONFIDENTIAL',
    dateRef: '13/06/2017',
    sopSteps: [
      'Issue formal query letters for staff misconduct / absenteeism.',
      'Track 48-hour deadline for written employee response.',
      'Route to Disciplinary Committee if response is unsatisfactory.'
    ]
  },
  {
    id: 'FILE-061',
    fileNumber: 61,
    title: 'LIFE INSURANCE',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Benefits Desk - Box 61',
    digitalPath: '/org/hr/group-life-insurance-2017',
    custodianDept: 'HR & Finance',
    status: 'ACTIVE',
    dateRef: '30/11/2017',
    sopSteps: [
      'Maintain statutory 3x annual total emolument Group Life Policy.',
      'Submit beneficiary updates annually.',
      'Process death benefit claims with underwriters.'
    ]
  },
  {
    id: 'FILE-062',
    fileNumber: 62,
    title: 'WEEKEND ROSTER / ANNUAL LEAVE ROSTER',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Leave Desk - Box 62',
    digitalPath: '/org/hr/annual-leave-weekend-roster-2017',
    custodianDept: 'Human Resources Operations',
    status: 'ACTIVE',
    dateRef: '29/09/2017',
    sopSteps: [
      'Compile annual departmental leave schedules in January.',
      'Verify weekend duty rotation for market operational staff.',
      'Ensure relieving officers are assigned before leave sign-off.'
    ]
  },
  {
    id: 'FILE-063',
    fileNumber: 63,
    title: 'PROPOSAL',
    category: 'ADMIN_SERVICES',
    physicalLocation: 'Admin Registry Cabinet B2 - Box 63',
    digitalPath: '/org/admin/proposals-2017',
    custodianDept: 'Admin & Business Development',
    status: 'ACTIVE',
    dateRef: '19/06/2017',
    sopSteps: [
      'Evaluate unsolicited business & service proposals from third parties.',
      'Route relevant operational proposals to affected department HODs.',
      'Archive rejected or pending proposals.'
    ]
  },
  {
    id: 'FILE-064',
    fileNumber: 64,
    title: 'AMML MFB SHARES',
    category: 'FINANCE_AUDIT',
    physicalLocation: 'Finance Vault - Box 64',
    digitalPath: '/org/finance/mfb-shares-ledger',
    custodianDept: 'Finance & Accounts',
    status: 'ACTIVE',
    dateRef: '01/01/2017',
    sopSteps: [
      'Detailed share capital breakdown for AMML Microfinance Bank.',
      'Cross-reference with FILE-025.'
    ]
  },
  {
    id: 'FILE-065',
    fileNumber: 65,
    title: 'TASK FORCE REDEPLOYMENT',
    category: 'MARKET_OPERATIONS',
    physicalLocation: 'Ops Security Unit Desk - Box 65',
    digitalPath: '/org/ops/taskforce-redeployment',
    custodianDept: 'Market Operations & HR',
    status: 'ACTIVE',
    dateRef: '15/03/2018',
    sopSteps: [
      'Rotate task force enforcement officers across market clusters every 6 months.',
      'Issue formal redeployment letters.',
      'Verify equipment handover before shift transfer.'
    ]
  },
  {
    id: 'FILE-066',
    fileNumber: 66,
    title: 'FCTA INSURANCE SCHEME (FHIS)',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Benefits Desk - Box 66',
    digitalPath: '/org/hr/fcta-fhis-insurance-2021',
    custodianDept: 'Human Resources Benefits',
    status: 'ACTIVE',
    dateRef: '03/08/2021',
    sopSteps: [
      'Administer FCTA Health Insurance Scheme enrollment for staff.',
      'Reconcile payroll deductions with FCTA FHIS board.',
      'Resolve hospital ID card issuance delays.'
    ]
  },
  {
    id: 'FILE-067',
    fileNumber: 67,
    title: 'HOUSING UPFRONT',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Payroll Desk - Box 67',
    digitalPath: '/org/hr/housing-upfront-2021',
    custodianDept: 'HR & Payroll',
    status: 'ACTIVE',
    dateRef: '10/08/2021',
    sopSteps: [
      'Process advance upfront housing allowance requests.',
      'Verify tenancy agreement and landlord bank details.',
      'Obtain Executive approval before payroll disbursement.'
    ]
  },
  {
    id: 'FILE-068',
    fileNumber: 68,
    title: 'NHIS NEW',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Benefits Desk - Box 68',
    digitalPath: '/org/hr/nhis-new-2020',
    custodianDept: 'Human Resources Benefits',
    status: 'ACTIVE',
    dateRef: '21/11/2020',
    sopSteps: [
      'Updated NHIS / NHIA healthcare provider registration files.',
      'Process annual dependent updates.'
    ]
  },
  {
    id: 'FILE-069',
    fileNumber: 69,
    title: 'ANNUAL SUBSCRIPTION DUES',
    category: 'ADMIN_SERVICES',
    physicalLocation: 'Admin Registry Cabinet B1 - Box 69',
    digitalPath: '/org/admin/annual-subscriptions',
    custodianDept: 'Admin & General Services',
    status: 'ACTIVE',
    dateRef: '15/01/2021',
    sopSteps: [
      'Track corporate professional association dues (NIM, ICAN, CIPM, IFMA).',
      'Process annual subscription fee vouchers.',
      'File membership renewal certificates.'
    ]
  },
  {
    id: 'FILE-070',
    fileNumber: 70,
    title: 'RE-DEPLOYMENT',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Cabinet A2 - Box 70',
    digitalPath: '/org/hr/staff-redeployment-2007',
    custodianDept: 'Human Resources',
    status: 'ACTIVE',
    dateRef: '12/01/2007',
    sopSteps: [
      'File inter-departmental and market cluster staff transfer postings.',
      'Ensure 14-day handover period is completed.',
      'Update duty station in HR Database.'
    ]
  },
  {
    id: 'FILE-071',
    fileNumber: 71,
    title: 'K.I.V (KEEP IN VIEW 2023)',
    category: 'ADMIN_SERVICES',
    physicalLocation: 'Admin Registry KIV Shelf - Box 71',
    digitalPath: '/org/admin/kiv-matters-2023',
    custodianDept: 'Admin & General Services',
    status: 'KIV',
    dateRef: '23/03/2023',
    sopSteps: [
      'Pending administrative correspondence awaiting external feedback.',
      'Audit monthly for resolution.'
    ]
  },
  {
    id: 'FILE-072',
    fileNumber: 72,
    title: 'STAFF RATE REVENUE',
    category: 'FINANCE_AUDIT',
    physicalLocation: 'Finance Revenue Desk - Box 72',
    digitalPath: '/org/finance/staff-rate-revenue-2023',
    custodianDept: 'Finance & Operations',
    status: 'ACTIVE',
    dateRef: '03/01/2023',
    sopSteps: [
      'Reconcile staff commission / incentive rates on market revenue collection.',
      'Audit monthly collection quotas against payout vouchers.'
    ]
  },
  {
    id: 'FILE-073',
    fileNumber: 73,
    title: 'TRAINING CONFERENCE',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Development Desk - Box 73',
    digitalPath: '/org/hr/training-conference-2022',
    custodianDept: 'Human Resources',
    status: 'ACTIVE',
    dateRef: '01/04/2022',
    sopSteps: [
      'Process executive and management conference attendance approvals.',
      'File post-conference knowledge sharing reports.',
      'Reconcile travel duty allowance (TDA).'
    ]
  },
  {
    id: 'FILE-074',
    fileNumber: 74,
    title: 'HR MATTERS (2012 BINDER)',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Registry Cabinet A1 - Box 74',
    digitalPath: '/org/hr/hr-matters-2012-b',
    custodianDept: 'Human Resources',
    status: 'ARCHIVED',
    dateRef: '04/12/2012',
    sopSteps: [
      'Historic 2012 HR policy correspondence archive.'
    ]
  },
  {
    id: 'FILE-075',
    fileNumber: 75,
    title: 'NHF MONTHLY PAYMENT RECEIPTS & SCHEDULES',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Payroll Desk - Box 75',
    digitalPath: '/org/hr/nhf-payment-receipts-2021',
    custodianDept: 'HR & Payroll',
    status: 'ACTIVE',
    dateRef: '01/07/2021',
    sopSteps: [
      'File official FMBN bank teller deposit receipts for NHF remittances.',
      'Attach stamped monthly schedule copies for audit.'
    ]
  },
  {
    id: 'FILE-076',
    fileNumber: 76,
    title: 'GARKI INTERNATIONAL MARKET',
    category: 'MARKET_OPERATIONS',
    physicalLocation: 'Garki Market Desk / Ops Cabinet C1',
    digitalPath: '/org/ops/garki-international-market-2021',
    custodianDept: 'Market Operations - Garki Cluster',
    status: 'ACTIVE',
    dateRef: '15/12/2021',
    sopSteps: [
      'Comprehensive master file for Garki Model Market operational leases, traders association agreements, and facility maintenance.',
      'Route revenue audits to Finance.'
    ]
  },
  {
    id: 'FILE-077',
    fileNumber: 77,
    title: 'NYSC',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Registry Cabinet A2 - Box 77',
    digitalPath: '/org/hr/nysc-corpers-2012',
    custodianDept: 'Human Resources',
    status: 'ACTIVE',
    dateRef: '01/11/2012',
    sopSteps: [
      'Manage National Youth Service Corps (NYSC) intern postings.',
      'Issue monthly clearance letters for corps allowance payment.',
      'Issue final NYSC discharge recommendation letters.'
    ]
  },
  {
    id: 'FILE-078',
    fileNumber: 78,
    title: 'FAA PLAZA',
    category: 'MARKET_OPERATIONS',
    physicalLocation: 'Ops Registry Cabinet C2 - Box 78',
    digitalPath: '/org/ops/faa-plaza-2023',
    custodianDept: 'Market Operations - FAA Cluster',
    status: 'ACTIVE',
    dateRef: '29/03/2023',
    sopSteps: [
      'Maintain tenant lease contracts and service charge accounts for FAA Plaza.',
      'Audit facility utilities and security.'
    ]
  },
  {
    id: 'FILE-079',
    fileNumber: 79,
    title: 'AMML 2 YEARS STRATEGY ROADMAP',
    category: 'EXECUTIVE_STRATEGY',
    physicalLocation: 'MD/CEO Office - Strategy Safe Box 79',
    digitalPath: '/org/exec/strategy-roadmap-2022',
    custodianDept: 'Corporate Strategy & Board',
    status: 'ACTIVE',
    dateRef: '22/09/2022',
    sopSteps: [
      'Primary corporate growth & revenue diversification roadmap for AMML.',
      'Review quarterly with HODs for strategic alignment.',
      'Track market expansion KPIs.'
    ]
  },
  {
    id: 'FILE-080',
    fileNumber: 80,
    title: 'STAFF ATTENDANCE (2017)',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Registry Archive - Box 80',
    digitalPath: '/org/hr/staff-attendance-2017',
    custodianDept: 'Human Resources Attendance Unit',
    status: 'ARCHIVED',
    dateRef: '01/01/2017',
    sopSteps: [
      'Historic biometric clock-in ledger sheets for 2017.',
      'Stored in dry archive vault.'
    ]
  },
  {
    id: 'FILE-081',
    fileNumber: 81,
    title: 'LEAVE MATTERS APRIL 2019',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Leave Registry - Box 81',
    digitalPath: '/org/hr/leave-matters-april-2019',
    custodianDept: 'Human Resources Leave Unit',
    status: 'ARCHIVED',
    dateRef: '01/04/2019',
    sopSteps: [
      'Historic leave application approvals for April 2019.'
    ]
  },
  {
    id: 'FILE-082',
    fileNumber: 82,
    title: 'LEAVE MATTERS AUGUST 2021',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Leave Registry - Box 82',
    digitalPath: '/org/hr/leave-matters-august-2021',
    custodianDept: 'Human Resources Leave Unit',
    status: 'ARCHIVED',
    dateRef: '01/08/2021',
    sopSteps: [
      'Historic leave approval records for August 2021.'
    ]
  },
  {
    id: 'FILE-083',
    fileNumber: 83,
    title: 'NYSC MATTERS (27/2/2019)',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Registry Cabinet A2 - Box 83',
    digitalPath: '/org/hr/nysc-matters-2019',
    custodianDept: 'Human Resources',
    status: 'ARCHIVED',
    dateRef: '27/02/2019',
    sopSteps: [
      'NYSC intern monthly clearance and posting memos for 2019.'
    ]
  },
  {
    id: 'FILE-084',
    fileNumber: 84,
    title: 'FINANCIAL ASSISTANCE',
    category: 'FINANCE_AUDIT',
    physicalLocation: 'Finance Welfare Safe - Box 84',
    digitalPath: '/org/finance/financial-assistance',
    custodianDept: 'Finance & HR Welfare',
    status: 'ACTIVE',
    dateRef: '14/06/2020',
    sopSteps: [
      'Evaluate staff medical / compassionate financial assistance requests.',
      'Submit recommendations to HR Welfare Committee.',
      'Obtain MD/CEO payout sign-off.'
    ]
  },
  {
    id: 'FILE-085',
    fileNumber: 85,
    title: 'TRAINING MEMOS / CONFERENCE (4/1/2017)',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Development Desk - Box 85',
    digitalPath: '/org/hr/training-memos-conference-2017',
    custodianDept: 'Human Resources Development',
    status: 'ARCHIVED',
    dateRef: '04/01/2017',
    sopSteps: [
      'Memos for 2017 capacity building and conference participation.'
    ]
  },
  {
    id: 'FILE-086',
    fileNumber: 86,
    title: 'COVID 19 MATTERS',
    category: 'ADMIN_SERVICES',
    physicalLocation: 'Admin Safety Vault - Box 86',
    digitalPath: '/org/admin/covid19-matters-2020',
    custodianDept: 'Admin & Safety Unit',
    status: 'ARCHIVED',
    dateRef: '20/03/2020',
    sopSteps: [
      'Special emergency health protocols, remote shift rosters, and sanitation procurement during 2020 pandemic.'
    ]
  },
  {
    id: 'FILE-087',
    fileNumber: 87,
    title: 'APRIL 2023 SALARY',
    category: 'FINANCE_AUDIT',
    physicalLocation: 'Finance Payroll Safe - Box 87',
    digitalPath: '/org/finance/salary-april-2023',
    custodianDept: 'Finance & Payroll',
    status: 'ACTIVE',
    dateRef: '25/04/2023',
    sopSteps: [
      'Master April 2023 salary compilation, bank schedules, and tax schedules.',
      'Cross-reference with Wage Compiler.'
    ]
  },
  {
    id: 'FILE-088',
    fileNumber: 88,
    title: 'ACCOUNT CORRESPONDENCE',
    category: 'FINANCE_AUDIT',
    physicalLocation: 'Finance Registry Cabinet F1 - Box 88',
    digitalPath: '/org/finance/account-correspondence',
    custodianDept: 'Finance & Accounts',
    status: 'ACTIVE',
    dateRef: '10/01/2022',
    sopSteps: [
      'Official bank correspondence, mandate updates, and account statement requests.'
    ]
  },
  {
    id: 'FILE-089',
    fileNumber: 89,
    title: 'HMO',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Benefits Desk - Box 89',
    digitalPath: '/org/hr/hmo-master-file',
    custodianDept: 'Human Resources Benefits',
    status: 'ACTIVE',
    dateRef: '01/01/2023',
    sopSteps: [
      'General master file for health management organization contracts and claims.'
    ]
  },
  {
    id: 'FILE-090',
    fileNumber: 90,
    title: 'LEAVE MATTERS',
    category: 'HR_PERSONNEL',
    physicalLocation: 'HR Leave Registry Cabinet A2 - Box 90',
    digitalPath: '/org/hr/leave-matters-master',
    custodianDept: 'Human Resources Leave Unit',
    status: 'ACTIVE',
    dateRef: '01/01/2023',
    sopSteps: [
      'Master current leave registry binder.',
      'Contains active leave applications, relieving officer endorsements, and HR approvals.',
      'Synchronized with digital Leave Management Module.'
    ]
  }
];

export const MasterFileWorkflowRegistry: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeFileModal, setActiveFileModal] = useState<RegistryFileItem | null>(null);

  // Filtered File Registry Items
  const filteredFiles = useMemo(() => {
    return AMML_MASTER_FILES_CATALOG.filter(file => {
      const matchesCategory = selectedCategory === 'ALL' || file.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || file.status === selectedStatus;
      
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || (
        file.id.toLowerCase().includes(q) ||
        file.fileNumber.toString().includes(q) ||
        file.title.toLowerCase().includes(q) ||
        file.physicalLocation.toLowerCase().includes(q) ||
        file.custodianDept.toLowerCase().includes(q)
      );

      return matchesCategory && matchesStatus && matchesQuery;
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Category Badge Helper
  const categoryLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    HR_PERSONNEL: { label: 'HR & PERSONNEL', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: Users },
    ADMIN_SERVICES: { label: 'ADMIN & SERVICES', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: Building2 },
    MARKET_OPERATIONS: { label: 'MARKET OPERATIONS', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: MapPin },
    FINANCE_AUDIT: { label: 'FINANCE & AUDIT', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Wallet },
    EXECUTIVE_STRATEGY: { label: 'EXEC & STRATEGY', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: ShieldAlert },
  };

  const statusBadges: Record<string, { label: string; style: string }> = {
    ACTIVE: { label: 'ACTIVE IN-USE', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    KIV: { label: 'KEEP IN VIEW (KIV)', style: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' },
    ARCHIVED: { label: 'ARCHIVED / HISTORIC', style: 'bg-slate-700/50 text-slate-400 border-slate-600' },
    CONFIDENTIAL: { label: 'CONFIDENTIAL SAFE', style: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    PENDING_ACTION: { label: 'PENDING ACTION', style: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  };

  return (
    <div className="space-y-6 font-mono text-slate-100">
      
      {/* 1. Header Control Ribbon */}
      <div className="border border-amml-line bg-gradient-to-r from-amml-panel via-amml-surface2/80 to-amml-panel p-4 rounded-lg shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amml-orange animate-pulse" />
              <span className="text-[10px] font-bold text-amml-orange uppercase tracking-widest">
                OFFICIAL AMML FILE REGISTRY &amp; WORKFLOW EXPLORER
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                {AMML_MASTER_FILES_CATALOG.length} REGISTERED FILES
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
              <Folder className="h-5 w-5 text-amml-orange" />
              <span>MASTER FILE WORKFLOW CABINET (001 - 090)</span>
            </h1>
            <p className="text-xs text-amml-muted max-w-3xl">
              Organized physical filing locations, custodian departments, digital paths, and Standard Operating Procedures (SOPs) for every HR and Admin file.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs bg-amml-page border border-amml-line p-2.5 rounded-md">
            <div className="text-center px-2 border-r border-amml-line">
              <div className="text-emerald-400 font-bold text-sm">
                {AMML_MASTER_FILES_CATALOG.filter(f => f.category === 'HR_PERSONNEL').length}
              </div>
              <div className="text-[9px] text-amml-muted">HR FILES</div>
            </div>
            <div className="text-center px-2 border-r border-amml-line">
              <div className="text-amber-400 font-bold text-sm">
                {AMML_MASTER_FILES_CATALOG.filter(f => f.category === 'ADMIN_SERVICES').length}
              </div>
              <div className="text-[9px] text-amml-muted">ADMIN FILES</div>
            </div>
            <div className="text-center px-2">
              <div className="text-cyan-400 font-bold text-sm">
                {AMML_MASTER_FILES_CATALOG.filter(f => f.category === 'MARKET_OPERATIONS').length}
              </div>
              <div className="text-[9px] text-amml-muted">OPS FILES</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="pt-3 border-t border-amml-line/50 flex flex-wrap items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-amml-muted" />
            <input
              type="text"
              placeholder="Search by file number (e.g., 82, 36), title, location, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-amml-page border border-amml-line rounded text-xs text-slate-100 focus:outline-none focus:border-amml-orange"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-amml-page border border-amml-line rounded px-3 py-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-amml-muted" />
            <span className="text-amml-muted hidden sm:inline">CATEGORY:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-amml-panel">ALL CATEGORIES</option>
              <option value="HR_PERSONNEL" className="bg-amml-panel">HR &amp; PERSONNEL</option>
              <option value="ADMIN_SERVICES" className="bg-amml-panel">ADMIN &amp; SERVICES</option>
              <option value="MARKET_OPERATIONS" className="bg-amml-panel">MARKET OPERATIONS</option>
              <option value="FINANCE_AUDIT" className="bg-amml-panel">FINANCE &amp; AUDIT</option>
              <option value="EXECUTIVE_STRATEGY" className="bg-amml-panel">EXECUTIVE &amp; STRATEGY</option>
            </select>
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-amml-page border border-amml-line rounded px-3 py-1.5 text-xs">
            <span className="text-amml-muted hidden sm:inline">STATUS:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-amml-panel">ALL STATUSES</option>
              <option value="ACTIVE" className="bg-amml-panel">ACTIVE IN-USE</option>
              <option value="KIV" className="bg-amml-panel">KEEP IN VIEW (KIV)</option>
              <option value="CONFIDENTIAL" className="bg-amml-panel">CONFIDENTIAL SAFE</option>
              <option value="ARCHIVED" className="bg-amml-panel">ARCHIVED / HISTORIC</option>
            </select>
          </div>

        </div>
      </div>

      {/* 2. File Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredFiles.map(file => {
          const cat = categoryLabels[file.category];
          const st = statusBadges[file.status];

          return (
            <div 
              key={file.id}
              onClick={() => setActiveFileModal(file)}
              className="border border-amml-line bg-amml-panel rounded-lg p-4 space-y-3 hover:border-amml-orange/80 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs font-mono text-amml-orange bg-amml-surface3 px-2 py-0.5 rounded border border-amml-orange/20">
                    {file.id}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${st.style}`}>
                    {st.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xs font-bold text-slate-100 group-hover:text-amml-orange transition-colors uppercase leading-snug line-clamp-2">
                  {file.title}
                </h3>

                {/* Category & Custodian */}
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={`px-2 py-0.5 rounded font-semibold border ${cat.color}`}>
                    {cat.label}
                  </span>
                </div>
              </div>

              {/* Physical Location & Workflow Route */}
              <div className="space-y-2 pt-2 border-t border-amml-line/40 text-[11px] font-mono">
                <div className="flex items-start gap-1.5 text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-amml-orange shrink-0 mt-0.5" />
                  <span className="truncate">{file.physicalLocation}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-amml-muted pt-1">
                  <span>CUSTODIAN: <strong className="text-slate-200">{file.custodianDept}</strong></span>
                  <span className="text-amml-orange flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform">
                    <span>VIEW SOP</span>
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFiles.length === 0 && (
        <div className="p-8 border border-dashed border-amml-line rounded-lg text-center space-y-2 text-amml-muted">
          <FolderOpen className="h-8 w-8 mx-auto text-amml-orange/50" />
          <p className="text-xs font-mono">No files found matching the search criteria "{searchQuery}".</p>
        </div>
      )}

      {/* 3. Detailed File SOP Workflow Modal */}
      {activeFileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-amml-panel border border-amml-line rounded-lg max-w-2xl w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-amml-line pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-amml-orange text-black">
                    {activeFileModal.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusBadges[activeFileModal.status].style}`}>
                    {statusBadges[activeFileModal.status].label}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white uppercase tracking-tight mt-1">
                  {activeFileModal.title}
                </h2>
              </div>
              <button 
                onClick={() => setActiveFileModal(null)}
                className="p-1 text-amml-muted hover:text-white rounded bg-amml-surface3 border border-amml-line"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-amml-surface2/60 border border-amml-line/50 rounded space-y-1">
                <span className="text-amml-muted text-[10px] uppercase">PHYSICAL FILING LOCATION</span>
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amml-orange shrink-0" />
                  <span>{activeFileModal.physicalLocation}</span>
                </p>
              </div>

              <div className="p-3 bg-amml-surface2/60 border border-amml-line/50 rounded space-y-1">
                <span className="text-amml-muted text-[10px] uppercase">CUSTODIAN DEPARTMENT</span>
                <p className="font-bold text-slate-100 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{activeFileModal.custodianDept}</span>
                </p>
              </div>
            </div>

            {/* SOP Workflow Steps ("How to Proceed") */}
            <div className="space-y-2 border-t border-amml-line pt-4">
              <h3 className="text-xs font-bold uppercase text-amml-orange flex items-center gap-1.5 font-mono">
                <BookOpen className="h-4 w-4" />
                <span>WORKFLOW PROCEDURE &amp; HOW TO PROCEED (SOP)</span>
              </h3>
              <div className="p-3 bg-amml-page border border-amml-line rounded space-y-2 text-xs font-mono">
                {activeFileModal.sopSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-200">
                    <span className="h-5 w-5 rounded-full bg-amml-surface3 text-amml-orange flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-amml-orange/30">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {activeFileModal.notes && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-200 text-xs font-mono space-y-1">
                <strong className="text-amber-400 uppercase">FILE GOVERNANCE NOTE:</strong>
                <p>{activeFileModal.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => {
                  alert(`Routing Slip generated for ${activeFileModal.id}: Saved to dispatch queue.`);
                  setActiveFileModal(null);
                }}
                className="px-4 py-2 bg-amml-orange text-black font-bold rounded hover:bg-amml-orange/90 transition-all flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span>GENERATE DISPATCH SLIP</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
