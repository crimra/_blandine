import { useState } from 'react';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import GoogleMapComponent from '../components/GoogleMap';
import { pharmacies } from '../data/pharmacies';
import type { Pharmacy } from '../types/pharmacy';

export default function Map() {
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopAppBar />
      <main className="relative flex-1 w-full pt-16 pb-20 overflow-hidden">
        {/* Google Map */}
        <GoogleMapComponent 
          pharmacies={pharmacies}
          onPharmacySelect={setSelectedPharmacy}
        />

        {/* Overlay UI */}
        <div className="absolute inset-0 pt-16 pb-20 pointer-events-none z-10 flex flex-col">
          {/* Search & Filters Container */}
          <div className="max-w-md mx-auto pointer-events-auto space-y-4 p-5">
            {/* Search Bar */}
            <div className="flex items-center backdrop-blur-md rounded-full px-4 h-14 shadow-lg border" style={{ backgroundColor: 'rgba(22, 24, 32, 0.9)', borderColor: 'var(--border-subtle)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--text-tertiary)' }}>search</span>
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 placeholder:text-current font-body px-3"
                placeholder="Rechercher une pharmacie..."
                type="text"
                style={{ color: 'var(--text-primary)' }}
              />
              <span className="material-symbols-outlined" style={{ color: 'var(--text-tertiary)' }}>mic</span>
            </div>

            {/* Chips */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-2 px-2">
              <button className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm hover:opacity-90 transition active:scale-95" style={{ backgroundColor: 'var(--primary)', color: '#000000' }}>
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  schedule
                </span>
                Ouvert 24h/24
              </button>
              <button className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm hover:opacity-80 transition active:scale-95 border" style={{ backgroundColor: 'var(--surface-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)' }}>
                <span className="material-symbols-outlined text-[16px]">biotech</span>
                Tests PCR
              </button>
              <button className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm hover:opacity-80 transition active:scale-95 border" style={{ backgroundColor: 'var(--surface-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)' }}>
                <span className="material-symbols-outlined text-[16px]">vaccines</span>
                Vaccinations
              </button>
            </div>
          </div>

          {/* Spacer to push bottom card down */}
          <div className="flex-1"></div>

          {/* Bottom Floating Card */}
          <div className="pointer-events-auto max-w-md mx-auto w-full p-5">
            <div className="rounded-[2rem] p-5 shadow-lg border overflow-hidden relative" style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-subtle)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10 blur-2xl" style={{ backgroundColor: 'rgba(0, 214, 143, 0.1)' }}></div>
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] font-label" style={{ color: 'var(--secondary)' }}>
                    {selectedPharmacy ? 'Sélectionné' : 'La plus proche'}
                  </span>
                  <h2 className="text-xl font-extrabold font-headline leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {selectedPharmacy?.name || pharmacies[0].name}
                  </h2>
                  <p className="text-xs font-body" style={{ color: 'var(--text-secondary)' }}>
                    {selectedPharmacy?.address || pharmacies[0].address}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold font-headline" style={{ color: 'var(--secondary)' }}>
                    {selectedPharmacy?.distance || pharmacies[0].distance}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-2" style={{ backgroundColor: (selectedPharmacy?.isOpen || pharmacies[0].isOpen) ? 'rgba(0, 214, 143, 0.2)' : 'rgba(255, 77, 109, 0.2)', color: (selectedPharmacy?.isOpen || pharmacies[0].isOpen) ? 'var(--primary)' : 'var(--accent-error)' }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: (selectedPharmacy?.isOpen || pharmacies[0].isOpen) ? 'var(--primary)' : 'var(--accent-error)' }}></span>
                    {selectedPharmacy?.isOpen || pharmacies[0].isOpen ? 'OUVERT' : 'FERMÉ'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--primary)', color: '#000000' }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    directions
                  </span>
                  S'y rendre
                </button>
                <button className="w-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform" style={{ backgroundColor: 'var(--secondary)', color: '#000000' }}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    call
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="absolute bottom-40 right-5 pointer-events-auto">
            <button className="w-12 h-12 text-primary rounded-full shadow-lg flex items-center justify-center border active:scale-90 transition-transform" style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-subtle)' }}>
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
