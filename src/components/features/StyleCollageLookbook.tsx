import React, { useState } from 'react';
import { Camera, Sparkles, AlertCircle, ShieldCheck, Heart, RefreshCw, Upload, Star, ArrowUpRight } from 'lucide-react';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '../../utils/haptics';

interface CollageResult {
  title: string;
  userPalette: string[];
  paletteName: string;
  heightProportions: string;
  outfits: Array<{ name: string; desc: string }>;
}

export default function StyleCollageLookbook() {
  const [image, setImage] = useState<string | null>(null);
  const [height, setHeight] = useState<string>('١٦٥ سم');
  const [size, setSize] = useState<string>('M');
  const [season, setSeason] = useState<string>('Warm Autumn (خريف دافئ)');
  const [colors, setColors] = useState<string>('sage, rose pink, warm mustard, green, mocha, beige, rust');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CollageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerLightHaptic();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    triggerMediumHaptic();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/style-collage-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, height, size, season, preferredColors: colors })
      });
      const data = await response.json();
      if (data.result) {
        setResult(data.result);
        triggerSuccessHaptic();
      } else {
        setError("فشل في تصميم لوك بوك الـ ١٠ إطلالات. يرجى إعادة المحاولة.");
      }
    } catch (err) {
      console.warn("Collage analysis fail:", err);
      setError("حدث خطأ في الاتصال بالخادم. يرجى تجربة الفحص مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-pink-100/80 rounded-[2.5rem] p-5 shadow-xs text-right space-y-5">
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-pink-600 border-t-transparent animate-spin mx-auto" />
          <div className="space-y-1 text-xs text-pink-950 font-black">
            <p className="animate-pulse">جاري رسم لوك بوك الأناقة الفاخرة...</p>
            <p className="text-[9px] text-gray-400 font-bold">نقوم بتصميم ١٠ إطلالات منسقة كملصق بنترست الملكي 🎨📔</p>
          </div>
        </div>
      ) : result ? (
        // Pinterest-meets-hand-drawn Editorial Guide Collage Poster
        <div className="bg-[#FAF6F0] rounded-[2.2rem] p-5 border border-amber-200/40 text-right space-y-5 shadow-sm relative overflow-hidden select-text">
          {/* Subtle handdrawn background grid doodle */}
          <div className="absolute inset-0 bg-[radial-gradient(#E8D8C8_1px,transparent_1px)] [background-size:16px_16px] opacity-35 pointer-events-none" />

          {/* Cute handdrawn doodle annotations absolute decoration */}
          <div className="absolute top-2 left-2 text-rose-400/50 text-xs rotate-12 select-none font-bold">♥ Cute Vibes ♥</div>
          <div className="absolute bottom-2 right-2 text-emerald-600/30 text-[10px] -rotate-12 select-none font-bold">★ IRAMO LOOKBOOK ★</div>

          {/* Poster Header */}
          <div className="relative text-center border-b-2 border-dashed border-amber-200/60 pb-4 space-y-2">
            <span className="text-[7.5px] font-black text-amber-800 bg-amber-100/60 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
              ✨ {result.title} ✨
            </span>
            <h4 className="font-extrabold text-sm text-amber-950 mt-1 font-serif tracking-tight">لوك بوك الـ ١٠ إطلالات الفاخرة</h4>
            
            {/* Color palette swatches */}
            <div className="flex flex-col items-center gap-1.5 pt-1 bg-white/60 p-2.5 rounded-2xl border border-amber-100/50 inline-block mx-auto max-w-xs">
              <span className="text-[7.5px] text-amber-900 font-black">لوحة ألوانكِ الموسمية المعتمدة: ({result.paletteName})</span>
              <div className="flex gap-1.5 justify-center">
                {result.userPalette?.map((color, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div 
                      className="w-5 h-5 rounded-full border border-amber-950/20 shadow-2xs hover:scale-110 transition-all cursor-pointer" 
                      style={{ backgroundColor: color }} 
                      title={color}
                    />
                    <span className="text-[5.5px] font-mono text-gray-400 select-all">{color}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Height & Size tags */}
            <div className="flex justify-center gap-1.5 pt-1">
              <span className="text-[7px] font-black text-rose-800 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">القامة: {height}</span>
              <span className="text-[7px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">المقاس: {size}</span>
              <span className="text-[7px] font-black text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">الموسم: Warm Autumn 🍂</span>
            </div>
          </div>

          {/* Proportion instructions in editorial handdrawn style */}
          <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/50 text-right space-y-1 relative">
            <span className="absolute -top-2 left-3 bg-rose-200 text-rose-950 text-[6px] font-black px-1.5 py-0.5 rounded-full">توجيه الأناقة 📌</span>
            <h5 className="font-extrabold text-[8.5px] text-amber-950">📐 قواعد توزيع نسب الملابس وقوامكِ:</h5>
            <p className="text-[8px] text-gray-600 font-semibold leading-relaxed">
              {result.heightProportions}
            </p>
          </div>

          {/* Lookbook 10 looks grid */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-[9px] text-amber-950 border-r-2 border-rose-400 pr-1.5">
              الإطلالات الـ ١٠ المفصلة (استايل بنترست ملون):
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.outfits?.map((outfit, index) => (
                <div 
                  key={index} 
                  className="bg-white p-3.5 rounded-2xl border border-amber-100 hover:border-amber-300 transition-all shadow-2xs relative overflow-hidden"
                >
                  {/* Handwritten annotation details */}
                  <div className="absolute top-1 left-2 text-[6px] font-black text-rose-400 opacity-60">
                    {index % 3 === 0 ? '★ Cute' : index % 3 === 1 ? '♥ Elegant' : '✨ Perfect'}
                  </div>
                  
                  <span className="text-[7px] font-black text-amber-900 bg-amber-50 py-0.5 px-2 rounded-lg inline-block">
                    إطلالة {index + 1}
                  </span>
                  
                  <h6 className="font-black text-[9px] text-amber-950 mt-1 flex items-center gap-1">
                    <span>{outfit.name}</span>
                    <ArrowUpRight className="w-2.5 h-2.5 text-rose-400" />
                  </h6>
                  
                  <p className="text-[8px] text-gray-500 font-semibold leading-relaxed mt-0.5">
                    {outfit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-between items-center pt-2 border-t border-amber-200/40">
            <div className="flex items-center gap-1 text-[8px] font-black text-amber-800">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>مستشار استايل لوك بوك إيرامو</span>
            </div>
            <button
              onClick={() => { triggerLightHaptic(); setResult(null); setError(null); }}
              className="bg-amber-800 hover:bg-amber-900 text-white font-black text-[9px] py-2 px-4 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إنشاء لوك بوك جديد</span>
            </button>
          </div>

        </div>
      ) : (
        <div className="space-y-4 animate-fade-in text-right">
          
          <div className="bg-pink-50/25 border border-pink-100 p-4 rounded-2xl text-center space-y-1.5">
            <span className="text-[14px]">📔🍂🎨👢</span>
            <h4 className="font-extrabold text-xs text-pink-950">لوك بوك الـ ١٠ إطلالات الشخصي الكامل</h4>
            <p className="text-[9px] text-gray-500 font-bold leading-relaxed max-w-sm mx-auto">
              أدخلي قياسات قامتكِ وألوانكِ المفضلة، ليقوم منسق الموضة بتصميم ملصق "10 Looks Full Body Style Guide" الأنيق محاكياً لمجلة بنترست مع رسومات وكتابات بخط اليد.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-pink-950 block">١. الطول (سم):</label>
              <input 
                type="text" 
                value={height} 
                onChange={(e) => setHeight(e.target.value)} 
                className="w-full bg-white border border-pink-100 rounded-xl p-2.5 text-[9.5px] font-black text-right" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-pink-950 block">٢. المقاس المعتاد:</label>
              <input 
                type="text" 
                value={size} 
                onChange={(e) => setSize(e.target.value)} 
                className="w-full bg-white border border-pink-100 rounded-xl p-2.5 text-[9.5px] font-black text-right" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-extrabold text-pink-950 block">٣. تحليل لون الموسم المعتمد:</label>
            <input 
              type="text" 
              value={season} 
              onChange={(e) => setSeason(e.target.value)} 
              className="w-full bg-white border border-pink-100 rounded-xl p-2.5 text-[9.5px] font-black text-right" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-extrabold text-pink-950 block">٤. قائمة الألوان المفضلة للتنسيق:</label>
            <textarea 
              value={colors} 
              onChange={(e) => setColors(e.target.value)} 
              rows={2}
              className="w-full bg-white border border-pink-100 rounded-xl p-2.5 text-[9.5px] font-semibold text-right focus:outline-none" 
            />
          </div>

          {/* Upload optional portrait for identity verification */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-extrabold text-pink-950 block">٥. صورة بورتريه لدمج الملامح بنسبة 100% (اختياري):</label>
            <div className="border border-dashed border-pink-200 bg-pink-50/5 hover:bg-pink-50/15 transition-all rounded-2xl p-4 text-center relative cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleUploadImage} 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              />
              {image ? (
                <p className="text-[8.5px] text-emerald-700 font-black">✨ تم دمج ملامح صورتكِ في اللوك بوك بنجاح!</p>
              ) : (
                <p className="text-[8px] text-gray-400 font-semibold">ارفعي صورتكِ لضمان الحفاظ على تفاصيلكِ ورسم تماثل حقيقي</p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-[9px] font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            className="w-full bg-gradient-to-r from-pink-700 to-rose-950 text-white font-black text-[10px] py-3.5 px-5 rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-pink-300 animate-pulse" />
            <span>ابدئي تصميم لوك بوك الـ ١٠ إطلالات الفاخر 🍂🌸</span>
          </button>

        </div>
      )}
    </div>
  );
}
