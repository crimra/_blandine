import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import PharmacyCard from '../components/PharmacyCard';
import { pharmacies } from '../data/pharmacies';
import { useGeolocation } from '../hooks/useGeolocation';
import { calculateDistance } from '../utils/distance';
import { useState, useMemo } from 'react';

export default function List() {
  const [openNow, setOpenNow] = useState(false);
  const [onlineDelivery, setOnlineDelivery] = useState(false);
  const [hasTests, setHasTests] = useState(false);
  const { location } = useGeolocation();

  // Calculer les distances et trier par proximité
  const pharmaciesWithDistance = useMemo(() => {
    if (!location) return pharmacies;
    
    return pharmacies
      .filter((pharmacy) => pharmacy.latitude !== undefined && pharmacy.longitude !== undefined)
      .map((pharmacy) => ({
        ...pharmacy,
        calculatedDistance: calculateDistance(
          location.latitude,
          location.longitude,
          pharmacy.latitude!,
          pharmacy.longitude!
        ),
        distance: `${calculateDistance(
          location.latitude,
          location.longitude,
          pharmacy.latitude!,
          pharmacy.longitude!
        ).toFixed(1)} km`
      }))
      .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }, [location]);

  const nearestPharmacy = pharmaciesWithDistance[0];
  
  const filteredPharmacies = pharmaciesWithDistance.filter((pharmacy) => {
    if (openNow && !pharmacy.isOpen) return false;
    if (hasTests && !pharmacy.offersPCR) return false;
    return true;
  });

  const otherPharmacies = filteredPharmacies.slice(1);

  return (
    <div className="bg-background min-h-screen pb-20">
      <TopAppBar />
      <main className="pt-20 px-5 max-w-2xl mx-auto">
        {/* Hero Section / Search & Filters */}
        <section className="mb-8 space-y-6">
          <div className="space-y-2">
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
              Trouver une pharmacie
            </h2>
            <p className="text-on-surface-variant text-sm font-medium">
              {filteredPharmacies.length} pharmacies disponibles autour de vous
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input
              className="w-full h-14 pl-12 pr-4 bg-surface-container-highest border-none rounded-full focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 transition-all duration-300 text-on-surface placeholder:text-outline/60"
              placeholder="Rechercher par nom ou ville..."
              type="text"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => {/* Open filter modal */}}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold whitespace-nowrap">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Filtres
            </button>
            <button 
              onClick={() => setOpenNow(!openNow)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition active:scale-95"
              style={{ 
                backgroundColor: openNow ? 'var(--primary)' : 'var(--surface-primary)', 
                color: openNow ? '#000000' : 'var(--text-secondary)',
                borderColor: 'var(--border-subtle)',
                border: openNow ? 'none' : '1px solid'
              }}
            >
              Ouvert maintenant
            </button>
            <button 
              onClick={() => setOnlineDelivery(!onlineDelivery)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition active:scale-95"
              style={{ 
                backgroundColor: onlineDelivery ? 'var(--primary)' : 'var(--surface-primary)', 
                color: onlineDelivery ? '#000000' : 'var(--text-secondary)',
                borderColor: 'var(--border-subtle)',
                border: onlineDelivery ? 'none' : '1px solid'
              }}
            >
              Vente en ligne
            </button>
            <button 
              onClick={() => setHasTests(!hasTests)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition active:scale-95"
              style={{ 
                backgroundColor: hasTests ? 'var(--primary)' : 'var(--surface-primary)', 
                color: hasTests ? '#000000' : 'var(--text-secondary)',
                borderColor: 'var(--border-subtle)',
                border: hasTests ? 'none' : '1px solid'
              }}
            >
              Tests COVID
            </button>
          </div>
        </section>

        {/* Pharmacy List */}
        <div className="space-y-4 pb-12">
          {/* Nearest Pharmacy (Hero Card) */}
          <PharmacyCard pharmacy={nearestPharmacy} variant="featured" />

          {/* Standard Pharmacy List Items */}
          {otherPharmacies.map((pharmacy) => (
            <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
