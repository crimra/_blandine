import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';

export default function OnDuty() {
  return (
    <div className="bg-background min-h-screen pb-20">
      <TopAppBar />
      <main className="pt-24 px-5 max-w-2xl mx-auto">
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-primary mb-4 block">medical_services</span>
          <h1 className="font-headline font-bold text-2xl text-on-surface mb-2">
            Pharmacies de Garde
          </h1>
          <p className="text-on-surface-variant">
            Retrouvez les pharmacies de garde en temps réel
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
