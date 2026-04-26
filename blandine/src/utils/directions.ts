import { calculateDistance, formatDistance } from './distance';

/**
 * Estimer le temps de marche en minutes
 * Vitesse moyenne de marche: 1.4 m/s (5 km/h)
 */
export function calculateWalkingTime(distanceKm: number): number {
  const speedKmPerMin = 5 / 60; // 5 km/h = 0.083 km/min
  return Math.round(distanceKm / speedKmPerMin);
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

export { calculateDistance, formatDistance };
