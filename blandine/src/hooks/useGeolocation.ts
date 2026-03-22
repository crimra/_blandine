import { useState, useEffect } from 'react';

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setError(null);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
        // Fallback: centre de Paris
        setLocation({
          latitude: 48.8566,
          longitude: 2.3522,
          accuracy: 0
        });
      }
    );
  }, []);

  return { location, error, loading };
}
