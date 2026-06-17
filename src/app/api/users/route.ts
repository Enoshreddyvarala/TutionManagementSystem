import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, logAudit, requireAuth } from '@/lib/auth';
import { userSchema } from '@/lib/validations';

export async function GET() {
  try {
    await requirePermission('user_manage');
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('*').order('name');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requirePermission('user_manage');
    const body = await request.json();
    const parsed = userSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { name, email, phone, role, password, permissions } = parsed.data;
    if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 });

    const admin = createAdminClient();
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

    const supabase = await createClient();
    await supabase.from('users').update({
      name, phone, role, created_by: currentUser.id,
    }).eq('id', authUser.user.id);

    if (permissions?.length) {
      await supabase.from('user_permissions').insert(
        permissions.map((code: string) => ({
          user_id: authUser.user.id,
          permission_code: code,
          granted: true,
          granted_by: currentUser.id,
        }))
      );
    }

    await logAudit('user_created', 'users', authUser.user.id, { email, role });
    return NextResponse.json({ id: authUser.user.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();
    const { name } = body;
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('users')
      .update({ name: name.trim() })
      .eq('id', currentUser.id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: { name: name.trim() },
    });

    if (authUpdateError) {
      console.error('Failed to update auth metadata:', authUpdateError.message);
    }

    await logAudit('user_updated_profile', 'users', currentUser.id, { name: name.trim() });
    return NextResponse.json({ success: true, name: name.trim() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

