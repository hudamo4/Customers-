import React from 'react';
import { AppProvider, useApp, TabType } from './context/AppContext';
import DashboardView from './components/DashboardView';
import TrackingView from './components/TrackingView';
import InvoiceView from './components/InvoiceView';
import ProfileView from './components/ProfileView';
import NotificationsView from './components/NotificationsView';
import ManagerPortal from './components/manager/ManagerPortal';
import HadooshaAssistant from './components/HadooshaAssistant';
import LoginModal from './components/LoginModal';
import { Home, Truck, Receipt, User, Bell, ChevronRight, Menu, Loader2, ArrowRightLeft, Smartphone, Monitor, LayoutGrid, LogOut } from 'lucide-react';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic, triggerWarningHaptic } from './utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { activeTab, setActiveTab, notifications, profile, loading, appMode, setAppMode, logout } = useApp();
  const [pushToast, setPushToast] = React.useState<{ id?: string; title: string; content: string; image?: string; action?: string; type?: string } | null>(null);
  const [initialLoaded, setInitialLoaded] = React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);

  // Layout mode state: 'phone' | 'desktop' | 'responsive'
  const [layoutMode, setLayoutMode] = React.useState<'phone' | 'desktop' | 'responsive'>(() => {
    const saved = localStorage.getItem('iramo_layout_mode');
    return (saved as any) || 'responsive';
  });

  const [isMobileSize, setIsMobileSize] = React.useState<boolean>(false);

  React.useEffect(() => {
    localStorage.setItem('iramo_layout_mode', layoutMode);
  }, [layoutMode]);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileSize(window.innerWidth < 820);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    triggerSuccessHaptic();
    setTimeout(() => {
      setIsRefreshing(false);
      triggerLightHaptic();
    }, 1200);
  };

  // Monitor real-time notifications for incoming cloud push notifications
  React.useEffect(() => {
    if (!loading && !initialLoaded) {
      setInitialLoaded(true);
      return;
    }

    if (initialLoaded && notifications.length > 0) {
      const latest = notifications[0];
      if (latest && !latest.read && latest.id !== pushToast?.id) {
        setPushToast({
          id: latest.id,
          title: latest.title,
          content: latest.content,
          image: latest.image,
          action: latest.action,
          type: latest.type
        });

        // Trigger warning haptic for real-time alert
        triggerWarningHaptic();

        // Play gentle magical alert sound
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-120.wav");
        audio.volume = 0.15;
        audio.play().catch(() => {});

        const timer = setTimeout(() => {
          setPushToast(null);
        }, 8000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, loading, initialLoaded, pushToast?.id]);

  const handleSwitchMode = (mode: 'customer' | 'manager') => {
    setAppMode(mode);
  };

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [liveTime, setLiveTime] = React.useState<string>('');

  React.useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'م' : 'ص';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setLiveTime(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-pink-50 to-pink-100 flex flex-col items-center justify-center gap-4 text-pink-700 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
        <p className="text-sm font-black animate-pulse">جاري تحضير مفاجآتكِ الأنيقة...</p>
      </div>
    );
  }

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

  const showDesktopStyle = layoutMode === 'desktop' || (layoutMode === 'responsive' && !isMobileSize);

  // Render Layout Switcher floating on top of the browser viewport
  const renderLayoutSwitcher = () => (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 p-1 rounded-full bg-slate-900/95 text-white backdrop-blur-md shadow-[0_10px_30px_rgba(219,39,119,0.25)] border border-white/10 text-xs">
      <button
        onClick={() => { triggerLightHaptic(); setLayoutMode('responsive'); }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all ${
          layoutMode === 'responsive'
            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">متجاوب تلقائي</span>
        <span className="sm:hidden text-[10px]">تلقائي</span>
      </button>

      <button
        onClick={() => { triggerLightHaptic(); setLayoutMode('phone'); }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all ${
          layoutMode === 'phone'
            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">عرض الهاتف</span>
        <span className="sm:hidden text-[10px]">جوال</span>
      </button>

      <button
        onClick={() => { triggerLightHaptic(); setLayoutMode('desktop'); }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all ${
          layoutMode === 'desktop'
            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Monitor className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">عرض الحاسوب</span>
        <span className="sm:hidden text-[10px]">حاسوب</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#fee2e3] via-[#fcebeb] to-[#fcebec] flex flex-col items-center justify-center p-0 sm:p-4 select-none relative pt-16 sm:pt-20" dir="rtl">
      
      {/* Floating Layout Controller */}
      {renderLayoutSwitcher()}

      {showDesktopStyle ? (
        /* ==================== DESKTOP WIDESCREEN SIDEBAR LAYOUT ==================== */
        <div className="w-full max-w-6xl h-[88vh] min-h-[580px] max-h-[900px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-pink-100 flex overflow-hidden relative select-none animate-fade-in">
          
          {/* Desktop Right Sidebar (RTL) */}
          <aside className="w-64 bg-slate-900 text-white shrink-0 p-6 flex flex-col justify-between border-l border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              {/* Brand Header */}
              <div className="flex flex-col gap-1 text-right border-b border-white/5 pb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛍️</span>
                  <span className="font-black text-lg bg-gradient-to-r from-pink-200 via-rose-200 to-amber-100 bg-clip-text text-transparent">إيرامو ستور</span>
                </div>
                <span className="text-[10px] text-pink-300 font-extrabold tracking-wide">بوابتكِ الخاصة للأناقة والجمال</span>
              </div>

              {/* Sidebar Navigation */}
              <nav className="flex flex-col gap-1.5">
                {[
                  { id: 'dashboard', label: 'الرئيسية والخدمات', icon: <Home className="w-4 h-4" /> },
                  { id: 'tracking', label: 'تتبع الشحنات', icon: <Truck className="w-4 h-4" /> },
                  { id: 'invoices', label: 'الفواتير والمالية', icon: <Receipt className="w-4 h-4" /> },
                  { id: 'notifications', label: 'التنبيهات والمستجدات', icon: <Bell className="w-4 h-4" />, badge: unreadCount > 0 ? unreadCount : null },
                  { id: 'profile', label: 'الملف الشخصي', icon: <User className="w-4 h-4" /> }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { triggerLightHaptic(); setActiveTab(tab.id as any); }}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-600 to-pink-800 text-white shadow-md shadow-pink-600/10 scale-102'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {tab.icon}
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span className="w-4 h-4 bg-pink-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar bottom Profile Card */}
            <div className="border-t border-white/5 pt-4 relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <img
                  alt="Profile"
                  className="w-9 h-9 rounded-full border border-pink-500/30 object-cover"
                  src={profile?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9EaYCDGI3nnclPO4Dfn8I8RZWRNVEKBUb-qxzppoUDSSF0uOYRcTHzQEOvzXtqZyk5bVh4idglS262c_ZUgYdgA-h1OorPVThxh8UXI7GHoH2uDEhbQg2eVlFMYU4isBKM9I_0LSyYdiFMT_ttIH-xYE0KuXOFy-Kz_UIlEMn-XC4L9y1Vol5VvGdb1i51-vz5DCQ3rO23XQP4xhX_1niZMeMM8D-RuEUU1U-r7VqHSMTCi7iILOoNy4WG-WS3v4pxciGg6Rk_QE'}
                  referrerPolicy="no-referrer"
                />
                <div className="text-right min-w-0">
                  <h4 className="text-xs font-black text-white truncate">{profile?.name || 'زائرة أنيقة'}</h4>
                  <p className="text-[10px] text-pink-300 font-bold truncate">{profile?.membership || 'عضوية أساسية'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { triggerLightHaptic(); setAppMode(appMode === 'customer' ? 'manager' : 'customer'); }}
                  className="py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black text-pink-200 transition-all text-center cursor-pointer border border-white/5"
                >
                  {appMode === 'customer' ? 'لوحة المديرة' : 'بوابة الزبونة'}
                </button>
                <button
                  onClick={() => { triggerLightHaptic(); logout(); }}
                  className="py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-[9px] font-black text-rose-300 transition-all text-center cursor-pointer border border-rose-500/10 flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>خروج</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main content pane */}
          <div className="flex-1 flex flex-col h-full bg-[#fff8f6] relative overflow-hidden">
            <header className="h-16 border-b border-pink-100/30 flex items-center justify-between px-6 bg-white/60 backdrop-blur-xl z-20 shrink-0">
              <div className="flex items-center gap-2">
                {activeTab !== 'dashboard' ? (
                  <button
                    onClick={() => { triggerLightHaptic(); setActiveTab('dashboard'); }}
                    className="w-8 h-8 flex items-center justify-center text-pink-700 hover:bg-pink-50 rounded-full transition-transform active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">لوحة التحكم السريعة</span>
                    <h2 className="text-sm font-black text-pink-950">{getHeaderTitle()}</h2>
                  </div>
                )}
                {activeTab !== 'dashboard' && (
                  <h1 className="font-black text-base text-pink-950">{getHeaderTitle()}</h1>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-pink-950/60 bg-pink-100/30 px-3 py-1 rounded-full">{liveTime}</span>
                <div className="relative">
                  <button
                    onClick={() => { triggerLightHaptic(); setActiveTab('notifications'); }}
                    className={`p-2 rounded-full transition-all relative ${
                      activeTab === 'notifications' ? 'bg-pink-100 text-pink-700' : 'text-gray-500 hover:text-pink-700 bg-gray-50'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-700 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-6 relative">
              {appMode === 'manager' ? (
                <ManagerPortal onSwitchToCustomerMode={() => handleSwitchMode('customer')} />
              ) : (
                renderActiveView()
              )}
            </main>
          </div>
        </div>
      ) : (
        /* ==================== SMARTPHONE / NATIVE MOBILE PORTRAIT LAYOUT ==================== */
        <div 
          className={
            layoutMode === 'phone'
              ? "relative w-full max-w-[420px] h-[90vh] min-h-[580px] max-h-[850px] rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border-[8px] sm:border-[12px] border-pink-900/15 bg-[#fff8f6] text-gray-800 flex flex-col overflow-hidden ring-4 sm:ring-8 ring-white/25 animate-fade-in"
              : "relative w-full h-[95vh] sm:h-[90vh] bg-[#fff8f6] text-gray-800 flex flex-col overflow-hidden animate-fade-in sm:max-w-[480px] sm:rounded-[2rem] sm:shadow-lg sm:border sm:border-pink-100"
          }
        >
          {/* Top Notch / Simulated iOS Status Bar - Only shown in phone emulation mode or on screens simulated to feel like iOS */}
          <div className="flex sticky top-0 inset-x-0 h-10 bg-white/45 backdrop-blur-md items-center justify-between px-6 z-50 shrink-0 select-none border-b border-pink-100/10">
            <span className="text-[10px] font-bold text-pink-950/80">{liveTime || '10:45 ص'}</span>
            
            <div className="flex w-24 h-5.5 bg-black rounded-full items-center justify-center gap-1.5 px-3">
              <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping"></span>
              <span className="text-[7.5px] text-pink-200 font-extrabold truncate">IRAMO LIVE</span>
            </div>

            <div className="flex items-center gap-1.5 text-pink-950/80 text-[10px]" />
          </div>

          {/* Core content view */}
          {appMode === 'manager' ? (
            <ManagerPortal onSwitchToCustomerMode={() => handleSwitchMode('customer')} />
          ) : (
            <div className="flex-1 flex flex-col relative overflow-hidden">
              {/* Dynamic Header */}
              <header className="absolute top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-xl border-b border-pink-100/30 flex items-center justify-between px-4 z-40 shadow-sm">
                <div className="flex items-center gap-2">
                  {activeTab !== 'dashboard' ? (
                    <button
                      onClick={() => { triggerLightHaptic(); setActiveTab('dashboard'); }}
                      className="w-10 h-10 flex items-center justify-center text-pink-700 hover:bg-pink-50 rounded-full transition-transform active:scale-95"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-pink-700 font-extrabold text-sm select-none">
                      <span>إيرامو ستور 🛍️</span>
                    </div>
                  )}
                  {activeTab !== 'dashboard' && (
                    <h1 className="font-bold text-base text-pink-700 tracking-tight">{getHeaderTitle()}</h1>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Notification Icon */}
                  <button
                    onClick={() => { triggerLightHaptic(); setActiveTab('notifications'); }}
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
                    onClick={() => { triggerLightHaptic(); setActiveTab('profile'); }}
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
              <main className="pt-16 flex-1 overflow-y-auto no-scrollbar pb-24 relative px-4">
                {renderActiveView()}
              </main>

              {/* Shared Bottom Tab Navigation Bar */}
              <nav className="absolute bottom-0 left-0 right-0 h-24 pb-4 bg-white/95 backdrop-blur-2xl border-t border-pink-100/20 shadow-lg rounded-t-[2rem] flex justify-around items-center px-4 z-40">
                <button
                  onClick={() => { triggerLightHaptic(); setActiveTab('dashboard'); }}
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
                  onClick={() => { triggerLightHaptic(); setActiveTab('tracking'); }}
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
                  onClick={() => { triggerLightHaptic(); setActiveTab('invoices'); }}
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
                  onClick={() => { triggerLightHaptic(); setActiveTab('profile'); }}
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
          )}

          {/* iPhone Home Indicator Line */}
          {layoutMode === 'phone' && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-pink-950/20 rounded-full z-50" />
          )}
        </div>
      )}

      {/* Floating Hadoosha Assistant */}
      <HadooshaAssistant />

      {/* Luxury Login Portal Modal */}
      <LoginModal />
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
