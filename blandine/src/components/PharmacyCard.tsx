import { Link } from 'react-router-dom';
import type { Pharmacy } from '../types/pharmacy';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  variant?: 'compact' | 'featured';
  hideAvailability?: boolean;
}

export default function PharmacyCard({ pharmacy, variant = 'compact', hideAvailability = false }: PharmacyCardProps) {
  const hasReliableHours = !!pharmacy.openUntil && pharmacy.openUntil !== '--:--';

  if (variant === 'featured') {
    return (
      <div className="rounded-3xl p-6 shadow-lg relative overflow-hidden group border-none" style={{ backgroundColor: 'var(--surface-primary)' }}>
        <div className="absolute top-0 right-0 p-6">
          <span className="font-headline font-bold text-xl tracking-tight" style={{ color: 'var(--secondary)' }}>{pharmacy.distance}</span>
        </div>
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1", color: '#000000' }}>
              medical_services
            </span>
          </div>
          <div className="space-y-1 pr-16">
            <h3 className="font-headline text-2xl font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {pharmacy.name}
            </h3>
            <p className="font-medium text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{pharmacy.address}</p>
          </div>
          {!hideAvailability && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider" style={{ backgroundColor: pharmacy.isOpen ? 'rgba(0, 214, 143, 0.2)' : 'rgba(255, 77, 109, 0.2)', color: pharmacy.isOpen ? 'var(--primary)' : 'var(--accent-error)' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: pharmacy.isOpen ? 'var(--primary)' : 'var(--accent-error)' }} />
                {pharmacy.isOpen ? 'Ouvert' : 'Fermé'}
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                {pharmacy.isOpen
                  ? hasReliableHours
                    ? `Ferme à ${pharmacy.openUntil}`
                    : 'Horaires indisponibles'
                  : hasReliableHours
                    ? `Ferme à ${pharmacy.openUntil}`
                    : 'Horaires indisponibles'}
              </span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Link
              to={`/directions/${pharmacy.id}`}
              className="flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ backgroundColor: 'var(--primary)', color: '#000000' }}
            >
              <span className="material-symbols-outlined text-xl">directions</span>
              Itinéraire
            </Link>
            <button className="w-12 h-12 rounded-xl flex items-center justify-center active:scale-95 transition-transform" style={{ backgroundColor: 'var(--secondary)', color: '#000000' }}>
              <span className="material-symbols-outlined">call</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: 'var(--surface-secondary)' }}>
      <div className="p-5 flex items-start gap-4 hover:opacity-80 transition-opacity cursor-pointer">
        <Link to={`/details/${pharmacy.id}`} className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--surface-primary)' }}>
            {pharmacy.image && (
              <img className="w-full h-full object-cover grayscale opacity-80" alt={pharmacy.name} src={pharmacy.image} />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--primary)', color: '#000000' }}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_hospital
            </span>
          </div>
        </Link>
        <Link to={`/details/${pharmacy.id}`} className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-headline font-bold text-lg truncate pr-2" style={{ color: 'var(--text-primary)' }}>{pharmacy.name}</h4>
            <span className="font-headline font-bold text-sm" style={{ color: 'var(--secondary)' }}>{pharmacy.distance}</span>
          </div>
          <p className="text-xs font-medium truncate mb-2" style={{ color: 'var(--text-secondary)' }}>{pharmacy.address}</p>
          {!hideAvailability && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: pharmacy.isOpen ? 'rgba(0, 214, 143, 0.2)' : 'rgba(255, 77, 109, 0.2)', color: pharmacy.isOpen ? 'var(--primary)' : 'var(--accent-error)' }}>
                {pharmacy.isOpen ? 'Ouvert' : 'Fermé'}
              </span>
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                {pharmacy.isOpen
                  ? hasReliableHours
                    ? `Ferme à ${pharmacy.openUntil}`
                    : 'Horaires indisponibles'
                  : hasReliableHours
                    ? `Ferme à ${pharmacy.openUntil}`
                    : 'Horaires indisponibles'}
              </span>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
