'use client';

import React from 'react';
import PortalSidebar from '@/components/PortalSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex' }}>
      <PortalSidebar role="admin" />
      <div style={{ flex: 1, marginLeft: '280px' }}>
        {children}
      </div>
    </div>
  );
}
