'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Header } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { batchSchema, type BatchInput } from '@/lib/validations';

export default function NewBatchPage({ tutors }: { tutors: { id: string; name: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BatchInput>({
    resolver: zodResolver(batchSchema),
    defaultValues: { status: 'active', monthly_fee: 0 },
  });

  async function onSubmit(data: BatchInput) {
    setLoading(true);
    const res = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!res.ok) { toast.error('Failed to create batch'); return; }
    toast.success('Batch created');
    router.push('/dashboard/batches');
  }

  return (
    <>
      <Header title="Create Batch" />
      <main className="p-6 max-w-xl">
        <Card>
          <CardHeader><CardTitle>New Batch</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Batch Name *</Label>
                <Input {...register('batch_name')} placeholder="Class 10 Maths Morning" />
                {errors.batch_name && <p className="text-sm text-destructive">{errors.batch_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input {...register('subject')} />
              </div>
              <div className="space-y-2">
                <Label>Tutor</Label>
                <Select
                  value={watch('tutor_id') ?? ''}
                  onChange={(e) => setValue('tutor_id', e.target.value)}
                  placeholder="Select tutor"
                  options={tutors.map((t) => ({ value: t.id, label: t.name }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Fee (₹)</Label>
                <Input type="number" {...register('monthly_fee', { valueAsNumber: true })} />
              </div>
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Batch'}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
