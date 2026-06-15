import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate, rel } from '@/lib/utils';
import { IndianRupee, Plus, Receipt } from 'lucide-react';

export default async function FeesPage() {
  const supabase = await createClient();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [
    { data: recentTxns },
    { data: defaulters },
    { data: advanceStudents },
  ] = await Promise.all([
    supabase.from('fee_transactions').select('*, students(name, student_code)').order('created_at', { ascending: false }).limit(10),
    supabase.from('fee_ledger').select('student_id, balance, students(name, student_code)').in('status', ['pending', 'partial']).gt('balance', 0).limit(10),
    supabase.from('student_advance_balance').select('*, students(name, student_code)').gt('balance', 0).limit(10),
  ]);

  const { data: monthlyTotal } = await supabase
    .from('fee_transactions')
    .select('amount')
    .gte('payment_date', monthStart);

  const collection = monthlyTotal?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;

  return (
    <>
      <Header title="Fee Management" />
      <main className="p-6 space-y-6">
        <div className="flex gap-3">
          <Button asChild><Link href="/dashboard/fees/collect"><Plus className="h-4 w-4" /> Collect Fee</Link></Button>
          <Button variant="outline" asChild><Link href="/dashboard/fees/receipts"><Receipt className="h-4 w-4" /> Receipts</Link></Button>
          <Button variant="outline" asChild><Link href="/dashboard/reports?type=fees">Reports</Link></Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatCurrency(collection)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Defaulters</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-destructive">{defaulters?.length ?? 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">In Advance</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-green-600">{advanceStudents?.length ?? 0}</p></CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
            <CardContent>
              {recentTxns?.length ? (
                <div className="space-y-3">
                  {recentTxns.map((t) => (
                    <div key={t.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{rel<{ name: string }>(t.students)?.name}</p>
                        <p className="text-xs text-muted-foreground">{t.receipt_number} · {formatDate(t.payment_date)}</p>
                      </div>
                      <p className="font-bold text-green-600">{formatCurrency(Number(t.amount))}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground">No transactions yet</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Students with Dues</CardTitle></CardHeader>
            <CardContent>
              {defaulters?.length ? (
                <div className="space-y-3">
                  {defaulters.map((d) => (
                    <div key={d.student_id} className="flex items-center justify-between">
                      <Link href={`/dashboard/students/${d.student_id}`} className="font-medium hover:underline">
                        {rel<{ name: string }>(d.students)?.name}
                      </Link>
                      <Badge variant="destructive">{formatCurrency(Number(d.balance))}</Badge>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground">No pending dues</p>}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
