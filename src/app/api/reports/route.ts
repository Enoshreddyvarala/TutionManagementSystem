import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth';
import { formatCurrency, rel } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('report_view');
    const type = request.nextUrl.searchParams.get('type') ?? 'fee_collection';
    const supabase = await createClient();
    let data: Record<string, unknown>[] = [];

    switch (type) {
      case 'fee_collection': {
        const { data: txns } = await supabase
          .from('fee_transactions')
          .select('receipt_number, amount, payment_date, payment_mode, students(name, student_code)')
          .order('payment_date', { ascending: false });
        data = (txns ?? []).map((t) => ({
          receipt: t.receipt_number,
          student: rel<{ name: string }>(t.students)?.name,
          code: rel<{ student_code: string }>(t.students)?.student_code,
          amount: formatCurrency(Number(t.amount)),
          date: t.payment_date,
          mode: t.payment_mode,
        }));
        break;
      }
      case 'outstanding':
      case 'defaulters': {
        const { data: ledger } = await supabase
          .from('fee_ledger')
          .select('month_year, balance, status, students(name, student_code)')
          .in('status', ['pending', 'partial'])
          .gt('balance', 0)
          .order('month_year');
        data = (ledger ?? []).map((l) => ({
          student: rel<{ name: string }>(l.students)?.name,
          code: rel<{ student_code: string }>(l.students)?.student_code,
          month: l.month_year,
          balance: formatCurrency(Number(l.balance)),
          status: l.status,
        }));
        break;
      }
      case 'advance': {
        const { data: advances } = await supabase
          .from('student_advance_balance')
          .select('balance, covered_until, students(name, student_code)')
          .gt('balance', 0);
        data = (advances ?? []).map((a) => ({
          student: rel<{ name: string }>(a.students)?.name,
          code: rel<{ student_code: string }>(a.students)?.student_code,
          balance: formatCurrency(Number(a.balance)),
          covered_until: a.covered_until ?? 'N/A',
        }));
        break;
      }
      case 'active_students': {
        const { data: students } = await supabase
          .from('students')
          .select('student_code, name, phone, monthly_fee, joining_date')
          .eq('status', 'active');
        data = (students ?? []).map((s) => ({
          code: s.student_code,
          name: s.name,
          phone: s.phone ?? '',
          fee: formatCurrency(Number(s.monthly_fee)),
          joined: s.joining_date,
        }));
        break;
      }
      case 'attendance_monthly': {
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const { data: att } = await supabase
          .from('attendance')
          .select('status, students(name)')
          .gte('date', monthStart);
        const grouped: Record<string, { present: number; absent: number; leave: number }> = {};
        (att ?? []).forEach((a) => {
          const name = rel<{ name: string }>(a.students)?.name ?? 'Unknown';
          if (!grouped[name]) grouped[name] = { present: 0, absent: 0, leave: 0 };
          grouped[name][a.status as 'present' | 'absent' | 'leave']++;
        });
        data = Object.entries(grouped).map(([name, counts]) => ({
          student: name,
          present: counts.present,
          absent: counts.absent,
          leave: counts.leave,
          percentage: `${Math.round((counts.present / (counts.present + counts.absent + counts.leave)) * 100)}%`,
        }));
        break;
      }
      case 'batch_report': {
        const { data: batches } = await supabase
          .from('batches')
          .select('batch_name, subject, status, users!batches_tutor_id_fkey(name)');
        data = (batches ?? []).map((b) => ({
          batch: b.batch_name,
          subject: b.subject,
          tutor: rel<{ name: string }>(b.users)?.name ?? '-',
          status: b.status,
        }));
        break;
      }
    }

    return NextResponse.json({ data, type });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
