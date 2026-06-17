import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CurriculumTable, type CurriculumRow } from '@/components/modules/curriculum-table';
import { Plus } from 'lucide-react';

export default async function CurriculumPage() {
  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from('curriculum')
    .select('id, batch_id, subject, topic, status, completion_percentage, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <>
        <Header title="Curriculum" />
        <main className="p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">Failed to load curriculum</p>
              <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
              {error.message.includes('curriculum') && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Ensure database migrations have been run, especially{' '}
                  <code className="rounded bg-muted px-1">001_initial_schema.sql</code>.
                </p>
              )}
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const rows = items ?? [];
  const batchIds = [...new Set(rows.map((r) => r.batch_id).filter(Boolean))];

  let batchMap: Record<string, string> = {};
  if (batchIds.length > 0) {
    const { data: batches } = await supabase
      .from('batches')
      .select('id, batch_name')
      .in('id', batchIds);
    batchMap = Object.fromEntries((batches ?? []).map((b) => [b.id, b.batch_name]));
  }

  const tableData: CurriculumRow[] = rows.map((item) => ({
    id: item.id,
    batch_name: batchMap[item.batch_id] ?? '—',
    subject: item.subject,
    topic: item.topic,
    status: item.status,
    completion_percentage: Number(item.completion_percentage ?? 0),
  }));

  return (
    <>
      <Header title="Curriculum" />
      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">{tableData.length} topics</p>
          <Button asChild>
            <Link href="/dashboard/curriculum/new">
              <Plus className="h-4 w-4" /> Add Topic
            </Link>
          </Button>
        </div>
        <CurriculumTable items={tableData} />
      </main>
    </>
  );
}
