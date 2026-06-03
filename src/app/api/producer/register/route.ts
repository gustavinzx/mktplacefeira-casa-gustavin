import { createSupabaseAdmin, TABLE, ok, err } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { id, stall_name, document } = await request.json();

    if (!id || !stall_name) {
      return err('id and stall_name are required', 400);
    }

    const admin = createSupabaseAdmin();

    const { data, error } = await admin
      .from(TABLE.producers)
      .insert({
        id,
        stall_name,
        document: document || null,
        status: 'pending', // Requires admin approval
      })
      .select()
      .single();

    if (error) {
      return err(error.message, 500);
    }

    return ok(data, 201);
  } catch (error: any) {
    return err(`Internal error: ${error.message}`, 500);
  }
}
