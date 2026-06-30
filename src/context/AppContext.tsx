import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, collection, query, where, onSnapshot, updateDoc, deleteDoc, addDoc, setDoc, serverTimestamp, getDoc, getDocs } from 'firebase/firestore';
import { db, setupAuthListener, seedInitialDataIfEmpty, auth } from '../lib/firebase';
import { UserProfile, Shipment, Invoice, NotificationDetail, AppCustomizations } from '../types';
import { DEFAULT_AVATAR } from '../utils/avatar';

export type TabType = 'dashboard' | 'tracking' | 'invoices' | 'profile' | 'notifications';

interface AppContextType {
  user: User | null;
  profile: UserProfile | null;
  shipments: Shipment[];
  invoices: Invoice[];
  notifications: NotificationDetail[];
  customizations: AppCustomizations;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedShipmentId: string | null;
  setSelectedShipmentId: (id: string | null) => void;
  loading: boolean;
  appMode: 'customer' | 'manager';
  setAppMode: (mode: 'customer' | 'manager') => void;
  updateProfile: (
    name: string,
    phone: string,
    city: string,
    walletBalance?: number,
    savedCardNumber?: string,
    savedCardHolder?: string,
    savedCardExpiry?: string
  ) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  markNotificationAsRead: (notifId: string) => Promise<void>;
  redeemPoints: (amount: number) => Promise<void>;
  addShipment: (shipment: Shipment) => Promise<void>;
  deleteShipment: (id: string) => Promise<void>;
  clearAllShipments: () => Promise<void>;
  addNotification: (notif: Omit<NotificationDetail, 'id' | 'userId'>) => Promise<void>;
  updateShipmentStatus: (
    shipmentId: string, 
    newStatus: string, 
    transitParams?: { transitType: 'air' | 'sea', transitSpeed: number, transitAltitude: number, simulatedProgress: number }
  ) => Promise<void>;
  payInvoice: (invoiceId: string) => Promise<void>;
  addInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  clearAllInvoices: () => Promise<void>;
  rateInvoice: (invoiceId: string, rating: number, comment?: string) => Promise<void>;
  updateCustomizations: (cust: Partial<AppCustomizations>) => Promise<void>;
  updateAvatar: (avatar: string) => Promise<void>;
  isLoggedIn: boolean;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, phone: string, name: string, password: string, city: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial fallback mock data for local storage seeding
const DEFAULT_PROFILE: UserProfile = {
  uid: 'local_user',
  name: 'الزبونة الكريمة',
  phone: '+964 770 123 4567',
  city: 'بغداد، العراق',
  points: 1250,
  membership: 'عضوية ذهبية',
  avatar: DEFAULT_AVATAR,
  walletBalance: 250000,
  savedCardNumber: '5412 7500 1234 5678',
  savedCardHolder: 'AMNA AL-IRAQ',
  savedCardExpiry: '12/28'
};

const DEFAULT_SHIPMENTS: Shipment[] = [
  {
    id: 'local_shipment_1',
    userId: 'local_user',
    trackingNumber: 'IRA-99201-XQ',
    status: 'وصلت مطار بغداد',
    estimatedDelivery: '24 أكتوبر 2023',
    expectedArrivalDate: '26 أكتوبر 2023',
    weight: '2.45 كجم',
    items: '3 قطع',
    service: 'شحن جوي سريع',
    origin: 'Shein (China)',
    currentLocation: 'منطقة الشحن بمطار بغداد الدولي',
    journey: [
      { title: "وصلت إلى بغداد (BGW Hub)", description: "التخليص الجمركي جاري حالياً في مطار بغداد الدولي.", time: "اليوم، 10:45 ص", location: "بغداد، العراق", icon: "MapPin", active: true },
      { title: "غادرت مركز دبي (UAE Hub)", description: "الشحنة غادرت مركز التوزيع الإقليمي متجهة إلى العراق.", time: "أمس، 11:20 م", location: "دبي، الإمارات", icon: "Plane", active: false },
      { title: "وصلت مركز الكويت (KUW Hub)", description: "نقطة توقف للشحنات البحرية والجوية القادمة من شرق آسيا.", time: "21 أكتوبر، 04:00 م", location: "الكويت", icon: "GitMerge", active: false },
      { title: "غادرت منشأة غوانزو (Guangzhou)", description: "تم فرز الطرود وتجهيزها للشحن الدولي.", time: "20 أكتوبر، 09:15 ص", location: "غوانزو، الصين", icon: "Box", active: false },
      { title: "تم تأكيد الطلب", description: "البائع أكد طلبك ويقوم بتجهيز الطرد.", time: "18 أكتوبر، 02:30 م", location: "شينزين، الصين", icon: "ShoppingBag", active: false }
    ]
  }
];

const DEFAULT_INVOICES: Invoice[] = [
  { id: 'local_inv_1', userId: 'local_user', invoiceId: 'INV-7829', store: 'Shein', order_id: 'SH9021883', date: '2023-10-24', amount: '125,000 د.ع', status: 'Paid', shippingStatus: 'وصلت مطار بغداد' },
  { id: 'local_inv_2', userId: 'local_user', invoiceId: 'INV-7830', store: 'AliExpress', order_id: 'AX4429910', date: '2023-10-22', amount: '45,500 د.ع', status: 'Pending', shippingStatus: 'قيد المعالجة في المستودع' },
  { id: 'local_inv_3', userId: 'local_user', invoiceId: 'INV-7831', store: 'Amazon AE', order_id: 'AMZ-33210-9', date: '2023-10-15', amount: '210,000 د.ع', status: 'Paid', shippingStatus: 'تم التسليم لشركة التوصيل' },
  { id: 'local_inv_4', userId: 'local_user', invoiceId: 'INV-7832', store: 'Trendyol', order_id: 'TR-772188', date: '2023-10-05', amount: '89,000 د.ع', status: 'Paid', shippingStatus: 'تم التسليم للزبون' }
];

const DEFAULT_NOTIFICATIONS: NotificationDetail[] = [
  {
    id: 'local_notif_3',
    userId: 'local_user',
    notificationId: 'notif_3',
    type: 'invoice',
    title: 'تأكيد الدفع',
    content: 'تم استلام مبلغ الطلب #IR-9023. شكراً لثقتكِ بنا.',
    time: '٢ س',
    icon: 'CheckCircle',
    read: true
  },
  {
    id: 'local_notif_4',
    userId: 'local_user',
    notificationId: 'notif_4',
    type: 'offer',
    title: 'تخفيضات حصرية',
    content: 'خصومات تصل إلى ٣٠٪ على تشكيلة الخريف الجديدة!',
    time: 'أمس',
    icon: 'Sparkles',
    read: true
  }
];

export const DEFAULT_CUSTOMIZATIONS: AppCustomizations = {
  heroImageUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLs7M6Yg7Yd4TtEvkYvHWuFLa4sqCmyFU4xbTd0gc1JWOUaOtMJrX2oCBWsecPrXKVQ4rWPRAE81BJUclFQ9hcjIwd1DcZSBM5h_gHUg3ugB-AKJSuGQ4-unn6Z8e7LoQ9DP8Vx87nAaBbqttEzIDfrWQSEMvv7M7CQ0dhPEf4vVt9RSg5yzRe8_V_PQICnoHUGYEMdGL0xYFPlWfwArGud6nFBBWis1UivPxaljrjLjHSXxT3xWcLE1dcs',
  heroTitle: 'مرحباً، {name}!',
  heroSubtitle: 'أهلاً بكِ في عالم هدوشة وبطوط',
  banners: [
    {
      id: 'banner_1',
      imageUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLs7M6Yg7Yd4TtEvkYvHWuFLa4sqCmyFU4xbTd0gc1JWOUaOtMJrX2oCBWsecPrXKVQ4rWPRAE81BJUclFQ9hcjIwd1DcZSBM5h_gHUg3ugB-AKJSuGQ4-unn6Z8e7LoQ9DP8Vx87nAaBbqttEzIDfrWQSEMvv7M7CQ0dhPEf4vVt9RSg5yzRe8_V_PQICnoHUGYEMdGL0xYFPlWfwArGud6nFBBWis1UivPxaljrjLjHSXxT3xWcLE1dcs',
      title: 'مرحباً، {name}! ✨',
      subtitle: 'أهلاً بكِ في عالم هدوشة وبطوط 💖'
    },
    {
      id: 'banner_2',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
      title: 'شحن مخفض من Shein الكويت! 🛍️',
      subtitle: 'فقط 5,000 د.ع لكل كغم مع شحن جوي سريع!'
    },
    {
      id: 'banner_3',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
      title: 'أقوى مستحضرات التجميل الأصلية 💄',
      subtitle: 'شحن مضمون 100% من أشهر الماركات العالمية لباب بيتكِ'
    }
  ],
  showStores: true,
  showLoyalty: true,
  showOnboarding: true,
  showBanners: true,
  announcementText: '🌟 أهلاً بكِ في إيرامو ستور! الشحن الأسرع والتوصيل الأرقى في العراق 💖',
  showAnnouncement: true,
  supportedStores: [
    {
      id: 'store_1',
      name: 'Shein الامارات',
      rate: '12,000 د.ع / كغم',
      duration: '7 - 10 أيام شحن جوي سريع',
      details: 'أحدث صيحات الموضة والجمال بوزن دقيق وتوصيل سريع من مستودعنا في دبي مباشرة إلى العراق.'
    },
    {
      id: 'store_2',
      name: 'Shein الكويت',
      rate: '5,000 د.ع / كغم',
      duration: '7 - 10 أيام شحن جوي سريع',
      details: 'أحدث صيحات الموضة والجمال بأفضل سعر شحن على الإطلاق وتوصيل سريع من مستودعنا في الكويت.'
    },
    {
      id: 'store_3',
      name: 'AliExpress',
      rate: '12,500 د.ع / كغم',
      duration: '10 - 15 يوم شحن جوي',
      details: 'التسوق الأسهل بأسعار المصنع وشحن آمن عبر مطار بغداد الدولي.'
    },
    {
      id: 'store_4',
      name: 'Temu',
      rate: '13,000 د.ع / كغم',
      duration: '8 - 12 يوم شحن جوي',
      details: 'تسوقي بذكاء ووفرة من تيمو مع تجميع فوري للطرود وشحن جوي سريع وآمن.'
    },
    {
      id: 'store_5',
      name: 'Taobao',
      rate: '16,500 د.ع / كغم',
      duration: '12 - 18 يوم شحن جوي',
      details: 'تسوقي من أكبر المتاجر الصينية للملابس والمنتجات المنزلية بأسعارها الحقيقية مع شحن وزن حقيقي.'
    },
    {
      id: 'store_6',
      name: '1688',
      rate: '16,500 د.ع / كغم',
      duration: '14 - 20 يوم شحن جوي',
      details: 'تسوق الجملة المباشر من المصانع الصينية بأسعار خيالية. مثالي للمشاريع والطلبات الكبيرة.'
    },
    {
      id: 'store_7',
      name: 'iHerb',
      rate: '15,000 د.ع / كغم',
      duration: '6 - 9 أيام شحن جوي سريع',
      details: 'المكملات الغذائية، الفيتامينات، ومستحضرات العناية الطبيعية الموثوقة مباشرة إلى العراق.'
    },
    {
      id: 'store_8',
      name: 'سيفورا',
      rate: '16,000 د.ع / كغم',
      duration: '7 - 10 أيام شحن جوي',
      details: 'الماركات والمستحضرات الأصلية الفاخرة من سيفورا العالمية للتجميل لضمان الجودة والأصالة بنسبة 100%.'
    },
    {
      id: 'store_9',
      name: 'بوتيكات',
      rate: '13,500 د.ع / كغم',
      duration: '5 - 8 أيام شحن سريع',
      details: 'أكبر متجر تجميل وعطور في الكويت والخليج العربي. تسوقي اختيارات المشاهير لتصلكِ لباب البيت.'
    },
    {
      id: 'store_10',
      name: 'تريندول تركيا والكويت',
      rate: '11,000 د.ع / كغم',
      duration: '8 - 12 يوم جوي',
      details: 'أرقى الماركات التركية والملابس الأنيقة من تريندول مباشرة من مستودعات تركيا والكويت للعراق.'
    },
    {
      id: 'store_11',
      name: 'YesStyle',
      rate: '15,500 د.ع / كغم',
      duration: '9 - 14 يوم شحن جوي',
      details: 'أفضل منتجات الجمال الكورية واليابانية ومنتجات العناية الفائقة من أشهر الماركات الآسيوية.'
    },
    {
      id: 'store_12',
      name: 'K-Secret',
      rate: '15,500 د.ع / كغم',
      duration: '7 - 11 يوم شحن سريع',
      details: 'منتجات العناية بالبشرة الكورية الأكثر شهرة وتأثيراً للتفتيح والنضارة الفائقة مباشرة من كوريا.'
    }
  ],
  presetProducts: [
    {
      id: 'prod_1',
      name: 'أحمر شفاه كريمي مطفأ - هدى بيوتي',
      price: 15000,
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200',
      category: 'مكياج'
    },
    {
      id: 'prod_2',
      name: 'عطر ديور جادور - أو دو بارفيوم فاخر',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200',
      category: 'عطور'
    },
    {
      id: 'prod_3',
      name: 'حقيبة يد شانيل كلاسيكية جلد فاخر',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200',
      category: 'حقائب'
    },
    {
      id: 'prod_4',
      name: 'سيروم حمض الهيالورونيك المرطب - لوريال',
      price: 22000,
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200',
      category: 'عناية بالبشرة'
    },
    {
      id: 'prod_5',
      name: 'لوحة ظلال عيون مطفية ولامعة - ريفلوشن',
      price: 20000,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=200',
      category: 'مكياج'
    },
    {
      id: 'prod_6',
      name: 'فستان تركي طويل مخملي راقي',
      price: 65000,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200',
      category: 'ملابس'
    }
  ],
  rates: {
    baghdad: '5,000 د.ع',
    babel: '3,000 د.ع',
    provinces: '5,000 د.ع'
  },
  iraqRates: [
    { province: 'بغداد', rate: '5,000 د.ع' },
    { province: 'بابل', rate: '3,000 د.ع' },
    { province: 'البصرة', rate: '5,000 د.ع' },
    { province: 'نينوى', rate: '5,000 د.ع' },
    { province: 'أربيل', rate: '5,000 د.ع' },
    { province: 'النجف', rate: '5,000 د.ع' },
    { province: 'كربلاء', rate: '5,000 د.ع' },
    { province: 'ذي قار', rate: '5,000 د.ع' },
    { province: 'القادسية', rate: '5,000 د.ع' },
    { province: 'ميسان', rate: '5,000 د.ع' },
    { province: 'المثنى', rate: '5,000 د.ع' },
    { province: 'الأنبار', rate: '5,000 د.ع' },
    { province: 'صلاح الدين', rate: '5,000 د.ع' },
    { province: 'ديالى', rate: '5,000 د.ع' },
    { province: 'كركوك', rate: '5,000 د.ع' },
    { province: 'السليمانية', rate: '5,000 د.ع' },
    { province: 'دهوك', rate: '5,000 د.ع' },
    { province: 'واسط', rate: '5,000 د.ع' },
    { province: 'حلبجة', rate: '5,000 د.ع' }
  ],
  bankInfo: {
    superkey: 'SK-9988-7766-5544',
    holderName: 'شركة إيرامو للتجارة المحدودة',
    zainCash: '0780 000 0000',
    zainHolder: 'IRAMO STORE ADMIN'
  },
  socials: {
    instagram: '@iramo.store',
    instagramLink: 'https://instagram.com/iramo.store',
    facebook: 'Iramo Store',
    website: 'www.iramostore.com'
  },
  homeFooterMascotUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLs7xYMw1dlJILjhZ2VzHUgTES3bYmOtS532eeDn9JpDom3Gp-MaPoVhT_e495zabXi9PhvxGhgg_DGSwGWwf9dmXp5ZUWaJm0RCNd8GbCsm6Pfsr0iJJMO0aAxy5MOcRhILsJttChJdkmTm_mZbX5E5mSnfAvK48H_feUdzK0meAC_w_y8FpVIQyOMw7BefhhUleQ-yNPc9mOamo6Uhxfvs0PQtY8Tp68F3pQbyGpw3MPMMO_Rkhd2fSw',
  homeFooterMascotQuote: '"عزيزتي {name}، جمالك يبدأ من اهتمامك بنفسك. نحن هنا دائماً لنوفر لكِ الأفضل في شحن وتسوق متميز!"',
  homeFooterMascotAuthor: 'هدوشة وبطوط',
  trackingBatootMascotUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLtwlTtxpvh7CFWTWdRY_emR2xyBvTgx8v6zMnJSM8OrvnGrHK98fOcbdnwqMhudLD35tXhQRA9VBIsbRPIxBCWcjiseBr_ZThUYOO2bASORtpBXsEwGUlke9kqXDQGVw-0hzUjOQZGvkAbigP02pHzK4tU63vK7UVYFj3MEl6UjVilDvrlHzDZhs-o55NTjiE4kAtBK7MfYbaxsU0axIHNlMxqsY-z3Mq4P6X0iHTAI-TEqMLAdFD53L8',
  trackingBatootQuote: '"أتابع تحركاتها عبر الخط الجوي لحظة بلحظة لضمان وصولها الفاخر والأنيق إليكِ!"',
  trackingSupportAgentUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLsRDP-u1RVbBjPEYf7rJ-NdzHWJakwLt7gnAZNMGLmJKPkRp5rpXeC8sb5pwEylTN2ng-Ej4yLxT26yVa7z8G4fx0CEaYjweNfrJHiCoOunzf32_M1-IHBfo1X1eJC73JVMP7Xm6keYR3qlhCReRzr35xI83PDs_ic9AinBS3apKtGSMte4_f4rzjZ-Cl9ZbJhrmILvORTYacUoZPZAjRoOoTRQKRQaadOcYttwFAAPdgux4o4_N5p9flU',
  trackingSupportTitle: 'هل تحتاجين لمساعدة؟',
  trackingSupportQuote: 'خبراء الدعم اللوجستي متواجدون لمساعدتكِ طوال اليوم في تتبع الشحنات وحساب دقيق للأوزان.',
  invoiceInstructionText: 'الرجاء تحويل مبلغ الفاتورة الإجمالي إلى حساب المحفظة المعتمدة أدناه وإرفاق صورة التحويل أو إشعار الدفع لتأكيد الشحن الفوري.',
  notificationsBannerUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLs7M6Yg7Yd4TtEvkYvHWuFLa4sqCmyFU4xbTd0gc1JWOUaOtMJrX2oCBWsecPrXKVQ4rWPRAE81BJUclFQ9hcjIwd1DcZSBM5h_gHUg3ugB-AKJSuGQ4-unn6Z8e7LoQ9DP8Vx87nAaBbqttEzIDfrWQSEMvv7M7CQ0dhPEf4vVt9RSg5yzRe8_V_PQICnoHUGYEMdGL0xYFPlWfwArGud6nFBBWis1UivPxaljrjLjHSXxT3xWcLE1dcs',
  notificationsWelcomeText: 'مركز الإشعارات والتحديثات المباشرة لمعرفة خط سير شحناتكِ والخصومات أولاً بأول ✨',
  invoiceHadooshaImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDozyQcrL4Yfp5wLXW9Y-K0AeiCtSO2G3lZVMIyffDaIoEBlb_otr_uLGq-Drr0G6N0FS5d6-u6YBfHWJzesjiFbJdWnD15Ct9IDSO08EczvwkYAWgQgEP3d-v91GCN7bOyvBP_FftRv6BChSeEzC7BDbSMtH3DXgL1bbvle6xHA957rBT170X9F2Itu0sPNmwKRqwqkDVOI_Pw-dG5myf2pu5mCFrs-IUMx_XlMi2OYl5IjfQgqquSxEAaElda7W5e1ZN5LhTYUFQ',
  mastercardExpiry: '12/28',
  mastercardCvv: '345',
  spinWheelPrizes: [
    { label: '50 نقطة ولاء 🎁', amount: 50, type: 'points' },
    { label: 'حظ أوفر 🌸', amount: 0, type: 'points' },
    { label: '150 نقطة ولاء ✨', amount: 150, type: 'points' },
    { label: '5,000 د.ع رصيد 💳', amount: 5000, type: 'balance' },
    { label: '100 نقطة ولاء 💫', amount: 100, type: 'points' },
    { label: 'ألف د.ع رصيد محفظة 💰', amount: 1000, type: 'balance' }
  ],
  offeredServices: [
    { id: 'srv_1', title: 'الشحن الجوي السريع', description: 'من الصين والإمارات والكويت وتركيا لباب بيتكِ خلال 7-10 أيام فقط بدقة متناهية ودلال لا ينتهي.', iconName: 'Plane' },
    { id: 'srv_2', title: 'التسوق بالنيابة عنكِ', description: 'نوفر لكِ خدمة الشراء من كافة المواقع العالمية الفاخرة (Sephora, Shein, Temu) بدون عمولات معقدة.', iconName: 'ShoppingBag' },
    { id: 'srv_3', title: 'التوصيل الآمن لكافة المحافظات', description: 'شبكة لوجستية متطورة تغطي جميع مدن العراق لضمان وصول شحناتكِ مغلفة وبأفضل حال.', iconName: 'Truck' },
    { id: 'srv_4', title: 'تتبع الشحنات الذكي 3D', description: 'نظام متطور لمراقبة حركة سفينة أو طائرة الشحن بشكل حي وتفاعلي يواكب تحديثات خط السير.', iconName: 'Compass' }
  ],
  features: {
    loyaltySystem: true,
    aiAssistant: true,
    reviews: true,
    wishlist: true,
    notifications: true,
    flashSales: true,
    membershipCards: true,
    referrals: true,
    coupons: true,
    chatSupport: true
  }
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(DEFAULT_PROFILE);
  const [shipments, setShipments] = useState<Shipment[]>(DEFAULT_SHIPMENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(DEFAULT_INVOICES);
  const [notifications, setNotifications] = useState<NotificationDetail[]>(DEFAULT_NOTIFICATIONS);
  const [customizations, setCustomizations] = useState<AppCustomizations>(DEFAULT_CUSTOMIZATIONS);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [appMode, setAppMode] = useState<'customer' | 'manager'>('customer');

  useEffect(() => {
    // Setup auth and attempt real-time DB sync
    const unsubscribe = setupAuthListener(async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Attempt to seed Firestore but gracefully ignore permission/access failures
        try {
          await seedInitialDataIfEmpty(currentUser.uid);
        } catch (err) {
          console.warn("Firestore seeding skipped:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time profile listener reacting to user changes
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        const targetAvatar = DEFAULT_AVATAR;
        const oldAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9EaYCDGI3nnclPO4Dfn8I8RZWRNVEKBUb-qxzppoUDSSF0uOYRcTHzQEOvzXtqZyk5bVh4idglS262c_ZUgYdgA-h1OorPVThxh8UXI7GHoH2uDEhbQg2eVlFMYU4isBKM9I_0LSyYdiFMT_ttIH-xYE0KuXOFy-Kz_UIlEMn-XC4L9y1Vol5VvGdb1i51-vz5DCQ3rO23XQP4xhX_1niZMeMM8D-RuEUU1U-r7VqHSMTCi7iILOoNy4WG-WS3v4pxciGg6Rk_QE';
        if (!data.avatar || data.avatar === oldAvatar) {
          updateDoc(userDocRef, { avatar: targetAvatar }).catch((e) =>
            console.warn("Auto-updating profile avatar failed:", e)
          );
        }
        setProfile(data);
      }
    }, (error) => {
      console.warn("Firestore Profile real-time sync failed:", error.message);
    });

    return () => {
      unsubscribeUser();
    };
  }, [user]);

  // 3. Real-time collections listener reacting to role & auth state
  useEffect(() => {
    if (!user) return;

    const isAdmin = profile?.role === 'admin';

    // Real-time listener for shipments
    const shipmentsQuery = isAdmin
      ? collection(db, 'shipments')
      : query(collection(db, 'shipments'), where('userId', '==', user.uid));

    const unsubscribeShipments = onSnapshot(shipmentsQuery, (querySnap) => {
      const list: Shipment[] = [];
      querySnap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Shipment);
      });
      setShipments(list);
    }, (error) => {
      console.warn("Firestore Shipments real-time sync failed:", error.message);
    });

    // Real-time listener for invoices
    const invoicesQuery = isAdmin
      ? collection(db, 'invoices')
      : query(collection(db, 'invoices'), where('userId', '==', user.uid));

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (querySnap) => {
      const list: Invoice[] = [];
      querySnap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Invoice);
      });
      setInvoices(list);
    }, (error) => {
      console.warn("Firestore Invoices real-time sync failed:", error.message);
    });

    // Real-time listener for notifications
    const notificationsQuery = isAdmin
      ? collection(db, 'notifications')
      : query(collection(db, 'notifications'), where('userId', '==', user.uid));

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (querySnap) => {
      const list: NotificationDetail[] = [];
      querySnap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as NotificationDetail);
      });
      const sorted = [...list].sort((a, b) => {
        if (a.read === b.read) return 0;
        return a.read ? 1 : -1;
      });
      setNotifications(sorted);
    }, (error) => {
      console.warn("Firestore Notifications real-time sync failed:", error.message);
    });

    // Real-time listener for customizations
    const custDocRef = doc(db, 'settings', 'customizations');
    const unsubscribeCustomizations = onSnapshot(custDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const rawData = docSnap.data() as AppCustomizations;
        let data = { ...rawData };
        let healed = false;

        // 1. Correct spelling: "حدوشة" to "هدوشة" in texts
        if (data.heroSubtitle && data.heroSubtitle.includes('حدوشة')) {
          data.heroSubtitle = data.heroSubtitle.replace(/حدوشة/g, 'هدوشة');
          healed = true;
        }
        if (data.homeFooterMascotAuthor && data.homeFooterMascotAuthor.includes('حدوشة')) {
          data.homeFooterMascotAuthor = data.homeFooterMascotAuthor.replace(/حدوشة/g, 'هدوشة');
          healed = true;
        }

        // 2. Fallback default cute Pixar Hadoosha & Batoot mascot image URLs if empty
        const originalHero = 'https://lh3.googleusercontent.com/aida/AP1WRLs7M6Yg7Yd4TtEvkYvHWuFLa4sqCmyFU4xbTd0gc1JWOUaOtMJrX2oCBWsecPrXKVQ4rWPRAE81BJUclFQ9hcjIwd1DcZSBM5h_gHUg3ugB-AKJSuGQ4-unn6Z8e7LoQ9DP8Vx87nAaBbqttEzIDfrWQSEMvv7M7CQ0dhPEf4vVt9RSg5yzRe8_V_PQICnoHUGYEMdGL0xYFPlWfwArGud6nFBBWis1UivPxaljrjLjHSXxT3xWcLE1dcs';
        const originalHomeMascot = 'https://lh3.googleusercontent.com/aida/AP1WRLs7xYMw1dlJILjhZ2VzHUgTES3bYmOtS532eeDn9JpDom3Gp-MaPoVhT_e495zabXi9PhvxGhgg_DGSwGWwf9dmXp5ZUWaJm0RCNd8GbCsm6Pfsr0iJJMO0aAxy5MOcRhILsJttChJdkmTm_mZbX5E5mSnfAvK48H_feUdzK0meAC_w_y8FpVIQyOMw7BefhhUleQ-yNPc9mOamo6Uhxfvs0PQtY8Tp68F3pQbyGpw3MPMMO_Rkhd2fSw';
        const originalTrackingMascot = 'https://lh3.googleusercontent.com/aida/AP1WRLtwlTtxpvh7CFWTWdRY_emR2xyBvTgx8v6zMnJSM8OrvnGrHK98fOcbdnwqMhudLD35tXhQRA9VBIsbRPIxBCWcjiseBr_ZThUYOO2bASORtpBXsEwGUlke9kqXDQGVw-0hzUjOQZGvkAbigP02pHzK4tU63vK7UVYFj3MEl6UjVilDvrlHzDZhs-o55NTjiE4kAtBK7MfYbaxsU0axIHNlMxqsY-z3Mq4P6X0iHTAI-TEqMLAdFD53L8';
        const originalInvoiceImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDozyQcrL4Yfp5wLXW9Y-K0AeiCtSO2G3lZVMIyffDaIoEBlb_otr_uLGq-Drr0G6N0FS5d6-u6YBfHWJzesjiFbJdWnD15Ct9IDSO08EczvwkYAWgQgEP3d-v91GCN7bOyvBP_FftRv6BChSeEzC7BDbSMtH3DXgL1bbvle6xHA957rBT170X9F2Itu0sPNmwKRqwqkDVOI_Pw-dG5myf2pu5mCFrs-IUMx_XlMi2OYl5IjfQgqquSxEAaElda7W5e1ZN5LhTYUFQ';
        const originalNotifBanner = 'https://lh3.googleusercontent.com/aida/AP1WRLs7M6Yg7Yd4TtEvkYvHWuFLa4sqCmyFU4xbTd0gc1JWOUaOtMJrX2oCBWsecPrXKVQ4rWPRAE81BJUclFQ9hcjIwd1DcZSBM5h_gHUg3ugB-AKJSuGQ4-unn6Z8e7LoQ9DP8Vx87nAaBbqttEzIDfrWQSEMvv7M7CQ0dhPEf4vVt9RSg5yzRe8_V_PQICnoHUGYEMdGL0xYFPlWfwArGud6nFBBWis1UivPxaljrjLjHSXxT3xWcLE1dcs';

        if (!data.heroImageUrl) {
          data.heroImageUrl = originalHero;
          healed = true;
        }
        if (!data.homeFooterMascotUrl) {
          data.homeFooterMascotUrl = originalHomeMascot;
          healed = true;
        }
        if (!data.trackingBatootMascotUrl) {
          data.trackingBatootMascotUrl = originalTrackingMascot;
          healed = true;
        }
        if (!data.invoiceHadooshaImageUrl) {
          data.invoiceHadooshaImageUrl = originalInvoiceImage;
          healed = true;
        }
        if (!data.notificationsBannerUrl) {
          data.notificationsBannerUrl = originalNotifBanner;
          healed = true;
        }

        // Fallback default toggle switches if undefined to show by default
        if (data.showBanners === undefined) {
          data.showBanners = true;
          healed = true;
        }
        if (data.showStores === undefined) {
          data.showStores = true;
          healed = true;
        }
        if (data.showLoyalty === undefined) {
          data.showLoyalty = true;
          healed = true;
        }
        if (data.showAnnouncement === undefined) {
          data.showAnnouncement = true;
          healed = true;
        }

        if (!data.spinWheelPrizes || !Array.isArray(data.spinWheelPrizes) || data.spinWheelPrizes.length === 0) {
          data.spinWheelPrizes = DEFAULT_CUSTOMIZATIONS.spinWheelPrizes;
          healed = true;
        }
        if (!data.offeredServices || !Array.isArray(data.offeredServices) || data.offeredServices.length === 0) {
          data.offeredServices = DEFAULT_CUSTOMIZATIONS.offeredServices;
          healed = true;
        }

        // 3. Fallback/heal banners list for "حدوشة" spelling, keep custom images
        if (data.banners) {
          let bannerHealed = false;
          const healedBanners = data.banners.map(bn => {
            let updatedBn = { ...bn };
            if (updatedBn.id === 'banner_1') {
              if (!updatedBn.imageUrl) {
                updatedBn.imageUrl = originalHero;
                bannerHealed = true;
              }
              if (updatedBn.subtitle && updatedBn.subtitle.includes('حدوشة')) {
                updatedBn.subtitle = updatedBn.subtitle.replace(/حدوشة/g, 'هدوشة');
                bannerHealed = true;
              }
            }
            if (updatedBn.title && updatedBn.title.includes('حدوشة')) {
              updatedBn.title = updatedBn.title.replace(/حدوشة/g, 'هدوشة');
              bannerHealed = true;
            }
            if (updatedBn.subtitle && updatedBn.subtitle.includes('حدوشة')) {
              updatedBn.subtitle = updatedBn.subtitle.replace(/حدوشة/g, 'هدوشة');
              bannerHealed = true;
            }
            return updatedBn;
          });

          // Ensure banner_1 is present
          const hasBanner1 = healedBanners.some(bn => bn.id === 'banner_1');
          if (!hasBanner1) {
            healedBanners.unshift({
              id: 'banner_1',
              imageUrl: originalHero,
              title: 'مرحباً، {name}! ✨',
              subtitle: 'أهلاً بكِ في عالم هدوشة وبطوط 💖'
            });
            bannerHealed = true;
          }

          if (bannerHealed) {
            data.banners = healedBanners;
            healed = true;
          }
        } else {
          data.banners = [
            {
              id: 'banner_1',
              imageUrl: originalHero,
              title: 'مرحباً، {name}! ✨',
              subtitle: 'أهلاً بكِ في عالم هدوشة وبطوط 💖'
            },
            {
              id: 'banner_2',
              imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
              title: 'شحن مخفض من Shein الكويت! 🛍️',
              subtitle: 'فقط 5,000 د.ع لكل كغم مع شحن جوي سريع!'
            },
            {
              id: 'banner_3',
              imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
              title: 'أقوى مستحضرات التجميل الأصلية 💄',
              subtitle: 'شحن مضمون 100% من أشهر الماركات العالمية لباب بيتكِ'
            }
          ];
          healed = true;
        }

        if (healed) {
          setCustomizations(data);
          setDoc(custDocRef, data, { merge: true }).catch(e => {
            console.warn("Could not heal customizations in firestore:", e);
          });
          return;
        }
        setCustomizations(data);
      } else {
        // Seed the document if it doesn't exist
        setDoc(custDocRef, DEFAULT_CUSTOMIZATIONS).catch(e => {
          console.warn("Could not seed customizations to firestore:", e);
        });
      }
    }, (error) => {
      console.warn("Firestore Customizations real-time sync failed:", error.message);
    });

    return () => {
      unsubscribeShipments();
      unsubscribeInvoices();
      unsubscribeNotifications();
      unsubscribeCustomizations();
    };
  }, [user, profile?.role]);

  const updateProfile = async (
    name: string,
    phone: string,
    city: string,
    walletBalance?: number,
    savedCardNumber?: string,
    savedCardHolder?: string,
    savedCardExpiry?: string
  ) => {
    // 1. Update state immediately for instant feedback
    if (profile) {
      setProfile({
        ...profile,
        name,
        phone,
        city,
        walletBalance: walletBalance !== undefined ? walletBalance : profile.walletBalance,
        savedCardNumber: savedCardNumber !== undefined ? savedCardNumber : profile.savedCardNumber,
        savedCardHolder: savedCardHolder !== undefined ? savedCardHolder : profile.savedCardHolder,
        savedCardExpiry: savedCardExpiry !== undefined ? savedCardExpiry : profile.savedCardExpiry,
      });
    }

    // 2. Sync to Firestore
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const updates: any = { name, phone, city };
      if (walletBalance !== undefined) updates.walletBalance = walletBalance;
      if (savedCardNumber !== undefined) updates.savedCardNumber = savedCardNumber;
      if (savedCardHolder !== undefined) updates.savedCardHolder = savedCardHolder;
      if (savedCardExpiry !== undefined) updates.savedCardExpiry = savedCardExpiry;
      await updateDoc(userDocRef, updates);
    } catch (error) {
      console.warn("Firestore Profile update failed:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    // 1. Update state immediately
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);

    // 2. Sync to Firestore
    if (!user) return;
    try {
      for (const notif of notifications) {
        if (!notif.read && notif.id) {
          const notifDocRef = doc(db, 'notifications', notif.id);
          await updateDoc(notifDocRef, { read: true });
        }
      }
    } catch (error) {
      console.warn("Firestore Notifications update failed:", error);
    }
  };

  const markNotificationAsRead = async (notifId: string) => {
    // 1. Update state immediately
    const updated = notifications.map(n => n.id === notifId ? { ...n, read: true } : n);
    setNotifications(updated);

    // 2. Sync to Firestore
    if (!user) return;
    try {
      const notifDocRef = doc(db, 'notifications', notifId);
      await updateDoc(notifDocRef, { read: true });
    } catch (error) {
      console.warn("Firestore Notification update failed:", error);
    }
  };

  const redeemPoints = async (amount: number) => {
    if (!profile || profile.points < amount) return;

    // 1. Update state immediately
    setProfile({ ...profile, points: profile.points - amount });

    // 2. Sync to Firestore
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, { points: profile.points - amount });
    } catch (error) {
      console.warn("Firestore Loyalty Points sync failed:", error);
    }
  };

  const addShipment = async (shipment: Shipment) => {
    if (!user) return;
    const cleanShipmentObj = {
      ...shipment,
      userId: user.uid,
      createdAt: serverTimestamp()
    };
    
    // Add locally for instant UI update
    setShipments(prev => [cleanShipmentObj, ...prev]);

    try {
      const docRef = doc(db, 'shipments', shipment.id || `shipment_${Date.now()}`);
      await setDoc(docRef, cleanShipmentObj);
    } catch (error) {
      console.warn("Firestore Shipment creation failed:", error);
    }
  };

  const deleteShipment = async (id: string) => {
    // Update state immediately
    const updated = shipments.filter(s => s.id !== id);
    setShipments(updated);
    if (selectedShipmentId === id) {
      setSelectedShipmentId(updated[0]?.id || null);
    }

    // Sync to Firestore
    if (!user) return;
    try {
      const docRef = doc(db, 'shipments', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn("Firestore Shipment deletion failed:", error);
    }
  };

  const clearAllShipments = async () => {
    setShipments([]);
    setSelectedShipmentId(null);
    if (!user) return;
    try {
      const q = query(collection(db, 'shipments'));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.warn("Firestore Bulk Shipment deletion failed:", error);
    }
  };

  const addNotification = async (notif: Omit<NotificationDetail, 'id' | 'userId'>) => {
    const newNotif: NotificationDetail = {
      ...notif,
      id: `notif_${Date.now()}`,
      userId: user?.uid || 'local_user',
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (!user) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        ...newNotif,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.warn("Firestore Notification creation failed:", error);
    }
  };

  const updateShipmentStatus = async (
    shipmentId: string, 
    newStatus: string, 
    transitParams?: { transitType: 'air' | 'sea', transitSpeed: number, transitAltitude: number, simulatedProgress: number }
  ) => {
    const updated = shipments.map(s => {
      if (s.id === shipmentId) {
        const currentJourney = s.journey || [];
        const newJourneyStep = {
          title: newStatus,
          description: `تحديث تلقائي لحالة الشحنة: ${newStatus}`,
          time: "الآن",
          location: "بغداد، العراق",
          icon: newStatus.includes('الاستلام') || newStatus.includes('تسليم') ? 'CheckCircle' : 'Plane',
          active: true
        };
        const cleanJourney = currentJourney.map(j => ({ ...j, active: false }));
        return {
          ...s,
          status: newStatus,
          journey: [newJourneyStep, ...cleanJourney],
          ...(transitParams || {})
        };
      }
      return s;
    });
    setShipments(updated);

    if (!user) return;
    try {
      const shipmentDocRef = doc(db, 'shipments', shipmentId);
      const updateData: any = {
        status: newStatus,
        journey: updated.find(s => s.id === shipmentId)?.journey
      };
      if (transitParams) {
        updateData.transitType = transitParams.transitType;
        updateData.transitSpeed = transitParams.transitSpeed;
        updateData.transitAltitude = transitParams.transitAltitude;
        updateData.simulatedProgress = transitParams.simulatedProgress;
      }
      await updateDoc(shipmentDocRef, updateData);
    } catch (error) {
      console.warn("Firestore Shipment status update failed:", error);
    }
  };

  const payInvoice = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.invoiceId === invoiceId || inv.id === invoiceId);
    if (!invoice) return;

    // 1. Update state immediately
    const updatedInvoices = invoices.map(inv => {
      if (inv.invoiceId === invoiceId || inv.id === invoiceId) {
        return { ...inv, status: 'Paid' as const };
      }
      return inv;
    });
    setInvoices(updatedInvoices);

    // Give points: award 150 loyalty points on payment
    if (profile) {
      const updatedProfile = { ...profile, points: profile.points + 150 };
      setProfile(updatedProfile);
      
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, { points: updatedProfile.points });
        } catch (e) {
          console.warn("Firestore profile points update failed:", e);
        }
      }
    }

    // Add notification
    await addNotification({
      notificationId: `notif_${Date.now()}`,
      type: 'invoice',
      title: '💳 تم تسديد الفاتورة بنجاح!',
      content: `تم تسليم دفعة الفاتورة #${invoiceId} لمتجر ${invoice.store} بقيمة ${invoice.amount} عبر بطاقة ماستركارد بنجاح! تم إضافة 150 نقطة لحسابكِ.`,
      time: 'الآن',
      icon: 'CheckCircle',
      read: false
    });

    // 2. Sync to Firestore
    if (!user) return;
    try {
      if (invoice.id) {
        const docRef = doc(db, 'invoices', invoice.id);
        await updateDoc(docRef, { status: 'Paid' });
      }
    } catch (error) {
      console.warn("Firestore Invoice status update failed:", error);
    }
  };

  const addInvoice = async (invoice: Invoice) => {
    const newInvoice = {
      ...invoice,
      userId: user?.uid || 'local_user',
    };
    setInvoices(prev => [newInvoice, ...prev]);

    if (!user) return;
    try {
      await addDoc(collection(db, 'invoices'), {
        ...newInvoice,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.warn("Firestore Invoice creation failed:", error);
    }
  };

  const deleteInvoice = async (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id && inv.invoiceId !== id));

    if (!user) return;
    try {
      const docRef = doc(db, 'invoices', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn("Firestore Invoice deletion failed:", error);
    }
  };

  const clearAllInvoices = async () => {
    setInvoices([]);
    if (!user) return;
    try {
      const q = query(collection(db, 'invoices'));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.warn("Firestore Bulk Invoice deletion failed:", error);
    }
  };

  const rateInvoice = async (invoiceId: string, rating: number, comment?: string) => {
    const todayStr = new Date().toLocaleDateString('ar-IQ', { year: 'numeric', month: 'numeric', day: 'numeric' });
    const updatedInvoices = invoices.map(inv => {
      if (inv.invoiceId === invoiceId || inv.id === invoiceId) {
        return {
          ...inv,
          rating,
          ratingComment: comment || '',
          ratingDate: todayStr
        };
      }
      return inv;
    });
    setInvoices(updatedInvoices);

    const invoice = invoices.find(inv => inv.invoiceId === invoiceId || inv.id === invoiceId);
    if (!invoice) return;

    if (!user) return;
    try {
      if (invoice.id) {
        const docRef = doc(db, 'invoices', invoice.id);
        await updateDoc(docRef, {
          rating,
          ratingComment: comment || '',
          ratingDate: todayStr
        });
      }
    } catch (error) {
      console.warn("Firestore Invoice rating update failed:", error);
    }
  };

  const updateCustomizations = async (cust: Partial<AppCustomizations>) => {
    const updated = { ...customizations, ...cust };
    setCustomizations(updated);

    try {
      const custDocRef = doc(db, 'settings', 'customizations');
      await setDoc(custDocRef, updated, { merge: true });
    } catch (error) {
      console.warn("Firestore Customizations update failed:", error);
    }
  };

  const updateAvatar = async (avatar: string) => {
    if (profile) {
      setProfile({ ...profile, avatar });
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, { avatar });
        } catch (error) {
          console.warn("Firestore Avatar update failed:", error);
        }
      }
    }
  };

  const isLoggedIn = user !== null;
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const identifierClean = identifier.trim();
      let customerData: any = null;

      // 1. First, search for user in customers/{customerId} collection where customerId is the username
      const custDocRef = doc(db, 'customers', identifierClean);
      const custSnap = await getDoc(custDocRef);
      if (custSnap.exists()) {
        customerData = custSnap.data();
      } else {
        // 2. Otherwise search by phone number inside customers collection
        const custsRef = collection(db, 'customers');
        const qPhone = query(custsRef, where('phone', '==', identifierClean));
        const snapPhone = await getDocs(qPhone);
        if (!snapPhone.empty) {
          customerData = snapPhone.docs[0].data();
        }
      }

      // 3. Determine if admin user
      let isAdminUser = false;
      if (!customerData) {
        const identifierLower = identifierClean.toLowerCase();
        if (identifierLower === 'admin' || identifierLower === 'هدى' || identifierLower === 'admin_001' || identifierLower === 'هدوشة' || identifierLower === 'huda') {
          isAdminUser = true;
        } else {
          // Check role in users collection
          const usersRef = collection(db, 'users');
          const qId = query(usersRef, where('customerId', '==', identifierClean));
          const snapId = await getDocs(qId);
          if (!snapId.empty && snapId.docs[0].data().role === 'admin') {
            isAdminUser = true;
          }
        }
      }

      // 4. Handle account suspension check
      if (customerData && customerData.accountStatus === 'suspended') {
        return { 
          success: false, 
          error: '⚠️ عذراً، تم تعليق حسابكِ مؤقتاً من قبل الإدارة، يرجى التواصل مع الدعم لخدمتكِ 🌸' 
        };
      }

      let targetUsername = identifierClean;
      let targetPassword = password;

      if (customerData) {
        targetUsername = customerData.username;
        // Fetch backup password from users table if it matches
        const userDocRef = doc(db, 'users', customerData.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          targetPassword = userSnap.data().password || password;
        }
      }

      // 5. Auth using email mapping
      const email = isAdminUser 
        ? 'admin@iramo.com' 
        : `${targetUsername.toLowerCase()}@iramo.com`;

      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, email, password);
      } catch (authErr: any) {
        const isUserNotFound = authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential';
        
        if (isUserNotFound) {
          // If credentials don't exist in auth but is correct admin password, or matching customer password, auto-create it
          let canAutoCreate = false;
          if (isAdminUser && (password === 'admin123' || password === 'admin')) {
            canAutoCreate = true;
          } else if (customerData && password === targetPassword) {
            canAutoCreate = true;
          }
          
          if (canAutoCreate) {
            console.log(`Auto-creating missing Auth credentials for ${email}...`);
            cred = await createUserWithEmailAndPassword(auth, email, password);
          } else {
            throw authErr;
          }
        } else {
          throw authErr;
        }
      }
      
      const authUser = cred.user;

      // Update lastLogin for customer
      if (customerData) {
        await updateDoc(doc(db, 'customers', customerData.username), {
          lastLogin: new Date().toISOString()
        }).catch(() => null);
      }

      // Verify users/{uid} existence
      const userDocRef = doc(db, 'users', authUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          uid: authUser.uid,
          customerId: targetUsername,
          name: isAdminUser ? 'المديرة هدوشة' : (customerData?.fullName || targetUsername),
          phone: customerData?.phone || '',
          password: targetPassword,
          role: isAdminUser ? 'admin' : 'customer',
          membership: isAdminUser ? 'premium' : 'عضوية أساسية',
          points: isAdminUser ? 99999 : (customerData?.loyaltyPoints || 0),
          walletBalance: isAdminUser ? 10000000 : 0,
          city: customerData?.city || 'بغداد، العراق',
          avatar: customerData?.profileImage || DEFAULT_AVATAR
        });
      } else if (isAdminUser) {
        // Ensure role is admin in users collection for authUser.uid
        await updateDoc(userDocRef, { role: 'admin' }).catch(() => null);
      }

      return { success: true };
    } catch (err: any) {
      console.error("Login failed:", err);
      let errMsg = 'اسم المستخدم أو كلمة المرور غير صحيحة، يرجى التحقق والمحاولة ثانية 🌸';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى 💖';
      } else if (err.code === 'auth/user-not-found') {
        errMsg = 'الحساب غير مسجل لدينا 🌸';
      }
      return { success: false, error: errMsg };
    }
  };

  const register = async (username: string, phone: string, name: string, password: string, city: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const usernameClean = username.trim();
      const phoneClean = phone.trim();
      const nameClean = name.trim();
      const cityClean = city.trim();

      // 1. Validate username uniqueness in customers collection
      const custDocRef = doc(db, 'customers', usernameClean);
      const custSnap = await getDoc(custDocRef);
      if (custSnap.exists()) {
        return { success: false, error: 'اسم المستخدم هذا مسجل مسبقاً 🌸 يرجى اختيار اسم آخر.' };
      }

      // 2. Validate phone uniqueness in customers collection
      const custsRef = collection(db, 'customers');
      const qPhone = query(custsRef, where('phone', '==', phoneClean));
      const snapPhone = await getDocs(qPhone);
      if (!snapPhone.empty) {
        return { success: false, error: 'رقم الهاتف هذا مسجل مسبقاً لدينا 💖' };
      }

      // 3. Create Auth user
      const email = `${usernameClean.toLowerCase()}@iramo.com`;
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = cred.user;

      const profileImage = DEFAULT_AVATAR;
      const registrationDate = new Date().toISOString();

      // 4. Create document in customers/{customerId} Firestore collection
      const newCustomerDoc = {
        uid: authUser.uid,
        fullName: nameClean,
        username: usernameClean,
        phone: phoneClean,
        city: cityClean,
        profileImage: profileImage,
        registrationDate: registrationDate,
        lastLogin: registrationDate,
        accountStatus: 'active',
        totalOrders: 0,
        totalSpent: 0,
        loyaltyPoints: 0
      };
      await setDoc(doc(db, 'customers', usernameClean), newCustomerDoc);

      // 5. Create user document in users/{uid} collection for full compatibility with existing parts
      const newProfile: UserProfile = {
        uid: authUser.uid,
        customerId: usernameClean,
        name: nameClean,
        phone: phoneClean,
        password: password,
        role: 'customer',
        membership: 'عضوية أساسية',
        points: 0,
        walletBalance: 0,
        city: cityClean,
        avatar: profileImage
      };
      await setDoc(doc(db, 'users', authUser.uid), newProfile);

      await seedInitialDataIfEmpty(authUser.uid);

      // Add admin notification for new user signup
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: 'Admin_001',
          notificationId: `new_user_${Date.now()}`,
          type: 'support',
          title: 'عضوة جديدة انضمت للتطبيق! 🎉',
          content: `سجلت الزبونة الكريمة ${nameClean} برقم هاتف ${phoneClean} واسم مستخدم ${usernameClean}.`,
          time: 'الآن',
          icon: 'Sparkles',
          read: false,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn("Could not create admin signup notification:", e);
      }

      return { success: true };
    } catch (err: any) {
      console.error("Registration failed:", err);
      if (err.code === 'auth/email-already-in-use') {
        return { success: false, error: 'اسم المستخدم هذا غير متاح 🌸' };
      }
      return { success: false, error: err.message || 'حدث خطأ غير متوقع أثناء إنشاء الحساب.' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setActiveTab('dashboard');
      setAppMode('customer');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSetActiveTab = (tab: TabType) => {
    if (!isLoggedIn && tab !== 'dashboard') {
      setShowLoginModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleSetAppMode = (mode: 'customer' | 'manager') => {
    if (mode === 'manager') {
      const currentRole = (isLoggedIn && profile) ? profile.role : null;
      if (currentRole !== 'admin') {
        setShowLoginModal(true);
        return;
      }
    }
    setAppMode(mode);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        profile: isLoggedIn ? profile : null,
        shipments: isLoggedIn ? shipments : [],
        invoices: isLoggedIn ? invoices : [],
        notifications: isLoggedIn ? notifications : [],
        customizations,
        activeTab,
        setActiveTab: handleSetActiveTab,
        selectedShipmentId,
        setSelectedShipmentId,
        loading,
        appMode,
        setAppMode: handleSetAppMode,
        updateProfile,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        redeemPoints,
        addShipment,
        deleteShipment,
        clearAllShipments,
        addNotification,
        updateShipmentStatus,
        payInvoice,
        addInvoice,
        deleteInvoice,
        clearAllInvoices,
        rateInvoice,
        updateCustomizations,
        updateAvatar,
        isLoggedIn,
        showLoginModal,
        setShowLoginModal,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
