import type { Pharmacy, Review } from '../types/pharmacy';

const reviews: Review[] = [
  {
    id: '1',
    author: 'Jean Dupont',
    rating: 5,
    date: 'Il y a 2 jours',
    text: 'Équipe très accueillante et professionnelle. Ils ont pris le temps de m\'expliquer le traitement avec beaucoup de patience. Je recommande vivement cette pharmacie.',
    avatar: 'JD'
  },
  {
    id: '2',
    author: 'Sophie Martin',
    rating: 4,
    date: 'Il y a 1 semaine',
    text: 'Toujours bien achalandée. J\'ai pu trouver mon matériel médical spécifique sans délai. Le service de test COVID est rapide.',
    avatar: 'SM'
  }
];

export const pharmacies: Pharmacy[] = [
  {
    id: '1',
    name: 'Pharmacie du Grand Siècle',
    address: '42 Avenue de la République, 75011 Paris',
    distance: '0.4 km',
    phone: '+33 1 43 57 98 71',
    hours: {
      'Lundi': '08:30 – 20:00',
      'Mardi': '08:30 – 20:00',
      'Mercredi': '08:30 – 20:00',
      'Jeudi': '08:30 – 20:00',
      'Vendredi': '08:30 – 20:00',
      'Samedi': '09:00 – 19:00',
      'Dimanche': 'Fermé'
    },
    services: ['vaccines', 'biotech', 'wheelchair_pickup', 'orthopedics'],
    isOpen: true,
    openUntil: '20:00',
    rating: 4.8,
    reviews: reviews,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHm_W_I9covtiq0XLka2YJbNB-QeFJB1MTg80WyWERaCIFq70UZyYNXa84JmmRYkgT-kPySsnuRAHMk6uNqmjoUxCcIAMkgB4oP2Ng7ibAf9tNuBoadAGbSFNuFtdsJ9_zpqGdOJh_E6ijsoLC73RJJ_WrmSwhuVh2DLuYWYiFqM5Xb7l4NWC9uNgZCvBgB9ed-pv4pP-F24valEK9pfBu93oNZ0rFYKfhFdq-5IZHjW_q7LH6MbVh3OHWBnMfszg2_pGXRqJNIpA'
  },
  {
    id: '2',
    name: 'Pharmacie des Lilas',
    address: 'Place de la Mairie, Pantin',
    distance: '1.8 km',
    phone: '+33 1 48 91 23 45',
    hours: {
      'Lundi': '08:00 – 21:00',
      'Mardi': '08:00 – 21:00',
      'Mercredi': '08:00 – 21:00',
      'Jeudi': '08:00 – 21:00',
      'Vendredi': '08:00 – 21:00',
      'Samedi': '08:30 – 20:00',
      'Dimanche': 'Fermé'
    },
    services: ['vaccines', 'biotech'],
    isOpen: true,
    openUntil: '21:00',
    rating: 4.6,
    reviews: reviews,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2-LrVqwqz7K5v-4L5Z5jM_q_zq8'
  },
  {
    id: '3',
    name: 'Pharmacie Centrale H24',
    address: '8 Rue de Rivoli, Paris',
    distance: '3.2 km',
    phone: '+33 1 42 61 23 89',
    hours: {
      'Lundi': '00:00 – 23:59',
      'Mardi': '00:00 – 23:59',
      'Mercredi': '00:00 – 23:59',
      'Jeudi': '00:00 – 23:59',
      'Vendredi': '00:00 – 23:59',
      'Samedi': '00:00 – 23:59',
      'Dimanche': '00:00 – 23:59'
    },
    services: ['vaccines', 'biotech', 'wheelchair_pickup'],
    isOpen: true,
    openUntil: '23:59',
    rating: 4.5,
    reviews: reviews,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2-LrVqwqz7K5v-4L5Z5jM_q_zq8'
  }
];
