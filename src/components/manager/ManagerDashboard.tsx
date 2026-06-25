import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Users, 
  Sparkles, 
  PlusCircle, 
  Receipt, 
  ArrowLeft, 
  Activity, 
  ChevronLeft 
} from 'lucide-react';

interface ManagerDashboardProps {
  onAddShipmentClick: () => void;
  onAddInvoiceClick: () => void;
  onNavigateToTab: (tab: string) => void;
}

export default function ManagerDashboard({ 
  onAddShipmentClick, 
  onAddInvoiceClick, 
  onNavigateToTab 
}: ManagerDashboardProps) {
  const { shipments, invoices, profile } = useApp();

  // Compute stats
  const activeShipmentsCount = shipments.length;
  
  // Calculate total invoice amounts
  const calculateTotalSales = () => {
    let total = 0;
    invoices.forEach(inv => {
      const numericAmount = parseInt(inv.amount.replace(/[^0-9]/g, '')) || 0;
      total += numericAmount;
    });
    return total;
  };

  const calculatePendingSales = () => {
    let total = 0;
    invoices.filter(inv => inv.status === 'Pending').forEach(inv => {
      const numericAmount = parseInt(inv.amount.replace(/[^0-9]/g, '')) || 0;
      total += numericAmount;
    });
    return total;
  };

  const totalSales = calculateTotalSales();
  const pendingSales = calculatePendingSales();
  const completedSales = totalSales - pendingSales;

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="manager-dashboard">
      
      {/* Friendly Welcome Banner */}
      <div className="bg-white/70 backdrop-blur-xl border border-pink-100/30 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between shadow-sm">
        <div className="relative z-10 max-w-[70%] text-right" dir="rtl">
          <div className="inline-flex items-center gap-1.5 bg-pink-50 border border-pink-100 px-3 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-700 animate-pulse"></span>
            <span className="text-[10px] font-black text-pink-800">لوحة إدارة المتجر الاحترافية</span>
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-1">
            أهلاً بكِ مجدداً، <br />
            <span className="text-pink-700">مديرة إيرامو هدى السلطاني</span> ✨
          </h2>
          <p className="text-[11px] text-gray-500 font-bold leading-relaxed mt-2">
            نتمنى لكِ يوماً مليئاً بالإنجازات والجمال. إليكِ ملخص لمتجركِ اليوم لتسهيل إدارة الشحنات والعميلات.
          </p>
        </div>
        <div className="relative w-20 h-20 shrink-0">
          <img 
            alt="Mascot Hadoosha" 
            className="w-full h-full object-contain animate-float drop-shadow-md rounded-full border border-pink-50 bg-pink-50/50" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw0xKB-4XQGiCPqXbuGq8APMBdzW2M0L-ExpE11qomM_33WX4Zfa3VKeZt7ycefguOAsfq87QiTcQbNirpa65C1u6ZJkyPh5qSy5w8rFw-2f_VaP7vmXjslvUqo6qScQKbqMV8z3VK0_MD6CCR-T3efRZC_JorCRcBTiQJsHmEM4Wx30fA5botntSpYRXLuerNRHWaMjjQHXiUw467xTvDBl30QGA1v31JBe6wz7_7HyWWC3e3yu2oxKrfFZkb_DakDSTcVGfoBdo"
          />
        </div>
      </div>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onAddShipmentClick}
          className="bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 text-white p-4 rounded-2xl font-black text-xs transition-all flex flex-col items-center justify-center gap-2 shadow-md shadow-pink-500/10 cursor-pointer"
        >
          <PlusCircle className="w-6 h-6 text-white" />
          <span>إضافة شحنة جديدة</span>
        </button>
        <button 
          onClick={onAddInvoiceClick}
          className="bg-white border border-pink-100 text-pink-800 hover:bg-pink-50 p-4 rounded-2xl font-black text-xs transition-all flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Receipt className="w-6 h-6 text-pink-700" />
          <span>إصدار فاتورة جديدة</span>
        </button>
      </div>

      {/* Monthly Profit Summary Card */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-950 rounded-3xl p-6 text-white relative overflow-hidden border border-white/10 shadow-lg">
        <div className="absolute top-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="flex justify-between items-start mb-4 text-right" dir="rtl">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-pink-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-pink-300 font-bold uppercase tracking-wider">صافي الأرباح المقدرة (Profit)</p>
              <h3 className="text-2xl font-black mt-0.5 tracking-tight">{(completedSales).toLocaleString()} د.ع</h3>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-xl text-[9px] font-black">
            +12% نمو
          </span>
        </div>

        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-4">
          <div className="bg-pink-500 h-full" style={{ width: '78%' }}></div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold mt-2" dir="rtl">
          <span>الهدف الشهري: { (totalSales * 1.2 || 15000000).toLocaleString() } د.ع</span>
          <span className="text-pink-400">مكتمل بنسبة 78%</span>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Sales */}
        <div 
          onClick={() => onNavigateToTab('invoices')}
          className="bg-white/80 backdrop-blur-xl border border-pink-100 p-5 rounded-2xl flex flex-col justify-between h-28 cursor-pointer hover:border-pink-300 transition-all text-right"
          dir="rtl"
        >
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">إجمالي المبيعات (Sales)</p>
          <h4 className="text-base font-black text-gray-800 mt-1">{totalSales.toLocaleString()} <span className="text-[10px] font-bold text-gray-400">د.ع</span></h4>
          <div className="mt-2 text-emerald-600 text-[9px] font-black flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>نشاط فوري نشط</span>
          </div>
        </div>

        {/* Active Shipments */}
        <div 
          onClick={() => onNavigateToTab('shipments')}
          className="bg-white/80 backdrop-blur-xl border border-pink-100 p-5 rounded-2xl flex flex-col justify-between h-28 cursor-pointer hover:border-pink-300 transition-all text-right"
          dir="rtl"
        >
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">الشحنات الجارية (Cargo)</p>
          <h4 className="text-base font-black text-gray-800 mt-1">{activeShipmentsCount} <span className="text-[10px] font-bold text-gray-400">شحنات</span></h4>
          <div className="mt-2 text-pink-700 text-[9px] font-black flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
            <span>تتبع غوانزو - بغداد</span>
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div 
          onClick={() => onNavigateToTab('invoices')}
          className="bg-white/80 backdrop-blur-xl border border-pink-100 p-5 rounded-2xl flex flex-col justify-between h-28 cursor-pointer hover:border-pink-300 transition-all text-right col-span-2"
          dir="rtl"
        >
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">الفواتير غير المدفوعة قيد الانتظار</p>
          <h4 className="text-base font-black text-pink-800 mt-1">{pendingSales.toLocaleString()} <span className="text-[10px] font-bold text-gray-400">د.ع</span></h4>
          <div className="mt-2 text-amber-600 text-[9px] font-black flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>إجمالي {invoices.filter(i => i.status === 'Pending').length} فواتير بانتظار التحصيل</span>
          </div>
        </div>
      </div>

      {/* Mascot Insight Message */}
      <div className="bg-pink-50/50 rounded-2xl p-4 border border-dashed border-pink-200 flex gap-3 items-center text-right" dir="rtl">
        <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-white border border-pink-100 p-1">
          <img 
            alt="Mascot Batoot" 
            className="w-full h-full object-contain" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEF3gIGwkMnmZipW86lu9kNAcEk-Wy8CLgmshAKbbFVmLhs4s4i1ixkic4bg7ZXcMWhIx3H7aGimQ5jecP7grQQ2kZ56Iks9Xfj6yxYRISt0-TRmEhQE_QKeGwcL7o1R9pp4aJu1MylPcKU-_qN_nZfcDOCj7S3gElpHtVwYymIJdI3UkUjfdSe1_3x22vVPk5cqrQK7hrnaNbr3LXkEjn5cykPOr7Sd16W_PjfUWQxfBESaalayIDgB2GRXb2v7SJK3N16BKN0ok"
          />
        </div>
        <div>
          <h5 className="text-[11px] font-black text-pink-900">نصيحة ذكية من مساعدكِ بطوط 💡</h5>
          <p className="text-[10px] text-gray-500 font-semibold leading-relaxed mt-0.5">
            هل تعلمين؟ المتاجر التي تصدر فواتيرها فوراً في نفس اليوم لطرود العميلات تحقق سرعة تسليم وإرضاء للعملاء بنسبة 35% أعلى!
          </p>
        </div>
      </div>

      {/* Mini Quick Access Reports Navigation */}
      <div className="bg-white border border-pink-100 p-5 rounded-3xl space-y-4">
        <h4 className="font-black text-xs text-gray-800 text-right" dir="rtl">تقارير وأهداف هذا الشهر:</h4>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onNavigateToTab('profits')}
            className="p-3 bg-pink-50/30 hover:bg-pink-50 rounded-2xl flex flex-col items-center justify-center gap-1 border border-pink-100/40 text-center cursor-pointer"
          >
            <TrendingUp className="w-5 h-5 text-pink-700" />
            <span className="text-[10px] font-black text-gray-800">تقارير الأرباح</span>
            <span className="text-[8px] text-gray-400 font-bold">تحليل الأداء</span>
          </button>
          <button 
            onClick={() => onNavigateToTab('settings')}
            className="p-3 bg-pink-50/30 hover:bg-pink-50 rounded-2xl flex flex-col items-center justify-center gap-1 border border-pink-100/40 text-center cursor-pointer"
          >
            <Activity className="w-5 h-5 text-pink-700" />
            <span className="text-[10px] font-black text-gray-800">إعدادات التطبيق</span>
            <span className="text-[8px] text-gray-400 font-bold">تحديث الماركات</span>
          </button>
        </div>
      </div>

    </div>
  );
}
