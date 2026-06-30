import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Copy, MapPin, Plane, GitMerge, Box, ShoppingBag, Share2, Compass, MessageCircle, Info, CheckCircle, Package, Calculator, Plus, Minus, Scale, Search, Trash2, AlertTriangle, Wifi, WifiOff, Database } from 'lucide-react';
import IramoLiveMap from './IramoLiveMap';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function TrackingView() {
  const { shipments, selectedShipmentId, setSelectedShipmentId, deleteShipment, customizations, profile } = useApp();
  const [copied, setCopied] = useState<boolean>(false);
  const [supportMessage, setSupportMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [selectedMapNode, setSelectedMapNode] = useState<number | null>(null);
  const [mapViewTab, setMapViewTab] = useState<'diagram' | 'gps'>('diagram');
  
  // Interactive Shipping Rates Table State
  const [interWeight, setInterWeight] = useState<number>(1.0);
  const [interSource, setInterSource] = useState<string>('kwt');

  // Network offline/online status tracking
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  React.useEffect(() => {
    if (showDeleteConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDeleteConfirm]);

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
    (s.trackingNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.origin || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find selected shipment, or fallback to first filtered, or null
  const activeShipment = filteredShipments.find(s => s.id === selectedShipmentId) || filteredShipments[0] || null;

  const CALCULATOR_STORES = React.useMemo(() => {
    if (customizations?.supportedStores && customizations.supportedStores.length > 0) {
      return customizations.supportedStores.map(st => {
        const cleanRate = st.rate.replace(/,/g, '');
        const rateMatch = cleanRate.match(/\d+/);
        const parsedRate = rateMatch ? parseInt(rateMatch[0]) : 12000;
        return { name: st.name, rate: parsedRate };
      });
    }
    return [
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
  }, [customizations]);

  const [calcStore, setCalcStore] = useState<string>('');
  const [calcWeight, setCalcWeight] = useState<number>(1.0);

  React.useEffect(() => {
    if (CALCULATOR_STORES.length > 0 && !calcStore) {
      setCalcStore(CALCULATOR_STORES[0].name);
    }
  }, [CALCULATOR_STORES, calcStore]);

  // Sync state with selected shipment
  React.useEffect(() => {
    if (activeShipment) {
      const match = activeShipment.weight.match(/[\d.]+/);
      const parsed = match ? parseFloat(match[0]) : 1.0;
      setCalcWeight(parsed);
      
      const foundStore = CALCULATOR_STORES.find(s => 
        (activeShipment.origin || '').toLowerCase().includes((s.name || '').toLowerCase()) ||
        (s.name || '').toLowerCase().includes((activeShipment.origin || '').toLowerCase())
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

  // Colored status styles helper
  const getStatusStyles = (status: string) => {
    const s = (status || '').toLowerCase();
    
    // Delayed / Late (Red / Rose)
    if (s.includes('متأخر') || s.includes('تأخير') || s.includes('delay') || s.includes('متأخرة')) {
      return {
        bg: 'bg-rose-50 text-rose-800',
        border: 'border-rose-200/80',
        dot: 'bg-rose-500 shadow-md shadow-rose-500/50 animate-pulse',
        label: 'متأخر ⚠️',
        glow: 'shadow-rose-200',
        colorClass: 'rose',
        borderColor: '#f43f5e'
      };
    }

    // Completed / Delivered (Green)
    if (s.includes('تسليم') || s.includes('استلام') || s.includes('تم التسليم') || s.includes('وصلت للزبون') || s.includes('مكتمل') || s.includes('paid')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800',
        border: 'border-emerald-200/80',
        dot: 'bg-emerald-500',
        label: 'مكتمل ✓',
        glow: 'shadow-emerald-200',
        colorClass: 'emerald',
        borderColor: '#10b981'
      };
    }
    
    // In delivery / courier / transit (Yellow/Amber)
    if (s.includes('طريق') || s.includes('مندوب') || s.includes('توصيل') || s.includes('شحن')) {
      return {
        bg: 'bg-amber-50 text-amber-800',
        border: 'border-amber-200/80',
        dot: 'bg-amber-500 animate-pulse',
        label: 'قيد التوصيل 🚚',
        glow: 'shadow-amber-200',
        colorClass: 'amber',
        borderColor: '#f59e0b'
      };
    }
    
    // Customs / Airport (Blue)
    if (s.includes('مطار') || s.includes('جمارك') || s.includes('بغداد') || s.includes('ترانزيت')) {
      return {
        bg: 'bg-sky-50 text-sky-800',
        border: 'border-sky-200/80',
        dot: 'bg-sky-500',
        label: 'في مطار بغداد ✈️',
        glow: 'shadow-sky-200',
        colorClass: 'sky',
        borderColor: '#0ea5e9'
      };
    }
    
    // Received / Origin / Processing (Pink / Rose)
    return {
      bg: 'bg-pink-50 text-pink-800',
      border: 'border-pink-100/80',
      dot: 'bg-pink-500',
      label: 'قيد المعالجة 📦',
      glow: 'shadow-pink-200',
      colorClass: 'pink',
      borderColor: '#db2777'
    };
  };

  // Circular status indicator helper (Green for completed, Yellow for active, Red for delayed)
  const getStatusCircleStyle = (status: string) => {
    const s = (status || '').toLowerCase();
    
    // Delayed (Red/Rose)
    if (s.includes('متأخر') || s.includes('تأخير') || s.includes('delay') || s.includes('متأخرة')) {
      return {
        bgClass: 'bg-rose-500',
        pingClass: 'bg-rose-400',
        borderClass: 'border-rose-200',
        label: 'متأخر ⚠️'
      };
    }
    
    // Completed (Green/Emerald)
    if (s.includes('تسليم') || s.includes('استلام') || s.includes('تم التسليم') || s.includes('وصلت للزبون') || s.includes('مكتمل') || s.includes('paid') || s.includes('delivered')) {
      return {
        bgClass: 'bg-emerald-500',
        pingClass: 'bg-emerald-400',
        borderClass: 'border-emerald-200',
        label: 'مكتمل ✓'
      };
    }
    
    // Active (Yellow/Amber) - default
    return {
      bgClass: 'bg-amber-500',
      pingClass: 'bg-amber-400',
      borderClass: 'border-amber-200',
      label: 'نشط ⚡'
    };
  };

  const getStatusIcon = (status: string, className: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('متأخر') || s.includes('تأخير') || s.includes('delay') || s.includes('متأخرة')) {
      return <AlertTriangle className={className} />;
    }
    if (s.includes('تسليم') || s.includes('استلام') || s.includes('تم التسليم') || s.includes('وصلت للزبون') || s.includes('مكتمل') || s.includes('paid')) {
      return <CheckCircle className={className} />;
    }
    if (s.includes('طريق') || s.includes('مندوب') || s.includes('توصيل') || s.includes('شحن')) {
      return <Box className={className} />;
    }
    if (s.includes('مطار') || s.includes('جمارك') || s.includes('بغداد') || s.includes('ترانزيت')) {
      return <Plane className={className} />;
    }
    return <Package className={className} />;
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

  // Map progress helpers
  const getProgressIndex = (status: string): number => {
    const s = status.toLowerCase();
    if (s.includes('تسليم') || s.includes('استلام') || s.includes('تم التسليم') || s.includes('وصلت للزبون')) {
      return 4;
    }
    if (s.includes('طريق') || s.includes('مندوب') || s.includes('توصيل')) {
      return 3;
    }
    if (s.includes('مطار') || s.includes('جمارك') || s.includes('بغداد')) {
      return 2;
    }
    if (s.includes('مستودع') || s.includes('تجهيز') || s.includes('فرز') || s.includes('ترانزيت')) {
      return 1;
    }
    return 0; // default to origin / ordered
  };

  const getOriginDetails = (origin: string) => {
    const org = origin.toLowerCase();
    if (org.includes('china') || org.includes('guangzhou') || org.includes('shenzhen') || org.includes('shein') || org.includes('temu') || org.includes('taobao') || org.includes('1688') || org.includes('aliexpress')) {
      return { name: 'الصين 🇨🇳', x: 420, y: 130, details: 'تم استلام وتجهيز طردكِ الأنيق في مستودعات غوانزو/شينزين الصينية لبدء رحلته الفاخرة.' };
    }
    if (org.includes('kuwait') || org.includes('kwt') || org.includes('الكويت')) {
      return { name: 'الكويت 🇰🇼', x: 420, y: 130, details: 'تم استلام طردكِ الأنيق وتجهيزه للشحن في مستودع إيرامو بالكويت لتقديم أفضل وأوفر خدمة شحن.' };
    }
    if (org.includes('uae') || org.includes('dubai') || org.includes('دبي') || org.includes('الامارات')) {
      return { name: 'دبي 🇦🇪', x: 420, y: 130, details: 'تم استلام طردكِ وتجهيزه للشحن الجوي السريع في مستودع إيرامو بدبي.' };
    }
    if (org.includes('turkey') || org.includes('istanbul') || org.includes('تركيا') || org.includes('trendyol')) {
      return { name: 'إسطنبول 🇹🇷', x: 420, y: 130, details: 'تم استلام الشحنة وتغليفها بدقة في مستودع إيرامو بإسطنبول، تركيا.' };
    }
    return { name: 'بلد المصدر 🌐', x: 420, y: 130, details: 'تم تجميع وتأكيد استلام الطرد في مستودع المعالجة الدولي المعتمد.' };
  };

  const originNode = getOriginDetails(activeShipment.origin || '');
  const transitNode = { name: 'مستودع الترانزيت 📦', x: 320, y: 90, details: 'تجميع الطرود، التحقق من الأوزان والأبعاد، وإصدار بوليصة الشحن الدولي والبيانات الأمنية.' };
  const customsNode = { name: 'مطار بغداد ✈️', x: 220, y: 110, details: 'وصول الرحلة الجوية بأمان لبغداد وبدء إجراءات التخليص الجمركي والتدقيق الأمني السريع لشحنات إيرامو.' };
  const sortingNode = { name: 'مستودع إيرامو 🏠', x: 120, y: 80, details: 'استلام الطرد في مركز توزيع إيرامو الرئيسي ببغداد، فرزه حسب المناطق وتجهيزه للمندوب.' };
  const deliveryNode = { name: 'التسليم النهائي 💖', x: 40, y: 130, details: 'تسليم الطرد الأنيق بابتسامة تليق بجمالكِ إلى باب منزلكِ عبر مندوبينا المتميزين.' };

  const mapNodes = [originNode, transitNode, customsNode, sortingNode, deliveryNode];
  const progressIndex = getProgressIndex(activeShipment.status || '');
  const displayNodeIndex = selectedMapNode !== null ? selectedMapNode : progressIndex;
  const activeMapNode = mapNodes[displayNodeIndex];

  // Coordinates for drawing segments
  const segments = [
    { from: originNode, to: transitNode, active: progressIndex >= 1 },
    { from: transitNode, to: customsNode, active: progressIndex >= 2 },
    { from: customsNode, to: sortingNode, active: progressIndex >= 3 },
    { from: sortingNode, to: deliveryNode, active: progressIndex >= 4 },
  ];

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
        <div className="flex flex-col items-end gap-1 shrink-0 self-end sm:self-center">
          <div className="flex items-center gap-1 text-[10px] font-black">
            <Database className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/60 font-extrabold">
              تزامن Firestore نشط ⚡
            </span>
          </div>
          {profile?.uid && (
            <span className="text-[8px] font-mono text-gray-400 font-bold max-w-[120px] truncate">
              ID: {profile.uid}
            </span>
          )}
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
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar" 
            dir="rtl"
          >
            {filteredShipments.map((s) => {
              const statusStyles = getStatusStyles(s.status);
              const circleStyle = getStatusCircleStyle(s.status);
              const isActive = activeShipment?.id === s.id;
              const statusIcon = getStatusIcon(s.status, `w-3.5 h-3.5 ${isActive ? 'text-white' : statusStyles.dot.split(' ')[0]}`);
              
              return (
                <motion.button
                  variants={itemVariants}
                  key={s.id}
                  onClick={() => setSelectedShipmentId(s.id || null)}
                  className={`px-4 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-3 border cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-700 to-pink-500 text-white shadow-lg shadow-pink-500/20 border-transparent scale-[1.02]'
                      : 'bg-white border-pink-100/50 text-gray-700 hover:bg-pink-50/40 hover:border-pink-200'
                  }`}
                  style={!isActive ? { borderRight: `4px solid ${statusStyles.borderColor}` } : {}}
                >
                  <div className={`p-1.5 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : statusStyles.bg
                  }`}>
                    {statusIcon}
                  </div>
                  <div className="flex flex-col items-start gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-right">طرد {s.trackingNumber}</span>
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${circleStyle.pingClass}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${circleStyle.bgClass}`}></span>
                      </span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold block ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : `${statusStyles.bg} ${statusStyles.border} border text-[8px]`
                    }`}>
                      {s.status}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <p className="text-xs text-gray-400 font-bold text-center py-2">لا توجد نتائج تطابق بحثكِ.</p>
        )}
      </div>

      {/* Hero Tracking Summary */}
      <section className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 text-right w-full md:w-auto" dir="rtl">
            {activeShipment && (() => {
              const styles = getStatusStyles(activeShipment.status);
              return (
                <span className={`px-4 py-1.5 rounded-full text-xs font-black shadow-sm inline-flex items-center gap-2 border ${styles.bg} ${styles.border}`}>
                  <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                  <span>حالة الشحنة: {activeShipment.status}</span>
                </span>
              );
            })()}
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
              {/* Vertical line connecting steps - enhanced to look like a path */}
              <div className="absolute right-[15px] top-4 bottom-4 w-[4px] bg-gradient-to-b from-pink-200 to-pink-100 rounded-full"></div>

              {/* Steps list */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {activeShipment.journey?.map((step, idx) => (
                  <motion.div 
                    variants={itemVariants}
                    key={idx} 
                    className="relative pr-10 flex gap-4"
                  >
                    {/* Step bubble icon - dynamic based on status */}
                    <div
                      className={`absolute right-0 top-0.5 w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-md transition-all duration-500 ${
                        step.active
                          ? 'bg-pink-700 ring-4 ring-pink-100 scale-110'
                          : 'bg-white border-2 border-pink-200'
                      }`}
                    >
                      {getIcon(step.icon, step.active)}
                    </div>

                    <div className="flex-1 space-y-1 bg-white/50 p-4 rounded-2xl border border-pink-50 shadow-sm">
                      <h4
                        className={`text-sm ${
                          step.active ? 'text-pink-800 font-black' : 'text-gray-600 font-semibold'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-gray-500 text-xs leading-relaxed">{step.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block bg-pink-50 text-[10px] text-pink-700 font-black px-2 py-0.5 rounded-md">
                          {step.time}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          📍 {step.location}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Interactive Live Shipping Route Map */}
          <div className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden text-right" dir="rtl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-pink-50 pb-3 flex-row-reverse">
              {/* Tabs selector */}
              <div className="flex bg-pink-50/50 p-1 rounded-2xl gap-1 shrink-0">
                <button
                  onClick={() => setMapViewTab('diagram')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                    mapViewTab === 'diagram'
                      ? 'bg-pink-700 text-white shadow-sm'
                      : 'text-gray-500 hover:text-pink-700 hover:bg-white/50'
                  }`}
                >
                  المخطط التوضيحي 🗺️
                </button>
                <button
                  onClick={() => setMapViewTab('gps')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                    mapViewTab === 'gps'
                      ? 'bg-pink-700 text-white shadow-sm'
                      : 'text-gray-500 hover:text-pink-700 hover:bg-white/50'
                  }`}
                >
                  خريطة GPS الحية 🛰️
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-700 shrink-0">
                  <Compass className="w-5 h-5 animate-spin-slow text-pink-700" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-800">خريطة التتبع التفاعلية</h4>
                  <p className="text-[10px] text-gray-400 font-bold">تتبعي خط سير الشحنة الفعلي أو بالمحطات التوضيحية 🗺️</p>
                </div>
              </div>
            </div>

            {mapViewTab === 'diagram' ? (
              <>
                {/* Map Canvas */}
                <div className="bg-slate-950 rounded-2xl p-4 relative overflow-hidden border border-pink-100/10 min-h-[220px] flex items-center justify-center">
                  {/* Radar Grid Lines background */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                  
                  <svg viewBox="0 0 460 180" className="w-full h-auto relative z-10 select-none">
                    {/* Connection lines / segments */}
                    {segments.map((seg, idx) => (
                      <g key={idx}>
                        {/* Background line shadow */}
                        <line 
                          x1={seg.from.x} 
                          y1={seg.from.y} 
                          x2={seg.to.x} 
                          y2={seg.to.y} 
                          stroke={seg.active ? 'rgba(219, 39, 119, 0.3)' : 'rgba(244, 143, 177, 0.08)'} 
                          strokeWidth={seg.active ? '5' : '3'}
                          strokeLinecap="round"
                        />
                        {/* Core Line */}
                        <line 
                          x1={seg.from.x} 
                          y1={seg.from.y} 
                          x2={seg.to.x} 
                          y2={seg.to.y} 
                          stroke={seg.active ? '#db2777' : '#374151'} 
                          strokeWidth="2.5" 
                          strokeDasharray={seg.active ? 'none' : '4 3'}
                          strokeLinecap="round"
                        />
                      </g>
                    ))}

                    {/* Draw airplane/transit icon flying along active segment */}
                    {(() => {
                      const activeSeg = segments[progressIndex - 1] || segments[0];
                      if (progressIndex > 0 && progressIndex < 5 && activeSeg) {
                        // Place it halfway on the current active segment
                        const midX = (activeSeg.from.x + activeSeg.to.x) / 2;
                        const midY = (activeSeg.from.y + activeSeg.to.y) / 2;
                        return (
                          <g className="animate-pulse">
                            <circle cx={midX} cy={midY} r="8" fill="#f43f5e" className="opacity-40 animate-ping" />
                            <circle cx={midX} cy={midY} r="4" fill="#db2777" />
                            {/* Plane Vector path rotated towards target */}
                            <g transform={`translate(${midX - 7}, ${midY - 7}) scale(0.75)`}>
                              <path 
                                d="M14 16v-2l-4.782-2.906c-.19-.116-.318-.31-.318-.534V4.5c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5v5.56c0 .224-.128.418-.318.534L1 14v2h6.14l1.107 1.66c.11.165.293.265.49.265h1.12c.32 0 .54-.316.425-.615L9.14 16H14z" 
                                fill="#ffffff" 
                              />
                            </g>
                          </g>
                        );
                      }
                      return null;
                    })()}

                    {/* Nodes */}
                    {mapNodes.map((node, idx) => {
                      const isCompleted = idx < progressIndex;
                      const isCurrent = idx === progressIndex;
                      const isSelected = idx === displayNodeIndex;
                      
                      return (
                        <g 
                          key={idx} 
                          className="cursor-pointer" 
                          onClick={() => setSelectedMapNode(idx)}
                        >
                          {/* Active ring background glow */}
                          {(isCurrent || isSelected) && (
                            <circle 
                              cx={node.x} 
                              cy={node.y} 
                              r={isCurrent ? "12" : "10"} 
                              fill={isCurrent ? "rgba(219, 39, 119, 0.25)" : "rgba(244, 143, 177, 0.15)"} 
                              className={isCurrent ? "animate-ping" : ""}
                            />
                          )}
                          
                          {/* Outer border ring */}
                          <circle 
                            cx={node.x} 
                            cy={node.y} 
                            r={isCurrent ? "8" : "6"} 
                            fill={isCompleted ? "#db2777" : isCurrent ? "#ec4899" : "#1f2937"} 
                            stroke={isCompleted ? "#fbcfe8" : isCurrent ? "#ffffff" : "#4b5563"} 
                            strokeWidth="1.5"
                          />

                          {/* Small center dot */}
                          <circle 
                            cx={node.x} 
                            cy={node.y} 
                            r="2.5" 
                            fill={isCompleted || isCurrent ? "#ffffff" : "#9ca3af"} 
                          />

                          {/* Text Label */}
                          <text 
                            x={node.x} 
                            y={node.y + 18} 
                            textAnchor="middle" 
                            fill={isCurrent ? "#f472b6" : isSelected ? "#ec4899" : "#9ca3af"} 
                            className="text-[9px] font-black tracking-tight"
                          >
                            {node.name.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Node Status Card Details */}
                <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/40 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-pink-800 font-extrabold uppercase tracking-wide">تفاصيل المحطة المحددة</span>
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-lg ${
                      displayNodeIndex < progressIndex 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : displayNodeIndex === progressIndex 
                          ? 'bg-pink-100 text-pink-800 border border-pink-200 animate-pulse' 
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}>
                      {displayNodeIndex < progressIndex 
                        ? 'محطة مكتملة ✓' 
                        : displayNodeIndex === progressIndex 
                          ? 'المحطة الحالية 📍' 
                          : 'قيد الانتظار ⏳'}
                    </span>
                  </div>

                  <h5 className="font-extrabold text-gray-800 text-xs">{activeMapNode.name}</h5>
                  <p className="text-[10px] text-gray-500 font-bold leading-relaxed">{activeMapNode.details}</p>

                  {/* Dynamic Mascot Quote for the node */}
                  <div className="pt-2 border-t border-pink-100/40 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-pink-200 shrink-0">
                      <img 
                        src={customizations?.trackingBatootMascotUrl || "https://lh3.googleusercontent.com/aida/AP1WRLtwlTtxpvh7CFWTWdRY_emR2xyBvTgx8v6zMnJSM8OrvnGrHK98fOcbdnwqMhudLD35tXhQRA9VBIsbRPIxBCWcjiseBr_ZThUYOO2bASORtpBXsEwGUlke9kqXDQGVw-0hzUjOQZGvkAbigP02pHzK4tU63vK7UVYFj3MEl6UjVilDvrlHzDZhs-o55NTjiE4kAtBK7MfYbaxsU0axIHNlMxqsY-z3Mq4P6X0iHTAI-TEqMLAdFD53L8"}
                        alt="Batoot Mascot" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <p className="text-[10px] text-pink-700 italic font-semibold leading-tight">
                      {displayNodeIndex === 0 && '✨ "التحضير في بلد المصدر هو أول خطوة لرحلة آمنة وأنيقة!"'}
                      {displayNodeIndex === 1 && '📦 "الترانزيت والفرز يضمنان وزن دقيق ومعالجة سريعة لجميع الطرود!"'}
                      {displayNodeIndex === 2 && '✈️ "وصلنا مطار بغداد! التخليص الجمركي سريع ليطير طردكِ إليكِ!"'}
                      {displayNodeIndex === 3 && '🏠 "الشحنة في مستودع إيرامو ببغداد، نقوم بلمساتنا النهائية قبل التسليم!"'}
                      {displayNodeIndex === 4 && '💖 "يا لها من لحظة سعيدة! طردكِ الأنيق وصل ليديكِ ليزيدكِ جمالاً ونضارة!"'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="animate-fade-in space-y-2">
                <IramoLiveMap
                  origin={activeShipment.origin}
                  status={activeShipment.status}
                  destinationCity={profile?.city || 'بغداد'}
                  trackingNumber={activeShipment.trackingNumber}
                  transitType={activeShipment.transitType}
                  transitSpeed={activeShipment.transitSpeed}
                  transitAltitude={activeShipment.transitAltitude}
                  simulatedProgress={activeShipment.simulatedProgress}
                />
              </div>
            )}
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

          {/* Shipment Gallery - Package Inspection Photos */}
          <div className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-pink-100/30 pb-3">
              صور فحص الطرد بالمستودع 📸
            </h4>
            <p className="text-[10px] text-gray-400 font-bold leading-relaxed text-right">
              نوفر لكِ صور حقيقية عالية الجودة لطردكِ عند وصوله لمستودعاتنا لضمان السلامة والفرز الأنيق!
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400&auto=format&fit=crop", label: "فحص الطرد" },
                { url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop", label: "التغليف الأنيق" },
                { url: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=400&auto=format&fit=crop", label: "ملصق الشحن" }
              ].map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-pink-100 shadow-xs cursor-pointer">
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-white py-1 text-center font-black">
                    {img.label}
                  </div>
                </div>
              ))}
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

          {/* Interactive Shipping Cost Table Card */}
          <div className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-pink-100/30 pb-4 justify-between" dir="rtl">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-700 shrink-0">
                  <Calculator className="w-5 h-5 text-pink-600" />
                </div>
                <div className="text-right">
                  <h4 className="font-extrabold text-sm text-gray-800">جدول تقدير الشحن التفاعلي للمحافظات 📊</h4>
                  <p className="text-[10px] text-gray-400 font-bold">حددي خياراتكِ واعرفي كلفة الشحن لجميع مناطق العراق بدقة!</p>
                </div>
              </div>
            </div>

            {/* Step 1: Select Source Warehouse */}
            <div className="space-y-2 text-right" dir="rtl">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">
                ١. اختاري مستودع الشحن الدولي:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'kwt', label: 'مستودع الكويت 🇰🇼', rate: 5000, color: 'border-pink-200 text-pink-700' },
                  { key: 'tr', label: 'مستودع تركيا 🇹🇷', rate: 11000, color: 'border-amber-200 text-amber-700' },
                  { key: 'ae', label: 'مستودع دبي 🇦🇪', rate: 12000, color: 'border-sky-200 text-sky-700' },
                  { key: 'cn', label: 'مستودع الصين 🇨🇳', rate: 16500, color: 'border-purple-200 text-purple-700' },
                ].map((wh) => {
                  const isSel = interSource === wh.key;
                  return (
                    <button
                      key={wh.key}
                      onClick={() => setInterSource(wh.key)}
                      className={`px-3 py-2.5 rounded-2xl border text-xs font-black transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                        isSel 
                          ? 'bg-gradient-to-r from-pink-700 to-pink-500 text-white border-transparent shadow-md scale-[1.02]' 
                          : 'bg-white hover:bg-pink-50/20 text-gray-700 border-pink-100/40'
                      }`}
                    >
                      <span>{wh.label}</span>
                      <span className={`text-[10px] font-bold ${isSel ? 'text-white/80' : 'text-gray-400'}`}>
                        ({wh.rate.toLocaleString()} د.ع/كغم)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Set Weight */}
            <div className="space-y-3 text-right" dir="rtl">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                ٢. حددي وزن الطرد الإجمالي:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInterWeight(prev => Math.max(0.1, parseFloat((prev - 0.5).toFixed(1))))}
                  className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-700 hover:bg-pink-100 transition-colors shrink-0 font-extrabold"
                >
                  -0.5
                </button>
                <button
                  onClick={() => setInterWeight(prev => Math.max(0.1, parseFloat((prev - 0.1).toFixed(1))))}
                  className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-700 hover:bg-pink-100 transition-colors shrink-0 font-extrabold"
                >
                  -0.1
                </button>
                <div className="flex-1 px-4 py-2 bg-pink-50/20 border border-pink-100/50 rounded-2xl text-center">
                  <span className="text-sm font-black text-pink-700">{interWeight} كجم</span>
                </div>
                <button
                  onClick={() => setInterWeight(prev => parseFloat((prev + 0.1).toFixed(1)))}
                  className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-700 hover:bg-pink-100 transition-colors shrink-0 font-extrabold"
                >
                  +0.1
                </button>
                <button
                  onClick={() => setInterWeight(prev => parseFloat((prev + 0.5).toFixed(1)))}
                  className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-700 hover:bg-pink-100 transition-colors shrink-0 font-extrabold"
                >
                  +0.5
                </button>
              </div>

              {/* Quick Weight Selectors */}
              <div className="flex justify-between gap-1 bg-pink-50/30 p-1 rounded-xl">
                {[0.5, 1.0, 2.0, 5.0, 10.0].map((w) => (
                  <button
                    key={w}
                    onClick={() => setInterWeight(w)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      interWeight === w 
                        ? 'bg-pink-600 text-white shadow-xs' 
                        : 'text-gray-500 hover:text-pink-600 hover:bg-white/50'
                    }`}
                  >
                    {w} كغم
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Interactive Dynamic Table */}
            <div className="space-y-2 text-right" dir="rtl">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">
                ٣. تقدير التكاليف حسب المحافظات والوجهات:
              </span>
              <div className="overflow-hidden border border-pink-100/50 rounded-2xl shadow-xs">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-pink-50/40 text-[10px] text-pink-950 font-black border-b border-pink-100">
                      <th className="p-3">المحافظة / المدينة 📍</th>
                      <th className="p-3 text-center">التوصيل الداخلي</th>
                      <th className="p-3 text-center">الشحن الدولي</th>
                      <th className="p-3 text-center text-pink-700 font-extrabold">المجموع الكلي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50/30 text-[11px] font-bold text-gray-700 bg-white">
                    {[
                      { city: 'بغداد (الحبيبة)', local: 5000, days: '٢٤-٤٨ ساعة' },
                      { city: 'محافظات الوسط والفرات الأوسط', local: 6000, days: '٢-٣ أيام' },
                      { city: 'البصرة والفرات الجنوبي', local: 7000, days: '٣-٤ أيام' },
                      { city: 'المحافظات الشمالية وكردستان', local: 7000, days: '٣-٤ أيام' }
                    ].map((row, idx) => {
                      const rate = interSource === 'kwt' ? 5000 : interSource === 'tr' ? 11000 : interSource === 'ae' ? 12000 : 16500;
                      const intCost = interWeight * rate;
                      const total = intCost + row.local;
                      return (
                        <tr 
                          key={idx} 
                          className="hover:bg-pink-50/30 transition-all duration-200"
                        >
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="text-gray-800 font-extrabold text-[12px]">{row.city}</span>
                              <span className="text-[9px] text-gray-400 font-bold mt-0.5">⏱️ {row.days}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center text-gray-500">{row.local.toLocaleString()} د.ع</td>
                          <td className="p-3 text-center text-gray-500">{intCost.toLocaleString()} د.ع</td>
                          <td className="p-3 text-center bg-pink-50/10">
                            <span className="text-xs font-black text-pink-700 bg-pink-50/50 px-2.5 py-1 rounded-xl border border-pink-100/50 block">
                              {total.toLocaleString()} د.ع
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100/60 p-3.5 rounded-2xl text-right flex gap-2.5 items-start" dir="rtl">
              <span className="text-emerald-700 shrink-0 mt-0.5 font-bold">💡</span>
              <p className="text-[10px] text-emerald-900 leading-normal font-bold">
                حساب الوزن يتم لأقرب <span className="font-black text-emerald-700">100 غرام</span> لتوفير أقصى قدر من الدقة. التكلفة المعروضة شاملة لجمارك وبطاقات الشحن لبيتكِ!
              </p>
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-gradient-to-br from-pink-50/50 to-pink-100/30 border border-pink-100/50 rounded-3xl p-6 text-center relative overflow-hidden shadow-sm">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white p-1 rounded-full mb-4 shadow-md border-2 border-pink-200 overflow-hidden shrink-0">
                <img
                  alt="Support Agent Mascot"
                  className="w-full h-full rounded-full object-cover"
                  src={customizations?.trackingSupportAgentUrl || "https://lh3.googleusercontent.com/aida/AP1WRLsRDP-u1RVbBjPEYf7rJ-NdzHWJakwLt7gnAZNMGLmJKPkRp5rpXeC8sb5pwEylTN2ng-Ej4yLxT26yVa7z8G4fx0CEaYjweNfrJHiCoOunzf32_M1-IHBfo1X1eJC73JVMP7Xm6keYR3qlhCReRzr35xI83PDs_ic9AinBS3apKtGSMte4_f4rzjZ-Cl9ZbJhrmILvORTYacUoZPZAjRoOoTRQKRQaadOcYttwFAAPdgux4o4_N5p9flU"}
                  referrerPolicy="no-referrer"
                />
              </div>
              <h4 className="font-bold text-gray-800 mb-1 text-base">{customizations?.trackingSupportTitle || 'هل تحتاجين لمساعدة؟'}</h4>
              <p className="text-gray-500 text-xs mb-6 px-4 leading-relaxed">
                {customizations?.trackingSupportQuote || 'خبراء الدعم اللوجستي متواجدون لمساعدتكِ طوال اليوم في تتبع الشحنات وحساب دقيق للأوزان.'}
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
        <div className="fixed inset-0 z-[99998] bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowDeleteConfirm(false)}>
          <div 
            className="fixed z-[99999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-pink-100 rounded-[32px] p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up text-right max-h-[90vh] overflow-y-auto" 
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
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
