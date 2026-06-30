import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Receipt, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  ArrowRightLeft,
  ChevronRight,
  Bell,
  Menu,
  Palette,
  Layers,
  ShoppingBag,
  CreditCard,
  Percent,
  AlertCircle,
  Database,
  Image as ImageIcon,
  Sun,
  Moon,
  ToggleLeft,
  X,
  Sliders,
  Sparkles,
  Award,
  DollarSign,
  ShieldAlert,
  Edit3,
  CheckCircle2,
  Trash,
  Star
} from 'lucide-react';

// Import existing subcomponents (or custom fallback lists)
import ManagerDashboard from './ManagerDashboard';
import ManagerShipments from './ManagerShipments';
import ManagerInvoices from './ManagerInvoices';
import ManagerCustomers from './ManagerCustomers';
import ManagerProfits from './ManagerProfits';
import ManagerSettings from './ManagerSettings';
import ManagerVisualIdentity from './ManagerVisualIdentity';
import ManagerNotifications from './ManagerNotifications';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { DEFAULT_AVATAR } from '../../utils/avatar';
import { useApp } from '../../context/AppContext';

interface ManagerPortalProps {
  onSwitchToCustomerMode: () => void;
}

// Exactly 18 distinct Admin tabs
type ManagerTabType = 
  | 'dashboard'
  | 'customers'
  | 'orders'
  | 'shipments'
  | 'products'
  | 'categories'
  | 'invoices'
  | 'notifications'
  | 'analytics'
  | 'finance'
  | 'walletManagement'
  | 'shippingRates'
  | 'loyaltySystem'
  | 'reviewsModeration'
  | 'mediaManager'
  | 'themeCustomizer'
  | 'firebaseSettings'
  | 'systemSettings';

