import React from 'react';
import { AppProvider, useApp, TabType } from './context/AppContext';
import { DEFAULT_AVATAR } from './utils/avatar';
import DashboardView from './components/DashboardView';
import TrackingView from './components/TrackingView';
import InvoiceView from './components/InvoiceView';
import ProfileView from './components/ProfileView';
import NotificationsView from './components/NotificationsView';
import ManagerPortal from './components/manager/ManagerPortal';
import HadooshaAssistant from './components/HadooshaAssistant';
import LoginModal from './components/LoginModal';
import IntroSplashScreen from './components/IntroSplashScreen';
import { Home, Truck, Receipt, User, Bell, ChevronRight, Loader2, LogOut, Sparkles } from 'lucide-react';
import { triggerLightHaptic, triggerSuccessHaptic, triggerWarningHaptic } from './utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { activeTab, setActiveTab, notifications, profile, loading, appMode, setAppMode, logout, isLoggedIn, setShowLoginModal } = useApp();
  const [pushToast, setPushToast] = React.useState<{ id?: string; title: string; content: string; image?: string; action?: string; type?: string } | null>(null);
  const [initialLoaded, setInitialLoaded] = React.useState<boolean>(false);
  const [showIntro, setShowIntro] = React.useState<boolean>(() => !sessionStorage.getItem('iramo_intro_dismissed'));

  // To avoid popping up existing unread notifications when the app starts,
  // we store the initial unread notification IDs.
  const initialUnreadIdsRef = React.useRef<Set<string>>(new Set());
  const isFirstLoadRef = React.useRef(true);

  // Monitor real-time notifications for incoming cloud push notifications
  React.useEffect(() => {
    if (loading) return;

    if (!initialLoaded) {
      // Record all existing unread notification IDs on first load
      const initialUnread = new Set<string>();
      notifications.forEach(n => {
        if (!n.read && n.id) {
          initialUnread.add(n.id);
        }
      });
      initialUnreadIdsRef.current = initialUnread;
      setInitialLoaded(true);
      return;
    }

    // Popup notification toast has been disabled to keep screen empty of popup alerts as requested.
    // Unread notifications are still logged and accessible via the notifications view.
  }, [notifications, loading, initialLoaded]);

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
      <div className="min-h-screen bg-[#fffdfc] flex flex-col items-center justify-center gap-4 text-pink-700 font-sans">
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
        return 'إيرامو ستور 🛍️';
      case 'tracking':
        return 'تتبع الشحنة';
      case 'invoices':
        return 'فواتيري والمالية';
      case 'profile':
        return 'الملف الشخصي';
      case 'notifications':
        return 'التنبيهات والمستجدات';
      default:
        return 'إيرامو ستور 🛍️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-100/30 via-rose-50/50 to-amber-50/20 flex items-center justify-center p-0 md:p-6 select-none font-sans" dir="rtl">
      
      {/* Premium ambient decorative elements for desktop background view */}
      <div className="absolute top-12 right-12 w-80 h-80 bg-pink-300/10 rounded-full blur-3xl pointer-events-none hidden md:block animate-pulse duration-5000" />
      <div className="absolute bottom-12 left-12 w-80 h-80 bg-amber-200/10 rounded-full blur-3xl pointer-events-none hidden md:block animate-pulse duration-7000" />

      {/* Main Telephone Mockup Frame */}
      <div className="w-full max-w-[430px] h-screen md:h-[860px] md:max-h-[92vh] flex flex-col bg-[#fffcfb] relative overflow-hidden md:rounded-[42px] md:border-[10px] md:border-neutral-900 md:shadow-[0_25px_60px_-15px_rgba(219,39,119,0.3)]">
        
        {/* Telephone top status bar/notch - Only on desktop */}
        <div className="hidden md:flex absolute top-0 left-0 right-0 h-7 bg-neutral-900 justify-between items-center px-6 text-[9.5px] text-white z-50 shrink-0 pointer-events-none select-none">
          <span className="font-bold">9:41 🛍️</span>
          <div className="w-24 h-4.5 bg-neutral-900 rounded-b-2xl absolute left-1/2 -translate-x-1/2 top-0"></div>
          <span className="font-bold flex items-center gap-1">📶 🔋</span>
        </div>

        {/* Adjust top spacing on desktop to account for telephone status bar */}
        <div className="flex-1 flex flex-col relative h-full md:pt-7 overflow-hidden">
          
          {/* 2. MAIN HEADER - Sticky at the top of the phone screen */}
          {appMode === 'customer' && (
            <header className="absolute top-0 left-0 right-0 h-16 border-b border-pink-100/30 flex items-center justify-between px-4 bg-[#fffcfb]/85 backdrop-blur-xl z-20 shadow-xs">
              <div className="flex items-center gap-1.5">
                {activeTab !== 'dashboard' && (
                  <button
                    onClick={() => { triggerLightHaptic(); setActiveTab('dashboard'); }}
                    className="w-8 h-8 flex items-center justify-center text-pink-700 hover:bg-pink-50 rounded-full transition-transform active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                <div className="text-right">
                  {activeTab === 'dashboard' ? (
                    <>
                      <span className="text-[8.5px] font-bold text-pink-600 block uppercase tracking-wider">لوحة التجربة الفورية</span>
                      <h1 className="text-xs sm:text-sm font-black text-pink-950 truncate max-w-[170px]">{getHeaderTitle()}</h1>
                    </>
                  ) : (
                    <h1 className="font-black text-xs sm:text-sm text-pink-950 truncate max-w-[170px]">{getHeaderTitle()}</h1>
                  )}
                </div>
              </div>

              {/* Live status indicators & Avatar action controls */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold text-pink-950/70 bg-pink-100/30 px-2 py-0.5 rounded-full">{liveTime}</span>
                <button
                  onClick={() => { triggerLightHaptic(); setActiveTab('profile'); }}
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-pink-100 shadow-xs hover:border-pink-300 transition-all active:scale-95 flex items-center justify-center bg-white"
                >
                  <img
                    alt="User Profile"
                    className="w-full h-full object-cover"
                    src={profile?.avatar || DEFAULT_AVATAR}
                    referrerPolicy="no-referrer"
                  />
                </button>
              </div>
            </header>
          )}

          {/* 3. CORE CONTENT AREA - Scrollable inside the telephone mockup */}
          <main className={`flex-1 overflow-y-auto no-scrollbar relative bg-[#fffcfb] ${appMode === 'customer' ? 'pt-16 pb-18 px-4' : 'h-full'}`}>
            {appMode === 'manager' ? (
              <ManagerPortal onSwitchToCustomerMode={() => handleSwitchMode('customer')} />
            ) : (
              renderActiveView()
            )}
          </main>

          {/* 4. BOTTOM NAVIGATION TAB BAR */}
          {appMode === 'customer' && (
            <nav className="absolute bottom-0 left-0 right-0 h-18 bg-white/95 backdrop-blur-md border-t border-pink-100/20 shadow-[0_-8px_30px_rgba(219,39,119,0.06)] flex justify-around items-center px-1 z-40">
              <button
                onClick={() => { triggerLightHaptic(); setActiveTab('dashboard'); }}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  activeTab === 'dashboard' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
                }`}
              >
                <div className={`p-1 px-3.5 rounded-full transition-all ${activeTab === 'dashboard' ? 'bg-pink-50' : ''}`}>
                  <Home className="w-4.5 h-4.5" />
                </div>
                <span className="text-[9px] font-bold">الرئيسية</span>
              </button>

              <button
                onClick={() => { triggerLightHaptic(); setActiveTab('tracking'); }}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  activeTab === 'tracking' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
                }`}
              >
                <div className={`p-1 px-3.5 rounded-full transition-all ${activeTab === 'tracking' ? 'bg-pink-50' : ''}`}>
                  <Truck className="w-4.5 h-4.5" />
                </div>
                <span className="text-[9px] font-bold">الشحنات</span>
              </button>

              <button
                onClick={() => { triggerLightHaptic(); setActiveTab('invoices'); }}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  activeTab === 'invoices' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
                }`}
              >
                <div className={`p-1 px-3.5 rounded-full transition-all ${activeTab === 'invoices' ? 'bg-pink-50' : ''}`}>
                  <Receipt className="w-4.5 h-4.5" />
                </div>
                <span className="text-[9px] font-bold">الفواتير</span>
              </button>

              <button
                onClick={() => { triggerLightHaptic(); setActiveTab('profile'); }}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  activeTab === 'profile' ? 'text-pink-700 scale-105 font-bold' : 'text-gray-400 hover:text-pink-700'
                }`}
              >
                <div className={`p-1 px-3.5 rounded-full transition-all ${activeTab === 'profile' ? 'bg-pink-50' : ''}`}>
                  <User className="w-4.5 h-4.5" />
                </div>
                <span className="text-[9px] font-bold">حسابي</span>
              </button>
            </nav>
          )}

        </div>

      </div>

      {/* Floating Hadoosha Assistant */}
      <HadooshaAssistant />

      {/* Elegant Login Modal Portal */}
      <LoginModal />

      {/* Intro Splash Screen */}
      <AnimatePresence>
        {showIntro && (
          <IntroSplashScreen
            onDismiss={() => setShowIntro(false)}
            onLoginTrigger={() => setShowLoginModal(true)}
            isLoggedIn={isLoggedIn}
          />
        )}
      </AnimatePresence>
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
