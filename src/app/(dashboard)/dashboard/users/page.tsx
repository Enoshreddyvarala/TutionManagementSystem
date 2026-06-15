import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Plus } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/permissions';

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <>
      <Header title="User Management" />
      <main className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button asChild><Link href="/dashboard/users/new"><Plus className="h-4 w-4" /> Create User</Link></Button>
        </div>
        <DataTable
          data={(users ?? []) as Record<string, unknown>[]}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Role', render: (r) => ROLE_LABELS[r.role as keyof typeof ROLE_LABELS] ?? String(r.role) },
            { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'active' ? 'success' : 'destructive'}>{String(r.status)}</Badge> },
            { key: 'last_login', header: 'Last Login', render: (r) => r.last_login ? new Date(r.last_login as string).toLocaleDateString() : 'Never' },
          ]}
        />
      </main>
    </>
  );
}
