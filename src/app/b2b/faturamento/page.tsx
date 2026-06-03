'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FaturamentoRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/b2b?tab=faturamento');
  }, [router]);

  return null;
}
