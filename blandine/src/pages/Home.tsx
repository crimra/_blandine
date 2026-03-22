import { Link } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import PharmacyCard from '../components/PharmacyCard';
import { pharmacies } from '../data/pharmacies';

export default function Home() {
  const nearestPharmacy = pharmacies[0];
  const otherPharmacies = pharmacies.slice(1);

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <TopAppBar />
      <main className="pt-24 pb-32 px-5 max-w-2xl mx-auto min-h-screen">
        {/* Hero Section & Info Message */}
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-headline font-extrabold text-3xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Pharmacies de Garde
            </h2>
          </div>
          <div className="border-l-4 rounded-xl p-5 mb-8" style={{ backgroundColor: 'rgba(0, 214, 143, 0.1)', borderColor: 'var(--primary)' }}>
            <div className="flex gap-4">
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>info</span>
              <div>
                <p className="font-label font-semibold text-sm mb-1 uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
                  Information Importante
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Les pharmacies de garde assurent la continuité des soins la nuit, les dimanches et jours fériés. Une majoration de garde peut être appliquée. En cas d'urgence vitale, contactez le 15.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Priority Card (Bento Style) */}
        <section className="space-y-6">
          <PharmacyCard pharmacy={nearestPharmacy} variant="featured" />

          {/* List Section */}
          <div className="space-y-4">
            <h4 className="font-headline font-bold text-lg px-2" style={{ color: 'var(--text-primary)' }}>
              Autres pharmacies ouvertes
            </h4>
            {otherPharmacies.map((pharmacy) => (
              <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
            ))}
          </div>

          {/* Map Quick Access */}
          <section className="mt-12">
            <div className="relative h-48 rounded-[2rem] overflow-hidden shadow-sm group">
              <img
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 transition-all duration-500"
                alt="Carte des pharmacies"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuByA_1ikfNoNiZrgXnsMv5kKsE6YG76YwW3-UQhh2iD_BW5itp56jnaGIgF5MV3lR0U4cKo_U-fsNi2qypjWG1M9AlzeIs747Rt-5Q56or4_0mlfdR00gXjgRkZK7eCYJIpcKRcekIfkCLQIpMhoxOLbzMDTJKD9TZjIaRY3imPDZcTMsXLlPOwWeXq613kKkt0t-l96zc-qNmCE1T0wJ7uHwe7zLnBEmkISUgfj2t-q4qSwHT0vZPU8qnpMGYY8lDrsdWtYa6WRWk"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white font-bold text-lg">Voir sur la carte</p>
                    <p className="text-white/80 text-xs">Visualisez les pharmacies de garde autour de vous</p>
                  </div>
                  <Link
                    to="/map"
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    style={{ backgroundColor: 'var(--primary)', color: '#000000' }}
                  >
                    <span className="material-symbols-outlined">map</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
