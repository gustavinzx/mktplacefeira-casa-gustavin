import { createSupabaseAdmin, TABLE, ok, err } from '@/lib/supabase-server';

export async function GET() {
  const admin = createSupabaseAdmin();
  try {
    const { data, error } = await admin.from('mktplace_feira_site_settings').select('key, value');
    
    if (error) throw error;

    const settings: Record<string, any> = {};
    data?.forEach(item => {
      settings[item.key] = item.value;
    });

    return ok(settings);
  } catch (error: any) {
    return err(error.message || 'Erro ao carregar configurações');
  }
}
