/** Known city centroids for fixed-fare routes when GPS coords are missing. */
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  algiers: { lat: 36.7538, lng: 3.0588 },
  الجزائر: { lat: 36.7538, lng: 3.0588 },
  oran: { lat: 35.6969, lng: -0.6331 },
  وهران: { lat: 35.6969, lng: -0.6331 },
  constantine: { lat: 36.365, lng: 6.6147 },
  قسنطينة: { lat: 36.365, lng: 6.6147 },
  annaba: { lat: 36.9, lng: 7.7667 },
  عنابة: { lat: 36.9, lng: 7.7667 },
  blida: { lat: 36.47, lng: 2.8277 },
  البليدة: { lat: 36.47, lng: 2.8277 },
  setif: { lat: 36.191, lng: 5.4137 },
  سطيف: { lat: 36.191, lng: 5.4137 },
  batna: { lat: 35.5559, lng: 6.1746 },
  باتنة: { lat: 35.5559, lng: 6.1746 },
};

export function normalizeCityKey(value: string): string {
  return value.trim().toLowerCase();
}

export function resolvePickupCoordinates(pickup: {
  lat?: number;
  lng?: number;
  address?: string;
}): { lat: number; lng: number } | null {
  const lat = Number(pickup.lat);
  const lng = Number(pickup.lng);

  if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
    return { lat, lng };
  }

  const address = pickup.address?.trim();
  if (!address) return null;

  const direct = CITY_COORDINATES[normalizeCityKey(address)];
  if (direct) return direct;

  const partial = Object.entries(CITY_COORDINATES).find(([name]) =>
    normalizeCityKey(address).includes(normalizeCityKey(name))
  );

  return partial?.[1] ?? null;
}
