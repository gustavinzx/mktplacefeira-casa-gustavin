import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logAudit } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, atacadista, varejista } = body;

    const isAtacadista = role === 'atacadista';
    const data = isAtacadista ? atacadista : varejista;

    // 1. Create user in auth bypassing the normal signup flow
    // In our schema: id UUID REFERENCES auth.users(id) ON DELETE CASCADE
    // We cannot create a profile without an auth.user!
    // Since this is the admin environment, let's create the user directly in auth using admin API
    const email = data.email || `${Date.now()}@feirante.com`;
    const password = 'Password123!';
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role }
    });

    if (authError) {
      throw new Error(`Auth Error: ${authError.message}`);
    }

    const userId = authData.user.id;

    // 2. The profile is automatically created by the trigger!
    // But we need to update it with full details.
    const { error: profileError } = await supabaseAdmin
      .from('mktplace_feira_profiles')
      .update({
        full_name: data.name || (isAtacadista ? data.fantasyName : ''),
        phone: data.phone || null,
        cpf_cnpj: data.cnpj || data.cpfCnpj || null,
        role: role,
        status: 'pending',
      })
      .eq('id', userId);

    if (profileError) {
      throw new Error(`Profile Error: ${profileError.message}`);
    }

    // 3. Create Producer
    // Map fairs -> For now just picking the first one
    const fairId = data.fairIds?.[0] || null;

    const { error: producerError } = await supabaseAdmin
      .from('mktplace_feira_producers')
      .insert({
        id: userId,
        fair_id: fairId,
        stall_name: isAtacadista ? (data.fantasyName || data.name) : data.name,
        specialty: data.category,
        operating_days: ['Sábado', 'Domingo'],
        payment_methods: ['Pix', 'Cartão'],
        rating: 5.0,
      });

    if (producerError) {
      throw new Error(`Producer Error: ${producerError.message}`);
    }

    // 4. Log audit
    await logAudit({
      user_id: 'SYSTEM',
      action: `CREATED_${role.toUpperCase()}`,
      module: 'GESTAO',
      details: { new_id: userId, name: data.name }
    });

    return NextResponse.json({ success: true, id: userId });
  } catch (error: any) {
    console.error('API /feirantes POST erro:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
