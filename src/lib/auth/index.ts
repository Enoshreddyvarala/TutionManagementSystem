import { createClient } from '@/lib/supabase/server';
import type { User, PermissionCode } from '@/types';
import { hasPermission } from '@/lib/permissions';

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  return profile as User | null;
}

export async function getUserPermissions(userId: string): Promise<{ code: PermissionCode; granted: boolean }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('user_permissions')
    .select('permission_code, granted')
    .eq('user_id', userId);

  return (data ?? []).map((p) => ({
    code: p.permission_code as PermissionCode,
    granted: p.granted,
  }));
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  if (user.status === 'disabled') throw new Error('Account disabled');
  return user;
}

export async function requirePermission(permission: PermissionCode): Promise<User> {
  const user = await requireAuth();
  const customPerms = await getUserPermissions(user.id);
  if (!hasPermission(user.role, permission, customPerms)) {
    throw new Error('Forbidden');
  }
  return user;
}

export async function logAudit(
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action,
    entity,
    entity_id: entityId,
    metadata: metadata ?? {},
  });
}
