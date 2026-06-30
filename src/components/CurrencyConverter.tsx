import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowLeftRight, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { triggerLightHaptic, triggerSuccessHaptic } from '../utils/haptics';

export default function CurrencyConverter() {
  const [iqd, setIqd] = useState<string>('14500');
  const [usd, setUsd] = useState<string>('10');
  const [activeInput, setActiveInput] = useState<'iqd' | 'usd'>('iqd');

  const EXCHANGE_RATE = 1450; // 1450 IQD per 1 USD

  useEffect(() => {
    if (activeInput === 'iqd') {
      const numericIqd = parseFloat(iqd.replace(/,/g, '')) || 0;
      const convertedUsd = (numericIqd / EXCHANGE_RATE).toFixed(2);
      setUsd(convertedUsd === '0.00' ? '' : parseFloat(convertedUsd).toString());
    }
  }, [iqd]);

  useEffect(() => {
    if (activeInput === 'usd') {
      const numericUsd = parseFloat(usd) || 0;
      const convertedIqd = Math.round(numericUsd * EXCHANGE_RATE);
      setIqd(convertedIqd === 0 ? '' : convertedIqd.toLocaleString());
    }
  }, [usd]);

  const handleIqdChange = (val: string) => {
    setActiveInput('iqd');
    const clean = val.replace(/[^0-9]/g, '');
    setIqd(clean ? parseInt(clean, 10).toLocaleString() : '');
    triggerLightHaptic();
  };

  const handleUsdChange = (val: string) => {
    setActiveInput('usd');
    const clean = val.replace(/[^0-9.]/g, '');
    setUsd(clean);
    triggerLightHaptic();
  };

  const applyPreset = (presetIqd: number) => {
    setActiveInput('iqd');
    setIqd(presetIqd.toLocaleString());
    triggerSuccessHaptic();
  };

  return (
    <div className="bg-white border border-pink-100 rounded-[2.5rem] p-6 space-y-5 text-right shadow-xs relative overflow-hidden" dir="rtl" id="currency-converter-card">
      {/* Decorative background flare */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/50 px-3 py-1 rounded-full">
          <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
          <span className="text-[9.5px] font-black text-amber-800">حاسبة فواتيري والمالية الفورية 💵</span>
        </div>
        <h3 className="text-sm font-black text-pink-950">محول العملات اللحظي (الدينار العراقي ⇆ الدولار)</h3>
        <p className="text-[9px] text-gray-400 font-bold leading-relaxed">
          حولي قيم الشحن والمشتريات بين العملتين فوراً لتسهيل التسديد والدفع للمديرة هدى السلطاني بسعر صرف رسمي ثابت.
        </p>
      </div>

      {/* Live Exchange Rate Indicator */}
      <div className="bg-gradient-to-r from-amber-50 to-pink-50/50 border border-amber-100/70 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-800">
          <DollarSign className="w-4 h-4 text-amber-600" />
          <span>سعر الصرف المعتمد بالإدارة:</span>
        </div>
        <span className="text-[11px] font-black bg-white border border-pink-100 px-3 py-1 rounded-full text-pink-700 shadow-xs">
          ١$ = {EXCHANGE_RATE.toLocaleString()} د.ع
        </span>
      </div>

      {/* Interactive Inputs */}
      <div className="space-y-4">
        
        {/* IQD Input */}
        <div>
          <label className="block text-[9.5px] font-black text-gray-400 mb-1.5 mr-1">المبلغ بالدينار العراقي (IQD):</label>
          <div className="relative">
            <input 
              type="text"
              value={iqd}
              onChange={(e) => handleIqdChange(e.target.value)}
              placeholder="مثال: 15,000"
              className="w-full bg-pink-50/10 border-2 border-pink-100 rounded-2xl py-3 pr-4 pl-14 text-xs font-black text-pink-950 focus:outline-none focus:border-amber-500 text-right font-mono"
            />
            <span className="absolute left-3 top-2.5 text-[9px] font-black text-pink-800 bg-pink-50 px-2.5 py-1 rounded-xl">
              د.ع IQD
            </span>
          </div>
        </div>

        {/* Swap visual element */}
        <div className="flex justify-center -my-2">
          <div className="bg-pink-50 border border-pink-100 w-8 h-8 rounded-full flex items-center justify-center text-pink-700 shadow-xs">
            <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
          </div>
        </div>

        {/* USD Input */}
        <div>
          <label className="block text-[9.5px] font-black text-gray-400 mb-1.5 mr-1">المعادل بالدولار الأمريكي (USD):</label>
          <div className="relative">
            <input 
              type="text"
              value={usd}
              onChange={(e) => handleUsdChange(e.target.value)}
              placeholder="مثال: 10.5"
              className="w-full bg-pink-50/10 border-2 border-pink-100 rounded-2xl py-3 pr-4 pl-14 text-xs font-black text-pink-950 focus:outline-none focus:border-amber-500 text-right font-mono"
            />
            <span className="absolute left-3 top-2.5 text-[9px] font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl">
              دولار USD
            </span>
          </div>
        </div>

      </div>

      {/* Popular Shipping Rate Presets */}
      <div className="space-y-2 pt-1">
        <span className="block text-[8.5px] font-bold text-gray-400 mr-1">أجور شحن ومبالغ شائعة للتحويل:</span>
        <div className="flex flex-wrap gap-2 justify-start">
          {[5000, 10000, 15000, 25000, 50000].map((val) => (
            <button
              key={val}
              onClick={() => applyPreset(val)}
              className="text-[9px] font-black px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-950 transition-all cursor-pointer active:scale-95"
            >
              {val.toLocaleString()} د.ع
            </button>
          ))}
        </div>
      </div>

      {/* Decorative Tip */}
      <div className="bg-amber-50/30 border border-amber-100/50 p-3 rounded-2xl flex gap-2 items-start text-right">
        <span className="text-sm">👑</span>
        <p className="text-[8.5px] text-gray-500 font-bold leading-relaxed mt-0.5">
          ملاحظة: محول العملات هذا يعمل بالكامل دون الحاجة لإنترنت وتتم التحديثات مباشرة لضمان مطابقة سجلات الفواتير مع حساب الزين كاش والماستركارد الخاص بالإدارة.
        </p>
      </div>

    </div>
  );
}
