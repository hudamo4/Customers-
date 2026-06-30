import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, 
  ShoppingBag, 
  Heart, 
  User, 
  Bell, 
  Search, 
  Star, 
  Filter, 
  ArrowLeft, 
  ArrowRight, 
  ShoppingCart, 
  Trash2, 
  Shield, 
  Plus, 
  Minus, 
  Check, 
  MapPin, 
  Sparkles, 
  MessageSquare, 
  Gift, 
  HelpCircle, 
  Phone, 
  Lock, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Compass, 
  Ticket, 
  Send, 
  Award, 
  Clock,
  Eye,
  SlidersHorizontal,
  ThumbsUp,
  X,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_AVATAR } from '../utils/avatar';
import TrackingView from './TrackingView';
import ShippingCalculator from './ShippingCalculator';
import CurrencyConverter from './CurrencyConverter';
import Elegant3DSpinWheel from './Elegant3DSpinWheel';
import IramoWaxSeal from './IramoWaxSeal';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic, triggerWarningHaptic } from '../utils/haptics';

// Use same interface for products
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
      { author: 'فاطمة الموسوي', rating: 5, comment: 'توصيل سريع والختم الأصلي متواجد ع الععلبة. تجربة شراء ممتازة.', date: 'قبل ٩ أيام' }
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
  }
];

export interface CartItem {
  product: IramoProduct;
  quantity: number;
  size?: string;
  color?: string;
}

interface CustomerPortalProps {
  onSwitchToAdmin: () => void;
  showAdminPasscode: () => void;
}

type MainTab = 'home' | 'shop' | 'orders' | 'wishlist' | 'profile';

