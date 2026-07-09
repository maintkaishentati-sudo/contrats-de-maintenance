'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError('Identifiants incorrects. Vérifiez votre email et mot de passe.');
      return;
    }
    router.replace('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#14171C' }}>
      <div
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-xl p-6"
        style={{ backgroundColor: '#1D2128', border: '1px solid #333944' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(47,212,192,0.12)', border: '1px solid rgba(47,212,192,0.35)' }}
          >
            <Wrench size={18} color="#2FD4C0" />
          </div>
          <h1 className="font-mono text-lg" style={{ color: '#E7E9EC' }}>Contrats de maintenance</h1>
        </div>

        <label className="flex flex-col gap-1.5 mb-4">
          <span className="text-[11px] uppercase tracking-wider" style={{ color: '#8B93A1' }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: '#14171C', border: '1px solid #333944', color: '#E7E9EC' }}
          />
        </label>
        <label className="flex flex-col gap-1.5 mb-5">
          <span className="text-[11px] uppercase tracking-wider" style={{ color: '#8B93A1' }}>Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(e); }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: '#14171C', border: '1px solid #333944', color: '#E7E9EC' }}
          />
        </label>

        {error && <p className="text-xs mb-4" style={{ color: '#EF5350' }}>{error}</p>}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: '#2FD4C0', color: '#0A1210' }}
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </div>
    </div>
  );
}
