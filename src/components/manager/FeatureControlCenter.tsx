import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sparkles, 
  ToggleLeft, 
  ToggleRight, 
  Sliders, 
  HelpCircle, 
  Save, 
  Plus, 
  Trash2, 
  Folder, 
  CheckCircle, 
  Info,
  SlidersHorizontal,
  X,
  Zap,
  Gift,
  Heart,
  Timer,
  Video,
  Box,
  TrendingUp,
  Brain,
  ShieldCheck,
  Crown,
  Volume2,
  Tv,
  MapPin,
  ListOrdered,
  Sparkle
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

export interface FeatureItem {
  id: string;
  title: string;
  desc: string;
  category: string;
  enabled: boolean;
  config: Record<string, any>;
  permissions?: string[];
  analytics?: {
    views?: number;
    clicks?: number;
    successRate?: number;
  };
}

const DEFAULT_ECOSYSTEM_FEATURES: FeatureItem[] = [
  {
    id: 'smartGiftFinder',
    title: 'مساعد الهدايا الذكي 🎁',
    desc: 'اقتراح هدايا مخصصة حسب الميزانية والعمر والمناسبة ونمط الذوق.',
    category: 'تجربة الزبونة',
    enabled: true,
    config: {
      budgetRanges: '25,000 د.ع - 50,000 د.ع, 50,000 د.ع - 100,000 د.ع, 100,000 د.ع+',
      giftCategories: 'حقائب, عطور, مكياج, إكسسوارات',
      recommendationRules: 'تفضيل العطور الفاخرة في المناسبات السنوية',
      allowCustomStyle: true
    },
    analytics: { views: 320, clicks: 145, successRate: 85 }
  },
  {
    id: 'aiBeautyConsultant',
    title: 'مستشارة التجميل الذكية 💄',
    desc: 'تحليل نوع البشرة والشعر واقتراح الروتين المناسب والمنتجات الملائمة.',
    category: 'تجربة الزبونة',
    enabled: true,
    config: {
      skinTypes: 'دهنية, جافة, مختلطة, حساسة',
      beautyGoals: 'نضارة وتفتيح, معالجة حب الشباب, ترطيب عميق, تجديد البشرة',
      knowledgeBase: 'سيروم اوباجي فيتامين سي يناسب كافة أنواع البشرة عدا الحساسة جداً',
      recommendationLogic: 'الذكاء الاصطناعي التوليدي'
    },
    analytics: { views: 480, clicks: 210, successRate: 92 }
  },
  {
    id: 'aiOutfitStylist',
    title: 'منسق الأزياء الذكي 👗',
    desc: 'اقتراح تنسيقات متكاملة (حقائب، أحذية، عطور) لكل منتج يتم تصفحه.',
    category: 'تجربة الزبونة',
    enabled: true,
    config: {
      suggestMatchingClothing: true,
      suggestBags: true,
      suggestShoes: true,
      suggestAccessories: true,
      suggestPerfumes: true,
      outfitRules: 'تنسيق حقيبة ليدي ديور مع عطور فرنسية باردة'
    },
    analytics: { views: 290, clicks: 95, successRate: 78 }
  },
  {
    id: 'liveShoppingActivity',
    title: 'نشاط التسوق المباشر والـ Social Proof 🔥',
    desc: 'إظهار إشعارات تفاعلية حية تثير الحماس لدى المتصفحين (سارة اشترت..).',
    category: 'دليل اجتماعي',
    enabled: true,
    config: {
      notificationFrequencySeconds: 15,
      fakeMode: true,
      displayRules: 'عشوائي في المحافظات الرئيسية',
      cities: 'بغداد, البصرة, النجف, أربيل, الموصل, بابل'
    },
    analytics: { views: 890, clicks: 430, successRate: 88 }
  },
  {
    id: 'customerAchievements',
    title: 'نظام إنجازات الزبونة 🏆',
    desc: 'تحفيز الزبونات بميداليات وأوسمة تفاعلية عند إتمام عمليات الشراء.',
    category: 'الألعاب والولاء',
    enabled: true,
    config: {
      firstPurchaseRewardPoints: 100,
      fivePurchasesBadge: 'تاج الأناقة البرونزي',
      tenPurchasesBadge: 'الميدالية الماسية الملكية',
      vipBadgeDesign: 'royal_gold_shield'
    },
    analytics: { views: 150, clicks: 60, successRate: 95 }
  },
  {
    id: 'dailyRewardWheel',
    title: 'عجلة المكافآت اليومية 🎡',
    desc: 'توفير عجلة حظ يومية لربح نقاط ولاء، توصيل مجاني، أو خصومات فورية.',
    category: 'الألعاب والولاء',
    enabled: true,
    config: {
      dailyLimitPerUser: 1,
      rewards: 'خصم 10%, توصيل مجاني, 500 نقطة ولاء, هدية مجانية مخملية',
      probabilityDistribution: 'توازن عادل (أغلبها نقاط وتوصيل مجاني)'
    },
    analytics: { views: 670, clicks: 450, successRate: 98 }
  },
  {
    id: 'socialProof',
    title: 'نظام إحصائيات التفاعل والشعبية ❤️',
    desc: 'عرض عدد الأشخاص الذين يشاهدون المنتج أو يحفظونه في قائمة الأمنيات حالياً.',
    category: 'دليل اجتماعي',
    enabled: true,
    config: {
      wishlistCountOffset: 12,
      viewCountOffset: 24,
      purchaseCountOffset: 6,
      displayThreshold: 3
    },
    analytics: { views: 1200, clicks: 350, successRate: 82 }
  },
  {
    id: 'countdownPromotions',
    title: 'مؤقتات العد التنازلي الترويجية ⏳',
    desc: 'خلق حالة من الاستعجال الإيجابي عبر مؤقتات مبيعات ومضية حية.',
    category: 'التسويق والمبيعات',
    enabled: true,
    config: {
      endTime: '2026-07-15T23:59:59',
      campaignText: 'سارعي قبل نفاد الكمية! ينتهي الخصم الومضي خلال:',
      timerColor: 'rose-600'
    },
    analytics: { views: 540, clicks: 180, successRate: 84 }
  },
  {
    id: 'customerVideoReviews',
    title: 'مراجعات الفيديو والصور الحية 🎥',
    desc: 'السماح للزبونات برفع مقاطع فيديو قصيرة لفتح واستعراض جودة طرود إيرامو.',
    category: 'التسويق والمبيعات',
    enabled: true,
    config: {
      approvalWorkflow: true,
      moderationLevel: 'high',
      allowRatingStars: true
    },
    analytics: { views: 190, clicks: 45, successRate: 70 }
  },
  {
    id: 'unboxingExperience',
    title: 'معرض فتح صناديق إيرامو الفاخرة 📦',
    desc: 'تجربة بصرية مذهلة تستعرض التغليف المخملي وصناديق الماركات الفخمة.',
    category: 'التسويق والمبيعات',
    enabled: true,
    config: {
      featuredMediaUrls: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format, https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format',
      showSparkles: true,
      unboxingOverlayText: 'الجمال يبدأ من فتح الصندوق'
    },
    analytics: { views: 340, clicks: 110, successRate: 79 }
  },
  {
    id: 'aiAdminAssistant',
    title: 'مساعد التاجر بالذكاء الاصطناعي 🤖',
    desc: 'لوحة إحصائية ومستشار مبيعات يقدم نصائح ذكية لزيادة المبيعات والربح.',
    category: 'أدوات الإدارة المتقدمة',
    enabled: true,
    config: {
      aiPersonality: 'مستشار أعمال فخم واحترافي',
      generateReportsFrequency: 'daily',
      focusArea: 'تحسين سلة الشراء وزيادة الأرباح'
    },
    analytics: { views: 85, clicks: 40, successRate: 90 }
  },
  {
    id: 'salesForecasting',
    title: 'التنبؤ الذكي والبياني بالمبيعات 📈',
    desc: 'خوارزمية ذكية تتنبأ بحجم المبيعات القادم بناءً على بيانات الشحنات السابقة.',
    category: 'أدوات الإدارة المتقدمة',
    enabled: true,
    config: {
      predictionModel: 'مزيج الانحدار الخطي والأنماط الموسمية',
      lookbackDays: 30,
      dailyForecastingEnabled: true
    },
    analytics: { views: 72, clicks: 35, successRate: 88 }
  },
  {
    id: 'customerBehaviorAnalytics',
    title: 'تحليلات سلوك الزبونة وعربة الشراء 🧠',
    desc: 'مراقبة سلال الشراء المهجورة ومسارات تصفح المنتجات لحل المشاكل بيسر.',
    category: 'أدوات الإدارة المتقدمة',
    enabled: true,
    config: {
      trackCartAbandonment: true,
      trackSearchQueries: true,
      conversionFunnelSteps: 'تصفح -> تفاصيل -> إضافة للسلة -> إدخال بيانات التوصيل -> إتمام الطلب'
    },
    analytics: { views: 110, clicks: 50, successRate: 94 }
  },
  {
    id: 'smartMarketingEngine',
    title: 'محرك الحملات التسويقية الذكية 🎯',
    desc: 'تقسيم الزبونات واستهدافهن بكوبونات وعروض مخصصة للمحافظات أو فئات معينة.',
    category: 'التسويق والمبيعات',
    enabled: true,
    config: {
      targetVipOnly: false,
      couponPercentageDiscount: 15,
      locationBasedCampaigns: 'مفعل لمحافظة بغداد والبصرة'
    },
    analytics: { views: 420, clicks: 130, successRate: 81 }
  },
  {
    id: 'vipMembershipSystem',
    title: 'نظام العضوية الماسية والـ VIP 💎',
    desc: 'تقسيم مستويات الزبونات (برونزي، فضي، ذهبي، بلاتيني، ماسي، ملكي) بميزات حصرية.',
    category: 'الألعاب والولاء',
    enabled: true,
    config: {
      bronzeThreshold: 0,
      silverThreshold: 200000,
      goldThreshold: 500000,
      platinumThreshold: 1200000,
      diamondThreshold: 2500000,
      vipEliteThreshold: 5000000,
      discountsByLevel: 'Bronze: 0%, Silver: 2%, Gold: 5%, Platinum: 8%, Diamond: 10%, VIP Elite: 12%'
    },
    analytics: { views: 280, clicks: 120, successRate: 96 }
  },
  {
    id: 'monthlySubscriptionBox',
    title: 'صناديق الاشتراك الشهري الفاخرة 🎁',
    desc: 'توفير اشتراكات دورية (صندوق الجمال، صندوق الأناقة) بأسعار وعينات مميزة.',
    category: 'التسويق والمبيعات',
    enabled: true,
    config: {
      beautyBoxPrice: 65000,
      luxuryBoxPrice: 120000,
      deliveryDayOfMonth: 5,
      personalizedSelections: true
    },
    analytics: { views: 160, clicks: 35, successRate: 75 }
  },
  {
    id: 'liveSelling',
    title: 'بوابة البث التفاعلي المباشر 📹',
    desc: 'دعم البث التلفزيوني للتسوق وشراء المنتجات المعروضة بشكل مباشر مع دردشة فورية.',
    category: 'تجربة الزبونة',
    enabled: true,
    config: {
      liveStreamEmbedUrl: 'https://www.youtube.com/embed/5mQXv50uVpQ',
      allowLiveComments: true,
      instantCheckoutEnabled: true
    },
    analytics: { views: 240, clicks: 80, successRate: 83 }
  },
  {
    id: 'customerHeatMap',
    title: 'خارطة الكثافة الجغرافية للزبونات 🌍',
    desc: 'رسم تحليلي تفاعلي يوضح توزيع الشحنات والطلب في محافظات العراق.',
    category: 'أدوات الإدارة المتقدمة',
    enabled: true,
    config: {
      zoomLevel: 6.5,
      mapCenterCoordinates: '33.3152, 44.3661',
      colorDensityScheme: 'Rose to Burgundy'
    },
    analytics: { views: 95, clicks: 22, successRate: 91 }
  },
  {
    id: 'customerLeaderboard',
    title: 'لوحة متصدرين زبونات إيرامو الأكثر نشاطاً 🏅',
    desc: 'عرض ترتيب تنافسي مع ألقاب ملكية للزبونات الأكثر طلباً ونقاطاً.',
    category: 'الألعاب والولاء',
    enabled: true,
    config: {
      displayTopCount: 10,
      rewardForFirstPlace: 'كوبون بقيمة 50,000 د.ع مع توصيل VIP مجاني',
      updateInterval: 'أسبوعي'
    },
    analytics: { views: 430, clicks: 120, successRate: 89 }
  },
  {
    id: 'personalShoppingAssistant',
    title: 'مساعد التسوق الشخصي الملكي 👑',
    desc: 'تخصيص كامل لعروض الشراء واقتراحات مستحضرات تجميل لكل زبونة بالاسم.',
    category: 'تجربة الزبونة',
    enabled: true,
    config: {
      assistantName: 'هدوشة المساعد الشخصي',
      welcomeGreetings: 'أهلاً بكِ مجدداً يا ملكة الأناقة، {name}',
      specialOffersPercent: 12
    },
    analytics: { views: 390, clicks: 195, successRate: 91 }
  },
  {
    id: 'customerThemeCustomization',
    title: 'تخصيص الهوية البصرية للزبونة 🎨',
    desc: 'السماح للزبونة باختيار الألوان (وردي كلاسيك، ذهبي ملكي، بنفسجي فخم) والوضع الداكن.',
    category: 'تجربة الزبونة',
    enabled: true,
    config: {
      allowDarkModeToggle: true,
      themeColors: 'وردي كلاسيك, ذهبي ملكي, كرزي فخم, لافندر ناعم',
      defaultLayoutMode: 'Grid'
    },
    analytics: { views: 510, clicks: 230, successRate: 94 }
  },
  {
    id: 'backgroundMusic',
    title: 'الموسيقى والخلفيات الصوتية الراقية 🎵',
    desc: 'إمكانية تشغيل موسيقى هادئة لتوفير تجربة تسوق فخمة واسترخاء تام.',
    category: 'تجربة الزبونة',
    enabled: true,
    config: {
      musicTrackUrl: 'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-lullaby-585.mp3',
      defaultVolumePercent: 20,
      allowUserToggle: true
    },
    analytics: { views: 410, clicks: 180, successRate: 80 }
  },
  {
    id: 'augmentedReality',
    title: 'بوابة الواقع المعزز لتجربة المنتجات 📸',
    desc: 'تمكين الزبونة من محاكاة تجربة الحقيبة أو الاكسسوار أو طلاء الأظافر بكاميرا هاتفها.',
    category: 'تجربة الزبونة',
    enabled: true,
    config: {
      arType: 'face_accessories_bags',
      allowPhotoCapture: true,
      calibrationPrecision: 'high'
    },
    analytics: { views: 180, clicks: 42, successRate: 75 }
  },
  {
    id: 'personalizedWelcomeExperience',
    title: 'تجربة الترحيب الملكية الساحرة 🎬',
    desc: 'شاشة ترحيب مذهلة بختم شمعي أحمر مخصص، وحركات ترحيبية.',
    category: 'تجربة الزبونة',
    enabled: true,
    config: {
      animationDurationMs: 2500,
      waxSealColor: 'burgundy_red',
      offerTitle: 'عرض العضوية الجديدة 🌟'
    },
    analytics: { views: 680, clicks: 310, successRate: 97 }
  }
];

