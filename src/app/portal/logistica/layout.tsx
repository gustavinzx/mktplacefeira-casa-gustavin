'use client';

import React from 'react';
import PortalSidebar from '@/components/PortalSidebar';
import PortalAuthGate from '@/components/PortalAuthGate';

export default function LogisticaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalAuthGate portalRole="logistica">
      <div style={{ display: 'flex' }}>
        <PortalSidebar role="logistica" />
        <div style={{ flex: 1, marginLeft: '280px' }}>{children}</div>
      </div>
    </PortalAuthGate>
  );
}
