import { MemoClassificationCode, MEMO_FILING_GUIDELINES } from './adminHrTypes';

export type MemoTargetModule = 'HR' | 'Admin';

export interface AutoFilingRouting {
  memoId: string;
  memoSubject: string;
  memoTo: string;
  memoMarket?: string;
  targetModule: MemoTargetModule; // 'HR' or 'Admin'
  moduleName: 'HR Personnel Suite' | 'Admin Services Suite';
  classificationCode: MemoClassificationCode;
  matchedKeywords: string[];
  confidenceScore: number; // 0 to 100
  filingReason: string;
  routingRationale: string;
  timestamp: string;
}

export interface InputMemoForFiling {
  id: string;
  subject: string;
  body?: string;
  to?: string;
  market?: string;
  classificationCode?: MemoClassificationCode;
  targetModule?: MemoTargetModule;
  routedSuite?: string;
}

const HR_KEYWORD_RULES = [
  { code: 'HR/PER/LEAVE' as MemoClassificationCode, words: ['LEAVE', 'SICK', 'MEDICAL', 'HEALTH', 'EXAM', 'CASUAL', 'RESUMPTION', 'RELIEVER', 'RELIEVING', 'VACATION', 'ABSENCE', 'REST'] },
  { code: 'HR/PER/QUERY' as MemoClassificationCode, words: ['QUERY', 'DISCIPLINARY', 'EXPLANATION', 'MISCONDUCT', 'WARNING', 'LATE', 'DEFAULT', 'AUDIT FINDING', 'INFRACTION'] },
  { code: 'HR/PER/APPRAISAL' as MemoClassificationCode, words: ['APPRAISAL', 'PROMOTION', 'COMMENDATION', 'EVALUATION', 'RATING', 'NOMINATION', 'TRAINING', 'RECOMMENDATION'] },
  { code: 'HR/PER/RESIGN' as MemoClassificationCode, words: ['RESIGN', 'RESIGNATION', 'DISENGAGE', 'DISENGAGEMENT', 'EXIT CLEARANCE', 'RETIREMENT', 'TERMINATION', 'CLEARANCE'] },
];

const ADMIN_KEYWORD_RULES = [
  { code: 'ADM/MEM/CIRCULAR' as MemoClassificationCode, words: ['CIRCULAR', 'EXECUTIVE DIRECTIVE', 'POLICY NOTICE', 'POLICY', 'DIRECTIVE', 'PUBLIC NOTICE', 'ANNOUNCEMENT', 'OFFICE HOURS'] },
  { code: 'ADM/MEM/DEPLOY' as MemoClassificationCode, words: ['DEPLOY', 'DEPLOYMENT', 'TRANSFER', 'POSTING', 'REASSIGNMENT', 'MARKET ASSIGNMENT', 'LOCATION CHANGE'] },
  { code: 'ADM/MEM/FINANCE' as MemoClassificationCode, words: ['HOUSING', 'ACCOUNT', 'SALARY', 'FINANCE', 'ALLOWANCE', 'PAYMENT', 'IMPRESS', 'IMPREST', 'WAGE', 'BANK', 'DISBURSEMENT', 'TAX'] },
  { code: 'ADM/MEM/PROCURE' as MemoClassificationCode, words: ['PROCURE', 'PROCUREMENT', 'REQUISITION', 'MAINTENANCE', 'FACILITY', 'REPAIR', 'EQUIPMENT', 'VENDOR', 'PURCHASE ORDER', 'SUPPLY'] },
];

/**
 * Processes a single incoming memo by scanning content for keywords,
 * assigning targetModule ('HR' | 'Admin'), classification code, and routing suite.
 */
