import type { Pharmacy } from '../types/pharmacy';
import { pharmacies as staticPharmacies } from '../data/pharmacies';
import { calculateDistance } from '../utils/distance';

type OverpassElement = {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];
const REQUEST_TIMEOUT_MS = 12000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRIES_PER_ENDPOINT = 2;

const nearbyCache = new Map<string, { timestamp: number; items: Pharmacy[] }>();
// Pharmacies deja recuperees, pour que Details/Directions les retrouvent par id
const knownPharmacies = new Map<string, Pharmacy>();
const OSM_ID_PATTERN = /^osm-(node|way|relation)-(\d+)$/;

function inferOpenStatus(openingHours?: string): { isOpen: boolean; isOpen24h: boolean; status: 'guard' | 'normal' } {
  if (!openingHours) {
    return { isOpen: false, isOpen24h: false, status: 'normal' };
  }

  const normalized = openingHours.toLowerCase().replace(/\s+/g, '');
  const is24h = normalized.includes('24/7') || normalized.includes('00:00-23:59') || normalized.includes('00:00-24:00');

  return {
    isOpen: is24h,
    isOpen24h: is24h,
    status: is24h ? 'guard' : 'normal',
  };
}

function buildAddress(tags: Record<string, string>): string {
  const street = tags['addr:street'];
  const houseNumber = tags['addr:housenumber'];
  const city = tags['addr:city'] || tags['addr:town'] || tags['addr:village'];

  const line1 = [houseNumber, street].filter(Boolean).join(' ').trim();
  const line2 = city?.trim();

  if (line1 && line2) return `${line1}, ${line2}`;
  if (line1) return line1;
  if (line2) return line2;

  return tags['name'] ? `Zone: ${tags['name']}` : 'Adresse non renseignee';
}

function toPharmacy(element: OverpassElement, origin?: { lat: number; lng: number }): Pharmacy | null {
  const tags = element.tags ?? {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;

  if (lat === undefined || lng === undefined) {
    return null;
  }

  const openingHours = tags['opening_hours'];
  const { isOpen, isOpen24h, status } = inferOpenStatus(openingHours);

  return {
    id: `osm-${element.type}-${element.id}`,
    placeId: `osm-${element.type}-${element.id}`,
    name: tags['name'] || 'Pharmacie locale',
    address: buildAddress(tags),
    distance: origin ? `${calculateDistance(origin.lat, origin.lng, lat, lng).toFixed(1)} km` : '--',
    phone: tags['phone'] || tags['contact:phone'] || 'Non disponible',
    hours: {
      'Horaires': openingHours || 'Non renseignes',
    },
    services: [],
    isOpen,
    isOpen24h,
    offersPCR: false,
    offersVaccines: false,
    status,
    openUntil: isOpen24h ? '24h/24' : '--:--',
    rating: 4.0,
    reviews: [],
    latitude: lat,
    longitude: lng,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function validateCoordinates(latitude: number, longitude: number): void {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Coordonnees invalides');
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error('Coordonnees hors limites');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cacheKey(latitude: number, longitude: number, radiusKm: number, limit: number): string {
  const latKey = latitude.toFixed(3);
  const lngKey = longitude.toFixed(3);
  const radiusKey = radiusKm.toFixed(0);
  return `${latKey}:${lngKey}:${radiusKey}:${limit}`;
}

function dedupeAndSort(items: Pharmacy[], limit: number): Pharmacy[] {
  const sorted = items.sort((a, b) => {
    const aDistance = parseFloat(a.distance);
    const bDistance = parseFloat(b.distance);
    return aDistance - bDistance;
  });

  const unique = sorted.filter((item, index, arr) => {
    return arr.findIndex((candidate) => candidate.name === item.name && candidate.address === item.address) === index;
  });

  return unique.slice(0, limit);
}

function buildQuery(latitude: number, longitude: number, radiusMeters: number): string {
  return `
[out:json][timeout:25];
(
  node["amenity"="pharmacy"](around:${radiusMeters},${latitude},${longitude});
  way["amenity"="pharmacy"](around:${radiusMeters},${latitude},${longitude});
  relation["amenity"="pharmacy"](around:${radiusMeters},${latitude},${longitude});
);
out center tags;
`;
}

async function fetchOverpass(endpoint: string, query: string): Promise<OverpassResponse> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES_PER_ENDPOINT; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (!RETRYABLE_STATUS.has(response.status) || attempt === MAX_RETRIES_PER_ENDPOINT) {
          throw new Error(`HTTP ${response.status}`);
        }
        await sleep(300 * Math.pow(2, attempt));
        continue;
      }

      return (await response.json()) as OverpassResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      if (attempt === MAX_RETRIES_PER_ENDPOINT) {
        break;
      }
      await sleep(300 * Math.pow(2, attempt));
    }
  }

  throw new Error(lastError instanceof Error ? lastError.message : 'Erreur reseau Overpass');
}

