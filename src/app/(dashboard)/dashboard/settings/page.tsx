import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { Header } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/permissions';

export default async function SettingsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: feeRules } = await supabase.from('fee_rules').select('*').eq('is_active', true);

  return (
    <>
      <Header title="Settings" />
      <main className="p-6 space-y-6 max-w-2xl">
        {user && (
          <Card>
            <CardHeader><CardTitle>My Account</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role (from database)</span>
                <Badge variant={user.role === 'super_admin' ? 'success' : 'secondary'}>
                  {ROLE_LABELS[user.role]}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
              {user.role !== 'super_admin' && (
                <p className="mt-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                  If you promoted yourself in Supabase SQL but still see Tutor here, run the SQL fix below
                  using your <strong>User ID</strong> above, then log out and log back in.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Fee Rules</CardTitle></CardHeader>
          <CardContent>
            {feeRules?.map((rule) => (
              <div key={rule.id} className="space-y-2 rounded-lg border p-4">
                <p className="font-medium">{rule.name}</p>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <p>Due Day: {rule.due_day}th of month</p>
                  <p>Late Fee: {formatCurrency(Number(rule.late_fee_amount))}</p>
                  <p>Grace Period: {rule.grace_period_days} days</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>System Info</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Version: 1.0.0</p>
            <p>Environment: {process.env.NODE_ENV}</p>
            <p>Notifications: Email, WhatsApp, SMS (coming soon)</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
