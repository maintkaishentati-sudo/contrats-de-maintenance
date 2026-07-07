'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Wrench, Printer, History, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const linkStyle = (path) => ({
    color: pathname === path ? '#2FD4C0' : '#8B93A1',
  });

  return (
    <header className="flex items-center gap-4 px-5 py-4 max-w-5xl mx-auto flex-wrap">
      <div className="flex items-center gap-2 flex-1">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(47,212,192,0.12)', border: '1px solid rgba(47,212,192,0.35)' }}
        >
          <Wrench size={16} color="#2FD4C0" />
        </div>
        <Link href="/" className="font-mono text-sm" style={{ color: '#E7E9EC' }}>
          Contrats de maintenance
        </Link>
      </div>
      <Link href="/historique" className="text-xs flex items-center gap-1" style={linkStyle('/historique')}>
        <History size={14} /> Historique
      </Link>
      <Link href="/print" className="text-xs flex items-center gap-1" style={linkStyle('/print')}>
        <Printer size={14} /> Imprimer
      </Link>
      <button onClick={handleLogout} className="text-xs flex items-center gap-1" style={{ color: '#8B93A1' }}>
        <LogOut size={14} /> Déconnexion
      </button>
    </header>
  );
}
