/**
 * Utilitaire pour obtenir les directions réelles via Google Maps Directions API
 */

export interface DirectionsResult {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      start_address: string;
      end_address: string;
      steps: Array<{
        distance: { text: string; value: number };
        duration: { text: string; value: number };
        end_location: { lat: number; lng: number };
        html_instructions: string;
        start_location: { lat: number; lng: number };
        travel_mode: string;
      }>;
    }>;
    overview_polyline: {
      points: string;
    };
  }>;
  status: string;
}

/**
 * Décoder une polyline encodée en points lat/lng
 */
export function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const poly: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const changes = {
    latitude: 0,
    longitude: 0,
  };

  while (index < encoded.length) {
    for (const unit of ['latitude', 'longitude']) {
      let result = 0;
      let shift = 0;
      let byte = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      changes[unit as 'latitude' | 'longitude'] = dlat;
    }

    lat += changes.latitude;
    lng += changes.longitude;

    poly.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return poly;
}

/**
 * Obtenir les directions réelles via le service Google Maps DirectionsService
 * (Fonctionne côté client sans restriction CORS)
 */
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  travelMode: string = 'WALKING'
): Promise<DirectionsResult | null> {
  return new Promise((resolve) => {
    // Attendre que Google Maps soit chargé
    if (!(window as any).google || !(window as any).google.maps) {
      console.error('Google Maps not loaded');
      resolve(null);
      return;
    }

    const directionsService = new (window as any).google.maps.DirectionsService();

    const request = {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: (window as any).google.maps.TravelMode[travelMode],
    };

    directionsService.route(request, (result: any, status: any) => {
      if (status === (window as any).google.maps.DirectionsStatus.OK) {
        resolve(result as DirectionsResult);
      } else {
        console.error('Directions request failed:', status);
        resolve(null);
      }
    });
  });
}

/**
 * Obtenir les étapes de l'itinéraire en format texte simplifié
 */
export function formatDirectionSteps(
  directionsData: DirectionsResult
): Array<{
  instruction: string;
  distance: string;
  duration: string;
}> {
  const steps: Array<{ instruction: string; distance: string; duration: string }> = [];

  if (!directionsData.routes.length || !directionsData.routes[0].legs.length) {
    return steps;
  }

  const legs = directionsData.routes[0].legs;

  legs.forEach((leg) => {
    leg.steps.forEach((step) => {
      // Supprimer les balises HTML
      const instruction = step.html_instructions
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      steps.push({
        instruction,
        distance: step.distance.text,
        duration: step.duration.text,
      });
    });
  });

  return steps;
}

/**
 * Obtenir les informations résumées (distance totale, durée)
 */
export function getDirectionsSummary(directionsData: DirectionsResult) {
  if (!directionsData.routes.length || !directionsData.routes[0].legs.length) {
    return null;
  }

  const leg = directionsData.routes[0].legs[0];
  return {
    distance: leg.distance.text,
    duration: leg.duration.text,
    startAddress: leg.start_address,
    endAddress: leg.end_address,
  };
}
