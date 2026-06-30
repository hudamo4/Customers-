import React, { useState, useEffect } from 'react';
import { Truck, Scale, Plane, Ship, MapPin, Calculator, Info, Sparkles } from 'lucide-react';
import { triggerLightHaptic, triggerSuccessHaptic } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

export default function ShippingCalculator() {
  const [weight, setWeight] = useState<string>('1');
  const [transitType, setTransitType] = useState<'air' | 'sea'>('air');
  const [province, setProvince] = useState<string>('baghdad');
  const [result, setResult] = useState<{
    intlCost: number;
    localCost: number;
    totalCost: number;
    duration: string;
  } | null>(null);

  // International Rate rules defined by administration
  const AIR_RATE_PER_KG = 12000; // 12,000 IQD per kg
  const SEA_RATE_PER_KG = 5000;  // 5,000 IQD per kg

  // Local Iraq rates matching administration settings
  const provinceRules: Record<string, { name: string; rate: number; duration: string }> = {
    baghdad: { name: 'محافظة بغداد الكريمة 🏰', rate: 5000, duration: '١ - ٢ يوم' },
    basra: { name: 'محافظة البصرة الفيحاء 🌴', rate: 8000, duration: '٢ - ٣ أيام' },
    mid_euphrates: { name: 'بابل، النجف وكربلاء المقدسة 🕌', rate: 6000, duration: '٢ - ٣ أيام' },
    north: { name: 'الموصل وباقي المحافظات الشمالية 🏔️', rate: 8000, duration: '٣ - ٤ أيام' },
    south: { name: 'العمارة والناصرية والمحافظات الجنوبية 🌾', rate: 7000, duration: '٢ - ٣ أيام' }
  };

  useEffect(() => {
    const numericWeight = parseFloat(weight) || 0;
    if (numericWeight <= 0) {
      setResult(null);
      return;
    }

    const ratePerKg = transitType === 'air' ? AIR_RATE_PER_KG : SEA_RATE_PER_KG;
    const intlCost = Math.round(numericWeight * ratePerKg);
    const localCost = provinceRules[province]?.rate || 5000;
    const totalCost = intlCost + localCost;
    
    // Total Duration = International Transit (Air is 5-7 days, Sea is 25-30 days) + Local Delivery (1-4 days)
    const intlDuration = transitType === 'air' ? '٥ - ٨ أيام شحن دولي' : '٢٥ - ٣٠ يوم شحن بحري دقيق';
    const localDuration = provinceRules[province]?.duration || '١ - ٣ أيام';

    setResult({
      intlCost,
      localCost,
      totalCost,
      duration: `${intlDuration} + ${localDuration} توصيل داخلي`
    });
  }, [weight, transitType, province]);

  const handleWeightChange = (val: string) => {
    // allow decimal digits, prevent alphabetic
    const clean = val.replace(/[^0-9.]/g, '');
    setWeight(clean);
    triggerLightHaptic();
  };

  const handleQuickWeight = (w: number) => {
    setWeight(w.toString());
    triggerSuccessHaptic();
  };

  return (
    <div className="bg-white border border-pink-100 rounded-[2.5rem] p-6 space-y-5 text-right shadow-sm relative overflow-hidden" dir="rtl" id="shipping-calculator">
      
      {/* Decorative sparkle background asset */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 bg-pink-50 border border-pink-100/60 px-3 py-1 rounded-full">
          <Calculator className="w-3.5 h-3.5 text-pink-700" />
          <span className="text-[9.5px] font-black text-pink-800">حاسبة تسعير الطرود الذكية ⚖️</span>
        </div>
        <h3 className="text-sm font-black text-pink-950 mt-1">حاسبة تكاليف الشحن التقديرية</h3>
        <p className="text-[9px] text-gray-400 font-bold leading-relaxed">
          احسبي تكلفة شحن منتجاتكِ الفردية من مستودعاتنا الدولية في إسطنبول وباريس وحتى عتبة منزلكِ في العراق بحسب وزن الطرد ونوعه.
        </p>
      </div>

      {/* Calculator Body Fields */}
      <div className="space-y-4 pt-1">
        
        {/* Transit Type Selector (Air vs Sea) */}
        <div>
          <label className="block text-[9.5px] font-black text-gray-400 mb-1.5 mr-1">نوع الشحن الدولي المفضل:</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => { triggerLightHaptic(); setTransitType('air'); }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 transition-all cursor-pointer ${
                transitType === 'air'
                  ? 'bg-pink-50 border-pink-500 text-pink-950 font-black shadow-xs'
                  : 'bg-gray-50/50 border-gray-100 text-gray-500 font-bold hover:bg-gray-50'
              }`}
            >
              <Plane className={`w-4 h-4 ${transitType === 'air' ? 'text-pink-600 animate-bounce' : 'text-gray-400'}`} />
              <div className="text-right">
                <span className="text-[10px] block">شحن جوي سريع ✈️</span>
                <span className="text-[8px] text-gray-400 block font-semibold">١٢,٠٠٠ د.ع / كغم</span>
              </div>
            </button>

            <button
              onClick={() => { triggerLightHaptic(); setTransitType('sea'); }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 transition-all cursor-pointer ${
                transitType === 'sea'
                  ? 'bg-pink-50 border-pink-500 text-pink-950 font-black shadow-xs'
                  : 'bg-gray-50/50 border-gray-100 text-gray-500 font-bold hover:bg-gray-50'
              }`}
            >
              <Ship className={`w-4 h-4 ${transitType === 'sea' ? 'text-pink-600' : 'text-gray-400'}`} />
              <div className="text-right">
                <span className="text-[10px] block">شحن بحري اقتصادي 🚢</span>
                <span className="text-[8px] text-gray-400 block font-semibold">٥,٠٠٠ د.ع / كغم</span>
              </div>
            </button>
          </div>
        </div>

        {/* Input weight */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-[9.5px] font-black text-gray-400 mb-1 mr-1">الوزن التقديري للطرد (كيلوغرام):</label>
            <div className="relative">
              <Scale className="absolute right-3.5 top-3 w-4 h-4 text-pink-400" />
              <input 
                type="text"
                value={weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                placeholder="مثال: 1.5"
                className="w-full bg-pink-50/10 border-2 border-pink-100 rounded-2xl py-2.5 pr-10 pl-12 text-[10.5px] font-black text-pink-950 focus:outline-none focus:border-pink-500 text-right"
              />
              <span className="absolute left-3.5 top-3 text-[9px] font-black text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full">
                كغم Kg
              </span>
            </div>
          </div>

          {/* Destination Province */}
          <div className="col-span-1">
            <label className="block text-[9.5px] font-black text-gray-400 mb-1 mr-1">المحافظة الوجهة:</label>
            <div className="relative">
              <select
                value={province}
                onChange={(e) => { triggerLightHaptic(); setProvince(e.target.value); }}
                className="w-full bg-pink-50/10 border-2 border-pink-100 rounded-2xl py-2.5 px-3 text-[10.5px] font-black text-pink-950 focus:outline-none focus:border-pink-500 text-right appearance-none"
              >
                <option value="baghdad">بغداد</option>
                <option value="basra">البصرة</option>
                <option value="mid_euphrates">الفرات الأوسط</option>
                <option value="north">الشمالية</option>
                <option value="south">الجنوبية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick weight selector chips */}
        <div className="flex gap-2 justify-start items-center">
          <span className="text-[8.5px] font-bold text-gray-400">أوزان شائعة:</span>
          {[0.5, 1, 2, 5].map(w => (
            <button
              key={w}
              onClick={() => handleQuickWeight(w)}
              className={`text-[9px] font-black px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                parseFloat(weight) === w
                  ? 'bg-pink-700 text-white shadow-xs'
                  : 'bg-pink-50 hover:bg-pink-100 text-pink-950'
              }`}
            >
              {w} {w === 0.5 ? 'نصف كغم' : 'كغم'}
            </button>
          ))}
        </div>

      </div>

      {/* Calculator Result Box */}
      <AnimatePresence>
        {result ? (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 text-white rounded-3xl p-4 space-y-3.5 relative border border-white/10 mt-1 shadow-md">
              
              {/* Luxury receipt style dotted line divider */}
              <div className="flex justify-between items-center pb-2 border-b border-dashed border-white/10">
                <span className="text-[9.5px] font-black text-pink-400">تذكرة تسعير الشحن التقديرية</span>
                <span className="text-[8px] text-gray-400 font-mono">ID: {Math.floor(1000 + Math.random() * 9000)}</span>
              </div>

              {/* Cost breakouts */}
              <div className="space-y-2 text-[10px] font-semibold text-gray-300">
                <div className="flex justify-between items-center">
                  <span>الشحن الدولي ({weight} كغم):</span>
                  <span className="font-extrabold text-white">{result.intlCost.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>التوصيل المحلي ({provinceRules[province]?.name.replace(/🏰|🌴|🕌|🏔|🌾/g, '')}):</span>
                  <span className="font-extrabold text-white">+{result.localCost.toLocaleString()} د.ع</span>
                </div>
                
                {/* Total estimate */}
                <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-white/10">
                  <span className="text-xs font-black text-pink-300">إجمالي السعر التقديري:</span>
                  <span className="text-sm font-black text-emerald-400">{result.totalCost.toLocaleString()} د.ع</span>
                </div>
              </div>

              {/* Delivery Duration info */}
              <div className="bg-white/5 p-2.5 rounded-xl text-[9px] text-gray-300 border border-white/5 space-y-0.5 leading-relaxed">
                <span className="text-[8.5px] font-black text-pink-400 block">⏳ المدة المتوقعة للوصول:</span>
                <p className="font-bold">{result.duration}</p>
              </div>

            </div>
          </motion.div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-4 text-center text-[9.5px] text-gray-400 font-bold">
            ⚠️ يرجى كتابة وزن صحيح لحساب التكلفة بدقة.
          </div>
        )}
      </AnimatePresence>

      {/* Hadoosha friendly tip overlay */}
      <div className="bg-pink-50/40 rounded-2xl p-3 border border-pink-100 flex gap-2.5 items-center">
        <span className="text-base animate-pulse">💡</span>
        <div className="text-right">
          <span className="text-[9px] font-black text-pink-950 block">نصيحة توفير من مديرة إيرامو هدى 🌸</span>
          <span className="text-[8.5px] text-gray-500 font-bold block leading-relaxed mt-0.5">
            اجمعي مشترياتكِ وحقائبكِ في شحنة دولية واحدة لتقليل رسوم الوزن وتحقيق أقصى توفير على الشحن والتوصيل المحلي!
          </span>
        </div>
      </div>

    </div>
  );
}
