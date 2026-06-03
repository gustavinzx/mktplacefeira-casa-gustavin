import { getTable, saveTable } from '@/lib/json-db';
import { ok, err } from '@/lib/supabase-server';

export async function GET() {
  try {
    const planos = getTable('planos');
    return ok(planos);
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const planos = getTable('planos');
    const newPlano = { ...body, id: Math.random().toString(36).substring(7) };
    planos.push(newPlano);
    saveTable('planos', planos);
    return ok(newPlano, 201);
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const planos = getTable('planos');
    const index = planos.findIndex((p: any) => p.id === body.id);
    if (index >= 0) {
      planos[index] = body;
      saveTable('planos', planos);
      return ok(planos[index]);
    }
    return err('Plano não encontrado', 404);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
