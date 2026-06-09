'use client';

import React, { useState, useEffect } from 'react';
import PortalSidebar from '@/components/PortalSidebar';
import { Bell, Search, HelpCircle, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PortalTopbar from '@/components/PortalTopbar';

export default function UsuarioLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8f9f8]">
      <PortalSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:ml-[280px]">
        {/* Topbar */}
        <PortalTopbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
