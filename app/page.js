'use client';
import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, AlertTriangle, CheckCircle2, Clock, Bell, CalendarClock, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { computeStatus, computeVisitStatus, STATUS_STYLES } from '@/lib/contracts';
import { Modal, Field, StatusGauge, VisitBadge, inputStyle } from '@/components/ui';
import AuthGuard from '@/components/AuthGuard';
import NavBar from '@/components/NavBar';

const emptyForm = {
  id: null,
  societe: '',
  equipement: '',
  objet: '',
  date_debut: '',
  date_fin: '',
  montant: '',
  reconduction_tacite: false,
  preavis_jours: 90,
  visites_par_an: 0,
  derniere_visite: '',
  notes: '',
};

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}

function Dashboard() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [lifecycleContract, setLifecycleContract] = useState(null);

  useEffect(() => {
    loadContracts();
  }, []);

  async function loadContracts() {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('contracts')
      .select('*')
      .eq('statut', 'actif')
      .order('date_fin', { ascending: true });
    if (fetchError) setError(fetchError.message);
    else setContracts(data || []);
    setLoading(false);
  }

  function openAdd() {
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(c) {
    setForm({ ...emptyForm, ...c, montant: c.montant ?? '' });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.societe.trim()) return setFormError('Le nom de la société est obligatoire.');
    if (!form.objet.trim()) return setFormError("L'objet du contrat est obligatoire.");
    if (!form.date_fin) return setFormError('La date de fin est obligatoire.');
    setFormError('');

    const payload = {
      societe: form.societe,
      equipement: form.equipement || null,
      objet: form.objet,
      date_debut: form.date_debut || null,
      date_fin: form.date_fin,
      montant: form.montant ? Number(form.montant) : null,
      reconduction_tacite: form.reconduction_tacite,
      preavis_jours: Number(form.preavis_jours) || 90,
      visites_par_an: Number(form.visites_par_an) || 0,
      derniere_visite: form.derniere_visite || null,
      notes: form.notes || null,
    };

    if (form.id) {
      const { error: updError } = await supabase.from('contracts').update(payload).eq('id', form.id);
      if (updError) return setFormError(updError.message);
    } else {
      const { error: insError } = await supabase.from('contracts').insert([{ ...payload, statut: 'actif' }]);
      if (insError) return setFormError(insError.message);
    }
    setModalOpen(false);
    loadContracts();
  }

  async function handleDelete(id) {
    const { error: delError } = await supabase.from('contracts').delete().eq('id', id);
    if (delError) setError(delError.message);
    setConfirmDelete(null);
    loadContracts();
  }

  async function handleMarkVisit(id) {
    const today = new Date().toISOString().slice(0, 10);
    const { error: updError } = await supabase.from('contracts').update({ derniere_visite: today }).eq('id', id);
    if (updError) setError(updError.message);
    loadContracts();
  }

  const stats = useMemo(() => {
    const s = { ok: 0, warn: 0, urgent: 0, expired: 0, visitesProches: 0 };
    contracts.forEach((c) => {
      const st = computeStatus(c).code;
      if (s[st] !== undefined) s[st]++;
      const vs = computeVisitStatus(c);
      if (vs && (vs.code === 'urgent' || vs.code === 'warn' || vs.code === 'expired')) s.visitesProches++;
    });
    return s;
  }, [contracts]);

  const filtered = useMemo(() => {
    let list = [...contracts];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.societe.toLowerCase().includes(q) ||
          c.objet.toLowerCase().includes(q) ||
          (c.equipement || '').toLowerCase().includes(q)
      );
    }
    if (filter !== 'all') list = list.filter((c) => computeStatus(c).code === filter);
    return list;
  }, [contracts, search, filter]);

  return (
    <AuthGuard>
      <div className="min-h-screen w-full" style={{ backgroundColor: '#14171C', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <NavBar />
        <div className="max-w-5xl mx-auto px-5 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {[
              { key: 'ok', label: 'À jour', icon: CheckCircle2 },
              { key: 'warn', label: 'À surveiller', icon: Bell },
              { key: 'urgent', label: 'Urgent', icon: AlertTriangle },
              { key: 'expired', label: 'Expiré / dépassé', icon: Clock },
            ].map(({ key, label, icon: Icon }) => {
              const style = STATUS_STYLES[key];
              return (
                <button
                  key={key}
                  onClick={() => setFilter(filter === key ? 'all' : key)}
                  className="rounded-lg p-3 text-left transition-all"
                  style={{
                    backgroundColor: filter === key ? style.bg : '#1D2128',
                    border: `1px solid ${filter === key ? style.border : '#333944'}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon size={14} color={style.fg} />
                    <span className="font-mono text-lg" style={{ color: '#E7E9EC' }}>{stats[key]}</span>
                  </div>
                  <span className="text-[11px]" style={{ color: '#8B93A1' }}>{label}</span>
                </button>
              );
            })}
            <div className="rounded-lg p-3 text-left" style={{ backgroundColor: '#1D2128', border: '1px solid #333944' }}>
              <div className="flex items-center justify-between mb-1">
                <CalendarClock size={14} color="#8FA3FF" />
                <span className="font-mono text-lg" style={{ color: '#E7E9EC' }}>{stats.visitesProches}</span>
              </div>
              <span className="text-[11px]" style={{ color: '#8B93A1' }}>Visites à prévoir</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="#8B93A1" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une société, un équipement…"
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#2FD4C0', color: '#0A1210' }}
            >
              <Plus size={16} /> Nouveau contrat
            </button>
          </div>

          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="text-xs mb-4 underline" style={{ color: '#8B93A1' }}>
              Réinitialiser le filtre
            </button>
          )}

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(239,83,80,0.12)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.35)' }}>
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-sm" style={{ color: '#8B93A1' }}>Chargement…</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg p-8 text-center" style={{ backgroundColor: '#1D2128', border: '1px dashed #333944' }}>
              <p className="text-sm mb-1" style={{ color: '#E7E9EC' }}>
                {contracts.length === 0 ? 'Aucun contrat actif' : 'Aucun résultat'}
              </p>
              <p className="text-xs" style={{ color: '#8B93A1' }}>
                {contracts.length === 0 ? 'Ajoutez votre premier contrat de maintenance.' : 'Essayez une autre recherche ou réinitialisez le filtre.'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #333944' }}>
              {filtered.map((c, i) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5"
                  style={{ backgroundColor: '#1D2128', borderTop: i === 0 ? 'none' : '1px solid #262B34' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: '#E7E9EC' }}>{c.societe}</span>
                      {c.reconduction_tacite && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: '#8B93A1', border: '1px solid #333944' }}>
                          Reconduction tacite · préavis {c.preavis_jours}j
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#8B93A1' }}>
                      {c.objet}{c.equipement ? ` · ${c.equipement}` : ''}
                    </p>
                    <p className="text-[11px] mt-1 font-mono" style={{ color: '#5A626E' }}>
                      {c.date_debut || '?'} → {c.date_fin}{c.montant ? ` · ${Number(c.montant).toLocaleString('fr-FR')} €` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <StatusGauge c={c} />
                    <VisitBadge c={c} onMarkDone={handleMarkVisit} />
                  </div>
                  <div className="flex gap-1 sm:ml-2">
                    <button onClick={() => setLifecycleContract(c)} title="Renouveler / résilier / changer de prestataire" className="p-2 rounded-lg hover:bg-white/5" style={{ color: '#8B93A1' }}>
                      <RefreshCw size={15} />
                    </button>
                    <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-white/5" style={{ color: '#8B93A1' }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setConfirmDelete(c.id)} className="p-2 rounded-lg hover:bg-white/5" style={{ color: '#8B93A1' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {modalOpen && (
          <Modal title={form.id ? 'Modifier le contrat' : 'Nouveau contrat'} onClose={() => setModalOpen(false)}>
            <div className="flex flex-col gap-4">
              <Field label="Société">
                <input value={form.societe} onChange={(e) => setForm({ ...form, societe: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} placeholder="Ex : Boulangerie Martin" />
              </Field>
              <Field label="Équipement concerné (optionnel)">
                <input value={form.equipement} onChange={(e) => setForm({ ...form, equipement: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} placeholder="Ex : Climatiseur bâtiment A" />
              </Field>
              <Field label="Objet du contrat">
                <input value={form.objet} onChange={(e) => setForm({ ...form, objet: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} placeholder="Ex : Maintenance climatisation" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date de début">
                  <input type="date" value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
                </Field>
                <Field label="Date de fin">
                  <input type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
                </Field>
              </div>
              <Field label="Montant annuel (€, optionnel)">
                <input type="number" min="0" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} placeholder="Ex : 1200" />
              </Field>
              <label className="flex items-center gap-2 text-sm" style={{ color: '#E7E9EC' }}>
                <input type="checkbox" checked={form.reconduction_tacite} onChange={(e) => setForm({ ...form, reconduction_tacite: e.target.checked })} className="w-4 h-4" />
                Reconduction tacite
              </label>
              {form.reconduction_tacite && (
                <Field label="Préavis à respecter (jours avant la fin)">
                  <input type="number" min="1" value={form.preavis_jours} onChange={(e) => setForm({ ...form, preavis_jours: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
                </Field>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Visites par an">
                  <input type="number" min="0" value={form.visites_par_an} onChange={(e) => setForm({ ...form, visites_par_an: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} placeholder="Ex : 2" />
                </Field>
                <Field label="Dernière visite (optionnel)">
                  <input type="date" value={form.derniere_visite} onChange={(e) => setForm({ ...form, derniere_visite: e.target.value })} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
                </Field>
              </div>
              <Field label="Notes (optionnel)">
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="px-3 py-2 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
              </Field>
              {formError && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(239,83,80,0.12)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.35)' }}>
                  {formError}
                </p>
              )}
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#8B93A1', border: '1px solid #333944' }}>Annuler</button>
                <button type="button" onClick={handleSubmit} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#2FD4C0', color: '#0A1210' }}>
                  {form.id ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {confirmDelete && (
          <Modal title="Supprimer ce contrat ?" onClose={() => setConfirmDelete(null)}>
            <p className="text-sm mb-4" style={{ color: '#8B93A1' }}>Cette action est définitive.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#8B93A1', border: '1px solid #333944' }}>Annuler</button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#EF5350', color: '#1D0B0B' }}>Supprimer</button>
            </div>
          </Modal>
        )}

        {lifecycleContract && (
          <LifecycleModal
            contract={lifecycleContract}
            onClose={() => setLifecycleContract(null)}
            onDone={() => { setLifecycleContract(null); loadContracts(); }}
          />
        )}
      </div>
    </AuthGuard>
  );
}

function LifecycleModal({ contract, onClose, onDone }) {
  const [action, setAction] = useState('renouvellement');
  const [motif, setMotif] = useState('');
  const [dateFin, setDateFin] = useState(new Date().toISOString().slice(0, 10));
  const [newSociete, setNewSociete] = useState(contract.societe);
  const [newDateDebut, setNewDateDebut] = useState(new Date().toISOString().slice(0, 10));
  const [newDateFin, setNewDateFin] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isRenewalLike = action === 'renouvellement' || action === 'changement';

  async function handleConfirm() {
    setError('');
    if (isRenewalLike && !newDateFin) {
      setError('Indiquez la date de fin du nouveau contrat.');
      return;
    }
    if ((action === 'resiliation' || action === 'autre') && !motif.trim()) {
      setError('Indiquez la raison.');
      return;
    }
    setSaving(true);

    const statutMap = {
      renouvellement: 'renouvelé',
      changement: 'terminé',
      resiliation: 'résilié',
      autre: 'terminé',
    };
    const motifMap = {
      renouvellement: 'Renouvellement',
      changement: 'Changement de prestataire',
      resiliation: motif || 'Résiliation',
      autre: motif || 'Autre',
    };

    const { data: closedRow, error: closeError } = await supabase
      .from('contracts')
      .update({ statut: statutMap[action], motif_fin: motifMap[action], date_fin: dateFin })
      .eq('id', contract.id)
      .select()
      .single();

    if (closeError) {
      setError(closeError.message);
      setSaving(false);
      return;
    }

    if (isRenewalLike) {
      const { error: insError } = await supabase.from('contracts').insert([{
        societe: action === 'changement' ? newSociete : contract.societe,
        equipement: contract.equipement,
        objet: contract.objet,
        date_debut: newDateDebut,
        date_fin: newDateFin,
        montant: contract.montant,
        reconduction_tacite: contract.reconduction_tacite,
        preavis_jours: contract.preavis_jours,
        visites_par_an: contract.visites_par_an,
        derniere_visite: null,
        notes: contract.notes,
        statut: 'actif',
        contrat_precedent_id: closedRow?.id || contract.id,
      }]);
      if (insError) {
        setError(insError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    onDone();
  }

  return (
    <Modal title={`Clôturer : ${contract.societe}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Field label="Que se passe-t-il avec ce contrat ?">
          <select value={action} onChange={(e) => setAction(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
            <option value="renouvellement">Renouvellement (même société)</option>
            <option value="changement">Changement de prestataire</option>
            <option value="resiliation">Résiliation</option>
            <option value="autre">Autre fin de contrat</option>
          </select>
        </Field>
        <Field label="Date de fin effective de l'ancien contrat">
          <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
        </Field>
        {(action === 'resiliation' || action === 'autre') && (
          <Field label="Raison">
            <textarea value={motif} onChange={(e) => setMotif(e.target.value)} rows={2} className="px-3 py-2 rounded-lg text-sm outline-none resize-none" style={inputStyle} placeholder="Ex : équipement remplacé, budget, insatisfaction…" />
          </Field>
        )}
        {isRenewalLike && (
          <div className="pt-2 flex flex-col gap-4" style={{ borderTop: '1px solid #333944' }}>
            <p className="text-xs" style={{ color: '#8B93A1' }}>Nouveau contrat pour le même équipement :</p>
            {action === 'changement' && (
              <Field label="Nouvelle société">
                <input value={newSociete} onChange={(e) => setNewSociete(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nouvelle date de début">
                <input type="date" value={newDateDebut} onChange={(e) => setNewDateDebut(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
              </Field>
              <Field label="Nouvelle date de fin">
                <input type="date" value={newDateFin} onChange={(e) => setNewDateFin(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
              </Field>
            </div>
          </div>
        )}
        {error && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(239,83,80,0.12)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.35)' }}>
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#8B93A1', border: '1px solid #333944' }}>Annuler</button>
          <button onClick={handleConfirm} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50" style={{ backgroundColor: '#2FD4C0', color: '#0A1210' }}>
            {saving ? 'Enregistrement…' : 'Confirmer'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
