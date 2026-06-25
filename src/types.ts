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
