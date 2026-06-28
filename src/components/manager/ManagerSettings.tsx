import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StoreCustomization, PresetProductCustomization, BannerItem } from '../../types';
import { 
  Settings, 
  Eye, 
  Languages, 
  MapPin, 
  Wallet, 
  Link as LinkIcon, 
  Check, 
  Smartphone,
  Save,
  Smile,
  Truck,
  Sparkles,
  Layers,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  HelpCircle,
  FileText,
  Bell,
  AlertTriangle,
  Upload
} from 'lucide-react';

export default function ManagerSettings() {
  const { customizations, updateCustomizations } = useApp();

  // Reusable image file uploader component
  const ImageUploaderWidget = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: string; 
    onChange: (val: string) => void; 
    label: string;
  }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    };

    return (
      <div className="space-y-1.5 text-right">
        <label className="block text-[10px] font-black text-gray-500">{label}</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-white border border-pink-100 focus:outline-none focus:border-pink-300 text-xs px-3 py-2.5 rounded-xl font-mono text-left font-semibold text-gray-700"
            placeholder="رابط الصورة https://... أو قم برفع ملف"
          />
          <label className="bg-pink-50 hover:bg-pink-100 text-pink-700 hover:text-pink-800 border border-pink-100 px-3.5 py-2.5 rounded-xl text-[10.5px] font-black cursor-pointer transition-all active:scale-95 shrink-0 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'جاري الرفع...' : 'رفع صورة 📁'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {value && value.startsWith('data:image/') && (
          <p className="text-[9px] text-emerald-600 font-bold">✓ تم تحميل الصورة محلياً بنجاح (جاهزة للحفظ)</p>
        )}
      </div>
    );
  };

  const [activeSubTab, setActiveSubTab] = useState<'ui' | 'shipping_payment' | 'stores' | 'presets'>('ui');

  // Saving states
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Form states for general settings (populated from customizations)
  const [heroImageUrl, setHeroImageUrl] = useState(customizations.heroImageUrl || '');
  const [heroTitle, setHeroTitle] = useState(customizations.heroTitle || '');
  const [heroSubtitle, setHeroSubtitle] = useState(customizations.heroSubtitle || '');
  const [showStores, setShowStores] = useState(customizations.showStores ?? true);
  const [showLoyalty, setShowLoyalty] = useState(customizations.showLoyalty ?? true);
  const [showBanners, setShowBanners] = useState(customizations.showBanners ?? true);
  const [announcementText, setAnnouncementText] = useState(customizations.announcementText || '');
  const [showAnnouncement, setShowAnnouncement] = useState(customizations.showAnnouncement ?? true);

  // Dynamic Mascot & Multi-Page banners
  const [homeFooterMascotUrl, setHomeFooterMascotUrl] = useState(customizations.homeFooterMascotUrl || '');
  const [homeFooterMascotQuote, setHomeFooterMascotQuote] = useState(customizations.homeFooterMascotQuote || '');
  const [homeFooterMascotAuthor, setHomeFooterMascotAuthor] = useState(customizations.homeFooterMascotAuthor || '');
  const [trackingBatootMascotUrl, setTrackingBatootMascotUrl] = useState(customizations.trackingBatootMascotUrl || '');
  const [trackingBatootQuote, setTrackingBatootQuote] = useState(customizations.trackingBatootQuote || '');
  const [trackingSupportAgentUrl, setTrackingSupportAgentUrl] = useState(customizations.trackingSupportAgentUrl || '');
  const [trackingSupportTitle, setTrackingSupportTitle] = useState(customizations.trackingSupportTitle || '');
  const [trackingSupportQuote, setTrackingSupportQuote] = useState(customizations.trackingSupportQuote || '');
  const [invoiceInstructionText, setInvoiceInstructionText] = useState(customizations.invoiceInstructionText || '');
  const [notificationsBannerUrl, setNotificationsBannerUrl] = useState(customizations.notificationsBannerUrl || '');
  const [notificationsWelcomeText, setNotificationsWelcomeText] = useState(customizations.notificationsWelcomeText || '');
  const [invoiceHadooshaImageUrl, setInvoiceHadooshaImageUrl] = useState(customizations.invoiceHadooshaImageUrl || '');
  const [mastercardExpiry, setMastercardExpiry] = useState(customizations.mastercardExpiry || '12/28');
  const [mastercardCvv, setMastercardCvv] = useState(customizations.mastercardCvv || '345');

  const [rates, setRates] = useState({
    baghdad: customizations.rates?.baghdad || '5,000 د.ع',
    babel: customizations.rates?.babel || '3,000 د.ع',
    provinces: customizations.rates?.provinces || '5,000 د.ع'
  });

  const [bankInfo, setBankInfo] = useState({
    superkey: customizations.bankInfo?.superkey || 'SK-9988-7766-5544',
    holderName: customizations.bankInfo?.holderName || 'شركة إيرامو للتجارة المحدودة',
    zainCash: customizations.bankInfo?.zainCash || '0780 000 0000',
    zainHolder: customizations.bankInfo?.zainHolder || 'IRAMO STORE ADMIN'
  });

  const [socials, setSocials] = useState({
    whatsapp: customizations.socials?.whatsapp || '+964 780 123 4567',
    instagram: customizations.socials?.instagram || '@iramo_store',
    facebook: customizations.socials?.facebook || 'fb.com/iramostore',
    website: customizations.socials?.website || 'www.iramostore.com'
  });

  // Iraqi Provinces & delivery rates list
  const [iraqRatesList, setIraqRatesList] = useState<{ province: string; rate: string; }[]>(() => {
    return customizations.iraqRates && customizations.iraqRates.length > 0
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
  });
  const [newProvinceName, setNewProvinceName] = useState<string>('');
  const [newProvinceRate, setNewProvinceRate] = useState<string>('');
  const [editingProvinceIndex, setEditingProvinceIndex] = useState<number | null>(null);

  // Store management states
  const [storesList, setStoresList] = useState<StoreCustomization[]>(customizations.supportedStores || []);
  const [isStoreFormOpen, setIsStoreFormOpen] = useState<boolean>(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [storeForm, setStoreForm] = useState({
    name: '',
    rate: '',
    duration: '',
    details: '',
    image: ''
  });

  // Preset Product management states
  const [presetsList, setPresetsList] = useState<PresetProductCustomization[]>(customizations.presetProducts || []);
  const [isPresetFormOpen, setIsPresetFormOpen] = useState<boolean>(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [presetForm, setPresetForm] = useState({
    name: '',
    price: '',
    image: '',
    category: 'مكياج'
  });

  // Multi-Banner management states
  const [bannersList, setBannersList] = useState<BannerItem[]>(() => {
    return customizations.banners && customizations.banners.length > 0
      ? customizations.banners
      : [
          {
            id: 'banner_1',
            imageUrl: customizations.heroImageUrl || 'https://lh3.googleusercontent.com/aida/AP1WRLs7M6Yg7Yd4TtEvkYvHWuFLa4sqCmyFU4xbTd0gc1JWOUaOtMJrX2oCBWsecPrXKVQ4rWPRAE81BJUclFQ9hcjIwd1DcZSBM5h_gHUg3ugB-AKJSuGQ4-unn6Z8e7LoQ9DP8Vx87nAaBbqttEzIDfrWQSEMvv7M7CQ0dhPEf4vVt9RSg5yzRe8_V_PQICnoHUGYEMdGL0xYFPlWfwArGud6nFBBWis1UivPxaljrjLjHSXxT3xWcLE1dcs',
            title: 'مرحباً، {name}! ✨',
            subtitle: 'أهلاً بكِ في عالم هدوشة وبطوط 💖'
          }
        ];
  });
  const [isBannerFormOpen, setIsBannerFormOpen] = useState<boolean>(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    imageUrl: '',
    title: '',
    subtitle: ''
  });
  const [bannerToDelete, setBannerToDelete] = useState<BannerItem | null>(null);

  // Keep local states in sync with database/customizations updates
  React.useEffect(() => {
    if (customizations.banners && customizations.banners.length > 0) {
      setBannersList(customizations.banners);
    }
    if (customizations.heroSubtitle) setHeroSubtitle(customizations.heroSubtitle);
    if (customizations.heroImageUrl) setHeroImageUrl(customizations.heroImageUrl);
    if (customizations.homeFooterMascotUrl) setHomeFooterMascotUrl(customizations.homeFooterMascotUrl);
    if (customizations.homeFooterMascotAuthor) setHomeFooterMascotAuthor(customizations.homeFooterMascotAuthor);
    if (customizations.trackingBatootMascotUrl) setTrackingBatootMascotUrl(customizations.trackingBatootMascotUrl);
    if (customizations.invoiceHadooshaImageUrl) setInvoiceHadooshaImageUrl(customizations.invoiceHadooshaImageUrl);
    if (customizations.notificationsBannerUrl) setNotificationsBannerUrl(customizations.notificationsBannerUrl);
    
    if (customizations.showBanners !== undefined) setShowBanners(customizations.showBanners);
    if (customizations.showStores !== undefined) setShowStores(customizations.showStores);
    if (customizations.showLoyalty !== undefined) setShowLoyalty(customizations.showLoyalty);
    if (customizations.showAnnouncement !== undefined) setShowAnnouncement(customizations.showAnnouncement);
  }, [customizations]);

  // Confirmation Modal States
  const [showPaymentSaveConfirm, setShowPaymentSaveConfirm] = useState<boolean>(false);
  const [storeToDelete, setStoreToDelete] = useState<StoreCustomization | null>(null);
  const [presetToDelete, setPresetToDelete] = useState<PresetProductCustomization | null>(null);

  // Save General settings to Firebase via context
  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateCustomizations({
        heroImageUrl,
        heroTitle,
        heroSubtitle,
        banners: bannersList,
        showStores,
        showLoyalty,
        showBanners,
        announcementText,
        showAnnouncement,
        rates,
        bankInfo,
        socials,
        homeFooterMascotUrl,
        homeFooterMascotQuote,
        homeFooterMascotAuthor,
        trackingBatootMascotUrl,
        trackingBatootQuote,
        trackingSupportAgentUrl,
        trackingSupportTitle,
        trackingSupportQuote,
        invoiceInstructionText,
        notificationsBannerUrl,
        notificationsWelcomeText,
        invoiceHadooshaImageUrl,
        mastercardExpiry,
        mastercardCvv,
        iraqRates: iraqRatesList
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const handlePaymentFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPaymentSaveConfirm(true);
  };

  const handleConfirmPaymentSave = async () => {
    setShowPaymentSaveConfirm(false);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateCustomizations({
        heroImageUrl,
        heroTitle,
        heroSubtitle,
        showStores,
        showLoyalty,
        showBanners,
        announcementText,
        showAnnouncement,
        rates,
        bankInfo,
        socials,
        homeFooterMascotUrl,
        homeFooterMascotQuote,
        homeFooterMascotAuthor,
        trackingBatootMascotUrl,
        trackingBatootQuote,
        trackingSupportAgentUrl,
        trackingSupportTitle,
        trackingSupportQuote,
        invoiceInstructionText,
        notificationsBannerUrl,
        notificationsWelcomeText,
        invoiceHadooshaImageUrl,
        mastercardExpiry,
        mastercardCvv,
        iraqRates: iraqRatesList
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  // STORE CRUD OPERATIONS
  const handleOpenAddStore = () => {
    setStoreForm({ name: '', rate: '', duration: '', details: '', image: '' });
    setEditingStoreId(null);
    setIsStoreFormOpen(true);
  };

  const handleOpenEditStore = (store: StoreCustomization) => {
    setStoreForm({
      name: store.name,
      rate: store.rate,
      duration: store.duration,
      details: store.details,
      image: store.image || ''
    });
    setEditingStoreId(store.id);
    setIsStoreFormOpen(true);
  };

  const handleSaveStore = async () => {
    if (!storeForm.name) return;

    let updatedStores = [...storesList];
    if (editingStoreId) {
      updatedStores = updatedStores.map(st => 
        st.id === editingStoreId ? { ...st, ...storeForm } : st
      );
    } else {
      const newStore: StoreCustomization = {
        id: 'store_' + Date.now(),
        ...storeForm
      };
      updatedStores = [newStore, ...updatedStores];
    }

    setStoresList(updatedStores);
    setIsStoreFormOpen(false);
    setEditingStoreId(null);

    // Save to firebase
    await updateCustomizations({ supportedStores: updatedStores });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeleteStore = async (id: string) => {
    const updatedStores = storesList.filter(st => st.id !== id);
    setStoresList(updatedStores);
    await updateCustomizations({ supportedStores: updatedStores });
  };


  // PRESET PRODUCT CRUD OPERATIONS
  const handleOpenAddPreset = () => {
    setPresetForm({ name: '', price: '', image: '', category: 'مكياج' });
    setEditingPresetId(null);
    setIsPresetFormOpen(true);
  };

  const handleOpenEditPreset = (preset: PresetProductCustomization) => {
    setPresetForm({
      name: preset.name,
      price: String(preset.price),
      image: preset.image,
      category: preset.category
    });
    setEditingPresetId(preset.id);
    setIsPresetFormOpen(true);
  };

  const handleSavePreset = async () => {
    if (!presetForm.name || !presetForm.price) return;

    let updatedPresets = [...presetsList];
    const priceNum = parseInt(presetForm.price) || 0;

    if (editingPresetId) {
      updatedPresets = updatedPresets.map(pr => 
        pr.id === editingPresetId ? { ...pr, name: presetForm.name, price: priceNum, image: presetForm.image, category: presetForm.category } : pr
      );
    } else {
      const newPreset: PresetProductCustomization = {
        id: 'prod_' + Date.now(),
        name: presetForm.name,
        price: priceNum,
        image: presetForm.image || 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200',
        category: presetForm.category
      };
      updatedPresets = [newPreset, ...updatedPresets];
    }

    setPresetsList(updatedPresets);
    setIsPresetFormOpen(false);
    setEditingPresetId(null);

    // Save to firebase
    await updateCustomizations({ presetProducts: updatedPresets });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeletePreset = async (id: string) => {
    const updatedPresets = presetsList.filter(pr => pr.id !== id);
    setPresetsList(updatedPresets);
    await updateCustomizations({ presetProducts: updatedPresets });
  };

  // Banners actions
  const handleOpenAddBanner = () => {
    setBannerForm({ imageUrl: '', title: '', subtitle: '' });
    setEditingBannerId(null);
    setIsBannerFormOpen(true);
  };

  const handleOpenEditBanner = (banner: BannerItem) => {
    setBannerForm({
      imageUrl: banner.imageUrl,
      title: banner.title,
      subtitle: banner.subtitle || ''
    });
    setEditingBannerId(banner.id);
    setIsBannerFormOpen(true);
  };

  const handleSaveBanner = async () => {
    if (!bannerForm.imageUrl || !bannerForm.title) return;

    let updatedBanners = [...bannersList];

    if (editingBannerId) {
      updatedBanners = updatedBanners.map(bn => 
        bn.id === editingBannerId 
          ? { ...bn, imageUrl: bannerForm.imageUrl, title: bannerForm.title, subtitle: bannerForm.subtitle } 
          : bn
      );
    } else {
      const newBanner: BannerItem = {
        id: 'banner_' + Date.now(),
        imageUrl: bannerForm.imageUrl,
        title: bannerForm.title,
        subtitle: bannerForm.subtitle
      };
      updatedBanners = [...updatedBanners, newBanner];
    }

    setBannersList(updatedBanners);
    setIsBannerFormOpen(false);
    setEditingBannerId(null);

    // Save to firebase
    await updateCustomizations({ banners: updatedBanners });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeleteBanner = async (id: string) => {
    const updatedBanners = bannersList.filter(bn => bn.id !== id);
    setBannersList(updatedBanners);
    await updateCustomizations({ banners: updatedBanners });
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in" id="manager-settings" dir="rtl">
      
      {/* Sub-Tabs Selector */}
      <div className="flex bg-white/95 border border-pink-100 p-1 rounded-2xl shadow-sm justify-between gap-1">
        <button
          onClick={() => setActiveSubTab('ui')}
          className={`flex-1 text-[10px] font-black py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'ui' ? 'bg-pink-100 text-pink-800 shadow-xs' : 'text-gray-500 hover:text-pink-700'
          }`}
        >
          🖥️ واجهة العميل
        </button>
        <button
          onClick={() => setActiveSubTab('shipping_payment')}
          className={`flex-1 text-[10px] font-black py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'shipping_payment' ? 'bg-pink-100 text-pink-800 shadow-xs' : 'text-gray-500 hover:text-pink-700'
          }`}
        >
          💵 الشحن والدفع
        </button>
        <button
          onClick={() => setActiveSubTab('stores')}
          className={`flex-1 text-[10px] font-black py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'stores' ? 'bg-pink-100 text-pink-800 shadow-xs' : 'text-gray-500 hover:text-pink-700'
          }`}
        >
          🛍️ الأقسام والمتاجر
        </button>
        <button
          onClick={() => setActiveSubTab('presets')}
          className={`flex-1 text-[10px] font-black py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'presets' ? 'bg-pink-100 text-pink-800 shadow-xs' : 'text-gray-500 hover:text-pink-700'
          }`}
        >
          💄 معرض المنتجات
        </button>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="bg-green-100 border border-green-200 text-green-800 font-black text-xs p-4 rounded-2xl flex items-center gap-2 shadow-xs animate-bounce justify-center">
          <Check className="w-5 h-5 text-green-700 shrink-0" />
          <span>تم الحفظ والمزامنة الفورية مع جميع زبائن التطبيق! ✓</span>
        </div>
      )}

      {/* SUB-TAB 1: CLIENT HOME INTERFACE TEXTS AND BANNERS */}
      {activeSubTab === 'ui' && (
        <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
          {/* Cover & Hero Banner Image / Multiple Banners Manager */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-4 text-right">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleOpenAddBanner}
                className="bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-black px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة بنر جديد</span>
              </button>
              <h3 className="font-black text-sm text-gray-800 flex items-center gap-1.5">
                <ImageIcon className="w-4.5 h-4.5 text-pink-700" />
                <span>إدارة بنرات الواجهة المتحركة</span>
              </h3>
            </div>

            <span className="text-[10px] text-gray-400 block -mt-1">
              أضيفي أو عدلي البنرات الترويجية المتحركة التي تظهر للزبائن في الصفحة الرئيسية للتطبيق. يمكنكِ ترتيب العروض والإعلانات بسهولة.
            </span>

            {/* Banners List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {bannersList.map((banner) => (
                <div key={banner.id} className="border border-pink-100/60 rounded-2xl p-3.5 space-y-3 bg-pink-50/20 relative group hover:border-pink-200 transition-all">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-pink-100/40">
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-1 pr-1">
                    <h4 className="font-bold text-xs text-gray-800">{banner.title}</h4>
                    {banner.subtitle && (
                      <p className="text-[10px] text-gray-500">{banner.subtitle}</p>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end pt-1 border-t border-dashed border-pink-100/40">
                    <button
                      type="button"
                      onClick={() => handleOpenEditBanner(banner)}
                      className="text-pink-700 hover:text-pink-900 text-[10px] font-bold px-2 py-1 rounded-lg bg-pink-100/50 hover:bg-pink-100 transition-all cursor-pointer"
                    >
                      تعديل البنر
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerToDelete(banner)}
                      className="text-red-600 hover:text-red-800 text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition-all cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add/Edit Banner Dialog/Form inline */}
            {isBannerFormOpen && (
              <div className="border border-pink-100 bg-pink-50/30 rounded-2xl p-5 space-y-4 animate-fade-in mt-4">
                <h4 className="font-bold text-xs text-pink-900 border-b border-dashed border-pink-200 pb-2">
                  {editingBannerId ? 'تعديل بنر' : 'إضافة بنر جديد للواجهة'}
                </h4>
                <div className="space-y-3">
                  <ImageUploaderWidget
                    label="صورة البنر *"
                    value={bannerForm.imageUrl}
                    onChange={(val) => setBannerForm({ ...bannerForm, imageUrl: val })}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-gray-500 mb-1">العنوان الرئيسي للبنر *</label>
                      <input 
                        type="text"
                        value={bannerForm.title}
                        onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                        className="w-full bg-white border border-pink-100 focus:border-pink-300 text-xs px-4 py-2.5 rounded-xl font-bold"
                        placeholder="خصومات وعروض مميزة!"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-500 mb-1">العنوان الفرعي للبنر (اختياري)</label>
                      <input 
                        type="text"
                        value={bannerForm.subtitle}
                        onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                        className="w-full bg-white border border-pink-100 focus:border-pink-300 text-xs px-4 py-2.5 rounded-xl"
                        placeholder="خصم 30% على مستحضرات التجميل"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBannerFormOpen(false);
                        setEditingBannerId(null);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-black px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveBanner}
                      className="bg-pink-700 hover:bg-pink-800 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      حفظ البنر
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Backwards Compatibility / Other General UI Texts */}
            <div className="pt-4 border-t border-dashed border-pink-100 space-y-4">
              <h4 className="font-bold text-xs text-gray-700">نصوص الواجهة الافتراضية والترحيبية</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1">العنوان الترحيبي الافتراضي</label>
                  <input 
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-bold"
                    placeholder="مرحباً، {name}!"
                  />
                  <span className="text-[8px] text-gray-400 block mt-0.5">استخدمي {'{name}'} ليتم استبداله باسم العميل تلقائياً.</span>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1">العنوان الفرعي الافتراضي</label>
                  <input 
                    type="text"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-semibold"
                    placeholder="أهلاً بكِ في عالم هدوشة وبطوط"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-pink-100/60 mt-3">
                <ImageUploaderWidget
                  label="صورة الغلاف/الهيدر الرئيسي للتطبيق (Hero Image)"
                  value={heroImageUrl}
                  onChange={setHeroImageUrl}
                />
                <span className="text-[9px] text-gray-400 mt-1 block">الصورة الرئيسية التي تظهر في ترويسة الشاشة الرئيسية للزبائن.</span>
              </div>

              {heroImageUrl && (
                <div className="relative w-full h-24 rounded-2xl overflow-hidden border border-pink-100 mx-auto mt-2">
                  <img src={heroImageUrl} alt="Hero Image Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white font-bold text-[7px] px-2 py-0.5 rounded-full whitespace-nowrap">معاينة الغلاف</span>
                </div>
              )}

              <div className="pt-2 border-t border-dashed border-pink-100/60 mt-3">
                <ImageUploaderWidget
                  label="صورة الترحيب بصفحة الفواتير (هدوشة)"
                  value={invoiceHadooshaImageUrl}
                  onChange={setInvoiceHadooshaImageUrl}
                />
                <span className="text-[9px] text-gray-400 mt-1 block">يمكنكِ تغيير أو رفع الصورة الترحيبية للعميل في صفحة الفواتير.</span>
              </div>

              {invoiceHadooshaImageUrl && (
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-pink-100 mx-auto mt-2">
                  <img src={invoiceHadooshaImageUrl} alt="Invoice Image Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white font-bold text-[7px] px-2 py-0.5 rounded-full whitespace-nowrap">معاينة الصورة</span>
                </div>
              )}
            </div>
          </div>

          {/* Announcement Bar Settings */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-4 text-right">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-pink-700" />
              <span>شريط الإعلانات المتحرك</span>
            </h3>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-xs font-black text-gray-800">تفعيل شريط الإعلان المتميز</p>
                  <p className="text-[9px] text-gray-400">يظهر أعلى الصفحة الرئيسية للزبائن</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={showAnnouncement} 
                  onChange={(e) => setShowAnnouncement(e.target.checked)}
                  className="rounded text-pink-700 focus:ring-pink-500 w-4.5 h-4.5 cursor-pointer" 
                />
              </div>

              {showAnnouncement && (
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1">نص الإعلان</label>
                  <textarea 
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    rows={2}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-3 rounded-xl font-bold"
                    placeholder="اكتبي نص ترويجي جذاب..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Toggle Screens & Features */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-4 text-right">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-1.5">
              <Eye className="w-4.5 h-4.5 text-pink-700" />
              <span>ظهور مكونات الواجهة لعملاء التطبيق</span>
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl">
                <span className="text-xs font-black text-gray-700">البنرات الإعلانية الترحيبية</span>
                <input 
                  type="checkbox" 
                  checked={showBanners} 
                  onChange={(e) => setShowBanners(e.target.checked)}
                  className="rounded text-pink-700 focus:ring-pink-500 w-4.5 h-4.5 cursor-pointer" 
                />
              </div>
              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl">
                <span className="text-xs font-black text-gray-700">بطاقة النقاط والولاء الأنيقة</span>
                <input 
                  type="checkbox" 
                  checked={showLoyalty} 
                  onChange={(e) => setShowLoyalty(e.target.checked)}
                  className="rounded text-pink-700 focus:ring-pink-500 w-4.5 h-4.5 cursor-pointer" 
                />
              </div>
              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl">
                <span className="text-xs font-black text-gray-700">أقسام ومتاجر التسوق المدعومة</span>
                <input 
                  type="checkbox" 
                  checked={showStores} 
                  onChange={(e) => setShowStores(e.target.checked)}
                  className="rounded text-pink-700 focus:ring-pink-500 w-4.5 h-4.5 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          {/* 1. Home Footer Mascot Customization */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-4 text-right">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-1.5">
              <Smile className="w-4.5 h-4.5 text-pink-700" />
              <span>توقيع المساعدين وصورة Mascot (أسفل الشاشة الرئيسية والملف)</span>
            </h3>

            <div className="space-y-3.5">
              <ImageUploaderWidget
                label="صورة المساعدين (Mascot)"
                value={homeFooterMascotUrl}
                onChange={setHomeFooterMascotUrl}
              />

              {homeFooterMascotUrl && (
                <div className="flex justify-center p-2 bg-gray-50 rounded-xl">
                  <img src={homeFooterMascotUrl} alt="Mascot Preview" className="h-16 object-contain" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1">اسم المساعدين / التوقيع</label>
                  <input 
                    type="text"
                    value={homeFooterMascotAuthor}
                    onChange={(e) => setHomeFooterMascotAuthor(e.target.value)}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-bold"
                    placeholder="مثال: هدوشة وبطوط"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1">مقولة / نص توقيع المساعدين</label>
                  <input 
                    type="text"
                    value={homeFooterMascotQuote}
                    onChange={(e) => setHomeFooterMascotQuote(e.target.value)}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-semibold"
                    placeholder="عزيزتي {name}، جمالك يبدأ من اهتمامك..."
                  />
                  <span className="text-[8px] text-gray-400 block mt-0.5">استخدمي {'{name}'} لاستبداله باسم الزبونة تلقائياً.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Tracking Page Mascot & Support Customization */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-4 text-right">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-1.5">
              <Truck className="w-4.5 h-4.5 text-pink-700" />
              <span>تخصيص صفحة تتبع الشحنات والمسؤولين</span>
            </h3>

            <div className="space-y-4">
              {/* Batoot Tracker Section */}
              <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                <h4 className="font-bold text-xs text-pink-800 border-b border-pink-100/50 pb-1.5">🤖 مساعد التتبع الذكي (بطوط)</h4>
                
                <ImageUploaderWidget
                  label="صورة مساعد التتبع (بطوط)"
                  value={trackingBatootMascotUrl}
                  onChange={setTrackingBatootMascotUrl}
                />

                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1">مقولة / رسالة مساعد التتبع</label>
                  <input 
                    type="text"
                    value={trackingBatootQuote}
                    onChange={(e) => setTrackingBatootQuote(e.target.value)}
                    className="w-full bg-white border-0 text-xs px-4 py-2.5 rounded-xl font-semibold"
                    placeholder="أتابع تحركاتها عبر الخط الجوي لحظة بلحظة..."
                  />
                </div>
              </div>

              {/* Support Card Section */}
              <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                <h4 className="font-bold text-xs text-pink-800 border-b border-pink-100/50 pb-1.5">👩‍💼 مسؤول الدعم اللوجستي</h4>
                
                <ImageUploaderWidget
                  label="صورة مسؤول الدعم اللوجستي"
                  value={trackingSupportAgentUrl}
                  onChange={setTrackingSupportAgentUrl}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-1">عنوان بطاقة الدعم</label>
                    <input 
                      type="text"
                      value={trackingSupportTitle}
                      onChange={(e) => setTrackingSupportTitle(e.target.value)}
                      className="w-full bg-white border-0 text-xs px-4 py-2.5 rounded-xl font-bold"
                      placeholder="مثال: هل تحتاجين لمساعدة؟"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-1">نص المساعدة والترحيب</label>
                    <input 
                      type="text"
                      value={trackingSupportQuote}
                      onChange={(e) => setTrackingSupportQuote(e.target.value)}
                      className="w-full bg-white border-0 text-xs px-4 py-2.5 rounded-xl font-semibold"
                      placeholder="خبراء الدعم اللوجستي متواجدون لمساعدتكِ..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Invoices Page Instructions Customization */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-4 text-right">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-1.5">
              <FileText className="w-4.5 h-4.5 text-pink-700" />
              <span>تعليمات الدفع والتحويل (صفحة الفواتير)</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1">تعليمات الدفع الرسمية المخصصة بالفاتورة</label>
                <textarea 
                  value={invoiceInstructionText}
                  onChange={(e) => setInvoiceInstructionText(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-3 rounded-xl font-semibold"
                  placeholder="اكتبي إرشادات تحويل الأموال وتأكيد إيصال الدفع..."
                />
                <span className="text-[8px] text-gray-400 block mt-1">تظهر هذه الملاحظة أسفل الفاتورة لمساعدة العميل في إتمام تحويل زين كاش والتحقق.</span>
              </div>
            </div>
          </div>

          {/* 4. Notifications Page Customization */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-4 text-right">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-1.5">
              <Bell className="w-4.5 h-4.5 text-pink-700" />
              <span>تخصيص غلاف مركز التنبيهات</span>
            </h3>

            <div className="space-y-3.5">
              <ImageUploaderWidget
                label="صورة/بنر ترحيب التنبيهات"
                value={notificationsBannerUrl}
                onChange={setNotificationsBannerUrl}
              />

              {notificationsBannerUrl && (
                <div className="relative w-full h-20 rounded-xl overflow-hidden border border-pink-100">
                  <img src={notificationsBannerUrl} alt="Notifications Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1">عنوان ترحيب مركز الإشعارات</label>
                <input 
                  type="text"
                  value={notificationsWelcomeText}
                  onChange={(e) => setNotificationsWelcomeText(e.target.value)}
                  className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-bold"
                  placeholder="مثال: مركز التنبيهات والتحديثات المباشرة..."
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button 
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-pink-700 to-rose-600 text-white font-black text-xs py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4.5 h-4.5 text-white" />
            <span>{isSaving ? 'جاري الحفظ والمزامنة...' : 'حفظ ومزامنة واجهة العميل الفورية 💖'}</span>
          </button>
        </form>
      )}

      {/* SUB-TAB 2: LOCAL DELIVERY RATES & BANK PAYMENT METHODS */}
      {activeSubTab === 'shipping_payment' && (
        <form onSubmit={handlePaymentFormSubmit} className="space-y-6">
          
          {/* Local Shipping Rates (Iraq Provinces Customization) */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-4 text-right">
            <h3 className="font-black text-sm text-gray-800 flex items-center justify-between border-b border-pink-50 pb-3">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4.5 h-4.5 text-pink-700" />
                <span>إدارة أسعار شحن وتوصيل محافظات العراق (كاملة التحكم)</span>
              </span>
              <span className="text-[10px] text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full font-bold">
                {iraqRatesList.length} محافظة/منطقة
              </span>
            </h3>

            {/* Quick Add Form */}
            <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-3">
              <h4 className="text-[11px] font-black text-gray-700">إضافة محافظة/منطقة توصيل جديدة</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-gray-500 mb-1">اسم المحافظة أو المنطقة</label>
                  <input 
                    type="text"
                    value={newProvinceName}
                    onChange={(e) => setNewProvinceName(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-pink-300 text-xs px-3 py-2 rounded-xl font-bold focus:outline-none text-right"
                    placeholder="مثال: ذي قار"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-500 mb-1">سعر التوصيل</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newProvinceRate}
                      onChange={(e) => setNewProvinceRate(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-pink-300 text-xs px-3 py-2 rounded-xl font-bold focus:outline-none text-right"
                      placeholder="مثال: 5,000 د.ع"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newProvinceName.trim() || !newProvinceRate.trim()) return;
                        setIraqRatesList([
                          ...iraqRatesList,
                          { province: newProvinceName.trim(), rate: newProvinceRate.trim() }
                        ]);
                        setNewProvinceName('');
                        setNewProvinceRate('');
                      }}
                      className="bg-pink-700 hover:bg-pink-800 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Provinces List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {iraqRatesList.map((item, idx) => {
                const isEditing = editingProvinceIndex === idx;
                return (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl hover:border-pink-100 transition-all text-xs"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full">
                        <input 
                          type="text"
                          defaultValue={item.province}
                          id={`edit-prov-name-${idx}`}
                          className="bg-gray-50 border border-gray-200 text-xs px-3 py-1.5 rounded-xl font-bold focus:outline-none w-1/2 text-right"
                        />
                        <input 
                          type="text"
                          defaultValue={item.rate}
                          id={`edit-prov-rate-${idx}`}
                          className="bg-gray-50 border border-gray-200 text-xs px-3 py-1.5 rounded-xl font-bold focus:outline-none w-1/2 text-right"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nameEl = document.getElementById(`edit-prov-name-${idx}`) as HTMLInputElement;
                            const rateEl = document.getElementById(`edit-prov-rate-${idx}`) as HTMLInputElement;
                            if (nameEl && rateEl) {
                              const updated = iraqRatesList.map((prov, pIdx) => 
                                pIdx === idx ? { province: nameEl.value, rate: rateEl.value } : prov
                              );
                              setIraqRatesList(updated);
                              setEditingProvinceIndex(null);
                            }
                          }}
                          className="bg-green-600 text-white font-black px-3 py-1.5 rounded-xl hover:bg-green-700 transition-colors cursor-pointer shrink-0"
                        >
                          حفظ
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProvinceIndex(null)}
                          className="bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-xl hover:bg-gray-300 transition-colors cursor-pointer shrink-0"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-pink-700/70" />
                          <div>
                            <span className="font-extrabold text-gray-800">{item.province}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="font-black text-pink-700">{item.rate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingProvinceIndex(idx)}
                            className="p-1.5 hover:bg-pink-50 text-pink-700 rounded-lg transition-colors cursor-pointer"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = iraqRatesList.filter((_, pIdx) => pIdx !== idx);
                              setIraqRatesList(updated);
                            }}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {iraqRatesList.length === 0 && (
                <p className="text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                  لا يوجد محافظات مسجلة حالياً. أضيفي محافظة جديدة من النموذج أعلاه.
                </p>
              )}
            </div>
          </div>

          {/* Bank & Mastercard Info */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-4 text-right">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-1.5">
              <Wallet className="w-4.5 h-4.5 text-pink-700" />
              <span>بيانات بطاقة Master Card المعتمدة للمديرة</span>
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1">رقم بطاقة Master Card</label>
                <input 
                  type="text"
                  value={bankInfo.superkey}
                  onChange={(e) => setBankInfo({ ...bankInfo, superkey: e.target.value })}
                  className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-mono text-left font-black"
                  placeholder="5412 7500 1234 5678"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1">اسم صاحب بطاقة Master Card (بطاقة المديرة)</label>
                <input 
                  type="text"
                  value={bankInfo.holderName}
                  onChange={(e) => setBankInfo({ ...bankInfo, holderName: e.target.value })}
                  className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-black"
                  placeholder="HUDA AL-SULTANI"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1">تاريخ انتهاء بطاقة Master Card</label>
                  <input 
                    type="text"
                    value={mastercardExpiry}
                    onChange={(e) => setMastercardExpiry(e.target.value)}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-mono text-left font-black"
                    placeholder="12/28"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1">رمز الأمان (CVV)</label>
                  <input 
                    type="text"
                    value={mastercardCvv}
                    onChange={(e) => setMastercardCvv(e.target.value)}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-mono text-left font-black"
                    placeholder="345"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-4 text-right">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-1.5">
              <LinkIcon className="w-4.5 h-4.5 text-pink-700" />
              <span>معلومات التواصل والشبكات الاجتماعية</span>
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1">رقم الواتساب الرسمي (WhatsApp)</label>
                <input 
                  type="text"
                  value={socials.whatsapp}
                  onChange={(e) => setSocials({ ...socials, whatsapp: e.target.value })}
                  className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-bold text-left"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1">حساب الإنستغرام</label>
                  <input 
                    type="text"
                    value={socials.instagram}
                    onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-bold text-left"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1">رابط الموقع الإلكتروني</label>
                  <input 
                    type="text"
                    value={socials.website}
                    onChange={(e) => setSocials({ ...socials, website: e.target.value })}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-bold text-left"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button 
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-pink-700 to-rose-600 text-white font-black text-xs py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4.5 h-4.5 text-white" />
            <span>{isSaving ? 'جاري الحفظ والمزامنة...' : 'حفظ ومزامنة بوابات الدفع والتوصيل 💖'}</span>
          </button>
        </form>
      )}

      {/* SUB-TAB 3: STORES & DEPARTMENTS CRUD */}
      {activeSubTab === 'stores' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 border border-pink-100 rounded-3xl shadow-xs">
            <div>
              <h3 className="font-black text-sm text-gray-800">الأقسام والمتاجر</h3>
              <p className="text-[10px] text-gray-400">تحكم كامل بالأقسام المعروضة لزبائن التطبيق</p>
            </div>
            <button
              onClick={handleOpenAddStore}
              className="bg-pink-700 text-white font-black text-[10px] px-3.5 py-2 rounded-xl hover:bg-pink-800 flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قسم جديد</span>
            </button>
          </div>

          {/* STORE CRUD FORM MODAL/DRAWER */}
          {isStoreFormOpen && (
            <div className="bg-pink-50/70 border border-pink-200/50 rounded-3xl p-5 space-y-4 shadow-inner text-right animate-fade-in">
              <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                <span className="text-xs font-black text-pink-900">
                  {editingStoreId ? 'تعديل بيانات القسم الحالي' : 'إنشاء قسم أو متجر شحن جديد'}
                </span>
                <button 
                  onClick={() => setIsStoreFormOpen(false)}
                  className="text-pink-950 font-bold text-xs"
                >
                  إلغاء ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-1">اسم القسم/المتجر</label>
                    <input 
                      type="text"
                      value={storeForm.name}
                      onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                      className="w-full bg-white border border-pink-100 focus:outline-none text-xs px-3 py-2 rounded-xl font-bold"
                      placeholder="Shein الامارات، تريندول..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-1">سعر الشحن لكل كغم</label>
                    <input 
                      type="text"
                      value={storeForm.rate}
                      onChange={(e) => setStoreForm({ ...storeForm, rate: e.target.value })}
                      className="w-full bg-white border border-pink-100 focus:outline-none text-xs px-3 py-2 rounded-xl font-bold"
                      placeholder="12,000 د.ع / كغم"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-1">المدة المتوقعة للوصول</label>
                    <input 
                      type="text"
                      value={storeForm.duration}
                      onChange={(e) => setStoreForm({ ...storeForm, duration: e.target.value })}
                      className="w-full bg-white border border-pink-100 focus:outline-none text-xs px-3 py-2 rounded-xl font-bold"
                      placeholder="7 - 10 أيام شحن جوي"
                    />
                  </div>
                  <div>
                    <ImageUploaderWidget
                      label="صورة أو شعار المتجر (اختياري)"
                      value={storeForm.image}
                      onChange={(val) => setStoreForm({ ...storeForm, image: val })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1">تفاصيل ومميزات القسم</label>
                  <textarea 
                    value={storeForm.details}
                    onChange={(e) => setStoreForm({ ...storeForm, details: e.target.value })}
                    rows={2.5}
                    className="w-full bg-white border border-pink-100 focus:outline-none text-xs px-3 py-2 rounded-xl font-bold"
                    placeholder="تفاصيل دقيقة تظهر للزبون عند النقر..."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveStore}
                  className="w-full bg-pink-700 hover:bg-pink-800 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {editingStoreId ? 'حفظ التعديلات الحالية ✓' : 'إضافة القسم لعملاء التطبيق فوراً 🚀'}
                </button>
              </div>
            </div>
          )}

          {/* LIST OF STORES GRID */}
          <div className="grid grid-cols-1 gap-3">
            {storesList.map((store) => (
              <div 
                key={store.id} 
                className="bg-white p-4 rounded-2xl border border-pink-50 flex items-center justify-between shadow-xs hover:border-pink-200 transition-all text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-pink-50 flex items-center justify-center shrink-0 border border-pink-100">
                    {store.image ? (
                      <img src={store.image} alt={store.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Layers className="w-6 h-6 text-pink-700" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-gray-800">{store.name}</h4>
                    <p className="text-[9.5px] text-pink-700 font-bold">{store.rate} • {store.duration}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5 line-clamp-1 truncate font-semibold w-56">{store.details}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEditStore(store)}
                    className="p-1.5 text-gray-500 hover:text-pink-700 hover:bg-pink-50 rounded-lg transition-all cursor-pointer"
                    title="تعديل"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStoreToDelete(store)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {storesList.length === 0 && (
              <p className="text-center py-10 text-xs text-gray-400 bg-white/50 rounded-2xl border border-pink-50">لا يوجد متاجر أو أقسام حالياً. أضيفي متجراً للبدء!</p>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PRESET PRODUCTS CRUD GALLERY */}
      {activeSubTab === 'presets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 border border-pink-100 rounded-3xl shadow-xs">
            <div>
              <h3 className="font-black text-sm text-gray-800">معرض المنتجات الجاهزة</h3>
              <p className="text-[10px] text-gray-400">تسهيل تعبئة الفواتير عبر منتجات جاهزة ومعرفة أسعارها</p>
            </div>
            <button
              onClick={handleOpenAddPreset}
              className="bg-pink-700 text-white font-black text-[10px] px-3.5 py-2 rounded-xl hover:bg-pink-800 flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جاهز</span>
            </button>
          </div>

          {/* PRESET CRUD FORM MODAL */}
          {isPresetFormOpen && (
            <div className="bg-pink-50/70 border border-pink-200/50 rounded-3xl p-5 space-y-4 shadow-inner text-right animate-fade-in">
              <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                <span className="text-xs font-black text-pink-900">
                  {editingPresetId ? 'تعديل بيانات المنتج الحالي' : 'إضافة منتج جديد للمعرض الجاهز'}
                </span>
                <button 
                  onClick={() => setIsPresetFormOpen(false)}
                  className="text-pink-950 font-bold text-xs"
                >
                  إلغاء ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-1">اسم المنتج</label>
                    <input 
                      type="text"
                      value={presetForm.name}
                      onChange={(e) => setPresetForm({ ...presetForm, name: e.target.value })}
                      className="w-full bg-white border border-pink-100 focus:outline-none text-xs px-3 py-2 rounded-xl font-bold"
                      placeholder="أحمر شفاه هدى بيوتي، عطر ديور..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-1">السعر (د.ع)</label>
                    <input 
                      type="number"
                      value={presetForm.price}
                      onChange={(e) => setPresetForm({ ...presetForm, price: e.target.value })}
                      className="w-full bg-white border border-pink-100 focus:outline-none text-xs px-3 py-2 rounded-xl font-bold"
                      placeholder="15000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-1">الفئة</label>
                    <select 
                      value={presetForm.category}
                      onChange={(e) => setPresetForm({ ...presetForm, category: e.target.value })}
                      className="w-full bg-white border border-pink-100 focus:outline-none text-xs px-3 py-2 rounded-xl font-bold"
                    >
                      <option value="مكياج">مكياج</option>
                      <option value="عطور">عطور</option>
                      <option value="حقائب">حقائب</option>
                      <option value="عناية بالبشرة">عناية بالبشرة</option>
                      <option value="ملابس">ملابس</option>
                    </select>
                  </div>
                  <div>
                    <ImageUploaderWidget
                      label="صورة المنتج"
                      value={presetForm.image}
                      onChange={(val) => setPresetForm({ ...presetForm, image: val })}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSavePreset}
                  className="w-full bg-pink-700 hover:bg-pink-800 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {editingPresetId ? 'حفظ التعديلات الحالية ✓' : 'إضافة المنتج للمعرض الجاهز فوراً 🚀'}
                </button>
              </div>
            </div>
          )}

          {/* LIST OF PRESET PRODUCTS */}
          <div className="grid grid-cols-2 gap-3">
            {presetsList.map((preset) => (
              <div 
                key={preset.id} 
                className="bg-white p-3.5 rounded-2xl border border-pink-50 flex flex-col justify-between shadow-xs hover:border-pink-200 transition-all text-right h-48"
              >
                <div className="space-y-2">
                  <div className="w-full h-20 rounded-xl overflow-hidden bg-pink-50 relative border border-pink-100">
                    <img 
                      src={preset.image || 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200'} 
                      alt={preset.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                    <span className="absolute bottom-1 right-1 bg-pink-700 text-white font-bold text-[7.5px] px-1.5 py-0.5 rounded-full">
                      {preset.category}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-[10.5px] text-gray-800 line-clamp-1 truncate leading-tight">{preset.name}</h4>
                    <p className="text-[10px] text-pink-700 font-extrabold mt-0.5">{(preset.price).toLocaleString()} د.ع</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 border-t border-pink-50 pt-1.5 mt-2">
                  <button
                    onClick={() => handleOpenEditPreset(preset)}
                    className="p-1 text-gray-500 hover:text-pink-700 hover:bg-pink-50 rounded-lg transition-all cursor-pointer text-[10px] flex items-center gap-1 font-bold"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>تعديل</span>
                  </button>
                  <span className="text-gray-200">|</span>
                  <button
                    onClick={() => setPresetToDelete(preset)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer text-[10px] flex items-center gap-1 font-bold"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ))}

            {presetsList.length === 0 && (
              <p className="col-span-2 text-center py-10 text-xs text-gray-400 bg-white/50 rounded-2xl border border-pink-50">لا يوجد منتجات جاهزة في المعرض حالياً. أضيفي منتجاً للبدء!</p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Payment and Rates Save */}
      {showPaymentSaveConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl text-center space-y-4 border border-pink-100" dir="rtl">
            <div className="w-14 h-14 bg-pink-50 text-pink-700 rounded-full flex items-center justify-center mx-auto border border-pink-100/50">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-gray-800 text-sm">تأكيد تعديل وحفظ البيانات المالية؟</h4>
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed font-bold">
                أنتِ على وشك تعديل بيانات مالية حساسة تشمل أسعار توصيل المحافظات العراقية أو معلومات بطاقة الـ Master Card الخاصة بالإدارة. سيتم تحديث هذه البيانات ومزامنتها فوراً مع كافة فواتير وحسابات زبونات التطبيق.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={handleConfirmPaymentSave}
                className="flex-1 bg-gradient-to-r from-pink-700 to-rose-600 text-white text-[11px] font-black py-3 rounded-2xl active:scale-95 transition-all cursor-pointer shadow-md"
              >
                تأكيد الحفظ والمزامنة 💖
              </button>
              <button 
                onClick={() => setShowPaymentSaveConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-500 text-[11px] font-black py-3 rounded-2xl active:scale-95 transition-all cursor-pointer"
              >
                تراجع وإلغاء ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Store/Department Deletion */}
      {storeToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl text-center space-y-4 border border-red-50" dir="rtl">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100/50">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-gray-800 text-sm">حذف قسم المتجر نهائياً؟</h4>
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed font-bold">
                هل أنتِ متأكدة من حذف قسم <span className="text-pink-700 font-extrabold">"{storeToDelete.name}"</span>؟
                هذا الإجراء سيؤدي لإزالة القسم ومعدلات شحنه تماماً من لوحة تحكم العملاء.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={() => {
                  handleDeleteStore(storeToDelete.id);
                  setStoreToDelete(null);
                }}
                className="flex-1 bg-red-600 text-white text-[11px] font-black py-3 rounded-2xl active:scale-95 transition-all cursor-pointer shadow-md"
              >
                نعم، احذفي القسم 🗑️
              </button>
              <button 
                onClick={() => setStoreToDelete(null)}
                className="flex-1 bg-gray-100 text-gray-500 text-[11px] font-black py-3 rounded-2xl active:scale-95 transition-all cursor-pointer"
              >
                إلغاء وتراجع ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Preset Product Deletion */}
      {presetToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl text-center space-y-4 border border-red-50" dir="rtl">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100/50">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-gray-800 text-sm">حذف منتج من المعرض?</h4>
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed font-bold">
                هل أنتِ متأكدة من حذف منتج <span className="text-pink-700 font-extrabold">"{presetToDelete.name}"</span>؟
                سيتم إزالة هذا المنتج من معرض المنتجات الجاهزة لإدخال الفواتير السريعة.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={() => {
                  handleDeletePreset(presetToDelete.id);
                  setPresetToDelete(null);
                }}
                className="flex-1 bg-red-600 text-white text-[11px] font-black py-3 rounded-2xl active:scale-95 transition-all cursor-pointer shadow-md"
              >
                نعم، احذفي المنتج 🗑️
              </button>
              <button 
                onClick={() => setPresetToDelete(null)}
                className="flex-1 bg-gray-100 text-gray-500 text-[11px] font-black py-3 rounded-2xl active:scale-95 transition-all cursor-pointer"
              >
                إلغاء وتراجع ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Banner Deletion */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl text-center space-y-4 border border-red-50" dir="rtl">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100/50">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-gray-800 text-sm">حذف البنر الإعلاني؟</h4>
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed font-bold">
                هل أنتِ متأكدة من حذف البنر <span className="text-pink-700 font-extrabold">"{bannerToDelete.title}"</span>؟
                سيتم إزالة هذا البنر فوراً من شريط العرض المتحرك في الواجهة الرئيسية للزبائن.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={() => {
                  handleDeleteBanner(bannerToDelete.id);
                  setBannerToDelete(null);
                }}
                className="flex-1 bg-red-600 text-white text-[11px] font-black py-3 rounded-2xl active:scale-95 transition-all cursor-pointer shadow-md animate-pulse"
              >
                نعم، احذفي البنر 🗑️
              </button>
              <button 
                onClick={() => setBannerToDelete(null)}
                className="flex-1 bg-gray-100 text-gray-500 text-[11px] font-black py-3 rounded-2xl active:scale-95 transition-all cursor-pointer"
              >
                إلغاء وتراجع ✕
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
