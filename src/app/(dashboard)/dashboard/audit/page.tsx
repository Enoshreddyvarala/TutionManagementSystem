import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/sidebar';
import { DataTable } from '@/components/ui/data-table';
import { formatDate, rel } from '@/lib/utils';

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entity?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('audit_logs')
    .select('*, users(name)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (params.action) query = query.ilike('action', `%${params.action}%`);
  if (params.entity) query = query.eq('entity', params.entity);

  const { data: logs } = await query;

  return (
    <>
      <Header title="Audit Logs" />
      <main className="p-6">
        <DataTable
          data={(logs ?? []) as Record<string, unknown>[]}
          columns={[
            { key: 'created_at', header: 'Timestamp', render: (r) => formatDate(r.created_at as string, { dateStyle: 'medium', timeStyle: 'short' } as Intl.DateTimeFormatOptions) },
            { key: 'user', header: 'User', render: (r) => rel<{ name: string }>(r.users)?.name ?? 'System' },
            { key: 'action', header: 'Action' },
            { key: 'entity', header: 'Entity' },
            { key: 'entity_id', header: 'Entity ID' },
          ]}
        />
      </main>
    </>
  );
}
