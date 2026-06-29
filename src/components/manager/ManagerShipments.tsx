import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  AlertTriangle, 
  Plane, 
  MapPin, 
  X, 
  CheckCircle, 
  Info, 
  Compass, 
  ArrowLeft,
  Navigation,
  FileText
} from 'lucide-react';

export default function ManagerShipments() {
  const { shipments, setSelectedShipmentId, deleteShipment, updateShipmentStatus, addShipment } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTracking, setNewTracking] = useState<string>('');
  const [newService, setNewService] = useState<string>('شحن جوي سريع');
  const [newWeight, setNewWeight] = useState<string>('1.5 كجم');
  const [newItems, setNewItems] = useState<string>('1 طرد');
  const [newOrigin, setNewOrigin] = useState<string>('Guangzhou, China');
  const [newDest, setNewDest] = useState<string>('بغداد، العراق');
  const [newEstimated, setNewEstimated] = useState<string>('24 أكتوبر 2023');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Status Change State
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [showStatusConfirm, setShowStatusConfirm] = useState<boolean>(false);

  // Delete Confirmation State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Colored status styles helper
  const getStatusStyles = (status: string) => {
    const s = (status || '').toLowerCase();
    
    // Completed / Delivered (Green)
    if (s.includes('تسليم') || s.includes('استلام') || s.includes('تم التسليم') || s.includes('وصلت للزبون') || s.includes('مكتمل') || s.includes('paid')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800',
        border: 'border-emerald-200/80',
        dot: 'bg-emerald-500',
        label: 'مكتمل ✓'
      };
    }
    
    // In delivery / courier / transit (Yellow/Amber)
    if (s.includes('طريق') || s.includes('مندوب') || s.includes('توصيل') || s.includes('شحن')) {
      return {
        bg: 'bg-amber-50 text-amber-800',
        border: 'border-amber-200/80',
        dot: 'bg-amber-500 animate-pulse',
        label: 'قيد التوصيل 🚚'
      };
    }
    
    // Customs / Airport (Blue)
    if (s.includes('مطار') || s.includes('جمارك') || s.includes('بغداد') || s.includes('ترانزيت')) {
      return {
        bg: 'bg-sky-50 text-sky-800',
        border: 'border-sky-200/80',
        dot: 'bg-sky-500',
        label: 'في مطار بغداد ✈️'
      };
    }
    
    // Received / Origin / Processing (Pink / Rose)
    return {
      bg: 'bg-pink-50 text-pink-800',
      border: 'border-pink-100/80',
      dot: 'bg-pink-500',
      label: 'قيد المعالجة 📦'
    };
  };

  // Handle adding shipment
  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTracking) return;

    setIsAdding(true);
    // Directly add the shipment to the system list
    const generatedId = `shipment_${Date.now()}`;
    const newShipObj: Shipment = {
      id: generatedId,
      userId: 'local_user', // Associated with main user for immediate display
      trackingNumber: newTracking,
      status: 'تم تأكيد استلام الطرد في غوانزو',
      estimatedDelivery: newEstimated,
      expectedArrivalDate: newEstimated,
      weight: newWeight,
      items: newItems,
      service: newService,
      origin: newOrigin,
      currentLocation: 'مستودعات غوانزو، الصين',
      journey: [
        {
          title: 'تم استلام وتأكيد الطرد',
          description: 'تم فرز الطرود وتجهيزها في مستودعات غوانزو لشحنها إلى العراق.',
          time: 'الآن',
          location: newOrigin,
          icon: 'Box',
          active: true
        }
      ]
    };

    await addShipment(newShipObj);
    
    // Reset modal and inputs
    setShowAddModal(false);
    setNewTracking('');
    setIsAdding(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId) {
      await deleteShipment(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment || !newStatus || !editingShipment.id) return;
    setShowStatusConfirm(true);
  };

  const handleConfirmUpdateStatus = async () => {
    if (!editingShipment || !newStatus || !editingShipment.id) return;
    await updateShipmentStatus(editingShipment.id, newStatus);
    setEditingShipment(null);
    setShowStatusConfirm(false);
  };

  // Filter shipments
  const filteredShipments = shipments.filter(ship => {
    const matchesSearch = ship.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ship.status.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'air') return matchesSearch && (ship.service || '').includes('جوي');
    if (selectedFilter === 'sea') return matchesSearch && (ship.service || '').includes('بحري');
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="manager-shipments">
      
      {/* Upper bar with filters */}
      <div className="bg-white/95 backdrop-blur-xl border border-pink-100 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex justify-between items-center" dir="rtl">
          <h3 className="font-black text-sm text-gray-800">تصفح وإدارة الشحنات الجارية</h3>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 bg-gradient-to-r from-pink-700 to-rose-600 text-white px-3.5 py-2 rounded-2xl text-[10px] font-black hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة شحنة</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input 
            type="text"
            placeholder="البحث برقم التتبع أو الحالة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-3 pr-10 rounded-2xl text-right text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-300 transition-all font-bold"
            dir="rtl"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filters bar */}
        <div className="flex gap-2 justify-end" dir="rtl">
          <button 
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
              selectedFilter === 'all' 
                ? 'bg-pink-700 text-white shadow-sm' 
                : 'bg-gray-50 text-gray-400 hover:text-gray-600'
            }`}
          >
            الكل ({shipments.length})
          </button>
          <button 
            onClick={() => setSelectedFilter('air')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
              selectedFilter === 'air' 
                ? 'bg-pink-700 text-white shadow-sm' 
                : 'bg-gray-50 text-gray-400 hover:text-gray-600'
            }`}
          >
            شحن جوي ({shipments.filter(s => (s.service || '').includes('جوي')).length})
          </button>
          <button 
            onClick={() => setSelectedFilter('sea')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
              selectedFilter === 'sea' 
                ? 'bg-pink-700 text-white shadow-sm' 
                : 'bg-gray-50 text-gray-400 hover:text-gray-600'
            }`}
          >
            شحن بحري ({shipments.filter(s => (s.service || '').includes('بحري')).length})
          </button>
        </div>
      </div>

      {/* Shipment Cards list */}
      <div className="space-y-4">
        {filteredShipments.map((ship) => (
          <div 
            key={ship.id}
            className="bg-white border border-pink-100 p-5 rounded-3xl shadow-sm space-y-4 hover:border-pink-300 transition-all text-right relative overflow-hidden"
            dir="rtl"
          >
            <div className="absolute top-0 right-8 w-16 h-1 rounded-b-full bg-pink-500/30"></div>
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] bg-pink-50 text-pink-800 border border-pink-100/30 px-2 py-0.5 rounded font-black">
                  {ship.service}
                </span>
                <h4 className="font-mono font-black text-gray-800 text-sm mt-1.5">{ship.trackingNumber}</h4>
              </div>

              {/* Status display */}
              {(() => {
                const styles = getStatusStyles(ship.status);
                return (
                  <span className={`text-[10px] ${styles.bg} ${styles.border} border px-2.5 py-1 rounded-full font-black flex items-center gap-1.5 shadow-sm`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                    <span>{ship.status}</span>
                  </span>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-gray-50">
              <div>
                <span className="text-[9px] text-gray-400 block font-bold">الوزن الحالي:</span>
                <span className="text-gray-800 font-extrabold">{ship.weight || 'غير محدد'}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 block font-bold">الموقع الحالي:</span>
                <span className="text-gray-800 font-extrabold">{ship.currentLocation || 'قيد النقل'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex gap-2">
              <button 
                onClick={() => {
                  setEditingShipment(ship);
                  setNewStatus(ship.status);
                }}
                className="flex-1 bg-pink-50/50 hover:bg-pink-100/50 text-pink-800 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>تحديث الحالة</span>
              </button>

              <button 
                onClick={() => setDeleteTargetId(ship.id || null)}
                className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredShipments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-pink-50">
            <p className="text-xs text-gray-400 font-bold">لا توجد شحنات تطابق خيارات التصفية.</p>
          </div>
        )}
      </div>

      {/* Add Shipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 text-right border border-pink-100" dir="rtl">
            <div className="flex justify-between items-center pb-3 border-b border-pink-50">
              <h3 className="font-black text-gray-800 text-sm">إضافة شحنة صينية جديدة</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">رقم التتبع (Tracking Number)</label>
                <input 
                  type="text"
                  required
                  placeholder="مثال: IR-GZ-9901-XQ"
                  value={newTracking}
                  onChange={(e) => setNewTracking(e.target.value.toUpperCase())}
                  className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-mono text-left focus:outline-none focus:ring-1 focus:ring-pink-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">الوزن (Weight)</label>
                  <input 
                    type="text"
                    required
                    placeholder="مثال: 4.5 كجم"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-pink-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">نوع الشحن (Cargo Type)</label>
                  <select 
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-pink-300"
                  >
                    <option value="شحن جوي سريع">شحن جوي سريع</option>
                    <option value="شحن بحري اقتصادي">شحن بحري اقتصادي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">المصدر (Origin)</label>
                  <input 
                    type="text"
                    placeholder="Guangzhou, China"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-pink-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">تاريخ الوصول المتوقع</label>
                  <input 
                    type="text"
                    placeholder="24 أكتوبر 2023"
                    value={newEstimated}
                    onChange={(e) => setNewEstimated(e.target.value)}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-pink-300"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isAdding}
                className="w-full bg-gradient-to-r from-pink-700 to-rose-600 text-white font-black text-xs py-3 rounded-2xl active:scale-95 transition-all cursor-pointer shadow-md"
              >
                {isAdding ? 'جاري الحفظ والإنشاء...' : 'حفظ وإنشاء الشحنة 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 text-right border border-pink-100" dir="rtl">
            <div className="flex justify-between items-center pb-3 border-b border-pink-50">
              <h3 className="font-black text-gray-800 text-sm">تحديث حالة الشحنة</h3>
              <button 
                onClick={() => setEditingShipment(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                شحنة رقم <span className="font-mono font-black text-pink-700">{editingShipment.trackingNumber}</span>. اختر الحالة الجديدة ليرى العميل تحديث مسار طروده في منزله.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">الحالة الجارية</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-pink-300"
                >
                  <option value="تم تأكيد استلام الطرد في غوانزو">تم تأكيد استلام الطرد في غوانزو</option>
                  <option value="غادرت مستودعات غوانزو">غادرت مستودعات غوانزو ✈️</option>
                  <option value="وصلت مطار بغداد الدولي">وصلت مطار بغداد الدولي 🇮🇶</option>
                  <option value="التخليص الجمركي جاري حالياً">التخليص الجمركي جاري حالياً</option>
                  <option value="جاهزة للتسليم المحلي">جاهزة للتسليم المحلي 📦</option>
                  <option value="تم تسليم الشحنة للزبون بنجاح">تم تسليم الشحنة للزبون بنجاح ✅</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-pink-700 hover:bg-pink-850 text-white font-black text-xs py-3 rounded-2xl active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                حفظ التحديث ونشره للعميل 📢
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Confirmation Modal */}
      {showStatusConfirm && editingShipment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl text-center space-y-4 border border-pink-100" dir="rtl">
            <div className="w-14 h-14 bg-pink-50 text-pink-700 rounded-full flex items-center justify-center mx-auto border border-pink-100/50">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-gray-800 text-sm">تأكيد نشر تحديث الحالة الجارية؟</h4>
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed font-bold">
                أنتِ على وشك تغيير حالة الشحنة رقم <span className="font-mono text-pink-700 font-black">{editingShipment.trackingNumber}</span> إلى:
              </p>
              <div className="mt-2.5 px-4 py-2 bg-pink-50/50 rounded-2xl border border-pink-100/50 text-xs font-black text-pink-800 inline-block">
                {newStatus}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 leading-relaxed font-bold">
                سيظهر هذا التحديث فوراً في لوحة التحكم وتنبيهات خط السير الخاصة بالزبونة.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={handleConfirmUpdateStatus}
                className="flex-1 bg-gradient-to-r from-pink-700 to-rose-600 text-white text-[11px] font-black py-3 rounded-2xl active:scale-95 transition-all cursor-pointer shadow-md shadow-pink-500/10"
              >
                تأكيد ونشر التحديث 📢
              </button>
              <button 
                onClick={() => setShowStatusConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-500 text-[11px] font-black py-3 rounded-2xl active:scale-95 transition-all cursor-pointer"
              >
                تراجع وتعديل ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl text-center space-y-4 border border-red-50" dir="rtl">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-gray-800 text-sm">هل أنتِ متأكدة؟</h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed font-bold">
                حذف هذه الشحنة نهائي ولا يمكن استرجاعه مجدداً.
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 text-white text-xs font-black py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                نعم، احذف
              </button>
              <button 
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 bg-gray-100 text-gray-500 text-xs font-black py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