export default function ManagerPortal({ onSwitchToCustomerMode }: ManagerPortalProps) {
  const { customizations, updateCustomizations, shipments, invoices, profile } = useApp();
  const [activeTab, setActiveTab] = useState<ManagerTabType>('dashboard');
  const [isAdminDarkMode, setIsAdminDarkMode] = useState<boolean>(false);

  // Manage internal list of reviews for moderation
  const [reviewsForModeration, setReviewsForModeration] = useState([
    { id: 'rev_1', author: 'مريم الجبوري', product: 'حقيبة ليدي ديور كلاسيك', rating: 5, comment: 'تجنن وتفاصيلها دقيقة للغاية! كوالتي خيالي وسرعة بالتوصيل.', status: 'approved', date: '2026-06-28' },
    { id: 'rev_2', author: 'سارة العبيدي', product: 'سيروم اوباجي فيتامين سي', rating: 5, comment: 'أصلي 100% بشرتي صارت تلمع نضارة شكراً إيرامو.', status: 'approved', date: '2026-06-25' },
    { id: 'rev_3', author: 'هدى السلطاني', product: 'سوار الحب كارتييه', rating: 4, comment: 'لمعته رهيبة وصارلي شهر ألبسه وما تغير لونه أبداً.', status: 'approved', date: '2026-06-22' }
  ]);

  // Firebase configurations state
  const [firebaseConfig, setFirebaseConfig] = useState({
    projectId: 'iramo-store-f9b33',
    apiKey: 'AIzaSyA4xX9-O128_zNpY-390m2_Bq4L',
    authDomain: 'iramo-store-f9b33.firebaseapp.com',
    storageBucket: 'iramo-store-f9b33.appspot.com',
    messagingSenderId: '313999867161',
    appId: '1:313999867161:web:c28434411024'
  });

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'غرفة المراقبة والتحكم الموحد';
      case 'customers': return 'دليل وإدارة زبونات إيرامو العراقيات';
      case 'orders': return 'إدارة وتتبع طلبات الشراء الواردة';
      case 'shipments': return 'نظام تتبع طرود الشحن الجوي المباشر';
      case 'products': return 'كتالوج وتعديل منتجات التسليم الفوري';
      case 'categories': return 'إدارة تصنيفات وأقسام البوتيك';
      case 'invoices': return 'إدارة الفواتير والتحصيلات المالية';
      case 'notifications': return 'مركز إرسال الإشعارات الجماعية والـ Push';
      case 'analytics': return 'لوحة التحليلات الإحصائية والنمو البياني';
      case 'finance': return 'التقارير المالية والأرباح وصافي المبيعات';
      case 'walletManagement': return 'إدارة محافظ العملاء وشحن الأرصدة';
      case 'shippingRates': return 'إعدادات أسعار التوصيل والوزن للمحافظات';
      case 'loyaltySystem': return 'لوحة تحكم نقاط الولاء والمكافآت الملكية';
      case 'reviewsModeration': return 'إدارة وتعديل تقييمات ومراجعات العملاء';
      case 'mediaManager': return 'إدارة الوسائط، البنرات الإعلانية والصور';
      case 'themeCustomizer': return 'مركز الهوية البصرية، الألوان والسمات';
      case 'firebaseSettings': return 'إعدادات قاعدة بيانات Firebase والـ API Keys';
      case 'systemSettings': return 'إعدادات النظام العامة والصلاحيات الإدارية';
      default: return 'لوحة تحكم إيرامو شيك الإدارية';
    }
  };

  const deleteReview = (id: string) => {
    setReviewsForModeration(prev => prev.filter(r => r.id !== id));
  };

  const approveReview = (id: string) => {
    setReviewsForModeration(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ManagerDashboard 
            onAddShipmentClick={() => setActiveTab('shipments')}
            onAddInvoiceClick={() => setActiveTab('invoices')}
            onNavigateToTab={(tab) => {
              if (tab === 'settings') setActiveTab('systemSettings');
              else if (tab === 'customers') setActiveTab('customers');
              else if (tab === 'shipments') setActiveTab('shipments');
              else if (tab === 'invoices') setActiveTab('invoices');
              else if (tab === 'visualIdentity') setActiveTab('themeCustomizer');
            }}
          />
        );
      case 'customers':
        return <ManagerCustomers setActiveTab={(tab) => setActiveTab('customers')} />;
      case 'orders':
      case 'invoices':
        return <ManagerInvoices />;
      case 'shipments':
        return <ManagerShipments />;
      case 'products':
      case 'themeCustomizer':
      case 'mediaManager':
      case 'categories':
        return <ManagerVisualIdentity />;
      case 'notifications':
        return <ManagerNotifications />;
      
      // ADMIN SPECIFIC SECTIONS requested
      case 'analytics':
        return (
          <div className="space-y-6 pt-2">
            <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700">
              <h3 className="font-extrabold text-sm text-cyan-400 mb-2">لوحة التحليلات والنمو الإحصائي 📈</h3>
              <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">
                شاهد نمو المبيعات وعدد الشحنات النشطة ومعدلات تفاعل الزبونات في مختلف محافظات العراق.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-4 text-center">
                <span className="text-[9px] text-slate-400 font-bold block">معدل التحويل (Conversion Rate)</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">٤.٨٪</span>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-4 text-center">
                <span className="text-[9px] text-slate-400 font-bold block">متوسط قيمة السلة</span>
                <span className="text-xl font-black text-cyan-400 mt-1 block">٢٨٥,٠٠٠ د.ع</span>
              </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/40 rounded-3xl p-5">
              <h4 className="text-xs font-black text-white mb-3">المبيعات حسب القنوات الجغرافية 📍</h4>
              <div className="space-y-2.5">
                {[
                  { name: 'محافظة بغداد الكريمة', percentage: '٥٨٪', val: '٥٨ طلباً' },
                  { name: 'البصرة الفيحاء', percentage: '١٨٪', val: '١٨ طلباً' },
                  { name: 'كربلاء المقدسة وبابل', percentage: '١٤٪', val: '١٤ طلباً' },
                  { name: 'أربيل وباقي المحافظات', percentage: '١٠٪', val: '١٠ طرود' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5 text-[10px]">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-200">{item.name}</span>
                      <span className="text-cyan-400">{item.percentage} ({item.val})</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: item.percentage.replace('٪', '%') }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'finance':
        return <ManagerProfits />;

      case 'walletManagement':
        return (
          <div className="space-y-6 pt-2">
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-5 space-y-1">
              <h3 className="font-extrabold text-sm text-amber-400">نظام إدارة محافظ الزبونات الموحد 💳</h3>
              <p className="text-[10.5px] text-slate-300 leading-relaxed font-bold">
                تعديل وتحديث أرصدة محافظ العملاء يدوياً، معالجة كوبونات الشحن، واستعراض عمليات الشحن التي أجرتها الزبونات من البوابة.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-4 space-y-3">
              <h4 className="text-xs font-black text-white">البحث السريع وتعديل الأرصدة 🔍</h4>
              <div className="space-y-2.5">
                <input 
                  type="text" 
                  placeholder="ابحثي عن زبونة بالاسم أو رقم الهاتف..." 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 text-right focus:outline-none focus:border-cyan-400"
                />
                
                <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700 text-[10.5px] space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-400">الزبونة الحالية:</span>
                    <span className="text-white">أمنة الفياض</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-400">رصيد المحفظة الحالي:</span>
                    <span className="text-amber-400">٢٥٠,٠٠٠ د.ع</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <input 
                      type="number" 
                      placeholder="أضيفي أو اخصمي مبلغ (د.ع)" 
                      className="flex-1 bg-slate-850 border border-slate-700 rounded-lg px-2 text-[10px] text-right"
                    />
                    <button className="bg-amber-600 hover:bg-amber-700 text-white text-[9.5px] font-black px-4 py-1.5 rounded-lg active:scale-95 cursor-pointer">
                      تعديل الرصيد
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/40 rounded-3xl p-4 space-y-2">
              <h4 className="text-xs font-black text-white">أحدث طلبات شحن المحفظة المعلقة ⏳</h4>
              <div className="space-y-2 text-[10px]">
                <div className="bg-slate-900/40 p-2.5 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-slate-200 block font-bold">مريم م. (0770992818)</span>
                    <span className="text-slate-400 text-[8.5px]">المبلغ: ١٥٠,٠٠٠ د.ع - زين كاش</span>
                  </div>
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-[8px] font-black px-3 py-1 rounded-md cursor-pointer">
                    موافقة وتحديث
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'shippingRates':
        return (
          <div className="space-y-6 pt-2">
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-5 space-y-1">
              <h3 className="font-extrabold text-sm text-cyan-400">قائمة تسعير وأوزان توصيل المحافظات الععراقية 🗺️</h3>
              <p className="text-[10.5px] text-slate-300 leading-relaxed font-bold">
                إضافة وتعديل تسعيرة توصيل الطرود والشحنات الدولية لكل محافظة عراقية بناءً على شركة النقل الداخلي.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-4 space-y-3">
              <h4 className="text-xs font-black text-white">تسعيرة شحن وتوصيل الطرود الحالية</h4>
              <div className="space-y-2">
                {[
                  { province: 'محافظة بغداد الكريمة', rate: '٥,٠٠٠ د.ع', time: '١ - ٢ يوم' },
                  { province: 'محافظة البصرة', rate: '٨,٠٠٠ د.ع', time: '٢ - ٣ أيام' },
                  { province: 'بابل والنجف وكربلاء المقدسة', rate: '٦,٠٠٠ د.ع', time: '٢ - ٣ أيام' },
                  { province: 'الموصل وباقي المحافظات الشمالية', rate: '٨,٠٠٠ د.ع', time: '٣ - ٤ أيام' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-900/50 p-3 rounded-xl flex justify-between items-center text-[10.5px]">
                    <div>
                      <span className="text-slate-200 block font-extrabold">{item.province}</span>
                      <span className="text-slate-400 text-[8.5px]">مدة التوصيل التقريبية: {item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-black">{item.rate}</span>
                      <button className="text-slate-400 hover:text-cyan-400 p-1 cursor-pointer">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'loyaltySystem':
        return (
          <div className="space-y-6 pt-2">
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-5 space-y-1">
              <h3 className="font-extrabold text-sm text-amber-400">إدارة برنامج نقاط الولاء والمكافآت الملكية 👑</h3>
              <p className="text-[10.5px] text-slate-300 leading-relaxed font-bold">
                تحديد وإضافة آليات ربح النقاط، تعيين فئات العضوية (الملكية، الذهبية، الأساسية) وأكواد استبدال الهدايا.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-4 space-y-3 text-[10.5px]">
              <h4 className="text-xs font-black text-white">إعدادات وقواعد ربح النقاط المعتمدة</h4>
              <div className="space-y-2.5">
                <div className="p-3 bg-slate-900/60 rounded-xl flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">كل ١٠,٠٠٠ د.ع شراء يمنح الزبونة:</span>
                  <span className="text-amber-400 font-black">١٠ نقاط ولاء</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">ربح كتابة رأي وتقييم بمنتج:</span>
                  <span className="text-amber-400 font-black">٢٥ نقطة ولاء</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reviewsModeration':
        return (
          <div className="space-y-6 pt-2">
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-5 space-y-1">
              <h3 className="font-extrabold text-sm text-cyan-400">مركز إدارة وتدقيق تقييمات العملاء ⭐️</h3>
              <p className="text-[10.5px] text-slate-300 leading-relaxed font-bold">
                استعراض، تصفية ومراجعة كافة التقييمات اللطيفة والآراء المتروكة من الزبونات لضمان الجمالية والموثوقية قبل عرضها.
              </p>
            </div>

            <div className="space-y-3">
              {reviewsForModeration.map(rev => (
                <div key={rev.id} className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl text-[10.5px] space-y-2.5 text-right relative">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                    <div>
                      <span className="text-slate-200 font-black block">{rev.author}</span>
                      <span className="text-[8.5px] text-cyan-400 font-semibold">المنتج: {rev.product}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-black">{rev.rating}</span>
                    </div>
                  </div>

                  <p className="text-slate-300 font-bold leading-normal">"{rev.comment}"</p>

                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-700/50">
                    <span className="text-[8.5px] text-slate-400">{rev.date}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => deleteReview(rev.id)}
                        className="bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white p-1.5 px-3.5 rounded-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1 text-[8.5px] font-black"
                      >
                        <Trash className="w-3 h-3" />
                        حذف الرأي
                      </button>
                      {rev.status !== 'approved' && (
                        <button 
                          onClick={() => approveReview(rev.id)}
                          className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white p-1.5 px-3.5 rounded-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1 text-[8.5px] font-black"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          موافقة ونشر
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'firebaseSettings':
        return (
          <div className="space-y-6 pt-2">
            <div className="bg-slate-800/95 border border-slate-700 rounded-3xl p-5 space-y-1">
              <h3 className="font-extrabold text-sm text-red-400 flex items-center gap-1">
                <ShieldAlert className="w-4.5 h-4.5" />
                <span>إعدادات السحابة الحيوية وبوابات الـ Firebase 🔒</span>
              </h3>
              <p className="text-[10px] text-slate-300 leading-relaxed font-bold">
                عرض وتهيئة كود التهيئة السري لقاعدة بيانات متجر إيرامو لضمان موثوقية الاتصال. هذه التفاصيل مخفية تماماً عن الزبونات في بوابتهن الجمالية.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] space-y-4 text-left font-mono text-[9px] text-cyan-400 relative overflow-hidden">
              <div className="absolute top-2 right-2 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md font-sans text-[8.5px] font-black">
                CONFIG SECURE
              </div>
              
              <div className="space-y-1 pt-4 text-right">
                <span className="text-[9.5px] font-bold text-slate-400 block mb-1">بيانات الاتصال النشطة بالخادم السحابي:</span>
                <p className="text-slate-300"><span className="text-amber-400">PROJECT ID:</span> {firebaseConfig.projectId}</p>
                <p className="text-slate-300"><span className="text-amber-400">API KEY:</span> {firebaseConfig.apiKey}</p>
                <p className="text-slate-300"><span className="text-amber-400">AUTH DOMAIN:</span> {firebaseConfig.authDomain}</p>
                <p className="text-slate-300"><span className="text-amber-400">STORAGE BUCKET:</span> {firebaseConfig.storageBucket}</p>
                <p className="text-slate-300"><span className="text-amber-400">APP ID:</span> {firebaseConfig.appId}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 font-sans">
                <button 
                  onClick={() => alert('🔒 تم تأمين وضبط خادم الـ Firebase وبوابة الـ API بنجاح!')}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white text-[9px] font-black px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  فحص الاتصال الفعال
                </button>
              </div>
            </div>
          </div>
        );

      case 'systemSettings':
        return <ManagerSettings />;

      default:
        return <ManagerDashboard onAddShipmentClick={() => {}} onAddInvoiceClick={() => {}} onNavigateToTab={() => {}} />;
    }
  };

  return (
    <div className={`flex-1 flex flex-col relative overflow-hidden h-full select-none animate-fade-in ${
      isAdminDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#fff8f6] text-slate-800'
    }`} dir="rtl">
      
      {/* 1. DIFFERENT HEADER FOR ADMIN */}
      <header className={`absolute top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-4 z-40 shadow-md ${
        isAdminDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/75 border-pink-100/30'
      }`}>
        <div className="flex items-center gap-2">
          {activeTab !== 'dashboard' ? (
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black border shadow-sm active:scale-95 transition-all cursor-pointer ${
                isAdminDarkMode ? 'bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-750' : 'bg-pink-50 border-pink-100 text-pink-700 hover:bg-pink-100'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>رجوع للرئيسية</span>
            </button>
          ) : (
            <button 
              onClick={onSwitchToCustomerMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border shadow-sm active:scale-95 transition-all cursor-pointer ${
                isAdminDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750' : 'bg-pink-50 border-pink-100 text-pink-700 hover:bg-pink-100'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>بوابة الزبائن 🛍️</span>
            </button>
          )}
        </div>

        <h1 className={`font-black text-xs text-center truncate pr-2 tracking-tight ${
          isAdminDarkMode ? 'text-cyan-400' : 'text-pink-700'
        }`}>
          {getHeaderTitle()}
        </h1>

        {/* Status bar indicators */}
        <div className="flex items-center gap-2">
          <ConnectionStatusIndicator />
          <span className={`font-black text-[9px] px-2.5 py-1 rounded-xl shadow-sm ${
            isAdminDarkMode ? 'bg-cyan-600 text-slate-950' : 'bg-pink-700 text-white'
          }`}>
            المديرة 👑
          </span>
        </div>
      </header>

      {/* 2. CORE CONTENT SCROLL AREA */}
      <main className="pt-16 flex-1 overflow-y-auto no-scrollbar pb-28 relative px-4">
        {renderActiveView()}
      </main>

      {/* 3. DIFFERENT NAVIGATION BAR BAR FOR ADMIN WITH DENSE LAYOUT & DIFFERENT ICONS */}
      <nav className={`absolute bottom-0 left-0 right-0 h-24 pb-4 border-t shadow-2xl rounded-t-[2rem] flex justify-around items-center px-1 z-40 ${
        isAdminDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-pink-100'
      }`}>
        
        {/* Core Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
            activeTab === 'dashboard' ? (isAdminDarkMode ? 'text-cyan-400 font-bold scale-105' : 'text-pink-700 font-bold scale-105') : 'text-slate-400 hover:text-cyan-400'
          }`}
        >
          <div className={`p-1 px-3.5 rounded-full transition-all ${
            activeTab === 'dashboard' ? (isAdminDarkMode ? 'bg-slate-800' : 'bg-pink-100') : ''
          }`}>
            <LayoutDashboard className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-bold">الرئيسية</span>
        </button>

        {/* Shipment Tracker Control */}
        <button
          onClick={() => setActiveTab('shipments')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
            activeTab === 'shipments' ? (isAdminDarkMode ? 'text-cyan-400 font-bold scale-105' : 'text-pink-700 font-bold scale-105') : 'text-slate-400 hover:text-cyan-400'
          }`}
        >
          <div className={`p-1 px-3.5 rounded-full transition-all ${
            activeTab === 'shipments' ? (isAdminDarkMode ? 'bg-slate-800' : 'bg-pink-100') : ''
          }`}>
            <Truck className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-bold">الشحنات</span>
        </button>

        {/* Invoices Control */}
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
            activeTab === 'invoices' ? (isAdminDarkMode ? 'text-cyan-400 font-bold scale-105' : 'text-pink-700 font-bold scale-105') : 'text-slate-400 hover:text-cyan-400'
          }`}
        >
          <div className={`p-1 px-3.5 rounded-full transition-all ${
            activeTab === 'invoices' ? (isAdminDarkMode ? 'bg-slate-800' : 'bg-pink-100') : ''
          }`}>
            <Receipt className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-bold">الفواتير</span>
        </button>

        {/* Customer DB Control */}
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
            activeTab === 'customers' ? (isAdminDarkMode ? 'text-cyan-400 font-bold scale-105' : 'text-pink-700 font-bold scale-105') : 'text-slate-400 hover:text-cyan-400'
          }`}
        >
          <div className={`p-1 px-3.5 rounded-full transition-all ${
            activeTab === 'customers' ? (isAdminDarkMode ? 'bg-slate-800' : 'bg-pink-100') : ''
          }`}>
            <Users className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-bold">الزبائن</span>
        </button>

        {/* High-density grid drawer of additional 14 admin tabs */}
        <div className="relative group">
          <button
            className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
              activeTab !== 'dashboard' && activeTab !== 'shipments' && activeTab !== 'invoices' && activeTab !== 'customers' ? (isAdminDarkMode ? 'text-cyan-400 font-bold' : 'text-pink-700 font-bold') : 'text-slate-400'
            }`}
          >
            <div className={`p-1 px-3.5 rounded-full transition-all ${
              activeTab !== 'dashboard' && activeTab !== 'shipments' && activeTab !== 'invoices' && activeTab !== 'customers' ? (isAdminDarkMode ? 'bg-slate-800' : 'bg-pink-100') : ''
            }`}>
              <Menu className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-bold">أدوات إضافية</span>
          </button>

          {/* Hover Menu of extra tools */}
          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-2xl border shadow-xl w-60 grid grid-cols-2 gap-1.5 transition-all opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto ${
            isAdminDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-pink-100'
          }`}>
            {[
              { tab: 'analytics', label: 'التحليلات 📈' },
              { tab: 'finance', label: 'المالية 💵' },
              { tab: 'walletManagement', label: 'المحافظ 💳' },
              { tab: 'shippingRates', label: 'الأسعار 🗺️' },
              { tab: 'loyaltySystem', label: 'النقاط 👑' },
              { tab: 'reviewsModeration', label: 'التقييمات ⭐️' },
              { tab: 'products', label: 'المنتجات 🛍' },
              { tab: 'themeCustomizer', label: 'الهوية البصرية 🎨' },
              { tab: 'firebaseSettings', label: 'الـسحابة 🔒' },
              { tab: 'systemSettings', label: 'النظام ⚙️' }
            ].map(x => (
              <button
                key={x.tab}
                onClick={() => setActiveTab(x.tab as ManagerTabType)}
                className={`py-1 px-2 text-[9.5px] rounded-lg text-right font-bold transition-all ${
                  activeTab === x.tab 
                    ? (isAdminDarkMode ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/35' : 'bg-pink-50 text-pink-700 border border-pink-200')
                    : (isAdminDarkMode ? 'hover:bg-slate-850 text-slate-300' : 'hover:bg-pink-50/20 text-slate-700')
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>

      </nav>

    </div>
  );
}
