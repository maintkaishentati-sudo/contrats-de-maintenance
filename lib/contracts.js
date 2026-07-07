// Fonctions de calcul partagées : échéances de contrat et visites périodiques

export function daysBetween(a, b) {
  const MS = 1000 * 60 * 60 * 24;
  return Math.round((b - a) / MS);
}

export function parseDate(s) {
  if (!s) return null;
  const d = new Date(s + 'T00:00:00');
  return isNaN(d) ? null : d;
}

// Détermine la date qui compte réellement : la date de fin, ou -- en cas de
// reconduction tacite -- la date limite pour envoyer le préavis de résiliation.
export function computeKeyDate(c) {
  const fin = parseDate(c.date_fin);
  if (!fin) return null;
  if (c.reconduction_tacite && Number(c.preavis_jours) > 0) {
    const key = new Date(fin);
    key.setDate(key.getDate() - Number(c.preavis_jours));
    return key;
  }
  return fin;
}

export function computeStatus(c) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const keyDate = computeKeyDate(c);
  if (!keyDate) return { code: 'unknown', label: 'Date manquante', days: null };
  const days = daysBetween(today, keyDate);
  if (days < 0) {
    return c.reconduction_tacite
      ? { code: 'expired', label: 'Préavis dépassé', days }
      : { code: 'expired', label: 'Expiré', days };
  }
  if (days <= 30) return { code: 'urgent', label: c.reconduction_tacite ? 'Préavis urgent' : 'Échéance proche', days };
  if (days <= 90) return { code: 'warn', label: c.reconduction_tacite ? 'Préavis à prévoir' : 'À surveiller', days };
  return { code: 'ok', label: 'À jour', days };
}

// Calcule la prochaine visite périodique à partir de la dernière visite
// (ou de la date de début du contrat si aucune visite n'a encore été loggée).
// Si la date calculée est déjà passée, elle est affichée comme "en retard"
// plutôt que d'être silencieusement décalée vers le futur.
export function computeNextVisit(c) {
  const freq = Number(c.visites_par_an);
  if (!freq || freq <= 0) return null;
  const base = parseDate(c.derniere_visite) || parseDate(c.date_debut);
  if (!base) return null;
  const intervalDays = Math.max(1, Math.round(365 / freq));
  const next = new Date(base);
  next.setDate(next.getDate() + intervalDays);
  return next;
}

export function computeVisitStatus(c) {
  const next = computeNextVisit(c);
  if (!next) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = daysBetween(today, next);
  let code = 'ok';
  if (days < 0) code = 'expired';
  else if (days <= 7) code = 'urgent';
  else if (days <= 30) code = 'warn';
  return { code, days, date: next };
}

export const STATUS_STYLES = {
  ok: { fg: '#3ECF8E', bg: 'rgba(62,207,142,0.12)', border: 'rgba(62,207,142,0.35)' },
  warn: { fg: '#F2A93B', bg: 'rgba(242,169,59,0.12)', border: 'rgba(242,169,59,0.35)' },
  urgent: { fg: '#EF5350', bg: 'rgba(239,83,80,0.14)', border: 'rgba(239,83,80,0.4)' },
  expired: { fg: '#EF5350', bg: 'rgba(239,83,80,0.18)', border: 'rgba(239,83,80,0.5)' },
  unknown: { fg: '#8B93A1', bg: 'rgba(139,147,161,0.12)', border: 'rgba(139,147,161,0.3)' },
};
