import { useEffect, useState } from 'react';
import type { Pharmacy } from '../types/pharmacy';
import { fetchPharmacyById, getKnownPharmacy, isOsmPharmacyId } from '../services/pharmacyApi';

type FetchedPharmacy = { id: string; pharmacy: Pharmacy | null };

// Retrouve une pharmacie par id : donnees statiques, deja chargees, ou via Overpass pour les ids OSM
export function usePharmacy(id?: string) {
  const known = id ? getKnownPharmacy(id) : undefined;
  const [fetched, setFetched] = useState<FetchedPharmacy | null>(null);

  useEffect(() => {
    if (!id || getKnownPharmacy(id) || !isOsmPharmacyId(id)) return;

    let cancelled = false;
    fetchPharmacyById(id)
      .then((pharmacy) => {
        if (!cancelled) setFetched({ id, pharmacy });
      })
      .catch(() => {
        if (!cancelled) setFetched({ id, pharmacy: null });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (known) return { pharmacy: known, loading: false };
  if (fetched && fetched.id === id) return { pharmacy: fetched.pharmacy, loading: false };
  return { pharmacy: null, loading: !!id && isOsmPharmacyId(id) };
}
