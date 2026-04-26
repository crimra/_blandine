import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { useGeolocation } from '../hooks/useGeolocation';
import { DEFAULT_CENTER } from '../constants';
import type { Pharmacy } from '../types/pharmacy';
import { decodePolyline } from '../utils/googleDirections';

type TravelMode = 'WALKING' | 'DRIVING';

// Composant pour afficher l'itinéraire sur la carte
const DirectionsDisplay = ({ 
  userLocation, 
  selectedPharmacy, 
  showDirections,
  travelMode,
}: { 
  userLocation: any; 
  selectedPharmacy: Pharmacy | null; 
  showDirections: boolean;
  travelMode: TravelMode;
}) => {
  const map = useMap();
  const routePolylineRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);

  // Récupérer et afficher l'itinéraire réel via Google Maps DirectionsService
  useEffect(() => {
    const destinationLat = (selectedPharmacy as any)?.latitude ?? (selectedPharmacy as any)?.lat;
    const destinationLng = (selectedPharmacy as any)?.longitude ?? (selectedPharmacy as any)?.lng;

    if (
      !map ||
      !showDirections ||
      !userLocation ||
      !selectedPharmacy ||
      destinationLat === undefined ||
      destinationLng === undefined
    ) {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
        routePolylineRef.current = null;
      }
      return;
    }

    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }

    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }

    const fitPathBounds = (pathPoints: Array<{ lat: number; lng: number }>) => {
      if (!pathPoints.length) return;
      const bounds = new (window as any).google.maps.LatLngBounds();
      pathPoints.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds, { top: 80, right: 20, bottom: 200, left: 20 });
    };

    const drawPolyline = (pathPoints: Array<{ lat: number; lng: number }>) => {
      const polyline = new (window as any).google.maps.Polyline({
        path: pathPoints,
        geodesic: true,
        strokeColor: '#4FACFE',
        strokeOpacity: 0.95,
        strokeWeight: 5,
        map,
      });

      routePolylineRef.current = polyline;
      fitPathBounds(pathPoints);
    };

    const renderRoute = async () => {
      try {
        const googleMaps = (window as any).google?.maps;
        if (!googleMaps) {
          showSimplePath();
          return;
        }

        // 1) Essayer l'API Routes moderne (Google recommande cette voie)
        try {
          const routesLib = await googleMaps.importLibrary?.('routes');
          const routeApi = routesLib?.Route ?? googleMaps.routes?.Route;
          const travelEnum = routesLib?.TravelMode;

          if (routeApi?.computeRoutes) {
            const response = await routeApi.computeRoutes({
              origin: {
                location: {
                  latLng: {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  },
                },
              },
              destination: {
                location: {
                  latLng: {
                    latitude: destinationLat,
                    longitude: destinationLng,
                  },
                },
              },
              travelMode:
                travelMode === 'DRIVING'
                  ? travelEnum?.DRIVE ?? 'DRIVE'
                  : travelEnum?.WALK ?? 'WALK',
              polylineQuality: 'HIGH_QUALITY',
            });

            const encodedPolyline = response?.routes?.[0]?.polyline?.encodedPolyline;
            if (encodedPolyline) {
              const decodedPath = decodePolyline(encodedPolyline);
              if (decodedPath.length > 1) {
                drawPolyline(decodedPath);
                return;
              }
            }
          }
        } catch {
          // Ignorer et tenter le fallback legacy juste après
        }

        // 2) Fallback: service Directions legacy
        const directionsService = new googleMaps.DirectionsService();
        const request = {
          origin: { lat: userLocation.latitude, lng: userLocation.longitude },
          destination: { lat: destinationLat, lng: destinationLng },
          travelMode: googleMaps.TravelMode[travelMode],
        };

        directionsService.route(request, (result: any, status: any) => {
          if (status === googleMaps.DirectionsStatus.OK && result && map) {
            const renderer = new googleMaps.DirectionsRenderer({
              suppressMarkers: true,
              preserveViewport: false,
              polylineOptions: {
                strokeColor: '#4FACFE',
                strokeOpacity: 0.95,
                strokeWeight: 5,
              },
            });

            renderer.setMap(map);
            renderer.setDirections(result);
            directionsRendererRef.current = renderer;

            const routeBounds = result.routes?.[0]?.bounds;
            if (routeBounds) {
              map.fitBounds(routeBounds, { top: 80, right: 20, bottom: 200, left: 20 });
            }
          } else {
            showSimplePath();
          }
        });
      } catch (error) {
        console.error('Route rendering failed:', error);
        showSimplePath();
      }
    };

    void renderRoute();

    function showSimplePath() {
      if (!map) return;

      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }

      const fallbackPath = [
        { lat: userLocation.latitude, lng: userLocation.longitude },
        { lat: destinationLat, lng: destinationLng },
      ];

      let path = fallbackPath;
      const overviewPolyline = (selectedPharmacy as any)?.directionsPolyline;
      if (overviewPolyline) {
        const decoded = decodePolyline(overviewPolyline);
        if (decoded.length > 1) {
          path = decoded;
        }
      }
      
      const bounds = new (window as any).google.maps.LatLngBounds();
      path.forEach((point) => bounds.extend(point));
      const polyline = new (window as any).google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#4FACFE',
        strokeOpacity: 0.95,
        strokeWeight: 5,
        map,
      });

      routePolylineRef.current = polyline;

      map.fitBounds(bounds, { top: 80, right: 20, bottom: 200, left: 20 });
    }
  }, [showDirections, userLocation, selectedPharmacy, map, travelMode]);

  useEffect(() => {
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
        routePolylineRef.current = null;
      }
    };
  }, []);

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
  showDirections?: boolean;
  onShowDirectionsChange?: (show: boolean) => void;
  travelMode?: TravelMode;
}