export default function CustomerPortal({ onSwitchToAdmin, showAdminPasscode }: CustomerPortalProps) {
  const { 
    profile, 
    notifications, 
    customizations, 
    invoices, 
    shipments, 
    isLoggedIn, 
    setShowLoginModal,
    redeemPoints,
    updateProfile,
    payInvoice
  } = useApp();

  const [activeMainTab, setActiveMainTab] = useState<MainTab>('shop'); // Start on shop by default
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showContactSupportModal, setShowContactSupportModal] = useState<boolean>(false);
  const [secretClicks, setSecretClicks] = useState<number>(0);

  // Lock body scroll when support modal is active
  useEffect(() => {
    if (showContactSupportModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showContactSupportModal]);

  const handleSecretAvatarClick = () => {
    const nextClicks = secretClicks + 1;
    if (nextClicks >= 3) {
      setSecretClicks(0);
      triggerSuccessHaptic();
      onSwitchToAdmin();
    } else {
      setSecretClicks(nextClicks);
      triggerLightHaptic();
      // Reset clicks after 2.5 seconds of silence
      const timer = setTimeout(() => {
        setSecretClicks(0);
      }, 2500);
      return () => clearTimeout(timer);
    }
  };

  // Redirect to orders on login, and limit tab access when logged out
  const prevLoggedIn = React.useRef(isLoggedIn);
  React.useEffect(() => {
    if (isLoggedIn && !prevLoggedIn.current) {
      setActiveMainTab('orders'); // Open "طلباتي" (Invoices & Shipments) automatically on login
    } else if (!isLoggedIn) {
      if (activeMainTab !== 'shop' && activeMainTab !== 'profile') {
        setActiveMainTab('shop'); // Default to store when logged out
      }
    }
    prevLoggedIn.current = isLoggedIn;
  }, [isLoggedIn, activeMainTab]);

  // Customer sub-pages (controlled internally for deep-dive customer screens)
  const [selectedProduct, setSelectedProduct] = useState<IramoProduct | null>(null);
  
  // Feature gating helper
  const isFeatureEnabled = (featureName: string) => {
    if (!customizations || !customizations.features) return true;
    return customizations.features[featureName] !== false;
  };

  // Luxury upgrades states
  const [recentlyViewed, setRecentlyViewed] = useState<IramoProduct[]>(() => {
    try {
      const saved = localStorage.getItem('iramo_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareProducts, setCompareProducts] = useState<IramoProduct[]>([]);
  const [showComparisonDrawer, setShowComparisonDrawer] = useState<boolean>(false);
  const [activeGalleryImageIndex, setActiveGalleryImageIndex] = useState<number>(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);

  // New Checkout Fields
  const [giftWrapping, setGiftWrapping] = useState<boolean>(false);
  const [sellerNotes, setSellerNotes] = useState<string>('');
  const [shippingMethod, setShippingMethod] = useState<'express' | 'sea'>('express');
  const [paymentMethod, setPaymentMethod] = useState<'zain' | 'card' | 'cod'>('cod');

  const [activeBannerIndex, setActiveBannerIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 23, seconds: 15 });

  // Countdown timer for Flash Sales
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let s = prev.seconds - 1;
        let m = prev.minutes;
        let h = prev.hours;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 23;
        }
        return { hours: h, minutes: m, seconds: s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Banner rotation
  useEffect(() => {
    if (activeMainTab === 'home' && customizations.banners && customizations.banners.length > 0) {
      const bannerTimer = setInterval(() => {
        setActiveBannerIndex(prev => (prev + 1) % customizations.banners!.length);
      }, 5000);
      return () => clearInterval(bannerTimer);
    }
  }, [activeMainTab, customizations.banners]);

  // Reset details and record recently viewed when product changes
  useEffect(() => {
    if (selectedProduct) {
      setActiveGalleryImageIndex(0);
      setIsPlayingVideo(false);
      setRecentlyViewed(prev => {
        const filtered = prev.filter(p => p.id !== selectedProduct.id);
        const updated = [selectedProduct, ...filtered].slice(0, 6);
        localStorage.setItem('iramo_recently_viewed', JSON.stringify(updated));
        return updated;
      });
    }
  }, [selectedProduct]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('iramo_customer_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Checkout Fields
  const [checkoutProvince, setCheckoutProvince] = useState(profile?.city || 'بغداد');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState(profile?.phone || '');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Shop Filters
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [shopSearch, setShopSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc' | 'rating'>('default');

  // Wishlist State (persisted locally)
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('iramo_customer_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Support State
  const [supportMessage, setSupportMessage] = useState('');
  const [supportTickets, setSupportTickets] = useState<{ id: string; subject: string; status: string; date: string }[]>([
    { id: 'TCK-9901', subject: 'استفسار عن موعد وصول طرد ديور', status: 'مكتمل ✅', date: 'قبل يومين' }
  ]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Wheel Of Fortune State
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);

  // Live reviews for selected product
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [localReviews, setLocalReviews] = useState<Record<string, IramoProduct['reviewsList']>>({});

  // Save Cart and Wishlist to local storage
  useEffect(() => {
    localStorage.setItem('iramo_customer_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('iramo_customer_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Master product list combining presets and DB customizations
  const allProducts = useMemo(() => {
    const customPresets = (customizations?.presetProducts || []).map((p: any) => ({
      id: p.id,
      name: p.title || p.name,
      price: typeof p.price === 'string' ? parseInt(p.price.replace(/,/g, '')) : (p.price || 120000),
      originalPrice: typeof p.originalPrice === 'string' ? parseInt(p.originalPrice.replace(/,/g, '')) : (p.originalPrice || 140000),
      image: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600',
      category: p.category || 'عام',
      originalStore: p.storeName || p.originalStore || 'متجر عالمي',
      description: p.description || 'وصف المنتج الراقي المقدم للتسليم الفوري من بوتيك إيرامو شيك.',
      availability: p.availability || 'in_stock',
      rating: p.rating || 4.9,
      reviewsCount: p.reviewsCount || 42,
      badge: p.badge || 'trending',
      sizes: p.sizes || ['Standard'],
      colors: p.colors || ['أصلي'],
      reviewsList: p.reviewsList || [
        { author: 'هدى السلطاني', rating: 5, comment: 'راقي جداً وأصلي كالعادة من إيرامو ✨', date: 'الآن' }
      ]
    }));

    if (customPresets.length > 0) return customPresets;
    return DEFAULT_IRAMO_PRODUCTS;
  }, [customizations]);

  // Unique categories helper
  const categories = useMemo(() => {
    const cats = new Set(allProducts.map(p => p.category));
    return ['الكل', ...Array.from(cats)];
  }, [allProducts]);

  // Filtered and Sorted Products
  const processedProducts = useMemo(() => {
    let result = [...allProducts];

    // Search filter
    if (shopSearch.trim() !== '') {
      result = result.filter(p => p.name.toLowerCase().includes(shopSearch.toLowerCase()) || p.description.toLowerCase().includes(shopSearch.toLowerCase()));
    }

    // Category filter
    if (selectedCategory !== 'الكل') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Sorting
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [allProducts, shopSearch, selectedCategory, sortBy]);

  // Cart Handlers
  const addToCart = (product: IramoProduct, size?: string, color?: string) => {
    triggerSuccessHaptic();
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id && item.size === size && item.color === color);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { product, quantity: 1, size, color }];
    });
  };

  const removeFromCart = (index: number) => {
    triggerWarningHaptic();
    setCart(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateCartQuantity = (index: number, delta: number) => {
    triggerLightHaptic();
    setCart(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, idx) => idx !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  const deliveryCost = useMemo(() => {
    if (shippingMethod === 'express') return 12000;
    if (checkoutProvince === 'بغداد') return 5000;
    return 8000;
  }, [checkoutProvince, shippingMethod]);

  const cartTotal = useMemo(() => {
    const total = cartSubtotal + deliveryCost - discountAmount + (giftWrapping ? 5000 : 0);
    return total > 0 ? total : 0;
  }, [cartSubtotal, deliveryCost, discountAmount, giftWrapping]);

  // Apply Promo Coupons
  const applyPromo = () => {
    triggerLightHaptic();
    const cleanCode = couponCode.trim().toLowerCase();
    if (cleanCode === 'huda10' || cleanCode === 'iramo10') {
      setDiscountAmount(10000);
      setCouponApplied(true);
    } else if (cleanCode === 'vip25') {
      setDiscountAmount(25000);
      setCouponApplied(true);
    } else {
      triggerWarningHaptic();
      alert('⚠️ كوبون الخصم هذا غير صالح أو منتهي الصلاحية 🌸');
    }
  };

  // Submit Order Simulator (safe from backend API exposure)
  const handlePlaceOrder = () => {
    if (!checkoutAddress.trim() || !checkoutPhone.trim()) {
      triggerWarningHaptic();
      alert('⚠️ يرجى تعبئة عنوان موقع التسليم ورقم الهاتف للتوصيل.');
      return;
    }
    triggerSuccessHaptic();
    setOrderConfirmed(true);
    setCart([]);
  };

  // Spin Wheel Handler
  const spinWheel = () => {
    if (isSpinning) return;
    triggerMediumHaptic();
    setIsSpinning(true);
    setSpinResult(null);

    setTimeout(() => {
      const prizes = [
        '🎁 خصم بقيمة ١٠ آلاف دينار كود: IRAMO10',
        '⭐️ ١٥٠ نقطة ولاء إضافية في حسابكِ',
        '🌸 عينة عطر ميني مجانية مع طلبك القادم',
        '✨ شحن مجاني لطلبكِ القادم من البوتيك',
        '💖 هدية لطيفة مقدمة من هدوشة وبطوط'
      ];
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      setSpinResult(randomPrize);
      setIsSpinning(false);
      triggerSuccessHaptic();
    }, 2800);
  };

  // Add review to a product
  const submitReview = (productId: string) => {
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;
    triggerSuccessHaptic();
    const newRev = {
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: 'الآن'
    };

    setLocalReviews(prev => {
      const existing = prev[productId] || [];
      return { ...prev, [productId]: [newRev, ...existing] };
    });

    setNewReviewAuthor('');
    setNewReviewComment('');
  };

  // Help support ticket submission
  const createTicket = () => {
    if (!ticketSubject.trim()) return;
    triggerSuccessHaptic();
    setSupportTickets(prev => [
      { id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`, subject: ticketSubject.trim(), status: 'قيد المراجعة ⏳', date: 'الآن' },
      ...prev
    ]);
    setTicketSubject('');
    setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 4000);
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#fffcfb] text-pink-950 text-right font-sans" dir="rtl">
      
      {/* 1. CUSTOM FEMININE GENTLE HEADER */}
      <header className="h-16 border-b border-pink-100/35 bg-white/95 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-pink-100/50 flex items-center justify-center text-pink-700 font-serif font-black shadow-inner">
            IR
          </div>
          <div>
            <h1 className="text-sm font-black text-pink-950 tracking-tight">إيرامو بوتيك 🌸</h1>
            <p className="text-[8.5px] font-bold text-pink-600">لوحة التجربة الفورية الفاخرة</p>
          </div>
        </div>

        {/* Action icons & user profile entry */}
        <div className="flex items-center gap-2">
          {/* Admin Login / Switch button with subtle golden glow */}
          <button
            onClick={() => { 
              triggerLightHaptic(); 
              if (profile?.role === 'admin') {
                onSwitchToAdmin();
              } else {
                setShowLoginModal(true); 
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[9.5px] font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer animate-pulse border border-amber-400"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-100" />
            <span>{profile?.role === 'admin' ? 'لوحة الإدارة 👑' : 'بوابة الإدارة 👑'}</span>
          </button>

          {/* Cart Icon trigger */}
          <button 
            onClick={() => { triggerLightHaptic(); setShowCartDrawer(true); }}
            className="w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100/70 text-pink-700 flex items-center justify-center relative transition-transform active:scale-90 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-white text-[8px] font-black flex items-center justify-center animate-bounce">
                {cart.length}
              </span>
            )}
          </button>

          {/* User profile details & passcode mode trigger */}
          <button
            onClick={() => { triggerLightHaptic(); setActiveMainTab('profile'); }}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-pink-100 shadow-sm active:scale-95 transition-all bg-white"
          >
            <img 
              src={profile?.avatar || DEFAULT_AVATAR} 
              alt="Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </header>

      {/* 2. MAIN SCROLLABLE VIEW CONTAINER */}
      <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        <AnimatePresence mode="wait">
          
          {/* HOME TAB */}
          {activeMainTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-6 text-right"
              dir="rtl"
            >
              {/* Dynamic Rotating Premium Luxury Banners with Indicator dots */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-xl border border-pink-100 bg-[#120811] text-white min-h-[160px] flex items-center p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
                
                {customizations.banners && customizations.banners.length > 0 ? (
                  <div className="w-full space-y-2 animate-fade-in z-10 relative">
                    <span className="text-[8px] font-black text-pink-400 bg-pink-500/15 py-1 px-3 rounded-full uppercase border border-pink-500/30">
                      عروض متجر إيرامو الحصرية 👑
                    </span>
                    <h2 className="font-extrabold text-base leading-snug">
                      {customizations.banners[activeBannerIndex]?.title || "تألقي ببريق لا يقاوم ✨"}
                    </h2>
                    <p className="text-[10px] text-gray-300 leading-relaxed font-semibold">
                      {customizations.banners[activeBannerIndex]?.subtitle || "أفخم الحقائب والماركات العالمية المختارة بعناية."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 z-10 max-w-[250px] relative">
                    <span className="text-[8px] font-black text-pink-400 bg-pink-500/15 py-1 px-3 rounded-full uppercase border border-pink-500/30">
                      WORLD OF BEAUTY 🌸
                    </span>
                    <h2 className="font-extrabold text-base leading-snug">
                      أهلاً بكِ في عالم الأنـاقة والـفخامة الـمطلقة ✨
                    </h2>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-semibold">
                      نوفر لكِ أرقى قطع الموضة العالمية وتوصيلها حتى باب منزلكِ بعناية تامة.
                    </p>
                  </div>
                )}

                {/* Banner Dot Indicators */}
                {customizations.banners && customizations.banners.length > 1 && (
                  <div className="absolute bottom-3 left-4 flex gap-1 z-10">
                    {customizations.banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveBannerIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          activeBannerIndex === idx ? 'bg-pink-500 w-3' : 'bg-gray-500/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Loyalty Club Section (Gate: loyaltySystem) */}
              {isFeatureEnabled('loyaltySystem') && (
                <div className="bg-gradient-to-r from-amber-50 to-pink-50/70 border border-amber-200/50 rounded-[2rem] p-4 flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full">برنامج الولاء الملكي 👑</span>
                    <h4 className="text-xs font-black text-pink-950">نادي زبونات إيرامو النخبة</h4>
                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-700">
                      <Award className="w-3.5 h-3.5" />
                      <span>رصيد نقاطكِ الحالي: {profile?.points || 1250} نقطة</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { triggerLightHaptic(); setActiveMainTab('profile'); }}
                    className="bg-[#111] hover:bg-pink-700 text-white text-[9px] font-black px-3.5 py-1.5 rounded-full transition-transform active:scale-95 cursor-pointer shadow-sm"
                  >
                    استبدال النقاط 🎁
                  </button>
                </div>
              )}

              {/* Browse Fast Categories Grid */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-black text-pink-950">تصفح الأقسام والماركات الكبرى 🏷️</h3>
                  <button 
                    onClick={() => { triggerLightHaptic(); setActiveMainTab('shop'); }}
                    className="text-[9px] font-black text-pink-700 hover:underline flex items-center gap-0.5"
                  >
                    عرض الكل
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'all', title: 'الكل 🛍️', cat: 'الكل' },
                    { id: 'bags', title: 'حقائب 👜', cat: 'حقائب وأحذية' },
                    { id: 'care', title: 'عناية ✨', cat: 'عناية وتجميل' },
                    { id: 'perfumes', title: 'عطور 🌸', cat: 'عطور وبخور' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        triggerLightHaptic();
                        setSelectedCategory(c.cat);
                        setActiveMainTab('shop');
                      }}
                      className="bg-white border border-pink-50 hover:border-pink-200 rounded-2xl py-3 px-1 flex flex-col items-center justify-center text-center shadow-xs active:scale-95 transition-all cursor-pointer hover:bg-pink-50/10"
                    >
                      <span className="text-[10px] font-black text-pink-950">{c.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flash Sales Section (Gate: flashSales) with Interactive Countdown Timer */}
              {isFeatureEnabled('flashSales') && (
                <div className="bg-gradient-to-l from-rose-50 to-pink-50 border border-rose-100 rounded-[2.5rem] p-5 space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-24 h-24 bg-rose-200/20 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚡️</span>
                      <div>
                        <h4 className="text-xs font-black text-rose-950">تخفيضات ومضية سريعة</h4>
                        <p className="text-[8px] text-gray-400 font-bold">عروض حصرية تذهب قريباً جداً، تسوقي الآن!</p>
                      </div>
                    </div>

                    {/* Countdown box */}
                    <div className="flex gap-1 items-center text-white text-[10px] font-extrabold" dir="ltr">
                      <span className="bg-rose-600 px-2 py-1 rounded-lg shadow-xs min-w-[22px] text-center">
                        {String(countdown.hours).padStart(2, '0')}
                      </span>
                      <span className="text-rose-600 font-black animate-pulse">:</span>
                      <span className="bg-rose-600 px-2 py-1 rounded-lg shadow-xs min-w-[22px] text-center">
                        {String(countdown.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-rose-600 font-black animate-pulse">:</span>
                      <span className="bg-rose-600 px-2 py-1 rounded-lg shadow-xs min-w-[22px] text-center">
                        {String(countdown.seconds).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Horizontally scrollable discounted products */}
                  <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                    {allProducts?.slice(0, 4).map(prod => {
                      const discountPercentage = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
                      return (
                        <div
                          key={prod.id}
                          onClick={() => setSelectedProduct(prod)}
                          className="bg-white p-3 rounded-2xl border border-rose-100 shadow-xs hover:border-rose-300 transition-all shrink-0 w-32 space-y-2 text-right relative cursor-pointer group"
                        >
                          <span className="absolute top-2 right-2 bg-rose-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full z-10">
                            خصم {discountPercentage}% 🔥
                          </span>
                          <div className="w-full h-20 rounded-xl overflow-hidden bg-gray-50 border border-pink-50">
                            <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                          </div>
                          <div className="space-y-1">
                            <h5 className="text-[9px] font-black text-gray-800 truncate">{prod.name}</h5>
                            <div className="flex flex-col">
                              <span className="text-[7.5px] text-gray-400 line-through font-bold">{prod.originalPrice.toLocaleString()} د.ع</span>
                              <span className="text-rose-600 font-black text-[10px]">{prod.price.toLocaleString()} د.ع</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Personalized Smart Suggestions (Gate: aiAssistant) */}
              {isFeatureEnabled('aiAssistant') && (
                <div className="bg-gradient-to-r from-pink-900 to-indigo-950 text-white p-5 rounded-[2.5rem] space-y-4 shadow-xl border border-indigo-950/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/25 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black text-pink-100">ترشيحات ذكية مخصصة لكِ بالذكاء الاصطناعي ✨</h4>
                      <p className="text-[8px] text-gray-400 font-bold">بناءً على تصفحكِ، تقترح عليكِ المساعدة "هدوشة" هذه المجموعة الرائعة:</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {allProducts?.slice(4, 6).map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => setSelectedProduct(prod)}
                        className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/10 hover:border-pink-400/50 transition-all text-right space-y-2 cursor-pointer"
                      >
                        <div className="w-full h-20 rounded-xl overflow-hidden bg-white/5 relative">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <h5 className="text-[9px] font-black text-white truncate">{prod.name}</h5>
                        <div className="flex justify-between items-center">
                          <span className="text-pink-300 font-black text-[9px]">{prod.price.toLocaleString()} د.ع</span>
                          <span className="text-[7.5px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded-md font-bold">توصية عالية ★</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Sellers and New Arrivals Sections */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-pink-950 px-1">الأكثر مبيعاً هذا الأسبوع 🔥</h3>
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                  {allProducts?.slice(2, 7).map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => setSelectedProduct(prod)}
                      className="bg-white p-3 rounded-2xl border border-pink-50 shadow-xs hover:border-pink-300 transition-all shrink-0 w-32 space-y-2 text-right cursor-pointer"
                    >
                      <div className="w-full h-24 rounded-xl overflow-hidden bg-gray-50 border border-pink-50">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[7px] text-pink-600 bg-pink-50 px-1.5 py-0.2 rounded font-black">{prod.category}</span>
                        <h5 className="text-[9px] font-black text-gray-800 truncate">{prod.name}</h5>
                        <span className="text-pink-700 font-black text-[10px] block">{prod.price.toLocaleString()} د.ع</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Viewed Products Section */}
              {recentlyViewed && recentlyViewed.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-dashed border-pink-100">
                  <h3 className="text-xs font-black text-pink-950 px-1">آخر المنتجات التي شاهدتِها مؤخراً 👀</h3>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                    {recentlyViewed.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => setSelectedProduct(prod)}
                        className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-pink-50 shadow-xs hover:border-pink-200 transition-all shrink-0 cursor-pointer min-w-[140px]"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-pink-50 shrink-0">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="text-right min-w-0">
                          <h5 className="text-[8px] font-black text-gray-800 truncate">{prod.name}</h5>
                          <span className="text-pink-700 font-black text-[9px]">{prod.price.toLocaleString()} د.ع</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick daily tips & Disney style quote card */}
              <div className="bg-pink-500/5 border border-pink-100/50 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-pink-700">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  <span className="text-[10px] font-black uppercase">نصيحة الجمال اليومية من هدوشة 🌸</span>
                </div>
                <p className="text-[9.5px] text-pink-900 font-bold leading-relaxed">
                  "جمالكِ الحقيقي ينبع من ثقتكِ واهتمامكِ بأدق تفاصيلكِ الكريمة. احرصي على ترطيب بشرتكِ يومياً بسيروم اوباجي الأصلي لتمنحي طلتكِ نضارة تدوم ببريق ملكي."
                </p>
              </div>

              {/* Brand highlights */}
              <div className="bg-white border border-pink-100 p-4 rounded-3xl space-y-3">
                <h4 className="text-[11px] font-black text-pink-950">لماذا تتسوقين بأمان من إيرامو؟ 🛡️</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <h5 className="text-[9.5px] font-black text-emerald-700">منتجات أصلية 100%</h5>
                    <p className="text-[8.5px] text-gray-400 font-bold">مستوردة مباشرة من بوتيكات باريس ونيويورك ودبي.</p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-[9.5px] font-black text-rose-700">تغليف شيك وهدايا</h5>
                    <p className="text-[8.5px] text-gray-400 font-bold">تصلكِ جميع الطلبيات مع كيس الماركة وعلب فاخرة مجانية.</p>
                  </div>
                </div>
              </div>

              {/* Interactive Shipping Cost Calculator */}
              <ShippingCalculator />
            </motion.div>
          )}

          {/* SHOP TAB (All products with search, sorting, details review) */}
          {activeMainTab === 'shop' && (
            <motion.div 
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-4"
            >
              {/* Filter / Search header */}
              <div className="space-y-3">
                <h2 className="text-xs font-black text-pink-950">صالة التسوق الفاخرة 🛍️</h2>
                
                {/* Search Input Bar */}
                <div className="relative">
                  <Search className="absolute right-3.5 top-3 w-4 h-4 text-pink-400" />
                  <input 
                    type="text"
                    value={shopSearch}
                    onChange={(e) => setShopSearch(e.target.value)}
                    placeholder="ابحثي عن حقيبتكِ، سيروم، عطركِ المفضل..."
                    className="w-full bg-pink-50/10 border-2 border-pink-100 rounded-2xl py-2 px-10 text-[10px] font-bold text-pink-950 focus:outline-none focus:border-pink-500 text-right"
                  />
                </div>

                {/* Filter and sorting control row */}
                <div className="flex justify-between items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white border border-pink-100 rounded-xl px-2 py-1.5 text-[9px] font-bold text-pink-950 cursor-pointer"
                  >
                    <option value="default">الترتيب الافتراضي</option>
                    <option value="priceAsc">السعر: من الأقل للأعلى</option>
                    <option value="priceDesc">السعر: من الأعلى للأقل</option>
                    <option value="rating">الأعلى تقييماً ⭐️</option>
                  </select>

                  {/* Horizontal Categories Bubble list */}
                  <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { triggerLightHaptic(); setSelectedCategory(cat); }}
                        className={`px-3 py-1.5 rounded-full text-[8.5px] font-black shrink-0 transition-all cursor-pointer ${
                          selectedCategory === cat 
                            ? 'bg-pink-700 text-white shadow-xs scale-105' 
                            : 'bg-pink-50 text-pink-800 hover:bg-pink-100/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products Grid Layout */}
              <div className="grid grid-cols-2 gap-3">
                {processedProducts.map(prod => {
                  const isFavorited = wishlist.includes(prod.id);
                  return (
                    <div 
                      key={prod.id}
                      onClick={() => setSelectedProduct(prod)}
                      className="bg-white border border-pink-100/50 hover:border-pink-300/80 rounded-3xl p-3 flex flex-col justify-between relative shadow-xs hover:shadow-md transition-all cursor-pointer group animate-fade-in"
                    >
                      {/* Favorite Heart action (floating absolute top-left) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerLightHaptic();
                          setWishlist(prev => 
                            prev.includes(prod.id) ? prev.filter(x => x !== prod.id) : [...prev, prod.id]
                          );
                        }}
                        className="absolute top-2.5 left-2.5 w-7 h-7 bg-white/90 backdrop-blur-xs rounded-full border border-pink-50 flex items-center justify-center text-rose-500 shadow-sm z-10 active:scale-90 transition-transform cursor-pointer"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                      </button>

                      <div className="space-y-2">
                        {/* Image wrap with standard ReferrerPolicy as requested */}
                        <div className="w-full h-32 rounded-2xl overflow-hidden bg-gray-50 border border-pink-50 relative">
                          <img 
                            src={prod.image} 
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/65 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md">
                            {prod.availability === 'in_stock' ? 'متوفر فوري ✅' : 'حجز مسبق 📦'}
                          </span>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="flex justify-between items-center text-[8px] font-bold text-gray-400">
                            <span>متجر: {prod.originalStore}</span>
                            <span className="flex items-center gap-0.5 text-amber-500">
                              <Star className="w-2 h-2 fill-current" />
                              {prod.rating}
                            </span>
                          </div>
                          <h4 className="text-[10px] font-extrabold text-gray-800 line-clamp-2 min-h-[28px] leading-normal">
                            {prod.name}
                          </h4>
                        </div>
                      </div>

                      {/* Pricing and cart add button */}
                      <div className="pt-2 border-t border-dashed border-pink-50 mt-2 space-y-2 text-center">
                        <div>
                          {prod.originalPrice > prod.price && (
                            <span className="text-[8.5px] text-gray-400 line-through font-bold">
                              {prod.originalPrice.toLocaleString()} د.ع
                            </span>
                          )}
                          <div className="text-pink-700 font-black text-[12px]">
                            {prod.price.toLocaleString()} د.ع
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(prod, prod.sizes?.[0], prod.colors?.[0]);
                          }}
                          className="w-full bg-[#111] hover:bg-pink-700 text-white text-[8.5px] font-black py-1.5 rounded-full flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <ShoppingCart className="w-3 h-3 text-white" />
                          <span>إضافة للسلة 🛍️</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {processedProducts.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400 bg-white border border-pink-100 rounded-3xl flex flex-col items-center justify-center gap-2">
                    <SlidersHorizontal className="w-7 h-7 text-pink-200" />
                    <p className="text-[10px] font-bold">لم نجد منتجات مطابقة للبحث 🌸</p>
                    <button 
                      onClick={() => { setShopSearch(''); setSelectedCategory('الكل'); }}
                      className="text-[10px] text-pink-700 font-black underline hover:text-pink-800"
                    >
                      إعادة ضبط
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ORDERS & TRACKING TAB */}
          {activeMainTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-5"
            >
              <div className="space-y-1 text-right">
                <h2 className="text-xs font-black text-pink-950">شحناتي وطلباتي الكريمة 📦</h2>
                <p className="text-[9.5px] text-gray-400 font-bold">تتبعي فواتير طلباتك وحالة الشحنات النشطة القادمة من البوتيكات العالمية.</p>
              </div>

              {/* SHIPMENT TRACKING (Render standard TrackingView which has live maps and safe updates) */}
              <div className="space-y-3">
                <div className="bg-pink-100/40 p-3 rounded-2xl border border-pink-100 flex items-center gap-2">
                  <span className="text-lg">🗺️</span>
                  <div>
                    <h4 className="text-[10.5px] font-black text-pink-950">لوحة تتبع الشحنات المباشر</h4>
                    <p className="text-[8.5px] text-gray-500 font-semibold">شاهد خط سير الشحنة من موانئ دبي وبكين حتى تسليم مطار بغداد.</p>
                  </div>
                </div>

                <div className="bg-white border border-pink-100 rounded-[2.25rem] p-1.5">
                  <TrackingView />
                </div>
              </div>

              {/* CURRENCY CONVERTER SECTION */}
              <CurrencyConverter />

              {/* INVOICES & ORDERS HISTORY SECTION */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black text-pink-950 pr-1">سجل فواتيري والمشتريات 📜</h3>
                
                {invoices.length === 0 ? (
                  <div className="bg-white border border-pink-100 rounded-2xl p-6 text-center text-gray-400 text-[10px] font-semibold">
                    لا يوجد فواتير مسجلة حالياً في حسابكِ 🌸
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map(inv => (
                      <div 
                        key={inv.id}
                        className="bg-white border border-pink-50 rounded-2xl p-4 space-y-3 shadow-xs text-right"
                      >
                        <div className="flex justify-between items-center pb-2.5 border-b border-pink-50">
                          <div className="flex items-center gap-1 bg-pink-50 px-2.5 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-pink-700" />
                            <span className="text-[9px] font-black text-pink-800">{inv.date}</span>
                          </div>
                          <span className="text-[10px] font-black text-gray-800">{inv.invoiceId}</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <div>
                            <span className="text-gray-400">المتجر الأصلي: </span>
                            <span className="text-pink-950">{inv.store}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">رقم الطلب: </span>
                            <span className="text-pink-950">{inv.order_id}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2.5 border-t border-pink-50/50">
                          <div>
                            <span className="text-[9px] text-gray-400 block font-bold">المبلغ الإجمالي</span>
                            <span className="text-pink-700 font-black text-xs">{inv.amount}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {inv.status === 'Paid' ? (
                              <span className="text-[9.5px] font-black bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                تم الدفع بنجاح
                              </span>
                            ) : (
                              <button
                                onClick={async () => {
                                  triggerSuccessHaptic();
                                  if (inv.id) await payInvoice(inv.id);
                                  alert('🎉 شكراً لكِ! تم تسديد الفاتورة بنجاح عبر محاكاة الدفع الجمالية الآمنة.');
                                }}
                                className="bg-pink-700 hover:bg-pink-800 text-white text-[9px] font-black px-4 py-1.5 rounded-full transition-transform active:scale-95 cursor-pointer"
                              >
                                تسديد الفاتورة 💳
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* WISHLIST TAB */}
          {activeMainTab === 'wishlist' && (
            <motion.div 
              key="wishlist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-4"
            >
              <div className="space-y-1 text-right">
                <h2 className="text-xs font-black text-pink-950">مفضلتي الفاخرة 💖</h2>
                <p className="text-[9.5px] text-gray-400 font-bold">القطع والمنتجات التي قمتِ بالإعجاب بها لتسوقها لاحقاً.</p>
              </div>

              {wishlist.length === 0 ? (
                <div className="bg-white border border-pink-100 rounded-[2rem] p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
                  <Heart className="w-10 h-10 text-pink-200 animate-pulse" />
                  <p className="text-[10px] font-bold">مفضلتي فارغة حالياً. تصفحي المتجر وأضيفي لمستكِ الخاصة 🌸</p>
                  <button 
                    onClick={() => { triggerLightHaptic(); setActiveMainTab('shop'); }}
                    className="bg-[#111] hover:bg-pink-700 text-white text-[9px] font-black px-5 py-2 rounded-full active:scale-95 transition-all cursor-pointer"
                  >
                    تصفح المتجر الآن
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {allProducts.filter(p => wishlist.includes(p.id)).map(prod => (
                    <div 
                      key={prod.id}
                      onClick={() => setSelectedProduct(prod)}
                      className="bg-white border border-pink-100 rounded-3xl p-3 flex flex-col justify-between relative shadow-xs hover:shadow-sm cursor-pointer animate-fade-in"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerLightHaptic();
                          setWishlist(prev => prev.filter(x => x !== prod.id));
                        }}
                        className="absolute top-2.5 left-2.5 w-7 h-7 bg-white rounded-full border border-pink-50 flex items-center justify-center text-rose-500 shadow-sm z-10 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-2">
                        <div className="w-full h-28 rounded-2xl overflow-hidden bg-gray-50 border border-pink-50">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <h4 className="text-[9.5px] font-extrabold text-gray-800 line-clamp-2 min-h-[28px] leading-normal">{prod.name}</h4>
                      </div>

                      <div className="pt-2 border-t border-pink-50 mt-2 space-y-2 text-center">
                        <div className="text-pink-700 font-black text-[11px]">{prod.price.toLocaleString()} د.ع</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(prod, prod.sizes?.[0], prod.colors?.[0]);
                          }}
                          className="w-full bg-[#111] text-white text-[8px] font-black py-1.5 rounded-full flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ShoppingCart className="w-2.5 h-2.5" />
                          إضافة للسلة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* PROFILE & SUPPORT TAB */}
          {activeMainTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-5"
            >
              {/* Profile Card View */}
              <div className="bg-gradient-to-tr from-[#3b1836] to-[#1a0818] text-white rounded-[2.5rem] p-5 relative overflow-hidden shadow-lg text-center space-y-3">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl" />
                
                <div 
                  onClick={handleSecretAvatarClick}
                  className="relative mx-auto w-16 h-16 rounded-full overflow-hidden border-2 border-pink-300 shadow-md cursor-pointer active:scale-95 transition-transform"
                >
                  <img src={profile?.avatar || DEFAULT_AVATAR} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>

                <div className="space-y-0.5 cursor-pointer" onClick={handleSecretAvatarClick}>
                  <h3 className="font-extrabold text-sm">{profile?.name || 'الزبونة الكريمة 🌸'}</h3>
                  <p className="text-[9px] text-pink-300 font-bold tracking-wide">{profile?.phone || 'مستخدم افتراضي'}</p>
                </div>

                {/* Sub-loyalty status banner inside profile */}
                <div className="bg-white/5 border border-white/10 rounded-2xl py-2 px-3 flex justify-around items-center text-right text-[10px] font-bold">
                  <div>
                    <span className="text-gray-400 block text-[8px] font-semibold">عضوية المتجر</span>
                    <span className="text-pink-300 font-black">{profile?.membership || 'عضوية ذهبية'} 👑</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div>
                    <span className="text-gray-400 block text-[8px] font-semibold">الموقع والمحافظة</span>
                    <span className="text-white font-black">{profile?.city || 'بغداد، العراق'} 📍</span>
                  </div>
                </div>
              </div>

              {/* WHEEL OF FORTUNE MODAL SIMULATOR */}
              <div className="bg-white border border-rose-100 rounded-[2rem] p-4 text-center space-y-3 shadow-xs">
                <div className="space-y-1">
                  <span className="text-[8.5px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full animate-pulse">هدية هدوشة اليومية 🎡</span>
                  <h4 className="text-xs font-black text-pink-950">عجلة الجمال والـحظ السعيد ثلاثية الأبعاد 3D</h4>
                  <p className="text-[8.5px] text-gray-400 font-semibold">دوري عجلة الحظ اليومية واربحي عينات تجميل أو كوبونات خصم مجانية!</p>
                </div>

                <div className="flex flex-col items-center justify-center gap-2.5">
                  <Elegant3DSpinWheel 
                    onWin={(prize) => setSpinResult(prize)}
                    isSpinning={isSpinning}
                    setIsSpinning={setIsSpinning}
                  />

                  {spinResult && (
                    <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-xs font-black text-rose-800 animate-scale-up">
                      🎉 مبروك يا جميلة! لقد ربحتِ: <br />
                      <span className="text-[12px] text-pink-700 mt-1 block">{spinResult}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ASK IRAMO FAQ & SUPPORT CENTER */}
              <div className="bg-white border border-pink-100 rounded-[2.5rem] p-5 space-y-4 shadow-sm text-right" id="ask-iramo-faq-section">
                <div className="flex items-center justify-between flex-row-reverse border-b border-pink-50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 shadow-inner">
                      <HelpCircle className="w-4.5 h-4.5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-pink-950">إسألي إيرامو ✨ Ask IRAMO</h4>
                      <p className="text-[8px] text-pink-600 font-bold">مركز الأسئلة الشائعة والمستندات الذكية</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-pink-50 text-pink-800 font-black px-2.5 py-0.5 rounded-full">الدعم الفوري 🌸</span>
                </div>

                {/* FAQ Collapsible Items */}
                <div className="space-y-2 text-[9.5px]">
                  {[
                    {
                      id: 1,
                      q: 'كم يستغرق وصول طرد التوصيل الفوري أو الشحن الدولي؟ 📦',
                      a: 'لطلبات بغداد من ٢٤ إلى ٤٨ ساعة عمل كحد أقصى، وباقي محافظات العراق من ٣ إلى ٤ أيام عمل. أما طرود الشحن الدولي من تركيا فتستغرق ٥-٧ أيام عمل، ومن الصين ١٠-١٤ يوماً جوياً.'
                    },
                    {
                      id: 2,
                      q: 'ما هي تكلفة التوصيل الدقيقة لمختلف محافظات العراق؟ 🗺️',
                      a: 'التوصيل لداخل محافظة بغداد يبلغ ٥,٠٠٠ د.ع فقط، بينما يبلغ التوصيل لكافة المحافظات العراقية الأخرى (أربيل، البصرة، النجف، ذي قار، إلخ) ٨,٠٠٠ د.ع فقط لجميع الأوزان القياسية.'
                    },
                    {
                      id: 3,
                      q: 'هل يمكنني تعديل عنوان وموقع التوصيل بعد خروج المندوب؟ 📍',
                      a: 'لا يمكن للمندوب تغيير مساره بعد خروجه للعنوان المحدد، لكن طالما أن الشحنة لا تزال في مستودعات بغداد (حالة المعالجة)، يمكنكِ تعديل العنوان والمحافظة فوراً من خلال خدمة العملاء.'
                    },
                    {
                      id: 4,
                      q: 'ما هي طرق الدفع الآمنة والمدعومة لإتمام طلبي؟ 💳',
                      a: 'ندعم الدفع نقداً عند الاستلام (COD) لتوفير أقصى درجات الأمان والراحة لكِ، كما ندعم الدفع الإلكتروني المباشر الفوري عبر محفظة زين كاش (Zain Cash) وآسيا حوالة.'
                    },
                    {
                      id: 5,
                      q: 'كيف أقوم بتعبئة وشحن رصيد محفظتي الإلكترونية بالمتجر؟ 💰',
                      a: 'بكل دلال وسهولة! توجهي لملفك الشخصي، انقري "تعبئة الرصيد"، اختاري طريقة الدفع المفضلة، وحولي المبلغ المطلوب. سنقوم فوراً بالتحقق وإيداع الرصيد في محفظتكِ بلحظات.'
                    },
                    {
                      id: 6,
                      q: 'هل توجد أي جمارك أو ضرائب إضافية غير المعلنة بالفاتورة؟ ⚖️',
                      a: 'أبداً يا زهرتي! لا توجد أي رسوم أو تكاليف مخفية على الإطلاق. السعر الظاهر في فاتورتكِ المعتمدة شامل لتكاليف الشحن الدولي، التخليص الجمركي الكامل، والضرائب حتى باب بيتكِ.'
                    }
                  ].map((faq) => {
                    const isExpanded = expandedFaq === faq.id;
                    return (
                      <div 
                        key={faq.id} 
                        className={`border rounded-2xl transition-all overflow-hidden ${
                          isExpanded 
                            ? 'bg-gradient-to-br from-pink-50/40 via-white to-pink-50/10 border-pink-200 shadow-xs' 
                            : 'bg-gray-50/30 border-gray-100/70 hover:bg-pink-50/20 hover:border-pink-100/50'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            triggerLightHaptic();
                            setExpandedFaq(isExpanded ? null : faq.id);
                          }}
                          className="w-full p-3.5 flex justify-between items-center text-right font-black text-pink-950 hover:text-pink-800 transition-colors focus:outline-none cursor-pointer"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 text-pink-600 transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                          <span className="pr-1.5 leading-relaxed">{faq.q}</span>
                        </button>

                        <div 
                          className={`transition-all duration-300 ease-in-out ${
                            isExpanded ? 'max-h-40 border-t border-pink-50/40 p-3.5 bg-white/70' : 'max-h-0 opacity-0 overflow-hidden'
                          }`}
                        >
                          <p className="text-[10px] text-gray-600 font-semibold leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submit supporting tickets & Contact Support */}
                <div className="space-y-3 border-t border-dashed border-pink-100 pt-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9.5px] font-black text-pink-950 mr-1 block">لديكِ مشكلة أو استفسار مخصص؟ افتحي تذكرة مساعدة فورية 🌸</span>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="موضوع المشكلة أو الاستفسار..."
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        className="flex-1 bg-pink-50/10 border border-pink-100 rounded-xl py-2 px-3 text-[10px] font-bold text-right focus:outline-none focus:border-pink-500"
                      />
                      <button
                        onClick={createTicket}
                        className="bg-neutral-900 hover:bg-neutral-950 text-white text-[9px] font-black px-4 py-2 rounded-xl transition-transform active:scale-95 cursor-pointer shrink-0"
                      >
                        فتح التذكرة
                      </button>
                    </div>
                  </div>
                  
                  {ticketSuccess && (
                    <p className="text-[8.5px] text-emerald-600 font-black animate-pulse bg-emerald-50 border border-emerald-100 p-2 rounded-xl">
                      🎉 تم إرسال تذكرتكِ بنجاح! سيتم مراجعتها من قبل المديرة وإخطارك فوراً.
                    </p>
                  )}

                  {/* List active support tickets */}
                  {supportTickets.length > 0 && (
                    <div className="space-y-1.5 pt-1.5">
                      <span className="text-[8.5px] text-gray-400 block font-bold">حالة التذاكر المفتوحة:</span>
                      {supportTickets.map(t => (
                        <div key={t.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl text-[9px] font-bold border border-gray-100">
                          <span className="text-pink-900">{t.subject}</span>
                          <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-[8px]">{t.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contact Support Button at the bottom */}
                  <button
                    onClick={() => {
                      triggerMediumHaptic();
                      setShowContactSupportModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-[10px] font-black py-3 rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Phone className="w-3.5 h-3.5 animate-bounce" />
                    <span>تواصل مباشر مع الدعم الفني 💬 Contact Support</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 3. PRODUCT DETAILS DIALOG POPUP */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="bg-white rounded-t-[3rem] sm:rounded-[2.5rem] w-full max-w-[430px] max-h-[90vh] overflow-y-auto no-scrollbar p-6 space-y-6 text-right relative shadow-2xl border border-pink-100/50"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-pink-700 cursor-pointer shadow-xs transition-all z-25"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Product Gallery & Video Section */}
              <div className="space-y-3 pt-4">
                <div className="w-full h-64 rounded-[2.5rem] overflow-hidden bg-gray-50 border border-pink-50 relative group">
                  {isPlayingVideo ? (
                    <div className="w-full h-full bg-black flex flex-col justify-between p-4 relative animate-fade-in text-white font-sans">
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
                      
                      {/* Simulated elegant video loop */}
                      <div className="z-10 flex justify-between items-center">
                        <span className="text-[8px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full uppercase animate-pulse">
                          LIVE STORY VIDEO 🎥
                        </span>
                        <button 
                          onClick={() => setIsPlayingVideo(false)}
                          className="text-white hover:text-pink-300 text-[10px] font-black underline bg-white/10 px-2.5 py-1 rounded-lg"
                        >
                          إغلاق الفيديو ✕
                        </button>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center animate-ping pointer-events-none absolute" />
                        <div className="w-14 h-14 bg-pink-700 rounded-full flex items-center justify-center text-white text-lg shadow-xl z-20">
                          ▶
                        </div>
                      </div>

                      <div className="z-10 space-y-2 text-right">
                        <p className="text-[10px] font-extrabold text-pink-200">استمتعي برؤية جودة ومتانة المنتج بالتفصيل الممل 💕</p>
                        {/* Video timeline bar */}
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                          <div className="w-2/3 h-full bg-gradient-to-r from-pink-500 to-rose-500 animate-[width_3s_infinite_linear]" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      <img 
                        src={[selectedProduct.image, selectedProduct.image, selectedProduct.image][activeGalleryImageIndex]} 
                        alt={selectedProduct.name} 
                        className="w-full h-full object-cover transition-all duration-500" 
                        referrerPolicy="no-referrer" 
                      />

                      {/* Video trigger overlay button */}
                      <button 
                        onClick={() => setIsPlayingVideo(true)}
                        className="absolute bottom-4 right-4 bg-black/65 hover:bg-pink-700 text-white text-[9px] font-black py-1.5 px-3.5 rounded-full flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer z-10"
                      >
                        <span>عرض الفيديو 🎥</span>
                      </button>

                      {/* Comparison Add button */}
                      <button 
                        onClick={() => {
                          triggerLightHaptic();
                          if (!compareProducts.some(p => p.id === selectedProduct.id)) {
                            setCompareProducts([...compareProducts, selectedProduct]);
                          }
                          setShowComparisonDrawer(true);
                        }}
                        className="absolute top-4 right-4 bg-white/90 hover:bg-pink-50 text-pink-900 text-[9px] font-black py-1.5 px-3 rounded-full flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer z-10 border border-pink-100"
                      >
                        <span>مقارنة ⚖️</span>
                      </button>

                      {/* Left/Right carousel controls */}
                      <button 
                        onClick={() => setActiveGalleryImageIndex(prev => (prev - 1 + 3) % 3)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 flex items-center justify-center text-pink-700 shadow-xs hover:bg-white z-10"
                      >
                        ‹
                      </button>
                      <button 
                        onClick={() => setActiveGalleryImageIndex(prev => (prev + 1) % 3)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 flex items-center justify-center text-pink-700 shadow-xs hover:bg-white z-10"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>

                {/* Carousel indicators dots */}
                {!isPlayingVideo && (
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2].map(idx => (
                      <button 
                        key={idx}
                        onClick={() => setActiveGalleryImageIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${activeGalleryImageIndex === idx ? 'bg-pink-700 w-3' : 'bg-pink-200'}`}
                      />
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-pink-500 uppercase tracking-wider bg-pink-50 px-2.5 py-0.5 rounded-full">
                      {selectedProduct.category}
                    </span>
                    
                    {/* Live Stock Indicator */}
                    <span className="text-[8.5px] bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded-full border border-emerald-100">
                      متبقي قطعتين فقط في مستودع بغداد المنصور! ⚡️
                    </span>
                  </div>
                  
                  <h3 className="font-extrabold text-sm text-pink-950 mt-1 leading-relaxed">{selectedProduct.name}</h3>
                  
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span>البوتيك الأصلي: {selectedProduct.originalStore}</span>
                    <span className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md font-extrabold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {selectedProduct.rating} ({selectedProduct.reviewsCount} تقييم)
                    </span>
                  </div>
                </div>
              </div>

              {/* Description body */}
              <div className="space-y-1.5 bg-pink-50/15 p-4 rounded-2xl border border-pink-50/30">
                <span className="text-[9px] font-black text-pink-700 block">تفاصيل المنتج والفوائد الأصيلة:</span>
                <p className="text-[10px] text-gray-600 font-bold leading-relaxed">{selectedProduct.description}</p>
              </div>

              {/* Sizes & Colors options block */}
              <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
                <div className="space-y-1 bg-gray-50/40 p-2.5 rounded-2xl border border-gray-100">
                  <span className="text-gray-400 block">المقاس / السعة:</span>
                  <div className="flex gap-1 overflow-x-auto no-scrollbar">
                    {selectedProduct.sizes?.map(sz => (
                      <span key={sz} className="border border-pink-100 bg-white px-2 py-1 rounded-lg text-pink-900 shrink-0">{sz}</span>
                    )) || 'القياس الافتراضي'}
                  </div>
                </div>
                <div className="space-y-1 bg-gray-50/40 p-2.5 rounded-2xl border border-gray-100">
                  <span className="text-gray-400 block">اللون / الإصدار:</span>
                  <div className="flex gap-1 overflow-x-auto no-scrollbar">
                    {selectedProduct.colors?.map(col => (
                      <span key={col} className="border border-pink-100 bg-white px-2 py-1 rounded-lg text-pink-900 shrink-0">{col}</span>
                    )) || 'الإصدار الأصلي'}
                  </div>
                </div>
              </div>

              {/* Premium Bundle Offer */}
              <div className="bg-gradient-to-r from-rose-500/5 to-pink-500/5 border border-pink-100 rounded-3xl p-4 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-pink-600 text-white text-[7px] font-black py-0.5 px-2 rounded-br-2xl">
                  عرض توفير مشترك 🎁
                </div>
                <h5 className="text-[10px] font-black text-pink-950 pt-1">باقة الجمال المتكاملة الأنيقة</h5>
                <p className="text-[9px] text-gray-500 font-bold leading-relaxed">
                  أضيفي هذا المنتج مع "كريم العناية الفائقة اوباجي" واحصلي فوراً على حسم إضافي بقيمة ١٥ ألف دينار عراقي مع كيس هدايا مجاني!
                </p>
                <button
                  onClick={() => {
                    triggerSuccessHaptic();
                    addToCart(selectedProduct, selectedProduct.sizes?.[0], selectedProduct.colors?.[0]);
                    // Add obagi as a placeholder/bundle item
                    const bundleObagi = allProducts?.find(p => p.id !== selectedProduct.id) || selectedProduct;
                    addToCart(bundleObagi, bundleObagi.sizes?.[0], bundleObagi.colors?.[0]);
                    setSelectedProduct(null);
                  }}
                  className="w-full bg-pink-50 hover:bg-pink-100 text-pink-950 font-black text-[9px] py-2 rounded-xl border border-pink-200 transition-all cursor-pointer shadow-xs"
                >
                  أضيفي الباقة كاملة للسلة ووفرّي الميزانية ✨
                </button>
              </div>

              {/* REVIEWS SECTION & REVIEW WRITER (Gate: reviews) */}
              {isFeatureEnabled('reviews') && (
                <div className="space-y-3 pt-3 border-t border-dashed border-pink-100">
                  <h4 className="text-[11px] font-black text-pink-950">آراء وتقييمات زبوناتنا الكريمات ⭐️</h4>
                  
                  {/* Review Writer Form */}
                  <div className="bg-pink-50/15 border border-pink-100 p-3 rounded-2xl space-y-2">
                    <span className="text-[9px] font-black text-pink-700 block">شاركينا رأيكِ بخصوص المنتج 🌸</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="اسمكِ الكريم..."
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        className="w-1/3 bg-white border border-pink-100 rounded-xl px-2 py-1 text-[9px] font-bold text-right focus:outline-pink-500"
                      />
                      <input 
                        type="text" 
                        placeholder="رأيكِ اللطيف بالمنتج..."
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        className="flex-1 bg-white border border-pink-100 rounded-xl px-2.5 py-1 text-[9px] font-bold text-right focus:outline-pink-500"
                      />
                      <button
                        onClick={() => submitReview(selectedProduct.id)}
                        className="bg-pink-700 hover:bg-pink-800 text-white text-[9px] font-black px-3.5 py-1 rounded-xl transition-all cursor-pointer"
                      >
                        إرسال
                      </button>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
                    {[
                      ...(localReviews[selectedProduct.id] || []),
                      ...(selectedProduct.reviewsList || [])
                    ].map((r, rIdx) => (
                      <div key={rIdx} className="bg-gray-50 p-2.5 rounded-xl space-y-1 text-right text-[9px] border border-gray-100/50">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-pink-950">{r.author}</span>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            <Star className="w-2 h-2 fill-current" />
                            <span>{r.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-500 font-semibold">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Products Section */}
              <div className="space-y-2.5 pt-3 border-t border-pink-50">
                <h4 className="text-[10px] font-black text-pink-950">منتجات مشابهة قد تعجبكِ أيضاً 💖</h4>
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {allProducts?.filter(p => p.id !== selectedProduct.id && p.category === selectedProduct.category).slice(0, 4).map(prod => (
                    <div 
                      key={prod.id}
                      onClick={() => setSelectedProduct(prod)}
                      className="bg-white p-2 border border-pink-50 rounded-xl shrink-0 w-24 text-right space-y-1 cursor-pointer hover:border-pink-200 shadow-xs"
                    >
                      <div className="w-full h-14 rounded-lg overflow-hidden bg-gray-50">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <h5 className="text-[8px] font-black text-gray-700 truncate">{prod.name}</h5>
                      <span className="text-pink-700 font-black text-[9px] block">{prod.price.toLocaleString()} د.ع</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer pricing CTA and Purchase add-to-cart */}
              <div className="flex items-center justify-between pt-4 border-t border-pink-100">
                <div>
                  <span className="text-[8.5px] text-gray-400 block font-bold">السعر النهائي للتسليم المباشر</span>
                  <span className="text-pink-700 font-black text-base">{selectedProduct.price.toLocaleString()} د.ع</span>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedProduct, selectedProduct.sizes?.[0], selectedProduct.colors?.[0]);
                    setSelectedProduct(null);
                  }}
                  className="bg-[#111] hover:bg-pink-700 text-white text-[10px] font-black px-8 py-3 rounded-full flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>إضافة لسلة المشتريات 🛍️</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3.5 PRODUCT COMPARISON DRAWER */}
      <AnimatePresence>
        {showComparisonDrawer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="bg-white rounded-t-[3rem] sm:rounded-[2.5rem] w-full max-w-[500px] max-h-[85vh] overflow-y-auto no-scrollbar p-6 space-y-5 text-right relative shadow-2xl border border-pink-100"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-pink-100">
                <button
                  onClick={() => setShowComparisonDrawer(false)}
                  className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-pink-700 cursor-pointer"
                >
                  ✕
                </button>
                <div className="text-right">
                  <h3 className="font-black text-sm text-pink-950">مقارنة المنتجات الذكية ⚖️</h3>
                  <p className="text-[9px] text-gray-400 font-bold">قارني المواصفات والأسعار واختاري الأفضل لجمالكِ</p>
                </div>
              </div>

              {compareProducts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <span className="text-3xl">⚖️</span>
                  <p className="text-xs text-gray-400 font-bold">لم تقومي بإضافة أي منتجات للمقارنة بعد.</p>
                  <p className="text-[9px] text-pink-500 font-extrabold">اضغطي على زر "مقارنة ⚖️" من تفاصيل أي منتج للبدء.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Grid layout */}
                  <div className="grid grid-cols-2 gap-3 divide-x divide-x-reverse divide-pink-100">
                    {compareProducts.map((prod, idx) => (
                      <div key={prod.id} className="space-y-4 text-right flex flex-col justify-between">
                        {/* Remove button */}
                        <div className="flex justify-between items-start">
                          <button
                            onClick={() => {
                              triggerLightHaptic();
                              setCompareProducts(compareProducts.filter(p => p.id !== prod.id));
                            }}
                            className="text-[9px] text-rose-600 hover:underline font-black"
                          >
                            إزالة ✕
                          </button>
                          <span className="text-[8px] font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                            الخيار {idx + 1}
                          </span>
                        </div>

                        {/* Image */}
                        <div className="w-full h-24 rounded-2xl overflow-hidden bg-gray-50 border border-pink-50">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>

                        {/* Name and Price */}
                        <div className="space-y-1">
                          <h4 className="text-[10px] font-black text-pink-950 line-clamp-2 min-h-[30px]">{prod.name}</h4>
                          <span className="text-pink-700 font-black text-xs block">{prod.price.toLocaleString()} د.ع</span>
                        </div>

                        {/* Comparison attributes table */}
                        <div className="space-y-2 text-[9px] font-bold bg-pink-50/20 p-2.5 rounded-xl border border-pink-50/30">
                          <div>
                            <span className="text-gray-400 block text-[8px]">القسم:</span>
                            <span className="text-pink-950">{prod.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[8px]">المتجر الأصلي:</span>
                            <span className="text-pink-950">{prod.originalStore}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[8px]">التقييم:</span>
                            <span className="text-amber-600 flex items-center gap-0.5">⭐ {prod.rating}</span>
                          </div>
                          <div className="line-clamp-2 h-[26px]">
                            <span className="text-gray-400 block text-[8px]">الوصف:</span>
                            <span className="text-gray-500 leading-tight">{prod.description}</span>
                          </div>
                        </div>

                        {/* Action Add to cart */}
                        <button
                          onClick={() => {
                            triggerSuccessHaptic();
                            addToCart(prod, prod.sizes?.[0], prod.colors?.[0]);
                            setShowComparisonDrawer(false);
                          }}
                          className="w-full bg-[#111] hover:bg-pink-700 text-white font-black text-[9px] py-2 rounded-xl transition-all shadow-xs"
                        >
                          شراء هذا الخيار 🛍️
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Actions footer */}
                  <div className="flex gap-2 justify-end pt-3 border-t border-pink-100">
                    <button
                      onClick={() => {
                        triggerLightHaptic();
                        setCompareProducts([]);
                      }}
                      className="text-[9.5px] font-black text-gray-500 hover:text-rose-600 py-1.5 px-3 rounded-lg"
                    >
                      تفريغ القائمة ✕
                    </button>
                    <button
                      onClick={() => setShowComparisonDrawer(false)}
                      className="bg-pink-100 hover:bg-pink-200 text-pink-900 font-black text-[9.5px] py-1.5 px-4 rounded-lg"
                    >
                      متابعة التصفح 🌸
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. CART DRAWER COMPONENT */}
      <AnimatePresence>
        {showCartDrawer && (
          <div className="fixed inset-0 bg-black/55 backdrop-blur-md z-[9999] flex justify-end">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="bg-white w-full max-w-[380px] h-full flex flex-col justify-between p-6 text-right relative shadow-2xl"
            >
              <button 
                onClick={() => setShowCartDrawer(false)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-pink-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="pb-4 border-b border-pink-100 mb-4">
                  <h3 className="font-black text-base text-pink-950">حقيبة تسوقكِ الأنيقة 🛍️</h3>
                  <p className="text-[9px] text-gray-400 font-bold">جميع القطع المختارة مضمونة الأصل والتغليف.</p>
                </div>

                {/* Scrollable list of items */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
                  {cart.length === 0 ? (
                    <div className="h-44 flex flex-col items-center justify-center gap-2 text-gray-400 text-[10.5px] font-bold">
                      <ShoppingBag className="w-9 h-9 text-pink-100 animate-pulse" />
                      سلة التسوق فارغة تماماً 🌸
                    </div>
                  ) : (
                    cart.map((item, index) => (
                      <div key={index} className="flex gap-3 bg-gray-50 p-2.5 rounded-2xl relative border border-pink-50/30">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>

                        <div className="flex-1 flex flex-col justify-between text-right text-[10.5px]">
                          <div>
                            <h4 className="font-extrabold text-gray-800 line-clamp-1">{item.product.name}</h4>
                            <span className="text-[8.5px] text-gray-400 font-bold">المقاس: {item.size || 'عادي'} | اللون: {item.color || 'أصلي'}</span>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <span className="text-pink-700 font-black">{item.product.price.toLocaleString()} د.ع</span>
                            
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateCartQuantity(index, -1)} className="w-5 h-5 bg-white border border-pink-100 rounded-md flex items-center justify-center cursor-pointer text-gray-500 hover:text-pink-700">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black px-1.5">{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(index, 1)} className="w-5 h-5 bg-white border border-pink-100 rounded-md flex items-center justify-center cursor-pointer text-gray-500 hover:text-pink-700">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => removeFromCart(index)}
                          className="absolute -top-1 -left-1 w-5.5 h-5.5 bg-rose-50 hover:bg-rose-100 rounded-full flex items-center justify-center text-rose-600 border border-rose-100 cursor-pointer shadow-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Checkout details summary and submit order button */}
              {cart.length > 0 && (
                <div className="pt-4 border-t border-pink-100 space-y-3.5">
                  <div className="space-y-1.5 text-[10.5px] font-bold">
                    <div className="flex justify-between">
                      <span className="text-gray-400">قيمة المنتجات:</span>
                      <span className="text-pink-950">{cartSubtotal.toLocaleString()} د.ع</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">التوصيل والضمان المباشر:</span>
                      <span className="text-pink-950">{deliveryCost.toLocaleString()} د.ع</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>الخصم المطبق:</span>
                        <span>-{discountAmount.toLocaleString()} د.ع</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2.5 border-t border-dashed border-pink-100 text-xs font-black text-pink-700">
                      <span>الإجمالي النهائي:</span>
                      <span>{cartTotal.toLocaleString()} د.ع</span>
                    </div>
                  </div>

                  {/* Checkout flow activator */}
                  {showCheckout ? (
                    <div className="bg-pink-50/20 p-3.5 rounded-2xl border border-pink-100 space-y-3">
                      <span className="text-[10px] font-black text-pink-700 block mb-1">بيانات التسليم الآمن والتسوق 📦</span>
                      
                      {/* Province Select */}
                      <div className="space-y-1 text-[9.5px]">
                        <label className="block text-gray-400 font-bold">المحافظة / موقع التسليم:</label>
                        <select
                          value={checkoutProvince}
                          onChange={(e) => setCheckoutProvince(e.target.value)}
                          className="w-full bg-white border border-pink-100 rounded-xl px-2.5 py-2 text-[10px] font-bold cursor-pointer focus:outline-none"
                        >
                          <option value="بغداد">بغداد</option>
                          <option value="البصرة">البصرة</option>
                          <option value="النجف الأشرف">النجف الأشرف</option>
                          <option value="كربلاء المقدسة">كربلاء المقدسة</option>
                          <option value="بابل">بابل</option>
                          <option value="أربيل">أربيل</option>
                        </select>
                      </div>

                      {/* Delivery Address */}
                      <div className="space-y-1 text-[9.5px]">
                        <label className="block text-gray-400 font-bold">عنوان التوصيل المفصل:</label>
                        <input 
                          type="text"
                          placeholder="مثال: المنصور، شارع الرواد، قرب مطعم..."
                          value={checkoutAddress}
                          onChange={(e) => setCheckoutAddress(e.target.value)}
                          className="w-full bg-white border border-pink-100 rounded-xl px-2.5 py-2 text-[10px] font-bold focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1 text-[9.5px]">
                        <label className="block text-gray-400 font-bold">رقم الهاتف الفعال:</label>
                        <input 
                          type="text"
                          placeholder="0770XXXXXXX"
                          value={checkoutPhone}
                          onChange={(e) => setCheckoutPhone(e.target.value)}
                          className="w-full bg-white border border-pink-100 rounded-xl px-2.5 py-2 text-[10px] font-bold focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      {/* Multiple Shipping Methods */}
                      <div className="space-y-1 text-[9.5px]">
                        <label className="block text-gray-400 font-bold">طريقة الشحن والتوصيل:</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => { triggerLightHaptic(); setShippingMethod('standard'); }}
                            className={`px-2 py-1.5 rounded-xl border text-[9.5px] font-black transition-all ${
                              shippingMethod === 'standard'
                                ? 'border-pink-500 bg-pink-500/10 text-pink-950 shadow-xs'
                                : 'border-gray-200 bg-white text-gray-500'
                            }`}
                          >
                            🚚 شحن عادي (فوري)
                          </button>
                          <button
                            type="button"
                            onClick={() => { triggerLightHaptic(); setShippingMethod('express'); }}
                            className={`px-2 py-1.5 rounded-xl border text-[9.5px] font-black transition-all ${
                              shippingMethod === 'express'
                                ? 'border-pink-500 bg-pink-500/10 text-pink-950 shadow-xs'
                                : 'border-gray-200 bg-white text-gray-500'
                            }`}
                          >
                            ⚡️ شحن VIP مستعجل
                          </button>
                        </div>
                      </div>

                      {/* Multiple Payment Methods */}
                      <div className="space-y-1 text-[9.5px]">
                        <label className="block text-gray-400 font-bold">طريقة الدفع الآمنة:</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => { triggerLightHaptic(); setPaymentMethod('cod'); }}
                            className={`px-2 py-1.5 rounded-xl border text-[9.5px] font-black transition-all ${
                              paymentMethod === 'cod'
                                ? 'border-pink-500 bg-pink-500/10 text-pink-950 shadow-xs'
                                : 'border-gray-200 bg-white text-gray-500'
                            }`}
                          >
                            💵 دفع عند الاستلام
                          </button>
                          <button
                            type="button"
                            onClick={() => { triggerLightHaptic(); setPaymentMethod('zaincash'); }}
                            className={`px-2 py-1.5 rounded-xl border text-[9.5px] font-black transition-all ${
                              paymentMethod === 'zaincash'
                                ? 'border-pink-500 bg-pink-500/10 text-pink-950 shadow-xs'
                                : 'border-gray-200 bg-white text-gray-500'
                            }`}
                          >
                            📱 زين كاش ZainCash
                          </button>
                        </div>
                      </div>

                      {/* Luxury Gift Wrapping Option */}
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50/50 p-2.5 rounded-xl border border-pink-100 flex items-center justify-between">
                        <div className="space-y-0.5 text-right">
                          <span className="text-[9.5px] font-black text-pink-950 block">هل تريدين تغليفها كهدية؟ 🎁</span>
                          <span className="text-[8px] text-gray-400 font-bold">تغليف مخملي وكرتونة الماركة الفخمة (+٥,٠٠٠ د.ع)</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={giftWrapping}
                          onChange={(e) => { triggerLightHaptic(); setGiftWrapping(e.target.checked); }}
                          className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                        />
                      </div>

                      {/* Notes for Seller */}
                      <div className="space-y-1 text-[9.5px]">
                        <label className="block text-gray-400 font-bold">ملاحظات أو إرشادات للبوتيك (اختياري):</label>
                        <input 
                          type="text"
                          placeholder="مثال: كتابة كارت هدايا (عيد ميلاد سعيد...) أو جرس معطل"
                          value={sellerNotes}
                          onChange={(e) => setSellerNotes(e.target.value)}
                          className="w-full bg-white border border-pink-100 rounded-xl px-2.5 py-2 text-[10px] font-bold focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      {/* Coupon input */}
                      <div className="flex gap-1.5 pt-1">
                        <input 
                          type="text"
                          placeholder="كود الخصم (e.g. huda10)..."
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          disabled={couponApplied}
                          className="flex-1 bg-white border border-pink-100 rounded-xl px-2.5 py-1.5 text-[9px] font-bold disabled:bg-gray-100 focus:outline-none"
                        />
                        <button 
                          onClick={applyPromo}
                          disabled={couponApplied}
                          className="bg-[#111] hover:bg-pink-700 text-white text-[8.5px] font-black px-4 py-1.5 rounded-xl transition-all cursor-pointer disabled:bg-gray-300"
                        >
                          {couponApplied ? 'تم التطبيق' : 'تطبيق'}
                        </button>
                      </div>

                      <button
                        onClick={handlePlaceOrder}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[10.5px] font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>تأكيد الطلب والتسليم الفوري 🎉</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { triggerMediumHaptic(); setShowCheckout(true); }}
                      className="w-full bg-[#111] hover:bg-pink-700 text-white text-[10px] font-black py-3 rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>الانتقال لإتمام الطلب 🛍️</span>
                    </button>
                  )}
                </div>
              )}

              {orderConfirmed && (
                <div className="absolute inset-0 bg-white z-[99999] p-6 flex flex-col items-center justify-center text-center gap-4 animate-scale-up">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl shadow-inner animate-bounce">
                    🎉
                  </div>
                  <h3 className="text-sm font-black text-pink-950">لقد تم تأكيد طلبكِ بنجاح يا غالية! 🌸</h3>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-bold max-w-[280px]">
                    شكراً لتسوقكِ وثقتكِ ببوتيك إيرامو شيك. يقوم فريق التحضير في دبي ومطار بغداد بمعالجة طلبكِ الفوري لإرساله للتوصيل خلال ٢٤ ساعة عمل.
                  </p>
                  
                  <div className="bg-pink-50 p-3 rounded-2xl text-[9px] font-black text-pink-900 border border-pink-100">
                    رقم تتبع شحنتك المباشر: IRA-{Math.floor(10000 + Math.random() * 90000)}-XQ
                  </div>

                  <button
                    onClick={() => {
                      triggerLightHaptic();
                      setOrderConfirmed(false);
                      setShowCartDrawer(false);
                      setShowCheckout(false);
                      setActiveMainTab('orders');
                    }}
                    className="bg-[#111] hover:bg-pink-700 text-white text-[9.5px] font-black px-6 py-2.5 rounded-full shadow-md active:scale-95 transition-transform cursor-pointer mt-2"
                  >
                    تتبع الشحنة المباشر الآن 📦
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* 4.5 DETAILED CONTACT SUPPORT MODAL */}
      <AnimatePresence>
        {showContactSupportModal && (
          <div className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setShowContactSupportModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[99999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[2.5rem] w-full max-w-[420px] max-h-[90vh] overflow-y-auto no-scrollbar p-6 space-y-5 text-right shadow-2xl border border-pink-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => {
                  triggerLightHaptic();
                  setShowContactSupportModal(false);
                }}
                className="absolute top-5 left-5 w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-pink-700 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Header */}
              <div className="space-y-1 pt-2">
                <span className="text-[8.5px] font-black text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full inline-block">تواصل مباشر 💬 Contact</span>
                <h3 className="font-black text-sm text-pink-950 mt-1 leading-relaxed">مركز تواصل زبائن إيرامو شيك</h3>
                <p className="text-[9px] text-gray-400 font-semibold leading-relaxed">
                  نحن هنا لخدمتكِ ومساعدتكِ في تتبع طلبياتكِ وحل مشاكل الدفع والشحن فوراً.
                </p>
              </div>

              {/* Instant Action Channels */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-pink-800 block mb-1">قنوات التواصل الفورية المباشرة:</span>
                
                {/* WhatsApp Chat Channel */}
                <a 
                  href="https://wa.me/9647701234567" 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={() => triggerSuccessHaptic()}
                  className="flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 rounded-2xl transition-all cursor-pointer flex-row-reverse group"
                >
                  <div className="flex items-center gap-2.5 flex-row-reverse">
                    <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center text-base shadow-sm group-hover:scale-105 transition-transform">
                      💬
                    </div>
                    <div className="text-right">
                      <span className="text-[10.5px] font-black text-emerald-950 block">الدردشة عبر الواتساب الفوري</span>
                      <span className="text-[8.5px] text-emerald-600 font-bold block">متاحة الآن للاستفسارات السريعة طوال اليوم</span>
                    </div>
                  </div>
                  <span className="text-[12px] animate-pulse">🟢</span>
                </a>

                {/* Direct Phone Support Channel */}
                <a 
                  href="tel:+9647701234567"
                  onClick={() => triggerSuccessHaptic()}
                  className="flex items-center justify-between p-3.5 bg-sky-50 hover:bg-sky-100/80 border border-sky-100 rounded-2xl transition-all cursor-pointer flex-row-reverse group"
                >
                  <div className="flex items-center gap-2.5 flex-row-reverse">
                    <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                      <Phone className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10.5px] font-black text-sky-950 block">اتصال هاتفي مباشر بالدعم الفني</span>
                      <span className="text-[8.5px] text-sky-600 font-bold block">من الساعة ٩ صباحاً وحتى ١٠ مساءً</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-sky-500 rotate-180" />
                </a>
              </div>

              {/* Submit customized support inquiry ticket */}
              <div className="border-t border-dashed border-pink-100 pt-4 space-y-3">
                <span className="text-[9.5px] font-black text-pink-800 block mr-1">أو أرسلي استفساراً مخصصاً لخدمة العملاء:</span>
                
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[8px] font-bold text-gray-400 mb-1">نوع الاستفسار أو المشكلة:</label>
                    <select 
                      id="support-ticket-category"
                      className="w-full bg-pink-50/10 border border-pink-100 rounded-xl py-2 px-3 text-[10px] font-bold text-right focus:outline-none focus:border-pink-500"
                    >
                      <option value="shipping">استفسار بخصوص الشحن والطرود 📦</option>
                      <option value="billing">مشكلة في الدفع أو شحن المحفظة 💳</option>
                      <option value="product">جودة المنتجات والقياسات 🛍️</option>
                      <option value="general">مساعدة عامة أو أخرى 🌸</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-gray-400 mb-1">تفاصيل الرسالة أو المشكلة بالتفصيل:</label>
                    <textarea 
                      placeholder="اكتبي مشكلتكِ أو استفساركِ هنا بالتفصيل يا غالية وسنقوم بحلها فوراً..."
                      rows={3}
                      className="w-full bg-pink-50/10 border border-pink-100 rounded-2xl py-2 px-3 text-[10px] font-bold text-right focus:outline-none focus:border-pink-500 resize-none"
                    ></textarea>
                  </div>

                  <button
                    onClick={() => {
                      triggerSuccessHaptic();
                      setShowContactSupportModal(false);
                      setTicketSuccess(true);
                      setTimeout(() => setTicketSuccess(false), 5000);
                    }}
                    className="w-full bg-neutral-900 hover:bg-neutral-950 text-white text-[10px] font-black py-2.5 rounded-xl transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال الطلب للدعم الفني 🚀</span>
                  </button>
                </div>
              </div>

              {/* Footer notice */}
              <div className="text-center text-[8px] text-gray-400 pt-2 border-t border-pink-50">
                🔒 جميع المحادثات وتذاكر الدعم مشفرة بالكامل لخصوصية زبائننا الكرام.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. GORGEOUS PIXAR FEMININE BOTTOM TAB BAR */}
      <nav className="absolute bottom-0 left-0 right-0 h-18 bg-white/95 backdrop-blur-md border-t border-pink-100/35 shadow-[0_-8px_30px_rgba(219,39,119,0.06)] flex justify-around items-center px-1 z-40">
        
        {/* Home */}
        {isLoggedIn && (
          <button
            onClick={() => { triggerLightHaptic(); setActiveMainTab('home'); }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeMainTab === 'home' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
            }`}
          >
            <div className={`p-1 px-3.5 rounded-full transition-all ${activeMainTab === 'home' ? 'bg-pink-50' : ''}`}>
              <HomeIcon className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-black">الرئيسية</span>
          </button>
        )}

        {/* Shop */}
        <button
          onClick={() => { triggerLightHaptic(); setActiveMainTab('shop'); }}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            activeMainTab === 'shop' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-3.5 rounded-full transition-all ${activeMainTab === 'shop' ? 'bg-pink-50' : ''}`}>
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-black">المتجر</span>
        </button>

        {/* Orders & Invoices */}
        {isLoggedIn && (
          <button
            onClick={() => { triggerLightHaptic(); setActiveMainTab('orders'); }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeMainTab === 'orders' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
            }`}
          >
            <div className={`p-1 px-3.5 rounded-full transition-all ${activeMainTab === 'orders' ? 'bg-pink-50' : ''}`}>
              <Clock className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-black">طلباتي</span>
          </button>
        )}

        {/* Wishlist */}
        {isLoggedIn && (
          <button
            onClick={() => { triggerLightHaptic(); setActiveMainTab('wishlist'); }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeMainTab === 'wishlist' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
            }`}
          >
            <div className={`p-1 px-3.5 rounded-full transition-all ${activeMainTab === 'wishlist' ? 'bg-pink-50' : ''}`}>
              <Heart className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-black">مفضلتي</span>
          </button>
        )}

        {/* Profile & Settings */}
        <button
          onClick={() => { triggerLightHaptic(); setActiveMainTab('profile'); }}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            activeMainTab === 'profile' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-3.5 rounded-full transition-all ${activeMainTab === 'profile' ? 'bg-pink-50' : ''}`}>
            <User className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-black">حسابي</span>
        </button>

      </nav>

    </div>
  );
}
