import { useState } from 'react';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import GoogleMapComponent from '../components/GoogleMap';
import { pharmacies } from '../data/pharmacies';
import { useGeolocation } from '../hooks/useGeolocation';
import { formatDistance, calculateDistance } from '../utils/directions';
import type { Pharmacy } from '../types/pharmacy';

export default function Map() {
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [filter24h, setFilter24h] = useState(false);
  const [filterPCR, setFilterPCR] = useState(false);
  const [filterVaccines, setFilterVaccines] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { location: userLocation } = useGeolocation();

  const displayedPharmacy = selectedPharmacy || pharmacies[0];

  // Filter pharmacies based on active filters and search
  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    if (filter24h && !pharmacy.isOpen24h) return false;
    if (filterPCR && !pharmacy.offersPCR) return false;
    if (filterVaccines && !pharmacy.offersVaccines) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesName = pharmacy.name.toLowerCase().includes(query);
      const matchesAddress = pharmacy.address.toLowerCase().includes(query);
      return matchesName || matchesAddress;
    }
    return true;
  });

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopAppBar />
      <main className="relative flex-1 w-full pt-16 pb-20 overflow-hidden">
        {/* Google Map */}
        <GoogleMapComponent 
          pharmacies={filteredPharmacies}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ color: 'var(--text-primary)' }}
              />
              <span className="material-symbols-outlined" style={{ color: 'var(--text-tertiary)' }}>mic</span>
            </div>

            {/* Chips */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-2 px-2">
              <button 
                onClick={() => setFilter24h(!filter24h)}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm transition active:scale-95" 
                style={{ 
                  backgroundColor: filter24h ? 'var(--primary)' : 'var(--surface-primary)', 
                  color: filter24h ? '#000000' : 'var(--text-secondary)',
                  borderColor: 'var(--border-subtle)',
                  border: filter24h ? 'none' : '1px solid'
                }}
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  schedule
                </span>
                Ouvert 24h/24
              </button>
              <button 
                onClick={() => setFilterPCR(!filterPCR)}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm transition active:scale-95" 
                style={{ 
                  backgroundColor: filterPCR ? 'var(--primary)' : 'var(--surface-primary)', 
                  color: filterPCR ? '#000000' : 'var(--text-secondary)',
                  borderColor: 'var(--border-subtle)',
                  border: filterPCR ? 'none' : '1px solid'
                }}
              >
                <span className="material-symbols-outlined text-[16px]">biotech</span>
                Tests PCR
              </button>
              <button 
                onClick={() => setFilterVaccines(!filterVaccines)}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm transition active:scale-95" 
                style={{ 
                  backgroundColor: filterVaccines ? 'var(--primary)' : 'var(--surface-primary)', 
                  color: filterVaccines ? '#000000' : 'var(--text-secondary)',
                  borderColor: 'var(--border-subtle)',
                  border: filterVaccines ? 'none' : '1px solid'
                }}
              >
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
                <button 
                  onClick={() => setShowDirections(true)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--primary)', color: '#000000' }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    directions
                  </span>
                  S'y rendre
                </button>
                <a 
                  href={`tel:${displayedPharmacy.phone}`}
                  className="w-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform" style={{ backgroundColor: 'var(--secondary)', color: '#000000' }}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    call
                  </span>
                </a>
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

      {/* Directions Panel */}
      {showDirections && userLocation && displayedPharmacy && (
        <div className="fixed inset-0 z-40 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            onClick={() => setShowDirections(false)}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          />

          {/* Direction Panel */}
          <div
            className="relative w-full max-w-md mx-auto rounded-t-3xl p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--surface-primary)' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowDirections(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--text-primary)' }}>close</span>
            </button>

            {/* Pharmacy Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="font-headline font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                  {displayedPharmacy.name}
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {displayedPharmacy.address}
                </p>
              </div>

              {/* Distance & Time */}
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="rounded-lg p-3 text-center"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Distance</p>
                  <p className="font-bold text-lg mt-1" style={{ color: 'var(--primary)' }}>
                    {userLocation && displayedPharmacy.latitude && displayedPharmacy.longitude
                      ? formatDistance(
                          calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            displayedPharmacy.latitude,
                            displayedPharmacy.longitude
                          )
                        )
                      : '—'}
                  </p>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>À pied</p>
                  <p className="font-bold text-lg mt-1" style={{ color: 'var(--secondary)' }}>
                    {userLocation && displayedPharmacy.latitude && displayedPharmacy.longitude
                      ? `~${Math.round(
                          (calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            displayedPharmacy.latitude,
                            displayedPharmacy.longitude
                          ) /
                            1.4) *
                            60
                        )} min`
                      : '—'}
                  </p>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Ouvert</p>
                  <p
                    className="font-bold text-lg mt-1"
                    style={{ color: displayedPharmacy.isOpen ? 'var(--primary)' : 'var(--accent-error)' }}
                  >
                    {displayedPharmacy.isOpen ? '✓' : '✗'}
                  </p>
                </div>
              </div>

              {/* Simple direction */}
              <div
                className="flex items-center gap-3 p-4 rounded-lg"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              >
                <span className="text-4xl">📍</span>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: 'var(--primary)' }}>
                    Itinéraire affichée sur la carte
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Suivez le chemin bleu pour vous rendre à la pharmacie
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3">
                <a
                  href={`tel:${displayedPharmacy.phone}`}
                  className="flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  style={{ backgroundColor: 'var(--primary)', color: '#000000' }}
                >
                  <span className="material-symbols-outlined">call</span>
                  Appeler {displayedPharmacy.phone}
                </a>
                <button
                  onClick={() => setShowDirections(false)}
                  className="flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                >
                  <span className="material-symbols-outlined">close</span>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
