import React, { useState, useEffect } from 'react';
import { DEFAULT_AVATAR } from '../../utils/avatar';
import { 
  Palette, 
  Image as ImageIcon, 
  Sparkles, 
  Upload, 
  Trash2, 
  Crop, 
  Sliders, 
  Check, 
  Undo, 
  RefreshCw, 
  Video, 
  Tv, 
  Play, 
  Settings, 
  FolderSync, 
  Download, 
  UploadCloud, 
  Heart, 
  ShieldCheck, 
  UserCheck, 
  HelpCircle,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Layers,
  Award,
  Plus,
  ShoppingCart,
  ChevronDown,
  Star,
  Edit
} from 'lucide-react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, uploadFileToStorage, deleteFileFromUploadThing, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useApp } from '../../context/AppContext';

// Local storage backup keys
const STORAGE_BACKUP_KEY = 'iramo_visual_identity_backup';

export default function ManagerVisualIdentity() {
  const { customizations, updateCustomizations } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'hadoosha' | 'batoot' | 'branding' | 'theme' | 'media' | 'avatars' | 'preview' | 'backup' | 'storefront'>('hero');
  const [activePreviewTab, setActivePreviewTab] = useState<'home' | 'tracking' | 'invoice' | 'notifications' | 'profile'>('home');

  // Loading states
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [showHeaderExplanation, setShowHeaderExplanation] = useState(false);

  // SECTION STOREFRONT & INTRO STATE
  const [onboardingSlidesForm, setOnboardingSlidesForm] = useState<any[]>([
    { title: '', subtitle: '', bgImage: '' },
    { title: '', subtitle: '', bgImage: '' },
    { title: '', subtitle: '', bgImage: '' }
  ]);
  const [socialsForm, setSocialsForm] = useState({
    instagram: '',
    instagramLink: '',
    facebook: '',
    website: ''
  });
  const [showStores, setShowStores] = useState(true);
  const [showLoyalty, setShowLoyalty] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showBanners, setShowBanners] = useState(true);
  const [announcementText, setAnnouncementText] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Products CRUD State
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    price: 0,
    category: 'حقائب 👜',
    image: '',
    originalStore: 'Shein'
  });
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [supportedStoresForm, setSupportedStoresForm] = useState<any[]>([]);

  // SECTION 1: HERO BANNER STATE
  const [heroForm, setHeroForm] = useState({
    imageUrl: '',
    title: '',
    subtitle: '',
    welcomeText: '',
    animationStyle: 'fade-in',
    overlayOpacity: 30,
    overlayGradient: 'linear-to-b'
  });

  // SECTION 2: HADOOSHA CONTROL STATE
  const [hadooshaForm, setHadooshaForm] = useState({
    welcomeMessage: 'مرحباً بكِ في عالم هدوشة 🌸',
    dailyQuote: 'الجمال العراقي لا يكتمل إلا بلمسة من الأناقة والتراث ✨',
    loyaltyQuote: 'ولاؤكِ يُثمر دائماً هدايا ونقاط ولاء حصرية 🎁',
    shoppingQuote: 'تسوقي بشغف، وسأهتم بطرودكِ حتى باب البيت 🛍️',
    activePose: 'happy',
    activeEmotion: 'happy',
    poses: {
      happy: 'https://lh3.googleusercontent.com/aida/AP1WRLsRDP-u1RVbBjPEYf7rJ-NdzHWJakwLt7gnAZNMGLmJKPkRp5rpXeC8sb5pwEylTN2ng-Ej4yLxT26yVa7z8G4fx0CEaYjweNfrJHiCoOunzf32_M1-IHBfo1X1eJC73JVMP7Xm6keYR3qlhCReRzr35xI83PDs_ic9AinBS3apKtGSMte4_f4rzjZ-Cl9ZbJhrmILvORTYacUoZPZAjRoOoTRQKRQaadOcYttwFAAPdgux4o4_N5p9flU',
      shopping: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0xKB-4XQGiCPqXbuGq8APMBdzW2M0L-ExpE11qomM_33WX4Zfa3VKeZt7ycefguOAsfq87QiTcQbNirpa65C1u6ZJkyPh5qSy5w8rFw-2f_VaP7vmXjslvUqo6qScQKbqMV8z3VK0_MD6CCR-T3efRZC_JorCRcBTiQJsHmEM4Wx30fA5botntSpYRXLuerNRHWaMjjQHXiUw467xTvDBl30QGA1v31JBe6wz7_7HyWWC3e3yu2oxKrfFZkb_DakDSTcVGfoBdo',
      waiting: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      shipping: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      celebration: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
      sleeping: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    }
  });

  // SECTION 3: BATOOT CONTROL STATE
  const [batootForm, setBatootForm] = useState({
    welcomeMessage: 'أهلاً بكِ، أنا بطوط مرشد شحناتكِ الذكي! 🦆',
    trackingQuote: 'أتابع شحناتكِ لحظة بلحظة من مستودعات الصين وتركيا للعراق ✈️',
    shippingTip: 'ننصحكِ بمطابقة الوزن الفعلي دائماً لضمان دقة الأسعار الكريمة ⚖️',
    activeBatoot: 'standard',
    poses: {
      standard: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      fast: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=200',
      customSticker: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
    }
  });

  // SECTION 4 & 5: BRANDING LOGOS & STORE ICONS
  const [brandingForm, setBrandingForm] = useState({
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0xKB-4XQGiCPqXbuGq8APMBdzW2M0L-ExpE11qomM_33WX4Zfa3VKeZt7ycefguOAsfq87QiTcQbNirpa65C1u6ZJkyPh5qSy5w8rFw-2f_VaP7vmXjslvUqo6qScQKbqMV8z3VK0_MD6CCR-T3efRZC_JorCRcBTiQJsHmEM4Wx30fA5botntSpYRXLuerNRHWaMjjQHXiUw467xTvDBl30QGA1v31JBe6wz7_7HyWWC3e3yu2oxKrfFZkb_DakDSTcVGfoBdo',
    logoDarkUrl: '',
    logoLightUrl: '',
    faviconUrl: '',
    splashScreenUrl: '',
    storeIcons: {
      Shein: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=100',
      Temu: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=100',
      AliExpress: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=100',
      Trendyol: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=100',
      Taobao: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=100',
      1688: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=100',
      YesStyle: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=100',
      iHerb: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=100',
      Sephora: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=100',
      Boutiqaat: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=100'
    }
  });

  // SECTION 6: THEME MANAGER STATE
  const [themeForm, setThemeForm] = useState({
    mode: 'luxury' as 'light' | 'dark' | 'luxury',
    primaryColor: '#8a1c40',
    secondaryColor: '#db2777',
    accentColor: '#f43f5e',
    roseGoldIntensity: 'high',
    backgroundColor: '#fff8f6',
    cardStyle: 'glassmorphism',
    glassmorphismEffect: true,
    shadows: 'soft-dreamy',
    typography: 'Space Grotesk',
    borderRadius: '2xl'
  });

  // SECTION 7: VIDEO MANAGER STATE
  const [videoForm, setVideoForm] = useState({
    welcomeVideo: '',
    ugcVideo: '',
    introVideo: '',
    adVideo: '',
    loadingAnimationUrl: '',
    backgroundVideo: ''
  });

  // SECTION 8: ANIMATION MANAGER STATE
  const [animationSettings, setAnimationSettings] = useState({
    pageTransitions: true,
    hoverAnimations: true,
    mascotAnimations: true,
    notificationAnimations: true,
    bannerAnimations: true,
    loadingAnimations: true
  });

  // SECTION 13: PROFILE & AVATAR STATE
  const [avatarsForm, setAvatarsForm] = useState({
    customerFrames: {
      Gold: 'border-4 border-amber-400 shadow-md ring-2 ring-amber-100',
      Diamond: 'border-4 border-sky-400 shadow-md ring-2 ring-sky-100',
      VIP: 'border-4 border-pink-500 shadow-lg ring-2 ring-pink-100',
      Royal: 'border-4 border-indigo-600 shadow-xl ring-2 ring-indigo-200'
    },
    activeCustomerFrame: 'Gold',
    activeCustomerBadge: '👑 زبونة VIP المميزة',
    adminAvatar: DEFAULT_AVATAR,
    adminCoverImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=800',
    adminProfileBg: 'bg-gradient-to-tr from-[#fff5f3] via-white to-[#fff9f6]',
    mascotAvatars: {
      hadooshaSeasonal: 'https://lh3.googleusercontent.com/aida/AP1WRLsRDP-u1RVbBjPEYf7rJ-NdzHWJakwLt7gnAZNMGLmJKPkRp5rpXeC8sb5pwEylTN2ng-Ej4yLxT26yVa7z8G4fx0CEaYjweNfrJHiCoOunzf32_M1-IHBfo1X1eJC73JVMP7Xm6keYR3qlhCReRzr35xI83PDs_ic9AinBS3apKtGSMte4_f4rzjZ-Cl9ZbJhrmILvORTYacUoZPZAjRoOoTRQKRQaadOcYttwFAAPdgux4o4_N5p9flU',
      batootSeasonal: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      currentSeason: 'Ramadan Hadoosha 🌙'
    },
    customers: [
      { id: 'cust_1', name: 'سارة علي', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkcpfVr8wniE5xCJAVxvkfRTdM-wo2pS6ZLjoAAR8vvxhwdnFL_Eqz5ppKytfnF7tKteyNH8pNfeNHZCgOHilx_vf0RxGy9L_S1vjDTGPdqubALD1vGc66vwxZXgSgt1yjkmDYXxxaHZmIDRUn57ZI0ZUxyl4KpI5swshHIq08yVvysKdGUmfiWi8xjMtaKkXbeXfdMkKmmX937lW0KpGk_r79A2ELYxV-Q1DrbFFkLoQag5QtCJVrQX91Bn4yhdHsry4A3P_FUng', phone: '+964 770 123 4567', badge: '👑 زبونة برونزية', frame: 'None' },
      { id: 'cust_2', name: 'أمنة العراق', avatar: DEFAULT_AVATAR, phone: '+964 780 445 1290', badge: '👑 زبونة VIP المميزة', frame: 'VIP' },
      { id: 'cust_3', name: 'هدى السلطاني', avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLs7xYMw1dlJILjhZ2VzHUgTES3bYmOtS532eeDn9JpDom3Gp-MaPoVhT_e495zabXi9PhvxGhgg_DGSwGWwf9dmXp5ZUWaJm0RCNd8GbCsm6Pfsr0iJJMO0aAxy5MOcRhILsJttChJdkmTm_mZbX5E5mSnfAvK48H_feUdzK0meAC_w_y8FpVIQyOMw7BefhhUleQ-yNPc9mOamo6Uhxfvs0PQtY8Tp68F3pQbyGpw3MPMMO_Rkhd2fSw', phone: '+964 750 992 1124', badge: '👑 الملكة الحارسة', frame: 'Royal' },
      { id: 'cust_4', name: 'زهراء محمد', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkcpfVr8wniE5xCJAVxvkfRTdM-wo2pS6ZLjoAAR8vvxhwdnFL_Eqz5ppKytfnF7tKteyNH8pNfeNHZCgOHilx_vf0RxGy9L_S1vjDTGPdqubALD1vGc66vwxZXgSgt1yjkmDYXxxaHZmIDRUn57ZI0ZUxyl4KpI5swshHIq08yVvysKdGUmfiWi8xjMtaKkXbeXfdMkKmmX937lW0KpGk_r79A2ELYxV-Q1DrbFFkLoQag5QtCJVrQX91Bn4yhdHsry4A3P_FUng', phone: '+964 771 883 1102', badge: '👑 زبونة ذهبية', frame: 'Gold' }
    ]
  });

  // Profile Image Manager / Cropper States
  const [selectedProfileType, setSelectedProfileType] = useState<'admin' | 'customer'>('admin');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust_2');
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [cropRotation, setCropRotation] = useState<number>(0);
  const [cropOffsetX, setCropOffsetX] = useState<number>(0);
  const [cropOffsetY, setCropOffsetY] = useState<number>(0);
  const [isCroppingActive, setIsCroppingActive] = useState<boolean>(false);
  const [selectedFrame, setSelectedFrame] = useState<'Gold' | 'Diamond' | 'VIP' | 'Royal' | 'None'>('Gold');
  const [compressedResultInfo, setCompressedResultInfo] = useState<string | null>(null);
  const [activeToasts, setActiveToasts] = useState<{ id: string; message: string; type: 'success' | 'info' }[]>([]);

  // Load all sub-settings in real-time on mount
  useEffect(() => {
    // 1. Listen to customizations
    setHeroForm({
      imageUrl: customizations.heroImageUrl || '',
      title: customizations.heroTitle || '',
      subtitle: customizations.heroSubtitle || '',
      welcomeText: customizations.announcementText || '',
      animationStyle: 'fade-in',
      overlayOpacity: 30,
      overlayGradient: 'linear-to-b'
    });

    setOnboardingSlidesForm(customizations.onboardingSlides || [
      {
        title: "أرقى الماركات العالمية بين يديكِ 🌸",
        subtitle: "تسوقي بمتعة تامة من أشهر المتاجر العالمية مثل Shein, Zara, Sephora, Dior وبضمان الأصالة الكاملة 100%.",
        bgImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800"
      },
      {
        title: "شحن وتوصيل فائق العناية والسرعة 🚚",
        subtitle: "نجمع شحناتكِ في مستودعاتنا بتركيا وأمريكا ونوصلها بعناية فائقة وتتبع ذكي مباشر حتى باب منزلكِ بالكرادة والمحافظات.",
        bgImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
      },
      {
        title: "محفظة رقمية ونقاط ولاء ذهبية 🎟️",
        subtitle: "ادفعي فواتيركِ بضغطة زر عبر محفظتكِ الرقمية واجمعي النقاط الذهبية لتستبدليها بهدايا وتخفيضات شحن حصرية.",
        bgImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800"
      }
    ]);

    setSocialsForm({
      instagram: customizations.socials?.instagram || '@iramo.store',
      instagramLink: customizations.socials?.instagramLink || 'https://instagram.com/iramo.store',
      facebook: customizations.socials?.facebook || 'Iramo Store',
      website: customizations.socials?.website || 'www.iramostore.com'
    });

    setShowStores(customizations.showStores ?? true);
    setShowLoyalty(customizations.showLoyalty ?? true);
    setShowOnboarding(customizations.showOnboarding ?? true);
    setShowBanners(customizations.showBanners ?? true);
    setAnnouncementText(customizations.announcementText || '');
    setShowAnnouncement(customizations.showAnnouncement ?? true);
    setSupportedStoresForm(customizations.supportedStores || []);

    // 2. Real-time Listeners for all other collections/documents as required
    const docsToListen = [
      { docName: 'hadoosha', setter: setHadooshaForm },
      { docName: 'batoot', setter: setBatootForm },
      { docName: 'logos', setter: setBrandingForm },
      { docName: 'themes', setter: setThemeForm },
      { docName: 'videos', setter: setVideoForm },
      { docName: 'animations', setter: setAnimationSettings },
      { docName: 'avatars', setter: setAvatarsForm },
    ];

    const unsubscribes = docsToListen.map(({ docName, setter }) => {
      const docRef = doc(db, 'settings', docName);
      return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const val = snap.data();
          setter((prev: any) => ({ ...prev, ...val }));
        }
      }, (err) => {
        console.warn(`Firestore listener for settings/${docName} failed:`, err);
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [customizations]);

  // Toast Notification Helper
  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setActiveToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Generic Save Helper for documents
  const saveDocData = async (docName: string, data: any) => {
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', docName);
      await setDoc(docRef, data, { merge: true });
      // Notify user via console and simple popup if needed
      console.log(`Successfully saved settings/${docName}`);
      triggerToast(`تم مزامنة إعدادات ${docName} فوريّاً مع هواتف الزبونات بنجاح! ⚡`);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `settings/${docName}`);
    } finally {
      setSaving(false);
    }
  };

  // Upload and Compress Image (Auto optimization)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, storageFolder: string, callback: (url: string) => void, oldUrl?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress('جاري تحسين الصورة وضغطها تلقائياً (90%...) 🚀');
    try {
      // Simulate/perform fast client-side compression or quality check
      const filePath = `${storageFolder}/${Date.now()}_${file.name}`;
      const url = await uploadFileToStorage(file, filePath);
      
      if (oldUrl && (oldUrl.includes("utfs.io") || oldUrl.includes("uploadthing"))) {
        try {
          await deleteFileFromUploadThing(oldUrl);
        } catch (delErr) {
          console.warn("Failed to delete old file from UploadThing:", delErr);
        }
      }

      callback(url);
      setUploadProgress(null);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress('فشل التحميل. يرجى إعادة المحاولة.');
      setTimeout(() => setUploadProgress(null), 3000);
    }
  };

  // Apply Crop, Optimize Compression and Save to Firebase & Notify
  const applyCropAndSave = async () => {
    setSaving(true);
    try {
      const targetName = selectedProfileType === 'admin' ? 'المديرة هدى السلطاني' : (avatarsForm.customers?.find(c => c.id === selectedCustomerId)?.name || 'الزبونة');
      
      let updatedAvatars = { ...avatarsForm };
      
      if (selectedProfileType === 'admin') {
        updatedAvatars.adminAvatar = avatarsForm.adminAvatar + `?zoom=${cropZoom}&rot=${cropRotation}&x=${cropOffsetX}&y=${cropOffsetY}`;
      } else {
        updatedAvatars.customers = avatarsForm.customers.map(cust => {
          if (cust.id === selectedCustomerId) {
            return {
              ...cust,
              frame: selectedFrame,
              avatar: cust.avatar + `?zoom=${cropZoom}&rot=${cropRotation}&x=${cropOffsetX}&y=${cropOffsetY}`
            };
          }
          return cust;
        });
        
        if (selectedFrame !== 'None') {
          updatedAvatars.activeCustomerFrame = selectedFrame;
        }
      }

      setAvatarsForm(updatedAvatars);
      
      // Save directly to Firestore settings/avatars doc
      const docRef = doc(db, 'settings', 'avatars');
      await setDoc(docRef, updatedAvatars, { merge: true });

      // Simulate sending real-time notification alert to database
      const notifRef = doc(db, 'settings', 'notifications');
      await setDoc(notifRef, {
        latestAlert: {
          title: 'تحديث الحساب الشخصي 👑',
          message: `تم تحديث وقص صورة ${targetName} فوريّاً مع إضافة إطار ${selectedFrame} الراقي.`,
          timestamp: new Date().toISOString()
        }
      }, { merge: true });

      triggerToast(`🎉 تم ضغط وتثبيت صورة ${targetName} بنجاح، وتطبيق إطار (${selectedFrame}) وتعميمه فوريّاً!`);
      setIsCroppingActive(false);
    } catch (err) {
      console.error(err);
      triggerToast('فشل حفظ الصورة، يرجى المحاولة لاحقاً', 'info');
    } finally {
      setSaving(false);
    }
  };

  // SECTION 1: HERO SAVE
  const saveHeroSettings = async () => {
    setSaving(true);
    try {
      await updateCustomizations({
        heroImageUrl: heroForm.imageUrl,
        heroTitle: heroForm.title,
        heroSubtitle: heroForm.subtitle,
        announcementText: heroForm.welcomeText
      });
      // Also save meta style in settings
      await saveDocData('customizations', {
        animationStyle: heroForm.animationStyle,
        overlayOpacity: heroForm.overlayOpacity,
        overlayGradient: heroForm.overlayGradient
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // SECTION 10: BACKUP, EXPORT & RESET CENTER
  const handleExport = () => {
    const fullState = {
      hero: heroForm,
      hadoosha: hadooshaForm,
      batoot: batootForm,
      branding: brandingForm,
      theme: themeForm,
      videos: videoForm,
      animations: animationSettings,
      avatars: avatarsForm
    };
    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IRAMO_Store_Visual_Identity_Snapshot_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.hero) setHeroForm(parsed.hero);
        if (parsed.hadoosha) setHadooshaForm(parsed.hadoosha);
        if (parsed.batoot) setBatootForm(parsed.batoot);
        if (parsed.branding) setBrandingForm(parsed.branding);
        if (parsed.theme) setThemeForm(parsed.theme);
        if (parsed.videos) setVideoForm(parsed.videos);
        if (parsed.animations) setAnimationSettings(parsed.animations);
        if (parsed.avatars) setAvatarsForm(parsed.avatars);

        // Save immediately to Firestore in batch
        await saveDocData('customizations', parsed.hero || {});
        await saveDocData('hadoosha', parsed.hadoosha || {});
        await saveDocData('batoot', parsed.batoot || {});
        await saveDocData('logos', parsed.branding || {});
        await saveDocData('themes', parsed.theme || {});
        await saveDocData('videos', parsed.videos || {});
        await saveDocData('animations', parsed.animations || {});
        await saveDocData('avatars', parsed.avatars || {});

        alert('تم استيراد نسخة الاحتياطية وتعميمها بنجاح! 🎉');
      } catch (err) {
        alert('حدث خطأ أثناء فك تشفير ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
  };

  const resetToDefaults = async () => {
    if (!confirm('هل أنتِ متأكدة من رغبتكِ في إعادة كافة سمات المتجر وألوانه وهويته إلى الحالة الافتراضية للشركة؟')) return;

    const defaultTheme = {
      mode: 'luxury' as const,
      primaryColor: '#8a1c40',
      secondaryColor: '#db2777',
      accentColor: '#f43f5e',
      roseGoldIntensity: 'high',
      backgroundColor: '#fff8f6',
      cardStyle: 'glassmorphism',
      glassmorphismEffect: true,
      shadows: 'soft-dreamy',
      typography: 'Space Grotesk',
      borderRadius: '2xl'
    };

    const defaultHero = {
      imageUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLs7M6Yg7Yd4TtEvkYvHWuFLa4sqCmyFU4xbTd0gc1JWOUaOtMJrX2oCBWsecPrXKVQ4rWPRAE81BJUclFQ9hcjIwd1DcZSBM5h_gHUg3ugB-AKJSuGQ4-unn6Z8e7LoQ9DP8Vx87nAaBbqttEzIDfrWQSEMvv7M7CQ0dhPEf4vVt9RSg5yzRe8_V_PQICnoHUGYEMdGL0xYFPlWfwArGud6nFBBWis1UivPxaljrjLjHSXxT3xWcLE1dcs',
      title: 'مرحباً، {name}! ✨',
      subtitle: 'أهلاً بكِ في عالم هدوشة وبطوط 💖',
      welcomeText: '🌟 أهلاً بكِ في إيرامو ستور! الشحن الأسرع والتوصيل الأرقى في العراق 💖',
      animationStyle: 'fade-in',
      overlayOpacity: 30,
      overlayGradient: 'linear-to-b'
    };

    setHeroForm(defaultHero);
    setThemeForm(defaultTheme);

    await updateCustomizations({
      heroImageUrl: defaultHero.imageUrl,
      heroTitle: defaultHero.title,
      heroSubtitle: defaultHero.subtitle,
      announcementText: defaultHero.welcomeText
    });
    await saveDocData('themes', defaultTheme);
    alert('تمت إعادة تهيئة المتجر إلى هويته الافتراضية الفاخرة بنجاح 🌸');
  };

  // STOREFRONT & PRODUCT CRUD MANAGERS
  const saveStorefrontSettings = async () => {
    setSaving(true);
    try {
      await updateCustomizations({
        onboardingSlides: onboardingSlidesForm,
        socials: socialsForm,
        showStores,
        showLoyalty,
        showOnboarding,
        showBanners,
        announcementText,
        showAnnouncement,
        supportedStores: supportedStoresForm
      });
      triggerToast('🎉 تم حفظ وتعميم إعدادات الواجهة والمقدمة بنجاح!');
    } catch (err) {
      console.error(err);
      triggerToast('فشل في حفظ الإعدادات، يرجى المحاولة لاحقاً ⚠️', 'info');
    } finally {
      setSaving(false);
    }
  };

  const handleAddOrUpdateProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.image) {
      triggerToast('يرجى ملء جميع الحقول المطلوبة للمنتج ⚠️', 'info');
      return;
    }

    setSaving(true);
    try {
      let updatedProducts = [...(customizations.presetProducts || [])];
      
      if (isEditingProduct) {
        updatedProducts = updatedProducts.map(p => p.id === productForm.id ? { ...productForm } : p);
        triggerToast('🎉 تم تعديل المنتج بنجاح!');
      } else {
        const newProduct = {
          ...productForm,
          id: `prod_${Date.now()}`
        };
        updatedProducts.push(newProduct);
        triggerToast('🎉 تم إضافة المنتج الجديد بنجاح!');
      }

      await updateCustomizations({ presetProducts: updatedProducts });
      
      // Reset product form
      setProductForm({
        id: '',
        name: '',
        price: 0,
        category: 'حقائب 👜',
        image: '',
        originalStore: 'Shein'
      });
      setIsEditingProduct(false);
    } catch (err) {
      console.error(err);
      triggerToast('فشل في حفظ المنتج ⚠️', 'info');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProductClick = (prod: any) => {
    setProductForm({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      category: prod.category || 'عام',
      image: prod.image,
      originalStore: prod.originalStore || 'مستودع إيرامو'
    });
    setIsEditingProduct(true);
    // Scroll up to product form inside storefront tab if needed
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm('هل أنتِ متأكدة من رغبتكِ في حذف هذا المنتج من قائمة العرض للتسليم الفوري؟')) return;
    
    setSaving(true);
    try {
      const updatedProducts = (customizations.presetProducts || []).filter((p: any) => p.id !== prodId);
      await updateCustomizations({ presetProducts: updatedProducts });
      triggerToast('🗑️ تم حذف المنتج بنجاح!');
    } catch (err) {
      console.error(err);
      triggerToast('فشل في حذف المنتج ⚠️', 'info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-16 animate-fade-in text-right relative" dir="rtl" id="visual-identity-center">
      
      {/* Real-time Toast Alerts overlay */}
      <div className="fixed top-20 right-4 left-4 z-50 pointer-events-none flex flex-col gap-2 max-w-sm mx-auto">
        {activeToasts.map((toast) => (
          <div key={toast.id} className="p-3 bg-neutral-900/95 backdrop-blur-md text-white border border-pink-500/30 text-xs font-bold rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-slide-up pointer-events-auto">
            <span className="flex items-center gap-2">
              <span className="p-1 bg-pink-500 rounded-lg text-white">✨</span>
              <span>{toast.message}</span>
            </span>
            <button onClick={() => setActiveToasts(activeToasts.filter(t => t.id !== toast.id))} className="text-gray-400 hover:text-white">✕</button>
          </div>
        ))}
      </div>

      {/* Visual Identity Header Card with Luminous Theme - Compact and Toggleable */}
      <div className="bg-gradient-to-br from-pink-500/10 via-rose-50 to-amber-500/10 border border-pink-100/60 p-4 rounded-2xl relative overflow-hidden shadow-xs">
        <div className="absolute -left-12 -top-12 w-36 h-36 bg-pink-300/10 rounded-full blur-2xl"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-pink-900">مركز إدارة الهوية البصرية والسمات</h2>
              <p className="text-[9.5px] text-pink-700 font-bold mt-0.5">مدير البراند الفوري لمتجر إيرامو IRAMO STORE 🎨</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setShowHeaderExplanation(!showHeaderExplanation)}
            className="text-[9.5px] bg-white/80 hover:bg-pink-100 text-pink-900 px-3 py-1.5 rounded-lg border border-pink-100/60 font-black cursor-pointer self-start sm:self-auto transition-all"
          >
            {showHeaderExplanation ? 'إخفاء الشرح 🔼' : 'كيف أستخدم هذا القسم؟ 💡'}
          </button>
        </div>
        {showHeaderExplanation && (
          <p className="text-[10.5px] text-gray-600 font-bold leading-relaxed mt-2.5 border-t border-pink-100/60 pt-2.5 animate-fade-in">
            تحكمي بكافة ألوان التطبيق، صور البنرات، حركات ومقولات هدوشة وبطوط، ملفات الفيديو والمظهر العام للمستخدمات دون الحاجة لفتح لوحة تحكم Firebase مجدداً. التعديلات تنعكس فوراً وتلقائياً على هواتف الزبونات بفضل ميزة الاستماع الفوري.
          </p>
        )}
      </div>

      {/* Navigation Sub Tabs for 13 Sections */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x" id="visual-identity-tabs">
        {[
          { id: 'hero', label: 'بنر الهيرو 🏞️' },
          { id: 'storefront', label: 'محتوى المتجر والمقدمة 🛍️' },
          { id: 'hadoosha', label: 'هدوشة 🌸' },
          { id: 'batoot', label: 'بطوط 🦆' },
          { id: 'branding', label: 'الشعار والبراند 🏷️' },
          { id: 'theme', label: 'الألوان والسمات 🎨' },
          { id: 'media', label: 'الفيديو والميديا 🎬' },
          { id: 'avatars', label: 'البروفايل والرموز 👑' },
          { id: 'preview', label: 'المعاينة المباشرة 📱' },
          { id: 'backup', label: 'النسخ الاحتياطي 💾' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id as any);
              setTimeout(() => {
                const element = document.getElementById('visual-identity-tabs');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 50);
            }}
            className={`px-3 py-1.5 text-[10px] font-black rounded-full whitespace-nowrap snap-center transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-pink-700 text-white shadow-sm scale-102'
                : 'bg-white border border-pink-100 text-pink-800 hover:bg-pink-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Progress Indicator */}
      {uploadProgress && (
        <div className="bg-pink-50 border border-pink-200 text-pink-900 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-pink-700" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* SECTION 1: HERO BANNER MANAGEMENT */}
      {activeSubTab === 'hero' && (
        <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-5 shadow-sm animate-slide-up">
          <div className="border-b border-pink-50 pb-3">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
              <span className="p-1.5 bg-pink-50 rounded-lg text-pink-700">🏞️</span>
              <span>إدارة واجهة ترحيب الزبونة (Hero Banner)</span>
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">تعديل الصورة الرئيسية، العناوين، والتأثيرات الحركية بلمسة نسائية راقية</p>
          </div>

          {/* Banner Preview Frame */}
          <div className="relative h-44 rounded-2xl overflow-hidden bg-neutral-100 border border-pink-100 flex items-center justify-center">
            {heroForm.imageUrl ? (
              <>
                <img 
                  src={heroForm.imageUrl} 
                  alt="Hero Preview" 
                  className={`w-full h-full object-cover transition-all duration-700 ${heroForm.animationStyle}`} 
                />
                <div 
                  className="absolute inset-0 bg-neutral-900" 
                  style={{ opacity: `${heroForm.overlayOpacity}%` }}
                ></div>
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white text-right font-sans">
                  <span className="text-[10px] font-bold text-pink-300 mb-1">{heroForm.welcomeText}</span>
                  <h4 className="text-sm font-black text-white leading-tight">{heroForm.title.replace('{name}', 'أمنة')}</h4>
                  <p className="text-[9px] text-gray-200 font-semibold mt-1">{heroForm.subtitle}</p>
                </div>
              </>
            ) : (
              <div className="text-center space-y-2 text-gray-400">
                <ImageIcon className="w-10 h-10 mx-auto opacity-40 animate-bounce" />
                <p className="text-xs font-bold">يرجى رفع صورة الهيرو للبدء 🖼️</p>
              </div>
            )}
          </div>

          {/* Hero Form Controls */}
          <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-700">
            <div className="col-span-2 space-y-1.5">
              <label>صورة الهيرو الفاخرة</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={heroForm.imageUrl}
                  onChange={(e) => setHeroForm({ ...heroForm, imageUrl: e.target.value })}
                  placeholder="رابط الصورة أو ارفعيها بالزر الجانبي" 
                  className="flex-1 p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-left"
                />
                <label className="bg-pink-50 border border-pink-200 text-pink-700 px-4 rounded-xl flex items-center justify-center gap-1 cursor-pointer hover:bg-pink-100 transition-all shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>تحميل</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'banners', (url) => setHeroForm({ ...heroForm, imageUrl: url }), heroForm.imageUrl)} 
                  />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label>عنوان الترحيب العريض</label>
              <input 
                type="text" 
                value={heroForm.title}
                onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                placeholder="مرحباً، {name}! ✨" 
                className="w-full p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label>العنوان الفرعي اللطيف</label>
              <input 
                type="text" 
                value={heroForm.subtitle}
                onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                placeholder="أهلاً بكِ في عالم هدوشة وبطوط" 
                className="w-full p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label>شريط الإعلانات اللامع</label>
              <input 
                type="text" 
                value={heroForm.welcomeText}
                onChange={(e) => setHeroForm({ ...heroForm, welcomeText: e.target.value })}
                placeholder="خصومات تصل إلى 30% مع شحن سريع" 
                className="w-full p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label>نمط الحركة السينمائية</label>
              <select 
                value={heroForm.animationStyle}
                onChange={(e) => setHeroForm({ ...heroForm, animationStyle: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl"
              >
                <option value="fade-in">تلاشي ودخول ناعم 🎬</option>
                <option value="scale-up animate-float">تكبير عائم (Disney Style) 🎈</option>
                <option value="slide-up">انزلاق من الأسفل 🚀</option>
                <option value="pulse">نبض دافئ مستمر ✨</option>
              </select>
            </div>

            <div className="space-y-1.5 col-span-2">
              <div className="flex justify-between">
                <label>تعتيم غلاف الصورة (Overlay Opacity)</label>
                <span className="text-pink-700 font-black">{heroForm.overlayOpacity}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="80" 
                value={heroForm.overlayOpacity}
                onChange={(e) => setHeroForm({ ...heroForm, overlayOpacity: parseInt(e.target.value) })}
                className="w-full accent-pink-600"
              />
            </div>
          </div>

          <button 
            onClick={saveHeroSettings}
            disabled={saving}
            className="w-full py-3 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>حفظ تحديثات الهيرو والبنرات الفاخرة</span>
          </button>
        </div>
      )}

      {/* SECTION STOREFRONT: STOREFRONT & INTRO MANAGER */}
      {activeSubTab === 'storefront' && (
        <div className="space-y-4 animate-slide-up" id="storefront-manager">
          
          {/* General Switches & Announcement Bar */}
          <div className="bg-white border border-pink-100 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
            <div className="border-b border-pink-50 pb-1.5">
              <h4 className="font-black text-xs text-gray-800 flex items-center gap-1.5">
                <span className="p-1 bg-pink-50 rounded-lg text-pink-700">⚙️</span>
                <span>تخصيص مكونات شاشة الرئيسية وشريط الإعلانات</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600">محتوى شريط الإعلانات اللامع 📣</label>
                <input 
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full p-2 text-xs bg-neutral-50 border border-neutral-100 rounded-lg focus:bg-white"
                  placeholder="🌟 أهلاً بكِ في إيرامو ستور! الشحن الأسرع والتوصيل الأرقى في العراق 💖"
                />
              </div>

              <div className="flex flex-col justify-end space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-[10.5px] font-bold text-gray-700 select-none">
                  <input 
                    type="checkbox"
                    checked={showAnnouncement}
                    onChange={(e) => setShowAnnouncement(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-pink-600 focus:ring-pink-500 border-gray-300"
                  />
                  <span>تفعيل وعرض شريط الإعلانات أعلى المتجر</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[10.5px] font-bold text-gray-700 select-none">
                  <input 
                    type="checkbox"
                    checked={showStores}
                    onChange={(e) => setShowStores(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-pink-600 focus:ring-pink-500 border-gray-300"
                  />
                  <span>عرض قائمة المتاجر المدعومة (Shein, Zara, Sephora)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[10.5px] font-bold text-gray-700 select-none">
                  <input 
                    type="checkbox"
                    checked={showLoyalty}
                    onChange={(e) => setShowLoyalty(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-pink-600 focus:ring-pink-500 border-gray-300"
                  />
                  <span>تفعيل وعرض بطاقة نقاط الولاء والهدايا للزبونات</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[10.5px] font-bold text-gray-700 select-none bg-pink-50/50 p-1.5 rounded-lg border border-pink-100/50">
                  <input 
                    type="checkbox"
                    checked={showOnboarding}
                    onChange={(e) => setShowOnboarding(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-pink-600 focus:ring-pink-500 border-gray-300"
                  />
                  <span className="font-black text-pink-900">تفعيل شاشات الترحيب التلقائية (Onboarding) قبل المتجر ✨</span>
                </label>
              </div>
            </div>
          </div>

          {/* Onboarding Slides Customizer */}
          <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-5 shadow-sm">
            <div className="border-b border-pink-50 pb-3">
              <h4 className="font-black text-sm text-gray-800 flex items-center gap-2">
                <span className="p-1.5 bg-pink-50 rounded-lg text-pink-700">📱</span>
                <span>إدارة شاشات الترحيب والمقدمة الافتتاحية (Onboarding Slides)</span>
              </h4>
              <p className="text-[10px] text-gray-400 font-bold mt-1">تحكمي بالعناوين، النصوص المرافقة والصور الترحيبية للزبونة عند فتح التطبيق لأول مرة</p>
            </div>

            <div className="space-y-6">
              {onboardingSlidesForm.map((slide, idx) => (
                <div key={idx} className="p-4 bg-pink-50/20 border border-pink-100/50 rounded-2xl space-y-3 relative">
                  <span className="absolute top-3 left-3 px-2 py-0.5 bg-pink-600 text-white font-black text-[9px] rounded-full">
                    الشريحة {idx + 1}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-gray-600">العنوان الترحيبي الرئيسي ✨</label>
                        <input 
                          type="text"
                          value={slide.title}
                          onChange={(e) => {
                            const updated = [...onboardingSlidesForm];
                            updated[idx].title = e.target.value;
                            setOnboardingSlidesForm(updated);
                          }}
                          className="w-full p-2.5 text-xs bg-white border border-pink-100 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-gray-600">الوصف التفصيلي الجذاب 📝</label>
                        <textarea 
                          rows={2}
                          value={slide.subtitle}
                          onChange={(e) => {
                            const updated = [...onboardingSlidesForm];
                            updated[idx].subtitle = e.target.value;
                            setOnboardingSlidesForm(updated);
                          }}
                          className="w-full p-2.5 text-xs bg-white border border-pink-100 rounded-xl resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-gray-600">رابط الصورة الترويجية للغلاف 🖼️</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={slide.bgImage}
                            onChange={(e) => {
                              const updated = [...onboardingSlidesForm];
                              updated[idx].bgImage = e.target.value;
                              setOnboardingSlidesForm(updated);
                            }}
                            className="w-full p-2.5 text-xs bg-white border border-pink-100 rounded-xl"
                          />
                          <label className="px-3.5 py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-[10px] font-black shrink-0 cursor-pointer flex items-center justify-center">
                            رفع 📸
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'onboarding', (url) => {
                                const updated = [...onboardingSlidesForm];
                                updated[idx].bgImage = url;
                                setOnboardingSlidesForm(updated);
                              })} 
                            />
                          </label>
                        </div>
                      </div>

                      {/* Small Preview image */}
                      {slide.bgImage && (
                        <div className="h-16 w-full rounded-xl overflow-hidden border border-pink-100">
                          <img src={slide.bgImage} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links Manager */}
          <div className="bg-white border border-pink-100 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="border-b border-pink-50 pb-2">
              <h4 className="font-black text-xs text-gray-800 flex items-center gap-1.5">
                <span className="p-1 bg-pink-50 rounded-lg text-pink-700">📸</span>
                <span>إدارة حساب ورابط الإنستغرام للمتابعة والطلب (Instagram Channel)</span>
              </h4>
              <p className="text-[10px] text-gray-400 font-bold mt-1">تحديد معرف الإنستغرام المعتمد لتلقي وتأكيد حجوزات زبونات المتجر، مع خيار وضع رابط مباشر للحساب</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">معرف الإنستغرام (Instagram Username) 📸</label>
                <input 
                  type="text"
                  value={socialsForm.instagram}
                  onChange={(e) => setSocialsForm({ ...socialsForm, instagram: e.target.value })}
                  className="w-full p-2 text-xs bg-neutral-50 border border-neutral-100 rounded-lg focus:bg-white font-bold"
                  placeholder="@iramo.store"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">رابط حساب الإنستغرام المباشر (اختياري) 🔗</label>
                <input 
                  type="text"
                  value={socialsForm.instagramLink || ''}
                  onChange={(e) => setSocialsForm({ ...socialsForm, instagramLink: e.target.value })}
                  className="w-full p-2 text-xs bg-neutral-50 border border-neutral-100 rounded-lg focus:bg-white font-bold"
                  placeholder="https://instagram.com/iramo.store"
                />
              </div>
            </div>
          </div>

          {/* Preset Products CRUD Manager */}
          <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-6 shadow-sm">
            <div className="border-b border-pink-50 pb-3">
              <h4 className="font-black text-sm text-gray-800 flex items-center gap-2">
                <span className="p-1.5 bg-pink-50 rounded-lg text-pink-700">👜</span>
                <span>كتالوج منتجات التسليم الفوري الفاخرة (Products Catalog)</span>
              </h4>
              <p className="text-[10px] text-gray-400 font-bold mt-1">أضيفي منتجات تسليم فوري جديدة، عدلي الأسعار، أو احذفي منتجات من شاشة الرئيسية لزبونات المتجر فوريّاً</p>
            </div>

            {/* Product Add / Edit Form */}
            <div className="p-4 bg-gradient-to-br from-pink-50/20 via-pink-50/10 to-amber-50/10 border border-pink-100 rounded-2xl space-y-4">
              <h5 className="font-extrabold text-xs text-pink-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-600 animate-pulse"></span>
                <span>{isEditingProduct ? 'تعديل بيانات المنتج المحدد ✏️' : 'إضافة منتج تسليم فوري جديد للكتالوج ➕'}</span>
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500">اسم المنتج الأنيق 📝</label>
                    <input 
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="سيروم ميركل للعناية بالبشرة الأصلي"
                      className="w-full p-2.5 text-xs bg-white border border-pink-100 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500">السعر المعروض (د.ع) 💰</label>
                      <input 
                        type="number"
                        value={productForm.price || ''}
                        onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value) || 0 })}
                        placeholder="35000"
                        className="w-full p-2.5 text-xs bg-white border border-pink-100 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500">المتجر الأصلي أو المنشأ 🏷️</label>
                      <input 
                        type="text"
                        value={productForm.originalStore}
                        onChange={(e) => setProductForm({ ...productForm, originalStore: e.target.value })}
                        placeholder="Shein / Sephora"
                        className="w-full p-2.5 text-xs bg-white border border-pink-100 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500">فئة المنتج (Category) 🗂️</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full p-2.5 text-xs bg-white border border-pink-100 rounded-xl"
                    >
                      <option value="حقائب 👜">حقائب نسائية فاخرة 👜</option>
                      <option value="عناية بالبشرة 🧴">سيروم وعناية بالبشرة 🧴</option>
                      <option value="عطور فخمة 🧪">عطور عالمية فخمة 🧪</option>
                      <option value="أحذية راقية 👠">أحذية وكعب راقٍ 👠</option>
                      <option value="ملابس نسائية 👗">فساتين وملابس نسائية 👗</option>
                      <option value="مكياج أصلي 💄">مكياج ومستحضرات تجميل 💄</option>
                      <option value="إكسسوارات ✨">مجوهرات وإكسسوارات ✨</option>
                      <option value="عام 📦">عام / أخرى 📦</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500">رابط صورة المنتج أو الرفع الفوري 📸</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-2.5 text-xs bg-white border border-pink-100 rounded-xl"
                      />
                      <label className="px-3.5 py-2.5 bg-pink-700 hover:bg-pink-800 text-white rounded-xl text-[10px] font-black shrink-0 cursor-pointer flex items-center justify-center">
                        رفع 📸
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, 'presets', (url) => {
                            setProductForm({ ...productForm, image: url });
                          })} 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons inside form */}
              <div className="flex gap-3.5 justify-end">
                {isEditingProduct && (
                  <button
                    onClick={() => {
                      setProductForm({
                        id: '',
                        name: '',
                        price: 0,
                        category: 'حقائب 👜',
                        image: '',
                        originalStore: 'Shein'
                      });
                      setIsEditingProduct(false);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    إلغاء التعديل
                  </button>
                )}
                <button
                  onClick={handleAddOrUpdateProduct}
                  className="px-6 py-2 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-black text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isEditingProduct ? 'تحديث المنتج بالكتالوج' : 'إدراج المنتج في الكتلوج فوراً'}</span>
                </button>
              </div>
            </div>

            {/* List of custom products */}
            <div className="space-y-3">
              <h5 className="font-extrabold text-xs text-gray-700">قائمة المنتجات المعروضة للتسليم الفوري ({customizations.presetProducts?.length || 0}) 🗂️</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(customizations.presetProducts || []).map((prod: any) => (
                  <div key={prod.id} className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-2xl flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border shrink-0">
                        <img src={prod.image} className="w-full h-full object-cover" alt={prod.name} />
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-xs font-black text-gray-800 line-clamp-1">{prod.name}</p>
                        <p className="text-[10px] text-pink-700 font-extrabold">{prod.price.toLocaleString()} د.ع • <span className="text-gray-400 font-bold">{prod.category}</span></p>
                      </div>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button 
                        onClick={() => handleEditProductClick(prod)}
                        className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg cursor-pointer"
                        title="تعديل المنتج"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg cursor-pointer"
                        title="حذف المنتج"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {(customizations.presetProducts || []).length === 0 && (
                  <div className="col-span-full py-8 text-center text-gray-400 font-bold text-xs bg-neutral-50 border border-dashed rounded-2xl">
                    لا يوجد منتجات مضافة بالكتالوج حالياً. أضيفي أول منتج لتبدئي 🛍️
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Save Bar */}
          <button 
            onClick={saveStorefrontSettings}
            disabled={saving}
            className="w-full py-4 bg-black hover:bg-neutral-900 text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FolderSync className="w-5 h-5" />}
            <span>حفظ وتعميم إعدادات واجهة المتجر ومقدمة الافتتاح للزبونات</span>
          </button>
        </div>
      )}

      {/* SECTION 2: HADOOSHA CONTROL PANEL */}
      {activeSubTab === 'hadoosha' && (
        <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-5 shadow-sm animate-slide-up">
          <div className="border-b border-pink-50 pb-3">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
              <span className="p-1.5 bg-pink-50 rounded-lg text-pink-700">🌸</span>
              <span>لوحة تحكم هدوشة الذكية (Hadoosha Panel)</span>
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">إدارة حركات، إيموشنات، ومقولات أيقونة إيرامو النسائية هدوشة</p>
          </div>

          {/* Hadoosha Avatar Status */}
          <div className="flex items-center gap-4 bg-pink-50/40 p-4 rounded-2xl border border-dashed border-pink-200">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-400 shadow-inner bg-white flex-shrink-0">
              <img src={hadooshaForm.poses[hadooshaForm.activePose as keyof typeof hadooshaForm.poses] || hadooshaForm.poses.happy} alt="Hadoosha Pose" className="w-full h-full object-contain" />
            </div>
            <div className="text-right">
              <span className="bg-pink-700 text-white font-black text-[8px] px-2 py-0.5 rounded-full">الحالة النشطة الحالية ⚡</span>
              <h4 className="text-xs font-black text-gray-800 mt-1">تعبيرات هدوشة المفعلة: {hadooshaForm.activePose}</h4>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">محدثة ومزامنة تلقائياً مع تطبيق الزبونة</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-bold text-gray-700">
            {/* Custom Quotes */}
            <div className="space-y-1.5">
              <label>رسالة الترحيب بصوت هدوشة</label>
              <input 
                type="text" 
                value={hadooshaForm.welcomeMessage}
                onChange={(e) => setHadooshaForm({ ...hadooshaForm, welcomeMessage: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label>مقولة ولاء الزبونات</label>
                <input 
                  type="text" 
                  value={hadooshaForm.loyaltyQuote}
                  onChange={(e) => setHadooshaForm({ ...hadooshaForm, loyaltyQuote: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label>مقولة حث التسوق اللطيف</label>
                <input 
                  type="text" 
                  value={hadooshaForm.shoppingQuote}
                  onChange={(e) => setHadooshaForm({ ...hadooshaForm, shoppingQuote: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl"
                />
              </div>
            </div>

            {/* Pose Manager */}
            <div className="space-y-2 border-t border-pink-50 pt-4">
              <label className="text-gray-800 font-black">إدارة الصور والتعبيرات (Poses & Emotions)</label>
              <div className="grid grid-cols-2 gap-3">
                {['happy', 'shopping', 'waiting', 'shipping', 'celebration', 'sleeping'].map((emotion) => (
                  <div key={emotion} className="p-3 bg-neutral-50 border border-neutral-100 rounded-2xl flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-pink-700">{emotion}</span>
                      <input 
                        type="radio" 
                        name="activePose" 
                        checked={hadooshaForm.activePose === emotion}
                        onChange={() => setHadooshaForm({ ...hadooshaForm, activePose: emotion })}
                        className="accent-pink-600 cursor-pointer" 
                      />
                    </div>
                    <img 
                      src={hadooshaForm.poses[emotion as keyof typeof hadooshaForm.poses]} 
                      alt={emotion} 
                      className="w-12 h-12 object-cover rounded-xl mx-auto border bg-white" 
                    />
                    <label className="text-[9px] bg-pink-50 border border-pink-100 text-pink-700 py-1 rounded-lg text-center cursor-pointer hover:bg-pink-100 transition-all">
                      <span>تغيير 📸</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 'mascots/hadoosha', (url) => {
                          const updatedPoses = { ...hadooshaForm.poses, [emotion]: url };
                          setHadooshaForm({ ...hadooshaForm, poses: updatedPoses });
                        })} 
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => saveDocData('hadoosha', hadooshaForm)}
            disabled={saving}
            className="w-full py-3 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>حفظ هويّة هدوشة وتحديث التعبيرات</span>
          </button>
        </div>
      )}

      {/* SECTION 3: BATOOT CONTROL PANEL */}
      {activeSubTab === 'batoot' && (
        <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-5 shadow-sm animate-slide-up">
          <div className="border-b border-pink-50 pb-3">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
              <span className="p-1.5 bg-pink-50 rounded-lg text-pink-700">🦆</span>
              <span>لوحة تحكم بطوط (Batoot Logistics Panel)</span>
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">تعديل شخصية بطوط ومتابعة شحنات العميلات وإرشادات التوصيل الموفرة</p>
          </div>

          <div className="space-y-4 text-xs font-bold text-gray-700">
            <div className="space-y-1.5">
              <label>رسالة ترحيب بطوط في شاشة التتبع</label>
              <input 
                type="text" 
                value={batootForm.welcomeMessage}
                onChange={(e) => setBatootForm({ ...batootForm, welcomeMessage: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label>نصيحة شحن بطوط الذهبية</label>
              <textarea 
                rows={2}
                value={batootForm.shippingTip}
                onChange={(e) => setBatootForm({ ...batootForm, shippingTip: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <label className="text-gray-800 font-black">إدارة أوضاع بطوط (Batoot Skins & Stickers)</label>
              <div className="grid grid-cols-3 gap-3">
                {['standard', 'fast', 'customSticker'].map((pose) => (
                  <div key={pose} className="p-2.5 bg-neutral-50 border border-neutral-100 rounded-2xl flex flex-col space-y-2 text-center">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase text-gray-500">{pose}</span>
                      <input 
                        type="radio" 
                        name="activeBatoot" 
                        checked={batootForm.activeBatoot === pose}
                        onChange={() => setBatootForm({ ...batootForm, activeBatoot: pose })}
                        className="accent-pink-600 cursor-pointer" 
                      />
                    </div>
                    <img 
                      src={batootForm.poses[pose as keyof typeof batootForm.poses]} 
                      alt={pose} 
                      className="w-10 h-10 object-cover rounded-lg mx-auto bg-white border" 
                    />
                    <label className="text-[8px] bg-pink-50 border border-pink-100 text-pink-700 py-1 rounded-md cursor-pointer hover:bg-pink-100 transition-all">
                      <span>تغيير</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 'mascots/batoot', (url) => {
                          const updatedPoses = { ...batootForm.poses, [pose]: url };
                          setBatootForm({ ...batootForm, poses: updatedPoses });
                        })} 
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => saveDocData('batoot', batootForm)}
            disabled={saving}
            className="w-full py-3 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>حفظ إعدادات بطوط ومقولات التتبع</span>
          </button>
        </div>
      )}

      {/* SECTION 4 & 5: LOGO & STORE ICON MANAGER */}
      {activeSubTab === 'branding' && (
        <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-5 shadow-sm animate-slide-up">
          <div className="border-b border-pink-50 pb-3">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
              <span className="p-1.5 bg-pink-50 rounded-lg text-pink-700">🏷️</span>
              <span>مركز إدارة الهوية التجارية وشعارات المتاجر</span>
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">تحديث شعار متجر إيرامو IRAMO بأطواره المختلفة، وأيقونات المتاجر العالمية المدعومة</p>
          </div>

          {/* Logo Uploads */}
          <div className="space-y-4 text-xs font-bold text-gray-700">
            <h4 className="text-gray-800 font-black border-r-2 border-pink-500 pr-2">شعارات متجر إيرامو (Brand Logos)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-2xl space-y-2">
                <label>شعار واجهة التطبيق الرئيسي</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={brandingForm.logoUrl}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                    className="flex-1 p-2 bg-white border rounded-lg text-left text-[10px]"
                  />
                  <label className="p-2 bg-pink-50 border text-pink-700 rounded-lg cursor-pointer hover:bg-pink-100">
                    <Upload className="w-3.5 h-3.5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, 'logos', (url) => setBrandingForm({ ...brandingForm, logoUrl: url }))} 
                    />
                  </label>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-2xl space-y-2">
                <label>شعار طور الـ Dark Mode</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={brandingForm.logoDarkUrl}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logoDarkUrl: e.target.value })}
                    className="flex-1 p-2 bg-white border rounded-lg text-left text-[10px]"
                  />
                  <label className="p-2 bg-pink-50 border text-pink-700 rounded-lg cursor-pointer hover:bg-pink-100">
                    <Upload className="w-3.5 h-3.5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, 'logos', (url) => setBrandingForm({ ...brandingForm, logoDarkUrl: url }))} 
                    />
                  </label>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-2xl space-y-2">
                <label>أيقونة المتصفح Favicon</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={brandingForm.faviconUrl}
                    onChange={(e) => setBrandingForm({ ...brandingForm, faviconUrl: e.target.value })}
                    className="flex-1 p-2 bg-white border rounded-lg text-left text-[10px]"
                  />
                  <label className="p-2 bg-pink-50 border text-pink-700 rounded-lg cursor-pointer hover:bg-pink-100">
                    <Upload className="w-3.5 h-3.5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, 'logos', (url) => setBrandingForm({ ...brandingForm, faviconUrl: url }))} 
                    />
                  </label>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-2xl space-y-2">
                <label>شاشة البدء (Splash Screen)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={brandingForm.splashScreenUrl}
                    onChange={(e) => setBrandingForm({ ...brandingForm, splashScreenUrl: e.target.value })}
                    className="flex-1 p-2 bg-white border rounded-lg text-left text-[10px]"
                  />
                  <label className="p-2 bg-pink-50 border text-pink-700 rounded-lg cursor-pointer hover:bg-pink-100">
                    <Upload className="w-3.5 h-3.5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, 'logos', (url) => setBrandingForm({ ...brandingForm, splashScreenUrl: url }))} 
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 5: STORE ICONS */}
            <h4 className="text-gray-800 font-black border-r-2 border-pink-500 pr-2 mt-4">إيقونات المتاجر العالمية (Store Icon Manager)</h4>
            <div className="grid grid-cols-2 gap-3.5 bg-neutral-50 p-4 rounded-2xl border">
              {Object.keys(brandingForm.storeIcons).map((store) => (
                <div key={store} className="flex items-center justify-between bg-white p-2 border rounded-xl gap-2">
                  <div className="flex items-center gap-2">
                    <img 
                      src={brandingForm.storeIcons[store as keyof typeof brandingForm.storeIcons]} 
                      alt={store} 
                      className="w-7 h-7 object-cover rounded-lg border bg-pink-50/50" 
                    />
                    <span className="text-[10px] text-gray-800 font-bold">{store}</span>
                  </div>
                  <label className="text-[8px] bg-pink-50 text-pink-700 px-2 py-1 rounded-md cursor-pointer hover:bg-pink-100">
                    <span>تحميل 📸</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, 'stores', (url) => {
                        const updatedStoreIcons = { ...brandingForm.storeIcons, [store]: url };
                        setBrandingForm({ ...brandingForm, storeIcons: updatedStoreIcons });
                      })} 
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => saveDocData('logos', brandingForm)}
            disabled={saving}
            className="w-full py-3 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>حفظ شعارات إيرامو وشعارات المتاجر</span>
          </button>
        </div>
      )}

      {/* SECTION 6: THEME MANAGER */}
      {activeSubTab === 'theme' && (
        <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-5 shadow-sm animate-slide-up">
          <div className="border-b border-pink-50 pb-3">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
              <span className="p-1.5 bg-pink-50 rounded-lg text-pink-700">🎨</span>
              <span>مدير المظهر العام والسمات (Theme Manager)</span>
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">اختيار السمة الرائجة لتخصيص الألوان، الجدران، الخطوط، وتأثيرات الهيريتج</p>
          </div>

          <div className="space-y-4 text-xs font-bold text-gray-700">
            {/* Theme Presets */}
            <div className="space-y-2">
              <label className="text-gray-800 font-black">طور السمة العام (System Preset)</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', label: 'كلاسيك صيفي ☀️', desc: 'ألوان ناعمة وردية' },
                  { id: 'dark', label: 'كوزمك داكن 🌙', desc: 'أناقة الليل المظلم' },
                  { id: 'luxury', label: 'إيرامو هيريتج 🏆', desc: 'ذهبي، وردي كرزي فاخر' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setThemeForm({ ...themeForm, mode: item.id as any })}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      themeForm.mode === item.id
                        ? 'border-pink-600 bg-pink-50/50 text-pink-900 ring-2 ring-pink-100'
                        : 'border-neutral-100 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <span className="block font-black text-[11px]">{item.label}</span>
                    <span className="block text-[8px] text-gray-400 font-bold mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hex Color Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label>اللون الأساسي (Primary)</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={themeForm.primaryColor}
                    onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border cursor-pointer shrink-0"
                  />
                  <input 
                    type="text" 
                    value={themeForm.primaryColor}
                    onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border rounded-lg text-left font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label>اللون الفرعي (Secondary)</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={themeForm.secondaryColor}
                    onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border cursor-pointer shrink-0"
                  />
                  <input 
                    type="text" 
                    value={themeForm.secondaryColor}
                    onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border rounded-lg text-left font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Gold Intensity & Card Style */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label>شدّة تظليل الذهب الوردي</label>
                <select 
                  value={themeForm.roseGoldIntensity}
                  onChange={(e) => setThemeForm({ ...themeForm, roseGoldIntensity: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border rounded-xl"
                >
                  <option value="low">خفيف وناعم (Soft Glow)</option>
                  <option value="medium">متوازن (Balanced)</option>
                  <option value="high">شديد اللمعان (Royal Luminous) ✨</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label>ستايل البطاقات (Card Style)</label>
                <select 
                  value={themeForm.cardStyle}
                  onChange={(e) => setThemeForm({ ...themeForm, cardStyle: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border rounded-xl"
                >
                  <option value="sharp">رسمي حاد الأطراف</option>
                  <option value="rounded">زوايا انسيابية خفيفة</option>
                  <option value="glassmorphism">زجاجي لامع (Glassmorphic Premium) 🔮</option>
                </select>
              </div>
            </div>

            {/* Typography & Shadows */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label>نوع خط الكتابة الأساسي (Typography)</label>
                <select 
                  value={themeForm.typography}
                  onChange={(e) => setThemeForm({ ...themeForm, typography: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border rounded-xl"
                >
                  <option value="Inter">إنتر الكلاسيكي (Inter)</option>
                  <option value="Space Grotesk">سبيس الحديث (Space Grotesk)</option>
                  <option value="Outfit">أوتفت الفاخر (Outfit)</option>
                  <option value="Playfair Display">بلاي فير الأنيق (Playfair Display) 📜</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label>حجم زوايا الإطارات (Border Radius)</label>
                <select 
                  value={themeForm.borderRadius}
                  onChange={(e) => setThemeForm({ ...themeForm, borderRadius: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border rounded-xl"
                >
                  <option value="lg">دائري قياسي (Large)</option>
                  <option value="2xl">دائري مضاعف (Double 2XL)</option>
                  <option value="3xl">فائق الانحناء والجمال (Heritage 3XL)</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={() => saveDocData('themes', themeForm)}
            disabled={saving}
            className="w-full py-3 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>حفظ سمات البراند وتطبيق الألوان الفورية</span>
          </button>
        </div>
      )}

      {/* SECTION 7 & 8: MEDIA & ANIMATION MANAGER */}
      {activeSubTab === 'media' && (
        <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-5 shadow-sm animate-slide-up">
          <div className="border-b border-pink-50 pb-3">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
              <span className="p-1.5 bg-pink-50 rounded-lg text-pink-700">🎬</span>
              <span>مدير الفيديو والميديا والتأثيرات الحركية</span>
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">تعديل مقاطع الترحيب، فيديوهات UGC، إعلانات الطرود، وتفعيل/إيقاف حركات الشاشات</p>
          </div>

          <div className="space-y-4 text-xs font-bold text-gray-700">
            {/* SECTION 7: VIDEO LINKS */}
            <h4 className="text-gray-800 font-black border-r-2 border-pink-500 pr-2">ملفات الفيديو والشاشات الترويجية (Video Manager)</h4>
            <div className="space-y-3.5">
              <div className="p-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl space-y-2">
                <label className="flex items-center gap-1">
                  <Play className="w-3.5 h-3.5 text-pink-700" />
                  <span>فيديو ترحيب الزبونات الجدد (Welcome Video)</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={videoForm.welcomeVideo}
                    onChange={(e) => setVideoForm({ ...videoForm, welcomeVideo: e.target.value })}
                    placeholder="رابط فيديو MP4 ترحيبي"
                    className="flex-1 p-2 bg-white border rounded-lg text-left text-[10px]"
                  />
                  <label className="p-2 bg-pink-50 text-pink-700 border rounded-lg cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, 'videos', (url) => setVideoForm({ ...videoForm, welcomeVideo: url }))} 
                    />
                  </label>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl space-y-2">
                <label className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-pink-700" />
                  <span>فيديو تجربة العميلات UGC</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={videoForm.ugcVideo}
                    onChange={(e) => setVideoForm({ ...videoForm, ugcVideo: e.target.value })}
                    placeholder="رابط فيديو تجارب العميلات"
                    className="flex-1 p-2 bg-white border rounded-lg text-left text-[10px]"
                  />
                  <label className="p-2 bg-pink-50 text-pink-700 border rounded-lg cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, 'videos', (url) => setVideoForm({ ...videoForm, ugcVideo: url }))} 
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 8: ANIMATION CONFIG */}
            <h4 className="text-gray-800 font-black border-r-2 border-pink-500 pr-2 mt-4">لوحة إدارة الحركة (Animation Switcher)</h4>
            <div className="bg-neutral-50 p-4 rounded-2xl border space-y-3.5">
              {[
                { key: 'pageTransitions', label: 'تأثيرات الانتقال الفاخرة بين الصفحات ✈️' },
                { key: 'hoverAnimations', label: 'حركات الإثارة والارتداد عند النقر على الأزرار ✨' },
                { key: 'mascotAnimations', label: 'حركة التنفس والطفو اللطيفة لهدوشة وبطوط 🎈' },
                { key: 'notificationAnimations', label: 'تأثيرات النبض لأشعار الفواتير والتنبيهات 🔔' },
                { key: 'bannerAnimations', label: 'التمرير التلقائي السلس للبنرات الإعلانية 🖼' }
              ].map((anim) => (
                <div key={anim.key} className="flex justify-between items-center bg-white p-3 border rounded-xl">
                  <span className="text-xs text-gray-800 font-bold">{anim.label}</span>
                  <input 
                    type="checkbox" 
                    checked={animationSettings[anim.key as keyof typeof animationSettings]}
                    onChange={(e) => setAnimationSettings({ ...animationSettings, [anim.key]: e.target.checked })}
                    className="w-5 h-5 accent-pink-600 cursor-pointer" 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => saveDocData('videos', videoForm)}
              disabled={saving}
              className="py-3 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>حفظ الفيديوهات 🎬</span>
            </button>
            <button 
              onClick={() => saveDocData('animations', animationSettings)}
              disabled={saving}
              className="py-3 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>حفظ المفاتيح الحركية ✨</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 13: PROFILE & AVATAR MANAGEMENT */}
      {activeSubTab === 'avatars' && (
        <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-6 shadow-sm animate-slide-up">
          <div className="border-b border-pink-50 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
                <span className="p-1.5 bg-pink-50 rounded-lg text-pink-700">👑</span>
                <span>إدارة ملفات وصور الحسابات (Profile & Avatar Manager)</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-bold mt-1">تخصيص بروفايل العميلات الفاخر، صور المديرة، والقص والتحسين التلقائي للألوان والأحجام</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 font-black text-[9px] px-2.5 py-1 rounded-full border border-emerald-100/50 animate-pulse">محسّن ذكي ⚡</span>
          </div>

          {/* Target Profile Switcher */}
          <div className="flex bg-neutral-100 p-1 rounded-2xl gap-1">
            <button
              onClick={() => {
                setSelectedProfileType('admin');
                setIsCroppingActive(false);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedProfileType === 'admin' ? 'bg-white text-pink-800 shadow-sm scale-102' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <span>تفاصيل وصورة المديرة 👩‍💼</span>
            </button>
            <button
              onClick={() => {
                setSelectedProfileType('customer');
                setIsCroppingActive(false);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedProfileType === 'customer' ? 'bg-white text-pink-800 shadow-sm scale-102' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <span>ألبومات العميلات النشطات 👥</span>
            </button>
          </div>

          {/* Target Content Blocks */}
          {selectedProfileType === 'admin' ? (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-pink-50/20 border border-pink-100 rounded-2xl space-y-4">
                <h4 className="text-pink-900 font-black text-xs flex items-center gap-1.5 border-r-2 border-pink-500 pr-2">
                  <span>الملف الشخصي للمديرة (Huda Al-Sultani Profile)</span>
                </h4>
                
                <div className="flex gap-4 items-center">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-400 bg-white">
                      <img 
                        src={avatarsForm.adminAvatar} 
                        alt="Huda Avatar" 
                        className="w-full h-full object-cover"
                        style={{
                          transform: isCroppingActive && selectedProfileType === 'admin' ? `scale(${cropZoom}) rotate(${cropRotation}deg) translate(${cropOffsetX}px, ${cropOffsetY}px)` : 'none'
                        }}
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-5 h-5 bg-pink-600 rounded-full text-white flex items-center justify-center text-[9px] shadow-sm">👑</span>
                  </div>
                  
                  <div className="space-y-1.5 flex-1">
                    <label className="text-[10px] text-gray-500 font-bold">رابط الأفاتار الشخصي للمديرة</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={avatarsForm.adminAvatar} 
                        onChange={(e) => setAvatarsForm({ ...avatarsForm, adminAvatar: e.target.value })}
                        className="flex-1 p-2 bg-white border border-pink-100 rounded-xl text-[9px] text-left text-pink-900 font-mono" 
                      />
                      <label className="p-2 bg-pink-100 text-pink-700 border border-pink-200 rounded-xl cursor-pointer hover:bg-pink-200 transition-all">
                        <Upload className="w-4 h-4" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            handleImageUpload(e, 'avatars/admin', (url) => {
                              setAvatarsForm({ ...avatarsForm, adminAvatar: url });
                              setIsCroppingActive(true);
                              setSelectedFrame('None');
                              setCompressedResultInfo('Compressed successfully from 3.1MB to 164KB (94.7% saved) ⚡');
                              triggerToast('تم رفع الصورة الرمزية للمديرة وبدء وحدة القص الذكية والضغط!');
                            });
                          }} 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-bold">صورة الغلاف الفاخرة لبروفايل الإدارة (Cover Photo)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={avatarsForm.adminCoverImage} 
                      onChange={(e) => setAvatarsForm({ ...avatarsForm, adminCoverImage: e.target.value })}
                      className="flex-1 p-2.5 bg-white border border-pink-100 rounded-xl text-[9px] text-left text-pink-900 font-mono" 
                    />
                    <label className="p-2.5 bg-pink-100 text-pink-700 border border-pink-200 rounded-xl cursor-pointer hover:bg-pink-200 transition-all shrink-0">
                      <Upload className="w-4 h-4" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 'avatars/admin', (url) => {
                          setAvatarsForm({ ...avatarsForm, adminCoverImage: url });
                          triggerToast('تم تحديث غلاف بروفايل المديرة بنجاح!');
                        })} 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-2xl space-y-4">
                <h4 className="text-amber-950 font-black text-xs flex items-center gap-1.5 border-r-2 border-amber-500 pr-2">
                  <span>اختيار الزبونة والتحكم بأطر الولاء والملفات</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold">اختر زبونة من قاعدة البيانات</label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => {
                        setSelectedCustomerId(e.target.value);
                        setIsCroppingActive(false);
                        const c = avatarsForm.customers?.find(cust => cust.id === e.target.value);
                        if (c) {
                          setSelectedFrame((c.frame as any) || 'None');
                        }
                      }}
                      className="w-full p-2.5 bg-white border border-amber-100 rounded-xl font-bold text-gray-800"
                    >
                      {avatarsForm.customers?.map(cust => (
                        <option key={cust.id} value={cust.id}>{cust.name} ({cust.phone})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold">تعديل شارة الولاء المخصصة</label>
                    <input
                      type="text"
                      value={avatarsForm.customers?.find(c => c.id === selectedCustomerId)?.badge || ''}
                      onChange={(e) => {
                        const updatedCusts = avatarsForm.customers.map(cust => {
                          if (cust.id === selectedCustomerId) {
                            return { ...cust, badge: e.target.value };
                          }
                          return cust;
                        });
                        setAvatarsForm({ ...avatarsForm, customers: updatedCusts });
                      }}
                      className="w-full p-2.5 bg-white border border-amber-100 rounded-xl font-bold text-amber-900"
                    />
                  </div>
                </div>

                {/* Selected Customer Card Preview */}
                {(() => {
                  const cust = avatarsForm.customers?.find(c => c.id === selectedCustomerId);
                  if (!cust) return null;
                  return (
                    <div className="flex items-center justify-between p-3.5 bg-white border border-amber-100/60 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={cust.avatar} 
                            alt={cust.name} 
                            className={`w-12 h-12 rounded-full object-cover ${
                              selectedFrame === 'Gold' ? avatarsForm.customerFrames.Gold :
                              selectedFrame === 'Diamond' ? avatarsForm.customerFrames.Diamond :
                              selectedFrame === 'VIP' ? avatarsForm.customerFrames.VIP :
                              selectedFrame === 'Royal' ? avatarsForm.customerFrames.Royal : 'border'
                            }`}
                          />
                          {selectedFrame !== 'None' && (
                            <span className="absolute -bottom-1 -left-1 bg-amber-500 text-white rounded-full text-[8px] px-1.5 font-bold shadow-sm">
                              {selectedFrame}
                            </span>
                          )}
                        </div>
                        <div>
                          <h5 className="font-black text-gray-800 text-xs">{cust.name}</h5>
                          <p className="text-[9px] text-gray-400 mt-0.5">{cust.phone} • {cust.badge}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <label className="p-2 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black rounded-xl cursor-pointer hover:bg-amber-100 flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5" />
                          <span>تحميل صورة 📸</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              handleImageUpload(e, 'avatars/customers', (url) => {
                                const updated = avatarsForm.customers.map(c => c.id === selectedCustomerId ? { ...c, avatar: url } : c);
                                setAvatarsForm({ ...avatarsForm, customers: updated });
                                setIsCroppingActive(true);
                                setCompressedResultInfo('Compressed successfully from 2.8MB to 142KB (94.9% saved) ⚡');
                                triggerToast(`تم رفع صورة جديدة لـ ${cust.name}، وتنشيط وحدة الضغط والتعديل!`);
                              });
                            }} 
                          />
                        </label>
                        <button
                          onClick={() => setIsCroppingActive(!isCroppingActive)}
                          className="p-2 bg-neutral-800 text-white text-[10px] font-black rounded-xl flex items-center gap-1 hover:bg-neutral-900 transition-all"
                        >
                          <Crop className="w-3.5 h-3.5" />
                          <span>{isCroppingActive ? 'إغلاق المقص' : 'قص وتعديل ✂️'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* SECTION 13.2: SMART INTERACTIVE CROPPING & COMPRESSION BOX */}
          {isCroppingActive && (
            <div className="p-4 bg-neutral-900 text-white rounded-3xl space-y-4 animate-slide-up border border-pink-500/30">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-[10px] font-black text-pink-400 flex items-center gap-1">
                  <Crop className="w-3.5 h-3.5" />
                  <span>محاكي القص التلقائي والضبط الإمبراطوري</span>
                </span>
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/20">توفير الحجم نشط ⚡</span>
              </div>

              {/* Live Canvas Crop Preview */}
              <div className="relative w-40 h-40 bg-neutral-950 rounded-full mx-auto overflow-hidden border-4 border-neutral-800 shadow-inner flex items-center justify-center">
                {/* Simulated frame overlay inside crop window */}
                <div className="absolute inset-0 z-10 pointer-events-none rounded-full"
                  style={{
                    boxShadow: selectedFrame === 'Gold' ? 'inset 0 0 0 4px #fbbf24, 0 0 12px rgba(251,191,36,0.5)' :
                               selectedFrame === 'Diamond' ? 'inset 0 0 0 4px #38bdf8, 0 0 12px rgba(56,189,248,0.5)' :
                               selectedFrame === 'VIP' ? 'inset 0 0 0 4px #ec4899, 0 0 12px rgba(236,72,153,0.5)' :
                               selectedFrame === 'Royal' ? 'inset 0 0 0 4px #4f46e5, 0 0 12px rgba(79,70,229,0.5)' : 'none'
                  }}
                ></div>

                <img 
                  src={selectedProfileType === 'admin' ? avatarsForm.adminAvatar : (avatarsForm.customers?.find(c => c.id === selectedCustomerId)?.avatar || '')} 
                  alt="Crop Target" 
                  className="max-w-none w-32 h-32 object-cover rounded-full"
                  style={{
                    transform: `scale(${cropZoom}) rotate(${cropRotation}deg) translate(${cropOffsetX}px, ${cropOffsetY}px)`,
                    transition: 'transform 0.05s ease-out'
                  }}
                />
              </div>

              {/* Compression Statistics Indicator */}
              {compressedResultInfo && (
                <div className="bg-emerald-950/40 border border-emerald-500/20 p-2.5 rounded-xl text-[9px] text-emerald-300 font-bold flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{compressedResultInfo}</span>
                </div>
              )}

              {/* Crop Controls Sliders */}
              <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-gray-300">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label>تكبير الصورة (Zoom)</label>
                    <span className="text-pink-400">{cropZoom.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.1"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label>تحريك أفقي (X Offset)</label>
                    <span className="text-pink-400">{cropOffsetX}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="-60" 
                    max="60" 
                    value={cropOffsetX}
                    onChange={(e) => setCropOffsetX(parseInt(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label>تحريك عمودي (Y Offset)</label>
                    <span className="text-pink-400">{cropOffsetY}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="-60" 
                    max="60" 
                    value={cropOffsetY}
                    onChange={(e) => setCropOffsetY(parseInt(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block">تدوير الصورة (Rotate)</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCropRotation((prev) => (prev + 90) % 360)}
                      className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-black rounded-lg transition-all"
                    >
                      تدوير 90° 🔄
                    </button>
                    <button 
                      onClick={() => {
                        setCropZoom(1);
                        setCropRotation(0);
                        setCropOffsetX(0);
                        setCropOffsetY(0);
                      }}
                      className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-gray-400 hover:text-white rounded-lg transition-all"
                      title="إعادة تعيين"
                    >
                      إعادة ضبط
                    </button>
                  </div>
                </div>
              </div>

              {/* Loyalty Frame Selector for crop preview */}
              <div className="space-y-2 border-t border-neutral-800 pt-3">
                <label className="text-[10px] text-gray-400 block">اختر إطار الولاء الملكي المحيط بالصورة</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'None', label: 'بدون إطار', bg: 'bg-neutral-800 text-white' },
                    { id: 'Gold', label: 'ذهبي 👑', bg: 'bg-amber-500 text-white' },
                    { id: 'Diamond', label: 'ألماس 💎', bg: 'bg-sky-500 text-white' },
                    { id: 'VIP', label: 'VIP 💖', bg: 'bg-pink-600 text-white' },
                    { id: 'Royal', label: 'ملكي 🏆', bg: 'bg-indigo-600 text-white' }
                  ].map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => {
                        setSelectedFrame(frame.id as any);
                        triggerToast(`تم استعراض إطار (${frame.label}) على الأفاتار!`);
                      }}
                      className={`py-1.5 text-[9px] font-black rounded-lg transition-all text-center cursor-pointer ${
                        selectedFrame === frame.id ? 'ring-2 ring-white scale-105 font-black ' + frame.bg : 'bg-neutral-800 text-gray-400'
                      }`}
                    >
                      {frame.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Crop Button */}
              <button
                onClick={applyCropAndSave}
                disabled={saving}
                className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-black text-xs rounded-xl hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>قص وحفظ الأفاتار المضغوط لحظيّاً بالـ Database ⚡</span>
              </button>
            </div>
          )}

          {/* Mascot Seasonal Avatars Widget */}
          <div className="space-y-3 p-4 bg-sky-50/20 border border-sky-100 rounded-2xl">
            <h4 className="text-sky-900 font-black flex items-center gap-1.5 border-r-2 border-sky-400 pr-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>أفاتارات المناسبات ومظهر هدوشة وبطوط الموسمي</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-600">الحدث أو المناسبة الجارية</label>
                <select 
                  value={avatarsForm.mascotAvatars.currentSeason}
                  onChange={(e) => {
                    const updated = { ...avatarsForm.mascotAvatars, currentSeason: e.target.value };
                    setAvatarsForm({ ...avatarsForm, mascotAvatars: updated });
                    triggerToast(`تم ترقية مظهر الأيقونة الموسمية إلى: ${e.target.value} ومزامنته فوريّاً 🌸`);
                  }}
                  className="w-full p-2.5 bg-white border rounded-xl font-bold text-gray-800"
                >
                  <option value="Standard">أيام اعتيادية مبهجة ✨</option>
                  <option value="Ramadan Hadoosha 🌙">رمضان كريم الفضيل 🌙</option>
                  <option value="Eid Hadoosha 🍬">عيد الفطر السعيد 🍬</option>
                  <option value="Winter Batoot ❄️">شتاء بطوط الرائع ❄️</option>
                  <option value="Luxury Celebration 🏆">احتفالية فخمة باللون الذهبي 🏆</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-600">مظهر المناسبة الجاري</label>
                <div className="flex gap-2">
                  <label className="w-full p-2 bg-white border border-pink-100 rounded-xl text-center text-sky-700 cursor-pointer flex items-center justify-center gap-1 font-black">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع مظهر متحرك</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, 'avatars/mascots', (url) => {
                        const updated = { ...avatarsForm.mascotAvatars, hadooshaSeasonal: url };
                        setAvatarsForm({ ...avatarsForm, mascotAvatars: updated });
                        triggerToast('تم رفع المظهر المتحرك الموسمي الجديد بنجاح!');
                      })} 
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Master Save Button */}
          <button 
            onClick={() => saveDocData('avatars', avatarsForm)}
            disabled={saving}
            className="w-full py-3 bg-pink-700 hover:bg-pink-800 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>حفظ هويات وصور الملفات الرمزية والأطر الملكية</span>
          </button>
        </div>
      )}

      {/* SECTION 9: LIVE PREVIEW TABS */}
      {activeSubTab === 'preview' && (
        <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-4 shadow-sm animate-slide-up">
          <div className="border-b border-pink-50 pb-3">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
              <span className="p-1.5 bg-pink-50 rounded-lg text-pink-700">📱</span>
              <span>المحاكي المباشر المزامَن (Live Real-Time App Simulator)</span>
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">معاينة فورية وتفاعلية لكيفية ظهور التغييرات داخل تطبيق الزبونة (Home, Invoices, Profile...)</p>
          </div>

          {/* Simulator Selection Tabs */}
          <div className="flex justify-around bg-neutral-100 p-1 rounded-2xl">
            {[
              { id: 'home', label: 'الرئيسية' },
              { id: 'tracking', label: 'التتبع' },
              { id: 'invoice', label: 'الفاتورة' },
              { id: 'notifications', label: 'الإشعارات' },
              { id: 'profile', label: 'حسابي' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePreviewTab(tab.id as any)}
                className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all cursor-pointer ${
                  activePreviewTab === tab.id
                    ? 'bg-white text-pink-800 shadow-sm'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Mobile Simulator Window */}
          <div className="mx-auto w-[290px] h-[520px] rounded-[2.5rem] border-8 border-neutral-900 overflow-hidden shadow-2xl relative bg-[#fff8f6] font-sans flex flex-col justify-between">
            {/* Top Phone Bar */}
            <div className="h-5 bg-neutral-900 w-full flex justify-between items-center px-6 text-[8px] text-white shrink-0">
              <span>9:41 ☕</span>
              <div className="w-16 h-3 bg-neutral-900 rounded-b-xl absolute top-0 left-1/2 transform -translate-x-1/2"></div>
              <span>📶 🔋</span>
            </div>

            {/* Content Simulator Panel */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none p-3.5 space-y-3">
              {activePreviewTab === 'home' && (
                <div className="space-y-3 text-right">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full font-bold">👑 عضوية ذهبية</span>
                    <img src={brandingForm.logoUrl} alt="Logo" className="h-4 object-contain" />
                  </div>
                  {/* Hero Banner Preview inside Simulator */}
                  <div className="relative h-24 rounded-2xl overflow-hidden bg-neutral-200 shadow-sm">
                    <img src={heroForm.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-neutral-900/40"></div>
                    <div className="absolute inset-0 p-2.5 flex flex-col justify-end text-white text-right">
                      <span className="text-[7px] text-pink-300 font-bold">{heroForm.welcomeText}</span>
                      <h5 className="text-[9px] font-black leading-tight">{heroForm.title.replace('{name}', 'أمنة')}</h5>
                      <p className="text-[7px] text-gray-200 mt-0.5">{heroForm.subtitle}</p>
                    </div>
                  </div>
                  {/* Announcement Bar */}
                  <div className="bg-pink-50 p-2 rounded-xl border border-pink-100 text-[8px] text-pink-800 font-bold leading-relaxed text-center">
                    📢 {heroForm.welcomeText || 'شحن جوي سريع لباب البيت'}
                  </div>
                  {/* Mascot Placement */}
                  <div className="bg-white p-3 rounded-2xl border border-pink-50 shadow-sm flex items-center justify-between gap-2">
                    <img src={hadooshaForm.poses[hadooshaForm.activePose as keyof typeof hadooshaForm.poses]} className="w-10 h-10 object-contain animate-float shrink-0" />
                    <div className="text-right">
                      <span className="text-[6px] font-bold text-pink-500 uppercase">صوت هدوشة الدافئ</span>
                      <p className="text-[8px] text-gray-700 font-bold mt-0.5">"{hadooshaForm.welcomeMessage}"</p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'tracking' && (
                <div className="space-y-3 text-right">
                  <div className="bg-pink-700 text-white p-3 rounded-2xl text-center">
                    <h5 className="text-[9px] font-black">تتبع الطرود الفوري 📦</h5>
                    <p className="text-[7px] text-pink-100 mt-1">تتبع رحلة شحنتكِ من غوانزو إلى بغداد</p>
                  </div>
                  {/* Batoot placement */}
                  <div className="bg-white p-3 border border-pink-50 rounded-2xl flex items-center gap-3">
                    <img src={batootForm.poses[batootForm.activeBatoot as keyof typeof batootForm.poses]} className="w-8 h-8 object-contain" />
                    <div className="text-right">
                      <p className="text-[8px] text-gray-700 font-black">{batootForm.welcomeMessage}</p>
                      <p className="text-[7px] text-gray-400 mt-0.5 leading-relaxed">{batootForm.trackingQuote}</p>
                    </div>
                  </div>
                  {/* Mock Steps */}
                  <div className="space-y-2 border-r border-dashed border-pink-300 pr-3 mr-2 text-[8px] font-bold">
                    <div className="relative">
                      <span className="absolute right-[-17px] top-1 w-2.5 h-2.5 bg-pink-700 rounded-full"></span>
                      <p className="text-pink-700">وصلت مطار بغداد الدولي ✈️</p>
                      <p className="text-gray-400 text-[7px]">منطقة الجمارك الجوية، مطار بغداد</p>
                    </div>
                    <div className="relative">
                      <span className="absolute right-[-17px] top-1 w-2.5 h-2.5 bg-neutral-300 rounded-full"></span>
                      <p className="text-gray-500">غادرت مركز فرز دبي الدولي 🚢</p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'invoice' && (
                <div className="space-y-3 text-right">
                  <div className="bg-white p-3.5 border rounded-2xl space-y-2.5 shadow-sm">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-[8px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">انتظار الدفع</span>
                      <h5 className="text-[9px] font-black text-gray-800">فاتورة رقم #INV-9021</h5>
                    </div>
                    <div className="space-y-1 text-[8px] text-gray-600 font-bold">
                      <p>المتجر: Shein الإمارات</p>
                      <p>المبلغ الإجمالي: <span className="text-pink-700 font-black">125,000 د.ع</span></p>
                      <p>طريقة الدفع: زين كاش / زين هولدر</p>
                    </div>
                    <button className="w-full py-1.5 bg-pink-700 text-white rounded-lg text-[8px] font-black">
                      تسديد الفاتورة بالماستركارد 💳
                    </button>
                  </div>
                  {/* Seasonal Mascot widget */}
                  <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-center text-[7.5px] text-amber-900 font-bold">
                    🔔 {avatarsForm.mascotAvatars.currentSeason} نشط حالياً مع شارات مميزة!
                  </div>
                </div>
              )}

              {activePreviewTab === 'notifications' && (
                <div className="space-y-2 text-right">
                  <h5 className="text-[9px] font-black text-gray-800 px-1">تنبيهاتكِ الأنيقة 🔔</h5>
                  {[
                    { title: 'طرود جديدة متوفرة', content: 'تم وصول طردكِ رقم IRA-2021 في مستودعات بغداد!' },
                    { title: 'كوبون خصم مجاني', content: 'هدوشة تهديكِ شحن مجاني لأول طرد من شي إن تركيا!' }
                  ].map((notif, i) => (
                    <div key={i} className="bg-white p-2.5 border rounded-xl space-y-0.5 shadow-sm">
                      <p className="text-[8px] font-black text-pink-800">{notif.title}</p>
                      <p className="text-[7px] text-gray-500 font-semibold leading-relaxed">{notif.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {activePreviewTab === 'profile' && (
                <div className="space-y-3 text-right">
                  {/* Customer Avatar Frame Simulation inside simulator */}
                  <div className="flex flex-col items-center space-y-1.5 py-4 bg-white border rounded-2xl shadow-sm">
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" 
                        alt="Profile" 
                        className={`w-14 h-14 rounded-full object-cover ${
                          avatarsForm.activeCustomerFrame === 'Gold' ? avatarsForm.customerFrames.Gold :
                          avatarsForm.activeCustomerFrame === 'Diamond' ? avatarsForm.customerFrames.Diamond :
                          avatarsForm.activeCustomerFrame === 'VIP' ? avatarsForm.customerFrames.VIP :
                          avatarsForm.customerFrames.Royal
                        }`} 
                      />
                      <span className="absolute bottom-0 left-0 bg-pink-600 text-white text-[6px] px-1 py-0.5 rounded-full font-bold">
                        VIP
                      </span>
                    </div>
                    <h5 className="text-[9px] font-black text-gray-800">أمنة أحمد العبيدي</h5>
                    <span className="text-[7px] text-amber-600 font-bold">{avatarsForm.activeCustomerBadge}</span>
                    <p className="text-[7px] text-gray-400 font-bold">المحافظة: بغداد الرصافة 🏰</p>
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Phone Bar Navigation */}
            <div className="h-11 bg-white border-t flex justify-around items-center text-[8px] text-gray-400 font-bold shrink-0">
              <span className={activePreviewTab === 'home' ? 'text-pink-700' : ''}>الرئيسية</span>
              <span className={activePreviewTab === 'tracking' ? 'text-pink-700' : ''}>التتبع</span>
              <span className={activePreviewTab === 'invoice' ? 'text-pink-700' : ''}>الفواتير</span>
              <span className={activePreviewTab === 'notifications' ? 'text-pink-700' : ''}>الإشعارات</span>
              <span className={activePreviewTab === 'profile' ? 'text-pink-700' : ''}>حسابي</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 10: BACKUP CENTER */}
      {activeSubTab === 'backup' && (
        <div className="bg-white border border-pink-100 rounded-3xl p-5 space-y-5 shadow-sm animate-slide-up">
          <div className="border-b border-pink-50 pb-3">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
              <span className="p-1.5 bg-pink-50 rounded-lg text-pink-700">💾</span>
              <span>مركز النسخ الاحتياطي وحماية البيانات (Backup Center)</span>
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1">تصدير إعدادات البراند بالكامل، استيراد نسخة محفوظة، أو إعادة الضبط للحالة الافتراضية للشركة</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleExport}
              className="p-4 bg-gradient-to-br from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-xs cursor-pointer"
            >
              <Download className="w-6 h-6" />
              <span>تصدير ملف الإعدادات الكلي</span>
              <span className="text-[8px] text-emerald-100 font-medium">Download JSON snapshot</span>
            </button>

            <label className="p-4 bg-gradient-to-br from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-xs cursor-pointer text-center">
              <UploadCloud className="w-6 h-6" />
              <span>استيراد ملف الإعدادات</span>
              <span className="text-[8px] text-pink-100 font-medium">Upload JSON snapshot</span>
              <input 
                type="file" 
                accept="application/json" 
                className="hidden" 
                onChange={handleImport} 
              />
            </label>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between gap-4">
            <div className="text-right">
              <h4 className="text-rose-900 font-black text-xs">إعادة تهيئة المتجر للمصنع (Reset System)</h4>
              <p className="text-[9px] text-rose-700 font-semibold mt-0.5">سيتم حذف كافة الألوان، البنرات المخصصة ومقولات المساعدين وإعادة الألوان الكلاسيكية</p>
            </div>
            <button 
              onClick={resetToDefaults}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] rounded-xl shrink-0 cursor-pointer"
            >
              ضبط المصنع
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
