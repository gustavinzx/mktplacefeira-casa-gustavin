'use client';

import React from 'react';

export default function PortalPlaceholder({
  title,
  description = 'Esta área está em desenvolvimento. Em breve você poderá usar todos os recursos aqui.',
}: {
  title: string;
  description?: string;
}) {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>{title}</h1>
      <p style={{ color: '#666', lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}
