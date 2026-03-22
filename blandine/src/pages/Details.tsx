import { useParams } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import { pharmacies } from '../data/pharmacies';

export default function Details() {
  const { id } = useParams();
  const pharmacy = pharmacies.find(p => p.id === id);

  if (!pharmacy) {
    return <div>Pharmacie non trouvée</div>;
  }

  return (
    <div className="bg-background text-on-background min-h-screen pb-24">
      <TopAppBar showBack={true} />
      <main className="pt-16 max-w-2xl mx-auto">
        {/* Hero Section */}
        <section className="relative h-72 md:h-96 w-full overflow-hidden">
          <img
            alt={pharmacy.name}
            className="w-full h-full object-cover"
            src={pharmacy.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCHm_W_I9covtiq0XLka2YJbNB-QeFJB1MTg80WyWERaCIFq70UZyYNXa84JmmRYkgT-kPySsnuRAHMk6uNqmjoUxCcIAMkgB4oP2Ng7ibAf9tNuBoadAGbSFNuFtdsJ9_zpqGdOJh_E6ijsoLC73RJJ_WrmSwhuVh2DLuYWYiFqM5Xb7l4NWC9uNgZCvBgB9ed-pv4pP-F24valEK9pfBu93oNZ0rFYKfhFdq-5IZHjW_q7LH6MbVh3OHWBnMfszg2_pGXRqJNIpA"}
          />
          <div className="absolute bottom-6 right-6">
            <div className="bg-primary-fixed text-on-primary-fixed-variant px-4 py-2 rounded-full font-label text-sm font-semibold flex items-center shadow-lg">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
              Ouvert actuellement
            </div>
          </div>
        </section>

        {/* Pharmacy Header Information */}
        <section className="px-5 -mt-8 relative z-10">
          <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_8px_32px_rgba(25,28,30,0.06)] border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <div className="max-w-[70%]">
                <h1 className="text-3xl font-headline font-extrabold text-on-surface leading-tight tracking-tight">
                  {pharmacy.name}
                </h1>
                <p className="text-on-surface-variant font-body mt-2 leading-relaxed">{pharmacy.address}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-secondary font-headline font-bold text-lg">{pharmacy.distance}</span>
                <div className="flex items-center mt-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-[#FFB800]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span className="ml-1 font-bold">{pharmacy.rating}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <a 
                href={`${window.location.origin}/map?pharmacy=${id}`}
                className="flex-1 flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container py-4 rounded-xl font-semibold active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined">directions</span>
                Itinéraire
              </a>
              <a 
                href={`tel:${pharmacy?.phone || ''}`}
                className="flex-1 flex items-center justify-center gap-2 bg-surface-container-high text-on-surface py-4 rounded-xl font-semibold active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined">call</span>
                Appeler
              </a>
            </div>
          </div>
        </section>

        {/* Bento Grid: Services & Hours */}
        <section className="px-5 mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {/* Opening Hours Section */}
          <div className="bg-surface-container-low rounded-[2rem] p-6">
            <h3 className="font-headline font-bold text-lg mb-4 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span>
              Horaires
            </h3>
            <div className="space-y-3">
              {Object.entries(pharmacy.hours).map(([day, hours]) => (
                <div
                  key={day}
                  className={`flex justify-between items-center text-sm font-medium ${
                    day === 'Mardi'
                      ? 'text-primary bg-primary/5 py-1 px-2 -mx-2 rounded-lg font-bold'
                      : 'text-on-surface'
                  }`}
                >
                  <span className={day === 'Mardi' ? '' : 'text-on-surface-variant'}>{day}</span>
                  <span className={hours === 'Fermé' ? 'text-error' : ''}>{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-surface-container-low rounded-[2rem] p-6">
            <h3 className="font-headline font-bold text-lg mb-4 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">medical_services</span>
              Services
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {pharmacy.services.map((service) => (
                <div key={service} className="bg-surface-container-lowest p-4 rounded-2xl flex flex-col items-center text-center gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">{service}</span>
                  <span className="text-xs font-semibold text-on-surface">
                    {service === 'vaccines' && 'Vaccination'}
                    {service === 'biotech' && 'Tests COVID'}
                    {service === 'wheelchair_pickup' && 'Matériel Médical'}
                    {service === 'orthopedics' && 'Orthopédie'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="px-5 mt-8 mb-12">
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-headline font-bold text-2xl text-on-surface">Avis clients</h3>
            <button className="text-primary font-semibold text-sm hover:underline">Voir tout</button>
          </div>
          <div className="space-y-4">
            {pharmacy.reviews.map((review) => (
              <div key={review.id} className="bg-surface-container-lowest p-6 rounded-[2rem] border-outline-variant/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-on-tertiary-fixed">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{review.author}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className="material-symbols-outlined text-[14px] text-[#FFB800]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-on-surface-variant">{review.date}</span>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Fixed Main CTA Button */}
      <div className="fixed bottom-0 left-0 w-full p-5 bg-gradient-to-t from-background via-background/95 to-transparent z-40">
        <a 
          href={`${window.location.origin}/map?pharmacy=${id}`}
          className="w-full max-w-2xl mx-auto flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-container text-on-primary py-5 rounded-[1.5rem] font-bold text-lg shadow-xl hover:opacity-90 active:scale-[0.97] transition-all"
        >
          <span className="material-symbols-outlined">navigation</span>
          S'y rendre maintenant
        </a>
      </div>
    </div>
  );
}
