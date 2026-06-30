import React from 'react';
import { AppProvider, useApp, TabType } from './context/AppContext';
import { DEFAULT_AVATAR } from './utils/avatar';
import DashboardView from './components/DashboardView';
import TrackingView from './components/TrackingView';
import InvoiceView from './components/InvoiceView';
import ProfileView from './components/ProfileView';
import NotificationsView from './components/NotificationsView';
import CustomerPortal from './components/CustomerPortal';
import ManagerPortal from './components/manager/ManagerPortal';
import AdminLockScreen from './components/manager/AdminLockScreen';
import HadooshaAssistant from './components/HadooshaAssistant';
import LoginModal from './components/LoginModal';
import IntroSplashScreen from './components/IntroSplashScreen';
import { Home, Truck, Receipt, User, Bell, ChevronRight, Loader2, LogOut, Sparkles } from 'lucide-react';
import { triggerLightHaptic, triggerSuccessHaptic, triggerWarningHaptic } from './utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { activeTab, setActiveTab, notifications, profile, loading, appMode, setAppMode, logout, isLoggedIn, setShowLoginModal, customizations } = useApp();
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

  const [isManagerUnlocked, setIsManagerUnlocked] = React.useState<boolean>(false);

  const handleSwitchMode = (mode: 'customer' | 'manager') => {
    if (mode === 'customer') {
      setIsManagerUnlocked(false);
    }
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
          {appMode === 'manager' ? (
            isManagerUnlocked ? (
              <ManagerPortal onSwitchToCustomerMode={() => handleSwitchMode('customer')} />
            ) : (
              <AdminLockScreen 
                onUnlock={() => setIsManagerUnlocked(true)} 
                onCancel={() => handleSwitchMode('customer')} 
              />
            )
          ) : (
            <CustomerPortal 
              onSwitchToAdmin={() => handleSwitchMode('manager')} 
              showAdminPasscode={() => {
                if (profile?.role === 'admin') {
                  handleSwitchMode('manager');
                } else {
                  setShowLoginModal(true);
                }
              }} 
            />
          )}
        </div>

      </div>

      {/* Floating Hadoosha Assistant */}
      <HadooshaAssistant />

      {/* Elegant Login Modal Portal */}
      <LoginModal />

      {/* Intro Splash Screen */}
      <AnimatePresence>
        {showIntro && customizations?.showOnboarding !== false && (
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
