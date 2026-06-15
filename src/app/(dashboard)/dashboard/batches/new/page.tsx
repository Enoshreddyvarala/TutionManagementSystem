import { createClient } from '@/lib/supabase/server';
import NewBatchPage from '@/components/modules/batch-form-page';

export default async function Page() {
  const supabase = await createClient();
  const { data: tutors } = await supabase
    .from('users')
    .select('id, name')
    .eq('role', 'tutor')
    .eq('status', 'active');
  return <NewBatchPage tutors={tutors ?? []} />;
}
