'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHomePathForRole, normalizeRole } from '@/lib/profile';

export type PortalRole = 'feirante' | 'chef' | 'logistica';

const ALLOWED_ROLES: Record<PortalRole, string[]> = {
  feirante: ['feirante'],
  chef: ['chef'],
  logistica: ['admin', 'logistica'],
};

export default function PortalAuthGate({
  portalRole,
  children,
}: {
  portalRole: PortalRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = normalizeRole(localStorage.getItem('user_role'));

    if (!token) {
      const next = encodeURIComponent(window.location.pathname);
      router.replace(`/login?next=${next}`);
      return;
    }

    const allowed = ALLOWED_ROLES[portalRole];
    if (!allowed.includes(role)) {
      router.replace(getHomePathForRole(role));
      return;
    }

    setReady(true);
  }, [portalRole, router]);

  if (!ready) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#707a6b' }}>
        Carregando painel…
      </div>
    );
  }

  return <>{children}</>;
}
