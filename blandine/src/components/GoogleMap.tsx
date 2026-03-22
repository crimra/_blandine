import { useState, useMemo, useCallback, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useGeolocation } from '../hooks/useGeolocation';
import type { Pharmacy } from '../types/pharmacy';

// Composant pour afficher l'itinéraire sur la carte
const DirectionsDisplay = ({ 
  userLocation, 
  selectedPharmacy, 
  showDirections 
}: { 
  userLocation: any; 
  selectedPharmacy: Pharmacy | null; 
  showDirections: boolean;
}) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);

  // Initialiser les services
  useEffect(() => {
    if (!routesLibrary || !map) return;

    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  // Calculer et afficher l'itinéraire
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !showDirections || !userLocation || !selectedPharmacy) {
      directionsRenderer?.setDirections({ routes: [] });
      return;
    }

    directionsService.route({
      origin: new (window as any).google.maps.LatLng(userLocation.latitude, userLocation.longitude),
      destination: new (window as any).google.maps.LatLng(selectedPharmacy.latitude, selectedPharmacy.longitude),
      travelMode: (window as any).google.maps.TravelMode.WALKING,
    }).then((result: any) => {
      directionsRenderer.setDirections(result);
      
      // Centrer et zoomer la carte sur l'itinéraire
      const bounds = new (window as any).google.maps.LatLngBounds();
      if (result.routes[0]) {
        result.routes[0].legs.forEach((leg: any) => {
          leg.steps.forEach((step: any) => {
            bounds.extend(step.start_location);
            bounds.extend(step.end_location);
          });
        });
        map?.fitBounds(bounds, { top: 80, right: 20, bottom: 200, left: 20 });
      }
    }).catch((error: any) => {
      console.error('Erreur itinéraire:', error);
    });
  }, [directionsService, directionsRenderer, showDirections, userLocation, selectedPharmacy, map]);

  return null;
};

// Composant bouton recentrer
const RecenterButton = ({ userLocation }: { userLocation: any }) => {
  const map = useMap();

  const handleRecenter = useCallback(() => {
    if (!map || !userLocation) return;
    map.moveCamera({
      center: { lat: userLocation.latitude, lng: userLocation.longitude },
      zoom: 14,
    });
  }, [map, userLocation]);

  return (
    <button
      onClick={handleRecenter}
      disabled={!userLocation}
      className="absolute bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 disabled:opacity-50"
      style={{ backgroundColor: 'var(--primary)', color: 'var(--text-primary)' }}
      title="Recentrer sur ma position"
    >
      <span className="material-symbols-outlined text-xl">my_location</span>
    </button>
  );
};

// Fonction pour générer l'URL Google Maps (legacy, si besoin futur)
/*
const getGoogleMapsDirectionsUrl = (userLocation: any, pharmacy: Pharmacy): string => {
  const origin = `${userLocation.latitude},${userLocation.longitude}`;
  const destination = `${pharmacy.latitude},${pharmacy.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
};
*/

interface GoogleMapProps {
  pharmacies: Pharmacy[];
  selectedPharmacyId?: string;
  onPharmacySelect?: (pharmacy: Pharmacy) => void;
}

export default function GoogleMapComponent({ 
  pharmacies, 
  selectedPharmacyId, 
  onPharmacySelect
}: GoogleMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const { location: userLocation, loading: geoLoading } = useGeolocation();
  const [selectedMarker, setSelectedMarker] = useState<string | null>(selectedPharmacyId || null);
  const [showDirections, setShowDirections] = useState(false);

  const selectedPharmacy = pharmacies.find(p => p.id === selectedMarker) || null;

  const handleMarkerClick = useCallback((pharmacy: Pharmacy) => {
    setSelectedMarker(pharmacy.id);
    setShowDirections(false);
    onPharmacySelect?.(pharmacy);
  }, [onPharmacySelect]);

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface-primary)' }}>
        <div className="text-center p-6">
          <p style={{ color: 'var(--accent-error)' }} className="font-bold">Erreur: Clé API Google Maps manquante</p>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-2">Vérifiez que .env contient VITE_GOOGLE_MAPS_KEY</p>
        </div>
      </div>
    );
  }

  const defaultCenter = userLocation ? 
    { lat: userLocation.latitude, lng: userLocation.longitude } 
    : { lat: -4.2634, lng: 15.2429 }; // Brazzaville fallback

  // Mémoriser les markers pour éviter les re-calculs
  const pharmacyMarkers = useMemo(() => 
    pharmacies.slice(0, 30).map((pharmacy) => ({
      ...pharmacy,
      lat: pharmacy.latitude || defaultCenter.lat + (Math.random() - 0.5) * 0.05,
      lng: pharmacy.longitude || defaultCenter.lng + (Math.random() - 0.5) * 0.05
    })),
    [pharmacies, defaultCenter]
  );

  return (
    <>
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={defaultCenter}
          defaultZoom={14}
          mapId="DEMO_MAP_ID"
          gestureHandling="greedy"
          fullscreenControl={false}
        >
        {/* Marker de la position de l'utilisateur */}
        {userLocation && (
          <AdvancedMarker
            position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
            title="Votre position"
          >
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
          </AdvancedMarker>
        )}

        {/* Loader géoloc */}
        {geoLoading && (
          <div className="absolute top-6 left-6 z-40">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" style={{ borderTopColor: 'transparent' }} />
          </div>
        )}

        {/* Bouton recentrer */}
        <RecenterButton userLocation={userLocation} />

        {/* Affichage de l'itinéraire */}
        <DirectionsDisplay 
          userLocation={userLocation}
          selectedPharmacy={selectedPharmacy}
          showDirections={showDirections}
        />

        {/* Pins des pharmacies */}
        {pharmacyMarkers.map((pharmacy) => (
          <AdvancedMarker
            key={pharmacy.id}
            position={{ lat: pharmacy.lat, lng: pharmacy.lng }}
            onClick={() => handleMarkerClick({ ...pharmacy })}
          >
            <Pin background="#006c51" glyphColor="#ffffff" borderColor="#ffffff" />

            {selectedMarker === pharmacy.id && userLocation && (
              <InfoWindow
                position={{ lat: pharmacy.lat, lng: pharmacy.lng }}
                onClose={() => setSelectedMarker(null)}
                maxWidth={320}
              >
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-headline font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                      {pharmacy.name}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {pharmacy.address}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--secondary)' }}>
                      📍 {pharmacy.distance}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" 
                      style={{ 
                        backgroundColor: pharmacy.isOpen ? 'rgba(0, 214, 143, 0.2)' : 'rgba(255, 77, 109, 0.2)',
                        color: pharmacy.isOpen ? 'var(--primary)' : 'var(--accent-error)'
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pharmacy.isOpen ? 'var(--primary)' : 'var(--accent-error)' }}></span>
                      {pharmacy.isOpen ? 'OUVERT' : 'FERMÉ'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${pharmacy.phone}`}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs active:scale-95 transition-transform"
                      style={{ backgroundColor: 'var(--primary)', color: '#000000' }}
                    >
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      Appeler
                    </a>
                    <button
                      onClick={() => setShowDirections(!showDirections)}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs active:scale-95 transition-transform"
                      style={{ backgroundColor: 'var(--secondary)', color: '#000000' }}
                    >
                      <span className="material-symbols-outlined text-[16px]">directions</span>
                      {showDirections ? 'Masquer' : 'Itinéraire'}
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </AdvancedMarker>
        ))}
      </Map>
      </APIProvider>
    </>
  );
}
