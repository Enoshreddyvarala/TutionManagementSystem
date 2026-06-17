'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { curriculumSchema, type CurriculumInput } from '@/lib/validations';

export function CurriculumForm({ batches }: { batches: { id: string; batch_name: string; subject: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CurriculumInput>({
    resolver: zodResolver(curriculumSchema),
    defaultValues: { status: 'pending', completion_percentage: 0 },
  });

  async function onSubmit(data: CurriculumInput) {
    setLoading(true);
    const res = await fetch('/api/curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error?.message ?? err.error ?? 'Failed to add topic');
      return;
    }

    toast.success('Topic added');
    router.push('/dashboard/curriculum');
    router.refresh();
  }

  function onBatchChange(batchId: string) {
    setValue('batch_id', batchId);
    const batch = batches.find((b) => b.id === batchId);
    if (batch) setValue('subject', batch.subject);
  }

  return (
    <>
      <Header title="Add Curriculum Topic" />
      <main className="p-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>New Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Batch *</Label>
                <Select
                  value={watch('batch_id') ?? ''}
                  onChange={(e) => onBatchChange(e.target.value)}
                  placeholder="Select batch"
                  options={batches.map((b) => ({ value: b.id, label: `${b.batch_name} (${b.subject})` }))}
                />
                {errors.batch_id && <p className="text-sm text-destructive">{errors.batch_id.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input {...register('subject')} />
                {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Topic *</Label>
                <Input {...register('topic')} placeholder="e.g. Quadratic Equations" />
                {errors.topic && <p className="text-sm text-destructive">{errors.topic.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={watch('status')}
                    onChange={(e) => setValue('status', e.target.value as CurriculumInput['status'])}
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'completed', label: 'Completed' },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Progress (%)</Label>
                  <Input type="number" min={0} max={100} {...register('completion_percentage', { valueAsNumber: true })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? <><Loader2 className="animate-spin" /> Saving...</> : 'Add Topic'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
