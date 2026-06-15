import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/sidebar';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, rel } from '@/lib/utils';
import { DataTable } from '@/components/ui/data-table';

export default async function ReceiptsPage() {
  const supabase = await createClient();
  const { data: receipts } = await supabase
    .from('fee_transactions')
    .select('*, students(name, student_code)')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <>
      <Header title="Receipts" />
      <main className="p-6">
        <DataTable
          data={(receipts ?? []) as Record<string, unknown>[]}
          columns={[
            { key: 'receipt_number', header: 'Receipt No.' },
            { key: 'student', header: 'Student', render: (r) => rel<{ name: string }>(r.students)?.name },
            { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount as number) },
            { key: 'payment_mode', header: 'Mode', render: (r) => <Badge variant="outline">{String(r.payment_mode)}</Badge> },
            { key: 'payment_date', header: 'Date', render: (r) => formatDate(r.payment_date as string) },
          ]}
        />
      </main>
    </>
  );
}
