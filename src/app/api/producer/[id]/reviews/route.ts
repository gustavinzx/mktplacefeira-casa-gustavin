import { ok, err, getAuthUser } from '@/lib/supabase-server';
import { getTable, saveTable } from '@/lib/json-db';

const DB_KEY = 'producer_reviews';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const producerId = resolvedParams.id;
  
  const user = await getAuthUser(request);
  if (!user) return err('Não autenticado', 401);

  const body = await request.json();
  const { rating, comment } = body;

  if (!rating || rating < 1 || rating > 5) {
    return err('Nota inválida. Escolha de 1 a 5.', 400);
  }

  // Load from DB
  const reviewsDb: any = getTable(DB_KEY) || {};
  
  if (!reviewsDb[producerId]) {
    reviewsDb[producerId] = [];
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    user_id: user.id,
    producer_id: producerId,
    rating,
    comment,
    created_at: new Date().toISOString()
  };

  reviewsDb[producerId].push(newReview);
  saveTable(DB_KEY, reviewsDb);

  return ok({ message: 'Avaliação enviada com sucesso', review: newReview });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const producerId = resolvedParams.id;
  
  const reviewsDb: any = getTable(DB_KEY) || {};
  const reviews = reviewsDb[producerId] || [];
  
  return ok({ reviews });
}
