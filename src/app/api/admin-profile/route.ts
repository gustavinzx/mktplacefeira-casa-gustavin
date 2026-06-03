import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { syncUserProfile, syncAdminRecord } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const userEmail = req.headers.get('x-user-email');
    
    if (!userId || !userEmail) {
      return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('mktplace_feira_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    const { data: admin } = await supabaseAdmin
      .from('mktplace_feira_admins')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        admin_nome: profile?.full_name || admin?.full_name || '',
        admin_email: profile?.email || admin?.email || userEmail,
        admin_whatsapp: profile?.phone || admin?.phone || '',
        admin_departamento: admin?.department || '',
        admin_cargo: admin?.job_role || '',
        admin_bio: admin?.bio || '',
        admin_cep: profile?.cep || admin?.cep || '',
        admin_logradouro: profile?.logradouro || admin?.logradouro || '',
        admin_numero: profile?.numero || admin?.numero || '',
        admin_complemento: profile?.complemento || admin?.complemento || '',
        admin_bairro: profile?.bairro || admin?.bairro || '',
        admin_cidade: profile?.cidade || admin?.cidade || '',
        admin_estado: profile?.estado || admin?.estado || '',
        admin_cpf: profile?.cpf || admin?.cpf || '',
        admin_data_nascimento: profile?.birth_date || admin?.birth_date || '',
        admin_genero: profile?.gender || admin?.gender || '',
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const userEmail = req.headers.get('x-user-email');
    
    if (!userId || !userEmail) {
      return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 });
    }

    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Payload inválido' }, { status: 400 });
    }

    // Sync in profiles
    await syncUserProfile({
      id: userId,
      email: body.admin_email || userEmail,
      full_name: body.admin_nome,
      phone: body.admin_whatsapp,
      user_type: 'admin',
      cep: body.admin_cep,
      logradouro: body.admin_logradouro,
      numero: body.admin_numero,
      complemento: body.admin_complemento,
      bairro: body.admin_bairro,
      cidade: body.admin_cidade,
      estado: body.admin_estado,
      cpf: body.admin_cpf,
      birth_date: body.admin_data_nascimento,
      gender: body.admin_genero,
    });

    // Sync in admins
    await syncAdminRecord({
      email: body.admin_email || userEmail,
      full_name: body.admin_nome,
      department: body.admin_departamento,
      job_role: body.admin_cargo,
      access_level: 'master', // Default or fetch from db
      phone: body.admin_whatsapp,
      bio: body.admin_bio,
      cep: body.admin_cep,
      logradouro: body.admin_logradouro,
      numero: body.admin_numero,
      complemento: body.admin_complemento,
      bairro: body.admin_bairro,
      cidade: body.admin_cidade,
      estado: body.admin_estado,
      cpf: body.admin_cpf,
      birth_date: body.admin_data_nascimento,
      gender: body.admin_genero,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
