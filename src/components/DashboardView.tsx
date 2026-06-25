import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Package, Receipt, ShoppingBag, ArrowLeft, ArrowRight, AppWindow, ShoppingCart, Globe, Sparkles, ChevronRight } from 'lucide-react';

export default function DashboardView() {
  const { profile, shipments, invoices, setActiveTab, setSelectedShipmentId, customizations } = useApp();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  // Take the first shipment as the featured active shipment
  const activeShipment = shipments.length > 0 ? shipments[0] : null;

  // Take the 2 most recent invoices
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  const handleTrackingClick = () => {
    if (activeShipment) {
      setSelectedShipmentId(activeShipment.id || null);
    }
    setActiveTab('tracking');
  };

  const activeStores = customizations.supportedStores || [];
  const selectedStoreDetails = activeStores.find(st => st.name === selectedStore);

  // Format title
  const formattedTitle = customizations.heroTitle
    ? customizations.heroTitle.replace('{name}', profile?.name || '')
    : `مرحباً، ${profile?.name || ''}!`;

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="dashboard-view" dir="rtl">
      
      {/* Announcement Bar */}
      {customizations.showAnnouncement && customizations.announcementText && (
        <div className="bg-pink-100/50 border border-pink-200/40 text-pink-800 text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-black shadow-sm text-center">
          <Sparkles className="w-4 h-4 animate-spin text-pink-600 shrink-0" />
          <span>{customizations.announcementText}</span>
        </div>
      )}

      {/* Hero Banner Section */}
      {customizations.showBanners && (
        <section className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden shadow-md">
          <img
            alt="Hadoosha & Batoot"
            className="w-full h-full object-cover"
            src={customizations.heroImageUrl || "https://lh3.googleusercontent.com/aida/AP1WRLs7M6Yg7Yd4TtEvkYvHWuFLa4sqCmyFU4xbTd0gc1JWOUaOtMJrX2oCBWsecPrXKVQ4rWPRAE81BJUclFQ9hcjIwd1DcZSBM5h_gHUg3ugB-AKJSuGQ4-unn6Z8e7LoQ9DP8Vx87nAaBbqttEzIDfrWQSEMvv7M7CQ0dhPEf4vVt9RSg5yzRe8_V_PQICnoHUGYEMdGL0xYFPlWfwArGud6nFBBWis1UivPxaljrjLjHSXxT3xWcLE1dcs"}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-end">
            <p className="text-pink-300 font-semibold text-xs mb-1">
              {customizations.heroSubtitle || "أهلاً بكِ في عالم حدوشة وبطوط"}
            </p>
            <h2 className="text-2xl font-extrabold text-white">
              {formattedTitle}
            </h2>
          </div>
        </section>
      )}

      {/* Loyalty Card */}
      {customizations.showLoyalty && (
        <div className="bg-white/95 backdrop-blur-xl border border-pink-100 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-400 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base">{profile?.membership || 'عضوية ذهبية'}</h3>
              <p className="text-xs text-gray-500">نقاط الولاء المتاحة</p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-2xl font-extrabold text-pink-700">{profile?.points?.toLocaleString() || 0}</p>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Points</p>
          </div>
        </div>
      )}

      {/* Active Shipment / Quick Action */}
      <div className="bg-white/95 backdrop-blur-xl border border-pink-100 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800 mb-2">
              {activeShipment ? activeShipment.status : 'لا يوجد شحنات نشطة'}
            </span>
            <h3 className="text-lg font-bold text-gray-800">
              {activeShipment ? `شحنة #${activeShipment.trackingNumber}` : 'ابدئي تتبع طردك الآن'}
            </h3>
          </div>
          {activeShipment && (
            <button
              onClick={handleTrackingClick}
              className="text-pink-700 text-sm font-bold flex items-center gap-1 hover:underline"
            >
              <span>تتبع</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {activeShipment ? (
          <>
            <div className="relative pt-1 mb-4">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-bold inline-block py-1 px-2 uppercase rounded-full text-pink-700 bg-pink-100">
                    في الطريق
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold inline-block text-pink-700">75%</span>
                </div>
              </div>
              <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-gray-100">
                <div
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-1000"
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {activeShipment.currentLocation} • المتوقع في {activeShipment.estimatedDelivery}
            </p>
          </>
        ) : (
          <p className="text-xs text-gray-500 leading-relaxed">
            جميع شحناتك قد وصلت بنجاح! عند طلب منتجات جديدة، سيتم تسجيل طرودك هنا تلقائياً لتتبعها خطوة بخطوة.
          </p>
        )}
      </div>

      {/* Supported Stores */}
      {customizations.showStores && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">الأقسام والمتاجر المدعومة</h3>
            <span className="text-xs text-pink-600 font-semibold flex items-center gap-1">
              مضمونة 100% <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {activeStores.map((store) => (
              <button
                key={store.id}
                onClick={() => setSelectedStore(selectedStore === store.name ? null : store.name)}
                className={`bg-white/95 backdrop-blur-xl aspect-square rounded-3xl flex flex-col items-center justify-center p-3 text-center border transition-all active:scale-95 cursor-pointer ${
                  selectedStore === store.name ? 'border-pink-500 ring-2 ring-pink-100' : 'border-pink-50/50'
                }`}
              >
                {store.image ? (
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-10 h-10 object-cover rounded-xl mb-1 border border-pink-50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Package className="w-7 h-7 text-pink-700/80 mb-1" />
                )}
                <span className="text-[10px] font-black tracking-tight text-gray-800 truncate w-full">
                  {store.name}
                </span>
                <span className="text-[8px] text-pink-700 font-bold mt-1 bg-pink-50 px-1.5 py-0.5 rounded-full">
                  التفاصيل
                </span>
              </button>
            ))}

            {activeStores.length === 0 && (
              <p className="col-span-3 text-center py-6 text-xs text-gray-400 bg-white/50 rounded-2xl border border-pink-50">
                لا يوجد أقسام مسجلة حالياً.
              </p>
            )}
          </div>

          {/* Dynamic Store Details Popup/Card */}
          {selectedStore && selectedStoreDetails && (
            <div className="mt-4 p-5 bg-pink-50/60 border border-pink-100/50 rounded-2xl animate-fade-in text-right">
              <h4 className="font-bold text-sm text-pink-800 mb-1">{selectedStoreDetails.name}</h4>
              <div className="text-xs space-y-2 text-gray-600">
                <p>💵 <strong className="text-gray-700">سعر الشحن:</strong> {selectedStoreDetails.rate}</p>
                <p>⏱️ <strong className="text-gray-700">المدة المتوقعة:</strong> {selectedStoreDetails.duration}</p>
                <p className="pt-1 border-t border-pink-100/40 text-gray-500 leading-relaxed">
                  {selectedStoreDetails.details}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Recent Invoices */}
      <section className="pb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">الفواتير الأخيرة</h3>
          <button
            onClick={() => setActiveTab('invoices')}
            className="text-pink-700 text-sm font-bold flex items-center gap-0.5 hover:underline"
          >
            <span>عرض الكل</span>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
        <div className="space-y-3">
          {recentInvoices.map((inv) => (
            <div
              key={inv.id || inv.invoiceId}
              className="bg-white/95 backdrop-blur-xl p-4 flex items-center justify-between border border-pink-50/50 rounded-2xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-700">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">طلب {inv.store} #{inv.invoiceId}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{inv.date}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold text-pink-700">{inv.amount}</p>
                <p
                  className={`text-[9px] font-extrabold uppercase ${
                    inv.status === 'Paid' ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  {inv.status === 'Paid' ? 'تم الدفع' : 'قيد الانتظار'}
                </p>
              </div>
            </div>
          ))}

          {recentInvoices.length === 0 && (
            <p className="text-center py-6 text-xs text-gray-400">لا يوجد فواتير مسجلة حالياً.</p>
          )}
        </div>
      </section>

      {/* Brand Touch: Dynamic Footer Mascot Signature */}
      <section className="bg-white border border-pink-100/50 rounded-3xl p-6 relative overflow-hidden shadow-sm mt-2">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 flex-shrink-0 bg-pink-50 rounded-3xl overflow-hidden p-2">
            <img
              alt="Hadoosha & Batoot"
              className="w-full h-full object-contain"
              src={customizations.homeFooterMascotUrl || "https://lh3.googleusercontent.com/aida/AP1WRLs7xYMw1dlJILjhZ2VzHUgTES3bYmOtS532eeDn9JpDom3Gp-MaPoVhT_e495zabXi9PhvxGhgg_DGSwGWwf9dmXp5ZUWaJm0RCNd8GbCsm6Pfsr0iJJMO0aAxy5MOcRhILsJttChJdkmTm_mZbX5E5mSnfAvK48H_feUdzK0meAC_w_y8FpVIQyOMw7BefhhUleQ-yNPc9mOamo6Uhxfvs0PQtY8Tp68F3pQbyGpw3MPMMO_Rkhd2fSw"}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 space-y-1 text-right">
            <p className="text-pink-700 italic leading-relaxed text-xs font-semibold">
              {(customizations.homeFooterMascotQuote || "عزيزتي {name}، جمالك يبدأ من اهتمامك بنفسك. نحن هنا دائماً لنوفر لكِ الأفضل في شحن وتسوق متميز!").replace("{name}", profile?.name || 'الأنيقة')}
            </p>
            <p className="font-bold text-pink-800 text-xs">— {customizations.homeFooterMascotAuthor || 'هدوشة وبطوط'}</p>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-pink-100/20 rounded-full blur-2xl"></div>
      </section>
    </div>
  );
}
