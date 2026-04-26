import { Link } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import { pharmacies } from '../data/pharmacies';
import { isPharmacyOpenNow } from '../utils/availability';

export default function OnDuty() {
  const guardPharmacies = pharmacies.filter((pharmacy) => pharmacy.status === 'guard');

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <TopAppBar />
      <main className="pt-24 px-5 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Pharmacies de Garde
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Disponibles en priorite pour les besoins urgents.
          </p>
        </div>

        <div className="space-y-4 pb-8">
          {guardPharmacies.map((pharmacy) => {
            const isOpen = isPharmacyOpenNow(undefined, pharmacy.isOpen);

            return (
              <article
                key={pharmacy.id}
                className="rounded-2xl p-5 border"
                style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-headline font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                      {pharmacy.name}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {pharmacy.address}
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: isOpen ? 'rgba(0, 214, 143, 0.2)' : 'rgba(255, 77, 109, 0.2)',
                      color: isOpen ? 'var(--primary)' : 'var(--accent-error)'
                    }}
                  >
                    {isOpen ? 'OUVERT' : 'FERME'}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="flex-1 py-3 rounded-xl text-center font-semibold"
                    style={{ backgroundColor: 'var(--primary)', color: '#000000' }}
                  >
                    Contacter
                  </a>
                  <Link
                    to={`/map?placeId=${encodeURIComponent(pharmacy.placeId ?? pharmacy.id)}`}
                    className="flex-1 py-3 rounded-xl text-center font-semibold"
                    style={{ backgroundColor: 'var(--secondary)', color: '#000000' }}
                  >
                    Itineraire
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
