import { useState, useEffect } from 'react';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

function requestGeolocation(onSuccess: (c: UserCoordinates) => void, onDone: () => void) {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) return onDone();
  navigator.geolocation.getCurrentPosition(
    (pos) => { onSuccess({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); onDone(); },
    () => onDone(),
    { timeout: 5000, maximumAge: 60000 }
  );
}

export function useUserLocation() {
  const [coords, setCoords] = useState<UserCoordinates | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { requestGeolocation((c) => setCoords(c), () => setLoading(false)); }, []);
  return { coords, loading };
}