export const autoFileMemo = (memo: InputMemoForFiling): AutoFilingRouting => {
  const content = `${memo.subject || ''} ${memo.body || ''} ${memo.to || ''} ${memo.market || ''}`.toUpperCase();
  
  let hrMatches: { code: MemoClassificationCode; word: string }[] = [];
  let adminMatches: { code: MemoClassificationCode; word: string }[] = [];

  HR_KEYWORD_RULES.forEach(rule => {
    rule.words.forEach(w => {
      if (content.includes(w)) {
        hrMatches.push({ code: rule.code, word: w });
      }
    });
  });

  ADMIN_KEYWORD_RULES.forEach(rule => {
    rule.words.forEach(w => {
      if (content.includes(w)) {
        adminMatches.push({ code: rule.code, word: w });
      }
    });
  });

  const totalHrCount = hrMatches.length;
  const totalAdminCount = adminMatches.length;

  let targetModule: MemoTargetModule = 'HR';
  let classificationCode: MemoClassificationCode = 'HR/PER/LEAVE';
  let matchedKeywords: string[] = [];

  if (totalAdminCount > totalHrCount) {
    targetModule = 'Admin';
    // Find best admin code
    const codeCounts: Record<string, number> = {};
    adminMatches.forEach(m => {
      codeCounts[m.code] = (codeCounts[m.code] || 0) + 1;
      if (!matchedKeywords.includes(m.word.toLowerCase())) {
        matchedKeywords.push(m.word.toLowerCase());
      }
    });
    const sortedCodes = Object.entries(codeCounts).sort((a, b) => b[1] - a[1]);
    if (sortedCodes.length > 0) {
      classificationCode = sortedCodes[0][0] as MemoClassificationCode;
    } else {
      classificationCode = 'ADM/MEM/CIRCULAR';
    }
  } else {
    targetModule = 'HR';
    const codeCounts: Record<string, number> = {};
    hrMatches.forEach(m => {
      codeCounts[m.code] = (codeCounts[m.code] || 0) + 1;
      if (!matchedKeywords.includes(m.word.toLowerCase())) {
        matchedKeywords.push(m.word.toLowerCase());
      }
    });
    const sortedCodes = Object.entries(codeCounts).sort((a, b) => b[1] - a[1]);
    if (sortedCodes.length > 0) {
      classificationCode = sortedCodes[0][0] as MemoClassificationCode;
    } else {
      classificationCode = 'HR/PER/LEAVE';
    }
  }

  // Calculate confidence score based on keyword match count
  const totalMatches = targetModule === 'HR' ? totalHrCount : totalAdminCount;
  let confidenceScore = 80;
  if (totalMatches >= 3) confidenceScore = 98;
  else if (totalMatches === 2) confidenceScore = 92;
  else if (totalMatches === 1) confidenceScore = 85;

  const moduleName = targetModule === 'HR' ? 'HR Personnel Suite' : 'Admin Services Suite';
  const guideline = MEMO_FILING_GUIDELINES[classificationCode];

  const reason = matchedKeywords.length > 0
    ? `Content matched keyword(s) [${matchedKeywords.join(', ')}]. Tagged as ${classificationCode} (${guideline?.title || ''}) and routed to ${moduleName}.`
    : `Default routing directive applied. Tagged as ${classificationCode} and routed to ${moduleName}.`;

  return {
    memoId: memo.id,
    memoSubject: memo.subject || 'UNTITLED INCOMING MEMO',
    memoTo: memo.to || 'UNSPECIFIED RECIPIENT',
    memoMarket: memo.market || 'Head Office',
    targetModule,
    moduleName,
    classificationCode,
    matchedKeywords,
    confidenceScore,
    filingReason: reason,
    routingRationale: reason,
    timestamp: new Date().toISOString()
  };
};

/**
 * Batch processes a list of memos and returns filing routing records for each.
 */
export const batchAutoFileMemos = (memos: InputMemoForFiling[]): {
  routings: AutoFilingRouting[];
  hrCount: number;
  adminCount: number;
} => {
  const routings = memos.map(m => autoFileMemo(m));
  const hrCount = routings.filter(r => r.targetModule === 'HR').length;
  const adminCount = routings.filter(r => r.targetModule === 'Admin').length;

  return {
    routings,
    hrCount,
    adminCount
  };
};
