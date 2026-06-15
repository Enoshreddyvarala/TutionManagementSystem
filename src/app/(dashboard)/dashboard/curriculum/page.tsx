import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/sidebar';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { rel } from '@/lib/utils';

export default async function CurriculumPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from('curriculum')
    .select('*, batches(batch_name)')
    .order('created_at', { ascending: false });

  const STATUS_VARIANT: Record<string, 'secondary' | 'warning' | 'success'> = {
    pending: 'secondary',
    in_progress: 'warning',
    completed: 'success',
  };

  return (
    <>
      <Header title="Curriculum" />
      <main className="p-6">
        <DataTable
          data={(items ?? []) as Record<string, unknown>[]}
          columns={[
            { key: 'batch', header: 'Batch', render: (r) => rel<{ batch_name: string }>(r.batches)?.batch_name },
            { key: 'subject', header: 'Subject' },
            { key: 'topic', header: 'Topic' },
            { key: 'completion_percentage', header: 'Progress', render: (r) => `${r.completion_percentage}%` },
            { key: 'status', header: 'Status', render: (r) => <Badge variant={STATUS_VARIANT[r.status as string]}>{String(r.status)}</Badge> },
          ]}
        />
      </main>
    </>
  );
}
