import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate, rel } from '@/lib/utils';
import { Edit, IndianRupee } from 'lucide-react';

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: student }, { data: ledger }, { data: batches }, { data: advance }] = await Promise.all([
    supabase.from('students').select('*').eq('id', id).single(),
    supabase.from('fee_ledger').select('*').eq('student_id', id).order('month_year', { ascending: false }).limit(6),
    supabase.from('student_batches').select('batch_id, batches(batch_name, subject)').eq('student_id', id),
    supabase.from('student_advance_balance').select('*').eq('student_id', id).single(),
  ]);

  if (!student) notFound();

  const totalDue = ledger?.reduce((s, l) => s + Number(l.balance), 0) ?? 0;

  return (
    <>
      <Header title={student.name} />
      <main className="p-6 space-y-6">
        <div className="flex gap-3">
          <Button asChild>
            <Link href={`/dashboard/students/${id}/edit`}><Edit className="h-4 w-4" /> Edit</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/fees/collect?student=${id}`}><IndianRupee className="h-4 w-4" /> Collect Fee</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Student Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-sm text-muted-foreground">Student ID</p><p className="font-medium">{student.student_code}</p></div>
              <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={student.status === 'active' ? 'success' : 'secondary'}>{student.status}</Badge></div>
              <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{student.phone ?? '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Parent Contact</p><p className="font-medium">{student.parent_contact ?? '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Joining Date</p><p className="font-medium">{formatDate(student.joining_date)}</p></div>
              <div><p className="text-sm text-muted-foreground">Monthly Fee</p><p className="font-medium">{formatCurrency(Number(student.monthly_fee))}</p></div>
              {student.notes && <div className="sm:col-span-2"><p className="text-sm text-muted-foreground">Notes</p><p>{student.notes}</p></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Fee Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><p className="text-sm text-muted-foreground">Outstanding</p><p className="text-2xl font-bold text-destructive">{formatCurrency(totalDue)}</p></div>
              {advance && Number(advance.balance) > 0 && (
                <div><p className="text-sm text-muted-foreground">Advance Balance</p><p className="text-xl font-bold text-green-600">{formatCurrency(Number(advance.balance))}</p></div>
              )}
            </CardContent>
          </Card>
        </div>

        {batches && batches.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Batches</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {batches.map((b) => (
                  <Badge key={b.batch_id} variant="outline">
                    {rel<{ batch_name: string }>(b.batches)?.batch_name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {ledger && ledger.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Recent Fee Ledger</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Month</th>
                      <th className="py-2 text-left">Fee</th>
                      <th className="py-2 text-left">Paid</th>
                      <th className="py-2 text-left">Balance</th>
                      <th className="py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((l) => (
                      <tr key={l.id} className="border-b">
                        <td className="py-2">{formatDate(l.month_year, { month: 'long', year: 'numeric' })}</td>
                        <td className="py-2">{formatCurrency(Number(l.fee_amount) - Number(l.discount_amount))}</td>
                        <td className="py-2">{formatCurrency(Number(l.paid_amount))}</td>
                        <td className="py-2">{formatCurrency(Number(l.balance))}</td>
                        <td className="py-2"><Badge variant={l.status === 'paid' ? 'success' : l.status === 'partial' ? 'warning' : 'destructive'}>{l.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
