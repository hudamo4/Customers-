export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  city: string;
  points: number;
  membership: string;
  avatar: string;
}

export interface JourneyStep {
  title: string;
  description: string;
  time: string;
  location: string;
  icon: string;
  active: boolean;
}

export interface Shipment {
  id?: string;
  userId: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery: string;
  expectedArrivalDate?: string;
  weight: string;
  items: string;
  service: string;
  origin: string;
  currentLocation: string;
  journey: JourneyStep[];
}

export interface Invoice {
  id?: string;
  userId: string;
  invoiceId: string;
  store: string;
  order_id: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending';
  shippingStatus?: string;
  itemsList?: { name: string; quantity: string; price: string; image?: string }[];
  customerName?: string;
  customerPhone?: string;
  customerCity?: string;
  shippingCost?: string;
  itemsTotal?: string;
  rating?: number;
  ratingComment?: string;
  ratingDate?: string;
}

export interface NotificationDetail {
  id?: string;
  userId: string;
  notificationId: string;
  type: 'shipment' | 'offer' | 'invoice';
  title: string;
  content: string;
  time: string;
  image?: string;
  icon?: string;
  action?: string;
  read: boolean;
}

export interface StoreCustomization {
  id: string;
  name: string;
  rate: string;
  duration: string;
  details: string;
  image?: string;
}

export interface PresetProductCustomization {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface AppCustomizations {
  heroImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  showStores: boolean;
  showLoyalty: boolean;
  showBanners: boolean;
  announcementText: string;
  showAnnouncement: boolean;
  supportedStores: StoreCustomization[];
  presetProducts: PresetProductCustomization[];
  rates: {
    baghdad: string;
    babel: string;
    provinces: string;
  };
  bankInfo: {
    superkey: string;
    holderName: string;
    zainCash: string;
    zainHolder: string;
  };
  socials: {
    whatsapp: string;
    instagram: string;
    facebook: string;
    website: string;
  };
  // Full-app customizable fields (banners, mascots, and texts)
  homeFooterMascotUrl?: string;
  homeFooterMascotQuote?: string;
  homeFooterMascotAuthor?: string;
  trackingBatootMascotUrl?: string;
  trackingBatootQuote?: string;
  trackingSupportAgentUrl?: string;
  trackingSupportTitle?: string;
  trackingSupportQuote?: string;
  invoiceInstructionText?: string;
  notificationsBannerUrl?: string;
  notificationsWelcomeText?: string;
  iraqRates?: { province: string; rate: string; }[];
  invoiceHadooshaImageUrl?: string;
  mastercardExpiry?: string;
  mastercardCvv?: string;
}

