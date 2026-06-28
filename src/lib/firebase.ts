import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import {
  initializeFirestore,
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
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, Shipment, Invoice, NotificationDetail } from '../types';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

export let storage: any = null;
try {
  if (firebaseConfig.storageBucket) {
    storage = getStorage(app);
  }
} catch (e) {
  console.warn("Firebase Storage failed to initialize:", e);
}

export async function uploadFileToStorage(file: File, path: string): Promise<string> {
  if (storage) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (e) {
      console.warn("Firebase Storage upload failed, falling back to local base64:", e);
    }
  }
  // Robust Fallback: Convert to Data URL (base64) so it updates instantly and saves beautifully to Firestore!
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

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

let memoryFallbackUid = 'user_amna_fallback';

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
      } catch (error) {
        console.warn("Anonymous authentication restricted, using memory fallback UID:", error);
        onUserReady({ uid: memoryFallbackUid } as User);
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
    // Seed Huda_001 if not exists
    const hudaDocRef = doc(db, 'users', 'Huda_001');
    const hudaSnap = await getDoc(hudaDocRef);
    if (!hudaSnap.exists()) {
      await setDoc(hudaDocRef, {
        uid: 'Huda_001',
        customerId: 'Huda_001',
        phone: '07801234567',
        password: '123456',
        name: 'هدى',
        city: 'بابل',
        role: 'customer',
        membership: 'gold',
        points: 1250,
        walletBalance: 250000,
        savedCardNumber: '5412 7500 1234 5678',
        savedCardHolder: 'AMNA AL-IRAQ',
        savedCardExpiry: '12/28',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9EaYCDGI3nnclPO4Dfn8I8RZWRNVEKBUb-qxzppoUDSSF0uOYRcTHzQEOvzXtqZyk5bVh4idglS262c_ZUgYdgA-h1OorPVThxh8UXI7GHoH2uDEhbQg2eVlFMYU4isBKM9I_0LSyYdiFMT_ttIH-xYE0KuXOFy-Kz_UIlEMn-XC4L9y1Vol5VvGdb1i51-vz5DCQ3rO23XQP4xhX_1niZMeMM8D-RuEUU1U-r7VqHSMTCi7iILOoNy4WG-WS3v4pxciGg6Rk_QE'
      });
    }

    // Seed Admin_001 if not exists
    const adminDocRef = doc(db, 'users', 'Admin_001');
    const adminSnap = await getDoc(adminDocRef);
    if (!adminSnap.exists()) {
      await setDoc(adminDocRef, {
        uid: 'Admin_001',
        customerId: 'Admin_001',
        phone: '07807777777',
        password: 'admin123',
        name: 'المديرة هدوشة',
        city: 'بغداد',
        role: 'admin',
        membership: 'premium',
        points: 99999,
        walletBalance: 10000000,
        avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLsRDP-u1RVbBjPEYf7rJ-NdzHWJakwLt7gnAZNMGLmJKPkRp5rpXeC8sb5pwEylTN2ng-Ej4yLxT26yVa7z8G4fx0CEaYjweNfrJHiCoOunzf32_M1-IHBfo1X1eJC73JVMP7Xm6keYR3qlhCReRzr35xI83PDs_ic9AinBS3apKtGSMte4_f4rzjZ-Cl9ZbJhrmILvORTYacUoZPZAjRoOoTRQKRQaadOcYttwFAAPdgux4o4_N5p9flU'
      });
    }

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
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9EaYCDGI3nnclPO4Dfn8I8RZWRNVEKBUb-qxzppoUDSSF0uOYRcTHzQEOvzXtqZyk5bVh4idglS262c_ZUgYdgA-h1OorPVThxh8UXI7GHoH2uDEhbQg2eVlFMYU4isBKM9I_0LSyYdiFMT_ttIH-xYE0KuXOFy-Kz_UIlEMn-XC4L9y1Vol5VvGdb1i51-vz5DCQ3rO23XQP4xhX_1niZMeMM8D-RuEUU1U-r7VqHSMTCi7iILOoNy4WG-WS3v4pxciGg6Rk_QE',
        walletBalance: 250000,
        savedCardNumber: '5412 7500 1234 5678',
        savedCardHolder: 'AMNA AL-IRAQ',
        savedCardExpiry: '12/28'
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

export interface DiagnosticResult {
  step1Auth: { status: 'pending' | 'success' | 'failed'; message: string; uid?: string; errorCode?: string };
  step2Create: { status: 'pending' | 'success' | 'failed'; message: string; docId?: string; errorCode?: string };
  step3Read: { status: 'pending' | 'success' | 'failed'; message: string; data?: any; errorCode?: string };
  overallSuccess: boolean;
  timestamp: number;
}

export async function runFirestoreDiagnosticTest(): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    step1Auth: { status: 'pending', message: 'جاري تسجيل الدخول المجهول...' },
    step2Create: { status: 'pending', message: 'انتظار اكتمال تسجيل الدخول...' },
    step3Read: { status: 'pending', message: 'انتظار إنشاء المستند...' },
    overallSuccess: false,
    timestamp: Date.now()
  };

  try {
    // 1. Authenticate anonymously
    console.log("Diagnostic: Initiating anonymous sign in...");
    const credential = await signInAnonymously(auth);
    const uid = credential.user.uid;
    result.step1Auth = {
      status: 'success',
      message: 'تم تسجيل الدخول بنجاح كمستخدم مجهول.',
      uid
    };

    // 2. Create a document in collection "users"
    console.log("Diagnostic: Creating test document...");
    const testDocRef = doc(collection(db, 'users'));
    const testDocId = testDocRef.id;
    const testData = {
      name: "اختبار",
      createdAt: Date.now()
    };
    
    await setDoc(testDocRef, testData);
    result.step2Create = {
      status: 'success',
      message: `تم إنشاء مستند الاختبار بنجاح في مجموعة "users" بمعرّف: ${testDocId}`,
      docId: testDocId
    };

    // 3. Read the document back
    console.log("Diagnostic: Reading test document back...");
    const readSnap = await getDoc(testDocRef);
    if (readSnap.exists()) {
      result.step3Read = {
        status: 'success',
        message: 'تم قراءة المستند بنجاح ومطابقة البيانات.',
        data: readSnap.data()
      };
      result.overallSuccess = true;
    } else {
      result.step3Read = {
        status: 'failed',
        message: 'فشلت قراءة المستند: المستند غير موجود بعد الكتابة.',
        errorCode: 'not-found'
      };
    }

  } catch (error: any) {
    console.error("Diagnostic failed:", error);
    const errorCode = error?.code || error?.message || 'unknown';
    
    if (result.step1Auth.status === 'pending') {
      result.step1Auth = {
        status: 'failed',
        message: `فشل تسجيل الدخول: ${error?.message || error}`,
        errorCode
      };
      result.step2Create = { status: 'failed', message: 'تم الإلغاء بسبب فشل تسجيل الدخول.', errorCode };
      result.step3Read = { status: 'failed', message: 'تم الإلغاء بسبب فشل تسجيل الدخول.', errorCode };
    } else if (result.step2Create.status === 'pending') {
      result.step2Create = {
        status: 'failed',
        message: `فشل إنشاء المستند: ${error?.message || error}`,
        errorCode
      };
      result.step3Read = { status: 'failed', message: 'تم الإلغاء بسبب فشل إنشاء المستند.', errorCode };
    } else {
      result.step3Read = {
        status: 'failed',
        message: `فشل قراءة المستند: ${error?.message || error}`,
        errorCode
      };
    }
  }

  return result;
}
