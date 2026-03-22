/**
 * Calcul de distance entre deux points GPS
 * Formule Haversine pour distance en km
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimer le temps de marche en minutes
 * Vitesse moyenne de marche: 1.4 m/s (5 km/h)
 */
export function calculateWalkingTime(distanceKm: number): number {
  const speedKmPerMin = 5 / 60; // 5 km/h = 0.083 km/min
  return Math.round(distanceKm / speedKmPerMin);
}

/**
 * Format distance avec unité appropriée
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Générer les étapes simples pour aller à un point
 * Format: ["Nord-Est sur X km", "Continue pendant Y min", etc.]
 */
export function getDirectionSteps(
  userLat: number,
  userLng: number,
  destLat: number,
  destLng: number
): { direction: string; distance: string; time: string }[] {
  const distance = calculateDistance(userLat, userLng, destLat, destLng);
  const time = calculateWalkingTime(distance);

  // Calculer la direction générale
  const dLat = destLat - userLat;
  const dLng = destLng - userLng;
  const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);

  let directionText = '';
  if (angle >= -22.5 && angle < 22.5) {
    directionText = 'Nord ↑';
  } else if (angle >= 22.5 && angle < 67.5) {
    directionText = 'Nord-Est ↗';
  } else if (angle >= 67.5 && angle < 112.5) {
    directionText = 'Est →';
  } else if (angle >= 112.5 && angle < 157.5) {
    directionText = 'Sud-Est ↘';
  } else if (angle >= 157.5 || angle < -157.5) {
    directionText = 'Sud ↓';
  } else if (angle >= -157.5 && angle < -112.5) {
    directionText = 'Sud-Ouest ↙';
  } else if (angle >= -112.5 && angle < -67.5) {
    directionText = 'Ouest ←';
  } else if (angle >= -67.5 && angle < -22.5) {
    directionText = 'Nord-Ouest ↖';
  }

  return [
    {
      direction: `Allez ${directionText}`,
      distance: formatDistance(distance),
      time: `${time} min de marche`
    }
  ];
}
