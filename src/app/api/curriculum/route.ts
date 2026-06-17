import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAudit } from '@/lib/auth';
import { curriculumSchema } from '@/lib/validations';

export async function GET() {
  try {
    await requirePermission('curriculum_view');
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('curriculum')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('curriculum_edit');
    const body = await request.json();
    const parsed = curriculumSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('curriculum')
      .insert({ ...parsed.data, updated_by: user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logAudit('curriculum_created', 'curriculum', data.id);
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
