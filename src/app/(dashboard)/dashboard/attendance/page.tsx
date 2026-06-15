import { createClient } from '@/lib/supabase/server';
import { AttendanceMarking } from '@/components/modules/attendance-marking';

export default async function AttendancePage() {
  const supabase = await createClient();
  const { data: batches } = await supabase.from('batches').select('id, batch_name').eq('status', 'active');
  return <AttendanceMarking batches={batches ?? []} />;
}
