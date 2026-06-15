import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Plus } from 'lucide-react';
import { formatCurrency, rel } from '@/lib/utils';

export default async function BatchesPage() {
  const supabase = await createClient();
  const { data: batches } = await supabase
    .from('batches')
    .select('*, users!batches_tutor_id_fkey(name)')
    .order('created_at', { ascending: false });

  return (
    <>
      <Header title="Batches" />
      <main className="p-6 space-y-6">
        <div className="flex justify-between">
          <p className="text-muted-foreground">{batches?.length ?? 0} batches</p>
          <Button asChild><Link href="/dashboard/batches/new"><Plus className="h-4 w-4" /> Create Batch</Link></Button>
        </div>
        <DataTable
          data={(batches ?? []) as Record<string, unknown>[]}
          columns={[
            { key: 'batch_name', header: 'Batch Name' },
            { key: 'subject', header: 'Subject' },
            { key: 'tutor', header: 'Tutor', render: (r) => rel<{ name: string }>(r.users)?.name ?? '-' },
            { key: 'monthly_fee', header: 'Fee', render: (r) => formatCurrency(r.monthly_fee as number) },
            { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'active' ? 'success' : 'secondary'}>{String(r.status)}</Badge> },
          ]}
        />
      </main>
    </>
  );
}
