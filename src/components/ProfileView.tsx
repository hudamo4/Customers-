import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Phone, MapPin, Edit, Check, Star, Gift, ChevronLeft, LogOut, Camera, Shield, Wallet, Bell, AlertCircle, ShoppingBag, Globe, X, CreditCard, Lock, ShieldCheck, HelpCircle, ArrowLeft, CheckCircle } from 'lucide-react';

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
  const { profile, shipments, updateProfile, redeemPoints, setActiveTab, customizations, updateAvatar, setAppMode } = useApp();
  const [isEditing, setIsEditing] = useState<boolean>(false);
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
                src={profile?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9EaYCDGI3nnclPO4Dfn8I8RZWRNVEKBUb-qxzppoUDSSF0uOYRcTHzQEOvzXtqZyk5bVh4idglS262c_ZUgYdgA-h1OorPVThxh8UXI7GHoH2uDEhbQg2eVlFMYU4isBKM9I_0LSyYdiFMT_ttIH-xYE0KuXOFy-Kz_UIlEMn-XC4L9y1Vol5VvGdb1i51-vz5DCQ3rO23XQP4xhX_1niZMeMM8D-RuEUU1U-r7VqHSMTCi7iILOoNy4WG-WS3v4pxciGg6Rk_QE'}
                referrerPolicy="no-referrer"
              />
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowAvatarModal(true);
              }}
              className="absolute -bottom-1 -left-1 bg-pink-700 text-white p-2 rounded-full shadow-lg border-2 border-white cursor-pointer active:scale-90 transition-transform flex items-center gap-2 px-3">
              <Camera className="w-4.5 h-4.5" />
              <span className="text-[10px] font-bold">تغيير الصورة</span>
            </button>
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-gray-800">{profile?.name || 'الزبونة الكريمة'}</h2>
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-pink-100 text-pink-800 rounded-full shadow-sm">
            <Star className="w-4 h-4 fill-pink-800 text-pink-800" />
            <span className="text-[11px] font-bold tracking-wide">{profile?.membership || 'عضوية ذهبية'}</span>
          </div>
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
          <div className="flex items-center justify-between p-5 hover:bg-pink-50/20 cursor-pointer group transition-colors">
            <div className="flex items-center gap-4">
              <Bell className="w-5 h-5 text-gray-500 group-hover:text-pink-700" />
              <span className="text-xs font-semibold text-gray-700">إعدادات التنبيهات المباشرة</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-300" />
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
                onClick={() => {
                  if (passcodeInput === '9988' || passcodeInput === 'huda44' || passcodeInput === 'huda2026') {
                    setAppMode('manager');
                    setShowPasscodeModal(false);
                    setPasscodeInput('');
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
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuD9EaYCDGI3nnclPO4Dfn8I8RZWRNVEKBUb-qxzppoUDSSF0uOYRcTHzQEOvzXtqZyk5bVh4idglS262c_ZUgYdgA-h1OorPVThxh8UXI7GHoH2uDEhbQg2eVlFMYU4isBKM9I_0LSyYdiFMT_ttIH-xYE0KuXOFy-Kz_UIlEMn-XC4L9y1Vol5VvGdb1i51-vz5DCQ3rO23XQP4xhX_1niZMeMM8D-RuEUU1U-r7VqHSMTCi7iILOoNy4WG-WS3v4pxciGg6Rk_QE',
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

            <div className="space-y-1 text-right">
              <span className="text-[10px] text-gray-400 font-bold block">أو أدخلي رابط صورتكِ الخاصة:</span>
              <input 
                type="text"
                placeholder="رابط الصورة (URL)"
                value={newAvatarUrl}
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

    </div>
  );
}
