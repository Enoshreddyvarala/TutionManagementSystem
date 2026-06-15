import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: feeRules } = await supabase.from('fee_rules').select('*').eq('is_active', true);

  return (
    <>
      <Header title="Settings" />
      <main className="p-6 space-y-6 max-w-2xl">
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
