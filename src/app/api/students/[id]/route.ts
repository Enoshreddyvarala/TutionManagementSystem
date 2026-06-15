import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAudit } from '@/lib/auth';
import { studentSchema } from '@/lib/validations';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission('student_view');
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission('student_edit');
    const { id } = await params;
    const body = await request.json();
    const parsed = studentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = await createClient();
    const { batch_ids, ...studentData } = parsed.data;

    const { data: student, error } = await supabase
      .from('students')
      .update(studentData)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (batch_ids !== undefined) {
      await supabase.from('student_batches').delete().eq('student_id', id);
      if (batch_ids.length) {
        await supabase.from('student_batches').insert(
          batch_ids.map((batch_id) => ({ student_id: id, batch_id, assigned_by: user.id }))
        );
      }
    }

    await logAudit('student_updated', 'students', id);
    return NextResponse.json(student);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission('student_delete');
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase.from('students').update({ status: 'archived' }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logAudit('student_archived', 'students', id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