export default function FeatureControlCenter() {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  // Modal / Settings Drawer states
  const [editingFeature, setEditingFeature] = useState<FeatureItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [draftConfig, setDraftConfig] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // New custom feature creation states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newFeatureTitle, setNewFeatureTitle] = useState<string>('');
  const [newFeatureDesc, setNewFeatureDesc] = useState<string>('');
  const [newFeatureCategory, setNewFeatureCategory] = useState<string>('تجربة الزبونة');

  useEffect(() => {
    // Realtime subscription to the "features" collection
    const unsub = onSnapshot(collection(db, 'features'), async (snapshot) => {
      if (snapshot.empty) {
        // Automatically seed the 24 default advanced features
        console.log('Features collection is empty. Seeding defaults...');
        for (const feat of DEFAULT_ECOSYSTEM_FEATURES) {
          await setDoc(doc(db, 'features', feat.id), feat);
        }
        setLoading(false);
      } else {
        const featsList: FeatureItem[] = [];
        snapshot.forEach((docSnap) => {
          featsList.push({ id: docSnap.id, ...docSnap.data() } as FeatureItem);
        });
        // Sort features so that default ordering persists
        featsList.sort((a, b) => {
          const indexA = DEFAULT_ECOSYSTEM_FEATURES.findIndex(f => f.id === a.id);
          const indexB = DEFAULT_ECOSYSTEM_FEATURES.findIndex(f => f.id === b.id);
          if (indexA === -1 && indexB === -1) return a.title.localeCompare(b.title);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        setFeatures(featsList);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching features:', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleToggleFeature = async (featureId: string, currentStatus: boolean) => {
    try {
      const featRef = doc(db, 'features', featureId);
      await updateDoc(featRef, { enabled: !currentStatus });
    } catch (err) {
      console.error('Failed to toggle feature status:', err);
    }
  };

  const handleOpenSettings = (feature: FeatureItem) => {
    setEditingFeature(feature);
    setDraftConfig({ ...feature.config });
    setIsDrawerOpen(true);
  };

  const handleConfigValueChange = (key: string, value: any) => {
    setDraftConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveConfig = async () => {
    if (!editingFeature) return;
    setIsSaving(true);
    try {
      const featRef = doc(db, 'features', editingFeature.id);
      await updateDoc(featRef, { config: draftConfig });
      setIsDrawerOpen(false);
      setEditingFeature(null);
    } catch (err) {
      console.error('Failed to save granular configuration:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCustomFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureTitle || !newFeatureDesc) return;

    const id = 'custom_' + Date.now().toString();
    const newFeat: FeatureItem = {
      id,
      title: newFeatureTitle + ' ✨',
      desc: newFeatureDesc,
      category: newFeatureCategory,
      enabled: true,
      config: {
        customParameters: 'إعدادات مخصصة',
        allowAiOptimizations: true
      },
      analytics: { views: 0, clicks: 0, successRate: 100 }
    };

    try {
      await setDoc(doc(db, 'features', id), newFeat);
      setIsCreateModalOpen(false);
      setNewFeatureTitle('');
      setNewFeatureDesc('');
    } catch (err) {
      console.error('Failed to create custom feature:', err);
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (window.confirm('هل أنتِ متأكدة من حذف هذه الميزة البرمجية المخصصة نهائياً؟')) {
      try {
        const featRef = doc(db, 'features', id);
        // We delete from Firestore
        await setDoc(featRef, {}); // clear or deleteDoc
        // Since deleteDoc is safer
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(featRef);
      } catch (err) {
        console.error('Error deleting feature:', err);
      }
    }
  };

  // Categories list
  const categories = ['الكل', 'تجربة الزبونة', 'الألعاب والولاء', 'دليل اجتماعي', 'التسويق والمبيعات', 'أدوات الإدارة المتقدمة'];

  // Filter features
  const filteredFeatures = features.filter(feat => {
    const matchesSearch = feat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          feat.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || feat.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pt-2 text-right font-sans" dir="rtl">
      
      {/* Dynamic Header Banner */}
      <div className="bg-gradient-to-r from-pink-800 via-rose-900 to-amber-950 text-white p-6 rounded-[2.5rem] relative overflow-hidden shadow-xl border border-pink-700/30">
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1.5">
            <span className="text-[9px] font-black tracking-widest text-amber-300 bg-amber-500/25 py-1 px-3.5 rounded-full uppercase border border-amber-500/30 inline-block">
              MASTER CONTROL CENTER 👑
            </span>
            <h3 className="font-extrabold text-lg leading-snug">
              التحكم الشامل بمنظومة ميزات إيرامو الذكية 🎛️
            </h3>
            <p className="text-[10.5px] text-pink-100/90 leading-relaxed max-w-xl font-bold">
              مرحبًا بكِ في مركز التحكم المركزي الفاخر. هنا يتم تشغيل، إيقاف، وتهيئة جميع تفاصيل وميزات المتجر الحيوية فورًا وبشكل حي، وتنعكس مباشرة لدى الزبونات في بوابتهن الجمالية بلا أكواد برمجية.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black py-2.5 px-4 rounded-xl border border-white/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة ميزة مخصصة جديدة</span>
          </button>
        </div>
      </div>

      {/* Real-time Statistics / Meta KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-pink-100 p-4 rounded-[2rem] shadow-xs">
          <span className="text-[9px] text-gray-400 font-extrabold block">الميزات النشطة بالموقع</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-pink-950">
              {features.filter(f => f.enabled).length} <span className="text-[10px] text-gray-400">/ {features.length}</span>
            </span>
            <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {Math.round((features.filter(f => f.enabled).length / (features.length || 1)) * 100)}% فعال
            </span>
          </div>
        </div>

        <div className="bg-white border border-pink-100 p-4 rounded-[2rem] shadow-xs">
          <span className="text-[9px] text-gray-400 font-extrabold block">إجمالي تفاعلات الزبونات</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-pink-950">
              {features.reduce((acc, curr) => acc + (curr.analytics?.views || 0), 0).toLocaleString()}
            </span>
            <span className="text-[8px] font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
              تصفح حي ✨
            </span>
          </div>
        </div>

        <div className="bg-white border border-pink-100 p-4 rounded-[2rem] shadow-xs">
          <span className="text-[9px] text-gray-400 font-extrabold block">نقرات وإجراءات تفاعلية</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-pink-950">
              {features.reduce((acc, curr) => acc + (curr.analytics?.clicks || 0), 0).toLocaleString()}
            </span>
            <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              معدل {Math.round((features.reduce((acc, curr) => acc + (curr.analytics?.clicks || 0), 0) / (features.reduce((acc, curr) => acc + (curr.analytics?.views || 0), 1) || 1)) * 100)}% تحويل
            </span>
          </div>
        </div>

        <div className="bg-white border border-pink-100 p-4 rounded-[2rem] shadow-xs">
          <span className="text-[9px] text-gray-400 font-extrabold block">تكامل الذكاء الاصطناعي</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-pink-950">
              {features.filter(f => f.id.toLowerCase().includes('ai') || f.id.toLowerCase().includes('smart')).length} أدوات
            </span>
            <span className="text-[8px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
              رعاية متكاملة 🌟
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="bg-white border border-pink-100 rounded-[2.5rem] p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="ابحثي عن ميزة، تصنيف، أو تفاصيل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-pink-50/20 border border-pink-100 focus:outline-none focus:border-pink-400 text-xs px-4 py-2.5 rounded-2xl font-bold placeholder-gray-400 text-right"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0" dir="rtl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-pink-50 text-pink-950 hover:bg-pink-100 border border-pink-100/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs text-gray-400 font-bold space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-pink-600 border-t-transparent animate-spin mx-auto" />
          <p>جاري تحميل منظومة ميزات متجر إيرامو الفاخرة...</p>
        </div>
      ) : filteredFeatures.length === 0 ? (
        <div className="py-24 bg-white rounded-[2.5rem] border border-pink-100 text-center space-y-3">
          <div className="text-3xl">⚙️</div>
          <p className="text-xs text-pink-950 font-black">لم يتم العثور على أي ميزة مطابقة لخيارات البحث.</p>
          <p className="text-[10px] text-gray-400 font-bold">جربي تغيير الكلمات المفتاحية أو التصنيف المختار.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFeatures.map((feat) => (
            <div 
              key={feat.id} 
              className={`bg-white border p-5 rounded-[2.2rem] shadow-xs relative flex flex-col justify-between transition-all hover:shadow-md ${
                feat.enabled 
                  ? 'border-pink-200 bg-gradient-to-br from-white to-pink-50/10' 
                  : 'border-gray-100 opacity-75'
              }`}
            >
              {/* Badge for category */}
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className="text-[8px] font-black text-pink-700 bg-pink-100 px-2.5 py-0.5 rounded-full border border-pink-100/40">
                  {feat.category}
                </span>

                <div className="flex gap-1">
                  {/* Settings Icon Button */}
                  <button
                    onClick={() => handleOpenSettings(feat)}
                    className="p-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-100/40 cursor-pointer transition-all active:scale-95"
                    title="ضبط الإعدادات التفصيلية"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete button only for custom features */}
                  {feat.id.startsWith('custom_') && (
                    <button
                      onClick={() => handleDeleteFeature(feat.id)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100/40 cursor-pointer transition-all"
                      title="حذف الميزة المخصصة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 mb-4 text-right">
                <h4 className="text-xs font-black text-pink-950 leading-snug">{feat.title}</h4>
                <p className="text-[10px] text-gray-500 font-semibold leading-relaxed line-clamp-2 min-h-[30px]">{feat.desc}</p>
              </div>

              {/* Bottom Row: Toggle Switch & Status */}
              <div className="pt-3 border-t border-pink-50/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${feat.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                  <span className={`text-[9px] font-black ${feat.enabled ? 'text-emerald-700' : 'text-red-500'}`}>
                    {feat.enabled ? 'فعال لدى الزبونات ✓' : 'معطل ومخفي ✕'}
                  </span>
                </div>

                {/* Nice iOS-style Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleFeature(feat.id, feat.enabled)}
                  className={`relative inline-flex h-5.5 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    feat.enabled ? 'bg-pink-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      feat.enabled ? '-translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Dynamic Mini Analytics Row */}
              {feat.analytics && (
                <div className="mt-2.5 bg-gray-50 p-2 rounded-xl flex justify-between text-[8px] font-bold text-gray-400">
                  <span>المشاهدات: <span className="text-pink-950 font-black">{feat.analytics.views || 0}</span></span>
                  <span>النقرات: <span className="text-pink-950 font-black">{feat.analytics.clicks || 0}</span></span>
                  <span>النجاح: <span className="text-emerald-700 font-black">{feat.analytics.successRate || 100}%</span></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 🛠️ SLIDE-OVER GRANULAR CONFIGURATION DRAWER (MODAL) */}
      {isDrawerOpen && editingFeature && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-right">
          <div className="bg-white rounded-[2.5rem] border border-pink-100 max-w-lg w-full max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl p-6 space-y-5">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-pink-50">
              <button
                onClick={() => { setIsDrawerOpen(false); setEditingFeature(null); }}
                className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-pink-800 font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
              <div>
                <span className="text-[8.5px] font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full block w-fit mr-auto mb-1">
                  إعدادات متقدمة ⚙️
                </span>
                <h4 className="text-xs font-black text-pink-950">{editingFeature.title}</h4>
              </div>
            </div>

            {/* Description note */}
            <div className="bg-pink-50/20 border border-pink-50 p-3 rounded-2xl text-[9.5px] text-pink-950/80 leading-normal font-semibold">
              يقوم هذا المحرك بإنشاء لوحة التحكم، الإحصائيات، والصلاحيات ديناميكياً لهذه الميزة دون الحاجة لتعديل الكود البرمجي بعد الآن.
            </div>

            {/* Config Fields dynamically generated */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-pink-950">تعديل بارامترات التخصيص الحية (Granular Setup):</h5>

              {Object.keys(draftConfig).map((key) => {
                const value = draftConfig[key];
                // Label prettifier
                const prettyLabel = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .replace('Budget Ranges', 'نطاقات الميزانية المسموحة')
                  .replace('Gift Categories', 'تصنيفات الهدايا الموصى بها')
                  .replace('Recommendation Rules', 'قواعد الترشيح والتوصية')
                  .replace('Skin Types', 'أنواع البشرة المدعومة')
                  .replace('Beauty Goals', 'أهداف العناية بالبشرة')
                  .replace('Knowledge Base', 'قاعدة المعرفة التجميلية')
                  .replace('Recommendation Logic', 'منطق التوصية بالذكاء الاصطناعي')
                  .replace('Daily Limit Per User', 'الحد اليومي للدوران لكل مستخدم')
                  .replace('Rewards', 'المكافآت المتاحة في العجلة')
                  .replace('Probability Distribution', 'قاعدة توزيع الاحتمالات')
                  .replace('EndTime', 'تاريخ ووقت انتهاء الحملة')
                  .replace('Campaign Text', 'النص الترويجي المصاحب')
                  .replace('Featured Media Urls', 'روابط الوسائط المرفقة')
                  .replace('Unboxing Overlay Text', 'نص تراكب فتح الصندوق')
                  .replace('Stream Url', 'رابط البث الحي')
                  .replace('Greeting Template', 'قالب التحية المخصص')
                  .replace('Vip Elite Threshold', 'حد الترقية للعضوية الماسية الملكية')
                  .replace('Default Theme', 'السمة الافتراضية');

                if (typeof value === 'boolean') {
                  return (
                    <div key={key} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                      <div className="text-right">
                        <span className="text-[10px] font-black text-pink-950 block">{prettyLabel}</span>
                        <span className="text-[8px] text-gray-400 font-bold font-mono">({key})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleConfigValueChange(key, !value)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          value ? 'bg-pink-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            value ? '-translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                }

                if (typeof value === 'number') {
                  return (
                    <div key={key} className="space-y-1 text-right">
                      <div className="flex justify-between">
                        <span className="text-[8px] text-gray-400 font-mono">({key})</span>
                        <label className="text-[9.5px] font-black text-pink-950">{prettyLabel}</label>
                      </div>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleConfigValueChange(key, Number(e.target.value))}
                        className="w-full bg-pink-50/10 border border-pink-100 focus:outline-none focus:border-pink-300 text-xs px-3 py-2.5 rounded-xl font-bold font-mono text-left"
                      />
                    </div>
                  );
                }

                // If text is long, render textarea
                if (typeof value === 'string' && value.length > 50) {
                  return (
                    <div key={key} className="space-y-1 text-right">
                      <div className="flex justify-between">
                        <span className="text-[8px] text-gray-400 font-mono">({key})</span>
                        <label className="text-[9.5px] font-black text-pink-950">{prettyLabel}</label>
                      </div>
                      <textarea
                        value={value}
                        rows={3}
                        onChange={(e) => handleConfigValueChange(key, e.target.value)}
                        className="w-full bg-pink-50/10 border border-pink-100 focus:outline-none focus:border-pink-300 text-xs px-3 py-2 rounded-xl font-bold font-sans text-right leading-relaxed"
                      />
                    </div>
                  );
                }

                return (
                  <div key={key} className="space-y-1 text-right">
                    <div className="flex justify-between">
                      <span className="text-[8px] text-gray-400 font-mono">({key})</span>
                      <label className="text-[9.5px] font-black text-pink-950">{prettyLabel}</label>
                    </div>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleConfigValueChange(key, e.target.value)}
                      className="w-full bg-pink-50/10 border border-pink-100 focus:outline-none focus:border-pink-300 text-xs px-3 py-2.5 rounded-xl font-bold text-right"
                    />
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-3 border-t border-pink-50">
              <button
                type="button"
                onClick={() => { setIsDrawerOpen(false); setEditingFeature(null); }}
                className="text-[9.5px] font-black text-gray-500 hover:text-rose-600 py-2.5 px-4 rounded-xl cursor-pointer"
              >
                تجاهل التعديلات ✕
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white font-black text-[10px] py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ البارامترات وتطبيقها فوراً'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ➕ MODAL FOR ADDING CUSTOM FEATURE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-right">
          <form onSubmit={handleCreateCustomFeature} className="bg-white rounded-[2.5rem] border border-pink-100 max-w-md w-full shadow-2xl p-6 space-y-5">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-pink-50">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-pink-800 font-bold cursor-pointer"
              >
                ✕
              </button>
              <h4 className="text-xs font-black text-pink-950">إضافة ميزة برمجية مخصصة جديدة ✨</h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9.5px] font-black text-pink-950 block">اسم الميزة البرمجية:</label>
                <input
                  type="text"
                  placeholder="مثال: مستشار الشعر الملكي"
                  value={newFeatureTitle}
                  onChange={(e) => setNewFeatureTitle(e.target.value)}
                  className="w-full bg-pink-50/10 border border-pink-100 focus:outline-none focus:border-pink-300 text-xs px-3.5 py-2.5 rounded-xl font-bold text-right"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-black text-pink-950 block">شرح مختصر للميزة:</label>
                <textarea
                  placeholder="مثال: الإجابة على أسئلة الشعر ورعاية خصلاته الفخمة بالذكاء الاصطناعي..."
                  value={newFeatureDesc}
                  onChange={(e) => setNewFeatureDesc(e.target.value)}
                  className="w-full bg-pink-50/10 border border-pink-100 focus:outline-none focus:border-pink-300 text-xs px-3.5 py-2 rounded-xl font-bold text-right leading-relaxed"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-black text-pink-950 block">قسم وتصنيف الميزة:</label>
                <select
                  value={newFeatureCategory}
                  onChange={(e) => setNewFeatureCategory(e.target.value)}
                  className="w-full bg-pink-50/10 border border-pink-100 focus:outline-none focus:border-pink-300 text-xs px-3.5 py-2.5 rounded-xl font-black text-right"
                >
                  <option value="تجربة الزبونة">تجربة الزبونة</option>
                  <option value="الألعاب والولاء">الألعاب والولاء</option>
                  <option value="دليل اجتماعي">دليل اجتماعي</option>
                  <option value="التسويق والمبيعات">التسويق والمبيعات</option>
                  <option value="أدوات الإدارة المتقدمة">أدوات الإدارة المتقدمة</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-3 border-t border-pink-50">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[9.5px] font-black text-gray-500 hover:text-rose-600 py-2 px-4 rounded-xl"
              >
                تراجع ✕
              </button>
              <button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white font-black text-[10px] py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة وتفعيل الميزة فوراً</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
