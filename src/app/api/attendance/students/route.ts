import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('attendance_view');
    const batch_id = request.nextUrl.searchParams.get('batch_id');
    if (!batch_id) return NextResponse.json([]);

    const supabase = await createClient();
    const { data } = await supabase
      .from('student_batches')
      .select('students(id, name, student_code)')
      .eq('batch_id', batch_id);

    const students = data?.map((d) => d.students).filter(Boolean) ?? [];
    return NextResponse.json(students);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
