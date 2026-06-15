import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StudentForm } from '@/components/modules/student-form';

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: student }, { data: batches }, { data: studentBatches }] = await Promise.all([
    supabase.from('students').select('*').eq('id', id).single(),
    supabase.from('batches').select('id, batch_name').eq('status', 'active'),
    supabase.from('student_batches').select('batch_id').eq('student_id', id),
  ]);

  if (!student) notFound();

  return (
    <StudentForm
      batches={batches ?? []}
      defaultValues={{
        id: student.id,
        name: student.name,
        phone: student.phone ?? undefined,
        parent_contact: student.parent_contact ?? undefined,
        joining_date: student.joining_date,
        monthly_fee: Number(student.monthly_fee),
        status: student.status,
        notes: student.notes ?? undefined,
        batch_ids: studentBatches?.map((sb) => sb.batch_id) ?? [],
      }}
    />
  );
}
