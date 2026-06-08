import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function useRequireAuth() {
  const router = useRouter();

  return async (callback: () => void, redirectUrl?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/auth?redirect=${redirectUrl || window.location.pathname}`);
    } else {
      callback();
    }
  };
}
