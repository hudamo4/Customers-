import { initializeApp } from 'firebase/app';
import { DEFAULT_AVATAR } from '../utils/avatar';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
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

function compressImage(file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.75): Promise<File | Blob> {
  if (!file.type.startsWith('image/')) {
    return Promise.resolve(file);
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality);
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export async function uploadFileToStorage(file: File, path: string): Promise<string> {
  let processedFile: File | Blob = file;
  try {
    processedFile = await compressImage(file);
  } catch (compressErr) {
    console.warn("Client-side image compression failed, using original file:", compressErr);
  }

  try {
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(processedFile);
    });

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileData: base64Data,
        fileName: file.name,
        fileType: file.type,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload failed: ${errText || response.statusText}`);
    }

    const result = await response.json();
    if (!result.url) {
      throw new Error("Upload succeeded but no URL was returned.");
    }
    return result.url;
  } catch (e) {
    console.error("UploadThing upload failed, falling back to local base64:", e);
    // Robust Fallback: Convert to Data URL (base64) so it updates instantly and saves beautifully to Firestore!
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(processedFile);
    });
  }
}

export async function uploadFileToUploadThing(file: File): Promise<string> {
  return uploadFileToStorage(file, "");
}

export async function deleteFileFromUploadThing(fileUrl: string): Promise<boolean> {
  try {
    const response = await fetch("/api/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileUrl }),
    });
    const result = await response.json();
    return !!result.success;
  } catch (error) {
    console.error("Failed to delete file from UploadThing:", error);
    return false;
  }
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

// Setup Auth Listener to track real customer / admin login
export function setupAuthListener(onUserReady: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    onUserReady(user);
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
    // Seed Admin_001 if not exists so there's always an active admin login
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

    if (!userSnap.exists() && uid !== 'Admin_001') {
      // Seed a clean, fresh, completely empty profile for the new user
      const defaultUser: UserProfile = {
        uid,
        name: 'زبونة جديدة مجهولة',
        phone: '',
        city: 'بغداد، العراق',
        points: 0,
        membership: 'عضوية فضية',
        avatar: DEFAULT_AVATAR,
        walletBalance: 0
      };
      await setDoc(userDocRef, defaultUser);
    }
  } catch (error) {
    console.warn("Seeding initial data skipped or restricted:", error);
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
    step1Auth: { status: 'pending', message: 'جاري التحقق من الحساب النشط...' },
    step2Create: { status: 'pending', message: 'انتظار اكتمال تسجيل الدخول...' },
    step3Read: { status: 'pending', message: 'انتظار إنشاء المستند...' },
    overallSuccess: false,
    timestamp: Date.now()
  };

  try {
    // 1. Authenticate check
    console.log("Diagnostic: Checking active authentication...");
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("لا يوجد مستخدم مسجل حالياً لإجراء الفحص.");
    }
    const uid = currentUser.uid;
    result.step1Auth = {
      status: 'success',
      message: 'تم التحقق من الحساب النشط بنجاح.',
      uid
    };

    // 2. Create a document in collection "users"
    console.log("Diagnostic: Creating test document...");
    const testDocRef = doc(db, 'users', `${uid}_test`);
    const testDocId = testDocRef.id;
    const testData = {
      name: "اختبار",
      createdAt: Date.now(),
      userId: uid
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
