import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Truck, Receipt, Gift, Sparkles, CheckSquare, Compass, ArrowRight, ArrowLeft } from 'lucide-react';

export default function NotificationsView() {
  const { notifications, markAllNotificationsAsRead, setActiveTab, shipments, updateShipmentStatus, addNotification } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | 'shipment' | 'invoice' | 'offer'>('all');
  const [alertToast, setAlertToast] = useState({ show: false, title: '', message: '' });

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'all') return true;
    return notif.type === activeFilter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'shipment':
        return <Truck className="w-6 h-6 text-pink-700" />;
      case 'invoice':
        return <Receipt className="w-6 h-6 text-pink-700" />;
      case 'offer':
        return <Gift className="w-6 h-6 text-pink-700" />;
      default:
        return <Bell className="w-6 h-6 text-pink-700" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="notifications-view">
      {/* Pixar Mascot Greeting */}
      <div className="bg-white/95 border border-pink-100 p-4 rounded-3xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-100/20 rounded-full blur-2xl"></div>
        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-pink-50 float-animation">
          <img
            alt="Batoot"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida/AP1WRLtwlTtxpvh7CFWTWdRY_emR2xyBvTgx8v6zMnJSM8OrvnGrHK98fOcbdnwqMhudLD35tXhQRA9VBIsbRPIQxBCWcjiseBr_ZThUYOO2bASORtpBXsEwGUlke9kqXDQGVw-0hzUjOQZGvkAbigP02pHzK4tU63vK7UVYFj3MEl6UjVilDvrlHzDZhs-o55NTjiE4kAtBK7MfYbaxsU0axIHNlMxqsY-z3Mq4P6X0iHTAI-TEqMLAdFD53L8"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 space-y-0.5">
          <h2 className="font-extrabold text-base text-pink-700">بطوط يرحب بكِ!</h2>
          <p className="text-xs font-semibold text-gray-500 italic">"Stay Fabulous with IRAMO"</p>
        </div>
        <div className="mr-auto text-pink-200">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* Toast Push Notification Simulation Alert */}
      {alertToast.show && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-pink-900 border border-pink-700/50 text-white rounded-3xl p-5 shadow-2xl z-[99999] animate-slide-up flex items-start gap-4 text-right" dir="rtl">
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 text-pink-300">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-black text-xs text-pink-100">{alertToast.title}</h4>
            <p className="text-[11px] text-white/90 leading-relaxed font-bold">{alertToast.message}</p>
          </div>
        </div>
      )}

      {/* Shipment Status Simulator & Real-time Update Trigger */}
      {shipments.length > 0 && (
        <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-100 p-5 rounded-3xl shadow-sm space-y-3 text-right" dir="rtl">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-pink-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-600 animate-spin" />
              محاكي التحديثات اللحظية للشحنات
            </h3>
            <span className="text-[9px] font-black uppercase bg-pink-200 text-pink-800 px-2.5 py-0.5 rounded-lg">تحديث لحظي</span>
          </div>
          
          <p className="text-[10px] text-pink-800/80 leading-relaxed font-bold">
            غيري حالة الشحنة النشطة لمحاكاة وصول تنبيه دفع (Push Notification) فوري وتحديث حالة التتبع في نفس اللحظة!
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={async () => {
                const firstShipment = shipments[0];
                if (firstShipment && firstShipment.id) {
                  const newStatus = 'في الطريق';
                  await updateShipmentStatus(firstShipment.id, newStatus);
                  await addNotification({
                    type: 'shipment',
                    title: '🚚 شحنتكِ في الطريق!',
                    content: `الشحنة رقم ${firstShipment.trackingNumber} من ${firstShipment.origin} تحركت الآن وهي في الطريق إليكِ!`,
                    time: 'الآن',
                    icon: 'Truck',
                    read: false,
                    action: 'تتبع الشحنة'
                  });
                  setAlertToast({
                    show: true,
                    title: 'تنبيه فوري: شحنتكِ في الطريق!',
                    message: `الشحنة رقم ${firstShipment.trackingNumber} متجهة إليكِ الآن.`
                  });
                  setTimeout(() => setAlertToast({ show: false, title: '', message: '' }), 5000);
                }
              }}
              className="bg-white hover:bg-pink-700 hover:text-white border-2 border-pink-200 text-pink-700 py-2.5 rounded-2xl text-[10px] font-black transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              🚚 محاكاة: 'في الطريق'
            </button>

            <button
              onClick={async () => {
                const firstShipment = shipments[0];
                if (firstShipment && firstShipment.id) {
                  const newStatus = 'تم الاستلام';
                  await updateShipmentStatus(firstShipment.id, newStatus);
                  await addNotification({
                    type: 'shipment',
                    title: '🎉 تم الاستلام بنجاح!',
                    content: `تم تسليم الشحنة رقم ${firstShipment.trackingNumber} بنجاح للزبون. شكراً لاختياركِ إيرامو!`,
                    time: 'الآن',
                    icon: 'CheckSquare',
                    read: false,
                    action: 'تتبع الشحنة'
                  });
                  setAlertToast({
                    show: true,
                    title: 'تنبيه فوري: تم الاستلام!',
                    message: `تم تسليم شحنتكِ رقم ${firstShipment.trackingNumber} بنجاح.`
                  });
                  setTimeout(() => setAlertToast({ show: false, title: '', message: '' }), 5000);
                }
              }}
              className="bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 text-white py-2.5 rounded-2xl text-[10px] font-black transition-all shadow shadow-pink-500/10 active:scale-95 cursor-pointer"
            >
              🎉 محاكاة: 'تم الاستلام'
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar & Mark All as Read */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-gray-400">تصفية التنبيهات</span>
          <button
            onClick={markAllNotificationsAsRead}
            className="text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 px-3.5 py-1.5 rounded-xl transition-all"
          >
            تحديد الكل كمقروء
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'shipment', label: 'الشحنات' },
            { id: 'invoice', label: 'الفواتير' },
            { id: 'offer', label: 'العروض' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-pink-700 to-pink-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-white border border-pink-50 text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`bg-white/95 p-5 rounded-[2rem] border transition-all hover:border-pink-200 shadow-sm relative overflow-hidden ${
              !notif.read ? 'border-pink-300 ring-2 ring-pink-50/20' : 'border-pink-50/50'
            }`}
          >
            {/* Unread indicator dot */}
            {!notif.read && (
              <span className="absolute top-5 left-5 w-2.5 h-2.5 bg-pink-700 rounded-full"></span>
            )}

            <div className="flex gap-4">
              {notif.image ? (
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-pink-100 shadow-sm flex-shrink-0">
                  <img
                    src={notif.image}
                    alt={notif.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-pink-50/80 border border-pink-100/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                  {getIcon(notif.type)}
                </div>
              )}

              <div className="flex-1 min-w-0 text-right">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-extrabold text-pink-700 tracking-wider">
                    {notif.title}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                  {notif.content}
                </p>
                {notif.action && (
                  <button
                    onClick={() => {
                      if (notif.type === 'shipment') setActiveTab('tracking');
                      if (notif.type === 'invoice') setActiveTab('invoices');
                      if (notif.type === 'offer') setActiveTab('profile');
                    }}
                    className="mt-3 px-5 py-2 rounded-full border border-pink-200 text-pink-700 text-[10px] font-bold hover:bg-pink-700 hover:text-white transition-all bg-white/50"
                  >
                    {notif.action}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <span className="material-symbols-outlined text-4xl">notifications_off</span>
            <p className="text-xs">لا توجد تنبيهات جديدة في هذا القسم.</p>
          </div>
        )}
      </div>
    </div>
  );
}
