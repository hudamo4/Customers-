import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, CheckCircle, Clock, ShoppingBag, Eye, Search, Sparkles, Check, Truck, FileDown, CreditCard, Lock, ShieldCheck, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Invoice } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function InvoiceView() {
  const { profile, invoices, payInvoice } = useApp();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [exportingAll, setExportingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Pending'>('All');

  // Mastercard Payment States
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [cardNumber, setCardNumber] = useState<string>(() => {
    return localStorage.getItem('iramo_saved_card_number') || '5412 7500 1234 5678';
  });
  const [cardHolder, setCardHolder] = useState<string>(() => {
    return localStorage.getItem('iramo_saved_card_holder') || profile?.name || 'Huda Al-Sultani';
  });
  const [expiry, setExpiry] = useState<string>(() => {
    return localStorage.getItem('iramo_saved_expiry') || '12/28';
  });
  const [cvv, setCvv] = useState<string>('345');
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [paySuccess, setPaySuccess] = useState<boolean>(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
  };

  const handleSimulatedPay = async () => {
    if (!selectedInvoice) return;
    setIsPaying(true);
    
    // Simulate transaction delay
    setTimeout(async () => {
      await payInvoice(selectedInvoice.invoiceId);
      setIsPaying(false);
      setPaySuccess(true);
    }, 2500);
  };

  const getShippingStatusStyle = (status?: string) => {
    if (!status) return { text: 'قيد المعالجة', color: 'bg-gray-50 text-gray-500 border-gray-100' };
    
    if (status.includes('مطار') || status.includes('بغداد')) {
      return {
        text: status,
        color: 'bg-teal-50 text-teal-700 border-teal-100/60'
      };
    }
    if (status.includes('المستودع') || status.includes('المعالجة')) {
      return {
        text: status,
        color: 'bg-amber-50 text-amber-700 border-amber-100/60'
      };
    }
    if (status.includes('التوصيل') || status.includes('شركة')) {
      return {
        text: status,
        color: 'bg-indigo-50 text-indigo-700 border-indigo-100/60'
      };
    }
    if (status.includes('التسليم') || status.includes('للزبون')) {
      return {
        text: status,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-100/60'
      };
    }
    
    return {
      text: status,
      color: 'bg-pink-50 text-pink-700 border-pink-100/60'
    };
  };

  const handleDownload = (invoice: Invoice) => {
    setDownloadingId(invoice.invoiceId);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      });

      // Decorative Header Bar
      doc.setFillColor(244, 63, 94); // Rose 500
      doc.rect(0, 0, 148, 12, 'F');

      // Branding Section
      doc.setTextColor(190, 24, 74); // Rose 800
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('HADOOSHA DELIVERIES', 15, 25);
      
      doc.setTextColor(112, 26, 117); // Fuchsia 900
      doc.setFontSize(8);
      doc.text('Premium Iraqi Logistics & Shopping Assistant', 15, 30);

      doc.setTextColor(71, 85, 105); // Slate 600
      doc.setFontSize(9);
      doc.text('Date: ' + invoice.date, 110, 25);
      doc.text('Invoice: #' + invoice.invoiceId, 110, 30);

      // Divider Line
      doc.setDrawColor(243, 232, 255); // Purple 100
      doc.setLineWidth(0.4);
      doc.line(10, 36, 138, 36);

      // Customer Info Section
      doc.setFillColor(255, 241, 242); // Rose 50
      doc.roundedRect(10, 42, 128, 22, 3, 3, 'F');
      
      doc.setTextColor(157, 23, 77); // Pink 800
      doc.setFontSize(10);
      doc.text('CUSTOMER INFO / معلومات الزبون', 15, 48);

      doc.setTextColor(51, 65, 85); // Slate 700
      doc.setFontSize(9);
      doc.text(`Name / الاسم: ${profile?.name || 'Aniga'}`, 15, 54);
      doc.text(`Phone / الهاتف: ${profile?.phone || 'N/A'}`, 15, 59);
      doc.text(`City / المحافظة: ${profile?.city || 'Iraq'}`, 75, 54);
      doc.text(`Membership: ${profile?.membership || 'Golden Member'}`, 75, 59);

      // Billing Details Table
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(10, 72, 128, 8, 'F');

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text('ITEM / STORE', 15, 77);
      doc.text('ORDER ID', 55, 77);
      doc.text('PRICE', 90, 77);
      doc.text('PAYMENT', 115, 77);

      // Table line divider
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(10, 80, 138, 80);

      // Data Row
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(invoice.store, 15, 87);
      doc.text('#' + invoice.order_id, 55, 87);
      doc.text(invoice.amount, 90, 87);
      doc.text(invoice.status === 'Paid' ? 'PAID / مدفوع' : 'PENDING', 115, 87);

      // Shipping Status Section
      doc.setFillColor(240, 253, 250); // Teal 50
      doc.roundedRect(10, 96, 128, 16, 2, 2, 'F');
      doc.setDrawColor(204, 251, 241); // Teal 100
      doc.roundedRect(10, 96, 128, 16, 2, 2, 'D');

      doc.setFontSize(9);
      doc.setTextColor(13, 148, 136); // Teal 600
      doc.text('SHIPPING STATUS / حالة الشحن', 15, 102);
      
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      
      const shipAr = invoice.shippingStatus || 'قيد المعالجة';
      const shipEnMap: Record<string, string> = {
        'وصلت مطار بغداد': 'Arrived Baghdad Airport (وصلت مطار بغداد)',
        'قيد المعالجة في المستودع': 'Processing in Warehouse (قيد المعالجة في المستودع)',
        'تم التسليم لشركة التوصيل': 'Handed over to Delivery (تم التسليم للتوصيل)',
        'تم التسليم للزبون': 'Delivered to Customer (تم التسليم للزبون)'
      };
      const statusText = shipEnMap[shipAr] || `Processing (${shipAr})`;
      doc.text(statusText, 15, 108);

      // Verification stamp/Seal representation
      doc.setDrawColor(244, 63, 94);
      doc.setLineWidth(0.5);
      doc.ellipse(118, 118, 14, 10, 'D');
      doc.setFontSize(7);
      doc.setTextColor(244, 63, 94);
      doc.text('HADOOSHA', 118, 117, { align: 'center' });
      doc.text('VERIFIED', 118, 121, { align: 'center' });

      // Footer Thank you
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text('Thank you for trusting Hadoosha! شكراً لتسوقكِ معنا 💖', 74, 138, { align: 'center' });

      doc.save(`Hadoosha_Invoice_${invoice.invoiceId}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const exportAllInvoices = () => {
    setExportingAll(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header Banner
      doc.setFillColor(244, 63, 94); // Rose 500
      doc.rect(0, 0, 210, 16, 'F');

      // Title
      doc.setTextColor(190, 24, 74); // Rose 800
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('HADOOSHA DELIVERIES STATEMENT', 15, 30);

      doc.setTextColor(112, 26, 117); // Fuchsia 900
      doc.setFontSize(9);
      doc.text('Complete Statement of Local Purchases and Shipping Invoices', 15, 36);

      // Customer metadata
      doc.setFillColor(255, 241, 242); // Rose 50
      doc.roundedRect(15, 42, 180, 20, 3, 3, 'F');
      
      doc.setTextColor(157, 23, 77); // Pink 800
      doc.setFontSize(10);
      doc.text('ACCOUNT OWNER / معلومات الحساب', 20, 48);

      doc.setTextColor(51, 65, 85); // Slate 700
      doc.setFontSize(9);
      doc.text(`Name / الاسم: ${profile?.name || 'Aniga'}`, 20, 54);
      doc.text(`Phone: ${profile?.phone || 'N/A'}`, 80, 54);
      doc.text(`City: ${profile?.city || 'Iraq'}`, 140, 54);

      // Table Header
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(15, 70, 180, 10, 'F');
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(15, 80, 195, 80);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text('INVOICE ID', 18, 76);
      doc.text('STORE / ITEM', 45, 76);
      doc.text('ORDER ID', 80, 76);
      doc.text('DATE', 115, 76);
      doc.text('AMOUNT', 145, 76);
      doc.text('STATUS', 172, 76);

      // Rows
      let y = 87;
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42); // Slate 900

      const shipEnMap: Record<string, string> = {
        'وصلت مطار بغداد': 'Baghdad Airport (بغداد)',
        'قيد المعالجة في المستودع': 'In Warehouse (المستودع)',
        'تم التسليم لشركة التوصيل': 'Out for Delivery (التوصيل)',
        'تم التسليم للزبون': 'Delivered (تم التسليم)'
      };

      filteredInvoices.forEach((inv) => {
        // Draw dotted helper lines between rows
        doc.setDrawColor(241, 245, 249);
        doc.line(15, y + 2, 195, y + 2);

        doc.text(inv.invoiceId, 18, y);
        doc.text(inv.store, 45, y);
        doc.text(inv.order_id, 80, y);
        doc.text(inv.date, 115, y);
        doc.text(inv.amount, 145, y);
        
        const payStatusText = inv.status === 'Paid' ? 'PAID' : 'PENDING';
        doc.text(payStatusText, 172, y);

        // Under-row description for shipping status
        doc.setFontSize(7.5);
        doc.setTextColor(115, 115, 115); // Neutral 500
        const shipText = inv.shippingStatus ? shipEnMap[inv.shippingStatus] || inv.shippingStatus : 'Processing';
        doc.text(`↳ Shipping Status: ${shipText}`, 45, y + 4);

        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        y += 12;
      });

      // Footer
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text(`Generated on ${new Date().toLocaleDateString('ar-IQ')} • Powered by Hadoosha App`, 105, 280, { align: 'center' });

      doc.save(`Hadoosha_Statement_${profile?.name || 'Local'}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setExportingAll(false);
    }
  };

  // Helper to parse currency string (e.g. "125,000 د.ع") to number
  const parseAmount = (amtStr: string): number => {
    const cleaned = amtStr.replace(/[^\d]/g, ''); // Keep only digits
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const getMonthlyStats = () => {
    const monthsMap: Record<string, number> = {};
    const arabicMonths: Record<string, string> = {
      '01': 'كانون الثاني',
      '02': 'شباط',
      '03': 'آذار',
      '04': 'نيسان',
      '05': 'أيار',
      '06': 'حزيران',
      '07': 'تموز',
      '08': 'آب',
      '09': 'أيلول',
      '10': 'تشرين الأول',
      '11': 'تشرين الثاني',
      '12': 'كانون الأول'
    };

    invoices.forEach((inv) => {
      if (inv.status === 'Paid') {
        const parts = inv.date.split('-');
        if (parts.length >= 2) {
          const year = parts[0];
          const monthNum = parts[1];
          const monthName = arabicMonths[monthNum] || monthNum;
          const label = `${monthName} ${year}`;
          const val = parseAmount(inv.amount);
          monthsMap[label] = (monthsMap[label] || 0) + val;
        }
      }
    });

    return Object.entries(monthsMap).map(([month, total]) => ({
      month,
      total,
      displayTotal: `${total.toLocaleString()} د.ع`
    }));
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.order_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'All' || inv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="invoice-view">
      {/* Welcoming Character Header */}
      <div className="bg-white/95 border border-pink-100 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex-1 space-y-1">
          <h2 className="text-xl font-bold text-pink-700">أهلاً بكِ، {profile?.name || 'يا أنيقة'}!</h2>
          <p className="text-gray-500 text-xs leading-relaxed">
            هنا تجدين سجلاً كاملاً وحقيقياً لمشترياتكِ وحالة الفواتير والمدفوعات الخاصة بكِ.
          </p>
        </div>
        <div className="relative w-24 h-24 shrink-0">
          <div className="absolute inset-0 bg-pink-100/30 rounded-full blur-2xl"></div>
          <img
            alt="Hadoosha"
            className="w-full h-full object-contain relative z-10 drop-shadow"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDozyQcrL4Yfp5wLXW9Y-K0AeiCtSO2G3lZVMIyffDaIoEBlb_otr_uLGq-Drr0G6N0FS5d6-u6YBfHWJzesjiFbJdWnD15Ct9IDSO08EczvwkYAWgQgEP3d-v91GCN7bOyvBP_FftRv6BChSeEzC7BDbSMtH3DXgL1bbvle6xHA957rBT170X9F2Itu0sPNmwKRqwqkDVOI_Pw-dG5myf2pu5mCFrs-IUMx_XlMi2OYl5IjfQgqquSxEAaElda7W5e1ZN5LhTYUFQ"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحثي عن متجر أو رقم الفاتورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-11 py-3 bg-white/95 border border-pink-100 rounded-2xl text-xs focus:outline-none focus:border-pink-500 shadow-sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {['All', 'Paid', 'Pending'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === status
                    ? 'bg-pink-700 text-white shadow-sm'
                    : 'bg-white border border-pink-100/50 text-gray-500 hover:bg-pink-50/40'
                }`}
              >
                {status === 'All' ? 'الكل' : status === 'Paid' ? 'مدفوعة' : 'قيد الانتظار'}
              </button>
            ))}
          </div>

          <button
            onClick={exportAllInvoices}
            disabled={exportingAll || filteredInvoices.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-black shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none self-end sm:self-auto cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>تصدير كشف الفواتير (PDF)</span>
          </button>
        </div>
      </div>

      {/* Monthly Shipping Payments Chart */}
      <div className="bg-white/95 border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-right" dir="rtl">
            <h3 className="font-bold text-sm text-gray-800">تحليل المصاريف الشهرية</h3>
            <p className="text-[10px] text-gray-400 font-bold">إجمالي مبالغ الشحن المدفوعة لكل شهر</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="h-[200px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getMonthlyStats()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#be184d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ff" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000).toLocaleString()}k`}
              />
              <Tooltip 
                cursor={{ fill: '#fdf2f8', opacity: 0.5 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white/95 border border-pink-100 p-3 rounded-2xl shadow-xl text-right text-xs space-y-1" dir="rtl">
                        <p className="font-bold text-gray-800">{data.month}</p>
                        <p className="font-black text-pink-700">المدفوع: {data.displayTotal}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total" fill="url(#colorTotal)" radius={[8, 8, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.map((inv) => (
          <div
            key={inv.id}
            className="bg-white/95 rounded-3xl p-5 border border-pink-100/50 relative overflow-hidden flex flex-col gap-4 shadow-sm group hover:border-pink-200 transition-all"
          >
            {/* Left Accent Status Strip */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                inv.status === 'Paid' ? 'bg-green-400/80' : 'bg-amber-400/80'
              }`}
            ></div>

            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-gray-800 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-pink-700" />
                  {inv.store}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  رقم الطلب: {inv.order_id}
                </p>
                {inv.shippingStatus && (
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-bold">حالة الشحن:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black border flex items-center gap-1 shadow-sm/5 ${
                        getShippingStatusStyle(inv.shippingStatus).color
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5 text-current shrink-0" />
                      {getShippingStatusStyle(inv.shippingStatus).text}
                    </span>
                  </div>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight flex items-center gap-1 ${
                  inv.status === 'Paid'
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}
              >
                {inv.status === 'Paid' ? (
                  <>
                    <CheckCircle className="w-3 h-3" /> تم الدفع
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 animate-pulse" /> قيد الانتظار
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400">
                  تاريخ الطلب: <span className="font-bold text-gray-700">{inv.date}</span>
                </p>
                <p className="text-xl font-black text-pink-700 tracking-tight">{inv.amount}</p>
              </div>

              <div className="flex items-center gap-2">
                {inv.status === 'Pending' && (
                  <button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setShowPaymentModal(true);
                      setPaySuccess(false);
                      setIsPaying(false);
                      // Set default or saved card details
                      setCardNumber(localStorage.getItem('iramo_saved_card_number') || '5412 7500 1234 5678');
                      setCardHolder(localStorage.getItem('iramo_saved_card_holder') || profile?.name || 'Huda Al-Sultani');
                      setExpiry(localStorage.getItem('iramo_saved_expiry') || '12/28');
                      setCvv('345');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[11px] font-black bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 text-white shadow-md shadow-pink-500/10 active:scale-95 transition-all border border-transparent cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>تسديد ماستركارد</span>
                  </button>
                )}

                <button
                  onClick={() => handleDownload(inv)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[11px] font-bold transition-all shadow-sm active:scale-95 border cursor-pointer ${
                    downloadingId === inv.invoiceId
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-pink-50 hover:bg-pink-700 hover:text-white text-pink-700 border-pink-100'
                  }`}
                >
                  {downloadingId === inv.invoiceId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم التحميل!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <span className="material-symbols-outlined text-4xl">search_off</span>
            <p className="text-xs">لم نجد أي فواتير تطابق بحثكِ.</p>
          </div>
        )}
      </div>

      {/* Mastercard Interactive Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl relative overflow-y-auto max-h-[92vh] space-y-6 border border-pink-100/50 text-right flex flex-col" dir="rtl">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-pink-100/30">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink-700">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-800">بوابة الدفع المعتمدة</h3>
                  <p className="text-[10px] text-gray-400 font-bold">تسديد فوري عبر حساب الإدارة الموحد</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-400 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!paySuccess ? (
              <>
                {/* Invoice Summary */}
                <div className="bg-pink-50/40 border border-pink-100/30 p-4 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">متجر الطلب</p>
                    <p className="font-extrabold text-gray-800">{selectedInvoice.store} (#{selectedInvoice.order_id})</p>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-bold">المبلغ المطلوب</p>
                    <p className="font-black text-pink-700 text-sm">{selectedInvoice.amount}</p>
                  </div>
                </div>

                {/* Gorgeous Interactive Virtual Credit Card (Read Only Manager Card) */}
                <div className="relative w-full aspect-[1.586/1] rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-950 p-6 text-white shadow-xl overflow-hidden border border-white/10 select-none transition-all">
                  <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-pink-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute top-4 left-4 flex items-center gap-1.5">
                    <div className="flex -space-x-2.5">
                      <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                      <div className="w-6 h-6 bg-amber-500 rounded-full mix-blend-screen"></div>
                    </div>
                  </div>
                  
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="text-right">
                        <span className="text-[9px] tracking-wider uppercase text-pink-300 font-bold block">إيرامو الممتازة - بطاقة الإدارة</span>
                        <div className="w-7 h-5 bg-amber-200/20 rounded-md border border-amber-200/30 flex items-center justify-center mt-1">
                          <div className="grid grid-cols-2 gap-0.5 w-3.5 h-2.5">
                            <div className="border border-white/20 rounded-sm"></div>
                            <div className="border border-white/20 rounded-sm"></div>
                            <div className="border border-white/20 rounded-sm"></div>
                            <div className="border border-white/20 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-black tracking-widest bg-white/10 px-2 py-0.5 rounded text-white/80">Mastercard</span>
                    </div>

                    {/* Card Number Container */}
                    <div className="my-2 text-center tracking-[0.16em] font-mono text-base md:text-lg font-bold text-white drop-shadow-md">
                      5412 7500 1234 5678
                    </div>

                    <div className="flex justify-between items-end font-mono">
                      <div className="text-right space-y-0.5 max-w-[70%]">
                        <span className="text-[7px] text-white/40 block">Card Holder / اسم المديرة</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider truncate block text-white/90">HUDA AL-SULTANI</span>
                      </div>
                      <div className="text-left space-y-0.5">
                        <span className="text-[7px] text-white/40 block">Expires / انتهاء</span>
                        <span className="text-[10px] font-bold tracking-wider text-white/90">12/28</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-100/30 text-[11px] text-pink-950 leading-relaxed font-semibold">
                  <p className="font-extrabold text-xs mb-1">ℹ️ بوابة الدفع الرسمية الموحدة</p>
                  يتم تمرير هذا الدفع مباشرة وتلقائياً عبر بطاقة الماستركارد الرسمية المعتمدة لمديرة إيرامو هدى السلطاني، دون الحاجة لإدخال بيانات بطاقتكِ الشخصية لضمان أمان تام.
                </div>

                {/* Trust Seal */}
                <div className="flex justify-center items-center gap-1.5 text-gray-400 text-[10px] font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>معالجة الدفع مشفرة بالكامل وآمنة بنسبة 100%</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    disabled={isPaying}
                    onClick={handleSimulatedPay}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white font-black rounded-2xl text-xs transition-all active:scale-95 shadow-md shadow-pink-500/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPaying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>جاري التحقق والدفع...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>تأكيد ودفع {selectedInvoice.amount}</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    disabled={isPaying}
                    className="px-4 py-3 border border-gray-200 hover:bg-gray-50 text-gray-500 font-extrabold rounded-2xl text-xs transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </>
            ) : (
              /* Success View */
              <div className="text-center py-8 space-y-6 animate-fade-in flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-lg border border-emerald-100 animate-scale-up">
                  <CheckCircle className="w-12 h-12 stroke-[2.5]" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-black text-lg text-emerald-800">تمت العملية بنجاح!</h4>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                    تم دفع مبلغ الفاتورة <span className="font-black text-gray-800">{selectedInvoice.amount}</span> بنجاح باستخدام بطاقة الماستركارد المعتمدة للمديرة.
                  </p>
                </div>

                {/* Point Reward feedback badge */}
                <div className="bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-100/50 p-4 rounded-3xl inline-flex flex-col items-center gap-1">
                  <span className="text-[10px] text-amber-700 font-black uppercase tracking-wider">نقاط ولاء إضافية</span>
                  <span className="text-xl font-black text-pink-700">+150 نقطة ولاء 🥳</span>
                  <span className="text-[9px] text-gray-400 font-bold">تم إضافتها إلى رصيدكِ فوراً لتصل المكافأة التالية أسرع!</span>
                </div>

                <div className="w-full pt-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full py-3 bg-gray-900 hover:bg-black text-white font-black rounded-2xl text-xs transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    العودة لصفحة الفواتير
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
