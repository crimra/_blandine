import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';

export default function Account() {
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <TopAppBar />
      <main className="pt-24 px-5 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Mon Compte
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Informations de contact et contribution communautaire.
          </p>
        </div>

        <section
          className="rounded-2xl p-5 border mb-4"
          style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="font-headline font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>
            Contact de l'application
          </h2>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Email: support@blandine.app</p>
            <p>WhatsApp: +242 06 000 00 00</p>
            <p>Zone couverte: Brazzaville, Pointe-Noire (extension en cours)</p>
          </div>
        </section>

        <a
          href="https://www.google.com/business/"
          target="_blank"
          rel="noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl font-semibold"
          style={{ backgroundColor: 'var(--secondary)', color: '#000000' }}
        >
          <span className="material-symbols-outlined">add_location_alt</span>
          Suggérer une pharmacie
        </a>
      </main>
      <BottomNav />
    </div>
  );
}
