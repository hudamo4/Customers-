import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Copy, MapPin, Plane, GitMerge, Box, ShoppingBag, Share2, Compass, MessageCircle, Info, CheckCircle, Package, Calculator, Plus, Minus, Scale, Search, Trash2, AlertTriangle, Wifi, WifiOff, Database } from 'lucide-react';

export default function TrackingView() {
  const { shipments, selectedShipmentId, setSelectedShipmentId, deleteShipment } = useApp();
  const [copied, setCopied] = useState<boolean>(false);
  const [supportMessage, setSupportMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Network offline/online status tracking
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Filter shipments by searchQuery
  const filteredShipments = shipments.filter(s => 
    s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.origin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find selected shipment, or fallback to first filtered, or null
  const activeShipment = filteredShipments.find(s => s.id === selectedShipmentId) || filteredShipments[0] || null;

  const CALCULATOR_STORES = [
    { name: 'Shein الامارات', rate: 12000 },
    { name: 'Shein الكويت', rate: 5000 },
    { name: 'Aliexpress', rate: 12500 },
    { name: 'Temu', rate: 13000 },
    { name: 'Taobao', rate: 16500 },
    { name: '1688', rate: 16500 },
    { name: 'Iherb', rate: 15000 },
    { name: 'سيفورا', rate: 16000 },
    { name: 'بوتيكات', rate: 13500 },
    { name: 'تريندول تركيا والكويت', rate: 11000 },
    { name: 'Yesstyle', rate: 15500 },
    { name: 'K-secret', rate: 15500 }
  ];

  const [calcStore, setCalcStore] = useState<string>(CALCULATOR_STORES[0].name);
  const [calcWeight, setCalcWeight] = useState<number>(1.0);

  // Sync state with selected shipment
  React.useEffect(() => {
    if (activeShipment) {
      const match = activeShipment.weight.match(/[\d.]+/);
      const parsed = match ? parseFloat(match[0]) : 1.0;
      setCalcWeight(parsed);
      
      const foundStore = CALCULATOR_STORES.find(s => 
        activeShipment.origin.toLowerCase().includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(activeShipment.origin.toLowerCase())
      );
      if (foundStore) {
        setCalcStore(foundStore.name);
      }
    }
  }, [activeShipment]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSupportClick = () => {
    setSupportMessage("شات الدعم المباشر متصل الآن مع هدوشة وبطوط! تم إرسال رقم تتبع الشحنة لوكيل الدعم وسيتواصل معك خلال دقيقة عبر الهاتف 💖");
    setTimeout(() => setSupportMessage(null), 8000);
  };

  // Icon mapper helper
  const getIcon = (iconName: string, active: boolean) => {
    const cls = `w-5 h-5 ${active ? 'text-white' : 'text-pink-700'}`;
    switch (iconName) {
      case 'MapPin':
        return <MapPin className={cls} />;
      case 'Plane':
      case 'flight_takeoff':
        return <Plane className={cls} />;
      case 'GitMerge':
      case 'hub':
        return <GitMerge className={cls} />;
      case 'Box':
      case 'inventory_2':
        return <Box className={cls} />;
      case 'ShoppingBag':
      case 'shopping_bag':
        return <ShoppingBag className={cls} />;
      default:
        return <Package className={cls} />;
    }
  };

  if (!activeShipment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-700">
          <Box className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg text-gray-800">لا توجد شحنات مسجلة</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          سيتم إدراج شحناتك تلقائياً هنا بمجرد وصول طلبات جديدة من المتاجر المدعومة.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="tracking-view">
      
      {/* Offline Caching Banner / LocalStorage Info */}
      <div className={`p-4 rounded-3xl border transition-all text-right flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isOnline 
          ? 'bg-emerald-50/40 border-emerald-100 text-emerald-800' 
          : 'bg-amber-50/80 border-amber-200 text-amber-900 animate-pulse'
      }`} dir="rtl">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
            isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-xs font-black">
              {isOnline ? 'متصل بالإنترنت (تزامن فوري ونشط)' : 'أنتِ أوفلاين (وضع عدم الاتصال)'}
            </h4>
            <p className="text-[10px] text-gray-500 font-bold leading-normal mt-0.5">
              {isOnline 
                ? 'تم حفظ وتحديث حالة شحناتكِ تلقائياً في الذاكرة المحلية (LocalStorage) لتصفحها دون إنترنت.' 
                : 'يتم الآن عرض آخر حالة تم تحديثها لشحناتكِ المحفوظة في الذاكرة المحلية حتى يعود الاتصال.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black shrink-0 self-end sm:self-center">
          <Database className="w-3.5 h-3.5 text-pink-700" />
          <span className="text-pink-800 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">آمن ومحفوظ</span>
        </div>
      </div>

      {/* Search Bar & Shipment Selector */}
      <div className="bg-white/95 backdrop-blur-xl border border-pink-100 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="البحث برقم التتبع أو اسم المتجر (مثال: Shein)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-pink-50/20 text-gray-700 placeholder-gray-400 font-bold text-xs pr-10 pl-4 py-3.5 rounded-2xl border border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-right"
            dir="rtl"
          />
          <Search className="w-4 h-4 text-pink-400 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>

        {filteredShipments.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filteredShipments.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedShipmentId(s.id || null)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeShipment?.id === s.id
                    ? 'bg-gradient-to-r from-pink-700 to-pink-500 text-white shadow-md shadow-pink-500/20'
                    : 'bg-white border border-pink-100/40 text-gray-600 hover:bg-pink-50/80'
                }`}
              >
                طرد {s.trackingNumber} ({s.origin.split(' ')[0]})
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-bold text-center py-2">لا توجد نتائج تطابق بحثكِ.</p>
        )}
      </div>

      {/* Hero Tracking Summary */}
      <section className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="bg-pink-100 text-pink-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm inline-block">
              {activeShipment.status}
            </span>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              {activeShipment.trackingNumber}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(activeShipment.trackingNumber)}
                className="inline-flex items-center gap-1.5 text-pink-700 hover:bg-pink-50 px-3 py-1.5 rounded-xl transition-colors text-xs font-bold border border-pink-100/50"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'تم النسخ!' : 'نسخ رقم التتبع'}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 text-xs sm:text-sm">
              <p className="text-gray-500">
                موعد التسليم المقدر: <span className="font-bold text-pink-700">{activeShipment.estimatedDelivery}</span>
              </p>
              {activeShipment.expectedArrivalDate && (
                <p className="text-gray-500 sm:border-r sm:border-pink-200 sm:pr-4 flex items-center gap-1.5">
                  تاريخ الوصول المتوقع: <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">{activeShipment.expectedArrivalDate}</span>
                </p>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-3">
            <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/30">
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-xs font-bold text-gray-400">نوع الشحن</span>
                <span className="font-bold text-pink-700 text-xs">{activeShipment.service}</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">
                شحن جوي سريع: 16,500 د.ع/كغم • شحن بحري مميز: يبدأ من 1 د.ع/كغم
              </p>
            </div>
            <button
              onClick={() => handleCopy(`${window.location.origin}/tracking?id=${activeShipment.trackingNumber}`)}
              className="bg-gradient-to-r from-pink-700 to-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-pink-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Share2 className="w-4 h-4" />
              مشاركة رابط التتبع
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-rose-50 text-rose-700 border border-rose-100/60 hover:bg-rose-100/80 px-6 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              حذف الشحنة
            </button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-pink-100/30 rounded-full blur-3xl"></div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-700">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">رحلة الشحنة بالتفصيل</h3>
            </div>

            <div className="relative">
              {/* Vertical line connecting steps */}
              <div className="absolute right-[15px] top-4 bottom-4 w-[2px] bg-pink-100"></div>

              {/* Steps list */}
              <div className="space-y-8">
                {activeShipment.journey?.map((step, idx) => (
                  <div key={idx} className="relative pr-10 flex gap-4">
                    {/* Step bubble icon */}
                    <div
                      className={`absolute right-0 top-0.5 w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-sm transition-all ${
                        step.active
                          ? 'bg-pink-700 ring-4 ring-pink-100'
                          : 'bg-pink-100'
                      }`}
                    >
                      {getIcon(step.icon, step.active)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <h4
                        className={`text-sm ${
                          step.active ? 'text-pink-700 font-bold' : 'text-gray-800 font-semibold'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-gray-500 text-xs leading-relaxed">{step.description}</p>
                      <span className="inline-block bg-gray-50 text-[10px] text-gray-400 font-bold px-2 py-0.5 rounded-md mt-1">
                        {step.time} • {step.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Map Mascot Mockup */}
          <div className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-3xl overflow-hidden p-6 relative flex flex-col md:flex-row items-center gap-6 shadow-sm">
            <div className="relative w-28 h-28 shrink-0">
              <div className="absolute inset-0 bg-pink-50 rounded-full blur-2xl"></div>
              <img
                alt="Batoot Mascot"
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg ring-8 ring-pink-50/50 float-animation"
                src="https://lh3.googleusercontent.com/aida/AP1WRLtwlTtxpvh7CFWTWdRY_emR2xyBvTgx8v6zMnJSM8OrvnGrHK98fOcbdnwqMhudLD35tXhQRA9VBIsbRPIQxBCWcjiseBr_ZThUYOO2bASORtpBXsEwGUlke9kqXDQGVw-0hzUjOQZGvkAbigP02pHzK4tU63vK7UVYFj3MEl6UjVilDvrlHzDZhs-o55NTjiE4kAtBK7MfYbaxsU0axIHNlMxqsY-z3Mq4P6X0iHTAI-TEqMLAdFD53L8"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 bg-pink-700 text-white p-2 rounded-xl shadow-md">
                <Compass className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2 flex-1 text-center md:text-right">
              <div className="bg-pink-50 border border-pink-100/50 px-4 py-2 rounded-2xl shadow-sm inline-block">
                <p className="text-xs text-pink-800 font-black">🤖 بطوط المساعد الذكي يراقب طردكِ!</p>
              </div>
              <h4 className="font-extrabold text-sm text-gray-800">موقع الشحنة الحالي:</h4>
              <p className="text-xs text-pink-700 font-bold">{activeShipment.currentLocation}</p>
              <p className="text-[11px] text-gray-500 italic">"أتابع تحركاتها عبر الخط الجوي لحظة بلحظة لضمان وصولها الفاخر والأنيق إليكِ!"</p>
            </div>
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Package Details Bento Card */}
          <div className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-3xl p-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-pink-100/30 pb-4">
              تفاصيل الطرد الفنية
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-pink-50/50">
                <span className="text-gray-500 text-xs font-medium">الوزن الفعلي</span>
                <span className="text-gray-800 text-xs font-extrabold bg-pink-50 px-2.5 py-1 rounded-lg">
                  {activeShipment.weight}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-pink-50/50">
                <span className="text-gray-500 text-xs font-medium">عدد القطع</span>
                <span className="text-gray-800 text-xs font-extrabold bg-pink-50 px-2.5 py-1 rounded-lg">
                  {activeShipment.items}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-pink-50/50">
                <span className="text-gray-500 text-xs font-medium">نوع الخدمة</span>
                <span className="text-gray-800 text-xs font-extrabold bg-pink-50 px-2.5 py-1 rounded-lg text-pink-800">
                  {activeShipment.service}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-pink-50/50">
                <span className="text-gray-500 text-xs font-medium">مصدر الشحنة</span>
                <span className="text-pink-700 text-xs font-extrabold">
                  {activeShipment.origin}
                </span>
              </div>
              {activeShipment.expectedArrivalDate && (
                <div className="flex justify-between items-center py-2 bg-emerald-50/40 px-2 rounded-xl border border-emerald-100/30">
                  <span className="text-emerald-800 text-xs font-bold">وصول متوقع</span>
                  <span className="text-emerald-900 text-xs font-black">
                    {activeShipment.expectedArrivalDate}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Cost Calculator Card */}
          <div className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-pink-100/30 pb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-700 shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-800">حاسبة تكلفة الشحن التقديرية</h4>
                <p className="text-[10px] text-gray-400 font-bold">احسبي تكلفة شحنتكِ بسهولة وسرعة 💖</p>
              </div>
            </div>

            <div className="space-y-4 text-right">
              {/* Select Store */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-wider">
                  الموقع أو المتجر المختار
                </label>
                <select
                  value={calcStore}
                  onChange={(e) => setCalcStore(e.target.value)}
                  className="w-full px-3 py-2 bg-pink-50/20 border border-pink-100/50 rounded-2xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200"
                >
                  {CALCULATOR_STORES.map((s, idx) => (
                    <option key={idx} value={s.name}>
                      {s.name} ({s.rate.toLocaleString()} د.ع/كغم)
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight Input */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-wider">
                  الوزن التقديري (كجم)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCalcWeight(prev => Math.max(0.1, parseFloat((prev - 0.1).toFixed(2))))}
                    className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-700 hover:bg-pink-100 transition-colors shrink-0"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Math.max(0.1, parseFloat(parseFloat(e.target.value).toFixed(2)) || 0.1))}
                    className="flex-1 px-3 py-2 bg-pink-50/20 border border-pink-100/50 rounded-2xl text-center text-xs font-extrabold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right"
                  />
                  <button
                    onClick={() => setCalcWeight(prev => parseFloat((prev + 0.1).toFixed(2)))}
                    className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-700 hover:bg-pink-100 transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calculation Result */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-100/30 rounded-2xl p-4 space-y-2 mt-2">
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                  <span>سعر الكيلو للموقع:</span>
                  <span className="text-pink-800 font-extrabold">
                    {(() => {
                      const found = CALCULATOR_STORES.find(s => s.name === calcStore);
                      return found ? found.rate.toLocaleString() : '0';
                    })()} د.ع
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold pb-2 border-b border-pink-100/30">
                  <span>الوزن المحتسب:</span>
                  <span className="text-pink-800 font-extrabold">{calcWeight} كجم</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs font-black text-gray-700">التكلفة التقديرية:</span>
                  <span className="text-sm font-black text-pink-700 bg-white px-3 py-1.5 rounded-xl border border-pink-200/50 shadow-sm">
                    {Math.ceil(calcWeight * (CALCULATOR_STORES.find(s => s.name === calcStore)?.rate || 0)).toLocaleString()} د.ع
                  </span>
                </div>
              </div>

              <p className="text-[9px] text-gray-400 font-semibold text-center italic mt-1 leading-normal">
                * ملاحظة: هذه تكلفة تقديرية للشحن فقط بناءً على الوزن المدخل وأسعار مستودعاتنا الرسمية.
              </p>
            </div>
          </div>

          {/* Kuwait vs UAE Shipping Cost Comparison Table */}
          <div className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-pink-100/30 pb-4 justify-between" dir="rtl">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-700 shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <h4 className="font-extrabold text-sm text-gray-800">مقارنة تكاليف الشحن السريعة</h4>
                  <p className="text-[10px] text-gray-400 font-bold">الكويت 🇰🇼 مقابل الإمارات 🇦🇪</p>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-black px-2 py-0.5 rounded-lg">الأرخص دائماً</span>
            </div>

            <div className="overflow-hidden border border-pink-100/50 rounded-2xl" dir="rtl">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-pink-50/40 text-[10px] text-pink-950 font-black border-b border-pink-100">
                    <th className="p-3">المتجر / الفئة</th>
                    <th className="p-3 text-center">الإمارات 🇦🇪</th>
                    <th className="p-3 text-center font-black">الكويت 🇰🇼</th>
                    <th className="p-3 text-center text-emerald-800">الخيار الأوفر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50/50 text-[11px] font-bold text-gray-700">
                  {[
                    { store: 'شي إن (Shein)', uae: '12,000 د.ع', kwt: '5,000 د.ع', saver: 'الكويت 🇰🇼', diff: '7,000 د.ع' },
                    { store: 'تريندول (Trendyol)', uae: '11,000 د.ع', kwt: '6,000 د.ع', saver: 'الكويت 🇰🇼', diff: '5,000 د.ع' },
                    { store: 'سيفورا ومستحضرات التجميل', uae: '16,000 د.ع', kwt: '8,000 د.ع', saver: 'الكويت 🇰🇼', diff: '8,000 د.ع' },
                    { store: 'الماركات ومتاجر أخرى', uae: '15,000 د.ع', kwt: '7,500 د.ع', saver: 'الكويت 🇰🇼', diff: '7,500 د.ع' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-pink-50/20 transition-colors">
                      <td className="p-3 text-gray-800 font-extrabold">{row.store}</td>
                      <td className="p-3 text-center text-gray-500 line-through decoration-pink-300">{row.uae}</td>
                      <td className="p-3 text-center text-pink-700 font-black bg-pink-50/20">{row.kwt}</td>
                      <td className="p-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                            {row.saver}
                          </span>
                          <span className="text-[9px] text-gray-400 mt-0.5 font-bold">
                            (وفر {row.diff})
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[9px] text-gray-400 font-bold leading-relaxed text-right" dir="rtl">
              💡 <span className="text-pink-700 font-black">نصيحة إيرامو:</span> اختيار مستودع الكويت يوفر عليكِ أكثر من <span className="text-emerald-700 font-extrabold">50%</span> من تكاليف الشحن لجميع المتاجر والطلبات الخاصة بكِ!
            </p>
          </div>

          {/* Support Card */}
          <div className="bg-gradient-to-br from-pink-50/50 to-pink-100/30 border border-pink-100/50 rounded-3xl p-6 text-center relative overflow-hidden shadow-sm">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white p-1 rounded-full mb-4 shadow-md border-2 border-pink-200 overflow-hidden shrink-0">
                <img
                  alt="Hadoosha Support"
                  className="w-full h-full rounded-full object-cover"
                  src="https://lh3.googleusercontent.com/aida/AP1WRLsRDP-u1RVbBjPEYf7rJ-NdzHWJakwLt7gnAZNMGLmJKPkRp5rpXeC8sb5pwEylTN2ng-Ej4yLxT26yVa7z8G4fx0CEaYjweNfrJHiCoOunzf32_M1-IHBfo1X1eJC73JVMP7Xm6keYR3qlhCReRzr35xI83PDs_ic9AinBS3apKtGSMte4_f4rzjZ-Cl9ZbJhrmILvORTYacUoZPZAjRoOoTRQKRQaadOcYttwFAAPdgux4o4_N5p9flU"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h4 className="font-bold text-gray-800 mb-1 text-base">هل تحتاجين لمساعدة؟</h4>
              <p className="text-gray-500 text-xs mb-6 px-4 leading-relaxed">
                خبراء الدعم اللوجستي متواجدون لمساعدتكِ طوال اليوم في تتبع الشحنات وحساب دقيق للأوزان.
              </p>

              {supportMessage && (
                <div className="mb-4 p-3 bg-white border border-pink-100 rounded-xl text-right text-xs text-pink-800 font-medium animate-fade-in">
                  {supportMessage}
                </div>
              )}

              <button
                onClick={handleSupportClick}
                className="w-full bg-white hover:bg-pink-700 hover:text-white transition-all text-pink-700 border-2 border-pink-100 py-3 rounded-full font-bold flex items-center justify-center gap-2 text-xs shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                تحدثي مع الدعم الفني الآن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Deletion Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white border border-pink-100 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up text-right" dir="rtl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="font-black text-gray-800 text-base">تأكيد حذف الشحنة</h4>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              هل أنتِ متأكدة من رغبتكِ في حذف الشحنة <span className="font-bold text-pink-700">{activeShipment?.trackingNumber}</span> من القائمة؟ لا يمكن التراجع عن هذا الإجراء وسيتم مسحها بالكامل.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={async () => {
                  if (activeShipment) {
                    setIsDeleting(true);
                    await deleteShipment(activeShipment.id);
                    setIsDeleting(false);
                    setShowDeleteConfirm(false);
                  }
                }}
                disabled={isDeleting}
                className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isDeleting ? 'جاري الحذف...' : 'نعم، حذف'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 bg-white border border-gray-200 text-gray-500 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
