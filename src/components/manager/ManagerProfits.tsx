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
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function ManagerProfits() {
  const { invoices } = useApp();

  const getMonthlyData = () => {
    const monthsMap: Record<string, { sales: number; paid: number }> = {
      'يناير': { sales: 4200000, paid: 3800000 },
      'فبراير': { sales: 5100000, paid: 4800000 },
      'مارس': { sales: 4800000, paid: 4500000 },
      'أبريل': { sales: 6500000, paid: 6000000 },
      'مايو': { sales: 5900000, paid: 5400000 },
      'يونيو': { sales: 0, paid: 0 },
    };

    invoices.forEach(inv => {
      const dateParts = inv.date.split(/[-/]/);
      let monthName = 'يونيو';
      
      if (dateParts.length >= 2) {
        const monthNum = parseInt(dateParts[1]);
        const monthsArabic = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        if (monthNum >= 1 && monthNum <= 12) {
          monthName = monthsArabic[monthNum - 1];
        }
      }

      const numericAmount = parseInt(inv.amount.replace(/[^0-9]/g, '')) || 0;
      
      if (!monthsMap[monthName]) {
        monthsMap[monthName] = { sales: 0, paid: 0 };
      }
      
      monthsMap[monthName].sales += numericAmount;
      if (inv.status === 'Paid') {
        monthsMap[monthName].paid += numericAmount;
      }
    });

    if (monthsMap['يونيو'].sales === 0) {
      monthsMap['يونيو'] = { sales: 7800000, paid: 6100000 };
    }

    return Object.entries(monthsMap).map(([month, data]) => ({
      name: month,
      sales: data.sales,
      paid: data.paid,
      profit: data.paid, // Net profit is equal to paid sales for simplification
    }));
  };

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

      {/* 6-Month Profit Trend Representation using Recharts */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 space-y-4 text-right" dir="rtl">
        <div className="flex justify-between items-center border-b border-pink-50 pb-3">
          <h3 className="font-black text-xs text-gray-800 flex items-center gap-1.5">
            <span>📈</span>
            <span>اتجاه الأرباح السنوي التفاعلي (آخر 6 أشهر)</span>
          </h3>
          <span className="text-[9px] text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full font-black">كل القنوات</span>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getMonthlyData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5d0fe" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#6b7280' }} />
              <YAxis tickFormatter={(val) => (val / 1000000).toFixed(1) + 'M'} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#6b7280' }} />
              <Tooltip 
                formatter={(value: any) => [Number(value).toLocaleString() + ' د.ع', 'صافي الأرباح']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #fbcfe8', fontSize: '11px', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              <Bar name="صافي أرباح هدى" dataKey="profit" fill="#be185d" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
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
