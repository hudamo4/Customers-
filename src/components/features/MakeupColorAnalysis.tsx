import React, { useState } from 'react';
import { Camera, Sparkles, Star, AlertCircle, ShieldCheck, Heart, RefreshCw, Upload } from 'lucide-react';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '../../utils/haptics';

interface MakeupResult {
  makeupSuitability: string;
  recommendedMetal: string;
  recommendedAccessories: string[];
  recommendedNeckline: string;
  makeupLooks: Array<{ look: string; suitability: string }>;
}

export default function MakeupColorAnalysis() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<MakeupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeColorCompare, setActiveColorCompare] = useState<'warm' | 'cool' | 'neutral'>('warm');

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

  const handleSelectSample = (url: string) => {
    triggerLightHaptic();
    setImage(url);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    triggerMediumHaptic();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/makeup-color-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      });
      const data = await response.json();
      if (data.result) {
        setResult(data.result);
        triggerSuccessHaptic();
      } else {
        setError("فشل في تحليل تفاصيل الألوان والمكياج. يرجى محاولة رفع صورة أخرى.");
      }
    } catch (err) {
      console.warn("Makeup analysis fail:", err);
      setError("حدث خطأ في الاتصال بخدمة الذكاء الاصطناعي.");
    }
  };

  return (
    <div className="bg-white border border-pink-100/80 rounded-[2.5rem] p-5 shadow-xs text-right space-y-5">
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-pink-600 border-t-transparent animate-spin mx-auto" />
          <div className="space-y-1 text-xs text-pink-950 font-black">
            <p className="animate-pulse">جاري فحص التناغم اللوني والصبغات الطبيعية...</p>
            <p className="text-[9px] text-gray-400 font-bold">مستشار المكياج والألوان يعد لكِ مرجعاً ملكياً فريداً 🎨👸</p>
          </div>
        </div>
      ) : result ? (
        <div className="space-y-5 animate-fade-in">
          
          {/* Section Header */}
          <div className="text-center border-b border-pink-100 pb-3">
            <span className="text-[8px] font-black text-pink-800 bg-pink-100/50 py-1 px-3 rounded-full uppercase">
              Makeup & Personal Color Report 🎨
            </span>
            <h4 className="font-extrabold text-xs text-pink-950 mt-1">تقرير المكياج والألوان الفاخر</h4>
          </div>

          {/* Interactive Side-by-side Color simulation Preview */}
          <div className="bg-gradient-to-b from-pink-50/15 to-amber-50/5 p-4 rounded-3xl border border-pink-100/50 space-y-4">
            <h5 className="font-extrabold text-[9.5px] text-pink-950 text-center flex items-center justify-center gap-1">
              <span>محاكاة تأثير الإضاءة اللونية على بشرتكِ</span>
              <Sparkles className="w-3.5 h-3.5 text-pink-700 animate-pulse" />
            </h5>

            <div className="relative w-44 h-44 mx-auto rounded-2xl overflow-hidden border border-pink-200/60 shadow-md">
              <img 
                src={image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} 
                alt="Portrait simulation" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
              
              {/* Active Color Compare overlay layer */}
              {activeColorCompare === 'warm' && (
                <div className="absolute inset-0 bg-amber-500/10 mix-blend-color-burn pointer-events-none" />
              )}
              {activeColorCompare === 'cool' && (
                <div className="absolute inset-0 bg-blue-500/10 mix-blend-color-burn pointer-events-none" />
              )}
              {activeColorCompare === 'neutral' && (
                <div className="absolute inset-0 bg-pink-500/5 mix-blend-color-burn pointer-events-none" />
              )}

              {/* Info pill about current simulator state */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/75 text-white text-[7px] font-black px-2 py-0.5 rounded-md backdrop-blur-xs whitespace-nowrap">
                {activeColorCompare === 'warm' && 'إضاءة دافئة (Warm Autumn)'}
                {activeColorCompare === 'cool' && 'إضاءة باردة (Cool Winter)'}
                {activeColorCompare === 'neutral' && 'إضاءة محايدة (Neutral Skin)'}
              </div>
            </div>

            {/* Color Temperature Selector */}
            <div className="space-y-1">
              <p className="text-[8.5px] text-pink-950 font-black text-center">قارني بين صبغات الألوان وتأثيرها البصري 👇:</p>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'warm', label: 'تناغم دافئ 🔥' },
                  { id: 'cool', label: 'تناغم بارد ❄️' },
                  { id: 'neutral', label: 'تناغم محايد ⚖️' }
                ].map(temp => (
                  <button
                    key={temp.id}
                    onClick={() => { triggerLightHaptic(); setActiveColorCompare(temp.id as any); }}
                    className={`py-1 rounded-xl text-[8px] font-black border transition-all cursor-pointer ${
                      activeColorCompare === temp.id
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-gray-600 border-pink-100 hover:bg-pink-50/40'
                    }`}
                  >
                    {temp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis result content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Makeup suit card */}
            <div className="bg-pink-50/15 p-3.5 rounded-2xl border border-pink-100/35 space-y-1">
              <h6 className="font-extrabold text-[9px] text-pink-950 border-b border-pink-100/60 pb-1 flex items-center justify-end gap-1">
                <span>المكياج المتوافق مع بشرتكِ</span>
                <Heart className="w-3.5 h-3.5 text-pink-700" />
              </h6>
              <p className="text-[8.5px] text-gray-600 font-bold leading-relaxed">
                {result.makeupSuitability}
              </p>
            </div>

            {/* Styling advice metal necklines */}
            <div className="bg-amber-50/15 p-3.5 rounded-2xl border border-amber-100/35 space-y-1">
              <h6 className="font-extrabold text-[9px] text-amber-950 border-b border-amber-100/60 pb-1 flex items-center justify-end gap-1">
                <span>الياقة، المعادن، والإكسسوارات</span>
                <Star className="w-3.5 h-3.5 text-amber-700" />
              </h6>
              <ul className="space-y-1 text-[8.5px] text-gray-600 font-semibold leading-relaxed">
                <li>👑 <strong className="text-amber-950 font-black">المعدن الملائم:</strong> {result.recommendedMetal}</li>
                <li>👗 <strong className="text-amber-950 font-black">قصة الياقة/الرقبة:</strong> {result.recommendedNeckline}</li>
                <li>✨ <strong className="text-amber-950 font-black">أفضل حلي وإكسسوارات:</strong> {result.recommendedAccessories?.join('، ')}</li>
              </ul>
            </div>
          </div>

          {/* Side by side makeup looks recommendations list */}
          {result.makeupLooks && result.makeupLooks.length > 0 && (
            <div className="bg-white p-3.5 rounded-2xl border border-pink-100/40 space-y-2">
              <h6 className="font-extrabold text-[9px] text-pink-950 border-b border-pink-50 pb-1">
                جدول ملاءمة إطلالات المكياج المقترحة
              </h6>
              <div className="space-y-2">
                {result.makeupLooks.map((look, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-pink-50 pb-2 last:border-none last:pb-0">
                    <span className="text-[8px] font-bold text-gray-500 max-w-[65%] text-left line-clamp-1">{look.suitability}</span>
                    <span className="text-[8.5px] font-black text-pink-900 bg-pink-50 py-0.5 px-2 rounded-lg">{look.look}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons row */}
          <div className="flex justify-between items-center pt-2 border-t border-pink-50">
            <div className="flex items-center gap-1 text-[8px] font-black text-pink-700">
              <ShieldCheck className="w-4 h-4 text-pink-600" />
              <span>مستشار المكياج والألوان الشخصي - إيرامو</span>
            </div>
            <button
              onClick={() => { triggerLightHaptic(); setResult(null); setError(null); }}
              className="bg-pink-700 hover:bg-pink-800 text-white font-black text-[9.5px] py-2 px-4 rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحليل لوني جديد</span>
            </button>
          </div>

        </div>
      ) : (
        <div className="space-y-4 animate-fade-in text-right">
          
          <div className="bg-pink-50/25 border border-pink-100 p-4 rounded-2xl text-center space-y-1.5">
            <span className="text-[14px]">👸🎨💄✨</span>
            <h4 className="font-extrabold text-xs text-pink-950">مستشار المكياج والألوان الملكي</h4>
            <p className="text-[9px] text-gray-500 font-bold leading-relaxed max-w-sm mx-auto">
              ارفعي صورة بورتريه شخصية مستقيمة ليقوم مستشار التجميل بفحص التناغم اللوني مع بشرتكِ، ويرشح لكِ أفضل مكياج، ياقات ومعادن تناسب حضوركِ وبشرتكِ الفريدة.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-pink-950 block">١. قومي برفع صورتكِ الكريمة:</label>
            <div className="border border-dashed border-pink-200 bg-pink-50/5 hover:bg-pink-50/15 transition-all rounded-2xl p-6 text-center relative cursor-pointer group">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleUploadImage} 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              />
              {image ? (
                <div className="space-y-2 flex flex-col items-center">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-pink-200">
                    <img src={image} alt="Portrait preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <p className="text-[8.5px] text-emerald-700 font-black">✨ تم رفع صورتكِ بنجاح! جاهزة للفحص اللوني الملكي.</p>
                </div>
              ) : (
                <div className="space-y-1.5 flex flex-col items-center">
                  <div className="p-2.5 bg-pink-100/50 rounded-full text-pink-800">
                    <Upload className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[9.5px] font-black text-pink-950">اسحبي صورتكِ أو انقري للرفع</p>
                    <p className="text-[8px] text-gray-400 font-semibold">بصيغة JPEG أو PNG، الوجه مستقيم ومضاء جيداً</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sample models */}
          <div className="space-y-1.5">
            <label className="text-[9.5px] font-extrabold text-pink-950 block">أو تجربة التحليل الفوري على النماذج الفاخرة:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'الأميرة ريم 🌸', label: 'حنطية', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400' },
                { name: 'الملكة ياسمين 👑', label: 'فاتحة جداً', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
                { name: 'الملكة مريم ✨', label: 'حنطية شرقية', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400' }
              ].map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample.url)}
                  className={`p-2 rounded-xl border text-right transition-all flex items-center gap-1.5 cursor-pointer ${
                    image === sample.url ? 'bg-pink-100/50 border-pink-400' : 'bg-white border-pink-100 hover:bg-pink-50/10'
                  }`}
                >
                  <img src={sample.url} alt={sample.name} className="w-7 h-7 rounded-full object-cover border border-pink-100" referrerPolicy="no-referrer" />
                  <div className="text-[7.5px] overflow-hidden">
                    <p className="font-black text-pink-950 leading-none truncate">{sample.name}</p>
                    <p className="text-[6.5px] text-gray-400 mt-0.5 whitespace-nowrap">{sample.label}</p>
                  </div>
                </button>
              ))}
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
            disabled={!image}
            className="w-full bg-gradient-to-r from-pink-700 to-rose-950 disabled:from-gray-300 disabled:to-gray-300 text-white font-black text-[10px] py-3 px-5 rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-pink-300" />
            <span>ابدئي التحليل اللوني وتأثير المكياج الفاخر 🌸</span>
          </button>

        </div>
      )}
    </div>
  );
}
