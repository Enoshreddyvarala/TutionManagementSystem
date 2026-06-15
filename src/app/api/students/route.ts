import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAudit } from '@/lib/auth';
import { studentSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('student_view');
    const supabase = await createClient();
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 20;
    const search = searchParams.get('search') ?? '';

    let query = supabase
      .from('students')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) query = query.or(`name.ilike.%${search}%,student_code.ilike.%${search}%`);

    const { data, count, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data, total: count, page, pageSize });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('student_create');
    const body = await request.json();
    const parsed = studentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = await createClient();
    const year = new Date().getFullYear();
    const { count } = await supabase.from('students').select('*', { count: 'exact', head: true });
    const student_code = `STU-${year}-${String((count ?? 0) + 1).padStart(4, '0')}`;

    const { batch_ids, ...studentData } = parsed.data;
    const { data: student, error } = await supabase
      .from('students')
      .insert({ ...studentData, student_code, created_by: user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (batch_ids?.length) {
      await supabase.from('student_batches').insert(
        batch_ids.map((batch_id) => ({
          student_id: student.id,
          batch_id,
          assigned_by: user.id,
        }))
      );
    }

    await logAudit('student_created', 'students', student.id, { name: student.name });
    return NextResponse.json(student, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
