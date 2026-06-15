export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          role: 'super_admin' | 'admin' | 'accountant' | 'tutor';
          status: 'active' | 'disabled';
          created_by: string | null;
          last_login: string | null;
          failed_login_attempts: number;
          locked_until: string | null;
          two_factor_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['users']['Row']> & {
          id: string;
          name: string;
          email: string;
          role: Database['public']['Tables']['users']['Row']['role'];
        };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      students: {
        Row: {
          id: string;
          student_code: string;
          name: string;
          phone: string | null;
          parent_contact: string | null;
          joining_date: string;
          monthly_fee: number;
          status: 'active' | 'inactive' | 'archived';
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['students']['Row']>;
      };
      batches: {
        Row: {
          id: string;
          batch_name: string;
          subject: string;
          tutor_id: string | null;
          schedule: Json;
          monthly_fee: number;
          status: 'active' | 'inactive' | 'completed';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['batches']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['batches']['Row']>;
      };
      attendance: {
        Row: {
          id: string;
          student_id: string;
          batch_id: string;
          date: string;
          status: 'present' | 'absent' | 'leave';
          marked_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['attendance']['Row']>;
      };
      fee_ledger: {
        Row: {
          id: string;
          student_id: string;
          month_year: string;
          fee_amount: number;
          discount_amount: number;
          late_fee_amount: number;
          paid_amount: number;
          balance: number;
          status: 'paid' | 'partial' | 'pending';
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['fee_ledger']['Row'], 'id' | 'balance' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['fee_ledger']['Row']>;
      };
      fee_transactions: {
        Row: {
          id: string;
          student_id: string;
          receipt_number: string;
          amount: number;
          payment_date: string;
          payment_mode: 'cash' | 'upi' | 'bank_transfer' | 'card';
          remarks: string | null;
          received_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['fee_transactions']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['fee_transactions']['Row']>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['audit_logs']['Row']>;
      };
      permissions: {
        Row: { id: string; code: string; name: string; module: string; description: string | null; created_at: string };
        Insert: Omit<Database['public']['Tables']['permissions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['permissions']['Row']>;
      };
      curriculum: {
        Row: {
          id: string;
          batch_id: string;
          subject_id: string | null;
          subject: string;
          topic: string;
          status: 'pending' | 'in_progress' | 'completed';
          completion_percentage: number;
          completed_at: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['curriculum']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['curriculum']['Row']>;
      };
    };
    Functions: {
      process_fee_payment: {
        Args: {
          p_student_id: string;
          p_amount: number;
          p_payment_mode: 'cash' | 'upi' | 'bank_transfer' | 'card';
          p_payment_date?: string;
          p_remarks?: string;
        };
        Returns: Json;
      };
      generate_receipt_number: { Args: Record<string, never>; Returns: string };
      log_audit: {
        Args: { p_action: string; p_entity: string; p_entity_id?: string; p_metadata?: Json };
        Returns: string;
      };
    };
  };
}
