import { NextResponse } from 'next/server';
import { createSupabaseAdmin, getAuthUser } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const admin = createSupabaseAdmin();

    const { error } = await admin.from('mktplace_feira_notifications').insert({
      user_id: user.id,
      title: body.title || 'Nova Notificação',
      message: body.message || 'Esta é uma notificação de teste em tempo real.',
      link: body.link || null,
      read: false
    });

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Notificação enviada!' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
