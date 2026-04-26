import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import PharmacyCard from '../components/PharmacyCard';
import { pharmacies } from '../data/pharmacies';
import { useGeolocation } from '../hooks/useGeolocation';
import { calculateDistance } from '../utils/distance';
import { useEffect, useMemo, useState } from 'react';
import { isPharmacyOpenNow } from '../utils/availability';
import type { Pharmacy } from '../types/pharmacy';
import { fetchNearbyPharmacies } from '../services/pharmacyApi';

const LOCAL_RADIUS_KM = 25;

export default function List() {
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyPharmacies, setNearbyPharmacies] = useState<Pharmacy[] | null>(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const { location } = useGeolocation();
  const currentHour = new Date().getHours();
  const isNightTime = currentHour >= 21 || currentHour < 6;

  useEffect(() => {
    if (!location) return;

    let cancelled = false;
    setNearbyLoading(true);
    setNearbyError(null);

    fetchNearbyPharmacies(location.latitude, location.longitude, { radiusKm: LOCAL_RADIUS_KM, limit: 50 })
      .then((items) => {
        if (cancelled) return;
        setNearbyPharmacies(items);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setNearbyError(error instanceof Error ? error.message : 'Erreur API inconnue');
        setNearbyPharmacies(null);
      })
      .finally(() => {
        if (!cancelled) {
          setNearbyLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [location]);

  const sourcePharmacies = nearbyPharmacies && nearbyPharmacies.length > 0 ? nearbyPharmacies : pharmacies;

  // Calculer les distances et trier par proximité
  const pharmaciesWithDistance = useMemo(() => {
    if (!location) {
      return sourcePharmacies.map((pharmacy) => ({
        ...pharmacy,
        isOpen: isPharmacyOpenNow(undefined, pharmacy.isOpen),
        calculatedDistance: null as number | null
      }));
    }
    
    return sourcePharmacies
      .filter((pharmacy) => pharmacy.latitude !== undefined && pharmacy.longitude !== undefined)
      .map((pharmacy) => ({
        ...pharmacy,
        isOpen: isPharmacyOpenNow(undefined, pharmacy.isOpen),
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
  }, [location, sourcePharmacies]);

  const localPharmacies = useMemo(() => {
    if (!location) return pharmaciesWithDistance;
    return pharmaciesWithDistance.filter(
      (pharmacy) => pharmacy.calculatedDistance !== null && pharmacy.calculatedDistance <= LOCAL_RADIUS_KM
    );
  }, [location, pharmaciesWithDistance]);

  // Si l'API locale tombe et qu'aucune pharmacie n'est dans le rayon,
  // afficher les donnees de secours plutot qu'une liste vide.
  const effectivePharmacies = useMemo(() => {
    if (localPharmacies.length > 0) return localPharmacies;
    if (nearbyError) return pharmaciesWithDistance;
    return localPharmacies;
  }, [localPharmacies, nearbyError, pharmaciesWithDistance]);
  
  const filteredPharmacies = effectivePharmacies.filter((pharmacy) => {
    if (searchQuery.trim().length > 0) {
      const normalizedSearch = searchQuery.trim().toLowerCase();
      const inName = pharmacy.name.toLowerCase().includes(normalizedSearch);
      const inAddress = pharmacy.address.toLowerCase().includes(normalizedSearch);
      if (!inName && !inAddress) return false;
    }

    if (isNightTime && !(pharmacy.status === 'guard' || pharmacy.isOpen24h || pharmacy.isOpen)) {
      return false;
    }

    return true;
  });

  const nearestPharmacy = filteredPharmacies[0];

  const otherPharmacies = filteredPharmacies.slice(1);

  return (
    <div className="bg-background min-h-screen pb-20">
      <TopAppBar />
      <main className="pt-20 px-5 max-w-2xl mx-auto">
        {/* Hero Section / Search & Filters */}
        <section className="mb-8 space-y-6">
          <div className="space-y-2">
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
              {isNightTime ? 'Pharmacies de nuit' : 'Trouver une pharmacie'}
            </h2>
            <p className="text-on-surface-variant text-sm font-medium">
              {filteredPharmacies.length} pharmacie{filteredPharmacies.length > 1 ? 's' : ''} disponible{filteredPharmacies.length > 1 ? 's' : ''}
              {nearbyError ? ' (donnees de secours)' : ` dans un rayon de ${LOCAL_RADIUS_KM} km`}
            </p>
            {nearbyLoading && (
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Recherche en cours des pharmacies proches...
              </p>
            )}
            {nearbyError && (
              <p className="text-xs font-medium" style={{ color: 'var(--accent-warning)' }}>
                API locale indisponible, affichage des donnees de secours.
              </p>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-surface-container-highest border-none rounded-full focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 transition-all duration-300 text-on-surface placeholder:text-outline/60"
              placeholder="Rechercher par nom ou ville..."
              type="text"
            />
          </div>
        </section>

        {/* Pharmacy List */}
        <div className="space-y-4 pb-12">
          {nearestPharmacy ? (
            <>
              {/* Nearest Pharmacy (Hero Card) */}
              <PharmacyCard pharmacy={nearestPharmacy} variant="featured" hideAvailability />

              {/* Standard Pharmacy List Items */}
              {otherPharmacies.map((pharmacy) => (
                <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} hideAvailability />
              ))}
            </>
          ) : (
            <div
              className="rounded-3xl p-6 border"
              style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-subtle)' }}
            >
              <h3 className="font-headline text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Aucune pharmacie locale trouvee
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Aucun resultat dans un rayon de {LOCAL_RADIUS_KM} km. Active la geolocalisation precise ou utilise la carte pour elargir la recherche.
              </p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
