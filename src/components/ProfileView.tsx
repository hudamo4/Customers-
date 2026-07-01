import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_AVATAR } from '../utils/avatar';
import { User, Phone, MapPin, Edit, Check, Star, Gift, ChevronLeft, LogOut, Camera, Shield, Wallet, Bell, AlertCircle, ShoppingBag, Globe, X, CreditCard, Lock, ShieldCheck, HelpCircle, ArrowLeft, CheckCircle, Database, Loader2, Upload, Award, Share2, Ticket, Link, Compass } from 'lucide-react';
import { runFirestoreDiagnosticTest, DiagnosticResult, db, uploadFileToStorage } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import FacialAnalysis from './features/FacialAnalysis';
import { triggerLightHaptic } from '../utils/haptics';

const AVAILABLE_STORES = [
  {
    name: 'Shein الامارات',
    enName: 'SHEIN UAE',
    category: 'أزياء وموضة (الإمارات)',
    rate: '12,000 د.ع / كغم',
    duration: '7 - 10 أيام شحن جوي سريع',
    description: 'تسوقي أحدث صيحات الموضة من شي إن بأسعار شحن مميزة وتوصيل سريع عبر مستودعنا في دبي.',
    color: 'text-black bg-gray-100 border-black/10'
  },
  {
    name: 'Shein الكويت',
    enName: 'SHEIN Kuwait',
    category: 'أزياء وموضة (الكويت)',
    rate: '5,000 د.ع / كغم',
    duration: '7 - 10 أيام شحن جوي سريع',
    description: 'تسوقي أحدث صيحات الموضة من شي إن بأسعار شحن مذهلة وتوصيل سريع عبر مستودعنا المتميز في الكويت.',
    color: 'text-black bg-gray-100 border-black/10'
  },
  {
    name: 'Aliexpress',
    enName: 'AliExpress',
    category: 'تسوق عام ومتنوع',
    rate: '12,500 د.ع / كغم',
    duration: '10 - 15 يوم',
    description: 'الملايين من المنتجات الفريدة وأسعار المصنع من الصين مباشرة إلى العراق مع شحن جوي آمن ومضمون.',
    color: 'text-orange-600 bg-orange-50 border-orange-100'
  },
  {
    name: 'Temu',
    enName: 'Temu',
    category: 'منوعات وإلكترونيات',
    rate: '13,000 د.ع / كغم',
    duration: '8 - 12 يوم شحن جوي',
    description: 'تسوقي بذكاء ووفرة من تيمو مع تجميع فوري للطرود وشحن جوي سريع وآمن.',
    color: 'text-orange-500 bg-amber-50 border-orange-100'
  },
  {
    name: 'Taobao',
    enName: 'Taobao',
    category: 'المنصة الصينية الكبرى',
    rate: '16,500 د.ع / كغم',
    duration: '12 - 18 يوم',
    description: 'تسوقي من أكبر المتاجر الصينية للملابس والمنتجات المنزلية بأسعارها الحقيقية مع شحن وزن حقيقي.',
    color: 'text-red-600 bg-red-50 border-red-100'
  },
  {
    name: '1688',
    enName: '1688',
    category: 'الجملة الصينية للتاجر والأنيقة',
    rate: '16,500 د.ع / كغم',
    duration: '14 - 20 يوم شحن',
    description: 'تسوق الجملة المباشر من المصانع الصينية بأسعار خيالية. مثالي للمشاريع النسائية والطلبات الكبيرة.',
    color: 'text-red-500 bg-orange-50 border-orange-100'
  },
  {
    name: 'Iherb',
    enName: 'iHerb',
    category: 'صحة وعناية ومكملات',
    rate: '15,000 د.ع / كغم',
    duration: '6 - 9 أيام شحن جوي سريع',
    description: 'المكملات الغذائية، الفيتامينات، ومستحضرات العناية الطبيعية الموثوقة والمخزنة بعناية مباشرة إلى العراق.',
    color: 'text-green-600 bg-green-50 border-green-100'
  },
  {
    name: 'سيفورا',
    enName: 'Sephora',
    category: 'مكياج وعطور عالمية',
    rate: '16,000 د.ع / كغم',
    duration: '7 - 10 أيام شحن جوي',
    description: 'الماركات والمستحضرات الأصلية الفاخرة من سيفورا العالمية للتجميل لضمان الجودة والأصالة بنسبة 100%.',
    color: 'text-pink-600 bg-pink-50 border-pink-100'
  },
  {
    name: 'بوتيكات',
    enName: 'Boutiqaat',
    category: 'تجميل ومكياج الخليج',
    rate: '13,500 د.ع / كغم',
    duration: '5 - 8 أيام شحن سريع',
    description: 'أكبر متجر تجميل وعطور في الكويت والخليج العربي. تسوقي اختيارات المشاهير لتصلكِ لباب البيت في العراق.',
    color: 'text-purple-600 bg-purple-50 border-purple-100'
  },
  {
    name: 'تريندول تركيا والكويت',
    enName: 'Trendyol Turkey & Kuwait',
    category: 'أزياء وماركات تركية',
    rate: '11,000 د.ع / كغم',
    duration: '8 - 12 يوم جوي',
    description: 'أرقى الماركات التركية والملابس الأنيقة من تريندول مباشرة من مستودعات تركيا والكويت للعراق.',
    color: 'text-amber-600 bg-amber-50 border-amber-100'
  },
  {
    name: 'Yesstyle',
    enName: 'YesStyle',
    category: 'موضة وجمال كوري ياباني',
    rate: '15,500 د.ع / كغم',
    duration: '9 - 14 يوم شحن جوي',
    description: 'أفضل منتجات الجمال الكورية واليابانية ومنتجات العناية الفائقة من أشهر الماركات الآسيوية.',
    color: 'text-teal-600 bg-teal-50 border-teal-100'
  },
  {
    name: 'K-secret',
    enName: 'K-Secret',
    category: 'أسرار العناية الكورية الأصلية',
    rate: '15,500 د.ع / كغم',
    duration: '7 - 11 يوم شحن سريع',
    description: 'منتجات العناية بالبشرة الكورية الأكثر شهرة وتأثيراً للتفتيح والنضارة الفائقة مباشرة من كوريا.',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
  }
];

