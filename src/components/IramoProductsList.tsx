import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, Sparkles, Filter, Grid, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface IramoProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  originalStore: string;
  description: string;
  availability: 'in_stock' | 'limited' | 'preorder';
}

const DEFAULT_IRAMO_PRODUCTS: IramoProduct[] = [
  {
    id: 'ir_prod_1',
    name: 'حقيبة ليدي ديور كلاسيك فاخرة (Lady Dior Classy Bag)',
    price: 1350000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=400',
    category: 'حقائب وأحذية',
    originalStore: 'Dior Store Dubai',
    description: 'حقيبة كلاسيكية راقية باللون الأسود الملكي مصنوعة من جلد الحمل الفاخر مع حليات ذهبية براقة تليق بإطلالتك الأنيقة.',
    availability: 'limited'
  },
  {
    id: 'ir_prod_2',
    name: 'سيروم اوباجي فيتامين سي الاحترافي (Obagi Professional-C 20%)',
    price: 1550000,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
    category: 'عناية وتجميل',
    originalStore: 'Sephora US',
    description: 'سيروم فيتامين سي عالي التركيز لحماية البشرة من التصبغات، تحفيز الكولاجين، ومنحك إشراقة ونضارة لا مثيل لها.',
    availability: 'in_stock'
  },
  {
    id: 'ir_prod_3',
    name: 'عطر شانيل كوكو مادوموزيل الفخم (Chanel Coco Mademoiselle)',
    price: 285000,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400',
    category: 'عطور وبخور',
    originalStore: 'Chanel Sephora',
    description: 'عطر شرقي أنثوي بامتياز يمزج بين انتعاش البرتقال وجاذبية الياسمين والورد مع دفء الباتشولي والمسك.',
    availability: 'in_stock'
  },
  {
    id: 'ir_prod_4',
    name: 'سوار الحب كارتييه مطلي ذهب عيار 18 (Cartier Love Bracelet)',
    price: 210000,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
    category: 'إكسسوارات ومجوهرات',
    originalStore: 'Cartier AE',
    description: 'سوار الحب الأيقوني بتصميم مسامير كارتييه الكلاسيكية، مطلي بالذهب عيار 18 عالي المقاومة ومقاوم لتغير الألوان.',
    availability: 'limited'
  },
  {
    id: 'ir_prod_5',
    name: 'مجموعة ظلال عيون هدى بيوتي الفاخرة (Huda Beauty Empowered)',
    price: 115000,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=400',
    category: 'عناية وتجميل',
    originalStore: 'Sephora UAE',
    description: 'علبة متكاملة تحتوي على 18 لوناً غنياً بين المات الناعم والمعدني البراق لتنفيذ أجمل لوكات المكياج اليومية والمناسبات.',
    availability: 'in_stock'
  },
  {
    id: 'ir_prod_6',
    name: 'مرطب كلينيك هيدرا جيل المرطب الفوري (Clinique Moisture 100H)',
    price: 90000,
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=400',
    category: 'عناية وتجميل',
    originalStore: 'Nordstrom US',
    description: 'مرطب جل مائي خالٍ من الزيوت يتغلغل بعمق في خلايا البشرة ليمنحها ترطيباً مستمراً يدوم حتى 100 ساعة متواصلة.',
    availability: 'in_stock'
  },
  {
    id: 'ir_prod_7',
    name: 'نظارة شمسية برادا عين القطة السوداء (Prada Cat-Eye Sunglasses)',
    price: 345000,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400',
    category: 'إكسسوارات ومجوهرات',
    originalStore: 'Prada Italy',
    description: 'نظارة شمسية أنيقة بتصميم كات آي كلاسيكي مع شعار برادا المثلث الشهير، لحماية فائقة من الأشعة فوق البنفسجية وجاذبية فورية.',
    availability: 'preorder'
  },
  {
    id: 'ir_prod_8',
    name: 'حذاء كعب كلاسيك فالنتينو باللون الأحمر (Valentino Rockstud Heels)',
    price: 495000,
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=400',
    category: 'حقائب وأحذية',
    originalStore: 'Valentino Mall of Emirates',
    description: 'حذاء ذو كعب عالٍ مزين بقطع الميتال الأيقونية الشهيرة من فالنتينو، مصنوع من جلد طبيعي فاخر لتخطفي الأنظار في كل خطوة.',
    availability: 'limited'
  }
];

