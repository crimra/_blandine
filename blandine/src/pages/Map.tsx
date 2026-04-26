import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import GoogleMapComponent from '../components/GoogleMap';
import { pharmacies as staticPharmacies } from '../data/pharmacies';
import { useGeolocation } from '../hooks/useGeolocation';
import { isPharmacyOpenNow } from '../utils/availability';
import { fetchNearbyPharmacies } from '../services/pharmacyApi';
import { calculateDistance } from '../utils/distance';
import type { Pharmacy } from '../types/pharmacy';

type TravelMode = 'WALKING' | 'DRIVING';

export default function Map() {
  const [searchParams] = useSearchParams();
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [filter24h, setFilter24h] = useState(false);
  const [filterPCR, setFilterPCR] = useState(false);
  const [filterVaccines, setFilterVaccines] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [travelMode, setTravelMode] = useState<TravelMode>('WALKING');
  const [nearbyPharmacies, setNearbyPharmacies] = useState<Pharmacy[]>([]);
  const { location, permission } = useGeolocation();

  // Fetch nearby pharmacies from Overpass API
  useEffect(() => {
    if (!location) return;
    fetchNearbyPharmacies(location.latitude, location.longitude).then((results) => {
      if (results.length > 0) setNearbyPharmacies(results);
    }).catch(() => {});
  }, [location]);

  const selectedPlaceId = searchParams.get('placeId');

  // Use API results or fallback to static data
  const sourcePharmacies = nearbyPharmacies.length > 0 ? nearbyPharmacies : staticPharmacies;

  const pharmaciesWithDistance = useMemo(() => {
    if (!location) return sourcePharmacies.map(p => ({ ...p, isOpen: isPharmacyOpenNow(undefined, p.isOpen) }));
    return sourcePharmacies
      .filter(p => p.latitude && p.longitude)
      .map(p => ({
        ...p,
        isOpen: isPharmacyOpenNow(undefined, p.isOpen),
        calculatedDistance: calculateDistance(location.latitude, location.longitude, p.latitude!, p.longitude!),
        distance: `${calculateDistance(location.latitude, location.longitude, p.latitude!, p.longitude!).toFixed(1)} km`
      }))
      .sort((a, b) => (a.calculatedDistance ?? 0) - (b.calculatedDistance ?? 0));
  }, [location, sourcePharmacies]);

  const preselectedPharmacy = selectedPlaceId
    ? pharmaciesWithDistance.find(
        (pharmacy) => pharmacy.placeId === selectedPlaceId || pharmacy.id === selectedPlaceId
      )
    : null;

  const displayedPharmacy = selectedPharmacy || preselectedPharmacy || pharmaciesWithDistance[0];
  const hasDestinationCoordinates =
    displayedPharmacy?.latitude !== undefined && displayedPharmacy?.longitude !== undefined;

  // Filter pharmacies based on active filters and search
  const filteredPharmacies = pharmaciesWithDistance.filter((pharmacy) => {
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
          selectedPharmacyId={selectedPharmacy?.id || preselectedPharmacy?.id}
          onPharmacySelect={setSelectedPharmacy}
          showDirections={showDirections}
          onShowDirectionsChange={setShowDirections}
          travelMode={travelMode}
        />

        {/* Overlay UI */}
        <div className="absolute inset-0 pt-16 pb-20 pointer-events-none z-10 flex flex-col">
          {/* Search & Filters Container */}
          <div className="max-w-md mx-auto pointer-events-auto space-y-4 p-5">
            {permission === 'denied' && (
              <div
                className="rounded-xl px-4 py-3 text-xs font-semibold border"
                style={{
                  backgroundColor: 'rgba(255, 184, 0, 0.15)',
                  borderColor: 'var(--accent-warning)',
                  color: 'var(--text-primary)'
                }}
              >
                Geolocalisation refusee. Position de secours activee (Congo). Active le GPS pour une precision locale.
              </div>
            )}
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
                onClick={() => setTravelMode('WALKING')}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm transition active:scale-95" 
                style={{ 
                  backgroundColor: travelMode === 'WALKING' ? 'var(--secondary)' : 'var(--surface-primary)', 
                  color: travelMode === 'WALKING' ? '#000000' : 'var(--text-secondary)',
                  borderColor: 'var(--border-subtle)',
                  border: travelMode === 'WALKING' ? 'none' : '1px solid'
                }}
              >
                <span className="material-symbols-outlined text-[16px]">directions_walk</span>
                A pied
              </button>
              <button 
                onClick={() => setTravelMode('DRIVING')}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm transition active:scale-95" 
                style={{ 
                  backgroundColor: travelMode === 'DRIVING' ? 'var(--secondary)' : 'var(--surface-primary)', 
                  color: travelMode === 'DRIVING' ? '#000000' : 'var(--text-secondary)',
                  borderColor: 'var(--border-subtle)',
                  border: travelMode === 'DRIVING' ? 'none' : '1px solid'
                }}
              >
                <span className="material-symbols-outlined text-[16px]">directions_car</span>
                Voiture
              </button>
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
                    {displayedPharmacy.name}
                  </h2>
                  <p className="text-xs font-body" style={{ color: 'var(--text-secondary)' }}>
                    {displayedPharmacy.address}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold font-headline" style={{ color: 'var(--secondary)' }}>
                    {displayedPharmacy.distance}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-2" style={{ backgroundColor: displayedPharmacy.isOpen ? 'rgba(0, 214, 143, 0.2)' : 'rgba(255, 77, 109, 0.2)', color: displayedPharmacy.isOpen ? 'var(--primary)' : 'var(--accent-error)' }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: displayedPharmacy.isOpen ? 'var(--primary)' : 'var(--accent-error)' }}></span>
                    {displayedPharmacy.isOpen ? 'OUVERT' : 'FERMÉ'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setSelectedPharmacy(displayedPharmacy);
                    setShowDirections(true);
                  }}
                  disabled={!hasDestinationCoordinates}
                  className="relative z-20 pointer-events-auto flex-1 py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ backgroundColor: 'var(--primary)', color: '#000000' }}>
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
              {showDirections && (
                <p className="mt-3 text-[11px] font-semibold" style={{ color: 'var(--secondary)' }}>
                  Itineraire {travelMode === 'WALKING' ? 'a pied' : 'en voiture'} actif. Tracage en cours sur la carte.
                </p>
              )}
            </div>
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
