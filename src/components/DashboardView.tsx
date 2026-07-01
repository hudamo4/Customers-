import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import IramoProductsList from './IramoProductsList';
import { SpinWheelModal } from './ProfileView';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic, triggerWarningHaptic } from '../utils/haptics';
import { 
  Award, 
  Package, 
  Receipt, 
  ShoppingBag, 
  ArrowLeft, 
  ArrowRight, 
  AppWindow, 
  ShoppingCart, 
  Globe, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Calculator, 
  MessageSquare, 
  Instagram,
  Search, 
  Share2, 
  Minus, 
  Plus, 
  Compass, 
  Truck,
  Wallet,
  Copy,
  PlusCircle,
  Check,
  Bell,
  Smile,
  Coffee,
  Heart,
  HelpCircle,
  ShieldCheck,
  LogIn,
  Sun,
  Moon,
  Plane,
  Gift,
  ArrowUpRight,
  X
} from 'lucide-react';

export default function DashboardView() {
  const { profile, shipments, invoices, notifications, setActiveTab, setSelectedShipmentId, customizations, isLoggedIn, setShowLoginModal, redeemPoints, updateProfile, markAllNotificationsAsRead, markNotificationAsRead } = useApp();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [rechargeModal, setRechargeModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copyCalcSuccess, setCopyCalcSuccess] = useState<boolean>(false);
  const [showSpinWheel, setShowSpinWheel] = useState<boolean>(false);
  const [showNotifModal, setShowNotifModal] = useState<boolean>(false);

  // Lock body scroll when modals are active
  useEffect(() => {
    if (rechargeModal || showNotifModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [rechargeModal, showNotifModal]);

  // Interactive Welcome Card States
  const [userMood, setUserMood] = useState<string | null>(null);
  const [guestActiveTip, setGuestActiveTip] = useState<string>('tracking');

  // Dynamic time-based greeting helper
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: 'صباح الخير والجمال والبركة يا غالية', icon: <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" /> };
    } else if (hour >= 12 && hour < 18) {
      return { text: 'مساء الخير والأنوار والأوقات السعيدة', icon: <Sun className="w-4 h-4 text-orange-400" /> };
    } else {
      return { text: 'طاب مساؤكِ بالورد والأناقة والهدوء', icon: <Moon className="w-4 h-4 text-indigo-400 animate-pulse" /> };
    }
  };

  const greetingObj = getGreetingTime();

  // Calculator states
  const [calcStoreId, setCalcStoreId] = useState<string>('');
  const [calcProvince, setCalcProvince] = useState<string>('بغداد');
  const [calcWeight, setCalcWeight] = useState<number>(1.0);

  // Preset Showcase states
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [presetSearch, setPresetSearch] = useState<string>('');

  // Format title
  const formattedTitle = isLoggedIn
    ? (customizations.heroTitle
        ? customizations.heroTitle.replace('{name}', profile?.name || '')
        : `مرحباً ${profile?.name || ''} 💖`)
    : 'مرحباً بكِ في IRAMO STORE ✨';

  const formattedSubtitle = isLoggedIn
    ? (customizations.heroSubtitle || "أهلاً بكِ في عالم هدوشة وبطوط")
    : 'يمكنكِ استعراض خدماتنا، وللوصول إلى شحناتكِ وفواتيركِ يرجى تسجيل الدخول.';

  // Banners Carousel List
  const rawBanners = (customizations.banners && customizations.banners.length > 0)
    ? customizations.banners
    : [
        {
          id: 'default',
          imageUrl: customizations.heroImageUrl || "https://lh3.googleusercontent.com/aida/AP1WRLs7M6Yg7Yd4TtEvkYvHWuFLa4sqCmyFU4xbTd0gc1JWOUaOtMJrX2oCBWsecPrXKVQ4rWPRAE81BJUclFQ9hcjIwd1DcZSBM5h_gHUg3ugB-AKJSuGQ4-unn6Z8e7LoQ9DP8Vx87nAaBbqttEzIDfrWQSEMvv7M7CQ0dhPEf4vVt9RSg5yzRe8_V_PQICnoHUGYEMdGL0xYFPlWfwArGud6nFBBWis1UivPxaljrjLjHSXxT3xWcLE1dcs",
          title: formattedTitle,
          subtitle: formattedSubtitle
        }
      ];

  const activeBanners = rawBanners.map(bn => ({
    ...bn,
    title: isLoggedIn
      ? (bn.title ? bn.title.replace('{name}', profile?.name || '') : `مرحباً ${profile?.name || ''} 💖`)
      : (bn.id === 'banner_1' || bn.id === 'default' ? 'مرحباً بكِ في IRAMO STORE ✨' : (bn.title || '').replace('{name}', '')),
    subtitle: isLoggedIn
      ? (bn.subtitle ? bn.subtitle.replace('{name}', profile?.name || '') : bn.subtitle)
      : (bn.id === 'banner_1' || bn.id === 'default' ? 'يمكنكِ استعراض خدماتنا، وللوصول إلى شحناتكِ وفواتيركِ يرجى تسجيل الدخول.' : bn.subtitle)
  }));

  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

  React.useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const handleNextBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentBannerIdx((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrevBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentBannerIdx((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  // Take the first shipment as the featured active shipment
  const activeShipment = shipments.length > 0 ? shipments[0] : null;

  // Take the 2 most recent invoices
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  const handleTrackingClick = () => {
    if (activeShipment) {
      setSelectedShipmentId(activeShipment.id || null);
    }
    setActiveTab('tracking');
  };

  const activeStores = customizations.supportedStores || [];
  const selectedStoreDetails = activeStores.find(st => st.name === selectedStore);

  // Calculator Helper functions
  const parseRate = (rateStr?: string): number => {
    if (!rateStr) return 0;
    const num = rateStr.replace(/,/g, '').match(/\d+/);
    return num ? parseInt(num[0]) : 0;
  };

  const iraqRatesList = customizations.iraqRates && customizations.iraqRates.length > 0
    ? customizations.iraqRates
    : [
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
      ];

  const defaultStoreId = activeStores[0]?.id || '';
  const currentStoreId = calcStoreId || defaultStoreId;
  const selectedStoreObj = activeStores.find(s => s.id === currentStoreId) || activeStores[0];

  const selectedProvinceObj = iraqRatesList.find(p => p.province === calcProvince) || iraqRatesList[0];
  const storePricePerKg = parseRate(selectedStoreObj?.rate);
  const deliveryCost = parseRate(selectedProvinceObj?.rate);
  const totalCost = (storePricePerKg * calcWeight) + deliveryCost;

  // Contact / Instagram Helper
  const getInstagramLink = () => {
    const ig = customizations.socials?.instagram || '@iramo.store';
    const cleanIg = ig.replace('@', '').trim();
    if (cleanIg.startsWith('http')) {
      return cleanIg;
    }
    return `https://instagram.com/${cleanIg}`;
  };

  const handleCalcShare = () => {
    const msg = `مرحباً هدوشة وبطوط ✨\nأود الاستفسار عن تكلفة شحن طرد بوزن (${calcWeight.toFixed(1)} كغم) من متجر (${selectedStoreObj?.name || 'غير محدد'}) وتوصيله إلى محافظة (${calcProvince}).\nالوزن: ${calcWeight.toFixed(1)} كغم\nسعر شحن المتجر: ${selectedStoreObj?.rate || '0'} لكل كغم\nسعر توصيل المحافظة: ${selectedProvinceObj?.rate || '0'}\nالتكلفة الإجمالية المقدرة: ${totalCost.toLocaleString()} د.ع 💖`;
    
    try {
      navigator.clipboard.writeText(msg);
    } catch (err) {
      console.error(err);
    }

    setCopyCalcSuccess(true);
    setTimeout(() => {
      setCopyCalcSuccess(false);
      window.open(getInstagramLink(), '_blank');
    }, 1800);
  };

  // Filter Preset Products
  const presetProducts = customizations.presetProducts || [];
  const presetCategories = ['الكل', ...Array.from(new Set(presetProducts.map(p => p.category)))];

  const filteredPresets = presetProducts.filter(p => {
    const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(presetSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="dashboard-view" dir="rtl">
      
      {/* Announcement Bar */}
      {customizations.showAnnouncement && customizations.announcementText && (
        <div className="bg-pink-100/50 border border-pink-200/40 text-pink-800 text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-black shadow-sm text-center animate-pulse">
          <Sparkles className="w-4 h-4 text-pink-600 shrink-0" />
          <span>{customizations.announcementText}</span>
        </div>
      )}

      {/* Hero Banner Section */}
      {customizations.showBanners && (
        <section className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden shadow-md group">
          {activeBanners.map((banner, index) => {
            const isActive = index === currentBannerIdx;
            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                  isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none z-0'
                }`}
              >
                <img
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  src={banner.imageUrl}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-end text-right" dir="rtl">
                  {banner.subtitle && (
                    <p className="text-pink-300 font-semibold text-xs mb-1">
                      {banner.subtitle.replace('{name}', profile?.name || '')}
                    </p>
                  )}
                  <h2 className="text-xl md:text-2xl font-extrabold text-white">
                    {banner.title.replace('{name}', profile?.name || '')}
                  </h2>
                </div>
              </div>
            );
          })}

          {/* Carousel Navigation Arrows */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={handlePrevBanner}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20 backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title="السابق"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextBanner}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20 backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title="التالي"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots Indicators */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentBannerIdx(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    index === currentBannerIdx ? 'bg-pink-500 w-4' : 'bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Interactive Welcome Card Section */}
      <div className="w-full">
        {isLoggedIn ? (
          <div className="relative overflow-hidden bg-gradient-to-tr from-pink-500/10 via-pink-50/70 to-amber-500/5 border border-pink-100 p-6 rounded-[2.25rem] shadow-sm text-right space-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Profile Avatar and Time-Based Personalized Greeting */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-pink-700 font-extrabold bg-pink-100/50 py-1 px-3 rounded-full w-fit">
                  {greetingObj.icon}
                  <span>{greetingObj.text}</span>
                </div>
                <h2 className="text-xl font-extrabold text-pink-950 mt-1">
                  مرحباً بكِ عزيزتنا {profile?.name || 'الأنيقة'} 💖
                </h2>
                <p className="text-xs text-pink-900/70 font-medium leading-relaxed max-w-[340px]">
                  سعداء بتواجدكِ اليوم! قمنا بتحديث مستجدات شحناتكِ وفواتيركِ تلقائياً لتكون جاهزة للمتابعة الفورية.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Notification Bell with Badge */}
                <button
                  onClick={() => {
                    triggerMediumHaptic();
                    setShowNotifModal(true);
                  }}
                  className="relative w-11 h-11 rounded-full bg-white hover:bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-700 shadow-sm transition-all active:scale-95 cursor-pointer group"
                  title="مركز الإشعارات"
                >
                  <Bell className="w-5 h-5 text-pink-600" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-r from-red-600 to-rose-600 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-md border border-white">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {profile?.avatar ? (
                  <div className="relative">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-14 h-14 rounded-full border-2 border-pink-200 object-cover shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                  </div>
                ) : (
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                    <span>{(profile?.name || 'هـ')[0]}</span>
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Mood Picker */}
            <div className="pt-2 border-t border-pink-100/60 space-y-3">
              <div className="flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-pink-600" />
                <span className="text-xs font-black text-pink-950">كيف هو روقانكِ ومزاجكِ اليوم؟ 🌸</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'shop', label: 'متحمسة للتسوق', emoji: '🤩' },
                  { id: 'relax', label: 'أحتاج روقان', emoji: '☕' },
                  { id: 'shipment', label: 'أنتظر شحنة', emoji: '📦' },
                  { id: 'query', label: 'لدي استفسار', emoji: '💬' }
                ].map((mood) => {
                  const isSelected = userMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => {
                        triggerLightHaptic();
                        setUserMood(isSelected ? null : mood.id);
                      }}
                      className={`py-2 px-1.5 rounded-2xl border text-[11px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-500/10 scale-105'
                          : 'bg-white hover:bg-pink-50/50 border-pink-100 text-pink-900'
                      }`}
                    >
                      <span className="text-base">{mood.emoji}</span>
                      <span className="text-[9px] truncate w-full text-center">{mood.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic interaction box based on chosen mood */}
              {userMood && (
                <div className="bg-white border border-pink-100 p-3.5 rounded-2xl space-y-2 animate-fade-in shadow-xs text-right">
                  <p className="text-xs text-pink-950 font-bold leading-relaxed">
                    {userMood === 'shop' && 'رائع جداً! مجهزون لكِ أفضل كوبونات الخصم والعروض الحصرية اليوم لتستمتعي برحلة تسوق متميزة 🛍️✨'}
                    {userMood === 'relax' && 'خذي رشفة من قهوتكِ المفضلة وتصفحي بهدوء، طاقمنا بالكامل في خدمتكِ لنقدم لكِ أرقى تجربة شحن ☕💖'}
                    {userMood === 'shipment' && 'جميع شحناتكِ تقع تحت العناية الفائقة ويتم تحديثها لحظة بلحظة. يمكنكِ تتبع مسارها مباشرة بالضغط على تتبع الشحنات 🚚'}
                    {userMood === 'query' && 'مديرتنا هدوشة ومساعدها الذكي جاهزون للإجابة عن أي استفسار! اضغطي على المساعد العائم بالأسفل لبدء دردشة ممتعة 🤖'}
                  </p>
                  <div className="flex justify-between items-center pt-2 border-t border-pink-50">
                    <button
                      onClick={() => {
                        triggerLightHaptic();
                        if (userMood === 'shop') {
                          document.getElementById('preset-products-section')?.scrollIntoView({ behavior: 'smooth' });
                        } else if (userMood === 'shipment') {
                          setActiveTab('tracking');
                        } else if (userMood === 'query') {
                          const triggerBtn = document.getElementById('hadoosha-assistant-trigger');
                          if (triggerBtn) triggerBtn.click();
                        }
                        setUserMood(null);
                      }}
                      className="text-[10px] font-black text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-1 rounded-full transition-all"
                    >
                      {userMood === 'shop' && 'استعراض العروض 🤩'}
                      {userMood === 'shipment' && 'تتبع الآن 🚚'}
                      {userMood === 'query' && 'اسألي هدوشة 💬'}
                      {userMood === 'relax' && 'شكراً لكِ 💖'}
                    </button>
                    <button
                      onClick={() => {
                        triggerLightHaptic();
                        setUserMood(null);
                      }}
                      className="text-[10px] text-gray-400 hover:text-gray-600 font-bold"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50/30 via-pink-50/50 to-amber-50/30 border border-pink-100 p-6 rounded-[2.25rem] shadow-sm text-right space-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-400/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-pink-700 font-extrabold bg-pink-100/50 py-1 px-3 rounded-full w-fit">
                <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                <span>أهلاً بكِ في آيرامو ستور ✨ زائرة جديدة متميزة!</span>
              </div>
              <h2 className="text-lg font-extrabold text-pink-950 mt-1">
                اكتشفي المزايا الحصرية لخدماتنا 🌸
              </h2>
              <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[340px]">
                انضمي لعائلتنا الأنيقة لتجربة شحن من الطراز الأول تتيح لكِ تتبعاً متكاملاً وإدارة دقيقة لكافة مشترياتكِ.
              </p>
            </div>

            {/* Interactive Feature Tip Navigation for Guest */}
            <div className="bg-white/80 backdrop-blur-md border border-pink-100/60 p-4 rounded-2xl space-y-3 shadow-xs">
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-pink-50/40 rounded-xl border border-pink-100/30">
                {[
                  { id: 'tracking', label: 'تتبع ذكي', icon: <Truck className="w-3.5 h-3.5" /> },
                  { id: 'wallet', label: 'محفظة رقمية', icon: <Wallet className="w-3.5 h-3.5" /> },
                  { id: 'loyalty', label: 'نقاط الولاء', icon: <Award className="w-3.5 h-3.5" /> }
                ].map((tab) => {
                  const isActive = guestActiveTip === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        triggerLightHaptic();
                        setGuestActiveTip(tab.id);
                      }}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-white text-pink-800 border border-pink-100 shadow-xs'
                          : 'text-gray-400 hover:text-pink-900'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-pink-950 font-bold leading-relaxed min-h-[44px] flex items-center justify-center bg-pink-50/20 p-2.5 rounded-xl border border-pink-100/10 text-center">
                {guestActiveTip === 'tracking' && '🚚 تتبعي مسار طرودكِ ووزنها الفعلي خطوة بخطوة من مستودعات تركيا وأمريكا حتى لحظة وصولها لباب منزلكِ.'}
                {guestActiveTip === 'wallet' && '💳 اشحني رصيد محفظتكِ الرقمية فوراً لتسديد فواتير الشحن والتوصيل بكل سهولة وسرعة دون تعقيد.'}
                {guestActiveTip === 'loyalty' && '🎟️ اجمعي النقاط الذهبية مع كل طلب شحن، واستبدليها بهدايا مميزة أو رصيد تسوق وشحن مجاني بالكامل!'}
              </div>
            </div>

            {/* Premium CTA Button */}
            <button
              onClick={() => {
                triggerMediumHaptic();
                setShowLoginModal(true);
              }}
              className="w-full h-11 bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 text-white font-bold text-xs rounded-full shadow-md shadow-pink-500/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول الآمن للبدء فوراً 🔑</span>
            </button>
          </div>
        )}
      </div>

      {/* Loyalty & Wallet Grid */}
      <div className="grid grid-cols-1 gap-4">
        {!isLoggedIn ? (
          <div className="bg-gradient-to-tr from-pink-50/40 via-white to-pink-50/20 border border-pink-100 p-6 rounded-[2.25rem] text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-slate-950 shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-pink-950 text-sm">بوابة خدماتكِ الخاصة ✨</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                سجلي الدخول الآن لمتابعة شحناتكِ وتفاصيل فواتيركِ وشحن محفظتكِ الرقمية فورياً.
              </p>
            </div>
            <button
              onClick={() => {
                triggerMediumHaptic();
                setShowLoginModal(true);
              }}
              className="w-full h-11 bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 text-white font-bold text-xs rounded-full shadow-md shadow-pink-500/10 active:scale-95 transition-all cursor-pointer"
            >
              سجلي الدخول الآن 🌸
            </button>
          </div>
        ) : (
          <>
            {/* Loyalty Card */}
            {customizations.showLoyalty && (
              <div className="bg-white/95 backdrop-blur-xl border border-pink-100 p-5 rounded-3xl shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-pink-400 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/15">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{profile?.membership || 'عضوية ذهبية'}</h3>
                    <p className="text-[11px] text-gray-400 font-bold">نقاط الولاء المتاحة ✨</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xl font-black text-pink-700">{profile?.points?.toLocaleString() || 0}</p>
                  <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Points</p>
                </div>
              </div>
            )}

            {/* Wallet Card - Luxury credit card design */}
            <div className="relative overflow-hidden bg-gradient-to-tr from-[#df8787] via-[#eb9d9d] to-[#fbc3c3] text-white p-5 rounded-[2.25rem] shadow-sm border border-white/20 select-none animate-fade-in">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-pink-900/10 rounded-full blur-xl"></div>
              
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black tracking-widest text-pink-50/80 uppercase">IRAMO PREMIUM PASSPORT</span>
                  <h3 className="font-bold text-xs text-white/95">{profile?.name || 'الأنيقة'}</h3>
                </div>
                <div className="w-9 h-6 bg-white/25 rounded-md backdrop-blur-md flex items-center justify-center border border-white/10">
                  <span className="text-[8.5px] font-black text-pink-950">IRAMO</span>
                </div>
              </div>

              <div className="my-4">
                <p className="text-[9px] font-bold text-pink-50/70">رصيد محفظتكِ الحالية 💳</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black">{(profile?.walletBalance || 0).toLocaleString()}</span>
                  <span className="text-[10px] font-black text-pink-50/90">د.ع</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-white/15">
                <div className="text-[9px] font-mono text-pink-50/70 tracking-wider">
                  **** **** **** {profile?.uid?.slice(-4) || '3994'}
                </div>
                <button
                  onClick={() => {
                    triggerMediumHaptic();
                    setRechargeModal(true);
                  }}
                  className="bg-white/95 hover:bg-white text-pink-900 text-[10px] font-black px-4 py-1.5 rounded-full shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-pink-700" />
                  <span>شحن سريع</span>
                </button>
              </div>
            </div>

            {/* Spin Wheel Promo Card */}
            {customizations.showLoyalty && (
              <div className="bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-600 text-white p-5 rounded-[2.25rem] shadow-sm border border-white/20 select-none animate-fade-in flex items-center justify-between relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <div className="space-y-1.5 relative z-10 max-w-[65%]">
                  <span className="text-[8px] font-black bg-white/20 px-2.5 py-0.5 rounded-full text-white uppercase tracking-wider">عجلة الحظ والهدايا اليومية 🎡</span>
                  <h3 className="font-extrabold text-xs text-white">العبي واربحي جوائز مميزة! 🎁</h3>
                  <p className="text-[10px] text-pink-50/90 font-bold leading-relaxed">
                    نقاط ولاء ورصيد مجاني في محفظتكِ بدوران يومي مجاني بكل دلال! 💕
                  </p>
                  <button
                    onClick={() => {
                      triggerMediumHaptic();
                      setShowSpinWheel(true);
                    }}
                    className="mt-2 bg-white hover:bg-pink-50 text-rose-600 text-[10px] font-black px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <span>دوري العجلة الآن 🎡✨</span>
                  </button>
                </div>
                <div className="w-16 h-16 bg-white/15 rounded-full flex items-center justify-center border border-white/25 shadow-lg relative animate-spin-slow">
                  <Compass className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recharge Modal Popup Simulation */}
      {rechargeModal && (
        <div className="fixed inset-0 z-[99998] bg-black/55 backdrop-blur-md animate-fade-in" onClick={() => setRechargeModal(false)}>
          <div 
            className="fixed z-[99999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[2.5rem] w-full max-w-sm p-6 text-right space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-black text-base text-pink-950">شحن المحفظة فورياً 💳</h3>
            <p className="text-xs text-gray-500 font-bold leading-relaxed">
              تصفحي خيارات شحن المحفظة السريعة لإضافة رصيد فوري لتسديد الفواتير والتوصيل الداخلي تلقائياً.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-pink-900 block">حددي المبلغ المراد شحنه (د.ع):</label>
              <div className="grid grid-cols-3 gap-2">
                {['15,000', '25,000', '50,000'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      triggerSuccessHaptic();
                      alert(`تم تقديم طلب شحن بقيمة ${amt} د.ع بنجاح! سيتم مراجعة الدفع وتحديث المحفظة فوراً.`);
                      setRechargeModal(false);
                    }}
                    className="bg-pink-50/50 hover:bg-pink-100/80 border border-pink-100 text-pink-900 font-black text-xs py-2 rounded-2xl transition-all"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                triggerSuccessHaptic();
                alert("يرجى التواصل مع خدمة زبائن إيرامو ستور لإرسال بطاقة شحن آسيا سيل أو زين كاش مباشرة وتفعيلها في ثوانٍ 💖");
                setRechargeModal(false);
              }}
              className="w-full bg-pink-700 hover:bg-pink-800 text-white font-black text-xs py-3 rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              شحن عبر زين كاش / آسيا سيل 💬
            </button>

            <button
              onClick={() => {
                triggerLightHaptic();
                setRechargeModal(false);
              }}
              className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 py-1"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Promotions & Active Coupons Section */}
      <section className="space-y-3 text-right">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-extrabold text-xs text-pink-950 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-pink-600" />
            عروض وكوبونات حصرية لِكِ 🎟️
          </h3>
          <span className="text-[9px] font-black bg-pink-100 text-pink-800 px-2 py-0.5 rounded-lg">خصومات حية</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {[
            { code: 'IRAMO15', desc: 'خصم 15% على شحن العطور ومستحضرات التجميل', value: '15%' },
            { code: 'FREESHIP', desc: 'شحن داخلي مجاني عند الطلب بأكثر من 3 كغم', value: 'توصيل مجاني' },
            { code: 'DISNEY20', desc: 'خصم 20% على شحنات ديزني لاند الخاصة', value: '20%' }
          ].map((promo) => (
            <div
              key={promo.code}
              className="w-[220px] shrink-0 bg-white border border-pink-100 p-4 rounded-3xl relative overflow-hidden flex flex-col justify-between h-28 shadow-xs"
            >
              <div className="absolute -top-6 -left-6 w-14 h-14 bg-pink-50 rounded-full blur-md"></div>
              <div>
                <span className="text-[9px] font-extrabold text-pink-700 uppercase bg-pink-50 px-2 py-0.5 rounded-md">{promo.value}</span>
                <p className="text-[10px] text-gray-500 font-bold mt-1 leading-snug line-clamp-2">{promo.desc}</p>
              </div>
              <div className="flex justify-between items-center mt-2.5">
                <span className="font-mono text-[10px] font-black text-pink-900">{promo.code}</span>
                <button
                  onClick={() => {
                    triggerSuccessHaptic();
                    navigator.clipboard.writeText(promo.code);
                    setCopiedCode(promo.code);
                    setTimeout(() => setCopiedCode(null), 2000);
                  }}
                  className="bg-pink-50 hover:bg-pink-100 text-[9px] font-black px-3 py-1 rounded-full text-pink-800 border border-pink-100/30 transition-all cursor-pointer"
                >
                  {copiedCode === promo.code ? 'تم النسخ ✓' : 'نسخ الكود'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* Active Shipment / Quick Action */}
      <div className="bg-white/95 backdrop-blur-xl border border-pink-100 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            {activeShipment ? (() => {
              const s = (activeShipment.status || '').toLowerCase();
              let bg = 'bg-pink-50 text-pink-800 border-pink-100/80';
              let dot = 'bg-pink-500';
              if (s.includes('تسليم') || s.includes('استلام') || s.includes('تم التسليم') || s.includes('وصلت للزبون') || s.includes('مكتمل') || s.includes('paid')) {
                bg = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
                dot = 'bg-emerald-500';
              } else if (s.includes('طريق') || s.includes('مندوب') || s.includes('توصيل') || s.includes('شحن')) {
                bg = 'bg-amber-50 text-amber-800 border-amber-200/80';
                dot = 'bg-amber-500 animate-pulse';
              } else if (s.includes('مطار') || s.includes('جمارك') || s.includes('بغداد') || s.includes('ترانزيت')) {
                bg = 'bg-sky-50 text-sky-800 border-sky-200/80';
                dot = 'bg-sky-500';
              }
              return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${bg} mb-2`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  <span>{activeShipment.status}</span>
                </span>
              );
            })() : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 mb-2">
                لا يوجد شحنات نشطة
              </span>
            )}
            <h3 className="text-lg font-bold text-gray-800">
              {activeShipment ? `شحنة #${activeShipment.trackingNumber}` : 'ابدئي تتبع طردك الآن'}
            </h3>
          </div>
          {activeShipment && (
            <button
              onClick={handleTrackingClick}
              className="text-pink-700 text-sm font-bold flex items-center gap-1 hover:underline"
            >
              <span>تتبع</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {activeShipment ? (
          <>
            <div className="relative pt-1 mb-4">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-bold inline-block py-1 px-2 uppercase rounded-full text-pink-700 bg-pink-100">
                    في الطريق
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold inline-block text-pink-700">75%</span>
                </div>
              </div>
              <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-gray-100">
                <div
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-1000"
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {activeShipment.currentLocation} • المتوقع في {activeShipment.estimatedDelivery}
            </p>
          </>
        ) : (
          <p className="text-xs text-gray-500 leading-relaxed">
            جميع شحناتك قد وصلت بنجاح! عند طلب منتجات جديدة، سيتم تسجيل طرودك هنا تلقائياً لتتبعها خطوة بخطوة.
          </p>
        )}
      </div>

      {/* Supported Stores */}
      {customizations.showStores && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">الأقسام والمتاجر المدعومة</h3>
            <span className="text-xs text-pink-600 font-semibold flex items-center gap-1">
              مضمونة 100% <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {activeStores.map((store) => (
              <button
                key={store.id}
                onClick={() => setSelectedStore(selectedStore === store.name ? null : store.name)}
                className={`bg-white/95 backdrop-blur-xl aspect-square rounded-3xl flex flex-col items-center justify-center p-3 text-center border transition-all active:scale-95 cursor-pointer ${
                  selectedStore === store.name ? 'border-pink-500 ring-2 ring-pink-100' : 'border-pink-50/50'
                }`}
              >
                {store.image ? (
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-10 h-10 object-cover rounded-xl mb-1 border border-pink-50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Package className="w-7 h-7 text-pink-700/80 mb-1" />
                )}
                <span className="text-[10px] font-black tracking-tight text-gray-800 truncate w-full">
                  {store.name}
                </span>
                <span className="text-[8px] text-pink-700 font-bold mt-1 bg-pink-50 px-1.5 py-0.5 rounded-full">
                  التفاصيل
                </span>
              </button>
            ))}

            {activeStores.length === 0 && (
              <p className="col-span-3 text-center py-6 text-xs text-gray-400 bg-white/50 rounded-2xl border border-pink-50">
                لا يوجد أقسام مسجلة حالياً.
              </p>
            )}
          </div>

          {/* Dynamic Store Details Popup/Card */}
          {selectedStore && selectedStoreDetails && (
            <div className="mt-4 p-5 bg-pink-50/60 border border-pink-100/50 rounded-2xl animate-fade-in text-right">
              <h4 className="font-bold text-sm text-pink-800 mb-1">{selectedStoreDetails.name}</h4>
              <div className="text-xs space-y-2 text-gray-600">
                <p>💵 <strong className="text-gray-700">سعر الشحن:</strong> {selectedStoreDetails.rate}</p>
                <p>⏱️ <strong className="text-gray-700">المدة المتوقعة:</strong> {selectedStoreDetails.duration}</p>
                <p className="pt-1 border-t border-pink-100/40 text-gray-500 leading-relaxed">
                  {selectedStoreDetails.details}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* WHAT WE OFFER SECTION */}
      {customizations.offeredServices && customizations.offeredServices.length > 0 && (
        <section className="space-y-4 text-right">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-extrabold text-base text-pink-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" /> خدماتنا المميزة وماذا نقدم لجمالكِ والدلال 🌸
            </h3>
            <span className="text-[9px] bg-pink-100 text-pink-800 font-black px-3 py-1 rounded-full">كل السرعة والأمان ✨</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customizations.offeredServices.map((srv: any) => (
              <div 
                key={srv.id}
                className="bg-white/95 backdrop-blur-xl border border-pink-100/60 p-5 rounded-[2.25rem] shadow-sm flex items-start gap-4 hover:border-pink-300 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50/50 rounded-full blur-2xl -mr-6 -mt-6"></div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/10 shrink-0 relative z-10 group-hover:scale-110 transition-transform">
                  {srv.iconName === 'Plane' && <Plane className="w-4 h-4" />}
                  {srv.iconName === 'ShoppingBag' && <ShoppingBag className="w-4 h-4" />}
                  {srv.iconName === 'Truck' && <Truck className="w-4 h-4" />}
                  {srv.iconName === 'Compass' && <Compass className="w-4 h-4" />}
                  {srv.iconName === 'Sparkles' && <Sparkles className="w-4 h-4" />}
                  {srv.iconName === 'Gift' && <Gift className="w-4 h-4" />}
                  {srv.iconName === 'Heart' && <Heart className="w-4 h-4" />}
                  {srv.iconName === 'Smile' && <Smile className="w-4 h-4" />}
                  {srv.iconName === 'ShoppingCart' && <ShoppingCart className="w-4 h-4" />}
                  {srv.iconName === 'Award' && <Award className="w-4 h-4" />}
                  {!['Plane', 'ShoppingBag', 'Truck', 'Compass', 'Sparkles', 'Gift', 'Heart', 'Smile', 'ShoppingCart', 'Award'].includes(srv.iconName) && (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>
                <div className="space-y-1 text-right relative z-10">
                  <h4 className="font-extrabold text-xs text-pink-950 flex items-center gap-1 group-hover:text-pink-700 transition-colors">
                    <span>{srv.title}</span>
                    <ArrowUpRight className="w-3 h-3 text-pink-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Shipping Cost Calculator */}
      <section className="bg-white border border-pink-100 rounded-3xl p-6 shadow-xs space-y-5 text-right">
        <div className="flex items-center gap-2 border-b border-pink-50 pb-3">
          <div className="p-2 bg-pink-50 rounded-xl text-pink-700">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-gray-800">حاسبة تكلفة الشحن والوزن التقريبية ⚖️</h3>
            <p className="text-[10px] text-gray-400 font-semibold">احسبي سعر طرودك وتوصيلها فوراً وبشفافية تامة</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Select Store */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-1.5">اختارِي متجر/قسم الشحن</label>
            <select
              value={currentStoreId}
              onChange={(e) => setCalcStoreId(e.target.value)}
              className="w-full bg-pink-50/40 border border-pink-100/50 focus:outline-none focus:border-pink-300 text-xs px-3.5 py-2.5 rounded-xl font-bold"
            >
              {activeStores.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.rate})
                </option>
              ))}
              {activeStores.length === 0 && (
                <option value="">لا يوجد متاجر مسجلة</option>
              )}
            </select>
          </div>

          {/* Grid: Province & Weight */}
          <div className="grid grid-cols-2 gap-4">
            {/* Province Selection */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-1.5">محافظة التوصيل</label>
              <select
                value={calcProvince}
                onChange={(e) => setCalcProvince(e.target.value)}
                className="w-full bg-pink-50/40 border border-pink-100/50 focus:outline-none focus:border-pink-300 text-xs px-3.5 py-2.5 rounded-xl font-bold"
              >
                {iraqRatesList.map((rateObj) => (
                  <option key={rateObj.province} value={rateObj.province}>
                    {rateObj.province} ({rateObj.rate})
                  </option>
                ))}
              </select>
            </div>

            {/* Weight Counter */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-1.5">الوزن التقديري (كغم)</label>
              <div className="flex items-center bg-pink-50/40 border border-pink-100/50 rounded-xl overflow-hidden h-10">
                <button
                  type="button"
                  onClick={() => setCalcWeight(prev => Math.max(0.1, parseFloat((prev - 0.5).toFixed(1))))}
                  className="w-10 h-full flex items-center justify-center text-pink-700 hover:bg-pink-100/50 font-bold text-sm cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Math.max(0.1, parseFloat(parseFloat(e.target.value).toFixed(1)) || 1.0))}
                  className="flex-1 w-full text-center bg-transparent focus:outline-none text-xs font-black text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setCalcWeight(prev => parseFloat((prev + 0.5).toFixed(1)))}
                  className="w-10 h-full flex items-center justify-center text-pink-700 hover:bg-pink-100/50 font-bold text-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Receipt Cost Breakdown card */}
          <div className="bg-gradient-to-br from-pink-50/30 to-pink-50/80 border border-pink-100 p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-gray-600">
              <span className="font-semibold">تكلفة الشحن الدولي ({calcWeight.toFixed(1)} كغم × {selectedStoreObj?.name || 'القسم'}):</span>
              <span className="font-bold text-gray-800">{(storePricePerKg * calcWeight).toLocaleString()} د.ع</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span className="font-semibold">تكلفة التوصيل الداخلي ({calcProvince}):</span>
              <span className="font-bold text-gray-800">{deliveryCost.toLocaleString()} د.ع</span>
            </div>
            <div className="border-t border-pink-100/80 pt-2.5 mt-2 flex justify-between items-center">
              <span className="font-black text-pink-900 text-sm">المجموع التقريبي المقدر:</span>
              <span className="font-black text-pink-700 text-lg">{totalCost.toLocaleString()} د.ع</span>
            </div>
          </div>

          {/* Action button to Instagram */}
          <div className="relative">
            {copyCalcSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 -top-12 bg-emerald-600 text-white font-bold text-[10px] p-2.5 rounded-xl shadow-md text-center z-50 flex items-center justify-center gap-1.5"
              >
                <span>✨ تم نسخ تفاصيل الحسبة! جاري توجيهكِ لإنستغرام...</span>
              </motion.div>
            )}
            <button
              onClick={handleCalcShare}
              className="w-full bg-pink-700 hover:bg-pink-800 text-white font-black text-xs py-3 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Instagram className="w-4.5 h-4.5 text-white" />
              <span>الاستفسار والطلب عبر حساب إنستغرام 📸</span>
            </button>
          </div>
        </div>
      </section>

      {/* Iramo Products List Showcase Component */}
      <IramoProductsList />

      {/* Recent Invoices */}
      <section className="pb-8 text-right">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">الفواتير الأخيرة</h3>
          <button
            onClick={() => setActiveTab('invoices')}
            className="text-pink-700 text-sm font-bold flex items-center gap-0.5 hover:underline"
          >
            <span>عرض الكل</span>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
        <div className="space-y-3">
          {recentInvoices.map((inv) => (
            <div
              key={inv.id || inv.invoiceId}
              className="bg-white/95 backdrop-blur-xl p-4 flex items-center justify-between border border-pink-50/50 rounded-2xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-700">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">طلب {inv.store} #{inv.invoiceId}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{inv.date}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold text-pink-700">{inv.amount}</p>
                <p
                  className={`text-[9px] font-extrabold uppercase ${
                    inv.status === 'Paid' ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  {inv.status === 'Paid' ? 'تم الدفع' : 'قيد الانتظار'}
                </p>
              </div>
            </div>
          ))}

          {recentInvoices.length === 0 && (
            <p className="text-center py-6 text-xs text-gray-400">لا يوجد فواتير مسجلة حالياً.</p>
          )}
        </div>
      </section>

      {/* Brand Touch: Dynamic Footer Mascot Signature */}
      <section className="bg-white border border-pink-100/50 rounded-3xl p-6 relative overflow-hidden shadow-sm mt-2">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 flex-shrink-0 bg-pink-50 rounded-3xl overflow-hidden p-2">
            <img
              alt="Hadoosha & Batoot"
              className="w-full h-full object-contain"
              src={customizations.homeFooterMascotUrl || "https://lh3.googleusercontent.com/aida/AP1WRLs7xYMw1dlJILjhZ2VzHUgTES3bYmOtS532eeDn9JpDom3Gp-MaPoVhT_e495zabXi9PhvxGhgg_DGSwGWwf9dmXp5ZUWaJm0RCNd8GbCsm6Pfsr0iJJMO0aAxy5MOcRhILsJttChJdkmTm_mZbX5E5mSnfAvK48H_feUdzK0meAC_w_y8FpVIQyOMw7BefhhUleQ-yNPc9mOamo6Uhxfvs0PQtY8Tp68F3pQbyGpw3MPMMO_Rkhd2fSw"}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 space-y-1 text-right">
            <p className="text-pink-700 italic leading-relaxed text-xs font-semibold">
              {(customizations.homeFooterMascotQuote || "عزيزتي {name}، جمالك يبدأ من اهتمامك بنفسك. نحن هنا دائماً لنوفر لكِ الأفضل في شحن وتسوق متميز!").replace("{name}", profile?.name || 'الأنيقة')}
            </p>
            <p className="font-bold text-pink-800 text-xs">— {customizations.homeFooterMascotAuthor || 'هدوشة وبطوط'}</p>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-pink-100/20 rounded-full blur-2xl"></div>
      </section>

      {/* Spin Wheel Modal */}
      {showSpinWheel && (
        <SpinWheelModal
          onClose={() => setShowSpinWheel(false)}
          points={profile?.points || 0}
          onWin={async (amount, type) => {
            if (profile) {
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
              if (type === 'points') {
                await redeemPoints(-amount); // adding points is opposite of redeeming
              }
            }
          }}
        />
      )}

      {/* Elegant sliding Notification Center Drawer */}
      {showNotifModal && (
        <div className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl" onClick={() => setShowNotifModal(false)}>
          <div 
            className="fixed z-[99999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-full max-w-sm rounded-[32px] flex flex-col shadow-2xl text-right max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-pink-50 bg-gradient-to-l from-pink-50/50 to-white flex justify-between items-center flex-row-reverse">
              <button 
                onClick={() => {
                  triggerMediumHaptic();
                  setShowNotifModal(false);
                }}
                className="w-8 h-8 rounded-full hover:bg-pink-50 flex items-center justify-center cursor-pointer text-gray-500 transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700">
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>
                <h3 className="font-black text-gray-800 text-sm">إشعاراتكِ الحالية يا جميلتي ✨</h3>
              </div>
            </div>

            {/* Actions / Sub-header */}
            {isLoggedIn && notifications.length > 0 && (
              <div className="px-6 py-3 bg-pink-50/30 border-b border-pink-100/50 flex justify-between items-center text-xs font-bold text-pink-900">
                <span>لديكِ {notifications.filter(n => !n.read).length} إشعارات غير مقروءة 💌</span>
                <button
                  onClick={async () => {
                    triggerSuccessHaptic();
                    await markAllNotificationsAsRead();
                  }}
                  className="text-pink-700 hover:text-pink-900 underline text-[11px] font-black cursor-pointer"
                >
                  تحديد الكل كمقروء ✓
                </button>
              </div>
            )}

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {!isLoggedIn ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-pink-700">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-sm text-pink-950">مساحة خاصة بإشعاراتكِ يا عزيزتي 💖</h4>
                  <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                    يرجى تسجيل الدخول لعرض تفاصيل شحناتكِ وفواتيركِ وتحديثات عروضكِ المخصصة تلقائياً.
                  </p>
                  <button
                    onClick={() => {
                      setShowNotifModal(false);
                      setShowLoginModal(true);
                    }}
                    className="bg-pink-700 hover:bg-pink-850 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    تسجيل الدخول الآن ✨
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-pink-300">
                    <Smile className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-sm text-pink-950">صندوق إشعاراتكِ فارغ يا زهرتي 🌸</h4>
                  <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                    لا توجد إشعارات مسجلة حالياً. سنقوم بإعلامكِ هنا فور حدوث أي تحديث لشحناتكِ أو فواتيركِ بكل دلال!
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isRead = notif.read;
                  return (
                    <div
                      key={notif.id || notif.notificationId}
                      onClick={async () => {
                        triggerLightHaptic();
                        if (!isRead && notif.id) {
                          await markNotificationAsRead(notif.id);
                        }
                      }}
                      className={`p-4 rounded-3xl border transition-all text-right cursor-pointer flex gap-3 items-start ${
                        isRead 
                          ? 'bg-gray-50/50 border-gray-100 opacity-75' 
                          : 'bg-pink-50/30 border-pink-100 shadow-xs relative overflow-hidden'
                      }`}
                    >
                      {/* Unread dot indicator */}
                      {!isRead && (
                        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-pink-600 animate-pulse" />
                      )}

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center ${
                        notif.type === 'shipment' 
                          ? 'bg-pink-100 text-pink-700' 
                          : notif.type === 'invoice'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {notif.type === 'shipment' ? (
                          <Plane className="w-5 h-5" />
                        ) : notif.type === 'invoice' ? (
                          <Receipt className="w-5 h-5" />
                        ) : (
                          <Gift className="w-5 h-5" />
                        )}
                      </div>

                      {/* Content details */}
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className={`text-xs font-black text-gray-800 ${!isRead ? 'pr-2' : ''}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[9px] text-gray-400 font-bold shrink-0">{notif.time || 'الآن'}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                          {notif.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer mascot note */}
            <div className="p-4 border-t border-pink-50 bg-pink-50/20 text-center">
              <p className="text-[10px] text-pink-700 font-semibold italic">
                نحن في IRAMO نسعى دائماً لجعلكِ الأولى في متابعة طرودكِ بكل سهولة ودلال 💕
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

