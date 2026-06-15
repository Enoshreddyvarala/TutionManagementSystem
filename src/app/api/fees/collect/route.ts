import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth';
import { feePaymentSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    await requirePermission('fee_collect');
    const body = await request.json();
    const parsed = feePaymentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const supabase = await createClient();
    const { student_id, amount, payment_mode, payment_date, remarks } = parsed.data;

    const { data, error } = await supabase.rpc('process_fee_payment', {
      p_student_id: student_id,
      p_amount: amount,
      p_payment_mode: payment_mode,
      p_payment_date: payment_date,
      p_remarks: remarks ?? undefined,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission('fee_view');
    const supabase = await createClient();
    const student_id = request.nextUrl.searchParams.get('student_id');
    if (!student_id) return NextResponse.json({ error: 'student_id required' }, { status: 400 });

    const [{ data: ledger }, { data: advance }, { data: transactions }] = await Promise.all([
      supabase.from('fee_ledger').select('*').eq('student_id', student_id).order('month_year'),
      supabase.from('student_advance_balance').select('*').eq('student_id', student_id).single(),
      supabase.from('fee_transactions').select('*').eq('student_id', student_id).order('payment_date', { ascending: false }),
    ]);

    return NextResponse.json({ ledger, advance, transactions });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
