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
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { studentSchema, type StudentInput } from '@/lib/validations';
import { toISODate } from '@/lib/utils';

export function StudentForm({ batches = [], defaultValues }: {
  batches?: { id: string; batch_name: string }[];
  defaultValues?: Partial<StudentInput> & { id?: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!defaultValues?.id;

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      joining_date: toISODate(new Date()),
      monthly_fee: 1500,
      status: 'active',
      ...defaultValues,
    },
  });

  async function onSubmit(data: StudentInput) {
    setLoading(true);
    const url = isEdit ? `/api/students/${defaultValues?.id}` : '/api/students';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? 'Failed to save student');
      return;
    }

    toast.success(isEdit ? 'Student updated' : 'Student created');
    router.push('/dashboard/students');
    router.refresh();
  }

  return (
    <>
      <Header title={isEdit ? 'Edit Student' : 'Add Student'} />
      <main className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Student' : 'New Student'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Full Name *</Label>
                  <Input {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...register('phone')} />
                </div>
                <div className="space-y-2">
                  <Label>Parent Contact</Label>
                  <Input {...register('parent_contact')} />
                </div>
                <div className="space-y-2">
                  <Label>Joining Date *</Label>
                  <Input type="date" {...register('joining_date')} />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Fee (₹) *</Label>
                  <Input type="number" {...register('monthly_fee', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={watch('status')}
                    onChange={(e) => setValue('status', e.target.value as StudentInput['status'])}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                      { value: 'archived', label: 'Archived' },
                    ]}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea {...register('notes')} rows={3} />
              </div>
              {batches.length > 0 && (
                <div className="space-y-2">
                  <Label>Assign to Batches</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {batches.map((b) => (
                      <label key={b.id} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" value={b.id} {...register('batch_ids')} />
                        {b.batch_name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? <><Loader2 className="animate-spin" /> Saving...</> : isEdit ? 'Update' : 'Create Student'}
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
