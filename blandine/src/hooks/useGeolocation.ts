import { useState, useEffect } from 'react';
import { DEFAULT_CENTER, FALLBACK_CENTER } from '../constants';

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

type GeolocationPermission = 'granted' | 'denied' | 'prompt' | 'unsupported';

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<GeolocationPermission>('prompt');

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      setLoading(false);
      setPermission('unsupported');
      setLocation({
        latitude: DEFAULT_CENTER.lat,
        longitude: DEFAULT_CENTER.lng,
        accuracy: 0
      });
      return;
    }

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setPermission(result.state as GeolocationPermission);
        })
        .catch(() => {
          setPermission('prompt');
        });
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setPermission('granted');
        setError(null);
        setLoading(false);
      },
      (error) => {
        setPermission(error.code === error.PERMISSION_DENIED ? 'denied' : 'prompt');
        setError(error.message);
        setLoading(false);
        // Fallback Congo: Pointe-Noire si refus/erreur GPS
        setLocation({
          latitude: FALLBACK_CENTER.lat,
          longitude: FALLBACK_CENTER.lng,
          accuracy: 0
        });
      }
    );
  }, []);

  return { location, error, loading, permission };
}
