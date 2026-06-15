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
import { userSchema, type UserInput } from '@/lib/validations';
import { PERMISSION_MODULES } from '@/lib/permissions';

export function UserForm({ permissions }: { permissions: { code: string; name: string; module: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    defaultValues: { role: 'tutor' },
  });

  function togglePerm(code: string) {
    setSelectedPerms((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  }

  async function onSubmit(data: UserInput) {
    setLoading(true);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, permissions: selectedPerms }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? 'Failed to create user');
      return;
    }
    toast.success('User created');
    router.push('/dashboard/users');
  }

  return (
    <>
      <Header title="Create User" />
      <main className="p-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>New User</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" {...register('email')} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...register('phone')} />
                </div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select
                    value={watch('role')}
                    onChange={(e) => setValue('role', e.target.value as UserInput['role'])}
                    options={[
                      { value: 'admin', label: 'Admin' },
                      { value: 'accountant', label: 'Accountant' },
                      { value: 'tutor', label: 'Tutor' },
                    ]}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Password *</Label>
                  <Input type="password" {...register('password')} />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Custom Permissions (optional overrides)</Label>
                {Object.entries(PERMISSION_MODULES).map(([module, codes]) => (
                  <div key={module}>
                    <p className="text-sm font-medium capitalize mb-2">{module}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {permissions
                        .filter((p) => (codes as readonly string[]).includes(p.code))
                        .map((p) => (
                          <label key={p.code} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedPerms.includes(p.code)}
                              onChange={() => togglePerm(p.code)}
                            />
                            {p.name}
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
