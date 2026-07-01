import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Truck, Receipt, Gift, Sparkles, CheckSquare, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic, triggerWarningHaptic } from '../utils/haptics';

export default function NotificationsView() {
  const { 
    notifications, 
    markAllNotificationsAsRead, 
    markNotificationAsRead, 
    setActiveTab, 
    shipments, 
    updateShipmentStatus, 
    addNotification, 
    customizations 
  } = useApp();
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'shipment' | 'invoice' | 'offer'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alertToast, setAlertToast] = useState({ show: false, title: '', message: '' });

  const filteredNotifications = notifications.filter((notif) => {
    // Apply filter tab
    let matchesFilter = true;
    if (activeFilter === 'offer') {
      matchesFilter = ['offer', 'loyalty', 'promotion', 'announcement', 'support'].includes(notif.type);
    } else if (activeFilter !== 'all') {
      matchesFilter = notif.type === activeFilter;
    }

    // Apply search query
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      notif.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'shipment':
        return <Truck className="w-5 h-5 text-pink-700" />;
      case 'invoice':
        return <Receipt className="w-5 h-5 text-pink-700" />;
      case 'loyalty':
        return <Gift className="w-5 h-5 text-pink-700" />;
      case 'promotion':
        return <Sparkles className="w-5 h-5 text-pink-700" />;
      default:
        return <Bell className="w-5 h-5 text-pink-700" />;
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.read && notif.id) {
      markNotificationAsRead(notif.id);
    }
  };

  // Play micro alert sound for simulation
  const playSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-120.wav");
    audio.volume = 0.15;
    audio.play().catch(() => {});
  };

  return (
    <div className="space-y-5 pb-12 animate-fade-in" id="notifications-view" dir="rtl">
      
      {/* Real Full-Width Cover Banner */}
      <div className="relative w-full aspect-[16/7] rounded-3xl overflow-hidden shadow-sm group">
        <img
          alt="Notifications Banner"
          className="w-full h-full object-cover"
          src={customizations?.notificationsBannerUrl || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop"}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-5 flex flex-col justify-end text-right">
          <p className="text-pink-300 font-black text-[9px] uppercase tracking-widest mb-0.5">IRAMO NOTIFICATIONS</p>
          <h2 className="text-xs md:text-sm font-extrabold text-white leading-relaxed max-w-[280px]">
            {customizations?.notificationsWelcomeText || "مركز التنبيهات والتحديثات المباشرة لمعرفة خط سير شحناتكِ والخصومات أولاً بأول ✨"}
          </h2>
        </div>
      </div>

      {/* Slide-down alert toast has been disabled to keep screen empty of popup alerts as requested */}

      {/* Shipment Status Simulator */}
      {shipments.length > 0 && (
        <div className="bg-white/95 backdrop-blur-xl border border-pink-100 p-5 rounded-[2rem] shadow-xs space-y-3 text-right">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-pink-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-600" />
              تتبع وتحديث الشحنات اللحظي 📲
            </h3>
            <span className="text-[9px] font-black uppercase bg-pink-100 text-pink-800 px-2.5 py-0.5 rounded-full">تحديث فوري</span>
          </div>
          
          <p className="text-[10px] text-gray-500 leading-relaxed font-bold">
            قومي بتحديث حالة شحنتكِ لتفعيل تنبيه دفع (Push Notification) مباشر بنظام إيرامو الذكي!
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={async () => {
                triggerSuccessHaptic();
                const firstShipment = shipments[0];
                if (firstShipment && firstShipment.id) {
                  const newStatus = 'في الطريق';
                  await updateShipmentStatus(firstShipment.id, newStatus);
                  await addNotification({
                    notificationId: 'ship_ontheway_' + firstShipment.id,
                    type: 'shipment',
                    title: '🚚 شحنتكِ في الطريق!',
                    content: `الشحنة رقم ${firstShipment.trackingNumber} من ${firstShipment.origin} تحركت الآن وهي في الطريق إليكِ!`,
                    time: 'الآن',
                    icon: 'Truck',
                    read: false,
                    action: 'تتبع الشحنة'
                  });
                  playSound();
                  setAlertToast({
                    show: true,
                    title: 'تنبيه فوري: شحنتكِ في الطريق!',
                    message: `الشحنة رقم ${firstShipment.trackingNumber} متجهة إليكِ الآن.`
                  });
                  setTimeout(() => setAlertToast({ show: false, title: '', message: '' }), 6000);
                }
              }}
              className="bg-pink-50 hover:bg-pink-100 border border-pink-100 text-pink-900 py-2.5 rounded-2xl text-[10px] font-black transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-pink-700" />
              <span>شحنة 'في الطريق'</span>
            </button>

            <button
              onClick={async () => {
                triggerSuccessHaptic();
                const firstShipment = shipments[0];
                if (firstShipment && firstShipment.id) {
                  const newStatus = 'تم الاستلام';
                  await updateShipmentStatus(firstShipment.id, newStatus);
                  await addNotification({
                    notificationId: 'ship_delivered_' + firstShipment.id,
                    type: 'shipment',
                    title: '🎉 تم الاستلام بنجاح!',
                    content: `تم تسليم الشحنة رقم ${firstShipment.trackingNumber} بنجاح للزبون. شكراً لاختياركِ إيرامو!`,
                    time: 'الآن',
                    icon: 'CheckSquare',
                    read: false,
                    action: 'تتبع الشحنة'
                  });
                  playSound();
                  setAlertToast({
                    show: true,
                    title: 'تنبيه فوري: تم الاستلام!',
                    message: `تم تسليم شحنتكِ رقم ${firstShipment.trackingNumber} بنجاح.`
                  });
                  setTimeout(() => setAlertToast({ show: false, title: '', message: '' }), 6000);
                }
              }}
              className="bg-gradient-to-r from-pink-600 to-rose-500 text-white py-2.5 rounded-2xl text-[10px] font-black transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>شحنة 'تم الاستلام'</span>
            </button>
          </div>
        </div>
      )}

      {/* Elegant Native Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="البحث في العروض والإشعارات..."
          className="w-full bg-white border border-pink-100/50 rounded-2xl py-3 pl-4 pr-11 text-xs text-right focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 font-bold placeholder-gray-400"
        />
        <Search className="w-4.5 h-4.5 text-gray-400 absolute top-1/2 right-4 -translate-y-1/2" />
      </div>

      {/* Filter Bar & Mark All as Read */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-[11px] font-black text-gray-400">تصنيفات الإشعارات</span>
          <button
            onClick={() => {
              triggerSuccessHaptic();
              markAllNotificationsAsRead();
            }}
            className="text-[10px] font-black text-pink-800 bg-pink-50 hover:bg-pink-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            تحديد الكل كمقروء ✓
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'shipment', label: 'الشحنات 📦' },
            { id: 'invoice', label: 'الفواتير 🧾' },
            { id: 'offer', label: 'العروض 💖' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                triggerLightHaptic();
                setActiveFilter(tab.id as any);
              }}
              className={`px-4.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/15'
                  : 'bg-white border border-pink-50 text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Swipe Instructions Hint */}
      <div className="flex items-center gap-1.5 justify-center text-[10px] text-pink-900 bg-pink-100/30 py-2 rounded-xl border border-pink-100/40 font-bold">
        <span>👈 اسحبي البطاقة لليسار لتجربة اختصارات سريعة (سحب مقروء / حذف)</span>
      </div>

      {/* Notification List with Swipe Interactions */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.map((notif) => (
            <div key={notif.id} className="relative overflow-hidden rounded-[2rem] bg-pink-100/30">
              
              {/* Swipe Action Overlay Background for swipe to left */}
              <div className="absolute inset-y-0 right-0 left-0 bg-gradient-to-l from-rose-500 to-rose-600 flex items-center justify-end px-6 text-white font-black text-xs gap-2 select-none">
                <span>تجاهل الإشعار</span>
                <Trash2 className="w-5 h-5 text-white animate-pulse" />
              </div>

              {/* Swipable Card Body using Framer Motion Dragging */}
              <motion.div
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: -110, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(event, info) => {
                  // If swiped significantly to the left (e.g. past -80px)
                  if (info.offset.x < -70) {
                    // Trigger haptic for swipe action
                    triggerMediumHaptic();
                    // Fast action: mark read or simple toast
                    if (!notif.read && notif.id) {
                      markNotificationAsRead(notif.id);
                    }
                  }
                }}
                className={`bg-white p-4.5 rounded-[2rem] border transition-all relative z-10 cursor-grab active:cursor-grabbing flex gap-3 text-right ${
                  !notif.read ? 'border-pink-200 shadow-sm' : 'border-pink-50/50'
                }`}
                onClick={() => {
                  triggerLightHaptic();
                  handleNotificationClick(notif);
                }}
              >
                {/* Unread dot */}
                {!notif.read && (
                  <span className="absolute top-4.5 left-4.5 w-2 h-2 bg-pink-600 rounded-full animate-pulse"></span>
                )}

                {notif.image ? (
                  <div className="w-13 h-13 rounded-2xl overflow-hidden border border-pink-100 shadow-sm shrink-0">
                    <img
                      src={notif.image}
                      alt={notif.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-13 h-13 rounded-2xl bg-pink-50/80 border border-pink-100/30 flex items-center justify-center shrink-0 shadow-sm">
                    {getIcon(notif.type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="text-[11px] font-black text-pink-950 truncate max-w-[150px]">
                      {notif.title}
                    </h4>
                    <span className="text-[9px] text-gray-400 font-bold shrink-0">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-relaxed font-bold">
                    {notif.content}
                  </p>
                  
                  {/* Action row */}
                  <div className="flex gap-1.5 mt-2.5 justify-end">
                    {notif.action && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerMediumHaptic();
                          if (notif.type === 'shipment') setActiveTab('tracking');
                          else if (notif.type === 'invoice') setActiveTab('invoices');
                          else setActiveTab('profile');
                        }}
                        className="px-4 py-1.5 rounded-full border border-pink-100 hover:bg-pink-50 text-pink-800 text-[9px] font-extrabold transition-all bg-white"
                      >
                        {notif.action} ✨
                      </button>
                    )}
                    {!notif.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerSuccessHaptic();
                          markNotificationAsRead(notif.id);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-800 text-[9px] font-black transition-all flex items-center gap-1"
                      >
                        <CheckSquare className="w-3 h-3" />
                        <span>قراءة</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </AnimatePresence>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-16 bg-white/50 rounded-[2rem] border border-pink-100/40 text-gray-400 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-3xl text-pink-200">notifications_off</span>
            <p className="text-[11px] font-black text-gray-500">لا توجد تنبيهات تطابق بحثكِ.</p>
          </div>
        )}
      </div>
    </div>
  );
}