export default function ProfileView() {
  const { profile, shipments, updateProfile, redeemPoints, setActiveTab, customizations, updateAvatar, setAppMode, logout, user, updateNotificationPreferences } = useApp();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showNotificationSettingsModal, setShowNotificationSettingsModal] = useState<boolean>(false);

  const currentPrefs = profile?.notificationPreferences || {
    shipment: true,
    invoice: true,
    loyalty: true,
    promotion: true,
    announcement: true,
    support: true
  };

  const handleTogglePref = async (key: string) => {
    triggerLightHaptic();
    const newPrefs = {
      ...currentPrefs,
      [key]: currentPrefs[key as keyof typeof currentPrefs] === false ? true : false
    };
    await updateNotificationPreferences(newPrefs);
  };

  const [name, setName] = useState<string>(profile?.name || '');
  const [phone, setPhone] = useState<string>(profile?.phone || '');
  const [city, setCity] = useState<string>(profile?.city || '');
  const [redemptionSuccess, setRedemptionSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [showAvailableSites, setShowAvailableSites] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hidden Manager Portal states
  const [avatarClicks, setAvatarClicks] = useState<number>(0);
  const [showPasscodeModal, setShowPasscodeModal] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<boolean>(false);
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>('');

  // New modal for editing profile with camera capture
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Database connection diagnostic states
  const [showDiagnosticModal, setShowDiagnosticModal] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [isTestingDatabase, setIsTestingDatabase] = useState<boolean>(false);

  const handleRunDiagnostics = async () => {
    setIsTestingDatabase(true);
    setDiagnosticResult(null);
    setShowDiagnosticModal(true);
    try {
      const res = await runFirestoreDiagnosticTest();
      setDiagnosticResult(res);
    } catch (e) {
      console.error("Diagnostic error caught:", e);
    } finally {
      setIsTestingDatabase(false);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: 'user' }
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn("Video play error:", e));
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("لم نتمكن من تشغيل الكاميرا. يرجى السماح بالوصول للكاميرا في المتصفح أو المحاولة بمتصفح آخر.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setEditAvatarUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const closeEditProfileModal = () => {
    stopCamera();
    setShowEditProfileModal(false);
  };

  const handleSaveEditProfile = async () => {
    setSaving(true);
    if (profile) {
      await updateProfile(editName, profile.phone, profile.city);
    }
    if (editAvatarUrl) {
      await updateAvatar(editAvatarUrl);
    }
    setSaving(false);
    closeEditProfileModal();
  };

  // Wallet & Mastercard payment options states
  const [showPaymentMethods, setShowPaymentMethods] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<'mastercard' | 'zain_cash' | 'asiadhawala' | 'cod'>('mastercard');
  const walletBalance = profile?.walletBalance ?? 250000;
  
  const [savedCardNumber, setSavedCardNumber] = useState<string>(() => {
    return profile?.savedCardNumber || '5412 7500 1234 5678';
  });
  const [savedCardHolder, setSavedCardHolder] = useState<string>(() => {
    return profile?.savedCardHolder || (profile?.name || 'Huda Al-Sultani').toUpperCase();
  });
  const [savedExpiry, setSavedExpiry] = useState<string>(() => {
    return profile?.savedCardExpiry || '12/28';
  });
  const [savedCvv, setSavedCvv] = useState<string>('345');
  const [isSavingCard, setIsSavingCard] = useState<boolean>(false);
  const [saveCardSuccess, setSaveCardSuccess] = useState<boolean>(false);
  
  // Wallet topup states
  const [topupAmount, setTopupAmount] = useState<string>('25000');
  const [isToppingUp, setIsToppingUp] = useState<boolean>(false);
  const [topupSuccess, setTopupSuccess] = useState<boolean>(false);

  // Luminous Heritage Premium states
  const [showVipModal, setShowVipModal] = useState<boolean>(false);
  const [showSpinWheelModal, setShowSpinWheelModal] = useState<boolean>(false);
  const [showReferralModal, setShowReferralModal] = useState<boolean>(false);
  const [showTicketsModal, setShowTicketsModal] = useState<boolean>(false);
  const [showPublicTrackingModal, setShowPublicTrackingModal] = useState<boolean>(false);
  const [showFacialAnalysisModal, setShowFacialAnalysisModal] = useState<boolean>(false);

  React.useEffect(() => {
    if (profile) {
      if (profile.savedCardNumber) setSavedCardNumber(profile.savedCardNumber);
      if (profile.savedCardHolder) setSavedCardHolder(profile.savedCardHolder);
      if (profile.savedCardExpiry) setSavedExpiry(profile.savedCardExpiry);
    }
  }, [profile]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setSavedCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setSavedExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setSavedExpiry(value);
    }
  };

  const handleSaveCardInfo = async () => {
    setIsSavingCard(true);
    if (profile) {
      await updateProfile(
        profile.name,
        profile.phone,
        profile.city,
        profile.walletBalance,
        savedCardNumber,
        savedCardHolder,
        savedExpiry
      );
    }
    setIsSavingCard(false);
    setSaveCardSuccess(true);
    setTimeout(() => setSaveCardSuccess(false), 3000);
  };

  const handleTopupWallet = async () => {
    if (!topupAmount || parseInt(topupAmount) <= 0) return;
    setIsToppingUp(true);
    const newBalance = walletBalance + parseInt(topupAmount);
    if (profile) {
      await updateProfile(
        profile.name,
        profile.phone,
        profile.city,
        newBalance,
        profile.savedCardNumber,
        profile.savedCardHolder,
        profile.savedCardExpiry
      );
    }
    setIsToppingUp(false);
    setTopupSuccess(true);
    setTimeout(() => setTopupSuccess(false), 3000);
  };

  // Initialize form when editing opens
  const handleEditClick = () => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setCity(profile.city);
    }
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(name, phone, city);
    setSaving(false);
    setIsEditing(false);
  };

  const handleRedeem = async () => {
    if (!profile || profile.points < 500) {
      alert("عذراً، يجب أن يكون لديكِ 500 نقطة كحد أدنى للاستبدال.");
      return;
    }

    const couponCode = `IRAMO-${Math.floor(100000 + Math.random() * 900000)}`;
    await redeemPoints(500);
    setRedemptionSuccess(`تم استبدال 500 نقطة بنجاح! كود الخصم المتاح لكِ الآن بقيمة 15,000 د.ع هو: ${couponCode}`);
    setTimeout(() => setRedemptionSuccess(null), 10000);
  };

  const latestShipment = shipments[0] || null;

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="profile-view">
      {/* Profile Header Block */}
      <section className="flex flex-col items-center text-center py-4">
        <div className="relative mb-4">
          <div 
            onClick={() => {
              const clicks = avatarClicks + 1;
              setAvatarClicks(clicks);
              if (clicks >= 5) {
                setAvatarClicks(0);
                setShowPasscodeModal(true);
              }
            }}
            title="إعدادات النظام"
            className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-tr from-pink-700 to-pink-200 shadow-xl relative cursor-pointer active:scale-95 transition-transform select-none"
          >
            <div className="w-full h-full rounded-full overflow-hidden border-[6px] border-white ring-1 ring-pink-100 bg-white flex items-center justify-center">
              <img
                alt="Profile Avatar"
                className="w-full h-full object-cover"
                src={profile?.avatar || DEFAULT_AVATAR}
                referrerPolicy="no-referrer"
              />
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setEditName(profile?.name || '');
                setEditAvatarUrl(profile?.avatar || '');
                setShowEditProfileModal(true);
              }}
              className="absolute -bottom-1 -left-1 bg-pink-700 text-white p-2 rounded-full shadow-lg border-2 border-white cursor-pointer active:scale-90 transition-transform flex items-center gap-2 px-3">
              <Camera className="w-4.5 h-4.5" />
              <span className="text-[10px] font-bold">تعديل الملف</span>
            </button>
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-gray-800">{profile?.name || 'الزبونة الكريمة'}</h2>
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-pink-100 text-pink-800 rounded-full shadow-sm">
            <Star className="w-4 h-4 fill-pink-800 text-pink-800" />
            <span className="text-[11px] font-bold tracking-wide">{profile?.membership || 'عضوية ذهبية'}</span>
          </div>
          {/* Logout button */}
          <button
            onClick={() => {
              logout();
            }}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-100 border border-transparent rounded-full text-[10px] font-bold cursor-pointer transition-all active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </section>

      {/* Points Reward Card */}
      <section className="bg-gradient-to-br from-pink-700 to-pink-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-pink-100 text-xs font-semibold mb-1">رصيد النقاط الحالي</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black tracking-tight">{profile?.points?.toLocaleString() || 0}</h3>
              <span className="text-sm opacity-90">نقطة</span>
            </div>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 text-white shrink-0">
            <Gift className="w-8 h-8" />
          </div>
        </div>

        {/* Loyalty Milestone Progress Bar */}
        <div className="relative z-10 mt-4 text-right" dir="rtl">
          <div className="flex justify-between items-center text-[11px] font-black text-pink-100 mb-1.5">
            <span>التقدم نحو المكافأة التالية</span>
            <span dir="ltr">{(profile?.points || 0)} / {(Math.ceil(((profile?.points || 0) + 1) / 500) * 500 || 500)}</span>
          </div>
          <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div 
              style={{ width: `${Math.min(100, Math.max(0, (((profile?.points || 0) - (Math.ceil(((profile?.points || 0) + 1) / 500) * 500 - 500 || 0)) / 500) * 100))}%` }}
              className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
            ></div>
          </div>
          <p className="text-[10px] text-pink-100/90 font-bold mt-1.5">
            {(Math.ceil(((profile?.points || 0) + 1) / 500) * 500 || 500) - (profile?.points || 0) > 0 ? (
              <>أنتِ على بُعد <span className="underline font-black text-white">{(Math.ceil(((profile?.points || 0) + 1) / 500) * 500 || 500) - (profile?.points || 0)} نقطة</span> فقط من الحصول على مكافأتكِ التالية! ✨</>
            ) : (
              <>لقد حققتِ مكافأة جديدة! يمكنكِ استبدالها الآن 🥳</>
            )}
          </p>
        </div>

        {redemptionSuccess && (
          <div className="relative z-10 mt-4 p-4 bg-white text-pink-800 rounded-2xl text-xs font-bold shadow-md leading-relaxed flex items-start gap-2 border border-pink-100 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-pink-700 mt-0.5" />
            <div>{redemptionSuccess}</div>
          </div>
        )}

        <button
          onClick={handleRedeem}
          className="relative z-10 w-full py-4 mt-6 bg-white hover:bg-pink-50 text-pink-700 font-extrabold rounded-2xl active:scale-[0.98] transition-all shadow shadow-pink-800/10 text-xs"
        >
          استبدال النقاط المتاحة بكود خصم
        </button>
      </section>

      {/* Personal Info: Disney-esque Clean Forms */}
      <section className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800 text-base">المعلومات الشخصية</h3>
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="text-pink-700 hover:bg-pink-50 p-2 px-4 rounded-full transition-colors flex items-center justify-center border border-pink-50 gap-2"
            >
              <Edit className="w-4 h-4" />
              <span className="text-xs font-bold">تعديل البيانات</span>
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-green-700 hover:bg-green-50 p-2 px-4 rounded-full transition-colors flex items-center justify-center border border-green-50 gap-2"
            >
              {saving ? '...' : <><Check className="w-4 h-4" /> <span className="text-xs font-bold">حفظ</span></>}
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-right">
            <div>
              <label className="text-gray-400 text-xs block mb-1 font-semibold">الاسم الكامل</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-pink-100 rounded-xl text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1 font-semibold">رقم الهاتف</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                dir="ltr"
                className="w-full px-4 py-2.5 bg-gray-50 border border-pink-100 rounded-xl text-xs focus:outline-none focus:border-pink-500 text-right"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1 font-semibold">المحافظة</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-pink-100 rounded-xl text-xs focus:outline-none focus:border-pink-500 font-bold"
              >
                <option value="" disabled>اختر المحافظة...</option>
                {(customizations?.iraqRates || []).length > 0 ? (
                  customizations.iraqRates.map((item, index) => (
                    <option key={index} value={item.province}>{item.province}</option>
                  ))
                ) : (
                  <>
                    <option value="بغداد">بغداد</option>
                    <option value="بابل">بابل</option>
                    <option value="البصرة">البصرة</option>
                    <option value="نينوى">نينوى</option>
                    <option value="أربيل">أربيل</option>
                    <option value="النجف">النجف</option>
                    <option value="كربلاء">كربلاء</option>
                    <option value="ذي قار">ذي قار</option>
                  </>
                )}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-pink-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="group border-b border-pink-50 pb-3">
              <span className="text-gray-400 text-[11px] block font-semibold mb-1">الاسم الكامل</span>
              <p className="text-sm font-semibold text-gray-800">{profile?.name}</p>
            </div>
            <div className="group border-b border-pink-50 pb-3">
              <span className="text-gray-400 text-[11px] block font-semibold mb-1">رقم الهاتف</span>
              <p className="text-sm font-semibold text-gray-800" dir="ltr">
                {profile?.phone}
              </p>
            </div>
            <div className="group pb-1">
              <span className="text-gray-400 text-[11px] block font-semibold mb-1">المدينة</span>
              <p className="text-sm font-semibold text-gray-800">{profile?.city}</p>
            </div>
          </div>
        )}
      </section>

      {/* Recent Orders Section */}
      <section className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-gray-800 text-base">أحدث الطلبات النشطة</h3>
          <button onClick={() => setActiveTab('invoices')} className="text-pink-700 text-xs font-bold hover:underline">
            عرض الفواتير
          </button>
        </div>

        {latestShipment ? (
          <div
            onClick={() => setActiveTab('tracking')}
            className="bg-pink-50/30 rounded-2xl p-4 flex items-center gap-4 border border-pink-100/30 cursor-pointer hover:bg-pink-50/50 transition-all"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-pink-700 shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <h4 className="font-bold text-sm text-gray-800 truncate">طرد رقم {latestShipment.trackingNumber}</h4>
                <span className="bg-pink-100 text-pink-800 px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0">
                  {latestShipment.status}
                </span>
              </div>
              <p className="text-gray-400 text-[11px] font-medium">الخدمة: {latestShipment.service}</p>
            </div>
          </div>
        ) : (
          <p className="text-center py-4 text-xs text-gray-400 font-semibold">لا يوجد شحنات قيد التوصيل حالياً.</p>
        )}
      </section>

      {/* Settings & Menu Options: Clean List */}
      <section className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="divide-y divide-pink-50">
          <div 
            onClick={() => setShowAvailableSites(true)}
            className="flex items-center justify-between p-5 hover:bg-pink-50/20 cursor-pointer group transition-colors"
          >
            <div className="flex items-center gap-4">
              <Globe className="w-5 h-5 text-gray-500 group-hover:text-pink-700" />
              <span className="text-xs font-semibold text-gray-700">المواقع المتاحة للشحن</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-300 animate-pulse" />
          </div>
          <div 
            onClick={() => setShowPaymentMethods(true)}
            className="flex items-center justify-between p-5 hover:bg-pink-50/20 cursor-pointer group transition-colors"
          >
            <div className="flex items-center gap-4">
              <Wallet className="w-5 h-5 text-gray-500 group-hover:text-pink-700" />
              <span className="text-xs font-semibold text-gray-700">طرق الدفع ومحفظة إيرامو</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-300 animate-pulse" />
          </div>

          <div 
            onClick={() => setShowVipModal(true)}
            className="flex items-center justify-between p-5 hover:bg-pink-50/20 cursor-pointer group transition-colors animate-fade-in"
          >
            <div className="flex items-center gap-4">
              <Award className="w-5 h-5 text-pink-700 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-pink-800">العضوية الممتازة والامتيازات 👑</span>
            </div>
            <span className="text-[9px] bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-full">
              {profile?.membership || 'عضوية ذهبية'}
            </span>
          </div>

          <div 
            onClick={() => setShowSpinWheelModal(true)}
            className="flex items-center justify-between p-5 hover:bg-pink-50/20 cursor-pointer group transition-colors animate-fade-in"
          >
            <div className="flex items-center gap-4">
              <Compass className="w-5 h-5 text-rose-600 animate-spin-slow" />
              <span className="text-xs font-bold text-rose-800">عجلة الحظ والهدايا اليومية 🎡</span>
            </div>
            <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full animate-pulse">
              العبِ الآن! 🎁
            </span>
          </div>

          <div 
            onClick={() => { triggerLightHaptic(); setShowFacialAnalysisModal(true); }}
            className="flex items-center justify-between p-5 hover:bg-pink-50/20 cursor-pointer group transition-colors animate-fade-in"
          >
            <div className="flex items-center gap-4">
              <Camera className="w-5 h-5 text-amber-600 animate-pulse" />
              <span className="text-xs font-bold text-amber-900">التحليل الهندسي المباشر للوجه (جديد) 🧬✨</span>
            </div>
            <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
              نسبة Φ الذهبية
            </span>
          </div>

          <div 
            onClick={() => setShowReferralModal(true)}
            className="flex items-center justify-between p-5 hover:bg-pink-50/20 cursor-pointer group transition-colors animate-fade-in"
          >
            <div className="flex items-center gap-4">
              <Share2 className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-gray-700">دعوة صديقة وربح نقاط مجانية 👥</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </div>

          <div 
            onClick={() => setShowTicketsModal(true)}
            className="flex items-center justify-between p-5 hover:bg-pink-50/20 cursor-pointer group transition-colors animate-fade-in"
          >
            <div className="flex items-center gap-4">
              <Ticket className="w-5 h-5 text-emerald-600 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-semibold text-gray-700">تذاكر الدعم الفني واستفسارات هدى 🎫</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </div>

          <div 
            onClick={() => setShowPublicTrackingModal(true)}
            className="flex items-center justify-between p-5 hover:bg-pink-50/20 cursor-pointer group transition-colors animate-fade-in"
          >
            <div className="flex items-center gap-4">
              <Link className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-gray-700">إنشاء رابط التتبع العام للطرود 🔗</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </div>

          <div 
            onClick={() => { triggerLightHaptic(); setShowNotificationSettingsModal(true); }}
            className="flex items-center justify-between p-5 hover:bg-pink-50/20 cursor-pointer group transition-colors"
          >
            <div className="flex items-center gap-4">
              <Bell className="w-5 h-5 text-gray-500 group-hover:text-pink-700" />
              <span className="text-xs font-semibold text-gray-700">إعدادات التنبيهات المباشرة</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </div>
          <div 
            onClick={handleRunDiagnostics}
            className="flex items-center justify-between p-5 bg-pink-50/10 hover:bg-pink-50/30 cursor-pointer group transition-colors"
          >
            <div className="flex items-center gap-4">
              <Database className="w-5 h-5 text-pink-600 group-hover:text-pink-700 animate-pulse" />
              <span className="text-xs font-bold text-pink-700">فحص اتصال قاعدة البيانات (Firestore)</span>
            </div>
            <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-2.5 py-1 rounded-full group-hover:bg-pink-200 transition-colors">
              فحص الآن ⚡
            </span>
          </div>
        </div>
      </section>

      {/* Brand Touch: Footer Mascot Signature */}
      <section className="bg-white border border-pink-100/50 rounded-3xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 flex-shrink-0 bg-pink-50 rounded-3xl overflow-hidden p-2">
            <img
              alt="Hadoosha & Batoot"
              className="w-full h-full object-contain"
              src={customizations?.homeFooterMascotUrl || "https://lh3.googleusercontent.com/aida/AP1WRLs7xYMw1dlJILjhZ2VzHUgTES3bYmOtS532eeDn9JpDom3Gp-MaPoVhT_e495zabXi9PhvxGhgg_DGSwGWwf9dmXp5ZUWaJm0RCNd8GbCsm6Pfsr0iJJMO0aAxy5MOcRhILsJttChJdkmTm_mZbX5E5mSnfAvK48H_feUdzK0meAC_w_y8FpVIQyOMw7BefhhUleQ-yNPc9mOamo6Uhxfvs0PQtY8Tp68F3pQbyGpw3MPMMO_Rkhd2fSw"}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 space-y-1 text-right">
            <p className="text-pink-700 italic leading-relaxed text-xs font-semibold">
              {(customizations?.homeFooterMascotQuote || "عزيزتي {name}، جمالك يبدأ من اهتمامك بنفسك. نحن هنا دائماً لنوفر لكِ الأفضل في شحن وتسوق متميز!").replace("{name}", profile?.name || 'الأنيقة')}
            </p>
            <p className="font-bold text-pink-800 text-xs">— {customizations?.homeFooterMascotAuthor || 'هدوشة وبطوط'}</p>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-pink-100/20 rounded-full blur-2xl"></div>
      </section>
      
      {/* Available Sites Modal */}
      {showAvailableSites && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg h-[85vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-pink-100 animate-slide-up">
            {/* Header */}
            <div className="p-5 border-b border-pink-50 flex justify-between items-center bg-pink-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-700 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-800 text-sm">المواقع المتاحة للشحن</h3>
                  <p className="text-[10px] text-gray-400 font-bold">مواقع تسوق دولية مدعومة للشحن إلى العراق 🇮🇶</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAvailableSites(false);
                  setSearchQuery('');
                }}
                className="w-8 h-8 rounded-full bg-white border border-pink-100 flex items-center justify-center text-gray-500 hover:text-pink-700 hover:bg-pink-50 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Box */}
            <div className="p-4 border-b border-pink-50/50 bg-white">
              <input
                type="text"
                placeholder="ابحثي عن موقع تسوق... (مثال: Shein، سيفورا)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-pink-100/80 rounded-xl text-xs focus:outline-none focus:border-pink-500 text-right font-semibold"
              />
            </div>

            {/* Stores List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {(() => {
                const activeAvailableStores = (customizations?.supportedStores && customizations.supportedStores.length > 0)
                  ? customizations.supportedStores.map(st => ({
                      name: st.name,
                      enName: st.name,
                      category: 'أقسام إيرامو الرسمية 🛍️',
                      rate: st.rate,
                      duration: st.duration,
                      description: st.details
                    }))
                  : AVAILABLE_STORES;

                const filtered = activeAvailableStores.filter(store => 
                  store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  store.enName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  store.category.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <p className="text-xs text-gray-400 font-bold">عذراً، لم نجد نتائج لـ "{searchQuery}"</p>
                      <p className="text-[10px] text-gray-400 mt-1">تأكدي من كتابة الاسم بشكل صحيح أو تصفحي القائمة الكاملة.</p>
                    </div>
                  );
                }

                return filtered.map((store, idx) => (
                  <div 
                    key={idx}
                    className="bg-white border border-pink-100/40 rounded-2xl p-4.5 shadow-sm hover:shadow transition-shadow space-y-3 text-right"
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-pink-50 text-pink-700 mb-1">
                          {store.category}
                        </span>
                        <h4 className="font-extrabold text-sm text-gray-800">{store.name}</h4>
                        {store.enName && store.enName !== store.name && <p className="text-[10px] font-bold text-gray-400 tracking-wide text-left">{store.enName}</p>}
                      </div>
                      <div className="text-left">
                        <span className="inline-block px-3 py-1 rounded-lg text-[10px] font-black bg-pink-50 text-pink-800 border border-pink-100/30">
                          {store.rate}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                      {store.description}
                    </p>

                    <div className="pt-2 border-t border-pink-50/50 flex justify-between items-center text-[10px] text-gray-400">
                      <span className="flex items-center gap-1 font-bold text-pink-700 bg-pink-50/30 px-2 py-0.5 rounded-md">
                        ⏱️ مدة الوصول: {store.duration}
                      </span>
                      <span className="text-emerald-600 font-extrabold">● جاهز للشحن</span>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Sticky Footer Info */}
            <div className="p-4 border-t border-pink-50 bg-white text-center">
              <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                جميع أسعار الشحن خاضعة لوزن طردك الحقيقي دون أي تقريب أو رسوم مخفية 💖
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Payment Methods & Eramo Wallet Modal */}
      {showPaymentMethods && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-md h-[80vh] sm:h-[75vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-pink-100 animate-slide-up text-right" dir="rtl">
            
            {/* Header */}
            <div className="p-5 border-b border-pink-50 flex justify-between items-center bg-pink-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-700 shrink-0 shadow-sm">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-800 text-sm">محفظة إيرامو والبطاقة المعتمدة</h3>
                  <p className="text-[10px] text-gray-400 font-bold">رصيد محفظتكِ وبوابة دفع المديرة الرسمية</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentMethods(false)}
                className="w-8 h-8 rounded-full bg-white border border-pink-100 flex items-center justify-center text-gray-500 hover:text-pink-700 hover:bg-pink-50 transition-colors shadow-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Wallet Balance Card */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-pink-300 block mb-1">رصيد محفظة إيرامو الحالي</span>
                    <h3 className="text-2xl font-black tracking-tight">{walletBalance.toLocaleString()} د.ع</h3>
                  </div>
                  <span className="text-[9px] bg-white/10 px-2.5 py-1 rounded-xl text-white/90 font-black border border-white/10">نشطة وآمنة</span>
                </div>
              </div>

              {/* Authorized Manager's Card Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-pink-100/30">
                  <h4 className="font-extrabold text-xs text-gray-800 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-pink-700" /> بطاقة الماستركارد المعتمدة للمديرة
                  </h4>
                  <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">حساب رسمي معتمد</span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                  يتم سداد جميع الفواتير وعمليات التوصيل تلقائياً وفوراً عبر حساب بطاقة الماستركارد الرسمية المعتمدة والخاصة بمديرة المنصة <span className="text-pink-700 font-bold">هدى السلطاني</span>.
                </p>

                {/* High fidelity read-only Mastercard widget display */}
                <div className="relative w-full aspect-[1.586/1] rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-950 p-5 text-white shadow-xl overflow-hidden border border-white/10 select-none">
                  <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-pink-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute top-4 left-4 flex items-center gap-1.5">
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                      <div className="w-5 h-5 bg-amber-500 rounded-full mix-blend-screen"></div>
                    </div>
                  </div>
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-pink-300 block font-bold">إيرامو الممتازة - بطاقة الإدارة</span>
                      <div className="w-6 h-4 bg-white/20 rounded border border-white/20 flex items-center justify-center mt-1">
                        <div className="grid grid-cols-2 gap-0.5 w-3 h-2">
                          <div className="border border-white/20 rounded-sm"></div>
                          <div className="border border-white/20 rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center font-mono text-sm md:text-base tracking-widest font-black text-white drop-shadow">
                      5412 7500 1234 5678
                    </div>
                    <div className="flex justify-between items-end font-mono">
                      <div className="text-right space-y-0.5 max-w-[70%]">
                        <span className="text-[7px] text-white/40 block">Card Holder / اسم المديرة</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider truncate block">HUDA AL-SULTANI</span>
                      </div>
                      <div className="text-left space-y-0.5">
                        <span className="text-[7px] text-white/40 block">Expires / انتهاء</span>
                        <span className="text-[9px] font-bold tracking-wider">12/28</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-100/30 text-xs space-y-1.5 text-pink-950">
                  <p className="font-extrabold flex items-center gap-1">
                    🔒 حماية وخصوصية تامة للعميلات
                  </p>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-bold">
                    لقد تم إيقاف نظام إضافة وتخزين بطاقات العملاء لضمان أقصى حماية ممكنة لبياناتكنَّ؛ حيث نعتمد كلياً على بوابة بطاقة الإدارة الموحدة والآمنة لتسديد أي رسوم ومستحقات بشكل مركزي ومباشر.
                  </p>
                </div>
              </div>

            </div>

            {/* Footer Trust Info */}
            <div className="p-4 border-t border-pink-50 bg-white text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
              <p className="text-[10px] text-gray-400 font-bold">
                جميع المعاملات المالية مشفرة ومؤمنة بالكامل لحماية خصوصيتكِ 🔒
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Passcode Modal for Manager Portal Access */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl text-center space-y-4 border border-pink-100">
            <div className="w-12 h-12 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            
            <div>
              <h4 className="font-black text-gray-800 text-sm">بوابة المديرة هدى السلطاني 👑</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed font-bold">
                يرجى إدخال رمز المرور السري الخاص بكِ للولوج إلى لوحة إدارة متجر إيرامو والتحكم بالكامل.
              </p>
            </div>

            <div className="space-y-2">
              <input 
                type="password"
                placeholder="رمز المرور السري"
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  setPasscodeError(false);
                }}
                className={`w-full bg-gray-50 border ${passcodeError ? 'border-red-300 ring-1 ring-red-100' : 'border-pink-100'} text-center text-sm font-bold tracking-widest py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all`}
                autoFocus
              />
              {passcodeError && (
                <p className="text-[10px] text-red-600 font-bold animate-pulse">
                  ❌ رمز المرور غير صحيح!
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={async () => {
                  if (passcodeInput === '9988' || passcodeInput === 'huda44' || passcodeInput === 'huda2026') {
                    setAppMode('manager');
                    setShowPasscodeModal(false);
                    setPasscodeInput('');
                    if (user && profile) {
                      try {
                        const userDocRef = doc(db, 'users', user.uid);
                        await updateDoc(userDocRef, { role: 'admin' });
                        console.log("Successfully elevated user role to admin in Firestore!");
                      } catch (e) {
                        console.warn("Could not elevate user role to admin in DB:", e);
                      }
                    }
                  } else {
                    setPasscodeError(true);
                    setPasscodeInput('');
                  }
                }}
                className="flex-1 bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 text-white text-xs font-black py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                تأكيد الدخول
              </button>
              <button 
                onClick={() => {
                  setShowPasscodeModal(false);
                  setPasscodeInput('');
                  setPasscodeError(false);
                }}
                className="flex-1 bg-gray-100 text-gray-500 text-xs font-black py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Change Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl text-center space-y-4 border border-pink-100">
            <div className="w-12 h-12 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            
            <div>
              <h4 className="font-black text-gray-800 text-sm">تغيير الصورة الشخصية</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed font-bold">
                يرجى إدخال رابط الصورة أو اختيار أحد الرمزيات الأنيقة الجاهزة أدناه 💖
              </p>
            </div>

            {/* Ready Preset Avatars */}
            <div className="space-y-1.5 text-right">
              <span className="text-[10px] text-gray-400 font-bold block">رمزيات مقترحة سريعة:</span>
              <div className="grid grid-cols-4 gap-2 justify-center">
                {[
                  DEFAULT_AVATAR,
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
                  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120'
                ].map((avatarUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNewAvatarUrl(avatarUrl);
                    }}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer active:scale-95 ${newAvatarUrl === avatarUrl ? 'border-pink-700 ring-2 ring-pink-100 scale-105' : 'border-pink-100 hover:border-pink-300'}`}
                  >
                    <img src={avatarUrl} alt="Preset Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Direct File Upload */}
            <div className="space-y-1.5 text-right">
              <span className="text-[10px] text-gray-400 font-bold block">أو قومي برفع صورة مباشرة 📁:</span>
              <label className="w-full bg-pink-50 hover:bg-pink-100 text-pink-700 hover:text-pink-800 border border-pink-100 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>رفع صورة من جهازكِ</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewAvatarUrl('Uploading...');
                      try {
                        const url = await uploadFileToStorage(file, "profiles");
                        setNewAvatarUrl(url);
                      } catch (err) {
                        console.error("UploadThing upload failed:", err);
                        setNewAvatarUrl('');
                      }
                    }
                  }}
                />
              </label>
              {newAvatarUrl === 'Uploading...' && (
                <p className="text-[9.5px] text-pink-600 font-bold text-center animate-pulse">جاري رفع الصورة إلى UploadThing... 🚀</p>
              )}
              {newAvatarUrl && newAvatarUrl.startsWith('http') && (
                <p className="text-[9.5px] text-emerald-600 font-bold text-center">✓ تم رفع الصورة إلى UploadThing (اضغطي حفظ) ✨</p>
              )}
            </div>

            <div className="space-y-1 text-right">
              <span className="text-[10px] text-gray-400 font-bold block">أو أدخلي رابط صورتكِ الخاصة:</span>
              <input 
                type="text"
                placeholder="رابط الصورة (URL)"
                value={newAvatarUrl.startsWith('data:image/') ? '' : newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                className="w-full bg-gray-50 border border-pink-100 text-xs font-bold py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all text-right px-3"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => {
                  if (newAvatarUrl) {
                    updateAvatar(newAvatarUrl);
                    setShowAvatarModal(false);
                    setNewAvatarUrl('');
                  }
                }}
                className="flex-1 bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 text-white text-xs font-black py-2.5 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                حفظ الصورة
              </button>
              <button 
                onClick={() => {
                  setShowAvatarModal(false);
                  setNewAvatarUrl('');
                }}
                className="flex-1 bg-gray-100 text-gray-500 text-xs font-black py-2.5 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Edit Profile Modal with Camera Capture tool */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl space-y-5 border border-pink-100 max-h-[92vh] overflow-y-auto no-scrollbar">
            
            {/* Header */}
            <div className="text-center relative">
              <button 
                onClick={closeEditProfileModal}
                className="absolute top-0 right-0 w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-pink-700 hover:bg-pink-50 transition-colors shadow-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <h4 className="font-black text-gray-800 text-sm">تعديل الملف الشخصي الأنيق</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed font-bold">
                قومي بتحديث اسمكِ أو التقاط صورة شخصية جميلة بالكاميرا مباشرة 📸
              </p>
            </div>

            {/* Photo Section */}
            <div className="space-y-3">
              <span className="text-[11px] text-gray-500 font-bold block text-right border-r-2 border-pink-500 pr-2">الصورة الشخصية:</span>
              
              {/* Image Preview & Active Video Stream Container */}
              <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg ring-4 ring-pink-100/50 bg-gray-50 flex items-center justify-center">
                {isCameraActive ? (
                  <div className="w-full h-full relative">
                    <video 
                      ref={videoRef} 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      مباشر
                    </div>
                  </div>
                ) : (
                  <img 
                    src={editAvatarUrl || DEFAULT_AVATAR} 
                    alt="New Avatar Preview" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Camera Actions & File upload buttons */}
              <div className="space-y-2">
                {isCameraActive ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 bg-pink-700 hover:bg-pink-800 text-white text-xs font-black py-2 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      التقاط الصورة 📸
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-black py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      إلغاء الكاميرا
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full bg-pink-50 hover:bg-pink-100 text-pink-700 hover:text-pink-800 border border-pink-100/60 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                    تشغيل كاميرا الجهاز والتقاط صورة 🤳
                  </button>
                )}

                {cameraError && (
                  <p className="text-[10px] text-red-600 font-bold leading-relaxed bg-red-50 p-2 rounded-lg text-center animate-fade-in">
                    ⚠️ {cameraError}
                  </p>
                )}

                {/* Local Upload as backup option */}
                {!isCameraActive && (
                  <div className="flex items-center gap-2">
                    <label className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700 border border-gray-200 py-2 rounded-xl text-xs font-black cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editAvatarUrl === 'Uploading...' ? 'جاري الرفع...' : 'رفع صورة من الملفات 📁'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEditAvatarUrl('Uploading...');
                            try {
                              const url = await uploadFileToStorage(file, "profiles");
                              setEditAvatarUrl(url);
                            } catch (err) {
                              console.error("UploadThing upload failed:", err);
                              setEditAvatarUrl('');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Display Name Section */}
            <div className="space-y-2 text-right">
              <label className="text-[11px] text-gray-500 font-bold block border-r-2 border-pink-500 pr-2">الاسم الشخصي الجديد:</label>
              <div className="relative">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="أدخلي اسمكِ الكامل هنا..."
                  required
                  className="w-full bg-gray-50/50 border border-pink-100 text-xs font-bold py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all text-right px-4 pr-10"
                />
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-700/60" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-pink-50">
              <button 
                onClick={handleSaveEditProfile}
                disabled={saving || !editName.trim()}
                className="flex-[2] bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 disabled:opacity-50 text-white text-xs font-black py-3 rounded-xl active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-pink-700/10"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    حفظ التغييرات ✨
                  </>
                )}
              </button>
              <button 
                onClick={closeEditProfileModal}
                disabled={saving}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-black py-3 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Firestore Diagnostics Modal */}
      {showDiagnosticModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 border border-pink-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-pink-50 pb-3">
              <div className="w-10 h-10 bg-pink-100 text-pink-700 rounded-2xl flex items-center justify-center shrink-0">
                <Database className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-right">
                <h4 className="font-extrabold text-gray-800 text-sm">فحص تشخيص اتصال Firestore</h4>
                <p className="text-[10px] text-gray-400 font-bold">مراقبة حالة الاتصال والتحقق من العمليات الحية</p>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed font-semibold text-right">
              يقوم هذا الفحص بإجراء الخطوات الأربع المطلوبة للتحقق من الاتصال بقاعدة البيانات الحية وسحابة Google Firestore:
            </p>

            {/* Diagnostic Steps Timeline */}
            <div className="space-y-4 text-right">
              {/* Step 1: Auth */}
              <div className="flex items-start gap-3 border border-pink-50/50 rounded-2xl p-3 bg-pink-50/10">
                <div className="mt-0.5">
                  {isTestingDatabase && !diagnosticResult ? (
                    <Loader2 className="w-5 h-5 text-pink-600 animate-spin" />
                  ) : diagnosticResult?.step1Auth.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                  ) : diagnosticResult?.step1Auth.status === 'failed' ? (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-gray-800">١. تسجيل الدخول المجهول (Anonymous Auth)</span>
                    {diagnosticResult?.step1Auth.errorCode && (
                      <span className="font-mono text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-black">
                        {diagnosticResult.step1Auth.errorCode}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 font-semibold">
                    {diagnosticResult ? diagnosticResult.step1Auth.message : 'جاري التحقق...'}
                  </p>
                  {diagnosticResult?.step1Auth.uid && (
                    <div className="mt-1 font-mono text-[9px] bg-gray-50 p-1 rounded text-gray-500 select-all">
                      UID: {diagnosticResult.step1Auth.uid}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Create Doc */}
              <div className="flex items-start gap-3 border border-pink-50/50 rounded-2xl p-3 bg-pink-50/10">
                <div className="mt-0.5">
                  {isTestingDatabase && !diagnosticResult ? (
                    <Loader2 className="w-5 h-5 text-pink-600 animate-spin" />
                  ) : diagnosticResult?.step2Create.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                  ) : diagnosticResult?.step2Create.status === 'failed' ? (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-gray-800">٢. كتابة مستند اختبار إلى Firestore</span>
                    {diagnosticResult?.step2Create.errorCode && (
                      <span className="font-mono text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-black">
                        {diagnosticResult.step2Create.errorCode}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 font-semibold">
                    {diagnosticResult ? diagnosticResult.step2Create.message : 'بانتظار تسجيل الدخول...'}
                  </p>
                  {diagnosticResult?.step2Create.docId && (
                    <div className="mt-1 font-mono text-[9px] bg-gray-50 p-1.5 rounded text-gray-500">
                      ID: {diagnosticResult.step2Create.docId}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Read Doc */}
              <div className="flex items-start gap-3 border border-pink-50/50 rounded-2xl p-3 bg-pink-50/10">
                <div className="mt-0.5">
                  {isTestingDatabase && !diagnosticResult ? (
                    <Loader2 className="w-5 h-5 text-pink-600 animate-spin" />
                  ) : diagnosticResult?.step3Read.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                  ) : diagnosticResult?.step3Read.status === 'failed' ? (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-gray-800">٣. قراءة المستند ومطابقة البيانات</span>
                    {diagnosticResult?.step3Read.errorCode && (
                      <span className="font-mono text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-black">
                        {diagnosticResult.step3Read.errorCode}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 font-semibold">
                    {diagnosticResult ? diagnosticResult.step3Read.message : 'بانتظار كتابة المستند...'}
                  </p>
                  {diagnosticResult?.step3Read.data && (
                    <div className="mt-2 text-right space-y-1">
                      <span className="text-[9px] text-gray-400 font-bold block">البيانات المسترجعة:</span>
                      <pre className="font-mono text-[9px] bg-gray-50 p-2 rounded-xl text-left border border-gray-100 overflow-x-auto text-pink-700" dir="ltr">
                        {JSON.stringify(diagnosticResult.step3Read.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Verdict Alert */}
            {diagnosticResult && (
              <div className={`p-4 rounded-2xl text-right animate-fade-in ${
                diagnosticResult.overallSuccess 
                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' 
                  : 'bg-rose-50 border border-rose-100 text-rose-800'
              }`}>
                <h5 className="font-black text-xs mb-1">
                  {diagnosticResult.overallSuccess ? '🎉 نجاح تشخيص الاتصال!' : '❌ فشل الفحص أو تعثر الاتصال'}
                </h5>
                <p className="text-[10px] opacity-90 leading-relaxed font-bold">
                  {diagnosticResult.overallSuccess 
                    ? 'تعمل قاعدة بيانات Firestore الآن بكفاءة وبشكل فوري وحقيقي بالكامل دون أي انقطاع!' 
                    : 'يرجى مراجعة تفاصيل ورموز الخطأ لكل خطوة لتحديد سبب عدم الاتصال بالخادم.'}
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={handleRunDiagnostics}
                disabled={isTestingDatabase}
                className="flex-1 bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 disabled:opacity-50 text-white text-xs font-black py-3 rounded-2xl active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-pink-700/10"
              >
                {isTestingDatabase ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>جاري الفحص...</span>
                  </>
                ) : (
                  <span>إعادة الفحص والتشخيص 🔄</span>
                )}
              </button>
              <button 
                onClick={() => {
                  setShowDiagnosticModal(false);
                  setDiagnosticResult(null);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-black px-5 py-3 rounded-2xl active:scale-[0.98] transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. VIP Membership Modal */}
      {showVipModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-right" dir="rtl">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col overflow-hidden border border-pink-100 animate-slide-up space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-pink-50">
              <h3 className="font-extrabold text-pink-700 text-base flex items-center gap-2">
                <Award className="w-5 h-5" /> العضوية والامتيازات المفتوحة
              </h3>
              <button 
                onClick={() => setShowVipModal(false)}
                className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-700 hover:bg-pink-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-pink-700 to-rose-600 p-5 rounded-3xl text-white shadow-md text-center">
                <p className="text-xs text-pink-100 font-bold">مستوى العضوية الحالي</p>
                <h4 className="text-2xl font-black mt-1">{profile?.membership || 'العضوية الذهبية VIP'}</h4>
                <p className="text-[10px] text-pink-200 mt-2">مجموع نقاطكِ: {(profile?.points || 0).toLocaleString()} نقطة</p>
              </div>

              <div className="space-y-3">
                <h5 className="font-black text-xs text-gray-800">تفاصيل الامتيازات المتاحة لكِ:</h5>
                <div className="space-y-2.5">
                  <div className="flex gap-3 items-start p-3 bg-pink-50/40 rounded-2xl border border-pink-100/30">
                    <span className="text-lg">✨</span>
                    <div>
                      <h6 className="font-bold text-xs text-pink-800">خصم شحن فوري 10%</h6>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">يتم احتساب الخصم تلقائياً عند إصدار فواتير شحن المتاجر المعتمدة.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start p-3 bg-pink-50/40 rounded-2xl border border-pink-100/30">
                    <span className="text-lg">📦</span>
                    <div>
                      <h6 className="font-bold text-xs text-pink-800">أولوية الفرز والتجميع</h6>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">تُفرز شحناتكِ في مستودعات الصين والإمارات والكويت في مسار VIP السريع.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start p-3 bg-pink-50/40 rounded-2xl border border-pink-100/30">
                    <span className="text-lg">🎀</span>
                    <div>
                      <h6 className="font-bold text-xs text-pink-800">تغليف هدايا كشميري مجاني</h6>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">يمكنكِ طلب تغليف الطرود بهدايا فخمة عبر التواصل مع هدوشة.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowVipModal(false)}
              className="w-full py-3.5 bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 text-white font-black rounded-2xl text-xs active:scale-[0.98] transition-all"
            >
              موافق، جميل جداً 💕
            </button>
          </div>
        </div>
      )}

      {/* 2. Spin Wheel Modal */}
      {showSpinWheelModal && (
        <SpinWheelModal 
          onClose={() => setShowSpinWheelModal(false)} 
          points={profile?.points || 0}
          onWin={async (amount, type) => {
            if (profile) {
              const newPoints = type === 'points' ? (profile.points + amount) : profile.points;
              const newBalance = type === 'balance' ? ((profile.walletBalance ?? 250000) + amount) : (profile.walletBalance ?? 250000);
              await updateProfile(
                profile.name,
                profile.phone,
                profile.city,
                newBalance,
                profile.savedCardNumber,
                profile.savedCardHolder,
                profile.savedCardExpiry
              );
              // Set the points manually in AppContext if necessary, otherwise use updateProfile or custom function
              // Let's call updateProfile to trigger context update
              if (type === 'points') {
                await redeemPoints(-amount); // adding points is reverse of redeeming
              }
            }
          }}
        />
      )}

      {/* 3. Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-right" dir="rtl">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col overflow-hidden border border-pink-100 animate-slide-up space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-pink-50">
              <h3 className="font-extrabold text-pink-700 text-base flex items-center gap-2">
                <Share2 className="w-5 h-5" /> دعوة صديقة وربح نقاط مجانية
              </h3>
              <button 
                onClick={() => setShowReferralModal(false)}
                className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-700 hover:bg-pink-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-bold leading-relaxed">
                شاركي كود دعوتكِ الخاص مع صديقاتكِ المقربات، وعند قيام أي صديقة بالتسجيل وشحن أول طرد، ستحصل كل منكما على <span className="text-pink-700 font-extrabold">200 نقطة ولاء مجانية</span> فوراً! 🎁✨
              </p>

              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/50 flex items-center justify-between">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold">كود دعوتكِ الفاخر</span>
                  <p className="text-sm font-black text-pink-800 uppercase tracking-widest mt-0.5">LUM-{profile?.phone?.slice(-4) || '7755'}</p>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`LUM-${profile?.phone?.slice(-4) || '7755'}`);
                    alert('تم نسخ كود الدعوة بنجاح جميلتي! 🌸');
                  }}
                  className="bg-pink-700 text-white text-[11px] font-black px-4 py-2 rounded-xl active:scale-95 transition-transform"
                >
                  نسخ الكود 📋
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-gray-700">هل لديكِ كود دعوة من صديقة؟</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="أدخلي كود دعوة صديقتكِ هنا..." 
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-pink-100 rounded-xl text-xs font-bold focus:outline-none focus:border-pink-500 text-center"
                  />
                  <button 
                    onClick={async () => {
                      if (profile) {
                        await redeemPoints(-150); // Give 150 points as a reward
                        alert('تم تفعيل كود الدعوة بنجاح! تم منحكِ 150 نقطة ولاء مجانية في رصيدكِ 🥳💖');
                        setShowReferralModal(false);
                      }
                    }}
                    className="bg-gradient-to-r from-pink-700 to-rose-600 text-white text-xs font-black px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
                  >
                    تفعيل الكود ✨
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowReferralModal(false)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl text-xs active:scale-[0.98] transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* 4. Facial Analysis Modal */}
      {showFacialAnalysisModal && (
        <FacialAnalysis onClose={() => setShowFacialAnalysisModal(false)} />
      )}

      {/* 4. Support Tickets Modal */}
      {showTicketsModal && (
        <SupportTicketsModal 
          onClose={() => setShowTicketsModal(false)}
          profile={profile}
          shipments={shipments}
        />
      )}

      {/* 5. Public Tracking Modal */}
      {showPublicTrackingModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-right" dir="rtl">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col overflow-hidden border border-pink-100 animate-slide-up space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-pink-50">
              <h3 className="font-extrabold text-pink-700 text-base flex items-center gap-2">
                <Link className="w-5 h-5" /> رابط التتبع العام والشخصي
              </h3>
              <button 
                onClick={() => setShowPublicTrackingModal(false)}
                className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-700 hover:bg-pink-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-bold leading-relaxed">
                هل ترغبين في تزويد عائلتكِ أو زبوناتكِ برابط لتتبع شحناتكِ المفتوحة دون الحاجة لتسجيل الدخول إلى حسابكِ؟ يمكنكِ نسخ الرابط المباشر الآمن أدناه لمشاركته فوراً! 🔗✨
              </p>

              {shipments.length > 0 ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-700 block">اختر الشحنة لمشاركة تتبعها المباشر:</span>
                  {shipments.map((s, idx) => {
                    const trackingUrl = `https://eramo.store/tracking?num=${s.trackingNumber}`;
                    return (
                      <div key={idx} className="bg-pink-50/40 p-3.5 rounded-2xl border border-pink-100/30 flex items-center justify-between text-xs">
                        <div className="text-right">
                          <p className="font-bold text-gray-800">طرد رقم: {s.trackingNumber}</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">قادم من {s.origin}</p>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(trackingUrl);
                            alert(`تم نسخ رابط التتبع العام للطرد ${s.trackingNumber} بنجاح! 🌸`);
                          }}
                          className="bg-pink-700 text-white text-[10px] font-black px-3.5 py-1.5 rounded-lg active:scale-95 transition-transform"
                        >
                          نسخ الرابط 📋
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-6 text-xs text-gray-400 font-bold">لا توجد شحنات نشطة حالياً لإنشاء روابط تتبع لها 🌸</p>
              )}
            </div>

            <button 
              onClick={() => setShowPublicTrackingModal(false)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl text-xs active:scale-[0.98] transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      {showNotificationSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-right" dir="rtl">
          <div className="bg-white w-full max-w-md h-[80vh] sm:h-[75vh] rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col overflow-hidden border border-pink-100 animate-slide-up space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-pink-50">
              <h3 className="font-extrabold text-pink-700 text-sm flex items-center gap-2">
                <Bell className="w-5 h-5 text-pink-700" /> إعدادات التنبيهات المباشرة 🔔
              </h3>
              <button 
                onClick={() => setShowNotificationSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-700 hover:bg-pink-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pixar-inspired mascot banner */}
            <div className="bg-pink-50/50 p-4.5 rounded-2xl border border-pink-100/30 flex items-center gap-4.5">
              <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden p-1 shrink-0 shadow-sm">
                <img
                  alt="Batoot Mascot"
                  className="w-full h-full object-contain"
                  src="https://lh3.googleusercontent.com/aida/AP1WRLtwlTtxpvh7CFWTWdRY_emR2xyBvTgx8v6zMnJSM8OrvnGrHK98fOcbdnwqMhudLD35tXhQRA9VBIsbRPIxBCWcjiseBr_ZThUYOO2bASORtpBXsEwGUlke9kqXDQGVw-0hzUjOQZGvkAbigP02pHzK4tU63vK7UVYFj3MEl6UjVilDvrlHzDZhs-o55NTjiE4kAtBK7MfYbaxsU0axIHNlMxqsY-z3Mq4P6X0iHTAI-TEqMLAdFD53L8"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 text-right">
                <p className="text-[11px] text-pink-800 font-extrabold leading-relaxed">
                  "عزيزتي الأنيقة، يمكنكِ التحكم الكامل بنوعية الرسائل والتنبيهات التي تصلكِ لضمان تجربة تسوق مريحة وملكية خالية من الإزعاج! 👑💖"
                </p>
                <p className="text-[10px] text-pink-500 font-black mt-1">— المساعد بطوط الذكي</p>
              </div>
            </div>

            {/* Toggles Container */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
              {Object.entries({
                shipment: { label: 'تنبيهات الشحن والتوصيل 📦', desc: 'متابعة حركة طرودكِ وخط السير لحظة بلحظة' },
                invoice: { label: 'تنبيهات الفواتير والمدفوعات 💳', desc: 'إشعارات الدفع المعتمد وتأكيد تسديد الفواتير' },
                loyalty: { label: 'تنبيهات نقاط الولاء والجوائز 🎁', desc: 'هدايا العجلات اليومية واستبدال النقاط بالخصومات' },
                promotion: { label: 'تنبيهات العروض والخصومات 🛍️', desc: 'حملات التنزيلات والخصومات الحصرية الفورية' },
                announcement: { label: 'الإعلانات العامة وأخبار المتجر 📢', desc: 'تحديثات هدى السلطاني وتنبيهات العائلة الكبرى' },
                support: { label: 'تحديثات الدعم الفني والمساعدين 💬', desc: 'ردود طاقم الدعم المباشر ومحادثات هدوشة وبطوط' }
              }).map(([key, item]) => {
                const isEnabled = currentPrefs[key as keyof typeof currentPrefs] !== false;
                return (
                  <div key={key} className="flex items-center justify-between p-4 bg-white border border-pink-100/50 rounded-2xl hover:border-pink-200 transition-colors shadow-sm text-right">
                    <div className="flex items-start gap-3 text-right">
                      <div className="text-right">
                        <h4 className="font-extrabold text-xs text-gray-800">{item.label}</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePref(key)}
                      className="w-12 h-6.5 rounded-full relative transition-colors duration-300 cursor-pointer shrink-0"
                      style={{ backgroundColor: isEnabled ? '#D97A9A' : '#E5E7EB' }}
                    >
                      <div 
                        className="w-4.5 h-4.5 rounded-full bg-white shadow-sm absolute top-1 transition-all duration-300" 
                        style={{ right: isEnabled ? '4px' : '24px' }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <button 
              onClick={() => setShowNotificationSettingsModal(false)}
              className="w-full py-3.5 bg-pink-700 hover:bg-pink-800 text-white font-extrabold rounded-2xl text-xs active:scale-[0.98] transition-all cursor-pointer shadow-md"
            >
              حفظ وتأكيد الإعدادات ✨
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// 🎡 SPIN WHEEL MODULE
interface SpinWheelProps {
  onClose: () => void;
  points: number;
  onWin: (amount: number, type: 'points' | 'balance') => Promise<void>;
}

export function SpinWheelModal({ onClose, points, onWin }: SpinWheelProps) {
  const { customizations } = useApp();
  const [spinning, setSpinning] = useState(false);
  const [deg, setDeg] = useState(0);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [hasSpunToday, setHasSpunToday] = useState(false);

  const PRIZES = customizations?.spinWheelPrizes && customizations.spinWheelPrizes.length > 0
    ? customizations.spinWheelPrizes
    : [
        { label: '50 نقطة ولاء 🎁', amount: 50, type: 'points' as const },
        { label: 'حظ أوفر 🌸', amount: 0, type: 'points' as const },
        { label: '150 نقطة ولاء ✨', amount: 150, type: 'points' as const },
        { label: '5,000 د.ع رصيد 💳', amount: 5000, type: 'balance' as const },
        { label: '100 نقطة ولاء 💫', amount: 100, type: 'points' as const },
        { label: 'ألف د.ع رصيد محفظة 💰', amount: 1000, type: 'balance' as const },
      ];

  const handleSpin = () => {
    if (spinning || hasSpunToday) return;

    setSpinning(true);
    setWinMessage(null);

    // Random prize selection
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const selectedPrize = PRIZES[prizeIndex];

    // Compute rotation (minimum 5 full spins + slice degree)
    const segmentAngle = 360 / PRIZES.length;
    const finalDegree = 360 * 5 + (360 - (prizeIndex * segmentAngle + segmentAngle / 2));
    setDeg(finalDegree);

    setTimeout(async () => {
      setSpinning(false);
      setHasSpunToday(true);
      
      if (selectedPrize.amount > 0) {
        setWinMessage(`مبروك جميلتي! 🎉 لقد ربحتِ ${selectedPrize.label} وتم إضافتها فوراً إلى حسابكِ بكل حب ودلال! 💕`);
        await onWin(selectedPrize.amount, selectedPrize.type);
      } else {
        setWinMessage(`حظ أوفر في المرة القادمة يا جميلتي! 🌸 هدوشة تتمنى لكِ يوماً سعيداً ومليئاً بالجمال 💖`);
      }
    }, 5000);
  };

  const segmentColors = ['#fce7f3', '#fef3c7', '#fbcfe8', '#fffbeb', '#fdf2f8', '#fde68a'];
  const conicParts = PRIZES.map((_, idx) => {
    const percentStart = ((idx / PRIZES.length) * 100).toFixed(1);
    const percentEnd = (((idx + 1) / PRIZES.length) * 100).toFixed(1);
    const color = segmentColors[idx % segmentColors.length];
    return `${color} ${percentStart}% ${percentEnd}%`;
  }).join(', ');
  const conicGradientStr = `conic-gradient(${conicParts})`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-right" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col overflow-hidden border border-pink-100 animate-slide-up space-y-5 items-center">
        
        <div className="w-full flex justify-between items-center pb-3 border-b border-pink-50">
          <h3 className="font-extrabold text-pink-700 text-base flex items-center gap-2">
            <Compass className="w-5 h-5 text-rose-600 animate-spin-slow" /> عجلة حظ هدوشة وبطوط
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-700 hover:bg-pink-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-500 font-bold text-center leading-relaxed">
          دوري عجلة الجمال اليومية لربح جوائز رائعة من نقاط الولاء ورصيد محفظة إيرامو! 🎡💖
        </p>

        {/* 🎡 THE WHEEL (Luxurious 3D design) */}
        <div className="relative w-64 h-64 my-4 flex items-center justify-center select-none">
          {/* Backing 3D shadow */}
          <div className="absolute inset-1.5 bg-pink-900/10 rounded-full blur-md translate-y-3 pointer-events-none z-0" />

          {/* Golden metallic 3D bezel outer rim */}
          <div className="absolute inset-0 rounded-full border-[8px] border-amber-400 bg-transparent shadow-[0_12px_24px_rgba(219,39,119,0.2),_inset_0_2px_6px_rgba(255,255,255,0.7),_inset_0_-2px_6px_rgba(0,0,0,0.2)] z-10 pointer-events-none">
            {/* Tiny retro lightbulbs around rim */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x = 120 + 112 * Math.cos(angle);
              const y = 120 + 112 * Math.sin(angle);
              const isLit = (i + (spinning ? 2 : 0)) % 2 === 0;
              return (
                <span 
                  key={i}
                  style={{ left: `${x}px`, top: `${y}px` }}
                  className={`absolute w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-xs transition-all duration-300 ${
                    isLit ? 'bg-yellow-100 shadow-yellow-200 scale-110' : 'bg-yellow-600'
                  }`}
                />
              );
            })}
          </div>

          {/* Golden pointer pointer on top */}
          <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-6 h-6 z-20 pointer-events-none drop-shadow-md">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-amber-500 relative">
              <div className="absolute top-[-16px] left-[-4px] w-2 h-2 bg-amber-200 rounded-full border border-amber-500" />
            </div>
          </div>

          <div 
            style={{ 
              transform: `rotate(${deg}deg)`,
              transition: spinning ? 'transform 5s cubic-bezier(0.15, 0.85, 0.35, 1)' : 'none',
              backgroundImage: conicGradientStr
            }}
            className="w-[240px] h-[240px] rounded-full border-2 border-white/60 shadow-inner relative overflow-hidden flex items-center justify-center z-0"
          >
            {PRIZES.map((prize, index) => {
              const angle = (360 / PRIZES.length) * index + (360 / PRIZES.length) / 2;
              return (
                <div 
                  key={index}
                  style={{ transform: `rotate(${angle}deg)` }}
                  className="absolute top-0 right-0 left-0 bottom-0 origin-center flex items-start justify-center pt-8 pointer-events-none select-none"
                >
                  <span className="text-[10.5px] font-black text-[#2d0615] text-center tracking-tight whitespace-nowrap block" style={{ transform: 'rotate(90deg)' }}>
                    {prize.label}
                  </span>
                </div>
              );
            })}
            
            {/* Center Hub Button */}
            <div className="absolute w-12 h-12 bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-200 text-amber-950 rounded-full border-2 border-white shadow-md flex items-center justify-center z-10 font-black text-[10px] shadow-amber-950/20">
              IRAMO
            </div>
          </div>
        </div>

        {winMessage && (
          <div className="w-full p-4 bg-pink-50 border border-pink-100 text-pink-800 rounded-2xl text-xs font-black leading-relaxed flex items-start gap-2 animate-fade-in text-right">
            <span>✨</span>
            <div>{winMessage}</div>
          </div>
        )}

        <button 
          onClick={handleSpin}
          disabled={spinning || hasSpunToday}
          className="w-full py-3.5 bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-black rounded-2xl text-xs active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-pink-500/15"
        >
          {spinning ? 'جاري دوران العجلة بدلال...' : hasSpunToday ? 'لقد لعبتِ اليوم بالفعل! عودي غداً 🌸' : 'اضغطي لبدء الدوران الفاخر 🎡✨'}
        </button>
      </div>
    </div>
  );
}

// 🎫 SUPPORT TICKETS MODULE
interface SupportTicketsProps {
  onClose: () => void;
  profile: any;
  shipments: any[];
}

function SupportTicketsModal({ onClose, profile, shipments }: SupportTicketsProps) {
  const [tickets, setTickets] = useState<any[]>([
    { id: 'TKT-10492', subject: 'استفسار عن طرد شي إن', category: 'استفسار شحن', status: 'مفتوحة', date: '2026/06/25', details: 'جميلتي، الطرد لم تظهر فيه تحديثات منذ يومين في مستودع الكويت.' }
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('استفسار شحن');
  const [details, setDetails] = useState('');
  const [trackingNum, setTrackingNum] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) return;

    setSubmitting(true);
    
    // Simulate API delay, add ticket dynamically
    setTimeout(() => {
      const newTkt = {
        id: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
        subject,
        category,
        status: 'مفتوحة',
        date: new Date().toLocaleDateString('zh-CN'),
        details,
        trackingNum
      };

      setTickets(prev => [newTkt, ...prev]);
      setSubject('');
      setDetails('');
      setTrackingNum('');
      setShowCreate(false);
      setSubmitting(false);
      alert('تم فتح تذكرة الدعم بنجاح! ستجيبكِ هدى السلطاني أو المساعدة هدوشة بأقرب وقت ممكن 🌸');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-right" dir="rtl">
      <div className="bg-white w-full max-w-md h-[80vh] sm:h-[75vh] rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col overflow-hidden border border-pink-100 animate-slide-up space-y-4">
        
        <div className="flex justify-between items-center pb-3 border-b border-pink-50">
          <h3 className="font-extrabold text-pink-700 text-base flex items-center gap-2">
            <Ticket className="w-5 h-5" /> تذاكر الدعم والطلبات المباشرة
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-700 hover:bg-pink-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showCreate ? (
          <form onSubmit={handleSubmitTicket} className="space-y-4 overflow-y-auto flex-1 pr-1">
            <h4 className="font-black text-xs text-pink-800">فتح تذكرة دعم جديدة:</h4>
            
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block">موضوع التذكرة</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: تأخر في توصيل شحنة" 
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-pink-100 rounded-xl text-xs font-bold focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block">الفئة</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-pink-100 rounded-xl text-xs font-bold focus:outline-none focus:border-pink-500"
              >
                <option value="استفسار شحن">استفسار شحن</option>
                <option value="مشكلة دفع وفواتير">مشكلة دفع وفواتير</option>
                <option value="طلب فرز وتغليف VIP">طلب فرز وتغليف VIP</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block">رقم التتبع المرتبط (اختياري)</label>
              <select 
                value={trackingNum}
                onChange={(e) => setTrackingNum(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-pink-100 rounded-xl text-xs font-bold focus:outline-none focus:border-pink-500"
              >
                <option value="">لا يوجد طرد مرتبط</option>
                {shipments.map((s, idx) => (
                  <option key={idx} value={s.trackingNumber}>{s.trackingNumber} ({s.status})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block">تفاصيل الطلب</label>
              <textarea 
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="اكتبي استفساركِ هنا بالتفصيل جميلتي وسيقوم طاقم هدى السلطاني بالرد فوراً..."
                required
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-pink-100 rounded-xl text-xs font-bold focus:outline-none focus:border-pink-500"
              ></textarea>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button 
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-pink-700 to-rose-600 text-white font-black text-xs rounded-xl active:scale-95 transition-transform"
              >
                {submitting ? 'جاري الإرسال...' : 'إرسال التذكرة 💌'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreate(false)}
                className="px-5 py-3 bg-gray-100 text-gray-600 font-black text-xs rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black text-gray-700">تذاكركِ النشطة ({tickets.length})</span>
              <button 
                onClick={() => setShowCreate(true)}
                className="text-[10px] bg-pink-100 text-pink-700 font-black px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
              >
                + فتح تذكرة دعم
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {tickets.map((t, idx) => (
                <div key={idx} className="bg-pink-50/20 p-4 rounded-2xl border border-pink-100/30 text-xs text-right space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-gray-400 font-bold">{t.id}</span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md text-[9px] font-black">{t.status}</span>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-gray-800">{t.subject}</h5>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{t.category} ● {t.date}</p>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-semibold bg-white p-2.5 rounded-xl border border-pink-50/50">
                    {t.details}
                  </p>
                </div>
              ))}
            </div>

            <button 
              onClick={onClose}
              className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl text-xs active:scale-[0.98] transition-all cursor-pointer mt-4"
            >
              إغلاق
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
