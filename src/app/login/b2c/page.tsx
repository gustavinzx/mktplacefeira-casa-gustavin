'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Rota legada — redireciona para /login com o mesmo layout corrigido. */
export default function LoginB2cRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const q = window.location.search;
    router.replace(q ? `/login${q}` : '/login');
  }, [router]);

  return (
    <div style={{ padding: 48, textAlign: 'center', color: '#707a6b' }}>
      Redirecionando…
    </div>
  );
}
