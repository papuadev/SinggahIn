import { useState, useEffect } from 'react';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export function useUserLocation() {
  const [coords, setCoords] = useState<UserCoordinates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLoading(false);
      },
      () => setLoading(false),
      { timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  return { coords, loading };
}
