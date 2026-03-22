export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  hours: {
    [day: string]: string;
  };
  services: string[];
  isOpen: boolean;
  isOpen24h?: boolean;
  offersPCR?: boolean;
  offersVaccines?: boolean;
  openUntil?: string;
  rating: number;
  reviews: Review[];
  image?: string;
  latitude?: number;
  longitude?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  avatar: string;
}
