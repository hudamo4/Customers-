import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Receipt, 
  Users, 
  TrendingUp, 
  Settings, 
  ArrowRightLeft,
  ChevronRight,
  Bell,
  Menu,
  Palette
} from 'lucide-react';

// Import subcomponents
import ManagerDashboard from './ManagerDashboard';
import ManagerShipments from './ManagerShipments';
import ManagerInvoices from './ManagerInvoices';
import ManagerCustomers from './ManagerCustomers';
import ManagerProfits from './ManagerProfits';
import ManagerSettings from './ManagerSettings';
import ManagerVisualIdentity from './ManagerVisualIdentity';
import ManagerNotifications from './ManagerNotifications';

interface ManagerPortalProps {
  onSwitchToCustomerMode: () => void;
}

type ManagerTabType = 'dashboard' | 'shipments' | 'invoices' | 'customers' | 'profits' | 'settings' | 'generalSettings' | 'visualIdentity' | 'notifications';

export default function ManagerPortal({ onSwitchToCustomerMode }: ManagerPortalProps) {
  const [activeTab, setActiveTab] = useState<ManagerTabType>('dashboard');

  // Trigger modals on dashboard click
  const [triggerAddShipment, setTriggerAddShipment] = useState<number>(0);
  const [triggerAddInvoice, setTriggerAddInvoice] = useState<number>(0);

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'لوحة تحكم المديرة';
      case 'shipments':
        return 'إدارة الشحنات النشطة';
      case 'invoices':
        return 'إدارة الفواتير والتحصيل';
      case 'customers':
        return 'دليل زبونات إيرامو';
      case 'profits':
        return 'تقارير الأرباح والمبيعات';
      case 'settings':
        return 'أدوات الإدارة والضبط 👑';
      case 'generalSettings':
        return 'إعدادات متجر إيرامو';
      case 'visualIdentity':
        return 'مركز الهوية البصرية والسمات';
      case 'notifications':
        return 'مركز إدارة التنبيهات الفاخرة';
      default:
        return 'بوابة الإدارة الموحدة';
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ManagerDashboard 
            onAddShipmentClick={() => {
              setActiveTab('shipments');
              // Briefly delay or trigger status
              setTimeout(() => {
                const addBtn = document.querySelector('[placeholder="البحث برقم التتبع أو الحالة..."]')?.parentElement?.querySelector('button');
                if (addBtn) (addBtn as HTMLButtonElement).click();
              }, 100);
            }}
            onAddInvoiceClick={() => {
              setActiveTab('invoices');
              setTimeout(() => {
                const addBtn = document.querySelector('[placeholder="البحث برقم الفاتورة، المتجر، أو الطلب..."]')?.parentElement?.querySelector('button');
                if (addBtn) (addBtn as HTMLButtonElement).click();
              }, 100);
            }}
            onNavigateToTab={(tab) => {
              // Map legacy settings or profits navigation nicely
              if (tab === 'settings') {
                setActiveTab('generalSettings');
              } else {
                setActiveTab(tab as ManagerTabType);
              }
            }}
          />
        );
      case 'shipments':
        return <ManagerShipments />;
      case 'invoices':
        return <ManagerInvoices />;
      case 'customers':
        return <ManagerCustomers />;
      case 'profits':
        return <ManagerProfits />;
      case 'settings':
        return (
          <div className="space-y-6 pt-4 pb-12 text-right" dir="rtl">
            {/* Header / Intro Card */}
            <div className="bg-gradient-to-r from-pink-600 to-pink-800 text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none animate-pulse" />
              <h2 className="text-xs font-black mb-1">لوحة الأدوات والضبط المتقدم 👑</h2>
              <p className="text-[10px] text-pink-100 font-semibold leading-relaxed">
                مرحباً بكِ يا ملكة المتجر هدوشة في مركز التحكم الكامل بالتطبيق والواجهات والبنرات.
              </p>
            </div>

            {/* Premium Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card 1: Visual Identity & Banner Edits */}
              <button
                onClick={() => setActiveTab('visualIdentity')}
                className="bg-white hover:bg-pink-50/20 border border-pink-100 p-5 rounded-3xl flex flex-col items-center justify-center text-center gap-2.5 transition-all active:scale-[0.97] hover:border-pink-300 shadow-xs cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-pink-100/60 text-pink-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  🎨
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-pink-950">تعديل الواجهات والبنرات</h4>
                  <p className="text-[8.5px] text-gray-400 font-bold">الهوية البصرية والبنرات</p>
                </div>
              </button>

              {/* Card 2: Store General Settings */}
              <button
                onClick={() => setActiveTab('generalSettings')}
                className="bg-white hover:bg-pink-50/20 border border-pink-100 p-5 rounded-3xl flex flex-col items-center justify-center text-center gap-2.5 transition-all active:scale-[0.97] hover:border-pink-300 shadow-xs cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100/60 text-amber-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  ⚙️
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-pink-950">إعدادات المتجر العامة</h4>
                  <p className="text-[8.5px] text-gray-400 font-bold">الماركات والمحافظات والأسعار</p>
                </div>
              </button>

              {/* Card 3: Notification Center */}
              <button
                onClick={() => setActiveTab('notifications')}
                className="bg-white hover:bg-pink-50/20 border border-pink-100 p-5 rounded-3xl flex flex-col items-center justify-center text-center gap-2.5 transition-all active:scale-[0.97] hover:border-pink-300 shadow-xs cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100/60 text-blue-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  🔔
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-pink-950">مركز التنبيهات الفاخرة</h4>
                  <p className="text-[8.5px] text-gray-400 font-bold">إرسال إشعارات جماعية للزبونات</p>
                </div>
              </button>

              {/* Card 4: Profit Reports */}
              <button
                onClick={() => setActiveTab('profits')}
                className="bg-white hover:bg-pink-50/20 border border-pink-100 p-5 rounded-3xl flex flex-col items-center justify-center text-center gap-2.5 transition-all active:scale-[0.97] hover:border-pink-300 shadow-xs cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 text-emerald-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  📈
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black text-pink-950">تقارير الأرباح والمبيعات</h4>
                  <p className="text-[8.5px] text-gray-400 font-bold">رؤية تفصيلية للأرباح والنمو</p>
                </div>
              </button>
            </div>

            {/* Quick Helper Banner */}
            <div className="bg-pink-50/30 rounded-2xl p-4 border border-dashed border-pink-200 flex gap-3 items-center text-right" dir="rtl">
              <div className="w-9 h-9 flex-shrink-0 rounded-full overflow-hidden bg-white border border-pink-100 p-1">
                <img 
                  alt="Mascot Hadoosha" 
                  className="w-full h-full object-contain" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9EaYCDGI3nnclPO4Dfn8I8RZWRNVEKBUb-qxzppoUDSSF0uOYRcTHzQEOvzXtqZyk5bVh4idglS262c_ZUgYdgA-h1OorPVThxh8UXI7GHoH2uDEhbQg2eVlFMYU4isBKM9I_0LSyYdiFMT_ttIH-xYE0KuXOFy-Kz_UIlEMn-XC4L9y1Vol5VvGdb1i51-vz5DCQ3rO23XQP4xhX_1niZMeMM8D-RuEUU1U-r7VqHSMTCi7iILOoNy4WG-WS3v4pxciGg6Rk_QE"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-[10px] font-black text-pink-900">ملاحظة من هدوشة ✨</h5>
                <p className="text-[9px] text-gray-500 font-semibold leading-relaxed mt-0.5">
                  جميع هذه التعديلات تحفظ فورياً في السحابة وتنعكس في واجهة زبونات متجركِ الراقيـات في نفس اللحظة!
                </p>
              </div>
            </div>
          </div>
        );
      case 'generalSettings':
        return <ManagerSettings />;
      case 'visualIdentity':
        return <ManagerVisualIdentity />;
      case 'notifications':
        return <ManagerNotifications />;
      default:
        return <ManagerDashboard onAddShipmentClick={() => {}} onAddInvoiceClick={() => {}} onNavigateToTab={() => {}} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-full bg-[#fff8f6] text-gray-800 select-none animate-fade-in" dir="rtl">
      
      {/* Header bar */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-white/75 backdrop-blur-xl border-b border-pink-100/30 flex items-center justify-between px-4 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          {activeTab === 'generalSettings' || activeTab === 'visualIdentity' || activeTab === 'notifications' || activeTab === 'profits' ? (
            <button 
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-1 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-[10px] font-black border border-pink-100 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>رجوع للمزيد</span>
            </button>
          ) : (
            <button 
              onClick={onSwitchToCustomerMode}
              className="flex items-center gap-1.5 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-[10px] font-black border border-pink-100 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>بوابة الزبائن</span>
            </button>
          )}
        </div>

        <h1 className="font-black text-xs text-pink-700 tracking-tight text-center truncate pr-2">
          {getHeaderTitle()}
        </h1>

        <div className="flex items-center gap-2">
          <span className="bg-pink-700 text-white font-black text-[9px] px-2.5 py-1 rounded-xl shadow-sm">
            المديرة 👑
          </span>
        </div>
      </header>

      {/* Main Container - independently scrollable */}
      <main className="pt-16 flex-1 overflow-y-auto no-scrollbar pb-24 relative px-4">
        {renderActiveView()}
      </main>

      {/* Manager Specific Navigation - Sticky 5-Tab bar at the bottom */}
      <nav className="absolute bottom-0 left-0 right-0 h-24 pb-4 bg-white/95 backdrop-blur-2xl border-t border-pink-100/30 shadow-lg rounded-t-[2rem] flex justify-around items-center px-1 z-40">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
            activeTab === 'dashboard' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-3.5 rounded-full transition-all ${activeTab === 'dashboard' ? 'bg-pink-100' : ''}`}>
            <LayoutDashboard className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-bold">الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab('shipments')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
            activeTab === 'shipments' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-3.5 rounded-full transition-all ${activeTab === 'shipments' ? 'bg-pink-100' : ''}`}>
            <Truck className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-bold">الشحنات</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
            activeTab === 'invoices' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-3.5 rounded-full transition-all ${activeTab === 'invoices' ? 'bg-pink-100' : ''}`}>
            <Receipt className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-bold">الفواتير</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
            activeTab === 'customers' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-3.5 rounded-full transition-all ${activeTab === 'customers' ? 'bg-pink-100' : ''}`}>
            <Users className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-bold">الزبائن</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
            activeTab === 'settings' || activeTab === 'generalSettings' || activeTab === 'visualIdentity' || activeTab === 'notifications' || activeTab === 'profits' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-3.5 rounded-full transition-all ${activeTab === 'settings' || activeTab === 'generalSettings' || activeTab === 'visualIdentity' || activeTab === 'notifications' || activeTab === 'profits' ? 'bg-pink-100' : ''}`}>
            <Menu className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-bold">المزيد</span>
        </button>
      </nav>

    </div>
  );
}