export async function fetchNearbyPharmacies(
  latitude: number,
  longitude: number,
  options?: { radiusKm?: number; limit?: number }
): Promise<Pharmacy[]> {
  validateCoordinates(latitude, longitude);

  const radiusKm = clamp(options?.radiusKm ?? 25, 1, 200);
  const limit = Math.round(clamp(options?.limit ?? 40, 1, 120));
  const expandedRadiusKm = [radiusKm, clamp(radiusKm * 2, radiusKm + 5, 200), clamp(radiusKm * 4, radiusKm + 10, 200)]
    .filter((value, index, arr) => arr.indexOf(value) === index);

  const primaryCacheKey = cacheKey(latitude, longitude, radiusKm, limit);
  const cached = nearbyCache.get(primaryCacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.items;
  }

  let lastError: unknown = null;

  for (const currentRadiusKm of expandedRadiusKm) {
    const radiusMeters = Math.round(currentRadiusKm * 1000);
    const query = buildQuery(latitude, longitude, radiusMeters);

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const data = await fetchOverpass(endpoint, query);
        const mapped = (data.elements ?? [])
          .map((element) => toPharmacy(element, { lat: latitude, lng: longitude }))
          .filter((value): value is Pharmacy => value !== null);

        const unique = dedupeAndSort(mapped, limit);

        if (unique.length > 0) {
          unique.forEach((pharmacy) => knownPharmacies.set(pharmacy.id, pharmacy));
          nearbyCache.set(primaryCacheKey, { timestamp: Date.now(), items: unique });
          return unique;
        }
      } catch (error) {
        lastError = error;
      }
    }
  }

  if (lastError) {
    throw new Error(lastError instanceof Error ? lastError.message : 'Impossible de recuperer les pharmacies a proximite');
  }

  return [];
}

export function isOsmPharmacyId(id: string): boolean {
  return OSM_ID_PATTERN.test(id);
}

export function getKnownPharmacy(id: string): Pharmacy | undefined {
  return staticPharmacies.find((pharmacy) => pharmacy.id === id) ?? knownPharmacies.get(id);
}

// Requetes par id en cours, pour ne pas interroger Overpass deux fois pour la meme pharmacie
const pendingById = new Map<string, Promise<Pharmacy | null>>();

// Recupere une pharmacie OSM par son id (utile apres un rechargement de page)
export function fetchPharmacyById(id: string): Promise<Pharmacy | null> {
  const known = getKnownPharmacy(id);
  if (known) return Promise.resolve(known);

  const pending = pendingById.get(id);
  if (pending) return pending;

  const request = fetchOsmPharmacy(id).finally(() => pendingById.delete(id));
  pendingById.set(id, request);
  return request;
}

async function fetchOsmPharmacy(id: string): Promise<Pharmacy | null> {
  const match = OSM_ID_PATTERN.exec(id);
  if (!match) return null;

  const [, type, osmId] = match;
  const query = `[out:json][timeout:25];${type}(${osmId});out center tags;`;
  let lastError: unknown = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const data = await fetchOverpass(endpoint, query);
      const element = data.elements?.[0];
      const pharmacy = element ? toPharmacy(element) : null;
      if (pharmacy) knownPharmacies.set(pharmacy.id, pharmacy);
      return pharmacy;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(lastError instanceof Error ? lastError.message : 'Impossible de recuperer la pharmacie');
}
