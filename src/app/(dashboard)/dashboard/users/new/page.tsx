import { createClient } from '@/lib/supabase/server';
import { UserForm } from '@/components/modules/user-form';

export default async function NewUserPage() {
  const supabase = await createClient();
  const { data: permissions } = await supabase.from('permissions').select('code, name, module').order('module');
  return <UserForm permissions={permissions ?? []} />;
}
