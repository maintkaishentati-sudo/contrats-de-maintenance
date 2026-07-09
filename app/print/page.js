'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { computeStatus, computeVisitStatus } from '@/lib/contracts';
import AuthGuard from '@/components/AuthGuard';
import NavBar from '@/components/NavBar';
import { Printer } from 'lucide-react';

export default function PrintPage() {
  return (
    <AuthGuard>
      <PrintView />
    </AuthGuard>
  );
}

function PrintView() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('contracts')
        .select('*')
        .eq('statut', 'actif')
        .order('date_fin', { ascending: true });
      setContracts(data || []);
      setLoading(false);
    })();
  }, []);

  const upcomingVisits = contracts
    .map((c) => ({ c, visit: computeVisitStatus(c) }))
    .filter((x) => x.visit && x.visit.days <= 90)
    .sort((a, b) => a.visit.days - b.visit.days);

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#14171C' }}>
      <div className="no-print">
        <NavBar />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6 no-print">
          <h1 className="font-mono text-base" style={{ color: '#E7E9EC' }}>Aperçu avant impression</h1>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#2FD4C0', color: '#0A1210' }}
          >
            <Printer size={16} /> Imprimer
          </button>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: '#8B93A1' }}>Chargement…</p>
        ) : (
          <div className="print-content">
            <h1 className="print-title">État des contrats de maintenance</h1>
            <p className="print-subtitle">Généré le {new Date().toLocaleDateString('fr-FR')}</p>

            <h2 className="print-h2">Contrats actifs ({contracts.length})</h2>
            <table className="print-table">
              <thead>
                <tr>
                  <th>Société</th>
                  <th>Objet</th>
                  <th>Fin de contrat</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => {
                  const st = computeStatus(c);
                  return (
                    <tr key={c.id}>
                      <td>{c.societe}</td>
                      <td>{c.objet}{c.equipement ? ` (${c.equipement})` : ''}</td>
                      <td>{c.date_fin}</td>
                      <td>{st.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <h2 className="print-h2">Visites à programmer (90 prochains jours)</h2>
            {upcomingVisits.length === 0 ? (
              <p className="print-empty">Aucune visite à prévoir dans les 90 prochains jours.</p>
            ) : (
              <table className="print-table">
                <thead>
                  <tr>
                    <th>Société</th>
                    <th>Équipement / objet</th>
                    <th>Date de visite</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingVisits.map(({ c, visit }) => (
                    <tr key={c.id}>
                      <td>{c.societe}</td>
                      <td>{c.equipement || c.objet}</td>
                      <td>{visit.date.toLocaleDateString('fr-FR')}</td>
                      <td>{visit.days < 0 ? `En retard de ${Math.abs(visit.days)}j` : `Dans ${visit.days}j`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
