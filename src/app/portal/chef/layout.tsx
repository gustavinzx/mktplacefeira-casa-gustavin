'use client';

import React from 'react';
import PortalSidebar from '@/components/PortalSidebar';
import PortalAuthGate from '@/components/PortalAuthGate';

export default function ChefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalAuthGate portalRole="chef">
      <div style={{ display: 'flex' }}>
        <PortalSidebar role="chef" />
        <div style={{ flex: 1, marginLeft: '280px' }}>{children}</div>
      </div>
    </PortalAuthGate>
  );
}
