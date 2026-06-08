'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getHomePathForRole, normalizeRole } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

/** Atalho antigo: /portal → painel do perfil logado. */
export default function PortalRootPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        router.replace('/login?next=/portal');
        return;
      }
      const role = normalizeRole(localStorage.getItem('user_role'));
      router.replace(getHomePathForRole(role));
    })();
  }, [router]);

  return (
    <div style={{ padding: 48, textAlign: 'center', color: '#707a6b' }}>
      Redirecionando…
    </div>
  );
}
