import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useGeolocation } from '../hooks/useGeolocation';
import type { Pharmacy } from '../types/pharmacy';

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
  const { location: userLocation } = useGeolocation();
  const [selectedMarker, setSelectedMarker] = useState<string | null>(selectedPharmacyId || null);

  // Debug: Vérifier que la clé est chargée
  console.log('Google Maps API Key loaded:', apiKey ? '✅ YES' : '❌ MISSING');
  console.log('API Key:', apiKey?.substring(0, 10) + '...' || 'undefined');

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
    : { lat: 48.8566, lng: 2.3522 };

  // Utiliser les vraies coordonnées GPS depuis les données
  const pharmacyMarkers = pharmacies.map((pharmacy) => ({
    ...pharmacy,
    lat: pharmacy.latitude || defaultCenter.lat + (Math.random() - 0.5) * 0.05,
    lng: pharmacy.longitude || defaultCenter.lng + (Math.random() - 0.5) * 0.05
  }));

  const handleMarkerClick = (pharmacy: Pharmacy) => {
    setSelectedMarker(pharmacy.id);
    onPharmacySelect?.(pharmacy);
  };

  const getDirectionsUrl = (pharmacy: Pharmacy) => {
    if (!userLocation || !pharmacy.latitude || !pharmacy.longitude) return '#';
    return `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${pharmacy.latitude},${pharmacy.longitude}`;
  };

  return (
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

        {/* Pins des pharmacies */}
        {pharmacyMarkers.map((pharmacy) => (
          <AdvancedMarker
            key={pharmacy.id}
            position={{ lat: pharmacy.lat, lng: pharmacy.lng }}
            onClick={() => handleMarkerClick(pharmacy)}
          >
            <Pin background="#006c51" glyphColor="#ffffff" borderColor="#ffffff" />

            {selectedMarker === pharmacy.id && (
              <InfoWindow
                position={{ lat: pharmacy.lat, lng: pharmacy.lng }}
                onClose={() => setSelectedMarker(null)}
                maxWidth={280}
              >
                <div className="bg-white rounded-lg p-4 shadow-md max-w-xs">
                  <h3 className="font-headline font-bold text-on-surface mb-1">
                    {pharmacy.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-2">
                    {pharmacy.address}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    {pharmacy.isOpen ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-semibold text-primary">Ouvert</span>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-error">Fermé</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${pharmacy.phone}`}
                      className="flex items-center justify-center gap-1 bg-primary text-on-primary text-xs py-2 rounded-md font-semibold active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[14px]">call</span>
                      Appeler
                    </a>
                    <a
                      href={getDirectionsUrl(pharmacy)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 bg-secondary text-on-secondary text-xs py-2 rounded-md font-semibold active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[14px]">directions</span>
                      Itinéraire
                    </a>
                  </div>
                </div>
              </InfoWindow>
            )}
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
