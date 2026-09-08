export interface AmmlMarket {
  id: string;
  name: string;
  location: string;
  manager: string;
  capacity: number;
  days: string;
  active: boolean;
  desc: string;
}

export interface AmmlStaff {
  id: string;
  first: string;
  last: string;
  dept: string;
  market: string;
  phone: string;
  role: string;
  salary: number;
  active: boolean;
  authLevel: 'SUPERADMIN' | 'MD' | 'MANAGER' | 'SUPERVISOR' | 'OFFICER';
  
  // Real Nominal Roll Fields
  stateOfOrigin?: string;
  gender?: string;
  dob?: string;
  qualification?: string;
  professionalMembership?: string;
  dateOfFirstAppointment?: string;
  gradeLevel?: string;
  lastPromotionDate?: string;
  remarks?: string;
  isContract?: boolean;
  
  // Department Tagging & Scope Governance Fields
  deptCode?: string;
  supervisorId?: string;
  supervisorName?: string;
  reportingScope?: string;
}

export interface AmmlDevice {
  id: string;
  name: string;
  type: string;
  market: string;
  serial: string;
  location: string;
  active: boolean;
  lastSeen: string;
  clocksToday: number;
}

export interface AmmlAttendance {
  id: string;
  staffId: string;
  staffName: string;
  market: string;
  dept: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  device: string;
  late: boolean;
  duration: string | null;
  notes?: string;
}

export interface AmmlUser {
  id: string;
  name: string;
  email: string;
  staffId?: string | null;
  level: 'SUPERADMIN' | 'MD' | 'MANAGER' | 'SUPERVISOR' | 'OFFICER';
  market: string; // 'all' or market name
  lastLogin: string;
  active: boolean;
  _demoPass?: string;
}

export interface AmmlActivityLog {
  id: string;
  time: string;
  date: string;
  user: string;
  type: string;
  action: string;
  details: string;
  status: string;
}

export interface AmmlSettings {
  startTime: string;
  endTime: string;
  lateMinutes: number;
  minHours: number;
  dailyRate: number;
  lateDeduction: number;
  absentDeductPct: number;
}

export interface AmmlAsset {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  minLevel: number;
  reorderQty: number;
  leadTimeDays: number;
  unitCost: number;
  status?: 'Active' | 'Maintenance' | 'Offline';
  serialNumber?: string;
  notes?: string;
}

export interface AmmlAssetStock {
  itemId: string;
  warehouseId: string; // Associated market name or ID
  quantity: number;
}

export interface AmmlPurchaseOrder {
  id: string;
  itemId: string;
  warehouseId: string; // Associated market name
  qty: number;
  status: 'PENDING' | 'APPROVED' | 'DELIVERED';
  totalCost: number;
  suggestedByAI: boolean;
  createdAt: string;
}

export interface AmmlLeave {
  id: string;
  sn?: number;
  staffId: string;
  staffName: string;
  dept: string;
  leaveType: 'Annual' | 'Casual' | 'Sick' | 'Maternity' | 'Study' | 'Compassionate' | 'Examination';
  startDate: string;
  endDate: string;
  resumptionDate?: string;
  duration: number; // in days
  relievingStaffId?: string;
  relievingStaffName?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  reason?: string;
  dateApplied?: string;
  approvedBy?: string;
  contactPhone?: string;
  leaveAllowanceStatus?: 'Collected' | 'Not Collected' | 'N/A' | string;
  notes?: string;
}

export * from './adminHrTypes';

