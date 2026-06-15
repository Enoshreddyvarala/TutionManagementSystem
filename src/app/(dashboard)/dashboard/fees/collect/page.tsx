'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Header } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { feePaymentSchema, type FeePaymentInput } from '@/lib/validations';
import { formatCurrency, toISODate } from '@/lib/utils';
import { downloadReceipt } from '@/lib/fees/receipt';
import type { Student, FeeTransaction } from '@/types';

function CollectFeeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FeePaymentInput>({
    resolver: zodResolver(feePaymentSchema),
    defaultValues: {
      payment_date: toISODate(new Date()),
      payment_mode: 'cash',
      student_id: searchParams.get('student') ?? '',
    },
  });

  const studentId = watch('student_id');

  useEffect(() => {
    fetch('/api/students?pageSize=100')
      .then((r) => r.json())
      .then((d) => setStudents(d.data ?? []));
  }, []);

  useEffect(() => {
    if (studentId) {
      const s = students.find((st) => st.id === studentId);
      setSelectedStudent(s ?? null);
    }
  }, [studentId, students]);

  async function onSubmit(data: FeePaymentInput) {
    setLoading(true);
    const res = await fetch('/api/fees/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(result.error ?? 'Payment failed');
      return;
    }

    toast.success(`Payment recorded: ${result.receipt_number}`);

    if (selectedStudent) {
      downloadReceipt({
        transaction: {
          id: result.transaction_id,
          receipt_number: result.receipt_number,
          amount: data.amount,
          payment_date: data.payment_date,
          payment_mode: data.payment_mode,
          remarks: data.remarks,
          student_id: data.student_id,
          created_at: new Date().toISOString(),
        } as FeeTransaction,
        student: selectedStudent,
        coveredMonths: result.allocations?.map((a: { month_year: string }) => a.month_year) ?? [],
      });
    }

    router.push('/dashboard/fees');
    router.refresh();
  }

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.student_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header title="Collect Fee" />
      <main className="p-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Record Payment</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Search Student</Label>
                <Input placeholder="Search by name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Student *</Label>
                <Select
                  value={studentId}
                  onChange={(e) => setValue('student_id', e.target.value)}
                  placeholder="Select student"
                  options={filtered.map((s) => ({ value: s.id, label: `${s.name} (${s.student_code})` }))}
                />
                {errors.student_id && <p className="text-sm text-destructive">{errors.student_id.message}</p>}
              </div>

              {selectedStudent && (
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p>Monthly Fee: <strong>{formatCurrency(selectedStudent.monthly_fee)}</strong></p>
                  <p>Joined: {selectedStudent.joining_date}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Amount (₹) *</Label>
                  <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
                  {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Payment Mode *</Label>
                  <Select
                    value={watch('payment_mode')}
                    onChange={(e) => setValue('payment_mode', e.target.value as FeePaymentInput['payment_mode'])}
                    options={[
                      { value: 'cash', label: 'Cash' },
                      { value: 'upi', label: 'UPI' },
                      { value: 'bank_transfer', label: 'Bank Transfer' },
                      { value: 'card', label: 'Card' },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Date *</Label>
                  <Input type="date" {...register('payment_date')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Remarks</Label>
                <Input {...register('remarks')} placeholder="Optional notes" />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Processing...' : 'Collect & Generate Receipt'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default function CollectFeePage() {
  return (
    <Suspense>
      <CollectFeeForm />
    </Suspense>
  );
}
