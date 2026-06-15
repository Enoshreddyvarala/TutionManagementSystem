import { createClient } from '@/lib/supabase/server';
import { StudentForm } from '@/components/modules/student-form';

export default async function NewStudentPage() {
  const supabase = await createClient();
  const { data: batches } = await supabase
    .from('batches')
    .select('id, batch_name')
    .eq('status', 'active');

  return <StudentForm batches={batches ?? []} />;
}
