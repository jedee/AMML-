export interface DepartmentTagInfo {
  deptCode: string;
  supervisorId: string;
  supervisorName: string;
  reportingScope: string;
}

export const DEPARTMENT_CODES: Record<string, string> = {
  "HR & Admin": "DEPT-HR",
  "HR": "DEPT-HR",
  "Admin": "DEPT-HR",
  "Finance & Accounts": "DEPT-FA",
  "Finance": "DEPT-FA",
  "Accounts": "DEPT-FA",
  "Market Operations": "DEPT-OPS",
  "Operations": "DEPT-OPS",
  "Facilities & GS": "DEPT-FGS",
  "Facilities": "DEPT-FGS",
  "Security": "DEPT-SEC",
  "Monitoring": "DEPT-SEC",
  "CS & IT": "DEPT-CSIT",
  "CSIT": "DEPT-CSIT",
  "Corporate Strategy": "DEPT-CSIT",
  "Audit & Internal Control": "DEPT-AUD",
  "Audit": "DEPT-AUD",
  "Executive": "DEPT-EXEC",
  "Administration": "DEPT-EXEC"
};

export const DEPARTMENT_SUPERVISORS: Record<string, { id: string; name: string; scope: string }> = {
  "DEPT-HR": {
    id: "AMML-006",
    name: "OKOSUN EFOSA",
    scope: "HR & Administrative Governance Scope"
  },
  "DEPT-FA": {
    id: "AMML-003",
    name: "FARUK BAFFA",
    scope: "Financial & Accounting Governance Scope"
  },
  "DEPT-OPS": {
    id: "AMML-002",
    name: "INNOCENT AMAECHINA",
    scope: "Operational & Market Management Scope"
  },
  "DEPT-FGS": {
    id: "AMML-021",
    name: "HASSAN ALIYU",
    scope: "Facilities & Logistics Maintenance Scope"
  },
  "DEPT-SEC": {
    id: "AMML-008",
    name: "MUSA HUSSAINI SHELLENG",
    scope: "Security & Enforcement Governance Scope"
  },
  "DEPT-CSIT": {
    id: "AMML-023",
    name: "IKECHUKWU MARVIN UKONU",
    scope: "Corporate Strategy & IT Systems Scope"
  },
  "DEPT-AUD": {
    id: "AMML-010",
    name: "MICHEAL OKPEWHO",
    scope: "Audit & Internal Inspection Scope"
  },
  "DEPT-EXEC": {
    id: "AMML-001",
    name: "OJIJI ONYA",
    scope: "Executive Board & MD/CEO Scope"
  }
};

export function getDeptCode(deptName: string): string {
  if (!deptName) return "DEPT-GEN";
  const norm = deptName.trim();
  for (const [key, code] of Object.entries(DEPARTMENT_CODES)) {
    if (norm.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(norm.toLowerCase())) {
      return code;
    }
  }
  return "DEPT-GEN";
}

export function getDeptTagInfo(deptName: string, staffId: string, role?: string): DepartmentTagInfo {
  const code = getDeptCode(deptName);
  const sup = DEPARTMENT_SUPERVISORS[code] || DEPARTMENT_SUPERVISORS["DEPT-EXEC"];

  // If staff member is MD or Head of HR itself, report to MD/CEO
  let finalSupId = sup.id;
  let finalSupName = sup.name;

  if (staffId === "AMML-001" || (role && (role.includes("MD") || role.includes("CEO")))) {
    finalSupId = "AMML-001";
    finalSupName = "OJIJI ONYA (Ag. MD/CEO)";
  } else if (staffId === sup.id) {
    finalSupId = "AMML-001";
    finalSupName = "OJIJI ONYA (Ag. MD/CEO)";
  }

  return {
    deptCode: code,
    supervisorId: finalSupId,
    supervisorName: finalSupName,
    reportingScope: sup.scope
  };
}

/**
 * Validates whether an HR operation (e.g., reliever assignment or leave submission)
 * complies with authorized departmental scope rules.
 */
export function validateHROperationScope(
  applicantDept: string,
  relieverDept: string,
  relieverId?: string,
  relieverName?: string,
  applicantRole?: string
): { valid: boolean; reason?: string } {
  const appCode = getDeptCode(applicantDept);
  const relCode = getDeptCode(relieverDept);

  const relUpperName = (relieverName || "").toUpperCase();
  const relUpperId = (relieverId || "").toUpperCase();

  // Rule 1: Head of HR & Admin (Efosa Okosun / AMML-006) cannot act as subordinate reliever
  const isHeadOfHR = relUpperId === "AMML-006" || relUpperName.includes("OKOSUN") || relUpperName.includes("EFOSA");
  if (isHeadOfHR) {
    return {
      valid: false,
      reason: "Relieving Officer Restriction: OKOSUN EFOSA (Head of HR & Admin) cannot be designated as a relieving officer for subordinate staff."
    };
  }

  // Rule 2: Exception for Head of Operations / MD authority (Innocent Amaechina)
  const isMDOrOpsApplicant = appCode === "DEPT-OPS" || appCode === "DEPT-EXEC" || (applicantRole && (applicantRole.includes("MD") || applicantRole.includes("CEO")));
  const isInnocent = relUpperId === "AMML-002" || relUpperName.includes("INNOCENT") || relUpperName.includes("AMAECHINA");

  if (isMDOrOpsApplicant && isInnocent) {
    return { valid: true };
  }

  // Rule 3: Department codes must match for standard staff
  if (appCode !== relCode && appCode !== "DEPT-GEN" && relCode !== "DEPT-GEN") {
    return {
      valid: false,
      reason: `Authorized Scope Deficit: Relieving officer department (${relieverDept} [${relCode}]) does not match staff department (${applicantDept} [${appCode}]). Automated HR operations require same-scope coverage.`
    };
  }

  return { valid: true };
}

/**
 * Checks if a staff member is active or ex-staff (e.g., Sarah T. Brown)
 */
export function isExStaff(staffIdOrName: string): boolean {
  if (!staffIdOrName) return false;
  const u = staffIdOrName.toUpperCase();
  return u.includes("SARAH T BROWN") || u.includes("SARAH BROWN") || u.includes("TAMUNOTARIBO") || u === "AMML-EX047";
}

export function isStaffActiveStatus(staffIdOrName: string): { active: boolean; remarks?: string } {
  if (isExStaff(staffIdOrName)) {
    return {
      active: false,
      remarks: "EX-STAFF (RESIGNED): No longer with AMML. Excluded from active HR leave, duty schedules, and staff governance."
    };
  }
  return { active: true };
}
