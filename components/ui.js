'use client';
import { X, CalendarClock, CheckCircle2 } from 'lucide-react';
import { computeStatus, computeVisitStatus, STATUS_STYLES } from '@/lib/contracts';

export const inputStyle = {
  backgroundColor: '#14171C',
  border: '1px solid #333944',
  color: '#E7E9EC',
};

export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: '#8B93A1' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

export function Modal({ children, onClose, title }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10,12,15,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#1D2128', border: '1px solid #333944', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid #333944' }}>
          <h2 className="font-mono text-sm tracking-wide" style={{ color: '#E7E9EC' }}>{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5" style={{ color: '#8B93A1' }}>
            <X size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto min-h-0" style={{ flex: '1 1 auto' }}>{children}</div>
      </div>
    </div>
  );
}

export function StatusGauge({ c }) {
  const status = computeStatus(c);
  const style = STATUS_STYLES[status.code];
  return (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[11px] font-medium px-1.5 py-0.5 rounded"
          style={{ color: style.fg, backgroundColor: style.bg, border: `1px solid ${style.border}` }}
        >
          {status.label}
        </span>
        <span className="text-[11px] tabular-nums" style={{ color: style.fg }}>
          {status.days === null ? '—' : status.days < 0 ? `${Math.abs(status.days)}j dépassé` : `J-${status.days}`}
        </span>
      </div>
    </div>
  );
}

export function VisitBadge({ c, onMarkDone }) {
  const visit = computeVisitStatus(c);
  if (!visit) return null;
  const style = STATUS_STYLES[visit.code];
  const dateStr = visit.date.toLocaleDateString('fr-FR');
  return (
    <div className="flex items-center gap-2 min-w-[170px]">
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg flex-1"
        style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}
      >
        <CalendarClock size={13} color={style.fg} />
        <div className="leading-tight">
          <p className="text-[11px] font-medium" style={{ color: style.fg }}>Visite : {dateStr}</p>
          <p className="text-[10px]" style={{ color: style.fg, opacity: 0.85 }}>
            {visit.days < 0 ? `en retard de ${Math.abs(visit.days)}j` : visit.days === 0 ? "aujourd'hui" : `dans ${visit.days}j`}
          </p>
        </div>
      </div>
      {onMarkDone && (
        <button
          onClick={() => onMarkDone(c.id)}
          title="Marquer la visite comme effectuée"
          className="p-1.5 rounded-lg hover:bg-white/5"
          style={{ color: '#8B93A1', border: '1px solid #333944' }}
        >
          <CheckCircle2 size={14} />
        </button>
      )}
    </div>
  );
}
