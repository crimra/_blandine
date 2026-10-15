import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { APIProvider, APILoadingStatus, Map, AdvancedMarker, useMap, useApiLoadingStatus } from '@vis.gl/react-google-maps';
import TopAppBar from '../components/TopAppBar';
import MapErrorBoundary from '../components/MapErrorBoundary';
import { usePharmacy } from '../hooks/usePharmacy';
import { useGeolocation } from '../hooks/useGeolocation';
import { getDirectionSteps } from '../utils/directions';
import { formatDirectionSteps, getDirectionsSummary, decodePolyline } from '../utils/googleDirections';
import type { Pharmacy } from '../types/pharmacy';

// Au-delà, on considère que Google ne répondra pas (clé refusée, réseau...)
const ROUTE_TIMEOUT_MS = 10000;

type LatLng = { lat: number; lng: number };

// Itinéraire de secours à vol d'oiseau, au même format qu'une réponse DirectionsService
function buildStraightLineRoute(
  userLocation: { latitude: number; longitude: number },
  destination: Pharmacy & { latitude: number; longitude: number }
) {
  const [step] = getDirectionSteps(
    userLocation.latitude,
    userLocation.longitude,
    destination.latitude,
    destination.longitude
  );
  const leg = { distance: { text: step.distance }, duration: { text: step.time.replace(' de marche', '') } };

  return {
    routes: [{
      legs: [{
        ...leg,
        start_address: 'Votre position',
        end_address: destination.address,
        steps: [{ ...leg, instructions: `${step.direction} (à vol d'oiseau)` }],
      }],
    }],
  };
}

// Signale une clé refusée ou un script non chargé. Doit rester hors de <Map>,
// qui démonte ses enfants en cas d'AUTH_FAILURE.
const ApiFailureWatcher = ({ onFailure }: { onFailure: () => void }) => {
  const apiStatus = useApiLoadingStatus();

  useEffect(() => {
    if (apiStatus === APILoadingStatus.AUTH_FAILURE || apiStatus === APILoadingStatus.FAILED) {
      onFailure();
    }
  }, [apiStatus, onFailure]);

  return null;
};

// Composant pour afficher l'itinéraire sur la carte mini
const DirectionsRenderer = ({
  userLocation,
  destination,
  onRouteReady,
  onRouteFailed,
}: {
  userLocation: any;
  destination: any;
  onRouteReady: (data: any) => void;
  onRouteFailed: () => void;
}) => {
  const map = useMap();
  const routePolylineRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !userLocation || !destination) return;

    const googleMaps = (window as any).google?.maps;
    const origin = { lat: userLocation.latitude, lng: userLocation.longitude };
    const target = { lat: destination.latitude, lng: destination.longitude };
    let settled = false;

    const drawPath = (path: LatLng[] | unknown[]) => {
      try {
        routePolylineRef.current?.setMap(null);
        routePolylineRef.current = new googleMaps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#4FACFE',
          strokeOpacity: 0.95,
          strokeWeight: 5,
          map,
        });

        const bounds = new googleMaps.LatLngBounds();
        bounds.extend(origin);
        bounds.extend(target);
        map.fitBounds(bounds, { top: 80, right: 20, bottom: 80, left: 20 });
      } catch {
        // Carte inutilisable (ex: clé refusée) : le résumé texte reste affiché
      }
    };

    const fail = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      drawPath([origin, target]);
      onRouteFailed();
    };

    const timeoutId = setTimeout(fail, ROUTE_TIMEOUT_MS);

    try {
      const directionsService = new googleMaps.DirectionsService();
      const request = { origin, destination: target, travelMode: googleMaps.TravelMode.WALKING };

      directionsService.route(request, (result: any, status: any) => {
        if (settled) return;
        if (status !== googleMaps.DirectionsStatus.OK || !result?.routes?.[0]) {
          fail();
          return;
        }

        settled = true;
        clearTimeout(timeoutId);

        // L'API JS fournit overview_path (LatLng[]) et overview_polyline (chaine encodee)
        const route = result.routes[0];
        const encodedPolyline =
          typeof route.overview_polyline === 'string' ? route.overview_polyline : route.overview_polyline?.points;
        const path = route.overview_path ?? (encodedPolyline ? decodePolyline(encodedPolyline) : null);
        drawPath(path && path.length > 1 ? path : [origin, target]);
        onRouteReady(result);
      });
    } catch {
      fail();
    }

    return () => {
      settled = true;
      clearTimeout(timeoutId);
      routePolylineRef.current?.setMap(null);
      routePolylineRef.current = null;
    };
  }, [map, userLocation, destination, onRouteReady, onRouteFailed]);

  return null;
};

