'use client';

import React from 'react';
import PortalSidebar from '@/components/PortalSidebar';
import PortalAuthGate from '@/components/PortalAuthGate';

export default function FeiranteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalAuthGate portalRole="feirante">
      <div style={{ display: 'flex' }}>
        <PortalSidebar role="feirante" />
        <div style={{ flex: 1, marginLeft: '280px' }}>{children}</div>
      </div>
    </PortalAuthGate>
  );
}
