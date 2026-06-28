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

type ManagerTabType = 'dashboard' | 'shipments' | 'invoices' | 'customers' | 'profits' | 'settings' | 'visualIdentity' | 'notifications';

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
            onNavigateToTab={(tab) => setActiveTab(tab as ManagerTabType)}
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
          <button 
            onClick={onSwitchToCustomerMode}
            className="flex items-center gap-1.5 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-[10px] font-black border border-pink-100 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>بوابة الزبائن</span>
          </button>
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

      {/* Manager Specific Navigation - Sticky at the bottom */}
      <nav className="absolute bottom-0 left-0 right-0 h-24 pb-4 bg-white/95 backdrop-blur-2xl border-t border-pink-100/30 shadow-lg rounded-t-[2rem] flex justify-around items-center px-1 z-40">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
            activeTab === 'dashboard' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-2 rounded-full transition-all ${activeTab === 'dashboard' ? 'bg-pink-100' : ''}`}>
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
          <div className={`p-1 px-2 rounded-full transition-all ${activeTab === 'shipments' ? 'bg-pink-100' : ''}`}>
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
          <div className={`p-1 px-2 rounded-full transition-all ${activeTab === 'invoices' ? 'bg-pink-100' : ''}`}>
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
          <div className={`p-1 px-2 rounded-full transition-all ${activeTab === 'customers' ? 'bg-pink-100' : ''}`}>
            <Users className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-bold">الزبائن</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
            activeTab === 'notifications' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-2 rounded-full transition-all ${activeTab === 'notifications' ? 'bg-pink-100' : ''}`}>
            <Bell className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-bold">الإشعارات</span>
        </button>

        <button
          onClick={() => setActiveTab('visualIdentity')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
            activeTab === 'visualIdentity' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-2 rounded-full transition-all ${activeTab === 'visualIdentity' ? 'bg-pink-100' : ''}`}>
            <Palette className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-bold">الهوية</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
            activeTab === 'settings' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-2 rounded-full transition-all ${activeTab === 'settings' ? 'bg-pink-100' : ''}`}>
            <Settings className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] font-bold">الإعدادات</span>
        </button>
      </nav>

    </div>
  );
}
