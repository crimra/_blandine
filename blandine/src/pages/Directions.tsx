import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import TopAppBar from '../components/TopAppBar';
import { pharmacies } from '../data/pharmacies';
import { useGeolocation } from '../hooks/useGeolocation';
import { formatDirectionSteps, getDirectionsSummary, decodePolyline } from '../utils/googleDirections';

// Composant pour afficher l'itinéraire sur la carte mini
const DirectionsRenderer = ({ 
  userLocation, 
  destination,
  onDataReceived
}: { 
  userLocation: any; 
  destination: any;
  onDataReceived: (data: any) => void;
}) => {
  const map = useMap();
  const routePolylineRef = useRef<any>(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (!map || !userLocation || !destination || hasProcessed.current) return;

    try {
      // Essayer d'utiliser le service Directions
      const directionsService = new (window as any).google.maps.DirectionsService();
      const request = {
        origin: { lat: userLocation.latitude, lng: userLocation.longitude },
        destination: { lat: destination.latitude, lng: destination.longitude },
        travelMode: (window as any).google.maps.TravelMode.WALKING,
      };

      directionsService.route(request, (result: any, status: any) => {
        if (status === (window as any).google.maps.DirectionsStatus.OK) {
          // Décoder et afficher la polyline
          const overviewPolyline = result.routes[0]?.overview_polyline?.points;
          if (overviewPolyline) {
            const decodedPath = decodePolyline(overviewPolyline);
            
            const polyline = new (window as any).google.maps.Polyline({
              path: decodedPath,
              geodesic: true,
              strokeColor: '#4FACFE',
              strokeOpacity: 0.95,
              strokeWeight: 5,
              map,
            });

            routePolylineRef.current = polyline;
          }

          // Ajuster la vue
          const bounds = new (window as any).google.maps.LatLngBounds();
          bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });
          bounds.extend({ lat: destination.latitude, lng: destination.longitude });
          map.fitBounds(bounds, { top: 80, right: 20, bottom: 80, left: 20 });

          onDataReceived(result);
          hasProcessed.current = true;
        } else {
          // Si l'API Directions échoue, afficher une ligne simple
          showSimplePath();
        }
      });
    } catch {
      // Si erreur, afficher une ligne simple
      showSimplePath();
    }

    function showSimplePath() {
      const polyline = new (window as any).google.maps.Polyline({
        path: [
          { lat: userLocation.latitude, lng: userLocation.longitude },
          { lat: destination.latitude, lng: destination.longitude },
        ],
        geodesic: true,
        strokeColor: '#4FACFE',
        strokeOpacity: 0.95,
        strokeWeight: 5,
        map,
      });

      routePolylineRef.current = polyline;

      // Ajuster la vue
      const bounds = new (window as any).google.maps.LatLngBounds();
      bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });
      bounds.extend({ lat: destination.latitude, lng: destination.longitude });
      map.fitBounds(bounds, { top: 80, right: 20, bottom: 80, left: 20 });

      // Créer des données simulées
      const distance = Math.round(
        Math.sqrt(
          Math.pow(destination.latitude - userLocation.latitude, 2) +
          Math.pow(destination.longitude - userLocation.longitude, 2)
        ) * 111 * 100
      ) / 100; // approximatif en km

      const mockData = {
        routes: [{
          legs: [{
            distance: { text: `${distance} km`, value: distance * 1000 },
            duration: { text: `${Math.round(distance * 12)} min`, value: distance * 720 },
            start_address: 'Votre position',
            end_address: destination.address,
            steps: [{
              html_instructions: 'Direction générale',
              distance: { text: `${distance} km` },
              duration: { text: `${Math.round(distance * 12)} min` },
            }]
          }]
        }]
      };

      onDataReceived(mockData);
      hasProcessed.current = true;
    }

    return () => {
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
        routePolylineRef.current = null;
      }
    };
  }, [map, userLocation, destination, onDataReceived]);

  return null;
};

export default function Directions() {
  const { id } = useParams();
  const pharmacy = pharmacies.find(p => p.id === id);
  const { location: userLocation } = useGeolocation();
  const [steps, setSteps] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  const handleDirectionsData = (data: any) => {
    if (data) {
      setSteps(formatDirectionSteps(data));
      setSummary(getDirectionsSummary(data));
      setLoading(false);
    }
  };

  useEffect(() => {
    // Vérifier les conditions initiales
    if (!pharmacy) {
      setError('Pharmacie non trouvée');
    } else if (pharmacy.latitude === undefined || pharmacy.longitude === undefined) {
      setError('Les coordonnées de la pharmacie ne sont pas disponibles');
    } else if (userLocation) {
      // On a tout ce qu'il faut, nettoyer l'erreur
      setError(null);
    }
    // Note: on ne fixe pas d'erreur si userLocation est null, la carte va attendre sa disponibilité
  }, [pharmacy, userLocation]);

  if (!pharmacy) {
    return <div className="bg-background text-on-background min-h-screen">Pharmacie non trouvée</div>;
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
            <APIProvider apiKey={apiKey}>
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
                  onDataReceived={handleDirectionsData}
                />
              </Map>
            </APIProvider>
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
                      <p className="text-on-surface font-medium mb-2" dangerouslySetInnerHTML={{ __html: step.instruction }} />
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
