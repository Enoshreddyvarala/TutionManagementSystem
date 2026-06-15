import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['super_admin', 'admin', 'accountant', 'tutor']),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  permissions: z.array(z.string()).optional(),
});

export const studentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  parent_contact: z.string().optional(),
  joining_date: z.string().min(1, 'Joining date is required'),
  monthly_fee: z.number().min(0, 'Fee must be positive'),
  status: z.enum(['active', 'inactive', 'archived']),
  notes: z.string().optional(),
  batch_ids: z.array(z.string()).optional(),
});

export const batchSchema = z.object({
  batch_name: z.string().min(2, 'Batch name is required'),
  subject: z.string().min(1, 'Subject is required'),
  tutor_id: z.string().optional(),
  monthly_fee: z.number().min(0),
  status: z.enum(['active', 'inactive', 'completed']),
  schedule: z.array(z.object({
    day: z.string(),
    start_time: z.string(),
    end_time: z.string(),
  })).optional(),
});

export const attendanceSchema = z.object({
  batch_id: z.string().min(1, 'Batch is required'),
  date: z.string().min(1, 'Date is required'),
  records: z.array(z.object({
    student_id: z.string(),
    status: z.enum(['present', 'absent', 'leave']),
    notes: z.string().optional(),
  })),
});

export const feePaymentSchema = z.object({
  student_id: z.string().min(1, 'Student is required'),
  amount: z.number().positive('Amount must be positive'),
  payment_mode: z.enum(['cash', 'upi', 'bank_transfer', 'card']),
  payment_date: z.string().min(1, 'Payment date is required'),
  remarks: z.string().optional(),
});

export const curriculumSchema = z.object({
  batch_id: z.string().min(1, 'Batch is required'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  status: z.enum(['pending', 'in_progress', 'completed']),
  completion_percentage: z.number().min(0).max(100),
});

export const discountSchema = z.object({
  student_id: z.string().min(1),
  name: z.string().min(1, 'Discount name is required'),
  amount: z.coerce.number().positive(),
  is_percentage: z.boolean().default(false),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export const oneTimeChargeSchema = z.object({
  student_id: z.string().min(1),
  charge_type: z.enum(['registration', 'books', 'exam', 'material', 'late_fee', 'other']),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive(),
  due_date: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type BatchInput = z.infer<typeof batchSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type FeePaymentInput = z.infer<typeof feePaymentSchema>;
export type CurriculumInput = z.infer<typeof curriculumSchema>;
