import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAudit } from '@/lib/auth';
import { attendanceSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('attendance_mark');
    const body = await request.json();
    const parsed = attendanceSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const supabase = await createClient();
    const { batch_id, date, records } = parsed.data;

    const upserts = records.map((r) => ({
      student_id: r.student_id,
      batch_id,
      date,
      status: r.status,
      marked_by: user.id,
      notes: r.notes,
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(upserts, { onConflict: 'student_id,batch_id,date' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logAudit('attendance_marked', 'attendance', batch_id, { date, count: records.length });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission('attendance_view');
    const supabase = await createClient();
    const { searchParams } = request.nextUrl;
    const batch_id = searchParams.get('batch_id');
    const date = searchParams.get('date');
    const student_id = searchParams.get('student_id');

    let query = supabase.from('attendance').select('*, students(name, student_code), batches(batch_name)');
    if (batch_id) query = query.eq('batch_id', batch_id);
    if (date) query = query.eq('date', date);
    if (student_id) query = query.eq('student_id', student_id);

    const { data, error } = await query.order('date', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
