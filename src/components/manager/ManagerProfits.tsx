import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  DollarSign, 
  Sparkles, 
  Activity, 
  ArrowUpRight,
  HelpCircle,
  Award
} from 'lucide-react';

export default function ManagerProfits() {
  const { invoices } = useApp();

  // Compute stats based on current invoices
  const calculateTotalSales = () => {
    let total = 0;
    invoices.forEach(inv => {
      const numericAmount = parseInt(inv.amount.replace(/[^0-9]/g, '')) || 0;
      total += numericAmount;
    });
    return total;
  };

  const calculatePaidSales = () => {
    let total = 0;
    invoices.filter(inv => inv.status === 'Paid').forEach(inv => {
      const numericAmount = parseInt(inv.amount.replace(/[^0-9]/g, '')) || 0;
      total += numericAmount;
    });
    return total;
  };

  const totalSales = calculateTotalSales();
  const netProfit = calculatePaidSales();
  const estimatedCosts = totalSales - netProfit;

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="manager-profits">
      
      {/* Hero Net Profit Card */}
      <div className="bg-white border border-pink-100 rounded-[40px] p-8 text-center relative overflow-hidden shadow-sm" dir="rtl">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">إجمالي صافي الأرباح المحصلة للشهر الحالي</p>
        <h2 className="text-4xl font-black text-pink-700 tracking-tight mb-4">
          {netProfit.toLocaleString()} <span className="text-sm font-bold text-gray-400">د.ع</span>
        </h2>
        
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100/50 px-4 py-1.5 rounded-full text-[10px] font-black">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+12% نمو تصاعدي عن الشهر الماضي</span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-right">
          <div className="bg-gray-50/70 p-4 rounded-3xl border border-pink-50">
            <p className="text-[9px] text-gray-400 font-bold mb-1">إجمالي الفواتير الصادرة</p>
            <p className="font-black text-sm text-gray-800">{totalSales.toLocaleString()} د.ع</p>
          </div>
          <div className="bg-gray-50/70 p-4 rounded-3xl border border-pink-50">
            <p className="text-[9px] text-gray-400 font-bold mb-1">المصاريف المقدرة للشحن</p>
            <p className="font-black text-sm text-gray-800">{(totalSales * 0.4).toLocaleString()} د.ع</p>
          </div>
        </div>
      </div>

      {/* Motivational Mascot Advice Card */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 flex flex-col items-center text-center space-y-4" dir="rtl">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-pink-50 p-2 animate-bounce">
          <img 
            className="w-full h-full object-contain" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw0xKB-4XQGiCPqXbuGq8APMBdzW2M0L-ExpE11qomM_33WX4Zfa3VKeZt7ycefguOAsfq87QiTcQbNirpa65C1u6ZJkyPh5qSy5w8rFw-2f_VaP7vmXjslvUqo6qScQKbqMV8z3VK0_MD6CCR-T3efRZC_JorCRcBTiQJsHmEM4Wx30fA5botntSpYRXLuerNRHWaMjjQHXiUw467xTvDBl30QGA1v31JBe6wz7_7HyWWC3e3yu2oxKrfFZkb_DakDSTcVGfoBdo"
          />
        </div>
        <div>
          <h3 className="font-black text-sm text-pink-900">رسالة هداية لكِ هدى ✨</h3>
          <p className="text-[11px] text-gray-500 leading-relaxed max-w-xs mx-auto font-bold mt-1">
            "مبيعاتكِ في تطور مستمر يا بطلة! التركيز على Trendyol هذا الشهر زاد الأرباح بنسبة ملحوظة. استمري في التميز!"
          </p>
        </div>
      </div>

      {/* 6-Month Profit Trend Representation using beautifully styled HTML/CSS bars */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-6 text-right" dir="rtl">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-xs text-gray-800">اتجاه الأرباح السنوي (آخر 6 أشهر)</h3>
          <span className="text-[9px] text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full font-black">كل القنوات</span>
        </div>

        <div className="h-44 flex items-end justify-between gap-3 px-2 pt-4">
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-pink-100 rounded-t-xl h-12"></div>
            <span className="text-[8px] font-bold text-gray-400">يناير</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-pink-200 rounded-t-xl h-20"></div>
            <span className="text-[8px] font-bold text-gray-400">فبراير</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-pink-300 rounded-t-xl h-16"></div>
            <span className="text-[8px] font-bold text-gray-400">مارس</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-pink-400 rounded-t-xl h-28"></div>
            <span className="text-[8px] font-bold text-gray-400">أبريل</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-pink-500 rounded-t-xl h-24"></div>
            <span className="text-[8px] font-bold text-gray-400">مايو</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-pink-700 rounded-t-xl h-36 shadow-sm relative">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-pink-700">الآن</span>
            </div>
            <span className="text-[8px] font-black text-pink-700">يونيو</span>
          </div>
        </div>
      </div>

      {/* Expense Analysis */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-5 text-right" dir="rtl">
        <h3 className="font-black text-xs text-gray-800">تحليل كفاءة التشغيل والمصروفات</h3>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-gray-500">مبيعات الماركات (Trendyol/Shein)</span>
              <span className="text-pink-700 font-black">60%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-pink-700 h-full rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-gray-500">رسوم الشحن الدولي والتخليص</span>
              <span className="text-pink-700 font-black">25%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-pink-400 h-full rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-gray-500">التوصيل المحلي في المحافظات العراقية</span>
              <span className="text-pink-700 font-black">15%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-pink-200 h-full rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
