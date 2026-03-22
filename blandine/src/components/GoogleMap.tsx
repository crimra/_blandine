import { useState, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import type { Pharmacy } from '../types/pharmacy';

interface GoogleMapProps {
  pharmacies: Pharmacy[];
  selectedPharmacyId?: string;
  onPharmacySelect?: (pharmacy: Pharmacy) => void;
}

export default function GoogleMapComponent({ pharmacies, selectedPharmacyId, onPharmacySelect }: GoogleMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const mapRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(selectedPharmacyId || null);

  // Coordonnées par défaut (Paris)
  const defaultCenter = { lat: 48.8566, lng: 2.3522 };

  // Générer des coordonnées approximatives pour chaque pharmacie (mock)
  const pharmacyMarkers = pharmacies.map((pharmacy) => ({
    ...pharmacy,
    lat: defaultCenter.lat + (Math.random() - 0.5) * 0.05,
    lng: defaultCenter.lng + (Math.random() - 0.5) * 0.05
  }));

  const handleMarkerClick = (pharmacy: Pharmacy) => {
    setSelectedMarker(pharmacy.id);
    onPharmacySelect?.(pharmacy);
  };

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        defaultCenter={defaultCenter}
        defaultZoom={14}
        gestureHandling="greedy"
        fullscreenControl={false}
      >
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
                        <span className="text-xs font-semibold text-primary">
                          Ouvert
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-error">
                        Fermé
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-primary text-on-primary text-xs py-2 rounded-md font-semibold active:scale-95 transition-transform">
                      <span className="material-symbols-outlined text-[14px] inline mr-1">call</span>
                      Appeler
                    </button>
                    <button className="flex-1 bg-secondary text-on-secondary text-xs py-2 rounded-md font-semibold active:scale-95 transition-transform">
                      <span className="material-symbols-outlined text-[14px] inline mr-1">directions</span>
                      Itinéraire
                    </button>
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
