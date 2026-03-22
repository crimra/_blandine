import { Link } from 'react-router-dom';
import type { Pharmacy } from '../types/pharmacy';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  variant?: 'compact' | 'featured';
}

export default function PharmacyCard({ pharmacy, variant = 'compact' }: PharmacyCardProps) {
  if (variant === 'featured') {
    return (
      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_-8px_32px_rgba(25,28,30,0.04)] relative overflow-hidden group border-none">
        <div className="absolute top-0 right-0 p-6">
          <span className="text-secondary font-headline font-bold text-xl tracking-tight">{pharmacy.distance}</span>
        </div>
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-fixed text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              medical_services
            </span>
          </div>
          <div className="space-y-1 pr-16">
            <h3 className="font-headline text-2xl font-extrabold text-on-surface leading-tight">
              {pharmacy.name}
            </h3>
            <p className="text-on-surface-variant font-medium text-sm leading-relaxed">{pharmacy.address}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[11px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {pharmacy.isOpen ? 'Ouvert' : 'Fermé'}
            </span>
            <span className="text-on-surface-variant text-xs font-semibold">
              Ferme à {pharmacy.openUntil}
            </span>
          </div>
          <div className="flex gap-2 pt-2">
            <Link
              to={`/details/${pharmacy.id}`}
              className="flex-1 bg-primary h-12 rounded-xl text-on-primary font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-xl">directions</span>
              Itinéraire
            </Link>
            <button className="w-12 h-12 bg-secondary-container rounded-xl text-on-secondary-container flex items-center justify-center active:scale-95 transition-transform">
              <span className="material-symbols-outlined">call</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-3xl overflow-hidden">
      <div className="p-5 flex items-start gap-4 hover:bg-surface-container-high/40 transition-colors cursor-pointer">
        <Link to={`/details/${pharmacy.id}`} className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container-highest">
            {pharmacy.image && (
              <img className="w-full h-full object-cover grayscale opacity-80" alt={pharmacy.name} src={pharmacy.image} />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-container-lowest rounded-lg flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_hospital
            </span>
          </div>
        </Link>
        <Link to={`/details/${pharmacy.id}`} className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-headline font-bold text-lg text-on-surface truncate pr-2">{pharmacy.name}</h4>
            <span className="text-secondary font-headline font-bold text-sm">{pharmacy.distance}</span>
          </div>
          <p className="text-on-surface-variant text-xs font-medium truncate mb-2">{pharmacy.address}</p>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              pharmacy.isOpen ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-error-container text-on-error-container'
            }`}>
              {pharmacy.isOpen ? 'Ouvert' : 'Fermé'}
            </span>
            <span className="text-on-surface-variant text-[10px] font-medium">
              {pharmacy.isOpen ? `Ferme à ${pharmacy.openUntil}` : `Ouvre demain à 08:30`}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
