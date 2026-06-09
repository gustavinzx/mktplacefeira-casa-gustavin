'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHomePathForRole, normalizeRole } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/hooks/useCurrentUser';

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
  const { role, loading } = useCurrentUser();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
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
    })();
  }, [portalRole, router]);

  if (!ready) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  return <>{children}</>;
}