export default function GoogleMapComponent({ 
  pharmacies, 
  selectedPharmacyId, 
  onPharmacySelect,
  showDirections: externalShowDirections = false,
  onShowDirectionsChange,
  travelMode = 'WALKING',
}: GoogleMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const { location: userLocation, loading: geoLoading } = useGeolocation();
  const [selectedMarker, setSelectedMarker] = useState<string | null>(selectedPharmacyId || null);
  const [showDirections, setShowDirectionsInternal] = useState(false);

  // Synchronize external showDirections state
  useEffect(() => {
    setShowDirectionsInternal(externalShowDirections);
  }, [externalShowDirections]);

  const setShowDirections = useCallback((value: boolean) => {
    setShowDirectionsInternal(value);
    onShowDirectionsChange?.(value);
  }, [onShowDirectionsChange]);

  useEffect(() => {
    setSelectedMarker(selectedPharmacyId || null);
  }, [selectedPharmacyId]);

  const selectedPharmacy = pharmacies.find(p => p.id === selectedMarker) || null;

  const handleMarkerClick = useCallback((pharmacy: Pharmacy) => {
    setSelectedMarker(pharmacy.id);
    setShowDirections(true);
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
    : DEFAULT_CENTER;

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
      <APIProvider apiKey={apiKey} libraries={['routes']}>
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

        {/* Affichage de l'itinéraire */}
        <DirectionsDisplay 
          userLocation={userLocation}
          selectedPharmacy={selectedPharmacy}
          showDirections={showDirections}
          travelMode={travelMode}
        />

        {/* Bouton recentrer */}
        <RecenterButton userLocation={userLocation} />

        {/* Pins des pharmacies */}
        {pharmacyMarkers.map((pharmacy) => (
          <AdvancedMarker
            key={pharmacy.id}
            position={{ lat: pharmacy.lat, lng: pharmacy.lng }}
            onClick={() => handleMarkerClick({ ...pharmacy })}
          >
            <Pin background="#006c51" glyphColor="#ffffff" borderColor="#ffffff" />
          </AdvancedMarker>
        ))}
      </Map>
      </APIProvider>
    </>
  );
}
