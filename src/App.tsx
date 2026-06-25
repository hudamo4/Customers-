import React from 'react';
import { AppProvider, useApp, TabType } from './context/AppContext';
import DashboardView from './components/DashboardView';
import TrackingView from './components/TrackingView';
import InvoiceView from './components/InvoiceView';
import ProfileView from './components/ProfileView';
import NotificationsView from './components/NotificationsView';
import { Home, Truck, Receipt, User, Bell, ChevronRight, Menu, Loader2 } from 'lucide-react';

function AppContent() {
  const { activeTab, setActiveTab, notifications, profile, loading } = useApp();

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'tracking':
        return <TrackingView />;
      case 'invoices':
        return <InvoiceView />;
      case 'profile':
        return <ProfileView />;
      case 'notifications':
        return <NotificationsView />;
      default:
        return <DashboardView />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'IRAMO STORE';
      case 'tracking':
        return 'تتبع الشحنة';
      case 'invoices':
        return 'فواتيري';
      case 'profile':
        return 'الملف الشخصي';
      case 'notifications':
        return 'التنبيهات';
      default:
        return 'IRAMO STORE';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8f6] flex flex-col items-center justify-center gap-4 text-pink-700">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="text-sm font-semibold animate-pulse">جاري تحضير مفاجآتكِ الأنيقة...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f6] text-gray-800 pb-12 select-none">
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-xl border-b border-pink-100/30 flex items-center justify-between px-4 z-50 shadow-sm max-w-lg mx-auto rounded-b-2xl">
        <div className="flex items-center gap-2">
          {activeTab !== 'dashboard' ? (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-10 h-10 flex items-center justify-center text-pink-700 hover:bg-pink-50 rounded-full transition-transform active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center text-pink-700">
              <Menu className="w-5 h-5" />
            </div>
          )}
          <h1 className="font-bold text-base text-pink-700 tracking-tight">{getHeaderTitle()}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Icon */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`relative p-2 rounded-full transition-all active:scale-95 ${
              activeTab === 'notifications' ? 'bg-pink-100 text-pink-700' : 'text-gray-500 hover:text-pink-700'
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-pink-700 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <button
            onClick={() => setActiveTab('profile')}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-pink-100 shadow-sm transition-all active:scale-95"
          >
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src={profile?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9EaYCDGI3nnclPO4Dfn8I8RZWRNVEKBUb-qxzppoUDSSF0uOYRcTHzQEOvzXtqZyk5bVh4idglS262c_ZUgYdgA-h1OorPVThxh8UXI7GHoH2uDEhbQg2eVlFMYU4isBKM9I_0LSyYdiFMT_ttIH-xYE0KuXOFy-Kz_UIlEMn-XC4L9y1Vol5VvGdb1i51-vz5DCQ3rO23XQP4xhX_1niZMeMM8D-RuEUU1U-r7VqHSMTCi7iILOoNy4WG-WS3v4pxciGg6Rk_QE'}
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-20 px-4 max-w-lg mx-auto pb-24">
        {renderActiveView()}
      </main>

      {/* Shared Bottom Tab Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-2xl border-t border-pink-100/20 shadow-lg rounded-t-[2rem] flex justify-around items-center px-4 z-50 max-w-lg mx-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            activeTab === 'dashboard' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-4 rounded-full transition-all ${activeTab === 'dashboard' ? 'bg-pink-100' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('tracking');
          }}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            activeTab === 'tracking' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-4 rounded-full transition-all ${activeTab === 'tracking' ? 'bg-pink-100' : ''}`}>
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">الشحنات</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            activeTab === 'invoices' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-4 rounded-full transition-all ${activeTab === 'invoices' ? 'bg-pink-100' : ''}`}>
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">الفواتير</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            activeTab === 'profile' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
          }`}
        >
          <div className={`p-1 px-4 rounded-full transition-all ${activeTab === 'profile' ? 'bg-pink-100' : ''}`}>
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">حسابي</span>
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