export default function IramoProductsList() {
  const { customizations } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Combine default with manager preset products if they exist
  const allProducts = useMemo(() => {
    const managerPresets = (customizations?.presetProducts || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image || 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=400',
      category: p.category || 'عام',
      originalStore: 'مستودع إيرامو',
      description: 'منتج مميز ومختار بعناية من فريق إيرامو للشحن الدولي متوفر للتسليم الفوري مع كفالة الأصالة الكاملة.',
      availability: 'in_stock' as const
    }));

    return [...DEFAULT_IRAMO_PRODUCTS, ...managerPresets];
  }, [customizations]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(allProducts.map(p => p.category)));
    return ['الكل', ...cats];
  }, [allProducts]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.originalStore.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchQuery, selectedCategory]);

  const getWhatsAppLink = (message: string) => {
    const rawNum = customizations?.socials?.whatsapp || '+964 780 123 4567';
    const cleanNum = rawNum.replace(/\s+/g, '').replace('+', '');
    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
  };

  const handleOrderProduct = (prod: IramoProduct) => {
    const orderMsg = `✨ مرحباً كادر إيرامو المتميز، أود طلب وحجز المنتج الفاخر المعروض في التطبيق:
🎁 اسم المنتج: ${prod.name}
💰 السعر: ${prod.price.toLocaleString()} د.ع
🏬 المتجر الأصلي: ${prod.originalStore}
الرجاء تأكيد توافر المنتج وإرسال مندوب التوصيل لموقعي 💖`;

    window.open(getWhatsAppLink(orderMsg), '_blank');
    setBookingSuccess(prod.id);
    setTimeout(() => setBookingSuccess(null), 4000);
  };

  const getAvailabilityBadge = (status: 'in_stock' | 'limited' | 'preorder') => {
    switch (status) {
      case 'in_stock':
        return { text: 'متوفر فوري ✅', css: 'bg-emerald-50 text-emerald-800 border-emerald-100' };
      case 'limited':
        return { text: 'كمية محدودة جداً ⚡', css: 'bg-amber-50 text-amber-800 border-amber-100' };
      case 'preorder':
        return { text: 'حجز مسبق 📦', css: 'bg-indigo-50 text-indigo-800 border-indigo-100' };
    }
  };

  return (
    <section className="space-y-5 text-right" dir="rtl">
      {/* Head section */}
      <div className="flex justify-between items-center bg-gradient-to-r from-pink-500/10 via-pink-500/5 to-transparent p-4 rounded-3xl border border-pink-100/40">
        <div>
          <h3 className="font-extrabold text-sm md:text-base text-gray-800 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-pink-700 animate-pulse" />
            <span>تسوقي منتجات متجر إيرامو الحصرية ✨</span>
          </h3>
          <p className="text-[10px] text-gray-400 font-bold leading-normal mt-0.5">
            أرقى حقائب اليد والماركات العالمية وسيرومات البشرة الأصلية جاهزة للتسليم الفوري
          </p>
        </div>
        <div className="bg-pink-100 text-pink-700 font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
          أصلي 100%
        </div>
      </div>

      {/* Success alert toast */}
      {bookingSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2.5 animate-slide-up text-xs font-bold shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>تم تجهيز طلبكِ بنجاح وتحويلكِ للواتساب لتثبيت العنوان فوراُ! 🥳</span>
        </div>
      )}

      {/* Search and Filters panel */}
      <div className="space-y-3">
        {/* Real search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="البحث باسم المنتج أو الماركة (مثال: Dior)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-gray-700 placeholder-gray-400 font-bold text-xs pr-10 pl-4 py-3 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-all text-right shadow-xs"
          />
          <Search className="w-4 h-4 text-pink-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Categories scrolling area */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" dir="rtl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-[10px] font-black whitespace-nowrap transition-all border shrink-0 cursor-pointer active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-pink-700 to-pink-500 text-white shadow-md shadow-pink-500/20 border-transparent scale-[1.02]'
                  : 'bg-white text-gray-500 border-pink-100 hover:bg-pink-50/20 hover:border-pink-200'
              }`}
            >
              {cat === 'الكل' ? '🌟 الكل' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Curated Product Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredProducts.map((prod) => {
          const availBadge = getAvailabilityBadge(prod.availability);
          return (
            <div
              key={prod.id}
              className="bg-white border border-pink-50/70 rounded-[2rem] p-3 flex flex-col justify-between hover:shadow-lg hover:border-pink-100 transition-all duration-300 h-[280px] relative group"
            >
              {/* Product top image header */}
              <div className="space-y-2.5">
                <div className="w-full h-28 rounded-2xl overflow-hidden bg-pink-50 border border-pink-100 relative shadow-inner">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Availability Badge */}
                  <span className={`absolute top-1.5 right-1.5 font-black text-[8px] px-2 py-0.5 rounded-full border shadow-sm ${availBadge.css}`}>
                    {availBadge.text}
                  </span>
                  
                  {/* Category text in image bottom-left */}
                  <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white font-bold text-[7.5px] px-2 py-0.5 rounded-md">
                    {prod.category}
                  </span>
                </div>

                {/* Name and Store Metadata */}
                <div className="space-y-0.5">
                  <span className="text-[8px] text-gray-400 font-black tracking-wide block truncate">
                    المصدر: {prod.originalStore}
                  </span>
                  <h4 className="font-extrabold text-[10.5px] text-gray-800 line-clamp-2 leading-snug h-8 overflow-hidden">
                    {prod.name}
                  </h4>
                </div>
              </div>

              {/* Product bottom action with price */}
              <div className="space-y-2 pt-2 border-t border-dashed border-pink-50/80">
                <div className="flex justify-between items-center flex-row-reverse">
                  <span className="text-[8px] text-gray-400 font-bold">السعر النهائي</span>
                  <span className="text-pink-700 font-black text-[12px] tracking-tight">
                    {prod.price.toLocaleString()} د.ع
                  </span>
                </div>

                <button
                  onClick={() => handleOrderProduct(prod)}
                  className="w-full bg-pink-50 hover:bg-pink-700 hover:text-white border border-pink-100 text-pink-700 font-black text-[9px] py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>طلب فوري وحجز 🛍️</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400 bg-white/50 rounded-[2rem] border border-pink-50/60 flex flex-col items-center justify-center gap-2">
            <Grid className="w-8 h-8 text-pink-200" />
            <p className="text-xs font-bold">لا يوجد منتجات حالياً تطابق بحثكِ.</p>
          </div>
        )}
      </div>
    </section>
  );
}
