import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingCart, 
  Sparkles, 
  Filter, 
  Grid, 
  CheckCircle2, 
  Heart, 
  Star, 
  X, 
  SlidersHorizontal, 
  ChevronDown, 
  Check, 
  ArrowLeft, 
  Flame, 
  BadgePercent,
  TrendingUp,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic, triggerWarningHaptic } from '../utils/haptics';

export interface IramoProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  originalStore: string;
  description: string;
  availability: 'in_stock' | 'limited' | 'preorder';
  rating: number;
  reviewsCount: number;
  badge?: 'best_seller' | 'trending' | 'new_in' | 'flash_sale';
  sizes?: string[];
  colors?: string[];
  reviewsList: {
    author: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

const DEFAULT_IRAMO_PRODUCTS: IramoProduct[] = [
  {
    id: 'ir_prod_1',
    name: 'حقيبة ليدي ديور كلاسيك فاخرة (Lady Dior Classy Bag)',
    price: 1350000,
    originalPrice: 1550000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
    category: 'حقائب وأحذية',
    originalStore: 'Dior Store Dubai',
    description: 'حقيبة كلاسيكية راقية باللون الأسود الملكي مصنوعة من جلد الحمل الفاخر مع حليات ذهبية براقة تليق بإطلالتك الأنيقة ومناسباتك الفاخرة.',
    availability: 'limited',
    rating: 4.9,
    reviewsCount: 142,
    badge: 'best_seller',
    sizes: ['Mini', 'Medium', 'Large'],
    colors: ['أسود ملكي', 'وردي ناعم', 'أوف وايت فخم'],
    reviewsList: [
      { author: 'سارة العبيدي', rating: 5, comment: 'الجنطة تجنن وتفاصيلها تدوخ! شكراً إيرامو على التوصيل الراقي والأصالة.', date: 'قبل ٣ أيام' },
      { author: 'مريم الجبوري', rating: 5, comment: 'أصيلة 100% وقارنتها مع البوتيك بدبي مطابقة تماماً. كوالتي خيالي!', date: 'قبل أسبوع' }
    ]
  },
  {
    id: 'ir_prod_2',
    name: 'سيروم اوباجي فيتامين سي الاحترافي (Obagi Professional-C 20%)',
    price: 155000,
    originalPrice: 185000,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
    category: 'عناية وتجميل',
    originalStore: 'Sephora US',
    description: 'سيروم فيتامين سي عالي التركيز لحماية البشرة من التصبغات، تحفيز الكولاجين، ومنحك إشراقة ونضارة لا مثيل لها بتركيز 20% الأصلي.',
    availability: 'in_stock',
    rating: 4.8,
    reviewsCount: 310,
    badge: 'trending',
    sizes: ['30ml'],
    colors: ['التركيز القياسي 20%'],
    reviewsList: [
      { author: 'نورة السعدي', rating: 5, comment: 'أفضل سيروم جربته بحياتي لتفتيح التصبغات، حقيقي أصلي من سيفورا أمريكا.', date: 'قبل يومين' },
      { author: 'زينب م.', rating: 4, comment: 'روعة ونضارة فورية بالبشرة، التغليف محكم وجاء بالعلبة المختومة.', date: 'قبل ٥ أيام' }
    ]
  },
  {
    id: 'ir_prod_3',
    name: 'عطر شانيل كوكو مادوموزيل الفخم (Chanel Coco Mademoiselle)',
    price: 285000,
    originalPrice: 340000,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
    category: 'عطور وبخور',
    originalStore: 'Chanel Sephora',
    description: 'عطر شرقي أنثوي بامتياز يمزج بين انتعاش البرتقال وجاذبية الياسمين والورد مع دفء الباتشولي والمسك الأبيض الفاخر.',
    availability: 'in_stock',
    rating: 5.0,
    reviewsCount: 240,
    badge: 'best_seller',
    sizes: ['50ml', '100ml'],
    colors: ['Eau de Parfum'],
    reviewsList: [
      { author: 'أمنة الفياض', rating: 5, comment: 'عطري المفضل منذ سنوات، الثبات خيالي ويفوح بكل مكان أنصح بيه بشدة.', date: 'قبل ٤ أيام' },
      { author: 'فاطمة الموسوي', rating: 5, comment: 'توصيل سريع والختم الأصلي متواجد ع العلبة. تجربة شراء ممتازة.', date: 'قبل ٩ أيام' }
    ]
  },
  {
    id: 'ir_prod_4',
    name: 'سوار الحب كارتييه مطلي ذهب عيار 18 (Cartier Love Bracelet)',
    price: 210000,
    originalPrice: 265000,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
    category: 'إكسسوارات ومجوهرات',
    originalStore: 'Cartier AE',
    description: 'سوار الحب الأيقوني بتصميم مسامير كارتييه الكلاسيكية، مطلي بالذهب عيار 18 عالي المقاومة ومقاوم لتغير الألوان تماماً ومصنوع بدقة هندسية متناهية.',
    availability: 'limited',
    rating: 4.7,
    reviewsCount: 95,
    badge: 'flash_sale',
    sizes: ['16cm', '17cm', '18cm'],
    colors: ['ذهب أصفر عيار 18', 'ذهب وردي (Rose Gold)', 'بلاتين فضي'],
    reviewsList: [
      { author: 'هدى السلطاني', rating: 5, comment: 'يجنن باللبس ولمعته حقيقية جداً! يجي مع كيس الشنطة والمفك مالته.', date: 'قبل يومين' },
      { author: 'شيماء العلي', rating: 4, comment: 'لمعته رهيبة وصارلي شهر ألبسه بالحمام والعمل وما تغير لونه أبداً.', date: 'قبل أسبوعين' }
    ]
  },
  {
    id: 'ir_prod_5',
    name: 'مجموعة ظلال عيون هدى بيوتي الفاخرة (Huda Beauty Empowered)',
    price: 115000,
    originalPrice: 145000,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600',
    category: 'عناية وتجميل',
    originalStore: 'Sephora UAE',
    description: 'علبة متكاملة تحتوي على 18 لوناً غنياً بين المات الناعم والمعدني البراق لتنفيذ أجمل لوكات المكياج اليومية والمناسبات الراقية.',
    availability: 'in_stock',
    rating: 4.9,
    reviewsCount: 185,
    badge: 'new_in',
    sizes: ['مجموعة 18 لون'],
    colors: ['Empowered Palette'],
    reviewsList: [
      { author: 'شمس حميد', rating: 5, comment: 'البيغمنت عالي جداً والوان الميتالك تدوم طول اليوم بدون ما تتناثر. روعة!', date: 'قبل ٣ أيام' }
    ]
  },
  {
    id: 'ir_prod_6',
    name: 'مرطب كلينيك هيدرا جيل المرطب الفوري (Clinique Moisture 100H)',
    price: 90000,
    originalPrice: 110000,
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600',
    category: 'عناية وتجميل',
    originalStore: 'Nordstrom US',
    description: 'مرطب جل مائي خالٍ من الزيوت يتغلغل بعمق في خلايا البشرة ليمنحها ترطيباً مستمراً يدوم حتى 100 ساعة متواصلة مع حمض الهيالورونيك وخميرة الصبار.',
    availability: 'in_stock',
    rating: 4.8,
    reviewsCount: 420,
    badge: 'best_seller',
    sizes: ['50ml', '75ml'],
    colors: ['جل مائي خفيف'],
    reviewsList: [
      { author: 'هدى الخفاجي', rating: 5, comment: 'بشرتي مختلطة وهذا المرطب الوحيد اللي ما يسببلي حبوب ويرطب ترطيب عميق.', date: 'قبل أسبوع' }
    ]
  },
  {
    id: 'ir_prod_7',
    name: 'نظارة شمسية برادا عين القطة السوداء (Prada Cat-Eye Sunglasses)',
    price: 345000,
    originalPrice: 420000,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600',
    category: 'إكسسوارات ومجوهرات',
    originalStore: 'Prada Italy',
    description: 'نظارة شمسية أنيقة بتصميم كات آي كلاسيكي مع شعار برادا المثلث الشهير، لحماية فائقة من الأشعة فوق البنفسجية وجاذبية فورية تخطف الأنظار.',
    availability: 'preorder',
    rating: 4.9,
    reviewsCount: 64,
    badge: 'new_in',
    sizes: ['Standard Fit'],
    colors: ['أسود ملكي لامع', 'نقشة النمر العسلية'],
    reviewsList: [
      { author: 'أسيل الفهد', rating: 5, comment: 'العدسة تريح العين والديزاين يجنن ويناسب كل الوجوه. التوصيل كان مرتب ومغلف.', date: 'قبل يومين' }
    ]
  },
  {
    id: 'ir_prod_8',
    name: 'حذاء كعب كلاسيك فالنتينو باللون الأحمر (Valentino Rockstud Heels)',
    price: 495000,
    originalPrice: 580000,
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=600',
    category: 'حقائب وأحذية',
    originalStore: 'Valentino Mall of Emirates',
    description: 'حذاء ذو كعب عالٍ مزين بقطع الميتال الأيقونية الشهيرة من فالنتينو، مصنوع من جلد طبيعي فاخر 100% لتخطفي الأنظار في كل خطوة ومناسبة.',
    availability: 'limited',
    rating: 4.9,
    reviewsCount: 52,
    badge: 'trending',
    sizes: ['37', '38', '39', '40'],
    colors: ['أحمر ناري فخم', 'أسود كلاسيكي', 'نود هادئ'],
    reviewsList: [
      { author: 'ريتا جرجس', rating: 5, comment: 'الكعب مريح بالرغم من طوله، والخامة جلد أصلي مبين فخامته من أول نظرة.', date: 'قبل ٦ أيام' }
    ]
  }
];

export default function IramoProductsList() {
  const { customizations } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'rating' | 'popular'>('default');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  
  // Wishlist local state persisted in localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('iramo_user_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [onlyShowWishlist, setOnlyShowWishlist] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IramoProduct | null>(null);
  
  // Detail Drawer product parameters
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('iramo_user_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Combine default with manager preset products if they exist
  const allProducts = useMemo(() => {
    const managerPresets = (customizations?.presetProducts || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.price * 1.2, // Simulate cross-price
      image: p.image || 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600',
      category: p.category || 'عام',
      originalStore: p.originalStore || 'مستودع إيرامو الراقي',
      description: 'منتج مميز ومختار بعناية فائقة من فريق إيرامو للشحن الدولي متوفر للتسليم الفوري مع كفالة الأصالة الكاملة.',
      availability: 'in_stock' as const,
      rating: 4.8,
      reviewsCount: 35,
      badge: 'trending' as const,
      sizes: ['Standard'],
      colors: ['اللون المعروض'],
      reviewsList: [
        { author: 'زبونة إيرامو الكريمة', rating: 5, comment: 'منتج قمة بالروعة وتوصيل جداً محترم وسريع.', date: 'منذ أسبوع' }
      ]
    }));

    return [...DEFAULT_IRAMO_PRODUCTS, ...managerPresets];
  }, [customizations]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(allProducts.map(p => p.category)));
    return ['الكل', ...cats];
  }, [allProducts]);

  // Filter and Sort products
  const processedProducts = useMemo(() => {
    let result = allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.originalStore.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
      const matchesWishlist = !onlyShowWishlist || wishlist.includes(p.id);
      return matchesSearch && matchesCategory && matchesWishlist;
    });

    // Apply sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [allProducts, searchQuery, selectedCategory, onlyShowWishlist, wishlist, sortBy]);

  const getInstagramLink = () => {
    const ig = customizations?.socials?.instagram || '@iramo.store';
    const cleanIg = ig.replace('@', '').trim();
    if (cleanIg.startsWith('http')) {
      return cleanIg;
    }
    return `https://instagram.com/${cleanIg}`;
  };

  const [copySuccessMsg, setCopySuccessMsg] = useState(false);

  const handleOrderProduct = (prod: IramoProduct, size?: string, color?: string) => {
    triggerSuccessHaptic();
    const chosenSizeText = size ? `📏 الحجم/المقاس: ${size}` : '';
    const chosenColorText = color ? `🎨 اللون/الخامة: ${color}` : '';
    
    const orderMsg = `✨ مرحباً كادر إيرامو المتميز، أود طلب وحجز هذا المنتج المعروض في المتجر العالمي الأنيق:
🎁 اسم المنتج: ${prod.name}
${chosenSizeText}
${chosenColorText}
💰 السعر النهائي: ${prod.price.toLocaleString()} د.ع
🏬 المتجر الأصلي: ${prod.originalStore}
الرجاء تأكيد عملية الحجز الفوري 💖`;

    try {
      navigator.clipboard.writeText(orderMsg);
    } catch (err) {
      console.error(err);
    }
    
    setCopySuccessMsg(true);
    setTimeout(() => {
      setCopySuccessMsg(false);
      window.open(getInstagramLink(), '_blank');
    }, 1800);

    setBookingSuccess(prod.id);
    setSelectedProduct(null);
    setTimeout(() => setBookingSuccess(null), 4000);
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerLightHaptic();
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const openProductDetails = (prod: IramoProduct) => {
    triggerMediumHaptic();
    setSelectedProduct(prod);
    setSelectedSize(prod.sizes ? prod.sizes[0] : '');
    setSelectedColor(prod.colors ? prod.colors[0] : '');
  };

  const getAvailabilityLabel = (status: 'in_stock' | 'limited' | 'preorder') => {
    switch (status) {
      case 'in_stock': return 'متوفر فوري ✅';
      case 'limited': return 'كمية شحيحة ⚡';
      case 'preorder': return 'حجز مسبق 📦';
    }
  };

  const getBadgeDetails = (badge?: string) => {
    if (!badge) return null;
    switch (badge) {
      case 'best_seller': return { text: 'الأكثر مبيعاً 🔥', css: 'bg-rose-600 text-white' };
      case 'trending': return { text: 'موصى به ✨', css: 'bg-amber-500 text-white' };
      case 'new_in': return { text: 'جديد كلياً 🆕', css: 'bg-emerald-600 text-white' };
      case 'flash_sale': return { text: 'خصم خاطف ⚡', css: 'bg-pink-600 text-white' };
    }
  };

  return (
    <section className="space-y-4 text-right" dir="rtl" id="preset-products-section">
      
      {/* Shein style Premium Banner Header */}
      <div className="bg-[#111] text-white p-5 rounded-[2.25rem] relative overflow-hidden flex items-center justify-between shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1 z-10 max-w-[240px]">
          <span className="text-[9px] font-black tracking-widest text-pink-400 bg-pink-500/15 py-1 px-3 rounded-full uppercase border border-pink-500/30">
            IRAMO CHIC BOUTIQUE
          </span>
          <h3 className="font-extrabold text-base text-white mt-1 leading-normal">
            التسوق الفاخر على الطريقة العالمية 🛍️
          </h3>
          <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
            أقوى المنتجات طلباً، سيرومات العناية الأصلية وحقائب الماركات للتسليم المباشر في العراق
          </p>
        </div>
        <div className="relative shrink-0 z-10 bg-white/5 p-3 rounded-3xl border border-white/10 backdrop-blur-md">
          <Flame className="w-8 h-8 text-pink-500 animate-bounce" />
          <span className="absolute -top-1.5 -right-1.5 bg-pink-600 text-white text-[7.5px] font-black px-2 py-0.5 rounded-full">
            أصلي
          </span>
        </div>
      </div>

      {/* Success alert toast */}
      {bookingSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2.5 animate-slide-up text-xs font-bold shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>تم تجهيز طلبكِ بنجاح وتم فتح المحادثة لتثبيت التفاصيل! 🥳</span>
        </div>
      )}

      {/* Search, Filter Categories, Sorting, and Wishlist Panel */}
      <div className="space-y-3 bg-white border border-pink-100/40 p-4 rounded-[2.25rem] shadow-xs">
        
        {/* Real search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="ابحثي عن حقائب، سيرومات، عطور أو ماركات عالمية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-pink-50/20 text-gray-700 placeholder-gray-400 font-bold text-xs pr-10 pl-4 py-3 rounded-2xl border border-pink-100/40 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-all text-right"
          />
          <Search className="w-4 h-4 text-pink-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Categories scrolling area */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" dir="rtl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { triggerLightHaptic(); setSelectedCategory(cat); setOnlyShowWishlist(false); }}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border shrink-0 cursor-pointer active:scale-95 ${
                selectedCategory === cat && !onlyShowWishlist
                  ? 'bg-black text-white shadow-md border-black scale-[1.02]'
                  : 'bg-pink-50/20 text-gray-500 border-pink-100 hover:bg-pink-50/40'
              }`}
            >
              {cat === 'الكل' ? '🌟 الكل' : cat}
            </button>
          ))}

          {/* Quick Wishlist Toggle Button */}
          <button
            onClick={() => { triggerLightHaptic(); setOnlyShowWishlist(!onlyShowWishlist); setSelectedCategory('الكل'); }}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5 ${
              onlyShowWishlist
                ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/15'
                : 'bg-rose-50/40 text-rose-700 border-rose-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyShowWishlist ? 'fill-current' : ''}`} />
            <span>المفضلة ({wishlist.length})</span>
          </button>
        </div>

        {/* Sorting Dropdown & Style Indicators */}
        <div className="flex justify-between items-center pt-2.5 border-t border-pink-50/50 flex-row-reverse text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 font-bold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-500" />
            <span>ترتيب حسب:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { triggerLightHaptic(); setSortBy(e.target.value as any); }}
                className="bg-pink-50/40 border border-pink-100 text-[10px] font-black py-1 px-2 pr-6 rounded-lg text-pink-900 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="default">الافتراضي</option>
                <option value="price_asc">السعر: من الأقل للأعلى</option>
                <option value="price_desc">السعر: من الأعلى للأقل</option>
                <option value="rating">الأعلى تقييماً ⭐</option>
                <option value="popular">الأكثر شعبية 🔥</option>
              </select>
              <ChevronDown className="w-3 h-3 text-pink-700 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <span className="text-[10px] text-gray-400 font-bold">
            عرض {processedProducts.length} منتج مميز
          </span>
        </div>
      </div>

      {/* SHEIN & ZARA inspired Luxury Responsive Grid of Beautiful Product Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {processedProducts.map((prod) => {
          const badgeDetails = getBadgeDetails(prod.badge);
          const isFavorited = wishlist.includes(prod.id);
          const discountPercentage = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);

          return (
            <div
              key={prod.id}
              onClick={() => openProductDetails(prod)}
              className="bg-white border border-pink-100/40 rounded-[2.5rem] p-4 flex flex-col justify-between hover:shadow-xl hover:border-pink-300/40 transition-all duration-300 relative group cursor-pointer text-center"
            >
              
              {/* Product Circular Image Frame */}
              <div className="relative">
                <div className="relative w-28 h-28 xs:w-32 xs:h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-4 border-pink-100/60 shadow-md group-hover:border-pink-300 group-hover:scale-105 transition-all duration-500 bg-pink-50/20">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
                </div>

                {/* Luxury Floating Badge */}
                {badgeDetails && (
                  <span className={`absolute -top-1.5 right-1 md:right-3 font-black text-[7.5px] px-2.5 py-1 rounded-full shadow-xs z-10 ${badgeDetails.css}`}>
                    {badgeDetails.text}
                  </span>
                )}

                {/* Wishlist Heart Action (floating top-left) */}
                <button
                  onClick={(e) => toggleWishlist(prod.id, e)}
                  className="absolute -top-1.5 left-1 md:left-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-rose-500 border border-pink-50/50 shadow-md hover:bg-white active:scale-90 transition-all z-10 cursor-pointer"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>

                {/* Discount Percentage Badge */}
                {discountPercentage > 0 && (
                  <div className="absolute bottom-1 right-2 bg-pink-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                    <BadgePercent className="w-2.5 h-2.5 text-white" />
                    <span>خصم {discountPercentage}%</span>
                  </div>
                )}

                {/* Availability badge */}
                <span className="absolute bottom-1 left-2 bg-black/70 text-white text-[7px] font-black px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {getAvailabilityLabel(prod.availability)}
                </span>
              </div>

              {/* Product Details Area */}
              <div className="pt-4 flex-1 flex flex-col justify-between space-y-3 text-center">
                
                <div className="space-y-1">
                  {/* Store Name & Ratings */}
                  <div className="flex justify-between items-center text-[8.5px] font-bold text-gray-400 px-1">
                    <span className="truncate max-w-[80px]">متجر: {prod.originalStore}</span>
                    <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span className="text-[8px] font-black text-amber-700">{prod.rating}</span>
                    </div>
                  </div>

                  {/* Product Title */}
                  <h4 className="font-extrabold text-[11px] text-gray-800 line-clamp-2 leading-relaxed min-h-[34px] px-0.5">
                    {prod.name}
                  </h4>
                </div>

                {/* Price and Add CTA bar */}
                <div className="space-y-3 pt-2.5 border-t border-dashed border-pink-100/50">
                  
                  {/* Luxury Global Store Pricing Block */}
                  <div className="flex flex-col items-center justify-center">
                    {prod.originalPrice > prod.price && (
                      <span className="text-[9px] text-gray-400 line-through font-bold">
                        {prod.originalPrice.toLocaleString()} د.ع
                      </span>
                    )}
                    <span className="text-pink-700 font-black text-[13.5px] tracking-tight mt-0.5">
                      {prod.price.toLocaleString()} د.ع
                    </span>
                  </div>

                  {/* Size Mini Previews */}
                  {prod.sizes && prod.sizes.length > 0 && (
                    <div className="flex justify-center gap-1 text-[8px] font-bold text-gray-400 overflow-hidden max-w-full">
                      {prod.sizes.map(sz => (
                        <span key={sz} className="border border-pink-100/60 px-1.5 py-0.5 rounded-lg bg-pink-50/10 shrink-0">
                          {sz}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Modern Shein/Zara Style CTA Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); openProductDetails(prod); }}
                    className="w-full bg-[#111] hover:bg-pink-700 text-white font-black text-[9.5px] py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 shadow-sm cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-white" />
                    <span>إضافة للسلة 🛍️</span>
                  </button>
                </div>

              </div>

            </div>
          );
        })}

        {processedProducts.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 bg-white/50 rounded-[2.5rem] border border-pink-100/40 flex flex-col items-center justify-center gap-2">
            <SlidersHorizontal className="w-8 h-8 text-pink-200" />
            <p className="text-xs font-bold">لا يوجد منتجات تطابق الخيارات المحددة.</p>
            <button
              onClick={() => { triggerLightHaptic(); setSearchQuery(''); setSelectedCategory('الكل'); setOnlyShowWishlist(false); }}
              className="text-[10px] font-black text-pink-700 hover:underline"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LUXURY SLIDE-UP BOTTOM SHEET (PRODUCT DETAIL DRAWER) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-end justify-center p-0">
            
            {/* Overlay background closer */}
            <div className="absolute inset-0" onClick={() => setSelectedProduct(null)} />

            {/* Slide up content card */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-[#fffcfb] rounded-t-[3rem] border-t border-pink-100/60 w-full max-w-[430px] h-[85vh] max-h-[850px] overflow-y-auto no-scrollbar relative flex flex-col justify-between z-10 pb-6"
            >
              
              {/* Close float button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-xs text-white flex items-center justify-center z-50 hover:bg-black/60 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Main Contents Box */}
              <div className="p-5 text-right space-y-5">
                
                {/* 1. Large Fashion Image Display with Badges */}
                <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-pink-50 border border-pink-100/50 relative shadow-inner">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {selectedProduct.badge && (
                    <span className="absolute top-3 right-3 bg-rose-600 text-white font-black text-[9px] px-3.5 py-1.5 rounded-full shadow-md">
                      {getBadgeDetails(selectedProduct.badge)?.text}
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 bg-black/65 text-white font-black text-[9px] px-3 py-1 rounded-md">
                    المصدر الأصلي: {selectedProduct.originalStore}
                  </span>
                </div>

                {/* 2. Title, Ratings & Stock Status */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-pink-600 uppercase bg-pink-50 px-3 py-1 rounded-full">
                      {selectedProduct.category}
                    </span>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {getAvailabilityLabel(selectedProduct.availability)}
                    </span>
                  </div>

                  <h3 className="font-black text-sm md:text-base text-gray-800 leading-relaxed">
                    {selectedProduct.name}
                  </h3>

                  {/* Ratings Row */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(selectedProduct.rating) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="font-black text-amber-800">{selectedProduct.rating}</span>
                    <span>•</span>
                    <span>{selectedProduct.reviewsCount} مراجعة مؤكدة</span>
                  </div>
                </div>

                {/* 3. Luxury Price & Deal Details */}
                <div className="bg-pink-50/30 border border-pink-100/40 p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">السعر النهائي المعروض</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-pink-700 font-black text-lg md:text-xl">{selectedProduct.price.toLocaleString()}</span>
                      <span className="text-xs font-black text-pink-800">د.ع</span>
                    </div>
                  </div>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <div className="text-left">
                      <span className="text-xs text-gray-400 line-through font-bold block">
                        {selectedProduct.originalPrice.toLocaleString()} د.ع
                      </span>
                      <span className="text-[10px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-md mt-0.5 inline-block">
                        وفرِي {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% الآن
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. Core Description */}
                <div className="space-y-1.5">
                  <h4 className="font-black text-xs text-gray-800">تفاصيل المنتج الفاخرة:</h4>
                  <p className="text-xs text-gray-500 font-bold leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* 5. SIZE SELECTOR SHEET */}
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-700">حددِي المقاس / الحجم:</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => { triggerLightHaptic(); setSelectedSize(sz); }}
                          className={`px-4 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                            selectedSize === sz
                              ? 'bg-black text-white border-black scale-102 shadow-xs'
                              : 'bg-white text-gray-500 border-pink-100 hover:border-pink-300'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. COLOR SELECTOR SHEET */}
                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-700">حددِي اللون / الخامة:</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map((col) => (
                        <button
                          key={col}
                          onClick={() => { triggerLightHaptic(); setSelectedColor(col); }}
                          className={`px-4 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                            selectedColor === col
                              ? 'bg-gradient-to-r from-pink-700 to-pink-500 text-white border-transparent scale-102 shadow-sm'
                              : 'bg-white text-gray-500 border-pink-100 hover:border-pink-300'
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. REAL CUSTOMER REVIEWS HUB */}
                <div className="space-y-3 pt-3 border-t border-pink-100/50">
                  <div className="flex justify-between items-center text-xs font-black text-gray-800">
                    <span>آراء الزبونات المجرّبات 🗣️</span>
                    <span className="text-[10px] text-pink-700 bg-pink-100/50 px-2 py-0.5 rounded-full">أصلية وموثقة</span>
                  </div>

                  <div className="space-y-3">
                    {selectedProduct.reviewsList.map((rev, idx) => (
                      <div key={idx} className="bg-pink-50/25 border border-pink-100/20 p-3.5 rounded-2xl space-y-1.5 text-right">
                        <div className="flex justify-between items-center text-[10px] font-black text-gray-700">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center text-[8.5px] font-black shrink-0">
                              {rev.author[0]}
                            </div>
                            <span>{rev.author}</span>
                          </div>
                          <span className="text-gray-400 font-bold">{rev.date}</span>
                        </div>
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, starIdx) => (
                            <Star key={starIdx} className={`w-3 h-3 ${starIdx < rev.rating ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                        <p className="text-[10.5px] text-gray-500 font-bold leading-normal">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* STICKY CTA BOOKING BUTTON */}
              <div className="px-5 py-3 border-t border-pink-100/30 bg-[#fffcfb] relative">
                {copySuccessMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-5 -top-12 bg-emerald-600 text-white font-bold text-[10px] p-2.5 rounded-xl shadow-md text-center z-50 flex items-center justify-center gap-1.5"
                  >
                    <span>✨ تم نسخ تفاصيل الطلب! جاري توجيهكِ لإنستغرام...</span>
                  </motion.div>
                )}
                <button
                  onClick={() => handleOrderProduct(selectedProduct, selectedSize, selectedColor)}
                  className="w-full h-12 bg-black hover:bg-pink-700 hover:text-white text-white font-black text-xs rounded-full shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  <span>تأكيد الطلب عبر حساب إنستغرام 📸</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
