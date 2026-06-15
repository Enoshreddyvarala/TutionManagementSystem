import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAudit } from '@/lib/auth';
import { batchSchema } from '@/lib/validations';

export async function GET() {
  try {
    await requirePermission('batch_view');
    const supabase = await createClient();
    const { data, error } = await supabase.from('batches').select('*, users!batches_tutor_id_fkey(name)').order('batch_name');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('batch_create');
    const body = await request.json();
    const parsed = batchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('batches')
      .insert({ ...parsed.data, created_by: user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logAudit('batch_created', 'batches', data.id);
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
