'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AuthGuard from '@/components/AuthGuard';
import NavBar from '@/components/NavBar';

export default function HistoriquePage() {
  return (
    <AuthGuard>
      <Historique />
    </AuthGuard>
  );
}

function Historique() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('contracts')
        .select('*')
        .neq('statut', 'actif')
        .order('date_fin', { ascending: false });
      setRows(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#14171C', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <NavBar />
      <div className="max-w-5xl mx-auto px-5 pb-8">
        <h1 className="font-mono text-base mb-4" style={{ color: '#E7E9EC' }}>Historique des contrats</h1>
        {loading ? (
          <p className="text-sm" style={{ color: '#8B93A1' }}>Chargement…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm" style={{ color: '#8B93A1' }}>Aucun contrat clôturé pour l'instant.</p>
        ) : (
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #333944' }}>
            {rows.map((c, i) => (
              <div key={c.id} className="px-4 py-3.5" style={{ backgroundColor: '#1D2128', borderTop: i === 0 ? 'none' : '1px solid #262B34' }}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-semibold" style={{ color: '#E7E9EC' }}>{c.societe}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded" style={{ color: '#8B93A1', border: '1px solid #333944' }}>{c.statut}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: '#8B93A1' }}>{c.objet}{c.equipement ? ` · ${c.equipement}` : ''}</p>
                <p className="text-[11px] mt-1 font-mono" style={{ color: '#5A626E' }}>{c.date_debut} → {c.date_fin}</p>
                {c.motif_fin && <p className="text-xs mt-1.5" style={{ color: '#F2A93B' }}>Motif : {c.motif_fin}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