export default function Directions() {
  const { id } = useParams();
  const { pharmacy, loading: pharmacyLoading } = usePharmacy(id);
  const { location: userLocation } = useGeolocation();
  const [routeData, setRouteData] = useState<any>(null);
  const [routeFailed, setRouteFailed] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  // Références stables : sinon chaque rendu relance l'effet du renderer, qui efface le tracé
  const handleRouteReady = useCallback((data: any) => setRouteData(data), []);
  const handleRouteFailed = useCallback(() => setRouteFailed(true), []);

  const destination =
    pharmacy && pharmacy.latitude !== undefined && pharmacy.longitude !== undefined
      ? (pharmacy as Pharmacy & { latitude: number; longitude: number })
      : null;

  const fallbackData = useMemo(
    () => (userLocation && destination ? buildStraightLineRoute(userLocation, destination) : null),
    [userLocation, destination]
  );

  const error = pharmacy && !destination ? 'Les coordonnées de la pharmacie ne sont pas disponibles' : null;
  const directionsData = routeData ?? (routeFailed || !apiKey ? fallbackData : null);
  const isFallback = !routeData && directionsData !== null;
  const steps = directionsData ? formatDirectionSteps(directionsData) : [];
  const summary = directionsData ? getDirectionsSummary(directionsData) : null;
  const loading = !directionsData && !error;

  if (pharmacyLoading) {
    return <div className="bg-background text-on-background min-h-screen pt-24 px-5">Chargement de la pharmacie...</div>;
  }

  if (!pharmacy) {
    return <div className="bg-background text-on-background min-h-screen pt-24 px-5">Pharmacie non trouvée</div>;
  }

  return (
    <div className="bg-background text-on-background min-h-screen pb-24">
      <TopAppBar showBack={true} />
      <main className="pt-16 max-w-2xl mx-auto">
        {/* Header */}
        <section className="px-5 py-6">
          <h1 className="text-2xl font-headline font-extrabold mb-2">{pharmacy.name}</h1>
          <p className="text-on-surface-variant font-body">{pharmacy.address}</p>
        </section>

        {/* Mini Map */}
        {userLocation && pharmacy.latitude && pharmacy.longitude && apiKey && (
          <section className="px-5 mb-6 h-64 rounded-2xl overflow-hidden shadow-lg">
            <MapErrorBoundary onError={handleRouteFailed}>
              <APIProvider apiKey={apiKey}>
                <ApiFailureWatcher onFailure={handleRouteFailed} />
                <Map
                  style={{ width: '100%', height: '100%' }}
                  defaultCenter={{ lat: userLocation.latitude, lng: userLocation.longitude }}
                  defaultZoom={14}
                  mapId="DEMO_MAP_ID"
                  gestureHandling="greedy"
                >
                  <AdvancedMarker
                    position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
                    title="Votre position"
                  >
                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                  </AdvancedMarker>
                  <AdvancedMarker
                    position={{ lat: pharmacy.latitude, lng: pharmacy.longitude }}
                    title={pharmacy.name}
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg" />
                  </AdvancedMarker>
                  <DirectionsRenderer 
                    userLocation={userLocation}
                    destination={pharmacy}
                    onRouteReady={handleRouteReady}
                    onRouteFailed={handleRouteFailed}
                  />
                </Map>
              </APIProvider>
            </MapErrorBoundary>
          </section>
        )}

        {/* Summary Card */}
        {summary && (
          <section className="px-5 mb-6">
            <div className="bg-surface-container-low rounded-[2rem] p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-primary mb-2">
                    schedule
                  </span>
                  <p className="text-2xl font-bold text-on-surface">{summary.duration}</p>
                  <p className="text-sm text-on-surface-variant">Durée estimée</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-secondary mb-2">
                    distance
                  </span>
                  <p className="text-2xl font-bold text-on-surface">{summary.distance}</p>
                  <p className="text-sm text-on-surface-variant">Distance totale</p>
                </div>
              </div>
              {isFallback && (
                <p className="mt-4 text-xs text-center text-on-surface-variant">
                  Itinéraire Google indisponible : estimation à vol d'oiseau, à pied.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Error State */}
        {error && (
          <section className="px-5 mb-6">
            <div
              className="rounded-xl px-4 py-3 text-sm font-semibold"
              style={{
                backgroundColor: 'rgba(255, 77, 109, 0.15)',
                color: 'var(--accent-error)',
                borderLeft: '4px solid var(--accent-error)'
              }}
            >
              {error}
            </div>
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <section className="px-5 flex justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full"></div>
              <p className="text-on-surface-variant">Calcul de l'itinéraire...</p>
            </div>
          </section>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <section className="px-5 mb-12">
            <h2 className="text-lg font-headline font-bold mb-4 text-on-surface">Itinéraire détaillé</h2>
            <div className="space-y-0">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Timeline connector */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-outline-variant"></div>
                  )}
                  
                  {/* Step card */}
                  <div className="flex gap-4 pb-4 relative z-10">
                    {/* Circle indicator */}
                    <div className="flex flex-col items-center pt-1">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        {index + 1}
                      </div>
                    </div>

                    {/* Step content */}
                    <div className="flex-1 bg-surface-container-low rounded-xl p-4">
                      <p className="text-on-surface font-medium mb-2">{step.instruction}</p>
                      <div className="flex gap-4 text-sm text-on-surface-variant">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">distance</span>
                          {step.distance}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          {step.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Google Maps Link */}
        {userLocation && pharmacy.latitude && pharmacy.longitude && (
          <section className="px-5 mb-12">
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${pharmacy.latitude},${pharmacy.longitude}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-primary text-black py-4 rounded-xl font-semibold active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined">open_in_new</span>
              Ouvrir dans Google Maps
            </a>
          </section>
        )}
      </main>
    </div>
  );
}
