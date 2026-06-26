import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, Shipment, Invoice, NotificationDetail } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Check connection to Firestore as requested by guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Setup Anonymous auth to bypass manual credentials requirement
export async function setupAnonymousUser(onUserReady: (user: User) => void) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      onUserReady(user);
    } else {
      try {
        const credential = await signInAnonymously(auth);
        if (credential.user) {
          onUserReady(credential.user);
        }
      catch (error) {
  console.error("Firebase Authentication Error:", error);
  throw error;
}
    }
  });
}

export async function runMigrations(uid: string) {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.name === 'أمنة العراق') {
        await updateDoc(userDocRef, { name: 'الزبونة الكريمة' });
        console.log("Migration: User name updated from أمنة العراق to الزبونة الكريمة");
      }
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Seed helper to populate empty collections with beautiful interactive data
export async function seedInitialDataIfEmpty(uid: string) {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      // Seed user profile
      const defaultUser: UserProfile = {
        uid,
        name: 'أمنة العراق',
        phone: '+964 770 123 4567',
        city: 'بغداد، العراق',
        points: 1250,
        membership: 'عضوية ذهبية',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9EaYCDGI3nnclPO4Dfn8I8RZWRNVEKBUb-qxzppoUDSSF0uOYRcTHzQEOvzXtqZyk5bVh4idglS262c_ZUgYdgA-h1OorPVThxh8UXI7GHoH2uDEhbQg2eVlFMYU4isBKM9I_0LSyYdiFMT_ttIH-xYE0KuXOFy-Kz_UIlEMn-XC4L9y1Vol5VvGdb1i51-vz5DCQ3rO23XQP4xhX_1niZMeMM8D-RuEUU1U-r7VqHSMTCi7iILOoNy4WG-WS3v4pxciGg6Rk_QE'
      };
      await setDoc(userDocRef, defaultUser);

      // Seed shipments
      const defaultShipment: Shipment = {
        userId: uid,
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
      };
      await setDoc(doc(db, 'shipments', `${uid}_shipment_1`), defaultShipment);

      // Seed invoices
      const defaultInvoices: Invoice[] = [
        { userId: uid, invoiceId: 'INV-7829', store: 'Shein', order_id: 'SH9021883', date: '2023-10-24', amount: '125,000 د.ع', status: 'Paid', shippingStatus: 'وصلت مطار بغداد' },
        { userId: uid, invoiceId: 'INV-7830', store: 'AliExpress', order_id: 'AX4429910', date: '2023-10-22', amount: '45,500 د.ع', status: 'Pending', shippingStatus: 'قيد المعالجة في المستودع' },
        { userId: uid, invoiceId: 'INV-7831', store: 'Amazon AE', order_id: 'AMZ-33210-9', date: '2023-10-15', amount: '210,000 د.ع', status: 'Paid', shippingStatus: 'تم التسليم لشركة التوصيل' },
        { userId: uid, invoiceId: 'INV-7832', store: 'Trendyol', order_id: 'TR-772188', date: '2023-10-05', amount: '89,000 د.ع', status: 'Paid', shippingStatus: 'تم التسليم للزبون' }
      ];
      for (const inv of defaultInvoices) {
        await setDoc(doc(db, 'invoices', `${uid}_${inv.invoiceId}`), inv);
      }

      // Seed notifications
      const defaultNotifications: NotificationDetail[] = [
        {
          userId: uid,
          notificationId: 'notif_1',
          type: 'shipment',
          title: 'تحديث شحنتك',
          content: 'طرودكِ الأنيقة IRA-99201-XQ في طريقها إليكِ الآن!',
          time: 'الآن',
          icon: 'Package',
          read: false
        },
        {
          userId: uid,
          notificationId: 'notif_2',
          type: 'offer',
          title: 'هدية من هدوشة',
          content: 'تحققي من حسابكِ، هناك نقاط ولاء جديدة بانتظاركِ 💖',
          time: '٥ د',
          image: 'https://lh3.googleusercontent.com/aida/AP1WRLsRDP-u1RVbBjPEYf7rJ-NdzHWJakwLt7gnAZNMGLmJKPkRp5rpXeC8sb5pwEylTN2ng-Ej4yLxT26yVa7z8G4fx0CEaYjweNfrJHiCoOunzf32_M1-IHBfo1X1eJC73JVMP7Xm6keYR3qlhCReRzr35xI83PDs_ic9AinBS3apKtGSMte4_f4rzjZ-Cl9ZbJhrmILvORTYacUoZPZAjRoOoTRQKRQaadOcYttwFAAPdgux4o4_N5p9flU',
          action: 'استعراض النقاط',
          read: false
        },
        {
          userId: uid,
          notificationId: 'notif_3',
          type: 'invoice',
          title: 'تأكيد الدفع',
          content: 'تم استلام مبلغ الطلب #IR-9023. شكراً لثقتكِ بنا.',
          time: '٢ س',
          icon: 'CheckCircle',
          read: true
        },
        {
          userId: uid,
          notificationId: 'notif_4',
          type: 'offer',
          title: 'تخفيضات حصرية',
          content: 'خصومات تصل إلى ٣٠٪ على تشكيلة الخريف الجديدة!',
          time: 'أمس',
          icon: 'Sparkles',
          read: true
        }
      ];
      for (const notif of defaultNotifications) {
        await setDoc(doc(db, 'notifications', `${uid}_${notif.notificationId}`), notif);
      }
    }
  } catch (error) {
    console.warn("Seeding initial data skipped or restricted (using highly-resilient offline local storage fallback):", error);
  }
}
