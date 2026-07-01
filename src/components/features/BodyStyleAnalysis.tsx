import React, { useState } from 'react';
import { Camera, Sparkles, AlertCircle, ShieldCheck, Heart, RefreshCw, Upload, Sparkle, Layers } from 'lucide-react';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '../../utils/haptics';

interface BodyResult {
  bodyShape: string;
  proportions: string;
  slimmingTips: string[];
  outfitRecommendations: Array<{ title: string; description: string }>;
}

export default function BodyStyleAnalysis() {
  const [image, setImage] = useState<string | null>(null);
  const [height, setHeight] = useState<string>('١٦٥ سم');
  const [size, setSize] = useState<string>('M');
  const [bodyType, setBodyType] = useState<string>('ساعة رملية');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<BodyResult | null>(null);
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
      const response = await fetch('/api/gemini/body-style-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, height, size, bodyType })
      });
      const data = await response.json();
      if (data.result) {
        setResult(data.result);
        triggerSuccessHaptic();
      } else {
        setError("فشل في تحليل تفاصيل الجسم. يرجى المحاولة مرة أخرى.");
      }
    } catch (err) {
      console.warn("Body analysis fail:", err);
      setError("حدث خطأ في الاتصال بخدمة الذكاء الاصطناعي. يرجى المحاولة لاحقاً.");
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
            <p className="animate-pulse">جاري قياس هندسة ونسب القوام الممشوق...</p>
            <p className="text-[9px] text-gray-400 font-bold">يقوم الذكاء الاصطناعي بتنسيق ملابس لطلة أكثر نحافة وطولاً 👗✨</p>
          </div>
        </div>
      ) : result ? (
        <div className="space-y-5 animate-fade-in">
          
          {/* Header Banner */}
          <div className="text-center border-b border-pink-100 pb-3">
            <span className="text-[8px] font-black text-pink-800 bg-pink-100/50 py-1 px-3 rounded-full uppercase">
              Body Shape & Flattering Style Guide 👗
            </span>
            <h4 className="font-extrabold text-xs text-pink-950 mt-1">دليل القوام والملابس الممشوقة</h4>
          </div>

          {/* Graphical Proportion Indicator Card */}
          <div className="bg-gradient-to-tr from-rose-50/20 via-pink-50/10 to-amber-50/15 p-4 rounded-3xl border border-pink-100/40 text-center space-y-3">
            <h5 className="font-black text-[9px] text-pink-950">مخطط تناسق قوام الجسم البصري</h5>
            
            <div className="flex justify-center items-center gap-6 py-2">
              {/* Stator outline of body type */}
              <div className="relative w-20 h-40 border border-pink-200/40 rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                {/* Visual rendering of the specified body type */}
                <svg viewBox="0 0 100 200" className="w-full h-full p-2">
                  {/* Neck & Head */}
                  <circle cx="50" cy="20" r="10" fill="rgba(183,110,121,0.15)" stroke="#B76E79" strokeWidth="1.5" />
                  
                  {/* Shoulders to hips based on specified type */}
                  {bodyType === 'ساعة رملية' ? (
                    <path d="M 30 50 Q 50 50 70 50 Q 50 100 35 110 Q 50 115 65 110 Q 50 120 70 145 L 30 145 Z" fill="rgba(183,110,121,0.12)" stroke="#B76E79" strokeWidth="1.5" strokeLinejoin="round" />
                  ) : bodyType === 'كمثرى' ? (
                    <path d="M 38 50 Q 50 50 62 50 Q 50 90 30 115 Q 50 120 70 115 Q 50 125 75 145 L 25 145 Z" fill="rgba(183,110,121,0.12)" stroke="#B76E79" strokeWidth="1.5" strokeLinejoin="round" />
                  ) : (
                    <path d="M 32 50 Q 50 50 68 50 Q 50 95 32 105 Q 50 115 68 105 Q 50 120 68 145 L 32 145 Z" fill="rgba(183,110,121,0.12)" stroke="#B76E79" strokeWidth="1.5" strokeLinejoin="round" />
                  )}
                  
                  {/* Calibrating guides for slimming and elongating */}
                  <line x1="50" y1="40" x2="50" y2="180" stroke="#10B981" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                  <line x1="15" y1="105" x2="85" y2="105" stroke="#B76E79" strokeWidth="1" opacity="0.4" />
                  
                  {/* Measurement labels */}
                  <text x="50" y="102" fontSize="6" textAnchor="middle" fill="#953E4E" fontWeight="bold">تحديد الخصر</text>
                  <text x="50" y="172" fontSize="6" textAnchor="middle" fill="#10B981" fontWeight="bold">إطالة ممتدة</text>
                </svg>

                {/* Grid overlay */}
                <div className="absolute inset-0 pointer-events-none border border-dashed border-pink-200/20" />
              </div>

              {/* Specs side card */}
              <div className="text-right space-y-1.5 max-w-[50%]">
                <span className="text-[7.5px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-block">توازن القامة ⚖️</span>
                <p className="text-[10px] font-black text-pink-950 leading-tight">القامة: <span className="text-gray-500">{height}</span></p>
                <p className="text-[10px] font-black text-pink-950 leading-tight">المقاس المعتمد: <span className="text-gray-500">{size}</span></p>
                <p className="text-[10px] font-black text-pink-950 leading-tight">هيكل القوام: <span className="text-gray-500">{bodyType}</span></p>
                <p className="text-[8px] text-gray-500 font-bold mt-1 leading-snug">
                  نمط القياس يعتمد قاعدة الثلث والثلثين لخلق مظهر بصري ممشوق وأكثر طولاً ورشاقة.
                </p>
              </div>
            </div>
          </div>

          {/* Results details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Shape analysis */}
            <div className="bg-pink-50/15 p-3.5 rounded-2xl border border-pink-100/35 space-y-1">
              <h6 className="font-extrabold text-[9px] text-pink-950 border-b border-pink-100/60 pb-1 flex items-center justify-end gap-1">
                <span>توصيف تفصيلي لهيكل القوام</span>
                <Sparkle className="w-3.5 h-3.5 text-pink-700" />
              </h6>
              <p className="text-[8.5px] text-gray-600 font-bold leading-relaxed">
                {result.bodyShape}
              </p>
            </div>

            {/* Proportion analysis */}
            <div className="bg-amber-50/15 p-3.5 rounded-2xl border border-amber-100/35 space-y-1">
              <h6 className="font-extrabold text-[9px] text-amber-950 border-b border-amber-100/60 pb-1 flex items-center justify-end gap-1">
                <span>تناسق وتوزيع النسب البصرية</span>
                <Layers className="w-3.5 h-3.5 text-amber-700" />
              </h6>
              <p className="text-[8.5px] text-gray-600 font-semibold leading-relaxed">
                {result.proportions}
              </p>
            </div>
          </div>

          {/* Flattering rules and slimming tips */}
          <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50 space-y-1.5">
            <h6 className="font-extrabold text-[9.5px] text-emerald-950 flex items-center justify-end gap-1">
              <span>نصائح ذهبية لإطلالة أكثر نحافة وطولاً 🌿✨</span>
            </h6>
            <ul className="space-y-1.5">
              {result.slimmingTips?.map((tip, i) => (
                <li key={i} className="text-[8.5px] text-emerald-900 font-bold flex items-start gap-1 justify-end">
                  <span className="text-right">{tip}</span>
                  <span className="text-emerald-700 mt-0.5">•</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 5-7 Outfit Recommendations */}
          <div className="space-y-2.5">
            <h6 className="font-extrabold text-[10px] text-pink-950 flex items-center justify-end gap-1">
              <span>أفضل التنسيقات والقصات الملكية الموصى بها</span>
            </h6>

            <div className="grid grid-cols-1 gap-2.5">
              {result.outfitRecommendations?.map((outfit, i) => (
                <div key={i} className="bg-white border border-pink-100/50 p-4 rounded-2xl space-y-1 hover:border-pink-300 transition-all shadow-2xs">
                  <span className="text-[7.5px] font-black text-pink-800 bg-pink-50 py-0.5 px-2 rounded-lg inline-block">تنسيق مقترح {i+1}</span>
                  <h5 className="font-extrabold text-[9.5px] text-pink-950">{outfit.title}</h5>
                  <p className="text-[8.5px] text-gray-500 font-bold leading-relaxed">{outfit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex justify-between items-center pt-2 border-t border-pink-50">
            <div className="flex items-center gap-1 text-[8px] font-black text-pink-700">
              <ShieldCheck className="w-4 h-4 text-pink-600" />
              <span>مستشار تنسيق القوام الذكي - إيرامو</span>
            </div>
            <button
              onClick={() => { triggerLightHaptic(); setResult(null); setError(null); }}
              className="bg-pink-700 hover:bg-pink-800 text-white font-black text-[9.5px] py-2 px-4 rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>فحص وتنسيق جديد</span>
            </button>
          </div>

        </div>
      ) : (
        <div className="space-y-4 animate-fade-in text-right">
          
          <div className="bg-pink-50/25 border border-pink-100 p-4 rounded-2xl text-center space-y-1.5">
            <span className="text-[14px]">👗📐⚖️✨</span>
            <h4 className="font-extrabold text-xs text-pink-950">مستشار قوام الجسم والملابس الرشيقة</h4>
            <p className="text-[9px] text-gray-500 font-bold leading-relaxed max-w-sm mx-auto">
              تحديد المقاسات وتنسيق الملابس لطلة توحي بالنحافة والطول والرشاقة الفورية باستخدام خوارزميات قياس نسب الكتف، الخصر والأرداف.
            </p>
          </div>

          {/* Form input fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-pink-950 block">١. الطول الفعلي (سم):</label>
              <input 
                type="text" 
                value={height} 
                onChange={(e) => setHeight(e.target.value)} 
                className="w-full bg-white border border-pink-100 rounded-xl p-2.5 text-[9.5px] font-black text-right focus:outline-none focus:border-pink-500" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-pink-950 block">٢. مقاس ملابسكِ المعتاد:</label>
              <select 
                value={size} 
                onChange={(e) => setSize(e.target.value)} 
                className="w-full bg-white border border-pink-100 rounded-xl p-2.5 text-[9.5px] font-black text-right focus:outline-none focus:border-pink-500"
              >
                <option value="XS">XS (ناعم وصغير جداً)</option>
                <option value="S">S (صغير ناعم)</option>
                <option value="M">M (متوسط متناسق)</option>
                <option value="L">L (كبير وأنيق)</option>
                <option value="XL">XL (ممتلئ فخم)</option>
                <option value="XXL">XXL (فخم للغاية)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-extrabold text-pink-950 block">٣. هيكل ونوع قوامكِ المفضل للفحص:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'ساعة رملية ⌛', val: 'ساعة رملية' },
                { label: 'شكل كمثرى 🍐', val: 'كمثرى' },
                { label: 'مستطيل متناسق ⬜', val: 'مستطيل' },
                { label: 'مثلث مقلوب 🔻', val: 'مثلث مقلوب' },
                { label: 'ممتلئ تفاحة 🍎', val: 'تفاحة' }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => { triggerLightHaptic(); setBodyType(item.val); }}
                  className={`p-2.5 rounded-xl border text-[8.5px] font-black transition-all cursor-pointer ${
                    bodyType === item.val
                      ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                      : 'bg-white text-gray-700 border-pink-100 hover:bg-pink-50/30'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload preview Optional body photo */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-extrabold text-pink-950 block">٤. صورة القوام أو الوقوف (اختياري لتعزيز الدقة):</label>
            <div className="border border-dashed border-pink-200 bg-pink-50/5 hover:bg-pink-50/15 transition-all rounded-2xl p-4 text-center relative cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleUploadImage} 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              />
              {image ? (
                <p className="text-[8.5px] text-emerald-700 font-black">✨ تم ربط صورة القوام بنجاح!</p>
              ) : (
                <p className="text-[8px] text-gray-400 font-semibold">انقري لرفع صورة القوام كاملاً (يحافظ الفحص على هويتكِ 100%)</p>
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
            <span>ابدئي تحليل القوام ورسم التنسيقات الرشيقة ✨</span>
          </button>

        </div>
      )}
    </div>
  );
}
