export type UserRole = 'super_admin' | 'admin' | 'accountant' | 'tutor';
export type UserStatus = 'active' | 'disabled';
export type StudentStatus = 'active' | 'inactive' | 'archived';
export type BatchStatus = 'active' | 'inactive' | 'completed';
export type AttendanceStatus = 'present' | 'absent' | 'leave';
export type CurriculumStatus = 'pending' | 'in_progress' | 'completed';
export type FeeLedgerStatus = 'paid' | 'partial' | 'pending';
export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'card';
export type ChargeType = 'monthly' | 'registration' | 'books' | 'exam' | 'material' | 'late_fee' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  created_by?: string;
  last_login?: string;
  two_factor_enabled?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_code: string;
  granted: boolean;
}

export interface Student {
  id: string;
  student_code: string;
  name: string;
  phone?: string;
  parent_contact?: string;
  joining_date: string;
  monthly_fee: number;
  status: StudentStatus;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  batches?: Batch[];
}

export interface Batch {
  id: string;
  batch_name: string;
  subject: string;
  tutor_id?: string;
  tutor?: User;
  schedule: ScheduleSlot[];
  monthly_fee: number;
  status: BatchStatus;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  student_count?: number;
}

export interface ScheduleSlot {
  day: string;
  start_time: string;
  end_time: string;
}

export interface StudentBatch {
  id: string;
  student_id: string;
  batch_id: string;
  assigned_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  batch_id: string;
  date: string;
  status: AttendanceStatus;
  marked_by?: string;
  notes?: string;
  student?: Student;
  batch?: Batch;
}

export interface Curriculum {
  id: string;
  batch_id: string;
  subject: string;
  topic: string;
  status: CurriculumStatus;
  completion_percentage: number;
  completed_at?: string;
  updated_by?: string;
  created_at: string;
}

export interface FeeLedger {
  id: string;
  student_id: string;
  month_year: string;
  fee_amount: number;
  discount_amount: number;
  late_fee_amount: number;
  paid_amount: number;
  balance: number;
  status: FeeLedgerStatus;
  due_date?: string;
}

export interface FeeTransaction {
  id: string;
  student_id: string;
  receipt_number: string;
  amount: number;
  payment_date: string;
  payment_mode: PaymentMode;
  remarks?: string;
  received_by?: string;
  created_at: string;
  student?: Student;
  allocations?: FeeAllocation[];
}

export interface FeeAllocation {
  id: string;
  transaction_id: string;
  ledger_id?: string;
  one_time_charge_id?: string;
  allocated_amount: number;
  month_year?: string;
}

export interface OneTimeCharge {
  id: string;
  student_id: string;
  charge_type: ChargeType;
  description: string;
  amount: number;
  due_date?: string;
  paid_amount: number;
  status: FeeLedgerStatus;
}

export interface StudentDiscount {
  id: string;
  student_id: string;
  name: string;
  amount: number;
  is_percentage: boolean;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export interface StudentAdvanceBalance {
  student_id: string;
  balance: number;
  covered_until?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  user?: User;
}

export interface FeeRule {
  id: string;
  name: string;
  due_day: number;
  late_fee_amount: number;
  grace_period_days: number;
  is_active: boolean;
}

export interface DashboardStats {
  total_students: number;
  active_students: number;
  total_tutors: number;
  total_admins: number;
  today_attendance: number;
  monthly_collection: number;
  pending_fees: number;
  advance_collections: number;
  students_with_dues: number;
  students_in_advance: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PermissionCode =
  | 'student_view' | 'student_create' | 'student_edit' | 'student_delete'
  | 'attendance_view' | 'attendance_mark'
  | 'fee_view' | 'fee_create' | 'fee_edit' | 'fee_delete' | 'fee_collect'
  | 'curriculum_view' | 'curriculum_edit'
  | 'report_view'
  | 'batch_view' | 'batch_create' | 'batch_edit' | 'batch_delete'
  | 'admin_create' | 'admin_edit' | 'admin_delete'
  | 'user_manage' | 'audit_view' | 'settings_manage';
